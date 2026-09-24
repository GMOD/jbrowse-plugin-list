import type { AnnotationFeature } from '@apollo-annotation/mst';
export type SegmentType = 'upOrDownstream' | 'UTR' | 'CDS' | 'intron' | 'protein' | 'exon' | 'plain';
export type SegmentListType = 'CDS' | 'cDNA' | 'genomic' | 'protein';
export interface SequenceSegment {
    type: SegmentType;
    sequence: string;
    locs: {
        min: number;
        max: number;
    }[];
}
export declare function getSequenceLength(segments: SequenceSegment[]): number;
export declare function getSequenceSegments(segmentType: SegmentListType, feature: AnnotationFeature, getSequence: (min: number, max: number) => string): SequenceSegment[];
export declare function getSegmentColor(type: SegmentType): string | undefined;
export declare function getLocationIntervals(seqSegments: SequenceSegment[]): {
    min: number;
    max: number;
}[];
//# sourceMappingURL=sequenceSegments.d.ts.map