import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const cssPath = join(import.meta.dirname, 'globals.css')
const css = readFileSync(cssPath, 'utf-8')

function extractBraceBody(source: string, openBraceIndex: number): string {
  let depth = 0

  for (let i = openBraceIndex; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) return source.slice(openBraceIndex + 1, i)
    }
  }

  throw new Error(`no matching closing brace from index ${openBraceIndex}`)
}

function colorNames(body: string): Set<string> {
  const names = new Set<string>()
  const pattern = /--color-([a-z0-9-]+)\s*:/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(body))) {
    names.add(match[1])
  }

  return names
}

const themeStart = css.indexOf('@theme static')
if (themeStart === -1) throw new Error('no @theme static block found')
const themeBody = extractBraceBody(css, css.indexOf('{', themeStart))

const mediaStart = css.indexOf('@media (prefers-color-scheme: dark)')
if (mediaStart === -1) throw new Error('no dark media block found')
const mediaBody = extractBraceBody(css, css.indexOf('{', mediaStart))
const rootIndex = mediaBody.indexOf(':root')
if (rootIndex === -1) throw new Error('no :root block inside the dark media block')
const darkRootBody = extractBraceBody(mediaBody, mediaBody.indexOf('{', rootIndex))

function valueOf(body: string, name: string): string | undefined {
  const match = new RegExp(`--color-${name}\\s*:\\s*([^;]+);`).exec(body)
  return match ? match[1].trim() : undefined
}

const themeNames = colorNames(themeBody)
const darkNames = colorNames(darkRootBody)

const surfaceSet = [
  'bezel',
  'metal-top',
  'metal-bottom',
  'metal-grain',
  'metal-edge',
  'well',
  'well-edge',
  'steel-top',
  'steel-bottom',
  'etch',
  'etch-shadow',
  'tick',
  'lamp-amber-off',
  'lamp-green-off',
  'lamp-ink-off',
]

const litSet = ['engrave-field', 'engrave-ink', 'lamp-amber', 'lamp-green', 'lamp-ink']

const appChromeSet = ['bg', 'fg', 'muted', 'border', 'accent']

function extractUtilities(source: string): Map<string, string> {
  const utilities = new Map<string, string>()
  const pattern = /@utility\s+([a-z0-9-]+)\s*\{/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(source))) {
    const openBraceIndex = match.index + match[0].length - 1
    utilities.set(match[1], extractBraceBody(source, openBraceIndex))
  }

  return utilities
}

const utilities = extractUtilities(css)

const requiredUtilities = [
  'surface-metal',
  'surface-well',
  'surface-steel',
  'surface-field',
  'lamp-amber',
  'lamp-amber-off',
  'lamp-green',
  'lamp-green-off',
  'lamp-pulsing',
  'engraved',
  'etched',
]

function hexLiterals(body: string): string[] {
  return body.match(/#[0-9a-fA-F]{3,8}/g) ?? []
}

function disallowedRgbLiterals(body: string): string[] {
  const pattern = /rgba?\(([^)]+)\)/g
  const offenders: string[] = []
  let match: RegExpExecArray | null

  while ((match = pattern.exec(body))) {
    const channels = match[1].split(',').map((part) => Number.parseFloat(part.trim()))
    const [r, g, b] = channels
    const isBlack = r === 0 && g === 0 && b === 0
    const isWhite = r === 255 && g === 255 && b === 255

    if (!isBlack && !isWhite) offenders.push(match[0])
  }

  return offenders
}

describe('the surface set', () => {
  it.each(surfaceSet)('--color-%s is defined in @theme and redefined in the dark block', (name) => {
    expect(themeNames.has(name), `--color-${name} is missing from @theme`).toBe(true)
    expect(darkNames.has(name), `--color-${name} is missing from the dark :root block`).toBe(true)
  })
})

describe('the lit set', () => {
  it.each(litSet)('--color-%s is defined in @theme and stays fixed in the dark block', (name) => {
    expect(themeNames.has(name), `--color-${name} is missing from @theme`).toBe(true)
    expect(darkNames.has(name), `--color-${name} must not be redefined in the dark block`).toBe(false)
  })
})

describe('the dark block', () => {
  it('redefines the surface set and no other panel variable', () => {
    const panelDarkNames = [...darkNames].filter((name) => !appChromeSet.includes(name))

    expect(new Set(panelDarkNames)).toEqual(new Set(surfaceSet))
  })
})

describe('the shadow tokens', () => {
  const shadowBodies = [...themeBody.matchAll(/--shadow-([\w-]+)\s*:\s*([^;]+);/g)].map(
    (match) => ({ name: match[1], body: match[2] }),
  )

  it('names every shadow the vocabulary promises', () => {
    expect(shadowBodies.map((shadow) => shadow.name).sort()).toEqual([
      'glow-amber',
      'glow-green',
      'raised',
      'recessed',
    ])
  })

  it.each(shadowBodies.map((shadow) => shadow.name))('--shadow-%s writes no literal colour', (name) => {
    const body = shadowBodies.find((shadow) => shadow.name === name)?.body as string
    const hexes = hexLiterals(body)
    const offenders = disallowedRgbLiterals(body)

    expect(hexes, `--shadow-${name} writes a literal hex colour: ${hexes.join(', ')}`).toHaveLength(0)
    expect(
      offenders,
      `--shadow-${name} writes a literal rgb colour outside black/white: ${offenders.join(', ')}`,
    ).toHaveLength(0)
  })
})

describe('the utility recipes', () => {
  it.each(requiredUtilities)('%s is defined', (name) => {
    expect(utilities.has(name), `@utility ${name} is not defined`).toBe(true)
  })

  it.each([...utilities.keys()])('%s writes no literal colour', (name) => {
    const body = utilities.get(name) as string
    const hexes = hexLiterals(body)
    const offenders = disallowedRgbLiterals(body)

    expect(hexes, `@utility ${name} writes a literal hex colour: ${hexes.join(', ')}`).toHaveLength(0)
    expect(
      offenders,
      `@utility ${name} writes a literal rgb colour outside black/white: ${offenders.join(', ')}`,
    ).toHaveLength(0)
  })
})

describe('dark is a different metal, not the same one renamed', () => {
  it.each(surfaceSet)('--color-%s holds a different value in the dark block', (name) => {
    const light = valueOf(themeBody, name)
    const dark = valueOf(darkRootBody, name)

    expect(light, `--color-${name} has no value in @theme`).toBeDefined()
    expect(dark, `--color-${name} has no value in the dark block`).toBeDefined()
    expect(dark, `--color-${name} is the same in both schemes`).not.toBe(light)
  })
})

describe('the colour scheme lives only in globals.css', () => {
  const uiRoots = ['components', 'features'].map((name) =>
    join(import.meta.dirname, '..', name),
  )

  const sourceFiles = (dir: string): string[] =>
    existsSync(dir)
      ? readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
          const path = join(dir, entry.name)
          if (entry.isDirectory()) return sourceFiles(path)
          return /\.tsx?$/.test(entry.name) ? [path] : []
        })
      : []

  const uiFiles = uiRoots.flatMap(sourceFiles)

  const PALETTE =
    /\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|divide|placeholder|decoration|shadow|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g

  it('reads enough of the tree to be worth trusting', () => {
    expect(uiFiles.length).toBeGreaterThan(30)
  })

  it('has no component naming a palette colour', () => {
    const offenders = uiFiles.flatMap((file) => {
      const hits = readFileSync(file, 'utf8').match(PALETTE) ?? []
      return hits.map((hit) => `${relative(import.meta.dirname, file)}: ${hit}`)
    })

    expect(offenders).toEqual([])
  })

  it('has no component writing a literal colour', () => {
    const offenders = uiFiles.flatMap((file) => {
      const source = readFileSync(file, 'utf8')
      const hits = [...(source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []), ...disallowedRgbLiterals(source)]
      return hits.map((hit) => `${relative(import.meta.dirname, file)}: ${hit}`)
    })

    expect(offenders).toEqual([])
  })

  it('has no component branching on the colour scheme itself', () => {
    const offenders = uiFiles.filter((file) => {
      const source = readFileSync(file, 'utf8')
      // A Tailwind variant is `dark:bg-...` with no space after the colon; a
      // TypeScript annotation `dark: boolean` is not one.
      return /\bdark:\S/.test(source) || source.includes('prefers-color-scheme')
    })

    expect(offenders.map((file) => relative(import.meta.dirname, file))).toEqual([])
  })
})
