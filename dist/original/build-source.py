from pathlib import Path
import json
H=Path(__file__).resolve().parent
for source,target,name in [('source-original2251.json','primary.js','ORIGINAL_PRIMARY'),('source-alignment.json','alignment.js','ORIGINAL_ALIGNMENT')]:
 data=json.loads((H/source).read_text(encoding='utf8'))
 (H/target).write_text('export const '+name+'='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
