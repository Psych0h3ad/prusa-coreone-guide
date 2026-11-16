import {withXYMountAssembly} from './xy-mount-plan.js';
import {withHeatbedAssembly} from './heatbed-assembly-plan.js';
import{withUpgradeWorkingViews}from'./upgrade-working-plan.js?v=20261112-110';
import{ASSEMBLY_PLAN as source}from'./cable-assembly/source-plan.js?v=20261113-116';
import{createStep349Plan}from'./cable-assembly/sequence/plan.js';
export const ASSEMBLY_PLAN=withXYMountAssembly(withHeatbedAssembly(withUpgradeWorkingViews(createStep349Plan(source))));
