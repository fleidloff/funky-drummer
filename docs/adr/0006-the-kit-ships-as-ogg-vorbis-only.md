# 0006. The kit ships as Ogg Vorbis only

- **Status:** ✅ Accepted
- **Date:** 2026-09-16

## Context

The app is a free page with no install, designed for a phone held in one hand.
The kit is 24 one-shots. As 16-bit WAV that pack is roughly 2 MB; as mono Ogg
Vorbis it is 236 KB.

The usual argument against a lossy codec for a sampler is encoder priming — the
silence an AAC encoder puts at the head of every file, which a sample-accurate
scheduler cannot have. It does not apply to Vorbis, which carries sample-exact
granule positions.

What does apply is Safari. caniuse lists Ogg Vorbis as supported in iOS Safari
from 18.4, partial from 17.4, and absent below — but that table measures the
`<audio>` element, and this app decodes through `decodeAudioData`, which is a
different path and has historically lagged on iOS.

## Decision

`public/samples/` holds one pack, mono Ogg Vorbis at 44.1 kHz. There is no
second format and no runtime format selection.

## Consequences

- **236 KB instead of 2 MB**, on a page whose target device is a phone.
- **One pack to keep in sync with the manifest**, and one row per file in
  [docs/samples.md](../samples.md). A second format would double both.
- **Mono is not a compression decision.** `docs/concept/Project.md` rules out
  panning, so a stereo pack would carry width the app cannot use.
- **Vorbis is not exactly level-preserving.** Its encode round-trip repeats to
  about ±0.05 dB, so the normalize script settles at 0.1 dB and re-encodes each
  iteration from the original decode — a file never picks up more than one extra
  generation whatever the pass count.
- **The risk is taken knowingly: if `decodeAudioData` refuses Ogg on iOS, the
  app is silent on its target device.** Nothing here has been run on a phone.
  The fix is a second WAV pack and a format choice at load, which is a change to
  the loader rather than to the pack — the manifest's `files` are paths, so a
  sibling extension costs one mapping.

## Alternatives considered

- **WAV only** — no codec risk at all, and 2 MB for a page people open to
  practise for ten minutes.
- **Ogg and AAC, chosen at load** — small everywhere, at the cost of a second
  pack, a second set of licence rows, and AAC's priming silence to measure per
  browser.
- **Probing a real iPhone before deciding** — offered and declined; the pack
  ships and a phone settles it later.
