import { SimpleFeature } from '@jbrowse/core/util';
import { action, computed, makeObservable, observable } from 'mobx';
import { codonGenomeSpan, genomeToTranscriptSeqMapping } from '../mappings';
class Protein1DViewRegistry {
    views = observable.map();
    constructor() {
        makeObservable(this, {
            register: action,
            unregister: action,
            entries: computed,
        });
    }
    register(info) {
        this.views.set(info.viewId, info);
    }
    unregister(viewId) {
        this.views.delete(viewId);
    }
    get(viewId) {
        return this.views.get(viewId);
    }
    /**
     * Pure lookup. When a session is supplied, entries whose view has since been
     * closed are skipped rather than deleted, so this stays side-effect-free and
     * safe to call from an observer's render (mutating the observable map there
     * would be a MobX anti-pattern).
     */
    getByUniprotId(uniprotId, session) {
        const liveViewIds = session
            ? new Set(session.views.map(v => v.id))
            : undefined;
        for (const info of this.views.values()) {
            if (info.uniprotId === uniprotId &&
                (!liveViewIds || liveViewIds.has(info.viewId))) {
                return info;
            }
        }
        return undefined;
    }
    get entries() {
        return [...this.views.values()];
    }
    getGenomeHighlightForProteinPosition(uniprotId, proteinPos, session) {
        const info = this.getByUniprotId(uniprotId, session);
        if (info) {
            const { p2gCodon, refName } = genomeToTranscriptSeqMapping(new SimpleFeature(info.feature));
            const span = codonGenomeSpan(p2gCodon, proteinPos);
            return span ? { refName, start: span[0], end: span[1] } : undefined;
        }
        return undefined;
    }
}
export const protein1DViewRegistry = new Protein1DViewRegistry();
