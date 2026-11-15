const guideId=value=>{if(typeof value!=='string')return null;try{const u=new URL(value);return u.origin==='https://help.prusa3d.com'&&u.pathname.includes('/guide/')?Number(u.pathname.match(/_(\d+)\/?$/)?.[1])||null:null;}catch{return null;}};
const byStep=new Map();
for(const g of OFFICIAL_GUIDE_INDEX)g.stepIds.forEach((id,i)=>{const row={guideId:g.id,instructionStep:i+1,webStep:i+1+g.webStartEntries,language:g.language};if(!byStep.has(id))byStep.set(id,[]);byStep.get(id).push(row);});
export function officialStepNumbers(id,source,primary){
 if(!Number.isInteger(id))return null;
 const rows=byStep.get(id);if(!rows)return null;
 for(const url of[source,primary]){const gid=guideId(url);if(gid!==null){const row=rows.find(r=>r.guideId===gid);return row?{...row}:null;}}
 return rows.length===1?{...rows[0]}:null;
}
export function officialReferenceNumbers(official,primary){
 if(!official)return null;
 let url;try{url=new URL(official.source||official.url||primary);}catch{return null;}
 if(url.pathname.toLowerCase().endsWith('.pdf')){
  const page=Number(url.hash.match(/^#page=(\d+)$/i)?.[1]);url.hash='';const pdf=OFFICIAL_PDF_INDEX.find(p=>p.url===url.href),row=pdf?.pages.find(r=>r.page===page);
  return row?.steps.includes(official.number)?{format:'pdf',guideId:pdf.guideId,instructionStep:official.number,pdfPage:page,language:pdf.language}:null;
 }
 const row=officialStepNumbers(official.id,official.source||official.url,primary);return row?{format:'web',...row}:null;
}
