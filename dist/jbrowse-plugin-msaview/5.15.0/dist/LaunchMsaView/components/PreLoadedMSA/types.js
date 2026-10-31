import { readConfObject } from '@jbrowse/core/configuration';
// `msa` is this plugin's rootConfigurationSchema, which the host mounts beside
// JBrowseConfigModel's declared members, so the core type does not name it
export function readMsaDatasets(jbrowse) {
    return jbrowse.msa
        ? readConfObject(jbrowse.msa, 'datasets')
        : undefined;
}
