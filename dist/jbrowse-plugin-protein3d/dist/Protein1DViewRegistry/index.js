import { SimpleFeature } from '@jbrowse/core/util';
import { getCodonRange } from 'g2p_mapper';
import { action, computed, makeObservable, observable } from 'mobx';
import { genomeToTranscriptSeqMapping } from '../mappings';
class Protein1DViewRegistry {
    views = observable.map();
    constructor() {
        makeObservable(this, {
            register: action,
            unregister: action,
            cleanupStaleViews: action,
            entries: computed,
        });
    }
    register(info) {
        this.views.set(info.viewId, info);
    }
    unregister(viewId) {
        this.views.delete(viewId);
    }
    cleanupStaleViews(session) {
        const activeViewIds = new Set(session.views.map(v => v.id));
        for (const viewId of this.views.keys()) {
            if (!activeViewIds.has(viewId)) {
                this.views.delete(viewId);
            }
        }
    }
    get(viewId) {
        return this.views.get(viewId);
    }
    getByUniprotId(uniprotId, session) {
        if (session) {
            this.cleanupStaleViews(session);
        }
        for (const info of this.views.values()) {
            if (info.uniprotId === uniprotId) {
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
        if (!info) {
            return undefined;
        }
        const feature = new SimpleFeature(info.feature);
        const mapping = genomeToTranscriptSeqMapping(feature);
        if (!mapping) {
            return undefined;
        }
        const { p2g, strand, refName } = mapping;
        const result = getCodonRange(p2g, proteinPos, strand);
        if (!result) {
            return undefined;
        }
        const [start, end] = result;
        return { refName, start, end };
    }
}
export const protein1DViewRegistry = new Protein1DViewRegistry();
//# sourceMappingURL=index.js.map