# Removing the old spool holder

The upgrade guide's step 1022670 removes four M3x8rT screws from the inner side of the right panel, followed by the old spool holder. The five animation actions show each screw separately before removing the holder. Keep the screws for mounting the replacement Puck. The official disposal note applies to the old holder.

Unremoved screws and the holder stay visible until their turn. The four existing complete native screws are retained by the loose-screw owner and reused by the Puck mounting programme. Their geometry, stock, source rest coordinates and scale remain unchanged. The Original holder's separate five-action source procedure keeps its own preserved source plan.

The model shows the inner screw-head side upward. Per-screw order and nominal thread rotation illustrate the operation; they are not an OEM removal order, turn count, torque or hardware-fit specification. Source dimensions are in millimetres and renderer geometry in metres.

Editable code is under `runtime/`; `translations.json` contains Japanese, English, Czech and German labels. Run `node source/old-holder-removal/build.mjs --out PATH_TO_CHECKOUT`, or add `--check` to verify the final bytes. The builder validates all sources and known input hashes before writing its five outputs, rejects unknown inputs, and needs no private Git objects, research directory, CAD conversion or downloads. Other source packages producing these paths must retain the same final bindings when composed.

The official source identifiers and licence scope are in SOURCES.json and NOTICES.md.
