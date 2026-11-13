"""Official meshes plus an explicitly illustrative LoveBoard footprint.

The CAD fastener supplies the mounting datum. Photo scale is calibrated against
the connector's 1.50 mm pitch; the result is not a PCB production model.
"""
import json, shutil
import numpy as np
from pathlib import Path
from PIL import Image

root=Path(__file__).resolve().parents[1]
source=root/'research/nextruder-official'
out=root/'dist/assets/nextruder'
out.mkdir(parents=True,exist_ok=True)
for name,src in [('main-plate-R2.stl','CORE-main-plate-R2.stl'),('PG-assembly-adapter.stl','CORE-PG-adapter.stl')]:
    shutil.copyfile(source/src,out/name)
meshes=[dict(key='mainPlate',file='main-plate-R2.stl',color='#303332',matrix=[[-1,0,0,9.05642165],[0,0,1,-66.5952524],[0,1,0,393.00041426],[0,0,0,1]]),
        dict(key='pgAdapter',file='PG-assembly-adapter.stl',color='#363936',toolOnly=True,matrix=[[-1,0,0,9.05642165],[0,0,1,-67.31],[0,1,0,393.00041426],[0,0,0,1]])]
(out/'official-meshes.json').write_text(json.dumps(meshes,indent=2))
# Front view from official manual 6.28. Keep image detail on a single surface;
# raised connector housings have their own open cavities and pins.
im=Image.open(source/'manual-28-0.jpg').convert('RGB')
im.crop((240,220,1285,975)).save(out/'loveboard-front.webp',quality=92,method=6)
src=[[264,965],[1238,879],[1208,268],[248,445]]
dst=[[1406,751],[708,951],[575,540],[1260,416]]
A=[];B=[]
for (x,y),(u,v) in zip(src,dst):
    A.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);B.extend([u,v])
H=np.r_[np.linalg.solve(A,B),1].reshape(3,3)
P=H@np.array([[1,0,240],[0,1,220],[0,0,1]]);P/=P[2,2]
back=Image.open(source/'manual-31-0.jpg').convert('RGB')
back.transform((1045,755),Image.Transform.PERSPECTIVE,tuple(P.ravel()[:8]),Image.Resampling.BICUBIC).save(out/'loveboard-back.webp',quality=92,method=6)
outline=[[245,945],[264,965],[730,965],[773,924],[1072,924],[1118,879],[1238,879],[1280,838],[1280,337],[1208,268],[626,268],[580,228],[536,228],[470,294],[470,393],[432,428],[268,428],[248,445]]
# Eleven J13 contact centres give 25.6 px per 1.50 mm pitch (least-squares).
# Keep the screw datum fixed when correcting the earlier undersized outline.
b=dict(scale=.0586,datumPixel=[662,900],datumCAD=[-7.9444463137,-25.3952523998,378.2004213562],thickness=.8,
       bounds=[240,220,1285,975],outline=outline,holes=[[662,900,1.7],[1245,357,1.05]],
       texture='./assets/nextruder/loveboard-front.webp',
       backTexture='./assets/nextruder/loveboard-back.webp',
       source='https://help.prusa3d.com/guide/6-nextruder-assembly_982284#994323',
       components=[{'rect':r,'height':h,'kind':k} for r,h,k in [
           ([971,380,1138,450],1.25,'chip'),
           ([748,548,810,622],1.15,'chip'),([803,795,879,903],1.3,'chip')]])
(out/'loveboard.json').write_text(json.dumps(b,indent=2))
print('Official CORE One meshes copied unchanged. LoveBoard illustration built with CAD screw datum.')
