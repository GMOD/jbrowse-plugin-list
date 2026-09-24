import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface AddChildFeatureProps {
    session: ApolloSessionModel;
    handleClose(): void;
    sourceFeature: AnnotationFeature;
    sourceAssemblyId: string;
    changeManager: ChangeManager;
}
export declare function AddChildFeature({ changeManager, handleClose, session, sourceAssemblyId, sourceFeature, }: AddChildFeatureProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AddChildFeature.d.ts.map