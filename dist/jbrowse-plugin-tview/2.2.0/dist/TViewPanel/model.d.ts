import type { TviewInit } from './init';
import type { FetchRegion, TviewSource } from '../LaunchTView/fetchTviewPlan';
import type { MenuItem } from '@jbrowse/core/ui';
import type { Instance } from '@jbrowse/mobx-state-tree';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export type { IKeyValueMap } from 'mobx';
type MaybeLGV = LinearGenomeViewModel | undefined;
export interface IRegion {
    refName: string;
    start: number;
    end: number;
}
export type { TviewInit } from './init';
/**
 * #stateModel TViewPlugin
 * extends
 * - MSAModel from https://github.com/GMOD/react-msaview
 */
export default function stateModelFactory(): import("@jbrowse/mobx-state-tree").IModelType<Omit<Omit<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
}, "height" | "id" | "type" | "data" | "autoTreeAreaWidth" | "drawLabels" | "drawNodeBubbles" | "drawTree" | "labelsAlignRight" | "showBranchLen" | "treeAreaWidth" | "treeWidth" | "bgColor" | "colorSchemeName" | "msaFormat" | "showColumnStats" | "allowedGappyness" | "colWidth" | "collapsed" | "currentAlignment" | "drawMsaLetters" | "featureFilters" | "gffFilehandle" | "hideGaps" | "highlightColumns" | "msaFilehandle" | "relativeTo" | "rowHeight" | "scrollX" | "scrollY" | "scrollZoom" | "showDomains" | "showOnly" | "subFeatureRows" | "treeFilehandle" | "treeMetadataFilehandle" | "turnedOffTracks"> & Omit<Omit<Omit<{}, "autoTreeAreaWidth" | "drawLabels" | "drawNodeBubbles" | "drawTree" | "labelsAlignRight" | "showBranchLen" | "treeAreaWidth" | "treeWidth"> & {
    drawLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    labelsAlignRight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    treeAreaWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    treeWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    showBranchLen: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    drawTree: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    drawNodeBubbles: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    autoTreeAreaWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}, "bgColor" | "colorSchemeName" | "msaFormat" | "showColumnStats"> & {
    bgColor: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    colorSchemeName: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    showColumnStats: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    msaFormat: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<import("react-msaview").MSAFormat>>;
}, "height" | "id" | "type" | "data" | "allowedGappyness" | "colWidth" | "collapsed" | "currentAlignment" | "drawMsaLetters" | "featureFilters" | "gffFilehandle" | "hideGaps" | "highlightColumns" | "msaFilehandle" | "relativeTo" | "rowHeight" | "scrollX" | "scrollY" | "scrollZoom" | "showDomains" | "showOnly" | "subFeatureRows" | "treeFilehandle" | "treeMetadataFilehandle" | "turnedOffTracks"> & {
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    showDomains: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    hideGaps: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    allowedGappyness: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    subFeatureRows: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"MsaView">;
    drawMsaLetters: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    scrollZoom: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    height: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    rowHeight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    scrollY: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    scrollX: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    colWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    treeFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "LocalPathLocation";
        localPath: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "UriLocation";
        uri: string;
        baseUri: string | undefined;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
            internetAccountType: string;
            authInfo: any;
        }> | undefined;
    }>, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | {
        locationType: "UriLocation";
        uri: string;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }> | undefined;
    }, ({
        blobId: string;
        locationType: "BlobLocation";
        name: string;
    } & Partial<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }>) | ({
        handleId: string;
        locationType: "FileHandleLocation";
        name: string;
    } & Partial<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }>) | ({
        localPath: string;
        locationType: "LocalPathLocation";
    } & Partial<{
        locationType: "LocalPathLocation";
        localPath: string;
    }>) | ({
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
    }>)>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "LocalPathLocation";
        localPath: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "UriLocation";
        uri: string;
        baseUri: string | undefined;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
            internetAccountType: string;
            authInfo: any;
        }> | undefined;
    }>, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    msaFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "LocalPathLocation";
        localPath: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "UriLocation";
        uri: string;
        baseUri: string | undefined;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
            internetAccountType: string;
            authInfo: any;
        }> | undefined;
    }>, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | {
        locationType: "UriLocation";
        uri: string;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }> | undefined;
    }, ({
        blobId: string;
        locationType: "BlobLocation";
        name: string;
    } & Partial<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }>) | ({
        handleId: string;
        locationType: "FileHandleLocation";
        name: string;
    } & Partial<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }>) | ({
        localPath: string;
        locationType: "LocalPathLocation";
    } & Partial<{
        locationType: "LocalPathLocation";
        localPath: string;
    }>) | ({
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
    }>)>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "LocalPathLocation";
        localPath: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "UriLocation";
        uri: string;
        baseUri: string | undefined;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
            internetAccountType: string;
            authInfo: any;
        }> | undefined;
    }>, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    treeMetadataFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "LocalPathLocation";
        localPath: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "UriLocation";
        uri: string;
        baseUri: string | undefined;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
            internetAccountType: string;
            authInfo: any;
        }> | undefined;
    }>, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | {
        locationType: "UriLocation";
        uri: string;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }> | undefined;
    }, ({
        blobId: string;
        locationType: "BlobLocation";
        name: string;
    } & Partial<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }>) | ({
        handleId: string;
        locationType: "FileHandleLocation";
        name: string;
    } & Partial<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }>) | ({
        localPath: string;
        locationType: "LocalPathLocation";
    } & Partial<{
        locationType: "LocalPathLocation";
        localPath: string;
    }>) | ({
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
    }>)>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "LocalPathLocation";
        localPath: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "UriLocation";
        uri: string;
        baseUri: string | undefined;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
            internetAccountType: string;
            authInfo: any;
        }> | undefined;
    }>, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    gffFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "LocalPathLocation";
        localPath: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "UriLocation";
        uri: string;
        baseUri: string | undefined;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
            internetAccountType: string;
            authInfo: any;
        }> | undefined;
    }>, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | {
        locationType: "UriLocation";
        uri: string;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }> | undefined;
    }, ({
        blobId: string;
        locationType: "BlobLocation";
        name: string;
    } & Partial<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }>) | ({
        handleId: string;
        locationType: "FileHandleLocation";
        name: string;
    } & Partial<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }>) | ({
        localPath: string;
        locationType: "LocalPathLocation";
    } & Partial<{
        locationType: "LocalPathLocation";
        localPath: string;
    }>) | ({
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
    }>)>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "LocalPathLocation";
        localPath: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "BlobLocation";
        name: string;
        blobId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "FileHandleLocation";
        name: string;
        handleId: string;
    }> | import("@jbrowse/mobx-state-tree").ModelCreationType<{
        locationType: "UriLocation";
        uri: string;
        baseUri: string | undefined;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelCreationType<{
            internetAccountType: string;
            authInfo: any;
        }> | undefined;
    }>, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    currentAlignment: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    collapsed: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>, [undefined]>;
    showOnly: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    turnedOffTracks: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>, [undefined]>;
    data: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{
        tree: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        msa: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        treeMetadata: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        gff: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    }, {
        setTree(tree?: string): void;
        setMSA(msa?: string): void;
        setTreeMetadata(treeMetadata?: string): void;
        setGFF(gff?: string): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, {
        tree: string | undefined;
        msa: string | undefined;
        treeMetadata: string | undefined;
        gff: string | undefined;
    }>, [undefined]>;
    featureFilters: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>, [undefined]>;
    relativeTo: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    highlightColumns: import("@jbrowse/mobx-state-tree").IType<number[] | undefined, number[] | undefined, number[] | undefined>;
}, "type" | "init" | "insertionWidths" | "arraySpans" | "connectedViewId" | "msaRegion" | "zoomToBaseLevel"> & {
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"TView">;
    /**
     * #property
     * LGV this pileup was launched from; drives highlights and click-to-nav
     */
    connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    /**
     * #property
     * what the view is: a locus, an assembly and the alignment files to
     * read it from. Everything else here is derived from it — see
     * `./init.ts` for why this one is kept rather than cleared
     */
    init: import("@jbrowse/mobx-state-tree").IType<TviewInit | undefined, TviewInit | undefined, TviewInit | undefined>;
    /**
     * #property
     * reference region the alignment columns span, filled in by the load
     */
    msaRegion: import("@jbrowse/mobx-state-tree").IType<IRegion | undefined, IRegion | undefined, IRegion | undefined>;
    /**
     * #property
     * [refPos, width] for every position where some read has an insertion
     */
    insertionWidths: import("@jbrowse/mobx-state-tree").IType<[number, number][] | null | undefined, [number, number][], [number, number][]>;
    /**
     * #property
     * [start, end, columns] for every tandem array laid out per copy
     */
    arraySpans: import("@jbrowse/mobx-state-tree").IType<[number, number, number][] | null | undefined, [number, number, number][], [number, number, number][]>;
    /**
     * #property
     */
    zoomToBaseLevel: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}, {
    width: number;
} & {
    menuItems(): MenuItem[];
} & {
    setDisplayName(name: string): void;
    setWidth(newWidth: number): void;
    setMinimized(flag: boolean): void;
} & {
    queueOfDialogs: [import("@jbrowse/core/util").DialogComponentType, any][];
} & {
    readonly DialogComponent: import("@jbrowse/core/util").DialogComponentType | undefined;
    readonly DialogProps: any;
} & {
    removeActiveDialog(): void;
    queueDialog(cb: (doneCallback: () => void) => [import("@jbrowse/core/util").DialogComponentType, unknown]): void;
} & {
    setTreeAreaWidth(n: number): void;
    setTreeWidth(n: number): void;
    setLabelsAlignRight(arg: boolean): void;
    setDrawTree(arg: boolean): void;
    setAutoTreeAreaWidth(arg: boolean): void;
    setShowBranchLen(arg: boolean): void;
    setDrawNodeBubbles(arg: boolean): void;
    setDrawLabels(arg: boolean): void;
} & {
    setColorSchemeName(name: string): void;
    setBgColor(arg: boolean): void;
    setShowColumnStats(arg: boolean): void;
    setMSAFormat(arg?: import("react-msaview").MSAFormat): void;
} & {
    headerHeight: number;
    status: {
        msg: string;
        url?: string;
        onCancel?: () => void;
    } | undefined;
    highResScaleFactor: number;
    loadingMSA: boolean;
    loadingTree: boolean;
    volatileWidth: number | undefined;
    resizeHandleWidth: number;
    blockSize: number;
    mouseRow: number | undefined;
    mouseCol: number | undefined;
    mouseClickRow: number | undefined;
    mouseClickCol: number | undefined;
    hoveredTreeNode: {
        nodeId: string;
        descendantNames: string[];
    } | undefined;
    highlightedColumns: number[] | undefined;
    minimapHeight: number;
    conservationTrackHeight: number;
    marginLeft: number;
    error: unknown;
    interProAnnotations: undefined | Record<string, import("react-msaview").InterProScanResults>;
} & {
    drawRelativeTo(id: string | undefined): void;
    setHideGaps(arg: boolean): void;
    setAllowedGappyness(arg: number): void;
    setLoadingMSA(arg: boolean): void;
    setLoadingTree(arg: boolean): void;
    setWidth(arg: number): void;
    setHighResScaleFactor(arg: number): void;
    setHeight(height: number): void;
    setError(error?: unknown): void;
    setMousePos(col?: number, row?: number): void;
    setHighlightedColumns(columns?: number[]): void;
    setShowDomains(arg: boolean): void;
    setSubFeatureRows(arg: boolean): void;
    setMouseClickPos(col?: number, row?: number): void;
    setRowHeight(n: number): void;
    setColWidth(n: number): void;
    setScrollY(n: number): void;
    setCurrentAlignment(n: number): void;
    toggleCollapsed(node: string): void;
    setShowOnly(node?: string): void;
    setData(data: {
        msa?: string;
        tree?: string;
        treeMetadata?: string;
        gff?: string;
    }): void;
    setMSAFilehandle(msaFilehandle?: import("@jbrowse/core/util").FileLocation): void;
    setTreeFilehandle(treeFilehandle?: import("@jbrowse/core/util").FileLocation): void;
    setGFFFilehandle(gffFilehandle?: import("@jbrowse/core/util").FileLocation): void;
    setMSA(result: string): void;
    setTree(result: string): void;
    setTreeMetadata(result: string): void;
} & {
    readonly hideGapsEffective: boolean;
    readonly realAllowedGappyness: number;
    readonly actuallyShowDomains: boolean;
    readonly viewInitialized: boolean;
    readonly width: number;
} & {
    extraViewMenuItems(): never[];
    readonly colorScheme: Record<string, string>;
    readonly header: Record<string, unknown> | {
        info: string;
        version: string | undefined;
    } | {
        General: Record<string, string[]>;
        Accessions: {
            [k: string]: string | undefined;
        };
        Dbxref: {
            [k: string]: string;
        };
    };
    readonly alignmentNames: string[];
    readonly noTree: boolean;
    readonly noDomains: boolean;
    menuItems(): never[];
    readonly treeMetadata: Record<string, Record<string, string> | undefined>;
    readonly MSA: import("react-msaview").MSAParserType | null;
    readonly numColumns: number;
    readonly tree: import("react-msaview").NodeWithIds;
    readonly rowNames: string[];
    readonly rowNamesSet: Map<string, number>;
    readonly mouseOverRowName: string | undefined;
    readonly hoveredInsertion: {
        rowName: string;
        col: number;
        letters: string;
    } | undefined;
    readonly root: import("react-msaview").HierarchyNode<import("react-msaview").NodeWithIds>;
    readonly msaAreaWidth: number;
    readonly treeAreaWidthMinusMargin: number;
    readonly blanks: number[];
    readonly blanksSet: Set<number>;
    readonly insertionPositions: Map<string, {
        pos: number;
        letters: string;
    }[]>;
    readonly rows: [string, string][];
    readonly numRows: number;
    readonly seqPosGlobalColIndex: Map<string, Int32Array<ArrayBuffer>>;
    readonly rowMap: Map<string, string>;
    readonly columns: Map<string, string>;
    readonly columns2d: string[];
    readonly fontSize: number;
    readonly colStats: import("react-msaview").ColumnCounts;
    readonly colStatsSums: Uint32Array<ArrayBufferLike>;
    readonly sequenceType: "dna" | "rna" | "amino";
    readonly colConsensus: {
        letter: string;
        color: string | undefined;
    }[];
    readonly colClustalX: Record<string, string>[];
    readonly conservation: number[];
    readonly propertyConservation: number[];
    readonly hierarchy: import("react-msaview").HierarchyNode<import("react-msaview").NodeWithIdsAndLength>;
    readonly totalHeight: number;
    readonly leaves: import("react-msaview").HierarchyNode<import("react-msaview").NodeWithIdsAndLength>[];
    readonly maxBranchLength: number;
    readonly maxDepthToLeaf: number;
    readonly allBranchesLength0: boolean;
    readonly showBranchLenEffective: boolean;
} & {
    readonly totalWidth: number;
} & {
    readonly dataInitialized: boolean;
    readonly blocksX: number[];
    readonly blocksY: number[];
} & {
    readonly blocks2d: (readonly [number, number])[];
    readonly isLoading: boolean;
    readonly maxScrollX: number;
    readonly maxScrollY: number;
    readonly showMsaLetters: boolean;
    readonly showTreeText: boolean;
} & {
    setDrawMsaLetters(arg: boolean): void;
    setScrollZoom(arg: boolean): void;
    setHoveredTreeNode(nodeId?: string): void;
    calculateNeighborJoiningTreeFromMSA(): void;
    resetZoom(): void;
    zoomOutHorizontal(): void;
    zoomInHorizontal(): void;
    zoomInVertical(): void;
    zoomOutVertical(): void;
    zoomIn(): void;
    zoomOut(): void;
    zoomToPos(scaleFactor: number, offsetX: number, offsetY: number): void;
    doScrollY(deltaY: number): void;
    setDomains(data?: Record<string, import("react-msaview").InterProScanResults>): void;
    applyGFFText(gffText: string): void;
    doScrollX(deltaX: number): void;
    setScrollX(n: number): void;
    toggleTrack(id: string): void;
    setStatus(status?: {
        msg: string;
        url?: string;
        onCancel?: () => void;
    }): void;
} & {
    readonly labelWidthMap: Map<string, number>;
    readonly labelsWidth: number;
    readonly secondaryStructureConsensus: string | undefined;
    readonly seqConsensus: string | undefined;
    readonly adapterTrackModels: import("react-msaview").BasicTrack[];
    readonly tracks: import("react-msaview").BasicTrack[];
    readonly turnedOnTracks: import("react-msaview").BasicTrack[];
    readonly showHorizontalScrollbar: boolean;
    visibleColToRowLetter(rowName: string, visibleCol: number): string | undefined;
    visibleColToSeqPos(rowName: string, visibleCol: number): number | undefined;
    visibleColToSeqPosOneBased(rowName: string, visibleCol: number): number | undefined;
    globalColToVisibleCol(globalCol: number): number | undefined;
    seqPosToGlobalCol(rowName: string, seqPos: number): number;
    seqPosToVisibleCol(rowName: string, seqPos: number): number | undefined;
} & {
    readonly msaAreaHeight: number;
    readonly totalTrackAreaHeight: number;
    readonly tidyInterProAnnotationTypes: Map<string, {
        id: string;
        name: string;
        accession: string;
        description: string;
        featureType: string | undefined;
        start: number;
        end: number;
        strand: number | undefined;
    }>;
    readonly tidyInterProAnnotations: {
        id: string;
        name: string;
        accession: string;
        description: string;
        featureType: string | undefined;
        start: number;
        end: number;
        strand: number | undefined;
    }[];
    readonly tidyFilteredInterProAnnotations: {
        id: string;
        name: string;
        accession: string;
        description: string;
        featureType: string | undefined;
        start: number;
        end: number;
        strand: number | undefined;
    }[];
    readonly tidyFilteredGatheredInterProAnnotations: Record<string, {
        id: string;
        name: string;
        accession: string;
        description: string;
        featureType: string | undefined;
        start: number;
        end: number;
        strand: number | undefined;
    }[]>;
} & {
    readonly showVerticalScrollbar: boolean;
} & {
    readonly verticalScrollbarWidth: 0 | 20;
    readonly segmentDomainTypes: {
        id: string;
        name: string;
        accession: string;
        description: string;
        featureType: string | undefined;
        start: number;
        end: number;
        strand: number | undefined;
    }[];
    readonly categoricalDomainTypes: {
        id: string;
        name: string;
        accession: string;
        description: string;
        featureType: string | undefined;
        start: number;
        end: number;
        strand: number | undefined;
    }[];
    readonly fillPalette: {
        [x: string]: string;
    };
    readonly strokePalette: {
        [k: string]: string;
    };
    readonly segmentLabels: Map<string, string>;
    readonly visibleDomainTypes: {
        id: string;
        name: string;
        accession: string;
        description: string;
        featureType: string | undefined;
        start: number;
        end: number;
        strand: number | undefined;
    }[];
    readonly domainBands: Map<string, import("react-msaview").DomainBand[]>;
    readonly domainBandsByStart: Map<string, import("react-msaview").DomainBand[]>;
    readonly mouseOverDomains: import("react-msaview").TidyDomainAnnotation[];
    readonly referenceRowIndex: number | undefined;
    readonly hoveredRowIndices: number[];
    readonly highlightedColumnRuns: {
        start: number;
        end: number;
    }[];
    readonly mouseOverColumnStats: {
        col: number;
        total: number;
        gaps: number;
        gapFraction: number;
        conservation: number;
        propertyConservation: number | undefined;
        consensusLetter: string;
        consensusCount: number;
        consensusFraction: number;
        distribution: [string, number][];
    } | undefined;
    getRowData(name: string): {
        data: {
            name?: string;
            accession?: string;
            dbxref?: string;
        } | undefined;
        treeMetadata: Record<string, string> | undefined;
    };
} & {
    setHeaderHeight(arg: number): void;
    setConservationTrackHeight(arg: number): void;
    reset(): void;
    exportSVG(opts: {
        theme: import("@mui/material").Theme;
        includeMinimap?: boolean;
        includeTracks?: boolean;
        exportType: "entire" | "viewport";
    }): Promise<void>;
    initFilter(arg: string): void;
    setFilter(arg: string, flag: boolean): void;
    fit(): void;
    fitVertically(): void;
    fitHorizontally(): void;
    afterCreate(): void;
} & {
    /**
     * #getter
     */
    readonly columnToRefPos: number[] | undefined;
    /**
     * #getter
     */
    readonly connectedView: MaybeLGV;
    /**
     * #getter
     * the region `init.loc` names, once the assembly can parse it
     */
    readonly initRegion: {
        assemblyName: string;
        refName: string;
        start: number;
        end: number;
    } | undefined;
    /**
     * #getter
     * the alignment files `init.tracks` names, once every one resolves. The
     * configs are read rather than the track models, so a tview outlives the
     * tracks it was launched from being closed.
     */
    readonly initSources: TviewSource[] | undefined;
} & {
    /**
     * #method
     */
    colToGenomeRegion(col: number): IRegion | undefined;
} & {
    /**
     * #getter
     * regions the connected LGV highlights: the hovered column plus the
     * sticky clicked column
     */
    readonly connectedHighlights: IRegion[];
} & {
    /** a load is in flight, or has failed and should not be retried */
    loading: boolean;
    loadFailed: boolean;
} & {
    /**
     * #action
     */
    setLoading(arg: boolean): void;
    /**
     * #action
     */
    setLoadFailed(arg: boolean): void;
    /**
     * #action
     */
    setInit(arg?: TviewInit): void;
    /**
     * #action
     */
    setMsaData(result: {
        msa: string;
        tree?: string;
        insertionWidths: [number, number][];
        arraySpans: [number, number, number][];
        region: IRegion;
    }): void;
    /**
     * #action
     */
    setZoomToBaseLevel(arg: boolean): void;
    /**
     * #action
     */
    navToColumn(col: number): void;
} & {
    /**
     * #action
     * builds the alignment `init` describes, from whatever `init` describes
     * it over. The one way an alignment ever gets here.
     */
    load(region: FetchRegion, sources: TviewSource[]): Promise<void>;
} & {
    afterCreate(): void;
} & {
    /**
     * #action
     */
    setMouseClickPos(col?: number, row?: number): void;
} & {
    /**
     * #method
     * overrides base
     */
    menuItems(): MenuItem[];
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
}> & {
    bgColor: boolean;
    colorSchemeName: string;
    showColumnStats: boolean;
    msaFormat: import("react-msaview").MSAFormat | undefined;
    drawLabels: boolean;
    labelsAlignRight: boolean;
    treeAreaWidth: number;
    treeWidth: number;
    showBranchLen: boolean;
    drawTree: boolean;
    drawNodeBubbles: boolean;
    autoTreeAreaWidth: boolean;
    id: string;
    showDomains: boolean;
    hideGaps: boolean;
    allowedGappyness: number;
    subFeatureRows: boolean;
    type: "MsaView";
    drawMsaLetters: boolean;
    scrollZoom: boolean;
    height: number;
    rowHeight: number;
    scrollY: number;
    scrollX: number;
    colWidth: number;
    treeFilehandle: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | {
        locationType: "UriLocation";
        uri: string;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }> | undefined;
    } | undefined;
    msaFilehandle: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | {
        locationType: "UriLocation";
        uri: string;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }> | undefined;
    } | undefined;
    treeMetadataFilehandle: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | {
        locationType: "UriLocation";
        uri: string;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }> | undefined;
    } | undefined;
    gffFilehandle: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | {
        locationType: "UriLocation";
        uri: string;
        internetAccountId: string | undefined;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }> | undefined;
    } | undefined;
    currentAlignment: number;
    collapsed: string[];
    showOnly: string | undefined;
    turnedOffTracks: import("mobx").IKeyValueMap<boolean>;
    featureFilters: import("mobx").IKeyValueMap<boolean>;
    relativeTo: string | undefined;
    highlightColumns: number[] | undefined;
    data: {
        tree?: string | undefined;
        msa?: string | undefined;
        treeMetadata?: string | undefined;
    };
} & import("@jbrowse/mobx-state-tree")._NotCustomized>;
export type JBrowsePluginTViewStateModel = ReturnType<typeof stateModelFactory>;
export type JBrowsePluginTViewModel = Instance<JBrowsePluginTViewStateModel>;
export declare function isTView(view: {
    type: string;
}): view is JBrowsePluginTViewModel;
