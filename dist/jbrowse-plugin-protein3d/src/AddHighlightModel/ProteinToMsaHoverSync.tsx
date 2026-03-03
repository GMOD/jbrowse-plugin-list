import { useEffect } from 'react'

import { getSession } from '@jbrowse/core/util'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'

import type { JBrowsePluginProteinViewModel } from '../ProteinView/model'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

interface MsaView {
  id: string
  type: string
  setMouseoveredColumn?: (col: number | undefined) => void
  mouseoveredColumn?: number
}

const ProteinToMsaHoverSync = observer(function ProteinToMsaHoverSync({
  model,
}: {
  model: LinearGenomeViewModel
}) {
  const session = getSession(model)
  const { views } = session

  const proteinView = views.find(f => f.type === 'ProteinView') as
    | JBrowsePluginProteinViewModel
    | undefined

  const connectedMsaViewId = proteinView?.connectedMsaViewId
  const msaView = connectedMsaViewId
    ? (views.find(f => f.id === connectedMsaViewId) as MsaView | undefined)
    : undefined

  // Sync protein hover to MSA
  useEffect(() => {
    if (!proteinView || !msaView?.setMouseoveredColumn) {
      return
    }

    const disposer = autorun(() => {
      const structure = proteinView.structures[0]
      if (structure) {
        const pos = structure.structureSeqHoverPos
        msaView.setMouseoveredColumn?.(pos)
      }
    })

    return () => {
      disposer()
    }
  }, [proteinView, msaView])

  // Sync MSA hover to protein
  useEffect(() => {
    if (!proteinView || !msaView) {
      return
    }

    const disposer = autorun(() => {
      const col = msaView.mouseoveredColumn
      const structure = proteinView.structures[0]
      if (structure && col !== undefined) {
        structure.highlightFromExternal(col)
      } else if (structure && col === undefined) {
        structure.clearHighlightFromExternal()
      }
    })

    return () => {
      disposer()
    }
  }, [proteinView, msaView])

  return null
})

export default ProteinToMsaHoverSync
