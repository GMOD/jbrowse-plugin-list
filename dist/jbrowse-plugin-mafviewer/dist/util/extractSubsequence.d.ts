/**
 * Helper function to extract a subsequence from an alignment string
 * accounting for gaps in the reference sequence
 * @param sequence - The alignment sequence
 * @param relativeStart - The start position in the reference sequence (without gaps)
 * @param relativeEnd - The end position in the reference sequence (without gaps)
 * @returns The extracted sequence and the actual start position in the alignment
 */
export declare function extractSubsequence(sequence: string, relativeStart: number, relativeEnd: number): {
    extractedSequence: string;
    actualStart: number;
};
