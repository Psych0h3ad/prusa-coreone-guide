"""Select the connected assembled body while preserving official STL records."""
from pathlib import Path
import hashlib
import itertools
import json
import struct


def assemble_mount(raw):
    if len(raw) < 84:
        raise ValueError('Truncated binary STL')
    count = struct.unpack_from('<I', raw, 80)[0]
    if len(raw) != 84 + 50 * count:
        raise ValueError('Invalid binary STL record count')
    parent, vertex_ids, triangles = [], {}, []

    def vertex_id(point):
        if point not in vertex_ids:
            vertex_ids[point] = len(parent)
            parent.append(len(parent))
        return vertex_ids[point]

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for i in range(count):
        values = struct.unpack_from('<9f', raw, 84 + 50 * i + 12)
        points = [tuple(values[j:j + 3]) for j in (0, 3, 6)]
        ids = [vertex_id(point) for point in points]
        parent[find(ids[1])] = find(ids[0])
        parent[find(ids[2])] = find(ids[0])
        triangles.append(ids)
    groups = {}
    for i, ids in enumerate(triangles):
        groups.setdefault(find(ids[0]), []).append(i)
    if sorted(map(len, groups.values())) != [12, 38146]:
        raise ValueError('Unexpected mount components; source revision needs review')
    omitted = min(groups.values(), key=len)
    retained = max(groups.values(), key=len)
    by_id = {i: p for p, i in vertex_ids.items()}
    box = {by_id[v] for i in omitted for v in triangles[i]}
    lo = [min(p[k] for p in box) for k in range(3)]
    hi = [max(p[k] for p in box) for k in range(3)]
    expected = [[-13, -12.5, 0], [8.09791088104248, -8.17130184173584, 11.75]]
    corners = set(itertools.product(*zip(lo, hi)))
    if box != corners or [lo, hi] != expected:
        raise ValueError('Detached component is not the expected eight-corner box')
    body = (b'LoveBoard mount R2 - assembled connected body'.ljust(80, b' ')
            + struct.pack('<I', len(retained))
            + b''.join(raw[84 + 50 * i:84 + 50 * (i + 1)] for i in retained))
    metadata = dict(sourceTriangles=count, retainedTriangles=len(retained),
                    omittedDetachedBox=dict(triangles=len(omitted), bounds=[lo, hi]),
                    sha256=hashlib.sha256(body).hexdigest())
    return body, metadata


def main():
    folder = Path(__file__).resolve().parents[1] / 'dist/assets/nextruder'
    body, metadata = assemble_mount((folder / 'loveboard-mount-r2.stl').read_bytes())
    manifest = folder / 'printhead-covers.json'
    spec = json.loads(manifest.read_text(encoding='utf8'))
    mount = next(c for c in spec['covers'] if c['cadIndex'] == 859)
    mount['assembledFile'] = 'loveboard-mount-r2-assembled.stl'
    mount['assembledGeometry'] = metadata
    (folder / mount['assembledFile']).write_bytes(body)
    manifest.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print('Assembled mount:', metadata['retainedTriangles'], 'unchanged triangle records')


if __name__ == '__main__':
    main()
