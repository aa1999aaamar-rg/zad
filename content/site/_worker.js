// زاد content host: static JSON for the articles and quotes sections (+ v4.4.4 promo images under /promo, CORS copy at /x/promo/*.jpg for the share sheet), served with CORS under /x/<path>
// (static files are served before this worker runs, so the CORS route is a path that is not a file).
export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS', 'Access-Control-Max-Age': '86400' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: cors });
    const u = new URL(req.url);
    let r;
    if (u.pathname.startsWith('/x/')) {
      const p = u.pathname.slice(2);
      if (!/^\/[a-z0-9_\-\/]+\.(json|js|jpg)$/i.test(p)) return new Response('Not found', { status: 404, headers: cors });
      r = await env.ASSETS.fetch(new Request(new URL(p, u), { method: req.method }));
    } else r = await env.ASSETS.fetch(req);
    const h = new Headers(r.headers);
    for (const k in cors) h.set(k, cors[k]);
    if (u.pathname.endsWith('.json')) { h.set('Content-Type', 'application/json; charset=utf-8'); h.set('Cache-Control', 'public, max-age=600'); }
    else if (u.pathname.endsWith('.jpg')) { h.set('Content-Type', 'image/jpeg'); h.set('Cache-Control', 'public, max-age=86400'); }
    else if (u.pathname.endsWith('.js')) { h.set('Content-Type', 'text/javascript; charset=utf-8'); h.set('Cache-Control', 'public, max-age=3600'); }
    h.set('X-Content-Type-Options', 'nosniff');
    return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
  }
};
