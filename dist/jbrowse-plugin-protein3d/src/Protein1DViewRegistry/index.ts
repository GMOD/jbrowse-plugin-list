import { SimpleFeature, SimpleFeatureSerialized } from '@jbrowse/core/util'
import { getCodonRange } from 'g2p_mapper'
import { action, computed, makeObservable, observable } from 'mobx'

import { genomeToTranscriptSeqMapping } from '../mappings'

export interface Protein1DViewInfo {
  viewId: string
  connectedViewId: string
  feature: SimpleFeatureSerialized
  uniprotId: string
}

interface GenomeToTranscriptMapping {
  p2g: Record<number, number>
  g2p: Record<number, number>
  strand: number
  refName: string
}

interface SessionWithViews {
  views: { id: string }[]
}

class Protein1DViewRegistry {
  views = observable.map<string, Protein1DViewInfo>()

  constructor() {
    makeObservable(this, {
      register: action,
      unregister: action,
      cleanupStaleViews: action,
      entries: computed,
    })
  }

  register(info: Protein1DViewInfo) {
    this.views.set(info.viewId, info)
  }

  unregister(viewId: string) {
    this.views.delete(viewId)
  }

  cleanupStaleViews(session: SessionWithViews) {
    const activeViewIds = new Set(session.views.map(v => v.id))
    for (const viewId of this.views.keys()) {
      if (!activeViewIds.has(viewId)) {
        this.views.delete(viewId)
      }
    }
  }

  get(viewId: string) {
    return this.views.get(viewId)
  }

  getByUniprotId(uniprotId: string, session?: SessionWithViews) {
    if (session) {
      this.cleanupStaleViews(session)
    }
    for (const info of this.views.values()) {
      if (info.uniprotId === uniprotId) {
        return info
      }
    }
    return undefined
  }

  get entries() {
    return [...this.views.values()]
  }

  getGenomeHighlightForProteinPosition(
    uniprotId: string,
    proteinPos: number,
    session?: SessionWithViews,
  ): { refName: string; start: number; end: number } | undefined {
    const info = this.getByUniprotId(uniprotId, session)
    if (!info) {
      return undefined
    }

    const feature = new SimpleFeature(info.feature)
    const mapping = genomeToTranscriptSeqMapping(feature) as
      | GenomeToTranscriptMapping
      | undefined
    if (!mapping) {
      return undefined
    }

    const { p2g, strand, refName } = mapping
    const result = getCodonRange(p2g, proteinPos, strand)
    if (!result) {
      return undefined
    }

    const [start, end] = result
    return { refName, start, end }
  }
}

export const protein1DViewRegistry = new Protein1DViewRegistry()
