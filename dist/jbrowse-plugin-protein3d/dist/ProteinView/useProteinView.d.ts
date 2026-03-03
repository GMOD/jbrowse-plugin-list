import type { PluginContext } from 'molstar/lib/mol-plugin/context';
export default function useProteinView({ showControls, }: {
    showControls: boolean;
}): {
    parentRef: import("react").RefObject<HTMLDivElement | null>;
    error: unknown;
    plugin: PluginContext | undefined;
    loading: boolean;
};
