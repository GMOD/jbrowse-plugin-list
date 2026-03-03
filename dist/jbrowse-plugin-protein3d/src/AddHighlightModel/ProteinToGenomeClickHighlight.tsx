import React from 'react'

import { getSession } from '@jbrowse/core/util'
import { observer } from 'mobx-react'

import Highlight from './Highlight'
import {
  JBrowsePluginProteinStructureModel,
  JBrowsePluginProteinViewModel,
} from '../ProteinView/model'

import type { Region } from '@jbrowse/core/util/types'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

type LGV = LinearGenomeViewModel

const ProteinToGenomeClickHighlight = observer(
  function ProteinToGenomeClickHighlight({ model }: { model: LGV }) {
    const { assemblyManager, views } = getSession(model)
    const { assemblyNames } = model
    const proteinView = views.find(f => f.type === 'ProteinView') as
      | JBrowsePluginProteinViewModel
      | undefined
    const assemblyName = assemblyNames[0]!
    const assembly = assemblyManager.get(assemblyName)
    return assembly ? (
      <>
        {proteinView?.structures.map(
          (structure: JBrowsePluginProteinStructureModel, idx: number) =>
            structure.clickGenomeHighlights.map((r: Region, idx2: number) => (
              <Highlight
                key={`${JSON.stringify(r)}-${idx}-${idx2}}`}
                start={r.start}
                end={r.end}
                refName={r.refName}
                assemblyName={assemblyName}
                model={model}
              />
            )),
        )}
      </>
    ) : null
  },
)

export default ProteinToGenomeClickHighlight
