import {
  NO_CALL_STATE,
  RARER_STATE,
  REFERENCE_STATE,
  formStateAt,
  formTag,
  markTag,
} from '@jbrowse/graph-walks'

import type { Mark, MarkKind, StructuralForms } from '@jbrowse/graph-walks'

export const CONSEQUENCES = [
  'loss',
  'gain',
  'shift',
  'inversion',
  'net',
] as const

export type Consequence = (typeof CONSEQUENCES)[number]

// `svType` in core's vocabulary (UNIVERSAL_FIELD_PRESETS) and `type` as a
// Sequence Ontology term, which VcfFeature gives `<DUP:TANDEM>` too
const KINDS: Record<
  MarkKind,
  { svType: string; type: string; alt: string; consequence?: Consequence }
> = {
  deletion: { svType: 'DEL', type: 'deletion', alt: '<DEL>' },
  insertion: { svType: 'INS', type: 'insertion', alt: '<INS>' },
  duplication: {
    svType: 'DUP',
    type: 'tandem_duplication',
    alt: '<DUP:TANDEM>',
  },
  replacement: { svType: 'CPX', type: 'complex_substitution', alt: '<CPX>' },
  inversion: {
    svType: 'INV',
    type: 'inversion',
    alt: '<INV>',
    consequence: 'inversion',
  },
  shift: {
    svType: 'CPX',
    type: 'complex_structural_alteration',
    alt: '<CPX>',
    consequence: 'shift',
  },
  net: {
    svType: 'CPX',
    type: 'complex_structural_alteration',
    alt: '<CPX>',
    consequence: 'net',
  },
}

// A lopsided replacement colours by the side graph-walks names, which its net
// sign agrees with; any other change by its net sign
const sideOf = (m: Mark) =>
  m.lopsided ?? (m.delta < 0 ? 'deletion' : 'insertion')

const consequenceOf = (m: Mark): Consequence =>
  KINDS[m.kind].consequence ?? (sideOf(m) === 'deletion' ? 'loss' : 'gain')

export const formName = (i: number) => `F${i + 1}`

export const OTHER_FORMS = 'other'

export const DEFAULT_MAX_FORMS = 8

function percent(n: number, of: number) {
  const p = (100 * n) / of
  return p > 0 && p < 1 ? '<1%' : `${Math.round(p)}%`
}

// The forms drawn as rows of their own, largest first; one more than
// `maxForms` gets its own row rather than an "other forms" row
const shownCount = ({ forms }: StructuralForms, maxForms: number) =>
  forms.length > maxForms + 1 ? Math.max(0, maxForms) : forms.length

const sum = (forms: StructuralForms['forms']) =>
  forms.reduce((n, f) => n + f.members.length, 0)

/**
 * One row per form, largest first, labelled "66% · del 18.4kb". Past
 * `maxForms` the rest share one empty "other forms" row. A row's `forms`
 * counts the forms it holds, so the rows sum to the window's forms.
 */
export function formSources(
  result: StructuralForms,
  maxForms = DEFAULT_MAX_FORMS,
) {
  const shown = shownCount(result, maxForms)
  const rest = result.forms.slice(shown)
  return [
    ...result.forms.slice(0, shown).map((f, i) => ({
      name: formName(i),
      label: `${percent(f.members.length, result.placed)} · ${formTag(f, result)}`,
      haplotypes: f.members.length,
      forms: 1,
    })),
    ...(rest.length > 0
      ? [
          {
            name: OTHER_FORMS,
            label: `other forms · ${percent(sum(rest), result.placed)}`,
            haplotypes: sum(rest),
            forms: rest.length,
          },
        ]
      : []),
  ]
}

const LISTED_NAMES = 5

function names(haplotypes: string[]) {
  const listed = haplotypes.slice(0, LISTED_NAMES).join(', ')
  const more = haplotypes.length - LISTED_NAMES
  return more > 0 ? `${listed} and ${more} more` : listed
}

const haplotypeCount = (n: number) => `${n} haplotype${n === 1 ? '' : 's'}`

export function formWarnings(
  result: StructuralForms,
  maxForms = DEFAULT_MAX_FORMS,
) {
  const { abridged, unplaced, forms } = result
  const shown = shownCount(result, maxForms)
  const rest = forms.slice(shown)
  return [
    ...(rest.length > 0
      ? [
          `${rest.length} smaller forms, ${haplotypeCount(sum(rest))}, share the empty "other forms" row; maxForms sets how many forms get a row of their own`,
        ]
      : []),
    ...(abridged.length > 0
      ? [
          `${haplotypeCount(abridged.length)} kept an abridged walk past the forms cut's step budget, which shows as a net change over its span: ${names(abridged)}`,
        ]
      : []),
    ...(unplaced.length > 0
      ? [
          `${haplotypeCount(unplaced.length)} ${unplaced.length === 1 ? 'has' : 'have'} no walk over the pinned window, so no form: ${names(unplaced)}`,
        ]
      : []),
  ]
}

export interface FormVariant {
  id: string
  start: number
  end: number
  name: string
  description: string
  type: string
  svType: string
  consequence: Consequence
  alt: string
  mark: Mark
  genotypes: Record<string, string>
}

// A duplication draws over the stretch it copies rather than its zero-width
// junction, as a VCF `<DUP>` spans its copy
function drawnSpan({ copied, refStart, refEnd }: Mark) {
  const [start, end] = copied ?? [refStart, refEnd]
  return { start, end: Math.max(end, start + 1) }
}

const genotypeOf = (formState: string | undefined, state: string) =>
  formState === state
    ? '1'
    : formState === NO_CALL_STATE || formState === RARER_STATE
      ? '.'
      : '0'

/**
 * The marks of each changed state at a site that is not an edge, one variant
 * each, with genotype `1` in the forms in that state, `0` in the others and
 * `.` where a form has no call or only a rarer change. Only the forms with a
 * row of their own get a genotype, so the "other forms" row draws empty, and
 * a state none of them carries gives no variant.
 */
export function formVariants(
  result: StructuralForms,
  maxForms = DEFAULT_MAX_FORMS,
): FormVariant[] {
  const { sites, forms, placed } = result
  const shown = shownCount(result, maxForms)
  return sites.flatMap((site, s) =>
    site.edge
      ? []
      : site.states.flatMap(state => {
          if (state.key === REFERENCE_STATE) {
            return []
          }
          const states = forms.map(f => formStateAt(result, f, s))
          const genotypes = Object.fromEntries(
            states
              .slice(0, shown)
              .map((f, j) => [formName(j), genotypeOf(f, state.key)]),
          )
          const carriers = sum(forms.filter((_, j) => states[j] === state.key))
          return Object.values(genotypes).includes('1')
            ? state.marks.map((mark, k) => ({
                id: `${s}:${state.key}:${k}`,
                ...drawnSpan(mark),
                name: markTag(mark),
                description: `${carriers} of ${haplotypeCount(placed)}`,
                ...KINDS[mark.kind],
                consequence: consequenceOf(mark),
                mark,
                genotypes,
              }))
            : []
        }),
  )
}
