import { openLocation } from '@jbrowse/core/util/io';
import parseNewick from '../parseNewick';
import { normalize } from '../util';
export async function getSamplesFromConfig(getConf) {
    const nhLoc = getConf('nhLocation');
    const isDefaultPath = nhLoc &&
        typeof nhLoc === 'object' &&
        'uri' in nhLoc &&
        nhLoc.uri === '/path/to/my.nh';
    const nh = isDefaultPath
        ? undefined
        : await openLocation(nhLoc).readFile('utf8');
    return {
        samples: normalize(getConf('samples')),
        tree: nh ? parseNewick(nh) : undefined,
    };
}
//# sourceMappingURL=getSamples.js.map