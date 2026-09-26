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
      type: 'FeatureTrack',
      trackId: 'hprc',
      name: 'HPRC graph',
      assemblyNames: ['hg38'],
      displays: [
        { type: 'LinearGraphDisplay', displayId: 'hprc-LinearGraphDisplay' },
        { type: 'LinearBasicDisplay', displayId: 'hprc-LinearBasicDisplay' },
      ],
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
})
