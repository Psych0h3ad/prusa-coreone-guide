xBuddy replacement reference models

Follow the official procedure with four-language instructions, official photographs
and editable reference connectors and cable paths:
https://help.prusa3d.com/guide/how-to-replace-the-xbuddy-board-core-one_908859
Local steps1..34 correspond to official web steps2..35 and PDF steps1..34.
The additional NFC restoration operations cite the assembly steps separately.

The readable JavaScript listed in recipe.json is the preferred editable source;
the browser uses those dist/ files directly. The four-conductor fanout algorithm
is in dist/xbuddy-y-entry03.js; endpoint motion is in dist/xbuddy-y-channel-route02.js.
The browser imports these modules directly.

From the checkout root, with Python, NumPy and OCP installed, rebuild the original
analytic four-circuit reference and its complete runtime manifest with:
  python -B source/xbuddy-replacement/vt4/build.py --output dist/assets/xbuddy-replacement/headers
Change --output to write to another directory. To sample four conductor paths:
  node source/xbuddy-replacement/sample-y-route.mjs --output y-route.json
The sampler uses the same runtime algorithm and the checkout's vendored Three.js.

Design coordinates, reference BIN and sampled paths use millimetres; rendered
mesh buffers use metres. Pitch/envelope facts are separated from authored
estimates in recipe.json and vt4/header-parameters.json. Wire gauge/stock,
internal cavities, fanout bends and latch travel are teaching references;
installed supplier identity, internal crimp fit and retention force are unverified.

photos.json retains the official photograph provenance, step mappings and credits.
Prusa Research photographs/text/marks retain their original terms. MIT applies
only to the identified original code; CC BY-SA4.0 applies only to the identified
original reference geometry and authored parameters. Read the complete MIT.txt,
CC-BY-SA-4.0.txt, NOTICES.txt and existing asset-specific terms. Native printer CAD
and third-party sources retain their own licenses.
