
import * as T from 'three';
import {SleeveCubic}from './sleeve-cubic.js?v=20261111-94';
import {CABLES}from '../fastener-data.js?v=20261111-94';
import {LoveBoardServiceCable,LOVEBOARD_CABLE_DEFINITIONS}from '../loveboard-service-cables.js?v=20261112-113';
import {ServiceFanCurve}from '../service-fan-frame.js?v=20261111-94';
const fit={"knots":[0.0,0.05,0.1,0.15000000000000002,0.2,0.25,0.30000000000000004,0.35000000000000003,0.4,0.45,0.5,0.55,0.6000000000000001,0.65,0.7000000000000001,0.75,0.8,0.8500000000000001,0.9,0.9500000000000001,1.0],"coefficients":[[[544.0462775858578,-1275.554014277651,-38.16262299565523],[-41.646008050062875,91.16811665922484,-16.08612221790132],[43.59863299786527,17.439453199146087,-4.359863299786589],[7.0,-29.6,444.3]],[[-423.5184782502131,1089.2352342811932,719.220791300458],[39.96093358781593,-100.16498548242282,-21.810515667249657],[43.51437927475292,16.989609757986187,-6.254695194044136],[9.143822414466339,-28.65955130017934,444.0370212015915]],[[-116.15979484016627,115.81403777923917,-974.7650905367511],[-23.56683814971688,63.220299659755995,86.07260302781913],[44.33408404665791,15.142375466852855,-3.041590826015667],[11.366503902392248,-27.92432887170094,443.7596627516337]],[[348.87212585428546,-887.1697457511946,-206.17620467917428],[-40.99080737574298,80.592405326642,-60.14216055269365],[41.10620177038496,22.333010716172755,-1.7450687022593903],[13.50977103499583,-26.994682594486502,443.70091908158537]],[[42.2226498378109,449.7124186725047,1329.1367751823534],[11.340011502399538,-52.48305653603724,-91.06859125456984],[39.6236619767178,23.738478155702996,-9.30560629262256],[15.506213120807507,-25.78744726358016,443.43753821950577]],[[-390.0135152036619,-18.673151234190723,-1228.4147218422625],[17.673408978070437,14.973806264838517,108.30192502278317],[41.07433300074133,21.863015642143058,-8.443939604211895],[17.52102407962912,-24.67551694480104,442.910728523636]],[[178.23820767956144,-78.34084732314753,-164.8606594786032],[-40.82861830247894,12.172833579709778,-75.96028325355624],[39.91657253452091,23.220347634370476,-6.826857515750554],[19.57017256271091,-23.547265790936063,442.6057345157521]],[[-116.47772572353578,-538.9088074328841,208.69939138443394],[-14.092887150544303,0.421706481237365,-100.68938217534652],[37.170497261869734,23.850074637417848,-15.659340787195699],[21.4862094196407,-22.365608931183658,442.05388334939585]],[[-151.75299367604686,319.30967209958123,-120.96896057965415],[-31.564546009074526,-80.41461463369559,-69.38447346768109],[34.88762560388878,19.85042922979496,-24.163033569347096],[23.294942349142385,-21.239414534038783,441.04528027852075]],[[-287.9567765392893,278.4785763628109,260.5204287399546],[-54.32749506048113,-32.518163818758595,-87.5298175546297],[30.593023550410983,14.203790307172257,-32.008748120462606],[24.94144314010463,-20.408015900120827,439.64854629631174]],[[1158.159524513139,41.67414125128481,579.4125062091372],[-97.52101154137497,9.253622635663197,-48.451753243637185],[23.0005982203182,13.04056324801748,-38.80782666037592],[26.299280982906566,-19.74431197226376,437.8618493999945]],[[-955.5508562336212,-590.9225210892889,-570.1906632774741],[76.20291713559602,15.50474382335589,38.460122687733325],[21.934693500029255,14.278481570968438,-39.30740818817112],[27.350278305633182,-19.063940485617316,435.8727552471428]],[[-171.38377932306855,220.75190180716845,77.48019113727786],[-67.12971129944742,-73.13363434003776,-47.068476803887684],[22.38835379183669,11.397037045134352,-39.73782589397884],[28.518076416444433,-18.385119862646665,433.93226131154387]],[[-59.037133872035845,40.472636949515035,114.19407719220636],[-92.83727819790758,-40.020849068962434,-35.44644813329509],[14.390004316968945,5.739312874684346,-43.863572140838016],[29.448246855372265,-17.970508108514146,431.83738384872737]],[[32.96247515544914,-109.5101748569608,213.75831322958504],[-101.69284827871293,-33.94995352653511,-18.317336554463733],[4.663497993137909,2.040772744909463,-46.55176137522598],[29.92827423399194,-17.778535507833645,429.56986338100126]],[[615.9498117015406,255.28350424364731,-46.43452043070502],[-96.74847700539556,-50.376479755079174,13.746410429974661],[-5.258568271067504,-2.175548919171247,-46.780307681450466],[29.911337322346483,-17.77506052626163,427.2232017600075]],[[-288.00550988251763,-56.56791218127484,46.67535744488865],[-4.356005250164431,-12.083954118532006,6.781232365369611],[-10.313792383845504,-5.298570612851811,-45.75392554168328],[29.48353144274231,-17.977868733577434,424.91274808695607]],[[404.6306419955581,170.1219962256073,-114.74365249371803],[-47.55683173254208,-20.56914094572314,13.782535982103514],[-12.909434232980836,-6.9312253660645755,-44.72573712430965],[28.92095112168931,-18.280078138539015,422.64783931046594]],[[-112.11879298368622,-40.81022139828427,28.415603342301612],[13.137764566791775,4.9491584881179795,-3.4290118919535897],[-14.630387591268358,-7.712224488944837,-44.208060919802186],[28.20716616095836,-18.65679700967835,420.431665837644]],[[36.73003044486204,11.114529542231141,-8.048268600123286],[-3.6800543807610047,-1.1723747216245977,0.8333286093919423],[-14.157502081966825,-7.52338530062017,-44.33784508393028],[27.49447634368896,-19.035136615580083,418.2162422123418]]]};
export class ArcParts extends T.Curve{
 constructor(parts){super();this.parts=parts;this.lengths=parts.map(p=>p.getLength());this.total=this.lengths.reduce((a,b)=>a+b,0);this.points=[];this.arcLengthDivisions=4096;}
 pick(t){let d=T.MathUtils.clamp(t,0,1)*this.total;for(let i=0;i<this.parts.length;i++){if(d<=this.lengths[i]||i===this.parts.length-1)return[this.parts[i],T.MathUtils.clamp(d/this.lengths[i],0,1)];d-=this.lengths[i];}}
 getPoint(t,out=new T.Vector3()){const[c,u]=this.pick(t);return c.getPointAt(u,out);}
 getPointAt(t,out){return this.getPoint(t,out);}
 getTangent(t,out=new T.Vector3()){const[c,u]=this.pick(t);return c.getTangentAt(u,out);}
 getTangentAt(t,out){return this.getTangent(t,out);}
 getLength(){return this.total;}
 updateArcLengths(){this.needsUpdate=true;}
}
export class Slice extends T.Curve{
 constructor(curve,start,end){super();this.curve=curve;this.start=start;this.end=end;this.arcLengthDivisions=4096;}
 getPoint(t,out=new T.Vector3()){return this.curve.getPointAt(T.MathUtils.lerp(this.start,this.end,t),out);}
 getTangent(t,out=new T.Vector3()){return this.curve.getTangentAt(T.MathUtils.lerp(this.start,this.end,t),out);}
}
class YZArc extends T.Curve{
 constructor(x,y,z,r,start,end){super();Object.assign(this,{x,y,z,r,start,end});}
 getPoint(t,out=new T.Vector3()){const a=T.MathUtils.lerp(this.start,this.end,t);return out.set(this.x,this.y+this.r*Math.cos(a),this.z+this.r*Math.sin(a));}
 getPointAt(t,out){return this.getPoint(t,out);}
 getTangent(t,out=new T.Vector3()){const a=T.MathUtils.lerp(this.start,this.end,t),sign=Math.sign(this.end-this.start);return out.set(0,-Math.sin(a)*sign,Math.cos(a)*sign);}
 getTangentAt(t,out){return this.getTangent(t,out);}
 getLength(){return this.r*Math.abs(this.end-this.start);}
}
export function mainLoomRest(){
 const definition={...LOVEBOARD_CABLE_DEFINITIONS.find(d=>d.id==='lbMainLead'),bundlePitch:.6};
 const lead=new LoveBoardServiceCable(definition);lead.update(1,1,1);
 const old=lead.curve,prefix=new SleeveCubic(fit),cut=.38,q=prefix.getPoint(1),end=old.getPointAt(cut),span=q.distanceTo(end);
 const tail=old.getPointAt(1);
 const back=new ServiceFanCurve([q,q.clone().addScaledVector(prefix.getTangent(1),4),
  new T.Vector3(18,-18,399),new T.Vector3(0,-18,384),new T.Vector3(-9.5,-18,379),new T.Vector3(-9.5,-18,377),new T.Vector3(-9.5,-18,375.5)]);
 back.arcLengthDivisions=4096;
 const first=new YZArc(-9.5,-26.5,375.5,8.5,0,-Math.PI/2),bottom=new T.CubicBezierCurve3(
  first.getPoint(1),new T.Vector3(-9.5,-32.333333,367),new T.Vector3(tail.x,-38.166667,367),new T.Vector3(tail.x,-44,367)),
  second=new YZArc(tail.x,-44,375.5,8.5,-Math.PI/2,-Math.PI),third=new YZArc(tail.x,-44,tail.z-8.5,8.5,-Math.PI,-3*Math.PI/2),
  stem=new T.LineCurve3(second.getPoint(1),third.getPoint(0)),last=new T.LineCurve3(third.getPoint(1),tail);
 bottom.arcLengthDivisions=4096;
 const splice=new ArcParts([back,first,bottom,second,stem,third,last]),route=new ArcParts([prefix,splice]);
 lead.curve=route;lead.lastKey=undefined;lead.update(1,1,1);packMainWires(lead,route);
 const def=CABLES.find(d=>d.id==='mainSleeve'),oldJacket=new T.CatmullRomCurve3(def.points.map(p=>new T.Vector3(...p)),false,'centripetal');oldJacket.arcLengthDivisions=4096;
 const jacket=new ArcParts([new Slice(oldJacket,1-70/oldJacket.getLength(),1),prefix]);
 return{lead,route,jacket,prefix,splice,source:old,cut,definition:def};
}

export function packedOffsets(pinOffsets,pitch=.6){
 const points=[];
 for(let q=-2;q<=2;q++)for(let r=-2;r<=2;r++)if(Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<=2)points.push(new T.Vector2(pitch*(q+r/2),pitch*Math.sqrt(3)/2*r));
 for(const[q,r]of[[3,-1],[-2,3],[-1,-2]])points.push(new T.Vector2(pitch*(q+r/2),pitch*Math.sqrt(3)/2*r));
 points.sort((a,b)=>a.x-b.x||a.y-b.y);const offsets=[];
 for(let col=0;col<2;col++){
  const slots=points.slice(col*11,col*11+11).sort((a,b)=>a.y-b.y||a.x-b.x);
  const pins=pinOffsets.map((p,i)=>({p,i})).filter(({p})=>col===0?p.x<0:p.x>0).sort((a,b)=>a.p.y-b.p.y);
  pins.forEach(({i},j)=>offsets[i]=slots[j]);
 }
 return offsets;
}

export function packMainWires(lead,curve,{twist=0}={}){
 const n=80,sides=6,per=(n+1)*(sides+1),centres=Array.from({length:n+1},(_,i)=>curve.getPointAt(i/n)),
  tangents=centres.map((_,i)=>curve.getTangentAt(i/n)),rows=[];rows[n]=lead.across.clone();
 for(let i=n-1;i>=0;i--){rows[i]=rows[i+1].clone().applyQuaternion(new T.Quaternion().setFromUnitVectors(tangents[i+1],tangents[i]));rows[i].addScaledVector(tangents[i],-rows[i].dot(tangents[i])).normalize();}
 const offsets=packedOffsets(lead.pinOffsets),pos=lead.geometry.attributes.position,norm=lead.geometry.attributes.normal;
 lead.packedStrands=[];
 for(let wire=0;wire<22;wire++){
  const strand=centres.map((c,i)=>{
   const blend=T.MathUtils.smoothstep(i/n,.88,1),o=offsets[wire].clone().lerp(lead.pinOffsets[wire],blend),
    row=rows[i].clone().applyAxisAngle(tangents[i],twist*(1-T.MathUtils.smoothstep(i/n,.8,1))),up=tangents[i].clone().cross(row);
   return c.clone().addScaledVector(row,o.x).addScaledVector(up,o.y);
  });
  lead.packedStrands.push(strand);
  for(let i=0;i<=n;i++){
   const tangent=i===n?tangents[n]:strand[Math.min(n,i+1)].clone().sub(strand[Math.max(0,i-1)]).normalize(),
    row=rows[i].clone().addScaledVector(tangent,-rows[i].dot(tangent)).normalize(),up=tangent.clone().cross(row);
   for(let j=0;j<=sides;j++){
    const angle=j/sides*Math.PI*2,k=wire*per+i*(sides+1)+j,normal=row.clone().multiplyScalar(Math.cos(angle)).addScaledVector(up,Math.sin(angle)),
     point=strand[i].clone().addScaledVector(normal,.26).multiplyScalar(.001);
    pos.setXYZ(k,point.x,point.y,point.z);norm.setXYZ(k,normal.x,normal.y,normal.z);
   }
  }
 }
 pos.needsUpdate=norm.needsUpdate=true;lead.geometry.computeBoundingBox();lead.geometry.computeBoundingSphere();
}
