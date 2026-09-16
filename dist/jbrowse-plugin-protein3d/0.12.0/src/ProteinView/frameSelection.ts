import { residueLoci } from './applyLociInteractivity'
import loadMolstar from './loadMolstar'

import type { Loci } from 'molstar/lib/mol-model/loci'
import type { Structure } from 'molstar/lib/mol-model/structure'

interface FramedStructure {
  readonly loading: boolean
  readonly seededSelection: boolean
  readonly molstarStructure: Structure | undefined
  readonly mappedEntity: { entityId: string } | undefined
  readonly selectLabelSeqIds: number[]
}

export interface SelectionFramerHost {
  readonly molstarPluginContext:
    { managers: { camera: { focusLoci(loci: Loci[]): void } } } | undefined
  readonly structures: readonly FramedStructure[]
  readonly superposedCount: number
}

/**
 * Builds the body of the autorun that moves the camera to a declared
 * selection. A session "opened on R248" used to show the whole fold with R248
 * out of sight. It waits until every structure has settled and, with several,
 * until they are superposed, because the reset that ends a superposition would
 * undo it; then it frames the seeded residues once per plugin. Only a spec's
 * seed moves the camera: a click is the user's, and the view they chose stays.
 */
export function makeSelectionFramer(host: SelectionFramerHost) {
  let framedPlugin: SelectionFramerHost['molstarPluginContext']

  return function frameSeededSelection() {
    const { molstarPluginContext: plugin, structures, superposedCount } = host
    const settled =
      structures.length > 0 &&
      structures.every(s => !s.loading) &&
      (structures.length < 2 || superposedCount === structures.length)
    if (!plugin || plugin === framedPlugin || !settled) {
      return
    }
    // a seed resolved by the same change that settles the structure may land
    // after this run, so the plugin counts as framed only once it has targets
    const targets = structures.flatMap(s =>
      s.seededSelection && s.molstarStructure && s.selectLabelSeqIds.length
        ? [
            {
              structure: s.molstarStructure,
              entityId: s.mappedEntity?.entityId,
              labelSeqIds: s.selectLabelSeqIds,
            },
          ]
        : [],
    )
    if (targets.length === 0) {
      return
    }
    framedPlugin = plugin
    loadMolstar()
      .then(molstar => {
        if (host.molstarPluginContext === plugin) {
          plugin.managers.camera.focusLoci(
            targets.map(t => residueLoci(molstar, t)),
          )
        }
      })
      .catch((e: unknown) => {
        console.error(e)
      })
  }
}
