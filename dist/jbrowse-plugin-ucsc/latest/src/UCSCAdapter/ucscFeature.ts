export type UcscRecord = Record<string, unknown>

interface Span {
  start: number
  end: number
}

const REF_NAME_FIELDS = ['chrom', 'genoName', 'tName']
const START_FIELDS = ['chromStart', 'genoStart', 'tStart', 'txStart', 'start']
const END_FIELDS = ['chromEnd', 'genoEnd', 'tEnd', 'txEnd', 'end']
const BLOCK_FIELDS = new Set([
  'bin',
  'blockCount',
  'blockSizes',
  'chromStarts',
  'exonCount',
  'exonStarts',
  'exonEnds',
])

function firstNumber(record: UcscRecord, fields: string[]) {
  return fields
    .map(field => record[field])
    .find((value): value is number => typeof value === 'number')
}

function firstString(record: UcscRecord, fields: string[]) {
  return fields
    .map(field => record[field])
    .find((value): value is string => typeof value === 'string' && !!value)
}

function numberList(value: unknown) {
  return typeof value === 'string'
    ? value
        .split(',')
        .filter(entry => entry !== '')
        .map(Number)
    : []
}

function parseStrand(strand: unknown) {
  return strand === '+' ? 1 : strand === '-' ? -1 : 0
}

function parseBlocks(record: UcscRecord, start: number): Span[] {
  const exonStarts = numberList(record.exonStarts)
  const exonEnds = numberList(record.exonEnds)
  const chromStarts = numberList(record.chromStarts)
  const blockSizes = numberList(record.blockSizes)
  return exonStarts.length > 0
    ? exonStarts.map((exonStart, i) => ({
        start: exonStart,
        end: exonEnds[i] ?? exonStart,
      }))
    : chromStarts.map((offset, i) => ({
        start: start + offset,
        end: start + offset + (blockSizes[i] ?? 0),
      }))
}

function cdsPhases(cds: Span[], strand: number, exonFrames: number[]) {
  const transcriptOrder = strand < 0 ? cds.toReversed() : cds
  const phaseBySpan = new Map<Span, number>()
  let width = 0
  for (const span of transcriptOrder) {
    phaseBySpan.set(span, (3 - (width % 3)) % 3)
    width += Math.max(0, span.end - span.start)
  }
  return cds.map((span, i) => {
    const frame = exonFrames[i]
    return frame !== undefined && frame >= 0
      ? (3 - frame) % 3
      : phaseBySpan.get(span)
  })
}

export function transcriptParts(
  blocks: Span[],
  thickStart: number,
  thickEnd: number,
  strand: number,
  exonFrames: number[],
) {
  const [leftUtr, rightUtr] =
    strand < 0
      ? ['three_prime_UTR', 'five_prime_UTR']
      : ['five_prime_UTR', 'three_prime_UTR']
  const clipped = blocks.map(block => ({
    block,
    cds: {
      start: Math.max(block.start, thickStart),
      end: Math.min(block.end, thickEnd),
    },
  }))
  const phases = cdsPhases(
    clipped.map(({ cds }) => cds),
    strand,
    exonFrames,
  )
  return clipped.flatMap(({ block, cds }, i) =>
    [
      {
        type: leftUtr,
        start: block.start,
        end: Math.min(block.end, thickStart),
      },
      { type: 'CDS', ...cds, phase: phases[i] },
      {
        type: rightUtr,
        start: Math.max(block.start, thickEnd),
        end: block.end,
      },
    ].filter(part => part.start < part.end),
  )
}

function featureName(record: UcscRecord, isGene: boolean) {
  return isGene
    ? {
        name: firstString(record, ['geneName', 'name2', 'name']),
        description: firstString(record, ['name']),
      }
    : { name: firstString(record, ['repName', 'name']) }
}

export function ucscFeatureData(
  record: UcscRecord,
  trackType: string,
  fallbackRefName: string,
) {
  const start = firstNumber(record, START_FIELDS) ?? 0
  const end = firstNumber(record, END_FIELDS) ?? start
  const strand = parseStrand(record.strand)
  const blocks = parseBlocks(record, start)
  const isGene = /genePred/i.test(trackType) && blocks.length > 0
  const thickStart = firstNumber(record, ['thickStart', 'cdsStart']) ?? end
  const thickEnd = firstNumber(record, ['thickEnd', 'cdsEnd']) ?? end
  const exonFrames = numberList(record.exonFrames)
  const isCoding =
    thickStart < thickEnd &&
    (exonFrames.length === 0 || exonFrames.some(frame => frame >= 0))
  const rest = Object.fromEntries(
    Object.entries(record).filter(([key]) => !BLOCK_FIELDS.has(key)),
  )

  return {
    ...rest,
    ...featureName(record, isGene),
    ...(typeof record.color === 'string' ? { itemRgb: record.color } : {}),
    ...(typeof record.value === 'number' ? { score: record.value } : {}),
    refName: firstString(record, REF_NAME_FIELDS) ?? fallbackRefName,
    start,
    end,
    strand,
    ...(isGene
      ? {
          type: isCoding ? 'mRNA' : 'transcript',
          subfeatures: isCoding
            ? transcriptParts(blocks, thickStart, thickEnd, strand, exonFrames)
            : blocks.map(block => ({ ...block, type: 'exon' })),
        }
      : blocks.length > 0
        ? { subfeatures: blocks }
        : {}),
  }
}
