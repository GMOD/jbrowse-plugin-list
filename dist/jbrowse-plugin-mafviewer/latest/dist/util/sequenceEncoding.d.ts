export interface EncodedSequence {
    data: Uint8Array;
    length: number;
}
export declare function encodeSequence(seq: string): EncodedSequence;
export declare function decodeBase(encoded: EncodedSequence, index: number): string;
export declare function decodeBaseLower(encoded: EncodedSequence, index: number): string;
export declare function getBaseCode(encoded: EncodedSequence, index: number): number;
export declare function isGap(encoded: EncodedSequence, index: number): boolean;
export declare function isSpace(encoded: EncodedSequence, index: number): boolean;
export declare function getLowerCode(code: number): number;
export declare function basesEqualIgnoreCase(code1: number, code2: number): boolean;
export declare function decodeSequence(encoded: EncodedSequence): string;
export declare function decodeSequenceLower(encoded: EncodedSequence): string;
export declare const CODE_GAP = 5;
export declare const CODE_SPACE = 6;
export declare const CODE_A_LOWER = 0;
export declare const CODE_C_LOWER = 1;
export declare const CODE_G_LOWER = 2;
export declare const CODE_T_LOWER = 3;
export declare const CODE_N_LOWER = 4;
