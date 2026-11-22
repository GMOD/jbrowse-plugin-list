import { useEffect, useState } from 'react'

import { getSession, parseLocString } from '@jbrowse/core/util'
import { Autocomplete, Button, TextField, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import { firstLookLocString, viewedLocString } from '../graphTrackChoices'

import type { GraphTrackChoice } from '../graphTrackChoices'
import type { GraphGenomeViewModel } from '../viewModel'

const useStyles = makeStyles()({
  column: { display: 'flex', flexDirection: 'column', gap: 12 },
  actions: { display: 'flex', justifyContent: 'flex-end' },
})

const GraphTrackPicker = observer(function GraphTrackPicker({
  model,
  choices,
}: {
  model: GraphGenomeViewModel
  choices: GraphTrackChoice[]
}) {
  const { classes } = useStyles()
  const session = getSession(model)
  const { assemblyManager } = session
  const [trackId, setTrackId] = useState(choices[0]?.trackId)
  const [typed, setTyped] = useState<string>()
  const [problem, setProblem] = useState<string>()
  const choice = choices.find(c => c.trackId === trackId) ?? choices[0]
  const assemblyName = choice?.assembly
  const assembly = assemblyName ? assemblyManager.get(assemblyName) : undefined
  const firstRegion = assembly?.regions?.[0]
  const loc =
    typed ??
    (choice
      ? (viewedLocString(session.views, choice.assembly) ??
        (firstRegion ? firstLookLocString(choice, firstRegion) : ''))
      : '')

  // the region box fills in once the assembly's sequence names load
  useEffect(() => {
    if (assemblyName) {
      assemblyManager.waitForAssembly(assemblyName).catch(() => undefined)
    }
  }, [assemblyManager, assemblyName])

  async function show() {
    if (choice) {
      try {
        const ready = await assemblyManager.waitForAssembly(choice.assembly)
        const parsed = ready
          ? parseLocString(loc, ref => ready.isValidRefName(ref))
          : undefined
        if (!ready || !parsed || !ready.isValidRefName(parsed.refName)) {
          setProblem(
            `No sequence ${parsed?.refName ?? loc} in ${choice.assembly}`,
          )
        } else {
          model.showTrackInLinearView(choice.trackId, choice.assembly, loc)
        }
      } catch (e) {
        setProblem(String(e instanceof Error ? e.message : e))
      }
    }
  }

  return (
    <form
      className={classes.column}
      data-testid="graph-track-picker"
      onSubmit={event => {
        event.preventDefault()
        void show()
      }}
    >
      <Autocomplete
        options={choices}
        value={choice ?? null}
        getOptionLabel={c => c.name}
        isOptionEqualToValue={(a, b) => a.trackId === b.trackId}
        onChange={(_event, picked) => {
          if (picked) {
            setTrackId(picked.trackId)
            setTyped(undefined)
            setProblem(undefined)
          }
        }}
        renderOption={({ key: _key, ...props }, c) => (
          <li key={c.trackId} {...props}>
            <div>
              <Typography variant="body2">{c.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {c.assembly} · {c.reach}
              </Typography>
            </div>
          </li>
        )}
        renderInput={params => (
          <TextField
            {...params}
            size="small"
            label="Graph track"
            helperText={choice ? `${choice.assembly} · ${choice.reach}` : ''}
          />
        )}
      />
      <TextField
        size="small"
        label="Region"
        name="region"
        value={loc}
        placeholder="chr1:1,000,001-1,020,000"
        error={problem !== undefined}
        helperText={problem ?? 'A sequence name, or name:start-end'}
        onChange={event => {
          setTyped(event.target.value)
          setProblem(undefined)
        }}
      />
      <div className={classes.actions}>
        <Button
          type="submit"
          variant="contained"
          data-testid="graph-track-show"
          disabled={!choice || !loc.trim()}
        >
          Show in linear genome view
        </Button>
      </div>
    </form>
  )
})

export default GraphTrackPicker
