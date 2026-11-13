"""Merge computed geometry fields with editable descriptive metadata. Code MIT."""
from pathlib import Path
import json,hashlib
H=Path(__file__).resolve().parent
GEOMETRY_FIELDS={'vertices','groups','releaseSkinGroups','meshSha256','wireEntryRow','insertionAxis'}
def merge(output,generated):
 metadata=json.loads((H/'part-metadata.json').read_text(encoding='utf8'))
 assert set(generated)==set(metadata['parts'])and len(generated)==7
 parts={}
 for part,text in metadata['parts'].items():
  assert not GEOMETRY_FIELDS.intersection(text)
  record={**generated[part],**text};data=(Path(output)/(part+'.bin')).read_bytes()
  assert len(data)==record['vertices']*24 and hashlib.sha256(data).hexdigest()==record['meshSha256']
  parts[part]=record
 result={**metadata,'parts':parts}
 (Path(output)/'cad.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
 return result
