import type { TabixIndexedFile } from '@gmod/tabix'

// tabix-js loops forever on a NaN end and reads nothing for a NaN start
// (GMOD/tabix-js#157), so every query refuses a range that is not finite first
export function checkRange(refName: string, start: number, end: number) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    throw new Error(
      `${refName}:${start}-${end} is not a finite range to query the graph's index for`,
    )
  }
}

export async function getLines(
  file: TabixIndexedFile,
  refName: string,
  start: number,
  end: number,
  opts: { signal?: AbortSignal; lineCallback: (line: string) => void },
) {
  checkRange(refName, start, end)
  return file.getLines(refName, start, end, opts)
}
