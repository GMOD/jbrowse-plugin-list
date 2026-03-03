import MafGetSamples from './MafGetSamples';
export default function MafGetSamplesF(pluginManager) {
    pluginManager.addRpcMethod(() => {
        return new MafGetSamples(pluginManager);
    });
}
//# sourceMappingURL=index.js.map