'use client'

import { Inset } from '@/components/layout/Inset'
import { PageFrame } from '@/components/layout/PageFrame'
import { Split } from '@/components/layout/Split'
import { Stack } from '@/components/layout/Stack'
import { MetalSurface } from '@/components/surfaces/MetalSurface'
import { usePanelState } from '../hooks/usePanelState'
import { Knobs } from './steering/Knobs'
import { Nameplate } from './steering/Nameplate'
import { Transport } from './steering/Transport'
import { FeelRow } from './surface/FeelRow'
import { PadGrid } from './surface/PadGrid'

export function Panel() {
  const controls = usePanelState()

  return (
    <PageFrame>
      <Inset pad={3}>
        <MetalSurface radius="panel">
          <Inset pad={4}>
            <Split
              gap={6}
              start={
                <Stack gap={6}>
                  <Nameplate />
                  <Knobs {...controls} />
                  <Transport {...controls} />
                </Stack>
              }
              end={
                <Stack gap={6}>
                  <PadGrid {...controls} />
                  <FeelRow {...controls} />
                </Stack>
              }
            />
          </Inset>
        </MetalSurface>
      </Inset>
    </PageFrame>
  )
}
