export class WholeEarthService{
 constructor(native){this.native=native;this.stock=native.sourcePrefix.getLength();this.applied=false;}
 follow(end,release){this.native.followEnd(end,release);this.receipt=this.native.stockRoute.receipt;this.applied=true;}
 restore(){if(!this.applied)return;this.native.endKey='';this.applied=false;}
}
