import { stripStopCodon } from './util';
import { alignTranscriptToEntity, chooseMappedEntity, } from '../../ProteinView/chooseMappedEntity';
// The picker re-ranks on every render and each non-exact isoform costs an
// O(len²) alignment, so results are cached by sequence pair: a titin-sized
// isoform against a long chain is a second of main-thread work each time.
const alignmentCache = new Map();
const ALIGNMENT_CACHE_LIMIT = 200;
function alignToStructure(isoform, structure) {
    const key = `${isoform}\n${structure}`;
    let result = alignmentCache.get(key);
    if (result === undefined) {
        const scored = alignTranscriptToEntity(isoform, structure, 'smith_waterman');
        result = { identical: scored?.matches ?? 0, score: scored?.score ?? 0 };
        if (alignmentCache.size >= ALIGNMENT_CACHE_LIMIT) {
            alignmentCache.clear();
        }
        alignmentCache.set(key, result);
    }
    return result;
}
/**
 * The single rule for ranking transcript isoforms against a structure, shared
 * by the picker UI and the auto-selection. An isoform whose translation is the
 * structure's sequence wins outright. Among the rest, the best alignment score
 * comes first, then the most identical residues, then length.
 *
 * The score has to lead: an isoform carrying an exon the structure lacks
 * aligns every structure residue too, across a gap, so it ties on identical
 * residues with the isoform the structure was made from (1MH1 against Rac1
 * and Rac1b). See docs/genome-to-structure-alignment.md for the measurement.
 */
export function classifyIsoforms({ options, isoformSequences, structureSequence, }) {
    const matches = [];
    const nonMatches = [];
    const noData = [];
    const structure = structureSequence
        ? stripStopCodon(structureSequence)
        : undefined;
    for (const feature of options) {
        const entry = isoformSequences[feature.id()];
        if (!entry) {
            noData.push(feature);
        }
        else if (structure && stripStopCodon(entry.seq) === structure) {
            matches.push({ feature, length: entry.seq.length });
        }
        else {
            nonMatches.push({
                feature,
                length: entry.seq.length,
                ...(structure ? alignToStructure(entry.seq, structure) : {}),
            });
        }
    }
    const byLengthDesc = (a, b) => b.length - a.length;
    const byAlignmentThenLength = (a, b) => (b.score ?? 0) - (a.score ?? 0) ||
        (b.identical ?? 0) - (a.identical ?? 0) ||
        byLengthDesc(a, b);
    return {
        matches: matches.toSorted(byLengthDesc),
        nonMatches: nonMatches.toSorted(byAlignmentThenLength),
        noData,
    };
}
export function selectBestTranscript(args) {
    const { matches, nonMatches } = classifyIsoforms(args);
    return (matches[0] ?? nonMatches[0])?.feature;
}
/**
 * Which of a structure's protein chains the launch dialog compares isoforms
 * against: one some isoform translates to exactly, else the chain the view's
 * own `chooseMappedEntity` would map the longest isoform to, never simply the
 * first (CDK2, on 1H26). `structureSequences` must hold protein chains only.
 */
export function pickStructureSequence(structureSequences, isoformSequences) {
    const translations = Object.values(isoformSequences ?? {}).map(v => stripStopCodon(v.seq));
    const translated = new Set(translations);
    const exact = structureSequences?.find(s => translated.has(stripStopCodon(s)));
    const longest = translations.reduce((a, b) => (a !== undefined && a.length >= b.length ? a : b), undefined);
    const aligned = structureSequences && longest
        ? chooseMappedEntity(longest, structureSequences, 'smith_waterman')
        : undefined;
    return (exact ??
        (aligned ? structureSequences?.[aligned.index] : structureSequences?.[0]));
}
