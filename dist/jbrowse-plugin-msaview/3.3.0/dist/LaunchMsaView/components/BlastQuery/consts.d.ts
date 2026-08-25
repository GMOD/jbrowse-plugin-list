/**
 * Only used to build the link-out on the manual panel, which sends the user to
 * NCBI's own site to run BLAST there. Nothing fetches this url: NCBI stopped
 * sending Access-Control-Allow-Origin to third-party origins, so a browser
 * cannot read a response from it at all. See docs/blast.md.
 */
export declare const BASE_BLAST_URL = "https://blast.ncbi.nlm.nih.gov/Blast.cgi";
export declare const msaAlgorithms: readonly ["clustalo", "muscle", "kalign", "mafft"];
export type MsaAlgorithm = (typeof msaAlgorithms)[number];
/**
 * EBI rejects a submission naming a database outside its own list with a 400,
 * so every value here has to appear in
 * https://www.ebi.ac.uk/Tools/services/rest/ncbiblast/parameterdetails/database
 * -- `uniprotkb_reference_proteomes` did not, and 3.0.0 shipped it as a dead
 * menu entry.
 */
export declare const blastDatabaseOptions: readonly ["uniprotkb_swissprot", "uniprotkb", "pan_proteomes", "uniprotkb_trembl"];
export type BlastDatabase = (typeof blastDatabaseOptions)[number];
export declare const defaultBlastDatabase: BlastDatabase;
