import assert from 'node:assert/strict';
import {SERVICE_TASKS} from '../dist/maintenance-data.js';
import {OFFICIAL_MAINTENANCE_JA} from '../dist/official-maintenance-ja.js';
import {findOfficialGuides} from '../dist/maintenance-library.js';
import {firmwareFrames} from '../dist/firmware-step-guide.js';
import {firmwareActions} from '../dist/firmware-navigation.js';
for(const [id,source] of [['firmware-update','453086'],['firmware-reflash','725930']]){
 const task=SERVICE_TASKS.find(task=>task.id===id);
 assert(task&&task.steps.length===6,'complete preparation, USB, boot, confirmation and result sequence');
 assert.equal(task.category,3);
 assert(OFFICIAL_MAINTENANCE_JA.guides.find(guide=>guide.id===source).tasks.includes(id));
 assert(findOfficialGuides({query:id==='firmware-update'?'ファームウェア 更新':'ファームウェア 戻す'}).some(guide=>guide.tasks?.includes(id)),'catalog opens actual in-site procedure');
 for(const [index,step]of task.steps.entries()){
  assert.equal(step.number,index+1);
  assert(step.source.startsWith('https://help.prusa3d.com/article/'));
  assert(step.source.split('#')[0].endsWith('_'+source));
  for(const copy of [step.title,step.body])assert(copy.length===4&&copy.every(value=>value.trim()),'four authored languages');
  assert.deepEqual(firmwareActions(task,step),[],'bootloader work is not silently mapped to an unrelated menu');
  for(const version of ['6.5.7','8.0.0']){
   const frames=firmwareFrames(task,step,version);
   if(index!==4){assert.equal(frames.length,0);continue;}
   assert.equal(frames.length,1);assert.equal(frames[0].kind,'photo','retain original bootloader pixels');
   assert.equal(new URL(frames[0].url).hostname,'help.prusa3d.com');
   const [x,y,w,h,iw,ih]=frames[0].crop;
   assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=iw&&y+h<=ih,'LCD crop stays within original image');
   assert(step.body.every(copy=>copy.includes('6.3.0')),'historical photographed version is disclosed in every language');
   assert(frames[0].caption.length===4&&frames[0].caption.every(copy=>copy.includes('6.3.0')),'photo-only view also discloses its historical example');
  }
 }
}
console.log('PASS: two source-linked firmware procedures, four languages, model-specific preparation and authentic bootloader-photo frames.');
