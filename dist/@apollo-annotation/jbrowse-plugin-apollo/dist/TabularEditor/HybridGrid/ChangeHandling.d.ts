import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { ChangeManager } from '../../ChangeManager';
export declare function handleFeatureTypeChange(changeManager: ChangeManager, feature: AnnotationFeature, oldType: string, newType: string): Promise<void>;
export declare function handleFeatureStartChange(changeManager: ChangeManager, feature: AnnotationFeature, oldStart: number, newStart: number): Promise<void>;
export declare function handleFeatureEndChange(changeManager: ChangeManager, feature: AnnotationFeature, oldEnd: number, newEnd: number): Promise<void>;
//# sourceMappingURL=ChangeHandling.d.ts.map