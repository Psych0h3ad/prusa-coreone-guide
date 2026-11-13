import*as T from'three';
const nodes=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],weights=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189],ease=x=>x*x*x*(10+x*(-15+6*x)),clamp=x=>T.MathUtils.clamp(x,0,1);
const bump=(s,a,b)=>{const u=(s-a)/(b-a);return u<=0||u>=1?0:64*u**3*(1-u)**3;},dbump=(s,a,b)=>{const u=(s-a)/(b-a);return u<=0||u>=1?0:192*u*u*(1-u)**2*(1-2*u)/(b-a);};
function integral(derivative,a,b){let sum=0;for(let k=0;k<5;k++)sum+=weights[k]*derivative(a+(nodes[k]+1)*(b-a)/2).length()*(b-a)/2;return sum;}
function integrate(derivative,a,b,step=.25){const n=Math.ceil((b-a)/step);let total=0;for(let i=0;i<n;i++)total+=integral(derivative,T.MathUtils.lerp(a,b,i/n),T.MathUtils.lerp(a,b,(i+1)/n));return total;}
// The physical path is distinct from Mc's513 retained material stations.
// Native ports/tangents/gauge remain fixed. Extra length from the transverse
// leg displacement is taken from an adjacent existing bight, not added stock.
export function createEntryFeRelief({fe,amplitudeMM=3,leg=[145,200],bight=[85,140]}={}){
 if(fe.stockMM!==365||fe.radiusMM!==1.1||fe.materialStationsMM.length!==513)throw Error('Expected agreed actual365/r1.1 FE event');
 const source=fe.physicalPath,stock=fe.stockMM,direction=new T.Vector3(-1,0,0),gradient=new T.Vector3();
 const n=220;for(let i=0;i<n;i++)for(let k=0;k<5;k++){const s=bight[0]+(i+(nodes[k]+1)/2)*(bight[1]-bight[0])/n;gradient.addScaledVector(source.getTangentAt(s/stock),dbump(s,...bight)*weights[k]*(bight[1]-bight[0])/(2*n));}
 const shortening=gradient.negate().normalize();if(shortening.length()<.9)throw Error('Adjacent bight has no shortening direction');
 return{at(progress){if(!Number.isFinite(progress)||progress<0||progress>1)throw Error('Entry progress0..1');const weight=ease(clamp((progress-.75)/.1))*ease(clamp((1-progress)/.05));if(!weight)return fe.baseline;
  const amplitude=amplitudeMM*weight,point=(s,comp,out=new T.Vector3())=>out.copy(source.getPointAt(s/stock)).addScaledVector(direction,amplitude*bump(s,...leg)).addScaledVector(shortening,comp*bump(s,...bight)),derivative=(s,comp,out=new T.Vector3())=>out.copy(source.getTangentAt(s/stock)).addScaledVector(direction,amplitude*dbump(s,...leg)).addScaledVector(shortening,comp*dbump(s,...bight));
  const legLength=integrate(s=>derivative(s,0),...leg),targetBight=bight[1]-bight[0]-(legLength-(leg[1]-leg[0])),evaluate=c=>integrate(s=>derivative(s,c),...bight),before=evaluate(0);let sign=before>targetBight?1:-1,lo=0,hi=.125;
  for(let i=0;i<16&&sign*(evaluate(hi*sign)-targetBight)>0;i++)hi*=1.5;
  if((before-targetBight)*(evaluate(hi*sign)-targetBight)>0)throw Error('Same-stock FE bight not bracketed');
  for(let i=0;i<42;i++){const mid=(lo+hi)/2;if((before-targetBight)*(evaluate(mid*sign)-targetBight)>0)lo=mid;else hi=mid;}const comp=(lo+hi)/2*sign,changes=legLength-(leg[1]-leg[0])+evaluate(comp)-(bight[1]-bight[0]);
  const knots=[0,...bight,...leg,stock].sort((a,b)=>a-b),parameters=[0],arc=[0];for(let i=1;i<knots.length;i++){const a=knots[i-1],b=knots[i],active=(a>=bight[0]&&b<=bight[1])||(a>=leg[0]&&b<=leg[1]),parts=active?Math.ceil((b-a)/.25):1;for(let j=0;j<parts;j++){const start=T.MathUtils.lerp(a,b,j/parts),end=T.MathUtils.lerp(a,b,(j+1)/parts);parameters.push(end);arc.push(arc.at(-1)+(active?integral(s=>derivative(s,comp),start,end):end-start));}}
  function parameter(distance){if(distance<=1e-9)return 0;if(distance>=stock-1e-9)return stock;let lo=0,hi=arc.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(arc[m]<distance)lo=m;else hi=m;}const start=parameters[lo],wanted=distance-arc[lo];const end=parameters[hi],active=(start>=bight[0]&&end<=bight[1])||(start>=leg[0]&&end<=leg[1]);if(!active)return start+wanted;let a=start,b=end;for(let j=0;j<40;j++){const m=(a+b)/2;if(integral(s=>derivative(s,comp),start,m)<wanted)a=m;else b=m;}return(a+b)/2;}
  const path=new T.Curve();path.getPoint=(t,out)=>point(t*stock,comp,out);path.getTangent=(t,out=new T.Vector3())=>derivative(t*stock,comp,out).normalize();path.getPointAt=(t,out)=>point(parameter(t*stock),comp,out);path.getTangentAt=(t,out=new T.Vector3())=>derivative(parameter(t*stock),comp,out).normalize();path.getLength=()=>stock+changes;
  return fe.makeResultForPhysicalPath(path,{phase:'entry-only coordinated FE leg relief',entryProgress:progress,reliefMM:amplitude,reliefRootDirection:direction.toArray(),legSupportPhysicalMM:leg.slice(),bightSupportPhysicalMM:bight.slice(),bightDisplacementMM:comp,bightDirection:shortening.toArray(),extraLegLengthMM:legLength-(leg[1]-leg[0]),sameStockErrorMM:changes,arcTableErrorMM:arc.at(-1)-stock,conditional365AllocationNotOEMWholeCut:true});
 }};
}
