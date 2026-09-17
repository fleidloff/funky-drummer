# V5. The first beat

Started 2026-09-17 · `/brainstorm`
**Phase:** ready to build — `/implement 5`

## What

* The first two stages of the drummer's pipeline, built as a foundation the
  later stages drop into:
  `globalTime → baseBeat → variations → velocityPerBar → velocityCurveGlobal →
  fills → motifAndCallResponse → humanize`.
* **That list is an example, not the set.** The stages are nowhere near
  decided — swing will be one of them too. V5 must not freeze the order or the
  membership.
* This change builds **`globalTime` and `baseBeat`**. Everything after them
  follows in later changes.
* The pipeline shape is the point: adding a stage later must be adding a stage,
  not rewriting what is here.
* The beat itself is data and it will move. Fred will change grooves and add new
  ones, and **that must never fail a test.**

## Done when

* **Press Play and Straight Sixteen loops through the real kit**, in time, at
  the tempo the knob says, and keeps looping until Stop. *Needs an ear.*
* **Time is computed, never accumulated.** A hit's time comes from its absolute
  step index, and placement is within ±1 ms of the intended audio-clock time,
  measured against an injected clock over enough bars to expose drift.
* **A tempo change takes effect at the next bar line** and moves no hit that is
  already scheduled.
* **All ten grids of `docs/music.md` Part 2 parse, and the library's tests
  assert invariants only** — so changing a groove or adding one never fails a
  test. A malformed grid fails loudly.
* **Adding a pipeline stage is adding a stage**, not editing what V5 wrote —
  held by a test that splices a probe stage into the real array at every
  position, and by no test naming the array's length or its members.
* **`npm test`, `npm run lint` and `npm run build` all pass.**

## Decided

* **Does V5 make sound?** — Yes, through the panel's own Play button. It starts
  an `AudioContext`, loads the kit and plays the groove at the tempo the knob
  says. Because it is the only version an ear can judge, and every later stage
  then lands against something audible rather than against a list of numbers.
  This is roadmap Phase 1.

* **How much of the groove library?** — The parser of ADR 0001, plus all ten
  grids of `docs/music.md` Part 2 typed in as data. Play always uses **Straight
  Sixteen**, which that document calls "the one to check the engine against";
  random selection on Play is a later change. Ten grids rather than one because
  the parser is otherwise never exercised on the open hat, the ride bell, the
  cowbell lane or the two-bar case.
* **The library's tests assert invariants, never notes.** Every groove parses,
  every lane is sixteen steps, every symbol is legal for its lane, every `id` is
  unique. Nothing pins which step a hit sits on, so changing a groove or adding
  one cannot fail a test.

* **Which controls are live?** — **Play/Stop and Tempo, and nothing else.** V5
  is the two stages it names and no more; swing, feel, the mutes, tap tempo and
  the auto- buttons stay dummies. A tempo change takes effect at the next bar
  line, per `docs/music.md`.
* **Swing is a later stage of the pipeline, not part of `globalTime`.** Fred:
  the pipeline is nowhere near complete and swing will be an element in it. So
  V5 does not hard-wire straight time into the step→time conversion — it leaves
  a seam a swing stage can reach. Until that stage exists all ten grooves play
  dead straight, and `docs/music.md` says several of them are wrong that way.
  Accepted for one change.
* **The stage list is open.** Nothing in V5 may depend on which stages exist,
  how many there are, or in what order they run.
* **Samples load on page load**, fetched and decoded into a suspended
  `AudioContext` so no user gesture is needed for it. Play only resumes the
  context, so it is instant — which matters when the other hand is on a bass.
  The pack is 236 KB and the page has one purpose, so there is nothing to save
  the bandwidth for. Play pressed before decoding finishes waits, and lights
  when sound starts.
* **Velocity levels are `baseBeat`'s job; velocity curves are not.** The grid's
  `o` / `x` / `X` / `#` map to the four levels in `docs/music.md` Part 4 as the
  beat is read. The per-bar and per-four-bar curves are later stages.

* **No test may name a groove from the library.** `baseBeat`'s tests build
  their own fixture grid in the test file. Library tests assert invariants over
  whatever is in the folder. That is what makes editing a groove safe.

* **Two epics.** Epic 1 is the pure engine, epic 2 is the audio. Each is graded
  on its own, because every unknown — Ogg on iOS, `decodeAudioData`, the 25 ms
  loop — sits in epic 2, and a stall there should not leave the engine ungraded.
* **Six `## Done when` bullets rather than five**, and four concern areas rather
  than three. Waived: the requirements are settled and the work is simply large,
  which is the case `/brainstorm` §7 says not to split. The two epics are the
  concession.

## Open

* Nothing. Both files are settled.
