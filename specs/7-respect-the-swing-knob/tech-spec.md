# V7. Respect the swing knob — tech spec

## Decided

* **The seam already exists and V7 fills it.** `stepBeats(step, swingPercent)`
  in `src/lib/time/grid.ts` takes the percentage and discards it, and
  `src/features/transport/lib/scheduler.ts` passes `STRAIGHT_PERCENT` in the two
  places it needs a swing value — into `BarContext` and into `noteTime`. No
  signature in `src/lib/` has to change for the model to land.
* **The knob reaches the scheduler the way the tempo knob does.**
  `useTransport.setSwing` already sets state and nothing else;
  `setTempo` already calls `schedulerRef.current?.setTempo`. `setSwing` gains
  the matching call.
* **`setSwing` does not re-anchor the performance.** `setTempo` moves
  `startTime`/`startBeat` to the next beat because it changes how long a beat
  is. Swing does not move a beat line — only the positions of steps 1 and 3
  inside a beat — so the anchor stays where it is and the new value is simply
  read by the next `planBeat`. That is what makes "takes effect at the next beat
  line" free.
* **Two concern folders:** `src/lib/time/` and `src/features/transport/`. The
  panel is untouched — `ranges.ts` already carries 50–66.7 and the knob already
  reads a percentage.

## Contracts

### The warp

```ts
// src/lib/time/swing.ts
export function swungStepBeats(step: number, swingPercent: number): number
```

The sixteen steps of a bar are eight **eighth-note pairs**. A pair is
`STEPS_PER_PAIR / STEPS_PER_BEAT` = 0.5 beats. `swingPercent` is the fraction of
its pair the first sixteenth occupies, as a percentage:

```
pair   = Math.floor(step / STEPS_PER_PAIR)
beats  = pair * PAIR_BEATS + (step % STEPS_PER_PAIR === 0
           ? 0
           : PAIR_BEATS * (swingPercent / 100))
```

So an even step lands on the pair line and never moves; an odd step — the "e"
and the "a" — is delayed. At 50% every step is exactly `step / 4`, and 0.5 and
0.25 are binary-exact, so the 50% case is `toBe`-identical to V6 rather than
close to it.

The percentage and the ratios in `docs/music.md` Part 1 are one quantity:
`percent = ratio / (1 + ratio) × 100`. 1.07:1 is 51.7%, 1.8:1 is 64.3%.

### `stepBeats` delegates

`src/lib/time/grid.ts` keeps `stepBeats(step, swingPercent)` and its body becomes
the call to `swungStepBeats`. `noteTime` is unchanged. `grid.ts` owns
step-to-time conversion, `swing.ts` owns the swing model, and the two rows in
`docs/music.md`'s *Where to change what* stay honest.

### The scheduler carries a live swing

```ts
// src/features/transport/lib/scheduler.ts
export type Scheduler = {
  start: (startTime: number, tempo: number, swingPercent: number, seed: number) => void
  stop: () => void
  tick: () => void
  setTempo: (tempo: number) => void
  setSwing: (swingPercent: number) => void
}
```

`start` takes the swing for the same reason it takes the tempo: the scheduler
must not hold a second resting value that can disagree with `useTransport`'s.
The stored percentage replaces `STRAIGHT_PERCENT` at both use sites.

## Epics

One epic. Two tracks own disjoint folders and run together; a third joins them
and writes the record.

### Track A — The swing model

* **Role:** `implementer`
* **Owns:** `src/lib/time/swing.ts`, `src/lib/time/swing.test.ts`,
  `src/lib/time/grid.ts`, `src/lib/time/grid.test.ts`
* **Needs to start:** nothing — the contract above is the whole input

1. **red** — `swing.test.ts`. Even steps never move at any percentage in the
   range. Odd steps are delayed, monotonically in the percentage. At 50% every
   step is exactly `step / 4` — `toBe`, not `toBeCloseTo`. At 66.7% step 1 is
   within a tenth of a millisecond of a true triplet at 96 BPM. The four ratios
   in `docs/music.md` Part 1 round-trip through `ratio / (1 + ratio) × 100`.
2. **green** — `swing.ts`.
3. **red** — `grid.test.ts`. `stepBeats` at a swung percentage returns what
   `swungStepBeats` returns, and `noteTime` carries the warp through to a time.
   The existing straight cases stay untouched and must stay green — they are the
   "identical to V6" bullet.
4. **green** — `stepBeats` delegates.

### Track B — The knob reaches the scheduler

* **Role:** `implementer`
* **Owns:** `src/features/transport/lib/scheduler.ts`,
  `src/features/transport/lib/scheduler.test.ts`,
  `src/features/transport/hooks/useTransport.ts`,
  `src/features/transport/hooks/useTransport.test.ts`
* **Needs to start:** the `Scheduler` contract above. **Not Track A** — every
  assertion here reads the percentage the scheduler hands out, through the
  `stages` injection point `SchedulerDeps` already has, so it passes while
  `stepBeats` is still discarding the value.

1. **red** — `scheduler.test.ts`. A spy stage captures `ctx.swingPercent`: it is
   what `start` was given, `setSwing` changes it, and the change is visible on
   the next beat planned and not before. `setSwing` does not move a beat line —
   the times of the even steps are unchanged across a `setSwing` call.
2. **green** — `scheduler.ts` stores the percentage and uses it at both sites.
3. **red** — `useTransport.test.ts`. `setSwing` forwards to the scheduler and
   still sets state; `start` is called with the current swing.
4. **green** — `useTransport.ts`.

### Track C — Integration and the record

* **Role:** `implementer`
* **Owns:** `docs/music.md`, `specs/features.md`, and the one end-to-end case
  appended to `src/features/transport/lib/scheduler.test.ts`
* **Needs to start:** A and B green — it owns `scheduler.test.ts` only after B
  has finished with it

1. **red** — the end-to-end case: a scheduler started at 66.7% plays step 1
   later than one started at 50%, and step 0, 4, 8 and 12 at the same time as
   one started at 50%. No assertion names a groove's content.
2. **green** — nothing to write if A and B are right. If it fails, the wiring
   is wrong and not the model.
3. `docs/music.md` — `## Swing` loses "None of this section is built yet" and
   says what landed; *Where to change what* moves the **Swing model** row up to
   the first table, and the sentence "Everything in the second table is a
   pipeline stage" is amended, because swing.ts never was one.
4. `specs/features.md` — the V7 row.

**An ADR comes out of this.** V5's spec and
[ADR 0007](../../docs/adr/0007-the-drummer-is-a-pipeline-of-same-signature-stages.md)
both said swing would be a pipeline stage, and it is not: it is a property of
the grid, below the pipeline, which is what makes "every voice on a step moves
together" structural instead of a rule a stage has to remember. That reverses a
stated expectation and constrains where the next time-warping feature goes, so
`/implement` §8 writes it and amends ADR 0007.

## Waves

* **Wave 1 (parallel):** Track A, Track B
* **Wave 2:** Track C — needs A's warp and B's wiring

## Checks

* `npm test && npm run lint && npm run build`
* Then the ear, at 96 BPM on Straight Sixteen — the only bullet the three
  commands cannot settle.

## Risks

* **The lookahead is unaffected, and that is worth asserting rather than
  assuming.** Swing only ever delays a note, so the margin
  [ADR 0010](../../docs/adr/0010-the-lookahead-covers-what-the-pipeline-can-do-to-a-note.md)
  protects — against `start(t)` with a `t` in the past — does not move. The
  earliest a note can be is still a full negative humanize clamp, at 66.7% as at
  50%. Track B keeps the existing margin tests green at the top of the swing
  range.
* **The top of the knob is not exactly a triplet.** 66.7% against a true 200/3
  is 0.00017 beats, 0.1 ms at 96 BPM. Inaudible, and `ranges.ts` and
  `docs/music.md` both already say 66.7. Left alone, named so nobody rediscovers
  it as a bug.
* **The app starts swinging the moment V7 lands.** Straight Sixteen declares 50
  and the knob rests at 54, and the knob wins. Anyone comparing V7 to V6 by ear
  has to put the knob at 50 first.
* **`start` grows a fourth argument.** `scheduler.test.ts` calls it in many
  places and `tsc` catches every one, but it is the largest mechanical edit in
  the change.
