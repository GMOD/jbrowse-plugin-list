import { encodingSwatchCss } from '@jbrowse/bandage-core/walkEncoding'
import { walkKey } from '@jbrowse/bandage-core/walkKey'

import { legendRowStyle } from './legendStyles'

import type { LiftedWalk } from '@jbrowse/bandage-core/walkHighlight'

export const walkSwatchStyle = {
  width: 18,
  height: 8,
  borderRadius: 2,
  flex: 'none',
}
const walkBlockStyle = { marginBottom: 2 }
const walkBarStyle = { ...walkSwatchStyle, width: 48 }

// One walk's key: a swatch, or a short bar of the scale its lane shades by,
// then its name; see walkKey for the words
export default function WalkKey({
  walk,
  label,
  reference,
  hint,
}: {
  walk: LiftedWalk
  label: string
  reference?: { name?: string; start: number; end: number }
  hint?: string
}) {
  const key = walkKey(walk, reference)
  return (
    <div
      style={walkBlockStyle}
      title={[key.hover, hint].filter(Boolean).join(' · ') || undefined}
    >
      <div style={legendRowStyle}>
        <div
          style={{
            ...(key.shades ? walkBarStyle : walkSwatchStyle),
            background: encodingSwatchCss(walk.encoding),
          }}
        />
        <span>
          <strong>{label}</strong>
          {key.delta}
          {key.reversed}
        </span>
      </div>
      {key.scale ? <div>{key.scale}</div> : null}
    </div>
  )
}
