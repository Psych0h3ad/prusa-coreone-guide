# Functional FE receptacle references

Two independently authored formed-metal profiles provide single-wire terminals FE1/FE5 and a shared two-wire crimp FE3. These are generic engineering illustrations, not identified Prusa supplier parts or reproductions of TE CAD.

The open rolled socket, continuous conducting neck, two formed collar bands and their entry seams are complete solid geometry. The nominal sheet is 0.41 mm. The socket cavity is 6.8 × 1.0 mm for the Prusa 6.3 × 0.8 mm tab family. The single collar has a 1.4 mm inner radius. The shared collar is a capsule with 1.25 mm half-straight and 1.45 mm inner radius; it receives the two unchanged wire gauges at X ±1.25 mm.

Coordinates use millimetres in BREP and metres in runtime buffers. Z0 is the unchanged wire endpoint/contact plane. Wire approaches along −Z through the entry at Z−6.2. The socket faces +Z. Full authored lengths are 26.700086 mm (single) and 25.376999542236327 mm (shared); they include the rear grip and are distinct from TE catalogue lengths. Collar formation, clearances, neck and engagement are authored nominal choices, not measured tooling or force specifications.

`frames.json` separates loose/held placement from installed native-tab registration. The LCD frame uses a qualified nominal 4.5 mm engagement outside the native case lip; this is not an OEM seating-depth measurement. Whole native tabs and their surroundings must remain present when selecting another frame.

`build.py` reads only `parameters.json`, `frames.json` and its own code. It creates ordinary analytic solids and every tessellated face. It imports no supplier CAD, mesh, private model or design history. With Python, OCP and NumPy available:

```
python build.py --out output/assets --cad-out output/brep
```

`fe-functional-receptacles.js` prepares typed buffers and creates independently owned Three meshes. Inject the caller's Three instance and an explicit frame. `port()` returns the wire endpoint, `entry()` the rear collar entrance, and `mouth()` the tab opening; all use the same mesh matrix. `fe-terminal-entry.js` solves a free route before a straight terminal-grip section while preserving its declared total centreline length. The caller must carry connected parts together and verify the complete source procedure and surrounding geometry.

Code is MIT. Independently authored profiles and generated geometry are CC BY-SA 4.0. Prusa-derived native datum facts retain OCL 1.0 attribution. See `NOTICE.md`, `REFERENCE-FACTS.json` and the accompanying licence texts. Manufacturer drawings and official photographs are referenced, not included.
