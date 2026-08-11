import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const panelMap: {
    readonly automatic: ({ handleClose, feature, model, children, }: {
        model: AbstractTrackModel;
        feature: Feature;
        handleClose: () => void;
        children: React.ReactNode;
    }) => React.JSX.Element;
    readonly manual: ({ handleClose, feature, model, children, }: {
        children: React.ReactNode;
        model: AbstractTrackModel;
        feature: Feature;
        handleClose: () => void;
    }) => React.JSX.Element;
};
export type BlastLookupMethod = keyof typeof panelMap;
export default function BlastPanel({ handleClose, model, feature, }: {
    handleClose: () => void;
    model: AbstractTrackModel;
    feature: Feature;
}): React.JSX.Element;
export {};
