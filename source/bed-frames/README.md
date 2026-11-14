# Heatbed cable material frames

Generate the animation frame table with `node source/bed-frames/generate.mjs`. The generator uses the authored cable route and full-profile sampler in `dist` and writes `dist/r16-frame-table.js`; it requires no downloaded geometry.

Coordinates are millimetres. The table is a rendering approximation keyed by actual native bed height. It retains the route model’s attachment references, nominal520mm textile sleeve and fixed authored conductor lengths. The individual conductor lengths and mounted references are illustrative scene parameters, not manufacturer measurements.
