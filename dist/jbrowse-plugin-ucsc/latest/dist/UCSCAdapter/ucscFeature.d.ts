export type UcscRecord = Record<string, unknown>;
interface Span {
    start: number;
    end: number;
}
export declare function transcriptParts(blocks: Span[], thickStart: number, thickEnd: number, strand: number, exonFrames: number[]): ({
    type: string;
    start: number;
    end: number;
} | {
    phase: number | undefined;
    start: number;
    end: number;
    type: string;
})[];
export declare function ucscFeatureData(record: UcscRecord, trackType: string, fallbackRefName: string): {
    type: string;
    subfeatures: ({
        type: string;
        start: number;
        end: number;
    } | {
        phase: number | undefined;
        start: number;
        end: number;
        type: string;
    })[];
    refName: string;
    start: number;
    end: number;
    strand: number;
    score?: number | undefined;
    itemRgb?: string | undefined;
    name: string | undefined;
    description: string | undefined;
} | {
    subfeatures: Span[];
    refName: string;
    start: number;
    end: number;
    strand: number;
    score?: number | undefined;
    itemRgb?: string | undefined;
    name: string | undefined;
    description: string | undefined;
} | {
    refName: string;
    start: number;
    end: number;
    strand: number;
    score?: number | undefined;
    itemRgb?: string | undefined;
    name: string | undefined;
    description: string | undefined;
} | {
    type: string;
    subfeatures: ({
        type: string;
        start: number;
        end: number;
    } | {
        phase: number | undefined;
        start: number;
        end: number;
        type: string;
    })[];
    refName: string;
    start: number;
    end: number;
    strand: number;
    score?: number | undefined;
    itemRgb?: string | undefined;
    name: string | undefined;
    description?: undefined;
} | {
    subfeatures: Span[];
    refName: string;
    start: number;
    end: number;
    strand: number;
    score?: number | undefined;
    itemRgb?: string | undefined;
    name: string | undefined;
    description?: undefined;
} | {
    refName: string;
    start: number;
    end: number;
    strand: number;
    score?: number | undefined;
    itemRgb?: string | undefined;
    name: string | undefined;
    description?: undefined;
};
export {};
