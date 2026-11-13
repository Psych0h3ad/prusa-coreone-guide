import {PARTS} from './data.js?v=20261112-113';
PARTS.sideSensorInputCollet??={name:'右ハンドルのPTFEコレット',en:'Right handle PTFE collet',icon:'cable',offset:[0,0,0]};
PARTS.sideSensorTubeCollet??={name:'側面センサーのPTFEコレット',en:'Side sensor PTFE collet',icon:'cable',offset:[0,0,0]};
const zero={offset:[0,0,0],rotation:[0,0,0]};
export function withSidePtfeCollets(bank){
 const result={...bank};for(const flow of ['build','upgrade']){result[flow]={};for(const[id,p]of Object.entries(bank[flow])){
  const refs=r=>!r?r:[...r,...(r.includes(75)?['sideSensorInputCollet']:[]),...(r.includes('sensorBody')||r.includes('sensorOld')?['sideSensorTubeCollet']:[])].filter((x,i,a)=>a.indexOf(x)===i);
  let actors=p.actors.map(a=>({...a,refs:refs(a.refs)}));
  if(flow==='build'&&Number(id)===997376)actors=actors.map(a=>a.refs?.includes('sensorBody')?{...a,showBefore:true}:a);
  const handleStep=flow==='build'&&Number(id)===997348;
  if(handleStep&&!actors.some(a=>a.refs?.includes('sideSensorInputCollet')))actors.push({refs:['sideSensorInputCollet'],label:'コレットをハンドルの奥まで押し込む',axis:[.0150968,-.8039329,-.5945284],distance:9,showBefore:true});
  if(flow==='build'&&Number(id)===996619&&!actors.some(a=>a.refs?.length===1&&a.refs[0]==='sideSensorTubeCollet')){
   const body=actors.find(a=>a.scope==='sensor'),hold=body?.waypoints?.[0]||[0,0,0],axis=[-.013727,.8621354,.506492];
   actors=[...actors.filter(a=>a!==body),{refs:['sideSensorTubeCollet'],label:'コレットをセンサーへ押し込む',destination:'sensor',axis,waypoints:[hold.map((x,k)=>x+axis[k]*9),hold],showBefore:true},...(body?[body]:[])];
  }
  result[flow][id]={...p,actors,...(handleStep?{seed:[...new Set([...(p.seed||[]),75])],focus:[75,'sideSensorInputCollet']}:{}) ,...(p.workpiecePoses?{workpiecePoses:p.workpiecePoses.map(a=>({...a,refs:refs(a.refs)}))}:{})};
 }}return result;
}
