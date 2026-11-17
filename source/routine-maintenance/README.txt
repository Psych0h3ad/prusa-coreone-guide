Y-axis rod maintenance workpoints

The existing three article steps retain their identities. Cleaning and
lubrication show the left and right rods one area at a time. The final
movement check is an observation on the physical printer. Inspection guides
do not move a rod, simulate hand pressure or add a cleaning-tool model.

Guide anchors lie on longitudinal edges of the complete source CAD rods
377 and566. Coordinates are millimetres in the source printer frame.
No original vertices, normals, indices or part transforms are replaced.

Official procedure: Prusa Research, Regular printer maintenance (CORE One/+)
https://help.prusa3d.com/article/regular-printer-maintenance-core-one_829710

Display and producer code: MIT, CORE One Community Guide contributors.
Original working notes and presentation parameters: CC BY-SA4.0.
Prusa Research source geometry and CAD-derived datums: OCL-1.0.
Official source text and photographs retain their separate terms.

To reproduce with the shared strict projector:
node source/routine-maintenance/build.mjs --out /path/to/checkout --check
node source/routine-maintenance/build.mjs --out /path/to/checkout

FIELDS.json records the integration changes. The shared projector retains
known source states and rejects unknown inputs before writing.
