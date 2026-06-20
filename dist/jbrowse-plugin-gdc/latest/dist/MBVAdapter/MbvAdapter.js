import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { openLocation } from '@jbrowse/core/util/io';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import MbvFeature from './MbvFeature';
import { readConfObject } from '@jbrowse/core/configuration';
import pako from 'pako';
class MbvAdapter extends BaseFeatureDataAdapter {
    readMbv(fileContents) {
        const lines = fileContents.split('\n');
        const refNames = [];
        const rows = [];
        let columns = [];
        let refNameColumnIndex = 0;
        lines.forEach(line => {
            if (columns.length === 0) {
                columns = line.split('\t');
                refNameColumnIndex = columns.findIndex(element => element.toLowerCase() === 'chromosome');
            }
            else {
                const refName = line.split('\t')[refNameColumnIndex];
                if (refName !== '*' && refName !== undefined) {
                    rows.push(line);
                    refNames.push(refName);
                }
            }
        });
        return {
            lines: rows,
            columns,
            refNames: Array.from(new Set(refNames)),
        };
    }
    parseLine(line, columns) {
        const mutationObject = {};
        line.split('\t').forEach((property, i) => {
            if (property) {
                const col = columns[i];
                if (col !== undefined) {
                    mutationObject[col.toLowerCase()] = property;
                }
            }
        });
        return mutationObject;
    }
    async decodeFileContents() {
        const mbvLocation = readConfObject(this.config, 'mbvLocation');
        const fileContents = await openLocation(mbvLocation, this.pluginManager).readFile();
        const str = typeof fileContents[0] === 'number' &&
            fileContents[0] === 31 &&
            typeof fileContents[1] === 'number' &&
            fileContents[1] === 139 &&
            typeof fileContents[2] === 'number' &&
            fileContents[2] === 8
            ? new TextDecoder().decode(pako.inflate(fileContents))
            : fileContents.toString();
        return this.readMbv(str);
    }
    async getLines() {
        const { columns, lines } = await this.decodeFileContents();
        return lines.map((line, index) => {
            return new MbvFeature({
                value: this.parseLine(line, columns),
                id: `${this.id}-mbv-${index}`,
            });
        });
    }
    async setup() {
        if (!this.setupP) {
            this.setupP = this.getLines();
        }
        return this.setupP;
    }
    async getRefNames(_ = {}) {
        const { refNames } = await this.decodeFileContents();
        return refNames;
    }
    getFeatures(region, opts = {}) {
        return ObservableCreate(async (observer) => {
            const feats = await this.setup();
            feats.forEach(f => {
                if (f.get('refName') === region.refName &&
                    f.get('end') > region.start &&
                    f.get('start') < region.end) {
                    observer.next(f);
                }
            });
            observer.complete();
        }, opts.stopToken);
    }
    freeResources() { }
}
MbvAdapter.capabilities = ['getFeatures', 'getRefNames'];
export default MbvAdapter;
//# sourceMappingURL=MbvAdapter.js.map