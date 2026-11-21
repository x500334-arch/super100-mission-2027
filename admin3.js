/* Admin Control Center visual enhancement; no authorization or database changes. */
(function(){
"use strict";
function mount(data){
 if(!profile?.admin||!profile?.approved)return;
 const area=document.querySelector(".workbody");if(!area||document.getElementById("admin3-root"))return;
 const title=[...area.children].find(x=>x.tagName==="H1"&&x.textContent.includes("Admin control"));
 if(!title)return;
 area.classList.add("admin3-page");
 const students=data.users.filter(u=>!u.admin);
 const pending=students.filter(u=>!u.approved).length;
 const completed=data.attempts.filter(a=>a.finished).length;
 const published=data.ts.filter(t=>t.published).length;
 const hero=document.createElement("section");hero.className="admin3-hero";hero.id="admin3-root";
 hero.innerHTML='<div class="admin3-hero-top"><div><span class="admin3-eyebrow">SUPER 100 · OPERATIONS CENTER</span><h1>Admin Control Center</h1><p>Manage students, examinations, content and announcements — all from one workspace.</p></div><div class="admin3-crown" aria-hidden="true">✦</div></div>'+
 '<div class="admin3-quickstats">'+
 '<div><small>Students</small><strong>'+students.length+'</strong></div>'+
 '<div><small>Pending approvals</small><strong>'+pending+'</strong></div>'+
 '<div><small>Published tests</small><strong>'+published+'</strong></div>'+
 '<div><small>Completed attempts</small><strong>'+completed+'</strong></div>'+
 '</div><div class="admin3-toolbar" id="admin3-toolbar"></div>';
 title.replaceWith(hero);
 const panels=[...area.querySelectorAll(":scope > section.panel")];
 const identify=(phrase,id,icon)=>{
  const p=panels.find(el=>el.querySelector("h2")?.textContent.includes(phrase));
  if(!p)return;
  p.id=id;p.classList.add("admin3-panel");
  const h=p.querySelector("h2");if(h&&!h.querySelector(".admin3-heading-icon")){
   const marker=document.createElement("span");marker.className="admin3-heading-icon";marker.textContent=icon;h.prepend(marker);
  }
 };
 identify("Admin overview","admin3-overview","◈");
 identify("Test scheduling","admin3-schedule","◷");
 identify("Add learning resource","admin3-resources","▤");
 identify("Create test","admin3-tests","✦");
 identify("Add question","admin3-questions","☷");
 identify("Bulk question upload","admin3-bulk","⇧");
 identify("Announcements","admin3-announcements","◉");
 const studentsHead=[...area.children].find(x=>x.tagName==="H2"&&x.textContent.trim()==="Students");
 if(studentsHead){studentsHead.id="admin3-students";studentsHead.classList.add("admin3-students-heading");studentsHead.textContent="Student Management / छात्र प्रबंधन";}
 [...area.querySelectorAll(":scope > article")].forEach(x=>x.classList.add("admin3-student-card"));
 const summary=document.getElementById("admin3-overview");
 if(summary)summary.querySelectorAll("article").forEach(x=>x.classList.add("admin3-overview-metric"));
 const toolbar=hero.querySelector("#admin3-toolbar");
 [["Overview","admin3-overview"],["Approvals","admin3-students"],["Schedule","admin3-schedule"],["Resources","admin3-resources"],["Create Test","admin3-tests"],["Questions","admin3-questions"],["Bulk Import","admin3-bulk"],["Announcements","admin3-announcements"]].forEach(([label,id])=>{
   if(!document.getElementById(id))return;
   const button=document.createElement("button");button.textContent=label;button.type="button";
   button.addEventListener("click",()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}));
   toolbar.appendChild(button);
 });
 const note=document.createElement("p");note.className="admin3-note";note.textContent="Actions still use your existing Supabase permissions. Approve, publish, export and question-import behavior is unchanged.";
 hero.append(note);
}
window.Admin3={mount};
})();
