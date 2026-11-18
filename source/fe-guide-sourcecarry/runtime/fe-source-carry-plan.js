// MIT. Source-ID-specific carry; the application share/metadata adapter is separate.
import {FE_HARNESS_PARTS} from './fe-harness-plan.js';
export const FE_SOURCE_IDS={prepare:986513,corexy:992670,corexyAnchor:992683,lcd:998504};
export const FE_SOURCE_WORDS={
 'FE④を底板の左端の穴へ通し、接続せずに残す':['Pass FE④ through the leftmost bottom opening; leave it disconnected','Protáhněte FE④ nejlevějším otvorem ve dně; zatím jej nepřipojujte','FE④ durch die linke Bodenöffnung führen und noch nicht anschließen'],
 'FE⑤を同じ穴へ通し、接続せずに残す':['Pass FE⑤ through the same opening; leave it disconnected','Protáhněte FE⑤ stejným otvorem; zatím jej nepřipojujte','FE⑤ durch dieselbe Öffnung führen und noch nicht anschließen'],
 '本体を支えながら脚の上へ戻す':['Support the printer and return it to its feet','Podepřete tiskárnu a postavte ji zpět na nožičky','Drucker abstützen und wieder auf seine Füße stellen'],
 '背面からFE⑤をCoreXYの楕円穴へ通す':['Feed FE⑤ through the CoreXY oval opening from the rear','Protáhněte FE⑤ oválným otvorem CoreXY zezadu','FE⑤ von hinten durch die ovale CoreXY-Öffnung führen'],
 'CoreXY左奥の下面にあるFaston端子を確認する':['Locate the Faston tab on the rear-left underside of CoreXY','Najděte kontakt Faston vlevo vzadu na spodní straně CoreXY','Faston-Zunge hinten links an der CoreXY-Unterseite prüfen'],
 'FE⑤を下面のFaston端子へ差し込む':['Push FE⑤ onto the underside Faston tab','Nasuňte FE⑤ na spodní kontakt Faston','FE⑤ auf die Faston-Zunge an der Unterseite stecken'],
 'FE①を手前に保持したLCDの接地端子へ合わせる':['Align FE① with the ground tab on the LCD held in front','Vyrovnejte FE① se zemnicím kontaktem LCD přidrženého vpředu','FE① zur Erdungszunge am vorn gehaltenen LCD ausrichten'],
 'FE①をLCDのFaston端子へ差し込む':['Push FE① onto the LCD Faston tab','Nasuňte FE① na kontakt Faston LCD','FE① auf die Faston-Zunge am LCD stecken']
};
const action=(refs,label,event,line,photo,extra={})=>({refs,label,feCarryEvent:event,sourceLineID:line,officialInspectionPhotoID:photo,axis:[0,0,1],distance:0,handling:true,showBefore:true,guideGhost:false,...extra});
export function sourceCarryPlan(plan,step,flow){
 if(flow!=='build'||plan?.originalSource||step?.originalSource)return plan;const id=step.programOfficialId??step.officialId;if(id===986513&&plan.feSourceCarry==='prepare'||id===992670&&plan.feSourceCarry==='corexy'||id===998504&&plan.feSourceCarry==='lcd')return plan;
 if(id===986513)return {...plan,feSourceCarry:'prepare',seed:[...new Set([...(plan.seed||[]),...FE_HARNESS_PARTS])],actors:[action(['feGroundRing'],'FE④を底板の左端の穴へ通し、接続せずに残す','pass-ring',986535,986515),action(['feTerminal5'],'FE⑤を同じ穴へ通し、接続せずに残す','pass-five',986535,986515),...plan.actors.filter(a=>!a.flex?.includes('earthL')),action(['feTerminal5'],'本体を支えながら脚の上へ戻す','stand',986543,986519,{focusMotion:true})]};
 if(id===992670){if(plan.actors.some(a=>a.feCarryEvent))return plan;return {...plan,feSourceCarry:'corexy',actors:[action(['feTerminal5'],'背面からFE⑤をCoreXYの楕円穴へ通す','oval-five',992716,992672,{focusBounds:[-181,160,265,-100,201,338]}),action([372],'CoreXY左奥の下面にあるFaston端子を確認する','inspect-tab-five',992684,992674,{inspection:true}),action(['feTerminal5'],'FE⑤を下面のFaston端子へ差し込む','insert-five',992692,992674),...plan.actors]};}
 if(id===998504)return {...plan,feSourceCarry:'lcd',actors:[...plan.actors.filter(a=>!a.flex?.includes('earthR')),action(['feTerminal1'],'FE①を手前に保持したLCDの接地端子へ合わせる','guide-one',998550,998510,{focusBounds:[10,-309,-55,80,-245,-5]}),action(['feTerminal1'],'FE①をLCDのFaston端子へ差し込む','insert-one',998550,998510)]};
 return plan;
}
