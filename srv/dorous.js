// زاد v5.0 «دروس زاد» — the catalogue of OFFICIAL scholars' YouTube channels (srv/dorous-data.json, each with its verification source)
// and their public RSS feeds (channel + playlist), fetched here and cached in D1 table zc_yt for ~6 h (caches.default is not allowed on this account).
// Only ids in the catalogue are fetched (no open proxy). A failed refresh serves the last good copy.
import CAT from './dorous-data.json';
const TTL = 6 * 3600e3;
const J = (o, s = 200, cc = 'no-store') => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cc, 'access-control-allow-origin': '*' } });
const ALLOW = {}; // 'ch:UC…' / 'pl:PL…' → { sh, topic }
for (const s of CAT.sheikhs) for (const c of s.channels) { ALLOW['ch:' + c.id] = { sh: s.key, title: c.title }; for (const p of c.playlists || []) ALLOW['pl:' + p.id] = { sh: s.key, topic: p.topic, title: p.title }; }
const un = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
function parse(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => { const x = m[1]; const t = (x.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ''; const v = (x.match(/<yt:videoId>([^<]+)</) || [])[1] || ''; const d = (x.match(/<published>([^<]+)</) || [])[1] || '';
    return { v, t: un(t).trim(), d }; }).filter(e => /^[A-Za-z0-9_-]{11}$/.test(e.v));
}

// YouTube's RSS feeds fail for long stretches (500/404 on 2026-10-25 for most channels), so a failed feed falls back to the public page
// (/channel/<id>/videos or /playlist?list=<id>, Arabic UI): each lockupViewModel / playlistVideoRenderer gives the video id, its title and «قبل …» age.
const AD = s => String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
function ageMs(s) {
  s = AD(s || ''); const n = +((s.match(/\d+/) || [])[0] || 0);
  const U = [[/ثاني|ثوان/, 1e3], [/دقيق|دقائق/, 6e4], [/ساع/, 36e5], [/يوم|أيام|ايام/, 864e5], [/أسبوع|اسبوع|أسابيع|اسابيع/, 6048e5], [/شهر|أشهر|اشهر|شهور/, 2592e6], [/سن|عام|أعوام/, 31536e6]];
  for (const [re, ms] of U) if (re.test(s)) { const dual = /(ين|تين)(\s|$)/.test(s.replace(/\d+/g, '')) && !n; return (n || (dual ? 2 : 1)) * ms; }
  return null;
}
const jstr = s => { try { return JSON.parse('"' + s + '"'); } catch (e) { return s; } };
async function scrape(key) {
  const [k, id] = [key.slice(0, 2), key.slice(3)];
  const url = k === 'ch' ? 'https://www.youtube.com/channel/' + encodeURIComponent(id) + '/videos?hl=ar&gl=SA' : 'https://www.youtube.com/playlist?list=' + encodeURIComponent(id) + '&hl=ar&gl=SA';
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36', 'accept-language': 'ar,en;q=0.5' } });
  if (!r.ok) throw new Error('page ' + r.status);
  const h = await r.text(), now = Date.now(), out = [], seen = new Set();
  const parts = h.split(/"(?:lockupViewModel|playlistVideoRenderer|videoRenderer)":\{/).slice(1);
  for (const c of parts) {
    const v = (c.match(/"(?:contentId|videoId)":"([A-Za-z0-9_-]{11})"/) || c.match(/\/vi\/([A-Za-z0-9_-]{11})\//) || [])[1];
    if (!v || seen.has(v)) continue;
    let t = (c.match(/"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/) || c.match(/"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/) || c.match(/"title":\{"simpleText":"((?:[^"\\]|\\.)*)"/) || [])[1];
    if (!t) continue; t = jstr(t).trim();
    const ages = [...c.matchAll(/"(?:content|simpleText|text)":"((?:قبل|منذ|بُث|تم البث)[^"]{0,40})"/g)].map(m => m[1]);
    const a = ages.length ? ageMs(ages[ages.length - 1]) : null;
    seen.add(v); out.push({ v, t, d: a != null ? new Date(now - a).toISOString() : '', ap: 1 });
    if (out.length >= (k === 'ch' ? 30 : 100)) break;
  }
  if (!out.length) throw new Error('page empty');
  return out;
}
let ok = false;
async function schema(db) { if (ok) return; await db.prepare('CREATE TABLE IF NOT EXISTS zc_yt (k TEXT PRIMARY KEY, v TEXT, t INTEGER)').run(); ok = true; }
async function fetchFeed(key) {
  const [k, id] = [key.slice(0, 2), key.slice(3)];
  const url = 'https://www.youtube.com/feeds/videos.xml?' + (k === 'ch' ? 'channel_id=' : 'playlist_id=') + encodeURIComponent(id);
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Zad-app; +https://amar-muslim.sites.tab.bot/)', 'accept-language': 'ar' } });
  if (!r.ok) throw new Error('rss ' + r.status);
  const items = parse(await r.text());
  if (!items.length) throw new Error('rss empty');
  return items;
}
async function get(db, keys, ctx, budget) {
  const out = {}, now = Date.now();
  const rows = {};
  for (let i = 0; i < keys.length; i += 50) { const part = keys.slice(i, i + 50); const r = await db.prepare(`SELECT k,v,t FROM zc_yt WHERE k IN (${part.map(() => '?').join(',')})`).bind(...part).all(); (r.results || []).forEach(x => rows[x.k] = x); }
  const stale = keys.filter(k => !rows[k] || now - rows[k].t > TTL).slice(0, budget);
  const fresh = {};
  await Promise.all(stale.map(async k => { try { fresh[k] = await fetchFeed(k); } catch (e) { try { fresh[k] = await scrape(k); } catch (e2) { } } }));
  const writes = Object.entries(fresh).map(([k, items]) => db.prepare('INSERT OR REPLACE INTO zc_yt (k,v,t) VALUES (?,?,?)').bind(k, JSON.stringify(items), now));
  if (writes.length) { const p = db.batch(writes); if (ctx && ctx.waitUntil) ctx.waitUntil(p); else await p; }
  for (const k of keys) {
    const items = fresh[k] || (rows[k] ? JSON.parse(rows[k].v) : null); if (!items) continue;
    const a = ALLOW[k]; out[k] = { k: k.slice(0, 2), id: k.slice(3), sh: a.sh, topic: a.topic || '', title: a.title || '', items, at: fresh[k] ? now : rows[k].t };
  }
  return out;
}
export async function dorous(u, req, env, ctx) {
  const p = u.pathname.replace(/^\/api\/dorous\/?/, '').replace(/\/$/, '');
  if (p === 'cat') { // the catalogue (sheikhs → channels → series), with each channel's verification source
    const sheikhs = CAT.sheikhs.map(s => ({ key: s.key, name: s.name, short: s.short, note: s.note || '', series: s.channels.reduce((n, c) => n + (c.playlists || []).length, 0),
      channels: s.channels.map(c => ({ id: c.id, title: c.title, handle: c.handle || '', verify: c.verify, playlists: (c.playlists || []).map(x => ({ id: x.id, title: x.title, topic: x.topic })) })) }));
    return J({ ok: true, checked_at: CAT.checked_at, sheikhs }, 200, 'public, max-age=3600');
  }
  const db = env.DB; if (!db) return J({ ok: false, error: 'no database' }, 500);
  await schema(db);
  if (p === 'feed') {
    const keys = [...new Set(String(u.searchParams.get('ids') || '').split(',').map(x => x.trim()).filter(k => ALLOW[k]))].slice(0, 15);
    if (!keys.length) return J({ ok: false, error: 'bad ids' }, 400);
    return J({ ok: true, feeds: await get(db, keys, ctx, 15) }, 200, 'public, max-age=600');
  }
  if (p === 'all') { // everything cached (for search); refreshes at most 20 stale feeds per call
    return J({ ok: true, feeds: await get(db, Object.keys(ALLOW), ctx, 20) }, 200, 'public, max-age=600');
  }
  return J({ ok: false, error: 'not found' }, 404);
}
