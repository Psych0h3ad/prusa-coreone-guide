"""Build the complete authored connector BIN/JSON family. Code MIT."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse
import build_headers,build_functional_housings,merge_manifest
def main():
 parser=argparse.ArgumentParser(description='Generate seven authored connector buffers and their part table.')
 parser.add_argument('--output',type=Path,default=Path('generated'))
 args=parser.parse_args();output=args.output.resolve();output.mkdir(parents=True,exist_ok=True)
 parts={**build_headers.build(output),**build_functional_housings.build(output)}
 result=merge_manifest.merge(output,parts)
 for part in result['parts']:print(part+'.bin')
 print('cad.json')
if __name__=='__main__':main()
