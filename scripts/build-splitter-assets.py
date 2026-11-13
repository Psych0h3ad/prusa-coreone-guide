"""Register the official Stepper Splitter photograph to the two CAD pin axes.

Photo-derived outline, thickness and connector envelopes are illustrations.
The two mounting centres retain the source CAD's exact 20 mm pitch.
"""
import json, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root=Path(__file__).resolve().parents[1]
source=root/'research/quality/splitter-20261104-34/manual-36-0.jpg'
out=root/'dist/assets/electronics'
out.mkdir(parents=True,exist_ok=True)
p0=(795.5,363.0);p1=(791.8,719.0)
scale=math.dist(p0,p1)/20
v=((p1[0]-p0[0])/(20*scale),(p1[1]-p0[1])/(20*scale))
u=(v[1],-v[0])
def local(p):
    d=(p[0]-p0[0],p[1]-p0[1])
    return [round((d[0]*u[0]+d[1]*u[1])/scale,5),round((d[0]*v[0]+d[1]*v[1])/scale,5)]
outline=[local(p) for p in [(628,266),(1038,270),(1059,276),(1071,292),(1071,905),(1066,921),(1052,931),(552,929),(540,924),(532,910),(532,651),(519,636),(518,368)]]
holes=[[0,0,2.05],[0,20,2.05],local((1039,393))+[1.0],local((720,893))+[.8]]
bounds=[min(p[0]for p in outline),min(p[1]for p in outline),max(p[0]for p in outline),max(p[1]for p in outline)]
w=640;h=round(w*(bounds[3]-bounds[1])/(bounds[2]-bounds[0]))
du=(bounds[2]-bounds[0])/w;dv=(bounds[3]-bounds[1])/h
x0=p0[0]+scale*(u[0]*bounds[0]+v[0]*bounds[1]);y0=p0[1]+scale*(u[1]*bounds[0]+v[1]*bounds[1])
image=Image.open(source).convert('RGB').transform((w,h),Image.Transform.AFFINE,(scale*u[0]*du,scale*v[0]*dv,x0,scale*u[1]*du,scale*v[1]*dv,y0),Image.Resampling.BICUBIC)
image.save(out/'splitter-front.webp',quality=92)
# A clean, schematic rear silkscreen; do not fabricate a photographed rear PCB.
back=Image.new('RGB',(w,h),'#202326');d=ImageDraw.Draw(back)
font=ImageFont.truetype(str(root/'dist/assets/font-2.ttf'),72)
small=ImageFont.truetype(str(root/'dist/assets/font-2.ttf'),24)
def point(u,v):return ((u-bounds[0])/du,(v-bounds[1])/dv)
for u0,v0,r in holes:
    x,y=point(u0,v0);d.ellipse((x-r/du-4,y-r/dv-4,x+r/du+4,y+r/dv+4),outline='#bea470',width=4)
d.text(point(-8,6),'PRUSA',font=font,fill='#e6e5df')
d.text(point(-11,11),'FDM-MK4-StepperSplitter',font=small,fill='#e6e5df')
back.save(out/'splitter-back.webp',quality=92)
ports=[]
for id,p,side,label in [('J6',(625,538),-1,'Stepper splitter cable'),('J7',(625,768),-1,'Z-axis motor R'),('J1',(987,538),1,'Z-axis motor L'),('J5',(987,768),1,'Z-axis motor L')]:
    xy=local(p);ports.append({'id':id,'centre':xy,'side':side,'connection':label})
data={'key':'stepperSplitter','origin':[-95.183,-175.48636944,-49.51320344],'thickness':1.6,'bounds':bounds,'outline':outline,'holes':holes,'ports':ports,'photoScale_px_per_mm':scale,'provenance':'Official-photo-based assembly illustration; mounting pitch from official front-profile CAD. Not manufacturer PCB CAD. Connector depth, pin flex and wire slack are illustrative.','source':'https://help.prusa3d.com/guide/3-back-assembly_982260#986137','photo':'https://help.prusa3d.com/wp-content/uploads/2025/11/bf15d3d02fc2065519dce5567666b3d0.jpg','portMap':'https://help.prusa3d.com/article/prusa-core-one-electronics_857793'}
(out/'splitter.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Registered Stepper Splitter assets: 2 mounting holes / 20 mm pitch / 4 official port labels.')
