import { SimpleFeature } from '@jbrowse/core/util';
import { assemblyNaming, genomeHoverToTranscriptPos } from '../ProteinView/util';
import { codingSpans, genomeToTranscriptSeqMapping } from '../mappings';
export function getProteinLinkage(view) {
    return view?.proteinLinkage;
}
export function getProteinLinkageMapping(view) {
    return view?.proteinLinkageMapping;
}
/** The 1D view showing this UniProt entry, if one is open. */
export function findProteinLinkedView(session, uniprotId) {
    return session.views.find(v => getProteinLinkage(v)?.uniprotId === uniprotId);
}
/** The assembly of the genome view a 1D view was launched from. */
export function linkedGenomeAssemblyName(session, linkage) {
    if (linkage.assemblyName) {
        return linkage.assemblyName;
    }
    const view = session.views.find(v => v.id === linkage.connectedViewId);
    const names = view && 'assemblyNames' in view ? view.assemblyNames : undefined;
    const first = Array.isArray(names) ? names[0] : undefined;
    return typeof first === 'string' ? first : undefined;
}
/** The residue a genome hover names on a 1D view, read through the assembly
 * of the genome view it was launched from. */
export function hovered1DProteinPosition(session, view) {
    const linkage = getProteinLinkage(view);
    const assemblyName = linkage
        ? linkedGenomeAssemblyName(session, linkage)
        : undefined;
    return assemblyName
        ? genomeHoverToTranscriptPos(session.hovered, getProteinLinkageMapping(view), assemblyNaming(session.assemblyManager, assemblyName))
        : undefined;
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
