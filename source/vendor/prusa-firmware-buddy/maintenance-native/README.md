# Manual cold-pull display source

The read-only CORE One guide shows the versioned Filament Sensing menu, PLA material selection and selected loading phases. Native actions are performed on the printer. The remembered ON/OFF choice and extra purge are conditional examples; the guide does not connect to a printer or predict every prompt. The PLA selector uses a standard-preset example. It does not replace the later manual cold-pull temperatures.

Original Prusa-Firmware-Buddy v8.0.0 and v6.5.7 controllers, settings, phase responses, translations and bitmap font inputs are retained unchanged in inputs.json with original paths, release URLs, SHA-256 and sizes. Firmware adaptations are marked in their readable browser and recipe source. Original notices and GPL-3.0-only terms are retained; see ../LICENSE.md. Existing menu artwork and bitmap fonts keep their CC BY-NC-SA 4.0, Liberation OFL and Migu/IPA terms in dist/assets/firmware-ui/README.txt and its accompanying license files.

Rebuild from this project root:

    node scripts/build-maintenance-native-displays.mjs
    python scripts/build-maintenance-native-glyphs.py

The recipes use Node and Python/Pillow. No system-font rendering is used. Glyph cells are derived from the corresponding original bitmap coverage. Existing menu and gearbox assets are also required.
