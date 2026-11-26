/* زاد v4.8.0 — موجة «نقلة نوعية» A: المصحف الناطق، الحرم مباشر، حصادي (قصة)، رحلتي، وضع رمضان.
   Lazy module on zad-content (/x/zb4.js), loaded by site/zs.js. Source: src/zb4-src.js (= zb4-pA..pD, terser → content/site/zb4.js).
   Qur'an text: api.quran.com v4 (words, text_uthmani). Audio: everyayah.com (Maher, ayah files) and quran.com recitations
   (word segments). Hadith: copied letter-for-letter from sunnah.com (see src/zb4-hadith.json). */
(function(){'use strict';if(window.ZB4)return;
const zi=window.ZI||(()=>''),ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const sv=()=>{try{save()}catch(e){}},tst=m=>{try{toast(m)}catch(e){}},vb=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const ZZ=S.zb4=Object.assign({nat:{s:1,a:1,r:'maher',sp:1,rep:1,auto:true,cont:true,rg:{on:false,f:1,t:7,n:3}},bd:{},lv:0,wr:'',rmiss:{},qd:0,live:'makkah'},S.zb4||{});
ZZ.nat=Object.assign({s:1,a:1,r:'maher',sp:1,rep:1,auto:true,cont:true},ZZ.nat||{});ZZ.nat.rg=Object.assign({on:false,f:1,t:7,n:3},ZZ.nat.rg||{});ZZ.rmiss=ZZ.rmiss||{};
const HJ=__HJ__,DUA=__DUA__;
const QA='https://api.quran.com/api/v4';
const back=(h,t)=>`<button class="back" onclick="location.hash='${h}'">${zi('chev')} ${t}</button>`;
const dayK=d=>{const x=d?new Date(d):new Date();return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const FZ=()=>{const z=S.zf=S.zf||{};z.d=z.d||{};return z};
