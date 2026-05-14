export declare function hasHoverPosition(hovered: unknown): hovered is {
    hoverPosition: unknown;
};
export declare const useStyles: (params: void, muiStyleOverridesParams?: {
    props: Record<string, unknown>;
    ownerState?: Record<string, unknown> | undefined;
} | undefined) => {
    classes: Record<"highlight", string>;
    theme: import("@mui/material").Theme;
    css: import("tss-react").Css;
    cx: import("tss-react").Cx;
};
