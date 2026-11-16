Door switch operating configuration

Prusa Research CORE One L full CAD: https://www.printables.com/model/1520379
Source part: Zippy SM05S02A0 v7. Seven cached source solids contain alternative released/pressed states; one complete operating configuration uses body0, lever1 and roller2. The source STL geometry and its attribution remain under the Open Community License v1 stated in dist/assets/tensioner-service/SOURCE.json and OCL-1.0.txt. No supplier STEP file is included.

The original controller code and material-label assignments in this directory are supplied under the included MIT terms. This grant does not relicense Prusa geometry, photographs, manuals or trademarks.

Edit door-switch-source.js and material-groups.json. Run node generate.mjs OUTPUT_DIRECTORY to reproduce the controller, material-region data and terminal-reference runtime files. The existing source extractor and geometry notices remain in dist/assets/tensioner-service. The service integration is editable JavaScript in dist/tensioner-service-native.js, tensioner-service-runtime.js and tensioner-service-scene.js.

Coordinates are in mm before conversion to the viewer's metre buffers. Registration uses the lower mounting datum and case front plane; source surfaces are preserved by rigid transforms. The nominal display motion interpolates the source's five-degree actuator rotation as the door closes. The1-to12-degree door interval is a display parameter rather than a measured switch trigger or electrical test. Follow the guide's physical click and Sensor Info checks. The service lead retains its existing authored source segment; it is not a claimed complete OEM harness.

The original sensor-end terminal reference in door-switch-terminals.js follows the prepared assembly photograph in Prusa guide458290 step834305. It shows white/brown wires, black insulation and sleeves, solder and an unmarked blue resistor. Wire gauge and resistor envelope are authored estimates; no resistor value or manufacturing specification is asserted. Its jacket transition meets the retained service lead start. The complete cached source switch is unchanged. Original reference code/parameters remain under MIT; the photograph and source CAD retain their separate terms.
