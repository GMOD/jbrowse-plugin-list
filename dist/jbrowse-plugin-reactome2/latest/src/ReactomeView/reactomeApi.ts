const HIERARCHY_URL =
  'https://idg.reactome.org/idgpairwise/relationships/hierarchyForTerm'
const DIAGRAM_JS = 'https://reactome.org/DiagramJs/diagram/diagram.nocache.js'

export interface Pathway {
  stId: string
  name: string
  leaf: boolean
}

interface PathwayNode {
  stId: string
  name: string
  children?: PathwayNode[]
}

export interface ReactomeDiagram {
  loadDiagram(stId: string): void
}

interface ReactomeGlobal {
  Diagram: {
    create(options: {
      placeHolder: string
      width: number
      height: number
      toHide: string[]
    }): ReactomeDiagram
  }
}

export async function getPathways(gene: string) {
  const response = await fetch(`${HIERARCHY_URL}/${encodeURIComponent(gene)}`)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  const { hierarchy = [] } = (await response.json()) as {
    hierarchy?: PathwayNode[]
  }
  const pathways: Pathway[] = []
  const walk = ({ stId, name, children = [] }: PathwayNode) => {
    pathways.push({ stId, name, leaf: children.length === 0 })
    children.forEach(walk)
  }
  hierarchy.forEach(walk)
  return pathways
}

let diagramJs: Promise<ReactomeGlobal> | undefined

// DiagramJs is a GWT module: the script loads its real code asynchronously and
// calls `window.onReactomeDiagramReady` once `window.Reactome` is usable.
export function loadDiagramJs() {
  diagramJs ??= new Promise<ReactomeGlobal>((resolve, reject) => {
    const page = window as {
      Reactome?: ReactomeGlobal
      onReactomeDiagramReady?: () => void
    }
    page.onReactomeDiagramReady = () => {
      resolve(page.Reactome!)
    }
    const script = document.createElement('script')
    script.src = DIAGRAM_JS
    script.onerror = () => {
      diagramJs = undefined
      reject(new Error(`could not load ${DIAGRAM_JS}`))
    }
    document.head.append(script)
  })
  return diagramJs
}
