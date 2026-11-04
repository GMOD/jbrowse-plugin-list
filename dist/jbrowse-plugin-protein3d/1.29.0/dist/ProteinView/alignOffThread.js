const ALIGNMENT_RPC_SESSION = 'protein3d-alignment';
/**
 * Run an alignment in the host's RPC worker. A worker that cannot, say one an
 * embedding app started without this plugin, gets the DP run in place instead
 * of failing the structure, and the warning is what the e2e and host-compat
 * gates fail on.
 */
export async function alignOffThread({ rpcManager, name, args, inPlace, current = () => true, }) {
    try {
        return await rpcManager.call(ALIGNMENT_RPC_SESSION, name, args);
    }
    catch (e) {
        if (!current()) {
            throw e;
        }
        console.warn(`${name} failed in the RPC worker, aligning in place`, e);
        return inPlace();
    }
}
