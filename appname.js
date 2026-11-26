
const acorn=require('acorn'),fs=require('fs');
const files=process.argv.slice(2);const N='عمار';
for(const f of files){
 let s=fs.readFileSync(f,'utf8');let ast;
 try{ast=acorn.parse(s,{ecmaVersion:'latest',sourceType:'script'})}catch(e){console.log('PARSE FAIL',f,e.message);continue}
 const reps=[];
 (function walk(n){if(!n||typeof n.type!=='string')return;
  if(n.type==='Literal'&&typeof n.value==='string'&&n.value.includes(N)&&!n.value.includes('أم عمار')){
    const raw=s.slice(n.start,n.end),q=raw[0];
    if(raw===q+N+q)reps.push([n.start,n.end,'APP_NAME']);
    else reps.push([n.start,n.end,raw.split(N).join(q+'+APP_NAME+'+q)]);
  }
  if(n.type==='TemplateElement'&&n.value.raw.includes(N)){reps.push([n.start,n.end,s.slice(n.start,n.end).split(N).join('${APP_NAME}')])}
  for(const k in n){const v=n[k];if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v.type==='string')walk(v)}})(ast);
 reps.sort((a,b)=>b[0]-a[0]);for(const [a,b,t] of reps)s=s.slice(0,a)+t+s.slice(b);
 fs.writeFileSync(f,s);console.log(f,reps.length,'left:',(s.match(/عمار/g)||[]).length);
}
