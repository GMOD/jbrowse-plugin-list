import type { AnnotationFeature, ApolloRefSeqI, TranscriptPartCoding } from '@apollo-annotation/mst';
import type { ApolloSessionModel } from '../session';
export declare function Translation({ changeInProgress, cdsLocations, refData, strand, updateCDSLocation, cdsMin, cdsMax, feature, session, }: {
    changeInProgress: boolean;
    cdsLocations: TranscriptPartCoding[][];
    refData: ApolloRefSeqI;
    strand: 1 | -1 | undefined;
    updateCDSLocation(oldLocation: number, newLocation: number, feature: AnnotationFeature, isMin: boolean, onComplete?: () => void): boolean;
    cdsMin: number;
    cdsMax: number;
    feature: AnnotationFeature;
    session: ApolloSessionModel;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Translation.d.ts.map