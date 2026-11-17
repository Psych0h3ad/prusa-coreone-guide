// SPDX-License-Identifier: MIT
// One strict projector supplies both the procedure and its position choices.
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const result=spawnSync(process.execPath,[fileURLToPath(new URL('../lcd-maintenance-route/build.mjs',import.meta.url)),...process.argv.slice(2)],{stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
