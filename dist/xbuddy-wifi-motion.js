// Rotations use axis-angle vectors in degrees, matching rigidMotion().
// The connector openings clear before the cover is carried away from the box.
const anchors=[
 [35,25,0,0,0,0],
 [16,12,0,0,0,0],
 [13.24,10.82,0,0,5.97,19.14],
 [11.96,5.65,0,0,5.31,13.71],
 [6.17,1.58,0,0,.61,7.15],
 [1,0,0,0,0,0],
 [0,0,0,0,0,0]
];
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>(v-b[i])*(i<3?1:.7)));
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function roundedPoses(points){
 const out=[points[0]];
 for(let i=1;i<points.length-1;i++){
  const before=points[i-1],corner=points[i],after=points[i+1],a=distance(corner,before),b=distance(after,corner),r=Math.min(.3,a*.2,b*.2),first=mix(corner,before,r/a),last=mix(corner,after,r/b);
  out.push(first);
  for(let j=1;j<=12;j++){const t=j/12;out.push(corner.map((v,k)=>(1-t)**2*first[k]+2*t*(1-t)*v+t*t*last[k]));}
 }
 out.push(points.at(-1));
 return out.map(q=>({offset:q.slice(0,3),rotation:q.slice(3)}));
}
export const XBUDDY_WIFI_COVER_MOTION={motionPivot:[-33.2,171.25,82.01],posePath:roundedPoses(anchors)};
