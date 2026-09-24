import { SimpleFeature, getSession } from '@jbrowse/core/util';
import { addDisposer, getParent, isAlive, types, } from '@jbrowse/mobx-state-tree';
import { autorun, when } from 'mobx';
import { alignTranscriptToEntity, alignmentCol, alignmentQuality, chooseMappedEntity, entityLabel, fetchUniProtStructureMappings, fusionPartnerPositions, getPdbIdFromUrl, getUniprotIdFromAlphaFoldTarget, interactionMatchesMappedEntity, looksLikePlddt, makeCoordinateMapper, makeLabelSeqIdIndex, mappedStructureIdentity, rangeToLabelSeqIds, residueNumber, resolveStructureUrl, stripStopCodon, structureDisplayLabel, structurePos, toLabelSeqIds, unmapStructurePositions, } from 'p2s_mapper';
import { connectedHoverTranscriptPos } from './connectedHover';
import { COMPACT_TRACK_GAP, COMPACT_TRACK_HEIGHT, MINOR_FEATURE_TYPES, NORMAL_TRACK_GAP, NORMAL_TRACK_HEIGHT, } from './constants';
import { entityAlignedTo } from './entityAlignedTo';
import { frameResidues } from './frameSelection';
import { proteinAbbreviationMapping } from './proteinAbbreviationMapping';
import { clickProteinToGenome, navigateToProteinPosition, structureRangesToGenomeRegions, } from './proteinToGenomeMapping';
import { positionRangeRuns, rangeList, residueRuns, transcriptRuns, } from './residueRanges';
import { kyteDoolittleScores, mapResidueValuesToColumns } from './residueTracks';
import { errorMessage } from './util';
import { codingSpans, genomeToTranscriptSeqMapping } from '../mappings';
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
     * Transcript row first, structure row second, each spelling its whole
     * sequence. Once the entities load, an imported one moves
     * `mappedEntityId` to the chain it spells (see entityAlignedTo); one that
     * spells no chain is recomputed, against the stored chain when that is a
     * protein.
     */
    pairwiseAlignment: types.frozen(),
    /**
     * #property
     */
    feature: types.frozen(),
    /**
     * #property
     * Optional so a hand-authored `structures: [{ url }]` snapshot hydrates
     * without this field; empty means "use the structure's own sequence".
     */
    userProvidedTranscriptSequence: types.optional(types.string, ''),
    /**
     * #property
     * Declarative seed for the persistent selection: 0-based, half-open
     * structure-residue ranges `{ start, end }`, one or an array of them, lit
     * on load as if clicked — magenta in the 3D structure, a band per run on
     * the connected genome view, and the ranges in the alignment.
     */
    initialSelection: types.frozen(),
    /**
     * #property
     * The same seed named by author residue numbers, inclusive, as a paper
     * cites a site: `{ start: 248, end: 248 }` for p53's R248 whichever
     * fragment the crystal holds. Resolved through the mapped entity's
     * numbering once the structure loads; selects only residues numbered in
     * range, so a fusion partner numbered apart stays unselected.
     */
    initialResidues: types.frozen(),
    /**
     * #property
     * The seed named by 1-based inclusive residues of the transcript's own
     * translation, the numbering a UniProt feature or a domain map counts in.
     * Resolved through the alignment once it exists, selecting the runs of
     * structure residues the transcript pairs with, so it lands on the right
     * residues of any structure the transcript aligns to.
     */
    initialTranscriptResidues: types.frozen(),
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
    .preProcessSnapshot(({ pdbId, uniprotId, ...rest }) => {
    const url = resolveStructureUrl({ ...rest, uniprotId, pdbId });
    return {
        ...rest,
        url,
        uniprotId: uniprotId ?? (url ? getUniprotIdFromAlphaFoldTarget(url) : undefined),
        alignmentImported: rest.alignmentImported ?? rest.pairwiseAlignment !== undefined,
    };
})
    .volatile(() => ({
    /**
     * #volatile
     * The persistent selection as sorted, disjoint 0-based half-open
     * structure-position runs, empty when nothing is selected. A click sets
     * one; a spec or focusResidues may set several.
     */
    clickedStructureRanges: [],
    /**
     * #volatile
     * Whether the selection is a spec's seed the user has not since replaced
     * or put down, which is what the camera frames on load.
     */
    seedLit: false,
    /**
     * #volatile
     * Whether the user has set or cleared the selection, after which a seed
     * that resolves late is dropped rather than overruling them.
     */
    selectionTouched: false,
    /**
     * #volatile
     * Where the hover came from: the 3D structure (or this view's alignment
     * panel), the connected genome view, or a connected MSA view.
     * hoverGenomeHighlights draws only the first, since the other two mark
     * their own pointer on the genome.
     */
    hoverPosition: undefined,
    /**
     * #volatile
     */
    entities: undefined,
    /**
     * #volatile
     * Per-entity B-factor / pLDDT keyed by label_seq_id. Drives the
     * confidence feature track.
     */
    structureConfidence: undefined,
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
    alignmentSkipped: undefined,
    /**
     * #volatile
     * Whether `mappedEntityId` has been chosen by alignment or checked
     * against an imported alignment since the entities loaded
     */
    entityChosen: false,
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
    molstarStructures: new Array(),
    /**
     * #volatile
     * Ids of every Mol* model that load produced, all of an ensemble's models
     * included; see interactionPosition.
     */
    molstarModelIds: new Array(),
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
    /**
     * #volatile
     * Set of feature track types expanded to show every overlapping feature on
     * its own lane (collapsed types draw all features on a single row)
     */
    expandedFeatureTypes: new Set(),
    /**
     * #volatile
     * SIFTS' UniProt segments for an RCSB entry, undefined until fetched and
     * for any other structure. Drives the UniProt feature tracks and keeps a
     * fusion partner's residues out of the mapping (see `alignment`).
     */
    uniProtMappings: undefined,
    /**
     * #volatile
     */
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    uniProtMappingsError: undefined,
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
    error: undefined,
}))
    .actions(self => ({
    /**
     * #action
     * The file the accession's structure lives in, once the loader has asked
     * AlphaFold DB for it. Stored, so a saved session reopens the same model.
     */
    setUrl(url) {
        self.url = url;
    },
    /**
     * #action
     */
    setError(error) {
        self.error = error;
    },
    setUniProtMappings(mappings, error) {
        self.uniProtMappings = mappings;
        self.uniProtMappingsError = error;
    },
    setStructureData(data) {
        self.entities = data.entities;
        self.structureConfidence = data.confidence;
        self.molstarStructures = data.molstarStructures ?? [];
        self.molstarModelIds = data.modelIds ?? new Array();
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
    toggleFeatureTypeExpanded(type) {
        const next = new Set(self.expandedFeatureTypes);
        if (next.has(type)) {
            next.delete(type);
        }
        else {
            next.add(type);
        }
        self.expandedFeatureTypes = next;
    },
    /**
     * #action
     */
    setLoadedToMolstar(val) {
        self.loadedToMolstar = val;
        if (!val) {
            // the handles belong to the plugin we were unloaded from
            self.molstarStructures = [];
            self.molstarModelIds = new Array();
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
    get molstarStructure() {
        return self.molstarStructures[0];
    },
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
    setClickedStructureRanges(ranges) {
        self.clickedStructureRanges = ranges;
        self.selectionTouched = true;
        self.seedLit = false;
    },
    /**
     * #action
     * Lights a resolved seed, unless the user got to the selection first.
     */
    applySeed(ranges) {
        if (!self.selectionTouched) {
            self.clickedStructureRanges = ranges;
            self.seedLit = ranges.length > 0;
        }
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
        self.hoverPosition = arg ? { ...arg, source: 'structure' } : undefined;
    },
    /**
     * #action
     * Records a hover from the connected genome view or alignment. Drives the
     * 3D structure and feature-track highlight, but is excluded from
     * hoverGenomeHighlights: that view already marks its own pointer.
     */
    setConnectedHoveredPosition(structureSeqPos, source = 'genome') {
        self.hoverPosition =
            structureSeqPos === undefined ? undefined : { structureSeqPos, source };
    },
    /**
     * #action
     */
    setAlignment(r, imported = false) {
        self.pairwiseAlignment = r;
        self.alignmentImported = imported;
        self.alignmentSkipped = undefined;
    },
    setAlignmentSkipped(reason) {
        self.alignmentSkipped = reason;
    },
    setEntityChosen() {
        self.entityChosen = true;
    },
    /**
     * #action
     */
    setMappedEntityId(id) {
        self.mappedEntityId = id;
    },
    /**
     * #action
     */
    setIsMouseInAlignment(val) {
        self.isMouseInAlignment = val;
    },
    /**
     * #action
     */
    leaveAlignment() {
        self.hoverPosition = undefined;
        self.isMouseInAlignment = false;
    },
}))
    .views(self => ({
    /**
     * #getter
     * Sequence strings of every polymer entity (back-compat for the alignment
     * autorun and presence checks).
     */
    get structureSequences() {
        return self.entities?.map(e => e.seq);
    },
    /**
     * #getter
     * The entity that maps to the transcript: the chosen one when
     * `mappedEntityId` is set, else the first, so a standalone structure with
     * no transcript still has a chain to read hovers from.
     */
    get mappedEntity() {
        const { entities, mappedEntityId } = self;
        return entities?.find(e => e.entityId === mappedEntityId) ?? entities?.[0];
    },
    /**
     * #getter
     */
    get mappedStructureSeq() {
        return this.mappedEntity?.seq;
    },
    /**
     * #getter
     * The structure's name in the UI: PDB id, AlphaFold accession, else file
     * name. Heads its alignment panel and prefixes its hover readout, so with
     * several structures open a reader can tell which panel and which residue
     * belongs to which structure.
     */
    get label() {
        return structureDisplayLabel(self);
    },
    /**
     * #getter
     * The RCSB entry id, for a structure loaded from the PDB archive
     */
    get pdbId() {
        const { url } = self;
        return url && !getUniprotIdFromAlphaFoldTarget(url)
            ? getPdbIdFromUrl(url)
            : undefined;
    },
    /**
     * #getter
     * The alignment every map, highlight and the panel read: the stored one,
     * minus any residue SIFTS assigns to a protein fused to the transcript's
     * (see fusionPartnerPositions). Until SIFTS answers, without it, or for
     * an imported alignment, the stored alignment as is.
     */
    get alignment() {
        const pa = self.pairwiseAlignment;
        if (!pa || !self.uniProtMappings || self.alignmentImported) {
            return pa;
        }
        return unmapStructurePositions(pa, fusionPartnerPositions(self.uniProtMappings, this.mappedEntity, mappedStructureIdentity(pa)));
    },
    /**
     * #getter
     * All structure/transcript/alignment coordinate conversions, built once
     * from the alignment (see p2s_mapper's coordinates.ts). Use its typed
     * methods for point
     * conversions; the getters below expose the raw maps for whole-map
     * consumers.
     */
    get coordinateMapper() {
        const { alignment } = this;
        return alignment ? makeCoordinateMapper(alignment) : undefined;
    },
    /**
     * #getter
     */
    get structureSeqToTranscriptSeqPosition() {
        return this.coordinateMapper?.maps.structureSeqToTranscriptSeqPosition;
    },
    /**
     * #getter
     */
    get transcriptSeqToStructureSeqPosition() {
        return this.coordinateMapper?.maps.transcriptSeqToStructureSeqPosition;
    },
    /**
     * #getter
     */
    get structurePositionToAlignmentMap() {
        return this.coordinateMapper?.maps.structurePositionToAlignmentMap;
    },
    /**
     * #getter
     */
    get transcriptPositionToAlignmentMap() {
        return this.coordinateMapper?.maps.transcriptPositionToAlignmentMap;
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
        const entity = this.mappedEntity;
        const confidence = self.structureConfidence?.find(c => c.entityId === entity?.entityId);
        if (!entity || !confidence) {
            return [];
        }
        const values = entity.seqIds.map(id => confidence.byLabelSeqId.get(id));
        return looksLikePlddt(values.filter(v => v !== undefined))
            ? mapResidueValuesToColumns(values, this.structurePositionToAlignmentMap)
            : [];
    },
    /**
     * #getter
     * Per-residue Kyte-Doolittle hydrophobicity mapped to alignment columns.
     */
    get hydrophobicityCells() {
        const seq = this.mappedStructureSeq;
        return seq
            ? mapResidueValuesToColumns(kyteDoolittleScores(stripStopCodon(seq)), this.structurePositionToAlignmentMap)
            : [];
    },
    /**
     * #getter
     */
    get pairwiseAlignmentToStructurePosition() {
        return this.coordinateMapper?.maps.alignmentToStructurePosition;
    },
    /**
     * #method
     * What the mapped entity's residue at a 0-based position is called: its
     * author number where the file has one (R248 of p53 in 1TUP, where the
     * position is 154), so the ruler and hover read like the literature.
     */
    residueNumber(pos) {
        return residueNumber(this.mappedEntity, pos);
    },
    /**
     * #getter
     * The hovered residue, read out for the header: its author number first,
     * then the transcript residue it aligns to when that differs (a crystal
     * whose construct was renumbered from one), letters, chain and codon locus.
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
            const residue = this.residueNumber(r.structureSeqPos);
            parts.push(`${residue}`);
            const transcriptPos = this.structureSeqToTranscriptSeqPosition?.[r.structureSeqPos];
            if (transcriptPos !== undefined && transcriptPos + 1 !== residue) {
                parts.push(`Transcript residue: ${transcriptPos + 1}`);
            }
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
        const locus = this.hoverGenomeLocus;
        if (locus) {
            parts.push(locus);
        }
        return parts.join(', ');
    },
    /**
     * #getter
     * The hovered residue's codon as a 1-based locString, so the header can
     * name where in the genome a residue sits without a click.
     */
    get hoverGenomeLocus() {
        const pos = this.structureSeqHoverPos;
        const mapping = this.genomeToTranscriptSeqMapping;
        const transcriptPos = pos === undefined
            ? undefined
            : this.structureSeqToTranscriptSeqPosition?.[pos];
        if (!mapping || transcriptPos === undefined) {
            return undefined;
        }
        const spans = codingSpans(mapping.p2gCodon, [transcriptPos]);
        const start = spans[0]?.[0];
        const end = spans.at(-1)?.[1];
        return start === undefined || end === undefined
            ? undefined
            : `${mapping.refName}:${start + 1}-${end}`;
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
            : this.coordinateMapper?.structureToAlignment(structurePos(pos));
    },
    /**
     * #getter
     * Structure-residue range from a feature-bar hover, derived by mapping
     * alignmentHoverRange through pairwiseAlignmentToStructurePosition.
     * End is exclusive, matching clickedStructureRanges.
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
     * The current hover as a 0-based half-open structure range. A feature-range
     * hover (hoverStructureRange) takes priority over a single-residue hover
     * (structureSeqHoverPos). Drives both the molstar 3D highlight and the
     * genome highlight.
     */
    get hoverHighlightRange() {
        const pos = this.structureSeqHoverPos;
        return (this.hoverStructureRange ??
            (pos === undefined ? undefined : { start: pos, end: pos + 1 }));
    },
    /**
     * #getter
     * molstar's label_seq_id -> 0-based structure position for the mapped
     * entity. Computed once per entity rather than per hover event.
     */
    get labelSeqIdIndex() {
        return makeLabelSeqIdIndex(this.mappedEntity);
    },
    /**
     * #method
     * The 0-based position a Mol* hover or click names on this structure, or
     * undefined when it landed on another structure of the view, on a chain
     * other than the mapped one, or on a residue the entity lacks. The
     * position comes from the entity's own label_seq_ids rather than `- 1`, so
     * a PDB numbered from its author residues maps to the right residue.
     */
    interactionPosition(info) {
        return self.molstarModelIds.includes(info.modelId) &&
            interactionMatchesMappedEntity(info.entityId, this.coordinateMapper ? this.mappedEntity?.entityId : undefined)
            ? this.labelSeqIdIndex.get(info.labelSeqId)
            : undefined;
    },
    /**
     * #getter
     * The residues the molstar 'select' channel should light, as label_seq_ids:
     * a clicked/declarative domain range takes priority, else the whole
     * alignment-covered set when showHighlight is on, else nothing.
     */
    get selectLabelSeqIds() {
        const entity = this.mappedEntity;
        if (self.clickedStructureRanges.length) {
            return this.clickedLabelSeqIds;
        }
        const covered = this.structureSeqToTranscriptSeqPosition;
        return this.showHighlight && covered
            ? toLabelSeqIds(entity, Object.keys(covered).map(Number))
            : [];
    },
    /**
     * #getter
     * The selected residues as label_seq_ids, without the whole-alignment
     * fallback selectLabelSeqIds lights when nothing is selected: what the
     * camera frames.
     */
    get clickedLabelSeqIds() {
        const entity = this.mappedEntity;
        return self.clickedStructureRanges.flatMap(range => rangeToLabelSeqIds(entity, range));
    },
    /**
     * #getter
     * Whether a spec declares a selection. An empty array declares none.
     */
    get seededSelection() {
        return [
            self.initialSelection,
            self.initialResidues,
            self.initialTranscriptResidues,
        ].some(ranges => rangeList(ranges).length > 0);
    },
    /**
     * #getter
     * The residues the molstar 'highlight' (hover) channel should light.
     */
    get hoverLabelSeqIds() {
        return rangeToLabelSeqIds(this.mappedEntity, this.hoverHighlightRange);
    },
    /**
     * #getter
     * The persistent selection in alignment columns, inclusive, one range per
     * run of clickedStructureRanges.
     */
    get clickAlignmentRanges() {
        const s2a = this.structurePositionToAlignmentMap;
        return s2a
            ? self.clickedStructureRanges.flatMap(range => {
                const start = s2a[range.start];
                const end = s2a[range.end - 1];
                return start === undefined || end === undefined
                    ? []
                    : [{ start, end }];
            })
            : [];
    },
    /**
     * #method
     * The genome regions structure-residue ranges cover, one per stretch of
     * contiguous coding bases.
     */
    structureRangesToGenomeHighlight(ranges) {
        return structureRangesToGenomeRegions({
            ranges,
            assemblyName: self.connectedView?.assemblyNames[0],
            model: {
                genomeToTranscriptSeqMapping: this.genomeToTranscriptSeqMapping,
                pairwiseAlignment: this.alignment,
                structureSeqToTranscriptSeqPosition: this.structureSeqToTranscriptSeqPosition,
            },
        });
    },
    /**
     * #getter
     * Genome regions to highlight in the LGV from the current hover, for a
     * hover in this view only: the genome view and a connected MSA already
     * mark their own pointer there, and echoing it doubles the band.
     */
    get hoverGenomeHighlights() {
        const source = self.hoverPosition?.source;
        return source === 'genome' || source === 'msa'
            ? []
            : this.structureRangesToGenomeHighlight(rangeList(this.hoverHighlightRange));
    },
    /**
     * #getter
     * Genome regions to highlight in the LGV from the persistent click
     * selection, one per run of coding bases across every selected range.
     */
    get clickGenomeHighlights() {
        return this.structureRangesToGenomeHighlight(self.clickedStructureRanges);
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
        const seq = this.mappedStructureSeq;
        if (structurePos !== undefined && seq) {
            return seq[structurePos];
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
        const con = this.alignment?.consensus;
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
     * True while a pairwise alignment can still be produced but hasn't been
     * computed yet (both the transcript and structure sequences are present).
     * A standalone structure with no connected transcript has no sequence to
     * align against, so this stays false — the header shows no loader rather
     * than a perpetual "Loading pairwise alignment".
     */
    get alignmentPending() {
        return (!self.pairwiseAlignment &&
            !self.alignmentSkipped &&
            !!self.userProvidedTranscriptSequence &&
            !!this.structureSequences?.length);
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
            return false;
        }
        return (!self.loadedToMolstar ||
            this.alignmentPending ||
            (!!this.pdbId &&
                self.uniProtMappings === undefined &&
                self.uniProtMappingsError === undefined));
    },
    /**
     * #getter
     * Which of those steps is running, named for the overlay on the canvas. A
     * structure fetch, a parse, an alignment and a SIFTS lookup run for seconds
     * behind what would otherwise be an empty grey rectangle.
     */
    get loadingMessage() {
        if (!this.loading) {
            return undefined;
        }
        if (!self.loadedToMolstar) {
            return self.url === undefined &&
                self.data === undefined &&
                self.uniprotId
                ? `Resolving AlphaFold model for ${self.uniprotId}`
                : `Loading ${this.label}`;
        }
        if (this.alignmentPending) {
            const name = self.feature?.name;
            return typeof name === 'string'
                ? `Aligning ${this.label} to ${name}`
                : `Aligning ${this.label}`;
        }
        return `Mapping ${this.label} to UniProt`;
    },
    /**
     * #getter
     * What went wrong with this structure, for the line beside its label in
     * the header: a failed load, or a structure with no chain the transcript
     * can be aligned to. One line per structure, rather than a view-wide
     * banner that names neither which structure nor what it was doing.
     */
    get statusMessage() {
        const { error } = self;
        return error === undefined ? self.alignmentSkipped : errorMessage(error);
    },
    /**
     * #getter
     * Identity and coverage of the pairwise alignment, for the header readout
     * and the low-similarity warning. See p2s_mapper's alignmentQuality.ts.
     */
    get alignmentQuality() {
        const { alignment } = this;
        return alignment ? alignmentQuality(alignment) : undefined;
    },
    /**
     * #getter
     * Whether the mapped chain spells the transcript's translation exactly.
     * Nothing in this repo reads it; jb2hubs' `scripts/checkProteinLaunches.ts`
     * does, off the live model, to assert a launch that should map as an
     * identity did. It stays for that.
     */
    get exactMatch() {
        const r1 = stripStopCodon(self.userProvidedTranscriptSequence);
        const r2 = this.mappedStructureSeq
            ? stripStopCodon(this.mappedStructureSeq)
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
    get showAllFeatureTracks() {
        return this.parentView.showAllFeatureTracks;
    },
    /**
     * #getter
     * The feature types left undrawn: the ones hidden by hand, and the minor
     * ones unless every track is shown.
     */
    get omittedFeatureTypes() {
        return this.showAllFeatureTracks
            ? self.hiddenFeatureTypes
            : new Set([...MINOR_FEATURE_TYPES, ...self.hiddenFeatureTypes]);
    },
    get trackHeight() {
        return this.parentView.compactTracks
            ? COMPACT_TRACK_HEIGHT
            : NORMAL_TRACK_HEIGHT;
    },
    get trackGap() {
        return this.parentView.compactTracks
            ? COMPACT_TRACK_GAP
            : NORMAL_TRACK_GAP;
    },
    get alignmentAlgorithm() {
        return this.parentView.alignmentAlgorithm;
    },
    get molstarPluginContext() {
        return this.parentView.molstarPluginContext;
    },
}))
    .views(self => ({
    /**
     * #method
     * The position runs a selection target names on this structure, or
     * undefined until the structure has what resolving it needs: the mapped
     * entity for author numbers, the settled alignment for transcript
     * residues. Before the entity is chosen or checked, mappedEntity may be
     * entities[0] or a stored id, which in 1TUP is a DNA strand; for a fusion
     * the alignment also waits on SIFTS.
     */
    resolveSelection({ positions, residues, transcriptResidues, }) {
        const entityChosen = !!self.entities &&
            (self.entityChosen || !self.userProvidedTranscriptSequence);
        const mapper = self.coordinateMapper;
        if (residues && !entityChosen) {
            return undefined;
        }
        if (transcriptResidues && (!mapper || self.loading)) {
            return undefined;
        }
        return positionRangeRuns([
            ...positionRangeRuns(positions ?? []),
            ...(residues ? residueRuns(self.mappedEntity, residues) : []),
            ...(mapper && transcriptResidues
                ? transcriptRuns(mapper, transcriptResidues)
                : []),
        ]);
    },
}))
    .actions(self => ({
    /**
     * #action
     * Report on the view's dismissable banner rather than on this structure:
     * a navigation or a chain choice the user asked for and that failed, as
     * opposed to a structure that cannot be shown at all.
     */
    setViewError(e) {
        self.parentView.setError(e);
    },
    /**
     * #action
     */
    hoverAlignmentPosition(alignmentPos) {
        if (!self.alignmentHoverRange) {
            const structureSeqPos = self.coordinateMapper?.alignmentToStructure(alignmentCol(alignmentPos));
            self.setHoveredPosition(structureSeqPos !== undefined ? { structureSeqPos } : undefined);
        }
    },
    /**
     * #action
     * The user's override of which chain the transcript maps to. The alignment
     * is recomputed against that entity's sequence, and every highlight that
     * derived from the old one is dropped, since its positions meant residues
     * of another chain.
     */
    chooseEntity(entityId) {
        const entity = self.entities?.find(e => e.entityId === entityId);
        if (!entity || entity.entityId === self.mappedEntity?.entityId) {
            return;
        }
        const scored = alignTranscriptToEntity(self.userProvidedTranscriptSequence, entity.seq, self.alignmentAlgorithm);
        if (!scored) {
            throw new Error(`${entity.chains.join('/') || entity.entityId} is too long to align to this transcript`);
        }
        self.setMappedEntityId(entityId);
        self.setAlignment(scored.alignment);
        self.setClickedStructureRanges([]);
        self.setAlignmentHoverRange(undefined);
        self.setSelectedFeatureId(undefined);
        self.setHoveredPosition(undefined);
    },
    /**
     * #action
     */
    clickAlignmentPosition(alignmentPos) {
        const structureSeqPos = self.coordinateMapper?.alignmentToStructure(alignmentCol(alignmentPos));
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
            self.setClickedStructureRanges([]);
        }
    },
}))
    .actions(self => ({
    /**
     * #action
     * Select residues and bring them into view: the camera frames them, as it
     * does a spec's seed, and the connected genome view moves to them, as it
     * does on a click. Every other structure's selection goes down, as with a
     * click in Mol*. For whatever drives the view from outside, an agent
     * saying "show me R248" among them.
     *
     * Waits until the view has settled, as the seed's framing does: the
     * transcript's entity chosen, the alignment made and, with several
     * structures, superposition done, so neither the numbering nor the camera
     * is read before it means anything. Rejects if that takes longer than
     * `timeout` ms. A target naming no residue of the structure selects
     * nothing and leaves the camera where it is.
     */
    async focusResidues(target, { timeout = 120_000 } = {}) {
        const ready = () => !!self.coordinateMapper &&
            (self.entityChosen || !self.userProvidedTranscriptSequence) &&
            self.parentView.settled &&
            self.resolveSelection(target) !== undefined;
        try {
            await when(() => !isAlive(self) || ready(), { timeout });
        }
        catch {
            throw new Error(`${self.label} did not finish loading`);
        }
        if (!isAlive(self)) {
            return [];
        }
        const runs = self.resolveSelection(target) ?? [];
        self.parentView.clearSelection();
        self.setClickedStructureRanges(runs);
        const first = runs[0];
        const last = runs.at(-1);
        const plugin = self.molstarPluginContext;
        const structure = self.molstarStructure;
        const labelSeqIds = self.clickedLabelSeqIds;
        if (plugin && structure && labelSeqIds.length) {
            frameResidues(plugin, [{ structure, entityId: self.mappedEntity?.entityId, labelSeqIds }], () => self.molstarPluginContext === plugin).catch((e) => {
                console.error(e);
            });
        }
        if (first && last) {
            navigateToProteinPosition({
                model: self,
                structureSeqPos: first.start,
                structureSeqEndPos: last.end,
                zoomToBaseLevel: self.zoomToBaseLevel,
            }).catch((e) => {
                console.error(e);
                self.parentView.setError(e);
            });
        }
        return runs;
    },
}))
    .actions(self => ({
    afterAttach() {
        const { pdbId } = self;
        if (pdbId) {
            fetchUniProtStructureMappings(pdbId).then(mappings => {
                if (isAlive(self)) {
                    self.setUniProtMappings(mappings);
                }
            }, (e) => {
                if (isAlive(self)) {
                    self.setUniProtMappings(undefined, e);
                }
            });
        }
        // Resolves once, when the structure has what the seed's numbering needs,
        // unless the user has set or cleared the selection by then. A seed of
        // positions alone resolves here and now.
        const seed = {
            positions: self.initialSelection,
            residues: self.initialResidues,
            transcriptResidues: self.initialTranscriptResidues,
        };
        if (self.seededSelection) {
            addDisposer(self, when(() => self.selectionTouched ||
                self.resolveSelection(seed) !== undefined, () => {
                self.applySeed(self.resolveSelection(seed) ?? []);
            }));
        }
        addDisposer(self, autorun(() => {
            try {
                const { userProvidedTranscriptSequence, entities, alignmentAlgorithm, pairwiseAlignment, } = self;
                if (!userProvidedTranscriptSequence || !entities?.length) {
                    return;
                }
                if (pairwiseAlignment) {
                    if (!self.alignmentImported) {
                        self.setEntityChosen();
                        return;
                    }
                    const fit = entityAlignedTo(pairwiseAlignment, userProvidedTranscriptSequence, entities, self.mappedEntityId);
                    if ('entityId' in fit) {
                        self.setMappedEntityId(fit.entityId);
                        self.setEntityChosen();
                        return;
                    }
                    self.setViewError(new Error(`The alignment stored for ${self.label} no longer matches its chain and was recomputed: ${fit.problem}`));
                    const saved = entities.find(e => e.entityId === self.mappedEntityId && !e.nucleicAcid);
                    const realigned = saved &&
                        alignTranscriptToEntity(userProvidedTranscriptSequence, saved.seq, alignmentAlgorithm);
                    self.setAlignment(realigned ? realigned.alignment : undefined);
                    if (realigned) {
                        self.setEntityChosen();
                    }
                    return;
                }
                const selection = chooseMappedEntity(userProvidedTranscriptSequence, entities, alignmentAlgorithm);
                if (!selection) {
                    // chooseMappedEntity returns undefined for both "no protein
                    // chain" and "every protein chain over the DP ceiling"; either
                    // way the user has to hear it, or the header loads forever.
                    const proteins = entities.filter(e => !e.nucleicAcid && e.seq.length > 0);
                    const reason = proteins.length
                        ? `No chain could be aligned: ${proteins
                            .map(e => entityLabel(e))
                            .join(', ')} exceed the alignment size limit against this ${stripStopCodon(userProvidedTranscriptSequence).length} aa transcript`
                        : 'This structure has no protein chain to align the transcript to';
                    self.setAlignmentSkipped(reason);
                    return;
                }
                self.setMappedEntityId(entities[selection.index]?.entityId);
                self.setAlignment(selection.alignment);
                self.setEntityChosen();
            }
            catch (e) {
                console.error(e);
                self.setError(e);
            }
        }));
        addDisposer(self, autorun(() => {
            const { hovered, views, assemblyManager } = getSession(self);
            const assembly = assemblyManager.get(self.connectedView?.assemblyNames[0] ?? '');
            const hover = connectedHoverTranscriptPos({
                hovered,
                views,
                mapping: self.genomeToTranscriptSeqMapping,
                connectedViewId: self.connectedViewId,
                genomeViewReady: !!self.connectedView?.initialized,
                canonical: r => assembly?.getCanonicalRefName(r) ?? r,
            });
            if (hover) {
                self.setConnectedHoveredPosition(self.transcriptSeqToStructureSeqPosition?.[hover.transcriptPos], hover.source);
            }
            else if (self.hoverPosition?.source !== 'structure') {
                // a hover from the 3D structure is cleared by Mol*'s leave event
                self.setConnectedHoveredPosition(undefined);
            }
        }));
    },
}));
export default Structure;
