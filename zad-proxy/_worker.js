// «زاد» — zad.sites.tab.bot
// Serves the very same app as amar-muslim.sites.tab.bot, on the same backend (same D1/R2 via the
// amar-muslim Worker): every request is forwarded there, nothing is stored here.
const UP = "amar-muslim.sites.tab.bot";
const KEY = "7d0f8ed215a6b0eeb030fde1a5b9f940";
export default {
  async fetch(request) {
    const inUrl = new URL(request.url);
    const me = inUrl.host;
    if (inUrl.pathname === "/__zad-proxy") {
      return new Response(JSON.stringify({ ok: true, proxy: "zad", upstream: UP }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }
    const up = new URL(inUrl.pathname + inUrl.search, "https://" + UP);
    const h = new Headers(request.headers);
    h.delete("host");
    h.set("x-zad-ip", request.headers.get("cf-connecting-ip") || "");
    h.set("x-zad-key", KEY);
    h.set("x-zad-host", me);
    const cf = request.cf || {}, hv = k => request.headers.get(k) || undefined;
    let city = cf.city || hv("cf-ipcity"); try { if (!cf.city && city) city = decodeURIComponent(escape(city)); } catch (e) {}
    const geo = { country: cf.country || hv("cf-ipcountry"), city, latitude: cf.latitude != null ? cf.latitude : hv("cf-iplatitude"), longitude: cf.longitude != null ? cf.longitude : hv("cf-iplongitude"), timezone: cf.timezone || hv("cf-timezone"), region: cf.region || hv("cf-region") };
    h.set("x-zad-geo", encodeURIComponent(JSON.stringify(geo)));
    const init = { method: request.method, headers: h, redirect: "manual" };
    if (request.method !== "GET" && request.method !== "HEAD") init.body = request.body;
    let res;
    try { res = await fetch(up.toString(), init); }
    catch (e) { return new Response("upstream error", { status: 502 }); }
    const out = new Headers(res.headers);
    const loc = out.get("location");
    if (loc && loc.includes(UP)) out.set("location", loc.split(UP).join(me));
    out.set("x-zad-via", "zad");
    return new Response(request.method === "HEAD" ? null : res.body, { status: res.status, statusText: res.statusText, headers: out });
  }
};
