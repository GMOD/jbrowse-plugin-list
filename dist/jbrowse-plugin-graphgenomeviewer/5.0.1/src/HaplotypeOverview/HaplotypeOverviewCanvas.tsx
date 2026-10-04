import { useEffect, useMemo, useRef, useState } from 'react'

import BaseTooltip from '@jbrowse/core/ui/BaseTooltip'
import { observer } from 'mobx-react'

import {
  NOT_SHOWN,
  binAt,
  cellLabel,
  describeBin,
  drawOverview,
  overviewLayout,
  rowAt,
  rowImages,
} from './draw'
import { hostFrame } from '../GraphGenomeView/host'

import type { OverviewLayout } from './draw'
import type { HaplotypeOverviewData } from '../GetHaplotypeOverview'
import type { SubgraphRegion } from '../GetSubgraph'
import type { LinearHost } from '../GraphGenomeView/host'

export interface OverviewCanvasModel {
  overview: HaplotypeOverviewData | undefined
  overviewRegion: SubgraphRegion | undefined
  overviewCounts: number[][] | undefined
  overviewAllRows: boolean
  height: number
  host: LinearHost | undefined
  setOverviewPainted: (data: HaplotypeOverviewData) => void
}

interface Pointer {
  bin: number
  row: number | undefined
  clientX: number
  clientY: number
}

const OverviewTooltip = observer(function OverviewTooltip({
  data,
  region,
  pointer,
}: {
  data: HaplotypeOverviewData
  region: SubgraphRegion
  pointer: Pointer
}) {
  const bin = describeBin(data, pointer.bin)
  const cell =
    pointer.row === undefined
      ? undefined
      : data.cells[pointer.bin * data.rows.length + pointer.row]
  return (
    <BaseTooltip clientPoint={{ x: pointer.clientX, y: pointer.clientY }}>
      <div>
        {region.refName}:{bin.span}
      </div>
      {pointer.row !== undefined && cell !== undefined ? (
        <div>
          <strong>{data.rows[pointer.row]}</strong>: {cellLabel(cell)}
        </div>
      ) : (
        <>
          <div>{bin.classes}</div>
          <div>{bin.excursions}</div>
        </>
      )}
      <div style={{ opacity: 0.7 }}>{NOT_SHOWN}</div>
    </BaseTooltip>
  )
})

// The haplotype index's overview on the linear view's axis: a density row of
// the haplotypes that differ from the reference, then a row per haplotype.
// A click zooms to the bin under the pointer.
const HaplotypeOverviewCanvas = observer(function HaplotypeOverviewCanvas({
  model,
}: {
  model: OverviewCanvasModel
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [pointer, setPointer] = useState<Pointer>()
  const {
    overview,
    overviewRegion,
    overviewCounts,
    overviewAllRows,
    height,
    host,
  } = model
  const width = host?.width ?? 0
  const frame =
    host && overviewRegion ? hostFrame(host, overviewRegion) : undefined
  const scale = frame?.scale
  const translateX = frame?.translateX
  const layout = useMemo<OverviewLayout | undefined>(
    () =>
      overview ? overviewLayout(overview, overviewAllRows, height) : undefined,
    [overview, overviewAllRows, height],
  )

  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  const images = useMemo(
    () => (overview && layout ? rowImages(overview, layout, dpr) : []),
    [overview, layout, dpr],
  )

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (
      !canvas ||
      !ctx ||
      !overview ||
      !layout ||
      scale === undefined ||
      translateX === undefined
    ) {
      return
    }
    const deviceWidth = Math.round(width * dpr)
    const deviceHeight = Math.round(height * dpr)
    if (canvas.width !== deviceWidth || canvas.height !== deviceHeight) {
      canvas.width = deviceWidth
      canvas.height = deviceHeight
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawOverview(ctx, overview, overviewCounts, layout, images, {
      xOf: bp => bp * scale + translateX,
      width,
      height,
      dpr,
    })
    model.setOverviewPainted(overview)
  }, [
    model,
    overview,
    overviewCounts,
    layout,
    images,
    scale,
    translateX,
    width,
    height,
    dpr,
  ])

  const locate = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!overview || !layout || !scale || translateX === undefined) {
      return undefined
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const bin = binAt(overview, (x - translateX) / scale)
    return bin === undefined
      ? undefined
      : {
          bin,
          row: rowAt(layout, y),
          clientX: event.clientX,
          clientY: event.clientY,
        }
  }

  return (
    <>
      <canvas
        ref={ref}
        data-testid="haplotype-overview"
        style={{ width, height, display: 'block', cursor: 'pointer' }}
        onMouseMove={event => {
          setPointer(locate(event))
        }}
        onMouseLeave={() => {
          setPointer(undefined)
        }}
        onClick={event => {
          const at = locate(event)
          const bin = at && overview?.bins[at.bin]
          if (bin && overviewRegion && host?.navTo) {
            host.navTo({
              refName: overviewRegion.refName,
              assemblyName: overviewRegion.assemblyName,
              start: bin.start,
              end: bin.end,
            })
          }
        }}
      />
      {pointer && overview && overviewRegion ? (
        <OverviewTooltip
          data={overview}
          region={overviewRegion}
          pointer={pointer}
        />
      ) : null}
    </>
  )
})

export default HaplotypeOverviewCanvas
