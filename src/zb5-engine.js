/* زاد v4.9 — محرك مطابقة التسميع (window.ZTM). Pure functions, unit-tested in qa/zb5-engine-test.mjs.
   norm(): strips tashkeel and Qur'anic marks, unifies alef/hamza/ya/ta-marbuta, drops tatweel; Uthmani dagger alef → ا.
   align(expected, tokens, final): greedy word alignment with per-word Levenshtein tolerance and small drift:
   recognizer splits/merges words, drops a short particle, inserts one stray word or repeats the previous word.
   It stops at the first expected word it cannot match (a mismatch on the LAST token waits for more input unless final). */
(function(G){'use strict';
const MARKS=/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u08D3-\u08FF\u0640]/g;
function norm(s){s=String(s==null?'':s);
 s=s.replace(/\u0649\u0670/g,'\u0649').replace(/\u0648\u0670/g,'\u0627').replace(/\u0670/g,'\u0627');
 s=s.replace(MARKS,'');
 s=s.replace(/[\u0671\u0622\u0623\u0625\u0672\u0673]/g,'\u0627').replace(/\u0624/g,'\u0648').replace(/[\u0626\u0649\u06CC]/g,'\u064A').replace(/\u0621/g,'').replace(/\u0629/g,'\u0647').replace(/\u06C1/g,'\u0647').replace(/\u06A9/g,'\u0643');
 s=s.replace(/[^\u0621-\u064A\s]/g,' ').replace(/\s+/g,' ').trim();return s}
function toks(s){const n=norm(s);return n?n.split(' '):[]}
function lev(a,b){if(a===b)return 0;const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=new Array(n+1),c=new Array(n+1);for(let j=0;j<=n;j++)p[j]=j;
 for(let i=1;i<=m;i++){c[0]=i;for(let j=1;j<=n;j++){c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1))}[p,c]=[c,p]}return p[n]}
/* tolerance: exact for 1–2 letters, 1 edit up to 4 letters, then about a third of the word */
function sim(a,b){if(!a||!b)return false;if(a===b)return true;const d=lev(a,b),L=Math.max(a.length,b.length);
 if(L<=2)return false;if(L<=4)return d<=1;if(L<=7)return d<=2;return d/L<=0.3}
/* also accept a leading و/ف/ال difference the recognizer often drops or adds */
function wsim(a,b){if(sim(a,b))return true;const st=x=>x.replace(/^(و|ف)(?=..)/,'');const sa=st(a),sb=st(b);if((sa!==a||sb!==b)&&sa.length>2&&sb.length>2){const d=lev(sa,sb);if(d<=(Math.max(sa.length,sb.length)>=7?2:1)&&!(Math.max(sa.length,sb.length)<=3&&d))return true}return false}
function csim(a,b){if(a===b)return true;const d=lev(a,b);return d<=1&&Math.max(a.length,b.length)>=5}
function align(exp,tk,final){const out={pos:0,marks:[],err:null,pending:false,used:0};let i=0,j=0,ins=0;
 const E=exp.length,T=tk.length;
 while(i<E&&j<T){const e=exp[i],t=tk[j];
  if(wsim(t,e)){out.marks[i]='ok';i++;j++;ins=0;continue}
  if(j+1<T&&csim(t+tk[j+1],e)){out.marks[i]='ok';i++;j+=2;ins=0;continue}
  if(i+1<E&&csim(t,e+exp[i+1])){out.marks[i]='ok';out.marks[i+1]='ok';i+=2;j++;ins=0;continue}
  if(i+1<E&&e.length<=3&&wsim(t,exp[i+1])){out.marks[i]='soft';out.marks[i+1]='ok';i+=2;j++;ins=0;continue}
  if(i>0&&wsim(t,exp[i-1])){j++;continue}
  if(ins<1&&j+1<T&&wsim(tk[j+1],e)){ins++;j++;continue}
  if(j===T-1&&!final){out.pending=true;break}
  out.err={at:i,got:t,tok:j};break}
 out.pos=i;out.used=j;out.done=i>=E;return out}
G.ZTM={norm,toks,lev,sim:wsim,align};
})(typeof window!=='undefined'?window:globalThis);
