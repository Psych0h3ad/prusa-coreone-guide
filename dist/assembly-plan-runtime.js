import{withUpgradeWorkingViews}from'./upgrade-working-plan.js?v=20261112-110';
import{ASSEMBLY_PLAN as source}from'./cable-assembly/source-plan.js?v=20261113-116';
import{createStep349Plan}from'./cable-assembly/sequence/plan.js';
export const ASSEMBLY_PLAN=withUpgradeWorkingViews(createStep349Plan(source));
