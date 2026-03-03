import type { StructureConnection } from './structureConnection';
import type { MafRegion, MsaViewInitState } from './types';
import type { Feature } from '@jbrowse/core/util';
import type { Instance } from '@jbrowse/mobx-state-tree';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
type LGV = LinearGenomeViewModel;
type MaybeLGV = LGV | undefined;
export interface IRegion {
    refName: string;
    start: number;
    end: number;
}
export interface BlastParams {
    baseUrl: string;
    blastDatabase: string;
    msaAlgorithm: string;
    blastProgram: string;
    selectedTranscript?: Feature;
    proteinSequence: string;
    rid?: string;
}
/**
 * #stateModel MsaViewPlugin
 * extends
 * - MSAModel from https://github.com/GMOD/react-msaview
 */
export default function stateModelFactory(): import("@jbrowse/mobx-state-tree").IModelType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
} & {
    drawLabels: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    labelsAlignRight: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    treeAreaWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    treeWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    treeWidthMatchesArea: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showBranchLen: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    drawTree: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    drawNodeBubbles: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
} & {
    bgColor: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    colorSchemeName: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
} & {
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    showDomains: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    hideGaps: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    allowedGappyness: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    contrastLettering: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    subFeatureRows: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"MsaView">;
    drawMsaLetters: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    height: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    rowHeight: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    scrollY: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    scrollX: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    colWidth: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    treeFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>>, {
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
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | ({
        locationType: "UriLocation";
        uri: string;
    } & Partial<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject)>, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    msaFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>>, {
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
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | ({
        locationType: "UriLocation";
        uri: string;
    } & Partial<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject)>, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    treeMetadataFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>>, {
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
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | ({
        locationType: "UriLocation";
        uri: string;
    } & Partial<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject)>, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    gffFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>>, {
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
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | ({
        locationType: "UriLocation";
        uri: string;
    } & Partial<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject)>, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    currentAlignment: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    collapsed: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    collapsedLeaves: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    showOnly: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    turnedOffTracks: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
    data: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{
        tree: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        msa: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        treeMetadata: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    }, {
        setTree(tree?: string): void;
        setMSA(msa?: string): void;
        setTreeMetadata(treeMetadata?: string): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, {
        tree: string | undefined;
        msa: string | undefined;
        treeMetadata: string | undefined;
    }>, [undefined]>;
    featureFilters: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
    relativeTo: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
} & {
    connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    connectedFeature: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
    connectedHighlights: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
        refName: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        start: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
        end: import("@jbrowse/mobx-state-tree").ISimpleType<number>;
    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    blastParams: import("@jbrowse/mobx-state-tree").IType<BlastParams | undefined, BlastParams | undefined, BlastParams | undefined>;
    querySeqName: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
    uniprotId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    zoomToBaseLevel: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    init: import("@jbrowse/mobx-state-tree").IType<MsaViewInitState | undefined, MsaViewInitState | undefined, MsaViewInitState | undefined>;
    connectedStructures: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<StructureConnection, StructureConnection, StructureConnection>>;
    dataStoreId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    mafRegion: import("@jbrowse/mobx-state-tree").IType<MafRegion | undefined, MafRegion | undefined, MafRegion | undefined>;
}, {
    width: number;
} & {
    menuItems(): import("@jbrowse/core/ui").MenuItem[];
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
    setTreeWidthMatchesArea(arg: boolean): void;
    setTreeAreaWidth(n: number): void;
    setTreeWidth(n: number): void;
    setLabelsAlignRight(arg: boolean): void;
    setDrawTree(arg: boolean): void;
    setShowBranchLen(arg: boolean): void;
    setDrawNodeBubbles(arg: boolean): void;
    setDrawLabels(arg: boolean): void;
} & {
    setColorSchemeName(name: string): void;
    setBgColor(arg: boolean): void;
} & {
    headerHeight: number;
    status: {
        msg: string;
        url?: string;
    } | undefined;
    highResScaleFactor: number;
    showZoomStar: boolean;
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
    nref: number;
    minimapHeight: number;
    conservationTrackHeight: number;
    marginLeft: number;
    error: unknown;
    annotPos: {
        left: number;
        right: number;
    } | undefined;
    interProAnnotations: undefined | Record<string, import("react-msaview").InterProScanResults>;
} & {
    drawRelativeTo(id: string | undefined): void;
    setHideGaps(arg: boolean): void;
    setAllowedGappyness(arg: number): void;
    setContrastLettering(arg: boolean): void;
    setLoadingMSA(arg: boolean): void;
    setShowZoomStar(arg: boolean): void;
    setLoadingTree(arg: boolean): void;
    setWidth(arg: number): void;
    setHeight(height: number): void;
    setError(error?: unknown): void;
    setMousePos(col?: number, row?: number): void;
    setHoveredTreeNode(nodeId?: string): void;
    setHighlightedColumns(columns?: number[]): void;
    setShowDomains(arg: boolean): void;
    setSubFeatureRows(arg: boolean): void;
    setMouseClickPos(col?: number, row?: number): void;
    setRowHeight(n: number): void;
    setColWidth(n: number): void;
    setScrollY(n: number): void;
    setCurrentAlignment(n: number): void;
    toggleCollapsed(node: string): void;
    toggleCollapsedLeaf(node: string): void;
    setShowOnly(node?: string): void;
    setData(data: {
        msa?: string;
        tree?: string;
        treeMetadata?: string;
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
    readonly header: {};
    readonly alignmentNames: string[];
    readonly noTree: boolean;
    readonly noDomains: boolean;
    menuItems(): never[];
    readonly treeMetadata: any;
    readonly MSA: import("msa-parsers").StockholmMSA | import("msa-parsers").A3mMSA | import("msa-parsers").FastaMSA | import("msa-parsers").EmfMSA | import("msa-parsers").ClustalMSA | null;
    readonly numColumns: number;
    readonly tree: import("react-msaview").NodeWithIds;
    readonly rowNames: string[];
    readonly mouseOverRowName: string | undefined;
    readonly hoveredInsertion: {
        rowName: string;
        col: number;
        letters: string;
    } | undefined;
    readonly root: HierarchyNode<import("react-msaview").NodeWithIds>;
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
    readonly rowMap: Map<string, string>;
    readonly columns: {
        [k: string]: string;
    };
    readonly columns2d: string[];
    readonly fontSize: number;
    readonly colStats: Record<string, number>[];
    readonly colStatsSums: number[];
    readonly sequenceType: "dna" | "rna" | "amino";
    readonly colConsensus: {
        letter: string;
        color: string | undefined;
    }[];
    readonly colClustalX: Record<string, string>[];
    readonly conservation: number[];
    readonly hierarchy: HierarchyNode<import("react-msaview").NodeWithIdsAndLength>;
    readonly totalHeight: number;
    readonly leaves: HierarchyNode<import("react-msaview").NodeWithIdsAndLength>[];
    readonly allBranchesLength0: boolean;
    readonly showBranchLenEffective: boolean;
} & {
    readonly totalWidth: number;
} & {
    readonly dataInitialized: boolean | "" | undefined;
    readonly blocksX: number[];
    readonly blocksY: number[];
} & {
    readonly blocks2d: (readonly [number, number])[];
    readonly isLoading: boolean;
    readonly maxScrollX: number;
    readonly showMsaLetters: boolean;
    readonly showTreeText: boolean;
} & {
    setDrawMsaLetters(arg: boolean): void;
    calculateNeighborJoiningTreeFromMSA(): void;
    resetZoom(): void;
    zoomOutHorizontal(): void;
    zoomInHorizontal(): void;
    zoomInVertical(): void;
    zoomOutVertical(): void;
    zoomIn(): void;
    zoomOut(): void;
    setInterProAnnotations(data: Record<string, import("react-msaview").InterProScanResults>): void;
    doScrollY(deltaY: number): void;
    doScrollX(deltaX: number): void;
    setScrollX(n: number): void;
    toggleTrack(id: string): void;
    setStatus(status?: {
        msg: string;
        url?: string;
    }): void;
} & {
    readonly labelsWidth: number;
    readonly secondaryStructureConsensus: string | undefined;
    readonly seqConsensus: string | undefined;
    readonly adapterTrackModels: import("react-msaview").BasicTrack[];
    readonly tracks: import("react-msaview").BasicTrack[];
    readonly turnedOnTracks: import("react-msaview").BasicTrack[];
    readonly showHorizontalScrollbar: boolean;
    readonly rowNamesSet: Map<string, number>;
    visibleColToRowLetter(rowName: string, visibleCol: number): string | undefined;
    visibleColToSeqPos(rowName: string, visibleCol: number): number | undefined;
    visibleColToSeqPosOneBased(rowName: string, visibleCol: number): number | undefined;
    globalColToVisibleCol(globalCol: number): number | undefined;
    seqPosToGlobalCol(rowName: string, seqPos: number): number;
    seqPosToVisibleCol(rowName: string, seqPos: number): number | undefined;
} & {
    readonly msaAreaHeight: number;
    readonly totalTrackAreaHeight: number;
    readonly tidyInterProAnnotationTypes: Map<string, import("react-msaview").Accession>;
    readonly tidyInterProAnnotations: {
        id: string;
        name: string;
        accession: string;
        description: string;
        start: number;
        end: number;
    }[];
    readonly tidyFilteredInterProAnnotations: {
        id: string;
        name: string;
        accession: string;
        description: string;
        start: number;
        end: number;
    }[];
    readonly tidyFilteredGatheredInterProAnnotations: Record<string, {
        id: string;
        name: string;
        accession: string;
        description: string;
        start: number;
        end: number;
    }[]>;
} & {
    readonly showVerticalScrollbar: boolean;
} & {
    readonly verticalScrollbarWidth: 0 | 20;
    readonly fillPalette: {
        [k: string]: string;
    };
    readonly strokePalette: {
        [k: string]: string;
    };
    getRowData(name: string): {
        data: {
            name: string;
            accession: string | undefined;
            dbxref: string | undefined;
        } | undefined;
        treeMetadata: any;
    };
} & {
    setHeaderHeight(arg: number): void;
    setConservationTrackHeight(arg: number): void;
    reset(): void;
    exportSVG(opts: {
        theme: import("@mui/material").Theme;
        includeMinimap?: boolean;
        includeTracks?: boolean;
        exportType: string;
    }): Promise<void>;
    incrementRef(): void;
    initFilter(arg: string): void;
    setFilter(arg: string, flag: boolean): void;
    fit(): void;
    fitVertically(): void;
    fitHorizontally(): void;
    afterCreate(): void;
} & {
    /**
     * #volatile
     */
    rid: string | undefined;
    /**
     * #volatile
     */
    progress: string;
    /**
     * #volatile
     */
    error: unknown;
    /**
     * #volatile
     * True when loading MSA data from IndexedDB
     */
    loadingStoredData: boolean;
} & {
    /**
     * #method
     * Get a row by name, returns [name, sequence] or undefined
     */
    getRowByName(rowName: string): [string, string] | undefined;
    /**
     * #method
     * Get the sequence for a row by name
     */
    getSequenceByRowName(rowName: string): string | undefined;
} & {
    /**
     * #getter
     */
    readonly transcriptToMsaMap: {
        g2p: Record<number, number>;
        p2g: Record<number, number>;
        refName: string;
        strand: number;
    } | undefined;
    /**
     * #getter
     */
    readonly processing: boolean;
    /**
     * #getter
     */
    readonly connectedView: MaybeLGV;
    /**
     * #getter
     * Get connected protein views with their full model references
     */
    readonly connectedProteinViews: (StructureConnection & {
        proteinView: any;
    })[];
} & {
    /**
     * #getter
     * Get the MSA column that corresponds to the currently hovered structure position
     * Returns the first match from any connected structure
     */
    readonly structureHoverCol: number | undefined;
} & {
    /**
     * #getter
     * Returns a secondary highlight column from either:
     * 1. Structure hover (from connected protein 3D view)
     * 2. Genome hover (from connected linear genome view)
     */
    readonly mouseCol2: number | undefined;
    /**
     * #getter
     */
    readonly clickCol2: undefined;
} & {
    /**
     * #action
     */
    setZoomToBaseLevel(arg: boolean): void;
    /**
     * #action
     */
    setError(e: unknown): void;
    /**
     * #action
     */
    setProgress(arg: string): void;
    /**
     * #action
     */
    setRid(arg: string): void;
    /**
     * #action
     */
    setConnectedHighlights(r: IRegion[]): void;
    /**
     * #action
     */
    addToConnectedHighlights(r: IRegion): void;
    /**
     * #action
     */
    clearConnectedHighlights(): void;
    /**
     * #action
     */
    setBlastParams(args?: BlastParams): void;
    /**
     * #action
     */
    setInit(arg?: MsaViewInitState): void;
    /**
     * #action
     */
    setQuerySeqName(arg: string): void;
    /**
     * #action
     */
    setUniprotId(arg?: string): void;
    /**
     * #action
     */
    setDataStoreId(arg?: string): void;
    /**
     * #action
     */
    setMafRegion(arg?: MafRegion): void;
    /**
     * #action
     */
    setLoadingStoredData(arg: boolean): void;
    /**
     * #action
     */
    handleMsaClick(coord: number): void;
    /**
     * #action
     * Connect to a protein structure for synchronized highlighting
     */
    connectToStructure(proteinViewId: string, structureIdx: number, msaRowName?: string): void;
    /**
     * #action
     * Disconnect from a protein structure
     */
    disconnectFromStructure(proteinViewId: string, structureIdx: number): void;
    /**
     * #action
     * Disconnect from all protein structures
     */
    disconnectAllStructures(): void;
} & {
    /**
     * #action
     * overrides base setMouseClickPos to trigger navigation
     */
    setMouseClickPos(col?: number, row?: number): void;
} & {
    /**
     * #method
     * overrides base
     */
    extraViewMenuItems(): ({
        label: string;
        checked: boolean;
        type: string;
        onClick: () => void;
    } | {
        label: string;
        onClick: () => void;
        checked?: undefined;
        type?: undefined;
    })[];
} & {
    afterCreate(): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, {
    id: string;
    displayName: string | undefined;
    minimized: boolean;
} & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & Omit<import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
    drawLabels: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    labelsAlignRight: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    treeAreaWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    treeWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    treeWidthMatchesArea: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showBranchLen: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    drawTree: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    drawNodeBubbles: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
} & {
    bgColor: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    colorSchemeName: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
} & {
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    showDomains: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    hideGaps: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    allowedGappyness: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    contrastLettering: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    subFeatureRows: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"MsaView">;
    drawMsaLetters: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    height: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    rowHeight: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    scrollY: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    scrollX: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    colWidth: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    treeFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>>, {
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
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | ({
        locationType: "UriLocation";
        uri: string;
    } & Partial<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject)>, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    msaFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>>, {
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
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | ({
        locationType: "UriLocation";
        uri: string;
    } & Partial<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject)>, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    treeMetadataFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>>, {
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
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | ({
        locationType: "UriLocation";
        uri: string;
    } & Partial<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject)>, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    gffFilehandle: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISnapshotProcessor<import("@jbrowse/mobx-state-tree").ITypeUnion<import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>> | import("@jbrowse/mobx-state-tree").ModelCreationType<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>>, {
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
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }>, import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | import("@jbrowse/mobx-state-tree").ModelInstanceType<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}> | ({
        locationType: "UriLocation";
        uri: string;
    } & Partial<import("@jbrowse/mobx-state-tree/dist/internal").ExtractCFromProps<{
        locationType: import("@jbrowse/mobx-state-tree").ISimpleType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>> & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject)>, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    currentAlignment: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    collapsed: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    collapsedLeaves: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    showOnly: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    turnedOffTracks: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
    data: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IModelType<{
        tree: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        msa: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        treeMetadata: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    }, {
        setTree(tree?: string): void;
        setMSA(msa?: string): void;
        setTreeMetadata(treeMetadata?: string): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, {
        tree: string | undefined;
        msa: string | undefined;
        treeMetadata: string | undefined;
    }>, [undefined]>;
    featureFilters: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
    relativeTo: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
}>, symbol> & import("@jbrowse/mobx-state-tree")._NotCustomized>;
export type JBrowsePluginMsaViewStateModel = ReturnType<typeof stateModelFactory>;
export type JBrowsePluginMsaViewModel = Instance<JBrowsePluginMsaViewStateModel>;
export { type MafRegion, type MsaViewInitState } from './types';
