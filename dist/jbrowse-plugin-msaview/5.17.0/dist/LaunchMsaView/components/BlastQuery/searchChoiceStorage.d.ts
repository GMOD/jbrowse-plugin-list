import type { MsaAlgorithm, SearchChoice } from './consts';
export declare function validSearchChoice(stored: unknown): SearchChoice;
export declare function validMsaAlgorithm(stored: unknown): MsaAlgorithm;
export declare function useStoredSearchChoice(): readonly [SearchChoice, (choice: SearchChoice) => void];
export declare function useStoredMsaAlgorithm(): readonly ["clustalo" | "muscle" | "kalign" | "mafft" | "browser", (algorithm: MsaAlgorithm) => void];
