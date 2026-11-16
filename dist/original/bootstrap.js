import {installOriginal} from './register.js';
const registration=installOriginal();
const url=new URL(location.href);url.searchParams.set('flow','build');url.searchParams.set('lang','ja');history.replaceState(null,'',url);
// Other editions start a fresh document with their own canonical module graph.
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-flow="upgrade"]');if(!button)return;
 event.preventDefault();event.stopImmediatePropagation();
 location.assign(new URL('./index.html?flow=upgrade',document.baseURI));
},true);
document.documentElement.dataset.edition=registration.edition;
await import('../app.js?v=20261113-118');
