import {
  cutsByHaplotype,
  graphReferenceAssembly,
  trackLanes,
} from './graphTrackConfig'

function track(assemblyNames: string[]) {
  return { trackId: 'graph', assemblyNames } as never
}

test('a track cuts for the assemblies it names after its reference', () => {
  expect(trackLanes(track(['hg38', 'HG00097.1', 'HG00099.1']))).toEqual([
    'HG00097.1',
    'HG00099.1',
  ])
})

test('a track naming only its reference cuts for every haplotype', () => {
  expect(trackLanes(track(['hg38']))).toBeUndefined()
})

test('a track is cut on the first assembly it names', () => {
  expect(graphReferenceAssembly(track(['hg38', 'NA20809.2']))).toBe('hg38')
})

test('a GBZ cut and a walk-indexed rGFA cut read the haplotype set', () => {
  expect(cutsByHaplotype({ type: 'GbzBaseSyntenyAdapter' })).toBe(true)
  expect(
    cutsByHaplotype({
      type: 'RgfaTabixAdapter',
      walksLocation: { uri: 'chr22.walks.bed.gz' },
    }),
  ).toBe(true)
  expect(
    cutsByHaplotype({ type: 'RgfaTabixAdapter', walksLocation: { uri: '' } }),
  ).toBe(false)
  expect(cutsByHaplotype({ type: 'RgfaTabixAdapter' })).toBe(false)
})
