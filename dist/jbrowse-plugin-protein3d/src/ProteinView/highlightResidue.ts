import loadMolstar from './loadMolstar'
import { getMolstarStructureSelection } from './util'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export default async function highlightResidue({
  structure,
  selectedResidue,
  plugin,
}: {
  structure: Structure
  selectedResidue: number
  plugin: PluginContext
}) {
  const { StructureSelection } = await loadMolstar()
  const sel = await getMolstarStructureSelection({
    structure,
    selectedResidue: selectedResidue + 1,
  })
  const loci = StructureSelection.toLociWithSourceUnits(sel)
  plugin.managers.interactivity.lociHighlights.clearHighlights()
  plugin.managers.interactivity.lociHighlights.highlight({
    loci,
  })
}
