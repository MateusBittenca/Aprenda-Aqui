import { PrismaClient, ExerciseType } from '@prisma/client';
import { landingForCourse } from './track-landing-content';

/** Ordem global estável (grupo lógico * 100000 + ordem do curso no grupo). */
const courseOrder = (trackOrd: number, courseOrd: number) => trackOrd * 100000 + courseOrd;

type ExCreate = {
  type: ExerciseType;
  title: string;
  prompt: string;
  explanation: string;
  xpReward: number;
  gemReward: number;
  payload: Record<string, unknown>;
};

/**
 * Cinco cursos novos (conteúdo extenso): React, Algoritmos, TypeScript avançado, APIs, Qualidade.
 * O editor de código do MVP avalia apenas expressões JavaScript.
 */
export async function seedNewTracks(prisma: PrismaClient) {
  async function exercisesForLesson(lessonId: string, items: ExCreate[]) {
    await prisma.exercise.createMany({
      data: items.map((e, orderIndex) => ({
        lessonId,
        orderIndex,
        type: e.type,
        title: e.title,
        prompt: e.prompt,
        explanation: e.explanation,
        xpReward: e.xpReward,
        gemReward: e.gemReward,
        payload: e.payload as object,
      })),
    });
  }

  // --- React e interfaces ---
  const courseReactA = await prisma.course.create({
    data: {
      slug: 'react-fundamentos',
      title: 'React — fundamentos',
      description: 'JSX, componentes, props e composição.',
      orderIndex: courseOrder(4, 0),
      isFree: true,
      autoEnrollOnAuth: true,
      tagline: 'Construa interfaces reativas com confiança.',
      ...landingForCourse('react-interfaces'),
    },
  });

  const modR1 = await prisma.module.create({
    data: { courseId: courseReactA.id, slug: 'jsx-componentes', title: 'JSX e componentes', orderIndex: 0 },
  });

  const lR1 = await prisma.lesson.create({
    data: {
      moduleId: modR1.id,
      slug: 'jsx-por-baixo-dos-panos',
      title: 'JSX por baixo dos panos',
      objective: 'Entender o que JSX representa e por que facilita a UI.',
      estimatedMinutes: 8,
      orderIndex: 0,
      contentMd: `## JSX no React

O **JSX** é uma sintaxe que lembra HTML, mas vira chamadas de função (\`React.createElement\` ou equivalente do compilador). Isso permite misturar **marcação** com **lógica** no mesmo arquivo de componente.

### Por que usar?

- **Leitura**: a árvore de interface fica explícita.
- **Segurança**: valores são escapados por padrão (menos XSS acidental em textos).
- **Composição**: componentes são funções que retornam JSX.

### Exemplo mínimo

\`\`\`jsx
function Saudacao({ nome }) {
  return <p>Olá, {nome}!</p>;
}
\`\`\`

A expressão \`{nome}\` injeta o valor JavaScript no texto.

### Boas práticas

- Um componente por responsabilidade coesa.
- Nomes em **PascalCase** para componentes React.
- Evite lógica pesada diretamente no JSX; extraia funções ou hooks.`,
    },
  });

  await exercisesForLesson(lR1.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Natureza do JSX',
      prompt: 'No ecossistema React, o JSX é tipicamente:',
      explanation:
        'O JSX é **compilado** para JavaScript (ex.: createElement). Navegadores não executam JSX cru sem build.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        options: [
          'Executado diretamente pelo navegador sem build',
          'Transformado em chamadas JavaScript por um compilador',
          'Apenas CSS com outro nome',
          'Uma linguagem de servidor como PHP',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Interpolação no JSX',
      prompt: 'Complete para exibir a variável **nome** dentro do parágrafo.',
      explanation: 'Chaves \`{ }\` avaliam expressões JavaScript dentro do JSX.',
      xpReward: 20,
      gemReward: 2,
      payload: {
        template: 'function Demo({ nome }) {\n  return <p>{{b1}}nome{{b2}}</p>;\n}',
        blanks: [
          { id: 'b1', answer: '{' },
          { id: 'b2', answer: '}' },
        ],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Template de string',
      prompt:
        'Escreva uma **expressão** JavaScript que resulte na string exata **`Olá, dev`** (use template literal ou concatenação).',
      explanation: 'Ex.: `\\`Olá, dev\\`` ou `"Olá, " + "dev"`.',
      xpReward: 24,
      gemReward: 3,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '"Olá, dev"' }] },
    },
  ]);

  const lR2 = await prisma.lesson.create({
    data: {
      moduleId: modR1.id,
      slug: 'props-imutaveis',
      title: 'Props e imutabilidade',
      objective: 'Passar dados para baixo e respeitar fluxo unidirecional.',
      estimatedMinutes: 7,
      orderIndex: 1,
      contentMd: `## Props

**Props** (propriedades) são o mecanismo principal de um componente pai **passar dados** para filhos. Em React, trate props como **somente leitura** no filho: não mutar objetos recebidos; crie cópias ou derive novo estado no pai.

### Fluxo de dados

Dados descem pela árvore; eventos sobem (callbacks) quando o filho precisa avisar o pai.

\`\`\`jsx
function Lista({ itens, onRemover }) {
  return itens.map((id) => <Item key={id} id={id} onRemover={onRemover} />);
}
\`\`\`

### key em listas

Use uma **key estável** (id) para ajudar o reconciliador a associar itens entre renders.`,
    },
  });

  await exercisesForLesson(lR2.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Direção dos dados',
      prompt: 'No modelo mental clássico do React, as props costumam fluir:',
      explanation: 'Props descem do pai para os filhos; atualizações de estado no pai geram novo render.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Sempre de filho para pai',
          'Do pai para os filhos',
          'Apenas entre irmãos, nunca do pai',
          'Apenas via variáveis globais window',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Acesso a propriedade',
      prompt: 'Complete para ler a propriedade **nome** do objeto **usuario**.',
      explanation: 'Notação de ponto: `usuario.nome`.',
      xpReward: 18,
      gemReward: 2,
      payload: {
        template: 'const usuario = { nome: "Ana" };\nconst x = usuario{{b1}}nome;',
        blanks: [{ id: 'b1', answer: '.' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Tamanho de array',
      prompt: 'Escreva uma expressão que retorne quantos elementos tem o array **`[1, 2, 3]`**.',
      explanation: '`[1,2,3].length` resulta em 3; JSON.stringify(3) é "3".',
      xpReward: 22,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '3' }] },
    },
  ]);

  const modR2 = await prisma.module.create({
    data: { courseId: courseReactA.id, slug: 'estado-hooks', title: 'Estado com hooks', orderIndex: 1 },
  });

  const lR3 = await prisma.lesson.create({
    data: {
      moduleId: modR2.id,
      slug: 'usestate-basico',
      title: 'useState na prática',
      objective: 'Armazenar e atualizar estado local em componentes de função.',
      estimatedMinutes: 9,
      orderIndex: 0,
      contentMd: `## useState

\`useState\` retorna um par **[valor, setValor]**. Chamar o setter agenda um **re-render** com o novo estado.

### Atualização funcional

Quando o próximo estado depende do anterior, prefira a forma funcional:

\`\`\`js
setContagem((c) => c + 1);
\`\`\`

### Armadilhas comuns

- **Mutação direta** de arrays/objetos: prefira cópias (\`[...arr]\`, spread de objetos).
- **Estado derivado**: não guarde no state o que pode ser calculado a partir de outras variáveis.`,
    },
  });

  await exercisesForLesson(lR3.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Efeito do setter',
      prompt: 'Ao chamar o setter retornado por useState com um novo valor, o React tipicamente:',
      explanation: 'O setter dispara uma nova renderização com o estado atualizado.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        options: [
          'Re-renderiza o componente',
          'Recarrega a página inteira',
          'Apaga o DOM manualmente',
          'Compila TypeScript no navegador',
        ],
        correctIndex: 0,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Array spread',
      prompt: 'Complete para copiar **arr** e adicionar o elemento **4** no final.',
      explanation: 'Spread cria um novo array: `[...arr, 4]`.',
      xpReward: 20,
      gemReward: 2,
      payload: {
        template: 'const arr = [1, 2, 3];\nconst novo = [{{b1}}arr, 4];',
        blanks: [{ id: 'b1', answer: '...' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Soma com reduce',
      prompt:
        'Escreva uma expressão que some os números **`[10, 20, 12]`** usando **`.reduce((a,b)=>a+b, 0)`**.',
      explanation: '10+20+12 = 42.',
      xpReward: 26,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '42' }],
      },
    },
  ]);

  const lR4 = await prisma.lesson.create({
    data: {
      moduleId: modR2.id,
      slug: 'useeffect-visao-geral',
      title: 'useEffect — visão geral',
      objective: 'Sincronizar o componente com o mundo externo com segurança.',
      estimatedMinutes: 10,
      orderIndex: 1,
      contentMd: `## useEffect

\`useEffect(fn, deps)\` executa **efeitos colaterais** após o paint: buscar dados, assinar eventos, manipular DOM não declarativo, etc.

### Array de dependências

- **[]** — roda após montagem (e cleanup ao desmontar, se retornar função).
- **[a, b]** — reexecuta quando \`a\` ou \`b\` mudam.
- **omitir deps** (não recomendado) — comportamento legado; evite.

### Limpeza

Retorne uma função para remover listeners, abortar fetch, etc.

\`\`\`js
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
\`\`\``,
    },
  });

  await exercisesForLesson(lR4.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Momento do efeito',
      prompt: 'useEffect roda após o React:',
      explanation: 'Efeitos rodam após o commit no DOM (pós-render), não bloqueando o paint em muitos casos.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Antes de qualquer renderização',
          'Depois que o navegador pinta a atualização',
          'Somente no servidor Node',
          'Apenas quando há erro',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Timer',
      prompt: 'Complete para agendar uma função **f** daqui a 1000 ms.',
      explanation: '`setTimeout(f, 1000)`.',
      xpReward: 18,
      gemReward: 2,
      payload: {
        template: 'const id = {{b1}}(f, 1000);',
        blanks: [{ id: 'b1', answer: 'setTimeout' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'JSON de objeto',
      prompt: 'Escreva uma expressão que produza o **mesmo** valor que `JSON.stringify({ ok: true })`.',
      explanation: 'A string é `"{\\"ok\\":true}"` — use JSON.stringify({ ok: true }).',
      xpReward: 24,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '{"ok":true}' }],
      },
    },
  ]);

  const courseReactB = await prisma.course.create({
    data: {
      slug: 'react-formularios-ui',
      title: 'Formulários e padrões de UI',
      description: 'Inputs controlados, validação básica e acessibilidade.',
      orderIndex: courseOrder(4, 1),
      isFree: true,
      autoEnrollOnAuth: false,
    },
  });

  const modR3 = await prisma.module.create({
    data: { courseId: courseReactB.id, slug: 'formularios', title: 'Formulários', orderIndex: 0 },
  });

  const lR5 = await prisma.lesson.create({
    data: {
      moduleId: modR3.id,
      slug: 'inputs-controlados',
      title: 'Inputs controlados',
      objective: 'Ligar valor do input ao estado React.',
      estimatedMinutes: 8,
      orderIndex: 0,
      contentMd: `## Input controlado

O **valor** vem do state e mudanças passam por **onChange**:

\`\`\`jsx
const [texto, setTexto] = useState("");
return <input value={texto} onChange={(e) => setTexto(e.target.value)} />;
\`\`\`

Isso torna o estado a **fonte da verdade** e facilita validação, máscaras e testes.`,
    },
  });

  await exercisesForLesson(lR5.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Fonte da verdade',
      prompt: 'Em um input controlado, o valor exibido costuma vir de:',
      explanation: 'O state React controla o valor; onChange atualiza o state.',
      xpReward: 14,
      gemReward: 2,
      payload: {
        options: ['Somente variável global', 'Estado React', 'Apenas localStorage direto', 'CSS'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Evento de mudança',
      prompt: 'Complete o nome do handler típico de mudança em elementos de formulário.',
      explanation: 'Em React DOM, `onChange` captura alterações de valor.',
      xpReward: 17,
      gemReward: 2,
      payload: {
        template: '<input {{b1}}={(e) => setV(e.target.value)} />',
        blanks: [{ id: 'b1', answer: 'onChange' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'String trim',
      prompt: 'Escreva uma expressão que retorne **`"  hi  "`** sem espaços nas pontas.',
      explanation: '`"  hi  ".trim()` → `"hi"`; JSON.stringify dá "\\"hi\\"".',
      xpReward: 22,
      gemReward: 2,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '"hi"' }],
      },
    },
  ]);

  const lR6 = await prisma.lesson.create({
    data: {
      moduleId: modR3.id,
      slug: 'listas-keys',
      title: 'Listas e keys',
      objective: 'Renderizar coleções com identidade estável.',
      estimatedMinutes: 6,
      orderIndex: 1,
      contentMd: `## Keys

Ao mapear arrays para JSX, forneça \`key\` **estável e única** no contexto da lista (ids de entidade). Evite usar índice como key quando a ordem muda ou itens são inseridos/removidos no meio — pode causar bugs sutis de estado em filhos.`,
    },
  });

  await exercisesForLesson(lR6.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Propósito da key',
      prompt: 'A prop key ajuda o React principalmente a:',
      explanation: 'Keys ajudam a reconciliar qual item corresponde entre renders.',
      xpReward: 14,
      gemReward: 2,
      payload: {
        options: [
          'Estilizar o elemento automaticamente',
          'Identificar itens estáveis em listas para reconciliação',
          'Definir acessibilidade ARIA',
          'Importar módulos',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Método map',
      prompt: 'Complete o método de array que transforma cada elemento.',
      explanation: '`array.map(fn)` retorna um novo array.',
      xpReward: 18,
      gemReward: 2,
      payload: {
        template: 'const y = [1,2,3].{{b1}}(n => n * 2);',
        blanks: [{ id: 'b1', answer: 'map' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Filtrar pares',
      prompt: 'Escreva uma expressão: filtre **`[1,2,3,4]`** mantendo apenas **pares** (use `.filter`).',
      explanation: '`[1,2,3,4].filter(n => n % 2 === 0)` → `[2,4]`; JSON.stringify.',
      xpReward: 26,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '[2,4]' }],
      },
    },
  ]);

  const modR4 = await prisma.module.create({
    data: { courseId: courseReactB.id, slug: 'acessibilidade', title: 'Acessibilidade rápida', orderIndex: 1 },
  });

  const lR7 = await prisma.lesson.create({
    data: {
      moduleId: modR4.id,
      slug: 'semantica-html',
      title: 'Semântica e foco',
      objective: 'Usar elementos corretos para leitores de tela e teclado.',
      estimatedMinutes: 7,
      orderIndex: 0,
      contentMd: `## Semântica

Prefira \`<button>\` para ações, \`<a>\` para navegação, cabeçalhos em ordem (\`h1\` → \`h2\`…). Isso melhora **SEO**, **acessibilidade** e manutenção.

### Foco

Gerencie foco em modais (trap), ofereça skip links e estados visíveis de :focus-visible.`,
    },
  });

  await exercisesForLesson(lR7.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Botão vs div',
      prompt: 'Para uma ação acionável por teclado e leitor de tela, prefira:',
      explanation: '`button` tem papel, foco e tecla Enter/Espaço por padrão.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: ['<div onClick> sem papel', '<button type="button">', '<span> sem tabindex', 'Apenas imagem'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Tipo de botão em formulário',
      prompt: 'Complete o type recomendado para botão que NÃO submete formulário.',
      explanation: '`type="button"` evita submit acidental.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: '<button type="{{b1}}">Salvar rascunho</button>',
        blanks: [{ id: 'b1', answer: 'button' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Includes em string',
      prompt: 'Escreva uma expressão booleana: **`"accessibility".includes("access")`**.',
      explanation: 'Deve ser `true`; JSON.stringify(true) é "true".',
      xpReward: 20,
      gemReward: 2,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: 'true' }],
      },
    },
  ]);

  const lR8 = await prisma.lesson.create({
    data: {
      moduleId: modR4.id,
      slug: 'performance-memo',
      title: 'Memoização quando faz sentido',
      objective: 'Entender React.memo, useMemo e useCallback sem otimizar cedo demais.',
      estimatedMinutes: 9,
      orderIndex: 1,
      contentMd: `## Quando memoizar

\`React.memo\` evita re-render de componentes puros quando props não mudam. \`useMemo\`/\`useCallback\` estabilizam referências.

**Medir primeiro**: otimização prematura complica o código. Use quando há evidência de custo (listas grandes, animações, drag-and-drop).`,
    },
  });

  await exercisesForLesson(lR8.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'memo',
      prompt: 'React.memo é mais útil quando:',
      explanation: 'Memo ajuda quando re-renders são frequentes e o custo do subtree é alto.',
      xpReward: 14,
      gemReward: 2,
      payload: {
        options: [
          'O componente nunca recebe props',
          'Re-renders custosos podem ser evitados com props estáveis',
          'Substitui o useState',
          'Só funciona em class components',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Igualdade estrita',
      prompt: 'Complete o operador de igualdade **sem** coerção de tipos.',
      explanation: '`===` compara sem coerção.',
      xpReward: 17,
      gemReward: 2,
      payload: {
        template: 'const ok = (a {{b1}} b);',
        blanks: [{ id: 'b1', answer: '===' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Objeto com método',
      prompt:
        'Escreva uma expressão que retorne um objeto `{ double: (n)=> n*2 }` e depois chame **double(21)** (resultado **42**).',
      explanation: 'Ex.: `(({ double: n => n*2 }).double(21))`',
      xpReward: 28,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '42' }],
      },
    },
  ]);

  // --- Algoritmos e lógica ---
  const courseAlgoA = await prisma.course.create({
    data: {
      slug: 'complexidade-arrays',
      title: 'Complexidade e arrays',
      description: 'Big-O intuitivo, busca e ordenação em alto nível.',
      orderIndex: courseOrder(5, 0),
      isFree: true,
      autoEnrollOnAuth: true,
      tagline: 'Pense como um engenheiro: correto, rápido e claro.',
      ...landingForCourse('algoritmos-logica'),
    },
  });

  const modA1 = await prisma.module.create({
    data: { courseId: courseAlgoA.id, slug: 'big-o', title: 'Big-O intuitivo', orderIndex: 0 },
  });

  const lA1 = await prisma.lesson.create({
    data: {
      moduleId: modA1.id,
      slug: 'notacao-assintotica',
      title: 'Notação assintótica',
      objective: 'Comparar custos quando n cresce.',
      estimatedMinutes: 10,
      orderIndex: 0,
      contentMd: `## Big-O (intuição)

Descrevemos **como o tempo ou espaço crescem** com o tamanho da entrada \`n\`:

- **O(1)** — constante
- **O(log n)** — dividir e conquistar (ex.: busca binária em array ordenado)
- **O(n)** — percorrer uma vez
- **O(n log n)** — ordenações eficientes comuns
- **O(n²)** — loops aninhados ingênuos

Focamos no **pior caso** e ignoramos constantes para comparar escalas.`,
    },
  });

  await exercisesForLesson(lA1.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Busca em array ordenado',
      prompt: 'Para encontrar um valor em array **ordenado** com muitas consultas, costuma-se preferir:',
      explanation: 'Busca binária é O(log n) por consulta; linear é O(n).',
      xpReward: 17,
      gemReward: 2,
      payload: {
        options: [
          'Varredura linear sempre',
          'Busca binária (com índices)',
          'Ordenar a cada busca sem cache',
          'Converter tudo para string',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Potência de 2',
      prompt: 'Complete: 2 elevado a 5 em JavaScript.',
      explanation: '`Math.pow(2, 5)` ou `2 ** 5`.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: 'const v = Math.{{b1}}(2, 5);',
        blanks: [{ id: 'b1', answer: 'pow' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Soma 1 a 5',
      prompt: 'Escreva uma expressão que some **1+2+3+4+5**.',
      explanation: 'Resultado 15.',
      xpReward: 22,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '15' }] },
    },
  ]);

  const lA2 = await prisma.lesson.create({
    data: {
      moduleId: modA1.id,
      slug: 'dois-ponteiros',
      title: 'Dois ponteiros',
      objective: 'Resolver problemas em array ordenado com janelas móveis.',
      estimatedMinutes: 9,
      orderIndex: 1,
      contentMd: `## Técnica

Em arrays **ordenados**, dois índices \`l\` e \`r\` podem caminhar para achar pares com soma alvo em **O(n)** em vez de O(n²).

Exemplo clássico: soma de par igual a \`target\` (com cuidados com duplicatas).`,
    },
  });

  await exercisesForLesson(lA2.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Vantagem',
      prompt: 'Dois ponteiros costuma reduzir:',
      explanation: 'Evita verificar todos os pares com loop duplo ingênuo.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Uso de memória para sempre O(1) extra em qualquer problema',
          'Complexidade de tempo em problemas adequados',
          'Necessidade de arrays',
          'JavaScript',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'While',
      prompt: 'Complete a palavra-chave do laço: enquanto **l < r**.',
      explanation: '`while (l < r) { ... }`',
      xpReward: 14,
      gemReward: 1,
      payload: {
        template: '{{b1}} (l < r) { /* ... */ }',
        blanks: [{ id: 'b1', answer: 'while' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Média de dois números',
      prompt: 'Escreva uma expressão para a média de **10** e **20**.',
      explanation: '(10+20)/2 = 15.',
      xpReward: 20,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '15' }] },
    },
  ]);

  const modA2 = await prisma.module.create({
    data: { courseId: courseAlgoA.id, slug: 'estruturas', title: 'Pilhas e filas', orderIndex: 1 },
  });

  const lA3 = await prisma.lesson.create({
    data: {
      moduleId: modA2.id,
      slug: 'pilha-stack',
      title: 'Pilha (stack)',
      objective: 'LIFO: último a entrar, primeiro a sair.',
      estimatedMinutes: 7,
      orderIndex: 0,
      contentMd: `## Stack

Operações típicas: **push** (topo), **pop** (topo), **peek**. Usada em parsing, DFS iterativo, undo, validação de parênteses.

Em JS, \`array.push/pop\` no final simula stack com amortizado O(1).`,
    },
  });

  await exercisesForLesson(lA3.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Ordem',
      prompt: 'Uma pilha segue o princípio:',
      explanation: 'LIFO — Last In First Out.',
      xpReward: 14,
      gemReward: 2,
      payload: {
        options: ['FIFO', 'LIFO', 'Aleatório', 'Só leitura'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Remover do topo',
      prompt: 'Complete o método que remove o último elemento do array.',
      explanation: '`pop()` remove e retorna o último.',
      xpReward: 17,
      gemReward: 2,
      payload: {
        template: 'const x = [1,2,3];\nconst y = x.{{b1}}();',
        blanks: [{ id: 'b1', answer: 'pop' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Último caractere',
      prompt: 'Escreva uma expressão que retorne o último caractere da string **`"abc"`**.',
      explanation: '`"abc".at(-1)` ou `"abc"[2]` → `"c"`; JSON.stringify é "\\"c\\"".',
      xpReward: 22,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '"c"' }] },
    },
  ]);

  const lA4 = await prisma.lesson.create({
    data: {
      moduleId: modA2.id,
      slug: 'fila-queue',
      title: 'Fila (queue)',
      objective: 'FIFO: primeiro a entrar, primeiro a sair.',
      estimatedMinutes: 7,
      orderIndex: 1,
      contentMd: `## Queue

Operações: **enqueue** (fim), **dequeue** (início). BFS em grafos usa fila.

Em JS, \`push\` + \`shift\` funciona mas \`shift\` pode ser O(n). Para performance, use **deque** (estrutura dedicada) ou índices de cabeça/cauda em array circular.`,
    },
  });

  await exercisesForLesson(lA4.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'BFS',
      prompt: 'A busca em largura (BFS) em grafos costuma usar:',
      explanation: 'BFS explora camadas; fila é natural.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        options: ['Pilha apenas', 'Fila', 'Heap mínimo sempre', 'Ordenação por contagem'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Adicionar ao fim',
      prompt: 'Complete o método que adiciona no final do array.',
      explanation: '`push`.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        template: '[].{{b1}}(10);',
        blanks: [{ id: 'b1', answer: 'push' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Fila simples',
      prompt: 'Escreva uma expressão: comece com `[1]`, dê **push(2)**, depois **shift()** — valor retornado pelo shift.',
      explanation: '`[1].push(2)` muta e retorna length; use cópia mental: após push [1,2], shift → 1.',
      xpReward: 24,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '1' }],
      },
    },
  ]);

  const courseAlgoB = await prisma.course.create({
    data: {
      slug: 'strings-mapas',
      title: 'Strings, mapas e conjuntos',
      description: 'Contagem de frequência, sets e mapas em problemas comuns.',
      orderIndex: courseOrder(5, 1),
      isFree: true,
      autoEnrollOnAuth: false,
    },
  });

  const modA3 = await prisma.module.create({
    data: { courseId: courseAlgoB.id, slug: 'hash', title: 'Hash maps', orderIndex: 0 },
  });

  const lA5 = await prisma.lesson.create({
    data: {
      moduleId: modA3.id,
      slug: 'map-frequency',
      title: 'Frequência com Map',
      objective: 'Contar ocorrências em O(n).',
      estimatedMinutes: 8,
      orderIndex: 0,
      contentMd: `## Map

\`Map\` guarda pares chave→valor com chaves de qualquer tipo. Para frequência de caracteres:

\`\`\`js
const m = new Map();
for (const ch of str) m.set(ch, (m.get(ch) ?? 0) + 1);
\`\`\``,
    },
  });

  await exercisesForLesson(lA5.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Colisão conceitual',
      prompt: 'Em uma tabela hash bem dimensionada, buscas/inserções médias costumam ser:',
      explanation: 'Em média O(1) amortizado; pior caso pode degradar com muitas colisões.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        options: ['O(n²) sempre', 'O(1) em média para operações básicas', 'O(log n) sempre', 'O(1) no pior caso garantido sempre'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Novo Map',
      prompt: 'Complete o construtor.',
      explanation: '`new Map()`',
      xpReward: 14,
      gemReward: 1,
      payload: {
        template: 'const m = new {{b1}}();',
        blanks: [{ id: 'b1', answer: 'Map' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Tamanho do Set',
      prompt: 'Escreva uma expressão: crie `new Set([1,1,2,2,3])` e retorne **`.size`**.',
      explanation: 'Set tem 3 elementos únicos.',
      xpReward: 22,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '3' }] },
    },
  ]);

  const lA6 = await prisma.lesson.create({
    data: {
      moduleId: modA3.id,
      slug: 'anagrama',
      title: 'Verificação de anagrama',
      objective: 'Comparar assinaturas de frequência ou ordenação.',
      estimatedMinutes: 9,
      orderIndex: 1,
      contentMd: `## Ideia

Dois textos são anagramas se têm as mesmas letras com mesmas contagens. Compare mapas de frequência ou ordene os caracteres (atenção a Unicode/normalização em produção).`,
    },
  });

  await exercisesForLesson(lA6.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Custo típico',
      prompt: 'Contar frequência de cada letra em strings de tamanho n costuma ser:',
      explanation: 'Uma passagem por string: O(n).',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: ['O(1)', 'O(n)', 'O(n²) obrigatoriamente', 'O(log n)'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Dividir string',
      prompt: 'Complete o método que separa por delimitador.',
      explanation: '`split`',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: '"a-b-c".{{b1}}("-")',
        blanks: [{ id: 'b1', answer: 'split' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Ordenar caracteres',
      prompt: 'Escreva uma expressão: **`"bac".split("").sort().join("")`**.',
      explanation: 'Resultado `"abc"`; compare com JSON.stringify.',
      xpReward: 24,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '"abc"' }],
      },
    },
  ]);

  const modA4 = await prisma.module.create({
    data: { courseId: courseAlgoB.id, slug: 'recursao', title: 'Recursão e DP intro', orderIndex: 1 },
  });

  const lA7 = await prisma.lesson.create({
    data: {
      moduleId: modA4.id,
      slug: 'fibonacci-topdown',
      title: 'Fibonacci e memoização',
      objective: 'Evitar recomputação com cache.',
      estimatedMinutes: 10,
      orderIndex: 0,
      contentMd: `## Memoização

A recursão ingênua de Fibonacci repete subproblemas. Guarde resultados em **Map** ou array.

Também existe **bottom-up** (DP iterativo) com O(n) tempo e O(1) espaço extra com rolagem de variáveis.`,
    },
  });

  await exercisesForLesson(lA7.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Problema da recursão ingênua',
      prompt: 'fib(n) recursivo sem memo pode ter tempo:',
      explanation: 'Árvore exponencial ~ O(φ^n).',
      xpReward: 17,
      gemReward: 2,
      payload: {
        options: ['O(n)', 'Exponencial no pior caso', 'O(1)', 'O(log n) sempre'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Operador nullish',
      prompt: 'Complete: **a ?? b** retorna **b** quando **a** é ___ ou **undefined**.',
      explanation: 'Nullish coalescing: `null` ou `undefined`.',
      xpReward: 18,
      gemReward: 2,
      payload: {
        template: 'const z = a ?? b; // se a é {{b1}} ou undefined, usa b',
        blanks: [{ id: 'b1', answer: 'null' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Fib(6)',
      prompt: 'Escreva uma expressão que calcule o 6º número de Fibonacci (começando F(0)=0, F(1)=1).',
      explanation: 'Sequência 0,1,1,2,3,5,8 → F(6)=8.',
      xpReward: 28,
      gemReward: 3,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '8' }] },
    },
  ]);

  const lA8 = await prisma.lesson.create({
    data: {
      moduleId: modA4.id,
      slug: 'janela-deslizante',
      title: 'Janela deslizante',
      objective: 'Otimizar subarrays de tamanho fixo.',
      estimatedMinutes: 9,
      orderIndex: 1,
      contentMd: `## Sliding window

Para soma máxima de \`k\` elementos consecutivos, atualize a soma em O(1) ao deslizar: subtraia o que sai, some o que entra.

Generaliza para problemas com restrições em intervalos.`,
    },
  });

  await exercisesForLesson(lA8.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Quando usar',
      prompt: 'Janela deslizante é adequada quando:',
      explanation: 'Subproblemas sobre intervalos contínuos se sobrepõem — reutilizar a soma.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Precisamos ordenar o array inteiro sempre',
          'Há sobreposição entre subintervalos consecutivos',
          'Só funciona com strings binárias',
          'Só em grafos densos',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Slice',
      prompt: 'Complete o método que extrai parte do array sem mutar o original.',
      explanation: '`slice`.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: 'const part = [10,20,30,40].{{b1}}(1, 3);',
        blanks: [{ id: 'b1', answer: 'slice' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Soma janela 2',
      prompt: 'Escreva uma expressão: some **`[5, 1, 2]`** (índices 0..2) — resultado **8**.',
      explanation: '5+1+2=8.',
      xpReward: 22,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '8' }] },
    },
  ]);

  await seedNewTracksPart2(prisma, exercisesForLesson);
}

async function seedNewTracksPart2(
  prisma: PrismaClient,
  exercisesForLesson: (lessonId: string, items: ExCreate[]) => Promise<void>,
) {
  // --- TypeScript profundo ---
  const courseTsA = await prisma.course.create({
    data: {
      slug: 'tipos-genericos',
      title: 'Tipos e generics',
      description: 'Uniões, narrowing, generics e inferência.',
      orderIndex: courseOrder(6, 0),
      isFree: true,
      autoEnrollOnAuth: true,
      tagline: 'Tipos que guiam o design e reduzem bugs.',
      ...landingForCourse('typescript-profundo'),
    },
  });

  const modT1 = await prisma.module.create({
    data: { courseId: courseTsA.id, slug: 'unioes-narrowing', title: 'Uniões e narrowing', orderIndex: 0 },
  });

  const lT1 = await prisma.lesson.create({
    data: {
      moduleId: modT1.id,
      slug: 'narrowing-typeof',
      title: 'Narrowing com typeof e truthiness',
      objective: 'Refinar uniões para tipos específicos.',
      estimatedMinutes: 9,
      orderIndex: 0,
      contentMd: `## Narrowing

TypeScript **refina** tipos após checagens:

\`\`\`ts
function len(x: string | string[] | null) {
  if (!x) return 0;
  if (typeof x === "string") return x.length;
  return x.length;
}
\`\`\`

Use \`in\`, \`Array.isArray\`, discriminantes em uniões discriminadas.`,
    },
  });

  await exercisesForLesson(lT1.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Propósito do narrowing',
      prompt: 'Narrowing permite ao TypeScript:',
      explanation: 'Reduzir uniões para um tipo mais específico após checks.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        options: [
          'Executar código mais rápido em runtime',
          'Afinar tipos em ramos do código',
          'Remover JavaScript do bundle',
          'Substituir testes unitários',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'typeof array',
      prompt: 'Complete: em JS, **typeof []** retorna a string ___ (atenção: não é "array").',
      explanation: '`typeof []` é `"object"`.',
      xpReward: 17,
      gemReward: 2,
      payload: {
        template: 'typeof [] === "{{b1}}"',
        blanks: [{ id: 'b1', answer: 'object' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'União com default',
      prompt: 'Escreva uma expressão: **`null ?? "x"`**.',
      explanation: 'Resultado `"x"`.',
      xpReward: 20,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '"x"' }] },
    },
  ]);

  const lT2 = await prisma.lesson.create({
    data: {
      moduleId: modT1.id,
      slug: 'generics-funcoes',
      title: 'Generics em funções',
      objective: 'Preservar relações entre tipos de entrada e saída.',
      estimatedMinutes: 10,
      orderIndex: 1,
      contentMd: `## Generics

\`\`\`ts
function primeiro<T>(arr: readonly T[]): T | undefined {
  return arr[0];
}
\`\`\`

\`T\` é inferido pelo argumento. Generics evitam casts e mantêm segurança em coleções e factories.`,
    },
  });

  await exercisesForLesson(lT2.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Inferência',
      prompt: 'Ao chamar `identity(123)` onde `identity<T>(x: T): T`, T costuma ser inferido como:',
      explanation: 'O literal/número leva a inferência de tipo.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: ['string sempre', 'number', 'unknown', 'any obrigatoriamente'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Readonly array',
      prompt: 'Complete o modificador de tipo utilitário para array somente leitura (TS).',
      explanation: '`ReadonlyArray<T>` ou `readonly T[]`.',
      xpReward: 18,
      gemReward: 2,
      payload: {
        template: 'type RO = {{b1}}Array<number>;',
        blanks: [{ id: 'b1', answer: 'Readonly' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Primeiro elemento',
      prompt: 'Escreva uma expressão que retorne o primeiro elemento de **`[7,8,9]`**.',
      explanation: '`[7,8,9][0]` → 7.',
      xpReward: 21,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '7' }] },
    },
  ]);

  const modT2 = await prisma.module.create({
    data: { courseId: courseTsA.id, slug: 'utility-types', title: 'Utility types', orderIndex: 1 },
  });

  const lT3 = await prisma.lesson.create({
    data: {
      moduleId: modT2.id,
      slug: 'partial-pick',
      title: 'Partial, Pick e Omit',
      objective: 'Derivar tipos sem duplicar campos.',
      estimatedMinutes: 8,
      orderIndex: 0,
      contentMd: `## Utilitários

- **Partial<T>** — todos os campos opcionais
- **Pick<T, K>** — subconjunto de chaves
- **Omit<T, K>** — remove chaves

Combine com ** keyof ** e mapeamentos para DRY em formulários e DTOs.`,
    },
  });

  await exercisesForLesson(lT3.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Partial',
      prompt: 'Partial<User> é útil para:',
      explanation: 'Updates parciais onde cada campo pode ser opcional.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Tornar o código mais rápido em runtime',
          'Representar atualizações onde campos podem faltar',
          'Remover tipagem',
          'Converter TS em Python',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: ' keyof ',
      prompt: 'Complete: **keyof T** produz união das ___ de T.',
      explanation: 'Chaves (keys).',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: 'type K = {{b1}}of { a: 1; b: 2 };',
        blanks: [{ id: 'b1', answer: 'key' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Chaves do objeto',
      prompt: 'Escreva uma expressão: **`Object.keys({a:1,b:2}).length`**.',
      explanation: '2 chaves.',
      xpReward: 22,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '2' }] },
    },
  ]);

  const lT4 = await prisma.lesson.create({
    data: {
      moduleId: modT2.id,
      slug: 'satisfies',
      title: 'satisfies e const assertions',
      objective: 'Fixar formas literais sem perder inferência.',
      estimatedMinutes: 9,
      orderIndex: 1,
      contentMd: `## satisfies (TS 4.9+)

\`satisfies\` valida que um objeto **cumpre** um tipo sem **alargar** a inferência para o tipo alvo — preserva literais onde importa.

\`as const\` congela literais e torna tuplas readonly.`,
    },
  });

  await exercisesForLesson(lT4.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'as const',
      prompt: '`as const` em um array literal costuma:',
      explanation: 'Torna o array readonly e preserva tipos literais dos elementos.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Converter para Set',
          'Estreitar literais e readonly',
          'Executar no runtime',
          'Remover tipos',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Freeze conceitual',
      prompt: 'Em JS puro, **Object.___** congela propriedades próprias (raso).',
      explanation: '`Object.freeze`.',
      xpReward: 17,
      gemReward: 2,
      payload: {
        template: 'Object.{{b1}}({ x: 1 });',
        blanks: [{ id: 'b1', answer: 'freeze' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Comprimento de array',
      prompt: 'Escreva uma expressão que retorne **`.length`** de **`[1,2,3]`** (JavaScript puro; o site avalia JS no servidor).',
      explanation: 'Três elementos → 3.',
      xpReward: 22,
      gemReward: 2,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '3' }],
      },
    },
  ]);

  const courseTsB = await prisma.course.create({
    data: {
      slug: 'ts-apis-projeto',
      title: 'TypeScript em projetos reais',
      description: 'Módulos, tipos de API e estratégias de strictness.',
      orderIndex: courseOrder(6, 1),
      isFree: true,
      autoEnrollOnAuth: false,
    },
  });

  const modT3 = await prisma.module.create({
    data: { courseId: courseTsB.id, slug: 'modulos-resolucao', title: 'Módulos e paths', orderIndex: 0 },
  });

  const lT5 = await prisma.lesson.create({
    data: {
      moduleId: modT3.id,
      slug: 'esm-vs-cjs',
      title: 'ESM vs CJS no Node',
      objective: 'Entender interop e extensões de arquivo.',
      estimatedMinutes: 10,
      orderIndex: 0,
      contentMd: `## Módulos

**ESM** (\`import/export\`) é o padrão moderno; **CJS** (\`require\`) ainda é comum. Em projetos mistos, atenção a \`__dirname\`, \`import.meta.url\` e tipos de pacotes (\`"type": "module"\`).`,
    },
  });

  await exercisesForLesson(lT5.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'import.meta',
      prompt: 'Em ESM, informações de módulo costumam vir de:',
      explanation: '`import.meta` (ex.: `import.meta.url`).',
      xpReward: 16,
      gemReward: 2,
      payload: {
        options: ['require.extensions', 'import.meta', 'window.module', 'PHP include'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Export nomeado',
      prompt: 'Complete a palavra-chave para exportar um binding nomeado em ESM.',
      explanation: '`export`',
      xpReward: 15,
      gemReward: 2,
      payload: {
        template: '{{b1}} const pi = 3.14;',
        blanks: [{ id: 'b1', answer: 'export' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Valor booleano de array vazio',
      prompt: 'Escreva uma expressão JavaScript: **`Boolean([])`** — o resultado deve ser **`true`**.',
      explanation: 'Array vazio é um objeto truthy em JavaScript.',
      xpReward: 20,
      gemReward: 2,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: 'true' }],
      },
    },
  ]);

  const lT6 = await prisma.lesson.create({
    data: {
      moduleId: modT3.id,
      slug: 'strict-tsconfig',
      title: 'strict no tsconfig',
      objective: 'Entender flags que endurecem a checagem.',
      estimatedMinutes: 9,
      orderIndex: 1,
      contentMd: `## strict

Com \`"strict": true\` você habilita um conjunto de verificações (incluindo \`noImplicitAny\` em versões recentes do conjunto). Isso pega erros cedo, mas pode exigir tipar imports e APIs legadas.

Combine com \`noUncheckedIndexedAccess\` e \`exactOptionalPropertyTypes\` conforme a maturidade do time.`,
    },
  });

  await exercisesForLesson(lT6.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'strictNullChecks',
      prompt: 'Com **strictNullChecks**, o TypeScript passa a exigir tratamento explícito de:',
      explanation: '`null` e `undefined` em fluxos onde podem ocorrer.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        options: ['Apenas strings', 'Valores nulos/indefinidos em tipos', 'CSS', 'Imports de imagem'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Comentário de tipo',
      prompt: 'Em TS, anotação de retorno após parênteses: **): ___**',
      explanation: 'Tipo de retorno explícito, ex.: `number`.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        template: 'function f(): {{b1}} { return 1; }',
        blanks: [{ id: 'b1', answer: 'number' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'ParseInt',
      prompt: 'Escreva uma expressão: **`parseInt("42", 10)`**.',
      explanation: 'Resultado numérico 42.',
      xpReward: 22,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '42' }] },
    },
  ]);

  const modT4 = await prisma.module.create({
    data: { courseId: courseTsB.id, slug: 'tipagem-apis', title: 'Tipando APIs', orderIndex: 1 },
  });

  const lT7 = await prisma.lesson.create({
    data: {
      moduleId: modT4.id,
      slug: 'zod-intro',
      title: 'Validação em runtime (visão geral)',
      objective: 'Combinar tipos estáticos com validação na borda.',
      estimatedMinutes: 10,
      orderIndex: 0,
      contentMd: `## Schema na borda

Bibliotecas como **Zod** ou **Valibot** permitem validar JSON de APIs em runtime e inferir tipos TypeScript. Assim você não confia cegamente em dados externos.

Fluxo típico: \`fetch\` → \`json()\` → \`schema.parse(data)\` → usar tipos estreitos.`,
    },
  });

  await exercisesForLesson(lT7.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Por que validar',
      prompt: 'Validar o corpo da resposta HTTP é importante porque:',
      explanation: 'O servidor pode mudar, falhar ou ser comprometido; o cliente não controla o formato em runtime.',
      xpReward: 17,
      gemReward: 2,
      payload: {
        options: [
          'TypeScript garante isso em runtime sozinho',
          'Dados externos não são garantidos pelo compilador',
          'JSON não existe',
          'fetch só retorna string',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Parse JSON',
      prompt: 'Complete o método global que converte string JSON em valor JS.',
      explanation: '`JSON.parse`.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: "const v = JSON.{{b1}}('{\"a\":1}');",
        blanks: [{ id: 'b1', answer: 'parse' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Acesso seguro',
      prompt: 'Escreva uma expressão: **`({ a: 1 }).a`**.',
      explanation: 'Propriedade a vale 1.',
      xpReward: 20,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '1' }] },
    },
  ]);

  const lT8 = await prisma.lesson.create({
    data: {
      moduleId: modT4.id,
      slug: 'erros-result',
      title: 'Result e erros tipados',
      objective: 'Modelar falhas sem exceções invisíveis.',
      estimatedMinutes: 8,
      orderIndex: 1,
      contentMd: `## Padrão Result

Em vez de lançar para fluxos esperados, retorne \`{ ok: true, value }\` ou \`{ ok: false, error }\`. Isso documenta falhas na assinatura e facilita testes.

Em TS, uniões discriminadas com campo \`ok\` são um ótimo encaixe.`,
    },
  });

  await exercisesForLesson(lT8.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Discriminação',
      prompt: 'Uma união discriminada usa um campo comum (ex.: kind/status) para:',
      explanation: 'Permitir narrowing seguro em cada ramo.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Remover tipos',
          'Guiar o narrowing em switch/if',
          'Substituir JavaScript',
          'Gerar SQL',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Throw',
      prompt: 'Complete: lançar um erro em JS com a palavra-chave ___',
      explanation: '`throw`.',
      xpReward: 14,
      gemReward: 1,
      payload: {
        template: '{{b1}} new Error("falhou");',
        blanks: [{ id: 'b1', answer: 'throw' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Ok ou não',
      prompt: 'Escreva uma expressão: **`({ ok: true }).ok`**.',
      explanation: 'Valor booleano true.',
      xpReward: 20,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: 'true' }] },
    },
  ]);

  // --- APIs REST e HTTP ---
  const courseApiA = await prisma.course.create({
    data: {
      slug: 'http-fundamentos',
      title: 'HTTP na prática',
      description: 'Métodos, cabeçalhos, corpo e idempotência.',
      orderIndex: courseOrder(7, 0),
      isFree: true,
      autoEnrollOnAuth: true,
      tagline: 'Contratos claros entre cliente e servidor.',
      ...landingForCourse('apis-rest-http'),
    },
  });

  const modApi1 = await prisma.module.create({
    data: { courseId: courseApiA.id, slug: 'verbos-recursos', title: 'Verbos e recursos', orderIndex: 0 },
  });

  const lApi1 = await prisma.lesson.create({
    data: {
      moduleId: modApi1.id,
      slug: 'rest-recursos',
      title: 'REST como recursos',
      objective: 'Modelar URLs e métodos em torno de recursos.',
      estimatedMinutes: 9,
      orderIndex: 0,
      contentMd: `## REST pragmático

**Recursos** são substantivos (\`/users\`, \`/orders/:id\`). **Verbos** HTTP expressam a intenção: GET ler, POST criar, PUT/PATCH substituir/atualizar, DELETE remover.

**Idempotência**: repetir GET/PUT/DELETE com o mesmo efeito é seguro em muitos designs; POST de criação normalmente não.`,
    },
  });

  await exercisesForLesson(lApi1.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Criação',
      prompt: 'Qual método HTTP é o mais comum para **criar** um recurso em APIs RESTful?',
      explanation: 'POST no coleção (`/items`) com corpo costuma criar.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        options: ['GET', 'POST', 'TRACE', 'OPTIONS'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Código sem conteúdo',
      prompt: 'Complete o código HTTP clássico para sucesso sem corpo (ex.: delete).',
      explanation: '`204` No Content.',
      xpReward: 18,
      gemReward: 2,
      payload: {
        template: 'res.status({{b1}}).send();',
        blanks: [{ id: 'b1', answer: '204' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Método GET',
      prompt: 'Escreva uma expressão string: **`"GET".toUpperCase()`**.',
      explanation: 'Permanece "GET".',
      xpReward: 18,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '"GET"' }] },
    },
  ]);

  const lApi2 = await prisma.lesson.create({
    data: {
      moduleId: modApi1.id,
      slug: 'status-codes',
      title: 'Códigos de status',
      objective: 'Interpretar 2xx, 4xx e 5xx.',
      estimatedMinutes: 8,
      orderIndex: 1,
      contentMd: `## Famílias

- **2xx** — sucesso (200 OK, 201 Created, 204 No Content)
- **4xx** — erro do cliente (400, 401, 403, 404, 409…)
- **5xx** — erro do servidor

**401 vs 403**: não autenticado vs sem permissão (definições podem variar; documente sua API).`,
    },
  });

  await exercisesForLesson(lApi2.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Não encontrado',
      prompt: 'Quando o recurso não existe, o código mais típico é:',
      explanation: '`404 Not Found` para URI inexistente ou recurso ausente.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: ['200', '404', '302', '500'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Conflito',
      prompt: 'Código comum quando há conflito de estado (ex.: duplicata): **409** ___',
      explanation: 'Conflict.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: 'HTTP 409 {{b1}}',
        blanks: [{ id: 'b1', answer: 'Conflict' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Soma status',
      prompt: 'Escreva uma expressão: **400 + 4** (brincadeira numérica — resultado **404**).',
      explanation: '404.',
      xpReward: 20,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '404' }] },
    },
  ]);

  const modApi2 = await prisma.module.create({
    data: { courseId: courseApiA.id, slug: 'json-media', title: 'JSON e Content-Type', orderIndex: 1 },
  });

  const lApi3 = await prisma.lesson.create({
    data: {
      moduleId: modApi2.id,
      slug: 'application-json',
      title: 'application/json',
      objective: 'Enviar e receber JSON corretamente.',
      estimatedMinutes: 7,
      orderIndex: 0,
      contentMd: `## JSON

Use \`Content-Type: application/json; charset=utf-8\` ao enviar corpo JSON. No cliente, \`JSON.stringify\` serializa; no servidor, parse com cuidado com tamanho e validação.`,
    },
  });

  await exercisesForLesson(lApi3.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Tipo de mídia',
      prompt: 'O tipo MIME mais comum para APIs JSON é:',
      explanation: '`application/json`.',
      xpReward: 14,
      gemReward: 2,
      payload: {
        options: ['text/plain', 'application/json', 'image/png', 'multipart/redis'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: ' stringify ',
      prompt: 'Complete: **JSON.___** converte valor JS em string JSON.',
      explanation: '`stringify`.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        template: 'JSON.{{b1}}({ x: 1 })',
        blanks: [{ id: 'b1', answer: 'stringify' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Parse número',
      prompt: 'Escreva uma expressão: **`Number("42")`**.',
      explanation: '42.',
      xpReward: 20,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '42' }] },
    },
  ]);

  const lApi4 = await prisma.lesson.create({
    data: {
      moduleId: modApi2.id,
      slug: 'fetch-basico',
      title: 'fetch no navegador',
      objective: 'Fazer requisições e tratar erros de rede.',
      estimatedMinutes: 9,
      orderIndex: 1,
      contentMd: `## fetch

\`fetch(url)\` retorna uma **Promise**. Verifique \`response.ok\` — erros HTTP não rejeitam a promise por padrão.

Use \`AbortController\` para cancelar requisições (timeouts, unmount de componente).`,
    },
  });

  await exercisesForLesson(lApi4.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Erro 500',
      prompt: 'Uma resposta HTTP 500 indica:',
      explanation: 'Falha no servidor ao processar a requisição.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Cliente não autenticado',
          'Erro interno no servidor',
          'Recurso não encontrado',
          'Redirecionamento permanente',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Promise',
      prompt: 'Complete: **async** funções retornam uma ___.',
      explanation: 'Promise.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: 'async function f() { return 1; } // retorna {{b1}}',
        blanks: [{ id: 'b1', answer: 'Promise' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Encadeamento',
      prompt: 'Escreva uma expressão: **`Promise.resolve(3).then(x => x * 2)`** (resultado assíncrono resolvido: use `.then` retorna Promise — para o MVP, use **`6`** como expressão direta).',
      explanation: 'Valor final 6 — expressão simples: `6`.',
      xpReward: 22,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '6' }] },
    },
  ]);

  const courseApiB = await prisma.course.create({
    data: {
      slug: 'api-design',
      title: 'Design de APIs',
      description: 'Versionamento, paginação, erros e documentação.',
      orderIndex: courseOrder(7, 1),
      isFree: true,
      autoEnrollOnAuth: false,
    },
  });

  const modApi3 = await prisma.module.create({
    data: { courseId: courseApiB.id, slug: 'paginacao', title: 'Paginação e filtros', orderIndex: 0 },
  });

  const lApi5 = await prisma.lesson.create({
    data: {
      moduleId: modApi3.id,
      slug: 'cursor-offset',
      title: 'Offset vs cursor',
      objective: 'Escolher estratégia de paginação.',
      estimatedMinutes: 8,
      orderIndex: 0,
      contentMd: `## Paginação

**Offset/limit** é simples, mas pode ser instável se dados mudam durante a navegação.

**Cursor** (token opaco) tende a ser mais estável em feeds grandes. Documente ordenação e tie-breakers.`,
    },
  });

  await exercisesForLesson(lApi5.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Estabilidade',
      prompt: 'Em feeds muito dinâmicos, cursor costuma ser preferível a offset porque:',
      explanation: 'Reduz saltos/duplicatas quando itens entram ou saem entre páginas.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        options: [
          'É mais lento sempre',
          'Lida melhor com mudanças entre requisições',
          'Elimina banco de dados',
          'Só funciona com GraphQL',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Query string',
      prompt: 'Complete o separador típico entre parâmetros em query string.',
      explanation: '`&` liga pares chave=valor.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        template: '?page=1{{b1}}limit=20',
        blanks: [{ id: 'b1', answer: '&' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Slice paginação',
      prompt: 'Escreva uma expressão: **`[10,20,30,40].slice(1,3)`** — JSON do resultado.',
      explanation: '`[20,30]`.',
      xpReward: 24,
      gemReward: 3,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '[20,30]' }] },
    },
  ]);

  const lApi6 = await prisma.lesson.create({
    data: {
      moduleId: modApi3.id,
      slug: 'erros-padrao',
      title: 'Formato de erro',
      objective: 'Padronizar corpo de erro com código, mensagem e rastreio.',
      estimatedMinutes: 7,
      orderIndex: 1,
      contentMd: `## Corpo de erro

Retorne JSON com **código de erro de negócio**, mensagem amigável e **request id** para suporte. Evite vazar stack trace em produção.`,
    },
  });

  await exercisesForLesson(lApi6.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Segurança',
      prompt: 'Em produção, stack traces completos no cliente costumam ser:',
      explanation: 'Evitados — podem expor caminhos e detalhes internos.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: ['Sempre enviados', 'Evitados ou filtrados', 'Obrigatórios', 'Substitutos do HTTP'],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Cabeçalho de correlação',
      prompt: 'Cabeçalho comum para rastrear requisição ponta a ponta: **X-___-Id**',
      explanation: '`Request` (ex.: X-Request-Id).',
      xpReward: 17,
      gemReward: 2,
      payload: {
        template: 'X-{{b1}}-Id: uuid',
        blanks: [{ id: 'b1', answer: 'Request' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Mensagem de erro',
      prompt: 'Escreva uma expressão: **`JSON.stringify({ error: "x" })`**.',
      explanation: 'String JSON.',
      xpReward: 22,
      gemReward: 2,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '{"error":"x"}' }],
      },
    },
  ]);

  const modApi4 = await prisma.module.create({
    data: { courseId: courseApiB.id, slug: 'seguranca-api', title: 'Segurança em APIs', orderIndex: 1 },
  });

  const lApi7 = await prisma.lesson.create({
    data: {
      moduleId: modApi4.id,
      slug: 'cors-basico',
      title: 'CORS — o básico',
      objective: 'Entender por que o navegador bloqueia chamadas cross-origin.',
      estimatedMinutes: 8,
      orderIndex: 0,
      contentMd: `## CORS

Navegadores aplicam **Same-Origin Policy**. Para APIs em outro domínio, o servidor deve responder com cabeçalhos CORS adequados (\`Access-Control-Allow-Origin\`, etc.) em preflight OPTIONS quando necessário.

Servidor a servidor (Node chamando API) **não** sofre CORS do browser.`,
    },
  });

  await exercisesForLesson(lApi7.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Onde CORS aplica',
      prompt: 'CORS é aplicado principalmente por:',
      explanation: 'Política de segurança do navegador em requisições cross-origin.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        options: [
          'O banco de dados MySQL',
          'O navegador (política de origem)',
          'O sistema de arquivos',
          'Somente WebSockets',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Origem',
      prompt: 'Complete: esquema + host + porta definem a ___ no browser.',
      explanation: 'Origin.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        template: 'Mesma {{b1}} = mesmo protocolo, host e porta.',
        blanks: [{ id: 'b1', answer: 'origin' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'URL origin',
      prompt: 'Escreva uma expressão: **`new URL("https://a.com/b").origin`**.',
      explanation: '`https://a.com`',
      xpReward: 24,
      gemReward: 3,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '"https://a.com"' }] },
    },
  ]);

  const lApi8 = await prisma.lesson.create({
    data: {
      moduleId: modApi4.id,
      slug: 'auth-bearer',
      title: 'Authorization Bearer',
      objective: 'Enviar tokens de acesso em cabeçalho.',
      estimatedMinutes: 7,
      orderIndex: 1,
      contentMd: `## Bearer

APIs costumam esperar \`Authorization: Bearer <token>\`. **Nunca** commite tokens; use variáveis de ambiente e secrets no CI.

Rotacione tokens vazados e prefira escopos mínimos.`,
    },
  });

  await exercisesForLesson(lApi8.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Onde não colocar token',
      prompt: 'Evite colocar tokens sensíveis em:',
      explanation: 'URLs podem vazar em logs e histórico; prefira cabeçalhos ou cookies com flags corretas.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Cabeçalho Authorization',
          'Query string pública em links compartilháveis',
          'Variável de ambiente no servidor',
          'Memória volátil no cliente',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Esquema Bearer',
      prompt: 'Complete o prefixo típico: Authorization: ___ token',
      explanation: '`Bearer`.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: 'Authorization: {{b1}} eyJ...',
        blanks: [{ id: 'b1', answer: 'Bearer' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Começa com Bearer',
      prompt: 'Escreva uma expressão: **`"Bearer x".startsWith("Bearer")`**.',
      explanation: 'true.',
      xpReward: 20,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: 'true' }] },
    },
  ]);

  // --- Qualidade, testes e entrega ---
  const courseQaA = await prisma.course.create({
    data: {
      slug: 'testes-piramide',
      title: 'Pirâmide de testes',
      description: 'Unitário, integração e E2E — onde investir.',
      orderIndex: courseOrder(8, 0),
      isFree: true,
      autoEnrollOnAuth: true,
      tagline: 'Confiança para mudar código sem medo.',
      ...landingForCourse('qualidade-testes'),
    },
  });

  const modQ1 = await prisma.module.create({
    data: { courseId: courseQaA.id, slug: 'unitarios', title: 'Testes unitários', orderIndex: 0 },
  });

  const lQ1 = await prisma.lesson.create({
    data: {
      moduleId: modQ1.id,
      slug: 'aaa-pattern',
      title: 'Arrange, Act, Assert',
      objective: 'Estruturar testes legíveis.',
      estimatedMinutes: 7,
      orderIndex: 0,
      contentMd: `## AAA

1. **Arrange** — prepare dados e mocks
2. **Act** — execute a unidade sob teste
3. **Assert** — verifique o resultado

Um teste deve falhar por **um** motivo claro; evite mil assertivas genéricas.`,
    },
  });

  await exercisesForLesson(lQ1.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Foco',
      prompt: 'Testes unitários costumam ser rápidos porque:',
      explanation: 'Isolam dependências externas com doubles/mocks.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Sempre rodam no navegador real',
          'Evitam I/O real ao isolar dependências',
          'Não precisam de assertions',
          'Substituem code review',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Igualdade em teste',
      prompt: 'Em Jest/Vitest, matchers comuns: **expect(x).to___(y)**',
      explanation: '`toBe` para igualdade estrita de primitivos.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: 'expect(1 + 1).{{b1}}(2);',
        blanks: [{ id: 'b1', answer: 'toBe' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Soma testável',
      prompt: 'Escreva uma expressão: função que soma **a** e **b** — **`((a,b)=>a+b)(20,22)`**.',
      explanation: '42.',
      xpReward: 24,
      gemReward: 3,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '42' }] },
    },
  ]);

  const lQ2 = await prisma.lesson.create({
    data: {
      moduleId: modQ1.id,
      slug: 'tdd-intro',
      title: 'TDD em doses homeopáticas',
      objective: 'Escrever o teste antes quando o comportamento é incerto.',
      estimatedMinutes: 8,
      orderIndex: 1,
      contentMd: `## TDD

Red → Green → Refactor. Útil quando o comportamento é fino e você quer feedback rápido. Não precisa ser religioso em protótipos exploratórios.`,
    },
  });

  await exercisesForLesson(lQ2.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Ciclo TDD',
      prompt: 'No TDD clássico, após escrever um teste que falha, o próximo passo é:',
      explanation: 'Implementar o mínimo para passar (Green).',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Refatorar antes de passar',
          'Implementar o mínimo para o teste passar',
          'Apagar o teste',
          'Fazer deploy',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Mock',
      prompt: 'Complete: **jest.fn** ou **vi.fn** cria uma função ___.',
      explanation: 'Mock / spy.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: 'const f = vi.{{b1}}();',
        blanks: [{ id: 'b1', answer: 'fn' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Dobro',
      prompt: 'Escreva uma expressão: **`[1,2,3].map(n => n * 2).reduce((a,b)=>a+b,0)`**.',
      explanation: '2+4+6=12.',
      xpReward: 26,
      gemReward: 3,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '12' }] },
    },
  ]);

  const modQ2 = await prisma.module.create({
    data: { courseId: courseQaA.id, slug: 'integracao', title: 'Integração e contratos', orderIndex: 1 },
  });

  const lQ3 = await prisma.lesson.create({
    data: {
      moduleId: modQ2.id,
      slug: 'testcontainers-visao',
      title: 'Banco em testes de integração',
      objective: 'Subir dependências reais com containers ou serviços efêmeros.',
      estimatedMinutes: 9,
      orderIndex: 0,
      contentMd: `## Integração

Testes de integração validam **módulos juntos** (app + DB). Ferramentas como Testcontainers sobem Postgres/MySQL em CI de forma reprodutível.

Contratos entre serviços podem usar **Pact** ou testes de schema.`,
    },
  });

  await exercisesForLesson(lQ3.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Custo',
      prompt: 'Testes de integração tendem a ser mais lentos que unitários porque:',
      explanation: 'Envolvem mais subsistemas reais ou próximos do real.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Não usam assertions',
          'Acoplam mais componentes e I/O',
          'Roda só no Friday',
          'Só testam CSS',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Variável de ambiente',
      prompt: 'Em Node, acesse env com **process.___**',
      explanation: '`process.env`.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        template: 'const url = process.{{b1}}.DATABASE_URL;',
        blanks: [{ id: 'b1', answer: 'env' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Concat DB',
      prompt: 'Escreva uma expressão: **`"postgres://".length`**.',
      explanation: '12 caracteres.',
      xpReward: 20,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '12' }] },
    },
  ]);

  const lQ4 = await prisma.lesson.create({
    data: {
      moduleId: modQ2.id,
      slug: 'e2e-smoke',
      title: 'E2E e smoke tests',
      objective: 'Validar fluxos críticos ponta a ponta.',
      estimatedMinutes: 8,
      orderIndex: 1,
      contentMd: `## E2E

Playwright/Cypress simulam usuário real. Use para **fluxos críticos** (login, checkout). São caros — mantenha poucos, estáveis e paralelizáveis.

**Smoke** após deploy verifica se o site “respira”.`,
    },
  });

  await exercisesForLesson(lQ4.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Quando E2E',
      prompt: 'E2E é mais indicado para:',
      explanation: 'Garantir jornadas completas e integração de camadas.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Testar cada função pura isoladamente',
          'Validar jornadas críticas de usuário',
          'Substituir monitoramento',
          'Compilar TypeScript',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Seletor estável',
      prompt: 'Prefira seletores por **data-___** em testes E2E.',
      explanation: '`data-testid`.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: '[{{b1}}-testid="submit"]',
        blanks: [{ id: 'b1', answer: 'data' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Clique duplo',
      prompt: 'Escreva uma expressão: **`2 * 21`**.',
      explanation: '42.',
      xpReward: 20,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '42' }] },
    },
  ]);

  const courseQaB = await prisma.course.create({
    data: {
      slug: 'ci-observabilidade',
      title: 'CI e observabilidade',
      description: 'Pipelines, logs, métricas e erros em produção.',
      orderIndex: courseOrder(8, 1),
      isFree: true,
      autoEnrollOnAuth: false,
    },
  });

  const modQ3 = await prisma.module.create({
    data: { courseId: courseQaB.id, slug: 'pipelines', title: 'Pipelines', orderIndex: 0 },
  });

  const lQ5 = await prisma.lesson.create({
    data: {
      moduleId: modQ3.id,
      slug: 'git-ci',
      title: 'GitHub Actions / CI',
      objective: 'Automatizar lint, testes e build.',
      estimatedMinutes: 8,
      orderIndex: 0,
      contentMd: `## CI

Pipeline típico: **install** → **lint** → **test** → **build**. Falhas rápidas economizam tempo humano.

Cache de dependências acelera runs. Matrizes testam múltiplas versões de Node.`,
    },
  });

  await exercisesForLesson(lQ5.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Objetivo do CI',
      prompt: 'Integração contínua busca principalmente:',
      explanation: 'Detectar problemas cedo ao integrar mudanças frequentemente.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Eliminar code review humano',
          'Feedback rápido sobre saúde do build',
          'Desligar staging',
          'Substituir Git',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Falha de job',
      prompt: 'Em YAML de Actions, um passo que falha faz o job falhar com código de saída ___ zero.',
      explanation: 'Diferente de zero.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: 'exit code !== {{b1}}',
        blanks: [{ id: 'b1', answer: '0' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Versão Node',
      prompt: 'Escreva uma expressão: **`parseInt(process.versions.node.split(".")[0], 10) > 0`** — simplifique para **`true`** se sua versão for positiva (use **`true`** literal).',
      explanation: 'true.',
      xpReward: 18,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: 'true' }] },
    },
  ]);

  const lQ6 = await prisma.lesson.create({
    data: {
      moduleId: modQ3.id,
      slug: 'logs-estruturados',
      title: 'Logs estruturados',
      objective: 'JSON logs com correlação.',
      estimatedMinutes: 7,
      orderIndex: 1,
      contentMd: `## Logs

Prefira **JSON** com campos estáveis (\`level\`, \`msg\`, \`requestId\`, \`userId\` hash). Ferramentas agregam e filtram melhor que strings livres.

Níveis: error, warn, info, debug — com sampling em alto volume.`,
    },
  });

  await exercisesForLesson(lQ6.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Correlação',
      prompt: 'request id em logs ajuda a:',
      explanation: 'Rastrear uma requisição através de múltiplos serviços.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        options: [
          'Criptografar senhas',
          'Correlacionar eventos da mesma requisição',
          'Aumentar bundle',
          'Desabilitar HTTPS',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Nível de log',
      prompt: 'Nível típico para condições anômalas recuperáveis: ___.',
      explanation: '`warn`.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        template: 'logger.{{b1}}("retry em 1s");',
        blanks: [{ id: 'b1', answer: 'warn' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'JSON nível',
      prompt: 'Escreva uma expressão: **`JSON.stringify({ level: "info" }).includes("info")`**.',
      explanation: 'true.',
      xpReward: 20,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: 'true' }] },
    },
  ]);

  const modQ4 = await prisma.module.create({
    data: { courseId: courseQaB.id, slug: 'prod-qualidade', title: 'Produção e qualidade', orderIndex: 1 },
  });

  const lQ7 = await prisma.lesson.create({
    data: {
      moduleId: modQ4.id,
      slug: 'feature-flags',
      title: 'Feature flags',
      objective: 'Lançar código em produção desligado por flag.',
      estimatedMinutes: 8,
      orderIndex: 0,
      contentMd: `## Flags

Permitem **deploy** separado de **liberação**. Combine com percentuais, allowlists e kill switch para incidentes.

Documente dono da flag e data de remoção para evitar débito eterno.`,
    },
  });

  await exercisesForLesson(lQ7.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Deploy vs release',
      prompt: 'Feature flags ajudam a:',
      explanation: 'Separar implantação binária da exposição a usuários.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        options: [
          'Evitar testes',
          'Controlar exposição sem novo deploy',
          'Remover HTTPS',
          'Desativar logs',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Boolean em env',
      prompt: 'Complete: **process.env.FF === "___"** para flag ligada.',
      explanation: 'Comum comparar com `"true"` ou `"1"`.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: 'const on = process.env.FF === "{{b1}}";',
        blanks: [{ id: 'b1', answer: 'true' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Flag JSON',
      prompt:
        'Escreva uma expressão equivalente a **`JSON.parse(\'{"on":true}\').on`** (valor booleano **true**).',
      explanation: 'true.',
      xpReward: 24,
      gemReward: 3,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: 'true' }] },
    },
  ]);

  const lQ8 = await prisma.lesson.create({
    data: {
      moduleId: modQ4.id,
      slug: 'revisao-codigo',
      title: 'Revisão de código humana',
      objective: 'PRs pequenos, contexto e empatia.',
      estimatedMinutes: 7,
      orderIndex: 1,
      contentMd: `## Code review

PRs **pequenos** revisam melhor. Explique o **porquê**, não só o **o quê**. Ferramentas automatizam formatação; humanos avaliam arquitetura e riscos.

Incentivo a cultura de aprendizado, não de culpa.`,
    },
  });

  await exercisesForLesson(lQ8.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Tamanho do PR',
      prompt: 'PRs muito grandes tendem a:',
      explanation: 'Receber revisão superficial e aumentar risco.',
      xpReward: 14,
      gemReward: 2,
      payload: {
        options: [
          'Sempre serem melhores',
          'Serem mais difíceis de revisar com profundidade',
          'Eliminar bugs por mágica',
          'Substituir CI',
        ],
        correctIndex: 1,
      },
    },
    {
      type: ExerciseType.CODE_FILL,
      title: 'Comentário construtivo',
      prompt: 'Complete: feedback em PR deve ser ___ e específico.',
      explanation: 'Respeitoso / construtivo.',
      xpReward: 15,
      gemReward: 2,
      payload: {
        template: 'Comentário {{b1}} e acionável.',
        blanks: [{ id: 'b1', answer: 'respeitoso' }],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Diff mínimo',
      prompt: 'Escreva uma expressão: **`Math.max(1, 5 - 3)`**.',
      explanation: '2.',
      xpReward: 20,
      gemReward: 2,
      payload: { language: 'javascript', starterCode: '', tests: [{ expected: '2' }] },
    },
  ]);
}
