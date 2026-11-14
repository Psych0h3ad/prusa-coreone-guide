"""Independently authored chamber-fan illustration. Code MIT, geometry CC BY-SA 4.0.

Only the 60x60x25 envelope and 29 mm bore come from the existing OCL frame.
Seven blades and rear-side support arrangement follow official guide photos.
All internal dimensions are editable visual estimates, not supplier CAD or
measurements of a physical fan. No STEP file is generated or distributed.
"""
from pathlib import Path
import argparse, collections, hashlib, json, math
import numpy as np
from OCP.gp import gp_Pnt, gp_Vec
from OCP.BRepPrimAPI import BRepPrimAPI_MakeCylinder, BRepPrimAPI_MakePrism
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakePolygon, BRepBuilderAPI_MakeFace
from OCP.BRepOffsetAPI import BRepOffsetAPI_ThruSections
from OCP.BRepAlgoAPI import BRepAlgoAPI_Fuse
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRep import BRep_Tool
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.TopoDS import TopoDS
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE, TopAbs_SOLID, TopAbs_REVERSED
from OCP.TopLoc import TopLoc_Location
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.gp import gp_Ax2, gp_Dir

P = dict(blades=7, hubRadius=14.5, hubFront=4.2, hubBack=20.2,
         bladeRootRadius=13.4, bladeTipRadius=27.3, bladeThickness=.85,
         bladeChord=17.4, bladeSweep=.30, bladePitch=8.0,
         bladeRadialStations=8, bladeChordStations=7,
         supportRadius=12.7, supportFront=21.6, supportBack=24.2,
         strutTipRadius=29.6, strutWidth=3.0, strutSweep=.22,
         labelRadius=11.5, labelFront=24.2, labelThickness=.12,
         linearDeflection=.035, angularDeflection=.12)

def cylinder(r, lo, hi):
    return BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(0, 0, lo), gp_Dir(0, 0, 1)), r, hi-lo).Shape()

def fuse(a, b):
    op=BRepAlgoAPI_Fuse(a, b); op.Build()
    assert op.IsDone()
    result=op.Shape(); assert BRepCheck_Analyzer(result).IsValid()
    return result

def blade(angle):
    loft=BRepOffsetAPI_ThruSections(True, False, 1e-7)
    for j in range(P['bladeRadialStations']):
        u=j/(P['bladeRadialStations']-1)
        r=P['bladeRootRadius']+(P['bladeTipRadius']-P['bladeRootRadius'])*u
        theta=angle+P['bladeSweep']*(u-.5)
        wire=BRepBuilderAPI_MakePolygon()
        for side, values in [(1, range(P['bladeChordStations'])), (-1, reversed(range(P['bladeChordStations'])))]:
            for k in values:
                v=k/(P['bladeChordStations']-1)-.5
                tangent=v*P['bladeChord']*(1-.3*u)
                z=12.0+v*P['bladePitch']+1.2*(1-4*v*v)+.7*u+side*P['bladeThickness']/2
                wire.Add(gp_Pnt(r*math.cos(theta)-tangent*math.sin(theta), r*math.sin(theta)+tangent*math.cos(theta), z))
        wire.Close(); loft.AddWire(wire.Wire())
    loft.Build(); assert loft.IsDone()
    result=loft.Shape(); assert BRepCheck_Analyzer(result).IsValid()
    return result

def strut(angle):
    # Rear support joins the existing frame's bore. Its small overlap with the
    # frame is the fixed support/frame joint, not a moving blade/frame contact.
    points=[]
    for r, side in [(11.8,-1),(P['strutTipRadius'],-1),(P['strutTipRadius'],1),(11.8,1)]:
        a=angle+P['strutSweep']*(r-11.8)/(P['strutTipRadius']-11.8)
        x=r*math.cos(a)-side*P['strutWidth']/2*math.sin(a)
        y=r*math.sin(a)+side*P['strutWidth']/2*math.cos(a)
        points.append(gp_Pnt(x,y,P['supportFront']))
    wire=BRepBuilderAPI_MakePolygon()
    for point in points: wire.Add(point)
    wire.Close()
    return BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(wire.Wire()).Face(), gp_Vec(0,0,P['supportBack']-P['supportFront'])).Shape()

def mesh(shape, role):
    BRepMesh_IncrementalMesh(shape,P['linearDeflection'],False,P['angularDeflection'],True)
    positions=[]; normals=[]; materialIds=[]; types=collections.Counter(); ex=TopExp_Explorer(shape,TopAbs_FACE)
    while ex.More():
        face=TopoDS.Face_s(ex.Current()); loc=TopLoc_Location()
        tri=BRep_Tool.Triangulation_s(face,loc); assert tri is not None
        surface=BRepAdaptor_Surface(face); types[str(surface.GetType()).split('.')[-1]]+=1
        reverse=face.Orientation()==TopAbs_REVERSED
        label=role=='support' and max(tri.Node(k).Z() for k in range(1,tri.NbNodes()+1))>P['supportBack']+1e-5
        for i in range(1,tri.NbTriangles()+1):
            indices=list(tri.Triangle(i).Get())
            if reverse: indices[1],indices[2]=indices[2],indices[1]
            xyz=[tri.Node(k).Transformed(loc.Transformation()) for k in indices]
            cross=np.cross(np.array(xyz[1].Coord())-xyz[0].Coord(),np.array(xyz[2].Coord())-xyz[0].Coord())
            assert np.linalg.norm(cross)>1e-12
            for k,p in zip(indices,xyz):
                uv=tri.UVNode(k); point=gp_Pnt(); du=gp_Vec(); dv=gp_Vec()
                surface.D1(uv.X(),uv.Y(),point,du,dv); n=du.Crossed(dv)
                if n.Magnitude()<1e-10: n=gp_Vec(*cross)
                elif reverse: n.Reverse()
                n.Normalize(); positions.extend(p.Coord()); normals.extend(n.Coord()); materialIds.append(int(label))
        ex.Next()
    p=np.asarray(positions,dtype='<f4').reshape(-1,3); n=np.asarray(normals,dtype='<f4').reshape(-1,3)
    materialIds=np.asarray(materialIds);order=np.argsort(materialIds,kind='stable');p=p[order];n=n[order]
    n0=int((materialIds==0).sum());groups=[dict(start=0,count=n0,material=0)]
    if n0<len(p):groups.append(dict(start=n0,count=len(p)-n0,material=1))
    t=p.reshape(-1,3,3); cross=np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0])
    assert ((cross*n.reshape(-1,3,3).mean(1)).sum(1)>0).all()
    assert abs(np.linalg.norm(n,axis=1)-1).max()<1e-6
    prop=GProp_GProps(); BRepGProp.VolumeProperties_s(shape,prop)
    solids=0; ex=TopExp_Explorer(shape,TopAbs_SOLID)
    while ex.More(): solids+=1; ex.Next()
    assert solids==1 and prop.Mass()>0
    return p,n,dict(validSolid=True,solids=solids,faces=sum(types.values()),surfaceTypes=dict(types),volumeMm3=prop.Mass(),boundsMm=[*p.min(0).tolist(),*p.max(0).tolist()],groups=groups)

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--output',required=True); args=parser.parse_args()
    out=Path(args.output); out.mkdir(parents=True,exist_ok=True)
    rotor=cylinder(P['hubRadius'],P['hubFront'],P['hubBack'])
    for i in range(P['blades']): rotor=fuse(rotor,blade(i/P['blades']*2*math.pi))
    stator=cylinder(P['supportRadius'],P['supportFront'],P['supportBack'])
    for i in range(4): stator=fuse(stator,strut(i/4*2*math.pi))
    stator=fuse(stator,cylinder(P['labelRadius'],P['labelFront'],P['labelFront']+P['labelThickness']))
    shapes={'rotor':rotor,'support':stator}
    report={'format':'positions-f32le-mm-then-normals-f32le','parameters':P,'parts':{}}
    payloads=[]; offset=0
    for name,shape in shapes.items():
        p,n,info=mesh(shape,name); payload=p.tobytes()+n.tobytes(); payloads.append(payload)
        report['parts'][name]=dict(offsetBytes=offset,vertices=len(p),bytes=len(payload),sha256=hashlib.sha256(payload).hexdigest(),**info); offset+=len(payload)
    payload=b''.join(payloads); (out/'fan-anatomy.bin').write_bytes(payload)
    report['sha256']=hashlib.sha256(payload).hexdigest(); report['bytes']=len(payload)
    (out/'fan-anatomy.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))

if __name__=='__main__': main()
