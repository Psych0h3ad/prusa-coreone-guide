// The actual8mm source withdrawal pays straight exit stock into the cap.
// This changes the live whole material, not a held mesh or registered end ring.
export function sourceExitNeck48(axialWithdrawalMM,align){return (8-axialWithdrawalMM/2)*(1-align);}
