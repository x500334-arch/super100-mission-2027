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
 await check("Admin approval cards work without scrolling 7 columns",async()=>{
  const tr=(id,name,approved)=>'<tr data-name="'+name+'" data-status="'+(approved?"approved":"pending")+'"><td><button onclick="window.__reports.push(\''+id+'\')">'+name+'</button></td>'+
   '<td>2/14</td><td>1</td><td>10/20</td><td>50%</td><td>'+(approved?"Approved":"Pending")+'</td>'+
   '<td><button onclick="window.__approvals.push(\''+id+'\')">'+(approved?"Block":"Approve")+'</button></td></tr>';
  const html='<!doctype html><html><body class="mobile-drawer-open">'+
   '<div class="workbody"><h1>Admin control / प्रबंधन</h1>'+
   '<section class="panel"><h2>Admin overview / छात्र विश्लेषण</h2>'+
   '<label>Search students <input id="adminsearch"></label><label>Status<select id="adminstatus"><option value="all">All</option><option value="approved">Approved</option><option value="pending">Pending</option></select></label>'+
   '<div style="overflow-x:auto"><table><tbody id="adminrows">'+tr("pending-student","Aman Kumar",false)+tr("approved-student","Test Student",true)+'</tbody></table></div>'+
   '<button id="adminSummaryCsv">CSV</button><h3>Test participation</h3><p>Summary</p></section>'+
   '<section class="panel"><h2>Test scheduling</h2></section><h2>Students</h2><article>Duplicate cards</article>'+
   '<button id="csv">Export</button>'+
   '<section class="panel"><h2>Create test</h2></section><section class="panel"><h2>Add question</h2></section>'+
   '<section class="panel"><h2>Bulk question upload</h2></section><section class="panel"><h2>Add learning resource</h2></section>'+
   '<section class="panel"><h2>Announcements</h2></section></div></body></html>';
  const d=dom(html),w=d.window;
  w.__approvals=[];w.__reports=[];
  w.profile={admin:true,approved:true};w.user={id:"admin-owner"};
  w.Mobile4={close(){w.document.body.classList.remove("mobile-drawer-open")}};
  w.matchMedia=()=>({matches:true});
  w.confirm=()=>true;
  w.eval(file("admin3.js"));
  w.Admin3.mount({users:[
   {id:"admin-owner",username:"Admin",admin:true,approved:true},
   {id:"pending-student",username:"Aman Kumar",admin:false,approved:false},
   {id:"approved-student",username:"Test Student",admin:false,approved:true}],
   attempts:[],progress:[],ts:[]});
  const doc=w.document;
  assert.ok(doc.querySelector(".workbody").classList.contains("admin3-page"),"admin styles enabled");
  assert.equal(doc.body.classList.contains("mobile-drawer-open"),false,"body unlocked");
  assert.equal(doc.querySelectorAll(".admin3-mobile-student-card").length,2);
  assert.equal(doc.querySelectorAll(".workbody > article").length,0,"no duplicate old cards");
  assert.equal(doc.querySelectorAll(".admin3-mobile-student-card")[0].querySelector("strong").textContent,"Aman Kumar","pending first");
  const studentTab=doc.getElementById("admin3-tab-students");
  studentTab.click();
  assert.equal(doc.getElementById("admin3-pane-students").hidden,false);
  const approve=doc.querySelector(".admin3-mobile-student-approve.approve");
  approve.click();
  assert.equal(w.__approvals[0],"pending-student","calls original approval action");
  const report=doc.querySelector(".admin3-mobile-student-report");report.click();
  assert.equal(w.__reports[0],"pending-student");
  // Existing filter + our phone card filter must stay in sync.
  const search=doc.getElementById("adminsearch");
  search.oninput=()=>doc.querySelectorAll("#adminrows tr").forEach(row=>row.hidden=!row.dataset.name.toLowerCase().includes(search.value.toLowerCase()));
  search.value="Aman";search.dispatchEvent(new w.Event("input",{bubbles:true}));
  assert.equal([...doc.querySelectorAll(".admin3-mobile-student-card")].filter(x=>!x.hidden).length,1);
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
