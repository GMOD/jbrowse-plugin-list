import { checkRange } from '@jbrowse/graph-walks'

import type { TabixIndexedFile } from '@gmod/tabix'

export async function getLines(
  file: TabixIndexedFile,
  refName: string,
  start: number,
  end: number,
  opts: {
    signal?: AbortSignal
    lineCallback: (line: string, fileOffset: number) => void
  },
) {
  checkRange(refName, start, end)
  return file.getLines(refName, start, end, opts)
}

export async function bytesForRegions(
  file: TabixIndexedFile,
  regions: { refName: string; start: number; end: number }[],
  opts: { signal?: AbortSignal },
) {
  for (const { refName, start, end } of regions) {
    checkRange(refName, start, end)
  }
  return file.bytesForRegions(regions, opts)
}
