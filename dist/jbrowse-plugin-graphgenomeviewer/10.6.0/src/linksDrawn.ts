export type LinksDrawn = 'walked' | 'between'

export const DEFAULT_LINKS_DRAWN: LinksDrawn = 'walked'

export const LINKS_DRAWN_LABEL = 'Links drawn'

export const LINKS_DRAWN: { value: LinksDrawn; label: string }[] = [
  { value: 'walked', label: 'walked by the haplotypes shown' },
  {
    value: 'between',
    label: 'taken by any haplotype between the nodes shown',
  },
]

export const LINKS_DRAWN_VALUES = LINKS_DRAWN.map(option => option.value)
