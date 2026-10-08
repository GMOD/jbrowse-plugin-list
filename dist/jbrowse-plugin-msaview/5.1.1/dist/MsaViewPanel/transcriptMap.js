import { genomeToTranscriptSeqMapping } from 'g2p_mapper';
export const MAX_CODING_BASES = 1_000_000;
function isRecord(val) {
    return typeof val === 'object' && val !== null;
}
function isCoordinate(val) {
    return Number.isSafeInteger(val);
}
function isCds(val) {
    return (isRecord(val) &&
        typeof val.type === 'string' &&
        val.type.toLowerCase() === 'cds' &&
        isCoordinate(val.start) &&
        isCoordinate(val.end) &&
        val.start < val.end);
}
function phaseOf(val) {
    const phase = Number(val);
    return phase === 1 || phase === 2 ? phase : 0;
}
// The rows core's translateTranscript reads, so the query row and the codons
// count alike: the CDS children, or a standalone CDS (a polyprotein's) as its
// own one segment.
function cdsRows(feature) {
    const { subfeatures } = feature;
    const children = (Array.isArray(subfeatures) ? subfeatures : []).filter(isCds);
    if (children.length > 0) {
        return children;
    }
    return isCds(feature) ? [feature] : [];
}
function mappableTranscript(feature) {
    if (!isRecord(feature)) {
        return { reason: 'it is not a feature' };
    }
    const { refName, strand } = feature;
    if (typeof refName !== 'string' || !refName) {
        return { reason: 'it has no refName' };
    }
    if (strand !== 1 && strand !== -1) {
        return { reason: `its strand is ${JSON.stringify(strand)}, not 1 or -1` };
    }
    const cds = cdsRows(feature).map(f => ({
        refName,
        type: 'CDS',
        start: f.start,
        end: f.end,
        phase: phaseOf(f.phase),
    }));
    if (cds.length === 0) {
        return { reason: 'it has no CDS with numeric start < end' };
    }
    const coding = cds.reduce((sum, f) => sum + f.end - f.start, 0);
    if (coding > MAX_CODING_BASES) {
        return {
            reason: `its CDS covers ${coding} bases, more than any real transcript`,
        };
    }
    return {
        transcript: {
            refName,
            strand,
            start: Math.min(...cds.map(f => f.start)),
            end: Math.max(...cds.map(f => f.end)),
            subfeatures: cds,
        },
    };
}
const warned = new WeakSet();
export function transcriptMap(feature) {
    const checked = mappableTranscript(feature);
    if ('reason' in checked) {
        if (isRecord(feature) && !warned.has(feature)) {
            warned.add(feature);
            console.warn(`[msaview] the linked transcript is not mapped to the genome: ${checked.reason}`);
        }
        return undefined;
    }
    const mapping = genomeToTranscriptSeqMapping(checked.transcript);
    return {
        ...mapping,
        codingPositions: Object.keys(mapping.g2p)
            .map(Number)
            .sort((a, b) => a - b),
    };
}
function lowerBound(sorted, value) {
    let lo = 0;
    let hi = sorted.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (sorted[mid] < value) {
            lo = mid + 1;
        }
        else {
            hi = mid;
        }
    }
    return lo;
}
export function proteinPositionsInRange(map, start, end) {
    const positions = new Set();
    const { codingPositions, g2p } = map;
    for (let i = lowerBound(codingPositions, start); i < codingPositions.length && codingPositions[i] < end; i++) {
        positions.add(g2p[codingPositions[i]]);
    }
    return positions;
}
