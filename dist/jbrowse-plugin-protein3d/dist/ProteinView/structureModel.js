import { SimpleFeature, getSession } from '@jbrowse/core/util';
import { addDisposer, getParent, types, } from '@jbrowse/mobx-state-tree';
import { autorun } from 'mobx';
import { applyLociInteractivityMultiple, applyLociInteractivitySingle, } from './applyLociInteractivity';
import highlightResidueRange from './highlightResidueRange';
import { runLocalAlignment } from './pairwiseAlignment';
import { proteinAbbreviationMapping } from './proteinAbbreviationMapping';
import { clickProteinToGenome, proteinRangeToGenomeMapping, proteinToGenomeMapping, } from './proteinToGenomeMapping';
import subscribeMolstarInteraction from './subscribeMolstarInteraction';
import { checkHovered, invertMap } from './util';
import { getUniprotIdFromAlphaFoldTarget } from '../LaunchProteinView/utils/launchViewUtils';
import { stripStopCodon } from '../LaunchProteinView/utils/util';
import { genomeToTranscriptSeqMapping, structurePositionToAlignmentMap, structureSeqVsTranscriptSeqMap, transcriptPositionToAlignmentMap, } from '../mappings';
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
    pairwiseAlignment: types.frozen(),
    /**
     * #property
     */
    feature: types.frozen(),
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
    clickedStructureRange: undefined,
    /**
     * #volatile
     */
    hoverPosition: undefined,
    /**
     * #volatile
     */
    structureSequences: undefined,
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
    alignmentHoverRange: undefined,
    /**
     * #volatile
     * The uniqueId of the currently selected protein feature (for persistent highlight)
     */
    selectedFeatureId: undefined,
    /**
     * #volatile
     * Set of feature track types that are hidden
     */
    hiddenFeatureTypes: new Set(),
}))
    .actions(self => ({
    setSequences(str) {
        self.structureSequences = str;
    },
    /**
     * #action
     */
    hideFeatureType(type) {
        self.hiddenFeatureTypes = new Set([...self.hiddenFeatureTypes, type]);
    },
    /**
     * #action
     */
    showFeatureType(type) {
        const newSet = new Set(self.hiddenFeatureTypes);
        newSet.delete(type);
        self.hiddenFeatureTypes = newSet;
    },
    /**
     * #action
     */
    showAllFeatureTypes() {
        self.hiddenFeatureTypes = new Set();
    },
    /**
     * #action
     */
    setLoadedToMolstar(val) {
        self.loadedToMolstar = val;
    },
}))
    .views(self => ({
    /**
     * #getter
     */
    get connectedView() {
        const { views } = getSession(self);
        return views.find(f => f.id === self.connectedViewId);
    },
}))
    .actions(self => ({
    /**
     * #action
     */
    setClickedStructureRange(range) {
        self.clickedStructureRange = range;
    },
    /**
     * #action
     */
    setAlignmentHoverRange(range) {
        self.alignmentHoverRange = range;
    },
    /**
     * #action
     */
    setSelectedFeatureId(uniqueId) {
        self.selectedFeatureId = uniqueId;
    },
    /**
     * #action
     */
    setHoveredPosition(arg) {
        self.hoverPosition = arg;
    },
    /**
     * #action
     */
    setAlignment(r) {
        self.pairwiseAlignment = r;
    },
    /**
     * #action
     */
    setIsMouseInAlignment(val) {
        self.isMouseInAlignment = val;
    },
}))
    .views(self => ({
    /**
     * #getter
     * Extracts UniProt ID from AlphaFold URL if available
     */
    get uniprotId() {
        const { url } = self;
        if (!url) {
            return undefined;
        }
        return getUniprotIdFromAlphaFoldTarget(url);
    },
    /**
     * #getter
     */
    get structureTranscriptMaps() {
        return self.pairwiseAlignment
            ? structureSeqVsTranscriptSeqMap(self.pairwiseAlignment)
            : undefined;
    },
    /**
     * #getter
     */
    get structureSeqToTranscriptSeqPosition() {
        return this.structureTranscriptMaps?.structureSeqToTranscriptSeqPosition;
    },
    /**
     * #getter
     */
    get transcriptSeqToStructureSeqPosition() {
        return this.structureTranscriptMaps?.transcriptSeqToStructureSeqPosition;
    },
    /**
     * #getter
     */
    get structurePositionToAlignmentMap() {
        return self.pairwiseAlignment
            ? structurePositionToAlignmentMap(self.pairwiseAlignment)
            : undefined;
    },
    /**
     * #getter
     */
    get transcriptPositionToAlignmentMap() {
        return self.pairwiseAlignment
            ? transcriptPositionToAlignmentMap(self.pairwiseAlignment)
            : undefined;
    },
    /**
     * #getter
     */
    get pairwiseAlignmentToTranscriptPosition() {
        return this.transcriptPositionToAlignmentMap
            ? invertMap(this.transcriptPositionToAlignmentMap)
            : undefined;
    },
    /**
     * #getter
     */
    get pairwiseAlignmentToStructurePosition() {
        return this.structurePositionToAlignmentMap
            ? invertMap(this.structurePositionToAlignmentMap)
            : undefined;
    },
    /**
     * #getter
     */
    get hoverString() {
        const r = self.hoverPosition;
        if (r === undefined) {
            return '';
        }
        const structureLetter = this.hoverStructureLetter;
        const genomeLetter = this.hoverGenomeLetter;
        const parts = [];
        if (r.structureSeqPos !== undefined) {
            parts.push(`${r.structureSeqPos + 1}`);
        }
        if (structureLetter) {
            parts.push(`Structure: ${structureLetter}`);
        }
        if (genomeLetter && structureLetter && genomeLetter !== structureLetter) {
            parts.push(`Genome: ${genomeLetter}`);
        }
        if (r.chain) {
            parts.push(`Chain: ${r.chain}`);
        }
        return parts.join(', ');
    },
    /**
     * #getter
     */
    get genomeToTranscriptSeqMapping() {
        return self.feature
            ? genomeToTranscriptSeqMapping(new SimpleFeature(self.feature))
            : undefined;
    },
    /**
     * #getter
     */
    get structureSeqHoverPos() {
        return self.hoverPosition?.structureSeqPos;
    },
    /**
     * #getter
     */
    get alignmentHoverPos() {
        const pos = this.structureSeqHoverPos;
        return pos === undefined
            ? undefined
            : this.structurePositionToAlignmentMap?.[pos];
    },
    /**
     * #getter
     * Structure-residue range from a feature-bar hover, derived by mapping
     * alignmentHoverRange through pairwiseAlignmentToStructurePosition.
     * End is exclusive, matching clickedStructureRange.
     */
    get hoverStructureRange() {
        const { alignmentHoverRange } = self;
        const a2s = this.pairwiseAlignmentToStructurePosition;
        if (!alignmentHoverRange || !a2s) {
            return undefined;
        }
        const start = a2s[alignmentHoverRange.start];
        const end = a2s[alignmentHoverRange.end];
        return start === undefined || end === undefined
            ? undefined
            : { start, end: end + 1 };
    },
    /**
     * #getter
     * Persistent click selection in alignment coordinates, derived from
     * clickedStructureRange via structurePositionToAlignmentMap.
     */
    get clickAlignmentRange() {
        const range = self.clickedStructureRange;
        const s2a = this.structurePositionToAlignmentMap;
        if (!range || !s2a) {
            return undefined;
        }
        const start = s2a[range.start];
        const end = s2a[range.end - 1];
        return start === undefined || end === undefined
            ? undefined
            : { start, end };
    },
    /**
     * #getter
     * Maps a structure-residue range to genome coordinates as a single
     * IRegion. Handles single-residue and multi-residue ranges.
     */
    structureRangeToGenomeHighlight(range) {
        const assemblyName = self.connectedView?.assemblyNames[0];
        const mapping = this.genomeToTranscriptSeqMapping;
        if (!range || !assemblyName || !mapping) {
            return [];
        }
        const model = {
            genomeToTranscriptSeqMapping: mapping,
            pairwiseAlignment: self.pairwiseAlignment,
            structureSeqToTranscriptSeqPosition: this.structureSeqToTranscriptSeqPosition,
        };
        const mapped = range.end > range.start + 1
            ? proteinRangeToGenomeMapping({
                model,
                structureSeqPos: range.start,
                structureSeqEndPos: range.end,
            })
            : proteinToGenomeMapping({ model, structureSeqPos: range.start });
        if (!mapped) {
            return [];
        }
        const [start, end] = mapped;
        return [{ assemblyName, refName: mapping.refName, start, end }];
    },
    /**
     * #getter
     * Genome regions to highlight in the LGV based on the current hover.
     * A feature-range hover (hoverStructureRange) takes priority over a
     * single-residue hover (structureSeqHoverPos).
     */
    get hoverGenomeHighlights() {
        const range = this.hoverStructureRange;
        if (range) {
            return this.structureRangeToGenomeHighlight(range);
        }
        const structureSeqPos = this.structureSeqHoverPos;
        return structureSeqPos === undefined
            ? []
            : this.structureRangeToGenomeHighlight({
                start: structureSeqPos,
                end: structureSeqPos + 1,
            });
    },
    /**
     * #getter
     * Genome regions to highlight in the LGV from the persistent click
     * selection. Derived from clickedStructureRange.
     */
    get clickGenomeHighlights() {
        return this.structureRangeToGenomeHighlight(self.clickedStructureRange);
    },
    /**
     * #getter
     * Returns the single-letter amino acid code from the structure at hover position
     */
    get hoverStructureLetter() {
        const code = self.hoverPosition?.code;
        if (code) {
            return proteinAbbreviationMapping[code]?.singleLetterCode;
        }
        const structurePos = this.structureSeqHoverPos;
        if (structurePos !== undefined && self.structureSequences?.[0]) {
            return self.structureSequences[0][structurePos];
        }
        return undefined;
    },
    /**
     * #getter
     * Returns the single-letter amino acid code from the genome/transcript at hover position
     */
    get hoverGenomeLetter() {
        const structurePos = this.structureSeqHoverPos;
        if (structurePos === undefined) {
            return undefined;
        }
        const transcriptPos = this.structureSeqToTranscriptSeqPosition?.[structurePos];
        if (transcriptPos === undefined) {
            return undefined;
        }
        return self.userProvidedTranscriptSequence[transcriptPos];
    },
    /**
     * #getter
     */
    get alignmentMatchSet() {
        const con = self.pairwiseAlignment?.consensus;
        if (!con) {
            return undefined;
        }
        const matchSet = new Set();
        for (let i = 0; i < con.length; i++) {
            if (con[i] === '|' || con[i] === ':') {
                matchSet.add(i);
            }
        }
        return matchSet;
    },
    /**
     * #getter
     */
    get exactMatch() {
        const r1 = stripStopCodon(self.userProvidedTranscriptSequence);
        const r2 = self.structureSequences?.[0]
            ? stripStopCodon(self.structureSequences[0])
            : undefined;
        return r1 === r2;
    },
    get parentView() {
        return getParent(self, 2);
    },
    get zoomToBaseLevel() {
        return this.parentView.zoomToBaseLevel;
    },
    get autoScrollAlignment() {
        return this.parentView.autoScrollAlignment;
    },
    get showHighlight() {
        return this.parentView.showHighlight;
    },
    get showProteinTracks() {
        return this.parentView.showProteinTracks;
    },
    get alignmentAlgorithm() {
        return this.parentView.alignmentAlgorithm;
    },
    get molstarPluginContext() {
        return this.parentView.molstarPluginContext;
    },
    /**
     * #getter
     * Returns this structure's index in the parent's structures array
     */
    get structureIndex() {
        return this.parentView.structures.indexOf(self);
    },
    /**
     * #getter
     * Returns the Molstar structure object for the current structure.
     * Note: We access loadedToMolstar to ensure MobX recomputes this getter
     * when the structure finishes loading (Molstar's internal state isn't observable).
     */
    get molstarStructure() {
        const idx = this.structureIndex;
        return self.loadedToMolstar && idx >= 0
            ? this.molstarPluginContext?.managers.structure.hierarchy.current
                .structures[idx]?.cell.obj?.data
            : undefined;
    },
}))
    .actions(self => ({
    setError(e) {
        self.parentView.setError(e);
    },
    /**
     * #action
     */
    hoverAlignmentPosition(alignmentPos) {
        if (!self.alignmentHoverRange) {
            const structureSeqPos = self.pairwiseAlignmentToStructurePosition?.[alignmentPos];
            self.setHoveredPosition(structureSeqPos !== undefined ? { structureSeqPos } : undefined);
        }
    },
    /**
     * #action
     */
    clickAlignmentPosition(alignmentPos) {
        const structureSeqPos = self.pairwiseAlignmentToStructurePosition?.[alignmentPos];
        self.setSelectedFeatureId(undefined);
        if (structureSeqPos !== undefined) {
            clickProteinToGenome({
                model: self,
                structureSeqPos,
            }).catch((e) => {
                console.error(e);
                self.parentView.setError(e);
            });
        }
        else {
            self.setClickedStructureRange(undefined);
        }
    },
}))
    .actions(self => ({
    afterAttach() {
        addDisposer(self, autorun(async () => {
            try {
                const { userProvidedTranscriptSequence, structureSequences, exactMatch, alignmentAlgorithm, } = self;
                const seq1 = userProvidedTranscriptSequence;
                const seq2 = structureSequences?.[0];
                if (self.pairwiseAlignment || !seq1 || !seq2) {
                    return;
                }
                const r1 = stripStopCodon(seq1);
                const r2 = stripStopCodon(seq2);
                if (exactMatch) {
                    self.setAlignment({
                        consensus: '|'.repeat(r1.length),
                        alns: [
                            { id: 'seq1', seq: r1 },
                            { id: 'seq2', seq: r2 },
                        ],
                    });
                }
                else {
                    const pairwiseAlignment = runLocalAlignment(r1, r2, alignmentAlgorithm);
                    self.setAlignment(pairwiseAlignment);
                    self.parentView.setShowAlignment(true);
                }
            }
            catch (e) {
                console.error(e);
                self.parentView.setError(e);
            }
        }));
        addDisposer(self, autorun(() => {
            const { hovered } = getSession(self);
            const { transcriptSeqToStructureSeqPosition, genomeToTranscriptSeqMapping, connectedView, } = self;
            if (connectedView?.initialized &&
                genomeToTranscriptSeqMapping &&
                checkHovered(hovered)) {
                const { hoverPosition } = hovered;
                const pos = genomeToTranscriptSeqMapping.g2p[hoverPosition.coord - 1];
                if (pos !== undefined) {
                    const c0 = transcriptSeqToStructureSeqPosition?.[pos];
                    if (c0 !== undefined) {
                        self.setHoveredPosition({ structureSeqPos: c0 });
                    }
                }
            }
        }));
        addDisposer(self, autorun(async () => {
            const { molstarPluginContext } = self;
            if (molstarPluginContext) {
                const dispose = await subscribeMolstarInteraction({
                    plugin: molstarPluginContext,
                    kind: 'click',
                    onUpdate: info => {
                        // Click only acts on positive matches; ignore clicks that
                        // didn't land on a structure element.
                        if (!info) {
                            return;
                        }
                        self.setHoveredPosition(info);
                        self.setSelectedFeatureId(undefined);
                        clickProteinToGenome({
                            model: self,
                            structureSeqPos: info.structureSeqPos,
                        }).catch((e) => {
                            console.error(e);
                            self.parentView.setError(e);
                        });
                    },
                });
                addDisposer(self, dispose);
            }
        }));
        addDisposer(self, autorun(async () => {
            const { molstarPluginContext } = self;
            if (molstarPluginContext) {
                const dispose = await subscribeMolstarInteraction({
                    plugin: molstarPluginContext,
                    kind: 'hover',
                    onUpdate: info => {
                        self.setHoveredPosition(info);
                    },
                });
                addDisposer(self, dispose);
            }
        }));
        addDisposer(self, autorun(async () => {
            const { showHighlight, structureSeqToTranscriptSeqPosition, molstarPluginContext, molstarStructure, } = self;
            if (molstarStructure &&
                molstarPluginContext &&
                structureSeqToTranscriptSeqPosition) {
                if (showHighlight) {
                    const residues = Object.keys(structureSeqToTranscriptSeqPosition).map(coord => +coord + 1);
                    await applyLociInteractivityMultiple({
                        structure: molstarStructure,
                        residues,
                        plugin: molstarPluginContext,
                        mode: 'select',
                    });
                }
                else {
                    molstarPluginContext.managers.interactivity.lociSelects.deselectAll();
                }
            }
        }));
        // Drive molstar hover-highlight state from the model. A feature-range
        // hover (hoverStructureRange) takes priority over a single-residue
        // hover (structureSeqHoverPos); otherwise clear.
        addDisposer(self, autorun(async () => {
            const { molstarStructure, molstarPluginContext, hoverStructureRange, structureSeqHoverPos, } = self;
            if (molstarStructure && molstarPluginContext) {
                if (hoverStructureRange) {
                    await highlightResidueRange({
                        structure: molstarStructure,
                        plugin: molstarPluginContext,
                        startResidue: hoverStructureRange.start + 1,
                        endResidue: hoverStructureRange.end,
                    });
                }
                else if (structureSeqHoverPos !== undefined) {
                    await applyLociInteractivitySingle({
                        structure: molstarStructure,
                        plugin: molstarPluginContext,
                        selectedResidue: structureSeqHoverPos,
                        mode: 'highlight',
                    });
                }
                else {
                    molstarPluginContext.managers.interactivity.lociHighlights.clearHighlights();
                }
            }
        }));
    },
}));
export default Structure;
