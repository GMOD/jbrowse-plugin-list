import { useMemo } from 'react';
import useUniProtFeatures from './useUniProtFeatures';
/**
 * Places a UniProt feature: its 1-based inclusive UniProt range becomes a
 * 0-based half-open structure range (identity for AlphaFold, SIFTS-offset for
 * PDB — see structureUniProt), then alignment columns. This is the only
 * UniProt->structure coordinate conversion in the tracks; every consumer reads
 * `structureStart`/`structureEnd` off the layout.
 *
 * Returns undefined when either endpoint falls outside the structure or has no
 * alignment column, so an unmappable feature is dropped rather than drawn at a
 * misleading position.
 */
export function layoutFeature(feature, structurePositionToAlignmentMap, mapUniProtPosition) {
    const structureStart = mapUniProtPosition(feature.start);
    const structureLast = mapUniProtPosition(feature.end);
    if (structureStart === undefined || structureLast === undefined) {
        return undefined;
    }
    const alignmentStart = structurePositionToAlignmentMap[structureStart];
    const alignmentEnd = structurePositionToAlignmentMap[structureLast];
    return alignmentStart === undefined || alignmentEnd === undefined
        ? undefined
        : {
            feature,
            structureStart,
            structureEnd: structureLast + 1,
            alignmentStart,
            alignmentEnd,
            lane: 0,
        };
}
/**
 * Greedy interval packing: assigns each feature the first lane whose last
 * feature ends before this one starts, so overlapping features of the same type
 * stack instead of hiding each other. Mutates each layout's lane and returns the
 * lane count (at least 1).
 */
export function packLanes(layouts) {
    const laneEnds = [];
    const sorted = [...layouts].sort((a, b) => a.alignmentStart - b.alignmentStart);
    for (const layout of sorted) {
        const free = laneEnds.findIndex(end => end < layout.alignmentStart);
        if (free === -1) {
            layout.lane = laneEnds.length;
            laneEnds.push(layout.alignmentEnd);
        }
        else {
            layout.lane = free;
            laneEnds[free] = layout.alignmentEnd;
        }
    }
    return Math.max(laneEnds.length, 1);
}
export default function useProteinFeatureTrackData(model, uniprotId, mapUniProtPosition) {
    const { features, isLoading, error } = useUniProtFeatures(uniprotId);
    const { omittedFeatureTypes, structurePositionToAlignmentMap } = model;
    const groups = useMemo(() => {
        if (!features || !structurePositionToAlignmentMap) {
            return undefined;
        }
        const byType = new Map();
        for (const feature of features) {
            if (!omittedFeatureTypes.has(feature.type)) {
                const layout = layoutFeature(feature, structurePositionToAlignmentMap, mapUniProtPosition);
                if (layout) {
                    const list = byType.get(feature.type);
                    if (list) {
                        list.push(layout);
                    }
                    else {
                        byType.set(feature.type, [layout]);
                    }
                }
            }
        }
        return [...byType].map(([type, layouts]) => ({
            type,
            layouts,
            laneCount: packLanes(layouts),
        }));
    }, [
        features,
        omittedFeatureTypes,
        structurePositionToAlignmentMap,
        mapUniProtPosition,
    ]);
    return { groups, isLoading, error };
}
