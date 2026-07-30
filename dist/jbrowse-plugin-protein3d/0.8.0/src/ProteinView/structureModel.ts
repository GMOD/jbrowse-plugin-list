import { SimpleFeature, getSession } from '@jbrowse/core/util'
import {
  type Instance,
  addDisposer,
  getParent,
  isAlive,
  types,
} from '@jbrowse/mobx-state-tree'
import { autorun } from 'mobx'

import { setMolstarLoci } from './applyLociInteractivity'
import {
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
import { coerceAlignmentAlgorithm } from './types'
import { checkHovered } from './util'
import {
  getAlphaFoldStructureUrl,
  getPdbStructureUrl,
  getUniprotIdFromAlphaFoldTarget,
} from '../LaunchProteinView/utils/structureUrls'
import { stripStopCodon } from '../LaunchProteinView/utils/util'
import { genomeToTranscriptSeqMapping } from '../mappings'

import type { Entity } from './extractStructureSequences'
import type { ProteinStructureSpec } from './proteinViewSpec'
import type { PairwiseAlignment } from '../mappings'
import type { AlignmentAlgorithm } from './types'
import type { SimpleFeatureSerialized } from '@jbrowse/core/util'
import type { Region as IRegion } from '@jbrowse/core/util/types'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'
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
  alignmentAlgorithm: string
  molstarPluginContext: PluginContext | undefined
  structures: { url?: string }[]
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
    initialSelection: types.frozen<{ start: number; end: number } | undefined>(),
  })
  // Input-only shorthand: remap a `{ uniprotId }`/`{ pdbId }` snapshot to a
  // concrete `url` at hydration and strip the shorthand keys (they are not
  // stored — uniprotId stays derivable from the url via the getter below), so a
  // hand-authored snapshot loads without the caller knowing the AlphaFold/RCSB
  // URL format. An explicit url/data always wins; the shorthand resolves the
  // canonical isoform (AF-<id>-F1) only. Idempotent: a re-snapshot has no
  // shorthand keys and an already-set url, so it passes through unchanged.
  .preProcessSnapshot(({ uniprotId, pdbId, ...rest }: ProteinStructureSpec) => {
    const hasSource = rest.url !== undefined || rest.data !== undefined
    const url = hasSource
      ? rest.url
      : uniprotId !== undefined
        ? getAlphaFoldStructureUrl(uniprotId)
        : pdbId !== undefined
          ? getPdbStructureUrl(pdbId)
          : rest.url
    return { ...rest, url }
  })
  .volatile(() => ({
    /**
     * #volatile
     * Inclusive-exclusive structure-residue range from a click; drives the
     * derived clickGenomeHighlights getter.
     */
    clickedStructureRange: undefined as
      | { start: number; end: number }
      | undefined,

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
     * Index into entities of the one that matches the transcript. Resolved by
     * alignment (see chooseMappedEntity) instead of assuming the protein of
     * interest is entity [0], which mis-maps heteromers / protein-DNA complexes /
     * processed peptides.
     */
    mappedEntityIndex: 0,
    /**
     * #volatile
     * Per-residue B-factor / pLDDT for the first chain, indexed by 0-based
     * structure sequence position. Drives the confidence feature track.
     */
    structureConfidence: undefined as number[] | undefined,
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
     * Range of alignment positions to highlight (e.g., when hovering a protein feature)
     */
    alignmentHoverRange: undefined as
      | { start: number; end: number }
      | undefined,
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
    setStructureData(data: { entities?: Entity[]; confidence?: number[] }) {
      self.entities = data.entities
      self.structureConfidence = data.confidence
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
    setMappedEntityIndex(n: number) {
      self.mappedEntityIndex = n
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
     * The entity that maps to the transcript (chosen by chooseMappedEntity), not
     * blindly entity [0].
     */
    get mappedEntity() {
      return self.entities?.[self.mappedEntityIndex]
    },
    /**
     * #getter
     */
    get mappedStructureSeq() {
      return this.mappedEntity?.seq
    },
    /**
     * #getter
     * mmCIF entity id of the mapped entity. Used to reject hovers/clicks on
     * other chains and to confine highlights to the gene's protein.
     */
    get mappedEntityId() {
      return this.mappedEntity?.entityId
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
     * Per-residue pLDDT values mapped to alignment columns, shown only when the
     * structure's B-factor column actually looks like AlphaFold confidence.
     * pLDDT is an AlphaFold concept — those models are single-entity, so the
     * mapped entity is always [0] and structureConfidence (extracted from [0])
     * stays coherent.
     */
    get confidenceCells() {
      const c = self.structureConfidence
      return looksLikePlddt(c)
        ? mapResidueValuesToColumns(c, this.structurePositionToAlignmentMap)
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
     * #getter
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
        parts.push(`${r.structureSeqPos + 1}`)
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

      return parts.join(', ')
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
      return coerceAlignmentAlgorithm(this.parentView.alignmentAlgorithm)
    },
    get molstarPluginContext(): PluginContext | undefined {
      return this.parentView.molstarPluginContext
    },
    /**
     * #getter
     * Returns this structure's index in the parent's structures array
     */
    get structureIndex() {
      return this.parentView.structures.indexOf(self)
    },
    /**
     * #getter
     * Returns the Molstar structure object for the current structure.
     * Note: We access loadedToMolstar to ensure MobX recomputes this getter
     * when the structure finishes loading (Molstar's internal state isn't observable).
     */
    get molstarStructure() {
      const idx = this.structureIndex
      return self.loadedToMolstar && idx >= 0
        ? this.molstarPluginContext?.managers.structure.hierarchy.current
            .structures[idx]?.cell.obj?.data
        : undefined
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
        autorun(async () => {
          try {
            const {
              userProvidedTranscriptSequence,
              structureSequences,
              alignmentAlgorithm,
            } = self

            if (
              self.pairwiseAlignment ||
              !userProvidedTranscriptSequence ||
              !structureSequences?.length
            ) {
              return
            }
            // Resolve which entity the transcript belongs to (not always [0])
            // and align against it in one pass.
            const selection = chooseMappedEntity(
              userProvidedTranscriptSequence,
              structureSequences,
              alignmentAlgorithm,
            )
            if (!selection) {
              return
            }
            self.setMappedEntityIndex(selection.index)
            self.setAlignment(selection.alignment)
            if (selection.matches < selection.alignment.alns[0].seq.length) {
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
          if (
            connectedView?.initialized &&
            genomeToTranscriptSeqMapping &&
            checkHovered(hovered)
          ) {
            const { hoverPosition } = hovered
            const pos =
              genomeToTranscriptSeqMapping.g2p[hoverPosition.coord - 1]
            const c0 =
              pos === undefined
                ? undefined
                : transcriptSeqToStructureSeqPosition?.[pos]
            self.setGenomeHoveredPosition(c0)
          } else if (self.hoverPosition?.source === 'genome') {
            self.setGenomeHoveredPosition(undefined)
          }
        }),
      )

      // Only the transcript's mapped entity drives genome navigation; a hover or
      // click on any other chain is dropped (see interactionMatchesMappedEntity).
      // Pass the mapped entity only once a mapping exists, so a standalone
      // structure with no transcript stays fully interactive.
      const forMappedEntity = (info?: MolstarLocationInfo) =>
        info &&
        interactionMatchesMappedEntity(
          info.entityId,
          self.coordinateMapper ? self.mappedEntityId : undefined,
        )
          ? info
          : undefined

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

      // Drive the molstar 'select' channel (the persistent magenta selection)
      // reactively from a single source of truth: a clicked/declarative domain
      // range takes priority, else the whole alignment-covered set when
      // showHighlight is on, else nothing. Centralizing it here (rather than
      // only applying the clicked range imperatively from the feature bar) lets
      // a declarative `initialSelection` seed light the 3D structure the same
      // way a click does, with no race against this autorun.
      addDisposer(
        self,
        autorun(async () => {
          const {
            showHighlight,
            clickedStructureRange,
            structureSeqToTranscriptSeqPosition,
            molstarPluginContext,
            molstarStructure,
          } = self
          // Only the showHighlight "whole alignment" branch needs the
          // transcript map; a clicked/declarative range (incl. a standalone
          // structure with no transcript) must still light up without it.
          if (molstarStructure && molstarPluginContext) {
            await setMolstarLoci({
              structure: molstarStructure,
              plugin: molstarPluginContext,
              channel: 'select',
              entityId: self.mappedEntityId,
              spec: clickedStructureRange
                ? { kind: 'range', ...clickedStructureRange }
                : showHighlight && structureSeqToTranscriptSeqPosition
                  ? {
                      kind: 'list',
                      residues: Object.keys(
                        structureSeqToTranscriptSeqPosition,
                      ).map(coord => +coord),
                    }
                  : undefined,
            })
          }
        }),
      )

      // Drive molstar hover-highlight from the model's hoverHighlightRange.
      addDisposer(
        self,
        autorun(async () => {
          const { molstarStructure, molstarPluginContext, hoverHighlightRange } =
            self
          if (molstarStructure && molstarPluginContext) {
            await setMolstarLoci({
              structure: molstarStructure,
              plugin: molstarPluginContext,
              channel: 'highlight',
              entityId: self.mappedEntityId,
              spec: hoverHighlightRange
                ? { kind: 'range', ...hoverHighlightRange }
                : undefined,
            })
          }
        }),
      )
    },
  }))

export default Structure

export type JBrowsePluginProteinStructureStateModel = typeof Structure
export type JBrowsePluginProteinStructureModel =
  Instance<JBrowsePluginProteinStructureStateModel>
