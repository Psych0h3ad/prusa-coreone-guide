# Z motor replacement choices

Choose the front-left, front-right, rear, both front motors, or the complete three-motor procedure. Positions are viewed from the front of the printer. Each choice has its own instructions and saved progress. The complete procedure retains the existing task link.

The editable JavaScript and stylesheet implement the selection controls and register all five choices before the maintenance model is bound. They use the existing Z motor task factory, full motor references and retained transparent pads. No additional geometry or dimensions are introduced.

Run `node source/z-motor-choice/build.mjs --out PATH_TO_SOURCE_CHECKOUT` to reproduce the complete procedure and its position controls together. This entry uses the same strict projector as the maintenance reference package and validates all inputs before writing. The motor plan, geometry and physical owner remain separate editable sources in the maintenance reference package.

The official replacement instructions are Prusa Research guide 575994. Source photographs, line references and applicability retain their original terms. Selecting a position does not establish mechanical fit or extend the supported printer variants.
