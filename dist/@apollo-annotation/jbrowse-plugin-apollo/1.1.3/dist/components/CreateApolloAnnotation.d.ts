import type { AnnotationFeatureSnapshot } from '@apollo-annotation/mst';
import type { Assembly } from '@jbrowse/core/assemblyManager/assembly';
import type { AbstractSessionModel } from '@jbrowse/core/util';
interface CreateApolloAnnotationProps {
    session: AbstractSessionModel;
    handleClose(): void;
    annotationFeature: AnnotationFeatureSnapshot;
    assembly: Assembly;
    refSeqId: string;
    region: {
        start: number;
        end: number;
    };
}
export declare function getFeatureName(feature: AnnotationFeatureSnapshot): string;
export declare function getGeneNameOrId(feature: AnnotationFeatureSnapshot): string;
export declare function getFeatureId(feature: AnnotationFeatureSnapshot): string;
export declare function CreateApolloAnnotation({ annotationFeature, assembly, handleClose, refSeqId, session, region, }: CreateApolloAnnotationProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CreateApolloAnnotation.d.ts.map