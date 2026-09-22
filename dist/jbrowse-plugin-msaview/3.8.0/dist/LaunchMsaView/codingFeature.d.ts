import type { Feature } from '@jbrowse/core/util';
export declare function isGeneLikeType(type: unknown): boolean;
export declare function isCodingFeature(feature: Feature): boolean;
/**
 * Whether the feature is known not to code for anything.
 *
 * Not simply `!isCodingFeature`: a feature that arrived with no subfeatures at
 * all says nothing either way, and a host is free to hand one over that way.
 * Reading that as "no protein here" takes the menu item off a perfectly
 * ordinary gene, silently, which is worse than opening a dialog that then has
 * nothing to translate.
 */
export declare function isKnownNonCoding(feature: Feature): boolean;
export declare function geneLikeRoot(feature: Feature): Feature;
