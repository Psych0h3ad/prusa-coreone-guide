Curved conductors and loaded contact reference

Original analytic two-, three- and four-circuit 1.5 mm-pitch reference.
Units: mm in the feature tree/material curves; m in Three position buffers.
Native X is the circuit row, +Y insertion and +Z the lock side.

    python -B build-curved-assets.py --output generated

Requires OCP and NumPy. This local recipe uses only analytic Python and
scalar JSON. It reads no supplier CAD, BREP, mesh, faces or vertex payload.
runtime/ contains the editable JavaScript used by the application, with
its existing Three/material-curve/ownership dependencies.

Each retained conductor stock is allocated once along one complete curved
copper path. The jacket covers stock minus the estimated 1.7 mm strip.
Existing jacket radii are retained. stock.json records rendered assembly
reference centreline lengths, not measured specimen cut lengths. The
0.44 mm core, strip/end datums, lane rotations and bend controls are
authored reference estimates, not wire-processing instructions.

The complete original frame and 3.60 mm neutral-stock compliant leaf are
retained. contact-state solves the reference header contour at zero
design gap; only the plug contact deflects. It does not predict force,
stress, manufacturing tolerances or fatigue. The rolled reference barrels
are not a validated finished B-crimp. Some retained small reference wire
ODs are below the cited terminal-family insulation ranges; no fitted SKU
or specimen fit is asserted. Full housing/header resources keep their
original notices and remain separate from this contribution.

scalar-ledger.json separates CAD-reference numeric observations from
inferred connected passages. The manufacturer documents support stated
family scalars, orientation and functions. Original code is MIT; original
analytic geometry/design parameters are CC BY-SA 4.0. These grants cover
our contributions only. See the complete licence texts and NOTICES.txt.

loaded-mounted-contact.js accepts the actual plug-to-header rigid frame and
solves each leaf independently. It transforms the straight free contact
span, intersects its domain with the complete declared header contact
strips, and minimizes the plane/analytic-contour gap. The 0.25 mm strip
width belongs to the existing independent header; 0.14 rad bounds this
reference model and does not specify elastic or yield limits. Disjoint
full header/leaf-envelope bounds release the contact. Bound overlap is
not a fit approval.

runtime/ holds editable copies of the application JS, including the Y
material-curve and free-bank algorithms. Other application dependencies
are in dist/ of the same public checkout. The four generated resources
are used at dist/assets/loaded-curved/. Asset generation needs no Git
history, private files, external CAD or supplier geometry.

The core and jacket inner surface share the same material-coordinate sections
and vertices throughout the insulated length. One tip ring continues only
the exposed1.7mm in the straight entry, preserving the authoritative whole
stock. Independent sampling grids cannot drive copper through the jacket.

The Y conductors and terminal use coordinates relative to the actual plug.
The terminal datum comes from the existing authored housing stop and complete
terminal front. Each leaf follows the current header position and orientation.
The planar entry has an authored minimum radius1.75mm. A common transported
section joins all four conductors to the current reference motor-cable outlet;
the20mm transition with a16mm tangent handle and curve coefficients are independently authored estimates.
Whole stock and gauges are retained. These are not specimen/OEM curvature,
fit or fitted-part-number measurements.

The J4 motor route joins one complete source rise, concentric source turn,
vertical lanes, long fanout, upper turns and terminal entry. It uses the current
reference source/plug coordinates and derives the upper height analytically
from each whole stock. Wire OD, metal stock and full housing/header are retained.
The10/1/2.5/1/8/2mm MOTOR_DUCT values are independently authored routing
estimates, not manufacturer/specimen dimensions or permitted bend specifications.
ROUTING-REFERENCES.json and runtime/loaded-motor-duct.js contain the equations
and parameters. The core and jacket use one material grid including arc ends.

The retained Y source and its four downstream conductors share one transported
material section. The source colours continue to the board. Route parameters
and colours are editable in dist/motor-y-lead-data.js, motor-y-lead.js,
xbuddy-y-shared-bridge.js and xbuddy-y-entry03.js. Circuit order does not
identify connector pin numbers or an OEM wiring colour code. Native CAD exit
coordinates retain the Prusa OCL terms; authored route parameters are CC BY-SA
4.0 and original controller code is MIT. Source CAD references are in the
application credits. See Y-CONTACT-MESH.txt for the terminal display producer.
