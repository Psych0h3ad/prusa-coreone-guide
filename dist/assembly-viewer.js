import {PrinterViewer as SourceViewer} from './viewer.js?v=20261113-118';
import {installBox4CloseViewer} from './electronics-ties/install.js?v=box4-v1';
export class PrinterViewer extends SourceViewer {
 constructor(container,pick,onReady){
  super(container,pick,ok=>{
   if(!ok){onReady?.(false);return;}
   if(this.disposed)return;
   installBox4CloseViewer(this);
   // The source's first state can precede the new guide provider.
   if(this.state){this.sceneSignature=undefined;this.setState(this.state);}
   onReady?.(true);
  });
 }
}
