import type { ProteinColorScheme } from './applyColorTheme';
import type { PairwiseAlignment } from '../mappings';
import type { SimpleFeatureSerialized } from '@jbrowse/core/util';
/**
 * One structure in a ProteinView, described declaratively. Every field maps
 * directly onto a Structure model property, so a spec is exactly the snapshot
 * MST hydrates — no imperative post-creation setup.
 */
export interface ProteinStructureSpec {
    url?: string;
    data?: string;
    uniprotId?: string;
    pdbId?: string;
    connectedViewId?: string;
    feature?: SimpleFeatureSerialized;
    userProvidedTranscriptSequence?: string;
    initialSelection?: {
        start: number;
        end: number;
    };
    pairwiseAlignment?: PairwiseAlignment;
}
/**
 * A whole ProteinView described declaratively. Mirrors the top-level model
 * properties: there is no separate `init` channel, matching how the launchers
 * and gene-explorer already build the snapshot.
 */
export interface ProteinViewSpec {
    structures: ProteinStructureSpec[];
    displayName?: string;
    height?: number;
    showControls?: boolean;
    showAlignment?: boolean;
    showHighlight?: boolean;
    showProteinTracks?: boolean;
    compactTracks?: boolean;
    zoomToBaseLevel?: boolean;
    autoScrollAlignment?: boolean;
    colorScheme?: ProteinColorScheme;
    alignmentAlgorithm?: string;
    connectedMsaViewId?: string;
}
/**
 * The single source of truth for turning a ProteinViewSpec into the snapshot
 * handed to `session.addView('ProteinView', ...)`. Every launch path funnels
 * through here so they can't drift into different subsets of the same view.
 */
export declare function proteinViewSnapshot(spec: ProteinViewSpec): {
    structures: {
        userProvidedTranscriptSequence: string;
        url?: string;
        data?: string;
        uniprotId?: string;
        pdbId?: string;
        connectedViewId?: string;
        feature?: SimpleFeatureSerialized;
        initialSelection?: {
            start: number;
            end: number;
        };
        pairwiseAlignment?: PairwiseAlignment;
    }[];
    displayName?: string;
    height?: number;
    showControls?: boolean;
    showAlignment?: boolean;
    showHighlight?: boolean;
    showProteinTracks?: boolean;
    compactTracks?: boolean;
    zoomToBaseLevel?: boolean;
    autoScrollAlignment?: boolean;
    colorScheme?: ProteinColorScheme;
    alignmentAlgorithm?: string;
    connectedMsaViewId?: string;
    type: "ProteinView";
};
