import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
type MinEdge = 'min';
type MaxEdge = 'max';
export type Edge = MinEdge | MaxEdge;
interface LocationChange {
    featureId: string;
    oldLocation: number;
    newLocation: number;
}
export declare function getPropagatedLocationChanges(feature: AnnotationFeature, newLocation: number, edge: Edge, shrinkParent?: boolean): LocationChange[];
/** extended information about the position of the mouse on the canvas, including the refName, bp, and displayedRegion number */
export interface MousePosition {
    x: number;
    y: number;
    refName: string;
    bp: number;
    regionNumber: number;
    feature?: AnnotationFeature;
}
export type MousePositionWithFeature = Required<MousePosition>;
export declare function isMousePositionWithFeature(mousePosition: MousePosition): mousePosition is MousePositionWithFeature;
export declare function getMousePosition(event: React.MouseEvent, lgv: LinearGenomeViewModel): MousePosition;
export {};
//# sourceMappingURL=mouseEventsUtils.d.ts.map