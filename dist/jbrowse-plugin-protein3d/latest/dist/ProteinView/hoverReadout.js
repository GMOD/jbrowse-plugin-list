import { codonGenomeSpan, residueNumber } from 'p2s_mapper';
/**
 * A transcript residue's codon as a 1-based locString on the transcript's own
 * refName, outer bounds included when an intron splits it.
 */
export function codonLocus(mapping, transcriptPos) {
    if (!mapping || transcriptPos === undefined) {
        return undefined;
    }
    const span = codonGenomeSpan(mapping.p2gCodon, transcriptPos);
    return span ? `${mapping.refName}:${span[0] + 1}-${span[1]}` : undefined;
}
/**
 * The header's readout of the hovered residue: author number, the transcript
 * residue when it differs, letters, chain and codon locus. A modified residue
 * (MSE, TPO) shows its parent's letter.
 */
export function hoverReadout({ hover, entity, structureToTranscript, transcript, locus, }) {
    const pos = hover.structureSeqPos;
    const transcriptPos = pos === undefined ? undefined : structureToTranscript?.[pos];
    const structureLetter = pos === undefined ? undefined : entity?.seq[pos];
    const genomeLetter = transcriptPos === undefined ? undefined : transcript[transcriptPos];
    const parts = [];
    if (pos !== undefined) {
        const residue = residueNumber(entity, pos);
        parts.push(`${residue}`);
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
    if (hover.chain) {
        parts.push(`Chain: ${hover.chain}`);
    }
    if (locus) {
        parts.push(locus);
    }
    return parts.join(', ');
}
