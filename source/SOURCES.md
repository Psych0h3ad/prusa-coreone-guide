# Source and rebuild information

The readable browser modules are supplied in `dist/`. Existing per-file notices and upstream licenses apply. This source index does not assign a license to unrelated application code, CAD, photographs, artwork or fonts.

## Firmware-derived displays

The firmware code license and original notices are in `source/vendor/prusa-firmware-buddy/LICENSE.md`. Display artwork and fonts retain the separate terms identified in `dist/assets/firmware-ui/README.txt` and `dist/licenses/`.

The navigation input lock is `source/vendor/prusa-firmware-buddy/inputs.json`. It records exact release URLs, byte sizes and hashes. Its matching originals are supplied in the adjacent `navigation/`, `operations/` and `coldpull/` directories. From the project root, verify the supplied inputs with `node scripts/prepare-firmware-inputs.mjs --from source/vendor/prusa-firmware-buddy`, then run `node scripts/build-firmware-navigation.mjs`. The same preparation recipe can obtain the locked originals from their upstream URLs.

The manual cold-pull display inputs are retained in `source/vendor/prusa-firmware-buddy/maintenance-native/`. Its `inputs.json` identifies the unchanged originals, `source-index.json` identifies seven browser/recipe adaptations, and its README explains the conditional display examples. The recipes are:

```
node scripts/build-maintenance-native-displays.mjs
python scripts/build-maintenance-native-glyphs.py
node scripts/index-maintenance-native-source.mjs
```

The initial-setup display inputs and their notices are in `source/vendor/prusa-firmware-buddy/initial-setup/`. Its input lock retains the versioned door, loadcell and filament-sensor controllers, translations, artwork and font inputs. The readable display adapters and their matching hashes are listed in that folder’s `source-index.json`. Rebuild its display data with `node scripts/build-initial-setup-displays.mjs`, then its supplemental bitmap cells with `python scripts/build-initial-setup-glyphs.py`. These examples do not send commands to a printer or report live sensor readings.

These recipes require Node.js and Python with Pillow, plus the existing menu and gearbox bitmap assets. They do not render replacement system-font glyphs. The legacy atlas input-fetch and asset-build scripts remain separate recipes; this section is not an offline archive of all upstream firmware or all display artwork.

## Generated reference data

All routes and dimensions in this section are teaching references unless their component metadata states otherwise. Rebuilding source data does not establish physical fit or change any component's license.

| Output | Source |
| --- | --- |
| `dist/hotend-routing.js` | `scripts/build-hotend-routing.mjs`, `relax-hotend-routing.mjs` and `dress-thermistor-exit.mjs`. The last transform preserves the declared thermistor-exit routing version. |
| `dist/loveboard-service-routing.js` | `scripts/build-nextruder-cable-routes.mjs` prepares motor/loadcell reference spans with the native connector data loaded first. `scripts/build-heatsink-ntc-routes.mjs` updates only the NTC span. These field generators retain the other route records. |
| Channel and filament routing | `scripts/build-nextruder-channel-routing.mjs` contains the channel-route construction. Its inputs include the complete readable held/free route tables in `dist/`. These are not manufacturer harness shape files. |
| `dist/assets/cad-subsets.json` | `scripts/extract-cad-subsets.mjs` records the selected source faces and installed offsets, using the existing assembly GLB. It does not replace that GLB or its license. |
| Explanatory sensor holder | `scripts/build-nextruder-sensor-mechanism.py` retains the analytic holder construction and the stated magnet-shape inference. Python with the OpenCascade Python bindings is needed. `--output DIRECTORY` selects the output. `--validation-heatsink FILE` optionally supplies a heatsink BREP for the separate clearance check; without it the check is explicitly not run. |
| Manual index | `scripts/build-manual-data.py`, `manual-titles.json`, `step-notes.json`, `step-guidance.json` and `manual_inventory.py`. The recipe also expects the retained official guide export in the layout specified by the script. This is not a complete offline copy of the official manual corpus. |

For Node reference recipes that import `three`, use the existing repository loader, for example `node --loader ./scripts/three-loader.mjs scripts/build-heatsink-ntc-routes.mjs`, from the project root. The complete existing route tables are retained as inputs; this index does not claim that every historical route-fitting stage can be reconstructed from a single initial curve.

No editable manufacturer design history is implied by these reference generators. Original source links, part-revision qualifications and per-asset notices remain in the component manifests and credits.

## Hotend thermistor replacement

The21-step procedure is edited in `source/thermistor-replacement/procedure.json`. Run `node source/thermistor-replacement/generate.mjs` to generate its data and source-link modules. The model adapters and reference screw are readable in `dist/thermistor-service-model.js` and `dist/thermistor-service-geometry.js`. Sources and individual notices are in `dist/assets/thermistor-replacement/`.
