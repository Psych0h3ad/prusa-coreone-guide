LM8UU exterior bearing model

Nominal dimensions:15mm outside diameter,8mm bore,24mm length. Units:mm.
The source contains the complete exterior body; internal balls and cage are not modeled.

Author:Juan Gonzalez-Gomez (Obijuan). Model and mesh:CC BY3.0. See NOTICES.txt and SOURCE.json.

Build the browser asset:
  python build-assets.py --output ../../dist/assets/linear-bearings

The producer reads the body embedded in LM8uu.fcstd and requires numpy and OCP.
It writes a deterministic gzip buffer and a face manifest. The buffer stores
Float32 XYZ positions followed by Float32 XYZ normals in millimetres.
The geometry is non-indexed. It is a visualization model, not a machining drawing.
