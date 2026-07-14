# Resumo do Projeto: Ficha de Ordem Paranormal

Este documento serve como um "cérebro" de transferência de contexto para o agente (Antigravity). **Quando iniciar uma nova conversa, leia este arquivo para entender tudo o que já construímos!**

## 1. Estrutura de Rituais (O Grande Refatoramento)
Recentemente, migramos os Rituais para funcionarem de forma muito parecida com os Poderes.
- **Tipagem (`src/types/index.ts`):** 
  - Temos o tipo base `Ritual` (que vem do CSV importado).
  - Temos o tipo `RitualAprendido`, que guarda o `codigo_ritual`, a `origem` (ex: de qual nível de Ocultista ou poder ele veio), e propriedades customizadas.
- **Customização por Versão (`customProps`):**
  - O `RitualAprendido` possui um campo `customProps` que é um objeto dividido por abas: `normal`, `discente` e `verdadeiro`.
  - Cada versão guarda suas edições numéricas independentes (Ex: Alcance Médio no Normal, mas Extremo no Discente).

## 2. AbasPanel.tsx (O Coração da Ficha)
O arquivo `src/screens/Ficha/AbasPanel.tsx` renderiza quase tudo na aba de Habilidades e Rituais.
- **Visual dos Espaços Vazios (Slots):** Para habilidades/rituais que ainda não foram escolhidos, o botão ("+ Adicionar") tem uma borda esquerda **sólida** de 4px (`border-l-4 border-l-zinc-600`), enquanto o restante do container é tracejado (`border-dashed`). É super importante manter essa estética, pois ela combina com os slots já preenchidos (que têm a borda vermelha/verde sólida).
- **Janela de Edição Avançada:** O modal de edição de rituais permite personalizar Nome, Descrição e 8 atributos mecânicos (Execução, Custo, Alcance, Área, Alvo, Duração, Resistência e Dados).
- **Placeholder Dinâmico:** Ao editar um ritual, se a pessoa não digitar nada no input numérico, o placeholder puxa o valor calculado (`obterValorVersao`) correspondente à versão que está sendo editada (Normal, Discente ou Verdadeiro).

## 3. Lógica de Negócios e Hooks
- **Hooks:** Usamos hooks como `usePoderes` e `useRituais` para gerenciar o estado global da ficha.
- A função `obterValorVersao` avalia expressões (como `1 PE; +2 PE; +5 PE`) verificando `Tem_Discente` e `Tem_Verdadeiro`, e puxando a string exata para aquela versão usando `.split(';')`.
- **ModalPoderes.tsx:** A ordem das abas na janela de escolher poderes foi ajustada para exibir: Poderes de Combate/Utilidade (dependendo da origem/patamar) -> Poderes Gerais -> Poderes Paranormais.

## 4. Regras do Agente (AGENTS.md)
Existe uma regra em `.agents/AGENTS.md` definindo que toda vez que eu alterar um código com sucesso, devo fazer o `git commit` com mensagem descritiva e o `git push` automaticamente, sem perguntar!

## Próximos Passos (Para a próxima conversa)
O usuário está satisfeito com a lógica da ficha de Ocultista e com a renderização dinâmica de Rituais. Quaisquer bugs visuais que surjam nas listas de poderes/rituais devem ser verificados em `AbasPanel.tsx`. Sempre consulte a tipagem de `customProps` se for mexer no sistema de customização.
