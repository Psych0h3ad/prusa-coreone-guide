// DOM-only local diagnostics. No renderer imports, network, storage or telemetry.
const instances=new WeakMap();
const words={
 title:['動作状況','Activity','Stav','Status'],
 debug:['技術情報（参考値）','Technical information (reference)','Technické údaje (orientační)','Technische Angaben (Richtwerte)'],
 phase:['現在の処理','Current work','Aktuální činnost','Aktueller Vorgang'],
 idle:['待機中','Idle','Nečinné','Bereit'],
 showing:['3Dを表示中','3D view active','3D zobrazení je aktivní','3D-Ansicht aktiv'],
 elapsed:['準備の経過','Preparation elapsed','Doba přípravy','Vorbereitungsdauer'],
 phaseTime:['この処理の経過','Current phase elapsed','Doba aktuální fáze','Dauer dieser Phase'],
 last:['進捗の最終更新','Since progress changed','Od poslední změny postupu','Seit letzter Fortschrittsänderung'],
 seconds:['秒','s','s','s'],
 tab:['タブ全体のRAM','Total tab RAM','Celková RAM karty','Gesamter RAM des Tabs'],
 unavailable:['取得できません','Unavailable','Není k dispozici','Nicht verfügbar'],
 heap:['JSヒープ（参考値）','JS heap (reference)','JS halda (orientačně)','JS-Heap (Richtwert)'],
 buffers:['3D CPUバッファ（集計）','3D CPU buffers (tracked)','3D CPU buffery (evidované)','3D-CPU-Puffer (erfasst)'],
 textures:['テクスチャ画像（概算）','Texture images (estimate)','Obrázky textur (odhad)','Texturbilder (Schätzung)'],
 renderer:['描画オブジェクト数','Renderer counts','Počty vykreslování','Rendering-Anzahlen'],
 workers:['表面処理 worker（稼働／上限）','Surface workers (active / limit)','Pracovníci povrchů (aktivní / limit)','Oberflächen-Worker (aktiv / Limit)'],
 activeWorkers:['稼働','active','aktivní','aktiv'],
 notStarted:['3D未開始','3D not started','3D není spuštěno','3D noch nicht gestartet'],
 geometry:['形状','geometries','geometrie','Geometrien'],
 textureCount:['画像','textures','textury','Texturen'],
 calls:['描画','draw calls','vykreslení','Zeichenaufrufe'],
 unknown:['不明','unknown','neznámé','unbekannt'],
 page:['ページメモリ（API概算）','Page memory (API estimate)','Paměť stránky (odhad API)','Seitenspeicher (API-Schätzung)'],
 notMeasured:['未計測','Not measured','Nezměřeno','Nicht gemessen'],
 measure:['ページメモリを計測','Measure page memory','Změřit paměť stránky','Seitenspeicher messen'],
 measuring:['計測中','Measuring','Měření','Messung läuft'],
 failed:['計測できませんでした','Measurement unavailable','Měření není k dispozici','Messung nicht verfügbar'],
 note:['参照できたデータのみです。RAM・GPU全体の使用量ではありません。テクスチャは基底画像のRGBA8換算です。閉じると周期計測を止めます。','Only accessible data is counted, not total RAM or GPU usage. Textures use an RGBA8 base-image estimate. Closing stops periodic sampling.','Počítají se jen dostupná data, nikoli celková spotřeba RAM nebo GPU. Textury jsou odhad základního obrázku RGBA8. Zavřením se pravidelné měření zastaví.','Erfasst werden nur zugängliche Daten, nicht der gesamte RAM- oder GPU-Verbrauch. Texturen werden als RGBA8-Basisbild geschätzt. Schließen beendet die regelmäßige Erfassung.']
};
const css='.resource-monitor{position:absolute;top:58px;left:12px;right:auto;z-index:14;max-width:calc(100% - 24px);max-height:calc(100% - 70px);overflow:auto;box-sizing:border-box;border:1px solid var(--line,#e3e5de);border-radius:9px;background:#fffffff5;color:var(--ink,#242622);font:12px/1.45 Inter,Arial,sans-serif;overscroll-behavior:contain}.resource-monitor[open]{width:320px;box-shadow:0 3px 14px #24262212}.resource-monitor>summary{min-height:44px;padding:10px 12px;box-sizing:border-box;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;background:#fff;position:sticky;top:0;z-index:1}.resource-monitor>summary:active{background:#f1f2ed}.resource-monitor>summary:focus-visible{outline:2px solid #fd5000;outline-offset:-3px}.resource-monitor-body{padding:0 12px 12px}.resource-monitor dl{margin:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:7px 10px}.resource-monitor dt,.resource-monitor dd{margin:0;overflow-wrap:anywhere}.resource-monitor dd{text-align:right;font-variant-numeric:tabular-nums}.resource-monitor p{font-size:11px;color:#686e64;margin:10px 0 0}.resource-monitor button{min-height:44px;font-size:12px;touch-action:manipulation;user-select:none;-webkit-user-select:none;border:1px solid #e3e5de;border-radius:6px;background:#fff;color:inherit;padding:6px 10px;width:100%;margin-top:10px}.resource-monitor button:active{background:#f1f2ed}.model-loading .model-loading-elapsed{font-size:12px;font-variant-numeric:tabular-nums;color:#686e64;line-height:1.4}.resource-monitor [hidden]{display:none!important}@media(hover:hover) and (pointer:fine){.resource-monitor>summary:hover{background:#f5f5f2}}';
const finite=n=>Number.isFinite(n)&&n>=0;
export function readSurfaceWorkerActivity(viewer){const s=viewer&&!viewer.disposed?viewer.surfacePreparationStats:null;return Number.isInteger(s?.workerActive)&&Number.isInteger(s?.workers)&&s.workerActive>=0&&s.workers>=s.workerActive?{active:s.workerActive,limit:s.workers}:null;}

// Counts known retained backing stores once. This is not all JS/worker/tab RAM.
export function estimateViewerResources(viewer){
 if(!viewer||viewer.disposed)return null;
 const geometries=new Set(),materials=new Set(),buffers=new Set(),textures=new Set(),images=new Set();let cpuBytes=0,pixels=0,unknownImages=0;
 const buffer=a=>{const b=a?.buffer;if(b&&finite(b.byteLength)&&!buffers.has(b)){buffers.add(b);cpuBytes+=b.byteLength;}};
 const attribute=a=>buffer(a?.array||a?.data?.array);
 const geometry=g=>{if(!g||geometries.has(g))return;geometries.add(g);for(const a of Object.values(g.attributes||{}))attribute(a);attribute(g.index);for(const list of Object.values(g.morphAttributes||{}))for(const a of list)attribute(a);};
 const material=m=>{if(m)materials.add(m);};
 const visit=n=>{geometry(n.geometry);for(const key of['sourceGeometry','referenceGeometry','guideGeometry20'])geometry(n.userData?.[key]);for(const m of(Array.isArray(n.material)?n.material:[n.material]))material(m);attribute(n.instanceMatrix);attribute(n.instanceColor);};
 for(const root of[viewer.printer,viewer.pendingCAD,viewer.arrowLayer])if(root?.traverse)root.traverse(visit);
 for(const n of viewer.meshes||[])visit(n);
 for(const g of viewer.preparationGeometries?.keys?.()||[])geometry(g);
 for(const entity of viewer.mainLoom?.entities||[])if(entity.mesh)visit(entity.mesh);
 for(const n of viewer.fasteners?.meshes||[])visit(n);
 for(const hardware of[viewer.ventHardware,viewer.sensorHardware])for(const g of hardware?.geometries||[])geometry(g);
 for(const m of viewer.sourceCADMaterials||[])material(m);
 const tex=value=>{if(value?.isTexture)textures.add(value);else if(Array.isArray(value))for(const v of value)tex(v);};
 for(const m of materials){Object.values(m).forEach(tex);for(const u of Object.values(m.uniforms||{}))tex(u?.value);}
 tex(viewer.scene?.environment);tex(viewer.scene?.background);
 const image=im=>{if(Array.isArray(im)){im.forEach(image);return;}if(!im||images.has(im))return;images.add(im);const w=im.videoWidth||im.naturalWidth||im.width,h=im.videoHeight||im.naturalHeight||im.height,d=im.depth??1;if(finite(w)&&w>0&&finite(h)&&h>0&&finite(d)&&d>0)pixels+=w*h*d*4;else unknownImages++;};
 const unknownSources=new Set();for(const t of textures){const im=t.source?.data??t.image;if(im)image(im);else{const id=t.source||t;if(!unknownSources.has(id)){unknownSources.add(id);unknownImages++;}}}
 const info=viewer.renderer?.info,num=n=>finite(n)?n:null;
 return{cpuBufferBytes:cpuBytes,cpuBackingBuffers:buffers.size,geometries:geometries.size,textureBaseRGBA8EstimateBytes:pixels,unknownTextureImages:unknownImages,trackedTextures:textures.size,surfaceWorkers:readSurfaceWorkerActivity(viewer),renderer:info?{geometries:num(info.memory?.geometries),textures:num(info.memory?.textures),drawCalls:num(info.render?.calls)}:null};
}

export function readBrowserMemory(perf=globalThis.performance){
 let heap=null;try{const m=perf?.memory;if(finite(m?.usedJSHeapSize))heap={usedBytes:m.usedJSHeapSize,allocatedBytes:finite(m.totalJSHeapSize)?m.totalJSHeapSize:null};}catch{}
 return{tabRAMBytes:null,heap,pageMeasurementAvailable:globalThis.isSecureContext===true&&globalThis.crossOriginIsolated===true&&typeof perf?.measureUserAgentSpecificMemory==='function'};
}

export function attachResourceMonitor({container,getViewer=()=>null,language=()=>document.documentElement.lang,intervalMS=2000}={}){
 if(!container?.parentElement)throw TypeError('Resource monitor requires a mounted canvas container');
 if(instances.has(container))return instances.get(container);
 const doc=container.ownerDocument||document,host=container.parentElement,perf=globalThis.performance,now=()=>perf?.now?.()??Date.now(),interval=Math.max(1500,Number.isFinite(intervalMS)?intervalMS:2000);
 if(!doc.querySelector('[data-resource-monitor-style]')){const style=doc.createElement('style');style.dataset.resourceMonitorStyle='true';style.textContent=css;doc.head.append(style);}
 const root=doc.createElement('details');root.className='resource-monitor';root.dataset.resourceMonitorOwned='true';root.setAttribute('data-no-translate','');
 const dock=host.querySelector('.stage-utilities'),mount=dock||host;
 const summary=doc.createElement('summary'),body=doc.createElement('div'),kind=doc.createElement('p'),list=doc.createElement('dl'),note=doc.createElement('p'),measure=doc.createElement('button');body.className='resource-monitor-body';measure.type='button';root.append(summary,body);body.append(kind,list,measure,note);mount.append(root);
 const fields={};for(const key of['phase','elapsed','phaseTime','last','tab','heap','buffers','textures','renderer','workers','page']){const label=doc.createElement('dt'),value=doc.createElement('dd');value.setAttribute('aria-live','off');list.append(label,value);fields[key]={label,value};}
 let disposed=false,timer=null,active=false,start=null,end=null,phaseStart=null,lastCheckpoint=null,lastSignature='',lastPhaseKey=null,lastLabel='',elapsedNode=null,lastLoader=null,stats=null,browser=readBrowserMemory(perf),sampleTime=-Infinity,pageBytes=null,pageFailed=false,pagePending=null,generation=0;
 const lang=()=>Math.max(0,['ja','en','cs','de'].indexOf(language())),word=k=>words[k][lang()],seconds=n=>finite(n)?`${(Math.max(0,n)/1000).toFixed(1)} ${word('seconds')}`:'—',mb=n=>finite(n)?`${new Intl.NumberFormat(['ja','en','cs','de'][lang()],{maximumFractionDigits:1}).format(n/1e6)} MB`:'—';
 const hidden=()=>doc.hidden||doc.visibilityState==='hidden';
 function stopTimer(){if(timer!==null){clearTimeout(timer);timer=null;}}
 function schedule(){stopTimer();if(!disposed&&root.open&&!hidden())timer=setTimeout(()=>{timer=null;if(disposed||!root.open||hidden())return;refresh();schedule();},interval);}
 function place(){if(disposed)return;if(dock){const stage=host.getBoundingClientRect(),panel=root.getBoundingClientRect(),presets=host.querySelector('.view-controls')?.getBoundingClientRect(),bottom=presets?.height&&presets.top>panel.top+48?Math.min(stage.bottom,presets.top):stage.bottom,height=Math.max(48,bottom-panel.top-8)+'px';if(root.style.maxHeight!==height)root.style.maxHeight=height;return;}const width=container.clientWidth,left=container.offsetLeft;if(finite(width)&&width>0){root.style.maxWidth=Math.max(0,width-24)+'px';if(finite(left)){root.style.left=Math.max(0,left)+12+'px';root.style.right='auto';}}}
 function captureLoading(){
  const loading=[...container.querySelectorAll('.model-loading')].at(-1),t=now();
  if(!loading){if(active)end=t;active=false;lastLoader=null;elapsedNode?.remove();elapsedNode=null;return;}
  if(!active){start=t;end=null;}active=true;
  const label=loading.querySelector('.model-loading-stage')?.textContent||'',key=loading.dataset.loadingStage||null,sig=[key,label,loading.querySelector('.model-loading-count')?.textContent||'',loading.querySelector('.model-loading-amount')?.textContent||'',loading.querySelector('.model-loading-detail')?.textContent||''].join('|');
  if(lastLoader!==loading||key!==lastPhaseKey){phaseStart=key?t:null;lastPhaseKey=key;}if(sig!==lastSignature||lastLoader!==loading){lastCheckpoint=t;lastSignature=sig;}lastLabel=label;lastLoader=loading;
  if(!elapsedNode||elapsedNode.parentElement!==loading){elapsedNode?.remove();elapsedNode=doc.createElement('small');elapsedNode.className='model-loading-elapsed';elapsedNode.dataset.resourceMonitorOwned='true';elapsedNode.setAttribute('aria-live','off');loading.append(elapsedNode);}
 }
 function render(){if(disposed)return;const t=now(),elapsed=start===null?null:(active?t:end)-start,viewer=getViewer();summary.textContent=word('title');note.textContent=word('note');for(const[key,row]of Object.entries(fields))row.label.textContent=word(key);const values={phase:active?lastLabel:viewer&&!viewer.disposed&&viewer.loaded?word('showing'):word('idle'),elapsed:seconds(elapsed),phaseTime:active&&phaseStart!==null?seconds(t-phaseStart):'—',last:active&&lastCheckpoint!==null?seconds(t-lastCheckpoint):'—',tab:word('unavailable'),heap:browser.heap?mb(browser.heap.usedBytes):word('unavailable'),buffers:stats?mb(stats.cpuBufferBytes):word('notStarted'),textures:stats?`${mb(stats.textureBaseRGBA8EstimateBytes)}${stats.unknownTextureImages?` + ${stats.unknownTextureImages} ${word('unknown')}`:''}`:word('notStarted'),renderer:stats?.renderer?`${stats.renderer.geometries??'—'} ${word('geometry')} · ${stats.renderer.textures??'—'} ${word('textureCount')} · ${stats.renderer.drawCalls??'—'} ${word('calls')}`:word('unavailable'),page:pageFailed?word('failed'):pageBytes===null?word('notMeasured'):mb(pageBytes)};
  const workerState=readSurfaceWorkerActivity(viewer);values.workers=workerState?(workerState.limit?`${workerState.active} / ${workerState.limit}`:`0 ${word('activeWorkers')}`):word('unavailable');
  kind.textContent=word('debug');summary.setAttribute('aria-label',`${word('title')} · ${word('debug')}`);for(const[key,value]of Object.entries(values))if(fields[key].value.textContent!==value)fields[key].value.textContent=value;
  fields.page.label.hidden=fields.page.value.hidden=!browser.pageMeasurementAvailable;measure.hidden=!browser.pageMeasurementAvailable;measure.disabled=!!pagePending;measure.textContent=word(pagePending?'measuring':'measure');if(elapsedNode){const text=`${word('elapsed')} ${seconds(elapsed)}`;if(elapsedNode.textContent!==text)elapsedNode.textContent=text;}
 }
 function refresh({force=false}={}){if(disposed)return;captureLoading();if(root.open&&!hidden()&&(force||now()-sampleTime>=interval)){browser=readBrowserMemory(perf);stats=estimateViewerResources(getViewer());sampleTime=now();}render();}
 function toggle(){if(disposed)return;const viewer=getViewer();if(viewer&&!viewer.disposed){viewer.calloutLayout=null;viewer.dirty=true;}if(!root.open){generation++;stopTimer();return;}place();refresh({force:true});schedule();}
 function visibility(){if(disposed)return;if(hidden())stopTimer();else if(root.open){refresh({force:true});schedule();}}
 const observer=typeof MutationObserver==='function'?new MutationObserver(records=>{if(disposed)return;if(records.some(r=>!r.target?.closest?.('[data-resource-monitor-owned]')))refresh();}):null;observer?.observe(container,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-loading-stage']});
 const localeObserver=typeof MutationObserver==='function'?new MutationObserver(()=>refresh()):null;localeObserver?.observe(doc.documentElement,{attributes:true,attributeFilter:['lang']});
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(place):null;resize?.observe(container);resize?.observe(host);if(dock)resize?.observe(dock);
 const block=e=>e.stopPropagation(),key=e=>{if(e.key==='Escape'&&root.open){root.open=false;toggle();summary.focus();e.stopPropagation();}},pagehide=e=>{if(!e.persisted)api.dispose();else stopTimer();};
 for(const name of['pointerdown','pointerup','click','wheel'])root.addEventListener(name,block);root.addEventListener('keydown',key);root.addEventListener('toggle',toggle);doc.addEventListener('visibilitychange',visibility);globalThis.addEventListener?.('resize',place);globalThis.addEventListener?.('pagehide',pagehide);globalThis.addEventListener?.('pageshow',visibility);
 const measureMemory=()=>{if(disposed||!root.open||pagePending||!readBrowserMemory(perf).pageMeasurementAvailable)return;const token=generation;pageFailed=false;const job=Promise.resolve().then(()=>{if(disposed||!root.open||generation!==token)return null;return perf.measureUserAgentSpecificMemory();});pagePending=job;render();job.then(result=>{if(!disposed&&root.open&&generation===token){if(finite(result?.bytes))pageBytes=result.bytes;else pageFailed=true;}},()=>{if(!disposed&&root.open&&generation===token)pageFailed=true;}).finally(()=>{if(pagePending===job)pagePending=null;if(!disposed&&root.open&&generation===token)render();});};measure.addEventListener('click',measureMemory);
 const api={element:root,checkpoint:refresh,getSnapshot:()=>({active,elapsedMS:start===null?null:(active?now():end)-start,phase:lastLabel,stats,surfaceWorkers:disposed?null:readSurfaceWorkerActivity(getViewer()),browser,pageBytes}),dispose(){if(disposed)return;if(active)end=now();active=false;disposed=true;generation++;stopTimer();observer?.disconnect();localeObserver?.disconnect();resize?.disconnect();doc.removeEventListener('visibilitychange',visibility);globalThis.removeEventListener?.('resize',place);globalThis.removeEventListener?.('pagehide',pagehide);globalThis.removeEventListener?.('pageshow',visibility);for(const name of['pointerdown','pointerup','click','wheel'])root.removeEventListener(name,block);root.removeEventListener('keydown',key);root.removeEventListener('toggle',toggle);measure.removeEventListener('click',measureMemory);elapsedNode?.remove();elapsedNode=null;stats=null;root.remove();instances.delete(container);}};
 instances.set(container,api);place();refresh();return api;
}
