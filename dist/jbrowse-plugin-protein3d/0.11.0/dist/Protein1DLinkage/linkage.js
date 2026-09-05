import { SimpleFeature } from '@jbrowse/core/util';
import { codonGenomeSpan, genomeToTranscriptSeqMapping } from '../mappings';
export function getProteinLinkage(view) {
    return view?.proteinLinkage;
}
/** The 1D view showing this UniProt entry, if one is open. */
export function findProteinLinkedView(session, uniprotId) {
    return session.views.find(v => getProteinLinkage(v)?.uniprotId === uniprotId);
}
// The g2p map walks every CDS of the transcript and the hover bridges ask for
// it on every mouse move; the frozen linkage object is a stable key.
const mappings = new WeakMap();
export function linkageGenomeMapping(linkage) {
    let mapping = mappings.get(linkage);
    if (!mapping) {
        mapping = genomeToTranscriptSeqMapping(new SimpleFeature(linkage.feature));
        mappings.set(linkage, mapping);
    }
    return mapping;
}
export function genomeHighlightForProteinPosition(linkage, proteinPos) {
    const { p2gCodon, refName } = linkageGenomeMapping(linkage);
    const span = codonGenomeSpan(p2gCodon, proteinPos);
    return span ? { refName, start: span[0], end: span[1] } : undefined;
}
