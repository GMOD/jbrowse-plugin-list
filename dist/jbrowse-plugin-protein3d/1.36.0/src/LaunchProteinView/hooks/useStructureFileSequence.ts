import { useState } from 'react'

import { extractStructureSequences } from 'p2s_mapper'
import useSWR from 'swr'

import { parseStructureTrajectory } from '../../ProteinView/structurePipeline'
import { withTemporaryMolstarPlugin } from '../../ProteinView/withTemporaryMolstarPlugin'
import { readStructureFile } from '../utils/readStructureFile'
import { STATIC_SWR_OPTIONS } from './swrOptions'

// Only the model is built here, never a representation: the dialog wants the
// sequences, and the format detection is the same one the view applies later.
async function fetchSequences({ data, url }: { data?: string; url?: string }) {
  const sequences = await withTemporaryMolstarPlugin(async plugin => {
    const trajectory = await parseStructureTrajectory({ plugin, data, url })
    const model = await plugin.builders.structure.createModel(trajectory)
    return extractStructureSequences(model)
  })
  if (!sequences?.length) {
    throw new Error('No protein sequence found in this structure')
  }
  return sequences
}

/**
 * The protein sequences of a structure, from a local File or a remote URL
 * (exactly one is expected). A file is read once, for its chains and for the
 * launch, and its text is held by the dialog, not the page-wide cache, so a
 * file picked and dropped goes when the dialog does.
 */
export default function useStructureFileSequence({
  file,
  url,
}: {
  file?: File
  url?: string
}) {
  const [texts] = useState(() => new WeakMap<File, Promise<string>>())
  const readText = (picked: File) => {
    const text = texts.get(picked) ?? readStructureFile(picked)
    texts.set(picked, text)
    return text
  }
  const key = file
    ? (['structure-file', file] as const)
    : url
      ? (['structure-url', url] as const)
      : null
  const { data, error, isLoading } = useSWR(
    key,
    async () => {
      const text = file ? await readText(file) : undefined
      return {
        sequences: await fetchSequences({ data: text, url }),
        textLength: text?.length,
      }
    },
    STATIC_SWR_OPTIONS,
  )
  return {
    error,
    isLoading,
    sequences: data?.sequences,
    /** characters of the file's text, once read */
    textLength: data?.textLength,
    readText: file ? () => readText(file) : undefined,
  }
}
