import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = import.meta.dirname
const read = (name: string) => readFileSync(join(root, name), 'utf8')

const packageJson = JSON.parse(read('package.json')) as {
  engines?: Record<string, string>
  scripts?: Record<string, string>
}

describe('the repo stays deployable on Vercel defaults', () => {
  it('declares the Node version', () => {
    expect(packageJson.engines?.node).toBeTypeOf('string')
  })

  it('carries the three commands and invents none', () => {
    expect(Object.keys(packageJson.scripts ?? {}).sort()).toEqual(
      ['build', 'dev', 'lint', 'start', 'test'].sort(),
    )
  })

  it('sets no custom output mode, which the default preset does not expect', () => {
    expect(read('next.config.ts')).not.toMatch(/\boutput\s*:/)
  })

  it('ignores the build directory rather than committing it', () => {
    expect(read('.gitignore')).toMatch(/^\/?\.next\/?$/m)
  })
})
