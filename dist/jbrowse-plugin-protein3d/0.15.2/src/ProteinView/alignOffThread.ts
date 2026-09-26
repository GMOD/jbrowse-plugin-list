import { stripStopCodon } from 'p2s_mapper'

import type RpcManager from '@jbrowse/core/rpc/RpcManager'
import type { RpcCallArgs, RpcCallReturn } from '@jbrowse/core/rpc/RpcRegistry'

export type AlignmentMethod =
  | 'ProteinChooseMappedEntity'
  | 'ProteinAlignTranscriptToEntity'
  | 'ProteinRankIsoforms'

const ALIGNMENT_RPC_SESSION = 'protein3d-alignment'

/**
 * Run an alignment in the host's RPC worker. A worker that cannot, say one an
 * embedding app started without this plugin, gets the DP run in place instead
 * of failing the structure, and the warning is what the e2e and host-compat
 * gates fail on.
 */
export async function alignOffThread<M extends AlignmentMethod>({
  rpcManager,
  name,
  args,
  inPlace,
  current = () => true,
}: {
  rpcManager: Pick<RpcManager, 'call'>
  name: M
  args: RpcCallArgs<M>
  inPlace: () => RpcCallReturn<M>
  /** whether the answer is still wanted, so a superseded one is not redone */
  current?: () => boolean
}): Promise<RpcCallReturn<M>> {
  try {
    // v4 hosts read sessionId from the args as well as the call
    return await rpcManager.call(ALIGNMENT_RPC_SESSION, name, {
      ...args,
      sessionId: ALIGNMENT_RPC_SESSION,
    })
  } catch (e) {
    if (!current()) {
      throw e
    }
    console.warn(`${name} failed in the RPC worker, aligning in place`, e)
    return inPlace()
  }
}

/**
 * Whether the alignment is free: p2s_mapper skips the DP for an identical
 * sequence, so there is nothing to send to the worker, and the answer does not
 * wait behind the track renders queued there at launch.
 */
export function isIdentical(transcript: string, seq: string) {
  const t = stripStopCodon(transcript)
  return t.length > 0 && t === stripStopCodon(seq)
}
