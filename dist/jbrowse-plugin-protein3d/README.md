# jbrowse-plugin-protein3d

WIP for displaying 3D protein structure alongside the genome browser

## LaunchView-ProteinView extension point

This plugin registers a `LaunchView-ProteinView` extension point that allows
programmatic launching of a ProteinView. This can be used via the JBrowse 2
session spec URL parameters (see
https://jbrowse.org/jb2/docs/urlparams/#session-spec).

### Parameters

| Parameter                        | Required | Description                                          |
| -------------------------------- | -------- | ---------------------------------------------------- |
| `url`                            | Yes      | Structure file URL (PDB, mmCIF, etc.)                |
| `userProvidedTranscriptSequence` | No       | Protein sequence for alignment                       |
| `feature`                        | No       | Genomic feature for cross-linking                    |
| `connectedViewId`                | No       | ID of connected LinearGenomeView                     |
| `alignmentAlgorithm`             | No       | 'emboss_matcher', 'emboss_needle', or 'emboss_water' |
| `displayName`                    | No       | Custom view display name                             |
| `height`                         | No       | View height in pixels (default: 650)                 |
| `showControls`                   | No       | Show Mol\* controls panel                            |
| `showHighlight`                  | No       | Show alignment highlight on structure                |
| `zoomToBaseLevel`                | No       | Zoom to base level on click (default: true)          |

### URL example

```
https://jbrowse.org/code/jb2/main/?config=config.json&session=spec-{"views":[{"type":"ProteinView","url":"https://alphafold.ebi.ac.uk/files/AF-P04637-F1-model_v4.cif"}]}
```

### Programmatic usage

```typescript
pluginManager.evaluateExtensionPoint('LaunchView-ProteinView', {
  session,
  url: 'https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v4.cif',
  userProvidedTranscriptSequence: 'MKTLLLTLVVV...',
  displayName: 'AlphaFold - P12345',
})
```
