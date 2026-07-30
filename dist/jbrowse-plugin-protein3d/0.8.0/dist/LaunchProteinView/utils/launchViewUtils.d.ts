import { ALPHAFOLD_VERSION, getAlphaFoldConfidenceUrl, getAlphaFoldMsaUrl, getAlphaFoldStructureUrl, getConfidenceUrlFromTarget, getPdbStructureUrl, getStructureUrlFromTarget, getUniprotIdFromAlphaFoldTarget } from './structureUrls';
export { ALPHAFOLD_VERSION, getAlphaFoldConfidenceUrl, getAlphaFoldMsaUrl, getAlphaFoldStructureUrl, getConfidenceUrlFromTarget, getPdbStructureUrl, getStructureUrlFromTarget, getUniprotIdFromAlphaFoldTarget, };
import type { AbstractSessionModel, Feature, SessionWithAddTracks } from '@jbrowse/core/util';
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
    alignmentAlgorithm?: string;
    displayName?: string;
}
export declare function formatViewName(prefix: string, feature: Feature, selectedTranscript?: Feature, uniprotId?: string): string;
export declare function launch3DProteinView({ session, view, feature, selectedTranscript, uniprotId, url, data, userProvidedTranscriptSequence, alignmentAlgorithm, displayName, connectedMsaViewId, sideBySide, }: LaunchViewParams & Launch3DExtraParams & {
    connectedMsaViewId?: string;
    sideBySide?: boolean;
}): import("@jbrowse/core/util").AbstractViewModel;
export declare function launch1DProteinView({ session, view, feature, selectedTranscript, uniprotId, confidenceUrl, }: Omit<LaunchViewParams, 'session' | 'uniprotId'> & {
    session: SessionWithAddTracks;
    uniprotId: string;
    confidenceUrl?: string;
}): Promise<void>;
export declare function launchMsaView({ session, view, feature, selectedTranscript, uniprotId, displayName, }: LaunchViewParams & {
    displayName?: string;
}): import("@jbrowse/core/util").AbstractViewModel | undefined;
export declare function hasMsaViewPlugin(): boolean;
export declare function getConditionalProteinLaunches({ session, view, feature, selectedTranscript, uniprotId, confidenceUrl, }: LaunchViewParams & {
    confidenceUrl?: string;
}): {
    launch1D: (() => Promise<void>) | undefined;
    launchMsa: (() => import("@jbrowse/core/util").AbstractViewModel | undefined) | undefined;
};
export declare function launch3DProteinViewWithMsa(params: LaunchViewParams & Launch3DExtraParams): import("@jbrowse/core/util").AbstractViewModel | undefined;
