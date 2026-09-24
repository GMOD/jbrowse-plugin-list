import { type AnnotationFeature } from '@apollo-annotation/mst';
import { type UserLocation } from '@apollo-annotation/shared';
import type PluginManager from '@jbrowse/core/PluginManager';
import type assemblyManager from '@jbrowse/core/assemblyManager';
import type { BaseTrackConfig } from '@jbrowse/core/pluggableElementTypes';
import { type AbstractSessionModel } from '@jbrowse/core/util';
import { type Instance, types } from '@jbrowse/mobx-state-tree';
import type { ApolloInternetAccountModel } from '../ApolloInternetAccount/model';
import type ApolloPluginConfigurationSchema from '../config';
import { type ClientDataStoreModel } from './ClientDataStore';
export interface ApolloSession extends AbstractSessionModel {
    apolloDataStore: ClientDataStoreModel;
    apolloSelectedFeature?: AnnotationFeature;
    apolloSetSelectedFeature(feature?: AnnotationFeature): void;
}
export interface Collaborator {
    name: string;
    id: string;
    locations: UserLocation[];
}
export interface HoveredFeature {
    feature: AnnotationFeature;
    bp: number;
}
type Assembly = Instance<ReturnType<typeof assemblyManager>>['assemblies'][0];
export declare function extendSession(pluginManager: PluginManager, sessionModel: ReturnType<typeof types.model>): import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").IModelType<{
    [x: string]: never;
} & {
    apolloDataStore: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{
        typeName: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<"Client">, [undefined]>;
        assemblies: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
            _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            refSeqs: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            comments: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
            backendDriverType: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
        }, {
            getByRefName(refName: string): ({
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
        } & {
            addRefSeq(id: string, name: string, description?: string): {
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            addComment(comment: string): number;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
        checkResults: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
            _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            cause: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            ids: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IReferenceType<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
            }, {
                readonly length: number;
                readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                readonly minWithChildren: number;
                readonly maxWithChildren: number;
                hasDescendant(featureId: string): boolean;
                readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
            } & {
                readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
            } & {
                setAttributes(attributes: Map<string, string[]>): void;
                setAttribute(key: string, value: string[]): void;
                setType(type: string): void;
                setRefSeq(refSeq: string): void;
                setMin(min: number): void;
                setMax(max: number): void;
                setStrand(strand?: 1 | -1): void;
                addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteChild(childFeatureId: string): void;
            } & {
                update({ children, max, min, refSeq, strand, }: {
                    refSeq: string;
                    min: number;
                    max: number;
                    strand?: 1 | -1;
                    children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                }): void;
            } & {
                readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                readonly assemblyId: string;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>>;
            refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
            end: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
            ignored: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            message: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
        ontologyManager: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{
            ontologies: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
                options: import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>;
                equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
            }, {
                dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                startedEquivalentTypeRequests: Set<string>;
            } & {
                ping(): void;
                initDataStore(): void;
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                loadEquivalentTypes: (type: string) => Promise<void>;
            } & {
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                isTypeOf(queryType: string, typeOf: string): boolean;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            prefixes: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>, [undefined]>;
        }, {
            readonly featureTypeOntologyName: string;
        } & {
            readonly featureTypeOntology: ({
                name: string;
                version: string;
                source: ({
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                    locationType: "LocalPathLocation";
                    localPath: string;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>);
                options: import("../OntologyManager/OntologyStore").OntologyStoreOptions & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>>;
                equivalentTypes: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                startedEquivalentTypeRequests: Set<string>;
            } & {
                ping(): void;
                initDataStore(): void;
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                loadEquivalentTypes: (type: string) => Promise<void>;
            } & {
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                isTypeOf(queryType: string, typeOf: string): boolean;
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
                options: import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>;
                equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
            }, {
                dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                startedEquivalentTypeRequests: Set<string>;
            } & {
                ping(): void;
                initDataStore(): void;
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                loadEquivalentTypes: (type: string) => Promise<void>;
            } & {
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                isTypeOf(queryType: string, typeOf: string): boolean;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
            findOntology(name: string, version?: string): ({
                name: string;
                version: string;
                source: ({
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                    locationType: "LocalPathLocation";
                    localPath: string;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>);
                options: import("../OntologyManager/OntologyStore").OntologyStoreOptions & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>>;
                equivalentTypes: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                startedEquivalentTypeRequests: Set<string>;
            } & {
                ping(): void;
                initDataStore(): void;
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                loadEquivalentTypes: (type: string) => Promise<void>;
            } & {
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                isTypeOf(queryType: string, typeOf: string): boolean;
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
                options: import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>;
                equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
            }, {
                dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                startedEquivalentTypeRequests: Set<string>;
            } & {
                ping(): void;
                initDataStore(): void;
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                loadEquivalentTypes: (type: string) => Promise<void>;
            } & {
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                isTypeOf(queryType: string, typeOf: string): boolean;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
            openOntology(name: string, version?: string): import("../OntologyManager/OntologyStore").default | undefined;
            applyPrefixes(uri: string): string;
            expandPrefixes(uri: string): string;
        } & {
            addOntology(name: string, version: string, source: Instance<typeof import("@jbrowse/core/util/types/mst").LocalPathLocation> | Instance<typeof import("@jbrowse/core/util/types/mst").UriLocation>, options?: import("../OntologyManager/OntologyStore").OntologyStoreOptions): void;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>, [undefined]>;
    }, {
        readonly internetAccounts: (({
            id: string;
            type: string;
            configuration: {
                [x: string]: any;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                    [x: string]: any;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                        [x: string]: any;
                    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
                name: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                description: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                authHeader: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                tokenType: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                domains: {
                    description: string;
                    type: string;
                    defaultValue: never[];
                };
            }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "internetAccountId">>>;
        } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
            readonly name: string;
            readonly description: string;
            readonly internetAccountId: string;
            readonly authHeader: string;
            readonly tokenType: string;
            readonly domains: string[];
            readonly toggleContents: import("react").ReactNode;
            readonly SelectorComponent: import("@jbrowse/core/util").AnyReactComponentType | undefined;
            readonly selectorLabel: string | undefined;
        } & {
            handlesLocation(location: import("@jbrowse/core/util").UriLocation): boolean;
            readonly tokenKey: string;
        } & {
            getTokenFromUser(_resolve: (token: string) => void, _reject: (error: Error) => void): void;
            storeToken(token: string): void;
            removeToken(): void;
            retrieveToken(): string | null;
            validateToken(token: string, _loc: import("@jbrowse/core/util").UriLocation): Promise<string>;
        } & {
            getToken(location?: import("@jbrowse/core/util").UriLocation): Promise<string>;
        } & {
            addAuthHeaderToInit(init?: RequestInit, token?: string): {
                headers: Headers;
                body?: BodyInit | null;
                cache?: RequestCache;
                credentials?: RequestCredentials;
                integrity?: string;
                keepalive?: boolean;
                method?: string;
                mode?: RequestMode;
                priority?: RequestPriority;
                redirect?: RequestRedirect;
                referrer?: string;
                referrerPolicy?: ReferrerPolicy;
                signal?: AbortSignal | null;
                window?: null;
            };
            getPreAuthorizationInformation(location: import("@jbrowse/core/util").UriLocation): Promise<{
                internetAccountType: string;
                authInfo: {
                    token: string;
                    configuration: any;
                };
            }>;
        } & {
            getFetcher(loc?: import("@jbrowse/core/util").UriLocation): (input: RequestInfo, init?: RequestInit) => Promise<Response>;
        } & {
            openLocation(location: import("@jbrowse/core/util").UriLocation): import("@jbrowse/core/util/io").RemoteFileWithRangeCache;
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            configuration: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
                name: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                description: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                authHeader: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                tokenType: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                domains: {
                    description: string;
                    type: string;
                    defaultValue: never[];
                };
            }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "internetAccountId">>;
        }, {
            readonly name: string;
            readonly description: string;
            readonly internetAccountId: string;
            readonly authHeader: string;
            readonly tokenType: string;
            readonly domains: string[];
            readonly toggleContents: import("react").ReactNode;
            readonly SelectorComponent: import("@jbrowse/core/util").AnyReactComponentType | undefined;
            readonly selectorLabel: string | undefined;
        } & {
            handlesLocation(location: import("@jbrowse/core/util").UriLocation): boolean;
            readonly tokenKey: string;
        } & {
            getTokenFromUser(_resolve: (token: string) => void, _reject: (error: Error) => void): void;
            storeToken(token: string): void;
            removeToken(): void;
            retrieveToken(): string | null;
            validateToken(token: string, _loc: import("@jbrowse/core/util").UriLocation): Promise<string>;
        } & {
            getToken(location?: import("@jbrowse/core/util").UriLocation): Promise<string>;
        } & {
            addAuthHeaderToInit(init?: RequestInit, token?: string): {
                headers: Headers;
                body?: BodyInit | null;
                cache?: RequestCache;
                credentials?: RequestCredentials;
                integrity?: string;
                keepalive?: boolean;
                method?: string;
                mode?: RequestMode;
                priority?: RequestPriority;
                redirect?: RequestRedirect;
                referrer?: string;
                referrerPolicy?: ReferrerPolicy;
                signal?: AbortSignal | null;
                window?: null;
            };
            getPreAuthorizationInformation(location: import("@jbrowse/core/util").UriLocation): Promise<{
                internetAccountType: string;
                authInfo: {
                    token: string;
                    configuration: any;
                };
            }>;
        } & {
            getFetcher(loc?: import("@jbrowse/core/util").UriLocation): (input: RequestInfo, init?: RequestInit) => Promise<Response>;
        } & {
            openLocation(location: import("@jbrowse/core/util").UriLocation): import("@jbrowse/core/util/io").RemoteFileWithRangeCache;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | ApolloInternetAccountModel)[];
        readonly pluginConfiguration: Instance<typeof ApolloPluginConfigurationSchema>;
        getFeature(featureId: string): ({
            _id: string;
            refSeq: string;
            type: string;
            min: number;
            max: number;
            strand: 1 | -1 | undefined;
            children: (import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined;
            attributes: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>>;
        } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
            readonly length: number;
            readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
            readonly minWithChildren: number;
            readonly maxWithChildren: number;
            hasDescendant(featureId: string): boolean;
            readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
            readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
        } & {
            readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
        } & {
            setAttributes(attributes: Map<string, string[]>): void;
            setAttribute(key: string, value: string[]): void;
            setType(type: string): void;
            setRefSeq(refSeq: string): void;
            setMin(min: number): void;
            setMax(max: number): void;
            setStrand(strand?: 1 | -1): void;
            addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
            deleteChild(childFeatureId: string): void;
        } & {
            update({ children, max, min, refSeq, strand, }: {
                refSeq: string;
                min: number;
                max: number;
                strand?: 1 | -1;
                children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
            }): void;
        } & {
            readonly parent: AnnotationFeature | undefined;
            readonly topLevelFeature: AnnotationFeature;
            readonly assemblyId: string;
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
            _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
            max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
            strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
            children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
            attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
        }, {
            readonly length: number;
            readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
            readonly minWithChildren: number;
            readonly maxWithChildren: number;
            hasDescendant(featureId: string): boolean;
            readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
            readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
        } & {
            readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
        } & {
            setAttributes(attributes: Map<string, string[]>): void;
            setAttribute(key: string, value: string[]): void;
            setType(type: string): void;
            setRefSeq(refSeq: string): void;
            setMin(min: number): void;
            setMax(max: number): void;
            setStrand(strand?: 1 | -1): void;
            addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
            deleteChild(childFeatureId: string): void;
        } & {
            update({ children, max, min, refSeq, strand, }: {
                refSeq: string;
                min: number;
                max: number;
                strand?: 1 | -1;
                children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
            }): void;
        } & {
            readonly parent: AnnotationFeature | undefined;
            readonly topLevelFeature: AnnotationFeature;
            readonly assemblyId: string;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
    } & {
        addAssembly(assemblyId: string, backendDriverType?: import("@apollo-annotation/mst").BackendDriverType): {
            _id: string;
            refSeqs: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            comments: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
            backendDriverType: string;
        } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
            getByRefName(refName: string): ({
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
        } & {
            addRefSeq(id: string, name: string, description?: string): {
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            addComment(comment: string): number;
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
            _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            refSeqs: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            comments: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
            backendDriverType: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
        }, {
            getByRefName(refName: string): ({
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
        } & {
            addRefSeq(id: string, name: string, description?: string): {
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            addComment(comment: string): number;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    } & {
        addFeature(assemblyId: string, feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
        deleteFeature(featureId: string): void;
        deleteAssembly(assemblyId: string): void;
        addCheckResult(checkResult: import("@apollo-annotation/mst").CheckResultSnapshot): void;
        addCheckResults(checkResults: import("@apollo-annotation/mst").CheckResultSnapshot[]): void;
        deleteCheckResult(checkResultId: string): void;
        clearCheckResults(): void;
    } & {
        changeManager: import("../ChangeManager").ChangeManager;
        collaborationServerDriver: import("../BackendDrivers").CollaborationServerDriver;
        localDriver: import("../BackendDrivers").LocalDriver;
    } & {
        afterCreate(): void;
    } & {
        getBackendDriver(assemblyId: string): import("../BackendDrivers").BackendDriver | undefined;
        getInternetAccount(assemblyName?: string, internetAccountId?: string): import("../BackendDrivers").ApolloInternetAccount;
    } & {
        loadFeatures: (regions: import("@jbrowse/core/util").Region[]) => Promise<void>;
        loadRefSeq: (regions: import("@jbrowse/core/util").Region[]) => Promise<void>;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>, [undefined]>;
    apolloSelectedFeature: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IReferenceType<import("@jbrowse/mobx-state-tree").IModelType<{
        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
    }, {
        readonly length: number;
        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
        readonly minWithChildren: number;
        readonly maxWithChildren: number;
        hasDescendant(featureId: string): boolean;
        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
    } & {
        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
    } & {
        setAttributes(attributes: Map<string, string[]>): void;
        setAttribute(key: string, value: string[]): void;
        setType(type: string): void;
        setRefSeq(refSeq: string): void;
        setMin(min: number): void;
        setMax(max: number): void;
        setStrand(strand?: 1 | -1): void;
        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
        deleteChild(childFeatureId: string): void;
    } & {
        update({ children, max, min, refSeq, strand, }: {
            refSeq: string;
            min: number;
            max: number;
            strand?: 1 | -1;
            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
        }): void;
    } & {
        readonly parent: AnnotationFeature | undefined;
        readonly topLevelFeature: AnnotationFeature;
        readonly assemblyId: string;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
    jobsManager: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{}, {
        readonly jobStatusWidget: import("../ApolloJobModel").JobsListModel;
    } & {
        update(jobName: string, statusMessage: string, progressPct?: number): void;
        abortJob(jobName: string, msg?: string): void;
        runJob(job: import("../ApolloJobModel").JobsEntry): void;
        done(job: import("../ApolloJobModel").JobsEntry): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>, [undefined]>;
    isLocked: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    changeInProgress: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}, {
    apolloHoveredFeature: HoveredFeature | undefined;
    abortController: AbortController;
} & {
    addOrUpdateCollaborator(collaborator: Collaborator): void;
} & {
    readonly collaborators: import("mobx").IObservableArray<Collaborator>;
} & {
    apolloSetSelectedFeature(feature?: AnnotationFeature | string): void;
    apolloSetHoveredFeature(feature?: HoveredFeature): void;
    addApolloLocalTrackConfig(assembly: Assembly): void;
    toggleLocked(): void;
    setChangeInProgress(changeInProgress: boolean): void;
    getPluginConfiguration(): {
        [x: string]: any;
    } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
        setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
            [x: string]: any;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
            setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                [x: string]: any;
            } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaDefinition, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<import("@jbrowse/core/configuration").AnyConfigurationSchemaType | undefined, string | undefined>>>;
    broadcastLocations(): void;
} & {
    apolloSetEventualSelectedFeature: (featureId: string) => import("mobx/dist/internal").CancellablePromise<void>;
} & {
    previousSnapshot: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        [x: string]: never;
    } & {
        apolloDataStore: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{
            typeName: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<"Client">, [undefined]>;
            assemblies: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                refSeqs: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                }, {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                comments: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                backendDriverType: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            }, {
                getByRefName(refName: string): ({
                    _id: string;
                    name: string;
                    description: string;
                    features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                    sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                }, {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
            } & {
                addRefSeq(id: string, name: string, description?: string): {
                    _id: string;
                    name: string;
                    description: string;
                    features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                    sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                }, {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                addComment(comment: string): number;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            checkResults: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                cause: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                ids: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IReferenceType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>>;
                refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                end: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                ignored: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
                message: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            ontologyManager: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{
                ontologies: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "BlobLocation";
                        name: string;
                        blobId: string;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "LocalPathLocation";
                        localPath: string;
                    }>, {
                        locationType: "UriLocation";
                        uri: string;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                        }> | undefined;
                    } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | ({
                        locationType: "UriLocation";
                        uri: string;
                    } & Partial<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
                    options: import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>;
                    equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                    startedEquivalentTypeRequests: Set<string>;
                } & {
                    ping(): void;
                    initDataStore(): void;
                    afterCreate(): void;
                    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
                } & {
                    loadEquivalentTypes: (type: string) => Promise<void>;
                } & {
                    afterCreate(): void;
                    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
                } & {
                    isTypeOf(queryType: string, typeOf: string): boolean;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                prefixes: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>, [undefined]>;
            }, {
                readonly featureTypeOntologyName: string;
            } & {
                readonly featureTypeOntology: ({
                    name: string;
                    version: string;
                    source: ({
                        locationType: "BlobLocation";
                        name: string;
                        blobId: string;
                    } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "BlobLocation";
                        name: string;
                        blobId: string;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "LocalPathLocation";
                        localPath: string;
                    }>, {
                        locationType: "UriLocation";
                        uri: string;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                        }> | undefined;
                    } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | ({
                        locationType: "UriLocation";
                        uri: string;
                    } & Partial<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                        locationType: "LocalPathLocation";
                        localPath: string;
                    } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "BlobLocation";
                        name: string;
                        blobId: string;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "LocalPathLocation";
                        localPath: string;
                    }>, {
                        locationType: "UriLocation";
                        uri: string;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                        }> | undefined;
                    } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | ({
                        locationType: "UriLocation";
                        uri: string;
                    } & Partial<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                        locationType: "UriLocation";
                        uri: string;
                    } & Partial<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "BlobLocation";
                        name: string;
                        blobId: string;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "LocalPathLocation";
                        localPath: string;
                    }>, {
                        locationType: "UriLocation";
                        uri: string;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                        }> | undefined;
                    } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | ({
                        locationType: "UriLocation";
                        uri: string;
                    } & Partial<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>);
                    options: import("../OntologyManager/OntologyStore").OntologyStoreOptions & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>>;
                    equivalentTypes: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>>;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                    dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                    startedEquivalentTypeRequests: Set<string>;
                } & {
                    ping(): void;
                    initDataStore(): void;
                    afterCreate(): void;
                    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
                } & {
                    loadEquivalentTypes: (type: string) => Promise<void>;
                } & {
                    afterCreate(): void;
                    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
                } & {
                    isTypeOf(queryType: string, typeOf: string): boolean;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "BlobLocation";
                        name: string;
                        blobId: string;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "LocalPathLocation";
                        localPath: string;
                    }>, {
                        locationType: "UriLocation";
                        uri: string;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                        }> | undefined;
                    } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | ({
                        locationType: "UriLocation";
                        uri: string;
                    } & Partial<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
                    options: import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>;
                    equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                    startedEquivalentTypeRequests: Set<string>;
                } & {
                    ping(): void;
                    initDataStore(): void;
                    afterCreate(): void;
                    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
                } & {
                    loadEquivalentTypes: (type: string) => Promise<void>;
                } & {
                    afterCreate(): void;
                    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
                } & {
                    isTypeOf(queryType: string, typeOf: string): boolean;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
                findOntology(name: string, version?: string): ({
                    name: string;
                    version: string;
                    source: ({
                        locationType: "BlobLocation";
                        name: string;
                        blobId: string;
                    } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "BlobLocation";
                        name: string;
                        blobId: string;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "LocalPathLocation";
                        localPath: string;
                    }>, {
                        locationType: "UriLocation";
                        uri: string;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                        }> | undefined;
                    } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | ({
                        locationType: "UriLocation";
                        uri: string;
                    } & Partial<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                        locationType: "LocalPathLocation";
                        localPath: string;
                    } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "BlobLocation";
                        name: string;
                        blobId: string;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "LocalPathLocation";
                        localPath: string;
                    }>, {
                        locationType: "UriLocation";
                        uri: string;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                        }> | undefined;
                    } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | ({
                        locationType: "UriLocation";
                        uri: string;
                    } & Partial<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                        locationType: "UriLocation";
                        uri: string;
                    } & Partial<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "BlobLocation";
                        name: string;
                        blobId: string;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "LocalPathLocation";
                        localPath: string;
                    }>, {
                        locationType: "UriLocation";
                        uri: string;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                        }> | undefined;
                    } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | ({
                        locationType: "UriLocation";
                        uri: string;
                    } & Partial<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>);
                    options: import("../OntologyManager/OntologyStore").OntologyStoreOptions & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>>;
                    equivalentTypes: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>>;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                    dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                    startedEquivalentTypeRequests: Set<string>;
                } & {
                    ping(): void;
                    initDataStore(): void;
                    afterCreate(): void;
                    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
                } & {
                    loadEquivalentTypes: (type: string) => Promise<void>;
                } & {
                    afterCreate(): void;
                    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
                } & {
                    isTypeOf(queryType: string, typeOf: string): boolean;
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "BlobLocation";
                        name: string;
                        blobId: string;
                    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        locationType: "LocalPathLocation";
                        localPath: string;
                    }>, {
                        locationType: "UriLocation";
                        uri: string;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                        }> | undefined;
                    } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}> | ({
                        locationType: "UriLocation";
                        uri: string;
                    } & Partial<{
                        locationType: "UriLocation";
                        uri: string;
                        baseUri: string | undefined;
                        internetAccountId: string | undefined;
                        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                            internetAccountType: string;
                            authInfo: any;
                        }> | undefined;
                    }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
                    options: import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>;
                    equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                    startedEquivalentTypeRequests: Set<string>;
                } & {
                    ping(): void;
                    initDataStore(): void;
                    afterCreate(): void;
                    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
                } & {
                    loadEquivalentTypes: (type: string) => Promise<void>;
                } & {
                    afterCreate(): void;
                    setEquivalentTypes(type: string, equivalentTypes: string[]): void;
                } & {
                    isTypeOf(queryType: string, typeOf: string): boolean;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
                openOntology(name: string, version?: string): import("../OntologyManager/OntologyStore").default | undefined;
                applyPrefixes(uri: string): string;
                expandPrefixes(uri: string): string;
            } & {
                addOntology(name: string, version: string, source: Instance<typeof import("@jbrowse/core/util/types/mst").LocalPathLocation> | Instance<typeof import("@jbrowse/core/util/types/mst").UriLocation>, options?: import("../OntologyManager/OntologyStore").OntologyStoreOptions): void;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>, [undefined]>;
        }, {
            readonly internetAccounts: (({
                id: string;
                type: string;
                configuration: {
                    [x: string]: any;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                    setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                        [x: string]: any;
                    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                        setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                            [x: string]: any;
                        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
                    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
                    name: {
                        description: string;
                        type: string;
                        defaultValue: string;
                    };
                    description: {
                        description: string;
                        type: string;
                        defaultValue: string;
                    };
                    authHeader: {
                        description: string;
                        type: string;
                        defaultValue: string;
                    };
                    tokenType: {
                        description: string;
                        type: string;
                        defaultValue: string;
                    };
                    domains: {
                        description: string;
                        type: string;
                        defaultValue: never[];
                    };
                }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "internetAccountId">>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                readonly name: string;
                readonly description: string;
                readonly internetAccountId: string;
                readonly authHeader: string;
                readonly tokenType: string;
                readonly domains: string[];
                readonly toggleContents: import("react").ReactNode;
                readonly SelectorComponent: import("@jbrowse/core/util").AnyReactComponentType | undefined;
                readonly selectorLabel: string | undefined;
            } & {
                handlesLocation(location: import("@jbrowse/core/util").UriLocation): boolean;
                readonly tokenKey: string;
            } & {
                getTokenFromUser(_resolve: (token: string) => void, _reject: (error: Error) => void): void;
                storeToken(token: string): void;
                removeToken(): void;
                retrieveToken(): string | null;
                validateToken(token: string, _loc: import("@jbrowse/core/util").UriLocation): Promise<string>;
            } & {
                getToken(location?: import("@jbrowse/core/util").UriLocation): Promise<string>;
            } & {
                addAuthHeaderToInit(init?: RequestInit, token?: string): {
                    headers: Headers;
                    body?: BodyInit | null;
                    cache?: RequestCache;
                    credentials?: RequestCredentials;
                    integrity?: string;
                    keepalive?: boolean;
                    method?: string;
                    mode?: RequestMode;
                    priority?: RequestPriority;
                    redirect?: RequestRedirect;
                    referrer?: string;
                    referrerPolicy?: ReferrerPolicy;
                    signal?: AbortSignal | null;
                    window?: null;
                };
                getPreAuthorizationInformation(location: import("@jbrowse/core/util").UriLocation): Promise<{
                    internetAccountType: string;
                    authInfo: {
                        token: string;
                        configuration: any;
                    };
                }>;
            } & {
                getFetcher(loc?: import("@jbrowse/core/util").UriLocation): (input: RequestInfo, init?: RequestInit) => Promise<Response>;
            } & {
                openLocation(location: import("@jbrowse/core/util").UriLocation): import("@jbrowse/core/util/io").RemoteFileWithRangeCache;
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
                type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                configuration: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
                    name: {
                        description: string;
                        type: string;
                        defaultValue: string;
                    };
                    description: {
                        description: string;
                        type: string;
                        defaultValue: string;
                    };
                    authHeader: {
                        description: string;
                        type: string;
                        defaultValue: string;
                    };
                    tokenType: {
                        description: string;
                        type: string;
                        defaultValue: string;
                    };
                    domains: {
                        description: string;
                        type: string;
                        defaultValue: never[];
                    };
                }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "internetAccountId">>;
            }, {
                readonly name: string;
                readonly description: string;
                readonly internetAccountId: string;
                readonly authHeader: string;
                readonly tokenType: string;
                readonly domains: string[];
                readonly toggleContents: import("react").ReactNode;
                readonly SelectorComponent: import("@jbrowse/core/util").AnyReactComponentType | undefined;
                readonly selectorLabel: string | undefined;
            } & {
                handlesLocation(location: import("@jbrowse/core/util").UriLocation): boolean;
                readonly tokenKey: string;
            } & {
                getTokenFromUser(_resolve: (token: string) => void, _reject: (error: Error) => void): void;
                storeToken(token: string): void;
                removeToken(): void;
                retrieveToken(): string | null;
                validateToken(token: string, _loc: import("@jbrowse/core/util").UriLocation): Promise<string>;
            } & {
                getToken(location?: import("@jbrowse/core/util").UriLocation): Promise<string>;
            } & {
                addAuthHeaderToInit(init?: RequestInit, token?: string): {
                    headers: Headers;
                    body?: BodyInit | null;
                    cache?: RequestCache;
                    credentials?: RequestCredentials;
                    integrity?: string;
                    keepalive?: boolean;
                    method?: string;
                    mode?: RequestMode;
                    priority?: RequestPriority;
                    redirect?: RequestRedirect;
                    referrer?: string;
                    referrerPolicy?: ReferrerPolicy;
                    signal?: AbortSignal | null;
                    window?: null;
                };
                getPreAuthorizationInformation(location: import("@jbrowse/core/util").UriLocation): Promise<{
                    internetAccountType: string;
                    authInfo: {
                        token: string;
                        configuration: any;
                    };
                }>;
            } & {
                getFetcher(loc?: import("@jbrowse/core/util").UriLocation): (input: RequestInfo, init?: RequestInit) => Promise<Response>;
            } & {
                openLocation(location: import("@jbrowse/core/util").UriLocation): import("@jbrowse/core/util/io").RemoteFileWithRangeCache;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | ApolloInternetAccountModel)[];
            readonly pluginConfiguration: Instance<typeof ApolloPluginConfigurationSchema>;
            getFeature(featureId: string): ({
                _id: string;
                refSeq: string;
                type: string;
                min: number;
                max: number;
                strand: 1 | -1 | undefined;
                children: (import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined;
                attributes: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                readonly length: number;
                readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                readonly minWithChildren: number;
                readonly maxWithChildren: number;
                hasDescendant(featureId: string): boolean;
                readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
            } & {
                readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
            } & {
                setAttributes(attributes: Map<string, string[]>): void;
                setAttribute(key: string, value: string[]): void;
                setType(type: string): void;
                setRefSeq(refSeq: string): void;
                setMin(min: number): void;
                setMax(max: number): void;
                setStrand(strand?: 1 | -1): void;
                addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteChild(childFeatureId: string): void;
            } & {
                update({ children, max, min, refSeq, strand, }: {
                    refSeq: string;
                    min: number;
                    max: number;
                    strand?: 1 | -1;
                    children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                }): void;
            } & {
                readonly parent: AnnotationFeature | undefined;
                readonly topLevelFeature: AnnotationFeature;
                readonly assemblyId: string;
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
            }, {
                readonly length: number;
                readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                readonly minWithChildren: number;
                readonly maxWithChildren: number;
                hasDescendant(featureId: string): boolean;
                readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
            } & {
                readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
            } & {
                setAttributes(attributes: Map<string, string[]>): void;
                setAttribute(key: string, value: string[]): void;
                setType(type: string): void;
                setRefSeq(refSeq: string): void;
                setMin(min: number): void;
                setMax(max: number): void;
                setStrand(strand?: 1 | -1): void;
                addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteChild(childFeatureId: string): void;
            } & {
                update({ children, max, min, refSeq, strand, }: {
                    refSeq: string;
                    min: number;
                    max: number;
                    strand?: 1 | -1;
                    children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                }): void;
            } & {
                readonly parent: AnnotationFeature | undefined;
                readonly topLevelFeature: AnnotationFeature;
                readonly assemblyId: string;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
        } & {
            addAssembly(assemblyId: string, backendDriverType?: import("@apollo-annotation/mst").BackendDriverType): {
                _id: string;
                refSeqs: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                }, {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                }, {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                comments: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                backendDriverType: string;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                getByRefName(refName: string): ({
                    _id: string;
                    name: string;
                    description: string;
                    features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                    sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                }, {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
            } & {
                addRefSeq(id: string, name: string, description?: string): {
                    _id: string;
                    name: string;
                    description: string;
                    features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                    sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                }, {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                addComment(comment: string): number;
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                refSeqs: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                }, {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                comments: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
                backendDriverType: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            }, {
                getByRefName(refName: string): ({
                    _id: string;
                    name: string;
                    description: string;
                    features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                    sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                }, {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
            } & {
                addRefSeq(id: string, name: string, description?: string): {
                    _id: string;
                    name: string;
                    description: string;
                    features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                    sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                    features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                    }, {
                        readonly length: number;
                        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                        readonly minWithChildren: number;
                        readonly maxWithChildren: number;
                        hasDescendant(featureId: string): boolean;
                        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                    } & {
                        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                    } & {
                        setAttributes(attributes: Map<string, string[]>): void;
                        setAttribute(key: string, value: string[]): void;
                        setType(type: string): void;
                        setRefSeq(refSeq: string): void;
                        setMin(min: number): void;
                        setMax(max: number): void;
                        setStrand(strand?: 1 | -1): void;
                        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                        deleteChild(childFeatureId: string): void;
                    } & {
                        update({ children, max, min, refSeq, strand, }: {
                            refSeq: string;
                            min: number;
                            max: number;
                            strand?: 1 | -1;
                            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                        }): void;
                    } & {
                        readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                        readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                        readonly assemblyId: string;
                    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                    sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                        sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                }, {
                    addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteFeature(featureId: string): boolean;
                    setDescription(description: string): void;
                    addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
                } & {
                    getSequence(start: number, stop: number): string;
                    getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                addComment(comment: string): number;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
        } & {
            addFeature(assemblyId: string, feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
            deleteFeature(featureId: string): void;
            deleteAssembly(assemblyId: string): void;
            addCheckResult(checkResult: import("@apollo-annotation/mst").CheckResultSnapshot): void;
            addCheckResults(checkResults: import("@apollo-annotation/mst").CheckResultSnapshot[]): void;
            deleteCheckResult(checkResultId: string): void;
            clearCheckResults(): void;
        } & {
            changeManager: import("../ChangeManager").ChangeManager;
            collaborationServerDriver: import("../BackendDrivers").CollaborationServerDriver;
            localDriver: import("../BackendDrivers").LocalDriver;
        } & {
            afterCreate(): void;
        } & {
            getBackendDriver(assemblyId: string): import("../BackendDrivers").BackendDriver | undefined;
            getInternetAccount(assemblyName?: string, internetAccountId?: string): import("../BackendDrivers").ApolloInternetAccount;
        } & {
            loadFeatures: (regions: import("@jbrowse/core/util").Region[]) => Promise<void>;
            loadRefSeq: (regions: import("@jbrowse/core/util").Region[]) => Promise<void>;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>, [undefined]>;
        apolloSelectedFeature: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IReferenceType<import("@jbrowse/mobx-state-tree").IModelType<{
            _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
            max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
            strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
            children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
            attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
        }, {
            readonly length: number;
            readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
            readonly minWithChildren: number;
            readonly maxWithChildren: number;
            hasDescendant(featureId: string): boolean;
            readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
            readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
        } & {
            readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
        } & {
            setAttributes(attributes: Map<string, string[]>): void;
            setAttribute(key: string, value: string[]): void;
            setType(type: string): void;
            setRefSeq(refSeq: string): void;
            setMin(min: number): void;
            setMax(max: number): void;
            setStrand(strand?: 1 | -1): void;
            addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
            deleteChild(childFeatureId: string): void;
        } & {
            update({ children, max, min, refSeq, strand, }: {
                refSeq: string;
                min: number;
                max: number;
                strand?: 1 | -1;
                children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
            }): void;
        } & {
            readonly parent: AnnotationFeature | undefined;
            readonly topLevelFeature: AnnotationFeature;
            readonly assemblyId: string;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
        jobsManager: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{}, {
            readonly jobStatusWidget: import("../ApolloJobModel").JobsListModel;
        } & {
            update(jobName: string, statusMessage: string, progressPct?: number): void;
            abortJob(jobName: string, msg?: string): void;
            runJob(job: import("../ApolloJobModel").JobsEntry): void;
            done(job: import("../ApolloJobModel").JobsEntry): void;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>, [undefined]>;
        isLocked: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
        changeInProgress: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    }>;
} & {
    afterCreate(): void;
    beforeDestroy(): void;
} & {
    afterCreate(): Promise<void>;
    afterAttach(): void;
} & {
    getTrackActions(conf: BaseTrackConfig): (import("@jbrowse/core/ui").MenuDivider | import("@jbrowse/core/ui").MenuSubHeader | import("@jbrowse/core/ui").NormalMenuItem | import("@jbrowse/core/ui").CheckboxMenuItem | import("@jbrowse/core/ui").RadioMenuItem | import("@jbrowse/core/ui").SubMenuItem | {
        label: string;
        onClick: () => Promise<void>;
        icon: import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").SvgIconTypeMap<{}, "svg">> & {
            muiName: string;
        };
    })[] | undefined;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
    [x: string]: never;
} & {
    apolloDataStore: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{
        typeName: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<"Client">, [undefined]>;
        assemblies: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
            _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            refSeqs: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            comments: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
            backendDriverType: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
        }, {
            getByRefName(refName: string): ({
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
        } & {
            addRefSeq(id: string, name: string, description?: string): {
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            addComment(comment: string): number;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
        checkResults: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
            _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            cause: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            ids: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IReferenceType<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
            }, {
                readonly length: number;
                readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                readonly minWithChildren: number;
                readonly maxWithChildren: number;
                hasDescendant(featureId: string): boolean;
                readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
            } & {
                readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
            } & {
                setAttributes(attributes: Map<string, string[]>): void;
                setAttribute(key: string, value: string[]): void;
                setType(type: string): void;
                setRefSeq(refSeq: string): void;
                setMin(min: number): void;
                setMax(max: number): void;
                setStrand(strand?: 1 | -1): void;
                addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteChild(childFeatureId: string): void;
            } & {
                update({ children, max, min, refSeq, strand, }: {
                    refSeq: string;
                    min: number;
                    max: number;
                    strand?: 1 | -1;
                    children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                }): void;
            } & {
                readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                readonly assemblyId: string;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>>;
            refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
            end: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
            ignored: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
            message: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
        ontologyManager: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{
            ontologies: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
                options: import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>;
                equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
            }, {
                dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                startedEquivalentTypeRequests: Set<string>;
            } & {
                ping(): void;
                initDataStore(): void;
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                loadEquivalentTypes: (type: string) => Promise<void>;
            } & {
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                isTypeOf(queryType: string, typeOf: string): boolean;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            prefixes: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>, [undefined]>;
        }, {
            readonly featureTypeOntologyName: string;
        } & {
            readonly featureTypeOntology: ({
                name: string;
                version: string;
                source: ({
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                    locationType: "LocalPathLocation";
                    localPath: string;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>);
                options: import("../OntologyManager/OntologyStore").OntologyStoreOptions & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>>;
                equivalentTypes: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                startedEquivalentTypeRequests: Set<string>;
            } & {
                ping(): void;
                initDataStore(): void;
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                loadEquivalentTypes: (type: string) => Promise<void>;
            } & {
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                isTypeOf(queryType: string, typeOf: string): boolean;
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
                options: import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>;
                equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
            }, {
                dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                startedEquivalentTypeRequests: Set<string>;
            } & {
                ping(): void;
                initDataStore(): void;
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                loadEquivalentTypes: (type: string) => Promise<void>;
            } & {
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                isTypeOf(queryType: string, typeOf: string): boolean;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
            findOntology(name: string, version?: string): ({
                name: string;
                version: string;
                source: ({
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                    locationType: "LocalPathLocation";
                    localPath: string;
                } & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>) | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>>);
                options: import("../OntologyManager/OntologyStore").OntologyStoreOptions & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>>;
                equivalentTypes: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                startedEquivalentTypeRequests: Set<string>;
            } & {
                ping(): void;
                initDataStore(): void;
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                loadEquivalentTypes: (type: string) => Promise<void>;
            } & {
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                isTypeOf(queryType: string, typeOf: string): boolean;
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                version: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                source: import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "BlobLocation";
                    name: string;
                    blobId: string;
                }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
                    locationType: "LocalPathLocation";
                    localPath: string;
                }>, {
                    locationType: "UriLocation";
                    uri: string;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                        internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                        authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
                    }> | undefined;
                } | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
                    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
                    locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
                    localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}> | ({
                    locationType: "UriLocation";
                    uri: string;
                } & Partial<{
                    locationType: "UriLocation";
                    uri: string;
                    baseUri: string | undefined;
                    internetAccountId: string | undefined;
                    internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
                        internetAccountType: string;
                        authInfo: any;
                    }> | undefined;
                }> & import("@jbrowse/mobx-state-tree").NonEmptyObject)>;
                options: import("@jbrowse/mobx-state-tree").IType<import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions, import("../OntologyManager/OntologyStore").OntologyStoreOptions>;
                equivalentTypes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
            }, {
                dataStore: undefined | import("../OntologyManager/OntologyStore").default;
                startedEquivalentTypeRequests: Set<string>;
            } & {
                ping(): void;
                initDataStore(): void;
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                loadEquivalentTypes: (type: string) => Promise<void>;
            } & {
                afterCreate(): void;
                setEquivalentTypes(type: string, equivalentTypes: string[]): void;
            } & {
                isTypeOf(queryType: string, typeOf: string): boolean;
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
            openOntology(name: string, version?: string): import("../OntologyManager/OntologyStore").default | undefined;
            applyPrefixes(uri: string): string;
            expandPrefixes(uri: string): string;
        } & {
            addOntology(name: string, version: string, source: Instance<typeof import("@jbrowse/core/util/types/mst").LocalPathLocation> | Instance<typeof import("@jbrowse/core/util/types/mst").UriLocation>, options?: import("../OntologyManager/OntologyStore").OntologyStoreOptions): void;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>, [undefined]>;
    }, {
        readonly internetAccounts: (({
            id: string;
            type: string;
            configuration: {
                [x: string]: any;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                    [x: string]: any;
                } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
                    setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                        [x: string]: any;
                    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
                } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
                name: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                description: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                authHeader: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                tokenType: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                domains: {
                    description: string;
                    type: string;
                    defaultValue: never[];
                };
            }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "internetAccountId">>>;
        } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
            readonly name: string;
            readonly description: string;
            readonly internetAccountId: string;
            readonly authHeader: string;
            readonly tokenType: string;
            readonly domains: string[];
            readonly toggleContents: import("react").ReactNode;
            readonly SelectorComponent: import("@jbrowse/core/util").AnyReactComponentType | undefined;
            readonly selectorLabel: string | undefined;
        } & {
            handlesLocation(location: import("@jbrowse/core/util").UriLocation): boolean;
            readonly tokenKey: string;
        } & {
            getTokenFromUser(_resolve: (token: string) => void, _reject: (error: Error) => void): void;
            storeToken(token: string): void;
            removeToken(): void;
            retrieveToken(): string | null;
            validateToken(token: string, _loc: import("@jbrowse/core/util").UriLocation): Promise<string>;
        } & {
            getToken(location?: import("@jbrowse/core/util").UriLocation): Promise<string>;
        } & {
            addAuthHeaderToInit(init?: RequestInit, token?: string): {
                headers: Headers;
                body?: BodyInit | null;
                cache?: RequestCache;
                credentials?: RequestCredentials;
                integrity?: string;
                keepalive?: boolean;
                method?: string;
                mode?: RequestMode;
                priority?: RequestPriority;
                redirect?: RequestRedirect;
                referrer?: string;
                referrerPolicy?: ReferrerPolicy;
                signal?: AbortSignal | null;
                window?: null;
            };
            getPreAuthorizationInformation(location: import("@jbrowse/core/util").UriLocation): Promise<{
                internetAccountType: string;
                authInfo: {
                    token: string;
                    configuration: any;
                };
            }>;
        } & {
            getFetcher(loc?: import("@jbrowse/core/util").UriLocation): (input: RequestInfo, init?: RequestInit) => Promise<Response>;
        } & {
            openLocation(location: import("@jbrowse/core/util").UriLocation): import("@jbrowse/core/util/io").RemoteFileWithRangeCache;
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
            id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            configuration: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
                name: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                description: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                authHeader: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                tokenType: {
                    description: string;
                    type: string;
                    defaultValue: string;
                };
                domains: {
                    description: string;
                    type: string;
                    defaultValue: never[];
                };
            }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "internetAccountId">>;
        }, {
            readonly name: string;
            readonly description: string;
            readonly internetAccountId: string;
            readonly authHeader: string;
            readonly tokenType: string;
            readonly domains: string[];
            readonly toggleContents: import("react").ReactNode;
            readonly SelectorComponent: import("@jbrowse/core/util").AnyReactComponentType | undefined;
            readonly selectorLabel: string | undefined;
        } & {
            handlesLocation(location: import("@jbrowse/core/util").UriLocation): boolean;
            readonly tokenKey: string;
        } & {
            getTokenFromUser(_resolve: (token: string) => void, _reject: (error: Error) => void): void;
            storeToken(token: string): void;
            removeToken(): void;
            retrieveToken(): string | null;
            validateToken(token: string, _loc: import("@jbrowse/core/util").UriLocation): Promise<string>;
        } & {
            getToken(location?: import("@jbrowse/core/util").UriLocation): Promise<string>;
        } & {
            addAuthHeaderToInit(init?: RequestInit, token?: string): {
                headers: Headers;
                body?: BodyInit | null;
                cache?: RequestCache;
                credentials?: RequestCredentials;
                integrity?: string;
                keepalive?: boolean;
                method?: string;
                mode?: RequestMode;
                priority?: RequestPriority;
                redirect?: RequestRedirect;
                referrer?: string;
                referrerPolicy?: ReferrerPolicy;
                signal?: AbortSignal | null;
                window?: null;
            };
            getPreAuthorizationInformation(location: import("@jbrowse/core/util").UriLocation): Promise<{
                internetAccountType: string;
                authInfo: {
                    token: string;
                    configuration: any;
                };
            }>;
        } & {
            getFetcher(loc?: import("@jbrowse/core/util").UriLocation): (input: RequestInfo, init?: RequestInit) => Promise<Response>;
        } & {
            openLocation(location: import("@jbrowse/core/util").UriLocation): import("@jbrowse/core/util/io").RemoteFileWithRangeCache;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | ApolloInternetAccountModel)[];
        readonly pluginConfiguration: Instance<typeof ApolloPluginConfigurationSchema>;
        getFeature(featureId: string): ({
            _id: string;
            refSeq: string;
            type: string;
            min: number;
            max: number;
            strand: 1 | -1 | undefined;
            children: (import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined;
            attributes: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>>;
        } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
            readonly length: number;
            readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
            readonly minWithChildren: number;
            readonly maxWithChildren: number;
            hasDescendant(featureId: string): boolean;
            readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
            readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
        } & {
            readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
        } & {
            setAttributes(attributes: Map<string, string[]>): void;
            setAttribute(key: string, value: string[]): void;
            setType(type: string): void;
            setRefSeq(refSeq: string): void;
            setMin(min: number): void;
            setMax(max: number): void;
            setStrand(strand?: 1 | -1): void;
            addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
            deleteChild(childFeatureId: string): void;
        } & {
            update({ children, max, min, refSeq, strand, }: {
                refSeq: string;
                min: number;
                max: number;
                strand?: 1 | -1;
                children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
            }): void;
        } & {
            readonly parent: AnnotationFeature | undefined;
            readonly topLevelFeature: AnnotationFeature;
            readonly assemblyId: string;
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
            _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
            max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
            strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
            children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
            attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
        }, {
            readonly length: number;
            readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
            readonly minWithChildren: number;
            readonly maxWithChildren: number;
            hasDescendant(featureId: string): boolean;
            readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
            readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
        } & {
            readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
        } & {
            setAttributes(attributes: Map<string, string[]>): void;
            setAttribute(key: string, value: string[]): void;
            setType(type: string): void;
            setRefSeq(refSeq: string): void;
            setMin(min: number): void;
            setMax(max: number): void;
            setStrand(strand?: 1 | -1): void;
            addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
            deleteChild(childFeatureId: string): void;
        } & {
            update({ children, max, min, refSeq, strand, }: {
                refSeq: string;
                min: number;
                max: number;
                strand?: 1 | -1;
                children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
            }): void;
        } & {
            readonly parent: AnnotationFeature | undefined;
            readonly topLevelFeature: AnnotationFeature;
            readonly assemblyId: string;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
    } & {
        addAssembly(assemblyId: string, backendDriverType?: import("@apollo-annotation/mst").BackendDriverType): {
            _id: string;
            refSeqs: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            comments: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
            backendDriverType: string;
        } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
            getByRefName(refName: string): ({
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
        } & {
            addRefSeq(id: string, name: string, description?: string): {
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            addComment(comment: string): number;
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
            _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            refSeqs: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            comments: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
            backendDriverType: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
        }, {
            getByRefName(refName: string): ({
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>) | undefined;
        } & {
            addRefSeq(id: string, name: string, description?: string): {
                _id: string;
                name: string;
                description: string;
                features: import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
                sequence: import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
            } & import("@jbrowse/mobx-state-tree").NonEmptyObject & {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
                _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                description: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
                features: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
                    _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                    min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
                    children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
                    attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
                }, {
                    readonly length: number;
                    readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
                    readonly minWithChildren: number;
                    readonly maxWithChildren: number;
                    hasDescendant(featureId: string): boolean;
                    readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
                    readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
                } & {
                    readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
                } & {
                    setAttributes(attributes: Map<string, string[]>): void;
                    setAttribute(key: string, value: string[]): void;
                    setType(type: string): void;
                    setRefSeq(refSeq: string): void;
                    setMin(min: number): void;
                    setMax(max: number): void;
                    setStrand(strand?: 1 | -1): void;
                    addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                    deleteChild(childFeatureId: string): void;
                } & {
                    update({ children, max, min, refSeq, strand, }: {
                        refSeq: string;
                        min: number;
                        max: number;
                        strand?: 1 | -1;
                        children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
                    }): void;
                } & {
                    readonly parent: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature | undefined;
                    readonly topLevelFeature: import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature;
                    readonly assemblyId: string;
                }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
                sequence: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
                    start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    stop: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
                    sequence: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
                }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            }, {
                addFeature(feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
                deleteFeature(featureId: string): boolean;
                setDescription(description: string): void;
                addSequence(seq: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<typeof import("@apollo-annotation/mst").Sequence>): void;
            } & {
                getSequence(start: number, stop: number): string;
                getFeatures(min: number, max: number): import("../../../apollo-mst/dist/AnnotationFeatureModel").AnnotationFeature[];
            }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
            addComment(comment: string): number;
        }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    } & {
        addFeature(assemblyId: string, feature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
        deleteFeature(featureId: string): void;
        deleteAssembly(assemblyId: string): void;
        addCheckResult(checkResult: import("@apollo-annotation/mst").CheckResultSnapshot): void;
        addCheckResults(checkResults: import("@apollo-annotation/mst").CheckResultSnapshot[]): void;
        deleteCheckResult(checkResultId: string): void;
        clearCheckResults(): void;
    } & {
        changeManager: import("../ChangeManager").ChangeManager;
        collaborationServerDriver: import("../BackendDrivers").CollaborationServerDriver;
        localDriver: import("../BackendDrivers").LocalDriver;
    } & {
        afterCreate(): void;
    } & {
        getBackendDriver(assemblyId: string): import("../BackendDrivers").BackendDriver | undefined;
        getInternetAccount(assemblyName?: string, internetAccountId?: string): import("../BackendDrivers").ApolloInternetAccount;
    } & {
        loadFeatures: (regions: import("@jbrowse/core/util").Region[]) => Promise<void>;
        loadRefSeq: (regions: import("@jbrowse/core/util").Region[]) => Promise<void>;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>, [undefined]>;
    apolloSelectedFeature: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IReferenceType<import("@jbrowse/mobx-state-tree").IModelType<{
        _id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        refSeq: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        min: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
        max: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
        strand: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ITypeUnion<1 | -1, 1 | -1, 1 | -1>>;
        children: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
        attributes: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>;
    }, {
        readonly length: number;
        readonly featureId: (import("@jbrowse/mobx-state-tree").IMSTArray<import("@jbrowse/mobx-state-tree").ISimpleType<string>> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>>) | undefined;
        readonly minWithChildren: number;
        readonly maxWithChildren: number;
        hasDescendant(featureId: string): boolean;
        readonly transcriptExonParts: import("@apollo-annotation/mst").TranscriptPart[];
        readonly transcriptParts: import("@apollo-annotation/mst").TranscriptPart[][];
    } & {
        readonly cdsLocations: import("@apollo-annotation/mst").TranscriptPartCoding[][];
    } & {
        setAttributes(attributes: Map<string, string[]>): void;
        setAttribute(key: string, value: string[]): void;
        setType(type: string): void;
        setRefSeq(refSeq: string): void;
        setMin(min: number): void;
        setMax(max: number): void;
        setStrand(strand?: 1 | -1): void;
        addChild(childFeature: import("@apollo-annotation/mst").AnnotationFeatureSnapshot): void;
        deleteChild(childFeatureId: string): void;
    } & {
        update({ children, max, min, refSeq, strand, }: {
            refSeq: string;
            min: number;
            max: number;
            strand?: 1 | -1;
            children?: import("@jbrowse/mobx-state-tree").SnapshotOrInstance<(import("@jbrowse/mobx-state-tree").IMSTMap<import("@jbrowse/mobx-state-tree").IAnyModelType> & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IAnyModelType>>>) | undefined>;
        }): void;
    } & {
        readonly parent: AnnotationFeature | undefined;
        readonly topLevelFeature: AnnotationFeature;
        readonly assemblyId: string;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>>;
    jobsManager: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{}, {
        readonly jobStatusWidget: import("../ApolloJobModel").JobsListModel;
    } & {
        update(jobName: string, statusMessage: string, progressPct?: number): void;
        abortJob(jobName: string, msg?: string): void;
        runJob(job: import("../ApolloJobModel").JobsEntry): void;
        done(job: import("../ApolloJobModel").JobsEntry): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>, [undefined]>;
    isLocked: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    changeInProgress: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}>>;
export type ApolloSessionStateModel = ReturnType<typeof extendSession>;
export interface ApolloSessionModel extends Instance<ApolloSessionStateModel> {
}
export {};
//# sourceMappingURL=session.d.ts.map