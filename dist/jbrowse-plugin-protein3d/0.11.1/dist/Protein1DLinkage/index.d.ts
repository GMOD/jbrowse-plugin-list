import type PluginManager from '@jbrowse/core/PluginManager';
export type { Protein1DLinkage } from './linkage';
export { findProteinLinkedView, genomeHighlightForProteinPosition, getProteinLinkage, linkageGenomeMapping, } from './linkage';
export default function Protein1DLinkageF(pluginManager: PluginManager): void;
