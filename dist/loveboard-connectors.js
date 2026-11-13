// Manufacturer identities from Prusa's LoveBoard revision38 schematic.
// These identify parts; the photo-registered board remains an illustration.
export const LOVEBOARD_SCHEMATIC='https://www.prusa3d.com/downloads/Electronics_drawings/FDM-MK4-LoveBoard-38.pdf';
export const CLIK_MATE_INSTRUCTIONS='https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/applicationspecificationspdf/502/502578/AS-502578-001-001.pdf?inline=';
const clik=(part,pins,rows=1)=>({manufacturer:'Molex',family:'CLIK-Mate',pitch:1.5,pins,rows,part,plugSeries:rows===2?'503149':'502578'});
export const LOVEBOARD_CONNECTORS={
 J1:clik('502584-0260',2),J12:clik('502584-0260',2),
 J5:clik('502584-0360',3),J6:clik('502584-0360',3),
 J4:clik('502585-0470',4),J14:clik('502585-0470',4),
 J2:clik('502585-0370',3),J13:clik('503154-2290',22,2),
 P1:{manufacturer:'Molex',family:'Micro-Fit 3.0',pitch:3,pins:2,rows:1,part:'43650-0212',plugSeries:'43645'}
};
const sockets={lbMotorLead:'J4',lbNtcLead:'J12',lbLoadcellLead:'J14',lbFilamentLead:'J2',lbMainLead:'J13',servicePrintLead:'J5',serviceHotendFanLead:'J6',hotendThermistor0:'J1',hotendThermistor1:'J1',hotendHeater0:'P1',hotendHeater1:'P1'};
export function connectorNotice(actor,finished=false,state){
 if(!actor?.flex?.length)return null;
 const id=actor.flex.find(id=>sockets[id]);if(!id)return null;
 const from=actor.fromStates?.[id]||0,to=actor.to??1;
 // Cable-channel routing is separate from unplugging at the receptacle.
 if((from!==1&&to!==1)||from>1||to>1)return null;
 const socket=sockets[id],c=LOVEBOARD_CONNECTORS[socket],unplug=from>to;
 return {socket,...c,unplug,
  title:`${socket} · Molex ${c.family} · ${c.pins}極`,
  body:unplug?(c.family==='CLIK-Mate'&&c.rows===1?(state?.connectorPhase==='unlock'?'中央の解除バーを指の腹で押し、ロックを外します。':'中央の解除バーを押してから、コネクター本体をまっすぐ抜きます。'):c.rows===2?'ロックを解除してから、まっすぐ抜きます。':'ラッチを押してロックを外し、まっすぐ抜きます。'):(finished||state?.connectorPhase==='lock'?'奥まで入り、ロックが掛かっていることを確認します。':'向きを合わせてまっすぐ差し込み、ロックを掛けます。'),
  url:c.family==='CLIK-Mate'&&c.rows===1?CLIK_MATE_INSTRUCTIONS:`https://www.molex.com/en-us/products/part-detail/${c.part.replace('-','')}`};
}
