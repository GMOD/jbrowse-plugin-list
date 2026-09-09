import type { CheckResultIdsType } from '@apollo-annotation/mst';
import type { Theme } from '@mui/material';
export { default as EditZoomThresholdDialog } from '../components/EditZoomThresholdDialog';
export type Coord = [number, number];
export declare const useStyles: (_params?: unknown, muiStyleOverridesParams?: {
    props: {
        classes?: Record<string, string>;
    };
}) => {
    classes: Record<"canvas" | "center" | "loading" | "canvasContainer" | "ellipses" | "avatar" | "box" | "badge" | "locked", string>;
    theme: import("@mui/material").Theme;
    css: import("@jbrowse/core/util/tss-react/types").Css;
    cx: import("@jbrowse/core/util/tss-react/types").Cx;
};
export interface CheckResultCluster<T> {
    _id: string;
    message: string;
    start: number;
    count: number;
    members: T[];
    range: {
        min: number;
        max: number;
    };
    featureIds: CheckResultIdsType;
}
export declare function clusterResultByMessage<T extends {
    _id: string;
    start: number;
    end: number;
    message: string;
    ids: CheckResultIdsType;
}>(items: readonly T[], width: number, touchesAsOverlap: boolean): CheckResultCluster<T>[];
export declare function codonColorCode(letter: string, theme: Theme, highContrast?: boolean): string | undefined;
export declare function colorCode(letter: string, theme: Theme): string;
//# sourceMappingURL=displayUtils.d.ts.map