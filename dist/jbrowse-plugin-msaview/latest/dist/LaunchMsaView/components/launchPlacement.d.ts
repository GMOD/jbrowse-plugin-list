import React from 'react';
type PlacementState = [boolean, React.Dispatch<React.SetStateAction<boolean>>];
export declare function LaunchPlacementProvider({ children, }: {
    children: React.ReactNode;
}): React.JSX.Element;
/** the dialog's answer, or a private one for a panel rendered outside it */
export declare function useLaunchPlacement(): PlacementState;
export {};
