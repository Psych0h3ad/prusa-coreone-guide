LCD ribbon and service ground-lead motion

The editable runtime/ modules describe the complete LCD ribbon, its cap
frame and material allocation, the service ground lead, and the source
procedure that handles them. host-fields.json contains exact integration
fragments for the companion application. runtime-manifest.json names every
projected module. There are no required private paths or binary CAD caches
in this source component.

To reproduce into an existing project checkout or a staging copy:

    node source/lcd-maintenance-route/build.mjs --out /path/to/checkout --check
    node source/lcd-maintenance-route/build.mjs --out /path/to/checkout

The producer accepts only documented source hashes, including supported staged states, and validates every input, local source field and final output before writing. Unknown contents require an explicit source rebase. The position-selector build command uses this same projector. If the
host code has changed, rebase the named source fragments and update their
digests; do not replace the host with an older complete file. Module and
page import-map aliases must retain one canonical producer per mutable
module; import-aliases.json lists the component paths and legacy alias. The application supplies Three, its native CAD and normal routing
dependencies under their own existing manifests and licenses.

The reference ribbon retains a858.7665480736183mm centreline stock,
30mm material width and0.8mm gauge. The service ground lead retains
372.47489172068686mm of source prefix plus360mm of tail, at1.2mm radius.
The whole original meshes and source cap/end registrations are retained.
These are rendered reference parameters, not measured specimen cut lengths,
manufacturer fit limits or wire-processing instructions.

The unplugged cap turns edge-on during the outside-frame transfer, then
unwinds into the actual aperture frame. A single source clock supplies the
cap pose and intrinsic support; the complete material stock is solved before
meshing. The five-terminal assembly reference and this service reference have
distinct source/stock registrations for the harness. An explicit frame,
identity and ownership binding is required before sharing this writer;
similar names or radii are not a binding. Do not construct duplicate leads.

Official procedure references:
https://help.prusa3d.com/guide/how-to-replace-z-motors-core-one_575994
The source-bank module contains the individual original line, photograph
and step URLs used by the procedure. Official instructions and photographs
retain their separate terms. The model uses the companion repository's
complete native CAD; it does not add a new supplier CAD download or STEP file.

The aperture work view targets the registered front-frame opening during
connector feed operations. Its dashed annotations use the same cap source
poses; annotation coordinates are converted once from CAD mm to printer-local
metres. Camera and guide settings do not alter cable stock or physical motion.
