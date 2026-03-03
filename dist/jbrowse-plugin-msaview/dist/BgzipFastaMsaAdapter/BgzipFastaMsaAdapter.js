import { readConfObject } from '@jbrowse/core/configuration';
import { BaseAdapter, } from '@jbrowse/core/data_adapters/BaseAdapter';
import { firstValueFrom, toArray } from 'rxjs';
export default class BgzipFastaMsaAdapter extends BaseAdapter {
    async configurePre() {
        const getSubAdapter = this.getSubAdapter;
        if (getSubAdapter) {
            const adapter = await getSubAdapter({
                ...readConfObject(this.config),
                type: 'BgzipFastaAdapter',
            });
            return adapter.dataAdapter;
        }
        else {
            throw new Error('no get subadapter');
        }
    }
    configure() {
        this.configureP ??= this.configurePre().catch((e) => {
            this.configureP = undefined;
            throw e;
        });
        return this.configureP;
    }
    async getMSARefs() {
        this.refNamesP ??= this.configure()
            .then(adapter => adapter.getRefNames())
            .catch((e) => {
            this.refNamesP = undefined;
            throw e;
        });
        return this.refNamesP;
    }
    async getMSAList() {
        const refNames = await this.getMSARefs();
        const list = new Set();
        const val = this.getConf('msaRegex');
        const re = new RegExp(val);
        for (let i = 0, l = refNames.length; i < l; i++) {
            list.add(refNames[i].split(re)[0]);
        }
        return [...list];
    }
    async getMSA(id) {
        const adapter = await this.configure();
        const refNames = await adapter.getRefNames();
        const rows = [];
        for (let i = 0, l = refNames.length; i < l; i++) {
            const refName = refNames[i];
            if (refName.startsWith(id)) {
                rows.push(refName);
            }
        }
        return firstValueFrom(adapter
            .getFeaturesInMultipleRegions(rows.map(refName => ({
            refName,
            start: 0,
            end: 1_000_000_000,
            assemblyName: '',
        })))
            .pipe(toArray()));
    }
}
//# sourceMappingURL=BgzipFastaMsaAdapter.js.map