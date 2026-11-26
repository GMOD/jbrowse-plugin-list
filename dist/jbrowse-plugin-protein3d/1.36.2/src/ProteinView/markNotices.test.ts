// @vitest-environment jsdom
import { types } from '@jbrowse/mobx-state-tree'
import { expect, test, vi } from 'vitest'

import { parseStructure } from '../test_data/molstarStructure'
import stateModelFactory from './model'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'

import type * as JBrowseCoreUtil from '@jbrowse/core/util'

vi.mock('@jbrowse/core/util', async importActual => {
  const actual = await importActual<typeof JBrowseCoreUtil>()
  return { ...actual, getSession: () => ({ hovered: undefined, views: [] }) }
})

// the view's autoruns start in afterAttach, so it needs a parent
const Session = types.model({ view: stateModelFactory() })

// a structure left unloaded, by a reload that failed or an assembly change,
// kept "mark A:999 is not in the structure" up beside it
test("an unloaded structure's mark notices clear", async () => {
  const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
  const { view } = Session.create({
    view: { type: 'ProteinView', structures: [{}] },
  })
  view.applyFigure({ marks: [{ site: 'A:999' }] })
  const [structure] = view.structures
  await withTemporaryMolstarPlugin(async plugin => {
    view.setMolstarPluginContext(plugin)
    // a structure with neither data nor a url fails its load, so the loader
    // leaves it unloaded once it is cleared
    await vi.waitFor(() => {
      expect(structure!.loadFailed).toBe(true)
    })
    structure!.setStructureData({
      molstarStructures: [
        await parseStructure([{ asym: 'A', entity: '1', residues: ['MET'] }]),
      ],
    })
    await vi.waitFor(() => {
      expect(view.figureNotices.marks).toEqual([
        'mark A:999 is not in the structure',
      ])
    })
    structure!.clearMolstarStructures()
    await vi.waitFor(() => {
      expect(view.figureNotices.marks).toEqual([])
    })
    view.setMolstarPluginContext(undefined)
  })
  expect(logged.mock.calls).toEqual([
    [new Error('a structure needs either data or a url')],
  ])
  logged.mockRestore()
})
