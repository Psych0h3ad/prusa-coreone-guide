// The source CAD supplies the matching handle holes and M3x8rT geometry.
// Plate envelope dimensions are display assumptions; not a manufacturing model.
export const DOOR_HANDLE = {
 step:1075290,source:'https://help.prusa3d.com/guide/8-trim-door-xlcd_982300#1075290',
 holes:[[170.90088200462029,107.06730936720483],[170.9008820046141,345.50030511840976]],
 panelOuterY:-210.0000762939453,plateGap:.02,plateThickness:1,plateWidth:8,endMargin:15,cornerChamfer:1,
 bossRadius:2.75,bossHeight:2.3,boreRadius:1.55,segments:64,
 screwCAD:151,screwBearingY:-206.00001525878906,screwHeadHeight:1.65,
 pivot:[182.60025437,-206,231.69030816],uprightOffset:[0,-12,0]
};
export const DOOR_HANDLE_TEXT={
 '固定プレートを外側から差し込む':['Insert the retaining plate from the outer side','Zasuňte upevňovací destičku z vnější strany','Halteplatte von außen einschieben'],
 'M3x8rT 1本目：差し込んで軽く締める':['First M3x8rT: insert and tighten gently','První M3x8rT: vložte a opatrně utáhněte','Erste M3x8rT: einsetzen und vorsichtig festziehen'],
 'M3x8rT 2本目：差し込んで軽く締める':['Second M3x8rT: insert and tighten gently','Druhý M3x8rT: vložte a opatrně utáhněte','Zweite M3x8rT: einsetzen und vorsichtig festziehen'],
 'プレートのネジ支柱をパネルから離れる向きにそろえ、2本を1本ずつ軽く締めます。':['Align the plate with its threaded posts facing away from the panel, then tighten the two screws gently, one at a time.','Vyrovnejte destičku závitovými sloupky od panelu a oba šrouby opatrně utáhněte, jeden po druhém.','Gewindesäulen der Platte von der Scheibe weg ausrichten und beide Schrauben nacheinander vorsichtig festziehen.']
};
