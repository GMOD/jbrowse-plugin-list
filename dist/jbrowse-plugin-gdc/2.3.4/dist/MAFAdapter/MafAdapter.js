import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { openLocation } from '@jbrowse/core/util/io';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import MafFeature from './MafFeature';
import { readConfObject } from '@jbrowse/core/configuration';
import pako from 'pako';
class MafAdapter extends BaseFeatureDataAdapter {
    readMaf(fileContents) {
        const lines = fileContents.split('\n');
        const header = [];
        const refNames = [];
        const rows = [];
        let columns = [];
        let refNameColumnIndex = 0;
        lines.forEach(line => {
            if (line.startsWith('#')) {
                header.push(line);
            }
            else if (line) {
                if (columns.length === 0) {
                    columns = line.split('\t');
                    refNameColumnIndex = columns.findIndex(element => element.toLowerCase() === 'chromosome');
                }
                else {
                    rows.push(line);
                    const refName = line.split('\t')[refNameColumnIndex];
                    if (refName !== undefined) {
                        refNames.push(refName);
                    }
                }
            }
        });
        return {
            header: header.join('\n'),
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
        const mafLocation = readConfObject(this.config, 'mafLocation');
        const fileContents = await openLocation(mafLocation, this.pluginManager).readFile();
        const str = typeof fileContents[0] === 'number' &&
            fileContents[0] === 31 &&
            typeof fileContents[1] === 'number' &&
            fileContents[1] === 139 &&
            typeof fileContents[2] === 'number' &&
            fileContents[2] === 8
            ? new TextDecoder().decode(pako.inflate(fileContents))
            : fileContents.toString();
        return this.readMaf(str);
    }
    async getLines() {
        const { columns, lines } = await this.decodeFileContents();
        return lines.map((line, index) => {
            return new MafFeature({
                mutation: this.parseLine(line, columns),
                id: `${this.id}-maf-${index}`,
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
MafAdapter.capabilities = ['getFeatures', 'getRefNames'];
export default MafAdapter;
//# sourceMappingURL=MafAdapter.js.map