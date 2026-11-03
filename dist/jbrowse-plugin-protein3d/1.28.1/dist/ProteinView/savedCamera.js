export function applySavedCamera(plugin, molstar, { position, target, up, radius, mode = 'perspective' }) {
    const { Vec3 } = molstar;
    plugin.canvas3d?.setProps({ camera: { mode, manualReset: true } });
    plugin.canvas3d?.requestCameraReset({
        snapshot: {
            mode,
            position: Vec3.create(...position),
            target: Vec3.create(...target),
            up: Vec3.create(...up),
            ...(radius === undefined
                ? {}
                : { radius, radiusMax: radius, clipFar: true, fog: 0 }),
        },
    });
}
