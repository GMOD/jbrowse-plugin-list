import loadMolstar from './loadMolstar';
export async function withTemporaryMolstarPlugin(callback) {
    const { createPluginUI, renderReact18 } = await loadMolstar();
    const ret = document.createElement('div');
    const plugin = await createPluginUI({
        target: ret,
        render: renderReact18,
    });
    try {
        return await callback(plugin);
    }
    finally {
        plugin.unmount();
        ret.remove();
    }
}
//# sourceMappingURL=withTemporaryMolstarPlugin.js.map