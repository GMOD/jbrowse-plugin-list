declare global {
    interface Window {
        JBrowsePluginMsaView?: unknown;
    }
}
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare const ALPHAFOLD_VERSION = "v6";
export declare function getAlphaFoldStructureUrl(uniprotId: string, version?: string): string;
export declare function getAlphaFoldConfidenceUrl(uniprotId: string, version?: string): string;
export declare function getAlphaFoldMsaUrl(uniprotId: string, version?: string): string;
export declare function getPdbStructureUrl(pdbId: string): string;
export declare function getUniprotIdFromAlphaFoldTarget(target: string): string | undefined;
export declare function getStructureUrlFromTarget(target: string, db: string): string | undefined;
export declare function getConfidenceUrlFromTarget(target: string): string | undefined;
interface LaunchViewParams {
    session: AbstractSessionModel;
    view: LinearGenomeViewModel;
    feature: Feature;
    selectedTranscript?: Feature;
    uniprotId?: string;
}
export declare function launch3DProteinView({ session, view, feature, selectedTranscript, uniprotId, url, data, userProvidedTranscriptSequence, alignmentAlgorithm, displayName, }: LaunchViewParams & {
    url?: string;
    data?: string;
    userProvidedTranscriptSequence?: string;
    alignmentAlgorithm?: string;
    displayName?: string;
}): import("@jbrowse/core/util").AbstractViewModel;
export declare function launch1DProteinView({ session, view, feature, selectedTranscript, uniprotId, confidenceUrl, }: LaunchViewParams & {
    confidenceUrl?: string;
}): Promise<void>;
export declare function launchMsaView({ session, view, feature, selectedTranscript, uniprotId, }: LaunchViewParams): import("@jbrowse/core/util").AbstractViewModel | undefined;
export declare function hasMsaViewPlugin(): boolean;
export declare function launch3DProteinViewWithMsa({ session, view, feature, selectedTranscript, uniprotId, url, data, userProvidedTranscriptSequence, alignmentAlgorithm, displayName, }: LaunchViewParams & {
    url?: string;
    data?: string;
    userProvidedTranscriptSequence?: string;
    alignmentAlgorithm?: string;
    displayName?: string;
}): import("@jbrowse/core/util").AbstractViewModel | undefined;
export {};
