import PluginManager from '@jbrowse/core/PluginManager';
export default function rendererFactory(pluginManager: PluginManager): {
    new (): {
        draw(ctx: CanvasRenderingContext2D, props: any): void;
    };
};
