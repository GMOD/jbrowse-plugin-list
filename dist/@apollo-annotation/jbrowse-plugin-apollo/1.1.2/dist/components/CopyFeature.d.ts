import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface CopyFeatureProps {
    session: ApolloSessionModel;
    handleClose(): void;
    sourceFeature: AnnotationFeature;
    sourceAssemblyId: string;
    changeManager: ChangeManager;
}
export declare function CopyFeature({ changeManager, handleClose, session, sourceAssemblyId, sourceFeature, }: CopyFeatureProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CopyFeature.d.ts.map