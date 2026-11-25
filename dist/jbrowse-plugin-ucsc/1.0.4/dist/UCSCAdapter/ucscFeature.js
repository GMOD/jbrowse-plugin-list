const REF_NAME_FIELDS = ['chrom', 'genoName', 'tName'];
const START_FIELDS = ['chromStart', 'genoStart', 'tStart', 'txStart', 'start'];
const END_FIELDS = ['chromEnd', 'genoEnd', 'tEnd', 'txEnd', 'end'];
const BLOCK_FIELDS = new Set([
    'bin',
    'blockCount',
    'blockSizes',
    'chromStarts',
    'exonCount',
    'exonStarts',
    'exonEnds',
]);
function firstNumber(record, fields) {
    return fields
        .map(field => record[field])
        .find((value) => typeof value === 'number');
}
function firstString(record, fields) {
    return fields
        .map(field => record[field])
        .find((value) => typeof value === 'string' && !!value);
}
function numberList(value) {
    return typeof value === 'string'
        ? value
            .split(',')
            .filter(entry => entry !== '')
            .map(Number)
        : [];
}
function parseStrand(strand) {
    return strand === '+' ? 1 : strand === '-' ? -1 : 0;
}
function parseBlocks(record, start) {
    const exonStarts = numberList(record.exonStarts);
    const exonEnds = numberList(record.exonEnds);
    const chromStarts = numberList(record.chromStarts);
    const blockSizes = numberList(record.blockSizes);
    return exonStarts.length > 0
        ? exonStarts.map((exonStart, i) => {
            var _a;
            return ({
                start: exonStart,
                end: (_a = exonEnds[i]) !== null && _a !== void 0 ? _a : exonStart,
            });
        })
        : chromStarts.map((offset, i) => {
            var _a;
            return ({
                start: start + offset,
                end: start + offset + ((_a = blockSizes[i]) !== null && _a !== void 0 ? _a : 0),
            });
        });
}
function cdsPhases(cds, strand, exonFrames) {
    const transcriptOrder = strand < 0 ? cds.toReversed() : cds;
    const phaseBySpan = new Map();
    let width = 0;
    for (const span of transcriptOrder) {
        phaseBySpan.set(span, (3 - (width % 3)) % 3);
        width += Math.max(0, span.end - span.start);
    }
    return cds.map((span, i) => {
        const frame = exonFrames[i];
        return frame !== undefined && frame >= 0
            ? (3 - frame) % 3
            : phaseBySpan.get(span);
    });
}
export function transcriptParts(blocks, thickStart, thickEnd, strand, exonFrames) {
    const [leftUtr, rightUtr] = strand < 0
        ? ['three_prime_UTR', 'five_prime_UTR']
        : ['five_prime_UTR', 'three_prime_UTR'];
    const clipped = blocks.map(block => ({
        block,
        cds: {
            start: Math.max(block.start, thickStart),
            end: Math.min(block.end, thickEnd),
        },
    }));
    const phases = cdsPhases(clipped.map(({ cds }) => cds), strand, exonFrames);
    return clipped.flatMap(({ block, cds }, i) => [
        {
            type: leftUtr,
            start: block.start,
            end: Math.min(block.end, thickStart),
        },
        { type: 'CDS', ...cds, phase: phases[i] },
        {
            type: rightUtr,
            start: Math.max(block.start, thickEnd),
            end: block.end,
        },
    ].filter(part => part.start < part.end));
}
function featureName(record, isGene) {
    return isGene
        ? {
            name: firstString(record, ['geneName', 'name2', 'name']),
            description: firstString(record, ['name']),
        }
        : { name: firstString(record, ['repName', 'name']) };
}
export function ucscFeatureData(record, trackType, fallbackRefName) {
    var _a, _b, _c, _d, _e;
    const start = (_a = firstNumber(record, START_FIELDS)) !== null && _a !== void 0 ? _a : 0;
    const end = (_b = firstNumber(record, END_FIELDS)) !== null && _b !== void 0 ? _b : start;
    const strand = parseStrand(record.strand);
    const blocks = parseBlocks(record, start);
    const isGene = /genePred/i.test(trackType) && blocks.length > 0;
    const thickStart = (_c = firstNumber(record, ['thickStart', 'cdsStart'])) !== null && _c !== void 0 ? _c : end;
    const thickEnd = (_d = firstNumber(record, ['thickEnd', 'cdsEnd'])) !== null && _d !== void 0 ? _d : end;
    const exonFrames = numberList(record.exonFrames);
    const isCoding = thickStart < thickEnd &&
        (exonFrames.length === 0 || exonFrames.some(frame => frame >= 0));
    const rest = Object.fromEntries(Object.entries(record).filter(([key]) => !BLOCK_FIELDS.has(key)));
    return {
        ...rest,
        ...featureName(record, isGene),
        ...(typeof record.color === 'string' ? { itemRgb: record.color } : {}),
        ...(typeof record.value === 'number' ? { score: record.value } : {}),
        refName: (_e = firstString(record, REF_NAME_FIELDS)) !== null && _e !== void 0 ? _e : fallbackRefName,
        start,
        end,
        strand,
        ...(isGene
            ? {
                type: isCoding ? 'mRNA' : 'transcript',
                subfeatures: isCoding
                    ? transcriptParts(blocks, thickStart, thickEnd, strand, exonFrames)
                    : blocks.map(block => ({ ...block, type: 'exon' })),
            }
            : blocks.length > 0
                ? { subfeatures: blocks }
                : {}),
    };
}
//# sourceMappingURL=ucscFeature.js.map