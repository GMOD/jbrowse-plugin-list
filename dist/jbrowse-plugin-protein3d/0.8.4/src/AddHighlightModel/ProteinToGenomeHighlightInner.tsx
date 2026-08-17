import React from 'react'

import { getSession } from '@jbrowse/core/util'
import { observer } from 'mobx-react'

import Highlight from './Highlight'
import { getProteinViews, getStructuresConnectedTo } from './proteinViewLookup'

import type { Region } from '@jbrowse/core/util/types'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

type HighlightField = 'clickGenomeHighlights' | 'hoverGenomeHighlights'

const ProteinToGenomeHighlightInner = observer(
  function ProteinToGenomeHighlightInner({
    model,
    field,
  }: {
    model: LinearGenomeViewModel
    field: HighlightField
  }) {
    const session = getSession(model)
    const { assemblyManager } = session
    const { assemblyNames, id: viewId } = model
    const assemblyName = assemblyNames[0]
    const assembly = assemblyName
      ? assemblyManager.get(assemblyName)
      : undefined
    // Only structures that declare this genome view as their connection: the
    // regions are transcript coordinates on that view's assembly, so painting
    // them into any other genome view would place a highlight at coordinates
    // that mean nothing there.
    const structures = getStructuresConnectedTo(
      getProteinViews(session),
      viewId,
    )
    return assembly && assemblyName ? (
      <>
        {structures.flatMap((structure, idx) =>
          structure[field].map((r: Region, idx2: number) => (
            <Highlight
              key={`${r.refName}-${r.start}-${r.end}-${idx}-${idx2}`}
              model={model}
              region={{
                start: r.start,
                end: r.end,
                refName: r.refName,
                assemblyName,
              }}
            />
          )),
        )}
      </>
    ) : null
  },
)

export default ProteinToGenomeHighlightInner
