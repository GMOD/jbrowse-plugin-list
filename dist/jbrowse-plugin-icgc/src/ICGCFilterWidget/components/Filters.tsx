import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { v4 as uuidv4 } from 'uuid'

import {
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  makeStyles,
  Tooltip,
  IconButton,
  Input,
} from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'
import ClearIcon from '@material-ui/icons/Clear'

const useStyles = makeStyles((theme) => ({
  buttonLabel: {
    gap: theme.spacing(1),
  },
  buttonized: {
    width: '100%',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
}))

async function fetchFeatures(featureType: string) {
  const response = await fetch(
    `http://localhost:7080/proxy/api/v1/${featureType}?facetsOnly=true&include=facets`,
    {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    },
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch ${response.status} ${response.statusText}`)
  }
  return response.json()
}

const Filter = observer((props: any) => {
  const { facets, schema, filterModel } = props
  const [category, setCategory] = useState(
    filterModel.category
      ? filterModel.category
      : facets
      ? Object.keys(facets)[0]
      : '',
  )
  const [filter, setFilter] = useState(
    filterModel.filter
      ? filterModel.filter
          .replace(/(["]+)/g, '')
          .replace(/([\[])+/g, '')
          .replace(/[\]]+/g, '')
          .split(',')
      : [],
  )

  const handleCatChange = (event: any) => {
    setCategory(event.target.value)
    setFilter([])
    filterModel.setCategory(event.target.value)
  }

  const handleFiltChange = (event: any) => {
    setFilter(event.target.value)
    filterModel.setFilter(JSON.stringify(event.target.value))
    updateTrack(schema.filters, schema.target)
  }

  const handleFilterDelete = () => {
    schema.deleteFilter(filterModel.id)
    updateTrack(schema.filters, schema.target)
  }

  function updateTrack(filters: any, target: any) {
    let completeFilters = {}
    filters.forEach((filter: any) => {
      const currentFilter = {
        [filter.category]: {
          is: JSON.parse(filter.filter),
        },
      }
      // @ts-ignore
      completeFilters[filter.type.slice(0, -1)] = {
        // @ts-ignore
        ...completeFilters[filter.type.slice(0, -1)],
        ...currentFilter,
      }
    })
    return target.adapter.filters.set(JSON.stringify(completeFilters))
  }

  // https://stackoverflow.com/questions/4149276/how-to-convert-camelcase-to-camel-case
  function prettify(string: string) {
    return string.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
      return str.toUpperCase()
    })
  }

  function alpha(a: any, b: any) {
    if (a.term < b.term) {
      return -1
    }
    if (a.term > b.term) {
      return 1
    }
    return 0
  }

  return (
    <>
      <List>
        <ListItem style={{ gap: '4px' }}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={category}
              onChange={handleCatChange}
              inputProps={{ 'data-testid': 'category_select' }}
            >
              {facets
                ? Object.keys(facets).map((key: string, idx: number) => {
                    return (
                      <MenuItem
                        value={key}
                        key={`${key}-${idx}-menuitem`}
                        data-testid={`cat_menuitem_${idx}`}
                      >
                        {prettify(key)}
                      </MenuItem>
                    )
                  })
                : null}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Filters</InputLabel>
            <Select
              label="Filters"
              value={filter}
              onChange={handleFiltChange}
              input={<Input />}
              renderValue={(selected: any) => selected.join(', ')}
              multiple
              inputProps={{ 'data-testid': 'filters_select' }}
            >
              {facets && category && facets[category].terms
                ? facets[category].terms
                    .sort(alpha)
                    .map((term: any, idx: number) => {
                      return (
                        <MenuItem
                          value={term.term}
                          key={`${term.term}-${idx}-menuitem`}
                          data-testid={`fil_menuitem_${idx}`}
                        >
                          <Checkbox
                            checked={
                              filter ? filter.indexOf(term.term) > -1 : false
                            }
                          />
                          <ListItemText primary={term.term} />
                        </MenuItem>
                      )
                    })
                : null}
            </Select>
          </FormControl>
          <Tooltip title="Remove filter" aria-label="remove filter">
            <IconButton
              aria-label="remove filter"
              onClick={handleFilterDelete}
              data-testid="remove_filter_icon_button"
            >
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </ListItem>
      </List>
    </>
  )
})

const FilterList = observer(
  ({
    schema,
    type,
    facetType,
  }: {
    schema: any
    type: string // mutations or occurrences
    facetType: string
  }) => {
    const [facets, setFacets] = useState<Array<any>>()

    useEffect(() => {
      const fetch = async () => {
        const mutationsResponse = await fetchFeatures(facetType)
        setFacets(mutationsResponse.facets)
      }

      fetch()
    }, [facetType])

    const handleClick = () => {
      // @ts-ignore
      schema.addFilter(
        uuidv4(),
        facets ? Object.keys(facets)[0] : '', // one of the facet categories
        facetType, // type: donors, mutations, genes
        '',
      )
    }

    return (
      <>
        {schema.filters.map((filterModel: any) => {
          if (filterModel.type === facetType) {
            return (
              <Filter
                facets={facets}
                schema={schema}
                filterModel={filterModel}
                key={filterModel.id}
              />
            )
          }
          return null
        })}
        <Button
          variant="outlined"
          onClick={handleClick}
          startIcon={<AddIcon />}
        >
          Add Filter
        </Button>
      </>
    )
  },
)

export default FilterList
