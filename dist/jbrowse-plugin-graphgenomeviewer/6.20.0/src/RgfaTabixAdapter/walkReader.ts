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

// A walk the read cuts off goes on in the chunk its row names, out to which a
// cut reads on, in at most this many rounds and this many chunks from the read
const FOLLOW_ROUNDS = 3
const FOLLOW_CHUNKS = 4

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
    const bytesFor = async (spans: { start: number; end: number }[]) => {
      const sizes = await Promise.all(
        files.map(file =>
          file.bytesForRegions(
            spans.map(span => ({ refName, ...span })),
            { signal },
          ),
        ),
      )
      return sizes.reduce((sum, bytes) => sum + bytes, 0)
    }
    const tooLarge = await byteBudgetError(
      async end => {
        checkRange(refName, from, end)
        return bytesFor([{ start: from, end }])
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
    let cut: ReturnType<typeof walkCut>
    const graph = new WalkGraph({
      refName,
      start: region.start,
      end: region.end,
      context: opts.context,
    })
    const read = (
      file: TabixIndexedFile,
      lineCallback: (line: string) => void,
      start = from,
      end = region.end,
    ) =>
      getLines(file, refName, start, end, {
        signal: reads.signal,
        lineCallback,
      })
    const addRow = (line: string) => {
      if (keep === undefined || keep(walkRowName(line))) {
        rows.push(parseWalkRow(line))
      }
    }
    const addNode = (line: string) => {
      graph.addNode(line)
    }
    const addLink = (line: string) => {
      graph.addLink(line)
    }
    try {
      await Promise.all([
        read(this.files.walks, addRow).then(() => {
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
        read(this.files.nodes, addNode),
        ...(links ? [read(this.files.links, addLink)] : []),
      ])
      // the chunks read, first to last, which a follow widens to the
      // farthest chunk a cut-off walk goes on in, so the reference between
      // is read too
      let first = from
      let last = Math.floor((region.end - 1) / chunk) * chunk
      const reach = FOLLOW_CHUNKS * chunk
      const [lo, hi] = [first - reach, last + reach]
      cut = walkCut(joinPieces(rows), graph.nodes, refName)
      let spent = await bytesFor([{ start: from, end: region.end }])
      for (let round = 0; round < FOLLOW_ROUNDS; round++) {
        const starts = cut.open
          .filter(c => c.refName === refName && c.start >= lo && c.start <= hi)
          .map(c => c.start)
        const spans = [
          { start: Math.min(first, ...starts), end: first },
          { start: last + chunk, end: Math.max(last, ...starts) + 1 },
        ].filter(span => span.end > span.start)
        if (spans.length === 0) {
          break
        }
        spent += await bytesFor(spans)
        if (spent > opts.byteBudget) {
          break
        }
        first = Math.min(first, ...starts)
        last = Math.max(last, ...starts)
        await Promise.all(
          spans.flatMap(({ start, end }) => [
            read(this.files.walks, addRow, start, end),
            read(this.files.nodes, addNode, start, end),
            ...(links ? [read(this.files.links, addLink, start, end)] : []),
          ]),
        )
        cut = walkCut(joinPieces(rows), graph.nodes, refName)
      }
    } catch (error) {
      reads.abort()
      throw error
    } finally {
      signal?.removeEventListener('abort', stop)
    }
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
