import { BacklitButton } from '@/components/controls/BacklitButton'
import { Fader } from '@/components/controls/Fader'
import { Fill } from '@/components/layout/Fill'
import { Row } from '@/components/layout/Row'
import { Stack } from '@/components/layout/Stack'
import { EtchedLabel } from '@/components/typography/EtchedLabel'
import { panel } from '@/lib/snippets'
import { feelReadout } from '../../lib/format'
import { feel } from '../../lib/ranges'
import type { PanelControls } from '../../types'

export function FeelRow({ state, setFeel, toggleAutoFeel }: PanelControls) {
  return (
    <Row gap={4} align="between">
      <Fill>
        <Stack gap={1}>
          <Row gap={0} align="center">
            <EtchedLabel size="control">{panel.feel}</EtchedLabel>
          </Row>
          <Fader
            label={panel.feel}
            value={state.feel}
            min={feel.min}
            max={feel.max}
            step={feel.step}
            valueLabel={feelReadout(state.feel)}
            scaleStart={panel.thin}
            scaleEnd={panel.fat}
            onChange={setFeel}
          />
        </Stack>
      </Fill>
      <BacklitButton
        label={panel.autoFeel}
        tone="amber"
        lit={state.autoFeel}
        onToggle={toggleAutoFeel}
      />
    </Row>
  )
}
