"""Rebuild lossless route assets from the included Float64 arrays and metadata."""
from pathlib import Path
import argparse,gzip,hashlib,json,struct

def generate(root,check=False):
    rows=json.loads((root/'scripts/route-bank-assets.json').read_text())
    for row in rows:
        folder=root/'dist/assets/route-banks';raw=(folder/row['original']).read_bytes()
        assert len(raw)==row['bytes'] and hashlib.sha256(raw).hexdigest()==row['sha256']
        count=len(raw)//8;stride=row['stride']*8;delta=bytearray(raw)
        for i in range(stride,len(raw)):delta[i]=raw[i]^raw[i-stride]
        planes=b''.join(delta[p::8]for p in range(8))
        payload=struct.pack('<4sIII',b'RBF1',count,row['stride'],len(raw))+planes
        spec='{bytes:'+str(len(raw))+',stride:'+str(row['stride'])+',sha256:'+json.dumps(row['sha256'])+',original:new URL('+json.dumps('./assets/route-banks/'+row['original'])+',import.meta.url),compressed:new URL('+json.dumps('./assets/route-banks/'+row['compressed'])+',import.meta.url)}'
        module="import {loadRouteBank} from './route-bank-transfer.js';\nexport const "+row['exportName']+'={...'+json.dumps(row['metadata'],separators=(',',':'))+',dataFloat64:await loadRouteBank('+spec+')};\n'
        output=root/'dist'/row['module'];compressed=folder/row['compressed']
        if check:
            assert gzip.decompress(compressed.read_bytes())==payload
            assert output.read_text()==module
        else:
            compressed.write_bytes(gzip.compress(payload,compresslevel=9,mtime=0));output.write_text(module,encoding='utf-8')
        print(row['module'],'verified'if check else'rebuilt')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');args=p.parse_args()
    generate(Path(__file__).resolve().parents[1],args.check)
