"""Build original connected-passage references. Code MIT; geometry CC-BY-SA4.0."""
from pathlib import Path
import importlib.util
H=Path(__file__).resolve().parent
def build(output):
 spec=importlib.util.spec_from_file_location('connected_passage_reference',H/'functional-reference/build.py')
 ref=importlib.util.module_from_spec(spec);spec.loader.exec_module(ref)
 out=Path(output);out.mkdir(parents=True,exist_ok=True);parts={}
 for pins in [2,3,4]:
  shape,moving=ref.m.housing(pins);part=f'5025780{pins}00';meta=ref.export(shape,part,out,moving)
  parts[part]={k:meta[k] for k in ['vertices','groups','releaseSkinGroups','meshSha256','analyticFaces','surfaceTypes','solids','valid','facesOmitted']}
  parts[part].update({'wireEntryRow':[0,0,1.25],'insertionAxis':[0,1,0]})
 return parts
