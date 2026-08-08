import React from 'react'

import { Dialog } from '@jbrowse/core/ui'
import { Button, DialogActions, DialogContent, Divider } from '@mui/material'

/**
 * Core's Dialog rather than MUI's: it supplies the title bar, the close button
 * and the divider under them, so the hand-rolled versions of all three are gone
 * along with the absolute-positioned closeButton style they needed. It also
 * puts the dialog on JBrowse's own theme and error boundary.
 *
 * Imported from the `@jbrowse/core/ui` barrel, NOT `@jbrowse/core/ui/Dialog`.
 * Only the barrel is in ReExports/list.ts, so the deep path is not externalized
 * and bundles a second copy of Dialog and everything it reaches (dompurify by
 * way of SanitizedHTML, the error boundary, the dialog theme): 68kB, measured.
 */
export default function HelpDialog({
  handleClose,
}: {
  handleClose: () => void
}) {
  return (
    <Dialog
      open
      maxWidth="xl"
      onClose={handleClose}
      title="How to use annotations files"
    >
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
        <Button onClick={() => { handleClose() }} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
