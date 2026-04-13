import { PrismaClient, ExerciseType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.userTrackEnrollment.deleteMany();
  await prisma.userCourseEnrollment.deleteMany();
  await prisma.userExerciseAttempt.deleteMany();
  await prisma.userExerciseProgress.deleteMany();
  await prisma.userLessonProgress.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.track.deleteMany();

  const trackFe = await prisma.track.create({
    data: {
      slug: 'frontend',
      title: 'Frontend',
      description: 'HTML, CSS e fundamentos de interfaces web.',
      tagline: 'Interfaces modernas do zero ao deploy.',
      orderIndex: 0,
    },
  });

  const courseFe = await prisma.course.create({
    data: {
      trackId: trackFe.id,
      slug: 'web-fundamentals',
      title: 'Fundamentos da Web',
      description: 'Primeiros passos no ecossistema web.',
      orderIndex: 0,
    },
  });

  const modHtml = await prisma.module.create({
    data: {
      courseId: courseFe.id,
      slug: 'html-basics',
      title: 'HTML básico',
      orderIndex: 0,
    },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      moduleId: modHtml.id,
      slug: 'estrutura-html',
      title: 'Estrutura de um documento HTML',
      objective: 'Entender a estrutura mínima de uma página.',
      estimatedMinutes: 3,
      orderIndex: 0,
      contentMd: `## Objetivo

Todo documento HTML começa com uma declaração de tipo e uma estrutura em árvore.

### Exemplo

\`\`\`html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Minha página</title>
  </head>
  <body>
    <p>Olá!</p>
  </body>
</html>
\`\`\`

Use \`<!DOCTYPE html>\` para indicar HTML5.`,
    },
  });

  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lesson1.id,
        type: ExerciseType.MULTIPLE_CHOICE,
        title: 'Declaração HTML5',
        prompt: 'Qual linha inicia corretamente um documento HTML5?',
        explanation:
          'A declaração `<!DOCTYPE html>` informa ao navegador que o documento segue o padrão HTML5.',
        orderIndex: 0,
        xpReward: 15,
        gemReward: 2,
        payload: {
          options: [
            '<html version="5">',
            '<!DOCTYPE html>',
            '<?xml version="1.0"?>',
            '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">',
          ],
          correctIndex: 1,
        },
      },
      {
        lessonId: lesson1.id,
        type: ExerciseType.CODE_FILL,
        title: 'Complete o título',
        prompt: 'Preencha o elemento que define o título exibido na aba do navegador.',
        explanation: 'O elemento `<title>` dentro de `<head>` define o título da página.',
        orderIndex: 1,
        xpReward: 20,
        gemReward: 2,
        payload: {
          template:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <{{b1}}>Aprendendo Web</{{b1}}>\n  </head>\n  <body></body>\n</html>',
          blanks: [{ id: 'b1', answer: 'title' }],
        },
      },
      {
        lessonId: lesson1.id,
        type: ExerciseType.CODE_EDITOR,
        title: 'Expressão em JavaScript',
        prompt:
          'Escreva uma expressão JavaScript que retorne o número **42** (use apenas código, sem comentários extras).',
        explanation: 'Expressões como `40 + 2` ou `21 * 2` avaliam para 42.',
        orderIndex: 2,
        xpReward: 25,
        gemReward: 3,
        payload: {
          language: 'javascript',
          starterCode: '',
          tests: [{ expected: '42' }],
        },
      },
    ],
  });

  const courseCss = await prisma.course.create({
    data: {
      trackId: trackFe.id,
      slug: 'css-layout',
      title: 'CSS e layout',
      description: 'Estilos, seletores e bases de layout para páginas bonitas.',
      orderIndex: 1,
      isFree: true,
    },
  });

  const modCss = await prisma.module.create({
    data: {
      courseId: courseCss.id,
      slug: 'css-inicio',
      title: 'Introdução ao CSS',
      orderIndex: 0,
    },
  });

  const lessonCss = await prisma.lesson.create({
    data: {
      moduleId: modCss.id,
      slug: 'o-que-e-css',
      title: 'O que é CSS?',
      objective: 'Entender o papel das folhas de estilo.',
      estimatedMinutes: 3,
      orderIndex: 0,
      contentMd: `## CSS

O **CSS** (Cascading Style Sheets) define a aparência do HTML: cores, fontes, espaçamentos e layout.

\`\`\`css
body {
  font-family: system-ui, sans-serif;
}
\`\`\``,
    },
  });

  await prisma.exercise.create({
    data: {
      lessonId: lessonCss.id,
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Função do CSS',
      prompt: 'O CSS é usado principalmente para:',
      explanation: 'CSS define **apresentação visual**; o HTML define a estrutura.',
      orderIndex: 0,
      xpReward: 12,
      gemReward: 1,
      payload: {
        options: [
          'Definir a lógica do servidor',
          'Estilizar e posicionar elementos na página',
          'Armazenar dados no banco',
          'Compilar TypeScript',
        ],
        correctIndex: 1,
      },
    },
  });

  const trackBe = await prisma.track.create({
    data: {
      slug: 'backend',
      title: 'Backend',
      description: 'Lógica de servidor e APIs com Node.js.',
      tagline: 'APIs, Node.js e persistência de dados.',
      orderIndex: 1,
    },
  });

  const courseBe = await prisma.course.create({
    data: {
      trackId: trackBe.id,
      slug: 'node-intro',
      title: 'Introdução ao Node.js',
      description: 'Conceitos básicos do runtime JavaScript no servidor.',
      orderIndex: 0,
    },
  });

  const modNode = await prisma.module.create({
    data: {
      courseId: courseBe.id,
      slug: 'primeiros-passos',
      title: 'Primeiros passos',
      orderIndex: 0,
    },
  });

  const lessonBe1 = await prisma.lesson.create({
    data: {
      moduleId: modNode.id,
      slug: 'modulos-node',
      title: 'Módulos CommonJS',
      objective: 'Importar e exportar código com require/module.exports.',
      estimatedMinutes: 4,
      orderIndex: 0,
      contentMd: `## Módulos no Node

No Node.js, por padrão usamos **CommonJS**:

\`\`\`js
// math.js
exports.sum = (a, b) => a + b;

// app.js
const { sum } = require('./math');
console.log(sum(2, 3));
\`\`\``,
    },
  });

  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lessonBe1.id,
        type: ExerciseType.MULTIPLE_CHOICE,
        title: 'Exportação',
        prompt: 'Qual palavra-chave exporta um valor em um módulo CommonJS?',
        explanation: '`module.exports` (ou `exports`) expõe valores para outros arquivos.',
        orderIndex: 0,
        xpReward: 12,
        gemReward: 1,
        payload: {
          options: ['import', 'module.exports', 'package', 'namespace'],
          correctIndex: 1,
        },
      },
      {
        lessonId: lessonBe1.id,
        type: ExerciseType.CODE_FILL,
        title: 'Require',
        prompt: 'Complete a importação do módulo `fs` embutido.',
        explanation: '`require("fs")` carrega o módulo de sistema de arquivos.',
        orderIndex: 1,
        xpReward: 18,
        gemReward: 2,
        payload: {
          template: "const fs = {{b1}}('fs');",
          blanks: [{ id: 'b1', answer: 'require' }],
        },
      },
      {
        lessonId: lessonBe1.id,
        type: ExerciseType.CODE_EDITOR,
        title: 'Soma simples',
        prompt:
          'Escreva uma expressão que retorne a soma de **10** e **32** (resultado **42**).',
        explanation: '`10 + 32` resulta em 42.',
        orderIndex: 2,
        xpReward: 22,
        gemReward: 2,
        payload: {
          language: 'javascript',
          starterCode: '',
          tests: [{ expected: '42' }],
        },
      },
    ],
  });

  const courseSql = await prisma.course.create({
    data: {
      trackId: trackBe.id,
      slug: 'sql-basico',
      title: 'SQL na prática',
      description: 'Consultas SELECT, filtros e ordenação em bancos relacionais.',
      orderIndex: 1,
      isFree: true,
    },
  });

  const modSql = await prisma.module.create({
    data: {
      courseId: courseSql.id,
      slug: 'consultas',
      title: 'Consultas básicas',
      orderIndex: 0,
    },
  });

  const lessonSql = await prisma.lesson.create({
    data: {
      moduleId: modSql.id,
      slug: 'select-intro',
      title: 'Introdução ao SELECT',
      objective: 'Ler dados de uma tabela com SQL.',
      estimatedMinutes: 4,
      orderIndex: 0,
      contentMd: `## SELECT

Use \`SELECT\` para **buscar colunas** de uma tabela:

\`\`\`sql
SELECT nome, email FROM usuarios;
\`\`\``,
    },
  });

  await prisma.exercise.create({
    data: {
      lessonId: lessonSql.id,
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Ler colunas',
      prompt: 'Qual palavra-chave inicia uma consulta que retorna colunas de uma tabela?',
      explanation: '`SELECT` inicia uma consulta de leitura em SQL.',
      orderIndex: 0,
      xpReward: 14,
      gemReward: 2,
      payload: {
        options: ['INSERT', 'SELECT', 'DELETE', 'UPDATE'],
        correctIndex: 1,
      },
    },
  });

  const trackDados = await prisma.track.create({
    data: {
      slug: 'dados',
      title: 'Dados',
      description: 'Fundamentos de dados e boas práticas.',
      tagline: 'Organize e entenda informação como um dev.',
      orderIndex: 2,
    },
  });

  const courseDados = await prisma.course.create({
    data: {
      trackId: trackDados.id,
      slug: 'modelagem-intro',
      title: 'Modelagem de dados',
      description: 'Entidades, relacionamentos e normalização em alto nível.',
      orderIndex: 0,
      isFree: true,
    },
  });

  const modDados = await prisma.module.create({
    data: {
      courseId: courseDados.id,
      slug: 'conceitos',
      title: 'Conceitos iniciais',
      orderIndex: 0,
    },
  });

  const lessonDados = await prisma.lesson.create({
    data: {
      moduleId: modDados.id,
      slug: 'entidades',
      title: 'O que é uma entidade?',
      objective: 'Relacionar entidades com tabelas em bancos relacionais.',
      estimatedMinutes: 3,
      orderIndex: 0,
      contentMd: `## Entidades

Uma **entidade** representa um objeto do mundo real (ex.: Usuário, Pedido) que costumamos guardar em **tabelas**.`,
    },
  });

  await prisma.exercise.create({
    data: {
      lessonId: lessonDados.id,
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Tabelas e entidades',
      prompt: 'Em um banco relacional, uma entidade costuma ser representada por:',
      explanation: 'Cada entidade costuma mapear para uma **tabela** com linhas e colunas.',
      orderIndex: 0,
      xpReward: 12,
      gemReward: 1,
      payload: {
        options: ['Um único arquivo JSON', 'Uma tabela', 'Uma variável em memória', 'Um endpoint REST'],
        correctIndex: 1,
      },
    },
  });

  // Cursos extras para testar matrícula manual (gratuitos, sem matrícula automática no login)
  const courseTs = await prisma.course.create({
    data: {
      trackId: trackFe.id,
      slug: 'typescript-fundamentos',
      title: 'TypeScript na prática',
      description: 'Tipos, interfaces e integração com JavaScript.',
      orderIndex: 2,
      isFree: true,
      autoEnrollOnAuth: false,
    },
  });
  const modTs = await prisma.module.create({
    data: { courseId: courseTs.id, slug: 'tipos-basicos', title: 'Tipos básicos', orderIndex: 0 },
  });
  const lessonTs = await prisma.lesson.create({
    data: {
      moduleId: modTs.id,
      slug: 'o-que-e-ts',
      title: 'Por que TypeScript?',
      objective: 'Entender o papel de tipos estáticos no JavaScript.',
      estimatedMinutes: 4,
      orderIndex: 0,
      contentMd: `## TypeScript

O **TypeScript** é um superset do JavaScript que adiciona **tipagem estática** e melhora a experiência em projetos grandes.`,
    },
  });
  await prisma.exercise.create({
    data: {
      lessonId: lessonTs.id,
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Compilação',
      prompt: 'O código TypeScript costuma ser transformado em JavaScript por:',
      explanation: 'O compilador `tsc` (ou bundlers) emitem JavaScript compatível com o alvo configurado.',
      orderIndex: 0,
      xpReward: 14,
      gemReward: 2,
      payload: {
        options: ['Um interpretador Python', 'Um compilador / transpilador', 'Apenas o navegador, sem etapa extra', 'Um plugin de Word'],
        correctIndex: 1,
      },
    },
  });

  const courseJs = await prisma.course.create({
    data: {
      trackId: trackFe.id,
      slug: 'javascript-moderno',
      title: 'JavaScript moderno (ES6+)',
      description: 'let/const, arrow functions, destructuring e módulos.',
      orderIndex: 3,
      isFree: true,
      autoEnrollOnAuth: false,
    },
  });
  const modJs = await prisma.module.create({
    data: { courseId: courseJs.id, slug: 'sintaxe', title: 'Sintaxe essencial', orderIndex: 0 },
  });
  const lessonJs = await prisma.lesson.create({
    data: {
      moduleId: modJs.id,
      slug: 'let-const',
      title: 'let e const',
      objective: 'Usar declarações de variável com escopo de bloco.',
      estimatedMinutes: 3,
      orderIndex: 0,
      contentMd: `## let e const

Prefira \`const\` quando o valor não será reatribuído e \`let\` quando precisar reatribuir.`,
    },
  });
  await prisma.exercise.create({
    data: {
      lessonId: lessonJs.id,
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Escopo de bloco',
      prompt: 'Qual declaração tem escopo de bloco (como em um `if`)?',
      explanation: '`let` e `const` respeitam escopo de bloco; `var` não.',
      orderIndex: 0,
      xpReward: 12,
      gemReward: 1,
      payload: {
        options: ['Apenas var', 'let e const', 'Apenas function', 'Apenas global'],
        correctIndex: 1,
      },
    },
  });

  const courseExpress = await prisma.course.create({
    data: {
      trackId: trackBe.id,
      slug: 'express-apis',
      title: 'Express e APIs HTTP',
      description: 'Rotas, middlewares e JSON com Express.',
      orderIndex: 2,
      isFree: true,
      autoEnrollOnAuth: false,
    },
  });
  const modEx = await prisma.module.create({
    data: { courseId: courseExpress.id, slug: 'rotas', title: 'Rotas HTTP', orderIndex: 0 },
  });
  const lessonEx = await prisma.lesson.create({
    data: {
      moduleId: modEx.id,
      slug: 'get-post',
      title: 'GET e POST',
      objective: 'Diferenciar métodos HTTP comuns em APIs.',
      estimatedMinutes: 4,
      orderIndex: 0,
      contentMd: `## Métodos

\`GET\` costuma **ler** recursos; \`POST\` costuma **criar** ou enviar dados no corpo.`,
    },
  });
  await prisma.exercise.create({
    data: {
      lessonId: lessonEx.id,
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Leitura sem corpo',
      prompt: 'Qual método HTTP é mais associado a buscar dados sem enviar corpo complexo?',
      explanation: '`GET` é o método típico para leituras idempotentes.',
      orderIndex: 0,
      xpReward: 13,
      gemReward: 2,
      payload: {
        options: ['DELETE', 'GET', 'TRACE', 'CONNECT'],
        correctIndex: 1,
      },
    },
  });

  const trackTools = await prisma.track.create({
    data: {
      slug: 'ferramentas',
      title: 'Ferramentas',
      description: 'Git, terminal e fluxo de trabalho.',
      tagline: 'Controle de versão e produtividade.',
      orderIndex: 3,
    },
  });
  const courseGit = await prisma.course.create({
    data: {
      trackId: trackTools.id,
      slug: 'git-essencial',
      title: 'Git essencial',
      description: 'Commits, branches e merge no dia a dia.',
      orderIndex: 0,
      isFree: true,
      autoEnrollOnAuth: false,
    },
  });
  const modGit = await prisma.module.create({
    data: { courseId: courseGit.id, slug: 'inicio', title: 'Primeiros comandos', orderIndex: 0 },
  });
  const lessonGit = await prisma.lesson.create({
    data: {
      moduleId: modGit.id,
      slug: 'init-commit',
      title: 'Repositório e commit',
      objective: 'Inicializar um repositório e registrar alterações.',
      estimatedMinutes: 4,
      orderIndex: 0,
      contentMd: `## Git

\`git init\` cria um repositório; \`git commit\` registra um snapshot com mensagem.`,
    },
  });
  await prisma.exercise.create({
    data: {
      lessonId: lessonGit.id,
      type: ExerciseType.MULTIPLE_CHOICE,
      title: 'Área de staging',
      prompt: 'Qual comando adiciona arquivos ao índice antes do commit?',
      explanation: '`git add` prepara alterações para o próximo commit.',
      orderIndex: 0,
      xpReward: 14,
      gemReward: 2,
      payload: {
        options: ['git push', 'git add', 'git clone', 'git fork'],
        correctIndex: 1,
      },
    },
  });

  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: 'admin@aprenda.local' },
    create: {
      email: 'admin@aprenda.local',
      passwordHash: adminHash,
      displayName: 'Administrador',
      role: 'ADMIN',
    },
    update: {
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  console.log('Seed concluído: trilhas, cursos e aulas atualizados.');
  console.log(`Conta admin: admin@aprenda.local / senha: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
