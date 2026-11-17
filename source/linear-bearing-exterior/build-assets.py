# SPDX-License-Identifier: MIT
"""Tessellate the complete licensed LM8uu exterior body for browser display."""
from pathlib import Path
import argparse,gzip,hashlib,io,json,tempfile,zipfile
import numpy as np
from OCP.TopoDS import TopoDS_Shape,TopoDS
from OCP.BRep import BRep_Builder,BRep_Tool
from OCP.BRepTools import BRepTools
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.TopAbs import TopAbs_FACE,TopAbs_REVERSED
from OCP.TopExp import TopExp_Explorer
from OCP.TopLoc import TopLoc_Location
from OCP.gp import gp_Pnt,gp_Vec

HERE=Path(__file__).resolve().parent
SHA=lambda data:hashlib.sha256(data).hexdigest()

def build(output):
 source=json.loads((HERE/'SOURCE.json').read_bytes())
 raw=(HERE/source['sourceFile']).read_bytes()
 if SHA(raw)!=source['sourceSHA256']:raise ValueError('Source file does not match SOURCE.json')
 with zipfile.ZipFile(io.BytesIO(raw))as archive,tempfile.TemporaryDirectory()as tmp:
  shape_file=Path(tmp)/'body.brp';shape_file.write_bytes(archive.read('PartShape2.brp'))
  shape=TopoDS_Shape()
  if not BRepTools.Read_s(shape,str(shape_file),BRep_Builder())or not BRepCheck_Analyzer(shape).IsValid():raise ValueError('Invalid source body')
  mesher=BRepMesh_IncrementalMesh(shape,.006,False,.06,False);mesher.Perform()
  explorer=TopExp_Explorer(shape,TopAbs_FACE);positions=[];normals=[];faces=[]
  while explorer.More():
   face=TopoDS.Face_s(explorer.Current());location=TopLoc_Location();tri=BRep_Tool.Triangulation_s(face,location)
   if tri is None:raise ValueError('A source face did not tessellate')
   surface=BRepAdaptor_Surface(face);reverse=face.Orientation()==TopAbs_REVERSED;first=len(positions)
   for j in range(1,tri.NbTriangles()+1):
    ids=list(tri.Triangle(j).Get())
    if reverse:ids[1],ids[2]=ids[2],ids[1]
    for i in ids:
     p=tri.Node(i).Transformed(location.Transformation());uv=tri.UVNode(i)
     q=gp_Pnt();du=gp_Vec();dv=gp_Vec();surface.D1(uv.X(),uv.Y(),q,du,dv)
     n=du.Crossed(dv)
     if n.Magnitude()==0:raise ValueError('Undefined source normal')
     n.Normalize()
     if reverse:n.Reverse()
     positions.append([p.X(),p.Y(),p.Z()]);normals.append([n.X(),n.Y(),n.Z()])
   bounds=np.array(positions[first:]);row={'sourceFace':len(faces),'firstVertex':first,'count':len(positions)-first,'surface':str(surface.GetType()).split('.')[-1],'bboxMM':[bounds.min(0).tolist(),bounds.max(0).tolist()]}
   if row['surface']=='GeomAbs_Cylinder':row['nominalRadiusMM']=surface.Cylinder().Radius()
   faces.append(row);explorer.Next()
 if len(faces)!=20 or any(row['count']==0 for row in faces):raise ValueError('Incomplete source body')
 p=np.array(positions,dtype='<f4');n=np.array(normals,dtype='<f4')
 if not np.isfinite(p).all()or not np.isfinite(n).all():raise ValueError('Non-finite geometry')
 triangles=p.reshape(-1,3,3).astype(float)
 dots=np.einsum('ij,ij->i',np.cross(triangles[:,1]-triangles[:,0],triangles[:,2]-triangles[:,0]),n.reshape(-1,3,3).mean(1))
 if not np.all(dots>0):raise ValueError('Invalid triangle orientation')
 payload=p.tobytes()+n.tobytes();digest=SHA(payload);buffer=io.BytesIO()
 with gzip.GzipFile(filename='',mode='wb',fileobj=buffer,mtime=0,compresslevel=9)as gz:gz.write(payload)
 compressed=buffer.getvalue();filename='lm8uu-exterior-'+digest[:16]+'.bin.gz'
 manifest={'key':'lm8uuExterior','file':filename,'encoding':'gzip','bufferBytes':len(payload),'downloadBytes':len(compressed),'sha256':digest,'downloadSHA256':SHA(compressed),'vertices':len(p),'triangles':len(p)//3,'units':'mm','layout':'Float32 position XYZ, then Float32 normal XYZ; no index','faces':faces,'allSourceFacesRetained':True,'sourceModel':'LM8uu','author':source['author'],'license':'CC-BY-3.0','sourceURL':source['sourceURL'],'sourceFCStdSHA256':source['sourceSHA256'],'nominalEnvelopeMM':[15,15,24],'nominalBoreDiameterMM':8,'internalBallRowsPresent':False}
 output.mkdir(parents=True,exist_ok=True);(output/filename).write_bytes(compressed);(output/'lm8uu-exterior.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 return manifest

if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',type=Path,default=HERE/'../../dist/assets/linear-bearings');args=parser.parse_args()
 m=build(args.output);print(json.dumps({k:m[k]for k in ('file','bufferBytes','downloadBytes','vertices','triangles','sha256')}))
