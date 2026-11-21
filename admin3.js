/* Super 100 — Admin workbench: strict separation of student requests.
   Pending -> approve only; Approved -> block only; Blocked -> move to pending.
   Does not grant/modify backend permissions; all writes use app.js RLS-guarded actions.
*/
(function(){
"use strict";
let lastTab="overview",lastAccount="";
function mount(data){
 if(!profile?.admin||!profile?.approved)return;
 const area=document.querySelector(".workbody");
 if(!area||document.getElementById("admin3-root"))return;
 area.classList.add("admin3-page");
 window.Mobile4?.close();
 document.body.classList.remove("mobile-drawer-open");
 if(lastAccount!==user?.id){lastTab="overview";lastAccount=user?.id||""}
 const title=[...area.children].find(el=>el.tagName==="H1"&&el.textContent.includes("Admin control"));
 if(!title)return;
 const panels=[...area.querySelectorAll(":scope > section.panel")];
 const findPanel=(text,id)=>{
  const panel=panels.find(el=>el.querySelector("h2")?.textContent.includes(text));
  if(panel){panel.id=id;panel.classList.add("admin3-panel")}
  return panel
 };
 const directory=findPanel("Admin overview","admin3-directory");
 const schedule=findPanel("Test scheduling","admin3-schedule");
 const resources=findPanel("Add learning resource","admin3-resources");
 const tests=findPanel("Create test","admin3-tests");
 const questions=findPanel("Add question","admin3-questions");
 const bulk=findPanel("Bulk question upload","admin3-bulk");
 const notices=findPanel("Announcements","admin3-announcements");
 const students=data.users.filter(u=>!u.admin);
 const state=u=>u.blocked?"blocked":u.approved?"approved":"pending";
 const counts={pending:0,approved:0,blocked:0};
 for(const student of students)counts[state(student)]++;
 const supportsBlocked=Object.prototype.hasOwnProperty.call(profile,"blocked")||
  students.some(u=>Object.prototype.hasOwnProperty.call(u,"blocked"));
 const hero=document.createElement("section");
 hero.id="admin3-root";hero.className="admin3-compact-hero";
 const inner=document.createElement("div");inner.className="admin3-compact-title";
 inner.innerHTML='<div><span class="admin3-eyebrow">MISSION 2027 · ADMIN WORKSPACE</span><h1>Student Control Center</h1>'+
  '<p>Approval requests, active students and blocked accounts are managed separately.</p></div><span class="admin3-role">✦ ADMIN</span>';
 hero.append(inner);
 const stats=document.createElement("div");stats.className="admin3-compact-stats";
 for(const [label,count] of [
  ["Pending requests",counts.pending],["Approved students",counts.approved],
  ["Blocked students",counts.blocked],["Completed tests",data.attempts.filter(x=>x.finished).length]]){
  const node=document.createElement("div"),small=document.createElement("small"),strong=document.createElement("strong");
  small.textContent=label;strong.textContent=String(count);
  node.append(small,strong);stats.append(node)
 }
 hero.append(stats);title.replaceWith(hero);
 const tabs=document.createElement("div");tabs.className="admin3-tabbar";tabs.id="admin3-tabbar";
 tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","Admin sections");hero.after(tabs);
 const panes=document.createElement("div");panes.className="admin3-tabpanes";tabs.after(panes);
 const keys=[];
 function pane(key,label){
  const page=document.createElement("section");page.className="admin3-tabpane";page.id="admin3-pane-"+key;
  page.setAttribute("role","tabpanel");page.setAttribute("aria-labelledby","admin3-tab-"+key);
  page.hidden=true;panes.append(page);
  const button=document.createElement("button");button.id="admin3-tab-"+key;button.type="button";
  button.dataset.tab=key;button.setAttribute("role","tab");button.setAttribute("aria-controls",page.id);
  button.setAttribute("aria-selected","false");button.textContent=label;tabs.append(button);keys.push(key);
  return page;
 }
 const overview=pane("overview","◈ Overview");
 const pendingPane=pane("pending","⏳ Requests ("+counts.pending+")");
 const approvedPane=pane("approved","✓ Approved ("+counts.approved+")");
 const blockedPane=pane("blocked","⊘ Blocked ("+counts.blocked+")");
 const reports=pane("reports","▥ Reports");
 const exams=pane("tests","📝 Tests");
 const calendar=pane("schedule","◷ Schedule");
 const bank=pane("questions","☷ Questions");
 const content=pane("resources","▤ Resources");
 const news=pane("notices","◉ Notices");
 function invokeAction(fn){
  if(typeof window.run==="function"){window.run(fn)();return}
  console.error("Admin action unavailable")
 }
 function blockWarning(host){
  if(supportsBlocked)return;
  const warning=document.createElement("p");warning.className="admin3-migration-warning";
  warning.textContent="Setup required: the Supabase blocked column has not been added yet. Apply the student-status SQL migration to distinguish blocked accounts from pending requests. Existing unapproved accounts are currently shown as Pending.";
  host.append(warning)
 }
 function listFor(section,key,titleText,description){
  const heading=document.createElement("div");heading.className="admin3-roster-title";
  const h=document.createElement("h2");h.textContent=titleText+" ("+counts[key]+")";
  const hint=document.createElement("p");hint.textContent=description;
  heading.append(h,hint);section.append(heading);
  if(key==="blocked"||key==="approved")blockWarning(section);
  const roster=document.createElement("div");roster.className="admin3-roster";
  const search=document.createElement("input");search.type="search";search.className="admin3-roster-search";
  search.placeholder="Search "+key+" students / नाम खोजें";search.setAttribute("aria-label","Search "+key+" students");
  search.autocomplete="off";section.append(search);
  const subset=students.filter(u=>state(u)===key).sort((a,b)=>String(a.username||"").localeCompare(String(b.username||"")));
  const rows=[];
  for(const st of subset){
   const article=document.createElement("article");article.className="admin3-person-card";
   article.dataset.username=String(st.username||"").toLowerCase();
   const top=document.createElement("div");top.className="admin3-person-card-top";
   const name=document.createElement("strong");name.textContent=st.username||"Student";
   const badge=document.createElement("span");badge.className="admin3-person-badge "+key;
   badge.textContent=key==="pending"?"Awaiting review":key==="approved"?"Active":"Blocked";
   top.append(name,badge);article.append(top);
   const progress=data.progress.filter(p=>p.student===st.id&&p.done).length;
   const finished=data.attempts.filter(a=>a.student===st.id&&a.finished).length;
   const info=document.createElement("p");info.className="admin3-person-info";
   info.textContent=progress+"/14 chapters · "+finished+" completed tests";article.append(info);
   const actions=document.createElement("div");actions.className="admin3-person-actions";
   const report=document.createElement("button");report.type="button";report.className="admin3-action-report";
   report.textContent="Student report";report.onclick=()=>invokeAction(()=>window.adminStudent(st.id));
   actions.append(report);
   const action=document.createElement("button");action.type="button";
   if(key==="pending"){
    action.className="admin3-action-approve";action.textContent="✓ Approve request";
    action.onclick=()=>invokeAction(()=>window.setStudentStatus(st.id,"approved"));
   }else if(key==="approved"){
    action.className="admin3-action-block";action.textContent="Block student";
    action.disabled=!supportsBlocked;
    if(!supportsBlocked)action.title="Blocked-status database migration required";
    action.onclick=()=>invokeAction(()=>window.setStudentStatus(st.id,"blocked"));
   }else{
    action.className="admin3-action-restore";action.textContent="Move to Pending";
    action.onclick=()=>invokeAction(()=>window.setStudentStatus(st.id,"pending"));
   }
   actions.append(action);article.append(actions);roster.append(article);
   rows.push(article)
  }
  const empty=document.createElement("p");empty.className="admin3-roster-empty";
  empty.textContent=subset.length?"No matching students.":key==="pending"?"No pending approval requests.":key==="approved"?"No approved students.":"No blocked students.";
  roster.append(empty);section.append(roster);
  const filter=()=>{
   const query=search.value.trim().toLowerCase();
   let shown=0;
   for(const card of rows){card.hidden=!card.dataset.username.includes(query);if(!card.hidden)shown++}
   empty.hidden=shown!==0;
  };
  search.addEventListener("input",filter);filter()
 }
 listFor(pendingPane,"pending","Pending Approval Requests","Only new/unapproved students appear here. Approve requests individually.");
 listFor(approvedPane,"approved","Approved Students","Active students are managed here. Blocking is separate from approvals.");
 listFor(blockedPane,"blocked","Blocked Students","Blocked accounts cannot log in to the learning dashboard. Restore them to Pending for review.");
 overview.innerHTML='<div class="admin3-overview-header"><h2>Choose your workspace 👋</h2>'+
  '<p>Review new accounts, manage active learners and revisit blocked accounts in separate areas.</p></div>'+
  '<div class="admin3-action-tiles">'+
  '<button type="button" data-goto="pending"><span>⏳</span><b>Approval requests</b><small>'+counts.pending+' awaiting review</small></button>'+
  '<button type="button" data-goto="approved"><span>✓</span><b>Approved students</b><small>'+counts.approved+' currently active</small></button>'+
  '<button type="button" data-goto="blocked"><span>⊘</span><b>Blocked students</b><small>'+counts.blocked+' access restricted</small></button>'+
  '<button type="button" data-goto="reports"><span>▥</span><b>Reports & exports</b><small>Search, analytics and CSV</small></button></div>';
 const recent=document.createElement("section");recent.className="admin3-recent";
 const recentTitle=document.createElement("h3");recentTitle.textContent="Recent tests";recent.append(recentTitle);
 const testList=data.ts.slice(-4).reverse();
 if(!testList.length){const msg=document.createElement("p");msg.textContent="No tests created yet.";recent.append(msg)}
 for(const test of testList){
  const row=document.createElement("div");row.className="admin3-recent-test";
  const label=document.createElement("b");label.textContent=test.title||"Test";
  const state=document.createElement("span");state.textContent=test.published?"Published":"Draft";
  row.append(label,state);recent.append(row)
 }
 overview.append(recent);
 if(directory){
  const h=directory.querySelector("h2");if(h)h.textContent="Student Reports / Records";
  reports.append(directory)
 }
 const exportBtn=document.getElementById("csv");
 if(exportBtn){const more=document.createElement("details");more.className="admin3-accordion";
  const summary=document.createElement("summary");summary.textContent="Additional CSV export";more.append(summary,exportBtn);reports.append(more)}
 if(tests)exams.append(tests);
 if(schedule)calendar.append(schedule);
 if(questions)bank.append(questions);
 if(bulk){const details=document.createElement("details");details.className="admin3-accordion";
  const summary=document.createElement("summary");summary.textContent="Bulk import questions (JSON)";
  details.append(summary,bulk);bank.append(details)}
 if(resources)content.append(resources);
 if(notices)news.append(notices);
 function activate(key){
  if(!keys.includes(key))key="overview";
  lastTab=key;
  for(const k of keys){
   const page=document.getElementById("admin3-pane-"+k),tab=document.getElementById("admin3-tab-"+k);
   if(page)page.hidden=k!==key;
   if(tab){tab.setAttribute("aria-selected",String(k===key));tab.tabIndex=k===key?0:-1}
  }
 }
 tabs.querySelectorAll("[data-tab]").forEach(btn=>{
  btn.onclick=()=>activate(btn.dataset.tab);
  btn.onkeydown=e=>{
   if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
   e.preventDefault();const idx=keys.indexOf(btn.dataset.tab);
   const target=e.key==="Home"?0:e.key==="End"?keys.length-1:
     (idx+(e.key==="ArrowRight"?1:-1)+keys.length)%keys.length;
   tabs.querySelector('[data-tab="'+keys[target]+'"]')?.focus();activate(keys[target])
  }
 });
 overview.querySelectorAll("[data-goto]").forEach(btn=>btn.onclick=()=>activate(btn.dataset.goto));
 activate(lastTab)
}

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
