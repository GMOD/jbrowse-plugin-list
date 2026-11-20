import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'

import FacetPanels from './FacetPanels'
import HaplotypeSwitch from './HaplotypeSwitch'
import { usePaneGestures } from './usePaneGestures'
import { rpcRespond } from '../modelTestSupport'
import stateModelFactory from '../viewModel'

import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'

vi.mock('@jbrowse/core/util', async () =>
  (await import('../modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('../modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('../modelTestMocks')).ioMock(),
)

const WALKS_GFA = [
  'H\tVN:Z:1.1',
  'S\t1\tACGT',
  'S\t2\tGGCCGGCC',
  'S\t3\tTTTT',
  'L\t1\t+\t2\t+\t0M',
  'L\t2\t+\t3\t+\t0M',
  'L\t1\t+\t3\t+\t0M',
  'W\tGRCh38\t0\tchr1\t0\t8\t>1>3',
  'W\tB\t1\tctg\t0\t16\t>1>2>3',
  'W\tA\t2\tctg\t0\t8\t>1>3',
  '',
].join('\n')

async function loaded(gfa: string, layoutMode: LayoutModeValue) {
  rpcRespond()
  const model = stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode,
  })
  await model.loadGFA(gfa, 'graph')
  return model
}

const listed = () =>
  [...screen.getByRole('menu').querySelectorAll('[role^="menuitem"]')].map(
    row => row.textContent,
  )

test("the track's haplotype switch lists the menu's Highlight rows, a row highlights its walk as the menu's does, and the button counts the walks highlighted", async () => {
  const model = await loaded(WALKS_GFA, 'ordered')
  render(<HaplotypeSwitch model={model} />)
  const button = screen.getByTitle('Highlight haplotypes')
  expect(button.textContent).toBe('highlight▾')
  fireEvent.click(button)
  const rows = model
    .highlightMenuItems()
    .flatMap(item => ('onClick' in item ? [String(item.label)] : []))
  expect(listed()).toEqual(rows)
  const walk = model.walkChoices[1]!
  fireEvent.click(screen.getByText(walk.label))
  expect(model.walkLayers).toEqual([{ walk: walk.name }])
  await waitFor(() => {
    expect(button.textContent).toBe('1 of 3▾')
  })
})

test('a tube map, whose tubes are the walks, and a graph with no walks draw no haplotype switch', async () => {
  const tubes = await loaded(WALKS_GFA, 'tubemap')
  const bare = await loaded(
    WALKS_GFA.split('\n')
      .filter(line => !line.startsWith('W'))
      .join('\n'),
    'ordered',
  )
  for (const model of [tubes, bare]) {
    const { container, unmount } = render(<HaplotypeSwitch model={model} />)
    expect(container.innerHTML).toBe('')
    unmount()
  }
})

test("a faceted pane's key row holds the controls its host hands it, after its key", async () => {
  rpcRespond()
  const model = stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'ordered',
    walkLayers: [{ walk: 'GRCh38#0#chr1' }, { walk: 'B#1#ctg' }],
    facet: 'walk',
  })
  await model.loadGFA(WALKS_GFA, 'graph')
  model.setWidth(800)
  expect(model.facetPanels).toHaveLength(2)
  const { handlers } = renderHook(() => usePaneGestures(model)).result.current
  const drawn = (controls?: React.ReactNode) =>
    renderToStaticMarkup(
      <FacetPanels
        model={model}
        handlers={handlers}
        canvasStyle={{}}
        controls={controls}
      />,
    )
  const withSwitch = drawn(<HaplotypeSwitch model={model} inline />)
  const key = withSwitch.indexOf('data-testid="graph-facet-key"')
  expect(key).toBeGreaterThan(-1)
  expect(withSwitch.indexOf('graph-haplotype-switch')).toBeGreaterThan(key)
  expect(withSwitch).toContain('2 of 3')
  expect(drawn()).not.toContain('graph-haplotype-switch')
})
