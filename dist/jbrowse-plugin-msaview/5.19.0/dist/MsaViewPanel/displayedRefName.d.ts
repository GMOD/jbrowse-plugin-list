interface Resolver {
    initialized?: boolean;
    getCanonicalRefName: (refName: string) => string | undefined;
}
/**
 * The name a view's displayed regions use for `refName`'s chromosome. core's
 * bpToPx, and so centerAt, matches region names exactly and does nothing when
 * the feature says `chr1` and the view displays `1`. The raw name is kept when
 * a region already carries it, and when no region resolves to the same
 * chromosome, so a view this cannot place behaves as it did before.
 */
export declare function displayedRefName({ displayedRegions, assembly, refName, }: {
    displayedRegions: readonly {
        refName: string;
    }[];
    assembly?: Resolver;
    refName: string;
}): string;
export {};
