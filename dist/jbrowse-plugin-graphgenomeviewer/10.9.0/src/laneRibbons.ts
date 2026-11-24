export type LaneRibbons = 'reference' | 'neighbours'

export const DEFAULT_LANE_RIBBONS: LaneRibbons = 'reference'

export const LANE_RIBBONS_LABEL = 'Lane ribbons'

export const LANE_RIBBONS: { value: LaneRibbons; label: string }[] = [
  { value: 'reference', label: 'each lane against the reference' },
  { value: 'neighbours', label: 'each lane against the lane above' },
]

export const LANE_RIBBONS_VALUES = LANE_RIBBONS.map(option => option.value)
