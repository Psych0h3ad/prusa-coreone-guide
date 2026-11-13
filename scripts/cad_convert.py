"""Convert the original, locally retained Prusa assembly to a browser mesh.

Does not write or publish a STEP file. Source BREP, placements and colors are
retained; tessellation affects rendering only.
"""
import sys, json, time
from pathlib import Path
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TDocStd import TDocStd_Document
from OCP.TCollection import TCollection_ExtendedString, TCollection_AsciiString
from OCP.XCAFDoc import XCAFDoc_DocumentTool
from OCP.TDF import TDF_LabelSequence
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.RWGltf import RWGltf_CafWriter
from OCP.TColStd import TColStd_IndexedDataMapOfStringString
from OCP.Message import Message_ProgressRange
from OCP.IFSelect import IFSelect_RetDone

root=Path(__file__).resolve().parents[1]
source=root/'research/CORE_One_assembly.step'
out=root/'dist/assets/core-one.glb'
print('Reading official assembly',flush=True)
doc=TDocStd_Document(TCollection_ExtendedString('Prusa CORE One'))
reader=STEPCAFControl_Reader()
reader.SetColorMode(True)
reader.SetNameMode(True)
reader.SetLayerMode(True)
status=reader.ReadFile(str(source))
assert status==IFSelect_RetDone, status
assert reader.Transfer(doc), 'STEP transfer failed'
tool=XCAFDoc_DocumentTool.ShapeTool_s(doc.Main())
labels=TDF_LabelSequence()
tool.GetFreeShapes(labels)
print('Root assemblies:',labels.Length(),flush=True)
for i in range(1,labels.Length()+1):
    shape=tool.GetShape_s(labels.Value(i))
    BRepMesh_IncrementalMesh(shape,0.22,False,0.28,True)
print('Writing browser assembly',flush=True)
writer=RWGltf_CafWriter(TCollection_AsciiString(str(out)),True)
writer.SetMergeFaces(True)
ok=writer.Perform(doc,TColStd_IndexedDataMapOfStringString(),Message_ProgressRange())
assert ok,'GLB export failed'
print('GLB:',out.stat().st_size,flush=True)
