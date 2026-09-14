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
    minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
}, "id" | "type" | "autoTreeAreaWidth" | "drawLabels" | "drawNodeBubbles" | "drawTree" | "labelsAlignRight" | "showBranchLen" | "treeAreaWidth" | "treeWidth" | "bgColor" | "colorSchemeName" | "msaFormat" | "showColumnStats" | "allowedGappyness" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "gffFilehandle" | "height" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "relativeTo" | "residueMappings" | "rowHeight" | "scrollX" | "scrollY" | "scrollZoom" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "treeFilehandle" | "treeMetadataFilehandle" | "turnedOffFeatures" | "turnedOffTracks"> & Omit<Omit<Omit<{}, "autoTreeAreaWidth" | "drawLabels" | "drawNodeBubbles" | "drawTree" | "labelsAlignRight" | "showBranchLen" | "treeAreaWidth" | "treeWidth"> & {
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
}, "id" | "type" | "allowedGappyness" | "colWidth" | "collapsed" | "columnTracks" | "currentAlignment" | "data" | "drawMsaLetters" | "gffFilehandle" | "height" | "hideGaps" | "highlightColumns" | "highlights" | "msaFilehandle" | "relativeTo" | "residueMappings" | "rowHeight" | "scrollX" | "scrollY" | "scrollZoom" | "showDomainLegend" | "showDomains" | "showOnly" | "subFeatureRows" | "treeFilehandle" | "treeMetadataFilehandle" | "turnedOffFeatures" | "turnedOffTracks"> & {
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    showDomains: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
    showDomainLegend: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>, [undefined]>;
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
}, "init" | "querySeqName" | "querySeqOffset" | "zoomToBaseLevel" | "connectedViewId" | "connectedFeature" | "connectedTranscript" | "blastParams" | "orthologParams" | "uniprotId" | "dataStoreId" | "mafRegion"> & {
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
    mafRegion: import("@jbrowse/mobx-state-tree").IType<MafRegion | undefined, MafRegion | undefined, MafRegion | undefined>;
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
    conservationTrackHeight: number;
    columnTrackHeights: Record<string, number>;
    sequenceLogoTrackHeight: number;
    arcTrackHeight: number;
    marginLeft: number;
    error: unknown;
    warnings: string[];
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
    clearWarnings(): void;
    setHostCarriesData(arg: boolean): void;
    setMousePos(col?: number, row?: number): void;
    setHighlightedColumns(columns?: number[]): void;
    setHighlights(highlights: import("react-msaview").Highlight[]): void;
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
    setGFF(result: string): void;
} & {
    readonly hideGapsEffective: boolean;
    readonly realAllowedGappyness: number;
    readonly actuallyShowDomains: boolean;
    readonly hostRestoresData: boolean;
    readonly viewInitialized: boolean;
    readonly width: number;
} & {
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
    readonly unshareableData: import("react-msaview").UnshareableData[];
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
    readonly hierarchy: import("react-msaview").HierarchyNode<import("react-msaview").NodeWithIdsAndLength>;
    readonly totalHeight: number;
    readonly leaves: import("react-msaview").HierarchyNode<import("react-msaview").NodeWithIdsAndLength>[];
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
    readonly labelWidthMap: Map<string, number>;
    readonly labelWidthScale: number;
    readonly labelsWidth: number;
    readonly secondaryStructureConsensus: string | undefined;
    readonly seqConsensus: string | undefined;
    readonly secondaryStructureArcs: import("react-msaview").Arc[] | undefined;
    readonly adapterTrackModels: import("react-msaview").BasicTrack[];
    readonly columnTrackContent: Map<string, {
        values?: number[];
        data?: string;
        arcs?: import("react-msaview").Arc[];
    }>;
    readonly columnTrackModels: import("react-msaview").BasicTrack[];
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
    seqPosToVisibleCol(rowName: string, seqPos: number): number | undefined;
    readonly residueMappingProblems: import("react-msaview").ResidueMappingProblem[];
    readonly usableResidueMappings: import("react-msaview").ResidueMapping[];
    readonly mappedStructures: {
        row: string;
        structure: import("react-msaview").MappedStructure;
    }[];
    structureResidue(rowName: string, seqPos: number, structureId?: string): import("react-msaview").StructureResidue | undefined;
    rowResidue(structureId: string, position: number, asymId?: string): import("react-msaview").RowResidue | undefined;
} & {
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
    readonly blocks2d: (readonly [number, number])[];
    readonly isLoading: boolean;
    readonly maxScrollX: number;
    readonly maxScrollY: number;
} & {
    setDrawMsaLetters(arg: boolean): void;
    setScrollZoom(arg: boolean): void;
    setHoveredTreeNode(nodeId?: string): void;
    calculateNeighborJoiningTreeFromMSA(): void;
    replaceTree(newick: string): void;
    resetZoom(): void;
    zoomOutHorizontal(): void;
    zoomInHorizontal(): void;
    zoomInVertical(): void;
    zoomOutVertical(): void;
    zoomIn(): void;
    zoomOut(): void;
    zoomToPos(scaleFactor: number, offsetX: number, offsetY: number): void;
    doScrollY(deltaY: number): void;
    setScrollY(n: number): void;
    setAnnotations(annotations: import("react-msaview").Annotation[]): void;
    setDomains(data?: Record<string, import("react-msaview").InterProScanResults>): void;
    applyGFFText(gffText: string): void;
    doScrollX(deltaX: number): void;
    setScrollX(n: number): void;
    setColumnTracks(tracks: import("react-msaview").ColumnTrackSpec[]): void;
    setResidueMappings(mappings: import("react-msaview").ResidueMapping[]): void;
    toggleTrack(id: string): void;
    setStatus(status?: {
        msg: string;
        onCancel?: () => void;
    }): void;
} & {
    readonly verticalScrollbarWidth: 0 | 20;
    readonly msaCanvasWidth: number;
    readonly segmentDomainTypes: import("react-msaview").Annotation[];
    readonly categoricalDomainTypes: import("react-msaview").Annotation[];
    readonly fillPalette: {
        [x: string]: string;
    };
    readonly strokePalette: {
        [k: string]: string;
    };
    readonly segmentLabels: Map<string, string>;
    readonly visibleDomainTypes: import("react-msaview").Annotation[];
    readonly domainBands: Map<string, import("react-msaview").DomainBand[]>;
    readonly domainBandsByStart: Map<string, import("react-msaview").DomainBand[]>;
    readonly mouseOverDomains: import("react-msaview").Annotation[];
    readonly referenceRowIndex: number | undefined;
    readonly hoveredRowIndices: number[];
    readonly highlightedColumnRuns: {
        start: number;
        end: number;
    }[];
    readonly resolvedHighlights: import("react-msaview").ResolvedHighlight[];
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
    setColumnTrackHeight(id: string, height: number): void;
    setSequenceLogoTrackHeight(arg: number): void;
    setArcTrackHeight(arg: number): void;
    reset(): void;
    exportSVG(opts: import("react-msaview").ExportSvgOptions): Promise<void>;
    setFilter(accession: string, shown: boolean): void;
    fit(): void;
    fitVertically(): void;
    fitHorizontally(): void;
    afterCreate(): void;
} & {
    rid: string | undefined;
    progress: string;
    loadingStoredData: boolean;
    isStoringData: boolean;
    lastStoredData: MsaDataPayload | undefined;
    launchController: AbortController | undefined;
    domainsRequested: boolean;
} & {
    /**
     * #getter
     */
    readonly transcriptToMsaMap: {
        g2p: Record<number, number>;
        p2g: Record<number, number>;
        p2gCodon: Record<number, number[]>;
        refName: string;
        strand: number;
    } | undefined;
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
    setQuerySeqOffset(arg: number): void;
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
    setIsStoringData(arg: boolean): void;
    /**
     * #action
     */
    setLastStoredData(arg?: MsaDataPayload): void;
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
     * Run the failed request again. The request IS the params, so re-stating
     * them is the whole retry: each is a frozen property, and a fresh object
     * is a change the launch autoruns wake on.
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
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
}> & (({
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
    residueMappings: import("react-msaview").ResidueMapping[];
    turnedOffFeatures: import("mobx").IKeyValueMap<boolean>;
    relativeTo: string | undefined;
    highlightColumns: number[] | undefined;
    highlights: import("react-msaview").Highlight[];
    data: {
        tree?: string | undefined;
        msa?: string | undefined;
        treeMetadata?: string | undefined;
        gff?: string | undefined;
    };
} & import("@jbrowse/mobx-state-tree")._NotCustomized) | ({
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
    residueMappings: import("react-msaview").ResidueMapping[];
    turnedOffFeatures: import("mobx").IKeyValueMap<boolean>;
    relativeTo: string | undefined;
    highlightColumns: number[] | undefined;
    highlights: import("react-msaview").Highlight[];
    data: {
        tree?: string | undefined;
        msa?: string | undefined;
        treeMetadata?: string | undefined;
        gff?: string | undefined;
    };
} & import("@jbrowse/mobx-state-tree")._NotCustomized))>;
export type JBrowsePluginMsaViewStateModel = ReturnType<typeof stateModelFactory>;
export type JBrowsePluginMsaViewModel = Instance<JBrowsePluginMsaViewStateModel>;
export { type MafRegion, type MsaViewInitState } from './types';
export declare function isMsaView(view: {
    type: string;
}): view is JBrowsePluginMsaViewModel;
