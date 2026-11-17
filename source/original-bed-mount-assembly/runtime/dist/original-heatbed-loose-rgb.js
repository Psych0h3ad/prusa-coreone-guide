import*as T from'three';
import{CABLES}from'./fastener-data.js';
import{HEATBED_ASSEMBLY as D}from'./heatbed-assembly-data.js';
import{Joined,ArcCurve,cubic,V}from'./heatbed-material-curves.js';
// Original2251 4.14/842224: the existing RGB lead already follows all three
// carrier ties. 4.26 has not threaded it through the PCB/cable-cover channel.
// Keep the original carrier curve through the last real tie, full stock and existing
// signal-skin provider. Only the unconnected table tail is authored here.
export function originalHeatbedLooseRGB(nativeZMM){
 if(!Number.isFinite(nativeZMM))throw Error('Actual bed datum required');
 const stock=1223.1456626350944,source=CABLES.find(c=>c.id==='rgbWire');
 if(source.radius!==1.3||source.points.length!==5)throw Error('Original RGB source controls changed');
 const dz=nativeZMM-D.bedReferenceZMM,curve=new T.CatmullRomCurve3(source.points.map(p=>V(p).add(V([0,0,dz]))),false,'centripetal');curve.arcLengthDivisions=2048;
 // The fifth old control was a procedural tail, not a fourth physical tie.
 const fixed=new ArcCurve(t=>curve.getPoint(.75*t),1536),end=fixed.getPointAt(1),direction=V([0,1,0]),out=V([-89,80,69.5+dz]),join=cubic(end,fixed.getTangentAt(1),out,direction,12,12),prefix=new Joined([fixed,join]),remaining=stock-prefix.getLength();
 if(!(remaining>18))throw Error('Whole Original RGB stock exhausted');
 const tailStart=prefix.getPointAt(1),route=new Joined([prefix,new T.LineCurve3(tailStart,tailStart.clone().addScaledVector(direction,remaining))]);
 route.tip=route.getPointAt(1);route.tipTangent=direction;route.tipRoll=0;route.stockMM=stock;route.bightMM=0;
 route.materialBasis='Existing authored RGB neutral stock; source carrier controls plus unconnected table tail, not an OEM cutlength or bend-radius claim';return route;
}
