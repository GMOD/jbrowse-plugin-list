import { ConfigurationSchema } from '@jbrowse/core/configuration'

export default ConfigurationSchema(
  'UCSCAdapter',
  {
    base: {
      type: 'fileLocation',
      description: 'base URL for the UCSC API',
      defaultValue: {
        uri: 'https://api.genome.ucsc.edu',
      },
    },
    track: {
      type: 'string',
      description:
        'the UCSC track to fetch, as listed by /list/tracks?genome=<genome>',
      defaultValue: '',
    },
    genome: {
      type: 'string',
      description:
        'the UCSC genome, e.g. hg38 or a GenArk accession; empty uses the assembly name',
      defaultValue: '',
    },
    maxItems: {
      type: 'number',
      description:
        'the most features to fetch for one region; a region holding more asks the user to zoom in',
      defaultValue: 20000,
    },
  },
  { explicitlyTyped: true },
)
