import { JBrowsePluginMsaViewModel } from './model';
/**
 * Convert a genome coordinate from session.hovered to a visible MSA column.
 *
 * @param model - The MSA view model
 * @returns The visible column index, or undefined if no mapping exists
 */
export declare function genomeToMSA({ model }: {
    model: JBrowsePluginMsaViewModel;
}): number | undefined;
