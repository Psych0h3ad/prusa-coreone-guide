export function filamentOutcomeHTML(step,text,escape){return (step.filamentChoices||[]).map((c,i)=>`<button type="button" data-filament-choice="${i}">${escape(text(c.label))} →</button>`).join('');}
export function filamentOutcome(step,index){return step.filamentChoices?.[index]||null;}
