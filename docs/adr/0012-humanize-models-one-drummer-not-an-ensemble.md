# 0012. Humanize models one drummer's scatter, not an ensemble's

- **Status:** ✅ Accepted
- **Date:** 2026-09-17

## Context

`docs/music.md` set the humanize spread at σ = 0.026 beats with a ±0.065 clamp,
and cited a measurement of an expert funk rhythm-section performance. V6 built
it. Fred listened and said it was too much: *"humanize is too much, it should
only be micro-timing, barely noticeable, yet much more human like."*

The document's own evidence agreed with him. Part 1 records that a listener
reliably reads a displacement as **pushed or laid-back — as intent — at roughly
16–30 ms**, and that below that it reads as human. At 96 BPM, σ = 0.026 beats is
16 ms and the clamp is 41 ms. So the spread sat exactly *on* the intent
threshold: 32.5% of notes landed at or past the point where the ear stops
hearing a human and starts hearing a decision. Every bar contained several notes
a listener could point at.

Turning the number down would have fixed the symptom. The `musician` found the
cause: **σ = 0.026 was never a per-note figure.** It was measured across a
rhythm *section* — several players against one grid — so it pools two different
quantities: how much one player's strokes scatter, and how far the players sit
from each other. This app already sets the second to zero, by decision, in the
per-voice bias rule. Applying the pooled figure per note added it back, and
double-counted it.

## Decision

**Humanize models the stroke-to-stroke scatter of one drummer**, and its
magnitude is derived from the perceptual threshold rather than borrowed from an
ensemble measurement.

The clamp is set first, just inside the 16–30 ms window at the reference tempo,
and the sigmas follow as σ = clamp / 3 so the clamp bounds the distribution
rather than shaping it:

| | beats | ms at 96 BPM |
| :-- | --: | --: |
| Per-step σ | 0.0075 | 4.69 |
| Per-voice σ | 0.0030 | 1.88 |
| Combined σ | 0.0081 | 5.05 |
| Hard clamp | 0.024 | 15.00 |

The 2.5-to-1 step-to-voice ratio is unchanged, because the argument for the
split — one drummer has one body — was never the thing in dispute.

Measured after the change: delivered σ 0.00806 beats, 0.30% of draws on the
clamp, and **0.00% of notes past 16 ms at 96 BPM or above**.

This supersedes the σ = 0.026 figure. `docs/music.md`'s `## Closed` table records
it, and the magnitude itself has moved back to `## Open` pending a listen,
because a number derived from a perceptual threshold is a proposal until someone
hears it.

## Consequences

- **A published measurement is not automatically the right number.** The figure
  was real and correctly cited; it measured the wrong thing for this use. That is
  the reusable lesson, and it is why this is an ADR rather than a tuning commit.
- **`fills.ts` inherits a much larger ratio, deliberately.** The fill's
  converging offset stays at 0.09 → 0.006 beats and does **not** move with this.
  A fill is the one place the app is deliberate, so the 16–30 ms window is a
  target there rather than a ceiling. At the old spread a fill's first note was
  3.5 σ off the grid; it is now 11 σ. The old ratio was the broken one — the
  single deliberate gesture in the app barely stood out of the noise it exists to
  resolve.
- **The fill offset is not subject to `CLAMP_BEATS`.** A ±0.024 clamp would
  flatten a 0.09-beat displacement to nothing. Whoever builds `fills.ts` must
  bypass the clamp, and the converging offset is late in every case, so it never
  needs the earlier-lookahead of
  [ADR 0010](0010-the-lookahead-covers-what-the-pipeline-can-do-to-a-note.md).
- **The tempo floor is no longer propped up by the start lead.** At ±0.065 a full
  pull-back at 60 BPM was 65 ms against a 100 ms lead. At ±0.024 it is 24 ms, and
  the margin only goes negative below about 14 BPM. The floor rests on the
  sixteenth grid dragging, which is the reason `docs/music.md` § *Tempo* gives.
- **Nothing in the transport changed.** The horizon is derived from
  `CLAMP_BEATS`, so the clamp fell by a factor of 2.7 underneath it and the
  margin tests asserting a 75 ms floor stayed green without an edit. That is
  ADR 0010 paying for itself within one change.
- **It is still unheard.** The old number was wrong in a way arithmetic could
  show. The new one is defensible by the same arithmetic and unconfirmed by any
  ear, which is the honest status.

## Alternatives considered

- **Keep σ = 0.026 and add a Humanize control.** Pushes the decision onto the
  user and adds a knob the front panel does not have. It also leaves the default
  wrong, and a default is what most people hear.
- **Scale the sigmas down and leave the clamp.** A clamp at 2.7× the old σ ratio
  would never be reached, so it would stop being a ceiling and start being
  decoration — and the relationship the document argues for, clamp as a bound
  rather than a shaper, would be untrue.
- **Keep the ensemble figure and subtract the between-player component.** The
  honest version of this, but the source does not publish the decomposition, so
  it would be a subtraction with a made-up operand.
