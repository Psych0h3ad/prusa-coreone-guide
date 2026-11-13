"""Supplemental native firmware bitmap cells; no system fonts or substituted glyphs."""
from pathlib import Path
from PIL import Image
import json,re,argparse
parser=argparse.ArgumentParser();parser.add_argument('--root',default='.');args=parser.parse_args()
p=Path(args.root).resolve()
req=json.loads((p/'dist/assets/firmware-ui/maintenance-native/glyph-requirements.json').read_text('utf-8'))['missing']
sizes={'normal':(11,19,'bold'),'special':(9,16,'regular'),'big':(13,22,'bold')}
metadata={}
for version,groups in req.items():
    src=p/'source/vendor/prusa-firmware-buddy/maintenance-native'/version
    dest=p/'dist/assets/firmware-ui/maintenance-native'/version
    dest.mkdir(parents=True,exist_ok=True)
    meta={}
    for kind,chars in groups.items():
        w,h,weight=sizes[kind]
        atlas=Image.new('RGBA',(16*w,max(1,(len(chars)+15)//16)*h))
        if version=='8.0.0':
            latin=Image.open(src/f'src__module__gui__font_data__png__LiberationMono-{weight}_{w}x{h}.png').convert('RGB')
            ja=Image.open(src/f'src__module__gui__font_data__png__{w}x{h}px_migu-1m-regular_katakana.png').convert('RGB')
        else:
            codes=[int(c,16) for c in re.findall(r'0x[0-9a-fA-F]+',(src/'src__guiapi__include__fnt-full-indices.ipp').read_text('utf-8'))]
            indices={chr(code):i for i,code in enumerate(codes)}
            old=Image.open(src/f'src__gui__res__fnt_png__font_{weight}_{w}x{h}_full.png').convert('RGB')
        for i,char in enumerate(chars):
            code=ord(char)
            if version=='8.0.0':
                image=ja if 0x30a0<=code<=0x30ff else latin
                k=code-0x30a0 if image is ja else code-32
            else:
                if char not in indices: raise RuntimeError(f'Missing native glyph {version}/{char}')
                image,k=old,indices[char]
            x,y=k%16,k//16
            if x<0 or y<0 or (y+1)*h>image.height: raise RuntimeError(f'Out of font bounds {char}')
            for yy in range(h):
                for xx in range(w):
                    rgb=image.getpixel((x*w+xx,y*h+yy))
                    if rgb==(255,0,0): rgb=(255,255,255)
                    alpha=((255-sum(rgb)//3)>>4)*17
                    atlas.putpixel(((i%16)*w+xx,(i//16)*h+yy),(255,255,255,alpha))
        file=f'{kind}-extra.png';atlas.save(dest/file)
        meta[kind]={'file':file,'width':w,'height':h,'characters':chars}
    metadata[version]={'fonts':meta}
(p/'dist/assets/firmware-ui/maintenance-native/glyphs.json').write_text(json.dumps(metadata,ensure_ascii=False,separators=(',',':')),'utf-8')
print('Native supplemental cells:',sum(len(v) for x in req.values() for v in x.values()))
