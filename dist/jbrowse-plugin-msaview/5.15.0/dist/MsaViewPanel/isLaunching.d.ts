interface LaunchState {
    blastParams?: unknown;
    orthologParams?: unknown;
    launchCompleted?: boolean;
    error?: unknown;
    init?: unknown;
    dataInitialized?: boolean;
    data: {
        msa?: string;
        tree?: string;
    };
}
/**
 * Whether the panel draws LaunchProgress in place of the alignment. It does for
 * a launch request still running, for a request whose alignment browser
 * storage expired after 7 days (LaunchProgress offers a Retry), and for an init
 * not yet fetched. An indexed view keeps its init for the life of the view, so
 * it only launches until the alignment arrives. react-msaview draws an error
 * over an alignment still in hand.
 */
export declare function isLaunching(model: LaunchState): boolean;
export {};
