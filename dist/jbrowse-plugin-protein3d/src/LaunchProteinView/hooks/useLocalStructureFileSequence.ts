import useSWR from 'swr'

import { addStructureFromData } from '../../ProteinView/addStructureFromData'
import { extractStructureSequences } from '../../ProteinView/extractStructureSequences'
import { withTemporaryMolstarPlugin } from '../../ProteinView/withTemporaryMolstarPlugin'

async function structureFileSequenceFetcher(
  file: File,
  format: 'pdb' | 'mmcif',
) {
  return withTemporaryMolstarPlugin(async plugin => {
    const { model } = await addStructureFromData({
      data: await file.text(),
      plugin,
      format,
    })
    return extractStructureSequences(model)
  })
}

export default function useLocalStructureFileSequence({
  file,
}: {
  file?: File
}) {
  const { data, error, isLoading } = useSWR<string[] | undefined>(
    file ? ['local-structure', file.name, file.size, file.lastModified] : null,
    async () => {
      if (!file) {
        return undefined
      }

      const ext = file.name.slice(file.name.lastIndexOf('.') + 1) || 'pdb'
      const seq = await structureFileSequenceFetcher(
        file,
        (ext === 'cif' ? 'mmcif' : ext) as 'pdb' | 'mmcif',
      )
      if (!seq) {
        throw new Error('no sequences detected in file')
      }
      return seq
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  )

  return { error, isLoading, sequences: data }
}
