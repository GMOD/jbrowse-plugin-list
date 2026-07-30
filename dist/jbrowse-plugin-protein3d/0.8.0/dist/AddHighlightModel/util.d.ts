import type { JBrowsePluginProteinViewModel } from '../ProteinView/model';
import type { AbstractSessionModel } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export interface HighlightRegion {
    refName: string;
    start: number;
    end: number;
    assemblyName?: string;
}
export declare function getHighlightCoords(model: LinearGenomeViewModel, region: HighlightRegion): {
    width: number;
    left: number;
} | undefined;
export declare const useStyles: (params: void, muiStyleOverridesParams?: {
    props: Record<string, unknown>;
    ownerState?: Record<string, unknown> | undefined;
} | undefined) => {
    classes: Record<"highlight" | "thinborder", string>;
    theme: import("@mui/material").Theme;
    css: import("tss-react").Css;
    cx: import("tss-react").Cx;
};
export declare function getProteinView(session: AbstractSessionModel): JBrowsePluginProteinViewModel | undefined;
