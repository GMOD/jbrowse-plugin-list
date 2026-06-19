import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface SplitExonProps {
    session: ApolloSessionModel;
    handleClose(): void;
    sourceFeature: AnnotationFeature;
    sourceAssemblyId: string;
    changeManager: ChangeManager;
    selectedFeature?: AnnotationFeature;
    setSelectedFeature(feature?: AnnotationFeature): void;
}
export declare function SplitExon({ changeManager, handleClose, selectedFeature, setSelectedFeature, sourceAssemblyId, sourceFeature, }: SplitExonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SplitExon.d.ts.map