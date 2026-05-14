import { makeStyles } from 'tss-react/mui';
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
export function getProteinView(session) {
    const view = session.views.find(v => v.type === 'ProteinView');
    return view;
}
//# sourceMappingURL=util.js.map