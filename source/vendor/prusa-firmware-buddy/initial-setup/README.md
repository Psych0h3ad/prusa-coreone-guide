# Initial-setup calibration display source

These files supply the CORE One door-sensor, loadcell and filament-sensor display guides. The browser presents versioned firmware phases; it does not control a printer or simulate live sensor readings.

The unchanged Prusa-Firmware-Buddy controllers, layout helpers, translations, icons and font inputs are indexed in inputs.json with original paths, release tags, SHA-256 and byte sizes. Original copyright notices are retained. Firmware-derived code is GPL-3.0-only; see ../LICENSE.md for the full upstream notices and GPL. Graphics/design retain CC BY-NC-SA4.0. Font inputs retain their OFL/IPA terms listed with the runtime assets. The QR generator retains Project Nayuki's MIT notice in qrcodegen.js.

From the project root, rebuild with Node and Python/Pillow:

    node scripts/build-initial-setup-displays.mjs
    python scripts/build-initial-setup-glyphs.py

The display specification and browser adapters are readable source. Supplemental glyph cells use the firmware's bitmap coverage, with no system-font substitution. Existing menu/gearbox atlases are preserved. Conditional door adjustments and retry screens are distinct examples; native controls and phase names follow the corresponding controller. Dynamic temperatures and machine positions are not fabricated. Official photographs remain supplementary.
