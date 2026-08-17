import { getSession } from '@jbrowse/core/util';
import { makeStyles } from 'tss-react/mui';
// Local mirror of core's getLayoutHighlightCoords / model.getHighlightCoords,
// added to jbrowse after 4.3.0. Kept here so the plugin still builds against
// 4.3.0; once the minimum jbrowse version ships the model method, replace the
// body with `model.getHighlightCoords(region)`.
export function getHighlightCoords(model, region) {
    const { assemblyManager } = getSession(model);
    const assembly = region.assemblyName
        ? assemblyManager.get(region.assemblyName)
        : undefined;
    const refName = assembly?.getCanonicalRefName(region.refName) ?? region.refName;
    const s = model.bpToPx({ refName, coord: region.start });
    const e = model.bpToPx({ refName, coord: region.end });
    return s && e
        ? {
            width: Math.max(Math.abs(e.offsetPx - s.offsetPx), 3),
            left: Math.min(s.offsetPx, e.offsetPx) - model.offsetPx,
        }
        : undefined;
}
export const useStyles = makeStyles()({
    highlight: {
        height: '100%',
        background: 'rgba(255,255,0,0.2)',
        border: '1px solid rgba(50,50,0,0.2)',
        position: 'absolute',
        zIndex: 99,
        textAlign: 'center',
        pointerEvents: 'none',
        overflow: 'hidden',
    },
    thinborder: {
        border: '1px solid black',
    },
});
