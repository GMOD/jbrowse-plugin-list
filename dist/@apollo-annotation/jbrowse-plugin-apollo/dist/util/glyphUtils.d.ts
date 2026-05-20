import type { AnnotationFeature, TranscriptPartCoding } from '@apollo-annotation/mst';
import type { MenuItem } from '@jbrowse/core/ui';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
import type { LinearApolloDisplayMouseEvents } from '../LinearApolloDisplay/stateModel/mouseEvents';
import type { LinearApolloSixFrameDisplayMouseEvents } from '../LinearApolloSixFrameDisplay/stateModel/mouseEvents';
import type { ApolloSessionModel } from '../session';
import type { MousePositionWithFeature } from '.';
type NavLocation = Parameters<LinearGenomeViewModel['navTo']>[0];
export declare function selectFeatureAndOpenWidget(stateModel: LinearApolloDisplayMouseEvents | LinearApolloSixFrameDisplayMouseEvents, feature: AnnotationFeature): void;
export declare function isTranscriptFeature(feature: AnnotationFeature, session: ApolloSessionModel): boolean;
export declare function isExonFeature(feature: AnnotationFeature, session: ApolloSessionModel): boolean;
export declare function isCDSFeature(feature: AnnotationFeature, session: ApolloSessionModel): boolean;
export interface AdjacentExons {
    upstream: AnnotationFeature | undefined;
    downstream: AnnotationFeature | undefined;
}
export declare function getAdjacentExons(currentExon: AnnotationFeature, display: LinearApolloDisplayMouseEvents | LinearApolloSixFrameDisplayMouseEvents, mousePosition: MousePositionWithFeature, session: ApolloSessionModel): AdjacentExons;
export declare function getStreamIcon(strand: 1 | -1 | undefined, isUpstream: boolean, isFlipped: boolean | undefined): import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").SvgIconTypeMap<{}, "svg">> & {
    muiName: string;
};
export declare function getMinAndMaxPx(feature: AnnotationFeature | TranscriptPartCoding, refName: string, regionNumber: number, lgv: LinearGenomeViewModel): [number, number] | undefined;
export declare function getOverlappingEdge(feature: AnnotationFeature, x: number, minMax: [number, number]): {
    feature: AnnotationFeature;
    edge: 'min' | 'max';
} | undefined;
export declare function isSelectedFeature(feature: AnnotationFeature, selectedFeature: AnnotationFeature | undefined): boolean;
export declare function containsSelectedFeature(feature: AnnotationFeature, selectedFeature: AnnotationFeature | undefined): boolean;
export declare function getContextMenuItemsForFeature(display: LinearApolloSixFrameDisplayMouseEvents | LinearApolloDisplayMouseEvents, sourceFeature: AnnotationFeature): MenuItem[];
export declare function navToFeatureCenter(feature: AnnotationFeature, paddingPct: number, refSeqLength: number): NavLocation;
export {};
//# sourceMappingURL=glyphUtils.d.ts.map