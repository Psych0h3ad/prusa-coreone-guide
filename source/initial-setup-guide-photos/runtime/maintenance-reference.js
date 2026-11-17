// SPDX-License-Identifier: MIT
// Copyright (c) CORE One Community Guide contributors
// License text: licenses/maintenance-reference-MIT.txt
// Resolve the official reference for the displayed procedure stage.
import {officialReferenceNumbers} from './official-step-numbers.js';
const guideKey=value=>{
 if(typeof value!=='string'||!/^https?:\/\//.test(value))return null;
 try{const u=new URL(value),id=u.pathname.match(/_(\d+)\/?$/)?.[1];return u.origin+'/'+(id||u.pathname);}catch{return null;}
};
const withoutHash=value=>{const u=new URL(value);u.hash='';return u.href;};
export function resolveMaintenanceReference(task,index,language,sources){
 const step=task.steps[index],guide=sources[task.id],official=guide?.steps[index];
 let images=official?.images||step.sourcePhotos||[];
 // Physical-preparation photographs are also available in the ordinary guide.
 if(!images.length&&task.id==='initial-setup'&&[1,2,3].includes(step.officialStep))images=(step.screenPhotos||[]).map((photo,index)=>({...photo,guidePreparation:true,caption:step.title.map((title,language)=>`${title} · ${['公式写真','Official photo','Oficiální fotografie','Offizielles Foto'][language]} ${index+1}`)}));
 const numbering=officialReferenceNumbers(official,guide?.url);
 if(!official)return{url:step.source||task.source,official,images,numbering,english:false};
 const sourceKey=guideKey(official.source),primaryKey=guideKey(guide.url);
 if(sourceKey&&primaryKey&&sourceKey!==primaryKey){
  // A composed procedure can inline stages from another official guide.
  // Its parent guide's translation does not belong to those stages.
  const origin=Object.values(sources).find(source=>guideKey(source.url)===sourceKey);
  const translations=official.translations||origin?.translations;
  const translated=translations?.[language];
  const url=new URL(translated||official.source);url.hash=String(official.id);
  const english=language!=='en'&&(!translated||withoutHash(translated)===withoutHash(official.source));
  return{url:url.href,official,images,numbering,english};
 }
 // Preserve the existing single-guide and legacy-reference behavior.
 return{url:`${guide.translations[language]||guide.url}#${official.id}`,official,images,numbering,english:!guide.translations[language]};
}
