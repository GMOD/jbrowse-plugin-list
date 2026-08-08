import React, { useState } from 'react'

import {
  BaseCard,
  FeatureDetails,
} from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import {
  Button,
  Chip,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
} from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import { navToAnnotation, openReactomeView } from '../util'


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
  treeList: {
    listStyle: 'none',
    margin: 0,
    paddingLeft: 0,
  },
  treeChildren: {
    listStyle: 'none',
    margin: 0,
    // lines up a child's toggle under its parent's label
    paddingLeft: 28,
  },
  treeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  // keeps a childless node's label in the same column as a parent's
  treeToggleSpacer: {
    display: 'inline-block',
    width: 28,
  },
}))

/**
 * Render a single table row for an external link
 */
const ExternalLink = observer((props: any) => {
  const { classes } = useStyles()
  const { id, name, link } = props
  return (
    <>
      <TableRow key={`${id}-${name}`}>
        <TableCell>{name}</TableCell>
        <TableCell>
          <Link
            className={classes.link}
            target="_blank"
            rel="noopener"
            href={`${link}`}
            underline="always"
          >
            {id}
          </Link>
        </TableCell>
      </TableRow>
    </>
  )
})

function ExternalLinks(props: any) {
  const { classes } = useStyles()
  const { feature } = props

  const externalLinkArray = feature.externalLinks

  return (
    <BaseCard title="External Links">
      <div className={classes.tableContainer}>
        <Table className={classes.table}>
          <TableBody>
            {externalLinkArray.map(
              (externalLink: { name: string; link: string }, key: number) => (
                <ExternalLink
                  id={feature.geneSymbol ? feature.geneSymbol : feature.name}
                  {...externalLink}
                  key={key}
                />
              ),
            )}
          </TableBody>
        </Table>
      </div>
    </BaseCard>
  )
}

function Synonyms(props: any) {
  const { classes } = useStyles()
  const { feature } = props

  const synonyms = feature.synonyms.split(',')

  return (
    <BaseCard title="Synonyms">
      <div className={classes.tableContainer}>
        <Table className={classes.table}>
          <TableBody>
            <TableRow key={`${feature.geneId}-synonyms`}>
              <TableCell>
                {synonyms.map((synonym: string, key: string) => (
                  <Chip
                    label={synonym}
                    key={key}
                    style={{ marginRight: '2px', marginTop: '2px' }}
                  />
                ))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </BaseCard>
  )
}

function NavLink(props: any) {
  const { feature, model } = props

  return (
    <BaseCard title="Navigate to feature on linear genome view">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {
            void navToAnnotation(`${feature.genomeLocation}`, model)
          }}
        >
          Navigate
        </Button>
      </div>
    </BaseCard>
  )
}

function ReactomeItem(props: any) {
  const { node, model, pathways, geneName } = props
  const { classes } = useStyles()

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Link
        className={classes.link}
        target="_blank"
        rel="noopener"
        href={`https://reactome.org/PathwayBrowser/#/${node.stId}&FLG=${node.name}`}
        underline="always"
      >
        {node.name}
      </Link>
      {model.hasPlugin('ReactomePlugin') ? (
        <Tooltip title="Open pathway in Reactome Plugin">
          <IconButton
            color="primary"
            component="span"
            onClick={() => {
              void openReactomeView(
                node.stId,
                pathways,
                node.name,
                geneName,
                model,
              )
            }}
          >
            <MenuOpenIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </div>
  )
}

/**
 * A Reactome pathway hierarchy node, as the hierarchyForTerm endpoint returns
 * it. Only the three fields this tree draws are named.
 */
interface HierarchyNode {
  stId: string
  name: string
  children?: HierarchyNode[]
}

/**
 * One collapsible row. Written out here rather than pulled from a tree-view
 * library: all this needs is a disclosure toggle and a nested list, and
 * @mui/x-tree-view is not one of the modules JBrowse externalizes, so it was
 * costing ~55kB of the plugin's own bundle to draw two dozen links.
 *
 * Collapsed by default, which is what the previous SimpleTreeView did with no
 * defaultExpandedItems set.
 */
function HierarchyItem({
  node,
  model,
  pathways,
  geneName,
}: {
  node: HierarchyNode
  model: any
  pathways: any
  geneName: string
}) {
  const { classes } = useStyles()
  const [expanded, setExpanded] = useState(false)
  const children = node.children ?? []

  return (
    <li>
      <div className={classes.treeRow}>
        {children.length > 0 ? (
          <IconButton
            size="small"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => {
              setExpanded(!expanded)
            }}
          >
            {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        ) : (
          <span className={classes.treeToggleSpacer} />
        )}
        <ReactomeItem
          node={node}
          model={model}
          pathways={pathways}
          geneName={geneName}
        />
      </div>
      {expanded && children.length > 0 ? (
        <ul className={classes.treeChildren}>
          {children.map(child => (
            <HierarchyItem
              key={child.stId}
              node={child}
              model={model}
              pathways={pathways}
              geneName={geneName}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function Hierarchy({
  hierarchy,
  model,
  pathways,
  geneName,
}: {
  hierarchy: HierarchyNode[]
  model: any
  pathways: any
  geneName: string
}) {
  const { classes } = useStyles()

  return (
    <BaseCard title="Reactome Annotated Pathways">
      <ul className={classes.treeList}>
        {hierarchy.map(node => (
          <HierarchyItem
            key={node.stId}
            node={node}
            model={model}
            pathways={pathways}
            geneName={geneName}
          />
        ))}
      </ul>
    </BaseCard>
  )
}

const IdeoFeatureDetails = observer(function IdeoFeatureDetails(props: any) {
  const { model } = props
  const feat = model.featureData

  const fullFeature = {
    start: feat.start,
    end: feat.end,
    ...feat.details,
  }

  return (
    <Paper data-testid="ideo-widget">
      <FeatureDetails
        feature={fullFeature}
        {...props}
        omit={[
          'synonyms',
          'externalLinks',
          'pathways',
          'reactomeIds',
          'hierarchy',
        ]}
      />
      <NavLink feature={fullFeature} model={model}></NavLink>
      {fullFeature.externalLinks && <ExternalLinks feature={fullFeature} />}
      {fullFeature.synonyms && <Synonyms feature={fullFeature} />}
      {fullFeature.hierarchy?.length > 0 && (
        <Hierarchy
          hierarchy={fullFeature.hierarchy}
          model={model}
          pathways={fullFeature.pathways}
          geneName={fullFeature.name}
        />
      )}
    </Paper>
  )
})

export default IdeoFeatureDetails