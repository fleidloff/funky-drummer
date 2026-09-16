import { Knob } from '@/components/controls/Knob'
import { Row } from '@/components/layout/Row'
import { Stack } from '@/components/layout/Stack'
import { EtchedLabel } from '@/components/typography/EtchedLabel'
import { panel } from '@/lib/snippets'
import { scaleMark, swingReadout, tempoReadout } from '../../lib/format'
import { swing, tempo } from '../../lib/ranges'
import type { PanelControls } from '../../hooks/usePanelState'

export function Knobs({ state, setSwing, setTempo }: PanelControls) {
  return (
    <Row gap={6} align="center">
      <Stack gap={1} align="center">
        <EtchedLabel size="control">{panel.swing}</EtchedLabel>
        <Knob
          label={panel.swing}
          value={state.swing}
          min={swing.min}
          max={swing.max}
          step={swing.step}
          valueLabel={swingReadout(state.swing)}
          scaleStart={scaleMark(swing.min)}
          scaleEnd={scaleMark(swing.max)}
          onChange={setSwing}
        />
      </Stack>
      <Stack gap={1} align="center">
        <EtchedLabel size="control">{panel.tempo}</EtchedLabel>
        <Knob
          label={panel.tempo}
          value={state.tempo}
          min={tempo.min}
          max={tempo.max}
          step={tempo.step}
          valueLabel={tempoReadout(state.tempo)}
          scaleStart={scaleMark(tempo.min)}
          scaleEnd={scaleMark(tempo.max)}
          onChange={setTempo}
        />
      </Stack>
    </Row>
  )
}
