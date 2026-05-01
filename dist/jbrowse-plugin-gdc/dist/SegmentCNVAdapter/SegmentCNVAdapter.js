import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { openLocation } from '@jbrowse/core/util/io';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import SimpleFeature from '@jbrowse/core/util/simpleFeature';
import { readConfObject } from '@jbrowse/core/configuration';
class SegmentCNVAdapter extends BaseFeatureDataAdapter {
    async readSeg() {
        const segLocation = readConfObject(this.config, 'segLocation');
        const fileContents = await openLocation(segLocation, this.pluginManager).readFile('utf8');
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
                if (refName !== undefined) {
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
        const segment = {};
        line.split('\t').forEach((property, i) => {
            if (property) {
                if (i === 0) {
                    segment.id = property;
                }
                else {
                    const col = columns[i];
                    if (col !== undefined) {
                        // some SEG files have different data, this logic is to ensure that
                        // we don't need special colouring functions to accomodate for those
                        // differences...mean and copy number indicate the track colouring
                        const colLower = col.toLowerCase();
                        if (colLower === 'segment_mean' || colLower === 'copy_number') {
                            segment.score = +property;
                        }
                        segment[colLower] = property;
                    }
                }
            }
        });
        return segment;
    }
    async getLines() {
        const { columns, lines } = await this.readSeg();
        return lines.map(line => {
            const segment = this.parseLine(line, columns);
            return new SimpleFeature({
                ...segment,
                uniqueId: segment.id,
                id: segment.id,
                start: +segment.start,
                end: +segment.end,
                refName: segment.chromosome,
                score: +segment.score,
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
        const { refNames } = await this.readSeg();
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
SegmentCNVAdapter.capabilities = ['getFeatures', 'getRefNames'];
export default SegmentCNVAdapter;
//# sourceMappingURL=SegmentCNVAdapter.js.map