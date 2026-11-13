import * as T from 'three';

// A shared, small textile tile. No external image or per-frame texture upload.
let texture;
export function textileTexture(){
 if(texture)return texture;
 const size=64,pixels=new Uint8Array(size*size*4);let seed=97;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const grain=(seed>>>24)/255,weave=(x%4===0||y%4===0)?-.08:0,value=Math.round(255*(.72+.25*grain+weave)),i=(y*size+x)*4;
  pixels[i]=pixels[i+1]=pixels[i+2]=value;pixels[i+3]=255;
 }
 texture=new T.DataTexture(pixels,size,size,T.RGBAFormat);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.generateMipmaps=true;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;return texture;
}
