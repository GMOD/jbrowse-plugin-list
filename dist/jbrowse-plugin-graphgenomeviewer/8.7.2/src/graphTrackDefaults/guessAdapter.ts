import { buildAdapterConfig } from '../GraphAddTrackWorkflow/buildTrackConfig'
import { isGraphIndexLocation } from '../GraphAddTrackWorkflow/graphManifest'
import { WALKS_SUFFIX, locationName, readsSiblings } from '../locationName'

import type { GraphFileChoice } from '../GraphAddTrackWorkflow/buildTrackConfig'
import type { FileLocation } from '@jbrowse/core/util'

const BUBBLES_SUFFIX = '.bubbles.bed.gz'

function isGbzLocation(loc: FileLocation) {
  return locationName(loc).toLowerCase().endsWith('.gbz.db')
}

function guessChoice(
  file: FileLocation,
  index: FileLocation | undefined,
  adapterHint: string | undefined,
): GraphFileChoice | undefined {
  const name = locationName(file)
  const allows = (type: GraphFileChoice) => !adapterHint || adapterHint === type
  // a file picked in the browser has no index beside it to assume
  const indexReachable = index !== undefined || readsSiblings(file)
  return isGbzLocation(file)
    ? allows('GbzBaseSyntenyAdapter')
      ? 'GbzBaseSyntenyAdapter'
      : undefined
    : isGraphIndexLocation(file)
      ? allows('RgfaTabixAdapter')
        ? 'RgfaTabixAdapter'
        : undefined
      : !indexReachable
        ? undefined
        : name.endsWith(WALKS_SUFFIX)
          ? // lanes beside the graph, unless the hint asks for the rGFA
            // adapter, which reads the file without them
            adapterHint === 'RgfaTabixAdapter'
            ? 'RgfaTabixWalks'
            : allows('WalkTabixSyntenyAdapter')
              ? 'WalkTabixSyntenyAdapter'
              : undefined
          : allows('MinigraphBubbleAdapter') &&
              (name.endsWith(BUBBLES_SUFFIX) || adapterHint !== undefined)
            ? 'MinigraphBubbleAdapter'
            : undefined
}

export function guessGraphAdapter(
  file: FileLocation,
  index?: FileLocation,
  adapterHint?: string,
) {
  const choice = guessChoice(file, index, adapterHint)
  return choice
    ? buildAdapterConfig({
        choice,
        loc: file,
        indexLoc: index,
        assembly: '',
        sample: '',
      })
    : undefined
}
