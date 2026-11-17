// SPDX-License-Identifier: MIT
// Working notes retain the three existing article steps and their identities.
export function completeRoutineMaintenance(tasks){
 const task=tasks.find(t=>t.id==='rod');if(!task||task.steps.length!==3)throw Error('Three existing Y-rod maintenance steps required');
 task.routineRod=true;task.revision=3;
 task.steps[0].body[0]='左右のY軸ロッドを、清潔な紙タオルで1本ずつ拭きます。ベアリングの前後を確認し、ほこりや汚れを落としてください。';
 task.steps[1].body[0]='左右の滑らかなY軸ロッドに、Prusa Lubricantを少量塗ります。X軸リニアレールには使いません。';
 task.steps[2].body[0]='清掃と注油の後、Y軸がなめらかに動くか実機で確認します。引っ掛かりが残る場合だけ、ベアリングを取り外してアルコールで洗浄し、内部に少量のPrusa Lubricantを塗る処置を検討します。';
}
