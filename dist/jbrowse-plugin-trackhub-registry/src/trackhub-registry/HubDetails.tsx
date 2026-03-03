import React, { useEffect, useState } from 'react'

import { HubFile } from '@gmod/ucsc-hub'
import { SanitizedHTML } from '@jbrowse/core/ui'
import { openLocation } from '@jbrowse/core/util/io'
import EmailIcon from '@mui/icons-material/Email'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material'

function HubDetails(props: {
  hub: { url: string; longLabel: string; shortLabel: string }
}) {
  const [hubFile, setHubFile] = useState<HubFile>()
  const [error, setError] = useState<unknown>()

  const { hub } = props

  const { url: hubUrl, longLabel, shortLabel } = hub

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ;(async () => {
      try {
        const hubHandle = openLocation({
          uri: hubUrl,
          locationType: 'UriLocation',
        })
        const hubTxt = await hubHandle.readFile('utf8')
        setHubFile(new HubFile(hubTxt))
      } catch (error) {
        console.error(error)
        setError(error)
      }
    })()
  }, [hubUrl])

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{`${error}`}</Typography>
        </CardContent>
      </Card>
    )
  }
  if (hubFile) {
    const email = hubFile.data.email
    const descriptionUrl = hubFile.data.descriptionUrl
    return (
      <Card>
        <CardHeader title={shortLabel} />
        <CardContent>
          <SanitizedHTML html={longLabel} />
        </CardContent>
        <CardActions>
          <IconButton
            href={`mailto:${email}`}
            rel="noopener noreferrer"
            target="_blank"
            color="secondary"
          >
            <EmailIcon />
          </IconButton>
          {descriptionUrl ? (
            <IconButton
              href={new URL(descriptionUrl, new URL(hubUrl)).href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <OpenInNewIcon color="secondary" />
            </IconButton>
          ) : null}
        </CardActions>
      </Card>
    )
  }
  return <LinearProgress variant="query" />
}

export default HubDetails
