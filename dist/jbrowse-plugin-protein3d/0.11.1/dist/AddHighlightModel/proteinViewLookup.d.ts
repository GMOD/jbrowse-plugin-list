import type { JBrowsePluginProteinStructureModel } from '../ProteinView/model';
import type { AbstractSessionModel } from '@jbrowse/core/util';
/**
 * What the highlight/hover bridges need from a ProteinView. Declared
 * structurally (like ParentProteinView in structureModel.ts) because the MST
 * Instance type of `structures` widens to a snapshot union at the array
 * boundary, which would force a cast at every call site.
 */
export interface HighlightSourceProteinView {
    id: string;
    structures: JBrowsePluginProteinStructureModel[];
}
export declare function getProteinViews(session: AbstractSessionModel): HighlightSourceProteinView[];
interface ConnectableStructure {
    connectedViewId?: string;
}
/**
 * Every structure across all ProteinViews that declares this genome view as its
 * connection. Structures are paired to a genome view explicitly, so a second
 * LinearGenomeView doesn't mirror another view's highlights (the coordinates
 * would be meaningless there, possibly on a different assembly), and a second
 * ProteinView isn't ignored.
 */
export declare function getStructuresConnectedTo<T extends ConnectableStructure>(proteinViews: {
    structures: T[];
}[], viewId: string): T[];
export {};
