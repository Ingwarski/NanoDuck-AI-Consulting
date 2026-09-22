"""Warmer table-tap listening candidate; not promoted to the app.

Usage: python3 edit-audio.py DECODED_SOURCE_WAV OUTPUT_WAV
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
    raw = array.array('h', source.readframes(source.getnframes()))
    if sys.byteorder != 'little':
        raw.byteswap()
mono = [sum(raw[i:i + channels]) / channels / 32768 for i in range(0, len(raw), channels)]


def filter_audio(samples, kind, frequency, q=math.sqrt(.5), gain_db=0):
    """RBJ biquad; process the source before trimming to avoid a filter startup click."""
    w = 2 * math.pi * frequency / rate
    co, si = math.cos(w), math.sin(w)
    alpha = si / (2 * q)
    if kind == 'highpass':
        b = [(1 + co) / 2, -(1 + co), (1 + co) / 2]
        a = [1 + alpha, -2 * co, 1 - alpha]
    elif kind == 'lowpass':
        b = [(1 - co) / 2, 1 - co, (1 - co) / 2]
        a = [1 + alpha, -2 * co, 1 - alpha]
    else:
        amplitude = 10 ** (gain_db / 40)
        b = [1 + alpha * amplitude, -2 * co, 1 - alpha * amplitude]
        a = [1 + alpha / amplitude, -2 * co, 1 - alpha / amplitude]
    b0, b1, b2 = [v / a[0] for v in b]
    a1, a2 = a[1] / a[0], a[2] / a[0]
    x1 = x2 = y1 = y2 = 0.
    out = []
    for x in samples:
        y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, x, y1, y
        out.append(y)
    return out


# Retain the recorded table's lower-middle body, suppress rumble and tame
# the upper click. No generated tone, added reverb, or pitch change.
body = filter_audio(mono, 'highpass', 360)
body = filter_audio(body, 'peak', 1100, q=.85, gain_db=4)
body = filter_audio(body, 'lowpass', 5500)
start, length = round(.3945 * rate), round(.045 * rate)
impact = body[start:start + length]
for i in range(length):
    t = i / rate
    attack = min(1., t / .0003)
    decay = math.exp(-max(0., t - .006) / .007)
    fade_out = min(1., (length - 1 - i) / (.006 * rate))
    impact[i] *= attack * decay * max(0., fade_out)
peak = max(abs(x) for x in impact)
impact = [math.tanh(2.2 * x / peak) / math.tanh(2.2) * .96 for x in impact]
frames = round(.59 * rate)
out = [0.] * frames
onsets = [round(.008 * rate) + round(i * .25 * rate) for i in range(3)]
for onset in onsets:
    out[onset:onset + length] = impact
pcm = array.array('h', [round(x * 32767) for x in out])
if sys.byteorder != 'little':
    pcm.byteswap()
with wave.open(str(output_path), 'wb') as target:
    target.setparams((1, 2, rate, frames, 'NONE', 'not compressed'))
    target.writeframes(pcm.tobytes())
print(json.dumps({
    'sample_rate': rate, 'channels': 1, 'duration_seconds': frames / rate,
    'tap_length_ms': 45, 'onset_interval_ms': 250,
    'high_pass_hz': 360, 'body_peak_hz': 1100, 'body_gain_db': 4,
    'low_pass_hz': 5500, 'decay_after_ms': 6, 'decay_time_constant_ms': 7,
    'source_segment_seconds': [.3945, .4395],
    'impact_emphasis': 'tanh compression, drive 2.2; peak 0.96',
    'peak_fraction': max(abs(x) for x in out),
    'clipped_samples': sum(abs(x) >= 1 for x in out),
    'pitch': 'unchanged; no resampling', 'reverb': 'none added'
}, indent=2))
