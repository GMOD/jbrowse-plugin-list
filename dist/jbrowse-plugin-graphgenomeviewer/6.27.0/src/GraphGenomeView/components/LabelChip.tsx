import { LABEL_PAD, LABEL_PX } from '@jbrowse/bandage-core/overlayLabels'

// A chip's box, its text's baseline at y and centred on x
export function chipBox(x: number, y: number, w: number) {
  return {
    x: x - w / 2,
    y: y - LABEL_PX - LABEL_PAD + 2,
    width: w,
    height: LABEL_PX + LABEL_PAD * 2 - 2,
  }
}

export function inChip(
  chip: { x: number; y: number; w: number },
  px: number,
  py: number,
) {
  const box = chipBox(chip.x, chip.y, chip.w)
  return (
    px >= box.x &&
    px <= box.x + box.width &&
    py >= box.y &&
    py <= box.y + box.height
  )
}

// One label on an overlay: a white chip with a coloured edge and text. A note
// follows the text in plain type. A chip takes the pointer only with a
// handler, so its title shows only then.
export default function LabelChip({
  x,
  y,
  w,
  text,
  note,
  color,
  edge = color,
  italic,
  small,
  dimmed,
  title,
  testId,
  onClick,
  onHover,
}: {
  x: number
  y: number
  w: number
  text: string
  note?: string
  color: string
  edge?: string
  italic?: boolean
  small?: boolean
  dimmed?: boolean
  title?: string
  testId?: string
  onClick?: () => void
  onHover?: (hovered: boolean) => void
}) {
  return (
    <g
      style={{
        pointerEvents: onClick || onHover ? 'auto' : 'none',
        cursor: onClick ? 'pointer' : undefined,
        opacity: dimmed ? 0.35 : 1,
      }}
      data-testid={testId}
      onClick={onClick}
      onMouseEnter={() => {
        onHover?.(true)
      }}
      onMouseLeave={() => {
        onHover?.(false)
      }}
    >
      {title ? <title>{title}</title> : null}
      <rect
        {...chipBox(x, y, w)}
        rx={3}
        fill="rgba(255,255,255,0.85)"
        stroke={edge}
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
        {note ? (
          <tspan fontStyle="normal" fontWeight="normal">
            {note}
          </tspan>
        ) : null}
      </text>
    </g>
  )
}
