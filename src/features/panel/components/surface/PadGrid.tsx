import { Pad } from '@/components/controls/Pad'
import { Grid } from '@/components/layout/Grid'
import { Inset } from '@/components/layout/Inset'
import { Well } from '@/components/surfaces/Well'
import { panel } from '@/lib/snippets'
import { voiceOrder } from '../../lib/voices'
import type { PanelControls } from '../../hooks/usePanelState'
import type { VoiceId } from '../../types'

const voiceLabel: Record<VoiceId, string> = {
  kick: panel.kick,
  snare: panel.snare,
  hiHat: panel.hiHat,
  ride: panel.ride,
  cowbell: panel.cowbell,
  shaker: panel.shaker,
  toms: panel.toms,
  crash: panel.crash,
}

export function PadGrid({ state, toggleVoice }: PanelControls) {
  return (
    <Well>
      <Inset pad={3}>
        <Grid columns={4} gap={2}>
          {voiceOrder.map((voice) => (
            <Pad
              key={voice}
              label={voiceLabel[voice]}
              lit={state.voices[voice]}
              onToggle={() => toggleVoice(voice)}
            />
          ))}
        </Grid>
      </Inset>
    </Well>
  )
}
