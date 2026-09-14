/**
 * Only used to build the link-out on the manual panel, which sends the user to
 * NCBI's own site to run BLAST there. Nothing fetches this url: NCBI stopped
 * sending Access-Control-Allow-Origin to third-party origins, so a browser
 * cannot read a response from it at all. See docs/blast.md.
 */
export const BASE_BLAST_URL = 'https://blast.ncbi.nlm.nih.gov/Blast.cgi';
/** The aligners EBI's Job Dispatcher runs, each a tool name at their REST api. */
export const ebiMsaAlgorithms = [
    'clustalo',
    'muscle',
    'kalign',
    'mafft',
];
/**
 * `browser` is no job at all: each sequence is aligned to the query in the
 * page and the rows merged on the query (utils/browserAlign.ts), with the tree
 * built by react-msaview's neighbour joining. It is the aligner for a launch
 * that must not depend on EBI, and for one that wants to be quick -- a
 * hundred rows take a second or two against a Job Dispatcher queue that has
 * been measured at anything from ten seconds to fifteen minutes.
 */
export const msaAlgorithms = [...ebiMsaAlgorithms, 'browser'];
export const msaAlgorithmLabels = {
    clustalo: 'clustalo (EBI)',
    muscle: 'muscle (EBI)',
    kalign: 'kalign (EBI)',
    mafft: 'mafft (EBI)',
    browser: 'in browser, query-anchored',
};
/**
 * EBI rejects a submission naming a database outside its own list with a 400,
 * so every value here has to appear in
 * https://www.ebi.ac.uk/Tools/services/rest/ncbiblast/parameterdetails/database
 * -- `uniprotkb_reference_proteomes` did not, and 3.0.0 shipped it as a dead
 * menu entry.
 */
export const blastDatabaseOptions = [
    'uniprotkb_swissprot',
    'uniprotkb',
    'pan_proteomes',
    'uniprotkb_trembl',
];
// curated, so it returns roughly one good sequence per species rather than the
// many near-identical TrEMBL entries an alignment reads poorly
export const defaultBlastDatabase = 'uniprotkb_swissprot';
export const searchPrograms = ['blastp', 'phmmer'];
/**
 * phmmer offers PDB, AlphaFold, Ensembl Genomes, MEROPS and ChEMBL too, but
 * targets outside UniProt carry no species in their description, so those rows
 * would lose their species and common name. Only the databases that label their
 * hits are offered.
 *
 * rp15..rp75 are the Representative Proteomes: UniProt's reference proteomes
 * thinned so that no two are more than 15% (35%, 55%, 75%) similar, which is
 * the widest taxonomic spread per hit that any of these databases gives. rp15
 * is the one to reach for when the question is "what is this like across all
 * of life"; swissprot when it is "what is this like in the curated set".
 */
export const phmmerDatabaseOptions = [
    'swissprot',
    'uniprotkb',
    'uniprotrefprot',
    'rp75',
    'rp55',
    'rp35',
    'rp15',
];
export const defaultPhmmerDatabase = 'swissprot';
/**
 * The hit counts EBI's ncbiblast accepts for `alignments` and `scores`. A value
 * off this list is a 400 at submit time, so a request is rounded up to the next
 * one on it.
 */
const blastHitCounts = [5, 10, 20, 50, 100, 150, 200, 250, 500, 750, 1000];
export const defaultMaxHits = 100;
export function snapBlastHitCount(maxHits) {
    return blastHitCounts.find(n => n >= maxHits) ?? blastHitCounts.at(-1);
}
export function defaultSearchFor(program) {
    return program === 'phmmer'
        ? { program, database: defaultPhmmerDatabase }
        : { program, database: defaultBlastDatabase };
}
export function databaseOptionsFor(program) {
    return program === 'phmmer' ? phmmerDatabaseOptions : blastDatabaseOptions;
}
