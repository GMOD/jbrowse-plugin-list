import { SimpleFeature } from '@jbrowse/core/util'
import { action, computed, makeObservable, observable } from 'mobx'

import { codonGenomeSpan, genomeToTranscriptSeqMapping } from '../mappings'

import type { SimpleFeatureSerialized } from '@jbrowse/core/util'

export interface Protein1DViewInfo {
  viewId: string
  connectedViewId: string
  feature: SimpleFeatureSerialized
  uniprotId: string
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
      entries: computed,
    })
  }

  register(info: Protein1DViewInfo) {
    this.views.set(info.viewId, info)
  }

  unregister(viewId: string) {
    this.views.delete(viewId)
  }

  get(viewId: string) {
    return this.views.get(viewId)
  }

  /**
   * Pure lookup. When a session is supplied, entries whose view has since been
   * closed are skipped rather than deleted, so this stays side-effect-free and
   * safe to call from an observer's render (mutating the observable map there
   * would be a MobX anti-pattern).
   */
  getByUniprotId(uniprotId: string, session?: SessionWithViews) {
    const liveViewIds = session
      ? new Set(session.views.map(v => v.id))
      : undefined
    for (const info of this.views.values()) {
      if (
        info.uniprotId === uniprotId &&
        (!liveViewIds || liveViewIds.has(info.viewId))
      ) {
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
    if (info) {
      const { p2gCodon, refName } = genomeToTranscriptSeqMapping(
        new SimpleFeature(info.feature),
      )
      const span = codonGenomeSpan(p2gCodon, proteinPos)
      return span ? { refName, start: span[0], end: span[1] } : undefined
    }
    return undefined
  }
}

export const protein1DViewRegistry = new Protein1DViewRegistry()
