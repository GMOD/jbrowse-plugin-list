import { cachedSetup } from '@jbrowse/core/data_adapters/BaseAdapter'

import { checkRange, getLines } from './tabixRange.ts'
import {
  WalkGraph,
  byteBudgetError,
  chunkQueryStart,
  joinPieces,
  keptStepsError,
  lookbackChunks,
  parseWalkRow,
  stepBudgetError,
  walkCut,
  walkHeader,
  walkRowName,
} from './walkRows.ts'

import type { WalkRow } from './walkRows.ts'
import type { TabixIndexedFile } from '@gmod/tabix'
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'

// A window reads whole chunks and keeps the steps on it, so a narrow window
// reads several times what it keeps: 464 haplotypes across the 1.5 kb ABCA7
// repeat read 5.0 M steps and keep 1.16 M, and the cut takes 0.4 s from warm
// files. The step budget bounds what the cut keeps, and rows are read to this
// multiple of it.
const READ_STEPS_PER_KEPT = 8

export interface WalkFileSet {
  walks: TabixIndexedFile
  nodes: TabixIndexedFile
  links: TabixIndexedFile
}

export interface WalkCutOptions {
  signal?: AbortSignal
  // which walks to decode, by `sample#haplotype#contig`; undefined is all
  keep?: (name: string) => boolean
  stepBudget: number
  byteBudget: number
  // bp of reference kept past each end of the window
  context: number
  // false leaves the link file unread, for a caller that draws no edges
  links?: boolean
}

/**
 * A walk-indexed graph's three files, read a window at a time: one read of
 * each over whole chunks, from the lookback chunks before the window to its
 * end. The indexes first estimate the bytes those reads fetch, and a window
 * past the byte budget reads no row. Only the walks `keep` accepts are
 * decoded. The step budget bounds the steps the cut keeps, and rows holding
 * READ_STEPS_PER_KEPT times as many stop the reads, which go out together.
 */
export class WalkReader {
  constructor(
    private files: WalkFileSet,
    private chunkWithoutHeader: number,
  ) {}

  header = cachedSetup({
    setup: async opts => {
      const header = walkHeader(await this.files.walks.getHeaderLines(opts))
      const chunk = header.chunk ?? this.chunkWithoutHeader
      return {
        ...header,
        chunk,
        lookback: lookbackChunks(header.maxNode, chunk),
      }
    },
  })

  async queryStart(start: number, opts: BaseOptions) {
    const { chunk, lookback } = await this.header(opts)
    return chunkQueryStart(start, chunk, lookback)
  }

  async cut(
    refName: string,
    region: { start: number; end: number },
    opts: WalkCutOptions,
  ) {
    const { signal, keep, links = true } = opts
    const { chunk, lookback } = await this.header({ signal })
    const from = chunkQueryStart(region.start, chunk, lookback)
    const files = [
      this.files.walks,
      this.files.nodes,
      ...(links ? [this.files.links] : []),
    ]
    const tooLarge = await byteBudgetError(
      async end => {
        checkRange(refName, from, end)
        const sizes = await Promise.all(
          files.map(file =>
            file.bytesForRegions([{ refName, start: from, end }], { signal }),
          ),
        )
        return sizes.reduce((sum, bytes) => sum + bytes, 0)
      },
      opts.byteBudget,
      region,
      chunk,
    )
    if (tooLarge) {
      throw tooLarge
    }
    const reads = new AbortController()
    const stop = () => {
      reads.abort(signal?.reason)
    }
    signal?.addEventListener('abort', stop, { once: true })
    const rows: WalkRow[] = []
    const graph = new WalkGraph({
      refName,
      start: region.start,
      end: region.end,
      context: opts.context,
    })
    const read = (
      file: TabixIndexedFile,
      lineCallback: (line: string) => void,
    ) =>
      getLines(file, refName, from, region.end, {
        signal: reads.signal,
        lineCallback,
      })
    try {
      await Promise.all([
        read(this.files.walks, line => {
          if (keep === undefined || keep(walkRowName(line))) {
            rows.push(parseWalkRow(line))
          }
        }).then(() => {
          const error = stepBudgetError(
            rows,
            opts.stepBudget * READ_STEPS_PER_KEPT,
            region,
            chunk,
            keep !== undefined,
          )
          if (error) {
            throw error
          }
        }),
        read(this.files.nodes, line => {
          graph.addNode(line)
        }),
        ...(links
          ? [
              read(this.files.links, line => {
                graph.addLink(line)
              }),
            ]
          : []),
      ])
    } catch (error) {
      reads.abort()
      throw error
    } finally {
      signal?.removeEventListener('abort', stop)
    }
    const cut = walkCut(joinPieces(rows), graph.nodes)
    const tooMany = keptStepsError(
      cut.fragments,
      opts.stepBudget,
      region,
      keep !== undefined,
    )
    if (tooMany) {
      throw tooMany
    }
    return { graph, ...cut }
  }
}
