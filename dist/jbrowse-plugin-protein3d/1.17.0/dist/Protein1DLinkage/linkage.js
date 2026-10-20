import { SimpleFeature } from '@jbrowse/core/util';
import { DEFAULT_ALIGNMENT_ALGORITHM, alignTranscriptToEntity, alignmentQuality, isLowSimilarity, keepSharedStretches, mappedStructureIdentity, structurePos, transcriptPos, } from 'p2s_mapper';
import { isIdentical } from '../ProteinView/alignOffThread';
import { assemblyNaming, genomeHoverToTranscriptPos, viewAssemblyName, } from '../ProteinView/util';
import { codingSpans, genomeToTranscriptSeqMapping } from '../mappings';
function isLinkableView(view) {
    return typeof view === 'object' && view !== null && 'proteinLinkage' in view;
}
export function getProteinLinkage(view) {
    return isLinkableView(view) ? view.proteinLinkage : undefined;
}
export function getProteinLinkageMapping(view) {
    return isLinkableView(view) ? view.proteinLinkageMapping : undefined;
}
/**
 * How the transcript's residues pair with the UniProt entry's, the
 * "structure" side of the mapper. Undefined until the view has aligned them,
 * and for good when it could not: a hover then lights nothing, where a raw
 * index lit residue 116 of p53 for the R248 codon of its Δ133 isoform.
 */
export function getProteinLinkageCoordinates(view) {
    return isLinkableView(view) ? view.proteinLinkageCoordinates : undefined;
}
/**
 * The 1D views showing this UniProt entry that were launched from this genome
 * view. One entry can be open from several genome views, and from several
 * isoforms on one; a hover names no view, so every one of them answers.
 */
export function findProteinLinkedViews(session, uniprotId, connectedViewId) {
    return session.views.filter(v => {
        const linkage = getProteinLinkage(v);
        return (linkage?.uniprotId === uniprotId &&
            linkage.connectedViewId === connectedViewId);
    });
}
/** The assembly of the genome view a 1D view was launched from. */
export function linkedGenomeAssemblyName(session, linkage) {
    return (linkage.assemblyName ?? viewAssemblyName(session, linkage.connectedViewId));
}
/** The 0-based UniProt residue a genome hover names on a 1D view, read
 * through the assembly of the genome view it was launched from. */
export function hovered1DProteinPosition(session, view) {
    const linkage = getProteinLinkage(view);
    const coordinates = getProteinLinkageCoordinates(view);
    const assemblyName = linkage
        ? linkedGenomeAssemblyName(session, linkage)
        : undefined;
    const pos = assemblyName && coordinates
        ? genomeHoverToTranscriptPos(session.hovered, getProteinLinkageMapping(view), assemblyNaming(session.assemblyManager, assemblyName))
        : undefined;
    return pos === undefined
        ? undefined
        : coordinates?.transcriptToStructure(transcriptPos(pos));
}
export function linkageGenomeMapping(linkage) {
    return genomeToTranscriptSeqMapping(new SimpleFeature(linkage.feature));
}
export function genomeHighlightsForProteinPosition({ p2gCodon, refName }, proteinPos) {
    return codingSpans(p2gCodon, [proteinPos]).map(([start, end]) => ({
        refName,
        start,
        end,
    }));
}
/**
 * The codon of a 0-based UniProt residue on the genome view these 1D views
 * were launched from, once per span: two isoforms of one entry usually agree
 * on the codon.
 */
export function genomeHighlightsForUniProtPosition(views, uniprotPos) {
    const spans = views.flatMap(view => {
        const mapping = getProteinLinkageMapping(view);
        const pos = getProteinLinkageCoordinates(view)?.structureToTranscript(structurePos(uniprotPos));
        return mapping && pos !== undefined
            ? genomeHighlightsForProteinPosition(mapping, pos)
            : [];
    });
    return [
        ...new Map(spans.map(s => [`${s.refName}:${s.start}-${s.end}`, s])).values(),
    ];
}
// Two isoforms of one protein differ only in their alternative exons, so the
// shared-stretch rule keeps most of their alignment: 92% for PKM1 on PKM2, 94%
// for FGFR2 IIIc on IIIb. A homolog a Foldseek hit opened differs everywhere,
// and the rule shreds it: mouse TP53 keeps 41%, HBB 28%, BRCA1 9%. Below this
// the entry is another protein, and the alignment maps it column for column.
const ISOFORM_KEPT_FRACTION = 0.8;
function isoformAlignment(pa) {
    const kept = keepSharedStretches(pa);
    return mappedStructureIdentity(kept).size >=
        ISOFORM_KEPT_FRACTION * mappedStructureIdentity(pa).size
        ? kept
        : pa;
}
/**
 * Align the linked transcript's translation to the sequence the 1D view
 * shows. Where that is another isoform, only the stretches the two spell
 * letter for letter map: a mutually exclusive exon aligns column for column
 * against its partner, and no codon of one encodes a residue of the other.
 * Run when the view attaches rather than stored at launch: the temporary
 * assembly fetches the UniProt entry afresh on every load, so a saved
 * alignment could describe a sequence the view no longer shows, and a snapshot
 * written by hand or before this existed has none.
 */
export async function resolveLinkageAlignment(host) {
    const [transcript, uniprot] = await Promise.all([
        host.transcriptProtein(),
        host.uniprotSequence(),
    ]);
    if (!transcript) {
        return { problem: 'the transcript has no translation' };
    }
    if (!uniprot) {
        return { problem: 'the UniProt sequence could not be read' };
    }
    const scored = isIdentical(transcript, uniprot)
        ? alignTranscriptToEntity(transcript, uniprot, DEFAULT_ALIGNMENT_ALGORITHM)
        : await host.align(transcript, uniprot);
    if (!scored) {
        return { problem: 'the sequences are too long to align' };
    }
    return isLowSimilarity(alignmentQuality(scored.alignment))
        ? { problem: 'the transcript and the UniProt entry are too dissimilar' }
        : { alignment: isoformAlignment(scored.alignment) };
}
