import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

export const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}))

/**
 * NOTE: Help Dialog logic and display retrieved from GMOD/jbrowse-components:plugins/linear-genome-view/src/LinearGenomeView/components/HelpDialog.tsx
 */
export default function HelpDialog({
  handleClose,
}: {
  handleClose: () => void
}) {
  const classes = useStyles()
  return (
    <Dialog open maxWidth="xl" onClose={handleClose}>
      <DialogTitle>
        How to use annotations files
        {handleClose ? (
          <IconButton
            data-testid="close-resultsDialog"
            className={classes.closeButton}
            onClick={() => {
              handleClose()
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <h3>General</h3>
        <ul>
          <li>annotations must be uploaded as a TSV with column headers</li>
          <li>
            enforced location data must be under a heading called{' '}
            <code>genomeLocation</code> and be in the format of
            'chromosomeNumber:start-end', e.g. '1:39895426-39902013'
          </li>
          <li>
            alternatively, annotation files provided without genome location
            data will attempt to be cross referenced with a remote file of gene
            locations
          </li>
          <li>
            each row of data must include <code>name</code>
          </li>
        </ul>
        <h3>External Links</h3>
        Any external links that wish to be formatted on the widget properly must
        be in the following format:
        <ul>
          <li>
            under a header <code>externalLinks</code>
          </li>
          <li>
            a JSON string appearing as follows:{' '}
            <code>
              {'"[{"name": "MYLINK", "link": "https://my-link.com/"}]"'}
            </code>
          </li>
          <li>
            each annotation that you wish to have external links to must have
            this json string
          </li>
          <li>multiple external links are permitted</li>
        </ul>
        <h3>Colours and Categorization</h3>
        Annotations can be categorized into two categories if the 'tier' header
        is within the TSV.
        <ul>
          <li>tier 1 is annotated in blue</li>
          <li>tier 2 is annotated in red</li>
          <li>this field is to be provided as a 1 or a 2</li>
        </ul>
        <h3>Examples</h3>
        <ul>
          <li>
            TSV with only required headers
            <br />
            <code>
              name
              <br />
              note1
              <br />
              note2
            </code>
          </li>
          <br />
          <li>
            TSV with optional headers
            <br />
            <code>
              name&#9;genomeLocation&#9;tier&#9;externalLinks
              <br />
              note1&#9;1:39895426-39902013&#9;1&#9;
              {`[{"name":"MYLINK","link":"https://my-link.com/note1"}]`}
              <br />
              note2&#9;1:157573749-157598080&#9;2&#9;
              {`[{"name":"MYLINK","link":"https://my-link.com/note2"}]`}
            </code>
          </li>
        </ul>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={() => handleClose()} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
