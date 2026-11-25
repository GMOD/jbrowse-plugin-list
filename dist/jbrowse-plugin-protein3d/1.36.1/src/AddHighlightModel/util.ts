import { makeStyles } from 'tss-react/mui'

export interface HighlightRegion {
  refName: string
  start: number
  end: number
  assemblyName?: string
}

/** A persistent selection, or a hover that passes over it */
export type HighlightKind = 'selection' | 'hover'

// A hover is fainter and dashed, so one passing a clicked residue's codon
// reads apart from the selection it crosses
export const useStyles = makeStyles()({
  highlight: {
    height: '100%',
    position: 'absolute',
    zIndex: 99,
    textAlign: 'center',
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  selection: {
    background: 'rgba(255,255,0,0.2)',
    border: '1px solid rgba(50,50,0,0.2)',
  },
  hover: {
    background: 'rgba(255,255,0,0.1)',
    border: '1px dashed rgba(50,50,0,0.5)',
  },
  selectionThin: {
    border: '1px solid black',
  },
  hoverThin: {
    border: '1px dashed black',
  },
})
