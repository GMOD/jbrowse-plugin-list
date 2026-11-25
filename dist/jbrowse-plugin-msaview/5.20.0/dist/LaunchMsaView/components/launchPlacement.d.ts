import React from 'react';
import type { AbstractTrackModel } from '@jbrowse/core/util';
type PlacementState = [boolean, React.Dispatch<React.SetStateAction<boolean>>];
export declare const LaunchPlacementProvider: ({ children, }: {
    children: React.ReactNode;
}) => React.JSX.Element;
/** the dialog's answer, or a private one for a panel rendered outside it */
export declare function useLaunchPlacement(): PlacementState;
export declare function useSubmitPlacement(model?: AbstractTrackModel): {
    offerPlacement: boolean;
    sideBySide: boolean;
    setSideBySide: React.Dispatch<React.SetStateAction<boolean>>;
    commitPlacement: () => import("../../utils/workspaces").MsaViewPlacement;
};
export {};
