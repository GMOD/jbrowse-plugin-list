import type { MolScriptBuilder } from 'molstar/lib/mol-script/language/builder'
import type { Expression } from 'molstar/lib/mol-script/language/expression'

/**
 * The fields a predicate tests, each with the Mol* property it reads and the
 * level Mol* tests it at. `residue` is the author residue number
 * (`auth_seq_id`), the numbering a paper cites and `marks` address; `chain`
 * the author chain id (`auth_asym_id`), the one `chains` lists.
 */
const FIELDS = {
  residue: {
    property: 'auth_seq_id',
    numeric: true,
    level: 'residue',
    kind: 'a number',
  },
  chain: {
    property: 'auth_asym_id',
    numeric: false,
    level: 'chain',
    kind: 'a string',
  },
} as const

export type FilterField = keyof typeof FIELDS

/**
 * One Vega-Lite field predicate over a structure's residues: the `field` it
 * reads and the tests its value must pass, every one given.
 */
export interface FilterPredicate {
  field: FilterField
  equal?: string | number
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  /** `[low, high]`, both ends included */
  range?: readonly number[]
  oneOf?: readonly (string | number)[]
}

/** A structure's `filter`: the residues it draws are those every predicate
 * passes. */
export type StructureFilter = FilterPredicate[]

const BOUNDS = ['lt', 'lte', 'gt', 'gte', 'range'] as const
const OPERATORS = ['equal', ...BOUNDS, 'oneOf'] as const

const EXAMPLE = "{ field: 'residue', lte: 184 }"
const TAKES = `a predicate takes field and one of ${OPERATORS.join(', ')}`

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function isField(field: unknown): field is FilterField {
  return typeof field === 'string' && Object.hasOwn(FIELDS, field)
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isValue(value: unknown, field: FilterField) {
  return FIELDS[field].numeric ? isNumber(value) : typeof value === 'string'
}

function rangeProblems(where: string, range: unknown) {
  if (!Array.isArray(range) || range.length !== 2 || !range.every(isNumber)) {
    return [
      `${where}.range is two numbers, the low and high ends, not ${JSON.stringify(range)}`,
    ]
  }
  const [low, high] = range as [number, number]
  return low <= high
    ? []
    : [`${where}.range runs low to high; ${low} is above ${high}`]
}

function operatorProblems(
  where: string,
  field: FilterField,
  key: string,
  value: unknown,
) {
  if (key === 'range') {
    return rangeProblems(where, value)
  }
  if (key === 'oneOf') {
    return Array.isArray(value) &&
      value.length > 0 &&
      value.every(v => isValue(v, field))
      ? []
      : [
          `${where}.oneOf is a list of ${field === 'residue' ? 'numbers' : 'strings'}, not ${JSON.stringify(value)}`,
        ]
  }
  const expected = key === 'equal' ? FIELDS[field].kind : 'a number'
  return (key === 'equal' ? isValue(value, field) : isNumber(value))
    ? []
    : [`${where}.${key} is ${expected}, not ${JSON.stringify(value)}`]
}

/** The lowest and highest number a predicate's bounds admit; an end no bound
 * names is open. */
function bounds(predicate: Record<string, unknown>) {
  const at = (key: string) => {
    const value = predicate[key]
    return isNumber(value) ? value : undefined
  }
  const range: unknown[] = Array.isArray(predicate.range) ? predicate.range : []
  return {
    low: Math.max(
      at('gt') ?? -Infinity,
      at('gte') ?? -Infinity,
      isNumber(range[0]) ? range[0] : -Infinity,
    ),
    high: Math.min(
      at('lt') ?? Infinity,
      at('lte') ?? Infinity,
      isNumber(range[1]) ? range[1] : Infinity,
    ),
  }
}

function predicateProblems(where: string, predicate: unknown): string[] {
  if (!isRecord(predicate)) {
    return [`${where} is an object such as ${EXAMPLE}`]
  }
  const { field, ...tests } = predicate
  if (!isField(field)) {
    return [
      `${where}.field is ${Object.keys(FIELDS).join(' or ')}, not ${JSON.stringify(field)}`,
    ]
  }
  const named = Object.keys(tests)
  if (named.length === 0) {
    return [`${where} tests nothing: ${TAKES}`]
  }
  const problems = named.flatMap(key => {
    if (!OPERATORS.some(op => op === key)) {
      return [`${where}.${key} is not an operator: ${TAKES}`]
    }
    if (!FIELDS[field].numeric && BOUNDS.some(op => op === key)) {
      return [
        `${where}.${key} is refused: ${field} is ${FIELDS[field].kind}, so it takes equal or oneOf`,
      ]
    }
    return operatorProblems(where, field, key, tests[key])
  })
  if (problems.length > 0) {
    return problems
  }
  const { low, high } = bounds(tests)
  return low > high
    ? [`${where} selects nothing: its bounds run from ${low} to ${high}`]
    : []
}

/** What is wrong with a `filter`, one line each; empty when nothing is. */
export function filterProblems(filter: unknown, where = 'filter'): string[] {
  if (filter === undefined) {
    return []
  }
  if (!Array.isArray(filter)) {
    return [`${where} is a list of predicates such as [${EXAMPLE}]`]
  }
  return filter.flatMap((predicate, i) =>
    predicateProblems(`${where}[${i}]`, predicate),
  )
}

/**
 * The view's structures, refused with every problem their filters have. A
 * filter that does not read would otherwise draw a structure the session did
 * not ask for — or all of it.
 */
export function checkedStructureFilters<T extends { filter?: unknown }>(
  structures: readonly T[] | undefined,
): readonly T[] {
  const given = structures ?? []
  const problems = given.flatMap((structure, i) =>
    filterProblems(structure.filter, `structures[${i}].filter`),
  )
  if (problems.length > 0) {
    throw new Error(problems.join('; '))
  }
  return given
}

type Builder = typeof MolScriptBuilder

function predicateTests(MS: Builder, predicate: FilterPredicate): Expression[] {
  const { equal, lt, lte, gt, gte, range, oneOf } = predicate
  const value = MS.ammp(FIELDS[predicate.field].property)
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
  ]
}

function allOf(MS: Builder, tests: Expression[]) {
  return tests.length === 0
    ? undefined
    : tests.length === 1
      ? tests[0]
      : MS.core.logic.and(tests)
}

/**
 * What a structure draws, as the two MolScript tests an atom selection takes:
 * the chains `chains` lists and every predicate of `filter`, all of them. A
 * field is tested at its own level — a residue number per residue, a chain id
 * per chain — so the two compose into one selection rather than nesting.
 */
export function drawnTests(
  MS: Builder,
  drawn: { chains?: readonly string[]; filter?: StructureFilter },
) {
  const { chains, filter = [] } = drawn
  const at = (level: string) =>
    filter
      .filter(predicate => FIELDS[predicate.field].level === level)
      .flatMap(predicate => predicateTests(MS, predicate))
  return {
    chainTest: allOf(MS, [
      ...(chains?.length
        ? [MS.core.set.has([MS.set(...chains), MS.ammp('auth_asym_id')])]
        : []),
      ...at('chain'),
    ]),
    residueTest: allOf(MS, at('residue')),
  }
}

/** Whether a structure leaves out part of what it draws, so a mark over the
 * rest of a chain adds to the picture rather than covering it. */
export function narrowsChains(structure: { filter?: unknown } | undefined) {
  return Array.isArray(structure?.filter) && structure.filter.length > 0
}
