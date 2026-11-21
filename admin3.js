/* Modern Blue Admin — compact tabbed workbench; preserves original handlers/RLS */
(function(){
"use strict";
let lastTab="overview",lastAccount="";
function mount(data){
 if(!profile?.admin||!profile?.approved)return;
 const area=document.querySelector(".workbody");
 if(!area||document.querySelector("#admin3-root"))return;
 if(lastAccount!==user?.id){lastTab="overview";lastAccount=user?.id||""}
 const title=[...area.children].find(el=>el.tagName==="H1"&&el.textContent.includes("Admin control"));
 if(!title)return;
 const panels=[...area.querySelectorAll(":scope > section.panel")];
 const identify=(phrase,id)=>{
  const p=panels.find(el=>el.querySelector("h2")?.textContent.includes(phrase));
  if(p){p.id=id;p.classList.add("admin3-panel")}
  return p;
 };
 const directory=identify("Admin overview","admin3-directory");
 const schedule=identify("Test scheduling","admin3-schedule");
 const resources=identify("Add learning resource","admin3-resources");
 const tests=identify("Create test","admin3-tests");
 const questions=identify("Add question","admin3-questions");
 const bulk=identify("Bulk question upload","admin3-bulk");
 const announcements=identify("Announcements","admin3-announcements");
 const students=data.users.filter(u=>!u.admin);
 const pending=students.filter(u=>!u.approved).length;
 const completed=data.attempts.filter(a=>a.finished).length;
 const published=data.ts.filter(t=>t.published).length;
 const hero=document.createElement("section");
 hero.id="admin3-root";hero.className="admin3-compact-hero";
 hero.innerHTML='<div class="admin3-compact-title"><div><span class="admin3-eyebrow">MISSION 2027 · ADMIN WORKSPACE</span><h1>Control Center</h1><p>Clean, fast and organized. Select a tab to manage that area.</p></div><span class="admin3-role">✦ ADMIN</span></div>'+
 '<div class="admin3-compact-stats">'+
 '<div><small>Students</small><strong>'+students.length+'</strong></div>'+
 '<div><small>Pending</small><strong>'+pending+'</strong></div>'+
 '<div><small>Published tests</small><strong>'+published+'</strong></div>'+
 '<div><small>Completed attempts</small><strong>'+completed+'</strong></div>'+
 '</div>';
 title.replaceWith(hero);
 const tabs=document.createElement("div");tabs.className="admin3-tabbar";tabs.id="admin3-tabbar";tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","Admin sections");
 hero.after(tabs);
 const panes=document.createElement("div");panes.className="admin3-tabpanes";tabs.after(panes);
 const makePane=(key,label)=>{
  const pane=document.createElement("section");pane.className="admin3-tabpane";pane.id="admin3-pane-"+key;pane.setAttribute("role","tabpanel");pane.setAttribute("aria-labelledby","admin3-tab-"+key);pane.hidden=true;panes.append(pane);
  const b=document.createElement("button");b.type="button";b.id="admin3-tab-"+key;b.dataset.tab=key;b.setAttribute("role","tab");b.setAttribute("aria-controls",pane.id);b.setAttribute("aria-selected","false");b.textContent=label;tabs.append(b);
  return pane;
 };
 const overview=makePane("overview","◈ Overview");
 const people=makePane("students","👥 Students");
 const exams=makePane("tests","📝 Tests");
 const calendar=makePane("schedule","◷ Schedule");
 const bank=makePane("questions","☷ Questions");
 const content=makePane("resources","▤ Resources");
 const news=makePane("notices","◉ Notices");
 const metrics=data.ts.slice(-4).reverse().map(t=>'<div class="admin3-recent-test"><b>'+escapeText(t.title)+'</b><span>'+(t.published?'Published':'Draft')+'</span></div>').join("");
 overview.innerHTML='<div class="admin3-overview-header"><h2>Good to see you, Admin! 👋</h2><p>Choose what you want to manage. Only one workspace is open at a time.</p></div>'+
 '<div class="admin3-action-tiles"><button type="button" data-goto="students"><span>👥</span><b>Review students</b><small>'+pending+' approval(s) pending</small></button>'+
 '<button type="button" data-goto="tests"><span>📝</span><b>Create a test</b><small>Draft and publish exams</small></button>'+
 '<button type="button" data-goto="questions"><span>☷</span><b>Question bank</b><small>Add MCQs or import JSON</small></button>'+
 '<button type="button" data-goto="resources"><span>📘</span><b>Learning content</b><small>Notes, formulas, PYQ resources</small></button></div>'+
 '<section class="admin3-recent"><h3>Recent tests</h3>'+(metrics||'<p>No tests created yet.</p>')+'</section>';
 if(directory){
  const h=directory.querySelector("h2");if(h)h.textContent="Student Directory / छात्र प्रबंधन";
  const rows=directory.querySelector("h3");
  if(rows&&rows.textContent.includes("Test participation")){
   const accordion=document.createElement("details");accordion.className="admin3-accordion";
   const label=document.createElement("summary");label.textContent="Test participation details";accordion.append(label);
   let child=rows;
   while(child){const next=child.nextSibling;accordion.append(child);child=next}
   directory.append(accordion);
  }
  const numbers=directory.querySelector('div[style*="grid-template-columns"]');
  if(numbers)numbers.classList.add("admin3-duplicate-stats");
  people.append(directory);
 }
 const legacyHeading=[...area.children].find(x=>x.tagName==="H2"&&x.textContent.trim()==="Students");
 if(legacyHeading)legacyHeading.remove();
 // The searchable directory provides the same approval/block and student-report actions.
 // Remove only duplicate student cards in the UI, never database records.
 [...area.querySelectorAll(":scope > article")].forEach(card=>card.remove());
 const exportBtn=document.getElementById("csv");
 if(exportBtn){
  const more=document.createElement("details");more.className="admin3-accordion";
  more.innerHTML="<summary>Advanced export options</summary>";
  more.append(exportBtn);people.append(more);
 }
 if(tests)exams.append(tests);
 if(schedule)calendar.append(schedule);
 if(questions)bank.append(questions);
 if(bulk){
  const more=document.createElement("details");more.className="admin3-accordion";more.innerHTML='<summary>Bulk import questions (JSON)</summary>';more.append(bulk);bank.append(more);
 }
 if(resources)content.append(resources);
 if(announcements)news.append(announcements);
 const keys=["overview","students","tests","schedule","questions","resources","notices"];
 const activate=key=>{
  if(!keys.includes(key))key="overview";
  lastTab=key;
  keys.forEach(k=>{
   const pane=document.getElementById("admin3-pane-"+k);
   const tab=document.getElementById("admin3-tab-"+k);
   if(pane)pane.hidden=k!==key;
   if(tab){tab.setAttribute("aria-selected",String(k===key));tab.tabIndex=k===key?0:-1}
  });
 };
 tabs.querySelectorAll("[data-tab]").forEach(btn=>{
  btn.onclick=()=>{activate(btn.dataset.tab);tabs.scrollIntoView({behavior:"smooth",block:"nearest"})};
  btn.onkeydown=e=>{if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;e.preventDefault();const at=keys.indexOf(btn.dataset.tab),next=e.key==="Home"?0:e.key==="End"?keys.length-1:(at+(e.key==="ArrowRight"?1:-1)+keys.length)%keys.length;const dest=tabs.querySelector('[data-tab="'+keys[next]+'"]');dest?.focus();activate(keys[next])};
 });
 overview.querySelectorAll("[data-goto]").forEach(b=>b.onclick=()=>activate(b.dataset.goto));
 activate(lastTab);
}
function escapeText(x){return String(x??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
window.Admin3={mount};
})();
