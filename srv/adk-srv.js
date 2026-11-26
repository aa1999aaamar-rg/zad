/* زاد v5.1 — adhkar reminders on the existing Web Push subscription (cfg.adk). Pure functions; called from dayEvents in worker-src.js.
   ev names never start with 'p' (the tick treats 'p…' as a prayer). Texts of «ذكّرني بذكر» are fixed, each with its source (verified 2026-10-25). */
const RD = [["سُبْحَانَ اللَّهِ الْعَظِيمِ، سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", "صحيح البخاري ٦٤٠٦"], ["سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ", "صحيح مسلم ٢١٣٧"], ["لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ", "صحيح البخاري ٦٣٨٤"], ["سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", "صحيح مسلم ٢٦٩٢"], ["يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ", "جامع الترمذي ٢١٤٠ · قال الترمذي: حسن"], ["﴿لَّآ إِلَـٰهَ إِلَّآ أَنتَ سُبْحَـٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّـٰلِمِينَ﴾", "سورة الأنبياء ٨٧"], ["﴿رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْـَٔاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ﴾", "سورة البقرة ٢٠١"], ["﴿حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ﴾", "سورة آل عمران ١٧٣"], ["أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", "حصن المسلم"], ["اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ", "حصن المسلم"]];
const PKA = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'], PNA = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
const mins = s => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '')); return m && +m[1] < 24 && +m[2] < 60 ? +m[1] * 60 + +m[2] : null; };
function rnd(seed) { let x = seed >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
export function adkEvents(cfg, y, m, d, key, at, getPT) {
  const a = cfg.adk || {}, out = [];
  const hm = t => String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
  if (a.rd && a.rd.on) {
    const f = mins(a.rd.from), t = mins(a.rd.to), n = Math.max(1, Math.min(8, +a.rd.n || 4));
    if (f != null && t != null && t - f >= 30) {
      const dn = Math.floor(Date.UTC(y, m - 1, d) / 864e5), r = rnd((+a.rd.s || 1) * 7919 + dn * 104729);
      const slot = (t - f) / n;
      for (let i = 0; i < n; i++) {
        const mm = Math.round(f + slot * i + slot * (0.15 + 0.7 * r()));
        const x = RD[(dn * 3 + i * 7 + (+a.rd.s || 0)) % RD.length];
        out.push({ ev: 'r' + i, day: key, at: at(hm(mm)), t: 'ذكّرني بذكر', b: x[0] + ' — ' + x[1], u: './#adkrem', tag: 'rd' + i + key });
      }
    }
  }
  let pt, ptn;
  const P = () => (pt === undefined ? (pt = getPT(0)) : pt), PN1 = () => (ptn === undefined ? (ptn = getPT(1)) : ptn);
  if (a.dh && a.dh.on && P()) out.push({ ev: 'dh', day: key, at: P().Sunrise + Math.max(15, Math.min(240, +a.dh.off || 30)) * 60e3, t: 'صلاة الضحى', b: 'تذكير بصلاة الضحى قبل الظهر', u: './#sec/adhkar', tag: 'dh' + key });
  if (a.lt && a.lt.on && P() && PN1()) { const night = PN1().Fajr - P().Maghrib; if (night > 0) out.push({ ev: 'lt', day: key, at: Math.round((PN1().Fajr - night / 3) / 60e3) * 60e3, t: 'الثلث الأخير من الليل', b: 'بدأ الثلث الأخير من الليل', u: './#qiyam', tag: 'lt' + key }); }
  if (a.sl && a.sl.on) { const s = mins(a.sl.time); if (s != null) out.push({ ev: 'sl', day: key, at: at(hm(s)), t: 'أذكار النوم', b: 'اختم يومك بأذكار النوم', u: './#adhkar/sleep', tag: 'sl' + key }); }
  if (a.ap && a.ap.on && P()) for (const k of PKA) out.push({ ev: 'x' + k, day: key, at: P()[k] + Math.max(5, Math.min(60, +a.ap.off || 10)) * 60e3, t: 'أذكار بعد صلاة ' + PNA[k], b: 'أذكار ما بعد السلام من الصلاة', u: './#adhkar/prayer', tag: 'x' + k + key });
  return out;
}
export function adkCleanCfg(c) {
  const a = (c && c.adk) || {}, hm = (x, d) => (mins(x) != null ? String(x) : d), on = o => !!(o && o.on);
  return {
    adk: {
      rd: on(a.rd) ? { on: true, n: Math.max(1, Math.min(8, Math.round(+a.rd.n || 4))), from: hm(a.rd.from, '09:00'), to: hm(a.rd.to, '21:00'), s: Math.max(1, Math.min(1e6, Math.round(+a.rd.s || 1))) } : { on: false },
      dh: on(a.dh) ? { on: true, off: Math.max(15, Math.min(240, Math.round(+a.dh.off || 30))) } : { on: false },
      lt: { on: on(a.lt) },
      sl: on(a.sl) ? { on: true, time: hm(a.sl.time, '22:30') } : { on: false },
      ap: on(a.ap) ? { on: true, off: Math.max(5, Math.min(60, Math.round(+a.ap.off || 10))) } : { on: false }
    }
  };
}
