/* Public Haryana Super 100 Level-1 date countdown. Exam START time is not confirmed. */
(function(){
  'use strict';
  const target=Date.parse('2026-12-16T00:00:00+05:30');
  const element=id=>document.getElementById(id);
  function render(){
    let delta=target-Date.now();
    if(delta<=0){
      element('exam-clock').hidden=true;
      element('exam-countdown-note').textContent='16 December 2026 is the announced Level-1 exam date. Check official announcements for updates and exact timings.';
      return false;
    }
    const sec=Math.floor(delta/1000);
    const values=[Math.floor(sec/86400),Math.floor(sec%86400/3600),Math.floor(sec%3600/60),sec%60];
    ['exam-days','exam-hours','exam-minutes','exam-seconds'].forEach((id,i)=>{
      element(id).textContent=String(values[i]).padStart(i===0?1:2,'0');
    });
    return true;
  }
  render();
  const ticker=setInterval(()=>{if(!render())clearInterval(ticker)},1000);
})();
