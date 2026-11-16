"""Original formed-web successor. MIT code; CC-BY-SA4.0 original geometry.

Insulation ends between the two barrels (application sheet14). The numerical
partition is an explicit reference estimate, not an OEM strip specification.
Full metal web width, nominal sheet thickness and occupied volume are retained.
No housing/header edit, intersection-derived cutter or wire radius change.
"""
from pathlib import Path
import importlib.util,json
H=Path(__file__).resolve().parent
def module(n,p):s=importlib.util.spec_from_file_location(n,H/p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
base=module('unchanged_housing_terminal_reference','functional-model.py');A=base.A
contact_model=module('full_stock_reference_contact','contact-leaf.py')
STRIP_Y_MM=1.0
WEB_SUPPORT_END_Y_MM=1.05
def formed_web():
 # Original mounted-frame web: keep the insulation-support level until after
 # the estimated stripped jacket end, then bridge to the conductor barrel.
 t=A['sheetThickness'];z=A['wireCenterZ'];high=z+A['insulationRadius'];low=z+A['conductorRadius'];contact=z+A['bladeHeightZ']/2-t
 stations=[(0,high),(A['insulationBarrelLength'],high),(WEB_SUPPORT_END_Y_MM,high),(A['conductorBarrelStart'],low),(A['conductorBarrelStart']+A['conductorBarrelLength'],low),(3.1,contact)]
 return base.shell.yz(stations+[(y,z+t)for y,z in reversed(stations)],-A['bridgeWidth']/2,A['bridgeWidth'])
def terminal(depression=0,contact_angle=0):
 solid=formed_web()
 for part in [base.mounted_barrel(A['insulationRadius'],0,A['insulationBarrelLength']),base.mounted_barrel(A['conductorRadius'],A['conductorBarrelStart'],A['conductorBarrelLength']),contact_model.contact(contact_angle,depression)]:solid=base.fuse(solid,part)
 base.assert_solid(solid);return solid
def fixed_terminal_frame(depression=0):
 solid=formed_web()
 for part in [base.mounted_barrel(A['insulationRadius'],0,A['insulationBarrelLength']),base.mounted_barrel(A['conductorRadius'],A['conductorBarrelStart'],A['conductorBarrelLength']),contact_model.frame(depression)]:solid=base.fuse(solid,part)
 base.assert_solid(solid);return solid
def wire(start_y=-2):
 from OCP.gp import gp_Ax2,gp_Pnt,gp_Dir
 from OCP.BRepPrimAPI import BRepPrimAPI_MakeCylinder
 axis=gp_Ax2(gp_Pnt(0,start_y,A['wireCenterZ']),gp_Dir(0,1,0));end=2.70
 core=BRepPrimAPI_MakeCylinder(axis,A['conductorRadius'],end-start_y).Shape();jacket=BRepPrimAPI_MakeCylinder(axis,A['insulationRadius'],STRIP_Y_MM-start_y).Shape()
 return {'core':core,'jacket':base.cut(jacket,core),'coreStockMM':end-start_y,'stripYMM':STRIP_Y_MM,'jacketODMM':2*A['insulationRadius'],'coreODMM':2*A['conductorRadius']}
