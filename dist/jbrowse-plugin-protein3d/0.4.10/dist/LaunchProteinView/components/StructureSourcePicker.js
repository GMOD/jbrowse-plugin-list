import React from 'react';
import { Button, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography, } from '@mui/material';
import HelpButton from './HelpButton';
import { getPdbStructureUrl } from '../utils/launchViewUtils';
export default function StructureSourcePicker({ choice, setChoice, structureURL, setStructureURL, file: _file, setFile, pdbId, setPdbId, }) {
    return (React.createElement("div", { style: { display: 'flex', margin: 30 } },
        React.createElement(Typography, null,
            "Open your structure file ",
            React.createElement(HelpButton, null)),
        React.createElement(FormControl, { component: "fieldset" },
            React.createElement(RadioGroup, { value: choice, onChange: event => {
                    setChoice(event.target.value);
                } },
                React.createElement(FormControlLabel, { value: "url", control: React.createElement(Radio, null), label: "URL" }),
                React.createElement(FormControlLabel, { value: "file", control: React.createElement(Radio, null), label: "File" }),
                React.createElement(FormControlLabel, { value: "pdb", control: React.createElement(Radio, null), label: "PDB ID" }))),
        choice === 'url' ? (React.createElement("div", null,
            React.createElement(Typography, null, "Open a PDB/mmCIF/etc. file from remote URL"),
            React.createElement(TextField, { label: "URL", value: structureURL, onChange: event => {
                    setStructureURL(event.target.value);
                } }))) : null,
        choice === 'file' ? (React.createElement("div", { style: { paddingTop: 20 } },
            React.createElement(Typography, null, "Open a PDB/mmCIF/etc. file from your local drive"),
            React.createElement(Button, { variant: "outlined", component: "label" },
                "Choose File",
                React.createElement("input", { type: "file", hidden: true, onChange: ({ target }) => {
                        const f = target.files?.[0];
                        if (f) {
                            setFile(f);
                        }
                    } })))) : null,
        choice === 'pdb' ? (React.createElement(TextField, { value: pdbId, onChange: event => {
                const s = event.target.value;
                setPdbId(s);
                setStructureURL(getPdbStructureUrl(s));
            }, label: "PDB ID" })) : null));
}
