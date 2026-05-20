import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface MergeExonsProps {
    session: ApolloSessionModel;
    handleClose(): void;
    sourceFeature: AnnotationFeature;
    sourceAssemblyId: string;
    changeManager: ChangeManager;
    selectedFeature?: AnnotationFeature;
    setSelectedFeature(feature?: AnnotationFeature): void;
}
export declare function MergeExons({ changeManager, handleClose, selectedFeature, setSelectedFeature, sourceAssemblyId, sourceFeature, }: MergeExonsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MergeExons.d.ts.map