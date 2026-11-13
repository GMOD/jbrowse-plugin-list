import { predicateListProblems } from './fieldPredicates';
/**
 * A field of a feature by the name jbrowse-components' displays read it by:
 * the whole name first, then a dotted path into a structured field, so
 * `INFO.AF` reads a VCF record's INFO and `INFO.AF.1` its second allele's.
 */
export function readFeatureField(feature, name) {
    const whole = feature.get(name);
    const path = name.split('.');
    return whole !== undefined || path.length === 1
        ? whole
        : path
            .slice(1)
            .reduce((value, key) => typeof value === 'object' && value !== null
            ? Reflect.get(value, key)
            : undefined, feature.get(path[0]));
}
/**
 * A field's value as one number. A list, such as a multi-allelic site's
 * `INFO.AF`, gives its highest entry, as overlapping features give a base
 * their highest score; a string a VCF header left untyped is read as a number.
 */
export function numberOfField(value) {
    const items = Array.isArray(value) ? value : [value];
    const numbers = items
        .map(v => typeof v === 'string' && v.trim() !== ''
        ? Number(v)
        : typeof v === 'number'
            ? v
            : Number.NaN)
        .filter(Number.isFinite);
    return numbers.length > 0 ? Math.max(...numbers) : Number.NaN;
}
export function isFeatureFieldName(field) {
    return typeof field === 'string' && field !== '' && !field.startsWith('jexl:');
}
const GRAMMAR = {
    kindOf: field => (isFeatureFieldName(field) ? 'string or number' : undefined),
    fields: 'a feature field name such as FILTER or INFO.AF, not a jexl: expression',
    example: "{ field: 'FILTER', equal: 'PASS' }",
};
/** What is wrong with a track color's `filter`, one line each; empty when
 * nothing is. */
export function featureFilterProblems(filter, where = 'filter') {
    return predicateListProblems(filter, where, GRAMMAR);
}
function entryEquals(entry, expected) {
    return typeof expected === 'number'
        ? numberOfField(entry) === expected
        : entry === expected;
}
/**
 * Whether a feature passes one predicate. A list, such as the failed filters
 * a VCF record's FILTER names, passes `equal` and `oneOf` when any entry
 * does; the bounds test the field's number as `scoreField` reads it, a list's
 * highest. A field the feature lacks passes no test.
 */
function passes(feature, predicate) {
    const { field, equal, lt, lte, gt, gte, range, oneOf } = predicate;
    const value = readFeatureField(feature, field);
    const entries = Array.isArray(value) ? value : [value];
    const n = numberOfField(value);
    return ((equal === undefined || entries.some(e => entryEquals(e, equal))) &&
        (oneOf === undefined ||
            entries.some(e => oneOf.some(o => entryEquals(e, o)))) &&
        (lt === undefined || n < lt) &&
        (lte === undefined || n <= lte) &&
        (gt === undefined || n > gt) &&
        (gte === undefined || n >= gte) &&
        (range === undefined || (n >= range[0] && n <= range[1])));
}
export function passesFeatureFilter(feature, filter) {
    return filter.every(predicate => passes(feature, predicate));
}
function predicateLabel({ field, equal, lt, lte, gt, gte, range, oneOf, }) {
    return [
        ...(equal === undefined ? [] : [`${field} = ${equal}`]),
        ...(oneOf === undefined ? [] : [`${field} = ${oneOf.join(' or ')}`]),
        ...(gt === undefined ? [] : [`${field} > ${gt}`]),
        ...(gte === undefined ? [] : [`${field} ≥ ${gte}`]),
        ...(lt === undefined ? [] : [`${field} < ${lt}`]),
        ...(lte === undefined ? [] : [`${field} ≤ ${lte}`]),
        ...(range === undefined ? [] : [`${field} ${range[0]}–${range[1]}`]),
    ];
}
/** A filter as a legend reads it, such as `FILTER = PASS, INFO.AF ≥ 0.01`. */
export function featureFilterLabel(filter) {
    return filter.flatMap(predicateLabel).join(', ');
}
