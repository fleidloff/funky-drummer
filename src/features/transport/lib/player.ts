import { KIT } from '@/lib/kit/manifest'
import { ARTICULATIONS, voiceOf, type Articulation } from '@/lib/kit/voices'

export type LoadResult = { readonly failed: readonly Articulation[] }

export type Player = {
  load: () => Promise<LoadResult>
  play: (
    articulation: Articulation,
    velocity: number,
    time: number,
    variant: number,
  ) => void
}

function filesOf(articulation: Articulation): readonly string[] {
  const seen = new Set<Articulation>()
  let current = articulation
  while (!seen.has(current)) {
    seen.add(current)
    const entry = KIT.samples[current]
    if (entry.kind === 'files') return entry.files
    current = entry.by
  }
  return []
}

export function createPlayer(
  context: AudioContext,
  fetchAudio: typeof fetch = (...args) => fetch(...args),
): Player {
  const buffers = new Map<string, AudioBuffer>()
  const requests = new Map<string, Promise<void>>()
  let loading: Promise<LoadResult> | null = null

  function request(path: string): Promise<void> {
    const pending = requests.get(path)
    if (pending) return pending

    const started = fetchAudio(path)
      .then((response) => response.arrayBuffer())
      .then((bytes) => context.decodeAudioData(bytes))
      .then((buffer) => {
        buffers.set(path, buffer)
      })
      .catch(() => {})

    requests.set(path, started)
    return started
  }

  async function loadAll(): Promise<LoadResult> {
    const paths = Object.values(KIT.samples).flatMap((entry) =>
      entry.kind === 'files' ? entry.files : [],
    )
    await Promise.all(paths.map(request))

    const failed = ARTICULATIONS.filter(
      (articulation) => !filesOf(articulation).some((path) => buffers.has(path)),
    ).sort()

    return { failed }
  }

  return {
    load: () => (loading ??= loadAll()),

    play: (articulation, velocity, time, variant) => {
      const files = filesOf(articulation)
      if (files.length === 0) return

      const buffer = buffers.get(files[variant % files.length])
      if (!buffer) return

      const source = context.createBufferSource()
      source.buffer = buffer

      const gain = context.createGain()
      gain.gain.value = velocity * KIT.gains[voiceOf(articulation)]

      source.connect(gain)
      gain.connect(context.destination)
      source.start(time)
    },
  }
}
