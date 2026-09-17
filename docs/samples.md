# The sample pack

24 files under `public/samples/`, covering all 17 articulations of
[music.md](music.md) Part 3. Mono Ogg Vorbis at 44.1 kHz, 236 KB in total.
Every file is an honest recording of the articulation it is named for —
**nothing is substituted**, so `manifest.ts` carries no `substituted` entry.

Built from `specs/4-the-kit/candidates/mapping.md`, which holds the reasoning
behind every row: why that kit, that velocity layer and that trim length.

## Sources

| Source | Licence | Download |
| :-- | :-- | :-- |
| **MuldjordKit**, FreePats version | CC BY 4.0 | [`MuldjordKit-SFZ+WAV-20201018.7z`](https://github.com/freepats/muldjordkit/releases/download/2020-10-18/MuldjordKit-SFZ+WAV-20201018.7z) |
| **Versilian Community Sample Library** | CC0 1.0 | [`sgossner/VCSL`](https://github.com/sgossner/VCSL) — per file, over `raw.githubusercontent.com` |
| **FreePats World Percussion** | CC0 1.0 | [`WorldPercussion-SFZ+WAV-20200905.7z`](https://github.com/freepats/world-percussion/releases/download/2020-09-05/WorldPercussion-SFZ+WAV-20200905.7z) |

### Attribution

Only MuldjordKit requires it. This is the text:

> MuldjordKit by Lars Muldjord (www.muldjord.com, www.drumgizmo.org). FreePats
> version assembled by roberto@zenvoid.org. Licensed under CC BY 4.0 —
> https://creativecommons.org/licenses/by/4.0/

The other two are CC0 and require nothing. Credited as a courtesy:

> Versilian Community Sample Library, Versilian Studios LLC (CC0).
>
> FreePats World Percussion, recorded by Xavimart, Gonzalo and Roberto (CC0).

## The files

`M:` is a path inside the MuldjordKit archive, `W:` inside the World Percussion
archive, both relative to `samples/`. `V:` is a path in the VCSL repository,
fetched from `https://raw.githubusercontent.com/sgossner/VCSL/master/` with
spaces and commas percent-encoded.

| Shipped file | Articulation | Source | Licence |
| :-- | :-- | :-- | :-- |
| `/samples/kick/hard.ogg` | `kick.hard` | `M: KdrumL/25-KdrumL.wav` | CC BY 4.0 |
| `/samples/kick/soft.ogg` | `kick.soft` | `M: KdrumL/19-KdrumL.wav` | CC BY 4.0 |
| `/samples/snare/backbeat.ogg` | `snare.backbeat` | `M: Snare1/56-Snare.wav` | CC BY 4.0 |
| `/samples/snare/normal.ogg` | `snare.normal` | `M: Snare1/45-Snare.wav` | CC BY 4.0 |
| `/samples/snare/ghost-1.ogg` | `snare.ghost` | `M: Snare1/30-Snare.wav` | CC BY 4.0 |
| `/samples/snare/ghost-2.ogg` | `snare.ghost` | `M: Snare1/25-Snare.wav` | CC BY 4.0 |
| `/samples/snare/ghost-3.ogg` | `snare.ghost` | `M: Snare1/36-Snare.wav` | CC BY 4.0 |
| `/samples/snare/crossStick-1.ogg` | `snare.crossStick` | [`V: Membranophones/Struck Membranophones/Snare Drum, Modern 2/Snare3M_Xstick_v2_rr1_Mid.wav`](https://raw.githubusercontent.com/sgossner/VCSL/master/Membranophones/Struck%20Membranophones/Snare%20Drum%2C%20Modern%202/Snare3M_Xstick_v2_rr1_Mid.wav) | CC0 1.0 |
| `/samples/snare/crossStick-2.ogg` | `snare.crossStick` | [`V: Membranophones/Struck Membranophones/Snare Drum, Modern 2/Snare3M_Xstick_v2_rr2_Mid.wav`](https://raw.githubusercontent.com/sgossner/VCSL/master/Membranophones/Struck%20Membranophones/Snare%20Drum%2C%20Modern%202/Snare3M_Xstick_v2_rr2_Mid.wav) | CC0 1.0 |
| `/samples/hihat/closed-1.ogg` | `hihat.closed` | `M: HihatClosed/22-HihatClosed.wav` | CC BY 4.0 |
| `/samples/hihat/closed-2.ogg` | `hihat.closed` | `M: HihatClosed/20-HihatClosed.wav` | CC BY 4.0 |
| `/samples/hihat/closed-3.ogg` | `hihat.closed` | `M: HihatClosed/24-HihatClosed.wav` | CC BY 4.0 |
| `/samples/hihat/accent.ogg` | `hihat.accent` | `M: HihatClosed/26-HihatClosed.wav` | CC BY 4.0 |
| `/samples/hihat/open.ogg` | `hihat.open` | `M: HihatOpen/26-HihatOpen.wav` | CC BY 4.0 |
| `/samples/hihat/pedal.ogg` | `hihat.pedal` | [`V: Idiophones/Struck Idiophones/Hi-Hat Cymbal/HiHat_Close_rr1_Mid.wav`](https://raw.githubusercontent.com/sgossner/VCSL/master/Idiophones/Struck%20Idiophones/Hi-Hat%20Cymbal/HiHat_Close_rr1_Mid.wav) | CC0 1.0 |
| `/samples/ride/bow.ogg` | `ride.bow` | `M: RideR/7-RideR.wav` | CC BY 4.0 |
| `/samples/ride/bell.ogg` | `ride.bell` | `M: RideRBell/7-RideRBell.wav` | CC BY 4.0 |
| `/samples/cowbell/hit.ogg` | `cowbell.hit` | [`V: Idiophones/Struck Idiophones/Cowbells/Cowbell2_Normal_v3_rr1_Mid.wav`](https://raw.githubusercontent.com/sgossner/VCSL/master/Idiophones/Struck%20Idiophones/Cowbells/Cowbell2_Normal_v3_rr1_Mid.wav) | CC0 1.0 |
| `/samples/shaker/hit-1.ogg` | `shaker.hit` | `W: EggShaker/fast_01.wav` | CC0 1.0 |
| `/samples/shaker/hit-2.ogg` | `shaker.hit` | `W: EggShaker/fast_02.wav` | CC0 1.0 |
| `/samples/shaker/hit-3.ogg` | `shaker.hit` | `W: EggShaker/fast_03.wav` | CC0 1.0 |
| `/samples/toms/rack.ogg` | `toms.rack` | `M: Tom1/7-Tom1.wav` | CC BY 4.0 |
| `/samples/toms/floor.ogg` | `toms.floor` | `M: Tom4/15-Tom4.wav` | CC BY 4.0 |
| `/samples/crash/hit.ogg` | `crash.hit` | `M: CrashR/10-CrashR.wav` | CC BY 4.0 |

## Loudness

Every file is normalized to one level, and the level is a measurement rather
than a note: `src/lib/kit/loudness.test.ts` re-measures the committed files on
every `npm test` run.

| Constant | Value |
| :-- | :-- |
| `targetRmsDb` | **−21.0 dBFS** |
| `rmsWindowMs` | **100 ms** |

**The measure.** Downmix to mono at 44.1 kHz. The onset is the first sample
whose absolute value reaches −40 dBFS. The level is the RMS in dBFS over exactly
`rmsWindowMs` starting at that onset — not whole-file RMS, and not EBU R128,
which reports its −70 LUFS floor on a sample shorter than its 400 ms gate.

**Where −21.0 comes from.** Normalizing a file up raises its peak by the same
amount, so the target has to clear the worst crest factor in the pack:

```
targetRmsDb  ≤  -1 dBFS  -  max(peak_dBFS - rms_dBFS)
             ≤  -1.0 - 19.69  =  -20.69 dBFS
```

The worst crest is `/samples/shaker/hit-1.ogg`, and at −21.0 dBFS it peaks at
−1.72 dBFS. Every other file peaks lower, so nothing clips. **The number is a
consequence of this file set, not a constant** — change a round-robin member or
a trim and the arithmetic has to be redone.

This bounds one file. It says nothing about a kick, a snare and a hi-hat landing
on the same step and summing, which is the transport's headroom and not the
pack's.

**Measured across the 24 shipped files:** −21.10 to −20.91 dBFS, a spread of
0.19 dB against a test tolerance of ±0.5 dB. Peaks run from −11.51 dBFS
(`toms/floor`) to −1.72 dBFS (`shaker/hit-1`).

## How the pack was built

`scripts/normalize-samples.mjs` holds the normalization pass. It is not wired
into `npm run build`; it is run by hand and its output is what is committed.
Running it again on a normalized pack rewrites nothing.

Each source was downmixed to mono, cut at its onset, faded out, and encoded:

```
ffmpeg -f f32le -ar 44100 -ac 1 -i <raw> \
       -c:a libvorbis -q:a 5 -ar 44100 -ac 1 <out.ogg>
```

Levels are measured off the decoded file, with the same command the test uses:

```
ffmpeg -i <file> -map 0:a:0 -ac 1 -ar 44100 -f f32le -
```

`scripts/normalize-samples.mjs` is run by hand and is not part of `npm run
build`. It reads `targetRmsDb` and `rmsWindowMs` straight out of
`src/lib/kit/manifest.ts` so the build and the test cannot drift apart, which
costs it a Node floor of 22.18 — higher than the app's own.

Vorbis is not exactly level-preserving, so the script measures the encoded
result and re-encodes from the original decode until the file is within 0.1 dB
of target — never more than one generation of re-encoding, whatever the pass
count.

**Trim lengths**, as asked of ffmpeg, counted from the onset. A sixteenth at
96 BPM is 156 ms and most of these are set against it. No file is shorter than
150 ms from its onset, which is what keeps the 100 ms measurement window off the
end of the file.

These are the requested lengths, not the shipped durations. Vorbis packs audio
into frames and rounds the last one up, so a file can run up to ~20 ms past its
trim; where a source was shorter than the trim, the file is the source's length
instead. The shortest shipped file carries 244 ms after its onset.

| Voice | Length | Fade out |
| :-- | :-- | :-- |
| kick | 450 ms | 60 ms |
| snare, backbeat | 500 ms | 60 ms |
| snare, normal and ghost | 450 ms | 60 ms |
| cross-stick | 300 ms | 50 ms |
| hi-hat closed, accent, pedal | 250 ms | 40 ms |
| hi-hat open | 300 ms | 80 ms |
| ride bow | 1200 ms | 200 ms |
| ride bell | 1000 ms | 150 ms |
| cowbell | 500 ms | 60 ms |
| shaker | 250 ms | 40 ms |
| toms | 800 ms | 120 ms |
| crash | 2000 ms | 400 ms |

The open hat is cut to 300 ms because it rings 640 ms untrimmed, which is over
four sixteenths. That is a compromise and not a fix: the real answer is a choke
group in the transport, so the open hat stops when the next hi-hat note fires.

## What is known to be weak

**The `snare.ghost` round robin is weak.** Its three files correlate at
**r ≈ 0.90** over their first 500 ms, and that holds at every spacing from 3 to
20 velocity layers. The residual is √(1 − 0.90²) ≈ 0.44 of the signal, about
7 dB down — enough to take the edge off a machine-gun repeat, not enough to hide
it the way the hi-hat's three files do. MuldjordKit does not contain a strong
ghost round robin and no amount of layer picking creates one.

The other round robins are real: hi-hat closed at r = 0.05–0.13, egg shaker at
r = −0.06 to +0.02, cross-stick at r = 0.45.

**All four snare articulations come from `Snare1`.** `Snare1` and `Snare2` are
the top and bottom microphone of one performance, not two sample sets — same 56
layers, identical file lengths, and r = −0.30 between them. The kit's README
reports phasing between the two mics. Alternating them would change microphone
every note and partially cancel where a ghost rings into a backbeat. The
README's invitation to phase-reverse and blend the two is a listening decision
and was deliberately not taken here.

## What was heard

The three rows no measurement could close were played on 2026-09-17.

1. **`snare.backbeat` does not crack, and stays.** `Snare1/56` is a centre
   stroke and reads as one. All four snare articulations sound alike because
   they are MIDI velocity layers 56, 45 and 30 of one drum and onset-RMS
   normalization removes the level difference between them, so only timbre
   survives; the gain table separates them again at playback. A rimshot would be
   the one genuinely different stroke, and the kit is accepted without one.
2. **`hihat.pedal` reads as a stick, not a foot.** The inference from the name
   and from 6.8 dB more low-frequency energy was wrong to the ear. The file
   stays for now and the swap is a candidate in `specs/features.md`.
3. **The four imports sit in the room.** The count-in belongs in front of the
   kit and sounds like it does.
