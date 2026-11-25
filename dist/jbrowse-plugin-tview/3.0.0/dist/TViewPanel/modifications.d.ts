import type { TviewModifications } from '../LaunchTView/modifications';
import type { MenuItem } from '@jbrowse/core/ui';
import type { Annotation, ColorEncoding, ResidueColor } from 'react-msaview';
/** the calls a load placed, and the ones it could not show */
export interface ModificationSummary {
    shown: number;
    dropped: number;
    unplaced: number;
}
export declare const MODIFICATION_FILL: ColorEncoding;
export declare function modificationName(type: string): string;
export declare function modificationAnnotations({ rows, types, row, residue, type, prob, }: TviewModifications): Annotation[];
export declare function modificationSummaryLine({ shown, dropped, unplaced, }: ModificationSummary): string;
interface ColoredView {
    residueColor: ResidueColor;
    resolvedResidueColor: {
        field: string;
    };
    setResidueColor: (color: ResidueColor) => void;
}
export declare function modificationMenu(summary: ModificationSummary, view: ColoredView): {
    label: string;
    subMenu: MenuItem[];
};
export {};
