import { SimpleFeature } from '@jbrowse/core/util'
import { afterEach, expect, test, vi } from 'vitest'

import { launchProteinAnnotationView } from './launchProteinAnnotationView'
import { proteinTrackConfs } from './proteinTrackSetup'

afterEach(() => {
  vi.unstubAllGlobals()
})

const feature = new SimpleFeature({
  uniqueId: 'gene',
  refName: 'chr17',
  start: 0,
  end: 10,
})

const GFF = [
  '##gff-version 3',
  'P04637\tUniProtKB\tChain\t1\t393\t.\t.\t.\tID=PRO_0000185703',
  'P04637\tUniProtKB\tDNA binding\t102\t292\t.\t.\t.\t',
  '',
].join('\n')

function stubGff() {
  const fetched = vi.fn(async () => new Response(GFF))
  vi.stubGlobal('fetch', fetched)
  return fetched
}

interface StubView {
  id: string
  events: string[]
  launchTrack: (
    trackId: string,
    initialSnapshot: object,
    displayInitialSnapshot: object,
    inlineConf: Record<string, unknown>,
  ) => Promise<unknown>
  navToLocString: (loc: string, assemblyName: string) => Promise<void>
}

function stubSession(
  launchTrack: (trackId: string) => Promise<unknown> = async () => ({}),
) {
  const assemblies = new Set<string>()
  const views: StubView[] = []
  const launched: { viewId: string; trackId: string; conf: unknown }[] = []
  return {
    views,
    launched,
    addTemporaryAssembly: vi.fn((conf: Record<string, unknown>) => {
      assemblies.add(String(conf.name))
    }),
    addView: vi.fn(() => {
      const id = `view${views.length + 1}`
      const events: string[] = []
      const view: StubView = {
        id,
        events,
        launchTrack: async (trackId, _track, _display, conf) => {
          events.push(trackId)
          launched.push({ viewId: id, trackId, conf })
          return launchTrack(trackId)
        },
        navToLocString: async (loc, assemblyName) => {
          events.push(`nav ${loc} ${assemblyName}`)
        },
      }
      views.push(view)
      return view
    }),
    notifyError: vi.fn(),
    assemblyManager: {
      get: (name: string) => (assemblies.has(name) ? { name } : undefined),
    },
  }
}

test('a failed UniProt download adds no assembly, track or view', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('gone', { status: 503 })),
  )
  const s = stubSession()
  await expect(
    launchProteinAnnotationView({ session: s, feature, uniprotId: 'P04637' }),
  ).rejects.toThrow(/503/)
  expect(s.addTemporaryAssembly).not.toHaveBeenCalled()
  expect(s.addView).not.toHaveBeenCalled()
  expect(s.launched).toEqual([])
})

// the session track list rejects a config naming a temporary assembly, and the
// stub has no `addSessionTrackConf` to call
test('every track config goes to the view, under ids the view prefixes', async () => {
  stubGff()
  const s = stubSession()
  await launchProteinAnnotationView({
    session: s,
    feature,
    uniprotId: 'P04637',
    confidenceUrl: 'https://example.org/confidence.json',
  })
  const confs = proteinTrackConfs({
    uniprotId: 'P04637',
    featureTypes: ['Chain', 'DNA binding'],
    confidenceUrl: 'https://example.org/confidence.json',
    idPrefix: 'view1-P04637',
  })
  expect(confs).toHaveLength(6)
  expect(s.launched).toEqual(
    confs.map(conf => ({ viewId: 'view1', trackId: conf.trackId, conf })),
  )
  expect(s.views[0]?.events.at(-1)).toBe('nav P04637 P04637')
  expect(s.notifyError).not.toHaveBeenCalled()
  expect('addSessionTrackConf' in s).toBe(false)
})

// adding the assembly a second time made the host warn "already exists", and
// another isoform of an entry is the usual reason for a second view
test('a second view of an entry reuses its assembly and opens its own tracks', async () => {
  const fetched = stubGff()
  const s = stubSession()
  await launchProteinAnnotationView({
    session: s,
    feature,
    uniprotId: 'P04637',
  })
  await launchProteinAnnotationView({
    session: s,
    feature,
    uniprotId: 'P04637',
  })
  expect(fetched).toHaveBeenCalledTimes(2)
  expect(s.addTemporaryAssembly).toHaveBeenCalledOnce()
  expect(s.addView).toHaveBeenCalledTimes(2)
  const idsOf = (viewId: string) =>
    s.launched.filter(l => l.viewId === viewId).map(l => l.trackId)
  expect(idsOf('view1')).toHaveLength(5)
  expect(idsOf('view2')).toEqual(
    idsOf('view1').map(id => id.replace('view1-', 'view2-')),
  )
  expect(new Set(s.launched.map(l => l.trackId)).size).toBe(10)
})

// `get` on an unknown name sends the Hubs plugin to probe jbrowse.org/ucsc/
// for it, which logs two 404s on every jbrowse.org/ucsc launch
test('the assembly is looked for with `has`, which reports nothing', async () => {
  stubGff()
  const s = stubSession()
  const get = vi.fn(s.assemblyManager.get)
  const session = {
    ...s,
    assemblyManager: {
      get,
      has: (name: string) => !!s.assemblyManager.get(name),
    },
  }
  await launchProteinAnnotationView({ session, feature, uniprotId: 'P04637' })
  await launchProteinAnnotationView({ session, feature, uniprotId: 'P04637' })
  expect(get).not.toHaveBeenCalled()
  expect(s.addTemporaryAssembly).toHaveBeenCalledOnce()
})

// a view that lost its confidence track used to hand that gap to every later
// view of the entry, because the first launch's tracks were the only ones
test('a later view gets the confidence track an earlier one had no url for', async () => {
  stubGff()
  const s = stubSession()
  await launchProteinAnnotationView({
    session: s,
    feature,
    uniprotId: 'P04637',
  })
  await launchProteinAnnotationView({
    session: s,
    feature,
    uniprotId: 'P04637',
    confidenceUrl: 'https://example.org/confidence.json',
  })
  expect(
    s.launched
      .filter(l => l.trackId.endsWith('-AlphaFold-confidence'))
      .map(l => l.viewId),
  ).toEqual(['view2'])
})

test('a track that fails to open is reported by name and the rest still open', async () => {
  stubGff()
  const s = stubSession(async trackId => {
    if (trackId.endsWith('-Antigen')) {
      throw new Error('no such adapter')
    }
    return {}
  })
  await launchProteinAnnotationView({
    session: s,
    feature,
    uniprotId: 'P04637',
  })
  expect(s.notifyError).toHaveBeenCalledOnce()
  expect(s.notifyError.mock.calls[0]?.[0]).toBe(
    'Could not open the Antigen track: Error: no such adapter',
  )
  expect(s.views[0]?.events).toEqual([
    'view1-P04637-Chain',
    'view1-P04637-DNA binding',
    'view1-P04637-Antigen',
    'view1-P04637-Variation',
    'view1-P04637-AlphaMissense-scores',
    'nav P04637 P04637',
  ])
})

// the host snackbars a config it rejects and resolves undefined, so a second
// message from here would say the same thing twice
test('a track the host declines adds no second error', async () => {
  stubGff()
  const s = stubSession(async () => undefined)
  await launchProteinAnnotationView({
    session: s,
    feature,
    uniprotId: 'P04637',
  })
  expect(s.notifyError).not.toHaveBeenCalled()
  expect(s.views[0]?.events.at(-1)).toBe('nav P04637 P04637')
})

test('a view that cannot open tracks fails the launch', async () => {
  stubGff()
  const s = { ...stubSession(), addView: vi.fn(() => ({ id: 'view1' })) }
  await expect(
    launchProteinAnnotationView({ session: s, feature, uniprotId: 'P04637' }),
  ).rejects.toThrow(/cannot open tracks/)
})
