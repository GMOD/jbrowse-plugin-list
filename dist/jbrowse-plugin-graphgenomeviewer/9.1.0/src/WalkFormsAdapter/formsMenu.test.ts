import { types } from '@jbrowse/mobx-state-tree'

import { FLOORS, pinnedLabel, withFormsMenu } from './formsMenu.ts'

import type { MenuItem } from '@jbrowse/core/ui'

const LPA = { refName: 'chr6', start: 160_525_000, end: 160_655_000 }

const FakeDisplay = types
  .model('FakeDisplay', { adapter: types.frozen<Record<string, unknown>>() })
  .volatile(() => ({
    sourcesBase: undefined as Record<string, unknown>[] | undefined,
  }))
  .views(self => ({
    get parentTrack() {
      return {
        configuration: {
          trackId: 'forms',
          type: 'VariantTrack',
          assemblyNames: ['hg38'],
          adapter: self.adapter,
        },
      }
    },
    trackMenuItems(): MenuItem[] {
      return [{ label: 'Core item', onClick: () => {} }]
    },
  }))
  .actions(self => ({
    setRows(rows: Record<string, unknown>[]) {
      self.sourcesBase = rows
    },
    setSources(rows: Record<string, unknown>[]) {
      self.sourcesBase = rows
    },
  }))

const block = (refName: string, start: number, end: number) => ({
  refName,
  assemblyName: 'hg38',
  start,
  end,
  offsetPx: 0,
  displayedRegionIndex: 0,
})

const FakeView = types
  .model('FakeView', {
    display: withFormsMenu(FakeDisplay),
    refName: types.optional(types.string, 'chr6'),
    start: types.number,
    end: types.number,
  })
  .volatile(() => ({
    width: 1000,
    bpPerPx: 1,
    offsetPx: 0,
    displayedRegions: [{ start: 0, end: 170_805_979 }],
    coarseDynamicBlocks: [],
  }))
  .views(self => ({
    get dynamicBlocks() {
      return { contentBlocks: [block(self.refName, self.start, self.end)] }
    },
    horizontalScroll: (d: number) => d,
    zoomTo: (bpPerPx: number) => bpPerPx,
  }))
  .actions(self => ({
    setWidth() {},
    pan(start: number, end: number) {
      self.start = start
      self.end = end
    },
  }))

// hg38 names chromosome 6 `6`, as Ensembl does, and knows `chr6` as an alias
const aliases: Record<string, string[]> = {
  '6': ['chr6', 'NC_000006.12'],
  chr6: ['6', 'NC_000006.12'],
}

const hg38 = {
  getAliasesForRefName: (refName: string) => aliases[refName] ?? [],
}

const FakeSession = types
  .model('FakeSession', { view: FakeView })
  .volatile(() => ({
    rpcManager: {},
    configuration: {},
    assemblyManager: {
      get: (name: string) => (name === 'hg38' ? hg38 : undefined),
    },
    snackbarMessages: [] as { message: string }[],
  }))
  .actions(self => ({
    notify(message: string) {
      self.snackbarMessages.push({ message })
    },
    removeSnackbarMessage(message: string) {
      self.snackbarMessages = self.snackbarMessages.filter(
        m => m.message !== message,
      )
    },
  }))

function makeSession(adapter: Record<string, unknown>, refName = 'chr6') {
  return FakeSession.create({
    view: {
      display: { adapter },
      refName,
      start: 160_600_000.4,
      end: 160_700_000.6,
    },
  })
}

const makeView = (adapter: Record<string, unknown>) => makeSession(adapter).view

const formsAdapter = {
  type: 'WalkFormsAdapter',
  walksLocation: { uri: 'x.walks.gz', locationType: 'UriLocation' },
  pinned: LPA,
}

interface Item {
  label?: unknown
  onClick: () => void
  disabled?: boolean
  checked?: boolean
  subMenu?: Item[]
}

const labels = (items: MenuItem[]) =>
  (items as unknown as Item[]).map(i => i.label)

function item(items: MenuItem[], label: string) {
  const found = (items as unknown as Item[]).find(i => i.label === label)
  if (!found) {
    throw new Error(`no menu item ${label}`)
  }
  return found
}

test('another adapter gets no forms items, and its config unchanged', () => {
  const { display } = makeView({ type: 'VcfTabixAdapter' })
  expect(labels(display.trackMenuItems())).toEqual(['Core item'])
  expect(display.adapterConfig).toEqual({ type: 'VcfTabixAdapter' })
})

test('a WalkFormsAdapter track gets the pin, re-pin and floor items', () => {
  const { display } = makeView(formsAdapter)
  expect(labels(display.trackMenuItems())).toEqual([
    'Core item',
    'Pinned to chr6:160,525,001-160,655,000',
    'Re-pin to visible region',
    'Hide changes under',
  ])
  expect(
    labels(
      item(display.trackMenuItems(), 'Hide changes under')
        .subMenu as unknown as MenuItem[],
    ),
  ).toEqual(['Auto', '50 bp', '1 kb', '10 kb'])
})

test('the pinned label counts the forms the rows hold', () => {
  const { display } = makeView(formsAdapter)
  display.setRows([
    ...Array.from({ length: 8 }, (_, i) => ({ name: `F${i + 1}`, forms: 1 })),
    { name: 'other', forms: 18 },
  ])
  const [label] = display.formsMenuItems()
  expect(label).toMatchObject({
    label: 'Pinned to chr6:160,525,001-160,655,000 · 26 forms',
    disabled: true,
  })
  expect(pinnedLabel(LPA, 1)).toBe(
    'Pinned to chr6:160,525,001-160,655,000 · 1 form',
  )
  expect(pinnedLabel(undefined)).toBe('Not pinned')
})

test('re-pin sets the window to the visible region, in whole bases', () => {
  const view = makeView(formsAdapter)
  const { display } = view
  item(display.trackMenuItems(), 'Re-pin to visible region').onClick()
  expect(display.formsPinned).toEqual({
    refName: 'chr6',
    start: 160_600_000,
    end: 160_700_001,
  })
  expect(display.adapterConfig.pinned).toEqual(display.formsPinned)
  expect(display.adapterConfig.walksLocation).toEqual(
    formsAdapter.walksLocation,
  )
  expect(
    item(display.trackMenuItems(), 'Re-pin to visible region').disabled,
  ).toBe(true)

  view.pan(160_800_000, 160_900_000)
  expect(display.adapterConfig.pinned).toEqual({
    refName: 'chr6',
    start: 160_600_000,
    end: 160_700_001,
  })
  expect(
    item(display.trackMenuItems(), 'Re-pin to visible region').disabled,
  ).toBe(false)
})

test('the floor items set floorBp and check the one in force', () => {
  const { display } = makeView({ ...formsAdapter, floorBp: 1000 })
  const checked = () =>
    item(display.trackMenuItems(), 'Hide changes under')
      .subMenu!.filter(i => i.checked)
      .map(i => i.label)
  expect(checked()).toEqual(['1 kb'])
  item(display.trackMenuItems(), 'Hide changes under')
    .subMenu!.find(i => i.label === '10 kb')!
    .onClick()
  expect(display.formsFloorBp).toBe(10_000)
  expect(display.adapterConfig.floorBp).toBe(10_000)
  expect(display.adapterConfig.pinned).toEqual(LPA)
  expect(checked()).toEqual(['10 kb'])
  expect(FLOORS.map(f => f.value)).toEqual(['auto', 50, 1000, 10_000])
})

test('the floor defaults to auto when the config leaves it unset', () => {
  const { display } = makeView(formsAdapter)
  expect(display.formsFloor).toBe('auto')
  expect(display.adapterConfig).not.toHaveProperty('floorBp')
})

test("a re-pin on the assembly's contig name sends its aliases for the worker to match", () => {
  const { display } = makeSession(formsAdapter, '6').view
  expect(display.adapterConfig.pinnedAliases).toEqual(['6', 'NC_000006.12'])
  item(display.trackMenuItems(), 'Re-pin to visible region').onClick()
  expect(display.adapterConfig).toMatchObject({
    pinned: { refName: '6', start: 160_600_000, end: 160_700_001 },
    pinnedAliases: ['chr6', 'NC_000006.12'],
  })
  expect(
    item(display.trackMenuItems(), 'Re-pin to visible region').disabled,
  ).toBe(true)
})

test('a pinned contig the assembly lacks sends no aliases', () => {
  const { display } = makeView({
    ...formsAdapter,
    pinned: { ...LPA, refName: 'chrUn' },
  })
  expect(display.adapterConfig).not.toHaveProperty('pinnedAliases')
})

test("a floor change or new rows take down the old window's warnings", () => {
  const session = makeSession(formsAdapter)
  const { display } = session.view
  const lpa = 'Forms of chr6:160,525,001-160,655,000: 3 smaller forms'
  session.notify(lpa)
  session.notify('Another track: a warning of its own')
  item(display.trackMenuItems(), 'Hide changes under')
    .subMenu!.find(i => i.label === '10 kb')!
    .onClick()
  expect(session.snackbarMessages.map(m => m.message)).toEqual([
    'Another track: a warning of its own',
  ])

  session.notify(lpa)
  display.setSources([{ name: 'F1' }])
  expect(display.sourcesBase).toEqual([{ name: 'F1' }])
  expect(session.snackbarMessages).toHaveLength(1)
})

test("a re-pin takes down the old window's warnings", () => {
  const session = makeSession(formsAdapter)
  const { display } = session.view
  display.setSources([{ name: 'F1' }])
  session.notify('Forms of chr6:160,525,001-160,655,000: 3 smaller forms')
  item(display.trackMenuItems(), 'Re-pin to visible region').onClick()
  session.notify('Forms of chr6:160,600,001-160,700,001: 2 smaller forms')
  display.setSources([{ name: 'F1' }, { name: 'F2' }])
  expect(session.snackbarMessages).toEqual([])
})
