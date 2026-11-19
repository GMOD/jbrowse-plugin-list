import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import ImportForm from './ImportForm'
import { graphTrackChoices } from '../graphTrackChoices'

import type { GraphGenomeViewModel } from '../viewModel'
import type { AnyTrackConfig } from '@jbrowse/core/configuration'

vi.mock('@jbrowse/core/util', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getSession: (model: { session: unknown }) => model.session,
}))

function renderForm() {
  const model = {
    error: undefined,
    loadGFAFile: vi.fn(),
    openGfaLocation: vi.fn(),
    loadGFA: vi.fn(),
    graphTracks: [],
  }
  render(<ImportForm model={model as unknown as GraphGenomeViewModel} />)
  return { model, form: screen.getByTestId('graph-import-form') }
}

test('a file dropped on the form loads as the file button would', () => {
  const { model, form } = renderForm()
  const file = new File(['S\t1\tACGT\n'], 'small.gfa')
  fireEvent.drop(form, { dataTransfer: { files: [file], types: ['Files'] } })
  expect(model.loadGFAFile).toHaveBeenCalledWith(file, 'small.gfa')
})

test('a file dragged over the form outlines it until it leaves', () => {
  const { form } = renderForm()
  const before = form.className
  fireEvent.dragOver(form, { dataTransfer: { types: ['Files'] } })
  expect(form.className).not.toBe(before)
  fireEvent.dragLeave(form)
  expect(form.className).toBe(before)
})

test('a drop with no file loads nothing', () => {
  const { model, form } = renderForm()
  fireEvent.drop(form, { dataTransfer: { files: [], types: [] } })
  expect(model.loadGFAFile).not.toHaveBeenCalled()
})

const hg38 = {
  regions: [{ refName: 'chr1', start: 0, end: 248_956_422 }],
  isValidRefName: (refName: string) => refName === 'chr1',
}

function graphTrack(
  trackId: string,
  adapter: Record<string, unknown>,
): AnyTrackConfig {
  return {
    trackId,
    name: trackId,
    type: 'GraphTrack',
    assemblyNames: ['hg38'],
    adapter,
  }
}

const OVERVIEW = graphTrack('overview', {
  type: 'RgfaTabixAdapter',
  uri: 'g',
  coarse: { uri: 'g.fold10000', foldBelowBp: 10_000 },
})
const WALKS = graphTrack('walks', { type: 'WalkTabixSyntenyAdapter', uri: 'w' })

function renderPicker(tracks: AnyTrackConfig[], views: unknown[] = []) {
  const model = {
    error: undefined,
    loadGFAFile: vi.fn(),
    openGfaLocation: vi.fn(),
    loadGFA: vi.fn(),
    showTrackInLinearView: vi.fn(),
    graphTracks: graphTrackChoices(tracks),
    session: {
      views,
      assemblyManager: {
        get: () => hg38,
        waitForAssembly: () => Promise.resolve(hg38),
      },
    },
  }
  render(<ImportForm model={model as unknown as GraphGenomeViewModel} />)
  return model
}

function regionBox() {
  return screen.getByLabelText('Region')
}

test('with graph tracks in the session the form leads with them, a track drawing at any zoom first on its whole first contig', async () => {
  const model = renderPicker([WALKS, OVERVIEW])
  expect(screen.getByText('Show a graph track')).toBeTruthy()
  expect(screen.getByTestId('graph-import-tip').textContent).toMatch(
    /track in a linear genome view.*Pick a graph track and a region below/,
  )
  expect(regionBox()).toHaveProperty('value', 'chr1')
  fireEvent.click(screen.getByTestId('graph-track-show'))
  await waitFor(() => {
    expect(model.showTrackInLinearView).toHaveBeenCalledWith(
      'overview',
      'hg38',
      'chr1',
    )
  })
})

test('a graph track that draws only zoomed in starts on a region small enough to draw', () => {
  renderPicker([WALKS])
  expect(regionBox()).toHaveProperty('value', 'chr1:1-20,000')
})

test('the region a lone linear view on the assembly shows is the one offered', () => {
  renderPicker(
    [WALKS],
    [
      {
        type: 'LinearGenomeView',
        assemblyNames: ['hg38'],
        visibleLocStrings: 'chr1:5,001-9,000',
      },
    ],
  )
  expect(regionBox()).toHaveProperty('value', 'chr1:5,001-9,000')
})

test('a region on a sequence the assembly lacks is refused in the form, which shows nothing', async () => {
  const model = renderPicker([WALKS])
  fireEvent.change(regionBox(), { target: { value: 'chrZ:1-100' } })
  fireEvent.click(screen.getByTestId('graph-track-show'))
  await waitFor(() => {
    expect(screen.getByText(/chrZ/)).toBeTruthy()
  })
  expect(model.showTrackInLinearView).not.toHaveBeenCalled()
})

test('with no graph tracks the form opens a small GFA file, and its tip says a pangenome opens as a track through File → Open track', () => {
  renderForm()
  expect(screen.getByText('Open a small GFA file')).toBeTruthy()
  expect(screen.getByTestId('graph-import-tip').textContent).toMatch(
    /track in a linear genome view.*gfa-to-tabix.*File → Open track/,
  )
})
