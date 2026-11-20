import { getContainingView, sum } from '@jbrowse/core/util';
export function getLinearGenomeView(model) {
    return getContainingView(model);
}
function isNonEmptyString(v) {
    return typeof v === 'string' && v !== '';
}
function uniqueDefined(vals) {
    return [...new Set(vals.filter(isNonEmptyString))];
}
function joinDefined(sep, parts) {
    return parts.filter(isNonEmptyString).join(sep);
}
export function getTranscriptFeatures(feature) {
    // check if we are looking at a 'two-level' or 'three-level' feature by
    // finding exon/CDS subfeatures. we want to select from transcript names
    const subfeatures = feature.get('subfeatures') ?? [];
    // Check for mRNA/transcript subfeatures (three-level: gene → mRNA → CDS)
    // Filter to only those that have CDS subfeatures (i.e. are coding)
    const transcripts = subfeatures.filter((f) => (f.get('type') === 'mRNA' || f.get('type') === 'transcript') &&
        f.get('subfeatures')?.some((s) => s.get('type') === 'CDS'));
    if (transcripts.length > 0) {
        return transcripts;
    }
    // Has direct CDS children, treat feature itself as the transcript
    // (two-level: gene → CDS or mRNA → CDS)
    return [feature];
}
export function getTranscriptLength(feature) {
    const cdsLen = sum(feature
        .get('subfeatures')
        ?.filter(f => f.get('type') === 'CDS')
        .map(s => s.get('end') - s.get('start')) ?? []);
    return {
        len: Math.floor(cdsLen / 3),
        mod: cdsLen % 3,
    };
}
export function getId(val) {
    return val?.id() ?? '';
}
// a proteome downloaded from NCBI or Ensembl names each protein by the CDS's
// protein_id rather than by its transcript
function getCdsProteinIds(transcript) {
    return (transcript.get('subfeatures') ?? [])
        .filter(f => f.get('type') === 'CDS')
        .map(f => f.get('protein_id'));
}
function getMatchableIds(val) {
    return val
        ? uniqueDefined([
            val.id(),
            val.get('name'),
            val.get('id'),
            val.get('transcript_id'),
            val.get('gene_name'),
            val.get('locus_tag'),
            ...getCdsProteinIds(val),
        ])
        : [];
}
export function featureMatchesId(feature, id) {
    return getMatchableIds(feature).includes(id);
}
const geneIdPrefix = /^gene[-:]/;
// A set keyed by gene, such as an OrthoFinder run over one protein per gene,
// names the gene by its GFF3 ID without NCBI's `gene-` or Ensembl's `gene:`
function getGeneMatchableIds(gene) {
    const id = gene.get('id');
    return uniqueDefined([
        id,
        id?.replace(geneIdPrefix, ''),
        gene.get('gene_id'),
        gene.get('locus_tag'),
    ]);
}
// OrthoFinder writes every gene name with each character that Newick or a TSV
// cannot hold replaced by `_` (its utils/gene_ids.py clean_name), so NCBI's
// gene `E(spl)m2-BFM` is `E_spl_m2-BFM` in its results. It also replaces control
// characters, which a GFF3 attribute cannot carry unescaped.
const orthoFinderUnsafe = /[\s:;(),[\]='"]/g;
function findIn(candidates, ids) {
    return (candidates.find(id => ids.has(id)) ??
        candidates
            .map(id => id.replace(orthoFinderUnsafe, '_'))
            .find(id => ids.has(id)));
}
/** the dataset entry for this transcript, else for the gene it belongs to */
export function findDatasetId(transcript, gene, ids) {
    return (findIn(getMatchableIds(transcript), ids) ??
        findIn(getGeneMatchableIds(gene), ids));
}
export function getTranscriptDisplayName(val) {
    return val ? joinDefined(' ', [val.get('name'), val.get('id')]) : '';
}
export function getGeneDisplayName(val) {
    return val
        ? joinDefined(' ', [
            val.get('gene_name') ?? val.get('name'),
            val.get('id') ? `(${val.get('id')})` : undefined,
        ])
        : '';
}
export function getBlastViewTitle(feature, transcript) {
    return `BLAST - ${getGeneDisplayName(feature)} - ${getTranscriptDisplayName(transcript)}`;
}
export function getSortedTranscriptFeatures(feature) {
    const transcripts = getTranscriptFeatures(feature);
    return transcripts.toSorted((a, b) => getTranscriptLength(b).len - getTranscriptLength(a).len);
}
/**
 * A translation as a query, still one residue per codon: g2p numbers codons,
 * and the query row is read through it. So the partial first codon (`&`), an
 * internal stop and an unreadable codon become X, and only what trails the
 * last whole codon is dropped.
 */
export function cleanProteinSequence(seq) {
    return seq.replace(/[*&]+$/, '').replaceAll(/[*&]/g, 'X');
}
export function getGeneIdentifiers(feature) {
    return uniqueDefined([
        feature.id(),
        feature.get('id'),
        feature.get('name'),
        feature.get('gene_id'),
        feature.get('gene_name'),
    ]);
}
