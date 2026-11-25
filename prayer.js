/* PrayTimes.js port (v2.3 ideas) - Egyptian General Authority of Survey method.
   Returns prayer times in minutes from midnight (local), for given lat/lng/date. */
var PrayTime = (function(){
  var D = Math.PI/180;
  function fixAngle(a){a=a-360*Math.floor(a/360);return a<0?a+360:a;}
  function fixHour(h){h=h-24*Math.floor(h/24);return h<0?h+24:h;}
  // julian
  function julian(y,m,d){ if(m<=2){y-=1;m+=12;} var A=Math.floor(y/100),B=2-A+Math.floor(A/4);
    return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;}
  function sunPos(jd){ var T=(jd-2451545.0)/36525, L0=fixAngle(280.46646+T*(36000.76983+0.0003032*T)),
    M=fixAngle(357.52911+T*(35999.05029-0.0001537*T)), e=0.016708634-T*(0.000042037+0.0000001267*T),
    C=Math.sin(M*D)*(1.914602-T*(0.004817+0.000014*T))+Math.sin(2*M*D)*(0.019993-0.000101*T)+Math.sin(3*M*D)*0.000289,
    L=L0+C, v=M+C, R=1.000001018*(1-e*e)/(1+e*Math.cos(v*D)),
    Om=125.04-1934.136*T, lam=L-0.00569-0.00478*Math.sin(Om*D),
    eps0=23+(26+(21.448-T*(46.815+T*(0.00059-T*0.001813)))/60)/60, eps=eps0+0.00256*Math.cos(Om*D),
    ra=Math.atan2(Math.cos(eps*D)*Math.sin(lam*D),Math.cos(lam*D))/D;
    return {decl:Math.asin(Math.sin(eps*D)*Math.sin(lam*D))/D,
            eqt:(L0-0.0057183-ra)/15};}
  function midDay(jd,t){ var eqt=sunPos(jd+t).eqt; return fixHour(12-eqt); }
  function angleTime(angle,jd,lat,dir){ var decl=sunPos(jd).decl, noon=midDay(jd,0),
    t=1/15*Math.acos((-Math.sin(angle*D)-Math.sin(decl*D)*Math.sin(lat*D))/(Math.cos(decl*D)*Math.cos(lat*D)))/D;
    return noon+(dir==='ccw'?-t:t); }
  function asrTime(factor,jd,lat){ var decl=sunPos(jd).decl,
    angle=-Math.atan(1/(factor+Math.tan(Math.abs(lat-decl)*D)))/D;
    return angleTime(angle,jd,lat); }
  function compute(lat,lng,year,month,day,tz){
    if(tz===undefined) tz=2;
    var jd=julian(year,month,day)-lng/(15*24);
    var times={fajr:angleTime(19.5,jd,lat,'ccw'), sunrise:angleTime(0.833,jd,lat,'ccw'),
      dhuhr:midDay(jd,0), asr:asrTime(1,jd,lat), maghrib:angleTime(0.833,jd,lat), isha:angleTime(17.5,jd,lat)};
    var out={}; for(var k in times) out[k]=(times[k]+(tz-lng/15))*60; // minutes from midnight local
    return out;
  }
  return {compute:compute};
})();
