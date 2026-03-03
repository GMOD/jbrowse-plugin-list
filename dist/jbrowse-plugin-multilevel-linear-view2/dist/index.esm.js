import Plugin from '@jbrowse/core/Plugin';
import { getSession, measureText, isSessionWithAddTracks, bpToPx, clamp, parseLocString, getContainingView, isAbstractMenuManager } from '@jbrowse/core/util';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import { types, cast, addDisposer, onAction, getPath, getEnv } from 'mobx-state-tree';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import MenuIcon from '@mui/icons-material/Menu';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import BaseViewModel from '@jbrowse/core/pluggableElementTypes/models/BaseViewModel';
import { ReturnToImportFormDialog, ErrorMessage, AssemblySelector, createJBrowseTheme } from '@jbrowse/core/ui';
import { ElementId } from '@jbrowse/core/util/types/mst';
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import { Typography, Tooltip, TextField, FormGroup, Button, IconButton as IconButton$1, Container, Grid, CircularProgress, MenuItem } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import CascadingMenu from '@jbrowse/core/ui/CascadingMenu';
import { usePopupState, bindTrigger, bindPopover } from 'material-ui-popup-state/hooks';
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter';
import CloseIcon from '@mui/icons-material/Close';
import BaseResult from '@jbrowse/core/TextSearch/BaseResults';
import { RefNameAutocomplete } from '@jbrowse/plugin-linear-genome-view';
import { ThemeProvider } from '@emotion/react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';

function stateModelFactory$1(pluginManager) {
    const defaultHeight = 400;
    return types
        .compose('MultilevelLinearView', BaseViewModel, types.model({
        id: ElementId,
        type: types.literal('MultilevelLinearView'),
        height: defaultHeight,
        trackSelectorType: 'hierarchical',
        linkViews: false,
        interactToggled: false,
        isDescending: true,
        tracks: types.array(pluginManager.pluggableMstType('track', 'stateModel')),
        views: types.array(pluginManager.getViewType('LinearGenomeMultilevelView')
            .stateModel),
    }))
        .volatile(() => ({
        headerHeight: 0,
        width: 800,
    }))
        .views((self) => ({
        get initialized() {
            return self.views.length > 0;
        },
        get refNames() {
            return self.views.map((v) => [
                ...new Set(v.staticBlocks.map((m) => m.refName)),
            ]);
        },
        get assemblyNames() {
            return [...new Set(self.views.map((v) => v.assemblyNames).flat())];
        },
        get numViews() {
            return self.views.length;
        },
    }))
        .actions((self) => ({
        setLimitBpPerPx() {
            let prev = -1;
            let next = 1;
            self.views.forEach((view) => {
                if ((prev === -1 && self.isDescending) ||
                    (next === self.views.length && !self.isDescending)) {
                    // @ts-ignore
                    view.setLimitBpPerPx(true, view.bpPerPx, view.bpPerPx);
                }
                if ((next === self.views.length && self.isDescending) ||
                    (prev === -1 && !self.isDescending)) {
                    // @ts-ignore
                    view.setLimitBpPerPx(false, view.bpPerPx, view.bpPerPx);
                }
                if (prev !== -1 && next !== self.views.length) {
                    let upperLimit;
                    let lowerLimit;
                    if (self.isDescending) {
                        upperLimit = self.views[prev].bpPerPx;
                        lowerLimit = self.views[next].bpPerPx;
                    }
                    else {
                        upperLimit = self.views[next].bpPerPx;
                        lowerLimit = self.views[prev].bpPerPx;
                    }
                    const apexUpperLimit = self.views.find(
                    // @ts-ignore
                    (view) => view.isOverview)?.bpPerPx;
                    const apexLowerLimit = self.views.find(
                    // @ts-ignore
                    (view) => view.isAnchor)?.bpPerPx;
                    // @ts-ignore
                    view.setLimitBpPerPx(true, upperLimit, lowerLimit, apexUpperLimit, apexLowerLimit);
                }
                prev++;
                next++;
            });
        },
        setViews(views) {
            self.views = cast(views);
        },
    }))
        .actions((self) => ({
        afterAttach() {
            addDisposer(self, onAction(self, (param) => {
                if (self.linkViews) {
                    const { name, path, args } = param;
                    const actions = [
                        'horizontalScroll',
                        'zoomTo',
                        'navToLocString',
                        'setScaleFactor',
                        'showTrack',
                        'hideTrack',
                        'toggleTrack',
                        'moveIfAnchor',
                    ];
                    if (actions.includes(name) && path) {
                        this.onSubviewAction(name, path, args);
                    }
                }
            }));
        },
        // automatically removes session assemblies associated with this view
        // e.g. read vs ref
        beforeDestroy() {
            const session = getSession(self);
            self.assemblyNames.forEach((name) => {
                if (name.endsWith('-temp')) {
                    session.removeAssembly?.(name);
                }
            });
        },
        onSubviewAction(actionName, path, args = []) {
            // @ts-ignore
            const anchorViewIndex = self.views.findIndex((view) => view.isAnchor);
            // @ts-ignore
            const overviewIndex = self.views.findIndex((view) => view.isOverview);
            if (actionName === 'horizontalScroll') {
                self.views.forEach((view) => {
                    if (view.initialized) {
                        // scroll is proportionate to the view's relation to the anchor view
                        const movement = view.bpPerPx !== 0
                            ? args[0] *
                                (self.views[anchorViewIndex].bpPerPx / view.bpPerPx)
                            : 0;
                        // @ts-ignore
                        view[actionName](movement);
                        const ret = getPath(view);
                        // reverse action for the view you're scrolling on
                        if (ret.lastIndexOf(path) === ret.length - path.length) {
                            // @ts-ignore
                            view[actionName](args[0] * -1);
                        }
                    }
                });
            }
            if (actionName === 'zoomTo') {
                // When zooming on a sub view, we want to force zoom its neighbours if there's a collision
                const actingIndex = parseInt(path.charAt(path.length - 1));
                const actingView = self.views[actingIndex];
                let offset = 1;
                let currentView = self.views[actingIndex];
                const isZoomIn = actingView.bpPerPx < args[0] ? false : true;
                actingView.zoomTo(args[0]);
                // @ts-ignore
                while (offset > 0) {
                    if (isZoomIn) {
                        const neighbour = self.isDescending
                            ? self.views[actingIndex + offset]
                            : self.views[actingIndex - offset];
                        if (neighbour && currentView.bpPerPx <= neighbour.bpPerPx) {
                            if (
                            // @ts-ignore
                            !neighbour.isAnchor &&
                                // @ts-ignore
                                !neighbour.isOverview &&
                                neighbour.bpPerPx / 2 >=
                                    // @ts-ignore
                                    neighbour.limitBpPerPx.apexLowerLimit) {
                                neighbour.zoomTo(neighbour.bpPerPx / 2);
                                offset++;
                                currentView = neighbour;
                            }
                            else {
                                offset = -1;
                            }
                        }
                        else {
                            offset = -1;
                        }
                    }
                    else {
                        const neighbour = self.isDescending
                            ? self.views[actingIndex - offset]
                            : self.views[actingIndex + offset];
                        if (neighbour && currentView.bpPerPx >= neighbour.bpPerPx) {
                            if (
                            // @ts-ignore
                            !neighbour.isAnchor &&
                                // @ts-ignore
                                !neighbour.isOverview &&
                                neighbour.bpPerPx * 2 <=
                                    // @ts-ignore
                                    neighbour.limitBpPerPx.apexUpperLimit) {
                                neighbour.zoomTo(neighbour.bpPerPx * 2);
                                offset++;
                                currentView = neighbour;
                            }
                            else {
                                offset = -1;
                            }
                        }
                        else {
                            offset = -1;
                        }
                    }
                }
                self.setLimitBpPerPx();
            }
            if (actionName === 'navToLocString') {
                self.views[anchorViewIndex][actionName](args[0]);
                self.views.forEach((view) => {
                    if (view.initialized) {
                        // @ts-ignore
                        view.setLimitBpPerPx(false);
                    }
                });
                self.views.forEach((view) => {
                    if (view.initialized) {
                        // @ts-ignore
                        if (!view.isAnchor) {
                            const center = self.views[anchorViewIndex].pxToBp(view.width / 2);
                            const targetBp = view.bpPerPx !== 0
                                ? self.views[anchorViewIndex].bpPerPx /
                                    // @ts-ignore
                                    (self.views[anchorViewIndex].limitBpPerPx.upperLimit /
                                        view.bpPerPx)
                                : 0;
                            view.navToLocString(center.refName);
                            view.zoomTo(targetBp);
                            view.centerAt(center.coord, center.refName, center.index);
                        }
                        // @ts-ignore
                        if (view.isOverview) {
                            const center = self.views[anchorViewIndex].pxToBp(view.width / 2);
                            view.centerAt(center.coord, center.refName, center.index);
                        }
                    }
                });
                this.resetZooms();
                this.alignViews();
                self.setLimitBpPerPx();
            }
            if (actionName === 'moveIfAnchor') {
                self.views.forEach((view) => {
                    if (view.initialized) {
                        // @ts-ignore
                        view.moveIfAnchor(args[0], args[1]);
                        // @ts-ignore
                        view.setLimitBpPerPx(false);
                    }
                });
                self.views.forEach((view) => {
                    if (view.initialized) {
                        // @ts-ignore
                        if (!view.isAnchor && !view.isOverview) {
                            const center = self.views[anchorViewIndex].pxToBp(view.width / 2);
                            const targetBp = view.bpPerPx !== 0
                                ? self.views[anchorViewIndex].bpPerPx /
                                    // @ts-ignore
                                    (self.views[anchorViewIndex].limitBpPerPx.upperLimit /
                                        view.bpPerPx)
                                : 0;
                            view.navToLocString(center.refName);
                            view.zoomTo(targetBp);
                            view.centerAt(center.coord, center.refName, center.index);
                        }
                    }
                });
                self.setLimitBpPerPx();
                // center the overview
                const center = self.views[anchorViewIndex].pxToBp(self.views[overviewIndex].width / 2);
                self.views[overviewIndex].navToLocString(center.refName);
                self.views[overviewIndex].centerAt(center.coord, center.refName, center.index);
            }
        },
        setWidth(newWidth) {
            self.width = newWidth;
            self.views.forEach((v) => v.setWidth(newWidth));
        },
        setHeight(newHeight) {
            self.height = newHeight;
        },
        insertView(location, view) {
            self.views.spliceWithArray(location, 0, [view]);
        },
        setHeaderHeight(height) {
            self.headerHeight = height;
        },
        setIsDescending(toggle) {
            self.isDescending = toggle;
        },
        toggleLinkViews() {
            self.linkViews = !self.linkViews;
        },
        // realign sub views to the anchor view
        alignViews() {
            // @ts-ignore
            const anchorViewIndex = self.views.findIndex((view) => view.isAnchor);
            self.views.forEach((view) => {
                const center = self.views[anchorViewIndex].pxToBp(view.width / 2);
                const targetBp = view.bpPerPx;
                view.navToLocString(center.refName);
                view.zoomTo(targetBp);
                view.centerAt(center.coord, center.refName, center.index);
            });
        },
        reverseViewsDirection() {
            this.setIsDescending(!self.isDescending);
            self.views.reverse();
        },
        // reset the zoom levels of sub views within one stage of the anchor
        resetZooms() {
            let reversed = false;
            if (self.isDescending) {
                this.reverseViewsDirection();
                reversed = true;
            }
            // @ts-ignore
            const anchor = self.views.find((view) => view.isAnchor);
            let zoomVal = anchor?.bpPerPx ? anchor?.bpPerPx : 1;
            let num = 2;
            self.views.forEach((view) => {
                view.zoomTo(zoomVal);
                zoomVal *= num;
                num++;
            });
            if (reversed) {
                this.reverseViewsDirection();
            }
        },
        clearView() {
            self.views = cast([]);
            self.linkViews = false;
        },
        removeView(target) {
            const session = getSession(self);
            const pluginManager = getEnv(session);
            // cannot remove the anchor or the overview -- needs to have minimum these two views
            if (target.isAnchor === false && target.isOverview === false) {
                self.views.remove(target);
                session.notify(`A view has been closed`, 'info', {
                    name: 'undo',
                    onClick: () => {
                        pluginManager.rootModel.history.undo();
                    },
                });
            }
        },
    }))
        .actions((self) => ({
        async addView(isAbove, neighbour) {
            const { assemblyManager } = getSession(self);
            const assembly = await assemblyManager.waitForAssembly(self.assemblyNames[0]);
            if (assembly) {
                let bp = isAbove
                    ? self.isDescending
                        ? neighbour.limitBpPerPx.upperLimit
                        : neighbour.limitBpPerPx.lowerLimit
                    : self.isDescending
                        ? neighbour.limitBpPerPx.lowerLimit
                        : neighbour.limitBpPerPx.upperLimit;
                // @ts-ignore
                const anchor = self.views.find((view) => view.isAnchor);
                // @ts-ignore
                if (bp < anchor?.bpPerPx) {
                    // @ts-ignore
                    bp = anchor.bpPerPx;
                }
                let newView = {
                    type: 'LinearGenomeMultilevelView',
                    bpPerPx: bp,
                    offsetPx: 0,
                    displayedRegions: assembly.regions,
                };
                if (neighbour.isOverview) {
                    // @ts-ignore
                    neighbour.toggleIsOverview();
                    const offset = anchor?.offsetPx;
                    newView = {
                        ...newView,
                        // @ts-ignore
                        isOverview: true,
                        offsetPx: offset ? offset : 0,
                    };
                }
                if ((neighbour.isAnchor && !isAbove) ||
                    (neighbour.isAnchor && isAbove && !self.isDescending)) {
                    // @ts-ignore
                    neighbour.toggleIsAnchor();
                    // @ts-ignore
                    neighbour.setLimitBpPerPx(true);
                    const offset = neighbour?.offsetPx;
                    newView = {
                        ...newView,
                        // @ts-ignore
                        isAnchor: true,
                        offsetPx: offset,
                        limitBpPerPx: { limited: false, upperLimit: 1, lowerLimit: 0 },
                    };
                }
                const loc = isAbove
                    ? self.views.findIndex((view) => view.id === neighbour.id)
                    : self.views.findIndex((view) => view.id === neighbour.id) + 1;
                self.insertView(loc, newView);
                self.setWidth(self.width);
                self.setLimitBpPerPx();
                self.alignViews();
            }
        },
    }))
        .views((self) => ({
        menuItems() {
            const menuItems = [];
            menuItems.push({
                label: 'Return to import form',
                onClick: () => {
                    getSession(self).queueDialog((handleClose) => [
                        ReturnToImportFormDialog,
                        { model: self, handleClose },
                    ]);
                },
                icon: FolderOpenIcon,
            }, {
                label: 'Reverse views direction',
                icon: SwapVertIcon,
                onClick: self.reverseViewsDirection,
            }, {
                label: 'Align views',
                onClick: self.alignViews,
                icon: FormatAlignCenterIcon,
            }, {
                label: self.linkViews ? 'Unlink views' : 'Link views',
                onClick: self.toggleLinkViews,
                icon: self.linkViews ? LinkOffIcon : LinkIcon,
            });
            const subMenuItems = [];
            self.views.forEach((view, idx) => {
                if (view.menuItems?.()) {
                    const label = view.displayName
                        ? `${view.displayName} Menu`
                        : `View ${idx + 1} Menu`;
                    subMenuItems.push({
                        label: label,
                        subMenu: view.menuItems(),
                    });
                }
            });
            if (subMenuItems.length > 0) {
                menuItems.push({
                    label: 'View Menus',
                    subMenu: subMenuItems,
                    icon: MenuIcon,
                });
            }
            return menuItems;
        },
    }))
        .views((self) => {
        return {
            searchScope(assemblyName) {
                return {
                    assemblyName,
                    includeAggregateIndexes: true,
                    tracks: self.tracks,
                };
            },
            rankSearchResults(results) {
                // order of rank
                const openTrackIds = self.tracks.map((track) => track.configuration.trackId);
                results.forEach((result) => {
                    if (openTrackIds.length !== 0) {
                        if (openTrackIds.includes(result.trackId)) {
                            result.updateScore(result.getScore() + 1);
                        }
                    }
                });
                return results;
            },
        };
    });
}

const useStyles$3 = makeStyles()((theme) => ({
    guide: {
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: 10,
    },
}));
const AreaOfInterest = observer(({ model, view, polygonPoints, }) => {
    const { classes } = useStyles$3();
    const { left, right } = polygonPoints;
    const theme = useTheme();
    // @ts-ignore
    const { tertiary, primary } = theme.palette;
    const polygonColor = tertiary ? tertiary.light : primary.light;
    const width = Math.max(!isNaN(right) ? right - left : 0, 3);
    const labelOffset = view.trackLabels === 'offset' ? view.tracks.length * 25 : 0;
    const height = view.tracks.length === 0
        ? view.hideHeader
            ? view.height + 55
            : view.height - 12
        : view.hideHeader
            ? view.height + (view.tracks.length - 1) * 4 + labelOffset
            : view.height - 55 - 12 + (view.tracks.length - 1) * 4 + labelOffset;
    // @ts-ignore
    const anchorView = model.views.find((view) => view.isAnchor);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: classes.guide, style: {
                left,
                width,
                height,
                background: alpha(polygonColor, 0.2),
            } }),
        React.createElement(Typography, { className: classes.guide, variant: "caption", style: {
                paddingLeft: '1px',
                left,
                height,
                width,
                color: polygonColor,
            } }, anchorView?.displayName)));
});

const MAX_WIDTH = 100;
const MIN_WIDTH = 100;
const LabelField = observer(({ model }) => {
    const [displayName, setDisplayName] = useState(model.displayName ? model.displayName : '');
    const determineWidth = () => {
        const width = measureText(model.displayName, 15) < MAX_WIDTH
            ? measureText(model.displayName, 15) > MIN_WIDTH
                ? measureText(model.displayName, 15)
                : MIN_WIDTH
            : MAX_WIDTH;
        return width;
    };
    const [inputWidth, setInputWidth] = useState(determineWidth());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setViewLabel = (label) => {
        setDisplayName(label);
        model.setDisplayName(label);
        setInputWidth(determineWidth());
    };
    useEffect(() => {
        setDisplayName(model.displayName ? model.displayName : '');
    }, [model.displayName]);
    return (React.createElement(Tooltip, { title: "Rename view", arrow: true },
        React.createElement(React.Fragment, null,
            React.createElement(TextField, { variant: "standard", value: displayName, size: "small", margin: "none", style: { margin: '0px', paddingRight: '5px' }, 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange: (event) => setViewLabel(event?.target.value), InputProps: {
                    style: {
                        width: `${inputWidth}px`,
                        height: `25px`,
                        padding: '0px',
                    },
                } }))));
});

const RegionWidth = observer(({ model }) => {
    const { coarseTotalBp } = model;
    return (React.createElement(Typography, { variant: "body2", color: "textSecondary", style: {
            display: 'flex',
            alignItems: 'center',
            marginLeft: 10,
        } },
        Math.round(coarseTotalBp).toLocaleString('en-US'),
        " bp"));
});

const MiniControls = observer((props) => {
    const { model } = props;
    const { bpPerPx, maxBpPerPx, minBpPerPx, scaleFactor } = model;
    const popupState = usePopupState({
        popupId: 'mllvViewMenu',
        variant: 'popover',
    });
    return (React.createElement("div", { style: { position: 'absolute', right: '0px', zIndex: '1001' } },
        React.createElement(Paper, { style: { background: '#aaa7', display: 'flex', alignItems: 'center' } },
            React.createElement("div", null,
                React.createElement(IconButton, { ...bindTrigger(popupState), color: "secondary", "data-testid": "mllv-minicontrols-menu" },
                    React.createElement(MenuIcon, null)),
                React.createElement(CascadingMenu, { ...bindPopover(popupState), onMenuItemClick: (_, callback) => callback(), menuItems: model.menuItems(), popupState: popupState }),
                React.createElement(LabelField, { model: model })),
            React.createElement("div", null,
                React.createElement(RegionWidth, { model: model })),
            React.createElement("div", { "data-testid": "mllv-minicontrols" },
                // @ts-ignore
                model.limitBpPerPx.limited &&
                    // @ts-ignore
                    bpPerPx * 2 > model.limitBpPerPx.apexUpperLimit ? (React.createElement(Tooltip, { title: "This view is at its max zoom level relative to its neighbouring views", arrow: true },
                    React.createElement("span", null,
                        React.createElement(IconButton, { disabled: true, "data-testid": "zoom_out" },
                            React.createElement(ZoomOut, null))))) : (React.createElement(IconButton, { "data-testid": "zoom_out", onClick: () => {
                        model.zoom(bpPerPx * 2);
                    }, disabled: bpPerPx >= maxBpPerPx - 0.0001 || scaleFactor !== 1, color: "secondary" },
                    React.createElement(ZoomOut, null))),
                // @ts-ignore
                model.isOverview ||
                    // @ts-ignore
                    (model.limitBpPerPx.limited &&
                        // @ts-ignore
                        bpPerPx / 2 < model.limitBpPerPx.apexLowerLimit) ? (React.createElement(Tooltip, { title: "This view is at its min zoom level relative to its neighbouring views", arrow: true },
                    React.createElement("span", null,
                        React.createElement(IconButton, { disabled: true, "data-testid": "zoom_in" },
                            React.createElement(ZoomIn, null))))) : (React.createElement(IconButton, { "data-testid": "zoom_in", onClick: () => {
                        model.zoom(model.bpPerPx / 2);
                    }, disabled: bpPerPx <= minBpPerPx + 0.0001 || scaleFactor !== 1, color: "secondary" },
                    React.createElement(ZoomIn, null)))))));
});

const WIDGET_HEIGHT = 32;
const SPACING = 7;
const HEADER_BAR_HEIGHT = 48;
const useStyles$2 = makeStyles()((theme) => ({
    headerBar: {
        gridArea: '1/1/auto/span 2',
        display: 'flex',
        alignItems: 'center',
        height: HEADER_BAR_HEIGHT,
    },
    spacer: {
        flexGrow: 1,
    },
    headerForm: {
        flexWrap: 'nowrap',
        marginRight: 7,
    },
    toggleButton: {
        height: 44,
        border: 'none',
        margin: theme.spacing(0.5),
    },
    searchContainer: {
        marginLeft: 5,
    },
    searchBox: {
        display: 'flex',
    },
    buttonSpacer: {
        marginRight: theme.spacing(2),
    },
    panButton: {
        background: alpha(theme.palette.background.paper, 0.8),
        height: WIDGET_HEIGHT,
        margin: SPACING,
    },
}));
const Polygon = observer(({ view, polygonPoints, }) => {
    const { dynamicBlocks } = view;
    const { contentBlocks } = dynamicBlocks;
    const { left, right, prevLeft, prevRight } = polygonPoints;
    const theme = useTheme();
    // @ts-ignore
    const { tertiary, primary } = theme.palette;
    const polygonColor = tertiary ? tertiary.light : primary.light;
    if (!contentBlocks.length) {
        return null;
    }
    const points = [
        [left, HEADER_BAR_HEIGHT],
        [right, HEADER_BAR_HEIGHT],
        [prevRight, 0],
        [prevLeft, 0],
    ];
    return (React.createElement("polygon", { points: points.toString(), fill: alpha(polygonColor, 0.2), stroke: alpha(polygonColor, 0.8), "data-testid": "polygon" }));
});
function PanControls({ model }) {
    const { classes } = useStyles$2();
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, { variant: "outlined", className: classes.panButton, onClick: () => model.slide(-0.9), "data-testid": "panleft" },
            React.createElement(ArrowBackIcon, null)),
        React.createElement(Button, { variant: "outlined", className: classes.panButton, onClick: () => model.slide(0.9), "data-testid": "panright" },
            React.createElement(ArrowForwardIcon, null))));
}
const Controls = observer(({ view, model, polygonPoints, ExtraControls, }) => {
    const { classes } = useStyles$2();
    const pluginManager = getEnv(getSession(model)).pluginManager;
    const LGV = pluginManager.getPlugin('LinearGenomeViewPlugin');
    // @ts-ignore
    const { SearchBox } = LGV.exports;
    return (React.createElement("div", { className: classes.headerBar },
        model.views[0].id !== view.id ? (React.createElement("svg", { height: HEADER_BAR_HEIGHT, style: { width: '100%', position: 'absolute' } },
            React.createElement(Polygon, { view: view, polygonPoints: polygonPoints }))) : null,
        React.createElement("div", { className: classes.spacer }),
        view.isVisible && !view.hideControls && !view.isAnchor ? (React.createElement(React.Fragment, null,
            React.createElement(FormGroup, { row: true, className: classes.headerForm },
                React.createElement(PanControls, { model: view }),
                React.createElement(SearchBox, { model: view })),
            React.createElement(RegionWidth, { model: view }),
            ExtraControls)) : null,
        React.createElement("div", { className: classes.spacer }),
        !view.isVisible ? React.createElement(MiniControls, { model: view }) : null));
});

const Subheader = observer(({ model, view, polygonPoints, }) => {
    return (React.createElement("div", { "data-testid": "subheader" },
        React.createElement(Controls, { model: model, view: view, polygonPoints: polygonPoints })));
});

const LinkViews = observer(({ model }) => {
    return (React.createElement(IconButton$1, { onClick: model.toggleLinkViews, title: "Toggle linked scrolls and behavior across views", "data-testid": "link_views" }, model.linkViews ? (React.createElement(LinkOffIcon, { color: "secondary" })) : (React.createElement(LinkIcon, { color: "secondary" }))));
});
const AlignViews = observer(({ model }) => {
    return (React.createElement(IconButton$1, { onClick: model.alignViews, title: "Align views (realign sub views to the anchor view)", "data-testid": "align_views" },
        React.createElement(AlignHorizontalCenterIcon, { color: "secondary" })));
});
const ResetZooms = observer(({ model }) => {
    return (React.createElement(IconButton$1, { onClick: model.resetZooms, title: "Reset sub view zoom levels within one stage of the anchor view", "data-testid": "zoom_views" },
        React.createElement(FormatAlignCenterIcon, { color: "secondary" })));
});
const Header = observer(({ model, ExtraButtons, }) => {
    const theme = useTheme();
    const { primary } = theme.palette;
    const colour = primary.light;
    // @ts-ignore
    const anchorView = model?.views?.find((view) => view.isAnchor);
    const pluginManager = getEnv(getSession(model)).pluginManager;
    const LGV = pluginManager.getPlugin('LinearGenomeViewPlugin');
    // @ts-ignore
    const { ZoomControls, SearchBox } = LGV.exports;
    return (React.createElement("div", null, model?.initialized && anchorView?.initialized ? (React.createElement("div", { style: {
            gridArea: '1/1/auto/span 2',
            display: 'flex',
            alignItems: 'center',
            height: 48,
            background: alpha(colour, 0.3),
        } },
        React.createElement(LinkViews, { model: model }),
        React.createElement(AlignViews, { model: model }),
        React.createElement(ResetZooms, { model: model }),
        React.createElement("div", { style: { flexGrow: 1 } }),
        React.createElement(FormGroup, { row: true, style: { flexWrap: 'nowrap', marginRight: 7 } },
            React.createElement(PanControls, { model: anchorView }),
            React.createElement(SearchBox, { model: anchorView })),
        React.createElement(RegionWidth, { model: anchorView }),
        React.createElement(ZoomControls, { model: anchorView }),
        React.createElement("div", { style: { flexGrow: 1 } }))) : null));
});

const useStyles$1 = makeStyles()((theme) => ({
    importFormContainer: {
        padding: theme.spacing(4),
    },
    formPaper: {
        margin: '0 auto',
        padding: 12,
        marginBottom: 10,
    },
}));
const ImportForm = observer(({ model }) => {
    const { classes } = useStyles$1();
    const session = getSession(model);
    const { assemblyNames, assemblyManager } = session;
    const [selected, setSelected] = useState([assemblyNames[0]]);
    const [numViews, setNumViews] = useState('2');
    const [order, setOrder] = useState('Descending');
    const [error, setError] = useState();
    const assemblyError = assemblyNames.length
        ? selected
            .map((a) => assemblyManager.get(a)?.error)
            .filter((f) => !!f)
            .join(', ')
        : 'No configured assemblies';
    const [myOption, setOption] = useState();
    const assembly = assemblyManager.get(selected[0]);
    const regions = assembly?.regions || [];
    const option = myOption ||
        new BaseResult({
            label: regions[0]?.refName,
        });
    const selectedRegion = option?.getLocation() || option?.getLabel();
    useEffect(() => {
        const num = parseInt(numViews, 10);
        if (!Number.isNaN(num)) {
            if (num > 1) {
                if (num <= 10) {
                    setSelected(Array(num).fill(assemblyNames[0]));
                }
                else {
                    setNumViews('10');
                }
            }
            else {
                setNumViews('2');
            }
        }
    }, [numViews, assemblyNames]);
    useEffect(() => {
        model.setIsDescending(order === 'Descending' ? true : false);
    }, [order, model]);
    // gets a string as input, or use stored option results from previous query,
    // then re-query and
    // 1) if it has multiple results: pop a dialog
    // 2) if it's a single result navigate to it
    // 3) else assume it's a locstring and navigate to it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function handleSelectedRegion(input, model) {
        if (!option) {
            return;
        }
        let trackId = option.getTrackId();
        let location = input || option.getLocation() || '';
        try {
            if (assembly?.allRefNames?.includes(location)) {
                model.navToLocString(location, selected[0]);
            }
            else {
                const results = await fetchResults(input, 'exact');
                if (results && results.length > 1) {
                    model.setSearchResults(results, input.toLowerCase());
                    return;
                }
                else if (results?.length === 1) {
                    location = results[0].getLocation();
                    trackId = results[0].getTrackId();
                }
                model.navToLocString(location, selected[0]);
                if (trackId) {
                    model.showTrack(trackId);
                }
            }
        }
        catch (e) {
            console.error(e);
            session.notify(`${e}`, 'warning');
        }
    }
    async function onOpenClick() {
        try {
            if (!isSessionWithAddTracks(session)) {
                return;
            }
            model.setViews(
            // @ts-ignore
            await Promise.all(selected.map(async (selection) => {
                const assembly = await assemblyManager.waitForAssembly(selection);
                if (!assembly) {
                    throw new Error(`Assembly ${selection} failed to load`);
                }
                return {
                    type: 'LinearGenomeMultilevelView',
                    bpPerPx: 1,
                    offsetPx: 0,
                    displayedRegions: assembly.regions,
                };
            })));
            if (model.isDescending) {
                const anchorViewIndex = model.views.length - 1;
                const overviewIndex = 0;
                let zoomVal = 0;
                let num = model.views.length - 1;
                let index = 0;
                model.views.forEach((view) => {
                    view.setWidth(model.width);
                    if (selectedRegion) {
                        handleSelectedRegion(selectedRegion, view);
                    }
                    if (view.id === model.views[overviewIndex].id) {
                        zoomVal = view.maxBpPerPx;
                        // @ts-ignore
                        view.toggleIsOverview();
                        view.setDisplayName('Overview');
                    }
                    else if (view.id === model.views[anchorViewIndex].id) {
                        zoomVal = 1;
                        // @ts-ignore
                        view.toggleIsAnchor();
                        view.setDisplayName('Details');
                    }
                    else {
                        zoomVal = (model.views.length - index) * num;
                    }
                    view.zoomTo(zoomVal);
                    num--;
                    index++;
                });
            }
            else {
                // ascending
                const overviewIndex = model.views.length - 1;
                const anchorViewIndex = 0;
                let zoomVal = 1;
                let num = 2;
                model.views.forEach((view) => {
                    view.setWidth(model.width);
                    if (selectedRegion) {
                        handleSelectedRegion(selectedRegion, view);
                    }
                    if (view.id === model.views[anchorViewIndex].id) {
                        // @ts-ignore
                        view.toggleIsAnchor();
                        view.setDisplayName('Details');
                    }
                    if (view.id === model.views[overviewIndex].id) {
                        zoomVal = view.maxBpPerPx;
                        // @ts-ignore
                        view.toggleIsOverview();
                        view.setDisplayName('Overview');
                    }
                    view.zoomTo(zoomVal);
                    zoomVal *= num;
                    num++;
                });
            }
            model.setLimitBpPerPx();
            model.toggleLinkViews();
        }
        catch (e) {
            console.error(e);
            setError(e);
        }
    }
    async function fetchResults(query, searchType) {
        const { textSearchManager } = session;
        if (!textSearchManager) {
            console.warn('No text search manager');
        }
        const textSearchResults = await textSearchManager?.search({
            queryString: query,
            searchType,
        }, model.searchScope(selected[0]), model.rankSearchResults);
        const refNameResults = assembly?.allRefNames
            ?.filter((refName) => refName.startsWith(query))
            .map((r) => new BaseResult({ label: r }))
            .slice(0, 10);
        return [...(refNameResults || []), ...(textSearchResults || [])];
    }
    // this is a combination of any displayed error message we have
    const displayError = error || assemblyError;
    return (React.createElement(Container, { className: classes.importFormContainer },
        displayError ? React.createElement(ErrorMessage, { error: displayError }) : null,
        React.createElement(Grid, { container: true, spacing: 1, justifyContent: "center", alignItems: "center" },
            React.createElement(Grid, { item: true },
                React.createElement(AssemblySelector, { onChange: (val) => {
                        setError(undefined);
                        setSelected(Array(parseInt(numViews, 10)).fill(val));
                    }, session: session, selected: selected[0] })),
            React.createElement(Grid, { item: true }, selected[0] ? (error ? (React.createElement(CloseIcon, { style: { color: 'red' } })) : selectedRegion ? (React.createElement(RefNameAutocomplete, { fetchResults: fetchResults, 
                // @ts-ignore
                model: model, assemblyName: assemblyError ? undefined : selected[0], value: selectedRegion, 
                // note: minWidth 270 accomodates full width of helperText
                minWidth: 270, onSelect: (option) => setOption(option), TextFieldProps: {
                    margin: 'normal',
                    variant: 'outlined',
                    helperText: 'Enter sequence name, feature name, or location',
                } })) : (React.createElement(CircularProgress, { role: "progressbar", size: 20, disableShrink: true }))) : null),
            React.createElement(Grid, { item: true },
                React.createElement(Tooltip, { title: "Views are limited between 2 and 10" },
                    React.createElement(React.Fragment, null,
                        React.createElement(TextField, { value: numViews, type: "number", variant: "outlined", margin: "normal", onChange: (event) => setNumViews(event.target.value), style: { width: '8rem', verticalAlign: 'baseline' }, "data-testid": "num_views", helperText: "Number of views" })))),
            React.createElement(Grid, { item: true },
                React.createElement(TextField, { select: true, value: order, variant: "outlined", margin: "normal", label: "Order", "data-testid": "cascade_order", onChange: (event) => setOrder(event.target.value), style: { width: '17rem', verticalAlign: 'baseline' }, helperText: `${order} order has the overview at the ${order === 'Descending' ? 'top' : 'bottom'}` },
                    React.createElement(MenuItem, { key: 'Ascending', value: 'Ascending' }, "Ascending"),
                    React.createElement(MenuItem, { key: 'Descending', value: 'Descending' }, "Descending"))),
            React.createElement(Grid, { item: true },
                React.createElement(Button, { disabled: !!assemblyError, onClick: onOpenClick, variant: "contained", color: "primary", style: { marginBottom: '1rem' } }, "Open")))));
});

const theme = createJBrowseTheme();
const useStyles = makeStyles()(() => ({
    container: {
        display: 'grid',
    },
    overlay: {
        zIndex: 100,
        gridArea: '1/1',
    },
    content: {
        gridArea: '1/1',
        position: 'relative',
    },
    grid: {
        display: 'grid',
    },
    relative: {
        position: 'relative',
    },
}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setPolygonPoints = (model, view) => {
    // @ts-ignore
    const anchorView = model.views.find((view) => view.isAnchor);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getLeft = (view) => {
        const coordA = bpToPx(anchorView?.coarseDynamicBlocks[0]?.start, {
            start: view.coarseDynamicBlocks[0]?.start,
            end: view.coarseDynamicBlocks[0]?.end,
            reversed: view.coarseDynamicBlocks[0]?.reversed,
        }, view.bpPerPx);
        const left = !isNaN(coordA)
            ? view.offsetPx < 0
                ? coordA + view.offsetPx * -1
                : coordA
            : 0;
        return left;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getRight = (view) => {
        const coordB = bpToPx(anchorView?.coarseDynamicBlocks[0]?.end, {
            start: view.coarseDynamicBlocks[0]?.start,
            end: view.coarseDynamicBlocks[0]?.end,
            reversed: view.coarseDynamicBlocks[0]?.reversed,
        }, view.bpPerPx);
        const right = !isNaN(coordB)
            ? view.offsetPx < 0
                ? coordB + view.offsetPx * -1
                : coordB
            : 0;
        return right;
    };
    const left = getLeft(view);
    const right = getRight(view);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let index = model.views.findIndex((target) => target.id === view.id);
    if (index > 0) {
        index--;
    }
    const targetView = model.views[index];
    const prevLeft = getLeft(targetView);
    const prevRight = getRight(targetView);
    const polygonPoints = {
        left,
        right,
        prevLeft,
        prevRight,
    };
    return polygonPoints;
};
const MultilevelLinearView = observer((props) => {
    const { classes } = useStyles();
    const { model, ExtraButtons } = props;
    const { pluginManager } = getEnv(model);
    const { initialized } = model;
    if (!initialized) {
        return React.createElement(ImportForm, { model: model });
    }
    return (React.createElement(ThemeProvider, { theme: theme },
        React.createElement("div", null,
            React.createElement(Header, { model: model, ExtraButtons: ExtraButtons }),
            React.createElement("div", { className: classes.container },
                React.createElement("div", { className: classes.content },
                    React.createElement("div", { className: classes.relative }, model.views.map((view) => {
                        const { ReactComponent } = pluginManager.getViewType(view.type);
                        if (!model.initialized || !view.initialized) {
                            return null;
                        }
                        const polygonPoints = setPolygonPoints(model, view);
                        return (React.createElement("div", { key: view.id },
                            React.createElement(React.Fragment, null,
                                !view.hideHeader && view.id !== model.views[0].id ? (React.createElement(Subheader
                                // @ts-ignore
                                , { 
                                    // @ts-ignore
                                    view: view, model: model, polygonPoints: polygonPoints })) : null,
                                // @ts-ignore
                                !view.isAnchor &&
                                    // @ts-ignore
                                    view.isVisible ? (React.createElement(AreaOfInterest
                                // @ts-ignore
                                , { 
                                    // @ts-ignore
                                    view: view, model: model, polygonPoints: polygonPoints })) : null),
                            // @ts-ignore
                            view.isVisible ? (React.createElement(React.Fragment, null,
                                React.createElement(ReactComponent, { key: view.id, model: view }))) : null));
                    })))))));
});

var MultilevelLinearViewF = ({ jbrequire }) => {
    const ViewType = jbrequire('@jbrowse/core/pluggableElementTypes/ViewType');
    return new ViewType({
        name: 'MultilevelLinearView',
        stateModel: jbrequire(stateModelFactory$1),
        ReactComponent: MultilevelLinearView,
    });
};

function stateModelFactory(pluginManager) {
    return pluginManager.getViewType('LinearGenomeView')
        .stateModel
        .named('LinearGenomeMultilevelView')
        .props({
        id: ElementId,
        type: types.literal('LinearGenomeMultilevelView'),
        hideControls: true,
        isVisible: true,
        isAnchor: false,
        isOverview: false,
        limitBpPerPx: types.optional(types.frozen(), {
            limited: false,
            upperLimit: 1,
            apexUpperLimit: 1,
            lowerLimit: 0,
            apexLowerLimit: 0,
        }),
        polygonPoints: types.optional(types.frozen(), {
            left: -1,
            right: -1,
            prevLeft: -1,
            prevRight: -1,
        }),
    })
        .actions((self) => ({
        toggleControls() {
            self.hideControls = !self.hideControls;
        },
        toggleVisible() {
            self.isVisible = !self.isVisible;
        },
        toggleIsAnchor() {
            self.isAnchor = !self.isAnchor;
        },
        toggleIsOverview() {
            self.isOverview = !self.isOverview;
        },
        setLimitBpPerPx(limited, upperLimit, lowerLimit, apexUpperLimit, apexLowerLimit) {
            self.limitBpPerPx = {
                limited: limited,
                upperLimit: upperLimit ? upperLimit : self.limitBpPerPx.upperLimit,
                apexUpperLimit: apexUpperLimit
                    ? apexUpperLimit
                    : self.limitBpPerPx.apexUpperLimit,
                lowerLimit: lowerLimit ? lowerLimit : self.limitBpPerPx.lowerLimit,
                apexLowerLimit: apexLowerLimit
                    ? apexLowerLimit
                    : self.limitBpPerPx.apexLowerLimit,
            };
        },
        setPolygonPoints(left, right, prevLeft, prevRight) {
            self.polygonPoints = {
                left: left,
                right: right,
                prevLeft: prevLeft,
                prevRight: prevRight,
            };
        },
        zoomTo(bpPerPx) {
            if (!self.limitBpPerPx.limited ||
                (bpPerPx <= self.limitBpPerPx.apexUpperLimit &&
                    bpPerPx >= self.limitBpPerPx.apexLowerLimit)) {
                const newBpPerPx = clamp(bpPerPx, self.minBpPerPx, self.maxBpPerPx);
                if (newBpPerPx === self.bpPerPx) {
                    return newBpPerPx;
                }
                const oldBpPerPx = self.bpPerPx;
                self.bpPerPx = newBpPerPx;
                if (Math.abs(oldBpPerPx - newBpPerPx) < 0.000001) {
                    console.warn('zoomTo bpPerPx rounding error');
                    return oldBpPerPx;
                }
                const viewWidth = self.width;
                self.scrollTo(Math.round(((self.offsetPx + viewWidth / 2) * oldBpPerPx) / newBpPerPx -
                    viewWidth / 2));
                return newBpPerPx;
            }
            return self.bpPerPx;
        },
        navToLocString(locString, optAssemblyName) {
            const { assemblyNames } = self;
            const { assemblyManager } = getSession(self);
            const { isValidRefName } = assemblyManager;
            const assemblyName = optAssemblyName || assemblyNames[0];
            let parsedLocStrings;
            const inputs = locString
                .split(/(\s+)/)
                .map((f) => f.trim())
                .filter((f) => !!f);
            // first try interpreting as a whitespace-separated sequence of
            // multiple locstrings
            try {
                parsedLocStrings = inputs.map((l) => parseLocString(l, (ref) => isValidRefName(ref, assemblyName)));
            }
            catch (e) {
                // if this fails, try interpreting as a whitespace-separated refname,
                // start, end if start and end are integer inputs
                const [refName, start, end] = inputs;
                if (`${e}`.match(/Unknown reference sequence/) &&
                    Number.isInteger(+start) &&
                    Number.isInteger(+end)) {
                    parsedLocStrings = [
                        parseLocString(refName + ':' + start + '..' + end, (ref) => isValidRefName(ref, assemblyName)),
                    ];
                }
                else {
                    throw e;
                }
            }
            const locations = parsedLocStrings.map((region) => {
                const asmName = region.assemblyName || assemblyName;
                const asm = assemblyManager.get(asmName);
                const { refName } = region;
                if (!asm) {
                    throw new Error(`assembly ${asmName} not found`);
                }
                const { regions } = asm;
                if (!regions) {
                    throw new Error(`regions not loaded yet for ${asmName}`);
                }
                const canonicalRefName = asm.getCanonicalRefName(region.refName);
                if (!canonicalRefName) {
                    throw new Error(`Could not find refName ${refName} in ${asm.name}`);
                }
                const parentRegion = regions.find((region) => region.refName === canonicalRefName);
                if (!parentRegion) {
                    throw new Error(`Could not find refName ${refName} in ${asmName}`);
                }
                return {
                    ...region,
                    assemblyName: asmName,
                    parentRegion,
                };
            });
            if (locations.length === 1) {
                const loc = locations[0];
                self.setDisplayedRegions([
                    { reversed: loc.reversed, ...loc.parentRegion },
                ]);
                const { start, end, parentRegion } = loc;
                self.navTo({
                    ...loc,
                    start: clamp(start ?? 0, 0, parentRegion.end),
                    end: clamp(end ?? parentRegion.end, 0, parentRegion.end),
                });
            }
            else {
                self.setDisplayedRegions(
                // @ts-ignore
                locations.map((r) => (r.start === undefined ? r.parentRegion : r)));
                self.showAllRegions();
            }
        },
        /**
         * moveIfAnchor is called when the user attempts to navigate using the rubberband functionality on the LGV
         * this navigation (move) is only performed on the anchor view (if anchor) and thus disabled if the user
         * attempts to rubber band nav on the 'sub' views. This way, we're able to navigate using the overview to
         * trigger the nav on the anchor (and because they're linked, the sub views as well) as well as on the
         * anchor track itself.
         */
        moveIfAnchor(leftOffset, rightOffset) {
            if (self.isAnchor) {
                self.moveTo(leftOffset, rightOffset);
            }
        },
        closeView() {
            const parent = getContainingView(self);
            // @ts-ignore
            parent.removeView(self);
        },
        addView(isAbove) {
            const parent = getContainingView(self);
            // @ts-ignore
            parent.addView(isAbove, self);
        },
    }))
        .views((self) => {
        // @ts-ignore
        const { menuItems: superMenuItems } = self;
        return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            MiniControlsComponent() {
                return MiniControls;
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            HeaderComponent() {
                return Header;
            },
            menuItems() {
                const superMenuItemsArray = superMenuItems();
                const index = superMenuItemsArray.findIndex(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (item) => item.label === 'Return to import form');
                superMenuItemsArray.splice(index, 1);
                const addRemoveMenuItems = [
                    !self.isAnchor && !self.isOverview
                        ? {
                            label: 'Remove view',
                            icon: CloseIcon,
                            onClick: self.closeView,
                        }
                        : {
                            label: 'This view cannot be removed',
                            icon: CloseIcon,
                            disabled: true,
                            onClick: () => { },
                        },
                    {
                        label: 'Add neighbouring view',
                        icon: AddIcon,
                        subMenu: [
                            {
                                label: 'Add view above',
                                icon: VerticalAlignTopIcon,
                                onClick: () => {
                                    self.addView(true);
                                },
                            },
                            {
                                label: 'Add view below',
                                icon: VerticalAlignBottomIcon,
                                onClick: () => {
                                    self.addView(false);
                                },
                            },
                        ],
                    },
                ];
                superMenuItemsArray.splice(2, 0, ...addRemoveMenuItems);
                const controlsHideMenuItems = [
                    {
                        label: 'Show controls',
                        icon: VisibilityIcon,
                        type: 'checkbox',
                        checked: !self.hideControls,
                        onClick: self.toggleControls,
                        disabled: !self.isVisible || self.isAnchor || self.isOverview,
                    },
                    {
                        label: 'Hide view',
                        icon: VisibilityIcon,
                        type: 'checkbox',
                        checked: !self.isVisible,
                        onClick: self.toggleVisible,
                        disabled: self.isOverview,
                    },
                ];
                superMenuItemsArray.splice(12, 0, ...controlsHideMenuItems);
                return superMenuItemsArray;
            },
        };
    })
        .views((self) => {
        const { rubberBandMenuItems: superMenuItems } = self;
        const superMenuItemsArray = superMenuItems();
        const index = superMenuItemsArray.findIndex(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item) => item.label === 'Zoom to region');
        superMenuItemsArray.splice(index, 1);
        return {
            rubberBandMenuItems() {
                return [
                    {
                        label: 'Zoom to region',
                        icon: ZoomIn,
                        onClick: () => {
                            const { leftOffset, rightOffset } = self;
                            if (leftOffset && rightOffset) {
                                self.moveIfAnchor(leftOffset, rightOffset);
                            }
                        },
                    },
                    ...superMenuItemsArray,
                ];
            },
        };
    });
}

const LinearGenomeMultilevelView = observer(({ model }) => {
    const pluginManager = getEnv(getSession(model)).pluginManager;
    const LGV = pluginManager.getPlugin('LinearGenomeViewPlugin');
    // @ts-ignore
    const { LinearGenomeView } = LGV.exports;
    return React.createElement(LinearGenomeView, { model: model });
});

var LinearGenomeMultilevelViewF = ({ jbrequire }) => {
    const ViewType = jbrequire('@jbrowse/core/pluggableElementTypes/ViewType');
    return new ViewType({
        name: 'LinearGenomeMultilevelView',
        stateModel: jbrequire(stateModelFactory),
        ReactComponent: LinearGenomeMultilevelView,
        extendedName: 'LinearGenomeView',
    });
};

var version = "1.0.0";

class index extends Plugin {
    name = 'MultilevelLinearViewPlugin';
    version = version;
    install(pluginManager) {
        pluginManager.addViewType(() => pluginManager.jbrequire(LinearGenomeMultilevelViewF));
        pluginManager.addViewType(() => pluginManager.jbrequire(MultilevelLinearViewF));
    }
    configure(pluginManager) {
        if (isAbstractMenuManager(pluginManager.rootModel)) {
            pluginManager.rootModel.appendToMenu('Add', {
                label: 'Linear multilevel view',
                icon: DynamicFeedIcon,
                onClick: (session) => {
                    session.addView('MultilevelLinearView', {});
                },
            });
        }
    }
}

export { index as default };
//# sourceMappingURL=index.esm.js.map
