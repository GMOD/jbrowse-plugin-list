/**
 * The look a published structure figure has (ChimeraX's silhouettes and soft
 * lighting, Mol*'s illustrative style): outlines around every object, and
 * screen-space ambient occlusion so a fold reads as depth rather than a flat
 * ribbon.
 */
export function applyFigureStyle(plugin, Color, { silhouettes, occlusion }) {
    plugin.canvas3d?.setProps({
        postprocessing: {
            outline: silhouettes
                ? {
                    name: 'on',
                    params: {
                        scale: 1,
                        threshold: 0.33,
                        color: Color(0x000000),
                        includeTransparent: true,
                    },
                }
                : { name: 'off', params: {} },
            occlusion: occlusion
                ? {
                    name: 'on',
                    params: {
                        samples: 32,
                        multiScale: { name: 'off', params: {} },
                        radius: 5,
                        bias: 0.8,
                        blurKernelSize: 15,
                        blurDepthBias: 0.5,
                        resolutionScale: 1,
                        color: Color(0x000000),
                        transparentThreshold: 0.4,
                    },
                }
                : { name: 'off', params: {} },
        },
    });
}
