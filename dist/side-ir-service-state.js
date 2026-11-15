let family='plus',coverLength=8,handleLength=8;
export const sideIRSelection=()=>({family,coverLength,handleLength});
export function setSideIRFamily(value){if(!['r1-one','r1-two','plus'].includes(value))throw Error('Unknown side-sensor housing');family=value;coverLength=value==='plus'?8:10;handleLength=value==='plus'?8:10;}
export function setSideIRCoverLength(value){value=Number(value);if(![8,10].includes(value))throw Error('Unknown cover screw length');coverLength=value;}
export function setSideIRHandleLength(value){value=Number(value);if(![8,10].includes(value))throw Error('Unknown handle screw length');handleLength=value;}
export const isSideIRPlus=()=>family==='plus';
