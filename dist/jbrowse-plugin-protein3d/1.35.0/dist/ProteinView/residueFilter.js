import { predicateListProblems } from './fieldPredicates';
/**
 * The fields a predicate tests, each with the Mol* property it reads and the
 * level Mol* tests it at. `residue` is the author residue number
 * (`auth_seq_id`), the numbering a paper cites and `marks` address; `chain`
 * the author chain id (`auth_asym_id`), the one `chains` lists.
 */
const FIELDS = {
    residue: { property: 'auth_seq_id', kind: 'number', level: 'residue' },
    chain: { property: 'auth_asym_id', kind: 'string', level: 'chain' },
};
function isField(field) {
    return typeof field === 'string' && Object.hasOwn(FIELDS, field);
}
const GRAMMAR = {
    kindOf: field => (isField(field) ? FIELDS[field].kind : undefined),
    fields: Object.keys(FIELDS).join(' or '),
    example: "{ field: 'residue', lte: 184 }",
};
/** What is wrong with a `filter`, one line each; empty when nothing is. */
export function filterProblems(filter, where = 'filter') {
    return predicateListProblems(filter, where, GRAMMAR);
}
/**
 * The view's structures, refused with every problem their filters have. A
 * filter that does not read would otherwise draw a structure the session did
 * not ask for — or all of it.
 */
export function checkedStructureFilters(structures) {
    const given = structures ?? [];
    const problems = given.flatMap((structure, i) => filterProblems(structure.filter, `structures[${i}].filter`));
    if (problems.length > 0) {
        throw new Error(problems.join('; '));
    }
    return given;
}
function predicateTests(MS, predicate) {
    const { equal, lt, lte, gt, gte, range, oneOf } = predicate;
    const value = MS.ammp(FIELDS[predicate.field].property);
    return [
        ...(equal === undefined ? [] : [MS.core.rel.eq([value, equal])]),
        ...(lt === undefined ? [] : [MS.core.rel.lt([value, lt])]),
        ...(lte === undefined ? [] : [MS.core.rel.lte([value, lte])]),
        ...(gt === undefined ? [] : [MS.core.rel.gr([value, gt])]),
        ...(gte === undefined ? [] : [MS.core.rel.gre([value, gte])]),
        ...(range === undefined
            ? []
            : [MS.core.rel.inRange([value, range[0], range[1]])]),
        ...(oneOf === undefined
            ? []
            : [MS.core.set.has([MS.set(...oneOf), value])]),
    ];
}
function allOf(MS, tests) {
    return tests.length === 0
        ? undefined
        : tests.length === 1
            ? tests[0]
            : MS.core.logic.and(tests);
}
/**
 * What a structure draws, as the two MolScript tests an atom selection takes:
 * the chains `chains` lists and every predicate of `filter`, all of them. A
 * field is tested at its own level — a residue number per residue, a chain id
 * per chain — so the two compose into one selection rather than nesting.
 */
export function drawnTests(MS, drawn) {
    const { chains, filter = [] } = drawn;
    const at = (level) => filter
        .filter(predicate => FIELDS[predicate.field].level === level)
        .flatMap(predicate => predicateTests(MS, predicate));
    return {
        chainTest: allOf(MS, [
            ...(chains?.length
                ? [MS.core.set.has([MS.set(...chains), MS.ammp('auth_asym_id')])]
                : []),
            ...at('chain'),
        ]),
        residueTest: allOf(MS, at('residue')),
    };
}
/** Whether a structure leaves out part of what it draws, so a mark over the
 * rest of a chain adds to the picture rather than covering it. */
export function narrowsChains(structure) {
    return Array.isArray(structure?.filter) && structure.filter.length > 0;
}
