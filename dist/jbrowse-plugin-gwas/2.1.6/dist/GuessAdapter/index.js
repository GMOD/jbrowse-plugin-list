import { testAdapter } from '@jbrowse/core/util';
import { getFileName, makeIndex, makeIndexType, } from '@jbrowse/core/util/tracks';
export default function GuessAdapterF(pluginManager) {
    pluginManager.addToExtensionPoint('Core-guessAdapterForLocation', (adapterGuesser) => {
        return (file, index, adapterHint) => {
            const fileName = getFileName(file);
            const indexName = index && getFileName(index);
            return testAdapter(fileName, /\.txt\.gz$/i, adapterHint, 'GWASAdapter')
                ? {
                    type: 'GWASAdapter',
                    bedGzLocation: file,
                    index: {
                        location: index || makeIndex(file, '.tbi'),
                        indexType: makeIndexType(indexName, 'CSI', 'TBI'),
                    },
                }
                : adapterGuesser(file, index, adapterHint);
        };
    });
    pluginManager.addToExtensionPoint('Core-guessTrackTypeForLocation', (trackTypeGuesser) => {
        return (adapterName) => {
            return adapterName === 'GWASAdapter'
                ? 'GWASTrack'
                : trackTypeGuesser(adapterName);
        };
    });
}
//# sourceMappingURL=index.js.map