const HIERARCHY_URL = 'https://idg.reactome.org/idgpairwise/relationships/hierarchyForTerm';
const DIAGRAM_JS = 'https://reactome.org/DiagramJs/diagram/diagram.nocache.js';
export async function getPathways(gene) {
    const response = await fetch(`${HIERARCHY_URL}/${encodeURIComponent(gene)}`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const { hierarchy = [] } = (await response.json());
    const pathways = [];
    const walk = ({ stId, name, children = [] }) => {
        pathways.push({ stId, name, leaf: children.length === 0 });
        children.forEach(walk);
    };
    hierarchy.forEach(walk);
    return pathways;
}
let diagramJs;
// DiagramJs is a GWT module: the script loads its real code asynchronously and
// calls `window.onReactomeDiagramReady` once `window.Reactome` is usable.
export function loadDiagramJs() {
    diagramJs !== null && diagramJs !== void 0 ? diagramJs : (diagramJs = new Promise((resolve, reject) => {
        const page = window;
        page.onReactomeDiagramReady = () => {
            resolve(page.Reactome);
        };
        const script = document.createElement('script');
        script.src = DIAGRAM_JS;
        script.onerror = () => {
            diagramJs = undefined;
            reject(new Error(`could not load ${DIAGRAM_JS}`));
        };
        document.head.append(script);
    }));
    return diagramJs;
}
//# sourceMappingURL=reactomeApi.js.map