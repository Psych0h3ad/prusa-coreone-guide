import*as T from'three';import{XBuddyPreparedTieRoute}from'../../../xbuddy-tie-routing.js';
export function createBox5PreparedRoute(def){
 if(def.id!=='box5'||def.strap)throw Error('Expected actual nylon box5');
 const route=new XBuddyPreparedTieRoute(def),origin=new T.Vector3(...def.p),U=new T.Vector3(...def.u),V=new T.Vector3(...def.v),point=(u,v)=>origin.clone().addScaledVector(U,u).addScaledVector(V,v),s=def.span,restingHeight=2;
 // Retain every mounting passage, bend and incoming head point. Only the free
 // tail after the exit rests closer to the board, below the held LCD cable.
 route.points=route.points.slice(0,route.passageEnd+1);
 const bow=new T.CubicBezierCurve3(route.points.at(-1),point(-s-4,2),point(-s-4,restingHeight),point(-s-20,restingHeight));for(let i=1;i<=192;i++)route.points.push(bow.getPoint(i/192));
 const end=point(-s-100,restingHeight),a=route.points.at(-1),n=Math.ceil(a.distanceTo(end)/.4);for(let i=1;i<=n;i++)route.points.push(a.clone().lerp(end,i/n));
 route.lengths=[0];for(let i=1;i<route.points.length;i++)route.lengths.push(route.lengths.at(-1)+route.points[i].distanceTo(route.points[i-1]));route.loopLength=route.lengths[route.passageEnd];return route;
}
