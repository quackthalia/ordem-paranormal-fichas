import type { Atributos, PericiasMap, Poder } from '../types';

export interface ContextoPreRequisitos {
  atributos: Atributos;
  nex: number;
  pericias: PericiasMap;
  nomesPericias: Record<number, string>;
  poderes: string[];
}

export interface ResultadoValidacao {
  atende: boolean;
  motivo?: string;
}

export function verificarPreRequisitos(
  poder: Poder,
  contexto: ContextoPreRequisitos
): ResultadoValidacao {
  const codigo = poder.Pre_Codigo;
  const texto = poder.PreRequisitos || '';

  // Se não houver código, ou se for código não implementado ainda, libera por padrão
  if (!codigo || codigo > 5) {
    return { atende: true };
  }

  const { atributos, nex, pericias, nomesPericias } = contexto;
  const textoLower = texto.toLowerCase();

  // Helper para validar atributo (ex: "Agi 2", "For 2")
  const verificarAtributo = (textoReq: string): { atende: boolean; motivo?: string } => {
    const match = textoReq.match(/(for|agi|int|pre|vig)\s*(\d+)/i);
    if (!match) return { atende: true }; // se não bater com a regex, ignora e deixa passar para não quebrar (pode estar mal formatado no BD)
    
    const attrName = match[1].toUpperCase() as keyof Atributos;
    const attrMin = parseInt(match[2], 10);
    
    if (atributos[attrName] < attrMin) {
      return { atende: false, motivo: `${attrName} ${attrMin}` };
    }
    return { atende: true };
  };

  // Helper para validar perícia pelo código
  const verificarPericia = (codigos: number[]): { atende: boolean; motivo?: string } => {
    const faltantes: string[] = [];
    
    for (const cod of codigos) {
      const nomePericia = nomesPericias[cod];
      if (!nomePericia) {
        faltantes.push(`Perícia #${cod}`);
        continue;
      }
      
      const dados = pericias[nomePericia];
      // Para ser "treinado", o grau de treino precisa ser >= 5
      if (!dados || dados.treino < 5) {
        faltantes.push(nomePericia);
      }
    }

    if (faltantes.length > 0) {
      return { atende: false, motivo: `Treinado em ${faltantes.join(' e ')}` };
    }
    return { atende: true };
  };

  // Helper para pegar códigos de perícia de uma string ("treinado em 16" ou "treinado em 19 e 26")
  const extrairCodigosPericias = (textoReq: string): number[] => {
    const regex = /treinado em\s*([\s\S]*)/i;
    const match = textoReq.match(regex);
    if (!match) return [];
    
    // extrai todos os números da string (ex: "19 e 26" -> [19, 26])
    const numerosStr = match[1].match(/\d+/g);
    if (!numerosStr) return [];
    
    return numerosStr.map(n => parseInt(n, 10));
  };

  switch (codigo) {
    case 1: {
      // Exige um atributo específico em um valor X (Ex: Agi 2)
      const res = verificarAtributo(textoLower);
      if (!res.atende) return res;
      return { atende: true };
    }

    case 2: {
      // Exige um atributo em valor X + Ser treinado em 1 perícia (Ex: For 2, treinado em 16)
      const resAttr = verificarAtributo(textoLower);
      if (!resAttr.atende) return resAttr;
      
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const resPericia = verificarPericia([codigos[0]]);
        if (!resPericia.atende) return resPericia;
      }
      return { atende: true };
    }

    case 3:
    case 4: {
      // Exige NEX mínimo (Ex: NEX 30% ou NEX 60%)
      const nexMatch = textoLower.match(/nex\s*(\d+)%/i);
      if (nexMatch) {
        const nexExigido = parseInt(nexMatch[1], 10);
        if (nex < nexExigido) {
          return { atende: false, motivo: `NEX ${nexExigido}%` };
        }
      }
      return { atende: true };
    }

    case 5: {
      // Exige um atributo em valor X + Ser treinado em 2 perícias (Ex: Int 2, treinado em 19 e 26)
      const resAttr = verificarAtributo(textoLower);
      if (!resAttr.atende) return resAttr;
      
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length >= 2) {
        const resPericia = verificarPericia([codigos[0], codigos[1]]);
        if (!resPericia.atende) return resPericia;
      }
      return { atende: true };
    }

    case 6:
    case 9: {
      // Exige ter outro poder específico (Ex: "Ataque Especial" ou "Proteção Pesada")
      // Removemos ponto final no final da string se houver
      const poderRequerido = textoLower.replace(/\.$/, '').trim();
      const temPoder = contexto.poderes.some(p => p === poderRequerido);
      if (!temPoder) {
        return { atende: false, motivo: texto };
      }
      return { atende: true };
    }

    case 7: {
      // Exige ser treinado em uma perícia OU outra (Ex: "Treinado em 16 ou 21")
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const atendeAlgum = codigos.some(cod => verificarPericia([cod]).atende);
        if (!atendeAlgum) {
          const nomes = codigos.map(c => contexto.nomesPericias[c] || c).join(' ou ');
          return { atende: false, motivo: `Treinado em ${nomes}` };
        }
      }
      return { atende: true };
    }

    case 8: {
      // Exige ser treinado em 1 perícia (Ex: "Treinado em 4")
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const res = verificarPericia([codigos[0]]);
        if (!res.atende) return res;
      }
      return { atende: true };
    }

    case 10: {
      // Exige um atributo OU outro (Ex: "For 3 ou Vig 3")
      const regexStr = /(for|agi|int|pre|vig)\s*(\d+)/gi;
      const matches = [...texto.matchAll(regexStr)];
      
      if (matches.length > 0) {
        const atendeAlgum = matches.some(match => {
          const attrName = match[1].toUpperCase() as keyof Atributos;
          const attrMin = parseInt(match[2], 10);
          return contexto.atributos[attrName] >= attrMin;
        });
        
        if (!atendeAlgum) {
          return { atende: false, motivo: texto };
        }
      }
      return { atende: true };
    }

    default:
      return { atende: true };
  }
}

export function formatarTextoPreRequisitos(texto: string, nomesPericias: Record<number, string>): string {
  if (!texto) return '';
  
  let resultado = texto;
  
  // Procura o trecho de "treinado em " e traduz apenas os números dentro dele
  const match = texto.match(/treinado em\s*([\s\S]*)/i);
  if (match) {
    let treinadoTexto = match[1];
    treinadoTexto = treinadoTexto.replace(/\d+/g, (numStr) => {
      const cod = parseInt(numStr, 10);
      return nomesPericias[cod] || numStr;
    });
    resultado = texto.replace(match[1], treinadoTexto);
  }
  
  return resultado;
}
