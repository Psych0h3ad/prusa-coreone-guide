/** @typedef {{from:number,to:number,fraction:number}} SourceControl49 */
/** Evaluate the declared control endpoints exactly, before any whole geometry is built. */
export function evaluateSourceControl49(from,to,fraction){const u=Math.max(0,Math.min(1,fraction));return u===0?from:u===1?to:from+(to-from)*u*u*(3-2*u);}
