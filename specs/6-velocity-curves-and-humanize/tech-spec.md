# V6. Velocity curves and humanize — tech spec

## Decided

* **How does `velocity` know which notes are exempt?** — **Widen `Note` with
  `readonly level: Level`.** `feel.ts`, `fills.ts` and `redistribute.ts` will
  all need the level too — thinning by level is what Feel *is* — so the
  contract widens once here rather than three more times later. Rejected:
  reading the exemption off `velocity === 1`, because it is a float compare on
  a number the stage is about to scale.
* **Consequence for `## Done when`.** Its first bullet's "no other stage moved"
  is now "the `Note` contract widened once, by design; `Stage` and `run.ts` did
  not move." `spec.md` is amended to match.
* **One epic or two?** — **One epic, parallel tracks.** The two stages own
  disjoint files but share one contract wave and one by-ear verdict. Two epics
  would buy a second contract-and-merge pass and a second `/implement` run over
  an overlapping file list.

## Contracts

Frozen in Wave 1. Every other track builds against these and none of them
changes one.

### The note carries its level

`src/lib/pipeline/types.ts`:

```ts
import type { Lane, Level } from '@/lib/groove/types'

export type Note = {
  readonly step: number
  readonly lane: Lane
  readonly level: Level
  readonly voice: Voice
  readonly articulation: Articulation
  readonly velocity: number
  readonly offsetBeats: number
}
```

`baseBeat`'s `noteOf` sets `level: source.level`. Nothing else about `baseBeat`
changes.

### The shared hash

`src/lib/random/hash.ts` — new concern folder, pure, no imports outside itself.
`mix32` is lifted out of `baseBeat.ts` unchanged, so `variantFor` keeps its
signature, its export from `@/lib/pipeline` and its current outputs.

```ts
export function mix32(value: number): number
export function hashOf(seed: number, ...values: readonly number[]): number
export function unitFloat(hash: number): number
export function gaussian(hashA: number, hashB: number): number
```

* `hashOf` folds `mix32` over its arguments and returns a uint32.
* `unitFloat` maps a uint32 to `[0, 1)`, and never returns exactly 0 — Box–Muller
  takes its log.
* `gaussian` is one Box–Muller draw from two independent hashes: mean 0, σ 1.

### `src/lib/pipeline/stages/velocity.ts`

```ts
export const BAR_CURVE_MIN = 0.92
export const BAR_CURVE_MAX = 1.05
export const PHRASE_CURVE_MIN = 0.9
export const PHRASE_CURVE_MAX = 1.08
export const PHRASE_BARS = 4

export function barCurve(step: number): number
export function phraseCurve(barIndex: number): number
export function isExempt(note: Note): boolean

export const velocity: Stage
```

`isExempt` is `note.level === 'anchor'`. An exempt note passes through
untouched; every other note's velocity is multiplied by both curves.

**This was corrected mid-build and it is not what this file first froze.** The
frozen predicate was `(lane === 'snare' && level === 'anchor') || (lane ===
'kick' && level === 'anchor' && step === 0)`, and Track B found the library
breaks it: Four On The Floor Funk anchors the kick on all four quarters, so
steps 4, 8 and 12 carry level `anchor` away from beat 1. Curving them would make
the four kicks of a four-on-the-floor uneven, and `1.00 × 1.05 × 1.08 = 1.134`
would push a velocity past 1.0, which `docs/music.md`'s *What must never change*
forbids. The narrow predicate was unbuildable rather than merely worse, so it
was replaced rather than waived. `docs/music.md` Part 4 carries the argument.

### `src/lib/pipeline/stages/humanize.ts`

```ts
export const STEP_SIGMA_BEATS = 0.024
export const VOICE_SIGMA_BEATS = 0.01
export const CLAMP_BEATS = 0.065

export function offsetFor(
  seed: number,
  barIndex: number,
  step: number,
  voice: Voice,
): number

export const humanize: Stage
```

`offsetFor` is `clamp(stepDraw + voiceDraw, ±CLAMP_BEATS)`, where the step draw
hashes `(seed, barIndex, step)` and the voice draw additionally hashes the
voice's index in `VOICES`. It never reads a clock and never accumulates.
`humanize` writes `offsetBeats` and touches nothing else on the note.

### The pipeline

`src/lib/pipeline/index.ts`:

```ts
export const PIPELINE: readonly Stage[] = [globalTime, baseBeat, velocity, humanize]
```

Wave 1 lands both stage modules as identity stubs so this line compiles and the
two build tracks never touch this file.

### The lookahead covers the clamp

`src/features/transport/lib/scheduler.ts` — the horizon grows by one clamp
width, in seconds at the current tempo, so a note pulled backwards keeps the
margin it has today:

```ts
const horizon =
  deps.clock() + LOOKAHEAD_SECONDS + CLAMP_BEATS * secondsPerBeat(tempo)
```

## Epics

One epic — the change itself.

### Track A — The contracts

* **Role:** `architect`
* **Owns:** `src/lib/pipeline/types.ts`, `src/lib/random/hash.ts`,
  `src/lib/random/hash.test.ts`, `src/lib/pipeline/stages/baseBeat.ts`,
  `src/lib/pipeline/stages/baseBeat.test.ts`, `src/lib/pipeline/index.ts`, and
  the two stage files as identity stubs
* **Needs to start:** nothing

1. **red** — `hash.test.ts`: `unitFloat` stays in `[0, 1)` and never returns 0
   over a large sweep; `gaussian` over 100 000 draws has mean ≈ 0 and σ ≈ 1;
   `hashOf` is order-sensitive and pure.
2. **green** — write `src/lib/random/hash.ts`, with `mix32` lifted from
   `baseBeat.ts`.
3. **red** — extend `baseBeat.test.ts`: every emitted note carries the grid
   note's `level`, and `variantFor`'s outputs are unchanged by the lift.
4. **green** — widen `Note`, set `level` in `noteOf`, re-point `variantFor` at
   `src/lib/random/hash.ts`.
5. **green** — land `velocity.ts` and `humanize.ts` as identity stubs exporting
   the constants above, and add both to `PIPELINE`. `pipeline.test.ts` is
   generic over `PIPELINE` and should need no edit; if it does, that is a
   finding worth reporting rather than patching quietly.

### Track B — The shape of the arcs

* **Role:** `musician`
* **Owns:** `docs/music.md` (Part 4, *Velocity curves*)
* **Needs to start:** nothing

`docs/music.md` binds the two ranges and describes the per-bar curve only as "a
shallow arc that lifts the middle of the bar and settles into the One". Decide
and write down the actual functions:

1. The per-bar curve over the 16 steps — where it peaks, how it returns to the
   One, and whether it is one arc or a per-beat shape.
2. The per-four-bar curve over bar indices 0–3, "building to bar 4 and dropping
   back for bar 1".
3. Whether the four-bar arc is indexed from the performance start or from a
   phrase boundary the app does not yet have.

Writes no code. Its product is the amended section, which Track C implements
literally.

### Track C — The velocity stage

* **Role:** `implementer`
* **Owns:** `src/lib/pipeline/stages/velocity.ts`,
  `src/lib/pipeline/stages/velocity.test.ts`
* **Needs to start:** Track A's `Note.level` and stub; Track B's curve functions

1. **red** — an anchor snare and a beat-1 anchor kick come out at exactly 1.00
   in every bar of a phrase and at every step.
2. **red** — a non-exempt note's velocity equals its input times
   `barCurve(step) * phraseCurve(barIndex)`; both curves stay inside their
   declared ranges across all 16 steps and all 4 bars, and both touch their min
   and max.
3. **red** — the stage is pure: same bar in, same bar out; the input bar is not
   mutated; no note's `step`, `lane`, `voice`, `articulation` or `offsetBeats`
   moves.
4. **red** — the highest velocity the stage can emit for a non-exempt note is
   below 1.0, so nothing clips against the voice gain.
5. **green** — write the stage.

### Track D — The humanize stage

* **Role:** `implementer`
* **Owns:** `src/lib/pipeline/stages/humanize.ts`,
  `src/lib/pipeline/stages/humanize.test.ts`
* **Needs to start:** Track A's `src/lib/random/hash.ts` and stub

1. **red** — over a large sweep of bars and steps, `offsetFor` has combined
   σ ≈ 0.026 beats and mean ≈ 0, and per voice the mean is ≈ 0 too — the
   zero-bias rule in `docs/music.md`'s never-change list.
2. **red** — no draw exceeds `±CLAMP_BEATS`, and the clamp is reached at least
   once in a long sweep, so it is live rather than decorative.
3. **red** — two voices on the same `(barIndex, step)` differ by the per-voice
   component only: their difference has σ ≈ √2 × 0.010 ≈ 0.014 beats, not
   0.026 × √2. This is the "one drummer has one body" assertion.
4. **red** — purity and determinism: `offsetFor` is a function of its four
   arguments alone, the same seed replays a bar offset for offset, a different
   seed or bar index does not, and no offset is ever accumulated from the
   previous one.
5. **red** — the stage writes `offsetBeats` and changes nothing else on a note.
6. **green** — write the stage.

### Track E — The lookahead covers the clamp

* **Role:** `implementer`
* **Owns:** `src/features/transport/lib/scheduler.ts`,
  `src/features/transport/lib/scheduler.test.ts`
* **Needs to start:** Track A's `CLAMP_BEATS` export

1. **red** — with a fake clock stepping at `TICK_MS`, the earliest note the
   model can produce — step 0 at the full negative clamp — is handed to `play`
   with a time strictly greater than the clock at the moment of the call, at 60,
   96 and 180 BPM.
2. **red** — the existing beat-at-a-time behaviour is unchanged: no beat is
   planned twice, none is skipped, and a tempo change still lands within a beat.
3. **green** — widen the horizon by `CLAMP_BEATS * secondsPerBeat(tempo)`.

### Track F — Integration and the record

* **Role:** `implementer`
* **Owns:** `docs/music.md` (*Where to change what*), `specs/features.md`
* **Needs to start:** C, D and E green

1. Move the *Velocity curves* and *Humanize model and bounds* rows from the
   second table to the first, naming the files that now exist.
2. Add `src/lib/random/` to the first table as the home of the seeded hash.
3. Run `npm test && npm run lint && npm run build`.
4. The by-ear bullet is Fred's, not a track's. Play Straight Sixteen at 96 BPM
   and ask.

## Waves

* **Wave 1 (parallel):** Track A, Track B
* **Wave 2 (parallel):** Track C — needs A and B · Track D — needs A ·
  Track E — needs A
* **Wave 3:** Track F — needs C, D, E

## Checks

* `npm test`
* `npm run lint`
* `npm run build`

## Risks

* **The stages are inaudible if they are wrong in the same direction.** A curve
  that never leaves 1.00 and a humanize that always draws 0 both pass every
  "stays inside the range" test. Tracks C and D each assert that their output
  actually *varies* — both curve extremes are reached, and the clamp is hit.
* **`unitFloat` returning exactly 0** puts `Math.log(0)` into Box–Muller and
  yields `Infinity`, which the clamp would silently turn into ±0.065 on every
  note. Track A pins it.
* **Lifting `mix32` changes the round robin.** If `variantFor`'s outputs move,
  every groove picks different sample files. Track A pins the current outputs
  before the lift.
* **A wider horizon puts more in flight.** A tempo change and Stop now trail by
  an extra 0.065 beats — 41 ms at 96 BPM. Well inside the beat granularity V5
  settled on, but it is the number that moves.
* **The four-bar curve has no phrase boundary to anchor to.** Fills and
  auto-feel will both want one and neither exists. Track B decides whether bar
  index modulo 4 is the answer or a placeholder, and says which.
* **`docs/music.md` is written by Track B and Track F.** Different waves and
  different sections, so no conflict — but the same file, so they never run
  together.
