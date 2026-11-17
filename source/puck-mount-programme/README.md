# Puck mounting sequence

This programme follows the CORE One+ build step 997250 and upgrade step 1022736. Place the Puck on a cardboard box with its mounting holes facing up, align and lower the right panel, then insert and tighten the four M3x8rT screws individually. The final action is labelled as a handling example: support and turn the panel so the spool-holder opening faces up. The official instructions do not prescribe that example's lifting distance.

The Puck and right panel retain all their existing source surfaces. Four existing complete native M3x8rT bodies are used at their original poses; no duplicate screw mesh is added. The upgrade removal source permits disposal of the old holder, while its four screws are retained for the new mounting. Original instructions can still address their four native references directly.

The Puck and holder share a registration obtained from the four mounting holes in the digital references. Initial preparation and the later whole-panel carry use the same registration. This is a measurement of digital CAD/STL references, not physical specimens. No hardware fit, force, torque or continuous-clearance certificate is supplied.

Dimensions are in millimetres in the data module and metres in renderer geometry. The cardboard box is an independent 80×200×200 mm support illustration. Its size, the 220 mm handling lift, and the held clearance are teaching assumptions rather than official dimensions. Screw rotation uses the application's right-hand thread convention and nominal M3 pitch; it does not prescribe an OEM turn count or torque.

Editable runtime source is under `runtime/`; `translations.json` contains the Japanese, English, Czech and German action text. From a compatible checkout, run `node source/puck-mount-programme/build.mjs --out PATH_TO_CHECKOUT`, or add `--check` to verify final bytes. The builder checks every preferred source and input before writing any of its eleven outputs, rejects unknown host bytes, and needs no private Git objects, research folders, CAD conversion or downloads. Existing source packages that also produce these paths must carry the same final source bindings when composing them.

See SOURCES.json for source stage and line IDs, and NOTICES.md for licence scope. Existing mechanical qualifications and unfinished collision checks remain separate from source-order and finite playback evidence.
