import type { AnnotationFeatureSnapshot } from '@apollo-annotation/mst';
import type { ChangeManager } from '../ChangeManager';
interface DuplicateFeatureDialogProps {
    featureSnapshot: AnnotationFeatureSnapshot;
    existingFeature: AnnotationFeatureSnapshot;
    assemblyName: string;
    changeManager: ChangeManager;
    handleClose(): void;
}
export declare function DuplicateFeatureDialog({ assemblyName, changeManager, existingFeature, featureSnapshot, handleClose, }: DuplicateFeatureDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DuplicateFeatureDialog.d.ts.map