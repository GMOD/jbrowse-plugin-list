import { SimpleFeature } from '@jbrowse/core/util'
import { expect, test } from 'vitest'

import { parseAlphaFoldModels, pickAlphaFoldModel } from './alphaFoldModels'

const model = (accession: string, sequence: string) => ({
  accession,
  url: `https://alphafold.ebi.ac.uk/files/AF-${accession}-F1-model_v6.cif`,
  sequence,
})

function isoforms(...seqs: string[]) {
  return Object.fromEntries(
    seqs.map((seq, i) => [
      `tx${i}`,
      {
        feature: new SimpleFeature({
          uniqueId: `tx${i}`,
          start: 0,
          end: 1,
          refName: 'c',
        }),
        seq,
      },
    ]),
  )
}

test('reads the prediction API entries it can open, skipping the rest', () => {
  expect(
    parseAlphaFoldModels([
      {
        uniprotAccession: 'P04637-2',
        cifUrl: 'https://alphafold.ebi.ac.uk/files/AF-P04637-2-F1-model_v6.cif',
        plddtDocUrl: 'https://alphafold.ebi.ac.uk/files/c.json',
        sequence: 'MEEP',
      },
      { uniprotAccession: 'P1' },
    ]),
  ).toEqual([
    {
      accession: 'P04637-2',
      url: 'https://alphafold.ebi.ac.uk/files/AF-P04637-2-F1-model_v6.cif',
      confidenceUrl: 'https://alphafold.ebi.ac.uk/files/c.json',
      sequence: 'MEEP',
    },
  ])
  expect(parseAlphaFoldModels({ error: 'x' })).toEqual([])
})

test('opens the model folded from a transcript translation, canonical first', () => {
  const models = [model('P04637-2', 'MKL'), model('P04637', 'MKLAA')]
  expect(pickAlphaFoldModel(models, isoforms('MKL*'))?.accession).toBe(
    'P04637-2',
  )
  expect(
    pickAlphaFoldModel(models, isoforms('MKL*', 'MKLAA*'))?.accession,
  ).toBe('P04637')
})

test('without an exact model, the canonical one, else the longest isoform model', () => {
  expect(
    pickAlphaFoldModel(
      [model('P04637-2', 'MKL'), model('P04637', 'MKLAA')],
      isoforms('QQQ'),
    )?.accession,
  ).toBe('P04637')
  // dystrophin: fourteen isoform models, no canonical one
  expect(
    pickAlphaFoldModel(
      [model('P11532-9', 'MK'), model('P11532-2', 'MKLAAGG')],
      isoforms('QQQ'),
    )?.accession,
  ).toBe('P11532-2')
  expect(pickAlphaFoldModel([], undefined)).toBeUndefined()
})
