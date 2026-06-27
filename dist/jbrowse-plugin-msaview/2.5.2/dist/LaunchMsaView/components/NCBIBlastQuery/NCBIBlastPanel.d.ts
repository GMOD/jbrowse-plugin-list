import React from 'react';
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
declare const panelMap: {
    readonly automatic: ({ handleClose, feature, model, children, baseUrl, }: {
        model: AbstractTrackModel;
        feature: Feature;
        baseUrl: string;
        handleClose: () => void;
        children: React.ReactNode;
    }) => React.JSX.Element;
    readonly rid: ({ handleClose, feature, model, children, baseUrl, }: {
        model: AbstractTrackModel;
        feature: Feature;
        baseUrl: string;
        handleClose: () => void;
        children: React.ReactNode;
    }) => React.JSX.Element;
    readonly manual: ({ handleClose, feature, model, children, baseUrl, }: {
        children: React.ReactNode;
        model: AbstractTrackModel;
        feature: Feature;
        baseUrl: string;
        handleClose: () => void;
    }) => React.JSX.Element;
};
export type BlastLookupMethod = keyof typeof panelMap;
export default function NCBIBlastPanel({ handleClose, model, feature, }: {
    handleClose: () => void;
    model: AbstractTrackModel;
    feature: Feature;
}): React.JSX.Element;
export {};
