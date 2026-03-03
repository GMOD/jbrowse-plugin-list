'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ConnectionType = require('@jbrowse/core/pluggableElementTypes/ConnectionType');
var Plugin = require('@jbrowse/core/Plugin');
var configuration = require('@jbrowse/core/configuration');
var models = require('@jbrowse/core/pluggableElementTypes/models');
var util = require('@jbrowse/core/util');
var mobxStateTree = require('mobx-state-tree');
var tracks = require('@jbrowse/core/util/tracks');
var React = require('react');
var io = require('@jbrowse/core/util/io');
var material = require('@mui/material');
var mui = require('tss-react/mui');
var ui = require('@jbrowse/core/ui');
var ucscHub = require('@gmod/ucsc-hub');
var EmailIcon = require('@mui/icons-material/Email');
var OpenInNewIcon = require('@mui/icons-material/OpenInNew');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var ConnectionType__default = /*#__PURE__*/_interopDefaultLegacy(ConnectionType);
var Plugin__default = /*#__PURE__*/_interopDefaultLegacy(Plugin);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var EmailIcon__default = /*#__PURE__*/_interopDefaultLegacy(EmailIcon);
var OpenInNewIcon__default = /*#__PURE__*/_interopDefaultLegacy(OpenInNewIcon);

var configSchema = configuration.ConfigurationSchema('TheTrackHubRegistryConnection', {
    /**
     * #slot
     */
    trackDbId: {
        type: 'string',
        defaultValue: '',
        description: 'id of the trackDb in The Track Hub Registry',
    },
}, {
    /**
     * #baseConfiguration
     */
    baseConfiguration: models.baseConnectionConfig,
});

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

function getSubtracks(track) {
  var trackPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  if (track.members) {
    return Object.values(track.members).map(function (subTrack) {
      return getSubtracks(subTrack, track.shortLabel ? trackPath.concat([track.shortLabel]) : trackPath);
    }).flat();
  }
  track.categories = trackPath;
  return [track];
}
function generateTracks(trackDb, assemblyName, sequenceAdapter) {
  // eslint-disable-next-line no-underscore-dangle
  var configuration = trackDb.configuration;
  var subTracks = getSubtracks({
    members: configuration
  });
  return subTracks.map(function (subTrack) {
    var ret = makeTrackConfig(subTrack, trackDb.hub.url, sequenceAdapter);
    return _objectSpread2(_objectSpread2({}, makeTrackConfig(subTrack, trackDb.hub.url, sequenceAdapter)), {}, {
      trackId: "trackhub-registry-".concat(util.objectHash(ret)),
      assemblyNames: [assemblyName]
    });
  });
}
function makeTrackConfig(track, trackDbUrl, sequenceAdapter) {
  var trackType = track.type;
  var baseTrackType = trackType.split(' ')[0].toLowerCase();
  if (baseTrackType === 'bam' && track.bigDataUrl.toLowerCase().endsWith('cram')) {
    baseTrackType = 'cram';
  }
  var bigDataUrl = track.bigDataUrl;
  var bigDataLocation = {
    uri: new URL(bigDataUrl, trackDbUrl).href,
    locationType: 'UriLocation'
  };
  var categories = track.categories;
  var bigDataIndexLocation;
  switch (baseTrackType) {
    case 'bam':
      if (trackDbUrl) {
        bigDataIndexLocation = track.bigDataIndex ? {
          uri: new URL(track.bigDataIndex, trackDbUrl).href,
          locationType: 'UriLocation'
        } : {
          uri: new URL("".concat(track.bigDataUrl, ".bai"), trackDbUrl).href,
          locationType: 'UriLocation'
        };
      } else {
        bigDataIndexLocation = track.bigDataIndex ? {
          localPath: track.bigDataIndex,
          locationType: 'LocalPathLocation'
        } : {
          localPath: "".concat(track.bigDataUrl, ".bai"),
          locationType: 'LocalPathLocation'
        };
      }
      return {
        type: 'AlignmentsTrack',
        name: track.shortLabel,
        description: track.longLabel,
        category: categories,
        adapter: {
          type: 'BamAdapter',
          bamLocation: bigDataLocation,
          index: {
            location: bigDataIndexLocation
          }
        }
      };
    case 'bed':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'bed5floatscore':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'bedgraph':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'bedrnaelements':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'bigbarchart':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'bigbed':
      return {
        type: 'FeatureTrack',
        name: track.shortLabel,
        description: track.longLabel,
        category: categories,
        adapter: {
          type: 'BigBedAdapter',
          bigBedLocation: bigDataLocation
        }
      };
    case 'bigchain':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'biginteract':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'bigmaf':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'bigpsl':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'bigwig':
      return {
        type: 'QuantitativeTrack',
        name: track.shortLabel,
        description: track.longLabel,
        category: categories,
        adapter: {
          type: 'BigWigAdapter',
          bigWigLocation: bigDataLocation
        }
      };
    case 'broadpeak':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'coloredexon':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'cram':
      if (trackDbUrl) {
        bigDataIndexLocation = track.bigDataIndex ? {
          uri: new URL(track.bigDataIndex, trackDbUrl).href,
          locationType: 'UriLocation'
        } : {
          uri: new URL("".concat(track.bigDataUrl, ".bai"), trackDbUrl).href,
          locationType: 'UriLocation'
        };
      } else {
        bigDataIndexLocation = track.bigDataIndex ? {
          localPath: track.bigDataIndex,
          locationType: 'LocalPathLocation'
        } : {
          localPath: "".concat(track.bigDataUrl, ".bai"),
          locationType: 'LocalPathLocation'
        };
      }
      return {
        type: 'AlignmentsTrack',
        name: track.shortLabel,
        description: track.longLabel,
        category: categories,
        adapter: {
          type: 'CramAdapter',
          bamLocation: bigDataLocation,
          index: {
            location: bigDataIndexLocation
          },
          sequenceAdapter: sequenceAdapter
        }
      };
    case 'gvf':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'ld2':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'narrowpeak':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'peptidemapping':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'vcftabix':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'wig':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    case 'wigmaf':
      return tracks.generateUnsupportedTrackConf(track.shortLabel, baseTrackType, categories);
    default:
      throw new Error("Unsupported track type: ".concat(baseTrackType));
  }
}

async function mfetch(url, request) {
    const response = await fetch(url, request);
    if (!response.ok) {
        throw new Error(`HTTP
          ${response.status}: ${await response.text()} from
          ${url}`);
    }
    return response.json();
}
async function post_with_params(url, params = {}, options = {}) {
    const urlParams = Object.keys(params)
        .map(param => `${param}=${params[param]}`)
        .join('&');
    return mfetch(`${url}${urlParams ? `?${urlParams}` : ''}`, {
        ...options,
        method: 'POST',
    });
}

function stateModelFactory(pluginManager) {
    return mobxStateTree.types
        .compose('TheTrackHubRegistryConnection', models.BaseConnectionModelFactory(pluginManager), mobxStateTree.types.model({
        type: mobxStateTree.types.literal('TheTrackHubRegistryConnection'),
        configuration: configuration.ConfigurationReference(configSchema),
    }))
        .volatile(() => ({
        error: undefined,
    }))
        .actions(self => ({
        async connect(connectionConf) {
            // @ts-ignore
            self.clear();
            const trackDbId = configuration.readConfObject(connectionConf, 'trackDbId');
            try {
                const trackDb = await mfetch(`https://www.trackhubregistry.org/api/search/trackdb/${trackDbId}`);
                const assemblyName = trackDb.assembly.name;
                const session = util.getSession(self);
                const assembly = session.assemblyManager.get(assemblyName);
                if (!assembly) {
                    throw new Error(`unknown assembly ${assemblyName}`);
                }
                const sequenceAdapter = configuration.getConf(assembly, ['sequence', 'adapter']);
                const tracks = generateTracks(trackDb, assemblyName, sequenceAdapter);
                self.setTrackConfs(tracks);
            }
            catch (e) {
                console.error(e);
                this.setError(e);
            }
        },
        setError(e) {
            self.error = e;
        },
    }));
}

function HubDetails(props) {
    const [hubFile, setHubFile] = React.useState();
    const [error, setError] = React.useState();
    const { hub } = props;
    const { url: hubUrl, longLabel, shortLabel } = hub;
    React.useEffect(() => {
        (async () => {
            try {
                const hubHandle = io.openLocation({
                    uri: hubUrl,
                    locationType: 'UriLocation',
                });
                const hubTxt = await hubHandle.readFile('utf8');
                const newHubFile = new ucscHub.HubFile(hubTxt);
                setHubFile(newHubFile);
            }
            catch (error) {
                console.error(error);
                setError(error);
            }
        })();
    }, [hubUrl]);
    if (error) {
        return (React__default["default"].createElement(material.Card, null,
            React__default["default"].createElement(material.CardContent, null,
                React__default["default"].createElement(material.Typography, { color: "error" }, `${error}`))));
    }
    if (hubFile) {
        return (React__default["default"].createElement(material.Card, null,
            React__default["default"].createElement(material.CardHeader, { title: shortLabel }),
            React__default["default"].createElement(material.CardContent, null,
                React__default["default"].createElement(ui.SanitizedHTML, { html: longLabel })),
            React__default["default"].createElement(material.CardActions, null,
                React__default["default"].createElement(material.IconButton, { href: `mailto:${hubFile.get('email')}`, rel: "noopener noreferrer", target: "_blank", color: "secondary" },
                    React__default["default"].createElement(EmailIcon__default["default"], null)),
                hubFile.get('descriptionUrl') ? (React__default["default"].createElement(material.IconButton, { href: new URL(hubFile.get('descriptionUrl') || '', new URL(hubUrl))
                        .href, rel: "noopener noreferrer", target: "_blank" },
                    React__default["default"].createElement(OpenInNewIcon__default["default"], { color: "secondary" }))) : null)));
    }
    return React__default["default"].createElement(material.LinearProgress, { variant: "query" });
}

const useStyles$1 = mui.makeStyles()(theme => ({
    formControl: {
        minWidth: 192,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
    },
}));
function SelectBox({ selectList, selectedItem, handleSelect, label, helpText, }) {
    const { classes } = useStyles$1();
    return (React__default["default"].createElement(material.FormControl, { className: classes.formControl },
        React__default["default"].createElement(material.InputLabel, null, label),
        React__default["default"].createElement(material.Select, { value: selectedItem, onChange: handleSelect, label: helpText }, selectList.map(item => {
            let value;
            let description;
            if (item.name) {
                value = item.name;
                description = `${item.name} (${item.synonyms.join(' ')})`;
            }
            return (React__default["default"].createElement(material.MenuItem, { key: description || item, value: value || item }, description || item));
        })),
        React__default["default"].createElement(material.FormHelperText, null, helpText)));
}

function QueryStatus({ status }) {
    return (React__default["default"].createElement(React__default["default"].Fragment, null,
        React__default["default"].createElement(material.LinearProgress, { variant: "query" }),
        React__default["default"].createElement(material.Typography, null, status)));
}
// Need this for FormControlLabel to work with Tooltip
// https://github.com/mui-org/material-ui/issues/2225#issuecomment-460041878
function Wire({ children, ...props }) {
    return children(props);
}
const useStyles = mui.makeStyles()(theme => ({
    hubList: {
        maxHeight: 400,
        overflowY: 'auto',
    },
    genomeSelector: {
        marginTop: theme.spacing(1),
    },
}));
function TrackHubRegistrySelect({ model }) {
    const [error, setError] = React.useState();
    const [assemblies, setAssemblies] = React.useState();
    const [selectedSpecies, setSelectedSpecies] = React.useState('');
    const [selectedTrackhubAssembly, setSelectedTrackhubAssembly] = React.useState('');
    const [hubs, setHubs] = React.useState(new Map());
    const [allHubsRetrieved, setAllHubsRetrieved] = React.useState(false);
    const [selectedHub, setSelectedHub] = React.useState('');
    const { classes } = useStyles();
    React.useEffect(() => {
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
                if (!util.isAbortException(e)) {
                    console.error(e);
                    setError(e);
                }
            }
        })();
        return () => {
            controller.abort();
        };
    }, []);
    React.useEffect(() => {
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
                        const hub = io.openLocation({
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
                if (!util.isAbortException(e)) {
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
        React__default["default"].createElement(material.Typography, { key: "heading", variant: "h6" }, "The Track Hub Registry"),
    ];
    if (error) {
        renderItems.push(React__default["default"].createElement(material.Typography, { key: "error", color: "error" }, `${error}`));
        return React__default["default"].createElement("div", null, renderItems);
    }
    if (!assemblies) {
        renderItems.push(React__default["default"].createElement(QueryStatus, { key: "queryStatus", status: "Connecting to registry..." }));
        return React__default["default"].createElement("div", null, renderItems);
    }
    const speciesList = Object.keys(assemblies).sort();
    renderItems.push(React__default["default"].createElement(SelectBox, { key: "speciesSelect", selectList: speciesList, selectedItem: selectedSpecies, handleSelect: event => {
            setSelectedSpecies(event.target.value);
            setSelectedTrackhubAssembly('');
            setHubs(new Map());
            setSelectedHub('');
            setAllHubsRetrieved(false);
        }, label: "Species", helpText: "Select a species" }));
    if (selectedSpecies) {
        // trackhubregistry has this nonsense hg19 with alias hg38 entry, filter it out
        const ret = assemblies[selectedSpecies].filter(s => !(s.name === 'GRCh37' && s.synonyms[0] === 'hg38'));
        renderItems.push(React__default["default"].createElement(SelectBox, { key: "assemblySelect", selectList: ret, selectedItem: selectedTrackhubAssembly, handleSelect: event => {
                setSelectedTrackhubAssembly(event.target.value);
                setHubs(new Map());
                setSelectedHub('');
                setAllHubsRetrieved(false);
            }, label: "Assembly", helpText: "Select an assembly" }));
    }
    if (selectedTrackhubAssembly) {
        renderItems.push(React__default["default"].createElement("div", { key: "hubSelect" },
            React__default["default"].createElement(material.Typography, null, "Select an assembly from our local tracklist if it doesn't match the assembly name on the remote trackhub"),
            React__default["default"].createElement("br", null),
            React__default["default"].createElement(material.FormControl, null,
                React__default["default"].createElement(material.FormLabel, null, "Hubs:"),
                React__default["default"].createElement("div", { className: classes.hubList },
                    React__default["default"].createElement(material.RadioGroup, { value: selectedHub, onChange: event => {
                            const newHub = event.target.value;
                            setSelectedHub(newHub);
                            console.log({ newHub }, hubs);
                            // set values on a trackhub registry configSchema
                            model.target.name.set(hubs.get(newHub).hub.shortLabel);
                            model.target.assemblyNames.set([selectedTrackhubAssembly]);
                            model.target.trackDbId.set(newHub);
                        } }, Array.from(hubs.values())
                        .filter(({ assembly }) => assembly.name === selectedTrackhubAssembly ||
                        assembly.synonyms.includes(selectedTrackhubAssembly))
                        .map(h => {
                        const { error, trackdb_id, hub } = h;
                        const { shortLabel, longLabel } = hub;
                        return (React__default["default"].createElement(Wire, { key: trackdb_id, value: trackdb_id }, formControlProps => (React__default["default"].createElement(material.Tooltip, { title: error || React__default["default"].createElement(ui.SanitizedHTML, { html: longLabel }), placement: "left" },
                            React__default["default"].createElement(material.FormControlLabel, { key: trackdb_id, value: trackdb_id, label: React__default["default"].createElement(ui.SanitizedHTML, { html: shortLabel }), disabled: Boolean(error), control: React__default["default"].createElement(material.Radio, null), ...formControlProps })))));
                    }))))));
        if (!allHubsRetrieved) {
            renderItems.push(React__default["default"].createElement(QueryStatus, { key: "hubStatus", status: "Retrieving hubs" }));
        }
    }
    if (selectedHub) {
        renderItems.push(React__default["default"].createElement(HubDetails, { key: "hubDetails", hub: hubs.get(selectedHub).hub }));
    }
    return React__default["default"].createElement(React__default["default"].Fragment, null, renderItems);
}

class TrackHubRegistryPlugin extends Plugin__default["default"] {
    name = 'TrackHubRegistryPlugin';
    install(pluginManager) {
        pluginManager.addConnectionType(() => new ConnectionType__default["default"]({
            name: 'TheTrackHubRegistryConnection',
            configSchema,
            configEditorComponent: TrackHubRegistrySelect,
            stateModel: stateModelFactory(pluginManager),
            displayName: 'The Track Hub Registry',
            description: 'A hub from The Track Hub Registry',
            url: '//trackhubregistry.org/',
        }));
    }
}

exports["default"] = TrackHubRegistryPlugin;
//# sourceMappingURL=jbrowse-plugin-trackhub-registry.cjs.development.js.map
