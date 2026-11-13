Main connector reference models

Purpose: illustrations of the 22-position, two-row main cable connector.
Compatible identifiers: 5031492200 housing / 5031542290 board header.
Editable analytic feature construction is in build_models.py; common nominal
dimensions are in parameters.json. Additional feature dimensions and internal
details include estimates. The board registration is an assembly reference.

Dependencies: Python, NumPy and OpenCascade Python bindings (OCP).
From the project root:
python dist/assets/j13/source/build_models.py --output rebuilt

The output is two complete position/normal BIN files plus their matching
cad.json material groups. Buffer and parameter dimensions are millimetres.
Use each buffer with its own generated manifest. No manufacturer CAD payload
is required by this recipe.

References:
https://www.molex.com/en-us/products/part-detail/5031492200
https://www.molex.com/en-us/products/part-detail/5031542290
https://www.prusa3d.com/downloads/Electronics_drawings/FDM-MK4-LoveBoard-38.pdf
