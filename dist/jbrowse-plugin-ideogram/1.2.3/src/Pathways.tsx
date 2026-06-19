import React, { useState } from 'react'
import { observer } from 'mobx-react'
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Link,
  makeStyles,
} from '@material-ui/core'
import { getSession } from '@jbrowse/core/util'
import { BaseCard } from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail'

const useStyles = makeStyles(() => ({
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

function Pathways(props: any) {
  const classes = useStyles()
  let { model, pathways } = props
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [selected, setSelected] = useState({ name: '' })

  const handleClick = (event: any, pathway: any) => {
    setSelected(pathway)
    const toHighlight: any = []

    const session = getSession(model)
    session.views.forEach((sessionModel: any, i: number) => {
      if (sessionModel === model) {
        const targetModel = session.views.filter((view: any) => {
          return (
            view?.ideogramId === sessionModel?.ideogramId &&
            view !== sessionModel
          )
        })[0]
        // @ts-ignore
        targetModel.ideoAnnotations.forEach((annot: any) => {
          if (annot.details.reactomeIds?.includes(pathway.stId)) {
            toHighlight.push(annot.name)
          }
        })

        // @ts-ignore
        targetModel.setHighlightedAnnots(toHighlight)
      }
    })
  }

  const handleChangePage = (event: any, newPage: any) => {
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
                    onClick={(event: any) => handleClick(event, pathway)}
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
}

export default observer(Pathways)
