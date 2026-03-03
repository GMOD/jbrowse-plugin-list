import { SimpleFeature, getSession, } from '@jbrowse/core/util';
import { addDisposer, getParent, types, } from '@jbrowse/mobx-state-tree';
import { autorun } from 'mobx';
import clearSelection from './clearSelection';
import highlightResidue from './highlightResidue';
import loadMolstar from './loadMolstar';
import { runLocalAlignment } from './pairwiseAlignment';
import { proteinAbbreviationMapping } from './proteinAbbreviationMapping';
import { clickProteinToGenome, hoverProteinToGenome, } from './proteinToGenomeMapping';
import selectResidue from './selectResidue';
import { checkHovered, invertMap, toStr } from './util';
import { getUniprotIdFromAlphaFoldTarget } from '../LaunchProteinView/utils/launchViewUtils';
import { stripStopCodon } from '../LaunchProteinView/utils/util';
import { genomeToTranscriptSeqMapping, structurePositionToAlignmentMap, structureSeqVsTranscriptSeqMap, transcriptPositionToAlignmentMap, } from '../mappings';
function extractLocationInfo(molstar, location) {
    return {
        structureSeqPos: molstar.StructureProperties.residue.auth_seq_id(location) - 1,
        code: molstar.StructureProperties.atom.label_comp_id(location),
        chain: molstar.StructureProperties.chain.auth_asym_id(location),
    };
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
     */
    clickGenomeHighlights: [],
    /**
     * #volatile
     */
    hoverGenomeHighlights: [],
    /**
     * #volatile
     */
    clickPosition: undefined,
    /**
     * #volatile
     */
    hoverPosition: undefined,
    /**
     * #volatile
     */
    pairwiseAlignmentStatus: '',
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
     * Persistent range of alignment positions from click (e.g., when clicking a protein feature)
     */
    clickAlignmentRange: undefined,
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
    setClickedPosition(arg) {
        self.clickPosition = arg;
    },
    /**
     * #action
     */
    setClickGenomeHighlights(r) {
        self.clickGenomeHighlights = r;
    },
    /**
     * #action
     */
    clearClickGenomeHighlights() {
        self.clickGenomeHighlights = [];
    },
    /**
     * #action
     */
    setHoverGenomeHighlights(r) {
        self.hoverGenomeHighlights = r;
    },
    /**
     * #action
     */
    clearHoverGenomeHighlights() {
        self.hoverGenomeHighlights = [];
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
    clearAlignmentHoverRange() {
        self.alignmentHoverRange = undefined;
    },
    /**
     * #action
     */
    setClickAlignmentRange(range) {
        self.clickAlignmentRange = range;
    },
    /**
     * #action
     */
    clearClickAlignmentRange() {
        self.clickAlignmentRange = undefined;
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
    clearSelectedFeatureId() {
        self.selectedFeatureId = undefined;
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
    setAlignmentStatus(str) {
        self.pairwiseAlignmentStatus = str;
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
    get structureSeqToTranscriptSeqPosition() {
        return self.pairwiseAlignment
            ? structureSeqVsTranscriptSeqMap(self.pairwiseAlignment)
                .structureSeqToTranscriptSeqPosition
            : undefined;
    },
    /**
     * #getter
     */
    get transcriptSeqToStructureSeqPosition() {
        return self.pairwiseAlignment
            ? structureSeqVsTranscriptSeqMap(self.pairwiseAlignment)
                .transcriptSeqToStructureSeqPosition
            : undefined;
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
    get clickString() {
        const r = self.clickPosition;
        return r === undefined ? '' : toStr(r);
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
            parts.push(`Position: ${r.structureSeqPos + 1}`);
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
    /**
     * #action
     * Highlight a residue from an external source (e.g., MSA view)
     */
    highlightFromExternal(structureSeqPos) {
        const structure = self.molstarStructure;
        const plugin = self.molstarPluginContext;
        if (structure && plugin) {
            highlightResidue({
                structure,
                selectedResidue: structureSeqPos,
                plugin,
            }).catch((e) => {
                console.error(e);
            });
        }
    },
    /**
     * #action
     * Clear highlight from an external source
     */
    clearHighlightFromExternal() {
        const plugin = self.molstarPluginContext;
        plugin?.managers.interactivity.lociHighlights.clearHighlights();
    },
    /**
     * #action
     */
    hoverAlignmentPosition(alignmentPos) {
        const structureSeqPos = self.pairwiseAlignmentToStructurePosition?.[alignmentPos];
        self.setHoveredPosition({ structureSeqPos });
        if (structureSeqPos !== undefined) {
            hoverProteinToGenome({
                model: self,
                structureSeqPos,
            });
        }
    },
    /**
     * #action
     */
    clickAlignmentPosition(alignmentPos) {
        const structureSeqPos = self.pairwiseAlignmentToStructurePosition?.[alignmentPos];
        self.clearSelectedFeatureId();
        self.setClickAlignmentRange({ start: alignmentPos, end: alignmentPos });
        if (structureSeqPos !== undefined) {
            clickProteinToGenome({
                model: self,
                structureSeqPos,
            }).catch((e) => {
                console.error(e);
            });
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
                if (!!self.pairwiseAlignment || !seq1 || !seq2) {
                    return;
                }
                const r1 = stripStopCodon(seq1);
                const r2 = stripStopCodon(seq2);
                if (exactMatch) {
                    let consensus = '';
                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                    for (let i = 0; i < r1.length; i++) {
                        consensus += '|';
                    }
                    self.setAlignment({
                        consensus,
                        alns: [
                            { id: 'seq1', seq: r1 },
                            { id: 'seq2', seq: r2 },
                        ],
                    });
                }
                else {
                    self.setAlignmentStatus('Running alignment...');
                    const pairwiseAlignment = runLocalAlignment(r1, r2, alignmentAlgorithm);
                    self.setAlignment(pairwiseAlignment);
                    self.setAlignmentStatus('');
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
                const c0 = pos === undefined
                    ? undefined
                    : transcriptSeqToStructureSeqPosition?.[pos];
                if (c0 !== undefined) {
                    self.setHoveredPosition({ structureSeqPos: c0 });
                }
            }
        }));
        addDisposer(self, autorun(async () => {
            const { molstarPluginContext } = self;
            if (molstarPluginContext) {
                const molstar = await loadMolstar();
                const ret = molstarPluginContext.behaviors.interaction.click.subscribe(e => {
                    if (molstar.StructureElement.Loci.is(e.current.loci)) {
                        const loc = molstar.StructureElement.Loci.getFirstLocation(e.current.loci);
                        if (loc) {
                            const locationInfo = extractLocationInfo(molstar, loc);
                            self.setHoveredPosition(locationInfo);
                            self.clearClickAlignmentRange();
                            self.clearSelectedFeatureId();
                            clickProteinToGenome({
                                model: self,
                                structureSeqPos: locationInfo.structureSeqPos,
                            }).catch((e) => {
                                console.error(e);
                                self.parentView.setError(e);
                            });
                        }
                    }
                });
                return () => {
                    ret.unsubscribe();
                };
            }
            return () => { };
        }));
        addDisposer(self, autorun(async () => {
            const { molstarPluginContext } = self;
            if (molstarPluginContext) {
                const molstar = await loadMolstar();
                const ret = molstarPluginContext.behaviors.interaction.hover.subscribe(e => {
                    if (molstar.StructureElement.Loci.is(e.current.loci)) {
                        const loc = molstar.StructureElement.Loci.getFirstLocation(e.current.loci);
                        if (loc) {
                            const locationInfo = extractLocationInfo(molstar, loc);
                            self.setHoveredPosition(locationInfo);
                            hoverProteinToGenome({
                                model: self,
                                structureSeqPos: locationInfo.structureSeqPos,
                            });
                        }
                    }
                });
                return () => {
                    ret.unsubscribe();
                };
            }
            return () => { };
        }));
        addDisposer(self, autorun(async () => {
            const { showHighlight, structureSeqToTranscriptSeqPosition, molstarPluginContext, molstarStructure, } = self;
            if (molstarStructure &&
                molstarPluginContext &&
                structureSeqToTranscriptSeqPosition) {
                if (showHighlight) {
                    for (const coord of Object.keys(structureSeqToTranscriptSeqPosition)) {
                        await selectResidue({
                            structure: molstarStructure,
                            plugin: molstarPluginContext,
                            selectedResidue: +coord + 1,
                        });
                    }
                }
                else {
                    clearSelection({
                        plugin: molstarPluginContext,
                    });
                }
            }
        }));
    },
}));
export default Structure;
//# sourceMappingURL=structureModel.js.map