import type { AlignmentAlgorithm } from '../../ProteinView/types';
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
declare global {
    interface Window {
        JBrowsePluginMsaView?: unknown;
    }
}
interface LaunchViewParams {
    session: AbstractSessionModel;
    view: LinearGenomeViewModel;
    feature: Feature;
    selectedTranscript?: Feature;
    uniprotId?: string;
}
interface Launch3DExtraParams {
    url?: string;
    data?: string;
    userProvidedTranscriptSequence?: string;
    alignmentAlgorithm?: AlignmentAlgorithm;
    displayName?: string;
}
export declare function formatViewName(prefix: string, feature: Feature, selectedTranscript?: Feature, uniprotId?: string): string;
export declare function launch3DProteinView({ session, view, feature, selectedTranscript, uniprotId, url, data, userProvidedTranscriptSequence, alignmentAlgorithm, displayName, connectedMsaViewId, sideBySide, }: LaunchViewParams & Launch3DExtraParams & {
    connectedMsaViewId?: string;
    sideBySide?: boolean;
}): import("@jbrowse/core/util").AbstractViewModel;
export declare const PROTEIN_LAUNCH_LABELS: {
    readonly '3d': "Launch 3D protein structure view";
    readonly '1d': "Launch 1D protein annotation view";
    readonly msa: "Launch MSA view (AlphaFold a3m)";
    readonly '3d-msa': "Launch 3D structure + MSA view";
};
export declare function getConditionalProteinLaunches({ session, view, feature, selectedTranscript, uniprotId, confidenceUrl, }: LaunchViewParams & {
    confidenceUrl?: string;
}): {
    launch1D: (() => Promise<void>) | undefined;
    launchMsa: (() => import("@jbrowse/core/util").AbstractViewModel | undefined) | undefined;
};
export declare function launch3DProteinViewWithMsa(params: LaunchViewParams & Launch3DExtraParams): import("@jbrowse/core/util").AbstractViewModel | undefined;
export {};
