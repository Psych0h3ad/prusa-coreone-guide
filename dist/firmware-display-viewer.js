// SPDX-License-Identifier: GPL-3.0-only
// Enlarges the existing native bitmap; it does not repaint firmware text.
export function createFirmwareDisplayViewer(copy){
 let dialog,viewport,surface,output,zoom=1,kind,resize;
 const setZoom=value=>{
  zoom=Math.max(.1,Math.min(4,value));
  const width=kind==='canvas'?480:Math.max(1,Math.min(viewport.clientWidth-2,surface.naturalWidth?(viewport.clientHeight-2)*surface.naturalWidth/surface.naturalHeight:Infinity));
  surface.style.width=width*zoom+'px';surface.style.height=kind==='canvas'?320*zoom+'px':'auto';output.textContent=Math.round(zoom*100)+'%';
 };
 function close(){if(dialog?.open)dialog.close();}
 function open({canvas,url,title,caption}){
  if(canvas?.getAttribute('aria-busy')==='true')return;
  close();
  if(!dialog){dialog=document.createElement('dialog');dialog.className='display-enlargement';document.body.append(dialog);
   dialog.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(button?.hasAttribute('data-display-enlargement-close'))close();
    if(button?.hasAttribute('data-display-zoom-in'))setZoom(zoom*1.5);
    if(button?.hasAttribute('data-display-zoom-out'))setZoom(zoom/1.5);
    if(button?.hasAttribute('data-display-zoom-fit'))setZoom(kind==='canvas'?Math.min(1,(viewport.clientWidth-2)/480,(viewport.clientHeight-2)/320):1);
    if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}
   });
   dialog.addEventListener('close',()=>{if(resize)window.removeEventListener('resize',resize);resize=null;});
  }
  dialog.innerHTML='<header><strong></strong><button type="button" data-display-enlargement-close></button></header><div class="display-enlargement-tools"><button type="button" data-display-zoom-out>−</button><output aria-live="polite"></output><button type="button" data-display-zoom-in>+</button><button type="button" data-display-zoom-fit></button></div><p class="display-enlargement-help"></p><div class="display-enlargement-viewport" tabindex="0" role="region"></div><p class="display-enlargement-caption"></p>';
  dialog.querySelector('strong').textContent=title;
  const button=dialog.querySelector('[data-display-enlargement-close]');button.textContent=copy('close');
  dialog.querySelector('[data-display-zoom-in]').setAttribute('aria-label',copy('zoomIn'));
  dialog.querySelector('[data-display-zoom-out]').setAttribute('aria-label',copy('zoomOut'));
  dialog.querySelector('[data-display-zoom-fit]').textContent=copy('fit');
  dialog.querySelector('.display-enlargement-help').textContent=copy('pan');
  dialog.querySelector('.display-enlargement-caption').textContent=caption||'';
  viewport=dialog.querySelector('.display-enlargement-viewport');viewport.setAttribute('aria-label',title);
  output=dialog.querySelector('output');kind=canvas?'canvas':'photo';
  if(canvas){surface=document.createElement('canvas');surface.width=canvas.width;surface.height=canvas.height;surface.getContext('2d').drawImage(canvas,0,0);surface.setAttribute('role','img');surface.setAttribute('aria-label',canvas.getAttribute('aria-label')||title);}
  else{surface=document.createElement('img');surface.src=url;surface.alt=title;surface.decoding='async';const image=surface;surface.onload=()=>{if(surface===image&&dialog.open)setZoom(zoom);};surface.onerror=()=>{if(surface!==image||!dialog.open)return;const message=document.createElement('p');message.textContent=copy('failed');viewport.replaceChildren(message);};}
  viewport.append(surface);dialog.showModal();setZoom(canvas?2:1);viewport.scrollLeft=viewport.scrollTop=0;
  resize=()=>setZoom(zoom);window.addEventListener('resize',resize);button.focus({preventScroll:true});
 }
 return{open,close,dispose(){close();dialog?.remove();dialog=null;}};
}
