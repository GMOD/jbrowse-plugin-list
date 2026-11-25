import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import { HEADING_INK, legendBoxStyle, legendHeadingStyle } from './legendStyles'

const INK = '#1c1c22'
const HOVER_PAPER = '#eef1f3'
const FOCUS_RING = '#1a56c4'

export const useKeyControlStyles = makeStyles()({
  row: {
    ...legendBoxStyle,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: INK,
  },
  inline: { padding: 0, background: 'none' },
  heading: legendHeadingStyle,
  joined: {
    display: 'flex',
    '& > button + button': { marginLeft: -1 },
    '& > button:first-of-type': { borderRadius: '3px 0 0 3px' },
    '& > button:last-of-type': { borderRadius: '0 3px 3px 0' },
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    font: 'inherit',
    color: 'inherit',
    background: legendBoxStyle.background,
    border: `1px solid ${HEADING_INK}`,
    borderRadius: 3,
    padding: '0 6px',
    cursor: 'pointer',
    '&:hover': { background: HOVER_PAPER },
    '&:disabled': { color: HEADING_INK, cursor: 'default' },
    '&:focus-visible': {
      outline: `2px solid ${FOCUS_RING}`,
      outlineOffset: 1,
      position: 'relative',
      zIndex: 1,
    },
  },
  on: {
    color: legendBoxStyle.background,
    background: HEADING_INK,
    '&:hover': { background: HEADING_INK },
  },
})

export const MenuButton = observer(function MenuButton(
  props: React.ComponentProps<'button'>,
) {
  return <button type="button" {...props} />
})
