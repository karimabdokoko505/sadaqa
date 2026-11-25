/* PWA extras: service worker + adhan while app is open (iOS/Safari path) */
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(function(){}); }
if(!window.AndroidBridge){
  var lastFired=null;
  setInterval(function(){
    try{
      if(!state.master||!todayTimes) return;
      var now=new Date();
      var nowMin=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
      ['fajr','dhuhr','asr','maghrib','isha'].forEach(function(k){
        if(!state.enabled[k]) return;
        var t=todayTimes[k];
        if(Math.abs(nowMin-t)<0.5 && lastFired!==k+now.getDate()+now.getHours()+now.getMinutes()){
          lastFired=k+now.getDate()+now.getHours()+now.getMinutes();
          var v=VOICES.filter(function(x){return x.id===state.voice;})[0]||VOICES[0];
          var a=new Audio(v.id+'.mp3'); a.play().catch(function(){});
        }
      });
    }catch(e){}
  },20000);
}

/* salawat reminder while app is open (browser/PWA path only) */
if(!window.AndroidBridge){
  setInterval(function(){
    try{
      var r=state.reminder; if(!r||!r.interval||r.interval<=0) return;
      var h=new Date().getHours();
      if(r.quiet&&(h>=23||h<5)) return;
      var now=Date.now();
      var last=+(localStorage.getItem('nidaa_reminder_last')||0);
      if(last===0){ localStorage.setItem('nidaa_reminder_last',now); return; }
      if(now-last<r.interval*60000) return;
      localStorage.setItem('nidaa_reminder_last',now);
      if('Notification' in window && Notification.permission==='granted'){
        try{ new Notification('نِداء',{body:'اللهم صل وسلم على نبينا محمد',silent:!r.sound}); }catch(e){}
      } else if(typeof toast==='function'){ toast('اللهم صل وسلم على نبينا محمد'); }
    }catch(e){}
  },30000);
}
