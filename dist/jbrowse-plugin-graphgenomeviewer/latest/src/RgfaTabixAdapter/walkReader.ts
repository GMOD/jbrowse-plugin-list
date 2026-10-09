import { cachedSetup } from '@jbrowse/core/data_adapters/BaseAdapter'

import { checkRange, getLines } from './tabixRange.ts'
import {
  WalkGraph,
  byteBudgetError,
  chunkQueryStart,
  joinPieces,
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
 * decoded, and none is past the step budget: the reads go out together and a
 * walk read over budget stops the others.
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
            opts.stepBudget,
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
    return { graph, ...walkCut(joinPieces(rows), graph.nodes) }
  }
}
