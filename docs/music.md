# Music

What the app sounds like and how it keeps time. The `musician` agent treats this
document as its source of truth; every musical number the app uses is defined
here once, and nowhere else.

The document has four parts.

1. **What funk drumming is** — the reference. Where it comes from, what is
   measured and what is folklore.
2. **The reference grooves** — the library's starting content, on a 16-step grid.
3. **The kit** — the eight instruments, what each one does in funk, and what
   happens to its part when it is muted.
4. **The model** — the app's actual numbers: tempo, swing, velocity, humanize,
   Feel, fills, scheduling.

Parts 1–3 are background you may argue with. Part 4 is binding.

---

# Part 1 — What funk drumming is

## The One

Funk resolves onto beat 1. James Brown: *"Funk is coming down on the one. If
it's on the one, then it's funky."* Everything else — the bass, the guitar
scratch, the horn stab — is placed against that arrival, usually off it.

Two consequences for a generator:

- **Beat 1 is the strongest event in the bar** and must never be swallowed. A
  fill that obscures the One is a bad fill, however good the notes are.
- **The One can be two bars apart.** Many funk figures are two bars long and
  only fully resolve at the top of bar 1. "Cold Sweat" is often described as
  feeling like 8/4 rather than 4/4 for exactly this reason: the arrival is worth
  more because it is rarer.

### Secondary Ones

A study of fourteen early funk records found six of them ("Funky Drummer",
"Cold Sweat", "Super Bad", "Think (About It)", "Amen Brother", "Impeach the
President") contain a **secondary One** — a mid-figure downbeat that the band
emphasises microrhythmically and plays *relatively early*. It lines up with an
arrangement feature: a bass riff turnaround, a vocal hook, an organ figure.

This is a real, measured effect and it is cheap to reproduce: in a two-bar
groove, bar 2 beat 1 is a candidate secondary One.

## The grid is 16ths

Funk is a sixteenth-note music. Rock is felt in eighths; funk subdivides one
level further, and the extra subdivision is where the whole style lives — the
kick doubles, the ghost notes, the hi-hat openings all sit on an "e" or an "a"
that eighth-note playing does not have.

Counted: **1 e & a 2 e & a 3 e & a 4 e & a**.

## Two sound levels

David Garibaldi's term, and the single most useful idea in funk drumming. A
funk groove is not a set of notes; it is a set of notes at **two distinct
volumes**, and the pattern the listener hears is the pattern of the loud ones.

- **Accents** — the backbeat, the kick, the marked hi-hat notes. Loud and
  deliberate.
- **Ghost notes** — snare strokes so quiet they are felt rather than heard. They
  fill the grid so the accents have something to be louder *than*.

A groove played at one volume is not funk, whatever the notes are. This is the
reason the app models velocity as a first-class thing rather than as a
humanising afterthought.

## The backbeat, and moving it

Rock puts the snare on 2 and 4 and leaves it there. Funk starts there and then
moves it:

- **Displacement.** "Cold Sweat" puts a backbeat on the "&" of 4 instead of on 4.
  "Chameleon" pushes the beat-2 snare a sixteenth early. The ear expects the
  backbeat, does not get it where it looked, and gets it a sixteenth away.
- **Partial removal.** One of the two backbeats is dropped and the other carries
  the bar.
- **Turnaround.** The pattern is displaced far enough that the pulse appears to
  have moved. Garibaldi built a vocabulary out of this.

The rule the app takes from it: a groove has **anchor backbeats** it may not
lose, and **movable backbeats** a variation may displace by one sixteenth.

## The kick

Funk kick drums do not play 1 and 3. Clyde Stubblefield's "Funky Drummer" kick
deliberately avoids beats 1 and 3 after the downbeat, which is most of why the
groove never settles.

The characteristic moves:

- **The double** — two sixteenths in a row, usually `1 .. a` or a pair straddling
  the "&". "Jungle Boogie" is built on kick doubles.
- **The push** — the kick lands on the "&" or the "a" just before a beat, so the
  beat arrives already in motion.
- **Conversation with the bass.** In funk the kick and the electric bass play
  interlocking, not identical, parts. This matters for this app specifically:
  the user *is* the bass. The kick should leave room rather than double
  everything.

## The hi-hat

The default funk hi-hat is **one-handed sixteenth notes**, which is the hardest
physical part of the style and the reason it sounds relentless.

Two things are done to it:

- **Accents.** Steady sixteenths with a quarter-note or upbeat accent pattern
  laid over them. Same notes, different shape.
- **Openings, or "barks".** A single sixteenth where the hats are let open and
  then closed again, almost always on an upbeat. "Funky Drummer" opens on the
  "e" of 2 and the "e" of 4. The open note must be **closed on the next grid
  position** or it stops being a bark and becomes a wash.

## Linear playing

Linear means **no two limbs strike at the same time**. Every note is a separate
event, so the groove reads as one long melodic line around the kit rather than
as stacked layers. It is the backbone of the New Orleans school (Zigaboo
Modeliste) and of Garibaldi's writing.

It is a constraint worth having as a switch, not a law: a purely linear groove
has no kick-and-hat coincidence at all, which is very distinctive and not
always what you want.

## Swing: measured, not assumed

Funk sixteenths are usually *slightly* swung, and much less than people assume.
A 2018 study measured swing ratios across fourteen funk records (1:1 = dead
straight, 2:1 = full triplet shuffle):

| Track | Ratio | As a swing % | How audible |
| :-- | :-- | :-- | :-- |
| "Cold Sweat", "Funky Drummer" | 1.07 : 1 | 51.7% | barely perceptible |
| "Cissy Strut", "Hand Clapping Song" | 1.3 : 1 | 56.5% | just perceptible |
| "Funky President" | 1.6 : 1 | 61.5% | clearly perceptible |
| "Papa Was Too" | 1.8 : 1 | 64.3% | the most swung found |
| "In Time" | 1 : 1 | 50% | straight (drum machine) |

**Nothing measured reached full triplet swing.** Producers programming funk
typically land in 52–60%, which is the same window from the other direction.

The New Orleans records sit in the middle of it, and that is the "neither
straight nor swung" feel people find impossible to notate.

## Microtiming: measured, not assumed

The folklore says the snare lays back behind the beat. The measurements
disagree, and this is worth knowing before building a humanizer.

- Across the fourteen-record study, **backbeat delay was minimal**: seven tracks
  barely noticeable, five imperceptible, two none, and **four played the
  backbeat early**. The conclusion drawn was that laying back is a musician's
  choice, not a rule of the style.
- A separate measurement of a funk performance put the hi-hat at −3 ms, the
  snare at −4 ms and the bass at −3 ms against the grid, with the **bass drum
  furthest ahead at −12.5 ms**. Negative is early.
- Listeners can reliably tell "pushed" from "laid-back" at onset displacements
  of roughly **16–30 ms**. Below that, a displacement reads as human rather
  than as intent.
- Groove ratings stay high from fully quantized up to about **+20% beyond the
  originally performed deviation**, and fall once deviations are exaggerated
  past that. Quantized and human-timed versions rated *equally* high.

Two rules follow, and the app obeys both:

1. **Do not bake in a laid-back snare.** It is not what the records do.
2. **Humanize is a small symmetric spread, not a bias.** Its job is to avoid a
   machine-identical repeat, not to create a feel. The feel is in the velocities
   and the note placement.

### The one place timing is deliberate

The same study measured the "Funky Drummer" fill at bars 31–32: across seven
sixteenth notes the deviation **shrinks from 56 ms to 4 ms**, a delay-and-
accelerate that lands dead on the downbeat.

That is a fill's shape in one number. A fill starts loose and tightens into the
One. The app reproduces it.

## Fills

Garibaldi, on funk fills: *"The root R&B concept is no fills. Zero. None.
Watch the James Brown YouTube clips and you're not going to hear one fill."*

That is an overstatement he means as a corrective, and it is the right
corrective for a generator, which will always want to play too much. The
working rules:

- **Phrases are multiples of four bars.** A fill belongs at the end of bar 4 or
  bar 8, not wherever a random number says.
- **Most fills are short.** A beat or two, not a bar. The commonest funk fill is
  a single displaced snare or a kick double, not a tom run.
- **A fill exists to deliver the One.** It resolves onto the next downbeat, and
  it tightens as it goes.
- **Toms are the exception, not the default.** Most funk fills stay on the snare
  and the kick.

## Articulations

| Articulation | What it is | Where it belongs in funk |
| :-- | :-- | :-- |
| Rimshot | Stick hits head and rim together — loud, ringing, high | The backbeat. The loudest thing in the bar |
| Ghost note | Barely-audible snare stroke | Everywhere between the backbeats |
| Cross-stick | Butt of the stick on the rim, tip resting on the head — dry click | A quiet verse backbeat. "Use Me", "I Got You" |
| Open hi-hat | Hats let apart for one subdivision, then closed | Upbeat barks |
| Pedalled hi-hat | Hats closed with the foot, sounding | Closing a bark; the "chick" on 2 and 4 |
| Flam | Grace note just before the main note | Thickens a backbeat or a fill accent |
| Buzz / press stroke | Stick pressed so it rattles | New Orleans phrasing; rare in straight funk |
| Bell | Ride struck on the bell — cutting, pitched | Off-beat accents; a section lift |

## Tempo

Funk is slower than people remember, because the sixteenth-note density makes it
feel fast.

| Track | BPM |
| :-- | :-- |
| The Meters — "Be My Lady" | 86 |
| The Meters — "Cissy Strut" | 88 |
| The Meters — "Hand Clapping Song" | 89 |
| James Brown — "Funky Drummer" | 94 |
| Tower of Power — "So Very Hard To Go" | 96 |
| Tower of Power — "What Is Hip?" | 101 |
| The Meters — "Running Fast" | 105 |
| James Brown — "Don't Stop The Funk" | 107 |
| Tower of Power — "Souled Out" | 111 |

The classic window is **85–115 BPM**. Below about 80 the sixteenths start to
drag; above about 125 a one-handed sixteenth hat stops being playable and the
style turns into disco.

---

# Part 2 — The reference grooves

These are the library's starting content. They are **authored after the records,
not transcribed from them** — close enough to teach the feel, simple enough to
sit on a 16-step grid. Where a record does something the grid cannot hold, the
note says so.

## Notation

The format is fixed by **[ADR 0001](adr/0001-a-groove-is-an-ascii-grid.md)**:
these grids are not a picture of the data, they *are* the data. A grid below
parses as written.

```
             1 e + a 2 e + a 3 e + a 4 e + a
```

| Symbol | Meaning | Valid on |
| :-- | :-- | :-- |
| `.` | rest | every lane |
| `o` | ghost | every lane |
| `x` | normal | every lane |
| `X` | accent | every lane |
| `#` | anchored accent — never thinned, displaced or dropped | every lane |
| `O` | open hi-hat, at accent level, closed on the next step | `hihat` |
| `B` | ride bell, at accent level | `ride` |

Velocity is not authored. The grid says *what plays where and at which of three
levels*; Part 4 says what a level is worth. An omitted lane is silent.

`#` is the glyph that does the structural work. It marks a note the drummer may
not thin away at low Feel, may not displace as a variation, and may not drop
when its voice is muted. Beat 1 of the kick and the load-bearing backbeats are
the usual ones.

## 1 — Straight Sixteen

The reference groove. Nothing displaced, nothing clever. It is the one to check
the engine against.

```
             1 e + a 2 e + a 3 e + a 4 e + a
hihat        x x x x x x x x x x x x x x x x
snare        . . . . # . . o . o . . # . . o
kick         # . . x . . X . . . X . . . x .
```

tempo 96 · swing 52

## 2 — Funky Drummer

One-handed sixteenths with barks on the "e" of 2 and the "e" of 4. The kick
stays off beats 1 and 3 after the downbeat. Dense ghosting around both
backbeats.

```
             1 e + a 2 e + a 3 e + a 4 e + a
hihat        x x x x x O x x x x x x x O x x
snare        . . . o # . . o . o o . # . o o
kick         # . x . . . . . X . . x . . . .
```

tempo 94 · swing 52 · after Clyde Stubblefield

## 3 — Cold Sweat

Two bars. The bar-1 backbeat moves to the "&" of 4 — that displacement is the
whole groove, so it is anchored there. Bar 2 has no kick on the downbeat; it
lands on the "&" of 1 instead, and the last kick sits on the "&" of 3, leaning
into the beat-4 snare.

```
bar 1        1 e + a 2 e + a 3 e + a 4 e + a
hihat        x x x x x x x x x x x x x x x x
snare        . . . . # . . o . o . . . . # .
kick         # . . . . . x . . . . . . . . .

bar 2        1 e + a 2 e + a 3 e + a 4 e + a
hihat        x x x x x x x x x x x x x x x x
snare        . o . . # . . o . o . . # . . .
kick         . . x . . . . . . . . . x . . .
```

tempo 108 · swing 52 · secondary One in bar 2 · after Clyde Stubblefield

## 4 — Cissy Strut

New Orleans. Alternating-hand hats, semi-linear kick and snare, an accent on
the last sixteenth of beat 2, and two snare accents on beat 4. Sits between
straight and swung — play it dead straight and it is wrong.

```
             1 e + a 2 e + a 3 e + a 4 e + a
hihat        x x x x x x x X x x x x x x x x
snare        . . . . . . . X . . o . # . # .
kick         # . . . . x . . . . x . . . . .
```

tempo 88 · swing 57 · after Joseph "Zigaboo" Modeliste

## 5 — Chameleon

The beat-2 backbeat is displaced a sixteenth early, onto the "a" of 1. Sparse,
wide, and much less busy than it is remembered as being.

```
             1 e + a 2 e + a 3 e + a 4 e + a
hihat        x . x . x . x . x . x . x . x .
snare        . . . # . . . . . . . . # . . .
kick         # . . . . . x . . . X . . . . .
```

tempo 110 · swing 50 · after Harvey Mason

## 6 — Second Line

Clave-implied, kick-led, snare scattered. The hat rides eighths so the snare has
room, and the cowbell carries the figure.

```
             1 e + a 2 e + a 3 e + a 4 e + a
hihat        x . x . x . x . x . x . x . x .
snare        . . o . # . . o . . X . o . X .
kick         # . . x . . . . x . . x . . . .
cowbell      x . . x . . x . . . x . . x . .
```

tempo 92 · swing 58

## 7 — Linear Two-Level

No two voices strike together anywhere in the bar. Every one of the sixteen
steps carries exactly one note, so the groove reads as a single line around the
kit.

```
             1 e + a 2 e + a 3 e + a 4 e + a
hihat        . x x x . x . . x x . x . x . .
snare        . . . . # . . o . . . . # . o .
kick         # . . . . . x . . . x . . . . x
```

tempo 100 · swing 54 · after David Garibaldi

## 8 — Bell Funk

Cowbell carries a bell pattern over a plain kick and snare. Latin-funk
territory — "Hey Pocky A-Way", "Low Rider". The cowbell lane is the identity of
this groove and Part 3 exempts it from thinning.

```
             1 e + a 2 e + a 3 e + a 4 e + a
cowbell      X . . x . . X . . x X . . x . .
snare        . . . . # . . o . o . . # . . .
kick         # . . . . . x . . . X . . . x .
```

tempo 104 · swing 54

## 9 — Shaker Sixteen

The hat drops to the backbeat and the shaker takes the sixteenths. Lighter, and
the groove to reach for when the hat is muted.

```
             1 e + a 2 e + a 3 e + a 4 e + a
shaker       X . x . X . x . X . x . X . x .
hihat        . . . . x . . . . . . . x . . .
snare        . . . o # . . o . o . . # . . o
kick         # . . x . . . . X . . . . x . .
```

tempo 98 · swing 54

## 10 — Four On The Floor Funk

The disco-adjacent end of the style. Kick on every quarter, hats open on every
upbeat. Fastest thing in the library.

```
             1 e + a 2 e + a 3 e + a 4 e + a
hihat        x . O . x . O . x . O . x . O .
snare        . . . . # . . . . . . . # . . .
kick         # . . . # . . . # . . . # . . .
```

tempo 118 · swing 50

## Half-time shuffle

A Purdie-style half-time shuffle — triplet subdivision, backbeat on 3, ghost
notes on the middle triplet partial — **does not fit a sixteenth grid**, and
ADR 0001 bakes sixteen steps in. It is reachable only by pushing the swing knob
to its maximum, which warps the grid into a triplet feel. No library groove is
authored for it; it is what the top of the swing range is for.

---

# Part 3 — The kit

Eight voices, each with a mute button. There is no per-instrument volume: the
relative gains in Part 4 are fixed, and muting is a musical decision, not a
mixer move.

Each section says what the instrument does in funk, what it does here, and
**where its part goes when it is muted**. The redistribution rule is the same
everywhere: *the pulse is never interrupted, and muting never leaves a hole.*

## Kick

**In funk.** Tuned high and damped short, with a ported front head so the note
is a thud rather than a boom. It plays the One and then avoids the obvious
beats. Doubles on adjacent sixteenths, pushes onto the "&" before a beat, and
interlocks with the bass rather than doubling it.

**Here.** The lowest voice and the loudest. It carries beat 1 in every groove.
The Feel control adds kick doubles before it adds anything else.

**Muted.** The floor tom takes beat 1 and any kick note that falls on a beat;
the off-beat kick notes are dropped rather than moved. If the toms are also
muted, the snare takes beat 1 as an accent. Beat 1 is never silent.

## Snare

**In funk.** The two sound levels live here. The backbeat is a rimshot — the
loudest note in the bar — and everything between the backbeats is ghost notes at
a fraction of that. Funk then moves the backbeat: a sixteenth early, a sixteenth
late, or onto the "&". Cross-stick is the quiet alternative for a thin verse.

**Here.** The snare has three levels, not two: backbeat, normal, ghost. Ghost
density is the main thing the Feel control moves. Anchor backbeats never move;
movable ones may be displaced by one sixteenth.

**Muted.** Backbeats move to the cowbell if it is available, otherwise to the
rack tom, otherwise to an accented hi-hat. Ghost notes are **dropped, not
moved** — a ghost note on another voice is not a ghost note, it is a wrong note.

## Hi-hat

**In funk.** The default timekeeper, and the thing that makes funk sound like
funk: one-handed sixteenths, accented in a pattern over the top, with single-
sixteenth openings on the upbeats that are closed again immediately.

**Here.** The primary sixteenth-note voice. Three articulations: closed,
accented, open. An open note is always closed on the next grid step; the app
never leaves the hats open across a beat.

**Muted.** Its part moves to the shaker if available, otherwise to the ride,
otherwise to the cowbell thinned to eighths. Barks become ride-bell accents on
the ride, and are dropped on the shaker.

## Ride

**In funk.** The section lift. The same pattern moved from hats to ride opens
the sound up, and funk ride playing tends to favour the bell and off-beat
accents over the shoulder-on-the-beat approach of rock.

**Here.** An alternative timekeeper, not an addition to one. When the ride plays
the pattern, the hi-hat plays only the foot "chick" on 2 and 4. Two
articulations: bow and bell.

**Muted.** Its part returns to the hi-hat. Bell accents become hi-hat barks.

## Cowbell

**In funk.** Afro-Cuban by descent. Either a straight quarter-note drive or a
bell pattern — cáscara, or a clave-derived figure — laid over the kit.
"Hey Pocky A-Way", "Low Rider".

**Here.** A figure voice, not a timekeeper. When a groove authors a cowbell
part, that part is the identity of the groove and is never thinned away by the
Feel control.

**Muted.** Nothing replaces it. A cowbell figure moved to another voice is a
different groove. The hi-hat picks up any accent that fell on a beat, so the
pulse still reads.

## Shaker

**In funk.** Steady sixteenths with the accent on the beat, or on the upbeat for
lift. It fills the space between hits and raises intensity without raising
volume. Often doubled with the hat rather than replacing it.

**Here.** The quiet sixteenth-note voice. It can carry the grid on its own when
the hat is muted, and it is the first thing the Feel control adds when the
drummer is getting busier.

**Muted.** Nothing replaces it; it is texture. If the hi-hat had been thinned
because the shaker was carrying the sixteenths, the hat goes back to sixteenths.

## Toms

**In funk.** Rarely the groove, mostly the fill — and even then funk fills more
often stay on the snare. A tom-led groove is a deliberate colour change: second
line, or a tribal breakdown.

**Here.** Two voices, rack and floor, on one mute button. They appear in fills
and in the small number of grooves that author a tom part. The floor tom is the
kick's understudy.

**Muted.** Tom notes in a fill move to the snare, keeping their velocities. A
tom part in a groove moves to the snare as normal-level notes, not ghosts.

## Crash

**In funk.** Sparse to the point of absence. Funk records crash to mark the top
of a phrase and very little else — "Cold Sweat" is notable for how little crash
there is. A generator that crashes freely stops sounding like funk within four
bars.

**Here.** Fires only on beat 1 of a phrase boundary — bar 1 of 4, or bar 1 of 8
— and only after a fill. Never twice in four bars. It is the one voice the Feel
control cannot make busier.

**Muted.** The accent moves to the ride bell, otherwise to an open hi-hat,
otherwise to a snare rimshot.

## Relative gains

Fixed. These are the mix, and there is no user control over them.

**The gains only mean anything if the samples are normalized first.** Every
sample in the pack is loudness-normalized to the same integrated level before
any gain is applied. Without that step a gain table is arithmetic on whatever
level the sample happened to be recorded at, and −8 dB on a hot hi-hat sample is
louder than 0 dB on a quiet kick. Normalization is measurable and belongs in the
build, not in the ear.

With that in place, the table below is the mix and nothing else.

| Voice | Gain | Linear |
| :-- | :-- | :-- |
| Kick | 0 dB | 1.00 |
| Snare | −1 dB | 0.89 |
| Toms | −3 dB | 0.71 |
| Crash | −5 dB | 0.56 |
| Cowbell | −6 dB | 0.50 |
| Ride | −7 dB | 0.45 |
| Hi-hat | −8 dB | 0.40 |
| Shaker | −12 dB | 0.25 |

Stated in dB because that is the unit the decision is actually in: the kick and
snare are the groove and sit at the front, the hi-hat sits most of a fader below
them, and the shaker is texture at the back. Linear multipliers hide that —
0.40 looks like "less than half" and is only 8 dB.

---

# Part 4 — The model

Binding. Every number the app uses is here.

## Time signature and grid

4/4 only. Sixteen steps to the bar. A groove is one or two bars.

The grid is **positional, not temporal**: a step is an index, and its time is
computed from the bar index, the tempo and the swing. Nothing accumulates.

## Tempo

**These three tables are the app's source, not a note about it.** Since V3 the
front panel reads them through `src/features/panel/lib/ranges.ts`, which carries
the range, the step and the resting value of each control. Changing a number
here is a change to what the knobs do, and `ranges.ts` is the one file that has
to move with it.

| | Value |
| :-- | :-- |
| Range | 60–180 BPM |
| Default | 96 BPM |
| Funk window | 85–115 BPM |
| Tap tempo | median of the last 4 intervals; a gap over 2 s starts a new set |

A tempo change takes effect at the next bar line, not immediately. Changing it
mid-bar would move hits that are already scheduled.

**The knob wins here too.** Every groove declares its own `tempo` per ADR 0001
and the transport ignores it, for the same reason it ignores the groove's swing:
a user practising at 90 does not want the tempo to jump to 118 because the app
drew Four On The Floor. The field records what the record does.

Below 80 BPM the sixteenth grid starts to drag; above 125 the style is no longer
funk. The range is wider than the window because the app is a practice tool and
people practise slowly.

## Swing

Swing delays the second and fourth sixteenth of each beat — the "e" and the "a"
— and leaves the beats and the "&"s where they are.

| | Value |
| :-- | :-- |
| Range | 50% (straight) – 66.7% (full triplet) |
| Default | 54% |
| Funk window | 50–62% |

The percentage is the fraction of the eighth-note pair the first sixteenth
occupies. 50% is dead straight; 66.7% is a triplet shuffle.

Anchoring to the measurements in Part 1: 51.7% is "Funky Drummer", 56.5% is
"Cissy Strut", 61.5% is "Funky President", 64.3% is the most swung record found.
The default sits just above straight because that is where the canonical records
sit.

**Swing warps the grid, it does not offset notes.** Every voice is placed on the
warped grid, so the shaker, the hat and the ghost notes all swing together. A
per-voice swing would be a different feature and is not this one.

**The knob always wins.** Every groove declares its own `swing` per ADR 0001,
and the transport ignores it: it records what the record does, and nothing
reads it at runtime. Drawing a groove never moves a control the user has set.

The cost is real and worth naming. Cissy Strut is a 57% groove, and at the
default 54% it will be a little squarer than the record. The alternative was a
knob that jumps under your hand every time a new groove is drawn, in an app
whose whole point is that you are playing while it does that.

This is also why the default matters more than it otherwise would: 54% is the
midpoint of the library's declared values, which run 50 to 58.

## Velocity

Normalized 0–1, multiplied by the voice's fixed gain.

| Level | Value | Used for |
| :-- | :-- | :-- |
| Backbeat | 1.00 | Anchor snare hits, beat-1 kick |
| Accent | 0.85 | Marked hi-hat notes, cowbell downbeats, fill accents |
| Normal | 0.65 | Everything unmarked |
| Ghost | 0.30 | Snare ghost notes |

The gap between 0.30 and 1.00 is the two sound levels, and it is deliberately
wide.

The two published figures disagree, and the disagreement resolves once you look
at what each is for. General guidance for programmed drums puts ghost notes at
MIDI 30–50 against backbeats at 90–100 — roughly 0.30 against 0.75. People
programming the "Funky Drummer" break specifically use ghosts at 90–110 against
a backbeat at 127, which is far flatter. **The flat one is a reconstruction of a
record**, and a record has been through a compressor, a tape machine and a
mastering chain, every one of which closes the gap between the loudest and the
quietest note. Programming it flat is compensating for a chain this app does not
have. The app plays clean samples into a browser with no bus compression, so the
performed spread is the right one.

The other half of the argument is the kit. A ghost note is not a quiet backbeat:
the stick barely engages the wires, so it is duller and drier, not just
smaller. **A velocity of 0.30 only produces a ghost note if the sample pack has
a layer down there.** Scaling one snare sample by 0.30 produces a distant
backbeat, which is the wrong sound at the right volume, and the groove loses the
two sound levels it is built on.

### Velocity curves

Two multiplicative curves, both applied on top of the level.

**Per bar.** A shallow arc that lifts the middle of the bar and settles into the
One. Range **0.92–1.05**. It is small on purpose: this is breathing, not a
crescendo.

**Per four bars.** A longer arc across the phrase, building to bar 4 and
dropping back for bar 1 of the next phrase. Range **0.90–1.08**.

Backbeats and beat-1 kicks are exempt from both. The anchors stay anchored; the
curves shape everything around them.

## Humanize

A symmetric timing spread, applied per note, in two correlated parts.

| | Value |
| :-- | :-- |
| Per-step deviation | σ = 0.024 beats, shared by every voice on that step |
| Per-voice deviation | σ = 0.010 beats, independent |
| Combined | σ = 0.026 beats |
| Hard clamp | ±0.065 beats on the total |
| Per-voice bias | 0.000 beats for every voice |

**Expressed in beats, not milliseconds**, so it scales with tempo. At 96 BPM the
combined σ is about 16 ms and the clamp about 41 ms.

The 0.026 figure is the tempo-adjusted standard timing deviation measured from
an expert funk rhythm-section performance. The same body of work found groove
ratings hold from fully quantized up to about 20% beyond the performed
deviation, and fall past that — so the clamp is a ceiling, not a target.

### Why it is split in two

A single independent draw per note at σ = 0.026 would be wrong, and the reason
is anatomy rather than taste. **One drummer has one body.** When the kick and
the hi-hat land on the same step, a player puts them within a couple of
milliseconds of each other, because the limbs are driven by one internal pulse.
Drawing them independently at 16 ms apiece would separate them by 23 ms on
average, which is past the 16–30 ms window where a listener starts hearing
displacement as deliberate. The groove would not sound humanized; it would
sound like a flam on every downbeat, played by two drummers who are not getting
on.

So the step gets one offset and the voices get a small one of their own. The
kick and hat on beat 1 land about 8 ms apart, which reads as one player, and the
bar still never repeats.

This is the whole of what the split buys, and it is a structural argument rather
than a preference. The measured σ is unchanged: √(0.024² + 0.010²) = 0.026.

### Why every bias is zero

A decision, not an omission. Measured backbeat delay across fourteen funk
records was minimal, imperceptible, or *inverted* — four of the fourteen played
the backbeat early. Laying the snare back is a player's choice, not a property
of the style. Listeners only read a displacement as intent at 16–30 ms; below
that it reads as human. A non-zero bias here would be the app deciding to have a
feel on the user's behalf, and this app is played against by someone who has
their own.

### Humanize displaces, it never drifts

The offset for a note is a pure function of `(seed, barIndex, step, voice)`. It
is never accumulated and never drawn from the clock.

### The fill exception

Inside a fill, humanize is replaced by a **converging** offset: the first note of
the fill is displaced late by up to 0.09 beats, and the displacement shrinks
linearly to 0.006 beats on the last note before the downbeat. Per-voice jitter
is off inside a fill.

This is measured, not invented. The "Funky Drummer" fill at bars 31–32 goes from
56 ms to 4 ms of deviation across seven sixteenths — a delay-and-accelerate that
lands exactly on the One. Converted to beats at that record's 94 BPM, that is
0.088 down to 0.006.

## Feel

One control, 0.0 (thin) to 1.0 (fat), **defaulting to 0.5**. It is a **filter
over a fixed groove**, never a different groove: at any Feel value the authored
anchors are all present, and the same groove is still recognisable.

**0.5 is the groove exactly as authored.** The slider is centred on what the
author wrote, so it has equal travel in both directions and auto-feel has
symmetric room to build and release.

| Feel | What the drummer does |
| :-- | :-- |
| 0.0 | Anchors only — the `#` notes and nothing else. No fills. Velocity curves flattened to ±0.02 |
| 0.25 | Anchors and the groove's accents. Authored ghost notes dropped, barks off. Fills at 8-bar boundaries only |
| 0.5 | **The groove as authored.** Barks on. Fills at 4-bar boundaries |
| 0.75 | Added ghost notes in up to half the free sixteenths. Kick doubles. Shaker sixteenths if the shaker is unmuted. Occasional mid-phrase fill |
| 1.0 | Maximum ghost density, kick doubles, movable backbeats displaced, fills at every 4-bar boundary and half the 2-bar boundaries |

**Below 0.5 thinning removes; it never substitutes.** The drummer plays fewer
notes of the same groove — it does not switch to an easier one. Above 0.5 it
adds notes the author did not write, which is the one place the app invents
material rather than filtering it.

### Auto-feel

When on, Feel follows a 16-bar arc: rising over bars 1–12, peaking in bar 13,
dropping to its floor for bar 1 of the next arc. The arc is **±0.25 around the
user's last manual Feel setting**, clamped to [0.0, 1.0]. Left at the default,
that is a swing from 0.25 to 0.75 — from the groove stripped to its accents, up
to kick doubles and mid-phrase fills, and back.

Touching the Feel slider re-centres the arc and does not disable auto-feel.

## Fills

| | Value |
| :-- | :-- |
| Placement | Last beat of bar 4 of a 4-bar phrase; last two beats of bar 8 of an 8-bar phrase |
| Length | 1 beat (common), 2 beats (8-bar boundary), 4 beats (never) |
| Voices | Snare and kick by default; toms only at Feel ≥ 0.75 |
| Resolution | Always onto beat 1 of the next bar |
| Crash | Only after a fill, only on a phrase boundary, never twice in four bars |

A fill never removes beat 1 of the bar it sits in, and never removes the
backbeat that precedes it. Garibaldi's *"no fills, zero, none"* is the
corrective this list exists to encode: a generator left alone will play too
many.

## Redistribution

When a voice is muted its part is re-assigned by the rules in Part 3. Three
invariants hold whatever is muted:

1. **Beat 1 always sounds.** Some voice plays it.
2. **The backbeat always sounds** unless the snare, cowbell, toms and hi-hat are
   all muted.
3. **Ghost notes are dropped, never moved.** A ghost note is a snare articulation
   and does not exist on other voices.

Redistribution is computed per bar from the current mute set. It is not a
persistent rewrite of the groove.

## Scheduling

| | Value |
| :-- | :-- |
| Clock | `AudioContext.currentTime`, injected |
| Lookahead window | 100 ms |
| Scheduler tick | 25 ms |
| Placement tolerance | ±1 ms from intended audio-clock time |
| Cumulative drift | 0 — a hit's time is computed from its absolute step index |

Wall-clock time and the event loop are advisory. A hit's time is
`startTime + f(barIndex, step, tempo, swing) + humanize`, computed from the
absolute index, so a slow tick delays nothing and nothing accumulates.

Drift and jitter are separate defects. Drift is a bug in how time is computed;
jitter is a bug in when the scheduler runs. A test that measures "accuracy"
without saying which one it means measures nothing.

## Determinism

The app varies every bar, and it is still deterministic. Both are required.

- Every random decision is drawn from a seeded PRNG. `Math.random` appears
  nowhere in anything that decides a hit.
- The seed is drawn once per performance — on Play — and the same seed with the
  same settings produces the same performance, hit for hit, velocity for
  velocity, offset for offset.
- Humanize is a pure function of its inputs, not a walk.

---

## What must never change

Changing any of these changes what a user already practised to. Each is a
re-release, not a refactor, and proposing one is a decision to escalate.

- 4/4, sixteen steps to the bar.
- Swing warps the grid rather than offsetting individual voices.
- Humanize has zero bias for every voice.
- Anchor backbeats and beat 1 are never removed by thinning, by a fill, or by
  muting.
- Ghost notes are dropped rather than redistributed.
- Velocity is normalized 0–1 and multiplied by a fixed per-voice gain. There is
  no per-instrument volume control.

## Where to change what

**No source exists yet.** This table is the intended home for each decision, so
that the first implementation puts it in the right place and this document has
somewhere to point.

| Decision | Planned home |
| :-- | :-- |
| Tempo range, default, tap-tempo rule | `src/lib/time/tempo.ts` |
| Swing model and range | `src/lib/time/swing.ts` |
| Grid, step-to-time conversion | `src/lib/time/grid.ts` |
| Velocity levels and curves | `src/lib/groove/velocity.ts` |
| Humanize model and bounds | `src/lib/groove/humanize.ts` |
| Fill placement and shape | `src/lib/groove/fills.ts` |
| Feel filter and auto-feel arc | `src/lib/groove/feel.ts` |
| Redistribution rules | `src/lib/groove/redistribute.ts` |
| Groove grid parser and validator | `src/lib/groove/parse.ts` |
| Groove library | `src/features/groove-library/` |
| Kit, samples, relative gains | `src/features/kit/` |
| Scheduler and tolerances | `src/features/transport/` |

When a file lands, update this table in the same change. A row that names a file
that does not exist is worse than no row.

## Open

Numbers I have argued for but cannot hear, listed so nothing here is mistaken
for verified. Nothing in this pipeline can hear; each one is a proposal with a
stated expectation a person can check.

- **The dB offsets in Part 3.** Narrowed, not closed. Loudness normalization is
  a build step and measurable, so the remaining question is only the eight
  offsets. Expectation: the cowbell cuts through without dominating and the
  shaker is felt rather than heard. Adjust a dB at a time.
- **Default swing 54%.** Expectation: not obviously swung, but obviously not a
  drum machine. It carries more weight than a default normally would, because
  the knob overrides every groove.
- **The Feel table.** Expectation: at 0.5 the groove is clearly the authored
  one; at 0.75 a bass player can still hold their place; at 1.0 it is busy but
  still countable.

### Closed

| Was open | Settled as | On what grounds |
| :-- | :-- | :-- |
| Ghost / backbeat spread | 0.30 against 1.00 | The flatter published figures reconstruct a compressed record; this app has no compressor |
| Snare sample layers | Required | 0.30 on a single sample is a distant backbeat, not a ghost note. Without a layer the two sound levels collapse |
| Humanize magnitude | σ = 0.026 beats | Measured from an expert funk performance, tempo-adjusted |
| Humanize correlation | Split: 0.024 per step, 0.010 per voice | One drummer has one body. Independent draws would flam every downbeat |
| Per-voice timing bias | Zero | Measured backbeat delay in funk is minimal, imperceptible, or inverted |
| Gain units | dB, after loudness normalization | Turns most of the question into a measurement |
| Groove swing on Play | The knob always wins | A control must not move under the user's hand mid-performance |
| Feel zero point | The authored groove sits at 0.5 | Equal travel both ways, and symmetric room for auto-feel |

---

## Sources

- [Behind the Beat: "Funky Drummer" by James Brown — Roland](https://articles.roland.com/behind-the-beat-funky-drummer-by-james-brown/)
- [Microtiming in Early Funk — ZGMTH](https://www.gmth.de/zeitschrift/artikel/1224.aspx) — the swing-ratio table, the secondary-Ones finding, the backbeat-delay finding, and the "Funky Drummer" fill measurement
- [The Effect of Expert Performance Microtiming on Listeners' Experience of Groove in Swing or Funk Music — Frontiers in Psychology](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2016.01487/full) — sΔt = 0.026 beats, and the finding that groove ratings hold to +20%
- [Microtiming in Swing and Funk affects the body movement behavior of music expert listeners — PubMed](https://pubmed.ncbi.nlm.nih.gov/26347694/)
- [David Garibaldi's 12 funk drumming tips — MusicRadar](https://www.musicradar.com/news/tower-of-power-david-garibaldi-12-tips-for-funk-drumming) — two sound levels, and "no fills, zero, none"
- [A Drummer's Guide To Funk — Drumeo](https://www.drumeo.com/beat/a-drummers-guide-to-funk/)
- [The Ultimate Guide To Soul And Funk Drumming — Drumeo](https://www.drumeo.com/beat/the-ultimate-guide-to-soul-and-funk-drumming/)
- [The 10 Best Funk Beats Of All Time — Drumeo](https://www.drumeo.com/beat/10-funk-beats-every-drummer-should-learn/)
- ["Cold Sweat" drum beat — DrumsTheWord](https://www.drumstheword.com/cold-sweat-drum-beat-james-brown-clyde-stubblefield-free-drum-lesson/)
- ["Funky Drummer" drum beat — DrumsTheWord](https://www.drumstheword.com/funky-drummer-james-brown-clyde-stubblefield-free-video-drum-lesson-beat/)
- [The Meters — "Cissy Strut" drum grooves transcription — Francis' Drumming Blog](https://francisdrummingblog.com/2025/06/29/the-meters-cissy-strut-drum-grooves-transcription/)
- [Five Funk Beats You Should Know — Stanton Moore Drum Academy](https://www.stantonmooredrumacademy.com/five-funk-beats-you-should-know)
- [Zigaboo Modeliste's Funk Workout — DRUM! Magazine](https://drummagazine.com/zigaboo-modelistes-funk-workout/)
- [Funky Bell Patterns — DRUM! Magazine](https://drummagazine.com/funky-bell-patterns/)
- [How to program a Funky Drummer-style MIDI break — MusicRadar](https://www.musicradar.com/how-to/how-to-program-a-funky-drummer-style-midi-break-in-your-daw) — the alternative, flatter ghost-note velocities
- [Velocity curve and ghost notes — Toontrack](https://www.toontrack.com/news/velocity-curve-and-ghost-notes/)
- [How to program authentic shaker patterns — MusicRadar](https://www.musicradar.com/tuition/tech/how-to-program-authentic-shaker-patterns-638625)
- [The Purdie Shuffle — MusicRadar](https://www.musicradar.com/news/bernard-purdie-shares-purdie-shuffle-notation-and-the-only-advice-you-need-to-play-it)
- [What is the one in Funk music?](https://www.howtowritebettersongs.com/what-is-the-one-in-funk-music/)
- [What BPM is Funk? — Mixgraph](https://www.mixgraph.io/bpm-for/funk), [songbpm.com](https://songbpm.com/) and [GetSongBPM](https://getsongbpm.com/) for the tempo table
