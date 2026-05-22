import loadMolstar from './loadMolstar'

import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export interface MolstarLocationInfo {
  structureSeqPos: number
  code: string
  chain: string
}

function extractLocationInfo(
  molstar: Awaited<ReturnType<typeof loadMolstar>>,
  location: ReturnType<
    (typeof molstar.StructureElement.Loci)['getFirstLocation']
  > &
    object,
): MolstarLocationInfo {
  return {
    structureSeqPos:
      molstar.StructureProperties.residue.auth_seq_id(location) - 1,
    code: molstar.StructureProperties.atom.label_comp_id(location),
    chain: molstar.StructureProperties.chain.auth_asym_id(location),
  }
}

/**
 * Subscribe to molstar's click/hover behavior with the location-extraction
 * boilerplate factored out. The handler receives extracted location info when
 * the cursor is over a structure element, or `undefined` otherwise (so e.g.
 * hover handlers can clear state when the cursor leaves).
 *
 * Returns a cleanup function suitable for use with mobx's addDisposer.
 */
export default async function subscribeMolstarInteraction({
  plugin,
  kind,
  onUpdate,
}: {
  plugin: PluginContext
  kind: 'click' | 'hover'
  onUpdate: (info: MolstarLocationInfo | undefined) => void
}): Promise<() => void> {
  const molstar = await loadMolstar()
  const subscription = plugin.behaviors.interaction[kind].subscribe(e => {
    if (molstar.StructureElement.Loci.is(e.current.loci)) {
      const loc = molstar.StructureElement.Loci.getFirstLocation(e.current.loci)
      onUpdate(loc ? extractLocationInfo(molstar, loc) : undefined)
    } else {
      onUpdate(undefined)
    }
  })
  return () => {
    subscription.unsubscribe()
  }
}
