import { type SequenceSegment } from './sequenceSegments';
export declare function SequenceViewer({ locationIntervals, refSeqName, sequenceSegments, strand, }: {
    refSeqName: string;
    strand: 1 | -1;
    locationIntervals: {
        min: number;
        max: number;
    }[];
    sequenceSegments: SequenceSegment[];
}): import("react/jsx-runtime").JSX.Element;
export default SequenceViewer;
//# sourceMappingURL=SequenceViewer.d.ts.map