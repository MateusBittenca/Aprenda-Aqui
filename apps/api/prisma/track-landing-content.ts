/**
 * Conteúdo de apresentação (landing) por slug de curso — capa + Markdown longo.
 * Usado no seed; pode ser editado depois pelo admin (campos coverImageUrl / overviewMd).
 */
const UNSPLASH = {
  code: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&q=80&auto=format&fit=crop',
  react: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1600&q=80&auto=format&fit=crop',
  server: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80&auto=format&fit=crop',
  data: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80&auto=format&fit=crop',
  git: 'https://images.unsplash.com/photo-1618401479427-c8fdd29f490c?w=1600&q=80&auto=format&fit=crop',
  algo: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1600&q=80&auto=format&fit=crop',
  ts: 'https://images.unsplash.com/photo-1517180102446-f3e45198587b?w=1600&q=80&auto=format&fit=crop',
  api: 'https://images.unsplash.com/photo-1623282033815-e40f48a4cffc?w=1600&q=80&auto=format&fit=crop',
  qa: 'https://images.unsplash.com/photo-1532619675605-1ede6c666ed0?w=1600&q=80&auto=format&fit=crop',
} as const;

export function landingForCourse(slug: string): { coverImageUrl: string | null; overviewMd: string | null } {
  const row = LANDING[slug];
  if (!row) return { coverImageUrl: null, overviewMd: null };
  return { coverImageUrl: row.coverImageUrl, overviewMd: row.overviewMd };
}

const LANDING: Record<string, { coverImageUrl: string; overviewMd: string }> = {
  frontend: {
    coverImageUrl: UNSPLASH.code,
    overviewMd: `## Sobre este curso

Construa **interfaces web sólidas** do zero: primeiro a estrutura com HTML semântico, depois estilos com CSS e, em seguida, fundamentos que prepar você para **React** e ecossistemas modernos.

### Para quem é

- Quem está começando em desenvolvimento web
- Quem quer revisar bases antes de frameworks
- Estudantes que preferem **prática com feedback imediato** nos exercícios

### O que você vai dominar

- Estrutura de documentos HTML5 e boas práticas de acessibilidade
- CSS: seletores, layout e responsividade
- Leitura de código e mentalidade de componentes

### Exemplo do tipo de código que você verá

\`\`\`html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Minha primeira página</title>
  </head>
  <body>
    <main>
      <h1>Olá, web!</h1>
    </main>
  </body>
</html>
\`\`\`

> **Formato das aulas:** textos objetivos, blocos de código e exercícios no próprio site — múltipla escolha, preenchimento e editor quando couber.`,
  },
  backend: {
    coverImageUrl: UNSPLASH.server,
    overviewMd: `## Sobre este curso

Aprenda **lógica de servidor** com Node.js, conceitos de **APIs HTTP** com Express e fundamentos de **SQL** para consultar dados em bancos relacionais.

### Para quem é

- Quem quer entender o que roda “atrás” do front-end
- Desenvolvedores iniciantes em JavaScript no servidor
- Quem precisa ler e escrever consultas SQL no dia a dia

### O que você vai praticar

- Módulos CommonJS e organização de arquivos
- Rotas REST, métodos HTTP e JSON
- Consultas \`SELECT\` com filtros e ordenação

### Exemplo (Node)

\`\`\`js
const http = require('http');
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true, path: req.url }));
});
server.listen(3000, () => console.log('API no ar'));
\`\`\`

> Cada módulo combina **teoria enxuta** com exercícios para fixar o vocabulário de backend.`,
  },
  dados: {
    coverImageUrl: UNSPLASH.data,
    overviewMd: `## Sobre este curso

Entenda **entidades**, relacionamentos e normalização em alto nível — o vocabulário necessário para conversar com dados em produtos reais e desenhar modelos coerentes.

### Por que importa

Dados mal modelados geram bugs, relatórios errados e dívidas técnicas. Este curso dá o **mapa mental** antes de mergulhar em SQL ou ORMs.

### Você vai sair sabendo

- O que é uma entidade e como ela vira tabela
- Relacionamentos 1:N e N:M em linguagem simples
- Boas práticas de nomeação e consistência

### Exemplo conceitual

\`\`\`text
[ Usuário ] 1 --- N [ Pedido ] N --- 1 [ Produto ]
(cada pedido tem um usuário; itens ligam pedido e produto)
\`\`\``,
  },
  ferramentas: {
    coverImageUrl: UNSPLASH.git,
    overviewMd: `## Sobre este curso

**Git**, terminal e fluxo de trabalho: controle de versão, branches e hábitos que profissionais usam todos os dias.

### O que você ganha

- Commits com mensagens úteis
- Entendimento de staging, branch e merge
- Base para colaborar em repositórios remotos

### Comando que você verá logo no início

\`\`\`bash
git init
git add .
git commit -m "Primeiro commit"
\`\`\`

> Ideal para quem programa sozinho mas quer se preparar para **trabalho em equipe** e CI.`,
  },
  'react-interfaces': {
    coverImageUrl: UNSPLASH.react,
    overviewMd: `## Sobre este curso

**React** é o padrão de mercado para interfaces ricas. Aqui você vê **JSX**, componentes, estado com hooks, formulários, listas com \`key\`, eixos de acessibilidade e quando memoizar.

### Público-alvo

- Quem já tem base de JavaScript e HTML
- Devs que querem componentizar interfaces com confiança

### Trecho típico (conceitual)

\`\`\`jsx
function Saudacao({ nome }) {
  return (
    <article>
      <h1>Olá, {nome}</h1>
    </article>
  );
}
\`\`\`

> O curso alterna **leitura guiada** com exercícios no editor quando o avaliador suporta JavaScript.`,
  },
  'algoritmos-logica': {
    coverImageUrl: UNSPLASH.algo,
    overviewMd: `## Sobre este curso

**Complexidade**, estruturas clássicas (pilha, fila), mapas de frequência, recursão com memoização e padrões como **dois ponteiros** e **janela deslizante** — com implementação em JavaScript.

### Objetivo

Treinar o raciocínio que entrevistas e sistemas de grande escala exigem, sem perder o pé na prática.

### Ideia de código

\`\`\`js
const freq = new Map();
for (const ch of 'abracadabra') {
  freq.set(ch, (freq.get(ch) ?? 0) + 1);
}
\`\`\``,
  },
  'typescript-profundo': {
    coverImageUrl: UNSPLASH.ts,
    overviewMd: `## Sobre este curso

Aprofunde **TypeScript**: uniões, \`narrowing\`, generics, utility types (\`Partial\`, \`Pick\`, \`Omit\`), módulos ESM/CJS e validação na borda de APIs.

### Por que TS

Tipos bons **documentam** o sistema e pegam erros antes do runtime — essencial em equipes e bases grandes.

### Exemplo

\`\`\`ts
function primeiro<T>(arr: readonly T[]): T | undefined {
  return arr[0];
}
const n = primeiro([1, 2, 3]);
\`\`\``,
  },
  'apis-rest-http': {
    coverImageUrl: UNSPLASH.api,
    overviewMd: `## Sobre este curso

**HTTP** na prática: recursos REST, verbos, códigos de status, JSON, \`fetch\`, paginação, erros padronizados, **CORS** e cabeçalho \`Authorization\`.

### Você vai conseguir

- Ler e desenhar contratos de API com clareza
- Interpretar falhas 4xx/5xx e logs
- Pensar em segurança básica (tokens, query strings)

\`\`\`http
GET /users/42 HTTP/1.1
Host: api.exemplo.com
Accept: application/json
\`\`\``,
  },
  'qualidade-testes': {
    coverImageUrl: UNSPLASH.qa,
    overviewMd: `## Sobre este curso

**Testes** em pirâmide (unitário, integração, E2E), **CI**, logs estruturados, feature flags e revisão de código — cultura de qualidade de produtos modernos.

### Resultado esperado

Saber onde investir tempo de teste, automatizar o essencial e manter entrega contínua com confiança.

\`\`\`ts
// Exemplo de intenção em teste (AAA)
// arrange → act → assert
expect(soma(20, 22)).toBe(42);
\`\`\``,
  },
};
