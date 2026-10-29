import { useMemo } from 'react'

import {
  exonOutlineTree,
  exonStretches,
} from '@jbrowse/bandage-core/genes/exonOutline'
import { computed } from 'mobx'
import { observer } from 'mobx-react'

import ElTree, { useSvgId } from './ElTree'
import { PaneSvgLayer } from './PaneLayer'

import type { GraphPaneModel } from '../model'

// The session's genes drawn onto the graph: each exon outlined round its
// stretch of node, as core's exonOutlineTree draws it for every host, moved by
// the same transform the halos use. Their names are LabelLayer's.

const GenePins = observer(function GenePins({
  model,
}: {
  model: GraphPaneModel
}) {
  const id = `exon-outline-${useSvgId()}`
  // in layout units, so a pan frame reuses them and only moves the transform
  const stretches = useMemo(
    () =>
      computed(() => {
        const { genePins, walkLift } = model
        // an open bubble rings only its own exons
        const focus = walkLift ? undefined : model.openBubbleFocus
        const pins = focus
          ? genePins.map(pin => ({
              ...pin,
              exonsByNode: pin.exonsByNode.filter(e =>
                focus.nodeIds.has(e.nodeId),
              ),
            }))
          : genePins
        return exonStretches(pins, model.nodeInk.halfWidthPx, walkLift)
      }),
    [model],
  )
  const { scaleX, scaleY, translateX, translateY, paneWidth, canvasHeight } =
    model
  const tree = exonOutlineTree(stretches.get(), {
    id,
    width: paneWidth,
    height: canvasHeight,
    transform: `translate(${translateX} ${translateY}) scale(${scaleX} ${scaleY})`,
  })
  return tree ? (
    <PaneSvgLayer model={model} zIndex={2} testId="graph-gene-pins">
      <ElTree el={tree} />
    </PaneSvgLayer>
  ) : null
})

export default GenePins
