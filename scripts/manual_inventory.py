"""Map factual inventory rows by official IDs, independent of text length/language."""
from pathlib import Path
import hashlib,html,json,re

manifest=json.loads(Path(__file__).with_name('manual-inventory.json').read_text(encoding='utf8'))

def plain(value):
    return html.unescape(re.sub('<[^>]*>','',value)).strip()

def supplies_for(step,language='en'):
    key=str(step.get('default_id') or step['id'])
    selected=manifest['steps'].get(key,[])
    by_id={int(line.get('default_id') or line['id']):line for line in step.get('lines',[])}
    result=[]
    for line_id in selected:
        if line_id not in by_id:raise ValueError(f'Missing inventory line {language}/{key}/{line_id}')
        label=plain(by_id[line_id]['title'])
        override=manifest.get('overrides',{}).get(language,{}).get(str(line_id))
        if override:
            if label!=override['original']:raise ValueError(f'Inventory correction needs review: {language}/{line_id}')
            label=override['label']
        result.append(label)
    return result

def verification_revision(checks,supplies=None):
    payload={'checks':checks,'supplies':supplies} if supplies is not None else checks
    return hashlib.sha256(json.dumps(payload,ensure_ascii=False).encode('utf8')).hexdigest()[:16]
