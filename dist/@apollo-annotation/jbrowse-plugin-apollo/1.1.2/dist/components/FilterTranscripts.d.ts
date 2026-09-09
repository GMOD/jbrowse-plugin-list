import type { AnnotationFeature } from '@apollo-annotation/mst';
interface FilterTranscriptsProps {
    onUpdate: (forms: string[]) => void;
    sourceFeature: AnnotationFeature;
    filteredTranscripts: string[];
    handleClose: () => void;
}
export declare const FilterTranscripts: ({ sourceFeature, filteredTranscripts, handleClose, onUpdate, }: FilterTranscriptsProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FilterTranscripts.d.ts.map