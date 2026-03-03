import React, { useState } from 'react';
import { ErrorMessage, FileSelector } from '@jbrowse/core/ui';
import { getSession, isSessionModelWithWidgets, isSessionWithAddTracks, } from '@jbrowse/core/util';
import { getRoot } from '@jbrowse/mobx-state-tree';
import { Button, FormControl, FormControlLabel, FormLabel, Paper, Radio, RadioGroup, TextField, } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()(theme => ({
    textbox: {
        width: '100%',
    },
    paper: {
        margin: theme.spacing(),
        padding: theme.spacing(),
    },
    submit: {
        marginTop: 25,
        marginBottom: 100,
        display: 'block',
    },
}));
export default function MultiMAFWidget({ model }) {
    const { classes } = useStyles();
    const [samples, setSamples] = useState('');
    const [loc, setLoc] = useState();
    const [indexLoc, setIndexLoc] = useState();
    const [nhLoc, setNhLoc] = useState();
    const [error, setError] = useState();
    const [trackName, setTrackName] = useState('MAF track');
    const [fileTypeChoice, setFileTypeChoice] = useState('BigMafAdapter');
    const [indexTypeChoice, setIndexTypeChoice] = useState('TBI');
    const rootModel = getRoot(model);
    return (React.createElement(Paper, { className: classes.paper },
        React.createElement(Paper, null,
            error ? React.createElement(ErrorMessage, { error: error }) : null,
            React.createElement(FormControl, null,
                React.createElement(FormLabel, null, "File type"),
                React.createElement(RadioGroup, { value: fileTypeChoice, onChange: event => {
                        setFileTypeChoice(event.target.value);
                    } }, ['BigMafAdapter', 'MafTabixAdapter', 'BgzipTaffyAdapter'].map(r => (React.createElement(FormControlLabel, { key: r, value: r, control: React.createElement(Radio, null), checked: fileTypeChoice === r, label: r }))))),
            fileTypeChoice === 'BigMafAdapter' ? (React.createElement(FileSelector, { location: loc, name: "Path to bigMaf", rootModel: rootModel, setLocation: arg => {
                    setLoc(arg);
                } })) : fileTypeChoice === 'MafTabixAdapter' ? (React.createElement(React.Fragment, null,
                React.createElement(FormControl, null,
                    React.createElement(FormLabel, null, "Index type"),
                    React.createElement(RadioGroup, { value: fileTypeChoice, onChange: event => {
                            setIndexTypeChoice(event.target.value);
                        } }, ['TBI', 'CSI'].map(r => (React.createElement(FormControlLabel, { key: r, value: r, control: React.createElement(Radio, null), checked: indexTypeChoice === r, label: r }))))),
                React.createElement(FileSelector, { location: loc, name: "Path to MAF tabix", rootModel: rootModel, setLocation: arg => {
                        setLoc(arg);
                    } }),
                React.createElement(FileSelector, { location: indexLoc, name: "Path to MAF tabix index", rootModel: rootModel, setLocation: arg => {
                        setIndexLoc(arg);
                    } }))) : (React.createElement(React.Fragment, null,
                React.createElement(FileSelector, { location: loc, name: "Path to TAF.gz (Bgzipped TAF)", rootModel: rootModel, setLocation: arg => {
                        setLoc(arg);
                    } }),
                React.createElement(FileSelector, { location: indexLoc, name: "Path to TAF.gz.tai (TAF index)", rootModel: rootModel, setLocation: arg => {
                        setIndexLoc(arg);
                    } })))),
        React.createElement("div", null,
            React.createElement(FileSelector, { location: nhLoc, name: "Path to newick tree (.nh)", rootModel: rootModel, setLocation: arg => {
                    setNhLoc(arg);
                } }),
            React.createElement(TextField, { multiline: true, rows: 10, value: samples, onChange: event => {
                    setSamples(event.target.value);
                }, helperText: "Sample names (optional if .nh supplied, required if not)", placeholder: 'Enter sample names from the MAF file, one per line, or JSON formatted array of samples', variant: "outlined", fullWidth: true })),
        React.createElement(TextField, { value: trackName, helperText: "Track name", onChange: event => {
                setTrackName(event.target.value);
            } }),
        React.createElement(Button, { variant: "contained", className: classes.submit, onClick: () => {
                try {
                    const session = getSession(model);
                    let sampleNames = [];
                    try {
                        sampleNames = JSON.parse(samples);
                    }
                    catch (e) {
                        sampleNames = samples.split(/\n|\r\n|\r/);
                    }
                    const trackId = [
                        `${trackName.toLowerCase().replaceAll(' ', '_')}-${Date.now()}`,
                        session.adminMode ? '' : '-sessionTrack',
                    ].join('');
                    if (isSessionWithAddTracks(session)) {
                        session.addTrackConf({
                            trackId,
                            type: 'MafTrack',
                            name: trackName,
                            assemblyNames: [model.assembly],
                            adapter: fileTypeChoice === 'BigMafAdapter'
                                ? {
                                    type: fileTypeChoice,
                                    bigBedLocation: loc,
                                    samples: sampleNames,
                                    nhLocation: nhLoc,
                                }
                                : fileTypeChoice === 'MafTabixAdapter'
                                    ? {
                                        type: fileTypeChoice,
                                        bedGzLocation: loc,
                                        nhLocation: nhLoc,
                                        index: {
                                            indexType: indexTypeChoice,
                                            location: indexLoc,
                                        },
                                        samples: sampleNames,
                                    }
                                    : {
                                        type: fileTypeChoice,
                                        tafGzLocation: loc,
                                        taiLocation: indexLoc,
                                        nhLocation: nhLoc,
                                        samples: sampleNames,
                                    },
                        });
                        model.view?.showTrack(trackId);
                    }
                    model.clearData();
                    if (isSessionModelWithWidgets(session)) {
                        session.hideWidget(model);
                    }
                }
                catch (e) {
                    setError(e);
                }
            } }, "Submit")));
}
//# sourceMappingURL=AddTrackWorkflow.js.map