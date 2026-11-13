# ProteinView

Each of these loads or lights the wrong thing without an error. Why, with the
measurements: `agent-docs/reference/molstar.md`.

- Load every structure through p2s_mapper's `parseStructureTrajectory`, which
  sniffs content: mmCIF parsed as `pdb` yields a model with no polymer entities.
- Find a structure's cell through `structureRootCell`; the
  `plugin.managers.structure.hierarchy` snapshot lags while any data transaction
  is open.
- Address a Mol\* residue by `Entity.seqIds`; `position + 1 === label_seq_id`
  holds only when the file carries `entity_poly_seq` or SEQRES.
- Read Mol\*'s `sequence.code`; `sequence.label` spells MSE or `(S|P)` in place
  of one letter and shifts every later residue.
- Compute columns and coordinates from a structure's `alignment` getter, not the
  stored `pairwiseAlignment`; they differ for a fusion construct.
- Address every entry of `molstarStructures`: an NMR ensemble loads one Mol\*
  structure per model.
- Match a Mol\* interaction by model id (`interactionPosition`), and set the
  select and highlight channels for all structures at once (`makeLociChannel`):
  every structure hears the whole plugin, and AlphaFold models are all entity 1.
- Pair an MSA hover with a structure through the genome codon
  (`connectedHoverHighlights`), never by column number.
- A new pending stage of a structure joins its `loading` getter, which
  `protein-view-ready` and `showLoading` read.
