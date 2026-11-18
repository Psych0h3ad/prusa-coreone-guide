import{installStep349WorkingView}from'./camera/working-view.js?v=20261113-116';
import{PrinterViewer as SourceViewer}from'../assembly-viewer.js?v=20261113-118';
import{translateDOM}from'./text.js?v=20261112-113';
import{prepareStep349Inputs}from'./inputs.js';
import{prepareSharedFE,createSharedFEOwner}from'../fe-harness-owner.js';
import{FLOWS}from'../data.js?v=20261112-113';
import{isPhysicalFEPlus}from'../fe-source-state.js';
import{createNativeJoinConsumer}from'./native/composition.js';
import{installStep349WithComponent13}from'./proxy/install.js?v=20261113-116';
import{createModelLoading}from'../model-loading.js';
// Loaded only when 3D is requested. Base CAD parsing and required cable inputs
// run together; ready still waits for the complete model and native owners.
export class PrinterViewer extends SourceViewer{
 constructor(container,pick,onReady){super(container,pick,ok=>{if(!ok){onReady?.(false);return;}if(this.disposed)return;installStep349WithComponent13(this,{inputs:this.step349Inputs,native:this.step349PreparedNative});installStep349WorkingView(this);this.step349PreparedNative=undefined;onReady?.(true);});}
 async load(){
  const loadingUI=createModelLoading(this.container,{stage:'network',withCableInputs:true});this.loadingUI=loadingUI;const loading=loadingUI.element;this.loadingElement=loading;
  let inputsReady=false,files=0;
  let preparedCAD,preparedInputs,adopted=false,released=false;
  const release=()=>{if(!preparedCAD||adopted||released)return;released=true;const geometries=new Set(),materials=new Set(),textures=new Set();preparedCAD.scene.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const m of(Array.isArray(node.material)?node.material:[node.material]).filter(Boolean))materials.add(m);});for(const m of materials)for(const value of Object.values(m))if(value?.isTexture)textures.add(value);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());};
  const cad=this.loadSourceCAD(loadingUI.transfer,loadingUI.stage).then(gltf=>{preparedCAD=gltf;if(this.disposed)release();else if(!inputsReady)loadingUI.stage('inputs');return gltf;});
  try{
  const read=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Step349 input unavailable: '+url);const b=new Uint8Array(await r.arrayBuffer());loadingUI.files(++files);return b;};const inputsJob=(isPhysicalFEPlus(FLOWS)?prepareSharedFE(read).then(data=>{if(this.disposed)return;this.sharedFE=createSharedFEOwner(this,data);return prepareStep349Inputs(read,{feHarness:this.sharedFE});}):prepareStep349Inputs(read)).then(inputs=>{preparedInputs=inputs;if(this.disposed)inputs?.releaseSourceTemplates?.();inputsReady=true;return inputs;});
  const [gltf,inputs]=await Promise.all([cad,inputsJob]);if(this.disposed){inputs?.releaseSourceTemplates?.();release();return;}this.step349Inputs=inputs;loadingUI.stage('routes');if(!await loadingUI.paint()){release();return;}
  let native;try{native=await createNativeJoinConsumer({root:this.printer,source:this.step349Inputs.boundary.seatedProxyReference,packetOptions:this.step349Inputs.packetOptions});}finally{inputs.releaseSourceTemplates?.();}
  if(this.disposed){native.dispose();release();return;}native.packet.group.visible=false;native.packet.group.removeFromParent();this.step349PreparedNative=native;
  loadingUI.remove();if(this.loadingElement===loading)this.loadingElement=undefined;if(this.loadingUI===loadingUI)this.loadingUI=undefined;
  adopted=true;return await super.load(gltf);
  }catch(error){preparedInputs?.releaseSourceTemplates?.();release();cad.then(release,()=>{});throw error;}
 }
 dispose(){const native=this.step349PreparedNative;this.step349PreparedNative=undefined;try{return super.dispose();}finally{native?.dispose();}}
}
