import React from 'react'

import { Typography } from '@mui/material'

import IsoformSequencesToggle from './IsoformSequencesToggle'
import ExternalLink from '../../components/ExternalLink'
import { getTranscriptDisplayName } from '../utils/util'

import type { IsoformSequences } from '../utils/util'
import type { Feature } from '@jbrowse/core/util'

function NotFound({ uniprotId }: { uniprotId: string }) {
  return (
    <Typography>
      No structure found for this UniProtID in AlphaFoldDB{' '}
      <ExternalLink
        href={`https://alphafold.ebi.ac.uk/search/text/${uniprotId}`}
      >
        (search for results)
      </ExternalLink>
    </Typography>
  )
}

export default function AlphaFoldDBSearchStatus({
  uniprotId,
  selectedTranscript,
  structureSequence,
  isoformSequences,
  url,
}: {
  uniprotId?: string
  selectedTranscript?: Feature
  structureSequence?: string
  isoformSequences: IsoformSequences
  url?: string
}) {
  return uniprotId ? (
    <>
      <div>
        <Typography>
          UniProt link:{' '}
          <ExternalLink
            href={`https://www.uniprot.org/uniprotkb/${uniprotId}/entry`}
          >
            {uniprotId}
          </ExternalLink>
        </Typography>
        <Typography>
          AlphaFoldDB link: <ExternalLink href={url}>{url}</ExternalLink>
        </Typography>
      </div>
      {structureSequence ? (
        <IsoformSequencesToggle
          structureSequence={structureSequence}
          structureName={uniprotId}
          isoformSequences={isoformSequences}
        />
      ) : (
        <NotFound uniprotId={uniprotId} />
      )}
    </>
  ) : (
    <Typography>
      Searching{' '}
      {selectedTranscript
        ? getTranscriptDisplayName(selectedTranscript)
        : 'transcript'}{' '}
      for UniProt ID
    </Typography>
  )
}
