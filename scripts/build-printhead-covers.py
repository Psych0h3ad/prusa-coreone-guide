"""Build the printable assets and registered viewer datums from their inputs."""
from pathlib import Path
import hashlib
import json
import math
import runpy
import subprocess


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def build(root):
    vendor = root / 'source/vendor/prusa-printhead-covers'
    recipe = json.loads((vendor / 'inputs.json').read_text(encoding='utf8'))
    calibration = json.loads((root / 'source/calibration/printhead-cover-datums.json').read_text(encoding='utf8'))
    inputs = {}
    for entry in recipe['files']:
        raw = (vendor / 'stl' / entry['file']).read_bytes()
        if len(raw) != entry['bytes'] or digest(raw) != entry['sha256']:
            raise ValueError('Printable input mismatch: ' + entry['file'])
        inputs[entry['file']] = raw
    # Bind actual assembly/math inputs rather than a repository HEAD number.
    for entry in recipe['frameInputs']:
        raw = (root / entry['path']).read_bytes()
        if len(raw) != entry['bytes'] or digest(raw) != entry['sha256']:
            raise ValueError('Assembly-frame input mismatch: ' + entry['path'])
    placement = json.loads(subprocess.check_output(
        ['node', str(root / 'scripts/printhead-cover-native-frame.mjs')], cwd=root, text=True))
    assemble = runpy.run_path(str(root / 'scripts/build-printhead-mount.py'))['assemble_mount']
    body, body_metadata = assemble(inputs['loveboard-mount-r2.stl'])
    left = 'printhead-cover-left-r1.stl'
    rear = 'printhead-cover-rear-r2.stl'
    mount = 'loveboard-mount-r2.stl'
    if set(inputs) != {left, rear, mount}:
        raise ValueError('Unexpected printable set; update the build recipe explicitly')
    # Authored registration of the matching revisions in assembly millimetres.
    # These are viewer calibration, not a reconstructed manufacturer feature tree.
    spec = dict(author=recipe['author'], source=recipe['source'], license=recipe['license'], units='mm',
        files=[dict(file=name, sha256=digest(raw)) for name, raw in inputs.items()],
        covers=[
            dict(cadIndex=858, file=left, name='Printhead cover left R1', placement=[[0,0,1,-34.54444631],[1,0,0,-20.8952524],[0,1,0,412.15042136],[0,0,0,1]]),
            dict(cadIndex=860, file=rear, name='Printhead cover rear R2', placement=[[1,0,0,5.05555369],[0,0,-1,-11.5452524],[0,1,0,396.45742136],[0,0,0,1]]),
            dict(cadIndex=859, file=mount, name='LoveBoard mount R2', placement=placement,
                 assembledFile='loveboard-mount-r2-assembled.stl', assembledGeometry=body_metadata)],
        screw=dict(cadIndex=879, file='./assets/sensor/M3x10-cap.stl', name='M3x10 (ISO 4762)', placement=[[0,0,1,-24.64444631],[1,0,0,-19.8952524],[0,1,0,412.15042136],[0,0,0,1]]),
        nut=dict(file='./assets/sensor/M3nS.stl', name='M3nS (DIN 562)', placement=[[0,0,1,-15.44444631],[1,0,0,-19.8952524],[0,1,0,412.15042136],[0,0,0,1]]),
        obsolete=[dict(cadIndex=881, reason='Lower retaining post for the reference A5 cover; R1 hooks onto the cable clip and uses one upper M3x10.')],
        guide='https://help.prusa3d.com/guide/6-nextruder-assembly_982284#995406')
    angle = math.radians(calibration['mountNutSlotAngleDeg'])
    c, s = math.cos(angle), math.sin(angle)
    basis = [[c,s,0], [0,0,-1], [-s,c,0]]
    nuts = []
    for slot in calibration['mountNutSlots']:
        origin = slot['centerMm']
        column, sign = slot['insertionColumn'], slot['insertionSign']
        nuts.append(dict(component=slot['component'], file=spec['nut']['file'], name=spec['nut']['name'],
            placement=[row + [origin[i]] for i, row in enumerate(basis)] + [[0,0,0,1]],
            insertionAxis=[sign * row[column] for row in basis], insertionDistance=calibration['nutInsertionDistanceMm']))
    upper, lower = [slot['centerMm'] for slot in calibration['mountNutSlots']]
    f = calibration['rearUpperFastener']
    fastener = dict(cadIndex=f['cadIndex'], offset=f['offsetMm'], name='M3×10',
                    purpose='Upper R2 rear-cover fixing', holeAxis=[upper[0], upper[2]])
    nut_origin = [row[3] for row in spec['nut']['placement'][:3]]
    half_x, half_z = calibration['leftNutPocketHalfSizeXZMm']
    face = calibration['leftMatingFaceZMm']
    bearing_x = spec['covers'][0]['placement'][0][3] + face
    exterior_y = spec['covers'][1]['placement'][1][3]
    half_t = calibration['mountNutPocketThicknessMm'] / 2
    angle_label = 'ten' if calibration['mountNutSlotAngleDeg'] == 10 else f"{calibration['mountNutSlotAngleDeg']:g}"
    spec['datums'] = dict(
        left=f'Mating face Z={face:g} contacts rear cover X={bearing_x:.8f}. Hole axis follows the R2 square-nut pocket.',
        rear=(f'R2 rear M3x10 axes (X,Z): upper ({upper[0]:.8f},{upper[2]:.8f}), lower ({lower[0]:.8f},{lower[2]:.8f}). '
              f'Exterior bearing plane Y={exterior_y:.7f}. Left square-nut pocket X={nut_origin[0]-half_x:.3f}..{nut_origin[0]+half_x:.3f}, '
              f'Z={nut_origin[2]-half_z:.6f}..{nut_origin[2]+half_z:.6f}.'),
        mountNuts=(f'Two M3nS nuts remain captive in the R2 mount; square edges follow its {angle_label}-degree in-plane slot axes. '
                   f'Upper pocket Y={upper[1]-half_t:.7f}..{upper[1]+half_t:.7f}; lower pocket Y={lower[1]-half_t:.7f}..{lower[1]+half_t:.7f}.'))
    spec['mountNuts'] = nuts
    spec['fastenerOffsets'] = [fastener]
    # Prepare every result before replacing any output file.
    out = root / 'dist/assets/nextruder'
    out.mkdir(parents=True, exist_ok=True)
    for name, raw in inputs.items():
        (out / name).write_bytes(raw)
    (out / spec['covers'][2]['assembledFile']).write_bytes(body)
    (out / 'printhead-covers.json').write_text(json.dumps(spec, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print('Built three original printables, connected mount body and complete cover manifest.')


if __name__ == '__main__':
    build(Path(__file__).resolve().parents[1])
