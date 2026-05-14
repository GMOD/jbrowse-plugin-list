import { applyLociInteractivity } from './applyLociInteractivity'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export default async function highlightResidueRange({
  structure,
  startResidue,
  endResidue,
  plugin,
}: {
  structure: Structure
  startResidue: number
  endResidue: number
  plugin: PluginContext
}) {
  await applyLociInteractivity({
    structure,
    startResidue,
    endResidue,
    plugin,
    mode: 'highlight',
  })
}

export async function selectResidueRange({
  structure,
  startResidue,
  endResidue,
  plugin,
}: {
  structure: Structure
  startResidue: number
  endResidue: number
  plugin: PluginContext
}) {
  await applyLociInteractivity({
    structure,
    startResidue,
    endResidue,
    plugin,
    mode: 'select',
  })
}
