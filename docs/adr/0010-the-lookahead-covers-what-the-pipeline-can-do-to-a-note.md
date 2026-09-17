# 0010. The lookahead covers what the pipeline can do to a note's time

- **Status:** ✅ Accepted
- **Date:** 2026-09-17

## Context

Until V6 a note's audio time was its step's time. `humanize` made it a step's
time plus a signed offset, and a signed offset can be negative: a note can be
scheduled **earlier** than the grid position it belongs to.

The scheduler plans a beat when its line enters a fixed 100 ms lookahead, ticking
every 25 ms, so a beat is normally committed 75–100 ms before it sounds.
`AudioBufferSourceNode.start(t)` with a `t` in the past does not throw — it fires
immediately, which is a placement error of whatever the shortfall was, against a
±1 ms tolerance.

Measured on the unwidened scheduler with every note pulled back by the full
clamp — then ±0.065 beats, before Fred heard it and the magnitude was cut to
±0.024 — the margin between the `play` call and the note's audio time was:

| Tempo | Margin |
| :-- | --: |
| 60 BPM | 35.0 ms |
| 96 BPM | 59.4 ms |
| 180 BPM | 61.7 ms |

Nothing was scheduled in the past, so the app would not have sounded broken
today. But the margin at 60 BPM had lost more than half its headroom, and the
quantity that ate it — how far a stage may displace a note — is one that later
stages will change. The fill exception in `docs/music.md` specifies a converging
offset of up to 0.09 beats, larger than humanize's whole clamp.

The defect is therefore not a number being too small. It is that the transport's
safety margin and the domain's displacement bound were two unrelated constants
that happened to be compatible.

## Decision

**The scheduler's horizon is the lookahead window plus the pipeline's maximum
negative displacement**, and the domain exports that bound rather than the
transport guessing it.

`src/lib/pipeline/index.ts` re-exports `CLAMP_BEATS`, and
`src/features/transport/lib/scheduler.ts` reads it:

```ts
const horizon =
  deps.clock() + LOOKAHEAD_SECONDS + CLAMP_BEATS * secondsPerBeat(tempo)
```

In beats, so it scales with tempo, and recomputed every tick so a tempo change
takes effect at once.

After the change the margin is 85.0 / 84.4 / 78.3 ms at 60 / 96 / 180 BPM —
back inside the 75–100 ms the design always intended.

**The margin is clamp-invariant, which is the point of deriving it.** The
widening and the earliest note it has to cover are the same quantity, so when
the clamp later fell from 0.065 to 0.024 the margin did not move and the tests
asserting a 75 ms floor stayed green without a number changing. A hardcoded
horizon would have needed editing twice.

## Consequences

- **`src/features/transport/` now depends on a numeric bound from
  `src/lib/pipeline/`**, not just on its types. That arrow already existed and is
  allowed by
  [ADR 0008](0008-the-drummer-is-domain-the-transport-is-a-slice.md); what is new
  is that it carries a value the transport is required to respect.
- **Any future stage that can displace a note earlier must be covered by the
  horizon.** A stage adding a new negative displacement widens the bound the
  transport imports; it does not get to add one silently. `fills.ts` is the next
  one, and its converging offset is *late*, so it is safe — but that is a fact
  to check rather than assume.
- **More is in flight.** A tempo change and Stop trail by an extra
  `CLAMP_BEATS` — 15 ms at 96 BPM at the shipped clamp, and 41 ms at the ±0.065
  this ADR was written against. Well inside the beat granularity V5 settled on,
  and measured across 80 `setTempo` call points without exceeding it.
- **The horizon cannot protect beat 0, and the start lead does.** Beat 0's line
  *is* `startTime`, so it is inside the window on the first tick however wide the
  window is. What keeps its step-0 note in the future is `START_LEAD_SECONDS` in
  `useTransport.ts`, and no widening of the horizon substitutes for it. At the
  ±0.024 clamp a full pull-back at 60 BPM is 24 ms against a 100 ms lead, so it
  is comfortable and only goes negative below about 14 BPM — but at the ±0.065
  clamp this ADR was written against it was 65 ms, leaving 35 ms. The lead is
  the guard, the tempo floor is not what protects it, and a future stage that
  displaces further has to check it by hand.
  `useTransport.test.ts` → *leaves the first note of a performance in the future
  at the slowest tempo* asserts it, with the bound derived from `CLAMP_BEATS` so
  it tracks. `docs/music.md` Part 4 → *Scheduling* records it.

## Alternatives considered

- **Raise `LOOKAHEAD_SECONDS` to a bigger round number.** Hides the coupling
  instead of stating it, does not scale with tempo, and leaves the next stage to
  rediscover the problem.
- **Clamp offsets non-negative on the first step of each beat.** No transport
  change at all, and it biases the first note of every beat late — which
  `docs/music.md`'s *What must never change* forbids outright, since every
  per-voice bias is zero by decision.
- **Let the player reject a past time.** Turns a placement error into a dropped
  note, which is worse, and does it at the point where there is no longer
  anything useful to do about it.
