import { unzip } from '@gmod/bgzf-filehandle'
import { parseGaf, parseGafLine } from '@jbrowse/bandage-core/gaf/parseGaf'
import { cachedSetup } from '@jbrowse/core/data_adapters/BaseAdapter'

import type { TabixIndexedFile } from '@gmod/tabix'
import type { GafRecord } from '@jbrowse/bandage-core/gaf/parseGaf'

interface WholeFile {
  stat(): Promise<{ size: number }>
  readFile(): Promise<Uint8Array>
}

export interface GafReads {
  records: GafRecord[]
  // reads over the nodes before sampling
  total: number
}

// The tube map lays reads out on the main thread at about 40 ms per thousand
export const MAX_READS = 5000

// An unindexed GAF is read whole, once, into the worker
const MAX_UNINDEXED_BYTES = 50 * 2 ** 20

export class UnindexedGafTooLargeError extends Error {
  override name = 'UnindexedGafTooLargeError'

  constructor(size: number) {
    super(
      `this GAF is ${(size / 2 ** 20).toFixed(0)} MB without an index; bgzip it and index it with tabix -p gaf`,
    )
  }
}

// Evenly spaced, so a pileup thins out rather than losing its right half
function sample(records: GafRecord[], max: number) {
  if (records.length <= max) {
    return records
  }
  const stride = records.length / max
  return Array.from({ length: max }, (_, k) => records[Math.floor(k * stride)]!)
}

const touches = (record: GafRecord, names: ReadonlySet<string>) =>
  record.path.some(step => names.has(step.name))

// A GAF over a graph's segments: bgzipped and indexed with `tabix -p gaf`,
// which keys each line by its lowest and highest node id and so needs numeric
// segment names, or plain or gzipped and read whole.
export class GafFile {
  // Shared by every window, so cachedSetup withholds each caller's signal: a
  // superseded fetch would otherwise fail the fetches waiting beside it
  private whole = cachedSetup({
    setup: async () => {
      const { size } = await this.file.stat()
      if (size > MAX_UNINDEXED_BYTES) {
        throw new UnindexedGafTooLargeError(size)
      }
      const bytes = await this.file.readFile()
      const text = new TextDecoder().decode(
        bytes[0] === 0x1f && bytes[1] === 0x8b ? await unzip(bytes) : bytes,
      )
      return parseGaf(text)
    },
  })

  constructor(
    private file: WholeFile,
    private tabix?: TabixIndexedFile,
  ) {}

  private async readIndexed(
    tabix: TabixIndexedFile,
    names: ReadonlySet<string>,
    signal?: AbortSignal,
  ) {
    let lo = Infinity
    let hi = -Infinity
    for (const name of names) {
      const id = Number(name)
      if (Number.isInteger(id)) {
        lo = Math.min(lo, id)
        hi = Math.max(hi, id)
      }
    }
    const records: GafRecord[] = []
    if (lo <= hi) {
      await tabix.getLines('{node}', lo, hi + 1, {
        signal,
        lineCallback: line => {
          const record = parseGafLine(line)
          if (record && touches(record, names)) {
            records.push(record)
          }
        },
      })
    }
    return records
  }

  async readsOver(
    names: ReadonlySet<string>,
    { signal }: { signal?: AbortSignal } = {},
  ): Promise<GafReads> {
    const records = this.tabix
      ? await this.readIndexed(this.tabix, names, signal)
      : (await this.whole({ signal })).filter(r => touches(r, names))
    return { records: sample(records, MAX_READS), total: records.length }
  }
}
