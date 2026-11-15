Side IR sensor replacement

The editable procedure covers the original single-release and two-release covers and the switched One+ housing, in Japanese, English, Czech and German. variant-content.json keeps the selected instructions, actual official step numbers, photographs and source anchors together. Local task numbers run1–15.

Regenerate data/source modules and static wire paths with:
  node source/side-ir-service/generate.mjs dist
Regenerate the complete M2x8 source buffer and measured/reference parameters with:
  python source/side-ir-service/geometry/generate.py dist

The readable dist/side-ir-service-{geometry,frames,lead,wire-prefix,wire-bundle,retained-lead,ptfe}.js modules are the editable geometry and route definitions. wire-routes.json contains all six static internal conductor paths. geometry/parameters.json separates the eleven measured panel-hole datums/radii from authored plug and rivet profiles. geometry/SOURCE.json records source attribution and measured/reference limits.

The complete existing native right panel, both selected source housings, nine-solid IR boards and existing full hardware are reused. M2x8-source.stl retains all32832 source triangles. Conductor radius0.4mm and the recorded reference stocks stay fixed throughout each motion. The original retained harness suffix and its terminal housing remain complete.

The flexible cable lay, plug exterior, rivet profiles and working poses illustrate handling and routing. Their dimensions are authored reference values, not manufacturer cut lengths, tolerances or force ratings. Compare the actual housing and removed screws with the selected photographs.

Official photographs remain linked with original/annotated IDs and attribution. Raw manual text and HTML are not required for generation. The official documents and photographs retain their own terms. See NOTICES.txt for component licenses.
