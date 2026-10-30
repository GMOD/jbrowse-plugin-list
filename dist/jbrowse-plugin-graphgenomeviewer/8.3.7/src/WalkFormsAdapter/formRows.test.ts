import { structuralForms } from '@jbrowse/graph-walks'

import {
  OTHER_FORMS,
  formName,
  formSources,
  formVariants,
  formWarnings,
  referenceGenotypes,
} from './formRows.ts'

import type { Departure, HaplotypeDepartures } from '@jbrowse/graph-walks'

const window = { start: 0, end: 24_000 }

const departure = (
  refStart: number,
  refEnd: number,
  altLength: number,
  extra: Partial<Departure> = {},
): Departure => ({
  refStart,
  refEnd,
  altLength,
  invertedBp: 0,
  repeatedBp: 0,
  ...extra,
})

const haplotype = (
  name: string,
  departures: Departure[],
  covered: [number, number][] = [[0, 30_000]],
): HaplotypeDepartures => ({
  haplotype: name,
  covered,
  departures,
  open: false,
})

const deletion = departure(1000, 3000, 0)
const insertion = departure(5000, 5000, 800)

// One haplotype or a few per mark kind, so every state is common and every
// site tells forms apart
const departures = [
  haplotype('A#1', [deletion, insertion]),
  haplotype('A#2', [deletion, insertion]),
  haplotype('B#1', [
    deletion,
    departure(10_000, 11_000, 1000, { invertedBp: 1000 }),
  ]),
  haplotype('B#2', [deletion]),
  haplotype('C#1', [insertion]),
  haplotype('C#2', [
    departure(8000, 8000, 1500, { repeatedBp: 1500, copied: [6500, 8000] }),
  ]),
  haplotype('D#1', [
    departure(8000, 8000, 1500, { repeatedBp: 1500, copied: [6500, 8000] }),
  ]),
  haplotype('D#2', [departure(10_000, 11_000, 1000, { invertedBp: 1000 })]),
  haplotype('E#1', [departure(13_000, 13_600, 2000)]),
  haplotype('E#2', [departure(15_000, 17_000, 500)]),
  haplotype('F#1', [
    departure(18_000, 19_500, 0),
    departure(19_600, 19_600, 1480),
  ]),
  haplotype('F#2', [departure(21_000, 21_500, 3000, { abridged: true })]),
  haplotype('G#1', []),
  haplotype('G#2', [], [[0, 12_000]]),
  haplotype('H#1', [], []),
]

const result = structuralForms(departures, { window })
const variants = formVariants(result, Infinity)

// The form a haplotype fell into
const formOf = (name: string) =>
  formName(result.forms.findIndex(f => f.members.includes(name)))

const variantAt = (start: number) => {
  const v = variants.find(v => v.start === start)
  if (!v) {
    throw new Error(`no variant at ${start}`)
  }
  return v
}

test('each mark kind names its consequence, svType and SO type', () => {
  expect(
    variants.map(v => [v.start, v.end, v.consequence, v.svType, v.type, v.alt]),
  ).toEqual([
    [1000, 3000, 'loss', 'DEL', 'deletion', '<DEL>'],
    [5000, 5001, 'gain', 'INS', 'insertion', '<INS>'],
    [6500, 8000, 'gain', 'DUP', 'tandem_duplication', '<DUP:TANDEM>'],
    [10_000, 11_000, 'inversion', 'INV', 'inversion', '<INV>'],
    [13_000, 13_600, 'gain', 'CPX', 'complex_substitution', '<CPX>'],
    [15_000, 17_000, 'loss', 'CPX', 'complex_substitution', '<CPX>'],
    [18_000, 19_600, 'shift', 'CPX', 'complex_structural_alteration', '<CPX>'],
    [21_000, 21_500, 'net', 'CPX', 'complex_structural_alteration', '<CPX>'],
  ])
})

test('a replacement is one variant over its REF span', () => {
  const v = variantAt(13_000)
  expect(v.mark).toEqual(
    expect.objectContaining({
      kind: 'replacement',
      refEnd: 13_600,
      delta: 1400,
    }),
  )
  expect(v.name).toBe('repl 600bp->2kb')
})

test('a lopsided replacement colours as the side it nearly is', () => {
  const forms = structuralForms(
    [
      haplotype('A#1', [departure(2000, 8460, 94)]),
      haplotype('B#1', [departure(12_000, 12_178, 13_900)]),
      haplotype('C#1', [departure(16_000, 16_600, 500)]),
      haplotype('D#1', []),
    ],
    { window },
  )
  expect(
    formVariants(forms).map(v => [
      v.name,
      v.mark.kind,
      v.mark.lopsided,
      v.consequence,
    ]),
  ).toEqual([
    ['del 6.46kb->94bp', 'replacement', 'deletion', 'loss'],
    ['ins 178bp->13.9kb', 'replacement', 'insertion', 'gain'],
    ['repl 600bp->500bp', 'replacement', undefined, 'loss'],
  ])
})

test('genotypes are 1 in the forms carrying a state, 0 in the rest', () => {
  const { genotypes, description } = variantAt(1000)
  const carriers = ['A#1', 'A#2', 'B#1', 'B#2'].map(formOf)
  for (const [form, genotype] of Object.entries(genotypes)) {
    expect([form, genotype]).toEqual([
      form,
      carriers.includes(form) ? '1' : '0',
    ])
  }
  expect(description).toBe('4 of 14 haplotypes')
})

test('a form whose walks do not span a site has no call there', () => {
  expect(variantAt(1000).genotypes[formOf('G#2')]).toBe('0')
  expect(variantAt(13_000).genotypes[formOf('G#2')]).toBe('.')
  expect(variantAt(13_000).genotypes[formOf('E#1')]).toBe('1')
})

test('sources are the forms, labelled by share and largest change', () => {
  const sources = formSources(result, Infinity)
  expect(sources).toHaveLength(result.forms.length)
  expect(sources[0]).toEqual({
    name: 'F1',
    label: '14% · del 2kb +1',
    haplotypes: 2,
    forms: 1,
  })
  expect(sources.find(s => s.name === formOf('G#1'))?.label).toBe('7% · ref')
})

test('past maxForms the smaller forms share one empty row', () => {
  expect(result.forms).toHaveLength(12)
  const sources = formSources(result, 4)
  expect(sources.map(s => s.name)).toEqual(['F1', 'F2', 'F3', 'F4', 'other'])
  expect(sources.at(-1)).toEqual({
    name: OTHER_FORMS,
    label: 'other forms · 57%',
    haplotypes: 8,
    forms: 8,
  })
  expect(formWarnings(result, 4)[0]).toBe(
    '8 smaller forms, 8 haplotypes, share the empty "other forms" row; maxForms sets how many forms get a row of their own',
  )
  const capped = formVariants(result, 4)
  expect(capped.every(v => Object.keys(v.genotypes).length === 4)).toBe(true)
  expect(capped.every(v => Object.values(v.genotypes).includes('1'))).toBe(true)
  expect(capped.length).toBeLessThan(variants.length)
  expect(variantAt(1000).description).toBe(
    capped.find(v => v.start === 1000)?.description,
  )
})

test('reference genotypes cover the forms with a row of their own', () => {
  expect(referenceGenotypes(result, 2)).toEqual({ F1: '0', F2: '0' })
  expect(Object.keys(referenceGenotypes(result, Infinity))).toHaveLength(12)
})

test('one form past maxForms keeps its own row', () => {
  expect(formSources(result, 11).map(s => s.name)).not.toContain(OTHER_FORMS)
  expect(formSources(result, 10).at(-1)?.name).toBe(OTHER_FORMS)
})

test('warnings name the abridged and unplaced haplotypes', () => {
  expect(formWarnings(result, Infinity)).toEqual([
    "1 haplotype kept an abridged walk past the forms cut's step budget, which shows as a net change over its span: F#2",
    '1 haplotype has no walk over the pinned window, so no form: H#1',
  ])
})

test('a change every form shares is a variant carried by all of them', () => {
  const shared = departure(2000, 2500, 0)
  const forms = structuralForms(
    [
      haplotype('A#1', [shared, insertion]),
      haplotype('A#2', [shared, insertion]),
      haplotype('B#1', [shared]),
    ],
    { window },
  )
  expect(formSources(forms).map(s => s.label)).toEqual([
    '67% · ins 800bp',
    '33% · shared',
  ])
  expect(
    formVariants(forms).map(v => [v.start, v.consequence, v.genotypes]),
  ).toEqual([
    [2000, 'loss', { F1: '1', F2: '1' }],
    [5000, 'gain', { F1: '1', F2: '0' }],
  ])
})

// a site over 1 kb wide keeps each mark apart; graph-walks sums the marks of a
// narrower one into a single change
test('a state of several marks is a variant per mark, carried alike', () => {
  const forms = structuralForms(
    [
      haplotype('A#1', [departure(2000, 2600, 0), departure(2660, 2660, 900)]),
      haplotype('B#1', [departure(1900, 3200, 0)]),
      haplotype('C#1', []),
    ],
    { window },
  )
  const carriedBy = (name: string) =>
    Object.fromEntries(
      forms.forms.map((f, i) => [
        formName(i),
        f.members.includes(name) ? '1' : '0',
      ]),
    )
  expect(
    formVariants(forms)
      .map(v => [v.start, v.end, v.name, v.genotypes])
      .sort((a, b) => Number(a[0]) - Number(b[0])),
  ).toEqual([
    [1900, 3200, 'del 1.3kb', carriedBy('B#1')],
    [2000, 2600, 'del 600bp', carriedBy('A#1')],
    [2660, 2661, 'ins 900bp', carriedBy('A#1')],
  ])
})
