import { describe, expect, test } from 'vitest'

import { findConnectedMsaView } from './findConnectedMsaView'

const lgv = { id: 'lgv-TP53', type: 'LinearGenomeView' }
const otherView = { id: 'other', type: 'SomeView' }

describe('findConnectedMsaView', () => {
  test('matches an explicit connectedMsaViewId', () => {
    const msa = { id: 'msa1', type: 'MsaView' }
    const found = findConnectedMsaView([lgv, msa, otherView], {
      connectedMsaViewId: 'msa1',
    })
    expect(found?.id).toBe('msa1')
  })

  test('matches an MsaView sharing the structure’s genome view', () => {
    const msa = { id: 'msa1', type: 'MsaView', connectedViewId: 'lgv-TP53' }
    const found = findConnectedMsaView([lgv, msa], {
      structureViewId: 'lgv-TP53',
    })
    expect(found?.id).toBe('msa1')
  })

  test('explicit id takes precedence over the genome-view bridge', () => {
    const msaA = { id: 'msaA', type: 'MsaView', connectedViewId: 'lgv-TP53' }
    const msaB = { id: 'msaB', type: 'MsaView', connectedViewId: 'lgv-TP53' }
    const found = findConnectedMsaView([msaA, msaB], {
      connectedMsaViewId: 'msaB',
      structureViewId: 'lgv-TP53',
    })
    expect(found?.id).toBe('msaB')
  })

  test('does not match a non-MsaView even if its id/connectedViewId line up', () => {
    const fakeMsa = { id: 'lgv-TP53', type: 'LinearGenomeView' }
    expect(
      findConnectedMsaView([fakeMsa], { connectedMsaViewId: 'lgv-TP53' }),
    ).toBeUndefined()
  })

  test('returns undefined when neither key is provided', () => {
    const msa = { id: 'msa1', type: 'MsaView', connectedViewId: 'lgv-TP53' }
    expect(findConnectedMsaView([msa], {})).toBeUndefined()
  })

  test('does not pair an MsaView connected to a different genome view', () => {
    const msa = { id: 'msa1', type: 'MsaView', connectedViewId: 'lgv-OTHER' }
    expect(
      findConnectedMsaView([msa], { structureViewId: 'lgv-TP53' }),
    ).toBeUndefined()
  })
})
