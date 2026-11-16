import * as T from 'three';

// Printed ink stays in the native CAD leaf's frame. It follows every bench,
// removal and exploded pose without becoming a separate assembly component.
function outlineGeometry(d,height){
 const tokens=d.match(/[MLCZ]|-?\d+(?:\.\d+)?/g),path=new T.ShapePath();
 let i=0;
 const number=()=>Number(tokens[i++]),point=()=>[number(),height-number()];
 while(i<tokens.length){
  const op=tokens[i++];
  if(op==='M')path.moveTo(...point());
  else if(op==='L')path.lineTo(...point());
  else if(op==='C')path.bezierCurveTo(...point(),...point(),...point());
  else if(op==='Z')path.currentPath.closePath();
  else throw Error('Unsupported marking outline');
 }
 return new T.ShapeGeometry(path.toShapes(),12);
}

export async function installPartMarkings(meshes){
 const response=await fetch('./assets/markings/core-one.json?v=20261106-104');
 if(!response.ok)throw Error('Product markings could not be loaded');
 const artwork=await response.json(),parent=meshes.find(m=>m.userData.cadIndex===816);
 if(!parent)throw Error('Missing PG front cover for product marking');
 parent.updateMatrix();
 const inverse=parent.matrix.clone().invert(),ink=[];
 const [, ,width,height]=artwork.viewBox,scale=25/width;
 const left=9.05642-12.5,bottom=392.7-height*scale/2;
 // The restored cover's flat front is Y=-77.54526 mm. Negative Y is outward.
 // Placement follows the official photograph; artwork proportions are exact.
 for(const outline of artwork.paths){
  const geometry=outlineGeometry(outline.d,height);
  geometry.scale(scale*.001,scale*.001,.001);
  geometry.rotateX(Math.PI/2);
  geometry.translate(left*.001,(-77.54526-.012)*.001,bottom*.001);
  geometry.applyMatrix4(inverse);
  // Draw the black ONE over its white printed field without coplanar depth
  // writes. The underlying CAD still occludes every ink layer normally.
  const material=new T.MeshBasicMaterial({color:outline.fill,toneMapped:false,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const mesh=new T.Mesh(geometry,material);
  mesh.name='CORE ONE '+outline.word;
  mesh.renderOrder=outline.word==='ONE'?2:1;
  mesh.userData={surfaceMarking:true,part:parent.userData.part,marking:outline.word};
  mesh.castShadow=false;mesh.receiveShadow=false;parent.add(mesh);ink.push(mesh);
 }
 const door=meshes.find(m=>m.userData.cadIndex===572);
 if(!door)throw Error('Missing front door for product markings');
 const doorResponse=await fetch('./assets/markings/door.json?v=20261107-125');
 if(!doorResponse.ok)throw Error('Door markings could not be loaded');
 const doorArtwork=await doorResponse.json(),doorInk=[];
 door.updateMatrix();
 const doorInverse=door.matrix.clone().invert();
 for(const group of doorArtwork.groups){
  const [, ,width,height]=group.viewBox,scale=group.lengthMM/width;
  for(const outline of group.paths){
   const geometry=outlineGeometry(outline.d,height);
   geometry.scale(scale*.001,scale*.001,.001);
   geometry.translate(0,-height*scale*.0005,0);
   geometry.rotateZ(Math.PI/2);geometry.rotateX(Math.PI/2);
   // Printed on the outside of the glass; CORE reads upward beside the hinge.
   geometry.translate(-.142,-.210012,group.bottomMM*.001);
   geometry.applyMatrix4(doorInverse);
   const material=new T.MeshBasicMaterial({color:outline.fill,toneMapped:false,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
   const mesh=new T.Mesh(geometry,material);
   mesh.name=group.id+' '+outline.word;
   mesh.renderOrder=outline.word==='ONE'?2:1;
   mesh.userData={surfaceMarking:true,part:door.userData.part,marking:outline.word,plusOnly:!!group.plusOnly};
   mesh.castShadow=false;mesh.receiveShadow=false;door.add(mesh);doorInk.push(mesh);
  }
 }
 return[{parent,ink,source:artwork.source},{parent:door,ink:doorInk,source:doorArtwork.source,glassPrint:true}];
}

export function syncPartMarkings(markings=[],state){
 const plus=state?.edition!=='original2251'&&state?.comparison!=='before'&&(state?.flow!=='upgrade'||state.index>=37);
 for(const {parent,ink,glassPrint}of markings){
  const materials=Array.isArray(parent.material)?parent.material:[parent.material],opacity=Math.min(...materials.map(m=>m.opacity));
  const relative=Math.min(...materials.map(m=>m.opacity/(m.userData.originalOpacity??1)));
  for(const mesh of ink){
   mesh.visible=(glassPrint?relative>=.95:opacity>=.3)&&(!mesh.userData.plusOnly||plus);
   mesh.material.opacity=glassPrint?1:opacity;
   mesh.material.transparent=glassPrint||opacity<1;
  }
 }
}
