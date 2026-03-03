import { FileLocation } from '@jbrowse/core/util/types'
import { openLocation } from '@jbrowse/core/util/io'

interface response {
  [key: string]: unknown
  success: boolean
  occurances: string[]
  type: number
  message: string
}

let res: response

/**
 * generates annotations in the form of two objects, one for the ideogram and one for the widget
 *  using a provided location of a TSV file
 *  the widget and ideo members differ in that the widget object has properties required by the ideogram
 *  library to render the annotations properly and the ideo object has properties formatted and
 *  distributed in a way that reads better for the IdeogramFeatureWidget when clicked
 * @param location - the location of the TSV file to be turned into annotations on the ideogram
 * @param withReactome - whether to cross reference the provided annots with reactome data
 * @returns widget object, ideo object, from the TSV provided information, and response for error display
 */
export async function generateAnnotations(
  location: FileLocation,
  withReactome: boolean,
) {
  const ideo: any = []
  const widget: any = []
  let reactomePathways: any = undefined
  res = {
    success: true,
    occurances: [],
    type: 0,
    message: '',
  }

  // fetching the contents of the annotations file provided by the user
  try {
    const fileContents = await fetchFile(location)
    // then reading it into lines and columns
    const { lines, columns } = readAnnot(fileContents)
    let dictionary: any = undefined
    if (!columns.includes('genomeLocation')) {
      // fetches the dictionary of genes that's hosted on jbrowse (with coordinating reactome ids)
      dictionary = JSON.parse(
        await fetchFile({
          uri:
            'https://jbrowse.org/genomes/GRCh38/reactome_xref_symbols_grch38.json',
          locationType: 'UriLocation',
        }),
      )
    }
    let pathways: any = undefined
    if (withReactome) {
      reactomePathways = await fetchPathways(checkFile(lines, columns))
      // makes the request to reactome to get all the pathways related to the annotated genes, and converts it to a dictionary for easy lookup
      pathways = reactomeToDictionary(reactomePathways)
    }

    if (!columns.includes('name')) {
      setResponseMessage(2)
    } else {
      lines.forEach(async (line: string) => {
        ideo.push(parseLine(line, columns, dictionary, pathways))
        widget.push(
          await widgetfy(parseLine(line, columns, dictionary, pathways)),
        )
      })
    }
  } catch (error) {
    setResponseMessage(2)
  }

  return { widget, ideo, pathways: reactomePathways?.pathways, res }
}

function checkFile(lines: any, columns: any) {
  let index = -1
  if (columns.length > 1) {
    index = columns.includes('geneSymbol')
      ? columns.indexOf('geneSymbol')
      : columns.includes('genes')
      ? columns.indexOf('genes')
      : columns.includes('name')
      ? columns.indexOf('name')
      : -1
  } else {
    index = 0
  }

  let fileContents = ''
  if (index >= 0) {
    lines.forEach((line: any) => {
      fileContents = fileContents.concat('\n', line.split('\t')[index])
    })
  }
  return fileContents
}

/**
 * restructures the response given by reactome when feeding it a list of genes into a dictionary to improve processing time
 * @param reactomeRes the response from reactome after passing it the list of genes to be annotated
 * @returns a restructured dictionary of the response
 */
function reactomeToDictionary(reactomeRes: any) {
  const pathways = reactomeRes.pathways
  const dict: any = {}

  pathways.forEach((pathway: any) => {
    dict[pathway.stId] = {
      ...pathway,
    }
  })

  return dict
}

async function fetchPathways(body: any) {
  const response = await fetch(
    'https://reactome.org/AnalysisService/identifiers/projection?includeDisease=true&interactors=false&order=ASC&pValue=1&resource=TOTAL&sortBy=ENTITIES_PVALUE',
    {
      method: 'POST',
      body,
    },
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function fetchHierarchy(geneName: string) {
  const response = await fetch(
    `https://idg.reactome.org/idgpairwise/relationships/hierarchyForTerm/${geneName}`,
    {
      method: 'GET',
    },
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch ${response.status} ${response.statusText}`)
  }
  return response.json()
}

function setResponseMessage(error: number) {
  res.success = false
  // missing location data
  if (error === 1) {
    res.message =
      'There are datapoints missing location data and they will be omitted from the annotations.'
    res.type = 1
  }
  // missing required headers in tsv
  if (error === 2) {
    res.message = 'The annotations file is missing a required header: "name".'
    res.type = 2
  }
  // missing location data and the gene names could not be found within the reference file
  if (error === 3) {
    res.message =
      'Some provided gene ids could not be coordinated with a location and they will be omitted from the annotations.'
    res.type = 3
  }
}

/**
 * converts the parsed line into the object we want to store for the widget to use for onClick information
 *   this would have 'end' instead of 'stop' and not contain the stop, color, and chr properties
 * @param obj - the parsed object from the file
 */
async function widgetfy(obj: any) {
  const newObj = obj
  newObj['end'] = newObj.stop
  delete newObj.stop
  delete newObj.color
  delete newObj.chr

  if (obj.details.reactomeIds) {
    const response = await fetchHierarchy(obj.name)

    if (response.hierarchy) {
      newObj.details.hierarchy = response.hierarchy
    }
  }

  return newObj
}

async function fetchFile(location: FileLocation) {
  return (await openLocation(location).readFile('utf8')) as string
}

function readAnnot(fileContents: any) {
  const lines = fileContents.split('\n')
  const rows: string[] = []
  let columns: string[] = []
  lines.forEach((line: any) => {
    if (line) {
      if (columns.length === 0) {
        columns = line.split('\t')
        columns.forEach((column: string, i: number) => {
          columns[i] = camelize(column)
        })
      } else {
        rows.push(line)
      }
    }
  })

  return {
    lines: rows,
    columns,
  }
}

/**
 * from https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 * @param str - the string to camelize
 * @returns the camelized string
 */
function camelize(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
}

function parseCoords(property: string) {
  const splitProperty = property.split(':')
  return {
    chr: splitProperty[0],
    start: +splitProperty[1].split('-')[0],
    stop: +splitProperty[1].split('-')[1],
  }
}

/**
 * converts the contents of the tsv file into an object that can be used
 *   places 'core' properties (name, chr, start, stop) at the start of the object, and the details in their own sub-object
 * @param line - the string representation of the line being converted to an object
 * @param columns - the columns of the data from the tsv
 * @returns the object representation of the line of data
 */
function parseLine(
  line: string,
  columns: string[],
  dictionary?: any,
  pathways?: any,
) {
  let annot: any = { details: {} }
  let named = false // prioritize naming a gene based on geneSymbol
  let hasLoc = false
  let hasColor = false
  line.split('\t').forEach((property: string, i: number) => {
    if (property) {
      const camelProp = camelize(columns[i])
      if (camelProp === 'name' && !named) {
        annot['name'] = property
      }
      if (camelProp === 'geneSymbol') {
        named = true
        annot['name'] = property
      }
      if (camelProp === 'genomeLocation') {
        const parsedProperties = parseCoords(property)
        if (parsedProperties.start > 0 && parsedProperties.stop > 0) {
          annot = {
            ...annot,
            ...parsedProperties,
          }
        } else {
          setResponseMessage(1)
        }
        hasLoc = true
      }
      if (camelProp === 'externalLinks') {
        property = JSON.parse(property)
      }
      if (camelProp === 'tier') {
        // if the property 'tier' exists, apply colour logic
        const a = '#0000FF' // blue
        const b = '#FF0000' // red
        if (property === '1') {
          annot['color'] = a
          annot['prevColor'] = a
        } else {
          annot['color'] = b
          annot['prevColor'] = b
        }
        hasColor = true
      }
      annot['details'][camelProp] = property
    }
  })

  if (hasColor === false) {
    annot['color'] = '#FF0000'
    annot['prevColor'] = '#FF0000'
  }
  if (hasLoc === false) {
    if (dictionary[annot['name']]) {
      annot['chr'] = dictionary[annot['name']]['chr']
      annot['start'] = dictionary[annot['name']]['start']
      annot['stop'] = dictionary[annot['name']]['stop']
      annot['details']['reactomeIds'] = dictionary[annot['name']]['reactomeIds']
      annot['details'][
        'genomeLocation'
      ] = `${annot['chr']}:${annot['start']}-${annot['stop']}`
    } else {
      setResponseMessage(3)
    }
  } else {
    if (pathways && dictionary && dictionary[annot['name']]) {
      annot['details']['reactomeIds'] = dictionary[annot['name']]['reactomeIds']
    }
  }

  if (annot['details']['reactomeIds'] && pathways) {
    annot['details']['pathways'] = []
    annot['details']['reactomeIds'].forEach((id: any) => {
      if (pathways[id]) {
        annot['details']['pathways'].push(pathways[id])
      }
    })
  }

  return annot
}
