import { SimpleFeature } from '@jbrowse/core/util';
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
