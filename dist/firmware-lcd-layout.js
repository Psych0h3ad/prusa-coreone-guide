// SPDX-License-Identifier: GPL-3.0-only
// Buddy Rect16::HorizontalSplit: equal empty space around translated labels.
export function lcdButtonRects(keys,label,rect,fontWidth=13,spacing=6){
 if(!keys.length)return [];
 if(keys.length===1)return [{...rect,key:keys[0]}];
 const widths=keys.map(k=>(Array.from(label(k)).length*fontWidth)%256),usable=rect.w-spacing*(keys.length-1),space=Math.trunc((usable-Math.min(usable,widths.reduce((a,b)=>a+b,0)))/keys.length);
 let x=rect.x;return keys.map((key,i)=>{let w=widths[i]+space;if(i===keys.length-1&&x+w<rect.x+rect.w)w=rect.x+rect.w-x;const r={...rect,x,w,key};x+=w+spacing;return r;});
}
export function lcdLines(value,columns){
 const result=[];for(const line of String(value).split('\n')){let chars=Array.from(line);while(chars.length>columns){let n=chars.lastIndexOf(' ',columns);if(n<1)n=columns;result.push(chars.slice(0,n).join(''));chars=chars.slice(n);while(chars[0]===' ')chars.shift();}result.push(chars.join(''));}return result;
}
