import { checkRegistry, isAssemblySpecificChange, Change, isFeatureChange, changeRegistry } from '@apollo-annotation/common';
import { gff3ToAnnotationFeature, AddAssemblyFromExternalChange, AddAssemblyAndFeaturesFromFileChange, AddAssemblyFromFileChange, AddAssemblyAliasesChange, AddFeatureChange, validationRegistry, makeUserSessionId, ValidationResultSet, annotationFeatureToGFF3, splitStringIntoChunks, DeleteAssemblyChange, DeleteFeatureChange, LocationStartChange, LocationEndChange, AddFeaturesFromFileChange, UserChange, DeleteUserChange, MergeExonsChange, MergeTranscriptsChange, AddRefSeqAliasesChange, SplitExonChange, getDecodedToken, isGFFInternalAttribute, isGFFColumnInternal, internalToGFF, gffInternalToColumn, gffToInternal, gffColumnToInternal, FeatureAttributeChange, TypeChange, StrandChange, filterJBrowseConfig, ImportJBrowseConfigChange, changes, CDSCheck, TranscriptCheck, CoreValidation, ParentChildValidation } from '@apollo-annotation/shared';
import Plugin from '@jbrowse/core/Plugin';
import { ConfigurationSchema, readConfObject, getConf, ConfigurationReference } from '@jbrowse/core/configuration';
import { BaseInternetAccountConfig, InternetAccount, TextSearchAdapterType, BaseDisplay, WidgetType, createBaseTrackConfig, TrackType, createBaseTrackModel, InternetAccountType, DisplayType } from '@jbrowse/core/pluggableElementTypes';
import { isSessionModelWithWidgets, getContainingView, isUriLocation, isLocalPathLocation, getSession, isElectron, isAbstractMenuManager, getEnv, revcom, defaultCodonTable, getFrame, intersection2, doesIntersect2, measureText } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import { DialogTitle, IconButton, DialogContent, LinearProgress, TextField, Accordion, AccordionSummary, Typography, AccordionDetails, FormGroup, FormControlLabel, Box, Tooltip, Checkbox, Table, TableBody, TableRow, TableCell, InputAdornment, FormHelperText, DialogActions, Button, DialogContentText, Autocomplete, FormControl, InputLabel, Select, MenuItem, RadioGroup, Radio, TableContainer, Paper, TableHead, useTheme, Grid, SvgIcon, Divider, Chip, List, ListItem, ListItemText, Menu, ListItemIcon, alpha, createTheme, Alert, Badge, Avatar, CircularProgress } from '@mui/material';
import { getSnapshot, getParent, getRoot, types, addDisposer, flow, isAlive, cast, resolveIdentifier, getParentOfType, applySnapshot } from '@jbrowse/mobx-state-tree';
import { autorun, entries, observable, flow as flow$1, when } from 'mobx';
import { io } from 'socket.io-client';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DeleteIcon from '@mui/icons-material/Delete';
import InputIcon from '@mui/icons-material/Input';
import PersonIcon from '@mui/icons-material/Person';
import RuleIcon from '@mui/icons-material/Rule';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { makeStyles } from '@jbrowse/core/util/tss-react';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ObjectID from 'bson-objectid';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { parseStringSync, formatSync } from '@gmod/gff';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import { Dialog as Dialog$1, Menu as Menu$1 } from '@jbrowse/core/ui';
import CloseIcon from '@mui/icons-material/Close';
import { observer } from 'mobx-react';
import { LocalPathLocation, UriLocation, BlobLocation, ElementId } from '@jbrowse/core/util/types/mst';
import { openDB, deleteDB } from 'idb/with-async-ittr';
import { checkAbortSignal, isAbortException } from '@jbrowse/core/util/aborting';
import jsonpath from 'jsonpath';
import { openLocation } from '@jbrowse/core/util/io';
import equal from 'fast-deep-equal/es6';
import { saveAs } from 'file-saver';
import { nanoid } from 'nanoid';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
import { BaseAdapter, BaseSequenceAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import SimpleFeature from '@jbrowse/core/util/simpleFeature';
import BaseResult from '@jbrowse/core/TextSearch/BaseResults';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { AnnotationFeatureModel, CheckResult, ApolloAssembly, ApolloRefSeq } from '@apollo-annotation/mst';
import styled from '@emotion/styled';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import RemoveIcon from '@mui/icons-material/Remove';
import ClearIcon from '@mui/icons-material/Clear';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { getParentRenderProps } from '@jbrowse/core/util/tracks';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LockIcon from '@mui/icons-material/Lock';
import ErrorIcon from '@mui/icons-material/Error';
import DownloadIcon from '@mui/icons-material/Download';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import RedoIcon from '@mui/icons-material/Redo';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import UndoIcon from '@mui/icons-material/Undo';
import SaveIcon from '@mui/icons-material/Save';

var version = "0.3.13";

const ApolloConfigSchema = ConfigurationSchema('ApolloInternetAccount', {
    baseURL: {
        description: 'Location of Apollo server',
        type: 'string',
        defaultValue: '',
    },
    tokenType: {
        description: 'A custom name for a token to include in the header',
        type: 'string',
        defaultValue: 'Bearer',
    },
}, { baseConfiguration: BaseInternetAccountConfig, explicitlyTyped: true });

async function loadAssemblyIntoClient(assemblyId, gff3FileText, apolloDataStore) {
    const featuresAndSequences = parseStringSync(gff3FileText, {
        parseSequences: true,
        parseComments: true,
        parseDirectives: false,
        parseFeatures: true,
    });
    if (featuresAndSequences.length === 0) {
        throw new Error('No features found in GFF3 file');
    }
    let sequenceFeatureCount = 0;
    let assembly = apolloDataStore.assemblies.get(assemblyId);
    if (!assembly) {
        assembly = apolloDataStore.addAssembly(assemblyId, 'InMemoryFileDriver');
    }
    for (const seqLine of featuresAndSequences) {
        if (Array.isArray(seqLine)) {
            // regular feature
            const feature = gff3ToAnnotationFeature(seqLine);
            const ref = assembly.refSeqs.get(feature.refSeq) ??
                assembly.addRefSeq(feature.refSeq, feature.refSeq);
            if (!ref.features.has(feature._id)) {
                ref.addFeature(feature);
            }
        }
        else if ('comment' in seqLine) {
            assembly.addComment(seqLine.comment);
        }
        else {
            sequenceFeatureCount++;
            // sequence feature
            let ref = assembly.refSeqs.get(seqLine.id);
            if (!ref) {
                ref = assembly.addRefSeq(seqLine.id, seqLine.id, seqLine.description);
            }
            if (seqLine.description && !ref.description) {
                ref.setDescription(seqLine.description);
            }
            ref.addSequence({
                start: 0,
                stop: seqLine.sequence.length,
                sequence: seqLine.sequence,
            });
        }
    }
    if (sequenceFeatureCount === 0) {
        throw new Error('No embedded FASTA section found in GFF3');
    }
    const checkResults = await checkFeatures(assembly);
    apolloDataStore.addCheckResults(checkResults);
    return assembly;
}
async function checkFeatures(assembly) {
    const checkResults = [];
    for (const ref of assembly.refSeqs.values()) {
        for (const feature of ref.features.values()) {
            for (const check of checkRegistry.getChecks().values()) {
                const result = await check.checkFeature(getSnapshot(feature), (start, stop) => Promise.resolve(ref.getSequence(start, stop)));
                checkResults.push(...result);
            }
        }
    }
    return checkResults;
}

function getFeatureName$1(feature) {
    const { attributes } = feature;
    const name = attributes.get('gff_name');
    if (name) {
        return name[0];
    }
    return '';
}
function getFeatureId$1(feature) {
    const { attributes } = feature;
    const id = attributes.get('gff_id');
    const transcript_id = attributes.get('transcript_id');
    const exon_id = attributes.get('exon_id');
    const protein_id = attributes.get('protein_id');
    if (id) {
        return id[0];
    }
    if (transcript_id) {
        return transcript_id[0];
    }
    if (exon_id) {
        return exon_id[0];
    }
    if (protein_id) {
        return protein_id[0];
    }
    return '';
}
function getFeatureNameOrId$1(feature) {
    const name = getFeatureName$1(feature);
    const id = getFeatureId$1(feature);
    if (name) {
        return `: ${name}`;
    }
    if (id) {
        return `: ${id}`;
    }
    return '';
}
function getStrand(strand) {
    if (strand === 1) {
        return 'Forward';
    }
    if (strand === -1) {
        return 'Reverse';
    }
    return '';
}
function getChildren(feature) {
    const children = [];
    //
    if (feature.children) {
        for (const [, ff] of feature.children) {
            children.push(ff);
        }
    }
    return children;
}
function getParents(feature) {
    const parents = [];
    let { parent } = feature;
    while (parent) {
        parents.push(parent);
        ({ parent } = parent);
    }
    return parents;
}
function getRelatedFeatures(feature, bp, includeSiblings = false) {
    const relatedFeatures = [];
    relatedFeatures.push(feature);
    for (const x of getParents(feature)) {
        relatedFeatures.push(x);
    }
    const children = getChildren(feature);
    for (const child of children) {
        if (child.min < bp && child.max >= bp) {
            relatedFeatures.push(child);
        }
    }
    if (!includeSiblings) {
        return relatedFeatures;
    }
    // Also add siblings , i.e. features having the same parent as the clicked
    // one and intersecting the click position
    if (feature.parent) {
        const siblings = feature.parent.children;
        if (siblings) {
            for (const [, sib] of siblings) {
                if (sib._id == feature._id) {
                    continue;
                }
                if (sib.min < bp && sib.max >= bp) {
                    relatedFeatures.push(sib);
                }
            }
        }
    }
    return relatedFeatures;
}

function selectFeatureAndOpenWidget(stateModel, feature) {
    if (stateModel.apolloDragging) {
        return;
    }
    stateModel.setSelectedFeature(feature);
    const { session } = stateModel;
    const { apolloDataStore } = session;
    const { featureTypeOntology } = apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    let containsCDSOrExon = false;
    for (const [, child] of feature.children ?? []) {
        if (featureTypeOntology.isTypeOf(child.type, 'CDS') ||
            featureTypeOntology.isTypeOf(child.type, 'exon')) {
            containsCDSOrExon = true;
            break;
        }
    }
    if ((featureTypeOntology.isTypeOf(feature.type, 'transcript') ||
        featureTypeOntology.isTypeOf(feature.type, 'pseudogenic_transcript')) &&
        containsCDSOrExon) {
        stateModel.showFeatureDetailsWidget(feature, [
            'ApolloTranscriptDetails',
            'apolloTranscriptDetails',
        ]);
    }
    else {
        stateModel.showFeatureDetailsWidget(feature);
    }
}
function isTranscriptFeature(feature, session) {
    const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    return (featureTypeOntology.isTypeOf(feature.type, 'transcript') ||
        featureTypeOntology.isTypeOf(feature.type, 'pseudogenic_transcript'));
}
function isExonFeature(feature, session) {
    const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    return featureTypeOntology.isTypeOf(feature.type, 'exon');
}
function isCDSFeature(feature, session) {
    const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    return featureTypeOntology.isTypeOf(feature.type, 'CDS');
}
function getAdjacentExons(currentExon, display, mousePosition, session) {
    const lgv = getContainingView(display);
    // Genomic coords of current view
    const viewGenomicLeft = mousePosition.bp - lgv.bpPerPx * mousePosition.x;
    const viewGenomicRight = viewGenomicLeft + lgv.coarseTotalBp;
    if (!currentExon.parent) {
        return { upstream: undefined, downstream: undefined };
    }
    const transcript = currentExon.parent;
    if (!transcript.children) {
        throw new Error(`Error getting children of ${transcript._id}`);
    }
    const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    let exons = [];
    for (const [, child] of transcript.children) {
        if (featureTypeOntology.isTypeOf(child.type, 'exon')) {
            exons.push(child);
        }
    }
    const adjacentExons = {
        upstream: undefined,
        downstream: undefined,
    };
    exons = exons.sort((a, b) => (a.min < b.min ? -1 : 1));
    for (const exon of exons) {
        if (exon.min > viewGenomicRight) {
            adjacentExons.downstream = exon;
            break;
        }
    }
    exons = exons.sort((a, b) => (a.min > b.min ? -1 : 1));
    for (const exon of exons) {
        if (exon.max < viewGenomicLeft) {
            adjacentExons.upstream = exon;
            break;
        }
    }
    if (transcript.strand === -1) {
        const newUpstream = adjacentExons.downstream;
        adjacentExons.downstream = adjacentExons.upstream;
        adjacentExons.upstream = newUpstream;
    }
    return adjacentExons;
}
function getStreamIcon(strand, isUpstream, isFlipped) {
    // This is the icon you would use for strand=1, downstream, straight
    // (non-flipped) view
    let icon = SkipNextRoundedIcon;
    if (strand === -1) {
        icon = SkipPreviousRoundedIcon;
    }
    if (isUpstream) {
        icon =
            icon === SkipPreviousRoundedIcon
                ? SkipNextRoundedIcon
                : SkipPreviousRoundedIcon;
    }
    if (isFlipped) {
        icon =
            icon === SkipPreviousRoundedIcon
                ? SkipNextRoundedIcon
                : SkipPreviousRoundedIcon;
    }
    return icon;
}
function getMinAndMaxPx(feature, refName, regionNumber, lgv) {
    const minPxInfo = lgv.bpToPx({
        refName,
        coord: feature.min,
        regionNumber,
    });
    const maxPxInfo = lgv.bpToPx({
        refName,
        coord: feature.max,
        regionNumber,
    });
    if (minPxInfo === undefined || maxPxInfo === undefined) {
        return;
    }
    const { offsetPx } = lgv;
    const minPx = minPxInfo.offsetPx - offsetPx;
    const maxPx = maxPxInfo.offsetPx - offsetPx;
    return [minPx, maxPx];
}
function getOverlappingEdge(feature, x, minMax) {
    const [minPx, maxPx] = minMax;
    // Feature is too small to tell if we're overlapping an edge
    if (Math.abs(maxPx - minPx) < 8) {
        return;
    }
    if (Math.abs(minPx - x) < 4) {
        return { feature, edge: 'min' };
    }
    if (Math.abs(maxPx - x) < 4) {
        return { feature, edge: 'max' };
    }
    return;
}
function isSelectedFeature(feature, selectedFeature) {
    return Boolean(selectedFeature && feature._id === selectedFeature._id);
}
function containsSelectedFeature(feature, selectedFeature) {
    if (!selectedFeature) {
        return false;
    }
    if (feature._id === selectedFeature._id) {
        return true;
    }
    return feature.hasDescendant(selectedFeature._id);
}
function makeFeatureLabel(feature) {
    let name;
    if (feature.attributes.get('gff_name')) {
        name = feature.attributes.get('gff_name')?.join(',');
    }
    else if (feature.attributes.get('gff_id')) {
        name = feature.attributes.get('gff_id')?.join(',');
    }
    else {
        name = feature._id;
    }
    const coords = `(${(feature.min + 1).toLocaleString('en')}..${feature.max.toLocaleString('en')})`;
    const maxLen = 60;
    if (name && name.length + coords.length > maxLen + 5) {
        const trim = maxLen - coords.length;
        name = trim > 0 ? name.slice(0, trim) : '';
        name = `${name}[...]`;
    }
    return `${name} ${coords}`;
}
function getContextMenuItemsForFeature$2(display, sourceFeature) {
    const { apolloInternetAccount: internetAccount, changeManager, regions, selectedFeature, session, } = display;
    const menuItems = [];
    const role = internetAccount ? internetAccount.role : 'admin';
    const admin = role === 'admin';
    const readOnly = !(role && ['admin', 'user'].includes(role));
    const [region] = regions;
    const sourceAssemblyId = display.getAssemblyId(region.assemblyName);
    const currentAssemblyId = display.getAssemblyId(region.assemblyName);
    menuItems.push({
        label: makeFeatureLabel(sourceFeature),
        type: 'subHeader',
    }, {
        label: 'Add child feature',
        disabled: readOnly,
        onClick: () => {
            session.queueDialog((doneCallback) => [
                AddChildFeature,
                {
                    session,
                    handleClose: () => {
                        doneCallback();
                    },
                    changeManager,
                    sourceFeature,
                    sourceAssemblyId,
                    internetAccount,
                },
            ]);
        },
    }, {
        label: 'Copy features and annotations',
        disabled: readOnly,
        onClick: () => {
            session.queueDialog((doneCallback) => [
                CopyFeature,
                {
                    session,
                    handleClose: () => {
                        doneCallback();
                    },
                    changeManager,
                    sourceFeature,
                    sourceAssemblyId: currentAssemblyId,
                },
            ]);
        },
    }, {
        label: 'Delete feature',
        disabled: !admin,
        onClick: () => {
            session.queueDialog((doneCallback) => [
                DeleteFeature,
                {
                    session,
                    handleClose: () => {
                        doneCallback();
                    },
                    changeManager,
                    sourceFeature,
                    sourceAssemblyId: currentAssemblyId,
                    selectedFeature,
                    setSelectedFeature: (feature) => {
                        display.setSelectedFeature(feature);
                    },
                },
            ]);
        },
    });
    if (isSessionModelWithWidgets(session)) {
        menuItems.push({
            label: 'Open feature details',
            onClick: () => {
                const apolloGeneWidget = session.addWidget('ApolloFeatureDetailsWidget', 'apolloFeatureDetailsWidget', {
                    feature: sourceFeature,
                    assembly: currentAssemblyId,
                    refName: region.refName,
                });
                session.showWidget(apolloGeneWidget);
            },
        });
    }
    return menuItems;
}
function navToFeatureCenter(feature, paddingPct, refSeqLength) {
    const paddingBp = (feature.max - feature.min) * paddingPct;
    const start = Math.max(feature.min - paddingBp, 1);
    const end = Math.min(feature.max + paddingBp, refSeqLength);
    return { refName: feature.refSeq, start, end };
}

function expandFeatures(feature, newLocation, edge) {
    const featureId = feature._id;
    const oldLocation = feature[edge];
    const changes = [{ featureId, oldLocation, newLocation }];
    const { parent } = feature;
    if (parent &&
        ((edge === 'min' && parent[edge] > newLocation) ||
            (edge === 'max' && parent[edge] < newLocation))) {
        changes.push(...expandFeatures(parent, newLocation, edge));
    }
    return changes;
}
function shrinkFeatures(feature, newLocation, edge, shrinkParent, childIdToSkip) {
    const featureId = feature._id;
    const oldLocation = feature[edge];
    const changes = [{ featureId, oldLocation, newLocation }];
    const { parent, children } = feature;
    if (children) {
        for (const [, child] of children) {
            if (child._id === childIdToSkip) {
                continue;
            }
            if ((edge === 'min' && child[edge] < newLocation) ||
                (edge === 'max' && child[edge] > newLocation)) {
                changes.push(...shrinkFeatures(child, newLocation, edge, shrinkParent));
            }
        }
    }
    if (parent && shrinkParent) {
        const siblings = [];
        if (parent.children) {
            for (const [, c] of parent.children) {
                if (c._id === featureId) {
                    continue;
                }
                siblings.push(c);
            }
        }
        if (siblings.length === 0) {
            changes.push(...shrinkFeatures(parent, newLocation, edge, shrinkParent, featureId));
        }
        else {
            const oldLocation = parent[edge];
            const boundedLocation = Math[edge](...siblings.map((s) => s[edge]), newLocation);
            if (boundedLocation !== oldLocation) {
                changes.push(...shrinkFeatures(parent, boundedLocation, edge, shrinkParent, featureId));
            }
        }
    }
    return changes;
}
function getPropagatedLocationChanges(feature, newLocation, edge, shrinkParent = false) {
    const oldLocation = feature[edge];
    if (newLocation === oldLocation) {
        throw new Error(`New and existing locations are the same: "${newLocation}"`);
    }
    if (edge === 'min') {
        if (newLocation > oldLocation) {
            // shrinking feature, may need to shrink children and/or parents
            return shrinkFeatures(feature, newLocation, edge, shrinkParent);
        }
        return expandFeatures(feature, newLocation, edge);
    }
    if (newLocation < oldLocation) {
        return shrinkFeatures(feature, newLocation, edge, shrinkParent);
    }
    return expandFeatures(feature, newLocation, edge);
}
function isMousePositionWithFeature(mousePosition) {
    return 'feature' in mousePosition;
}
function getMousePosition(event, lgv) {
    const canvas = event.currentTarget;
    const { clientX, clientY } = event;
    const { left, top } = canvas.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    const { coord: bp, index: regionNumber, refName } = lgv.pxToBp(x);
    return { x, y, refName, bp, regionNumber };
}

async function createFetchErrorMessage(response, additionalText) {
    let errorMessage;
    try {
        errorMessage = await response.text();
    }
    catch {
        errorMessage = '';
    }
    const responseMessage = `${response.status} ${response.statusText}${errorMessage ? ` (${errorMessage})` : ''}`;
    return `${additionalText ? `${additionalText} — ` : ''}${responseMessage}`;
}
/** given a session, get our ApolloInternetAccount */
function getApolloInternetAccount(session) {
    const { internetAccounts } = getParent(session);
    return internetAccounts.find((ia) => ia.type === 'ApolloInternetAccount');
}

const useStyles$g = makeStyles()((theme) => ({
    dialogTitle: {
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1.5),
        color: theme.palette.primary.contrastText,
    },
}));
const Dialog = observer(function JBrowseDialog(props) {
    const { classes } = useStyles$g();
    const { handleClose, title, ...other } = props;
    return (jsx(Dialog$1, { ...other, header: jsxs(Fragment, { children: [jsx(DialogTitle, { className: classes.dialogTitle, children: title }), jsx(IconButton, { "aria-label": "close", onClick: handleClose, className: classes.closeButton, children: jsx(CloseIcon, {}) })] }) }));
});

var FileType;
(function (FileType) {
    FileType["GFF3"] = "text/x-gff3";
    FileType["FASTA"] = "text/x-fasta";
    FileType["BGZIP_FASTA"] = "application/x-bgzip-fasta";
    FileType["FAI"] = "text/x-fai";
    FileType["GZI"] = "application/x-gzi";
    FileType["EXTERNAL"] = "text/x-external";
})(FileType || (FileType = {}));
const useStyles$f = makeStyles()((theme) => ({
    accordion: {
        border: `1px solid ${theme.palette.divider}`,
        '&:not(:last-child)': {
            borderBottom: 0,
        },
    },
    accordionSummary: {
        flexDirection: 'row-reverse',
    },
    accordionDetails: {
        padding: theme.spacing(2),
        borderTop: '1px solid rgba(0, 0, 0, .125)',
    },
    radioIcon: {
        color: theme.palette.tertiary.contrastText,
    },
    dialog: {
        // minHeight: 500,
        minWidth: 550,
        maxWidth: 800,
    },
}));
function checkSumbission(validAsm, sequenceIsEditable, fileType, fastaFile, fastaIndexFile, fastaGziIndexFile, validFastaUrl, validFastaIndexUrl, validFastaGziIndexUrl) {
    if (!validAsm) {
        return false;
    }
    if (sequenceIsEditable && fastaFile) {
        return true;
    }
    if (fileType === FileType.GFF3 && fastaFile) {
        return true;
    }
    if (fastaFile && fastaIndexFile && fastaGziIndexFile) {
        return true;
    }
    if (validFastaUrl && validFastaIndexUrl && validFastaGziIndexUrl) {
        return true;
    }
    return false;
}
function AddAssembly({ changeManager, handleClose, session, }) {
    const { classes } = useStyles$f();
    const { internetAccounts } = getRoot(session);
    const { notify } = session;
    const apolloInternetAccounts = internetAccounts.filter((ia) => ia.type === 'ApolloInternetAccount');
    if (apolloInternetAccounts.length === 0) {
        throw new Error('No Apollo internet account found');
    }
    const [assemblyName, setAssemblyName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [validAsm, setValidAsm] = useState(false);
    const [fileType, setFileType] = useState(FileType.BGZIP_FASTA);
    const [importFeatures, setImportFeatures] = useState(true);
    const [sequenceIsEditable, setSequenceIsEditable] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [strict, setStrict] = useState(true);
    const [fastaFile, setFastaFile] = useState(null);
    const [fastaIndexFile, setFastaIndexFile] = useState(null);
    const [fastaGziIndexFile, setFastaGziIndexFile] = useState(null);
    const [fastaUrl, setFastaUrl] = useState('');
    const [fastaIndexUrl, setFastaIndexUrl] = useState('');
    const [fastaGziIndexUrl, setFastaGziIndexUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [fastaGzipChecked, setFastaGzipChecked] = useState(false);
    const [gff3GzipChecked, setGff3GzipChecked] = useState(false);
    function checkAssemblyName(assembly) {
        const { assemblies } = session;
        const checkAsm = assemblies.find((asm) => readConfObject(asm, 'displayName') === assembly);
        if (checkAsm) {
            setValidAsm(false);
            setErrorMessage(`Assembly ${assembly} already exists.`);
        }
        else {
            setValidAsm(true);
            setErrorMessage('');
        }
    }
    async function uploadFile(file, fileType) {
        const { jobsManager } = session;
        const controller = new AbortController();
        const [{ baseURL, getFetcher }] = apolloInternetAccounts;
        const url = new URL('files', baseURL);
        url.searchParams.set('type', fileType);
        const uri = url.href;
        const formData = new FormData();
        let filename = file.name;
        const isGzip = fileType === FileType.BGZIP_FASTA ||
            (fileType === FileType.FASTA &&
                (!sequenceIsEditable || fastaGzipChecked)) ||
            (fileType === FileType.GFF3 && gff3GzipChecked);
        if (isGzip && !file.name.toLocaleLowerCase().endsWith('.gz')) {
            filename = `${filename}.gz`;
        }
        else if (!isGzip && file.name.toLocaleLowerCase().endsWith('.gz')) {
            filename = `${filename}.txt`;
        }
        formData.append('file', file, filename);
        formData.append('type', fileType);
        const apolloFetchFile = getFetcher({
            locationType: 'UriLocation',
            uri,
        });
        const job = {
            name: `UploadAssemblyFile for ${assemblyName}`,
            statusMessage: 'Pre-validating',
            progressPct: 0,
            cancelCallback: () => {
                controller.abort(new DOMException(`Canceling adding of assembly "${assemblyName}"`, 'AbortError'));
                jobsManager.abortJob(job.name);
            },
        };
        jobsManager.runJob(job);
        jobsManager.update(job.name, `Uploading ${file.name}, this may take awhile`);
        const { signal } = controller;
        const response = await apolloFetchFile(uri, {
            method: 'POST',
            body: formData,
            signal,
        });
        if (!response.ok) {
            const newErrorMessage = await createFetchErrorMessage(response, 'Error when inserting new assembly (while uploading file)');
            jobsManager.abortJob(job.name, newErrorMessage);
            setErrorMessage(newErrorMessage);
            return '';
        }
        const result = await response.json();
        const fileId = result._id;
        jobsManager.done(job);
        return fileId;
    }
    async function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        setSubmitted(true);
        setLoading(true);
        notify(`Assembly "${assemblyName}" is being added`, 'info');
        handleClose();
        event.preventDefault();
        let change;
        if (fileType === FileType.EXTERNAL) {
            change = new AddAssemblyFromExternalChange({
                typeName: 'AddAssemblyFromExternalChange',
                assembly: new ObjectID().toHexString(),
                assemblyName,
                externalLocation: {
                    fa: fastaUrl,
                    fai: fastaIndexUrl,
                    gzi: fastaGziIndexUrl,
                },
            });
        }
        else {
            if (!fastaFile) {
                throw new Error('Missing fasta file');
            }
            if (fileType === FileType.GFF3 && importFeatures) {
                const faId = await uploadFile(fastaFile, FileType.GFF3);
                change = new AddAssemblyAndFeaturesFromFileChange({
                    typeName: 'AddAssemblyAndFeaturesFromFileChange',
                    assembly: new ObjectID().toHexString(),
                    assemblyName,
                    fileIds: { fa: faId },
                    parseOptions: { strict },
                });
            }
            else if (fileType === FileType.GFF3) {
                const faId = await uploadFile(fastaFile, FileType.GFF3);
                change = new AddAssemblyFromFileChange({
                    typeName: 'AddAssemblyFromFileChange',
                    assembly: new ObjectID().toHexString(),
                    assemblyName,
                    fileIds: {
                        fa: faId,
                    },
                });
            }
            else if (sequenceIsEditable) {
                const faId = await uploadFile(fastaFile, FileType.FASTA);
                change = new AddAssemblyFromFileChange({
                    typeName: 'AddAssemblyFromFileChange',
                    assembly: new ObjectID().toHexString(),
                    assemblyName,
                    fileIds: {
                        fa: faId,
                    },
                });
            }
            else {
                if (!fastaIndexFile || !fastaGziIndexFile) {
                    throw new Error('Missing fasta index files');
                }
                const faId = await uploadFile(fastaFile, FileType.BGZIP_FASTA);
                const faiId = await uploadFile(fastaIndexFile, FileType.FAI);
                const gziId = await uploadFile(fastaGziIndexFile, FileType.GZI);
                change = new AddAssemblyFromFileChange({
                    typeName: 'AddAssemblyFromFileChange',
                    assembly: new ObjectID().toHexString(),
                    assemblyName,
                    fileIds: {
                        fa: faId,
                        fai: faiId,
                        gzi: gziId,
                    },
                });
            }
        }
        const [{ internetAccountId }] = apolloInternetAccounts;
        await changeManager.submit(change, {
            internetAccountId,
            updateJobsManager: true,
        });
        setSubmitted(false);
        setLoading(false);
    }
    let validFastaUrl = false;
    try {
        const url = new URL(fastaUrl);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            validFastaUrl = true;
        }
    }
    catch {
        // pass
    }
    let validFastaIndexUrl = false;
    try {
        const url = new URL(fastaIndexUrl);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            validFastaIndexUrl = true;
        }
    }
    catch {
        // pass
    }
    let validFastaGziIndexUrl = false;
    try {
        const url = new URL(fastaGziIndexUrl);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            validFastaGziIndexUrl = true;
        }
    }
    catch {
        // pass
    }
    const [expanded, setExpanded] = React.useState('panelFastaInput');
    const handleAccordionChange = (panel) => (event, newExpanded) => {
        if (newExpanded) {
            setExpanded(panel);
        }
    };
    return (jsxs(Dialog, { open: true, handleClose: handleClose, "data-testid": "add-assembly-dialog", title: "Add new assembly", maxWidth: false, children: [jsxs("form", { onSubmit: onSubmit, "data-testid": "submit-form", children: [jsxs(DialogContent, { className: classes.dialog, children: [loading ? jsx(LinearProgress, {}) : null, jsx(TextField, { margin: "dense", id: "name", label: "Assembly name", type: "TextField", fullWidth: true, variant: "outlined", onChange: (e) => {
                                    setSubmitted(false);
                                    setAssemblyName(e.target.value);
                                    checkAssemblyName(e.target.value);
                                }, disabled: submitted && !errorMessage }), jsxs(Accordion, { disableGutters: true, elevation: 0, square: true, className: classes.accordion, expanded: expanded === 'panelFastaInput', onChange: handleAccordionChange('panelFastaInput'), children: [jsx(AccordionSummary, { className: classes.accordionSummary, expandIcon: expanded === 'panelFastaInput' ? (jsx(RadioButtonCheckedIcon, { className: classes.radioIcon, sx: { fontSize: '1.2rem', ml: 5 } })) : (jsx(RadioButtonUncheckedIcon, { className: classes.radioIcon, sx: { fontSize: '1.2rem', mr: 5 } })), "aria-controls": "panelFastaInputd-content", id: "panelFastaInputd-header", children: jsx(Typography, { component: "span", children: "FASTA input" }) }), jsx(AccordionDetails, { className: classes.accordionDetails, children: jsxs(FormGroup, { children: [jsx(FormControlLabel, { "data-testid": "files-on-url-checkbox", control: jsx(Checkbox, { onChange: () => {
                                                            setFileType(fileType === FileType.EXTERNAL
                                                                ? FileType.BGZIP_FASTA
                                                                : FileType.EXTERNAL);
                                                            if (fileType === FileType.EXTERNAL) {
                                                                setSequenceIsEditable(false);
                                                            }
                                                        }, checked: fileType === FileType.EXTERNAL, disabled: sequenceIsEditable && fileType !== FileType.GFF3 }), label: jsxs(Box, { display: "flex", alignItems: "center", children: ["Use external URLs", jsx(Tooltip, { title: "Use external URLs to provide FASTA and index files. Does not copy the files to the Apollo collaboration server, so ensure the URLs are stable.", placement: "top-start", children: jsx(IconButton, { size: "small", children: jsx(InfoIcon, { sx: { fontSize: 18 } }) }) })] }) }), jsx(FormControlLabel, { "data-testid": "sequence-is-editable-checkbox", control: jsx(Checkbox, { onChange: () => {
                                                            setSequenceIsEditable(!sequenceIsEditable);
                                                        } }), checked: sequenceIsEditable, disabled: fileType === FileType.EXTERNAL, label: jsxs(Box, { display: "flex", alignItems: "center", children: ["Store sequence in database", jsx(Tooltip, { title: "Enables users to edit the genomic sequence, but comes with performance impacts. Use with care.", placement: "top-start", children: jsx(IconButton, { size: "small", children: jsx(InfoIcon, { sx: { fontSize: 18 } }) }) })] }) }), jsx(FormControlLabel, { "data-testid": "fasta-is-gzip-checkbox", control: jsx(Checkbox, { checked: !sequenceIsEditable || fastaGzipChecked, onChange: () => {
                                                            if (sequenceIsEditable) {
                                                                setFastaGzipChecked(!fastaGzipChecked);
                                                            }
                                                            else {
                                                                setFastaGzipChecked(true);
                                                            }
                                                        }, disabled: !sequenceIsEditable }), label: "FASTA is gzip compressed" }), fileType === FileType.BGZIP_FASTA ||
                                                    fileType === FileType.GFF3 ? (jsx(Table, { size: "small", sx: { mt: 2 }, children: jsxs(TableBody, { children: [jsxs(TableRow, { children: [jsx(TableCell, { style: { borderBottomWidth: 0 }, children: jsxs(Box, { display: "flex", alignItems: "center", children: [jsx("span", { children: "FASTA" }), jsx(Tooltip, { title: 'Unless "Store sequence in database" enabled, FASTA input must be compressed with bgzip and indexed with samtools faidx (or equivalent). Compression is optional for sequences stored in the database.', children: jsx(IconButton, { size: "small", children: jsx(InfoIcon, { sx: { fontSize: 18 } }) }) })] }) }), jsx(TableCell, { style: { borderBottomWidth: 0 }, children: jsx("input", { "data-testid": "fasta-input-file", type: "file", onChange: (e) => {
                                                                                const file = e.target.files?.item(0);
                                                                                if (file) {
                                                                                    setFastaFile(file);
                                                                                    if (file.name.endsWith('.gz')) {
                                                                                        setFastaGzipChecked(true);
                                                                                    }
                                                                                }
                                                                            }, disabled: submitted && !errorMessage }) })] }), jsxs(TableRow, { children: [jsx(TableCell, { style: { borderBottomWidth: 0 }, children: "FASTA index (.fai)" }), jsx(TableCell, { style: { borderBottomWidth: 0 }, children: jsx("input", { "data-testid": "fai-input-file", type: "file", onChange: (e) => {
                                                                                setFastaIndexFile(e.target.files?.item(0) ?? null);
                                                                            }, disabled: (submitted && !errorMessage) || sequenceIsEditable }) })] }), jsxs(TableRow, { children: [jsx(TableCell, { style: { borderBottomWidth: 0 }, children: "FASTA binary index (.gzi)" }), jsx(TableCell, { style: { borderBottomWidth: 0 }, children: jsx("input", { "data-testid": "gzi-input-file", type: "file", onChange: (e) => {
                                                                                setFastaGziIndexFile(e.target.files?.item(0) ?? null);
                                                                            }, disabled: (submitted && !errorMessage) || sequenceIsEditable }) })] })] }) })) : (jsx(Table, { size: "small", sx: { mt: 2 }, children: jsxs(TableBody, { children: [jsxs(TableRow, { children: [jsx(TableCell, { style: { borderBottomWidth: 0 }, children: jsxs(Box, { display: "flex", alignItems: "center", children: [jsx("span", { children: "FASTA" }), jsx(Tooltip, { title: "Remote FASTA input must be compressed with bgzip and indexed with samtools faidx (or equivalent)", children: jsx(IconButton, { size: "small", children: jsx(InfoIcon, { sx: { fontSize: 18 } }) }) })] }) }), jsx(TableCell, { style: { borderBottomWidth: 0 }, children: jsx(TextField, { "data-testid": "fasta-input-url", variant: "outlined", value: fastaUrl, error: !validFastaUrl, onChange: (e) => {
                                                                                const { value } = e.target;
                                                                                setFastaUrl(value);
                                                                                setFastaIndexUrl(value ? `${value}.fai` : '');
                                                                                setFastaGziIndexUrl(value ? `${value}.gzi` : '');
                                                                            }, disabled: submitted && !errorMessage, slotProps: {
                                                                                input: {
                                                                                    startAdornment: (jsx(InputAdornment, { position: "start", children: jsx(LinkIcon, {}) })),
                                                                                },
                                                                            } }) })] }), jsxs(TableRow, { children: [jsx(TableCell, { style: { borderBottomWidth: 0 }, children: "FASTA index (.fai)" }), jsx(TableCell, { style: { borderBottomWidth: 0 }, children: jsx(TextField, { "data-testid": "fai-input-url", variant: "outlined", value: fastaIndexUrl, error: !validFastaIndexUrl, onChange: (e) => {
                                                                                setFastaIndexUrl(e.target.value);
                                                                            }, disabled: submitted && !errorMessage, slotProps: {
                                                                                input: {
                                                                                    startAdornment: (jsx(InputAdornment, { position: "start", children: jsx(LinkIcon, {}) })),
                                                                                },
                                                                            } }) })] }), jsxs(TableRow, { children: [jsx(TableCell, { style: { borderBottomWidth: 0 }, children: "FASTA binary index (.gzi)" }), jsx(TableCell, { style: { borderBottomWidth: 0 }, children: jsx(TextField, { "data-testid": "gzi-input-url", variant: "outlined", value: fastaGziIndexUrl, error: !validFastaGziIndexUrl, onChange: (e) => {
                                                                                setFastaGziIndexUrl(e.target.value);
                                                                            }, disabled: submitted && !errorMessage, slotProps: {
                                                                                input: {
                                                                                    startAdornment: (jsx(InputAdornment, { position: "start", children: jsx(LinkIcon, {}) })),
                                                                                },
                                                                            } }) })] })] }) }))] }) })] }), jsxs(Accordion, { disableGutters: true, elevation: 0, square: true, className: classes.accordion, expanded: expanded === 'panelGffInput', onChange: handleAccordionChange('panelGffInput'), children: [jsx(AccordionSummary, { className: classes.accordionSummary, expandIcon: expanded === 'panelGffInput' ? (jsx(RadioButtonCheckedIcon, { className: classes.radioIcon, sx: { fontSize: '1.2rem', ml: 5 } })) : (jsx(RadioButtonUncheckedIcon, { className: classes.radioIcon, sx: { fontSize: '1.2rem', mr: 5 } })), "aria-controls": "panelGffInputd-content", children: jsxs(Typography, { component: "span", children: ["GFF3 input", jsx(Tooltip, { title: "GFF3 must includes FASTA sequences. File can be gzip compressed.", children: jsx(InfoIcon, { className: classes.radioIcon, sx: { fontSize: 18 } }) })] }) }), jsx(AccordionDetails, { className: classes.accordionDetails, children: jsxs(Box, { style: { marginTop: 20 }, children: [jsx("input", { "data-testid": "gff3-input-file", type: "file", disabled: submitted && !errorMessage, onChange: (e) => {
                                                        const file = e.target.files?.item(0);
                                                        if (file) {
                                                            setFastaFile(file);
                                                            setFileType(FileType.GFF3);
                                                            if (file.name.endsWith('.gz')) {
                                                                setGff3GzipChecked(true);
                                                            }
                                                        }
                                                    } }), jsxs(FormGroup, { style: { display: 'grid' }, children: [jsx(FormControlLabel, { control: jsx(Checkbox, { checked: importFeatures, onChange: () => {
                                                                    setImportFeatures(!importFeatures);
                                                                }, disabled: submitted && !errorMessage }), label: "Load features from GFF3 file" }), jsx(FormControlLabel, { label: "Strict parsing", disabled: !importFeatures || (submitted && !errorMessage), control: jsx(Checkbox, { checked: strict, onChange: (e) => {
                                                                    setStrict(e.target.checked);
                                                                } }) }), jsx(FormHelperText, { children: "Don't import any features if any lines in the GFF3 are unable to be processed" }), jsx(FormControlLabel, { "data-testid": "gff3-is-gzip-checkbox", control: jsx(Checkbox, { checked: gff3GzipChecked, onChange: () => {
                                                                    setGff3GzipChecked(!gff3GzipChecked);
                                                                }, disabled: submitted && !errorMessage }), label: "GFF3 is gzip compressed" })] })] }) })] })] }), jsxs(DialogActions, { children: [jsx(Button, { disabled: !checkSumbission(validAsm, sequenceIsEditable, fileType, fastaFile, fastaIndexFile, fastaGziIndexFile, validFastaUrl, validFastaIndexUrl, validFastaGziIndexUrl) || submitted, variant: "contained", type: "submit", "data-testid": "submit-button", children: submitted ? 'Submitting...' : 'Submit' }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

const columns$1 = [
    {
        field: 'name',
        headerName: 'Assembly Name',
        width: 150,
        editable: false,
    },
    {
        field: 'aliases',
        headerName: 'Aliases',
        width: 300,
        editable: true,
    },
];
function AddAssemblyAliases({ changeManager, handleClose, session, }) {
    const { apolloDataStore } = session;
    const { collaborationServerDriver } = apolloDataStore;
    const assemblies = collaborationServerDriver.getAssemblies();
    const rows = assemblies.map((assembly) => {
        return {
            id: assembly.name,
            name: assembly.displayName,
            aliases: assembly.aliases.join(', '),
        };
    });
    const [errorMessage, setErrorMessage] = React.useState('');
    const processRowUpdate = (newRow, _oldRow) => {
        const change = new AddAssemblyAliasesChange({
            typeName: 'AddAssemblyAliasesChange',
            assembly: newRow.id,
            aliases: newRow.aliases.split(','),
        });
        void changeManager.submit(change).catch(() => {
            setErrorMessage('Error submitting change');
        });
        handleClose();
        return newRow;
    };
    return (jsxs(Dialog, { open: true, title: "Add assembly aliases", handleClose: handleClose, maxWidth: 'sm', "data-testid": "add-assembly-alias", fullWidth: true, children: [jsx(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: jsx(Box, { sx: { height: 400, width: '100%' }, children: jsx(DataGrid, { rows: rows, columns: columns$1, initialState: {
                            pagination: {
                                paginationModel: {
                                    pageSize: 5,
                                },
                            },
                        }, pageSizeOptions: [5], processRowUpdate: processRowUpdate, disableRowSelectionOnClick: true }) }) }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

/** set of words that should be ignored by fulltext indexing */
const genericEnglishStopwords = new Set([
    'i',
    'me',
    'my',
    'myself',
    'we',
    'our',
    'ours',
    'ourselves',
    'you',
    'your',
    'yours',
    'yourself',
    'yourselves',
    'he',
    'him',
    'his',
    'himself',
    'she',
    'her',
    'hers',
    'herself',
    'it',
    'its',
    'itself',
    'they',
    'them',
    'their',
    'theirs',
    'themselves',
    'what',
    'which',
    'who',
    'whom',
    'this',
    'that',
    'these',
    'those',
    'am',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'having',
    'do',
    'does',
    'did',
    'doing',
    'a',
    'an',
    'the',
    'and',
    'but',
    'if',
    'or',
    'because',
    'as',
    'until',
    'while',
    'of',
    'at',
    'by',
    'for',
    'with',
    'about',
    'against',
    'between',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'to',
    'from',
    'up',
    'down',
    'in',
    'out',
    'on',
    'off',
    'over',
    'under',
    'again',
    'further',
    'then',
    'once',
    'here',
    'there',
    'when',
    'where',
    'why',
    'how',
    'all',
    'any',
    'both',
    'each',
    'few',
    'more',
    'most',
    'other',
    'some',
    'such',
    'no',
    'nor',
    'not',
    'only',
    'own',
    'same',
    'so',
    'than',
    'too',
    'very',
    's',
    't',
    'can',
    'will',
    'just',
    'don',
    'should',
    'now',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
]);
/**
 * The set of stopwords we use for fulltext indexing. Currently
 * just generic English stopwords, but will likely be expanded over time.
 */
const stopwords = genericEnglishStopwords;

/**
 * This file contains stuff dealing with IRI prefixes used in ontologies.
 *
 * ```
 * const prefixes = new Map(['GO:', 'http://long.url/GO_'])
 *
 * applyPrefixes('http://long.url/GO_1234345') // returns 'GO:1234345'
 *
 * expandPrefixes('GO:1234345') // returns 'http://long.url/GO_1234345'
 * ```
 */
/**
 * compact the given URI using the given prefixes
 */
function applyPrefixes(uri, prefixes) {
    for (const [prefix, uriBase] of prefixes.entries()) {
        if (uri.startsWith(uriBase)) {
            return uri.replace(uriBase, String(prefix));
        }
    }
    return uri;
}
/**
 * expand the given compacted URI using given prefixes
 */
function expandPrefixes(uri, prefixes) {
    for (const [prefix, uriBase] of prefixes.entries()) {
        if (uri.startsWith(String(prefix))) {
            return uri.replace(String(prefix), uriBase);
        }
    }
    return uri;
}

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// jsonpath triggers this rule for some reason. import { query } from 'jsonpath' does not work
/** special value of jsonPath that gets the IRI (that is, ID) of the node with the configured prefixes applied */
const PREFIXED_ID_PATH = '$PREFIXED_ID';
/** small wrapper for jsonpath.query that intercepts requests for the special prefixed ID path */
function jsonPathQuery(node, path, prefixes) {
    if (path === PREFIXED_ID_PATH) {
        return [applyPrefixes(node.id, prefixes)];
    }
    let response;
    try {
        response = jsonpath.query(node, path);
    }
    catch {
        // eslint-disable-next-line unicorn/prefer-structured-clone
        response = jsonpath.query(JSON.parse(JSON.stringify(node)), path);
    }
    return response;
}
function wordsInString(str) {
    return str
        .toLowerCase()
        .split(/[^\d:A-Za-z]+/)
        .filter((word) => word && !stopwords.has(word));
}
/**
 * recursively get the indexable words from an iterator
 * of any objects
 **/
function* extractWords(strings) {
    for (const str of strings) {
        yield* wordsInString(str);
    }
}
function* extractStrings(things) {
    for (const thing of things) {
        if (typeof thing === 'string') {
            yield thing;
        }
        else if (typeof thing === 'object') {
            const members = jsonpath.query(thing, '$..*');
            yield* extractStrings(members);
        }
    }
}
/** @returns generator of tuples of [jsonpath, word] */
function* getWords(node, jsonPaths, prefixes) {
    for (const path of jsonPaths) {
        const queryResult = jsonPathQuery(node, path, prefixes);
        if (queryResult.length > 0) {
            for (const word of extractWords(extractStrings(queryResult))) {
                yield [path, word];
            }
        }
    }
}
/**
 *
 **/
async function textSearch(text, tx, signal) {
    const db = await this.db;
    const myTx = tx ?? db.transaction(['nodes']);
    checkAbortSignal(signal);
    const queryWords = [...wordsInString(text)];
    const queries = [];
    /**
     * Build a structure of which terms match which words.
     * This is a Map of term.id -\> Set\<query word number\>
     **/
    const initialMatches = new Map();
    // find startsWith and complete matches
    queries.push(...queryWords.map(async (queryWord, queryWordIndex) => {
        checkAbortSignal(signal);
        const idx = myTx.objectStore('nodes').index('full-text-words');
        for await (const cursor of idx.iterate(IDBKeyRange.bound(queryWord, `${queryWord}\uFFFF`, false, false))) {
            checkAbortSignal(signal);
            const term = cursor.value;
            const termMatches = initialMatches.get(term.id) ?? [
                term,
                new Set(),
            ];
            termMatches[1].add(queryWordIndex);
            initialMatches.set(term.id, termMatches);
        }
    }));
    await Promise.all(queries);
    checkAbortSignal(signal);
    // now rank the term matches and add some detail
    const results = [];
    for (const [, [term, wordIndexes]] of initialMatches) {
        checkAbortSignal(signal);
        results.push(...elaborateMatch(this.textIndexFields, term, wordIndexes, queryWords, this.prefixes));
    }
    // sort the terms by score descending
    results.sort((a, b) => b.score - a.score);
    // truncate if necessary
    return results.slice(0, this.options.maxSearchResults ?? this.DEFAULT_MAX_SEARCH_RESULTS);
}
function elaborateMatch(textIndexPaths, term, queryWordIndexes, queryWords, prefixes) {
    const sortedWordIndexes = [...queryWordIndexes].sort();
    const matchedQueryWords = sortedWordIndexes.map((i) => queryWords[i]);
    const queryWordRegexps = matchedQueryWords.map((queryWord) => {
        const escaped = queryWord.replaceAll(/[$()*+./?[\\\]^{|}-]/g, String.raw `\$&`);
        return new RegExp(`\\b${escaped}`, 'gi');
    });
    // const needle = matchedQueryWords.join(' ')
    // ranking weights that can be tweaked if you know what you're doing
    const FIELD_PRIORITY_WEIGHT = 1;
    const MATCH_WORDS_CLOSENESS_WEIGHT = 0.05;
    const MATCH_ADJACENCY_BONUS = 1;
    const MATCH_RIGHT_ORDER_BONUS = 1;
    const MATCH_LENGTH_WEIGHT = 0.01;
    const PCT_OF_STRING_WEIGHT = 0.05;
    const WORD_BONUS = 100; // bonus for each of the words matched
    let matches = [];
    let maxScore = 0;
    for (const [fieldIdx, field] of textIndexPaths.entries()) {
        const wordsMatched = new Set();
        const fieldPriorityBonus = textIndexPaths.length - fieldIdx - 1;
        const termStrings = [
            ...extractStrings(jsonPathQuery(term, field.jsonPath, prefixes)),
        ];
        // find occurrences of each of the words in the strings
        for (const str of termStrings) {
            let score = 0;
            const wordMatches = [];
            for (const [wordIndex, re] of queryWordRegexps.entries()) {
                for (const match of str.matchAll(re)) {
                    score += 1 + fieldPriorityBonus * FIELD_PRIORITY_WEIGHT;
                    wordsMatched.add(wordIndex);
                    const position = match.index;
                    const queryWord = queryWords[wordIndex];
                    if (position !== undefined) {
                        score += queryWord.length * MATCH_LENGTH_WEIGHT;
                        score +=
                            (queryWord.length / str.length) * 100 * PCT_OF_STRING_WEIGHT;
                        wordMatches.push({ wordIndex, position });
                    }
                }
            }
            // apply the words-matched bonus
            score += wordsMatched.size * WORD_BONUS;
            if (maxScore < score) {
                maxScore = score;
            }
            // sort the word matches by position in the target string ascending
            wordMatches.sort((a, b) => a.position - b.position);
            if (wordMatches.length > 0) {
                matches.push({ term, field, str, score, wordMatches });
            }
        }
    }
    // Keep only the highest-scored matches. Usually 1, but there
    // could be multiple if there is a tie for first place.
    matches = matches.filter((m) => m.score === maxScore);
    for (const match of matches) {
        const { wordMatches } = match;
        // re-examine the word order and spacing to give bonuses for the
        // right order and close spacing
        for (let i = 0; i < wordMatches.length - 1; i++) {
            // bonus for pairs with adjacent word indexes and close spacing
            const m1 = wordMatches[i];
            const m2 = wordMatches[i + 1];
            const wdiff = m2.wordIndex - m1.wordIndex;
            if (wdiff === 1 || wdiff === -1) {
                // they are adjacent, bonus
                match.score += MATCH_ADJACENCY_BONUS;
                if (wdiff === 1) {
                    // they are in the right order, bonus
                    match.score += MATCH_RIGHT_ORDER_BONUS;
                }
                // give additional bonus for how close they are
                const spacing = Math.abs(m2.position -
                    (m1.position + matchedQueryWords[m1.wordIndex].length)) - 1;
                match.score -= spacing * MATCH_WORDS_CLOSENESS_WEIGHT;
            }
        }
    }
    return matches;
}

function isOntologyDBNode(node) {
    return typeof node.id === 'string';
}
function isOntologyDBEdge(edge) {
    return (typeof edge.sub === 'string' &&
        typeof edge.pred === 'string' &&
        typeof edge.obj === 'string');
}
function isDeprecated(thing) {
    return Boolean(thing.meta?.deprecated);
}

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/** schema version we are currently on, used for the IndexedDB schema open call */
const schemaVersion = 2;
/** open the IndexedDB and create the DB schema if necessary */
async function openDatabase(dbName) {
    // await deleteDB(dbName) // uncomment this to reload every time during development
    return openDB(dbName, schemaVersion, {
        upgrade(database, oldVersion, newVersion, transaction, _event) {
            if (oldVersion < schemaVersion) {
                if (database.objectStoreNames.contains('meta')) {
                    database.deleteObjectStore('meta');
                }
                if (database.objectStoreNames.contains('nodes')) {
                    database.deleteObjectStore('nodes');
                }
                if (database.objectStoreNames.contains('edges')) {
                    database.deleteObjectStore('edges');
                }
            }
            if (!database.objectStoreNames.contains('meta')) {
                database.createObjectStore('meta');
            }
            if (!database.objectStoreNames.contains('nodes')) {
                database.createObjectStore('nodes', { keyPath: 'id' });
                const nodes = transaction.objectStore('nodes');
                nodes.createIndex('by-label', 'lbl');
                nodes.createIndex('by-type', 'type');
                nodes.createIndex('by-synonym', ['meta', 'synonyms', 'val']);
                nodes.createIndex('full-text-words', 'fullTextWords', {
                    multiEntry: true,
                });
            }
            if (!database.objectStoreNames.contains('edges')) {
                database.createObjectStore('edges', { autoIncrement: true });
                const edges = transaction.objectStore('edges');
                edges.createIndex('by-subject', 'sub');
                edges.createIndex('by-object', 'obj');
                edges.createIndex('by-predicate', 'pred');
            }
        },
    });
}
/** serialize all our words in the DB node so they can be indexed */
function serializeWords(foundWords) {
    const allWords = new Set();
    for (const [, word] of foundWords) {
        allWords.add(word);
    }
    return [...allWords];
}
/** load a OBO Graph JSON file into a database */
async function loadOboGraphJson(db) {
    const startTime = Date.now();
    let percentProgress = 1;
    this.options.update?.('Parsing JSON', percentProgress);
    // TODO: using file streaming along with an event-based json parser
    // instead of JSON.parse and .readFile could probably make this faster
    // and less memory intensive
    let oboGraph;
    try {
        oboGraph = JSON.parse(await openLocation(this.sourceLocation).readFile('utf8'));
    }
    catch {
        throw new Error('Error in loading ontology');
    }
    percentProgress += 5;
    this.options.update?.('Parsing JSON complete', percentProgress);
    const parseTime = Date.now();
    const [graph, ...additionalGraphs] = oboGraph.graphs ?? [];
    if (!graph) {
        return;
    }
    if (additionalGraphs.length > 0) {
        throw new Error('multiple graphs not supported');
    }
    try {
        const tx = db.transaction(['meta', 'nodes', 'edges'], 'readwrite');
        await tx.objectStore('meta').clear();
        await tx.objectStore('nodes').clear();
        await tx.objectStore('edges').clear();
        // load nodes
        const nodeStore = tx.objectStore('nodes');
        const fullTextIndexPaths = getTextIndexFields
            .call(this)
            .map((def) => def.jsonPath);
        if (graph.nodes) {
            let lastProgress = Math.round(percentProgress);
            for (const [, node] of graph.nodes.entries()) {
                percentProgress += 64 * (1 / graph.nodes.length);
                if (Math.round(percentProgress) != lastProgress &&
                    percentProgress < 100) {
                    this.options.update?.('Processing nodes', percentProgress);
                    lastProgress = Math.round(percentProgress);
                }
                if (isOntologyDBNode(node)) {
                    await nodeStore.add({
                        ...node,
                        fullTextWords: serializeWords(getWords(node, fullTextIndexPaths, this.prefixes)),
                    });
                }
            }
        }
        // load edges
        const edgeStore = tx.objectStore('edges');
        if (graph.edges) {
            let lastProgress = Math.round(percentProgress);
            for (const [, edge] of graph.edges.entries()) {
                percentProgress += 30 * (1 / graph.edges.length);
                if (Math.round(percentProgress) != lastProgress &&
                    percentProgress < 100) {
                    this.options.update?.('Processing edges', percentProgress);
                    lastProgress = Math.round(percentProgress);
                }
                if (isOntologyDBEdge(edge)) {
                    await edgeStore.add(edge);
                }
            }
        }
        await tx.done;
        // record some metadata about this ontology and load operation
        const tx2 = db.transaction('meta', 'readwrite');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const { update, ...otherOptions } = this.options;
        await tx2.objectStore('meta').add({
            ontologyRecord: {
                name: this.ontologyName,
                version: this.ontologyVersion,
                sourceLocation: this.sourceLocation,
            },
            storeOptions: otherOptions,
            graphMeta: graph.meta,
            timestamp: String(new Date()),
            schemaVersion,
            timings: {
                overall: Date.now() - startTime,
                load: Date.now() - parseTime,
            },
        }, 'meta');
        await tx2.done;
    }
    catch (error) {
        await db.transaction('meta', 'readwrite').objectStore('meta').clear();
        throw error;
    }
    return;
}
function getTextIndexFields() {
    return [
        { displayName: 'ID', jsonPath: PREFIXED_ID_PATH },
        ...(this.options.textIndexing?.indexFields ?? defaultTextIndexFields),
    ];
}
async function isDatabaseCurrent(db) {
    // since metadata is loaded last, we use it as a signal that all the other data
    // was loaded
    const [meta] = await db.transaction('meta').objectStore('meta').getAll();
    if (!meta) {
        return false;
    }
    // check that the index paths and prefixes are the same as our current ones
    return (equal(this.options.prefixes, meta.storeOptions.prefixes) &&
        equal(this.options.textIndexing, meta.storeOptions.textIndexing));
}

/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable unicorn/no-await-expression-member */
async function arrayFromAsync(iter) {
    const a = [];
    for await (const i of iter) {
        a.push(i);
    }
    return a;
}
/** query interface for a specific ontology */
class OntologyStore {
    ontologyName;
    ontologyVersion;
    sourceLocation;
    db;
    options;
    loadOboGraphJson = loadOboGraphJson;
    getTermsByFulltext = textSearch;
    openDatabase = openDatabase;
    isDatabaseCurrent = isDatabaseCurrent;
    get textIndexFields() {
        return getTextIndexFields.call(this);
    }
    get prefixes() {
        return this.options.prefixes ?? new Map();
    }
    DEFAULT_MAX_SEARCH_RESULTS = 100;
    constructor(name, version, source, options) {
        this.ontologyName = name;
        this.ontologyVersion = version;
        this.sourceLocation = source;
        this.options = options ?? {};
        this.db = this.prepareDatabase();
    }
    /**
     * check that the configuration of this ontology appears valid. Does not
     * try to do any fetches, however.
     */
    validate() {
        const errors = [];
        // validate the source's file type
        const { sourceLocation, sourceType } = this;
        if (!sourceType) {
            errors.push(new Error(`unable to determine format of ontology source file ${JSON.stringify(sourceLocation)}, file name must end with ".json", ".obo", or ".owl"`));
        }
        else if (sourceType !== 'obo-graph-json') {
            errors.push(new Error(`ontology source file ${JSON.stringify(sourceLocation)} has type ${sourceType}, which is not yet supported`));
        }
        return errors;
    }
    get sourceType() {
        if (isUriLocation(this.sourceLocation)) {
            if (this.sourceLocation.uri.endsWith('.json')) {
                return 'obo-graph-json';
            }
        }
        else if (isLocalPathLocation(this.sourceLocation) &&
            this.sourceLocation.localPath.endsWith('.json')) {
            return 'obo-graph-json';
        }
        return undefined;
    }
    /** base name of the IndexedDB database for this ontology */
    get dbName() {
        return `Apollo Ontology "${this.ontologyName}" "${this.ontologyVersion}"`;
    }
    async prepareDatabase() {
        const errors = this.validate();
        if (errors.length > 0) {
            throw errors;
        }
        const db = await this.openDatabase(this.dbName);
        // if database is already completely loaded, just return it
        if (await this.isDatabaseCurrent(db)) {
            return db;
        }
        try {
            const { options, sourceLocation, sourceType } = this;
            if (sourceType === 'obo-graph-json') {
                options.update?.('', 0);
                // add more updates inside `loadOboGraphJson`
                await this.loadOboGraphJson(db);
                options.update?.('', 100);
            }
            else {
                throw new Error(`ontology source file ${JSON.stringify(sourceLocation)} has type ${sourceType}, which is not yet supported`);
            }
            return db;
        }
        catch (error) {
            db.close();
            await deleteDB(this.dbName);
            throw error;
        }
    }
    async termCount(tx) {
        const db = await this.db;
        const myTx = tx ?? db.transaction('nodes');
        return myTx.objectStore('nodes').count();
    }
    unique(nodes) {
        const seen = new Map();
        const result = [];
        for (const node of nodes) {
            if (!seen.has(node.id)) {
                seen.set(node.id, true);
                result.push(node);
            }
        }
        return result;
    }
    async getTermsWithLabelOrSynonym(termLabelOrSynonym, options, tx) {
        const includeSubclasses = options?.includeSubclasses ?? true;
        const db = await this.db;
        const myTx = tx ?? db.transaction(['nodes', 'edges']);
        const nodes = myTx.objectStore('nodes');
        const resultNodes = [
            ...(await nodes.index('by-label').getAll(termLabelOrSynonym)),
            ...(await nodes.index('by-synonym').getAll(termLabelOrSynonym)),
        ];
        if (includeSubclasses) {
            // now recursively traverse is_a relations to gather nodes that are subclasses any of these
            const subclassIds = await this.recurseEdges('by-object', resultNodes.map((n) => n.id), (edge) => edge.pred === 'is_a', 'sub', myTx);
            for (const nodeId of subclassIds) {
                const node = await nodes.get(nodeId);
                if (node) {
                    resultNodes.push(node);
                }
            }
        }
        return resultNodes;
    }
    /**
     * Get the ontology term for the property with the given label,
     * plus all the terms for the properties that are "subPropertyOf"
     * that property.
     *
     * If there is more than one property with that label, treats it as
     * equivalent and just returns all the properties and their subproperties.
     *
     * options.includeSubProperties default is true
     */
    async getPropertiesByLabel(propertyLabel, options, tx) {
        const includeSubProperties = options?.includeSubProperties ?? true;
        const db = await this.db;
        const myTx = tx ?? db.transaction(['nodes', 'edges']);
        const terms = await this.getTermsWithLabelOrSynonym(propertyLabel, { includeSubclasses: false }, myTx);
        const properties = terms.filter((p) => isOntologyProperty(p));
        if (includeSubProperties) {
            const subPropertyIds = await this.recurseEdges('by-object', properties.map((p) => p.id), (edge) => edge.pred === 'subPropertyOf', 'sub', myTx);
            const nodes = myTx.objectStore('nodes');
            for (const subPropertyId of subPropertyIds) {
                const property = await nodes.get(subPropertyId);
                if (property && isOntologyProperty(property)) {
                    properties.push(property);
                }
            }
        }
        return properties;
    }
    /** private helper for traversing the edges of the ontology graph. Does a breadth-first search of the graph */
    async recurseEdges(queryIndex, inputQueryIds, filterEdge, resultProp, myTx) {
        const resultIds = new Set();
        async function recur(queryIds) {
            await Promise.all([...queryIds].map(async (queryId) => {
                const theseResults = (await myTx.objectStore('edges').index(queryIndex).getAll(queryId))
                    .filter((element) => filterEdge(element))
                    .map((edge) => edge[resultProp]);
                if (theseResults.length > 0) {
                    // report these subjects as results
                    for (const resultId of theseResults) {
                        resultIds.add(resultId);
                    }
                    // and now recurse further through the edges
                    await recur(theseResults);
                }
            }));
        }
        await recur(inputQueryIds);
        return resultIds.values();
    }
    /**
     * given an array of node IDs, augment it with all of their subclasses or
     * superclasses, and return the augmented array
     **/
    async *expandNodeSet(startingNodeIds, subclassRelation = 'is_a', direction, tx) {
        const db = await this.db;
        const myTx = tx ?? db.transaction(['edges']);
        const startingNodes = [...startingNodeIds];
        const subclassIds = await this.recurseEdges(direction === 'subclasses' ? 'by-object' : 'by-subject', startingNodes, (edge) => edge.pred === subclassRelation, direction === 'subclasses' ? 'sub' : 'obj', myTx);
        for (const n of startingNodes) {
            yield n;
        }
        for (const id of subclassIds) {
            yield id;
        }
    }
    /**
     * given an iterator of node IDs, return a new iterator of those nodes plus all of their subclasses
     */
    expandSubclasses(startingNodeIds, subclassRelation = 'is_a', tx) {
        return this.expandNodeSet(startingNodeIds, subclassRelation, 'subclasses', tx);
    }
    /**
     * given an iterator of node IDs, return a new iterator of those nodes plus all of their superclasses
     */
    expandSuperclasses(startingNodeIds, subclassRelation = 'is_a', tx) {
        return this.expandNodeSet(startingNodeIds, subclassRelation, 'superclasses', tx);
    }
    /**
     * example: for the Sequence Ontology, store.getTermsThat('part_of', [geneTerm])
     * would return all terms that are part_of, member_of, or integral_part_of a gene
     */
    async getClassesThat(propertyLabel, targetTerms, tx) {
        const db = await this.db;
        const myTx = tx ?? db.transaction(['nodes', 'edges']);
        // find all the terms for the properties we are using
        const relatingProperties = await this.getPropertiesByLabel(propertyLabel, { includeSubProperties: true }, myTx);
        const relatingPropertyIds = new Set(relatingProperties.map((p) => p.id));
        // expand to search all the superclasses of the target terms
        const targetTermsWithSuperClasses = await arrayFromAsync(this.expandSuperclasses(targetTerms.map((t) => t.id), 'is_a', myTx));
        // these are all the terms that are related to the targets by the given properties
        const termIds = await this.recurseEdges('by-object', targetTermsWithSuperClasses, (edge) => relatingPropertyIds.has(edge.pred), 'sub', myTx);
        // expand to include all the subclasses of those terms
        const expanded = this.expandSubclasses(termIds, 'is_a', myTx);
        // fetch the full nodes and filter out deprecated ones
        const terms = [];
        for await (const termId of expanded) {
            const node = await myTx.objectStore('nodes').get(termId);
            if (node && isOntologyClass(node) && !isDeprecated(node)) {
                terms.push(node);
            }
        }
        return terms;
    }
    async getClassesWithoutPropertyLabeled(propertyLabel, options, tx) {
        const db = await this.db;
        const myTx = tx ?? db.transaction(['nodes', 'edges']);
        const nodeStore = myTx.objectStore('nodes');
        const edgeStore = myTx.objectStore('edges');
        // find all the terms (synonyms, subterms, etc) for the properties we are using
        const relatingProperties = await this.getPropertiesByLabel(propertyLabel, options, myTx);
        const relatingPropertyIds = relatingProperties.map((p) => p.id);
        // make a blacklist of all the term IDs that have those properties, plus their subclasses
        const termIdsWithProperties = await (async () => {
            const ids = new Set();
            for (const propertyId of relatingPropertyIds) {
                for await (const cursor of edgeStore
                    .index('by-predicate')
                    .iterate(propertyId)) {
                    ids.add(cursor.value.sub);
                }
            }
            // expand their subclasses
            const expanded = new Set();
            for await (const id of this.expandSubclasses(ids, 'is_a', myTx)) {
                expanded.add(id);
            }
            return expanded;
        })();
        // iterate through all terms in the store, find ones that are CLASS
        // and are not in the blacklist
        const termIds = [];
        for await (const cursor of nodeStore) {
            const node = cursor.value;
            if (isOntologyClass(node) && !termIdsWithProperties.has(node.id)) {
                termIds.push(node.id);
            }
        }
        // fetch the full nodes and filter out deprecated ones
        const terms = [];
        for (const termId of termIds) {
            const node = await myTx.objectStore('nodes').get(termId);
            if (node && isOntologyClass(node) && !isDeprecated(node)) {
                terms.push(node);
            }
        }
        return terms;
    }
    async getAllClasses(tx) {
        const db = await this.db;
        const myTx = tx ?? db.transaction(['nodes']);
        const all = (await myTx
            .objectStore('nodes')
            .index('by-type')
            .getAll('CLASS'));
        return all.filter((term) => !isDeprecated(term));
    }
    async getAllTerms(tx) {
        const db = await this.db;
        const myTx = tx ?? db.transaction(['nodes']);
        const all = await myTx.objectStore('nodes').getAll();
        return all.filter((term) => !isDeprecated(term));
    }
}

const OntologyRecordType = types
    .model('OntologyRecord', {
    name: types.string,
    version: 'unversioned',
    source: types.union(LocalPathLocation, UriLocation, BlobLocation),
    options: types.frozen(),
    equivalentTypes: types.map(types.array(types.string)),
})
    .volatile((_self) => ({
    dataStore: undefined,
    startedEquivalentTypeRequests: new Set(),
}))
    .actions((self) => ({
    /** does nothing, just used to access the model to force its lifecycle hooks to run */
    ping() {
        return;
    },
    initDataStore() {
        self.dataStore = new OntologyStore(self.name, self.version, getSnapshot(self.source), self.options);
    },
    afterCreate() {
        addDisposer(self, autorun(() => {
            this.initDataStore();
        }));
    },
    setEquivalentTypes(type, equivalentTypes) {
        self.equivalentTypes.set(type, equivalentTypes);
    },
}))
    .actions((self) => ({
    loadEquivalentTypes: flow(function* loadEquivalentTypes(type) {
        if (!self.dataStore) {
            return;
        }
        if (self.startedEquivalentTypeRequests.has(type)) {
            return;
        }
        self.startedEquivalentTypeRequests.add(type);
        const terms = (yield self.dataStore.getTermsWithLabelOrSynonym(type));
        const equivalents = terms
            .map((term) => term.lbl)
            .filter((term) => term != undefined);
        if (isAlive(self)) {
            self.setEquivalentTypes(type, equivalents);
        }
    }),
}))
    .actions((self) => ({
    afterCreate() {
        autorun((reaction) => {
            if (!self.dataStore) {
                return;
            }
            void self.loadEquivalentTypes('gene');
            void self.loadEquivalentTypes('pseudogene');
            void self.loadEquivalentTypes('transcript');
            void self.loadEquivalentTypes('pseudogenic_transcript');
            void self.loadEquivalentTypes('CDS');
            void self.loadEquivalentTypes('mRNA');
            reaction.dispose();
        });
    },
    setEquivalentTypes(type, equivalentTypes) {
        self.equivalentTypes.set(type, equivalentTypes);
    },
}))
    .views((self) => ({
    isTypeOf(queryType, typeOf) {
        if (queryType === typeOf) {
            return true;
        }
        if (!self.dataStore) {
            return false;
        }
        const equivalents = self.equivalentTypes.get(typeOf);
        if (!equivalents) {
            void self.loadEquivalentTypes(typeOf);
            return false;
        }
        return equivalents.includes(queryType);
    },
}));
const OntologyManagerType = types
    .model('OntologyManager', {
    // create, update, and delete ontologies
    ontologies: types.array(OntologyRecordType),
    prefixes: types.optional(types.map(types.string), {
        'GO:': 'http://purl.obolibrary.org/obo/GO_',
        'SO:': 'http://purl.obolibrary.org/obo/SO_',
    }),
})
    .views((self) => ({
    get featureTypeOntologyName() {
        const jbConfig = getRoot(self).jbrowse
            .configuration;
        const pluginConfiguration = jbConfig.ApolloPlugin;
        const featureTypeOntologyName = readConfObject(pluginConfiguration, 'featureTypeOntologyName');
        return featureTypeOntologyName;
    },
}))
    .views((self) => ({
    /**
     * gets the OntologyRecord for the ontology we should be
     * using for feature types (e.g. SO or maybe biotypes)
     **/
    get featureTypeOntology() {
        return this.findOntology(self.featureTypeOntologyName);
    },
    findOntology(name, version) {
        return self.ontologies.find((record) => {
            return (record.name === name &&
                (version === undefined || record.version === version));
        });
    },
    openOntology(name, version) {
        return this.findOntology(name, version)?.dataStore;
    },
    /**
     * compact the given URI using the currently configured
     * prefixes
     */
    applyPrefixes(uri) {
        return applyPrefixes(uri, self.prefixes);
    },
    /**
     * expand the given compacted URI using the currently
     * configured prefixes
     */
    expandPrefixes(uri) {
        return expandPrefixes(uri, self.prefixes);
    },
}))
    .actions((self) => ({
    addOntology(name, version, source, options) {
        const newlen = self.ontologies.push({
            name,
            version,
            source,
            options: { prefixes: new Map(self.prefixes.entries()), ...options },
        });
        // access it immediately to fire its lifecycle hooks
        // (see https://github.com/mobxjs/mobx-state-tree/issues/1665)
        self.ontologies[newlen - 1].ping();
    },
}));
const defaultTextIndexFields = [
    { displayName: 'Label', jsonPath: '$.lbl' },
    { displayName: 'Synonym', jsonPath: '$.meta.synonyms[*].val' },
    { displayName: 'Definition', jsonPath: '$.meta.definition.val' },
];
const OntologyRecordConfiguration = ConfigurationSchema('OntologyRecord', {
    name: {
        type: 'string',
        description: 'the full name of the ontology, e.g. "Gene Ontology"',
        defaultValue: 'My Ontology',
    },
    version: {
        type: 'string',
        description: "the ontology's version string",
        defaultValue: 'unversioned',
    },
    source: {
        type: 'fileLocation',
        description: "the download location for the ontology's source file",
        defaultValue: {
            locationType: 'UriLocation',
            uri: 'http://example.com/myontology.json',
        },
    },
    textIndexFields: {
        type: 'frozen',
        description: 'JSON paths for text fields that will be indexed for text searching',
        defaultValue: defaultTextIndexFields,
    },
});
function isOntologyClass(term) {
    return term.type === 'CLASS';
}
function isOntologyProperty(term) {
    return term.type === 'PROPERTY';
}

async function fetchValidDescendantTerms(parentFeature, ontologyStore, _signal) {
    if (!parentFeature) {
        return;
    }
    // since this is a child of an existing feature, restrict the autocomplete choices to valid
    // parts of that feature
    const parentTypeTerms = await ontologyStore.getTermsWithLabelOrSynonym(parentFeature.type, { includeSubclasses: false });
    // eslint-disable-next-line unicorn/no-array-callback-reference
    const parentTypeClassTerms = parentTypeTerms.filter(isOntologyClass);
    if (parentTypeTerms.length === 0) {
        return;
    }
    const subpartTerms = await ontologyStore.getClassesThat('part_of', parentTypeClassTerms);
    if (subpartTerms.length === 0) {
        return;
    }
    return subpartTerms;
}

function OntologyTermAutocomplete({ fetchValidTerms, filterTerms: filterTermsProp, includeDeprecated, onChange, ontologyName, ontologyVersion, renderInput, session, style, value: valueString, }) {
    const [open, setOpen] = useState(false);
    const [termChoices, setTermChoices] = useState();
    const [currentOntologyTermInvalid, setCurrentOntologyTermInvalid] = useState('');
    const [currentOntologyTerm, setCurrentOntologyTerm] = useState();
    const { ontologyManager } = session.apolloDataStore;
    const ontologyStore = ontologyManager.findOntology(ontologyName, ontologyVersion)?.dataStore;
    const needToLoadTermChoices = ontologyStore && open && !termChoices;
    const needToLoadCurrentTerm = ontologyStore && !currentOntologyTerm;
    const filterTerms = useCallback((term) => 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    (includeDeprecated || !isDeprecated(term)) &&
        (!filterTermsProp || filterTermsProp(term)), [filterTermsProp, includeDeprecated]);
    // effect for matching the current value with an ontology term
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        if (needToLoadCurrentTerm) {
            getCurrentTerm(ontologyStore, valueString, filterTerms).then((term) => {
                setCurrentOntologyTermInvalid('');
                if (!signal.aborted) {
                    setCurrentOntologyTerm(term);
                }
            }, (error) => {
                if (!signal.aborted && !isAbortException(error)) {
                    setCurrentOntologyTermInvalid(String(error));
                }
            });
        }
        return () => {
            controller.abort(new DOMException('Cancel getting current term from ontology store', 'AbortError'));
        };
    }, [session, valueString, filterTerms, ontologyStore, needToLoadCurrentTerm]);
    // effect for loading term autocompletions
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        if (needToLoadTermChoices) {
            getValidTerms(ontologyStore, fetchValidTerms, filterTerms, signal).then((soTerms) => {
                if (soTerms && !signal.aborted) {
                    setTermChoices(soTerms);
                }
            }, (error) => {
                if (!signal.aborted && !isAbortException(error)) {
                    session.notify(error instanceof Error ? error.message : String(error), 'error');
                }
            });
        }
        return () => {
            controller.abort(new DOMException('Canceling getting valid terms from ontology store', 'AbortError'));
        };
    }, [
        needToLoadTermChoices,
        filterTerms,
        ontologyStore,
        session,
        fetchValidTerms,
    ]);
    const handleChange = (event, newValue) => {
        if (!newValue) {
            return;
        }
        if (typeof newValue === 'string') {
            setCurrentOntologyTerm(undefined);
            onChange(valueString, newValue);
        }
        else if (newValue.lbl !== valueString) {
            setCurrentOntologyTermInvalid('');
            setCurrentOntologyTerm(newValue);
            onChange(valueString, newValue.lbl);
        }
    };
    const extraTextFieldParams = {};
    if (currentOntologyTermInvalid) {
        extraTextFieldParams.error = true;
        extraTextFieldParams.helperText = currentOntologyTermInvalid;
    }
    return (jsx(Autocomplete, { style: style, autoComplete: true, filterSelectedOptions: true, disableClearable: true, selectOnFocus: true, clearOnBlur: true, handleHomeEndKeys: true, freeSolo: true, value: valueString, options: termChoices ?? [], onOpen: () => {
            setOpen(true);
        }, onClose: () => {
            setOpen(false);
        }, 
        // noOptionsText={valueString ? 'No matches' : 'Start typing to search'}
        loading: needToLoadTermChoices, renderInput: renderInput ??
            ((params) => jsx(TextField, { ...params, ...extraTextFieldParams })), getOptionLabel: (option) => {
            if (typeof option === 'string') {
                return option;
            }
            return option.lbl ?? '';
        }, isOptionEqualToValue: (option, val) => option.lbl === val.lbl, onChange: handleChange }));
}
async function getCurrentTerm(ontologyStore, currentTermLabel, filterTerms, _signal) {
    if (!currentTermLabel) {
        return;
    }
    // TODO: support prefixed IDs as ontology terms here (e.g. SO:001234)
    const terms = await ontologyStore.getTermsWithLabelOrSynonym(currentTermLabel, { includeSubclasses: false });
    const term = terms.find((term) => (filterTerms ?? (() => true))(term));
    if (!term) {
        throw new Error(`not a valid ${ontologyStore.ontologyName} term`);
    }
    return term;
}
async function getValidTerms(ontologyStore, fetchValidTerms, filterTerms, signal) {
    let result;
    if (fetchValidTerms) {
        const customTermList = await fetchValidTerms(ontologyStore, signal);
        if (customTermList) {
            result = customTermList;
        }
    }
    if (!result) {
        result = await ontologyStore.getAllTerms();
    }
    return filterTerms ? result.filter((element) => filterTerms(element)) : result;
}

function AddChildFeature({ changeManager, handleClose, session, sourceAssemblyId, sourceFeature, }) {
    const [end, setEnd] = useState(String(sourceFeature.max));
    const [start, setStart] = useState(String(sourceFeature.min + 1));
    const [type, setType] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [typeWarningText, setTypeWarningText] = useState('');
    async function fetchValidTerms(parentFeature, ontologyStore, _signal) {
        const terms = await fetchValidDescendantTerms(parentFeature, ontologyStore);
        if (!terms) {
            setTypeWarningText(`Type "${parentFeature?.type}" does not have any children in the ontology`);
            return;
        }
        return terms;
    }
    function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        const _id = new ObjectID().toHexString();
        const change = new AddFeatureChange({
            changedIds: [sourceFeature._id],
            typeName: 'AddFeatureChange',
            assembly: sourceAssemblyId,
            addedFeature: {
                _id,
                refSeq: sourceFeature.refSeq,
                min: Number(start) - 1,
                max: Number(end),
                type,
            },
            parentFeatureId: sourceFeature._id,
        });
        void changeManager.submit(change).then(() => {
            session.apolloSetSelectedFeature(_id);
        });
        handleClose();
        event.preventDefault();
    }
    function handleChangeType(newType) {
        setErrorMessage('');
        setType(newType);
    }
    const error = Number(end) <= Number(start);
    return (jsxs(Dialog, { open: true, title: "Add new child feature", handleClose: handleClose, maxWidth: false, "data-testid": "add-feature-dialog", children: [jsxs("form", { onSubmit: onSubmit, children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: [jsx(TextField, { margin: "dense", id: "start", label: "Start", type: "number", fullWidth: true, variant: "outlined", value: start, onChange: (e) => {
                                    setStart(e.target.value);
                                } }), jsx(TextField, { margin: "dense", id: "end", label: "End", type: "number", fullWidth: true, variant: "outlined", value: end, onChange: (e) => {
                                    setEnd(e.target.value);
                                }, error: error, helperText: error ? '"End" must be greater than "Start"' : null }), jsx(OntologyTermAutocomplete, { session: session, ontologyName: "Sequence Ontology", style: { width: 170 }, value: type, filterTerms: isOntologyClass, fetchValidTerms: fetchValidTerms.bind(null, sourceFeature), renderInput: (params) => (jsx(TextField, { ...params, label: "Type", variant: "outlined", fullWidth: true, error: Boolean(typeWarningText), helperText: typeWarningText })), onChange: (oldValue, newValue) => {
                                    if (newValue) {
                                        handleChangeType(newValue);
                                    }
                                } })] }), jsxs(DialogActions, { children: [jsx(Button, { variant: "contained", type: "submit", disabled: error || !(start && end && type), children: "Submit" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

class BackendDriver {
    clientStore;
    constructor(clientStore) {
        this.clientStore = clientStore;
    }
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
class ChangeManager {
    dataStore;
    constructor(dataStore) {
        this.dataStore = dataStore;
    }
    recentChanges = [];
    undoneChanges = [];
    async submit(change, opts = {}) {
        const { addToRecents = true, submitToBackend = true, updateJobsManager = false, } = opts;
        // pre-validate
        const session = getSession(this.dataStore);
        const controller = new AbortController();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const { jobsManager, isLocked, changeInProgress, setChangeInProgress } = getSession(this.dataStore);
        if (isLocked) {
            session.notify('Cannot submit changes in locked mode');
            setChangeInProgress(false);
            return;
        }
        if (changeInProgress) {
            session.notify('Could not submit change, there is another change still in progress');
            return;
        }
        setChangeInProgress(true);
        const job = {
            name: change.typeName,
            statusMessage: 'Pre-validating',
            progressPct: 0,
            cancelCallback: () => {
                controller.abort(new DOMException(`Cancelling change "${change.typeName}"`, 'AbortError'));
            },
        };
        if (updateJobsManager) {
            jobsManager.runJob(job);
        }
        const result = await validationRegistry.frontendPreValidate(change);
        if (!result.ok) {
            const msg = `Pre-validation failed: "${result.resultsMessages}"`;
            if (updateJobsManager) {
                jobsManager.abortJob(job.name, msg);
            }
            session.notify(msg, 'error');
            setChangeInProgress(false);
            return;
        }
        try {
            // submit to client data store
            await change.execute(this.dataStore);
        }
        catch (error) {
            if (updateJobsManager) {
                jobsManager.abortJob(job.name, String(error));
            }
            console.error(error);
            session.notify(`Error encountered in client: ${String(error)}. Data may be out of sync, please refresh the page`, 'error');
            setChangeInProgress(false);
            return;
        }
        // post-validate
        const results2 = await validationRegistry.frontendPostValidate(change, this.dataStore);
        if (!results2.ok) {
            // notify of invalid change and revert
            await this.undo(change);
        }
        if (submitToBackend) {
            if (updateJobsManager) {
                jobsManager.update(job.name, 'Submitting to driver');
            }
            // submit to driver
            const { collaborationServerDriver, getBackendDriver } = this.dataStore;
            const backendDriver = isAssemblySpecificChange(change)
                ? // for assembly-specific change, fall back in case it's an
                    // add-assembly change, since that won't exist in the driver yet
                    getBackendDriver(change.assembly) ?? collaborationServerDriver
                : collaborationServerDriver;
            let backendResult;
            try {
                backendResult = await backendDriver.submitChange(change, opts);
            }
            catch (error) {
                if (updateJobsManager) {
                    jobsManager.abortJob(job.name, String(error));
                }
                console.error(error);
                session.notify(String(error), 'error');
                await this.undo(change, false);
                setChangeInProgress(false);
                return;
            }
            if (!backendResult.ok) {
                const msg = `Post-validation failed: "${result.resultsMessages}"`;
                if (updateJobsManager) {
                    jobsManager.abortJob(job.name, msg);
                }
                session.notify(msg, 'error');
                await this.undo(change, false);
                setChangeInProgress(false);
                return;
            }
            if (change.notification) {
                session.notify(change.notification, 'success');
            }
            if (addToRecents) {
                this.recentChanges.push(change);
                this.undoneChanges = [];
            }
        }
        if (updateJobsManager) {
            jobsManager.done(job);
        }
        setChangeInProgress(false);
    }
    async undo(change, submitToBackend = true) {
        const inverseChange = change.getInverse();
        const opts = { submitToBackend, addToRecents: false };
        return this.submit(inverseChange, opts);
    }
    async redo(change, submitToBackend = true) {
        const opts = { submitToBackend, addToRecents: false };
        return this.submit(change, opts);
    }
    async undoLastChange() {
        const session = getSession(this.dataStore);
        const lastChange = this.recentChanges.pop();
        if (!lastChange) {
            session.notify('No changes to undo!', 'info');
            return;
        }
        this.undoneChanges.push(lastChange);
        return this.undo(lastChange);
    }
    async redoLastChange() {
        const session = getSession(this.dataStore);
        const lastChange = this.undoneChanges.pop();
        if (!lastChange) {
            session.notify('No changes to redo!', 'info');
            return;
        }
        this.recentChanges.push(lastChange);
        return this.redo(lastChange);
    }
}

/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
class CollaborationServerDriver extends BackendDriver {
    inFlight = new Map();
    refSeqMaps = new Map();
    async fetch(internetAccount, info, init) {
        const customFetch = internetAccount.getFetcher({
            locationType: 'UriLocation',
            uri: info.toString(),
        });
        return customFetch(info, init);
    }
    async searchFeatures(term, assemblies) {
        const internetAccount = this.clientStore.getInternetAccount(assemblies[0]);
        const { baseURL } = internetAccount;
        const url = new URL('features/searchFeatures', baseURL);
        const searchParams = new URLSearchParams({
            assemblies: assemblies.join(','),
            term,
        });
        url.search = searchParams.toString();
        const uri = url.toString();
        const response = await this.fetch(internetAccount, uri);
        if (!response.ok) {
            const errorMessage = await createFetchErrorMessage(response, 'searchFeatures failed');
            throw new Error(errorMessage);
        }
        return response.json();
    }
    /**
     * Call backend endpoint to get features by criteria
     * @param region -  Searchable region containing refSeq, start and end
     * @returns
     */
    async getFeatures(region) {
        const { assemblyName, end, refName, start } = region;
        const { assemblyManager } = getSession(this.clientStore);
        const assembly = assemblyManager.get(assemblyName);
        if (!assembly) {
            throw new Error(`Could not find assembly with name "${assemblyName}"`);
        }
        const refSeqMap = await this.getRefSeqMapping(assemblyName);
        const refSeqEntry = refSeqMap.get(refName);
        if (!refSeqEntry) {
            throw new Error(`Could not find refSeq "${refName}"`);
        }
        const refSeq = refSeqEntry.id;
        const internetAccount = this.clientStore.getInternetAccount(assemblyName);
        const { baseURL } = internetAccount;
        const url = new URL('features/getFeatures', baseURL);
        const searchParams = new URLSearchParams({
            refSeq,
            start: String(start),
            end: String(end),
        });
        url.search = searchParams.toString();
        const uri = url.toString();
        const response = await this.fetch(internetAccount, uri);
        if (!response.ok) {
            const errorMessage = await createFetchErrorMessage(response, 'getFeatures failed');
            throw new Error(errorMessage);
        }
        this.checkSocket(assemblyName, refName, internetAccount);
        return response.json();
    }
    /**
     * Checks if there is assembly-refSeq specific socket. If not, it opens one
     * @param assembly - assemblyId
     * @param refSeq - refSeqName
     * @param internetAccount - internet account
     */
    checkSocket(assembly, refSeq, internetAccount) {
        const { socket } = internetAccount;
        const token = internetAccount.retrieveToken();
        if (!token) {
            return;
        }
        const localSessionId = makeUserSessionId(token);
        const channel = `${assembly}-${refSeq}`;
        const changeManager = new ChangeManager(this.clientStore);
        if (!socket.hasListeners(channel)) {
            socket.on(channel, async (message) => {
                // Save server last change sequence into session storage
                internetAccount.setLastChangeSequenceNumber(Number(message.changeSequence));
                if (message.userSessionId === localSessionId) {
                    return; // we did this change, no need to apply it again
                }
                const change = Change.fromJSON(message.changeInfo);
                if (isFeatureChange(change) && this.haveDataForChange(change)) {
                    await changeManager.submit(change, { submitToBackend: false });
                }
            });
        }
    }
    haveDataForChange(change) {
        const { assembly, changedIds } = change;
        const apolloAssembly = this.clientStore.assemblies.get(assembly);
        if (!apolloAssembly) {
            return false;
        }
        for (const changedId of changedIds) {
            if (this.clientStore.getFeature(changedId)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Call backend endpoint to get sequence by criteria
     * @param region -  Searchable region containing refSeq, start and end
     * @returns
     */
    async getSequence(region) {
        const inFlightKey = `${region.refName}:${region.start}-${region.end}`;
        const inFlightPromise = this.inFlight.get(inFlightKey);
        const { assemblyName, end, refName, start } = region;
        const { assemblyManager } = getSession(this.clientStore);
        const assembly = assemblyManager.get(assemblyName);
        if (!assembly) {
            throw new Error(`Could not find assembly with name "${assemblyName}"`);
        }
        const refSeqMap = await this.getRefSeqMapping(assemblyName);
        const refSeqEntry = refSeqMap.get(refName);
        if (!refSeqEntry) {
            throw new Error(`Could not find refSeq "${refName}"`);
        }
        const refSeq = refSeqEntry.id;
        if (inFlightPromise) {
            const seq = await inFlightPromise;
            return { seq, refSeq };
        }
        let apolloAssembly = this.clientStore.assemblies.get(assemblyName);
        if (!apolloAssembly) {
            apolloAssembly = this.clientStore.addAssembly(assemblyName);
        }
        let apolloRefSeq = apolloAssembly.refSeqs.get(refSeq);
        if (!apolloRefSeq) {
            apolloRefSeq = apolloAssembly.addRefSeq(refSeq, refName);
        }
        const clientStoreSequence = apolloRefSeq.getSequence(start, end);
        if (clientStoreSequence.length === end - start) {
            return { seq: clientStoreSequence, refSeq };
        }
        const internetAccount = this.clientStore.getInternetAccount(assemblyName);
        const { baseURL } = internetAccount;
        const url = new URL('sequence', baseURL);
        const searchParams = new URLSearchParams({
            refSeq,
            start: String(start),
            end: String(end),
        });
        url.search = searchParams.toString();
        const uri = url.toString();
        const seqPromise = this.getSeqFromServer(internetAccount, uri, apolloRefSeq, start, end);
        this.inFlight.set(inFlightKey, seqPromise);
        const seq = await seqPromise;
        this.checkSocket(assemblyName, refName, internetAccount);
        this.inFlight.delete(inFlightKey);
        return { seq, refSeq };
    }
    async getSeqFromServer(internetAccount, uri, apolloRefSeq, start, stop) {
        const response = await this.fetch(internetAccount, uri);
        if (!response.ok) {
            let errorMessage;
            try {
                errorMessage = await response.text();
            }
            catch {
                errorMessage = '';
            }
            throw new Error(`getSequence failed: ${response.status} (${response.statusText})${errorMessage ? ` (${errorMessage})` : ''}`);
        }
        const seq = await response.text();
        apolloRefSeq.addSequence({ sequence: seq, start, stop });
        return seq;
    }
    async getRefSeqMapping(assemblyName) {
        const cachedRefSeqMap = this.refSeqMaps.get(assemblyName);
        if (cachedRefSeqMap) {
            return cachedRefSeqMap;
        }
        const { assemblyManager } = getSession(this.clientStore);
        const assembly = assemblyManager.get(assemblyName);
        if (!assembly) {
            throw new Error(`Could not find assembly with name "${assemblyName}"`);
        }
        const internetAccount = this.clientStore.getInternetAccount(assemblyName);
        const { baseURL } = internetAccount;
        const url = new URL('refSeqs', baseURL);
        const searchParams = new URLSearchParams({ assembly: assemblyName });
        url.search = searchParams.toString();
        const uri = url.toString();
        const response = await this.fetch(internetAccount, uri);
        if (!response.ok) {
            let errorMessage;
            try {
                errorMessage = await response.text();
            }
            catch {
                errorMessage = '';
            }
            throw new Error(`getRefNameAliases failed: ${response.status} (${response.statusText})${errorMessage ? ` (${errorMessage})` : ''}`);
        }
        const refSeqs = (await response.json());
        const refSeqMap = new Map(refSeqs.map((refSeq) => [
            refSeq.name,
            { refName: refSeq.name, id: refSeq._id, aliases: refSeq.aliases },
        ]));
        this.refSeqMaps.set(assemblyName, refSeqMap);
        return refSeqMap;
    }
    async getRefNameAliases(assemblyName) {
        const refSeqMap = await this.getRefSeqMapping(assemblyName);
        return [...refSeqMap.values()].map((refSeq) => ({
            refName: refSeq.refName,
            aliases: [...new Set([refSeq.id, ...refSeq.aliases])],
            uniqueId: `alias-${refSeq.id}`,
        }));
    }
    async getRefSeqId(assemblyName, refName) {
        const refSeqMap = await this.getRefSeqMapping(assemblyName);
        if (!refSeqMap) {
            return;
        }
        const refSeq = refSeqMap.get(refName);
        return refSeq?.id;
    }
    async getRegions(assemblyName) {
        const { assemblyManager } = getSession(this.clientStore);
        const assembly = assemblyManager.get(assemblyName);
        if (!assembly) {
            throw new Error(`Could not find assembly with name "${assemblyName}"`);
        }
        const internetAccount = this.clientStore.getInternetAccount(assemblyName);
        const { baseURL } = internetAccount;
        const url = new URL('refSeqs', baseURL);
        const searchParams = new URLSearchParams({ assembly: assemblyName });
        url.search = searchParams.toString();
        const uri = url.toString();
        const response = await this.fetch(internetAccount, uri);
        if (!response.ok) {
            let errorMessage;
            try {
                errorMessage = await response.text();
            }
            catch {
                errorMessage = '';
            }
            throw new Error(`getRegions failed: ${response.status} (${response.statusText})${errorMessage ? ` (${errorMessage})` : ''}`);
        }
        const refSeqs = await response.json();
        return refSeqs.map((refSeq) => ({
            refName: refSeq.name,
            start: 0,
            end: refSeq.length,
        }));
    }
    getAssemblies(internetAccountId) {
        const { assemblyManager } = getSession(this.clientStore);
        return assemblyManager.assemblies.filter((assembly) => {
            const sequenceMetadata = getConf(assembly, ['sequence', 'metadata']);
            if (sequenceMetadata &&
                sequenceMetadata.apollo &&
                sequenceMetadata.internetAccountConfigId) {
                if (internetAccountId) {
                    return sequenceMetadata.internetAccountConfigId === internetAccountId;
                }
                return true;
            }
            return false;
        });
    }
    async submitChange(change, opts = {}) {
        const { internetAccountId } = opts;
        const internetAccount = this.clientStore.getInternetAccount('assembly' in change ? change.assembly : undefined, internetAccountId);
        const { baseURL } = internetAccount;
        const url = new URL('changes', baseURL).href;
        const response = await this.fetch(internetAccount, url, {
            method: 'POST',
            body: JSON.stringify(change.toJSON()),
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const errorMessage = await createFetchErrorMessage(response, 'submitChange failed');
            throw new Error(errorMessage);
        }
        const results = new ValidationResultSet();
        if (!response.ok) {
            results.ok = false;
        }
        return results;
    }
}

class InMemoryFileDriver extends BackendDriver {
    async getFeatures() {
        return [[], []];
    }
    async getSequence(region) {
        const { assemblyName, end, refName, start } = region;
        const assembly = this.clientStore.assemblies.get(assemblyName);
        if (!assembly) {
            return { seq: '', refSeq: refName };
        }
        const refSeq = assembly.refSeqs.get(refName);
        if (!refSeq) {
            return { seq: '', refSeq: refName };
        }
        const seq = refSeq.getSequence(start, end);
        return { seq, refSeq: refName };
    }
    async getRefNameAliases(assemblyName) {
        const assembly = this.clientStore.assemblies.get(assemblyName);
        const refNameAliases = [];
        if (!assembly) {
            return refNameAliases;
        }
        for (const [, refSeq] of assembly.refSeqs) {
            refNameAliases.push({
                refName: refSeq.name,
                aliases: [refSeq._id],
                uniqueId: `alias-${refSeq._id}`,
            });
        }
        return refNameAliases;
    }
    async getRegions(assemblyName) {
        const assembly = this.clientStore.assemblies.get(assemblyName);
        if (!assembly) {
            return [];
        }
        const regions = [];
        for (const [, refSeq] of assembly.refSeqs) {
            regions.push({
                assemblyName,
                refName: refSeq.name,
                start: refSeq.sequence[0].start,
                end: refSeq.sequence[0].stop,
            });
        }
        return regions;
    }
    getAssemblies() {
        const { assemblyManager } = getSession(this.clientStore);
        return assemblyManager.assemblies.filter((assembly) => {
            const sequenceMetadata = getConf(assembly, ['sequence', 'metadata']);
            return Boolean(sequenceMetadata &&
                sequenceMetadata.apollo &&
                !sequenceMetadata.file &&
                !sequenceMetadata.internetAccountConfigId);
        });
    }
    async submitChange(_change, _opts = {}) {
        const { clientStore } = this;
        const { assemblies } = clientStore;
        clientStore.clearCheckResults();
        for (const [, assembly] of assemblies) {
            if (assembly.backendDriverType === 'InMemoryFileDriver') {
                const checkResults = await checkFeatures(assembly);
                clientStore.addCheckResults(checkResults);
            }
        }
        return new ValidationResultSet();
    }
    async searchFeatures(_term, _assemblies) {
        return [];
    }
}

/* eslint-disable @typescript-eslint/require-await */
class DesktopFileDriver extends BackendDriver {
    async loadAssembly(assemblyName) {
        const { assemblyManager } = getSession(this.clientStore);
        const assembly = assemblyManager.get(assemblyName);
        if (!assembly) {
            throw new Error(`Assembly ${assemblyName} not found`);
        }
        const { file } = getConf(assembly, ['sequence', 'metadata']);
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
        const fs = require('node:fs');
        const fileContents = await fs.promises.readFile(file, 'utf8');
        return loadAssemblyIntoClient(assemblyName, fileContents, this.clientStore);
    }
    async getAssembly(assemblyName) {
        let assembly = this.clientStore.assemblies.get(assemblyName);
        if (!assembly) {
            assembly = await this.loadAssembly(assemblyName);
        }
        return assembly;
    }
    async getRefNameAliases(assemblyName) {
        const assembly = await this.getAssembly(assemblyName);
        const refNameAliases = [];
        for (const [, refSeq] of assembly.refSeqs) {
            refNameAliases.push({
                refName: refSeq.name,
                aliases: [refSeq._id],
                uniqueId: `alias-${refSeq._id}`,
            });
        }
        return refNameAliases;
    }
    async getFeatures(region) {
        await this.getAssembly(region.assemblyName);
        return [[], []];
    }
    async getSequence(region) {
        const { assemblyName, end, refName, start } = region;
        const assembly = await this.getAssembly(assemblyName);
        const refSeq = assembly.refSeqs.get(refName);
        if (!refSeq) {
            throw new Error(`refSeq ${refName} not found in client data store`);
        }
        const seq = refSeq.getSequence(start, end);
        return { seq, refSeq: refName };
    }
    async getRegions(assemblyName) {
        const assembly = await this.getAssembly(assemblyName);
        const regions = [];
        for (const [, refSeq] of assembly.refSeqs) {
            regions.push({
                assemblyName,
                refName: refSeq.name,
                start: refSeq.sequence[0].start,
                end: refSeq.sequence[0].stop,
            });
        }
        return regions;
    }
    getAssemblies() {
        const { assemblyManager } = getSession(this.clientStore);
        return assemblyManager.assemblies.filter((assembly) => {
            const sequenceMetadata = getConf(assembly, ['sequence', 'metadata']);
            return Boolean(sequenceMetadata &&
                sequenceMetadata.apollo &&
                !sequenceMetadata.internetAccountConfigId &&
                sequenceMetadata.file);
        });
    }
    async submitChange(change) {
        if (!isAssemblySpecificChange(change)) {
            throw new Error(`Cannot use this type of change with local file: "${change.typeName}"`);
        }
        const { assemblyManager } = getSession(this.clientStore);
        const assembly = assemblyManager.get(change.assembly);
        if (!assembly) {
            throw new Error(`Could not find assembly with name "${change.assembly}"`);
        }
        const { file } = getConf(assembly, ['sequence', 'metadata']);
        const clientAssembly = this.clientStore.assemblies.get(change.assembly);
        if (!clientAssembly) {
            throw new Error(`Could not find assembly in client with name "${change.assembly}"`);
        }
        const refSeqs = new Set(...clientAssembly.refSeqs.keys());
        const { checkResults } = this.clientStore;
        for (const checkResult of checkResults.values()) {
            if (refSeqs.has(checkResult.refSeq)) {
                checkResults.delete(checkResult._id);
            }
        }
        const newCheckResults = await checkFeatures(clientAssembly);
        this.clientStore.addCheckResults(newCheckResults);
        const gff3Items = [{ directive: 'gff-version', value: '3' }];
        for (const [, refSeq] of clientAssembly.refSeqs) {
            gff3Items.push({
                directive: 'sequence-region',
                value: `${refSeq.name} 1 ${refSeq.sequence[0].stop}`,
            });
        }
        for (const comment of clientAssembly.comments) {
            gff3Items.push({ comment });
        }
        for (const [, refSeq] of clientAssembly.refSeqs) {
            const { features } = refSeq;
            for (const [, feature] of features) {
                gff3Items.push(annotationFeatureToGFF3(getSnapshot(feature)));
            }
        }
        for (const [, refSeq] of clientAssembly.refSeqs) {
            const [sequence] = refSeq.sequence;
            const formattedSequence = splitStringIntoChunks(sequence.sequence, 80).join('\n');
            gff3Items.push({
                id: refSeq.name,
                description: refSeq.description,
                sequence: formattedSequence,
            });
        }
        const gff3Contents = formatSync(gff3Items);
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
        const fs = require('node:fs');
        await fs.promises.writeFile(file, gff3Contents, 'utf8');
        const results = new ValidationResultSet();
        return results;
    }
    async searchFeatures(_term, _assemblies) {
        return [];
    }
}

var NewFeature;
(function (NewFeature) {
    NewFeature["GENE_AND_SUBFEATURES"] = "GENE_AND_SUBFEATURES";
    NewFeature["TRANSCRIPT_AND_SUBFEATURES"] = "TRANSCRIPT_AND_SUBFEATURES";
    NewFeature["CUSTOM"] = "CUSTOM";
})(NewFeature || (NewFeature = {}));
function makeCodingMrna(refSeqId, strand, min, max) {
    const cds = {
        _id: new ObjectID().toHexString(),
        refSeq: refSeqId,
        type: 'CDS',
        min,
        max,
        strand,
    };
    const exon = {
        _id: new ObjectID().toHexString(),
        refSeq: refSeqId,
        type: 'exon',
        min,
        max,
        strand,
    };
    const children = {};
    children[cds._id] = cds;
    children[exon._id] = exon;
    const mRNA = {
        _id: new ObjectID().toHexString(),
        refSeq: refSeqId,
        type: 'mRNA',
        min,
        max,
        strand,
        children,
    };
    return mRNA;
}
function AddFeature({ changeManager, handleClose, region, session, }) {
    const [end, setEnd] = useState(String(region.end));
    const [start, setStart] = useState(String(region.start + 1));
    const [type, setType] = useState(NewFeature.GENE_AND_SUBFEATURES);
    const [customType, setCustomType] = useState('');
    const [strand, setStrand] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    async function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        const backendDriver = session.apolloDataStore.getBackendDriver(region.assemblyName);
        if (!backendDriver) {
            setErrorMessage('No backend driver found');
            return;
        }
        let refSeqId = region.refName;
        if (backendDriver instanceof CollaborationServerDriver) {
            const backendRefSeqId = await backendDriver.getRefSeqId(region.assemblyName, region.refName);
            if (!backendRefSeqId) {
                setErrorMessage(`Could not find refSeq for "${region.refName}"`);
                return;
            }
            refSeqId = backendRefSeqId;
        }
        if (type === NewFeature.GENE_AND_SUBFEATURES) {
            const mRNA = makeCodingMrna(refSeqId, strand, Number(start) - 1, Number(end));
            const children = {};
            children[mRNA._id] = mRNA;
            const id = new ObjectID().toHexString();
            const change = new AddFeatureChange({
                changedIds: [id],
                typeName: 'AddFeatureChange',
                assembly: region.assemblyName,
                addedFeature: {
                    _id: id,
                    refSeq: refSeqId,
                    min: Number(start) - 1,
                    max: Number(end),
                    type: 'gene',
                    strand,
                    children,
                },
            });
            void changeManager.submit(change).then(() => {
                session.apolloSetSelectedFeature(id);
            });
            handleClose();
            return;
        }
        if (type === NewFeature.TRANSCRIPT_AND_SUBFEATURES) {
            const mRNA = makeCodingMrna(refSeqId, strand, Number(start) - 1, Number(end));
            const change = new AddFeatureChange({
                changedIds: [mRNA._id],
                typeName: 'AddFeatureChange',
                assembly: region.assemblyName,
                addedFeature: mRNA,
            });
            void changeManager.submit(change).then(() => {
                session.apolloSetSelectedFeature(mRNA._id);
            });
            handleClose();
            return;
        }
        if (!customType) {
            setErrorMessage('No type selected');
            return;
        }
        const id = new ObjectID().toHexString();
        const change = new AddFeatureChange({
            changedIds: [id],
            typeName: 'AddFeatureChange',
            assembly: region.assemblyName,
            addedFeature: {
                _id: id,
                refSeq: refSeqId,
                min: Number(start) - 1,
                max: Number(end),
                type: customType,
                strand,
            },
        });
        void changeManager.submit(change).then(() => {
            session.apolloSetSelectedFeature(id);
        });
        handleClose();
        return;
    }
    function handleChangeStrand(e) {
        setErrorMessage('');
        switch (Number(e.target.value)) {
            case 1: {
                setStrand(1);
                break;
            }
            case -1: {
                setStrand(-1);
                break;
            }
            default: {
                setStrand(undefined);
            }
        }
    }
    const error = Number(end) <= Number(start);
    function handleChangeOntologyType(newType) {
        setErrorMessage('');
        setCustomType(newType);
    }
    const handleTypeChange = (e) => {
        setErrorMessage('');
        const { value } = e.target;
        if (Object.keys(NewFeature).includes(value)) {
            setType(NewFeature[value]);
        }
    };
    let submitDisabled = Boolean(error) || !(start && end && type);
    if ((type === NewFeature.CUSTOM && !customType) ||
        (!strand && type === NewFeature.GENE_AND_SUBFEATURES) ||
        (!strand && type === NewFeature.TRANSCRIPT_AND_SUBFEATURES)) {
        submitDisabled = true;
    }
    return (jsxs(Dialog, { open: true, title: "Add new feature", handleClose: handleClose, maxWidth: false, "data-testid": "add-feature-dialog", children: [jsxs("form", { onSubmit: onSubmit, "data-testid": "submit-form", children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: [jsx(TextField, { margin: "dense", id: "start", label: "Start", type: "number", fullWidth: true, variant: "outlined", value: Number(start), onChange: (e) => {
                                    setStart(e.target.value);
                                } }), jsx(TextField, { margin: "dense", id: "end", label: "End", type: "number", fullWidth: true, variant: "outlined", value: end, onChange: (e) => {
                                    setEnd(e.target.value);
                                }, error: error, helperText: error ? '"End" must be greater than "Start"' : null }), jsxs(FormControl, { children: [jsx(InputLabel, { id: "demo-simple-select-label", children: "Strand" }), jsxs(Select, { labelId: "demo-simple-select-label", id: "demo-simple-select", label: "Strand", value: strand?.toString(), onChange: handleChangeStrand, children: [jsx(MenuItem, { value: undefined }), jsx(MenuItem, { value: 1, children: "+" }), jsx(MenuItem, { value: -1, children: "-" })] })] }), jsx(FormControl, { style: { marginTop: 20 }, children: jsxs(RadioGroup, { "aria-labelledby": "demo-radio-buttons-group-label", defaultValue: NewFeature.GENE_AND_SUBFEATURES, name: "radio-buttons-group", value: type, onChange: handleTypeChange, children: [jsx(FormControlLabel, { value: NewFeature.GENE_AND_SUBFEATURES, control: jsx(Radio, {}), label: jsxs(Box, { display: "flex", alignItems: "center", children: ["Add gene and sub-features", jsx(Tooltip, { title: "This is a shortcut to create a gene with a single mRNA, exon, and CDS", children: jsx(IconButton, { size: "small", children: jsx(InfoIcon, { sx: { fontSize: 18 } }) }) })] }) }), jsx(FormControlLabel, { value: NewFeature.TRANSCRIPT_AND_SUBFEATURES, control: jsx(Radio, {}), label: jsxs(Box, { display: "flex", alignItems: "center", children: ["Add transcript and sub-features", jsx(Tooltip, { title: "This is a shortcut to create a single mRNA with exon and CDS, but without a parent gene", children: jsx(IconButton, { size: "small", children: jsx(InfoIcon, { sx: { fontSize: 18 } }) }) })] }) }), jsx(FormControlLabel, { value: NewFeature.CUSTOM, checked: type !== NewFeature.GENE_AND_SUBFEATURES &&
                                                type !== NewFeature.TRANSCRIPT_AND_SUBFEATURES, control: jsx(Radio, {}), label: "Add feature with a sequence ontology type" })] }) }), type === NewFeature.CUSTOM ? (jsx(OntologyTermAutocomplete, { session: session, ontologyName: "Sequence Ontology", style: { width: 170 }, value: customType, filterTerms: isOntologyClass, renderInput: (params) => (jsx(TextField, { ...params, label: "Type", variant: "outlined", fullWidth: true })), onChange: (_oldValue, newValue) => {
                                    if (newValue) {
                                        handleChangeOntologyType(newValue);
                                    }
                                } })) : null] }), jsxs(DialogActions, { children: [jsx(Button, { variant: "contained", type: "submit", disabled: submitDisabled, children: "Submit" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

/**
 * Recursively assign new IDs to a feature
 * @param feature - Parent feature
 * @param featureIds -
 */
function generateNewIds(
// feature: AnnotationFeatureSnapshot,
feature, featureIds) {
    const newId = new ObjectID().toHexString();
    featureIds.push(newId);
    const children = {};
    if (feature.children) {
        for (const child of Object.values(feature.children)) {
            const newChild = generateNewIds(child, featureIds);
            children[newChild._id] = newChild;
        }
    }
    const referenceSeq = typeof feature.refSeq === 'string'
        ? feature.refSeq
        : feature.refSeq.toHexString();
    return {
        ...feature,
        refSeq: referenceSeq,
        children: feature.children && children,
        _id: newId,
    };
}
function CopyFeature({ changeManager, handleClose, session, sourceAssemblyId, sourceFeature, }) {
    const { assemblyManager } = session;
    const assemblies = assemblyManager.assemblyList;
    const [selectedAssemblyId, setSelectedAssemblyId] = useState(assemblies.find((a) => a.name !== sourceAssemblyId)?.name);
    const [refNames, setRefNames] = useState([]);
    const [selectedRefSeqId, setSelectedRefSeqId] = useState('');
    const [start, setStart] = useState(sourceFeature.min);
    const [errorMessage, setErrorMessage] = useState('');
    function handleChangeAssembly(e) {
        setSelectedAssemblyId(e.target.value);
    }
    useEffect(() => {
        async function getRefNames() {
            setSelectedRefSeqId('');
            if (!selectedAssemblyId) {
                setErrorMessage('No assemblies to copy to');
                return;
            }
            const assembly = await assemblyManager.waitForAssembly(selectedAssemblyId);
            if (!assembly) {
                return;
            }
            const { refNameAliases } = assembly;
            if (!refNameAliases) {
                return;
            }
            const newRefNames = [...Object.entries(refNameAliases)]
                .filter(([id, refName]) => id !== refName)
                .map(([id, refName]) => ({ _id: id, name: refName }));
            setRefNames(newRefNames);
            setSelectedRefSeqId(newRefNames[0]?._id || '');
        }
        getRefNames().catch((error) => {
            setErrorMessage(String(error));
        });
    }, [selectedAssemblyId, assemblyManager]);
    function handleChangeRefSeq(e) {
        const refSeq = e.target.value;
        setSelectedRefSeqId(refSeq);
    }
    async function onSubmit(event) {
        if (!selectedAssemblyId) {
            return;
        }
        event.preventDefault();
        setErrorMessage('');
        const featureLength = sourceFeature.length;
        const assembly = await assemblyManager.waitForAssembly(selectedAssemblyId);
        if (!assembly) {
            setErrorMessage(`Assembly not found: ${selectedAssemblyId}.`);
            return;
        }
        const canonicalRefName = assembly.getCanonicalRefName(selectedRefSeqId);
        const region = assembly.regions?.find((r) => r.refName === canonicalRefName);
        if (!region) {
            setErrorMessage(`RefSeq not found: ${selectedRefSeqId}.`);
            return;
        }
        const newEnd = start + featureLength;
        if (newEnd > region.end) {
            setErrorMessage(`Feature would extend beyond the bounds of the selected reference sequence. (Feature would end at ${newEnd}, but reference sequence ends at ${region.end})`);
            return;
        }
        if (start < region.start) {
            setErrorMessage(`Reference sequence starts at ${region.start}, feature cannot start before that.`);
            return;
        }
        const featureIds = [];
        // Let's add featureId to each child recursively
        const newFeatureLine = generateNewIds(getSnapshot(sourceFeature), featureIds);
        // Clear possible parentId -attribute.
        const attributeMap = {
            ...newFeatureLine.attributes,
        };
        if ('Parent' in attributeMap) {
            delete attributeMap.Parent;
        }
        newFeatureLine.refSeq = selectedRefSeqId;
        const locationMove = start - newFeatureLine.min;
        newFeatureLine.min = start;
        newFeatureLine.max = start + featureLength;
        // Updates children start and end values
        const updatedChildren = updateRefSeqStartEnd(newFeatureLine, locationMove);
        const change = new AddFeatureChange({
            changedIds: [newFeatureLine._id],
            typeName: 'AddFeatureChange',
            assembly: selectedAssemblyId,
            addedFeature: {
                _id: newFeatureLine._id,
                refSeq: newFeatureLine.refSeq,
                min: newFeatureLine.min,
                max: newFeatureLine.max,
                type: newFeatureLine.type,
                children: updatedChildren.children,
                attributes: attributeMap,
                strand: newFeatureLine.strand,
            },
            copyFeature: true,
            allIds: featureIds,
        });
        void changeManager.submit(change).then(() => {
            session.apolloSetSelectedFeature(newFeatureLine._id);
        });
        handleClose();
        event.preventDefault();
    }
    /**
     * Recursively loop children and update refSeq, start, and end values
     * @param feature - parent feature
     * @param locationMove - how much location has been moved from original
     * @returns
     */
    function updateRefSeqStartEnd(feature, locationMove) {
        const children = {};
        if (feature.children) {
            for (const child of Object.values(feature.children)) {
                const newChild = updateRefSeqStartEnd(child, locationMove);
                newChild.refSeq = selectedRefSeqId;
                newChild.min = newChild.min + locationMove;
                newChild.max = newChild.max + locationMove;
                children[newChild._id] = newChild;
            }
        }
        const refSeq = typeof feature.refSeq === 'string'
            ? feature.refSeq
            : feature.refSeq.toHexString();
        const id = typeof feature._id === 'string'
            ? feature._id
            : feature._id.toHexString();
        return {
            ...feature,
            refSeq,
            children: feature.children && children,
            _id: id,
        };
    }
    return (jsxs(Dialog, { open: true, title: "Copy features and annotations", handleClose: handleClose, maxWidth: false, "data-testid": "copy-feature", children: [jsxs("form", { onSubmit: onSubmit, children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: [jsx(DialogContentText, { children: "Target assembly" }), jsx(Select, { labelId: "label", value: selectedAssemblyId, onChange: handleChangeAssembly, children: assemblies
                                    .filter((option) => option.name !== sourceAssemblyId)
                                    .map((option) => (jsx(MenuItem, { value: option.name, children: readConfObject(option, 'displayName') }, option.name))) }), jsx(DialogContentText, { children: "Target reference sequence" }), jsx(Select, { labelId: "label", value: selectedRefSeqId, onChange: handleChangeRefSeq, children: refNames.map((option) => (jsx(MenuItem, { value: option._id, children: option.name }, option._id))) }), jsx(DialogContentText, { children: "Start position in target reference sequence" }), jsx(TextField, { margin: "dense", type: "number", fullWidth: true, variant: "outlined", value: start, onChange: (e) => {
                                    setStart(Number(e.target.value));
                                } })] }), jsxs(DialogActions, { children: [jsx(Button, { disabled: !selectedAssemblyId || !selectedRefSeqId || !start, variant: "contained", type: "submit", children: "Submit" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function DeleteAssembly({ changeManager, handleClose, session, }) {
    const { internetAccounts } = getRoot(session);
    const [errorMessage, setErrorMessage] = useState('');
    const [confirmDelete, setconfirmDelete] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const apolloInternetAccounts = internetAccounts.filter((ia) => ia.type === 'ApolloInternetAccount');
    if (apolloInternetAccounts.length === 0) {
        throw new Error('No Apollo internet account found');
    }
    const [selectedInternetAccount, setSelectedInternetAccount] = useState(apolloInternetAccounts[0]);
    const { collaborationServerDriver } = session.apolloDataStore;
    const assemblies = collaborationServerDriver.getAssemblies();
    const [selectedAssembly, setSelectedAssembly] = useState(assemblies.at(0));
    function handleChangeInternetAccount(e) {
        setSubmitted(false);
        const newlySelectedInternetAccount = apolloInternetAccounts.find((ia) => ia.internetAccountId === e.target.value);
        if (!newlySelectedInternetAccount) {
            throw new Error(`Could not find internetAccount with ID "${e.target.value}"`);
        }
        setSelectedInternetAccount(newlySelectedInternetAccount);
    }
    function handleChangeAssembly(e) {
        const newAssembly = assemblies.find((asm) => asm.name === e.target.value);
        setSelectedAssembly(newAssembly);
    }
    async function onSubmit(event) {
        event.preventDefault();
        setSubmitted(true);
        setErrorMessage('');
        if (!selectedAssembly) {
            setErrorMessage('Must select assembly!');
            return;
        }
        const change = new DeleteAssemblyChange({
            typeName: 'DeleteAssemblyChange',
            assembly: selectedAssembly.name,
        });
        await changeManager.submit(change, {
            internetAccountId: selectedInternetAccount.internetAccountId,
        });
        handleClose();
        event.preventDefault();
    }
    return (jsxs(Dialog, { open: true, title: "Delete Assembly", handleClose: handleClose, maxWidth: false, "data-testid": "delete-assembly", children: [jsxs("form", { onSubmit: onSubmit, children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: [apolloInternetAccounts.length > 1 ? (jsxs(Fragment, { children: [jsx(DialogContentText, { children: "Select account" }), jsx(Select, { value: selectedInternetAccount.internetAccountId, onChange: handleChangeInternetAccount, disabled: submitted && !errorMessage, children: internetAccounts.map((option) => (jsx(MenuItem, { value: option.internetAccountId, children: option.name }, option.id))) })] })) : null, jsx(DialogContentText, { children: "Select assembly" }), jsx(Select, { labelId: "label", value: selectedAssembly?.name ?? '', onChange: handleChangeAssembly, disabled: assemblies.length === 0, children: assemblies.map((option) => (jsx(MenuItem, { value: option.name, children: option.displayName }, option.name))) }), jsx(DialogContentText, { children: jsx("strong", { style: { color: 'red' }, children: "NOTE: All assembly data will be deleted and this operation cannot be undone!" }) }), jsx(FormGroup, { children: jsx(FormControlLabel, { control: jsx(Checkbox, { checked: confirmDelete, onChange: () => {
                                            setconfirmDelete(!confirmDelete);
                                        } }), label: "I understand that all assembly data will be deleted" }) })] }), jsxs(DialogActions, { children: [jsx(Button, { disabled: !selectedAssembly || !confirmDelete, variant: "contained", type: "submit", children: "Delete" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function lumpLocationChanges(changes, assembly) {
    if (changes.length === 0) {
        return;
    }
    const locationStartChange = new LocationStartChange({
        typeName: 'LocationStartChange',
        changedIds: [],
        changes: [],
        assembly,
    });
    const locationEndChange = new LocationEndChange({
        typeName: 'LocationEndChange',
        changedIds: [],
        changes: [],
        assembly,
    });
    for (const change of changes) {
        if (change.typeName === 'LocationStartChange') {
            locationStartChange.changedIds.push(change.changedId);
            const cc = {
                featureId: change.featureId,
                oldStart: change.oldLocation,
                newStart: change.newLocation,
            };
            locationStartChange.changes.push(cc);
        }
        if (change.typeName === 'LocationEndChange') {
            locationEndChange.changedIds.push(change.changedId);
            const cc = {
                featureId: change.featureId,
                oldEnd: change.oldLocation,
                newEnd: change.newLocation,
            };
            locationEndChange.changes.push(cc);
        }
    }
    if (locationStartChange.changedIds.length > 0 &&
        locationEndChange.changedIds.length === 0) {
        return locationStartChange;
    }
    if (locationEndChange.changedIds.length > 0 &&
        locationStartChange.changedIds.length === 0) {
        return locationEndChange;
    }
    throw new Error('Unexpected list of changes');
}
function DeleteFeature({ changeManager, handleClose, selectedFeature, session, setSelectedFeature, sourceAssemblyId, sourceFeature, }) {
    const [errorMessage, setErrorMessage] = useState('');
    const { ontologyManager } = session.apolloDataStore;
    const { featureTypeOntology } = ontologyManager;
    function trimCDS(sourceFeature) {
        if (!featureTypeOntology) {
            return;
        }
        if (!featureTypeOntology.isTypeOf(sourceFeature.type, 'exon')) {
            return;
        }
        if (!sourceFeature.parent?.cdsLocations ||
            sourceFeature.parent.cdsLocations.length === 0 ||
            sourceFeature.parent.cdsLocations[0].length === 0) {
            // No CDS - parent of this exon is a non-coding transcript
            return;
        }
        if (!sourceFeature.parent.children) {
            throw new Error('Unable to find parent of CDS');
        }
        if (sourceFeature.parent.cdsLocations.length != 1) {
            throw new Error('Unable to handle a transcript with multiple CDSs');
        }
        const _cdsLocations = sourceFeature.parent.cdsLocations.at(0) ?? [];
        const cdsLocations = _cdsLocations.sort(({ min: a }, { min: b }) => a - b);
        let cdsFeature;
        for (const child of sourceFeature.parent.children.values()) {
            if (child.type === cdsLocations[0].type) {
                cdsFeature = child;
                break;
            }
        }
        if (!cdsFeature) {
            throw new Error('Unable to find CDS');
        }
        const cdsStart = cdsLocations[0].min;
        // eslint-disable-next-line unicorn/prefer-at
        const cdsEnd = cdsLocations[cdsLocations.length - 1].max;
        if ((sourceFeature.min > cdsStart && sourceFeature.max < cdsEnd) ||
            sourceFeature.max < cdsStart ||
            sourceFeature.min > cdsEnd) {
            // No adjustment if the exon being deleted is fully contained in the CDS
            // or completely outside of the CDS
            return;
        }
        if (sourceFeature.min <= cdsStart && sourceFeature.max >= cdsEnd) {
            // CDS is fully contained in the exon, delete CDS
            return new DeleteFeatureChange({
                changedIds: [cdsFeature._id],
                typeName: 'DeleteFeatureChange',
                assembly: sourceAssemblyId,
                changes: [
                    {
                        deletedFeature: getSnapshot(cdsFeature),
                        parentFeatureId: cdsFeature.parent?._id,
                    },
                ],
            });
        }
        if (sourceFeature.min <= cdsStart && sourceFeature.max > cdsStart) {
            // Exon overlaps the start of the CDS so we need to move the CDS start
            let newCdsStart;
            for (const cdsLocation of cdsLocations) {
                if (cdsLocation.min > sourceFeature.max) {
                    newCdsStart = cdsLocation.min;
                    break;
                }
            }
            if (!newCdsStart) {
                throw new Error('Error setting new CDS start');
            }
            return {
                typeName: 'LocationStartChange',
                changedId: cdsFeature._id,
                featureId: cdsFeature._id,
                oldLocation: cdsFeature.min,
                newLocation: newCdsStart,
            };
        }
        if (sourceFeature.min < cdsEnd && sourceFeature.max >= cdsEnd) {
            // Exon overlaps the end of the CDS so we need to move the CDS end
            let newCdsEnd;
            for (const cdsLocation of cdsLocations.reverse()) {
                if (cdsLocation.max < sourceFeature.min) {
                    newCdsEnd = cdsLocation.max;
                    break;
                }
            }
            if (!newCdsEnd) {
                throw new Error('Error setting new CDS end');
            }
            return {
                typeName: 'LocationEndChange',
                changedId: cdsFeature._id,
                featureId: cdsFeature._id,
                oldLocation: cdsFeature.max,
                newLocation: newCdsEnd,
            };
        }
        throw new Error('Unexpected relationship between exon and CDS');
    }
    function trimParent(featureToDelete) {
        if (!featureToDelete.parent?.children ||
            featureToDelete.parent.children.size === 1) {
            // Do not resize if this parent has only one child (i.e. the feature being deleted)
            return;
        }
        const childrenByStart = [];
        for (const x of featureToDelete.parent.children.values()) {
            if (!featureTypeOntology?.isTypeOf(x.type, 'CDS')) {
                // CDS has been already handled so don't use it to resize parent
                childrenByStart.push(x);
            }
        }
        childrenByStart.sort((a, b) => a.min - b.min);
        const childrenByEnd = [];
        for (const x of featureToDelete.parent.children.values()) {
            if (!featureTypeOntology?.isTypeOf(x.type, 'CDS')) {
                // CDS has been already handled so don't use it to resize parent
                childrenByEnd.push(x);
            }
        }
        childrenByEnd.sort((a, b) => b.max - a.max);
        if (featureToDelete.min === childrenByStart[0].min) {
            // The feature to delete has the lowest start coordinate of all children
            // Find the next lowest coordinate and reset parent to this new start
            let newParentFeatureStart;
            for (const child of childrenByStart) {
                if (child._id !== featureToDelete._id &&
                    child.min >= featureToDelete.min) {
                    newParentFeatureStart = child.min;
                    break;
                }
            }
            if (newParentFeatureStart &&
                newParentFeatureStart != featureToDelete.parent.min) {
                return {
                    typeName: 'LocationStartChange',
                    changedId: featureToDelete.parent._id,
                    featureId: featureToDelete.parent._id,
                    oldLocation: featureToDelete.parent.min,
                    newLocation: newParentFeatureStart,
                };
            }
        }
        if (featureToDelete.max === childrenByEnd[0].max) {
            // The feature to delete has the highest end coordinate of all children
            // Find the next highest coordinate and reset parent to this new end
            let newParentFeatureEnd;
            for (const child of childrenByEnd) {
                if (child._id != featureToDelete._id &&
                    child.max <= featureToDelete.max) {
                    newParentFeatureEnd = child.max;
                    break;
                }
            }
            if (newParentFeatureEnd &&
                newParentFeatureEnd != featureToDelete.parent.max) {
                return {
                    typeName: 'LocationEndChange',
                    changedId: featureToDelete.parent._id,
                    featureId: featureToDelete.parent._id,
                    oldLocation: featureToDelete.parent.max,
                    newLocation: newParentFeatureEnd,
                };
            }
        }
        return;
    }
    async function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        if (selectedFeature?._id === sourceFeature._id) {
            setSelectedFeature();
        }
        const locationChanges = [];
        // const deleteChanges: DeleteFeatureChange = []
        const deleteChanges = new DeleteFeatureChange({
            changedIds: [sourceFeature._id],
            typeName: 'DeleteFeatureChange',
            assembly: sourceAssemblyId,
            changes: [
                {
                    deletedFeature: getSnapshot(sourceFeature),
                    parentFeatureId: sourceFeature.parent?._id,
                },
            ],
        });
        if (featureTypeOntology &&
            (featureTypeOntology.isTypeOf(sourceFeature.type, 'transcript') ||
                featureTypeOntology.isTypeOf(sourceFeature.type, 'pseudogenic_transcript'))) {
            const geneChange = trimParent(sourceFeature);
            if (geneChange) {
                locationChanges.push(geneChange);
            }
        }
        if (featureTypeOntology &&
            featureTypeOntology.isTypeOf(sourceFeature.type, 'exon')) {
            const cdsChange = trimCDS(sourceFeature);
            if (cdsChange) {
                if (cdsChange.typeName === 'DeleteFeatureChange') {
                    deleteChanges.changedIds.push(...cdsChange.changedIds);
                    deleteChanges.changes.push(...cdsChange.changes);
                }
                else {
                    locationChanges.push(cdsChange);
                }
            }
            const txChange = trimParent(sourceFeature);
            if (txChange) {
                locationChanges.push(txChange);
                // Parent transcript has changed. See if we need to resize the parent gene
                const gene = sourceFeature.parent?.parent;
                if (gene?.children) {
                    if (txChange.typeName === 'LocationStartChange') {
                        let newGeneStart = txChange.newLocation;
                        for (const [, tx] of gene.children) {
                            if (tx._id != txChange.featureId && tx.min < newGeneStart) {
                                // Reset to longest child (tx)
                                newGeneStart = tx.min;
                            }
                        }
                        if (newGeneStart != gene.min) {
                            locationChanges.push({
                                typeName: txChange.typeName,
                                changedId: gene._id,
                                featureId: gene._id,
                                oldLocation: gene.min,
                                newLocation: newGeneStart,
                            });
                        }
                    }
                    else {
                        let newGeneEnd = txChange.newLocation;
                        for (const [, tx] of gene.children) {
                            if (tx._id != txChange.featureId && tx.max > newGeneEnd) {
                                // Reset to longest child (tx)
                                newGeneEnd = tx.max;
                            }
                        }
                        if (newGeneEnd != gene.max) {
                            locationChanges.push({
                                typeName: txChange.typeName,
                                changedId: gene._id,
                                featureId: gene._id,
                                oldLocation: gene.max,
                                newLocation: newGeneEnd,
                            });
                        }
                    }
                }
            }
        }
        const lumpedLocChanges = lumpLocationChanges(locationChanges, sourceAssemblyId);
        await changeManager.submit(deleteChanges);
        if (lumpedLocChanges) {
            await changeManager.submit(lumpedLocChanges);
        }
        handleClose();
        event.preventDefault();
    }
    return (jsxs(Dialog, { open: true, title: "Delete feature", handleClose: handleClose, maxWidth: false, "data-testid": "delete-feature", children: [jsxs("form", { onSubmit: (event) => {
                    void onSubmit(event);
                }, children: [jsx(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: jsx(DialogContentText, { children: "Are you sure you want to delete the selected feature?" }) }), jsxs(DialogActions, { children: [jsx(Button, { variant: "contained", type: "submit", children: "Yes" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function DownloadGFF3({ handleClose, session }) {
    const [includeFASTA, setincludeFASTA] = useState(false);
    const [selectedAssembly, setSelectedAssembly] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const { collaborationServerDriver, getInternetAccount, inMemoryFileDriver } = session.apolloDataStore;
    const assemblies = [
        ...collaborationServerDriver.getAssemblies(),
        ...inMemoryFileDriver.getAssemblies(),
    ];
    function handleChangeAssembly(e) {
        const newAssembly = assemblies.find((asm) => asm.name === e.target.value);
        setSelectedAssembly(newAssembly);
    }
    async function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        if (!selectedAssembly) {
            setErrorMessage('Must select assembly to download');
            return;
        }
        const { internetAccountConfigId } = getConf(selectedAssembly, [
            'sequence',
            'metadata',
        ]);
        if (internetAccountConfigId) {
            await exportFromCollaborationServer(internetAccountConfigId);
        }
        else {
            exportFromMemory(session);
        }
        handleClose();
    }
    async function exportFromCollaborationServer(internetAccountConfigId) {
        if (!selectedAssembly) {
            setErrorMessage('Must select assembly to download');
            return;
        }
        const internetAccount = getInternetAccount(selectedAssembly.configuration.name, internetAccountConfigId);
        const url = new URL('export/getID', internetAccount.baseURL);
        const searchParams = new URLSearchParams({
            assembly: selectedAssembly.name,
        });
        url.search = searchParams.toString();
        const uri = url.toString();
        const apolloFetch = internetAccount.getFetcher({
            locationType: 'UriLocation',
            uri,
        });
        const response = await apolloFetch(uri, { method: 'GET' });
        if (!response.ok) {
            const newErrorMessage = await createFetchErrorMessage(response, 'Error when exporting ID');
            setErrorMessage(newErrorMessage);
            return;
        }
        const { exportID } = (await response.json());
        const exportURL = new URL('export', internetAccount.baseURL);
        const params = {
            exportID,
            includeFASTA: includeFASTA ? 'true' : 'false',
        };
        const exportSearchParams = new URLSearchParams(params);
        exportURL.search = exportSearchParams.toString();
        const exportUri = exportURL.toString();
        window.open(exportUri, '_blank');
    }
    function exportFromMemory(session) {
        if (!selectedAssembly) {
            setErrorMessage('Must select assembly to download');
            return;
        }
        const { assemblies } = session.apolloDataStore;
        const assembly = assemblies.get(selectedAssembly.name);
        const refSeqs = assembly?.refSeqs;
        if (!refSeqs) {
            setErrorMessage(`No refSeqs found for assembly "${selectedAssembly.name}"`);
            return;
        }
        const gff3Items = [{ directive: 'gff-version', value: '3' }];
        const sequenceFeatures = getConf(selectedAssembly, [
            'sequence',
            'adapter',
            'features',
        ]);
        for (const sequenceFeature of sequenceFeatures) {
            const { end, refName, start } = sequenceFeature;
            gff3Items.push({
                directive: 'sequence-region',
                value: `${refName} ${start + 1} ${end}`,
            });
        }
        for (const [, refSeq] of refSeqs) {
            const { features } = refSeq;
            if (!features) {
                continue;
            }
            for (const [, feature] of features) {
                gff3Items.push(annotationFeatureToGFF3(getSnapshot(feature)));
            }
        }
        for (const sequenceFeature of sequenceFeatures) {
            const { refName, seq } = sequenceFeature;
            gff3Items.push({ id: refName, description: '', sequence: seq });
        }
        const gff3 = formatSync(gff3Items);
        const gff3Blob = new Blob([gff3], { type: 'text/plain;charset=utf-8' });
        saveAs(gff3Blob, `${selectedAssembly.displayName ?? selectedAssembly.name}.gff3`);
    }
    return (jsxs(Dialog, { open: true, title: "Export GFF3", handleClose: handleClose, maxWidth: false, "data-testid": "download-gff3", children: [jsxs("form", { onSubmit: onSubmit, children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: [jsx(DialogContentText, { children: "Select assembly" }), jsx(Select, { labelId: "label", value: selectedAssembly?.name ?? '', onChange: handleChangeAssembly, disabled: assemblies.length === 0, children: assemblies.map((option) => (jsx(MenuItem, { value: option.name, children: option.displayName ?? option.name }, option.name))) }), jsx(DialogContentText, { children: "Select assembly to export to GFF3" }), jsx(FormGroup, { children: jsx(FormControlLabel, { "data-testid": "include-fasta-checkbox", control: jsx(Checkbox, { checked: includeFASTA, onChange: () => {
                                            setincludeFASTA(!includeFASTA);
                                        } }), label: "Include fasta sequence in GFF output" }) })] }), jsxs(DialogActions, { children: [jsx(Button, { disabled: !selectedAssembly, variant: "contained", type: "submit", children: "Download" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function ImportFeatures({ changeManager, handleClose, session, }) {
    const { apolloDataStore } = session;
    const [file, setFile] = useState();
    const [selectedAssembly, setSelectedAssembly] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    // default is -1, submit button should be disabled until count is set
    const [featuresCount, setFeaturesCount] = useState();
    const [deleteFeatures, setDeleteFeatures] = useState(false);
    const [strict, setStrict] = useState(true);
    const [loading, setLoading] = useState(false);
    const { collaborationServerDriver, getInternetAccount } = apolloDataStore;
    const assemblies = collaborationServerDriver.getAssemblies();
    function handleChangeAssembly(e) {
        const newAssembly = assemblies.find((asm) => asm.name === e.target.value);
        setSelectedAssembly(newAssembly);
        setSubmitted(false);
    }
    function handleDeleteFeatures(e) {
        setDeleteFeatures(e.target.checked);
    }
    function handleSetStrict(e) {
        setStrict(e.target.checked);
    }
    // fetch and set features count for selected assembly
    useEffect(() => {
        if (!selectedAssembly) {
            return;
        }
        const updateFeaturesCount = async () => {
            // TODO: this code will not work for running on desktop
            const { internetAccountConfigId } = getConf(selectedAssembly, [
                'sequence',
                'metadata',
            ]);
            const apolloInternetAccount = getInternetAccount(selectedAssembly.name, internetAccountConfigId);
            if (!apolloInternetAccount) {
                throw new Error('No Apollo internet account found');
            }
            const { baseURL } = apolloInternetAccount;
            const uri = new URL('features/count', baseURL);
            const searchParams = new URLSearchParams({
                assemblyId: selectedAssembly.name,
            });
            uri.search = searchParams.toString();
            const fetch = apolloInternetAccount.getFetcher({
                locationType: 'UriLocation',
                uri: uri.toString(),
            });
            setLoading(true);
            const response = await fetch(uri.toString(), { method: 'GET' });
            if (response.ok) {
                const countObj = (await response.json());
                setFeaturesCount(countObj.count);
            }
            else {
                throw new Error(await createFetchErrorMessage(response));
            }
            setLoading(false);
        };
        updateFeaturesCount().catch((error) => {
            console.error(error);
            setErrorMessage(error.message ?? error);
        });
    }, [getInternetAccount, session, selectedAssembly]);
    function handleChangeFile(e) {
        setSubmitted(false);
        if (!e.target.files) {
            return;
        }
        setFile(e.target.files[0]);
    }
    async function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        setLoading(true);
        setSubmitted(true);
        // let fileChecksum = ''
        let fileId = '';
        if (!file) {
            setErrorMessage('must select a file');
            return;
        }
        if (!selectedAssembly) {
            setErrorMessage('Must select assembly to download');
            return;
        }
        const { internetAccountConfigId } = getConf(selectedAssembly, [
            'sequence',
            'metadata',
        ]);
        const apolloInternetAccount = getInternetAccount(selectedAssembly.name, internetAccountConfigId);
        const { baseURL } = apolloInternetAccount;
        // First upload file
        const url = new URL('files', baseURL);
        url.searchParams.set('type', 'text/x-gff3');
        const uri = url.href;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('type', 'text/x-gff3');
        const apolloFetchFile = apolloInternetAccount.getFetcher({
            locationType: 'UriLocation',
            uri,
        });
        handleClose();
        const { jobsManager } = session;
        const controller = new AbortController();
        const job = {
            name: `Importing features for ${selectedAssembly.displayName}`,
            statusMessage: 'Uploading file, this may take awhile',
            progressPct: 0,
            cancelCallback: () => {
                controller.abort(new DOMException(`Canceling importing of features to ${selectedAssembly.displayName}`, 'AbortError'));
                jobsManager.abortJob(job.name);
            },
        };
        jobsManager.runJob(job);
        if (apolloFetchFile) {
            const { signal } = controller;
            const response = await apolloFetchFile(uri, {
                method: 'POST',
                body: formData,
                signal,
            });
            if (!response.ok) {
                const newErrorMessage = await createFetchErrorMessage(response, 'Error when inserting new features (while uploading file)');
                jobsManager.abortJob(job.name, newErrorMessage);
                setErrorMessage(newErrorMessage);
                return;
            }
            const result = await response.json();
            // fileChecksum = result.checksum
            fileId = result._id;
        }
        // Add features
        const change = new AddFeaturesFromFileChange({
            typeName: 'AddFeaturesFromFileChange',
            assembly: selectedAssembly.name,
            fileId,
            parseOptions: { strict },
            deleteExistingFeatures: deleteFeatures,
        });
        jobsManager.done(job);
        await changeManager.submit(change, { updateJobsManager: true });
    }
    return (jsxs(Dialog, { open: true, title: "Import Features from GFF3 file", handleClose: handleClose, maxWidth: false, "data-testid": "import-features-dialog", children: [loading ? jsx(LinearProgress, {}) : null, jsxs("form", { onSubmit: onSubmit, children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: [jsx(DialogContentText, { children: "Select assembly" }), jsx(Select, { labelId: "label", value: selectedAssembly?.name ?? '', onChange: handleChangeAssembly, disabled: submitted && !errorMessage, children: assemblies.map((option) => (jsx(MenuItem, { value: option.name, children: option.displayName ?? option.name }, option.name))) }), jsx(DialogContentText, { children: "Upload GFF3 to load features" }), jsx("input", { type: "file", onChange: handleChangeFile, disabled: submitted && !errorMessage }), jsx(FormControlLabel, { label: "Strict parsing", disabled: submitted && !errorMessage, control: jsx(Checkbox, { checked: strict, onChange: handleSetStrict }) }), jsx(FormHelperText, { children: "Don't import any features if any lines in the GFF3 are unable to be processed" }), featuresCount && featuresCount > 0 ? (jsxs(Fragment, { children: [jsx(FormControlLabel, { label: "Delete existing features", disabled: submitted && !errorMessage, control: jsx(Checkbox, { checked: deleteFeatures, onChange: handleDeleteFeatures, slotProps: { input: { 'aria-label': 'controlled' } }, color: "warning" }) }), jsxs(FormHelperText, { children: ["This assembly has ", featuresCount, " features that will be deleted"] })] })) : null] }), jsxs(DialogActions, { children: [jsx(Button, { disabled: !(selectedAssembly && file && featuresCount !== undefined) ||
                                    submitted, variant: "contained", type: "submit", children: submitted ? 'Submitting...' : 'Submit' }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Close" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function LogOut({ handleClose, session }) {
    const { internetAccounts } = getRoot(session);
    const [errorMessage, setErrorMessage] = useState('');
    const apolloInternetAccounts = internetAccounts.filter((ia) => ia.type === 'ApolloInternetAccount');
    if (apolloInternetAccounts.length === 0) {
        throw new Error('No Apollo internet account found');
    }
    const [selectedInternetAccount, setSelectedInternetAccount] = useState(apolloInternetAccounts[0]);
    function handleChangeInternetAccount(e) {
        const newlySelectedInternetAccount = apolloInternetAccounts.find((ia) => ia.internetAccountId === e.target.value);
        if (!newlySelectedInternetAccount) {
            throw new Error(`Could not find internetAccount with ID "${e.target.value}"`);
        }
        setSelectedInternetAccount(newlySelectedInternetAccount);
    }
    function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        selectedInternetAccount.removeToken();
        globalThis.location.reload();
    }
    return (jsxs(Dialog, { open: true, title: "Log out", handleClose: handleClose, maxWidth: false, "data-testid": "log-out", children: [jsxs("form", { onSubmit: onSubmit, children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: [apolloInternetAccounts.length > 1 ? (jsxs(Fragment, { children: [jsx(DialogContentText, { children: "Select account" }), jsx(Select, { value: selectedInternetAccount.internetAccountId, onChange: handleChangeInternetAccount, children: internetAccounts.map((option) => (jsx(MenuItem, { value: option.internetAccountId, children: option.name }, option.id))) })] })) : null, jsx(DialogContentText, { children: "Are you sure you want to log out?" })] }), jsxs(DialogActions, { children: [jsx(Button, { disabled: !selectedInternetAccount, variant: "contained", type: "submit", children: "Log Out" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function ManageChecks({ handleClose, session }) {
    const { internetAccounts } = getRoot(session);
    const [errorMessage, setErrorMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const apolloInternetAccounts = internetAccounts.filter((ia) => ia.type === 'ApolloInternetAccount');
    if (apolloInternetAccounts.length === 0) {
        throw new Error('No Apollo internet account found');
    }
    const [selectedInternetAccount, setSelectedInternetAccount] = useState(apolloInternetAccounts[0]);
    const [checks, setChecks] = useState([]);
    const [selectedChecks, setSelectedChecks] = useState([]);
    const { collaborationServerDriver } = session.apolloDataStore;
    const assemblies = collaborationServerDriver.getAssemblies();
    const [selectedAssembly, setSelectedAssembly] = useState(assemblies.at(0));
    useEffect(() => {
        async function getChecks() {
            const { baseURL, getFetcher } = selectedInternetAccount;
            const uri = new URL('checks/types', baseURL).href;
            const apolloFetch = getFetcher({ locationType: 'UriLocation', uri });
            const response = await apolloFetch(uri, { method: 'GET' });
            if (!response.ok) {
                const newErrorMessage = await createFetchErrorMessage(response, 'Error when retrieving checks from server');
                setErrorMessage(newErrorMessage);
                return;
            }
            const data = (await response.json());
            setChecks(data);
        }
        getChecks().catch((error) => {
            setErrorMessage(String(error));
        });
    }, [selectedInternetAccount]);
    useEffect(() => {
        async function getChecks() {
            if (!selectedAssembly) {
                return;
            }
            const { baseURL, getFetcher } = selectedInternetAccount;
            const uri = new URL(`assemblies/${selectedAssembly.name}`, baseURL).href;
            const apolloFetch = getFetcher({ locationType: 'UriLocation', uri });
            const response = await apolloFetch(uri, { method: 'GET' });
            if (!response.ok) {
                const newErrorMessage = await createFetchErrorMessage(response, 'Error when retrieving assembly from server');
                setErrorMessage(newErrorMessage);
                return;
            }
            const assembly = (await response.json());
            setSelectedChecks(assembly.checks);
        }
        getChecks().catch((error) => {
            setErrorMessage(String(error));
        });
    }, [selectedAssembly, selectedInternetAccount]);
    function handleChangeAssembly(e) {
        const newAssembly = assemblies.find((asm) => asm.name === e.target.value);
        setSelectedAssembly(newAssembly);
    }
    async function onSubmit(event) {
        event.preventDefault();
        if (!selectedAssembly) {
            setErrorMessage('Must select assembly!');
            return;
        }
        const { notify } = session;
        const { baseURL, getFetcher } = selectedInternetAccount;
        const uri = new URL('assemblies/checks', baseURL).href;
        const apolloFetch = getFetcher({
            locationType: 'UriLocation',
            uri,
        });
        const response = await apolloFetch(uri, {
            method: 'POST',
            body: JSON.stringify({
                _id: selectedAssembly.name,
                checks: selectedChecks,
                name: '',
            }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
            notify('Assembly checks updated successfully', 'success');
            handleClose();
        }
        else {
            const newErrorMessage = await createFetchErrorMessage(response, 'Error when updating assembly checks');
            setErrorMessage(newErrorMessage);
        }
        return;
    }
    function handleCheckboxChange(e, checked) {
        const checks = [...selectedChecks];
        const _id = e.target.value;
        if (checked) {
            if (!checks.includes(_id)) {
                checks.push(_id);
                setSelectedChecks(checks);
            }
        }
        else {
            const index = checks.indexOf(_id, 0);
            if (index !== -1) {
                checks.splice(index, 1);
            }
            setSelectedChecks(checks);
        }
    }
    function handleChangeInternetAccount(e) {
        setSubmitted(false);
        const newlySelectedInternetAccount = apolloInternetAccounts.find((ia) => ia.internetAccountId === e.target.value);
        if (!newlySelectedInternetAccount) {
            throw new Error(`Could not find internetAccount with ID "${e.target.value}"`);
        }
        setSelectedInternetAccount(newlySelectedInternetAccount);
    }
    return (jsxs(Dialog, { open: true, title: "Manage Checks", handleClose: handleClose, "data-testid": "manage-checks", children: [jsxs("form", { onSubmit: onSubmit, children: [jsxs(DialogContent, { children: [apolloInternetAccounts.length > 1 ? (jsxs(Fragment, { children: [jsx(DialogContentText, { children: "Select account" }), jsx(Select, { value: selectedInternetAccount.internetAccountId, onChange: handleChangeInternetAccount, disabled: submitted && !errorMessage, children: internetAccounts.map((option) => (jsx(MenuItem, { value: option.internetAccountId, children: option.name }, option.id))) })] })) : null, jsx(DialogContentText, { children: "Select assembly" }), jsx(Select, { style: { width: 300 }, labelId: "label", value: selectedAssembly?.name ?? '', onChange: handleChangeAssembly, disabled: assemblies.length === 0, children: assemblies.map((option) => (jsx(MenuItem, { value: option.name, children: option.displayName }, option.name))) }), jsx("br", {}), jsx("br", {}), jsx(TableContainer, { component: Paper, children: jsxs(Table, { children: [jsx(TableHead, { children: jsxs(TableRow, { children: [jsx(TableCell, { children: "Check name" }), jsx(TableCell, { children: "Use check" })] }) }), jsx(TableBody, { children: checks.map((check) => (jsxs(TableRow, { children: [jsx(TableCell, { children: check.name }), jsx(TableCell, { children: jsx(Checkbox, { value: check._id, checked: selectedChecks.includes(check._id), onChange: handleCheckboxChange }) })] }, check._id))) })] }) })] }), jsxs(DialogActions, { children: [jsx(Button, { variant: "contained", type: "submit", children: "Submit" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function isApolloInternetAccount(internetAccount) {
    return internetAccount.type === 'ApolloInternetAccount';
}

function ManageUsers({ changeManager, handleClose, session, }) {
    const { internetAccounts } = getRoot(session);
    const apolloInternetAccounts = internetAccounts
        .filter((ia) => isApolloInternetAccount(ia))
        .filter((ia) => ia.role?.includes('admin'));
    if (apolloInternetAccounts.length === 0) {
        throw new Error('No Apollo internet account found');
    }
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedInternetAccount, setSelectedInternetAccount] = useState(apolloInternetAccounts[0]);
    const [users, setUsers] = useState([]);
    useEffect(() => {
        async function getUsers() {
            const { baseURL } = selectedInternetAccount;
            const uri = new URL('users', baseURL).href;
            const apolloFetch = selectedInternetAccount.getFetcher({
                locationType: 'UriLocation',
                uri,
            });
            const response = await apolloFetch(uri, { method: 'GET' });
            if (!response.ok) {
                const newErrorMessage = await createFetchErrorMessage(response, 'Error when getting user data from db');
                setErrorMessage(newErrorMessage);
                return;
            }
            const data = (await response.json());
            setUsers(data.map((u) => (u.role === undefined ? { ...u, role: '' } : u)));
        }
        getUsers().catch((error) => {
            setErrorMessage(String(error));
        });
    }, [selectedInternetAccount]);
    async function deleteUser(id) {
        const change = new DeleteUserChange({
            typeName: 'DeleteUserChange',
            userId: id,
        });
        await changeManager.submit(change, {
            internetAccountId: selectedInternetAccount.internetAccountId,
        });
        setUsers((prevUsers) => prevUsers.filter((row) => row._id !== id));
    }
    function isCurrentUser(id) {
        if (id === selectedInternetAccount.getUserId()) {
            return true;
        }
        return false;
    }
    const gridColumns = [
        { field: 'username', headerName: 'User', width: 140 },
        { field: 'email', headerName: 'Email', width: 160 },
        {
            field: 'role',
            headerName: 'Role',
            width: 140,
            type: 'singleSelect',
            valueOptions: ['readOnly', 'user', 'admin', 'none'],
            getOptionLabel(value) {
                switch (value) {
                    case 'readOnly': {
                        return 'Read-only';
                    }
                    case 'user': {
                        return 'User';
                    }
                    case 'admin': {
                        return 'Admin';
                    }
                    case 'none': {
                        return 'None';
                    }
                    default: {
                        return 'unknown';
                    }
                }
            },
            editable: true,
        },
        {
            field: 'actions',
            type: 'actions',
            getActions: (params) => [
                jsx(GridActionsCellItem, { icon: jsx(DeleteIcon, {}), onClick: async () => {
                        if (globalThis.confirm('Delete this user?')) {
                            await deleteUser(params.id);
                        }
                    }, disabled: isCurrentUser(params.id), label: "Delete" }, `delete-${params.id}`),
            ],
        },
    ];
    function handleChangeInternetAccount(e) {
        const newlySelectedInternetAccount = apolloInternetAccounts.find((ia) => ia.internetAccountId === e.target.value);
        if (!newlySelectedInternetAccount) {
            throw new Error(`Could not find internetAccount with ID "${e.target.value}"`);
        }
        setSelectedInternetAccount(newlySelectedInternetAccount);
    }
    async function processRowUpdate(newRow) {
        const change = new UserChange({
            typeName: 'UserChange',
            role: newRow.role,
            userId: newRow._id,
        });
        await changeManager.submit(change, {
            internetAccountId: selectedInternetAccount.internetAccountId,
        });
        return newRow;
    }
    return (jsxs(Dialog, { open: true, fullScreen: true, title: "Manage users", handleClose: handleClose, "data-testid": "manage-users", children: [jsxs(DialogContent, { children: [apolloInternetAccounts.length > 1 ? (jsxs(Fragment, { children: [jsx(DialogContentText, { children: "Select account" }), jsx(Select, { value: selectedInternetAccount.internetAccountId, onChange: handleChangeInternetAccount, disabled: !errorMessage, children: internetAccounts.map((option) => (jsx(MenuItem, { value: option.internetAccountId, children: option.name }, option.id))) })] })) : null, jsx("div", { style: { height: '100%', width: '100%' }, children: jsx(DataGrid, { pagination: true, rows: users, columns: gridColumns, getRowId: (row) => row._id, slots: { toolbar: GridToolbar }, getRowHeight: () => 'auto', isCellEditable: (params) => !isCurrentUser(params.id), processRowUpdate: processRowUpdate, onProcessRowUpdateError: (error) => {
                                setErrorMessage(String(error));
                            } }) })] }), jsx(DialogActions, { children: jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Close" }) }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function getNeighboringExons(referenceExon) {
    const neighboringExons = {};
    const tx = referenceExon.parent;
    if (!tx) {
        throw new Error('Unable to find parent of reference exon');
    }
    let exons = [];
    if (tx.children) {
        for (const [, feature] of tx.children) {
            if (feature.type === 'exon') {
                exons.push(feature);
            }
        }
    }
    exons = exons.sort((a, b) => {
        if (a.min === b.min) {
            return a.max - b.max;
        }
        return a.min - b.min;
    });
    if (tx.strand && tx.strand === -1) {
        exons = exons.reverse();
    }
    let i = 0;
    for (const x of exons) {
        if (x._id === referenceExon._id) {
            if (exons.length > i + 1) {
                neighboringExons.three_prime = exons[i + 1];
            }
            if (i > 0) {
                neighboringExons.five_prime = exons[i - 1];
            }
            break;
        }
        i++;
    }
    return neighboringExons;
}
function makeRadioButtonName$1(key, neighboringExons) {
    const neighboringExon = neighboringExons[key];
    let name;
    if (key === 'three_prime') {
        name = `3'end (coords: ${neighboringExon.min + 1}-${neighboringExon.max})`;
    }
    else if (key === 'five_prime') {
        name = `5'end (coords: ${neighboringExon.min + 1}-${neighboringExon.max})`;
    }
    else {
        throw new Error(`Unexpected direction: "${key}"`);
    }
    return name;
}
function MergeExons({ changeManager, handleClose, selectedFeature, setSelectedFeature, sourceAssemblyId, sourceFeature, }) {
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedExon, setSelectedExon] = useState();
    function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        const { parent } = sourceFeature;
        if (!(selectedExon && parent)) {
            return;
        }
        if (selectedFeature?._id === sourceFeature._id) {
            setSelectedFeature();
        }
        const change = new MergeExonsChange({
            changedIds: [sourceFeature._id],
            typeName: 'MergeExonsChange',
            assembly: sourceAssemblyId,
            firstExon: getSnapshot(sourceFeature),
            secondExon: getSnapshot(selectedExon),
            parentFeatureId: parent._id,
        });
        void changeManager.submit(change);
        handleClose();
        event.preventDefault();
    }
    const handleTypeChange = (e) => {
        setErrorMessage('');
        const { value } = e.target;
        setSelectedExon(neighboringExons[value]);
    };
    const neighboringExons = getNeighboringExons(sourceFeature);
    return (jsxs(Dialog, { open: true, title: "Merge exons", handleClose: handleClose, maxWidth: false, "data-testid": "merge-exons", children: [jsxs("form", { onSubmit: onSubmit, children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: [Object.keys(neighboringExons).length === 0
                                ? 'There are no neighbouring exons to merge with'
                                : 'Merge with exon on:', jsx(FormControl, { style: { marginTop: 5 }, children: jsx(RadioGroup, { "aria-labelledby": "demo-radio-buttons-group-label", name: "radio-buttons-group", value: selectedExon, onChange: handleTypeChange, children: Object.keys(neighboringExons).map((key) => (jsx(FormControlLabel, { value: key, control: jsx(Radio, {}), label: jsx(Box, { display: "flex", alignItems: "center", children: makeRadioButtonName$1(key, neighboringExons) }) }, key))) }) })] }), jsxs(DialogActions, { children: [jsx(Button, { variant: "contained", type: "submit", disabled: Object.keys(neighboringExons).length === 0 ||
                                    selectedExon === undefined, children: "Submit" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function getTranscripts(referenceTranscript, session) {
    const gene = referenceTranscript.parent;
    if (!gene) {
        throw new Error('Unable to find parent of reference transcript');
    }
    const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    const transcripts = {};
    if (gene.children) {
        for (const [, feature] of gene.children) {
            if (featureTypeOntology.isTypeOf(feature.type, 'transcript') &&
                feature._id !== referenceTranscript._id) {
                transcripts[feature._id] = feature;
            }
        }
    }
    return transcripts;
}
function makeRadioButtonName(transcript) {
    let id;
    if (transcript.attributes.get('gff_name')) {
        id = transcript.attributes.get('gff_name')?.join(',');
    }
    else if (transcript.attributes.get('gff_id')) {
        id = transcript.attributes.get('gff_id')?.join(',');
    }
    else {
        id = transcript._id;
    }
    return `${id} [${transcript.min + 1}-${transcript.max}]`;
}
function MergeTranscripts({ changeManager, handleClose, selectedFeature, session, setSelectedFeature, sourceAssemblyId, sourceFeature, }) {
    const [errorMessage, setErrorMessage] = useState('');
    const transcripts = getTranscripts(sourceFeature, session);
    const firstTranscript = Object.keys(transcripts).at(0);
    const [selectedTranscriptId, setSelectedTranscriptId] = useState(firstTranscript);
    function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        if (!selectedTranscriptId) {
            return;
        }
        const selectedTranscript = transcripts[selectedTranscriptId];
        if (selectedFeature?._id === sourceFeature._id) {
            setSelectedFeature();
        }
        if (!sourceFeature.parent) {
            throw new Error('Cannot find parent');
        }
        const change = new MergeTranscriptsChange({
            changedIds: [sourceFeature._id],
            typeName: 'MergeTranscriptsChange',
            assembly: sourceAssemblyId,
            firstTranscript: getSnapshot(sourceFeature),
            secondTranscript: getSnapshot(selectedTranscript),
            parentFeatureId: sourceFeature.parent._id,
        });
        void changeManager.submit(change);
        handleClose();
    }
    const handleTypeChange = (e) => {
        setErrorMessage('');
        const { value } = e.target;
        setSelectedTranscriptId(value);
    };
    return (jsxs(Dialog, { open: true, title: "Merge transcripts", handleClose: handleClose, maxWidth: false, "data-testid": "merge-transcripts", children: [jsxs("form", { onSubmit: onSubmit, children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: [Object.keys(transcripts).length === 0
                                ? 'There are no transcripts to merge with'
                                : 'Merge with transcript:', jsx(FormControl, { style: { marginTop: 5 }, children: jsx(RadioGroup, { "aria-labelledby": "demo-radio-buttons-group-label", name: "radio-buttons-group", value: selectedTranscriptId, onChange: handleTypeChange, children: Object.keys(transcripts).map((key) => (jsx(FormControlLabel, { value: key, control: jsx(Radio, {}), label: jsx(Box, { display: "flex", alignItems: "center", children: makeRadioButtonName(transcripts[key]) }) }, key))) }) })] }), jsxs(DialogActions, { children: [jsx(Button, { variant: "contained", type: "submit", disabled: Object.keys(transcripts).length === 0 ||
                                    selectedTranscriptId === undefined, children: "Submit" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function OpenLocalFile({ handleClose, session }) {
    const { apolloDataStore } = session;
    const { addAssembly, addSessionAssembly, assemblyManager, notify } = session;
    const [file, setFile] = useState(null);
    const [assemblyName, setAssemblyName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const theme = useTheme();
    function handleChangeFile(e) {
        const selectedFile = e.target.files?.item(0);
        if (!selectedFile) {
            return;
        }
        setErrorMessage('');
        setFile(selectedFile);
        if (!assemblyName) {
            const fileName = selectedFile.name;
            const lastDotIndex = fileName.lastIndexOf('.');
            if (lastDotIndex === -1) {
                setAssemblyName(fileName);
            }
            else {
                setAssemblyName(fileName.slice(0, lastDotIndex));
            }
        }
    }
    async function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        setSubmitted(true);
        if (!file) {
            throw new Error('No file selected');
        }
        // Right now we are not using stream because there was a problem with 'pipe' in ReadStream
        const fileData = await new Response(file).text();
        const assemblyId = `${assemblyName}-${file.name}-${nanoid(8)}`;
        try {
            await loadAssemblyIntoClient(assemblyId, fileData, apolloDataStore);
        }
        catch (error) {
            console.error(error);
            notify(`Error loading GFF3 ${file.name}, ${String(error)}`, 'error');
            handleClose();
            return;
        }
        const fileMetadata = {};
        if (isElectron) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const { webUtils } = globalThis.require('electron');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            fileMetadata.file = webUtils.getPathForFile(file);
        }
        const assemblyConfig = {
            name: assemblyId,
            aliases: [assemblyName],
            displayName: assemblyName,
            sequence: {
                trackId: `sequenceConfigId-${assemblyName}`,
                type: 'ReferenceSequenceTrack',
                adapter: { type: 'ApolloSequenceAdapter', assemblyId },
                metadata: { apollo: true, ...fileMetadata },
            },
        };
        // Save assembly into session
        await (isElectron
            ? addAssembly?.(assemblyConfig)
            : (addSessionAssembly || addAssembly)(assemblyConfig));
        const a = await assemblyManager.waitForAssembly(assemblyConfig.name);
        if (a) {
            // @ts-expect-error MST type coercion problem?
            session.addApolloTrackConfig(a);
            notify(`Loaded GFF3 ${file.name}`, 'success');
        }
        else {
            notify(`Error loading GFF3 ${file.name}`, 'error');
        }
        handleClose();
    }
    function handleAssemblyNameChange(event) {
        setAssemblyName(event.target.value);
    }
    return (jsxs(Dialog, { open: true, title: "Open local GFF3 file", handleClose: handleClose, maxWidth: false, "data-testid": "open-local-file", children: [jsxs("form", { onSubmit: onSubmit, children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: [jsxs(FormControl, { children: [jsxs("div", { style: { flexDirection: 'row' }, children: [jsxs(Button, { variant: "contained", component: "label", style: { marginRight: theme.spacing() }, children: ["Choose File", jsx("input", { type: "file", required: true, hidden: true, onChange: handleChangeFile })] }), file ? file.name : 'No file chosen'] }), jsx(FormHelperText, { children: "Make sure your GFF3 has an embedded FASTA section" })] }), jsx(TextField, { required: true, label: "Assembly name", value: assemblyName, onChange: handleAssemblyNameChange })] }), jsxs(DialogActions, { children: [jsx(Button, { disabled: false, variant: "contained", type: "submit", children: submitted ? 'Submitting...' : 'Submit' }), jsx(Button, { disabled: submitted, variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

const useStyles$e = makeStyles()((theme) => ({
    changeTextarea: {
        fontFamily: 'monospace',
        width: 600,
        resize: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
    },
}));
function ViewChangeLog({ handleClose, session }) {
    const { internetAccounts } = getRoot(session);
    const apolloInternetAccount = internetAccounts.find((ia) => ia.type === 'ApolloInternetAccount');
    if (!apolloInternetAccount) {
        throw new Error('No Apollo internet account found');
    }
    const { baseURL } = apolloInternetAccount;
    const { classes } = useStyles$e();
    const [errorMessage, setErrorMessage] = useState();
    const [displayGridData, setDisplayGridData] = useState([]);
    const { collaborationServerDriver } = session.apolloDataStore;
    const assemblies = collaborationServerDriver.getAssemblies();
    const [selectedAssembly, setSelectedAssembly] = useState(assemblies.at(0));
    const gridColumns = [
        { field: 'sequence' },
        {
            field: 'typeName',
            headerName: 'Change type',
            width: 200,
            type: 'singleSelect',
            // TODO: Get these from change manager once it's on the session
            valueOptions: [...changeRegistry.changes.keys()],
        },
        {
            field: 'changes',
            headerName: 'Change JSON',
            width: 600,
            renderCell: ({ value }) => (jsx("textarea", { className: classes.changeTextarea, value: JSON.stringify(value), readOnly: true })),
        },
        { field: 'user', headerName: 'User', width: 140 },
        {
            field: 'createdAt',
            headerName: 'Time',
            width: 160,
            type: 'dateTime',
            valueGetter: (value) => value && new Date(value),
        },
    ];
    useEffect(() => {
        async function getGridData() {
            if (!selectedAssembly) {
                return;
            }
            // Get changes
            const url = new URL('changes', baseURL);
            const searchParams = new URLSearchParams({
                assembly: selectedAssembly.name,
            });
            url.search = searchParams.toString();
            const uri = url.toString();
            const apolloFetch = apolloInternetAccount?.getFetcher({
                locationType: 'UriLocation',
                uri,
            });
            if (apolloFetch) {
                const response = await apolloFetch(uri, {
                    headers: new Headers({ 'Content-Type': 'application/json' }),
                });
                if (!response.ok) {
                    const newErrorMessage = await createFetchErrorMessage(response, 'Error when retrieving changes');
                    setErrorMessage(newErrorMessage);
                    return;
                }
                const data = await response.json();
                setDisplayGridData(data);
            }
        }
        getGridData().catch((error) => {
            setErrorMessage(String(error));
        });
    }, [apolloInternetAccount, baseURL, selectedAssembly]);
    function handleChangeAssembly(e) {
        const newAssembly = assemblies.find((asm) => asm.name === e.target.value);
        setSelectedAssembly(newAssembly);
    }
    return (jsxs(Dialog, { open: true, fullScreen: true, title: "View change log", handleClose: handleClose, "data-testid": "view-changelog", children: [jsx(Select, { style: { width: 200, marginLeft: 40 }, value: selectedAssembly?.name ?? '', onChange: handleChangeAssembly, children: assemblies.map((option) => (jsx(MenuItem, { value: option.name, children: option.displayName || option.name }, option.name))) }), jsx(DialogContent, { children: jsx(DataGrid, { pagination: true, rows: displayGridData, columns: gridColumns, getRowId: (row) => row._id, slots: { toolbar: GridToolbar }, initialState: {
                        sorting: { sortModel: [{ field: 'sequence', sort: 'desc' }] },
                        columns: { columnVisibilityModel: { sequence: false } },
                    } }) }), jsx(DialogActions, { children: jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Close" }) }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

const columns = [
    { field: 'refName', headerName: 'Ref Name' },
    { field: 'aliases', headerName: 'Aliases', editable: true, flex: 1 },
];
const isGeneratedObjectId = (key) => {
    const pattern = /^[\da-f]{24}$/i;
    return pattern.test(key);
};
const AddRefSeqAliases = observer(function AddRefSeqAliases({ changeManager, handleClose, session, }) {
    const fileRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [enableSubmit, setEnableSubmit] = useState(false);
    const [selectedAssembly, setSelectedAssembly] = useState();
    const [selectedRows, setSelectedRows] = useState([]);
    const [refNameAliasMap, setRefNameAliasMap] = useState(new Map());
    const { apolloDataStore } = session;
    const { collaborationServerDriver } = apolloDataStore;
    const assemblies = collaborationServerDriver.getAssemblies();
    useEffect(() => {
        if (assemblies.length > 0) {
            setSelectedAssembly(assemblies[0]);
            collaborationServerDriver
                .getRefNameAliases(assemblies[0].name)
                .then((refNameAliases) => {
                initializeRefNameAliasMap(refNameAliases);
            })
                .catch(() => {
                setRefNameAliasMap(new Map());
                setErrorMessage('Error fetching refName aliases for assembly');
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const initializeRefNameAliasMap = (refNameAliasesList) => {
        const initialMap = new Map();
        for (const refNameAliases of refNameAliasesList) {
            const key = refNameAliases.refName;
            if (isGeneratedObjectId(key)) {
                continue;
            }
            initialMap.set(key, refNameAliases.aliases);
        }
        setRefNameAliasMap(initialMap);
    };
    const handleChangeAssembly = (e) => {
        const newAssembly = assemblies.find((asm) => asm.name === e.target.value);
        setSelectedAssembly(newAssembly);
        if (!newAssembly?.name) {
            return;
        }
        collaborationServerDriver
            .getRefNameAliases(newAssembly.name)
            .then((refNameAliases) => {
            initializeRefNameAliasMap(refNameAliases);
            setErrorMessage('');
        })
            .catch(() => {
            setRefNameAliasMap(new Map());
            setErrorMessage('Error fetching refName aliases for assembly');
        });
        setEnableSubmit(false);
        if (fileRef.current) {
            fileRef.current.value = '';
        }
    };
    const handleChangeFile = async (e) => {
        if (!e.target.files) {
            return;
        }
        // eslint-disable-next-line prefer-destructuring
        const file = e.target.files[0];
        const fileContent = await file.text();
        const lines = fileContent.split('\n');
        const newMap = new Map(refNameAliasMap);
        setErrorMessage('');
        for (const line of lines) {
            const aliases = line.split('\t');
            for (const alias of aliases) {
                if (newMap.has(alias)) {
                    newMap.set(alias, [...(newMap.get(alias) ?? []), ...aliases]);
                }
            }
        }
        setRefNameAliasMap(newMap);
    };
    const handleChangeFileHandler = (e) => {
        handleChangeFile(e).catch(() => {
            setErrorMessage('Error reading file');
        });
    };
    const rowSelectionChange = (gridRowSelectionModel) => {
        const { ids } = gridRowSelectionModel;
        if (ids.size > 0) {
            setEnableSubmit(true);
            const selectedRows = [...ids.values()].flatMap((id) => getTableRows().filter((row) => String(row.id) === String(id)));
            setSelectedRows(selectedRows);
        }
        else {
            setEnableSubmit(false);
            setSelectedRows([]);
        }
    };
    const getTableRows = () => {
        return [...refNameAliasMap].map((ele, i) => ({
            id: i,
            refName: ele[0],
            aliases: ele[1].filter((alias) => alias !== ele[0]).join(', '),
        }));
    };
    const processRowUpdate = (newRow, _oldRow) => {
        const newMap = new Map(refNameAliasMap);
        newMap.set(newRow.refName, newRow.aliases.split(','));
        setRefNameAliasMap(newMap);
        return newRow;
    };
    const handleSubmit = () => {
        const refSeqAliases = [];
        for (const row of selectedRows) {
            const { refName } = row;
            const aliases = row.aliases
                .split(',')
                .map((alias) => alias.trim())
                .filter((alias) => alias.length > 0);
            refSeqAliases.push({
                refName,
                aliases,
            });
        }
        setErrorMessage('');
        if (!selectedAssembly) {
            setErrorMessage('No assembly selected');
            return;
        }
        const change = new AddRefSeqAliasesChange({
            typeName: 'AddRefSeqAliasesChange',
            assembly: selectedAssembly.name,
            refSeqAliases,
        });
        changeManager.submit(change).catch(() => {
            setErrorMessage('Error submitting change');
        });
        handleClose();
    };
    return (jsxs(Dialog, { open: true, title: "Add reference sequence aliases", handleClose: handleClose, maxWidth: 'sm', "data-testid": "add-refseq-alias", fullWidth: true, children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: [jsxs(Grid, { container: true, spacing: 2, children: [jsx(Grid, { children: jsxs(FormControl, { disabled: enableSubmit && !errorMessage, fullWidth: true, children: [jsx(InputLabel, { id: "demo-simple-select-label", children: "Assembly" }), jsx(Select, { labelId: "demo-simple-select-label", id: "demo-simple-select", label: "Assembly", value: selectedAssembly?.name ?? '', onChange: handleChangeAssembly, style: { minWidth: 150 }, children: assemblies.map((option) => (jsx(MenuItem, { value: option.name, children: option.displayName }, option.name))) })] }) }), jsxs(Grid, { children: [jsx(InputLabel, { children: "Load RefName alias" }), jsx("input", { type: "file", onChange: handleChangeFileHandler, ref: fileRef, disabled: (enableSubmit && !errorMessage) || !selectedAssembly })] })] }), selectedAssembly && refNameAliasMap.size > 0 ? (jsxs("div", { style: { height: 200, width: '100%', marginTop: 20 }, children: [jsx(InputLabel, { children: "Refname aliases found for selected assembly." }), jsx(DataGrid, { rows: getTableRows(), columns: columns, initialState: {
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 5 },
                                    },
                                }, pageSizeOptions: [5, 10], onRowSelectionModelChange: rowSelectionChange, processRowUpdate: processRowUpdate, checkboxSelection: true, disableRowSelectionExcludeModel: true })] })) : null] }), jsxs(DialogActions, { children: [jsx(Button, { variant: "contained", type: "submit", disabled: !enableSubmit, onClick: handleSubmit, children: "Submit" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Close" })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
});

function ViewCheckResults({ handleClose, session, }) {
    const { internetAccounts } = getRoot(session);
    const { collaborationServerDriver } = session.apolloDataStore;
    const apolloInternetAccount = internetAccounts.find((ia) => ia.type === 'ApolloInternetAccount');
    if (!apolloInternetAccount) {
        throw new Error('No Apollo internet account found');
    }
    const { baseURL } = apolloInternetAccount;
    const [errorMessage, setErrorMessage] = useState();
    const [displayGridData, setDisplayGridData] = useState([]);
    const gridColumns = [
        { field: '_id', headerName: 'id', width: 50 },
        {
            field: 'name',
            headerName: 'Check name',
            width: 200,
        },
        { field: 'refSeq', headerName: 'Reference sequence ID', width: 200 },
        { field: 'ids', headerName: 'Feature IDs', width: 200 },
        { field: 'message', headerName: 'Message', flex: 1 },
    ];
    const assemblies = collaborationServerDriver.getAssemblies();
    const [selectedAssembly, setSelectedAssembly] = useState(assemblies.at(0));
    useEffect(() => {
        async function getGridData() {
            const assemblyId = selectedAssembly?.name;
            if (!assemblyId) {
                return;
            }
            const url = new URL('checks', baseURL);
            const searchParams = new URLSearchParams({ assembly: assemblyId });
            url.search = searchParams.toString();
            const uri = url.toString();
            const apolloFetch = apolloInternetAccount?.getFetcher({
                locationType: 'UriLocation',
                uri,
            });
            if (apolloFetch) {
                const response = await apolloFetch(uri, {
                    headers: new Headers({ 'Content-Type': 'application/json' }),
                });
                if (!response.ok) {
                    const newErrorMessage = await createFetchErrorMessage(response, 'Error when retrieving checks');
                    setErrorMessage(newErrorMessage);
                    return;
                }
                const data = await response.json();
                setDisplayGridData(data);
            }
        }
        getGridData().catch((error) => {
            setErrorMessage(String(error));
        });
    }, [selectedAssembly, apolloInternetAccount, baseURL]);
    function handleChangeAssembly(e) {
        const newAssembly = assemblies.find((asm) => asm.name === e.target.value);
        setSelectedAssembly(newAssembly);
    }
    return (jsxs(Dialog, { open: true, fullScreen: true, title: "View check results", handleClose: handleClose, "data-testid": "view-check-results", children: [jsx(Select, { style: { width: 200, marginLeft: 40 }, value: selectedAssembly?.name ?? '', onChange: handleChangeAssembly, disabled: assemblies.length === 0, children: assemblies.map((option) => (jsx(MenuItem, { value: option.name, children: option.displayName }, option.name))) }), jsx(DialogContent, { children: jsx(DataGrid, { pagination: true, rows: displayGridData, columns: gridColumns, getRowId: (row) => row._id, slots: { toolbar: GridToolbar }, initialState: {
                        sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
                        columns: { columnVisibilityModel: { name: true } },
                    } }) }), jsx(DialogActions, { children: jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Close" }) }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function exonIsSplittable(exonToBeSplit) {
    if (exonToBeSplit.max - exonToBeSplit.min < 2) {
        return {
            isSplittable: false,
            comment: 'This exon is too short to be split',
        };
    }
    return { isSplittable: true, comment: '' };
}
function makeDialogText(splitExon) {
    const splittable = exonIsSplittable(splitExon);
    if (splittable.isSplittable) {
        return 'Are you sure you want to split the selected exon?';
    }
    return splittable.comment;
}
function SplitExon({ changeManager, handleClose, selectedFeature, setSelectedFeature, sourceAssemblyId, sourceFeature, }) {
    const [errorMessage, setErrorMessage] = useState('');
    const exonToBeSplit = getSnapshot(sourceFeature);
    function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        if (selectedFeature?._id === sourceFeature._id) {
            setSelectedFeature();
        }
        const midpoint = exonToBeSplit.min + (exonToBeSplit.max - exonToBeSplit.min) / 2;
        const upstreamCut = Math.floor(midpoint);
        const downstreamCut = Math.ceil(midpoint);
        if (!sourceFeature.parent?._id) {
            throw new Error('Splitting an exon without parent is not possible yet');
        }
        const change = new SplitExonChange({
            changedIds: [sourceFeature._id],
            typeName: 'SplitExonChange',
            assembly: sourceAssemblyId,
            exonToBeSplit,
            parentFeatureId: sourceFeature.parent._id,
            upstreamCut,
            downstreamCut,
            leftExonId: new ObjectID().toHexString(),
            rightExonId: new ObjectID().toHexString(),
        });
        void changeManager.submit(change);
        handleClose();
        event.preventDefault();
    }
    return (jsxs(Dialog, { open: true, title: "Split exon", handleClose: handleClose, maxWidth: false, "data-testid": "split-exon", children: [jsxs("form", { onSubmit: onSubmit, children: [jsx(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: jsx(DialogContentText, { children: makeDialogText(exonToBeSplit) }) }), jsxs(DialogActions, { children: [jsx(Button, { variant: "contained", type: "submit", disabled: !exonIsSplittable(exonToBeSplit).isSplittable, children: "Yes" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function DuplicateTranscript({ changeManager, handleClose, session, sourceAssemblyId, sourceFeature, setSelectedFeature, }) {
    const [errorMessage, setErrorMessage] = useState('');
    const { notify } = session;
    async function onSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        try {
            const parentGene = sourceFeature.parent;
            if (!parentGene) {
                setErrorMessage('No parent gene found for this transcript');
                return;
            }
            const transcriptSnapshot = getSnapshot(sourceFeature);
            const newTranscriptId = new ObjectID().toHexString();
            const duplicateTranscript = {
                ...transcriptSnapshot,
                _id: newTranscriptId,
            };
            if (duplicateTranscript.children) {
                const newChildren = {};
                for (const [, child] of Object.entries(duplicateTranscript.children)) {
                    const newChildId = new ObjectID().toHexString();
                    newChildren[newChildId] = {
                        ...child,
                        _id: newChildId,
                    };
                }
                duplicateTranscript.children = newChildren;
            }
            const change = new AddFeatureChange({
                parentFeatureId: parentGene._id,
                changedIds: [parentGene._id],
                typeName: 'AddFeatureChange',
                assembly: sourceAssemblyId,
                addedFeature: duplicateTranscript,
            });
            await changeManager.submit(change).then(() => {
                setSelectedFeature(undefined);
                session.apolloSetSelectedFeature(newTranscriptId);
                notify('Successfully duplicated transcript', 'success');
            });
            handleClose();
        }
        catch (error) {
            setErrorMessage(error instanceof Error
                ? error.message
                : 'Failed to duplicate transcript');
        }
    }
    return (jsxs(Dialog, { open: true, title: "Duplicate transcript", handleClose: handleClose, maxWidth: false, "data-testid": "duplicate-transcript", children: [jsxs("form", { onSubmit: (event) => {
                    void onSubmit(event);
                }, children: [jsx(DialogContent, { style: { display: 'flex', flexDirection: 'column' }, children: jsx(DialogContentText, { children: "Are you sure you want to create a duplicate of this transcript?" }) }), jsxs(DialogActions, { children: [jsx(Button, { variant: "contained", type: "submit", children: "Yes" }), jsx(Button, { variant: "outlined", type: "button", onClick: handleClose, children: "Cancel" })] })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function addTopLevelAdminMenus(rootModel) {
    rootModel.appendToMenu('Apollo', {
        label: 'Admin',
        type: 'subMenu',
        icon: AdminPanelSettingsIcon,
        subMenu: [
            {
                label: 'Add Assembly',
                icon: AddIcon,
                onClick: (session) => {
                    session.queueDialog((doneCallback) => [
                        AddAssembly,
                        {
                            session,
                            handleClose: () => {
                                doneCallback();
                            },
                            changeManager: session.apolloDataStore.changeManager,
                        },
                    ]);
                },
            },
            {
                label: 'Delete Assembly',
                icon: DeleteIcon,
                onClick: (session) => {
                    session.queueDialog((doneCallback) => [
                        DeleteAssembly,
                        {
                            session,
                            handleClose: () => {
                                doneCallback();
                            },
                            changeManager: session.apolloDataStore.changeManager,
                        },
                    ]);
                },
            },
            {
                label: 'Import Features',
                icon: InputIcon,
                onClick: (session) => {
                    session.queueDialog((doneCallback) => [
                        ImportFeatures,
                        {
                            session,
                            handleClose: () => {
                                doneCallback();
                            },
                            changeManager: session.apolloDataStore.changeManager,
                        },
                    ]);
                },
            },
            {
                label: 'Add reference sequence aliases',
                onClick: (session) => {
                    session.queueDialog((doneCallback) => [
                        AddRefSeqAliases,
                        {
                            session,
                            handleClose: () => {
                                doneCallback();
                            },
                            changeManager: session.apolloDataStore.changeManager,
                        },
                    ]);
                },
            },
            {
                label: 'Add Assembly aliases',
                onClick: (session) => {
                    session.queueDialog((doneCallback) => [
                        AddAssemblyAliases,
                        {
                            session,
                            handleClose: () => {
                                doneCallback();
                            },
                            changeManager: session.apolloDataStore.changeManager,
                        },
                    ]);
                },
            },
            {
                label: 'Manage Users',
                icon: PersonIcon,
                onClick: (session) => {
                    session.queueDialog((doneCallback) => [
                        ManageUsers,
                        {
                            session,
                            handleClose: () => {
                                doneCallback();
                            },
                            changeManager: session.apolloDataStore.changeManager,
                        },
                    ]);
                },
            },
            {
                label: 'Manage Checks',
                icon: RuleIcon,
                onClick: (session) => {
                    session.queueDialog((doneCallback) => [
                        ManageChecks,
                        {
                            session,
                            handleClose: () => {
                                doneCallback();
                            },
                        },
                    ]);
                },
            },
        ],
    });
}

// Icon source: https://developers.google.com/identity/branding-guidelines
function Google(props) {
    const { color } = props;
    return (jsx(SvgIcon, { viewBox: "0 0 18 18", style: { fontSize: 18, marginRight: 4 }, ...props, children: color === 'disabled' ? (jsx("path", { d: "M9.001,10.71 l0,-3.348 l8.424,0 c0.126,0.567,0.225,1.098,0.225,1.845 c0,5.139,-3.447,8.793,-8.64,8.793 c-4.968,0,-9,-4.032,-9,-9 c0,-4.968,4.032,-9,9,-9 c2.43,0,4.464,0.891,6.021,2.349 l-2.556,2.484 c-0.648,-0.612,-1.782,-1.332,-3.465,-1.332 c-2.979,0,-5.409,2.475,-5.409,5.508 c0,3.033,2.43,5.508,5.409,5.508 c3.447,0,4.716,-2.385,4.95,-3.798 l-4.959,0 l0,-0.009 z" })) : (jsxs(Fragment, { children: [jsx("path", { d: "M17.64,9.20454545 c0,-0.638,-0.057,-1.252,-0.164,-1.841 l-8.476,0 l0,3.481 l4.844,0 c-0.209,1.125,-0.843,2.079,-1.796,2.717 l0,2.258 l2.908,0 c1.702,-1.567,2.684,-3.874,2.684,-6.615 l0,0 z", fill: "#4285F4" }), jsx("path", { d: "M9,18 c2.43,0,4.467,-0.806,5.956,-2.18 l-2.908,-2.259 c-0.806,0.54,-1.837,0.859,-3.048,0.859 c-2.344,0,-4.328,-1.583,-5.036,-3.71 l-3.007,0 l0,2.332 c1.481,2.941,4.525,4.958,8.043,4.958 l0,0 z", fill: "#34A853" }), jsx("path", { d: "M3.96409091,10.71 c-0.18,-0.54,-0.282,-1.117,-0.282,-1.71 c0,-0.593,0.102,-1.17,0.282,-1.71 l0,-2.332 l-3.007,0 c-0.609,1.215,-0.957,2.59,-0.957,4.042 c0,1.452,0.348,2.827,0.957,4.042 l3.007,-2.332 l0,0 z", fill: "#FBBC05" }), jsx("path", { d: "M9,3.57954545 c1.321,0,2.508,0.454,3.44,1.346 l2.582,-2.581 c-1.559,-1.453,-3.596,-2.345,-6.022,-2.345 c-3.518,0,-6.562,2.017,-8.043,4.959 l3.007,2.331 c0.708,-2.127,2.692,-3.71,5.036,-3.71 l0,0 z", fill: "#EA4335" })] })) }));
}
// Icon source: https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-add-branding-in-azure-ad-apps
function Microsoft(props) {
    const { color } = props;
    return (jsxs(SvgIcon, { viewBox: "0 0 21 21", style: { fontSize: 21 }, ...props, children: [jsx("rect", { x: "1", y: "1", width: "9", height: "9", fill: color === 'disabled' ? '#7B7B7B' : '#F25022' }), jsx("rect", { x: "1", y: "11", width: "9", height: "9", fill: color === 'disabled' ? '#7B7B7B' : '#00A4EF' }), jsx("rect", { x: "11", y: "1", width: "9", height: "9", fill: color === 'disabled' ? '#939393' : '#7FBA00' }), jsx("rect", { x: "11", y: "11", width: "9", height: "9", fill: color === 'disabled' ? '#B9B9B9' : '#FFB900' })] }));
}

const useStyles$d = makeStyles()((theme) => ({
    loginButton: {
        marginBottom: theme.spacing(1),
        width: '220px',
        height: '40px',
        fontSize: '16px',
        textTransform: 'none',
        justifyContent: 'left',
        padding: '3px 12px',
    },
}));
function GoogleButton(props) {
    const { classes } = useStyles$d();
    const { disabled } = props;
    return (jsx(Button, { className: classes.loginButton, variant: "outlined", startIcon: jsx(Google, { color: disabled ? 'disabled' : undefined }), ...props, children: "Sign in with Google" }));
}
function MicrosoftButton(props) {
    const { classes } = useStyles$d();
    const { disabled } = props;
    return (jsx(Button, { className: classes.loginButton, variant: "outlined", startIcon: jsx(Microsoft, { color: disabled ? 'disabled' : undefined }), ...props, children: "Sign in with Microsoft" }));
}
function GuestButton(props) {
    const { classes } = useStyles$d();
    return (jsx(Button, { className: classes.loginButton, variant: "outlined", startIcon: jsx(AccountCircleIcon, { fontSize: "small" }), ...props, children: "Continue as Guest" }));
}

const useStyles$c = makeStyles()((theme) => ({
    divider: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(5),
    },
}));
const AuthTypeSelector = ({ baseURL, handleClose, name, }) => {
    const { classes } = useStyles$c();
    const [errorMessage, setErrorMessage] = useState('');
    const [loginTypes, setLoginTypes] = useState([]);
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        async function getAuthTypes() {
            const uri = new URL('auth/types', baseURL).href;
            const response = await fetch(uri, { method: 'GET', signal });
            if (!response.ok) {
                const newErrorMessage = await createFetchErrorMessage(response, 'Error when retrieving auth types from server');
                setErrorMessage(newErrorMessage);
                return;
            }
            const data = (await response.json());
            setLoginTypes(data);
        }
        getAuthTypes().catch((error) => {
            if (!isAbortException(error)) {
                setErrorMessage(String(error));
            }
        });
        return () => {
            controller.abort(new DOMException('Error retrieving valid authentication types', 'AbortError'));
        };
    }, [baseURL]);
    function handleClick(authType) {
        if (authType === 'google') {
            handleClose('google');
        }
        else if (authType === 'microsoft') {
            handleClose('microsoft');
        }
        else {
            handleClose('guest');
        }
    }
    const allowGoogle = loginTypes.includes('google');
    const allowMicrosoft = loginTypes.includes('microsoft');
    const allowGuest = loginTypes.includes('guest');
    return (jsxs(Dialog, { open: true, title: `Log in to ${name}`, handleClose: handleClose, maxWidth: false, "data-testid": "login-apollo", children: [jsxs(DialogContent, { style: { display: 'flex', flexDirection: 'column', paddingTop: 8 }, children: [allowGoogle ? (jsx(GoogleButton, { disabled: !allowGoogle, onClick: () => {
                            handleClick('google');
                        } })) : null, allowMicrosoft ? (jsx(MicrosoftButton, { disabled: !allowMicrosoft, onClick: () => {
                            handleClick('microsoft');
                        } })) : null, allowGuest ? (jsxs(Fragment, { children: [jsx(Divider, { className: classes.divider }), jsx(GuestButton, { onClick: () => {
                                    handleClick('guest');
                                } })] })) : null] }), jsx(DialogActions, { children: jsx(Button, { variant: "outlined", type: "submit", onClick: () => {
                        handleClose();
                    }, children: "Cancel" }) }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
};

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
const inWebWorker$1 = typeof sessionStorage === 'undefined';
const stateModelFactory$3 = (configSchema) => {
    return InternetAccount.named('ApolloInternetAccount')
        .props({
        type: types.literal('ApolloInternetAccount'),
        configuration: ConfigurationReference(configSchema),
    })
        .views((self) => ({
        get baseURL() {
            return getConf(self, 'baseURL');
        },
        getUserId() {
            const token = self.retrieveToken();
            if (!token) {
                return;
            }
            const dec = getDecodedToken(token);
            return dec.id;
        },
    }))
        .volatile(() => ({
        role: undefined,
        controller: new AbortController(),
    }))
        .actions((self) => ({
        setRole() {
            const token = self.retrieveToken();
            if (!token) {
                self.role = undefined;
                return;
            }
            const dec = getDecodedToken(token);
            const { role } = dec;
            if (self.role !== role) {
                self.role = role;
            }
        },
    }))
        .actions((self) => {
        let listener;
        return {
            addMessageChannel(resolve, reject) {
                listener = (event) => {
                    this.finishOAuthWindow(event, resolve, reject);
                };
                window.addEventListener('message', listener);
            },
            deleteMessageChannel() {
                window.removeEventListener('message', listener);
            },
            finishOAuthWindow(event, resolve, reject) {
                if (event.data.name !== `JBrowseAuthWindow-${self.internetAccountId}`) {
                    return;
                }
                const redirectUriWithInfo = event.data.redirectUri;
                const fixedQueryString = redirectUriWithInfo.replace('#', '?');
                const redirectUrl = new URL(fixedQueryString);
                const queryStringSearch = redirectUrl.search;
                const urlParams = new URLSearchParams(queryStringSearch);
                const token = urlParams.get('access_token');
                this.deleteMessageChannel();
                if (!token) {
                    reject(new Error('Error with token endpoint'));
                    return;
                }
                self.storeToken(token);
                self.setRole();
                resolve(token);
            },
            async openAuthWindow(type, resolve, reject) {
                const redirectUri = isElectron
                    ? 'http://localhost/auth'
                    : globalThis.location.origin + globalThis.location.pathname;
                const url = new URL('auth/login', self.baseURL);
                const params = new URLSearchParams({
                    type,
                    redirect_uri: redirectUri,
                });
                url.search = params.toString();
                const eventName = `JBrowseAuthWindow-${self.internetAccountId}`;
                if (isElectron) {
                    const { ipcRenderer } = globalThis.require('electron');
                    const redirectUriFromElectron = await ipcRenderer.invoke('openAuthWindow', {
                        internetAccountId: self.internetAccountId,
                        data: { redirect_uri: redirectUri },
                        url: url.toString(),
                    });
                    const eventFromDesktop = new MessageEvent('message', {
                        data: { name: eventName, redirectUri: redirectUriFromElectron },
                    });
                    this.finishOAuthWindow(eventFromDesktop, resolve, reject);
                }
                else {
                    this.addMessageChannel(resolve, reject);
                    window.open(url, eventName, 'width=500,height=600');
                }
            },
        };
    })
        .actions((self) => ({
        async getTokenFromUser(resolve, reject) {
            const { baseURL } = self;
            const authType = await new Promise((resolve, reject) => {
                const { session } = getRoot(self);
                const { baseURL, name } = self;
                session.queueDialog((doneCallback) => [
                    AuthTypeSelector,
                    {
                        name,
                        handleClose: (newAuthType) => {
                            if (!newAuthType) {
                                reject(new Error('user cancelled entry'));
                            }
                            else if (newAuthType instanceof Error) {
                                reject(newAuthType);
                            }
                            else {
                                resolve(newAuthType);
                            }
                            doneCallback();
                        },
                        baseURL,
                    },
                ]);
            });
            if (authType !== 'guest') {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                self.openAuthWindow(authType, resolve, reject);
                return;
            }
            const url = new URL('auth/login', baseURL);
            const searchParams = new URLSearchParams({ type: authType });
            url.search = searchParams.toString();
            const uri = url.toString();
            const response = await fetch(uri, { signal: self.controller.signal });
            if (!response.ok) {
                const errorMessage = await createFetchErrorMessage(response, 'Error when logging in');
                reject(new Error(errorMessage));
                return;
            }
            const { token } = await response.json();
            resolve(token);
        },
    }))
        .volatile(() => ({
        lastChangeSequenceNumber: undefined,
    }))
        .actions((self) => ({
        setLastChangeSequenceNumber(sequenceNumber) {
            self.lastChangeSequenceNumber = sequenceNumber;
        },
    }))
        .actions((self) => ({
        updateLastChangeSequenceNumber: flow(function* updateLastChangeSequenceNumber() {
            const { baseURL } = self;
            const url = new URL('changes', baseURL);
            const searchParams = new URLSearchParams({ limit: '1' });
            url.search = searchParams.toString();
            const uri = url.toString();
            const apolloFetch = self.getFetcher({
                locationType: 'UriLocation',
                uri,
            });
            let response;
            try {
                response = yield apolloFetch(uri, {
                    method: 'GET',
                    signal: self.controller.signal,
                });
            }
            catch (error) {
                if (!self.controller.signal.aborted) {
                    console.error(error);
                }
                return;
            }
            if (!response.ok) {
                const errorMessage = yield createFetchErrorMessage(response, 'Error when fetching server LastChangeSequence');
                throw new Error(errorMessage);
            }
            const changes = yield response.json();
            const sequence = changes.length > 0 ? changes[0].sequence : 0;
            self.setLastChangeSequenceNumber(sequence);
        }),
        getMissingChanges: flow(function* getMissingChanges() {
            const { session } = getRoot(self);
            const { changeManager } = session.apolloDataStore;
            if (!self.lastChangeSequenceNumber) {
                throw new Error('No LastChangeSequence stored in session. Please, refresh you browser to get last updates from server');
            }
            const { baseURL, lastChangeSequenceNumber } = self;
            const url = new URL('changes', baseURL);
            const searchParams = new URLSearchParams({
                since: String(lastChangeSequenceNumber),
                sort: '1',
            });
            url.search = searchParams.toString();
            const uri = url.toString();
            const apolloFetch = self.getFetcher({
                locationType: 'UriLocation',
                uri,
            });
            let response;
            try {
                response = yield apolloFetch(uri, {
                    method: 'GET',
                    signal: self.controller.signal,
                });
            }
            catch (error) {
                if (!self.controller.signal.aborted) {
                    console.error(error);
                }
                return;
            }
            if (!response.ok) {
                console.error(`Error when fetching the last updates to recover socket connection — ${response.status}`);
                return;
            }
            const serializedChanges = yield response.json();
            for (const serializedChange of serializedChanges) {
                const change = Change.fromJSON(serializedChange);
                void changeManager.submit(change, { submitToBackend: false });
            }
        }),
    }))
        .volatile((self) => {
        const { origin, pathname: path } = new URL('socket.io/', self.baseURL);
        return { socket: io(origin, { path }) };
    })
        .actions((self) => ({
        addSocketListeners() {
            const { session } = getRoot(self);
            const { notify } = session;
            const token = self.retrieveToken();
            if (!token) {
                throw new Error('No Token found');
            }
            const user = getDecodedToken(token);
            const localSessionId = makeUserSessionId(user);
            const { socket } = self;
            const { addCheckResult, changeManager, deleteCheckResult } = session.apolloDataStore;
            socket.on('connect', () => {
                void self.getMissingChanges();
            });
            socket.on('connect_error', (error) => {
                console.error(error);
                notify('Could not connect to the Apollo server.', 'error');
            });
            socket.on('COMMON', (message) => {
                if ('checkResult' in message) {
                    if (message.deleted) {
                        deleteCheckResult(message.checkResult._id.toString());
                    }
                    else {
                        addCheckResult(message.checkResult);
                    }
                    return;
                }
                // Save server last change sequence into session storage
                sessionStorage.setItem('LastChangeSequence', String(message.changeSequence));
                if (message.userSessionId === localSessionId) {
                    return; // we did this change, no need to apply it again
                }
                const change = Change.fromJSON(message.changeInfo);
                void changeManager.submit(change, { submitToBackend: false });
            });
            socket.on('USER_LOCATION', (message) => {
                const { channel, locations, userName, userSessionId } = message;
                if (channel === 'USER_LOCATION' && userSessionId !== localSessionId) {
                    const collaborator = {
                        name: userName,
                        id: userSessionId,
                        locations,
                    };
                    session.addOrUpdateCollaborator(collaborator);
                }
            });
            socket.on('REQUEST_INFORMATION', (message) => {
                const { channel, userSessionId } = message;
                if (channel === 'REQUEST_INFORMATION' && userSessionId !== token) {
                    session.broadcastLocations();
                }
            });
        },
    }))
        .actions((self) => {
        async function postUserLocation(userLoc) {
            if (!isAlive(self) || self.role === 'none') {
                return;
            }
            const { baseURL, controller } = self;
            const url = new URL('users/userLocation', baseURL).href;
            const userLocation = new URLSearchParams(JSON.stringify(userLoc));
            const apolloFetch = self.getFetcher({
                locationType: 'UriLocation',
                uri: url,
            });
            try {
                const response = await apolloFetch(url, {
                    method: 'POST',
                    body: userLocation,
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error('ignore'); // ignore message, will get caught by "catch"
                }
            }
            catch {
                console.error('Broadcasting user location failed');
            }
        }
        const debounceTimeout = 300;
        const debouncePostUserLocation = (fn) => {
            let timeoutId;
            return (userLocation) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    fn(userLocation);
                }, debounceTimeout);
            };
        };
        return { postUserLocation: debouncePostUserLocation(postUserLocation) };
    })
        .volatile(() => ({ roleNotificationSent: false }))
        .actions((self) => {
        function beforeUnloadListener() {
            self.postUserLocation([]);
        }
        function visibilityChangeListener() {
            // fires when user switches tabs, apps, goes to homescreen, etc.
            if (document.visibilityState === 'hidden') {
                self.postUserLocation([]);
            }
            // fires when app transitions from prerender, user returns to the app / tab.
            if (document.visibilityState === 'visible') {
                const { session } = getRoot(self);
                session.broadcastLocations();
            }
        }
        return {
            initialize: flow(function* initialize(role) {
                if (role === 'none') {
                    if (!self.roleNotificationSent) {
                        const { session } = getRoot(self);
                        session.notify('You have registered as an Apollo user but have not been given access. Ask your administrator to enable access for your account.', 'warning');
                        self.roleNotificationSent = true;
                    }
                    return;
                }
                if (role === 'admin') {
                    const rootModel = getRoot(self);
                    if (isAbstractMenuManager(rootModel)) {
                        addTopLevelAdminMenus(rootModel);
                    }
                }
                // Get and set server last change sequence into session storage
                yield self.updateLastChangeSequenceNumber();
                // Open socket listeners
                self.addSocketListeners();
                // request user locations
                const { baseURL } = self;
                const uri = new URL('users/locations', baseURL).href;
                const apolloFetch = self.getFetcher({
                    locationType: 'UriLocation',
                    uri,
                });
                yield apolloFetch(uri, {
                    method: 'GET',
                    signal: self.controller.signal,
                });
                window.addEventListener('beforeunload', beforeUnloadListener);
                document.addEventListener('visibilitychange', visibilityChangeListener);
            }),
            removeBeforeUnloadListener() {
                window.removeEventListener('beforeunload', beforeUnloadListener);
            },
            removeVisibilityChangeListener() {
                document.removeEventListener('visibilitychange', visibilityChangeListener);
            },
        };
    })
        .actions((self) => ({
        afterAttach() {
            self.setRole();
            autorun(async (reaction) => {
                if (inWebWorker$1) {
                    return;
                }
                const { session } = getRoot(self);
                // This can be undefined if there is no session loaded, e.g. on
                // the start screen
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!session) {
                    return;
                }
                if (self.role) {
                    try {
                        await self.initialize(self.role);
                        reaction.dispose();
                    }
                    catch {
                        // if initialize fails, do nothing so the autorun runs again
                    }
                }
            }, { name: 'ApolloInternetAccount' });
        },
        beforeDestroy() {
            self.removeBeforeUnloadListener();
            self.removeVisibilityChangeListener();
            self.controller.abort(new DOMException('Cleaning up Apollo connection', 'AbortError'));
            self.socket.close();
        },
    }));
};

function isApolloRefNameAliasMessage(data) {
    return (typeof data === 'object' &&
        data !== null &&
        'apollo' in data &&
        data.apollo === true &&
        'refNameAliases' in data);
}
const isInWebWorker$1 = typeof sessionStorage === 'undefined';
class RefNameAliasAdapter extends BaseAdapter {
    refNameAliases;
    async getRefNameAliases() {
        const assemblyId = readConfObject(this.config, 'assemblyId');
        if (!isInWebWorker$1) {
            const dataStore = this.pluginManager?.rootModel?.session?.apolloDataStore;
            if (!dataStore) {
                throw new Error('No Apollo data store found');
            }
            const backendDriver = dataStore.getBackendDriver(assemblyId);
            if (!backendDriver) {
                throw new Error('No backend driver found');
            }
            const refNameAliases = await backendDriver.getRefNameAliases(assemblyId);
            return refNameAliases;
        }
        const refNameAliases = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('timeout'));
            }, 20_000);
            const messageId = nanoid();
            const messageListener = (event) => {
                const data = event.data;
                if (!isApolloRefNameAliasMessage(data)) {
                    return;
                }
                if (data.messageId !== messageId) {
                    return;
                }
                clearTimeout(timeoutId);
                removeEventListener('message', messageListener);
                resolve(data.refNameAliases);
            };
            addEventListener('message', messageListener);
            rpcServer.emit('apollo', {
                apollo: true,
                method: 'getRefNameAliases',
                assembly: assemblyId,
                messageId,
            });
        });
        this.refNameAliases = refNameAliases;
        return refNameAliases;
    }
    freeResources() {
        // no resources to free
    }
}

var configSchema$5 = ConfigurationSchema('ApolloRefNameAliasAdapter', {
    assemblyId: {
        type: 'string',
        defaultValue: '',
    },
}, { explicitlyTyped: true });

function installApolloRefNameAliasAdapter(pluginManager) {
    pluginManager.addAdapterType(() => new AdapterType({
        name: 'ApolloRefNameAliasAdapter',
        configSchema: configSchema$5,
        adapterMetadata: {
            category: undefined,
            hiddenFromGUI: true,
            description: undefined,
        },
        AdapterClass: RefNameAliasAdapter,
    }));
}

/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
function isApolloMessageData$1(data) {
    return (typeof data === 'object' &&
        data !== null &&
        'apollo' in data &&
        data.apollo === true);
}
const isInWebWorker = typeof sessionStorage === 'undefined';
class ApolloSequenceAdapter extends BaseSequenceAdapter {
    regions;
    async getRefNames() {
        const regions = await this.getRegions();
        return regions.map((regions) => regions.refName);
    }
    async getRegions() {
        if (this.regions) {
            return this.regions;
        }
        const assemblyId = readConfObject(this.config, 'assemblyId');
        if (!isInWebWorker) {
            const dataStore = this.pluginManager?.rootModel?.session?.apolloDataStore;
            if (!dataStore) {
                throw new Error('No Apollo data store found');
            }
            const backendDriver = dataStore.getBackendDriver(assemblyId);
            if (!backendDriver) {
                throw new Error('No backend driver found');
            }
            const regions = await backendDriver.getRegions(assemblyId);
            this.regions = regions;
            return regions;
        }
        const regions = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject('timeout');
            }, 20_000);
            const messageId = nanoid();
            const messageListener = (event) => {
                const { data } = event;
                if (!isApolloMessageData$1(data)) {
                    return;
                }
                if (data.messageId !== messageId) {
                    return;
                }
                clearTimeout(timeoutId);
                removeEventListener('message', messageListener);
                resolve(data.regions);
            };
            addEventListener('message', messageListener);
            // @ts-expect-error waiting for types to be published
            globalThis.rpcServer.emit('apollo', {
                apollo: true,
                method: 'getRegions',
                assembly: assemblyId,
                messageId,
            });
        });
        this.regions = regions;
        return regions;
    }
    /**
     * Fetch features for a certain region
     * @param param -
     * @returns Observable of Feature objects in the region
     */
    getFeatures(region) {
        const { end, refName, start } = region;
        const assemblyId = readConfObject(this.config, 'assemblyId');
        const regionWithAssemblyName = { ...region, assemblyName: assemblyId };
        return ObservableCreate(async (observer) => {
            if (!isInWebWorker) {
                const dataStore = this.pluginManager?.rootModel?.session?.apolloDataStore;
                if (!dataStore) {
                    observer.error('No Apollo data store found');
                    return;
                }
                const backendDriver = dataStore.getBackendDriver(assemblyId);
                if (!backendDriver) {
                    observer.error('No backend driver found');
                    return;
                }
                const regions = await backendDriver.getRegions(regionWithAssemblyName.assemblyName);
                const region = regions.find((region) => region.refName === regionWithAssemblyName.refName);
                if (!region) {
                    observer.error('Cannot get region');
                    return;
                }
                if (regionWithAssemblyName.end > region.end) {
                    regionWithAssemblyName.end = region.end;
                }
                const { seq } = await backendDriver.getSequence(regionWithAssemblyName);
                observer.next(new SimpleFeature({
                    id: `${refName} ${start}-${end}`,
                    data: { refName, start, end, seq },
                }));
                observer.complete();
                return;
            }
            const seq = await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject('timeout');
                }, 20_000);
                const messageId = nanoid();
                const messageListener = (event) => {
                    const { data } = event;
                    if (!isApolloMessageData$1(data)) {
                        return;
                    }
                    if (data.messageId !== messageId) {
                        return;
                    }
                    clearTimeout(timeoutId);
                    removeEventListener('message', messageListener);
                    resolve(data.sequence);
                };
                addEventListener('message', messageListener);
                // @ts-expect-error waiting for types to be published
                globalThis.rpcServer.emit('apollo', {
                    apollo: true,
                    method: 'getSequence',
                    region: regionWithAssemblyName,
                    messageId,
                });
            });
            observer.next(new SimpleFeature({
                id: `${refName} ${start}-${end}`,
                data: { refName, start, end, seq },
            }));
            observer.complete();
        });
    }
    /**
     * called to provide a hint that data tied to a certain region
     * will not be needed for the foreseeable future and can be purged
     * from caches, etc
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    freeResources( /* { region } */) { }
}

var configSchema$4 = ConfigurationSchema('ApolloSequenceAdapter', {
    assemblyId: {
        type: 'string',
        defaultValue: '',
    },
}, { explicitlyTyped: true });

function installApolloSequenceAdapter(pluginManager) {
    pluginManager.addAdapterType(() => new AdapterType({
        name: 'ApolloSequenceAdapter',
        configSchema: configSchema$4,
        adapterMetadata: {
            category: undefined,
            hiddenFromGUI: true,
            description: undefined,
        },
        AdapterClass: ApolloSequenceAdapter,
    }));
}

function getMatchedFeature(query, feature) {
    // @ts-expect-error this actually has a bit more info that a plain snapshot
    const { children, indexedIds, ...featureWithoutChildren } = feature;
    const featureString = JSON.stringify(featureWithoutChildren);
    if (featureString.includes(query)) {
        return feature;
    }
    if (!children) {
        return undefined;
    }
    for (const subFeature of Object.values(children)) {
        const matchedFeature = getMatchedFeature(query, subFeature);
        if (matchedFeature) {
            return matchedFeature;
        }
    }
}
class ApolloTextSearchAdapter extends BaseAdapter {
    get baseURL() {
        return readConfObject(this.config, 'baseURL').uri;
    }
    get trackId() {
        return readConfObject(this.config, 'trackId');
    }
    get assemblyNames() {
        return readConfObject(this.config, 'assemblyNames');
    }
    mapBaseResult(features, assembly, query) {
        return features.map((feature) => {
            const matchedObject = getMatchedFeature(query, feature) ?? feature;
            const refName = assembly.getCanonicalRefName(feature.refSeq);
            return new BaseResult({
                label: query,
                trackId: this.trackId,
                locString: `${refName}:${matchedObject.min + 1}..${matchedObject.max}`,
                matchedObject,
            });
        });
    }
    async searchIndex(args) {
        const query = args.queryString;
        const results = [];
        const session = this.pluginManager?.rootModel?.session;
        if (!session) {
            return results;
        }
        const { apolloDataStore } = session;
        const { assemblyManager } = session;
        for (const assemblyName of this.assemblyNames) {
            const backendDriver = apolloDataStore.getBackendDriver(assemblyName);
            const assembly = assemblyManager.get(assemblyName);
            if (!(backendDriver && assembly)) {
                continue;
            }
            const features = await backendDriver.searchFeatures(args.queryString, [
                assemblyName,
            ]);
            results.push(...this.mapBaseResult(features, assembly, query));
        }
        return results;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    freeResources() { }
}

var configSchema$3 = ConfigurationSchema('ApolloTextSearchAdapter', {
    assemblyNames: {
        type: 'stringArray',
        defaultValue: [],
        description: 'List of assemblies covered by text search adapter',
    },
    trackId: {
        type: 'string',
        defaultValue: '',
    },
    baseURL: {
        type: 'fileLocation',
        defaultValue: {
            uri: '',
            locationType: 'UriLocation',
        },
    },
}, { explicitlyTyped: true, explicitIdentifier: 'textSearchAdapterId' });

function installApolloTextSearchAdapter(pluginManager) {
    pluginManager.addTextSearchAdapterType(() => new TextSearchAdapterType({
        name: 'ApolloTextSearchAdapter',
        displayName: 'Apollo text search adapter',
        configSchema: configSchema$3,
        AdapterClass: ApolloTextSearchAdapter,
        description: 'Apollo Text Search adapter',
    }));
}

const useStyles$b = makeStyles()((theme) => ({
    attributeKey: {
        fontWeight: 'bold',
        marginRight: theme.spacing(2),
    },
}));
function AttributeKey({ attributeKey: key }) {
    const { classes } = useStyles$b();
    const startsWithCapital = /^[A-Z]/.test(key);
    let displayKey = key;
    let titleText;
    if (isGFFInternalAttribute(key)) {
        displayKey = internalToGFF[key];
        titleText = `On GFF3 export, this will be assigned to the GFF3's reserved "${displayKey}" attribute`;
    }
    else if (isGFFColumnInternal(key)) {
        displayKey = gffInternalToColumn[key];
        titleText = `On GFF3 export, this will be placed in the GFF3's "${displayKey}" column`;
    }
    else if (startsWithCapital) {
        titleText =
            'On GFF3 export, this attribute will be changed to start with a lower-case letter because attributes starting with an upper-case letter are reserved in GFF3';
    }
    return (jsxs("div", { style: { display: 'flex' }, children: [jsx(Typography, { className: classes.attributeKey, children: displayKey }), titleText ? (jsx(Tooltip, { title: titleText, children: jsx(Chip, { icon: jsx(InfoIcon, {}), label: "GFF3", size: "small", variant: "outlined" }) })) : null] }));
}

const customKeyName = 'Custom';
const gffKeys = {
    [customKeyName]: 'custom',
};
for (const [value, key] of Object.entries(gffToInternal)) {
    gffKeys[`GFF ${key}`] = value;
}
for (const [value, key] of Object.entries(gffColumnToInternal)) {
    gffKeys[`GFF ${key}`] = value;
}
const AttributeKeySelector = observer(function AttributeKeySelector({ setKey, session, }) {
    const { pluginManager } = getEnv(session);
    const reservedKeys = pluginManager.evaluateExtensionPoint('Apollo-ReservedAttributeKeys', gffKeys);
    const firstKey = Object.keys(reservedKeys).at(0) ?? customKeyName;
    const [selectedKey, setSelectedKey] = useState(firstKey);
    const [customKey, setCustomKey] = useState();
    const isCustom = selectedKey === customKeyName;
    function handleSubmit(event) {
        event.preventDefault();
        if (isCustom) {
            setKey(customKey);
            return;
        }
        setKey(reservedKeys[selectedKey]);
    }
    function handleCancel() {
        setKey();
    }
    return (jsxs("form", { onSubmit: handleSubmit, children: [jsxs("div", { style: { display: 'flex', flexDirection: 'column', margin: 8 }, children: [jsxs(FormControl, { variant: "outlined", children: [jsx(InputLabel, { id: "attribute-key-select-label", children: "Key" }), jsx(Select, { labelId: "attribute-key-select-label", value: selectedKey, label: "Key", onChange: (event) => {
                                    setSelectedKey(event.target.value);
                                }, children: Object.keys(reservedKeys).map((val) => (jsx(MenuItem, { value: val, children: val }, val))) })] }), isCustom ? (jsx(TextField, { label: "Attribute key", variant: "outlined", id: "attributeKey", onChange: (event) => {
                            setCustomKey(event.target.value);
                        } })) : null] }), jsxs(DialogActions, { children: [jsx(Button, { color: "primary", variant: "contained", type: "submit", disabled: isCustom && !customKey, children: "Add" }), jsx(Button, { variant: "outlined", onClick: handleCancel, children: "Cancel" })] })] }));
});

const StringTextField = observer(function StringTextField({ onChangeCommitted, value: initialValue, ...props }) {
    const [value, setValue] = useState(String(initialValue));
    const [blur, setBlur] = useState(false);
    const [inputNode, setInputNode] = useState(null);
    useEffect(() => {
        setValue(String(initialValue));
    }, [initialValue]);
    useEffect(() => {
        if (blur) {
            inputNode?.blur();
            setBlur(false);
        }
    }, [blur, inputNode]);
    function onChange(event) {
        setValue(event.target.value);
    }
    return (jsx(TextField, { ...props, type: "text", onChange: onChange, value: value, onKeyDown: (event) => {
            if (event.key === 'Enter') {
                inputNode?.blur();
            }
            else if (event.key === 'Escape') {
                setValue(String(initialValue));
                setBlur(true);
            }
        }, onBlur: () => {
            if (value !== String(initialValue)) {
                onChangeCommitted(value);
            }
        }, inputRef: (node) => {
            setInputNode(node);
        } }));
});

const DefaultAttributeEditor = observer(function DefaultAttributeEditor({ attributeValues, setAttribute, isNew = false, }) {
    const [newValues, setNewValues] = useState(attributeValues && attributeValues.length > 0 ? attributeValues : ['']);
    function updateValue(idx, newValue) {
        setNewValues((oldValues) => {
            const newValues = [...oldValues];
            newValues[idx] = newValue;
            return newValues;
        });
    }
    function deleteValue(idx) {
        setNewValues((oldValues) => {
            const newValues = [...oldValues];
            newValues.splice(idx, 1);
            return newValues;
        });
    }
    function addValue() {
        setNewValues((oldValues) => {
            const newValues = [...oldValues];
            newValues.push('');
            return newValues;
        });
    }
    return (jsxs(Fragment, { children: [newValues.map((value, idx) => (jsxs("div", { style: { display: 'flex' }, children: [jsx(StringTextField, { value: value, onChangeCommitted: (editedValue) => {
                            updateValue(idx, editedValue);
                        }, variant: "outlined", fullWidth: true }), jsx(IconButton, { "aria-label": "delete", size: "medium", edge: "end", onClick: () => {
                            deleteValue(idx);
                        }, children: jsx(DeleteIcon, { fontSize: "inherit" }) })] }, `${idx}-${value}`))), jsx(IconButton, { "aria-label": "add", size: "medium", color: "secondary", edge: "start", onClick: addValue, children: jsx(AddBoxIcon, { fontSize: "inherit" }) }), jsxs(DialogActions, { children: [jsx(Button, { color: "primary", variant: "contained", onClick: () => {
                            setAttribute(newValues.filter(Boolean));
                        }, children: isNew ? 'Add' : 'Update' }), jsx(Button, { variant: "outlined", type: "submit", onClick: () => {
                            setAttribute();
                        }, children: "Cancel" })] })] }));
});

function DefaultAttributeViewer({ values }) {
    return (jsx(Fragment, { children: values?.map((value, idx) => (jsx(Typography, { variant: "body2", color: "textSecondary", children: value }, `${idx}.${value}`))) }));
}

const useStyles$a = makeStyles()((theme) => ({
    list: {
        'li:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.focus,
        },
        'li:nth-of-type(even)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}));
const Attributes = observer(function Attributes({ assembly, editable, feature, session, }) {
    const { pluginManager } = getEnv(session);
    const { classes } = useStyles$a();
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedKey, setSelectedKey] = useState(null);
    const [editingKey, setEditingKey] = useState(null);
    const [showAddNewForm, setShowAddNewForm] = useState(false);
    const [newKey, setNewKey] = useState();
    const open = Boolean(anchorEl);
    const { changeManager } = session.apolloDataStore;
    const { notify } = session;
    function handleListMenuClick(event, key) {
        setAnchorEl(event.currentTarget);
        setSelectedKey(key);
    }
    function handleClose() {
        setAnchorEl(null);
        setSelectedKey(null);
    }
    function handleDelete() {
        if (selectedKey) {
            deleteFeatureAttribute(selectedKey);
        }
        handleClose();
    }
    function handleEdit() {
        if (selectedKey) {
            setEditingKey(selectedKey);
        }
        handleClose();
    }
    const { _id, attributes } = feature;
    function deleteFeatureAttribute(key) {
        const attributesSerialized = getSnapshot(attributes);
        const { [key]: deletedAttribute, ...remainingAttributes } = attributesSerialized;
        const change = new FeatureAttributeChange({
            changedIds: [_id],
            typeName: 'FeatureAttributeChange',
            assembly,
            featureId: _id,
            oldAttributes: attributesSerialized,
            newAttributes: remainingAttributes,
        });
        void changeManager.submit(change);
    }
    function modifyFeatureAttribute(key, attribute) {
        const serializedAttributes = { ...getSnapshot(attributes) };
        const oldAttributes = structuredClone(serializedAttributes);
        if (!(key in serializedAttributes)) {
            notify(`"${key}" not found in feature attributes`, 'error');
            return;
        }
        const oldAttribute = serializedAttributes[key];
        if (oldAttribute.toString() === attribute.toString()) {
            return;
        }
        serializedAttributes[key] = attribute;
        const change = new FeatureAttributeChange({
            changedIds: [feature._id],
            typeName: 'FeatureAttributeChange',
            assembly,
            featureId: feature._id,
            oldAttributes,
            newAttributes: serializedAttributes,
        });
        void changeManager.submit(change);
    }
    function addFeatureAttribute(key, attribute) {
        const serializedAttributes = { ...getSnapshot(attributes) };
        const oldAttributes = structuredClone(serializedAttributes);
        if (key in serializedAttributes) {
            notify(`Feature already has attribute "${key}"`, 'error');
            return;
        }
        serializedAttributes[key] = attribute;
        const change = new FeatureAttributeChange({
            changedIds: [feature._id],
            typeName: 'FeatureAttributeChange',
            assembly,
            featureId: feature._id,
            oldAttributes,
            newAttributes: serializedAttributes,
        });
        void changeManager.submit(change);
    }
    const NewKeyAttributeEditor = pluginManager.evaluateExtensionPoint('Apollo-AttributeEditorComponent', DefaultAttributeEditor, { key: newKey });
    return (jsxs(Fragment, { children: [jsxs(List, { className: classes.list, children: [entries(attributes).map(([key, values]) => {
                        const AttributeEditor = pluginManager.evaluateExtensionPoint('Apollo-AttributeEditorComponent', DefaultAttributeEditor, { key });
                        const AttributeViewer = pluginManager.evaluateExtensionPoint('Apollo-AttributeViewerComponent', DefaultAttributeViewer, { key });
                        return (jsx(ListItem, { secondaryAction: editable && !editingKey ? (jsx(IconButton, { edge: "end", onClick: (event) => {
                                    handleListMenuClick(event, key);
                                }, children: jsx(MoreHorizIcon, {}) })) : null, children: jsx(ListItemText, { disableTypography: true, primary: jsx(AttributeKey, { attributeKey: key }), secondary: editingKey === key ? (jsx(AttributeEditor, { session: session, attributeValues: values, setAttribute: (newValues) => {
                                        setEditingKey(null);
                                        if (newValues) {
                                            modifyFeatureAttribute(key, newValues);
                                        }
                                    } })) : (jsx(AttributeViewer, { values: values })) }) }, key));
                    }), newKey ? (jsx(ListItem, { children: jsx(ListItemText, { disableTypography: true, primary: jsx(AttributeKey, { attributeKey: newKey }), secondary: jsx(NewKeyAttributeEditor, { session: session, attributeValues: [], setAttribute: (newValues) => {
                                    if (newValues) {
                                        addFeatureAttribute(newKey, newValues);
                                    }
                                    setNewKey(undefined);
                                }, isNew: true }) }) })) : null] }), editable ? (jsx(Button, { color: "primary", variant: "contained", disabled: showAddNewForm || Boolean(newKey), onClick: () => {
                    setShowAddNewForm(true);
                }, children: "Add new" })) : null, showAddNewForm ? (jsx(Paper, { variant: "outlined", style: { marginTop: 8 }, children: jsx(AttributeKeySelector, { session: session, setKey: (newKey) => {
                        setNewKey(newKey);
                        setShowAddNewForm(false);
                    } }) })) : null, jsxs(Menu, { anchorEl: anchorEl, open: open, onClose: handleClose, children: [jsxs(MenuItem, { onClick: handleDelete, children: [jsx(ListItemIcon, { children: jsx(DeleteIcon, { fontSize: "small" }) }), jsx(Typography, { variant: "inherit", children: "Delete" })] }), jsxs(MenuItem, { onClick: handleEdit, children: [jsx(ListItemIcon, { children: jsx(EditIcon, { fontSize: "small" }) }), jsx(Typography, { variant: "inherit", children: "Edit" })] })] })] }));
});

const NumberTextField = observer(function NumberTextField({ onChangeCommitted, value: initialValue, ...props }) {
    const [value, setValue] = useState(String(initialValue));
    const [blur, setBlur] = useState(false);
    const [inputNode, setInputNode] = useState(null);
    useEffect(() => {
        setValue(String(initialValue));
    }, [initialValue]);
    useEffect(() => {
        if (blur) {
            inputNode?.blur();
            setBlur(false);
        }
    }, [blur, inputNode]);
    function onChange(event) {
        setValue(event.target.value);
    }
    const error = Number.isNaN(Number(value));
    return (jsx(TextField, { ...props, type: "text", onChange: onChange, value: value, onKeyDown: (event) => {
            if (event.key === 'Enter') {
                inputNode?.blur();
            }
            else if (event.key === 'Escape') {
                setValue(String(initialValue));
                setBlur(true);
            }
        }, onBlur: () => {
            const valueAsNumber = Number(value);
            if (value !== String(initialValue)) {
                if (Number.isNaN(valueAsNumber)) {
                    setValue(String(initialValue));
                }
                else {
                    const success = onChangeCommitted(valueAsNumber);
                    if (!success) {
                        setValue(String(initialValue));
                    }
                }
            }
        }, inputRef: (node) => {
            setInputNode(node);
        }, error: error, helperText: error ? 'Not a valid number' : undefined }));
});

const BasicInformation = observer(function BasicInformation({ assembly, feature, session, }) {
    const [errorMessage, setErrorMessage] = useState('');
    const [typeWarningText, setTypeWarningText] = useState('');
    const { _id, assemblyId, max, min, strand, type } = feature;
    const notifyError = (e) => {
        session.notify(e.message, 'error');
    };
    const { changeManager } = session.apolloDataStore;
    function handleTypeChange(newType) {
        setErrorMessage('');
        const featureId = _id;
        const change = new TypeChange({
            typeName: 'TypeChange',
            changedIds: [featureId],
            featureId,
            oldType: type,
            newType,
            assembly: assemblyId,
        });
        return changeManager.submit(change);
    }
    function handleStrandChange(event) {
        const { value } = event.target;
        const newStrand = value ? Number(value) : undefined;
        const change = new StrandChange({
            typeName: 'StrandChange',
            changedIds: [_id],
            featureId: _id,
            oldStrand: strand,
            newStrand,
            assembly,
        });
        return changeManager.submit(change);
    }
    function handleStartChange(newStart) {
        newStart--;
        const change = new LocationStartChange({
            typeName: 'LocationStartChange',
            changedIds: [_id],
            featureId: _id,
            oldStart: min,
            newStart,
            assembly,
        });
        void changeManager.submit(change);
        return true;
    }
    function handleEndChange(newEnd) {
        const change = new LocationEndChange({
            typeName: 'LocationEndChange',
            changedIds: [_id],
            featureId: _id,
            oldEnd: max,
            newEnd,
            assembly,
        });
        void changeManager.submit(change);
        return true;
    }
    async function fetchValidTerms(parentFeature, ontologyStore, _signal) {
        const terms = await fetchValidDescendantTerms(parentFeature, ontologyStore);
        if (!terms) {
            setTypeWarningText(`Type "${parentFeature?.type}" does not have any children in the ontology`);
            return;
        }
        return terms;
    }
    return (jsxs("div", { "data-testid": "basic_information", children: [jsx(NumberTextField, { margin: "dense", id: "start", label: "Start", fullWidth: true, variant: "outlined", value: min + 1, onChangeCommitted: handleStartChange }), jsx(NumberTextField, { margin: "dense", id: "end", label: "End", fullWidth: true, variant: "outlined", value: max, onChangeCommitted: handleEndChange }), jsx(OntologyTermAutocomplete, { session: session, ontologyName: "Sequence Ontology", value: type, filterTerms: isOntologyClass, fetchValidTerms: fetchValidTerms.bind(null, feature), renderInput: (params) => (jsx(TextField, { ...params, label: "Type", variant: "outlined", fullWidth: true, error: Boolean(typeWarningText), helperText: typeWarningText })), onChange: (oldValue, newValue) => {
                    if (newValue) {
                        handleTypeChange(newValue).catch(notifyError);
                    }
                } }), jsxs("label", { children: [jsx("input", { type: "radio", value: "1", checked: strand === 1, onChange: handleStrandChange }), "Positive Strand (+)"] }), jsxs("label", { children: [jsx("input", { type: "radio", value: "-1", checked: strand === -1, onChange: handleStrandChange }), "Negative Strand (-)"] }), jsxs("label", { children: [jsx("input", { type: "radio", value: "", checked: strand === undefined, onChange: handleStrandChange }), "No Strand Information"] }), errorMessage ? (jsx(Typography, { color: "error", children: errorMessage })) : null] }));
});

const FeatureDetailsNavigation = observer(function FeatureDetailsNavigation(props) {
    const { feature, model } = props;
    const { children, parent } = feature;
    const childFeatures = [];
    if (children) {
        for (const [, child] of children) {
            childFeatures.push(child);
        }
    }
    if (!(parent ?? childFeatures.length > 0)) {
        return null;
    }
    return (jsxs("div", { style: { marginTop: 10 }, children: [parent && (jsxs("div", { children: [jsx(Typography, { variant: "h6", children: "Parent:" }), jsxs(Button, { variant: "contained", onClick: () => {
                            model.setFeature(parent);
                        }, children: [parent.type, getFeatureNameOrId$1(parent), " (", parent.min, "..", parent.max, ")"] })] })), childFeatures.length > 0 && (jsxs("div", { children: [jsxs(Typography, { variant: "h6", children: [childFeatures.length === 1 ? 'Child' : 'Children', ":"] }), childFeatures.map((child) => (jsx("div", { style: { marginBottom: 5 }, children: jsxs(Button, { variant: "contained", onClick: () => {
                                model.setFeature(child);
                            }, children: [child.type, getFeatureNameOrId$1(child), " (", child.min, "..", child.max, ")"] }) }, child._id)))] }))] }));
});

function formatSequence(seq, refName, start, end, wrap) {
    const header = `>${refName}:${start + 1}–${end}\n`;
    const body = seq ;
    return `${header}${body}`;
}
const useStyles$9 = makeStyles()({
    sequence: {
        width: '100%',
        resize: 'vertical',
    },
});
const Sequence = observer(function Sequence({ assembly, feature, refName, session, }) {
    const currentAssembly = session.apolloDataStore.assemblies.get(assembly);
    const { classes } = useStyles$9();
    if (!(feature && currentAssembly)) {
        return null;
    }
    const refSeq = currentAssembly.getByRefName(refName);
    if (!refSeq) {
        return null;
    }
    const { max, min } = feature;
    let sequence = refSeq.getSequence(min, max);
    if (sequence) {
        sequence = formatSequence(sequence, refName, min, max);
    }
    else {
        void session.apolloDataStore.loadRefSeq([
            { assemblyName: assembly, refName, start: min, end: max },
        ]);
    }
    return (jsx("div", { children: jsx("textarea", { readOnly: true, rows: 20, className: classes.sequence, value: sequence }) }));
});

const useStyles$8 = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}));
const ApolloFeatureDetailsWidget = observer(function ApolloFeatureDetailsWidget(props) {
    const { model } = props;
    const { assembly, feature, refName } = model;
    const session = getSession(model);
    const currentAssembly = session.apolloDataStore.assemblies.get(assembly);
    const { classes } = useStyles$8();
    const [panelState, setPanelState] = useState(['attributes']);
    useEffect(() => {
        setPanelState(['attributes']);
    }, [feature]);
    if (!(feature && currentAssembly)) {
        return null;
    }
    const refSeq = currentAssembly.getByRefName(refName);
    if (!refSeq) {
        return null;
    }
    const { max, min } = feature;
    const sequence = refSeq.getSequence(min, max);
    if (!sequence) {
        void session.apolloDataStore.loadRefSeq([
            { assemblyName: assembly, refName, start: min, end: max },
        ]);
    }
    function handlePanelChange(expanded, panel) {
        if (expanded) {
            setPanelState([...panelState, panel]);
        }
        else {
            setPanelState(panelState.filter((p) => p !== panel));
        }
    }
    return (jsxs("div", { className: classes.root, children: [jsx(BasicInformation, { feature: feature, session: session, assembly: currentAssembly._id }), jsxs(Accordion, { style: { marginTop: 10 }, expanded: panelState.includes('attributes'), onChange: (e, expanded) => {
                    handlePanelChange(expanded, 'attributes');
                }, children: [jsx(AccordionSummary, { expandIcon: jsx(ExpandMoreIcon, { style: { color: 'white' } }), "aria-controls": "panel1-content", id: "panel1-header", children: jsx(Typography, { component: "span", children: "Attributes" }) }), jsx(AccordionDetails, { children: jsx(Attributes, { feature: feature, session: session, assembly: currentAssembly._id, editable: true }) })] }), jsxs(Accordion, { style: { marginTop: 10 }, expanded: panelState.includes('sequence'), onChange: (e, expanded) => {
                    handlePanelChange(expanded, 'sequence');
                }, children: [jsx(AccordionSummary, { expandIcon: jsx(ExpandMoreIcon, { style: { color: 'white' } }), "aria-controls": "panel2-content", id: "panel2-header", children: jsx(Typography, { component: "span", children: "Sequence" }) }), jsx(AccordionDetails, { children: panelState.includes('sequence') && (jsx(Sequence, { feature: feature, session: session, assembly: currentAssembly._id, refName: refName })) })] }), jsxs(Accordion, { style: { marginTop: 10 }, expanded: panelState.includes('related_features'), onChange: (e, expanded) => {
                    handlePanelChange(expanded, 'related_features');
                }, children: [jsx(AccordionSummary, { expandIcon: jsx(ExpandMoreIcon, { style: { color: 'white' } }), "aria-controls": "panel3-content", id: "panel3-header", children: jsx(Typography, { component: "span", children: "Related features" }) }), jsx(AccordionDetails, { children: jsx(FeatureDetailsNavigation, { model: model, feature: feature }) })] })] }));
});

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
const ApolloFeatureDetailsWidgetModel = types
    .model('ApolloFeatureDetailsWidget', {
    id: ElementId,
    type: types.literal('ApolloFeatureDetailsWidget'),
    feature: types.maybe(types.reference(AnnotationFeatureModel, {
        onInvalidated(ev) {
            ev.parent.setTryReload(ev.invalidId);
            ev.removeRef();
        },
    })),
    assembly: types.string,
    refName: types.string,
})
    .volatile(() => ({
    tryReload: undefined,
}))
    .actions((self) => ({
    setFeature(feature) {
        // @ts-expect-error Not sure why TS thinks these MST types don't match
        self.feature = feature;
    },
    setTryReload(featureId) {
        self.tryReload = featureId;
    },
}))
    .actions((self) => ({
    afterAttach() {
        addDisposer(self, autorun((reaction) => {
            if (!self.tryReload) {
                return;
            }
            const session = getSession(self);
            const { apolloDataStore } = session;
            if (!apolloDataStore) {
                return;
            }
            const feature = apolloDataStore.getFeature(self.tryReload);
            if (feature) {
                self.setFeature(feature);
                self.setTryReload();
                reaction.dispose();
            }
        }));
    },
}));
const ApolloTranscriptDetailsModel = types
    .model('ApolloTranscriptDetails', {
    id: ElementId,
    type: types.literal('ApolloTranscriptDetails'),
    feature: types.maybe(types.reference(AnnotationFeatureModel, {
        onInvalidated(ev) {
            ev.parent.setTryReload(ev.invalidId);
            ev.removeRef();
        },
    })),
    assembly: types.string,
    refName: types.string,
})
    .volatile(() => ({
    tryReload: undefined,
}))
    .actions((self) => ({
    setFeature(feature) {
        // @ts-expect-error Not sure why TS thinks these MST types don't match
        self.feature = feature;
    },
    setTryReload(featureId) {
        self.tryReload = featureId;
    },
}))
    .actions((self) => ({
    afterAttach() {
        addDisposer(self, autorun((reaction) => {
            if (!self.tryReload) {
                return;
            }
            const session = getSession(self);
            const { apolloDataStore } = session;
            if (!apolloDataStore) {
                return;
            }
            const feature = apolloDataStore.getFeature(self.tryReload);
            if (feature) {
                self.setFeature(feature);
                self.setTryReload();
                reaction.dispose();
            }
        }));
    },
}));

async function copyToClipboard(element) {
    if (isSecureContext) {
        const textBlob = new Blob([element.outerText], { type: 'text/plain' });
        const htmlBlob = new Blob([element.outerHTML], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({
            [textBlob.type]: textBlob,
            [htmlBlob.type]: htmlBlob,
        });
        return navigator.clipboard.write([clipboardItem]);
    }
    const copyCallback = (event) => {
        event.clipboardData?.setData('text/plain', element.outerText);
        event.clipboardData?.setData('text/html', element.outerHTML);
        event.preventDefault();
    };
    document.addEventListener('copy', copyCallback);
    // fall back to deprecated only in non-secure contexts
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand('copy');
    document.removeEventListener('copy', copyCallback);
}

const SEQUENCE_WRAP_LENGTH = 60;
function getSequenceLength(segments) {
    let length = 0;
    for (const segment of segments) {
        length += segment.sequence.length;
    }
    return length;
}
function getSequenceSegments(segmentType, feature, getSequence) {
    const segments = [];
    const { cdsLocations, strand, transcriptParts } = feature;
    switch (segmentType) {
        case 'genomic':
        case 'cDNA': {
            const [firstLocation] = transcriptParts;
            for (const loc of firstLocation) {
                if (segmentType === 'cDNA' && loc.type === 'intron') {
                    continue;
                }
                let sequence = getSequence(loc.min, loc.max);
                if (strand === -1) {
                    sequence = revcom(sequence);
                }
                const type = loc.type === 'fivePrimeUTR' || loc.type === 'threePrimeUTR'
                    ? 'UTR'
                    : loc.type;
                const previousSegment = segments.at(-1);
                if (!previousSegment) {
                    segments.push({
                        type,
                        sequence,
                        locs: [{ min: loc.min, max: loc.max }],
                    });
                    continue;
                }
                if (previousSegment.type === type) {
                    previousSegment.sequence += sequence;
                    previousSegment.locs.push({ min: loc.min, max: loc.max });
                }
                else {
                    segments.push({
                        type,
                        sequence,
                        locs: [{ min: loc.min, max: loc.max }],
                    });
                }
            }
            return segments;
        }
        case 'CDS': {
            let wholeSequence = '';
            const [firstLocation] = cdsLocations;
            const locs = [];
            for (const loc of firstLocation) {
                let locSeq = getSequence(loc.min, loc.max);
                if (strand === -1) {
                    locSeq = revcom(locSeq);
                }
                wholeSequence += locSeq;
                locs.push({ min: loc.min, max: loc.max });
            }
            segments.push({ type: 'CDS', sequence: wholeSequence, locs });
            return segments;
        }
        case 'protein': {
            let wholeSequence = '';
            const [firstLocation] = cdsLocations;
            const locs = [];
            for (const loc of firstLocation) {
                let locSeq = getSequence(loc.min, loc.max);
                if (strand === -1) {
                    locSeq = revcom(locSeq);
                }
                wholeSequence += locSeq;
                locs.push({ min: loc.min, max: loc.max });
            }
            let protein = '';
            for (let i = 0; i < wholeSequence.length; i += 3) {
                const codonSeq = wholeSequence.slice(i, i + 3).toUpperCase();
                protein +=
                    defaultCodonTable[codonSeq] || '&';
            }
            segments.push({ type: 'protein', sequence: protein, locs });
            return segments;
        }
    }
}
function getSegmentColor(type) {
    switch (type) {
        case 'upOrDownstream': {
            return 'rgb(255,255,255)';
        }
        case 'exon':
        case 'UTR': {
            return 'rgb(194,106,119)';
        }
        case 'CDS': {
            return 'rgb(93,168,153)';
        }
        case 'intron': {
            return 'rgb(187,187,187)';
        }
        case 'protein': {
            return 'rgb(148,203,236)';
        }
    }
}
function getLocationIntervals(seqSegments) {
    const locIntervals = [];
    const allLocs = seqSegments.flatMap((segment) => segment.locs);
    let [previous] = allLocs;
    for (let i = 1; i < allLocs.length; i++) {
        if (previous.min === allLocs[i].max || previous.max === allLocs[i].min) {
            previous = {
                min: Math.min(previous.min, allLocs[i].min),
                max: Math.max(previous.max, allLocs[i].max),
            };
        }
        else {
            locIntervals.push(previous);
            previous = allLocs[i];
        }
    }
    locIntervals.push(previous);
    return locIntervals;
}
const TranscriptSequence = observer(function TranscriptSequence({ assembly, feature, refName, session, }) {
    const currentAssembly = session.apolloDataStore.assemblies.get(assembly);
    const refData = currentAssembly?.getByRefName(refName);
    const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
    const defaultSelectedOption = 'genomic';
    const defaultSequenceOptions = ['genomic', 'cDNA'];
    const [sequenceOptions, setSequenceOptions] = useState(defaultSequenceOptions);
    const [selectedOption, setSelectedOption] = useState(defaultSelectedOption);
    const [sequenceSegments, setSequenceSegments] = useState(() => {
        return refData
            ? getSequenceSegments(defaultSelectedOption, feature, (min, max) => refData.getSequence(min, max))
            : [];
    });
    const [locationIntervals, setLocationIntervals] = useState(() => {
        return getLocationIntervals(sequenceSegments);
    });
    const theme = useTheme();
    const seqRef = useRef(null);
    useEffect(() => {
        const { cdsLocations } = feature;
        const [firstLocation] = cdsLocations;
        if (firstLocation.length > 0) {
            setSequenceOptions([...defaultSequenceOptions, 'CDS', 'protein']);
        }
        else {
            setSequenceOptions(defaultSequenceOptions);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feature]);
    if (!(currentAssembly && refData)) {
        return null;
    }
    const refSeq = currentAssembly.getByRefName(refName);
    if (!refSeq) {
        return null;
    }
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    if (!featureTypeOntology.isTypeOf(feature.type, 'transcript')) {
        return null;
    }
    function handleChangeSeqOption(e) {
        const option = e.target.value;
        setSelectedOption(option);
        const seqSegments = refData
            ? getSequenceSegments(option, feature, (min, max) => refData.getSequence(min, max))
            : [];
        const locIntervals = getLocationIntervals(seqSegments);
        setSequenceSegments(seqSegments);
        setLocationIntervals(locIntervals);
    }
    const onCopyClick = () => {
        const seqDiv = seqRef.current;
        if (!seqDiv) {
            return;
        }
        void copyToClipboard(seqDiv);
    };
    function wrapSequence(sequenceSegments, sequenceWrapLength) {
        const seqElements = [];
        let processedChars = 0;
        for (const [index, segment] of sequenceSegments.entries()) {
            const lastLineLength = processedChars % sequenceWrapLength;
            const segmentLineBreak = processedChars > 0 && lastLineLength === 0 ? '\n' : '';
            processedChars += segment.sequence.length;
            const firstLine = segmentLineBreak +
                segment.sequence.slice(0, sequenceWrapLength - lastLineLength);
            const remainingLines = splitStringIntoChunks(segment.sequence.slice(firstLine.length), sequenceWrapLength);
            const printLines = [firstLine, ...remainingLines];
            const span = (jsx("span", { style: {
                    background: getSegmentColor(segment.type),
                    color: theme.palette.getContrastText(getSegmentColor(segment.type)),
                    whiteSpace: 'pre-line',
                }, children: printLines.join('\n') }, `${segment.type}-${index}`));
            seqElements.push(span);
        }
        return seqElements;
    }
    return (jsxs(Fragment, { children: [jsx(Select, { defaultValue: "genomic", value: selectedOption, onChange: handleChangeSeqOption, size: "small", "data-testid": "sequenceOptionSelector", children: sequenceOptions.map((option) => (jsx(MenuItem, { value: option, "data-testid": `sequenceOption-${option}`, children: option }, option))) }), jsx(Button, { variant: "contained", onClick: onCopyClick, style: { marginLeft: 10 }, size: "medium", children: "Copy sequence" }), jsxs(Paper, { style: {
                    fontFamily: 'monospace',
                    padding: theme.spacing(),
                    overflowX: 'auto',
                }, ref: seqRef, children: [">", refSeq.name, ":", locationIntervals
                        .map((interval) => feature.strand === 1
                        ? `${interval.min + 1}-${interval.max}`
                        : `${interval.max}-${interval.min + 1}`)
                        .join(';'), "(strand=", feature.strand === 1 ? '+' : '-', ";length=", getSequenceLength(sequenceSegments), ")", jsx("br", {}), wrapSequence(sequenceSegments, SEQUENCE_WRAP_LENGTH)] })] }));
});

const StyledTextField = styled(NumberTextField)(() => ({
    '&.MuiFormControl-root': {
        marginTop: 0,
        marginBottom: 0,
        width: '100%',
    },
    '& .MuiInputBase-input': {
        fontSize: 12,
        height: 20,
        padding: 1,
        paddingLeft: 10,
    },
}));
const SequenceContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'left',
    width: '100%',
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    wordBreak: 'break-all',
    '& span': {
        fontSize: 12,
    },
});
const Strand = (props) => {
    const { strand } = props;
    return (jsx("div", { children: strand === 1 ? (jsx(AddIcon, {})) : strand === -1 ? (jsx(RemoveIcon, {})) : (jsx(Typography, { component: 'span', children: "N/A" })) }));
};
const minMaxExonTranscriptLocation = (transcript, featureTypeOntology) => {
    const { transcriptExonParts } = transcript;
    const exonParts = transcriptExonParts
        .filter((part) => featureTypeOntology.isTypeOf(part.type, 'exon'))
        .sort(({ min: a }, { min: b }) => a - b);
    const exonMin = exonParts[0]?.min;
    const exonMax = exonParts[exonParts.length - 1]?.max;
    return [exonMin, exonMax];
};
const TranscriptWidgetEditLocation = observer(function TranscriptWidgetEditLocation({ assembly, feature, refName, session, }) {
    const { notify } = session;
    const currentAssembly = session.apolloDataStore.assemblies.get(assembly);
    const refData = currentAssembly?.getByRefName(refName);
    const { changeManager } = session.apolloDataStore;
    const seqRef = useRef(null);
    const { changeInProgress } = session;
    if (!refData) {
        return null;
    }
    const { apolloDataStore } = session;
    const { featureTypeOntology } = apolloDataStore.ontologyManager;
    if (!featureTypeOntology.isTypeOf(feature.type, 'transcript') &&
        !featureTypeOntology.isTypeOf(feature.type, 'pseudogenic_transcript')) {
        throw new Error('Feature is not a transcript or equivalent');
    }
    const { cdsLocations, transcriptExonParts, strand } = feature;
    const [firstCDSLocation] = cdsLocations;
    const [exonMin, exonMax] = minMaxExonTranscriptLocation(feature, featureTypeOntology);
    let cdsMin = exonMin;
    let cdsMax = exonMax;
    const cdsPresent = firstCDSLocation.length > 0;
    if (cdsPresent) {
        const sortedCDSLocations = firstCDSLocation.toSorted(({ min: a }, { min: b }) => a - b);
        cdsMin = sortedCDSLocations[0].min;
        cdsMax = sortedCDSLocations[sortedCDSLocations.length - 1].max;
    }
    const updateCDSLocation = (oldLocation, newLocation, feature, isMin, onComplete) => {
        if (!feature.children) {
            throw new Error('Transcript should have child features');
        }
        if (oldLocation === newLocation) {
            return true;
        }
        const cdsFeature = getMatchingCDSFeature(feature, featureTypeOntology, oldLocation, isMin);
        if (!cdsFeature) {
            notify('No matching CDS feature found', 'error');
            return false;
        }
        if (isMin && newLocation >= cdsFeature.max) {
            notify('Start location should be less than CDS end location', 'error');
            return false;
        }
        if (!isMin && newLocation <= cdsFeature.min) {
            notify('End location should be greater than CDS start location', 'error');
            return false;
        }
        // overlapping exon of new CDS location
        const overlappingExon = getOverlappingExonForCDS(feature, featureTypeOntology, newLocation, isMin);
        if (!overlappingExon) {
            notify('There should be an overlapping exon for the new CDS location', 'error');
            return false;
        }
        const change = isMin
            ? new LocationStartChange({
                typeName: 'LocationStartChange',
                changedIds: [cdsFeature._id],
                featureId: cdsFeature._id,
                oldStart: cdsFeature.min,
                newStart: newLocation,
                assembly,
            })
            : new LocationEndChange({
                typeName: 'LocationEndChange',
                changedIds: [cdsFeature._id],
                featureId: cdsFeature._id,
                oldEnd: cdsFeature.max,
                newEnd: newLocation,
                assembly,
            });
        void changeManager
            .submit(change)
            .then(() => {
            if (onComplete) {
                onComplete();
            }
        })
            .catch(() => {
            notify('Error updating feature CDS position', 'error');
        });
        return true;
    };
    function handleExonLocationChange(oldLocation, newLocation, feature, isMin) {
        if (!feature.children) {
            throw new Error('Transcript should have child features');
        }
        const { matchingExon, prevExon, nextExon } = getNeighboringExonParts(feature, featureTypeOntology, oldLocation, isMin);
        if (!matchingExon) {
            notify('No matching exon found', 'error');
            return false;
        }
        // Start location should be less than end location
        if (isMin && newLocation >= matchingExon.max) {
            notify(`Start location should be less than end location`, 'error');
            return false;
        }
        // End location should be greater than start location
        if (!isMin && newLocation <= matchingExon.min) {
            notify(`End location should be greater than start location`, 'error');
            return false;
        }
        // Changed location should be greater than end location of previous exon - give 2bp buffer
        if (prevExon && prevExon.max + 2 > newLocation) {
            notify(`Error while changing start location`, 'error');
            return false;
        }
        // Changed location should be less than start location of next exon - give 2bp buffer
        if (nextExon && nextExon.min - 2 < newLocation) {
            notify(`Error while changing end location`, 'error');
            return false;
        }
        const exonFeature = getExonFeature(feature, matchingExon.min, matchingExon.max, featureTypeOntology);
        if (!exonFeature) {
            notify('No matching exon feature found', 'error');
            return false;
        }
        const cdsFeature = getFirstCDSFeature(feature, featureTypeOntology);
        // START LOCATION CHANGE
        if (isMin && newLocation !== matchingExon.min) {
            const startChange = new LocationStartChange({
                typeName: 'LocationStartChange',
                changedIds: [],
                changes: [],
                assembly,
            });
            if (prevExon) {
                // update exon start location
                appendStartLocationChange(exonFeature, startChange, newLocation);
            }
            else {
                const transcriptStart = feature.min;
                const gene = feature.parent;
                if (newLocation < transcriptStart) {
                    if (gene && newLocation < gene.min) {
                        // update gene start location
                        appendStartLocationChange(gene, startChange, newLocation);
                    }
                    // update transcript start location
                    appendStartLocationChange(feature, startChange, newLocation);
                    // update exon start location
                    appendStartLocationChange(exonFeature, startChange, newLocation);
                }
                else if (newLocation > transcriptStart) {
                    // update exon start location
                    appendStartLocationChange(exonFeature, startChange, newLocation);
                    // update transcript start location
                    appendStartLocationChange(feature, startChange, newLocation);
                    if (gene) {
                        const [geneMinWithNewLoc] = geneMinMaxWithNewLocation(gene, feature, newLocation, featureTypeOntology, isMin);
                        if (gene.min != geneMinWithNewLoc) {
                            // update gene start location
                            appendStartLocationChange(gene, startChange, geneMinWithNewLoc);
                        }
                    }
                }
            }
            // When we change the start location of the exon overlapping with start location of the CDS
            // and the new start location is greater than the CDS start location then we need to update the CDS start location
            if (cdsFeature &&
                cdsFeature.min >= matchingExon.min &&
                cdsFeature.min <= matchingExon.max &&
                newLocation > cdsFeature.min) {
                // update CDS start location
                appendStartLocationChange(cdsFeature, startChange, newLocation);
            }
            void changeManager.submit(startChange).catch(() => {
                notify('Error updating feature exon start position', 'error');
            });
        }
        // END LOCATION CHANGE
        if (!isMin && newLocation !== matchingExon.max) {
            const endChange = new LocationEndChange({
                typeName: 'LocationEndChange',
                changedIds: [],
                changes: [],
                assembly,
            });
            if (nextExon) {
                // update exon end location
                appendEndLocationChange(exonFeature, endChange, newLocation);
            }
            else {
                const transcriptEnd = feature.max;
                const gene = feature.parent;
                if (newLocation > transcriptEnd) {
                    if (gene && newLocation > gene.max) {
                        // update gene end location
                        appendEndLocationChange(gene, endChange, newLocation);
                    }
                    // update transcript end location
                    appendEndLocationChange(feature, endChange, newLocation);
                    // update exon end location
                    appendEndLocationChange(exonFeature, endChange, newLocation);
                }
                else if (newLocation < transcriptEnd) {
                    // update exon end location
                    appendEndLocationChange(exonFeature, endChange, newLocation);
                    // update transcript end location
                    appendEndLocationChange(feature, endChange, newLocation);
                    if (gene) {
                        const [, geneMaxWithNewLoc] = geneMinMaxWithNewLocation(gene, feature, newLocation, featureTypeOntology, isMin);
                        if (gene.max != geneMaxWithNewLoc) {
                            // update gene end location
                            appendEndLocationChange(gene, endChange, geneMaxWithNewLoc);
                        }
                    }
                }
            }
            // When we change the end location of the exon overlapping with end location of the CDS
            // and the new end location is less than the CDS end location then we need to update the CDS end location
            if (cdsFeature &&
                cdsFeature.max >= matchingExon.min &&
                cdsFeature.max <= matchingExon.max &&
                newLocation < cdsFeature.max) {
                // update CDS end location
                appendEndLocationChange(cdsFeature, endChange, newLocation);
            }
            void changeManager.submit(endChange).catch(() => {
                notify('Error updating feature exon end position', 'error');
            });
        }
        return true;
    }
    const appendEndLocationChange = (feature, change, newLocation) => {
        change.changedIds.push(feature._id);
        change.changes.push({
            featureId: feature._id,
            oldEnd: feature.max,
            newEnd: newLocation,
        });
    };
    const appendStartLocationChange = (feature, change, newLocation) => {
        change.changedIds.push(feature._id);
        change.changes.push({
            featureId: feature._id,
            oldStart: feature.min,
            newStart: newLocation,
        });
    };
    const getMatchingCDSFeature = (feature, featureTypeOntology, oldCDSLocation, isMin) => {
        let cdsFeature;
        for (const [, child] of feature.children ?? []) {
            if (!featureTypeOntology.isTypeOf(child.type, 'CDS')) {
                continue;
            }
            if (isMin && oldCDSLocation === child.min) {
                cdsFeature = child;
                break;
            }
            if (!isMin && oldCDSLocation === child.max) {
                cdsFeature = child;
                break;
            }
        }
        return cdsFeature;
    };
    const getFirstCDSFeature = (feature, featureTypeOntology) => {
        let cdsFeature;
        for (const [, child] of feature.children ?? []) {
            if (!featureTypeOntology.isTypeOf(child.type, 'CDS')) {
                continue;
            }
            cdsFeature = child;
            break;
        }
        return cdsFeature;
    };
    const getExonFeature = (feature, exonMin, exonMax, featureTypeOntology) => {
        let exonFeature;
        for (const [, child] of feature.children ?? []) {
            if (!featureTypeOntology.isTypeOf(child.type, 'exon')) {
                continue;
            }
            if (exonMin === child.min && exonMax === child.max) {
                exonFeature = child;
                break;
            }
        }
        return exonFeature;
    };
    const geneMinMaxWithNewLocation = (gene, transcript, newLocation, featureTypeOntology, isMin) => {
        const mins = [];
        const maxs = [];
        for (const [, t] of gene.children?.entries() ?? []) {
            if (!featureTypeOntology.isTypeOf(t.type, 'transcript')) {
                continue;
            }
            if (t._id === transcript._id) {
                if (isMin) {
                    mins.push(newLocation);
                    maxs.push(t.max);
                }
                else {
                    maxs.push(newLocation);
                    mins.push(t.min);
                }
            }
            else {
                mins.push(t.min);
                maxs.push(t.max);
            }
        }
        const newMin = Math.min(...mins);
        const newMax = Math.max(...maxs);
        return [newMin, newMax];
    };
    const getOverlappingExonForCDS = (transcript, featureTypeOntology, oldCDSLocation, isMin) => {
        const { transcriptExonParts } = transcript;
        let overlappingExonPart;
        for (const [, exonPart] of transcriptExonParts.entries()) {
            if (!featureTypeOntology.isTypeOf(exonPart.type, 'exon')) {
                continue;
            }
            if (!isMin &&
                oldCDSLocation >= exonPart.min &&
                oldCDSLocation <= exonPart.max) {
                overlappingExonPart = exonPart;
                break;
            }
            if (isMin &&
                oldCDSLocation >= exonPart.min &&
                oldCDSLocation <= exonPart.max) {
                overlappingExonPart = exonPart;
                break;
            }
        }
        return overlappingExonPart;
    };
    const getNeighboringExonParts = (transcript, featureTypeOntology, oldExonLoc, isMin) => {
        const { transcriptExonParts, strand } = transcript;
        let matchingExon, matchingExonIdx, prevExon, nextExon;
        for (const [i, exonPart] of transcriptExonParts.entries()) {
            if (!featureTypeOntology.isTypeOf(exonPart.type, 'exon')) {
                continue;
            }
            if (isMin && exonPart.min === oldExonLoc) {
                matchingExon = exonPart;
                matchingExonIdx = i;
                break;
            }
            if (!isMin && exonPart.max === oldExonLoc) {
                matchingExon = exonPart;
                matchingExonIdx = i;
                break;
            }
        }
        if (matchingExon && matchingExonIdx !== undefined) {
            if (strand === 1 && matchingExonIdx > 0) {
                for (let i = matchingExonIdx - 1; i >= 0; i--) {
                    const prevLoc = transcriptExonParts[i];
                    if (featureTypeOntology.isTypeOf(prevLoc.type, 'exon')) {
                        prevExon = prevLoc;
                        break;
                    }
                }
            }
            if (strand === -1 && matchingExonIdx < transcriptExonParts.length - 1) {
                for (let i = matchingExonIdx + 1; i < transcriptExonParts.length; i++) {
                    const prevLoc = transcriptExonParts[i];
                    if (featureTypeOntology.isTypeOf(prevLoc.type, 'exon')) {
                        prevExon = prevLoc;
                        break;
                    }
                }
            }
            if (strand === 1 && matchingExonIdx < transcriptExonParts.length - 1) {
                for (let i = matchingExonIdx + 1; i < transcriptExonParts.length; i++) {
                    const nextLoc = transcriptExonParts[i];
                    if (featureTypeOntology.isTypeOf(nextLoc.type, 'exon')) {
                        nextExon = nextLoc;
                        break;
                    }
                }
            }
            if (strand === -1 && matchingExonIdx > 0) {
                for (let i = matchingExonIdx - 1; i >= 0; i--) {
                    const nextLoc = transcriptExonParts[i];
                    if (featureTypeOntology.isTypeOf(nextLoc.type, 'exon')) {
                        nextExon = nextLoc;
                        break;
                    }
                }
            }
        }
        return { matchingExon, prevExon, nextExon };
    };
    const getFivePrimeSpliceSite = (loc, prevLocIdx) => {
        let spliceSite = '';
        if (prevLocIdx > 0) {
            const prevLoc = transcriptExonParts[prevLocIdx - 1];
            if (strand === 1) {
                if (prevLoc.type === 'intron') {
                    spliceSite = refData.getSequence(loc.min - 2, loc.min);
                }
            }
            else {
                if (prevLoc.type === 'intron') {
                    spliceSite = revcom(refData.getSequence(loc.max, loc.max + 2));
                }
            }
        }
        spliceSite = spliceSite.toUpperCase();
        return [
            {
                spliceSite,
                color: spliceSite === 'AG' ? 'green' : 'red',
            },
        ];
    };
    const getThreePrimeSpliceSite = (loc, nextLocIdx) => {
        let spliceSite = '';
        if (nextLocIdx < transcriptExonParts.length - 1) {
            const nextLoc = transcriptExonParts[nextLocIdx + 1];
            if (strand === 1) {
                if (nextLoc.type === 'intron') {
                    spliceSite = refData.getSequence(loc.max, loc.max + 2);
                }
            }
            else {
                if (nextLoc.type === 'intron') {
                    spliceSite = revcom(refData.getSequence(loc.min - 2, loc.min));
                }
            }
        }
        spliceSite = spliceSite.toUpperCase();
        return [
            {
                spliceSite,
                color: spliceSite === 'GT' ? 'green' : 'red',
            },
        ];
    };
    const getTranslationSequence = () => {
        let wholeSequence = '';
        const [firstLocation] = cdsLocations;
        const sortedCDSLocations = firstLocation.toSorted(({ min: a }, { min: b }) => a - b);
        for (const loc of sortedCDSLocations) {
            wholeSequence += refData.getSequence(loc.min, loc.max);
        }
        if (strand === -1) {
            // Original: ACGCAT
            // Complement: TGCGTA
            // Reverse complement: ATGCGT
            wholeSequence = revcom(wholeSequence);
        }
        const elements = [];
        for (let codonGenomicPos = 0; codonGenomicPos < wholeSequence.length; codonGenomicPos += 3) {
            const codonSeq = wholeSequence
                .slice(codonGenomicPos, codonGenomicPos + 3)
                .toUpperCase();
            const protein = defaultCodonTable[codonSeq] || '&';
            // highlight start codon and stop codons
            if (codonSeq === 'ATG') {
                elements.push(jsx(Typography, { component: 'span', style: {
                        backgroundColor: changeInProgress ? 'lightgray' : 'yellow',
                        cursor: 'pointer',
                        border: '1px solid black',
                    }, onClick: () => {
                        if (changeInProgress) {
                            return;
                        }
                        // NOTE: codonGenomicPos is important here for calculating the genomic location
                        // of the start codon. We are using the codonGenomicPos as the key in the typography
                        // elements to maintain the genomic postion of the codon start
                        const startCodonGenomicLocation = getCodonGenomicLocation(codonGenomicPos);
                        if (startCodonGenomicLocation !== cdsMin && strand === 1) {
                            updateCDSLocation(cdsMin, startCodonGenomicLocation, feature, true);
                        }
                        if (startCodonGenomicLocation !== cdsMax && strand === -1) {
                            updateCDSLocation(cdsMax, startCodonGenomicLocation, feature, false);
                        }
                    }, children: protein }, codonGenomicPos));
            }
            else if (['TAA', 'TAG', 'TGA'].includes(codonSeq)) {
                elements.push(jsx(Typography, { style: { backgroundColor: 'red', color: 'white' }, component: 'span', children: protein }, codonGenomicPos));
            }
            else {
                elements.push(
                // Pass the codonGenomicPos as the key to maintain the genomic position of the codon
                jsx(Typography, { component: 'span', children: protein }, codonGenomicPos));
            }
        }
        return elements;
    };
    // Codon position is the index of the start codon in the CDS genomic sequence
    // Calculate the genomic location of the start codon based on the codon position in the CDS
    const getCodonGenomicLocation = (codonGenomicPosition) => {
        const [firstLocation] = cdsLocations;
        let cdsLen = 0;
        const sortedCDSLocations = firstLocation.toSorted(({ min: a }, { min: b }) => a - b);
        // Suppose CDS locations are [{min: 0, max: 10}, {min: 20, max: 30}, {min: 40, max: 50}]
        // and codonGenomicPosition is 25
        // ((10 - 0) + (30 - 20) + (50 - 40)) > 25
        // So, start codon is in (40, 50)
        // 40 + (25-20) = 45 is the genomic location of the start codon
        if (strand === 1) {
            for (const loc of sortedCDSLocations) {
                const locLength = loc.max - loc.min;
                if (cdsLen + locLength > codonGenomicPosition) {
                    return loc.min + (codonGenomicPosition - cdsLen);
                }
                cdsLen += locLength;
            }
        }
        else if (strand === -1) {
            for (let i = sortedCDSLocations.length - 1; i >= 0; i--) {
                const loc = sortedCDSLocations[i];
                const locLength = loc.max - loc.min;
                if (cdsLen + locLength > codonGenomicPosition) {
                    return loc.max - (codonGenomicPosition - cdsLen);
                }
                cdsLen += locLength;
            }
        }
        if (strand === 1) {
            return cdsMin;
        }
        return cdsMax;
    };
    const trimTranslationSequence = () => {
        const sequenceElements = getTranslationSequence();
        const translationSequence = sequenceElements
            .map((el) => el.props.children)
            .join('');
        if (translationSequence.startsWith('M') &&
            translationSequence.endsWith('*')) {
            return;
        }
        // NOTE: We are maintaining the genomic location of the codon start as the "key"
        // in typography elements. See getTranslationSequence function
        const translSeqCodonStartGenomicPosArr = [];
        for (const el of sequenceElements) {
            translSeqCodonStartGenomicPosArr.push({
                codonGenomicPos: el.key,
                sequenceLetter: el.props.children,
            });
        }
        if (translSeqCodonStartGenomicPosArr.length === 0) {
            return;
        }
        // Trim any sequence before first start codon and after stop codon
        const startCodonIndex = translationSequence.indexOf('M');
        const stopCodonIndex = translationSequence.indexOf('*');
        const startCodonPos = translSeqCodonStartGenomicPosArr[startCodonIndex].codonGenomicPos;
        const stopCodonPos = translSeqCodonStartGenomicPosArr[stopCodonIndex].codonGenomicPos;
        if (!startCodonPos || !stopCodonPos) {
            return;
        }
        const startCodonGenomicLoc = getCodonGenomicLocation(startCodonPos);
        let stopCodonGenomicLoc = getCodonGenomicLocation(stopCodonPos);
        if (strand === 1) {
            if (startCodonGenomicLoc > stopCodonGenomicLoc) {
                notify('Start codon genomic location should be less than stop codon genomic location', 'error');
                return;
            }
            let promise;
            stopCodonGenomicLoc += 3; // move to end of stop codon
            if (startCodonGenomicLoc !== cdsMin) {
                promise = new Promise((resolve) => {
                    updateCDSLocation(cdsMin, startCodonGenomicLoc, feature, true, () => {
                        resolve(true);
                    });
                });
            }
            if (stopCodonGenomicLoc !== cdsMax) {
                if (promise) {
                    void promise.then(() => {
                        updateCDSLocation(cdsMax, stopCodonGenomicLoc, feature, false);
                    });
                }
                else {
                    updateCDSLocation(cdsMax, stopCodonGenomicLoc, feature, false);
                }
            }
        }
        if (strand === -1) {
            // reverse strand
            if (startCodonGenomicLoc < stopCodonGenomicLoc) {
                notify('Start codon genomic location should be less than stop codon genomic location', 'error');
                return;
            }
            let promise;
            stopCodonGenomicLoc -= 3; // move to end of stop codon
            if (startCodonGenomicLoc !== cdsMax) {
                promise = new Promise((resolve) => {
                    updateCDSLocation(cdsMax, startCodonGenomicLoc, feature, false, () => {
                        resolve(true);
                    });
                });
            }
            if (stopCodonGenomicLoc !== cdsMin) {
                if (promise) {
                    void promise.then(() => {
                        updateCDSLocation(cdsMin, stopCodonGenomicLoc, feature, true);
                    });
                }
                else {
                    updateCDSLocation(cdsMin, stopCodonGenomicLoc, feature, true);
                }
            }
        }
        notify('Translation sequence trimmed to start and stop codons', 'success');
    };
    const onCopyClick = () => {
        const seqDiv = seqRef.current;
        if (!seqDiv) {
            return;
        }
        void copyToClipboard(seqDiv);
    };
    return (jsxs("div", { children: [cdsPresent && (jsxs("div", { children: [jsxs(Accordion, { children: [jsx(StyledAccordionSummary, { expandIcon: jsx(ExpandMoreIcon, { style: { color: 'white' } }), "aria-controls": "panel1-content", id: "panel1-header", children: jsx(Typography, { component: "span", fontWeight: 'bold', children: "Translation" }) }), jsxs(AccordionDetails, { children: [jsx(SequenceContainer, { children: jsx(Typography, { component: 'span', ref: seqRef, style: { maxHeight: 120, overflowY: 'scroll' }, children: getTranslationSequence() }) }), jsxs("div", { style: {
                                            marginTop: 10,
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 10,
                                        }, children: [jsx(Tooltip, { title: "Copy", children: jsx("button", { onClick: onCopyClick, style: { border: 'none', background: 'none', padding: 0 }, disabled: changeInProgress, children: jsx(ContentCopyIcon, { style: { fontSize: 15 } }) }) }), jsx(Tooltip, { title: "Trim", children: jsx("button", { onClick: trimTranslationSequence, style: { border: 'none', background: 'none', padding: 0 }, disabled: changeInProgress, children: jsx(ContentCutIcon, { style: { fontSize: 15 } }) }) })] })] })] }), jsxs(Grid, { container: true, justifyContent: "center", alignItems: "center", style: { textAlign: 'center', marginTop: 10 }, children: [jsx(Grid, { size: 1 }), strand === 1 ? (jsx(Grid, { size: 4, children: jsx(StyledTextField, { margin: "dense", variant: "outlined", value: cdsMin + 1, onChangeCommitted: (newLocation) => {
                                        return updateCDSLocation(cdsMin, newLocation - 1, feature, true);
                                    }, style: { border: '1px solid black', borderRadius: 5 }, disabled: changeInProgress }) })) : (jsx(Grid, { size: 4, children: jsx(StyledTextField, { margin: "dense", variant: "outlined", value: cdsMax, onChangeCommitted: (newLocation) => {
                                        return updateCDSLocation(cdsMax, newLocation, feature, false);
                                    }, style: { border: '1px solid black', borderRadius: 5 }, disabled: changeInProgress }) })), jsx(Grid, { size: 2, children: jsx(Typography, { component: 'span', children: "CDS" }) }), strand === 1 ? (jsx(Grid, { size: 4, children: jsx(StyledTextField, { margin: "dense", variant: "outlined", value: cdsMax, onChangeCommitted: (newLocation) => {
                                        return updateCDSLocation(cdsMax, newLocation, feature, false);
                                    }, style: { border: '1px solid black', borderRadius: 5 }, disabled: changeInProgress }) })) : (jsx(Grid, { size: 4, children: jsx(StyledTextField, { margin: "dense", variant: "outlined", value: cdsMin + 1, onChangeCommitted: (newLocation) => {
                                        return updateCDSLocation(cdsMin, newLocation - 1, feature, true);
                                    }, style: { border: '1px solid black', borderRadius: 5 }, disabled: changeInProgress }) })), jsx(Grid, { size: 1 })] })] })), jsx("div", { style: { marginTop: 5 }, children: transcriptExonParts.map((loc, index) => {
                    return (jsx("div", { children: loc.type === 'exon' && (jsxs(Grid, { container: true, justifyContent: "center", alignItems: "center", style: { textAlign: 'center' }, children: [jsx(Grid, { size: 1, children: index !== 0 &&
                                        getFivePrimeSpliceSite(loc, index).map((site, idx) => (jsx(Typography, { component: 'span', color: site.color, children: site.spliceSite }, idx))) }), strand === 1 ? (jsx(Grid, { size: 4, style: { padding: 0 }, children: jsx(StyledTextField, { margin: "dense", variant: "outlined", value: loc.min + 1, onChangeCommitted: (newLocation) => {
                                            return handleExonLocationChange(loc.min, newLocation - 1, feature, true);
                                        }, disabled: changeInProgress }) })) : (jsx(Grid, { size: 4, style: { padding: 0 }, children: jsx(StyledTextField, { margin: "dense", variant: "outlined", value: loc.max, onChangeCommitted: (newLocation) => {
                                            return handleExonLocationChange(loc.max, newLocation, feature, false);
                                        }, disabled: changeInProgress }) })), jsx(Grid, { size: 2, children: jsx(Strand, { strand: feature.strand }) }), strand === 1 ? (jsx(Grid, { size: 4, style: { padding: 0 }, children: jsx(StyledTextField, { margin: "dense", variant: "outlined", value: loc.max, onChangeCommitted: (newLocation) => {
                                            return handleExonLocationChange(loc.max, newLocation, feature, false);
                                        }, disabled: changeInProgress }) })) : (jsx(Grid, { size: 4, style: { padding: 0 }, children: jsx(StyledTextField, { margin: "dense", variant: "outlined", value: loc.min + 1, onChangeCommitted: (newLocation) => {
                                            return handleExonLocationChange(loc.min, newLocation - 1, feature, true);
                                        }, disabled: changeInProgress }) })), jsx(Grid, { size: 1, children: index !== transcriptExonParts.length - 1 &&
                                        getThreePrimeSpliceSite(loc, index).map((site, idx) => (jsx(Typography, { component: 'span', color: site.color, children: site.spliceSite }, idx))) })] })) }, index));
                }) })] }));
});

const HeaderTableCell = styled(TableCell)(() => ({
    fontWeight: 'bold',
}));
const TranscriptWidgetSummary = observer(function TranscriptWidgetSummary(props) {
    const { feature } = props;
    const name = getFeatureName$1(feature);
    const id = getFeatureId$1(feature);
    return (jsx(Table, { size: "small", sx: { fontSize: '0.75rem', '& .MuiTableCell-root': { padding: '4px' } }, children: jsxs(TableBody, { children: [name !== '' && (jsxs(TableRow, { children: [jsx(HeaderTableCell, { children: "Name" }), jsx(TableCell, { children: getFeatureName$1(feature) })] })), id !== '' && (jsxs(TableRow, { children: [jsx(HeaderTableCell, { children: "ID" }), jsx(TableCell, { children: getFeatureId$1(feature) })] })), jsxs(TableRow, { children: [jsx(HeaderTableCell, { children: "Type" }), jsx(TableCell, { children: feature.type })] }), jsxs(TableRow, { children: [jsx(HeaderTableCell, { children: "Location" }), jsxs(TableCell, { children: [props.refName, ":", feature.min, "..", feature.max] })] }), jsxs(TableRow, { children: [jsx(HeaderTableCell, { children: "Strand" }), jsx(TableCell, { children: getStrand(feature.strand) })] })] }) }));
});

const useStyles$7 = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}));
const StyledAccordionSummary = styled(AccordionSummary)(() => ({
    minHeight: 30,
    maxHeight: 30,
    '&.Mui-expanded': {
        minHeight: 30,
        maxHeight: 30,
    },
}));
function NoOpCustomComponent(_props) {
    return null;
}
const ApolloTranscriptDetailsWidget = observer(function ApolloTranscriptDetails(props) {
    const { classes } = useStyles$7();
    const DEFAULT_PANELS = ['summary', 'location'];
    const [panelState, setPanelState] = useState(DEFAULT_PANELS);
    const { model } = props;
    const { assembly, feature, refName } = model;
    useEffect(() => {
        setPanelState(DEFAULT_PANELS);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feature]);
    const session = getSession(model);
    const { pluginManager } = getEnv(session);
    const apolloSession = getSession(model);
    const currentAssembly = apolloSession.apolloDataStore.assemblies.get(assembly);
    const { internetAccounts } = getRoot(session);
    const apolloInternetAccount = internetAccounts.find((ia) => ia.type === 'ApolloInternetAccount');
    const role = apolloInternetAccount ? apolloInternetAccount.role : 'admin';
    const editable = ['admin', 'user'].includes(role ?? '');
    if (!(feature && currentAssembly)) {
        return null;
    }
    const refSeq = currentAssembly.getByRefName(refName);
    if (!refSeq) {
        return null;
    }
    const { max, min } = feature;
    const sequence = refSeq.getSequence(min, max);
    if (!sequence) {
        void apolloSession.apolloDataStore.loadRefSeq([
            { assemblyName: assembly, refName, start: min, end: max },
        ]);
    }
    function handlePanelChange(expanded, panel) {
        if (expanded) {
            setPanelState([...panelState, panel]);
        }
        else {
            setPanelState(panelState.filter((p) => p !== panel));
        }
    }
    const CustomComponentInsideSummary = pluginManager.evaluateExtensionPoint('Apollo-TranscriptDetailsCustomComponent-InsideSummary', NoOpCustomComponent, { feature, session });
    const CustomComponentAfterSummary = pluginManager.evaluateExtensionPoint('Apollo-TranscriptDetailsCustomComponent-AfterSummary', NoOpCustomComponent, { feature, session });
    const CustomComponentInsideLocation = pluginManager.evaluateExtensionPoint('Apollo-TranscriptDetailsCustomComponent-InsideLocation', NoOpCustomComponent, { feature, session });
    const CustomComponentAfterLocation = pluginManager.evaluateExtensionPoint('Apollo-TranscriptDetailsCustomComponent-AfterLocation', NoOpCustomComponent, { feature, session });
    const CustomComponentInsideAttributes = pluginManager.evaluateExtensionPoint('Apollo-TranscriptDetailsCustomComponent-InsideAttributes', NoOpCustomComponent, { feature, session });
    const CustomComponentAfterAttributes = pluginManager.evaluateExtensionPoint('Apollo-TranscriptDetailsCustomComponent-AfterAttributes', NoOpCustomComponent, { feature, session });
    const CustomComponentInsideSequence = pluginManager.evaluateExtensionPoint('Apollo-TranscriptDetailsCustomComponent-InsideSequence', NoOpCustomComponent, { feature, session });
    const CustomComponentAfterSequence = pluginManager.evaluateExtensionPoint('Apollo-TranscriptDetailsCustomComponent-AfterSequence', NoOpCustomComponent, { feature, session });
    return (jsxs("div", { className: classes.root, children: [jsxs(Accordion, { expanded: panelState.includes('summary'), onChange: (e, expanded) => {
                    handlePanelChange(expanded, 'summary');
                }, children: [jsx(StyledAccordionSummary, { expandIcon: jsx(ExpandMoreIcon, { style: { color: 'white' } }), "aria-controls": "panel1-content", id: "panel1-header", children: jsx(Typography, { component: "span", fontWeight: 'bold', children: "Summary" }) }), jsxs(AccordionDetails, { children: [jsx(TranscriptWidgetSummary, { feature: feature, refName: refName }), jsx(CustomComponentInsideSummary, { session: session, feature: feature })] })] }), jsx(CustomComponentAfterSummary, { session: session, feature: feature }), jsxs(Accordion, { style: { marginTop: 5 }, expanded: panelState.includes('location'), onChange: (e, expanded) => {
                    handlePanelChange(expanded, 'location');
                }, children: [jsx(StyledAccordionSummary, { expandIcon: jsx(ExpandMoreIcon, { style: { color: 'white' } }), "aria-controls": "panel2-content", id: "panel2-header", children: jsx(Typography, { component: "span", fontWeight: 'bold', children: "Location" }) }), jsxs(AccordionDetails, { children: [jsx(TranscriptWidgetEditLocation, { feature: feature, refName: refName, session: apolloSession, assembly: currentAssembly._id || '' }), jsx(CustomComponentInsideLocation, { session: session, feature: feature })] })] }), jsx(CustomComponentAfterLocation, { session: session, feature: feature }), jsxs(Accordion, { style: { marginTop: 5 }, expanded: panelState.includes('attrs'), onChange: (e, expanded) => {
                    handlePanelChange(expanded, 'attrs');
                }, children: [jsx(StyledAccordionSummary, { expandIcon: jsx(ExpandMoreIcon, { style: { color: 'white' } }), "aria-controls": "panel3-content", id: "panel3-header", children: jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [jsxs(Typography, { component: "span", fontWeight: 'bold', children: ["Attributes", ' '] }), jsx(Tooltip, { title: "Separate multiple values for the attribute with commas", children: jsx(InfoIcon, { style: { color: 'white', fontSize: 15, marginLeft: 10 } }) })] }) }), jsxs(AccordionDetails, { children: [jsx(Attributes, { feature: feature, session: apolloSession, assembly: currentAssembly._id || '', editable: editable }), jsx(CustomComponentInsideAttributes, { session: session, feature: feature })] })] }), jsx(CustomComponentAfterAttributes, { session: session, feature: feature }), jsxs(Accordion, { style: { marginTop: 5 }, expanded: panelState.includes('sequence'), onChange: (e, expanded) => {
                    handlePanelChange(expanded, 'sequence');
                }, children: [jsx(StyledAccordionSummary, { expandIcon: jsx(ExpandMoreIcon, { style: { color: 'white' } }), "aria-controls": "panel4-content", id: "panel4-header", children: jsx(Typography, { component: "span", fontWeight: 'bold', children: "Sequence" }) }), jsxs(AccordionDetails, { children: [panelState.includes('sequence') && (jsx(TranscriptSequence, { feature: feature, session: apolloSession, assembly: currentAssembly._id || '', refName: refName })), jsx(CustomComponentInsideSequence, { session: session, feature: feature })] })] }), jsx(CustomComponentAfterSequence, { feature: feature, session: session })] }));
});

const configSchema$2 = ConfigurationSchema('LinearApolloDisplay', {}, { explicitIdentifier: 'displayId', explicitlyTyped: true });

function handleFeatureTypeChange(changeManager, feature, oldType, newType) {
    const featureId = feature._id;
    const change = new TypeChange({
        typeName: 'TypeChange',
        changedIds: [featureId],
        featureId,
        oldType: String(oldType),
        newType: String(newType),
        assembly: feature.assemblyId,
    });
    return changeManager.submit(change);
}
function handleFeatureStartChange(changeManager, feature, oldStart, newStart) {
    const featureId = feature._id;
    const change = new LocationStartChange({
        typeName: 'LocationStartChange',
        changedIds: [featureId],
        featureId,
        oldStart,
        newStart,
        assembly: feature.assemblyId,
    });
    return changeManager.submit(change);
}
function handleFeatureEndChange(changeManager, feature, oldEnd, newEnd) {
    const featureId = feature._id;
    const change = new LocationEndChange({
        typeName: 'LocationEndChange',
        changedIds: [featureId],
        featureId,
        oldEnd,
        newEnd,
        assembly: feature.assemblyId,
    });
    return changeManager.submit(change);
}

const useStyles$6 = makeStyles()({
    highlighted: {
        background: 'orange',
    },
});
const Highlight = ({ highlight, text, }) => {
    const { classes } = useStyles$6();
    if (!highlight) {
        return jsx(Fragment, { children: text });
    }
    const split = text.split(highlight);
    if (split.length === 1) {
        return jsx(Fragment, { children: text });
    }
    const highlighted = [];
    for (let i = 0; i < split.length - 1; i++) {
        highlighted.push(split[i], jsx("span", { className: classes.highlighted, children: highlight }));
    }
    return (jsxs(Fragment, { children: [highlighted, split.at(-1)] }));
};

const FeatureAttributes = observer(function FeatureAttributes({ feature, filterText, }) {
    const attrString = [...feature.attributes.entries()]
        .map(([key, value]) => {
        if (key.startsWith('gff_')) {
            const newKey = key.slice(4);
            const capitalizedKey = newKey.charAt(0).toUpperCase() + newKey.slice(1);
            return [capitalizedKey, getSnapshot(value)];
        }
        if (key === '_id') {
            return ['ID', getSnapshot(value)];
        }
        return [key, getSnapshot(value)];
    })
        .filter(([key]) => key) // Leave empty keys off
        .map(([key, values]) => `${key}=${Array.isArray(values) ? values.join(', ') : values}`)
        .join(', ');
    return jsx(Highlight, { text: attrString, highlight: filterText });
});

const useStyles$5 = makeStyles()((theme) => ({
    inputWrapper: {
        position: 'relative',
    },
    hiddenWidthSpan: {
        padding: theme.spacing(0.5),
        color: 'transparent',
    },
    numberTextInput: {
        border: 'none',
        background: 'inherit',
        font: 'inherit',
        position: 'absolute',
        width: '100%',
        left: 0,
    },
}));
const NumberCell = observer(function NumberCell({ initialValue, notifyError, onChangeCommitted, }) {
    const [value, setValue] = useState(initialValue);
    const [blur, setBlur] = useState(false);
    const [inputNode, setInputNode] = useState(null);
    const { classes } = useStyles$5();
    useEffect(() => {
        if (initialValue !== value) {
            setValue(initialValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValue]);
    useEffect(() => {
        if (blur) {
            inputNode?.blur();
            setBlur(false);
        }
    }, [blur, inputNode]);
    function onChange(event) {
        const newValue = Number(event.target.value);
        if (!Number.isNaN(newValue)) {
            setValue(newValue);
        }
    }
    return (jsxs("span", { className: classes.inputWrapper, children: [jsx("span", { className: classes.hiddenWidthSpan, "aria-hidden": true, children: value }), jsx("input", { type: "text", value: value, className: classes.numberTextInput, onChange: onChange, onKeyDown: (event) => {
                    if (event.key === 'Enter') {
                        inputNode?.blur();
                    }
                    else if (event.key === 'Escape') {
                        setValue(initialValue);
                        setBlur(true);
                    }
                }, onBlur: () => {
                    if (value !== initialValue) {
                        onChangeCommitted(value).catch(notifyError);
                    }
                }, ref: (node) => {
                    setInputNode(node);
                } })] }));
});

function featureContextMenuItems(feature, region, getAssemblyId, selectedFeature, setSelectedFeature, session, changeManager, filteredTranscripts, updateFilteredTranscripts) {
    const internetAccount = getApolloInternetAccount(session);
    const role = internetAccount ? internetAccount.role : 'admin';
    const admin = role === 'admin';
    const readOnly = !(role && ['admin', 'user'].includes(role));
    const menuItems = [];
    if (feature) {
        const featureID = feature.attributes.get('gff_id')?.toString();
        const sourceAssemblyId = getAssemblyId(region.assemblyName);
        const currentAssemblyId = getAssemblyId(region.assemblyName);
        menuItems.push({
            label: 'Edit feature details',
            onClick: () => {
                const apolloFeatureWidget = session.addWidget('ApolloFeatureDetailsWidget', 'apolloFeatureDetailsWidget', {
                    feature,
                    assembly: currentAssemblyId,
                    refName: region.refName,
                });
                session.showWidget(apolloFeatureWidget);
            },
        }, {
            label: 'Add child feature',
            disabled: readOnly,
            onClick: () => {
                session.queueDialog((doneCallback) => [
                    AddChildFeature,
                    {
                        session,
                        handleClose: () => {
                            doneCallback();
                        },
                        changeManager,
                        sourceFeature: feature,
                        sourceAssemblyId,
                        internetAccount,
                    },
                ]);
            },
        }, {
            label: 'Copy features and annotations',
            disabled: readOnly,
            onClick: () => {
                session.queueDialog((doneCallback) => [
                    CopyFeature,
                    {
                        session,
                        handleClose: () => {
                            doneCallback();
                        },
                        changeManager,
                        sourceFeature: feature,
                        sourceAssemblyId: currentAssemblyId,
                    },
                ]);
            },
        }, {
            label: 'Delete feature',
            disabled: !admin,
            onClick: () => {
                session.queueDialog((doneCallback) => [
                    DeleteFeature,
                    {
                        session,
                        handleClose: () => {
                            doneCallback();
                        },
                        changeManager,
                        sourceFeature: feature,
                        sourceAssemblyId: currentAssemblyId,
                        selectedFeature,
                        setSelectedFeature,
                    },
                ]);
            },
        }, {
            label: 'Merge transcripts',
            disabled: !admin,
            onClick: () => {
                session.queueDialog((doneCallback) => [
                    MergeTranscripts,
                    {
                        session,
                        handleClose: () => {
                            doneCallback();
                        },
                        changeManager,
                        sourceFeature: feature,
                        sourceAssemblyId: currentAssemblyId,
                        selectedFeature,
                        setSelectedFeature,
                    },
                ]);
            },
        }, {
            label: 'Merge exons',
            disabled: !admin,
            onClick: () => {
                session.queueDialog((doneCallback) => [
                    MergeExons,
                    {
                        session,
                        handleClose: () => {
                            doneCallback();
                        },
                        changeManager,
                        sourceFeature: feature,
                        sourceAssemblyId: currentAssemblyId,
                        selectedFeature,
                        setSelectedFeature,
                    },
                ]);
            },
        }, {
            label: 'Split exon',
            disabled: !admin,
            onClick: () => {
                session.queueDialog((doneCallback) => [
                    SplitExon,
                    {
                        session,
                        handleClose: () => {
                            doneCallback();
                        },
                        changeManager,
                        sourceFeature: feature,
                        sourceAssemblyId: currentAssemblyId,
                        selectedFeature,
                        setSelectedFeature,
                    },
                ]);
            },
        });
        const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
        if (!featureTypeOntology) {
            throw new Error('featureTypeOntology is undefined');
        }
        if ((featureTypeOntology.isTypeOf(feature.type, 'transcript') ||
            featureTypeOntology.isTypeOf(feature.type, 'pseudogenic_transcript')) &&
            isSessionModelWithWidgets(session)) {
            menuItems.push({
                label: 'Edit transcript details',
                onClick: () => {
                    const apolloTranscriptWidget = session.addWidget('ApolloTranscriptDetails', 'apolloTranscriptDetails', {
                        feature,
                        assembly: currentAssemblyId,
                        changeManager,
                        refName: region.refName,
                    });
                    session.showWidget(apolloTranscriptWidget);
                },
            }, {
                label: 'Duplicate feature',
                onClick: () => {
                    session.queueDialog((doneCallback) => [
                        DuplicateTranscript,
                        {
                            session,
                            handleClose: () => {
                                doneCallback();
                            },
                            changeManager,
                            sourceFeature: feature,
                            sourceAssemblyId: currentAssemblyId,
                            selectedFeature,
                            setSelectedFeature,
                        },
                    ]);
                },
            }, {
                label: 'Visible',
                type: 'checkbox',
                checked: featureID && filteredTranscripts.includes(featureID) ? false : true,
                onClick: () => {
                    if (featureID) {
                        const newForms = filteredTranscripts.includes(featureID)
                            ? filteredTranscripts.filter((form) => form !== featureID)
                            : [...filteredTranscripts, featureID];
                        updateFilteredTranscripts(newForms);
                    }
                },
            });
        }
    }
    return menuItems;
}

const useStyles$4 = makeStyles()((theme) => ({
    typeContent: {
        display: 'inline-block',
        width: '174px',
        height: '100%',
        cursor: 'text',
    },
    feature: {
        td: {
            position: 'relative',
            verticalAlign: 'top',
            paddingLeft: '0.5em',
        },
    },
    arrow: {
        display: 'inline-block',
        width: '1.6em',
        textAlign: 'center',
        cursor: 'pointer',
    },
    arrowExpanded: {
        transform: 'rotate(90deg)',
    },
    hoveredFeature: {
        backgroundColor: theme.palette.action.hover,
    },
    typeInputElement: {
        border: 'none',
        background: 'none',
    },
    typeErrorMessage: {
        color: 'red',
    },
}));
function makeContextMenuItems(display, feature) {
    const { changeManager, getAssemblyId, regions, selectedFeature, session, setSelectedFeature, filteredTranscripts, updateFilteredTranscripts, } = display;
    return featureContextMenuItems(feature, regions[0], getAssemblyId, selectedFeature, setSelectedFeature, session, changeManager, filteredTranscripts, updateFilteredTranscripts);
}
function navigateHere(displayState, feature) {
    displayState.lgv.navTo(navToFeatureCenter(feature, 0.1, displayState.lgv.totalBp));
}
const Feature = observer(function Feature({ depth, feature, isHovered, isSelected, model: displayState, selectedFeatureClass, setContextMenu, }) {
    const { classes } = useStyles$4();
    const { changeManager, hoveredFeature, selectedFeature, session, tabularEditor: tabularEditorState, } = displayState;
    const { featureCollapsed, filterText } = tabularEditorState;
    const { _id, children, max, min, strand, type } = feature;
    const expanded = !featureCollapsed.get(_id);
    const toggleExpanded = (e) => {
        e.stopPropagation();
        tabularEditorState.setFeatureCollapsed(_id, expanded);
    };
    // pop up a snackbar in the session notifying user of an error
    const notifyError = (e) => {
        session.notify(e.message, 'error');
    };
    return (jsxs(Fragment, { children: [jsxs("tr", { onMouseEnter: (_e) => {
                    displayState.setHoveredFeature({ feature, bp: min });
                }, className: classes.feature +
                    (isSelected
                        ? ` ${selectedFeatureClass}`
                        : isHovered
                            ? ` ${classes.hoveredFeature}`
                            : ''), onClick: (e) => {
                    e.stopPropagation();
                    displayState.setSelectedFeature(feature);
                }, onDoubleClick: () => {
                    displayState.setSelectedFeature(feature);
                    navigateHere(displayState, feature);
                }, onContextMenu: (e) => {
                    e.preventDefault();
                    setContextMenu({
                        position: { left: e.clientX + 2, top: e.clientY - 6 },
                        items: makeContextMenuItems(displayState, feature),
                    });
                    return false;
                }, children: [jsxs("td", { style: {
                            whiteSpace: 'nowrap',
                            borderLeft: `${depth * 2}em solid transparent`,
                        }, children: [children?.size ? (
                            // TODO: a11y
                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                            jsx("div", { onClick: toggleExpanded, className: classes.arrow + (expanded ? ` ${classes.arrowExpanded}` : ''), children: "\u276F" })) : null, jsx("div", { className: classes.typeContent, children: jsx(OntologyTermAutocomplete, { session: session, ontologyName: "Sequence Ontology", style: { width: 170 }, value: type, filterTerms: isOntologyClass, fetchValidTerms: fetchValidTypeTerms.bind(null, feature), renderInput: (params) => {
                                        return (jsxs("div", { ref: params.InputProps.ref, children: [jsx("input", { type: "text", ...params.inputProps, className: classes.typeInputElement, style: { width: 170 } }), params.error ? (jsx("div", { className: classes.typeErrorMessage, children: params.errorMessage ?? 'unknown error' })) : null] }));
                                    }, onChange: (oldValue, newValue) => {
                                        if (newValue) {
                                            handleFeatureTypeChange(changeManager, feature, oldValue, newValue).catch(notifyError);
                                        }
                                    } }) })] }), jsx("td", { children: jsx(NumberCell, { initialValue: min + 1, notifyError: notifyError, onChangeCommitted: (newStart) => handleFeatureStartChange(changeManager, feature, min, newStart - 1) }) }), jsx("td", { children: jsx(NumberCell, { initialValue: max, notifyError: notifyError, onChangeCommitted: (newEnd) => handleFeatureEndChange(changeManager, feature, max, newEnd) }) }), jsx("td", { children: strand === 1 ? '+' : strand === -1 ? '-' : undefined }), jsx("td", { children: jsx(FeatureAttributes, { filterText: filterText, feature: feature }) })] }), expanded && children
                ? [...children.entries()]
                    .filter((entry) => {
                    if (!filterText) {
                        return true;
                    }
                    const [, childFeature] = entry;
                    // search feature and its subfeatures for the text
                    const text = JSON.stringify(childFeature);
                    return text.includes(filterText);
                })
                    .map(([featureId, childFeature]) => {
                    const childHovered = hoveredFeature?.feature._id === childFeature._id;
                    const childSelected = selectedFeature?._id === childFeature._id;
                    return (jsx(Feature, { isHovered: childHovered, isSelected: childSelected, selectedFeatureClass: selectedFeatureClass, depth: (depth || 0) + 1, feature: childFeature, model: displayState, setContextMenu: setContextMenu }, featureId));
                })
                : null] }));
});
async function fetchValidTypeTerms(feature, ontologyStore, _signal) {
    const { parent: parentFeature } = feature;
    if (parentFeature) {
        // if this is a child of an existing feature, restrict the autocomplete choices to valid
        // parts of that feature
        const parentTypeTerms = await ontologyStore.getTermsWithLabelOrSynonym(parentFeature.type, { includeSubclasses: false });
        // eslint-disable-next-line unicorn/no-array-callback-reference
        const parentTypeClassTerms = parentTypeTerms.filter(isOntologyClass);
        if (parentTypeClassTerms.length > 0) {
            const subpartTerms = await ontologyStore.getClassesThat('part_of', parentTypeClassTerms);
            return subpartTerms;
        }
    }
    return;
}

const useStyles$3 = makeStyles()((theme) => ({
    scrollableTable: {
        width: '100%',
        height: '100%',
        th: {
            position: 'sticky',
            top: 0,
            zIndex: 2,
            textAlign: 'left',
            background: theme.palette.background.paper,
            paddingTop: '3.2em',
        },
        td: { whiteSpace: 'normal' },
    },
    selectedFeature: {
        backgroundColor: theme.palette.action.selected,
    },
}));
const HybridGrid = observer(function HybridGrid({ model, }) {
    const { hoveredFeature, seenFeatures, selectedFeature, tabularEditor } = model;
    const theme = useTheme();
    const { classes } = useStyles$3();
    const scrollContainerRef = useRef(null);
    const [contextMenu, setContextMenu] = useState(null);
    const { filterText } = tabularEditor;
    // scrolls to selected feature if one is selected and it's not already visible
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer && selectedFeature) {
            const selectedRow = scrollContainer.querySelector(`.${classes.selectedFeature}`);
            if (selectedRow) {
                const currScroll = scrollContainer.scrollTop;
                const newScrollTop = selectedRow.offsetTop - 25;
                const isVisible = newScrollTop > currScroll &&
                    newScrollTop < currScroll + scrollContainer.offsetHeight;
                if (!isVisible) {
                    scrollContainer.scroll({ top: newScrollTop - 40, behavior: 'smooth' });
                }
            }
        }
    }, [selectedFeature, seenFeatures, classes.selectedFeature]);
    return (jsxs("div", { ref: scrollContainerRef, style: { width: '100%', overflowY: 'auto', height: '100%' }, children: [jsxs("table", { className: classes.scrollableTable, children: [jsx("thead", { children: jsxs("tr", { children: [jsx("th", { children: "Type" }), jsx("th", { children: "Start" }), jsx("th", { children: "End" }), jsx("th", { children: "Strand" }), jsx("th", { children: "Attributes" })] }) }), jsx("tbody", { children: [...seenFeatures.entries()]
                            .filter((entry) => {
                            if (!filterText) {
                                return true;
                            }
                            const [, feature] = entry;
                            // search feature and its subfeatures for the text
                            const text = JSON.stringify(feature);
                            return text.includes(filterText);
                        })
                            .sort((a, b) => {
                            return a[1].min - b[1].min;
                        })
                            .map(([featureId, feature]) => {
                            const isSelected = selectedFeature?._id === featureId;
                            const isHovered = hoveredFeature?.feature._id === featureId;
                            return (jsx(Feature, { isSelected: isSelected, isHovered: isHovered, selectedFeatureClass: classes.selectedFeature, feature: feature, model: model, depth: 0, setContextMenu: setContextMenu }, featureId));
                        }) })] }), jsx(Menu$1, { open: Boolean(contextMenu), onMenuItemClick: (_, callback) => {
                    callback();
                    setContextMenu(null);
                }, onClose: () => {
                    setContextMenu(null);
                }, slotProps: {
                    transition: {
                        onExit: () => {
                            setContextMenu(null);
                        },
                    },
                }, style: { zIndex: theme.zIndex.tooltip }, menuItems: contextMenu?.items ?? [], anchorReference: "anchorPosition", anchorPosition: contextMenu?.position })] }));
});

const useStyles$2 = makeStyles()({
    toolbar: {
        width: '100%',
        display: 'flex',
        paddingRight: '2em',
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        zIndex: 4,
    },
    filterText: {},
});
const ToolBar = observer(function ToolBar({ model: displayState, }) {
    const model = displayState.tabularEditor;
    const { classes } = useStyles$2();
    return (jsxs("div", { className: classes.toolbar, children: [jsx(Tooltip, { title: "Collapse all", children: jsx(IconButton, { "aria-label": "collapse", sx: { marginTop: 0 }, onClick: model.collapseAllFeatures, children: jsx(UnfoldLessIcon, {}) }) }), jsx(TextField, { className: classes.filterText, label: "Filter features", value: model.filterText, sx: { marginTop: 0 }, variant: "outlined", onChange: (event) => {
                    model.setFilterText(event.target.value);
                }, slotProps: {
                    input: {
                        endAdornment: (jsx(InputAdornment, { position: "end", children: jsx(IconButton, { onClick: () => {
                                    model.clearFilterText();
                                }, children: jsx(ClearIcon, {}) }) })),
                    },
                } })] }));
});

function stopPropagation(e) {
    e.stopPropagation();
}
const TabularEditorPane = observer(function TabularEditorPane({ model: displayState, }) {
    const model = displayState.tabularEditor;
    if (!model.isShown) {
        return null;
    }
    return (
    // TODO: a11y
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    jsxs("div", { onMouseDown: stopPropagation, onClick: stopPropagation, style: { width: '100%', height: '100%', position: 'relative' }, children: [jsx(ToolBar, { model: displayState }), jsx(HybridGrid, { model: displayState })] }));
});

const TabularEditorStateModelType = types
    .model('TabularEditor', {
    isShown: true,
    featureCollapsed: types.map(types.boolean),
    filterText: '',
})
    .actions((self) => ({
    setFeatureCollapsed(id, state) {
        self.featureCollapsed.set(id, state);
    },
    setFilterText(text) {
        self.filterText = text;
    },
    clearFilterText() {
        self.filterText = '';
    },
    collapseAllFeatures() {
        // iterate over all seen features and set them to collapsed
        const display = getParent(self);
        for (const [featureId] of display.seenFeatures.entries()) {
            self.featureCollapsed.set(featureId, true);
        }
    },
    togglePane() {
        self.isShown = !self.isShown;
    },
    hidePane() {
        self.isShown = false;
    },
    showPane() {
        self.isShown = true;
    },
    // onPatch(patch: any) {
    //   console.log(patch)
    // },
}));

function drawBoxOutline(ctx, x, y, width, height, color) {
    drawBox(ctx, x, y, width, height, color);
    if (width <= 2) {
        return;
    }
    ctx.clearRect(x + 1, y + 1, width - 2, height - 2);
}
function drawBoxFill(ctx, x, y, width, height, color) {
    drawBox(ctx, x + 1, y + 1, width - 2, height - 2, color);
}
function draw$3(ctx, feature, row, stateModel, displayedRegionIndex) {
    const { apolloRowHeight: heightPx, lgv, selectedFeature, theme } = stateModel;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const displayedRegion = displayedRegions[displayedRegionIndex];
    const minX = (lgv.bpToPx({
        refName: displayedRegion.refName,
        coord: feature.min,
        regionNumber: displayedRegionIndex,
    })?.offsetPx ?? 0) - offsetPx;
    const { reversed } = displayedRegion;
    const widthPx = feature.length / bpPerPx;
    const startPx = reversed ? minX - widthPx : minX;
    const top = row * heightPx;
    const backgroundColor = theme.palette.background.default;
    const textColor = theme.palette.text.primary;
    const featureBox = [
        startPx,
        top,
        widthPx,
        heightPx,
    ];
    drawBoxOutline(ctx, ...featureBox, textColor);
    if (widthPx <= 2) {
        // Don't need to add details if the feature is too small to see them
        return;
    }
    drawBoxFill(ctx, startPx, top, widthPx, heightPx, backgroundColor);
    if (isSelectedFeature(feature, selectedFeature)) {
        drawHighlight$3(stateModel, ctx, feature, true);
    }
}
function drawDragPreview$3(stateModel, overlayCtx) {
    const { apolloDragging, apolloRowHeight, lgv, theme } = stateModel;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    if (!apolloDragging) {
        return;
    }
    const { current, edge, feature, start } = apolloDragging;
    const row = Math.floor(start.y / apolloRowHeight);
    const region = displayedRegions[start.regionNumber];
    const rowCount = getRowCount$2();
    const featureEdgeBp = region.reversed
        ? region.end - feature[edge]
        : feature[edge] - region.start;
    const featureEdgePx = featureEdgeBp / bpPerPx - offsetPx;
    const rectX = Math.min(current.x, featureEdgePx);
    const rectY = row * apolloRowHeight;
    const rectWidth = Math.abs(current.x - featureEdgePx);
    const rectHeight = apolloRowHeight * rowCount;
    overlayCtx.strokeStyle = theme.palette.info.main;
    overlayCtx.setLineDash([6]);
    overlayCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);
    overlayCtx.fillStyle = alpha(theme.palette.info.main, 0.2);
    overlayCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
}
function drawHighlight$3(stateModel, ctx, feature, selected = false) {
    const { apolloRowHeight, lgv, theme } = stateModel;
    const position = stateModel.getFeatureLayoutPosition(feature);
    if (!position) {
        return;
    }
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const { layoutIndex, layoutRow } = position;
    const displayedRegion = displayedRegions[layoutIndex];
    const { refName, reversed } = displayedRegion;
    const { length, max, min } = feature;
    const startPx = (lgv.bpToPx({
        refName,
        coord: reversed ? max : min,
        regionNumber: layoutIndex,
    })?.offsetPx ?? 0) - offsetPx;
    const top = layoutRow * apolloRowHeight;
    const widthPx = length / bpPerPx;
    ctx.fillStyle = selected
        ? theme.palette.action.disabled
        : theme.palette.action.focus;
    ctx.fillRect(startPx, top, widthPx, apolloRowHeight);
}
function drawHover$3(stateModel, ctx) {
    const { hoveredFeature } = stateModel;
    if (!hoveredFeature) {
        return;
    }
    drawHighlight$3(stateModel, ctx, hoveredFeature.feature);
}
function drawTooltip$3(display, context) {
    const { hoveredFeature, apolloRowHeight, lgv, theme } = display;
    if (!hoveredFeature) {
        return;
    }
    const { feature } = hoveredFeature;
    const position = display.getFeatureLayoutPosition(feature);
    if (!position) {
        return;
    }
    const { featureRow, layoutIndex, layoutRow } = position;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const displayedRegion = displayedRegions[layoutIndex];
    const { refName, reversed } = displayedRegion;
    let location = 'Loc: ';
    const { length, max, min } = feature;
    location += `${min + 1}–${max}`;
    let startPx = (lgv.bpToPx({
        refName,
        coord: reversed ? max : min,
        regionNumber: layoutIndex,
    })?.offsetPx ?? 0) - offsetPx;
    const top = (layoutRow + featureRow) * apolloRowHeight;
    const widthPx = length / bpPerPx;
    const featureType = `Type: ${feature.type}`;
    const { attributes } = feature;
    const featureName = attributes.get('gff_name')?.find((name) => name !== '');
    const textWidth = [
        context.measureText(featureType).width,
        context.measureText(location).width,
    ];
    if (featureName) {
        textWidth.push(context.measureText(`Name: ${featureName}`).width);
    }
    const maxWidth = Math.max(...textWidth);
    startPx = startPx + widthPx + 5;
    context.fillStyle = alpha(theme.palette.text.primary, 0.7);
    context.fillRect(startPx, top, maxWidth + 4, textWidth.length === 3 ? 45 : 35);
    context.beginPath();
    context.moveTo(startPx, top);
    context.lineTo(startPx - 5, top + 5);
    context.lineTo(startPx, top + 10);
    context.fill();
    context.fillStyle = theme.palette.background.default;
    let textTop = top + 12;
    context.fillText(featureType, startPx + 2, textTop);
    if (featureName) {
        textTop = textTop + 12;
        context.fillText(`Name: ${featureName}`, startPx + 2, textTop);
    }
    textTop = textTop + 12;
    context.fillText(location, startPx + 2, textTop);
}
function drawBox(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}
function getContextMenuItems$3(display) {
    const { hoveredFeature } = display;
    if (!hoveredFeature) {
        return [];
    }
    return getContextMenuItemsForFeature$2(display, hoveredFeature.feature);
}
function getFeatureFromLayout$2(feature, _bp, _row) {
    return feature;
}
function getRowCount$2(_feature) {
    return 1;
}
function getRowForFeature$2(_feature, _childFeature) {
    return 0;
}
function onMouseDown$3(stateModel, currentMousePosition, event) {
    const { feature } = currentMousePosition;
    // swallow the mouseDown if we are on the edge of the feature so that we
    // don't start dragging the view if we try to drag the feature edge
    const edge = isMouseOnFeatureEdge(currentMousePosition, feature, stateModel);
    if (edge) {
        event.stopPropagation();
        stateModel.startDrag(currentMousePosition, feature, edge);
    }
}
function onMouseLeave$3() {
    return;
}
function onMouseMove$3(stateModel, mousePosition) {
    if (isMousePositionWithFeature(mousePosition)) {
        const { feature, bp } = mousePosition;
        stateModel.setHoveredFeature({ feature, bp });
        const edge = isMouseOnFeatureEdge(mousePosition, feature, stateModel);
        if (edge) {
            stateModel.setCursor('col-resize');
            return;
        }
    }
    stateModel.setCursor();
}
function onMouseUp$3(stateModel, mousePosition) {
    if (stateModel.apolloDragging) {
        return;
    }
    const { feature } = mousePosition;
    if (!feature) {
        return;
    }
    stateModel.setSelectedFeature(feature);
    stateModel.showFeatureDetailsWidget(feature);
}
/** @returns undefined if mouse not on the edge of this feature, otherwise 'start' or 'end' depending on which edge */
function isMouseOnFeatureEdge(mousePosition, feature, stateModel) {
    const { refName, regionNumber, x } = mousePosition;
    const { lgv } = stateModel;
    const { offsetPx } = lgv;
    const minPxInfo = lgv.bpToPx({ refName, coord: feature.min, regionNumber });
    const maxPxInfo = lgv.bpToPx({ refName, coord: feature.max, regionNumber });
    if (minPxInfo !== undefined && maxPxInfo !== undefined) {
        const minPx = minPxInfo.offsetPx - offsetPx;
        const maxPx = maxPxInfo.offsetPx - offsetPx;
        if (Math.abs(maxPx - minPx) < 8) {
            return;
        }
        if (Math.abs(minPx - x) < 4) {
            return 'min';
        }
        if (Math.abs(maxPx - x) < 4) {
            return 'max';
        }
    }
    return;
}
const boxGlyph = {
    draw: draw$3,
    drawDragPreview: drawDragPreview$3,
    drawHover: drawHover$3,
    drawTooltip: drawTooltip$3,
    getContextMenuItemsForFeature: getContextMenuItemsForFeature$2,
    getContextMenuItems: getContextMenuItems$3,
    getFeatureFromLayout: getFeatureFromLayout$2,
    getRowCount: getRowCount$2,
    getRowForFeature: getRowForFeature$2,
    onMouseDown: onMouseDown$3,
    onMouseLeave: onMouseLeave$3,
    onMouseMove: onMouseMove$3,
    onMouseUp: onMouseUp$3,
};

let forwardFillLight$1 = null;
let backwardFillLight$1 = null;
let forwardFillDark$1 = null;
let backwardFillDark$1 = null;
const canvas$1 = globalThis.document.createElement('canvas');
// @ts-expect-error getContext is undefined in the web worker
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (canvas$1?.getContext) {
    for (const direction of ['forward', 'backward']) {
        for (const themeMode of ['light', 'dark']) {
            const canvas = document.createElement('canvas');
            const canvasSize = 10;
            canvas.width = canvas.height = canvasSize;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const stripeColor1 = themeMode === 'light' ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.75)';
                const stripeColor2 = themeMode === 'light' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.50)';
                const gradient = direction === 'forward'
                    ? ctx.createLinearGradient(0, canvasSize, canvasSize, 0)
                    : ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
                gradient.addColorStop(0, stripeColor1);
                gradient.addColorStop(0.25, stripeColor1);
                gradient.addColorStop(0.25, stripeColor2);
                gradient.addColorStop(0.5, stripeColor2);
                gradient.addColorStop(0.5, stripeColor1);
                gradient.addColorStop(0.75, stripeColor1);
                gradient.addColorStop(0.75, stripeColor2);
                gradient.addColorStop(1, stripeColor2);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 10, 10);
                if (direction === 'forward') {
                    if (themeMode === 'light') {
                        forwardFillLight$1 = ctx.createPattern(canvas, 'repeat');
                    }
                    else {
                        forwardFillDark$1 = ctx.createPattern(canvas, 'repeat');
                    }
                }
                else {
                    if (themeMode === 'light') {
                        backwardFillLight$1 = ctx.createPattern(canvas, 'repeat');
                    }
                    else {
                        backwardFillDark$1 = ctx.createPattern(canvas, 'repeat');
                    }
                }
            }
        }
    }
}
function drawBackground(ctx, feature, stateModel, displayedRegionIndex, row, color) {
    const { apolloRowHeight, lgv, session, theme } = stateModel;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const displayedRegion = displayedRegions[displayedRegionIndex];
    const { refName, reversed } = displayedRegion;
    const { apolloDataStore } = session;
    const { featureTypeOntology } = apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    const topLevelFeatureMinX = (lgv.bpToPx({
        refName,
        coord: feature.min,
        regionNumber: displayedRegionIndex,
    })?.offsetPx ?? 0) - offsetPx;
    const topLevelFeatureWidthPx = feature.length / bpPerPx;
    const topLevelFeatureStartPx = reversed
        ? topLevelFeatureMinX - topLevelFeatureWidthPx
        : topLevelFeatureMinX;
    const topLevelFeatureTop = row * apolloRowHeight;
    const topLevelFeatureHeight = getRowCount$1(feature, featureTypeOntology) * apolloRowHeight;
    let selectedColor;
    {
        selectedColor = readConfObject(session.getPluginConfiguration(), 'geneBackgroundColor', { featureType: feature.type });
        if (!selectedColor) {
            selectedColor = alpha(theme.palette.background.paper, 0.6);
        }
    }
    ctx.fillStyle = selectedColor;
    ctx.fillRect(topLevelFeatureStartPx, topLevelFeatureTop, topLevelFeatureWidthPx, topLevelFeatureHeight);
}
function draw$2(ctx, feature, row, stateModel, displayedRegionIndex) {
    const { apolloRowHeight, lgv, selectedFeature, session, theme } = stateModel;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const displayedRegion = displayedRegions[displayedRegionIndex];
    const { refName, reversed } = displayedRegion;
    const rowHeight = apolloRowHeight;
    const cdsHeight = Math.round(0.9 * rowHeight);
    const { children, strand } = feature;
    if (!children) {
        return;
    }
    const { apolloDataStore } = session;
    const { featureTypeOntology } = apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    // Draw background for gene
    drawBackground(ctx, feature, stateModel, displayedRegionIndex, row);
    // Draw lines on different rows for each transcript
    let currentRow = 0;
    for (const [, transcript] of children) {
        const isTranscript = featureTypeOntology.isTypeOf(transcript.type, 'transcript') ||
            featureTypeOntology.isTypeOf(transcript.type, 'pseudogenic_transcript');
        if (!isTranscript) {
            currentRow += 1;
            continue;
        }
        const { children: transcriptChildren } = transcript;
        if (!transcriptChildren) {
            continue;
        }
        const cdsCount = getCDSCount(transcript, featureTypeOntology);
        for (const [, childFeature] of transcriptChildren) {
            if (!featureTypeOntology.isTypeOf(childFeature.type, 'CDS')) {
                continue;
            }
            drawLine(ctx, stateModel, displayedRegionIndex, row, transcript, currentRow);
            currentRow += 1;
        }
        if (cdsCount === 0) {
            drawLine(ctx, stateModel, displayedRegionIndex, row, transcript, currentRow);
            currentRow += 1;
        }
    }
    const forwardFill = theme.palette.mode === 'dark' ? forwardFillDark$1 : forwardFillLight$1;
    const backwardFill = theme.palette.mode === 'dark' ? backwardFillDark$1 : backwardFillLight$1;
    // Draw exon and CDS for each transcript
    currentRow = 0;
    for (const [, child] of children) {
        if (!(featureTypeOntology.isTypeOf(child.type, 'transcript') ||
            featureTypeOntology.isTypeOf(child.type, 'pseudogenic_transcript'))) {
            boxGlyph.draw(ctx, child, row, stateModel, displayedRegionIndex);
            currentRow += 1;
            continue;
        }
        const cdsCount = getCDSCount(child, featureTypeOntology);
        if (cdsCount != 0) {
            for (const cdsRow of child.cdsLocations) {
                const { children: transcriptChildren } = child;
                if (!transcriptChildren) {
                    continue;
                }
                for (const [, exon] of transcriptChildren) {
                    if (!featureTypeOntology.isTypeOf(exon.type, 'exon')) {
                        continue;
                    }
                    drawExon(ctx, stateModel, displayedRegionIndex, row, exon, currentRow, strand, forwardFill, backwardFill);
                }
                for (const cds of cdsRow) {
                    const cdsWidthPx = (cds.max - cds.min) / bpPerPx;
                    const minX = (lgv.bpToPx({
                        refName,
                        coord: cds.min,
                        regionNumber: displayedRegionIndex,
                    })?.offsetPx ?? 0) - offsetPx;
                    const cdsStartPx = reversed ? minX - cdsWidthPx : minX;
                    ctx.fillStyle = theme.palette.text.primary;
                    const cdsTop = (row + currentRow) * rowHeight + (rowHeight - cdsHeight) / 2;
                    ctx.fillRect(cdsStartPx, cdsTop, cdsWidthPx, cdsHeight);
                    if (cdsWidthPx > 2) {
                        ctx.clearRect(cdsStartPx + 1, cdsTop + 1, cdsWidthPx - 2, cdsHeight - 2);
                        const frame = getFrame(cds.min, cds.max, child.strand ?? 1, cds.phase);
                        const frameColor = theme.palette.framesCDS.at(frame)?.main;
                        ctx.fillStyle = frameColor ?? 'black';
                        ctx.fillRect(cdsStartPx + 1, cdsTop + 1, cdsWidthPx - 2, cdsHeight - 2);
                        if (forwardFill && backwardFill && strand) {
                            const reversal = reversed ? -1 : 1;
                            const [topFill, bottomFill] = strand * reversal === 1
                                ? [forwardFill, backwardFill]
                                : [backwardFill, forwardFill];
                            ctx.fillStyle = topFill;
                            ctx.fillRect(cdsStartPx + 1, cdsTop + 1, cdsWidthPx - 2, (cdsHeight - 2) / 2);
                            ctx.fillStyle = bottomFill;
                            ctx.fillRect(cdsStartPx + 1, cdsTop + (cdsHeight - 2) / 2, cdsWidthPx - 2, (cdsHeight - 2) / 2);
                        }
                    }
                }
                currentRow += 1;
            }
        }
        const { children: transcriptChildren } = child;
        // Draw exons for non-coding genes
        if (cdsCount === 0 && transcriptChildren) {
            for (const [, exon] of transcriptChildren) {
                if (!featureTypeOntology.isTypeOf(exon.type, 'exon')) {
                    continue;
                }
                drawExon(ctx, stateModel, displayedRegionIndex, row, exon, currentRow, strand, forwardFill, backwardFill);
            }
            currentRow += 1;
        }
    }
    if (selectedFeature && containsSelectedFeature(feature, selectedFeature)) {
        drawHighlight$2(stateModel, ctx, selectedFeature, true);
    }
}
function drawExon(ctx, stateModel, displayedRegionIndex, row, exon, currentRow, strand, forwardFill, backwardFill) {
    const { apolloRowHeight, lgv, theme } = stateModel;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const displayedRegion = displayedRegions[displayedRegionIndex];
    const { refName, reversed } = displayedRegion;
    const minX = (lgv.bpToPx({
        refName,
        coord: exon.min,
        regionNumber: displayedRegionIndex,
    })?.offsetPx ?? 0) - offsetPx;
    const widthPx = exon.length / bpPerPx;
    const startPx = reversed ? minX - widthPx : minX;
    const top = (row + currentRow) * apolloRowHeight;
    const exonHeight = Math.round(0.6 * apolloRowHeight);
    const exonTop = top + (apolloRowHeight - exonHeight) / 2;
    ctx.fillStyle = theme.palette.text.primary;
    ctx.fillRect(startPx, exonTop, widthPx, exonHeight);
    if (widthPx > 2) {
        ctx.clearRect(startPx + 1, exonTop + 1, widthPx - 2, exonHeight - 2);
        ctx.fillStyle = 'rgb(211,211,211)';
        ctx.fillRect(startPx + 1, exonTop + 1, widthPx - 2, exonHeight - 2);
        if (forwardFill && backwardFill && strand) {
            const reversal = reversed ? -1 : 1;
            const [topFill, bottomFill] = strand * reversal === 1
                ? [forwardFill, backwardFill]
                : [backwardFill, forwardFill];
            ctx.fillStyle = topFill;
            ctx.fillRect(startPx + 1, exonTop + 1, widthPx - 2, (exonHeight - 2) / 2);
            ctx.fillStyle = bottomFill;
            ctx.fillRect(startPx + 1, exonTop + 1 + (exonHeight - 2) / 2, widthPx - 2, (exonHeight - 2) / 2);
        }
    }
}
function* range(start, stop, step = 1) {
    if (start === stop) {
        return;
    }
    if (start < stop) {
        for (let i = start; i < stop; i += step) {
            yield i;
        }
        return;
    }
    for (let i = start; i > stop; i -= step) {
        yield i;
    }
}
function drawLine(ctx, stateModel, displayedRegionIndex, row, transcript, currentRow) {
    const { apolloRowHeight, lgv, theme } = stateModel;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const displayedRegion = displayedRegions[displayedRegionIndex];
    const { refName, reversed } = displayedRegion;
    const minX = (lgv.bpToPx({
        refName,
        coord: transcript.min,
        regionNumber: displayedRegionIndex,
    })?.offsetPx ?? 0) - offsetPx;
    const widthPx = Math.round(transcript.length / bpPerPx);
    const startPx = reversed ? minX - widthPx : minX;
    const height = Math.round((currentRow + 1 / 2) * apolloRowHeight) + row * apolloRowHeight;
    ctx.strokeStyle = theme.palette.text.primary;
    const { strand = 1 } = transcript;
    ctx.beginPath();
    // If view is reversed, draw forward as reverse and vice versa
    const effectiveStrand = strand * (reversed ? -1 : 1);
    // Draw the transcript line, and extend it out a bit on the 3` end
    const lineStart = startPx - (effectiveStrand === -1 ? 5 : 0);
    const lineEnd = startPx + widthPx + (effectiveStrand === -1 ? 0 : 5);
    ctx.moveTo(lineStart, height);
    ctx.lineTo(lineEnd, height);
    // Now to draw arrows every 20 pixels along the line
    // Make the arrow range a bit shorter to avoid an arrow hanging off the 5` end
    const arrowsStart = lineStart + (effectiveStrand === -1 ? 0 : 3);
    const arrowsEnd = lineEnd - (effectiveStrand === -1 ? 3 : 0);
    // Offset determines if the arrows face left or right
    const offset = effectiveStrand === -1 ? 3 : -3;
    const arrowRange = effectiveStrand === -1
        ? range(arrowsStart, arrowsEnd, 20)
        : range(arrowsEnd, arrowsStart, 20);
    for (const arrowLocation of arrowRange) {
        ctx.moveTo(arrowLocation + offset, height + offset);
        ctx.lineTo(arrowLocation, height);
        ctx.lineTo(arrowLocation + offset, height - offset);
    }
    ctx.stroke();
}
function drawDragPreview$2(stateModel, overlayCtx) {
    const { apolloDragging, apolloRowHeight, lgv, theme } = stateModel;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    if (!apolloDragging) {
        return;
    }
    const { current, edge, feature, start } = apolloDragging;
    const row = Math.floor(start.y / apolloRowHeight);
    const region = displayedRegions[start.regionNumber];
    const rowCount = 1;
    const featureEdgeBp = region.reversed
        ? region.end - feature[edge]
        : feature[edge] - region.start;
    const featureEdgePx = featureEdgeBp / bpPerPx - offsetPx;
    const rectX = Math.min(current.x, featureEdgePx);
    const rectY = row * apolloRowHeight;
    const rectWidth = Math.abs(current.x - featureEdgePx);
    const rectHeight = apolloRowHeight * rowCount;
    overlayCtx.strokeStyle = theme.palette.info.main;
    overlayCtx.setLineDash([6]);
    overlayCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);
    overlayCtx.fillStyle = alpha(theme.palette.info.main, 0.2);
    overlayCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
}
function drawHighlight$2(stateModel, ctx, feature, selected = false) {
    const { apolloRowHeight, lgv, session, theme } = stateModel;
    const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
    const position = stateModel.getFeatureLayoutPosition(feature);
    if (!position) {
        return;
    }
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const { featureRow, layoutIndex, layoutRow } = position;
    const displayedRegion = displayedRegions[layoutIndex];
    const { refName, reversed } = displayedRegion;
    const { length, max, min } = feature;
    const startPx = (lgv.bpToPx({
        refName,
        coord: reversed ? max : min,
        regionNumber: layoutIndex,
    })?.offsetPx ?? 0) - offsetPx;
    const row = layoutRow + featureRow;
    const top = row * apolloRowHeight;
    const widthPx = length / bpPerPx;
    ctx.fillStyle = selected
        ? theme.palette.action.disabled
        : theme.palette.action.focus;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    ctx.fillRect(startPx, top, widthPx, apolloRowHeight * getRowCount$1(feature, featureTypeOntology));
}
function drawHover$2(stateModel, ctx) {
    const { hoveredFeature } = stateModel;
    if (!hoveredFeature) {
        return;
    }
    drawHighlight$2(stateModel, ctx, hoveredFeature.feature);
}
function getFeatureFromLayout$1(feature, bp, row, featureTypeOntology) {
    const featureInThisRow = featuresForRow$1(feature, featureTypeOntology)[row] || [];
    for (const f of featureInThisRow) {
        let featureObj;
        if (bp >= f.min && bp <= f.max && f.parent) {
            featureObj = f;
        }
        if (!featureObj) {
            continue;
        }
        if (featureTypeOntology.isTypeOf(featureObj.type, 'CDS') &&
            featureObj.parent &&
            (featureTypeOntology.isTypeOf(featureObj.parent.type, 'transcript') ||
                featureTypeOntology.isTypeOf(featureObj.parent.type, 'pseudogenic_transcript'))) {
            const { cdsLocations } = featureObj.parent;
            for (const cdsLoc of cdsLocations) {
                for (const loc of cdsLoc) {
                    if (bp >= loc.min && bp <= loc.max) {
                        return featureObj;
                    }
                }
            }
            // If mouse position is in the intron region, return the transcript
            return featureObj.parent;
        }
        // If mouse position is in a feature that is not a CDS, return the feature
        return featureObj;
    }
    return feature;
}
function getCDSCount(feature, featureTypeOntology) {
    const { children, type } = feature;
    if (!children) {
        return 0;
    }
    const isMrna = featureTypeOntology.isTypeOf(type, 'transcript');
    let cdsCount = 0;
    if (isMrna) {
        for (const [, child] of children) {
            if (featureTypeOntology.isTypeOf(child.type, 'CDS')) {
                cdsCount += 1;
            }
        }
    }
    return cdsCount;
}
function getRowCount$1(feature, featureTypeOntology, _bpPerPx) {
    const { children, type } = feature;
    if (!children) {
        return 1;
    }
    const isTranscript = featureTypeOntology.isTypeOf(type, 'transcript') ||
        featureTypeOntology.isTypeOf(type, 'pseudogenic_transcript');
    let rowCount = 0;
    if (isTranscript) {
        for (const [, child] of children) {
            if (featureTypeOntology.isTypeOf(child.type, 'CDS')) {
                rowCount += 1;
            }
        }
        // return 1 if there are no CDSs for non coding genes
        return rowCount === 0 ? 1 : rowCount;
    }
    for (const [, child] of children) {
        rowCount += getRowCount$1(child, featureTypeOntology);
    }
    return rowCount;
}
/**
 * A list of all the subfeatures for each row for a given feature, as well as
 * the feature itself.
 * If the row contains a transcript, the order is CDS -\> exon -\> transcript -\> gene
 * If the row does not contain an transcript, the order is subfeature -\> gene
 */
function featuresForRow$1(feature, featureTypeOntology) {
    const isGene = featureTypeOntology.isTypeOf(feature.type, 'gene') ||
        featureTypeOntology.isTypeOf(feature.type, 'pseudogene');
    if (!isGene) {
        throw new Error('Top level feature for GeneGlyph must have type "gene"');
    }
    const { children } = feature;
    if (!children) {
        return [[feature]];
    }
    const features = [];
    for (const [, child] of children) {
        if (!(featureTypeOntology.isTypeOf(child.type, 'transcript') ||
            featureTypeOntology.isTypeOf(child.type, 'pseudogenic_transcript'))) {
            features.push([child, feature]);
            continue;
        }
        if (!child.children) {
            continue;
        }
        const cdss = [];
        const exons = [];
        for (const [, grandchild] of child.children) {
            if (featureTypeOntology.isTypeOf(grandchild.type, 'CDS')) {
                cdss.push(grandchild);
            }
            else if (featureTypeOntology.isTypeOf(grandchild.type, 'exon')) {
                exons.push(grandchild);
            }
        }
        for (const cds of cdss) {
            features.push([cds, ...exons, child, feature]);
        }
        if (cdss.length === 0) {
            features.push([...exons, child, feature]);
        }
    }
    return features;
}
function getRowForFeature$1(feature, childFeature, featureTypeOntology) {
    const rows = featuresForRow$1(feature, featureTypeOntology);
    for (const [idx, row] of rows.entries()) {
        if (row.some((feature) => feature._id === childFeature._id)) {
            return idx;
        }
    }
    return;
}
function onMouseDown$2(stateModel, currentMousePosition, event) {
    const { feature } = currentMousePosition;
    // swallow the mouseDown if we are on the edge of the feature so that we
    // don't start dragging the view if we try to drag the feature edge
    const draggableFeature = getDraggableFeatureInfo$1(currentMousePosition, feature, stateModel);
    if (draggableFeature) {
        event.stopPropagation();
        stateModel.startDrag(currentMousePosition, draggableFeature.feature, draggableFeature.edge, true);
    }
}
function onMouseMove$2(stateModel, mousePosition) {
    if (isMousePositionWithFeature(mousePosition)) {
        const { feature, bp } = mousePosition;
        stateModel.setHoveredFeature({ feature, bp });
        const draggableFeature = getDraggableFeatureInfo$1(mousePosition, feature, stateModel);
        if (draggableFeature) {
            stateModel.setCursor('col-resize');
            return;
        }
    }
    stateModel.setCursor();
}
function onMouseUp$2(stateModel, mousePosition) {
    if (stateModel.apolloDragging) {
        return;
    }
    const { feature } = mousePosition;
    if (!feature) {
        return;
    }
    selectFeatureAndOpenWidget(stateModel, feature);
}
function getDraggableFeatureInfo$1(mousePosition, feature, stateModel) {
    const { session } = stateModel;
    const { apolloDataStore } = session;
    const { featureTypeOntology } = apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    const isGene = featureTypeOntology.isTypeOf(feature.type, 'gene') ||
        featureTypeOntology.isTypeOf(feature.type, 'pseudogene');
    const isTranscript = featureTypeOntology.isTypeOf(feature.type, 'transcript') ||
        featureTypeOntology.isTypeOf(feature.type, 'pseudogenic_transcript');
    const isCDS = featureTypeOntology.isTypeOf(feature.type, 'CDS');
    if (isGene || isTranscript) {
        // For gene glyphs, the sizes of genes and transcripts are determined by
        // their child exons, so we don't make them draggable
        return;
    }
    // So now the type of feature is either CDS or exon. If an exon and CDS edge
    // are in the same place, we want to prioritize dragging the exon. If the
    // feature we're on is a CDS, let's find any exon it may overlap.
    const { bp, refName, regionNumber, x } = mousePosition;
    const { lgv } = stateModel;
    if (isCDS) {
        const transcript = feature.parent;
        if (!transcript?.children) {
            return;
        }
        const exonChildren = [];
        for (const child of transcript.children.values()) {
            const childIsExon = featureTypeOntology.isTypeOf(child.type, 'exon');
            if (childIsExon) {
                exonChildren.push(child);
            }
        }
        const overlappingExon = exonChildren.find((child) => {
            const [start, end] = intersection2(bp - 1, bp, child.min, child.max);
            return start !== undefined && end !== undefined;
        });
        if (overlappingExon) {
            // We are on an exon, are we on the edge of it?
            const minMax = getMinAndMaxPx(overlappingExon, refName, regionNumber, lgv);
            if (minMax) {
                const overlappingEdge = getOverlappingEdge(overlappingExon, x, minMax);
                if (overlappingEdge) {
                    return overlappingEdge;
                }
            }
        }
    }
    // End of special cases, let's see if we're on the edge of this CDS or exon
    const minMax = getMinAndMaxPx(feature, refName, regionNumber, lgv);
    if (minMax) {
        const overlappingEdge = getOverlappingEdge(feature, x, minMax);
        if (overlappingEdge) {
            return overlappingEdge;
        }
    }
    return;
}
function getContextMenuItems$2(display, mousePosition) {
    const { apolloInternetAccount: internetAccount, hoveredFeature, changeManager, regions, selectedFeature, session, } = display;
    const [region] = regions;
    const currentAssemblyId = display.getAssemblyId(region.assemblyName);
    const menuItems = [];
    const role = internetAccount ? internetAccount.role : 'admin';
    const admin = role === 'admin';
    if (!hoveredFeature) {
        return menuItems;
    }
    if (isMousePositionWithFeature(mousePosition)) {
        const { bp, feature } = mousePosition;
        let featuresUnderClick = getRelatedFeatures(feature, bp);
        if (isCDSFeature(feature, session)) {
            featuresUnderClick = getRelatedFeatures(feature, bp, true);
        }
        for (const feature of featuresUnderClick) {
            const contextMenuItemsForFeature = boxGlyph.getContextMenuItemsForFeature(display, feature);
            if (isExonFeature(feature, session)) {
                const adjacentExons = getAdjacentExons(feature, display, mousePosition, session);
                const lgv = getContainingView(display);
                if (adjacentExons.upstream) {
                    const exon = adjacentExons.upstream;
                    contextMenuItemsForFeature.push({
                        label: 'Go to upstream exon',
                        icon: getStreamIcon(feature.strand, true, lgv.displayedRegions.at(0)?.reversed),
                        onClick: () => {
                            lgv.navTo(navToFeatureCenter(exon, 0.1, lgv.totalBp));
                            selectFeatureAndOpenWidget(display, exon);
                        },
                    });
                }
                if (adjacentExons.downstream) {
                    const exon = adjacentExons.downstream;
                    contextMenuItemsForFeature.push({
                        label: 'Go to downstream exon',
                        icon: getStreamIcon(feature.strand, false, lgv.displayedRegions.at(0)?.reversed),
                        onClick: () => {
                            lgv.navTo(navToFeatureCenter(exon, 0.1, lgv.totalBp));
                            selectFeatureAndOpenWidget(display, exon);
                        },
                    });
                }
                contextMenuItemsForFeature.push({
                    label: 'Merge exons',
                    disabled: !admin,
                    onClick: () => {
                        session.queueDialog((doneCallback) => [
                            MergeExons,
                            {
                                session,
                                handleClose: () => {
                                    doneCallback();
                                },
                                changeManager,
                                sourceFeature: feature,
                                sourceAssemblyId: currentAssemblyId,
                                selectedFeature,
                                setSelectedFeature: (feature) => {
                                    display.setSelectedFeature(feature);
                                },
                            },
                        ]);
                    },
                }, {
                    label: 'Split exon',
                    disabled: !admin,
                    onClick: () => {
                        session.queueDialog((doneCallback) => [
                            SplitExon,
                            {
                                session,
                                handleClose: () => {
                                    doneCallback();
                                },
                                changeManager,
                                sourceFeature: feature,
                                sourceAssemblyId: currentAssemblyId,
                                selectedFeature,
                                setSelectedFeature: (feature) => {
                                    display.setSelectedFeature(feature);
                                },
                            },
                        ]);
                    },
                });
            }
            if (isTranscriptFeature(feature, session)) {
                contextMenuItemsForFeature.push({
                    label: 'Merge transcript',
                    onClick: () => {
                        session.queueDialog((doneCallback) => [
                            MergeTranscripts,
                            {
                                session,
                                handleClose: () => {
                                    doneCallback();
                                },
                                changeManager,
                                sourceFeature: feature,
                                sourceAssemblyId: currentAssemblyId,
                                selectedFeature,
                                setSelectedFeature: (feature) => {
                                    display.setSelectedFeature(feature);
                                },
                            },
                        ]);
                    },
                }, {
                    label: 'Duplicate feature',
                    onClick: () => {
                        session.queueDialog((doneCallback) => [
                            DuplicateTranscript,
                            {
                                session,
                                handleClose: () => {
                                    doneCallback();
                                },
                                changeManager,
                                sourceFeature: feature,
                                sourceAssemblyId: currentAssemblyId,
                                selectedFeature,
                                setSelectedFeature: (feature) => {
                                    display.setSelectedFeature(feature);
                                },
                            },
                        ]);
                    },
                });
                if (isSessionModelWithWidgets(session)) {
                    contextMenuItemsForFeature.splice(1, 0, {
                        label: 'Open transcript editor',
                        onClick: () => {
                            const apolloTranscriptWidget = session.addWidget('ApolloTranscriptDetails', 'apolloTranscriptDetails', {
                                feature,
                                assembly: currentAssemblyId,
                                changeManager,
                                refName: region.refName,
                            });
                            session.showWidget(apolloTranscriptWidget);
                        },
                    });
                }
            }
            menuItems.push({
                label: feature.type,
                subMenu: contextMenuItemsForFeature,
            });
        }
    }
    return menuItems;
}
// False positive here, none of these functions use "this"
/* eslint-disable @typescript-eslint/unbound-method */
const { drawTooltip: drawTooltip$2, getContextMenuItemsForFeature: getContextMenuItemsForFeature$1, onMouseLeave: onMouseLeave$2 } = boxGlyph;
/* eslint-enable @typescript-eslint/unbound-method */
const geneGlyph$1 = {
    draw: draw$2,
    drawDragPreview: drawDragPreview$2,
    drawHover: drawHover$2,
    drawTooltip: drawTooltip$2,
    getContextMenuItems: getContextMenuItems$2,
    getContextMenuItemsForFeature: getContextMenuItemsForFeature$1,
    getFeatureFromLayout: getFeatureFromLayout$1,
    getRowCount: getRowCount$1,
    getRowForFeature: getRowForFeature$1,
    onMouseDown: onMouseDown$2,
    onMouseLeave: onMouseLeave$2,
    onMouseMove: onMouseMove$2,
    onMouseUp: onMouseUp$2,
};

function featuresForRow(feature) {
    const features = [[feature]];
    if (feature.children) {
        for (const [, child] of feature.children) {
            features.push(...featuresForRow(child));
        }
    }
    return features;
}
function getRowCount(feature) {
    return featuresForRow(feature).length;
}
function draw$1(ctx, feature, row, stateModel, displayedRegionIndex) {
    const { selectedFeature } = stateModel;
    for (let i = 0; i < getRowCount(feature); i++) {
        drawRow(ctx, feature, row + i, row, stateModel, displayedRegionIndex);
    }
    if (selectedFeature && containsSelectedFeature(feature, selectedFeature)) {
        drawHighlight$1(stateModel, ctx, selectedFeature);
    }
}
function drawRow(ctx, topLevelFeature, row, topRow, stateModel, displayedRegionIndex) {
    const features = featuresForRow(topLevelFeature)[row - topRow];
    for (const feature of features) {
        drawFeature(ctx, feature, row, stateModel, displayedRegionIndex);
    }
}
function drawFeature(ctx, feature, row, stateModel, displayedRegionIndex) {
    const { apolloRowHeight: heightPx, lgv, theme } = stateModel;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const displayedRegion = displayedRegions[displayedRegionIndex];
    const minX = (lgv.bpToPx({
        refName: displayedRegion.refName,
        coord: feature.min,
        regionNumber: displayedRegionIndex,
    })?.offsetPx ?? 0) - offsetPx;
    const { reversed } = displayedRegion;
    const widthPx = feature.length / bpPerPx;
    const startPx = reversed ? minX - widthPx : minX;
    const top = row * heightPx;
    const rowCount = getRowCount(feature);
    const groupingColor = alpha(theme.palette.background.paper, 0.6);
    if (rowCount > 1) {
        // draw background that encapsulates all child features
        const featureHeight = rowCount * heightPx;
        drawBox(ctx, startPx, top, widthPx, featureHeight, groupingColor);
    }
    boxGlyph.draw(ctx, feature, row, stateModel, displayedRegionIndex);
}
function drawHighlight$1(stateModel, ctx, feature, selected = false) {
    const { apolloRowHeight, lgv, theme } = stateModel;
    const position = stateModel.getFeatureLayoutPosition(feature);
    if (!position) {
        return;
    }
    const { featureRow, layoutIndex, layoutRow } = position;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const displayedRegion = displayedRegions[layoutIndex];
    const { refName, reversed } = displayedRegion;
    const { length, max, min } = feature;
    const startPx = (lgv.bpToPx({
        refName,
        coord: reversed ? max : min,
        regionNumber: layoutIndex,
    })?.offsetPx ?? 0) - offsetPx;
    const top = (layoutRow + featureRow) * apolloRowHeight;
    const widthPx = length / bpPerPx;
    ctx.fillStyle = selected
        ? theme.palette.action.disabled
        : theme.palette.action.focus;
    ctx.fillRect(startPx, top, widthPx, apolloRowHeight * getRowCount(feature));
}
function drawHover$1(stateModel, ctx) {
    const { hoveredFeature } = stateModel;
    if (!hoveredFeature) {
        return;
    }
    drawHighlight$1(stateModel, ctx, hoveredFeature.feature);
}
function getFeatureFromLayout(feature, bp, row) {
    const layoutRow = featuresForRow(feature)[row];
    return layoutRow.find((f) => bp >= f.min && bp <= f.max);
}
function getRowForFeature(feature, childFeature) {
    const rows = featuresForRow(feature);
    for (const [idx, row] of rows.entries()) {
        if (row.some((feature) => feature._id === childFeature._id)) {
            return idx;
        }
    }
    return;
}
function getContextMenuItems$1(display, mousePosition) {
    const { hoveredFeature, session } = display;
    const menuItems = [];
    if (!hoveredFeature) {
        return menuItems;
    }
    const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    const sourceFeatureMenuItems = boxGlyph.getContextMenuItems(display, mousePosition);
    menuItems.push({
        label: hoveredFeature.feature.type,
        subMenu: sourceFeatureMenuItems,
    });
    if (isMousePositionWithFeature(mousePosition)) {
        const { bp, feature } = mousePosition;
        for (const relative of getRelatedFeatures(feature, bp)) {
            if (relative._id === hoveredFeature.feature._id) {
                continue;
            }
            const contextMenuItemsForFeature = boxGlyph.getContextMenuItemsForFeature(display, relative);
            menuItems.push({
                label: relative.type,
                subMenu: contextMenuItemsForFeature,
            });
        }
    }
    return menuItems;
}
// False positive here, none of these functions use "this"
/* eslint-disable @typescript-eslint/unbound-method */
const { drawDragPreview: drawDragPreview$1, drawTooltip: drawTooltip$1, getContextMenuItemsForFeature, onMouseDown: onMouseDown$1, onMouseLeave: onMouseLeave$1, onMouseMove: onMouseMove$1, onMouseUp: onMouseUp$1, } = boxGlyph;
/* eslint-enable @typescript-eslint/unbound-method */
const genericChildGlyph = {
    draw: draw$1,
    drawDragPreview: drawDragPreview$1,
    drawHover: drawHover$1,
    drawTooltip: drawTooltip$1,
    getContextMenuItemsForFeature,
    getContextMenuItems: getContextMenuItems$1,
    getFeatureFromLayout,
    getRowCount,
    getRowForFeature,
    onMouseDown: onMouseDown$1,
    onMouseLeave: onMouseLeave$1,
    onMouseMove: onMouseMove$1,
    onMouseUp: onMouseUp$1,
};

const FilterFeatures = observer(function FilterFeatures({ featureTypes, handleClose, onUpdate, session, }) {
    const [type, setType] = useState('');
    const [selectedFeatureTypes, setSelectedFeatureTypes] = useState(featureTypes);
    const handleChange = (value) => {
        setType(value);
    };
    const handleAddFeatureType = () => {
        if (type) {
            if (selectedFeatureTypes.includes(type)) {
                return;
            }
            onUpdate([...selectedFeatureTypes, type]);
            setSelectedFeatureTypes([...selectedFeatureTypes, type]);
        }
    };
    const handleFeatureTypeDelete = (value) => {
        const newTypes = selectedFeatureTypes.filter((type) => type !== value);
        onUpdate(newTypes);
        setSelectedFeatureTypes(newTypes);
    };
    return (jsx(Dialog, { open: true, maxWidth: false, "data-testid": "filter-features-dialog", title: "Filter features by type", handleClose: handleClose, children: jsxs(DialogContent, { children: [jsx(DialogContentText, { children: "Select the feature types you want to display in the apollo track" }), jsxs(Grid, { container: true, spacing: 2, children: [jsx(Grid, { size: 8, children: jsx(OntologyTermAutocomplete, { session: session, ontologyName: "Sequence Ontology", style: { width: '100%' }, value: type, filterTerms: isOntologyClass, renderInput: (params) => (jsx(TextField, { ...params, label: "Feature type", variant: "outlined", fullWidth: true })), onChange: (oldValue, newValue) => {
                                    if (newValue) {
                                        handleChange(newValue);
                                    }
                                } }) }), jsx(Grid, { size: 4, children: jsx(Button, { variant: "contained", onClick: handleAddFeatureType, disabled: !type, style: { marginTop: 9 }, size: "medium", children: "Add" }) })] }), selectedFeatureTypes.length > 0 && (jsxs("div", { children: [jsx("hr", {}), jsxs("div", { style: { width: 300 }, children: [jsx(DialogContentText, { children: "Selected feature types:" }), jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 0.5 }, children: selectedFeatureTypes.map((value) => (jsx(Chip, { label: value, onDelete: () => {
                                            handleFeatureTypeDelete(value);
                                        } }, value))) })] })] }))] }) }));
});

const EditZoomThresholdDialog = observer(function ({ model, handleClose, }) {
    const [zoomThreshold, setZoomThreshold] = useState(`${model.zoomThresholdSetting}`);
    return (jsx(Dialog$1, { open: true, onClose: handleClose, title: "Edit zoom threshold setting", children: jsxs(DialogContent, { children: [jsx(Typography, { children: "The zoom level in base pairs (bp) per pixel at which features are rendered in this Annotations track. Increasing the value will allow features to render when zooming out, but might impact performance." }), jsx(TextField, { label: "Threshold value (bpPerPx)", value: zoomThreshold, onChange: (event) => {
                        setZoomThreshold(event.target.value);
                    } }), jsxs(DialogActions, { children: [jsx(Button, { variant: "contained", onClick: () => {
                                model.setZoomThresholdSetting({
                                    zoomThreshold: +zoomThreshold,
                                });
                                handleClose();
                            }, children: "Submit" }), jsx(Button, { variant: "contained", color: "secondary", onClick: () => {
                                handleClose();
                            }, children: "Cancel" })] })] }) }));
});

const useStyles$1 = makeStyles()((theme) => ({
    canvasContainer: {
        position: 'relative',
        left: 0,
    },
    canvas: {
        position: 'absolute',
        left: 0,
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
    },
    ellipses: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    avatar: {
        position: 'static',
        height: '100%',
        width: '100%',
        overflow: 'visible',
        color: theme.palette.warning.light,
        backgroundColor: theme.palette.warning.contrastText,
    },
    box: {
        position: 'absolute',
        overflow: 'visible',
    },
    badge: {
        display: 'inline-block',
    },
    loading: {
        position: 'absolute',
        right: theme.spacing(3),
        zIndex: 10,
        pointerEvents: 'none',
        textAlign: 'right',
    },
    locked: {
        position: 'absolute',
        right: theme.spacing(3),
        top: theme.spacing(6),
        zIndex: 1,
        pointerEvents: 'none',
        textAlign: 'right',
    },
}));
function clusterResultByMessage(items, width, touchesAsOverlap) {
    const byMsg = new Map();
    for (const it of items) {
        (byMsg.get(it.message) ?? byMsg.set(it.message, []).get(it.message)).push(it);
    }
    const clusters = [];
    const overlaps = (aEnd, bStart) => bStart <= aEnd ;
    for (const [message, arr] of byMsg.entries()) {
        if (arr.length === 0) {
            continue;
        }
        arr.sort((a, b) => a.start - b.start);
        let group = [arr[0]];
        let curMin = arr[0].start;
        let curMax = arr[0].start + width;
        const pushResult = () => {
            const starts = group.map((d) => d.start).sort((a, b) => a - b);
            const mid = Math.floor(starts.length / 2);
            const median = starts.length % 2 ? starts[mid] : (starts[mid - 1] + starts[mid]) / 2;
            const clusterId = group[0]._id;
            const featureIds = group[0].ids;
            clusters.push({
                _id: clusterId,
                message,
                start: median,
                count: group.length,
                members: [...group],
                range: { min: curMin, max: curMax },
                featureIds,
            });
        };
        for (let i = 1; i < arr.length; i++) {
            const it = arr[i];
            const itStart = it.start;
            const itEnd = itStart + width;
            if (overlaps(curMax, itStart)) {
                group.push(it);
                if (itStart < curMin) {
                    curMin = itStart;
                }
                if (itEnd > curMax) {
                    curMax = itEnd;
                }
            }
            else {
                pushResult();
                group = [it];
                curMin = itStart;
                curMax = itEnd;
            }
        }
        pushResult();
    }
    clusters.sort((a, b) => a.message.localeCompare(b.message) || a.start - b.start);
    return clusters;
}
function codonColorCode(letter, theme, highContrast) {
    if (letter === 'M') {
        return theme.palette.startCodon;
    }
    if (letter === '*') {
        return highContrast ? theme.palette.text.primary : theme.palette.stopCodon;
    }
    return;
}
function colorCode(letter, theme) {
    const letterUpper = letter.toUpperCase();
    if (letterUpper === 'A' ||
        letterUpper === 'C' ||
        letterUpper === 'G' ||
        letterUpper === 'T') {
        return theme.palette.bases[letterUpper].main.toString();
    }
    return 'lightgray';
}

const minDisplayHeight$2 = 20;
function baseModelFactory$2(_pluginManager, configSchema) {
    return BaseDisplay.named('BaseLinearApolloDisplay')
        .props({
        type: types.literal('LinearApolloDisplay'),
        configuration: ConfigurationReference(configSchema),
        graphical: true,
        table: false,
        showCheckResults: true,
        zoomThreshold: 200,
        heightPreConfig: types.maybe(types.refinement('displayHeight', types.number, (n) => n >= minDisplayHeight$2)),
        filteredFeatureTypes: types.array(types.string),
        loadingState: false,
    })
        .views((self) => {
        const { configuration, renderProps: superRenderProps } = self;
        return {
            renderProps() {
                return {
                    ...superRenderProps(),
                    ...getParentRenderProps(self),
                    config: configuration.renderer,
                };
            },
        };
    })
        .volatile(() => ({
        scrollTop: 0,
    }))
        .views((self) => ({
        get lgv() {
            return getContainingView(self);
        },
        get height() {
            if (self.heightPreConfig) {
                return self.heightPreConfig;
            }
            if (self.graphical && self.table) {
                return 400;
            }
            if (self.graphical) {
                return 100;
            }
            return 200;
        },
        get loading() {
            return self.loadingState;
        },
        get zoomThresholdSetting() {
            return self.zoomThreshold ?? getConf(self, 'zoomThreshold');
        },
    }))
        .views((self) => ({
        get rendererTypeName() {
            return self.configuration.renderer.type;
        },
        get session() {
            return getSession(self);
        },
        get regions() {
            const regions = self.lgv.dynamicBlocks.contentBlocks.map(({ assemblyName, end, refName, start }) => ({
                assemblyName,
                refName,
                start: Math.round(start),
                end: Math.round(end),
            }));
            return regions;
        },
        regionCannotBeRendered( /* region */) {
            if (self.lgv && self.lgv.bpPerPx >= self.zoomThreshold) {
                return 'Zoom in to see annotations';
            }
            return;
        },
    }))
        .views((self) => ({
        get apolloInternetAccount() {
            const [region] = self.regions;
            const { internetAccounts } = getRoot(self);
            const { assemblyName } = region;
            const { assemblyManager } = self.session;
            const assembly = assemblyManager.get(assemblyName);
            if (!assembly) {
                throw new Error(`No assembly found with name ${assemblyName}`);
            }
            const { internetAccountConfigId } = getConf(assembly, [
                'sequence',
                'metadata',
            ]);
            return internetAccounts.find((ia) => getConf(ia, 'internetAccountId') === internetAccountConfigId);
        },
        get changeManager() {
            return self.session.apolloDataStore
                .changeManager;
        },
        getAssemblyId(assemblyName) {
            const { assemblyManager } = self.session;
            const assembly = assemblyManager.get(assemblyName);
            if (!assembly) {
                throw new Error(`Could not find assembly named ${assemblyName}`);
            }
            return assembly.name;
        },
        get selectedFeature() {
            return self.session
                .apolloSelectedFeature;
        },
        get hoveredFeature() {
            return self.session
                .apolloHoveredFeature;
        },
    }))
        .actions((self) => ({
        setScrollTop(scrollTop) {
            self.scrollTop = scrollTop;
        },
        setHeight(displayHeight) {
            self.heightPreConfig = Math.max(displayHeight, minDisplayHeight$2);
            return self.height;
        },
        resizeHeight(distance) {
            const oldHeight = self.height;
            const newHeight = this.setHeight(self.height + distance);
            return newHeight - oldHeight;
        },
        showGraphicalOnly() {
            self.graphical = true;
            self.table = false;
        },
        showTableOnly() {
            self.graphical = false;
            self.table = true;
        },
        showGraphicalAndTable() {
            self.graphical = true;
            self.table = true;
        },
        toggleShowCheckResults() {
            self.showCheckResults = !self.showCheckResults;
        },
        updateFilteredFeatureTypes(types) {
            self.filteredFeatureTypes = cast(types);
        },
        setLoading(loading) {
            self.loadingState = loading;
        },
        setZoomThresholdSetting({ zoomThreshold }) {
            self.zoomThreshold = zoomThreshold;
        },
    }))
        .views((self) => {
        const { filteredFeatureTypes, trackMenuItems: superTrackMenuItems } = self;
        return {
            trackMenuItems() {
                const { graphical, table, showCheckResults } = self;
                return [
                    ...superTrackMenuItems(),
                    {
                        type: 'subMenu',
                        label: 'Appearance',
                        subMenu: [
                            {
                                label: 'Show graphical display',
                                type: 'radio',
                                checked: graphical && !table,
                                onClick: () => {
                                    self.showGraphicalOnly();
                                },
                            },
                            {
                                label: 'Show table display',
                                type: 'radio',
                                checked: table && !graphical,
                                onClick: () => {
                                    self.showTableOnly();
                                },
                            },
                            {
                                label: 'Show both graphical and table display',
                                type: 'radio',
                                checked: table && graphical,
                                onClick: () => {
                                    self.showGraphicalAndTable();
                                },
                            },
                            {
                                label: 'Check Results',
                                type: 'checkbox',
                                checked: showCheckResults,
                                onClick: () => {
                                    self.toggleShowCheckResults();
                                },
                            },
                            {
                                label: 'Change zoom threshold',
                                onClick: () => {
                                    getSession(self).queueDialog((handleClose) => [
                                        EditZoomThresholdDialog,
                                        { model: self, handleClose },
                                    ]);
                                },
                            },
                        ],
                    },
                    {
                        label: 'Filter features by type',
                        onClick: () => {
                            const session = self.session;
                            self.session.queueDialog((doneCallback) => [
                                FilterFeatures,
                                {
                                    session,
                                    handleClose: () => {
                                        doneCallback();
                                    },
                                    featureTypes: getSnapshot(filteredFeatureTypes),
                                    onUpdate: (types) => {
                                        self.updateFilteredFeatureTypes(types);
                                    },
                                },
                            ]);
                        },
                    },
                ];
            },
        };
    })
        .actions((self) => ({
        setSelectedFeature(feature) {
            self.session.apolloSetSelectedFeature(feature);
        },
        setHoveredFeature(hoveredFeature) {
            self.session.apolloSetHoveredFeature(hoveredFeature);
        },
        showFeatureDetailsWidget(feature, customWidgetNameAndId) {
            const [region] = self.regions;
            const { assemblyName, refName } = region;
            const assembly = self.getAssemblyId(assemblyName);
            if (!assembly) {
                return;
            }
            const { session } = self;
            const { changeManager } = session.apolloDataStore;
            const [widgetName, widgetId] = customWidgetNameAndId ?? [
                'ApolloFeatureDetailsWidget',
                'apolloFeatureDetailsWidget',
            ];
            const apolloFeatureWidget = session.addWidget(widgetName, widgetId, {
                feature,
                assembly,
                refName,
                changeManager,
            });
            session.showWidget(apolloFeatureWidget);
        },
        afterAttach() {
            addDisposer(self, autorun(() => {
                if (!self.lgv.initialized || self.regionCannotBeRendered()) {
                    return;
                }
                self.setLoading(true);
                void self.session.apolloDataStore
                    .loadFeatures(self.regions)
                    .then(() => {
                    setTimeout(() => {
                        self.setLoading(false);
                    }, 1000);
                });
            }, { name: 'LinearApolloDisplayLoadFeatures', delay: 1000 }));
        },
    }));
}

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
function getRowsForFeature(startingRow, rowCount, filledRowLocations) {
    const rowsForFeature = [];
    for (let i = startingRow; i < startingRow + rowCount; i++) {
        const row = filledRowLocations.get(i);
        if (row) {
            rowsForFeature.push(row);
        }
    }
    return rowsForFeature;
}
function canPlaceFeatureInRows(rowsForFeature, feature) {
    for (const rowForFeature of rowsForFeature) {
        for (const [rowStart, rowEnd] of rowForFeature) {
            if (doesIntersect2(feature.min, feature.max, rowStart, rowEnd) ||
                doesIntersect2(rowStart, rowEnd, feature.min, feature.max)) {
                return false;
            }
        }
    }
    return true;
}
function layoutsModelFactory$1(pluginManager, configSchema) {
    const BaseLinearApolloDisplay = baseModelFactory$2(pluginManager, configSchema);
    return BaseLinearApolloDisplay.named('LinearApolloDisplayLayouts')
        .props({
        cleanupBoundary: 200_000,
    })
        .volatile(() => ({
        seenFeatures: observable.map(),
    }))
        .views((self) => ({
        getAnnotationFeatureById(id) {
            return self.seenFeatures.get(id);
        },
        getGlyph(feature) {
            const { topLevelFeature } = feature;
            if (topLevelFeature.looksLikeGene) {
                return geneGlyph$1;
            }
            if (topLevelFeature.children?.size) {
                return genericChildGlyph;
            }
            return boxGlyph;
        },
    }))
        .actions((self) => ({
        addSeenFeature(feature) {
            self.seenFeatures.set(feature._id, feature);
        },
        deleteSeenFeature(featureId) {
            self.seenFeatures.delete(featureId);
        },
    }))
        .views((self) => ({
        get featureLayouts() {
            const { assemblyManager } = self.session;
            return self.lgv.displayedRegions.map((region) => {
                const assembly = assemblyManager.get(region.assemblyName);
                const featureLayout = new Map();
                // Track the occupied coordinates in each row
                const filledRowLocations = new Map();
                const { end, refName, start } = region;
                for (const [id, feature] of self.seenFeatures.entries()) {
                    if (!isAlive(feature)) {
                        self.deleteSeenFeature(id);
                        continue;
                    }
                    if (refName !== assembly?.getCanonicalRefName(feature.refSeq) ||
                        !doesIntersect2(start, end, feature.min, feature.max) ||
                        (self.filteredFeatureTypes.length > 0 &&
                            !self.filteredFeatureTypes.includes(feature.type))) {
                        continue;
                    }
                    const { featureTypeOntology } = self.session.apolloDataStore.ontologyManager;
                    if (!featureTypeOntology) {
                        throw new Error('featureTypeOntology is undefined');
                    }
                    const rowCount = self
                        .getGlyph(feature)
                        .getRowCount(feature, featureTypeOntology, self.lgv.bpPerPx);
                    let startingRow = 0;
                    let placed = false;
                    while (!placed) {
                        let rowsForFeature = getRowsForFeature(startingRow, rowCount, filledRowLocations);
                        if (rowsForFeature.length < rowCount) {
                            for (let i = 0; i < rowCount - rowsForFeature.length; i++) {
                                const newRowNumber = filledRowLocations.size;
                                filledRowLocations.set(newRowNumber, []);
                                featureLayout.set(newRowNumber, []);
                            }
                            rowsForFeature = getRowsForFeature(startingRow, rowCount, filledRowLocations);
                        }
                        if (!canPlaceFeatureInRows(rowsForFeature, feature)) {
                            startingRow += 1;
                            continue;
                        }
                        for (let rowNum = startingRow; rowNum < startingRow + rowCount; rowNum++) {
                            filledRowLocations.get(rowNum)?.push([feature.min, feature.max]);
                            const layoutRow = featureLayout.get(rowNum);
                            layoutRow?.push([rowNum - startingRow, feature._id]);
                        }
                        placed = true;
                    }
                }
                return featureLayout;
            });
        },
        getFeatureLayoutPosition(feature) {
            const { featureLayouts } = this;
            const { featureTypeOntology } = self.session.apolloDataStore.ontologyManager;
            for (const [idx, layout] of featureLayouts.entries()) {
                for (const [layoutRowNum, layoutRow] of layout) {
                    for (const [featureRowNum, layoutFeatureId] of layoutRow) {
                        if (featureRowNum !== 0) {
                            // Same top-level feature in all feature rows, so only need to
                            // check the first one
                            continue;
                        }
                        const layoutFeature = self.getAnnotationFeatureById(layoutFeatureId);
                        if (!layoutFeature) {
                            continue;
                        }
                        if (feature._id === layoutFeature._id) {
                            return {
                                layoutIndex: idx,
                                layoutRow: layoutRowNum,
                                featureRow: featureRowNum,
                            };
                        }
                        if (layoutFeature.hasDescendant(feature._id)) {
                            if (!featureTypeOntology) {
                                throw new Error('featureTypeOntology is undefined');
                            }
                            const row = self
                                .getGlyph(layoutFeature)
                                .getRowForFeature(layoutFeature, feature, featureTypeOntology);
                            if (row !== undefined) {
                                return {
                                    layoutIndex: idx,
                                    layoutRow: layoutRowNum,
                                    featureRow: row,
                                };
                            }
                        }
                    }
                }
            }
            return;
        },
    }))
        .views((self) => ({
        get highestRow() {
            return Math.max(0, ...self.featureLayouts.map((layout) => Math.max(...layout.keys())));
        },
    }))
        .actions((self) => ({
        afterAttach() {
            addDisposer(self, autorun(() => {
                if (!self.lgv.initialized || self.regionCannotBeRendered()) {
                    return;
                }
                // Clear out features that are no longer in the view and out of the cleanup boundary
                // cleanup boundary + region boundary + cleanup boundary
                for (const [id, feature] of self.seenFeatures.entries()) {
                    let shouldKeep = false;
                    for (const region of self.regions) {
                        const extendedStart = region.start - self.cleanupBoundary;
                        const extendedEnd = region.end + self.cleanupBoundary;
                        if (doesIntersect2(extendedStart, extendedEnd, feature.min, feature.max)) {
                            shouldKeep = true;
                            break;
                        }
                    }
                    if (!shouldKeep) {
                        self.deleteSeenFeature(id);
                    }
                }
                // Add features that are in the current view
                for (const region of self.regions) {
                    const assembly = self.session.apolloDataStore.assemblies.get(region.assemblyName);
                    const ref = assembly?.getByRefName(region.refName);
                    const features = ref?.features;
                    if (!features) {
                        continue;
                    }
                    for (const [, feature] of features) {
                        if (doesIntersect2(region.start, region.end, feature.min, feature.max) &&
                            !self.seenFeatures.has(feature._id)) {
                            self.addSeenFeature(feature);
                        }
                    }
                }
            }, { name: 'LinearApolloDisplaySetSeenFeatures', delay: 1000 }));
        },
    }));
}

function renderingModelFactory$2(pluginManager, configSchema) {
    const LinearApolloDisplayLayouts = layoutsModelFactory$1(pluginManager, configSchema);
    return LinearApolloDisplayLayouts.named('LinearApolloDisplayRendering')
        .props({
        apolloRowHeight: 20,
        detailsMinHeight: 200,
        detailsHeight: 200,
        lastRowTooltipBufferHeight: 40,
        isShown: true,
        filteredTranscripts: types.array(types.string),
    })
        .volatile(() => ({
        canvas: null,
        overlayCanvas: null,
        collaboratorCanvas: null,
        theme: createTheme(),
    }))
        .views((self) => ({
        get featuresHeight() {
            return ((self.highestRow + 1) * self.apolloRowHeight +
                self.lastRowTooltipBufferHeight);
        },
    }))
        .actions((self) => ({
        toggleShown() {
            self.isShown = !self.isShown;
        },
        setDetailsHeight(newHeight) {
            self.detailsHeight = self.isShown
                ? Math.max(Math.min(newHeight, self.height - 100), Math.min(self.height, self.detailsMinHeight))
                : newHeight;
        },
        setCanvas(canvas) {
            self.canvas = canvas;
        },
        setOverlayCanvas(canvas) {
            self.overlayCanvas = canvas;
        },
        setCollaboratorCanvas(canvas) {
            self.collaboratorCanvas = canvas;
        },
        setTheme(theme) {
            self.theme = theme;
        },
    }))
        .actions((self) => ({
        afterAttach() {
            addDisposer(self, autorun(() => {
                if (!self.lgv.initialized || self.regionCannotBeRendered()) {
                    return;
                }
                const ctx = self.collaboratorCanvas?.getContext('2d');
                if (!ctx) {
                    return;
                }
                ctx.clearRect(0, 0, self.lgv.dynamicBlocks.totalWidthPx, self.featuresHeight);
                for (const collaborator of self.session.collaborators) {
                    const { locations } = collaborator;
                    if (locations.length === 0) {
                        continue;
                    }
                    let idx = 0;
                    for (const displayedRegion of self.lgv.displayedRegions) {
                        for (const location of locations) {
                            if (location.refSeq !== displayedRegion.refName) {
                                continue;
                            }
                            const { end, refSeq, start } = location;
                            const locationStartPxInfo = self.lgv.bpToPx({
                                refName: refSeq,
                                coord: start,
                                regionNumber: idx,
                            });
                            if (!locationStartPxInfo) {
                                continue;
                            }
                            const locationStartPx = locationStartPxInfo.offsetPx - self.lgv.offsetPx;
                            const locationWidthPx = (end - start) / self.lgv.bpPerPx;
                            ctx.fillStyle = 'rgba(0,255,0,.2)';
                            ctx.fillRect(locationStartPx, 1, locationWidthPx, 100);
                            ctx.fillStyle = 'black';
                            ctx.fillText(collaborator.name, locationStartPx + 1, 11, locationWidthPx - 2);
                        }
                        idx++;
                    }
                }
            }, { name: 'LinearApolloDisplayRenderCollaborators' }));
            addDisposer(self, autorun(() => {
                const { canvas, featureLayouts, featuresHeight, lgv } = self;
                if (!lgv.initialized || self.regionCannotBeRendered()) {
                    return;
                }
                const { displayedRegions, dynamicBlocks } = lgv;
                const ctx = canvas?.getContext('2d');
                if (!ctx) {
                    return;
                }
                ctx.clearRect(0, 0, dynamicBlocks.totalWidthPx, featuresHeight);
                for (const [idx, featureLayout] of featureLayouts.entries()) {
                    const displayedRegion = displayedRegions[idx];
                    for (const [row, featureLayoutRow] of featureLayout.entries()) {
                        for (const [featureRow, featureId] of featureLayoutRow) {
                            const feature = self.getAnnotationFeatureById(featureId);
                            if (featureRow > 0 || !feature) {
                                continue;
                            }
                            if (!doesIntersect2(displayedRegion.start, displayedRegion.end, feature.min, feature.max)) {
                                continue;
                            }
                            self.getGlyph(feature).draw(ctx, feature, row, self, idx);
                        }
                    }
                }
            }, { name: 'LinearApolloDisplayRenderFeatures' }));
        },
    }));
}

function mouseEventsModelIntermediateFactory$1(pluginManager, configSchema) {
    const LinearApolloDisplayRendering = renderingModelFactory$2(pluginManager, configSchema);
    return LinearApolloDisplayRendering.named('LinearApolloDisplayMouseEvents')
        .volatile(() => ({
        apolloDragging: null,
        cursor: undefined,
    }))
        .views((self) => ({
        getMousePosition(event) {
            const mousePosition = getMousePosition(event, self.lgv);
            const { bp, regionNumber, y } = mousePosition;
            const row = Math.floor(y / self.apolloRowHeight);
            const featureLayout = self.featureLayouts[regionNumber];
            const layoutRow = featureLayout.get(row);
            if (!layoutRow) {
                return mousePosition;
            }
            const foundFeature = layoutRow.find((f) => {
                const feature = self.getAnnotationFeatureById(f[1]);
                return feature && bp >= feature.min && bp <= feature.max;
            });
            if (!foundFeature) {
                return mousePosition;
            }
            const [featureRow, topLevelFeatureId] = foundFeature;
            const topLevelFeature = self.getAnnotationFeatureById(topLevelFeatureId);
            if (!topLevelFeature) {
                return mousePosition;
            }
            const glyph = self.getGlyph(topLevelFeature);
            const { featureTypeOntology } = self.session.apolloDataStore.ontologyManager;
            if (!featureTypeOntology) {
                throw new Error('featureTypeOntology is undefined');
            }
            const feature = glyph.getFeatureFromLayout(topLevelFeature, bp, featureRow, featureTypeOntology);
            if (!feature) {
                return mousePosition;
            }
            return {
                ...mousePosition,
                feature,
            };
        },
    }))
        .actions((self) => ({
        continueDrag(mousePosition, event) {
            if (!self.apolloDragging) {
                throw new Error('continueDrag() called with no current drag in progress');
            }
            event.stopPropagation();
            self.apolloDragging = { ...self.apolloDragging, current: mousePosition };
        },
        setDragging(dragInfo) {
            self.apolloDragging = dragInfo ?? null;
        },
    }))
        .actions((self) => ({
        setCursor(cursor) {
            if (self.cursor !== cursor) {
                self.cursor = cursor;
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        updateFilteredTranscripts(forms) {
            return;
        },
    }))
        .actions(() => ({
        // onClick(event: CanvasMouseEvent) {
        onClick() {
            // TODO: set the selected feature
        },
    }));
}
function mouseEventsModelFactory$1(pluginManager, configSchema) {
    const LinearApolloDisplayMouseEvents = mouseEventsModelIntermediateFactory$1(pluginManager, configSchema);
    return LinearApolloDisplayMouseEvents.views((self) => ({
        contextMenuItems(event) {
            const { hoveredFeature } = self;
            if (!hoveredFeature) {
                return [];
            }
            const mousePosition = self.getMousePosition(event);
            const { topLevelFeature } = hoveredFeature.feature;
            const glyph = self.getGlyph(topLevelFeature);
            if (isMousePositionWithFeature(mousePosition)) {
                return glyph.getContextMenuItems(self, mousePosition);
            }
            return [];
        },
    }))
        .actions((self) => ({
        // explicitly pass in a feature in case it's not the same as the one in
        // mousePosition (e.g. if features are drawn overlapping).
        startDrag(mousePosition, feature, edge, shrinkParent = false) {
            self.apolloDragging = {
                start: mousePosition,
                current: mousePosition,
                feature,
                edge,
                shrinkParent,
            };
        },
        endDrag() {
            if (!self.apolloDragging) {
                throw new Error('endDrag() called with no current drag in progress');
            }
            const { current, edge, feature, start, shrinkParent } = self.apolloDragging;
            // don't do anything if it was only dragged a tiny bit
            if (Math.abs(current.x - start.x) <= 4) {
                self.setDragging();
                self.setCursor();
                return;
            }
            const { displayedRegions } = self.lgv;
            const region = displayedRegions[start.regionNumber];
            const assembly = self.getAssemblyId(region.assemblyName);
            const changes = getPropagatedLocationChanges(feature, current.bp, edge, shrinkParent);
            const change = edge === 'max'
                ? new LocationEndChange({
                    typeName: 'LocationEndChange',
                    changedIds: changes.map((c) => c.featureId),
                    changes: changes.map((c) => ({
                        featureId: c.featureId,
                        oldEnd: c.oldLocation,
                        newEnd: c.newLocation,
                    })),
                    assembly,
                })
                : new LocationStartChange({
                    typeName: 'LocationStartChange',
                    changedIds: changes.map((c) => c.featureId),
                    changes: changes.map((c) => ({
                        featureId: c.featureId,
                        oldStart: c.oldLocation,
                        newStart: c.newLocation,
                    })),
                    assembly,
                });
            void self.changeManager.submit(change);
            self.setDragging();
            self.setCursor();
        },
    }))
        .actions((self) => ({
        onMouseDown(event) {
            const mousePosition = self.getMousePosition(event);
            if (isMousePositionWithFeature(mousePosition)) {
                const glyph = self.getGlyph(mousePosition.feature);
                glyph.onMouseDown(self, mousePosition, event);
            }
        },
        onMouseMove(event) {
            const mousePosition = self.getMousePosition(event);
            if (self.apolloDragging) {
                self.setCursor('col-resize');
                self.continueDrag(mousePosition, event);
                return;
            }
            if (isMousePositionWithFeature(mousePosition)) {
                const glyph = self.getGlyph(mousePosition.feature);
                glyph.onMouseMove(self, mousePosition, event);
            }
            else {
                self.setHoveredFeature();
                self.setCursor();
            }
        },
        onMouseLeave(event) {
            self.setDragging();
            self.setHoveredFeature();
            const mousePosition = self.getMousePosition(event);
            if (isMousePositionWithFeature(mousePosition)) {
                const glyph = self.getGlyph(mousePosition.feature);
                glyph.onMouseLeave(self, mousePosition, event);
            }
        },
        onMouseUp(event) {
            const mousePosition = self.getMousePosition(event);
            if (isMousePositionWithFeature(mousePosition)) {
                const glyph = self.getGlyph(mousePosition.feature);
                glyph.onMouseUp(self, mousePosition, event);
            }
            else {
                self.setSelectedFeature();
            }
            if (self.apolloDragging) {
                self.endDrag();
            }
        },
    }))
        .actions((self) => ({
        afterAttach() {
            addDisposer(self, autorun(() => {
                // This type is wrong in @jbrowse/core
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!self.lgv.initialized || self.regionCannotBeRendered()) {
                    return;
                }
                const ctx = self.overlayCanvas?.getContext('2d');
                if (!ctx) {
                    return;
                }
                ctx.clearRect(0, 0, self.lgv.dynamicBlocks.totalWidthPx, self.featuresHeight);
                const { apolloDragging, hoveredFeature } = self;
                if (!hoveredFeature) {
                    return;
                }
                const glyph = self.getGlyph(hoveredFeature.feature);
                // draw mouseover hovers
                glyph.drawHover(self, ctx);
                // draw tooltip on hover
                glyph.drawTooltip(self, ctx);
                // dragging previews
                if (apolloDragging) {
                    // NOTE: the glyph where the drag started is responsible for drawing the preview.
                    // it can call methods in other glyphs to help with this though.
                    const glyph = self.getGlyph(apolloDragging.feature.topLevelFeature);
                    glyph.drawDragPreview(self, ctx);
                }
            }, { name: 'LinearApolloDisplayRenderMouseoverAndDrag' }));
        },
    }));
}

function stateModelFactory$2(pluginManager, configSchema) {
    // TODO: this needs to be refactored so that the final composition of the
    // state model mixins happens here in one central place
    return mouseEventsModelFactory$1(pluginManager, configSchema)
        .props({ tabularEditor: types.optional(TabularEditorStateModelType, {}) })
        .named('LinearApolloDisplay');
}

const configSchema$1 = ConfigurationSchema('LinearApolloReferenceSequenceDisplay', {}, { explicitIdentifier: 'displayId', explicitlyTyped: true });

function getSeqRow(strand, bpPerPx, reversed) {
    if (bpPerPx > 1 || strand === undefined) {
        return;
    }
    if (reversed) {
        return strand === 1 ? 4 : 3;
    }
    return strand === 1 ? 3 : 4;
}
function getTranslationRow(frame, bpPerPx, reversed) {
    const frameRows = bpPerPx <= 1 ? [2, 1, 0, 7, 6, 5] : [2, 1, 0, 5, 4, 3];
    if (reversed) {
        frameRows.reverse();
    }
    frameRows.unshift(0);
    const row = frameRows.at(frame);
    if (row === undefined) {
        throw new Error('could not find row');
    }
    return row;
}
function getLeftPx$1(feature, bpPerPx, offsetPx, block) {
    const blockLeftPx = block.offsetPx - offsetPx;
    const featureLeftBpDistanceFromBlockLeftBp = block.reversed
        ? block.end - feature.max
        : feature.min - block.start;
    const featureLeftPxDistanceFromBlockLeftPx = featureLeftBpDistanceFromBlockLeftBp / bpPerPx;
    return blockLeftPx + featureLeftPxDistanceFromBlockLeftPx;
}
function fillAndStrokeRect(ctx, left, top, width, height, theme, selected = false) {
    ctx.fillStyle = selected
        ? theme.palette.action.disabled
        : theme.palette.action.focus;
    ctx.fillRect(left, top, width, height);
    ctx.strokeStyle = selected
        ? theme.palette.text.secondary
        : theme.palette.text.primary;
    ctx.strokeStyle = theme.palette.text.primary;
    ctx.strokeRect(left, top, width, height);
}
function drawHighlight(ctx, feature, bpPerPx, offsetPx, rowHeight, block, theme, selected = false) {
    const row = getSeqRow(feature.strand, bpPerPx, block.reversed);
    if (!row) {
        return;
    }
    const left = getLeftPx$1(feature, bpPerPx, offsetPx, block);
    const width = feature.length / bpPerPx;
    const top = row * rowHeight;
    fillAndStrokeRect(ctx, left, top, width, rowHeight, theme, selected);
}
function drawCDSHighlight(ctx, feature, bpPerPx, offsetPx, rowHeight, block, theme, selected = false) {
    const parentFeature = feature.parent;
    if (!parentFeature) {
        return;
    }
    const cdsLocs = parentFeature.cdsLocations.find((loc) => {
        const min = loc.at(feature.strand === 1 ? 0 : -1)?.min;
        const max = loc.at(feature.strand === 1 ? -1 : 0)?.max;
        return feature.min === min && feature.max === max;
    });
    if (!cdsLocs) {
        return;
    }
    for (const loc of cdsLocs) {
        const frame = getFrame(loc.min, loc.max, feature.strand ?? 1, loc.phase);
        const row = getTranslationRow(frame, bpPerPx, block.reversed);
        const left = getLeftPx$1(loc, bpPerPx, offsetPx, block);
        const top = row * rowHeight;
        const width = (loc.max - loc.min) / bpPerPx;
        fillAndStrokeRect(ctx, left, top, width, rowHeight, theme, selected);
    }
}
function drawSequenceOverlay(canvas, ctx, hoveredFeature, selectedFeature, rowHeight, theme, session, bpPerPx, offsetPx, dynamicBlocks) {
    const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    for (const block of dynamicBlocks.contentBlocks) {
        ctx.save();
        ctx.beginPath();
        const blockLeftPx = block.offsetPx - offsetPx;
        ctx.rect(blockLeftPx, 0, block.widthPx, canvas.height);
        ctx.clip();
        for (const feature of [
            selectedFeature,
            hoveredFeature?.feature,
        ].filter((f) => f !== undefined)) {
            if (featureTypeOntology.isTypeOf(feature.type, 'CDS')) {
                drawCDSHighlight(ctx, feature, bpPerPx, offsetPx, rowHeight, block, theme, feature._id === selectedFeature?._id);
            }
            else {
                drawHighlight(ctx, feature, bpPerPx, offsetPx, rowHeight, block, theme, feature._id === selectedFeature?._id);
            }
        }
        ctx.restore();
    }
}

function getLeftPx(display, feature, block) {
    const { lgv } = display;
    const { bpPerPx, offsetPx } = lgv;
    const blockLeftPx = block.offsetPx - offsetPx;
    const featureLeftBpDistanceFromBlockLeftBp = block.reversed
        ? block.end - feature.max
        : feature.min - block.start;
    const featureLeftPxDistanceFromBlockLeftPx = featureLeftBpDistanceFromBlockLeftBp / bpPerPx;
    return blockLeftPx + featureLeftPxDistanceFromBlockLeftPx;
}
/**
 * Perform a canvas strokeRect, but have the stroke be contained within the
 * given rect instead of centered on it.
 */
function strokeRectInner(ctx, left, top, width, height, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(left + 0.5, top + 0.5, width - 1, height - 1);
}

function drawLetter(seqTrackctx, left, top, width, letter) {
    const fontSize = Math.min(width, 10);
    seqTrackctx.fillStyle = '#000';
    seqTrackctx.font = `${fontSize}px`;
    const textWidth = seqTrackctx.measureText(letter).width;
    const textX = Math.round(left + (width - textWidth) / 2);
    seqTrackctx.fillText(letter, textX, top + 10);
}
function drawTranslationFrameBackgrounds(ctx, bpPerPx, theme, highContrast, left, width, sequenceRowHeight, reversed) {
    const frames = bpPerPx <= 1 ? [3, 2, 1, 0, 0, -1, -2, -3] : [3, 2, 1, -1, -2, -3];
    if (reversed) {
        frames.reverse();
    }
    for (const [idx, frame] of frames.entries()) {
        const frameColor = theme.palette.framesCDS.at(frame)?.main;
        if (!frameColor) {
            continue;
        }
        const top = idx * sequenceRowHeight;
        ctx.fillStyle = highContrast ? theme.palette.background.default : frameColor;
        ctx.fillRect(left, top, width, sequenceRowHeight);
        if (highContrast) {
            // eslint-disable-next-line prefer-destructuring
            const strokeStyle = theme.palette.grey[200];
            strokeRectInner(ctx, left, top, width, sequenceRowHeight, strokeStyle);
        }
    }
}
function drawBase(ctx, base, index, leftPx, bpPerPx, rowHeight, theme) {
    if (1 / bpPerPx < 1) {
        return;
    }
    const left = Math.round(leftPx + index / bpPerPx);
    const nextLeft = Math.round(leftPx + (index + 1) / bpPerPx);
    const width = nextLeft - left;
    const strands = [-1, 1];
    for (const strand of strands) {
        const top = (strand === 1 ? 3 : 4) * rowHeight;
        const baseCode = strand === 1 ? base : revcom(base);
        ctx.fillStyle = colorCode(baseCode, theme);
        ctx.fillRect(left, top, width, rowHeight);
        if (1 / bpPerPx >= 12) {
            const strokeStyle = theme.palette.text.disabled;
            strokeRectInner(ctx, left, top, width, rowHeight, strokeStyle);
            drawLetter(ctx, left, top, width, baseCode);
        }
    }
}
function drawCodon$1(ctx, codon, leftPx, index, theme, highContrast, bpPerPx, bp, rowHeight, showStartCodons, showStopCodons) {
    const frameOffsets = (bpPerPx <= 1 ? [0, 2, 1, 0, 7, 6, 5] : [0, 2, 1, 0, 5, 4, 3]).map((b) => b * rowHeight);
    const strands = [-1, 1];
    for (const strand of strands) {
        const frame = getFrame(bp, bp + 3, strand, 0);
        const top = frameOffsets.at(frame);
        if (top === undefined) {
            continue;
        }
        const left = Math.round(leftPx + index / bpPerPx);
        const nextLeft = Math.round(leftPx + (index + 3) / bpPerPx);
        const width = nextLeft - left;
        const codonCode = strand === 1 ? codon : revcom(codon);
        const aminoAcidCode = defaultCodonTable[codonCode];
        const fillColor = codonColorCode(aminoAcidCode, theme, highContrast);
        if (fillColor &&
            ((showStopCodons && aminoAcidCode == '*') ||
                (showStartCodons && aminoAcidCode != '*'))) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(left, top, width, rowHeight);
        }
        if (1 / bpPerPx >= 4) {
            const strokeStyle = theme.palette.text.disabled;
            strokeRectInner(ctx, left, top, width, rowHeight, strokeStyle);
            drawLetter(ctx, left, top, width, aminoAcidCode);
        }
    }
}
function drawSequenceTrack(canvas, theme, bpPerPx, offsetPx, dynamicBlocks, highContrast, showStartCodons, showStopCodons, sequenceRowHeight, session) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { apolloDataStore } = session;
    for (const block of dynamicBlocks.contentBlocks) {
        const totalOffsetPx = block.offsetPx - offsetPx;
        drawTranslationFrameBackgrounds(ctx, bpPerPx, theme, highContrast, totalOffsetPx, block.widthPx, sequenceRowHeight, block.reversed);
        const assembly = apolloDataStore.assemblies.get(block.assemblyName);
        const ref = assembly?.getByRefName(block.refName);
        const roundedStart = Math.floor(block.start);
        const roundedEnd = Math.ceil(block.end);
        let seq = ref?.getSequence(roundedStart, roundedEnd);
        if (!seq) {
            return;
        }
        seq = seq.toUpperCase();
        if (block.reversed) {
            seq = revcom(seq);
        }
        const baseOffsetPx = (block.reversed ? roundedEnd - block.end : block.start - roundedStart) /
            bpPerPx;
        const seqLeftPx = totalOffsetPx - baseOffsetPx;
        for (let i = 0; i < seq.length; i++) {
            const bp = block.reversed ? roundedEnd - i : roundedStart + i;
            const codon = seq.slice(i, i + 3);
            drawBase(ctx, seq[i], i, seqLeftPx, bpPerPx, sequenceRowHeight, theme);
            if (codon.length !== 3) {
                continue;
            }
            drawCodon$1(ctx, codon, seqLeftPx, i, theme, highContrast, bpPerPx, bp, sequenceRowHeight, showStartCodons, showStopCodons);
        }
    }
}

const minDisplayHeight$1 = 20;
function baseModelFactory$1(_pluginManager, configSchema) {
    return BaseDisplay.named('BaseLinearApolloReferenceSequenceDisplay')
        .props({
        type: types.literal('LinearApolloReferenceSequenceDisplay'),
        configuration: ConfigurationReference(configSchema),
        showStartCodons: false,
        showStopCodons: true,
        highContrast: false,
        heightPreConfig: types.maybe(types.refinement('displayHeight', types.number, (n) => n >= minDisplayHeight$1)),
        sequenceRowHeight: 15,
    })
        .views((self) => {
        const { configuration, renderProps: superRenderProps } = self;
        return {
            renderProps() {
                return {
                    ...superRenderProps(),
                    ...getParentRenderProps(self),
                    config: configuration.renderer,
                };
            },
        };
    })
        .views((self) => ({
        get lgv() {
            return getContainingView(self);
        },
    }))
        .views((self) => ({
        get rendererTypeName() {
            return self.configuration.renderer.type;
        },
        get session() {
            return getSession(self);
        },
        get regions() {
            const regions = self.lgv.dynamicBlocks.contentBlocks.map(({ assemblyName, end, refName, start }) => ({
                assemblyName,
                refName,
                start: Math.round(start),
                end: Math.round(end),
            }));
            return regions;
        },
        regionCannotBeRendered( /* region */) {
            if (self.lgv && self.lgv.bpPerPx >= 3) {
                return 'Zoom in to see sequence';
            }
            return;
        },
    }))
        .views((self) => ({
        get apolloInternetAccount() {
            const [region] = self.regions;
            const { internetAccounts } = getRoot(self);
            const { assemblyName } = region;
            const { assemblyManager } = self.session;
            const assembly = assemblyManager.get(assemblyName);
            if (!assembly) {
                throw new Error(`No assembly found with name ${assemblyName}`);
            }
            const { internetAccountConfigId } = getConf(assembly, [
                'sequence',
                'metadata',
            ]);
            return internetAccounts.find((ia) => getConf(ia, 'internetAccountId') === internetAccountConfigId);
        },
        get changeManager() {
            return self.session.apolloDataStore
                .changeManager;
        },
        getAssemblyId(assemblyName) {
            const { assemblyManager } = self.session;
            const assembly = assemblyManager.get(assemblyName);
            if (!assembly) {
                throw new Error(`Could not find assembly named ${assemblyName}`);
            }
            return assembly.name;
        },
        get selectedFeature() {
            return self.session
                .apolloSelectedFeature;
        },
        get hoveredFeature() {
            return self.session
                .apolloHoveredFeature;
        },
        get height() {
            const { sequenceRowHeight } = self;
            return self.lgv.bpPerPx <= 1
                ? sequenceRowHeight * 8
                : sequenceRowHeight * 6;
        },
    }))
        .volatile(() => ({
        scrollTop: 0,
    }))
        .actions((self) => ({
        setScrollTop(scrollTop) {
            self.scrollTop = scrollTop;
        },
        setHeight(displayHeight) {
            self.heightPreConfig = Math.max(displayHeight, minDisplayHeight$1);
            return self.height;
        },
        resizeHeight(distance) {
            const oldHeight = self.height;
            const newHeight = this.setHeight(self.height + distance);
            return newHeight - oldHeight;
        },
        toggleShowStartCodons() {
            self.showStartCodons = !self.showStartCodons;
        },
        toggleShowStopCodons() {
            self.showStopCodons = !self.showStopCodons;
        },
        toggleHighContrast() {
            self.highContrast = !self.highContrast;
        },
    }))
        .views((self) => {
        const { trackMenuItems: superTrackMenuItems } = self;
        return {
            trackMenuItems() {
                const { showStartCodons, showStopCodons, highContrast } = self;
                return [
                    ...superTrackMenuItems(),
                    {
                        type: 'subMenu',
                        label: 'Appearance',
                        subMenu: [
                            {
                                label: 'Show start codons',
                                type: 'checkbox',
                                checked: showStartCodons,
                                onClick: () => {
                                    self.toggleShowStartCodons();
                                },
                            },
                            {
                                label: 'Show stop codons',
                                type: 'checkbox',
                                checked: showStopCodons,
                                onClick: () => {
                                    self.toggleShowStopCodons();
                                },
                            },
                            {
                                label: 'Use high contrast colors',
                                type: 'checkbox',
                                checked: highContrast,
                                onClick: () => {
                                    self.toggleHighContrast();
                                },
                            },
                        ],
                    },
                ];
            },
        };
    })
        .actions((self) => ({
        afterAttach() {
            addDisposer(self, autorun(() => {
                if (!self.lgv.initialized || self.regionCannotBeRendered()) {
                    return;
                }
                if (self.lgv.bpPerPx <= 3) {
                    void self.session.apolloDataStore.loadRefSeq(self.regions);
                }
            }, {
                name: 'LinearApolloReferenceSequenceDisplayLoadFeatures',
                delay: 1000,
            }));
        },
    }));
}

function renderingModelFactory$1(pluginManager, configSchema) {
    const BaseLinearApolloReferenceSequenceDisplay = baseModelFactory$1(pluginManager, configSchema);
    return BaseLinearApolloReferenceSequenceDisplay.named('LinearApolloReferenceSequenceDisplayRendering')
        .volatile(() => ({
        seqTrackCanvas: null,
        seqTrackOverlayCanvas: null,
        theme: createTheme(),
    }))
        .actions((self) => ({
        setSeqTrackCanvas(canvas) {
            self.seqTrackCanvas = canvas;
        },
        setSeqTrackOverlayCanvas(canvas) {
            self.seqTrackOverlayCanvas = canvas;
        },
        setTheme(theme) {
            self.theme = theme;
        },
        afterAttach() {
            addDisposer(self, autorun(() => {
                const { lgv, seqTrackCanvas, theme, highContrast, showStartCodons, showStopCodons, sequenceRowHeight, session, } = self;
                if (!lgv.initialized ||
                    self.regionCannotBeRendered() ||
                    !seqTrackCanvas) {
                    return;
                }
                const trnslWidthPx = 3 / lgv.bpPerPx;
                if (trnslWidthPx < 1) {
                    return;
                }
                const { bpPerPx, offsetPx, dynamicBlocks } = lgv;
                // we have to be really explicit about passing in individual
                // variables here and not just e.g. "lgv" so that the autorun
                // tracks the variables correctly
                drawSequenceTrack(seqTrackCanvas, theme, bpPerPx, offsetPx, dynamicBlocks, highContrast, showStartCodons, showStopCodons, sequenceRowHeight, session);
            }, { name: 'LinearApolloReferenceSequenceDisplayRenderSequence' }));
            addDisposer(self, autorun(() => {
                const { seqTrackOverlayCanvas } = self;
                if (!self.lgv.initialized ||
                    self.regionCannotBeRendered() ||
                    !seqTrackOverlayCanvas) {
                    return;
                }
                const seqTrackOverlayctx = seqTrackOverlayCanvas.getContext('2d');
                if (!seqTrackOverlayctx) {
                    return;
                }
                seqTrackOverlayctx.clearRect(0, 0, self.lgv.dynamicBlocks.totalWidthPx, self.height);
                const { hoveredFeature, selectedFeature, lgv, sequenceRowHeight, session, theme, } = self;
                if (!(hoveredFeature || selectedFeature)) {
                    return;
                }
                const { bpPerPx, dynamicBlocks, offsetPx } = lgv;
                // we have to be really explicit about passing in individual
                // variables here and not just e.g. "lgv" so that the autorun
                // tracks the variables correctly
                drawSequenceOverlay(seqTrackOverlayCanvas, seqTrackOverlayctx, hoveredFeature, selectedFeature, sequenceRowHeight, theme, session, bpPerPx, offsetPx, dynamicBlocks);
            }, {
                name: 'LinearApolloReferenceSequenceDisplayRenderSequenceHighlight',
            }));
        },
    }));
}

function stateModelFactory$1(pluginManager, configSchema) {
    // TODO: this needs to be refactored so that the final composition of the
    // state model mixins happens here in one central place
    return renderingModelFactory$1(pluginManager, configSchema).named('LinearApolloReferenceSequenceDisplay');
}

const LinearApolloReferenceSequenceDisplay = observer(function LinearApolloReferenceSequenceDisplay(props) {
    const theme = useTheme();
    const { model } = props;
    const { height, regionCannotBeRendered, setSeqTrackCanvas, setSeqTrackOverlayCanvas, setTheme, } = model;
    const { classes } = useStyles$1();
    useEffect(() => {
        setTheme(theme);
    }, [theme, setTheme]);
    const lgv = getContainingView(model);
    const message = regionCannotBeRendered();
    // This type is wrong in @jbrowse/core
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (message) {
        return (jsx(Alert, { severity: "warning", classes: { message: classes.ellipses }, slotProps: { root: { className: classes.center } }, children: jsx(Tooltip, { title: message, children: jsx("div", { children: message }) }) }));
    }
    return (jsx(Fragment, { children: 3 / lgv.bpPerPx >= 1 ? (jsxs("div", { className: classes.canvasContainer, style: {
                width: lgv.dynamicBlocks.totalWidthPx,
                height,
            }, children: [jsx("canvas", { ref: async (node) => {
                        await Promise.resolve();
                        setSeqTrackCanvas(node);
                    }, width: lgv.dynamicBlocks.totalWidthPx, height: height, className: classes.canvas, "data-testid": "seqTrackCanvas" }), jsx("canvas", { ref: async (node) => {
                        await Promise.resolve();
                        setSeqTrackOverlayCanvas(node);
                    }, width: lgv.dynamicBlocks.totalWidthPx, height: height, className: classes.canvas, "data-testid": "seqTrackOverlayCanvas" })] })) : null }));
});

const configSchema = ConfigurationSchema('LinearApolloSixFrameDisplay', {}, { explicitIdentifier: 'displayId', explicitlyTyped: true });

const FilterTranscripts = observer(function FilterTranscripts({ sourceFeature, filteredTranscripts, handleClose, onUpdate, }) {
    const allTranscripts = [];
    if (sourceFeature.children) {
        for (const [, child] of sourceFeature.children) {
            const childID = child.attributes
                .get('gff_id')
                ?.toString();
            if (childID) {
                allTranscripts.push(childID);
            }
        }
    }
    const [excludedTranscripts, setExcludedTranscripts] = useState(filteredTranscripts);
    const handleChange = (value) => {
        const newForms = excludedTranscripts.includes(value)
            ? excludedTranscripts.filter((form) => form !== value)
            : [...excludedTranscripts, value];
        onUpdate(newForms);
        setExcludedTranscripts(newForms);
    };
    return (jsx(Dialog, { open: true, maxWidth: false, "data-testid": "filter-transcripts-dialog", title: "Filter transcripts by ID", handleClose: handleClose, children: jsxs(DialogContent, { children: [jsx(DialogContentText, { children: "Select the alternate transcripts you want to display in the apollo track" }), jsx(Grid, { container: true, spacing: 2, children: jsx(Grid, { size: 8, children: jsx(FormGroup, { children: allTranscripts.map((item) => (
                            // eslint-disable-next-line react/jsx-key
                            jsx(FormControlLabel, { control: jsx(Checkbox, { checked: !excludedTranscripts.includes(item), onChange: () => {
                                        handleChange(item);
                                    }, slotProps: { input: { 'aria-label': 'controlled' } } }), label: item }))) }) }) })] }) }));
});

let forwardFillLight = null;
let backwardFillLight = null;
let forwardFillDark = null;
let backwardFillDark = null;
const canvas = globalThis.document.createElement('canvas');
// @ts-expect-error getContext is undefined in the web worker
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (canvas?.getContext) {
    for (const direction of ['forward', 'backward']) {
        for (const themeMode of ['light', 'dark']) {
            const canvas = document.createElement('canvas');
            const canvasSize = 10;
            canvas.width = canvas.height = canvasSize;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const stripeColor1 = themeMode === 'light' ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.75)';
                const stripeColor2 = themeMode === 'light' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.50)';
                const gradient = direction === 'forward'
                    ? ctx.createLinearGradient(0, canvasSize, canvasSize, 0)
                    : ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
                gradient.addColorStop(0, stripeColor1);
                gradient.addColorStop(0.25, stripeColor1);
                gradient.addColorStop(0.25, stripeColor2);
                gradient.addColorStop(0.5, stripeColor2);
                gradient.addColorStop(0.5, stripeColor1);
                gradient.addColorStop(0.75, stripeColor1);
                gradient.addColorStop(0.75, stripeColor2);
                gradient.addColorStop(1, stripeColor2);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 10, 10);
                if (direction === 'forward') {
                    if (themeMode === 'light') {
                        forwardFillLight = ctx.createPattern(canvas, 'repeat');
                    }
                    else {
                        forwardFillDark = ctx.createPattern(canvas, 'repeat');
                    }
                }
                else {
                    if (themeMode === 'light') {
                        backwardFillLight = ctx.createPattern(canvas, 'repeat');
                    }
                    else {
                        backwardFillDark = ctx.createPattern(canvas, 'repeat');
                    }
                }
            }
        }
    }
}
function deepSetHas(set, item) {
    for (const elem of set) {
        if (equal(elem, item)) {
            return true;
        }
    }
    return false;
}
function drawTextLabels(ctx, labelArray, font = '10px sans-serif') {
    for (let i = labelArray.length - 1; i >= 0; --i) {
        const label = labelArray[i];
        ctx.fillStyle = label.color;
        const labelRowX = label.x + 1;
        const labelRowY = label.y + label.h;
        const textWidth = measureText(label.text, 10);
        if (label.isSelected) {
            ctx.font = 'bold '.concat(font);
        }
        if (label.text) {
            ctx.clearRect(labelRowX - 5, labelRowY, textWidth + 10, label.h);
            ctx.fillText(label.text, labelRowX, labelRowY + 11, textWidth);
            ctx.font = font;
        }
    }
}
function draw(ctx, topLevelFeature, _row, stateModel, displayedRegionIndex) {
    const { apolloRowHeight, lgv, session, theme, highestRow, filteredTranscripts, selectedFeature, showFeatureLabels, } = stateModel;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const displayedRegion = displayedRegions[displayedRegionIndex];
    const { refName, reversed } = displayedRegion;
    const rowHeight = apolloRowHeight;
    const exonHeight = rowHeight;
    const cdsHeight = rowHeight;
    const topLevelFeatureHeight = rowHeight;
    const featureLabelSpacer = showFeatureLabels ? 2 : 1;
    const textColor = theme.palette.text.primary;
    const { attributes, children, min, strand } = topLevelFeature;
    if (!children) {
        return;
    }
    const { apolloDataStore } = session;
    const { featureTypeOntology } = apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    const labelArray = [];
    // Draw background for gene
    const topLevelFeatureMinX = (lgv.bpToPx({
        refName,
        coord: min,
        regionNumber: displayedRegionIndex,
    })?.offsetPx ?? 0) - offsetPx;
    const topLevelFeatureWidthPx = topLevelFeature.length / bpPerPx;
    const topLevelFeatureStartPx = reversed
        ? topLevelFeatureMinX - topLevelFeatureWidthPx
        : topLevelFeatureMinX;
    const topLevelRow = (strand == 1 ? 3 : 4) * featureLabelSpacer;
    const topLevelFeatureTop = topLevelRow * rowHeight;
    ctx.fillStyle = theme.palette.text.primary;
    ctx.fillRect(topLevelFeatureStartPx, topLevelFeatureTop, topLevelFeatureWidthPx, topLevelFeatureHeight);
    ctx.fillStyle = isSelectedFeature(topLevelFeature, selectedFeature)
        ? alpha('rgb(0,0,0)', 0.7)
        : alpha(theme.palette.background.paper, 0.7);
    ctx.fillRect(topLevelFeatureStartPx + 1, topLevelFeatureTop + 1, topLevelFeatureWidthPx - 2, topLevelFeatureHeight - 2);
    const isSelected = isSelectedFeature(topLevelFeature, selectedFeature);
    const label = {
        x: topLevelFeatureStartPx,
        y: topLevelFeatureTop,
        h: topLevelFeatureHeight,
        text: attributes.get('gff_id')?.toString(),
        color: textColor,
        isSelected,
    };
    if (isSelected) {
        labelArray.unshift(label);
    }
    else {
        labelArray.push(label);
    }
    const forwardFill = theme.palette.mode === 'dark' ? forwardFillDark : forwardFillLight;
    const backwardFill = theme.palette.mode === 'dark' ? backwardFillDark : backwardFillLight;
    const reversal = reversed ? -1 : 1;
    let topFill = null, bottomFill = null;
    if (strand) {
        [topFill, bottomFill] =
            strand * reversal === 1
                ? [forwardFill, backwardFill]
                : [backwardFill, forwardFill];
    }
    if (topFill && bottomFill) {
        ctx.fillStyle = topFill;
        ctx.fillRect(topLevelFeatureStartPx + 1, topLevelFeatureTop + 1, topLevelFeatureWidthPx - 2, (topLevelFeatureHeight - 2) / 2);
        ctx.fillStyle = bottomFill;
        ctx.fillRect(topLevelFeatureStartPx + 1, topLevelFeatureTop + (topLevelFeatureHeight - 2) / 2, topLevelFeatureWidthPx - 2, (topLevelFeatureHeight - 2) / 2);
    }
    const renderedCDS = new Set();
    // Draw exon and CDS for each mRNA
    for (const [, child] of children) {
        if (!(featureTypeOntology.isTypeOf(child.type, 'transcript') ||
            featureTypeOntology.isTypeOf(child.type, 'pseudogenic_transcript'))) {
            continue;
        }
        const { children: childrenOfmRNA, cdsLocations } = child;
        if (!childrenOfmRNA) {
            continue;
        }
        const childID = child.attributes
            .get('gff_id')
            ?.toString();
        if (childID && filteredTranscripts.includes(childID)) {
            continue;
        }
        for (const [, exon] of childrenOfmRNA) {
            if (!featureTypeOntology.isTypeOf(exon.type, 'exon')) {
                continue;
            }
            const minX = (lgv.bpToPx({
                refName,
                coord: exon.min,
                regionNumber: displayedRegionIndex,
            })?.offsetPx ?? 0) - offsetPx;
            const widthPx = exon.length / bpPerPx;
            const startPx = reversed ? minX - widthPx : minX;
            const exonTop = topLevelFeatureTop + (topLevelFeatureHeight - exonHeight) / 2;
            const isSelected = isSelectedFeature(exon, selectedFeature);
            ctx.fillStyle = theme.palette.text.primary;
            ctx.fillRect(startPx, exonTop, widthPx, exonHeight);
            if (widthPx > 2) {
                ctx.clearRect(startPx + 1, exonTop + 1, widthPx - 2, exonHeight - 2);
                ctx.fillStyle = isSelected ? 'rgb(0,0,0)' : alpha('#f5f500', 0.6);
                ctx.fillRect(startPx + 1, exonTop + 1, widthPx - 2, exonHeight - 2);
                if (topFill && bottomFill) {
                    ctx.fillStyle = topFill;
                    ctx.fillRect(startPx + 1, exonTop + 1, widthPx - 2, (exonHeight - 2) / 2);
                    ctx.fillStyle = bottomFill;
                    ctx.fillRect(startPx + 1, exonTop + 1 + (exonHeight - 2) / 2, widthPx - 2, (exonHeight - 2) / 2);
                }
                const label = {
                    x: startPx,
                    y: exonTop,
                    h: exonHeight,
                    text: exon.attributes.get('gff_id')?.toString(),
                    color: textColor,
                    isSelected,
                };
                if (isSelected) {
                    labelArray.unshift(label);
                }
                else {
                    labelArray.push(label);
                }
            }
        }
        const isSelected = isSelectedFeature(child, selectedFeature?.parent);
        let cdsStartPx = 0;
        let cdsTop = 0;
        for (const cdsRow of cdsLocations) {
            let prevCDSTop = 0;
            let prevCDSEndPx = 0;
            let counter = 1;
            for (const cds of cdsRow.sort((a, b) => a.max - b.max)) {
                if ((selectedFeature &&
                    isSelected &&
                    featureTypeOntology.isTypeOf(selectedFeature.type, 'CDS')) ||
                    !deepSetHas(renderedCDS, cds)) {
                    const cdsWidthPx = (cds.max - cds.min) / bpPerPx;
                    const minX = (lgv.bpToPx({
                        refName,
                        coord: cds.min,
                        regionNumber: displayedRegionIndex,
                    })?.offsetPx ?? 0) - offsetPx;
                    cdsStartPx = reversed ? minX - cdsWidthPx : minX;
                    ctx.fillStyle = theme.palette.text.primary;
                    const frame = getFrame(cds.min, cds.max, child.strand ?? 1, cds.phase);
                    const frameOffsets = showFeatureLabels
                        ? [0, 4, 2, 0, 14, 12, 10]
                        : [0, 2, 1, 0, 7, 6, 5];
                    const row = frameOffsets.at(frame);
                    if (row === undefined) {
                        continue;
                    }
                    cdsTop = row * rowHeight;
                    ctx.fillRect(cdsStartPx, cdsTop, cdsWidthPx, cdsHeight);
                    // Draw lines to connect CDS features with shared mRNA parent
                    if (counter > 1) {
                        // Mid-point for intron line "hat"
                        const midPoint = [
                            (cdsStartPx - prevCDSEndPx) / 2 + prevCDSEndPx,
                            Math.max(frame < 0 ? rowHeight * featureLabelSpacer * highestRow + 1 : 1, // Avoid render ceiling
                            Math.min(prevCDSTop, cdsTop) - rowHeight / 2),
                        ];
                        ctx.strokeStyle = 'rgb(0, 128, 128)';
                        ctx.beginPath();
                        ctx.moveTo(prevCDSEndPx, prevCDSTop);
                        ctx.lineTo(...midPoint);
                        ctx.stroke();
                        ctx.moveTo(...midPoint);
                        ctx.lineTo(cdsStartPx, cdsTop + rowHeight / 2);
                        ctx.stroke();
                    }
                    prevCDSEndPx = cdsStartPx + cdsWidthPx;
                    prevCDSTop = cdsTop + rowHeight / 2;
                    counter += 1;
                    if (cdsWidthPx > 2) {
                        ctx.clearRect(cdsStartPx + 1, cdsTop + 1, cdsWidthPx - 2, cdsHeight - 2);
                        const frameColor = theme.palette.framesCDS.at(frame)?.main;
                        const cdsColorCode = frameColor ?? 'rgb(171,71,188)';
                        ctx.fillStyle = cdsColorCode;
                        ctx.fillStyle =
                            selectedFeature &&
                                isSelected &&
                                featureTypeOntology.isTypeOf(selectedFeature.type, 'CDS')
                                ? 'rgb(0,0,0)'
                                : cdsColorCode;
                        ctx.fillRect(cdsStartPx + 1, cdsTop + 1, cdsWidthPx - 2, cdsHeight - 2);
                        if (topFill && bottomFill) {
                            ctx.fillStyle = topFill;
                            ctx.fillRect(cdsStartPx + 1, cdsTop + 1, cdsWidthPx - 2, (cdsHeight - 2) / 2);
                            ctx.fillStyle = bottomFill;
                            ctx.fillRect(cdsStartPx + 1, cdsTop + (cdsHeight - 2) / 2, cdsWidthPx - 2, (cdsHeight - 2) / 2);
                        }
                    }
                    renderedCDS.add(cds);
                }
            }
        }
        const label = {
            x: cdsStartPx,
            y: cdsTop,
            h: cdsHeight,
            text: child.attributes.get('gff_id')?.toString(),
            color: textColor,
            isSelected,
        };
        if (isSelected) {
            labelArray.unshift(label);
        }
        else {
            labelArray.push(label);
        }
    }
    if (showFeatureLabels) {
        drawTextLabels(ctx, labelArray);
    }
}
function drawDragPreview(stateModel, overlayCtx) {
    const { apolloDragging, apolloRowHeight, lgv, theme } = stateModel;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    if (!apolloDragging) {
        return;
    }
    const { current, edge, feature, start } = apolloDragging;
    const row = Math.floor(start.y / apolloRowHeight);
    const region = displayedRegions[start.regionNumber];
    const rowCount = 1;
    const featureEdgeBp = region.reversed
        ? region.end - feature[edge]
        : feature[edge] - region.start;
    const featureEdgePx = featureEdgeBp / bpPerPx - offsetPx;
    const rectX = Math.min(current.x, featureEdgePx);
    const rectY = row * apolloRowHeight;
    const rectWidth = Math.abs(current.x - featureEdgePx);
    const rectHeight = apolloRowHeight * rowCount;
    overlayCtx.strokeStyle = theme.palette.info.main;
    overlayCtx.setLineDash([6]);
    overlayCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);
    overlayCtx.fillStyle = alpha(theme.palette.info.main, 0.2);
    overlayCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
}
function drawHover(stateModel, ctx) {
    const { hoveredFeature, apolloRowHeight, filteredTranscripts, lgv, highestRow, session, showFeatureLabels, } = stateModel;
    if (!hoveredFeature) {
        return;
    }
    const { feature } = hoveredFeature;
    const { apolloDataStore } = session;
    const { featureTypeOntology } = apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    if (!featureTypeOntology.isTypeOf(feature.type, 'transcript')) {
        return;
    }
    const featureID = feature.attributes
        .get('gff_id')
        ?.toString();
    if (featureID && filteredTranscripts.includes(featureID)) {
        return;
    }
    const position = stateModel.getFeatureLayoutPosition(feature);
    if (!position) {
        return;
    }
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const { layoutIndex } = position;
    const displayedRegion = displayedRegions[layoutIndex];
    const { refName, reversed } = displayedRegion;
    const rowHeight = apolloRowHeight;
    const cdsHeight = rowHeight;
    const featureLabelSpacer = showFeatureLabels ? 2 : 1;
    const { cdsLocations, strand } = feature;
    for (const cdsRow of cdsLocations) {
        let prevCDSTop = 0;
        let prevCDSEndPx = 0;
        let counter = 1;
        for (const cds of cdsRow.sort((a, b) => a.max - b.max)) {
            const cdsWidthPx = (cds.max - cds.min) / bpPerPx;
            const minX = (lgv.bpToPx({
                refName,
                coord: cds.min,
                regionNumber: layoutIndex,
            })?.offsetPx ?? 0) - offsetPx;
            const cdsStartPx = reversed ? minX - cdsWidthPx : minX;
            const frame = getFrame(cds.min, cds.max, strand ?? 1, cds.phase);
            const frameOffsets = showFeatureLabels
                ? [0, 4, 2, 0, 14, 12, 10]
                : [0, 2, 1, 0, 7, 6, 5];
            const row = frameOffsets.at(frame);
            if (row === undefined) {
                continue;
            }
            const cdsTop = row * rowHeight;
            if (counter > 1) {
                // Mid-point for intron line "hat"
                const midPoint = [
                    (cdsStartPx - prevCDSEndPx) / 2 + prevCDSEndPx,
                    Math.max(frame < 0 ? rowHeight * featureLabelSpacer * highestRow + 1 : 1, // Avoid render ceiling
                    Math.min(prevCDSTop, cdsTop) - rowHeight / 2),
                ];
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(prevCDSEndPx, prevCDSTop);
                ctx.lineTo(...midPoint);
                ctx.stroke();
                ctx.moveTo(...midPoint);
                ctx.lineTo(cdsStartPx, cdsTop + rowHeight / 2);
                ctx.stroke();
            }
            prevCDSEndPx = cdsStartPx + cdsWidthPx;
            prevCDSTop = cdsTop + rowHeight / 2;
            counter += 1;
            if (cdsWidthPx > 2) {
                ctx.fillStyle = 'rgba(255,0,0,0.6)';
                ctx.fillRect(cdsStartPx, cdsTop, cdsWidthPx, cdsHeight);
            }
        }
    }
}
function onMouseDown(stateModel, currentMousePosition, event) {
    const { feature } = currentMousePosition;
    // swallow the mouseDown if we are on the edge of the feature so that we
    // don't start dragging the view if we try to drag the feature edge
    const draggableFeature = getDraggableFeatureInfo(currentMousePosition, feature, stateModel);
    if (draggableFeature) {
        event.stopPropagation();
        stateModel.startDrag(currentMousePosition, draggableFeature.feature, draggableFeature.edge, true);
    }
}
function onMouseMove(stateModel, mousePosition) {
    if (isMousePositionWithFeature(mousePosition)) {
        const { feature, bp } = mousePosition;
        stateModel.setHoveredFeature({ feature, bp });
        const draggableFeature = getDraggableFeatureInfo(mousePosition, feature, stateModel);
        if (draggableFeature) {
            stateModel.setCursor('col-resize');
            return;
        }
    }
    stateModel.setCursor();
}
function onMouseUp(stateModel, mousePosition) {
    if (stateModel.apolloDragging) {
        return;
    }
    if (isMousePositionWithFeature(mousePosition)) {
        const { feature } = mousePosition;
        const { session } = stateModel;
        const { apolloDataStore } = session;
        const { featureTypeOntology } = apolloDataStore.ontologyManager;
        stateModel.setSelectedFeature(feature);
        if (!featureTypeOntology) {
            throw new Error('featureTypeOntology is undefined');
        }
        let containsCDSOrExon = false;
        for (const [, child] of feature.children ?? []) {
            if (featureTypeOntology.isTypeOf(child.type, 'CDS') ||
                featureTypeOntology.isTypeOf(child.type, 'exon')) {
                containsCDSOrExon = true;
                break;
            }
        }
        if ((featureTypeOntology.isTypeOf(feature.type, 'transcript') ||
            featureTypeOntology.isTypeOf(feature.type, 'pseudogenic_transcript')) &&
            containsCDSOrExon) {
            stateModel.showFeatureDetailsWidget(feature, [
                'ApolloTranscriptDetails',
                'apolloTranscriptDetails',
            ]);
        }
        else {
            stateModel.showFeatureDetailsWidget(feature);
        }
    }
}
function getDraggableFeatureInfo(mousePosition, feature, stateModel) {
    const { filteredTranscripts, session } = stateModel;
    const { apolloDataStore } = session;
    const { featureTypeOntology } = apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    const isTranscript = featureTypeOntology.isTypeOf(feature.type, 'transcript');
    const featureID = feature.attributes
        .get('gff_id')
        ?.toString();
    if (featureID && filteredTranscripts.includes(featureID)) {
        return;
    }
    const { bp, refName, regionNumber, x } = mousePosition;
    const { lgv } = stateModel;
    if (isTranscript) {
        const transcript = feature;
        if (!transcript.children) {
            return;
        }
        const exonChildren = [];
        const cdsChildren = [];
        for (const child of transcript.children.values()) {
            const childIsExon = featureTypeOntology.isTypeOf(child.type, 'exon');
            const childIsCDS = featureTypeOntology.isTypeOf(child.type, 'CDS');
            if (childIsExon) {
                exonChildren.push(child);
            }
            else if (childIsCDS) {
                cdsChildren.push(child);
            }
        }
        const overlappingExon = exonChildren.find((child) => {
            const [start, end] = intersection2(bp, bp + 1, child.min, child.max);
            return start !== undefined && end !== undefined;
        });
        if (overlappingExon) {
            // We are on an exon, are we on the edge of it?
            const minMax = getMinAndMaxPx(overlappingExon, refName, regionNumber, lgv);
            if (minMax) {
                const overlappingEdge = getOverlappingEdge(overlappingExon, x, minMax);
                if (overlappingEdge) {
                    return overlappingEdge;
                }
            }
        }
        // End of special cases, let's see if we're on the edge of this CDS or exon
        for (const loc of transcript.cdsLocations) {
            for (const cds of loc) {
                const minMax = getMinAndMaxPx(cds, refName, regionNumber, lgv);
                if (minMax) {
                    const overlappingCDS = cdsChildren.find((child) => {
                        const [start, end] = intersection2(bp, bp + 1, child.min, child.max);
                        return start !== undefined && end !== undefined;
                    });
                    if (overlappingCDS) {
                        const overlappingEdge = getOverlappingEdge(overlappingCDS, x, minMax);
                        if (overlappingEdge) {
                            return overlappingEdge;
                        }
                    }
                }
            }
        }
    }
    return;
}
function drawTooltip(display, context) {
    const { hoveredFeature, apolloRowHeight, filteredTranscripts, lgv, session, showFeatureLabels, theme, } = display;
    if (!hoveredFeature) {
        return;
    }
    const { feature, bp } = hoveredFeature;
    const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    const isTranscript = featureTypeOntology.isTypeOf(feature.type, 'transcript');
    if (!isTranscript) {
        return;
    }
    const { attributes, strand, type } = feature;
    const position = display.getFeatureLayoutPosition(feature);
    if (!position) {
        return;
    }
    const featureID = attributes.get('gff_id')?.toString();
    if (featureID && filteredTranscripts.includes(featureID)) {
        return;
    }
    const { layoutIndex } = position;
    const { bpPerPx, displayedRegions, offsetPx } = lgv;
    const displayedRegion = displayedRegions[layoutIndex];
    const { refName, reversed } = displayedRegion;
    const rowHeight = apolloRowHeight;
    let location = 'Loc: ';
    let cds = undefined;
    for (const loc of feature.cdsLocations) {
        for (const cdsLoc of loc) {
            if (bp >= cdsLoc.min && bp <= cdsLoc.max) {
                cds = cdsLoc;
                break;
            }
        }
    }
    if (!cds) {
        return;
    }
    const { max, min, phase } = cds;
    location += `${min + 1}–${max}`;
    let startPx = (lgv.bpToPx({
        refName,
        coord: reversed ? max : min,
        regionNumber: layoutIndex,
    })?.offsetPx ?? 0) - offsetPx;
    const frame = getFrame(min, max, strand ?? 1, phase);
    const frameOffsets = showFeatureLabels
        ? [0, 4, 2, 0, 14, 12, 10]
        : [0, 2, 1, 0, 7, 6, 5];
    const row = frameOffsets.at(frame);
    if (row === undefined) {
        return;
    }
    const cdsTop = row * rowHeight;
    const cdsWidthPx = (max - min) / bpPerPx;
    const featureType = `Type: ${cds.type}`;
    const featureName = attributes.get('gff_name')?.find((name) => name !== '');
    const textWidth = [
        context.measureText(featureType).width,
        context.measureText(location).width,
    ];
    if (featureName) {
        textWidth.push(context.measureText(`Parent Type: ${type}`).width, context.measureText(`Parent Name: ${featureName}`).width);
    }
    const maxWidth = Math.max(...textWidth);
    startPx = startPx + cdsWidthPx + 5;
    context.fillStyle = alpha(theme.palette.text.primary, 0.7);
    context.fillRect(startPx, cdsTop, maxWidth + 4, textWidth.length === 4 ? 55 : 35);
    context.beginPath();
    context.moveTo(startPx, cdsTop);
    context.lineTo(startPx - 5, cdsTop + 5);
    context.lineTo(startPx, cdsTop + 10);
    context.fill();
    context.fillStyle = theme.palette.background.default;
    let textTop = cdsTop + 12;
    context.fillText(featureType, startPx + 2, textTop);
    if (featureName) {
        textTop = textTop + 12;
        context.fillText(`Parent Type: ${type}`, startPx + 2, textTop);
        textTop = textTop + 12;
        context.fillText(`Parent Name: ${featureName}`, startPx + 2, textTop);
    }
    textTop = textTop + 12;
    context.fillText(location, startPx + 2, textTop);
}
function getContextMenuItems(display, mousePosition) {
    const { apolloInternetAccount: internetAccount, hoveredFeature, changeManager, filteredTranscripts, regions, selectedFeature, session, } = display;
    const [region] = regions;
    const currentAssemblyId = display.getAssemblyId(region.assemblyName);
    const menuItems = [];
    const role = internetAccount ? internetAccount.role : 'admin';
    const admin = role === 'admin';
    if (!hoveredFeature) {
        return menuItems;
    }
    const { featureTypeOntology } = session.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    if (isMousePositionWithFeature(mousePosition)) {
        const { bp, feature } = mousePosition;
        let featuresUnderClick = getRelatedFeatures(feature, bp);
        if (isCDSFeature(feature, session)) {
            featuresUnderClick = getRelatedFeatures(feature, bp, true);
        }
        for (const feature of featuresUnderClick) {
            const featureID = feature.attributes
                .get('gff_id')
                ?.toString();
            if (featureID && filteredTranscripts.includes(featureID)) {
                continue;
            }
            const contextMenuItemsForFeature = getContextMenuItemsForFeature$2(display, feature);
            if (isExonFeature(feature, session)) {
                const adjacentExons = getAdjacentExons(feature, display, mousePosition, session);
                const lgv = getContainingView(display);
                if (adjacentExons.upstream) {
                    const exon = adjacentExons.upstream;
                    contextMenuItemsForFeature.push({
                        label: 'Go to upstream exon',
                        icon: getStreamIcon(feature.strand, true, lgv.displayedRegions.at(0)?.reversed),
                        onClick: () => {
                            lgv.navTo(navToFeatureCenter(exon, 0.1, lgv.totalBp));
                            selectFeatureAndOpenWidget(display, exon);
                        },
                    });
                }
                if (adjacentExons.downstream) {
                    const exon = adjacentExons.downstream;
                    contextMenuItemsForFeature.push({
                        label: 'Go to downstream exon',
                        icon: getStreamIcon(feature.strand, false, lgv.displayedRegions.at(0)?.reversed),
                        onClick: () => {
                            lgv.navTo(navToFeatureCenter(exon, 0.1, lgv.totalBp));
                            selectFeatureAndOpenWidget(display, exon);
                        },
                    });
                }
                contextMenuItemsForFeature.push({
                    label: 'Merge exons',
                    disabled: !admin,
                    onClick: () => {
                        session.queueDialog((doneCallback) => [
                            MergeExons,
                            {
                                session,
                                handleClose: () => {
                                    doneCallback();
                                },
                                changeManager,
                                sourceFeature: feature,
                                sourceAssemblyId: currentAssemblyId,
                                selectedFeature,
                                setSelectedFeature: (feature) => {
                                    display.setSelectedFeature(feature);
                                },
                            },
                        ]);
                    },
                }, {
                    label: 'Split exon',
                    disabled: !admin,
                    onClick: () => {
                        session.queueDialog((doneCallback) => [
                            SplitExon,
                            {
                                session,
                                handleClose: () => {
                                    doneCallback();
                                },
                                changeManager,
                                sourceFeature: feature,
                                sourceAssemblyId: currentAssemblyId,
                                selectedFeature,
                                setSelectedFeature: (feature) => {
                                    display.setSelectedFeature(feature);
                                },
                            },
                        ]);
                    },
                });
            }
            if (featureTypeOntology.isTypeOf(feature.type, 'gene')) {
                contextMenuItemsForFeature.push({
                    label: 'Filter alternate transcripts',
                    onClick: () => {
                        session.queueDialog((doneCallback) => [
                            FilterTranscripts,
                            {
                                handleClose: () => {
                                    doneCallback();
                                },
                                sourceFeature: feature,
                                filteredTranscripts: getSnapshot(filteredTranscripts),
                                onUpdate: (forms) => {
                                    display.updateFilteredTranscripts(forms);
                                },
                            },
                        ]);
                    },
                });
            }
            menuItems.push({
                label: feature.type,
                subMenu: contextMenuItemsForFeature,
            });
        }
    }
    return menuItems;
}
function onMouseLeave() {
    return;
}
const geneGlyph = {
    draw,
    drawDragPreview,
    drawHover,
    drawTooltip,
    getContextMenuItems,
    getContextMenuItemsForFeature: getContextMenuItemsForFeature$2,
    onMouseDown,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
};

const minDisplayHeight = 20;
function baseModelFactory(_pluginManager, configSchema) {
    return BaseDisplay.named('BaseLinearApolloSixFrameDisplay')
        .props({
        type: types.literal('LinearApolloSixFrameDisplay'),
        configuration: ConfigurationReference(configSchema),
        graphical: true,
        table: false,
        showFeatureLabels: true,
        showStartCodons: false,
        showStopCodons: true,
        showCheckResults: true,
        zoomThreshold: 200,
        heightPreConfig: types.maybe(types.refinement('displayHeight', types.number, (n) => n >= minDisplayHeight)),
        filteredFeatureTypes: types.array(types.string),
    })
        .views((self) => {
        const { configuration, renderProps: superRenderProps } = self;
        return {
            renderProps() {
                return {
                    ...superRenderProps(),
                    ...getParentRenderProps(self),
                    config: configuration.renderer,
                };
            },
        };
    })
        .volatile(() => ({
        scrollTop: 0,
    }))
        .views((self) => ({
        get lgv() {
            return getContainingView(self);
        },
        get height() {
            if (self.heightPreConfig) {
                return self.heightPreConfig;
            }
            if (self.graphical && self.table) {
                return 500;
            }
            if (self.graphical) {
                return self.showFeatureLabels ? 400 : 200;
            }
            return 300;
        },
        get zoomThresholdSetting() {
            return self.zoomThreshold ?? getConf(self, 'zoomThreshold');
        },
    }))
        .views((self) => ({
        get rendererTypeName() {
            return self.configuration.renderer.type;
        },
        get session() {
            return getSession(self);
        },
        get regions() {
            const regions = self.lgv.dynamicBlocks.contentBlocks.map(({ assemblyName, end, refName, start }) => ({
                assemblyName,
                refName,
                start: Math.round(start),
                end: Math.round(end),
            }));
            return regions;
        },
        regionCannotBeRendered( /* region */) {
            if (self.lgv && self.lgv.bpPerPx >= self.zoomThreshold) {
                return 'Zoom in to see annotations';
            }
            return;
        },
    }))
        .views((self) => ({
        get apolloInternetAccount() {
            const [region] = self.regions;
            const { internetAccounts } = getRoot(self);
            const { assemblyName } = region;
            const { assemblyManager } = self.session;
            const assembly = assemblyManager.get(assemblyName);
            if (!assembly) {
                throw new Error(`No assembly found with name ${assemblyName}`);
            }
            const { internetAccountConfigId } = getConf(assembly, [
                'sequence',
                'metadata',
            ]);
            return internetAccounts.find((ia) => getConf(ia, 'internetAccountId') === internetAccountConfigId);
        },
        get changeManager() {
            return self.session.apolloDataStore
                .changeManager;
        },
        getAssemblyId(assemblyName) {
            const { assemblyManager } = self.session;
            const assembly = assemblyManager.get(assemblyName);
            if (!assembly) {
                throw new Error(`Could not find assembly named ${assemblyName}`);
            }
            return assembly.name;
        },
        get selectedFeature() {
            return self.session
                .apolloSelectedFeature;
        },
        get hoveredFeature() {
            return self.session
                .apolloHoveredFeature;
        },
    }))
        .actions((self) => ({
        setScrollTop(scrollTop) {
            self.scrollTop = scrollTop;
        },
        setHeight(displayHeight) {
            self.heightPreConfig = Math.max(displayHeight, minDisplayHeight);
            return self.height;
        },
        resizeHeight(distance) {
            const oldHeight = self.height;
            const newHeight = this.setHeight(self.height + distance);
            return newHeight - oldHeight;
        },
        showGraphicalOnly() {
            self.graphical = true;
            self.table = false;
        },
        showTableOnly() {
            self.graphical = false;
            self.table = true;
        },
        showGraphicalAndTable() {
            self.graphical = true;
            self.table = true;
        },
        toggleShowFeatureLabels() {
            self.showFeatureLabels = !self.showFeatureLabels;
        },
        toggleShowStartCodons() {
            self.showStartCodons = !self.showStartCodons;
        },
        toggleShowStopCodons() {
            self.showStopCodons = !self.showStopCodons;
        },
        toggleShowCheckResults() {
            self.showCheckResults = !self.showCheckResults;
        },
        updateFilteredFeatureTypes(types) {
            self.filteredFeatureTypes = cast(types);
        },
        setZoomThresholdSetting({ zoomThreshold }) {
            self.zoomThreshold = zoomThreshold;
        },
    }))
        .views((self) => {
        const { filteredFeatureTypes, trackMenuItems: superTrackMenuItems } = self;
        return {
            trackMenuItems() {
                const { graphical, table, showFeatureLabels, showStartCodons, showStopCodons, showCheckResults, } = self;
                return [
                    ...superTrackMenuItems(),
                    {
                        type: 'subMenu',
                        label: 'Appearance',
                        subMenu: [
                            {
                                label: 'Show graphical display',
                                type: 'radio',
                                checked: graphical && !table,
                                onClick: () => {
                                    self.showGraphicalOnly();
                                },
                            },
                            {
                                label: 'Show table display',
                                type: 'radio',
                                checked: table && !graphical,
                                onClick: () => {
                                    self.showTableOnly();
                                },
                            },
                            {
                                label: 'Show both graphical and table display',
                                type: 'radio',
                                checked: table && graphical,
                                onClick: () => {
                                    self.showGraphicalAndTable();
                                },
                            },
                            {
                                label: 'Feature Labels',
                                type: 'checkbox',
                                checked: showFeatureLabels,
                                onClick: () => {
                                    self.toggleShowFeatureLabels();
                                },
                            },
                            {
                                label: 'Show start codons',
                                type: 'checkbox',
                                checked: showStartCodons,
                                onClick: () => {
                                    self.toggleShowStartCodons();
                                },
                            },
                            {
                                label: 'Show stop codons',
                                type: 'checkbox',
                                checked: showStopCodons,
                                onClick: () => {
                                    self.toggleShowStopCodons();
                                },
                            },
                            {
                                label: 'Check Results',
                                type: 'checkbox',
                                checked: showCheckResults,
                                onClick: () => {
                                    self.toggleShowCheckResults();
                                },
                            },
                            {
                                label: 'Change zoom threshold',
                                onClick: () => {
                                    getSession(self).queueDialog((handleClose) => [
                                        EditZoomThresholdDialog,
                                        { model: self, handleClose },
                                    ]);
                                },
                            },
                        ],
                    },
                    {
                        label: 'Filter features by type',
                        onClick: () => {
                            const session = self.session;
                            self.session.queueDialog((doneCallback) => [
                                FilterFeatures,
                                {
                                    session,
                                    handleClose: () => {
                                        doneCallback();
                                    },
                                    featureTypes: getSnapshot(filteredFeatureTypes),
                                    onUpdate: (types) => {
                                        self.updateFilteredFeatureTypes(types);
                                    },
                                },
                            ]);
                        },
                    },
                ];
            },
        };
    })
        .actions((self) => ({
        setSelectedFeature(feature) {
            self.session.apolloSetSelectedFeature(feature);
        },
        setHoveredFeature(hoveredFeature) {
            self.session.apolloSetHoveredFeature(hoveredFeature);
        },
        showFeatureDetailsWidget(feature, customWidgetNameAndId) {
            const [region] = self.regions;
            const { assemblyName, refName } = region;
            const assembly = self.getAssemblyId(assemblyName);
            if (!assembly) {
                return;
            }
            const { session } = self;
            const { changeManager } = session.apolloDataStore;
            const [widgetName, widgetId] = customWidgetNameAndId ?? [
                'ApolloFeatureDetailsWidget',
                'apolloFeatureDetailsWidget',
            ];
            const apolloFeatureWidget = session.addWidget(widgetName, widgetId, {
                feature,
                assembly,
                refName,
                changeManager,
            });
            session.showWidget(apolloFeatureWidget);
        },
        afterAttach() {
            addDisposer(self, autorun(() => {
                if (!self.lgv.initialized || self.regionCannotBeRendered()) {
                    return;
                }
                void self.session.apolloDataStore.loadFeatures(self.regions);
                if (self.lgv.bpPerPx <= self.zoomThreshold) {
                    void self.session.apolloDataStore.loadRefSeq(self.regions);
                }
            }, { name: 'LinearApolloSixFrameDisplayLoadFeatures', delay: 1000 }));
        },
    }));
}

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
function layoutsModelFactory(pluginManager, configSchema) {
    const BaseLinearApolloSixFrameDisplay = baseModelFactory(pluginManager, configSchema);
    return BaseLinearApolloSixFrameDisplay.named('LinearApolloSixFrameDisplayLayouts')
        .props({
        featuresMinMaxLimit: 500_000,
    })
        .volatile(() => ({
        seenFeatures: observable.map(),
    }))
        .views((self) => ({
        get featuresMinMax() {
            const { assemblyManager } = self.session;
            return self.lgv.displayedRegions.map((region) => {
                const assembly = assemblyManager.get(region.assemblyName);
                let min;
                let max;
                const { end, refName, start } = region;
                for (const [, feature] of self.seenFeatures) {
                    if (refName !== assembly?.getCanonicalRefName(feature.refSeq) ||
                        !doesIntersect2(start, end, feature.min, feature.max) ||
                        feature.length > self.featuresMinMaxLimit) {
                        continue;
                    }
                    if (min === undefined) {
                        ({ min } = feature);
                    }
                    if (max === undefined) {
                        ({ max } = feature);
                    }
                    if (feature.minWithChildren < min) {
                        ({ min } = feature);
                    }
                    if (feature.maxWithChildren > max) {
                        ({ max } = feature);
                    }
                }
                if (min !== undefined && max !== undefined) {
                    return [min, max];
                }
                return;
            });
        },
        getGlyph(_feature) {
            return geneGlyph;
        },
        featureLabelSpacer(elem) {
            return self.showFeatureLabels ? elem * 2 - 1 : elem;
        },
    }))
        .actions((self) => ({
        addSeenFeature(feature) {
            self.seenFeatures.set(feature._id, feature);
        },
        deleteSeenFeature(featureId) {
            self.seenFeatures.delete(featureId);
        },
    }))
        .views((self) => ({
        get geneTrackRowNums() {
            return [4, 5].map((elem) => self.featureLabelSpacer(elem));
        },
    }))
        .views((self) => ({
        get featureLayouts() {
            const { assemblyManager } = self.session;
            return self.lgv.displayedRegions.map((region, idx) => {
                const assembly = assemblyManager.get(region.assemblyName);
                const featureLayout = new Map();
                const minMax = self.featuresMinMax[idx];
                if (!minMax) {
                    return featureLayout;
                }
                const { end, refName, start } = region;
                for (const [id, feature] of self.seenFeatures.entries()) {
                    if (!isAlive(feature)) {
                        self.deleteSeenFeature(id);
                        continue;
                    }
                    if (refName !== assembly?.getCanonicalRefName(feature.refSeq) ||
                        !doesIntersect2(start, end, feature.min, feature.max)) {
                        continue;
                    }
                    const { featureTypeOntology } = self.session.apolloDataStore.ontologyManager;
                    if (!featureTypeOntology) {
                        throw new Error('featureTypeOntology is undefined');
                    }
                    if (feature.looksLikeGene) {
                        const rowNum = feature.strand == 1
                            ? self.geneTrackRowNums[0]
                            : self.geneTrackRowNums[1];
                        if (!featureLayout.get(rowNum)) {
                            featureLayout.set(rowNum, []);
                        }
                        const layoutRow = featureLayout.get(rowNum);
                        layoutRow?.push({ rowNum, feature });
                        const { children } = feature;
                        if (!children) {
                            continue;
                        }
                        for (const [, child] of children) {
                            if (featureTypeOntology.isTypeOf(child.type, 'transcript')) {
                                const { cdsLocations, strand, children: childrenOfmRNA, } = child;
                                if (childrenOfmRNA) {
                                    for (const [, exon] of childrenOfmRNA) {
                                        if (!featureTypeOntology.isTypeOf(exon.type, 'exon')) {
                                            continue;
                                        }
                                        const rowNum = exon.strand == 1
                                            ? self.geneTrackRowNums[0]
                                            : self.geneTrackRowNums[1];
                                        const layoutRow = featureLayout.get(rowNum);
                                        layoutRow?.push({ rowNum, feature: exon });
                                    }
                                }
                                for (const cdsRow of cdsLocations) {
                                    for (const cds of cdsRow) {
                                        const frame = getFrame(cds.min, cds.max, strand ?? 1, cds.phase);
                                        const frameOffsets = self.showFeatureLabels
                                            ? [0, 5, 3, 1, 15, 13, 11]
                                            : [0, 2, 1, 0, 8, 7, 6];
                                        const rowNum = frameOffsets.at(frame);
                                        if (!rowNum) {
                                            continue;
                                        }
                                        if (!featureLayout.get(rowNum)) {
                                            featureLayout.set(rowNum, []);
                                        }
                                        const layoutRow = featureLayout.get(rowNum);
                                        layoutRow?.push({ rowNum, feature: child });
                                    }
                                }
                            }
                        }
                    }
                    else {
                        continue;
                    }
                }
                return featureLayout;
            });
        },
        getFeatureLayoutPosition(feature) {
            const { featureLayouts } = this;
            for (const [idx, layout] of featureLayouts.entries()) {
                for (const [, layoutRow] of layout) {
                    for (const { feature: layoutFeature } of layoutRow) {
                        if (feature._id === layoutFeature._id) {
                            return {
                                layoutIndex: idx,
                                layoutRow: 0,
                                featureRow: 0,
                            };
                        }
                    }
                }
            }
            return;
        },
    }))
        .views((_self) => ({
        get highestRow() {
            return 5;
        },
    }))
        .actions((self) => ({
        afterAttach() {
            addDisposer(self, autorun(() => {
                if (!self.lgv.initialized || self.regionCannotBeRendered()) {
                    return;
                }
                for (const region of self.regions) {
                    const assembly = self.session.apolloDataStore.assemblies.get(region.assemblyName);
                    const ref = assembly?.getByRefName(region.refName);
                    const features = ref?.features;
                    if (!features) {
                        continue;
                    }
                    for (const [, feature] of features) {
                        if (doesIntersect2(region.start, region.end, feature.min, feature.max) &&
                            !self.seenFeatures.has(feature._id)) {
                            self.addSeenFeature(feature);
                        }
                    }
                }
            }, { name: 'LinearApolloSixFrameDisplaySetSeenFeatures', delay: 1000 }));
        },
    }));
}

function drawCodon(ctx, codon, leftPx, index, theme, highContrast, bpPerPx, bp, rowHeight, showFeatureLabels, showStartCodons, showStopCodons) {
    const frameOffsets = (showFeatureLabels ? [0, 4, 2, 0, 14, 12, 10] : [0, 2, 1, 0, 7, 6, 5]).map((b) => b * rowHeight);
    const strands = [-1, 1];
    for (const strand of strands) {
        const frame = getFrame(bp, bp + 3, strand, 0);
        const top = frameOffsets.at(frame);
        if (top === undefined) {
            continue;
        }
        const left = Math.round(leftPx + index / bpPerPx);
        const width = Math.round(3 / bpPerPx) === 0 ? 1 : Math.round(3 / bpPerPx);
        const codonCode = strand === 1 ? codon : revcom(codon);
        const aminoAcidCode = defaultCodonTable[codonCode];
        const fillColor = codonColorCode(aminoAcidCode, theme, highContrast);
        if (fillColor &&
            ((showStopCodons && aminoAcidCode == '*') ||
                (showStartCodons && aminoAcidCode != '*'))) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(left, top, width, rowHeight);
        }
    }
}
function renderingModelFactory(pluginManager, configSchema) {
    const LinearApolloSixFrameDisplayLayouts = layoutsModelFactory(pluginManager, configSchema);
    return LinearApolloSixFrameDisplayLayouts.named('LinearApolloSixFrameDisplayRendering')
        .props({
        apolloRowHeight: 20,
        detailsMinHeight: 200,
        detailsHeight: 200,
        lastRowTooltipBufferHeight: 120,
        isShown: true,
        filteredTranscripts: types.array(types.string),
    })
        .volatile(() => ({
        canvas: null,
        overlayCanvas: null,
        collaboratorCanvas: null,
        theme: createTheme(),
    }))
        .views((self) => ({
        get featuresHeight() {
            const featureLabelSpacer = self.showFeatureLabels ? 2 : 1;
            return (featureLabelSpacer * ((self.highestRow + 1) * self.apolloRowHeight) +
                self.lastRowTooltipBufferHeight);
        },
    }))
        .actions((self) => ({
        toggleShown() {
            self.isShown = !self.isShown;
        },
        setDetailsHeight(newHeight) {
            self.detailsHeight = self.isShown
                ? Math.max(Math.min(newHeight, self.height - 100), Math.min(self.height, self.detailsMinHeight))
                : newHeight;
        },
        setCanvas(canvas) {
            self.canvas = canvas;
        },
        setOverlayCanvas(canvas) {
            self.overlayCanvas = canvas;
        },
        setCollaboratorCanvas(canvas) {
            self.collaboratorCanvas = canvas;
        },
        setTheme(theme) {
            self.theme = theme;
        },
    }))
        .actions((self) => ({
        afterAttach() {
            addDisposer(self, autorun(() => {
                if (!self.lgv.initialized || self.regionCannotBeRendered()) {
                    return;
                }
                const ctx = self.collaboratorCanvas?.getContext('2d');
                if (!ctx) {
                    return;
                }
                ctx.clearRect(0, 0, self.lgv.dynamicBlocks.totalWidthPx, self.featuresHeight);
                for (const collaborator of self.session.collaborators) {
                    const { locations } = collaborator;
                    if (locations.length === 0) {
                        continue;
                    }
                    let idx = 0;
                    for (const displayedRegion of self.lgv.displayedRegions) {
                        for (const location of locations) {
                            if (location.refSeq !== displayedRegion.refName) {
                                continue;
                            }
                            const { end, refSeq, start } = location;
                            const locationStartPxInfo = self.lgv.bpToPx({
                                refName: refSeq,
                                coord: start,
                                regionNumber: idx,
                            });
                            if (!locationStartPxInfo) {
                                continue;
                            }
                            const locationStartPx = locationStartPxInfo.offsetPx - self.lgv.offsetPx;
                            const locationWidthPx = (end - start) / self.lgv.bpPerPx;
                            ctx.fillStyle = 'rgba(0,255,0,.2)';
                            ctx.fillRect(locationStartPx, 1, locationWidthPx, 100);
                            ctx.fillStyle = 'black';
                            ctx.fillText(collaborator.name, locationStartPx + 1, 11, locationWidthPx - 2);
                        }
                        idx++;
                    }
                }
            }, { name: 'LinearApolloSixFrameDisplayRenderCollaborators' }));
            addDisposer(self, autorun(() => {
                const { apolloRowHeight, canvas, featureLayouts, featuresHeight, lgv, session, theme, showFeatureLabels, showStartCodons, showStopCodons, } = self;
                if (!lgv.initialized || self.regionCannotBeRendered()) {
                    return;
                }
                const { bpPerPx, offsetPx, displayedRegions, dynamicBlocks } = lgv;
                const ctx = canvas?.getContext('2d');
                if (!ctx) {
                    return;
                }
                ctx.clearRect(0, 0, dynamicBlocks.totalWidthPx, featuresHeight);
                for (const [idx, featureLayout] of featureLayouts.entries()) {
                    const displayedRegion = displayedRegions[idx];
                    for (const [row, featureLayoutRow] of featureLayout.entries()) {
                        for (const { feature } of featureLayoutRow) {
                            if (!feature.looksLikeGene) {
                                continue;
                            }
                            if (!doesIntersect2(displayedRegion.start, displayedRegion.end, feature.min, feature.max)) {
                                continue;
                            }
                            const { topLevelFeature } = feature;
                            const glyph = self.getGlyph(topLevelFeature);
                            if (glyph !== undefined) {
                                glyph.draw(ctx, topLevelFeature, row, self, idx);
                            }
                        }
                    }
                }
                if (showStartCodons || showStopCodons) {
                    const { apolloDataStore } = session;
                    for (const block of dynamicBlocks.contentBlocks) {
                        const assembly = apolloDataStore.assemblies.get(block.assemblyName);
                        const ref = assembly?.getByRefName(block.refName);
                        const roundedStart = Math.floor(block.start);
                        const roundedEnd = Math.ceil(block.end);
                        let seq = ref?.getSequence(roundedStart, roundedEnd);
                        if (!seq) {
                            break;
                        }
                        seq = seq.toUpperCase();
                        const baseOffsetPx = (block.start - roundedStart) / bpPerPx;
                        const seqLeftPx = Math.round(block.offsetPx - offsetPx - baseOffsetPx);
                        for (let i = 0; i < seq.length; i++) {
                            const bp = roundedStart + i;
                            const codon = seq.slice(i, i + 3);
                            drawCodon(ctx, codon, seqLeftPx, i, theme, true, bpPerPx, bp, apolloRowHeight, showFeatureLabels, showStartCodons, showStopCodons);
                        }
                    }
                }
            }, { name: 'LinearApolloSixFrameDisplayRenderFeatures' }));
        },
    }));
}

function mouseEventsModelIntermediateFactory(pluginManager, configSchema) {
    const LinearApolloSixFrameDisplayRendering = renderingModelFactory(pluginManager, configSchema);
    return LinearApolloSixFrameDisplayRendering.named('LinearApolloSixFrameDisplayMouseEvents')
        .volatile(() => ({
        apolloDragging: null,
        cursor: undefined,
    }))
        .views((self) => ({
        getMousePosition(event) {
            const mousePosition = getMousePosition(event, self.lgv);
            const { bp, regionNumber, y } = mousePosition;
            const row = Math.floor(y / self.apolloRowHeight) + 1;
            const featureLayout = self.featureLayouts[regionNumber];
            const layoutRow = featureLayout.get(row);
            if (!layoutRow) {
                return mousePosition;
            }
            const { featureTypeOntology } = self.session.apolloDataStore.ontologyManager;
            if (!featureTypeOntology) {
                throw new Error('featureTypeOntology is undefined');
            }
            let foundFeature;
            if (self.geneTrackRowNums.includes(row)) {
                foundFeature = layoutRow.find((f) => f.feature.type == 'exon' &&
                    bp >= f.feature.min &&
                    bp <= f.feature.max);
                if (!foundFeature) {
                    foundFeature = layoutRow.find((f) => bp >= f.feature.min && bp <= f.feature.max);
                }
            }
            else {
                foundFeature = layoutRow.find((f) => {
                    const { feature } = f;
                    const featureID = feature.attributes.get('gff_id')?.toString();
                    const isTranscript = featureTypeOntology.isTypeOf(feature.type, 'transcript');
                    if (!isTranscript) {
                        return false;
                    }
                    for (const loc of feature.cdsLocations) {
                        for (const cds of loc) {
                            const frame = getFrame(cds.min, cds.max, feature.strand ?? 1, cds.phase);
                            const frameOffsets = self.showFeatureLabels
                                ? [0, 5, 3, 1, 15, 13, 11]
                                : [0, 2, 1, 0, 8, 7, 6];
                            const rowNum = frameOffsets.at(frame);
                            if (row === rowNum && bp >= cds.min && bp <= cds.max) {
                                return (featureID === undefined ||
                                    !self.filteredTranscripts.includes(featureID));
                            }
                        }
                    }
                    return false;
                });
            }
            if (!foundFeature) {
                return mousePosition;
            }
            const { feature } = foundFeature;
            return {
                ...mousePosition,
                feature,
            };
        },
    }))
        .actions((self) => ({
        continueDrag(mousePosition, event) {
            if (!self.apolloDragging) {
                throw new Error('continueDrag() called with no current drag in progress');
            }
            event.stopPropagation();
            self.apolloDragging = { ...self.apolloDragging, current: mousePosition };
        },
        setDragging(dragInfo) {
            self.apolloDragging = dragInfo ?? null;
        },
    }))
        .actions((self) => ({
        setCursor(cursor) {
            if (self.cursor !== cursor) {
                self.cursor = cursor;
            }
        },
        updateFilteredTranscripts(forms) {
            self.filteredTranscripts = cast(forms);
        },
    }))
        .actions(() => ({
        // onClick(event: CanvasMouseEvent) {
        onClick() {
            // TODO: set the selected feature
        },
    }));
}
function mouseEventsModelFactory(pluginManager, configSchema) {
    const LinearApolloSixFrameDisplayMouseEvents = mouseEventsModelIntermediateFactory(pluginManager, configSchema);
    return LinearApolloSixFrameDisplayMouseEvents.views((self) => ({
        contextMenuItems(event) {
            const { hoveredFeature } = self;
            if (!hoveredFeature) {
                return [];
            }
            const mousePosition = self.getMousePosition(event);
            const { topLevelFeature } = hoveredFeature.feature;
            const glyph = self.getGlyph(topLevelFeature);
            if (isMousePositionWithFeature(mousePosition)) {
                return glyph.getContextMenuItems(self, mousePosition);
            }
            return [];
        },
    }))
        .actions((self) => ({
        // explicitly pass in a feature in case it's not the same as the one in
        // mousePosition (e.g. if features are drawn overlapping).
        startDrag(mousePosition, feature, edge, shrinkParent = false) {
            self.apolloDragging = {
                start: mousePosition,
                current: mousePosition,
                feature,
                edge,
                shrinkParent,
            };
        },
        endDrag() {
            if (!self.apolloDragging) {
                throw new Error('endDrag() called with no current drag in progress');
            }
            const { current, edge, feature, start, shrinkParent } = self.apolloDragging;
            // don't do anything if it was only dragged a tiny bit
            if (Math.abs(current.x - start.x) <= 4) {
                self.setDragging();
                self.setCursor();
                return;
            }
            const { displayedRegions } = self.lgv;
            const region = displayedRegions[start.regionNumber];
            const assembly = self.getAssemblyId(region.assemblyName);
            const changes = getPropagatedLocationChanges(feature, current.bp, edge, shrinkParent);
            const change = edge === 'max'
                ? new LocationEndChange({
                    typeName: 'LocationEndChange',
                    changedIds: changes.map((c) => c.featureId),
                    changes: changes.map((c) => ({
                        featureId: c.featureId,
                        oldEnd: c.oldLocation,
                        newEnd: c.newLocation,
                    })),
                    assembly,
                })
                : new LocationStartChange({
                    typeName: 'LocationStartChange',
                    changedIds: changes.map((c) => c.featureId),
                    changes: changes.map((c) => ({
                        featureId: c.featureId,
                        oldStart: c.oldLocation,
                        newStart: c.newLocation,
                    })),
                    assembly,
                });
            void self.changeManager.submit(change);
            self.setDragging();
            self.setCursor();
        },
    }))
        .actions((self) => ({
        onMouseDown(event) {
            const mousePosition = self.getMousePosition(event);
            if (isMousePositionWithFeature(mousePosition)) {
                const glyph = self.getGlyph(mousePosition.feature);
                glyph.onMouseDown(self, mousePosition, event);
            }
        },
        onMouseMove(event) {
            const mousePosition = self.getMousePosition(event);
            if (self.apolloDragging) {
                self.setCursor('col-resize');
                self.continueDrag(mousePosition, event);
                return;
            }
            if (isMousePositionWithFeature(mousePosition)) {
                const glyph = self.getGlyph(mousePosition.feature);
                glyph.onMouseMove(self, mousePosition, event);
            }
            else {
                self.setHoveredFeature();
                self.setCursor();
            }
        },
        onMouseLeave(event) {
            self.setDragging();
            self.setHoveredFeature();
            const mousePosition = self.getMousePosition(event);
            if (isMousePositionWithFeature(mousePosition)) {
                const glyph = self.getGlyph(mousePosition.feature);
                glyph.onMouseLeave(self, mousePosition, event);
            }
        },
        onMouseUp(event) {
            const mousePosition = self.getMousePosition(event);
            if (isMousePositionWithFeature(mousePosition)) {
                const glyph = self.getGlyph(mousePosition.feature);
                glyph.onMouseUp(self, mousePosition, event);
            }
            else {
                self.setSelectedFeature();
            }
            if (self.apolloDragging) {
                self.endDrag();
            }
        },
    }))
        .actions((self) => ({
        afterAttach() {
            addDisposer(self, autorun(() => {
                // This type is wrong in @jbrowse/core
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!self.lgv.initialized || self.regionCannotBeRendered()) {
                    return;
                }
                const ctx = self.overlayCanvas?.getContext('2d');
                if (!ctx) {
                    return;
                }
                ctx.clearRect(0, 0, self.lgv.dynamicBlocks.totalWidthPx, self.featuresHeight);
                const { apolloDragging, hoveredFeature } = self;
                if (!hoveredFeature) {
                    return;
                }
                const glyph = self.getGlyph(hoveredFeature.feature);
                // draw mouseover hovers
                glyph.drawHover(self, ctx);
                // draw tooltip on hover
                glyph.drawTooltip(self, ctx);
                // dragging previews
                if (apolloDragging) {
                    // NOTE: the glyph where the drag started is responsible for drawing the preview.
                    // it can call methods in other glyphs to help with this though.
                    const glyph = self.getGlyph(apolloDragging.feature.topLevelFeature);
                    glyph.drawDragPreview(self, ctx);
                }
            }, { name: 'LinearApolloSixFrameDisplayRenderMouseoverAndDrag' }));
        },
    }));
}

function stateModelFactory(pluginManager, configSchema) {
    // TODO: this needs to be refactored so that the final composition of the
    // state model mixins happens here in one central place
    return mouseEventsModelFactory(pluginManager, configSchema)
        .props({ tabularEditor: types.optional(TabularEditorStateModelType, {}) })
        .named('LinearApolloSixFrameDisplay');
}

const ApolloPluginConfigurationSchema = ConfigurationSchema('ApolloPlugin', {
    ontologies: types.array(OntologyRecordConfiguration),
    featureTypeOntologyName: {
        description: 'Name of the feature type ontology',
        type: 'string',
        defaultValue: 'Sequence Ontology',
    },
    hasRole: {
        description: 'Flag used internally by jbrowse-plugin-apollo',
        type: 'boolean',
        defaultValue: false,
    },
    geneBackgroundColor: {
        description: 'Color for feature background',
        type: 'string',
        defaultValue: 'jexl:geneBackgroundColor(featureType)',
        contextVariable: ['featureType'],
    },
});

const isGeneOrTranscript = (annotationFeature, apolloSessionModel) => {
    const { featureTypeOntology } = apolloSessionModel.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    return (featureTypeOntology.isTypeOf(annotationFeature.type, 'gene') ||
        featureTypeOntology.isTypeOf(annotationFeature.type, 'transcript') ||
        featureTypeOntology.isTypeOf(annotationFeature.type, 'pseudogene') ||
        featureTypeOntology.isTypeOf(annotationFeature.type, 'pseudogenic_transcript'));
};
const isGene = (annotationFeature, apolloSessionModel) => {
    const { featureTypeOntology } = apolloSessionModel.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    return (featureTypeOntology.isTypeOf(annotationFeature.type, 'gene') ||
        featureTypeOntology.isTypeOf(annotationFeature.type, 'pseudogene'));
};
const isTranscript = (annotationFeature, apolloSessionModel) => {
    const { featureTypeOntology } = apolloSessionModel.apolloDataStore.ontologyManager;
    if (!featureTypeOntology) {
        throw new Error('featureTypeOntology is undefined');
    }
    return (featureTypeOntology.isTypeOf(annotationFeature.type, 'transcript') ||
        featureTypeOntology.isTypeOf(annotationFeature.type, 'pseudogenic_transcript'));
};
function getFeatureName(feature) {
    const { attributes } = feature;
    const keys = ['name', 'gff_name', 'transcript_name', 'gene_name'];
    for (const key of keys) {
        const value = attributes?.[key];
        if (value?.[0]) {
            return value[0];
        }
    }
    return '';
}
function getGeneNameOrId(feature) {
    const { attributes } = feature;
    const keys = ['gene_name', 'gene_id', 'gene_stable_id'];
    for (const key of keys) {
        const value = attributes?.[key];
        if (value?.[0]) {
            return value[0];
        }
    }
    return '';
}
function getFeatureId(feature) {
    const { attributes } = feature;
    const keys = [
        'id',
        'gff_id',
        'transcript_id',
        'gene_id',
        'gene_stable_id',
        'stable_id',
    ];
    for (const key of keys) {
        const value = attributes?.[key];
        if (value?.[0]) {
            return value[0];
        }
    }
    return '';
}
const getFeatureNameOrId = (feature) => {
    const name = getFeatureName(feature);
    const id = getFeatureId(feature);
    if (name) {
        return `${feature.type} - ${name}`;
    }
    if (id) {
        return `${feature.type} - ${id}`;
    }
    return feature.type;
};
function CreateApolloAnnotation({ annotationFeature, assembly, handleClose, refSeqId, session, region, }) {
    const apolloSessionModel = session;
    const { featureTypeOntology } = apolloSessionModel.apolloDataStore.ontologyManager;
    const childIds = useMemo(() => Object.keys(annotationFeature.children ?? {}), [annotationFeature]);
    const [parentFeatureChecked, setParentFeatureChecked] = useState(true);
    const [checkedChildrens, setCheckedChildrens] = useState(childIds);
    const [errorMessage, setErrorMessage] = useState('');
    const [destinationFeatures, setDestinationFeatures] = useState([]);
    const [createNewGene, setCreateNewGene] = useState(false);
    const [selectedDestinationFeature, setSelectedDestinationFeature] = useState();
    const apolloAssembly = apolloSessionModel.apolloDataStore.assemblies.get(assembly.name);
    const refSeq = apolloAssembly?.refSeqs.get(refSeqId);
    const features = refSeq?.getFeatures(region.start, region.end);
    const getDestinationFeatures = () => {
        const filteredFeatures = [];
        for (const f of features ?? []) {
            if (f.min > region.end || f.max < region.start) {
                continue;
            }
            // Destination feature should be of type gene
            if (featureTypeOntology?.isTypeOf(f.type, 'gene')) {
                const featureSnapshot = getSnapshot(f);
                filteredFeatures.push(featureSnapshot);
            }
        }
        return filteredFeatures;
    };
    useEffect(() => {
        setErrorMessage('');
        const features = getDestinationFeatures();
        setDestinationFeatures(features);
        setSelectedDestinationFeature(features[0]);
    }, [checkedChildrens, parentFeatureChecked, region]);
    const handleParentFeatureCheck = (event) => {
        const isChecked = event.target.checked;
        setParentFeatureChecked(isChecked);
        setCheckedChildrens(isChecked ? childIds : []);
    };
    const handleChildFeatureCheck = (event, child) => {
        setCheckedChildrens((prevChecked) => event.target.checked
            ? [...prevChecked, child._id]
            : prevChecked.filter((childId) => childId !== child._id));
    };
    const handleDestinationFeatureChange = (e) => {
        const selectedFeature = destinationFeatures.find((f) => f._id === e.target.value);
        setSelectedDestinationFeature(selectedFeature);
    };
    const handleCreateApolloAnnotation = async () => {
        if (parentFeatureChecked) {
            // IF SOURCE FEATURE IS GENE
            if (isGene(annotationFeature, apolloSessionModel)) {
                await copyGeneFeature();
                session.notify('Successfully copied selected gene and transcript(s)', 'success');
            }
            if (isTranscript(annotationFeature, apolloSessionModel)) {
                // IF THE SOURCE IS TRANSCRIPT AND THE DESTINATION IS SELECTED AND CREATE NEW GENE IS NOT CHECKED
                if (selectedDestinationFeature && !createNewGene) {
                    const transcripts = {};
                    transcripts[annotationFeature._id] = annotationFeature;
                    // If source trancript doesn't overlap with destination gene
                    // If not overlapping, then extend the destination gene to include the transcript
                    if (selectedDestinationFeature.max < annotationFeature.max ||
                        selectedDestinationFeature.min > annotationFeature.min) {
                        const newMin = Math.min(selectedDestinationFeature.min, annotationFeature.min);
                        const newMax = Math.max(selectedDestinationFeature.max, annotationFeature.max);
                        await extendSelectedDestinationFeatureLocation(newMin, newMax);
                        await copyTranscriptsToDestinationGene(transcripts);
                    }
                    else {
                        await copyTranscriptsToDestinationGene(transcripts);
                    }
                    session.notify('Successfully copied selected transcripts to destination gene', 'success');
                }
                else {
                    // IF THERE IS NO DESTINATION GENE SELECTED AND CREATE NEW GENE IS CHECKED
                    const childrens = {};
                    childrens[annotationFeature._id] = annotationFeature;
                    await createNewGeneFeatureWithTranscripts(childrens);
                    session.notify('Successfully created a new gene with selected transcripts', 'success');
                }
            }
        }
        else {
            // IF PARENT (GENE) FEATURE IS NOT CHECKED AND WE ARE COPYING CHILDREN (TRANSCRIPTS)
            if (!annotationFeature.children) {
                return;
            }
            // IF DESTINATION IS SELECTED AND CREATE NEW GENE IS NOT CHECKED
            if (selectedDestinationFeature && !createNewGene) {
                const childrens = {};
                for (const childId of checkedChildrens) {
                    childrens[childId] = annotationFeature.children[childId];
                }
                const min = Math.min(...Object.values(childrens).map((child) => child.min));
                const max = Math.max(...Object.values(childrens).map((child) => child.max));
                // If source trancript doesn't overlap with destination gene
                // If not overlapping, then extend the destination gene to include the transcript
                if (selectedDestinationFeature.min > min ||
                    selectedDestinationFeature.max < max) {
                    const newMin = Math.min(selectedDestinationFeature.min, min);
                    const newMax = Math.max(selectedDestinationFeature.max, max);
                    await extendSelectedDestinationFeatureLocation(newMin, newMax);
                    await copyTranscriptsToDestinationGene(childrens);
                }
                else {
                    await copyTranscriptsToDestinationGene(childrens);
                }
                session.notify('Successfully copied transcript to destination gene', 'success');
            }
            else {
                // IF THERE IS NO DESTINATION GENE SELECTED AND CREATE NEW GENE IS CHECKED
                const childrens = {};
                for (const childId of checkedChildrens) {
                    childrens[childId] = annotationFeature.children[childId];
                }
                await createNewGeneFeatureWithTranscripts(childrens);
                session.notify('Successfully created a new gene with selected transcript', 'success');
            }
        }
        handleClose();
    };
    // Copies gene feature along with its selected children
    const copyGeneFeature = async () => {
        let change;
        if (annotationFeature.children &&
            checkedChildrens.length !==
                Object.values(annotationFeature.children).length) {
            // IF SOME CHILDREN ARE CHECKED
            const childrens = {};
            for (const childId of checkedChildrens) {
                childrens[childId] = annotationFeature.children[childId];
            }
            change = new AddFeatureChange({
                changedIds: [annotationFeature._id],
                typeName: 'AddFeatureChange',
                assembly: assembly.name,
                addedFeature: {
                    ...annotationFeature,
                    children: childrens,
                },
            });
        }
        else {
            // IF PARENT AND ALL CHILDREN ARE CHECKED
            change = new AddFeatureChange({
                changedIds: [annotationFeature._id],
                typeName: 'AddFeatureChange',
                assembly: assembly.name,
                addedFeature: annotationFeature,
            });
        }
        await submitChange(change, annotationFeature._id);
    };
    const copyTranscriptsToDestinationGene = async (transcripts) => {
        if (!selectedDestinationFeature) {
            return;
        }
        for (const transcriptId of Object.keys(transcripts)) {
            const transcript = transcripts[transcriptId];
            transcript.strand = selectedDestinationFeature.strand;
            // update strand of transcript children if they exist
            if (transcript.children) {
                for (const childId of Object.keys(transcript.children)) {
                    transcript.children[childId].strand =
                        selectedDestinationFeature.strand;
                }
            }
            const change = new AddFeatureChange({
                parentFeatureId: selectedDestinationFeature._id,
                changedIds: [selectedDestinationFeature._id],
                typeName: 'AddFeatureChange',
                assembly: assembly.name,
                addedFeature: transcript,
            });
            // selects the last added transcript
            await submitChange(change, transcriptId);
        }
    };
    const createNewGeneFeatureWithTranscripts = async (childrens) => {
        const newGeneId = new ObjectID().toHexString();
        const min = Math.min(...Object.values(childrens).map((child) => child.min));
        const max = Math.max(...Object.values(childrens).map((child) => child.max));
        const change = new AddFeatureChange({
            changedIds: [newGeneId],
            typeName: 'AddFeatureChange',
            assembly: assembly.name,
            addedFeature: {
                _id: newGeneId,
                refSeq: refSeqId,
                min,
                max,
                strand: annotationFeature.strand,
                type: 'gene',
                children: childrens,
                attributes: {
                    name: [getGeneNameOrId(annotationFeature)],
                    gene_name: [getGeneNameOrId(annotationFeature)],
                },
            },
        });
        await submitChange(change, newGeneId);
    };
    const extendSelectedDestinationFeatureLocation = async (newMin, newMax) => {
        if (!selectedDestinationFeature) {
            return;
        }
        const changes = [];
        if (newMin !== selectedDestinationFeature.min) {
            changes.push(new LocationStartChange({
                typeName: 'LocationStartChange',
                changedIds: [selectedDestinationFeature._id],
                featureId: selectedDestinationFeature._id,
                assembly: assembly.name,
                oldStart: selectedDestinationFeature.min,
                newStart: newMin,
            }));
        }
        if (newMax !== selectedDestinationFeature.max) {
            changes.push(new LocationEndChange({
                typeName: 'LocationEndChange',
                changedIds: [selectedDestinationFeature._id],
                featureId: selectedDestinationFeature._id,
                assembly: assembly.name,
                oldEnd: selectedDestinationFeature.max,
                newEnd: newMax,
            }));
        }
        for (const change of changes) {
            await submitChange(change);
        }
    };
    const submitChange = async (change, selectedFeatureId) => {
        await apolloSessionModel.apolloDataStore.changeManager
            .submit(change)
            .then(() => {
            // Selects the newly added/modified feature
            apolloSessionModel.apolloSetSelectedFeature(selectedFeatureId);
        });
    };
    const handleCreateNewGeneChange = (e) => {
        setCreateNewGene(e.target.checked);
    };
    return (jsxs(Dialog, { open: true, title: "Create Apollo Annotation", handleClose: handleClose, fullWidth: true, maxWidth: "sm", children: [jsx(DialogTitle, { fontSize: 15, children: "Select the feature to be copied to apollo track" }), jsxs(DialogContent, { children: [jsxs(Box, { sx: { ml: 3 }, children: [isGeneOrTranscript(annotationFeature, apolloSessionModel) && (jsx(FormControlLabel, { control: jsx(Checkbox, { size: "small", checked: parentFeatureChecked, onChange: handleParentFeatureCheck }), label: `${getFeatureNameOrId(annotationFeature)} (${annotationFeature.min + 1}..${annotationFeature.max})` })), annotationFeature.children && (jsx(Box, { sx: { display: 'flex', flexDirection: 'column', ml: 3 }, children: Object.values(annotationFeature.children)
                                    .filter((child) => isTranscript(child, apolloSessionModel))
                                    .map((child) => (jsx(FormControlLabel, { control: jsx(Checkbox, { size: "small", checked: checkedChildrens.includes(child._id), onChange: (e) => {
                                            handleChildFeatureCheck(e, child);
                                        } }), label: `${getFeatureNameOrId(child)} (${child.min + 1}..${child.max})` }, child._id))) }))] }), destinationFeatures.length > 0 &&
                        ((!parentFeatureChecked && checkedChildrens.length > 0) ||
                            (parentFeatureChecked &&
                                isTranscript(annotationFeature, apolloSessionModel))) && (jsxs("div", { style: {
                            border: '1px solid #ccc',
                            marginTop: 20,
                            padding: 10,
                            borderRadius: 5,
                        }, children: [jsxs(Box, { sx: { ml: 3 }, children: [jsx(Typography, { variant: "caption", fontSize: 12, children: "Select the destination feature to copy the selected features" }), jsx(Box, { sx: { mt: 1 }, children: jsx(Select, { labelId: "label", style: { width: '100%' }, value: selectedDestinationFeature?._id ?? '', onChange: handleDestinationFeatureChange, disabled: createNewGene, children: destinationFeatures.map((f) => (jsx(MenuItem, { value: f._id, children: `${getFeatureNameOrId(f)} (${f.min + 1}..${f.max})` }, f._id))) }) })] }), jsx(Box, { sx: { ml: 3 }, children: jsx(FormGroup, { children: jsx(FormControlLabel, { control: jsx(Checkbox, { checked: createNewGene, onChange: handleCreateNewGeneChange }), label: "Create new gene" }) }) })] }))] }), jsxs(DialogActions, { children: [jsx(Button, { variant: "contained", type: "submit", disabled: checkedChildrens.length === 0 ||
                            (!parentFeatureChecked &&
                                checkedChildrens.length > 0 &&
                                !selectedDestinationFeature), onClick: handleCreateApolloAnnotation, children: "Create" }), jsx(Button, { variant: "outlined", type: "submit", onClick: handleClose, children: "Cancel" })] }), errorMessage ? (jsx(DialogContent, { children: jsx(DialogContentText, { color: "error", children: errorMessage }) })) : null] }));
}

function parseCigar(cigar) {
    const regex = /(\d+)([MIDNSHPX=])/g;
    const result = [];
    let match;
    while ((match = regex.exec(cigar)) !== null) {
        result.push([match[2], Number.parseInt(match[1], 10)]);
    }
    return result;
}
function annotationFromPileup(pluggableElement) {
    if (pluggableElement.name !== 'LinearPileupDisplay') {
        return pluggableElement;
    }
    const { stateModel } = pluggableElement;
    const newStateModel = stateModel
        .views((self) => ({
        getFirstRegion() {
            const lgv = getContainingView(self);
            return lgv.dynamicBlocks.contentBlocks[0];
        },
        getAssembly() {
            const firstRegion = self.getFirstRegion();
            const session = getSession(self);
            const { assemblyManager } = session;
            const { assemblyName } = firstRegion;
            const assembly = assemblyManager.get(assemblyName);
            if (!assembly) {
                throw new Error(`Could not find assembly named ${assemblyName}`);
            }
            return assembly;
        },
        getRefSeqId(assembly) {
            const firstRegion = self.getFirstRegion();
            const { refName } = firstRegion;
            const { refNameAliases } = assembly;
            if (!refNameAliases) {
                throw new Error(`Could not find aliases for ${assembly.name}`);
            }
            const newRefNames = [...Object.entries(refNameAliases)]
                .filter(([id, refName]) => id !== refName)
                .map(([id, refName]) => ({
                _id: id,
                name: refName,
            }));
            const refSeqId = newRefNames.find((item) => item.name === refName)?._id;
            if (!refSeqId) {
                throw new Error(`Could not find refSeqId named ${refName}`);
            }
            return refSeqId;
        },
        getAnnotationFeature() {
            const feature = self.contextMenuFeature;
            const assembly = self.getAssembly();
            const refSeqId = self.getRefSeqId(assembly);
            const start = feature.get('start');
            const end = feature.get('end');
            const strand = feature.get('strand');
            const name = feature.get('name');
            const cigarData = feature.get('CIGAR');
            const ops = parseCigar(cigarData);
            let position = start;
            let currentExonStart;
            const exons = [];
            // Example: [[96,S], [4,M], [4216,N], [357,M], [1,I], [628,M], [94,S]]
            // Results in 2 exons
            // M, = and X are matches -> exon
            // N is a gap in the reference sequence -> intron
            // I, S, H and P -> not counted in reference position
            for (const [op, len] of ops) {
                switch (op) {
                    case 'M':
                    case '=':
                    case 'X': {
                        if (currentExonStart === undefined) {
                            currentExonStart = position;
                        }
                        position += len;
                        break;
                    }
                    case 'N': {
                        if (currentExonStart !== undefined) {
                            exons.push({
                                start: currentExonStart,
                                end: position,
                            });
                            currentExonStart = undefined;
                        }
                        position += len;
                        break;
                    }
                    case 'D': {
                        position += len;
                        break;
                    }
                    case 'I':
                    case 'S':
                    case 'H':
                    case 'P': {
                        // These operations do not affect the position in the reference sequence
                        break;
                    }
                    default: {
                        throw new Error(`Unknown CIGAR operation: ${op}`);
                    }
                }
            }
            // If still in exon at end
            if (currentExonStart !== undefined) {
                exons.push({
                    start: currentExonStart,
                    end: position,
                });
            }
            const newFeature = {
                _id: ObjectID().toHexString(),
                refSeq: refSeqId,
                min: start,
                max: end,
                type: 'mRNA',
                strand,
                attributes: {
                    name: [name],
                },
            };
            if (exons.length === 0) {
                return newFeature;
            }
            const children = {};
            newFeature.children = children;
            for (const exon of exons) {
                const newExon = {
                    _id: ObjectID().toHexString(),
                    refSeq: refSeqId,
                    min: exon.start,
                    max: exon.end,
                    type: 'exon',
                    strand,
                };
                newFeature.children[newExon._id] = newExon;
            }
            return newFeature;
        },
    }))
        .views((self) => {
        const superContextMenuItems = self.contextMenuItems;
        return {
            contextMenuItems() {
                const session = getSession(self);
                const assembly = self.getAssembly();
                const region = self.getFirstRegion();
                const feature = self.contextMenuFeature;
                if (!feature) {
                    return superContextMenuItems();
                }
                return [
                    ...superContextMenuItems(),
                    {
                        label: 'Create Apollo annotation',
                        icon: AddIcon,
                        onClick: () => {
                            session.queueDialog((doneCallback) => [
                                CreateApolloAnnotation,
                                {
                                    session,
                                    handleClose: () => {
                                        doneCallback();
                                    },
                                    annotationFeature: self.getAnnotationFeature(assembly),
                                    assembly,
                                    refSeqId: self.getRefSeqId(assembly),
                                    region,
                                },
                            ]);
                        },
                    },
                ];
            },
        };
    });
    pluggableElement.stateModel = newStateModel;
    return pluggableElement;
}

function simpleFeatureToGFF3Feature(feature, refSeqId) {
    const children = feature.get('subfeatures');
    const gff3Feature = [
        {
            start: feature.get('start') + 1,
            end: feature.get('end'),
            seq_id: refSeqId,
            source: feature.get('source') ?? null,
            type: feature.get('type') ?? null,
            score: feature.get('score') ?? null,
            strand: feature.get('strand')
                ? // eslint-disable-next-line unicorn/no-nested-ternary
                    feature.get('strand') === 1
                        ? '+'
                        : '-'
                : null,
            phase: feature.get('phase') !== null || feature.get('phase') !== undefined
                ? feature.get('phase')
                : null,
            attributes: convertFeatureAttributes(feature),
            derived_features: [],
            child_features: children
                ? children.map((x) => simpleFeatureToGFF3Feature(x, refSeqId))
                : [],
        },
    ];
    return gff3Feature;
}
function jbrowseFeatureToAnnotationFeature(feature, refSeqId) {
    return gff3ToAnnotationFeature(simpleFeatureToGFF3Feature(feature, refSeqId));
}
function convertFeatureAttributes(feature) {
    const attributes = {};
    const defaultFields = new Set([
        'start',
        'end',
        'type',
        'strand',
        'refName',
        'subfeatures',
        'derived_features',
        'phase',
        'source',
        'score',
    ]);
    for (const [key, value] of Object.entries(feature.toJSON())) {
        if (defaultFields.has(key)) {
            continue;
        }
        attributes[key] = Array.isArray(value) ? value.map(String) : [String(value)];
    }
    return attributes;
}
function annotationFromJBrowseFeature(pluggableElement) {
    if (pluggableElement.name !== 'LinearBasicDisplay') {
        return pluggableElement;
    }
    const { stateModel } = pluggableElement;
    const newStateModel = stateModel
        .views((self) => ({
        getFirstRegion() {
            const lgv = getContainingView(self);
            return lgv.dynamicBlocks.contentBlocks[0];
        },
        getAssembly() {
            const firstRegion = self.getFirstRegion();
            const session = getSession(self);
            const { assemblyManager } = session;
            const { assemblyName } = firstRegion;
            const assembly = assemblyManager.get(assemblyName);
            if (!assembly) {
                throw new Error(`Could not find assembly named ${assemblyName}`);
            }
            return assembly;
        },
        getRefSeqId(assembly) {
            const firstRegion = self.getFirstRegion();
            const { refName } = firstRegion;
            const { refNameAliases } = assembly;
            if (!refNameAliases) {
                throw new Error(`Could not find aliases for ${assembly.name}`);
            }
            const newRefNames = [...Object.entries(refNameAliases)]
                .filter(([id, refName]) => id !== refName)
                .map(([id, refName]) => ({
                _id: id,
                name: refName,
            }));
            const refSeqId = newRefNames.find((item) => item.name === refName)?._id;
            if (!refSeqId) {
                throw new Error(`Could not find refSeqId named ${refName}`);
            }
            return refSeqId;
        },
        getAnnotationFeature(assembly, feature) {
            const refSeqId = self.getRefSeqId(assembly);
            return jbrowseFeatureToAnnotationFeature(feature, refSeqId);
        },
    }))
        .views((self) => {
        const superContextMenuItems = self.contextMenuItems;
        return {
            contextMenuItems() {
                const session = getSession(self);
                const assembly = self.getAssembly();
                const region = self.getFirstRegion();
                const feature = self.contextMenuFeature;
                if (!feature) {
                    return superContextMenuItems();
                }
                return [
                    ...superContextMenuItems(),
                    {
                        label: 'Create Apollo annotation',
                        icon: AddIcon,
                        onClick: () => {
                            session.queueDialog((doneCallback) => [
                                CreateApolloAnnotation,
                                {
                                    session,
                                    handleClose: () => {
                                        doneCallback();
                                    },
                                    annotationFeature: self.getAnnotationFeature(assembly, feature),
                                    assembly,
                                    refSeqId: self.getRefSeqId(assembly),
                                    region,
                                },
                            ]);
                        },
                    },
                ];
            },
        };
    });
    pluggableElement.stateModel = newStateModel;
    return pluggableElement;
}

const CheckResultWarnings = observer(function CheckResultWarnings({ display, }) {
    const { classes } = useStyles$1();
    const { apolloDragging, apolloRowHeight, lgv, session, showCheckResults } = display;
    const { assemblyManager } = session;
    if (!showCheckResults) {
        return null;
    }
    return lgv.dynamicBlocks.contentBlocks.map((block) => {
        const widthBp = lgv.bpPerPx * apolloRowHeight;
        const assembly = assemblyManager.get(block.assemblyName);
        if (!assembly) {
            return null;
        }
        const filteredCheckResults = [
            ...session.apolloDataStore.checkResults.values(),
        ].filter((checkResult) => assembly.isValidRefName(checkResult.refSeq) &&
            assembly.getCanonicalRefName(checkResult.refSeq) === block.refName &&
            doesIntersect2(block.start, block.end, checkResult.start, checkResult.end));
        const checkResults = clusterResultByMessage(filteredCheckResults, widthBp);
        return checkResults.map((checkResult) => {
            const left = Math.round(getLeftPx(display, checkResult.range, block));
            const [feature] = checkResult.featureIds;
            if (!feature) {
                return null;
            }
            let row = 0;
            const featureLayout = display.getFeatureLayoutPosition(feature);
            if (featureLayout) {
                row = featureLayout.layoutRow + featureLayout.featureRow;
            }
            const top = row * apolloRowHeight;
            const height = apolloRowHeight;
            return (jsx(Tooltip, { title: checkResult.message, children: jsx(Box, { className: classes.box, style: {
                        top,
                        left,
                        height,
                        width: height,
                        pointerEvents: apolloDragging ? 'none' : 'auto',
                    }, children: jsx(Badge, { className: classes.badge, badgeContent: checkResult.count, color: "primary", overlap: "circular", anchorOrigin: { vertical: 'bottom', horizontal: 'right' }, invisible: checkResult.count <= 1, children: jsx(Avatar, { className: classes.avatar, children: jsx(ErrorIcon, { "data-testid": `ErrorIcon-${checkResult.start}` }) }) }) }) }, checkResult._id));
        });
    });
});

// Lock icon when isLocked === true
const LinearApolloDisplay = observer(function LinearApolloDisplay(props) {
    const theme = useTheme();
    const { model } = props;
    const { loading, contextMenuItems: getContextMenuItems, cursor, featuresHeight, isShown, onMouseDown, onMouseLeave, onMouseMove, onMouseUp, regionCannotBeRendered, session, setCanvas, setCollaboratorCanvas, setOverlayCanvas, setTheme, } = model;
    const { classes } = useStyles$1();
    const lgv = getContainingView(model);
    useEffect(() => {
        setTheme(theme);
    }, [theme, setTheme]);
    const [contextCoord, setContextCoord] = useState();
    const [contextMenuItems, setContextMenuItems] = useState([]);
    const message = regionCannotBeRendered();
    if (!isShown) {
        return null;
    }
    return (jsx(Fragment, { children: jsxs("div", { className: classes.canvasContainer, style: {
                width: lgv.dynamicBlocks.totalWidthPx,
                height: featuresHeight,
            }, onContextMenu: (event) => {
                event.preventDefault();
                if (contextMenuItems.length > 0) {
                    // There's already a context menu open, so close it
                    setContextMenuItems([]);
                }
                else {
                    const coord = [event.clientX, event.clientY];
                    setContextCoord(coord);
                    setContextMenuItems(getContextMenuItems(event));
                }
            }, children: [session.isLocked ? (jsx("div", { className: classes.locked, "data-testid": "lock-icon", children: jsx(LockIcon, {}) })) : null, loading ? (jsx("div", { className: classes.loading, children: jsx(CircularProgress, { size: "18px" }) })) : null, message ? (jsx(Alert, { severity: "warning", classes: { message: classes.ellipses }, slotProps: { root: { className: classes.center } }, children: jsx(Tooltip, { title: message, children: jsx("div", { children: message }) }) })) : (
                // Promise.resolve() in these 3 callbacks is to avoid infinite rendering loop
                // https://github.com/mobxjs/mobx/issues/3728#issuecomment-1715400931
                jsxs(Fragment, { children: [jsx("canvas", { ref: async (node) => {
                                await Promise.resolve();
                                setCollaboratorCanvas(node);
                            }, width: lgv.dynamicBlocks.totalWidthPx, height: featuresHeight, className: classes.canvas, "data-testid": "collaboratorCanvas" }), jsx("canvas", { ref: async (node) => {
                                await Promise.resolve();
                                setCanvas(node);
                            }, width: lgv.dynamicBlocks.totalWidthPx, height: featuresHeight, className: classes.canvas, "data-testid": "canvas" }), jsx("canvas", { ref: async (node) => {
                                await Promise.resolve();
                                setOverlayCanvas(node);
                            }, width: lgv.dynamicBlocks.totalWidthPx, height: featuresHeight, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave, onMouseDown: onMouseDown, onMouseUp: onMouseUp, className: classes.canvas, style: { cursor: cursor ?? 'default' }, "data-testid": "overlayCanvas" }), jsx(CheckResultWarnings, { display: model }), jsx(Menu$1, { open: contextMenuItems.length > 0, onMenuItemClick: (_, callback) => {
                                callback();
                                setContextMenuItems([]);
                            }, onClose: () => {
                                setContextMenuItems([]);
                            }, slotProps: {
                                transition: {
                                    onExit: () => {
                                        setContextMenuItems([]);
                                    },
                                },
                            }, anchorReference: "anchorPosition", anchorPosition: contextCoord
                                ? { top: contextCoord[1], left: contextCoord[0] }
                                : undefined, menuItems: contextMenuItems })] }))] }) }));
});

const TrackLines = observer(function TrackLines({ model, hrStyle = { margin: 0, top: 0, color: 'black' }, idx = 0, }) {
    const { apolloRowHeight, highestRow, showFeatureLabels } = model;
    const featureLabelSpacer = showFeatureLabels ? 2 : 1;
    return (jsx("div", { style: {
            position: 'absolute',
            left: 0,
            top: (apolloRowHeight * featureLabelSpacer * (highestRow + 1)) / 2 +
                idx * featureLabelSpacer * apolloRowHeight,
            width: '100%',
        }, children: jsx("hr", { style: hrStyle }) }));
});

const LinearApolloSixFrameDisplay = observer(function LinearApolloSixFrameDisplay(props, apolloDragging) {
    const theme = useTheme();
    const { model } = props;
    const { apolloRowHeight, contextMenuItems: getContextMenuItems, cursor, featuresHeight, geneTrackRowNums, isShown, onMouseDown, onMouseLeave, onMouseMove, onMouseUp, regionCannotBeRendered, session, setCanvas, setCollaboratorCanvas, setOverlayCanvas, setTheme, showCheckResults, showFeatureLabels, } = model;
    const { classes } = useStyles$1();
    const lgv = getContainingView(model);
    useEffect(() => {
        setTheme(theme);
    }, [theme, setTheme]);
    const [contextCoord, setContextCoord] = useState();
    const [contextMenuItems, setContextMenuItems] = useState([]);
    const message = regionCannotBeRendered();
    if (!isShown) {
        return null;
    }
    const { assemblyManager } = session;
    return (jsx(Fragment, { children: jsxs("div", { className: classes.canvasContainer, style: {
                width: lgv.dynamicBlocks.totalWidthPx,
                height: featuresHeight,
            }, onContextMenu: (event) => {
                event.preventDefault();
                if (contextMenuItems.length > 0) {
                    // There's already a context menu open, so close it
                    setContextMenuItems([]);
                }
                else {
                    const coord = [event.clientX, event.clientY];
                    setContextCoord(coord);
                    setContextMenuItems(getContextMenuItems(event));
                }
            }, children: [session.isLocked ? (jsx("div", { className: classes.locked, "data-testid": "lock-icon", children: jsx(LockIcon, {}) })) : null, message ? (jsx(Alert, { severity: "warning", classes: { message: classes.ellipses }, slotProps: { root: { className: classes.center } }, children: jsx(Tooltip, { title: message, children: jsx("div", { children: message }) }) })) : (
                // Promise.resolve() in these 3 callbacks is to avoid infinite rendering loop
                // https://github.com/mobxjs/mobx/issues/3728#issuecomment-1715400931
                jsxs(Fragment, { children: [jsx(TrackLines, { model: model, idx: 0 }), jsx(TrackLines, { model: model, hrStyle: { margin: 0, top: 0, color: 'grey', opacity: 0.4 }, idx: 1 }), jsx(TrackLines, { model: model, idx: 2 }), jsx("canvas", { ref: async (node) => {
                                await Promise.resolve();
                                setCollaboratorCanvas(node);
                            }, width: lgv.dynamicBlocks.totalWidthPx, height: featuresHeight, className: classes.canvas, "data-testid": "collaboratorCanvas" }), jsx("canvas", { ref: async (node) => {
                                await Promise.resolve();
                                setCanvas(node);
                            }, width: lgv.dynamicBlocks.totalWidthPx, height: featuresHeight, className: classes.canvas, "data-testid": "canvas" }), jsx("canvas", { ref: async (node) => {
                                await Promise.resolve();
                                setOverlayCanvas(node);
                            }, width: lgv.dynamicBlocks.totalWidthPx, height: featuresHeight, onMouseMove: onMouseMove, onMouseLeave: onMouseLeave, onMouseDown: onMouseDown, onMouseUp: onMouseUp, className: classes.canvas, style: { cursor: cursor ?? 'default' }, "data-testid": "overlayCanvas" }), lgv.displayedRegions.flatMap((region, idx) => {
                            const widthBp = lgv.bpPerPx * apolloRowHeight;
                            const assembly = assemblyManager.get(region.assemblyName);
                            if (showCheckResults) {
                                const filteredCheckResults = [
                                    ...session.apolloDataStore.checkResults.values(),
                                ].filter((checkResult) => assembly?.isValidRefName(checkResult.refSeq) &&
                                    assembly.getCanonicalRefName(checkResult.refSeq) ===
                                        region.refName &&
                                    doesIntersect2(region.start, region.end, checkResult.start, checkResult.end));
                                const checkResults = clusterResultByMessage(filteredCheckResults, widthBp);
                                return checkResults.map((checkResult) => {
                                    const left = (lgv.bpToPx({
                                        refName: region.refName,
                                        coord: checkResult.start,
                                        regionNumber: idx,
                                    })?.offsetPx ?? 0) - lgv.offsetPx;
                                    const [feature] = checkResult.featureIds;
                                    if (!feature || !feature.parent?.looksLikeGene) {
                                        return null;
                                    }
                                    let row;
                                    for (const loc of feature.cdsLocations) {
                                        for (const cds of loc) {
                                            const frame = getFrame(cds.min, cds.max, feature.strand ?? 1, cds.phase);
                                            const frameOffsets = showFeatureLabels
                                                ? [0, 5, 3, 1, 15, 13, 11]
                                                : [0, 2, 1, 0, 8, 7, 6];
                                            const rowNum = frameOffsets.at(frame);
                                            if (!rowNum) {
                                                continue;
                                            }
                                            if (checkResult.start >= cds.min &&
                                                checkResult.start <= cds.max) {
                                                row = rowNum - 1;
                                                break;
                                            }
                                        }
                                    }
                                    if (row === undefined) {
                                        const rowNum = feature.strand == 1
                                            ? geneTrackRowNums[0]
                                            : geneTrackRowNums[1];
                                        row = rowNum - 1;
                                    }
                                    const top = row * apolloRowHeight;
                                    const height = apolloRowHeight;
                                    return (jsx(Tooltip, { title: checkResult.message, children: jsx(Box, { className: classes.box, style: {
                                                top,
                                                left,
                                                height,
                                                width: height,
                                                pointerEvents: apolloDragging ? 'none' : 'auto',
                                            }, children: jsx(Badge, { className: classes.badge, badgeContent: checkResult.count, color: "primary", overlap: "circular", anchorOrigin: {
                                                    vertical: 'bottom',
                                                    horizontal: 'right',
                                                }, invisible: checkResult.count <= 1, children: jsx(Avatar, { className: classes.avatar, children: jsx(ErrorIcon, { "data-testid": `ErrorIcon-${checkResult.start}` }) }) }) }) }, checkResult._id));
                                });
                            }
                            return null;
                        }), jsx(Menu$1, { open: contextMenuItems.length > 0, onMenuItemClick: (_, callback) => {
                                callback();
                                setContextMenuItems([]);
                            }, onClose: () => {
                                setContextMenuItems([]);
                            }, slotProps: {
                                transition: {
                                    onExit: () => {
                                        setContextMenuItems([]);
                                    },
                                },
                            }, anchorReference: "anchorPosition", anchorPosition: contextCoord
                                ? { top: contextCoord[1], left: contextCoord[0] }
                                : undefined, style: { zIndex: theme.zIndex.tooltip }, menuItems: contextMenuItems })] }))] }) }));
});

const accordionControlHeight = 12;
const useStyles = makeStyles()((theme) => ({
    shading: {
        background: alpha(theme.palette.primary.main, 0.2),
        overflowX: 'hidden',
    },
    details: {
        background: theme.palette.background.paper,
    },
    accordionControl: {
        height: accordionControlHeight,
        width: '100%',
        '&:hover': {
            background: theme.palette.action.hover,
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    accordionRoot: {
        background: theme.palette.divider,
    },
    resizeHandle: {
        width: '100%',
        height: 4,
        position: 'absolute',
        cursor: 'row-resize',
        zIndex: 100,
    },
    expandIcon: {
    // position: 'relative',
    },
    title: {
        // position: 'relative',
        userSelect: 'none',
    },
    alertContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));
function scrollSelectedFeatureIntoView(model, scrollContainerRef) {
    const { apolloRowHeight, selectedFeature } = model;
    if (scrollContainerRef.current && selectedFeature) {
        const position = model.getFeatureLayoutPosition(selectedFeature);
        if (position) {
            const row = position.layoutRow + position.featureRow;
            const top = row * apolloRowHeight;
            scrollContainerRef.current.scroll({ top, behavior: 'smooth' });
        }
    }
}
const ResizeHandle = ({ onResize, }) => {
    const { classes } = useStyles();
    const mouseMove = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();
        onResize(event.movementY);
    }, [onResize]);
    return (
    // TODO: a11y
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    jsx("div", { onMouseDown: (event) => {
            event.stopPropagation();
            const controller = new AbortController();
            const { signal } = controller;
            function abortDrag() {
                controller.abort(new DOMException('Canceling drag event listener', 'AbortError'));
            }
            globalThis.addEventListener('mousemove', mouseMove, { signal });
            globalThis.addEventListener('mouseup', abortDrag, { signal });
            globalThis.addEventListener('mouseleave', abortDrag, { signal });
        }, onClick: (e) => {
            e.stopPropagation();
            e.preventDefault();
        }, className: classes.resizeHandle }));
};
const AccordionControl = observer(function AccordionControl({ onClick, onResize, open, title, }) {
    const { classes } = useStyles();
    return (jsxs("div", { className: classes.accordionRoot, children: [open && onResize ? jsx(ResizeHandle, { onResize: onResize }) : null, jsxs("div", { className: classes.accordionControl, onClick: onClick, children: [open ? (jsx(ExpandLessIcon, { className: classes.expandIcon })) : (jsx(ExpandMoreIcon, { className: classes.expandIcon })), title ? (jsx(Typography, { className: classes.title, variant: "caption", component: "span", children: title })) : null] })] }));
});
const LinearApolloDisplayComponent = observer(function DisplayComponent({ model, ...other }) {
    const session = getSession(model);
    const { ontologyManager } = session.apolloDataStore;
    const { featureTypeOntology } = ontologyManager;
    const ontologyStore = featureTypeOntology?.dataStore;
    const { classes } = useStyles();
    const { graphical, height: overallHeight, isShown, selectedFeature, table, tabularEditor, toggleShown, } = model;
    const canvasScrollContainerRef = useRef(null);
    useEffect(() => {
        scrollSelectedFeatureIntoView(model, canvasScrollContainerRef);
    }, [model, selectedFeature]);
    const onDetailsResize = (delta) => {
        model.setDetailsHeight(model.detailsHeight - delta);
    };
    if (!ontologyStore) {
        return (jsx("div", { className: classes.alertContainer, children: jsx(Alert, { severity: "error", children: "Could not load feature type ontology." }) }));
    }
    if (graphical && table) {
        const tabularHeight = tabularEditor.isShown ? model.detailsHeight : 0;
        const featureAreaHeight = isShown
            ? overallHeight - model.detailsHeight - accordionControlHeight * 2
            : 0;
        return (jsxs("div", { style: { height: overallHeight }, children: [jsx(AccordionControl, { open: isShown, title: "Graphical", onClick: toggleShown }), jsx("div", { className: classes.shading, ref: canvasScrollContainerRef, style: { height: featureAreaHeight }, children: jsx(LinearApolloDisplay, { model: model, ...other }) }), jsx(AccordionControl, { title: "Table", open: tabularEditor.isShown, onClick: tabularEditor.togglePane, onResize: onDetailsResize }), jsx("div", { className: classes.details, style: { height: tabularHeight }, children: jsx(TabularEditorPane, { model: model }) })] }));
    }
    if (graphical) {
        return (jsx("div", { className: classes.shading, ref: canvasScrollContainerRef, style: { height: overallHeight }, children: jsx(LinearApolloDisplay, { model: model, ...other }) }));
    }
    return (jsx("div", { className: classes.details, style: { height: overallHeight }, children: jsx(TabularEditorPane, { model: model }) }));
});
const LinearApolloSixFrameDisplayComponent = observer(function DisplayComponent({ model, ...other }) {
    const session = getSession(model);
    const { ontologyManager } = session.apolloDataStore;
    const { featureTypeOntology } = ontologyManager;
    const ontologyStore = featureTypeOntology?.dataStore;
    const { classes } = useStyles();
    const { detailsHeight, graphical, height: overallHeight, isShown, selectedFeature, table, tabularEditor, toggleShown, } = model;
    const canvasScrollContainerRef = useRef(null);
    useEffect(() => {
        scrollSelectedFeatureIntoView(model, canvasScrollContainerRef);
    }, [model, selectedFeature]);
    const onDetailsResize = (delta) => {
        model.setDetailsHeight(detailsHeight - delta);
    };
    if (!ontologyStore) {
        return (jsx("div", { className: classes.alertContainer, children: jsx(Alert, { severity: "error", children: "Could not load feature type ontology." }) }));
    }
    if (graphical && table) {
        const tabularHeight = tabularEditor.isShown ? detailsHeight : 0;
        const featureAreaHeight = isShown
            ? overallHeight - detailsHeight - accordionControlHeight * 2
            : 0;
        return (jsxs("div", { style: { height: overallHeight }, children: [jsx(AccordionControl, { open: isShown, title: "Graphical", onClick: toggleShown }), jsx("div", { className: classes.shading, ref: canvasScrollContainerRef, style: { height: featureAreaHeight }, children: jsx(LinearApolloSixFrameDisplay, { model: model, ...other }) }), jsx(AccordionControl, { title: "Table", open: tabularEditor.isShown, onClick: tabularEditor.togglePane, onResize: onDetailsResize }), jsx("div", { className: classes.details, style: { height: tabularHeight }, children: jsx(TabularEditorPane, { model: model }) })] }));
    }
    if (graphical) {
        return (jsx("div", { className: classes.shading, ref: canvasScrollContainerRef, style: { height: overallHeight }, children: jsx(LinearApolloSixFrameDisplay, { model: model, ...other }) }));
    }
    return (jsx("div", { className: classes.details, style: { height: overallHeight }, children: jsx(TabularEditorPane, { model: model }) }));
});

function addTopLevelMenus(rootModel) {
    rootModel.insertInMenu('Apollo', {
        label: 'Redo',
        icon: RedoIcon,
        onClick(session) {
            const { apolloDataStore } = session;
            void apolloDataStore.changeManager.redoLastChange();
        },
    }, 0);
    rootModel.insertInMenu('Apollo', {
        label: 'Undo',
        icon: UndoIcon,
        onClick(session) {
            const { apolloDataStore } = session;
            void apolloDataStore.changeManager.undoLastChange();
        },
    }, 0);
    rootModel.appendToMenu('Apollo', {
        label: 'Download GFF3',
        icon: DownloadIcon,
        onClick: (session) => {
            session.queueDialog((doneCallback) => [
                DownloadGFF3,
                {
                    session,
                    handleClose: () => {
                        doneCallback();
                    },
                },
            ]);
        },
    });
    rootModel.appendToMenu('Apollo', {
        label: 'View Change Log',
        icon: TrackChangesIcon,
        onClick: (session) => {
            session.queueDialog((doneCallback) => [
                ViewChangeLog,
                {
                    session,
                    handleClose: () => {
                        doneCallback();
                    },
                },
            ]);
        },
    });
    rootModel.appendToMenu('Apollo', {
        label: 'Open local GFF3 file',
        icon: FileOpenIcon,
        onClick: (session) => {
            session.queueDialog((doneCallback) => [
                OpenLocalFile,
                {
                    session,
                    handleClose: () => {
                        doneCallback();
                    },
                    inMemoryFileDriver: session.apolloDataStore.inMemoryFileDriver,
                },
            ]);
        },
    });
    rootModel.appendToMenu('Apollo', {
        label: 'View check results',
        icon: FactCheckIcon,
        onClick: (session) => {
            session.queueDialog((doneCallback) => [
                ViewCheckResults,
                {
                    session,
                    handleClose: () => {
                        doneCallback();
                    },
                },
            ]);
        },
    });
    rootModel.appendToMenu('Apollo', {
        label: 'Lock/Unlock session',
        onClick: (session) => {
            session.toggleLocked();
        },
    });
    rootModel.appendToMenu('Apollo', {
        label: 'Log out',
        icon: LogoutIcon,
        onClick: (session) => {
            session.queueDialog((doneCallback) => [
                LogOut,
                {
                    session,
                    handleClose: () => {
                        doneCallback();
                    },
                },
            ]);
        },
    });
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
const ApolloJobModel = types
    .model('JobsManager', {})
    .views((self) => ({
    get jobStatusWidget() {
        const { widgets } = getSession(self);
        let jobStatusWidget = widgets.get('JobsList');
        if (!jobStatusWidget) {
            // @ts-expect-error: addWidget function not detected on the session
            jobStatusWidget = getSession(self).addWidget('JobsListWidget', 'JobsList');
        }
        return jobStatusWidget;
    },
}))
    .actions((self) => ({
    /**
     * updates the status message and the progress percent of the provided job
     * @param jobName - the name of the job to be updated
     * @param statusMessage - the message to be communicated to the user
     * @param progressPct - the percent through the run the job is
     */
    update(jobName, statusMessage, progressPct) {
        self.jobStatusWidget.updateJobStatusMessage(jobName, statusMessage);
        if (progressPct) {
            self.jobStatusWidget.updateJobProgressPct(jobName, progressPct);
        }
    },
    /**
     * aborts the provided job with a message to the user
     * @param jobName - the name of the job to be aborted
     * @param msg - a message to communicate to the user about the abort operation
     */
    abortJob(jobName, msg) {
        const session = getSession(self);
        if (isSessionModelWithWidgets(session)) {
            session.showWidget(self.jobStatusWidget);
            self.jobStatusWidget.updateJobStatusMessage(jobName, msg ?? 'Aborted unexpectedly');
            // this is done to avoid issues with reusing nodes from other state trees
            const indx = self.jobStatusWidget.jobs.findIndex((job) => job.name === jobName);
            const job = self.jobStatusWidget.jobs[indx];
            // object needs to be shallow copied before it is removed from the state tree
            self.jobStatusWidget.addAbortedJob({ ...job });
            // removes the job from the state tree, this node is inaccessible thereafter
            self.jobStatusWidget.removeJob(jobName);
            session.notify('Job aborted', 'info');
        }
    },
    /**
     * opens the job status widget and adds the job to the running jobs
     * @param job - the job to be run within the JobsManager
     */
    runJob(job) {
        const session = getSession(self);
        if (isSessionModelWithWidgets(session)) {
            session.showWidget(self.jobStatusWidget);
            self.jobStatusWidget.addJob(job);
        }
    },
    /**
     * sets the progress and status message of the provided job
     * adds the finished jobs to the list of finished jobs
     * clears the jobs manager of the now done job
     * begins to run the next job if one is queued
     * @param job - the job to be completed
     */
    done(job) {
        const session = getSession(self);
        if (isSessionModelWithWidgets(session)) {
            session.showWidget(self.jobStatusWidget);
            // this.setProgressPct(100)
            self.jobStatusWidget.removeJob(job.name);
            self.jobStatusWidget.addFinishedJob({
                name: job.name,
                statusMessage: 'All operations successful',
                progressPct: 100,
                cancelCallback: job.cancelCallback,
            });
        }
    },
}));

function clientDataStoreFactory(AnnotationFeatureExtended) {
    return types
        .model('ClientDataStore', {
        typeName: types.optional(types.literal('Client'), 'Client'),
        assemblies: types.map(ApolloAssembly),
        checkResults: types.map(CheckResult),
        ontologyManager: types.optional(OntologyManagerType, {}),
    })
        .views((self) => ({
        get internetAccounts() {
            return getRoot(self).internetAccounts;
        },
        get pluginConfiguration() {
            return getRoot(self).jbrowse.configuration
                .ApolloPlugin;
        },
        getFeature(featureId) {
            return resolveIdentifier(AnnotationFeatureExtended, self.assemblies, featureId);
        },
    }))
        .actions((self) => ({
        addAssembly(assemblyId, backendDriverType) {
            const assemblySnapshot = {
                _id: assemblyId,
                refSeqs: {},
            };
            if (backendDriverType) {
                assemblySnapshot.backendDriverType = backendDriverType;
            }
            return self.assemblies.put(assemblySnapshot);
        },
    }))
        .actions((self) => ({
        addFeature(assemblyId, feature) {
            const session = getSession(self);
            const { assemblyManager } = session;
            let apolloAssembly = self.assemblies.get(assemblyId);
            if (!apolloAssembly) {
                // maybe it's a valid assembly that we haven't loaded yet
                const assembly = assemblyManager.get(assemblyId);
                if (!assembly) {
                    throw new Error(`Could not find assembly "${assemblyId}" to add feature "${feature._id}"`);
                }
                apolloAssembly = self.addAssembly(assemblyId);
            }
            let ref = apolloAssembly.refSeqs.get(feature.refSeq);
            if (!ref) {
                // maybe it's a valid refName that we haven't loaded yet
                const assembly = assemblyManager.get(assemblyId);
                if (!assembly) {
                    throw new Error(`Could not find assembly "${assemblyId}" to add feature "${feature._id}"`);
                }
                const canonicalRefName = assembly.getCanonicalRefName(feature.refSeq);
                if (!canonicalRefName) {
                    throw new Error(`Could not find refSeq "${feature.refSeq}" to add feature "${feature._id}"`);
                }
                ref = apolloAssembly.addRefSeq(feature.refSeq, canonicalRefName);
            }
            ref.features.put(feature);
        },
        deleteFeature(featureId) {
            const feature = self.getFeature(featureId);
            if (!feature) {
                throw new Error(`Could not find feature "${featureId}" to delete`);
            }
            const { _id, parent } = feature;
            if (parent) {
                parent.deleteChild(featureId);
            }
            else {
                const refSeq = getParentOfType(feature, ApolloRefSeq);
                refSeq.deleteFeature(_id);
            }
        },
        deleteAssembly(assemblyId) {
            self.assemblies.delete(assemblyId);
        },
        addCheckResult(checkResult) {
            self.checkResults.put(checkResult);
        },
        addCheckResults(checkResults) {
            for (const checkResult of checkResults) {
                if (!self.checkResults.has(checkResult._id)) {
                    self.checkResults.put(checkResult);
                }
            }
        },
        deleteCheckResult(checkResultId) {
            self.checkResults.delete(checkResultId);
        },
        clearCheckResults() {
            self.checkResults.clear();
        },
    }))
        .volatile((self) => ({
        changeManager: new ChangeManager(self),
        collaborationServerDriver: new CollaborationServerDriver(self),
        inMemoryFileDriver: new InMemoryFileDriver(self),
        desktopFileDriver: isElectron
            ? new DesktopFileDriver(self)
            : undefined,
    }))
        .actions((self) => ({
        afterCreate() {
            addDisposer(self, autorun(() => {
                // Merge in the ontologies from our plugin configuration.
                // Ontologies of a given name that are already in the session
                // take precedence over the ontologies in the configuration.
                const { ontologyManager, pluginConfiguration } = self;
                const configuredOntologies = pluginConfiguration.ontologies;
                for (const ont of configuredOntologies || []) {
                    const [name, version, source, indexFields] = [
                        readConfObject(ont, 'name'),
                        readConfObject(ont, 'version'),
                        readConfObject(ont, 'source'),
                        readConfObject(ont, 'textIndexFields'),
                    ];
                    if (!ontologyManager.findOntology(name)) {
                        const session = getSession(self);
                        const { jobsManager } = session;
                        const controller = new AbortController();
                        const jobName = `Loading ontology "${name}"`;
                        const job = {
                            name: jobName,
                            statusMessage: `Loading ontology "${name}", version "${version}", this may take a while`,
                            progressPct: 0,
                            cancelCallback: () => {
                                controller.abort(new DOMException(`Canceling loading of ontology "${name}"`, 'AbortError'));
                                jobsManager.abortJob(job.name);
                            },
                        };
                        const update = (message, progress) => {
                            if (progress === 0) {
                                jobsManager.runJob(job);
                                return;
                            }
                            if (progress === 100) {
                                jobsManager.done(job);
                                return;
                            }
                            jobsManager.update(jobName, message, progress);
                            return;
                        };
                        ontologyManager.addOntology(name, version, source, {
                            textIndexing: { indexFields },
                            update,
                        });
                    }
                }
                // TODO: add in any configured ontology prefixes that we don't already
                // have in the session (or hardcoded in the model)
            }));
        },
    }))
        .views((self) => ({
        getBackendDriver(assemblyId) {
            const session = getSession(self);
            const { assemblyManager } = session;
            const assembly = assemblyManager.get(assemblyId);
            if (!assembly) {
                return;
            }
            const { file, internetAccountConfigId } = getConf(assembly, [
                'sequence',
                'metadata',
            ]);
            if (isElectron && file) {
                return self.desktopFileDriver;
            }
            if (internetAccountConfigId) {
                return self.collaborationServerDriver;
            }
            return self.inMemoryFileDriver;
        },
        getInternetAccount(assemblyName, internetAccountId) {
            if (!(assemblyName ?? internetAccountId)) {
                throw new Error('Must provide either assemblyName or internetAccountId');
            }
            let configId = internetAccountId;
            if (assemblyName && !configId) {
                const { assemblyManager } = getSession(self);
                const assembly = assemblyManager.get(assemblyName);
                if (!assembly) {
                    throw new Error(`No assembly found with name ${assemblyName}`);
                }
                ({ internetAccountConfigId: configId } = getConf(assembly, [
                    'sequence',
                    'metadata',
                ]));
            }
            const { internetAccounts } = self;
            const internetAccount = internetAccounts.find((ia) => ia.internetAccountId === configId);
            if (!internetAccount) {
                throw new Error(`No InternetAccount found with config id ${internetAccountId}`);
            }
            return internetAccount;
        },
    }))
        .actions((self) => ({
        loadFeatures: flow(function* loadFeatures(regions) {
            for (const region of regions) {
                const backendDriver = self.getBackendDriver(region.assemblyName);
                if (!backendDriver) {
                    return;
                }
                const [features, checkResults] = (yield backendDriver.getFeatures(region));
                if (features.length === 0) {
                    continue;
                }
                const { assemblyName, refName } = region;
                let assembly = self.assemblies.get(assemblyName);
                if (!assembly) {
                    assembly = self.assemblies.put({ _id: assemblyName, refSeqs: {} });
                }
                const [firstFeature] = features;
                let ref = assembly.refSeqs.get(firstFeature.refSeq);
                if (!ref) {
                    ref = assembly.refSeqs.put({
                        _id: firstFeature.refSeq,
                        name: refName,
                        features: {},
                    });
                }
                for (const feature of features) {
                    if (!ref.features.has(feature._id)) {
                        ref.features.put(feature);
                    }
                }
                self.addCheckResults(checkResults);
            }
        }),
        loadRefSeq: flow(function* loadRefSeq(regions) {
            for (const region of regions) {
                const backendDriver = self.getBackendDriver(region.assemblyName);
                if (!backendDriver) {
                    return;
                }
                const { refSeq, seq } = yield backendDriver.getSequence(region);
                const { assemblyName, end, refName, start } = region;
                let assembly = self.assemblies.get(assemblyName);
                if (!assembly) {
                    assembly = self.assemblies.put({ _id: assemblyName, refSeqs: {} });
                }
                let ref = assembly.refSeqs.get(refSeq);
                if (!ref) {
                    ref = assembly.refSeqs.put({
                        _id: refSeq,
                        name: refName,
                        sequence: [],
                    });
                }
                ref.addSequence({ start, stop: end, sequence: seq });
            }
        }),
    }));
}

function extendSession(pluginManager, sessionModel) {
    const AnnotationFeatureExtended = pluginManager.evaluateExtensionPoint('Apollo-extendAnnotationFeature', AnnotationFeatureModel);
    const ClientDataStore = clientDataStoreFactory(AnnotationFeatureExtended);
    const sm = sessionModel
        .props({
        apolloDataStore: types.optional(ClientDataStore, { typeName: 'Client' }),
        apolloSelectedFeature: types.safeReference(AnnotationFeatureExtended),
        jobsManager: types.optional(ApolloJobModel, {}),
        isLocked: types.optional(types.boolean, false),
        changeInProgress: types.optional(types.boolean, false),
    })
        .volatile(() => ({
        apolloHoveredFeature: undefined,
        abortController: new AbortController(),
    }))
        .extend(() => {
        const collabs = observable.array([]);
        return {
            views: {
                get collaborators() {
                    return collabs;
                },
            },
            actions: {
                addOrUpdateCollaborator(collaborator) {
                    const existingCollaborator = collabs.find((obj) => obj.id === collaborator.id);
                    if (existingCollaborator) {
                        existingCollaborator.locations = collaborator.locations;
                    }
                    else {
                        collabs.push(collaborator);
                    }
                },
            },
        };
    })
        .actions((self) => ({
        apolloSetSelectedFeature(feature) {
            // @ts-expect-error Not sure why TS thinks these MST types don't match
            self.apolloSelectedFeature = feature;
        },
        apolloSetHoveredFeature(feature) {
            self.apolloHoveredFeature = feature;
        },
        addApolloTrackConfig(assembly, baseURL) {
            const trackId = `apollo_track_${assembly.name}`;
            const hasTrack = self.tracks.some((track) => track.trackId === trackId);
            if (!hasTrack) {
                self.addTrackConf({
                    type: 'ApolloTrack',
                    trackId,
                    name: `Annotations (${
                    // @ts-expect-error getConf types don't quite work here for some reason
                    getConf(assembly, 'displayName') || assembly.name})`,
                    assemblyNames: [assembly.name],
                    textSearching: {
                        textSearchAdapter: {
                            type: 'ApolloTextSearchAdapter',
                            trackId,
                            assemblyNames: [assembly.name],
                            textSearchAdapterId: `apollo_search_${assembly.name}`,
                            ...(baseURL
                                ? { baseURL: { uri: baseURL, locationType: 'UriLocation' } }
                                : {}),
                        },
                    },
                });
            }
        },
        toggleLocked() {
            self.isLocked = !self.isLocked;
        },
        setChangeInProgress(changeInProgress) {
            self.changeInProgress = changeInProgress;
        },
        getPluginConfiguration() {
            const { jbrowse } = getRoot(self);
            const pluginConfiguration = 
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            jbrowse.configuration.ApolloPlugin;
            return pluginConfiguration;
        },
        broadcastLocations() {
            const { internetAccounts } = getRoot(self);
            const locations = [];
            for (const view of self.views) {
                if (view.type !== 'LinearGenomeView') {
                    return;
                }
                const lgv = view;
                if (lgv.initialized) {
                    const { dynamicBlocks } = lgv;
                    for (const block of dynamicBlocks.contentBlocks) {
                        const { assemblyName, end, refName, start } = block;
                        const assembly = self.apolloDataStore.assemblies.get(assemblyName);
                        if (assembly &&
                            assembly.backendDriverType === 'CollaborationServerDriver') {
                            locations.push({ assemblyName, refName, start, end });
                        }
                    }
                }
            }
            if (locations.length === 0) {
                for (const internetAccount of internetAccounts) {
                    if ('baseURL' in internetAccount) {
                        internetAccount.postUserLocation([]);
                    }
                }
                return;
            }
            const allLocations = [];
            for (const internetAccount of internetAccounts) {
                if ('baseURL' in internetAccount) {
                    for (const location of locations) {
                        const tmpLoc = {
                            assemblyId: location.assemblyName,
                            refSeq: location.refName,
                            start: location.start,
                            end: location.end,
                        };
                        allLocations.push(tmpLoc);
                    }
                    internetAccount.postUserLocation(allLocations);
                }
            }
        },
    }))
        .actions((self) => ({
        apolloSetEventualSelectedFeature: flow$1(function* apolloSetEventualSelectedFeature(featureId) {
            yield when(() => Boolean(self.apolloDataStore.getFeature(featureId)));
            self.apolloSetSelectedFeature(featureId);
        }),
    }))
        .volatile((self) => ({
        previousSnapshot: getSnapshot(self),
    }))
        .actions((self) => ({
        afterCreate() {
            applySnapshot(self, { name: self.name, id: self.id });
            // @ts-expect-error type is missing on ApolloRootModel
            const { internetAccounts, jbrowse, reloadPluginManagerCallback } = getRoot(self);
            addDisposer(self, autorun(() => {
                // broadcastLocations() // **** This is not working and therefore we need to duplicate broadcastLocations() -method code here because autorun() does not observe changes otherwise
                const locations = [];
                for (const view of self
                    .views) {
                    if (view.type !== 'LinearGenomeView') {
                        return;
                    }
                    const lgv = view;
                    if (lgv.initialized) {
                        const { dynamicBlocks } = lgv;
                        for (const block of dynamicBlocks.contentBlocks) {
                            const { assemblyName, end, refName, start } = block;
                            const assembly = self.apolloDataStore.assemblies.get(assemblyName);
                            if (assembly &&
                                assembly.backendDriverType === 'CollaborationServerDriver') {
                                locations.push({ assemblyName, refName, start, end });
                            }
                        }
                    }
                }
                if (locations.length === 0) {
                    for (const internetAccount of internetAccounts) {
                        if ('baseURL' in internetAccount) {
                            internetAccount.postUserLocation([]);
                        }
                    }
                    return;
                }
                const allLocations = [];
                for (const internetAccount of internetAccounts) {
                    if ('baseURL' in internetAccount) {
                        for (const location of locations) {
                            const tmpLoc = {
                                assemblyId: location.assemblyName,
                                refSeq: location.refName,
                                start: location.start,
                                end: location.end,
                            };
                            allLocations.push(tmpLoc);
                        }
                        internetAccount.postUserLocation(allLocations);
                    }
                }
            }, { name: 'ApolloSessionBroadcastLocations' }));
            addDisposer(self, autorun(async (reaction) => {
                // When the initial config.json loads, it doesn't include the Apollo
                // tracks, which would result in a potentially invalid session snapshot
                // if any tracks are open. Here we copy the session snapshot, apply an
                // empty session snapshot, and then restore the original session
                // snapshot after the updated config.json loads.
                const pluginConfiguration = 
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                jbrowse.configuration.ApolloPlugin;
                const hasRole = readConfObject(pluginConfiguration, 'hasRole');
                if (hasRole) {
                    // @ts-expect-error not sure why snapshot type is wrong for snapshot
                    applySnapshot(self, self.previousSnapshot);
                    reaction.dispose();
                    return;
                }
                const { signal } = self.abortController;
                // fetch and initialize assemblies for each of our Apollo internet accounts
                for (const internetAccount of internetAccounts) {
                    if (internetAccount.type !== 'ApolloInternetAccount') {
                        continue;
                    }
                    const { baseURL } = internetAccount;
                    const uri = new URL('jbrowse/config.json', baseURL).href;
                    const fetch = internetAccount.getFetcher({
                        locationType: 'UriLocation',
                        uri,
                    });
                    let response;
                    try {
                        response = await fetch(uri, { signal });
                    }
                    catch (error) {
                        if (!self.abortController.signal.aborted) {
                            console.error(error);
                        }
                        continue;
                    }
                    if (!response.ok) {
                        const errorMessage = await createFetchErrorMessage(response, 'Failed to fetch assemblies');
                        console.error(errorMessage);
                        continue;
                    }
                    let jbrowseConfig;
                    try {
                        jbrowseConfig = await response.json();
                    }
                    catch (error) {
                        console.error(error);
                        continue;
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    if (!jbrowseConfig.configuration.ApolloPlugin.hasRole) {
                        continue;
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    reloadPluginManagerCallback(jbrowseConfig, self.previousSnapshot);
                    reaction.dispose();
                }
            }, { name: 'ApolloSessionLoadConfig' }));
        },
        beforeDestroy() {
            self.abortController.abort(new DOMException('Clean up Apollo session', 'AbortError'));
        },
    }))
        .views((self) => {
        const superTrackActionMenuItems = self.getTrackActionMenuItems;
        return {
            getTrackActionMenuItems(conf) {
                if (conf.type === 'ApolloTrack' ||
                    conf.type === 'ReferenceSequenceTrack') {
                    return superTrackActionMenuItems?.(conf);
                }
                const trackId = readConfObject(conf, 'trackId');
                const sessionTrackIdentifier = '-sessionTrack';
                const isSessionTrack = trackId.endsWith(sessionTrackIdentifier);
                return isSessionTrack
                    ? [
                        ...(superTrackActionMenuItems?.(conf) ?? []),
                        {
                            label: 'Save track to Apollo',
                            onClick: async () => {
                                const { internetAccounts, jbrowse } = getRoot(self);
                                const currentConfig = getSnapshot(jbrowse);
                                let filteredConfig;
                                filteredConfig = filterJBrowseConfig(currentConfig);
                                if (Object.keys(filteredConfig).length === 0) {
                                    filteredConfig = undefined;
                                }
                                const trackConfigSnapshot = getSnapshot(conf);
                                const newTrackId = trackId.slice(0, trackId.length - sessionTrackIdentifier.length);
                                const newTrackConfigSnapshot = {
                                    ...trackConfigSnapshot,
                                    trackId: newTrackId,
                                };
                                for (const internetAccount of internetAccounts) {
                                    if (internetAccount.type !== 'ApolloInternetAccount') {
                                        continue;
                                    }
                                    const change = new ImportJBrowseConfigChange({
                                        typeName: 'ImportJBrowseConfigChange',
                                        oldJBrowseConfig: filteredConfig,
                                        newJBrowseConfig: {
                                            ...filteredConfig,
                                            // @ts-expect-error The track types are in the snapshot
                                            tracks: filteredConfig?.tracks && [
                                                ...filteredConfig.tracks,
                                                newTrackConfigSnapshot,
                                            ],
                                        },
                                    });
                                    const { internetAccountId } = internetAccount;
                                    await self.apolloDataStore.changeManager.submit(change, {
                                        internetAccountId,
                                    });
                                    const { notify } = self;
                                    notify('Track added', 'success');
                                }
                                // @ts-expect-error This method is missing in the JB types
                                self.deleteTrackConf(conf);
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                jbrowse.addTrackConf(newTrackConfigSnapshot);
                            },
                            icon: SaveIcon,
                        },
                    ]
                    : [
                        ...(superTrackActionMenuItems?.(conf) ?? []),
                        {
                            label: 'Remove track from Apollo',
                            onClick: async () => {
                                const { internetAccounts, jbrowse } = getRoot(self);
                                const currentConfig = getSnapshot(jbrowse);
                                let filteredConfig;
                                filteredConfig = filterJBrowseConfig(currentConfig);
                                if (Object.keys(filteredConfig).length === 0) {
                                    filteredConfig = undefined;
                                }
                                const filteredTracks = filteredConfig?.tracks?.filter((t) => t.trackId !== trackId);
                                for (const internetAccount of internetAccounts) {
                                    if (internetAccount.type !== 'ApolloInternetAccount') {
                                        continue;
                                    }
                                    const change = new ImportJBrowseConfigChange({
                                        typeName: 'ImportJBrowseConfigChange',
                                        oldJBrowseConfig: filteredConfig,
                                        newJBrowseConfig: {
                                            ...filteredConfig,
                                            tracks: filteredTracks,
                                        },
                                    });
                                    const { internetAccountId } = internetAccount;
                                    await self.apolloDataStore.changeManager.submit(change, {
                                        internetAccountId,
                                    });
                                    const { notify } = self;
                                    notify('Track removed', 'success');
                                }
                                // @ts-expect-error This method is missing in the JB types
                                self.deleteTrackConf(conf);
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                jbrowse.deleteTrackConf(conf);
                            },
                            icon: SaveIcon,
                        },
                    ];
            },
        };
    });
    return types.snapshotProcessor(sm, {
        postProcessor(snap, node) {
            snap.apolloSelectedFeature = undefined;
            const assemblies = Object.fromEntries(Object.entries(snap.apolloDataStore.assemblies).filter(([, assembly]) => assembly.backendDriverType === 'InMemoryFileDriver'));
            // @ts-expect-error ontologyManager isn't actually required
            snap.apolloDataStore = {
                typeName: 'Client',
                assemblies,
                checkResults: {},
            };
            if (!node) {
                return snap;
            }
            const { apolloDataStore } = node;
            const { checkResults } = apolloDataStore;
            for (const [, cr] of checkResults) {
                const [feature] = cr.ids;
                if (!feature) {
                    continue;
                }
                const assembly = apolloDataStore.assemblies.get(feature.assemblyId);
                if (assembly && assembly.backendDriverType === 'InMemoryFileDriver') {
                    snap.apolloDataStore.checkResults[cr._id] = getSnapshot(cr);
                }
            }
            return snap;
        },
    });
}

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
function isApolloMessageData(data) {
    return (typeof data === 'object' &&
        data !== null &&
        'apollo' in data &&
        data.apollo === true);
}
const inWebWorker = 'WorkerGlobalScope' in globalThis;
for (const [changeName, change] of Object.entries(changes)) {
    changeRegistry.registerChange(changeName, change);
}
const cdsCheck = new CDSCheck();
checkRegistry.registerCheck(cdsCheck.name, cdsCheck);
const transcriptCheck = new TranscriptCheck();
checkRegistry.registerCheck(transcriptCheck.name, transcriptCheck);
validationRegistry.registerValidation(new CoreValidation());
validationRegistry.registerValidation(new ParentChildValidation());
class ApolloPlugin extends Plugin {
    name = 'ApolloPlugin';
    version = version;
    configurationSchema = ApolloPluginConfigurationSchema;
    install(pluginManager) {
        installApolloSequenceAdapter(pluginManager);
        installApolloRefNameAliasAdapter(pluginManager);
        installApolloTextSearchAdapter(pluginManager);
        pluginManager.addWidgetType(() => {
            const configSchema = ConfigurationSchema('ApolloFeatureDetailsWidget', {});
            const widgetType = new WidgetType({
                name: 'ApolloFeatureDetailsWidget',
                heading: 'Apollo feature details',
                configSchema,
                stateModel: ApolloFeatureDetailsWidgetModel,
                ReactComponent: ApolloFeatureDetailsWidget,
            });
            return widgetType;
        });
        pluginManager.addWidgetType(() => {
            const configSchema = ConfigurationSchema('ApolloTranscriptDetails', {});
            const widgetType = new WidgetType({
                name: 'ApolloTranscriptDetails',
                heading: 'Apollo transcript details',
                configSchema,
                stateModel: ApolloTranscriptDetailsModel,
                ReactComponent: ApolloTranscriptDetailsWidget,
            });
            return widgetType;
        });
        pluginManager.addTrackType(() => {
            const configSchema = ConfigurationSchema('ApolloTrack', { adapter: '' }, {
                baseConfiguration: createBaseTrackConfig(pluginManager),
                explicitIdentifier: 'trackId',
            });
            return new TrackType({
                name: 'ApolloTrack',
                configSchema,
                stateModel: createBaseTrackModel(pluginManager, 'ApolloTrack', configSchema),
            });
        });
        pluginManager.addInternetAccountType(() => {
            return new InternetAccountType({
                name: 'ApolloInternetAccount',
                configSchema: ApolloConfigSchema,
                stateModel: stateModelFactory$3(ApolloConfigSchema),
            });
        });
        pluginManager.addDisplayType(() => {
            const configSchema = configSchema$2;
            return new DisplayType({
                name: 'LinearApolloDisplay',
                configSchema,
                stateModel: stateModelFactory$2(pluginManager, configSchema),
                trackType: 'ApolloTrack',
                viewType: 'LinearGenomeView',
                ReactComponent: LinearApolloDisplayComponent,
            });
        });
        pluginManager.addDisplayType(() => {
            const configSchema$1 = configSchema;
            return new DisplayType({
                name: 'LinearApolloSixFrameDisplay',
                configSchema: configSchema$1,
                stateModel: stateModelFactory(pluginManager, configSchema$1),
                trackType: 'ApolloTrack',
                viewType: 'LinearGenomeView',
                ReactComponent: LinearApolloSixFrameDisplayComponent,
            });
        });
        pluginManager.addDisplayType(() => {
            const configSchema = configSchema$1;
            return new DisplayType({
                name: 'LinearApolloReferenceSequenceDisplay',
                configSchema,
                stateModel: stateModelFactory$1(pluginManager, configSchema),
                displayName: 'Apollo reference sequence display',
                trackType: 'ReferenceSequenceTrack',
                viewType: 'LinearGenomeView',
                ReactComponent: LinearApolloReferenceSequenceDisplay,
            });
        });
        pluginManager.addToExtensionPoint('Core-extendSession', 
        // @ts-expect-error not sure how to deal with snapshot model types
        extendSession.bind(this, pluginManager));
        pluginManager.addToExtensionPoint('Core-extendPluggableElement', (pluggableElement) => {
            if (pluggableElement.name === 'LinearGenomeView') {
                const { stateModel } = pluggableElement;
                const lgv = stateModel;
                const newStateModel = lgv.views((self) => {
                    const superRubberBandMenuItems = self.rubberBandMenuItems;
                    return {
                        rubberBandMenuItems() {
                            return [
                                ...superRubberBandMenuItems(),
                                {
                                    label: 'Add new feature',
                                    icon: AddIcon,
                                    onClick: () => {
                                        const session = getSession(self);
                                        const { leftOffset, rightOffset } = self;
                                        const selectedRegions = self.getSelectedRegions(leftOffset, rightOffset);
                                        session.queueDialog((doneCallback) => [
                                            AddFeature,
                                            {
                                                session,
                                                handleClose: () => {
                                                    doneCallback();
                                                },
                                                region: selectedRegions[0],
                                                changeManager: session.apolloDataStore.changeManager,
                                            },
                                        ]);
                                    },
                                },
                            ];
                        },
                    };
                });
                pluggableElement.stateModel = newStateModel;
            }
            return pluggableElement;
        });
        pluginManager.addToExtensionPoint('Core-extendPluggableElement', annotationFromPileup);
        pluginManager.addToExtensionPoint('Core-extendPluggableElement', annotationFromJBrowseFeature);
        pluginManager.addToExtensionPoint('LinearGenomeView-searchResultSelected', (_, props) => {
            const { session, result } = props;
            const trackId = result.getTrackId();
            const matchedFeature = result.matchedObject;
            if (trackId?.startsWith('apollo_track_') && matchedFeature) {
                const geneFeature = matchedFeature;
                void session.apolloSetEventualSelectedFeature(geneFeature._id);
            }
            /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
            return _;
        });
        if (!inWebWorker) {
            pluginManager.addToExtensionPoint('Core-extendWorker', (handle) => {
                if (!('on' in handle && handle.on)) {
                    return handle;
                }
                handle.on('apollo', async (event) => {
                    if (!isApolloMessageData(event)) {
                        return;
                    }
                    const { apollo, messageId, method } = event;
                    switch (method) {
                        case 'getSequence': {
                            const { region } = event;
                            const { assemblyName } = region;
                            const dataStore = pluginManager.rootModel?.session?.apolloDataStore;
                            if (!dataStore) {
                                break;
                            }
                            const backendDriver = dataStore.getBackendDriver(assemblyName);
                            if (!backendDriver) {
                                break;
                            }
                            const { seq: sequence } = await backendDriver.getSequence(region);
                            handle.workers[0].postMessage({
                                apollo,
                                messageId,
                                sequence,
                            });
                            break;
                        }
                        case 'getRegions': {
                            const { assembly } = event;
                            const dataStore = pluginManager.rootModel?.session?.apolloDataStore;
                            if (!dataStore) {
                                break;
                            }
                            const backendDriver = dataStore.getBackendDriver(assembly);
                            if (!backendDriver) {
                                break;
                            }
                            const regions = await backendDriver.getRegions(assembly);
                            handle.workers[0].postMessage({
                                apollo,
                                messageId,
                                regions,
                            });
                            break;
                        }
                        case 'getRefNameAliases': {
                            const { assembly } = event;
                            const dataStore = pluginManager.rootModel?.session?.apolloDataStore;
                            if (!dataStore) {
                                break;
                            }
                            const backendDriver = dataStore.getBackendDriver(assembly);
                            if (!backendDriver) {
                                break;
                            }
                            const refNameAliases = await backendDriver.getRefNameAliases(assembly);
                            handle.workers[0].postMessage({
                                apollo,
                                messageId,
                                refNameAliases,
                            });
                            break;
                        }
                    }
                });
                return handle;
            });
        }
    }
    configure(pluginManager) {
        if (isAbstractMenuManager(pluginManager.rootModel)) {
            pluginManager.jexl.addFunction('geneBackgroundColor', (featureType) => {
                if (featureType === 'pseudogene') {
                    return alpha('rgb(148, 203, 236)', 0.6);
                }
                if (featureType === 'ncRNA_gene') {
                    return alpha('rgb(194, 106, 119)', 0.6);
                }
                return;
            });
            addTopLevelMenus(pluginManager.rootModel);
        }
    }
}

export { ApolloPlugin as default };
//# sourceMappingURL=index.esm.js.map
