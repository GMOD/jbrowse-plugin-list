import { seqPosToGenomeRegions } from './msaCoordToGenomeCoord';
function mergeAdjacent(regions) {
    const merged = [];
    for (const region of regions.toSorted((a, b) => a.start - b.start)) {
        const last = merged.at(-1);
        if (last && last.refName === region.refName && region.start <= last.end) {
            last.end = Math.max(last.end, region.end);
        }
        else {
            merged.push({ ...region });
        }
    }
    return merged;
}
/**
 * The genome regions under the query row's residues `positions`, 0-based
 * ungapped.
 */
export function residuesToGenomeRegions(model, positions) {
    const pieces = [];
    for (const pos of positions) {
        pieces.push(...seqPosToGenomeRegions(model, pos));
    }
    return mergeAdjacent(pieces);
}
/**
 * The query row's domains as the alignment shows them, one per accession, so
 * a CDD site's scattered residues are one entry. Largest first by residues
 * covered, so a site painted later lands on the domain it sits in. Empty
 * while the domain overlay is off.
 */
export function connectedDomains(model) {
    if (!model.showDomains) {
        return [];
    }
    const byAccession = new Map();
    for (const annotation of model.annotationsByRow[model.querySeqName] ?? []) {
        const list = byAccession.get(annotation.accession);
        if (list) {
            list.push(annotation);
        }
        else {
            byAccession.set(annotation.accession, [annotation]);
        }
    }
    return [...byAccession]
        .flatMap(([accession, annotations]) => {
        // annotations count residues 1-based inclusive
        const positions = new Set();
        for (const { start, end } of annotations) {
            for (let pos = start - 1; pos < end; pos++) {
                positions.add(pos);
            }
        }
        const first = annotations[0];
        const color = model.featureColors.get(first)?.fill;
        const regions = residuesToGenomeRegions(model, positions);
        return color && regions.length > 0
            ? [
                {
                    domain: {
                        name: model.annotationTypes.get(accession)?.name ?? first.name,
                        accession,
                        color,
                        regions,
                    },
                    residues: positions.size,
                },
            ]
            : [];
    })
        .toSorted((a, b) => b.residues - a.residues)
        .map(({ domain }) => domain);
}
