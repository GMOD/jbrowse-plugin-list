import { readConfObject } from '@jbrowse/core/configuration';
import { BaseAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
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
    getMsaRegex() {
        return new RegExp(this.getConf('msaRegex'));
    }
    refNameToMsaId(refName) {
        return refName.split(this.getMsaRegex())[0];
    }
    async getMSAList() {
        const refNames = await this.getMSARefs();
        const list = new Set(refNames.map(name => this.refNameToMsaId(name)));
        return [...list];
    }
    async getMSA(id) {
        const adapter = await this.configure();
        const refNames = await adapter.getRefNames();
        const rows = refNames.filter(refName => this.refNameToMsaId(refName) === id);
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