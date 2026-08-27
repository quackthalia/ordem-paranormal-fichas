- **Uso de Ferramentas de Arquivo**: NUNCA utilize `run_command` para rodar scripts do `node` ou comandos como `findstr`, `cat`, `ls` apenas para pesquisar ou ler arquivos. Isso gera um prompt de aprovação para o usuário que é extremamente irritante. SEMPRE utilize as ferramentas nativas do sistema (`grep_search`, `view_file`, `list_dir`) que são executadas silenciosamente e de forma muito mais rápida. Só utilize `run_command` quando for extritamente necessário para comandos que causam mudanças ou requerem ambiente de shell (ex: `git`, `npm`).

- **Animação Obrigatória em Blocos Expansíveis (Collapse)**: TODOS os blocos que abrem/fecham na aplicação DEVEM usar o componente `<Collapse>` (`src/components/Collapse.tsx`). NUNCA usar renderização condicional seca como `{isExpanded && (<div>...</div>)}` para mostrar/esconder conteúdo expandido. Isso se aplica a TUDO: Origens, Inventário, Habilidades, Progressão NEX, Modais de Rituais, Modais de Itens, Modais de Armas, Modais de Proteções, etc. Sem exceção.
  - NUNCA sobrescreva as props duration ou 	imingFunction no componente <Collapse>. O componente já tem a velocidade e a curva de animação perfeitas como padrão, e nós queremos que toda a aplicação abra e feche exatamente na mesma velocidade para manter consistência absoluta.
  - NUNCA sobrescreva as props duration ou 	imingFunction no componente <Collapse>. O componente já tem a velocidade (0.25s) e a curva de animação perfeitas como padrão, e nós queremos que toda a aplicação expanda/retraia exatamente na mesma velocidade para manter consistência absoluta.
  - Para blocos com preview de texto (ex: descrições que mostram 3 linhas quando fechado e expandem ao clicar): usar `<Collapse isOpen={expandido} previewHeight="4.5em">` com um único conteúdo dentro. O Collapse cuida do gradiente de fade e da transição suave. NÃO duplicar o conteúdo (um para preview e outro para expandido).
  - Para blocos que simplesmente aparecem/desaparecem: usar `<Collapse isOpen={expandido}>` sem previewHeight.

- **Lista Suspensa Padronizada (CustomSelect)**: NUNCA usar `<select>` nativo do HTML em lugar nenhum da aplicação. SEMPRE usar o componente `<CustomSelect>` (`src/components/CustomSelect.tsx`). Esse componente já possui animação de abertura/fechamento (scale + opacity + translate), fecha ao clicar fora, e segue o visual padrão do projeto (zinc-900, border-zinc-700, hover green).
  - Import: `import { CustomSelect } from '../../components/CustomSelect'` (ajustar o caminho relativo conforme a localização do arquivo).
  - Props obrigatórias: `value`, `onChange`, `options` (array de `{value, label}` ou `string[]`).
  - Props opcionais: `className`, `wrapperClassName`, `placeholder`, `hideIcon` (para uso compacto em tabelas).
  - Quando usado dentro de tabelas (ex: PericiasTable), usar `hideIcon={true}` para esconder a setinha e centralizar o texto.

- **Layout Masonry para Modais de Duas Colunas**: Modais que mostram itens em duas colunas (Armas, Itens, Proteções, Munições, Rituais, etc) DEVEM usar o layout flexível masonry, NUNCA `grid grid-cols-2`. O padrão é:
  ```jsx
  <div className="flex flex-col md:flex-row gap-3 items-start">
    <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
      {lista.filter((_, i) => i % 2 === 0).map(...)}
    </div>
    <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
      {lista.filter((_, i) => i % 2 !== 0).map(...)}
    </div>
  </div>
  ```
  Isso evita que expandir um card numa coluna empurre o card adjacente na outra coluna (problema do CSS Grid).

- **Não Quebrar Funcionalidades Existentes**: Antes de editar qualquer arquivo, SEMPRE verificar o estado atual do código com `view_file` ou `grep_search`. Nunca assumir que o código está num estado específico. Se o código já implementa algo corretamente (ex: Collapse, CustomSelect, masonry), NÃO sobrescrever com uma implementação inferior ou incompleta. Ao adicionar novas funcionalidades, preservar TODAS as existentes.

- **Cores de Treino na Tabela de Perícias**: As cores da tabela de perícias (`COR_TREINO` em `PericiasTable.tsx`) usam o prefixo `!` do Tailwind (ex: `!text-emerald-400`) para forçar a prioridade sobre as cores padrão do `CustomSelect`. Isso garante que o atributo e o número de treino fiquem coloridos de acordo com o nível de treino da perícia. NUNCA remover o `!`.

- **Commit Automático**: Ao finalizar as tarefas solicitadas em um prompt do usuário, SEMPRE faça um commit no Git com as mudanças realizadas (ex: usando `run_command` com `git add .` e `git commit -m "..."`). As mensagens de commit devem ser curtas, descritivas e relativas ao que foi pedido/alterado.

- **Reset de Estado nos Modais**: TODO modal da aplicação DEVE resetar completamente seu estado interno (filtros aplicados, abas selecionadas, blocos/cards expandidos, etc) sempre que for fechado e aberto novamente. NUNCA preserve o estado de um modal após ele ser fechado, para garantir uma experiência consistente e limpa toda vez que o usuário abri-lo.

- **Scrollbars sem Layout Shift**: TODOS os contedos rol�veis (ex: modais, dropdowns, listas) que usam `overflow-auto` ou `overflow-y-auto` DEVEM incluir a classe `custom-scrollbar`. Essa classe aplica `scrollbar-gutter: stable`, o que reserva espao para o scrollbar e impede que o aparecimento/desaparecimento dele empurre o contedo pro lado, quebrando o layout.
