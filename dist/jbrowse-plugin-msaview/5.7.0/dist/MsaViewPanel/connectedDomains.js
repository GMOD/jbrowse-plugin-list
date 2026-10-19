/**
 * The query row's domains on the genome, as data plus one color object. A
 * cross-plugin contract: jbrowse-plugin-protein3d reads it off the view.
 *
 * In grammar-of-graphics terms, `features` is the data and `kind` the field a
 * consumer filters its layers on (protein3d draws `domain` as cartoon and
 * `site` as side chains). `color` is the color channel: a categorical scale
 * over `accession`, whose `domain` lists the accessions, `range` the fills
 * the alignment draws them in, and `labels` what a guide (a legend) names
 * them. Every surface reads that one object: the genome track's display, the
 * structure's layers, its overview rows and each legend.
 */
import { seqPosToGenomeRegions } from './msaCoordToGenomeCoord';
/**
 * `site` for CDD's GenPept `Site` key, a Sequence Ontology `*_site` type,
 * InterPro's `Binding_site`, `Active_site` and `Conserved_site`, and UniProt's
 * spelled-out `Binding site`
 */
export function annotationKind(featureType) {
    return featureType && /(^|[_ ])site$/i.test(featureType) ? 'site' : 'domain';
}
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
 * a CDD site's scattered residues are one feature. Empty while the domain
 * overlay is off.
 */
export function connectedDomains(model) {
    const byAccession = new Map();
    if (model.showDomains) {
        for (const annotation of model.annotationsByRow[model.querySeqName] ?? []) {
            const list = byAccession.get(annotation.accession);
            if (list) {
                list.push(annotation);
            }
            else {
                byAccession.set(annotation.accession, [annotation]);
            }
        }
    }
    const placed = [...byAccession]
        .flatMap(([accession, annotations]) => {
        // annotations count residues 1-based inclusive
        const positions = new Set();
        for (const { start, end } of annotations) {
            for (let pos = start - 1; pos < end; pos++) {
                positions.add(pos);
            }
        }
        const first = annotations[0];
        const fill = model.featureColors.get(first)?.fill;
        const regions = residuesToGenomeRegions(model, positions);
        return fill && regions.length > 0
            ? [
                {
                    feature: {
                        name: model.annotationTypes.get(accession)?.name ?? first.name,
                        accession,
                        kind: annotationKind(first.featureType),
                        regions,
                    },
                    fill,
                    residues: positions.size,
                },
            ]
            : [];
    })
        .toSorted((a, b) => b.residues - a.residues);
    return {
        features: placed.map(p => p.feature),
        color: {
            field: 'accession',
            domain: placed.map(p => p.feature.accession),
            range: placed.map(p => p.fill),
            labels: placed.map(p => p.feature.name),
        },
    };
}
