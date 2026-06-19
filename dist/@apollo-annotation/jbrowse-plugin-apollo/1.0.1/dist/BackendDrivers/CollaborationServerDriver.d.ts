import { type AssemblySpecificChange, Change } from '@apollo-annotation/common';
import type { AnnotationFeatureSnapshot, CheckResultSnapshot } from '@apollo-annotation/mst';
import { ValidationResultSet } from '@apollo-annotation/shared';
import type { BaseInternetAccountModel } from '@jbrowse/core/pluggableElementTypes';
import { type Region } from '@jbrowse/core/util';
import type { Socket } from 'socket.io-client';
import { type SubmitOpts } from '../ChangeManager';
import { BackendDriver, type GetChangesOpts, type GetChangesResult, type RefNameAliases } from './BackendDriver';
export interface ApolloRefSeqResponse {
    _id: string;
    name: string;
    description?: string;
    aliases: string[];
    length: string;
    assembly: string;
}
interface RefSeq {
    refName: string;
    id: string;
    aliases: string[];
}
type RefSeqMap = Map<string, RefSeq>;
export interface ApolloInternetAccount extends BaseInternetAccountModel {
    baseURL: string;
    socket: Socket;
    setLastChangeSequenceNumber(sequenceNumber: number): void;
    getMissingChanges(): void;
}
export declare class CollaborationServerDriver extends BackendDriver {
    private inFlight;
    private refSeqMaps;
    private fetch;
    searchFeatures(term: string, assemblies: string[]): Promise<AnnotationFeatureSnapshot[]>;
    /**
     * Call backend endpoint to get features by criteria
     * @param region -  Searchable region containing refSeq, start and end
     * @returns
     */
    getFeatures(region: Region): Promise<[AnnotationFeatureSnapshot[], CheckResultSnapshot[]]>;
    /**
     * Checks if there is assembly-refSeq specific socket. If not, it opens one
     * @param assembly - assemblyId
     * @param refSeq - refSeqName
     * @param internetAccount - internet account
     */
    checkSocket(assembly: string, refSeq: string, internetAccount: ApolloInternetAccount): void;
    private haveDataForChange;
    /**
     * Call backend endpoint to get sequence by criteria
     * @param region -  Searchable region containing refSeq, start and end
     * @returns
     */
    getSequence(region: Region): Promise<{
        seq: string;
        refSeq: string;
    }>;
    private getSeqFromServer;
    getRefSeqMapping(assemblyName: string): Promise<RefSeqMap>;
    getRefNameAliases(assemblyName: string): Promise<RefNameAliases[]>;
    getRefSeqId(assemblyName: string, refName: string): Promise<string | undefined>;
    getRegions(assemblyName: string): Promise<Region[]>;
    getAssemblies(internetAccountId?: string): ({
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
    getChanges(assemblyName: string, opts?: GetChangesOpts): Promise<GetChangesResult>;
    getCheckResults(assemblyName: string): Promise<CheckResultSnapshot[]>;
    submitChange(change: Change | AssemblySpecificChange, opts?: SubmitOpts): Promise<ValidationResultSet>;
}
export {};
//# sourceMappingURL=CollaborationServerDriver.d.ts.map