import { Button } from '@mui/material'
import { observer } from 'mobx-react'

import type { GraphPaneModel } from '../model'

const style = {
  position: 'absolute' as const,
  left: 8,
  zIndex: 5,
  background: 'rgba(255,255,255,0.9)',
  textTransform: 'none' as const,
}

const UnpopButton = observer(function UnpopButton({
  model,
}: {
  model: GraphPaneModel
}) {
  const { poppedFrom } = model
  return poppedFrom ? (
    <Button
      size="small"
      variant="outlined"
      style={{ ...style, ...(model.facetPanels ? { bottom: 8 } : { top: 8 }) }}
      data-testid="graph-unpop-bubble"
      onClick={() => {
        void model.unpopBubble()
      }}
    >
      ◀ Back to {poppedFrom.label}
    </Button>
  ) : null
})

export default UnpopButton
