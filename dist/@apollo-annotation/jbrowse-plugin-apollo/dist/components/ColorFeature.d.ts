import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { ChangeManager } from '../ChangeManager';
import type { ApolloSessionModel } from '../session';
interface ColorFeatureProps {
    session: ApolloSessionModel;
    handleClose(): void;
    sourceFeature: AnnotationFeature;
    sourceAssemblyId: string;
    changeManager: ChangeManager;
}
export declare function ColorFeature({ changeManager, handleClose, sourceAssemblyId, sourceFeature, }: ColorFeatureProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ColorFeature.d.ts.map