// Camera metadata only; actor membership, physical transforms and clocks are retained.
export function withAssemblyTeachingCameras(bank){
 const build={...bank.build};
 const patch=(id,edit)=>{if(build[id])build[id]=edit(build[id]);};
 patch(983461,p=>({...p,teachingCamera:'rear-z-screws',actors:p.actors.map((a,i)=>i? a:{...a,focusMotion:true})}));
 patch(991072,p=>({...p,camera:'back',teachingCamera:'y-pulley-flat',actors:p.actors.map((a,i)=>i? a:{...a,focusMotion:true,camera:'back'})}));
 patch(993751,p=>({...p,teachingCamera:'idler-nut',actors:p.actors.map((a,i)=>i===0?{...a,anchors:[[-9.638515085554573,-62.894565788845625,421.8977619691205]],guideAtAnchor:true,guideRadius:1.7,guideTube:.14,guideArrowLength:1.8,calloutAvoidBounds:[-31.60740170093086,-65.09537874595564,407.6390881984206,-6.7441515690381415,-49.195378818281235,443.0977620483161]}:i===1?{...a,anchors:[[-12.3941536,-66.63537792477564,414.147763]],guideAtAnchor:true,guideRadius:2.1,guideTube:.12,guideArrowLength:1}:i===2?{...a,focusMotion:true,camera:'back-perspective'}:a)}));
 patch(986459,p=>({...p,teachingCamera:'fe-front-exit'}));
 // Each band has its own source head and lower sheet-metal opening. Keep the
 // mechanical family/clock intact; do not fit the entire170mm bundle envelope.
 patch(996711,p=>({...p,actors:p.actors.map((a,i)=>i<2?a:{...a,focusBounds:[(i===2?15:60)-18,150,232,(i===2?15:60)+18,192,293],focusPadding:3,focusMinDistance:80})}));
 return {...bank,build};
}
