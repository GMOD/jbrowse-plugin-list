import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { openLocation } from '@jbrowse/core/util/io';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import SjqFeature from './SjqFeature';
import { readConfObject } from '@jbrowse/core/configuration';
import pako from 'pako';
/**
 * Splice Junction Quantification Adapter
 */
class SjqAdapter extends BaseFeatureDataAdapter {
    readSjq(fileContents) {
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
    async decodeFileContents() {
        const sjqLocation = readConfObject(this.config, 'sjqLocation');
        const fileContents = await openLocation(sjqLocation, this.pluginManager).readFile();
        const str = typeof fileContents[0] === 'number' &&
            fileContents[0] === 31 &&
            typeof fileContents[1] === 'number' &&
            fileContents[1] === 139 &&
            typeof fileContents[2] === 'number' &&
            fileContents[2] === 8
            ? new TextDecoder().decode(pako.inflate(fileContents))
            : fileContents.toString();
        return this.readSjq(str);
    }
    parseLine(line, columns) {
        const sjq = {};
        line.split('\t').forEach((property, i) => {
            const col = columns[i];
            if (col !== undefined) {
                // Source: https://stackoverflow.com/questions/4374822/remove-all-special-characters-with-regexp
                const normalizedCol = col.toLowerCase().replace(/[^\w\s]/gi, '');
                columns[i] = normalizedCol;
                if (property) {
                    sjq[normalizedCol] = property;
                }
            }
        });
        return sjq;
    }
    async getLines() {
        const { columns, lines } = await this.decodeFileContents();
        return lines.map((line, index) => {
            return new SjqFeature({
                sjq: this.parseLine(line, columns),
                id: `${this.id}-sjq-${index}`,
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
SjqAdapter.capabilities = ['getFeatures', 'getRefNames'];
export default SjqAdapter;
//# sourceMappingURL=SjqAdapter.js.map