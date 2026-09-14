import {
  resolveStructureUrl,
  structureDisplayLabel,
} from '../LaunchProteinView/utils/structureUrls'

import type { ProteinColorScheme } from './applyColorTheme'
import type { AlignmentAlgorithm } from './types'
import type { PairwiseAlignment } from '../mappings'
import type { SimpleFeatureSerialized } from '@jbrowse/core/util'

/**
 * One structure in a ProteinView, described declaratively. Every field maps
 * directly onto a Structure model property, so a spec is exactly the snapshot
 * MST hydrates — no imperative post-creation setup.
 */
export interface ProteinStructureSpec {
  url?: string
  data?: string
  // shorthands resolved to `url` at hydration when neither url nor data is set:
  // uniprotId -> AlphaFold model, pdbId -> RCSB mmCIF
  uniprotId?: string
  pdbId?: string
  // id of the LinearGenomeView this structure maps residues<->codons against
  connectedViewId?: string
  // transcript feature driving the genome<->protein mapping
  feature?: SimpleFeatureSerialized
  // protein sequence to align against; '' means use the structure's own
  userProvidedTranscriptSequence?: string
  // 0-based half-open structure-residue range lit on load, as if clicked
  initialSelection?: { start: number; end: number }
  // the same selection named by author residue numbers, inclusive, the way a
  // paper cites a site (R248 is { start: 248, end: 248 }); resolved through the
  // structure's own numbering once it loads
  initialResidues?: { start: number; end: number }
  // the same selection as 1-based inclusive residues of the transcript's own
  // translation, resolved through the alignment; exact for any structure the
  // transcript aligns to, so a domain map needs no per-entry numbering
  initialTranscriptResidues?: { start: number; end: number }
  pairwiseAlignment?: PairwiseAlignment
  // whether pairwiseAlignment came from outside and is used exactly as given;
  // defaults to true when a pairwiseAlignment is present
  alignmentImported?: boolean
  // mmCIF entity id the transcript maps to; chosen by alignment when absent
  mappedEntityId?: string
}

/**
 * A whole ProteinView described declaratively. Mirrors the top-level model
 * properties: there is no separate `init` channel, matching how the launchers
 * and gene-explorer already build the snapshot.
 */
export interface ProteinViewSpec {
  structures: ProteinStructureSpec[]
  displayName?: string
  height?: number
  showControls?: boolean
  showAlignment?: boolean
  showHighlight?: boolean
  showProteinTracks?: boolean
  compactTracks?: boolean
  zoomToBaseLevel?: boolean
  autoScrollAlignment?: boolean
  colorScheme?: ProteinColorScheme
  alignmentAlgorithm?: AlignmentAlgorithm
}

/**
 * The single source of truth for turning a ProteinViewSpec into the snapshot
 * handed to `session.addView('ProteinView', ...)`. Every launch path funnels
 * through here so they can't drift into different subsets of the same view.
 */
/**
 * The name a view gets when its snapshot carries none: the transcript it maps
 * and each structure's label, so a session written by hand or by a page opens
 * as "Protein view - TP53 - 1TUP" rather than "Untitled view".
 */
export function defaultDisplayName(structures: ProteinStructureSpec[]) {
  const featureName = structures.find(s => s.feature)?.feature?.name
  return [
    'Protein view',
    typeof featureName === 'string' ? featureName : undefined,
    ...structures.map(s =>
      structureDisplayLabel({ url: resolveStructureUrl(s), data: s.data }),
    ),
  ]
    .filter(s => !!s)
    .join(' - ')
}

export function proteinViewSnapshot(spec: ProteinViewSpec) {
  const { structures, ...view } = spec
  return {
    type: 'ProteinView' as const,
    ...view,
    structures: structures.map(structure => ({
      ...structure,
      userProvidedTranscriptSequence:
        structure.userProvidedTranscriptSequence ?? '',
    })),
  }
}
