import { useMemo } from 'react';
import useUniProtFeatures from './useUniProtFeatures';
// A bond's two positions are its whole meaning, so one residue of a pair says
// nothing true about the structure.
const ENDPOINT_PAIR_TYPES = new Set(['Disulfide bond', 'Cross-link']);
/**
 * Places a UniProt feature: its 1-based inclusive UniProt range becomes a
 * 0-based half-open structure range (identity for AlphaFold, SIFTS-offset for
 * PDB — see structureUniProt), then alignment columns. This is the only
 * UniProt->structure coordinate conversion in the tracks; every consumer reads
 * `structureStart`/`structureEnd` off the layout.
 *
 * A feature reaching past the residues the structure has is clipped to the
 * ones it does have, and says so (`clipped`): a crystallized fragment used to
 * lose every region straddling the construct's ends. Returns undefined when no
 * residue of the feature has an alignment column.
 */
export function layoutFeature(feature, structurePositionToAlignmentMap, mapUniProtPosition) {
    const placed = (uniprotPos) => {
        const structurePos = mapUniProtPosition(uniprotPos);
        const column = structurePos === undefined
            ? undefined
            : structurePositionToAlignmentMap[structurePos];
        return structurePos === undefined || column === undefined
            ? undefined
            : { structurePos, column };
    };
    let first = feature.start;
    let start = placed(first);
    while (!start && first < feature.end) {
        start = placed(++first);
    }
    let last = feature.end;
    let end = placed(last);
    while (!end && last > first) {
        end = placed(--last);
    }
    const clipped = first !== feature.start || last !== feature.end;
    return !start || !end || (clipped && ENDPOINT_PAIR_TYPES.has(feature.type))
        ? undefined
        : {
            feature,
            structureStart: start.structurePos,
            structureEnd: end.structurePos + 1,
            alignmentStart: start.column,
            alignmentEnd: end.column,
            clipped,
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
/**
 * Paint order for a collapsed track, where every bar shares one row: a wide
 * bar painted last covers the short ones inside it, which can then be neither
 * hovered nor clicked.
 */
export function widestFirst(layouts) {
    return [...layouts].sort((a, b) => b.alignmentEnd - b.alignmentStart - (a.alignmentEnd - a.alignmentStart));
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
            laneCount: packLanes(layouts),
            layouts: widestFirst(layouts),
        }));
    }, [
        features,
        omittedFeatureTypes,
        structurePositionToAlignmentMap,
        mapUniProtPosition,
    ]);
    return { groups, isLoading, error };
}
