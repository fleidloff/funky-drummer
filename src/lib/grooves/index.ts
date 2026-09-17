import type { Groove } from '../groove/types'
import { bellFunk } from './bell-funk'
import { chameleon } from './chameleon'
import { cissyStrut } from './cissy-strut'
import { coldSweat } from './cold-sweat'
import { fourOnTheFloorFunk } from './four-on-the-floor-funk'
import { funkyDrummer } from './funky-drummer'
import { linearTwoLevel } from './linear-two-level'
import { secondLine } from './second-line'
import { shakerSixteen } from './shaker-sixteen'
import { straightSixteen } from './straight-sixteen'

export const GROOVES: readonly Groove[] = [
  straightSixteen,
  funkyDrummer,
  coldSweat,
  cissyStrut,
  chameleon,
  secondLine,
  linearTwoLevel,
  bellFunk,
  shakerSixteen,
  fourOnTheFloorFunk,
]

export const STRAIGHT_SIXTEEN: Groove = straightSixteen
