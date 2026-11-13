// Fit measured annotations around the model controls. Coordinates are local
// to the canvas; moving an annotation does not move its 3D attachment point.
export function workAreaObstacle(points,width,height,padding=8){
 if(!points.length||points.some(p=>![p.x,p.y,p.z].every(Number.isFinite)||p.z< -1||p.z>1))return null;
 const xs=points.map(p=>(p.x*.5+.5)*width),ys=points.map(p=>(-.5*p.y+.5)*height);
 const left=Math.max(0,Math.min(...xs)-padding),right=Math.min(width,Math.max(...xs)+padding),top=Math.max(0,Math.min(...ys)-padding),bottom=Math.min(height,Math.max(...ys)+padding);
 return right>left&&bottom>top?{left,right,top,bottom}:null;
}
export function placeCallout({width,height,labelWidth,labelHeight,x,y,obstacles=[]}){
 const margin=8,w=Math.min(labelWidth,width-margin*2),h=Math.min(labelHeight,height-margin*2);
 const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n)),overlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
 const xs=[x-w/2,x-w-18,x+18,margin,width-w-margin],ys=[y-h-22,y+22,y-h/2,margin,height-h-margin];
 for(const o of obstacles){xs.push(o.left-w-margin,o.right+margin);ys.push(o.top-h-margin,o.bottom+margin);}
 const target={left:x-12,right:x+12,top:y-12,bottom:y+12};let best;
 for(const xx of xs)for(const yy of ys){const left=clamp(xx,margin,width-margin-w),top=clamp(yy,margin,height-margin-h),box={left,top,right:left+w,bottom:top+h};
  const distance=Math.hypot(clamp(x,box.left,box.right)-x,clamp(y,box.top,box.bottom)-y),score=obstacles.reduce((n,o)=>n+overlap(box,o)*1000,0)+overlap(box,target)*100+distance+Math.abs(left+w/2-x)*.08;
  if(!best||score<best.score)best={...box,score};
 }
 return best;
}
