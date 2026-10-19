import { openLocation } from '@jbrowse/core/util/io'

import {
  BaseProteinAnnotationAdapter,
  type ProteinAnnotationRow,
} from '../BaseProteinAnnotationAdapter'

export interface AlphaFoldConfidenceRow extends ProteinAnnotationRow {
  score: number
}

interface AlphaFoldConfidenceJson {
  residueNumber: number[]
  confidenceScore: number[]
}

/**
 * Converts AlphaFold confidence JSON to features. residueNumber is 1-based, so
 * residue n becomes the 0-based half-open interval [n-1, n) to line up with the
 * interbase protein reference sequence.
 */
export function parseAlphaFoldConfidence(
  json: AlphaFoldConfidenceJson,
): AlphaFoldConfidenceRow[] {
  return json.residueNumber.map((residue, idx) => ({
    uniqueId: `feat-${idx}`,
    start: residue - 1,
    end: residue,
    score: json.confidenceScore[idx]!,
  }))
}

export default class AlphaFoldConfidenceAdapter extends BaseProteinAnnotationAdapter<AlphaFoldConfidenceRow> {
  protected async loadFeatures() {
    const json = JSON.parse(
      await openLocation(this.getConf('location')).readFile('utf8'),
    ) as AlphaFoldConfidenceJson
    return parseAlphaFoldConfidence(json)
  }
}
