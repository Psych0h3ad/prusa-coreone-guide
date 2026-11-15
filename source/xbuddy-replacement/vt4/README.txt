Four-circuit vertical socket reference

The original analytic producer build_headers.py uses sketches, planes, booleans
and fillets. It takes header-parameters.json as its shape input; supplier CAD or
meshes are not inputs. Published pitch/envelope facts and inferred internal
channels, contact profiles and latch details are labeled separately. Factual
references remain in factual-references.json; those documents retain their terms.

From the checkout root, with Python, NumPy and OCP installed:
  python -B source/xbuddy-replacement/vt4/build.py --output dist/assets/xbuddy-replacement/headers
The command writes xb-vt4-reference.bin and manifest.json. The BIN contains all
little-endian Float32 XYZ positions followed by XYZ normals, in millimetres.
Material groups, vertex count and hash are written directly from the producer.

Attribution: CORE One Community Guide contributors. Original code: MIT, complete
text in MIT.txt. Original reference geometry/authored parameters: CC BY-SA4.0,
complete text in CC-BY-SA-4.0.txt. These terms do not relicense manufacturer
documents or other assets and do not identify the installed printer supplier.
