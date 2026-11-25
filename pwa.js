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
