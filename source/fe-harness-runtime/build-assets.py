from pathlib import Path
import hashlib,json,shutil,sys
H=Path(__file__).resolve().parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else H/"generated-assets"
out.mkdir(parents=True,exist_ok=True)
manifest=json.loads((H/"inputs/manifest.json").read_bytes())
for row in manifest["buffers"].values():
 p=H/"inputs"/row["path"];b=p.read_bytes()
 assert len(b)==row["bytes"] and hashlib.sha256(b).hexdigest()==row["sha256"]
 shutil.copyfile(p,out/row["path"])
shutil.copyfile(H/"inputs/manifest.json",out/"manifest.json")
print(json.dumps({"status":"EXACT_FULL_PREFERRED_BUFFERS","files":len(manifest["buffers"])+1}))
