// Called by the existing viewer after rigid actors/workpiece poses, including
// zero-actor stages. No callback replacement or extra disposal owner.
export function followSideIRService(viewer){
 const owner=viewer.sideIRService;
 if(!owner||viewer.disposed||viewer.state?.flow!=='service'||!viewer.operationScene?.plan.sideIRService)return;
 const q=owner.lead.mesh.userData.flexState;
 owner.lead.update(q?.from??1,q?.to??1,q?.t??1);
 owner.mainPTFE.update();
}
