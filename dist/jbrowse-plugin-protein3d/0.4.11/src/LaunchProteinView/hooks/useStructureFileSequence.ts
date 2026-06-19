import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'
import { addStructureFromData } from '../../ProteinView/addStructureFromData'
import { addStructureFromURL } from '../../ProteinView/addStructureFromURL'
import { extractStructureSequences } from '../../ProteinView/extractStructureSequences'
import { withTemporaryMolstarPlugin } from '../../ProteinView/withTemporaryMolstarPlugin'

type StructureFormat = 'pdb' | 'mmcif'

function detectStructureFormat(fileName: string): StructureFormat {
  const dot = fileName.lastIndexOf('.')
  const ext = dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : ''
  if (ext === 'cif' || ext === 'mmcif' || ext === 'bcif') {
    return 'mmcif'
  }
  return 'pdb'
}

async function fetchSequences({ file, url }: { file?: File; url?: string }) {
  return withTemporaryMolstarPlugin(async plugin => {
    const { model } = file
      ? await addStructureFromData({
          data: await file.text(),
          plugin,
          format: detectStructureFormat(file.name),
        })
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
  const { data, error, isLoading } = useSWR<string[] | undefined>(
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

  return { error, isLoading, sequences: data }
}
