import type { TviewInit } from './init';
import type { ModificationSummary } from './modifications';
import type { TviewPlanResult } from '../LaunchTView/TviewGetPlanRpc/TviewGetPlan';
import type { FetchRegion, TviewSource } from '../LaunchTView/fetchTviewPlan';
import type { TviewModifications } from '../LaunchTView/modifications';
import type { MenuItem } from '@jbrowse/core/ui';
import type { Instance } from '@jbrowse/mobx-state-tree';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
import type { Highlight, RowPanelSpec, RowTransform } from 'react-msaview';
export type { IKeyValueMap } from 'mobx';
type MaybeLGV = LinearGenomeViewModel | undefined;
export interface IRegion {
    refName: string;
    start: number;
    end: number;
}
export type { TviewInit } from './init';
/** the load the view last started, and the `init` it was started for */
export type LoadState = {
    key: string;
} & ({
    status: 'loading';
} | {
    status: 'loaded';
} | {
    status: 'failed';
    error: unknown;
});
/** what the panel shows in place of the alignment, or that it shows it */
export type TViewState = {
    kind: 'alignment';
} | {
    kind: 'loading';
    message: string;
} | {
    kind: 'notice';
    message: string;
} | {
    kind: 'error';
    error: unknown;
    retry: boolean;
};
/**
 * #stateModel TViewPlugin
 * extends
 * - MSAModel from https://github.com/GMOD/react-msaview
 */
export default function stateModelFactory(): import("@jbrowse/mobx-state-tree").IModelType<Omit<Omit<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}, "height" | "id" | "type" | "region" | "selection" | "scrollZoom" | "highlights" | "features" | "data" | "colWidth" | "rowHeight" | "labelsAlignRight" | "residueColor" | "consensusInGaps" | "keepReferenceColumns" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth" | "msaFormat" | "showColumnStats" | "allowedGappyness" | "clades" | "cladesSeeded" | "collapsed" | "columnTracks" | "currentAlignment" | "drawMsaLetters" | "embeddedMode" | "encodings" | "gffFilehandle" | "hiddenCategories" | "hideGaps" | "highlightColumns" | "marks" | "msaFilehandle" | "relativeTo" | "residueMappings" | "rotated" | "rowCoordinates" | "rowPanels" | "rowTransform" | "scrollX" | "scrollY" | "scrollZoomAxis" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "trimToSelection" | "turnedOffFeatures" | "turnedOffTracks"> & Omit<Omit<Omit<{}, "labelsAlignRight" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth"> & {
    drawLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    labelsAlignRight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    treeAreaWidth: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
    treeWidth: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
    showBranchLen: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    treeOrder: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<import("react-msaview").TreeOrder>, [undefined]>;
    drawTree: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    drawNodeBubbles: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    drawNodeLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    showTreeOverview: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    overviewHeight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
}, "residueColor" | "msaFormat" | "showColumnStats"> & {
    residueColor: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ResidueColor, import("react-msaview").ResidueColor, import("react-msaview").ResidueColor>, [undefined]>;
    showColumnStats: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    msaFormat: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<import("react-msaview").MSAFormat>>;
}, "height" | "id" | "type" | "region" | "selection" | "scrollZoom" | "highlights" | "features" | "data" | "colWidth" | "rowHeight" | "consensusInGaps" | "keepReferenceColumns" | "allowedGappyness" | "clades" | "cladesSeeded" | "collapsed" | "columnTracks" | "currentAlignment" | "drawMsaLetters" | "embeddedMode" | "encodings" | "gffFilehandle" | "hiddenCategories" | "hideGaps" | "highlightColumns" | "marks" | "msaFilehandle" | "relativeTo" | "residueMappings" | "rotated" | "rowCoordinates" | "rowPanels" | "rowTransform" | "scrollX" | "scrollY" | "scrollZoomAxis" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "trimToSelection" | "turnedOffFeatures" | "turnedOffTracks"> & {
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    showDomains: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    showDomainLegend: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    hideGaps: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    trimToSelection: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    allowedGappyness: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    subFeatureRows: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ILiteralType<"MsaView">;
    drawMsaLetters: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    embeddedMode: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    scrollZoom: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    scrollZoomAxis: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<"both" | "horizontal" | "vertical">, [undefined]>;
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
    }, import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
    }, import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
    }, import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
    }, import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
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
    rotated: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>, [undefined]>;
    treeRoot: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").TreeRoot | undefined, import("react-msaview").TreeRoot | undefined, import("react-msaview").TreeRoot | undefined>;
    showOnly: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    cladesSeeded: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    turnedOffTracks: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>, [undefined]>;
    trackHeights: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<number>>, [undefined]>;
    columnTracks: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ColumnTrackSpec, import("react-msaview").ColumnTrackSpec, import("react-msaview").ColumnTrackSpec>>, [undefined]>;
    residueMappings: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ResidueMapping, import("react-msaview").ResidueMapping, import("react-msaview").ResidueMapping>>, [undefined]>;
    rowCoordinates: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").RowCoordinates, import("react-msaview").RowCoordinates, import("react-msaview").RowCoordinates>>, [undefined]>;
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
        [k: string]: string | undefined;
    }>, [undefined]>;
    turnedOffFeatures: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>, [undefined]>;
    relativeTo: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    consensusInGaps: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    keepReferenceColumns: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    highlightColumns: import("@jbrowse/mobx-state-tree").IType<number[] | undefined, number[] | undefined, number[] | undefined>;
    highlights: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<Highlight, Highlight, Highlight>>, [undefined]>;
    features: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Feature, import("react-msaview").Feature, import("react-msaview").Feature>>, [undefined]>;
    selection: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").MsaSelection | undefined, import("react-msaview").MsaSelection | undefined, import("react-msaview").MsaSelection | undefined>;
    region: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Region | undefined, import("react-msaview").Region | undefined, import("react-msaview").Region | undefined>;
    clades: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Clade, import("react-msaview").Clade, import("react-msaview").Clade>>, [undefined]>;
    encodings: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Encoding, import("react-msaview").Encoding, import("react-msaview").Encoding>>, [undefined]>;
    hiddenCategories: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").HiddenCategory, import("react-msaview").HiddenCategory, import("react-msaview").HiddenCategory>>, [undefined]>;
    rowPanels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<RowPanelSpec, RowPanelSpec, RowPanelSpec>>, [undefined]>;
    rowTransform: import("@jbrowse/mobx-state-tree").IType<RowTransform | undefined, RowTransform | undefined, RowTransform | undefined>;
    marks: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").AlignmentFeaturesSpec[] | undefined, import("react-msaview").AlignmentFeaturesSpec[] | undefined, import("react-msaview").AlignmentFeaturesSpec[] | undefined>;
}, "type" | "init" | "connectedViewId" | "zoomToBaseLevel"> & {
    type: import("@jbrowse/mobx-state-tree").ILiteralType<"TView">;
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
     */
    zoomToBaseLevel: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}, {
    width: number;
    problems: readonly import("@jbrowse/core/util").ViewProblem[];
    bodyMounted: boolean;
} & {
    readonly rendersDisplays: boolean;
    readonly effectiveBodyMounted: boolean;
    menuItems(): MenuItem[];
    readonly ownTracks: import("@jbrowse/core/util").AbstractTrackModel[];
    readonly ownViews: import("@jbrowse/core/util").AbstractViewModel[];
} & {
    addProblem(problem: import("@jbrowse/core/util").ViewProblem): void;
    setDisplayName(name: string): void;
    setWidth(newWidth: number): void;
    setBodyMounted(flag: boolean): void;
    setMinimized(flag: boolean): void;
} & {
    queueOfDialogs: [import("@jbrowse/core/util").DialogComponentType, Record<string, unknown>][];
} & {
    readonly DialogComponent: import("@jbrowse/core/util").DialogComponentType | undefined;
    readonly DialogProps: Record<string, unknown> | undefined;
} & {
    removeActiveDialog(): void;
    queueDialog<T extends import("@jbrowse/core/util").DialogComponentType>(cb: (doneCallback: () => void) => [T, import("react").ComponentProps<T>]): void;
} & {
    setTreeAreaWidth(n: number | undefined): void;
    setTreeWidth(n: number | undefined): void;
    setLabelsAlignRight(arg: boolean): void;
    setDrawTree(arg: boolean): void;
    setShowBranchLen(arg: boolean): void;
    setTreeOrder(order: import("react-msaview").TreeOrder): void;
    setDrawNodeBubbles(arg: boolean): void;
    setDrawNodeLabels(arg: boolean): void;
    setShowTreeOverview(arg: boolean): void;
    setDrawLabels(arg: boolean): void;
} & {
    setResidueColor(color: import("react-msaview").ResidueColor): void;
    setShowColumnStats(arg: boolean): void;
    setMSAFormat(arg?: import("react-msaview").MSAFormat): void;
} & {
    headerHeight: number;
    heldTrimSpan: {
        start: number;
        end: number;
    } | undefined;
    availableHeight: number | undefined;
    settingsOpen: boolean;
    zoomHeld: {
        col: number;
        row: number;
    };
    hideHeader: boolean;
    importForm: boolean;
    status: {
        msg: string;
        onCancel?: () => void;
    } | undefined;
    highResScaleFactor: number;
    zoomSnapshot: import("react-msaview").ZoomSnapshot | undefined;
    loadingMSA: boolean;
    loadingTree: boolean;
    volatileWidth: number | undefined;
    resizeHandleWidth: number;
    blockSize: number;
    mouseRow: number | undefined;
    mouseCol: number | undefined;
    hoveredHighlight: string | undefined;
    mouseClickRow: number | undefined;
    mouseClickCol: number | undefined;
    hoveredTreeNode: {
        nodeId: string;
        descendantNames: string[];
    } | undefined;
    highlightedColumns: number[] | undefined;
    transientHighlights: Record<string, Highlight[]>;
    minimapHeight: number;
    marginLeft: number;
    error: unknown;
    loadWarnings: string[];
    dismissedWarnings: string[];
    resetCount: number;
    hostCarriesData: boolean;
    annotations: import("react-msaview").Annotation[];
} & {
    drawRelativeTo(id: string | undefined): void;
    setConsensusInGaps(arg: boolean): void;
    setKeepReferenceColumns(arg: boolean): void;
    setHideGaps(arg: boolean): void;
    setTrimToSelection(arg: boolean): void;
    setAllowedGappyness(arg: number): void;
    setLoadingMSA(arg: boolean): void;
    setLoadingTree(arg: boolean): void;
    setWidth(arg: number): void;
    setSettingsOpen(arg: boolean): void;
    setHighResScaleFactor(arg: number): void;
    setHeight(height: number): void;
    setAvailableHeight(height?: number): void;
    setError(error?: unknown): void;
    addWarning(warning: string): void;
    setHostCarriesData(arg: boolean): void;
    setMousePos(col?: number, row?: number): void;
    setHoveredHighlight(key?: string): void;
    setHighlightedColumns(columns?: number[]): void;
    setRegion(region?: import("react-msaview").Region): void;
    setHighlights(highlights: Highlight[]): void;
    setFeatures(features: import("react-msaview").Feature[]): void;
    setSelection(selection?: import("react-msaview").MsaSelection): void;
    clearSelection(): void;
    setHeldTrimSpan(span?: {
        start: number;
        end: number;
    }): void;
    setClades(clades: import("react-msaview").Clade[]): void;
    applyHighlight(owner: string, highlights: Highlight[]): void;
    clearHighlight(owner: string): void;
    setShowDomains(arg: boolean): void;
    setCellFill(mode: "residue" | "domain" | "none"): void;
    setShowDomainLegend(arg: boolean): void;
    setSubFeatureRows(arg: boolean): void;
    setMouseClickPos(col?: number, row?: number): void;
    setRowHeight(n: number): void;
    setColWidth(n: number): void;
    setCurrentAlignment(n: number): void;
    toggleCollapsed(node: string): void;
    toggleRotated(node: string): void;
    clearRotated(): void;
    clearNodeState(): void;
    setTreeRoot(treeRoot?: import("react-msaview").TreeRoot): void;
    setShowOnly(node?: string): void;
    setData(data: {
        msa?: string;
        tree?: string;
        treeMetadata?: string;
        gff?: string;
    }): void;
    setMSAFilehandle(msaFilehandle?: import("@jbrowse/core/util").FileLocation): void;
    setTreeFilehandle(treeFilehandle?: import("@jbrowse/core/util").FileLocation): void;
    setTreeMetadataFilehandle(treeMetadataFilehandle?: import("@jbrowse/core/util").FileLocation): void;
    setGFFFilehandle(gffFilehandle?: import("@jbrowse/core/util").FileLocation): void;
    setMSA(result: string): void;
    setTree(result: string): void;
    setTreeMetadata(result: string): void;
    setGFF(result?: string): void;
} & {
    readonly hideGapsEffective: boolean;
    readonly alignmentMarks: import("react-msaview").AlignmentMark[];
    readonly markProblems: import("react-msaview").MarkProblem[];
    readonly colorRecords: import("react-msaview").ColorRecord[];
    readonly activeHiddenCategories: import("react-msaview").HiddenValues;
    annotationHidden(annotation: import("react-msaview").Annotation): boolean;
    readonly hostRestoresData: boolean;
    readonly viewInitialized: boolean;
    readonly width: number;
} & {
    readonly resolvedResidueColor: {
        channel: "color" | "fill";
        field: "feature" | "residue";
        scheme: string;
        letters: {
            [k: string]: string;
        } | undefined;
    };
    readonly colorScheme: Record<string, string>;
    readonly dynamicColorSchemeName: string | undefined;
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
    readonly unshareableData: import("react-msaview").UnshareableData[];
    menuItems(): never[];
    readonly rowData: Record<string, Record<string, string> | undefined>;
    rowDataOf(name: string): Record<string, string> | undefined;
    readonly rowLabelField: string;
    rowLabelOf(name: string): string;
    readonly rowFields: string[];
    readonly MSA: import("react-msaview").MSAParserType | null;
    readonly allAnnotations: import("react-msaview").Annotation[];
    readonly actuallyShowDomains: boolean;
    readonly numColumns: number;
    readonly selectionFileSpan: {
        start: number;
        end: number;
    } | undefined;
    readonly trimSpan: {
        start: number;
        end: number;
    } | undefined;
    readonly inputTree: import("react-msaview").NodeWithIds;
    readonly tree: import("react-msaview").NodeWithIds;
    readonly filteredTree: import("react-msaview").NodeWithIds | undefined;
    readonly arrangedTree: import("react-msaview").NodeWithIds;
    readonly facetClades: import("react-msaview").Clade[];
    readonly facetBandsNotClades: string[];
    readonly arrangedHierarchy: import("react-msaview").HierarchyNode<import("react-msaview").NodeWithIds>;
    readonly rowNames: string[];
    readonly rowNamesSet: Map<string, number>;
    readonly resolvedClades: import("react-msaview").ResolvedClade[];
    readonly cladeGutterWidth: number;
    readonly treeDrawn: boolean;
    readonly treeTips: {
        names: string[];
        depth: number;
    };
    readonly treeHierarchy: import("react-msaview").HierarchyNode<import("react-msaview").NodeWithIds>;
    readonly maxTipLabelWidth: number;
    readonly labelColumnWidth: number;
    readonly fittedTreeAreaWidth: number;
    readonly effectiveHeight: number;
    readonly effectiveTreeAreaWidth: number;
    readonly effectiveTreeWidth: number;
    readonly showTreeText: boolean;
    readonly mouseOverRowName: string | undefined;
    readonly hoveredInsertion: {
        rowName: string;
        col: number;
        letters: string;
    } | undefined;
    readonly root: import("react-msaview").HierarchyNode<import("react-msaview").NodeWithIds>;
    readonly treeNewick: string;
    readonly treeOverviewHeight: number;
    readonly treeOverviewLayout: {
        root: import("react-msaview").LaidOutNode<import("react-msaview").NodeWithIds>;
        numTips: number;
        maxDepthToLeaf: number;
        showBranchLen: boolean;
    } | undefined;
    readonly treeOverviewClades: import("react-msaview").ResolvedClade[];
    readonly treeOverviewFocusRows: [number, number] | undefined;
    treeOverviewHit(y: number): {
        id: string;
        rows: [number, number];
    } | undefined;
    readonly rowPanelsWidth: number;
    readonly rowPanelsHeaderHeight: 0 | 56;
    readonly msaAreaWidth: number;
    readonly treeAreaWidthMinusMargin: number;
    readonly gappyColumns: number[];
    readonly blanks: number[];
    readonly insertionPositions: Map<string, {
        pos: number;
        letters: string;
    }[]>;
    readonly rows: [string, string][];
    readonly numRows: number;
    seqPosIndex(rowName: string): Int32Array | undefined;
    rowSequence(name: string): string | undefined;
    readonly rowMap: Map<string, string>;
    readonly columns: Map<string, string>;
    readonly columns2d: string[];
    readonly fontSize: number;
    readonly colStats: import("react-msaview").ColumnCounts;
    readonly rowLetters: Set<string>;
    readonly sequenceType: "dna" | "rna" | "amino";
    readonly colConsensus: {
        letter: string;
        color: string | undefined;
    }[];
    readonly gapConsensus: string[] | undefined;
    readonly colClustalX: Record<string, string>[];
    readonly colSimilarity: Record<string, string>[];
    readonly conservation: number[];
    readonly alphabetMaxBits: number;
    readonly propertyConservation: number[];
    readonly treeLayout: {
        root: import("react-msaview").LaidOutNode<import("react-msaview").NodeWithIds>;
        leaves: import("react-msaview").LaidOutNode<import("react-msaview").NodeWithIds>[];
        rootToTipLength: number;
    };
    readonly hierarchy: import("react-msaview").HierarchyNode;
    readonly totalHeight: number;
    readonly leaves: import("react-msaview").HierarchyNode[];
    readonly rootToTipLength: number;
    readonly pxPerBranchLength: number;
    readonly maxDepthToLeaf: number;
    readonly allBranchesLength0: boolean;
    readonly showBranchLenEffective: boolean;
} & {
    readonly totalWidth: number;
} & {
    readonly showMsaLetters: boolean;
} & {
    readonly columnTrackContent: Map<string, {
        values?: number[];
        raw?: (number | undefined)[];
        data?: string;
        arcs?: import("react-msaview").Arc[];
        spans?: import("react-msaview").ColumnSpan[];
    }>;
    trackHeight(kind: import("react-msaview").TrackKind, heightKey?: string, given?: number): number;
    columnTrackModel(track: import("react-msaview").ColumnTrackSpec): import("react-msaview").BasicTrack;
    readonly columnTrackModels: import("react-msaview").BasicTrack[];
} & {
    readonly secondaryStructureConsensus: string | undefined;
    readonly secondaryStructureArcs: import("react-msaview").Arc[] | undefined;
    readonly adapterTrackModels: import("react-msaview").BasicTrack[];
    readonly basePairTrackModels: import("react-msaview").BasicTrack[];
    readonly computedTrackModels: import("react-msaview").BasicTrack[];
    readonly referenceTrackModels: import("react-msaview").BasicTrack[];
    fillHighlightLabel(label: string, row?: string, start?: number): string;
    readonly resolvedHighlights: import("react-msaview").ResolvedHighlight[];
    readonly tracks: import("react-msaview").BasicTrack[];
    readonly highlightTrackModels: import("react-msaview").BasicTrack[];
    readonly turnedOnTracks: import("react-msaview").BasicTrack[];
    readonly showHorizontalScrollbar: boolean;
    visibleColToRowLetter(rowName: string, visibleCol: number): string | undefined;
    visibleColToSeqPos(rowName: string, visibleCol: number): number | undefined;
    visibleColToSeqPosOneBased(rowName: string, visibleCol: number): number | undefined;
    globalColToVisibleCol(globalCol: number): number | undefined;
    visibleColToGlobalCol(visibleCol: number): number;
    seqPosToGlobalCol(rowName: string, seqPos: number): number | undefined;
    seqEndToGlobalCol(rowName: string, seqPos: number): number | undefined;
    seqPosToVisibleCol(rowName: string, seqPos: number): number | undefined;
    visibleSpan({ row, start: rawStart, end: rawEnd }: import("react-msaview").Region): {
        startCol: number;
        endCol: number;
    } | undefined;
    readonly rowCoordinatesByRow: Map<string, import("react-msaview").RowCoordinates>;
    rowPositionLabel(rowName: string, residue: number): string;
    residueAtPosition(rowName: string, position: number): number;
    readonly coordinateRuler: {
        ticks: import("react-msaview").RulerTick[];
        labelWidth: number;
    } | undefined;
    readonly residueMappingProblems: import("react-msaview").ResidueMappingProblem[];
    readonly usableResidueMappings: import("react-msaview").ResidueMapping[];
    readonly mappedStructures: {
        row: string;
        structure: import("react-msaview").MappedStructure;
    }[];
    structureResidue(rowName: string, seqPos: number, structureId?: string): import("react-msaview").StructureResidue | undefined;
    rowResidue(structureId: string, position: number, asymId?: string): import("react-msaview").RowResidue | undefined;
} & {
    readonly treeScaleBar: {
        step: number;
        px: number;
        label: string;
    } | undefined;
    readonly topBandHeight: number;
    readonly msaAreaHeight: number;
    readonly totalTrackAreaHeight: number;
    readonly annotationTypes: Map<string, import("react-msaview").Annotation>;
    readonly defaultOffAccessions: Set<string>;
    featureOff(accession: string): boolean;
    readonly typeFilteredAnnotations: import("react-msaview").Annotation[];
    readonly filteredAnnotations: import("react-msaview").Annotation[];
    readonly markFeatures: import("react-msaview").Annotation[][];
    readonly cellFill: "residue" | "domain" | "none";
    readonly annotationsByRow: Record<string, import("react-msaview").Annotation[]>;
} & {
    readonly showVerticalScrollbar: boolean;
} & {
    readonly dataInitialized: boolean;
    readonly blocksX: number[];
    readonly blocksY: number[];
} & {
    readonly verticalScrollbarWidth: 0 | 20;
    readonly msaCanvasWidth: number;
    readonly maxScrollX: number;
    readonly blocks2d: (readonly [number, number])[];
    readonly wheelZooming: boolean;
    readonly isLoading: boolean;
    readonly dataWarnings: string[];
    readonly rowTransformWarnings: string[];
    readonly warnings: string[];
    readonly maxScrollY: number;
    readonly wheelZoomAxis: "both" | "horizontal" | "vertical";
} & {
    setDrawMsaLetters(arg: boolean): void;
    clearWarnings(): void;
    setScrollZoom(arg: boolean): void;
    setScrollZoomAxis(arg: "both" | "horizontal" | "vertical"): void;
    setHoveredTreeNode(nodeId?: string): void;
    calculateNeighborJoiningTreeFromMSA(): void;
    rerootAt(nodeId: string): void;
    seedCladeMarks(): void;
    replaceTree(newick: string): void;
    resetZoom(): void;
    zoomAtCenter(scaleFactor: number, axis?: "both" | "horizontal" | "vertical"): void;
    zoomIn(): void;
    zoomOut(): void;
    zoomToPos(scaleFactor: number, offsetX: number, offsetY: number, axis?: "both" | "horizontal" | "vertical"): void;
    wheelZoomToPos(scaleFactor: number, offsetX: number, offsetY: number): void;
    endWheelZoom(): void;
    doScrollY(deltaY: number): void;
    setScrollY(n: number): void;
    setAnnotations(annotations: import("react-msaview").Annotation[]): void;
    applyGFFText(gffText: string): void;
    doScrollX(deltaX: number): void;
    setScrollX(n: number): void;
    setColumnTracks(tracks: import("react-msaview").ColumnTrackSpec[]): void;
    setRowData(rowData: import("react-msaview").RowDataInput): void;
    setEncodings(encodings: import("react-msaview").Encoding[]): void;
    setRowPanels(panels: RowPanelSpec[]): void;
    setRowTransform(transform?: RowTransform): void;
    setMarks(marks?: import("react-msaview").AlignmentMarkSpec[]): void;
    setResidueMappings(mappings: import("react-msaview").ResidueMapping[]): void;
    setRowCoordinates(records: import("react-msaview").RowCoordinates[]): void;
    toggleTrack(id: string): void;
    setTracksShown(ids: string[], shown: boolean): void;
    setStatus(status?: {
        msg: string;
        onCancel?: () => void;
    }): void;
} & {
    cellAt(visibleCol: number, rowIndex?: number): import("react-msaview").Cell;
    readonly hoveredCell: import("react-msaview").Cell | undefined;
    readonly clickedCell: import("react-msaview").Cell | undefined;
    readonly viewport: import("react-msaview").Viewport | undefined;
    readonly segmentDomainTypes: import("react-msaview").Annotation[];
    readonly domainLegendItems: import("react-msaview").LegendItem[];
    readonly markDomainLegendItems: import("react-msaview").LegendItem[];
    readonly categoricalDomainTypes: import("react-msaview").Annotation[];
    readonly fillPalette: {
        [x: string]: string;
    };
    readonly featureFillEncoding: import("react-msaview").ResolvedEncoding | undefined;
    readonly featureColors: Map<import("react-msaview").Annotation, {
        fill: string;
        stroke: string;
    }>;
    readonly featureLabels: Map<import("react-msaview").Annotation, string> | undefined;
    readonly segmentLabels: Map<string, string>;
    readonly visibleDomainTypes: import("react-msaview").Annotation[];
    readonly legends: import("react-msaview").LegendSection[];
    readonly categoryFields: Map<string, string[]>;
    readonly scaleProblems: import("react-msaview").RecordScaleProblem[];
    readonly scaleProblemNotes: Map<string, string>;
    readonly colorRecordProblems: {
        record: string;
        key: string;
        problems: import("react-msaview").ScaleProblem[];
    }[];
    readonly domainUnderline: boolean;
    readonly domainBands: Map<string, import("react-msaview").DomainBand[]>;
    readonly domainBandsByStart: Map<string, import("react-msaview").DomainBand[]>;
    readonly markedBands: Map<string, import("react-msaview").DomainBand[]>;
    readonly markBands: Map<string, import("react-msaview").DomainBand[]>[];
    readonly markBandsByStart: Map<string, import("react-msaview").DomainBand[]>[];
    readonly markStyles: {
        colors: Map<import("react-msaview").Annotation, {
            fill: string;
            stroke: string;
        }>;
        labels: Map<import("react-msaview").Annotation, string> | undefined;
    }[];
    readonly resolvedMarks: import("react-msaview").ResolvedMark[];
    readonly mouseOverDomains: import("react-msaview").Annotation[];
    readonly mouseOverHighlights: import("react-msaview").ResolvedHighlight[];
    readonly referenceRowIndex: number | undefined;
    readonly hoveredRowIndices: number[];
    readonly highlightedColumnRuns: {
        start: number;
        end: number;
    }[];
    readonly resolvedSelection: import("react-msaview").ResolvedSelection | undefined;
    readonly selectionSize: {
        columns: number;
        rows: number;
    } | undefined;
    readonly selectionFasta: string;
    columnStatsAt(col: number): import("react-msaview").ColumnStats | undefined;
    getRowData(name: string): {
        data: {
            name?: string;
            accession?: string;
            dbxref?: string;
        } | undefined;
        rowData: Record<string, string> | undefined;
    };
    readonly resolvedEncodings: import("react-msaview").ResolvedEncoding[];
    resolveEncoding(encoding: import("react-msaview").ColorEncoding): import("react-msaview").ResolvedEncoding;
    readonly colorEncodings: import("react-msaview").ColorEncoding[];
    encodingFor(channel: import("react-msaview").ColorEncodingChannel): import("react-msaview").ResolvedEncoding | undefined;
    readonly resolvedScales: Map<string, import("react-msaview").SharedScale>;
    readonly rowTableKeys: Set<string>;
    readonly rowIndependentScales: Map<string, import("react-msaview").SharedScale>;
    scaleOf(channel: import("react-msaview").ColorChannel, table: import("react-msaview").ScaleTable): import("react-msaview").SharedScale;
    readonly rowPanelScales: ({
        axis?: import("react-msaview").PanelAxis | undefined;
        field: string;
        legend: import("react-msaview").LegendItem[];
        header: string;
        kind: "strip";
        colors: Map<string, string>;
        legendKey?: string | undefined;
        legendTitle?: string | undefined;
        legendNote?: string | undefined;
    } | {
        x: "column" | "position";
        axis?: import("react-msaview").PanelAxis | undefined;
        field?: string | undefined;
        legend: import("react-msaview").LegendItem[];
        header: string;
        kind: "features";
        colors: Map<import("react-msaview").Annotation, {
            fill: string;
            stroke: string;
        }>;
        legendKey?: string | undefined;
        legendTitle?: string | undefined;
        legendNote?: string | undefined;
        labels?: Map<import("react-msaview").Annotation, string> | undefined;
    } | (Omit<import("react-msaview").ResolvedValuePanel, "width" | "axis" | "id" | "offsetX"> & {
        valueScale: import("react-msaview").ValueScale;
    }) | {
        axis?: import("react-msaview").PanelAxis | undefined;
        field: string;
        legend: import("react-msaview").LegendItem[];
        header: string;
        kind: "text";
        colors: Map<string, string>;
        legendKey?: string | undefined;
        legendTitle?: string | undefined;
        legendNote?: string | undefined;
        colorField?: string | undefined;
        hiddenRows: Set<string>;
        texts: Map<string, string>;
        widestText: number;
    })[];
    readonly featureTrackScales: Map<string, {
        readonly colors: Map<import("react-msaview").Annotation, {
            fill: string;
            stroke: string;
        }>;
        readonly labels: Map<import("react-msaview").Annotation, string> | undefined;
        readonly scale: import("react-msaview").SharedScale | undefined;
    }>;
    readonly columnTrackColors: Map<string, {
        readonly scale: import("react-msaview").SharedScale | undefined;
        readonly colorOf: (value: string | undefined) => string | undefined;
        readonly isHidden: (value: string | undefined) => boolean;
        readonly identity: boolean;
        readonly columns: (string | undefined)[] | undefined;
        readonly hiddenColumns: boolean[] | undefined;
        readonly letters: {
            [k: string]: string;
        } | undefined;
    }>;
    readonly resolvedRowPanels: import("react-msaview").ResolvedRowPanel[];
    readonly featureAlignShifts: Map<string, Map<string, number>>;
    readonly tipLabelColors: Map<string, string> | undefined;
    readonly rowTints: (string | undefined)[] | undefined;
    readonly branchColors: Map<string, string> | undefined;
    readonly nodePointColors: Map<string, string> | undefined;
} & {
    setHeaderHeight(arg: number): void;
    setHideHeader(arg: boolean): void;
    setEmbeddedMode(arg: boolean): void;
    setImportForm(arg: boolean): void;
    treeOverviewClick(y: number): void;
    setTrackHeight(heightKey: string, height: number): void;
    reset(): void;
    exportSVG(opts: import("react-msaview").ExportSvgOptions): Promise<void>;
    exportNewick(): void;
    setFilter(accession: string, shown: boolean): void;
    setHiddenCategories(hidden: import("react-msaview").HiddenCategory[]): void;
    toggleLegendItem(hides: import("react-msaview").LegendHides, value: string): void;
    fit(): void;
    fitVertically(maxRowHeight?: number): void;
    zoomToRegion(region: import("react-msaview").Region): void;
    revealRegion(region: import("react-msaview").Region): void;
    zoomToSelection(): void;
    selectBlock(anchor: {
        col: number;
        row?: number;
    }, head: {
        col: number;
        row?: number;
    }): void;
    fitHorizontally(maxColWidth?: number): void;
    afterCreate(): void;
} & {
    /**
     * #volatile
     * the reference region the loaded alignment spans
     */
    loadedRegion: IRegion | undefined;
    /**
     * #volatile
     * the base modification calls the last load placed, when its reads had any
     */
    loadedModifications: ModificationSummary | undefined;
    /**
     * #volatile
     * the gap threshold the last load chose, which the next load replaces
     * unless the reader has changed it since
     */
    autoGappyness: number | undefined;
} & {
    /**
     * #getter
     */
    readonly connectedView: MaybeLGV;
    /**
     * #getter
     * the region `init.loc` names, once the assembly can parse it
     */
    readonly initRegion: import("./init").RegionCheck | undefined;
    /**
     * #getter
     * the alignment files `init.tracks` names, once every one resolves. The
     * configs are read rather than the track models, so a tview outlives the
     * tracks it was launched from being closed.
     */
    readonly initSources: TviewSource[] | undefined;
    /**
     * #getter
     * what a load is keyed on: two inits that say the same thing are one
     */
    readonly initKey: string | undefined;
    /**
     * #getter
     * overrides base: a view with an `init` rebuilds what its snapshot drops
     */
    readonly hostRestoresData: boolean;
} & {
    /**
     * #method
     * the reference base a visible column is read against: the reference
     * row's residue there, or the next one where the reference has a gap
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
    loadState: LoadState | undefined;
} & {
    /**
     * #getter
     * the load state of the current `init`, not of one it replaced
     */
    readonly currentLoad: LoadState | undefined;
} & {
    /**
     * #getter
     * why `init` cannot be loaded yet, or undefined once it can
     */
    readonly initBlocker: TViewState | undefined;
} & {
    /**
     * #getter
     */
    readonly viewState: TViewState;
} & {
    /**
     * #action
     */
    setLoadState(arg?: LoadState): void;
    /**
     * #action
     */
    setInit(arg?: TviewInit): void;
    /**
     * #action
     * forget a failed load, so the view tries its `init` again
     */
    retryLoad(): void;
    /**
     * #action
     * draws a load's base modification calls as annotations, which are
     * volatile: as many as the cap allows would bloat the session snapshot
     */
    setModifications(modifications?: TviewModifications): void;
    /**
     * #action
     * shows a built alignment: its rows, how they are grouped, ordered and
     * marked, and numbered in the genome's coordinates. The brackets are
     * transient, since every load rebuilds them, and a session saved by 3.0.0
     * carries its own copies of them, which are dropped here
     */
    setAlignment(result: TviewPlanResult): void;
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
     * builds the alignment `init` describes, from whatever `init`
     * describes it over. The one way an alignment ever gets here. A result
     * for an `init` that is no longer current, or for a view that has been
     * closed, is dropped.
     */
    load(key: string, region: FetchRegion, sources: TviewSource[]): Promise<void>;
    beforeDestroy(): void;
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
}, import("@jbrowse/mobx-state-tree")._NotCustomized, Omit<import("@jbrowse/mobx-state-tree").ModelSnapshotType<Omit<Omit<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}, "height" | "id" | "type" | "region" | "selection" | "scrollZoom" | "highlights" | "features" | "data" | "colWidth" | "rowHeight" | "labelsAlignRight" | "residueColor" | "consensusInGaps" | "keepReferenceColumns" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth" | "msaFormat" | "showColumnStats" | "allowedGappyness" | "clades" | "cladesSeeded" | "collapsed" | "columnTracks" | "currentAlignment" | "drawMsaLetters" | "embeddedMode" | "encodings" | "gffFilehandle" | "hiddenCategories" | "hideGaps" | "highlightColumns" | "marks" | "msaFilehandle" | "relativeTo" | "residueMappings" | "rotated" | "rowCoordinates" | "rowPanels" | "rowTransform" | "scrollX" | "scrollY" | "scrollZoomAxis" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "trimToSelection" | "turnedOffFeatures" | "turnedOffTracks"> & Omit<Omit<Omit<{}, "labelsAlignRight" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth"> & {
    drawLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    labelsAlignRight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    treeAreaWidth: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
    treeWidth: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<number>>;
    showBranchLen: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    treeOrder: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<import("react-msaview").TreeOrder>, [undefined]>;
    drawTree: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    drawNodeBubbles: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    drawNodeLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    showTreeOverview: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    overviewHeight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
}, "residueColor" | "msaFormat" | "showColumnStats"> & {
    residueColor: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ResidueColor, import("react-msaview").ResidueColor, import("react-msaview").ResidueColor>, [undefined]>;
    showColumnStats: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    msaFormat: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<import("react-msaview").MSAFormat>>;
}, "height" | "id" | "type" | "region" | "selection" | "scrollZoom" | "highlights" | "features" | "data" | "colWidth" | "rowHeight" | "consensusInGaps" | "keepReferenceColumns" | "allowedGappyness" | "clades" | "cladesSeeded" | "collapsed" | "columnTracks" | "currentAlignment" | "drawMsaLetters" | "embeddedMode" | "encodings" | "gffFilehandle" | "hiddenCategories" | "hideGaps" | "highlightColumns" | "marks" | "msaFilehandle" | "relativeTo" | "residueMappings" | "rotated" | "rowCoordinates" | "rowPanels" | "rowTransform" | "scrollX" | "scrollY" | "scrollZoomAxis" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "trimToSelection" | "turnedOffFeatures" | "turnedOffTracks"> & {
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    showDomains: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    showDomainLegend: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    hideGaps: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    trimToSelection: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    allowedGappyness: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    subFeatureRows: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ILiteralType<"MsaView">;
    drawMsaLetters: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    embeddedMode: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    scrollZoom: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    scrollZoomAxis: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<"both" | "horizontal" | "vertical">, [undefined]>;
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
    }, import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
    }, import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
    }, import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
    }, import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        handleId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"UriLocation">;
        uri: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        baseUri: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
        internetAccountPreAuthorization: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IModelType<{
            internetAccountType: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
            authInfo: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
        }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    }>>, import("@jbrowse/core/util/types/mst").LegacyFileLocation | import("@jbrowse/mobx-state-tree").ModelCreationType<{
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
    rotated: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").ISimpleType<string>>, [undefined]>;
    treeRoot: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").TreeRoot | undefined, import("react-msaview").TreeRoot | undefined, import("react-msaview").TreeRoot | undefined>;
    showOnly: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    cladesSeeded: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    turnedOffTracks: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>, [undefined]>;
    trackHeights: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<number>>, [undefined]>;
    columnTracks: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ColumnTrackSpec, import("react-msaview").ColumnTrackSpec, import("react-msaview").ColumnTrackSpec>>, [undefined]>;
    residueMappings: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ResidueMapping, import("react-msaview").ResidueMapping, import("react-msaview").ResidueMapping>>, [undefined]>;
    rowCoordinates: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").RowCoordinates, import("react-msaview").RowCoordinates, import("react-msaview").RowCoordinates>>, [undefined]>;
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
        [k: string]: string | undefined;
    }>, [undefined]>;
    turnedOffFeatures: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>, [undefined]>;
    relativeTo: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    consensusInGaps: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    keepReferenceColumns: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    highlightColumns: import("@jbrowse/mobx-state-tree").IType<number[] | undefined, number[] | undefined, number[] | undefined>;
    highlights: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<Highlight, Highlight, Highlight>>, [undefined]>;
    features: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Feature, import("react-msaview").Feature, import("react-msaview").Feature>>, [undefined]>;
    selection: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").MsaSelection | undefined, import("react-msaview").MsaSelection | undefined, import("react-msaview").MsaSelection | undefined>;
    region: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Region | undefined, import("react-msaview").Region | undefined, import("react-msaview").Region | undefined>;
    clades: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Clade, import("react-msaview").Clade, import("react-msaview").Clade>>, [undefined]>;
    encodings: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Encoding, import("react-msaview").Encoding, import("react-msaview").Encoding>>, [undefined]>;
    hiddenCategories: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").HiddenCategory, import("react-msaview").HiddenCategory, import("react-msaview").HiddenCategory>>, [undefined]>;
    rowPanels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<RowPanelSpec, RowPanelSpec, RowPanelSpec>>, [undefined]>;
    rowTransform: import("@jbrowse/mobx-state-tree").IType<RowTransform | undefined, RowTransform | undefined, RowTransform | undefined>;
    marks: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").AlignmentFeaturesSpec[] | undefined, import("react-msaview").AlignmentFeaturesSpec[] | undefined, import("react-msaview").AlignmentFeaturesSpec[] | undefined>;
}, "type" | "init" | "connectedViewId" | "zoomToBaseLevel"> & {
    type: import("@jbrowse/mobx-state-tree").ILiteralType<"TView">;
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
     */
    zoomToBaseLevel: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}>, "height" | "id" | "type" | "region" | "selection" | "scrollZoom" | "highlights" | "features" | "data" | "colWidth" | "rowHeight" | "labelsAlignRight" | "residueColor" | "consensusInGaps" | "keepReferenceColumns" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth" | "msaFormat" | "showColumnStats" | "allowedGappyness" | "clades" | "cladesSeeded" | "collapsed" | "columnTracks" | "currentAlignment" | "drawMsaLetters" | "embeddedMode" | "encodings" | "gffFilehandle" | "hiddenCategories" | "hideGaps" | "highlightColumns" | "marks" | "msaFilehandle" | "relativeTo" | "residueMappings" | "rotated" | "rowCoordinates" | "rowPanels" | "rowTransform" | "scrollX" | "scrollY" | "scrollZoomAxis" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "trimToSelection" | "turnedOffFeatures" | "turnedOffTracks"> & ({
    residueColor: import("react-msaview").ResidueColor;
    showColumnStats: boolean;
    msaFormat: import("react-msaview").MSAFormat | undefined;
    drawLabels: boolean;
    labelsAlignRight: boolean;
    treeAreaWidth: number | undefined;
    treeWidth: number | undefined;
    showBranchLen: boolean;
    treeOrder: import("react-msaview").TreeOrder;
    drawTree: boolean;
    drawNodeBubbles: boolean;
    drawNodeLabels: boolean;
    showTreeOverview: boolean;
    overviewHeight: number;
    columnTracks: import("react-msaview").ColumnTrackSpec[];
    id: string;
    showDomains: boolean;
    showDomainLegend: boolean;
    hideGaps: boolean;
    trimToSelection: boolean;
    allowedGappyness: number;
    subFeatureRows: boolean;
    type: "MsaView";
    drawMsaLetters: boolean;
    embeddedMode: boolean;
    scrollZoom: boolean;
    scrollZoomAxis: "both" | "horizontal" | "vertical";
    height: number;
    rowHeight: number;
    scrollY: number;
    scrollX: number;
    colWidth: number;
    treeFilehandle: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
    rotated: string[];
    treeRoot: import("react-msaview").TreeRoot | undefined;
    showOnly: string | undefined;
    cladesSeeded: boolean;
    turnedOffTracks: import("mobx").IKeyValueMap<boolean>;
    trackHeights: import("mobx").IKeyValueMap<number>;
    residueMappings: import("react-msaview").ResidueMapping[];
    rowCoordinates: import("react-msaview").RowCoordinates[];
    turnedOffFeatures: import("mobx").IKeyValueMap<boolean>;
    relativeTo: string | undefined;
    consensusInGaps: boolean;
    keepReferenceColumns: boolean;
    highlightColumns: number[] | undefined;
    highlights: Highlight[];
    features: import("react-msaview").Feature[];
    selection: import("react-msaview").MsaSelection | undefined;
    region: import("react-msaview").Region | undefined;
    clades: import("react-msaview").Clade[];
    encodings: import("react-msaview").Encoding[];
    hiddenCategories: import("react-msaview").HiddenCategory[];
    rowPanels: RowPanelSpec[];
    rowTransform: RowTransform | undefined;
    marks: import("react-msaview").AlignmentFeaturesSpec[] | undefined;
    data: {
        tree?: string | undefined;
        msa?: string | undefined;
        treeMetadata?: string | undefined;
        gff?: string | undefined;
    };
} | {
    residueColor: import("react-msaview").ResidueColor;
    showColumnStats: boolean;
    msaFormat: import("react-msaview").MSAFormat | undefined;
    drawLabels: boolean;
    labelsAlignRight: boolean;
    treeAreaWidth: number | undefined;
    treeWidth: number | undefined;
    showBranchLen: boolean;
    treeOrder: import("react-msaview").TreeOrder;
    drawTree: boolean;
    drawNodeBubbles: boolean;
    drawNodeLabels: boolean;
    showTreeOverview: boolean;
    overviewHeight: number;
    columnTracks?: undefined;
    id: string;
    showDomains: boolean;
    showDomainLegend: boolean;
    hideGaps: boolean;
    trimToSelection: boolean;
    allowedGappyness: number;
    subFeatureRows: boolean;
    type: "MsaView";
    drawMsaLetters: boolean;
    embeddedMode: boolean;
    scrollZoom: boolean;
    scrollZoomAxis: "both" | "horizontal" | "vertical";
    height: number;
    rowHeight: number;
    scrollY: number;
    scrollX: number;
    colWidth: number;
    treeFilehandle: import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"LocalPathLocation">;
        localPath: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"BlobLocation">;
        name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        blobId: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }> | import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
        locationType: import("@jbrowse/mobx-state-tree").ILiteralType<"FileHandleLocation">;
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
    rotated: string[];
    treeRoot: import("react-msaview").TreeRoot | undefined;
    showOnly: string | undefined;
    cladesSeeded: boolean;
    turnedOffTracks: import("mobx").IKeyValueMap<boolean>;
    trackHeights: import("mobx").IKeyValueMap<number>;
    residueMappings: import("react-msaview").ResidueMapping[];
    rowCoordinates: import("react-msaview").RowCoordinates[];
    turnedOffFeatures: import("mobx").IKeyValueMap<boolean>;
    relativeTo: string | undefined;
    consensusInGaps: boolean;
    keepReferenceColumns: boolean;
    highlightColumns: number[] | undefined;
    highlights: Highlight[];
    features: import("react-msaview").Feature[];
    selection: import("react-msaview").MsaSelection | undefined;
    region: import("react-msaview").Region | undefined;
    clades: import("react-msaview").Clade[];
    encodings: import("react-msaview").Encoding[];
    hiddenCategories: import("react-msaview").HiddenCategory[];
    rowPanels: RowPanelSpec[];
    rowTransform: RowTransform | undefined;
    marks: import("react-msaview").AlignmentFeaturesSpec[] | undefined;
    data: {
        tree?: string | undefined;
        msa?: string | undefined;
        treeMetadata?: string | undefined;
        gff?: string | undefined;
    };
})>;
export type JBrowsePluginTViewStateModel = ReturnType<typeof stateModelFactory>;
export type JBrowsePluginTViewModel = Instance<JBrowsePluginTViewStateModel>;
export declare function isTView(view: {
    type: string;
}): view is JBrowsePluginTViewModel;
