import * as T from 'three';

// Visible finishes cross-checked against the matching 1.02 kit guide photos.
// CAD export defaults (neutral grey) are not the manufactured part finish.
export const FINISHES={
 powder:{color:'#272928',roughness:.73,metalness:.24},polymer:{color:'#292b2a',roughness:.8,metalness:.03},
 steel:{color:'#bbc0c2',roughness:.32,metalness:.78},blackSteel:{color:'#424544',roughness:.5,metalness:.62},
 orange:{color:'#fd5000',roughness:.67,metalness:.2},rubber:{color:'#202221',roughness:.94,metalness:0},
 brass:{color:'#b59a55',roughness:.36,metalness:.72},sheet:{color:'#464b43',roughness:.8,metalness:.2}
};
const plastic=new Set([74,76,77,82,91,236,243,275,309,312,368,374,375,376,378,385,386,396,400,401,402,403,404,405,558,559,560,565,568,574,575,576,577,595,597,636,637,639,640,781,783,780,786,796,797,798,799,816,829,857,858,859,860,861,886]);
const coated=new Set([6,19,22,25,28,31,34,38,42,47,51,52,66,71,81,168,170,206,237,239,240,249,308,373,379,406,590,614,634,638,663,893,894]);
export function finishCAD(material,{key,name,ids}){
 const id=ids.at(-1),sheetInk=key==='sheet'&&material.color.r>.5;let finish;
 // CAD801 has separate steel (mat_4) and blue nylon (mat_5) primitives.
 // Keep the source insert colour instead of applying the DIN-name steel finish.
 if(id===801&&/^DIN\s*985\b/i.test(name)&&material.name==='mat_5'){material.roughness=FINISHES.polymer.roughness;material.metalness=FINISHES.polymer.metalness;return 'source-nylon';}
 if(id===10||id===14)finish='orange';
 else if(id===795||id===807||id===794||[607,609,611,613].includes(id))finish='blackSteel';
 else if(id===614)finish='polymer';
 else if(plastic.has(id))finish='polymer';
 else if(coated.has(id))finish='powder';
 else if(/lisovac|faston|sloupek m3|distanční|washer|spacer|podlozka|smooth.rod|linear.rail|pulley|ložisk|lozisk|magnet|din |iso |screw|šroub|9\d{4}[a-z]\d/i.test(name))finish=/alloy steel|steel 8.8 plain/i.test(name)?'blackSteel':'steel';
 else if(plastic.has(id)||['handleLeft','handleRight','spoolOld','sensorOld','coverOld'].includes(key))finish='polymer';
 else if(coated.has(id)||['base','frame','back','sideLeft','sideRight','electronics','covers','filter'].includes(key))finish='powder';
 else if(ids.includes(70)||ids.includes(72))finish='polymer';
 else if(key==='feet')finish='rubber';
 else if(key==='heatbed')finish='powder';
 else if(key==='sheet')finish='sheet';
 else if(id===667)finish='brass';
 else if(id===669){material.color.set('#e6e7df');material.roughness=.58;material.metalness=0;return 'diffuser';}
 else if(key==='psu')finish='steel';
 // Preserve the source's explicitly coloured wires, seals and connectors.
 if(finish){const f=FINISHES[finish];material.color.set(f.color);material.roughness=f.roughness;material.metalness=f.metalness;}
 if(sheetInk)material.color.set('#d3d0b9');
 if(key==='grille'){material.color.set('#3c4140');material.opacity=.72;material.transparent=true;material.depthWrite=true;material.roughness=.22;material.metalness=0;return 'acrylic';}
 return finish||'source';
}

export function finishMotor(mesh,name){
 if(!name.includes('NEMA17'))return;
 mesh.updateMatrix();
 const g=mesh.geometry.clone(),p=g.attributes.position,colors=new Float32Array(p.count*3),v=new T.Vector3(),black=new T.Color('#292b2a'),steel=new T.Color('#bbc0c2');
 const zMotor=name.includes('TR-320');
 for(let i=0;i<p.count;i++){
  v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrix).multiplyScalar(1000);
  const dark=zMotor?v.z>-34&&v.z<-8:v.z>371.3&&v.z<395.3;
  (dark?black:steel).toArray(colors,i*3);
 }
 g.setAttribute('color',new T.BufferAttribute(colors,3));mesh.geometry=g;
 for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material]){m.color.set('#ffffff');m.vertexColors=true;m.roughness=.43;m.metalness=.55;m.userData.originalColor=m.color.clone();}
 mesh.userData.finish='motor';
}

export function createDisplayPanel(cover){
 // The rear edge of the source cover's screen opening is 72.5 x 47.6 mm,
 // x=33.8..106.3, y=11.05..58.65, z=12.4 in the cover's local frame.
 // A small overlap behind that edge closes the otherwise empty CAD aperture.
 cover.updateMatrix();const g=new T.BoxGeometry(.0765,.0516,.001);g.translate(.07005,.03485,.012);g.applyMatrix4(cover.matrix);
 const m=new T.Mesh(g,new T.MeshBasicMaterial({color:'#111a1b',toneMapped:false}));
 m.userData={part:'lcdScreen',cadName:'xLCD screen — unpowered illustration',illustration:true};return m;
}
