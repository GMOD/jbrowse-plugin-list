import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { v4 as uuidv4 } from 'uuid'
import FilterList from './Filters'

import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  Select,
  makeStyles,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from '@material-ui/core'

import UndoIcon from '@material-ui/icons/Undo'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(1),
    gap: theme.spacing(2),
  },
  tabRoot: {
    width: '33%',
    minWidth: '100px',
  },
  paper: {
    padding: theme.spacing(2),
  },
}))

function TabPanel(props: any) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box style={{ padding: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

function ConfigurationEditor({ model }: { model: any }) {
  const classes = useStyles()
  const [value, setValue] = useState(0)
  const [type, setType] = useState(
    model.target.adapter.featureType.value
      ? model.target.adapter.featureType.value
      : 'mutations',
  )

  const handleChangeTab = (event: any, newValue: any) => {
    setValue(newValue)
  }

  const handleChangeType = (event: any) => {
    setType(event.target.value)
    model.target.adapter.featureType.set(event.target.value)
  }

  const handleFilterClear = () => {
    model.clearFilters()
    model.target.adapter.filters.set('{}')
  }

  useEffect(() => {
    model.clearFilters()
    const filters = JSON.parse(model.target.adapter.filters.value)
    for (const filter in filters) {
      for (const prop in filters[filter]) {
        model.addFilter(
          uuidv4(),
          prop,
          `${filter}s`,
          JSON.stringify(filters[filter][prop]['is']),
        )
      }
    }
  }, [model])

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography variant="h6">Track Type</Typography>
        <FormControl>
          <Select
            value={type}
            onChange={handleChangeType}
            inputProps={{ 'data-testid': 'icgc_track_type_select' }}
          >
            <MenuItem value={'mutations'} data-testid="option_mutations">
              Mutations
            </MenuItem>
            <MenuItem value={'occurrences'} data-testid="option_occurrences">
              Mutation Occurrences
            </MenuItem>
          </Select>
          <FormHelperText>
            Select what to retrieve from the ICGC with your selected filters.
          </FormHelperText>
        </FormControl>
      </Paper>
      <Paper className={classes.paper}>
        <Grid container style={{ gap: '4px' }}>
          <Typography variant="h6">Filters</Typography>
          <Tooltip
            title="Clear all filters"
            aria-label="clear all filters"
            onClick={handleFilterClear}
          >
            <IconButton
              color="primary"
              data-testid="clear_all_filters_icon_button"
            >
              <UndoIcon />
            </IconButton>
          </Tooltip>
        </Grid>
        <Box>
          <Tabs
            value={value}
            onChange={handleChangeTab}
            aria-label="filtering tabs"
          >
            <Tab
              classes={{ root: classes.tabRoot }}
              label="Donors"
              {...a11yProps(0)}
            />
            <Tab
              classes={{ root: classes.tabRoot }}
              label="Genes"
              {...a11yProps(1)}
            />
            <Tab
              classes={{ root: classes.tabRoot }}
              label="Mutations"
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <FilterList schema={model} type={type} facetType="donors" />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <FilterList schema={model} type={type} facetType="genes" />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <FilterList schema={model} type={type} facetType="mutations" />
        </TabPanel>
      </Paper>
      {type === 'mutations' ? (
        <Paper className={classes.paper}>
          <Typography variant="h6">Colour Legend</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>functionalImpact</TableCell>
                <TableCell>Corresponding colour</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>High</TableCell>
                <TableCell>
                  <Chip
                    label="Red"
                    style={{ backgroundColor: 'red', color: 'white' }}
                  ></Chip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Low</TableCell>
                <TableCell>
                  <Chip
                    label="Blue"
                    style={{ backgroundColor: 'blue', color: 'white' }}
                  ></Chip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Unknown/Undefined</TableCell>
                <TableCell>
                  <Chip
                    label="Goldenrod"
                    style={{ backgroundColor: 'goldenrod', color: 'white' }}
                  ></Chip>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      ) : null}
    </div>
  )
}

export default observer(ConfigurationEditor)
