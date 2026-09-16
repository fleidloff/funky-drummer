import { readFileSync } from 'node:fs'
import ts from 'typescript'
import type { Plugin } from 'vite'

const SPECIFIER = '@/lib/snippets'
const VIRTUAL_ID = '\0reword-snippets'

const placeholder = (path: string) => `«reworded:${path}»`

export function scramble(value: unknown, path: string): unknown {
  if (typeof value === 'string') return placeholder(path)

  if (typeof value === 'function') {
    const scrambled = (...args: unknown[]) => `${placeholder(path)}${JSON.stringify(args)}`
    Object.defineProperty(scrambled, 'length', { value: value.length })
    return scrambled
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, leaf]) => [key, scramble(leaf, `${path}.${key}`)]),
    )
  }

  return value
}

function exportedNames(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const names: string[] = []
  source.forEachChild((node) => {
    if (!ts.isExportDeclaration(node)) return
    const bindings = node.exportClause
    if (!bindings || !ts.isNamedExports(bindings)) return
    bindings.elements.forEach((element) => names.push(element.name.text))
  })
  return names
}

function rewordedModule(options: { real: string; scrambler: string }): string {
  const lines = [
    `import { scramble } from ${JSON.stringify(options.scrambler)}`,
    `import * as real from ${JSON.stringify(options.real)}`,
  ]
  exportedNames(options.real).forEach((name) => {
    lines.push(`export const ${name} = scramble(real.${name}, ${JSON.stringify(name)})`)
  })
  return lines.join('\n')
}

export function rewordSnippets(options: { real: string; scrambler: string }): Plugin {
  return {
    name: 'reword-snippets',
    enforce: 'pre',
    resolveId(source) {
      return source === SPECIFIER ? VIRTUAL_ID : null
    },
    load(id) {
      return id === VIRTUAL_ID ? rewordedModule(options) : null
    },
  }
}
