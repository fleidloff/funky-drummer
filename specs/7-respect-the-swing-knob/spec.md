# V7. Respect the swing knob

Started 2026-09-17 · `/brainstorm`
**Phase:** built — every bullet but the ear · `/implement 7` run 2026-09-17

## What

* Fred: "please respect the swing knob."
* The SWING knob has moved a number nothing reads since V3. V5 left the seam
  open on purpose — `stepBeats(step, swingPercent)` in `src/lib/time/grid.ts`
  takes the percentage and discards it, and the scheduler passes
  `STRAIGHT_PERCENT` in both places it needs a swing value. V7 fills it in.
* The model is already written and is not up for discussion here:
  [docs/music.md](../../docs/music.md) Part 4 *Swing* — swing delays the second
  and fourth sixteenth of each beat, leaves the beats and the "&"s where they
  are, and **warps the grid rather than offsetting individual voices**, which is
  on the never-change list.
* Range 50–66.7%, default 54%, stated as a percentage everywhere.
  `src/features/panel/lib/ranges.ts` already carries it and the knob already
  reads `54%`.
* The knob always wins: every groove declares its own `swing` and the transport
  keeps ignoring it. Already closed in `docs/music.md`.

## Done when

* Turning SWING changes what you hear, from dead straight at 50% to a triplet
  shuffle at 66.7%. The top of the range is what `docs/music.md`'s half-time
  shuffle is reachable through, so it has to actually get there.
* A swing change lands at the next beat line, like a tempo change.
* At 50% the scheduled note times are identical to V6's, note for note.
* **By ear**, at 96 BPM on Straight Sixteen: the default 54% is not obviously
  swung but is obviously not a drum machine — `docs/music.md` `## Open` carries
  this expectation and V7 is the change that closes it.

## Decided

* **The groove library keeps its declared `swing` and nothing reads it at
  runtime** — settled in `docs/music.md` before V7; a control must not move
  under the user's hand mid-performance. The named cost stands: Cissy Strut is
  a 57% groove and at the default it will be a little squarer than the record.

* **A swing change takes effect at the next beat line** — the same rule the
  tempo knob has had since V5, and for the reason Fred gave then: waiting a
  whole bar to hear a knob you just turned is a defect. The scheduler already
  plans one beat at a time, so it is free. The cost accepted with it is that a
  bar you are turning the knob through is part straight and part swung.

* **The ear check stays on Straight Sixteen** — its hat plays all sixteen
  steps, so every swung note is audible with nothing else moving. Pointing the
  transport at Cissy Strut would test the groove rather than the knob, and a
  groove switch is a change of its own.

* **Swing is a property of the grid, not a pipeline stage** — decided against
  ADR 0007's aside and V5's own note, both of which said it would be a stage.
  Warping the grid in `src/lib/time/swing.ts` makes "every voice on a step moves
  together" something the code cannot express otherwise, where a stage writing
  `offsetBeats` would make it a rule to remember. The tech spec carries the
  shape and the ADR that follows.

## Open

* **D4, the ear.** 96 BPM on Straight Sixteen, the knob at its resting 54%: not
  obviously swung, but obviously not a drum machine. Nothing else is
  outstanding — the other three bullets are held by tests and the three commands
  are green. `docs/music.md` `## Open` keeps its *Default swing 54%* entry until
  this is heard.
