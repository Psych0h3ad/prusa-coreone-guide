import {corexy577Plan}from '../dist/corexy577.js?v=20261111-100';
import {cameraTransitionPlan}from '../dist/corexy577-transition.js?v=20261111-100';
import {xPulleySetupPlan} from '../dist/x-pulley-setup.js?v=20261111-94';
import {sideSensorPlan} from '../dist/side-sensor-assembly.js?v=20261111-94';
import {pulleySetupPlan} from '../dist/pulley-setup.js?v=20261111-94';
import {bedstopPlan} from '../dist/bedstop-motion.js?v=20261111-94';
import {ASSEMBLY_PLAN as source} from '../dist/assembly-plan.js?v=20261111-94';
import {printheadCoverPlan} from '../dist/printhead-cover-motion.js?v=20261111-94';
import {nextruderWiringPlan} from '../dist/nextruder-wiring-plan.js?v=20261111-94';
import {mainLoomPlan} from '../dist/main-loom-plan.js?v=20261111-99';
import {backAssemblyWorkpose} from '../dist/rear-workpose.js?v=20261111-94';
// Text, operation buttons, localization and CAD share the same operation list.
const parentPlan={...source,build:Object.fromEntries(Object.entries(source.build).map(([id,plan])=>[id,xPulleySetupPlan(sideSensorPlan(pulleySetupPlan(backAssemblyWorkpose(mainLoomPlan(bedstopPlan(nextruderWiringPlan(printheadCoverPlan(plan))))))))]))};

export const ASSEMBLY_PLAN={...parentPlan,build:Object.fromEntries(Object.entries(parentPlan.build).map(([id,p])=>[id,cameraTransitionPlan(corexy577Plan(p))]))};
