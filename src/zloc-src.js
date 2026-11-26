/* زاد v4.4.6: all 13 regions + 151 governorates/region seats in the picker (grouped, searchable); names from the nearest governorate.
   زاد v4.4.5: prayer-times location. Never fall back to Riyadh silently.
   Order: GPS (S.loc) > a city the user picked (S.zloc.by==='user') > approximate location from /api/geo (request.cf) > Riyadh labelled «افتراضي».
   Hooks: wraps the global curLoc / loadTimes / locate from app.js; decorates the home hero, the prayer page and onboarding through a MutationObserver. */
(function(){'use strict';
if(typeof S==='undefined'||typeof CITIES==='undefined')return;
const Z=S.zloc=S.zloc||{};
/* migration (runs once): existing users keep what they chose; the untouched default «riyadh» is treated as not chosen */
if(!Z.v){Z.v=1;const ch=S.settings.city&&S.settings.city!=='riyadh',th=S.b3&&S.b3.travel&&S.b3.travel.home;Z.by=S.loc?'gps':(ch?'user':'');Z.homeBy=(ch||th)?'user':'';try{save()}catch(e){}}
const R=Math.PI/180,km=(a,b,c,d)=>{const x=Math.sin((c-a)*R/2)**2+Math.cos(a*R)*Math.cos(c*R)*Math.sin((d-b)*R/2)**2;return 12742*Math.asin(Math.sqrt(x))};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const PIN='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';
const GPSI='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
/* Arabic names for places outside the 17-city list: [ar, lat, lng, english name as Cloudflare spells it] */
const X=[["الخرج",24.155,47.334,"Al Kharj"],["الجبيل",27.011,49.658,"Jubail"],["ينبع",24.089,38.064,"Yanbu"],["القطيف",26.565,49.996,"Qatif"],["حفر الباطن",28.432,45.971,"Hafar Al-Batin"],["خميس مشيط",18.306,42.729,"Khamis Mushait"],["الباحة",20.012,41.465,"Al Bahah"],["عرعر",30.975,41.038,"Arar"],["القريات",31.332,37.343,"Qurayyat"],["المجمعة",25.904,45.345,"Al Majma'ah"],["الزلفي",26.299,44.815,"Az Zulfi"],["عنيزة",26.084,43.994,"Unaizah"],["الرس",25.869,43.497,"Ar Rass"],["الدوادمي",24.507,44.392,"Ad Dawadimi"],["رابغ",22.799,39.035,"Rabigh"],["بيشة",19.983,42.606,"Bisha"],["صبيا",17.15,42.626,"Sabya"],["شرورة",17.467,47.117,"Sharurah"],["وادي الدواسر",20.466,44.783,"Wadi ad-Dawasir"],["الأفلاج",22.28,46.73,"Layla"],["القنفذة",19.127,41.079,"Al Qunfudhah"],["الليث",20.15,40.27,"Al Lith"],["محايل عسير",18.546,42.047,"Muhayil"],["طريف",31.672,38.663,"Turaif"],["رفحاء",29.626,43.493,"Rafha"],["الخفجي",28.439,48.491,"Khafji"],["بقيق",25.934,49.668,"Abqaiq"],["الظهران",26.288,50.114,"Dhahran"],
["دبي",25.2048,55.2708,"Dubai"],["أبوظبي",24.4539,54.3773,"Abu Dhabi"],["الشارقة",25.3463,55.4209,"Sharjah"],["العين",24.2075,55.7447,"Al Ain"],["عجمان",25.4052,55.5136,"Ajman"],["رأس الخيمة",25.8007,55.9762,"Ras al-Khaimah"],["الفجيرة",25.1288,56.3265,"Fujairah"],["الدوحة",25.2854,51.531,"Doha"],["المنامة",26.2285,50.586,"Manama"],["مسقط",23.588,58.3829,"Muscat"],["صلالة",17.0151,54.0924,"Salalah"],["صحار",24.347,56.709,"Sohar"],["الجهراء",29.337,47.658,"Al Jahra"],["الأحمدي",29.077,48.084,"Al Ahmadi"],
["القاهرة",30.0444,31.2357,"Cairo"],["الإسكندرية",31.2001,29.9187,"Alexandria"],["عمّان",31.9454,35.9284,"Amman"],["إربد",32.5556,35.85,"Irbid"],["بيروت",33.8938,35.5018,"Beirut"],["بغداد",33.3152,44.3661,"Baghdad"],["البصرة",30.5085,47.7804,"Basra"],["أربيل",36.1911,44.0092,"Erbil"],["الموصل",36.34,43.13,"Mosul"],["الخرطوم",15.5007,32.5599,"Khartoum"],["صنعاء",15.3694,44.191,"Sanaa"],["عدن",12.7855,45.0187,"Aden"],["الرباط",34.0209,-6.8416,"Rabat"],["الدار البيضاء",33.5731,-7.5898,"Casablanca"],["مراكش",31.6295,-7.9811,"Marrakesh"],["تونس",36.8065,10.1815,"Tunis"],["الجزائر",36.7538,3.0588,"Algiers"],["طرابلس",32.8872,13.1913,"Tripoli"],["القدس",31.7683,35.2137,"Jerusalem"],["غزة",31.5017,34.4668,"Gaza"],["حلب",36.2021,37.1343,"Aleppo"],["حمص",34.7324,36.7137,"Homs"],["اللاذقية",35.5317,35.7901,"Latakia"],["نواكشوط",18.0735,-15.9582,"Nouakchott"],["مقديشو",2.0469,45.3182,"Mogadishu"],["جيبوتي",11.5721,43.1456,"Djibouti"],
["إسطنبول",41.0082,28.9784,"Istanbul"],["أنقرة",39.9334,32.8597,"Ankara"],["لندن",51.5074,-0.1278,"London"],["مانشستر",53.4808,-2.2426,"Manchester"],["باريس",48.8566,2.3522,"Paris"],["برلين",52.52,13.405,"Berlin"],["أمستردام",52.3676,4.9041,"Amsterdam"],["نيويورك",40.7128,-74.006,"New York"],["واشنطن",38.9072,-77.0369,"Washington"],["لوس أنجلوس",34.0522,-118.2437,"Los Angeles"],["شيكاغو",41.8781,-87.6298,"Chicago"],["تورونتو",43.6532,-79.3832,"Toronto"],["كوالالمبور",3.139,101.6869,"Kuala Lumpur"],["جاكرتا",-6.2088,106.8456,"Jakarta"],["كراتشي",24.8607,67.0011,"Karachi"],["لاهور",31.5204,74.3587,"Lahore"],["إسلام آباد",33.6844,73.0479,"Islamabad"],["دكا",23.8103,90.4125,"Dhaka"],["دلهي",28.7041,77.1025,"Delhi"],["مومباي",19.076,72.8777,"Mumbai"],["طهران",35.6892,51.389,"Tehran"],["موسكو",55.7558,37.6173,"Moscow"],["سيدني",-33.8688,151.2093,"Sydney"]];
const CEN={riyadh:"Riyadh",makkah:"Mecca",madinah:"Medina",jeddah:"Jeddah",dammam:"Dammam",khobar:"Al Khobar",taif:"Taif",buraidah:"Buraidah",hail:"Hail",tabuk:"Tabuk",abha:"Abha",jazan:"Jazan",najran:"Najran",jouf:"Sakakah",ahsa:"Al Hofuf",kuwait:"Kuwait City",damascus:"Damascus"};
/* v4.4.6 dataset: 13 regions → seat first, then governorates (ar.wikipedia «قائمة محافظات السعودية»; coords Wikidata P36→P625 / OSM). 4th item = the old CITIES key (kept so old choices resolve). New keys are 'g:'+name, defined non-enumerable on CITIES so the old 17-city selects stay short. */
const ZR=[["منطقة الرياض",[["الرياض",24.7136,46.6753,"riyadh"],["الدرعية",24.7333,46.5756],["الخرج",24.1483,47.305],["الدوادمي",24.5182,44.3991],["المجمعة",25.9039,45.3456],["القويعية",24.0464,45.2656],["الأفلاج",22.2833,46.7333],["وادي الدواسر",20.4644,44.7872],["الزلفي",26.2833,44.8],["شقراء",25.2483,45.2528],["حوطة بني تميم",23.4868,46.8845],["عفيف",23.9034,42.9479],["الغاط",26.0267,44.9608],["السليل",20.4597,45.5744],["ضرما",24.6173,46.2256],["المزاحمية",24.4822,46.2561],["رماح",25.5612,47.1781],["ثادق",25.281,45.863],["حريملاء",25.1169,46.1002],["الحريق",23.6336,46.5139],["مرات",25.0701,45.4615],["الرين",23.5406,45.5108],["الدلم",23.9903,47.2095]]],["منطقة مكة المكرمة",[["مكة المكرمة",21.4225,39.8262,"makkah"],["جدة",21.5433,39.1728,"jeddah"],["الطائف",21.2703,40.4158,"taif"],["القنفذة",19.1417,41.0797],["الليث",20.1538,40.2868],["رابغ",22.786,39.0443],["خليص",22.1539,39.3183],["الخرمة",21.9233,42.1081],["رنية",21.2597,42.8485],["تربة",21.2142,41.6331],["الجموم",21.6269,39.7031],["الكامل",22.264,39.7982],["المويه",22.433,41.7524],["ميسان",20.735,40.8791],["أضم",20.4501,40.8828],["العرضيات",19.4348,41.7021],["بحرة",21.4031,39.4462]]],["منطقة المدينة المنورة",[["المدينة المنورة",24.4672,39.6111,"madinah"],["ينبع",24.0894,38.0619],["العلا",26.6089,37.9236],["المهد",23.5036,40.8597],["الحناكية",24.88,40.515],["بدر",23.78,38.7907],["خيبر",25.6986,39.2925],["العيص",25.06,38.1081],["وادي الفرع",23.4829,39.8422]]],["منطقة القصيم",[["بريدة",26.3592,43.9818,"buraidah"],["عنيزة",26.084,43.994],["الرس",25.8667,43.5],["المذنب",25.8589,44.2232],["البكيرية",26.1504,43.6626],["البدائع",25.9795,43.7701],["الأسياح",26.7855,44.2187],["النبهانية",25.8582,43.0729],["الشماسية",26.3179,44.2643],["عيون الجواء",26.4944,43.6352],["رياض الخبراء",26.0613,43.5519],["عقلة الصقور",25.8271,42.2],["ضرية",24.7141,42.9437],["أبانات",25.5067,42.8614]]],["المنطقة الشرقية",[["الدمام",26.4207,50.0888,"dammam"],["الأحساء",25.3833,49.5833,"ahsa"],["حفر الباطن",28.4342,45.9636],["الجبيل",27,49.6667],["القطيف",26.5586,50.0087],["الخبر",26.2172,50.1971,"khobar"],["الخفجي",28.4211,48.4956],["رأس تنورة",26.7064,50.0528],["بقيق",25.935,49.6661],["النعيرية",27.4742,48.4789],["قرية العليا",27.5596,47.7015],["العديد",24.7408,50.7583],["البيضاء",26.4215,49.995]]],["منطقة عسير",[["أبها",18.2164,42.5053,"abha"],["خميس مشيط",18.3,42.7333],["بيشة",20,42.6],["النماص",19.12,42.13],["محايل عسير",18.5464,42.0489],["ظهران الجنوب",17.6637,43.531],["تثليث",19.5339,43.5024],["سراة عبيدة",18.0873,43.1348],["رجال ألمع",18.212,42.273],["بلقرن",19.7,41.9167],["أحد رفيدة",18.1968,42.822],["المجاردة",19.1302,41.9236],["البرك",18.2172,41.5364],["بارق",18.9322,41.9439],["تنومة",18.9472,42.1764],["طريب",18.5674,43.2071],["الحرجة",17.9218,43.3677]]],["منطقة تبوك",[["تبوك",28.3835,36.5662,"tabuk"],["الوجه",26.2833,36.4167],["ضباء",27.3521,35.6921],["تيماء",27.6226,38.5393],["أملج",25.0303,37.2622],["حقل",29.2861,34.9386],["البدع",28.4947,35.0122]]],["منطقة حائل",[["حائل",27.5114,41.7208,"hail"],["بقعاء",27.9103,42.3899],["الغزالة",26.7875,41.3157],["الشنان",27.175,42.4439],["الحائط",25.986,40.472],["السليمي",26.2833,41.35],["الشملي",26.8558,40.3229],["موقق",27.3858,41.1756],["سميراء",26.4942,42.1249]]],["منطقة الحدود الشمالية",[["عرعر",30.9833,41.0167],["رفحاء",29.6324,43.5179],["طريف",31.6668,38.664],["العويقيلة",30.3633,42.2382]]],["منطقة جازان",[["جازان",16.8892,42.5511,"jazan"],["صبيا",17.1549,42.6268],["أبو عريش",16.9689,42.8325],["صامطة",16.5972,42.9439],["بيش",17.3833,42.5667],["الدرب",17.7228,42.2525],["الحرث",16.7886,43.2219],["ضمد",17.1051,42.7795],["الريث",17.6,42.85],["فرسان",16.7022,42.1183],["الدائر",17.3388,43.1335],["العارضة",17.0395,43.0837],["أحد المسارحة",16.7107,42.9531],["العيدابي",17.2352,42.9404],["فيفاء",17.2633,43.1067],["الطوال",16.5286,42.9772],["هروب",17.4354,42.9049]]],["منطقة نجران",[["نجران",17.4917,44.1322,"najran"],["شرورة",17.4833,47.1167],["حبونا",17.8518,44.0232],["بدر الجنوب",17.8,43.7333],["يدمة",18.5292,44.2031],["ثار",17.9749,44.1108],["خباش",17.5499,44.7411]]],["منطقة الباحة",[["الباحة",20.0138,41.4656],["بلجرشي",19.8594,41.5572],["المندق",20.1077,41.2878],["المخواة",19.7794,41.4356],["قلوة",20.0,41.0833],["العقيق",20.2836,41.656],["القرى",20.2508,41.3504],["غامد الزناد",19.5944,41.5201],["الحجرة",20.2333,41.05],["بني حسن",20.0535,41.3737]]],["منطقة الجوف",[["سكاكا",29.9697,40.2064,"jouf"],["القريات",31.3318,37.3428],["دومة الجندل",29.8059,39.8667],["طبرجل",30.5007,38.2165]]]];
function defKey(k,v){try{Object.defineProperty(CITIES,k,{value:v,enumerable:false,configurable:true,writable:true})}catch(e){}}
const P=[];ZR.forEach((g,ri)=>g[1].forEach((p,i)=>{const k=p[3]||'g:'+p[0];P.push({k:k,n:p[0],la:p[1],ln:p[2],r:ri,c:!i});if(!CITIES[k])defKey(k,[p[0],p[1],p[2]])}));
const OUT=Object.keys(CITIES).filter(k=>!P.some(p=>p.k===k));
if(Z.pl&&Z.pl[0]&&!CITIES[Z.pl[0]])defKey(Z.pl[0],Z.pl.slice(1));
const URB={riyadh:25,jeddah:20,makkah:12,madinah:12,dammam:12,ahsa:10,taif:8,khobar:8};
const bonus=p=>URB[p.k]||(p.c?8:0);
const norm=t=>String(t||'').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/(^|\s)(محافظه|منطقه|مدينه)\s+/g,'$1').replace(/\s+/g,' ').trim().toLowerCase();
const keys=()=>Object.keys(CITIES);
function nearKey(lat,lng,max){max=max||30;let b=null,s=1e9;P.forEach(p=>{const x=km(lat,lng,p.la,p.ln),o=bonus(p);if(x<max+o&&x-o<s){s=x-o;b=p.k}});OUT.forEach(k=>{const c=CITIES[k],x=km(lat,lng,c[1],c[2]);if(x<max&&x<s){s=x;b=k}});return b}
function nameAt(lat,lng,max){const k=nearKey(lat,lng,40);if(k)return CITIES[k][0];let b=null,d=max||30;X.forEach(c=>{const x=km(lat,lng,c[1],c[2]);if(x<d){d=x;b=c[0]}});return b}
function arOf(en){if(!en)return null;const e=String(en).toLowerCase();for(const k in CEN)if(CEN[k].toLowerCase()===e)return CITIES[k]&&CITIES[k][0];const x=X.find(c=>c[3].toLowerCase()===e);return x?x[0]:null}
function defAuto(){try{if(Z.home)Object.defineProperty(CITIES,'auto',{value:Z.home,enumerable:false,configurable:true,writable:true})}catch(e){}}
defAuto();
/* the travel module's «home city»: set from the first real fix, never over the user's own choice */
function setHome(lat,lng,name,src){if(Z.homeBy==='user'||Z.homeBy==='gps')return;const tr=S.b3&&S.b3.travel;const k=nearKey(lat,lng,30);
 if(k){S.settings.city=k;if(tr&&tr.home==='auto')delete tr.home}else{Z.home=[name||'مدينتي',lat,lng];defAuto();if(tr&&!tr.home)tr.home='auto'}Z.homeBy=src}
function prettyLoc(){if(!S.loc)return;if(Z.by!=='gps')Z.by='gps';if(S.loc.zv!==2||S.loc.name==='موقعي الحالي'&&S.loc.zn){const first=S.loc.zn===undefined,n=nameAt(S.loc.lat,S.loc.lng,30);S.loc.zv=2;S.loc.zn=n||'';S.loc.name=n||'موقعي الحالي';if(first)setHome(S.loc.lat,S.loc.lng,n,'gps')}}
function setGps(c){S.loc={lat:c.latitude,lng:c.longitude,name:'موقعي الحالي'};Z.by='gps';prettyLoc();Z.gpsAt=Date.now();Z.perm='granted';try{save()}catch(e){}}
/* /api/geo: the request's approximate place from the network (no permission needed) */
let ipP=null;
function ensureIp(force){if(ipP)return ipP;if(!force&&Z.ip&&Z.ip.zv===2&&Date.now()-Z.ip.at<6*36e5)return Promise.resolve(false);
 ipP=Promise.race([fetch('/api/geo',{cache:'no-store'}).then(r=>r.ok?r.json():null),new Promise(r=>setTimeout(()=>r(null),6000))]).then(j=>{ipP=null;
  if(!j||j.latitude==null||!isFinite(+j.latitude)||!isFinite(+j.longitude))return false;
  const la=+j.latitude,ln=+j.longitude,k=nearKey(la,ln,30),old=Z.ip;
  const ip=k?{lat:CITIES[k][1],lng:CITIES[k][2],name:CITIES[k][0],key:k}:{lat:la,lng:ln,name:arOf(j.city)||nameAt(la,ln,30)||j.city||j.region||j.country||'موقعك'};
  ip.zv=2;ip.at=Date.now();ip.cc=j.country||'';ip.tz=j.timezone||'';ip.en=j.city||'';Z.ip=ip;setHome(ip.lat,ip.lng,ip.name,'ip');try{save()}catch(e){}
  return !old||km(old.lat,old.lng,ip.lat,ip.lng)>1}).catch(()=>{ipP=null;return false});return ipP}
const needIp=()=>!S.loc&&Z.by!=='user';
/* curLoc: GPS > user's city > approximate > labelled default */
const _cur=window.curLoc;
curLoc=function(){prettyLoc();if(S.loc)return S.loc;
 if(Z.by==='user'||!Z.ip){const k=CITIES[S.settings.city]?S.settings.city:'riyadh',c=CITIES[k];return{lat:c[1],lng:c[2],name:Z.by==='user'?c[0]:c[0]+' (افتراضي)',dflt:Z.by!=='user'}}
 return{lat:Z.ip.lat,lng:Z.ip.lng,name:Z.ip.name,approx:true}};
const _lt=loadTimes;
loadTimes=async function(){try{if(needIp()&&!Z.ip)await Promise.race([ensureIp(),new Promise(r=>setTimeout(r,2500))])}catch(e){}
 const r=await _lt.apply(this,arguments);try{if(PT)PT.name=curLoc().name;after()}catch(e){}return r};
/* push: re-send lat/lng/city/tz when the place changes, so closed-app adhan follows the user */
function after(){const l=curLoc(),k=l.lat.toFixed(3)+','+l.lng.toFixed(3);if(Z.pk!==k){Z.pk=k;try{save()}catch(e){}try{window.zPushSync&&zPushSync()}catch(e){}}}
const hashK=()=>(location.hash.slice(1)||'home').split('/')[0];
function rerender(){const h=hashK();if(['home','prayer','travel','qibla'].indexOf(h)>-1)try{route()}catch(e){}}
locate=function(cb){
 if(!navigator.geolocation){toast('تحديد الموقع غير متاح في جهازك، اختر مدينتك');openPick();return}
 toast('جارٍ تحديد موقعك…');
 navigator.geolocation.getCurrentPosition(p=>{setGps(p.coords);toast('تم تحديد موقعك: '+(S.loc.zn||'موقعك الحالي')+' ✓');loadTimes(!0).then(()=>{cb?cb():rerender()})},
  e=>{if(e&&e.code===1)Z.perm='denied';try{save()}catch(x){}
   ensureIp(true).then(()=>loadTimes(!0)).then(()=>{toast(e&&e.code===1?'إذن الموقع مغلق، استخدمنا موقعك التقريبي: '+curLoc().name:'تعذّر تحديد الموقع، استخدمنا موقعك التقريبي: '+curLoc().name);rerender()})},
  {enableHighAccuracy:false,timeout:15000,maximumAge:6e5})};
/* explicit picks */
function pickCity(k){if(!CITIES[k])return;S.loc=null;S.settings.city=k;Z.pl=[k].concat(CITIES[k].slice(0,3));Z.by='user';Z.homeBy='user';const tr=S.b3&&S.b3.travel;if(tr&&tr.home==='auto')delete tr.home;try{save()}catch(e){}loadTimes(!0).then(rerender)}
function pickAuto(){S.loc=null;Z.by='';try{save()}catch(e){}ensureIp(true).then(()=>loadTimes(!0)).then(rerender)}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.id)return;
 if((t.id==='city'||t.id==='obc')&&CITIES[t.value]){Z.by='user';Z.homeBy='user';const tr=S.b3&&S.b3.travel;if(tr&&tr.home==='auto')delete tr.home}
 if((t.id==='city'||t.id==='obc')&&t.value==='__auto'){e.stopImmediatePropagation();if(t.id==='city')pickAuto();else{S.loc=null;Z.by='';try{save()}catch(x){}}}},true);
/* picker sheet: GPS first, then the approximate place, then search + all regions grouped (seat first) */
const CHEV='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
function listHTML(cur){let h='';ZR.forEach((g,ri)=>{const it=P.filter(p=>p.r===ri);
  h+=`<div class="zlpg" data-rq="${esc(norm(g[0]))}"><div class="zlph">${esc(g[0])}<i>${it.length}</i></div>${it.map(p=>`<button class="zlpi${cur===p.k?' on':''}" data-zk="${esc(p.k)}" data-q="${esc(norm(p.n))}"><span>${esc(p.n)}</span>${p.c?'<i>مقر الإمارة</i>':''}</button>`).join('')}</div>`});
 if(OUT.length)h+=`<div class="zlpg" data-rq="خارج المملكه"><div class="zlph">خارج المملكة<i>${OUT.length}</i></div>${OUT.map(k=>`<button class="zlpi${cur===k?' on':''}" data-zk="${esc(k)}" data-q="${esc(norm(CITIES[k][0]))}"><span>${esc(CITIES[k][0])}</span></button>`).join('')}</div>`;
 return h+'<p class="zlpe" hidden>لم نجد هذا الاسم، جرّب اسم المحافظة أو اضغط «حدّد موقعي»</p>'}
function filt(el,v){const q=norm(v),qs=q.replace(/^ال/,'');let any=0;
 el.querySelectorAll('.zlpg').forEach(g=>{const rm=!!q&&q.length>1&&g.dataset.rq.indexOf(qs)>-1;let n=0;
  g.querySelectorAll('.zlpi').forEach(b=>{const ok=!q||rm||b.dataset.q.indexOf(q)>-1||b.dataset.q.indexOf(qs)>-1;b.hidden=!ok;if(ok)n++});g.hidden=!n;any+=n});
 const e=el.querySelector('.zlpe');if(e)e.hidden=!!any}
function openPick(done){if(typeof openSheet!=='function')return;if(typeof done!=='function')done=null;const l=curLoc(),src=S.loc?'gps':Z.by==='user'?'user':Z.ip?'ip':'def';
 openSheet(`<div class="zlp"><b class="zlpt">موقعك لمواقيت الصلاة</b><small class="zlps">الحالي: ${esc(l.name)}${src==='ip'?' · تقريبي':src==='gps'?' · من GPS':''}</small>
 <button class="btn gold block" id="zlpgo">${GPSI} حدّد موقعي</button>
 ${Z.ip?`<button class="zlpi zlpa ${src==='ip'?'on':''}" data-zk="__auto">${PIN}<span>موقعك التقريبي: ${esc(Z.ip.name)}</span><i>تلقائي</i></button>`:''}
 <input class="zlpq" id="zlpq" type="search" enterkeyhint="search" placeholder="ابحث عن مدينتك أو محافظتك" autocomplete="off">
 <div class="zlpl" id="zlpl">${listHTML(src==='user'?S.settings.city:'')}</div></div>`,(el,close)=>{
  el.querySelector('#zlpgo').onclick=()=>{close();locate(()=>{rerender();done&&done('__gps')})};
  el.querySelectorAll('[data-zk]').forEach(b=>b.onclick=()=>{close();const k=b.dataset.zk;k==='__auto'?pickAuto():pickCity(k);toast('تم: '+b.querySelector('span').textContent);done&&done(k)});
  const q=el.querySelector('#zlpq'),L=el.querySelector('#zlpl');q.oninput=()=>{filt(L,q.value);L.scrollTop=0};
  const on=L.querySelector('.zlpi.on');if(on)setTimeout(()=>{L.scrollTop=Math.max(0,on.offsetTop-90)},60)})}
window.zLocPick=openPick;
/* UI */
const st=document.createElement('style');st.textContent=`
.zsky .zlchg{background:rgba(255,255,255,.18);border:0;color:#fff;font:inherit;font-size:11.5px;font-weight:700;border-radius:999px;padding:2px 10px;margin-top:6px;margin-inline-start:6px;cursor:pointer}
.zsky .loc span{max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zlc{display:block}.zlc .zlch{display:flex;gap:12px;align-items:flex-start}.zlc .zlci{width:42px;height:42px;flex:none;border-radius:14px;display:grid;place-items:center;background:var(--z-soft,#eef0f7);color:var(--accent,#34457a)}
.zlc .zlci svg{width:22px;height:22px}.zlc b{display:block;font-size:15px;line-height:1.5}.zlc small{display:block;font-size:12.5px;opacity:.75;margin-top:2px;line-height:1.6}
.zlc .zlcx{background:none;border:0;font-size:22px;line-height:1;color:inherit;opacity:.45;padding:0 4px;cursor:pointer;margin-inline-start:auto}
.zlc .zlcb{display:flex;gap:8px;margin-top:12px}.zlc .zlcb .btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;margin:0}
.zlrow{display:flex;align-items:center;gap:10px;padding:12px 14px}.zlrow .grow{flex:1;min-width:0}.zlrow b{display:block;font-size:15px}.zlrow small{font-size:12px;opacity:.7}
.zlrow .zlchg2{border:1px solid var(--line,#e6e1d6);background:var(--card,#fffefb);color:var(--accent,#34457a);font:inherit;font-weight:700;font-size:13px;border-radius:999px;padding:6px 14px;cursor:pointer}
.zlp{padding:4px 2px 10px}.zlpt{display:block;font-size:17px}.zlps{display:block;opacity:.7;font-size:12.5px;margin:2px 0 12px}
.zlp .btn{display:flex;align-items:center;justify-content:center;gap:8px}
.zlpq{width:100%;margin:12px 0 8px;padding:10px 12px;border-radius:12px;border:1px solid var(--line,#e6e1d6);background:var(--card,#fff);color:inherit;font:inherit}
.zlpl{max-height:42vh;overflow:auto}.zlpi{display:flex;width:100%;align-items:center;gap:10px;padding:11px 10px;border:0;border-bottom:1px solid var(--line,#e6e1d6);background:none;color:inherit;font:inherit;font-size:15px;text-align:start;cursor:pointer}
.zlpi svg{color:var(--accent,#34457a);flex:none}.zlpi span{flex:1}.zlpi i{font-style:normal;font-size:11.5px;opacity:.6}.zlpi.on{color:var(--accent,#34457a);font-weight:700}
.zlpi[hidden],.zlpg[hidden]{display:none}
.zlpl{position:relative;max-height:52vh;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.zlph{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;padding:9px 10px 7px;font-size:13px;font-weight:700;color:var(--accent,#34457a);background:var(--z-soft,var(--card,#fffefb));border-bottom:1px solid var(--line,#e6e1d6)}
.zlph i{font-style:normal;font-weight:600;font-size:11px;opacity:.6}
.zlpg .zlpi{padding:12px 14px;font-size:15px}.zlpi.zlpa{border:1px solid var(--line,#e6e1d6);border-radius:12px;margin-top:10px}
.zlpe{text-align:center;opacity:.7;font-size:13.5px;padding:18px 8px}
.zlsel{display:flex;width:100%;align-items:center;gap:8px;padding:12px 14px;border-radius:12px;border:1px solid var(--line,#e6e1d6);background:var(--card,#fffefb);color:inherit;font:inherit;font-size:15px;text-align:start;cursor:pointer}
.zlsel svg{color:var(--accent,#34457a);flex:none}.zlsel span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`;document.head.appendChild(st);
const srcTxt=()=>S.loc?'موقعك الحالي (GPS)':Z.by==='user'?'مدينة اخترتها':Z.ip?'موقعك التقريبي حسب الشبكة':'افتراضي، حدّد موقعك';
const showCard=()=>!S.loc&&Z.by!=='user'&&!(Z.off&&Date.now()-Z.off<7*864e5);
function cardHTML(){const l=curLoc(),den=Z.perm==='denied';
 return`<section class="zcard zlc" id="zlc"><div class="zlch"><span class="zlci">${PIN}</span><div class="grow"><b>حدّد موقعك لتكون مواقيت الصلاة دقيقة</b><small>${Z.ip?`نستخدم الآن موقعك التقريبي: <bdi>${esc(Z.ip.name)}</bdi>`:`المواقيت الآن على <bdi>${esc(l.name)}</bdi>`}${den?'<br>إذن الموقع مغلق من إعدادات الجوال، فعّله أو اختر مدينتك':''}</small></div><button class="zlcx" aria-label="إخفاء">×</button></div>
 <div class="zlcb"><button class="btn gold" data-zl="go">${GPSI} حدّد موقعي</button><button class="btn ghost" data-zl="pick">اختر مدينتك</button></div></section>`}
function bindCard(c){c.querySelector('[data-zl="go"]').onclick=()=>locate();c.querySelector('[data-zl="pick"]').onclick=openPick;c.querySelector('.zlcx').onclick=()=>{Z.off=Date.now();try{save()}catch(e){}c.remove()}}
function decorate(){const v=document.getElementById('view');if(!v)return;const h=hashK(),l=curLoc();
 /* home hero: city name + «غيّر» */
 const a=v.querySelector('#zsky a.loc');if(a&&!a.dataset.zl){a.dataset.zl=1;const svg=a.querySelector('svg');a.textContent='';if(svg)a.append(svg);const sp=document.createElement('span');sp.textContent=l.approx?'موقعك التقريبي: '+l.name:l.name;a.append(sp);
  const b=document.createElement('button');b.className='zlchg';b.textContent='غيّر';b.onclick=e=>{e.preventDefault();openPick()};a.after(b)}
 if(h==='home'){const sky=v.querySelector('#zsky');if(sky&&!v.querySelector('#zlc')&&showCard()){sky.insertAdjacentHTML('afterend',cardHTML());bindCard(v.querySelector('#zlc'))}}
 /* prayer page */
 if(h==='prayer'){const t=v.querySelector('h1.page');if(t&&!v.querySelector('#zlrow')){t.insertAdjacentHTML('afterend',`<section class="card zlrow" id="zlrow"><span class="zlci" style="color:var(--accent,#34457a)">${PIN}</span><div class="grow"><b>${esc(l.name)}</b><small>${srcTxt()}</small></div><button class="zlchg2" id="zlchg">غيّر</button></section>`+(showCard()?cardHTML():''));
   v.querySelector('#zlchg').onclick=openPick;const c=v.querySelector('#zlc');if(c)bindCard(c)}
  const sel=v.querySelector('#city');if(sel&&!sel.dataset.zl){sel.dataset.zl=1;fixSel(sel);swapSel(sel,null)}}
 /* travel mode «home city»: same select, grouped by region */
 const th=v.querySelector('#thc');if(th&&!th.dataset.zl){th.dataset.zl=1;groupSel(th)}
 /* onboarding step «مدينتك» */
 const ob=v.querySelector('#obc');if(ob&&!ob.dataset.zl){ob.dataset.zl=1;fixSel(ob);swapSel(ob,k=>{setOpt(ob,k)});const p=ob.parentNode.querySelector('p');if(p)p.textContent='حدّد موقعك لتكون مواقيت الصلاة دقيقة. نطلب الإذن مرة واحدة فقط.';
  const bl=v.querySelector('#obloc');if(bl){bl.classList.remove('ghost');bl.classList.add('gold');bl.innerHTML=GPSI+' حدّد موقعي';const go=v.querySelector('#obgo');if(go){go.classList.remove('gold');go.classList.add('ghost')}}}}
function fixSel(sel){if(S.loc){const o=[...sel.options].find(o=>!o.value||!CITIES[o.value]);if(o){o.textContent='موقعي: '+S.loc.name;o.selected=true}return}
 if(Z.by!=='user'){const o=document.createElement('option');o.value='__auto';o.textContent=Z.ip?'موقعك التقريبي: '+Z.ip.name:'تلقائي (حسب موقعك)';sel.prepend(o);o.selected=true;sel.value='__auto'}}
/* the prayer page and onboarding: the long list lives in the sheet; the select stays (hidden) for the app's own handlers */
function selLabel(){const l=curLoc();return S.loc?'موقعي: '+l.name:l.approx?'موقعك التقريبي: '+l.name:l.dflt?'اختر مدينتك أو محافظتك':l.name}
function swapSel(sel,after){sel.style.display='none';if(!S.loc&&Z.by==='user'&&CITIES[S.settings.city])setOpt(sel,S.settings.city);const b=document.createElement('button');b.type='button';b.className='zlsel';b.setAttribute('aria-label','اختر المدينة');
 const paint=()=>{b.innerHTML=PIN+'<span></span>'+CHEV;b.querySelector('span').textContent=selLabel()};paint();
 b.onclick=()=>openPick(k=>{after&&after(k);setTimeout(paint,30)});sel.after(b)}
function setOpt(sel,k){if(k==='__gps'){let o=[...sel.options].find(o=>!o.value);if(!o){o=document.createElement('option');o.value='';sel.prepend(o)}o.textContent='موقعي: '+(S.loc?S.loc.name:'');sel.value='';return}
 if(![...sel.options].some(o=>o.value===k)){const o=document.createElement('option');o.value=k;o.textContent=k==='__auto'?'تلقائي':(CITIES[k]||[k])[0];sel.prepend(o)}sel.value=k}
function groupSel(sel){const cur=(S.b3&&S.b3.travel&&S.b3.travel.home)||S.settings.city;let h='';
 if(cur&&!P.some(p=>p.k===cur)&&OUT.indexOf(cur)<0&&CITIES[cur])h+=`<option value="${esc(cur)}">${esc(CITIES[cur][0])}</option>`;
 ZR.forEach((g,ri)=>{h+=`<optgroup label="${esc(g[0])}">`+P.filter(p=>p.r===ri).map(p=>`<option value="${esc(p.k)}">${esc(p.n)}</option>`).join('')+'</optgroup>'});
 if(OUT.length)h+='<optgroup label="خارج المملكة">'+OUT.map(k=>`<option value="${esc(k)}">${esc(CITIES[k][0])}</option>`).join('')+'</optgroup>';
 sel.innerHTML=h;if(cur)sel.value=cur}
let mq=0;const mo=new MutationObserver(()=>{if(mq)return;mq=requestAnimationFrame(()=>{mq=0;try{decorate()}catch(e){}})});
function start(){const v=document.getElementById('view');if(v)mo.observe(v,{childList:true,subtree:true});try{decorate()}catch(e){}
 /* approximate place: refresh in the background, recompute if it moved */
 if(needIp())ensureIp(!!(Z.ip&&Z.ip.zv!==2)).then(ch=>{if(ch&&needIp())loadTimes(!0).then(rerender)});
 fresh();document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){fresh();if(needIp())ensureIp().then(ch=>{if(ch&&needIp())loadTimes(!0).then(rerender)})}})}
/* keep it fresh: permission already granted → re-read the position at most every 30 min */
async function fresh(force){if(!navigator.geolocation||!navigator.permissions||Z.by==='user')return;let s;try{s=(await navigator.permissions.query({name:'geolocation'})).state}catch(e){return}
 if(Z.perm!==s){Z.perm=s;try{save()}catch(e){}}if(s!=='granted')return;const tr=S.b3&&S.b3.travel||{};if(!force&&S.loc&&Date.now()-Math.max(Z.gpsAt||0,tr.checked||0)<18e5)return;
 navigator.geolocation.getCurrentPosition(p=>{const c=p.coords,moved=!S.loc||km(S.loc.lat,S.loc.lng,c.latitude,c.longitude)>3;Z.gpsAt=Date.now();if(tr)tr.checked=Date.now();
  if(moved){setGps(c);loadTimes(!0).then(rerender)}else{try{save()}catch(e){}}},()=>{},{timeout:12000,maximumAge:force?0:9e5})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(start,50),{once:true}):setTimeout(start,50);
window.zLoc={Z,P,ZR,norm,openPick,curLoc:()=>curLoc(),ensureIp,nameAt,nearKey,pickCity,pickAuto,fresh};
})();
