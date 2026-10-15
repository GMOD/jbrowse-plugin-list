import { fireEvent, render, screen } from '@testing-library/react'

import LabelChip from './LabelChip'

test('a clickable chip is a named button that Enter and Space press, and focus hovers', () => {
  const onClick = vi.fn()
  const onHover = vi.fn()
  render(
    <svg>
      <LabelChip
        x={0}
        y={0}
        w={40}
        text="SV 2kb"
        color="#000"
        title={'Deletion\n4 segments · click to open'}
        onClick={onClick}
        onHover={onHover}
      />
    </svg>,
  )
  const chip = screen.getByRole('button', {
    name: 'Deletion, 4 segments · click to open',
  })
  fireEvent.keyDown(chip, { key: 'Enter' })
  fireEvent.keyDown(chip, { key: ' ' })
  fireEvent.keyDown(chip, { key: 'a' })
  expect(onClick).toHaveBeenCalledTimes(2)
  fireEvent.focus(chip)
  expect(onHover).toHaveBeenLastCalledWith(true)
  fireEvent.blur(chip)
  expect(onHover).toHaveBeenLastCalledWith(false)
})

test('a chip with nothing to do is not a button', () => {
  render(
    <svg>
      <LabelChip x={0} y={0} w={40} text="ABC1" color="#000" />
    </svg>,
  )
  expect(screen.queryByRole('button')).toBeNull()
})
