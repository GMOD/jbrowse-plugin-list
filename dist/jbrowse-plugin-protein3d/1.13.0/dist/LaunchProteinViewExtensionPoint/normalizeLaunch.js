import { resolveStructureUrl } from 'p2s_mapper';
const STRUCTURE_KEY_ROLES = {
    url: 'source',
    data: 'source',
    uniprotId: 'source',
    pdbId: 'source',
    initialSelection: 'selection',
    initialResidues: 'selection',
    initialTranscriptResidues: 'selection',
    mappedEntityId: 'setting',
    pairwiseAlignment: 'setting',
    alignmentImported: 'setting',
    hidden: 'setting',
    feature: 'launchWide',
    userProvidedTranscriptSequence: 'launchWide',
    connectedViewId: 'launchWide',
};
function isStructureKey(key) {
    return Object.hasOwn(STRUCTURE_KEY_ROLES, key);
}
export const STRUCTURE_KEYS = Object.keys(STRUCTURE_KEY_ROLES).filter(isStructureKey);
const BESIDE_STRUCTURES = {
    source: 'names no structure; add it as an entry of `structures`',
    selection: 'applies to no structure; put it on the one it selects in',
    setting: 'applies to no structure; put it on the one it describes',
};
export function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function isString(value) {
    return typeof value === 'string';
}
function isBoolean(value) {
    return typeof value === 'boolean';
}
function isFeature(value) {
    return isRecord(value);
}
function isResidueRange(value) {
    return (isRecord(value) &&
        typeof value.start === 'number' &&
        typeof value.end === 'number');
}
function isResidueRanges(value) {
    return Array.isArray(value)
        ? value.every(isResidueRange)
        : isResidueRange(value);
}
function isAlignmentRow(value) {
    return (isRecord(value) &&
        typeof value.id === 'string' &&
        typeof value.seq === 'string');
}
export function isPairwiseAlignment(value) {
    return (isRecord(value) &&
        typeof value.consensus === 'string' &&
        Array.isArray(value.alns) &&
        value.alns.length === 2 &&
        value.alns.every(isAlignmentRow));
}
const RANGES = '{ start, end } numbers or an array of them';
/**
 * A structure spec out of untyped fields. Launch text comes from a url, and
 * the structure model throws on a wrongly typed property, so a value of the
 * wrong type is reported under the name `at` gives it and left out.
 */
function readStructure(fields, at, warnings) {
    function read(key, accepts, expected) {
        const value = fields.get(key);
        if (value === undefined || accepts(value)) {
            return value;
        }
        warnings.push(`${at(key)} is not ${expected} and was ignored`);
        return undefined;
    }
    return {
        url: read('url', isString, 'a string'),
        data: read('data', isString, 'a string'),
        uniprotId: read('uniprotId', isString, 'a string'),
        pdbId: read('pdbId', isString, 'a string'),
        initialSelection: read('initialSelection', isResidueRanges, RANGES),
        initialResidues: read('initialResidues', isResidueRanges, RANGES),
        initialTranscriptResidues: read('initialTranscriptResidues', isResidueRanges, RANGES),
        mappedEntityId: read('mappedEntityId', isString, 'a string'),
        pairwiseAlignment: read('pairwiseAlignment', isPairwiseAlignment, '{ consensus, alns: [{ id, seq }, { id, seq }] }'),
        alignmentImported: read('alignmentImported', isBoolean, 'true or false'),
        hidden: read('hidden', isBoolean, 'true or false'),
        feature: read('feature', isFeature, 'a feature object'),
        userProvidedTranscriptSequence: read('userProvidedTranscriptSequence', isString, 'a string'),
        connectedViewId: read('connectedViewId', isString, 'a string'),
    };
}
function namesSource(structure) {
    return (!!resolveStructureUrl(structure) ||
        structure.data !== undefined ||
        !!structure.uniprotId);
}
function withUrl(structure) {
    return { ...structure, url: resolveStructureUrl(structure) };
}
/**
 * The structures a launch asks for, each with its file url resolved, plus what
 * the launch said that applies to nothing. Only a launch left with no
 * structure to open is rejected; everything else is reported and opens.
 */
export function normalizeLaunch(launch) {
    const top = new Map(Object.entries(launch));
    const warnings = [];
    const looksUpGene = !!top.get('gene') && !top.get('userProvidedTranscriptSequence');
    const noStructure = top.get('gene')
        ? 'the launch names no structure, and `gene` is not looked up beside `userProvidedTranscriptSequence`'
        : 'No url, data, uniprotId, pdbId or gene provided when launching protein view';
    const given = top.get('structures');
    if (given !== undefined && !Array.isArray(given)) {
        warnings.push('`structures` is not an array and was ignored');
    }
    const entries = Array.isArray(given) ? given : [];
    if (entries.length === 0) {
        const structure = readStructure(new Map([...top].filter(([key]) => isStructureKey(key) && STRUCTURE_KEY_ROLES[key] !== 'launchWide')), key => `\`${key}\``, warnings);
        if (namesSource(structure)) {
            return {
                requested: [withUrl(structure)],
                warnings,
                geneModel: looksUpGene &&
                    !!structure.uniprotId &&
                    structure.url === undefined &&
                    structure.data === undefined
                    ? 'preferred'
                    : undefined,
            };
        }
        return looksUpGene
            ? { requested: [structure], warnings, geneModel: 'required' }
            : { error: noStructure, warnings };
    }
    for (const key of STRUCTURE_KEYS) {
        const role = STRUCTURE_KEY_ROLES[key];
        const steersGeneLookup = key === 'uniprotId' && looksUpGene;
        if (top.get(key) !== undefined &&
            role !== 'launchWide' &&
            !steersGeneLookup) {
            warnings.push(`\`${key}\` beside \`structures\` ${BESIDE_STRUCTURES[role]}`);
        }
    }
    const requested = entries.flatMap((entry, i) => {
        if (!isRecord(entry)) {
            warnings.push(`structures[${i}] is not an object and was omitted`);
            return [];
        }
        const fields = new Map(Object.entries(entry));
        const unknownKeys = [...fields.keys()].filter(key => !isStructureKey(key));
        if (unknownKeys.length > 0) {
            warnings.push(`structures[${i}] ignored unknown key(s): ${unknownKeys.join(', ')}`);
        }
        const structure = readStructure(fields, key => `\`structures[${i}].${key}\``, warnings);
        if (!namesSource(structure)) {
            warnings.push(`structures[${i}] names no url, data, uniprotId or pdbId and was omitted`);
            return [];
        }
        return [withUrl(structure)];
    });
    if (requested.length > 0) {
        return { requested, warnings };
    }
    return looksUpGene
        ? { requested: [{}], warnings, geneModel: 'required' }
        : {
            error: top.get('gene')
                ? noStructure
                : 'no entry of `structures` names a url, data, uniprotId or pdbId',
            warnings,
        };
}
