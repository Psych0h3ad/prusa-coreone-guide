"""Index official photo galleries and verified Japanese step anchors.

Keep the full instructions on Prusa's site. No manual prose or image binaries
are copied into the deployment. Match localized steps by default_id.
"""
from pathlib import Path
import argparse, concurrent.futures, json, re, urllib.request

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--cache-only', action='store_true')
args = parser.parse_args()

def extract(raw):
    stream = ''.join(json.loads(m[1]) for m in re.finditer(r'self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)', raw))
    def walk(obj):
        if isinstance(obj, dict):
            if all(k in obj for k in ('guide', 'steps', 'siblings')):
                return {k: obj[k] for k in ('guide', 'steps', 'siblings')}
            for value in obj.values():
                if found := walk(value): return found
        if isinstance(obj, list):
            for value in obj:
                if found := walk(value): return found
    for match in re.finditer(r'[0-9a-f]+:(?=[{\[])', stream):
        try: obj = json.JSONDecoder().raw_decode(stream[match.end():])[0]
        except ValueError: continue
        if found := walk(obj): return found
    raise ValueError('Missing structured guide')

base = json.loads((ROOT/'dist/manual-data.js').read_text(encoding='utf8').split('=', 1)[1].strip().rstrip(';'))
jobs = [(flow, ch, [s for s in f['steps'] if s['chapter'] == ch]) for flow, f in base.items() for ch in range(len(f['chapters']))]
cache = ROOT/'research/i18n'
cache.mkdir(exist_ok=True, parents=True)
out = ROOT/'dist/assets/manual-reference'
out.mkdir(exist_ok=True, parents=True)

def build(job):
    flow, ch, steps = job
    slug = steps[0]['source'].split('/guide/')[1].split('#')[0]
    original = json.loads((ROOT/f'research/manual-{slug}.json').read_text(encoding='utf8'))
    target = cache/f'ja-{slug}.json'
    if target.exists(): ja = json.loads(target.read_text(encoding='utf8'))
    else:
        if args.cache_only: raise FileNotFoundError(target)
        retained = ROOT/'research/official-reference-ja.html'
        if slug == '3-back-assembly_982260' and retained.exists():
            ja = extract(retained.read_text(encoding='utf8'))
        else:
            req = urllib.request.Request(f'https://help.prusa3d.com/ja/guide/{slug}', headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=40) as response: ja = extract(response.read().decode('utf8'))
        target.write_text(json.dumps(ja, ensure_ascii=False), encoding='utf8')
    by_id = {int(s.get('default_id') or s['id']): s for s in original['steps']}
    ja_id = {int(s.get('default_id') or s['id']): s for s in ja['steps']}
    result, sources = {}, {}
    for step in steps:
        ident = step['officialId']
        official = by_id[ident]
        translated = ja_id[ident]
        sources[str(ident)] = 'https://help.prusa3d.com/ja/guide/'+ja['guide']['slug']+'#'+str(translated['id'])
        photos = []
        for item in (official.get('media') or {}).get('gallery', []):
            painted = item.get('child') or item
            if not painted.get('original'): continue
            photo = {'id': painted['id'], 'url': painted['original'], 'preview': painted.get('large') or painted['original'], 'thumbnail': painted.get('thumbnail') or painted['original']}
            size = (painted.get('resolution') or {}).get('original') or {}
            photo.update({k: size[k] for k in ('width', 'height') if isinstance(size.get(k), int)})
            if item.get('child') and item.get('original'): photo['plain'] = item['original']
            if not any(p['id'] == photo['id'] for p in photos): photos.append(photo)
        result[str(ident)] = {'photos': photos}
    (out/f'{flow}-{ch}.json').write_text(json.dumps({'steps': result}, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
    return sources, len(result), sum(len(s['photos']) for s in result.values())

sources, step_count, photo_count = {}, 0, 0
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
    for source, steps, photos in executor.map(build, jobs):
        sources.update(source); step_count += steps; photo_count += photos
(ROOT/'dist/manual-ja-sources.js').write_text('export const JAPANESE_SOURCES='+json.dumps(sources, ensure_ascii=False, separators=(',', ':'))+';\n', encoding='utf8')
print(json.dumps({'chapters': len(jobs), 'steps': step_count, 'photos': photo_count, 'verifiedJapaneseAnchors': len(sources)}))
