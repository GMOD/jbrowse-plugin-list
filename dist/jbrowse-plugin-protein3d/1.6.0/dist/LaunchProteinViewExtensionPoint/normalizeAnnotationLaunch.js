import { isRecord, isString } from './normalizeLaunch';
const ANNOTATION_KEYS = [
    'uniprotId',
    'gene',
    'transcriptId',
    'connectedView',
    'connectedViewId',
];
function isAnnotationKey(key) {
    return ANNOTATION_KEYS.some(k => k === key);
}
function isTrackSpec(value) {
    return isString(value) || isRecord(value);
}
function isConnectedViewSpec(value) {
    return (isRecord(value) &&
        (value.loc === undefined || isString(value.loc)) &&
        (value.assembly === undefined || isString(value.assembly)) &&
        (value.tracks === undefined ||
            (Array.isArray(value.tracks) && value.tracks.every(isTrackSpec))));
}
/**
 * A `ProteinAnnotationView` spec out of untyped fields. An unknown key or a
 * value of the wrong type is reported and left out; only a launch naming no
 * entry at all is rejected.
 */
export function normalizeAnnotationLaunch(launch) {
    const fields = new Map(Object.entries(launch));
    const warnings = [];
    const unknownKeys = [...fields.keys()].filter(key => !isAnnotationKey(key));
    if (unknownKeys.length > 0) {
        warnings.push(`ignored unknown key(s): ${unknownKeys.join(', ')}`);
    }
    function read(key, accepts, expected) {
        const value = fields.get(key);
        if (value === undefined || accepts(value)) {
            return value;
        }
        warnings.push(`\`${key}\` is not ${expected} and was ignored`);
        return undefined;
    }
    const uniprotId = read('uniprotId', isString, 'a string');
    const gene = read('gene', isString, 'a string');
    const transcriptId = read('transcriptId', isString, 'a string');
    const connectedView = read('connectedView', isConnectedViewSpec, '{ assembly, loc, tracks }');
    const connectedViewId = read('connectedViewId', isString, 'a string');
    if (!uniprotId && !gene) {
        return {
            error: 'No uniprotId or gene provided when launching a protein annotation view',
            warnings,
        };
    }
    const links = !!gene || !!transcriptId;
    if (!links && (connectedView || connectedViewId)) {
        warnings.push('`connectedView` and `connectedViewId` connect a transcript, and the launch names no `gene` or `transcriptId`, so the view opens unlinked');
    }
    return {
        launch: {
            uniprotId: uniprotId || undefined,
            gene,
            transcriptId,
            connectedView: links ? connectedView : undefined,
            connectedViewId: links ? connectedViewId : undefined,
        },
        warnings,
    };
}
