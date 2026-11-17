# Model input recovery

Local sensor inputs are fetched together before the sensor factory creates
Three geometry or materials. Transient GET/network/body-read failures have
at most three attempts. Retried requests reload the browser cache; retries
wait 300ms then 900ms unless a Retry-After value supplies a bounded delay.
Permanent HTTP errors, malformed JSON and application errors remain failures.
The loading panel shows the next attempt in Japanese, English, Czech or German.
Disposing the viewer aborts its participating input requests and pending waits.

The two sensor JSON inputs and complete holder STL retain their original
data and notices. No CAD surface, material, position or assembly action is
changed. Failed sensor construction disposes its unadopted resources.
This helper is used for sensor inputs and upgrade placement data; it is not
a replacement for the separate core CAD, surface worker or optional service
loaders. Their own failure paths remain in effect.

Run node source/asset-load-recovery/build.mjs --out PATH_TO_CHECKOUT, with
--check to validate the matching source and exact host fields without writing.

The request failure fixtures can be run with:
node source/asset-load-recovery/check-request.mjs
