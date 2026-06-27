import type { JBrowsePluginProteinViewModel } from '../ProteinView/model';
import type { AbstractSessionModel } from '@jbrowse/core/util';
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
