import { ConfigurationSchema } from '@jbrowse/core/configuration'

import type { AnyConfigurationSchemaType } from '@jbrowse/core/configuration'

/**
 * #config AlphaMissensePathogenicityAdapter
 */
function x() {} // eslint-disable-line @typescript-eslint/no-unused-vars

const AlphaMissensePathogenicityAdapter: AnyConfigurationSchemaType =
  ConfigurationSchema(
    'AlphaMissensePathogenicityAdapter',
    {
      /**
       * #slot
       */
      location: {
        type: 'fileLocation',
        defaultValue: {
          uri: '/path/to/my.bed.gz',
          locationType: 'UriLocation',
        },
      },
    },
    { explicitlyTyped: true },
  )
export default AlphaMissensePathogenicityAdapter
