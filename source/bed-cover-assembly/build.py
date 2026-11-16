from pathlib import Path
import json,sys
S=Path(__file__).resolve().parent;D=Path(sys.argv[1])if len(sys.argv)>1 else S.parents[1]/'dist';D.mkdir(parents=True,exist_ok=True)
for name,export in[('data','BED_COVER_DATA'),('source','BED_COVER_SOURCE')]:
 data=json.loads((S/(name+'.json')).read_bytes());(D/('bed-cover-'+name+'.js')).write_text('export const '+export+'='+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf8',newline='\n')
for name in['bed-cover-model.js','bed-cover-plan.js','bed-cover-bare-wires.js']:(D/name).write_bytes((S/name).read_bytes())
