import {MAIN_CABLE_ENTRY}from './main-cable-entry.js?v=20261111-94';
import {MOTOR_Y_REFERENCE_POINTS} from './motor-y-lead-data.js';
// Supplemental flexible geometry. Anchors are in the original CAD frame (mm).
// Strip length, bending radii and cable sag illustrate the matching manual photo.
import {HOTEND_ROUTES} from './hotend-routing.js?v=20261111-94';
import {SENSOR_RETENTION_FRAME} from './sensor-retention-frame.js';
export const TIES=[];
const tie=(id,name,p,u,v,span,options={})=>TIES.push({id,name,p,u,v,span,depth:3.5,rise:7,loose:24,...options});
for(const [side,x]of [['L',-180.8],['R',180.8]])for(const [i,y]of [-117.1,2.9,122.9].entries())tie(`base${side}${i+1}`,`底板 ${side==='L'?'左':'右'}側 ${i+1}`,[x,y,-2],[side==='L'?-1:1,0,0],[0,0,-1],5,{roundedLoop:true,apexHead:true,...(side==='L'?{rise:12.5,seatSetback:2}:{})});
// Numbered from the top of the enclosure, as in manual 3.11. Skip 3 and 6.
for(const [i,y,z]of [[1,181.8,207.65],[2,181.8,172.65],[4,181.8,102.65],[5,174.8,67.65]])tie(`box${i}`,`xBuddyボックス 位置${i}`,[-140.85,y,z],[-1,0,0],[0,1,0],9.35,{depth:i===5?2:4,rise:13,loose:22,route:'slot'});
tie('thermistor','チャンバーサーミスター',[-.5,178.3,353.7],[1,0,0],[0,-1,0],4,{depth:3,rise:5,loose:16});
for(const [i,x,y]of [[1,-105.41,-117.71],[2,-107.41,-39.76],[3,-107.41,45.19]])tie(`rgb${i}`,`RGB LEDケーブル ${i}`,[x,y,66.94],[-1,0,0],[0,0,1],3,{depth:3.5,rise:4.8,loose:16,headSetback:1.5});
tie('bed','ヒートベッドのスリーブ',[103,157.9,255.6],[1,0,0],[0,1,0],5,{depth:2,rise:13,headSetback:3});
tie('motorY','Yモーターのケーブル',[196.63738748021,182.30000011309218,342.0004212155016],[Math.SQRT1_2,Math.SQRT1_2,0],[-Math.SQRT1_2,Math.SQRT1_2,0],4,{depth:4,rise:1.7,loose:17,headSetback:1.5,headHeight:1.8,route:'arch',tailDirection:[-Math.SQRT1_2,Math.SQRT1_2,0]});
tie('motorX','Xモーターのケーブル',[-192.635,186.3,341.9],[.7071067812,-.7071067812,0],[.7071067812,.7071067812,0],4.7,{depth:4.7,rise:5,loose:17,route:'arch',tailDirection:[0,0,1]});
for(const [i,y]of [-141.65,-16.65,108.35].entries())tie(`xy${i+1}`,`CoreXYプレート ${i+1}`,[-193,y,334],[-1,0,0],[0,0,-1],4,{rise:7,loose:22,tailDirection:[0,0,-1]});
tie('doorWire','ドアセンサーのケーブル',[-186,-191.2,347.65],[0,1,0],[-1,0,0],3,{depth:2.9,rise:5,loose:16,route:'arch',openRise:5,approach:[0,0,1],tailDirection:[0,0,1]});
for(const [i,x]of [128,58,-12].entries())tie(`arm${i+1}`,`スイングアーム ${i+1}`,[x,156.3,463.95],[0,0,1],[0,-1,0],8,{depth:3.5,rise:i?8.5:8,loose:27,strap:true,width:10,thickness:.65,...(i?{flareRight:3}:{})});
for(const [i,p]of [[1,[-45,156,467.5]],[2,[-125,96,467.5]]])tie(`free${i}`,`メインケーブル・PTFE ${i}`,p,[0,0,1],[0,-1,0],12,{free:true,freeDepth:6,rise:1.5,loose:24,strap:true,width:10,thickness:.65,approach:[0,0,1],alignCable:'mainSleeve'});
tie('sensor','側面センサーのケーブル',SENSOR_RETENTION_FRAME.p,SENSOR_RETENTION_FRAME.u,SENSOR_RETENTION_FRAME.v,SENSOR_RETENTION_FRAME.span,{depth:SENSOR_RETENTION_FRAME.depth,rise:SENSOR_RETENTION_FRAME.rise,loose:SENSOR_RETENTION_FRAME.loose});
for(const [i,x]of [15,60].entries())tie(`bundle${i+1}`,`背面のケーブル束 ${i+1}`,[x,169,285],[0,0,1],[0,1,0],10.5,{free:true,rise:9,loose:22,tailDirection:[1,0,0],tailBend:2,approachLead:1});
export const CABLES=[
 {id:'baseMotor',name:'Zモーター・Stepper Splitter ケーブル',radius:2,color:'#343735',points:[[175,160,-6],[40,160,-6],[-171,160,-6],[-181.3,122.9,-5.2],[-181.3,2.9,-5.2],[-181.3,-117.1,-5.2],[-184,-150,-6]]},
 {id:'lcdWire',name:'xLCDケーブル',radius:1.6,color:'#7c8b9d',points:[[-120,170,15],[-120,170,10],[-120,170,4],[-120,170,-6],[-120,170,-8],[-170,170,-8],[-180.6,127.9,-9],[-180.6,122.9,-9],[-180.6,117.9,-9],[-180.6,7.9,-9],[-180.6,2.9,-9],[-180.6,-2.1,-9],[-180.6,-112.1,-9],[-180.6,-117.1,-9],[-180.6,-122.1,-9],[-170,-140,-8],[-130,-140,-8],[-90,-140,-8],[-50,-140,-8],[-10,-140,-8],[25,-140,-8],[25,-150,-8],[25,-175,-27],[25,-200,-27],[25,-215,-27],[25,-265,-27]]},
 {id:'earthR',name:'右側の保護接地線',radius:1.2,color:'#769336',points:[[113,177.7,15],[113,177.7,10],[113,177.7,4],[113,177.7,-4],[113,177.7,-6],[113,170,-6],[138,160,-6],[175,160,-6],[180.8,122.9,-6],[180.8,2.9,-6],[180.8,-117.1,-6],[170,-140,-6],[130,-140,-6],[90,-140,-6],[50,-140,-6],[10,-140,-6],[-30,-140,-6],[-49,-140,-6],[-49,-150,-8],[-49,-175,-25.8],[-49,-185,-25.8],[-49,-195,-25.8],[-49,-205,-25.8],[-49,-215,-25.8],[-49,-265,-25.8]]},
 {id:'earthL',name:'左側の保護接地線',radius:1.1,color:'#343735',points:[[-148,170,12],[-125,170,10],[-125,170,4],[-125,170,-4],[-125,170,-7],[-170,170,-7],[-183.75,122.9,-8],[-183.75,2.9,-8],[-183.75,-117.1,-8],[-184,-150,-7]]},
 {id:'boxLower',name:'xBuddyボックス下側の配線',radius:2.5,color:'#454e56',points:[[-145,176,17],[-137.5,180.8,67.65],[-137.5,187.8,102.65],[-137.5,187.8,172.65],[-137.5,187.8,207.65],[-137.5,187.8,217],[-121,180,223]]},
 {id:'thermistorWire',name:'チャンバーサーミスターのリード線',radius:1,color:'#d45837',points:[[-0.5,176,369],[-0.5,175,353.7],[-0.5,175,350],[-0.3096797755822661,174.90806485150574,347.8540064578226],[0.25396699817937307,174.63579242222173,345.790482243984],[1.16927969186601,174.19364598891323,343.8887274367844],[2.40108335197254,173.59861699105375,342.22182540694797],[3.9020404546445198,172.87357205933486,340.853834264672],[5.614470060172707,172.04637426387268,339.83732514237585],[7.472564459158239,171.1488123520489,339.21136191556445],[9.404918125879444,170.21537912477646,339],[18.409389149406216,165.86572378366415,339],[32.597163860289214,159.01224733974533,339]]},
 {id:'rgbWire',name:'RGB LEDケーブル',radius:1.3,color:'#343735',points:[[-115,-148,69.5],[-105.41,-117.71,69.5],[-107.41,-39.76,69.5],[-107.41,45.19,69.5],[-113,89,69.5]]},
 {id:'bedWire',name:'ヒートベッドケーブル・スリーブ',radius:4,color:'#454743',points:[[103,157,271],[103,165,255.6],[103,169,231],[88,175,200],[15,180,125],[-100,180,80],[-144,175,68]]},
 {id:'motorYWire',name:'Yモーターケーブル',radius:1.3,color:'#596b84',points:MOTOR_Y_REFERENCE_POINTS},
 {id:'motorXWire',name:'Xモーターケーブル',radius:1.7,color:'#596b84',points:[[-192.635,186.3,364],[-192.635,186.3,350],[-192.635,186.3,341.9],[-193,185,330],[-193,108.35,330]]},
 {id:'doorWireLead',name:'ドアセンサーリード線',radius:1,color:'#292c2b',points:[[-185,-191,363],[-188,-191.2,356],[-188,-191.2,347.65],[-191,-191,340],[-193,-185,330],[-193,-141.65,330]]},
 {id:'xyWires',name:'白色LED・ドアセンサーケーブル',radius:2,color:'#4a4c48',points:[[-193,-167,330],[-193,-141.65,330],[-193,-16.65,330],[-193,108.35,330],[-185,166,330]]},
 {id:'mainSleeve',name:'Nextruderメインケーブル',radius:4.2,color:'#454743',points:[[145,154,442],[140,150,463.95],[128,150,463.95],[118,150,463.95],[58,150,463.95],[-2,150,463.95],[-12,150,463.95],[-22,150,463.95],[-45,156,464],[-125,96,464],[-100,8,448],[-60,-15,440],[-30,-38,446],[-9,-36,445.9],[-1,-32.8,445.1],MAIN_CABLE_ENTRY[0]]},
 {id:'ptfeTube',name:'PTFEチューブ',radius:2,color:'#e5e7dd',points:[[58,150,470.5],[-2,150,470.5],[-12,150,470.5],[-22,150,470.5],[-45,156,471],[-125,96,471],[-100,8,456],[9,-50,435]]},
 {id:'mainRear',name:'xBuddyへのメインケーブル',radius:4,color:'#454743',points:[[145,154,442],[133,169,390],[78,172,300],[60,172,288.5],[15,172,288.5],[-125,179,280],[-144,187.8,207.65],[-144,187.8,172.65],[-144,187.8,102.65],[-144,187.8,92],[-110,182,82]]},
 {id:'sensorWire',name:'側面フィラメントセンサーケーブル',radius:1.5,color:'#494e52',points:[[208,157,301],[208,170.09,316.145],[211,177,316],[180,178,294],[120,174,282.5],[60,172,282.5],[15,172,282.5],[-80,172,282.5],[-144,180,211],[-125,180,210]]}
];
for(const d of CABLES)if(['baseMotor','lcdWire','earthR','earthL'].includes(d.id))d.samples=256;
// Staged routing illustrations with controlled slack for official manual 6.50.
for(const [id,d] of Object.entries(HOTEND_ROUTES))CABLES.push({id,...d});
export const TIE_STATES={open:1,loose:2,snug:3,tight:4,trimmed:5,wrapped:6,trimmedSnug:7};
