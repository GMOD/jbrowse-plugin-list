'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Plugin = require('@jbrowse/core/Plugin');
var util = require('@jbrowse/core/util');
var DynamicFeedIcon = require('@mui/icons-material/DynamicFeed');
var mobxStateTree = require('mobx-state-tree');
var FolderOpenIcon = require('@mui/icons-material/FolderOpen');
var SwapVertIcon = require('@mui/icons-material/SwapVert');
var MenuIcon = require('@mui/icons-material/Menu');
var FormatAlignCenterIcon = require('@mui/icons-material/FormatAlignCenter');
var LinkIcon = require('@mui/icons-material/Link');
var LinkOffIcon = require('@mui/icons-material/LinkOff');
var BaseViewModel = require('@jbrowse/core/pluggableElementTypes/models/BaseViewModel');
var ui = require('@jbrowse/core/ui');
var mst = require('@jbrowse/core/util/types/mst');
var React = require('react');
var mobxReact = require('mobx-react');
var mui = require('tss-react/mui');
var material = require('@mui/material');
var styles = require('@mui/material/styles');
var ArrowForwardIcon = require('@mui/icons-material/ArrowForward');
var ArrowBackIcon = require('@mui/icons-material/ArrowBack');
var IconButton = require('@mui/material/IconButton');
var Paper = require('@mui/material/Paper');
var ZoomIn = require('@mui/icons-material/ZoomIn');
var ZoomOut = require('@mui/icons-material/ZoomOut');
var CascadingMenu = require('@jbrowse/core/ui/CascadingMenu');
var hooks = require('material-ui-popup-state/hooks');
var AlignHorizontalCenterIcon = require('@mui/icons-material/AlignHorizontalCenter');
var CloseIcon = require('@mui/icons-material/Close');
var BaseResult = require('@jbrowse/core/TextSearch/BaseResults');
var pluginLinearGenomeView = require('@jbrowse/plugin-linear-genome-view');
var react = require('@emotion/react');
var VisibilityIcon = require('@mui/icons-material/Visibility');
var AddIcon = require('@mui/icons-material/Add');
var VerticalAlignTopIcon = require('@mui/icons-material/VerticalAlignTop');
var VerticalAlignBottomIcon = require('@mui/icons-material/VerticalAlignBottom');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Plugin__default = /*#__PURE__*/_interopDefaultLegacy(Plugin);
var DynamicFeedIcon__default = /*#__PURE__*/_interopDefaultLegacy(DynamicFeedIcon);
var FolderOpenIcon__default = /*#__PURE__*/_interopDefaultLegacy(FolderOpenIcon);
var SwapVertIcon__default = /*#__PURE__*/_interopDefaultLegacy(SwapVertIcon);
var MenuIcon__default = /*#__PURE__*/_interopDefaultLegacy(MenuIcon);
var FormatAlignCenterIcon__default = /*#__PURE__*/_interopDefaultLegacy(FormatAlignCenterIcon);
var LinkIcon__default = /*#__PURE__*/_interopDefaultLegacy(LinkIcon);
var LinkOffIcon__default = /*#__PURE__*/_interopDefaultLegacy(LinkOffIcon);
var BaseViewModel__default = /*#__PURE__*/_interopDefaultLegacy(BaseViewModel);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var ArrowForwardIcon__default = /*#__PURE__*/_interopDefaultLegacy(ArrowForwardIcon);
var ArrowBackIcon__default = /*#__PURE__*/_interopDefaultLegacy(ArrowBackIcon);
var IconButton__default = /*#__PURE__*/_interopDefaultLegacy(IconButton);
var Paper__default = /*#__PURE__*/_interopDefaultLegacy(Paper);
var ZoomIn__default = /*#__PURE__*/_interopDefaultLegacy(ZoomIn);
var ZoomOut__default = /*#__PURE__*/_interopDefaultLegacy(ZoomOut);
var CascadingMenu__default = /*#__PURE__*/_interopDefaultLegacy(CascadingMenu);
var AlignHorizontalCenterIcon__default = /*#__PURE__*/_interopDefaultLegacy(AlignHorizontalCenterIcon);
var CloseIcon__default = /*#__PURE__*/_interopDefaultLegacy(CloseIcon);
var BaseResult__default = /*#__PURE__*/_interopDefaultLegacy(BaseResult);
var VisibilityIcon__default = /*#__PURE__*/_interopDefaultLegacy(VisibilityIcon);
var AddIcon__default = /*#__PURE__*/_interopDefaultLegacy(AddIcon);
var VerticalAlignTopIcon__default = /*#__PURE__*/_interopDefaultLegacy(VerticalAlignTopIcon);
var VerticalAlignBottomIcon__default = /*#__PURE__*/_interopDefaultLegacy(VerticalAlignBottomIcon);

function stateModelFactory$1(pluginManager) {
    const defaultHeight = 400;
    return mobxStateTree.types
        .compose('MultilevelLinearView', BaseViewModel__default["default"], mobxStateTree.types.model({
        id: mst.ElementId,
        type: mobxStateTree.types.literal('MultilevelLinearView'),
        height: defaultHeight,
        trackSelectorType: 'hierarchical',
        linkViews: false,
        interactToggled: false,
        isDescending: true,
        tracks: mobxStateTree.types.array(pluginManager.pluggableMstType('track', 'stateModel')),
        views: mobxStateTree.types.array(pluginManager.getViewType('LinearGenomeMultilevelView')
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
            self.views = mobxStateTree.cast(views);
        },
    }))
        .actions((self) => ({
        afterAttach() {
            mobxStateTree.addDisposer(self, mobxStateTree.onAction(self, (param) => {
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
            const session = util.getSession(self);
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
                        const ret = mobxStateTree.getPath(view);
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
            self.views = mobxStateTree.cast([]);
            self.linkViews = false;
        },
        removeView(target) {
            const session = util.getSession(self);
            const pluginManager = mobxStateTree.getEnv(session);
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
            const { assemblyManager } = util.getSession(self);
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
                    util.getSession(self).queueDialog((handleClose) => [
                        ui.ReturnToImportFormDialog,
                        { model: self, handleClose },
                    ]);
                },
                icon: FolderOpenIcon__default["default"],
            }, {
                label: 'Reverse views direction',
                icon: SwapVertIcon__default["default"],
                onClick: self.reverseViewsDirection,
            }, {
                label: 'Align views',
                onClick: self.alignViews,
                icon: FormatAlignCenterIcon__default["default"],
            }, {
                label: self.linkViews ? 'Unlink views' : 'Link views',
                onClick: self.toggleLinkViews,
                icon: self.linkViews ? LinkOffIcon__default["default"] : LinkIcon__default["default"],
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
                    icon: MenuIcon__default["default"],
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

const useStyles$3 = mui.makeStyles()((theme) => ({
    guide: {
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: 10,
    },
}));
const AreaOfInterest = mobxReact.observer(({ model, view, polygonPoints, }) => {
    const { classes } = useStyles$3();
    const { left, right } = polygonPoints;
    const theme = styles.useTheme();
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
    return (React__default["default"].createElement(React__default["default"].Fragment, null,
        React__default["default"].createElement("div", { className: classes.guide, style: {
                left,
                width,
                height,
                background: styles.alpha(polygonColor, 0.2),
            } }),
        React__default["default"].createElement(material.Typography, { className: classes.guide, variant: "caption", style: {
                paddingLeft: '1px',
                left,
                height,
                width,
                color: polygonColor,
            } }, anchorView?.displayName)));
});

const MAX_WIDTH = 100;
const MIN_WIDTH = 100;
const LabelField = mobxReact.observer(({ model }) => {
    const [displayName, setDisplayName] = React.useState(model.displayName ? model.displayName : '');
    const determineWidth = () => {
        const width = util.measureText(model.displayName, 15) < MAX_WIDTH
            ? util.measureText(model.displayName, 15) > MIN_WIDTH
                ? util.measureText(model.displayName, 15)
                : MIN_WIDTH
            : MAX_WIDTH;
        return width;
    };
    const [inputWidth, setInputWidth] = React.useState(determineWidth());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setViewLabel = (label) => {
        setDisplayName(label);
        model.setDisplayName(label);
        setInputWidth(determineWidth());
    };
    React.useEffect(() => {
        setDisplayName(model.displayName ? model.displayName : '');
    }, [model.displayName]);
    return (React__default["default"].createElement(material.Tooltip, { title: "Rename view", arrow: true },
        React__default["default"].createElement(React__default["default"].Fragment, null,
            React__default["default"].createElement(material.TextField, { variant: "standard", value: displayName, size: "small", margin: "none", style: { margin: '0px', paddingRight: '5px' }, 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange: (event) => setViewLabel(event?.target.value), InputProps: {
                    style: {
                        width: `${inputWidth}px`,
                        height: `25px`,
                        padding: '0px',
                    },
                } }))));
});

const RegionWidth = mobxReact.observer(({ model }) => {
    const { coarseTotalBp } = model;
    return (React__default["default"].createElement(material.Typography, { variant: "body2", color: "textSecondary", style: {
            display: 'flex',
            alignItems: 'center',
            marginLeft: 10,
        } },
        Math.round(coarseTotalBp).toLocaleString('en-US'),
        " bp"));
});

const MiniControls = mobxReact.observer((props) => {
    const { model } = props;
    const { bpPerPx, maxBpPerPx, minBpPerPx, scaleFactor } = model;
    const popupState = hooks.usePopupState({
        popupId: 'mllvViewMenu',
        variant: 'popover',
    });
    return (React__default["default"].createElement("div", { style: { position: 'absolute', right: '0px', zIndex: '1001' } },
        React__default["default"].createElement(Paper__default["default"], { style: { background: '#aaa7', display: 'flex', alignItems: 'center' } },
            React__default["default"].createElement("div", null,
                React__default["default"].createElement(IconButton__default["default"], { ...hooks.bindTrigger(popupState), color: "secondary", "data-testid": "mllv-minicontrols-menu" },
                    React__default["default"].createElement(MenuIcon__default["default"], null)),
                React__default["default"].createElement(CascadingMenu__default["default"], { ...hooks.bindPopover(popupState), onMenuItemClick: (_, callback) => callback(), menuItems: model.menuItems(), popupState: popupState }),
                React__default["default"].createElement(LabelField, { model: model })),
            React__default["default"].createElement("div", null,
                React__default["default"].createElement(RegionWidth, { model: model })),
            React__default["default"].createElement("div", { "data-testid": "mllv-minicontrols" },
                // @ts-ignore
                model.limitBpPerPx.limited &&
                    // @ts-ignore
                    bpPerPx * 2 > model.limitBpPerPx.apexUpperLimit ? (React__default["default"].createElement(material.Tooltip, { title: "This view is at its max zoom level relative to its neighbouring views", arrow: true },
                    React__default["default"].createElement("span", null,
                        React__default["default"].createElement(IconButton__default["default"], { disabled: true, "data-testid": "zoom_out" },
                            React__default["default"].createElement(ZoomOut__default["default"], null))))) : (React__default["default"].createElement(IconButton__default["default"], { "data-testid": "zoom_out", onClick: () => {
                        model.zoom(bpPerPx * 2);
                    }, disabled: bpPerPx >= maxBpPerPx - 0.0001 || scaleFactor !== 1, color: "secondary" },
                    React__default["default"].createElement(ZoomOut__default["default"], null))),
                // @ts-ignore
                model.isOverview ||
                    // @ts-ignore
                    (model.limitBpPerPx.limited &&
                        // @ts-ignore
                        bpPerPx / 2 < model.limitBpPerPx.apexLowerLimit) ? (React__default["default"].createElement(material.Tooltip, { title: "This view is at its min zoom level relative to its neighbouring views", arrow: true },
                    React__default["default"].createElement("span", null,
                        React__default["default"].createElement(IconButton__default["default"], { disabled: true, "data-testid": "zoom_in" },
                            React__default["default"].createElement(ZoomIn__default["default"], null))))) : (React__default["default"].createElement(IconButton__default["default"], { "data-testid": "zoom_in", onClick: () => {
                        model.zoom(model.bpPerPx / 2);
                    }, disabled: bpPerPx <= minBpPerPx + 0.0001 || scaleFactor !== 1, color: "secondary" },
                    React__default["default"].createElement(ZoomIn__default["default"], null)))))));
});

const WIDGET_HEIGHT = 32;
const SPACING = 7;
const HEADER_BAR_HEIGHT = 48;
const useStyles$2 = mui.makeStyles()((theme) => ({
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
        background: styles.alpha(theme.palette.background.paper, 0.8),
        height: WIDGET_HEIGHT,
        margin: SPACING,
    },
}));
const Polygon = mobxReact.observer(({ view, polygonPoints, }) => {
    const { dynamicBlocks } = view;
    const { contentBlocks } = dynamicBlocks;
    const { left, right, prevLeft, prevRight } = polygonPoints;
    const theme = styles.useTheme();
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
    return (React__default["default"].createElement("polygon", { points: points.toString(), fill: styles.alpha(polygonColor, 0.2), stroke: styles.alpha(polygonColor, 0.8), "data-testid": "polygon" }));
});
function PanControls({ model }) {
    const { classes } = useStyles$2();
    return (React__default["default"].createElement(React__default["default"].Fragment, null,
        React__default["default"].createElement(material.Button, { variant: "outlined", className: classes.panButton, onClick: () => model.slide(-0.9), "data-testid": "panleft" },
            React__default["default"].createElement(ArrowBackIcon__default["default"], null)),
        React__default["default"].createElement(material.Button, { variant: "outlined", className: classes.panButton, onClick: () => model.slide(0.9), "data-testid": "panright" },
            React__default["default"].createElement(ArrowForwardIcon__default["default"], null))));
}
const Controls = mobxReact.observer(({ view, model, polygonPoints, ExtraControls, }) => {
    const { classes } = useStyles$2();
    const pluginManager = mobxStateTree.getEnv(util.getSession(model)).pluginManager;
    const LGV = pluginManager.getPlugin('LinearGenomeViewPlugin');
    // @ts-ignore
    const { SearchBox } = LGV.exports;
    return (React__default["default"].createElement("div", { className: classes.headerBar },
        model.views[0].id !== view.id ? (React__default["default"].createElement("svg", { height: HEADER_BAR_HEIGHT, style: { width: '100%', position: 'absolute' } },
            React__default["default"].createElement(Polygon, { view: view, polygonPoints: polygonPoints }))) : null,
        React__default["default"].createElement("div", { className: classes.spacer }),
        view.isVisible && !view.hideControls && !view.isAnchor ? (React__default["default"].createElement(React__default["default"].Fragment, null,
            React__default["default"].createElement(material.FormGroup, { row: true, className: classes.headerForm },
                React__default["default"].createElement(PanControls, { model: view }),
                React__default["default"].createElement(SearchBox, { model: view })),
            React__default["default"].createElement(RegionWidth, { model: view }),
            ExtraControls)) : null,
        React__default["default"].createElement("div", { className: classes.spacer }),
        !view.isVisible ? React__default["default"].createElement(MiniControls, { model: view }) : null));
});

const Subheader = mobxReact.observer(({ model, view, polygonPoints, }) => {
    return (React__default["default"].createElement("div", { "data-testid": "subheader" },
        React__default["default"].createElement(Controls, { model: model, view: view, polygonPoints: polygonPoints })));
});

const LinkViews = mobxReact.observer(({ model }) => {
    return (React__default["default"].createElement(material.IconButton, { onClick: model.toggleLinkViews, title: "Toggle linked scrolls and behavior across views", "data-testid": "link_views" }, model.linkViews ? (React__default["default"].createElement(LinkOffIcon__default["default"], { color: "secondary" })) : (React__default["default"].createElement(LinkIcon__default["default"], { color: "secondary" }))));
});
const AlignViews = mobxReact.observer(({ model }) => {
    return (React__default["default"].createElement(material.IconButton, { onClick: model.alignViews, title: "Align views (realign sub views to the anchor view)", "data-testid": "align_views" },
        React__default["default"].createElement(AlignHorizontalCenterIcon__default["default"], { color: "secondary" })));
});
const ResetZooms = mobxReact.observer(({ model }) => {
    return (React__default["default"].createElement(material.IconButton, { onClick: model.resetZooms, title: "Reset sub view zoom levels within one stage of the anchor view", "data-testid": "zoom_views" },
        React__default["default"].createElement(FormatAlignCenterIcon__default["default"], { color: "secondary" })));
});
const Header = mobxReact.observer(({ model, ExtraButtons, }) => {
    const theme = styles.useTheme();
    const { primary } = theme.palette;
    const colour = primary.light;
    // @ts-ignore
    const anchorView = model?.views?.find((view) => view.isAnchor);
    const pluginManager = mobxStateTree.getEnv(util.getSession(model)).pluginManager;
    const LGV = pluginManager.getPlugin('LinearGenomeViewPlugin');
    // @ts-ignore
    const { ZoomControls, SearchBox } = LGV.exports;
    return (React__default["default"].createElement("div", null, model?.initialized && anchorView?.initialized ? (React__default["default"].createElement("div", { style: {
            gridArea: '1/1/auto/span 2',
            display: 'flex',
            alignItems: 'center',
            height: 48,
            background: styles.alpha(colour, 0.3),
        } },
        React__default["default"].createElement(LinkViews, { model: model }),
        React__default["default"].createElement(AlignViews, { model: model }),
        React__default["default"].createElement(ResetZooms, { model: model }),
        React__default["default"].createElement("div", { style: { flexGrow: 1 } }),
        React__default["default"].createElement(material.FormGroup, { row: true, style: { flexWrap: 'nowrap', marginRight: 7 } },
            React__default["default"].createElement(PanControls, { model: anchorView }),
            React__default["default"].createElement(SearchBox, { model: anchorView })),
        React__default["default"].createElement(RegionWidth, { model: anchorView }),
        React__default["default"].createElement(ZoomControls, { model: anchorView }),
        React__default["default"].createElement("div", { style: { flexGrow: 1 } }))) : null));
});

const useStyles$1 = mui.makeStyles()((theme) => ({
    importFormContainer: {
        padding: theme.spacing(4),
    },
    formPaper: {
        margin: '0 auto',
        padding: 12,
        marginBottom: 10,
    },
}));
const ImportForm = mobxReact.observer(({ model }) => {
    const { classes } = useStyles$1();
    const session = util.getSession(model);
    const { assemblyNames, assemblyManager } = session;
    const [selected, setSelected] = React.useState([assemblyNames[0]]);
    const [numViews, setNumViews] = React.useState('2');
    const [order, setOrder] = React.useState('Descending');
    const [error, setError] = React.useState();
    const assemblyError = assemblyNames.length
        ? selected
            .map((a) => assemblyManager.get(a)?.error)
            .filter((f) => !!f)
            .join(', ')
        : 'No configured assemblies';
    const [myOption, setOption] = React.useState();
    const assembly = assemblyManager.get(selected[0]);
    const regions = assembly?.regions || [];
    const option = myOption ||
        new BaseResult__default["default"]({
            label: regions[0]?.refName,
        });
    const selectedRegion = option?.getLocation() || option?.getLabel();
    React.useEffect(() => {
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
    React.useEffect(() => {
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
            if (!util.isSessionWithAddTracks(session)) {
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
            .map((r) => new BaseResult__default["default"]({ label: r }))
            .slice(0, 10);
        return [...(refNameResults || []), ...(textSearchResults || [])];
    }
    // this is a combination of any displayed error message we have
    const displayError = error || assemblyError;
    return (React__default["default"].createElement(material.Container, { className: classes.importFormContainer },
        displayError ? React__default["default"].createElement(ui.ErrorMessage, { error: displayError }) : null,
        React__default["default"].createElement(material.Grid, { container: true, spacing: 1, justifyContent: "center", alignItems: "center" },
            React__default["default"].createElement(material.Grid, { item: true },
                React__default["default"].createElement(ui.AssemblySelector, { onChange: (val) => {
                        setError(undefined);
                        setSelected(Array(parseInt(numViews, 10)).fill(val));
                    }, session: session, selected: selected[0] })),
            React__default["default"].createElement(material.Grid, { item: true }, selected[0] ? (error ? (React__default["default"].createElement(CloseIcon__default["default"], { style: { color: 'red' } })) : selectedRegion ? (React__default["default"].createElement(pluginLinearGenomeView.RefNameAutocomplete, { fetchResults: fetchResults, 
                // @ts-ignore
                model: model, assemblyName: assemblyError ? undefined : selected[0], value: selectedRegion, 
                // note: minWidth 270 accomodates full width of helperText
                minWidth: 270, onSelect: (option) => setOption(option), TextFieldProps: {
                    margin: 'normal',
                    variant: 'outlined',
                    helperText: 'Enter sequence name, feature name, or location',
                } })) : (React__default["default"].createElement(material.CircularProgress, { role: "progressbar", size: 20, disableShrink: true }))) : null),
            React__default["default"].createElement(material.Grid, { item: true },
                React__default["default"].createElement(material.Tooltip, { title: "Views are limited between 2 and 10" },
                    React__default["default"].createElement(React__default["default"].Fragment, null,
                        React__default["default"].createElement(material.TextField, { value: numViews, type: "number", variant: "outlined", margin: "normal", onChange: (event) => setNumViews(event.target.value), style: { width: '8rem', verticalAlign: 'baseline' }, "data-testid": "num_views", helperText: "Number of views" })))),
            React__default["default"].createElement(material.Grid, { item: true },
                React__default["default"].createElement(material.TextField, { select: true, value: order, variant: "outlined", margin: "normal", label: "Order", "data-testid": "cascade_order", onChange: (event) => setOrder(event.target.value), style: { width: '17rem', verticalAlign: 'baseline' }, helperText: `${order} order has the overview at the ${order === 'Descending' ? 'top' : 'bottom'}` },
                    React__default["default"].createElement(material.MenuItem, { key: 'Ascending', value: 'Ascending' }, "Ascending"),
                    React__default["default"].createElement(material.MenuItem, { key: 'Descending', value: 'Descending' }, "Descending"))),
            React__default["default"].createElement(material.Grid, { item: true },
                React__default["default"].createElement(material.Button, { disabled: !!assemblyError, onClick: onOpenClick, variant: "contained", color: "primary", style: { marginBottom: '1rem' } }, "Open")))));
});

const theme = ui.createJBrowseTheme();
const useStyles = mui.makeStyles()(() => ({
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
        const coordA = util.bpToPx(anchorView?.coarseDynamicBlocks[0]?.start, {
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
        const coordB = util.bpToPx(anchorView?.coarseDynamicBlocks[0]?.end, {
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
const MultilevelLinearView = mobxReact.observer((props) => {
    const { classes } = useStyles();
    const { model, ExtraButtons } = props;
    const { pluginManager } = mobxStateTree.getEnv(model);
    const { initialized } = model;
    if (!initialized) {
        return React__default["default"].createElement(ImportForm, { model: model });
    }
    return (React__default["default"].createElement(react.ThemeProvider, { theme: theme },
        React__default["default"].createElement("div", null,
            React__default["default"].createElement(Header, { model: model, ExtraButtons: ExtraButtons }),
            React__default["default"].createElement("div", { className: classes.container },
                React__default["default"].createElement("div", { className: classes.content },
                    React__default["default"].createElement("div", { className: classes.relative }, model.views.map((view) => {
                        const { ReactComponent } = pluginManager.getViewType(view.type);
                        if (!model.initialized || !view.initialized) {
                            return null;
                        }
                        const polygonPoints = setPolygonPoints(model, view);
                        return (React__default["default"].createElement("div", { key: view.id },
                            React__default["default"].createElement(React__default["default"].Fragment, null,
                                !view.hideHeader && view.id !== model.views[0].id ? (React__default["default"].createElement(Subheader
                                // @ts-ignore
                                , { 
                                    // @ts-ignore
                                    view: view, model: model, polygonPoints: polygonPoints })) : null,
                                // @ts-ignore
                                !view.isAnchor &&
                                    // @ts-ignore
                                    view.isVisible ? (React__default["default"].createElement(AreaOfInterest
                                // @ts-ignore
                                , { 
                                    // @ts-ignore
                                    view: view, model: model, polygonPoints: polygonPoints })) : null),
                            // @ts-ignore
                            view.isVisible ? (React__default["default"].createElement(React__default["default"].Fragment, null,
                                React__default["default"].createElement(ReactComponent, { key: view.id, model: view }))) : null));
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
        id: mst.ElementId,
        type: mobxStateTree.types.literal('LinearGenomeMultilevelView'),
        hideControls: true,
        isVisible: true,
        isAnchor: false,
        isOverview: false,
        limitBpPerPx: mobxStateTree.types.optional(mobxStateTree.types.frozen(), {
            limited: false,
            upperLimit: 1,
            apexUpperLimit: 1,
            lowerLimit: 0,
            apexLowerLimit: 0,
        }),
        polygonPoints: mobxStateTree.types.optional(mobxStateTree.types.frozen(), {
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
                const newBpPerPx = util.clamp(bpPerPx, self.minBpPerPx, self.maxBpPerPx);
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
            const { assemblyManager } = util.getSession(self);
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
                parsedLocStrings = inputs.map((l) => util.parseLocString(l, (ref) => isValidRefName(ref, assemblyName)));
            }
            catch (e) {
                // if this fails, try interpreting as a whitespace-separated refname,
                // start, end if start and end are integer inputs
                const [refName, start, end] = inputs;
                if (`${e}`.match(/Unknown reference sequence/) &&
                    Number.isInteger(+start) &&
                    Number.isInteger(+end)) {
                    parsedLocStrings = [
                        util.parseLocString(refName + ':' + start + '..' + end, (ref) => isValidRefName(ref, assemblyName)),
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
                    start: util.clamp(start ?? 0, 0, parentRegion.end),
                    end: util.clamp(end ?? parentRegion.end, 0, parentRegion.end),
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
            const parent = util.getContainingView(self);
            // @ts-ignore
            parent.removeView(self);
        },
        addView(isAbove) {
            const parent = util.getContainingView(self);
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
                            icon: CloseIcon__default["default"],
                            onClick: self.closeView,
                        }
                        : {
                            label: 'This view cannot be removed',
                            icon: CloseIcon__default["default"],
                            disabled: true,
                            onClick: () => { },
                        },
                    {
                        label: 'Add neighbouring view',
                        icon: AddIcon__default["default"],
                        subMenu: [
                            {
                                label: 'Add view above',
                                icon: VerticalAlignTopIcon__default["default"],
                                onClick: () => {
                                    self.addView(true);
                                },
                            },
                            {
                                label: 'Add view below',
                                icon: VerticalAlignBottomIcon__default["default"],
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
                        icon: VisibilityIcon__default["default"],
                        type: 'checkbox',
                        checked: !self.hideControls,
                        onClick: self.toggleControls,
                        disabled: !self.isVisible || self.isAnchor || self.isOverview,
                    },
                    {
                        label: 'Hide view',
                        icon: VisibilityIcon__default["default"],
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
                        icon: ZoomIn__default["default"],
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

const LinearGenomeMultilevelView = mobxReact.observer(({ model }) => {
    const pluginManager = mobxStateTree.getEnv(util.getSession(model)).pluginManager;
    const LGV = pluginManager.getPlugin('LinearGenomeViewPlugin');
    // @ts-ignore
    const { LinearGenomeView } = LGV.exports;
    return React__default["default"].createElement(LinearGenomeView, { model: model });
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

class index extends Plugin__default["default"] {
    name = 'MultilevelLinearViewPlugin';
    version = version;
    install(pluginManager) {
        pluginManager.addViewType(() => pluginManager.jbrequire(LinearGenomeMultilevelViewF));
        pluginManager.addViewType(() => pluginManager.jbrequire(MultilevelLinearViewF));
    }
    configure(pluginManager) {
        if (util.isAbstractMenuManager(pluginManager.rootModel)) {
            pluginManager.rootModel.appendToMenu('Add', {
                label: 'Linear multilevel view',
                icon: DynamicFeedIcon__default["default"],
                onClick: (session) => {
                    session.addView('MultilevelLinearView', {});
                },
            });
        }
    }
}

exports["default"] = index;
//# sourceMappingURL=jbrowse-plugin-multilevel-linear-view.cjs.development.js.map
