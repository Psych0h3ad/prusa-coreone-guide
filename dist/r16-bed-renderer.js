import {CLAMP_PACKET_LAYOUT} from './heatbed-clamp-packet.js';
import * as T from 'three';
import {stageBedPower} from './heatbed-power-routing.js';
import {BED_FRAME_TABLE as table} from './r16-frame-table.js';
import {BED_DATUM,AUTHORED_WIRE_STOCKS,createBedRouteFactory} from './r15-bed-route.js';
import {CLAMP_SECTIONS} from './r15-clamp-sections.js';
import {sampleDirectControls,RINGS,ROWS} from './r16-frame-controls.js';
const ids=Object.keys(BED_DATUM.roles),smooth=t=>(t=Math.max(0,Math.min(1,t)))*t*t*(10+t*(-15+6*t));
export function createBedRenderer(){
const routeFactory=createBedRouteFactory();
const C=new Float64Array(ROWS*3),Q=new Float64Array(ROWS*4),controls={C,Q};
function interpolate(z){
 const keys=table.keys;let a=0,b=keys.length-1;while(b-a>1){const m=(a+b)>>1;if(keys[m]<=z)a=m;else b=m;}const h=keys[b]-keys[a],t=(z-keys[a])/h,p=Math.max(0,a-1),n=Math.min(keys.length-1,b+1),h00=2*t*t*t-3*t*t+1,h10=t*t*t-2*t*t+t,h01=-2*t*t*t+3*t*t,h11=t*t*t-t*t,centres=table.centres,rot=table.rotations;
 const slope=(key,prev,next,channel)=>{const x=centres[key*ROWS*3+channel];if(prev===key)return(centres[next*ROWS*3+channel]-x)/(keys[next]-keys[key]);if(next===key)return(x-centres[prev*ROWS*3+channel])/(keys[key]-keys[prev]);const hp=keys[key]-keys[prev],hn=keys[next]-keys[key];return((x-centres[prev*ROWS*3+channel])/hp*hn+(centres[next*ROWS*3+channel]-x)/hn*hp)/(hp+hn);};
 for(let i=0;i<C.length;i++)C[i]=h00*centres[a*ROWS*3+i]+h10*h*slope(a,p,b,i)+h01*centres[b*ROWS*3+i]+h11*h*slope(b,a,n,i);
 for(let row=0;row<ROWS;row++){
  const k=row*4,ai=(a*ROWS+row)*4,bi=(b*ROWS+row)*4,pi=(p*ROWS+row)*4,ni=(n*ROWS+row)*4;
  const sign=index=>rot[ai]*rot[index]+rot[ai+1]*rot[index+1]+rot[ai+2]*rot[index+2]+rot[ai+3]*rot[index+3]<0?-1:1,sp=sign(pi),sb=sign(bi),sn=sign(ni);
  for(let j=0;j<4;j++){
   const va=rot[ai+j]/32767,vb=sb*rot[bi+j]/32767,vp=sp*rot[pi+j]/32767,vn=sn*rot[ni+j]/32767,hp=keys[a]-keys[p],hn=keys[n]-keys[b],ma=p===a?(vb-va)/h:((va-vp)/hp*h+(vb-va)/h*hp)/(hp+h),mb=n===b?(vb-va)/h:((vb-va)/h*hn+(vn-vb)/hn*h)/(h+hn);
   Q[k+j]=h00*va+h10*h*ma+h01*vb+h11*h*mb;
  }
  const inv=1/Math.hypot(Q[k],Q[k+1],Q[k+2],Q[k+3]);for(let j=0;j<4;j++)Q[k+j]*=inv;
 }

 return{lowKey:keys[a],highKey:keys[b],fraction:t};
}
function basis(row,out){const k=row*4,x=Q[k],y=Q[k+1],z=Q[k+2],w=Q[k+3];out[0]=1-2*(y*y+z*z);out[1]=2*(x*y+z*w);out[2]=2*(x*z-y*w);out[3]=2*(x*y-z*w);out[4]=1-2*(x*x+z*z);out[5]=2*(y*z+x*w);out[6]=2*(x*z+y*w);out[7]=2*(y*z-x*w);out[8]=1-2*(x*x+y*y);return out;}
class FrameCurve extends T.Curve{
 constructor(k,stock){super();this.k=k;this.stock=stock;this.r16=true;this.clampExitMaterialMM=table.clampExitMaterialMM;this.sourceField='authored fixed-stock material-frame rendering lookup';}
 getLength(){return this.stock;}
 getPointAt(t,out=new T.Vector3()){const x=Math.max(0,Math.min(1,t))*512,i=Math.min(511,Math.floor(x)),f=x-i,k=(this.k*RINGS+i)*3;return out.set(C[k]+f*(C[k+3]-C[k]),C[k+1]+f*(C[k+4]-C[k+1]),C[k+2]+f*(C[k+5]-C[k+2]));}
 getPoint(t,out){return this.getPointAt(t,out);}
 getTangentAt(t,out=new T.Vector3()){const i=Math.round(Math.max(0,Math.min(1,t))*512),b=basis(this.k*RINGS+i,scratch);return out.set(b[0],b[1],b[2]);}
 getTangent(t,out){return this.getTangentAt(t,out);}
}
const sleeve=new FrameCurve(0,520),wires=new Map(ids.map((id,i)=>[id,new FrameCurve(i+1,AUTHORED_WIRE_STOCKS[id])])),family={sleeve,wires,authoredStocks:AUTHORED_WIRE_STOCKS,renderApproximation:true,controls},scratch=new Float64Array(9);
function createBedFrameFamily({crimpZMM=205.2,bedPortAmount=1,bedPortAmounts={},boxRoutingAmount=1,powerChannelAmount=1}={}){
 const amounts=ids.map(id=>bedPortAmounts[id]??bedPortAmount);if(!Number.isFinite(crimpZMM)||amounts.some(a=>!Number.isFinite(a)||a<0||a>1))throw Error('Actual native bed/port inputs required');
 if(CLAMP_PACKET_LAYOUT==='legacy-two-wire'&&boxRoutingAmount===1&&amounts.every(a=>a===1)&&crimpZMM>=table.keys[0]&&crimpZMM<=table.keys.at(-1)){family.lookup=interpolate(crimpZMM);family.mode='native-Z-material-lookup';}
 else{const direct=stageBedPower(routeFactory.create({crimpZMM,bedPortAmount,bedPortAmounts,powerChannelAmount}),boxRoutingAmount);sampleDirectControls(direct,controls);family.routingTips=direct.routingTips??null;family.carrierPath=direct.carrierPath;family.lookup=null;family.mode='synchronous-direct-actual-port-state';}
 family.crimpZMM=crimpZMM;family.bedPortAmount=bedPortAmount;return family;
}
const trig=Object.fromEntries([16,32].map(n=>[n,Array.from({length:n+1},(_,j)=>[Math.cos(2*Math.PI*j/n),Math.sin(2*Math.PI*j/n)])]));
function geometry(g,sides,caps){
 g??=new T.BufferGeometry();const count=RINGS*(sides+1)+(caps?2:0);
 if(!g.attributes.position){g.setAttribute('position',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage));const ix=[];for(let i=1;i<RINGS;i++)for(let j=1;j<=sides;j++){const a=(sides+1)*(i-1)+(j-1),b=(sides+1)*i+j-1,c=(sides+1)*i+j,d=(sides+1)*(i-1)+j;ix.push(a,b,d,b,c,d);}if(caps)for(const end of[0,1]){const k=RINGS*(sides+1)+end,row=end?512:0;for(let j=0;j<sides;j++)if(end)ix.push(k,row*(sides+1)+j+1,row*(sides+1)+j);else ix.push(k,row*(sides+1)+j,row*(sides+1)+j+1);}g.setIndex(ix);}
 if(g.attributes.position.count!==count)throw Error('Bed renderer profile ABI mismatch');return g;
}
function finish(g){g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();return g;}
function bedSleeveGeometry(c,g){
 g=geometry(g,32,false);const p=g.attributes.position.array;
 for(let i=0;i<RINGS;i++){
  const ck=i*3,cx=C[ck],cy=C[ck+1],cz=C[ck+2],B=basis(i,scratch),x=Math.max(-104,Math.min(-94.5,cx)),k=Math.min(CLAMP_SECTIONS.length-2,Math.max(0,Math.floor((x+104)/.5))),a=CLAMP_SECTIONS[k],b=CLAMP_SECTIONS[k+1],u=Math.max(0,Math.min(1,(x-a.x)/(b.x-a.x))),py=a.centreYZ[0]+u*(b.centreYZ[0]-a.centreYZ[0]),pz=a.centreYZ[1]+u*(b.centreYZ[1]-a.centreYZ[1]),free=smooth((520*i/512-table.clampExitMaterialMM-2)/18);
  // Native clamp sections remain literal through the measured exit. Outside
  // the clamp, rotate that profile into the existing R16 material frame before
  // morphing to the free sleeve; mixing global YZ with a rotated circle chokes it.
  const rotate=smooth((520*i/512-table.clampExitMaterialMM)/4),matrix=new T.Matrix4().makeBasis(new T.Vector3(B[0],B[1],B[2]),new T.Vector3(B[3],B[4],B[5]),new T.Vector3(B[6],B[7],B[8])),orientation=new T.Quaternion().slerp(new T.Quaternion().setFromRotationMatrix(matrix),rotate),offset=new T.Vector3();
  for(let j=0;j<=32;j++){const idx=j%32,[co,si]=trig[32][j],yp=a.profileYZ[idx][0]+u*(b.profileYZ[idx][0]-a.profileYZ[idx][0])-py,zp=a.profileYZ[idx][1]+u*(b.profileYZ[idx][1]-a.profileYZ[idx][1])-pz,k=(i*33+j)*3;offset.set(0,(1-free)*yp-free*4*co,(1-free)*zp+free*4*si).applyQuaternion(orientation);p[k]=(cx+offset.x)*.001;p[k+1]=(cy+offset.y)*.001;p[k+2]=(cz+offset.z)*.001;}
 }
 g.computeVertexNormals();return finish(g);
}
function bedWireGeometry(c,g){
 g=geometry(g,16,true);const p=g.attributes.position.array,n=g.attributes.normal.array,base=c.k*RINGS;
 for(let i=0;i<RINGS;i++){
  const row=base+i,ck=row*3,B=basis(row,scratch);
  for(let j=0;j<=16;j++){const[co,si]=trig[16][j],nx=-co*B[3]+si*B[6],ny=-co*B[4]+si*B[7],nz=-co*B[5]+si*B[8],k=(i*17+j)*3;p[k]=(C[ck]+1.65*nx)*.001;p[k+1]=(C[ck+1]+1.65*ny)*.001;p[k+2]=(C[ck+2]+1.65*nz)*.001;n[k]=nx;n[k+1]=ny;n[k+2]=nz;}
 }
 for(const end of[0,1]){const row=base+(end?512:0),ck=row*3,k=(RINGS*17+end)*3,B=basis(row,scratch),sign=end?1:-1;for(let j=0;j<3;j++){p[k+j]=C[ck+j]*.001;n[k+j]=sign*B[j];}}
 return finish(g);
}

return {createBedFrameFamily,bedSleeveGeometry,bedWireGeometry,dispose(){routeFactory.clear();}};
}
