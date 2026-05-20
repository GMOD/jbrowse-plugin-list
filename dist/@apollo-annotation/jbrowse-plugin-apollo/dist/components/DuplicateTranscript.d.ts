import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface DuplicateTranscriptProps {
    session: ApolloSessionModel;
    handleClose(): void;
    sourceFeature: AnnotationFeature;
    sourceAssemblyId: string;
    changeManager: ChangeManager;
    selectedFeature?: AnnotationFeature;
    setSelectedFeature(feature?: AnnotationFeature): void;
}
export declare function DuplicateTranscript({ changeManager, handleClose, session, sourceAssemblyId, sourceFeature, setSelectedFeature, }: DuplicateTranscriptProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DuplicateTranscript.d.ts.map