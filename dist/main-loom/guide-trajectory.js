export function guideOffsets(data,progress){
 if(progress<=data.times[0]||progress>=data.times.at(-1))return null;
 let t=data.times.findIndex(v=>v>progress)-1;t=Math.max(0,Math.min(t,data.times.length-2));const u=progress-data.times[t],[a,b,c,d]=data.coefficients[t];
 return{knots:data.knots,coefficients:d.map((row,i)=>row.map((vector,j)=>vector.map((v,k)=>((a[i][j][k]*u+b[i][j][k])*u+c[i][j][k])*u+v)))};
}
