import { PrismaClient, ExerciseType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  const trackBe = await prisma.track.create({
    data: {
      slug: 'backend',
      title: 'Backend',
      description: 'Lógica de servidor e APIs com Node.js.',
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

  console.log('Seed concluído: trilhas Frontend e Backend com aulas e exercícios.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
