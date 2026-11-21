/* Mobile-first navigation for the authenticated workspace.
   Pure UI only: all actions reuse existing app handlers and permissions. */
(function(){
"use strict";
const desktopQuery=window.matchMedia("(min-width: 901px)");
let drawer=null,shade=null,more=null;
function close(){
 const side=document.querySelector(".workspace>.sidebar");
 if(side)side.classList.remove("expanded","mobile-open");
 shade?.classList.remove("visible");
 document.body.classList.remove("mobile-drawer-open");
 if(more){more.setAttribute("aria-expanded","false")}
 const toggle=document.querySelector(".workbody .menutoggle");if(toggle)toggle.setAttribute("aria-expanded","false");
 drawer=null;
}
function toggle(){
 const side=document.querySelector(".workspace>.sidebar");
 if(!side)return;
 if(side.classList.contains("mobile-open")){close();return}
 side.classList.add("expanded","mobile-open");
 drawer=side;
 shade=document.querySelector(".mobile-drawer-shade");
 shade?.classList.add("visible");
 document.body.classList.add("mobile-drawer-open");
 more=document.querySelector(".mobile-bottom-nav [data-mobile-more]");
 more?.setAttribute("aria-expanded","true");
 document.querySelector(".workbody .menutoggle")?.setAttribute("aria-expanded","true");
 // Allow accessible dismissal without trapping focus in a broken way.
 side.querySelector("nav button")?.focus({preventScroll:true});
}
function init(){
 close();
 const aside=document.querySelector(".workspace>.sidebar");
 const moreButton=document.querySelector(".mobile-bottom-nav [data-mobile-more]");
 const shadeElement=document.querySelector(".mobile-drawer-shade");
 if(!aside||!moreButton)return;
 drawer=aside;more=moreButton;shade=shadeElement;
 moreButton.onclick=toggle;
 const hamburger=document.querySelector(".workbody .menutoggle");
 if(hamburger){hamburger.onclick=toggle;hamburger.setAttribute("aria-expanded","false");hamburger.setAttribute("aria-controls","mobile-sidebar")}
 aside.id="mobile-sidebar";
 aside.setAttribute("aria-label","More navigation options");
 let closeButton=aside.querySelector(".mobile-drawer-close");
 if(!closeButton){
  closeButton=document.createElement("button");
  closeButton.type="button";closeButton.className="mobile-drawer-close";
  closeButton.setAttribute("aria-label","Close navigation menu");
  closeButton.textContent="✕ Close";
  aside.prepend(closeButton);
 }
 closeButton.onclick=()=>{close();moreButton.focus()};
 shade?.addEventListener("click",close);
 aside.querySelectorAll("nav button").forEach(b=>b.addEventListener("click",close));
 const title=document.querySelector(".mobile-bottom-nav");
 if(title){
  const active=title.dataset.current||"home";
  title.querySelectorAll("[data-tab]").forEach(b=>{
   const ok=b.dataset.tab===active;
   if(ok)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
  });
 }
}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.classList.contains("mobile-drawer-open")){close();more?.focus()}});
desktopQuery.addEventListener?.("change",()=>{if(desktopQuery.matches)close()});
function setActive(tab){
 const bar=document.querySelector(".mobile-bottom-nav");if(!bar)return;
 bar.dataset.current=tab;
 bar.querySelectorAll("[data-tab]").forEach(b=>{
  if(b.dataset.tab===tab)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")
 });
}
window.Mobile4={init,close,setActive};
})();
