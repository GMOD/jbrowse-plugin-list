import { genomeHoverToTranscriptPos } from './util';
/**
 * The transcript residue a pointer elsewhere in the session is on: the genome
 * view's hover first, else the hovered column of an alignment connected to the
 * same genome view, which is how msaview pairs with a structure too.
 *
 * The alignment is read as the codon msaview maps its column to, never as a
 * column number: the genome is the one coordinate the two plugins share, so
 * this holds for any alignment whose query row is linked to the transcript,
 * such as a Pfam seed row cut to one domain.
 */
export function connectedHoverTranscriptPos({ hovered, views, mapping, connectedViewId, genomeViewReady, canonical = r => r, }) {
    const fromGenome = genomeViewReady
        ? genomeHoverToTranscriptPos(hovered, mapping, canonical)
        : undefined;
    if (fromGenome !== undefined) {
        return { transcriptPos: fromGenome, source: 'genome' };
    }
    const codon = connectedViewId
        ? views.find(v => v.type === 'MsaView' && v.connectedViewId === connectedViewId)?.connectedHoverHighlights?.[0]
        : undefined;
    const fromMsa = mapping && codon && canonical(codon.refName) === canonical(mapping.refName)
        ? mapping.g2p[codon.start]
        : undefined;
    return fromMsa === undefined
        ? undefined
        : { transcriptPos: fromMsa, source: 'msa' };
}
