import React, { useMemo } from 'react';

const PALAVRAS = [
  "Abundância", "Ação", "Adaptabilidade", "Alegria", "Alinhamento", "Amor", "Ansiedade", "Apatia", "Apego", "Aplauso", 
  "Astúcia", "Autoridade", "Aventura", "Caos", "Caridade", "Celebração", "Ciclos", "Clareza", "Colaboração", "Compaixão", 
  "Competição", "Conclusão", "Confiança", "Conflito", "Confusão", "Conforto", "Conservadorismo", "Controle", "Coragem", 
  "Criatividade", "Crenças", "Culpa", "Cura", "Curiosidade", "Dedicação", "Defesa", "Derrota", "Desafios", "Desapego", 
  "Desapontamento", "Descanso", "Despertar", "Destino", "Determinação", "Diplomacia", "Economia", "Empatia", "Ensino", 
  "Entusiasmo", "Equilíbrio", "Escassez", "Esgotamento", "Esperança", "Espontaneidade", "Espiritualidade", "Estabilidade", 
  "Estratégia", "Estudo", "Estrutura", "Ética", "Expansão", "Exploração", "Fantasias", "Fé", "Fertilidade", "Foco", 
  "Generosidade", "Habilidade", "Harmonia", "Herança", "Honra", "Horizontes", "Idealismo", "Ilusão", "Ilusões", "Impasse", 
  "Impotência", "Impulso", "Incerteza", "Inconsciente", "Indecisão", "Independência", "Infância", "Ingenuidade", "Inocência", 
  "Inspiração", "Intimidade", "Introspecção", "Intuição", "Isolamento", "Justiça", "Legado", "Lei", "Liberdade", "Liderança", 
  "Luxo", "Maestria", "Magnetismo", "Manifestação", "Materialismo", "Meditação", "Medo", "Memórias", "Mistério", "Moderação", 
  "Mudança", "Natureza", "Nostalgia", "Otimismo", "Ousadia", "Paciência", "Paixão", "Parceria", "Partida", "Pausa", "Perda", 
  "Perseverança", "Persistência", "Pesadelos", "Peso", "Planejamento", "Poder", "Progresso", "Prosperidade", "Rapidez", 
  "Realização", "Reciprocidade", "Reconhecimento", "Recuperação", "Reencontro", "Renascimento", "Resiliência", "Resistência", 
  "Risco", "Romantismo", "Rotina", "Ruína", "Ruptura", "Sabedoria", "Sacrifício", "Satisfação", "Sedução", "Segredo", 
  "Segurança", "Sensibilidade", "Serenidade", "Solidão", "Sombras", "Sucesso", "Tédio", "Totalidade", "Tradição", "Transição", 
  "Traição", "Tristeza", "União", "Verdade", "Viagem", "Vigilância", "Visão", "Vitalidade", "Vitória"
];

const PALAVRAS_SANGUE = [
  "Obsessão", "Fúria", "Paixão", "Rancor", "Euforia", "Impulso", "Desespero", "Fanatismo", 
  "Carne", "Pulsação", "Vísceras", "Artéria", "Hemoglobina", "Medula", "Fluido", "Coração", 
  "Dilaceração", "Sacrifício", "Chacina", "Martírio", "Crueldade", "Flagelo", "Tormento", "Sede", 
  "Massacre", "Rubro", "Escarlate", "Carmesim", "Fervura", "Simbiose", "Linhagem", "Laço", "Sanguinolento"
];

const PALAVRAS_ENERGIA = [
  "Instabilidade", "Voltagem", "Centelha", "Faísca", "Fulgor", "Clarão", "Relâmpago", 
  "Distorção", "Frenesi", "Vertigem", "Pulsação", "Cintilação", "Flutuação", "Magnetismo", 
  "Ruído", "Estridência", "Chiado", "Interferência", "Mutagênico", "Irradiação", "Brilho", 
  "Fluorescência", "Neon", "Luminescência", "Alucinação", "Paranoia", "Obsessão", "Impulso", 
  "Aceleração", "Volátil", "Espasmo", "Convulsão", "Choque", "Sobretensão", "Fusível", 
  "Disrupção", "Anormalidade", "Aberração", "Metamorfose", "Efêmero", "Fragmentação", 
  "Oscilação", "Ressonância", "Combustão", "Ignição", "Detonação", "Explosão", "Cataclismo", 
  "Ruína", "Decomposição"
];

const PALAVRAS_MORTE = [
  "Tempo", "Lodo", "Cinzas", "Espirais", "Envelhecimento", "Poeira", "Ampulheta", "Fim", 
  "Ciclo", "Decomposição", "Eternidade", "Relógio", "Obsolescência", "Caruncho", "Mofo", 
  "Esquecimento", "Entropia", "Ruína", "Letargia", "Lentidão", "Passado", "Apodrecimento", 
  "Rastro", "Cinzento", "Ossos", "Luto", "Memórias", "Estagnação", "Tédio", "Desgaste", 
  "Perecível", "Destino", "Terminal", "Murchar", "Carcaça", "Fóssil", "Antiguidade", 
  "Ferrugem", "Tumba", "Sepultura", "Breu", "Eco", "Silêncio", "Agonia", "Vazio", 
  "Decrepitude", "Vestígio", "Poço", "Fumaça", "Paralisação"
];

function textoParaBinario(texto: string) {
  return texto.split('').map(char => {
    const bin = char.charCodeAt(0).toString(2).padStart(8, '0');
    // Injeta '1's artificiais nos zeros (25% de chance) pra equilibrar o visual da Matrix
    return bin.split('').map(b => (b === '0' && Math.random() < 0.25) ? '1' : b).join('');
  }).join('');
}

const ESTRUTURA = [
  { left: '0vw', colunas: [30, 28, 23, 23, 24, 15, 16] },
  { left: '15vw', colunas: [4, 16, 22, 18, 6] },
  { left: '29vw', colunas: [6, 12, 21, 16, 3] },
  { left: '47vw', colunas: [4, 10, 11, 3] },
  { left: '62vw', colunas: [18, 25, 17] },
  { left: '75vw', colunas: [3, 6, 18, 17, 9, 3] },
  { right: '0vw', colunas: [12, 16, 13, 20, 24, 22, 28, 33] }
];

const ESTRUTURA_ESPARSA = [
  { top: '15%', left: '3vw', colunas: [10] },
  { top: '35%', left: '12vw', colunas: [6, 12] },
  { top: '55%', left: '5vw', colunas: [15] },
  { top: '75%', left: '18vw', colunas: [8] },
  { top: '22%', right: '7vw', colunas: [14] },
  { top: '42%', right: '16vw', colunas: [8, 11] },
  { top: '68%', right: '4vw', colunas: [16] },
  { top: '85%', right: '14vw', colunas: [7, 5] },
];

const Coluna = React.memo(({ altura, afinidade }: { altura: number, afinidade?: string | null }) => {
  const isConhecimento = afinidade === 'Conhecimento';
  const isSangue = afinidade === 'Sangue';
  const isMorte = afinidade === 'Morte';
  const isEnergia = afinidade === 'Energia';
  const charBase = isConhecimento ? 'O' : '0';

  const { texto, delay, duration } = useMemo(() => {
    const gerarTexto = (conteudoStr: string) => {
      if (isMorte) {
        let html = '';
        for (let i = 0; i < altura; i++) {
          const char = conteudoStr[i] || charBase;
          const rand = Math.random();
          if (rand < 0.05) {
            html += `<span class="flip-1">${char}</span>`;
          } else if (rand < 0.10) {
            html += `<span class="flip-2">${char}</span>`;
          } else if (rand < 0.15) {
            html += `<span class="flip-3">${char}</span>`;
          } else {
            html += `<span>${char}</span>`;
          }
        }
        return html;
      }
      return conteudoStr.split('').join('\n');
    };

    let listaMestre = PALAVRAS;
    if (isSangue) listaMestre = PALAVRAS_SANGUE;
    else if (isEnergia) listaMestre = PALAVRAS_ENERGIA;
    else if (isMorte) listaMestre = PALAVRAS_MORTE;

    let conteudo = '';
    if (isConhecimento) {
      const palavra = listaMestre[Math.floor(Math.random() * listaMestre.length)];
      conteudo = palavra.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase();
    } else {
      const p1 = listaMestre[Math.floor(Math.random() * listaMestre.length)];
      const p2 = listaMestre[Math.floor(Math.random() * listaMestre.length)];
      const p3 = listaMestre[Math.floor(Math.random() * listaMestre.length)];
      conteudo = textoParaBinario(p1 + p2 + p3);
    }

    let stringFinal = conteudo;
    while (stringFinal.length < altura) {
      stringFinal += conteudo;
    }
    stringFinal = stringFinal.substring(0, altura);

    let textoProcessado: string;
    if (isSangue) {
      const charsSujos = stringFinal.split('').map(c => {
        const rand = Math.random();
        if (rand < 0.12) return '|';
        if (rand < 0.22) return 'v';
        if (rand < 0.32) return '.';
        if (c === '0' && rand < 0.5) return '1';
        return c;
      });
      textoProcessado = gerarTexto(charsSujos.join(''));
    } else if (isEnergia) {
      const charsSujos = stringFinal.split('').map(c => {
        const rand = Math.random();
        if (rand < 0.02) return '#';
        if (rand < 0.04) return 'X';
        if (rand < 0.06) return '&';
        if (rand < 0.08) return '%';
        if (rand < 0.10) return '?';
        if (c === '0' && rand < 0.4) return '1';
        return c;
      });
      textoProcessado = gerarTexto(charsSujos.join(''));
    } else {
      textoProcessado = gerarTexto(stringFinal);
    }

    return {
      texto: textoProcessado,
      delay: (Math.random() * 10).toFixed(2),
      duration: (Math.random() * 5 + 6).toFixed(2)
    };
  }, [altura, isConhecimento, isSangue, isMorte, isEnergia, charBase]);

  let cssClasses = 'coluna';
  if (isConhecimento) cssClasses += ' coluna-conhecimento';
  if (isSangue) cssClasses += ' coluna-sangue';

  const styleProps = { 
    '--delay': `${delay}s`, 
    '--duracao': `${duration}s` 
  } as React.CSSProperties;

  if (isMorte) {
    return <div className={cssClasses} style={styleProps} dangerouslySetInnerHTML={{ __html: texto }} />;
  }

  return (
    <div className={cssClasses} style={styleProps}>
      {texto}
    </div>
  );
});

export const MatrixBackground = React.memo(({ afinidade, active = false }: { afinidade?: string | null; active?: boolean }) => {
  // Desativado a pedido: mantém todo o código e lógica intactos, mas não renderiza na tela
  if (!active) return null;

  const isMorte = afinidade === 'Morte';
  const isSangue = afinidade === 'Sangue';
  const isEnergia = afinidade === 'Energia';

  // Define qual classe de tema aplicar
  let temaClasse = '';
  if (isMorte) temaClasse = 'tema-morte';
  else if (isSangue) temaClasse = 'tema-sangue';
  else if (isEnergia) temaClasse = 'tema-energia';

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Sigilos';
          src: url('/fonts/SigilosDoOutroLado-Regular.ttf') format('truetype');
        }

        #fundo-cascata {
          position: absolute; 
          top: 0;
          left: 0;
          width: 100%;
          height: 100%; 
          -webkit-user-select: none;
          user-select: none;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          contain: strict;
        }

        /* TEMA: MORTE */
        #fundo-cascata.tema-morte {
          transform: rotate(180deg);
        }

        #fundo-cascata.tema-morte .coluna {
          color: #4a4a4a;
        }

        #fundo-cascata.tema-morte .coluna span {
          display: block;
          height: 16px;
          text-align: center;
        }

        #fundo-cascata.tema-morte .coluna .flip-1 { animation: glitchFlip 3.2s infinite; }
        #fundo-cascata.tema-morte .coluna .flip-2 { animation: glitchFlip 4.5s infinite; animation-delay: -1.1s; }
        #fundo-cascata.tema-morte .coluna .flip-3 { animation: glitchFlip 2.8s infinite; animation-delay: -0.7s; }

        @keyframes glitchFlip {
          0%, 45% { transform: rotateX(0deg); }
          50%, 95% { transform: rotateX(180deg); }
          100% { transform: rotateX(360deg); }
        }

        /* TEMA: ENERGIA */
        #fundo-cascata.tema-energia .coluna {
          color: #9b30ff;
          animation: energiaFlicker var(--duracao) infinite;
        }

        #fundo-cascata.tema-energia .bolinho:nth-child(2n) .coluna { color: #00d9ff; animation-duration: 4s; }
        #fundo-cascata.tema-energia .bolinho:nth-child(3n) .coluna { color: #ff00c8; animation-duration: 2.5s; }
        #fundo-cascata.tema-energia .bolinho:nth-child(5n) .coluna { color: #00ff40; animation-duration: 5s; }

        @keyframes energiaFlicker {
          0%, 94% { opacity: 0.75; transform: translate3d(0, 0, 0); }
          95% { opacity: 0.4; transform: translate3d(-2px, 0, 0); }
          97% { opacity: 0.85; transform: translate3d(2px, 0, 0); }
          99% { opacity: 0.35; transform: translate3d(-1px, 0, 0); }
          100% { opacity: 0.75; transform: translate3d(0, 0, 0); }
        }

        /* --- ESTILOS DA CHUVA (NORMAL, CONHECIMENTO E SANGUE) --- */
        #fundo-cascata .bolinho {
          position: absolute;
          display: flex;
          -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
        }

        #fundo-cascata .bolinho-esparso {
          opacity: 0.65;
        }

        #fundo-cascata .bolinho-bottom {
          align-items: flex-end;
          -webkit-mask-image: linear-gradient(to top, black 60%, transparent 100%);
          mask-image: linear-gradient(to top, black 60%, transparent 100%);
        }

        #fundo-cascata .coluna {
          font-family: 'Courier New', Courier, monospace;
          font-size: 16px;
          line-height: 16px;
          width: 14px; 
          text-align: center;
          white-space: pre;
          overflow: hidden;
          color: #3d3d3d;
          will-change: opacity;
          animation: luzCaindo var(--duracao) ease-in-out infinite;
          animation-delay: var(--delay);
        }

        /* TEMA: CONHECIMENTO (SIGILOS + DOURADO SUTIL) */
        #fundo-cascata .coluna.coluna-conhecimento {
          font-family: 'Sigilos', 'Courier New', monospace;
          color: #5c4e1e;
          font-size: 18px; 
        }

        /* TEMA: SANGUE (VERMELHO VISCOSO) */
        #fundo-cascata .coluna.coluna-sangue {
          font-weight: bold;
          line-height: 14px;
          color: #7a0909;
          animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        @keyframes luzCaindo {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.9; }
        }
      `}</style>
      
      <div id="fundo-cascata" className={temaClasse}>
        {/* CHUVA DO TOPO */}
        {ESTRUTURA.map((bolinho, i) => (
          <div 
            key={`top-${i}`} 
            className="bolinho" 
            style={{ 
              top: 0,
              ...(bolinho.right !== undefined ? { right: bolinho.right } : { left: bolinho.left }) 
            }}
          >
            {bolinho.colunas.map((altura, j) => (
              <Coluna key={j} altura={altura} afinidade={afinidade} />
            ))}
          </div>
        ))}

        {/* CHUVAS ESPARSAS (LATERAIS) */}
        {ESTRUTURA_ESPARSA.map((bolinho, i) => (
          <div 
            key={`esparsa-${i}`} 
            className="bolinho bolinho-esparso" 
            style={{ 
              top: bolinho.top,
              ...(bolinho.right !== undefined ? { right: bolinho.right } : { left: bolinho.left }) 
            }}
          >
            {bolinho.colunas.map((altura, j) => (
              <Coluna key={j} altura={altura} afinidade={afinidade} />
            ))}
          </div>
        ))}

        {/* CHUVA DO FUNDO (INVERTIDA) */}
        {ESTRUTURA.map((bolinho, i) => (
          <div 
            key={`bottom-${i}`} 
            className="bolinho bolinho-bottom" 
            style={{ 
              bottom: 0,
              ...(bolinho.right !== undefined ? { right: bolinho.right } : { left: bolinho.left }) 
            }}
          >
            {bolinho.colunas.map((altura, j) => (
              <Coluna key={j} altura={altura} afinidade={afinidade} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
});
