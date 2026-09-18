import { addDisposer, isAlive } from '@jbrowse/mobx-state-tree'
import { autorun } from 'mobx'

import { clickProteinToGenome } from './proteinToGenomeMapping'
import subscribeMolstarInteraction from './subscribeMolstarInteraction'

import type { ClickProteinToGenomeModel } from './proteinToGenomeMapping'
import type { MolstarLocationInfo } from './subscribeMolstarInteraction'
import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export type StructureInteractionHost = ClickProteinToGenomeModel & {
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

export type ViewInteractionHost = IAnyStateTreeNode & {
  readonly molstarPluginContext: PluginContext | undefined
  readonly structures: readonly StructureInteractionHost[]
}

function forStructure(
  structure: StructureInteractionHost,
  info?: MolstarLocationInfo,
) {
  const structureSeqPos = info && structure.interactionPosition(info)
  return structureSeqPos === undefined
    ? undefined
    : { ...info, structureSeqPos }
}

function onClick(
  structure: StructureInteractionHost,
  info?: MolstarLocationInfo,
) {
  if (!info) {
    // clicking the background is how a user puts a selection down; a click
    // that landed on another structure is that structure's
    structure.setClickedStructureRange(undefined)
    structure.setSelectedFeatureId(undefined)
  }
  const hit = forStructure(structure, info)
  if (hit) {
    structure.setHoveredPosition(hit)
    structure.setSelectedFeatureId(undefined)
    clickProteinToGenome({
      model: structure,
      structureSeqPos: hit.structureSeqPos,
    }).catch((e: unknown) => {
      console.error(e)
      structure.setViewError(e)
    })
  }
}

/**
 * Subscribe a view to the Mol* plugin's click and hover, once for all its
 * structures, and resubscribe whenever the plugin changes — a remount
 * installs a fresh PluginContext. The previous subscription is torn down
 * first, and one that resolves after the context has already moved on is
 * disposed immediately rather than left dangling.
 *
 * Every event goes to every structure, since the plugin is shared, and each
 * asks `interactionPosition` whether the event was on it. A structure added
 * later hears the next event with nothing to subscribe.
 */
export function attachViewInteractions(view: ViewInteractionHost) {
  const listen = (
    kind: 'click' | 'hover',
    onUpdate: (info: MolstarLocationInfo | undefined) => void,
  ) => {
    let unsubscribe: (() => void) | undefined
    addDisposer(view, () => {
      unsubscribe?.()
    })
    addDisposer(
      view,
      autorun(async () => {
        const { molstarPluginContext } = view
        unsubscribe?.()
        unsubscribe = undefined
        if (molstarPluginContext) {
          const dispose = await subscribeMolstarInteraction({
            plugin: molstarPluginContext,
            kind,
            onUpdate,
          })
          if (
            isAlive(view) &&
            view.molstarPluginContext === molstarPluginContext
          ) {
            unsubscribe = dispose
          } else {
            dispose()
          }
        }
      }),
    )
  }

  listen('click', info => {
    for (const structure of view.structures) {
      onClick(structure, info)
    }
  })
  listen('hover', info => {
    for (const structure of view.structures) {
      structure.setHoveredPosition(forStructure(structure, info))
    }
  })
}
