"""Assembly illustrations registered to the official case's mounting pattern.

PCB outline and component footprints are traced from official manual photographs.
Component heights and the 1.6 mm laminate are illustrative, not manufacturing CAD.
The original Prusa enclosure and fastener meshes are not modified.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parents[1]
out=root/'dist/assets/electronics'
out.mkdir(parents=True,exist_ok=True)

def homography(src,dst):
    a=[];b=[]
    for (x,y),(u,v) in zip(src,dst):
        a.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]])
        b.extend([u,v])
    return np.r_[np.linalg.solve(a,b),1].reshape(3,3)

boards=[]
def board(key,file,pixels,mounts,bounds,origin,outline,photo):
    image=Image.open(root/'research'/file).convert('RGB')
    H=homography(mounts,pixels) # local millimetres -> source photo pixels
    u0,v0,u1,v1=bounds;scale=11.5
    size=(round((u1-u0)*scale),round((v1-v0)*scale))
    T=np.array([[1/scale,0,u0],[0,1/scale,v0],[0,0,1]])
    P=H@T;P/=P[2,2]
    tex=image.transform(size,Image.Transform.PERSPECTIVE,tuple(P.ravel()[:8]),Image.Resampling.BICUBIC)
    tex.save(out/f'{key}.webp',quality=91,method=6)
    data=dict(key=key,bounds=bounds,origin=origin,outline=outline,mounts=mounts,thickness=1.6,
              texture=f'./assets/electronics/{key}.webp',source=photo,components=[],holes=[],
              provenance='Official manual photograph registered to original enclosure fasteners. Assembly illustration; component heights approximate.')
    inverse=np.linalg.inv(H)
    def pos(x,y):
        p=inverse@np.array([x,y,1]);return p[:2]/p[2]
    def part(kind,rect,height,**kw):
        x0,y0,x1,y1=rect;p=pos(x0,y0);q=pos(x1,y1)
        data['components'].append(dict(kind=kind,rect=[*p,*q],height=height,**kw))
    def hole(x,y,r):data['holes'].append([*pos(x,y),r])
    boards.append(data)
    return part,hole

p,h=board('xBuddy','board-step9-1.jpg',[(543,279),(998,279),(677,1021),(998,1021)],
          [(0,0),(80,0),(24,129),(80,129)],[-5,-5,85,137],[-54.20276,165.45172,162.64597],
          [(-5,-5),(85,-5),(85,137),(-5,137),(-5,111),(-2,111),(-2,85),(-5,85),(-5,7)],
          'https://help.prusa3d.com/guide/3-back-assembly_982260#984741')
boards[-1]['holes']=[[0,0,1.7],[80,0,1.7],[0,74,1.7],[80,63,1.7],[24,129,1.7],[80,129,1.7]]
h(794,419,2.25);h(898,419,2.25)
boards[-1]['pads']=[[19.435,15.239,40,12],[63.495,57.591,12,12],[20.423,110.600,12,12]]
for r in [(569,263,624,305),(638,263,691,305),(706,263,760,305),(774,263,828,305),(843,262,907,314),
          (526,495,562,537),(526,620,563,685),(968,700,1016,819),(973,851,1015,928),(969,947,1010,988),(771,798,807,839)]:p('socket',r,5.5)
p('usbC',(510,553,555,607),3.2,edge='left')
p('ethernet',(495,953,622,1058),13,edge='left')
# Keep the simplified housing inside the source case's Ethernet opening.
boards[-1]['components'][-1]['rect'][3]=134.0
p('header',(980,418,1013,617),6.5)
p('header',(535,722,590,775),8)
p('battery',(959,323,1025,393),6)
for r in [(636,522,769,651),(647,489,682,514),(716,483,755,515),(775,620,813,658),
          (651,727,689,763),(805,785,842,820),(867,818,915,866),(634,902,678,946),
          (551,361,590,399),(615,360,654,400),(683,358,723,399),(753,359,792,399)]:p('chip',r,1.3)
for r in [(553,423,590,465),(614,421,653,465),(716,422,755,465),(846,544,880,582),
          (780,717,817,757),(699,898,737,938),(912,847,950,885)]:p('capacitor',r,5.2)
for r,c in [((773,858,848,886),'brown'),((775,909,848,937),'red'),((883,906,959,936),'brown')]:p('fuse',r,5,color=c)
for r in [(630,801,705,877),(696,801,759,877),(705,978,767,1052),(763,978,824,1052),(837,978,900,1052),(896,978,954,1052)]:p('terminal',r,9)

p,h=board('xBuddyExtension','board-step10-1.jpg',[(275,587),(1195,593),(276,963),(1195,970)],
          [(0,0),(80,0),(0,33),(80,33)],[-5,-16,85,37],[-54.20276,165.43632,206.64597],
          [(-5,-16),(85,-16),(85,4),(78,4),(78,15),(85,15),(85,37),(-5,37),(-5,20),(-1,20),(-1,6),(-5,6)],
          'https://help.prusa3d.com/guide/3-back-assembly_982260#984811')
boards[-1]['holes']=[[0,0,1.7],[80,0,1.7],[0,33,1.7],[80,33,1.7]]
h(330,581,1);h(1143,975,1);h(389,829,1.2);h(450,831,1.2);h(389,868,1.2);h(448,869,1.2)
for r in [(239,410,343,497),(366,412,453,499),(481,413,570,499),(592,416,682,501),
          (721,416,816,505),(847,416,943,505),(967,418,1062,506),(1095,419,1237,510),
          (1075,656,1157,773),(1074,790,1156,913),(678,862,813,976),(884,866,1029,978)]:p('socket',r,5.5)
p('usbC',(209,751,309,851),3.2,edge='left')
for r in [(404,699,497,789),(496,862,563,928),(595,866,652,924),(802,804,861,860),
          (372,530,419,572),(485,531,531,573),(600,532,646,574),(729,531,776,574),(855,532,903,576)]:p('chip',r,1.2)
p('capacitor',(727,719,810,805),5.2)
p('inductor',(948,650,1024,722),4)

(out/'boards.json').write_text(json.dumps({'boards':boards},ensure_ascii=False,indent=2),encoding='utf8')
print('Built 2 photo-registered PCB illustrations, 10 mounting holes and raised component footprints.')
