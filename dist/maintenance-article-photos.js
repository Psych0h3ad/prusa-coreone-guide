// Article photographs identify the cleaning opening separately from the PTFE inlet.
const article='https://help.prusa3d.com/article/nextruder-filament-sensor-core-one-core-one-l-mk4-s-mk3-9-s-xl_465702';
const cleaningPhoto='https://help.prusa3d.com/wp-content/uploads/2025/01/859c4b64938a549dbc38d6d73352d0da_painted.jpeg';
export function attachArticlePhotos(tasks){
 const rail=tasks.find(t=>t.id==='rail');
 const railArticle='https://help.prusa3d.com/article/regular-printer-maintenance-core-one_829710';
 rail.steps[1].sourcePhotos=[
  'https://help.prusa3d.com/wp-content/uploads/2026/07/3ff40b87603f8fe8064625e0affb464b.jpeg',
  'https://help.prusa3d.com/wp-content/uploads/2026/07/d69369a20424161790a3b9b8b34a2ed6.jpeg'
 ].map(url=>({url,full:url,credit:['写真：Prusa Research — 公式メンテナンス記事','Photo: Prusa Research — official maintenance guide','Fotografie: Prusa Research — oficiální návod k údržbě','Foto: Prusa Research — offizielle Wartungsanleitung'],source:railArticle}));
 rail.steps[1].supplementalSources=[...(rail.steps[1].supplementalSources||[]),{label:['Prusa Research：X軸レールの注油位置（写真2枚）','Prusa Research: X-rail lubrication points (two photos)','Prusa Research: mazací místa kolejnice X (dvě fotografie)','Prusa Research: Schmierstellen der X-Schiene (zwei Fotos)'],url:railArticle}];
 const sensor=tasks.find(t=>t.id==='sensor-clean');
 for(const step of sensor.steps.slice(0,3)){
  step.refs=['sensorAirHoleMarker'];
  step.source=article+'#how-to-clean-the-filament-sensor';
  step.sourcePhotos=[{url:cleaningPhoto,full:cleaningPhoto}];
 }
 sensor.steps[0].body[0]='公式の上面写真で、フィラメント入口の横にある小さな清掃穴を確認します。エアを入れる穴と、フィラメントを出し入れする入口は別です。糸を引いていない、切り口のきれいなフィラメントを用意します。';
 sensor.steps[1].body[0]='小さな清掃穴からエアを吹き、もう片方の手でフィラメントを入口へ何度か出し入れします。エア缶は逆さにしません。';
 sensor.steps[3].body[0]='清掃しても改善しないときに、機構を取り外して清掃します。先にPG-assembly-adapterを用意してください。アンロード・完全冷却・電源切断の後、関連する作業の「Nextruder内部の清掃（上級）」で分解・清掃・復旧を進めます。復旧後のギアボックス調整まで行ってください。Hall基板の交換は別の手順です。';
 sensor.steps[3].supplementalSources=[
  {language:'ja',label:'機構を取り外して清掃する（公式記事）',url:article+'#how-to-clean-the-filament-sensor'},
  {language:'ja',label:'Hall基板を交換する場合の公式手順',url:'https://help.prusa3d.com/guide/how-to-replace-nextruder-filament-sensor-core-one_922421'},
  {language:'ja',label:'作業後のギアボックス調整',url:'https://help.prusa3d.com/article/gearbox-alignment-core-one-l-core-one-xl-mk4-s-mk3-9-s_465779'}
 ];
}
