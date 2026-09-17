const MIX_PRIME = 0x9e3779b1
const UINT32 = 0x1_0000_0000

export function mix32(value: number): number {
  let hash = Math.imul(value, MIX_PRIME)
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b)
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35)
  return hash ^ (hash >>> 16)
}

export function hashOf(seed: number, ...values: readonly number[]): number {
  let hash = mix32(seed)
  for (const value of values) hash = mix32(hash ^ value)
  return hash >>> 0
}

export function unitFloat(hash: number): number {
  return ((hash >>> 0) + 0.5) / UINT32
}

export function gaussian(hashA: number, hashB: number): number {
  const radius = Math.sqrt(-2 * Math.log(unitFloat(hashA)))
  return radius * Math.cos(2 * Math.PI * unitFloat(hashB))
}
