import { Glyph } from '@/components/display/Glyph'
import { Inset } from '@/components/layout/Inset'
import { Row } from '@/components/layout/Row'
import { EngravedPlate } from '@/components/surfaces/EngravedPlate'
import { EngravedText } from '@/components/typography/EngravedText'
import { panel } from '@/lib/snippets'

export function Nameplate() {
  return (
    <EngravedPlate>
      <Inset pad={3}>
        <Row gap={2} align="between">
          <EngravedText size="title">{panel.title}</EngravedText>
          <Glyph name="speaker" />
        </Row>
      </Inset>
    </EngravedPlate>
  )
}
