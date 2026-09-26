export type { MSAFormat } from 'msa-parsers';
import type { BlastDatabase, MsaAlgorithm, PhmmerDatabase } from '../LaunchMsaView/components/BlastQuery/consts';
import type { UnirefIdentity } from '../utils/unirefHomologs';
import type { MsaDataPayload } from './msaDataStore';
import type { MafRegion, MsaViewInitState } from './types';
import type { TranscriptRef } from './util';
import type { MenuItem } from '@jbrowse/core/ui';
import type { Instance } from '@jbrowse/mobx-state-tree';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
type LGV = LinearGenomeViewModel;
type MaybeLGV = LGV | undefined;
export interface IRegion {
    refName: string;
    start: number;
    end: number;
}
/**
 * A search to run, discriminated by the program that runs it: the two arms
 * differ in which databases they name and in whether an aligner runs at all, so
 * splitting them is what lets doLaunchBlast read the database without asserting
 * whose it is.
 *
 * The field is still `blastDatabase` rather than `database`: it is persisted in
 * session snapshots and in the IndexedDB result cache, so renaming it would
 * orphan every row already written.
 */
export type BlastParams = {
    /** plain JSON, not a Feature: see TranscriptRef */
    selectedTranscript?: TranscriptRef;
    /**
     * The query. The dialog always supplies it, translated from the transcript
     * the user picked. A session spec may instead name a UniProt `accession`
     * and have the sequence fetched at launch, or name a `connectedTranscript`
     * on the view and have it translated from the genome (see
     * resolveConnectedTranscript).
     */
    proteinSequence?: string;
    accession?: string;
    /** hits to keep: phmmer's `nhits`, blastp's `alignments`; 100 when omitted */
    maxHits?: number;
} & ({
    /** absent on params written before phmmer existed, which were all blastp */
    searchProgram?: 'blastp';
    blastDatabase: BlastDatabase;
    msaAlgorithm: MsaAlgorithm;
} | {
    searchProgram: 'phmmer';
    /** phmmer names its databases its own way: `swissprot`, not `uniprotkb_swissprot` */
    blastDatabase: PhmmerDatabase;
    /** phmmer aligns as it searches, so there is no aligner to choose */
    msaAlgorithm?: undefined;
});
/**
 * Where the homolog set comes from. NCBI's ortholog sets cover vertebrates and
 * insects; PANTHER's span its 144 reference proteomes, human to yeast to
 * Arabidopsis; a UniRef cluster is every UniProtKB entry within 50% (or 90%)
 * identity of the query, one per species, from any organism at all -- and the
 * one source of the three whose rows need no ortholog call, only UniProt's
 * REST api (see utils/unirefHomologs.ts).
 */
export declare const orthologSources: readonly ["ncbi", "panther", "uniref"];
export type OrthologSource = (typeof orthologSources)[number];
export interface OrthologParams {
    /** NCBI taxon id of the assembly the query gene came from */
    taxId: number;
    /** `ncbi` when omitted, so every launch written before this key keeps its meaning */
    source?: OrthologSource;
    /** UniRef only: the cluster identity level, 50 when omitted */
    identity?: UnirefIdentity;
    /**
     * UniRef only: keep members from reference proteomes, which is what makes a
     * cluster one good entry per species rather than every strain and isolate
     * UniProtKB holds. `true` when omitted.
     */
    referenceProteomesOnly?: boolean;
    /**
     * taxon ids to include as rows. The query taxon has its own row already, so
     * it is excluded from this set whether or not it is named.
     * Omitted means every species NCBI has an ortholog for, in its report order,
     * which is what a launch that just wants "this gene across species" wants.
     */
    taxa?: number[];
    /**
     * how many ortholog rows to align, `defaultMaxSpecies` when omitted. The
     * aligner is what this bounds: EBI runs at roughly half a second per row for
     * a ~1400aa protein, so a gene with 865 orthologs is a 7 minute job at no
     * cap.
     */
    maxSpecies?: number;
    /** candidate gene identifiers off the feature, tried in order */
    geneCandidates: string[];
    msaAlgorithm: MsaAlgorithm;
    /** plain JSON, not a Feature: see TranscriptRef */
    selectedTranscript?: TranscriptRef;
    /**
     * The query row, named `<species>_query`. The launch dialog always supplies
     * it, translated from the
     * transcript the user picked, which is what `connectedFeature` maps genome
     * coordinates through. Omitted — a session spec naming a gene and nothing
     * else — the query row becomes NCBI's representative protein for the resolved
     * gene, the same choice every other row makes.
     */
    proteinSequence?: string;
}
/**
 * #stateModel MsaViewPlugin
 * extends
 * - MSAModel from https://github.com/GMOD/react-msaview
 */
export default function stateModelFactory(): import("@jbrowse/mobx-state-tree").IModelType<Omit<Omit<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}, "id" | "type" | "autoTreeAreaWidth" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "labelsAlignRight" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth" | "bgColor" | "colorSchemeName" | "customColorScheme" | "msaFormat" | "showColumnStats" | "allowedGappyness" | "clades" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "encodings" | "features" | "gffFilehandle" | "height" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "region" | "relativeTo" | "residueMappings" | "rotated" | "rowHeight" | "rowPanels" | "scrollX" | "scrollY" | "scrollZoom" | "scrollZoomAxis" | "selection" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "turnedOffFeatures" | "turnedOffTracks"> & Omit<Omit<Omit<{}, "autoTreeAreaWidth" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "labelsAlignRight" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth"> & {
    drawLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    labelsAlignRight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    treeAreaWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    treeWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    showBranchLen: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    treeOrder: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<import("react-msaview").TreeOrder>, [undefined]>;
    drawTree: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    drawNodeBubbles: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    drawNodeLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    showTreeOverview: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    overviewHeight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    autoTreeAreaWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}, "bgColor" | "colorSchemeName" | "customColorScheme" | "msaFormat" | "showColumnStats"> & {
    bgColor: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    colorSchemeName: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    customColorScheme: import("@jbrowse/mobx-state-tree").IType<Record<string, string> | undefined, Record<string, string> | undefined, Record<string, string> | undefined>;
    showColumnStats: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    msaFormat: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<import("react-msaview").MSAFormat>>;
}, "id" | "type" | "allowedGappyness" | "clades" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "encodings" | "features" | "gffFilehandle" | "height" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "region" | "relativeTo" | "residueMappings" | "rotated" | "rowHeight" | "rowPanels" | "scrollX" | "scrollY" | "scrollZoom" | "scrollZoomAxis" | "selection" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "turnedOffFeatures" | "turnedOffTracks"> & {
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    showDomains: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    showDomainLegend: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    hideGaps: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    allowedGappyness: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    subFeatureRows: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ILiteralType<"MsaView">;
    drawMsaLetters: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
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
    turnedOffTracks: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>, [undefined]>;
    trackHeights: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<number>>, [undefined]>;
    columnTracks: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ColumnTrackSpec, import("react-msaview").ColumnTrackSpec, import("react-msaview").ColumnTrackSpec>>, [undefined]>;
    residueMappings: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ResidueMapping, import("react-msaview").ResidueMapping, import("react-msaview").ResidueMapping>>, [undefined]>;
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
    highlightColumns: import("@jbrowse/mobx-state-tree").IType<number[] | undefined, number[] | undefined, number[] | undefined>;
    highlights: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Highlight, import("react-msaview").Highlight, import("react-msaview").Highlight>>, [undefined]>;
    features: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Feature, import("react-msaview").Feature, import("react-msaview").Feature>>, [undefined]>;
    selection: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").MsaSelection | undefined, import("react-msaview").MsaSelection | undefined, import("react-msaview").MsaSelection | undefined>;
    region: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Region | undefined, import("react-msaview").Region | undefined, import("react-msaview").Region | undefined>;
    clades: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Clade, import("react-msaview").Clade, import("react-msaview").Clade>>, [undefined]>;
    encodings: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Encoding, import("react-msaview").Encoding, import("react-msaview").Encoding>>, [undefined]>;
    rowPanels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").RowPanelSpec, import("react-msaview").RowPanelSpec, import("react-msaview").RowPanelSpec>>, [undefined]>;
}, "init" | "querySeqName" | "querySeqOffset" | "zoomToBaseLevel" | "launchCompleted" | "connectedViewId" | "connectedFeature" | "connectedTranscript" | "blastParams" | "orthologParams" | "uniprotId" | "dataStoreId" | "mafRegion"> & {
    connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    connectedFeature: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
    connectedTranscript: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    blastParams: import("@jbrowse/mobx-state-tree").IType<BlastParams | undefined, BlastParams | undefined, BlastParams | undefined>;
    orthologParams: import("@jbrowse/mobx-state-tree").IType<OrthologParams | undefined, OrthologParams | undefined, OrthologParams | undefined>;
    querySeqName: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
    querySeqOffset: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    uniprotId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    zoomToBaseLevel: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    init: import("@jbrowse/mobx-state-tree").IType<MsaViewInitState | undefined, MsaViewInitState | undefined, MsaViewInitState | undefined>;
    dataStoreId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    launchCompleted: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    mafRegion: import("@jbrowse/mobx-state-tree").IType<MafRegion | undefined, MafRegion | undefined, MafRegion | undefined>;
}, {
    width: number;
    bodyMounted: boolean;
} & {
    readonly rendersDisplays: boolean;
    readonly effectiveBodyMounted: boolean;
    menuItems(): MenuItem[];
    readonly ownTracks: import("@jbrowse/core/util").AbstractTrackModel[];
    readonly ownViews: import("@jbrowse/core/util").AbstractViewModel[];
} & {
    setDisplayName(name: string): void;
    setWidth(newWidth: number): void;
    setBodyMounted(flag: boolean): void;
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
    setTreeOrder(order: import("react-msaview").TreeOrder): void;
    setDrawNodeBubbles(arg: boolean): void;
    setDrawNodeLabels(arg: boolean): void;
    setShowTreeOverview(arg: boolean): void;
    setOverviewHeight(n: number): void;
    setDrawLabels(arg: boolean): void;
} & {
    setColorSchemeName(name: string): void;
    setCustomColorScheme(map?: Record<string, string>): void;
    setBgColor(arg: boolean): void;
    setShowColumnStats(arg: boolean): void;
    setMSAFormat(arg?: import("react-msaview").MSAFormat): void;
} & {
    headerHeight: number;
    hideHeader: boolean;
    status: {
        msg: string;
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
    transientHighlights: Record<string, import("react-msaview").Highlight[]>;
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
    setHideGaps(arg: boolean): void;
    setAllowedGappyness(arg: number): void;
    setLoadingMSA(arg: boolean): void;
    setLoadingTree(arg: boolean): void;
    setWidth(arg: number): void;
    setHighResScaleFactor(arg: number): void;
    setHeight(height: number): void;
    setError(error?: unknown): void;
    addWarning(warning: string): void;
    setHostCarriesData(arg: boolean): void;
    setMousePos(col?: number, row?: number): void;
    setHighlightedColumns(columns?: number[]): void;
    setRegion(region?: import("react-msaview").Region): void;
    setHighlights(highlights: import("react-msaview").Highlight[]): void;
    setFeatures(features: import("react-msaview").Feature[]): void;
    setSelection(selection?: import("react-msaview").MsaSelection): void;
    clearSelection(): void;
    setClades(clades: import("react-msaview").Clade[]): void;
    applyHighlight(owner: string, highlights: import("react-msaview").Highlight[]): void;
    clearHighlight(owner: string): void;
    setShowDomains(arg: boolean): void;
    setShowDomainLegend(arg: boolean): void;
    setSubFeatureRows(arg: boolean): void;
    setMouseClickPos(col?: number, row?: number): void;
    setRowHeight(n: number): void;
    setColWidth(n: number): void;
    setCurrentAlignment(n: number): void;
    toggleCollapsed(node: string): void;
    toggleRotated(node: string): void;
    clearRotated(): void;
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
    readonly realAllowedGappyness: number;
    readonly allAnnotations: import("react-msaview").Annotation[];
    readonly actuallyShowDomains: boolean;
    readonly hostRestoresData: boolean;
    readonly viewInitialized: boolean;
    readonly width: number;
} & {
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
    readonly rowFields: string[];
    readonly MSA: import("react-msaview").MSAParserType | null;
    readonly numColumns: number;
    readonly inputTree: import("react-msaview").NodeWithIds;
    readonly tree: import("react-msaview").NodeWithIds;
    readonly rowNames: string[];
    readonly rowNamesSet: Map<string, number>;
    readonly resolvedClades: import("react-msaview").ResolvedClade[];
    readonly cladeGutterWidth: number;
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
        root: import("react-msaview").HierarchyNode<import("react-msaview").NodeWithIds>;
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
    readonly blanks: number[];
    readonly insertionPositions: Map<string, {
        pos: number;
        letters: string;
    }[]>;
    readonly rows: [string, string][];
    readonly numRows: number;
    seqPosIndex(rowName: string): Int32Array | undefined;
    readonly rowMap: Map<string, string>;
    readonly columns: Map<string, string>;
    readonly columns2d: string[];
    readonly fontSize: number;
    readonly colStats: import("react-msaview").ColumnCounts;
    readonly sequenceType: "dna" | "rna" | "amino";
    readonly colConsensus: {
        letter: string;
        color: string | undefined;
    }[];
    readonly colClustalX: Record<string, string>[];
    readonly conservation: number[];
    readonly alphabetMaxBits: number;
    readonly propertyConservation: number[];
    readonly treeLayout: {
        root: import("react-msaview").LaidOutNode<import("react-msaview").NodeWithIds>;
        leaves: import("react-msaview").LaidOutNode<import("react-msaview").NodeWithIds>[];
        rootToTipLength: number;
    };
    readonly hierarchy: import("react-msaview").HierarchyNode<import("react-msaview").NodeWithIds>;
    readonly totalHeight: number;
    readonly leaves: import("react-msaview").HierarchyNode<import("react-msaview").NodeWithIds>[];
    readonly rootToTipLength: number;
    readonly maxBranchLength: number;
    readonly pxPerBranchLength: number;
    readonly maxDepthToLeaf: number;
    readonly allBranchesLength0: boolean;
    readonly showBranchLenEffective: boolean;
} & {
    readonly totalWidth: number;
} & {
    readonly showMsaLetters: boolean;
    readonly showTreeText: boolean;
} & {
    readonly columnTrackContent: Map<string, {
        values?: number[];
        data?: string;
        arcs?: import("react-msaview").Arc[];
    }>;
    trackHeight(kind: import("react-msaview").TrackKind, heightKey?: string, given?: number): number;
    columnTrackModel(track: import("react-msaview").ColumnTrackSpec): import("react-msaview").BasicTrack;
    readonly columnTrackModels: import("react-msaview").BasicTrack[];
} & {
    readonly labelWidthMap: Map<string, number>;
    readonly labelWidthScale: number;
    readonly labelsWidth: number;
    readonly secondaryStructureConsensus: string | undefined;
    readonly secondaryStructureArcs: import("react-msaview").Arc[] | undefined;
    readonly adapterTrackModels: import("react-msaview").BasicTrack[];
    readonly basePairTrackModels: import("react-msaview").BasicTrack[];
    readonly computedTrackModels: import("react-msaview").BasicTrack[];
    readonly tracks: import("react-msaview").BasicTrack[];
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
    readonly filteredAnnotations: import("react-msaview").Annotation[];
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
    readonly isLoading: boolean;
    readonly dataWarnings: string[];
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
    replaceTree(newick: string): void;
    resetZoom(): void;
    zoomAtCenter(scaleFactor: number, axis?: "both" | "horizontal" | "vertical"): void;
    zoomOutHorizontal(): void;
    zoomInHorizontal(): void;
    zoomInVertical(): void;
    zoomOutVertical(): void;
    zoomIn(): void;
    zoomOut(): void;
    zoomToPos(scaleFactor: number, offsetX: number, offsetY: number, axis?: "both" | "horizontal" | "vertical"): void;
    doScrollY(deltaY: number): void;
    setScrollY(n: number): void;
    setAnnotations(annotations: import("react-msaview").Annotation[]): void;
    setDomains(data?: Record<string, import("react-msaview").InterProScanResults>): void;
    applyGFFText(gffText: string): void;
    doScrollX(deltaX: number): void;
    setScrollX(n: number): void;
    setColumnTracks(tracks: import("react-msaview").ColumnTrackSpec[]): void;
    setRowData(rowData: import("react-msaview").RowDataInput): void;
    setEncodings(encodings: import("react-msaview").Encoding[]): void;
    setRowPanels(panels: import("react-msaview").RowPanelSpec[]): void;
    setResidueMappings(mappings: import("react-msaview").ResidueMapping[]): void;
    toggleTrack(id: string): void;
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
    readonly legends: import("react-msaview").Legend[];
    readonly domainUnderline: boolean;
    readonly domainBands: Map<string, import("react-msaview").DomainBand[]>;
    readonly domainBandsByStart: Map<string, import("react-msaview").DomainBand[]>;
    readonly mouseOverDomains: import("react-msaview").Annotation[];
    readonly referenceRowIndex: number | undefined;
    readonly hoveredRowIndices: number[];
    readonly highlightedColumnRuns: {
        start: number;
        end: number;
    }[];
    fillHighlightLabel(label: string, row?: string, start?: number): string;
    readonly resolvedHighlights: import("react-msaview").ResolvedHighlight[];
    readonly resolvedSelection: import("react-msaview").ResolvedSelection | undefined;
    readonly selectionSize: {
        columns: number;
        rows: number;
    } | undefined;
    readonly selectionFileSpan: {
        start: number;
        end: number;
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
    readonly rowPanelScales: ({
        header: string;
        kind: "strip";
        field: string;
        colors: Map<string, string>;
        legend: import("react-msaview").LegendEntry[];
        legendTitle?: string | undefined;
    } | {
        header: string;
        x: "column" | "position";
        kind: "features";
        field?: string | undefined;
        colors: Map<import("react-msaview").Annotation, {
            fill: string;
            stroke: string;
        }>;
        legend: import("react-msaview").LegendEntry[];
        legendTitle?: string | undefined;
        labels?: Map<import("react-msaview").Annotation, string> | undefined;
    })[];
    readonly resolvedRowPanels: import("react-msaview").ResolvedRowPanel[];
    readonly featureAlignShifts: Map<string, Map<string, number>>;
    readonly tipLabelColors: Map<string, string> | undefined;
    readonly rowTints: (string | undefined)[] | undefined;
    readonly branchColors: Map<string, string> | undefined;
} & {
    setHeaderHeight(arg: number): void;
    setHideHeader(arg: boolean): void;
    treeOverviewClick(y: number): void;
    setTrackHeight(heightKey: string, height: number): void;
    reset(): void;
    exportSVG(opts: import("react-msaview").ExportSvgOptions): Promise<void>;
    exportNewick(): void;
    setFilter(accession: string, shown: boolean): void;
    fit(): void;
    fitVertically(): void;
    zoomToRegion(region: import("react-msaview").Region): void;
    zoomToSelection(): void;
    selectBlock(anchor: {
        col: number;
        row?: number;
    }, head: {
        col: number;
        row?: number;
    }): void;
    fitHorizontally(): void;
    afterCreate(): void;
} & {
    rid: string | undefined;
    progress: string;
    loadingStoredData: boolean;
    isStoringData: boolean;
    lastStoredData: MsaDataPayload | undefined;
    ownsDataStoreRow: boolean;
    launchController: AbortController | undefined;
    domainsRequested: boolean;
} & {
    /**
     * #getter
     */
    readonly transcriptToMsaMap: import("./transcriptMap").TranscriptMap | undefined;
    /**
     * #getter
     */
    readonly connectedView: MaybeLGV;
} & {
    /**
     * #getter
     * Genome regions under the current MSA hover column. Suppressed on the LGV
     * while it's being hovered (GenomeMouseoverHighlight shows the crisp 1bp
     * marker there instead of this wider codon band).
     */
    readonly connectedHoverHighlights: IRegion[];
    /**
     * #getter
     * Genome regions under the persistent MSA click selection. Shown
     * regardless of LGV hover, so hovering the genome doesn't hide it.
     */
    readonly connectedClickHighlights: IRegion[];
    /**
     * #getter
     * cross-plugin contract: jbrowse-plugin-mafviewer reads this off the view
     * to draw the same highlights in its own display
     */
    readonly connectedHighlights: IRegion[];
} & {
    /**
     * #getter
     * overrides base
     *
     * react-msaview drops any snapshot document over 50kb and warns that a
     * link to the view opens without it. True for an alignment this browser
     * is holding in IndexedDB; wrong for an indexed view, whose kept `init`
     * names a bgzip block over HTTP that processInit refetches wherever the
     * session is opened -- so that one showed "Not in the link" about an
     * alignment the link does carry.
     */
    readonly hostRestoresData: boolean;
    /**
     * #getter
     * the documents a reload would lose: too big for react-msaview to keep
     * in the snapshot, and with no filehandle or kept init to refetch them
     * from. IndexedDB holds exactly these.
     */
    readonly unsavedDocuments: MsaDataPayload;
} & {
    /**
     * #action
     */
    setZoomToBaseLevel(arg: boolean): void;
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
    setBlastParams(args?: BlastParams): void;
    /**
     * #action
     */
    setConnectedFeature(arg?: Record<string, unknown>): void;
    /**
     * #action
     */
    setOrthologParams(args?: OrthologParams): void;
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
    setLaunchCompleted(arg: boolean): void;
    /**
     * #action
     */
    setLoadingStoredData(arg: boolean): void;
    /**
     * #action
     */
    setIsStoringData(arg: boolean): void;
    /**
     * #action
     */
    setLastStoredData(arg?: MsaDataPayload): void;
    /**
     * #action
     */
    setOwnsDataStoreRow(arg: boolean): void;
    /**
     * #action
     */
    setLaunchController(arg?: AbortController): void;
    /**
     * #action
     * Abandon the launch, in flight or failed. The EBI job keeps running on
     * their side — nothing here can recall it, and its JobLink stays valid —
     * so this only stops the polling and the writes it would make. Dropping
     * the request (the params, or the init) is what keeps it from refiring on
     * the next reload; the view falls back to the import form, which is where
     * react-msaview's own cancel leaves it too.
     */
    cancelLaunch(): void;
    /**
     * #action
     * Run the request again. The request IS the params, so re-stating them is
     * the whole retry: each is a frozen property, and a fresh object is a
     * change the launch autoruns wake on.
     *
     * A launch that already succeeded keeps its params and is marked
     * `launchCompleted`, so clearing that mark is the whole retry for a view
     * whose stored alignment expired.
     */
    retryLaunch(): void;
    /**
     * #action
     */
    setDomainsRequested(arg: boolean): void;
    /**
     * #action
     */
    handleMsaClick(coord: number): void;
} & {
    /**
     * #action
     */
    setMouseClickPos(col?: number, row?: number): void;
} & {
    /**
     * #action
     * overrides base
     *
     * react-msaview's reset applies a snapshot filtered to its own
     * `preservedOnReset` list, and a downstream property is never on it:
     * returning to the import form dropped the view's name, un-minimized
     * it, and forgot the zoom-on-click preference. The volatiles fail the
     * other way -- applySnapshot cannot reach them, so the last file's
     * state carried into the next one and the domain auto-load, which fires
     * once per view, never fired again.
     */
    reset(): void;
} & {
    /**
     * #method
     * overrides base
     */
    menuItems(): MenuItem[];
} & {
    afterCreate(): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, Omit<import("@jbrowse/mobx-state-tree").ModelSnapshotType<Omit<Omit<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}, "id" | "type" | "autoTreeAreaWidth" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "labelsAlignRight" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth" | "bgColor" | "colorSchemeName" | "customColorScheme" | "msaFormat" | "showColumnStats" | "allowedGappyness" | "clades" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "encodings" | "features" | "gffFilehandle" | "height" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "region" | "relativeTo" | "residueMappings" | "rotated" | "rowHeight" | "rowPanels" | "scrollX" | "scrollY" | "scrollZoom" | "scrollZoomAxis" | "selection" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "turnedOffFeatures" | "turnedOffTracks"> & Omit<Omit<Omit<{}, "autoTreeAreaWidth" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "labelsAlignRight" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth"> & {
    drawLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    labelsAlignRight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    treeAreaWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    treeWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    showBranchLen: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    treeOrder: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<import("react-msaview").TreeOrder>, [undefined]>;
    drawTree: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    drawNodeBubbles: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    drawNodeLabels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    showTreeOverview: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    overviewHeight: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    autoTreeAreaWidth: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}, "bgColor" | "colorSchemeName" | "customColorScheme" | "msaFormat" | "showColumnStats"> & {
    bgColor: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    colorSchemeName: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    customColorScheme: import("@jbrowse/mobx-state-tree").IType<Record<string, string> | undefined, Record<string, string> | undefined, Record<string, string> | undefined>;
    showColumnStats: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    msaFormat: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<import("react-msaview").MSAFormat>>;
}, "id" | "type" | "allowedGappyness" | "clades" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "encodings" | "features" | "gffFilehandle" | "height" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "region" | "relativeTo" | "residueMappings" | "rotated" | "rowHeight" | "rowPanels" | "scrollX" | "scrollY" | "scrollZoom" | "scrollZoomAxis" | "selection" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "turnedOffFeatures" | "turnedOffTracks"> & {
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    showDomains: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    showDomainLegend: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    hideGaps: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    allowedGappyness: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    subFeatureRows: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ILiteralType<"MsaView">;
    drawMsaLetters: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
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
    turnedOffTracks: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>, [undefined]>;
    trackHeights: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<number>>, [undefined]>;
    columnTracks: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ColumnTrackSpec, import("react-msaview").ColumnTrackSpec, import("react-msaview").ColumnTrackSpec>>, [undefined]>;
    residueMappings: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ResidueMapping, import("react-msaview").ResidueMapping, import("react-msaview").ResidueMapping>>, [undefined]>;
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
    highlightColumns: import("@jbrowse/mobx-state-tree").IType<number[] | undefined, number[] | undefined, number[] | undefined>;
    highlights: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Highlight, import("react-msaview").Highlight, import("react-msaview").Highlight>>, [undefined]>;
    features: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Feature, import("react-msaview").Feature, import("react-msaview").Feature>>, [undefined]>;
    selection: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").MsaSelection | undefined, import("react-msaview").MsaSelection | undefined, import("react-msaview").MsaSelection | undefined>;
    region: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Region | undefined, import("react-msaview").Region | undefined, import("react-msaview").Region | undefined>;
    clades: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Clade, import("react-msaview").Clade, import("react-msaview").Clade>>, [undefined]>;
    encodings: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").Encoding, import("react-msaview").Encoding, import("react-msaview").Encoding>>, [undefined]>;
    rowPanels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").RowPanelSpec, import("react-msaview").RowPanelSpec, import("react-msaview").RowPanelSpec>>, [undefined]>;
}, "init" | "querySeqName" | "querySeqOffset" | "zoomToBaseLevel" | "launchCompleted" | "connectedViewId" | "connectedFeature" | "connectedTranscript" | "blastParams" | "orthologParams" | "uniprotId" | "dataStoreId" | "mafRegion"> & {
    connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    connectedFeature: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
    connectedTranscript: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    blastParams: import("@jbrowse/mobx-state-tree").IType<BlastParams | undefined, BlastParams | undefined, BlastParams | undefined>;
    orthologParams: import("@jbrowse/mobx-state-tree").IType<OrthologParams | undefined, OrthologParams | undefined, OrthologParams | undefined>;
    querySeqName: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
    querySeqOffset: import("@jbrowse/mobx-state-tree").IType<number | undefined, number, number>;
    uniprotId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    zoomToBaseLevel: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    init: import("@jbrowse/mobx-state-tree").IType<MsaViewInitState | undefined, MsaViewInitState | undefined, MsaViewInitState | undefined>;
    dataStoreId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    launchCompleted: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    mafRegion: import("@jbrowse/mobx-state-tree").IType<MafRegion | undefined, MafRegion | undefined, MafRegion | undefined>;
}>, "id" | "type" | "autoTreeAreaWidth" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "labelsAlignRight" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth" | "bgColor" | "colorSchemeName" | "customColorScheme" | "msaFormat" | "showColumnStats" | "allowedGappyness" | "clades" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "encodings" | "features" | "gffFilehandle" | "height" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "region" | "relativeTo" | "residueMappings" | "rotated" | "rowHeight" | "rowPanels" | "scrollX" | "scrollY" | "scrollZoom" | "scrollZoomAxis" | "selection" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "turnedOffFeatures" | "turnedOffTracks"> & ({
    bgColor: boolean;
    colorSchemeName: string;
    customColorScheme: Record<string, string> | undefined;
    showColumnStats: boolean;
    msaFormat: import("react-msaview").MSAFormat | undefined;
    drawLabels: boolean;
    labelsAlignRight: boolean;
    treeAreaWidth: number;
    treeWidth: number;
    showBranchLen: boolean;
    treeOrder: import("react-msaview").TreeOrder;
    drawTree: boolean;
    drawNodeBubbles: boolean;
    drawNodeLabels: boolean;
    showTreeOverview: boolean;
    overviewHeight: number;
    autoTreeAreaWidth: boolean;
    columnTracks: import("react-msaview").ColumnTrackSpec[];
    id: string;
    showDomains: boolean;
    showDomainLegend: boolean;
    hideGaps: boolean;
    allowedGappyness: number;
    subFeatureRows: boolean;
    type: "MsaView";
    drawMsaLetters: boolean;
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
    turnedOffTracks: import("mobx").IKeyValueMap<boolean>;
    trackHeights: import("mobx").IKeyValueMap<number>;
    residueMappings: import("react-msaview").ResidueMapping[];
    turnedOffFeatures: import("mobx").IKeyValueMap<boolean>;
    relativeTo: string | undefined;
    highlightColumns: number[] | undefined;
    highlights: import("react-msaview").Highlight[];
    features: import("react-msaview").Feature[];
    selection: import("react-msaview").MsaSelection | undefined;
    region: import("react-msaview").Region | undefined;
    clades: import("react-msaview").Clade[];
    encodings: import("react-msaview").Encoding[];
    rowPanels: import("react-msaview").RowPanelSpec[];
    data: {
        tree?: string | undefined;
        msa?: string | undefined;
        treeMetadata?: string | undefined;
        gff?: string | undefined;
    };
} | {
    bgColor: boolean;
    colorSchemeName: string;
    customColorScheme: Record<string, string> | undefined;
    showColumnStats: boolean;
    msaFormat: import("react-msaview").MSAFormat | undefined;
    drawLabels: boolean;
    labelsAlignRight: boolean;
    treeAreaWidth: number;
    treeWidth: number;
    showBranchLen: boolean;
    treeOrder: import("react-msaview").TreeOrder;
    drawTree: boolean;
    drawNodeBubbles: boolean;
    drawNodeLabels: boolean;
    showTreeOverview: boolean;
    overviewHeight: number;
    autoTreeAreaWidth: boolean;
    columnTracks?: undefined;
    id: string;
    showDomains: boolean;
    showDomainLegend: boolean;
    hideGaps: boolean;
    allowedGappyness: number;
    subFeatureRows: boolean;
    type: "MsaView";
    drawMsaLetters: boolean;
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
    turnedOffTracks: import("mobx").IKeyValueMap<boolean>;
    trackHeights: import("mobx").IKeyValueMap<number>;
    residueMappings: import("react-msaview").ResidueMapping[];
    turnedOffFeatures: import("mobx").IKeyValueMap<boolean>;
    relativeTo: string | undefined;
    highlightColumns: number[] | undefined;
    highlights: import("react-msaview").Highlight[];
    features: import("react-msaview").Feature[];
    selection: import("react-msaview").MsaSelection | undefined;
    region: import("react-msaview").Region | undefined;
    clades: import("react-msaview").Clade[];
    encodings: import("react-msaview").Encoding[];
    rowPanels: import("react-msaview").RowPanelSpec[];
    data: {
        tree?: string | undefined;
        msa?: string | undefined;
        treeMetadata?: string | undefined;
        gff?: string | undefined;
    };
})>;
export type JBrowsePluginMsaViewStateModel = ReturnType<typeof stateModelFactory>;
export type JBrowsePluginMsaViewModel = Instance<JBrowsePluginMsaViewStateModel>;
export { type MafRegion, type MsaViewInitState } from './types';
export declare function isMsaView(view: {
    type: string;
}): view is JBrowsePluginMsaViewModel;
