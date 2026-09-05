import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'
import { extractStructureSequences } from '../../ProteinView/extractStructureSequences'
import { parseStructureTrajectory } from '../../ProteinView/structurePipeline'
import { withTemporaryMolstarPlugin } from '../../ProteinView/withTemporaryMolstarPlugin'
import { readStructureFile } from '../utils/readStructureFile'

// Only the model is built here, never a representation: the dialog wants the
// sequences, and the format detection is the same one the view applies later.
async function fetchSequences({ file, url }: { file?: File; url?: string }) {
  const data = file ? await readStructureFile(file) : undefined
  return withTemporaryMolstarPlugin(async plugin => {
    const trajectory = await parseStructureTrajectory({ plugin, data, url })
    const model = await plugin.builders.structure.createModel(trajectory)
    return extractStructureSequences(model)
  })
}

// Extract protein sequences from a structure given either a local File or a
// remote URL (exactly one is expected). Used directly for user-provided
// structures and wrapped by useAlphaFoldData for AlphaFoldDB URLs.
export default function useStructureFileSequence({
  file,
  url,
}: {
  file?: File
  url?: string
}) {
  const key = file
    ? (['structure-file', file.name, file.size, file.lastModified] as const)
    : url
      ? (['structure-url', url] as const)
      : null
  const { data, error, isLoading, isValidating } = useSWR<string[] | undefined>(
    key,
    async () => {
      const seq = await fetchSequences({ file, url })
      if (!seq) {
        throw new Error('no sequences detected in file')
      }
      return seq
    },
    {
      ...STATIC_SWR_OPTIONS,
      keepPreviousData: true,
    },
  )

  // isValidating distinguishes "fetching for the current key" from the stale
  // data keepPreviousData keeps around during a key change. Consumers comparing
  // this sequence against another need it to avoid matching against stale data.
  return { error, isLoading, isValidating, sequences: data }
}
