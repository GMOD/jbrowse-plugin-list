import { useEffect } from 'react'

import { getSession } from '@jbrowse/core/util'
import { autorun, untracked } from 'mobx'
import { observer } from 'mobx-react'

import { findConnectedMsaView } from './findConnectedMsaView'
import { findStructureRowName } from './msaRowMatch'
import { getProteinView } from './util'
import { stripStopCodon } from '../LaunchProteinView/utils/util'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// CROSS-REPO DEPENDENCY: react-msaview (https://github.com/GMOD/react-msaview)
//
// This file reaches into the live MsaView model exposed by the `react-msaview`
// library (via the jbrowse-plugin-msaview wrapper) to drive a bidirectional
// hover highlight between a 3D structure and its alignment. The member names
// below are part of react-msaview's public model API — see
// react-msaview/packages/lib/src/model.ts (`mouseCol`, `setMousePos`). If those
// names change there, this sync silently stops working, so the two repos must
// be kept in step.
//
// NOTE on coordinates: `mouseCol` is an MSA *visible column* (accounts for both
// alignment gaps and hidden gappy columns), whereas `structureSeqHoverPos` is an
// ungapped residue index in the structure's sequence. We translate across gaps
// with react-msaview's `visibleColToSeqPos(rowName, col)` /
// `seqPosToVisibleCol(rowName, seqPos)`, anchoring the structure to its MSA row
// by matching sequences (see findStructureRowName). When the row can't be
// resolved (MSA not loaded, no matching row) we fall back to the 1:1 mapping,
// which is correct when the structure's row has no gaps and no columns hidden.
interface MsaView {
  id: string
  type: string
  connectedViewId?: string
  mouseCol?: number
  setMousePos?: (col?: number, row?: number) => void
  rowMap?: Map<string, string>
  seqPosToVisibleCol?: (rowName: string, seqPos: number) => number | undefined
  visibleColToSeqPos?: (
    rowName: string,
    visibleCol: number,
  ) => number | undefined
}

const ProteinToMsaHoverSync = observer(function ProteinToMsaHoverSync({
  model,
}: {
  model: LinearGenomeViewModel
}) {
  const session = getSession(model)
  const { views } = session

  const proteinView = getProteinView(session)

  // pair with the MSA either by an explicit connectedMsaViewId or, in the
  // genome-centric flow, by the genome view this structure and the MSA both
  // connect to (see findConnectedMsaView)
  const msaView = findConnectedMsaView(views as unknown as MsaView[], {
    connectedMsaViewId: proteinView?.connectedMsaViewId,
    structureViewId: proteinView?.primaryStructure?.connectedViewId,
  })

  useEffect(() => {
    if (!proteinView || !msaView) {
      return
    }

    const disposers: (() => void)[] = []

    // Resolve which MSA row corresponds to the structure once the MSA loads.
    // Recomputes only when the alignment rows or structure sequence change, not
    // on every hover, so the per-hover conversions below stay cheap.
    let structureRowName: string | undefined
    disposers.push(
      autorun(() => {
        const seq = proteinView.primaryStructure?.structureSequences?.[0]
        structureRowName = findStructureRowName(
          msaView.rowMap,
          seq === undefined ? undefined : stripStopCodon(seq),
        )
      }),
    )

    if (msaView.setMousePos) {
      const { setMousePos } = msaView
      disposers.push(
        autorun(() => {
          const structure = proteinView.primaryStructure
          if (structure) {
            const seqPos = structure.structureSeqHoverPos
            const col =
              seqPos !== undefined &&
              structureRowName !== undefined &&
              msaView.seqPosToVisibleCol
                ? msaView.seqPosToVisibleCol(structureRowName, seqPos)
                : seqPos
            setMousePos(col)
          } else {
            // structure went away (e.g. removed); clear the stale MSA hover
            setMousePos(undefined)
          }
        }),
      )
    }

    disposers.push(
      autorun(() => {
        const col = msaView.mouseCol
        const structure = proteinView.primaryStructure
        if (structure) {
          const hasFeatureHoverRange = untracked(
            () => !!structure.alignmentHoverRange,
          )
          if (!hasFeatureHoverRange) {
            const structureSeqPos =
              col !== undefined &&
              structureRowName !== undefined &&
              msaView.visibleColToSeqPos
                ? msaView.visibleColToSeqPos(structureRowName, col)
                : col
            structure.setHoveredPosition(
              structureSeqPos === undefined ? undefined : { structureSeqPos },
            )
          }
        }
      }),
    )

    return () => {
      disposers.forEach(d => {
        d()
      })
    }
  }, [proteinView, msaView])

  return null
})

export default ProteinToMsaHoverSync
