import { expect, test, vi } from 'vitest'

import { launchViewSideBySide } from './sideBySide'

import type { AbstractSessionModel } from '@jbrowse/core/util'

// The split is asked for through two session actions that only web/desktop have,
// so this feature-detects. What these tests pin is the DIFFERENCE between the two
// ways detection can fail, because conflating them is what hid a real regression:
// jbrowse-web folded `setPendingMove` away, the guard went false, and the plugin
// silently stopped asking for a split — no error, just two views stacking, for
// weeks.
function makeSession(actions: Record<string, unknown>) {
  return actions as unknown as AbstractSessionModel
}

test('asks for the split when the session can place a view', () => {
  const calls: unknown[] = []
  const session = makeSession({
    setPendingMove: (move: unknown) => calls.push(move),
    setUseWorkspaces: (on: unknown) => calls.push(on),
  })

  launchViewSideBySide(session, 'view-1')

  expect(calls).toEqual([{ type: 'splitRight', viewId: 'view-1' }, true])
})

// an embedded session: no workspaces at all, nothing to ask for
test('stays silent on a session with no workspaces', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

  launchViewSideBySide(makeSession({}), 'view-1')

  expect(warn).not.toHaveBeenCalled()
  warn.mockRestore()
})

// the case that used to be indistinguishable from the one above
test('warns when the host has workspaces but not the placement action', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

  launchViewSideBySide(makeSession({ setUseWorkspaces: () => {} }), 'view-1')

  expect(warn).toHaveBeenCalledWith(expect.stringContaining('setPendingMove'))
  warn.mockRestore()
})
