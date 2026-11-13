// Pure data transform. Apply once at the canonical app/director plan export.
const cache=new WeakMap();
export const IR_CHECK=1023249,COVER_INSTALL=1024964;
export function withUpgradeWorkingViews(source){
 if(source?.upgrade?.[COVER_INSTALL]?.upgradeWorkingView407==='cover-right'&&source?.upgrade?.[IR_CHECK]?.upgradeWorkingView407==='ir-connector')return source;
 if(cache.has(source))return cache.get(source);
 const ir=source?.upgrade?.[IR_CHECK],cover=source?.upgrade?.[COVER_INSTALL];
 if(ir?.actors?.length!==0||ir.workspace!=='sensor'||cover?.actors?.length!==4||cover.actors[1].refs?.[0]!==861||!cover.actors[1].remove||cover.actors[2].refs?.[0]!=='ventLever')throw Error('Different canonical upgrade plan');
 const result={...source,upgrade:{...source.upgrade,
  // The existing IR component was retained in this owner at2.8. This static
  // reference changes neither ownership nor the later2.17 insertion actor.
  [IR_CHECK]:{...ir,workspace:'sensor-reuse-ir',pose:'underside',focus:['sensorIR'],settledFocus:undefined,focusPadding:3,upgradeWorkingView407:'ir-connector'},
  [COVER_INSTALL]:{...cover,actors:cover.actors.map((a,i)=>i===1?{...a,showBefore:true}:a),focus:[861,870,872,'ventLever'],focusPadding:6,camera:'right',operationCamera:'right',undersideView:true,upgradeWorkingView407:'cover-right'}
 }};
 cache.set(source,result);return result;
}
