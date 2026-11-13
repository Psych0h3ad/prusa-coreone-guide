#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Package static files and their matching preferred sources, using only Python's standard library.

Copyright (c) 2026 CORE One Community Guide contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.

This notice applies only to this packaging script. Input assets retain their separate terms.
"""
from pathlib import Path, PurePosixPath
import argparse, hashlib, json, shutil, zipfile

GEOMETRY = {'.glb', '.stl', '.bin', '.gz', '.f64'}
PRIVATE = {'.git', '.github', '.local', '.codex', '.venv', 'venv', 'research',
           'node_modules', '__pycache__', '.pages-build'}
ROOT_FILES = {'.gitattributes', '.gitignore', 'README.md', 'LICENSES.md',
              'ATTRIBUTION.md', 'ASSET-LICENSE-INDEX.json', 'FILE-MANIFEST.json',
              'package.json', 'server.mjs'}
SOURCE_LINK = '<p data-no-translate><a href="./source.zip">ソース / Source / Zdroj / Quelltext (ZIP)</a></p>\n'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def archive_path(name):
    p = PurePosixPath(name)
    if not name or p.is_absolute() or '..' in p.parts or '\\' in name:
        raise ValueError('Unsafe manifest path')
    return p

def source_eligible(name):
    p = archive_path(name)
    if any(x in PRIVATE or x.startswith('.env') for x in p.parts):
        return False
    if p.suffix.lower() in GEOMETRY or p.suffix.lower() in {'.pyc', '.pyo'}:
        return False
    return name in ROOT_FILES or p.parts[0] in {'dist', 'scripts', 'source'}

def verified_files(root):
    data = json.loads((root / 'FILE-MANIFEST.json').read_bytes())
    rows = data['files']
    result = {}
    for row in rows:
        name = row['path']
        p = archive_path(name)
        if name in result or name == 'FILE-MANIFEST.json':
            raise ValueError('Duplicate/self manifest entry')
        target = root.joinpath(*p.parts)
        if target.is_symlink() or any(x.is_symlink() for x in target.parents if x != root.parent):
            raise ValueError('Linked files are not supported')
        b = target.read_bytes()
        if len(b) != row['bytes'] or sha(b) != row['sha256']:
            raise ValueError('Manifest mismatch: ' + name)
        result[name] = b
    result['FILE-MANIFEST.json'] = (root / 'FILE-MANIFEST.json').read_bytes()
    # The whitelist and manifest jointly prevent untracked workspace content
    # from entering the source archive or the static output.
    if not {'dist/index.html', 'dist/credits.html', 'LICENSES.md'} <= result.keys():
        raise ValueError('Missing static entry point or notices')
    return result

def write_zip(target, files):
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for name in sorted(files):
            info = zipfile.ZipInfo(name, (2000, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, files[name], compresslevel=6)

def build(root, output):
    root = root.resolve()
    output = output.resolve()
    if output == root or root.is_relative_to(output):
        raise ValueError('Output cannot contain or replace the project')
    if any(output.is_relative_to(root / n) for n in ['dist', 'scripts', 'source', '.github']):
        raise ValueError('Output cannot replace source or input assets')
    files = verified_files(root)
    web = {n[5:]: b for n, b in files.items() if n.startswith('dist/')}
    expected = set(web) | {'source.zip', '.nojekyll'}
    if output.exists():
        if output.is_symlink() or any(p.is_symlink() for p in output.rglob('*')):
            raise ValueError('Linked output is not supported')
        old = {p.relative_to(output).as_posix() for p in output.rglob('*') if p.is_file()}
        if old - expected:
            raise ValueError('Output contains unrelated/stale files; choose a fresh directory')
    source = {n: b for n, b in files.items() if source_eligible(n)}
    source_index = {'algorithm': 'SHA-256', 'selfExcluded': 'SOURCE-ARCHIVE-MANIFEST.json',
                    'files': [{'path': n, 'bytes': len(b), 'sha256': sha(b)}
                              for n, b in sorted(source.items())],
                    'prebuiltGeometryExtensionsAvailableAtSite': sorted(GEOMETRY)}
    source['SOURCE-ARCHIVE-MANIFEST.json'] = (json.dumps(source_index, ensure_ascii=False, indent=2) + '\n').encode()
    output.mkdir(parents=True, exist_ok=True)
    for name, b in sorted(web.items()):
        q = output / name
        q.parent.mkdir(parents=True, exist_ok=True)
        q.write_bytes(b)
    credit = output / 'credits.html'
    text = credit.read_text(encoding='utf-8')
    if text.count('</body>') != 1 or SOURCE_LINK in text:
        raise ValueError('Expected one unmodified source-page body')
    credit.write_bytes(text.replace('</body>', SOURCE_LINK + '</body>').encode())
    (output / '.nojekyll').write_bytes(b'')
    write_zip(output / 'source.zip', source)
    return {'sourceFiles': len(files), 'webFiles': len(web), 'pagesFiles': len(expected),
            'sourceArchiveFiles': len(source), 'sourceZipBytes': (output / 'source.zip').stat().st_size,
            'sourceZipSha256': sha((output / 'source.zip').read_bytes())}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    target = args.output if args.output else args.root / '.pages-build'
    print(json.dumps(build(args.root, target)))
