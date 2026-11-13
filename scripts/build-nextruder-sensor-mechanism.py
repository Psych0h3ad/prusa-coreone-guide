"""Build the explanatory ball holder and photo-derived cylindrical magnet.

No manufacturer holder CAD is implied. Dimensions not specified in the
replacement guide remain photo/pocket inferences. Originals are preserved.
"""
from pathlib import Path
import argparse, json, math
from OCP.TopoDS import TopoDS_Shape
from OCP.BRep import BRep_Builder
from OCP.BRepTools import BRepTools
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakePolygon, BRepBuilderAPI_MakeFace
from OCP.BRepPrimAPI import BRepPrimAPI_MakePrism, BRepPrimAPI_MakeCylinder, BRepPrimAPI_MakeSphere, BRepPrimAPI_MakeBox
from OCP.BRepAlgoAPI import BRepAlgoAPI_Cut, BRepAlgoAPI_Common
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps
from OCP.BRepExtrema import BRepExtrema_DistShapeShape
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.StlAPI import StlAPI_Writer
from OCP.gp import gp_Pnt, gp_Vec, gp_Ax2, gp_Dir

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, default=root/'build/sensor-mechanism')
parser.add_argument('--validation-heatsink', type=Path, help='Optional heatsink BREP for the separate clearance check')
args = parser.parse_args()
out = args.output.resolve()
out.mkdir(parents=True, exist_ok=True)
sink = None
if args.validation_heatsink:
    sink = TopoDS_Shape()
    assert BRepTools.Read_s(sink, str(args.validation_heatsink.resolve()), BRep_Builder())
z = 32.92777129638756
x0, xr = -9.25013245014589, 3.74986754908077

def volume(s):
    g = GProp_GProps()
    BRepGProp.VolumeProperties_s(s, g)
    return g.Mass()

def cylinder(x, y, zz, r, length, axis=(1, 0, 0)):
    return BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(x, y, zz), gp_Dir(*axis)), r, length).Shape()

def box(lo, hi):
    return BRepPrimAPI_MakeBox(gp_Pnt(*lo), *[b-a for a,b in zip(lo, hi)]).Shape()

def cut(a, b):
    return BRepAlgoAPI_Cut(a, b).Shape()

outline = []
for cx, cz, r, a, b in [(x0,z,2.35,math.pi/2,3*math.pi/2), (xr,z-.95,1.4,-math.pi/2,0), (xr,z+.95,1.4,0,math.pi/2)]:
    for i in range(49):
        t = a + (b-a)*i/48
        outline.append([cx+r*math.cos(t), cz+r*math.sin(t)])
wire = BRepBuilderAPI_MakePolygon()
for x, zz in outline:
    wire.Add(gp_Pnt(x, -4.85, zz))
wire.Close()
holder = BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(wire.Wire()).Face(), gp_Vec(0,7.5,0)).Shape()
# The second official step22 photograph shows the spring entering the ball
# end first, followed by the magnet and ball. Keep that entrance open to the
# ball envelope. The old3.1mm lip blocked the4mm ball in a motion check.
# This clearance is an illustration inference, not a production tolerance.
holder = cut(holder, cylinder(-12,0,z,2.025,5.05))
# Both the replacement assembly photograph and current accessory photograph
# show a cylinder. The guide's3x3x3 text conflicts with those photographs.
# Use the photo-derived round display pocket; its fit is not production CAD.
holder = cut(holder, cylinder(-7,0,z,1.65,11.5))
for lo, hi in [([-6.6,-5,z-1.15],[-3.5,-1.1,z+1.15]), ([-1.5,-5,z-1.15],[1.65,-1.1,z+1.15]), ([2.1,1.7,z-1.25],[5.3,2.8,z+1.25])]:
    holder = cut(holder, box(lo, hi))
for x, r in [(x0,1),(-2.5,.65),(3.3,.75)]:
    holder = cut(holder, cylinder(x,-4.9,z,r,.25,(0,1,0)))

rows = []
def check(name, shape, other):
    rows.append({'part':name, 'valid':BRepCheck_Analyzer(shape).IsValid(), 'volumeMM3':volume(shape), 'intersectionMM3':volume(BRepAlgoAPI_Common(shape,other).Shape()), 'separationMM':BRepExtrema_DistShapeShape(shape,other).Value()})

if sink is not None:
    check('holder vs heatsink', holder, sink)
    for i in range(33):
        amount = i/32
        cx = -9.5 + .375*amount
        ball = BRepPrimAPI_MakeSphere(gp_Pnt(cx,0,z),2).Shape()
        magnet = cylinder(cx+2,0,z,1.5,3)
        spring = cylinder(cx+5,0,z,1.5,4.3-(cx+5))
        for name, shape in [('ball',ball),('photo-derived cylindrical magnet',magnet),('spring envelope',spring)]:
            check(f'{name} at {amount:g} vs heatsink', shape, sink)
            check(f'{name} at {amount:g} vs holder', shape, holder)
    report = {'status':'PASS' if all(r['valid'] and abs(r['intersectionMM3'])<1e-5 for r in rows) else 'FAIL', 'scope':'Exact BREP common volumes at33 travel samples with manufacturer heatsink and inferred holder. Spring bounded by its full cylinder. This checks the illustration, not production fit or magnetic sensing.', 'rows':rows}
    (out/'mechanism-cad-check.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'status':report['status'],'cases':len(rows),'maxIntersectionMM3':max(r['intersectionMM3'] for r in rows),'failedCases':sum(not r['valid'] or abs(r['intersectionMM3'])>=1e-5 for r in rows)}),flush=True)
    assert report['status']=='PASS'
else:
    report = {'status':'NOT_RUN','scope':'No optional heatsink BREP supplied; no clearance approval is claimed.'}
    (out/'mechanism-cad-check.json').write_text(json.dumps(report,indent=2)+'\n')
BRepTools.Write_s(holder,str(out/'holder.brep'))
BRepMesh_IncrementalMesh(holder,.025,False,.12,True).Perform()
writer = StlAPI_Writer()
writer.ASCIIMode = False
assert writer.Write(holder,str(out/'sensor-holder.stl'))
d = json.loads((root/'dist/assets/nextruder/sensor-mechanism.json').read_text())
d.pop('magnetRadius',None)
d.pop('magnetSize',None)
d['magnetShape'] = 'cylinder'
d['magnetDiameter'] = 3
d['magnetLength'] = 3
d['provenance']['dimensions'] = 'The official assembly and accessory photographs show a cylindrical magnet, but guide922421 step20 says3x3x3mm. Shape follows both photographs; diameter3mm and length3mm are display inferences, not a verified production specification. Ball4mm and spring0.3x3x9mm follow official parts information. Holder, clearance, installed compression and travel remain explanatory.'
d['provenance']['magnetShapeConflict'] = {'guideText':'Magnet3x3x3mm (1x)','displayChoice':'one cylinder, following both official photographs','verifiedProductionDimensions':False,'sources':['https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#942418','https://www.prusa3d.com/product/filament-sensor-accessories/']}
d['provenance']['sources'] = list(dict.fromkeys(d['provenance']['sources'] + ['https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421#942362','https://www.prusa3d.com/cdn-cgi/image/width%3D1024%2Cformat%3Dauto%2Cquality%3D85/content/images/product/9302dac7-fe51-4b47-b40d-f79c2591d7f4.jpg']))
d['provenance']['holderAccess'] = 'The second official step22 photo shows spring-first stack entry at the ball end. The display holder entrance was opened to4.05mm for the4mm ball after a sampled motion check rejected the previous3.1mm lip. Both opening and clearance remain explanatory, not manufacturer dimensions.'
d['provenance']['sources'] = list(dict.fromkeys(d['provenance']['sources'] + ['https://help.prusa3d.com/wp-content/uploads/2023/10/be11f648fab05999e3d42afbd1264b0a_painted.jpeg']))
(out/'sensor-mechanism.json').write_text(json.dumps(d,indent=2)+'\n')
