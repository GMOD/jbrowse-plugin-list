import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { MenuItem } from '@jbrowse/core/ui';
import type { ChangeManager } from '../../ChangeManager';
import type { ApolloSessionModel } from '../../session';
export declare function featureContextMenuItems(feature: AnnotationFeature | undefined, region: {
    assemblyName: string;
    refName: string;
    start: number;
    end: number;
}, getAssemblyId: (assemblyName: string) => string, selectedFeature: AnnotationFeature | undefined, setSelectedFeature: (f: AnnotationFeature | undefined) => void, session: ApolloSessionModel, changeManager: ChangeManager, filteredTranscripts: string[], updateFilteredTranscripts: (forms: string[]) => void): MenuItem[];
//# sourceMappingURL=featureContextMenuItems.d.ts.map