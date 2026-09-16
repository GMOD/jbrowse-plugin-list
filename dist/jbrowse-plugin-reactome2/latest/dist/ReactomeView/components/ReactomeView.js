import React, { useEffect, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { Alert, Box, IconButton, InputAdornment, List, ListItemButton, ListItemText, TextField, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { getPathways, loadDiagramJs } from '../reactomeApi';
const listStyle = {
    width: 300,
    height: 500,
    overflow: 'auto',
    backgroundColor: '#f7f7f7',
    border: '1px solid #ddd',
};
const ReactomeView = observer(function ReactomeView({ model, }) {
    var _a;
    const [gene, setGene] = useState((_a = model.gene) !== null && _a !== void 0 ? _a : '');
    const [diagram, setDiagram] = useState();
    const holder = useRef(null);
    const placeHolder = `diagramHolder-${model.id}`;
    const { pathways, selectedPathway } = model;
    useEffect(() => {
        let active = true;
        loadDiagramJs()
            .then(async (Reactome) => {
            var _a;
            // DiagramJs finds its placeholder by id, and the view's body can still
            // be outside the document when the script is ready: 5.0.0-beta.8 in CI
            while (active && !((_a = holder.current) === null || _a === void 0 ? void 0 : _a.isConnected)) {
                await new Promise(requestAnimationFrame);
            }
            if (active) {
                setDiagram(Reactome.Diagram.create({
                    placeHolder,
                    width: 950,
                    height: 500,
                    toHide: ['search'],
                }));
            }
        })
            .catch((error) => {
            if (active) {
                model.setMessage(`The Reactome diagram viewer did not load: ${error}`);
            }
        });
        return () => {
            active = false;
        };
    }, [model, placeHolder]);
    useEffect(() => {
        if (diagram && selectedPathway) {
            diagram.loadDiagram(selectedPathway);
        }
    }, [diagram, selectedPathway]);
    async function search() {
        const name = gene.trim();
        if (name) {
            try {
                model.setSearchResult(name, await getPathways(name));
            }
            catch (error) {
                model.setMessage(`Could not retrieve pathways for ${name}: ${error}`);
            }
        }
    }
    return (React.createElement(Box, { sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            p: 1,
        } },
        React.createElement(TextField, { label: "Enter a gene name to retrieve associated pathways", value: gene, onChange: event => {
                setGene(event.target.value);
            }, onKeyDown: event => {
                if (event.key === 'Enter') {
                    void search();
                }
            }, sx: { width: 625 }, slotProps: {
                input: {
                    endAdornment: (React.createElement(InputAdornment, { position: "end" },
                        React.createElement(IconButton, { "aria-label": "search", onClick: () => void search() },
                            React.createElement(SearchIcon, null)))),
                },
            } }),
        React.createElement(Alert, { severity: "info", sx: { width: 1250, maxWidth: '100%' } }, model.message),
        React.createElement(Box, { sx: { display: 'flex', gap: 1 } },
            (pathways === null || pathways === void 0 ? void 0 : pathways.length) ? (React.createElement(List, { disablePadding: true, sx: listStyle }, pathways.map(pathway => (React.createElement(ListItemButton, { key: pathway.stId, selected: pathway.stId === selectedPathway, onClick: () => {
                    model.selectPathway(pathway);
                }, sx: {
                    borderBottom: '1px solid #ccc',
                    '&.Mui-selected': {
                        boxShadow: 'inset -4px 0 0 0 green',
                    },
                } },
                React.createElement(ListItemText, { primary: pathway.stId, secondary: pathway.name })))))) : (React.createElement(Box, { sx: listStyle },
                React.createElement(Typography, { align: "center" }, "There are no pathways to be displayed."))),
            React.createElement("div", { id: placeHolder, ref: holder }))));
});
export default ReactomeView;
//# sourceMappingURL=ReactomeView.js.map