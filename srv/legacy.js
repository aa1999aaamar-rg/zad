export const LEGACY = {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname === '/.well-known/assetlinks.json') {
      return new Response(ASSETLINKS, { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' } });
    }
    if (u.pathname === '/install' || u.pathname === '/install/') {
      const r = await env.ASSETS.fetch(new Request(new URL('/install.html', u), { method: 'GET', headers: req.headers, redirect: 'manual' }));
      if (r.status === 200) return new Response(r.body, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
      if (r.status >= 300 && r.status < 400) { const r2 = await env.ASSETS.fetch(new Request(new URL('/install', u), { method: 'GET', headers: req.headers, redirect: 'manual' })); if (r2.status === 200) return r2; }
      return r;
    }
    if (u.pathname === '/book/raheeq.pdf') {
      if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
      const h = new Headers();
      const rg = req.headers.get('Range'); if (rg) h.set('Range', rg);
      let up;
      try { up = await fetch(RAHEEQ_SRC, { method: req.method, headers: h, redirect: 'follow', cf: { cacheTtl: 604800, cacheEverything: true } }); }
      catch (e) { return new Response('upstream error', { status: 502 }); }
      if (!(up.status === 200 || up.status === 206)) return new Response('upstream ' + up.status, { status: 502 });
      const o = new Headers();
      o.set('Content-Type', 'application/pdf');
      o.set('Accept-Ranges', 'bytes');
      for (const k of ['Content-Length', 'Content-Range', 'ETag', 'Last-Modified']) { const v = up.headers.get(k); if (v) o.set(k, v); }
      o.set('Cache-Control', 'public, max-age=604800');
      o.set('Access-Control-Allow-Origin', '*');
      o.set('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Range, Content-Length');
      o.set('Content-Disposition', 'inline; filename="raheeq-almakhtum.pdf"');
      return new Response(up.body, { status: up.status, headers: o });
    }
    return env.ASSETS.fetch(req);
  }
};
const ASSETLINKS = '[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"android_app","package_name":"bot.tab.sites.amar_muslim.zad","sha256_cert_fingerprints":["4C:11:03:63:26:6F:B7:35:B8:29:F5:EE:E1:53:9B:19:3F:20:FE:A5:4A:61:D8:5F:07:D0:B8:81:63:C2:F1:99"]}}]';
const RAHEEQ_SRC = 'https://archive.org/download/waq121774/121774.pdf';
