"""Build localized step metadata against the retained official revision.

Localized pages may have different step IDs. Match default_id, never position.
Keep full manual text on the publisher's site; retain titles and factual supplies.
"""
from pathlib import Path
import argparse
import concurrent.futures, html, json, re, urllib.request
from manual_inventory import supplies_for

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'research/i18n'
CACHE.mkdir(parents=True, exist_ok=True)
OUT = ROOT / 'dist/locales'
OUT.mkdir(exist_ok=True)
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--cache-only',action='store_true',help='Fail rather than accessing the network when a source is missing')
args=parser.parse_args()
guidance=json.loads((ROOT/'scripts/step-guidance.json').read_text(encoding='utf8'))
title_overrides=json.loads((ROOT/'scripts/manual-title-overrides.json').read_text(encoding='utf8'))

def extract(raw):
    stream = ''.join(json.loads(m[1]) for m in re.finditer(r'self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)', raw))
    def walk(o):
        if isinstance(o, dict):
            if all(k in o for k in ['guide', 'steps', 'siblings']):
                return {k:o[k] for k in ['guide', 'steps', 'siblings']}
            for v in o.values():
                if found := walk(v): return found
        if isinstance(o, list):
            for v in o:
                if found := walk(v): return found
    for match in re.finditer(r'[0-9a-f]+:(?=[{\[])', stream):
        try: obj = json.JSONDecoder().raw_decode(stream[match.end():])[0]
        except ValueError: continue
        if found := walk(obj): return found
    raise ValueError('Missing structured guide')

def plain(s):
    return html.unescape(re.sub('<[^>]*>', '', s)).strip()

base = json.loads((ROOT/'dist/manual-data.js').read_text(encoding='utf8').split('=',1)[1].strip().rstrip(';'))
jobs = []
for flow, f in base.items():
    for ch in range(len(f['chapters'])):
        steps = [s for s in f['steps'] if s['chapter']==ch]
        slug = steps[0]['source'].split('/guide/')[1].split('#')[0]
        for lang in ['en', 'cs', 'de']:
            jobs.append((lang,flow,ch,slug,steps))

def fetch(job):
    lang, flow, ch, slug, steps = job
    target = CACHE / f'{lang}-{slug}.json'
    if lang=='en': data=json.loads((ROOT/f'research/manual-{slug}.json').read_text(encoding='utf8'))
    elif target.exists(): data=json.loads(target.read_text(encoding='utf8'))
    else:
        if args.cache_only:raise FileNotFoundError(f'Missing retained source: {target}')
        request=urllib.request.Request(f'https://help.prusa3d.com/{lang}/guide/{slug}',headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=40) as response: data=extract(response.read().decode('utf8'))
        target.write_text(json.dumps(data,ensure_ascii=False),encoding='utf8')
    by_id={int(s.get('default_id') or s['id']):s for s in data['steps']}
    result={}
    for s in steps:
        original=by_id.get(s['officialId'])
        if original is None: raise ValueError(f'{lang} {flow} {ch}: missing step {s["officialId"]}')
        url='https://help.prusa3d.com/'+('' if lang=='en' else lang+'/')+'guide/'+data['guide']['slug']+'#'+str(original['id'])
        supplies=supplies_for(original,lang)
        entry=guidance.get(str(s['officialId']),{})
        authored=entry.get('title') or title_overrides.get(str(s['officialId']))
        title=authored[{'en':1,'cs':2,'de':3}[lang]] if authored else plain(original['title'])
        result[str(s['officialId'])]={'title':title,'source':url,'supplies':supplies}
    title=plain(data['guide']['title'])
    title=re.sub(r'^\s*\d+[.\s]+','',title)
    return lang,flow,ch,title,result

packs={lang:{'build':{'chapters':[],'steps':{}},'upgrade':{'chapters':[],'steps':{}}} for lang in ['en','cs','de']}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    for lang,flow,ch,title,steps in executor.map(fetch,jobs):
        f=packs[lang][flow]
        while len(f['chapters'])<=ch:f['chapters'].append('')
        f['chapters'][ch]=title;f['steps'].update(steps)
for lang,pack in packs.items():
    (OUT/f'manual-{lang}.json').write_text(json.dumps(pack,ensure_ascii=False,separators=(',',':')),encoding='utf8')
    print(lang,{f:len(d['steps']) for f,d in pack.items()})
