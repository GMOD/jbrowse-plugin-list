import { type Change } from '@apollo-annotation/common';
import type { AnnotationFeatureSnapshot, CheckResultSnapshot } from '@apollo-annotation/mst';
import { ValidationResultSet } from '@apollo-annotation/shared';
import type { Assembly } from '@jbrowse/core/assemblyManager/assembly';
import { type Region } from '@jbrowse/core/util';
import type { SubmitOpts } from '../../ChangeManager';
import { BackendDriver, type GetChangesOpts, type GetChangesResult, type RefNameAliases } from '../BackendDriver';
export declare class LocalDriver extends BackendDriver {
    getFeatures(region: Region): Promise<[AnnotationFeatureSnapshot[], CheckResultSnapshot[]]>;
    getSequence(region: Region): Promise<{
        seq: string;
        refSeq: string;
    }>;
    getRegions(assemblyName: string): Promise<Region[]>;
    getAssemblies(internetAccountConfigId?: string): Assembly[];
    getRefNameAliases(assemblyName: string): Promise<RefNameAliases[]>;
    submitChange(change: Change, opts: SubmitOpts): Promise<ValidationResultSet>;
    searchFeatures(term: string, assemblies: string[]): Promise<AnnotationFeatureSnapshot[]>;
    getCheckResults(assemblyName: string): Promise<CheckResultSnapshot[]>;
    getChanges(assemblyName: string, opts?: GetChangesOpts): Promise<GetChangesResult>;
}
//# sourceMappingURL=LocalDriver.d.ts.map