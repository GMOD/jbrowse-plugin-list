import { type MenuItem } from '@jbrowse/core/ui';
import type { DisplayStateModel } from '../types';
export type ContextMenuState = null | {
    position: {
        top: number;
        left: number;
    };
    items: MenuItem[];
};
declare const HybridGrid: ({ model, }: {
    model: DisplayStateModel;
}) => import("react/jsx-runtime").JSX.Element;
export default HybridGrid;
//# sourceMappingURL=HybridGrid.d.ts.map