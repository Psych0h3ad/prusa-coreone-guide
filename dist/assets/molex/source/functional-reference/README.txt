Connected-passage single-row connector reference

This editable analytic model illustrates 1.5 mm-pitch two-, three- and
four-circuit plug housings with complete terminal passages, a retention
pocket, axial stops and a separate compliant terminal reference. Units are
millimetres. X is the circuit row, +Y is insertion and +Z is the lock side.
The existing board and wire-entry registration is retained.

Build in a Python environment containing cadquery-ocp and numpy:

    python -B build.py --output generated

Use a new output directory. The script creates full single-solid BREP
models, position/normal BIN buffers and a manifest. It reads only the code
and scalar JSON files in this directory. Manufacturer CAD, a repository's
Git history and external downloads are not build inputs. Every analytic
face must have a triangulation before a BIN can be emitted.

functional-parameters.json defines the independently designed passage
stations, retention pocket, stops and reference terminal forming state.
analytic-shell.py contains original exterior sketches. functional-model.py
contains the connected feature tree and reference cam. reference-profiles.py
and terminal-parameters.json contain editable barrel and contact profiles.
scalar-ledger.json separates numerical CAD-reference observations from
functional estimates. These observations are not specimen measurements.

The housing envelope is 7.3/8.8/10.3 x 8.6 x 6.1 mm. Some interior regions
in the retained reference were blind or solid; the new connected passages
are original functional estimates. They are not exact manufacturer mould
dimensions. The reference terminal's 0.05 mm seating offset is a model
datum, not a measured OEM seated position. Its compliant motion illustrates
retention and release; it does not predict force, material strain or fatigue.
The open rolled barrels do not certify a finished production crimp.

Finite insertion and withdrawal checks support the declared model poses.
They do not establish continuous clearance or physical specimen fit.
Reference comparisons retain intentional internal differences. Sampled
distance maxima are observations, not certified bounds. The terminal
reference is separate from the housing display assets; seating it against
a header also requires a compatible spring-contact pose.

The reference uses 1.04 mm insulation OD and 0.44 mm conductor OD without
scaling. The actual fitted terminal SKU, conductor construction, strip
length and crimp tooling remain unconfirmed. The 502579 family drawing
lists insulation OD 0.78..1.28 mm; 503429 lists 0.70..1.02 mm. These family
ranges do not identify the terminal fitted in a particular machine.

See NOTICES.txt, MIT.txt and CC-BY-SA-4.0.txt for attribution and licence
scope. Product names and reference numbers identify factual sources; they
do not imply manufacturer authorship or endorsement of this model.
