import { existsSync } from 'node:fs'

import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Walk from './WalkTabixSyntenyAdapter.ts'
import walkSchema from './configSchema.ts'
import Gbz from '../GbzBaseSyntenyAdapter/GbzBaseSyntenyAdapter.ts'
import gbzSchema from '../GbzBaseSyntenyAdapter/configSchema.ts'

import type { Feature } from '@jbrowse/core/util'
import type { SyntenyMate } from '@jbrowse/synteny-core'

// chr22 of HPRC v2.1 as a gbz-base database and as gfa-to-tabix 0.5.0's
// GRCh38 walk files, built 2026-10-08. Skipped where the files are absent.
const dir = '/home/cdiesh/work/scratch/walks-20261008'
const walkPrefix = `${dir}/per-sample/after/chr22.GRCh38`
const present =
  existsSync(`${walkPrefix}.walks.bed.gz`) && existsSync(`${dir}/chr22.gbz.db`)

const local = (path: string) => ({
  localPath: path,
  locationType: 'LocalPathLocation',
})
const file = (kind: string) => `${walkPrefix}.${kind}.bed.gz`

const lanes = ['HG00097#1', 'HG00099#1', 'HG00128#1', 'HG00133#1']
const window = {
  refName: 'chr22',
  assemblyName: 'hg38',
  start: 20_000_000,
  end: 20_100_000,
}

const span = (f: Feature) => {
  const mate = f.get('mate') as SyntenyMate
  return `${f.get('assemblyName')} ${f.get('refName')}:${f.get('start')}-${f.get('end')} ${f.get('strand')} ${mate.assemblyName} ${mate.refName}:${mate.start}-${mate.end}`
}

const opTotal = (f: Feature, ops: string) =>
  [...(f.get('CIGAR') as string).matchAll(/(\d+)([=XIDM])/g)]
    .filter(([, , op]) => ops.includes(op!))
    .reduce((sum, [, n]) => sum + +n!, 0)

test.skipIf(!present)(
  'lanes and lane pairs span what gbz-base answers for the same window',
  async () => {
    const walk = new Walk(
      walkSchema.create({
        walksLocation: local(file('walks')),
        walksIndex: { location: local(`${file('walks')}.tbi`) },
        nodesLocation: local(file('nodes')),
        nodesIndex: { location: local(`${file('nodes')}.tbi`) },
        linksLocation: local(file('links')),
        linksIndex: { location: local(`${file('links')}.tbi`) },
        assemblyNames: ['hg38'],
        assemblyNameToPanSN: { hg38: 'GRCh38' },
      }),
    )
    const gbz = new Gbz(
      gbzSchema.create({
        gbzDbLocation: local(`${dir}/chr22.gbz.db`),
        haplotypeIndexLocation: local(`${dir}/chr22.haplotype-index.db`),
        assemblyNames: ['hg38'],
        assemblyNameToPanSN: { hg38: 'GRCh38#0' },
        context: 1000,
      }),
    )
    const lanePairs = lanes.slice(1).map((lane, i) => ({
      queryAssemblyName: lanes[i]!,
      targetAssemblyName: lane,
    }))
    for (const opts of [{ haplotypes: lanes }, { lanePairs }]) {
      const [fromWalks, fromGbz] = await Promise.all(
        [walk, gbz].map(adapter =>
          firstValueFrom(
            adapter.getFeatures(window, opts as never).pipe(toArray()),
          ),
        ),
      )
      expect(fromWalks!.map(span).sort()).toEqual(fromGbz!.map(span).sort())
    }
    // a pair's bases on shared nodes are the same count, and its mismatches
    // are bases gbz-base wrote as an insertion and a deletion
    const [walkPair] = await firstValueFrom(
      walk.getFeatures(window, { lanePairs }).pipe(toArray()),
    )
    const gbzPair = (
      await firstValueFrom(
        gbz.getFeatures(window, { lanePairs }).pipe(toArray()),
      )
    ).find(f => span(f) === span(walkPair!))!
    expect(opTotal(walkPair!, '=')).toBe(opTotal(gbzPair, '='))
    expect(opTotal(walkPair!, 'XI')).toBe(opTotal(gbzPair, 'I'))
    expect(opTotal(walkPair!, 'XD')).toBe(opTotal(gbzPair, 'D'))
  },
)
