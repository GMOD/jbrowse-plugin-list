import { type AnnotationFeature } from '@apollo-annotation/mst';
import { type Instance, type SnapshotIn } from '@jbrowse/mobx-state-tree';
export declare const ApolloFeatureDetailsWidgetModel: import("@jbrowse/mobx-state-tree").IModelType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"ApolloFeatureDetailsWidget">;
    feature: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IReferenceType<import("@jbrowse/mobx-state-tree").IModelType<{
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
        readonly looksLikeGene: boolean;
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
    assembly: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    refName: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
}, {
    tryReload: string | undefined;
} & {
    setFeature(feature: AnnotationFeature): void;
    setTryReload(featureId?: string): void;
} & {
    afterAttach(): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export interface ApolloFeatureDetailsWidget extends Instance<typeof ApolloFeatureDetailsWidgetModel> {
}
export interface ApolloFeatureDetailsWidgetSnapshot extends SnapshotIn<typeof ApolloFeatureDetailsWidgetModel> {
}
export declare const ApolloTranscriptDetailsModel: import("@jbrowse/mobx-state-tree").IModelType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"ApolloTranscriptDetails">;
    feature: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IReferenceType<import("@jbrowse/mobx-state-tree").IModelType<{
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
        readonly looksLikeGene: boolean;
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
    assembly: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    refName: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
}, {
    tryReload: string | undefined;
} & {
    setFeature(feature: AnnotationFeature): void;
    setTryReload(featureId?: string): void;
} & {
    afterAttach(): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export interface ApolloTranscriptDetailsWidget extends Instance<typeof ApolloTranscriptDetailsModel> {
}
export interface ApolloTranscriptDetailsWidgetSnapshot extends SnapshotIn<typeof ApolloTranscriptDetailsModel> {
}
//# sourceMappingURL=model.d.ts.map