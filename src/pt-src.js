/* v4.0.1: prayer times computed on the device with adhan-js (no network). Answers the app's aladhan URLs locally. */
(function(G){
'use strict';
var A=G.adhan;
var p2=function(n){return String(n).padStart(2,'0')};
var HM=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
var HE=['Muḥarram','Ṣafar','Rabīʿ al-awwal','Rabīʿ al-thānī','Jumādá al-ūlá','Jumādá al-ākhirah','Rajab','Shaʿbān','Ramaḍān','Shawwāl','Dhū al-Qaʿdah','Dhū al-Ḥijjah'];
var WA=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],WE=['Al Ahad','Al Athnayn','Al Thalaata','Al Arbiaa','Al Khamees','Al Juma\'a','Al Sabt'];
function hij(d){try{var x=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12),o={};new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(x).forEach(function(q){o[q.type]=q.value});return{d:+o.day,m:+o.month,y:parseInt(o.year)}}catch(e){return null}}
function asrH(){try{return G.S&&S.settings&&S.settings.asr==='hanafi'}catch(e){return false}}
function params(method,date,hanafi){var C=A.CalculationMethod,p;switch(+method){
 case 3:p=C.MuslimWorldLeague();break;case 5:p=C.Egyptian();break;
 case 8:p=C.Other();p.fajrAngle=19.5;p.ishaInterval=90;break;
 case 9:p=C.Kuwait();break;case 10:p=C.Qatar();break;case 16:p=C.Dubai();break;
 case 2:p=C.NorthAmerica();break;case 1:p=C.Karachi();break;
 default:p=C.UmmAlQura();var h=hij(date);if(h&&h.m===9)p.ishaInterval=120;}
 p.madhab=hanafi?A.Madhab.Hanafi:A.Madhab.Shafi;return p}
/* tune = aladhan order: Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Sunset,Isha,Midnight (minutes) */
function day(lat,lng,date,method,tune,hanafi){
 tune=tune||[];var t=function(i){return +tune[i]||0};
 var co=new A.Coordinates(+lat,+lng),pr=params(method,date,hanafi);
 pr.rounding=A.Rounding.None;
 var pt=new A.PrayerTimes(co,date,pr);
 var nd=new Date(date.getFullYear(),date.getMonth(),date.getDate()+1);var nx=new A.PrayerTimes(co,nd,pr);
 var M=60000,rd=function(d){return new Date(Math.round(+d/M)*M)},add=function(d,m){return new Date(+rd(d)+m*M)};
 var asrRaw=asrAt(+lat,pt.dhuhr,pt.asr,hanafi?2:1);
 var fajr=add(pt.fajr,t(1)),sunrise=add(pt.sunrise,t(2)),dhuhr=add(pt.dhuhr,t(3)),asr=add(asrRaw,t(4)),maghrib=add(pt.maghrib,t(5)),isha=add(pt.isha,t(7));
 var sunset=add(pt.maghrib,t(6)),night=+nx.sunrise-+pt.maghrib,fl=function(d){return new Date(Math.floor(+d/M)*M)};
 return{Fajr:fajr,Sunrise:sunrise,Dhuhr:dhuhr,Asr:asr,Sunset:sunset,Maghrib:maghrib,Isha:isha,Imsak:add(pt.fajr,t(1)-10+t(0)),Midnight:new Date(+rd(new Date(+pt.maghrib+night/2))+t(8)*M),Firstthird:rd(new Date(+pt.maghrib+night/3)),Lastthird:rd(new Date(+pt.maghrib+night*2/3))}}
/* Asr with the sun's declination taken at the Asr moment itself (adhan-js uses the day's 0h value, ~1-2 min off in spring/autumn) */
var R=Math.PI/180;
function decl(ms){var D=ms/864e5+2440587.5-2451545,g=(357.529+.98560028*D)*R,q=280.459+.98564736*D,L=(q+1.915*Math.sin(g)+.020*Math.sin(2*g))*R,e=(23.439-3.6e-7*D)*R;return Math.asin(Math.sin(e)*Math.sin(L))}
function asrAt(lat,noon,guess,f){var tm=+guess;for(var i=0;i<3;i++){var d=decl(tm),a=Math.atan(1/(f+Math.tan(Math.abs(lat*R-d)))),c=(Math.sin(a)-Math.sin(lat*R)*Math.sin(d))/(Math.cos(lat*R)*Math.cos(d));if(c<-1||c>1)return guess;tm=+noon+Math.acos(c)/R/15*36e5}return new Date(tm)}
function hm(d){return p2(d.getHours())+':'+p2(d.getMinutes())}
function off(d){var o=-d.getTimezoneOffset(),s=o<0?'-':'+';o=Math.abs(o);return s+p2(Math.floor(o/60))+(o%60?':'+p2(o%60):'')}
function tz(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'}catch(e){return'UTC'}}
function dayObj(lat,lng,date,method,tune,hanafi,withOff){
 var r=day(lat,lng,date,method,tune,hanafi),tm={};
 for(var k in r)tm[k]=hm(r[k])+(withOff?' ('+off(r[k])+')':'');
 var h=hij(date)||{d:0,m:1,y:0},w=date.getDay(),g=p2(date.getDate())+'-'+p2(date.getMonth()+1)+'-'+date.getFullYear();
 return{timings:tm,date:{readable:date.toDateString(),timestamp:String(Math.floor(+date/1000)),gregorian:{date:g,day:p2(date.getDate()),month:{number:date.getMonth()+1},year:String(date.getFullYear())},
  hijri:{date:p2(h.d)+'-'+p2(h.m)+'-'+h.y,day:p2(h.d),month:{number:h.m,ar:HM[h.m-1],en:HE[h.m-1]},year:String(h.y),weekday:{ar:WA[w],en:WE[w]}}},
  meta:{latitude:+lat,longitude:+lng,timezone:tz(),method:{id:+method},school:hanafi?'HANAFI':'STANDARD',source:'device'}}}

/* v5.5.1: Hijri conversions on the device (Umm al-Qura via Intl) — answers gToH / hToG / hToGCalendar so no request leaves the app (zad.sites.tab.bot had CORS failures on api.aladhan.com) */
function p2h(n){return String(n).padStart(2,'0')}
function conv(dt){var h=hij(dt)||{d:0,m:1,y:0},w=dt.getDay();return{hijri:{date:p2h(h.d)+'-'+p2h(h.m)+'-'+h.y,format:'DD-MM-YYYY',day:p2h(h.d),weekday:{ar:WA[w],en:WE[w]},month:{number:h.m,ar:HM[h.m-1],en:HE[h.m-1]},year:String(h.y),designation:{abbreviated:'AH',expanded:'Anno Hegirae'}},
 gregorian:{date:p2h(dt.getDate())+'-'+p2h(dt.getMonth()+1)+'-'+dt.getFullYear(),format:'DD-MM-YYYY',day:p2h(dt.getDate()),weekday:{en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][w]},month:{number:dt.getMonth()+1},year:String(dt.getFullYear())}}}
function h2g(d,m,y){var jd=Math.floor((11*y+3)/30)+354*y+30*m-Math.floor((m-1)/2)+d+1948440-385,ms=(jd-2440588)*864e5,b=new Date(ms),base=new Date(b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate());
 for(var k=0;k<=6;k++){for(var s=-1;s<=1;s+=2){var x=new Date(base.getFullYear(),base.getMonth(),base.getDate()+k*s),h=hij(x);if(h&&h.d===d&&h.m===m&&h.y===y)return x;if(!k)break}}return null}
function hAnswer(u){var m=/^\/v1\/gToH\/(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(u.pathname);if(m)return{code:200,status:'OK',data:conv(new Date(+m[3],m[2]-1,+m[1]))};
 if(/^\/v1\/gToH\/?$/.test(u.pathname))return{code:200,status:'OK',data:conv(new Date())};
 m=/^\/v1\/hToG\/(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(u.pathname);if(m){var g=h2g(+m[1],+m[2],+m[3]);return g?{code:200,status:'OK',data:conv(g)}:null}
 m=/^\/v1\/hToGCalendar\/(\d{1,2})\/(\d{4})$/.exec(u.pathname);if(m){var hm=+m[1],hy=+m[2],g1=h2g(1,hm,hy);if(!g1)return null;var a=[];for(var k=0;k<31;k++){var dd=new Date(g1.getFullYear(),g1.getMonth(),g1.getDate()+k),hh=hij(dd);if(!hh||hh.m!==hm)break;a.push(conv(dd))}return{code:200,status:'OK',data:a}}
 m=/^\/v1\/gToHCalendar\/(\d{1,2})\/(\d{4})$/.exec(u.pathname);if(m){var gm=+m[1],gy=+m[2],n=new Date(gy,gm,0).getDate(),b=[];for(var i=1;i<=n;i++)b.push(conv(new Date(gy,gm-1,i)));return{code:200,status:'OK',data:b}}
 return null}
function answer(url){
 var u=new URL(url);if(u.hostname!=='api.aladhan.com')return null;
 var hz=hAnswer(u);if(hz)return hz;
 var q=u.searchParams,lat=q.get('latitude'),lng=q.get('longitude');if(lat==null||lng==null)return null;
 var method=q.get('method')||4,tune=(q.get('tune')||'').split(',').map(Number),hanafi=q.get('school')==='1'||asrH();
 var m=/^\/v1\/timings\/(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(u.pathname);
 if(m)return{code:200,status:'OK',data:dayObj(lat,lng,new Date(+m[3],m[2]-1,+m[1]),method,tune,hanafi,false)};
 m=/^\/v1\/calendar\/(\d{4})\/(\d{1,2})$/.exec(u.pathname);
 if(m){var y=+m[1],mo=+m[2],n=new Date(y,mo,0).getDate(),a=[];for(var i=1;i<=n;i++)a.push(dayObj(lat,lng,new Date(y,mo-1,i),method,tune,hanafi,true));return{code:200,status:'OK',data:a}}
 return null}
G.ZPT={day:day,dayObj:dayObj,answer:answer,hij:hij,h2g:h2g,conv:conv};
if(!A||!G.fetch||G.ZPT_OFF)return;
var F=G.fetch.bind(G);
G.fetch=function(i,o){try{var url=typeof i==='string'?i:(i&&i.url);if(url&&url.indexOf('api.aladhan.com/v1/')>-1){var r=answer(url);if(r)return Promise.resolve(new Response(JSON.stringify(r),{status:200,headers:{'Content-Type':'application/json'}}))}}catch(e){}return F(i,o)};
})(typeof window!=='undefined'?window:globalThis);
