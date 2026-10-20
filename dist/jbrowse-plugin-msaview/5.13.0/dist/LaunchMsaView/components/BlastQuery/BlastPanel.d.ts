import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const panelMap: {
    readonly automatic: ({ handleClose, feature, model, children, preferredTranscriptId, }: {
        model: AbstractTrackModel;
        feature: Feature;
        handleClose: () => void;
        children: React.ReactNode;
        preferredTranscriptId?: string;
    }) => React.JSX.Element;
    readonly manual: ({ handleClose, feature, model, children, preferredTranscriptId, }: {
        children: React.ReactNode;
        model: AbstractTrackModel;
        feature: Feature;
        handleClose: () => void;
        preferredTranscriptId?: string;
    }) => React.JSX.Element;
};
export type BlastLookupMethod = keyof typeof panelMap;
export default function BlastPanel({ handleClose, model, feature, preferredTranscriptId, }: {
    handleClose: () => void;
    model: AbstractTrackModel;
    feature: Feature;
    /** the isoform the user right-clicked, preselected in the picker */
    preferredTranscriptId?: string;
}): React.JSX.Element;
export {};
