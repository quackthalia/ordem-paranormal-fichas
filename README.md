# Ordem Paranormal — Fichas

Criador de fichas de personagem para o RPG **Ordem Paranormal**, feito com React + TypeScript + Vite, usando Supabase como banco de dados (perícias, origens e poderes).

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
├── components/      # Componentes reutilizáveis (ModalPoderes, InputOtimizado)
├── context/         # RPGContext — estado global da ficha
├── hooks/           # usePericias, usePoderes, useOrigem, useStatus
├── screens/         # Telas: Atributos → Origens → Classe → Ficha
│   └── Ficha/       # Painéis da ficha (Status, Perícias, Abas)
├── services/        # Cliente do Supabase
├── types/           # Tipos TypeScript compartilhados
└── utils/           # rpgRules.ts — regras do sistema (PV/SAN/PE, NEX, limites)
```

## Fluxo de criação de personagem

1. **Atributos** — escolhe o NEX inicial e distribui os pontos de atributo
2. **Origem** — escolhe a origem (perícias treinadas + poder de origem)
3. **Classe** — Combatente, Especialista ou Ocultista
4. **Ficha** — ficha completa com status (PV/SAN/PE), defesa, perícias e habilidades

As tabelas `Perícias`, `Origens` e `Poderes` ficam no Supabase.
