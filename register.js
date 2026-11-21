/* Separate new-student registration screen, sharing existing Supabase mapping.
   Existing auth tables, admin approval and profile creation remain unchanged. */
(()=>{
"use strict";
const form=document.getElementById("registration-form");
if(!form)return;
const err=document.getElementById("reg-message");
const btn=document.getElementById("register-submit");
const feedback=(message)=>{
 err.hidden=!message;
 if(message){err.dataset.error="true";err.textContent=message}
 else{err.textContent="";err.removeAttribute("data-error")}
};
const nameValue=value=>String(value??"").normalize("NFKC").trim().replace(/\s+/gu," ");
for(const button of document.querySelectorAll("[data-password-toggle]")){
 button.addEventListener("click",()=>{
  const input=document.getElementById(button.dataset.passwordToggle);
  const visible=input.type==="password";
  input.type=visible?"text":"password";
  button.textContent=visible?"Hide":"Show";
  button.setAttribute("aria-label",(visible?"Hide":"Show")+" "+(input.id==="reg-confirm"?"confirm password":"password"));
 });
}
if(!window.CONFIG?.url||!window.CONFIG?.key||!window.supabase?.createClient||!window.Super100AuthNames){
 feedback("Registration is temporarily unavailable. Please contact your administrator.");
 btn.disabled=true;
 return;
}
const auth=supabase.createClient(window.CONFIG.url,window.CONFIG.key);
const {accountUsername,usernameEmail}=window.Super100AuthNames;
auth.auth.getSession().then(({data,error})=>{
 if(!error&&data?.session?.user){
  feedback("You are already signed in. Open the Dashboard to continue, or log out before registering another account.");
  btn.disabled=true;
 }
}).catch(()=>{});
form.addEventListener("submit",async event=>{
 event.preventDefault();
 if(btn.disabled||!form.reportValidity())return;
 feedback("");
 const display=nameValue(document.getElementById("full-name").value);
 const username=document.getElementById("reg-username").value;
 const password=document.getElementById("reg-password").value;
 const confirm=document.getElementById("reg-confirm").value;
 try{
  if([...display].length<2||[...display].length>100)throw Error("Enter a name between 2 and 100 characters.");
  if(/[\u0000-\u001F\u007F]/u.test(display))throw Error("Name contains unsupported characters.");
  const visibleUser=accountUsername(username);
  if(password.length<8)throw Error("Use a password with at least 8 characters.");
  if(password!==confirm)throw Error("Passwords do not match / पासवर्ड एक जैसे नहीं हैं.");
  btn.disabled=true;
  btn.textContent="Creating account...";
  const address=await usernameEmail(visibleUser);
  // The backend profile trigger receives the stable, email-safe username;
  // users see their supplied full name on the Dashboard.
  const {data,error}=await auth.auth.signUp({
   email:address,
   password,
   options:{data:{
    username:address.split("@")[0],
    display_name:display,
    preferred_username:visibleUser
   }}
  });
  if(error)throw Error(error.message);
  if(!data?.user||Array.isArray(data.user.identities)&&data.user.identities.length===0)
   throw Error("This username may already have an account. Try Login.");
  form.hidden=true;
  document.getElementById("reg-success").hidden=false;
  document.querySelector(".auth-card .auth-subtitle").textContent="Your request is in the admin approval queue.";
 }catch(e){
  feedback(e?.message||"Could not create your account. Please try again.");
  btn.disabled=false;
  btn.textContent="Create account / रजिस्टर करें →";
 }
});
})();
