import loadMolstar from './loadMolstar'

import type { PluginContext } from 'molstar/lib/mol-plugin/context'

export interface MolstarLocationInfo {
  /**
   * Molstar's own `label_seq_id` for the residue, passed up raw. The model
   * converts it to a 0-based structure position through the entity's seqIds —
   * `label_seq_id - 1` is right only when the entity's residues run from 1, and
   * silently wrong for a PDB file numbered from its author residues.
   *
   * label_ rather than auth_ deliberately: for AlphaFold the two agree, but for
   * PDB structures whose author numbering is offset or gapped they diverge, and
   * label_seq_id is what the outbound highlight speaks.
   */
  labelSeqId: number
  code: string
  chain: string
  /** mmCIF label_entity_id of the hovered residue. Lets the model reject
   * interactions on chains that aren't the transcript's mapped entity. */
  entityId: string
}

function extractLocationInfo(
  molstar: Awaited<ReturnType<typeof loadMolstar>>,
  location: ReturnType<
    (typeof molstar.StructureElement.Loci)['getFirstLocation']
  > &
    object,
): MolstarLocationInfo {
  return {
    labelSeqId: molstar.StructureProperties.residue.label_seq_id(location),
    code: molstar.StructureProperties.atom.label_comp_id(location),
    chain: molstar.StructureProperties.chain.auth_asym_id(location),
    entityId: molstar.StructureProperties.entity.id(location),
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
