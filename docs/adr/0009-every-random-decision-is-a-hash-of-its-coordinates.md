# 0009. Every random decision is a hash of its coordinates, never a stream

- **Status:** ✅ Accepted
- **Date:** 2026-09-17

## Context

V6 added the first stage that needs a continuous random variable. The round
robin V5 built picks a file with `variantFor(seed, barIndex, step, lane)`, which
is a hash; `humanize` needs a Gaussian, and a Gaussian is where a generator
normally becomes a stream — `next()`, `next()`, one call per note, state carried
between them.

A stream cannot work here, and the reason is not style. **The scheduler computes
each bar four times.** `planBeat` in `src/features/transport/lib/scheduler.ts`
calls `runBar(stages, index, ctx)` for the whole bar and then keeps only the
notes whose step falls inside the beat it is committing:

```ts
const index = Math.floor(beat / BEATS_PER_BAR)
const bar = runBar(stages, index, { ... })
for (const note of bar.notes) {
  if (note.step < firstStep || note.step >= firstStep + STEPS_PER_BEAT) continue
```

So bar 3 is built on beat 12, again on beat 13, again on 14, again on 15 — and
again whenever a tempo change re-anchors. A stage drawing from a stream would
produce a different bar 3 on each of those calls, and the four beats the user
hears would come from four different performances of the same bar. The notes
would still be in the right places; the velocities and the offsets would not
agree with each other.

This is not a bug the scheduler should fix by caching. Recomputing is what makes
a tempo change cheap and what keeps the scheduler stateless, and V5 chose
beat-at-a-time commits deliberately so that Stop and the tempo knob land inside
a beat.

## Decision

**Every stochastic decision in the drummer is a pure function of the coordinates
that identify it** — the seed plus some subset of `(barIndex, step, voice,
lane)` — and never a draw from a stream.

`src/lib/random/hash.ts` is the one module that does it:

```ts
export function mix32(value: number): number
export function hashOf(seed: number, ...values: readonly number[]): number
export function unitFloat(hash: number): number
export function gaussian(hashA: number, hashB: number): number
```

`hashOf` folds `mix32` over its arguments. `unitFloat` maps the result into the
open unit interval. `gaussian` is one Box–Muller draw from two independent
hashes, which is how a continuous distribution is reached without holding state:
a stage that needs a normal variable hashes the same coordinates twice under
different salts rather than asking a generator for the next two numbers.

A stage that needs several independent draws from one set of coordinates
separates them with distinct non-zero salt constants. `humanize` uses four.

## Consequences

- **A bar is the same bar however many times it is computed.** The scheduler can
  recompute freely, which is what lets it stay stateless and commit a beat at a
  time.
- **`Math.random` is banned everywhere a hit is decided**, and `docs/music.md`
  Part 4 → *Determinism* already said so. This ADR is what makes it buildable
  rather than aspirational.
- **Every future stage inherits the rule.** `feel.ts`, `fills.ts` and
  `redistribute.ts` all make random choices, and each one draws from
  `hashOf` against its own coordinates. A stage that wants "the previous bar's
  value" cannot have it, and must derive what it needs from `barIndex` instead.
- **Salts are load-bearing and must be non-zero.** `mix32(0) === 0` and XOR with
  zero is a fixed point, so `hashOf(0, 0, 0, 0)` returns `0` — and `unitFloat(0)`
  is ~1.2e-10, whose log gives a 6.8-sigma Box–Muller radius. Seed 0, bar 0,
  step 0 is a reachable input. A non-zero salt placed immediately after the seed
  takes the fold off zero before the coordinates arrive.
- **It costs speed and nobody cares.** Four hashes per note is more arithmetic
  than four `next()` calls, at a few hundred notes a second.
- **Reproducing a performance is free.** The seed is drawn on Play, and the same
  seed with the same settings gives the same performance, hit for hit. Nothing
  has to be recorded for that to be true.

## Alternatives considered

- **A seeded PRNG stream, reseeded per bar.** Fixes the recompute problem for
  whole bars, but only if every stage draws in exactly the same order every
  time — so adding a stage, or a stage skipping a note, silently changes every
  draw after it. That makes the stage list order-sensitive in a way
  [ADR 0007](0007-the-drummer-is-a-pipeline-of-same-signature-stages.md)
  deliberately is not.
- **Caching the computed bar in the scheduler.** Makes the stream safe, and puts
  state back into the one object V5 worked to keep stateless. It also has to be
  invalidated on a tempo change, a Feel change and a mute, which is three
  chances to be wrong.
- **Letting each stage write its own hash.** What V5 did, with `mix32` private
  to `baseBeat.ts`. Two stages needing the same primitive is the point at which
  that stops being fine.
