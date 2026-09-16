const slice = (feature) => `./src/features/${feature}`

const AREAS = ['./src/app', './src/components', './src/lib']

export function buildZones(features) {
  return [
    {
      target: './src/components',
      from: './src/features',
      message:
        'import boundaries, zone 1: the design system may not know about features. Lift the type to src/lib or take it as a prop.',
    },
    ...features.map((feature) => ({
      target: [...AREAS, ...features.filter((other) => other !== feature).map(slice)],
      from: slice(feature),
      except: ['index.ts'],
      message: `import boundaries, zone 2: ${feature} is reached only through src/features/${feature}/index.ts. Export it there rather than reaching past it.`,
    })),
    ...features.flatMap((feature) => {
      const siblings = features.filter((other) => other !== feature).map(slice)
      if (siblings.length === 0) return []
      return [
        {
          target: slice(feature),
          from: siblings,
          message:
            'import boundaries, zone 3: no feature imports another, not even its index.ts. Move what both need up to src/lib or src/components.',
        },
      ]
    }),
    {
      target: './src/lib',
      from: ['./src/features', './src/components'],
      message:
        'import boundaries, zone 4: src/lib is a leaf and imports nothing from the app. A module that needs the app is not domain knowledge.',
    },
    {
      target: './src/features/*/lib/**',
      from: [
        './src/components/**',
        './src/features/*/components/**',
        './src/features/*/hooks/**',
        './src/features/*/state/**',
      ],
      message:
        'import boundaries, zone 6: business logic does not depend on what renders it. A feature lib module imports no UI, no hook and no store.',
    },
  ]
}
