// زاد v4.9 — unit tests for the recitation matcher (src/zb5-engine.js). node qa/zb5-engine-test.mjs src/zb5-engine.js qa/quran-sample.json
// The "recognizer" text is quran.com's own text_imlaei for the same ayah (no tashkeel), never typed by hand.
import fs from 'fs';
eval(fs.readFileSync(process.argv[2],'utf8'));const Z=globalThis.ZTM;
const D=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
let pass=0,fail=0;const ck=(n,ok,i)=>{ok?pass++:fail++;if(!ok||process.env.V)console.log((ok?'PASS ':'FAIL ')+n+(i?' '+JSON.stringify(i):''))};
// 1) normalisation
ck('norm strips tashkeel + wasla alef',Z.norm('ٱلرَّحْمَـٰنِ')==='الرحمان',Z.norm('ٱلرَّحْمَـٰنِ'));
ck('norm ta marbuta + dagger alef after waw',Z.norm('ٱلصَّلَوٰةَ')===Z.norm('الصلاة').replace('ة','ه')||Z.sim(Z.norm('ٱلصَّلَوٰةَ'),Z.norm('الصلاة')),[Z.norm('ٱلصَّلَوٰةَ'),Z.norm('الصلاة')]);
ck('norm alef maqsura → ya',Z.norm('موسىٰ')==='موسي',Z.norm('موسىٰ'));
ck('norm hamza forms',Z.norm('إِيَّاكَ')==='اياك'&&Z.norm('يُؤْمِنُونَ')==='يومنون',[Z.norm('إِيَّاكَ'),Z.norm('يُؤْمِنُونَ')]);
ck('norm drops tatweel and Qur\'anic marks',Z.norm('ٱلْكِتَـٰبُ ۛ')==='الكتاب',Z.norm('ٱلْكِتَـٰبُ ۛ'));
// 2) whole sample: Uthmani words vs the imla'i text must align fully
let tot=0,bad=[];for(const s of Object.keys(D))for(const v of D[s]){const exp=v.u.map(Z.norm).filter(Boolean),r=Z.align(exp,Z.toks(v.i),true);tot++;if(!r.done)bad.push(v.k)}
ck(`uthmani vs imla'i, ${tot} ayat fully matched`,bad.length===0,bad.slice(0,10));
// 3) deliberate mistakes: a word swapped for an unrelated word must stop exactly there
const all=[];for(const s of Object.keys(D))for(const v of D[s])all.push(v);
let rnd=7;const R=n=>{rnd=(rnd*1103515245+12345)%2147483648;return rnd%n};
let sw=0,swOk=0,swBad=[];for(const v of all){const exp=v.u.map(Z.norm).filter(Boolean);if(exp.length<5)continue;const tk=Z.toks(v.i);if(tk.length!==exp.length)continue;
 const at=1+R(exp.length-1);let w=null;for(let k=0;k<40&&!w;k++){const o=all[R(all.length)],ot=Z.toks(o.i);const c=ot[R(ot.length)];if(c&&c.length>=4&&!exp.some(x=>Z.sim(x,c))&&!(at+1<exp.length&&Z.sim(c+(tk[at+1]||''),exp[at])))w=c}if(!w)continue;
 const t2=tk.slice();t2[at]=w;const r=Z.align(exp,t2,true);sw++;if(r.err&&r.err.at===at)swOk++;else swBad.push([v.k,at,w,r.err])}
ck(`swapped word stops at the right word (${swOk}/${sw})`,sw>200&&swOk/sw>=0.99,swBad.slice(0,5));
// 4) a long word skipped by the reciter stops at that word
let sk=0,skOk=0,skBad=[];for(const v of all){const exp=v.u.map(Z.norm).filter(Boolean),tk=Z.toks(v.i);if(exp.length<5||tk.length!==exp.length)continue;let at=-1;for(let k=1;k<exp.length-1;k++)if(exp[k].length>=5&&!Z.sim(exp[k+1],exp[k])){at=k;break}if(at<0)continue;
 const t2=tk.slice();t2.splice(at,1);const r=Z.align(exp,t2,true);sk++;if(r.err&&r.err.at===at)skOk++;else skBad.push([v.k,at,r.err])}
ck(`skipped long word stops there (${skOk}/${sk})`,sk>100&&skOk/sk>=0.97,skBad.slice(0,5));
// 5) tolerated drift: recognizer splits يا+أيها, drops a short particle, repeats a word, inserts one stray word
const ex=Z.toks('يا أيها الذين آمنوا اتقوا الله'),u=['يَـٰٓأَيُّهَا','ٱلَّذِينَ','ءَامَنُوا۟','ٱتَّقُوا۟','ٱللَّهَ'].map(Z.norm);
ck('split words (يا أيها ↔ يٰأيها)',Z.align(u,ex,true).done);
ck('repeated word tolerated',Z.align(u,Z.toks('يا أيها الذين الذين آمنوا اتقوا الله'),true).done);
ck('one stray inserted word tolerated',Z.align(u,Z.toks('يا أيها الذين اه آمنوا اتقوا الله'),true).done);
const f=D['1'][4].u.map(Z.norm);ck('short particle dropped by recognizer is soft, not an error',(()=>{const r=Z.align(Z.toks('ثم الله يعلم'),Z.toks('الله يعلم'),true);return r.done&&r.marks[0]==='soft'})());
// 6) streaming: a mismatch on the last interim token waits; final decides
const e112=D['112'][0].u.map(Z.norm);const st=Z.toks(D['112'][0].i);
ck('pending on last token while streaming',Z.align(e112,st.slice(0,2).concat(['سمع']),false).pending===true);
ck('final makes it an error at that word',(()=>{const r=Z.align(e112,st.slice(0,2).concat(['سمع']),true);return r.err&&r.err.at===2})());
// 7) a fake recognition stream (interim → final chunks) with one deliberate mistake in the 3rd ayah of al-Mulk
const ay=D['67'].slice(0,4);const expAll=[],ayOf=[];ay.forEach((v,ix)=>v.u.forEach(w=>{const n=Z.norm(w);if(n){expAll.push(n);ayOf.push(ix)}}));
const spoken=[];ay.forEach((v,ix)=>Z.toks(v.i).forEach(t=>spoken.push(t)));const start3=ayOf.indexOf(2);const mi=start3+3;const wrong='الارض';
const spk=spoken.slice();spk[mi]=wrong;let stopAt=null,consumed=0;
for(let n=1;n<=spk.length&&stopAt==null;n++){const r=Z.align(expAll,spk.slice(0,n),false);if(r.err){stopAt=r.err.at;consumed=n}}
if(stopAt==null){const r=Z.align(expAll,spk,true);stopAt=r.err&&r.err.at}
ck(`fake stream stops at the deliberate mistake (word #${mi+1}, ayah 67:3 word 4: «${expAll[mi]}»)`,stopAt===mi,{stopAt,mi,said:wrong,consumed});
console.log(`zb5 engine: ${pass} passed, ${fail} failed`);process.exit(fail?1:0);
