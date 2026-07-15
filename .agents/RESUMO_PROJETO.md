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

## 5. Sistema de Trilhas
- As Trilhas foram integradas com sucesso! Elas possuem tipagem própria em `src/types/index.ts` e um hook próprio chamado `useTrilhas.ts`, que puxa da tabela `Trilhas` no Supabase e mapeia os nomes de perícia via tabela `Perícias`.
- A escolha da trilha ocorre no **NEX 10%** (ou nível 2). Ela surge como um slot vazio na ficha em `AbasPanel.tsx` e é selecionada por meio do `ModalTrilhas.tsx`.
- Assim que uma trilha é escolhida, a perícia ligada a ela entra em `periciasGratis` no `RPGContext` automaticamente, aplicando o status de Treinada (se a perícia já era treinada, nada ocorre por enquanto, até um sistema de compensação futuro).
- As habilidades das trilhas (de NEX 10, 40, 65 e 99) são exibidas de forma dinâmica na ficha: o jogador só consegue ver (abrir/revelar) a habilidade se o personagem tiver alcançado o NEX mínimo necessário para ela.

## 6. Sistema de Afinidade e Restrições de Rituais
- **Afinidade (`RPGContext.tsx`)**: No NEX 50%, o jogador deve escolher um Elemento base. A afinidade começa no modo **Dormente (Pendente)** e só é ativada plenamente (`afinidadeAtiva: true`) quando o jogador adquire um novo Poder Paranormal (Transceder).
- **Mecânica de Dupla Escolha**: Com a afinidade ativa, a lista de poderes paranormais do respectivo elemento permite que o jogador selecione o mesmo poder uma segunda vez. Isso desbloqueia a linha de bônus especial de "Afinidade" descrita no poder (a linha destaca dinamicamente na lista da ficha).
- **Restrições Opressoras**: A interface (`StatusPanel.tsx`) possui um tooltip que detalha o elemento escolhido e o elemento opressor (ex: Sangue oprime Conhecimento, logo você recebe -2d20 de Morte, seguindo o ciclo estabelecido).
- **Pré-requisitos de Rituais (`verificarRequisitoRitual`)**: As opções de lançar um ritual nas formas *Discente* ou *Verdadeiro* verificam ativamente os requisitos exigidos. Se o requisito exigir `Acesso ao 3º Círculo` (NEX > 55%) ou `Afinidade com X`, as opções ficam bloqueadas visualmente nos selects e mostram o motivo.

## 7. Aprimoramentos de UI/UX
- **Campos de Busca**: Quase todos os modais da aplicação (`ModalPoderes`, `ModalPoderesExtra`, `ModalRituais`, `ModalRituaisExtra`, `ModalTrilhas`) agora possuem um campo global de `<input>` que filtra dinamicamente a lista pelo nome exato, otimizando o uso para jogadores mais experientes.

## Próximos Passos (Para a próxima conversa)
Testar livremente a mecânica de afinidade, evolução de círculo e requisitos discentes em rituais avançados. Discutir eventuais ajustes finos no sistema de inventário ou nos conflitos de perícias das Trilhas.
