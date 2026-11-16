"""Generate the runtime frame/metadata from local analytic preferred source."""
from pathlib import Path
import argparse,importlib.util,json,shutil,tempfile,sys
sys.dont_write_bytecode=True
H=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);args=p.parse_args();O=args.output.resolve();O.mkdir(parents=True,exist_ok=True)
if any(O.iterdir()):raise RuntimeError('Choose an empty output directory')
s=importlib.util.spec_from_file_location('original_loaded_builder',H/'build-loaded.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
with tempfile.TemporaryDirectory() as temporary:
 T=Path(temporary);assets=m.build(T)
 shutil.copyfile(T/'terminal-frame.bin',O/'terminal-frame.bin')
 manifest={'units':'mm','frame':assets['terminal-frame'],'qualification':'Independently authored functional contact reference; not fitted supplier SKU or finished crimp.'}
 (O/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
for name in ['stock.json','contact-parameters.json']:shutil.copyfile(H/name,O/name)
