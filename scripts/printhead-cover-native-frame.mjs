// Read registered placement, not mesh vertices, from the existing assembly.
import fs from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';

const root = new URL('../', import.meta.url);
const file = fs.openSync(new URL('dist/assets/core-one.glb', root), 'r');
let gltf;
try {
  const header = Buffer.alloc(20);
  if (fs.readSync(file, header, 0, 20, 0) !== 20 ||
      header.toString('ascii', 0, 4) !== 'glTF' || header.readUInt32LE(4) !== 2 ||
      header.readUInt32LE(16) !== 0x4e4f534a) throw new Error('Expected GLB 2 JSON chunk');
  const json = Buffer.alloc(header.readUInt32LE(12));
  if (fs.readSync(file, json, 0, json.length, 20) !== json.length) throw new Error('Truncated GLB');
  gltf = JSON.parse(json.toString('utf8'));
} finally {
  fs.closeSync(file);
}
const matches = [];
function visit(index, parent) {
  const node = gltf.nodes[index];
  const local = node.matrix ? new THREE.Matrix4().fromArray(node.matrix) :
    new THREE.Matrix4().compose(
      new THREE.Vector3().fromArray(node.translation ?? [0, 0, 0]),
      new THREE.Quaternion().fromArray(node.rotation ?? [0, 0, 0, 1]),
      new THREE.Vector3().fromArray(node.scale ?? [1, 1, 1]));
  const world = new THREE.Matrix4().multiplyMatrices(parent, local);
  if (node.extras?.cadIndex === 859) matches.push(world);
  for (const child of node.children ?? []) visit(child, world);
}
for (const index of gltf.scenes[gltf.scene ?? 0].nodes) visit(index, new THREE.Matrix4());
if (matches.length !== 1) throw new Error('Expected one assembled mount, cadIndex 859');
// Preserve the decomposed assembly frame, including its original floating scale.
// Compose a millimetre basis, then express rotations per millimetre of the STL.
const position = new THREE.Vector3(), rotation = new THREE.Quaternion(), scale = new THREE.Vector3();
matches[0].decompose(position, rotation, scale);
const mm = new THREE.Matrix4().compose(position.multiplyScalar(1000), rotation, scale.multiplyScalar(1000));
const placement = Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) =>
  mm.elements[c * 4 + r] * (r < 3 && c < 3 ? 0.001 : 1)));
console.log(JSON.stringify(placement));
