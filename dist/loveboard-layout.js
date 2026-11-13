// Shared mounting datum and connector frames. The outline is photo-derived;
// contact counts, pitch and mating directions follow the board schematic and
// connector specifications. Single-row geometry uses authored reference models.
export const LOVEBOARD={scale:.0586,datumPixel:[662,900],datumCAD:[-7.9444463137,-25.3952523998,378.2004213562]};
export const boardPoint=(x,y)=>[LOVEBOARD.datumCAD[0]+(x-662)*LOVEBOARD.scale,LOVEBOARD.datumCAD[1],LOVEBOARD.datumCAD[2]-(y-900)*LOVEBOARD.scale];
export const SOCKETS={
 J1:{rect:[264,439,376,574],pins:2,rows:1,pitch:1.5,out:[0,-1,0],height:7.3,manufacturerPart:'5025840260'},
 J12:{rect:[421,437,534,572],pins:2,rows:1,pitch:1.5,out:[0,-1,0],height:7.3,manufacturerPart:'5025840260'},
 J5:{rect:[260,603,370,752],pins:3,rows:1,pitch:1.5,out:[0,-1,0],height:7.3,manufacturerPart:'5025840360'},
 J6:{rect:[260,783,373,930],pins:3,rows:1,pitch:1.5,out:[0,-1,0],height:7.3,manufacturerPart:'5025840360'},
 J13:{rect:[429,589,570,930],pins:22,rows:2,pitch:1.5,out:[0,-1,0],height:8.75},
 J4:{rect:[695,274,873,395],pins:4,rows:1,pitch:1.5,out:[0,0,1],height:6.4,manufacturerPart:'5025850470'},
 J14:{rect:[1148,487,1272,679],pins:4,rows:1,pitch:1.5,out:[1,0,0],height:6.4,manufacturerPart:'5025850470'},
 J2:{rect:[1148,702,1272,852],pins:3,rows:1,pitch:1.5,out:[1,0,0],height:6.4,manufacturerPart:'5025850370'},
 P1:{rect:[484,271,655,432],pins:2,rows:1,pitch:3,out:[-1,0,0],height:6.93,material:'dark'}
};
export function socketCentre(id){const s=SOCKETS[id],[l,t,r,b]=s.rect,p=boardPoint((l+r)/2,(t+b)/2);if(s.out[1])p[1]-=s.height;else{p[1]-=s.height/2;if(s.out[0])p[0]=boardPoint(s.out[0]>0?r:l,0)[0];else p[2]=boardPoint(0,s.out[2]>0?t:b)[2];}return p;}
