import {coupledStagedPower} from './heatbed-power-bank.js';
export function stageBedPower(family,routing=1){if(!Number.isFinite(routing)||routing<0||routing>1)throw Error('Box routing0..1 required');return routing===1?family:coupledStagedPower(family,routing);}
