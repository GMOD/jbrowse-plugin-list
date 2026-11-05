import type { GenomeNaming } from '../ProteinView/util'

export const literalNaming: GenomeNaming = {
  canonicalRefName: r => r,
  isAssembly: () => true,
}
