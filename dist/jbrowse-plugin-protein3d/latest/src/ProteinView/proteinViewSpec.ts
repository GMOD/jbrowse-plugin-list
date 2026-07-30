import type { ProteinColorScheme } from './applyColorTheme'
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
  pairwiseAlignment?: PairwiseAlignment
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
  alignmentAlgorithm?: string
  connectedMsaViewId?: string
}

/**
 * The single source of truth for turning a ProteinViewSpec into the snapshot
 * handed to `session.addView('ProteinView', ...)`. Every launch path funnels
 * through here so they can't drift into different subsets of the same view.
 */
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
