import { looksLikePlddt, stripStopCodon, structurePos } from 'p2s_mapper'

import { cssScaleOf, rampKeyOf } from './colorScale'
import { resolvedColor } from './proteinColor'
import { RESIDUE_COLORS } from './residueColors'

import type { ProteinColor } from './proteinColor'
import type { CoordinateMapper, Entity, EntityConfidence } from 'p2s_mapper'

type StructureToAlignment = CoordinateMapper['structureToAlignment'] | undefined

// Kyte-Doolittle hydropathy index. Positive = hydrophobic, negative =
// hydrophilic. Residues absent from the table (X, gaps, non-standard) map to
// undefined so they render as gaps in the track.
const KYTE_DOOLITTLE: Record<string, number> = {
  I: 4.5,
  V: 4.2,
  L: 3.8,
  F: 2.8,
  C: 2.5,
  M: 1.9,
  A: 1.8,
  G: -0.4,
  T: -0.7,
  S: -0.8,
  W: -0.9,
  Y: -1.3,
  P: -1.6,
  H: -3.2,
  E: -3.5,
  Q: -3.5,
  D: -3.5,
  N: -3.5,
  K: -3.9,
  R: -4.5,
}

export function kyteDoolittle(aa: string): number | undefined {
  return KYTE_DOOLITTLE[aa]
}

export function kyteDoolittleScores(seq: string): (number | undefined)[] {
  return Array.from(seq, kyteDoolittle)
}

/**
 * Maps per-structure-residue values (indexed by 0-based structure sequence
 * position) onto alignment columns through `structureToAlignment`.
 * Residues with no value or no alignment column (gaps) are dropped.
 */
export function mapResidueValuesToColumns(
  values: (number | undefined)[],
  structureToAlignment: StructureToAlignment,
): { col: number; value: number }[] {
  return structureToAlignment
    ? values.flatMap((value, pos) => {
        const col = structureToAlignment(structurePos(pos))
        return value !== undefined && col !== undefined ? [{ col, value }] : []
      })
    : []
}

/**
 * Per-residue pLDDT of an entity on alignment columns, only when the
 * B-factor column actually looks like AlphaFold confidence. Values are looked
 * up by label_seq_id through the entity's own seqIds, so an unobserved
 * residue leaves a gap instead of shifting the rest of the track.
 */
export function confidenceCells(
  entity: Entity | undefined,
  confidence: readonly EntityConfidence[] | undefined,
  structureToAlignment: StructureToAlignment,
) {
  const byLabelSeqId = confidence?.find(
    c => c.entityId === entity?.entityId,
  )?.byLabelSeqId
  const values =
    entity && byLabelSeqId
      ? entity.seqIds.map(id => byLabelSeqId.get(id))
      : undefined
  return values && looksLikePlddt(values.filter(v => v !== undefined))
    ? mapResidueValuesToColumns(values, structureToAlignment)
    : []
}

/** Per-residue Kyte-Doolittle hydrophobicity of a protein entity on
 * alignment columns */
export function hydrophobicityCells(
  entity: Entity | undefined,
  structureToAlignment: StructureToAlignment,
) {
  return entity?.seq && !entity.nucleicAcid
    ? mapResidueValuesToColumns(
        kyteDoolittleScores(stripStopCodon(entity.seq)),
        structureToAlignment,
      )
    : []
}

/** The hydrophobicity row's color: the view's color object while the view
 * colors by hydrophobicity, so a member it sets reaches the row too */
export function hydrophobicityScale(color: ProteinColor) {
  const resolved =
    color.field === 'hydrophobicity' ? resolvedColor(color) : undefined
  const scale =
    resolved?.scale === 'linear' ? resolved : RESIDUE_COLORS.hydrophobicity
  return {
    title: scale.title ?? '',
    paint: cssScaleOf(scale),
    key: rampKeyOf(scale),
  }
}
