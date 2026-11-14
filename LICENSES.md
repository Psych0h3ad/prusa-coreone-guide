# Sources and licenses

This guide contains materials with separate licenses. Existing per-file and upstream terms apply; this repository does not replace them with a single license.

| Material | Source and terms |
| --- | --- |
| CORE One and selected CORE One L CAD derivatives | Prusa Research; Open Community License v1. See `dist/licenses/OCL-1.0.txt` and model manifests. |
| Selected printed and upgrade parts | Prusa Research; GPL v2. See `dist/licenses/GPL-2.0.txt` and the linked editable sources in the credits. |
| Community hotend geometry | Julian0815; Open Community License v1. This geometry is credited separately from Prusa Research CAD. |
| IR sensor board derivative | Prusa Research; CC BY-SA 4.0. See `dist/licenses/CC-BY-SA-4.0.txt`. |
| CLIK-Mate connector reference models | Seven independently authored models listed in `dist/assets/molex/cad.json`. Original geometry: CORE One Community Guide contributors, CC BY-SA 4.0; original model code: MIT. The [editable source and scoped notices](dist/assets/molex/source/README.txt) accompany the models. Manufacturer documents and other assets retain their own terms. |
| Chamber thermistor replacement and TEMP header | Independently authored teaching geometry: CC BY-SA 4.0; original model, display adapters and procedure generator: MIT. [Component notices](dist/assets/chamber-thermistor-replacement/MODEL-NOTICES.txt), [procedure source](source/chamber-thermistor-replacement/README.txt) and [header recipe](source/chamber-service-reference/README.txt). Official text, photographs and existing native CAD retain their own terms. |
| Main cable connector reference models | Independently authored analytic illustrations for 5031492200 / 5031542290. The [editable recipe](dist/assets/j13/source/README.txt), material groups and [references](dist/assets/j13/ATTRIBUTION.md) accompany the models. Internal details include estimates. No manufacturer CAD surfaces are included. Original model code: MIT; original geometry and authored parameters: CC BY-SA 4.0, CORE One Community Guide contributors. See [component terms](dist/assets/j13/source/NOTICES.txt). |
| LCD connector reference models | Independently authored analytic illustrations by Assembly Lab contributors, using published nominal dimensions for 2-215083-4 / 9-338069-4. Internal details include estimates. The editable [model recipe](dist/cable-assembly/native/models/source/README.txt) accompanies the assets. No manufacturer CAD surfaces are included. Original model code: MIT; original geometry and authored parameters: CC BY-SA 4.0, CORE One Community Guide contributors. See [component terms](dist/cable-assembly/native/models/source/NOTICES.txt). |
| Firmware-derived software and display data | Existing SPDX and upstream terms apply to these portions. Original notices and GPL text are in `dist/licenses/Buddy-LICENSE.md`; upstream references are listed in the [credits](dist/credits.html). Artwork and fonts retain their separate terms. |
| Firmware display artwork | CC BY-NC-SA 4.0. See `dist/licenses/CC-BY-NC-SA-4.0.txt`. |
| Fonts | Individual OFL and IPA notices in `dist/licenses/` and the firmware font assets. |
| Three.js and meshoptimizer | MIT; complete upstream notices in `dist/licenses/`. |
| Official manual photographs and brand artwork | Prusa Research; source links and attribution in the credits. No additional rights to these materials are granted by this repository. |

The [credits](dist/credits.html) identify the source models, references and changes to the display geometry. Source links remain available alongside the guide steps.

## Preferred editable sources

| Component | Preferred source and notices |
| --- | --- |
| Single-row connector geometry | `dist/assets/molex/source/README.txt`, five analytic Python sources, JSON parameters and scoped MIT / CC BY-SA notices. |
| Main two-row connector geometry | `dist/assets/j13/source/README.txt`, analytic builder and parameters; provenance is stated separately from any license grant. |
| LCD connector geometry | `dist/cable-assembly/native/models/source/README.txt`, analytic builder and parameters; provenance is stated separately from any license grant. |
| Firmware displays | `source/SOURCES.md`, per-display source indexes and exact upstream inputs. Software, artwork and fonts retain separate terms. |

The supplied notices do not relicense unrelated application code or give
additional rights to third-party documents, photographs, artwork or trademarks.
