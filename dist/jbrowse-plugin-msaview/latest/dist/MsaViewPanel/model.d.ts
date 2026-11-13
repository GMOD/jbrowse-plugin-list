export type { MSAFormat } from 'msa-parsers';
import type { BlastDatabase, MsaAlgorithm, PhmmerDatabase } from '../LaunchMsaView/components/BlastQuery/consts';
import type { UnirefIdentity } from '../utils/unirefHomologs';
import type { ConnectedDomains } from './connectedDomains';
import type { MsaDataPayload } from './msaDataStore';
import type { MafRegion, MsaViewInitState } from './types';
import type { TranscriptRef } from './util';
import type { MenuItem } from '@jbrowse/core/ui';
import type { AbstractViewModel } from '@jbrowse/core/util';
import type { Instance } from '@jbrowse/mobx-state-tree';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
type LGV = LinearGenomeViewModel;
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
}, "id" | "type" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "labelsAlignRight" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth" | "msaFormat" | "residueColor" | "showColumnStats" | "allowedGappyness" | "clades" | "cladesSeeded" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "embeddedMode" | "encodings" | "features" | "gffFilehandle" | "height" | "hiddenCategories" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "region" | "relativeTo" | "residueMappings" | "rotated" | "rowHeight" | "rowPanels" | "rowTransform" | "scrollX" | "scrollY" | "scrollZoom" | "scrollZoomAxis" | "selection" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "trimToSelection" | "turnedOffFeatures" | "turnedOffTracks"> & Omit<Omit<Omit<{}, "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "labelsAlignRight" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth"> & {
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
}, "msaFormat" | "residueColor" | "showColumnStats"> & {
    residueColor: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ResidueColor, import("react-msaview").ResidueColor, import("react-msaview").ResidueColor>, [undefined]>;
    showColumnStats: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    msaFormat: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<import("msa-parsers").MSAFormat>>;
}, "id" | "type" | "allowedGappyness" | "clades" | "cladesSeeded" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "embeddedMode" | "encodings" | "features" | "gffFilehandle" | "height" | "hiddenCategories" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "region" | "relativeTo" | "residueMappings" | "rotated" | "rowHeight" | "rowPanels" | "rowTransform" | "scrollX" | "scrollY" | "scrollZoom" | "scrollZoomAxis" | "selection" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "trimToSelection" | "turnedOffFeatures" | "turnedOffTracks"> & {
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
    hiddenCategories: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").HiddenCategory, import("react-msaview").HiddenCategory, import("react-msaview").HiddenCategory>>, [undefined]>;
    rowPanels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").RowPanelSpec, import("react-msaview").RowPanelSpec, import("react-msaview").RowPanelSpec>>, [undefined]>;
    rowTransform: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").RowTransform | undefined, import("react-msaview").RowTransform | undefined, import("react-msaview").RowTransform | undefined>;
}, "init" | "querySeqName" | "embeddedMode" | "launchCompleted" | "connectedViewId" | "connectedFeature" | "connectedTranscript" | "blastParams" | "orthologParams" | "querySeqOffset" | "uniprotId" | "zoomToBaseLevel" | "dataStoreId" | "mafRegion" | "domainsOnGenome"> & {
    connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    connectedFeature: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
    connectedTranscript: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    blastParams: import("@jbrowse/mobx-state-tree").IType<BlastParams | undefined, BlastParams | undefined, BlastParams | undefined>;
    orthologParams: import("@jbrowse/mobx-state-tree").IType<OrthologParams | undefined, OrthologParams | undefined, OrthologParams | undefined>;
    querySeqName: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    querySeqOffset: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    uniprotId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    zoomToBaseLevel: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    init: import("@jbrowse/mobx-state-tree").IType<MsaViewInitState | undefined, MsaViewInitState | undefined, MsaViewInitState | undefined>;
    dataStoreId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    launchCompleted: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    mafRegion: import("@jbrowse/mobx-state-tree").IType<MafRegion | undefined, MafRegion | undefined, MafRegion | undefined>;
    embeddedMode: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    domainsOnGenome: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}, {
    width: number;
    bodyMounted: boolean;
} & {
    readonly rendersDisplays: boolean;
    readonly effectiveBodyMounted: boolean;
    menuItems(): MenuItem[];
    readonly ownTracks: import("@jbrowse/core/util").AbstractTrackModel[];
    readonly ownViews: AbstractViewModel[];
} & {
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
    setMSAFormat(arg?: import("msa-parsers").MSAFormat): void;
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
    transientHighlights: Record<string, import("react-msaview").Highlight[]>;
    minimapHeight: number;
    marginLeft: number;
    error: unknown;
    loadWarnings: string[];
    dismissedWarnings: string[];
    resetCount: number;
    hostCarriesData: boolean;
    annotations: import("msa-parsers").Annotation[];
} & {
    drawRelativeTo(id: string | undefined): void;
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
    setHighlights(highlights: import("react-msaview").Highlight[]): void;
    setFeatures(features: import("react-msaview").Feature[]): void;
    setSelection(selection?: import("react-msaview").MsaSelection): void;
    clearSelection(): void;
    setHeldTrimSpan(span?: {
        start: number;
        end: number;
    }): void;
    setClades(clades: import("react-msaview").Clade[]): void;
    applyHighlight(owner: string, highlights: import("react-msaview").Highlight[]): void;
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
    readonly colorRecords: import("react-msaview").ColorRecord[];
    readonly activeHiddenCategories: import("react-msaview").HiddenValues;
    annotationHidden(annotation: import("msa-parsers").Annotation): boolean;
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
    readonly MSA: import("msa-parsers").MSAParserType | null;
    readonly allAnnotations: import("msa-parsers").Annotation[];
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
    readonly annotationTypes: Map<string, import("msa-parsers").Annotation>;
    readonly defaultOffAccessions: Set<string>;
    featureOff(accession: string): boolean;
    readonly typeFilteredAnnotations: import("msa-parsers").Annotation[];
    readonly filteredAnnotations: import("msa-parsers").Annotation[];
    readonly cellFill: "residue" | "domain" | "none";
    readonly annotationsByRow: Record<string, import("msa-parsers").Annotation[]>;
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
    setAnnotations(annotations: import("msa-parsers").Annotation[]): void;
    applyGFFText(gffText: string): void;
    doScrollX(deltaX: number): void;
    setScrollX(n: number): void;
    setColumnTracks(tracks: import("react-msaview").ColumnTrackSpec[]): void;
    setRowData(rowData: import("react-msaview").RowDataInput): void;
    setEncodings(encodings: import("react-msaview").Encoding[]): void;
    setRowPanels(panels: import("react-msaview").RowPanelSpec[]): void;
    setRowTransform(transform?: import("react-msaview").RowTransform): void;
    setResidueMappings(mappings: import("react-msaview").ResidueMapping[]): void;
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
    readonly segmentDomainTypes: import("msa-parsers").Annotation[];
    readonly domainLegendItems: import("react-msaview").LegendItem[];
    readonly categoricalDomainTypes: import("msa-parsers").Annotation[];
    readonly fillPalette: {
        [x: string]: string;
    };
    readonly featureFillEncoding: import("react-msaview").ResolvedEncoding | undefined;
    readonly featureColors: Map<import("msa-parsers").Annotation, {
        fill: string;
        stroke: string;
    }>;
    readonly featureLabels: Map<import("msa-parsers").Annotation, string> | undefined;
    readonly segmentLabels: Map<string, string>;
    readonly visibleDomainTypes: import("msa-parsers").Annotation[];
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
    readonly mouseOverDomains: import("msa-parsers").Annotation[];
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
    readonly colorEncodings: import("react-msaview").ColorEncoding[];
    encodingFor(channel: import("react-msaview").ColorEncodingChannel): import("react-msaview").ResolvedEncoding | undefined;
    readonly resolvedScales: Map<string, import("react-msaview").SharedScale>;
    scaleOf(channel: import("react-msaview").ColorChannel, table: import("react-msaview").ScaleTable): import("react-msaview").SharedScale;
    readonly rowPanelScales: ({
        axis?: import("react-msaview").PanelAxis | undefined;
        header: string;
        field: string;
        kind: "strip";
        colors: Map<string, string>;
        legend: import("react-msaview").LegendItem[];
        legendKey?: string | undefined;
        legendTitle?: string | undefined;
        legendNote?: string | undefined;
    } | {
        axis?: import("react-msaview").PanelAxis | undefined;
        header: string;
        x: "column" | "position";
        field?: string | undefined;
        kind: "features";
        colors: Map<import("msa-parsers").Annotation, {
            fill: string;
            stroke: string;
        }>;
        legend: import("react-msaview").LegendItem[];
        legendKey?: string | undefined;
        legendTitle?: string | undefined;
        legendNote?: string | undefined;
        labels?: Map<import("msa-parsers").Annotation, string> | undefined;
    } | (Omit<import("react-msaview").ResolvedValuePanel, "axis" | "id" | "width" | "offsetX"> & {
        valueScale: import("react-msaview").ValueScale;
    }) | {
        axis?: import("react-msaview").PanelAxis | undefined;
        header: string;
        field: string;
        kind: "text";
        colors: Map<string, string>;
        legend: import("react-msaview").LegendItem[];
        legendKey?: string | undefined;
        legendTitle?: string | undefined;
        legendNote?: string | undefined;
        colorField?: string | undefined;
        hiddenRows: Set<string>;
        texts: Map<string, string>;
    })[];
    readonly featureTrackScales: Map<string, {
        readonly colors: Map<import("msa-parsers").Annotation, {
            fill: string;
            stroke: string;
        }>;
        readonly labels: Map<import("msa-parsers").Annotation, string> | undefined;
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
    rid: string | undefined;
    progress: string;
    loadingStoredData: boolean;
    isStoringData: boolean;
    lastStoredData: MsaDataPayload | undefined;
    ownsDataStoreRow: boolean;
    launchController: AbortController | undefined;
    domainsRequested: boolean;
    loadingDomains: boolean;
    connectionError: unknown;
} & {
    /**
     * #getter
     * the linked transcript's genome mapping, or why it has none
     */
    readonly transcriptMapping: {
        reason: string;
    } | {
        map: {
            codingPositions: number[];
            g2p: Record<number, number>;
            p2g: Record<number, number>;
            p2gCodon: Record<number, number[]>;
            refName: string;
            strand: number;
        };
    } | undefined;
    /**
     * #getter
     * whatever view `connectedViewId` names, genome view or not
     */
    readonly viewNamedByConnectedViewId: AbstractViewModel | undefined;
} & {
    /**
     * #getter
     * the view `connectedViewId` names, when it is a genome view
     */
    readonly connectedView: LGV | undefined;
} & {
    /**
     * #getter
     */
    readonly transcriptToMsaMap: {
        codingPositions: number[];
        g2p: Record<number, number>;
        p2g: Record<number, number>;
        p2gCodon: Record<number, number[]>;
        refName: string;
        strand: number;
    } | undefined;
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
    /**
     * #getter
     * cross-plugin contract: the query row's domains on the genome, with
     * the color object every surface paints them through.
     * jbrowse-plugin-protein3d reads it to draw them on the structure
     */
    readonly connectedDomains: ConnectedDomains;
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
    /**
     * #getter
     * what is wrong with the link to the genome, derived from the view's
     * state so each clears when its cause does. A connection failure that
     * is already the view's `error` is not repeated here.
     */
    readonly linkNotices: string[];
    /**
     * #getter
     * true while a launch, stored data, a file, the transcript lookup or the
     * protein domains are still loading and no error has ended it. Every
     * term settles on failure. jb.waitReady, the app's ready marker and
     * screenshot tools read it for a view.
     */
    readonly showLoading: boolean;
} & {
    /**
     * #getter
     * overrides base
     *
     * react-msaview's load and data warnings, plus the plugin's link
     * notices, which the header's warning chip lists and dismisses alike
     */
    readonly warnings: string[];
} & {
    /**
     * #getter
     * what failed and left the view working: the messages the header's
     * warning chip lists. A notice does not end `showLoading`.
     */
    readonly notices: string[];
} & {
    /**
     * #getter
     * what the view resolved to, as plain JSON. See docs/reading-the-view.md
     */
    readonly report: {
        loading: boolean;
        error: string | undefined;
        notices: string[];
        source: {
            kind: string;
            database: "uniprotkb_swissprot" | "uniprotkb" | "pan_proteomes" | "uniprotkb_trembl" | "swissprot" | "uniprotrefprot" | "rp75" | "rp55" | "rp35" | "rp15";
            msaAlgorithm: "clustalo" | "muscle" | "kalign" | "mafft" | "browser" | undefined;
            maxHits: number | undefined;
            accession: string | undefined;
            queryLength: number | undefined;
            jobId: string | undefined;
            completed: boolean;
        } | {
            kind: string;
            orthologSource: "ncbi" | "panther" | "uniref";
            taxId: number;
            identity: UnirefIdentity | undefined;
            maxSpecies: number | undefined;
            taxa: number[] | undefined;
            geneCandidates: string[];
            msaAlgorithm: "clustalo" | "muscle" | "kalign" | "mafft" | "browser";
            queryLength: number | undefined;
            jobId: string | undefined;
            completed: boolean;
        } | {
            kind: string;
            url: string;
            uri?: undefined;
            name?: undefined;
            location?: undefined;
        } | {
            kind: string;
            uri: string;
            name: string | undefined;
            url?: undefined;
            location?: undefined;
        } | {
            kind: string;
            location: string | undefined;
            url?: undefined;
            uri?: undefined;
            name?: undefined;
        } | {
            kind: string;
            url?: undefined;
            uri?: undefined;
            name?: undefined;
            location?: undefined;
        };
        rows: number;
        columns: number;
        domainAnnotations: number;
        uniprotId: string | undefined;
        queryRow: {
            name: string;
            found: boolean;
            offset: number;
        };
        connection: {
            viewId: string | undefined;
            viewOpen: boolean;
            transcript: string | undefined;
            refName: string | undefined;
            mapped: boolean;
            unmappedBecause: string | undefined;
        } | undefined;
    };
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
    setLoadingDomains(arg: boolean): void;
    /**
     * #action
     * `connectedTranscript` could not be resolved. A launch waiting on it
     * cannot run, so for one that is the view's error; an alignment from
     * anywhere else is still worth showing, so then it is a notice.
     */
    failConnection(e: unknown): void;
    /**
     * #action
     */
    clearConnectionFailure(): void;
    /**
     * #action
     */
    setDomainsOnGenome(arg: boolean): void;
    /**
     * #action
     * Add the query row's domains to the connected genome view as a session
     * track, replacing the one an earlier call added.
     */
    showDomainsOnGenome(): void;
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
     * #action
     * overrides base, so dismissing the warning chip hides the link
     * notices too until their cause changes
     */
    clearWarnings(): void;
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
}, "id" | "type" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "labelsAlignRight" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth" | "msaFormat" | "residueColor" | "showColumnStats" | "allowedGappyness" | "clades" | "cladesSeeded" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "embeddedMode" | "encodings" | "features" | "gffFilehandle" | "height" | "hiddenCategories" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "region" | "relativeTo" | "residueMappings" | "rotated" | "rowHeight" | "rowPanels" | "rowTransform" | "scrollX" | "scrollY" | "scrollZoom" | "scrollZoomAxis" | "selection" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "trimToSelection" | "turnedOffFeatures" | "turnedOffTracks"> & Omit<Omit<Omit<{}, "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "labelsAlignRight" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth"> & {
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
}, "msaFormat" | "residueColor" | "showColumnStats"> & {
    residueColor: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").ResidueColor, import("react-msaview").ResidueColor, import("react-msaview").ResidueColor>, [undefined]>;
    showColumnStats: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    msaFormat: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<import("msa-parsers").MSAFormat>>;
}, "id" | "type" | "allowedGappyness" | "clades" | "cladesSeeded" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "embeddedMode" | "encodings" | "features" | "gffFilehandle" | "height" | "hiddenCategories" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "region" | "relativeTo" | "residueMappings" | "rotated" | "rowHeight" | "rowPanels" | "rowTransform" | "scrollX" | "scrollY" | "scrollZoom" | "scrollZoomAxis" | "selection" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "trimToSelection" | "turnedOffFeatures" | "turnedOffTracks"> & {
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
    hiddenCategories: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").HiddenCategory, import("react-msaview").HiddenCategory, import("react-msaview").HiddenCategory>>, [undefined]>;
    rowPanels: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IType<import("react-msaview").RowPanelSpec, import("react-msaview").RowPanelSpec, import("react-msaview").RowPanelSpec>>, [undefined]>;
    rowTransform: import("@jbrowse/mobx-state-tree").IType<import("react-msaview").RowTransform | undefined, import("react-msaview").RowTransform | undefined, import("react-msaview").RowTransform | undefined>;
}, "init" | "querySeqName" | "embeddedMode" | "launchCompleted" | "connectedViewId" | "connectedFeature" | "connectedTranscript" | "blastParams" | "orthologParams" | "querySeqOffset" | "uniprotId" | "zoomToBaseLevel" | "dataStoreId" | "mafRegion" | "domainsOnGenome"> & {
    connectedViewId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    connectedFeature: import("@jbrowse/mobx-state-tree").IType<any, any, any>;
    connectedTranscript: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    blastParams: import("@jbrowse/mobx-state-tree").IType<BlastParams | undefined, BlastParams | undefined, BlastParams | undefined>;
    orthologParams: import("@jbrowse/mobx-state-tree").IType<OrthologParams | undefined, OrthologParams | undefined, OrthologParams | undefined>;
    querySeqName: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    querySeqOffset: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<number>, [undefined]>;
    uniprotId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    zoomToBaseLevel: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    init: import("@jbrowse/mobx-state-tree").IType<MsaViewInitState | undefined, MsaViewInitState | undefined, MsaViewInitState | undefined>;
    dataStoreId: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    launchCompleted: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    mafRegion: import("@jbrowse/mobx-state-tree").IType<MafRegion | undefined, MafRegion | undefined, MafRegion | undefined>;
    embeddedMode: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    domainsOnGenome: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
}>, "id" | "type" | "drawLabels" | "drawNodeBubbles" | "drawNodeLabels" | "drawTree" | "labelsAlignRight" | "overviewHeight" | "showBranchLen" | "showTreeOverview" | "treeAreaWidth" | "treeOrder" | "treeWidth" | "msaFormat" | "residueColor" | "showColumnStats" | "allowedGappyness" | "clades" | "cladesSeeded" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "embeddedMode" | "encodings" | "features" | "gffFilehandle" | "height" | "hiddenCategories" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "region" | "relativeTo" | "residueMappings" | "rotated" | "rowHeight" | "rowPanels" | "rowTransform" | "scrollX" | "scrollY" | "scrollZoom" | "scrollZoomAxis" | "selection" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "trackHeights" | "treeFilehandle" | "treeMetadataFilehandle" | "treeRoot" | "trimToSelection" | "turnedOffFeatures" | "turnedOffTracks"> & ({
    residueColor: import("react-msaview").ResidueColor;
    showColumnStats: boolean;
    msaFormat: import("msa-parsers").MSAFormat | undefined;
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
    turnedOffFeatures: import("mobx").IKeyValueMap<boolean>;
    relativeTo: string | undefined;
    highlightColumns: number[] | undefined;
    highlights: import("react-msaview").Highlight[];
    features: import("react-msaview").Feature[];
    selection: import("react-msaview").MsaSelection | undefined;
    region: import("react-msaview").Region | undefined;
    clades: import("react-msaview").Clade[];
    encodings: import("react-msaview").Encoding[];
    hiddenCategories: import("react-msaview").HiddenCategory[];
    rowPanels: import("react-msaview").RowPanelSpec[];
    rowTransform: import("react-msaview").RowTransform | undefined;
    data: {
        tree?: string | undefined;
        msa?: string | undefined;
        treeMetadata?: string | undefined;
        gff?: string | undefined;
    };
} | {
    residueColor: import("react-msaview").ResidueColor;
    showColumnStats: boolean;
    msaFormat: import("msa-parsers").MSAFormat | undefined;
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
    turnedOffFeatures: import("mobx").IKeyValueMap<boolean>;
    relativeTo: string | undefined;
    highlightColumns: number[] | undefined;
    highlights: import("react-msaview").Highlight[];
    features: import("react-msaview").Feature[];
    selection: import("react-msaview").MsaSelection | undefined;
    region: import("react-msaview").Region | undefined;
    clades: import("react-msaview").Clade[];
    encodings: import("react-msaview").Encoding[];
    hiddenCategories: import("react-msaview").HiddenCategory[];
    rowPanels: import("react-msaview").RowPanelSpec[];
    rowTransform: import("react-msaview").RowTransform | undefined;
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
