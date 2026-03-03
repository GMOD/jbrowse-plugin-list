import React from 'react'
import { observer } from 'mobx-react'
import {
  FeatureDetails,
  Attributes,
  FieldName,
  BaseCard,
} from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail'
import {
  Paper,
  makeStyles,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Link,
} from '@material-ui/core'
import { measureText } from '@jbrowse/core/util'

const useStyles = makeStyles(() => ({
  table: {
    padding: 0,
  },
  link: {
    color: 'rgb(0, 0, 238)',
  },
  innerCard: {
    width: '100%',
    maxHeight: 600,
    overflow: 'auto',
  },
}))

// retrieved from https://stackoverflow.com/questions/6038061/regular-expression-to-find-urls-within-a-string?page=2&tab=votes#tab-top
const urlRegex = /(?:(?:((http|ftp|https):){0,1}\/\/)|www\.)([\w_-]+(?:(?:\.[\w_-]+)+))(?:([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]){0,1})/g

function determineAttributesWithLinks(attributes: any) {
  // @ts-ignore
  const attributesWithLinks = []
  attributes.forEach((attribute: any) => {
    for (const property in attribute) {
      if (
        typeof attribute[property] === 'string' &&
        (attribute[property].includes('http') ||
          attribute[property].includes('www.'))
      ) {
        attributesWithLinks.push(property)
      }
    }
  })
  // @ts-ignore
  return attributesWithLinks
}

const Transcript = observer((props: any) => {
  const { id, functionalImpact, consequenceType } = props

  return (
    <>
      <TableRow>
        {id ? <TableCell>{id}</TableCell> : null}
        <TableCell>{functionalImpact}</TableCell>
        <TableCell>{consequenceType}</TableCell>
      </TableRow>
    </>
  )
})

function Transcripts(props: any) {
  const { transcripts, id, geneId } = props
  const classes = useStyles()

  const idx = id ? id : geneId

  return (
    <div className={classes.innerCard}>
      <Table className={classes.table}>
        <TableBody>
          <TableRow key={`header-row-comp-${idx}`}>
            {id ? <TableCell>id</TableCell> : null}
            <TableCell>functionalImpact</TableCell>
            <TableCell>consequenceType</TableCell>
          </TableRow>
          {transcripts
            ? transcripts.map((ele: any, key: any) => (
                <Transcript
                  id={ele.id ? ele.id : null}
                  key={key}
                  functionalImpact={ele.functionalImpact}
                  consequenceType={
                    ele.consequence ? ele.consequence.type : ele.consequenceType
                  }
                />
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  )
}

function Observations(props: any) {
  const { observations } = props

  const attributesWithLinks = determineAttributesWithLinks(observations)
  const knownBrokenLinks = [
    'SNV and INDEL calling - www.compbio.group.cam.ac.uk/research/icgc/snv-and-indel-calling',
  ]

  return (
    <BaseCard title="Observations">
      {observations && attributesWithLinks
        ? observations.map((observation: any, key: any) => (
            <div key={key}>
              <Attributes
                attributes={observation}
                omit={attributesWithLinks as string[]}
              />
              {attributesWithLinks.map((attribute: any, key: any) => (
                <div key={key}>
                  {observation[attribute] ? (
                    <Grid container alignItems="center">
                      <FieldName
                        name={`${attribute}`}
                        // @ts-ignore
                        width={measureText(`${attribute}`, 12) + 10}
                      />
                      {observation[attribute].includes('http') ||
                      (observation[attribute].includes('www') &&
                        !knownBrokenLinks.find(
                          element => element === observation[attribute],
                        )) ? (
                        <Link href={observation[attribute].match(urlRegex)}>
                          {observation[attribute].split(urlRegex)[0]}
                        </Link>
                      ) : (
                        <span>{observation[attribute].split(urlRegex)[0]}</span>
                      )}
                    </Grid>
                  ) : null}
                </div>
              ))}
              {observations.length > 1 ? <hr /> : null}
            </div>
          ))
        : null}
    </BaseCard>
  )
}

function Genes(props: any) {
  const { genes } = props

  return (
    <BaseCard title="Genes">
      {genes
        ? genes.map((gene: any, key: any) => (
            <div key={key}>
              <Attributes attributes={gene} omit={['consequence']} />
              <Transcripts
                transcripts={gene.consequence}
                geneId={gene.geneId}
              ></Transcripts>
              {genes.length > 1 ? <hr /> : null}
            </div>
          ))
        : null}
    </BaseCard>
  )
}

function ExternalLinks(props: any) {
  const classes = useStyles()
  const { id } = props
  const link = `https://dcc.icgc.org/mutations/${id}`

  return (
    <BaseCard title="External Links">
      <div className={classes.innerCard}>
        <Table className={classes.table}>
          <TableBody>
            <TableRow key={`link-${id}`}>
              <TableCell>ICGC Data Portal</TableCell>
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
          </TableBody>
        </Table>
      </div>
    </BaseCard>
  )
}

function ICGCFeatureDetails(props: any) {
  const { model } = props
  const feature = model.featureData

  const impact = feature.functionalImpact
    ? feature.functionalImpact.includes('High')
      ? 'High'
      : feature.functionalImpact.includes('Low')
      ? 'Low'
      : 'Unknown'
    : undefined

  const fullFeature = {
    ...feature,
    functionalImpact: impact,
  }

  return (
    <Paper data-testid="icgc-widget">
      <FeatureDetails
        feature={impact ? fullFeature : feature}
        {...props}
        omit={['transcripts', 'genes', 'observations']}
      />
      {feature.transcripts && (
        <BaseCard title="Transcripts">
          <Transcripts transcripts={feature.transcripts} id={feature.id} />
        </BaseCard>
      )}
      {feature.observations && (
        <Observations observations={feature.observations} />
      )}
      {feature.genes && <Genes genes={feature.genes} />}
      <ExternalLinks
        id={feature.mutationId ? feature.mutationId : feature.id}
      />
    </Paper>
  )
}

export default observer(ICGCFeatureDetails)
