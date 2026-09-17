import { getSession } from '@jbrowse/core/util';
import { codonGenomeSpan } from 'p2s_mapper';
/**
 * Maps a protein structure position to genome coordinates
 * @returns [start, end] tuple of genome coordinates, or undefined if mapping fails
 */
export function proteinToGenomeMapping({ model, structureSeqPos, }) {
    const { genomeToTranscriptSeqMapping, pairwiseAlignment, structureSeqToTranscriptSeqPosition, } = model;
    if (!genomeToTranscriptSeqMapping || !pairwiseAlignment) {
        return undefined;
    }
    const { p2gCodon } = genomeToTranscriptSeqMapping;
    const transcriptPos = structureSeqToTranscriptSeqPosition?.[structureSeqPos];
    return transcriptPos === undefined
        ? undefined
        : codonGenomeSpan(p2gCodon, transcriptPos);
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
/**
 * The genome region a structure-residue range covers, as the one-element list
 * a JBrowse highlight takes. Pure: the caller supplies the assembly and the
 * mapping, so the same conversion serves the hover band, the click band and a
 * test with neither a session nor a connected view.
 */
export function structureRangeToGenomeRegions({ range, assemblyName, model, }) {
    const mapping = model.genomeToTranscriptSeqMapping;
    if (!range || !assemblyName || !mapping) {
        return [];
    }
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
        // start/end are 0-based half-open (from getCodonRanges). navToLocString
        // parses a 1-based locString (parseLocString does start -= 1), so the start
        // must be shifted to 1-based; the half-open end already equals the 1-based
        // inclusive end. Passing the raw 0-based start landed the view 1bp 5'.
        await connectedView.navToLocString(`${refName}:${start + 1}-${end}${strand === -1 ? '[rev]' : ''}`, undefined, 0.2);
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
