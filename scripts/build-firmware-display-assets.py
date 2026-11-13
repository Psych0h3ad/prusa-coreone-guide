"""Prepare the upstream bitmap glyphs, retaining firmware 4-bit coverage.

No system fonts, raster tracing or invented icons are used by the LCD renderer.
"""
from pathlib import Path
import json, re, shutil, hashlib, argparse
from PIL import Image

root = Path('research/quality/service-20261105-65')
parser = argparse.ArgumentParser()
parser.add_argument('--extra-source', action='append', default=[])
parser.add_argument('--report-dir', default=str(root))
args = parser.parse_args()
data = json.loads(Path('dist/firmware-ui-data.js').read_text('utf-8').split('export const FIRMWARE_UI=', 1)[1].rstrip(';\n'))
output = Path('dist/assets/firmware-ui')
output.mkdir(parents=True, exist_ok=True)
gearbox_labels = json.loads((output/'gearbox.json').read_text('utf-8')) if (output/'gearbox.json').exists() else {}
extra_text = ''.join(v for fw in gearbox_labels.values() for trans in fw['labels'].values() for v in trans.values())
allchars = sorted(set(''.join(chr(c) for c in range(32, 127)) + '°' + ''.join(v for fw in data['versions'].values() for trans in fw['labels'].values() for v in trans.values()) + extra_text))
meta = {}
for version in data['versions']:
    src = root / ('display-v' + version)
    dest = output / version
    dest.mkdir(exist_ok=True)
    info = {'fonts': {}, 'icons': {}}
    icon_files = list(src.glob('src__gui__res__png__*.png'))
    for extra_source in args.extra_source:
        icon_files += list((Path(extra_source)/('v'+version)).glob('src__gui__res__png__*.png'))
    for file in icon_files:
        name = file.name.split('__')[-1]
        shutil.copyfile(file, dest / name)
        info['icons'][name[:-4]] = name
    sizes = {'normal': (11, 19, 'bold'), 'special': (9, 16, 'regular'), 'big': (13, 22, 'bold'), 'large': (30, 53, 'bold')}
    for kind, (w, h, weight) in sizes.items():
        chars = allchars if kind != 'large' else list('0123456789.%? -,')
        atlas = Image.new('RGBA', (16*w, ((len(chars)+15)//16)*h))
        if version == '8.0.0':
            latin = Image.open(src / f'src__module__gui__font_data__png__LiberationMono-{weight}_{w}x{h}.png').convert('RGB')
            ja_file = src / f'src__module__gui__font_data__png__{w}x{h}px_migu-1m-regular_katakana.png'
            ja = Image.open(ja_file).convert('RGB') if ja_file.exists() else None
        else:
            charset = 'digits' if kind == 'large' else 'full'
            indices_file = src / f'src__guiapi__include__fnt-{charset}-indices.ipp'
            codes = [int(c, 16) for c in re.findall(r'0x[0-9a-fA-F]+', indices_file.read_text())]
            indices = {chr(code): i for i, code in enumerate(codes)}
            old = Image.open(src / f'src__gui__res__fnt_png__font_{weight}_{w}x{h}_{charset}.png').convert('RGB')
        for i, char in enumerate(chars):
            code = ord(char)
            if version == '8.0.0':
                image = latin
                if char in '、。':
                    image, x, y = ja, '、。'.index(char), 6
                elif 0x30a0 <= code <= 0x30ff:
                    image, x, y = ja, (code-0x30a0) % 16, (code-0x30a0)//16
                else:
                    x, y = (code-32) % 16, (code-32)//16
                if image is None or y < 0 or (y+1)*h > image.height:
                    image, x, y = latin, (ord('?')-32) % 16, (ord('?')-32)//16
            else:
                ix = indices.get(char, indices['?'])
                image, x, y = old, ix % 16, ix//16
            tile = image.crop((x*w, y*h, (x+1)*w, (y+1)*h))
            for yy in range(h):
                for xx in range(w):
                    rgb = tile.getpixel((xx, yy))
                    if rgb == (255, 0, 0):
                        rgb = (255, 255, 255)
                    alpha = ((255 - sum(rgb)//3) >> 4) * 17
                    atlas.putpixel(((i % 16)*w+xx, (i//16)*h+yy), (255, 255, 255, alpha))
        atlas.save(dest / (kind + '.png'))
        info['fonts'][kind] = {'file': kind+'.png', 'width': w, 'height': h, 'characters': ''.join(chars)}
    meta[version] = info
(output/'atlas.json').write_text(json.dumps(meta, ensure_ascii=False, separators=(',', ':')), 'utf-8')
for license_file in ('Liberation-OFL.txt', 'IPA-Font-License.txt'):
    shutil.copyfile(root/'font-licenses'/license_file, output/license_file)
(output/'README.txt').write_text('''Prusa-Firmware-Buddy LCD graphics and bitmap typefaces
Source: https://github.com/prusa3d/Prusa-Firmware-Buddy
Versions: v8.0.0 and v6.5.7

Icons and graphic design: Copyright Prusa Research s.r.o.
CC BY-NC-SA 4.0: https://creativecommons.org/licenses/by-nc-sa/4.0/
Icons are unmodified. Layout and glyph atlases were adapted for a browser LCD
preview; the firmware's 4-bit glyph coverage is retained.
The four transmission_*_187x175.png diagrams in each version are unmodified
Prusa-Firmware-Buddy images under the same CC BY-NC-SA 4.0 terms. gearbox.json
retains the versioned gearbox-alignment labels from the firmware translations.

Bitmap glyphs retain their respective font licenses, separately from the icons:
Latin glyphs originate from Liberation Mono. Digitized data copyright (c) 2010
Google Corporation, with Reserved Font Arimo, Tinos and Cousine. Copyright (c)
2012 Red Hat, Inc., with Reserved Font Name Liberation. SIL Open Font License
1.1, reproduced in Liberation-OFL.txt.
Katakana and Japanese punctuation originate from Migu 1M. Copyright (C)
2002-2019 M+ FONTS PROJECT. Copyright(c) Information-technology Promotion Agency,
Japan (IPA), 2003-2011. IPA Font License Agreement v1.0, reproduced in
IPA-Font-License.txt. Migu author and source:
https://itouhiro.github.io/mixfont-mplus-ipa/migu/
The atlases use the names normal, special, big and large. atlas.json specifies
each cell's Unicode character, width and height. To substitute the original
IPA Gothic Ver.003.03, obtain it from the IPA download linked by the Migu author,
rasterize its Katakana U+30A0-U+30FF and punctuation U+3001/U+3002 to those
cell dimensions, and replace the matching RGBA atlas cells without changing
their positions. The Latin cells are independent of this substitution.

Firmware license and other upstream notices: ../../licenses/Buddy-LICENSE.md.
The web LCD simulator is readable JavaScript with GPL-3.0-only SPDX notices.
''', 'utf-8')
hashes = {str(p).replace('\\', '/'): hashlib.sha256(p.read_bytes()).hexdigest() for p in output.rglob('*') if p.is_file()}
(Path(args.report_dir)/'display-asset-hashes.json').write_text(json.dumps(hashes, indent=2), 'utf-8')
print(f'Prepared {len(hashes)} LCD assets with original bitmap glyphs and icons.')
