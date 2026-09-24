import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface AddCodingSequenceProps {
    session: ApolloSessionModel;
    handleClose(): void;
    sourceFeature: AnnotationFeature;
    sourceAssemblyId: string;
    changeManager: ChangeManager;
    refName: string;
}
export declare function AddCodingSequence({ changeManager, handleClose, refName, session, sourceAssemblyId, sourceFeature, }: AddCodingSequenceProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AddCodingSequence.d.ts.map