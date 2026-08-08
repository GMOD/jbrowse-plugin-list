import React, { useState } from 'react'

import { BaseCard } from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail'
import { getSession } from '@jbrowse/core/util'
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

/**
 * The paired ideogram view, named by the two members this file needs from it.
 * A structural type rather than IdeogramViewModel because session.views is
 * typed as the abstract view interface, which does not overlap with a concrete
 * view model, so the honest alternative is the wider `as any` this replaces.
 */
interface HighlightTarget {
  ideoAnnotations?: { name: string; details: { reactomeIds?: string[] } }[]
  setHighlightedAnnots: (names: string[]) => void
}

const useStyles = makeStyles()(() => ({
  table: {
    padding: 0,
  },
  link: {
    color: 'rgb(0, 0, 238)',
  },
  tableContainer: {
    width: '100%',
    maxHeight: 600,
    overflow: 'auto',
  },
}))

const Pathways = observer(function Pathways(props: any) {
  const { classes } = useStyles()
  const { model } = props
  // Separate from the const above because it is re-bound to a sorted copy below
  let { pathways } = props
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [selected, setSelected] = useState({ name: '' })

  const handleClick = (_event: any, pathway: any) => {
    setSelected(pathway)
    const toHighlight: any = []

    const session = getSession(model)
    session.views.forEach((sessionModel: any) => {
      if (sessionModel === model) {
        const targetModel = session.views.find(
          (view: any) =>
            view?.ideogramId === sessionModel?.ideogramId &&
            view !== sessionModel,
        ) as HighlightTarget | undefined

        // The results view is paired with the ideogram view it was launched
        // from, and the user can close that one on its own. The two ts-ignores
        // this replaces hid exactly that: with no ideogram left to highlight,
        // targetModel is undefined and reading ideoAnnotations off it threw.
        if (targetModel) {
          for (const annot of targetModel.ideoAnnotations ?? []) {
            if (annot.details.reactomeIds?.includes(pathway.stId)) {
              toHighlight.push(annot.name)
            }
          }
          targetModel.setHighlightedAnnots(toHighlight)
        }
      }
    })
  }

  const handleChangePage = (_event: any, newPage: any) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  pathways = pathways
    .slice()
    .sort(
      (a: any, b: any) =>
        parseFloat(a.entities.pValue) - parseFloat(b.entities.pValue),
    )

  const headers = [
    'Pathway name',
    'Entities found',
    'Entities Total',
    'Entities ratio',
    'Entities pValue',
    'Entities FDR',
    'Reactions found',
    'Reactions total',
    'Reactions ratio',
  ]

  const isSelected = (pathway: any) => selected.name === pathway.name

  // pagination retrieved from https://v4.mui.com/components/tables/#sorting-amp-selecting
  return (
    <BaseCard title="Pathways">
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {headers.map((header: string, index: number) => (
                <TableCell key={`${index}-${header}`}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pathways
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((pathway: any, key: string) => {
                const isItemSelected = isSelected(pathway)
                return (
                  <TableRow
                    key={key}
                    onClick={(event: any) => { handleClick(event, pathway) }}
                    selected={isItemSelected}
                  >
                    <TableCell>
                      <Link
                        target="_blank"
                        rel="noopener"
                        underline="always"
                        href={`https://reactome.org/content/detail/${pathway.stId}`}
                      >
                        {pathway.name}
                      </Link>
                    </TableCell>
                    <TableCell align="right">
                      {pathway.entities.found}
                    </TableCell>
                    <TableCell align="right">
                      {pathway.entities.total}
                    </TableCell>
                    <TableCell align="right">
                      {pathway.entities.ratio.toExponential(2)}
                    </TableCell>
                    <TableCell align="right">
                      {pathway.entities.pValue.toExponential(2)}
                    </TableCell>
                    <TableCell align="right">
                      {pathway.entities.fdr.toExponential(2)}
                    </TableCell>
                    <TableCell align="right">
                      {pathway.reactions.found}
                    </TableCell>
                    <TableCell align="right">
                      {pathway.reactions.total}
                    </TableCell>
                    <TableCell align="right">
                      {pathway.reactions.ratio.toFixed(3)}
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={pathways.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </BaseCard>
  )
})

export default Pathways