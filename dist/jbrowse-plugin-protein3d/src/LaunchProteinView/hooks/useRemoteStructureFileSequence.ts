import useSWR from 'swr'

import { addStructureFromURL } from '../../ProteinView/addStructureFromURL'
import { extractStructureSequences } from '../../ProteinView/extractStructureSequences'
import { withTemporaryMolstarPlugin } from '../../ProteinView/withTemporaryMolstarPlugin'

async function structureFileSequenceFetcher(url: string) {
  return withTemporaryMolstarPlugin(async plugin => {
    const { model } = await addStructureFromURL({ url, plugin })
    return extractStructureSequences(model)
  })
}

export default function useRemoteStructureFileSequence({
  url,
}: {
  url?: string
}) {
  const { data, error, isLoading } = useSWR<string[] | undefined>(
    url ? ['remote-structure', url] : null,
    async () => {
      if (!url) {
        return undefined
      }

      const seq = await structureFileSequenceFetcher(url)
      if (!seq) {
        throw new Error('no sequences detected in file')
      }
      return seq
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      keepPreviousData: true,
    },
  )

  return { error, isLoading, sequences: data }
}
