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

const DEFAULT_CODE_PROGRESSIVE_HINTS: [string, string] = [
  'O ambiente avalia **uma expressão** (não use `return` no topo). O valor final deve bater com o enunciado.',
  'Confira **tipos**: número sem aspas; string entre aspas; arrays `[]` e objetos `{}` com sintaxe válida em JavaScript.',
];

function withProgressiveHintsIfMissing(item: ExCreate): Record<string, unknown> {
  const p = item.payload as Record<string, unknown>;
  if (
    (item.type === ExerciseType.CODE_EDITOR ||
      item.type === ExerciseType.CODE_FILL) &&
    !Array.isArray(p.hints)
  ) {
    return { ...p, hints: [...DEFAULT_CODE_PROGRESSIVE_HINTS] };
  }
  return p;
}

/** Rodapé pedagógico: lista o que será cobrado nos desafios (escola / uso público). */
function blocoPraticaDesafios(itens: string[]): string {
  const lista = itens.map((t) => `- ${t}`).join('\n');
  return `\n\n---\n\n### O que você vai praticar nesta aula\n\n${lista}\n\n> **Dica de estudo:** leia até o fim antes de abrir os desafios. Na versão atual da plataforma, o exercício com **editor de código** pede **uma expressão JavaScript** (sem JSX), avaliada no servidor — quando a aula é de React ou TypeScript, o texto acima explica o JS necessário.\n`;
}

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
        payload: withProgressiveHintsIfMissing(e) as object,
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
      objective:
        'Explicar o que é JSX, como a interpolação com chaves funciona e produzir uma string em JavaScript puro equivalente ao texto ensinado.',
      estimatedMinutes: 18,
      orderIndex: 0,
      contentMd: `## JSX no React

### Contexto

Esta aula é para quem está **começando em React** (incluindo uso em escola ou laboratório). É útil já conhecer **HTML** básico (tags como \`p\`, \`div\`) e **JavaScript** introdutório: variáveis, strings e funções. Tudo o que você precisa para os desafios está escrito abaixo.

### Objetivo verificável

Ao concluir a leitura e os desafios, você deve ser capaz de:

1. Dizer **o que acontece com JSX** antes de chegar ao navegador.
2. Usar **chaves \`{ }\`** no JSX para mostrar valores JavaScript.
3. Montar a **mesma frase** (\`Olá, dev\`) usando **JavaScript puro** (concatenação ou template literal), porque é assim que o editor de código da plataforma avalia nesta versão.

### O que é JSX?

O **JSX** é uma **sintaxe** parecida com HTML, usada em arquivos React. Ela **não** é executada diretamente pelo navegador: o **compilador** (Babel, SWC, Vite etc.) transforma JSX em chamadas JavaScript — em geral equivalentes a \`React.createElement(...)\`.

Isso permite escrever **interface** e **lógica** no mesmo arquivo de forma legível.

### Por que usar JSX?

- **Leitura**: a árvore da tela fica explícita no código.
- **Segurança**: textos dinâmicos costumam ser tratados de forma a reduzir risco de XSS.
- **Composição**: componentes são funções que **retornam JSX**; telas grandes viram peças pequenas reutilizáveis.

### Exemplo guiado passo a passo

1. Criamos uma **função** cujo nome começa com maiúscula (**PascalCase**): \`Saudacao\`.
2. Ela recebe \`props\`; aqui usamos **desestruturação** \`({ nome })\`.
3. O \`return\` devolve JSX: um \`<p>\` com texto fixo **e** o valor de \`nome\` entre **chaves**.

\`\`\`jsx
function Saudacao({ nome }) {
  return <p>Olá, {nome}!</p>;
}
\`\`\`

**Interpolação:** tudo que está dentro de \`{ }\` é uma **expressão JavaScript**. Sem as chaves, a palavra \`nome\` seria só texto literal na tela.

### JavaScript puro para o último desafio (leia com atenção)

O desafio com **editor de código** **não** usa JSX: você digita **uma expressão JavaScript** cujo **resultado** deve ser a string exata pedida no enunciado.

Duas formas comuns de montar texto:

**1) Concatenação com \`+\`**

\`\`\`js
"Olá, " + "dev"
\`\`\`

**2) Template literal (crase)**

\`\`\`js
\`Olá, dev\`
\`\`\`

Com variável: \`\` \`Olá, \${nome}\` \`\`. Nesta aula o enunciado pede o texto **fixo** \`Olá, dev\`, sem variável.

### Erros comuns

- Escrever \`nome\` no JSX **sem** \`{ }\` — o navegador mostra a palavra “nome”, não o valor.
- Achar que o navegador “entende JSX” sozinho — é preciso **build** no fluxo de desenvolvimento.
- No editor da plataforma, usar \`<p>\` ou JSX — o avaliador espera **expressão JS**, não marcação React.

### Boas práticas

- Um componente com **uma responsabilidade** clara.
- Nomes de componente em **PascalCase**.
- Lógica muito pesada: extrair para funções ou hooks (você verá hooks nas próximas aulas).${blocoPraticaDesafios([
        '**Quiz:** reconhecer o papel do compilador com JSX no ecossistema React.',
        '**Lacunas:** colocar `{` e `}` para interpolar a variável `nome` dentro do JSX (como no exemplo).',
        '**Expressão no editor:** gerar a string exata `Olá, dev` em JavaScript (concatenação ou crase), como explicado na seção “JavaScript puro”.',
      ])}`,
    },
  });

  await exercisesForLesson(lR1.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Natureza do JSX',
      prompt:
        'No ecossistema React, o JSX é tipicamente: *(Você já viu a seção “O que é JSX?” nesta aula.)*',
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
      prompt:
        'Complete para exibir a variável **nome** dentro do parágrafo. *(Revise o exemplo \`{nome}\` na seção “Exemplo guiado”.)*',
      explanation: 'Chaves \`{ }\` avaliam expressões JavaScript dentro do JSX.',
      xpReward: 20,
      gemReward: 2,
      payload: {
        template: 'function Demo({ nome }) {\n  return <p>{{b1}}nome{{b2}}</p>;\n}',
        blanks: [
          { id: 'b1', answer: '{' },
          { id: 'b2', answer: '}' },
        ],
        hints: [
          'No JSX, o valor dinâmico fica **entre chaves**: abra com `{` antes de `nome` e feche com `}` depois.',
          'Sem as chaves, o React mostraria a palavra literal `nome`, não o conteúdo da variável.',
        ],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Template de string',
      prompt:
        'Escreva **uma expressão** JavaScript cujo resultado seja a string exata **`Olá, dev`** (use **template literal** com crase ou **concatenação** com `+`). *(Leia a seção “JavaScript puro para o último desafio”.)*',
      explanation:
        'Exemplos válidos: `` `Olá, dev` `` ou `"Olá, " + "dev"`. O avaliador compara o valor final da expressão.',
      xpReward: 24,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '"Olá, dev"' }],
        hints: [
          'Template literal usa **crases**: `` `Olá, dev` `` — sem variáveis, o texto é fixo entre as crases.',
          'Com concatenação: `"Olá, " + "dev"` — duas strings com `+` viram uma só.',
        ],
      },
    },
  ]);

  const lR2 = await prisma.lesson.create({
    data: {
      moduleId: modR1.id,
      slug: 'props-imutaveis',
      title: 'Props e imutabilidade',
      objective:
        'Explicar props, fluxo unidirecional de dados e imutabilidade; praticar acesso a propriedades e `.length` em JavaScript.',
      estimatedMinutes: 16,
      orderIndex: 1,
      contentMd: `## Props e imutabilidade

### Contexto

Você já viu JSX e componentes como funções. Agora vamos ver **como o pai passa dados para o filho** usando **props** — conceito central do React. Para o exercício no **editor de código**, você usará **JavaScript puro**: objeto com **notação de ponto** e **tamanho de array** (\`.length\`).

### O que são props?

**Props** (properties) são argumentos que o **componente pai** passa para o **filho**. No filho, trate props como **somente leitura**: não altere objetos recebidos “no lugar”; em vez disso, o **pai** cria novo estado ou novas cópias e repassa de novo.

### Fluxo de dados (modelo mental)

- **Dados descem** pela árvore via props.
- Quando o filho precisa **avisar o pai** (ex.: clique), o pai passa uma **função callback** como prop; o filho **chama** a função — o estado continua sendo responsabilidade de quem “possui” os dados (em geral o pai ou um hook acima).

\`\`\`jsx
function Lista({ itens, onRemover }) {
  return itens.map((id) => <Item key={id} id={id} onRemover={onRemover} />);
}
\`\`\`

### key em listas

Ao usar \`.map\`, cada elemento irmão precisa de uma prop \`key\` **estável** (por exemplo o \`id\` do item). Isso ajuda o React a saber **qual item** mudou entre um render e outro.

### JavaScript que você usará no desafio do editor

- **Objeto:** \`const usuario = { nome: "Ana" }\` — a propriedade \`nome\` se acessa com **ponto**: \`usuario.nome\`.
- **Tamanho do array:** em JavaScript, \`[1, 2, 3].length\` vale **3** (número). O avaliador da plataforma compara o **valor** da sua expressão.

### Erros comuns

- Mutar array ou objeto de props no filho e esperar que o React “adivinhe” — prefira imutabilidade e estado no lugar certo.
- Usar **índice do map** como \`key\` quando a lista pode reordenar — pode causar bugs de estado em filhos.
- Confundir JSX com o editor de código: no desafio “tamanho”, a resposta é **expressão JS**, não JSX.${blocoPraticaDesafios([
        '**Quiz:** direção típica das props (pai → filhos).',
        '**Lacunas:** notação de ponto para ler `usuario.nome`.',
        '**Expressão no editor:** obter o número de elementos de `[1, 2, 3]` com `.length`.',
      ])}`,
    },
  });

  await exercisesForLesson(lR2.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Direção dos dados',
      prompt:
        'No modelo mental clássico do React, as props costumam fluir: *(Revise “Fluxo de dados” nesta aula.)*',
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
      prompt:
        'Complete para ler a propriedade **nome** do objeto **usuario**. *(Veja “JavaScript que você usará” — notação de ponto.)*',
      explanation: 'Notação de ponto: `usuario.nome`.',
      xpReward: 18,
      gemReward: 2,
      payload: {
        template: 'const usuario = { nome: "Ana" };\nconst x = usuario{{b1}}nome;',
        blanks: [{ id: 'b1', answer: '.' }],
        hints: [
          'Em objetos JavaScript, usamos um **ponto** entre o nome da variável e o nome da propriedade.',
          'O padrão é `objeto.propriedade` — aqui, `usuario` e em seguida `nome`.',
        ],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Tamanho de array',
      prompt:
        'Escreva **uma expressão** que retorne quantos elementos tem o array **`[1, 2, 3]`** *(use a propriedade `.length`)*.',
      explanation: '`[1,2,3].length` resulta em 3.',
      xpReward: 22,
      gemReward: 2,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '3' }],
        hints: [
          'Em JavaScript, todo array tem `.length` com o número de elementos.',
          'Exemplo: `[10, 20].length` vale 2 — aplique o mesmo ao array `[1, 2, 3]`.',
        ],
      },
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
      objective:
        'Explicar useState, atualização imutável com spread e somar um array com reduce em JavaScript.',
      estimatedMinutes: 20,
      orderIndex: 0,
      contentMd: `## useState na prática

### Contexto

Esta aula assume que você já sabe o que é um **componente de função** e **props**. Agora o tema é **estado local**: dados que **mudam com o tempo** e fazem a tela atualizar de novo (**re-render**).

### useState em palavras simples

\`useState(valorInicial)\` devolve um **par**:

1. O **valor atual** do estado.
2. Uma **função** (setter) para pedir um novo valor.

Quando você chama o setter, o React **marca** o componente para renderizar de novo com o valor novo.

### Atualização funcional

Se o próximo valor **depende** do anterior (ex.: contador +1), use a forma com **função**:

\`\`\`js
setContagem((c) => c + 1);
\`\`\`

Assim você sempre usa o valor **mais recente**, mesmo se houver várias atualizações em fila.

### Imutabilidade em arrays

**Não** faça \`arr.push(4)\` e guarde o mesmo array no state se a convenção for imutabilidade. Crie um **novo** array:

\`\`\`js
const novo = [...arr, 4];
\`\`\`

O **spread** \`...arr\` copia os elementos de \`arr\` para dentro do novo array.

### Somar números de um array com \`reduce\` (para o desafio do editor)

\`reduce\` “acumula” um valor percorrendo o array:

\`\`\`js
[10, 20, 12].reduce((a, b) => a + b, 0);
\`\`\`

- O **0** é o valor inicial do acumulador \`a\`.
- Para cada elemento \`b\`, somamos \`a + b\`.
- Resultado: \`10 + 20 + 12 = 42\`.

### Erros comuns

- Mutar objeto/array no state e não chamar o setter com um **novo** referencial.
- Guardar no state o que dá para **calcular** só a partir de props ou de outro state (estado derivado desnecessário).
- No editor da plataforma, esquecer o **valor inicial** \`, 0\` no \`reduce\` — sem ele, o primeiro passo pode se comportar de outro modo.${blocoPraticaDesafios([
        '**Quiz:** o que o setter do useState costuma provocar no componente.',
        '**Lacunas:** usar `...` (spread) para copiar o array e acrescentar `4`.',
        '**Expressão no editor:** somar `[10, 20, 12]` com `.reduce((a,b)=>a+b, 0)`.',
      ])}`,
    },
  });

  await exercisesForLesson(lR3.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Efeito do setter',
      prompt:
        'Ao chamar o setter retornado por useState com um novo valor, o React tipicamente: *(Seção “useState em palavras simples”.)*',
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
      prompt:
        'Complete para copiar **arr** e adicionar o elemento **4** no final. *(Seção “Imutabilidade em arrays”.)*',
      explanation: 'Spread cria um novo array: `[...arr, 4]`.',
      xpReward: 20,
      gemReward: 2,
      payload: {
        template: 'const arr = [1, 2, 3];\nconst novo = [{{b1}}arr, 4];',
        blanks: [{ id: 'b1', answer: '...' }],
        hints: [
          'O operador de spread em arrays são **três pontos** antes do nome do array.',
          'Sintaxe: `[...arr, 4]` — copia `arr` e coloca `4` no final.',
        ],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Soma com reduce',
      prompt:
        'Escreva **uma expressão** que some os números **`[10, 20, 12]`** usando **`.reduce((a, b) => a + b, 0)`**. *(Veja a seção “Somar números… com reduce”.)*',
      explanation: '10+20+12 = 42.',
      xpReward: 26,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '42' }],
        hints: [
          'Monte exatamente: `[10, 20, 12].reduce((a, b) => a + b, 0)` — ordem dos números e o `, 0` no final importam.',
          'O `reduce` percorre o array acumulando a soma em `a`; o resultado final é um único número.',
        ],
      },
    },
  ]);

  const lR4 = await prisma.lesson.create({
    data: {
      moduleId: modR2.id,
      slug: 'useeffect-visao-geral',
      title: 'useEffect — visão geral',
      objective:
        'Explicar quando useEffect roda, dependências e timers; praticar setTimeout e JSON.stringify em JavaScript.',
      estimatedMinutes: 22,
      orderIndex: 1,
      contentMd: `## useEffect — visão geral

### Contexto

Com **useState** você guarda dados na tela. Com **useEffect** você **sincroniza** o componente com o **mundo externo**: rede, temporizadores, assinaturas, APIs do navegador, etc. Esta aula também ensina o **JavaScript** usado nos desafios: \`setTimeout\` e \`JSON.stringify\`.

### O que \`useEffect\` faz?

\`useEffect(fn, deps)\` agenda a função \`fn\` para rodar **depois** que o React **commitou** a atualização na tela (na prática: após o render, em momento adequado ao navegador). Por isso efeitos são bons para coisas que **não** precisam bloquear o primeiro paint.

### Array de dependências

- **\`[]\`** — efeito roda **após a montagem** (e, se você **retornar** uma função, essa função é o **cleanup** na desmontagem).
- **\`[a, b]\`** — roda de novo quando \`a\` ou \`b\` mudam entre renders.
- **Omitir o array** — comportamento legado e fonte de bugs; **evite** em código novo.

### Limpeza (cleanup)

Quando você cria intervalo, listener ou assinatura, **libere** no retorno:

\`\`\`js
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
\`\`\`

### JavaScript: \`setTimeout\`

\`setTimeout(função, milissegundos)\` chama a função **uma vez** depois da espera:

\`\`\`js
const id = setTimeout(f, 1000); // chama f daqui a 1 segundo
\`\`\`

### JavaScript: \`JSON.stringify\`

Converte valor JavaScript em **string JSON**. Para o objeto \`{ ok: true }\`:

\`\`\`js
JSON.stringify({ ok: true }); // string '{"ok":true}' (aspas duplas nos nomes de chave em JSON)
\`\`\`

O avaliador da plataforma compara o **resultado** da sua expressão com o esperado.

### Erros comuns

- Esquecer dependências e o efeito usar valores **velhos** (stale closures).
- Não fazer cleanup de timer/subscription — vazamento de memória ou atualização em componente desmontado.
- Confundir \`setTimeout\` com \`setInterval\` (este repete, aquele agenda uma vez).${blocoPraticaDesafios([
        '**Quiz:** momento típico em que o useEffect executa o efeito.',
        '**Lacunas:** nome da função que agenda `f` para daqui a 1000 ms.',
        '**Expressão no editor:** produzir a mesma string que `JSON.stringify({ ok: true })`.',
      ])}`,
    },
  });

  await exercisesForLesson(lR4.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Momento do efeito',
      prompt:
        'useEffect roda após o React: *(Seção “O que useEffect faz?”)*',
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
      prompt:
        'Complete para agendar uma função **f** daqui a 1000 ms. *(Seção “JavaScript: setTimeout”.)*',
      explanation: '`setTimeout(f, 1000)`.',
      xpReward: 18,
      gemReward: 2,
      payload: {
        template: 'const id = {{b1}}(f, 1000);',
        blanks: [{ id: 'b1', answer: 'setTimeout' }],
        hints: [
          'A função global começa com **set** e termina com **Timeout**.',
          'Ordem dos argumentos: primeiro a função, depois os milissegundos.',
        ],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'JSON de objeto',
      prompt:
        'Escreva **uma expressão** que produza o **mesmo** valor que `JSON.stringify({ ok: true })`. *(Seção “JSON.stringify”.)*',
      explanation: 'Use `JSON.stringify({ ok: true })` — o resultado é a string JSON com aspas nas chaves.',
      xpReward: 24,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '{"ok":true}' }],
        hints: [
          'A forma mais direta é repetir a chamada pedida: `JSON.stringify({ ok: true })`.',
          'O resultado é uma **string**, não o objeto — por isso o texto fica entre aspas no protocolo JSON.',
        ],
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
      objective:
        'Explicar input controlado com value + onChange; praticar o handler onChange e o método .trim() em strings JavaScript.',
      estimatedMinutes: 18,
      orderIndex: 0,
      contentMd: `## Inputs controlados

### Contexto

Formulários são parte essencial de qualquer sistema. Em React, o padrão **controlado** liga o valor do \`<input>\` ao **estado** do componente. Para o desafio do **editor**, você usará o método de string \`.trim()\` em JavaScript.

### O que é um input controlado?

- A prop \`value\` do input vem de uma **variável de estado** (ex.: \`texto\`).
- Cada tecla ou alteração passa por \`onChange\`, que **atualiza** o estado (ex.: \`setTexto\`).

\`\`\`jsx
const [texto, setTexto] = useState("");
return <input value={texto} onChange={(e) => setTexto(e.target.value)} />;
\`\`\`

Assim, o estado é a **fonte da verdade**: validação, máscaras e testes ficam mais previsíveis.

### Handler \`onChange\`

Em React, convenciona-se usar a prop **\`onChange\`** (camelCase) recebendo uma função. O evento \`e\` traz \`e.target.value\` com o texto do campo.

### JavaScript: \`.trim()\`

Remove **espaços em branco no início e no fim** da string:

\`\`\`js
"  hi  ".trim(); // "hi"
\`\`\`

### Erros comuns

- Input “semi-controlado”: \`value\` sem atualizar no \`onChange\` — o campo pode travar ou ficar inconsistente.
- Esquecer que \`value\` em React espera **string** em inputs de texto (use \`""\` no estado inicial).
- No editor, confundir aspas: o resultado pedido é a string \`hi\`, representada em JSON como \`"hi"\`.${blocoPraticaDesafios([
        '**Quiz:** de onde vem o valor exibido em um input controlado típico.',
        '**Lacunas:** nome da prop de evento usada no exemplo com `setV(e.target.value)`.',
        '**Expressão no editor:** usar `.trim()` para remover espaços de `"  hi  "`.',
      ])}`,
    },
  });

  await exercisesForLesson(lR5.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Fonte da verdade',
      prompt:
        'Em um input controlado, o valor exibido costuma vir de: *(Seção “O que é um input controlado?”)*',
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
      prompt:
        'Complete o nome do handler típico de mudança em elementos de formulário no React. *(Veja o exemplo com `onChange`.)*',
      explanation: 'Em React DOM, `onChange` captura alterações de valor.',
      xpReward: 17,
      gemReward: 2,
      payload: {
        template: '<input {{b1}}={(e) => setV(e.target.value)} />',
        blanks: [{ id: 'b1', answer: 'onChange' }],
        hints: [
          'O nome começa com **on** e termina com **Change**, em camelCase.',
          'É o mesmo padrão de eventos sintéticos do React para campos de formulário.',
        ],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'String trim',
      prompt:
        'Escreva **uma expressão** que retorne **`"  hi  "`** sem espaços nas pontas. *(Seção “JavaScript: .trim()”.)*',
      explanation: '`"  hi  ".trim()` → `"hi"`.',
      xpReward: 22,
      gemReward: 2,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '"hi"' }],
        hints: [
          'Chame o método **trim** na string literal `"  hi  "`.',
          'Sintaxe: `"texto".trim()` — sem argumentos.',
        ],
      },
    },
  ]);

  const lR6 = await prisma.lesson.create({
    data: {
      moduleId: modR3.id,
      slug: 'listas-keys',
      title: 'Listas e keys',
      objective:
        'Explicar keys em listas React; praticar .map em arrays e .filter com resto da divisão (%).',
      estimatedMinutes: 16,
      orderIndex: 1,
      contentMd: `## Listas e keys

### Contexto

Listas aparecem em menus, feeds, tabelas e formulários dinâmicos. Em React, quando você gera vários irmãos com \`.map\`, cada item precisa de uma \`key\` adequada. Os desafios fixam **keys**, **\`.map\`** e **\`.filter\`** em JavaScript.

### Para que serve \`key\`?

\`key\` **não** é passada como prop para o seu componente filho no DOM — é uma dica **interna** do React para **reconciliar** a lista: saber qual elemento virtual corresponde a qual após uma atualização.

Use valores **estáveis e únicos** na lista (ex.: \`id\` do banco). **Evite** usar só o **índice** quando a ordem muda ou itens entram/saem no meio — pode reutilizar instâncias erradas e gerar bugs de estado.

### JavaScript: \`.map\`

Transforma cada elemento e devolve um **novo** array:

\`\`\`js
[1, 2, 3].map((n) => n * 2); // [2, 4, 6]
\`\`\`

### JavaScript: \`.filter\` e números pares

\`n % 2 === 0\` é verdadeiro para **pares**:

\`\`\`js
[1, 2, 3, 4].filter((n) => n % 2 === 0); // [2, 4]
\`\`\`

O avaliador compara o resultado com \`JSON.stringify\` do array \`[2,4]\`.

### Erros comuns

- Omitir \`key\` ou usar key duplicada na mesma lista.
- Usar índice como key em lista que **reordena** ou recebe inserts no meio.
- No editor, esquecer que o resultado do \`filter\` é um **array** — a expressão deve ser o array, não um texto.${blocoPraticaDesafios([
        '**Quiz:** papel principal da prop `key` em listas.',
        '**Lacunas:** método que transforma cada elemento do array.',
        '**Expressão no editor:** filtrar pares de `[1,2,3,4]` com `.filter` e `% 2 === 0`.',
      ])}`,
    },
  });

  await exercisesForLesson(lR6.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Propósito da key',
      prompt:
        'A prop key ajuda o React principalmente a: *(Seção “Para que serve key?”)*',
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
      prompt:
        'Complete o método de array que transforma cada elemento. *(Seção “JavaScript: .map”.)*',
      explanation: '`array.map(fn)` retorna um novo array.',
      xpReward: 18,
      gemReward: 2,
      payload: {
        template: 'const y = [1,2,3].{{b1}}(n => n * 2);',
        blanks: [{ id: 'b1', answer: 'map' }],
        hints: [
          'O método tem **três letras**: começa com **m** e termina com **p**.',
          'É o mesmo nome do conceito “mapa”: percorre o array e devolve outro array.',
        ],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Filtrar pares',
      prompt:
        'Escreva **uma expressão**: filtre **`[1,2,3,4]`** mantendo apenas **pares** com `.filter` e `n % 2 === 0`. *(Seção “.filter e números pares”.)*',
      explanation: '`[1,2,3,4].filter(n => n % 2 === 0)` → `[2,4]`.',
      xpReward: 26,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '[2,4]' }],
        hints: [
          'Use exatamente: `[1,2,3,4].filter((n) => n % 2 === 0)` — parênteses opcionais em `n`.',
          'Par = resto da divisão por 2 igual a zero.',
        ],
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
      objective:
        'Diferenciar botão semântico de div clicável; usar type="button"; praticar String.prototype.includes em JavaScript.',
      estimatedMinutes: 16,
      orderIndex: 0,
      contentMd: `## Semântica e foco

### Contexto

**Acessibilidade** não é opcional em produtos usados por toda a sociedade — inclusive escolas. HTML **semântico** (\`button\`, \`a\`, cabeçalhos \`h1\`…\`h2\` em ordem) ajuda leitores de tela e teclado. O desafio do editor usa **\`.includes\`** em strings JavaScript.

### Botão real vs. \`div\` clicável

- **\`<button type="button">\`** tem **papel** de botão, recebe **foco** por teclado e responde a **Enter/Espaço** por padrão.
- **\`<div onClick>\`** não é botão: precisa de \`role\`, \`tabIndex\` e tratamento de teclado para equivalência — mais fácil errar.

Dentro de um **\`<form>\`**, o tipo padrão de \`<button>\` é **submit**. Para ações que **não** enviam o formulário, use **\`type="button"\`** e evite submit acidental.

### Foco visível e modais

Mantenha **:focus-visible** visível para quem navega sem mouse; em **modais**, “prenda” o foco dentro do diálogo até fechar.

### JavaScript: \`.includes\`

Verifica se uma **substring** aparece na string:

\`\`\`js
"accessibility".includes("access"); // true
\`\`\`

### Erros comuns

- Simular botão só com \`div\` sem os requisitos de acessibilidade.
- Esquecer \`type="button"\` e disparar **submit** sem querer.
- No editor, retornar a **string** \`"true"\` em vez do booleano — o enunciado pede a expressão cujo valor é \`true\`.${blocoPraticaDesafios([
        '**Quiz:** melhor elemento para ação com teclado e leitor de tela.',
        '**Lacunas:** `type` do botão que não submete formulário.',
        '**Expressão no editor:** avaliar `.includes` como no exemplo da seção.',
      ])}`,
    },
  });

  await exercisesForLesson(lR7.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Botão vs div',
      prompt:
        'Para uma ação acionável por teclado e leitor de tela, prefira: *(Seção “Botão real vs. div”.)*',
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
      prompt:
        'Complete o **type** recomendado para botão que NÃO submete formulário. *(Seção sobre formulário.)*',
      explanation: '`type="button"` evita submit acidental.',
      xpReward: 16,
      gemReward: 2,
      payload: {
        template: '<button type="{{b1}}">Salvar rascunho</button>',
        blanks: [{ id: 'b1', answer: 'button' }],
        hints: [
          'O valor é a mesma palavra em inglês que nomeia o elemento HTML **button**.',
          'Não é `submit` — esse enviaria o formulário.',
        ],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Includes em string',
      prompt:
        'Escreva **uma expressão** cujo valor seja o booleano da verificação **`"accessibility".includes("access")`**. *(Seção “JavaScript: .includes”.)*',
      explanation: 'O resultado é `true`.',
      xpReward: 20,
      gemReward: 2,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: 'true' }],
        hints: [
          'Copie a expressão do enunciado: `"accessibility".includes("access")`.',
          'O método `includes` devolve **true** ou **false** (booleano).',
        ],
      },
    },
  ]);

  const lR8 = await prisma.lesson.create({
    data: {
      moduleId: modR4.id,
      slug: 'performance-memo',
      title: 'Memoização quando faz sentido',
      objective:
        'Explicar React.memo e quando otimizar; praticar === e chamar método de um objeto literal em JavaScript.',
      estimatedMinutes: 20,
      orderIndex: 1,
      contentMd: `## Memoização quando faz sentido

### Contexto

À medida que interfaces crescem, **re-renders** podem ficar caros. **Memoização** (\`React.memo\`, \`useMemo\`, \`useCallback\`) é ferramenta para **evitar trabalho repetido** — mas usada sem critério, só **complica** o código. Esta aula fixa o **quando** memoizar e o JavaScript dos desafios (\`===\`, objeto com método).

### React.memo (ideia)

\`React.memo(Componente)\` memoriza um componente de função: se as **props** forem **iguais** às do render anterior, o React pode **pular** um novo render daquele subtree. Funciona melhor com **props estáveis** e componentes **puros** (mesmas props → mesma UI).

### useMemo e useCallback (ideia rápida)

- **useMemo** memoriza um **valor** calculado.
- **useCallback** memoriza uma **função** (referência estável).

Ambos ajudam quando você passa dados para filhos memoizados e quer evitar invalidar a memoização sem necessidade.

### Quando **não** otimizar de cara

**Meça ou observe** problema real (lista enorme, animação, arrastar e soltar). Otimização prematura:

- Dificulta leitura para outros devs e alunos.
- Pode **esconder** bugs de dependências ou props instáveis.

### JavaScript: igualdade estrita \`===\`

Compara **sem** converter tipos automaticamente:

\`\`\`js
3 === "3"; // false
3 === 3;  // true
\`\`\`

### JavaScript: objeto com método e chamada

Você pode criar um **objeto literal** com uma função e chamá-la na mesma expressão:

\`\`\`js
({ double: (n) => n * 2 }).double(21); // 42
\`\`\`

Em uma expressão única, o objeto precisa de **parênteses externos** em torno de \`{ ... }\` para o parser não confundir com bloco.

### Erros comuns

- Memoizar tudo “por precaução”.
- Passar **objetos/ funções novas** inline como props e achar que \`memo\` resolve — referências mudam a cada render.
- No editor, esquecer parênteses ao usar objeto literal como expressão.${blocoPraticaDesafios([
        '**Quiz:** quando React.memo tende a ajudar.',
        '**Lacunas:** operador de igualdade estrita.',
        '**Expressão no editor:** chamar `.double(21)` em objeto `{ double: (n) => n * 2 }` (veja exemplo com parênteses).',
      ])}`,
    },
  });

  await exercisesForLesson(lR8.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'memo',
      prompt:
        'React.memo é mais útil quando: *(Seção “React.memo” e “Quando não otimizar”.)*',
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
      prompt:
        'Complete o operador de igualdade **sem** coerção de tipos. *(Seção “JavaScript: ===”.)*',
      explanation: '`===` compara sem coerção.',
      xpReward: 17,
      gemReward: 2,
      payload: {
        template: 'const ok = (a {{b1}} b);',
        blanks: [{ id: 'b1', answer: '===' }],
        hints: [
          'São **três** caracteres: igual, igual, igual.',
          'Não use `==` — esse faz conversão de tipos.',
        ],
      },
    },
    {
      type: ExerciseType.CODE_EDITOR,
      title: 'Objeto com método',
      prompt:
        'Escreva **uma expressão** que chame **double(21)** em um objeto literal `{ double: (n) => n * 2 }` e retorne **42**. *(Veja “Objeto com método e chamada” — use parênteses em volta do objeto.)*',
      explanation: 'Ex.: `({ double: (n) => n * 2 }).double(21)`',
      xpReward: 28,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '42' }],
        hints: [
          'Envolva o objeto em parênteses antes do `.double`: `({ double: (n) => n * 2 }).double(21)`.',
          'A arrow function pode ser `(n) => n * 2` — o importante é chamar `.double(21)` no final.',
        ],
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
      objective:
        'Descrever Big-O em linguagem simples; relacionar busca binária a O(log n); usar Math.pow e soma aritmética no editor.',
      estimatedMinutes: 18,
      orderIndex: 0,
      contentMd: `## Big-O (intuição) — uso em sala

### Contexto

Esta aula é **pensamento computacional**: não precisa de matemática avançada, só de **comparar ideias** (“se eu dobro o tamanho da entrada, o que acontece com o trabalho?”). Os desafios usam **JavaScript** (\`Math.pow\`, soma).

### O que medimos?

A notação **Big-O** descreve **como o tempo ou a memória crescem** quando a entrada tem tamanho \`n\`. Comparamos **ordens de grandeza** no **pior caso** típico e **ignoramos constantes** pequenas (por isso dizemos “assintótico”).

### Escalas comuns (decore a intuição)

- **O(1)** — não depende de \`n\` (ex.: acessar índice fixo em array).
- **O(log n)** — divide o problema a cada passo (ex.: **busca binária** em array **ordenado**).
- **O(n)** — uma passagem linear sobre os dados.
- **O(n log n)** — muitas ordenações eficientes.
- **O(n²)** — dois loops aninhados ingênuos sobre \`n\`.

### Busca em array ordenado

Se o array está **ordenado** e você faz **muitas consultas**, **busca binária** (índices indo para o meio) costuma ser **O(log n)** por consulta, melhor que varrer tudo (**O(n)**) repetidas vezes.

### JavaScript no editor

- **Potência:** \`Math.pow(2, 5)\` calcula \`2^5\`.
- **Soma:** \`1 + 2 + 3 + 4 + 5\` em uma expressão — o resultado é **15**.

### Erros comuns

- Achar que Big-O é tempo exato em segundos — é **comparação de crescimento**.
- Confundir “melhor caso” e “pior caso” sem dizer qual está sendo usado.
- Esquecer parênteses na soma: \`(a+b)\` quando mistura com divisão.${blocoPraticaDesafios([
        '**Quiz:** estratégia típica em array ordenado com muitas buscas.',
        '**Lacunas:** nome do método `Math` para potência (base e expoente).',
        '**Expressão no editor:** somar 1+2+3+4+5.',
      ])}`,
    },
  });

  await exercisesForLesson(lA1.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Busca em array ordenado',
      prompt:
        'Para encontrar um valor em array **ordenado** com muitas consultas, costuma-se preferir: *(Seção “Busca em array ordenado”.)*',
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
      prompt:
        'Complete: 2 elevado a 5 em JavaScript com **Math**. *(Veja “JavaScript no editor”.)*',
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
      prompt:
        'Escreva **uma expressão** que some **1+2+3+4+5**. *(Aritmética básica — resultado 15.)*',
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
      objective:
        'Entender dois ponteiros em array ordenado; reconhecer laço while; calcular média aritmética em JS.',
      estimatedMinutes: 16,
      orderIndex: 1,
      contentMd: `## Dois ponteiros

### Contexto

Quando o enunciado envolve **array ordenado** e você precisa achar **pares** ou **intervalos**, a técnica de **dois ponteiros** (\`l\` e \`r\`) muitas vezes reduz **tempo** comparada a dois \`for\` aninhados. O desafio do editor pede só **média** — revise operações básicas.

### Ideia

Dois índices caminham pelo array conforme regras do problema (ex.: soma maior que alvo → mover um ponteiro). Em problemas adequados, passa de **O(n²)** para **O(n)**.

Exemplo clássico: achar par cuja **soma** é \`target\` (há cuidados com duplicatas na implementação completa).

### Laço \`while\`

Em JavaScript, \`while (condição) { ... }\` repete enquanto a condição for verdadeira — comum em dois ponteiros: \`while (l < r)\`.

### Média aritmética

Média de \`10\` e \`20\`: \`(10 + 20) / 2\`.

### Erros comuns

- Usar dois ponteiros em array **não ordenado** sem adaptar a estratégia.
- Esquecer **parênteses**: \`10+20/2\` não é a média.
- Off-by-one nos índices ao implementar o algoritmo completo.${blocoPraticaDesafios([
        '**Quiz:** o que a técnica costuma reduzir quando bem aplicada.',
        '**Lacunas:** palavra-chave do laço “enquanto”.',
        '**Expressão no editor:** média de 10 e 20.',
      ])}`,
    },
  });

  await exercisesForLesson(lA2.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Vantagem',
      prompt:
        'Dois ponteiros costuma reduzir: *(Seção “Ideia”.)*',
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
      prompt:
        'Complete a palavra-chave do laço: enquanto **l < r**. *(Seção “Laço while”.)*',
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
      prompt:
        'Escreva **uma expressão** para a média de **10** e **20**. *(Use parênteses: `(10+20)/2`.)*',
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
      objective:
        'Definir pilha (LIFO); usar push/pop em JS; obter último caractere de string com .at(-1) ou índice.',
      estimatedMinutes: 14,
      orderIndex: 0,
      contentMd: `## Pilha (stack)

### Contexto

**Pilha** é uma estrutura do dia a dia: pilha de pratos — o último que você coloca é o primeiro que tira (**LIFO**). Em computação, serve para **desfazer**, **validar parênteses**, **DFS iterativo**, etc. O editor pede **último caractere** de uma string em JavaScript.

### Operações

- **push** — empilha no **topo**.
- **pop** — remove e devolve o do **topo**.
- **peek** (conceitual) — olhar o topo sem remover.

### Em JavaScript

\`array.push(x)\` coloca no fim; \`array.pop()\` tira do fim — simula pilha com custo amortizado **O(1)** no fim do array.

### Último caractere da string \`"abc"\`

- Índices começam em 0: \`"abc"[2]\` é \`"c"\`.
- Ou \`"abc".at(-1)\` (índice negativo conta do fim).

### Erros comuns

- Confundir pilha com **fila** (FIFO).
- Usar \`shift\` pensando que é O(1) sempre — no array JS costuma ser mais caro que \`pop\` no fim.
- No editor, devolver número em vez de string — o esperado é a string \`"c"\`.${blocoPraticaDesafios([
        '**Quiz:** princípio LIFO vs FIFO.',
        '**Lacunas:** método que remove o último elemento do array.',
        '**Expressão no editor:** último caractere de `"abc"`.',
      ])}`,
    },
  });

  await exercisesForLesson(lA3.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Ordem',
      prompt:
        'Uma pilha segue o princípio: *(Seção “Contexto” — LIFO.)*',
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
      prompt:
        'Complete o método que remove o **último** elemento do array. *(Simula o topo da pilha.)*',
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
      prompt:
        'Escreva **uma expressão** que retorne o último caractere da string **`"abc"`**. *(Veja “Último caractere” — `at(-1)` ou índice 2.)*',
      explanation: '`"abc".at(-1)` ou `"abc"[2]` → `"c"`.',
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
      objective:
        'Definir fila (FIFO); relacionar BFS com fila; usar push e shift; interpretar retorno de shift.',
      estimatedMinutes: 16,
      orderIndex: 1,
      contentMd: `## Fila (queue)

### Contexto

**Fila** é a fila do banco: **FIFO** — primeiro a entrar, primeiro a sair. Em grafos, **BFS** (busca em largura) explora “camadas” e usa fila. Em JavaScript, \`push\` no fim e \`shift\` no início **imitam** fila, mas \`shift\` pode ser custoso em arrays muito grandes — em projetos reais há **deque** ou índices de cabeça/cauda.

### Operações

- **enqueue** — entrar na fila (no nosso exemplo, \`push\` no fim).
- **dequeue** — sair da fila (no nosso exemplo, \`shift\` no início — retorna o elemento removido).

### Exemplo mental para o desafio

1. Comece com array \`[1]\`.
2. \`push(2)\` → array vira \`[1, 2]\` (e \`push\` retorna o novo **length**, mas o desafio pede outra coisa).
3. \`shift()\` remove o **primeiro** elemento (\`1\`) e **retorna** \`1\`.

### Erros comuns

- Confundir **shift** (tira do **início**) com **pop** (tira do **fim**).
- Achar que BFS usa **pilha** — costuma ser o contrário (DFS profundo ↔ pilha, BFS em camadas ↔ fila).${blocoPraticaDesafios([
        '**Quiz:** estrutura típica de BFS.',
        '**Lacunas:** método que adiciona ao final do array.',
        '**Expressão no editor:** em `[1]`, após `push(2)`, o valor retornado por `shift()`.',
      ])}`,
    },
  });

  await exercisesForLesson(lA4.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'BFS',
      prompt:
        'A busca em largura (BFS) em grafos costuma usar: *(Seção “Contexto”.)*',
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
      prompt:
        'Complete o método que adiciona no **final** do array. *(Enqueue simplificado.)*',
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
      prompt:
        'Escreva **uma expressão** que simule: fila começa como `[1]`, faça **push(2)** no mesmo array, depois retorne o que **shift()** devolve (deve ser **1**). *(Dica: use uma função arrow que recebe o array, vírgula e `push`/`shift`.)*',
      explanation:
        'Exemplo válido: `((q) => (q.push(2), q.shift()))([1])` — `push` retorna o novo length, mas o operador vírgula faz a expressão valer o resultado de `shift()`.',
      xpReward: 24,
      gemReward: 3,
      payload: {
        language: 'javascript',
        starterCode: '',
        tests: [{ expected: '1' }],
        hints: [
          'Use `((q) => (q.push(2), q.shift()))([1])` como modelo: uma arrow, vírgula entre `push` e `shift`, e chame com `[1]`.',
          'O `shift()` sempre remove e devolve o **primeiro** elemento; após `push(2)`, a fila é `[1,2]`, então o primeiro é `1`.',
        ],
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
      objective:
        'Contar ocorrências com Map; entender hash O(1) médio; usar Set e .size em JavaScript.',
      estimatedMinutes: 18,
      orderIndex: 0,
      contentMd: `## Map e frequência

### Contexto

Para saber **quantas vezes** cada letra aparece em uma palavra, não precisamos de papel: usamos uma **tabela** chave→valor. Em JavaScript, \`Map\` é ideal; **Set** guarda só **valores únicos** — o desafio do editor usa \`Set\` e \`.size\`.

### Map em JavaScript

\`Map\` guarda pares **chave → valor**. Padrão de frequência:

\`\`\`js
const m = new Map();
for (const ch of str) m.set(ch, (m.get(ch) ?? 0) + 1);
\`\`\`

### Hash tables (intuição)

Em estruturas hash bem projetadas, **inserir e buscar** costumam ser **O(1) em média**; no pior teórico pode degradar se houver muitas colisões.

### Set e \`.size\`

\`new Set([1,1,2,2,3])\` guarda **1, 2, 3**. A propriedade \`.size\` devolve **3**.

### Erros comuns

- Usar objeto genérico \`{}\` como mapa quando chaves podem ser problemáticas — \`Map\` é mais previsível.
- Confundir \`.length\` (array/string) com \`.size\` (**Set**/**Map**).${blocoPraticaDesafios([
        '**Quiz:** ordem típica de operações em hash bem dimensionada.',
        '**Lacunas:** construtor `new ___()` para mapa.',
        '**Expressão no editor:** `new Set([1,1,2,2,3]).size`.',
      ])}`,
    },
  });

  await exercisesForLesson(lA5.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Colisão conceitual',
      prompt:
        'Em uma tabela hash bem dimensionada, buscas/inserções **médias** costumam ser: *(Seção “Hash tables”.)*',
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
      prompt:
        'Complete o construtor **Map** vazio. *(Seção “Map em JavaScript”.)*',
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
      prompt:
        'Escreva **uma expressão**: crie `new Set([1,1,2,2,3])` e retorne **`.size`**. *(Seção “Set e .size”.)*',
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
      objective:
        'Definir anagrama por frequência ou ordenação de letras; usar split, sort e join em JavaScript.',
      estimatedMinutes: 18,
      orderIndex: 1,
      contentMd: `## Anagramas

### Contexto

Duas palavras são **anagramas** se usam **as mesmas letras** nas **mesmas quantidades** (ordem diferente). Duas estratégias clássicas: **contar letras** com mapa de frequência ou **ordenar** as letras e comparar strings. O desafio do editor usa **split → sort → join**.

### Frequência (ideia)

Percorra cada letra e incremente contadores — tipicamente **O(n)** na soma dos tamanhos.

### Ordenação de caracteres (ideia)

1. \`split("")\` vira array de caracteres.
2. \`sort()\` ordena lexicograficamente (atenção a locale em produção).
3. \`join("")\` volta a string.

Para \`"bac"\`, ordenar letras dá \`"abc"\`.

### Erros comuns

- Ignorar **espaços** ou **maiúsculas** em enunciados reais — aqui o foco é a técnica.
- Achar que \`sort\` sem função serve para números grandes — para números, use comparador.
- Unicode: normalização (NFC/NFD) importa em produto real.${blocoPraticaDesafios([
        '**Quiz:** custo típico de contar frequência em string tamanho n.',
        '**Lacunas:** método que divide string por delimitador.',
        '**Expressão no editor:** `"bac".split("").sort().join("")`.',
      ])}`,
    },
  });

  await exercisesForLesson(lA6.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Custo típico',
      prompt:
        'Contar frequência de cada letra em strings de tamanho n costuma ser: *(Seção “Frequência”.)*',
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
      prompt:
        'Complete o método que separa por delimitador. *(Usado antes de processar letras.)*',
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
      prompt:
        'Escreva **uma expressão** exatamente: **`"bac".split("").sort().join("")`**. *(Seção “Ordenação de caracteres”.)*',
      explanation: 'Resultado `"abc"`.',
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
      objective:
        'Explicar explosão recursiva em Fibonacci; operador ??; calcular F(6) com convenção F(0)=0, F(1)=1.',
      estimatedMinutes: 20,
      orderIndex: 0,
      contentMd: `## Fibonacci e memoização

### Contexto

A sequência de **Fibonacci** aparece em matemática e em análise de algoritmos. A definição recursiva direta **recomputa** os mesmos valores muitas vezes — por isso usamos **memoização** (cache) ou **programação dinâmica** iterativa. O desafio do editor pede só **F(6)** com a convenção indicada.

### Definição (nesta aula)

- **F(0) = 0**
- **F(1) = 1**
- **F(n) = F(n-1) + F(n-2)** para n ≥ 2

Valores: 0, 1, 1, 2, 3, 5, **8**, … → **F(6) = 8**.

### Por que memoizar?

Sem cache, a árvore de chamadas cresce **exponencialmente**. Com **Map** ou array guardando \`F(k)\` já calculados, cai para **O(n)** por problema.

### Operador \`??\` (nullish coalescing)

\`a ?? b\` devolve \`b\` quando \`a\` é \`null\` ou \`undefined\` — útil em caches (\`map.get(k) ?? valorPadrao\`).

### Erros comuns

- Trocar convenção (**F(0)** e **F(1)**) e errar o índice pedido.
- Confundir \`??\` com \`||\` (\`||\` trata outros “falsy” como \`0\` ou \`""\`).${blocoPraticaDesafios([
        '**Quiz:** complexidade da recursão ingênua de Fibonacci.',
        '**Lacunas:** valor que junto com `undefined` dispara o `??`.',
        '**Expressão no editor:** número F(6) na convenção F(0)=0, F(1)=1 — resultado 8.',
      ])}`,
    },
  });

  await exercisesForLesson(lA7.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Problema da recursão ingênua',
      prompt:
        'fib(n) recursivo sem memo pode ter tempo: *(Seção “Por que memoizar?”.)*',
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
      prompt:
        'Complete: **a ?? b** retorna **b** quando **a** é ___ ou **undefined**. *(Seção sobre `??`.)*',
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
      prompt:
        'Escreva **uma expressão** cujo valor seja **F(6)** na sequência com **F(0)=0**, **F(1)=1**. *(Tabela na seção “Definição” — resultado 8.)*',
      explanation: 'Sequência 0,1,1,2,3,5,8 → F(6)=8. Ex.: `8` ou `5+3`.',
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
      objective:
        'Explicar janela deslizante em intervalos sobrepostos; usar slice; somar elementos de um array pequeno.',
      estimatedMinutes: 18,
      orderIndex: 1,
      contentMd: `## Janela deslizante

### Contexto

Em muitos problemas você precisa da **soma** (ou outra métrica) de **k elementos seguidos** e depois **desloca** um passo: o elemento da esquerda **sai** e um novo **entra**. Em vez de somar tudo de novo (**O(k)** repetido), atualiza em **O(1)** reaproveitando a soma anterior — isso é **janela deslizante**.

### Ideia

- Some a primeira janela.
- Para mover: **subtraia** o que saiu, **some** o que entrou.

Generaliza para “maior soma”, “menor subarray com condição”, etc.

### JavaScript: \`slice\`

\`array.slice(início, fim)\` devolve **novo** recorte **sem** mudar o original — útil para inspecionar trechos.

### Soma dos três primeiros

Para \`[5, 1, 2]\`, a soma de todos os elementos é \`5+1+2=8\`.

### Erros comuns

- Confundir \`slice\` com \`splice\` (\`splice\` **muta** o array).
- Janela com tamanho errado (off-by-one).
- Não aproveitar a soma anterior quando o problema pede muitas janelas.${blocoPraticaDesafios([
        '**Quiz:** quando a técnica costuma valer a pena.',
        '**Lacunas:** método que extrai trecho sem mutar o array.',
        '**Expressão no editor:** soma de `5+1+2`.',
      ])}`,
    },
  });

  await exercisesForLesson(lA8.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Quando usar',
      prompt:
        'Janela deslizante é adequada quando: *(Seção “Contexto”.)*',
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
      prompt:
        'Complete o método que extrai parte do array **sem mutar** o original. *(Seção “slice”.)*',
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
      prompt:
        'Escreva **uma expressão** que some os elementos **`[5, 1, 2]`** *(5+1+2 = 8)*.',
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
      objective:
        'Explicar narrowing em TypeScript; typeof de arrays em JS; operador ?? no editor.',
      estimatedMinutes: 18,
      orderIndex: 0,
      contentMd: `## Narrowing com typeof e truthiness

### Contexto

**TypeScript** é JavaScript com **tipos estáticos**. Muitas vezes uma variável pode ser **várias coisas** ao mesmo tempo (\`string | null\`, etc.). **Narrowing** é o processo em que, **depois** de um \`if\`, o compilador **afina** o tipo. Os desafios incluem **JavaScript real** (\`typeof\`, \`??\`) porque o editor da plataforma executa JS.

### Exemplo guiado

\`\`\`ts
function len(x: string | string[] | null) {
  if (!x) return 0;
  if (typeof x === "string") return x.length;
  return x.length;
}
\`\`\`

- Se \`x\` é “falsy”, tratamos como vazio.
- Se \`typeof x === "string"\`, no ramo seguinte \`x\` é \`string\`.
- Caso contrário, restou \`string[]\`.

### typeof e arrays em JavaScript

Em JS, \`typeof []\` é a string \`"object"\` (não existe \`"array"\` em \`typeof\`).

### Operador \`??\` no editor

\`null ?? "x"\` resulta em \`"x"\` porque \`null\` é **nullish**. (Diferente de \`0 ?? "x"\`, que permanece \`0\`.)

### Erros comuns

- Achar que \`typeof\` distingue \`array\` — use \`Array.isArray\`.
- Confundir \`??\` com \`||\`.${blocoPraticaDesafios([
        '**Quiz:** o que narrowing faz no fluxo do TypeScript.',
        '**Lacunas:** resultado de `typeof []`.',
        '**Expressão no editor:** `null ?? "x"`.',
      ])}`,
    },
  });

  await exercisesForLesson(lT1.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Propósito do narrowing',
      prompt:
        'Narrowing permite ao TypeScript: *(Seção “Contexto”.)*',
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
      objective:
        'Explicar parâmetros de tipo <T>; ReadonlyArray; acessar primeiro elemento de array em JS.',
      estimatedMinutes: 18,
      orderIndex: 1,
      contentMd: `## Generics em funções

### Contexto

**Generics** permitem escrever funções e tipos que funcionam para **vários tipos concretos**, mantendo **ligações** (o que entra relaciona com o que sai). Em sala: pense em “caixa genérica” que preserva o tipo do conteúdo.

### Exemplo

\`\`\`ts
function primeiro<T>(arr: readonly T[]): T | undefined {
  return arr[0];
}
\`\`\`

\`T\` é **inferido** pela passagem do argumento. \`readonly T[]\` (ou \`ReadonlyArray<T>\`) diz que o array não será mutado pela função.

### No editor (JavaScript)

O primeiro elemento de \`[7,8,9]\` é \`[7,8,9][0]\` → **7**.

### Erros comuns

- Usar \`any\` onde um generic resolveria com segurança.
- Mutar array recebido quando a API promete não mutar — por isso \`readonly\` ajuda.${blocoPraticaDesafios([
        '**Quiz:** inferência de T ao passar número.',
        '**Lacunas:** `ReadonlyArray` — prefixo antes de `Array<number>`.',
        '**Expressão no editor:** primeiro elemento de `[7,8,9]`.',
      ])}`,
    },
  });

  await exercisesForLesson(lT2.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Inferência',
      prompt:
        'Ao chamar `identity(123)` onde `identity<T>(x: T): T`, T costuma ser inferido como: *(Seção “Contexto”.)*',
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
      prompt:
        'Complete o modificador de tipo utilitário para array somente leitura (TS). *(Veja `ReadonlyArray` na seção.)*',
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
      prompt:
        'Escreva **uma expressão** que retorne o primeiro elemento de **`[7,8,9]`**. *(Índice 0.)*',
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
      objective:
        'Definir Partial, Pick, Omit e keyof; usar Object.keys em JavaScript no editor.',
      estimatedMinutes: 16,
      orderIndex: 0,
      contentMd: `## Partial, Pick e Omit

### Contexto

Em TypeScript grande parte do trabalho é **modelar dados**. **Utility types** evitam copiar e colar definições: você **deriva** tipos a partir de outros. O desafio do editor usa **\`Object.keys\`** (runtime JavaScript).

### Utilitários

- **Partial com genérico** — todos os campos de T ficam **opcionais** (útil em PATCH parcial).
- **Pick** — só um **subconjunto** de chaves K de T.
- **Omit** — T **sem** as chaves K.

### keyof

**keyof T** é a **união dos nomes** das propriedades de T. Ex.: \`keyof { a: 1; b: 2 }\` é \`"a" | "b"\`.

### Object.keys no editor

\`Object.keys({ a: 1, b: 2 })\` devolve array de chaves; \`.length\` aqui é **2** (detalhes de tipagem de keys em TS são mais sutis — no JS runtime o comprimento reflete as próprias chaves enumeráveis).

### Erros comuns

- Achar que \`Partial\` muda dados em runtime — é **só tipo**.
- Confundir \`Pick\` e \`Omit\`.${blocoPraticaDesafios([
        '**Quiz:** uso típico de `Partial<User>`.',
        '**Lacunas:** palavra-chave antes de `of` em `keyof`.',
        '**Expressão no editor:** `Object.keys({a:1,b:2}).length`.',
      ])}`,
    },
  });

  await exercisesForLesson(lT3.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Partial',
      prompt:
        'Partial<User> é útil para: *(Seção “Partial”.)*',
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
      objective:
        'Explicar satisfies e as const; Object.freeze em JS; .length de array no editor.',
      estimatedMinutes: 18,
      orderIndex: 1,
      contentMd: `## satisfies e const assertions

### Contexto

Às vezes queremos **garantir** que um objeto “cabe” em um tipo **sem** perder o tipo **literal** estreito. O TypeScript moderno oferece \`satisfies\`. \`as const\` **congela** literais em tempo de compilação. Os desafios incluem \`Object.freeze\` (JS) e \`.length\`.

### satisfies (TS 4.9+)

\`satisfies\` **valida** a forma contra um tipo, mas tenta **preservar** inferência fina dos literais (diferente de anotar o valor com um tipo largo demais).

### as const

Em literais, \`as const\` tende a produzir **readonly** e tipos literais nos elementos.

### Object.freeze (JavaScript)

\`Object.freeze(obj)\` impede mudanças rasas em propriedades próprias — é **runtime**, não substitui tipos TS.

### Erros comuns

- Usar \`as any\` para “calçar” erros em vez de \`satisfies\`.
- Achar que \`freeze\` torna objetos profundamente imutáveis — só **raso**.${blocoPraticaDesafios([
        '**Quiz:** efeito típico de `as const` em array literal.',
        '**Lacunas:** `Object.____` para congelar objeto.',
        '**Expressão no editor:** `[1,2,3].length`.',
      ])}`,
    },
  });

  await exercisesForLesson(lT4.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'as const',
      prompt:
        '`as const` em um array literal costuma: *(Seção “as const”.)*',
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
      objective:
        'Diferenciar ESM e CJS; export nomeado; truthiness de [] com Boolean() no editor.',
      estimatedMinutes: 18,
      orderIndex: 0,
      contentMd: `## ESM vs CJS no Node

### Contexto

Projetos Node e bundlers usam **módulos** para organizar código. **ESM** (\`import\` / \`export\`) é o padrão **moderno** na Web e cada vez mais no Node. **CJS** (\`require\` / \`module.exports\`) ainda aparece em pacotes legados. Em projetos mistos: \`import.meta.url\`, \`__dirname\` e o campo \`"type": "module"\` no \`package.json\` importam.

### ESM

- \`import\` carrega dependências.
- \`export\` / \`export const\` expõe valores.

### CJS (ideia)

- \`require('pacote')\` e \`module.exports\`.

### Editor: \`Boolean([])\`

Em JavaScript, \`[]\` (array vazio) é um **objeto** e em contexto booleano é **truthy**. \`Boolean([])\` é \`true\`.

### Erros comuns

- Misturar sintaxes sem configurar o pacote ou bundler.
- Achar que array vazio é “falso” em JS — não é.${blocoPraticaDesafios([
        '**Quiz:** onde ler metadados de módulo em ESM.',
        '**Lacunas:** palavra-chave antes de `const pi` para export nomeado.',
        '**Expressão no editor:** `Boolean([])`.',
      ])}`,
    },
  });

  await exercisesForLesson(lT5.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'import.meta',
      prompt:
        'Em ESM, informações de módulo costumam vir de: *(Seção “ESM”.)*',
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
      objective:
        'Explicar strict e strictNullChecks; anotação de retorno number; parseInt na base 10 no editor.',
      estimatedMinutes: 18,
      orderIndex: 1,
      contentMd: `## strict no tsconfig

### Contexto

O arquivo \`tsconfig.json\` controla como o TypeScript **analisa** o projeto. Com \`"strict": true\`, várias flags rigorosas ligam de uma vez — você **encontra bugs mais cedo**, mas precisa **tipar** melhor (especialmente integrações legadas).

### strictNullChecks (ideia)

Com **strictNullChecks**, \`null\` e \`undefined\` não são “esquecidos” pelo compilador: se um valor pode não existir, você **testa** ou **normaliza** antes de usar.

### Anotação de retorno

\`function f(): number { return 1; }\` deixa explícito que a função retorna **number**.

### parseInt no editor

\`parseInt("42", 10)\` interpreta string na **base 10** e devolve **42** (número).

### Erros comuns

- Desligar strict só para “fazer compilar” — mascará débito técnico.
- \`parseInt\` sem radix — em produção pode haver surpresas; use **10** para decimal.${blocoPraticaDesafios([
        '**Quiz:** o que strictNullChecks enforça.',
        '**Lacunas:** tipo de retorno `number` no exemplo.',
        '**Expressão no editor:** `parseInt("42", 10)`.',
      ])}`,
    },
  });

  await exercisesForLesson(lT6.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'strictNullChecks',
      prompt:
        'Com **strictNullChecks**, o TypeScript passa a exigir tratamento explícito de: *(Seção “strictNullChecks”.)*',
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
      objective:
        'Justificar validação na borda; usar JSON.parse; acessar propriedade de objeto literal no editor.',
      estimatedMinutes: 18,
      orderIndex: 0,
      contentMd: `## Validação em runtime

### Contexto

**TypeScript** some na hora de **executar**: o servidor ou a rede pode devolver **qualquer JSON**. Bibliotecas como **Zod** ou **Valibot** ajudam a **validar** na **borda** (quando os dados entram) e a inferir tipos. Sem isso, bugs aparecem longe da origem.

### Fluxo típico

\`fetch\` → \`response.json()\` → **validar** com schema → só então usar como tipo estreito.

### JSON.parse

\`JSON.parse('{"a":1}')\` converte **string JSON** em valor JavaScript.

### Acesso a propriedade

\`({ a: 1 }).a\` vale **1** — objeto literal com notação de ponto.

### Erros comuns

- Confundir **validação** com **conversão** — tipos não consertam dados inválidos sozinhos.
- Confiar em resposta externa porque “compilou”.${blocoPraticaDesafios([
        '**Quiz:** por que validar HTTP no cliente/servidor.',
        '**Lacunas:** `JSON.____` para string → valor.',
        '**Expressão no editor:** `({ a: 1 }).a`.',
      ])}`,
    },
  });

  await exercisesForLesson(lT7.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Por que validar',
      prompt:
        'Validar o corpo da resposta HTTP é importante porque: *(Seção “Contexto”.)*',
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
      objective:
        'Explicar padrão Result e uniões discriminadas; throw em JS; acessar .ok em objeto literal.',
      estimatedMinutes: 16,
      orderIndex: 1,
      contentMd: `## Result e erros tipados

### Contexto

Em muitos fluxos, **falha é esperada** (rede, validação, permissão). O padrão **Result** (ou similar) retorna **\`{ ok: true, value }\`** ou **\`{ ok: false, error }\`** em vez de só **lançar** exceção. Em TypeScript, **uniões discriminadas** com campo \`ok\` permitem **narrowing** seguro com \`if (r.ok)\`.

### throw em JavaScript

\`throw new Error("falhou")\` interrompe o fluxo até um \`try/catch\` — use com parcimônia para casos **excepcionais**.

### Editor

\`({ ok: true }).ok\` → **true**.

### Erros comuns

- Usar exceção para controle de fluxo comum.
- Esquecer de tratar o ramo \`ok: false\`.${blocoPraticaDesafios([
        '**Quiz:** papel do campo discriminador em uniões.',
        '**Lacunas:** palavra-chave antes de `new Error`.',
        '**Expressão no editor:** `({ ok: true }).ok`.',
      ])}`,
    },
  });

  await exercisesForLesson(lT8.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Discriminação',
      prompt:
        'Uma união discriminada usa um campo comum (ex.: kind/status) para: *(Seção “Contexto”.)*',
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
      objective:
        'Explicar recursos, verbos HTTP, idempotência; status 204; .toUpperCase() no editor.',
      estimatedMinutes: 20,
      orderIndex: 0,
      contentMd: `## REST como recursos

### Contexto

**REST** (estilo comum em APIs web) organiza o sistema em **recursos** nomeados por **URLs** e operações com **verbos HTTP**. Esta aula usa linguagem de **sala de aula**; os desafios fixam **POST vs GET**, **código 204** e uma expressão **JavaScript** simples.

### Recursos e URLs

- Substantivos: \`/users\`, \`/orders/42\`.
- Identificadores (\`:id\`) apontam **qual** instância.

### Verbos (intenção)

- **GET** — ler (não deve alterar estado no servidor idealmente).
- **POST** — **criar** recurso (ou ações, dependendo do design).
- **PUT/PATCH** — substituir/atualizar.
- **DELETE** — remover.

### Idempotência (ideia)

Repetir **GET** ou muitos **DELETE** idempotentes com o mesmo efeito é “seguro” em desenho comum. **POST** de **criação** costuma **não** ser idempotente (cada chamada pode criar de novo).

### Status **204 No Content**

Sucesso **sem corpo** — comum após DELETE bem-sucedido em algumas APIs.

### Editor: \`toUpperCase\`

\`"GET".toUpperCase()\` continua \`"GET"\` — exercício de expressão.

### Erros comuns

- Usar **GET** para apagar ou criar com efeitos colaterais.
- Confundir **PUT** (substituição total típica) com **PATCH** (parcial).${blocoPraticaDesafios([
        '**Quiz:** método mais comum para criar recurso RESTful.',
        '**Lacunas:** código de sucesso sem corpo.',
        '**Expressão no editor:** `"GET".toUpperCase()`.',
      ])}`,
    },
  });

  await exercisesForLesson(lApi1.id, [
    {
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Criação',
      prompt:
        'Qual método HTTP é o mais comum para **criar** um recurso em APIs RESTful? *(Seção “Verbos”.)*',
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
