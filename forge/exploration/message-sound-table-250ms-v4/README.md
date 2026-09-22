# Warmer table-tap listening candidate

The owner found v3 plasticky and requested more of a woody ping-pong-table sound. V4 restores the lower-middle body from the same CC0 recording, removes the earlier treble boost, softens the high click and gives each direct impact a slightly longer but still gated body. Three taps remain exactly 250 ms apart. No pitch shift or reverb is added.

[New sample](preview.wav) · [Previous then new comparison](comparison-old-then-wood.wav) · [Source, edits and PCM measurements](source.json)

The comparison plays v3 first, pauses for 900 ms, then plays v4 at its original level. This is an exploratory listening candidate, not an app replacement or deployment. The owner has not yet judged its timbre. Prior samples, canonical SDD documents, approved visual baseline and app asset remain unchanged. Promotion would reconcile the affected architecture, QA and implementation-plan owners under the SDD pipeline.

The portable generator accepts a decoded 16-bit source WAV and output path; its runtime uses only the Python standard library. The source recording and CC0 attribution are recorded in source.json. No clipping, exact 250 ms peak intervals and silence outside the 45 ms impact windows were checked on the resulting PCM. Spectral measurements document the substantial tonal change, not a subjective quality verdict.
