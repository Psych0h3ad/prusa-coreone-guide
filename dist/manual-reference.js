import {FLOWS} from './data.js?v=20261112-113';
import {icon} from './icons.js?v=20261111-94';
import {currentLanguage,languageControl,t,translateDOM} from './i18n.js?v=20261112-113';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Select only photographs in the current official step's gallery.
export function selectReferencePhoto(photos,requested,fallback=0){
 const start=Math.max(0,Math.min(Number.isInteger(fallback)?fallback:0,photos.length-1));
 if(Number.isInteger(requested)){
  const index=photos.findIndex(photo=>photo.photoID===requested||photo.id===requested);
  return {index:index>=0?index:start,plain:false};
 }
 if(typeof requested!=='string'||!requested)return {index:start,plain:false};
 const normalize=url=>typeof url==='string'?url.replace(/-\d+x\d+(?=\.[^.]+$)/,''):undefined,wanted=normalize(requested);
 const index=photos.findIndex(photo=>[photo.url,photo.preview,photo.thumbnail,photo.plain].some(url=>url&&normalize(url)===wanted));
 return index<0?{index:start,plain:false}:{index,plain:!!photos[index].plain&&normalize(photos[index].plain)===wanted};
}

// Only the selected chapter is requested. A failed request must remain retryable.
export function createReferenceLoader(fetcher=fetch){
 const cache=new Map();
 return async (flow,chapter,id)=>{
  if(!['build','upgrade'].includes(flow)||!Number.isInteger(chapter)||chapter<0)throw Error('Invalid reference');
  const key=`${flow==='build'&&FLOWS.build.manualID===2251?'original2251-build':flow}-${chapter}`;
  if(!cache.has(key)){
   const request=(async()=>{
    const response=await fetcher(`./assets/manual-reference/${key}.json?v=20261117-200`);
    if(!response.ok)throw Error('Reference unavailable');
    const data=await response.json();if(!data.steps)throw Error('Invalid reference');return data;
   })();
   cache.set(key,request);
   request.catch(()=>{if(cache.get(key)===request)cache.delete(key);});
  }
  const data=await cache.get(key),step=data.steps[String(id)];
  if(!step||!Array.isArray(step.photos))throw Error('Missing official step');
  return step.photos;
 };
}

// Split the authored, already-localized explanation without dropping conditions or quantities.
export function instructionSentences(text,locale='ja'){
 if(!text?.trim())return [];
 if(typeof Intl.Segmenter!=='function')return [text.trim()];
 const pairs={'「':'」','『':'』','（':'）','(':')','[':']','“':'”','"':'"'},stack=[],sentences=[];
 let pending='';
 for(const {segment}of new Intl.Segmenter(locale,{granularity:'sentence'}).segment(text)){
  pending+=segment;
  for(const char of segment){if(char===stack.at(-1))stack.pop();else if(pairs[char])stack.push(pairs[char]);}
  if(!stack.length){sentences.push(pending.trim());pending='';}
 }
 if(pending.trim())sentences.push(pending.trim());
 return sentences;
}
export function stepInstructions(step){
 if(step.primaryInstructions?.length)return `${step.description?`<p class="step-description">${esc(step.description)}</p>`:''}<ol class="step-method-list" aria-label="${esc(t('作業手順'))}">${step.primaryInstructions.map(l=>`<li data-source-line="${l.lineID}">${esc(l.text)}</li>`).join('')}</ol>`;
 const sentences=instructionSentences(step.description,currentLanguage());
 return sentences.length>1?`<ol class="step-method-list" aria-label="${esc(t('作業手順'))}">${sentences.map(sentence=>`<li>${esc(sentence)}</li>`).join('')}</ol>`:sentences.length?`<p class="step-description">${esc(sentences[0])}</p>`:'';
}

// These are the guide's authored instructions, not a copy of the publisher's full text.
export function stepReading(step){
 const items=(label,values)=>values?.length?`<section class="manual-reading-list"><h3>${esc(label)}</h3><ul>${values.map(value=>`<li>${esc(value)}</li>`).join('')}</ul></section>`:'';
 return `<div class="manual-step-reading">${stepInstructions(step)}${step.tip?`<aside class="tip"><div class="tip-title">${icon('tip')} 注意事項</div><p>${esc(step.tip)}</p></aside>`:''}${items('この手順で用意する部品',step.supplies)}${items('主な工具',step.tools)}${items('作業後に確認すること',step.checks)}</div>`;
}

export function createManualReference({dialog,content,modal,context,pause,inlineContainer,load=createReferenceLoader()}){
 let serial=0,photos=[],index=0,plain=false,zoom=false,active,opener,requestedPhoto,photosFirst=false;
 const inlineViews=new WeakMap();
 const isOpen=()=>dialog.open&&dialog.classList.contains('manual-dialog');
 const translate=()=>translateDOM(content);
 const gallery=()=>content.querySelector('[data-manual-gallery]');
 function renderPhoto(reveal=false){
  const photo=photos[index];if(!photo)return;
  gallery().innerHTML=photoMarkup(photos,index,plain,zoom);
  translate();
  if(reveal)dialog.scrollTop+=gallery().getBoundingClientRect().top-dialog.getBoundingClientRect().top-16;
 }
 function photoMarkup(list,selected,unmarked=false,enlarged=false){
  const photo=list[selected],url=unmarked&&photo.plain?photo.plain:photo.url;
  return `<figure class="manual-figure ${enlarged?'manual-zoomed':''}"><div class="manual-image-viewport"><button type="button" class="manual-image-button" data-manual-zoom aria-label="${enlarged?'拡大を解除':'写真を拡大'}" aria-pressed="${enlarged}"><img data-manual-photo src="${esc(unmarked||enlarged?url:photo.preview)}" data-original="${esc(url)}" alt="${esc(t(`写真 ${selected+1} / ${list.length}`))}" width="${photo.width||800}" height="${photo.height||600}" decoding="async" referrerpolicy="no-referrer"></button></div><figcaption><span aria-live="polite">写真 ${selected+1} / ${list.length}</span><button type="button" data-manual-zoom>${enlarged?'拡大を解除':'写真を拡大'} ${icon('focus')}</button></figcaption><div class="manual-photo-error" hidden><p>写真を読み込めませんでした。もう一度お試しください。</p><button type="button" data-manual-photo-retry>写真を再読み込み</button></div></figure>${list.length>1||photo.plain?`<div class="manual-gallery-controls"><button type="button" data-manual-previous aria-label="前の写真" ${selected===0?'disabled':''}>${icon('arrow-left')}</button>${photo.plain?`<button type="button" data-manual-plain aria-pressed="${unmarked}">${unmarked?'注釈を表示':'注釈を隠す'}</button>`:'<span></span>'}<button type="button" data-manual-next aria-label="次の写真" ${selected===list.length-1?'disabled':''}>${icon('arrow-right')}</button></div>`:''}${list.length>1?`<div class="manual-thumbnails" aria-label="この手順の写真">${list.map((p,i)=>`<button type="button" data-manual-photo-index="${i}" aria-label="写真 ${i+1} / ${list.length}" aria-pressed="${i===selected}"><img src="${esc(p.thumbnail)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span>${i+1}</span></button>`).join('')}</div>`:''}`;
 }
 async function mountInline(container=inlineContainer?.()){
  const host=container?.matches('[data-step-photos]')?container:container?.querySelector('[data-step-photos]'),current=context(),token={};
  if(!host)return;
  inlineViews.set(host,token);
  host.setAttribute('aria-busy','true');host.innerHTML='<p role="status">公式写真を読み込み中です。</p>';
  try{
   const list=await load(current.flowId,current.step.chapter,current.step.officialId);
   if(inlineViews.get(host)!==token||!host.isConnected)return;
   Object.assign(token,{host,photos:list,index:0,plain:false,zoom:false});
   host.innerHTML=list.length?photoMarkup(list,0):'<p class="manual-empty">この手順には公式写真がありません。</p>';
  }catch{
   if(inlineViews.get(host)!==token||!host.isConnected)return;
   host.innerHTML='<div class="manual-load-error" role="status"><p>公式写真の一覧を読み込めませんでした。説明と注意事項はこの画面で確認できます。</p><button type="button" data-inline-manual-retry>もう一度読み込む</button></div>';
  }
  host.setAttribute('aria-busy','false');translateDOM(host);
 }
 function inlineClick(event){
  const button=event.target.closest('button'),host=button?.closest('[data-step-photos]'),v=inlineViews.get(host);if(!button||!host)return;
  if(button.hasAttribute('data-inline-manual-retry')){mountInline(host);return;}
  if(!v?.photos?.length)return;
  if(button.hasAttribute('data-manual-zoom')){
   if(!dialog.contains(host)){open(v.index,v.plain,true);return;}
   v.zoom=!v.zoom;host.innerHTML=photoMarkup(v.photos,v.index,v.plain,v.zoom);translateDOM(host);host.querySelector('figcaption [data-manual-zoom]')?.focus({preventScroll:true});return;
  }
  if(button.hasAttribute('data-manual-next')&&v.index<v.photos.length-1)v.index++;
  else if(button.hasAttribute('data-manual-previous')&&v.index>0)v.index--;
  else if(button.hasAttribute('data-manual-photo-index'))v.index=Number(button.dataset.manualPhotoIndex);
  else if(button.hasAttribute('data-manual-plain')){v.plain=!v.plain;v.host.innerHTML=photoMarkup(v.photos,v.index,v.plain,v.zoom);translateDOM(v.host);v.host.querySelector('[data-manual-plain]')?.focus({preventScroll:true});return;}
  else if(button.hasAttribute('data-manual-photo-retry')){v.host.innerHTML=photoMarkup(v.photos,v.index,v.plain,v.zoom);translateDOM(v.host);return;}
  else return;
  v.plain=false;v.zoom=false;v.host.innerHTML=photoMarkup(v.photos,v.index);translateDOM(v.host);v.host.querySelector('.manual-thumbnails [aria-pressed="true"]')?.focus({preventScroll:true});
 }
 function photoError(event,root){
  const img=event.target;if(!img.matches?.('[data-manual-photo]'))return;
  if(img.src!==img.dataset.original){img.src=img.dataset.original;return;}
  img.hidden=true;root.querySelector('.manual-photo-error').hidden=false;
 }
 inlineContainer?.()?.addEventListener('click',inlineClick);
 dialog.addEventListener('click',inlineClick);
 const inlineError=event=>{const host=event.target.closest?.('[data-step-photos]');if(inlineViews.has(host))photoError(event,host);};
 inlineContainer?.()?.addEventListener('error',inlineError,true);
 dialog.addEventListener('error',inlineError,true);
 async function open(selected=0,unmarked=isOpen()&&plain,enlarged=isOpen()&&zoom,reference,selectedPhoto,photoFirst=false){
  if(!isOpen())opener=document.activeElement;
  const token=++serial;active=reference||context();photos=[];index=selected;plain=unmarked;zoom=enlarged;requestedPhoto=selectedPhoto;photosFirst=photoFirst;if(active.returnFocus?.isConnected)opener=active.returnFocus;pause();
  const {step:s,flow:f}=active,returnLabel=active.returnLabel||'3Dに戻る';
  modal(`<section class="manual-reference"><header class="manual-reference-header"><span class="eyebrow">手順と公式写真</span><h2 class="modal-title">${s.chapter+1}.${s.officialStep}　${esc(s.title)}</h2><div class="manual-source-meta"><span>Prusa Research · <span>マニュアル ${esc(f.revision)}</span></span>${languageControl()}</div>${photosFirst?'':stepReading(s)}</header><div data-manual-gallery aria-busy="true"><p role="status">公式写真を読み込み中です。</p></div>${photosFirst?`<div class="manual-reference-header">${stepReading(s)}</div>`:''}<div class="manual-attribution"><span>出典：Prusa Research</span><a href="${esc(s.source||f.manual)}" target="_blank" rel="noopener">公式ページ・コメント ${icon('arrow-up-right')}</a></div><footer class="manual-reference-footer"><button type="button" class="primary-button" data-close-modal>${esc(returnLabel)} ${icon('arrow-right')}</button></footer></section>`);
  dialog.classList.add('manual-dialog');dialog.scrollTop=0;
  try{
   const result=await load(active.flowId,s.chapter,s.officialId);
   if(token!==serial||!isOpen())return;
   photos=result;index=Math.max(0,Math.min(selected,photos.length-1));
   if(requestedPhoto){const selection=selectReferencePhoto(photos,requestedPhoto,index);index=selection.index;plain=selection.plain;requestedPhoto=undefined;}
   gallery().setAttribute('aria-busy','false');
   if(photos.length)renderPhoto(zoom);
   else{gallery().innerHTML='<p class="manual-empty">この手順には公式写真がありません。</p>';translate();}
  }catch{
   if(token!==serial||!isOpen())return;
   gallery().setAttribute('aria-busy','false');gallery().innerHTML='<div class="manual-load-error" role="status"><p>公式写真の一覧を読み込めませんでした。説明と注意事項はこの画面で確認できます。</p><button type="button" data-manual-retry>もう一度読み込む</button></div>';translate();
  }
 }
 dialog.addEventListener('click',event=>{
  if(!isOpen())return;const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-manual-retry')){open(index,plain,zoom,active,requestedPhoto,photosFirst);return;}
  if(button.hasAttribute('data-manual-photo-retry')){renderPhoto();return;}
  if(button.hasAttribute('data-manual-zoom')){zoom=!zoom;renderPhoto();content.querySelector('.manual-figure figcaption [data-manual-zoom]')?.focus({preventScroll:true});return;}
  if(button.hasAttribute('data-manual-next')&&index<photos.length-1)index++;
  else if(button.hasAttribute('data-manual-previous')&&index>0)index--;
  else if(button.hasAttribute('data-manual-photo-index'))index=Number(button.dataset.manualPhotoIndex);
  else if(button.hasAttribute('data-manual-plain')){plain=!plain;renderPhoto();content.querySelector('[data-manual-plain]')?.focus({preventScroll:true});return;}
  else return;
  plain=false;zoom=false;renderPhoto();content.querySelector('.manual-thumbnails [aria-pressed="true"]')?.focus({preventScroll:true});
 });
 dialog.addEventListener('error',event=>{
  if(isOpen())photoError(event,content);
 },true);
 dialog.addEventListener('close',()=>{if(dialog.open)return;const returning=!!active;serial++;dialog.classList.remove('manual-dialog');active=undefined;if(returning){const target=opener?.isConnected?opener:[...document.querySelectorAll('[data-official-reference]')].find(b=>b.getClientRects().length);target?.focus({preventScroll:true});}opener=undefined;});
 return {open,openPhotos(photoID){return open(0,false,false,undefined,photoID,true);},openReference(reference,photo){return open(0,false,true,reference,photo);},reopen(){return open(index,plain,zoom,active,requestedPhoto,photosFirst);},isOpen,mountInline,get index(){return index;}};
}
