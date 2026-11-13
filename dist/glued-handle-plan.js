// Three-free plan datums and descriptors. Runtime poses are dispatched by the Director.
export const GLUED_HANDLE_DATUM={"source120":"77f41cc6c720261956dfb98e9473cf049560561a","panelOuterY":-209.99998474121094,"panelInnerY":-206.99996948242188,"panelRightX":179.6034698486328,"contactY":-210.0,"contactSeparationMM":1.52587890625e-05,"bevelInterceptMax":-391.431884765625,"bevelXRange":[163.69354248046875,181.01766967773438],"startContact":[172.35560607910156,-219.07627868652344],"endContact":[179.4318389892578,-212.0000457763672],"finalOffsetMM":[0.0,1.0000457763671875,-0.050018310546875],"pressGapMM":0,"referenceRunoutMM":1.0,"initialRotationDegrees":-45,"pressAnchorsMM":[[173.7318878173828,-206.9999542236328,359.6402893066406],[173.7318878173828,-206.99996948242188,103.64028930664062]],"approachOffsetMM":[20,-8,0],"coordinatePivot":[0,0,0],"contactMethod":"The measured bevel sliding reference establishes alignment. Coupled rigid translation closes its runout during the counterclockwise turn, reaching actual adhesive contact at the installed datum. Press holds the rigid source geometry there; arrows mark the two adhesive positions. No physical permanent hinge.","topMethod":"Instance-only Z registration aligns the measured maximum top Z; source geometry remains unchanged","sourceBevelSupportSpreadMM":2.157918646616963e-05,"turnClosingCorrectionMM":[-0.171630859375,-1.0,0.0]};
const d=GLUED_HANDLE_DATUM;
const originalActors=new WeakMap();
export function withGluedInstalledPose(scene,state,gluedIndex){
 const beforeActors=originalActors.get(scene.plan.actors);
 if(state.comparison==='before'&&beforeActors)scene={...scene,plan:{...scene.plan,actors:beforeActors}};
 if(state.flow!=='build'||state.variant!=='glued'||state.comparison==='before'||(!scene.full&&state.index<gluedIndex))return scene;
 return{...scene,instanceOffsets:[...(scene.instanceOffsets||[]),{cadIndex:590,offset:d.finalOffsetMM}]};
}
export function withGluedHandleMotion(bank){
 const old=bank.build[999288],actor=old?.actors?.[0];
 if(old?.variant!=='glued'||old.actors.length!==1||actor.refs?.length!==1||actor.refs[0]!==590)throw Error('Unexpected glued handle operation');
 const phases=[['align','面取りと上端をそろえる',999302,[1,-.4,0]],['turn','押し当てながら反時計回りに回す',999310,[0,0,1]],['press','粘着帯の位置を押して固定する',999318,[0,1,0]]];
 const actors=phases.map(([phase,label,line,axis])=>({...actor,label,axis,gluedPhase:phase,officialLine:line,...(phase==='press'?{inspection:true,anchors:d.pressAnchorsMM,guideGhost:false,keepGuide:true,guideRadius:6,focusMotion:true,focusBounds:[145,-225,75,295,-195,390],focusPadding:12,focusMinDistance:90}:{} )}));
 originalActors.set(actors,old.actors);
 return{...bank,build:{...bank.build,999288:{...old,actors}}};
}
