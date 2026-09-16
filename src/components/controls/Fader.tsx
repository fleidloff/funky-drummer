'use client'

import { ThumbFace } from '@/components/display/ThumbFace'
import { TickBar } from '@/components/display/TickBar'
import { Readout } from '@/components/display/Readout'
import { EtchedLabel } from '@/components/typography/EtchedLabel'
import { useContinuous, type ContinuousProps } from './useContinuous'

const tickCount = 21

export function Fader(props: ContinuousProps) {
  const { ratio, slider } = useContinuous(props, 'horizontal')

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="h-2.5 w-full">
        <TickBar count={tickCount} />
      </div>
      <div
        {...slider}
        className="relative flex h-8 w-full touch-none items-center px-4 focus:outline-2 focus:outline-offset-4"
      >
        <span className="surface-well absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full" />
        <span
          data-part="thumb"
          className="absolute top-0 bottom-0 w-8"
          style={{ left: `${ratio * 100}%`, transform: 'translateX(-50%)' }}
        >
          <ThumbFace />
        </span>
      </div>
      <div className="flex w-full items-baseline justify-between">
        <EtchedLabel size="scale">{props.scaleStart}</EtchedLabel>
        <Readout>{props.valueLabel}</Readout>
        <EtchedLabel size="scale">{props.scaleEnd}</EtchedLabel>
      </div>
    </div>
  )
}
