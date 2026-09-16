import { readdirSync } from 'node:fs'
import path from 'node:path'
import next from 'eslint-config-next'
import { buildZones } from './eslint.zones.mjs'

const root = import.meta.dirname

const features = readdirSync(path.join(root, 'src/features'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

const config = [
  { ignores: ['.next/**', 'out/**', 'next-env.d.ts'] },
  ...next,
  {
    name: 'funky-drummer/import-boundaries',
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: path.join(root, 'tsconfig.json') },
      },
    },
    rules: {
      'import/no-restricted-paths': ['error', { basePath: root, zones: buildZones(features) }],
    },
  },
  {
    name: 'funky-drummer/no-styling-in-features',
    files: ['src/features/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='className']",
          message:
            'no styling in features: a feature composes primitives from src/components/ and does not carry classes of its own.',
        },
      ],
    },
  },
]

export default config
