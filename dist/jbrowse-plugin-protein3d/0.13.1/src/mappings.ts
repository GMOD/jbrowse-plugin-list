import { genomeToTranscriptSeqMapping as g2p } from 'g2p_mapper'

import type { Feature } from '@jbrowse/core/util'
import type { Feat } from 'g2p_mapper'

// The alignment and coordinate machinery this used to hold lives in p2s_mapper;
// what stays is the one step that needs a JBrowse feature. See the similar
// function in the msaview plugin.
export function genomeToTranscriptSeqMapping(feature: Feature) {
  return g2p(feature.toJSON() as Feat)
}
