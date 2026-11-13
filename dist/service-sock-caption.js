export const SOCK_CONDITION=['装着していた場合はソックを戻す','Refit the sock if it was installed','Pokud byl návlek nasazen, vraťte jej','Socke wieder aufsetzen, falls sie montiert war'];
export function installServiceSockCaption(viewer,binding,text){
 if(viewer.serviceSockCaption)return;
 const applies=state=>state?.flow==='service'&&binding.rows[state.index]?.task.id==='nozzle'&&binding.rows[state.index]?.s.action==='nozzle-in';
 const prior=viewer.director.scene.bind(viewer.director);
 viewer.director.scene=state=>{const scene=prior(state);if(!applies(state))return scene;const label=text(SOCK_CONDITION),set=a=>a.refs?.includes('serviceSock')?{...a,label}:a;return {...scene,plan:{...scene.plan,actors:scene.plan.actors.map(set)},actors:scene.actors.map(set)};};
 const localize=binding.localize.bind(binding);binding.localize=()=>{localize();if(applies(viewer.state)){const label=text(SOCK_CONDITION);for(const list of [viewer.operationScene.plan.actors,viewer.sceneActors])for(const a of list)if(a.refs?.includes('serviceSock'))a.label=label;}};
 viewer.serviceSockCaption=true;
}
