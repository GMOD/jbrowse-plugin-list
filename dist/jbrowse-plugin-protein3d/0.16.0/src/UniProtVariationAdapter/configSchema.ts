import { ConfigurationSchema } from '@jbrowse/core/configuration'

import type { AnyConfigurationSchemaType } from '@jbrowse/core/configuration'

/**
 * #config UniProtVariationAdapter
 */
function x() {} // eslint-disable-line @typescript-eslint/no-unused-vars

const UniProtVariationAdapter: AnyConfigurationSchemaType = ConfigurationSchema(
  'UniProtVariationAdapter',
  {
    /**
     * #slot
     */
    location: {
      type: 'fileLocation',
      defaultValue: { uri: '/path/to/my.bed.gz', locationType: 'UriLocation' },
    },
    scoreField: {
      type: 'string',
      defaultValue: '',
    },
  },
  { explicitlyTyped: true },
)
export default UniProtVariationAdapter
