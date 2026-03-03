interface StructureModel {
    obj?: {
        data: {
            sequence: {
                sequences: readonly {
                    sequence: {
                        label: {
                            toArray(): ArrayLike<string>;
                        };
                    };
                }[];
            };
        };
    };
}
/**
 * Extracts protein sequences from a Molstar structure model
 * @param model - The Molstar structure model containing sequence data
 * @returns Array of protein sequences as strings, or undefined if no sequences found
 */
export declare function extractStructureSequences(model: StructureModel): string[] | undefined;
export {};
