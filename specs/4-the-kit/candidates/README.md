# V4 Track A — the shortlist

Three candidate kits, one render each, same figure, loudness-matched. Play them
back to back and pick one. Nothing here has been heard by anything; every claim
below is either theory, a licence, or a number I measured.

The four `.wav` renders are 2 MB, five times the shipped pack, and they are
committed on purpose: they are how the pack was chosen and how the next change
to it gets judged. Decided 2026-09-17.

## How to listen

```bash
afplay specs/4-the-kit/candidates/black-beauty.wav
afplay specs/4-the-kit/candidates/bop-room.wav
afplay specs/4-the-kit/candidates/muldjord.wav
```

The three questions worth holding while you do:

1. **Does the backbeat crack?** `docs/music.md` Part 3 calls it "the loudest note
   in the bar" and wants a rimshot. Two of the three are declared rimshots; one
   is not.
2. **Can you hear the ghost notes as ghost notes** — felt, dull, separate from
   the backbeat — rather than as a quiet backbeat?
3. **Do the sixteenth hats read as sixteen separate notes**, or do they smear
   into a wash?

## What the render is

The two-bar loop is groove **2 — Funky Drummer** from `docs/music.md` Part 2,
played twice:

```
             1 e + a 2 e + a 3 e + a 4 e + a
hihat        x x x x x O x x x x x x x O x x
snare        . . . o # . . o . o o . # . o o
kick         # . x . . . . . X . . x . . . .
```

96 BPM, **straight** (swing 50%, not the app's 54% default — a kit test should
not have a feel baked into it), no humanize, no Feel filter, no fills.

It uses `docs/music.md` Part 4 velocities — `#` 1.00, `X` 0.85, `x` 0.65,
`o` 0.30, `O` 0.85 — and the Part 3 gains: kick 1.00, snare 0.89, hi-hat 0.40.
So what you hear **is the model**, not a mix I made up. If the hats sound far
back, that is −8 dB doing what −8 dB does, and it is one of the open questions
in `docs/music.md`.

One liberty, stated: the hi-hat plays `hihat.accent` on the four quarter notes
and `hihat.closed` elsewhere. Same notes, same grid — it only decides which of
two recordings sounds, and it puts the accent articulation in earshot. Part 1
("Accents — steady sixteenths with a quarter-note accent pattern laid over
them") is the authority for doing it that way.

### How it was built

Per sample: trim to the hit, fade out, then normalize that one file — the order
`docs/music.md` Part 3 asks for. Then mix at fixed sample offsets.

```bash
# 1. trim + fade, per sample
ffmpeg -i <src> -ac 1 -ar 44100 -t <keep> \
       -af afade=t=out:st=<keep-fade>:d=<fade> <art>.wav

# 2. one volume per file so every file lands on the same measured level,
#    then one adelay per hit, summed
ffmpeg -i a.wav -i b.wav ... -filter_complex \
  "[0:a]volume=G0,adelay=0S[h0];[1:a]volume=G1,adelay=6891S[h1];...
   [h0][h1]...amix=inputs=56:normalize=0:duration=longest[out]" \
  -map "[out]" -t 5.7 -ar 44100 -ac 1 -c:a pcm_s16le out.wav

# 3. all three renders matched to one integrated level
ffmpeg -i out.wav -af volume=<T - I>dB final.wav
```

A sixteenth at 96 BPM is 156.25 ms = 6890.625 samples, so `adelay` is given in
samples (`S`), not milliseconds. Rounded to milliseconds the grid would have
drifted 7.75 ms by the end of bar 2.

**Measured placement:** onsets in `black-beauty.wav` land within **±0.5 ms** of
the 96 BPM grid, mean −0.1 ms, with no accumulation across the two bars. That is
the resolution of my detector, not a bound on ffmpeg — it is here only to say
the renders are not the thing under test. The kits are.

**Measured loudness:** all three are at **−23.5 LUFS integrated**, peaks −2.7,
−2.5 and −1.0 dBFS. They are level-matched on purpose, so the comparison is
about character and not about which one is loudest.

---

## Candidate A — `black-beauty.wav`

**Source:** [pjcohen on Freesound](https://freesound.org/people/pjcohen/) —
a single contributor's close-miked studio library.
**Licence:** every file in this render is **CC0**.

| Articulation | File | ID | Licence |
| :-- | :-- | :-- | :-- |
| `kick.hard` | Stereo Processed Bass Kick Drum 2 | [46528](https://freesound.org/s/46528/) | CC0 |
| `kick.soft` | Stereo Processed Bass Kick Drum 1 | [46527](https://freesound.org/s/46527/) | CC0 |
| `snare.backbeat` | Ludwig Black Beauty Closed Rimshot | [46564](https://freesound.org/s/46564/) | CC0 |
| `snare.normal` | Ludwig Black Beauty Snare Drum | [46566](https://freesound.org/s/46566/) | CC0 |
| `snare.ghost` | **Ludwig Black Beauty Ghost Notes** | [46567](https://freesound.org/s/46567/) | CC0 |
| `snare.crossStick` | — | — | **not covered** |
| `hihat.closed` | Zildjian A Custom Closed Hit | [45664](https://freesound.org/s/45664/) | CC0 |
| `hihat.accent` | Zildjian A Custom Loose Hit | [45666](https://freesound.org/s/45666/) | CC0 |
| `hihat.open` | Zildjian A Custom Open Hit | [45667](https://freesound.org/s/45667/) | CC0 |
| `hihat.pedal` | Zildjian A Custom Pedal Chic | [45668](https://freesound.org/s/45668/) | CC0 |
| `ride.bow` | K Zildjian Istanbul 20″ Bow | [93905](https://freesound.org/s/93905/) | CC0 |
| `ride.bell` | K Zildjian Istanbul 20″ Bell | [93904](https://freesound.org/s/93904/) | CC0 |
| `cowbell.hit` | `cowbell_strike_01…26` | [382805–382830](https://freesound.org/people/pjcohen/packs/21519/) | CC-BY 4.0 |
| `shaker.hit` | `Maraca_High_Shake_Velocity_01…25` | [414615–414653](https://freesound.org/people/pjcohen/packs/23371/) | CC-BY 4.0 |
| `toms.rack` | Rogers Dayton Era Bop Tom Rack 12×8 | [150487](https://freesound.org/s/150487/) | CC-BY 4.0 |
| `toms.floor` | Rogers Dayton Era Bop Tom Floor 14×14 | [150488](https://freesound.org/s/150488/) | CC-BY 4.0 |
| `crash.hit` | Skiba 18″ Edge | [146907](https://freesound.org/s/146907/) | CC-BY 4.0 |

**Coverage: 16 of 17.** Everything but `snare.crossStick`. The CC0 core covers
kick, snare, hi-hat and ride — 12 rows — and four rows (cowbell, shaker, toms,
crash) need CC-BY 4.0 files from the same contributor.

**Round-robins.** `snare.ghost` ×1 only. `hihat.closed` ×1 only. `shaker.hit`
×25 velocity-graded maraca shakes, more than enough. So two of the three
round-robin rows the spec asks for are unfilled here, and the spec's own rule
("the manifest maps it to the nearest real articulation") does not help: a
round-robin of one file is just one file.

**Judgement.** This is the closest thing on the shortlist to the record. The
snare is a Ludwig Black Beauty — `docs/music.md` Part 3 wants a rimshot backbeat
and this is the rimshot, from the drum most funk records were cut on, and the
same drum supplies the normal stroke and the ghost. Measured, the rimshot decays
30 dB in **70 ms** and the normal stroke in **120 ms**: dry and damped, which is
what Part 3 asks for, and short enough that ghost notes three sixteenths apart
do not pile up. The ghost file is the strongest single argument for this
candidate — it peaks at **−17.9 dBFS in a session where the other three snare
files all peak at 0.0 dBFS**, so it is a genuinely quiet stroke captured at its
performed level, not a normalized loud one. That is exactly the layer
`docs/music.md` closed the argument on. The weak point is the kick: "Stereo
Processed" means an unknown chain, it is the only stereo file in an otherwise
mono set, and at **190 ms to −30 dB** it is the longest of the three kicks I
would actually ship. The other weak point is that the hats are Zildjian A
Customs — a bright modern cymbal, not a 1969 one. Whether that reads as funky or
as a modern kit playing funk is the thing I cannot tell you.

---

## Candidate B — `bop-room.wav`

**Source:** same library, different picks — a vintage-shell kick, the open
rimshot, and the other hi-hat pair.
**Licence:** CC0 except the kick (CC-BY 4.0).

| Articulation | File | ID | Licence |
| :-- | :-- | :-- | :-- |
| `kick.hard` | Slingerland 70s Bop Kit Kick 20×14 | [150813](https://freesound.org/s/150813/) | CC-BY 4.0 † |
| `kick.soft` | Rogers Dayton Era Bop Kit Kick 20×14 | [150489](https://freesound.org/s/150489/) | CC-BY 4.0 |
| `snare.backbeat` | Ludwig Black Beauty **Open** Rimshot | [46565](https://freesound.org/s/46565/) | CC0 |
| `snare.normal` | Ludwig Black Beauty Snare Drum | [46566](https://freesound.org/s/46566/) | CC0 |
| `snare.ghost` | Ludwig Black Beauty Ghost Notes | [46567](https://freesound.org/s/46567/) | CC0 |
| `snare.crossStick` | — | — | **not covered** |
| `hihat.closed` | Skiba Custom Hats Closed Bow Tip | [93908](https://freesound.org/s/93908/) | CC0 |
| `hihat.accent` | Skiba Custom Hats Closed Edge Shank | [93909](https://freesound.org/s/93909/) | CC0 |
| `hihat.open` | Skiba Custom Hats Full Open Tip | [93912](https://freesound.org/s/93912/) | CC0 |
| `hihat.pedal` | Skiba Custom Hats Foot Pedal Close | [93910](https://freesound.org/s/93910/) | CC0 |
| `ride.bow` / `ride.bell` | K Zildjian Istanbul 20″ | [93905](https://freesound.org/s/93905/) / [93904](https://freesound.org/s/93904/) | CC0 |
| `cowbell.hit` | `cowbell_strike_01…26` | [382805–382830](https://freesound.org/people/pjcohen/packs/21519/) | CC-BY 4.0 |
| `shaker.hit` | Maraca shakes ×25 | [414615–414653](https://freesound.org/people/pjcohen/packs/23371/) | CC-BY 4.0 |
| `toms.rack` / `toms.floor` | Slingerland 70s Bop Kit | [150811](https://freesound.org/s/150811/) / [150812](https://freesound.org/s/150812/) | CC-BY 4.0 † |
| `crash.hit` | Skiba 18″ Edge | [146907](https://freesound.org/s/146907/) | CC-BY 4.0 |

† Licence read from a neighbouring file in the same upload batch, not from the
file's own page — Freesound cut me off before I could confirm each one. Track C
must check these three individually before shipping them.

**Coverage: 16 of 17.** Same gap as A.

**Round-robins.** `hihat.closed` has a real pair here — bow tip and edge shank
are two different strokes on the same pair of hats, which is what a round-robin
is for. `snare.ghost` is still ×1.

**Judgement.** This exists to test one thing: whether a vintage shell beats a
processed one. The Slingerland 70s bop kick is a 20×14 — the small, high-tuned
shell `docs/music.md` Part 3 describes — and the Skiba hats are the driest thing
I measured anywhere, **90 ms to −30 dB**, comfortably inside a 156 ms sixteenth,
so the one-handed sixteenth line should read as sixteen separate notes rather
than a wash. Against that, the kick measures **350 ms to −30 dB** against
Candidate A's 190 ms and Candidate C's 120 ms. Part 3 wants "a thud rather than
a boom", and 350 ms of ring at 96 BPM is more than two sixteenths of tail, which
is the wrong shape for a kick that is supposed to leave room for a bass player.
I checked the Rogers bop kick too and it is worse — **740 ms**, an undamped
front head, not a funk sound at all. The open rimshot is a deliberate contrast
with A's closed one: more ring, more crack, and possibly too much of both.

---

## Candidate C — `muldjord.wav`

**Source:** [MuldjordKit, FreePats
project](https://freepats.zenvoid.org/Percussion/acoustic-drum-kit.html) —
recorded by Lars Muldjord in 2010, assembled for FreePats by roberto@zenvoid.org.
Download:
`https://github.com/freepats/muldjordkit/releases/download/2020-10-18/MuldjordKit-20201018.h2drumkit`
(137 MB, gzip tar, FLAC).
**Licence:** **CC-BY 4.0**, one line covers the whole kit.

**This is the only candidate that is one kit, recorded in one room, in one
session.** 16 velocity layers per voice.

| Articulation | File | Covered |
| :-- | :-- | :-- |
| `kick.hard` | `25-KdrumL.flac` | ✓ |
| `kick.soft` | `8-KdrumL.flac` (real velocity layer) | ✓ |
| `snare.backbeat` | `53-Snare.flac` — **not a declared rimshot** | ✓ substituted |
| `snare.normal` | `30-Snare.flac` | ✓ |
| `snare.ghost` | `5-Snare.flac` (real velocity layer) | ✓ |
| `snare.crossStick` | `SnareRest` is a rest stroke, not a cross-stick | **not covered** |
| `hihat.closed` | `HihatClosed`, 16 layers | ✓ |
| `hihat.accent` | a higher `HihatClosed` layer | ✓ |
| `hihat.open` | `HihatOpen`, 16 layers | ✓ |
| `hihat.pedal` | no foot chick in the kit | **not covered** |
| `ride.bow` | `RideL` / `RideR` | ✓ |
| `ride.bell` | `RideLBell` / `RideRBell` | ✓ |
| `cowbell.hit` | — | **not covered** |
| `shaker.hit` | — | **not covered** |
| `toms.rack` | `Tom1` / `Tom2` | ✓ |
| `toms.floor` | `Tom3` / `Tom4` | ✓ |
| `crash.hit` | `CrashL` / `CrashR` | ✓ |

**Coverage: 13 of 17 from the kit itself.** The four gaps and where they come
from:

| Gap | Fill from | Licence |
| :-- | :-- | :-- |
| `hihat.pedal` | pjcohen [45668](https://freesound.org/s/45668/) or [93910](https://freesound.org/s/93910/) | CC0 |
| `cowbell.hit` | pjcohen [`cowbell_strike_01…26`](https://freesound.org/people/pjcohen/packs/21519/) | CC-BY 4.0 |
| `shaker.hit` | pjcohen [Maraca shakes ×25](https://freesound.org/people/pjcohen/packs/23371/) | CC-BY 4.0 |
| `snare.crossStick` | nothing confirmed — see below | — |

**Round-robins.** All three rows are fillable, but with an honest caveat: what
MuldjordKit has is **velocity layers, not round-robins**. Adjacent layers of the
same drum are different recordings, so using layer 24 and layer 26 as a pair on
`hihat.closed` does stop the machine-gun repeat, and it is what the spec asks
for in effect. It is not the same thing as two takes at the same dynamic, and
the manifest should not pretend it is.

**Judgement.** The structural case for this one is the strongest on the list. It
is one kit in one room, so the "assembled from several packs does not sound like
one room" risk in the tech spec applies to only four of the seventeen rows, and
those four — a foot chick, a cowbell, a shaker, a click — are the voices whose
ambience matters least. Its ghost note is not a found file, it is the bottom of
the same drum's own velocity ladder: **`5-Snare` peaks at −18.7 dBFS against
`53-Snare` at −0.9 dBFS**, a 17.8 dB spread across the same instrument, which is
what `docs/music.md` closed the ghost argument asking for, and the same ladder
hands us `kick.soft` for nothing. It is also, measurably, the driest kick on the
shortlist: **120 ms to −30 dB**, against 190 ms and 350 ms — closest to Part 3's
"damped short, a thud rather than a boom". What it does not have is a rimshot.
`docs/music.md` Part 3 calls the funk backbeat a rimshot and the Articulations
table calls it "the loudest thing in the bar"; the hardest Muldjord snare layer
is a hard centre stroke, and a hard centre stroke is not a rimshot — it is
rounder, lower and less pitched. That is the one thing I would listen for above
everything else. The second thing is the closed hat: at **150 ms to −30 dB**
against a 156 ms sixteenth, it sits right on the line where sixteenths stop
being separate notes.

---

## My pick, and what would change it

**Candidate C, `muldjord.wav`** — with `hihat.pedal`, `cowbell.hit` and
`shaker.hit` imported from pjcohen.

Three reasons, in order of weight:

1. **It is one kit.** Thirteen of seventeen rows come from one drummer, one
   room, one afternoon. Normalization equalises level and not ambience, and no
   amount of build tooling fixes a snare that was recorded somewhere the kick
   was not.
2. **The ghost note and the soft kick are the same instrument as the loud one.**
   A 17.8 dB velocity ladder on the snare and a matching one on the kick means
   `snare.ghost` and `kick.soft` are free and genuinely correct, rather than
   found separately and hoped to match.
3. **The kick measures right.** 120 ms to −30 dB is the only one of the three
   that is unambiguously "damped short".

**What would flip me to `black-beauty`:** the backbeat. If C's hardest snare
layer does not crack — if it reads as a loud tom rather than as the loudest
event in the bar — then the groove has lost the thing funk is built on, and A's
Ludwig Black Beauty rimshot wins on the one articulation that matters most. It
is also the all-CC0 option, which removes the attribution question entirely.
I cannot hear which it is. **You can, and that is the whole point of this gate.**

**A third possibility, if neither wins outright:** take Muldjord whole and
replace only the snare with the pjcohen Black Beauty set (backbeat + normal +
ghost, three files, all CC0, all the same drum). The snare is the voice that
most needs to be a rimshot and the voice a listener least expects to share a
room with the cymbals. It costs one mismatched ambience on one voice. Worth
trying only if C's problem turns out to be the snare and nothing else.

---

## What no candidate covers

**`snare.crossStick`.** Not one of the three has a confirmed cross-stick, and it
is not a row the app can skip quietly — `spec.md` decided the cross-stick
doubles as the count-in click, so it fires every time you press play.

What I know:

* pjcohen has [`dry_snare_rim_01…13`](https://freesound.org/people/pjcohen/packs/21517/)
  (IDs 382783–382804, CC-BY 4.0) — thirteen variants of something struck on the
  rim of a dry snare. Whether "rim" there means a rimshot or a rim click I could
  not establish; Freesound cut my access before I got the descriptions. **This is
  the first thing to check**, because if they are rim clicks the row is filled
  with thirteen round-robins from the same library as everything else.
* MuldjordKit's `SnareRest` is, on the name, a rest stroke rather than a
  cross-stick.

If `dry_snare_rim` turns out to be rimshots, the row needs a targeted hunt and
the fallback under `spec.md`'s own rule is a substitution onto `snare.normal` —
which would be wrong musically, because Part 3 puts the cross-stick in a quiet
verse and `snare.normal` is not quiet. I would rather leave the row open and
hunt again than substitute this one.

---

## Two findings Track B and Track C need before they start

**1. The tech spec's loudness test does not work on one-shots.** Track B's red
test 7 says `ffmpeg -af ebur128` must report integrated loudness within ±0.5 LU
of `targetLufs` for every file. EBU R128 integrates in **400 ms blocks** with an
absolute gate at −70 LUFS and a relative gate at −10 LU. The Black Beauty closed
rimshot is **100 ms long**; several hi-hat and snare files are under 400 ms.
Integrated loudness is undefined for them — ffmpeg will return −inf or a number
produced by one partial block, and the test will fail on correct files or pass
on wrong ones.

The measurement has to be one that is defined on a 100 ms file. The two honest
options are **RMS over a fixed window from the onset** (what I used for these
renders — same window for every file, so the numbers are comparable) or **true
peak**. RMS is the better proxy for how loud a one-shot sounds; peak is easier
to defend but rewards a sample with a spike and a quiet body. Either way
`targetLufs` in the `Kit` contract is then the wrong name for the field, and the
test should measure what the build actually normalized to.

**This is a decision for Fred, not one I should make inside a listening note** —
it changes a frozen contract field. Flagging it, not fixing it.

**2. These renders are built from Freesound's preview transcodes, not the
originals.** Downloading the source WAV needs a Freesound account, and
unauthenticated bulk access is rate-limited — I was cut off after about twenty
files and then blocked site-wide. The previews are Ogg Vorbis at roughly
110 kbps. **That is fine for choosing a kit and not fine for shipping one**:
transcoding a preview to the shipped Ogg is generation loss on top of generation
loss. Track C needs a Freesound login and the original WAVs. Everything on this
page — decay times, peak levels, licences — was measured on the previews and
should hold, but the shipped files must not be these files.

It is also why the coverage tables above name some files I never downloaded. Those
rows are sourced by ID and licence, and heard by nobody.

---

# What shipped

`shipped.wav` is the pack that is actually in `public/samples/`, playing. It was
built from those 24 files and nothing else.

**It is not the file Fred approved.** `muldjord.wav` was a shortlist render: it
predates the four imports and it used provisional velocity layers picked before
the SFZ velocity bands were read. So `spec.md`'s D1 — *that the pack sounds like
James Brown needs an ear* — is still open, and this is the file that closes it.

```bash
afplay specs/4-the-kit/candidates/shipped.wav     # what is in public/samples/
afplay specs/4-the-kit/candidates/muldjord.wav    # what was approved
```

Both are loudness-matched to **−23.5 LUFS integrated**, so any difference you
hear is character and not level.

## What is in it

One bar of count-in, then two bars of groove **2 — Funky Drummer** from
`docs/music.md` Part 2, at 96 BPM, straight, no humanize, no Feel filter, no
fills. 92 hits.

* **Count-in** — four quarter notes on `snare.crossStick`, beat 1 at backbeat
  level and 2–4 at normal, alternating the two round-robin files. This is what
  `spec.md` decided fires on every single play, so it is the first thing you
  hear here too.
* **Kick, snare and hi-hat** — the same figure and the same numbers as the three
  shortlist renders, so the comparison against `muldjord.wav` is like for like.
* **Round robins rotating**, which is the whole reason those files exist and the
  one thing a single-sample render cannot show: `hihat.closed` across 20 hits,
  `snare.ghost` across 12, `shaker.hit` across 32.
* **One deliberate difference from `muldjord.wav`: the shaker plays sixteenths**,
  accented on the beat. `docs/music.md` Part 4 has the drummer add exactly this
  at Feel 0.75, and without it an imported voice would have stayed silent and
  unauditioned. At −12 dB it sits under the comparison rather than across it.

**Five rows do not sound in this figure** — `cowbell.hit`, `hihat.pedal`,
`ride.bow`, `ride.bell`, `toms.rack`, `toms.floor` and `crash.hit` have no notes
in Funky Drummer. Two of those are imports, so audition them on their own:

```bash
afplay public/samples/hihat/pedal.ogg
afplay public/samples/cowbell/hit.ogg
```

## What I measured, so it is clear what is not in question

* **Normalization holds.** I re-measured all 24 shipped files independently:
  onset-anchored 100 ms RMS spans **−21.10 to −20.91 dBFS**, a 0.19 dB spread
  against a −21.0 target. Worst crest factor is 19.36 dB, so the hottest file
  peaks at −1.72 dBFS. Nothing clips, and the shortest file is 244 ms against
  the 150 ms floor.
* **The ghost layers are now a timbre difference and nothing else.** After
  normalization `ghost-1/2/3` peak within 0.7 dB of each other, where as
  recorded they were 6.3 dB apart. The level is gone, the stroke is what is
  left, and the 0.30 multiplier supplies the volume — which is the mechanism
  `docs/music.md` closed the ghost argument on, now visible in the numbers.
* **Placement is exact by construction** — every hit is an integer sample offset
  from the start. Detected onsets land **−0.7 to +1.5 ms** from the 96 BPM grid,
  mean −0.2 ms, with the count-in on 0.000 / 0.625 / 1.250 / 1.875 s and the
  groove entering at 2.4998 s. The render is not what is under test; the kit is.

## The three questions that need your ear

Everything above is a measurement. These three are not, and each is one filename
in `src/lib/kit/manifest.ts` to change.

**1. `snare.backbeat` — does it crack?**
MuldjordKit has no rimshot. `backbeat.ogg` is the hardest centre stroke in a kit
its own author calls "a metal or rock kit", and `docs/music.md` Part 3 wants the
funk backbeat to be a rimshot and "the loudest note in the bar". Listen on beat 2
and beat 4: does it arrive as the loudest *event*, or as a round, low thud that
the kick could have made? **If it is wrong,** the fix is the pjcohen Ludwig Black
Beauty closed rimshot — CC0, measurably drier at 70 ms to −30 dB against this
one's 190 ms — and you can hear it in `black-beauty.wav` above. It costs one
mismatched room on the one voice that most needs to be right.

**2. `hihat.pedal` — is it a foot, or a stick?**
Nothing documents what VCSL's `HiHat_Close` is. I inferred a foot chick from its
name sitting alongside `HitC`/`HitO`/`HitOC`/`HitLoose`, and from it carrying
6.8 dB more energy below 500 Hz than the stick stroke — the pedal board and two
cymbals meeting rather than a tip. Play `public/samples/hihat/pedal.ogg` on its
own: a chick is a short dull clamp with no stick attack on the front of it.
**If it is a stick,** VCSL's `HiHat_HitOC` is the other candidate in that folder;
it is a one-line swap and it stays CC0.

**3. The four imports — do they sound like the same room?**
`snare.crossStick`, `hihat.pedal` and `cowbell.hit` come from VCSL and
`shaker.hit` from FreePats World Percussion, into thirteen rows recorded in one
afternoon in Lars Muldjord's room. Normalization equalised their level and did
nothing to their ambience — that is the risk `tech-spec.md` recorded and the one
thing no test in this change can reach. The two you can hear in the render are
the count-in and the shaker: does the count-in sound like it is in front of the
kit rather than in it, and does the shaker float on top instead of sitting in?
**If either is wrong,** the honest fix is a drier import or a touch of the same
trim, not a gain change — level is already equal and level is not the problem.
