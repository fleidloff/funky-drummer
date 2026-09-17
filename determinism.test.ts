import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const src = join(import.meta.dirname, 'src')

const SEED_DRAW = join('features', 'transport', 'hooks', 'useTransport.ts')

function sourceFiles(dir: string): readonly string[] {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }

  return entries.flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    if (!/\.tsx?$/.test(entry.name)) return []
    if (/\.test\.tsx?$/.test(entry.name)) return []
    return [path]
  })
}

function callsMathRandom(path: string): boolean {
  try {
    return /\bMath\s*\.\s*random\s*\(/.test(readFileSync(path, 'utf-8'))
  } catch {
    return false
  }
}

const offenders = (dir: string) =>
  sourceFiles(join(src, dir))
    .filter(callsMathRandom)
    .map((path) => relative(src, path))
    .sort()

describe('the drummer draws from a seed, never from Math.random', () => {
  it('finds no Math.random anywhere in the domain', () => {
    expect(offenders('lib')).toEqual([])
  })

  it('finds no Math.random in the design system', () => {
    expect(offenders('components')).toEqual([])
  })

  it('finds no Math.random in the route layer', () => {
    expect(offenders('app')).toEqual([])
  })

  it('allows it at exactly one place, where the performance seed is drawn', () => {
    expect(offenders('features')).toEqual([SEED_DRAW])
  })

  it('reads a tree it can actually see', () => {
    expect(sourceFiles(join(src, 'lib')).length).toBeGreaterThan(10)
    expect(sourceFiles(join(src, 'features')).length).toBeGreaterThan(3)
  })
})
