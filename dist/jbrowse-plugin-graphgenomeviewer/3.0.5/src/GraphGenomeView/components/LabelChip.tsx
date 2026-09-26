import { LABEL_PAD, LABEL_PX } from './overlayLabels'

// One label on an overlay: a white chip with a coloured edge and text, its
// baseline at y and centred on x.
export default function LabelChip({
  x,
  y,
  w,
  text,
  color,
  italic,
  small,
  dimmed,
  title,
  testId,
  onClick,
}: {
  x: number
  y: number
  w: number
  text: string
  color: string
  italic?: boolean
  small?: boolean
  dimmed?: boolean
  title?: string
  testId?: string
  onClick?: () => void
}) {
  return (
    <g
      style={{
        pointerEvents: onClick ? 'auto' : 'none',
        cursor: onClick ? 'pointer' : undefined,
        opacity: dimmed ? 0.35 : 1,
      }}
      data-testid={testId}
      onClick={onClick}
    >
      {title ? <title>{title}</title> : null}
      <rect
        x={x - w / 2}
        y={y - LABEL_PX - LABEL_PAD + 2}
        width={w}
        height={LABEL_PX + LABEL_PAD * 2 - 2}
        rx={3}
        fill="rgba(255,255,255,0.85)"
        stroke={color}
        strokeWidth={small ? 0.6 : 1}
      />
      <text
        x={x}
        y={y}
        fontSize={small ? LABEL_PX - 1 : LABEL_PX}
        fontFamily="sans-serif"
        fontStyle={italic ? 'italic' : undefined}
        fontWeight={italic ? 600 : undefined}
        fill={color}
        textAnchor="middle"
      >
        {text}
      </text>
    </g>
  )
}
