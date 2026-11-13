These are the versioned source inputs for the browser navigation generator.

`inputs.json` records the upstream repository, release tags, original paths, exact byte sizes and SHA-256 hashes. The locked originals are supplied in the navigation, operations and coldpull directories. Verify these inputs and rebuild from the repository root:

```sh
node scripts/prepare-firmware-inputs.mjs --from source/vendor/prusa-firmware-buddy
node scripts/build-firmware-navigation.mjs
```

For an existing source cache with the same `navigation`, `operations` and `coldpull` directory layout, use `node scripts/prepare-firmware-inputs.mjs --from SOURCE_CACHE`. Every input is verified before files are written. A mismatched input stops preparation; it is not silently substituted.

The original upstream source files and copyright headers are retained unchanged. `LICENSE.md` contains the upstream license and notices: firmware code is GPL v3; graphics/design and fonts retain their separately stated terms. `coldpull-qr.json` retains the existing matrix for the official cold-pull link. The browser data preserves the versioned instructions and provenance hashes.

This directory describes these upstream inputs only. It does not assign a license to the surrounding application or to unrelated CAD, photographs or connector models.
