/* High-Priority Mission Hub — 2024 Set A + 2025 Code B, 100-question secondary analysis.
   User-hosted papers; not authenticated official papers or a forecast for 2027. */
(function(){
"use strict";
const groups=[
{key:"workpipes",name:"Time & Work + Pipes / कार्य व नल",ids:[7,8],a:4,b:6,count:10,tier:"high",note:"10 is the COMBINED Work & Pipes category across two papers. Not 10 for each chapter."},
{key:"mensuration",name:"Mensuration / क्षेत्रमिति",ids:[4],a:5,b:4,count:9,tier:"high"},
{key:"geometry",name:"Geometry / ज्यामिति",ids:[10],a:5,b:4,count:9,tier:"high"},
{key:"percentage",name:"Percentage / प्रतिशत",ids:[9],a:2,b:7,count:9,tier:"high"},
{key:"ratio",name:"Ratio & Proportion / अनुपात",ids:[5],a:4,b:4,count:8,tier:"high"},
{key:"speed",name:"Speed, Time & Distance / चाल, समय, दूरी",ids:[2],a:3,b:5,count:8,tier:"high"},
{key:"trig",name:"Trigonometry / त्रिकोणमिति",ids:[13],a:4,b:1,count:5,tier:"medium"},
{key:"commercial",name:"Profit, Loss & Discount / लाभ, हानि, छूट",ids:[3],a:2,b:1,count:3,tier:"medium",note:"Count is for wider Commercial Maths, not verified as Profit & Loss alone."},
{key:"interest",name:"Simple & Compound Interest / ब्याज",ids:[6],a:1,b:2,count:3,tier:"medium"},
{key:"quadratic",name:"Quadratic Equations / द्विघात",ids:[12],a:2,b:0,count:2,tier:"foundation"},
{key:"average",name:"Average / औसत",ids:[1],a:0,b:2,count:2,tier:"foundation"},
{key:"algebra",name:"Algebraic Expressions / बीजीय व्यंजक",ids:[14],a:null,b:null,count:null,tier:"foundation",note:"Linear Algebra/Equations was coded 2+4 in the report, but that is NOT a direct count for Algebraic Expressions."},
{key:"bodmas",name:"Simplification (BODMAS) / सरलीकरण",ids:[11],a:null,b:null,count:null,tier:"foundation",note:"No separate BODMAS category in the source analysis; this does not mean zero questions."}
];
const challenges=[
{topic:7,label:"Time & Work / समय और कार्य"},
{topic:8,label:"Pipes & Cisterns / नल व टंकी"},
{topic:4,label:"Mensuration / क्षेत्रमिति"},
{topic:10,label:"Geometry / ज्यामिति"},
{topic:9,label:"Percentage / प्रतिशत"},
{topic:5,label:"Ratio & Proportion / अनुपात"},
{topic:2,label:"Speed, Time & Distance / चाल, समय, दूरी"}
];
const by=q=>document.querySelector(q);
const safe=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fetchLocal=k=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch{return null}};
const localDay=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
function addDays(d,n){const a=d.split("-").map(Number),date=new Date(a[0],a[1]-1,a[2]+n,12);return localDay(date)}
const fmtDay=d=>{const a=d.split("-").map(Number);return new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short"}).format(new Date(a[0],a[1]-1,a[2],12))};
function observe(prog,local,closed){
const stats=new Map();
for(let i=1;i<=14;i++)stats.set(i,{correct:0,wrong:0,answered:0,complete:prog.some(r=>Number(r.topic)===i&&!!r.done)});
for(const v of Object.values(local||{})){
 const topic=Number(v?.topic);if(!stats.has(topic))continue;
 const node=stats.get(topic);
 for(const ok of Object.values(v?.days||{})){if(ok===true){node.correct++;node.answered++}else if(ok===false){node.wrong++;node.answered++}}
}
for(const r of closed||[]){
 const topic=Number(r.topic);if(!stats.has(topic))continue;
 const node=stats.get(topic),c=Math.max(0,Number(r.correct)||0),w=Math.max(0,Number(r.wrong)||0);
 node.correct+=c;node.wrong+=w;node.answered+=c+w;
}
return stats;
}
function groupPerformance(g,st){
const r=g.ids.map(id=>st.get(id)).filter(Boolean);
const answered=r.reduce((n,x)=>n+x.answered,0),correct=r.reduce((n,x)=>n+x.correct,0);
const pct=answered?Math.round(100*correct/answered):null;
const done=r.filter(x=>x.complete).length;
const weak=answered>=5&&pct<60; // no unreliable low-sample weakness claims
let mastery="Not started",level=0;
if(done||answered){mastery="Learning";level=1}
if(answered>=1){mastery="Practising";level=2}
if(done===r.length&&answered>=5&&pct>=80){mastery="Revision ready";level=3}
return {answered,correct,pct,weak,done,total:r.length,mastery,level};
}
function resource(topic,kind){
 if(!user?.id||!profile?.approved)return;
 if(kind==="practice"){run(()=>advancedPractice(topic))();return}
 run(async()=>{
  await chapter(topic);
  const target=document.getElementById("chapter-section-"+kind);
  if(target)target.scrollIntoView({behavior:"smooth",block:"start"});
 })();
}
function challengeBody(uid){
 const key="s100:challenge:v1:"+uid,state=fetchLocal(key);
 const root=by("#priority-challenge-body");if(!root)return;
 const now=localDay(new Date());
 if(!state?.start||!Array.isArray(state.done)){
  root.innerHTML='<div class="priority-challenge-intro"><p>7 focused study days: Time & Work, Pipes, Mensuration, Geometry, Percentage, Ratio and Speed. Complete one daily mission at your own pace.</p><button type="button" id="priority-start">Start my 7-day challenge / शुरू करें</button></div>';
  by("#priority-start").onclick=()=>{const newState={start:now,done:[],version:1};localStorage.setItem(key,JSON.stringify(newState));challengeBody(uid)};
  return;
 }
 const start=state.start;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)){localStorage.removeItem(key);challengeBody(uid);return}
 const done=new Set(state.done.filter(i=>Number.isInteger(i)&&i>=0&&i<7));
 const todayIndex=Math.round((new Date(now+"T12:00:00")-new Date(start+"T12:00:00"))/86400000);
 const pct=Math.round(done.size/7*100);
 root.innerHTML='<div class="priority-challenge-head"><div><b>'+done.size+'/7 days completed</b><small>Manual checklist · saved only in this browser/account</small></div><span>'+pct+'%</span></div>'+
 '<div class="priority-progress"><span style="width:'+pct+'%"></span></div><div class="priority-challenge-grid">'+
 challenges.map((x,i)=>{
 const date=addDays(start,i),locked=i>todayIndex;
 const c=done.has(i);
 return '<div class="priority-day '+(c?"completed":"")+(locked?" upcoming":"")+'">'+
 '<label><input type="checkbox" data-day="'+i+'" '+(c?"checked ":"")+(locked?"disabled ":"")+'><span><b>Day '+(i+1)+' · '+safe(x.label)+'</b><small>'+fmtDay(date)+(locked?" · Upcoming":c?" · Done":" · Ready")+'</small></span></label>'+
 '<div class="priority-day-actions"><button type="button" data-day-topic="'+x.topic+'">Study notes</button><button type="button" data-day-practice="'+x.topic+'">Practice MCQs</button></div>'+
 '</div>'
 }).join("")+'</div>'+
 '<div class="priority-challenge-footer"><span>'+(done.size===7?"Challenge completed! Keep revising.":"Daily target: revise formulas + solve at least 10 practice questions. Tick manually when finished.")+'</span><button id="priority-restart" type="button">Restart challenge</button></div>';
 root.querySelectorAll("[data-day]").forEach(input=>input.onchange=()=>{
  const i=Number(input.dataset.day);input.checked?done.add(i):done.delete(i);
  localStorage.setItem(key,JSON.stringify({start,done:[...done].sort((a,b)=>a-b),version:1}));
  challengeBody(uid)
 });
 root.querySelectorAll("[data-day-topic]").forEach(btn=>btn.onclick=()=>resource(Number(btn.dataset.dayTopic),"notes"));
 root.querySelectorAll("[data-day-practice]").forEach(btn=>btn.onclick=()=>resource(Number(btn.dataset.dayPractice),"practice"));
 by("#priority-restart").onclick=()=>{
  if(!confirm("Reset the saved 7-day challenge progress? / पुरानी प्रगति रीसेट करें?"))return;
  localStorage.removeItem(key);challengeBody(uid)
 };
}
function mount(progress){
 if(!user?.id||!profile?.approved)return;
 const uid=user.id;
 const container=by("#modern-dashboard"),top=by(".m3-toprow");
 if(!container&&!top)return;
 if(by("#priority-hub"))return;
 let result=observe(progress,fetchLocal("practice:v1:"+uid)||{},[]);
 const host=document.createElement("section");host.id="priority-hub";host.className="priority-hub";
 host.innerHTML='<div class="priority-hero"><div><span class="priority-kicker">✦ HIGH-PRIORITY MISSION HUB</span><h2>Study smarter. <em>Target the right topics.</em></h2><p>Observed frequency from two located papers (2024 Set A and 2025 Code B), combined with your personal progress.</p></div><div class="priority-highlight"><strong>53<small> / 100</small></strong><span>Questions in the top six topic groups</span></div></div>'+
 '<div class="priority-stat-note"><b>Important source warning:</b> These are researcher-coded counts from two user-hosted paper copies, not officially authenticated papers, not official chapter weightage, and not a prediction for 2027. Work & Pipes shares one combined count. Broader Commercial Maths and unclassified topics are labelled clearly.</div>'+
 '<div class="priority-controls"><div class="priority-filter-group" role="group" aria-label="Priority filter"><button data-tier="all" aria-pressed="true">All topics</button><button data-tier="high" aria-pressed="false">High</button><button data-tier="medium" aria-pressed="false">Medium</button><button data-tier="foundation" aria-pressed="false">Foundation</button></div>'+
 '<label class="priority-sort">Sort <select id="priority-sort"><option value="observed">Observed frequency</option><option value="personal">My weakest topics first</option></select></label></div>'+
 '<p class="priority-legend">Study tiers (editorial): High = 8–10 observed questions; Medium = 3–5; Foundation = 0–2 or not separately coded. “Foundation” never means unimportant. Personal weakness needs 5+ answered practice/eligible closed-test questions and accuracy below 60%. *PYQ opens the site PYQ-labelled area with original exam-style practice; these are not authenticated past-year questions.</p>'+
 '<div id="priority-topic-list" class="priority-topic-grid"></div>'+
 '<section class="priority-challenge"><div class="priority-challenge-title"><div><span class="priority-kicker">7-DAY STUDY CAMPAIGN</span><h3>🏁 High-Priority Challenge / 7-दिन की चुनौती</h3><p>One focused topic each day, with notes and practice shortcuts.</p></div><span class="priority-challenge-graphic">07</span></div><div id="priority-challenge-body"></div></section>';
 (container||top).after(host);
 let filter="all",sorting="observed";
 function draw(){
  if(!host.isConnected||!user||user.id!==uid)return;
  let arr=groups.filter(g=>filter==="all"||g.tier===filter);
  arr=arr.slice().sort((a,b)=>{
   if(sorting==="personal"){
    const av=groupPerformance(a,result),bv=groupPerformance(b,result);
    if(av.weak!==bv.weak)return av.weak?-1:1;
    if(av.weak&&bv.weak&&av.pct!==bv.pct)return av.pct-bv.pct;
    if(av.level!==bv.level)return av.level-bv.level;
   }
   return (b.count??-1)-(a.count??-1)||groups.indexOf(a)-groups.indexOf(b);
  });
  const list=by("#priority-topic-list");if(!list)return;
  list.innerHTML=arr.map(g=>{
   const v=groupPerformance(g,result);
   const count=g.count===null?"Not separately coded":g.count+"/100 observed";
   const d=g.count===null?"No direct topic count available":g.a+" (2024) + "+g.b+" (2025)";
   const bars=g.count===null?"0":g.count*10;
   const hint=g.note?'<p class="priority-caution">'+safe(g.note)+'</p>':"";
   return '<article class="priority-topic-card '+g.tier+'">'+
    '<div class="priority-topic-head"><span class="priority-tier">'+g.tier.toUpperCase()+' PRIORITY</span><span class="priority-count">'+count+'</span></div>'+
    '<h3>'+safe(g.name)+'</h3>'+
    '<div class="priority-observed"><div class="priority-bar"><span style="width:'+bars+'%"></span></div><small>'+d+'</small></div>'+
    hint+
    '<div class="priority-mastery"><span>Mastery: <b>'+v.mastery+'</b></span><span>'+v.done+'/'+v.total+' chapters complete</span></div>'+
    '<div class="priority-mastery-bar"><span style="width:'+(v.level===3?100:v.level===2?66:v.level===1?33:0)+'%"></span></div>'+
    '<p class="priority-personal">'+(v.weak?"⚠ Your weak topic: "+v.pct+"% accuracy ("+v.answered+" answers)":v.pct!==null?"Your accuracy: "+v.pct+"% ("+v.answered+" answers)":"No personal practice accuracy yet")+'</p>'+
    g.ids.map(id=>'<div class="priority-resources"><div class="priority-chapter-name">CH '+String(id).padStart(2,"0")+' · '+safe(topics[id-1])+'</div><div class="priority-resource-actions">'+
       '<button data-topic="'+id+'" data-action="notes">📘 Notes</button><button data-topic="'+id+'" data-action="formula">ƒ Formula</button><button data-topic="'+id+'" data-action="pyq">◉ PYQ*</button><button data-topic="'+id+'" data-action="practice">⚡ Practice</button>'+
       '</div></div>').join("")+'</article>'
  }).join("");
  list.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>resource(Number(b.dataset.topic),b.dataset.action));
 }
 host.querySelectorAll("[data-tier]").forEach(b=>b.onclick=()=>{
  filter=b.dataset.tier;
  host.querySelectorAll("[data-tier]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
  draw()
 });
 by("#priority-sort").onchange=e=>{sorting=e.target.value;draw()};
 draw();
 challengeBody(uid);
 // Does not reveal protected question answers; only per-topic accuracy from eligible closed tests.
 db.rpc("mission_topic_analytics_v1").then(({data,error})=>{
  if(error||user?.id!==uid||!host.isConnected)return;
  result=observe(progress,fetchLocal("practice:v1:"+uid)||{},data||[]);
  draw();
 }).catch(()=>{});
}
window.PriorityHub={mount,open:resource,groups:groups.map(g=>({key:g.key,count:g.count,ids:g.ids,tier:g.tier}))};
})();
