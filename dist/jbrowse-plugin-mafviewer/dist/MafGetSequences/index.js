import MafGetSequences from './MafGetSequences';
export default function MafGetSequencesF(pluginManager) {
    pluginManager.addRpcMethod(() => {
        return new MafGetSequences(pluginManager);
    });
}
//# sourceMappingURL=index.js.map