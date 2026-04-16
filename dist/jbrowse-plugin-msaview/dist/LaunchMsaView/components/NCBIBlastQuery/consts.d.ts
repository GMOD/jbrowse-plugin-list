export declare const BASE_BLAST_URL = "https://blast.ncbi.nlm.nih.gov/Blast.cgi";
export declare const msaAlgorithms: readonly ["clustalo", "muscle", "kalign", "mafft"];
export type MsaAlgorithm = (typeof msaAlgorithms)[number];
