import { transcriptPos } from 'p2s_mapper';
import { RESIDUE_COLORS } from './residueColors';
import { placeValues } from './variantEffects';
export const EMPTY_EXON_COLOR = { ...RESIDUE_COLORS.exon };
function isUtr(type) {
    return type !== undefined && /utr/i.test(type);
}
export const MAX_ALIGNMENT_GAP_BP = 9;
function mergedBlocks(rows) {
    const merged = [];
    for (const { start, end } of rows.toSorted((a, b) => a.start - b.start)) {
        const last = merged.at(-1);
        if (last && start - last.end <= MAX_ALIGNMENT_GAP_BP) {
            last.end = Math.max(last.end, end);
        }
        else {
            merged.push({ start, end });
        }
    }
    return merged;
}
/**
 * A transcript's exons in transcript order. Its `exon` rows when it has them;
 * otherwise its CDS and UTR rows, joined where they touch, which rebuilds the
 * exons a BED12 or bigBed transcript implies. Blocks a gap too short to be an
 * intron separates are one exon.
 */
export function transcriptExons(feature) {
    const rows = feature.subfeatures ?? [];
    const exonRows = rows.filter(r => r.type === 'exon');
    const blocks = mergedBlocks(exonRows.length > 0
        ? exonRows
        : rows.filter(r => r.type === 'CDS' || isUtr(r.type)));
    return {
        blocks: feature.strand === -1 ? blocks.toReversed() : blocks,
        numbering: exonRows.length > 0 || rows.some(r => isUtr(r.type))
            ? 'transcript'
            : 'coding',
    };
}
function exonOfBase(blocks, base) {
    const i = blocks.findIndex(b => base >= b.start && base < b.end);
    return i === -1 ? undefined : i + 1;
}
/**
 * The exon of a codon's bases, given in transcript order: the one holding
 * most of them, so a codon an intron splits 2 + 1 belongs to the exon with
 * two. Every boundary a codon does not straddle (phase 0) has no such
 * residue, so a junction color would mark only some boundaries.
 */
export function codonExon(blocks, bases) {
    const counts = new Map();
    for (const base of bases) {
        const exon = exonOfBase(blocks, base);
        if (exon !== undefined) {
            counts.set(exon, (counts.get(exon) ?? 0) + 1);
        }
    }
    const ranked = [...counts].toSorted((a, b) => b[1] - a[1]);
    const exons = [...counts.keys()];
    return ranked.length === 0
        ? undefined
        : exons.length > 1
            ? { exon: ranked[0][0], codonExons: exons }
            : { exon: ranked[0][0] };
}
/** Each 0-based transcript residue's exon, through its codon's bases. */
export function exonsByTranscriptPosition(exons, p2gCodon) {
    const byPosition = new Map();
    for (const [pos, bases] of Object.entries(p2gCodon)) {
        const exon = codonExon(exons.blocks, bases);
        if (exon) {
            byPosition.set(Number(pos), exon);
        }
    }
    return byPosition;
}
/** What an exon is called under its numbering, in the legend and the hover. */
function exonTitle(numbering) {
    return numbering === 'coding' ? 'Coding exon' : 'Exon';
}
/**
 * The color object of a transcript's exons: one domain value per exon number,
 * the palette cycled over them.
 */
export function exonColor({ blocks, numbering }) {
    const { range } = RESIDUE_COLORS.exon;
    return {
        ...RESIDUE_COLORS.exon,
        domain: blocks.map((_, i) => `${i + 1}`),
        range: blocks.map((_, i) => range[i % range.length]),
        title: exonTitle(numbering),
    };
}
/**
 * The key of an exon color: one row per color, naming every exon it paints,
 * so a 50-exon gene takes as many rows as the palette has colors.
 */
export function exonKeyEntries(color) {
    const exonsByColor = new Map();
    color.domain.forEach((exon, i) => {
        const c = color.range[i];
        if (c !== undefined) {
            exonsByColor.set(c, [...(exonsByColor.get(c) ?? []), exon]);
        }
    });
    return [...exonsByColor].map(([c, exons]) => ({
        label: `${color.title}${exons.length > 1 ? 's' : ''} ${exons.join(', ')}`,
        color: c,
    }));
}
/** A residue's exon as the hover names it, numbered as the legend is. */
export function exonLabel({ exon, codonExons }, numbering) {
    const title = exonTitle(numbering);
    return codonExons
        ? `${title} ${exon} (codon spans ${codonExons.join('/')})`
        : `${title} ${exon}`;
}
/**
 * A located residue with its transcript residue's exon, the exons its codon
 * spans where an intron splits it, and how the exons are counted, so a script
 * can tell a coding exon's number from the gene's.
 */
export function withExon(location, byPosition, numbering) {
    const exon = location?.transcriptResidue === undefined
        ? undefined
        : byPosition.get(location.transcriptResidue - 1);
    return location && exon
        ? { ...location, ...exon, exonNumbering: numbering }
        : location;
}
/**
 * The transcript's exon numbers placed on the mapped entity, through each
 * residue's codon and the structure's alignment to the transcript. Waits,
 * with no message, for the alignment.
 */
export function exonStatus({ exons, byPosition, entity, transcriptToStructure, }) {
    const color = exons && exons.blocks.length > 0 && byPosition.size > 0
        ? exonColor(exons)
        : undefined;
    const placed = color && entity && transcriptToStructure
        ? placeValues(new Map([...byPosition].map(([pos, { exon }]) => [pos, exon])), pos => transcriptToStructure(transcriptPos(pos)), entity)
        : undefined;
    return !color
        ? {
            message: exons
                ? 'The transcript names no coding exons to color by'
                : 'There is no transcript, so no exons to color by',
        }
        : !placed
            ? { color }
            : placed.byLabelSeqId.size > 0
                ? { placed, color }
                : { color, message: "No exon reaches this structure's residues" };
}
