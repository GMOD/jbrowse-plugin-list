import type { AnnotationFeature } from '@apollo-annotation/mst';
export declare function getFeatureName(feature: AnnotationFeature): string;
export declare function getFeatureId(feature: AnnotationFeature): string;
export declare function getFeatureNameOrId(feature: AnnotationFeature): string;
export declare function getStrand(strand: number | undefined): "" | "Forward" | "Reverse";
export declare function getRelatedFeatures(feature: AnnotationFeature, bp: number, includeSiblings?: boolean): AnnotationFeature[];
//# sourceMappingURL=annotationFeatureUtils.d.ts.map