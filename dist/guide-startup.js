// MIT. This classic script can report a failed application module graph.
(() => {
 const doc=document,script=doc.currentScript,panel=doc.getElementById('guide-startup');
 if(!panel||doc.documentElement.dataset.guideStartup)return;
 const words={
  loading:['ガイドを読み込んでいます','Loading the guide','Načítání průvodce','Anleitung wird geladen'],
  detail:['手順と操作画面を準備しています。','Preparing the instructions and controls.','Připravují se pokyny a ovládání.','Anweisungen und Bedienelemente werden vorbereitet.'],
  slow:['読み込みに時間がかかっています','Loading is taking longer','Načítání trvá déle','Das Laden dauert länger'],
  waiting:['読み込みを続けています。接続が戻れば、そのまま開きます。','Loading continues. The guide will open when the connection recovers.','Načítání pokračuje. Po obnovení připojení se průvodce otevře.','Der Ladevorgang läuft weiter. Sobald die Verbindung wiederhergestellt ist, öffnet sich die Anleitung.'],
  failed:['ガイドを読み込めませんでした','The guide could not load','Průvodce se nepodařilo načíst','Die Anleitung konnte nicht geladen werden'],
  connection:['接続を確認して、もう一度お試しください。','Check your connection and try again.','Zkontrolujte připojení a zkuste to znovu.','Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.'],
  again:['読み込みをやり直しています','Loading the guide again','Průvodce se načítá znovu','Anleitung wird erneut geladen'],
  retry:['もう一度読み込む','Reload the guide','Znovu načíst průvodce','Anleitung neu laden'],
  elapsed:['経過','Elapsed','Uplynulo','Vergangen'],seconds:['秒','s','s','s']
 };
 const retryKey='prusa-guide-module-retry:'+new URL(script.dataset.guideEntry,script.src).href;
 const languages=['ja','en','cs','de'];let selected;
 try{selected=new URL(location.href).searchParams.get('lang')||localStorage.getItem('prusa-assembly-lab-language');}catch{}
 if(script.dataset.guideLanguage)selected=script.dataset.guideLanguage;
 const language=Math.max(0,languages.indexOf(selected||doc.documentElement.lang)),word=k=>words[k][language];
 const title=doc.getElementById('guide-startup-title'),detail=doc.getElementById('guide-startup-detail'),elapsed=doc.getElementById('guide-startup-elapsed'),progress=panel.querySelector('progress'),retry=panel.querySelector('button');
 const blocked=[...doc.querySelectorAll('body > header,body > main,body > nav')].map(element=>({element,inert:element.hasAttribute('inert')}));
 for(const item of blocked)item.element.setAttribute('inert','');
 panel.lang=languages[language];retry.textContent=word('retry');title.textContent=word('loading');detail.textContent=word('detail');progress.setAttribute('aria-label',word('loading'));
 doc.documentElement.dataset.guideStartup='loading';
 const started=performance.now();let timer,settled=false,suspended=false;
 function stop(){if(timer!==undefined){clearTimeout(timer);timer=undefined;}}
 function tick(){
  stop();if(settled||suspended||doc.hidden)return;
  const seconds=Math.floor((performance.now()-started)/1000);elapsed.textContent=`${word('elapsed')} ${seconds} ${word('seconds')}`;
  if(seconds>=30){doc.documentElement.dataset.guideStartup='slow';title.textContent=word('slow');detail.textContent=word('waiting');}
  timer=setTimeout(tick,1000);
 }
 function visibility(){if(doc.hidden)stop();else tick();}
 function hide(event){suspended=true;stop();if(!event.persisted){settled=true;release();}}
 function show(){suspended=false;tick();}
 function release(){stop();doc.removeEventListener('visibilitychange',visibility);removeEventListener('pagehide',hide);removeEventListener('pageshow',show);}
 doc.addEventListener('visibilitychange',visibility);addEventListener('pagehide',hide);addEventListener('pageshow',show);tick();
 // Keep a single module graph. A timeout leaves this same import running.
 Promise.resolve().then(()=>import(new URL(script.dataset.guideEntry,script.src).href)).then(()=>{
  if(settled)return;settled=true;release();doc.documentElement.dataset.guideStartup='ready';try{sessionStorage.removeItem(retryKey);}catch{}
  for(const item of blocked)if(!item.inert)item.element.removeAttribute('inert');
  panel.remove();doc.getElementById('guide-startup-style')?.remove();
 },error=>{
  if(settled)return;settled=true;release();
  console.error('Guide startup failed',error);
  // A failed module graph cannot be re-imported reliably in the same document.
  // One document reload keeps the step URL. A session marker prevents loops;
  // unavailable storage and application errors retain the manual retry button.
  const networkModuleFailure=error?.name==='TypeError'&&/Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Failed to load module script/i.test(error.message||'');
  if(networkModuleFailure)try{
   if(sessionStorage.getItem(retryKey)!=='1'){
    sessionStorage.setItem(retryKey,'1');doc.documentElement.dataset.guideStartup='retrying';title.textContent=word('again');detail.textContent=word('waiting');location.reload();return;
   }
  }catch{}
  doc.documentElement.dataset.guideStartup='failed';
  panel.setAttribute('aria-busy','false');panel.setAttribute('role','alert');title.textContent=word('failed');detail.textContent=word('connection');progress.hidden=true;
 });
})();
