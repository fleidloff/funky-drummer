# 0007. The drummer is a pipeline of same-signature stages

- **Status:** ✅ Accepted
- **Date:** 2026-09-17

## Context

[Project.md](../concept/Project.md) says the drummer "changes the audio stream
with a pipeline of different audio modules (variation, fill, ghosts, velocity,
etc)". [music.md](../music.md) Part 4 then specifies eight or so of those
modules — velocity curves per bar and per four bars, humanize, Feel filtering,
fills, redistribution, swing — each of which reads the notes of a bar and
returns a different set of notes.

V5 built the first two. The question it had to answer was not what those two do
but what shape the other six arrive in, because that shape is decided once and
paid for by every stage after it.

**The stage list is not known.** The order given when V5 was specced —
`globalTime → baseBeat → variations → velocityPerBar → velocityCurveGlobal →
fills → motifAndCallResponse → humanize` — was offered as an example, and
corrected mid-design: swing belongs in it too, and the membership is still open.
A design that has to be edited when the list changes is a design that will be
edited eight times.

**Amended by V7: swing does not belong in it.** It warps the grid below the
pipeline and `PIPELINE` did not change when it landed — see
[ADR 0013](0013-swing-warps-the-grid-below-the-pipeline.md). The membership being
open is what let that be discovered rather than designed around, so the argument
of this record stands; only the example was wrong.

## Decision

**Every stage has the same signature, and the pipeline is an ordered array of
them.**

```ts
type Stage = (bar: Bar, ctx: BarContext) => Bar

const PIPELINE: readonly Stage[] = [globalTime, baseBeat]
```

`Bar` accumulates as it travels: `globalTime` fills its time frame, `baseBeat`
fills its notes, later stages add, remove, revoice and displace them.
`BarContext` is read-only and carries what every stage might need — the groove,
the tempo, the swing, the Feel, the seed, and the performance's time origin as an
absolute beat (`startTime`, `startBeat`).

Adding a stage is adding a file and one entry in the array. Reordering is moving
a line. Nothing outside the array knows how many stages there are or what they
are called.

The pipeline runs **once per bar**, and a stage is a pure function, so the whole
of it lives in `src/lib/pipeline/` under the purity bar that
[coding-guidelines.md](coding-guidelines.md) sets for `src/lib/`.

## Consequences

**A later stage costs a file.** Humanize, fills and Feel each become one module
and one array entry, and none of them requires touching `run.ts`, `globalTime`
or `baseBeat`. Velocity and humanize proved it in V6, which appended two stages
and edited none. Swing was on this list and came off it in V7
([ADR 0013](0013-swing-warps-the-grid-below-the-pipeline.md)).

**The seam is tested rather than asserted.** `pipeline.test.ts` splices a
recording probe into the real array at every insertion point and checks it
receives its predecessor's `Bar` and that its edits reach the output. No
assertion in that file names the array's length, an index, or a stage — the
parametrisation is derived from the array, so appending a stage grows the test
count instead of breaking the file. Appending a real third stage during V5 took
it from 37 tests to 42 with no edit.

**The pipeline still runs once per bar, but the scheduler releases a beat at a
time.** Velocity curves, fills and the per-bar arc are bar-shaped, so the unit of
computation has to be a bar. The unit of *commitment* does not, and V5 shipped
with them conflated: a whole bar went to the audio clock at once, so Stop and the
tempo knob took up to a bar to land. They were separated the same day. `runBar`
is pure, so recomputing a bar for each of its beats returns the same notes, and
`BarContext` anchors on an absolute **beat** — `startBeat`, not a bar index — so
a tempo change can re-anchor in the middle of a bar. A stage sees no difference.

**`Bar` and `BarContext` are frozen early, for stages nobody has designed.** This
is the cost. `BarContext` already carries `feel` and `seed`, which nothing in V5
reads, and it will be too narrow for something. Widening a read-only context is
additive and cheap; changing `Stage` is not, and that is the trade taken
deliberately.

**A stage that needs to see more than one bar has no home here.** Fills land on
phrase boundaries and auto-feel runs a 16-bar arc, so both need to know where in
a phrase the bar sits. `BarContext` carries the absolute bar index, which is
enough to compute that, but a stage that wants to *rewrite a previous bar*
cannot — it has already been scheduled.

**Two things stay outside the pipeline**, and both are named here so the
boundary is not rediscovered. Converting a note's position to an audio-clock
time is arithmetic in `src/lib/time/grid.ts`, which the pipeline calls and does
not contain. Deciding *when* to run the pipeline is the scheduler's, in
`src/features/transport/`, because it needs a clock.

## Alternatives considered

- **A typed chain, each stage with its own input and output types** — the
  compiler checks the wiring, and every stage's type encodes its position. That
  is the property that loses it: inserting swing between two stages becomes a
  type change in both, and the order is the thing most likely to move.

- **Hand-composed function calls, no array** — `humanize(fills(velocity(base)))`.
  Same behaviour today, and "add a stage" becomes "edit the composition", which
  is exactly what the change was asked not to require.

- **No pipeline until there are three stages** — the honest YAGNI position, and
  the generalisation would then have been derived from three real stages instead
  of two. Rejected because it lands as a rewrite of the audible path at the point
  where the app has become worth listening to.

- **A per-note stream rather than a bar** — stages transform hits as they are
  scheduled. Velocity curves and fills are bar-shaped and phrase-shaped, so
  every one of them would have to buffer a bar to do its job.
