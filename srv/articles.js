// زاد v4.3: articles added by the admin (عمار) from /admin/articles. Stored in D1 table art_items (additive, idempotent).
// Public: GET /api/articles (list), GET /api/articles/<id> (body). Admin: same session as /admin/videos (table vid_sess, header Authorization: Bearer <session>).
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const sha = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const J = (o, s = 200, c = 'no-store') => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': c } });
const CATS = ['isl', 'cul', 'his'];
let ok = false;
async function schema(db) {
  if (ok) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS art_items (id TEXT PRIMARY KEY, c TEXT, t TEXT, au TEXT, src TEXT, url TEXT, h TEXT, ex TEXT, w INTEGER, created INTEGER, updated INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS vid_sess (h TEXT PRIMARY KEY, exp INTEGER)')
  ]);
  ok = true;
}
async function isAdmin(db, req) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!/^[a-f0-9]{48}$/.test(t)) return false;
  const r = await db.prepare('SELECT exp FROM vid_sess WHERE h=?').bind(await sha('s:' + t)).first();
  return !!r && r.exp > Date.now();
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toHtml(body) {
  return String(body).replace(/\r/g, '').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean).map(b => {
    if (/^#{1,3}\s+/.test(b)) return '<h3>' + esc(b.replace(/^#{1,3}\s+/, '')) + '</h3>';
    return '<p>' + esc(b).replace(/\n/g, '<br>') + '</p>';
  }).join('');
}
const clip = (s, n) => String(s || '').trim().slice(0, n);
export async function articles(u, req, env) {
  const db = env.DB; if (!db) return J({ ok: false, error: 'nodb' }, 503);
  await schema(db);
  const parts = u.pathname.replace(/^\/api\/articles\/?/, '').split('/').filter(Boolean);
  const M = req.method;
  if (!parts.length && M === 'GET') {
    const r = await db.prepare('SELECT id,c,t,au,src,url,ex,w,created FROM art_items ORDER BY created DESC LIMIT 300').all();
    return J({ ok: true, items: (r.results || []) }, 200, 'public, max-age=60');
  }
  if (parts[0] !== 'admin') {
    if (M !== 'GET' || parts.length !== 1) return J({ ok: false }, 404);
    const r = await db.prepare('SELECT id,h FROM art_items WHERE id=?').bind(parts[0]).first();
    return r ? J(r, 200, 'public, max-age=60') : J({ ok: false }, 404);
  }
  if (!(await isAdmin(db, req))) return J({ ok: false, error: 'auth' }, 401);
  const op = parts[1] || '';
  if (op === 'list') {
    const r = await db.prepare('SELECT id,c,t,au,src,url,w,created,updated FROM art_items ORDER BY created DESC LIMIT 300').all();
    return J({ ok: true, items: r.results || [] });
  }
  if (M !== 'POST') return J({ ok: false }, 405);
  const b = await req.json().catch(() => ({}));
  if (op === 'save') {
    const c = CATS.includes(b.c) ? b.c : 'isl', t = clip(b.t, 160), body = clip(b.body, 60000);
    if (!t || body.length < 20) return J({ ok: false, error: 'العنوان والنص مطلوبان' }, 400);
    let url = clip(b.url, 400); if (url && !/^https?:\/\//i.test(url)) url = '';
    const h = toHtml(body), plain = body.replace(/^#{1,3}\s+/gm, '').replace(/\s+/g, ' ').trim(), w = plain.split(' ').length, ex = plain.slice(0, 200), now = Date.now();
    const id = /^u[a-z0-9]{8,16}$/.test(b.id || '') ? b.id : 'u' + hex(crypto.getRandomValues(new Uint8Array(6)));
    const n = await db.prepare('SELECT COUNT(*) n FROM art_items').first();
    if (!b.id && n && n.n >= 300) return J({ ok: false, error: 'الحد ٣٠٠ مقال' }, 400);
    await db.prepare('INSERT INTO art_items (id,c,t,au,src,url,h,ex,w,created,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET c=excluded.c,t=excluded.t,au=excluded.au,src=excluded.src,url=excluded.url,h=excluded.h,ex=excluded.ex,w=excluded.w,updated=excluded.updated')
      .bind(id, c, t, clip(b.au, 120), clip(b.src, 120), url, h, ex, w, now, now).run();
    return J({ ok: true, id });
  }
  if (op === 'get') { const r = await db.prepare('SELECT * FROM art_items WHERE id=?').bind(String(b.id || '')).first(); return r ? J({ ok: true, item: r }) : J({ ok: false }, 404); }
  if (op === 'delete') { await db.prepare('DELETE FROM art_items WHERE id=?').bind(String(b.id || '')).run(); return J({ ok: true }); }
  return J({ ok: false }, 404);
}
