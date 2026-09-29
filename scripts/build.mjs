import { cp, mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = join(root, 'outputs', 'site');
await mkdir(destination, { recursive: true });
// Only publish site assets; development checks and review documents stay local.
for (const name of ['css', 'js', 'data', 'assets']) {
  await cp(join(root, name), join(destination, name), { recursive: true, filter: source => !source.endsWith('.gitkeep') });
}
let html = await readFile(join(root, 'index.html'), 'utf8');
const base = process.env.SITE_URL?.trim();
if (base) {
  const url = new URL(base.endsWith('/') ? base : `${base}/`);
  if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash) throw new Error('SITE_URL must be an absolute HTTP(S) site base URL.');
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  html = html.replace('content="./assets/images/og-image.png"', `content="${escape(new URL('assets/images/og-image.png', url).href)}"`);
  html = html.replace('</head>', `  <link rel="canonical" href="${escape(url.href)}">\n    <meta property="og:url" content="${escape(url.href)}">\n  </head>`);
  await writeFile(join(destination, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(url.href)}</loc></url></urlset>\n`);
} else {
  await unlink(join(destination, 'sitemap.xml')).catch(error => { if (error.code !== 'ENOENT') throw error; });
}
await writeFile(join(destination, 'index.html'), html);
await writeFile(join(destination, '.nojekyll'), '');
console.log(`Static site prepared in outputs/site${base ? ' with absolute deployment metadata' : ' (local preview; SITE_URL is set automatically on GitHub Pages)'}.`);
