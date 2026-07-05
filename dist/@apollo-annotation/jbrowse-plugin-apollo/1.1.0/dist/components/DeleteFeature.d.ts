import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface DeleteFeatureProps {
    session: ApolloSessionModel;
    handleClose(): void;
    sourceFeature: AnnotationFeature;
    sourceAssemblyId: string;
    changeManager: ChangeManager;
    selectedFeature?: AnnotationFeature;
    setSelectedFeature(feature?: AnnotationFeature): void;
}
export declare function DeleteFeature({ changeManager, handleClose, selectedFeature, session, setSelectedFeature, sourceAssemblyId, sourceFeature, }: DeleteFeatureProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DeleteFeature.d.ts.map