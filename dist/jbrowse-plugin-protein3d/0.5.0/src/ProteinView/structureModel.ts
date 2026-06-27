import { SimpleFeature, getSession } from '@jbrowse/core/util'
import {
  type Instance,
  addDisposer,
  getParent,
  types,
} from '@jbrowse/mobx-state-tree'
import { autorun } from 'mobx'

import { setMolstarLoci } from './applyLociInteractivity'
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
import { runLocalAlignment } from './pairwiseAlignment'
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
import { checkHovered } from './util'
import { getUniprotIdFromAlphaFoldTarget } from '../LaunchProteinView/utils/launchViewUtils'
import { stripStopCodon } from '../LaunchProteinView/utils/util'
import { genomeToTranscriptSeqMapping } from '../mappings'
import { coerceAlignmentAlgorithm } from './types'

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
     */
    userProvidedTranscriptSequence: types.string,
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
    structureSequences: undefined as string[] | undefined,
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
  }))
  .actions(self => ({
    setStructureData(data: { sequences?: string[]; confidence?: number[] }) {
      self.structureSequences = data.sequences
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
    setIsMouseInAlignment(val: boolean) {
      self.isMouseInAlignment = val
    },
  }))
  .views(self => ({
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
      const seq = self.structureSequences?.[0]
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
      if (structurePos !== undefined && self.structureSequences?.[0]) {
        return self.structureSequences[0][structurePos]
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
        !!self.structureSequences?.[0]
      )
    },

    /**
     * #getter
     */
    get exactMatch() {
      const r1 = stripStopCodon(self.userProvidedTranscriptSequence)
      const r2 = self.structureSequences?.[0]
        ? stripStopCodon(self.structureSequences[0])
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
      // Re-subscribe to a molstar click/hover behavior whenever the plugin
      // becomes available; the subscription is disposed with the model.
      const addInteractionListener = (
        kind: 'click' | 'hover',
        onUpdate: (info: MolstarLocationInfo | undefined) => void,
      ) => {
        addDisposer(
          self,
          autorun(async () => {
            const { molstarPluginContext } = self
            if (molstarPluginContext) {
              addDisposer(
                self,
                await subscribeMolstarInteraction({
                  plugin: molstarPluginContext,
                  kind,
                  onUpdate,
                }),
              )
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
              exactMatch,
              alignmentAlgorithm,
            } = self
            const seq1 = userProvidedTranscriptSequence
            const seq2 = structureSequences?.[0]

            if (self.pairwiseAlignment || !seq1 || !seq2) {
              return
            }
            const r1 = stripStopCodon(seq1)
            const r2 = stripStopCodon(seq2)
            if (exactMatch) {
              self.setAlignment({
                consensus: '|'.repeat(r1.length),
                alns: [
                  { id: 'seq1', seq: r1 },
                  { id: 'seq2', seq: r2 },
                ],
              })
            } else {
              const pairwiseAlignment = runLocalAlignment(
                r1,
                r2,
                alignmentAlgorithm,
              )
              self.setAlignment(pairwiseAlignment)
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

      // Click only acts on positive matches; clicks that didn't land on a
      // structure element are ignored.
      addInteractionListener('click', info => {
        if (info) {
          self.setHoveredPosition(info)
          self.setSelectedFeatureId(undefined)
          clickProteinToGenome({
            model: self,
            structureSeqPos: info.structureSeqPos,
          }).catch((e: unknown) => {
            console.error(e)
            self.parentView.setError(e)
          })
        }
      })

      addInteractionListener('hover', info => {
        self.setHoveredPosition(info)
      })

      addDisposer(
        self,
        autorun(async () => {
          const {
            showHighlight,
            structureSeqToTranscriptSeqPosition,
            molstarPluginContext,
            molstarStructure,
          } = self
          if (
            molstarStructure &&
            molstarPluginContext &&
            structureSeqToTranscriptSeqPosition
          ) {
            await setMolstarLoci({
              structure: molstarStructure,
              plugin: molstarPluginContext,
              channel: 'select',
              spec: showHighlight
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
