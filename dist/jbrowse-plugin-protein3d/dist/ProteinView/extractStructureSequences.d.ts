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
export declare function extractStructureSequences(model: StructureModel): string[] | undefined;
export {};
