# Funky Drummer — Project Description

## What it is

A browser-based groove box that plays funk, and only funk. Instead of a metronome
clicking on the beat, a virtual drummer plays a real groove behind you, with fills,
variations and ghost notes that change every bar. You practice against something that
breathes.

Built first as a practice tool for bass, but usable by anyone who plays to a groove.
It is published publicly on the web, free to open, no account, no install.

## Why it exists

A metronome tells you where the beat is. It does not tell you how a groove is played.
A backing track does, but it repeats identically forever, so you learn the recording
instead of the feel. Funky Drummer sits between the two: a fixed, simple groove
underneath, with a drummer improvising on top of it, differently every time.

## Who it is for

- Primary: a bass player practicing alone who wants a groove, not a click.
- Secondary: guitarists, keyboard players, drummers, anyone shedding funk time feel.
- Not for: producers making tracks. There is no export and no song arrangement.

## Core experience

1. Open the page. Hit play.
2. The app picks a groove at random from a curated library and starts playing it.
3. The drummer keeps that groove going, adding fills, variations, ghost notes and
   dynamics on the fly. It never repeats itself exactly.
4. You mute the instruments you do not want. The drummer redistributes the groove
   across whatever is left.
5. You steer tempo, swing and how busy the drummer plays. Or you let it steer itself.

Every session sounds different, because the groove is drawn at random and the
performance on top of it is generated fresh.

## Features

### The drummer

- Plays a hand-authored 1–2 bar funk groove as the foundation, drawn at random on play.
- Adds fills, variations and ghost notes in real time. Nothing is pre-rendered.
- Shapes dynamics with a velocity curve across each bar, and a longer curve across
  4 bars, so phrases build and settle.
- Humanizes micro-timing so it does not sound quantized.
- Always 4/4.
- comes up with Motifs that the Player can react to
- possibly call response: play 1-2 Bar Motifs, 2 Bars almost nothing, giving room for response
- the drummer changes the audio stream with a pipeline of different audio modules (variation, fill, ghosts, velocity, etc)

### The kit

Eight instruments, each with its own mute button:

Kick · Snare · Hi-hat · Ride · Cowbell · Shaker · Toms · Crash

Sound is a sampled acoustic funk kit. Muting is musical, not a mixer: when you mute the
hi-hat, the drummer moves that motion into the shaker or the ride rather than leaving a
hole. There is no per-instrument volume.

### Controls

| Control | What it does |
| --- | --- |
| Play / Stop | Starts and stops the drummer |
| Count-in | One bar of clicks before the groove starts |
| Tempo | Sets BPM |
| Tap tempo | Sets BPM by tapping |
| Swing | Straight through to heavily swung 16ths |
| Feel | How much the drummer plays, from thin (sparse, just the groove) to fat (busy, driving, full of fills) |
| Auto-feel | The drummer moves the Feel slider itself, building and releasing tension over time |
| Auto-fill | Turns automatic fills on or off |
| 8 mute buttons | One per instrument |

### Look

A skeuomorphic analog drum machine: brushed metal panel, physical knobs, glowing
backlit buttons, warm amber on grey. Portrait layout, designed for a phone held in one
hand while the other hand is on the instrument. **`app2.png` is the reference**;
`app.jpg` is the earlier one, kept because its brighter metal is what light mode
follows.

## Groove library

Grooves are authored by hand, not by the user. Authoring happens in a private tool: a
16th-note grid where each instrument is switched on or off per step. That is all that is
entered — velocity, micro-timing, fills and variation are the app's job, not the grid's.

The library is content, and it grows over the life of the project. Ten good grooves is a
usable product; a hundred is a better one.

## Out of scope

- Genres other than funk.
- MIDI or audio export.
- Per-instrument volume, panning or effects.
- Song arrangement, sections, verse/chorus.
- User accounts, sharing, community grooves.
- A user-facing groove editor.
- Time signatures other than 4/4.

## Roadmap

Phases are ordered by what makes the thing usable soonest, not by effort. Each phase
should end with something playable.

### Phase 1 — It plays

Prove the core loop: a groove plays in the browser, in time, with the right sound.

- Play / stop
- One hard-coded groove, sampled acoustic kit
- Tempo knob
- All eight instruments audible

Done when you can practice bass to it, even if it is boring.

### Phase 2 — It grooves

Make it a drummer instead of a loop player.

- Groove library with random selection on play
- Velocity curve per bar and per 4 bars
- Humanized micro-timing
- Ghost notes and small variations

Done when a listener cannot tell the bar you are hearing is the same bar as before.

### Phase 3 — You steer it

The controls from the mockup.

- Mute buttons with redistribution across the remaining instruments
- Feel slider
- Auto-fill
- Swing
- Tap tempo, count-in

Done when the full front panel is live.

### Phase 4 — It steers itself

- Auto-feel: tension and release over a multi-bar arc
- Fill logic that lands on phrase boundaries rather than at random

Done when you can leave every automatic control on and just play.

### Phase 5 — It looks the part

- The skeuomorphic panel from `app2.png`
- Knob and slider interaction that feels physical on touch
- Mobile-first portrait layout

Done when it looks like the mockup on a phone.

### Phase 6 — Content and polish

- Grow the groove library
- Remember tempo, swing and mutes between visits
- Public launch

## Open questions

- Should tempo, swing and mute settings persist between visits, or should every session
  start clean? -> let's persist them
- Should the count-in be always on, or a toggle? -> let's add a toggle next to auto-fill
- Is there any visual feedback while playing — a beat indicator, a bar counter — or is
  the panel static apart from the controls? -> the play button is blinking
