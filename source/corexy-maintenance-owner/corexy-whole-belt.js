// SPDX-License-Identifier: MIT
// Whole open 2GT stock: anchored tail -> complete CoreXY circuit -> anchored tail.
// Official stock: about1524mm, width6mm, pitch2mm. Native smooth-idler hub R6mm.
import*as T from'three';
export const GT2_PROFILE={pitch:2,width:6,total:1.38,tooth:.75,backing:.63,pitchLineDifferential:.254};
const TAU=Math.PI*2,V=(x,y,z)=>new T.Vector3(x,y,z),radius=(sign,tooth,rootD)=>6+(sign===tooth?.75+rootD:.63-rootD);
export function gt2NativeRim(mesh,M,centre,z){const g=mesh.geometry,P=g.attributes.position,I=g.index,pts=Array.from({length:P.count},(_,i)=>new T.Vector3().fromBufferAttribute(P,i).applyMatrix4(M).multiplyScalar(1000));let radius=0;for(let j=0;j<(I?.count||P.count);j+=3){const t=[0,1,2].map(k=>pts[I?I.getX(j+k):j+k]);for(const[a,b]of[[0,1],[1,2],[2,0]])if((t[a].z-z)*(t[b].z-z)<0){const p=t[a].clone().lerp(t[b],(z-t[a].z)/(t[b].z-t[a].z));radius=Math.max(radius,Math.hypot(p.x-centre[0],p.y-centre[1]));}}if(!(radius>4&&radius<5))throw Error('Native16T tooth-band datum missing');return radius;}

class Arc extends T.Curve{constructor(c,r,a,b){super();Object.assign(this,{c,r,a,b});}getPoint(t){const a=this.a+(this.b-this.a)*t;return V(this.c.x+this.r*Math.cos(a),this.c.y+this.r*Math.sin(a),this.c.z);}getLength(){return this.r*Math.abs(this.b-this.a);}getPointAt(t){return this.getPoint(t);}}
class Route extends T.CurvePath{getPointAt(t){return this.getPoint(t);}}
class WaveLine extends T.Curve{constructor(a,b,amplitude){super();Object.assign(this,{a,b,amplitude});this.arcLengthDivisions=256;}getPoint(t){return this.a.clone().lerp(this.b,t).add(V(0,this.amplitude*Math.sin(Math.PI*t)**2,0));}}
const line=(p,a,b)=>p.add(new T.LineCurve3(a,b));
function neck(left,join,head,z,mainY,tailMM,floorY=-37.595253,endTail=false){
 const q=(x,y)=>V(x+head.x,y+head.y,z),sgn=left?1:-1,bar=left?{l:-3.344447,r:-1.344447}:{l:1.855554,r:3.855554},rear=-36.895253,front=-38.895253,rin=mainY-rear,entry=left?bar.r+rin:bar.l-rin,exit=left?bar.l-rin:bar.r+rin,c=q(left?bar.r:bar.l,rear),angle=Math.atan2(join.y-c.y,join.x-c.x),radial=join.clone().sub(c).normalize(),E=V(-sgn*radial.y,sgn*radial.x,0),slope=E.y/E.x,W=V(-sgn,0,0),endAngle=((Math.atan2(W.y,W.x)-sgn*Math.PI/2)%TAU+TAU)%TAU,mouth=floorY;
 const build=rt=>{const p=new Route();p.add(new Arc(c,rin,angle,left?0:Math.PI));line(p,q(entry,rear),q(entry,front));p.add(new Arc(q(left?bar.r:bar.l,front),rin,left?0:Math.PI,left?-Math.PI/2:Math.PI*1.5));line(p,q(left?bar.r:bar.l,front-rin),q(left?bar.l:bar.r,front-rin));p.add(new Arc(q(left?bar.l:bar.r,front),rin,-Math.PI/2,left?-Math.PI:0));
  // Main runs retain their actual common pulley tangents. The paid ends
  // lie along the actual flat outer-slot floor, with whole facing teeth.
  const endRadial=V(Math.cos(endAngle),Math.sin(endAngle),0),tailEnd=q(exit-sgn*rt+endRadial.x*rt,floorY+(.63-head.rootD)),cy=tailEnd.y-head.y-endRadial.y*rt,centre=q(exit-sgn*rt,cy),turn=new class extends T.Curve{constructor(){super();this.arcLengthDivisions=256;}getPoint(t){const angle=(left?0:Math.PI)+(endAngle-(left?0:Math.PI))*t;return centre.clone().add(V(rt*Math.cos(angle),rt*Math.sin(angle)-.1*(65536/729)*t**6*(1-t)**2,0));}};let ta=0,tb=1;for(let i=0;i<32;i++){const t=(ta+tb)/2;if(turn.getPoint(t).y-head.y<mouth)ta=t;else tb=t;}const rest=new class extends T.Curve{getPoint(t){return turn.getPoint((ta+tb)/2+(1-(ta+tb)/2)*t);}},remainingArc=rest.getLength(),straight=tailMM-remainingArc;

  if(straight<=0)throw Error('Source spare shorter than slot exit');line(p,q(exit,front),q(exit,cy));p.add(turn);line(p,tailEnd,tailEnd.clone().addScaledVector(W,straight));p.spareStraight=straight;p.tailStartX=tailEnd.x;p.clampC=straight+p.getLength()+tailEnd.clone().sub(join).dot(E);p.tailRadius=rt;return p;
 };
 // The first free return matches the facing tooth trains. The opposite cut
 // has the mirrored material phase; its1.25mm turn with a0.10mm downward
 // free bend fits the real outer opening. Both paid tails remain8mm.
 // This is an authored supported fold, not a material-force prediction.
 let lo=.8,hi=2.5;for(let i=0;i<36;i++){const m=(lo+hi)/2;if(build(m).clampC<30)lo=m;else hi=m;}return build(endTail?1.25:(lo+hi)/2);
}

function circuit(upper,head,front,tail,adjust,pluck=0,tailR=1.12,slack=0,floorY=-37.595253){
 const z=upper?356.100419:345.900419,tooth=upper?1:-1,slotZ=z,headR=front-(-36.895253),HL=V(-1.344447+head.x,-36.895253+head.y,slotZ),HR=V(1.855554+head.x,-36.895253+head.y,slotZ),r=s=>radius(s,tooth,head.rootD),dy=head.y;
 const c=upper?[
  {p:HL,r:headR,s:1},{p:V(-168.49865,-42.87494+dy,z),r:r(1),s:1},{p:V(-181.99865,-159.2+(adjust.left||0),z),r:r(-1),s:-1},{p:V(-181.99865,167.3,z),r:r(-1),s:-1},{p:V(-179.99865,141.3,z),r:16/Math.PI,s:1},{p:V(-158.99865,167.3,z),r:r(-1),s:-1},{p:V(182.00135,167.3,z),r:r(-1),s:-1},{p:V(182.00135,-29.37494+dy,z),r:r(-1),s:-1},{p:HR,r:headR,s:1}
 ]:[
  {p:HR,r:headR,s:-1},{p:V(168.50135,-42.87494+dy,z),r:r(-1),s:-1},{p:V(182.00135,-159.2+(adjust.right||0),z),r:r(1),s:1},{p:V(182.00135,167.3,z),r:r(1),s:1},{p:V(180.00135,141.3,z),r:16/Math.PI,s:-1},{p:V(159.00135,167.3,z),r:r(1),s:1},{p:V(-181.99865,167.3,z),r:r(1),s:1},{p:V(-181.99865,-29.37494+dy,z),r:r(1),s:1},{p:HL,r:headR,s:-1}
 ];
 const tangents=[];for(let i=0;i<c.length-1;i++){const a=c[i],b=c[i+1],D=b.p.clone().sub(a.p),d=Math.hypot(D.x,D.y),angle=Math.atan2(D.y,D.x)-Math.asin((b.s*b.r-a.s*a.r)/d),e=V(Math.cos(angle),Math.sin(angle),0),na=V(a.s*e.y,-a.s*e.x,0),nb=V(b.s*e.y,-b.s*e.x,0);tangents.push({a:a.p.clone().addScaledVector(na,a.r),b:b.p.clone().addScaledVector(nb,b.r),na,nb});}
 const middle=new Route();for(let i=0;i<tangents.length;i++){if(slack&&i===5)middle.add(new WaveLine(tangents[i].a,tangents[i].b,-slack));else if(pluck&&(upper?i===0:i===tangents.length-1))middle.add(new WaveLine(tangents[i].a,tangents[i].b,pluck));else line(middle,tangents[i].a,tangents[i].b);if(i<c.length-2){const k=i+1,a=Math.atan2(tangents[i].nb.y,tangents[i].nb.x),b=Math.atan2(tangents[k].na.y,tangents[k].na.x),delta=((c[k].s*(b-a))%TAU+TAU)%TAU;middle.add(new Arc(c[k].p,c[k].r,a,a+c[k].s*delta));}}
 const start=neck(upper,tangents[0].a,head,z,front,tail,floorY),end=neck(!upper,tangents.at(-1).b,head,z,front,tail,floorY,true),parts=[start,middle,end];return{parts,length:start.getLength()+middle.getLength()+end.getLength(),circles:c,tooth};
}
export class WholeCoreBelt extends T.Curve{
 constructor(upper,datum={}){super();this.upper=upper;this.rootD=datum.rootD??.254;this.rearEntryR=datum.rearEntryR??2.264;this.mainY=datum.mainY??-35.8;this.floorY=datum.floorY??-37.595253;this.stockMM=1524;this.tailMM=8;this.arcLengthDivisions=4096;}
 configure(head,adjust={},pluck=0){
  this.mainY??=-35.8;this.tailBend??=1.4516649909201083;this.tailMM=8;head={...head,rearEntryR:this.rearEntryR,rootD:this.rootD};const side=this.upper?'left':'right';
  if(this.drawMM===undefined){let lo=-1,hi=8;for(let i=0;i<40;i++){const m=(lo+hi)/2,c=circuit(this.upper,{x:0,y:0,rearEntryR:this.rearEntryR,rootD:this.rootD},this.mainY,8,{[side]:-m},0,this.tailBend,0,this.floorY);if(c.length<1524)lo=m;else hi=m;}this.drawMM=hi;}
  const offsets={...adjust,[side]:(adjust[side]||0)-this.drawMM};this.front=this.mainY;this.route=circuit(this.upper,head,this.mainY,this.tailMM,offsets,pluck,this.tailBend,0,this.floorY);this.slackBowMM=0;if(this.route.length<this.stockMM){let lo=0,hi=30;for(let i=0;i<36;i++){const mid=(lo+hi)/2,c=circuit(this.upper,head,this.mainY,this.tailMM,offsets,pluck,this.tailBend,mid,this.floorY);if(c.length<this.stockMM)lo=mid;else hi=mid;}this.slackBowMM=(lo+hi)/2;this.route=circuit(this.upper,head,this.mainY,this.tailMM,offsets,pluck,this.tailBend,this.slackBowMM,this.floorY);}this.measuredMM=this.route.length;this.lengths=this.route.parts.map(p=>p.getLength());this.phaseMM=.25;
  const middle=this.route.parts[1],arc=middle.curves[7],ratio=middle.getLength()/(this.stockMM-this.lengths[0]-this.lengths[2]),sDrive=this.lengths[0]+middle.curves.slice(0,7).reduce((s,c)=>s+c.getLength(),0)/ratio,sign=this.upper?1:-1,period=Math.PI/8;
  if(this.driveTooth===undefined){const tipBase=((.75-this.phaseMM)%2+2)%2;this.driveTooth=Math.ceil((sDrive-tipBase)/2)*2+tipBase;this.driveTurns=Math.floor((arc.a+sign*(this.driveTooth-sDrive)*ratio/arc.r)/period);}
  this.driveAngle=arc.a+sign*(this.driveTooth-sDrive)*ratio/arc.r-this.driveTurns*period;

  this.clampC=[this.route.parts[0].clampC,this.route.parts[2].clampC];
 }
 getLength(){return this.measuredMM;}
 getPoint(t){let d=Math.max(0,Math.min(1,t))*this.measuredMM;for(let i=0;i<3;i++){if(d<=this.lengths[i]||i===2){const u=T.MathUtils.clamp(d/this.lengths[i],0,1);return this.route.parts[i].getPointAt(i===0?1-u:u);}d-=this.lengths[i];}}
 getPointAt(t){return this.getPoint(t);}
 getMaterialPointAt(t){const s=Math.max(0,Math.min(1,t))*this.stockMM,a=this.lengths[0],b=this.lengths[2];if(s<=a)return this.route.parts[0].getPointAt(1-s/a);if(s>=this.stockMM-b)return this.route.parts[2].getPointAt((s-this.stockMM+b)/b);return this.route.parts[1].getPointAt((s-a)/(this.stockMM-a-b));}
}
