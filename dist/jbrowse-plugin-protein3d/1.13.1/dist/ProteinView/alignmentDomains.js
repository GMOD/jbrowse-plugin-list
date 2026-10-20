/**
 * The connected alignment's domains on a structure, in grammar-of-graphics
 * terms:
 *
 * - data: jbrowse-plugin-msaview's `connectedDomains.features`, one per
 *   accession, each a set of genome regions
 * - filter and layer: `kind` splits the data into two layers. Layer 1 draws
 *   `kind == 'domain'` with the cartoon mark, layer 2 `kind == 'site'` with
 *   the sticks mark, on side chains only, over the cartoon
 * - mark: a backbone mark (cartoon, trace) takes the domain color, and an
 *   atom mark (sticks, spheres, lines) the site color where a site covers the
 *   residue, so a site's residue has one color wherever its atoms draw, the
 *   Mol* preset's ligand environment included
 * - color channel: msaview's one categorical color object over `accession`,
 *   whose scale maps each `domain` entry to the `range` color at its index
 * - guide: the header legend, one group per layer, and the overview's rows,
 *   each named from the color object's `labels`
 *
 * Within a layer, draw order puts the smaller entry on top, so a residue two
 * domains cover shows the smaller. A site never hides its domain, since the
 * two layers use different marks.
 */
import { placeValues } from './variantEffects';
const ATOM_MARKS = new Set(['ball-and-stick', 'spacefill', 'line', 'point']);
/** The mark a Mol* representation type draws, for the color it takes */
export function domainMarkOf(representationType) {
    return ATOM_MARKS.has(representationType) ? 'atoms' : 'backbone';
}
export const EMPTY_DOMAIN_COLOR = {
    field: 'accession',
    domain: [],
    range: [],
    labels: [],
};
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function strings(value) {
    return Array.isArray(value) &&
        value.every((v) => typeof v === 'string')
        ? value
        : undefined;
}
function featureOf(value) {
    if (!isRecord(value) ||
        typeof value.name !== 'string' ||
        typeof value.accession !== 'string' ||
        !Array.isArray(value.regions)) {
        return undefined;
    }
    return {
        name: value.name,
        accession: value.accession,
        kind: value.kind === 'site' ? 'site' : 'domain',
        regions: value.regions.filter((r) => isRecord(r) &&
            typeof r.refName === 'string' &&
            typeof r.start === 'number' &&
            typeof r.end === 'number'),
    };
}
/**
 * The one reader of msaview's `connectedDomains`, duck-typed because a store
 * install can pair any two versions. Takes the current shape, features plus a
 * color object, and msaview 5.5.0's, an array of features each carrying its
 * own `color` and no `kind`, which it reads as domains. Undefined for anything
 * else and for no features. An accession past the end of `range` has no color,
 * so the reader drops it from `domain` and its feature is not drawn.
 */
export function readConnectedDomains(value) {
    if (Array.isArray(value)) {
        const features = [];
        const fills = new Map();
        for (const record of value) {
            const feature = featureOf(record);
            if (feature && isRecord(record) && typeof record.color === 'string') {
                features.push(feature);
                if (!fills.has(feature.accession)) {
                    fills.set(feature.accession, {
                        fill: record.color,
                        label: feature.name,
                    });
                }
            }
        }
        return features.length > 0
            ? {
                features,
                color: {
                    field: 'accession',
                    domain: [...fills.keys()],
                    range: [...fills.values()].map(f => f.fill),
                    labels: [...fills.values()].map(f => f.label),
                },
            }
            : undefined;
    }
    if (!isRecord(value) || !Array.isArray(value.features)) {
        return undefined;
    }
    const features = value.features.flatMap(f => featureOf(f) ?? []);
    const color = isRecord(value.color) ? value.color : {};
    const domain = strings(color.domain);
    const range = strings(color.range);
    if (features.length === 0 || !domain || !range) {
        return undefined;
    }
    const drawn = domain.slice(0, range.length);
    return {
        features,
        color: {
            field: 'accession',
            domain: drawn,
            range,
            labels: strings(color.labels) ?? drawn,
        },
    };
}
/**
 * The alignments connected to a genome view, and the domains of the first
 * that shows any
 */
export function connectedAlignmentDomains(views, connectedViewId) {
    const alignments = connectedViewId
        ? views.filter(v => v.type === 'MsaView' && v.connectedViewId === connectedViewId)
        : [];
    let domains;
    for (const view of alignments) {
        domains ??= readConnectedDomains(view.connectedDomains);
    }
    return { alignments: alignments.length, domains };
}
/**
 * Each feature on the transcript through `g2p`. A feature the color object's
 * domain leaves out has no color and is left out, as is one off the
 * transcript.
 */
export function placeOnTranscript({ features, color }, mapping, { canonicalRefName }) {
    const refName = canonicalRefName(mapping.refName);
    return features.flatMap(feature => {
        const index = color.domain.indexOf(feature.accession);
        const positions = new Set();
        for (const region of feature.regions) {
            if (canonicalRefName(region.refName) === refName) {
                for (let base = region.start; base < region.end; base++) {
                    const pos = mapping.g2p[base];
                    if (pos !== undefined) {
                        positions.add(pos);
                    }
                }
            }
        }
        return index === -1 || positions.size === 0
            ? []
            : [{ feature, index, positions }];
    });
}
/**
 * One layer's color index for each transcript residue it covers. Draw order
 * runs largest first, so the smaller of two entries covering a residue is on
 * top.
 */
export function layerByTranscriptPos(placed, kind) {
    const byPos = new Map();
    for (const { index, positions } of placed
        .filter(p => p.feature.kind === kind)
        .toSorted((a, b) => b.positions.size - a.positions.size)) {
        for (const pos of positions) {
            byPos.set(pos, index);
        }
    }
    return byPos;
}
/**
 * The domains of the first alignment connected to the structure's genome view
 * that shows any, placed on the mapped entity through the genome: region →
 * transcript residue (`g2p`) → structure residue, one layer per kind. Waits,
 * with no message, for the structure's alignment to the transcript.
 */
export function alignmentDomainStatus({ views, connectedViewId, mapping, naming, entity, transcriptToStructure, }) {
    const { alignments, domains } = connectedAlignmentDomains(views, connectedViewId);
    if (!connectedViewId) {
        return { message: 'No genome view to read alignment domains through' };
    }
    if (alignments === 0) {
        return {
            message: "No alignment is connected to this structure's genome view",
        };
    }
    if (!domains) {
        return { message: 'The connected alignment shows no domains' };
    }
    if (!mapping) {
        return { domains, message: 'No transcript to place alignment domains on' };
    }
    const placed = placeOnTranscript(domains, mapping, naming);
    if (placed.length === 0) {
        return {
            domains,
            message: "None of the alignment's domains fall on this transcript",
        };
    }
    const layer = (kind) => entity && transcriptToStructure
        ? placeValues(layerByTranscriptPos(placed, kind), pos => transcriptToStructure[pos], entity)
        : undefined;
    return { domains, placed: layer('domain'), placedSites: layer('site') };
}
/**
 * The overview's rows: one per accession, in the color object's domain order,
 * each with a bar per run of its residues that the structure has. A site's
 * bars sit on its own residues only, so they are scattered.
 */
export function domainRows({ domains, mapping, naming, transcriptToStructure, structureToAlignment, }) {
    const { color } = domains;
    return placeOnTranscript(domains, mapping, naming)
        .toSorted((a, b) => a.index - b.index)
        .flatMap(({ feature, index, positions }) => {
        const cells = [...positions]
            .flatMap(pos => {
            const structurePos = transcriptToStructure[pos];
            const column = structurePos === undefined
                ? undefined
                : structureToAlignment[structurePos];
            return structurePos === undefined || column === undefined
                ? []
                : [{ structurePos, column }];
        })
            .toSorted((a, b) => a.column - b.column);
        const bars = [];
        for (const { structurePos, column } of cells) {
            const last = bars.at(-1);
            if (last?.alignmentEnd === column - 1 &&
                last.structureEnd === structurePos) {
                last.alignmentEnd = column;
                last.structureEnd = structurePos + 1;
            }
            else {
                bars.push({
                    structureStart: structurePos,
                    structureEnd: structurePos + 1,
                    alignmentStart: column,
                    alignmentEnd: column,
                });
            }
        }
        return bars.length > 0
            ? [
                {
                    accession: feature.accession,
                    label: color.labels[index] ?? feature.name,
                    color: color.range[index],
                    kind: feature.kind,
                    bars,
                },
            ]
            : [];
    });
}
/**
 * The legend for the color object, one group per layer in the domain's
 * order: domains drawn as cartoon, then sites drawn as side chains
 */
export function domainLegend({ features, color, }) {
    const kindOf = new Map(features.map(f => [f.accession, f.kind]));
    const group = (kind, title) => ({
        title,
        entries: color.domain.flatMap((accession, i) => kindOf.get(accession) === kind && color.range[i]
            ? [{ label: color.labels[i] ?? accession, color: color.range[i] }]
            : []),
    });
    return [
        group('domain', 'Domains (cartoon)'),
        group('site', 'Sites (side chains)'),
    ].filter(g => g.entries.length > 0);
}
