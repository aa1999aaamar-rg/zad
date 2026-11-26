// node qa/local-server.mjs PORT — the site's static files + the bundled Worker (/api, /admin, /go) on an in-memory D1/R2
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { makeEnv } from './d1shim.mjs'; import W from '../site/_worker.js';
globalThis.FixedLengthStream = globalThis.FixedLengthStream || class { constructor() { const t = new TransformStream(); this.readable = t.readable; this.writable = t.writable; } };
const env = makeEnv(); const ctx = { waitUntil: p => p }; const ROOT = new URL('../site/', import.meta.url).pathname; const port = +process.argv[2] || 8787;
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost:' + port);
  if (/^\/(api|admin|go)\//.test(u.pathname)) {
    const chunks = []; for await (const c of req) chunks.push(c); const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const h = new Headers(); for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') h.set(k, v); h.set('cf-connecting-ip', req.socket.remoteAddress || '1');
    try { const r = await W.fetch(new Request(u.href, { method: req.method, headers: h, body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body }), env, ctx);
      const hd = {}; r.headers.forEach((v, k) => hd[k] = v); res.writeHead(r.status, hd); res.end(Buffer.from(await r.arrayBuffer())); } catch (e) { res.writeHead(500); res.end(String(e.stack || e)); }
    return; }
  if (u.pathname === '/__adm') { const { createHash, randomBytes } = await import('node:crypto'); await env.DB.prepare('CREATE TABLE IF NOT EXISTS vid_sess (h TEXT PRIMARY KEY, exp INTEGER)').run(); const t = randomBytes(24).toString('hex'); await env.DB.prepare('INSERT INTO vid_sess (h,exp) VALUES (?,?)').bind(createHash('sha256').update('s:' + t).digest('hex'), Date.now() + 36e5).run(); res.end(t); return; }
  let p = path.join(ROOT, decodeURIComponent(u.pathname)); if (p.endsWith('/')) p += 'index.html';
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MT[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' }); fs.createReadStream(p).pipe(res);
}).listen(port, () => console.log('listening ' + port));
