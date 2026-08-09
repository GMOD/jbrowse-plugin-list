export declare const BASE_BLAST_URL = "https://blast.ncbi.nlm.nih.gov/Blast.cgi";
export declare const msaAlgorithms: readonly ["clustalo", "muscle", "kalign", "mafft"];
export type MsaAlgorithm = (typeof msaAlgorithms)[number];
export declare const blastDatabaseOptions: readonly ["nr", "nr_cluster_seq"];
export type BlastDatabase = (typeof blastDatabaseOptions)[number];
export declare const blastPrograms: readonly ["blastp", "quick-blastp"];
export type BlastProgram = (typeof blastPrograms)[number];
