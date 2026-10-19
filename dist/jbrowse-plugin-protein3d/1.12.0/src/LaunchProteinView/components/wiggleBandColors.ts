import type { Band } from '../../ProteinView/residueTracks'

/**
 * The display-level threshold scale puts a value equal to a cut in the upper
 * band, so each cut moves just past its bound to keep the bound in its own
 * band, as `bandColor` does.
 */
export function thresholdBandColor(field: string, bands: Band[]) {
  return {
    field,
    scale: 'threshold',
    domain: bands
      .filter(band => band.upTo !== Infinity)
      .map(band => band.upTo + 1e-6),
    range: bands.map(band => band.color),
    labels: bands.map(band => band.label),
  }
}
