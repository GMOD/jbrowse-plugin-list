import React from 'react';
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
export default function HelpDialog({ handleClose, }: {
    handleClose: () => void;
}): React.JSX.Element;
