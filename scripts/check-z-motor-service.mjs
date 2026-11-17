// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import {createZMotorChoices} from '../dist/z-motor-choice-data.js';
import {Z_MOTOR_CHOICES,isZMotorChoice} from '../dist/z-motor-choice.js';
import {Z_MOTOR_SOURCE as source} from '../dist/z-motor-source.js';
import {zScene} from '../dist/z-motor-plan.js';

// Official guide575994 instruction anchors, excluding its introductory cover.
const ids=[576213,1038107,1038157,1038197,1038221,1038263,1038297,1038421,1038326,1038457,1038493,1038545,1038587,1038633,1038659,1038684,1038716,1039661,1039744,1039791,1039843,1039871,1039917,1040358,1040382,1040407,1040441,1040469,1040505,1040551,1040587,1040617,1040665,1040697,1040733,1040767,1040815,1040841,1040873,1040921,1040945];
assert.deepEqual(source.steps.map(s=>s.id),ids);
const tasks=createZMotorChoices(),bySelection=new Map(tasks.map(t=>[t.motorService.selection,t]));
assert.equal(tasks.length,5);assert.equal(new Set(tasks.map(t=>t.id)).size,5);
assert.deepEqual([...tasks.map(t=>t.id)].sort(),Z_MOTOR_CHOICES.map(c=>c.id).sort());
const expected={all:{sides:['R','FL','FR'],count:48},rear:{sides:['R'],count:26},left:{sides:['FL'],count:34},right:{sides:['FR'],count:34},front:{sides:['FL','FR'],count:41}};
let steps=0,actions=0;
for(const [selection,contract]of Object.entries(expected)){
 const task=bySelection.get(selection);assert(isZMotorChoice(task));assert.deepEqual(task.motorService.sides,contract.sides);assert.equal(task.steps.length,contract.count);
 assert.equal(task.source,'https://help.prusa3d.com/guide/how-to-replace-z-motors-core-one_575994');
 assert.equal(task.bom.newFrontLEFT,contract.sides.filter(s=>s!=='R').length);assert.equal(task.bom.newRearRIGHT,contract.sides.includes('R')?1:0);
 for(const pair of task.identityPairs)assert.equal(pair.type,pair.side==='R'?'RIGHT':'LEFT');
 for(const [index,step]of task.steps.entries()){
  assert.equal(step.officialId,ids[step.motorOfficialIndex]);assert.equal(new URL(step.source).hash,'#'+step.officialId);assert(step.sourcePhotos.length>0);
  const scene=zScene(task,index,a=>a[0]);assert.equal(scene.plan.serviceTask,task.id);assert.equal(scene.plan.actors.length,step.motorOperations.length);assert(scene.plan.motorService);
  for(const operation of step.motorOperations){assert(Number.isFinite(operation.to));assert(operation.label.length===4&&operation.label.every(s=>typeof s==='string'&&s.trim()));}
  steps++;actions+=scene.plan.actors.length;
 }
}
const all=bySelection.get('all');assert.deepEqual([...new Set(all.steps.map(s=>s.officialId))],ids,'all41 source instructions remain present');
for(const side of['FL','FR'])assert.deepEqual(all.steps.filter(s=>s.motorSide===side&&s.motorOfficialIndex>=22&&s.motorOfficialIndex<=28).map(s=>s.motorOfficialIndex),[22,23,24,25,26,27,28],'each front motor has its own seven ordered source instructions');
assert.equal(steps,183);
console.log(`PASS_Z_MOTOR_SERVICE: 41 official instructions; five positions, ${steps} ordered stages and ${actions} action plans. Native-surface, rendered-guide and browser checks are separate.`);
