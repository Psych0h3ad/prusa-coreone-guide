"""Read the public manual's structured chapter and step index."""
from pathlib import Path
import concurrent.futures, json, re, urllib.request, time
root=Path(__file__).resolve().parents[1]
research=root/'research'
index=json.loads((research/'manual-index.json').read_text(encoding='utf8'))[:9]
urls=[d['slug'] for d in index]+['2-printer-upgrade_1014628']

def extract(html):
    stream=''.join(json.loads(m[1]) for m in re.finditer(r'self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)',html))
    def walk(o):
        if isinstance(o,dict):
            if 'siblings' in o and 'guide' in o and 'steps' in o:return o
            for v in o.values():
                r=walk(v)
                if r:return r
        if isinstance(o,list):
            for v in o:
                r=walk(v)
                if r:return r
    for m in re.finditer(r'[0-9a-f]+:(?=[{\[])',stream):
        try:o=json.JSONDecoder().raw_decode(stream[m.end():])[0]
        except ValueError:continue
        found=walk(o)
        if found:return {k:found[k] for k in ['guide','steps','siblings','categories']}
    raise ValueError('No structured chapter data')

def fetch(slug):
    target=research/f'manual-{slug}.json'
    if target.exists():return json.loads(target.read_text(encoding='utf8'))
    cached=research/f'raw-{slug}.html'
    if cached.exists():
        data=extract(cached.read_text(encoding='utf8'));target.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8');return data
    for attempt in range(3):
        try:
            req=urllib.request.Request('https://help.prusa3d.com/guide/'+slug,headers={'User-Agent':'Mozilla/5.0'})
            html=urllib.request.urlopen(req,timeout=40).read().decode('utf8')
            data=extract(html);target.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
            return data
        except Exception:
            if attempt==2:raise
            time.sleep(1)

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    chapters=list(executor.map(fetch,urls))
upgrade_index=chapters[-1]['siblings']
for d in upgrade_index:
    if d['title']!='Manual changelog' and d['slug'] not in urls:chapters.append(fetch(d['slug']))
print(json.dumps([{'slug':d['guide']['slug'],'steps':len(d['steps'])} for d in chapters]))
