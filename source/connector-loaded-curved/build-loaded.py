"""Build original loaded-contact reference solids/buffers without external CAD."""
from pathlib import Path
import argparse,importlib.util,json,sys
sys.dont_write_bytecode=True
H=Path(__file__).resolve().parent
def load(n,p):s=importlib.util.spec_from_file_location(n,H/p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
def build(output):
 O=Path(output);O.mkdir(parents=True,exist_ok=True);assert not(O/'manifest.json').exists()
 m=load('loaded_terminal','loaded-terminal.py');export=load('reference_export','build.py').export;solver=load('contact_constraint','contact-constraint.py');assets={}
 for name,shape in [('terminal-frame',m.fixed_terminal_frame()),('terminal-unloaded',m.terminal()),('terminal-seated',m.terminal(contact_angle=solver.pose(0)['angleRadians']))]:
  assets[name]=export(shape,name,O);assets[name]['qualification']='Original analytic terminal reference using published family lengths and qualified forming/contact estimates. No new terminal CAD-reference or physical specimen measurements, fitted SKU, OEM exactness, production crimp or force claim.'
 (O/'manifest.json').write_text(json.dumps({'units':'mm','assets':assets,'seatedPose':solver.pose(0),'qualification':'Original finite functional-contact and formed reference. Compliant plug contact topology, strip partition and forming dimensions are estimates; not OEM exact, production crimp or force data. Header/housing sources are unchanged.'},indent=2)+'\n',encoding='utf-8');return assets
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);args=p.parse_args();build(args.output)
