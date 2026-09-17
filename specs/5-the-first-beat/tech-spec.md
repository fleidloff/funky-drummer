# V5. The first beat — tech spec

## Contracts

Frozen. Every track builds against these.

```ts
// src/lib/groove/types.ts
export type Lane =
  | 'kick' | 'snare' | 'hihat' | 'ride'
  | 'cowbell' | 'shaker' | 'tom1' | 'tom2' | 'crash'

export type Level = 'ghost' | 'normal' | 'accent' | 'anchor'

export type GridNote = {
  readonly step: number          // 0–15
  readonly lane: Lane
  readonly level: Level
  readonly open?: true           // hihat `O`
  readonly bell?: true           // ride `B`
}

export type Groove = {
  readonly id: string
  readonly name: string
  readonly after?: string
  readonly tempo: number
  readonly swing: number
  readonly secondaryOne?: number
  readonly bars: readonly (readonly GridNote[])[]   // 1 or 2
}
```

```ts
// src/lib/pipeline/types.ts
export type Note = {
  readonly step: number          // 0–15, positional
  readonly lane: Lane
  readonly voice: Voice          // src/lib/kit
  readonly articulation: Articulation
  readonly velocity: number      // 0–1
  readonly offsetBeats: number   // swing + humanize land here; 0 in V5
}

export type BarTime = {
  readonly startTime: number     // audio-clock seconds, bar line
  readonly secondsPerBeat: number
}

export type Bar = {
  readonly index: number         // absolute, from Play
  readonly time: BarTime | null  // globalTime fills it
  readonly notes: readonly Note[]// baseBeat fills it
}

export type BarContext = {
  readonly groove: Groove
  readonly tempo: number
  readonly swing: number
  readonly feel: number
  readonly seed: number
  readonly startTime: number     // audio-clock seconds at Play
  readonly startIndex: number    // bar index the current tempo took effect
}

export type Stage = (bar: Bar, ctx: BarContext) => Bar
```

The two rules that make it extensible:

* **Every stage has the same signature**, so the pipeline is an ordered array
  and adding one is a file plus a line.
* **`Bar` accumulates and `BarContext` is read-only.** A stage returns a new
  `Bar`; nothing reaches back.

## The file map

`docs/coding-guidelines.md` requires `src/lib/` to be pure — no state, no clock,
no DOM — so the split falls out of that rule rather than from taste.

| Where | What | Concern |
| :-- | :-- | :-- |
| `src/lib/groove/` | `types.ts`, `parse.ts` — ADR 0001's grid parser and validator | pure domain |
| `src/lib/grooves/` | the ten grids of `docs/music.md` Part 2, as data | pure domain |
| `src/lib/pipeline/` | `types.ts`, `run.ts`, `stages/globalTime.ts`, `stages/baseBeat.ts` | pure domain |
| `src/lib/time/` | `grid.ts` — step and offset to seconds | pure domain |
| `src/features/transport/` | `AudioContext`, the sample cache, the 25 ms loop, the app's play state | impure |
| `src/features/panel/` | UI only, fully controlled | impure |
| `src/app/page.tsx` | composes the two slices | route |

Three decisions this records, each of which amends `docs/music.md`'s
*Where to change what* table:

* **`src/features/groove-library/` becomes `src/lib/grooves/`.** A groove is
  domain knowledge and pure data; it fails none of `src/lib/`'s four bars, and a
  feature slice cannot be imported by another feature.
* **`src/features/transport/` keeps its planned home**, and it is the impure
  half only. The step→time arithmetic it calls is pure and lives in
  `src/lib/time/grid.ts`.
* **The pipeline is a new row** the table does not have.

That is three concern areas touched — `src/lib/`, one new feature slice, and the
route — plus a prop-surface change to `src/features/panel/`.

## Epics

### Epic 1 — The engine

Pure, runs in Node, produces timed notes. Nothing here touches an
`AudioContext`.

#### Track A — The grid parser

* **Role:** `test-writer`, then `implementer`
* **Owns:** `src/lib/groove/types.ts`, `src/lib/groove/parse.ts`,
  `src/lib/groove/parse.test.ts`
* **Needs to start:** the `Groove` contract above

1. **red** — `parse.test.ts`: a three-lane grid parses to the right notes;
   whitespace is insignificant; a lane of fifteen or seventeen steps throws; an
   unknown character throws and names the character, the lane and the step; a
   lowercase `b` throws; `O` outside `hihat` throws; `B` outside `ride` throws;
   an omitted lane is silent; three bars throw. Fixtures are written in the
   test file, never taken from the library.
2. **green** — `parse.ts`. The parser is the validator, per ADR 0001: one place
   checks lane length, symbol validity and per-lane restrictions.

#### Track B — The groove library

* **Role:** `implementer`
* **Owns:** `src/lib/grooves/*.ts`, `src/lib/grooves/index.ts`,
  `src/lib/grooves/grooves.test.ts`
* **Needs to start:** Track A green

1. **red** — `grooves.test.ts` asserts **invariants only**: every entry parses,
   every `id` is unique and kebab-case, `bars` is one or two, `tempo` is inside
   the range in `docs/music.md`, `swing` is inside its range. No assertion names
   a step, a lane or a groove.
2. **green** — the ten grids of `docs/music.md` Part 2, pasted as grid strings
   and parsed at module load. `index.ts` exports `GROOVES` and
   `STRAIGHT_SIXTEEN`.

#### Track C — Step to seconds

* **Role:** `implementer`
* **Owns:** `src/lib/time/grid.ts`, `src/lib/time/grid.test.ts`
* **Needs to start:** the `BarTime` contract

1. **red** — a step's time is `startTime + (step/4 + offsetBeats) * secondsPerBeat`,
   computed from the absolute index and never accumulated; a bar's sixteen steps
   at 96 BPM land where arithmetic says; adding a thousand bars one at a time
   equals computing the thousandth directly, exactly.
2. **green** — `grid.ts`. It takes a swing ratio it does not yet use, so the
   later swing stage fills a value rather than changing a signature.

#### Track D — What a grid symbol plays

* **Role:** `musician`, then `implementer`
* **Owns:** `src/lib/pipeline/stages/baseBeat.ts`,
  `src/lib/pipeline/stages/baseBeat.test.ts`, and an amendment to
  `docs/music.md` Part 3
* **Needs to start:** Track A's `GridNote` type (in the contracts above)

`docs/music.md` maps a level to a velocity but **not to an articulation**, and
`src/lib/kit` has seventeen of them. This is a musical decision and the
`musician` takes it before a line is written.

1. **decide** — the full `(lane, level, open?, bell?) → (voice, articulation)`
   table, including: which kick articulation an anchor takes against a ghost,
   what an accented snare is when `snare.backbeat` is the anchor sound, whether
   `tom1`/`tom2` map to `toms.rack`/`toms.floor` flatly, and **how the three
   `snare.ghost` files are chosen** — `docs/music.md` forbids `Math.random`, so
   either a pure function of the step index or a seeded draw, and the musician
   says which and why. The decision is written into `docs/music.md` Part 3.
2. **red** — `baseBeat.test.ts` against a fixture grid built in the test file:
   every grid note becomes exactly one `Note`; the velocity is the Part 4 level
   value; `offsetBeats` is 0; a two-bar groove alternates its bars by
   `index % 2`; the ghost choice is deterministic for the same inputs.
3. **green** — `baseBeat.ts`.

#### Track E — The pipeline

* **Role:** `test-writer`, then `implementer`
* **Owns:** `src/lib/pipeline/types.ts`, `src/lib/pipeline/run.ts`,
  `src/lib/pipeline/stages/globalTime.ts`, `src/lib/pipeline/index.ts`,
  `src/lib/pipeline/pipeline.test.ts`
* **Needs to start:** Track C green (globalTime calls it); Track D's file may
  land in parallel

1. **red** — `pipeline.test.ts`, the seam test: for every index `0…PIPELINE.length`,
   splice a recording probe into the array, run it, and assert the probe sees
   the previous stage's `Bar` and that the note it adds survives to the output.
   No assertion names the array's length or its members.
2. **red** — `globalTime` fills `bar.time` from `ctx.tempo`, `ctx.startTime` and
   `ctx.startIndex`, and leaves `notes` untouched. `run` returns a new `Bar` and
   mutates neither its input nor `ctx`.
3. **green** — `run.ts`, `globalTime.ts`, and `PIPELINE = [globalTime, baseBeat]`.

### Epic 2 — It plays

Impure. This is where the unknowns are.

#### Track F — The sample player

* **Role:** `implementer`
* **Owns:** `src/features/transport/lib/player.ts`,
  `src/features/transport/lib/player.test.ts`
* **Needs to start:** `src/lib/kit`'s `KIT` manifest, which exists

1. **red** — against a fake `AudioContext`: every path in `KIT` is fetched once
   and decoded once; a second request for the same articulation reuses the
   buffer; a failed fetch leaves that articulation silent and does not reject the
   load; playing a note applies `velocity * gains[voice]`; a note is scheduled at
   the absolute time it was given, not at `currentTime`.
2. **green** — `player.ts`. Decoding happens on a suspended context, so no user
   gesture is required for it.

#### Track G — The scheduler

* **Role:** `implementer`
* **Owns:** `src/features/transport/lib/scheduler.ts`,
  `src/features/transport/hooks/useTransport.ts`,
  `src/features/transport/types.ts`, `src/features/transport/index.ts`,
  and their tests
* **Needs to start:** Track E green, Track F green

1. **red** — against an injected clock and a recording player: a bar is planned
   when the lookahead window reaches its start; every note is scheduled within
   ±1 ms of its intended time; a tick that runs 200 ms late schedules the same
   times as one that runs on time; over 200 bars the last note's time equals the
   directly computed one, exactly; a tempo set mid-bar changes nothing already
   scheduled and takes effect at the next bar line.
2. **green** — `scheduler.ts`: 100 ms lookahead, 25 ms tick, per `docs/music.md`.
3. **green** — `useTransport.ts`: owns `playing`, `tempo` and the rest of the
   panel's state, starts the context on Play, and stops the loop on Stop and on
   unmount.

#### Track H — The panel goes controlled

* **Role:** `implementer`
* **Owns:** `src/features/panel/components/Panel.tsx`,
  `src/features/panel/hooks/usePanelState.ts` (deleted),
  `src/features/panel/types.ts`, `src/features/panel/index.ts`,
  `src/app/page.tsx`, and the panel's tests
* **Needs to start:** Track G's `useTransport` return type

1. **red** — `Panel` renders from props and calls its callbacks; `page.tsx`
   imports `@/features/transport` and `@/features/panel` and nothing deeper.
2. **green** — `Panel` takes `PanelControls` as props instead of calling a hook;
   `usePanelState` goes; `page.tsx` composes the two slices.
3. **green** — `docs/architecture.md`'s *arrows inside a slice* section gains the
   transport slice, and `docs/music.md`'s *Where to change what* table is
   corrected in the three ways the file map above names.

## Waves

* **Wave 1 (parallel):** Track A, Track C, Track F, Track D step 1 (the
  musician's decision — no code)
* **Wave 2 (parallel):** Track B — needs A · Track D steps 2–3 — needs A and the
  decision · Track E — needs C
* **Wave 3:** Track G — needs E and F
* **Wave 4:** Track H — needs G

Epic 1 is graded after wave 2. Epic 2 after wave 4.

## Checks

* `npm test`, `npm run lint`, `npm run build` — all three, per `CLAUDE.md`.
* **An ear, for the first Done-when bullet.** No test in this repo can hear.
* `.shots/shoot.mjs` is not needed: V5 changes no pixel.

## Risks

* **Ogg may not decode on iOS.** `docs/adr/0006` shipped Ogg only, knowing
  caniuse measures the `<audio>` element rather than `decodeAudioData`. V5 is the
  change that finds out, and the app is silent on its target device if the answer
  is no. Held by: Track F fetches and decodes on page load, so a failure is
  visible immediately rather than on Play; the existing candidate row covers the
  fix.
* **`Bar` and `BarContext` may be too narrow** for a stage nobody has designed.
  Held by: nothing. It is the price of freezing a contract early, and the probe
  test does not catch it. The mitigation is that widening a read-only context is
  additive.
* **The open hi-hat rings 640 ms and nothing chokes it.** Straight Sixteen has
  no `O`, so V5 does not hit it; Funky Drummer does, and it is in the library.
  Held by: the existing candidate row, and the fact that only Straight Sixteen
  plays.
* **Master headroom.** Kick, snare and hat coinciding reach a theoretical 2.3×.
  V5 is the first change that can clip. Held by: the existing candidate row; if
  it audibly clips, a master trim lands in Track F rather than becoming a bug.
* **Deleting `usePanelState` touches V3's tests.** Held by: Track H owns them,
  and `docs/testing.md` says a relocated assertion keeps its subject.

## The size test

| Question | Answer |
| :-- | :-- |
| `## Done when` five bullets or fewer? | **No — six.** |
| At most two or three concern folders? | Borderline: `src/lib/` (four new folders), a new feature slice, an edited feature slice, the route. |
| Leaves everything `docs/music.md` marks as fixed alone? | Yes. |
| One `git revert` rolls it back? | Yes. |

Two of four fail, and the honest reading is that this is a **large change whose
requirements are settled**, not an uncertain one — which `/brainstorm` §7 says is
the case that is fine as it is. The two-epic split is the concession: epic 1
lands and is graded on its own.
