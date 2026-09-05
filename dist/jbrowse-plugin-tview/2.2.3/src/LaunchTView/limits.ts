// a tview row is one column per base, so a wide region produces an alignment
// too large to be useful (and slow to lay out)
export const MAX_BP = 20_000

// every read gets its own full-width row, so depth multiplies width. The
// alignment is held as one string for the life of the view, and MAX_BP alone
// does not bound it: 8k reads over 20kb is ~160M cells.
export const MAX_CELLS = 25_000_000
