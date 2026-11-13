"""Bind official guide step IDs to source CAD nodes. Coordinates stay in the CAD frame."""
import argparse,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
flows=json.loads((root/'dist/manual-data.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
plans={'build':{},'upgrade':{}}
def entry(flow,ch,n,workspace='printer',seed=(),actors=(),note='',focus=(),context_from=()):
    s=next(s for s in flows[flow]['steps'] if s['chapter']==ch-1 and s['officialStep']==n)
    plans[flow][str(s['officialId'])]={'workspace':workspace,'seed':list(seed),'actors':list(actors),'note':note,'focus':list(focus),'contextFrom':list(context_from)}
def a(refs,label,axis=(0,0,1),**kw):return dict(refs=list(refs),label=label,axis=list(axis),**kw)
def unit(scope,label,axis=(0,0,1),**kw):return dict(scope=scope,label=label,axis=list(axis),**kw)
def ranges(flow,ch,rows):
    for lo,hi,scope in rows:
        for n in range(lo,hi+1):entry(flow,ch,n,scope)
def put(ch,n,workspace='printer',seed=(),actors=(),note='',focus=(),context_from=()):entry('build',ch,n,workspace,seed,actors,note,focus,context_from)
def up(n,workspace='printer',seed=(),actors=(),note='',focus=()):entry('upgrade',2,n,workspace,seed,actors,note,focus)
SENSOR=['sensorBody','sensorLever','sensorSwitch','sensorCover','sensorBall','sensorLeverMagnet','sensorSwitchMagnet','sensorIR','sensorLeverWasher','sensorLeverScrew','sensorCoverScrewLeft','sensorCoverScrewRight','sensorMountNutLeft','sensorMountNutRight']
MAIN_HOLES=[[-54.20276,165.45172,162.64597],[-134.20276,165.45172,162.64597],[-54.20276,165.45172,88.64597],[-134.20276,165.45172,99.64597],[-78.20276,165.45172,33.64597]]
EXT_HOLES=[[x,165.43632,z] for x in [-54.20276,-134.20276] for z in [206.64597,173.64597]]
FAN_MOUNTS=[[[x,205.29972,z] for x in xs for z in [361.74601,411.74601]] for xs in [[6.5006,56.5006],[-57.4994,-7.4994]]]
GRID_SCREWS=[[x,178.29973,z] for x,z in [(-57.4994,361.74601),(-7.4994,411.74601),(6.5006,411.74601),(56.5006,361.74601)]]
# The base plate and the bottom frame are separate workpieces until 2.18.
ranges('build',2,[(2,5,'base'),(6,6,'motors'),(7,10,'base'),(11,17,'bottom')])
put(2,2,'base',[306]);put(2,6,'motors',[311,366,367],[
 a([310,364,365],'モーターワッシャー'),a([309,362,363],'Zモーターマウント'),a([338,340,342,344,346,348,350,352,354,356,358,360],'モーターマウントの固定ネジ')])
put(2,7,'base',actors=[a([306]+[f'base{side}{i}' for side in ['L','R'] for i in range(1,4)],'底板を裏返し、折り曲げ部を下に向ける',(1,0,0),handling=True,focusMotion=True,motionPivot=[0,0,-1],posePath=[{'offset':[0,0,10],'rotation':[180,0,0]},{'offset':[0,0,80],'rotation':[90,0,0]},{'offset':[0,0,0],'rotation':[0,0,0]}]),unit('motors','ロッドを下から通し、モーターを底板の下に合わせる',(0,0,-1),focusMotion=True)],note='底板を裏返します。ロッドを上に、モーター本体を底板の下に向けます。モーターのケーブルは公式写真の向きに合わせてください。')
put(2,8,'base',actors=[a([330,332,334,336],'後部モーターの固定ネジ',(0,0,-1))])
put(2,9,'base',actors=[a([368],'右Zロッドマウント'),a([322,324,326,328],'右モーターの固定ネジ',(0,0,-1))])
put(2,10,'base',actors=[a([312],'左Zロッドマウント'),a([314,316,318,320],'左モーターの固定ネジ',(0,0,-1))])
put(2,11,'bottom',[2]);put(2,12,'bottom',actors=[a([23],'左側のユニバーサルプロファイル',(-1,0,0))])
put(2,13,'bottom',actors=[a([15],'底面の後部プロファイル',(0,1,0))]);put(2,14,'bottom',actors=[a([20],'右側のユニバーサルプロファイル',(1,0,0))])
put(2,17,'bottom',actors=[a([262],'防振フット 1',(0,0,-1)),a([265],'防振フット 2',(0,0,-1)),a([268],'防振フット 3',(0,0,-1)),a([271],'防振フット 4',(0,0,-1))])
put(2,18,'printer',actors=[unit('base','底板とZモーター')],context_from=['bottom'])
# Subassemblies on the bench; no PSU or rear profiles in the chapter's tool step.
ranges('build',3,[(2,5,'psu'),(6,16,'electronics'),(17,33,'back')])
put(3,2,'psu',[207]);put(3,3,'psu',note='電源の仮止めネジは公式写真で位置を確認してください。')
put(3,6,'electronics',[167])
put(3,8,'board-prep',['xBuddy'],actors=[a(['thermalPads'],'サーマルパッド3枚',(0,-1,0))],note='基板の端を持って裏返し、白と青の保護フィルムを剥がします。位置は公式写真のマーキングと照合してください。')
put(3,9,'electronics',actors=[unit('board-prep','xBuddy基板：Ethernet端子を開口に合わせる',(0,1,0),anchors=MAIN_HOLES),a([179,181,183,185,187],'M3x6ネジ5本：右下の穴は空けておく',(0,1,0),anchors=MAIN_HOLES)],note='最初はネジを数回転だけ入れます。位置が合ったら、5本を慎重に締めてください。右下の穴にはネジを入れません。')
put(3,10,'electronics',actors=[a(['xBuddyExtension'],'xBuddy拡張基板：4か所の穴を支柱に合わせる',(0,1,0),anchors=EXT_HOLES),a([171,173,175,177],'M3x6ネジ4本',(0,1,0),anchors=EXT_HOLES)],note='向きに注意してください。拡張基板はxBuddy基板の上に取り付けます。')
put(3,16,'electronics',actors=[a([169],'Wi-Fiカバー',(0,1,0))],note='Wi-Fiモジュールと配線の接続は公式写真で確認してください。')
put(3,17,'back',[53]);put(3,20,'back',actors=[unit('psu','電源ユニット',(0,1,0),seat=[0,0,8])])
put(3,21,'back',note='キーホールの細い側へずらし、仮止めしたネジを締めます。',actors=[a([207],'電源ユニットをキーホールに固定',(0,0,1),distance=8)])
put(3,22,'back',actors=[unit('electronics','xBuddyボックス',(0,1,0),seat=[0,0,8])])
put(3,23,'back',actors=[a([167,169,171,173,175,177,179,181,183,185,187,'xBuddy','xBuddyExtension','thermalPads'],'xBuddyボックスをキーホールに固定',(0,0,1),distance=8)])
put(3,26,'psu-cover',[237],note='ナットの挿入位置は公式写真で確認してください。')
put(3,27,'back',actors=[unit('psu-cover','電源ケーブルカバー',(0,1,0))])
put(3,31,'back',actors=[a([70],'チャンバーファン 1',(0,-1,0),anchors=FAN_MOUNTS[0]),a([72],'チャンバーファン 2',(0,-1,0),anchors=FAN_MOUNTS[1])],focus=[70,72],note='背面パネルを裏返し、ハニカムの開口が見える面を上にします。ラベルのない側を上にして置き、ケーブルを中央の角から出してください。')
put(3,32,'back',actors=[a([71],'ファングリッド',(0,-1,0),anchors=GRID_SCREWS),a([138,140,142,144],'ファングリッドのネジ',(0,-1,0),anchors=GRID_SCREWS)])
put(3,34,'printer',actors=[a([35],'右後部プロファイル'),a([39],'左後部プロファイル')])
put(3,35,'printer',actors=[unit('back','背面パネル・電源・xBuddy',(0,1,0))])
put(3,50,'printer',note='保護接地線の接続は公式写真と端子表示で照合してください。',focus=[207])
# Bed: build the carrier independently, then lower the assembly over the Z screws.
ranges('build',4,[(2,6,'heatbed'),(7,14,'carrier'),(15,19,'mounts'),(20,27,'carrier')])
put(4,2,'heatbed',[659]);put(4,6,'heatbed',actors=[a([780],'ベッドケーブル下カバー',(0,1,0))])
put(4,7,'carrier',[638]);put(4,8,'carrier',actors=[a([706,708,710,712,714,716,718,720],'キャリアのM3x4rネジ')])
put(4,11,'carrier',actors=[a([664],'RGB LEDストリップ',(0,-1,0))]);put(4,12,'carrier',actors=[a([668,667,784],'LEDディフューザーとスペーサー',(0,-1,0))])
put(4,13,'carrier',actors=[a([662],'LEDステータスカバー',(0,-1,0)),a([740,742],'カバーの固定ネジ',(0,-1,0))])
put(4,15,'mounts',[636,637]);put(4,19,'rear-spacer',[639])
put(4,20,'carrier',actors=[a([636],'右ベッドマウント',(1,0,0))]);put(4,21,'carrier',actors=[a([637],'左ベッドマウント',(-1,0,0))])
put(4,23,'carrier',[657],actors=[unit('heatbed','ヒートベッド'),a([722,724,726,728,730,732,734,736,738],'ヒートベッドの固定ネジ')])
put(4,27,'carrier',actors=[a([786],'ベッドケーブル上カバー',(0,1,0))])
put(4,29,'printer',actors=[unit('rear-spacer','後部ベッドスペーサー'),unit('carrier','ヒートベッドアセンブリ')])
put(4,30,actors=[a([783],'後部の台形ナット')]);put(4,31,actors=[a([640],'左前の台形ナット')]);put(4,32,actors=[a([782],'右前の台形ナット')])
# CoreXY workpieces remain together, instead of being scattered above the printer.
ranges('build',5,[(2,4,'rod-holders'),(5,14,'xy'),(15,20,'motor-mounts'),(21,26,'tensioners'),(27,31,'xy'),(32,35,'rail'),(36,40,'xy'),(41,43,'xy-motors'),(44,72,'xy')])
put(5,2,'rod-holders',[374,375,376,565]);put(5,5,'xy',[371],actors=[a([374],'左前ロッドホルダー'),a([375],'右前ロッドホルダー')])
put(5,7,'carriages',[401,403]);put(5,8,'left-holder',[378],actors=[a([401],'左XYキャリッジ',(-1,0,0))]);put(5,9,'right-holder',[379],actors=[a([403],'右XYキャリッジ',(1,0,0))])
put(5,10,'xy',actors=[unit('left-holder','左リニアホルダー'),unit('right-holder','右リニアホルダー')])
put(5,12,'xy',actors=[a([377,376],'左スムースロッドと後部ホルダー',(0,1,0)),a([566,565],'右スムースロッドと後部ホルダー',(0,1,0))])
put(5,17,'right-mount',[559]);put(5,19,'left-mount',[386]);put(5,23,'tensioners',[405,568])
put(5,18,'right-mount');put(5,20,'left-mount');put(5,25,'left-tensioner')
put(5,24,'left-tensioner',[405],actors=[a([397],'左ベルトテンショナー',(0,-1,0))]);put(5,26,'right-tensioner',[568],actors=[a([396],'右ベルトテンショナー',(0,-1,0))])
put(5,28,'xy',actors=[unit('left-mount','左モーターマウント',(0,0,-1))]);put(5,29,'xy',actors=[unit('right-mount','右モーターマウント',(0,0,-1))])
put(5,30,'xy',actors=[unit('left-tensioner','左ベルトテンショナー',(0,0,-1))]);put(5,31,'xy',actors=[unit('right-tensioner','右ベルトテンショナー',(0,0,-1))])
put(5,32,'rail',[380]);put(5,33,'rail',actors=[a([382],'リニアレール',(0,-1,0))]);put(5,36,'xy',actors=[unit('rail','リニアレールアセンブリ',(0,-1,0))])
put(5,39,'bed-stop',[385]);put(5,40,'xy',actors=[unit('bed-stop','後部ベッドストップ',(0,0,-1))])
put(5,42,'motor-x',[387],actors=[a([388],'X軸プーリー')]);put(5,43,'motor-y',[567],actors=[a([392],'Y軸プーリー')])
put(5,47,'xy',actors=[unit('motor-y','Y軸モーター',(0,0,-1))]);put(5,53,'xy',actors=[unit('motor-x','X軸モーター',(0,0,-1))])
put(5,60,'xy',actors=[a([829],'Nextruderホルダー',(0,-1,0))]);put(5,63,'xy',actors=[a([560],'Bowdenガイド')]);put(5,66,'xy',actors=[a([406],'白色LEDホルダー',(0,-1,0))])
put(5,74,'printer',actors=[a([313],'左Zスムースロッド'),a([369],'右Zスムースロッド'),unit('xy','CoreXYアセンブリ')])
# Nextruder: some purchased internals are absent in the official assembly CAD.
ranges('build',6,[(2,3,'idler'),(4,20,'head'),(27,33,'loveboard'),(34,37,'arm'),(44,45,'fan')])
put(6,3,'idler',[796],actors=[a([793,797],'アイドラーのスペーサーとレバーB',(1,0,0))])
put(6,6,'head',[790],actors=[a([792],'モーター軸のシム',(0,-1,0)),a([794],'ヒートシンク',(0,-1,0))])
put(6,11,'head',actors=[unit('idler','Nextruderアイドラー',(1,0,0)),a([800],'アイドラーの止めネジ',(1,0,0))])
put(6,14,'head',actors=[a([816],'ギアボックスのフロントケース',(0,-1,0)),a([804,813,814],'M3x25の3本を仮止めする。本締めは最後の校正時',(0,-1,0))])
put(6,16,'swivel',[798],actors=[a([808,802,801],'アイドラースイベル',(1,0,0))]);put(6,17,'swivel',actors=[a([799,810,809],'アイドラーナット',(1,0,0))])
put(6,18,'head',actors=[unit('swivel','アイドラースイベルアセンブリ',(0,-1,0)),a([805,815],'スプリングを通したネジ',(0,-1,0))])
put(6,20,'head',actors=[a([806],'NTCサーミスター',(0,1,0)),a([811],'T6の短い側を指2本で持ち、NTCの止めネジを締める',(1,0,0))])
put(6,23,'printer',actors=[a([830,831,832],'Nextruderスペーサー',(0,-1,0)),unit('head','Nextruder',(0,-1,0)),a([823,825,827],'Nextruderの固定ネジ',(0,-1,0))],focus=[788,829])
put(6,25,actors=[a([791],'ヒートシンクファン',(-1,0,0)),a([819,821],'ヒートシンクファンのネジ',(-1,0,0))],focus=[788])
put(6,29,'loveboard',[859]);put(6,30,'love-cover',[860]);put(6,33,'loveboard',actors=[unit('love-cover','LoveBoardカバー',(0,1,0))])
put(6,38,actors=[unit('loveboard','LoveBoardアセンブリ',(0,1,0)),a([817],'PTFE継手')],focus=[788])
put(6,34,'arm',[241]);put(6,39,actors=[unit('arm','スイングアーム',(0,1,0))])
put(6,45,'fan',[886],actors=[a([833],'プリントファン',(0,1,0)),a([845],'ファンの固定ネジ',(0,1,0))]);put(6,46,actors=[unit('fan','プリントファンとシュラウド',(0,1,0))],focus=[788])
put(6,55,actors=[a([858],'プリントヘッド左カバー',(-1,0,0)),a(['ventLever'],'右カバー・ベントレバー',(1,0,0))],focus=[788])
# Bodywork and the CORE One+ sensor use the same official sequence as the upgrade.
ranges('build',7,[(5,7,'top-frame'),(12,19,'sensor'),(35,38,'right-panel'),(41,41,'left-panel')])
put(7,3,actors=[a([7],'右前部プロファイル',(1,0,0))]);put(7,4,actors=[a([11],'左前部プロファイル',(-1,0,0))])
put(7,5,'top-frame',[43]);put(7,6,'top-frame',actors=[a([26],'左上部プロファイル',(-1,0,0)),a([32,29],'前部と右上部プロファイル',(0,-1,0))])
put(7,8,actors=[unit('top-frame','上部フレーム')]);put(7,12,'sensor',['sensorBody']);put(7,13,'sensor',actors=[a(['sensorLever'],'フィラメントセンサーレバー',(1,0,0))])
put(7,15,'sensor',actors=[a(['sensorSwitch'],'フィラメントセンサースイッチ',(1,0,0))]);put(7,19,'sensor',actors=[a(['sensorCover'],'フィラメントセンサーカバー',(1,0,0))])
put(7,21,actors=[unit('sensor','側面フィラメントセンサー',(1,0,0))],focus=SENSOR)
put(7,30,actors=[a([240],'電子基板下カバー',(0,1,0))],focus=[166]);put(7,33,actors=[a([205],'xBuddyボックスカバー',(0,1,0))],focus=[166]);put(7,34,actors=[a([78,891],'背面カバー',(0,1,0),seat=[0,0,-8])])
put(7,35,'right-panel',[52]);put(7,36,'right-panel',actors=[a(['puck'],'ユニバーサルパック',(1,0,0))]);put(7,39,'right-panel',actors=[a([75],'右ハンドル',(1,0,0))]);put(7,40,actors=[unit('right-panel','右サイドパネル',(1,0,0))])
put(7,41,'left-panel',[48]);put(7,42,actors=[unit('left-panel','左サイドパネル',(-1,0,0)),a([73],'左ハンドル',(-1,0,0))])
ranges('build',8,[(2,7,'top'),(13,21,'lcd'),(27,28,'magnets'),(34,39,'door-panel')])
put(8,2,'top',[88]);put(8,5,'top',actors=[a([91,104,105,98,100,102],'ベントのブッシュとネジ')]);put(8,8,actors=[unit('top','トップカバー')])
put(8,6,'top',actors=[
 a([88,91,104,105,98,100,102],'トップカバーを裏返し、ベントの内側を上に向ける',(1,0,0),handling=True,focusMotion=True,motionPivot=[0,0,486.7875248124],posePath=[{'offset':[0,0,0],'rotation':[180,0,0]},{'offset':[0,0,-80],'rotation':[90,0,0]},{'offset':[0,0,0],'rotation':[0,0,0]}]),
 a([90],'スライド式ベント',(0,0,-1)),
 a([92],'右端のナットを手で仮止めする',(0,0,-1),distance=15),
 a(['ventBlock'],'ベントブロック',(0,0,-1)),
 a([94,96],'残りのナットでブロックを固定する',(0,0,-1),distance=15)
],note='カバーを裏返し、内側からベントカバーとブロックを取り付けます。右端のナットを仮止めしてから、残りの2個でブロックを固定します。締め過ぎず、ベントが軽く動くことを確認してください。')
put(8,11,actors=[a([85],'左サイドウィンドウ',(-1,0,0))]);put(8,12,actors=[a([83],'右サイドウィンドウ',(1,0,0))])
put(8,13,'lcd',[594,'lcdScreen']);put(8,18,'lcd',actors=[a([597],'xLCDノブ',(0,-1,0))]);put(8,21,'lcd',actors=[a([634],'xLCDベゼル',(0,-1,0))]);put(8,23,actors=[unit('lcd','xLCDアセンブリ',(0,-1,0))])
put(8,25,actors=[a([67],'上部ドアシール',(0,-1,0))]);put(8,26,actors=[a([274],'右ドアシール',(0,-1,0)),a([68],'左ドアシール',(0,-1,0))])
# Door-holder nuts, shared hardware and separate transfers are bound below.
put(8,31,actors=[a([574],'下ヒンジ内側',(0,-1,0)),a([577],'上ヒンジ内側',(0,-1,0))]);put(8,32,actors=[a([576],'上ヒンジ外側')]);put(8,33,actors=[a([575],'下ヒンジ外側')])
put(8,34,'door-panel',[571]);put(8,38,'door-panel',actors=[a([590],'ドアハンドル',(0,-1,0))]);put(8,40,actors=[unit('door-panel','ドアパネル',(0,-1,0))]);put(8,42,actors=[a([590],'接着式ドアハンドル',(0,-1,0))])
put(9,3,actors=[a([660],'スチールシート'),a(['spoolNew'],'スプールホルダー',(1,0,0),turn=90)])
# Upgrade removal keeps attached parts together. Removed parts have their own bench.
up(1,actors=[a([87],'トップカバーを取り外す',(0,0,1),remove=True,destination='top')])
up(2,actors=[a([75],'右ハンドルを取り外す',(1,0,0),remove=True,destination='handle')])
up(3,actors=[a([52,236],'右サイドパネルと旧ホルダー',(1,0,0),remove=True,destination='right-panel')])
up(4,'right-panel',actors=[a([236],'旧スプールホルダーを取り外す',(1,0,0),remove=True,destination='discard')])
up(5,'right-panel');up(6,'right-panel',actors=[a(['puck'],'ユニバーサルパック',(1,0,0))]);up(7,'right-panel',actors=[a(['spoolNew'],'新スプールホルダー',(1,0,0),turn=90)])
up(8,focus=[77],note='旧センサーは一体のCADです。基板だけを取り外す操作は公式写真で確認してください。')
up(9,actors=[a([77],'旧センサーユニットを取り外す',(1,0,0),remove=True,destination='old-sensor')],focus=[77])
up(10,'old-sensor',note='旧センサー内部は一体のCADです。磁石の取り出しは公式写真で確認してください。');up(11,'old-sensor',note='レバー・ボール・磁石の取り出しは公式写真で確認してください。')
up(12,'sensor',['sensorBody']);up(13,'sensor',actors=[a(['sensorLever'],'センサーレバー',(1,0,0))]);up(14,'sensor');up(15,'sensor',actors=[a(['sensorSwitch'],'センサースイッチ',(1,0,0))]);up(16,'sensor');up(17,'sensor',note='IR基板・配線は公式写真で確認してください。');up(18,'sensor',actors=[a(['sensorCover'],'センサーカバー',(1,0,0))])
up(19,actors=[unit('sensor','側面フィラメントセンサー',(1,0,0))],focus=SENSOR);up(20,'handle');up(21,'right-panel',actors=[unit('handle','右ハンドル',(1,0,0)),a(SENSOR,'センサーとパネルを固定',(-1,0,0))])
up(22,actors=[unit('right-panel','右サイドパネル・ホルダー・センサー',(1,0,0))]);up(23,focus=[861]);up(24,actors=[a([861],'旧右カバーを取り外す',(1,0,0),remove=True,destination='discard'),a(['ventLever'],'ベントレバー付きカバー',(1,0,0))],focus=[788])
up(25,'top',actors=[a([90],'スライド式ベントを外す',(0,0,-1),remove=True,destination='grille')]);up(26,'top');up(27,'top',note='トップカバーの前後と切り欠きを、公式写真で照合してください。');up(28,'top',actors=[unit('grille','ベントを取り付ける',(0,0,-1))]);up(29,'top',actors=[a(['ventBlock'],'ベントブロック',(0,0,-1))]);up(30,actors=[unit('top','トップカバーを戻す')])
# Flexible fasteners retain their state and their workpiece's ownership. The same
# tie may be threaded now and tightened much later; it is not a new loose part.
def flexible(ch,n,ids,to,label,workspace=None,focus=None,note=None,pose=None):
    s=next(s for s in flows['build']['steps'] if s['chapter']==ch-1 and s['officialStep']==n)
    p=plans['build'].setdefault(str(s['officialId']),{'workspace':'printer','seed':[],'actors':[],'note':'','focus':[],'contextFrom':[]})
    p['actors'].append({'flex':ids,'to':to,'label':label,'axis':[0,0,1]})
    if workspace:p['workspace']=workspace
    if focus is not None:p['focus']=focus
    if note is not None:p['note']=note
    if pose:p['pose']=pose
L=[f'baseL{i}' for i in range(1,4)];R=[f'baseR{i}' for i in range(1,4)]
BOX=['box1','box2','box4','box5'];RGB=['rgb1','rgb2','rgb3'];XY=['xy1','xy2','xy3']
for side,ids in [('左',L),('右',R)]:
    for i,id in enumerate(ids):flexible(2,3,[id],2,f'底板の{side}側 {i+1}：穴に通し、数歯だけ留める',workspace='base',note='左右に3本ずつ通します。後で配線を通すため、まだ締め付けないでください。')
for id in BOX:flexible(3,11,[id],1,f'位置{id[3:]}：先端を曲げ、補助具で穿孔の下に通す',workspace='electronics',note='上から1・2・4・5番目の穿孔を使います。3・6番目は空けておきます。歯が見える向きで通し、基板を傷つけないでください。')
# Carry the prethreaded ties when seating the box in its keyholes.
next(p for p in plans['build'].values() if p.get('actors') and p['actors'][0].get('label')=='xBuddyボックスをキーホールに固定')['actors'][0]['refs']+=BOX
put(3,29,'fan-grid',[71]);put(3,30,'fan-grid')
flexible(3,30,['thermistorWire'],1,'サーミスターのリード線をグリッドの下に通す',focus=[71])
flexible(3,30,['thermistor'],5,'2つの穴に通し、リード線を軽く固定して余りを切る',note='サーミスター本体は露出させます。ロック部はサーミスターの反対側に置いてください。')
put(3,32,'back',actors=[unit('fan-grid','サーミスター付きファングリッド',(0,-1,0),anchors=GRID_SCREWS),a([138,140,142,144],'M3x30ネジ4本：グリッド側から固定する',(0,-1,0),anchors=GRID_SCREWS)],focus=[70,72],note='ファンの上にグリッドを重ね、穴を合わせます。サーミスターを上に向け、配線を挟まないようにしてください。ネジは締め過ぎないでください。')
for n in [31,32,33]:
    step=next(s for s in flows['build']['steps'] if s['chapter']==2 and s['officialStep']==n)
    plans['build'][str(step['officialId'])]['pose']='back-inner'
flexible(3,37,['baseMotor'],1,'Stepper Splitter・右Zモーターの配線を左側3本の輪に通す',focus=L,pose='printer-back',note='左側の結束バンドは、まだ締め付けないでください。')
flexible(3,41,['lcdWire'],1,'xLCDケーブルを左側の輪から前面の開口へ通す',focus=L,pose='printer-back',note='前面から約60 mm出します。結束バンドは緩めたままにしてください。')
flexible(3,45,['earthR'],1,'保護接地線No.1を右側の3本に通す',focus=R,pose='printer-back',note='前面から約60 mm出します。右側の3本を締め、余りを切ります。')
for i,id in enumerate(R):flexible(3,45,[id],5,f'右側 {i+1}：締め付け、ロック部の近くで余りを切る')
flexible(3,46,['earthL'],1,'保護接地線No.4・No.5を左端の穴から通す',focus=L,pose='printer-back',note='左側は配線を動かして調整できる程度に留めます。余りを切ってから、本体を起こしてください。')
for i,id in enumerate(L):flexible(3,46,[id],7,f'左側 {i+1}：軽く締め、余りを切る')
flexible(3,49,['boxLower'],1,'xBuddyボックス右側の結束バンドに配線を通す',focus=BOX)
flexible(3,49,['box5'],5,'一番下の1本だけ締め、余りを切る',note='ほかの3本は、後でメインケーブルを通すため緩めておきます。xLCDのロックは上向きです。')
for i,id in enumerate(RGB):flexible(4,14,[id],1,f'キャリア {i+1}：ロック部を外側にして穴に通す',workspace='carrier',focus=RGB)
flexible(4,14,['rgbWire'],1,'RGB LEDケーブルを3本の結束バンドに通す')
for i,id in enumerate(RGB):flexible(4,14,[id],5,f'キャリア {i+1}：締めて余りを切る')
flexible(4,36,['bed'],1,'ベッドケーブル下の2つの穴に結束バンドを通す',focus=['bed'])
flexible(4,36,['bedWire'],1,'ケーブル束とスリーブを輪の内側に通す')
flexible(4,36,['bed'],5,'スリーブをしっかり固定し、余りを切る')
for n,id,cable,axis in [(61,'motorY','motorYWire','Y'),(62,'motorX','motorXWire','X')]:
    flexible(5,n,[id],1,f'{axis}モーターマウントの穴に通す',workspace='xy',focus=[id])
    flexible(5,n,[cable],1,f'{axis}モーターケーブルを溝に沿わせ、バンドの上に置く')
    flexible(5,n,[id],5,f'{axis}モーターケーブルを固定し、余りを切る')
for i,id in enumerate(XY):flexible(5,68,[id],2,f'CoreXYプレート {i+1}：内向きに通し、数歯だけ留める',workspace='xy',focus=XY,pose='underside',note='CoreXYを裏返して作業します。バンドをベルトに巻き込まないでください。')
flexible(5,70,['doorWire'],1,'左ベルトテンショナーの穴に通す',workspace='xy',focus=[405])
flexible(5,70,['doorWireLead'],1,'ドアセンサーの配線を輪に通す')
flexible(5,70,['doorWire'],5,'ドアセンサーの配線を固定し、余りを切る')
flexible(5,71,['xyWires'],1,'白色LED・ドアセンサーの配線を3本の輪に通す',workspace='xy',focus=XY,pose='underside',note='カメラを追加する場合は、USB-Cを通せるよう一部を緩めておきます。配線はたるませず、Y軸の動く範囲から離してください。')
for i,id in enumerate(XY):flexible(5,71,[id],5,f'CoreXYプレート {i+1}：配線をまとめ、余りを切る')
flexible(6,40,['mainSleeve'],1,'メインケーブルをスイングアームに沿わせる',focus=[241])
flexible(6,40,['arm1'],6,'最初の切り欠きでケーブルを固定し、余りを巻き付ける',note='最初の結束バンドにPTFEチューブは通しません。')
ARM=['arm2','arm3','free1','free2']
flexible(6,42,['ptfeTube'],1,'PTFEチューブをメインケーブルの上に沿わせる',focus=['arm1',*ARM])
for i,id in enumerate(ARM):
    flexible(6,42,[id],1,f'PTFE固定用の結束バンド {i+1} を通す')
    flexible(6,42,[id],4,f'PTFE固定用 {i+1}：チューブをつぶさず固定する',note='アームの残り2か所と、ケーブル上の2か所で固定します。ケーブル上の2本は約100 mm離します。PTFEは最初のバンドには通しません。')
flexible(6,56,['mainRear'],1,'メインケーブルをxBuddyボックスの残り3本に通す',focus=BOX,note='メインケーブルが張り過ぎないよう余長を調整します。接続先は公式写真と基板の表示で確認してください。')
for id in ['box1','box2','box4']:flexible(6,56,[id],5,f'位置{id[3:]}：メインケーブルを固定し、余りを切る')
flexible(7,21,['sensor'],1,'右後部プロファイルの2つの穴に通す',focus=['sensor',*SENSOR])
flexible(7,22,['sensorWire'],1,'側面センサーの配線をプロファイルの下から背面へ通す',focus=['sensor'])
flexible(7,22,['sensor'],7,'位置を調整できる程度に留め、余りを切る')
for i,id in enumerate(['bundle1','bundle2']):flexible(7,23,[id],7,f'背面のケーブル束 {i+1}：軽くまとめて余りを切る',focus=['bundle1','bundle2'],note='ケーブルを圧迫しないよう、締め過ぎに注意してください。')
# Mounting directions and local handling distances, in the source CAD frame.
# Interior work starts inside its available work space. It must not be staged
# outside the enclosure and travel through intervening panels or frame members.
def motion(flow,ch,n,order,axis=None,distance=None,waypoints=None):
    s=next(s for s in flows[flow]['steps'] if s['chapter']==ch-1 and s['officialStep']==n)
    actor=plans[flow][str(s['officialId'])]['actors'][order]
    if axis is not None:actor['axis']=list(axis)
    if distance is not None:actor['distance']=distance
    if waypoints is not None:actor['waypoints']=waypoints

for n,order in [(8,0),(9,1),(10,1)]:motion('build',2,n,order,(0,0,1),20)
motion('build',3,9,0,waypoints=[[-4,1,0],[0,0,0]])
plans['build'][str(next(s['officialId'] for s in flows['build']['steps'] if s['chapter']==2 and s['officialStep']==9))]['actors'][0]['tilt']={'axis':[0,0,1],'degrees':-20,'pivot':[-49,165.45,100]}
motion('build',3,16,0,(1,0,0),30)
motion('build',3,22,0,distance=20)
for n,axis in [(6,(0,0,-1)),(11,(0,0,-1)),(12,(0,0,-1)),(13,(0,0,-1)),(20,(0,0,-1)),(21,(0,0,-1)),(27,(0,0,1))]:
    motion('build',4,n,0,axis,30)
motion('build',4,13,1,(0,0,-1),20)
for n in [30,31,32]:motion('build',4,n,0,distance=20)
for order in [0,1]:motion('build',5,5,order,(0,0,-1),40)
# Original carriage bores define each pulley centre. The second pocket opens
# diagonally; its guided approach follows that opening rather than crossing a rib.
import math
CARRIAGE_HARDWARE={401:['carriageIdlerL1','carriageIdlerL2',408,410],403:['carriageIdlerR1','carriageIdlerR2',414,416]}
carriage_actors=[]
for number,carriage,first,second,screw1,screw2,pivot,approach1,approach2,camera1,camera2 in [
 (1,401,'carriageIdlerL1','carriageIdlerL2',408,410,[-173,-33,351],[-1,0,0],[math.cos(math.radians(-125)),math.sin(math.radians(-125)),0],'corexy-left-perspective','corexy-right-perspective'),
 (2,403,'carriageIdlerR1','carriageIdlerR2',414,416,[173,-33,351],[-math.cos(math.radians(-125)),math.sin(math.radians(-125)),0],[1,0,0],'corexy-right-perspective','corexy-left-perspective')]:
    start=len(carriage_actors)
    if number==2:carriage_actors.append(a([carriage],'2個目のXYキャリッジを置く',distance=26,focusMotion=True,camera=camera1))
    moved=[carriage,first,screw1]
    carriage_actors.extend([
      a([first],f'{number}個目：プーリーを側面の開口から入れる',approach1,distance=28,focusMotion=True,camera=camera1),
      a([screw1],f'{number}個目：上側からM3x18ネジを通す',distance=22,focusMotion=True,camera=camera1),
      a(moved,f'{number}個目：持ち上げて裏返す',handling=True,carry=True,reuse=True,focusMotion=True,camera=camera1,motionPivot=pivot,posePath=[{'offset':[0,0,0],'rotation':[0,0,0]},{'offset':[0,0,60],'rotation':[0,0,0]},{'offset':[0,0,60],'rotation':[0,90,0]},{'offset':[0,0,60],'rotation':[0,180,0]},{'offset':[0,0,0],'rotation':[0,180,0]}]),
      a([second],f'{number}個目：反対側のプーリーを入れる',[-approach2[0],approach2[1],0],focusMotion=True,camera=camera2,motionPivot=pivot,posePath=[{'offset':[-approach2[0]*28,approach2[1]*28,0],'rotation':[0,180,0]},{'offset':[0,0,0],'rotation':[0,180,0]}]),
      a([screw2],f'{number}個目：もう1本のM3x18ネジで固定する',focusMotion=True,camera=camera2,motionPivot=pivot,posePath=[{'offset':[0,0,22],'rotation':[0,180,0]},{'offset':[0,0,0],'rotation':[0,180,0]}])
    ])
    for actor in carriage_actors[start:]:actor['focusRefs']=[carriage]
put(5,7,'carriages',[401],actors=carriage_actors,note='プーリーの中心穴とネジ穴を合わせます。1本目を締めたらキャリッジを持ち上げて裏返し、反対側も組み立ててください。2個目も同じ手順です。')
plans['build'][str(next(s['officialId']for s in flows['build']['steps']if s['chapter']==4 and s['officialStep']==7))].update(camera='corexy-left-perspective',operationPadding=6,settledFocus=[403,*CARRIAGE_HARDWARE[403]])
# Each carriage is fastened on the first face. Lift and turn that whole unit
# before fitting the bearing holder from its other face, as in official 5.8/9.
for n,sheet,carriage,screws,bearing,bearing_screws,pivot,side in [
    (8,'leftLinearHolder',401,[430,432,434],'leftBearingHolder',['leftBearingScrews'],[-158.99865125,-36.39525235,335.00042136],-1),
    (9,379,403,[424,426,428],378,[508,510,512,514],[159.00134875,-36.39525238,335.00042136],1)]:
    prepared=[carriage,*CARRIAGE_HARDWARE[carriage]];fixed=[sheet,*prepared,*screws];first='corexy-right-perspective'if side<0 else'corexy-left-perspective';other='corexy-left-perspective'if side<0 else'corexy-right-perspective'
    put(5,n,'left-holder'if side<0 else'right-holder',[sheet],actors=[
        a(prepared,'XYキャリッジをリニアホルダーに合わせる',(-side,0,0),distance=24,camera=first,focusMotion=True),
        a(screws,'M3x18ネジ3本でキャリッジを固定する',(-side,0,0),distance=22,camera=first,focusMotion=True),
        a(fixed,'ホルダーを持ち上げ、裏返す',handling=True,carry=True,reuse=True,camera=first,focusMotion=True,motionPivot=pivot,posePath=[{'offset':[0,0,0],'rotation':[0,0,0]},{'offset':[0,0,70],'rotation':[0,0,0]},{'offset':[0,0,70],'rotation':[0,90,0]},{'offset':[0,0,70],'rotation':[0,180,0]},{'offset':[0,0,0],'rotation':[0,180,0]}]),
        a([bearing],'ベアリングホルダーの穴を合わせる',(side,0,0),distance=24,camera=other,focusMotion=True),
        a(bearing_screws,'内側からM3x8rTネジ4本で固定する',(-side,0,0),distance=16,camera=first,focusMotion=True)
    ],note='キャリッジをM3x18ネジ3本で固定します。裏返してベアリングホルダーを合わせ、内側からM3x8rTネジ4本を締めてください。')
    p=plans['build'][str(next(s['officialId']for s in flows['build']['steps']if s['chapter']==4 and s['officialStep']==n))]
    p.update(camera=first,operationPadding=20,workpiecePoses=[{'refs':fixed,'pivot':pivot,'rotation':[0,180,0]}],settledFocus=[sheet,*prepared,bearing,*screws,*bearing_screws])
motion('build',5,10,0,(1,0,0),30)
motion('build',5,10,1,(-1,0,0),30)
for order in [0,1]:motion('build',5,12,order,distance=25)
for n in [28,29,30,31,47,53]:motion('build',5,n,0,(0,0,1),40)
put(5,42,'motor-x',[387],actors=[a([392],'X軸プーリー',(0,0,-1),distance=25)])
put(5,43,'motor-y',[567],actors=[a([388],'Y軸プーリー',(0,0,-1),distance=25)])
# Turn the whole bench workpiece shaft-up, preserving the source mating frames.
# The pulley's CAD -Z approach then enters vertically from above the shaft.
for n in [42,43]:
    p=plans['build'][str(next(s['officialId'] for s in flows['build']['steps'] if s['chapter']==4 and s['officialStep']==n))]
    p['pose']='underside'
# Rear cable bundles are worked from outside the back panel. Use the same
# direction when the operation close-up advances, rather than inheriting a
# front/side orbit that hides the bundle behind the panel.
p=plans['build'][str(next(s['officialId'] for s in flows['build']['steps'] if s['chapter']==6 and s['officialStep']==23))]
p.update(camera='rear-wiring-perspective',operationCamera='rear-wiring-perspective',focusPadding=35,operationPadding=24)
motion('build',5,60,0,distance=35)
motion('build',5,63,0,(0,-1,0),30)
motion('build',5,66,0,(0,0,-1),30)
motion('build',5,74,2,distance=6)
motion('build',6,3,0,(0,-1,0),25)
motion('build',6,11,0,(-1,0,0),25)
motion('build',6,11,1,(0,-1,0),30)
put(6,16,'swivel',[808],actors=[a([810],'スイベルのM3x20rTネジ',(0,-1,0),distance=20),a(['idlerSwivelSpacer'],'スペーサー 6×3.1×8をネジへ通す',(0,1,0),distance=20),a([798],'反対側のスイベル',(0,1,0),distance=15),a([809],'スイベルのナイロックナット',(0,1,0),distance=15)])
put(6,17,'swivel',actors=[a([799],'アイドラーナット：向きを合わせ、スイベルの間へ入れる',(0,0,1),distance=20,waypoints=[[0,-.1,20],[0,-.1,0],[0,0,0]]),a([802],'ナットを保持するM3x20rTネジ',(0,-1,0),distance=25),a([801],'ナイロックナット',(0,1,0),distance=15)])
# Use the available side clearance during entry, then return to the original
# CAD mating frame. The later assembly transfer keeps its original datum.
put(6,18,'head',actors=[a([805,815],'スプリングを通したネジ：先端を少し出す',(1,0,0),distance=35,seat=[12,0,0]),unit('swivel','スイベルをネジの先端に合わせる',(0,0,1),distance=25),a([805,815],'ネジ先端がナット前面にそろうまで締める',(1,0,0),distance=12,reuse=True)])
motion('build',6,20,1,(0,0,-1),15)
for order,distance in [(0,25),(1,35),(2,20)]:motion('build',6,23,order,distance=distance)
motion('build',6,25,0,(0,-1,0),30)
motion('build',6,25,1,(0,-1,0),25)
motion('build',6,38,0,distance=40)
motion('build',6,38,1,distance=8)
motion('build',6,39,0,(0,-1,0),50)
motion('build',6,45,0,waypoints=[[0,35,35],[0,0,0]])
plans['build'][str(next(s['officialId'] for s in flows['build']['steps'] if s['chapter']==5 and s['officialStep']==45))]['actors'][0].update(label='ファンを傾け、吐出口をシュラウドに差し込む',tilt={'axis':[1,0,0],'degrees':-30,'pivot':[9,19.9,369.6],'sync':True})
motion('build',6,45,1,(0,.906307787,-.422618262),30)
motion('build',6,46,0,distance=40)
for order in [0,1]:motion('build',6,55,order,distance=30)
for n in [3,4]:motion('build',7,n,0,(0,-1,0),45)
motion('build',7,8,0,distance=80)
BUTTON_PATH=[[25,3,.9123],[0,3,.9123],[0,0,0]]
motion('build',7,15,0,(1,0,0),waypoints=BUTTON_PATH)
motion('build',7,21,0,(0,-1,0),30)
put(7,34,actors=[a([78],'背面カバー：ケーブルをトレイに沿わせ、押し込んで上げる',(0,1,0),waypoints=[[0,40,-2],[0,0,-2],[0,0,0]])])
plans['build'][str(next(s['officialId'] for s in flows['build']['steps'] if s['chapter']==6 and s['officialStep']==34))]['camera']='back-perspective'
motion('build',8,21,0,(0,1,0),35)
motion('build',8,23,0,(0,0,1),30)
# The source's two window instances and hinge instances are oppositely ordered.
put(8,11,actors=[a([83],'左サイドウィンドウ',(-1,0,0),distance=45)])
put(8,12,actors=[a([85],'右サイドウィンドウ',(1,0,0),distance=45)])
put(8,31,actors=[a([577],'下ヒンジ内側：開口に合わせて差し込む',(0,1,0),distance=3.5),a([574],'上ヒンジ内側',(0,1,0),distance=20)])
put(8,32,actors=[a([575],'上ヒンジ外側を合わせる',(0,-1,0),distance=25)],note='ヒンジを合わせてから、面取りのある端を先にしてピンを上から挿入します。')
put(8,33,actors=[a([576],'下ヒンジ外側を合わせる',(0,-1,0),distance=25)],note='ピンが溝の底面から突き出していないことを確認し、上下のヒンジを開いてください。')
motion('build',9,3,0,distance=30)
motion('upgrade',2,15,0,(1,0,0),waypoints=BUTTON_PATH)
motion('upgrade',2,19,0,(0,-1,0),30)
up(22,actors=[unit('right-panel','右サイドパネル：固定前の最後の位置合わせ',(1,0,0),distance=1)],note='センサーとPTFEチューブをフレームに引っ掛けないよう、パネルを内側へ押し戻します。3Dでは固定前の最後の位置合わせを表示します。11本のナイロンリベットで固定してください。')
for order in [0,1]:motion('upgrade',2,24,order,distance=30)
# Screw removal is shown before the part it releases; those screws no longer
# remain as fixed obstacles in the following removal/attachment operations.
up(2,actors=[a([162,164],'ハンドルの固定ネジを外す',(.342,0,-.94),distance=15,remove=True,destination='handle-screws'),a([75],'右ハンドルを取り外す',(1,0,0),distance=35,remove=True,destination='handle')])
up(3,actors=[a([52,236,150,152,154,156],'右サイドパネルと旧ホルダー',(1,0,0),distance=45,remove=True,destination='right-panel')])
up(4,'right-panel',actors=[a([150,152,154,156],'旧ホルダーの固定ネジを外す',(-1,0,0),distance=15,remove=True,destination='discard'),a([236],'旧スプールホルダーを取り外す',(1,0,0),distance=35,remove=True,destination='discard')])
up(9,actors=[a([77,228,230],'旧センサーユニットを取り外す',(0,-1,0),distance=30,remove=True,destination='old-sensor')],focus=[77])
up(20,'handle',actors=[a([162,164],'固定ネジ2本をハンドルへ戻す',(.342,0,-.94),distance=15)])
motion('upgrade',2,21,1,distance=30)
# The vent nuts must be taken off before the sliding plate can be removed.
up(25,'top',actors=[a([98,100,102,91,104,105],'ナットを保持し、ベントのネジとインサートを外す',(0,0,1),distance=15,remove=True,destination='vent-screws'),a([92,94,96],'ナイロックナット3個を取り外す',(0,0,-1),distance=15,remove=True,destination='vent-nuts'),a([90],'スライド式ベントを外す',(0,0,-1),distance=30,remove=True,destination='grille')])
up(28,'top',actors=[unit('vent-screws','ネジとインサートをスロットに通す',(0,0,1),distance=15)],note='中央と左側はM3x12rT、右側は取り外したM3x10rTを使います。インサートのフランジをネジの頭に向けます。ネジの長さは公式写真と実物で確認してください。')
top_flip=plans['build']['1044337']['actors'][0]
top_flip['posePath']=[{'offset':[0,0,-8],'rotation':[180,0,0]},{'offset':[0,0,-200],'rotation':[180,0,0]},{'offset':[0,0,-200],'rotation':[90,0,0]},{'offset':[0,0,-200],'rotation':[0,0,0]},{'offset':[0,0,0],'rotation':[0,0,0]}]
up(29,'top',actors=[top_flip.copy(),unit('grille','ベントカバーを合わせる',(0,0,-1),distance=30),a([92],'右端のナットを手で仮止めする',(0,0,-1),distance=15),a(['ventBlock'],'ベントブロックを合わせる',(0,0,-1),distance=30),a([94,96],'残りのナットでブロックを固定する',(0,0,-1),distance=15)],note='スロットが左側に来る向きで合わせます。ネジはガタがなくなる程度に留め、ベントが軽く左右に動くことを確認してください。')
plans['upgrade']['1024147']['pose']='top-outside'
plans['upgrade']['1024023']['benchLift']=20
for p in [plans['build']['1044337'],plans['upgrade']['1047357']]:
    p['operationPadding']=12
    for actor in p['actors'][1:]:actor['focusMotion']=True
for p in [plans['build']['997834'],plans['upgrade']['1024147']]:
    p.update(camera='board-perspective',focus=[91,98,100,102,104,105],focusPadding=18)
# The slotted top sheet stays fixed. The grille, block and all attached hardware
# share the measured 8.5 mm travel; neither screws nor nuts slide independently.
VENT_MOVING=[90,91,92,94,96,98,100,102,104,105,'ventBlock']
def vent_travel():
    return [a(VENT_MOVING,'左へ動かし、ベントを開く',(-1,0,0),waypoints=[[0,0,0],[-8.5,0,0]],reuse=True),a(VENT_MOVING,'右へ動かし、ベントを閉じる',(1,0,0),waypoints=[[-8.5,0,0],[0,0,0]],reuse=True)]
put(8,7,'top',actors=vent_travel())
plans['upgrade'][str(next(s['officialId']for s in flows['upgrade']['steps']if s['chapter']==1 and s['officialStep']==29))]['actors']+=vent_travel()
for actor in plans['upgrade']['1047357']['actors'][-2:]:actor['focusMotion']=True
for flow,ch,n in [('build',7,7),('upgrade',1,29)]:
    plans[flow][str(next(s['officialId']for s in flows[flow]['steps']if s['chapter']==ch and s['officialStep']==n))].update(camera='vent-perspective',focus=[90,'ventBlock'],focusPadding=12)
up(24,actors=[a([870,872],'右カバーの固定ネジ2本を外す',(1,0,0),distance=15,remove=True,destination='cover-screws'),a([861],'右カバーを外す',(1,0,0),distance=30,remove=True,destination='discard'),a(['ventLever'],'ベントレバー付きカバーを合わせる',(1,0,0),distance=30),a([870,872],'固定ネジ2本を戻す',(1,0,0),distance=15,reuse=True)],focus=[788])
# Source Nextruder hardware follows its installation step and travels with the head.
put(5,60,'xy',actors=[a([829],'Nextruderホルダー',(0,-1,0),distance=35),a([849,851,853,855],'ホルダーのM3x10ネジ4本',(0,-1,0),distance=8)])
put(6,3,'idler',[796],actors=[a([797],'アイドラーレバーB',(0,-1,0),distance=20),a([803],'M3x6ネジ：ベアリングが回る強さで留める',(0,-1,0),distance=15),a([793],'チューブスペーサー',(0,-1,0),distance=15)])
put(6,26,actors=[a([857],'ホットエンドケーブルクリップ',(-1,0,0),distance=25),a([882,884],'クリップのM3x4rTネジ2本',(0,-1,0),distance=12)],focus=[788,857])
put(6,29,'loveboard',[859],actors=[a([874,876],'カバー固定用の角ナット',(1,0,0),distance=15)])
put(6,31,'loveboard',actors=[a([847],'LoveBoardの固定ネジ',(0,1,0),distance=15)],note='端子を下に向け、LoveBoardを取り付けます。基板の形状と配線は公式写真で確認してください。')
put(6,33,'loveboard',actors=[a([862,868],'ホルダーにネジ2本を通す',(0,1,0),distance=20),unit('love-cover','LoveBoardカバー',(0,1,0),distance=25,motionPivot=[2.4775,-23.451,407.9368],posePath=[{'offset':[0,25,0],'rotation':[0,0,0]},{'offset':[.2133,7.99276,.0131],'rotation':[-.19259,-.29059,.1558]},{'offset':[0,0,0],'rotation':[0,0,0]}]),a([864,866],'カバーのM3x10ネジ2本',(0,1,0),distance=20)])
put(6,38,actors=[unit('loveboard','LoveBoardアセンブリ',(0,1,0),distance=40),a([817],'PTFE継手',(0,0,1),distance=8)],focus=[788])
put(6,46,actors=[unit('fan','プリントファンとシュラウド',(0,1,0),distance=40),a([841,843],'シュラウドのM3x10ネジ2本',(0,-1,0),distance=5)],focus=[788])
HOTEND=['hotend','hotendThermistor0','hotendThermistor1','hotendHeater0','hotendHeater1']
put(6,47,'hotend-prep',HOTEND,note='ホットエンド1個とつまみネジ2本を用意します。ケーブルを引っ張らず、本体を持ってください。')
put(6,48,actors=[a([795,807],'つまみネジ2本を2回転だけ入れる',(-1,0,0),distance=15,seat=[-2,0,0]),unit('hotend-prep','ケーブルを左に向け、チューブを下から差し込む',(0,0,-1),distance=60),a([795,807],'ホットエンドを押し上げたまま、2本をしっかり締める',(-1,0,0),distance=2,reuse=True)],focus=[794,'hotend'],note='ヒートシンクファンのケーブルは上側のネジ穴より上に置きます。ホットエンドを奥まで押し込み、ヒートシンクとノズルの真鍮部分のすき間が約2 mmであることを確認してください。つまみネジでケーブルを挟まないでください。')
hp=plans['build'][str(next(s['officialId']for s in flows['build']['steps']if s['chapter']==5 and s['officialStep']==48))];hp.update(camera='hotend-perspective',focusPadding=16,contextOpacity=.06,undersideView=True)
put(6,50,actors=[{'flex':['hotendThermistor0','hotendThermistor1'],'to':1,'label':'サーミスターをケーブルクリップに通し、NT端子へ接続する','axis':[0,0,1],'showBefore':True},{'flex':['hotendHeater0','hotendHeater1'],'to':1,'label':'ヒーターをケーブルクリップに通し、HEATER端子へ接続する','axis':[0,0,1],'showBefore':True}],focus=[857,'loveBoard'],note='先にサーミスター、次にヒーターを接続します。端子の位置は公式写真と基板の表示で確認してください。配線の曲がりと余長は模式表示です。')
hp=plans['build'][str(next(s['officialId']for s in flows['build']['steps']if s['chapter']==5 and s['officialStep']==50))];hp.update(camera='wiring-perspective',focusPadding=10,contextOpacity=.06,transparentRefs=[790,794,816],inspectBoard=True,operationFocus=['loveBoard',857],operationPadding=10)
for n in [49,51,52]:
    hp=plans['build'].setdefault(str(next(s['officialId']for s in flows['build']['steps']if s['chapter']==5 and s['officialStep']==n)),{'workspace':'printer','seed':[],'actors':[],'note':'','focus':[]});hp.update(camera='wiring-perspective',focus=[794,'loveBoard'],focusPadding=10,contextOpacity=.06,transparentRefs=[790,794,816],inspectBoard=True,operationFocus=['loveBoard',857],operationPadding=10)
plans['build'][str(next(s['officialId'] for s in flows['build']['steps'] if s['chapter']==5 and s['officialStep']==55))]['actors'].append(a([870,872],'右カバーのM3x6ネジ2本',(1,0,0),distance=15))
# Sliding entries follow the glass edge rather than crossing its face.
motion('build',8,38,0,(1,0,0),30)
motion('build',8,40,0,(1,0,0),30)
motion('build',8,42,0,(1,0,0),30)
# Official supplemental meshes and labelled assembly illustrations.
put(6,3,'idler',[796],actors=[a(['idlerBearing1','idlerBearing2'],'693 2RSベアリング2個',(0,-1,0),distance=18),a(['idlerPin1','idlerPin2'],'2.9×8.5ピン2本',(0,-1,0),distance=18),a([797],'アイドラーレバーB',(0,-1,0),distance=20),a([803],'M3x6ネジ：ベアリングが軽く回る強さで留める',(0,-1,0),distance=15),a([793],'チューブスペーサー',(0,-1,0),distance=15)])
put(6,6,'head',[790],actors=[a([792],'5×10×0.1スペーサー',(0,-1,0),distance=8),a([794],'ヒートシンク：ケーブルの向きに注意',(0,-1,0),distance=35),a(['mainPlate'],'メインプレート：切り欠きを合わせる',(0,-1,0),distance=25)],note='モーターのケーブルを上に、ヒートシンクのケーブルを右に向けます。スペーサーを入れたことを、もう一度確認してください。')
put(6,7,'gearbox',['pgAssembly'],actors=[a(['pgAdapter'],'ギアの位置に合わせてアダプターを取り付ける',(0,-1,0),distance=25)],note='アダプターのくぼみを、2個のギアに合わせます。ギアの歯形と厚さは再現モデルの概略表示です。')
put(6,8,'gearbox',actors=[a(['pgRing'],'歯の面取りをPGアセンブリ側に向け、PGリングを入れる',(0,1,0),distance=18,wiggle=15)],note='アダプターを付けたまま、リングを左右に揺らして入れます。ギアの面とリングの面が、ほぼそろったところで止めてください。')
put(6,9,'head',actors=[unit('gearbox','PGアセンブリをモーター軸に合わせて入れる',(0,-1,0),distance=30,turn=12),a(['pgAdapter'],'アダプターを取り外す',(0,-1,0),distance=30,remove=True,reuse=True,destination='tools')],note='全体をそっと回し、メインプレートとのすき間がなくなる位置まで下ろします。押し込まないでください。')
put(6,10,'head',actors=[a(['pgAdapter'],'アダプターをもう一度取り付ける',(0,-1,0),distance=25),a(['pgAdapter','pgAssembly'],'アダプターを回して、軽く動くことを確認する',(0,-1,0),distance=0,spin=360,reuse=True),a(['pgAdapter'],'アダプターを取り外して保管する',(0,-1,0),distance=30,remove=True,reuse=True,destination='tools')],note='PGアセンブリがリングより飛び出していないこと、リングとメインプレートのすき間が小さいことを確認してください。')
put(6,31,'loveboard',actors=[a(['loveBoard'],'LoveBoard：端子を下に向け、固定穴を合わせる',(0,1,0),distance=22),a([847],'M3x8rTネジで固定する',(0,1,0),distance=15),a(['loveMainPlug'],'白いラベルのない側をメイン端子に差し込む',(0,-1,0),distance=15)],note='ネジを締めすぎないでください。端子とケーブルの向きは公式写真と照合します。基板と端子は写真から作成した再現モデルです。')
for n in [29,31,32,33]:
    p=plans['build'][str(next(s['officialId'] for s in flows['build']['steps'] if s['chapter']==5 and s['officialStep']==n))];p['camera']='back-perspective'
# Photo comparisons remain available alongside reconstructed geometry.
for n in range(2,59):
    p=plans['build'].setdefault(str(next(s['officialId'] for s in flows['build']['steps'] if s['chapter']==5 and s['officialStep']==n)),{'workspace':'printer','seed':[],'actors':[],'note':'','focus':[],'contextFrom':[]})
    p['focus']=p['focus'] or ([788] if n>=21 and p['workspace']=='printer' else [])
    if 4<=n<=14:p['photoCheck']='gears'
    elif 27<=n<=33:p['photoCheck']='loveboard'
    elif n>=47:p['photoCheck']='hotend'
# Sensor internals follow their source-local assembly axes. Staged parts rest beside
# the body; after the magnet is fitted, the complete part is lifted, turned and seated.
sensor=json.loads((root/'dist/sensor-assembly-data.js').read_text().split('=',1)[1].rstrip(';\n'))
body=sensor['bodyWorld']
def sensor_vector(p):return [sum(body[i][j]*p[j] for j in range(3)) for i in range(3)]
def sensor_point(p):return [v+body[i][3] for i,v in enumerate(sensor_vector(p))]
def sensor_pose(offset,angle=0):return {'offset':sensor_vector(offset),'rotation':sensor_vector([angle,0,0])}
def sensor_action(refs,label,body_path=None,**kw):
    path=body_path or [[0,0,25],[0,0,0]]
    return a(refs,label,sensor_vector([0,0,1]),waypoints=[sensor_vector(p) for p in path],focusMotion=True,**kw)
def staged_sensor_part(key,label,pivot,stage):
    return sensor_action([key],label,handling=True,motionPivot=sensor_point(pivot),posePath=[sensor_pose([stage[0],stage[1],stage[2]+25],180),sensor_pose(stage,180)])
def staged_sensor_magnet(key,label,pivot,stage):
    return sensor_action([key],label,motionPivot=sensor_point(pivot),posePath=[sensor_pose([stage[0],stage[1],stage[2]+20],180),sensor_pose(stage,180)])
def seat_sensor_part(refs,label,pivot,stage):
    return sensor_action(refs,label,reuse=True,motionPivot=sensor_point(pivot),posePath=[sensor_pose(stage,180),sensor_pose([stage[0],stage[1],40],180),sensor_pose([stage[0],stage[1],40],90),sensor_pose([stage[0],stage[1],40]),sensor_pose([0,0,40]),sensor_pose([0,0,0])])
lever_pivot=[30,13,7.5];lever_stage=[-65,0,-3.25]
switch_pivot=[55,5,6];switch_stage=[65,0,-2.8]
ball_end=sensor['ballInsertionBody'][-1]
ball_path=[[p[i]-ball_end[i] for i in range(3)]for p in sensor['ballInsertionBody']]
def sensor_base_actors():return [
    staged_sensor_part('sensorLever','レバーを作業台に置く',lever_pivot,lever_stage),
    staged_sensor_magnet('sensorLeverMagnet','レバーに10×6×2mmの磁石を差し込む',lever_pivot,lever_stage),
    sensor_action(['sensorBall'],'7mmボールをくぼみに収める',ball_path),
    seat_sensor_part(['sensorLever','sensorLeverMagnet'],'磁石を付けたレバーをボディに入れる',lever_pivot,lever_stage),
    sensor_action(['sensorLeverWasher'],'M3wワッシャーを合わせる',[[0,0,15],[0,0,0]]),
    sensor_action(['sensorLeverScrew'],'M3x10を数回転だけ入れる',[[0,0,18],[0,0,0]])
]
def sensor_switch_actors():return [
    staged_sensor_part('sensorSwitch','スイッチを作業台に置く',switch_pivot,switch_stage),
    staged_sensor_magnet('sensorSwitchMagnet','スイッチに10×6×2mmの磁石を差し込む',switch_pivot,switch_stage),
    seat_sensor_part(['sensorSwitch','sensorSwitchMagnet'],'磁石が向かい合う左端の位置にスイッチを入れる',switch_pivot,switch_stage)
]
put(7,13,'sensor',actors=sensor_base_actors())
up(13,'sensor',actors=sensor_base_actors())
put(7,15,'sensor',actors=sensor_switch_actors())
up(15,'sensor',actors=sensor_switch_actors())
put(7,18,'sensor',actors=[sensor_action(['sensorIR'],'レバーを光学ゲートに合わせ、IR基板を溝に入れる')])
up(17,'sensor',actors=[sensor_action(['sensorIR'],'レバーを光学ゲートに合わせ、IR基板を溝に入れる')])
def sensor_cover_actors(upgrade=False):
    path=[[v*15 for v in sensor['nutInsertionBody']],[0,0,0]]
    return [sensor_action(['sensorMountNutLeft'],'角ナット1を溝の奥まで入れる',path),sensor_action(['sensorMountNutRight'],'角ナット2を溝の奥まで入れる',path),sensor_action(['sensorCover'],'センサーカバーを合わせる'),sensor_action(['sensorCoverScrewLeft'],'左のM3x8でカバーを固定する' if upgrade else '左のM3x10でカバーを固定する',[[0,0,18],[0,0,0]]),sensor_action(['sensorCoverScrewRight'],'右のM3x8でカバーを固定する' if upgrade else '右のM3x10でカバーを固定する',[[0,0,18],[0,0,0]])]
put(7,19,'sensor',actors=sensor_cover_actors())
up(18,'sensor',actors=sensor_cover_actors(True))
put(7,20,'sensor')
for flow,ch,lo,hi in [('build',6,12,20),('upgrade',1,12,18)]:
    for n in range(lo,hi+1):
        sid=str(next(s['officialId']for s in flows[flow]['steps']if s['chapter']==ch and s['officialStep']==n))
        plans[flow][sid].update(camera='board-perspective',focus=['sensorBody'],focusPadding=6,operationPadding=6,settledFocus=SENSOR)
# Upgrade reuses the same board, ball, magnets and retaining screw. Their old
# source-local poses persist until the corresponding new assembly operation.
OLD_SENSOR=['sensorOld','sensorOldCover','sensorOldLever','sensorOldCoverScrewLeft','sensorOldCoverScrewRight','sensorOldNut0','sensorOldNut1','sensorIR','sensorBall','sensorLeverMagnet','sensorSwitchMagnet','sensorLeverScrew']
handle_axis=[-.3420201433256658,0,.9396926207859095]
up(2,actors=[a([162,164],'右ハンドルのTorxネジ2本を外す',[-v for v in handle_axis],distance=18,remove=True,destination='handle-screws'),a([75],'右ハンドルを取り外す',(1,0,0),remove=True,destination='handle')],focus=[75])
up(20,'handle',actors=[a([162,164],'M3x10rTネジ2本をハンドルに戻す',[-v for v in handle_axis],distance=18)],focus=[75])
up(8,actors=[
 sensor_action(['sensorOldCoverScrewLeft','sensorOldCoverScrewRight'],'旧カバーのM3x10ネジ2本を外す',[[0,0,20],[0,0,0]],remove=True,destination='old-cover'),
 sensor_action(['sensorOldCover'],'旧センサーカバーを外す',remove=True,destination='old-cover'),
 sensor_action(['sensorIR'],'ケーブルを付けたままIR基板をよける',remove=True,destination='sensor-reuse-ir')
],focus=['sensorOld'],note='先にM2x8ネジを外してから、IR基板を側面へよけます。基板は端を持ち、ケーブルは外しません。M2x8ネジとケーブルの形状は3D表示に含みません。')
up(9,actors=[sensor_action(['sensorOld','sensorOldLever','sensorOldNut0','sensorOldNut1','sensorBall','sensorLeverMagnet','sensorSwitchMagnet','sensorLeverScrew'],'PTFEから旧センサーを引き抜く',[[.9891145558*35,.1471475295*35,0],[0,0,0]],remove=True,destination='old-sensor')],focus=['sensorOld'],note='コレットを押したままPTFEから抜きます。コレットは再利用します。PTFEとコレットは公式写真で確認してください。')
up(10,'old-sensor',actors=[sensor_action(['sensorSwitchMagnet'],'ハウジングの磁石を抜いて保管する',remove=True,destination='sensor-reuse-fixed')],focus=['sensorOld'])
old_stage=[-65,0,-3.6];old_pivot=[31.340089,14.742452,7.5]
up(11,'old-sensor',actors=[
 sensor_action(['sensorLeverScrew'],'レバーのM3x10ネジを外す',remove=True,destination='sensor-reuse-screw'),
 sensor_action(['sensorOldLever','sensorLeverMagnet'],'旧レバーを持ち上げ、裏返して作業台に置く',handling=True,motionPivot=sensor_point(old_pivot),posePath=[sensor_pose([0,0,0]),sensor_pose([0,0,40]),sensor_pose([old_stage[0],0,40]),sensor_pose([old_stage[0],0,40],90),sensor_pose([old_stage[0],0,40],180),sensor_pose(old_stage,180)]),
 sensor_action(['sensorBall'],'7mmボールを取り出して保管する',ball_path,remove=True,destination='sensor-reuse-ball'),
 sensor_action(['sensorLeverMagnet'],'旧レバーから磁石を抜いて保管する',remove=True,reuse=True,destination='sensor-reuse-lever',motionPivot=sensor_point(old_pivot),posePath=[sensor_pose([old_stage[0],old_stage[1],old_stage[2]+25],180),sensor_pose(old_stage,180)])
],focus=['sensorOld'])
for n,keys in [(13,['sensorBall','sensorLeverMagnet','sensorLeverScrew']),(15,['sensorSwitchMagnet']),(17,['sensorIR'])]:
    sid=str(next(s['officialId']for s in flows['upgrade']['steps']if s['chapter']==1 and s['officialStep']==n));plans['upgrade'][sid]['releaseRest']=keys
for n in [8,9,10,11]:
    sid=str(next(s['officialId']for s in flows['upgrade']['steps']if s['chapter']==1 and s['officialStep']==n));plans['upgrade'][sid].update(camera='board-perspective',focusPadding=8,operationPadding=8,settledFocus=['sensorOld'])
for n in [8,9]:
    sid=str(next(s['officialId']for s in flows['upgrade']['steps']if s['chapter']==1 and s['officialStep']==n));plans['upgrade'][sid].update(camera='side-sensor-perspective',operationCamera='side-sensor-perspective',undersideView=True)
# Keep the sensor, handle and sheet together when returning the panel. The
# handle's sloping screw bores determine the approach, rather than world X.
import math
panel_pivot=[225,0,330]
panel_angle=-15
theta=math.radians(panel_angle)
def panel_vector(v):return [math.cos(theta)*v[0]+math.sin(theta)*v[2],v[1],-math.sin(theta)*v[0]+math.cos(theta)*v[2]]
panel_axis=panel_vector(handle_axis)
PANEL=[52,75,162,164,'puck','spoolNew',*SENSOR]
panel_pose={'refs':PANEL,'rotation':[0,panel_angle,0],'pivot':panel_pivot}
for flow,ch,n in [('build',7,21),('upgrade',2,19)]:
    motion(flow,ch,n,0,waypoints=[sensor_vector([.9891145629*35,.1471474820*35,0]),[0,0,0]])
up(20,'handle',actors=[a([162,164],'M3x10rTをハンドルに浅く差し込む',[-v for v in handle_axis],waypoints=[[-v*18 for v in handle_axis],[-v*4 for v in handle_axis]])],focus=[75])
up(21,'right-panel',actors=[unit('handle','ハンドルのネジをパネルの穴に通す',[-v for v in panel_axis],distance=18),a(SENSOR,'角ナットをネジの軸に合わせてセンサーを取り付ける',panel_axis,distance=6),a([162,164],'角ナットを支え、ハンドルのネジ2本を締める',panel_axis,waypoints=[[0,0,0],[v*4 for v in panel_axis]],reuse=True)],focus=[75,*SENSOR],note='パネルを本体のすぐ横で支えます。PTFEチューブを引っ張らず、角ナットとネジをまっすぐ合わせてください。')
put(7,39,'right-panel',actors=[a([75],'ハンドルをパネルの穴に合わせる',[-v for v in panel_axis],distance=18),a([164],'後ろ側のM3x8rTをハンドルとパネルに通す',[-v for v in panel_axis],distance=14),a(SENSOR,'センサーの角ナットを後ろ側のネジに合わせる',panel_axis,distance=6),a([164],'後ろ側のネジを軽く締め、角ナットは動く状態にする',panel_axis,waypoints=[[0,0,0],[v*4 for v in panel_axis]],reuse=True)],focus=[75,*SENSOR],note='パネルを本体に近づけて支え、後ろ側のネジを軽く締めます。角ナットが動く程度に留めてください。')
closing_pivot=[205,0,330]
lift=[(closing_pivot[i]-panel_pivot[i])-(panel_vector(closing_pivot)[i]-panel_vector(panel_pivot)[i]) for i in range(3)]
closing_poses=[{'offset':[0,0,0],'rotation':[0,0,0]},{'offset':lift,'rotation':[0,0,0]}]
for angle in range(1,1-panel_angle):
    radians=math.radians(angle);closing_poses.append({'offset':[math.cos(radians)*lift[0]+math.sin(radians)*lift[2],lift[1],-math.sin(radians)*lift[0]+math.cos(radians)*lift[2]],'rotation':[0,angle,0]})
close_panel=unit('right-panel','パネルを少し持ち上げ、本体へ押し戻す',handling=True,reuse=True,showBefore=True,motionPivot=closing_pivot,posePath=closing_poses)
up(22,actors=[close_panel],focus=[52,75],note='パネルを支えて本体へ押し戻し、ナイロンリベット11本で固定します。センサーとPTFEチューブをフレームに引っ掛けないでください。最後に短いPTFEチューブをハンドルへ奥まで差し込みます。')
put(7,40,actors=[a([162],'前側のM3x8rTでハンドルとセンサーを固定する',[-v for v in panel_axis],distance=18,destination='right-panel'),close_panel],focus=[52,75],note='2本目のネジでハンドルとセンサーを固定します。パネルを本体へ戻し、ナイロンリベット11本で固定してください。')
for flow,ch,ns in [('build',7,[39,40]),('upgrade',2,[21,22])]:
    for n in ns:
        sid=str(next(s['officialId']for s in flows[flow]['steps']if s['chapter']==ch-1 and s['officialStep']==n));plans[flow][sid].update(workpiecePoses=[panel_pose],pose='printer-standing',camera='right-perspective',contextOwners=['printer'] if n in [39,21] else [])
        if n in [39,21]:
            plans[flow][sid].update(transparentRefs=[52,83,370,788,313,369],camera='sensor-mount-perspective',operationCamera='sensor-mount-perspective',undersideView=True,focusPadding=8,operationPadding=8)
            for actor in plans[flow][sid]['actors']:actor['focusMotion']=True
for flow,ch,n,refs in [('build',7,39,[164]),('upgrade',2,21,[162,164])]:
    sid=str(next(s['officialId']for s in flows[flow]['steps']if s['chapter']==ch-1 and s['officialStep']==n));plans[flow][sid]['workpiecePoses'].append({'refs':refs,'rotation':[0,0,0],'pivot':[0,0,0],'offset':[-v*4 for v in panel_axis]})
# The NTC enters from the motor side. Lay the workpiece on its front so the
# thermistor opening and the Torx socket face the camera above the workbench.
ntc=plans['build']['993869']
ntc.update(pose='ntc-bench',camera='ntc-perspective',operationCamera='ntc-perspective',focus=[794,806,811],focusPadding=18,operationFocus=[806,811],operationPadding=22)
for actor in ntc['actors']:actor['focusMotion']=True
# Keep the display's loose parts out of earlier steps. This source revision has
# the printed rear mount; its LCD module is an envelope, not a populated PCB.
lcd_n=[0,-2**-.5,2**-.5]
lcd_rear=[-v for v in lcd_n]
lcd_body=[595,596,'lcdScreen',614,609,611,613,'lcdFaston',607]
put(8,13,'lcd',[595])
put(8,15,'lcd',actors=[a([596,'lcdScreen'],'液晶を前カバーの内側に収める',lcd_rear,distance=30,focusMotion=True)],note='前カバーを表向きの面を下にして作業台の端に置きます。3Dの液晶は外形のみです。基板とエンコーダーの位置は公式写真で確認してください。')
put(8,16,'lcd',actors=[
 a([614],'背面マウントを合わせる',lcd_rear,distance=25,focusMotion=True),
 a([609],'右下の3x8sTを締める',lcd_rear,distance=18,focusMotion=True),
 a([611],'左下の3x8sTを締める',lcd_rear,distance=18,focusMotion=True),
 a([613],'左上の3x8sTを締める',lcd_rear,distance=18,focusMotion=True)
],note='3Dは積層痕のある旧型の背面マウントです。長いコネクター開口の横にある4つ目の穴は、接地端子のために空けておきます。新しい射出成形品は公式写真で形状を確認してください。')
put(8,17,'lcd',actors=[
 a(['lcdFaston'],'接地端子をコネクター側へ向け、穴を合わせる',lcd_rear,waypoints=[[-18+18*lcd_rear[0],18*lcd_rear[1],18*lcd_rear[2]],[-18,0,0],[0,0,0]],focusMotion=True),
 a([607],'端子をラジオペンチで支え、3x8sTで固定する',lcd_rear,distance=18,focusMotion=True)
],note='端子の先端を長いコネクター開口の側へ向け、4つ目のネジ穴に合わせます。ラジオペンチで端子を支え、基板に向かって回らないように締めてください。基板とエンコーダーの細部は公式写真で確認してください。')
lcd_pivot=[.985417216,-236.6692753524,-26.8179891431]
put(8,18,'lcd',actors=[
 a(lcd_body,'xLCDを持ち上げ、表向きに返す',(1,0,0),handling=True,distance=1,focusMotion=True,motionPivot=lcd_pivot,posePath=[{'offset':[-19*v for v in lcd_n],'rotation':[180,0,0]},{'offset':[80*v for v in lcd_n],'rotation':[180,0,0]},{'offset':[80*v for v in lcd_n],'rotation':[90,0,0]},{'offset':[80*v for v in lcd_n],'rotation':[0,0,0]},{'offset':[0,0,0],'rotation':[0,0,0]}]),
 a([597],'ノブの向きを合わせ、まっすぐ押し込む',lcd_n,distance=25,focusMotion=True)
],note='エンコーダー軸の平らな面を上に向けます。ノブ側面の小さな射出痕を上に合わせ、まっすぐ押し込んでください。')
for actor in plans['build']['998310']['actors']:actor['focusRefs']=[595,614]
lcd_complete=[*lcd_body,597,599,601,603,605]
lcd_turn20=[*lcd_body,597,599,601]
put(8,20,'lcd',[599,601],actors=[
 a(lcd_turn20,'xLCDを持ち上げ、背面を上に返す',(1,0,0),handling=True,distance=1,focusMotion=True,motionPivot=lcd_pivot,posePath=[{'offset':[-3*v for v in lcd_n],'rotation':[180,0,0]},{'offset':[-80*v for v in lcd_n],'rotation':[180,0,0]},{'offset':[-80*v for v in lcd_n],'rotation':[90,0,0]},{'offset':[-80*v for v in lcd_n],'rotation':[0,0,0]},{'offset':[0,0,0],'rotation':[0,0,0]}]),
 a([603],'左のM3x6を仮止めし、頭の下を3 mm以上空ける',(0,1,0),waypoints=[[0,12,0],[0,1.5,0]],focusMotion=True),
 a([605],'右のM3x6を仮止めし、頭の下を3 mm以上空ける',(0,1,0),waypoints=[[0,12,0],[0,1.5,0]],focusMotion=True)
],note='旧型マウントの角ナットは、公式写真に従って奥まで入れてください。3Dでは角ナットを入れた状態から、ネジ2本の仮止めを示します。新しい射出成形マウントには角ナットを使いません。')
lcd_stage=[0,-40,8]
put(8,21,'lcd',[634,627,629,631,633],actors=[
 a(lcd_complete,'xLCDを持ち上げ、液晶を上に向ける',(1,0,0),handling=True,distance=1,focusMotion=True,motionPivot=lcd_pivot,posePath=[{'offset':lcd_stage,'rotation':[180,0,0]},{'offset':[lcd_stage[i]+80*lcd_n[i] for i in range(3)],'rotation':[180,0,0]},{'offset':[lcd_stage[i]+80*lcd_n[i] for i in range(3)],'rotation':[90,0,0]},{'offset':[lcd_stage[i]+80*lcd_n[i] for i in range(3)],'rotation':[0,0,0]},{'offset':lcd_stage,'rotation':[0,0,0]}]),
 a(lcd_complete,'ネジ頭をキーホールの大きい穴に通す',(0,-1,0),waypoints=[lcd_stage,[0,0,8]],reuse=True,showBefore=True,handling=True,focusMotion=True),
 a(lcd_complete,'両側のネジを細い溝の奥までスライドさせる',(0,0,1),waypoints=[[0,0,8],[0,0,0]],reuse=True,showBefore=True,handling=True,focusMotion=True),
 a([603],'左のM3x6を締める',(0,1,0),waypoints=[[0,0,0],[0,-2.3,0]],reuse=True,showBefore=True,focusMotion=True),
 a([605],'右のM3x6を締める',(0,1,0),waypoints=[[0,0,0],[0,-2.5,0]],reuse=True,showBefore=True,focusMotion=True)
],note='液晶を上にし、ベゼルの折り曲げた縁も上側に向けます。両側のネジ頭を大きい穴に通し、細い溝の奥までスライドさせてから締めてください。')
plans['build']['998442']['workpiecePoses']=[{'refs':[603,605],'rotation':[0,0,0],'pivot':[0,0,0],'offset':[0,1.5,0]}]
for actor in plans['build']['998442']['actors'][1:3]:actor['anchors']=[[-44.99999802,-204.40000002,-23.02204357],[60.00001136,-204.20001009,-23.02207753]]
for sid in ['998396','998442']:
 for actor in plans['build'][sid]['actors']:actor['focusRefs']=[595,614]
for n in range(13,22):
 sid=str(next(s['officialId']for s in flows['build']['steps']if s['chapter']==7 and s['officialStep']==n))
 plans['build'][sid].update(pose='lcd-back' if n<18 or n==20 else 'lcd-front',camera='board-perspective',operationCamera='board-perspective',focus=[595,614],focusPadding=12,operationPadding=12)
plans['build']['998442'].update(camera='rear-wiring-perspective',operationCamera='rear-wiring-perspective')
# The bezel has a tab on each end of its folded top lip. Bring both tabs
# through the opening, engage the left one, then lower the raised right end.
# Rotations are vectors, not Euler angles: compose the local bottom lift before
# the roll about the left tab so the far end is not pushed through the profile.
def lcd_install_pose(offset,roll=0,pitch=0):
    from math import sin,cos,acos,sqrt,degrees,radians
    x,y=radians(pitch)/2,radians(roll)/2
    q=[sin(x)*cos(y),cos(x)*sin(y),-sin(x)*sin(y),cos(x)*cos(y)]
    angle=2*acos(max(-1,min(1,q[3])));s=sqrt(max(0,1-q[3]**2))
    return {'offset':offset,'rotation':[degrees(angle)*v/s for v in q[:3]] if s>1e-12 else [0,0,0]}
lcd_install_refs=[*lcd_complete,634,627,629,631,633]
lcd_install_pivot=[-159,-200,.9]
lcd_front=lcd_install_pose([0,-65,0])
lcd_clear=lcd_install_pose([3.5,-40,0],-12,-5)
lcd_between=lcd_install_pose([3.5,0,0],-12,-5)
lcd_left=lcd_install_pose([0,0,0],-12,-5)
lcd_level=lcd_install_pose([0,0,0],0,-5)
lcd_final=lcd_install_pose([0,0,0])
lcd_screw_poses=[{'refs':[603],'rotation':[0,0,0],'pivot':[0,0,0],'offset':[0,-.8,0]},
                 {'refs':[605],'rotation':[0,0,0],'pivot':[0,0,0],'offset':[0,-1,0]}]
put(8,22,'printer',actors=[dict(flex=['lcdWire'],to=1,cableApproach='lcdWire',label='メインケーブルをxLCD背面の開口へ導く',focusBounds=[0,-315,-65,55,-200,-2],camera='lcd-earth-perspective'),dict(flex=['earthR'],to=1,cableApproach='earthR',label='接地線の先端をFaston端子へ導く',focusBounds=[15,-290,-45,50,-200,-2],camera='lcd-earth-perspective')],note='xLCDをプリンターの手前で支えます。メインケーブルは赤いコネクターの突起を基板の三角印に向け、接地線はFaston端子に接続してください。アニメーションは2本のケーブルの取り回しを示します。端子の差し込みは公式写真で確認してください。',focus=[595,614])
plans['build']['998504'].update(contextOwners=['lcd'],workpiecePoses=[*lcd_screw_poses,{'refs':lcd_install_refs,**lcd_front,'pivot':lcd_install_pivot}],pose='printer-standing',camera='lcd-earth-perspective',operationCamera='lcd-earth-perspective',transparentRefs=[308,6],focusPadding=20,operationPadding=8)
put(8,23,'printer',actors=[
 unit('lcd','配線を引っ張らず、xLCDの下側を少し持ち上げる',handling=True,showBefore=True,focusMotion=True,motionPivot=lcd_install_pivot,posePath=[lcd_front,lcd_clear]),
 a(lcd_install_refs,'左右の爪を前面フレームの内側へ入れる',handling=True,reuse=True,showBefore=True,focusMotion=True,motionPivot=lcd_install_pivot,posePath=[lcd_clear,lcd_between],anchors=[[-159,-200,.9],[159,-200,.9]]),
 a(lcd_install_refs,'左へ少しずらし、左の爪をプロファイルの裏に掛ける',handling=True,reuse=True,showBefore=True,focusMotion=True,motionPivot=lcd_install_pivot,posePath=[lcd_between,lcd_left],anchors=[[-159,-200,.9]],focusBounds=[-178,-218,-14,-140,-190,25],camera='lcd-left-tab-perspective'),
 a(lcd_install_refs,'下側を支え、右の爪をプロファイルの裏に掛ける',handling=True,reuse=True,showBefore=True,focusMotion=True,motionPivot=lcd_install_pivot,posePath=[lcd_left,lcd_level,lcd_final],anchors=[[159,-200,.9]],focusBounds=[130,-220,-36,185,-188,75],camera='lcd-right-tab-perspective')
],note='ケーブルを挟んだり、コネクターから抜いたりしないように支えます。左の爪を前面プロファイルの裏へ掛け、下側を少し持ち上げながら右の爪も掛けてください。',focus=[634])
plans['build']['998558'].update(workpiecePoses=lcd_screw_poses,pose='printer-standing',camera='lcd-install-perspective',operationCamera='lcd-install-perspective',focusPadding=12,operationPadding=10,transparentRefs=[10,14])
for actor,sign in zip(plans['build']['998558']['actors'][2:],[-1,1]):
 actor.update(attentionRefs=[634],attentionBounds=[-161 if sign<0 else 155,-206,-.5,-155 if sign<0 else 161,-197,1.5])
for n in range(13,24):
 sid=str(next(s['officialId']for s in flows['build']['steps']if s['chapter']==7 and s['officialStep']==n))
 if sid not in plans['build']:put(8,n)
 plans['build'][sid]['photoCheck']='xlcd'
# Assemble the two door holders separately. The upper workpiece is brought next
# to the lower one on the bench; its final source placement stays unchanged.
holder_lower=[275,235,'doorMagnetLower']
holder_upper=[82,233,'doorMagnetUpper']
put(8,27,'magnets',[275,82],note='マグネットホルダー2個、M3nS角ナット2個、20×6×2 mmの磁石2個、M3x5rTネジ2本を用意します。磁石を離すときは、指を挟まないようにしてください。')
put(8,28,'magnets',actors=[
 a([235],'下側ホルダーの溝へM3nSを奥まで入れる',(-1,0,0),distance=14,focusMotion=True,focusRefs=[275],anchors=[[169.78766376,-201.5992576,66.78092136]]),
 a([233],'上側ホルダーの溝へM3nSを奥まで入れる',(-1,0,0),distance=14,focusMotion=True,focusRefs=[82],anchors=[[207.78766376,-201.5992576,66.78092136]]),
 a(['doorMagnetLower'],'下側ホルダーへ磁石を奥まで押し込む',(0,0,1),distance=30,focusMotion=True,focusRefs=[275],anchors=[[178.16666376,-202.4492576,396.68092136-330]]),
 a(['doorMagnetUpper'],'上側ホルダーへ磁石を奥まで押し込む',(0,0,1),distance=30,focusMotion=True,focusRefs=[82],anchors=[[216.16666376,-202.4492576,396.68092136-330]])
],note='角ナットを奥まで入れ、ホルダーの穴からねじ穴が見えることを確認します。磁石も奥まで押し込みます。このドア用磁石は、どちら向きでも構いません。')
for sid in ['998798','998856']:
 plans['build'][sid].update(pose='holders-bench',camera='holder-bench-perspective',operationCamera='holder-bench-perspective',focus=[275,82],focusPadding=8,operationPadding=8,workpiecePoses=[{'refs':holder_upper,'rotation':[0,0,0],'pivot':[0,0,0],'offset':[38,0,-330]}])
put(8,29,'printer',actors=[
 a(holder_lower,'下側ホルダーを内側から切り欠きに合わせる',(0,1,0),distance=3.5,handling=True,focusMotion=True,focusRefs=[275],anchors=[[169.78766376,-204.6992576,66.78092136]]),
 a([223],'下側ホルダーをM3x5rTで固定する',(0,-1,0),distance=16,focusMotion=True,focusRefs=[275],anchors=[[169.78766376,-204.6992576,66.78092136]]),
 a(holder_upper,'上側ホルダーを内側から切り欠きに合わせる',(0,1,0),distance=12,handling=True,focusMotion=True,focusRefs=[82],anchors=[[169.78766376,-204.6992576,396.78092136]]),
 a([221],'上側ホルダーをM3x5rTで固定する',(0,-1,0),distance=16,focusMotion=True,focusRefs=[82],anchors=[[169.78766376,-204.6992576,396.78092136]])
],note='右プロファイルの下側から取り付けます。内側からホルダーの四角い突起を開口に収め、外側からM3x5rTで固定してください。上側も同じように取り付けます。',focus=[82,275])
plans['build']['998900'].update(pose='printer-standing',camera='holder-install-perspective',operationCamera='holder-install-perspective',focusPadding=14,operationPadding=14)
for actor in plans['build']['998900']['actors'][::2]:actor['camera']='holder-inside-perspective'
# Door hinges remain in the original CAD frame; only the outer leaves rotate.
HINGE_PIVOT=[-178.44637203304407,-208.27588698405032,0]
HINGE_OPEN={'refs':[575,576],'pivot':HINGE_PIVOT,'rotation':[0,0,-90]}
put(8,30,'hinges',[577,574,576,575],note='内側ヒンジ2個、外側ヒンジ2個、2×40 mmのピン2本、M3x5rTネジ2本を用意します。')
put(8,31,'printer',actors=[
 a([577],'下側の内ヒンジを内側から開口に合わせる',(0,1,0),distance=3.5,handling=True,focusMotion=True,focusRefs=[577],camera='hinge-inside-perspective'),
 a([587],'下側の内ヒンジをM3x5rTで固定する',(0,-1,0),distance=14,focusMotion=True,focusRefs=[577]),
 a([574],'上側の内ヒンジを内側から開口に合わせる',(0,1,0),distance=12,handling=True,focusMotion=True,focusRefs=[574],camera='hinge-inside-perspective'),
 a([589],'上側の内ヒンジをM3x5rTで固定する',(0,-1,0),distance=14,focusMotion=True,focusRefs=[574])],focus=[577,574])
put(8,32,'printer',actors=[
 a([575],'上側の外ヒンジを合わせる',(0,-1,0),distance=15,handling=True,focusMotion=True,focusRefs=[574,575]),
 a(['doorHingePinUpper'],'上側のピンを面取り端から上から通す',(0,0,1),distance=48,focusMotion=True,focusRefs=[574,575],camera='hinge-pin-perspective')],focus=[574,575])
put(8,33,'printer',actors=[
 a([576],'下側の外ヒンジを合わせる',(0,-1,0),distance=15,handling=True,focusMotion=True,focusRefs=[577,576]),
 a(['doorHingePinLower'],'下側のピンを面取り端から上から通す',(0,0,1),distance=48,focusMotion=True,focusRefs=[577,576],camera='hinge-pin-perspective'),
 a([575],'上側の溝からピンが出ていないか確認する',(0,0,1),reuse=True,carry=True,inspection=True,distance=0,handling=True,focusMotion=True,focusRefs=[575],camera='hinge-pin-perspective',anchors=[[-175.5,-208.3,418.8903]]),
 a([576],'下側の溝からピンが出ていないか確認する',(0,0,1),reuse=True,carry=True,inspection=True,distance=0,handling=True,focusMotion=True,focusRefs=[576],camera='hinge-pin-perspective',anchors=[[-175.5,-208.3,88.8903]]),
 a([575,576],'ピンが溝から出ていないか確認し、両ヒンジを開く',(0,0,1),reuse=True,carry=True,handling=True,focusMotion=True,motionPivot=HINGE_PIVOT,posePath=[{'offset':[0,0,0],'rotation':[0,0,0]},{'offset':[0,0,0],'rotation':[0,0,-90]}],camera='door-open-perspective',anchors=[[-164.39654,-207,410.69],[-164.39654,-207,52.69]])],focus=[575,576])
for sid in ['998996','999034','999080']:
 plans['build'][sid].update(pose='printer-standing',camera='hinge-front-perspective',operationCamera='hinge-front-perspective',focusPadding=14,operationPadding=12)
for n in range(34,41):
 sid=str(next(s['officialId']for s in flows['build']['steps']if s['chapter']==7 and s['officialStep']==n));plans['build'][sid].setdefault('workpiecePoses',[]).append(HINGE_OPEN)
# Keep the same bench frame as step 38. Raise the whole door before tipping it
# around the handle edge; the handle must stay registered to the panel.
plans['build']['1075290'].update(actors=[
 a([572,590],'ドアを少し持ち上げ、立てて支える',(1,0,0),distance=0,handling=True,showBefore=True,focusMotion=True,motionPivot=[182.60025437,-206,231.69030816],posePath=[
  {'offset':[0,0,0],'rotation':[0,0,0]},
  {'offset':[0,-12,0],'rotation':[0,0,0]},
  {'offset':[0,-12,0],'rotation':[0,0,45]},
  {'offset':[0,-12,0],'rotation':[0,0,90]}
 ])],note='ドアを立てて支えます。固定プレートはロゴのある外側に入れ、ネジ支柱をパネルから離れる向きにしてください。プレートとM3x8rT 2本の取り付けは公式写真で確認します。',focus=[572,590],focusPadding=12,operationPadding=12,camera='door-upright-perspective',operationCamera='door-upright-perspective',settledFocus=[572,590])
for sid in ['1075220','1075290']:plans['build'][sid]['photoCheck']='doorHandle'
put(8,40,'printer',actors=[
 unit('door-panel','表示を外向きにし、ドアをヒンジの溝へ差し込む',(0,-1,0),distance=16,handling=True,focusMotion=True),
 a([579],'上側ヒンジの上のネジを取り付ける',(1,0,0),distance=14,focusMotion=True,focusRefs=[575]),
 a([581],'上側ヒンジの下のネジを取り付ける',(1,0,0),distance=14,focusMotion=True,focusRefs=[575]),
 a([583],'下側ヒンジの上のネジを取り付ける',(1,0,0),distance=14,focusMotion=True,focusRefs=[576]),
 a([585],'下側ヒンジの下のネジを取り付ける',(1,0,0),distance=14,focusMotion=True,focusRefs=[576])],focus=[572,575,576])
plans['build']['999206'].update(pose='printer-standing',workpiecePoses=[{'refs':[572,590,575,576,579,581,583,585],'pivot':HINGE_PIVOT,'rotation':[0,0,-90]}],camera='door-open-perspective',operationCamera='door-open-perspective',focusPadding=18,operationPadding=12)
# Bottom-frame screws retain the actual official CAD placements. The outer side
# screws (285/288/289/291/293/296/297/300) join the bottom panel; nearby lower
# screws are reserved for the vertical profiles in later chapters.
def base_entry(n):
    return plans['build'][str(next(s['officialId']for s in flows['build']['steps']if s['chapter']==1 and s['officialStep']==n))]
for n in range(11,18):base_entry(n).update(pose='underside',camera='bottom-bench-perspective',operationCamera='bottom-bench-perspective',operationPadding=12)
def base_screw(ref,label,axis,point,camera='bottom-bench-perspective'):
    return a([ref],label,axis,distance=14,spin=720,focusMotion=True,focusBounds=[point[i]-16 for i in range(3)]+[point[i]+16 for i in range(3)],camera=camera,anchors=[point])
base_entry(12)['actors'].append(base_screw(125,'前左の角をM3x4rTで固定する',(0,0,-1),[-162.736,-167.245,-55.713]))
base_entry(13)['actors'].append(base_screw(119,'後ろ左の角をM3x4rTで固定する',(0,0,-1),[-167.545,163.036,-55.713]))
base_entry(14)['actors'] += [base_screw(121,'後ろ右の角をM3x4rTで固定する',(0,0,-1),[162.737,167.845,-55.713]),base_screw(123,'前右の角をM3x4rTで固定する',(0,0,-1),[167.547,-162.436,-55.713])]
put(2,15,'bottom',actors=[a([key],label,(0,0,-1),distance=22,focusMotion=True,anchors=[[-95.183,y,-56.213]],focusBounds=[-109,y-15,-83,-81,y+15,-42],camera='bottom-bench-perspective')for key,label,y in [('baseSpacerPinFront','1本目のスペーサーピンを穴の奥まで押し込む',-155.48636944),('baseSpacerPinRear','2本目のスペーサーピンを穴の奥まで押し込む',-175.48636944)]],note='前面プロファイルの突起にある2つの穴へ、ピンを1本ずつ押し込みます。頭がプロファイルに収まるまで、しっかり押してください。ピンの細部と爪の変形は模式表示です。')
base_entry(15).update(pose='underside',camera='bottom-bench-perspective',operationCamera='bottom-bench-perspective',focus=['baseSpacerPinFront','baseSpacerPinRear'],focusPadding=12,operationPadding=8)
frame_refs=[2,15,20,23,119,121,123,125,262,265,268,271,'baseSpacerPinFront','baseSpacerPinRear']
put(2,18,'printer',actors=[
 a(frame_refs,'底枠を持ち上げて裏返し、切り欠きを手前に向ける',(1,0,0),handling=True,showBefore=True,focusMotion=True,motionPivot=[0,0,-55.713],posePath=[{'offset':[0,0,55],'rotation':[180,0,0]},{'offset':[0,0,250],'rotation':[180,0,0]},{'offset':[0,0,250],'rotation':[90,0,0]},{'offset':[0,0,55],'rotation':[0,0,0]},{'offset':[0,0,0],'rotation':[0,0,0]}]),
 unit('base','後ろ側を合わせ、ケーブルを挟まないよう底板を下ろす',(0,0,1),handling=True,focusMotion=True,motionPivot=[0,165,-2],posePath=[{'offset':[0,0,85],'rotation':[-12,0,0]},{'offset':[0,0,35],'rotation':[-12,0,0]},{'offset':[0,0,35],'rotation':[0,0,0]},{'offset':[0,0,0],'rotation':[0,0,0]}])
],context_from=['bottom'],note='底枠を裏返し、切り欠きのある前面プロファイルを手前に向けます。底板の後ろ側から合わせ、モーターのケーブルを中央へ逃がしてください。ケーブルを挟まないよう、手前側をゆっくり下ろします。')
base_entry(18).update(camera='perspective',operationCamera='perspective',operationPadding=12,settledFocus=[306,2,15,20,23])
put(2,19,'printer',actors=[base_screw(ref,label,(1,0,0),point,camera)for ref,label,point,camera in [
 (289,'右前の穴を合わせ、M3x4rTで固定する',[203.701,-170.699,-13.001],'base-front-right-perspective'),
 (291,'右後ろの穴を合わせ、M3x4rTで固定する',[203.701,171.301,-13.001],'base-rear-right-perspective')
]],note='右前の角から始めます。底板を少し持ち上げて穴を合わせ、M3x4rTで固定してください。合いにくい場合は、隣の穴に六角レンチを差して位置を保ちます。右後ろの角も同じように固定します。')
put(2,20,'printer',actors=[base_screw(ref,label,axis,point,camera)for ref,label,axis,point,camera in [
 (293,'後ろ右をM3x4rTで固定する',(0,1,0),[170.999,204.0,-13.0],'base-rear-perspective'),
 (296,'後ろ左をM3x4rTで固定する',(0,1,0),[-171.001,204.0,-13.0],'base-rear-perspective'),
 (297,'左後ろをM3x4rTで固定する',(-1,0,0),[-203.7,171.3,-12.999],'base-side-left-perspective'),
 (300,'左前をM3x4rTで固定する',(-1,0,0),[-203.7,-170.7,-12.999],'base-side-left-perspective'),
 (285,'前左をM3x4rTで固定する',(0,-1,0),[-171.0,-203.4,-13.0],'base-front-perspective'),
 (288,'前右をM3x4rTで固定する',(0,-1,0),[171.0,-203.4,-13.0],'base-front-perspective')
]],note='後ろ側を2本、左側を2本、最後に前面の切り欠きを手前に向けて2本、M3x4rTで固定します。各面に移るときは、本体を支えて向きを変えてください。')
for n in [19,20]:base_entry(n).update(camera='perspective',operationPadding=8,focusPadding=16)
# Stepper Splitter: wire it free of the pins, then press the connected board on.
# Mounting pitch and position use the front-profile CAD; connector dimensions
# and cable slack are supplemental illustrations from the official photographs.
SPLITTER=['stepperSplitter','splitterPlugJ6','splitterPlugJ7','splitterPlugJ1','splitterPlugJ5']
SPLITTER_HOLES=[[-95.183,y,-49.51320344]for y in [-175.48636944,-155.48636944]]
put(3,36,'splitter-prep',['stepperSplitter'],note='Stepper Splitter基板とケーブルを用意します。基板は端を持ち、端子や電子部品に触れないでください。',focus=['stepperSplitter'])
plans['build']['986033'].update(pose='underside',camera='splitter-prep-perspective',focusPadding=8)
ports=json.loads((root/'dist/assets/electronics/splitter.json').read_text())['ports']
labels=['J6：Stepper Splitterケーブルを差し込む','J7：Z-axis motor Rを差し込む','J1：Z-axis motor Lを差し込む','J5：もう1本のZ-axis motor Lを差し込む']
put(3,38,'printer',['splitterWires','splitterZRPlug'],actors=[a(['splitterPlug'+p['id']],label,(p['side'],0,0),distance=12,showBefore=True,focusMotion=True,focusRefs=['stepperSplitter','splitterPlug'+p['id']],anchors=[[-95.183+p['centre'][0]+p['side']*4.1,-175.48636944+p['centre'][1],-49.51320344-2.75+35]])for p,label in zip(ports,labels)],context_from=['splitter-prep'],focus=['stepperSplitter'],note='基板はまだピンに取り付けません。基板の印字と公式写真を照合し、4個のコネクターをまっすぐ奥まで差し込みます。見えるように底板と前面プロファイルを透過しています。')
plans['build']['986137'].update(pose='printer-back',workpiecePoses=[{'refs':SPLITTER,'pivot':[0,0,0],'rotation':[0,0,0],'offset':[0,0,35]}],camera='splitter-front-perspective',operationCamera='splitter-front-perspective',transparentRefs=[306,6],focusPadding=12,operationPadding=12)
put(3,39,'printer',actors=[a(SPLITTER,'基板の2つの穴をピンに合わせ、中央を押し込む',(0,0,1),distance=35,handling=True,focusMotion=True,focusRefs=['stepperSplitter'],anchors=SPLITTER_HOLES)],focus=['stepperSplitter','baseSpacerPinFront','baseSpacerPinRear'],note='裏面のPRUSAロゴを上下逆に向け、2つの穴をピンに合わせます。端子や部品を避けて中央を押し、カチッと固定してください。底板と前面プロファイルは透過表示です。基板・端子・ピンの変形は模式表示です。')
plans['build']['986187'].update(pose='printer-back',camera='splitter-back-perspective',operationCamera='splitter-back-perspective',transparentRefs=[306,6],focusPadding=12,operationPadding=12,settledFocus=['stepperSplitter','baseSpacerPinFront','baseSpacerPinRear'])

# Keep the free xBuddy end where it was left until the next manual action.
ZR_END=[-99.5661731345,173.85172,161.7707382195]
def zr_pose(point,rotation):return dict(refs=['splitterZRPlug'],pivot=ZR_END,rotation=[rotation,0,0],offset=[p-q for p,q in zip(point,ZR_END)])
def zr_path(rows):return [dict(offset=[p-q for p,q in zip(point,ZR_END)],rotation=[rotation,0,0])for point,rotation in rows]
for step in range(38,41):
    s=next(x for x in flows['build']['steps']if x['chapter']==2 and x['officialStep']==step)
    plans['build'].setdefault(str(s['officialId']),dict(workspace='printer',seed=[],actors=[],note='',focus=[])).setdefault('workpiecePoses',[]).append(zr_pose([-182,151,-5],180))
route_actor=a(['splitterZRPlug'],'Stepper Splitterケーブルを楕円穴へ通す',(0,0,1),showBefore=True,handling=True,focusMotion=True,motionPivot=ZR_END,posePath=zr_path([([-182,151,-5],180),([-130,170,-14],180),([-130,170,-14],270),([-130,170,8],270)]),focusBounds=[-193,143,-22,-85,186,22],camera='splitter-route-perspective',anchors=[ZR_END])
plans['build']['986277']['actors'].insert(0,route_actor)
plans['build']['986277'].update(camera='splitter-route-perspective',operationCamera='splitter-route-perspective',focusPadding=10,operationPadding=10,transparentRefs=[15])
for step in range(42,48):
    s=next(x for x in flows['build']['steps']if x['chapter']==2 and x['officialStep']==step)
    plans['build'].setdefault(str(s['officialId']),dict(workspace='printer',seed=[],actors=[],note='',focus=[])).setdefault('workpiecePoses',[]).append(zr_pose([-130,170,8],270))
put(3,48,'printer',actors=[a(['splitterZRPlug'],'Stepper SplitterケーブルをxBuddyのZRに差し込む',(0,1,0),showBefore=True,focusMotion=True,motionPivot=ZR_END,posePath=zr_path([([-130,170,8],270),([-145,194,28],270),([-145,194,168],270),([-110,194,175],360),([-99.5661731345,185.85172,161.7707382195],360),(ZR_END,360)]),focusBounds=[-158,154,138,-74,201,186],camera='splitter-zr-perspective',anchors=[[-99.5661731345,169,161.7707382195]])],focus=['xBuddy','splitterZRPlug'],note='先にFEコネクター④をM3x6とM3wで固定し、⑤をボックス横の穴から外へ通します。その後、Stepper Splitterケーブルをボックスに沿わせ、上段の右から2番目、ZRへ差し込みます。FE端子の固定と取り回しは公式写真で確認してください。')
plans['build']['986601'].update(pose='printer-standing',camera='splitter-zr-perspective',operationCamera='splitter-zr-perspective',operationPadding=9,focusPadding=8)
zr_route=plans['build']['986601']['actors'][0]
zr_route['posePath'].pop()
zr_route.update(label='Stepper Splitterケーブルをボックスに沿わせる',focusBounds=[-158,154,5,-74,201,220],anchors=[ZR_END],handling=True)
plans['build']['986601']['actors'].append(a(['splitterZRPlug'],'Stepper SplitterケーブルをxBuddyのZRに差し込む',(0,1,0),distance=12,reuse=True,focusMotion=True,focusBounds=[-126,160,150,-78,186,178],camera='splitter-zr-perspective',anchors=[[-99.5661731345,169,161.7707382195]]))


# FE4 uses the vacant sixth xBuddy hole. Keep its washer between head and lug;
# neither source hardware item is replaced by a featureless cylinder.
FE4_AXIS=[-134.199394,165.571722,33.645974]
FE4_LOOSE=[-137,190,48]
FE4_PARTS=['feGroundRing','feGroundWire','feGroundWasher','feGroundScrew']
fe47=next(s for s in flows['build']['steps']if s['chapter']==2 and s['officialStep']==47)
put(3,47,'printer',FE4_PARTS,focus=['xBuddy','feGroundRing','feGroundWasher','feGroundScrew'])
plans['build'][str(fe47['officialId'])]['workpiecePoses']=[zr_pose([-130,170,8],270)]
plans['build'][str(fe47['officialId'])].update(pose='printer-standing',camera='fe-ground-perspective',focusPadding=10)
plans['build'][str(fe47['officialId'])]['workpiecePoses'] += [dict(refs=['feGroundRing'],pivot=FE4_AXIS,rotation=[0,0,0],offset=[p-q for p,q in zip(FE4_LOOSE,FE4_AXIS)]),dict(refs=['feGroundWasher'],pivot=FE4_AXIS,rotation=[0,0,0],offset=[18,16,0]),dict(refs=['feGroundScrew'],pivot=FE4_AXIS,rotation=[0,0,0],offset=[28,28,0])]
fe48=plans['build']['986601']
fe48['actors'][:0]=[
 a(['feGroundRing'],'FEコネクター④の丸端子を右下の穴に合わせる',(0,1,0),showBefore=True,focusMotion=True,handling=True,motionPivot=FE4_AXIS,posePath=[dict(offset=[p-q for p,q in zip(FE4_LOOSE,FE4_AXIS)],rotation=[0,0,0]),dict(offset=[0,12,0],rotation=[0,0,0]),dict(offset=[0,0,0],rotation=[0,0,0])],focusBounds=[-153,157,13,-118,205,58],camera='fe-ground-perspective',anchors=[FE4_AXIS]),
 a(['feGroundWasher'],'M3wを丸端子の上に重ねる',(0,1,0),waypoints=[[18,16,0],[0,16,0],[0,0,0]],showBefore=True,focusMotion=True,focusBounds=[-146,158,23,-109,194,47],camera='fe-ground-perspective',anchors=[[-134.199394,166.471722,33.645974]]),
 a(['feGroundScrew'],'M3x6で端子とワッシャーを固定する',(0,1,0),waypoints=[[28,28,0],[0,28,0],[0,0,0]],spin=720,showBefore=True,focusMotion=True,focusBounds=[-147,157,22,-101,203,48],camera='fe-ground-perspective',anchors=[[-134.199394,166.871722,33.645974]])]

# Every official step has a scene, including non-geometric work. Carry bench context
# only inside the specified range, and never carry a loose preview into another step.
for flow,f in flows.items():
    for s in f['steps']:
        p=plans[flow].setdefault(str(s['officialId']),{'workspace':'printer','seed':[],'actors':[],'note':'','focus':[]})
        p['chapter']=s['chapter']+1;p['step']=s['officialStep']
        if not p['actors'] and not p['note']:
            p['note']='部品と工具を公式写真で確認してください。' if s['kind']=='prepare' else '配線とコネクターの向きは公式写真で確認してください。' if s['kind']=='connect' else 'この手順は公式写真と説明を確認して進めてください。'
        p['overview']=bool(s.get('overview') or s.get('final') or (flow=='build' and s['chapter']==0))
        p['variant']=s.get('variant')
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output',type=Path,default=root/'dist/assembly-plan.js')
parser.parse_args().output.write_text('export const ASSEMBLY_PLAN='+json.dumps(plans,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print({f:{'scenes':len(p),'animated_steps':sum(bool(x['actors']) for x in p.values()),'operations':sum(len(x['actors']) for x in p.values())} for f,p in plans.items()})
