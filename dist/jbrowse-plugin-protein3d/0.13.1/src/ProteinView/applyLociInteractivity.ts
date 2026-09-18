import loadMolstar from './loadMolstar'

import type {
  Structure,
  StructureElement,
  StructureSelection,
} from 'molstar/lib/mol-model/structure'
import type { Script } from 'molstar/lib/mol-script/script'

/** The part of a plugin's `managers.interactivity` that lights residues. */
export interface LociMarks {
  lociHighlights: {
    clearHighlights(): void
    highlight(current: { loci: StructureElement.Loci }): void
  }
  lociSelects: {
    deselectAll(): void
    select(current: { loci: StructureElement.Loci }): void
  }
}

/** Residues of one structure, addressed by Mol*'s own `label_seq_id`. */
export interface ResidueTarget {
  structure: Structure
  /** Confines the residues to this mmCIF entity, so a residue number doesn't
   * light up on a binding partner or the other half of a homodimer. */
  entityId?: string
  labelSeqIds: number[]
}

/**
 * The loci for a set of residues. Taking label_seq_ids rather than the
 * plugin's 0-based positions keeps that conversion in one place (see
 * Entity.seqIds) instead of assuming `pos + 1`, which mis-paints a PDB file
 * whose residues don't start at 1.
 */
export function residueLoci(
  molstar: {
    Script: typeof Script
    StructureSelection: typeof StructureSelection
  },
  { structure, entityId, labelSeqIds }: ResidueTarget,
) {
  const sel = molstar.Script.getStructureSelection(
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
  return molstar.StructureSelection.toLociWithSourceUnits(sel)
}

/**
 * Reconcile one interactivity channel (hover-`highlight` or click-`select`) to
 * the residues every structure of a view wants lit. The channel is plugin-wide,
 * so a call covers all structures at once; clearing per structure wipes the
 * others. Nothing awaits between clearing and marking, so when two calls
 * overlap the later one's residues are what stay lit.
 */
export async function setMolstarLoci({
  interactivity,
  channel,
  targets,
}: {
  interactivity: LociMarks
  channel: 'highlight' | 'select'
  targets: ResidueTarget[]
}) {
  const molstar = await loadMolstar()
  const locis = targets
    .filter(t => t.labelSeqIds.length > 0)
    .map(t => residueLoci(molstar, t))
  const { lociHighlights, lociSelects } = interactivity
  if (channel === 'highlight') {
    lociHighlights.clearHighlights()
    for (const loci of locis) {
      lociHighlights.highlight({ loci })
    }
  } else {
    lociSelects.deselectAll()
    for (const loci of locis) {
      lociSelects.select({ loci })
    }
  }
}
