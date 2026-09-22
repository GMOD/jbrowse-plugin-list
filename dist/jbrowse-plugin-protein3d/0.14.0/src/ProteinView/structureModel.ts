import { SimpleFeature, getSession } from '@jbrowse/core/util'
import {
  type Instance,
  addDisposer,
  getParent,
  isAlive,
  types,
} from '@jbrowse/mobx-state-tree'
import { autorun, when } from 'mobx'
import {
  alignTranscriptToEntity,
  alignmentCol,
  alignmentQuality,
  chooseMappedEntity,
  entityLabel,
  fetchUniProtStructureMappings,
  fusionPartnerPositions,
  getPdbIdFromUrl,
  getUniprotIdFromAlphaFoldTarget,
  interactionMatchesMappedEntity,
  looksLikePlddt,
  makeCoordinateMapper,
  makeLabelSeqIdIndex,
  mappedStructureIdentity,
  rangeToLabelSeqIds,
  residueNumber,
  residueRangeToPositions,
  resolveStructureUrl,
  stripStopCodon,
  structureDisplayLabel,
  structurePos,
  toLabelSeqIds,
  transcriptRangeToStructureRange,
  unmapStructurePositions,
} from 'p2s_mapper'

import { connectedHoverTranscriptPos } from './connectedHover'
import {
  COMPACT_TRACK_GAP,
  COMPACT_TRACK_HEIGHT,
  MINOR_FEATURE_TYPES,
  NORMAL_TRACK_GAP,
  NORMAL_TRACK_HEIGHT,
} from './constants'
import { proteinAbbreviationMapping } from './proteinAbbreviationMapping'
import {
  clickProteinToGenome,
  structureRangeToGenomeRegions,
} from './proteinToGenomeMapping'
import { kyteDoolittleScores, mapResidueValuesToColumns } from './residueTracks'
import { type MolstarLocationInfo } from './subscribeMolstarInteraction'
import { errorMessage } from './util'
import { codingSpans, genomeToTranscriptSeqMapping } from '../mappings'

import type { EntityConfidence, StructureData } from './loadStructureData'
import type { ProteinStructureSpec } from './proteinViewSpec'
import type { SimpleFeatureSerialized } from '@jbrowse/core/util'
import type { Region as IRegion } from '@jbrowse/core/util/types'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'
import type { Structure as MolstarStructure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type {
  AlignmentAlgorithm,
  CoordinateMapper,
  Entity,
  PairwiseAlignment,
  UniProtStructureMapping,
} from 'p2s_mapper'

type LGV = LinearGenomeViewModel
type MaybeLGV = LGV | undefined
type MaybePairwiseAlignment = PairwiseAlignment | undefined

export interface ParentProteinView {
  zoomToBaseLevel: boolean
  autoScrollAlignment: boolean
  showHighlight: boolean
  showProteinTracks: boolean
  compactTracks: boolean
  showAllFeatureTracks: boolean
  alignmentAlgorithm: AlignmentAlgorithm
  molstarPluginContext: PluginContext | undefined
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
     * UniProt accession of the structure: the one a `{ uniprotId }` shorthand
     * asked for, or the one an AlphaFold url names. With no url the structure
     * loader asks AlphaFold DB which of the accession's models to open and
     * fills in `url` — the files an accession has are the API's answer, not a
     * filename this plugin can spell.
     */
    uniprotId: types.maybe(types.string),
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
     * The seed named by 1-based inclusive residues of the transcript's own
     * translation, the numbering a UniProt feature or a domain map counts in.
     * Resolved through the alignment once it exists, so it lands on the right
     * residues of any structure the transcript aligns to, whatever the file's
     * numbering, and clamps to the residues the structure models.
     */
    initialTranscriptResidues: types.frozen<
      { start: number; end: number } | undefined
    >(),
    /**
     * #property
     * mmCIF entity the transcript maps to. Chosen by alignment when the
     * structure loads (see chooseMappedEntity), or by the user through the
     * chain picker. Persisted beside `pairwiseAlignment` because that
     * alignment is against this entity's sequence: restoring one without the
     * other would light chain A's residues with chain C's alignment.
     */
    mappedEntityId: types.maybe(types.string),
    /**
     * #property
     * Whether `pairwiseAlignment` came from outside, pasted in the manual
     * import or written into a spec, rather than computed here. An imported
     * alignment is used exactly as given, fusion partners included.
     */
    alignmentImported: types.optional(types.boolean, false),
  })
  // Shorthand: a `{ pdbId }` snapshot resolves to a concrete `url` at
  // hydration, so a hand-authored snapshot loads without the caller knowing
  // RCSB's URL format. A `{ uniprotId }` keeps the accession instead and the
  // loader resolves the file. An explicit url/data always wins, and an
  // AlphaFold url fills in the accession it names. Idempotent: a re-snapshot
  // carries an already-set url, so it passes through unchanged.
  //
  // A given accession outranks the one the url spells, because they differ
  // exactly when it matters: asked for P04637, the loader may open the isoform
  // file AF-P04637-2-F1, and reading the accession back off that url would
  // save P04637-2 — which UniProt's GFF endpoint does not serve, so a reopened
  // session lost its feature tracks and its entry link.
  //
  // A snapshot carrying an alignment but no alignmentImported predates the
  // flag or was written by hand; either way the alignment is used as given.
  .preProcessSnapshot(({ pdbId, uniprotId, ...rest }: ProteinStructureSpec) => {
    const url = resolveStructureUrl({ ...rest, uniprotId, pdbId })
    return {
      ...rest,
      url,
      uniprotId:
        uniprotId ?? (url ? getUniprotIdFromAlphaFoldTarget(url) : undefined),
      alignmentImported:
        rest.alignmentImported ?? rest.pairwiseAlignment !== undefined,
    }
  })
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
     * Where the hover came from: the 3D structure (or this view's alignment
     * panel), the connected genome view, or a connected MSA view.
     * hoverGenomeHighlights draws only the first, since the other two mark
     * their own pointer on the genome.
     */
    hoverPosition: undefined as
      | {
          structureSeqPos?: number
          code?: string
          chain?: string
          source: 'structure' | 'genome' | 'msa'
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
     * Why no alignment could be computed, when the structure has sequences but
     * none was alignable: every protein chain over the DP ceiling, or no
     * protein chain at all. Without it the header shows "Loading pairwise
     * alignment" forever and the ready signal never fires.
     */
    alignmentSkipped: undefined as string | undefined,
    /**
     * #volatile
     * Tracks whether this structure has been loaded into Molstar
     */
    loadedToMolstar: false,
    /**
     * #volatile
     * The Mol* structures this model's load produced, one per model of the
     * file, captured from the loader rather than looked up by position in
     * `hierarchy.current.structures` — that array is ordered by load
     * completion, so with two structures in flight index N can be another
     * model's geometry.
     */
    molstarStructures: new Array<MolstarStructure>(),
    /**
     * #volatile
     * Ids of every Mol* model that load produced, all of an ensemble's models
     * included; see interactionPosition.
     */
    molstarModelIds: new Array<string>(),
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
    /**
     * #volatile
     * SIFTS' UniProt segments for an RCSB entry, undefined until fetched and
     * for any other structure. Drives the UniProt feature tracks and keeps a
     * fusion partner's residues out of the mapping (see `alignment`).
     */
    uniProtMappings: undefined as UniProtStructureMapping[] | undefined,
    /**
     * #volatile
     */
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    uniProtMappingsError: undefined as unknown,
    /**
     * #volatile
     * Why this structure could not be shown: a failed download, an unparseable
     * file, an alignment that threw. Per structure rather than a view-wide
     * banner, because with several open "Failed to fetch" names none of them.
     * Named `error` because that is what reads it from outside: jb2hubs'
     * `scripts/checkProteinLaunches.ts` asks each structure of a live session
     * whether it failed.
     */
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    error: undefined as unknown,
  }))
  .actions(self => ({
    /**
     * #action
     * The file the accession's structure lives in, once the loader has asked
     * AlphaFold DB for it. Stored, so a saved session reopens the same model.
     */
    setUrl(url: string) {
      self.url = url
    },
    /**
     * #action
     */
    setError(error: unknown) {
      self.error = error
    },
    setUniProtMappings(mappings?: UniProtStructureMapping[], error?: unknown) {
      self.uniProtMappings = mappings
      self.uniProtMappingsError = error
    },
    setStructureData(data: StructureData) {
      self.entities = data.entities
      self.structureConfidence = data.confidence
      self.molstarStructures = data.molstarStructures ?? []
      self.molstarModelIds = data.modelIds ?? new Array<string>()
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
        // the handles belong to the plugin we were unloaded from
        self.molstarStructures = []
        self.molstarModelIds = new Array<string>()
      }
    },
  }))
  .views(self => ({
    /**
     * #getter
     * The load's first model, which stands for the whole load where Mol*
     * takes one structure: framing, focus, and removal, which goes by the
     * trajectory and so takes every model with it.
     */
    get molstarStructure(): MolstarStructure | undefined {
      return self.molstarStructures[0]
    },
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
     * Records a hover from the connected genome view or alignment. Drives the
     * 3D structure and feature-track highlight, but is excluded from
     * hoverGenomeHighlights: that view already marks its own pointer.
     */
    setConnectedHoveredPosition(
      structureSeqPos?: number,
      source: 'genome' | 'msa' = 'genome',
    ) {
      self.hoverPosition =
        structureSeqPos === undefined ? undefined : { structureSeqPos, source }
    },
    /**
     * #action
     */
    setAlignment(r?: PairwiseAlignment, imported = false) {
      self.pairwiseAlignment = r
      self.alignmentImported = imported
      self.alignmentSkipped = undefined
    },
    setAlignmentSkipped(reason?: string) {
      self.alignmentSkipped = reason
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
     * The RCSB entry id, for a structure loaded from the PDB archive
     */
    get pdbId() {
      const { url } = self
      return url && !getUniprotIdFromAlphaFoldTarget(url)
        ? getPdbIdFromUrl(url)
        : undefined
    },
    /**
     * #getter
     * The alignment every map, highlight and the panel read: the stored one,
     * minus any residue SIFTS assigns to a protein fused to the transcript's
     * (see fusionPartnerPositions). Until SIFTS answers, without it, or for
     * an imported alignment, the stored alignment as is.
     */
    get alignment(): MaybePairwiseAlignment {
      const pa = self.pairwiseAlignment
      if (!pa || !self.uniProtMappings || self.alignmentImported) {
        return pa
      }
      return unmapStructurePositions(
        pa,
        fusionPartnerPositions(
          self.uniProtMappings,
          this.mappedEntity,
          mappedStructureIdentity(pa),
        ),
      )
    },
    /**
     * #getter
     * All structure/transcript/alignment coordinate conversions, built once
     * from the alignment (see p2s_mapper's coordinates.ts). Use its typed
     * methods for point
     * conversions; the getters below expose the raw maps for whole-map
     * consumers.
     */
    get coordinateMapper(): CoordinateMapper | undefined {
      const { alignment } = this
      return alignment ? makeCoordinateMapper(alignment) : undefined
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
      const spans = codingSpans(mapping.p2gCodon, [transcriptPos])
      const start = spans[0]?.[0]
      const end = spans.at(-1)?.[1]
      return start === undefined || end === undefined
        ? undefined
        : `${mapping.refName}:${start + 1}-${end}`
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
     * #method
     * The 0-based position a Mol* hover or click names on this structure, or
     * undefined when it landed on another structure of the view, on a chain
     * other than the mapped one, or on a residue the entity lacks. The
     * position comes from the entity's own label_seq_ids rather than `- 1`, so
     * a PDB numbered from its author residues maps to the right residue.
     */
    interactionPosition(info: MolstarLocationInfo) {
      return self.molstarModelIds.includes(info.modelId) &&
        interactionMatchesMappedEntity(
          info.entityId,
          this.coordinateMapper ? this.mappedEntity?.entityId : undefined,
        )
        ? this.labelSeqIdIndex.get(info.labelSeqId)
        : undefined
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
     * Whether a spec seeded the selection, which is what the camera frames.
     */
    get seededSelection() {
      return !!(
        self.initialSelection ??
        self.initialResidues ??
        self.initialTranscriptResidues
      )
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
     * The genome regions a structure-residue range covers, one per stretch of
     * contiguous coding bases.
     */
    structureRangeToGenomeHighlight(
      range: { start: number; end: number } | undefined,
    ): IRegion[] {
      return structureRangeToGenomeRegions({
        range,
        assemblyName: self.connectedView?.assemblyNames[0],
        model: {
          genomeToTranscriptSeqMapping: this.genomeToTranscriptSeqMapping,
          pairwiseAlignment: this.alignment,
          structureSeqToTranscriptSeqPosition:
            this.structureSeqToTranscriptSeqPosition,
        },
      })
    },

    /**
     * #getter
     * Genome regions to highlight in the LGV from the current hover, for a
     * hover in this view only: the genome view and a connected MSA already
     * mark their own pointer there, and echoing it doubles the band.
     */
    get hoverGenomeHighlights(): IRegion[] {
      const source = self.hoverPosition?.source
      return source === 'genome' || source === 'msa'
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
      const con = this.alignment?.consensus
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
        !self.alignmentSkipped &&
        !!self.userProvidedTranscriptSequence &&
        !!this.structureSequences?.length
      )
    },
    /**
     * #getter
     * Still changing what it shows: not yet in Mol*, aligning, or waiting on
     * the SIFTS answer that unmaps a fusion partner and places UniProt tracks.
     */
    get loading() {
      if (self.error !== undefined) {
        // A structure that failed is finished, not pending: without this the
        // ready marker never appears and every wait runs to its timeout.
        // Settled is not the same as shown, so anything gating on
        // `protein-view-ready` has to read `error` alongside it — a view whose
        // every structure failed is as ready as it will ever be.
        return false
      }
      return (
        !self.loadedToMolstar ||
        this.alignmentPending ||
        (!!this.pdbId &&
          self.uniProtMappings === undefined &&
          self.uniProtMappingsError === undefined)
      )
    },
    /**
     * #getter
     * Which of those steps is running, named for the overlay on the canvas. A
     * structure fetch, a parse, an alignment and a SIFTS lookup run for seconds
     * behind what would otherwise be an empty grey rectangle.
     */
    get loadingMessage() {
      if (!this.loading) {
        return undefined
      }
      if (!self.loadedToMolstar) {
        return self.url === undefined &&
          self.data === undefined &&
          self.uniprotId
          ? `Resolving AlphaFold model for ${self.uniprotId}`
          : `Loading ${this.label}`
      }
      if (this.alignmentPending) {
        const name = self.feature?.name
        return typeof name === 'string'
          ? `Aligning ${this.label} to ${name}`
          : `Aligning ${this.label}`
      }
      return `Mapping ${this.label} to UniProt`
    },
    /**
     * #getter
     * What went wrong with this structure, for the line beside its label in
     * the header: a failed load, or a structure with no chain the transcript
     * can be aligned to. One line per structure, rather than a view-wide
     * banner that names neither which structure nor what it was doing.
     */
    get statusMessage() {
      const { error } = self
      return error === undefined ? self.alignmentSkipped : errorMessage(error)
    },
    /**
     * #getter
     * Identity and coverage of the pairwise alignment, for the header readout
     * and the low-similarity warning. See p2s_mapper's alignmentQuality.ts.
     */
    get alignmentQuality() {
      const { alignment } = this
      return alignment ? alignmentQuality(alignment) : undefined
    },

    /**
     * #getter
     * Whether the mapped chain spells the transcript's translation exactly.
     * Nothing in this repo reads it; jb2hubs' `scripts/checkProteinLaunches.ts`
     * does, off the live model, to assert a launch that should map as an
     * identity did. It stays for that.
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
    get showAllFeatureTracks(): boolean {
      return this.parentView.showAllFeatureTracks
    },
    /**
     * #getter
     * The feature types left undrawn: the ones hidden by hand, and the minor
     * ones unless every track is shown.
     */
    get omittedFeatureTypes(): Set<string> {
      return this.showAllFeatureTracks
        ? self.hiddenFeatureTypes
        : new Set([...MINOR_FEATURE_TYPES, ...self.hiddenFeatureTypes])
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
    /**
     * #action
     * Report on the view's dismissable banner rather than on this structure:
     * a navigation or a chain choice the user asked for and that failed, as
     * opposed to a structure that cannot be shown at all.
     */
    setViewError(e: unknown) {
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
      const { pdbId } = self
      if (pdbId) {
        fetchUniProtStructureMappings(pdbId).then(
          mappings => {
            if (isAlive(self)) {
              self.setUniProtMappings(mappings)
            }
          },
          (e: unknown) => {
            if (isAlive(self)) {
              self.setUniProtMappings(undefined, e)
            }
          },
        )
      }
      // The author-numbered seed can only resolve once the entities are read
      // and the transcript's entity is chosen: before that, mappedEntity falls
      // back to entities[0], which in 1TUP is a DNA strand. Fires once, so a
      // user clearing the selection afterwards is not overruled.
      const { initialResidues, initialTranscriptResidues } = self
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
      // The transcript-numbered seed needs the alignment, which for a fusion
      // is also waiting on SIFTS, so it fires once the structure has settled.
      if (initialTranscriptResidues) {
        addDisposer(
          self,
          when(
            () => !!self.coordinateMapper && !self.loading,
            () => {
              self.setClickedStructureRange(
                transcriptRangeToStructureRange(
                  self.coordinateMapper!,
                  initialTranscriptResidues,
                ),
              )
            },
          ),
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
              // chooseMappedEntity returns undefined for both "no protein
              // chain" and "every protein chain over the DP ceiling"; either
              // way the user has to hear it, or the header loads forever.
              const proteins = entities.filter(
                e => !e.nucleicAcid && e.seq.length > 0,
              )
              const reason = proteins.length
                ? `No chain could be aligned: ${proteins
                    .map(e => entityLabel(e))
                    .join(', ')} exceed the alignment size limit against this ${
                    stripStopCodon(userProvidedTranscriptSequence).length
                  } aa transcript`
                : 'This structure has no protein chain to align the transcript to'
              self.setAlignmentSkipped(reason)
              return
            }
            self.setMappedEntityId(entities[selection.index]?.entityId)
            self.setAlignment(selection.alignment)
          } catch (e) {
            console.error(e)
            self.setError(e)
          }
        }),
      )

      addDisposer(
        self,
        autorun(() => {
          const { hovered, views, assemblyManager } = getSession(self)
          const assembly = assemblyManager.get(
            self.connectedView?.assemblyNames[0] ?? '',
          )
          const hover = connectedHoverTranscriptPos({
            hovered,
            views,
            mapping: self.genomeToTranscriptSeqMapping,
            connectedViewId: self.connectedViewId,
            genomeViewReady: !!self.connectedView?.initialized,
            canonical: r => assembly?.getCanonicalRefName(r) ?? r,
          })
          if (hover) {
            self.setConnectedHoveredPosition(
              self.transcriptSeqToStructureSeqPosition?.[hover.transcriptPos],
              hover.source,
            )
          } else if (self.hoverPosition?.source !== 'structure') {
            // a hover from the 3D structure is cleared by Mol*'s leave event
            self.setConnectedHoveredPosition(undefined)
          }
        }),
      )
    },
  }))

export default Structure

export type JBrowsePluginProteinStructureStateModel = typeof Structure
export type JBrowsePluginProteinStructureModel =
  Instance<JBrowsePluginProteinStructureStateModel>
