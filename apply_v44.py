# apply_v44.py — re-applies the v4.4 «ميزات جديدة» edits onto any later source tree (run from the source root).
import re, json, sys, os, shutil
R = sys.argv[1] if len(sys.argv) > 1 else '.'
HERE = os.path.dirname(os.path.abspath(__file__))
def rd(p): return open(os.path.join(R, p), encoding='utf-8').read()
def wr(p, s): open(os.path.join(R, p), 'w', encoding='utf-8').write(s)
def once(s, old, new, tag):
    if new in s: return s
    n = s.count(old)
    if n != 1: raise SystemExit(f'[{tag}] anchor found {n} times')
    return s.replace(old, new)
# server
w = rd('srv/worker-src.js')
w = once(w, "import { LEGACY } from './legacy.js';", "import { LEGACY } from './legacy.js';\nimport { khatmaApi, zfEvents, zfCleanCfg } from './zf-srv.js'; // v4.4", 'import')
w = once(w, "    if (u.pathname.startsWith('/api/push/')) {", "    if (u.pathname.startsWith('/api/khatma/')) { try { return await khatmaApi(u, req, env); } catch (e) { return J({ ok: false, error: String(e && e.message || e) }, 500); } } // v4.4\n    if (u.pathname.startsWith('/api/push/')) {", 'route')
w = once(w, "  return out;\n}\nfunction hm12", "  try { out.push(...zfEvents(cfg, y, m, d, at, key)); } catch (e) {} // v4.4 occasions + دقيقة زاد\n  return out;\n}\nfunction hm12", 'events')
m = re.search(r"\n(    sad: c\.sad && c\.sad\.on \?[^\n]*\{ on: false \})\n  \};", w)
if not m and 'zfCleanCfg(c)' not in w: raise SystemExit('[cleanCfg] anchor missing')
if m: w = w.replace(m.group(0), "\n" + m.group(1) + ",\n    ...zfCleanCfg(c) // v4.4\n  };")
t = re.search(r"\nconst TTL = \{[^\n]*\};\n", w)
if 'oc: 180 * 60e3' not in w: w = w.replace(t.group(0), t.group(0) + "Object.assign(GRACE, { oc: 180 * 60e3, oe: 180 * 60e3, dz: 90 * 60e3 }); Object.assign(TTL, { oc: 7200, oe: 7200, dz: 3600 }); // v4.4\n")
wr('srv/worker-src.js', w)
shutil.copy(os.path.join(HERE, 'srv', 'zf-srv.js'), os.path.join(R, 'srv', 'zf-srv.js'))
# hub exposed for zf.js
z = rd('src/z4-src.js'); z = once(z, 'const HUB=[', 'const HUB=window.ZHUB=[', 'hub'); wr('src/z4-src.js', z)
# push cfg extra fields (occasions + دقيقة زاد)
p = rd('src/zpush-src.js')
p = once(p, "sad:sd.on?{on:true,day:+sd.day||0,time:sd.time||'10:00'}:{on:false}}}}", "sad:sd.on?{on:true,day:+sd.day||0,time:sd.time||'10:00'}:{on:false},...(window.zPushX?zPushX():{})}}}", 'pushcfg')
wr('src/zpush-src.js', p)
# index.html: zf.js last
h = rd('site/index.html')
if 'src="zf.js"' not in h: h = once(h, '</body>', '<script src="zf.js"></script>\n</body>', 'index')
if 'khatma|gk' not in h: h = once(h, '<script>var APP_NAME="زاد"</script>', '<script>var APP_NAME="زاد"</script>\n<script>try{if(/^#(khatma|gk)\\/[a-z2-9]{10}$/.test(location.hash))sessionStorage.setItem(\'ammar.pendingHash\',location.hash)}catch(e){}</script>', 'index-deeplink')
wr('site/index.html', h)
# manifest shortcuts
mf = json.loads(rd('site/manifest.webmanifest'))
ic = [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"}]
mf['shortcuts'] = [
  {"name": "القبلة", "short_name": "القبلة", "url": "./#qibla", "icons": ic},
  {"name": "السبحة", "short_name": "السبحة", "url": "./#tasbeeh", "icons": ic},
  {"name": "دقيقة زاد", "short_name": "دقيقة زاد", "url": "./#dz", "icons": ic},
  {"name": "وضع السيارة", "short_name": "السيارة", "url": "./#car", "icons": ic}]
wr('site/manifest.webmanifest', json.dumps(mf, ensure_ascii=False, indent=1))
# release notes + version
u = rd('src/up-src.js')
u = re.sub(r"var APP_VERSION='[^']*';", "var APP_VERSION='4.4';", u, count=1)
if "['4.4'," not in u:
    u = once(u, "var CL=[\n", "var CL=[\n['4.4','٢٤ أكتوبر ٢٠٢٦',['ميزات جديدة: قبلة بالكاميرا، ختمة جماعية، تحدي الأسبوع، أقرب مسجد، حصادي الشهري، وضع السيارة، سبحة ذكية، عدّاد المناسبات، زاوية الأطفال، دقيقة زاد']],\n", 'CL')
wr('src/up-src.js', u)
sw = rd('site/sw.js')
sw = re.sub(r"const V='ammar-v[^']*';", "const V='ammar-v4-4';", sw, count=1)
if "'zf.js'" not in sw: sw = once(sw, "'nat.js',", "'nat.js','zf.js',", 'shell')
if "indexOf('/api/khatma/')===0" not in sw and "indexOf('/api/')===0" not in sw:
    sw = once(sw, "if(u.origin===location.origin&&(u.pathname.indexOf('/book/')===0", "if(u.origin===location.origin&&(u.pathname.indexOf('/api/khatma/')===0||u.pathname.indexOf('/book/')===0", 'sw-api-bypass')
wr('site/sw.js', sw)
for f in os.listdir(os.path.join(HERE, 'site')):
    shutil.copy(os.path.join(HERE, 'site', f), os.path.join(R, 'site', f))
print('v4.4 patches applied to', R)
