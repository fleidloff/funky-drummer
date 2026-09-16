import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname)
const roleFolders = ['layout', 'surfaces', 'controls', 'typography', 'display']
const tokensFile = ['tokens', 'ts'].join('.')
const barrelFile = ['index', 'ts'].join('.')
const climbingPrefix = ['..', '/'].join('')

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

function specifiersOf(source: string): string[] {
  const found: string[] = []
  const pattern = /(?:\bfrom|\bimport|\brequire\(|\bvi\.mock\()\s*['"]([^'"]+)['"]/g
  let match = pattern.exec(source)
  while (match !== null) {
    found.push(match[1])
    match = pattern.exec(source)
  }
  return found
}

describe('the design system', () => {
  const folders = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  it('holds exactly the five role folders', () => {
    expect([...folders].sort()).toEqual([...roleFolders].sort())
  })

  it('keeps the tokens at the root, outside every group', () => {
    const rootFiles = readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)

    expect(rootFiles).toContain(tokensFile)
  })

  it('has no barrel file anywhere', () => {
    const barrels = walk(root).filter((path) => path.endsWith(barrelFile))

    expect(barrels).toEqual([])
  })

  it('has no import specifier that climbs out of its own folder', () => {
    const offenders = walk(root)
      .filter((path) => path.endsWith('.ts') || path.endsWith('.tsx'))
      .flatMap((path) =>
        specifiersOf(readFileSync(path, 'utf8'))
          .filter((specifier) => specifier.startsWith(climbingPrefix))
          .map((specifier) => `${path}: ${specifier}`),
      )

    expect(offenders).toEqual([])
  })
})
