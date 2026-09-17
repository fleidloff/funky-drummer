# V6. Velocity curves and humanize

Started 2026-09-17 · `/brainstorm`
**Phase:** built — every bullet but the ear · `/implement 6` run 2026-09-17

## What

* Two more pipeline stages, in Fred's words: "first a velocity per Bar to make
  the groove sound more natural. And second, a humanize stage at the end of the
  pipeline that handles micro-timing to make it sound more like a human
  drummer."
* `velocity` multiplies the level velocity `baseBeat` wrote by a shallow arc
  across the bar — `docs/music.md` Part 4 *Velocity curves*, range 0.92–1.05,
  backbeats and beat-1 kicks exempt.
* `humanize` writes `offsetBeats`, which `Note` already carries and
  `noteTime` already applies — `docs/music.md` Part 4 *Humanize*, split σ,
  ±0.065 clamp, zero bias, a pure function of `(seed, barIndex, step, voice)`.
* Both are pipeline stages per [ADR 0007](../../docs/adr/0007-the-drummer-is-a-pipeline-of-same-signature-stages.md) — a file plus a line in `PIPELINE`.
* Their homes are already named in `docs/music.md`'s *Where to change what*
  second table: `src/lib/pipeline/stages/velocity.ts` and
  `src/lib/pipeline/stages/humanize.ts`. Both rows move up when they land.

## Done when

* `PIPELINE` reads `[globalTime, baseBeat, velocity, humanize]`, and adding
  each stage was a file plus a line. `Stage` and `run.ts` did not move —
  [ADR 0007](../../docs/adr/0007-the-drummer-is-a-pipeline-of-same-signature-stages.md) still holds. The `Note` contract widened once, by design
  (see `tech-spec.md` *Decided*).
* A non-exempt note's velocity is its level value times both curves, with the
  per-bar arc inside 0.92–1.05 and the four-bar arc inside 0.90–1.08. **Every**
  note at level `anchor` comes out at exactly its level value, at any step and
  on any lane — including the four anchor kicks of Four On The Floor Funk, which
  is the case that corrected this bullet mid-build.
* Measured over many bars, `offsetBeats` has combined σ ≈ 0.0081 beats, every
  voice's mean is zero, no note exceeds ±0.024, and two voices on the same step
  differ by σ = √2 × 0.0030 ≈ 0.0042 beats — far closer to each other than
  either is to the grid.
* The same seed, tempo and groove replay a bar hit for hit, velocity for
  velocity, offset for offset; a different bar index does not. `Math.random`
  appears nowhere in anything that decides a hit — `docs/music.md`'s own
  wording — and a structural test names the one place it is allowed, the
  performance seed drawn on Play.
* The earliest note the model can produce — step 0 at the full negative clamp —
  is still scheduled in the future at every tempo in the range.
* **By ear**, at 96 BPM: the bar breathes rather than crescendos, the One still
  arrives hard, and a kick and hi-hat on the same step read as one drummer
  rather than a flam.

## Decided

* **Both velocity curves, or the per-bar one only?** — **Both**, in one
  `velocity` stage. They are two lines of the same function, `docs/music.md`
  already binds both ranges, and shipping half would leave the *Velocity curves*
  row half true.

* **What happens to a note humanized backwards across a beat line?** —
  **The scheduler plans each beat one clamp-width earlier.** It commits one beat
  at a time and plans a beat when its line is 75–100 ms away; `source.start(t)`
  with a past `t` fires immediately. A note on the first step of a beat at the
  full −0.065 beat clamp is 41 ms early at 96 BPM, which would cut the margin to
  34 ms. Planning 0.065 beats earlier keeps the margin it has today. Rejected:
  clamping offsets non-negative on step 0, because that biases the first note of
  every beat late and `docs/music.md`'s never-change list says every bias is
  zero.
* **Does the `velocity` stage implement Feel's curve flattening?** — **No.**
  `docs/music.md` gives Feel its own stage at
  `src/lib/pipeline/stages/feel.ts`, and the "velocity curves flattened to
  ±0.02" row belongs to it. At the hardcoded Feel of 0.5 it is a no-op anyway.
* **Does the fill exception's converging offset land here?** — **No.** There are
  no fills and no fill data to test a converging offset against. It goes in with
  `fills.ts`.

* **What is exempt from the velocity curves?** — **Every `anchor` note.** The
  tech spec first froze "backbeats and beat-1 kicks", which the groove library
  breaks: Four On The Floor Funk anchors the kick on all four quarters, and
  curving an anchor gives 1.00 × 1.05 × 1.08 = 1.134 — past 1.0, which
  `docs/music.md`'s never-change list forbids. Found by Track B mid-build, on
  the real library rather than on a reading.
* **How much humanize?** — **σ = 0.0081 beats combined, clamp ±0.024.** The
  first build shipped `docs/music.md`'s σ = 0.026 with a ±0.065 clamp, and Fred
  heard it: *"humanize is too much, it should only be micro-timing, barely
  noticeable, yet much more human like."* He was right on the document's own
  evidence — at 96 BPM that was σ ≈ 16 ms against the 16–30 ms window where the
  doc records that a listener starts hearing displacement as *deliberate*, so a
  third of every bar sat at or past the threshold. The `musician` found the
  deeper error: 0.026 was measured across an expert rhythm *section*, so it pools
  several players and already contains the between-instrument offsets this app
  sets to zero. Applying it per note double-counted them. The clamp is now set
  first, just inside the threshold, and the sigmas derive as clamp / 3. At 96 BPM
  that is σ = 5.0 ms with a 15 ms ceiling, and **0.00%** of notes reach 16 ms
  where 32.5% did.
* **Does swing land in the same change?** — **No.** Both swing and humanize
  move notes off the grid, so a single by-ear session could not tell which one
  did what. Swing gets its own change and its own listen. The Swing knob goes on
  moving a number nothing reads until then.

## Open

* Nothing. `spec.md` is settled — see `tech-spec.md`.

## Size

Six `## Done when` bullets against the skill's five, and **four** concern
folders, not the three this section first claimed: `src/lib/pipeline/`, the new
`src/lib/random/`, `src/features/transport/` and `docs/`. The undercount was
mine — `src/lib/random/` was in the tech spec's contracts from the start and I
did not count it. The verifier caught it.

So the change fails two of the size test's four questions rather than one. It
passes the other two: nothing on `docs/music.md`'s never-change list moved, and
one revert rolls it back. Splitting velocity from humanize was offered and
declined, and the reason stands — the two share one contract wave and one
by-ear verdict.
