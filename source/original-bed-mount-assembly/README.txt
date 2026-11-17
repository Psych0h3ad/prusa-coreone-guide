CORE One bed-mount and heatbed assembly

Source manual2251, guide835514, steps4.16-4.19. Existing source hardware and the LM8UU exterior follow each mount through steps4.20-4.21.

Editable application files:
  dist/original-bed-mount-data.js
  dist/original-bed-mount-model.js
  dist/original-bed-mount-plan.js
  dist/original-bed-mount-opening.js
  dist/original-bed-mount-bearing.js

Geometry positions in the source frames use millimetres; runtime positions use metres.
The notch-opening map is an illustrative deformation. It does not specify elastic properties, force or torque. The ball-row orientation is checked against the accompanying official photograph; the external bearing model has no internal balls or cage.

Heatbed mounting follows Original manual2251, guide835514, stages4.22-4.25.
The complete existing spacer, heatbed, central screw and eight short screws
use their native geometry. Temporary screw engagement and within-group motion
timing are authored teaching controls, not torque or turn specifications.

runtime/ contains editable copies of these application modules:
  dist/original-heatbed-plan.js
  dist/original-heatbed-loose-rgb.js
  dist/original/register.js
  dist/bed-cover-bare-wires.js
  dist/original-bed-transfer.js
  dist/heatbed-assembly.js
Use edited files at their matching dist/ paths in the same public application;
the other module and model dependencies remain in that checkout. These
JavaScript sources are the preferred form for the procedural RGB route; no
separate mesh generator or additional CAD download is required.

The RGB route retains the existing three carrier-tie locations,1.3mm jacket
radius and1223.1456626350944mm authored neutral stock. Its free table tail is
a reference arrangement, not a measured cable cut length or bend limit.
This component does not establish continuous routing from that free tail into
the following cable-cover step. Native mounting faces and source mating
contacts are retained; the display does not certify clearance or tightening.

Original code is MIT. Authored new RGB route geometry and its route parameters
are CC BY-SA4.0, CORE One Community Guide contributors. Complete terms and
source-guide identifiers are in CC-BY-SA-4.0.txt and GUIDE-REFERENCES.json.

Existing Prusa CAD and derived source frames retain OCLv1. Original controller code is MIT. The separate LM8uu model is CC BY3.0; see source/linear-bearing-exterior. Official text and photographs retain their own terms. See NOTICES.txt.
