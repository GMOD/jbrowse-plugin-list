import { SimpleFeature, getSession } from '@jbrowse/core/util'
import {
  type Instance,
  addDisposer,
  getParent,
  isAlive,
  types,
} from '@jbrowse/mobx-state-tree'
import { autorun, when } from 'mobx'

import { setMolstarLoci } from './applyLociInteractivity'
import {
  alignTranscriptToEntity,
  chooseMappedEntity,
  interactionMatchesMappedEntity,
} from './chooseMappedEntity'
import {
  COMPACT_TRACK_GAP,
  COMPACT_TRACK_HEIGHT,
  NORMAL_TRACK_GAP,
  NORMAL_TRACK_HEIGHT,
} from './constants'
import {
  type CoordinateMapper,
  alignmentCol,
  makeCoordinateMapper,
  structurePos,
} from './coordinates'
import { looksLikePlddt } from './extractPerResidueConfidence'
import { proteinAbbreviationMapping } from './proteinAbbreviationMapping'
import {
  clickProteinToGenome,
  proteinRangeToGenomeMapping,
  proteinToGenomeMapping,
} from './proteinToGenomeMapping'
import { kyteDoolittleScores, mapResidueValuesToColumns } from './residueTracks'
import subscribeMolstarInteraction, {
  type MolstarLocationInfo,
} from './subscribeMolstarInteraction'
import { genomeHoverToTranscriptPos } from './util'
import {
  getUniprotIdFromAlphaFoldTarget,
  resolveStructureUrl,
  structureDisplayLabel,
} from '../LaunchProteinView/utils/structureUrls'
import { stripStopCodon } from '../LaunchProteinView/utils/util'
import {
  alignmentLength,
  codonGenomeSpan,
  genomeToTranscriptSeqMapping,
} from '../mappings'
import {
  makeLabelSeqIdIndex,
  rangeToLabelSeqIds,
  residueNumber,
  residueRangeToPositions,
  toLabelSeqIds,
} from './extractStructureSequences'

import type { Entity } from './extractStructureSequences'
import type { EntityConfidence, StructureData } from './loadStructureData'
import type { ProteinStructureSpec } from './proteinViewSpec'
import type { PairwiseAlignment } from '../mappings'
import type { AlignmentAlgorithm } from './types'
import type { SimpleFeatureSerialized } from '@jbrowse/core/util'
import type { Region as IRegion } from '@jbrowse/core/util/types'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'
import type { Structure as MolstarStructure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

type LGV = LinearGenomeViewModel
type MaybeLGV = LGV | undefined
type MaybePairwiseAlignment = PairwiseAlignment | undefined

export interface ParentProteinView {
  zoomToBaseLevel: boolean
  autoScrollAlignment: boolean
  showHighlight: boolean
  showProteinTracks: boolean
  compactTracks: boolean
  alignmentAlgorithm: AlignmentAlgorithm
  molstarPluginContext: PluginContext | undefined
  setShowAlignment: (f: boolean) => void
  setError: (e: unknown) => void
}

const Structure = types
  .model({
    /**
     * #property
     */
    url: types.maybe(types.string),
    /**
     * #property
     */
    data: types.maybe(types.string),
    /**
     * #property
     */
    connectedViewId: types.maybe(types.string),
    /**
     * #property
     */
    pairwiseAlignment: types.frozen<MaybePairwiseAlignment>(),
    /**
     * #property
     */
    feature: types.frozen<SimpleFeatureSerialized | undefined>(),
    /**
     * #property
     * Optional so a hand-authored `structures: [{ url }]` snapshot hydrates
     * without this field; empty means "use the structure's own sequence".
     */
    userProvidedTranscriptSequence: types.optional(types.string, ''),
    /**
     * #property
     * Declarative seed for the persistent domain selection: a 0-based,
     * half-open structure-residue range `{ start, end }` lit on load exactly as
     * if the user had clicked that domain — magenta in the 3D structure, a band
     * on the connected genome view, and the range in the alignment. Lets a
     * session spec open with a domain pre-highlighted, with no click.
     */
    initialSelection: types.frozen<
      { start: number; end: number } | undefined
    >(),
    /**
     * #property
     * The same seed named by author residue numbers, inclusive, as a paper
     * cites a site: `{ start: 248, end: 248 }` for p53's R248 whichever
     * fragment the crystal holds. Resolved to positions through the mapped
     * entity's numbering once the structure loads, so it needs no knowledge of
     * where the construct starts.
     */
    initialResidues: types.frozen<{ start: number; end: number } | undefined>(),
    /**
     * #property
     * mmCIF entity the transcript maps to. Chosen by alignment when the
     * structure loads (see chooseMappedEntity), or by the user through the
     * chain picker. Persisted beside `pairwiseAlignment` because that
     * alignment is against this entity's sequence: restoring one without the
     * other would light chain A's residues with chain C's alignment.
     */
    mappedEntityId: types.maybe(types.string),
  })
  // Input-only shorthand: remap a `{ uniprotId }`/`{ pdbId }` snapshot to a
  // concrete `url` at hydration and strip the shorthand keys (they are not
  // stored — uniprotId stays derivable from the url via the getter below), so a
  // hand-authored snapshot loads without the caller knowing the AlphaFold/RCSB
  // URL format. An explicit url/data always wins; the shorthand resolves the
  // canonical isoform (AF-<id>-F1) only. Idempotent: a re-snapshot has no
  // shorthand keys and an already-set url, so it passes through unchanged.
  .preProcessSnapshot(
    ({ uniprotId, pdbId, ...rest }: ProteinStructureSpec) => ({
      ...rest,
      url: resolveStructureUrl({ ...rest, uniprotId, pdbId }),
    }),
  )
  .volatile(() => ({
    /**
     * #volatile
     * Inclusive-exclusive structure-residue range from a click; drives the
     * derived clickGenomeHighlights getter.
     */
    clickedStructureRange: undefined as
      { start: number; end: number } | undefined,

    /**
     * #volatile
     * The 'genome' source is set when the hover originated from the
     * connected LinearGenomeView; hoverGenomeHighlights ignores it to avoid
     * echoing a codon-width highlight back onto the same genome view.
     */
    hoverPosition: undefined as
      | {
          structureSeqPos?: number
          code?: string
          chain?: string
          source: 'structure' | 'genome'
        }
      | undefined,
    /**
     * #volatile
     */
    entities: undefined as Entity[] | undefined,
    /**
     * #volatile
     * Per-entity B-factor / pLDDT keyed by label_seq_id. Drives the
     * confidence feature track.
     */
    structureConfidence: undefined as EntityConfidence[] | undefined,
    /**
     * #volatile
     */
    isMouseInAlignment: false,
    /**
     * #volatile
     * Tracks whether this structure has been loaded into Molstar
     */
    loadedToMolstar: false,
    /**
     * #volatile
     * The molstar Structure this model's load produced, captured from the
     * loader rather than looked up by position in
     * `hierarchy.current.structures` — that array is ordered by load
     * completion, so with two structures in flight index N can be another
     * model's geometry.
     */
    molstarStructure: undefined as MolstarStructure | undefined,
    /**
     * #volatile
     * Range of alignment positions to highlight (e.g., when hovering a protein feature)
     */
    alignmentHoverRange: undefined as
      { start: number; end: number } | undefined,
    /**
     * #volatile
     * The uniqueId of the currently selected protein feature (for persistent highlight)
     */
    selectedFeatureId: undefined as string | undefined,
    /**
     * #volatile
     * Set of feature track types that are hidden
     */
    hiddenFeatureTypes: new Set<string>(),
    /**
     * #volatile
     * Set of feature track types expanded to show every overlapping feature on
     * its own lane (collapsed types draw all features on a single row)
     */
    expandedFeatureTypes: new Set<string>(),
  }))
  .actions(self => ({
    setStructureData(data: StructureData) {
      self.entities = data.entities
      self.structureConfidence = data.confidence
      self.molstarStructure = data.molstarStructure
    },
    /**
     * #action
     */
    hideFeatureType(type: string) {
      self.hiddenFeatureTypes = new Set([...self.hiddenFeatureTypes, type])
    },
    /**
     * #action
     */
    showFeatureType(type: string) {
      const newSet = new Set(self.hiddenFeatureTypes)
      newSet.delete(type)
      self.hiddenFeatureTypes = newSet
    },
    /**
     * #action
     */
    showAllFeatureTypes() {
      self.hiddenFeatureTypes = new Set()
    },
    /**
     * #action
     */
    toggleFeatureTypeExpanded(type: string) {
      const next = new Set(self.expandedFeatureTypes)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      self.expandedFeatureTypes = next
    },
    /**
     * #action
     */
    setLoadedToMolstar(val: boolean) {
      self.loadedToMolstar = val
      if (!val) {
        // the handle belongs to the plugin we were unloaded from
        self.molstarStructure = undefined
      }
    },
  }))
  .views(self => ({
    /**
     * #getter
     */
    get connectedView() {
      const { views } = getSession(self)
      return views.find(f => f.id === self.connectedViewId) as MaybeLGV
    },
  }))
  .actions(self => ({
    /**
     * #action
     */
    setClickedStructureRange(range?: { start: number; end: number }) {
      self.clickedStructureRange = range
    },
    /**
     * #action
     */
    setAlignmentHoverRange(range?: { start: number; end: number }) {
      self.alignmentHoverRange = range
    },
    /**
     * #action
     */
    setSelectedFeatureId(uniqueId?: string) {
      self.selectedFeatureId = uniqueId
    },
    /**
     * #action
     */
    setHoveredPosition(arg?: {
      structureSeqPos?: number
      chain?: string
      code?: string
    }) {
      self.hoverPosition = arg ? { ...arg, source: 'structure' } : undefined
    },
    /**
     * #action
     * Records a hover that originated from the connected LinearGenomeView.
     * Drives the 3D structure / feature-track highlight, but is excluded
     * from hoverGenomeHighlights so it doesn't echo back onto that same view.
     */
    setGenomeHoveredPosition(structureSeqPos?: number) {
      self.hoverPosition =
        structureSeqPos === undefined
          ? undefined
          : { structureSeqPos, source: 'genome' }
    },
    /**
     * #action
     */
    setAlignment(r?: PairwiseAlignment) {
      self.pairwiseAlignment = r
    },
    /**
     * #action
     */
    setMappedEntityId(id?: string) {
      self.mappedEntityId = id
    },
    /**
     * #action
     */
    setIsMouseInAlignment(val: boolean) {
      self.isMouseInAlignment = val
    },
  }))
  .views(self => ({
    /**
     * #getter
     * Sequence strings of every polymer entity (back-compat for the alignment
     * autorun and presence checks).
     */
    get structureSequences() {
      return self.entities?.map(e => e.seq)
    },
    /**
     * #getter
     * The entity that maps to the transcript: the chosen one when
     * `mappedEntityId` is set, else the first, so a standalone structure with
     * no transcript still has a chain to read hovers from.
     */
    get mappedEntity() {
      const { entities, mappedEntityId } = self
      return entities?.find(e => e.entityId === mappedEntityId) ?? entities?.[0]
    },
    /**
     * #getter
     */
    get mappedStructureSeq() {
      return this.mappedEntity?.seq
    },
    /**
     * #getter
     * The structure's name in the UI: PDB id, AlphaFold accession, else file
     * name. Heads its alignment panel and prefixes its hover readout, so with
     * several structures open a reader can tell which panel and which residue
     * belongs to which structure.
     */
    get label() {
      return structureDisplayLabel(self)
    },
    /**
     * #getter
     * Extracts UniProt ID from AlphaFold URL if available
     */
    get uniprotId() {
      const { url } = self
      if (!url) {
        return undefined
      }
      return getUniprotIdFromAlphaFoldTarget(url)
    },
    /**
     * #getter
     * All structure/transcript/alignment coordinate conversions, built once
     * from the pairwise alignment (see coordinates.ts). Use its typed methods
     * for point conversions; the getters below expose the raw maps for
     * whole-map consumers.
     */
    get coordinateMapper(): CoordinateMapper | undefined {
      return self.pairwiseAlignment
        ? makeCoordinateMapper(self.pairwiseAlignment)
        : undefined
    },
    /**
     * #getter
     */
    get structureSeqToTranscriptSeqPosition() {
      return this.coordinateMapper?.maps.structureSeqToTranscriptSeqPosition
    },
    /**
     * #getter
     */
    get transcriptSeqToStructureSeqPosition() {
      return this.coordinateMapper?.maps.transcriptSeqToStructureSeqPosition
    },
    /**
     * #getter
     */
    get structurePositionToAlignmentMap() {
      return this.coordinateMapper?.maps.structurePositionToAlignmentMap
    },
    /**
     * #getter
     */
    get transcriptPositionToAlignmentMap() {
      return this.coordinateMapper?.maps.transcriptPositionToAlignmentMap
    },
    /**
     * #getter
     * Per-residue pLDDT of the mapped entity, mapped to alignment columns and
     * shown only when the B-factor column actually looks like AlphaFold
     * confidence. Values are looked up by label_seq_id through the entity's own
     * seqIds, so an unobserved residue leaves a gap instead of shifting the
     * rest of the track.
     */
    get confidenceCells() {
      const entity = this.mappedEntity
      const confidence = self.structureConfidence?.find(
        c => c.entityId === entity?.entityId,
      )
      if (!entity || !confidence) {
        return []
      }
      const values = entity.seqIds.map(id => confidence.byLabelSeqId.get(id))
      return looksLikePlddt(values.filter(v => v !== undefined))
        ? mapResidueValuesToColumns(
            values,
            this.structurePositionToAlignmentMap,
          )
        : []
    },
    /**
     * #getter
     * Per-residue Kyte-Doolittle hydrophobicity mapped to alignment columns.
     */
    get hydrophobicityCells() {
      const seq = this.mappedStructureSeq
      return seq
        ? mapResidueValuesToColumns(
            kyteDoolittleScores(stripStopCodon(seq)),
            this.structurePositionToAlignmentMap,
          )
        : []
    },
    /**
     * #getter
     */
    get pairwiseAlignmentToTranscriptPosition() {
      return this.coordinateMapper?.maps.alignmentToTranscriptPosition
    },
    /**
     * #getter
     */
    get pairwiseAlignmentToStructurePosition() {
      return this.coordinateMapper?.maps.alignmentToStructurePosition
    },
    /**
     * #method
     * What the mapped entity's residue at a 0-based position is called: its
     * author number where the file has one (R248 of p53 in 1TUP, where the
     * position is 154), so the ruler and hover read like the literature.
     */
    residueNumber(pos: number) {
      return residueNumber(this.mappedEntity, pos)
    },
    /**
     * #getter
     * The hovered residue, read out for the header: its author number first,
     * then the transcript residue it aligns to when that differs (a crystal
     * whose construct was renumbered from one), letters, chain and codon locus.
     */
    get hoverString() {
      const r = self.hoverPosition
      if (r === undefined) {
        return ''
      }
      const structureLetter = this.hoverStructureLetter
      const genomeLetter = this.hoverGenomeLetter
      const parts = []

      if (r.structureSeqPos !== undefined) {
        const residue = this.residueNumber(r.structureSeqPos)
        parts.push(`${residue}`)
        const transcriptPos =
          this.structureSeqToTranscriptSeqPosition?.[r.structureSeqPos]
        if (transcriptPos !== undefined && transcriptPos + 1 !== residue) {
          parts.push(`Transcript residue: ${transcriptPos + 1}`)
        }
      }

      if (structureLetter) {
        parts.push(`Structure: ${structureLetter}`)
      }

      if (genomeLetter && structureLetter && genomeLetter !== structureLetter) {
        parts.push(`Genome: ${genomeLetter}`)
      }

      if (r.chain) {
        parts.push(`Chain: ${r.chain}`)
      }

      const locus = this.hoverGenomeLocus
      if (locus) {
        parts.push(locus)
      }

      return parts.join(', ')
    },
    /**
     * #getter
     * The hovered residue's codon as a 1-based locString, so the header can
     * name where in the genome a residue sits without a click.
     */
    get hoverGenomeLocus() {
      const pos = this.structureSeqHoverPos
      const mapping = this.genomeToTranscriptSeqMapping
      const transcriptPos =
        pos === undefined
          ? undefined
          : this.structureSeqToTranscriptSeqPosition?.[pos]
      if (!mapping || transcriptPos === undefined) {
        return undefined
      }
      const span = codonGenomeSpan(mapping.p2gCodon, transcriptPos)
      return span ? `${mapping.refName}:${span[0] + 1}-${span[1]}` : undefined
    },
    /**
     * #getter
     */
    get genomeToTranscriptSeqMapping() {
      return self.feature
        ? genomeToTranscriptSeqMapping(new SimpleFeature(self.feature))
        : undefined
    },
    /**
     * #getter
     */
    get structureSeqHoverPos() {
      return self.hoverPosition?.structureSeqPos
    },

    /**
     * #getter
     */
    get alignmentHoverPos() {
      const pos = this.structureSeqHoverPos
      return pos === undefined
        ? undefined
        : this.coordinateMapper?.structureToAlignment(structurePos(pos))
    },

    /**
     * #getter
     * Structure-residue range from a feature-bar hover, derived by mapping
     * alignmentHoverRange through pairwiseAlignmentToStructurePosition.
     * End is exclusive, matching clickedStructureRange.
     */
    get hoverStructureRange() {
      const { alignmentHoverRange } = self
      const a2s = this.pairwiseAlignmentToStructurePosition
      if (!alignmentHoverRange || !a2s) {
        return undefined
      }
      const start = a2s[alignmentHoverRange.start]
      const end = a2s[alignmentHoverRange.end]
      return start === undefined || end === undefined
        ? undefined
        : { start, end: end + 1 }
    },

    /**
     * #getter
     * The current hover as a 0-based half-open structure range. A feature-range
     * hover (hoverStructureRange) takes priority over a single-residue hover
     * (structureSeqHoverPos). Drives both the molstar 3D highlight and the
     * genome highlight.
     */
    get hoverHighlightRange() {
      const pos = this.structureSeqHoverPos
      return (
        this.hoverStructureRange ??
        (pos === undefined ? undefined : { start: pos, end: pos + 1 })
      )
    },

    /**
     * #getter
     * molstar's label_seq_id -> 0-based structure position for the mapped
     * entity. Computed once per entity rather than per hover event.
     */
    get labelSeqIdIndex() {
      return makeLabelSeqIdIndex(this.mappedEntity)
    },

    /**
     * #getter
     * The residues the molstar 'select' channel should light, as label_seq_ids:
     * a clicked/declarative domain range takes priority, else the whole
     * alignment-covered set when showHighlight is on, else nothing.
     */
    get selectLabelSeqIds() {
      const entity = this.mappedEntity
      const range = self.clickedStructureRange
      if (range) {
        return rangeToLabelSeqIds(entity, range)
      }
      const covered = this.structureSeqToTranscriptSeqPosition
      return this.showHighlight && covered
        ? toLabelSeqIds(entity, Object.keys(covered).map(Number))
        : []
    },

    /**
     * #getter
     * The residues the molstar 'highlight' (hover) channel should light.
     */
    get hoverLabelSeqIds() {
      return rangeToLabelSeqIds(this.mappedEntity, this.hoverHighlightRange)
    },

    /**
     * #getter
     * Persistent click selection in alignment coordinates, derived from
     * clickedStructureRange via structurePositionToAlignmentMap.
     */
    get clickAlignmentRange() {
      const range = self.clickedStructureRange
      const s2a = this.structurePositionToAlignmentMap
      if (!range || !s2a) {
        return undefined
      }
      const start = s2a[range.start]
      const end = s2a[range.end - 1]
      return start === undefined || end === undefined
        ? undefined
        : { start, end }
    },

    /**
     * #getter
     * Maps a structure-residue range to genome coordinates as a single
     * IRegion. Handles single-residue and multi-residue ranges.
     */
    structureRangeToGenomeHighlight(
      range: { start: number; end: number } | undefined,
    ): IRegion[] {
      const assemblyName = self.connectedView?.assemblyNames[0]
      const mapping = this.genomeToTranscriptSeqMapping
      if (!range || !assemblyName || !mapping) {
        return []
      }
      const model = {
        genomeToTranscriptSeqMapping: mapping,
        pairwiseAlignment: self.pairwiseAlignment,
        structureSeqToTranscriptSeqPosition:
          this.structureSeqToTranscriptSeqPosition,
      }
      const mapped =
        range.end > range.start + 1
          ? proteinRangeToGenomeMapping({
              model,
              structureSeqPos: range.start,
              structureSeqEndPos: range.end,
            })
          : proteinToGenomeMapping({ model, structureSeqPos: range.start })
      if (!mapped) {
        return []
      }
      const [start, end] = mapped
      return [{ assemblyName, refName: mapping.refName, start, end }]
    },

    /**
     * #getter
     * Genome regions to highlight in the LGV from the current hover. Excludes
     * hovers that originated from the genome view itself, so hovering the LGV
     * doesn't echo a codon-width highlight back onto that same view.
     */
    get hoverGenomeHighlights(): IRegion[] {
      return self.hoverPosition?.source === 'genome'
        ? []
        : this.structureRangeToGenomeHighlight(this.hoverHighlightRange)
    },

    /**
     * #getter
     * Genome regions to highlight in the LGV from the persistent click
     * selection. Derived from clickedStructureRange.
     */
    get clickGenomeHighlights(): IRegion[] {
      return this.structureRangeToGenomeHighlight(self.clickedStructureRange)
    },

    /**
     * #getter
     * Returns the single-letter amino acid code from the structure at hover position
     */
    get hoverStructureLetter() {
      const code = self.hoverPosition?.code
      if (code) {
        return proteinAbbreviationMapping[code]?.singleLetterCode
      }
      const structurePos = this.structureSeqHoverPos
      const seq = this.mappedStructureSeq
      if (structurePos !== undefined && seq) {
        return seq[structurePos]
      }
      return undefined
    },

    /**
     * #getter
     * Returns the single-letter amino acid code from the genome/transcript at hover position
     */
    get hoverGenomeLetter() {
      const structurePos = this.structureSeqHoverPos
      if (structurePos === undefined) {
        return undefined
      }
      const transcriptPos =
        this.structureSeqToTranscriptSeqPosition?.[structurePos]
      if (transcriptPos === undefined) {
        return undefined
      }
      return self.userProvidedTranscriptSequence[transcriptPos]
    },

    /**
     * #getter
     */
    get alignmentMatchSet() {
      const con = self.pairwiseAlignment?.consensus
      if (!con) {
        return undefined
      }
      const matchSet = new Set<number>()
      for (let i = 0; i < con.length; i++) {
        if (con[i] === '|' || con[i] === ':') {
          matchSet.add(i)
        }
      }
      return matchSet
    },

    /**
     * #getter
     * True while a pairwise alignment can still be produced but hasn't been
     * computed yet (both the transcript and structure sequences are present).
     * A standalone structure with no connected transcript has no sequence to
     * align against, so this stays false — the header shows no loader rather
     * than a perpetual "Loading pairwise alignment".
     */
    get alignmentPending() {
      return (
        !self.pairwiseAlignment &&
        !!self.userProvidedTranscriptSequence &&
        !!this.structureSequences?.length
      )
    },

    /**
     * #getter
     */
    get exactMatch() {
      const r1 = stripStopCodon(self.userProvidedTranscriptSequence)
      const r2 = this.mappedStructureSeq
        ? stripStopCodon(this.mappedStructureSeq)
        : undefined
      return r1 === r2
    },

    get parentView(): ParentProteinView {
      return getParent<ParentProteinView>(self, 2)
    },
    get zoomToBaseLevel(): boolean {
      return this.parentView.zoomToBaseLevel
    },
    get autoScrollAlignment(): boolean {
      return this.parentView.autoScrollAlignment
    },
    get showHighlight(): boolean {
      return this.parentView.showHighlight
    },
    get showProteinTracks(): boolean {
      return this.parentView.showProteinTracks
    },
    get trackHeight(): number {
      return this.parentView.compactTracks
        ? COMPACT_TRACK_HEIGHT
        : NORMAL_TRACK_HEIGHT
    },
    get trackGap(): number {
      return this.parentView.compactTracks
        ? COMPACT_TRACK_GAP
        : NORMAL_TRACK_GAP
    },
    get alignmentAlgorithm(): AlignmentAlgorithm {
      return this.parentView.alignmentAlgorithm
    },
    get molstarPluginContext(): PluginContext | undefined {
      return this.parentView.molstarPluginContext
    },
  }))
  .actions(self => ({
    setError(e: unknown) {
      self.parentView.setError(e)
    },
    /**
     * #action
     */
    hoverAlignmentPosition(alignmentPos: number) {
      if (!self.alignmentHoverRange) {
        const structureSeqPos = self.coordinateMapper?.alignmentToStructure(
          alignmentCol(alignmentPos),
        )
        self.setHoveredPosition(
          structureSeqPos !== undefined ? { structureSeqPos } : undefined,
        )
      }
    },
    /**
     * #action
     * The user's override of which chain the transcript maps to. The alignment
     * is recomputed against that entity's sequence, and every highlight that
     * derived from the old one is dropped, since its positions meant residues
     * of another chain.
     */
    chooseEntity(entityId: string) {
      const entity = self.entities?.find(e => e.entityId === entityId)
      if (!entity || entity.entityId === self.mappedEntity?.entityId) {
        return
      }
      const scored = alignTranscriptToEntity(
        self.userProvidedTranscriptSequence,
        entity.seq,
        self.alignmentAlgorithm,
      )
      if (!scored) {
        throw new Error(
          `${entity.chains.join('/') || entity.entityId} is too long to align to this transcript`,
        )
      }
      self.setMappedEntityId(entityId)
      self.setAlignment(scored.alignment)
      self.setClickedStructureRange(undefined)
      self.setAlignmentHoverRange(undefined)
      self.setSelectedFeatureId(undefined)
      self.setHoveredPosition(undefined)
    },
    /**
     * #action
     */
    clickAlignmentPosition(alignmentPos: number) {
      const structureSeqPos = self.coordinateMapper?.alignmentToStructure(
        alignmentCol(alignmentPos),
      )
      self.setSelectedFeatureId(undefined)
      if (structureSeqPos !== undefined) {
        clickProteinToGenome({
          model: self,
          structureSeqPos,
        }).catch((e: unknown) => {
          console.error(e)
          self.parentView.setError(e)
        })
      } else {
        self.setClickedStructureRange(undefined)
      }
    },
  }))
  .actions(self => ({
    afterAttach() {
      // Seed the persistent selection from a declarative `initialSelection`, so
      // a session spec can open with a domain pre-lit. clickedStructureRange is
      // the single source of truth the 3D/genome/alignment highlights derive
      // from; the genome-band and alignment getters recompute reactively once
      // the connected view + mapping resolve, and the molstar select autorun
      // below lights it once the structure loads. A later user click overwrites
      // it normally.
      if (self.initialSelection) {
        self.setClickedStructureRange(self.initialSelection)
      }
      // The author-numbered seed can only resolve once the entities are read
      // and the transcript's entity is chosen: before that, mappedEntity falls
      // back to entities[0], which in 1TUP is a DNA strand. Fires once, so a
      // user clearing the selection afterwards is not overruled.
      const { initialResidues } = self
      if (initialResidues) {
        addDisposer(
          self,
          when(
            () =>
              !!self.entities &&
              (self.mappedEntityId !== undefined ||
                !self.userProvidedTranscriptSequence),
            () => {
              self.setClickedStructureRange(
                residueRangeToPositions(self.mappedEntity, initialResidues),
              )
            },
          ),
        )
      }

      // Re-subscribe to a molstar click/hover behavior whenever the plugin
      // changes (view remount installs a fresh PluginContext). The previous
      // subscription is torn down first so they don't accumulate across
      // remounts, and a subscription that resolves after the context has already
      // moved on is disposed immediately rather than left dangling.
      const addInteractionListener = (
        kind: 'click' | 'hover',
        onUpdate: (info: MolstarLocationInfo | undefined) => void,
      ) => {
        let unsubscribe: (() => void) | undefined
        addDisposer(self, () => {
          unsubscribe?.()
        })
        addDisposer(
          self,
          autorun(async () => {
            const { molstarPluginContext } = self
            unsubscribe?.()
            unsubscribe = undefined
            if (molstarPluginContext) {
              const dispose = await subscribeMolstarInteraction({
                plugin: molstarPluginContext,
                kind,
                onUpdate,
              })
              if (
                isAlive(self) &&
                self.molstarPluginContext === molstarPluginContext
              ) {
                unsubscribe = dispose
              } else {
                dispose()
              }
            }
          }),
        )
      }

      addDisposer(
        self,
        autorun(() => {
          try {
            const {
              userProvidedTranscriptSequence,
              entities,
              alignmentAlgorithm,
            } = self

            if (
              self.pairwiseAlignment ||
              !userProvidedTranscriptSequence ||
              !entities?.length
            ) {
              return
            }
            // Resolve which entity the transcript belongs to (not always [0])
            // and align against it in one pass.
            const selection = chooseMappedEntity(
              userProvidedTranscriptSequence,
              entities,
              alignmentAlgorithm,
            )
            if (!selection) {
              return
            }
            self.setMappedEntityId(entities[selection.index]?.entityId)
            self.setAlignment(selection.alignment)
            if (selection.matches < alignmentLength(selection.alignment)) {
              self.parentView.setShowAlignment(true)
            }
          } catch (e) {
            console.error(e)
            self.parentView.setError(e)
          }
        }),
      )

      addDisposer(
        self,
        autorun(() => {
          const { hovered } = getSession(self)
          const {
            transcriptSeqToStructureSeqPosition,
            genomeToTranscriptSeqMapping,
            connectedView,
          } = self
          // genomeHoverToTranscriptPos gates on the transcript's refName: the
          // session hover is global, so without it a hover on an unrelated
          // chromosome at a numerically overlapping coordinate lit up a residue
          // here (the 1D protein highlight already gated on it, so the two
          // directions disagreed).
          const transcriptPos = connectedView?.initialized
            ? genomeHoverToTranscriptPos(hovered, genomeToTranscriptSeqMapping)
            : undefined
          if (transcriptPos !== undefined) {
            self.setGenomeHoveredPosition(
              transcriptSeqToStructureSeqPosition?.[transcriptPos],
            )
          } else if (self.hoverPosition?.source === 'genome') {
            // Only clear a hover this autorun owns — a hover sourced from the
            // 3D structure is cleared by molstar's own leave event.
            self.setGenomeHoveredPosition(undefined)
          }
        }),
      )

      // Only the transcript's mapped entity drives genome navigation; a hover or
      // click on any other chain is dropped (see interactionMatchesMappedEntity).
      // Pass the mapped entity only once a mapping exists, so a standalone
      // structure with no transcript stays fully interactive.
      // Also the single point where molstar's label_seq_id becomes a structure
      // position: resolved through the entity's own ids rather than `- 1`, so a
      // PDB numbered from its author residues maps to the right residue.
      const forMappedEntity = (info?: MolstarLocationInfo) => {
        if (
          !info ||
          !interactionMatchesMappedEntity(
            info.entityId,
            self.coordinateMapper ? self.mappedEntity?.entityId : undefined,
          )
        ) {
          return undefined
        }
        const structureSeqPos = self.labelSeqIdIndex.get(info.labelSeqId)
        return structureSeqPos === undefined
          ? undefined
          : { ...info, structureSeqPos }
      }

      // Click only acts on positive matches; clicks that didn't land on the
      // mapped entity are ignored.
      addInteractionListener('click', info => {
        const hit = forMappedEntity(info)
        if (hit) {
          self.setHoveredPosition(hit)
          self.setSelectedFeatureId(undefined)
          clickProteinToGenome({
            model: self,
            structureSeqPos: hit.structureSeqPos,
          }).catch((e: unknown) => {
            console.error(e)
            self.parentView.setError(e)
          })
        }
      })

      addInteractionListener('hover', info => {
        self.setHoveredPosition(forMappedEntity(info))
      })

      // Drive molstar's two interactivity channels reactively from a single
      // source of truth each (selectLabelSeqIds / hoverLabelSeqIds). Deriving
      // the selection here — rather than applying a clicked range imperatively
      // from the feature bar — lets a declarative `initialSelection` seed light
      // the 3D structure the same way a click does, with no race.
      const driveChannel = (
        channel: 'highlight' | 'select',
        getLabelSeqIds: () => number[],
      ) => {
        addDisposer(
          self,
          autorun(async () => {
            const { molstarStructure, molstarPluginContext } = self
            const labelSeqIds = getLabelSeqIds()
            if (molstarStructure && molstarPluginContext) {
              await setMolstarLoci({
                structure: molstarStructure,
                plugin: molstarPluginContext,
                channel,
                entityId: self.mappedEntity?.entityId,
                labelSeqIds,
              })
            }
          }),
        )
      }

      driveChannel('select', () => self.selectLabelSeqIds)
      driveChannel('highlight', () => self.hoverLabelSeqIds)
    },
  }))

export default Structure

export type JBrowsePluginProteinStructureStateModel = typeof Structure
export type JBrowsePluginProteinStructureModel =
  Instance<JBrowsePluginProteinStructureStateModel>
