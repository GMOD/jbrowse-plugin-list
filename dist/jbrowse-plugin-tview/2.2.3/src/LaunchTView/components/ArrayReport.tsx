import React from 'react'

import { Typography } from '@mui/material'

import type { TviewPlanResult } from '../TviewGetPlanRpc'

/** allele lengths seen, commonest first, as `63bp x12` */
function alleleTally(lengths: [string, number][]) {
  const counts = new Map<number, number>()
  for (const [, length] of lengths) {
    counts.set(length, (counts.get(length) ?? 0) + 1)
  }
  return [...counts]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .map(([length, n]) => `${length}bp x${n}`)
}

/**
 * What the reads say about the arrays before the view is opened, since the
 * number is often the whole reason for opening it and a picture of 400 columns
 * is a slow way to read one off.
 */
export default function ArrayReport({ data }: { data: TviewPlanResult }) {
  const { arrays, subjectIndex, region } = data
  const subject = subjectIndex === undefined ? undefined : arrays[subjectIndex]
  if (!subject) {
    return arrays.length ? null : (
      <Typography variant="body2">
        No tandem array in the reference here, so the reads are laid out base by
        base.
      </Typography>
    )
  }
  const copies = subject.copies
  return (
    <>
      <Typography variant="subtitle2">
        Tandem array at {region.refName}:{subject.start.toLocaleString('en-US')}
        -{subject.end.toLocaleString('en-US')}, {subject.period}bp unit{' '}
        {subject.unit}
      </Typography>
      <Typography variant="body2">
        {copies.length} of {data.rowCount} rows span it end to end and carry{' '}
        {Math.min(...copies.map(c => c[1]))}&ndash;
        {Math.max(...copies.map(c => c[1]))} copies. Allele lengths:{' '}
        {alleleTally(subject.lengths).join(', ')}.
      </Typography>
      <Typography variant="body2">
        Each copy gets its own block of columns, so one divergent copy shows up
        as a column rather than shifting every copy after it. Blocks are array
        order, not homology: copies are counted from the left edge, and arrays
        expand and contract anywhere inside themselves, so the 9th copy of one
        row need not be the 9th of another. Read down a row, not across two.
      </Typography>
      {arrays.length > 1 ? (
        <Typography variant="body2">
          {arrays.length - 1} shorter{' '}
          {arrays.length === 2 ? 'array is' : 'arrays are'} also laid out per
          copy; rows are ordered by this one.
        </Typography>
      ) : null}
    </>
  )
}
