/* Install flow for browsers with/without beforeinstallprompt.
   Everything else works even when service workers are unavailable. */
(()=>{
"use strict";
let deferredPrompt=null;
const button=()=>document.getElementById("pwa-install");
const installed=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const updateButton=()=>{const b=button();if(b)b.hidden=installed()};
function help(){
 const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent);
 const android=/Android/i.test(navigator.userAgent);
 const message=ios?
  "In Safari, tap Share (square with an upward arrow), choose Add to Home Screen, then tap Add. If you are in another browser, first open this site in Safari.":
  android?
  "Open the Chrome browser menu (⋮), choose Install app or Add to Home screen, then confirm. If the option does not appear, use Chrome and check that the site is open over HTTPS.":
  "Open your browser's menu or address-bar install icon, choose Install app / Install page as app, and confirm. Supported browsers can also show a direct install prompt.";
 let dialog=document.getElementById("pwa-install-help");
 if(!dialog){
  dialog=document.createElement("dialog");
  dialog.id="pwa-install-help";
  dialog.setAttribute("aria-labelledby","pwa-help-title");
  dialog.className="pwa-install-help";
  const title=document.createElement("h2");title.id="pwa-help-title";title.textContent="Install Super 100 Mission 2027";
  const p=document.createElement("p");p.id="pwa-help-message";
  const hint=document.createElement("p");hint.className="pwa-help-hint";hint.textContent="Login, online tests, syncing, and PDFs need internet. The app does not store private exam data offline.";
  const close=document.createElement("button");close.type="button";close.textContent="Got it / समझ गया";close.onclick=()=>dialog.close();
  dialog.append(title,p,hint,close);document.body.append(dialog);
 }
 dialog.querySelector("#pwa-help-message").textContent=message;
 if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();
 else if(typeof dialog.showModal!=="function")alert(message);
}
window.addEventListener("beforeinstallprompt",event=>{
 event.preventDefault();deferredPrompt=event;updateButton();
});
window.addEventListener("appinstalled",()=>{deferredPrompt=null;updateButton()});
async function install(){
 if(installed())return;
 if(!deferredPrompt){help();return}
 const prompt=deferredPrompt;deferredPrompt=null;
 try{await prompt.prompt();await prompt.userChoice}catch(error){console.warn("PWA install prompt:",error)}
 updateButton();
}
function init(){
 const b=button();
 if(b){b.onclick=install;updateButton()}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost")){
 window.addEventListener("load",()=>{
  navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(error=>{
   console.warn("PWA offline screen unavailable; website continues normally.",error);
  });
 },{once:true});
}
})();
