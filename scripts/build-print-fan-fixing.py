"""Use the source ISO4762 head and end chamfer with the guide's 20mm shank."""
from pathlib import Path
import json,hashlib,numpy as np,trimesh
root=Path(__file__).resolve().parents[1]
source=root/'dist/assets/sensor/M3x10-cap.stl';m=trimesh.load(source,force='mesh')
before=m.copy();m.vertices[m.vertices[:,2]>1,2]+=10
assert np.allclose(m.bounds,[[-2.75,-2.75,-3],[2.75,2.75,20]])
assert np.array_equal(before.vertices[before.vertices[:,2]<=1],m.vertices[before.vertices[:,2]<=1])
assert abs((m.volume-before.volume)-np.pi*1.5**2*10)<.08
out=root/'dist/assets/nextruder/print-fan-m3x20.stl';m.export(out)
spec={'cadIndex':846,'name':'M3x20 (ISO 4762)','file':'./assets/nextruder/print-fan-m3x20.stl','source':'https://www.printables.com/model/1520471','guide':'https://help.prusa3d.com/guide/how-to-replace-loveboard-core-one_958922#960871','units':'mm','nominalLength':20,'placement':[[1,0,0,-19.8123846524],[0,.422618262,-.906307787,19.3703643019],[0,.906307787,.422618262,353.5219539029],[0,0,0,1]],'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
(out.parent/'print-fan-fixing.json').write_text(json.dumps(spec,indent=2)+'\n',encoding='utf-8')
print('20mm shank, source head/chamfer preserved; nominal diameter3mm, head5.5x3mm.')
