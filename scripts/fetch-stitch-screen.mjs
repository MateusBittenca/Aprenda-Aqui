/**
 * Baixa HTML e screenshot de uma tela do Google Stitch via SDK (mesma API do MCP Stitch).
 *
 * Requer: STITCH_API_KEY no ambiente (https://stitch.withgoogle.com/settings)
 *
 * Uso:
 *   set STITCH_API_KEY=...
 *   node scripts/fetch-stitch-screen.mjs
 *
 * Saída: apps/web/public/stitch-assets/devcode-journey/
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stitch } from '@google/stitch-sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PROJECT_ID = process.env.STITCH_PROJECT_ID ?? '12725512160423672178';
const SCREEN_ID = process.env.STITCH_SCREEN_ID ?? 'e884a0b4d9f4492ab5bd0f6b397d6f74';
const OUT_DIR = join(ROOT, 'apps', 'web', 'public', 'stitch-assets', 'devcode-journey');

if (!process.env.STITCH_API_KEY) {
  console.error('Defina STITCH_API_KEY (ex.: variável de ambiente ou .env local).');
  console.error('Obtenha a chave em https://stitch.withgoogle.com/settings');
  process.exit(1);
}

const project = stitch.project(PROJECT_ID);
const screen = await project.getScreen(SCREEN_ID);
const htmlUrl = await screen.getHtml();
const imageUrl = await screen.getImage();

console.log('HTML URL:', htmlUrl);
console.log('Image URL:', imageUrl);

const [htmlRes, imgRes] = await Promise.all([fetch(htmlUrl), fetch(imageUrl)]);
if (!htmlRes.ok) throw new Error(`HTML download failed: ${htmlRes.status}`);
if (!imgRes.ok) throw new Error(`Image download failed: ${imgRes.status}`);

const html = await htmlRes.text();
const imgBuf = Buffer.from(await imgRes.arrayBuffer());

await mkdir(OUT_DIR, { recursive: true });
await writeFile(join(OUT_DIR, 'screen.html'), html, 'utf8');
await writeFile(join(OUT_DIR, 'screen.png'), imgBuf);
await writeFile(
  join(OUT_DIR, 'meta.json'),
  JSON.stringify({ projectId: PROJECT_ID, screenId: SCREEN_ID, htmlUrl, imageUrl }, null, 2),
  'utf8',
);

console.log('Salvo em', OUT_DIR);
