import { describe, expect, it } from 'vitest'

import { buildTrackConfig } from './buildTrackConfig'

const segs = {
  uri: 'https://example.com/hprc.segs.bed.gz',
  locationType: 'UriLocation' as const,
}

describe('buildTrackConfig', () => {
  it('derives the links BED and both indexes beside the segments BED', () => {
    const conf = buildTrackConfig({
      choice: 'RgfaTabixAdapter',
      loc: segs,
      indexLoc: undefined,
      assembly: 'hg38',
      sample: 'GRCh38',
      trackId: 'hprc',
      name: 'HPRC graph',
    })
    expect(conf).toEqual({
      type: 'GraphTrack',
      trackId: 'hprc',
      name: 'HPRC graph',
      assemblyNames: ['hg38'],
      adapter: {
        type: 'RgfaTabixAdapter',
        segmentsLocation: segs,
        segmentsIndex: {
          indexType: 'TBI',
          location: {
            uri: 'https://example.com/hprc.segs.bed.gz.tbi',
            locationType: 'UriLocation',
          },
        },
        linksLocation: {
          uri: 'https://example.com/hprc.links.bed.gz',
          locationType: 'UriLocation',
        },
        linksIndex: {
          indexType: 'TBI',
          location: {
            uri: 'https://example.com/hprc.links.bed.gz.tbi',
            locationType: 'UriLocation',
          },
        },
        assemblyNameToPanSN: { hg38: 'GRCh38' },
      },
      displayDefaults: { showLabels: 'none' },
    })
  })

  it('works on a local path and leaves the PanSN map off when blank', () => {
    const conf = buildTrackConfig({
      choice: 'RgfaTabixAdapter',
      loc: {
        localPath: '/data/g.segs.bed.gz',
        locationType: 'LocalPathLocation',
      },
      indexLoc: undefined,
      assembly: 'K12',
      sample: '  ',
      trackId: 'g',
      name: 'g',
    })
    expect(conf.adapter).toMatchObject({
      linksLocation: { localPath: '/data/g.links.bed.gz' },
      linksIndex: { location: { localPath: '/data/g.links.bed.gz.tbi' } },
    })
    expect(conf.adapter).not.toHaveProperty('assemblyNameToPanSN')
  })

  it('a CSI beside the segments implies one beside the links', () => {
    const conf = buildTrackConfig({
      choice: 'RgfaTabixAdapter',
      loc: segs,
      indexLoc: {
        uri: 'https://example.com/hprc.segs.bed.gz.csi',
        locationType: 'UriLocation',
      },
      assembly: 'hg38',
      sample: '',
      trackId: 'hprc',
      name: 'HPRC graph',
    })
    expect(conf.adapter).toMatchObject({
      segmentsIndex: { indexType: 'CSI' },
      linksIndex: {
        indexType: 'CSI',
        location: { uri: 'https://example.com/hprc.links.bed.gz.csi' },
      },
    })
  })

  it('a .CSI index of either case implies one beside the links', () => {
    const conf = buildTrackConfig({
      choice: 'RgfaTabixAdapter',
      loc: segs,
      indexLoc: {
        uri: 'https://example.com/hprc.segs.bed.gz.CSI',
        locationType: 'UriLocation',
      },
      assembly: 'hg38',
      sample: '',
      trackId: 'hprc',
      name: 'HPRC graph',
    })
    expect(conf.adapter).toMatchObject({
      segmentsIndex: { indexType: 'CSI' },
      linksIndex: { indexType: 'CSI' },
    })
  })

  // A file picked in the browser brings nothing from beside it, so a guessed
  // sibling would be the file itself
  it('asks for a URL where a picked file needs a file beside it', () => {
    const picked = (name: string) => ({
      name,
      blobId: name,
      locationType: 'BlobLocation' as const,
    })
    const args = {
      indexLoc: undefined,
      assembly: 'K12',
      sample: '',
      trackId: 'g',
      name: 'g',
    }
    expect(() =>
      buildTrackConfig({
        ...args,
        choice: 'RgfaTabixAdapter',
        loc: picked('g.segs.bed.gz'),
      }),
    ).toThrow('open it by URL')
    expect(() =>
      buildTrackConfig({
        ...args,
        choice: 'MinigraphBubbleAdapter',
        loc: picked('g.bubbles.bed.gz'),
      }),
    ).toThrow('open it by URL')
    expect(
      buildTrackConfig({
        ...args,
        choice: 'MinigraphBubbleAdapter',
        loc: picked('g.bubbles.bed.gz'),
        indexLoc: picked('g.bubbles.bed.gz.csi'),
      }).adapter,
    ).toMatchObject({
      index: { indexType: 'CSI', location: { name: 'g.bubbles.bed.gz.csi' } },
    })
  })

  it('refuses a segments file without the .segs.bed.gz suffix', () => {
    expect(() =>
      buildTrackConfig({
        choice: 'RgfaTabixAdapter',
        loc: {
          uri: 'https://example.com/g.bed.gz',
          locationType: 'UriLocation',
        },
        indexLoc: undefined,
        assembly: 'K12',
        sample: '',
        trackId: 'g',
        name: 'g',
      }),
    ).toThrow('.segs.bed.gz')
  })

  it('builds a bubble track with a CSI override and no display defaults', () => {
    const conf = buildTrackConfig({
      choice: 'MinigraphBubbleAdapter',
      loc: {
        uri: 'https://example.com/g.bubbles.bed.gz',
        locationType: 'UriLocation',
      },
      indexLoc: {
        uri: 'https://example.com/g.bubbles.bed.gz.csi',
        locationType: 'UriLocation',
      },
      assembly: 'hg38',
      sample: 'GRCh38',
      trackId: 'b',
      name: 'b',
    })
    expect(conf).toEqual({
      type: 'FeatureTrack',
      trackId: 'b',
      name: 'b',
      assemblyNames: ['hg38'],
      adapter: {
        type: 'MinigraphBubbleAdapter',
        bubblesLocation: {
          uri: 'https://example.com/g.bubbles.bed.gz',
          locationType: 'UriLocation',
        },
        index: {
          indexType: 'CSI',
          location: {
            uri: 'https://example.com/g.bubbles.bed.gz.csi',
            locationType: 'UriLocation',
          },
        },
        assemblyNameToPanSN: { hg38: 'GRCh38' },
      },
    })
  })

  it('builds a GBZ graph track anchored on the assembly, with its reads', () => {
    const uri = (name: string) => ({
      uri: `https://example.com/${name}`,
      locationType: 'UriLocation' as const,
    })
    const conf = buildTrackConfig({
      choice: 'GbzBaseSyntenyAdapter',
      loc: uri('hprc.gbz.db'),
      indexLoc: undefined,
      readsLoc: uri('reads.gaf.gz?sig=1'),
      assembly: 'hg38',
      sample: 'GRCh38',
      trackId: 'hprc',
      name: 'HPRC graph',
    })
    expect(conf.type).toBe('GraphTrack')
    expect(conf.adapter).toEqual({
      type: 'GbzBaseSyntenyAdapter',
      gbzDbLocation: uri('hprc.gbz.db'),
      assemblyNames: ['hg38'],
      readsLocation: uri('reads.gaf.gz?sig=1'),
      readsIndex: { location: uri('reads.gaf.gz.tbi?sig=1') },
      assemblyNameToPanSN: { hg38: 'GRCh38' },
    })
  })

  describe('with a .graph.json beside the segments', () => {
    const tier = { prefix: 'hprc.fold10000', foldBelowBp: 10000 }
    const args = {
      choice: 'RgfaTabixAdapter' as const,
      loc: { ...segs, uri: `${segs.uri}?sig=1` },
      indexLoc: undefined,
      assembly: 'hg38',
      sample: '',
      trackId: 'hprc',
      name: 'HPRC graph',
    }
    const at = (name: string) => ({
      uri: `https://example.com/${name}?sig=1`,
      locationType: 'UriLocation',
    })

    it('adds the coarse tier it names, beside the segments', () => {
      const conf = buildTrackConfig({ ...args, manifest: { tier } })
      expect(conf.adapter).toMatchObject({
        coarse: {
          foldBelowBp: 10000,
          segmentsLocation: at('hprc.fold10000.segs.bed.gz'),
          segmentsIndex: {
            indexType: 'TBI',
            location: at('hprc.fold10000.segs.bed.gz.tbi'),
          },
          linksLocation: at('hprc.fold10000.links.bed.gz'),
          linksIndex: { location: at('hprc.fold10000.links.bed.gz.tbi') },
        },
      })
      expect(conf.adapter).not.toHaveProperty('coarse.aboveBpPerPx')
    })

    it('maps the assembly onto its reference unless the user named one', () => {
      const reference = { reference: 'GRCh38' }
      expect(
        buildTrackConfig({ ...args, manifest: reference }).adapter,
      ).toMatchObject({ assemblyNameToPanSN: { hg38: 'GRCh38' } })
      expect(
        buildTrackConfig({ ...args, sample: 'CHM13', manifest: reference })
          .adapter,
      ).toMatchObject({ assemblyNameToPanSN: { hg38: 'CHM13' } })
      expect(
        buildTrackConfig({ ...args, assembly: 'GRCh38', manifest: reference })
          .adapter,
      ).not.toHaveProperty('assemblyNameToPanSN')
    })

    it('an empty manifest builds what no manifest does', () => {
      expect(buildTrackConfig({ ...args, manifest: {} })).toEqual(
        buildTrackConfig(args),
      )
      expect(buildTrackConfig(args).adapter).not.toHaveProperty('coarse')
    })

    it('a local path finds its tier in the same directory', () => {
      const conf = buildTrackConfig({
        ...args,
        loc: {
          localPath: 'C:\\data\\hprc.segs.bed.gz',
          locationType: 'LocalPathLocation',
        },
        manifest: { tier },
      })
      expect(conf.adapter).toMatchObject({
        coarse: {
          segmentsLocation: {
            localPath: 'C:\\data\\hprc.fold10000.segs.bed.gz',
          },
        },
      })
    })
  })
})
