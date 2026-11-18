Back-case cable route

This numeric source generates the complete 221.248465580051 mm reference
centreline with its original 2.5 mm radius, 128 spans and 8 radial sides.
The two endpoint positions and frames are preserved. The upper guide keeps
its original centre and vertical tangent. The following bend passes between
the RGB and main leads; a lower bend carries the remaining length.

Run: node source/box-lower-rgb/build.mjs --target dist/rear-main-reference.js
Use --check to check the exact generated runtime. The builder accepts only
the declared before and after runtime files. Other fields are preserved.

The route is an independently authored illustration. Source CAD and the
official guide remain credited in the accompanying source and license files.

License: MIT for this numeric generator and route parameters.
