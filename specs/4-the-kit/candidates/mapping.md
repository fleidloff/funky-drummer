# V4 Track A, second turn — the file-by-file mapping

Fred picked MuldjordKit. This is every one of the 17 articulations resolved to a
named file, so Track C can build the pack without making a musical judgement.

**Headline:** 13 articulations from MuldjordKit, 4 imported, **0 substituted**,
**0 Freesound previews**. 24 files in total, all from originals over plain HTTPS.
Recommended constants: `rmsWindowMs = 100`, `targetRmsDb = -21.0`.

---

## Sources

| # | Source | Licence | Download |
| :-- | :-- | :-- | :-- |
| 1 | **MuldjordKit**, FreePats version | **CC-BY 4.0** | `https://github.com/freepats/muldjordkit/releases/download/2020-10-18/MuldjordKit-SFZ+WAV-20201018.7z` (223 MB) |
| 2 | **Versilian Community Sample Library (VCSL)** | **CC0 1.0** | `https://raw.githubusercontent.com/sgossner/VCSL/master/<path>` — per file, URL-encode spaces and commas |
| 3 | **FreePats World Percussion** | **CC0 1.0** | `https://github.com/freepats/world-percussion/releases/download/2020-09-05/WorldPercussion-SFZ+WAV-20200905.7z` (8.3 MB) |

Both `.7z` files extract with `bsdtar -xf <file> -C <dir>` — macOS ships bsdtar
with liblzma, so **no p7zip install is needed**.

**Attribution.** Only source 1 requires it. `docs/samples.md` needs this text,
and `spec.md`'s risk note about an in-app credit line applies to this one line
and nothing else:

> MuldjordKit by Lars Muldjord (www.muldjord.com, www.drumgizmo.org). FreePats
> version assembled by roberto@zenvoid.org. Licensed under CC BY 4.0 —
> https://creativecommons.org/licenses/by/4.0/

Sources 2 and 3 are CC0 and require nothing. Credit them anyway as a courtesy:
*Versilian Community Sample Library, Versilian Studios LLC (CC0)* and *FreePats
World Percussion, recorded by Xavimart, Gonzalo and Roberto (CC0)*.

---

## How the layer was chosen, for every row

MuldjordKit has 16 sampled dynamics per voice and nothing in the tech spec says
which one is a backbeat. **The kit answers the question itself.** Its SFZ file,
`MuldjordKit 20201018.sfz`, maps every sample to a MIDI velocity band. So the
rule is arithmetic, not taste:

1. Convert `docs/music.md` Part 4's level to MIDI velocity — `round(level × 127)`.

   | Level | Value | MIDI |
   | :-- | :-- | :-- |
   | Backbeat | 1.00 | 127 |
   | Accent | 0.85 | 108 |
   | Normal | 0.65 | 83 |
   | Ghost | 0.30 | 38 |

2. Read off the SFZ band that contains that velocity.
3. Take the middle member of that band's round-robin group.

Every "why" in the table below is that rule plus the one thing the rule cannot
decide.

### Why the layer is about the stroke and not the volume

The SFZ sets **`amp_veltrack=0`** in its `<global>` block. The sampler applies
*no* velocity-to-gain at all: the entire dynamic range of that kit lives in the
recordings themselves. Our build does the opposite — normalize every file to one
level, then multiply by velocity at play time.

So taking the vel-38 layer for `snare.ghost` does not buy a quiet file. It buys a
**stick that barely engages the wires**, and the 0.30 multiplier supplies the
level. That is exactly the argument `docs/music.md` closed: *"A velocity of 0.30
only produces a ghost note if the sample pack has a layer down there."* The layer
is the timbre; the multiplier is the volume. Normalization is what keeps the two
from being applied twice.

**Measured, to show the layer really is a different stroke and not a fader move:**
across `Snare1` layers 25 → 56 the energy above 5 kHz rises by 1.5 dB relative to
the full band while the peak rises 8.4 dB. The hard strokes are not just louder,
they are brighter. The ladder is real.

---

## The table

`M:` = MuldjordKit, path relative to `samples/` in the extracted archive.
`V:` = VCSL, path relative to the repo root.
`W:` = FreePats World Percussion, path relative to `samples/`.

| Articulation | Source file | Licence | Why this one |
| :-- | :-- | :-- | :-- |
| `kick.hard` | `M: KdrumL/25-KdrumL.wav` | CC-BY 4.0 | Top SFZ band (vel 123–127). **KdrumL, not KdrumR**: at the same layer it decays 30 dB in 120 ms against KdrumR's 210 ms, and carries 3.5 dB more energy above 5 kHz — the tighter, clickier of the kit's two kicks, which is Part 3's "damped short… a thud rather than a boom" |
| `kick.soft` | `M: KdrumL/19-KdrumL.wav` | CC-BY 4.0 | SFZ band vel 81–89, the normal-level (0.65) stroke. Same drum as `kick.hard`, so the pair is one kick played two ways |
| `snare.backbeat` | `M: Snare1/56-Snare.wav` | CC-BY 4.0 | Top SFZ band (vel 122–127) and the hardest stroke in the kit. Part 3 calls the backbeat the loudest note in the bar, so the extreme layer is the right one here and only here |
| `snare.normal` | `M: Snare1/45-Snare.wav` | CC-BY 4.0 | SFZ band vel 81–89 = normal 0.65 |
| `snare.ghost` | `M: Snare1/30-Snare.wav` | CC-BY 4.0 | SFZ band vel 36–44 contains ghost velocity 38. Peaks 6.3 dB below `snare.normal` and 6.3 dB below that again from the backbeat — a stroke the player actually pulled, not a scaled loud one |
| `snare.ghost` rr2 | `M: Snare1/25-Snare.wav` | CC-BY 4.0 | Same SFZ round-robin group. See the round-robin section — this one is weak and the reason is measured |
| `snare.ghost` rr3 | `M: Snare1/36-Snare.wav` | CC-BY 4.0 | Same group, top end of the ghost band |
| `snare.crossStick` | `V: Membranophones/Struck Membranophones/Snare Drum, Modern 2/Snare3M_Xstick_v2_rr1_Mid.wav` | **CC0** | A real cross-stick on a modern kit snare. Measured, it is a drum and not a woodblock: energy below 500 Hz sits only 3.6 dB under the full band, so the shell is speaking. Chosen over VCSL's `Snare4_Xstick` (6.5 dB quieter, shorter file) and over the rope-tension snare's sidestick, which is a gut-snare field drum |
| `snare.crossStick` rr2 | `V: …/Snare Drum, Modern 2/Snare3M_Xstick_v2_rr2_Mid.wav` | **CC0** | A second take of the same stroke, r = 0.45 against rr1. Not required by the spec, but free and genuine, and this articulation fires as the count-in on every play |
| `hihat.closed` | `M: HihatClosed/22-HihatClosed.wav` | CC-BY 4.0 | SFZ band vel 81–89 = normal 0.65 |
| `hihat.closed` rr2 | `M: HihatClosed/20-HihatClosed.wav` | CC-BY 4.0 | Same SFZ round-robin group, r = 0.11 against the primary — a genuinely different stroke |
| `hihat.closed` rr3 | `M: HihatClosed/24-HihatClosed.wav` | CC-BY 4.0 | Same group, r = 0.05 against the primary |
| `hihat.accent` | `M: HihatClosed/26-HihatClosed.wav` | CC-BY 4.0 | SFZ band vel 99–108 = accent 0.85. Same hats as `hihat.closed`, one band up: a harder stick, 3.5 dB more peak and 2.6 dB brighter, which is what an accent in a sixteenth line is |
| `hihat.open` | `M: HihatOpen/26-HihatOpen.wav` | CC-BY 4.0 | SFZ band vel 99–108. Part 2 writes the bark glyph `O` at accent level, so the open hat takes the accent band, not the normal one |
| `hihat.pedal` | `V: Idiophones/Struck Idiophones/Hi-Hat Cymbal/HiHat_Close_rr1_Mid.wav` | **CC0** | MuldjordKit has no foot chick. VCSL names this one `Close` alongside `HitC`, `HitO`, `HitOC` and `HitLoose`, so it is the pedal and not a stick stroke — and it measures like one: 6.8 dB more energy below 500 Hz than `HitC`, which is the pedal board and the two cymbals meeting rather than a stick tip. **Inferred from the name and that measurement, not from documentation — worth an ear** |
| `ride.bow` | `M: RideR/7-RideR.wav` | CC-BY 4.0 | SFZ band vel 80–95 = normal 0.65. **RideR, not RideL**: its bell is sampled with 8 layers against RideL's 3, so taking bow and bell from the right-hand cymbal keeps both articulations on one instrument |
| `ride.bell` | `M: RideRBell/7-RideRBell.wav` | CC-BY 4.0 | SFZ band vel 94–127. Part 2 writes the bell glyph `B` at accent level, so it takes the top band |
| `cowbell.hit` | `V: Idiophones/Struck Idiophones/Cowbells/Cowbell2_Normal_v3_rr1_Mid.wav` | **CC0** | MuldjordKit has no cowbell. Chosen over `Cowbell1_Hit_v3` on decay: 150 ms to −30 dB against 190 ms. Part 3 makes the cowbell a figure voice, and grooves 6 and 8 put bell notes on adjacent sixteenths — 156 ms apart at 96 BPM — so the shorter bell is the one that stays a figure instead of a drone. It is also the darker of the two (−20.1 dB above 5 kHz against −12.1), which is a mambo bell rather than an orchestral one |
| `shaker.hit` | `W: EggShaker/fast_01.wav` | **CC0** | MuldjordKit has no shaker. An egg shaker, not a maraca, so no instrument substitution is needed. **`fast`, not `slow` or `soft`**: 80 ms to −30 dB, so it clears well inside the 156 ms sixteenth it has to play at 96 BPM. `slow` rings 130 ms and would blur the grid |
| `shaker.hit` rr2 | `W: EggShaker/fast_02.wav` | **CC0** | Independent stroke, r = −0.06 against rr1 |
| `shaker.hit` rr3 | `W: EggShaker/fast_03.wav` | **CC0** | Independent stroke, r = +0.01 against rr1 |
| `toms.rack` | `M: Tom1/7-Tom1.wav` | CC-BY 4.0 | SFZ band vel 70–84 = normal 0.65. **Tom1, not Tom2 or Tom3**: measured fundamentals are Tom1 127 Hz, Tom2 98 Hz, Tom3 91 Hz, Tom4 71 Hz. Against a 71 Hz floor tom, Tom1 is a clear 0.84 octave up and Tom2 only 0.46 — a two-tom fill needs an interval you can hear, and Tom2 also sits only a third above the 74 Hz snare |
| `toms.floor` | `M: Tom4/15-Tom4.wav` | CC-BY 4.0 | SFZ band vel 81–89. The kit's only floor tom, and Part 3 makes it the kick's understudy — at 71 Hz it is the lowest drum after the kick |
| `crash.hit` | `M: CrashR/10-CrashR.wav` | CC-BY 4.0 | SFZ band vel 96–109 = accent 0.85. **CrashR, not CrashL**: 12 layers across 11 bands against CrashL's 9 across 6, so the right-hand crash is the better-sampled one and this is a voice the Feel control can never make busier anyway |

**24 files. 17 from MuldjordKit, 4 from VCSL, 3 from FreePats World Percussion.**

---

## Round robins: which ones are real

The coordinator asked whether adjacent velocity layers are an acceptable round
robin, or whether that just reintroduces the loudness difference the app controls.

**The loudness difference is not the problem.** Per-file normalization to
`targetRmsDb` removes it before any gain is applied, which is the whole point of
normalizing. What survives is the difference in *stroke*, and the honest question
is whether there is enough of it to be worth playing.

I measured it — waveform correlation between the layers, over the first 500 ms,
which is scale-invariant and so already describes the normalized files:

| Voice | Correlation between round-robin members | Verdict |
| :-- | :-- | :-- |
| **Hi-hat closed** | r = 0.05 – 0.13, at every spacing from 2 to 17 layers | **A real round robin.** Two cymbals rattling is a chaotic system; each layer is an independent stroke. Adjacent layers are as different as distant ones, so take the nearest neighbours in the SFZ's own group and keep the stroke consistent |
| **Egg shaker** | r = −0.06 to +0.02 between `fast_01/02/03` | **A real round robin.** Separately performed strokes |
| **Cross-stick** | r = 0.45 between `rr1` and `rr2` | **Real.** VCSL's own round-robin pair |
| **Snare** | **r = 0.87 – 0.93**, and it stays there at every spacing from 3 to 20 layers | **Weak.** See below |

### The snare ghost round robin is weak, and I recommend shipping it anyway

Snare layers correlate at about 0.90 with each other no matter how far apart they
are. The residual — the part that actually differs — is √(1 − 0.90²) ≈ 0.44 of
the signal, about 7 dB down. So three ghost files will take the edge off a
machine-gun repeat but will not hide it the way three hi-hat files will.

Why it happens is not worth guessing at; a close-miked snare is a far more
repeatable resonator than a pair of hi-hats, and 0.9 is a plausible number for
genuinely separate strokes on one. What matters is that **MuldjordKit does not
contain a strong ghost round robin and no amount of layer picking creates one.**

I checked the obvious escape route and it is closed. `Snare1` and `Snare2` look
like two sample sets of one drum — same 56 layers, byte-for-byte identical file
lengths at every layer — but they correlate at **r = −0.29 to −0.31**. A negative
correlation with identical lengths means one performance captured twice, out of
phase, and the kit's own README says what that is:

> *"There are phasing issues between the snare top and bottom microphones, so
> remember to phase reverse one of them."*

**`Snare1` is the top mic and `Snare2` is the bottom mic of the same stroke.**
Alternating them is not a round robin, it is a mic change every note, and where a
ghost rings into a backbeat the two would partially cancel. `Snare2` is also
8.5 dB brighter above 5 kHz — all wire buzz, little shell — which is what a
bottom mic sounds like.

**So: all four snare articulations come from `Snare1`, the top mic.** Ship the
three ghost files from its own velocity band and record in `docs/samples.md` that
they correlate at r ≈ 0.90 and are a weak round robin. That is a measurable,
checkable statement, and it is better than a silent compromise.

**One option I am deliberately not taking.** The README's phase-reverse note
invites blending top and bottom into a fuller snare. That is a real mixing move
and it would probably improve the snare. It is also an audible decision nobody in
this pipeline can check, and it adds a build step. If Fred wants it, it is
`ffmpeg`-cheap to try — but it should be a listening decision, not something
Track C does quietly.

---

## Editing guidance for Track C

These are the lengths, and they are musical rather than arbitrary. A sixteenth at
96 BPM is **156 ms**, and that is the number most of them are set against.

| Voice | Trim from onset | Fade out | Why |
| :-- | :-- | :-- | :-- |
| kick | 450 ms | 60 ms | Decays to −30 dB in 120 ms; the rest is tail |
| snare (all) | 450 ms (backbeat 500) | 60 ms | −30 dB by 140–190 ms |
| cross-stick | 300 ms | 50 ms | −30 dB by 170 ms |
| hi-hat closed, accent | 250 ms | 40 ms | −30 dB by 120–140 ms, inside one sixteenth |
| **hi-hat open** | **300 ms** | **80 ms** | Rings 640 ms untrimmed — over four sixteenths. Part 3: an open note must be closed on the next step *"or it stops being a bark and becomes a wash"*. 300 ms lets it bleed under the following closed hat and then stop |
| hi-hat pedal | 250 ms | 40 ms | |
| ride bow | 1200 ms | 200 ms | Rings 2.9 s untrimmed |
| ride bell | 1000 ms | 150 ms | |
| cowbell | 500 ms | 60 ms | |
| shaker | 250 ms | 40 ms | |
| toms | 800 ms | 120 ms | |
| crash | 2000 ms | 400 ms | Fires once per phrase at most, so it can afford to be the longest file |

Total audio ≈ **12.1 s** across 24 files. At mono 44.1 kHz Ogg Vorbis around
q3 that is roughly 120 KB, inside `spec.md`'s ~250 KB budget with room for a
higher quality setting if Track C wants it.

**Trim before normalizing**, not after — `docs/music.md` Part 3 normalizes the
shipped file, and a file with four seconds of silence on the end measures
differently from the same hit without it.

**One thing a sample edit cannot fix, named so it is not mistaken for an
oversight.** Trimming the open hat to 300 ms is a compromise. The real fix is for
the transport to cut the open-hat voice when the next hi-hat note fires — a choke
group. That is an engine feature and not this change; it belongs in
`specs/features.md` if Fred wants it.

---

## The two constants

Both are derived from the 24 files above, measured with a 100 ms window anchored
on each file's onset (first sample reaching 2% of the file's peak).

### `rmsWindowMs = 100`

The binding constraint is that the window must fit inside the shortest shipped
file. Measured:

* **Shortest file in the set: 276 ms** — `EggShaker/fast_01.wav`, untrimmed.
* Latest onset in the set: **11.3 ms** — `HiHat_Close_rr1_Mid.wav`. The VCSL files
  carry 8–11 ms of lead-in; every MuldjordKit file starts within 0.4 ms.
* So the worst case window ends at **111 ms into a 276 ms file** — 165 ms of margin.

100 ms is also long enough to be worth measuring. At 100 ms a 34 Hz kick
fundamental has completed three cycles, so the window catches the body of the
note and not only its transient. Anything much shorter measures the attack, which
would rate a kick loud and a cymbal quiet regardless of how they sound.

**The invariant Track C has to hold:** no shipped file may be shorter than
**150 ms from its onset**. Every trim in the table above satisfies that with at
least 100 ms to spare.

### `targetRmsDb = -21.0`

Normalizing a file *up* to the target raises its peak by the same amount, so the
target must sit far enough below 0 dBFS that the worst crest factor still fits:

```
targetRmsDb  ≤  -1 dBFS  -  max(peak_dBFS - rms_dBFS) over the shipped set
```

Measured crest factors over the 24 files run from **9.4 dB** (`Tom4/15`) to
**19.7 dB** (`EggShaker/fast_01`). So:

```
targetRmsDb  ≤  -1.0 - 19.69  =  -20.69 dBFS
```

Rounded down to **−21.0 dBFS**, which leaves the worst file peaking at
−21.0 + 19.69 = **−1.31 dBFS** and every other file lower. No file clips.

**State the rule, not only the number.** If Track C changes any file in the set —
a different round-robin member, a different trim that moves the onset — the max
crest can move and the target has to be re-derived from the same arithmetic. The
number is a consequence of the file set, not a constant of the universe.

**One thing this does not cover, and should not be mistaken for covering it.**
`targetRmsDb` stops any single *file* clipping. It says nothing about what happens
when the kick, the snare and the hi-hat land on the same step and their peaks
coincide — at gains 1.00, 0.89 and 0.40 that sums to a theoretical 2.3× and would
clip. That is the transport's headroom, not the pack's, and it wants a master
trim somewhere in the signal path. Flagging it; not fixing it here.

---

## Substitutions

**None.** Every one of the 17 articulations resolves to a real recording of that
articulation. No `substituted` entry is needed in the manifest, and the four rows
MuldjordKit does not cover are filled by imports rather than by mapping onto a
neighbour.

`spec.md`'s question about what a substituted `snare.crossStick` would cost is
therefore moot, but the answer is worth writing down in case a later change
reopens it: it fires as the count-in on **every single play**, so it is the first
thing a user hears every time. Mapped onto `snare.normal` it would be a snare
backbeat pretending to be a stick click — loud, ringing, and indistinguishable
from the groove that follows it, which defeats the reason `spec.md` chose a
cross-stick count-in in the first place ("unmistakably not the groove"). It is the
one row where a substitution would have been most visible to the user and least
defensible, and it is the row that turned out to be fillable.

---

## What still needs an ear

Nothing in this document has been heard. Three rows carry a real risk that a
measurement cannot close:

1. **`snare.backbeat`.** This was the open question when Fred picked the kit and
   it still is. MuldjordKit has no declared rimshot; `Snare1/56` is the hardest
   centre stroke in a kit its own author calls "a metal or rock kit". If it does
   not crack, this row is the one to change.
2. **`hihat.pedal`.** That VCSL's `HiHat_Close` is a foot chick is an inference
   from its name and from 6.8 dB more low-frequency content than the stick stroke.
   It is very likely right and it is not proven.
3. **The four imports against the thirteen.** Normalization equalises level and
   not ambience. A cross-stick, a foot chick, a cowbell and an egg shaker from two
   other rooms sitting in a MuldjordKit groove is the risk `tech-spec.md` recorded,
   and it is exactly the kind of thing that only shows up on playback.

All three are cheap to re-decide: each is one filename in the manifest.
