// The JBrowse-specific attributes a signal-matrix Zarr store carries on its
// root group, under the `jbrowse_signal_matrix` key. Everything the adapter
// needs to turn a genomic region into an array selection lives here, so opening
// a store costs one metadata read and no per-sample bookkeeping.
//
// Written by scripts/build_signal_zarr.ts. Keep the two in sync: this parser is
// the only reader, and it rejects rather than guesses.
export const SIGNAL_MATRIX_ATTRIBUTE = 'jbrowse_signal_matrix';
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function readNumber(value, where) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${where} must be a finite number`);
    }
    return value;
}
function readString(value, where) {
    if (typeof value !== 'string' || !value) {
        throw new Error(`${where} must be a non-empty string`);
    }
    return value;
}
function readOptionalString(value, where) {
    return value === undefined ? undefined : readString(value, where);
}
function readSample(value, index) {
    const where = `samples[${index}]`;
    if (typeof value === 'string') {
        return { name: value };
    }
    if (!isRecord(value)) {
        throw new Error(`${where} must be a string or an object`);
    }
    return {
        name: readString(value.name, `${where}.name`),
        group: readOptionalString(value.group, `${where}.group`),
        color: readOptionalString(value.color, `${where}.color`),
    };
}
function readRefs(value, where) {
    if (!isRecord(value)) {
        throw new Error(`${where} must be an object keyed by refName`);
    }
    return Object.fromEntries(Object.entries(value).map(([refName, span]) => {
        const at = `${where}.${refName}`;
        if (!isRecord(span)) {
            throw new Error(`${at} must be an object`);
        }
        return [
            refName,
            {
                start: readNumber(span.start, `${at}.start`),
                binOffset: readNumber(span.binOffset, `${at}.binOffset`),
                numBins: readNumber(span.numBins, `${at}.numBins`),
            },
        ];
    }));
}
function readLevel(value, index) {
    const where = `levels[${index}]`;
    if (!isRecord(value)) {
        throw new Error(`${where} must be an object`);
    }
    const minPath = readOptionalString(value.minPath, `${where}.minPath`);
    const maxPath = readOptionalString(value.maxPath, `${where}.maxPath`);
    // Rejected rather than half-honored: with one of the pair the display would
    // draw a whisker against the mean on the other side, which reads as a real
    // asymmetry in the data instead of a missing array.
    if ((minPath === undefined) !== (maxPath === undefined)) {
        throw new Error(`${where} has ${minPath ? 'minPath' : 'maxPath'} without the other; a summary level needs both`);
    }
    return {
        path: readString(value.path, `${where}.path`),
        binSize: readNumber(value.binSize, `${where}.binSize`),
        refs: readRefs(value.refs, `${where}.refs`),
        minPath,
        maxPath,
    };
}
export function parseSignalMatrixMetadata(attributes) {
    if (!isRecord(attributes)) {
        throw new Error('zarr group has no attributes');
    }
    const meta = attributes[SIGNAL_MATRIX_ATTRIBUTE];
    if (!isRecord(meta)) {
        throw new Error(`zarr group is missing its "${SIGNAL_MATRIX_ATTRIBUTE}" attribute — this store was not written for a MultiWiggleZarrAdapter`);
    }
    const { version, samples, levels } = meta;
    if (!Array.isArray(samples) || samples.length === 0) {
        throw new Error(`${SIGNAL_MATRIX_ATTRIBUTE}.samples must be a non-empty array`);
    }
    if (!Array.isArray(levels) || levels.length === 0) {
        throw new Error(`${SIGNAL_MATRIX_ATTRIBUTE}.levels must be a non-empty array`);
    }
    return {
        version: readNumber(version, `${SIGNAL_MATRIX_ATTRIBUTE}.version`),
        samples: samples.map((s, i) => readSample(s, i)),
        // finest first, so level selection is a scan from the coarse end
        levels: levels
            .map((l, i) => readLevel(l, i))
            .sort((a, b) => a.binSize - b.binSize),
    };
}
// The coarsest level whose bins are still no wider than one screen pixel, so a
// zoomed-out view reads a small pyramid level instead of every 1kb bin. Falls
// back to the finest level when even that is coarser than a pixel (zoomed in),
// which is the normal case at gene scale.
export function pickLevel(levels, bpPerPx) {
    var _a;
    const finest = levels[0];
    const usable = levels.filter(l => l.binSize <= Math.max(bpPerPx, finest.binSize));
    return (_a = usable.at(-1)) !== null && _a !== void 0 ? _a : finest;
}
//# sourceMappingURL=signalMatrixMetadata.js.map