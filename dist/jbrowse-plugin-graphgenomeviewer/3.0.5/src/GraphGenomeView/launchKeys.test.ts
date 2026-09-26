import GraphGenomeViewF from './index'

import type ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'

// `loadSessionSpec` reports a spec's misspelled keys by diffing them against
// `ViewType.acceptedKeys`, which is `undefined` — and the check therefore
// skipped entirely — until a view declares its launch vocabulary. This view's
// vocabulary is empty (every field is a plain persisted prop), so declaring it
// is the whole of what turns the report on. See index.ts.
function graphViewType() {
  let registered: ViewType | undefined
  GraphGenomeViewF({
    addViewType: (cb: () => ViewType) => {
      registered = cb()
    },
  } as unknown as Parameters<typeof GraphGenomeViewF>[0])
  return registered!
}

// Every view-level field the jbrowse-components docs launch a graph figure
// with, across the two dozen specs in `website/scripts/specs`. `sessionSpec()`
// takes a bare `object`, so nothing typechecks those; this is where a prop
// rename that would silently break them shows up.
const DOCS_SPEC_KEYS = [
  'displayName',
  'loadedTrackId',
  'loadedRegion',
  'gfaLocation',
  'layoutMode',
  'layoutQuality',
  'colorScheme',
  'colorDomain',
  'referencePath',
  'bubbleSpread',
  'paneHeight',
  'maxRegionBp',
]

test('the launch vocabulary is declared, so a spec typo can be reported', () => {
  expect(graphViewType().acceptedKeys).toBeDefined()
})

test.each(DOCS_SPEC_KEYS)('a docs figure spec may state %s', key => {
  expect(graphViewType().acceptedKeys).toContain(key)
})

// The other half: a key nothing declares has to be REPORTABLE, or the check
// above passes while accepting everything.
test('a misspelling is not accepted', () => {
  const { acceptedKeys } = graphViewType()
  expect(acceptedKeys).not.toContain('loadedReigon')
  expect(acceptedKeys).not.toContain('subgraphHops')
})

// The pair the launch menus write and `afterAttach` refetches from, which is
// what makes a graph cut declarable at all rather than only clickable.
test('a cut is expressible without a file', () => {
  const { acceptedKeys } = graphViewType()
  expect(acceptedKeys).toContain('loadedTrackId')
  expect(acceptedKeys).toContain('loadedRegion')
  expect(acceptedKeys).toContain('subgraphHaplotypes')
  expect(acceptedKeys).toContain('subgraphContext')
})
