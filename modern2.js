/* Mission 2027 Modern Blue 2.0: dashboard enhancements, no schema changes */
(function(){
"use strict";
let timerId=null,remaining=1500,until=0,running=false,account=null;
const one=(q,root=document)=>root.querySelector(q);
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function saved(key){try{return JSON.parse(localStorage.getItem(key)||"{}")||{}}catch{return {}}}
function istDay(d){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day}
function localDay(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function focusRender(){
const node=one('#modern-focus-clock');if(!node)return;
const t=running?Math.max(0,Math.ceil((until-Date.now())/1000)):remaining;
node.textContent=String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0");
const b=one('#modern-focus-start');if(b)b.textContent=running?"Pause / रोकें":"Start focus / शुरू करें";
if(t===0&&running){running=false;remaining=0;clearInterval(timerId);timerId=null;one('#modern-focus-caption').textContent="Session complete! / सत्र पूरा हुआ";}
}
function focusControls(){
one('#modern-focus-start').onclick=function(){
if(running){remaining=Math.max(0,Math.ceil((until-Date.now())/1000));running=false;clearInterval(timerId);timerId=null}
else{if(remaining<=0)remaining=1500;until=Date.now()+remaining*1000;running=true;clearInterval(timerId);timerId=setInterval(focusRender,1000)}
focusRender()};
one('#modern-focus-reset').onclick=function(){running=false;clearInterval(timerId);timerId=null;remaining=1500;one('#modern-focus-caption').textContent="25-minute focus session";focusRender()};
focusRender();
}
function mount(progress,attempts){
if(!user?.id||!profile?.approved||!one('.workbody'))return;
const uid=user.id;
if(account&&account!==uid){running=false;clearInterval(timerId);timerId=null;remaining=1500}account=uid;
if(one('#modern-dashboard'))return;
const practice=saved('practice:v1:'+uid),planKey='smartplanner:v1:'+uid,plan=saved(planKey);
const day=typeof plannerDay==='function'?plannerDay():istDay(new Date()),dates=new Set(),firstAttempts=[],correctAttempts=[];
Object.entries(practice).forEach(([id,record])=>{Object.entries(record?.days||{}).forEach(([date,ok])=>{dates.add(date);firstAttempts.push(id+'|'+date);if(ok===true)correctAttempts.push(id+'|'+date)})});
if(plan.checked?.length&&plan.day===day)dates.add(day);
let streak=0;const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);let cursor=dates.has(day)?day:(typeof plannerDay==='function'?localDay(yesterday):istDay(yesterday));
while(dates.has(cursor)&&streak<10000){streak++;const a=cursor.split('-').map(Number);cursor=new Date(Date.UTC(a[0],a[1]-1,a[2]-1,12)).toISOString().slice(0,10)}
const done=progress.filter(p=>p.done).length,tests=attempts.length,xp=done*25+correctAttempts.length*3+tests*15;
const earned=[["🌱","First chapter",done>=1],["📚","7 chapters",done>=7],["🏁","All 14",done>=14],["⚡","10 practice",firstAttempts.length>=10],["🎯","80% accuracy",firstAttempts.length>=20&&correctAttempts.length/firstAttempts.length>=.8],["🔥","3-day streak",streak>=3],["🏆","3 tests",tests>=3]];
const dashboard=document.createElement('section');dashboard.id='modern-dashboard';dashboard.className='modern-dashboard';
dashboard.innerHTML='<div class="modern-intro"><div><span class="modern-eyebrow">MISSION CONTROL · YOUR STUDY SPACE</span><h2>Make today count. <em>हर दिन बेहतर।</em></h2><p>Your real study progress, one chapter at a time.</p></div><span class="modern-date">'+safe(new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeZone:'Asia/Kolkata'}).format(new Date()))+'</span></div>'+
'<div class="modern-stats">'+
'<article><span>🔥</span><strong>'+streak+' <small>days</small></strong><b>Study streak</b><small>Activity from practice or checked daily goals</small></article>'+
'<article><span>⚡</span><strong>'+xp+' <small>XP</small></strong><b>Learning XP</b><small>Calculated from recorded activity</small></article>'+
'<article><span>📚</span><strong>'+done+' <small>/ 14</small></strong><b>Chapters complete</b><small>'+Math.round(done/14*100)+'% done</small></article>'+
'<article><span>🎯</span><strong>'+(firstAttempts.length?Math.round(correctAttempts.length/firstAttempts.length*100)+'%':'—')+'</strong><b>Practice accuracy</b><small>'+firstAttempts.length+' tracked first answers</small></article></div>'+
'<div class="modern-two">'+
'<article class="modern-panel"><div class="modern-panel-head"><h3>🎯 Today’s Mission</h3><button id="modern-open-planner" type="button">Planner ↗</button></div><p id="modern-daily-status">Your daily study goals</p><div id="modern-daily-list"></div></article>'+
'<article class="modern-panel"><div class="modern-panel-head"><h3>⏳ Focus Timer</h3><span class="modern-mini">POMODORO</span></div><div id="modern-focus-clock">25:00</div><p id="modern-focus-caption">25-minute focus session</p><div class="modern-focus-buttons"><button id="modern-focus-start">Start focus / शुरू करें</button><button id="modern-focus-reset">Reset</button></div><small>Runs while this tab is open; no sound or notifications.</small></article></div>'+
'<div class="modern-two"><article class="modern-panel"><div class="modern-panel-head"><h3>🏆 Achievements</h3><span class="modern-mini">'+earned.filter(x=>x[2]).length+'/'+earned.length+' unlocked</span></div><div class="modern-badges">'+earned.map(x=>'<span class="'+(x[2]?'earned':'locked')+'" title="'+safe(x[1])+'">'+x[0]+' '+safe(x[1])+'</span>').join('')+'</div><small>XP: 25 per chapter, 3 per correct first practice answer, 15 per completed test.</small></article>'+
'<article class="modern-panel"><div class="modern-panel-head"><h3>🧠 Quick Revision</h3><span class="modern-mini">STUDY TOOLS</span></div><div class="modern-links"><button id="modern-formulas">Formula Bank</button><button id="modern-mistakes">Mistake Notebook</button><button id="modern-analytics">Smart Analytics</button><a href="notes.html" target="_blank" rel="noopener">Public PDF Notes ↗</a></div><p id="modern-weak-topic"></p></article></div>'+
'<div class="modern-search-panel"><label for="modern-search">⌕ Search chapters / अध्याय खोजें</label><input id="modern-search" type="search" placeholder="Percentage, Mensuration, Trigonometry..." autocomplete="off"><div id="modern-search-list" aria-live="polite"></div></div>';
const hero=one('.dashhero');if(hero)hero.classList.add('modern-hero');const top=one('.m3-toprow')||hero;if(top)top.after(dashboard);else one('.workbody').prepend(dashboard);
const tasks=plan.day===day&&Array.isArray(plan.tasks)?plan.tasks:[],checked=new Set(plan.day===day&&Array.isArray(plan.checked)?plan.checked:[]);
const list=one('#modern-daily-list');
function renderTasks(){
if(!tasks.length){list.innerHTML='<p>No daily plan generated for today.</p><button id="modern-build-plan">Create study plan ↗</button>';one('#modern-build-plan').onclick=()=>run(personal)();return}
list.innerHTML=tasks.map((t,i)=>'<label class="modern-task"><input type="checkbox" data-task="'+i+'" '+(checked.has(i)?'checked':'')+'><span><b>'+safe(t.kind)+'</b><small>'+safe(topics[t.topic-1]||'Chapter')+' · '+safe(t.minutes)+' min</small></span></label>').join('');
one('#modern-daily-status').textContent=checked.size+'/'+tasks.length+' goals done';
list.querySelectorAll('[data-task]').forEach(el=>el.onchange=function(){const i=Number(this.dataset.task);if(this.checked)checked.add(i);else checked.delete(i);const latest=saved(planKey);if(latest.day===day){latest.checked=[...checked].sort((a,b)=>a-b);localStorage.setItem(planKey,JSON.stringify(latest))}one('#modern-daily-status').textContent=checked.size+'/'+tasks.length+' goals done';});
}
renderTasks();focusControls();
one('#modern-open-planner').onclick=()=>run(personal)();
one('#modern-mistakes').onclick=()=>run(personal)();
one('#modern-analytics').onclick=()=>run(analytics)();
const input=one('#modern-search'),out=one('#modern-search-list');
function searchChapters(q,all=false){out.replaceChildren();if(!q&&!all)return;topics.forEach((name,i)=>{if(!all&&!name.toLocaleLowerCase().includes(q.toLocaleLowerCase()))return;const b=document.createElement('button');b.type='button';b.textContent=(i+1)+'. '+name;b.onclick=()=>run(()=>chapter(i+1))();out.append(b)});if(!out.childElementCount)out.textContent='No chapter found / कोई अध्याय नहीं मिला';}
input.oninput=()=>searchChapters(input.value.trim());
one('#modern-formulas').onclick=()=>{searchChapters('',true);input.focus();out.scrollIntoView({behavior:'smooth',block:'nearest'})};
const cards=[...document.querySelectorAll('.workbody .grid article')].filter(el=>el.querySelector('input[type="checkbox"]')&&el.querySelector('button'));
cards.slice(0,14).forEach((card,i)=>{card.classList.add('modern-chapter');const number=document.createElement('span');number.className='modern-chapter-number';number.textContent='CHAPTER '+String(i+1).padStart(2,'0');card.prepend(number);const complete=progress.some(p=>Number(p.topic)===i+1&&p.done);const line=document.createElement('div');line.className='modern-chapter-progress';line.innerHTML='<span style="width:'+(complete?'100':'0')+'%"></span>';card.append(line);const links=document.createElement('div');links.className='modern-chapter-links';const a=document.createElement('a');a.href='pdf/'+pdfNames[i];a.target='_blank';a.rel='noopener';a.textContent='View PDF ↗';const b=document.createElement('button');b.textContent='Formulas & PYQ ↗';b.onclick=()=>run(()=>chapter(i+1))();links.append(a,b);card.append(links)});
db.rpc('mission_topic_analytics_v1').then(({data,error})=>{if(error||user?.id!==uid||!dashboard.isConnected)return;const list=(data||[]).map(r=>{const c=Number(r.correct||0),w=Number(r.wrong||0),topic=Number(r.topic);return {topic,n:c+w,accuracy:c+w?Math.round(c/(c+w)*100):null}}).filter(r=>r.topic>=1&&r.topic<=14&&r.n>=5).sort((a,b)=>a.accuracy-b.accuracy);if(list.length)one('#modern-weak-topic').textContent='Revision priority: '+topics[list[0].topic-1]+' ('+list[0].accuracy+'% on eligible closed tests).';}).catch(()=>{});
}
window.Modern2={mount:mount};
})();
