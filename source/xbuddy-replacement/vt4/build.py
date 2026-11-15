# SPDX-License-Identifier: MIT
"""Build the original analytic socket mesh and its runtime manifest."""
from pathlib import Path
import argparse, json
from build_headers import build

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    parts = build(args.output)
    metadata = json.loads((Path(__file__).parent / 'runtime-metadata.json').read_text(encoding='utf-8'))
    metadata['parts'] = parts
    (args.output / 'manifest.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'parts': parts, 'units': metadata['units']}))

if __name__ == '__main__':
    main()
