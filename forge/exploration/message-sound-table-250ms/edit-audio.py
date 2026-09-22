"""Retiming only: repeat the first recorded ping-pong-table impact at 250 ms.
Usage: python3 edit-audio.py DECODED_SOURCE_WAV OUTPUT_WAV
The source is decoded to 16-bit PCM without changing its sample rate/pitch.
"""
import array
import json
import math
import sys
import wave
from pathlib import Path

source_path, output_path = map(Path, sys.argv[1:])
with wave.open(str(source_path)) as source:
    assert source.getsampwidth() == 2
    rate, channels = source.getframerate(), source.getnchannels()
    data = array.array('h', source.readframes(source.getnframes()))
    if sys.byteorder != 'little':
        data.byteswap()
start = round(.385 * rate)
length = round(.190 * rate)
impact = [v / 32768 for v in data[start * channels:(start + length) * channels]]
for frame in range(length):
    fade = min(1, frame / (.001 * rate), (length - 1 - frame) / (.015 * rate))
    for channel in range(channels):
        impact[frame * channels + channel] *= max(0, fade)
peak = max(abs(v) for v in impact)
impact = [v * .88 / peak for v in impact]
frames = round(.76 * rate)
out = [0.] * (frames * channels)
onsets = [round(.008 * rate) + round(i * .250 * rate) for i in range(3)]
for onset in onsets:
    for i, value in enumerate(impact):
        out[onset * channels + i] += value
pcm = array.array('h', [round(v * 32767) for v in out])
if sys.byteorder != 'little':
    pcm.byteswap()
with wave.open(str(output_path), 'wb') as target:
    target.setparams((channels, 2, rate, frames, 'NONE', 'not compressed'))
    target.writeframes(pcm.tobytes())
print(json.dumps({'sample_rate': rate, 'channels': channels, 'duration_seconds': frames/rate, 'impact_starts_seconds': [n/rate for n in onsets], 'impact_interval_ms': 250, 'source_segment_seconds': [.385, .575], 'peak_fraction': max(abs(v) for v in out), 'clipped_samples': sum(abs(v) >= 1 for v in out), 'pitch': 'unchanged; no resampling or time stretching'}, indent=2))
