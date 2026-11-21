/* Super 100 PWA service worker.
   Caches only safe public presentation assets. Never cache Supabase/API,
   auth/session data, submitted answers, questions, test responses, or PDFs.
*/
"use strict";
const CACHE="s100-pwa-public-v1-20261122";
const CACHE_PREFIX="s100-pwa-public-";
const ROOT=new URL("./",self.registration.scope);
const OFFLINE=new URL("./offline.html",ROOT);
const PRECACHE=[
 "./offline.html",
 "./manifest.webmanifest",
 "./icons/app-192.png",
 "./icons/app-512.png",
 "./icons/apple-touch-icon.png",
 "./icons/app-icon.svg"
].map(path=>new URL(path,ROOT).href);
self.addEventListener("install",event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(PRECACHE);
  await self.skipWaiting();
 })());
});
self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET")return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith(ROOT.pathname))return;
 // Navigation always goes to the live server. If offline, use a static
 // explanation instead of serving a stale login or cached authenticated app.
 if(req.mode==="navigate"){
  event.respondWith(fetch(req).catch(async()=>await caches.match(OFFLINE)||Response.error()));
  return;
 }
 // Never intercept/cache JSON APIs, JavaScript code containing auth logic,
 // remote CDN requests, POSTs, or large study PDFs.
 if(!/\.(?:css|png|svg|webmanifest|ico)$/i.test(url.pathname))return;
 event.respondWith((async()=>{
  try{
   const response=await fetch(req);
   if(response.ok&&response.type==="basic"){
    const cache=await caches.open(CACHE);
    await cache.put(req,response.clone());
    const keys=await cache.keys();
    if(keys.length>70){
     const keep=new Set(PRECACHE);
     for(const old of keys){
      if(keys.length<=70)break;
      if(!keep.has(old.url)){await cache.delete(old);keys.pop();}
     }
    }
   }
   return response;
  }catch{
   return await caches.match(req)||Response.error();
  }
 })());
});
