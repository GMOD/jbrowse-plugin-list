import type { AnnotationFeature } from '@apollo-annotation/mst';
import type { DisplayStateModel } from '../types';
import type { ContextMenuState } from './HybridGrid';
export declare const Feature: ({ depth, feature, isHovered, isSelected, model: displayState, selectedFeatureClass, setContextMenu, }: {
    model: DisplayStateModel;
    feature: AnnotationFeature;
    depth: number;
    isHovered: boolean;
    isSelected: boolean;
    selectedFeatureClass: string;
    setContextMenu: (menu: ContextMenuState) => void;
}) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Feature.d.ts.map