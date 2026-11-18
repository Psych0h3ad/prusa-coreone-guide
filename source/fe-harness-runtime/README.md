# Protective-earth harness reference

Five complete terminal references and four wire spans describe the protective-earth connections in the CORE One assembly guide. The terminals are independently authored functional references; a Prusa supplier or commercial terminal SKU has not been identified.

## Geometry and units

| Span | Centreline length (mm) | Radius (mm) |
| --- | ---: | ---: |
| 1–2 | 648.6865614990122 | 1.2 |
| 2–3 | 87.91005477952497 | 1.2 |
| 3–4 | 330.7991141899318 | 1.1 |
| 4–5 | 365 | 1.1 |

The terminal grips are 6.2 mm straight sections. These lengths and routing controls describe authored reference geometry, not manufacturer cut lengths, tooling dimensions or material limits. Analytic model coordinates and route controls use millimetres; runtime mesh coordinates use metres, as recorded in the buffer manifests.

The complete receptacles, ring and wire surfaces are retained. The receptacle source contains the open socket, neck and single- or two-wire collar profiles. `ring4/` contains the ring's analytic model and producer. `REFERENCE-FACTS.json` separates native mating datums and official step/photo references from authored path controls. Existing native tabs, cases and surrounding printer parts retain their own source geometry and terms.

## Editable sources

The JavaScript modules are the editable source of the motion, frame and centreline models. `fe-harness-case.js` defines the rigid case-feed path. `fe-ground-head.js`, `fe-upper-column.js` and `fe-case-free-return.js` define the fixed approach, loose storage and return bend while solving the declared whole-wire length. `fe-source-carry-plan.js` records the source action mapping; `fe-source-carry.js` binds it to native mating frames. `fe-service-lease.js` defines exclusive borrowing of the same physical graph; a consuming service procedure must supply its own source-specific motion and frame binding.

`inputs/` contains the complete editable route data and retained reference buffers. Run `python build-assets.py OUTPUT_DIRECTORY` to reproduce the harness asset set. Runtime JavaScript copies and all referenced files are listed in `PREFERRED-SOURCE.json`. The separate `../fe-functional-receptacles/` directory supplies the formed-terminal parameters, analytic models and producer. Supplier CAD is not required.

## Attribution and limits

Original runtime and generation code is MIT. Independently authored terminal/wire geometry and route parameters are CC BY-SA 4.0, CORE One Community Guide contributors. Prusa native CAD and source-derived mating frames retain Open Community License 1.0 terms. See `NOTICE.md`, the receptacle notices and the accompanying licence texts. Official instructions and photographs are linked to their source and retain their own terms.

These are geometric teaching references. They do not establish a supplier SKU, OEM seating depth, material force, bend life or fit across an entire assembly sequence. The consuming procedure must preserve the physical mating frames, connected parts and declared wire lengths.
