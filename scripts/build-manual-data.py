"""Build an ID-preserving index; original instructions remain in the official manual."""
import argparse,json,re,html
from urllib.parse import urlparse
from manual_inventory import manifest as inventory_manifest,supplies_for,verification_revision
from pathlib import Path
root=Path(__file__).resolve().parents[1]
titles=json.loads((root/'scripts/manual-titles.json').read_text(encoding='utf8'))
notes=json.loads((root/'scripts/step-notes.json').read_text(encoding='utf8'))
guidance=json.loads((root/'scripts/step-guidance.json').read_text(encoding='utf8'))
index=json.loads((root/'research/manual-index.json').read_text(encoding='utf8'))[:9]
sensor=['sensorBody','sensorLever','sensorSwitch','sensorCover']

def plain(s):return html.unescape(re.sub('<[^>]*>','',s)).strip()
def groups(ch,n):
    if ch==0:return []
    if ch==1:return ['zDrive','base'] if n<=10 else ['feet'] if 16<=n<=17 else ['base']
    if ch==2:
        if n<=5:return ['psu']
        if n==7:return ['electronics','xBuddy','xBuddyExtension']
        if n==8:return ['xBuddy','thermalPads']
        if n==9:return ['xBuddy','electronics']
        if n==10:return ['xBuddyExtension','electronics']
        if n<=16:return ['electronics']
        if n<=19:return ['back']
        if n<=21:return ['psu','back']
        if n<=23:return ['electronics','back']
        if n<=27:return ['psu','covers']
        if n<=32:return ['fans']
        if n<=35:return ['back']
        return ['electronics','psu','covers']
    if ch==3:return ['heatbed'] if n<=6 or n>=22 else ['bedSupport']
    if ch==4:return ['gantry'] if 32<=n<=37 else ['xy','gantry'] if n>=74 else ['xy']
    if ch==5:return ['fan'] if 44<=n<=46 else ['ventLever','head'] if n>=53 else ['head']
    if ch==6:
        if n<=11:return ['frame']
        if n<=14:return ['sensorBody','sensorLever']
        if n==15:return ['sensorBody','sensorLever','sensorSwitch']
        if n<=18:return ['sensorBody']
        if n==19:return sensor
        if n<=23:return sensor
        if n<=33:return ['electronics','covers']
        if n==34:return ['covers','filter']
        if n<=36:return ['sideRight','puck']
        if n<=39:return ['handleRight']
        if n==40:return ['sideRight','handleRight','puck']
        return ['sideLeft','handleLeft']
    if ch==7:
        if n<=8:return ['top','grille','ventBlock']
        if n<=12:return ['windowLeft'] if n==11 else ['windowRight'] if n==12 else ['windowLeft','windowRight']
        if n<=23:return ['lcd']
        return ['door']
    if ch==8:return ['xy','gantry'] if n==1 else ['sheet','spoolNew'] if n<=3 else ['electronics','lcd'] if n<=8 else ['head','sensorBody','door'] if n<=13 else []

build_installs={
 (1,10):['zDrive'],(1,17):['feet'],(1,18):['base'],
 (2,21):['psu'],(2,23):['electronics'],(2,27):['covers'],(2,31):['fans'],(2,35):['back'],
 (3,29):['bedSupport','heatbed'],(4,74):['xy','gantry'],(5,23):['head'],(5,46):['fan'],(5,55):['ventLever'],
 (6,4):['frame'],(6,21):sensor,(6,34):['filter'],(6,36):['puck'],(6,39):['handleRight'],(6,40):['sideRight'],(6,42):['sideLeft','handleLeft'],
 (7,8):['top','grille','ventBlock'],(7,11):['windowLeft'],(7,12):['windowRight'],(7,22):['lcd'],(7,40):['door'],(8,3):['sheet','spoolNew']}
upgrade_groups={1:['top','grille'],2:['handleRight'],3:['sideRight'],4:['spoolOld'],5:['puck','spoolNew'],6:['puck'],7:['spoolNew'],8:['sensorOld'],9:['sensorOld'],10:['sensorOld'],11:['sensorOld'],12:sensor,13:['sensorBody','sensorLever'],14:['sensorLever'],15:['sensorSwitch','sensorLever'],16:['electronics'],17:['sensorBody'],18:['sensorCover'],19:sensor,20:['handleRight'],21:sensor+['handleRight'],22:['sideRight'],23:['ventLever'],24:['coverOld','ventLever'],25:['top','grille'],26:['ventBlock'],27:['top'],28:['top','grille'],29:['ventBlock','grille'],30:['top','grille','ventBlock']}
upgrade_installs={6:['puck'],7:['spoolNew'],19:sensor,21:['handleRight'],22:['sideRight'],24:['ventLever'],30:['top','grille','ventBlock']}
upgrade_removes={1:['top','grille'],2:['handleRight'],3:['sideRight'],4:['spoolOld'],8:['sensorOld'],24:['coverOld']}

def kind(title):
    t=title.lower()
    if any(w in t for w in ['parts preparation','part preparation','tools necessary','tool necessary','tools required']):return 'prepare'
    if any(w in t for w in ['connecting','wiring','cable info','guiding','plugging','guidance']):return 'connect'
    if any(w in t for w in ['removal','disassembly','removing']):return 'remove'
    if any(w in t for w in ['checking','testing','test','calibration','alignment','tensioning']):return 'check'
    if any(w in t for w in ['install','assembl','mount','secur','attach','covering','insert','tighten','lubricat','applying','sticking']):return 'install'
    return 'info'

def tools_for(data):
    steps=[s for s in data['steps'] if 'tool' in s['title'].lower()][:1]
    result=[]
    for s in steps:
        for l in s.get('lines',[]):
            t=plain(l['title'])
            if len(t)<70 and re.search(r'key|wrench|plier|screwdriver|Unikey|cutters',t,re.I) and not re.search('please|chapter|included|following|tools',t,re.I):
                t=re.sub(r'\s*Allen key', ' 六角レンチ',t,flags=re.I).replace('torx key / T10 torx screwdriver','トルクス').replace('Torx key / Screwdriver','トルクス').replace('Needle-nose pliers','ラジオペンチ').replace('Wrench','レンチ')
                result.append(t)
    return result[:7]

def make_step(data,ch,n,title,flow):
    original=data['steps'][n-1];k=kind(original['title']);desc=notes.get(flow,{}).get(f'{ch}.{n}','');tip=''
    if not desc and k=='prepare':desc='この手順で使用する部品・工具を用意してください。'
    parts=groups(ch,n) if flow=='build' else (upgrade_groups[n] if ch==1 else ['sensorBody','spoolNew','ventLever'] if ch==0 and n<=2 else ['heatbed'] if ch==0 and n==5 else ['electronics'] if ch==0 and n==6 else ['lcd','sensorBody','ventBlock'] if ch==2 else [])
    photo=next(iter(original.get('media',{}).get('gallery',[])),{})
    photo_url=photo.get('large') or photo.get('original')
    if not isinstance(photo_url,str):photo_url=None
    supplies=supplies_for(original)
    step={'chapter':ch,'officialStep':n,'officialId':original['id'],'chapterSteps':len(data['steps']),'title':title,'description':desc,'parts':parts,'tip':tip,'kind':k,'time':1,'tools':tools_for(data) if k=='prepare' and 'tool' in original['title'].lower() else [],'source':'https://help.prusa3d.com/guide/'+data['guide']['slug']+'#'+str(original['id']),'checks':['作業内容と注意事項を確認した'],'supplies':supplies}
    if photo_url:step['photo']=photo_url
    if flow=='build':
        step['reveal']=parts
        step['add']=build_installs.get((ch,n),[])
        if ch==0:step['fullContext']=True
        if ch==7 and n in [38,39]:step['variant']='screw'
        if ch==7 and n in [41,42]:step['variant']='glued'
        if ch==7 and 37<=n<=42:step['chooseVariant']=True;step['tip']='ネジ固定式と接着式では手順が分かれます。キットの部品に合う方式を選んでください。'
    else:
        step['add']=upgrade_installs.get(n,[]) if ch==1 else []
        step['remove']=upgrade_removes.get(n,[]) if ch==1 else []
        step['reveal']=[]
        if ch==1:
            if n==12:step['reveal']=sensor
            if 9<=n<=11:step['previewParts']=['sensorOld']
            if n==23:step['reveal']=['ventLever']
            if 25<=n<=29:step['previewParts']=['top','grille']
            if n>=26:step['reveal']=['ventBlock']
        if ch==0 and n==4:step['tip']='フィラメントのアンロードとスプールの取り外しを、電源を切る前に行います。'
        if ch==0 and n==5:step['tip']='公式手順ではZ位置を100 mm以上に下げてから、冷却と電源切断に進みます。'
        if ch==0 and n==6:step['tip']='室温まで冷えたことを確認し、背面スイッチを切って電源コードを抜きます。';step['checks']=['冷却・電源切断・電源コード取り外しの順を公式手順で確認した']
        if ch==1 and n==14:step['tip']='レバーが引っかからずに戻ることを確認します。締め付けの調整は公式の同じ手順を参照してください。'
        if ch==1 and n==15:step['tip']='2つの磁石が反発する向きかを確認します。極性の確認方法は公式手順を参照してください。'
        if ch==1 and n==16:step['tip']='この機種の配線色には注意が必要です。接続は公式手順のピン表示と写真で照合してください。'
        if ch==1 and n==29:step['tip']='ベントが開閉できる締め方と、ブロックが開口をふさがない向きを公式写真で確認します。'
        if ch==2:step['fullContext']=True
    if not parts:step['tools']=[]
    if n==1 and ch==0:step['overview']=True;step['action']='組み立てを開始' if flow=='build' else 'アップグレードを開始'
    if re.search('haribo|done|handbook|feedback|knowledge base|printables',original['title'],re.I):step['kind']='info';step['checks']=['この手順の案内を確認した']
    if re.search('side|sensor|spool|puck|handle',original['title'],re.I) and (flow=='upgrade' or ch==6):step['view']='right'
    if flow=='build' and ch==2:step['view']='back'
    if re.search('top cover|vent block',original['title'],re.I):step['view']='top'
    step['parts']=list(dict.fromkeys(step['parts']+step.get('add',[])+step.get('remove',[])))
    return step

flows={}
for flow,chapters,labels in [('build',index,['はじめに','ベースの組み立て','背面の組み立て','ヒートベッド','CoreXYユニット','Nextruder','外装と電子部品','ドアとxLCD','校正と初回起動']),('upgrade',[{'slug':s} for s in ['1-introduction_1014609','2-printer-upgrade_1014628','3-final-setup_1014620']],['はじめに','プリンターのアップグレード','最終セットアップ'])]:
    f={'title':'CORE One+ 組み立て' if flow=='build' else 'CORE One → CORE One+','guide':'組み立てガイド' if flow=='build' else 'アップグレードガイド','revision':'1.02' if flow=='build' else '1.00','manual':'https://help.prusa3d.com/'+('manual/prusa-core-one-kit-assembly_2321' if flow=='build' else 'manual/prusa-core-one-to-core-one-upgrade_2338'),'chapters':labels,'steps':[]}
    for ch,entry in enumerate(chapters):
        slug=entry['slug'];data=json.loads((root/f'research/manual-{slug}.json').read_text(encoding='utf8'));ja=titles[slug].split('|');assert len(ja)==len(data['steps']),(slug,len(ja),len(data['steps']))
        expected=next(d for d in data['siblings'] if d['slug']==slug)['steps']
        assert [s['id'] for s in expected]==[s['id'] for s in data['steps']],'Manual index order must match actual chapter order'
        f['steps'] += [make_step(data,ch,n+1,title,flow) for n,title in enumerate(ja)]
    f['steps'][-1]['final']=True
    flows[flow]=f
for step in flows['build']['steps']:
    if step['chapter']==2 and step['officialStep'] in [36,38,39]:
        step['parts']=['stepperSplitter']+(['splitterPlugJ6','splitterPlugJ7','splitterPlugJ1','splitterPlugJ5','splitterWires'] if step['officialStep']!=36 else [])
        step['reveal']=step['parts']
        step['add']=['stepperSplitter'] if step['officialStep']==39 else []
for step in flows['build']['steps']:
    if step['chapter']==2 and step['officialStep'] in [41,48]:
        step['parts']=list(dict.fromkeys(step['parts']+['splitterZRPlug','splitterWires']))
for step in flows['build']['steps']:
    if step['chapter']==2 and step['officialStep'] in [47,48]:
        step['parts']=list(dict.fromkeys(step['parts']+['feGroundRing','feGroundWire','feGroundWasher','feGroundScrew']))
by_id={str(s['officialId']):s for f in flows.values() for s in f['steps']}
for official_id,entry in guidance.items():
    if 'sameAs' in entry:entry=guidance[entry['sameAs']]
    assert official_id in by_id,f'Guidance refers to unknown official step {official_id}'
    assert len(entry['description'])==4 and all(isinstance(v,str) and v.strip() for v in entry['description'])
    assert entry['checks'] and all(len(c)==4 and all(isinstance(v,str) and v.strip() for v in c) for c in entry['checks'])
    step=by_id[official_id]
    if 'title' in entry:
        assert len(entry['title'])==4 and all(isinstance(v,str) and v.strip() for v in entry['title'])
        step['title']=entry['title'][0]
    step['description']=entry['description'][0]
    step['checks']=[c[0] for c in entry['checks']]
    step['verificationRevision']=verification_revision(step['checks'])
    if 'references' in entry:
        step['references']=[]
        for reference in entry['references']:
            assert len(reference['label'])==4 and all(isinstance(v,str) and v.strip() for v in reference['label'])
            url=urlparse(reference['url'])
            assert url.scheme=='https' and ((url.netloc=='help.prusa3d.com' and url.path.startswith(('/article/','/guide/'))) or (url.netloc=='belt.connect.prusa3d.com' and url.path=='/' and not url.query and not url.fragment))
            step['references'].append({'label':reference['label'][0],'url':reference['url']})
for official_id in inventory_manifest['steps']:
    step=by_id[official_id]
    if official_id not in guidance:step['checks']=['部品表の種類と数量を確認し、必要な部品を用意した']
    step['verificationRevision']=verification_revision(step['checks'],step['supplies'])
# Presentation labels follow the source-based verification revision: changing a
# translation must not invalidate an unchanged assembly check or saved progress.
ja_labels=json.loads((root/'scripts/inventory-ja.json').read_text(encoding='utf8'))
for step in by_id.values():
    for field in ('supplies','tools'):
        step[field]=[ja_labels[field][label] for label in step[field]]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output',type=Path,default=root/'dist/manual-data.js')
output=parser.parse_args().output
output.write_text('export const FLOWS='+json.dumps(flows,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print(json.dumps({k:len(v['steps']) for k,v in flows.items()}))
