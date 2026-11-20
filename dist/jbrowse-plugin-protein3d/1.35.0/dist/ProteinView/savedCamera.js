import loadMolstar from './loadMolstar';
/**
 * The fog and far clipping the canvas's own settings give a camera, which a
 * clipping radius turns off and a reset does not restore: Mol* carries both
 * over from the camera's last state.
 */
function canvasDepthCue({ cameraFog, cameraClipping }) {
    return {
        fog: cameraFog.name === 'on' ? cameraFog.params.intensity : 0,
        clipFar: cameraClipping.far,
    };
}
export function applySavedCamera(canvas, { Vec3 }, { position, target, up, radius, mode = 'perspective' }) {
    canvas?.setProps({ camera: { mode, manualReset: true } });
    canvas?.requestCameraReset({
        snapshot: {
            mode,
            position: Vec3.create(...position),
            target: Vec3.create(...target),
            up: Vec3.create(...up),
            ...(radius === undefined
                ? canvasDepthCue(canvas.props)
                : { radius, radiusMax: radius, clipFar: true, fog: 0 }),
        },
    });
}
/**
 * Hands the camera back to Mol*: its own projection and automatic framing,
 * so a structure loaded later is framed, and the canvas's fog and clipping,
 * then a reset onto the whole scene.
 */
export function releaseSavedCamera(canvas, params) {
    const { mode, manualReset } = params.Canvas3DParams.camera.defaultValue;
    canvas?.setProps({ camera: { mode, manualReset } });
    canvas?.requestCameraReset({
        snapshot: { mode, ...canvasDepthCue(canvas.props) },
    });
}
/**
 * The body of the reaction that keeps a view's fixed camera on its canvas:
 * applied once every structure has loaded, and when the view's camera is
 * cleared while the canvas still holds one, handed back to Mol*. The canvas
 * says whether it holds one, so an undo or a snapshot clearing the camera
 * releases it as applyFigure does.
 */
export function keepSavedCamera(view, onFailure) {
    return () => {
        const { plugin, camera } = view;
        const canvas = plugin?.canvas3d;
        if (plugin && camera && view.settled) {
            loadMolstar()
                .then(molstar => {
                applySavedCamera(canvas, molstar, camera);
            })
                .catch(onFailure(plugin));
        }
        else if (plugin && !camera && canvas?.props.camera.manualReset) {
            loadMolstar()
                .then(molstar => {
                releaseSavedCamera(canvas, molstar);
            })
                .catch(onFailure(plugin));
        }
    };
}
function tripleOf(vector) {
    const [x, y, z] = Array.from(vector);
    if (x === undefined || y === undefined || z === undefined) {
        throw new Error(`a camera vector has ${vector.length} components, not 3`);
    }
    return [x, y, z];
}
/**
 * The camera on screen as a SavedCamera, so applying it puts the eye back.
 * Mol* always clips to `radius` around the target; it is left out when that is
 * the visible scene's own radius, which is what a camera without one gets, so
 * the fog a whole-scene view draws survives the round trip.
 */
export function liveCamera(canvas) {
    const { position, target, up, radius, mode } = canvas.camera.state;
    const sceneRadius = canvas.boundingSphereVisible.radius;
    return {
        position: tripleOf(position),
        target: tripleOf(target),
        up: tripleOf(up),
        mode,
        ...(Math.abs(radius - sceneRadius) <= 1e-6 * Math.max(sceneRadius, 1)
            ? {}
            : { radius }),
    };
}
