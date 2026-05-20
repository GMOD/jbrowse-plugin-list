import { type AssemblySpecificChange, type Change } from '@apollo-annotation/common';
import type { AnnotationFeatureSnapshot, CheckResultSnapshot } from '@apollo-annotation/mst';
import { ValidationResultSet } from '@apollo-annotation/shared';
import { type Region } from '@jbrowse/core/util';
import { BackendDriver, type RefNameAliases } from './BackendDriver';
export declare class DesktopFileDriver extends BackendDriver {
    loadAssembly(assemblyName: string): Promise<import("@apollo-annotation/mst").ApolloAssemblyI>;
    getAssembly(assemblyName: string): Promise<import("@apollo-annotation/mst").ApolloAssemblyI>;
    getRefNameAliases(assemblyName: string): Promise<RefNameAliases[]>;
    getFeatures(region: Region): Promise<[AnnotationFeatureSnapshot[], CheckResultSnapshot[]]>;
    getSequence(region: Region): Promise<{
        seq: string;
        refSeq: string;
    }>;
    getRegions(assemblyName: string): Promise<Region[]>;
    getAssemblies(): ({
        configuration: any;
    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
        error: unknown;
        loadingP: Promise<void> | undefined;
        volatileRegions: import("@jbrowse/core/assemblyManager/assembly").BasicRegion[] | undefined;
        refNameAliases: {
            [x: string]: string;
        } | undefined;
        canonicalToSeqAdapterRefNames: Record<string, string> | undefined;
        cytobands: import("@jbrowse/core/util").Feature[] | undefined;
    } & {
        getConf(arg: string): any;
        readonly lowerCaseRefNameAliases: {
            [k: string]: string;
        } | undefined;
    } & {
        readonly initialized: boolean;
        readonly name: string;
        readonly regions: import("@jbrowse/core/assemblyManager/assembly").BasicRegion[] | undefined;
        readonly aliases: string[];
        readonly displayName: string;
        hasName(name: string): boolean;
        readonly allAliases: string[];
        readonly allRefNames: string[] | undefined;
        readonly lowerCaseRefNames: string[] | undefined;
        readonly allRefNamesWithLowerCase: string[] | undefined;
        readonly rpcManager: import("@jbrowse/core/rpc/RpcManager").default;
        readonly refNameColors: string[];
    } & {
        readonly refNames: string[] | undefined;
    } & {
        getCanonicalRefName(refName: string): string | undefined;
        getCanonicalRefName2(refName: string): string;
        getRefNameColor(refName: string): string | undefined;
        isValidRefName(refName: string): boolean;
        getSeqAdapterRefName(canonicalRefName: string): string;
    } & {
        setLoaded({ regions, refNameAliases, cytobands, }: {
            regions: import("@jbrowse/core/util").Region[];
            refNameAliases: {
                [x: string]: string;
            };
            cytobands: import("@jbrowse/core/util").Feature[];
        }): void;
        setError(e: unknown): void;
        setRegions(regions: import("@jbrowse/core/util").Region[]): void;
        setRefNameAliases(aliases: {
            [x: string]: string;
        }): void;
        setCytobands(cytobands: import("@jbrowse/core/util").Feature[]): void;
        setCanonicalToSeqAdapterRefNames(map: Record<string, string>): void;
        setLoadingP(p?: Promise<void>): void;
        load(): Promise<void>;
        loadPre(): Promise<void>;
    } & {
        getAdapterMapEntry(adapterConf: {
            [x: string]: unknown;
        }, options: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<import("@jbrowse/core/assemblyManager/assembly").RefNameMap>;
        getRefNameMapForAdapter(adapterConf: {
            [x: string]: unknown;
        }, opts: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<{
            [x: string]: string;
        }>;
        getReverseRefNameMapForAdapter(adapterConf: {
            [x: string]: unknown;
        }, opts: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<{
            [x: string]: string;
        }>;
        afterCreate(): void;
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
        configuration: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IReferenceType<import("@jbrowse/mobx-state-tree").IAnyType>>;
    }, {
        error: unknown;
        loadingP: Promise<void> | undefined;
        volatileRegions: import("@jbrowse/core/assemblyManager/assembly").BasicRegion[] | undefined;
        refNameAliases: {
            [x: string]: string;
        } | undefined;
        canonicalToSeqAdapterRefNames: Record<string, string> | undefined;
        cytobands: import("@jbrowse/core/util").Feature[] | undefined;
    } & {
        getConf(arg: string): any;
        readonly lowerCaseRefNameAliases: {
            [k: string]: string;
        } | undefined;
    } & {
        readonly initialized: boolean;
        readonly name: string;
        readonly regions: import("@jbrowse/core/assemblyManager/assembly").BasicRegion[] | undefined;
        readonly aliases: string[];
        readonly displayName: string;
        hasName(name: string): boolean;
        readonly allAliases: string[];
        readonly allRefNames: string[] | undefined;
        readonly lowerCaseRefNames: string[] | undefined;
        readonly allRefNamesWithLowerCase: string[] | undefined;
        readonly rpcManager: import("@jbrowse/core/rpc/RpcManager").default;
        readonly refNameColors: string[];
    } & {
        readonly refNames: string[] | undefined;
    } & {
        getCanonicalRefName(refName: string): string | undefined;
        getCanonicalRefName2(refName: string): string;
        getRefNameColor(refName: string): string | undefined;
        isValidRefName(refName: string): boolean;
        getSeqAdapterRefName(canonicalRefName: string): string;
    } & {
        setLoaded({ regions, refNameAliases, cytobands, }: {
            regions: import("@jbrowse/core/util").Region[];
            refNameAliases: {
                [x: string]: string;
            };
            cytobands: import("@jbrowse/core/util").Feature[];
        }): void;
        setError(e: unknown): void;
        setRegions(regions: import("@jbrowse/core/util").Region[]): void;
        setRefNameAliases(aliases: {
            [x: string]: string;
        }): void;
        setCytobands(cytobands: import("@jbrowse/core/util").Feature[]): void;
        setCanonicalToSeqAdapterRefNames(map: Record<string, string>): void;
        setLoadingP(p?: Promise<void>): void;
        load(): Promise<void>;
        loadPre(): Promise<void>;
    } & {
        getAdapterMapEntry(adapterConf: {
            [x: string]: unknown;
        }, options: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<import("@jbrowse/core/assemblyManager/assembly").RefNameMap>;
        getRefNameMapForAdapter(adapterConf: {
            [x: string]: unknown;
        }, opts: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<{
            [x: string]: string;
        }>;
        getReverseRefNameMapForAdapter(adapterConf: {
            [x: string]: unknown;
        }, opts: import("@jbrowse/core/data_adapters/BaseAdapter").BaseOptions): Promise<{
            [x: string]: string;
        }>;
        afterCreate(): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>)[];
    submitChange(change: Change | AssemblySpecificChange): Promise<ValidationResultSet>;
    searchFeatures(_term: string, _assemblies: string[]): Promise<AnnotationFeatureSnapshot[]>;
}
//# sourceMappingURL=DesktopFileDriver.d.ts.map