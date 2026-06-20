import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { openLocation } from '@jbrowse/core/util/io';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import { readConfObject } from '@jbrowse/core/configuration';
// locals
import IeqFeature from './IeqFeature';
/**
 * Isoform Expression Quantification Adapter
 */
class IeqAdapter extends BaseFeatureDataAdapter {
    async readIeq() {
        const ieqLocation = readConfObject(this.config, 'ieqLocation');
        const fileContents = await openLocation(ieqLocation, this.pluginManager).readFile('utf8');
        const lines = fileContents.split('\n');
        const rows = [];
        let columns = [];
        lines.forEach(line => {
            if (line) {
                if (columns.length === 0) {
                    columns = line.split('\t');
                }
                else {
                    rows.push(line);
                }
            }
        });
        return {
            lines: rows,
            columns,
        };
    }
    parseCoords(property) {
        var _a;
        const splitProperty = property.split(':');
        const range = (_a = splitProperty[2]) === null || _a === void 0 ? void 0 : _a.split('-');
        return {
            chromosome: splitProperty[1],
            start: range === null || range === void 0 ? void 0 : range[0],
            end: range === null || range === void 0 ? void 0 : range[1],
            strand: splitProperty[3] === '+' ? 1 : 0,
        };
    }
    parseLine(line, columns) {
        let iso = {};
        line.split('\t').forEach((property, i) => {
            if (property) {
                const col = columns[i];
                if (col !== undefined) {
                    if (col === 'isoform_coords') {
                        const parsedProperties = this.parseCoords(property);
                        iso = {
                            ...iso,
                            ...parsedProperties,
                        };
                    }
                    else {
                        iso[col.toLowerCase()] = property;
                    }
                }
            }
        });
        return iso;
    }
    async getLines() {
        const { columns, lines } = await this.readIeq();
        return lines.map((line, index) => {
            return new IeqFeature({
                iso: this.parseLine(line, columns),
                id: `${this.id}-ieq-${index}`,
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
        return [
            'chr1',
            'chr2',
            'chr3',
            'chr4',
            'chr5',
            'chr6',
            'chr7',
            'chr8',
            'chr9',
            'chr10',
            'chr11',
            'chr12',
            'chr13',
            'chr14',
            'chr15',
            'chr16',
            'chr17',
            'chr18',
            'chr19',
            'chr20',
            'chr21',
            'chr22',
            'chrX',
            'chrY',
        ];
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
IeqAdapter.capabilities = ['getFeatures', 'getRefNames'];
export default IeqAdapter;
//# sourceMappingURL=IeqAdapter.js.map