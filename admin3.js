/* Modern Blue Admin — compact tabbed workbench; preserves original handlers/RLS */
(function(){
"use strict";
let lastTab="overview",lastAccount="";
function mount(data){
 if(!profile?.admin||!profile?.approved)return;
 const area=document.querySelector(".workbody");
 if(!area||document.querySelector("#admin3-root"))return;
 // Missing class previously disabled 40+ scoped admin CSS rules on mobile.
 area.classList.add("admin3-page");
 // Recover from stale drawer state that can lock the entire phone viewport.
 window.Mobile4?.close();
 document.body.classList.remove("mobile-drawer-open");
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
 // Mobile approvals: keep the existing table for desktop/filters; use its
 // original role-checked action buttons for phone cards to preserve RLS.
 if(directory){
  const tbody=directory.querySelector("#adminrows");
  if(tbody){
   const cards=document.createElement("div");
   cards.id="admin3-mobile-students";cards.className="admin3-mobile-students";
   const label=document.createElement("div");label.className="admin3-mobile-students-title";
   const heading=document.createElement("h3");heading.textContent="Quick student approvals";
   const description=document.createElement("p");description.textContent="Approve directly below — no sideways table scrolling.";
   label.append(heading,description);cards.append(label);
   const sorted=[...tbody.querySelectorAll("tr")].sort((a,b)=>Number(a.dataset.status==="approved")-Number(b.dataset.status==="approved"));
   const links=[];
   for(const row of sorted){
    const cells=[...row.querySelectorAll("td")];
    if(cells.length<7)continue;
    const card=document.createElement("article");card.className="admin3-mobile-student-card";
    const top=document.createElement("div");top.className="admin3-mobile-student-top";
    const username=document.createElement("strong");username.textContent=(cells[0].textContent||"Student").trim();
    const approved=row.dataset.status==="approved";
    const badge=document.createElement("span");badge.className="admin3-mobile-student-status "+(approved?"approved":"pending");
    badge.textContent=approved?"Approved":"Pending / blocked";
    top.append(username,badge);card.append(top);
    const progress=document.createElement("p");progress.className="admin3-mobile-student-progress";
    progress.textContent=(cells[1].textContent||"0/14")+" chapters · "+(cells[2].textContent||"0")+" tests · "+(cells[4].textContent||"—")+" score";
    card.append(progress);
    const actions=document.createElement("div");actions.className="admin3-mobile-student-actions";
    const details=document.createElement("button");details.type="button";details.className="admin3-mobile-student-report";
    details.textContent="Student report";
    details.onclick=()=>{const source=cells[0].querySelector("button");if(source)source.click()};
    const approval=document.createElement("button");approval.type="button";approval.className="admin3-mobile-student-approve "+(approved?"block":"approve");
    approval.textContent=approved?"Block student":"✓ Approve student";
    approval.onclick=()=>{
     if(approval.disabled)return;
     // Original approve() function retains the confirmation and admin-only guard.
     const source=cells[6].querySelector("button");
     if(source)source.click();
    };
    actions.append(details,approval);card.append(actions);cards.append(card);
    links.push({row,card});
   }
   const search=directory.querySelector("#adminsearch");
   const status=directory.querySelector("#adminstatus");
   const empty=document.createElement("p");empty.className="admin3-no-students";
   empty.textContent="No students match this filter.";empty.hidden=true;cards.append(empty);
   const sync=()=>{
    let visible=0;
    for(const {row,card} of links){card.hidden=row.hidden;if(!row.hidden)visible++}
    empty.hidden=visible!==0;
   };
   search?.addEventListener("input",sync);
   status?.addEventListener("change",sync);
   const observer=new MutationObserver(sync);
   observer.observe(tbody,{subtree:true,attributes:true,attributeFilter:["hidden"]});
   sync();
   const tableWrapper=tbody.closest("table")?.parentElement;
   if(tableWrapper?.parentElement===directory)directory.insertBefore(cards,tableWrapper);
   else directory.append(cards);
  }
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
/* In-app confirmation avoids native WebView JS confirm popups trapping phone scroll.
   No auth/approval query is changed: app.js still owns the Supabase update. */
let activeConfirmation=null;
function confirmApproval(message){
 if(!window.matchMedia("(max-width: 900px)").matches)return Promise.resolve(window.confirm(message));
 if(activeConfirmation)return activeConfirmation;
 activeConfirmation=new Promise(resolve=>{
  const previousFocus=document.activeElement;
  const shade=document.createElement("div");shade.className="admin3-confirm-shade";
  shade.id="admin3-confirm-shade";
  const dialog=document.createElement("section");dialog.className="admin3-confirm-box";
  dialog.setAttribute("role","alertdialog");dialog.setAttribute("aria-modal","true");
  dialog.setAttribute("aria-labelledby","admin3-confirm-title");
  dialog.setAttribute("aria-describedby","admin3-confirm-description");
  const icon=document.createElement("span");icon.className="admin3-confirm-icon";icon.textContent="✓";
  const heading=document.createElement("h2");heading.id="admin3-confirm-title";heading.textContent="Confirm student action";
  const desc=document.createElement("p");desc.id="admin3-confirm-description";desc.textContent=String(message||"Continue?");
  const row=document.createElement("div");row.className="admin3-confirm-actions";
  const cancel=document.createElement("button");cancel.type="button";cancel.textContent="Cancel / रद्द करें";cancel.className="admin3-confirm-cancel";
  const yes=document.createElement("button");yes.type="button";yes.textContent="Confirm / पुष्टि करें";yes.className="admin3-confirm-yes";
  row.append(cancel,yes);dialog.append(icon,heading,desc,row);shade.append(dialog);
  let closed=false;
  const keyHandler=event=>{
   if(event.key==="Escape"){event.preventDefault();finish(false);return}
   if(event.key==="Tab"){
    if(event.shiftKey&&document.activeElement===cancel){event.preventDefault();yes.focus()}
    else if(!event.shiftKey&&document.activeElement===yes){event.preventDefault();cancel.focus()}
   }
  };
  function finish(result){
   if(closed)return;
   closed=true;
   document.removeEventListener("keydown",keyHandler,true);
   shade.remove();
   activeConfirmation=null;
   if(previousFocus?.isConnected&&typeof previousFocus.focus==="function")previousFocus.focus({preventScroll:true});
   resolve(result);
  }
  cancel.onclick=()=>finish(false);
  yes.onclick=()=>finish(true);
  shade.onclick=event=>{if(event.target===shade)finish(false)};
  document.addEventListener("keydown",keyHandler,true);
  document.body.append(shade);
  cancel.focus({preventScroll:true});
 });
 return activeConfirmation;
}
window.Admin3={mount,confirmApproval};
})();
