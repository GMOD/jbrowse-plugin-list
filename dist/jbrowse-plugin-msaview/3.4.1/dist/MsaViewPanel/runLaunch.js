import { isAbortError } from '../utils/fetch';
/**
 * Run one launch attempt, owning the AbortController that ties it to the view.
 *
 * The controller lives on the model because two things end a launch and neither
 * is here: the Cancel button, and the disposer `afterCreate` registers. Before
 * it existed, closing a view mid-BLAST left the poller checking EBI for the
 * job's lifetime and then writing to a node that was gone.
 */
export function runLaunch({ self, message, launch, onLaunched, }) {
    const controller = new AbortController();
    const { signal } = controller;
    self.setLaunchController(controller);
    const act = (fn) => {
        if (!signal.aborted) {
            fn();
        }
    };
    const scope = {
        signal,
        act,
        onProgress: arg => {
            act(() => {
                self.setProgress(arg);
            });
        },
        onRid: arg => {
            act(() => {
                self.setRid(arg);
            });
        },
    };
    void (async () => {
        try {
            act(() => {
                self.setProgress(message);
                self.setError(undefined);
            });
            const data = await launch(scope);
            act(() => {
                self.setData(data);
                onLaunched();
            });
        }
        catch (e) {
            // a cancel is not a failure: drawing the error panel for one would tell
            // the user their launch broke when they are the one who stopped it
            if (!isAbortError(e)) {
                act(() => {
                    self.setError(e);
                });
                console.error(e);
            }
        }
        finally {
            act(() => {
                self.setProgress('');
                // only if a later launch has not already claimed the slot
                if (self.launchController === controller) {
                    self.setLaunchController(undefined);
                }
            });
        }
    })();
}
