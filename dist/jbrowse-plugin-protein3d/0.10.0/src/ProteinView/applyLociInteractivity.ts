import loadMolstar from './loadMolstar'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

/**
 * Reconcile one interactivity channel (hover-`highlight` or click-`select`) to
 * a set of residues, addressed by molstar's own `label_seq_id`.
 *
 * Taking ids rather than the plugin's 0-based structure positions keeps the
 * conversion in one place (see Entity.seqIds) instead of assuming `pos + 1`,
 * which silently mis-paints PDB files whose residues don't start at 1. Passing
 * an empty/undefined list clears the channel, so callers describe the target
 * state declaratively rather than juggling clear/apply calls.
 */
export async function setMolstarLoci({
  structure,
  plugin,
  channel,
  labelSeqIds,
  entityId,
}: {
  structure: Structure
  plugin: PluginContext
  channel: 'highlight' | 'select'
  labelSeqIds: number[] | undefined
  /** Confine the loci to this mmCIF entity so a residue number doesn't light up
   * on unrelated chains (binding partners, the other half of a homodimer). */
  entityId?: string
}) {
  const { lociHighlights, lociSelects } = plugin.managers.interactivity
  if (channel === 'highlight') {
    lociHighlights.clearHighlights()
  } else {
    lociSelects.deselectAll()
  }

  if (labelSeqIds?.length) {
    const { StructureSelection, Script } = await loadMolstar()
    const sel = Script.getStructureSelection(
      Q =>
        Q.struct.generator.atomGroups({
          ...(entityId
            ? {
                'chain-test': Q.core.rel.eq([
                  Q.struct.atomProperty.macromolecular.label_entity_id(),
                  entityId,
                ]),
              }
            : {}),
          // one set membership test rather than a chain of ORs, which for a
          // whole-alignment selection was one comparison per residue
          'residue-test': Q.core.set.has([
            Q.core.type.set([...new Set(labelSeqIds)]),
            Q.struct.atomProperty.macromolecular.label_seq_id(),
          ]),
          'group-by': Q.struct.atomProperty.macromolecular.residueKey(),
        }),
      structure,
    )
    const loci = StructureSelection.toLociWithSourceUnits(sel)
    if (channel === 'highlight') {
      lociHighlights.highlight({ loci })
    } else {
      lociSelects.select({ loci })
    }
  }
}
