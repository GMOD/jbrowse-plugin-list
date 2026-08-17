import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'
import { addStructureFromData } from '../../ProteinView/addStructureFromData'
import { addStructureFromURL } from '../../ProteinView/addStructureFromURL'
import { extractStructureSequences } from '../../ProteinView/extractStructureSequences'
import { withTemporaryMolstarPlugin } from '../../ProteinView/withTemporaryMolstarPlugin'

// Format is detected by addStructureFromData/addStructureFromURL themselves.
// This hook used to detect it here, for the file branch only, which meant the
// dialog preview and the view that followed could disagree about the same file.
async function fetchSequences({ file, url }: { file?: File; url?: string }) {
  return withTemporaryMolstarPlugin(async plugin => {
    const { model } = file
      ? await addStructureFromData({ data: await file.text(), plugin })
      : await addStructureFromURL({ url: url!, plugin })
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
