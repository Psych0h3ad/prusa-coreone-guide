// SPDX-License-Identifier: MIT
import{spawnSync}from'node:child_process';import{fileURLToPath}from'node:url';const r=spawnSync(process.execPath,[fileURLToPath(new URL('../lcd-maintenance-route/build.mjs',import.meta.url)),...process.argv.slice(2)],{stdio:'inherit'});if(r.error)throw r.error;process.exitCode=r.status??1;
