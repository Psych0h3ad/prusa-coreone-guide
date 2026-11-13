# Printhead printable inputs

The three inputs in `inputs.json` are Prusa Research's matching printable revisions from [CORE One/+/Gen 2 printable parts](https://www.printables.com/model/1167816). Their source license designation is **GNU General Public License v2.0**; the license text is in `GPL-2.0.txt`. The recipe records the individual upstream file URLs, IDs, byte sizes and SHA-256 values. Original STL bytes, including their headers, are retained.

From the repository root, with Python 3 and Node.js installed:

```sh
python scripts/prepare-printhead-cover-inputs.py
python scripts/build-printhead-covers.py
```

To prepare inputs from an existing directory containing the three exact STL files, use `python scripts/prepare-printhead-cover-inputs.py --from PATH`. This option performs no downloads. All three inputs must pass their byte/hash checks before any is installed in `stl/`.

The build copies the three originals, creates the assembled mount STL, and computes the complete cover manifest. The assembled mount keeps the connected body's original triangle records in order; only the separate twelve-triangle box is omitted from that derived file. The original mount STL remains complete.

The mount's registered frame is read from the existing assembly GLB, using its scene hierarchy and the existing Three.js matrix operations. Those inputs have separate source attribution and licenses; this printable-part license is not a license for the assembly GLB. Their hashes are bound in the recipe. The other revision placements and the editable values in `source/calibration/printhead-cover-datums.json` are authored viewer calibration in millimetres. Nut frames, insertion axes, hole axes and explanatory datum ranges are calculated from those inputs. They are not manufacturer parametric design history.

`python scripts/build-printhead-mount.py` can also regenerate just the assembled-body stage after the full build. The source selection checks the connected components and the separate box's measured corners before writing it.
