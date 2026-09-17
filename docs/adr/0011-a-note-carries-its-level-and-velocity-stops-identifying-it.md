# 0011. A note carries its authored level, and velocity stops identifying it

- **Status:** ✅ Accepted
- **Date:** 2026-09-17

## Context

`baseBeat` read `GridNote.level` — one of `ghost`, `normal`, `accent`,
`anchor` — mapped it through a table to a number, and threw the level away. For
two stages that was fine, because velocity and level were the same fact in two
notations: 1.00 *meant* anchor.

V6's `velocity` stage ends that. After it runs, a note's velocity is the level
value multiplied by two curves, and an accent in the middle of bar 4 can carry
very nearly the same number as an anchor elsewhere. **Velocity stops being an
identifier and becomes a computed quantity.**

The tech spec for V6 did not notice, and froze an exemption predicate that read
the level off the lane and the step:

```ts
(lane === 'snare' && level === 'anchor') || (lane === 'kick' && level === 'anchor' && step === 0)
```

The groove library broke it within one file. Four On The Floor Funk is
`kick: '# . . . # . . . # . . . # . . .'` — four anchor kicks, three of them away
from beat 1. Curving them would make the four kicks of a four-on-the-floor
uneven, which is the one thing that figure cannot be, and `1.00 × 1.05 × 1.08 =
1.134` would push a velocity past 1.0, which `docs/music.md`'s *What must never
change* forbids.

The predicate was reconstructing from position something the grid had already
said, and got it wrong because position is not where that fact lives.

## Decision

**`Note` carries `readonly level: Level` for the whole length of the pipeline**,
and a stage that needs to know what the author wrote reads `level` — never
`velocity`, and never the lane and step.

`isExempt` in `src/lib/pipeline/stages/velocity.ts` is therefore the whole rule:

```ts
export function isExempt(note: Note): boolean {
  return note.level === 'anchor'
}
```

`#` means the author fixed that note. Scaling it is moving it.

## Consequences

- **Every later stage gets the same fact for free**, and all three unbuilt ones
  need it. Feel *is* thinning by level — `docs/music.md`'s Feel table is written
  in levels, from "anchors only" at 0.0 to added ghost notes at 0.75. Fills must
  not remove an anchor. Redistribution drops ghost notes rather than moving them.
  Each would otherwise have reconstructed the level, and each would have got it
  wrong somewhere in the library.
- **The reconstruction trap is now closed by the type rather than by care.**
  There is no correct way to recover `anchor` from a velocity of 0.9639.
- **`Note` is wider, and widening it is not free.** Three hand-built `Note`
  literals in test files stopped compiling the moment the field landed, in
  `pipeline.test.ts` and `baseBeat.test.ts`. `npm test` did not catch them —
  Vitest does not typecheck — and they surfaced only under `tsc`, which is
  `docs/testing.md`'s warning about knowing which command holds a given guard,
  arriving on schedule.
- **This is not a hole in
  [ADR 0007](0007-the-drummer-is-a-pipeline-of-same-signature-stages.md).** That
  ADR claims appending a stage needs no edit to the pipeline's tests, and it
  held: `pipeline.test.ts` went from 42 tests to 48 across two new stages without
  a line changing. The edit came from widening the note, which is a different
  axis, and the two should not be confused when judging whether the seam works.
- **The grid's vocabulary is now the pipeline's vocabulary.** Adding a level to
  `Level` is no longer a change to `baseBeat` alone; every stage that switches on
  it has to answer for the new case.

## Alternatives considered

- **Read the exemption off `velocity === 1`.** Exact today, because `baseBeat`
  writes the constant — and a float comparison against a number the very next
  line multiplies. It also answers only this one question, where the level
  answers the next three.
- **A narrow `anchored: boolean` written by `baseBeat`.** Same edit to the same
  files, carries less, and would have had to be joined by `ghosted` and
  `accented` as the remaining stages landed.
- **Keep the positional predicate and clamp the result to 1.0.** Keeps the
  contract and makes the four kicks of a four-on-the-floor come out at four
  different velocities, three of them clipped to the same ceiling. It answers the
  arithmetic objection and not the musical one.
