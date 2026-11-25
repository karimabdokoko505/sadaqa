/* نِداء - app logic */
var state = {
  city: JSON.parse(localStorage.getItem('city')||'null') || CITIES[0],
  voice: localStorage.getItem('voice') || 'adhan_makkah',
  enabled: JSON.parse(localStorage.getItem('enabled')||'{"fajr":true,"dhuhr":true,"asr":true,"maghrib":true,"isha":true}'),
  master: localStorage.getItem('master')!=='0'
};
function save(){ localStorage.setItem('city',JSON.stringify(state.city)); localStorage.setItem('voice',state.voice);
  localStorage.setItem('enabled',JSON.stringify(state.enabled)); localStorage.setItem('master',state.master?'1':'0');
  if(window.AndroidBridge&&AndroidBridge.syncSettings){ AndroidBridge.syncSettings(JSON.stringify(
    {city:state.city,voice:state.voice,enabled:state.enabled,master:state.master})); }
}
var PRAYERS=[["fajr","الفجر",'<svg viewBox="0 0 24 24" width="17" height="17"><path fill="#f0d98a" d="M12 4l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>'],["sunrise","الشروق",'<svg viewBox="0 0 24 24" width="17" height="17"><path fill="#f0d98a" d="M4 18h16v2H4zM12 8a5 5 0 0 1 5 5H7a5 5 0 0 1 5-5zm0-6v4M4.2 6.2l2.8 2.8M19.8 6.2L17 9" stroke="#f0d98a" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'],["dhuhr","الظهر",'<svg viewBox="0 0 24 24" width="17" height="17"><circle cx="12" cy="12" r="4.5" fill="#f0d98a"/><g stroke="#f0d98a" stroke-width="1.6" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="7" y2="7"/><line x1="17" y1="17" x2="19.1" y2="19.1"/><line x1="19.1" y1="4.9" x2="17" y2="7"/><line x1="7" y1="17" x2="4.9" y2="19.1"/></g></svg>'],["asr","العصر",'<svg viewBox="0 0 24 24" width="17" height="17"><circle cx="12" cy="14" r="4" fill="#f0d98a"/><g stroke="#f0d98a" stroke-width="1.5" stroke-linecap="round"><line x1="12" y1="7" x2="12" y2="9"/><line x1="5.5" y1="10.5" x2="7" y2="12"/><line x1="18.5" y1="10.5" x2="17" y2="12"/></g><line x1="3" y1="19" x2="21" y2="19" stroke="#f0d98a" stroke-width="1.5" stroke-linecap="round"/></svg>'],["maghrib","المغرب",'<svg viewBox="0 0 24 24" width="17" height="17"><path fill="#f0d98a" d="M4 18h16v2H4zM7 15a5 5 0 0 1 10 0z"/><line x1="12" y1="3" x2="12" y2="7" stroke="#f0d98a" stroke-width="1.6" stroke-linecap="round"/></svg>'],["isha","العشاء",'<svg viewBox="0 0 24 24" width="17" height="17"><path fill="#f0d98a" d="M15 3a8.5 8.5 0 1 0 6 14.5A10 10 0 0 1 15 3z"/></svg>']];
var ALARMS=["fajr","dhuhr","asr","maghrib","isha"];
var todayTimes=null;
function fmt(m){m=((m%1440)+1440)%1440;var h=Math.floor(m/60),mm=Math.round(m%60);if(mm===60){h=(h+1)%24;mm=0;}var ap=h<12?'ص':'م';var h12=h%12;if(h12===0)h12=12;return String(h12)+':'+String(mm).padStart(2,'0')+' '+ap;}
function arDigits(s){return String(s).replace(/[0-9]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[+d];});}
function tzOffset(){return -new Date().getTimezoneOffset()/60;}

function computeToday(){
  var now=new Date();
  todayTimes=PrayTime.compute(state.city[1],state.city[2],now.getFullYear(),now.getMonth()+1,now.getDate(),tzOffset());
}
function renderTimes(){
  computeToday();
  document.getElementById('cityName').textContent=state.city[0];
  var list=document.getElementById('prayerList'); list.innerHTML='';
  var now=new Date(); var nowMin=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
  var keys=PRAYERS.map(function(p){return p[0];});
  var nextKey=null,nextT=null,prevT=null;
  for(var i=0;i<keys.length;i++){var t=todayTimes[keys[i]]; if(t>nowMin){nextKey=keys[i];nextT=t;prevT=i>0?todayTimes[keys[i-1]]:null;break;}}
  if(!nextKey){nextKey='fajr';nextT=todayTimes.fajr+1440;prevT=todayTimes.isha;}
  if(prevT===null){prevT=todayTimes.isha-1440;}
  document.getElementById('npName').textContent=PRAYERS.filter(function(p){return p[0]===nextKey;})[0][1];
  var remain=nextT-nowMin;
  var span=nextT-prevT;
  document.getElementById('npProgress').style.width=Math.min(100,Math.max(0,(1-remain/span)*100))+'%';
  window._npT=nextT;
  PRAYERS.forEach(function(p){
    var k=p[0], row=document.createElement('div');
    row.className='prayer-row'+(k===nextKey?' next':'');
    var sw='';
    if(ALARMS.indexOf(k)>=0){ sw='<label class="switch"><input type="checkbox" data-p="'+k+'"'+(state.enabled[k]?' checked':'')+'><span class="slider"></span></label>'; }
    row.innerHTML='<div class="p-icon">'+p[2]+'</div><div class="p-name">'+p[1]+'</div><div class="p-time">'+arDigits(fmt(todayTimes[k]))+'</div>'+sw;
    list.appendChild(row);
  });
  list.querySelectorAll('input[data-p]').forEach(function(inp){
    inp.addEventListener('change',function(){ state.enabled[inp.dataset.p]=inp.checked; save(); });
  });
}
function tickClock(){
  var now=new Date();
  var hh=now.getHours();var ap=hh<12?'ص':'م';var h12=hh%12;if(h12===0)h12=12;
  var h=String(h12),m=String(now.getMinutes()).padStart(2,'0'),s=String(now.getSeconds()).padStart(2,'0');
  document.getElementById('digitalClock').textContent=arDigits(h+':'+m+':'+s)+' '+arDigits(ap);
  document.getElementById('dateLine').textContent=now.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  try{ document.getElementById('hijriLine').textContent=new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(now); }catch(e){}
  if(window._npT!=null){
    var nowMin=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
    var rem=window._npT-nowMin;
    if(rem<=0){renderTimes();return;}
    var rr=Math.round(rem*60); var hh=Math.floor(rr/3600),mm=Math.floor(rr%3600/60),ss=rr%60;
    document.getElementById('npCountdown').textContent='− '+arDigits(String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0'));
  }
}
setInterval(tickClock,1000);

/* ---------- tabs ---------- */
document.querySelectorAll('.nav-btn').forEach(function(b){
  b.addEventListener('click',function(){
    document.querySelectorAll('.nav-btn').forEach(function(x){x.classList.remove('active');});
    document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('active');});
    b.classList.add('active');
    document.getElementById(b.dataset.tab).classList.add('active');
  });
});

/* ---------- data ---------- */
var QURAN=null, AZKAR=null;


/* ---------- quran ---------- */
var AUDIO_SURAHS=[1,69,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114];
function renderSurahList(filter){
  var el=document.getElementById('surahList'); el.innerHTML='';
  for(var i=1;i<=114;i++){
    var mt=QURAN.meta[String(i)];
    if(filter && mt.name.indexOf(filter)<0 && mt.tname.indexOf(filter)<0) continue;
    var row=document.createElement('div'); row.className='surah-row';
    var hasAudio=AUDIO_SURAHS.indexOf(i)>=0;
    row.innerHTML='<div class="surah-num">'+arDigits(i)+'</div><div class="surah-name">سورة '+mt.name+'</div>'+
      (hasAudio?'<span class="surah-audio">🔊</span>':'')+
      '<div class="surah-info">'+mt.place+' · '+arDigits(mt.verses)+' آية</div>';
    (function(n){row.addEventListener('click',function(){openSurah(n);});})(i);
    el.appendChild(row);
  }
}
function openSurah(n){
  var mt=QURAN.meta[String(n)];
  document.getElementById('quranListView').classList.add('hidden');
  document.getElementById('quranReaderView').classList.remove('hidden');
  document.getElementById('readerTitle').textContent='سورة '+mt.name;
  document.getElementById('readerMeta').textContent=mt.place+' · '+arDigits(mt.verses)+' آية';
  var body=document.getElementById('readerBody');
  var html='';
  if(n!==1&&n!==9) html+='<div class="bismillah">'+QURAN.bismillah+'</div>';
  var ayahs=QURAN.surahs[String(n)];
  for(var i=0;i<ayahs.length;i++){ html+=ayahs[i]+' <span class="ayah-num">'+arDigits(i+1)+'</span> '; }
  body.innerHTML=html;
  var playBtn=document.getElementById('readerPlay'), note=document.getElementById('audioNote');
  if(AUDIO_SURAHS.indexOf(n)>=0){
    playBtn.classList.remove('hidden'); note.classList.remove('hidden');
    note.textContent=QURAN_AUDIO_NOTE;
    playBtn.onclick=function(){ toggleAudio('quran_'+String(n).padStart(3,'0')+'.mp3', playBtn); };
  } else { playBtn.classList.add('hidden'); note.classList.add('hidden'); }
  document.getElementById('tab-quran').scrollTop=0;
}
document.getElementById('readerBack').addEventListener('click',function(){
  stopAudio();
  document.getElementById('quranReaderView').classList.add('hidden');
  document.getElementById('quranListView').classList.remove('hidden');
});
document.getElementById('surahSearch').addEventListener('input',function(e){renderSurahList(e.target.value.trim());});

/* ---------- audio preview ---------- */
var curAudio=null, curBtn=null;
function toggleAudio(src,btn){
  if(curAudio && curAudio._src===src){
    if(curAudio.paused){curAudio.play();btn.textContent='⏸';}
    else{curAudio.pause();btn.textContent='▶';}
    return;
  }
  stopAudio();
  curAudio=new Audio(src); curAudio._src=src; curBtn=btn;
  curAudio.addEventListener('ended',function(){if(curBtn)curBtn.textContent='▶';});
  curAudio.play(); btn.textContent='⏸';
}
function stopAudio(){ if(curAudio){curAudio.pause();curAudio=null;} if(curBtn){curBtn.textContent='▶';curBtn=null;} }

/* ---------- adhkar ---------- */
function renderAdhkarList(filter){
  var el=document.getElementById('adhkarList'); el.innerHTML='';
  AZKAR.forEach(function(cat){
    if(filter && cat.category.indexOf(filter)<0) return;
    var row=document.createElement('div'); row.className='surah-row';
    row.innerHTML='<div class="surah-num">'+arDigits(cat.array.length)+'</div><div class="surah-name" style="font-size:15px">'+cat.category+'</div>';
    row.addEventListener('click',function(){openAdhkar(cat);});
    el.appendChild(row);
  });
}
function openAdhkar(cat){
  document.getElementById('adhkarListView').classList.add('hidden');
  document.getElementById('adhkarDetailView').classList.remove('hidden');
  document.getElementById('adhkarTitle').textContent=cat.category;
  var body=document.getElementById('adhkarBody'); body.innerHTML='';
  cat.array.forEach(function(d){
    var count=parseInt(d.count)||1;
    var card=document.createElement('div'); card.className='dhikr-card';
    card.innerHTML='<div class="dhikr-text">'+d.text+'</div>'+
      '<div class="dhikr-foot"><span class="dhikr-repeat">التكرار: '+arDigits(count)+'</span>'+
      '<button class="dhikr-count-btn">'+arDigits(count)+'</button></div>';
    var btn=card.querySelector('.dhikr-count-btn'); var left=count;
    btn.addEventListener('click',function(){
      left--; if(left<=0){left=0;btn.textContent='✓';btn.classList.add('done');}
      else btn.textContent=arDigits(left);
    });
    body.appendChild(card);
  });
  document.getElementById('tab-adhkar').scrollTop=0;
}
document.getElementById('adhkarBack').addEventListener('click',function(){
  document.getElementById('adhkarDetailView').classList.add('hidden');
  document.getElementById('adhkarListView').classList.remove('hidden');
});
document.getElementById('adhkarSearch').addEventListener('input',function(e){renderAdhkarList(e.target.value.trim());});

/* ---------- voices ---------- */
function renderVoices(){
  var el=document.getElementById('voiceList'); el.innerHTML='';
  VOICES.forEach(function(v){
    var row=document.createElement('div'); row.className='voice-row'+(state.voice===v.id?' selected':'');
    row.innerHTML='<button class="voice-play">▶</button><div class="voice-info"><div class="voice-name">'+v.name+'</div>'+
      '<div class="voice-desc">'+v.desc+' · '+v.lic+'</div></div><div class="voice-check">'+(state.voice===v.id?'✓':'')+'</div>';
    row.querySelector('.voice-play').addEventListener('click',function(ev){
      ev.stopPropagation(); toggleAudio(v.id+'.mp3', row.querySelector('.voice-play'));
    });
    row.addEventListener('click',function(){ state.voice=v.id; save(); renderVoices(); });
    el.appendChild(row);
  });
}

/* ---------- settings ---------- */
var citySel=document.getElementById('citySelect');
CITIES.forEach(function(c,i){var o=document.createElement('option');o.value=i;o.textContent=c[0];citySel.appendChild(o);});
citySel.value=CITIES.indexOf(state.city)>=0?CITIES.indexOf(state.city):0;
citySel.addEventListener('change',function(){state.city=CITIES[+citySel.value];save();renderTimes();});
document.getElementById('masterSwitch').checked=state.master;
document.getElementById('masterSwitch').addEventListener('change',function(e){state.master=e.target.checked;save();});
document.getElementById('testAdhan').addEventListener('click',function(){
  if(window.AndroidBridge&&AndroidBridge.testAdhan){AndroidBridge.testAdhan();}
  else{ var v=VOICES.filter(function(x){return x.id===state.voice;})[0]||VOICES[0];
    toggleAudio(v.id+'.mp3',document.getElementById('testAdhan')); }
});
document.getElementById('permNote').textContent=window.AndroidBridge?'ملاحظة: حساب المواقيت بطريقة الهيئة المصرية العامة للمساحة. يعمل الأذان حتى والتطبيق مغلق. بعض أجهزة أندرويد قد تحتاج استثناء التطبيق من توفير البطارية.':'ملاحظة: حساب المواقيت بطريقة الهيئة المصرية العامة للمساحة. على آيفون (نسخة المتصفح): الأذان يعمل فقط أثناء فتح التطبيق - نظام iOS لا يسمح بتشغيل الأذان في الخلفية من تطبيقات الويب. على أندرويد يعمل الأذان حتى والتطبيق مغلق.';
document.getElementById('showLicences').addEventListener('click',function(){
  var p=document.getElementById('licencePanel');
  p.classList.toggle('hidden');
  if(!p.classList.contains('hidden')&&!p.innerHTML){
    p.innerHTML='<h4>نص القرآن الكريم</h4>مشروع تنزيل (Tanzil Project) © 2007-2021 — رخصة Creative Commons Attribution 3.0. النص منقول حرفياً دون تغيير. المصدر: tanzil.net'+
    '<h4>الأذكار</h4>حصن المسلم — مجموعة بيانات Islamic Pro Azkar API — رخصة MIT.'+
    '<h4>أصوات الأذان (ويكيميديا كومنز)</h4>'+
    VOICES.map(function(v){return '• '+v.name+': '+v.by+' — <span class="'+(v.lic.indexOf('SA')>=0?'sa':'')+'">'+v.lic+'</span>';}).join('<br>')+
    '<h4>التلاوات الصوتية</h4>السور المتاحة صوتياً (الفاتحة، الحاقة، ٩٠-١١٤): تلاوة Anasskoko — <span class="sa">CC BY-SA 4.0</span> — ويكيميديا كومنز.'+
    '<h4>الخطوط</h4>Amiri Quran وTajawal — رخصة SIL Open Font License.'+
    '<h4 style="color:#f0b27a">ملاحظة المشاركة بالمثل</h4>الملفات الصوتية برخصة CC BY-SA تبقى تحت نفس الرخصة مع ذكر المصدر عند إعادة نشرها.';
  }
});

/* ---------- android status ---------- */
function refreshNativeStatus(){
  if(!(window.AndroidBridge&&AndroidBridge.getNextAlarm)) return;
  try{
    var line=document.getElementById('nextAlarmLine');
    var t=AndroidBridge.getNextAlarm&&AndroidBridge.getNextAlarm();
    if(t&&t>Date.now()){ var d=new Date(t);
      line.style.display='block';
      line.textContent='المنبه القادم: '+AndroidBridge.getNextAlarmLabel()+' '+d.toLocaleDateString('ar-EG',{weekday:'long'})+' '+arDigits(fmt(d.getHours()*60+d.getMinutes()));
    } else { line.style.display='block'; line.textContent='لا يوجد منبه مضبوط حالياً'; }
    var bar=document.getElementById('notifPermBar');
    if(AndroidBridge.notifOk&&!AndroidBridge.notifOk()){
      bar.style.display='block';
      document.getElementById('notifPermText').textContent='الإشعارات غير مسموحة - الأذان قد لا يظهر تنبيهاً';
      document.getElementById('notifPermBtn').onclick=function(){AndroidBridge.askNotif();};
    } else { bar.style.display='none'; }
  }catch(e){}
}
setInterval(refreshNativeStatus,30000);

/* ---------- init ---------- */
QURAN=QURAN_JSON; renderSurahList('');
AZKAR=AZKAR_JSON; renderAdhkarList('');
renderTimes(); renderVoices(); tickClock();
if(window.AndroidBridge&&AndroidBridge.syncSettings){ save(); refreshNativeStatus(); }

/* dev screenshot deep-links */
(function(){
  var h=location.hash;
  if(!h) return;
  function activate(id){document.querySelectorAll('.nav-btn').forEach(function(x){x.classList.toggle('active',x.dataset.tab===id);});
    document.querySelectorAll('.tab').forEach(function(x){x.classList.toggle('active',x.id===id);});}
  var tries=0;
  var iv=setInterval(function(){
    tries++;
    if(h.indexOf('#quran')===0&&QURAN){activate('tab-quran');
      var m=h.match(/surah=(\d+)/); if(m)openSurah(+m[1]); clearInterval(iv);}
    else if(h.indexOf('#adhkar')===0&&AZKAR){activate('tab-adhkar');
      var m2=h.match(/cat=(\d+)/); if(m2)openAdhkar(AZKAR[+m2[1]]); clearInterval(iv);}
    else if(h==='#muezzin'){activate('tab-muezzin');clearInterval(iv);}
    else if(h==='#misbaha'){activate('tab-misbaha');clearInterval(iv);}
    else if(h==='#duas'){activate('tab-duas');clearInterval(iv);}
    else if(h==='#khatma'){activate('tab-khatma');clearInterval(iv);}
    else if(h==='#settings'){activate('tab-settings');document.getElementById('showLicences').click();clearInterval(iv);}
    if(tries>50)clearInterval(iv);
  },100);
})();
