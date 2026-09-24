import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface MergeTranscriptsProps {
    session: ApolloSessionModel;
    handleClose(): void;
    sourceFeature: AnnotationFeature;
    sourceAssemblyId: string;
    changeManager: ChangeManager;
    selectedFeature?: AnnotationFeature;
    setSelectedFeature(feature?: AnnotationFeature): void;
}
export declare function MergeTranscripts({ changeManager, handleClose, selectedFeature, session, setSelectedFeature, sourceAssemblyId, sourceFeature, }: MergeTranscriptsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MergeTranscripts.d.ts.map