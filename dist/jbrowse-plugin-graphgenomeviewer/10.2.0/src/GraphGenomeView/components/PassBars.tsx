import { PASS_BAR_HEIGHT, passBarTree } from '@jbrowse/bandage-core/passBar'
import { observer } from 'mobx-react'

import ElTree from './ElTree'

import type { GraphPaneModel } from '../model'

const PassBars = observer(function PassBars({
  model,
}: {
  model: GraphPaneModel
}) {
  return (
    <>
      {model.passBars.map(bar => (
        <svg
          key={bar.walk}
          data-testid="graph-pass-bar"
          width={model.paneWidth}
          height={PASS_BAR_HEIGHT}
          style={{ display: 'block', borderTop: '1px solid #ddd' }}
        >
          <ElTree
            el={passBarTree(bar, model.walkLabel(bar.walk), model.paneWidth)}
          />
        </svg>
      ))}
    </>
  )
})

export default PassBars
