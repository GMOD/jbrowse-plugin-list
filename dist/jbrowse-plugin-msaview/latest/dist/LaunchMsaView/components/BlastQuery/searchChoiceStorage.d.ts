import type { MsaAlgorithm, SearchChoice } from './consts';
export declare const SEARCH_CHOICE_STORAGE_KEY = "msaView-blastSearch";
export declare const MSA_ALGORITHM_STORAGE_KEY = "msaView-msaAlgorithm";
export declare function validSearchChoice(stored: unknown): SearchChoice;
export declare function validMsaAlgorithm(stored: unknown): MsaAlgorithm;
export declare function useStoredSearchChoice(): readonly [SearchChoice, (choice: SearchChoice) => void];
export declare function useStoredMsaAlgorithm(): readonly ["clustalo" | "muscle" | "kalign" | "mafft", (algorithm: MsaAlgorithm) => void];
