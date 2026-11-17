# Cancelled STL input lifetime

The eight upgrade parts and the M3x10/M3x12 vent-screw inputs use the
existing bounded asset request helper. A disposed viewer aborts its requests.
The loader checks cancellation again before parsing a successful response;
geometry returned at a later Promise boundary is retired once before mesh
or record registration. Temporary vent stock still closes in its finally
block. A stopped upgrade batch does not start the following factories.

Temporary network failures use the existing retry progress message.
Permanent HTTP failures and malformed STL parsing remain visible failures.
Source geometry, surface processing, materials and installed transforms are
unchanged. This component concerns these ten inputs; other factories retain
their existing lifetime rules.

Run node source/stl-input-lifecycle/build.mjs --out PATH_TO_CHECKOUT,
optionally with --check. The common strict projector reproduces the typed
viewer and import-map fields in FIELDS.json. The asset request helper and
its sources are in source/asset-load-recovery.
