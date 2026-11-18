// SPDX-License-Identifier: MIT
// Whole open 2GT stock: anchored tail -> complete CoreXY circuit -> anchored tail.
// Official stock: about1524mm, width6mm, pitch2mm. Native smooth-idler hub R6mm.
import*as T from'three';
export const GT2_PROFILE={pitch:2,width:6,total:1.38,tooth:.75,backing:.63,pitchLineDifferential:.254};
const TAU=Math.PI*2,V=(x,y,z)=>new T.Vector3(x,y,z),radius=(sign,tooth)=>6+(sign===tooth?1.004:.376);
class Arc extends T.Curve{constructor(c,r,a,b){super();Object.assign(this,{c,r,a,b});}getPoint(t){const a=this.a+(this.b-this.a)*t;return V(this.c.x+this.r*Math.cos(a),this.c.y+this.r*Math.sin(a),this.c.z);}getLength(){return this.r*Math.abs(this.b-this.a);}getPointAt(t){return this.getPoint(t);}}
class Route extends T.CurvePath{getPointAt(t){return this.getPoint(t);}}
class WaveLine extends T.Curve{constructor(a,b,amplitude){super();Object.assign(this,{a,b,amplitude});this.arcLengthDivisions=256;}getPoint(t){return this.a.clone().lerp(this.b,t).add(V(0,this.amplitude*Math.sin(Math.PI*t)**2,0));}}
const line=(p,a,b)=>p.add(new T.LineCurve3(a,b));
function neck(left,join,head,z,mainY,tailMM,tailR=1.12){
 const slotZ=z,p=new Route(),q=(x,y)=>V(x+head.x,y+head.y,slotZ),sgn=left?1:-1,bar=left?{l:-3.344447,r:-1.344447}:{l:1.855554,r:3.855554},rear=-36.895253,front=-38.895253,rin=mainY-rear,entry=left?bar.r+rin:bar.l-rin,exit=left?bar.l-rin:bar.r+rin,tailY=mainY-1.38,rt=tailR;
 const c=q(left?bar.r:bar.l,rear),angle=Math.atan2(join.y-c.y,join.x-c.x);p.add(new Arc(c,rin,angle,left?0:Math.PI));line(p,q(entry,rear),q(entry,front));
 p.add(new Arc(q(left?bar.r:bar.l,front),rin,left?0:Math.PI,left?-Math.PI/2:Math.PI*1.5));line(p,q(left?bar.r:bar.l,front-rin),q(left?bar.l:bar.r,front-rin));p.add(new Arc(q(left?bar.l:bar.r,front),rin,-Math.PI/2,left?-Math.PI:0));
 const cy=tailY-rt;line(p,q(exit,front),q(exit,cy));p.add(new Arc(q(exit-sgn*rt,cy),rt,left?0:Math.PI,Math.PI/2));
 const mouth=-37.595253,remainingArc=rt*(Math.PI/2-Math.asin((mouth-cy)/rt)),straight=tailMM-remainingArc;if(straight<=0)throw Error('Source spare shorter than slot exit');line(p,q(exit-sgn*rt,tailY),q(exit-sgn*(rt+straight),tailY));p.spareStraight=straight;p.tailStartX=exit-sgn*rt+head.x;return p;
}
function circuit(upper,head,front,tail,adjust,pluck=0,tailR=1.12,slack=0){
 const z=upper?356.100419:345.900419,tooth=upper?1:-1,slotZ=z,headR=front-(-36.895253),HL=V(-1.344447+head.x,-36.895253+head.y,slotZ),HR=V(1.855554+head.x,-36.895253+head.y,slotZ),r=s=>radius(s,tooth),dy=head.y;
 const c=upper?[
  {p:HL,r:headR,s:1},{p:V(-168.49865,-42.87494+dy,z),r:r(1),s:1},{p:V(-181.99865,-159.2+(adjust.left||0),z),r:r(-1),s:-1},{p:V(-181.99865,167.3,z),r:r(-1),s:-1},{p:V(-179.99865,141.3,z),r:16/Math.PI,s:1},{p:V(-158.99865,167.3,z),r:r(-1),s:-1},{p:V(182.00135,167.3,z),r:r(-1),s:-1},{p:V(182.00135,-29.37494+dy,z),r:r(-1),s:-1},{p:HR,r:headR,s:1}
 ]:[
  {p:HR,r:headR,s:-1},{p:V(168.50135,-42.87494+dy,z),r:r(-1),s:-1},{p:V(182.00135,-159.2+(adjust.right||0),z),r:r(1),s:1},{p:V(182.00135,167.3,z),r:r(1),s:1},{p:V(180.00135,141.3,z),r:16/Math.PI,s:-1},{p:V(159.00135,167.3,z),r:r(1),s:1},{p:V(-181.99865,167.3,z),r:r(1),s:1},{p:V(-181.99865,-29.37494+dy,z),r:r(1),s:1},{p:HL,r:headR,s:-1}
 ];
 const tangents=[];for(let i=0;i<c.length-1;i++){const a=c[i],b=c[i+1],D=b.p.clone().sub(a.p),d=Math.hypot(D.x,D.y),angle=Math.atan2(D.y,D.x)-Math.asin((b.s*b.r-a.s*a.r)/d),e=V(Math.cos(angle),Math.sin(angle),0),na=V(a.s*e.y,-a.s*e.x,0),nb=V(b.s*e.y,-b.s*e.x,0);tangents.push({a:a.p.clone().addScaledVector(na,a.r),b:b.p.clone().addScaledVector(nb,b.r),na,nb});}
 const middle=new Route();for(let i=0;i<tangents.length;i++){if(slack&&i===5)middle.add(new WaveLine(tangents[i].a,tangents[i].b,-slack));else if(pluck&&(upper?i===0:i===tangents.length-1))middle.add(new WaveLine(tangents[i].a,tangents[i].b,pluck));else line(middle,tangents[i].a,tangents[i].b);if(i<c.length-2){const k=i+1,a=Math.atan2(tangents[i].nb.y,tangents[i].nb.x),b=Math.atan2(tangents[k].na.y,tangents[k].na.x),delta=((c[k].s*(b-a))%TAU+TAU)%TAU;middle.add(new Arc(c[k].p,c[k].r,a,a+c[k].s*delta));}}
 const start=neck(upper,tangents[0].a,head,z,front,tail,tailR),end=neck(!upper,tangents.at(-1).b,head,z,front,tail,tailR),parts=[start,middle,end];return{parts,length:start.getLength()+middle.getLength()+end.getLength(),circles:c,tooth};
}
export class WholeCoreBelt extends T.Curve{
 constructor(upper){super();this.upper=upper;this.stockMM=1524;this.tailMM=8;this.arcLengthDivisions=4096;}
 configure(head,adjust={},pluck=0){
  this.mainY??=-35.8;this.tailBend??=1.4516649909201083;this.tailMM=8;const side=this.upper?'left':'right';
  if(this.drawMM===undefined){let lo=0,hi=8;for(let i=0;i<40;i++){const m=(lo+hi)/2,c=circuit(this.upper,{x:0,y:0},this.mainY,8,{[side]:-m},0,this.tailBend);if(c.length<1524)lo=m;else hi=m;}this.drawMM=hi;}
  const offsets={...adjust,[side]:(adjust[side]||0)-this.drawMM};this.front=this.mainY;this.route=circuit(this.upper,head,this.mainY,this.tailMM,offsets,pluck,this.tailBend);this.slackBowMM=0;if(this.route.length<this.stockMM){let lo=0,hi=30;for(let i=0;i<36;i++){const mid=(lo+hi)/2,c=circuit(this.upper,head,this.mainY,this.tailMM,offsets,pluck,this.tailBend,mid);if(c.length<this.stockMM)lo=mid;else hi=mid;}this.slackBowMM=(lo+hi)/2;this.route=circuit(this.upper,head,this.mainY,this.tailMM,offsets,pluck,this.tailBend,this.slackBowMM);}this.measuredMM=this.route.length;this.lengths=this.route.parts.map(p=>p.getLength());this.phaseMM=.25;
  const start=this.route.parts[0],end=this.route.parts[2],p0=start.getPoint(0),p1=this.route.parts[1].curves[0].getPoint(1),last=this.route.parts[1].curves.at(-1),q0=end.getPoint(0),q1=last.getPoint(0),E=p1.clone().sub(p0).normalize(),F=q1.clone().sub(q0).normalize();this.clampC=[start.spareStraight+start.getLength()+Math.abs(p0.x-start.tailStartX)/Math.abs(E.x),end.spareStraight+end.getLength()+Math.abs(end.tailStartX-q0.x)/Math.abs(F.x)];
 }
 getLength(){return this.measuredMM;}
 getPoint(t){let d=Math.max(0,Math.min(1,t))*this.measuredMM;for(let i=0;i<3;i++){if(d<=this.lengths[i]||i===2){const u=T.MathUtils.clamp(d/this.lengths[i],0,1);return this.route.parts[i].getPointAt(i===0?1-u:u);}d-=this.lengths[i];}}
 getPointAt(t){return this.getPoint(t);}
 getMaterialPointAt(t){const s=Math.max(0,Math.min(1,t))*this.stockMM,a=this.lengths[0],b=this.lengths[2];if(s<=a)return this.route.parts[0].getPointAt(1-s/a);if(s>=this.stockMM-b)return this.route.parts[2].getPointAt((s-this.stockMM+b)/b);return this.route.parts[1].getPointAt((s-a)/(this.stockMM-a-b));}
}
