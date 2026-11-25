import {
  getPdbIdFromUrl,
  getStructureUrlFromTarget,
  getUniprotIdFromAlphaFoldTarget,
  rcsbEntryUrl,
} from 'p2s_mapper'

import { alphaFoldEntryUrl } from './structureList'

/**
 * A Foldseek hit's target, its id followed by its description, as the results
 * name it: a PDB chain as `1TUP chain A` linked to its RCSB entry, an AlphaFold
 * model as `AF-P16442-F1` linked to its AlphaFold DB entry, and any other
 * database's id as Foldseek spells it.
 */
export function foldseekTarget(target: string, db: string) {
  const [id = target, ...rest] = target.split(' ')
  const description = rest.join(' ')
  const url = getStructureUrlFromTarget(target, db)
  const pdbId = url ? getPdbIdFromUrl(url) : undefined
  const accession = getUniprotIdFromAlphaFoldTarget(id)
  const chain = /_([A-Za-z0-9]+)$/.exec(id)?.[1]
  // an entry page shows the F1 model alone; a long protein's other fragments
  // have none of their own
  const firstFragment = /-F1(?:-|$)/.test(id)
  return pdbId
    ? {
        label: `${pdbId.toUpperCase()}${chain ? ` chain ${chain}` : ''}`,
        href: rcsbEntryUrl(pdbId),
        description,
      }
    : accession
      ? {
          label: id.replace(/-model_v\d+$/, ''),
          href: firstFragment ? alphaFoldEntryUrl(accession) : undefined,
          description,
        }
      : { label: id, href: undefined, description }
}
