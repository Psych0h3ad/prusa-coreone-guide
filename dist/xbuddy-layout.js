// Port locations are registered to the official annotated connection photograph
// and the existing photo-derived board illustration. They are not PCB artwork.
export const XBUDDY_PORT_SOURCE='https://help.prusa3d.com/guide/how-to-replace-the-xbuddy-board-core-one_908859#911406';
export const XBUDDY_BOARD_ORIGIN=[-54.20276,165.45172,162.64597];
const label=s=>s.split('|');
const port=(key,components,rect,height,title)=>({key,components,rect,height,title:label(title)});
export const XBUDDY_PORTS=[
 port('X',[0],[4.55866,-2.80398,14.25984,4.55444],5.5,'Xモーター|X motor|Motor X|X-Motor'),
 port('Y',[1],[16.69258,-2.80398,26.03682,4.55444],5.5,'Yモーター|Y motor|Motor Y|Y-Motor'),
 port('ZL',[2],[28.65065,-2.80398,38.16535,4.55444],5.5,'Zモーター：ZL|Z motors: ZL|Motory Z: ZL|Z-Motoren: ZL'),
 port('ZR',[3],[40.60872,-2.80398,50.11811,4.55444],5.5,'Zモーター：ZR|Z motors: ZR|Motory Z: ZR|Z-Motoren: ZR'),
 port('MMU',[4],[52.74235,-2.97926,64.00592,6.13040],5.5,'MMU → 拡張基板|MMU → extension board|MMU → přídavná deska|MMU → Erweiterungsplatine'),
 port('xLCD',[13],[76.83981,24.31969,82.62797,59.01305],6.5,'xLCD：切り欠きと三角印|xLCD: notch and triangle|xLCD: výřez a trojúhelník|xLCD: Aussparung und Dreieck'),
 port('Nextruder',[7],[74.74866,73.44016,83.14686,94.08087],5.5,'Nextruderメインケーブル|Nextruder main cable|Hlavní kabel Nextruderu|Nextruder-Hauptkabel'),
 port('BED_TEMP',[10],[40.30584,90.44215,46.61535,97.54483],5.5,'BED TEMP：緑のHラベル|BED TEMP: green H label|BED TEMP: zelený štítek H|BED TEMP: grünes H-Etikett'),
 port('A_TEMP',[5],[-2.79982,37.76104,3.54931,45.08348],5.5,'A_TEMP：ドアセンサー、白・茶|A_TEMP: door sensor, white/brown|A_TEMP: senzor dvířek, bílá/hnědá|A_TEMP: Türsensor, weiß/braun'),
 port('PWR_PAN',[9],[74.93688,116.22504,82.09418,123.30551],5.5,'PWR PAN：Power Panic|PWR PAN: Power Panic|PWR PAN: Power Panic|PWR PAN: Power Panic'),
 port('HEATBED_OUT',[38,39],[15.65203,90.96207,38.24218,104.12234],9,'HEATBED OUT：黒−、赤＋|HEATBED OUT: black −, red +|HEATBED OUT: černá −, červená +|HEATBED OUT: Schwarz −, Rot +'),
 port('HEATBED_IN',[40,41],[28.86165,121.57913,49.65473,134.34577],9,'HEATBED IN：赤＋、黒−|HEATBED IN: red +, black −|HEATBED IN: červená +, černá −|HEATBED IN: Rot +, Schwarz −'),
 port('POWER_IN',[42,43],[51.90009,121.57913,72.32648,134.34577],9,'POWER IN：赤＋、黒−、拡張基板の赤線|POWER IN: red +, black −, extension red lead|POWER IN: červená +, černá −, červený vodič přídavné desky|POWER IN: Rot +, Schwarz −, rote Erweiterungsleitung')
];
export function xBuddyPortBounds(port,padding=0){
 const [x,y,z]=XBUDDY_BOARD_ORIGIN,[u0,v0,u1,v1]=port.rect;
 return [x-u1-padding,y-padding,z-v1-padding,x-u0+padding,y+port.height+padding,z-v0+padding];
}
export function xBuddyPortCentre(port){const b=xBuddyPortBounds(port);return [0,1,2].map(i=>(b[i]+b[i+3])/2);}
// P2 (heatbed thermistor) and J15 (ambient/door input), schematic revision44:
// both are two-circuit 1.50mm-pitch vertical CLIK-Mate 502584-0260.
// Component6 is an unused connector, not BED TEMP.
export const XBUDDY_SENSOR_COMPONENTS={5:{key:'A_TEMP',pins:2,pitch:1.5},10:{key:'BED_TEMP',pins:2,pitch:1.5}};
// J10 in the same official schematic specifies Harwin M20-7920442R.
// Nominals from the manufacturer's M20-792XX42R drawing, sheet3:
// housing width=4*2.54+.25, depth8.5, height5; two rows centred in height.
// The mounting registration remains photo-derived; contact spring details
// below are simplified and do not replace the manufacturer's CAD.
export const XBUDDY_WIFI_RECEPTACLE={
 part:'M20-7920442R',drawing:'https://content.harwin.com/asset/329b33e0-c659-44bb-96f0-1d1a2178afd8/DRG-02614-Technical-Drawing-Datasheet-M20-792R-pdf.pdf',
 width:10.41,depth:8.5,height:5,pitch:2.54,rows:[1.23,3.77],pinSize:.64,cavityDepth:6.45,contactDepth:2.7,
 entryU:-1.0268768860464663,centreV:81.8575143471897
};
