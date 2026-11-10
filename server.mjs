import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
// Missing addresses get the station's own 404 page, as GitHub Pages does with 404.html.
async function notFound(req, res) {
  let body = 'No hay nada aquí.'; let type = 'text/plain; charset=utf-8';
  try { body = await readFile(resolve(root, '404.html')); type = types['.html']; } catch {}
  res.writeHead(404, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
  res.end(req.method === 'HEAD' ? undefined : body);
}
export const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
    const relative = file.slice(root.length);
    if (!file.startsWith(root) || relative.split(sep).some(p => p.startsWith('.')) || !types[extname(file)]) {
      await notFound(req, res); return;
    }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)], 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { await notFound(req, res); }
});
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log(`ESTACIÓN 09 · puerto ${process.env.PORT || 3000}`));
}
