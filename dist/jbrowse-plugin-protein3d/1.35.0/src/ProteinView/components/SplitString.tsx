import React from 'react'

import { observer } from 'mobx-react'

import type { JBrowsePluginProteinStructureModel } from '../model'

const SplitString = observer(function SplitString({
  model,
  str,
}: {
  model: JBrowsePluginProteinStructureModel
  str: string
}) {
  const { columnWidth } = model
  return str.split('').map((char, i) => (
    <span
      key={i}
      style={{
        position: 'absolute',
        left: i * columnWidth,
        width: columnWidth,
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))
})

export default SplitString
