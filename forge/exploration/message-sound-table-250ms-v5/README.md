# Blended table tap with a tiny echo

The owner requested something between the sharp v3 and woody v4 sounds, with a tiny echo. This candidate blends their direct impacts 50/50 after matching RMS, then adds quiet, softened reflections at 28 ms and 47 ms. There is no feedback; each complete tap ends within 92 ms. The three main taps remain 250 ms apart, at the original pitch.

[Listen](preview.wav) · [Source and measurements](source.json)

This is an exploratory listening candidate, not an app replacement or deployment. Prior candidates and canonical SDD artifacts remain unchanged. Any subsequent app promotion must reconcile the affected SDD owners. No new sound setting or production behavior is introduced here.

The standard-library Python generator takes the committed v3 WAV, v4 WAV and an output path. PCM verification checks no clipping, identical taps at exactly 250 ms intervals and silence after each short reflection tail. The blended impact's measured spectral centroid lies between v3 and v4; perceived timbre and echo remain for owner listening.
