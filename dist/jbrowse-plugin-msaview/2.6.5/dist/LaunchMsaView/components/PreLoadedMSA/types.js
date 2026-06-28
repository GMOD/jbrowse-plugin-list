import { readConfObject } from '@jbrowse/core/configuration';
export function readMsaDatasets(jbrowse) {
    return readConfObject(jbrowse, ['msa', 'datasets']);
}
