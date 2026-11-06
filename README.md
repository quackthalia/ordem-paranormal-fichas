# Ordem Paranormal — Fichas

Criador de fichas de personagem para o RPG **Ordem Paranormal**, feito com React + TypeScript + Vite + Tailwind CSS, usando Supabase como banco de dados (perícias, origens e poderes).

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como modelo) com as credenciais do Supabase:

   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon
   ```

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

## Scripts

| Comando           | O que faz                                    |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento (Vite)           |
| `npm run build`   | Checa os tipos (tsc) e gera o build de produção |
| `npm run lint`    | Roda o ESLint                                |
| `npm run preview` | Serve o build de produção localmente         |

## Estrutura

```
src/
├── components/      # Componentes reutilizáveis (ModalPoderes, ModalArmas, ModalRituais, etc)
├── context/         # RPGContext — estado global da ficha
├── hooks/           # usePericias, usePoderes, useOrigens, useTrilhas, useRituais, useArmas, useMunicoes, useProtecoes
├── screens/         # Telas: Atributos → Origens → Classe → Ficha
│   └── Ficha/       # Painéis da ficha (Status, Perícias, Abas, Inventário, etc)
├── services/        # Cliente do Supabase
├── types/           # Tipos TypeScript compartilhados
└── utils/           # regras automaticas e cálculos de bônus
```

## Funcionalidades e Sistemas

- **Criação Guiada**: Escolha sequencial de Atributos, Origem e Classe.
- **Progressão de NEX**: Sistema que acompanha o Nível de Exposição Paranormal do personagem, destravando Habilidades, Poderes e Aumentos de Atributo.
- **Rituais**: Sistema completo de rituais com filtros por círculo, elemento e custo de PE, considerando Limites de PE por turno.
- **Trilhas de Classe**: Habilidades exclusivas que o personagem adquire nos NEX apropriados (Combatente, Especialista, Ocultista).
- **Inventário e Equipamentos**:
  - Armas, Munições e Proteções integradas com a ficha.
  - Arrastar e soltar (Drag and Drop) para reordenar inventário e agrupar munições às armas.
  - Controle de Carga, Limite de Itens, Prestigio, Patentes e Crédito.
  - Modais detalhados com informações, filtros avançados e buscas dinâmicas.
- **Status Integrados**: Cálculos automáticos de PV, PE, Sanidade, Defesa Total, Esquiva e Bloqueio baseados nos equipamentos equipados, perícias (Fortitude/Reflexos) e bônus passivos (regras automáticas).

As tabelas de `Perícias`, `Origens`, `Poderes`, `PoderesParanormais`, `Rituais`, `Armas`, `Munições`, `Proteções`, `Trilhas` e `RegrasAutomáticas` ficam hospedadas no banco de dados Supabase.
