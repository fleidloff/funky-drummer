# 0005. Samples are normalized to onset-window RMS, not integrated loudness

- **Status:** ✅ Accepted
- **Date:** 2026-09-16

## Context

[docs/music.md](../music.md) Part 3 made loudness normalization a precondition
of the relative-gain table: without it, "−8 dB on a hot hi-hat sample is louder
than 0 dB on a quiet kick". It named the unit as **integrated loudness** and
called the step measurable, which it is — for programme material.

A drum pack is not programme material. EBU R128 integrates over 400 ms blocks
behind a −70 LUFS absolute gate, and most of this kit is shorter than 400 ms.
Measured while building V4:

| Same −6 dB tone | 0.1 s | 0.35 s | 2 s |
| :-- | :-- | :-- | :-- |
| `ffmpeg -af ebur128`, integrated | −70.0 | −70.0 | −28.0 |
| Padded to 4 s with silence | −34.1 | −31.0 | −28.4 |
| Momentary maximum | −34.1 | −28.6 | −28.0 |

The first row is the gate floor, not a level. The other two produce a number and
a worse problem: both still measure over 400 ms, so they read a short sample as
quieter than a long one at the same amplitude, and normalizing against them
would push a rimshot far hotter than a crash.

Any measure with a 400 ms window is wrong for a pack whose shortest file is a
tenth of that.

## Decision

Every sample is normalized to **−21.0 dBFS RMS, measured over 100 ms from its
onset**, on a mono downmix at 44.1 kHz, where the onset is the first sample
reaching −40 dBFS. The tolerance is ±0.5 dB and a test holds it.

`targetRmsDb` and `rmsWindowMs` are fields on `Kit` in
`src/lib/kit/manifest.ts`, so the normalize script and the test read the same
two numbers.

**The target is derived, not chosen:** `−1 dBFS − the worst crest factor in the
set`. Adding a file or changing a trim re-derives it.

## Consequences

- **The gain table in `docs/music.md` Part 3 means what it says**, which was the
  whole point of requiring normalization.
- **The measurement is defined on every file in the pack**, including a 100 ms
  cross-stick. That was not true before.
- **Anchoring on the onset is load-bearing, not tidiness.** 50 ms of leading
  silence moves a whole-file RMS reading by 0.6 dB — most of the tolerance. It
  also means a file must carry a full window of audio *after* its onset, so the
  pack holds an invariant: nothing shorter than 150 ms from onset.
- **Trimming happens at the onset sample, with no pre-roll.** Vorbis pre-echo
  lands in a leading gap at around −40 to −45 dBFS, close enough to the onset
  floor that a 0.2 dB gain change moves which sample crosses it first — which
  moves the window, which changes the measurement. With a pre-roll the
  normalize loop does not converge.
- **It is not perceptual.** RMS is not K-weighted, so a shaker reads quieter
  than it sounds against a kick. The eight offsets in Part 3 absorb that, and
  Part 3 already lists them as open and adjustable by ear.
- **Every future sample added to the pack must be normalized the same way**, or
  it arrives at the wrong level relative to everything already there.
- **It does not prevent the mix clipping.** It bounds one file, not the sum:
  kick, snare and hat coinciding at gains 1.00 / 0.89 / 0.40 reach a theoretical
  2.3×. Headroom belongs to the transport and is not decided here.

## Alternatives considered

- **Integrated loudness (EBU R128)**, as `docs/music.md` originally said — it is
  undefined on a file shorter than 400 ms, which is most of this pack.
- **Padding short files with silence, or reading momentary maximum** — both
  produce a number and both are duration-dependent, so they normalize short
  samples louder than long ones.
- **K-weighted RMS over the same window** — more perceptually honest, and the
  biquad coefficients would be hand-rolled DSP that nothing in this pipeline can
  hear to check. Rejected as unverifiable rather than as wrong.
- **True peak** — trivially defined on any file, and exactly what Part 3 argues
  against. It would make the gain table arithmetic on recording level again.
