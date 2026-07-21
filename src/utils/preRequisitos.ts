import type { Atributos, PericiasMap, Poder } from '../types';

export interface ContextoPreRequisitos {
  atributos: Atributos;
  nex: number;
  pericias: PericiasMap;
  nomesPericias: Record<number, string>;
  poderes: { nome: string; elemento?: string }[];
  origem?: string;
  rituaisAprendidos?: import('../types').RitualAprendido[];
  rituais?: import('../types').Ritual[];
}

export interface ResultadoValidacao {
  atende: boolean;
  motivo?: string;
}

export function verificarPreRequisitos(
  poder: Poder,
  contexto: ContextoPreRequisitos,
  elementoTentado?: string,
  periciaTentada?: number
): ResultadoValidacao {
  const codigo = poder.Pre_Codigo;
  const texto = poder.PreRequisitos || '';

  // Se não houver código, ou se for código não implementado ainda, libera por padrão
  if (!codigo || codigo > 48) {
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

  // Helper para validar se é Veterano (treino >= 10)
  const verificarVeterano = (codigos: number[]): { atende: boolean; motivo?: string } => {
    const faltantes: string[] = [];
    
    for (const cod of codigos) {
      const nomePericia = nomesPericias[cod];
      if (!nomePericia) {
        faltantes.push(`Perícia #${cod}`);
        continue;
      }
      
      const dados = pericias[nomePericia];
      if (!dados || dados.treino < 10) {
        faltantes.push(nomePericia);
      }
    }

    if (faltantes.length > 0) {
      return { atende: false, motivo: `Veterano em ${faltantes.join(' e ')}` };
    }
    return { atende: true };
  };

  // Helper para pegar códigos de perícia de uma string ("treinado em 16" ou "veterano em 17")
  const extrairCodigosPericias = (textoReq: string): number[] => {
    const regex = /(treinado|veterano)\s+em\s*([\s\S]*)/i;
    const match = textoReq.match(regex);
    if (!match) return [];
    
    // extrai todos os números da string
    const numerosStr = match[2].match(/\d+/g);
    if (!numerosStr) return [];
    
    return numerosStr.map(n => parseInt(n, 10));
  };

  switch (codigo) {
    case 1:
    case 13:
    case 15: {
      // Exige um atributo em valor X (Ex: "Int 2", "Int 3", "Pre 1")
      const res = verificarAtributo(textoLower);
      if (!res.atende) return res;
      return { atende: true };
    }

    case 2:
    case 14: {
      // Exige um atributo em valor X + Ser treinado em 1 perícia (Ex: "For 2, treinado em 16", "Agi 3, treinado em 7")
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
      const temPoder = contexto.poderes.some(p => p.nome === poderRequerido);
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

    case 11: {
      // Exige 2 poderes (Ex: "Ataque Especial, Casca Grossa")
      const partes = textoLower.split(',').map(p => p.trim().replace(/\.$/, ''));
      for (const poder of partes) {
        if (!contexto.poderes.some(p => p.nome === poder)) {
          return { atende: false, motivo: texto };
        }
      }
      return { atende: true };
    }

    case 12: {
      // Exige atributo, perícia e um poder (Ex: "For 2, treinado em 16, Artista Marcial.")
      const resAttr = verificarAtributo(textoLower);
      if (!resAttr.atende) return resAttr;
      
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const resPericia = verificarPericia([codigos[0]]);
        if (!resPericia.atende) return resPericia;
      }
      
      const partes = textoLower.split(',');
      const ultimo = partes[partes.length - 1].trim().replace(/\.$/, '');
      if (!contexto.poderes.some(p => p.nome === ultimo)) {
        return { atende: false, motivo: texto };
      }
      
      return { atende: true };
    }

    case 17: {
      // Exige Veterano em 1 perícia (Ex: "Veterano em 17.")
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const res = verificarVeterano([codigos[0]]);
        if (!res.atende) return res;
      }
      return { atende: true };
    }

    case 18:
    case 20: {
      // Exige Especialista em Elemento no elemento escolhido e NEX 45% (18) ou NEX 30% (20)
      const nexMin = codigo === 18 ? 45 : 30;
      if (contexto.nex < nexMin) return { atende: false, motivo: `NEX ${nexMin}%` };
      
      if (!elementoTentado) {
        const temAlgum = contexto.poderes.some(p => p.nome.startsWith('especialista em elemento'));
        if (!temAlgum) return { atende: false, motivo: 'Especialista em Elemento' };
      } else {
        const poderExato = `especialista em elemento (${elementoTentado.toLowerCase()})`;
        if (!contexto.poderes.some(p => p.nome === poderExato)) {
          return { atende: false, motivo: `Especialista em Elemento (${elementoTentado})` };
        }
      }
      return { atende: true };
    }

    case 19: {
      // Exige Int 2, conjurar ritual de 2° círculo do elemento escolhido
      const resAttr = verificarAtributo(textoLower);
      if (!resAttr.atende) return resAttr;

      if (!elementoTentado) {
        if (contexto.nex < 25) return { atende: false, motivo: 'Acesso a 2º Círculo' };
      } else {
        if (contexto.rituaisAprendidos && contexto.rituais) {
          const temRitual = contexto.rituaisAprendidos.some(ra => {
            const ritualBase = contexto.rituais?.find(r => r.Codigo_Ritual === ra.codigo_ritual);
            if (!ritualBase) return false;
            if (ritualBase.Circulo_Ritual < 2) return false;
            
            const elementoDoRitual = ritualBase.Elemento_Ritual.toLowerCase();
            if (elementoDoRitual === 'lista' || elementoDoRitual === 'varia' || elementoDoRitual === 'vária') {
               return ra.elemento_escolhido?.toLowerCase() === elementoTentado.toLowerCase();
            }
            return elementoDoRitual === elementoTentado.toLowerCase();
          });

          if (!temRitual) {
            return { atende: false, motivo: `Ritual de 2º Círculo (${elementoTentado})` };
          }
        } else {
          if (contexto.nex < 25) return { atende: false, motivo: `Ritual de 2º Círculo (${elementoTentado})` };
        }
      }
      
      return { atende: true };
    }

    case 16: {
      // Exige Treinado em 2 perícias
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length >= 2) {
        const res = verificarPericia([codigos[0], codigos[1]]);
        if (!res.atende) return res;
      } else {
        return { atende: false, motivo: texto };
      }
      return { atende: true };
    }

    case 21: {
      // Exige Atributo 3, treinado em perícia, Conjurar ritual
      const resAttr = verificarAtributo(textoLower);
      if (!resAttr.atende) return resAttr;

      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const resPericia = verificarPericia([codigos[0]]);
        if (!resPericia.atende) return resPericia;
      }
      
      if (!contexto.rituaisAprendidos || contexto.rituaisAprendidos.length === 0) {
        return { atende: false, motivo: 'Conjurar ritual' };
      }
      return { atende: true };
    }

    case 22: {
      // Mestre em Elemento no elemento escolhido, NEX 60%
      if (contexto.nex < 60) return { atende: false, motivo: 'NEX 60%' };
      
      if (!elementoTentado) {
        const temAlgum = contexto.poderes.some(p => p.nome.startsWith('mestre em elemento'));
        if (!temAlgum) return { atende: false, motivo: 'Mestre em Elemento' };
      } else {
        const poderExato = `mestre em elemento (${elementoTentado.toLowerCase()})`;
        if (!contexto.poderes.some(p => p.nome === poderExato)) {
          return { atende: false, motivo: `Mestre em Elemento (${elementoTentado})` };
        }
      }
      return { atende: true };
    }

    case 23: {
      // Dois atributos 2
      const regexStr = /(for|agi|int|pre|vig)\s*(\d+)/gi;
      const matches = [...texto.matchAll(regexStr)];
      
      if (matches.length >= 2) {
        for (let i = 0; i < 2; i++) {
          const attrName = matches[i][1].toUpperCase() as keyof Atributos;
          const attrMin = parseInt(matches[i][2], 10);
          if (contexto.atributos[attrName] < attrMin) {
            return { atende: false, motivo: `${attrName} ${attrMin}` };
          }
        }
      } else {
        return { atende: false, motivo: texto };
      }
      return { atende: true };
    }

    case 24: {
      // Um atributo 3 ou outro, treinado em uma pericia ou outra
      // Ex: "Agi 3 ou Int 3, treinado em Luta ou Pontaria"
      const regexStr = /(for|agi|int|pre|vig)\s*(\d+)/gi;
      const matches = [...texto.matchAll(regexStr)];
      if (matches.length > 0) {
        const atendeAlgumAttr = matches.some(match => {
          const attrName = match[1].toUpperCase() as keyof Atributos;
          const attrMin = parseInt(match[2], 10);
          return contexto.atributos[attrName] >= attrMin;
        });
        if (!atendeAlgumAttr) {
          const attrMotivos = matches.map(m => `${m[1].toUpperCase()} ${m[2]}`).join(' ou ');
          return { atende: false, motivo: attrMotivos };
        }
      }
      
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const atendeAlgumaPericia = codigos.some(cod => verificarPericia([cod]).atende);
        if (!atendeAlgumaPericia) {
          const nomes = codigos.map(c => contexto.nomesPericias[c] || c).join(' ou ');
          return { atende: false, motivo: `Treinado em ${nomes}` };
        }
      }
      return { atende: true };
    }

    case 25: {
      // Atributo 2, Ter ritual de 1 circulo, regra de reter ritual ativa
      const resAttr = verificarAtributo(textoLower);
      if (!resAttr.atende) return resAttr;
      
      if (!contexto.rituaisAprendidos || contexto.rituaisAprendidos.length === 0) {
        return { atende: false, motivo: 'Ritual de 1º Círculo' };
      }
      return { atende: true };
    }

    case 26: {
      // Atributo 2, Atributo 2, ter ritual de 1 circulo
      const regexStr = /(for|agi|int|pre|vig)\s*(\d+)/gi;
      const matches = [...texto.matchAll(regexStr)];
      if (matches.length >= 2) {
        for (let i = 0; i < 2; i++) {
          const attrName = matches[i][1].toUpperCase() as keyof Atributos;
          const attrMin = parseInt(matches[i][2], 10);
          if (contexto.atributos[attrName] < attrMin) {
            return { atende: false, motivo: `${attrName} ${attrMin}` };
          }
        }
      }
      
      if (!contexto.rituaisAprendidos || contexto.rituaisAprendidos.length === 0) {
        return { atende: false, motivo: 'Ritual de 1º Círculo' };
      }
      return { atende: true };
    }

    case 27: {
      // Atributo 3, treinado em uma perícia ou outra
      const resAttr = verificarAtributo(textoLower);
      if (!resAttr.atende) return resAttr;
      
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const atendeAlgumaPericia = codigos.some(cod => verificarPericia([cod]).atende);
        if (!atendeAlgumaPericia) {
          const nomes = codigos.map(c => contexto.nomesPericias[c] || c).join(' ou ');
          return { atende: false, motivo: `Treinado em ${nomes}` };
        }
      }
      return { atende: true };
    }

    case 28: {
      // Treinado na perícia escolhida
      if (periciaTentada) {
        const res = verificarPericia([periciaTentada]);
        if (!res.atende) {
          const nomePericia = contexto.nomesPericias[periciaTentada] || `Perícia ${periciaTentada}`;
          return { atende: false, motivo: `Treinado em ${nomePericia}` };
        }
      }
      return { atende: true };
    }

    case 29: {
      // Treinado em perícia, NEX 30%
      if (contexto.nex < 30) return { atende: false, motivo: 'NEX 30%' };
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const res = verificarPericia([codigos[0]]);
        if (!res.atende) return res;
      }
      return { atende: true };
    }

    case 30: {
      // Um atributo 2 ou outro, treinado em perícia
      const regexStr = /(for|agi|int|pre|vig)\s*(\d+)/gi;
      const matches = [...texto.matchAll(regexStr)];
      if (matches.length > 0) {
        const atendeAlgumAttr = matches.some(match => {
          const attrName = match[1].toUpperCase() as keyof Atributos;
          const attrMin = parseInt(match[2], 10);
          return contexto.atributos[attrName] >= attrMin;
        });
        if (!atendeAlgumAttr) {
          const attrMotivos = matches.map(m => `${m[1].toUpperCase()} ${m[2]}`).join(' ou ');
          return { atende: false, motivo: attrMotivos };
        }
      }
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const res = verificarPericia([codigos[0]]);
        if (!res.atende) return res;
      }
      return { atende: true };
    }

    case 31: {
      // Atributo 3, Ter ritual de 2 circulo, Poder
      const resAttr = verificarAtributo(textoLower);
      if (!resAttr.atende) return resAttr;
      if (!contexto.rituaisAprendidos || !contexto.rituaisAprendidos.some(r => {
         const def = contexto.rituais?.find(rd => rd.Nome_Ritual === r.nome);
         return def && parseInt(def.Circulo) >= 2;
      })) {
        return { atende: false, motivo: 'Ritual de 2º Círculo' };
      }
      const partes = textoLower.split(',');
      const ultimo = partes[partes.length - 1].trim().replace(/\.$/, '');
      if (!contexto.poderes.some(p => p.nome === ultimo)) {
        return { atende: false, motivo: ultimo };
      }
      return { atende: true };
    }

    case 32: {
      // Atributo 2, ter algum ritual
      const resAttr = verificarAtributo(textoLower);
      if (!resAttr.atende) return resAttr;
      if (!contexto.rituaisAprendidos || contexto.rituaisAprendidos.length === 0) {
        return { atende: false, motivo: 'Ter algum ritual' };
      }
      return { atende: true };
    }

    case 33: {
      // Atributo 2, treinado em perícia, ter um ritual
      const resAttr = verificarAtributo(textoLower);
      if (!resAttr.atende) return resAttr;
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const res = verificarPericia([codigos[0]]);
        if (!res.atende) return res;
      }
      if (!contexto.rituaisAprendidos || contexto.rituaisAprendidos.length === 0) {
        return { atende: false, motivo: 'Ter algum ritual' };
      }
      return { atende: true };
    }

    case 34: {
      // Um atributo 2 ou outro
      const regexStr = /(for|agi|int|pre|vig)\s*(\d+)/gi;
      const matches = [...texto.matchAll(regexStr)];
      if (matches.length > 0) {
        const atendeAlgumAttr = matches.some(match => {
          const attrName = match[1].toUpperCase() as keyof Atributos;
          const attrMin = parseInt(match[2], 10);
          return contexto.atributos[attrName] >= attrMin;
        });
        if (!atendeAlgumAttr) {
          const attrMotivos = matches.map(m => `${m[1].toUpperCase()} ${m[2]}`).join(' ou ');
          return { atende: false, motivo: attrMotivos };
        }
      }
      return { atende: true };
    }

    case 35: {
      // Um atributo 2 ou outro, treinado em perícia, ter um ritual
      const regexStr = /(for|agi|int|pre|vig)\s*(\d+)/gi;
      const matches = [...texto.matchAll(regexStr)];
      if (matches.length > 0) {
        const atendeAlgumAttr = matches.some(match => {
          const attrName = match[1].toUpperCase() as keyof Atributos;
          const attrMin = parseInt(match[2], 10);
          return contexto.atributos[attrName] >= attrMin;
        });
        if (!atendeAlgumAttr) {
          const attrMotivos = matches.map(m => `${m[1].toUpperCase()} ${m[2]}`).join(' ou ');
          return { atende: false, motivo: attrMotivos };
        }
      }
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const res = verificarPericia([codigos[0]]);
        if (!res.atende) return res;
      }
      if (!contexto.rituaisAprendidos || contexto.rituaisAprendidos.length === 0) {
        return { atende: false, motivo: 'Ter algum ritual' };
      }
      return { atende: true };
    }

    case 36: {
      // Duplo uso: Origem Artística (para poderes normais) OU "Sangue 1" (para paranormais - BD inconsistente)
      if (textoLower.includes('sangue')) {
        const qtdSangue = contexto.poderes.filter(p => p.elemento?.toLowerCase().trim() === 'sangue').length;
        if (qtdSangue < 1) return { atende: false, motivo: '1 Poder de Sangue' };
        return { atende: true };
      }
      const origensArtisticas = ['ator', 'músico', 'escritor', 'dançarino', 'cantor', 'pintor', 'influencer', 'anfitrião', 'cosplayer', 'fotógrafo', 'influencer paranormal'];
      if (!contexto.origem || !origensArtisticas.includes(contexto.origem.toLowerCase())) {
        return { atende: false, motivo: 'Origem Artística' };
      }
      return { atende: true };
    }

    case 37: {
      // NEX 40%
      if (contexto.nex < 40) return { atende: false, motivo: 'NEX 40%' };
      return { atende: true };
    }

    case 38: {
      // Ter 1 outro poder de sangue
      const qtdSangue = contexto.poderes.filter(p => p.elemento?.toLowerCase().trim() === 'sangue').length;
      if (qtdSangue < 1) return { atende: false, motivo: '1 Poder de Sangue' };
      return { atende: true };
    }

    case 39: {
      // Ter 2 outros poderes de Sangue
      const qtdSangue = contexto.poderes.filter(p => p.elemento?.toLowerCase().trim() === 'sangue').length;
      if (qtdSangue < 2) return { atende: false, motivo: '2 Poderes de Sangue' };
      return { atende: true };
    }

    case 40: {
      // Ter 1 outro poder de Conhecimento
      const qtdConh = contexto.poderes.filter(p => p.elemento?.toLowerCase().trim() === 'conhecimento').length;
      if (qtdConh < 1) return { atende: false, motivo: '1 Poder de Conhecimento' };
      return { atende: true };
    }

    case 41: {
      // Ter 1 outro poder de Energia
      const qtdEnergia = contexto.poderes.filter(p => p.elemento?.toLowerCase().trim() === 'energia').length;
      if (qtdEnergia < 1) return { atende: false, motivo: '1 Poder de Energia' };
      return { atende: true };
    }

    case 42: {
      // Ter 1 outro poder de Morte
      const qtdMorte = contexto.poderes.filter(p => p.elemento?.toLowerCase().trim() === 'morte').length;
      if (qtdMorte < 1) return { atende: false, motivo: '1 Poder de Morte' };
      return { atende: true };
    }

    case 43: {
      // Ter outros 2 poderes de Morte
      const qtdMorte = contexto.poderes.filter(p => p.elemento?.toLowerCase().trim() === 'morte').length;
      if (qtdMorte < 2) return { atende: false, motivo: '2 Poderes de Morte' };
      return { atende: true };
    }

    case 44: {
      // Ter 2 outros poderes de Energia
      const qtdEnergia = contexto.poderes.filter(p => p.elemento?.toLowerCase().trim() === 'energia').length;
      if (qtdEnergia < 2) return { atende: false, motivo: '2 Poderes de Energia' };
      return { atende: true };
    }

    case 45: {
      // Ter um ritual de Sangue
      const temSangue = contexto.rituaisAprendidos?.some(ra => {
        const def = contexto.rituais?.find(r => r.Nome_Ritual === (ra as any).nome);
        return def && def.Elemento?.toLowerCase().trim() === 'sangue';
      });
      if (!temSangue) {
        return { atende: false, motivo: 'Ritual de Sangue' };
      }
      return { atende: true };
    }

    case 46: {
      // Conhecimento 1, NEX 45% e treinado em 18.
      const qtdConh = contexto.poderes.filter(p => p.elemento === 'Conhecimento').length;
      if (qtdConh < 1) return { atende: false, motivo: '1 Poder de Conhecimento' };
      if (contexto.nex < 45) return { atende: false, motivo: 'NEX 45%' };
      const codigos = extrairCodigosPericias(textoLower);
      if (codigos.length > 0) {
        const res = verificarPericia([codigos[0]]);
        if (!res.atende) return res;
      }
      return { atende: true };
    }

    case 47: {
      // NEX 50%
      if (contexto.nex < 50) return { atende: false, motivo: 'NEX 50%' };
      return { atende: true };
    }

    case 48: {
      // Ritual Vomitar Pestes
      if (!contexto.rituaisAprendidos || !contexto.rituaisAprendidos.some(r => r.nome.toLowerCase() === 'vomitar pestes')) {
        return { atende: false, motivo: 'Ritual Vomitar Pestes' };
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
  
  // Procura o trecho de "treinado em " ou "veterano em" e traduz apenas os números dentro dele
  const match = texto.match(/(treinado|veterano)\s+em\s*([\s\S]*)/i);
  if (match) {
    let treinadoTexto = match[2];
    treinadoTexto = treinadoTexto.replace(/\d+/g, (numStr) => {
      const cod = parseInt(numStr, 10);
      return nomesPericias[cod] || numStr;
    });
    resultado = texto.replace(match[2], treinadoTexto);
  }
  
  return resultado;
}
