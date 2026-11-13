Prusa-Firmware-Buddy LCD graphics and bitmap typefaces
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
