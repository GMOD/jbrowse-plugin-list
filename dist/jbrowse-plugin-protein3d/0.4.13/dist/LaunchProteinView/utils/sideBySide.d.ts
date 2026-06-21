import type { AbstractSessionModel } from '@jbrowse/core/util';
export declare function getLaunchSideBySide(): boolean;
export declare function setLaunchSideBySide(value: boolean): void;
/**
 * Place a freshly-added view to the right of the others in a workspaces (tiled)
 * layout. Mirrors the "Move to split view" view-menu action: queue a splitRight
 * pending move for this view, then enable workspaces so TiledViewsContainer
 * consumes the move on mount (other views land in the left panel, this one in a
 * new right panel). No-op on sessions without workspaces support.
 */
export declare function launchViewSideBySide(session: AbstractSessionModel, viewId: string): void;
