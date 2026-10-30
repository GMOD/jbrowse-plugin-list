import { readConfObject } from '@jbrowse/core/configuration'

import { graphFacetConfigSchema } from './graphFacetConfigSchema'

test("bandage-core 11's domain loads as sort", () => {
  const facet = graphFacetConfigSchema.create({
    field: 'sample',
    domain: ['HG1', 'HG2'],
    columns: 2,
  })
  expect(readConfObject(facet, 'sort')).toEqual(['HG1', 'HG2'])
  expect(readConfObject(facet, 'columns')).toBe(2)
})
