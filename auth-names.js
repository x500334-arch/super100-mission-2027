/* Shared display-name-to-auth-email mapping. Keep old usernames compatible.
   Registration and sign-in MUST use exactly the same normalization. */
(function(){
"use strict";
function accountUsername(value){
 const name=String(value??'').normalize('NFKC').trim().replace(/\s+/gu,' ');
 if(!name)throw Error('Please enter a username / यूज़रनेम लिखें');
 if([...name].length>100)throw Error('Username can contain up to 100 characters.');
 if(/[\u0000-\u001F\u007F]/u.test(name))throw Error('Username cannot contain control characters.');
 return name;
}
async function usernameEmail(value){
 const name=accountUsername(value),canonical=name.toLocaleLowerCase('en');
 if(/^[a-z0-9_]{3,30}$/.test(canonical))return canonical+'@students.example.com';
 // Prefix/slug is readable to admins if profile is derived from email;
 // 16 hex digits of SHA-256 prevent ordinary alias collisions.
 if(!globalThis.crypto?.subtle)throw Error('Secure HTTPS connection needed to sign in with this username.');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical));
 const hex=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
 const stem=canonical.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,11)||'student';
 return 'u_'+stem+'_'+hex.slice(0,16)+'@students.example.com';
}

window.Super100AuthNames=Object.freeze({accountUsername,usernameEmail});
})();
