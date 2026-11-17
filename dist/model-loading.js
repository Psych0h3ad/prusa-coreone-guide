const words={
 title:['プリンターを準備しています','Preparing your printer','Příprava tiskárny','Drucker wird vorbereitet'],
 taskTitle:['この作業の3D部品を準備しています','Preparing 3D parts for this task','Příprava 3D dílů pro tento úkon','3D-Teile für diesen Arbeitsschritt werden vorbereitet'],
 preparation:['準備','Preparation','Příprava','Vorbereitung'],
 code:['3Dプログラムを読み込み中','Loading 3D viewer','Načítání 3D prohlížeče','3D-Ansicht wird geladen'],
 network:['3Dモデルを取得中','Downloading 3D model','Stahování 3D modelu','3D-Modell wird heruntergeladen'],
 decode:['3Dモデルを展開中','Unpacking 3D model','Rozbalování 3D modelu','3D-Modell wird entpackt'],
 verify:['3Dモデルを確認中','Checking 3D model','Kontrola 3D modelu','3D-Modell wird geprüft'],
 parse:['3Dモデルを読み込み中','Reading 3D model','Načítání 3D modelu','3D-Modell wird eingelesen'],
 inputs:['配線データを準備中','Preparing cable data','Příprava dat kabeláže','Kabeldaten werden vorbereitet'],
 routes:['配線モデルを組み立て中','Building cable models','Sestavování modelů kabeláže','Kabelmodelle werden aufgebaut'],
 parts:['CAD部品を準備中','Preparing CAD parts','Příprava CAD dílů','CAD-Bauteile werden vorbereitet'],
 surfaces:['部品の表面を準備中','Preparing part surfaces','Příprava povrchů dílů','Bauteiloberflächen werden vorbereitet'],
 hardware:['詳細部品を準備中','Preparing detailed parts','Příprava podrobných dílů','Detailbauteile werden vorbereitet'],
 electronics:['基板・Nextruderを準備中','Preparing electronics and Nextruder','Příprava elektroniky a Nextruderu','Elektronik und Nextruder werden vorbereitet'],
 axes:['駆動部品を準備中','Preparing motion components','Příprava pohybových dílů','Antriebsteile werden vorbereitet'],
 cables:['ケーブルを準備中','Preparing cables','Příprava kabelů','Kabel werden vorbereitet'],
 finishing:['部品表示を仕上げています','Finishing part display','Dokončování zobrazení dílů','Bauteilansicht wird fertiggestellt'],
 motions:['組み立て動作を準備中','Preparing assembly actions','Příprava montážních pohybů','Montagebewegungen werden vorbereitet'],
 files:['ファイル取得済み','files received','souborů načteno','Dateien geladen'],
 partCount:['部品','parts','dílů','Bauteile'],
 received:['取得済み','received','načteno','geladen']
};
const phases=[['code'],['network','decode','verify','parse'],['inputs','routes'],['parts'],['surfaces','hardware'],['electronics','axes'],['cables'],['finishing','motions']];
const css='#canvas-container .model-loading .model-loading-progress{width:min(280px,70vw);height:8px;accent-color:#fd5000;margin:2px 0 0}#canvas-container .model-loading .model-loading-title{font-size:16px;line-height:1.5;color:#252823;text-align:center;max-width:90%}#canvas-container .model-loading .model-loading-amount,#canvas-container .model-loading .model-loading-detail,#canvas-container .model-loading .model-loading-count{display:block;font-size:13px;line-height:1.5;font-variant-numeric:tabular-nums;min-height:18px;color:#596052}#canvas-container .model-loading .model-loading-detail:empty{display:none}#canvas-container .model-loading .model-loading-stage{max-width:90%;font-size:14px;line-height:1.5;text-align:center}';
export function createModelLoading(container,{stage='code',language=()=>document.documentElement.lang,withCableInputs=false,overview=true}={}){
 if(!document.querySelector('[data-model-loading-style]')){const s=document.createElement('style');s.dataset.modelLoadingStyle='true';s.textContent=css;document.head.append(s);}
 const element=document.createElement('div');element.className='model-loading';element.setAttribute('aria-busy','true');element.setAttribute('data-no-translate','');
 const cube=document.createElement('span');cube.className='loading-cube';cube.setAttribute('aria-hidden','true');
 const title=document.createElement('strong');title.className='model-loading-title';
 const heading=document.createElement('strong');heading.className='model-loading-stage';heading.setAttribute('role','status');heading.setAttribute('aria-live','polite');
 const progress=document.createElement('progress');progress.className='model-loading-progress';progress.max=1;
 const amount=document.createElement('small');amount.className='model-loading-amount';amount.setAttribute('aria-live','off');
 const count=document.createElement('small');count.className='model-loading-count';count.setAttribute('aria-live','off');count.hidden=!overview;
 const detail=document.createElement('small');detail.className='model-loading-detail';detail.setAttribute('aria-live','off');element.append(cube,title,heading,count,progress,amount,detail);container.append(element);
 const steps=phases.filter(group=>withCableInputs||group[0]!=='inputs');
 let current=stage,transfer=null,parts=null,files=null,closed=false,last='';
 const lang=()=>['ja','en','cs','de'].indexOf(language()),text=k=>(words[k]||words.code)[Math.max(0,lang())];
 function render(){
  if(closed)return;const locale=['ja','en','cs','de'][Math.max(0,lang())],number=n=>new Intl.NumberFormat(locale,{maximumFractionDigits:1,minimumFractionDigits:1}).format(n/1e6);
  const label=text(current);title.textContent=text(overview?'title':'taskTitle');if(heading.textContent!==label)heading.textContent=label;progress.setAttribute('aria-label',label);
  let total=null,value=null,message='';
  if(transfer){const {loaded}=transfer,known=transfer.lengthComputable!==false&&Number.isFinite(transfer.total)&&transfer.total>0&&loaded<=transfer.total;if(known){total=transfer.total;value=loaded;message=`${number(loaded)} / ${number(total)} MB · ${Math.floor(loaded/total*100)}%`;}else message=`${number(loaded)} MB ${text('received')}`;}
  if(parts){total=parts.total;value=parts.done;message=`${parts.done} / ${parts.total} ${text('partCount')}`;}
  const index=steps.findIndex(group=>group.includes(current));
  if(overview&&index>=0){const caption=`${text('preparation')} ${index+1} / ${steps.length}`;count.textContent=caption;progress.max=steps.length;progress.value=index;progress.setAttribute('aria-valuetext',`${caption} · ${label}${message?' · '+message:''}`);}
  else {count.textContent='';progress.removeAttribute('aria-valuetext');if(total!==null){progress.max=total;progress.value=value;}else progress.removeAttribute('value');}
  if(amount.textContent!==message)amount.textContent=message;const extra=files===null?'':`${files} ${text('files')}`;if(detail.textContent!==extra)detail.textContent=extra;
 }
 const observer=typeof MutationObserver==='function'?new MutationObserver(render):null;observer?.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});render();
 return{element,
  async paint(){if(closed)return false;await new Promise(resolve=>{if(document.hidden||document.visibilityState==='hidden'||typeof requestAnimationFrame!=='function'){setTimeout(resolve,0);return;}let frame,timer;const resume=()=>{clearTimeout(timer);if(frame!==undefined&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(frame);resolve();};timer=setTimeout(resume,50);frame=requestAnimationFrame(()=>{clearTimeout(timer);timer=setTimeout(resume,0);});});return !closed;},
  stage(next){if(closed)return;current=next;transfer=parts=null;last='';render();},
  transfer(event){if(closed||!Number.isFinite(event.loaded)||event.loaded<0)return;const changed=current!=='network';current='network';parts=null;transfer={loaded:event.loaded,total:event.total,lengthComputable:event.lengthComputable};const key=`${Math.floor(event.loaded/100000)}:${event.total}:${Math.floor(event.total>0?event.loaded/event.total*100:0)}`;if(changed||key!==last){last=key;render();}},
  parts(done,total){if(closed||!Number.isInteger(done)||!Number.isInteger(total)||total<1||done<0||done>total)return;const changed=current!=='parts';current='parts';transfer=null;parts={done,total};if(changed||done===0||done===total||done%32===0)render();},
  files(count){if(closed||!Number.isInteger(count)||count<0)return;files=count;render();},
  remove(){if(closed)return;closed=true;observer?.disconnect();element.remove();}
 };
}
