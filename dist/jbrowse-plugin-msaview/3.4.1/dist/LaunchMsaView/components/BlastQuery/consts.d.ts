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
export declare const searchPrograms: readonly ["blastp", "phmmer"];
export type SearchProgram = (typeof searchPrograms)[number];
/**
 * phmmer offers PDB, AlphaFold, Ensembl Genomes, MEROPS and ChEMBL too, but
 * targets outside UniProt carry no OS=/OX= in their description, so those rows
 * would lose their species and common name. Only the databases that label their
 * hits are offered.
 */
export declare const phmmerDatabaseOptions: readonly ["swissprot", "uniprotkb", "uniprotrefprot"];
export type PhmmerDatabase = (typeof phmmerDatabaseOptions)[number];
export declare const defaultPhmmerDatabase: PhmmerDatabase;
/**
 * A program together with a database that program actually has.
 *
 * The pair travels as one value because neither service knows the other's
 * database names — `swissprot` is a phmmer database and `uniprotkb_swissprot` a
 * blastp one — so a program held apart from its database can drift into a
 * combination EBI answers with a 400, minutes after the user pressed Submit.
 */
export type SearchChoice = {
    program: 'blastp';
    database: BlastDatabase;
} | {
    program: 'phmmer';
    database: PhmmerDatabase;
};
export declare function defaultSearchFor(program: SearchProgram): SearchChoice;
export declare function databaseOptionsFor(program: SearchProgram): readonly ["uniprotkb_swissprot", "uniprotkb", "pan_proteomes", "uniprotkb_trembl"] | readonly ["swissprot", "uniprotkb", "uniprotrefprot"];
