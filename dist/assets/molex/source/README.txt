Single-row connector reference models

Seven independently authored connector reference models for assembly instruction:
5025780200, 5025780300, 5025780400 housings;
5025840260, 5025840360 vertical headers;
5025850370, 5025850470 right-angle headers.

Units: millimetres. Native X follows the circuit row; +Y is insertion and
+Z is the latch side. Circuit pitch is1.5mm. Interior receiving features,
spring shapes, small blends and board registration include estimates.
These are instructional references, not manufacturing drawings or force data.
The tin display group represents plated metal, not solid-tin construction.

Available formats: editable analytic Python source, JSON scalar parameters and
metadata, and generated nonindexed Float32 BIN buffers with a JSON part table.
Each BIN contains all XYZ positions followed by their associated XYZ normals,
in little-endian order. Material groups use vertex offsets/counts.
releaseSkinGroups separately tags fixed and moving housing faces.

Build with Python, NumPy and OCP:
  python -B build_all.py --output generated

The output is seven BIN files and cad.json. The source directory is
self-contained. Geometry is built in memory from analytic primitives and
original sketches; existing connector meshes are not used as inputs.
Edit header-parameters.json for header scalar dimensions and the original
housing sketches in housing-body.py for housing dimensions. part-metadata.json
supplies editable descriptive fields only; vertex counts, material ranges,
release groups and buffer hashes are computed from the generated geometry.
Factual manufacturer references are listed in factual-references.json.

The matching runtime release implementation can subdivide housing faces.
Its parentFaces array maps subdivided faces to this generated source mesh;
raw mesh vertex counts are not the size of the animated release surface.

Original producer code: MIT. Original authored geometry and its scalar/design
parameters: CC BY-SA4.0. Attribution: CORE One Community Guide contributors.
The accompanying MIT.txt and CC-BY-SA-4.0.txt contain the license terms.
These grants cover only this authored work, not manufacturer documents or
other application assets. Product names identify the reference parts.
