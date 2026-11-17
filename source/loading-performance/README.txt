Loading and resource diagnostics

Original helper code: dist/model-loading.js, dist/resource-monitor.js,
dist/surface-pool.js, dist/surface-worker.js and dist/surface-transfer.js.
Original code is MIT; see MIT.txt. CAD-derived data retains its separate terms.

Workers read, decompress and verify prepared surfaces and transfer the backing
buffer. Concurrency is capped at one for coarse touch, low memory hints or fewer
than four logical CPUs, and two otherwise. Unsupported workers use the same
verified byte path. Devices without native gzip decompression use the bundled MIT-licensed fflate decoder on the same compressed bytes.

Progress reports completed items; it is not a remaining-time prediction.
Resource diagnostics distinguish JS heap, tracked 3D backing buffers and image
estimates. They are not total browser, system or GPU memory. The optional page
memory API is only offered when the browser and isolation settings support it.
Closing the diagnostic panel stops periodic sampling. No telemetry is sent.
