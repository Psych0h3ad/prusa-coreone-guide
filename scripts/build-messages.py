from pathlib import Path
import argparse
import json
import re
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Build the shared translations from authored sources and retained manual titles.')
parser.add_argument('--output',type=Path,default=root/'dist/locales/messages.json')
output=parser.parse_args().output
messages={}
for path in sorted((root/'scripts').glob('localization*.tsv')):
    for i,line in enumerate(path.read_text(encoding='utf8').splitlines(),1):
        if not line.strip() or line.startswith('#'): continue
        cells=line.split('\t')
        if len(cells)!=4: raise ValueError(f'{path.name}:{i}: expected four columns')
        source,*values=cells
        if source in messages: raise ValueError(f'Duplicate translation: {source}')
        if any(not value for value in values): raise ValueError(f'Empty translation: {source}')
        names=lambda value: sorted(re.findall(r'\{(\w+)\}',value))
        if any(names(value)!=names(source) for value in values): raise ValueError(f'Changed placeholders: {source}')
        messages[source]=values
guidance=json.loads((root/'scripts/step-guidance.json').read_text(encoding='utf8'))
for entry in guidance.values():
    if 'sameAs' in entry:continue
    for source,*values in ([entry['title']] if 'title' in entry else [])+[entry['description'],*entry['checks']]+[r['label'] for r in entry.get('references',[])]:
        if len(values)!=3 or not all(isinstance(v,str) and v.strip() for v in [source,*values]):
            raise ValueError('Incomplete step guidance translation')
        if source in messages and messages[source]!=values:
            raise ValueError(f'Conflicting step guidance translation: {source}')
        messages[source]=values
base=json.loads((root/'dist/manual-data.js').read_text(encoding='utf8').split('=',1)[1].strip().rstrip(';'))
packs=[json.loads((root/f'dist/locales/manual-{lang}.json').read_text(encoding='utf8')) for lang in ['en','cs','de']]
for flow,f in base.items():
    for step in f['steps']:
        messages.setdefault(step['title'],[pack[flow]['steps'][str(step['officialId'])]['title'] for pack in packs])
    for i,title in enumerate(f['chapters']):
        messages.setdefault(title,[pack[flow]['chapters'][i] for pack in packs])
additions_path=root/'scripts/localization-additions.json'
if additions_path.exists():
    additions=json.loads(additions_path.read_text(encoding='utf8'))
    authored_guidance={source for entry in guidance.values() if 'sameAs' not in entry for source,*_ in ([entry['title']] if 'title' in entry else [])+[entry['description'],*entry['checks']]}
    for source,values in additions.items():
        if len(values)!=3 or not all(isinstance(v,str) and v.strip() for v in [source,*values]):raise ValueError('Incomplete supplemental translation')
        variables=lambda value:sorted(re.findall(r'\{(\w+)\}',value))
        if any(variables(value)!=variables(source)for value in values):raise ValueError('Changed supplemental placeholders: '+source)
        if source in authored_guidance and messages[source]!=values:raise ValueError('Supplemental translation conflicts with step guidance: '+source)
        messages[source]=values
output.write_text(json.dumps(messages,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(f'{len(messages)} messages in English, Czech and German')
