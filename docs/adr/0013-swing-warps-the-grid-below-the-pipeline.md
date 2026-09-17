# 0013. Swing warps the grid below the pipeline

- **Status:** ✅ Accepted
- **Date:** 2026-09-17

## Context

V7 had to make the SWING knob audible. Two records already said where the code
would go, and they disagreed.

[ADR 0007](0007-the-drummer-is-a-pipeline-of-same-signature-stages.md) says the
stage list is open and names swing as a member of it — "swing belongs in it too"
— and lists it under *A later stage costs a file*. `specs/5-the-first-beat/spec.md`
says the same thing in Fred's words: swing is a later stage of the pipeline, not
part of `globalTime`.

[music.md](../music.md) Part 4 says something else. *Swing warps the grid, it
does not offset notes*, and the never-change list carries **swing warps the grid
rather than offsetting individual voices**. It also points at the seam V5 left:
`stepBeats(step, swingPercent)` in `src/lib/time/grid.ts` already took the
percentage and discarded it.

Both shapes produce the same audio. The disagreement is about what the code is
able to express.

## Decision

**Swing is a property of the grid, not a stage of the pipeline.** The warp lives
in `src/lib/time/swing.ts` as `swungStepBeats(step, swingPercent)`, and
`stepBeats` delegates to it. `PIPELINE` is unchanged.

The scheduler holds a live percentage and passes it to `noteTime`; a change
lands at the next beat line because the scheduler commits one beat at a time.

## Consequences

**"Every voice on a step moves together" stops being a rule and becomes
arithmetic.** A stage writing `offsetBeats` per note could break it in one line,
and nothing but a reviewer would notice. Below the pipeline there is no per-note
seam to get wrong: a step has one time, and every voice on it is placed there.

**`offsetBeats` keeps one meaning.** It is humanize's, and only humanize's, so a
test can still attribute a displacement to the stage that made it. Had swing
also written it, V6's measured σ and its clamp ratio would have needed a
subtraction before they meant anything.

**ADR 0007 loses a member and keeps its shape.** `PIPELINE` did not change in
V7, which is the first time that document's openness was tested by something
that turned out *not* to be a stage. Fills, Feel and redistribution are
unaffected: each reads a bar and returns a bar, and swing never did — it answers
"when is step 3" rather than "what is in this bar".

**The next time-warping feature goes here, not in a stage.** Anything that asks
where a step sits — a push or pull, a shuffle, a per-section feel — belongs in
`src/lib/time/`. Anything that asks what is played belongs in a stage. That is
the line this record draws, and it is the reason it exists.

**It costs a cycle between two modules.** `grid.ts` imports `swungStepBeats` and
`swing.ts` imports `STEPS_PER_BEAT`, because the grid owns its own geometry and
the warp is stated in beats. ES modules resolve it, but only if `swing.ts` reads
`STEPS_PER_BEAT` inside the function body. Hoisting it to a module-scope
`const PAIR_BEATS` breaks every swung time.

**And it breaks quietly, which is the part worth writing down.** Under the
bundler's transform an import is a property read on a namespace object that the
cycle has not finished populating, so `STEPS_PER_BEAT` reads as `undefined`,
`PAIR_BEATS` becomes `NaN`, and every warped time is `NaN`. Nothing throws. The
symptom is a suite full of `expected NaN to be 0.25`, not one loud module-load
error — so whoever hits this will go looking for a maths bug in `swungStepBeats`
before suspecting the import order.

No lint rule guards it. `grid.test.ts` carries a named test — *resolves the pair
size when grid is the module entered first* — and the hoist kills 15 tests, 8 in
`grid.test.ts` and 7 in `swing.test.ts`, which both import `./grid` first. The
trap is held by the suite rather than by a comment. One test cannot see it:
`stepBeats > is the swung grid at a swung percentage` compares the two modules
to each other, and `toBe` on `NaN` against `NaN` passes under `Object.is`.

## Alternatives considered

- **A pipeline stage `src/lib/pipeline/stages/swing.ts` writing `offsetBeats`** —
  it would have kept ADR 0007's "every later feature is a stage" story whole and
  put swing beside where Feel and fills will go. It lost on the two consequences
  above: `offsetBeats` would carry two quantities under one name, and the
  never-change rule would become a convention each stage has to honour instead of
  one the shape enforces. Choosing it would also have left `stepBeats`
  permanently discarding an argument it was given in V5 for this purpose.
- **Moving `STEPS_PER_BEAT` into `swing.ts` to break the cycle** — it removes the
  TDZ trap, at the price of putting the grid's own geometry in the module that
  warps it. The constant is named in `docs/music.md`'s *Where to change what*
  under `grid.ts`, and a reader looking for how many steps are in a beat will
  look there. Rejected, and the trap is held by a test instead.
