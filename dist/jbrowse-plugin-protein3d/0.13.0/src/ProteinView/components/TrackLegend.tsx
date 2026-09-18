import React from 'react'

import Typography from '@mui/material/Typography'

import { getFeatureColor } from '../hooks/useUniProtFeatures'
import { PLDDT_BINS, plddtColor } from '../residueTracks'

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <span
        style={{
          width: 8,
          height: 8,
          background: color,
          border: '1px solid rgba(0,0,0,0.3)',
        }}
      />
      {label}
    </span>
  )
}

/**
 * What the colours under the alignment mean. The pLDDT track enables itself on
 * any AlphaFold model and the feature track draws more than thirty UniProt
 * types, all of them coloured and none of them labelled, so a reader could see
 * the bands without being told what any of them encode.
 */
export default function TrackLegend({
  featureTypes,
  showConfidence,
}: {
  featureTypes: string[]
  showConfidence: boolean
}) {
  return showConfidence || featureTypes.length > 0 ? (
    <Typography
      variant="caption"
      color="textSecondary"
      component="div"
      data-testid="track-legend"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        fontSize: 9,
        paddingLeft: 8,
      }}
    >
      {showConfidence ? (
        <span style={{ display: 'inline-flex', gap: 6 }}>
          pLDDT:
          {PLDDT_BINS.map(bin => (
            <Swatch
              key={bin.label}
              color={plddtColor(bin.score)}
              label={bin.label}
            />
          ))}
        </span>
      ) : null}
      {featureTypes.map(type => (
        <Swatch key={type} color={getFeatureColor(type)} label={type} />
      ))}
    </Typography>
  ) : null
}
