import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { KIT } from '@/lib/kit/manifest'
import { createPlayer } from './player'

const GHOST_FILES = ['/samples/snare/ghost-1.ogg', '/samples/snare/ghost-2.ogg', '/samples/snare/ghost-3.ogg']

const everyPath = Object.values(KIT.samples).flatMap((entry) =>
  entry.kind === 'files' ? [...entry.files] : [],
)

const bytesOf = (path: string) => new TextEncoder().encode(path).buffer as ArrayBuffer
const pathOf = (buffer: AudioBuffer | null) => (buffer as unknown as { path: string } | null)?.path

type FakeSource = {
  buffer: AudioBuffer | null
  connectedTo: unknown
  startedAt: number | null
  connect: (target: unknown) => void
  start: (when: number) => void
}

type FakeGain = {
  gain: { value: number }
  connectedTo: unknown
  connect: (target: unknown) => void
}

function createContext(currentTime: number) {
  const decoded: string[] = []
  const sources: FakeSource[] = []
  const gains: FakeGain[] = []
  const destination = { role: 'destination' }

  const context = {
    currentTime,
    destination,
    decodeAudioData: (bytes: ArrayBuffer) => {
      const path = new TextDecoder().decode(new Uint8Array(bytes))
      decoded.push(path)
      return Promise.resolve({ path } as unknown as AudioBuffer)
    },
    createBufferSource: () => {
      const source: FakeSource = {
        buffer: null,
        connectedTo: null,
        startedAt: null,
        connect: (target) => {
          source.connectedTo = target
        },
        start: (when) => {
          source.startedAt = when
        },
      }
      sources.push(source)
      return source
    },
    createGain: () => {
      const gain: FakeGain = {
        gain: { value: 1 },
        connectedTo: null,
        connect: (target) => {
          gain.connectedTo = target
        },
      }
      gains.push(gain)
      return gain
    },
  }

  return { context: context as unknown as AudioContext, decoded, sources, gains, destination }
}

function createFetch(failing: readonly string[] = []) {
  const calls: string[] = []
  const fetchAudio = (input: RequestInfo | URL) => {
    const path = String(input)
    calls.push(path)
    if (failing.includes(path)) return Promise.reject(new Error('offline'))
    return Promise.resolve({ arrayBuffer: () => Promise.resolve(bytesOf(path)) } as Response)
  }
  return { calls, fetchAudio: fetchAudio as unknown as typeof fetch }
}

const countOf = (calls: readonly string[], path: string) =>
  calls.filter((call) => call === path).length

describe('loading the kit', () => {
  it('fetches every path of every files entry exactly once', async () => {
    const { context } = createContext(0)
    const { calls, fetchAudio } = createFetch()

    await createPlayer(context, fetchAudio).load()

    expect([...calls].sort()).toEqual([...new Set(everyPath)].sort())
    for (const path of everyPath) expect(countOf(calls, path)).toBe(1)
  })

  it('decodes each fetched path once', async () => {
    const { context, decoded } = createContext(0)
    const { fetchAudio } = createFetch()

    await createPlayer(context, fetchAudio).load()

    expect([...decoded].sort()).toEqual([...new Set(everyPath)].sort())
  })

  it('fetches nothing more on a second load', async () => {
    const { context, decoded } = createContext(0)
    const { calls, fetchAudio } = createFetch()
    const player = createPlayer(context, fetchAudio)

    await player.load()
    const afterFirst = calls.length
    await player.load()

    expect(calls.length).toBe(afterFirst)
    expect(decoded.length).toBe(afterFirst)
  })
})

describe('scheduling a hit', () => {
  it('starts the source at the absolute time it was given, not at currentTime', async () => {
    const { context, sources } = createContext(41.75)
    const { fetchAudio } = createFetch()
    const player = createPlayer(context, fetchAudio)
    await player.load()

    player.play('kick.hard', 1, 48.5, 0)

    expect(sources).toHaveLength(1)
    expect(sources[0].startedAt).toBe(48.5)
  })

  it('connects the source through a gain node to the destination', async () => {
    const { context, sources, gains, destination } = createContext(2)
    const { fetchAudio } = createFetch()
    const player = createPlayer(context, fetchAudio)
    await player.load()

    player.play('cowbell.hit', 0.65, 3, 0)

    expect(sources[0].connectedTo).toBe(gains[0])
    expect(gains[0].connectedTo).toBe(destination)
    expect(pathOf(sources[0].buffer)).toBe('/samples/cowbell/hit.ogg')
  })

  it('sets the gain to the raw product of velocity and the voice gain', async () => {
    const { context, gains } = createContext(2)
    const { fetchAudio } = createFetch()
    const player = createPlayer(context, fetchAudio)
    await player.load()

    player.play('kick.hard', 1, 3, 0)
    player.play('hihat.closed', 0.85, 3.25, 0)
    player.play('shaker.hit', 0.3, 3.5, 0)

    expect(gains[0].gain.value).toBe(1 * KIT.gains.kick)
    expect(gains[1].gain.value).toBe(0.85 * KIT.gains.hihat)
    expect(gains[2].gain.value).toBe(0.3 * KIT.gains.shaker)
    expect(new Set([KIT.gains.kick, KIT.gains.hihat, KIT.gains.shaker]).size).toBe(3)
  })

  it('plays the same file and gain for the same arguments', async () => {
    const { context, sources, gains } = createContext(2)
    const { fetchAudio } = createFetch()
    const player = createPlayer(context, fetchAudio)
    await player.load()

    player.play('snare.ghost', 0.3, 3, 1)
    player.play('snare.ghost', 0.3, 4, 1)

    expect(pathOf(sources[1].buffer)).toBe(pathOf(sources[0].buffer))
    expect(gains[1].gain.value).toBe(gains[0].gain.value)
  })

  it('does nothing before the kit is loaded', () => {
    const { context, sources } = createContext(2)
    const { fetchAudio } = createFetch()

    expect(() => createPlayer(context, fetchAudio).play('kick.hard', 1, 3, 0)).not.toThrow()
    expect(sources).toHaveLength(0)
  })
})

describe('the round robin', () => {
  it('walks the files of an articulation that has several and wraps', async () => {
    const { context, sources } = createContext(2)
    const { fetchAudio } = createFetch()
    const player = createPlayer(context, fetchAudio)
    await player.load()

    for (const variant of [0, 1, 2, 3]) player.play('snare.ghost', 0.3, 3 + variant, variant)

    expect(sources.map((source) => pathOf(source.buffer))).toEqual([
      GHOST_FILES[0],
      GHOST_FILES[1],
      GHOST_FILES[2],
      GHOST_FILES[0],
    ])
  })

  it('ignores the variant for an articulation with one file', async () => {
    const { context, sources } = createContext(2)
    const { fetchAudio } = createFetch()
    const player = createPlayer(context, fetchAudio)
    await player.load()

    player.play('crash.hit', 0.85, 3, 7)

    expect(pathOf(sources[0].buffer)).toBe('/samples/crash/hit.ogg')
  })

  it('draws no random number', () => {
    const source = readFileSync(join(import.meta.dirname, 'player.ts'), 'utf8')

    expect(source).not.toContain(['Math', 'random'].join('.'))
  })
})

describe('a path that fails to load', () => {
  it('resolves the load, silences that variant and leaves the rest playing', async () => {
    const { context, sources } = createContext(2)
    const { fetchAudio } = createFetch(['/samples/snare/ghost-2.ogg'])
    const player = createPlayer(context, fetchAudio)

    await expect(player.load()).resolves.toBeDefined()

    expect(() => player.play('snare.ghost', 0.3, 3, 1)).not.toThrow()
    expect(sources).toHaveLength(0)

    player.play('snare.ghost', 0.3, 3.25, 0)
    player.play('kick.hard', 1, 3.5, 0)

    expect(sources.map((entry) => pathOf(entry.buffer))).toEqual([
      GHOST_FILES[0],
      '/samples/kick/hard.ogg',
    ])
  })
})

describe('what the load reports', () => {
  it('fails nothing when every path loads', async () => {
    const { context } = createContext(2)
    const { fetchAudio } = createFetch()

    const result = await createPlayer(context, fetchAudio).load()

    expect(result.failed).toEqual([])
  })

  it('names an articulation whose only file failed, and no other', async () => {
    const { context } = createContext(2)
    const { fetchAudio } = createFetch(['/samples/kick/hard.ogg'])

    const result = await createPlayer(context, fetchAudio).load()

    expect(result.failed).toEqual(['kick.hard'])
  })

  it('names nothing when an articulation loses one of its several files', async () => {
    const { context } = createContext(2)
    const { fetchAudio } = createFetch([GHOST_FILES[1]])

    const result = await createPlayer(context, fetchAudio).load()

    expect(result.failed).toEqual([])
  })

  it('reports every failed articulation once, in sorted order', async () => {
    const { context } = createContext(2)
    const { fetchAudio } = createFetch([
      '/samples/toms/rack.ogg',
      '/samples/crash/hit.ogg',
      '/samples/kick/soft.ogg',
    ])

    const result = await createPlayer(context, fetchAudio).load()

    expect(result.failed).toEqual(['crash.hit', 'kick.soft', 'toms.rack'])
  })

  it('reports the same result on a second load without refetching', async () => {
    const { context } = createContext(2)
    const { calls, fetchAudio } = createFetch(['/samples/kick/hard.ogg'])
    const player = createPlayer(context, fetchAudio)

    const first = await player.load()
    const afterFirst = calls.length
    const second = await player.load()

    expect(first.failed).toEqual(['kick.hard'])
    expect(second).toBe(first)
    expect(calls.length).toBe(afterFirst)
  })
})
