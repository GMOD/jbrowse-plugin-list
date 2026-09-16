import { addDisposer, isAlive } from '@jbrowse/mobx-state-tree'
import { autorun } from 'mobx'

import { clickProteinToGenome } from './proteinToGenomeMapping'
import subscribeMolstarInteraction from './subscribeMolstarInteraction'

import type { ClickProteinToGenomeModel } from './proteinToGenomeMapping'
import type { MolstarLocationInfo } from './subscribeMolstarInteraction'
import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export type StructureInteractionHost = IAnyStateTreeNode &
  ClickProteinToGenomeModel & {
    readonly molstarPluginContext: PluginContext | undefined
    /** the 0-based position this interaction names on this structure, or
     * undefined when it landed on another structure or another chain */
    interactionPosition: (info: MolstarLocationInfo) => number | undefined
    setHoveredPosition: (arg?: {
      structureSeqPos?: number
      chain?: string
      code?: string
    }) => void
    setSelectedFeatureId: (uniqueId?: string) => void
    setViewError: (e: unknown) => void
  }

/**
 * Subscribe a structure to the Mol* plugin's click and hover, and resubscribe
 * whenever the plugin changes — a view remount installs a fresh PluginContext.
 * The previous subscription is torn down first so they don't accumulate across
 * remounts, and one that resolves after the context has already moved on is
 * disposed immediately rather than left dangling.
 *
 * Every structure of a view hears every interaction on the shared plugin, so
 * each handler asks `interactionPosition` whether this one was on it.
 */
export function attachStructureInteractions(host: StructureInteractionHost) {
  const addInteractionListener = (
    kind: 'click' | 'hover',
    onUpdate: (info: MolstarLocationInfo | undefined) => void,
  ) => {
    let unsubscribe: (() => void) | undefined
    addDisposer(host, () => {
      unsubscribe?.()
    })
    addDisposer(
      host,
      autorun(async () => {
        const { molstarPluginContext } = host
        unsubscribe?.()
        unsubscribe = undefined
        if (molstarPluginContext) {
          const dispose = await subscribeMolstarInteraction({
            plugin: molstarPluginContext,
            kind,
            onUpdate,
          })
          if (
            isAlive(host) &&
            host.molstarPluginContext === molstarPluginContext
          ) {
            unsubscribe = dispose
          } else {
            dispose()
          }
        }
      }),
    )
  }

  const forThisStructure = (info?: MolstarLocationInfo) => {
    const structureSeqPos = info && host.interactionPosition(info)
    return structureSeqPos === undefined
      ? undefined
      : { ...info, structureSeqPos }
  }

  addInteractionListener('click', info => {
    const hit = forThisStructure(info)
    if (!info) {
      // clicking the background is how a user puts a selection down; a click
      // that landed on another structure is that structure's
      host.setClickedStructureRange(undefined)
      host.setSelectedFeatureId(undefined)
    }
    if (hit) {
      host.setHoveredPosition(hit)
      host.setSelectedFeatureId(undefined)
      clickProteinToGenome({
        model: host,
        structureSeqPos: hit.structureSeqPos,
      }).catch((e: unknown) => {
        console.error(e)
        host.setViewError(e)
      })
    }
  })

  addInteractionListener('hover', info => {
    host.setHoveredPosition(forThisStructure(info))
  })
}
