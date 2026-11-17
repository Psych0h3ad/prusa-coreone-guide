# Initial preparation photographs

The ordinary initial-setup guide shows the existing official photographs for belt preparation, spool-holder preparation, and fitting the print sheet and spool holder. The third stage has three photographs. Each image keeps its original source URL and has a caption in Japanese, English, Czech and German.

The existing gallery provides previous/next, thumbnails, enlargement and retry. Printer-display examples and firmware controls keep their existing paths. The photographs are references for following the official procedure; they do not establish dimensions or mechanical fit.

Editable JavaScript is in `runtime/`. Run `node source/initial-setup-guide-photos/build.mjs --out PATH_TO_CHECKOUT` to copy the two exact modules, or add `--check` to check them. The builder accepts only listed input hashes and the exact final output. It needs no private Git objects or research directories. Host import-map entries for both runtime paths must point to the current files.

See NOTICES.md for the separate code and photograph terms.
