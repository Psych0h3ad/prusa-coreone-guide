"""Acquire the three exact printable inputs, or use an existing matching cache."""
from pathlib import Path
import argparse
import hashlib
import json
import urllib.request


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--from', dest='cache', type=Path, help='Directory containing the three named STL files; disables downloads')
    args = parser.parse_args()
    folder = Path(__file__).resolve().parents[1] / 'source/vendor/prusa-printhead-covers'
    recipe = json.loads((folder / 'inputs.json').read_text(encoding='utf8'))
    pending = []
    for entry in recipe['files']:
        if Path(entry['file']).name != entry['file']:
            raise ValueError('Input names must be plain filenames')
        if args.cache is not None:
            raw = (args.cache / entry['file']).read_bytes()
        else:
            if not entry['url'].startswith('https://files.printables.com/'):
                raise ValueError('Unexpected input host')
            with urllib.request.urlopen(entry['url'], timeout=60) as response:
                raw = response.read(entry['bytes'] + 1)
        if len(raw) != entry['bytes'] or hashlib.sha256(raw).hexdigest() != entry['sha256']:
            raise ValueError('Input byte/hash mismatch: ' + entry['file'])
        pending.append((entry['file'], raw))
    # No partial source writes if acquisition or any hash check fails.
    target = folder / 'stl'
    target.mkdir(parents=True, exist_ok=True)
    for name, raw in pending:
        (target / name).write_bytes(raw)
    print('Prepared', len(pending), 'unchanged printable inputs;', sum(len(b) for _, b in pending), 'bytes')


if __name__ == '__main__':
    main()
