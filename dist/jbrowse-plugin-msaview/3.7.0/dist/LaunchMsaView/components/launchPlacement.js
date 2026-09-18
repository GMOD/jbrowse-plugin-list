import React, { createContext, useContext, useState } from 'react';
import { readLaunchPlacement } from '../../utils/workspaces';
/**
 * Whether the launch opens beside the genome view — one answer for the whole
 * dialog, not one per tab.
 *
 * Every tab the user visits stays mounted, and the checkbox lives in each
 * panel's actions row, so a `useState` there gave each tab its own copy of the
 * answer: ticking the box on one tab and submitting from another wrote the
 * other tab's stale one.
 *
 * Context rather than a prop through all five panels, none of which has any
 * other business with placement.
 */
const LaunchPlacementContext = createContext(undefined);
export function LaunchPlacementProvider({ children, }) {
    const state = useState(() => readLaunchPlacement() === 'splitRight');
    return (React.createElement(LaunchPlacementContext.Provider, { value: state }, children));
}
/** the dialog's answer, or a private one for a panel rendered outside it */
export function useLaunchPlacement() {
    const shared = useContext(LaunchPlacementContext);
    const own = useState(() => readLaunchPlacement() === 'splitRight');
    return shared ?? own;
}
