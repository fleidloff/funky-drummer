import { BacklitButton } from '@/components/controls/BacklitButton'
import { MomentaryButton } from '@/components/controls/MomentaryButton'
import { Fill } from '@/components/layout/Fill'
import { Row } from '@/components/layout/Row'
import { panel } from '@/lib/snippets'
import type { PanelControls } from '../../hooks/usePanelState'

export function Transport({ state, togglePlaying, toggleAutoFill }: PanelControls) {
  return (
    <Row gap={2} align="between">
      <Fill>
        <BacklitButton
          label={state.playing ? panel.stop : panel.play}
          tone="green"
          lit
          pressed={state.playing}
          pulsing={state.playing}
          onToggle={togglePlaying}
        />
      </Fill>
      <MomentaryButton label={panel.tapTempo} tone="steel" onPress={() => {}} />
      <BacklitButton
        label={panel.autoFill}
        tone="amber"
        lit={state.autoFill}
        onToggle={toggleAutoFill}
      />
    </Row>
  )
}
