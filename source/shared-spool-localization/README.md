# Spool-holder action translations

The six sheet and spool-holder actions have Japanese, English, Czech and German labels. The translations reuse the existing initial-preparation labels. The O-ring is named “Spoolholder O-ring”; its description gives the nominal 25×3.5 mm product size.

The build instructions refer to official step 999427: align and lower the sheet, fit the O-ring, then align, insert and turn the holder clockwise. The upgrade instructions refer to step 1022776 and use the four holder actions. Their official line IDs are separate. The translations do not specify an exact locking angle, torque or measured fit.

Editable source files are `runtime/i18n.js`, `locales/messages.json` and `translations.json`. Run `node source/shared-spool-localization/build.mjs --out PATH_TO_CHECKOUT` to apply the two exact host changes, or add `--check` to verify them. The builder accepts the listed input bytes or the exact final bytes and rejects other inputs. It needs no private Git objects, research directory or CAD input.

Register the Japanese action labels before initializing localization. Use the exact O-ring name and description in SOURCES.json before localizing part metadata. The message request uses cache epoch 209; the page's i18n module URL must also refer to the current module.

The code and material terms are described in NOTICES.md.
