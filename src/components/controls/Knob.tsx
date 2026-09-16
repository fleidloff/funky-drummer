'use client'

import { KnobFace } from '@/components/display/KnobFace'
import { Readout } from '@/components/display/Readout'
import { TickArc } from '@/components/display/TickArc'
import { EtchedLabel } from '@/components/typography/EtchedLabel'
import { useContinuous, type ContinuousProps } from './useContinuous'

const tickCount = 31
const sweepDegrees = 270

export function Knob(props: ContinuousProps) {
  const { ratio, slider } = useContinuous(props, 'vertical')
  const angle = ratio * sweepDegrees - sweepDegrees / 2

  return (
    <div className="flex w-32 flex-col items-center gap-3">
      <div className="relative h-32 w-32">
        <TickArc count={tickCount} />
        <div
          {...slider}
          className="absolute inset-[7px] touch-none rounded-full focus:outline-2 focus:outline-offset-4"
        >
          <KnobFace angle={angle} />
        </div>
      </div>
      <div className="flex w-full items-baseline justify-between gap-1">
        <EtchedLabel size="scale">{props.scaleStart}</EtchedLabel>
        <Readout>{props.valueLabel}</Readout>
        <EtchedLabel size="scale">{props.scaleEnd}</EtchedLabel>
      </div>
    </div>
  )
}
