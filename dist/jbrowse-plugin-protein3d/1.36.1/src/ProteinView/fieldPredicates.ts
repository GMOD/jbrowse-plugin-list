/**
 * One Vega-Lite field predicate: the `field` it reads and the tests its value
 * must pass, every one given.
 */
export interface FieldPredicate<Field extends string = string> {
  field: Field
  equal?: string | number
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  /** `[low, high]`, both ends included */
  range?: readonly number[]
  oneOf?: readonly (string | number)[]
}

/** What values a field holds, so which tests it takes. */
export type ValueKind = 'number' | 'string' | 'string or number'

const KIND_NAMES = {
  number: { one: 'a number', many: 'numbers' },
  string: { one: 'a string', many: 'strings' },
  'string or number': {
    one: 'a string or a number',
    many: 'strings or numbers',
  },
} as const

const BOUNDS = ['lt', 'lte', 'gt', 'gte', 'range'] as const
const OPERATORS = ['equal', ...BOUNDS, 'oneOf'] as const

const TAKES = `a predicate takes field and one of ${OPERATORS.join(', ')}`

/**
 * How a list of predicates reads its fields: the kind of value a field holds,
 * undefined for a field it does not have; what `field` may be, for the
 * message refusing one; and a predicate to show as an example.
 */
export interface PredicateGrammar {
  kindOf: (field: unknown) => ValueKind | undefined
  fields: string
  example: string
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isValue(value: unknown, kind: ValueKind) {
  return kind === 'number'
    ? isNumber(value)
    : kind === 'string'
      ? typeof value === 'string'
      : typeof value === 'string' || isNumber(value)
}

function rangeProblems(where: string, range: unknown) {
  const ends: unknown[] = Array.isArray(range) ? range : []
  const [low, high] = ends
  return ends.length === 2 && isNumber(low) && isNumber(high)
    ? low <= high
      ? []
      : [`${where}.range runs low to high; ${low} is above ${high}`]
    : [
        `${where}.range is two numbers, the low and high ends, not ${JSON.stringify(range)}`,
      ]
}

function operatorProblems(
  where: string,
  kind: ValueKind,
  key: string,
  value: unknown,
) {
  if (key === 'range') {
    return rangeProblems(where, value)
  }
  if (key === 'oneOf') {
    return Array.isArray(value) &&
      value.length > 0 &&
      value.every(v => isValue(v, kind))
      ? []
      : [
          `${where}.oneOf is a list of ${KIND_NAMES[kind].many}, not ${JSON.stringify(value)}`,
        ]
  }
  const expected = key === 'equal' ? kind : 'number'
  return isValue(value, expected)
    ? []
    : [
        `${where}.${key} is ${KIND_NAMES[expected].one}, not ${JSON.stringify(value)}`,
      ]
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

function predicateProblems(
  where: string,
  predicate: unknown,
  grammar: PredicateGrammar,
): string[] {
  if (!isRecord(predicate)) {
    return [`${where} is an object such as ${grammar.example}`]
  }
  const { field, ...tests } = predicate
  const kind = grammar.kindOf(field)
  if (kind === undefined) {
    return [`${where}.field is ${grammar.fields}, not ${JSON.stringify(field)}`]
  }
  const named = Object.keys(tests)
  if (named.length === 0) {
    return [`${where} tests nothing: ${TAKES}`]
  }
  const problems = named.flatMap(key => {
    if (!OPERATORS.some(op => op === key)) {
      return [`${where}.${key} is not an operator: ${TAKES}`]
    }
    if (kind === 'string' && BOUNDS.some(op => op === key)) {
      return [
        `${where}.${key} is refused: ${String(field)} is ${KIND_NAMES[kind].one}, so it takes equal or oneOf`,
      ]
    }
    return operatorProblems(where, kind, key, tests[key])
  })
  if (problems.length > 0) {
    return problems
  }
  const { low, high } = bounds(tests)
  return low > high
    ? [`${where} selects nothing: its bounds run from ${low} to ${high}`]
    : []
}

/** What is wrong with a list of predicates, one line each; empty when
 * nothing is. */
export function predicateListProblems(
  predicates: unknown,
  where: string,
  grammar: PredicateGrammar,
): string[] {
  if (predicates === undefined) {
    return []
  }
  if (!Array.isArray(predicates)) {
    return [`${where} is a list of predicates such as [${grammar.example}]`]
  }
  return predicates.flatMap((predicate, i) =>
    predicateProblems(`${where}[${i}]`, predicate, grammar),
  )
}
