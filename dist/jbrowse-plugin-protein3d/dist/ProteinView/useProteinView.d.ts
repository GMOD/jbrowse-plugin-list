import type { JBrowsePluginProteinViewModel } from './model';
export default function useProteinView({ showControls, model, }: {
    showControls: boolean;
    model?: JBrowsePluginProteinViewModel;
}): {
    parentRef: import("react").RefObject<HTMLDivElement | null>;
    error: unknown;
    loading: boolean;
};
