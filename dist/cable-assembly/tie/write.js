import{writeBox4Field}from'./closing/motion.js';
export function writeBox5Field(entity,field){
 if(entity.id!=='box5')throw Error('Actual Box5 entity required');
 if(field.phase===0){entity.setOpenPreparation(field.prepared);entity.lastKey='';entity.update(1,1,1);entity.mesh.userData.flexState.normalizedPhase=0;return field;}
 writeBox4Field(entity,field);
 // Before the cut there is one complete strip. At the cut instant the two
 // complementary pieces keep the same100mm material domain; only then does
 // the real offcut begin moving away. Retained tail metadata follows the part.
 entity.mesh.userData.flexState.tail=Math.max(0,field.mainLength-field.loopLength);return field;
}
