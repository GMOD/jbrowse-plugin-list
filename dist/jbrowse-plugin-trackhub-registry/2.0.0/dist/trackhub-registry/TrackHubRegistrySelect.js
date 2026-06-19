import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { SanitizedHTML } from '@jbrowse/core/ui';
import { isAbortException } from '@jbrowse/core/util';
import { openLocation } from '@jbrowse/core/util/io';
import { FormControl, FormControlLabel, FormLabel, LinearProgress, Radio, RadioGroup, Tooltip, Typography, } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import HubDetails from './HubDetails';
import SelectBox from './SelectBox';
import { mfetch, post_with_params } from './util';
function QueryStatus({ status }) {
    return (_jsxs(_Fragment, { children: [_jsx(LinearProgress, { variant: "query" }), _jsx(Typography, { children: status })] }));
}
// Need this for FormControlLabel to work with Tooltip
// https://github.com/mui-org/material-ui/issues/2225#issuecomment-460041878
function Wire({ children, ...props }) {
    return children(props);
}
const useStyles = makeStyles()((theme) => ({
    hubList: {
        maxHeight: 400,
        overflowY: 'auto',
    },
    genomeSelector: {
        marginTop: theme.spacing(1),
    },
}));
function TrackHubRegistrySelect({ model }) {
    const [error, setError] = useState();
    const [assemblies, setAssemblies] = useState();
    const [selectedSpecies, setSelectedSpecies] = useState('');
    const [selectedTrackhubAssembly, setSelectedTrackhubAssembly] = useState('');
    const [hubs, setHubs] = useState(new Map());
    const [allHubsRetrieved, setAllHubsRetrieved] = useState(false);
    const [selectedHub, setSelectedHub] = useState('');
    const { classes } = useStyles();
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        (async () => {
            try {
                const pingResponse = await mfetch('https://www.trackhubregistry.org/api/info/ping', { signal });
                if (pingResponse.ping !== 1) {
                    setError('Registry is not available');
                    return;
                }
                const assembliesResponse = await mfetch('https://www.trackhubregistry.org/api/info/assemblies', { signal });
                setAssemblies(assembliesResponse);
            }
            catch (e) {
                if (!isAbortException(e)) {
                    console.error(e);
                    setError(e);
                }
            }
        })();
        return () => {
            controller.abort();
        };
    }, []);
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        async function getHubs(reset) {
            const entriesPerPage = 10;
            const newHubs = reset ? new Map() : new Map(hubs);
            const page = Math.floor(hubs.size / entriesPerPage) + 1;
            const response = await post_with_params('https://www.trackhubregistry.org/api/search', { page, entries_per_page: entriesPerPage }, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assembly: selectedTrackhubAssembly }),
                signal,
            });
            if (response) {
                for (const item of response.items) {
                    if (item.hub.url.startsWith('ftp://')) {
                        item.error = 'JBrowse cannot add connections from FTP sources';
                    }
                    else {
                        const hub = openLocation({
                            uri: item.hub.url,
                            locationType: 'UriLocation',
                        });
                        try {
                            await hub.stat();
                        }
                        catch (error) {
                            item.error = `${error}`;
                        }
                    }
                    // currently an int, but stringify it
                    newHubs.set(`${item.trackdb_id}`, item);
                }
                setHubs(newHubs);
                if (newHubs.size === response.total_entries) {
                    setAllHubsRetrieved(true);
                }
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        ;
        (async () => {
            try {
                if (!error) {
                    if (selectedTrackhubAssembly && !hubs.size) {
                        await getHubs(true);
                    }
                    else if (hubs.size && !allHubsRetrieved) {
                        await getHubs();
                    }
                }
            }
            catch (e) {
                if (!isAbortException(e)) {
                    console.error(e);
                    setError(e);
                }
            }
        })();
        return () => {
            controller.abort();
        };
    }, [selectedTrackhubAssembly, error, hubs, allHubsRetrieved]);
    const renderItems = [
        _jsx(Typography, { variant: "h6", children: "The Track Hub Registry" }, "heading"),
    ];
    if (error) {
        renderItems.push(_jsx(Typography, { color: "error", children: `${error}` }, "error"));
        return _jsx("div", { children: renderItems });
    }
    if (!assemblies) {
        renderItems.push(_jsx(QueryStatus, { status: "Connecting to registry..." }, "queryStatus"));
        return _jsx("div", { children: renderItems });
    }
    const speciesList = Object.keys(assemblies).sort();
    renderItems.push(_jsx(SelectBox, { selectList: speciesList, selectedItem: selectedSpecies, handleSelect: (event) => {
            setSelectedSpecies(event.target.value);
            setSelectedTrackhubAssembly('');
            setHubs(new Map());
            setSelectedHub('');
            setAllHubsRetrieved(false);
        }, label: "Species", helpText: "Select a species" }, "speciesSelect"));
    if (selectedSpecies) {
        // trackhubregistry has this nonsense hg19 with alias hg38 entry, filter it out
        const ret = assemblies[selectedSpecies].filter((s) => !(s.name === 'GRCh37' && s.synonyms[0] === 'hg38'));
        renderItems.push(_jsx(SelectBox, { selectList: ret, selectedItem: selectedTrackhubAssembly, handleSelect: (event) => {
                setSelectedTrackhubAssembly(event.target.value);
                setHubs(new Map());
                setSelectedHub('');
                setAllHubsRetrieved(false);
            }, label: "Assembly", helpText: "Select an assembly" }, "assemblySelect"));
    }
    if (selectedTrackhubAssembly) {
        renderItems.push(_jsxs("div", { children: [_jsx(Typography, { children: "Select an assembly from our local tracklist if it doesn't match the assembly name on the remote trackhub" }), _jsx("br", {}), _jsxs(FormControl, { children: [_jsx(FormLabel, { children: "Hubs:" }), _jsx("div", { className: classes.hubList, children: _jsx(RadioGroup, { value: selectedHub, onChange: (event) => {
                                    const newHub = event.target.value;
                                    setSelectedHub(newHub);
                                    console.log({ newHub }, hubs);
                                    // set values on a trackhub registry configSchema
                                    model.target.name.set(hubs.get(newHub).hub.shortLabel);
                                    model.target.assemblyNames.set([selectedTrackhubAssembly]);
                                    model.target.trackDbId.set(newHub);
                                }, children: Array.from(hubs.values())
                                    .filter(({ assembly }) => assembly.name === selectedTrackhubAssembly ||
                                    assembly.synonyms.includes(selectedTrackhubAssembly))
                                    .map((h) => {
                                    const { error, trackdb_id, hub } = h;
                                    const { shortLabel, longLabel } = hub;
                                    return (_jsx(Wire, { value: trackdb_id, children: (formControlProps) => (_jsx(Tooltip, { title: error || _jsx(SanitizedHTML, { html: longLabel }), placement: "left", children: _jsx(FormControlLabel, { value: trackdb_id, label: _jsx(SanitizedHTML, { html: shortLabel }), disabled: Boolean(error), control: _jsx(Radio, {}), ...formControlProps }, trackdb_id) })) }, trackdb_id));
                                }) }) })] })] }, "hubSelect"));
        if (!allHubsRetrieved) {
            renderItems.push(_jsx(QueryStatus, { status: "Retrieving hubs" }, "hubStatus"));
        }
    }
    if (selectedHub) {
        renderItems.push(_jsx(HubDetails, { hub: hubs.get(selectedHub).hub }, "hubDetails"));
    }
    return _jsx(_Fragment, { children: renderItems });
}
export default TrackHubRegistrySelect;
//# sourceMappingURL=TrackHubRegistrySelect.js.map