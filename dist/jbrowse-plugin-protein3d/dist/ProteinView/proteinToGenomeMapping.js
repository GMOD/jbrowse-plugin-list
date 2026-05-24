import { getSession } from '@jbrowse/core/util';
import { getCodonRange } from 'g2p_mapper';
/**
 * Maps a protein structure position to genome coordinates
 * @returns [start, end] tuple of genome coordinates, or undefined if mapping fails
 */
export function proteinToGenomeMapping({ model, structureSeqPos, }) {
    const { genomeToTranscriptSeqMapping, pairwiseAlignment, structureSeqToTranscriptSeqPosition, } = model;
    if (!genomeToTranscriptSeqMapping || !pairwiseAlignment) {
        return undefined;
    }
    const { p2g, strand } = genomeToTranscriptSeqMapping;
    const transcriptPos = structureSeqToTranscriptSeqPosition?.[structureSeqPos];
    if (transcriptPos === undefined) {
        return undefined;
    }
    return getCodonRange(p2g, transcriptPos, strand);
}
/**
 * Maps a protein structure range to genome coordinates
 * @returns [start, end] tuple of genome coordinates spanning the full range, or undefined if mapping fails
 */
export function proteinRangeToGenomeMapping({ model, structureSeqPos, structureSeqEndPos, }) {
    let minStart;
    let maxEnd;
    for (let pos = structureSeqPos; pos < structureSeqEndPos; pos++) {
        const result = proteinToGenomeMapping({ structureSeqPos: pos, model });
        if (result) {
            const [s, e] = result;
            if (minStart === undefined || s < minStart) {
                minStart = s;
            }
            if (maxEnd === undefined || e > maxEnd) {
                maxEnd = e;
            }
        }
    }
    if (minStart !== undefined && maxEnd !== undefined) {
        return [minStart, maxEnd];
    }
    return undefined;
}
export async function navigateToProteinPosition({ model, structureSeqPos, structureSeqEndPos, zoomToBaseLevel, }) {
    const session = getSession(model);
    const { connectedView, genomeToTranscriptSeqMapping } = model;
    if (!genomeToTranscriptSeqMapping || !connectedView) {
        return;
    }
    const { strand, refName } = genomeToTranscriptSeqMapping;
    const assemblyName = connectedView.assemblyNames[0];
    if (!assemblyName) {
        return;
    }
    const result = structureSeqEndPos !== undefined
        ? proteinRangeToGenomeMapping({
            structureSeqPos,
            structureSeqEndPos,
            model,
        })
        : proteinToGenomeMapping({ structureSeqPos, model });
    if (!result) {
        return;
    }
    const [start, end] = result;
    if (zoomToBaseLevel) {
        await connectedView.navToLocString(`${refName}:${start}-${end}${strand === -1 ? '[rev]' : ''}`, undefined, 0.2);
    }
    else {
        const { assemblyManager } = session;
        const assembly = assemblyManager.get(assemblyName);
        const canonicalRefName = assembly?.getCanonicalRefName(refName) ?? refName;
        connectedView.centerAt(start, canonicalRefName);
    }
}
export async function clickProteinToGenome({ model, structureSeqPos, structureSeqEndPos, }) {
    model.setClickedStructureRange({
        start: structureSeqPos,
        end: structureSeqEndPos ?? structureSeqPos + 1,
    });
    await navigateToProteinPosition({
        model,
        structureSeqPos,
        structureSeqEndPos,
        zoomToBaseLevel: model.zoomToBaseLevel,
    });
}
