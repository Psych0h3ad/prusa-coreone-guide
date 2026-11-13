import{withSideSensorInputPtfe}from'../side-sensor-ptfe-plan.js';
import {withSidePtfeCollets} from '../side-ptfe-plan.js';
import{withGluedHandleMotion}from'../glued-handle-plan.js';
import{withCabinetWorkpoints}from'../cabinet-workpoints.js?v=20261113-120';
import{withDoorHandleFastening}from'../door-handle-plan.js?v=20261113-119';
import {ASSEMBLY_PLAN as SOURCE_PLAN} from '../assembly-plan-compiled.js?v=20261112-104';
import {createBox4ClosePlans} from '../electronics-ties/plan.js?v=box4-v1';
import {withAssemblyTeachingCameras} from '../assembly-teaching-plan.js?v=20261113-116';
const ASSEMBLY_PLAN=withSidePtfeCollets(withSideSensorInputPtfe(withGluedHandleMotion(withCabinetWorkpoints(withDoorHandleFastening(withAssemblyTeachingCameras(createBox4ClosePlans(SOURCE_PLAN)))))));
// This step secures the main cable inside the xBuddy box.
delete ASSEMBLY_PLAN.build[995519].photoCheck;
export {ASSEMBLY_PLAN};
