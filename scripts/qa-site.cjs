// Super 100 Mission 2027 — offline/DOM smoke tests.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {webcrypto}=require("node:crypto");
const vm=require("node:vm");
const {JSDOM}=require("jsdom");
const base=path.resolve(__dirname,".."),file=p=>fs.readFileSync(path.join(base,p),"utf8");
let passed=0;
function check(name,fn){return Promise.resolve().then(fn).then(()=>{console.log("PASS",name);passed++})}
function dom(html){return new JSDOM(html,{url:"https://x500334-arch.github.io/super100-mission-2027/",runScripts:"dangerously",pretendToBeVisual:true})}
function injectCrypto(w){Object.defineProperty(w,"crypto",{value:webcrypto,configurable:true});w.TextEncoder=TextEncoder}
(async()=>{
 await check("JavaScript parses across every frontend module",()=>{
  for(const p of ["app.js","content.js","countdown.js","admin3.js","mobile4.js","modern2.js","priority.js","auth-names.js","register.js","pwa.js","sw.js"])
   new vm.Script(file(p),{filename:p});
 });
 await check("All local HTML links and PWA icons exist",()=>{
  for(const p of ["index.html","register.html","notes.html"]){
   const content=file(p);
   const refs=[...content.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(x=>x[1]);
   for(let ref of refs){
    if(/^https?:\/\/|^mailto:|^#|^data:/.test(ref))continue;
    ref=ref.replace(/^\.\//,"").split("?")[0];
    assert.ok(fs.existsSync(path.join(base,ref)),p+" references missing "+ref);
   }
  }
  const manifest=JSON.parse(file("manifest.webmanifest"));
  assert.equal(manifest.display,"standalone");
  for(const icon of manifest.icons)assert.ok(fs.existsSync(path.join(base,icon.src)));
  for(let i=1;i<=14;i++)assert.ok(fs.existsSync(path.join(base,"pdf",String(i).padStart(2,"0")+"_"+["Average","Speed_Time_Distance","Profit_Loss_Discount","Mensuration","Ratio_Proportion_Alligation","Simple_Compound_Interest","Time_Work","Pipes_Cisterns","Percentage","Geometry","BODMAS","Quadratic_Equations","Trigonometry","Algebraic_Expressions"][i-1]+".pdf")));
 });
 await check("Old user accounts and flexible signup use one canonical mapping",async()=>{
  const d=dom("<html><body></body></html>");const w=d.window;
  injectCrypto(w);w.eval(file("auth-names.js"));
  const {usernameEmail,accountUsername}=w.Super100AuthNames;
  assert.equal(await usernameEmail("admin"),"admin@students.example.com");
  assert.equal(await usernameEmail("ADMIN"),"admin@students.example.com");
  assert.equal(await usernameEmail("  Admin  "),"admin@students.example.com");
  assert.equal(await usernameEmail("Aman Kumar"),await usernameEmail("aman   kumar"));
  assert.match(await usernameEmail("अमन कुमार"),/^u_student_[a-f0-9]{16}@students\.example\.com$/);
  assert.equal(accountUsername("  Aman    Kumar "),"Aman Kumar");
  assert.throws(()=>accountUsername(" "),/Please enter a username/);
  assert.ok(file("app.js").includes("window.Super100AuthNames"),"login uses shared mapper");
  assert.ok(file("register.js").includes("window.Super100AuthNames"),"registration uses shared mapper");
  w.close();
 });
 await check("New-account form validates password and submits safe signup metadata",async()=>{
  const d=dom(file("register.html")),w=d.window;
  injectCrypto(w);
  let requested=null;
  w.CONFIG={url:"https://example.supabase.co",key:"public-test"};
  w.supabase={createClient(){return {auth:{
   getSession:async()=>({data:{session:null},error:null}),
   signUp:async args=>{requested=args;return {data:{user:{id:"u-new",identities:[{id:"i"}]}},error:null}}
  }}}};
  w.eval(file("auth-names.js"));w.eval(file("register.js"));
  await new Promise(r=>setTimeout(r,5));
  const set=(id,value)=>{w.document.getElementById(id).value=value};
  set("full-name","Aman Kumar");set("reg-username","Aman Kumar");
  set("reg-password","S100studentPass9");set("reg-confirm","bad-confirm");
  const submit=()=>w.document.getElementById("registration-form").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  submit();await new Promise(r=>setTimeout(r,5));
  assert.equal(requested,null);
  assert.match(w.document.getElementById("reg-message").textContent,/do not match/);
  set("reg-confirm","S100studentPass9");
  submit();await new Promise(r=>setTimeout(r,30));
  assert.ok(requested,"signup called");
  assert.match(requested.email,/^u_aman_kumar_[a-f0-9]{16}@students\.example\.com$/);
  assert.equal(requested.options.data.display_name,"Aman Kumar");
  assert.equal(requested.options.data.preferred_username,"Aman Kumar");
  assert.equal(w.document.getElementById("reg-success").hidden,false);
  assert.equal(w.document.getElementById("registration-form").hidden,true);
  w.close();
 });
 await check("Pending, Approved and Blocked appear in strictly separate sections",async()=>{
  const html='<!doctype html><html><body class="mobile-drawer-open"><div class="workbody">'+
   '<h1>Admin control / प्रबंधन</h1>'+
   '<section class="panel"><h2>Admin overview / छात्र विश्लेषण</h2>'+
   '<label>Search students <input id="adminsearch"></label>'+
   '<label>Status <select id="adminstatus"><option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="blocked">Blocked</option></select></label>'+
   '<div><table><tbody id="adminrows"></tbody></table></div>'+
   '<button id="adminSummaryCsv">CSV</button></section>'+
   '<section class="panel"><h2>Test scheduling</h2></section>'+
   '<button id="csv">Export</button>'+
   '<section class="panel"><h2>Create test</h2></section>'+
   '<section class="panel"><h2>Add question</h2></section>'+
   '<section class="panel"><h2>Bulk question upload</h2></section>'+
   '<section class="panel"><h2>Add learning resource</h2></section>'+
   '<section class="panel"><h2>Announcements</h2></section></div></body></html>';
  const d=dom(html),w=d.window;w.profile={admin:true,approved:true,blocked:false};w.user={id:"admin-owner"};
  w.Mobile4={close(){w.document.body.classList.remove("mobile-drawer-open")}};
  w.matchMedia=()=>({matches:true});
  w.__actions=[];w.__reports=[];
  w.run=fn=>async()=>fn();
  w.setStudentStatus=(id,next)=>w.__actions.push([id,next]);
  w.adminStudent=id=>w.__reports.push(id);
  w.eval(file("admin3.js"));
  w.Admin3.mount({users:[
   {id:"admin-owner",username:"Admin",admin:true,approved:true,blocked:false},
   {id:"pending-student",username:"Aman Kumar",admin:false,approved:false,blocked:false},
   {id:"approved-student",username:"Approved Student",admin:false,approved:true,blocked:false},
   {id:"blocked-student",username:"Blocked Student",admin:false,approved:false,blocked:true}
  ],attempts:[],progress:[],ts:[]});
  const doc=w.document;
  assert.ok(doc.querySelector(".workbody").classList.contains("admin3-page"));
  assert.equal(doc.body.classList.contains("mobile-drawer-open"),false);
  const tabs=["pending","approved","blocked"];
  for(const key of tabs){
   doc.getElementById("admin3-tab-"+key).click();
   assert.equal(doc.getElementById("admin3-pane-"+key).hidden,false);
   assert.equal(doc.querySelectorAll("#admin3-pane-"+key+" .admin3-person-card").length,1);
   assert.equal(doc.querySelector("#admin3-pane-"+key+" .admin3-person-badge").textContent,
    key==="pending"?"Awaiting review":key==="approved"?"Active":"Blocked");
  }
  const pending=doc.getElementById("admin3-pane-pending");
  assert.ok(pending.querySelector(".admin3-action-approve"));
  assert.equal(pending.querySelector(".admin3-action-block"),null,"No block action in pending requests");
  const approved=doc.getElementById("admin3-pane-approved");
  assert.ok(approved.querySelector(".admin3-action-block"));
  assert.equal(approved.querySelector(".admin3-action-approve"),null,"No approval action in approved users");
  const blocked=doc.getElementById("admin3-pane-blocked");
  assert.ok(blocked.querySelector(".admin3-action-restore"));
  assert.equal(blocked.querySelector(".admin3-action-approve"),null,"Blocked cannot be approved directly");
  pending.querySelector(".admin3-action-approve").click();
  approved.querySelector(".admin3-action-block").click();
  blocked.querySelector(".admin3-action-restore").click();
  await new Promise(done=>setTimeout(done,0));
  assert.deepEqual(w.__actions,[["pending-student","approved"],["approved-student","blocked"],["blocked-student","pending"]]);
  pending.querySelector(".admin3-action-report").click();
  await new Promise(done=>setTimeout(done,0));
  assert.deepEqual(w.__reports,["pending-student"]);
  // Each section filters independently without affecting the other two.
  const search=pending.querySelector(".admin3-roster-search");
  search.value="not a student";search.dispatchEvent(new w.Event("input",{bubbles:true}));
  assert.equal(pending.querySelector(".admin3-person-card").hidden,true);
  assert.equal(approved.querySelector(".admin3-person-card").hidden,false);
  w.close();
 });
 await check("Missing blocked-column migration disables blocking without mixing accounts",()=>{
  const d=dom('<!doctype html><html><body><div class="workbody"><h1>Admin control / प्रबंधन</h1>'+
   '<section class="panel"><h2>Admin overview</h2></section></div></body></html>');
  const w=d.window;w.profile={admin:true,approved:true};w.user={id:"admin-owner"};
  w.matchMedia=()=>({matches:true});w.Mobile4={close(){}};
  w.eval(file("admin3.js"));
  w.Admin3.mount({users:[
   {id:"admin-owner",username:"admin",admin:true,approved:true},
   {id:"a",username:"Aman",admin:false,approved:false},
   {id:"b",username:"Bina",admin:false,approved:true}
  ],attempts:[],progress:[],ts:[]});
  const doc=w.document;
  assert.equal(doc.querySelectorAll("#admin3-pane-pending .admin3-person-card").length,1);
  assert.equal(doc.querySelectorAll("#admin3-pane-blocked .admin3-person-card").length,0);
  assert.equal(doc.querySelector("#admin3-pane-approved .admin3-action-block").disabled,true);
  assert.ok(doc.querySelector("#admin3-pane-blocked .admin3-migration-warning"));
  w.close();
 });
 await check("Phone approval dialog can confirm/cancel without body scroll locks",async()=>{
  const d=dom("<html><body><button id='source'>Approve</button></body></html>"),w=d.window;
  w.profile={admin:true,approved:true};w.user={id:"admin-owner"};
  w.matchMedia=()=>({matches:true});w.confirm=()=>{throw Error("Should not use native confirm on mobile")};
  w.eval(file("admin3.js"));
  w.document.getElementById("source").focus();
  let p=w.Admin3.confirmApproval("Approve this student?");
  assert.ok(w.document.getElementById("admin3-confirm-shade"));
  w.document.querySelector(".admin3-confirm-cancel").click();
  assert.equal(await p,false);
  assert.equal(w.document.getElementById("admin3-confirm-shade"),null);
  p=w.Admin3.confirmApproval("Approve this student?");
  w.document.querySelector(".admin3-confirm-yes").click();
  assert.equal(await p,true);
  assert.equal(w.document.body.classList.contains("mobile-drawer-open"),false);
  w.close();
 });
 await check("Mobile drawer opens/closes without leaving body scroll locked",()=>{
  const html='<!doctype html><body><div class="workspace">'+
   '<aside class="sidebar"><nav><button id="sidebar-home" type="button">Home</button></nav></aside>'+
   '<div class="workbody"><button class="menutoggle" type="button">Menu</button></div></div>'+
   '<div class="mobile-drawer-shade"></div>'+
   '<nav class="mobile-bottom-nav"><button data-tab="home" type="button">Home</button>'+
   '<button data-tab="priority" type="button">Priority</button>'+
   '<button data-mobile-more type="button">More</button></nav></body>';
  const d=dom(html),w=d.window;
  w.matchMedia=()=>({matches:false,addEventListener(){}});
  w.eval(file("mobile4.js"));
  w.Mobile4.init();
  const more=w.document.querySelector("[data-mobile-more]"),
        side=w.document.querySelector(".sidebar");
  more.click();
  assert.equal(w.document.body.classList.contains("mobile-drawer-open"),true);
  assert.equal(side.classList.contains("mobile-open"),true);
  w.document.querySelector(".mobile-drawer-close").click();
  assert.equal(w.document.body.classList.contains("mobile-drawer-open"),false);
  assert.equal(side.classList.contains("mobile-open"),false);
  more.click();
  w.document.getElementById("sidebar-home").click();
  assert.equal(w.document.body.classList.contains("mobile-drawer-open"),false);
  w.Mobile4.setActive("priority");
  assert.equal(w.document.querySelector('[data-tab="priority"]').getAttribute("aria-current"),"page");
  w.close();
 });
 await check("PWA caches no private data or answer/PDF responses",()=>{
  const source=file("sw.js");
  assert.ok(source.includes('req.method!=="GET"'));
  assert.ok(source.includes('req.mode==="navigate"'));
  assert.ok(source.includes('url.origin!==self.location.origin'));
  assert.ok(source.includes('css|png|svg|webmanifest|ico'));
  assert.ok(!source.includes("caches.open('auth"));
  assert.ok(file("index.html").includes("admin3.js"));
  assert.ok(file("index.html").includes("auth-names.js"));
 });
 console.log("ALL PASSED:",passed,"categories");
})().catch(error=>{console.error("QA FAILED:",error&&error.stack||error);process.exitCode=1});
