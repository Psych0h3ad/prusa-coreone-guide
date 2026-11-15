import {rebuildUsesSock,setRebuildSock}from'./hotend-rebuild-model.js';
export function renderHotendRebuildControls(viewer,task,text){
 let host=document.getElementById('hotend-rebuild-sock-choice');if(!task?.hotendRebuild){if(host){host.hidden=true;host.textContent='';}return;}
 if(!host){host=document.createElement('div');host.id='hotend-rebuild-sock-choice';document.querySelector('.service-reference').append(host);}
 host.hidden=false;host.textContent='';const label=document.createElement('label');label.className='firmware-action';label.textContent=text(['シリコンソック','Silicone sock','Silikonový návlek','Silikonsocke']);const input=document.createElement('select');input.style.fontSize='16px';input.style.minHeight='44px';input.setAttribute('aria-label',label.textContent);
 for(const[id,copy]of[['yes',['使用する','Fitted','Používá se','Vorhanden']],['no',['使用しない','Not fitted','Nepoužívá se','Nicht vorhanden']]]){const o=document.createElement('option');o.value=id;o.textContent=text(copy);o.selected=(id==='yes')===rebuildUsesSock();input.append(o);}
 input.onchange=()=>{if(viewer.disposed||!viewer.loaded||viewer.state?.flow!=='service')return;setRebuildSock(input.value==='yes');viewer.sceneSignature=undefined;viewer.setState({...viewer.state});};label.append(input);host.append(label);
}
