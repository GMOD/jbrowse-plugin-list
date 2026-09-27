import { graphReferenceAssembly, trackLanes } from './graphTrackConfig'

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
