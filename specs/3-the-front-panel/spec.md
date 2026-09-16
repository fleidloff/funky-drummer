# V3. The front panel

Started 2026-09-16 · `/brainstorm`
**Phase:** ready to build — `/implement 3`

## What

* Build the design-system components the skeuomorphic panel needs, from
  `docs/concept/app2.png` — "create all the components we need in order to
  recreate the app described in the screenshot".
* Every component ships in **dark and light mode** from the start. Dark is
  `app2.png`. Light is "almost nothing changes, but we use a brighter metal
  (similar to the one in `docs/concept/app.jpg`)".
* Then assemble them into the app screen as displayed in `app2.png`.
* "All buttons and slider are just dummy buttons that can be toggled on and off
  (or slided)" — no audio, no transport, no groove. This change is the panel.

## The panel, as read off `app2.png`

Top to bottom:

1. **Nameplate** — engraved metal badge, `FUNKY DRUMMER` in amber, a speaker
   glyph at the right.
2. **Two knobs** — `SWING` (0 … 60, reads `60%`) and `TEMPO` (10 … 120, reads
   `BPM`), each on a tick ring with end labels.
3. **A row of three buttons** — `PLAY` (wide, green, lit), `TAP TEMPO`
   (grey, two lines), `AUTO FILL` (amber, lit).
4. **The pad grid** — 8 backlit amber pads, 4 × 2, inset in a darker well:
   Kick · Snare · Hi-Hat · Ride · Cowbell · Shaker · Toms · Crash.
5. **The feel slider** — `FEEL` over a ticked track, a metal thumb, `thin` and
   `fat` at the ends, `75%` under the thumb, with `AUTO FEEL` beside it.

Whole thing sits on a brushed-metal panel with a rounded bezel and screws at the
top corners.

## Done when

* **Every component the panel needs exists under `src/components/`**, in the
  role folder its one-line test picks, named for what it is and not for where it
  is used, holding no app word and importing no snippet. Each is tested against
  its own contract — props, states, accessible name — without rendering the
  feature.
* **Every one of them renders in both themes**, selected by
  `prefers-color-scheme`. Light differs from dark in the metal and in whatever
  contrast has to follow it, and in nothing else. Tested by rendering under each
  scheme; *that the light metal reads like `app.jpg` needs a look.*
* **The panel screen is what `app2.png` shows** on a phone, in one column, in
  the order nameplate → knobs → buttons → pads → feel. Above the breakpoint it
  is two columns with the split above the pads. *Both layouts need a look.*
* **Every control is a working dummy, and nothing makes a sound.** The two knobs
  turn on drag and on arrow keys and their readouts count inside the
  `docs/music.md` ranges; `FEEL` slides the same way; the eight pads start lit
  and toggle dark; `PLAY` latches to `STOP` and pulses; `TAP TEMPO` flashes
  while held; `AUTO FILL` and `AUTO FEEL` latch.
* **`npm test`, `npm run lint` and `npm run build` all pass** — which is where
  the `className` ban under `src/features/` and the reword project are held.

## Decided

* **Are the two knobs interactive dummies, or a static picture?** — draggable
  dummies: the knob turns on drag, the pointer rotates and the readout under it
  counts, with nothing wired to audio. Because the rotary drag is the control
  the panel lives or dies on, and it is better to find out now whether it feels
  physical than after the audio exists.

* **How does a user end up in light mode?** — the OS decides, through
  `prefers-color-scheme`, which `globals.css` already reads. Because the panel
  then stays exactly as `app2.png` draws it, with no control the mockup does not
  have, and a toggle can be added later as one attribute on `<html>` without
  re-plumbing any component. Both modes are still proven — tests render the
  panel under each.

* **Count-in: the concept says a toggle next to auto-fill, `app2.png` draws
  none — which wins?** — the screenshot. Build exactly the row it shows: `PLAY`,
  `TAP TEMPO`, `AUTO FILL`. Because the ask was the app as displayed, and the
  mockup is the newer artefact; count-in arrives with the transport, when there
  is something to count into and the button component already exists.

* **What does pressing PLAY do on a panel with no audio?** — it latches: press
  once and the button reads `STOP` with its green backlight pulsing, press again
  and it is `PLAY`, steady. Because that exercises both states the real transport
  will need, and the blink is the only motion on an otherwise static panel —
  worth seeing now rather than guessing at later.
* **What does a lit pad mean, and what is the starting state?** — lit means the
  instrument is playing; tapping a pad darkens it, which is the mute. All eight
  start lit. Settled by `Project.md` ("you mute the instruments you do not
  want") and by `app2.png`, which draws all eight glowing.

* **What does the panel do on a screen wider than a phone?** — it becomes two
  columns, split above the pads. Left: nameplate, `SWING` + `TEMPO`, and the
  `PLAY` / `TAP TEMPO` / `AUTO FILL` row. Right: the eight pads, the `FEEL`
  slider and `AUTO FEEL`. Steering on the left, playing surface on the right.
  One stacked column on a phone, exactly as `app2.png` draws it.

* **What range does each control sweep, and what does its readout say?** — not
  asked: [docs/music.md](../../docs/music.md) settles all three, and its numbers
  win over the scales drawn on the mockups, which disagree with each other.
  `SWING` 50–66.7%, default **54%**. `TEMPO` 60–180 BPM, default **96 BPM**.
  `FEEL` 0.0–1.0 shown as a percentage, default **50%**. So the panel does not
  boot reading `60%` / `120 BPM` / `75%` the way `app2.png` draws it.

* **Is `TAP TEMPO` a toggle, a flash, or does it actually count?** — a flash:
  it lights while the finger is down and goes dark on release. Because this
  panel is honest about being a dummy rather than half-wired, and the tap
  interval logic belongs with the transport that consumes it.

* **Is the speaker glyph on the nameplate a control?** — no, it is engraving,
  like the screws in the corners: drawn, inert, hidden from screen readers.
  Because `Project.md` lists no master volume and no master mute, and a control
  that does nothing is worse than a decoration that looks like one.
* **What changes in light mode besides the metal?** — nothing beyond what the
  metal forces. In the user's words: "for light-mode almost nothing changes, but
  we use a brighter metal (similar to the one in `app.jpg`)". The amber
  backlight, the pad glow and the green `PLAY` stay as they are.

* **It is bigger than the size test allows — split it?** — no: one change, two
  epics. Epic 1 ships the design system, provable without the screen; Epic 2
  composes it into the panel. The test fails on breadth (five role folders, a
  slice, `src/lib` and `src/app`) rather than on uncertainty, and every
  requirement here is already settled, so the risk it warns about is not the
  risk this change carries.

## Open

* Nothing. Both files are settled — `/implement 3` builds it.
