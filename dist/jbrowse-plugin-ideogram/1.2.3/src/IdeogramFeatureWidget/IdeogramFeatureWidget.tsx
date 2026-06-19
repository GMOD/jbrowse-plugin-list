import React from 'react'
import { observer } from 'mobx-react'
import {
  FeatureDetails,
  BaseCard,
} from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Link,
  Chip,
  Button,
  IconButton,
  Tooltip,
  makeStyles,
} from '@material-ui/core'
import { navToAnnotation, openReactomeView } from '../util'
import { TreeView, TreeItem } from '@material-ui/lab'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import MenuOpenIcon from '@material-ui/icons/MenuOpen'

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

/**
 * Render a single table row for an external link
 */
const ExternalLink = observer((props: any) => {
  const classes = useStyles()
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
  const classes = useStyles()
  const { feature } = props

  const externalLinkArray = feature.externalLinks

  return (
    <BaseCard title="External Links">
      <div className={classes.tableContainer}>
        <Table className={classes.table}>
          <TableBody>
            {externalLinkArray.map((externalLink: string, key: string) => (
              <ExternalLink
                id={feature.geneSymbol ? feature.geneSymbol : feature.name}
                {...externalLink}
                key={key}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </BaseCard>
  )
}

function Synonyms(props: any) {
  const classes = useStyles()
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
            navToAnnotation(`${feature.genomeLocation}`, model)
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
  const classes = useStyles()

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
              openReactomeView(node.stId, pathways, node.name, geneName, model)
            }}
          >
            <MenuOpenIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </div>
  )
}

function Hierarchy(props: any) {
  const { hierarchy, model, pathways, geneName } = props

  const renderTree = (nodes: any) => (
    <TreeItem
      key={nodes.stId}
      nodeId={nodes.stId}
      label={
        <ReactomeItem
          node={nodes}
          model={model}
          pathways={pathways}
          geneName={geneName}
        />
      }
    >
      {Array.isArray(nodes.children)
        ? nodes.children.map((node: any) => renderTree(node))
        : null}
    </TreeItem>
  )

  return (
    <BaseCard title="Reactome Annotated Pathways">
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {hierarchy.map((node: any) => renderTree(node))}
      </TreeView>
    </BaseCard>
  )
}

function IdeoFeatureDetails(props: any) {
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
}

export default observer(IdeoFeatureDetails)
