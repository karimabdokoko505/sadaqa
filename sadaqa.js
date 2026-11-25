/* صدقة جارية - مسبحة وأدعية وختمة (merged from sadaqa app) */
"use strict";
var $s=function(id){return document.getElementById(id);};
var store={
  get:function(k,d){try{var v=localStorage.getItem("sadaqa_"+k);return v===null?d:JSON.parse(v);}catch(e){return d;}},
  set:function(k,v){try{localStorage.setItem("sadaqa_"+k,JSON.stringify(v));}catch(e){}}
};
var arD=(typeof arDigits==="function")?arDigits:function(s){return String(s);};
function toast(msg){var t=$s("toast");t.textContent=msg;t.classList.add("show");clearTimeout(t._tm);t._tm=setTimeout(function(){t.classList.remove("show");},2200);}
function buzz(){if(navigator.vibrate)try{navigator.vibrate(25);}catch(e){}}

/* ---------- WhatsApp share ---------- */
(function(){
  var pageUrl=location.href.split("?")[0].split("#")[0];
  var shareText="صدقة جارية على روح المغفور له بإذن الله عبدالمنصف السيد ابراهيم شعبان — مواقيت الصلاة والقرآن الكريم والأذكار والمسبحة والختمة الجماعية. شارك ليعم الأجر: "+pageUrl;
  $s("waShare").href="https://wa.me/?text="+encodeURIComponent(shareText);
})();

/* ---------- Misbaha ---------- */
const DHIKR=["سبحان الله","الحمد لله","لا إله إلا الله","الله أكبر","أستغفر الله العظيم","اللهم صلِّ وسلم على نبينا محمد"];
const N="عبدالمنصف"; // المغفور له عبدالمنصف السيد ابراهيم شعبان
const DUAS=[
 {t:"اللهم اغفر لـ"+N+" وارحمه وعافه واعفُ عنه، وأكرم نزله ووسّع مدخله، واغسله بالماء والثلج والبرد، ونقّه من الخطايا كما يُنقّى الثوب الأبيض من الدنس",s:"من دعاء صلاة الجنازة — رواه مسلم"},
 {t:"اللهم أبدل "+N+" داراً خيراً من داره، وأهلاً خيراً من أهله، وأدخله الجنة، وأعذه من عذاب القبر ومن عذاب النار",s:"من دعاء صلاة الجنازة — رواه مسلم"},
 {t:"اللهم اغفر لحيّنا وميّتنا، وشاهدنا وغائبنا، وصغيرنا وكبيرنا، وذكرنا وأنثانا",s:"رواه أبو داود والترمذي وصححه"},
 {t:"اللهم لا تحرمنا أجره، ولا تفتنّا بعده، واغفر لنا وله",s:"رواه الترمذي وابن ماجه"},
 {t:"اللهم يا حنان يا منان، وسّع قبر "+N+" ونوّره له فيه، وارفعه في عليّين مع النبيين والصديقين والشهداء والصالحين وحسن أولئك رفيقاً",s:"دعاء"},
 {t:"اللهم اجعل "+N+" من أهل الفردوس الأعلى بغير حساب ولا سابقة عذاب، واجمعنا به مستقيمين على طاعتك",s:"دعاء"},
 {t:"اللهم إن "+N+" في ذمتك وحبل جوارك، فقه من فتنة القبر وعذاب النار، وأنت أهل الوفاء والحق، فاغفر له وارحمه إنك أنت الغفور الرحيم",s:"رواه ابن ماجه وصححه الألباني"},
 {t:"اللهم اجعل ما قرأناه وما عملناه في هذا العمل في ميزان حسنات "+N+"، وتقبله منا صدقة جارية عنه",s:"دعاء"}
];
const AJZA=["الم","سَيَقُولُ","تِلْكَ الرُّسُلُ","لَنْ تَنَالُوا","وَالْمُحْصَنَاتُ","لَا يُحِبُّ اللَّهُ","وَإِذَا سَمِعُوا","وَلَوْ أَنَّنَا","قَالَ الْمَلَأُ","وَاعْلَمُوا","يَعْتَذِرُونَ","وَمَا مِنْ دَابَّةٍ","وَمَا أُبَرِّئُ","رُبَمَا","سُبْحَانَ الَّذِي","قَالَ أَلَمْ","اقْتَرَبَ لِلنَّاسِ","قَدْ أَفْلَحَ","وَقَالَ الَّذِينَ","أَمَّنْ خَلَقَ","اتْلُ مَا أُوحِيَ","وَمَنْ يَقْنُتْ","وَمَا لِيَ","فَمَنْ ظَلَمَ","إِلَيْهِ يُرَدُّ","حم","قَالَ فَمَا خَطْبُكُمْ","قَدْ سَمِعَ اللَّهُ","تَبَارَكَ الَّذِي","عَمَّ"];
(function(){
var counts=store.get("misbaha_counts",DHIKR.map(function(){return 0;}));
if(!counts||counts.length!==DHIKR.length)counts=DHIKR.map(function(){return 0;});
var sel=store.get("misbaha_sel",0);
function renderMisbaha(){
  var ds=$s("dhikrSelect");ds.innerHTML="";
  DHIKR.forEach(function(d,i){
    var b=document.createElement("button");
    b.textContent=d;if(i===sel)b.classList.add("sel");
    b.addEventListener("click",function(){sel=i;store.set("misbaha_sel",sel);renderMisbaha();});
    ds.appendChild(b);
  });
  $s("dhikrNow").textContent=DHIKR[sel];
  $s("countNow").textContent=arD(counts[sel]);
  $s("grandTotal").textContent=arD(counts.reduce(function(a,b){return a+b;},0));
}
var audioCtx=null;
function clickSound(){
  if(!$s("soundToggle").checked)return;
  try{
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
    var o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.type="sine";o.frequency.value=880;g.gain.setValueAtTime(.06,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.09);
    o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.1);
  }catch(e){}
}
$s("tapZone").addEventListener("click",function(){
  counts[sel]++;store.set("misbaha_counts",counts);
  $s("countNow").textContent=arD(counts[sel]);
  $s("grandTotal").textContent=arD(counts.reduce(function(a,b){return a+b;},0));
  buzz();clickSound();
});
$s("resetBtn").addEventListener("click",function(){
  counts[sel]=0;store.set("misbaha_counts",counts);renderMisbaha();toast("تم تصفير العداد الحالي");
});
$s("soundToggle").checked=store.get("misbaha_sound",false);
$s("soundToggle").addEventListener("change",function(){store.set("misbaha_sound",$s("soundToggle").checked);});
renderMisbaha();
})();

/* ---------- Duas ---------- */
(function(){
var duaList=$s("duaList");
DUAS.forEach(function(d){
  var c=document.createElement("div");c.className="card dua-card";
  c.innerHTML='<div class="dua-text"></div><div class="dua-src"></div><div class="dua-actions"><button class="cp">نسخ الدعاء</button><a class="wa" target="_blank" rel="noopener">مشاركة عبر واتساب</a></div>';
  c.querySelector(".dua-text").textContent=d.t;
  c.querySelector(".dua-src").textContent=d.s;
  c.querySelector(".wa").href="https://wa.me/?text="+encodeURIComponent(d.t+"\n\n(صدقة جارية على روح عبدالمنصف السيد ابراهيم شعبان)");
  c.querySelector(".cp").addEventListener("click",function(){
    function done(){toast("تم نسخ الدعاء");}
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(d.t).then(done,function(){fallback();});
    } else fallback();
    function fallback(){
      var ta=document.createElement("textarea");ta.value=d.t;document.body.appendChild(ta);
      ta.select();try{document.execCommand("copy");done();}catch(_){toast("تعذر النسخ على هذا المتصفح");}
      ta.remove();
    }
  });
  duaList.appendChild(c);
});
})();

/* ---------- Khatma ---------- */
(function(){
var juzState=store.get("khatma",AJZA.map(function(){return false;}));
if(!juzState||juzState.length!==30)juzState=AJZA.map(function(){return false;});
function renderKhatma(){
  var g=$s("juzGrid");g.innerHTML="";
  AJZA.forEach(function(nm,i){
    var c=document.createElement("div");c.className="juz"+(juzState[i]?" read":"");
    c.innerHTML='<div class="num">الجزء '+arD(i+1)+'</div><div class="nm"></div>';
    c.querySelector(".nm").textContent=nm;
    c.addEventListener("click",function(){juzState[i]=!juzState[i];store.set("khatma",juzState);buzz();renderKhatma();});
    g.appendChild(c);
  });
  var done=juzState.filter(Boolean).length,pct=Math.round(done/30*100);
  $s("khatmaBar").style.width=pct+"%";$s("khatmaBar").textContent=arD(pct)+"٪";
  $s("khatmaLabel").textContent=done===30?"ما شاء الله، اكتملت الختمة. تقبل الله منكم":"تمت قراءة "+arD(done)+" من ٣٠ جزءاً";
}
$s("khatmaReset").addEventListener("click",function(){
  juzState=AJZA.map(function(){return false;});store.set("khatma",juzState);renderKhatma();toast("بدأت ختمة جديدة");
});
renderKhatma();
})();
