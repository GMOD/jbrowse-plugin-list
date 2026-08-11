/**
 * Only used to build the link-out on the manual panel, which sends the user to
 * NCBI's own site to run BLAST there. Nothing fetches this url: NCBI stopped
 * sending Access-Control-Allow-Origin to third-party origins, so a browser
 * cannot read a response from it at all. See docs/blast.md.
 */
export declare const BASE_BLAST_URL = "https://blast.ncbi.nlm.nih.gov/Blast.cgi";
export declare const msaAlgorithms: readonly ["clustalo", "muscle", "kalign", "mafft"];
export type MsaAlgorithm = (typeof msaAlgorithms)[number];
export declare const blastDatabaseOptions: readonly ["uniprotkb_swissprot", "uniprotkb", "uniprotkb_reference_proteomes", "uniprotkb_trembl"];
export type BlastDatabase = (typeof blastDatabaseOptions)[number];
export declare const defaultBlastDatabase: BlastDatabase;
