import React, { useState } from 'react';
import { BaseCard, FeatureDetails, } from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Button, Chip, IconButton, Link, Paper, Table, TableBody, TableCell, TableRow, Tooltip, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import { navToAnnotation, openReactomeView } from '../util';
const useStyles = makeStyles()(() => ({
    table: {
        padding: 0,
    },
    link: {
        color: 'rgb(0, 0, 238)',
    },
    tableContainer: {
        width: '100%',
        maxHeight: 600,
        overflow: 'auto',
    },
    treeList: {
        listStyle: 'none',
        margin: 0,
        paddingLeft: 0,
    },
    treeChildren: {
        listStyle: 'none',
        margin: 0,
        // lines up a child's toggle under its parent's label
        paddingLeft: 28,
    },
    treeRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
    },
    // keeps a childless node's label in the same column as a parent's
    treeToggleSpacer: {
        display: 'inline-block',
        width: 28,
    },
}));
/**
 * Render a single table row for an external link
 */
const ExternalLink = observer((props) => {
    const { classes } = useStyles();
    const { id, name, link } = props;
    return (React.createElement(React.Fragment, null,
        React.createElement(TableRow, { key: `${id}-${name}` },
            React.createElement(TableCell, null, name),
            React.createElement(TableCell, null,
                React.createElement(Link, { className: classes.link, target: "_blank", rel: "noopener", href: `${link}`, underline: "always" }, id)))));
});
function ExternalLinks(props) {
    const { classes } = useStyles();
    const { feature } = props;
    const externalLinkArray = feature.externalLinks;
    return (React.createElement(BaseCard, { title: "External Links" },
        React.createElement("div", { className: classes.tableContainer },
            React.createElement(Table, { className: classes.table },
                React.createElement(TableBody, null, externalLinkArray.map((externalLink, key) => (React.createElement(ExternalLink, { id: feature.geneSymbol ? feature.geneSymbol : feature.name, ...externalLink, key: key }))))))));
}
function Synonyms(props) {
    const { classes } = useStyles();
    const { feature } = props;
    const synonyms = feature.synonyms.split(',');
    return (React.createElement(BaseCard, { title: "Synonyms" },
        React.createElement("div", { className: classes.tableContainer },
            React.createElement(Table, { className: classes.table },
                React.createElement(TableBody, null,
                    React.createElement(TableRow, { key: `${feature.geneId}-synonyms` },
                        React.createElement(TableCell, null, synonyms.map((synonym, key) => (React.createElement(Chip, { label: synonym, key: key, style: { marginRight: '2px', marginTop: '2px' } }))))))))));
}
function NavLink(props) {
    const { feature, model } = props;
    return (React.createElement(BaseCard, { title: "Navigate to feature on linear genome view" },
        React.createElement("div", { style: { display: 'flex', justifyContent: 'center' } },
            React.createElement(Button, { variant: "contained", color: "primary", size: "large", onClick: () => {
                    void navToAnnotation(`${feature.genomeLocation}`, model);
                } }, "Navigate"))));
}
function ReactomeItem(props) {
    const { node, model, pathways, geneName } = props;
    const { classes } = useStyles();
    return (React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between' } },
        React.createElement(Link, { className: classes.link, target: "_blank", rel: "noopener", href: `https://reactome.org/PathwayBrowser/#/${node.stId}&FLG=${node.name}`, underline: "always" }, node.name),
        model.hasPlugin('ReactomePlugin') ? (React.createElement(Tooltip, { title: "Open pathway in Reactome Plugin" },
            React.createElement(IconButton, { color: "primary", component: "span", onClick: () => {
                    void openReactomeView(node.stId, pathways, node.name, geneName, model);
                } },
                React.createElement(MenuOpenIcon, null)))) : null));
}
/**
 * One collapsible row. Written out here rather than pulled from a tree-view
 * library: all this needs is a disclosure toggle and a nested list, and
 * @mui/x-tree-view is not one of the modules JBrowse externalizes, so it was
 * costing ~55kB of the plugin's own bundle to draw two dozen links.
 *
 * Collapsed by default, which is what the previous SimpleTreeView did with no
 * defaultExpandedItems set.
 */
function HierarchyItem({ node, model, pathways, geneName, }) {
    var _a;
    const { classes } = useStyles();
    const [expanded, setExpanded] = useState(false);
    const children = (_a = node.children) !== null && _a !== void 0 ? _a : [];
    return (React.createElement("li", null,
        React.createElement("div", { className: classes.treeRow },
            children.length > 0 ? (React.createElement(IconButton, { size: "small", "aria-label": expanded ? 'Collapse' : 'Expand', onClick: () => {
                    setExpanded(!expanded);
                } }, expanded ? React.createElement(ExpandMoreIcon, null) : React.createElement(ChevronRightIcon, null))) : (React.createElement("span", { className: classes.treeToggleSpacer })),
            React.createElement(ReactomeItem, { node: node, model: model, pathways: pathways, geneName: geneName })),
        expanded && children.length > 0 ? (React.createElement("ul", { className: classes.treeChildren }, children.map(child => (React.createElement(HierarchyItem, { key: child.stId, node: child, model: model, pathways: pathways, geneName: geneName }))))) : null));
}
function Hierarchy({ hierarchy, model, pathways, geneName, }) {
    const { classes } = useStyles();
    return (React.createElement(BaseCard, { title: "Reactome Annotated Pathways" },
        React.createElement("ul", { className: classes.treeList }, hierarchy.map(node => (React.createElement(HierarchyItem, { key: node.stId, node: node, model: model, pathways: pathways, geneName: geneName }))))));
}
const IdeoFeatureDetails = observer(function IdeoFeatureDetails(props) {
    var _a;
    const { model } = props;
    const feat = model.featureData;
    const fullFeature = {
        start: feat.start,
        end: feat.end,
        ...feat.details,
    };
    return (React.createElement(Paper, { "data-testid": "ideo-widget" },
        React.createElement(FeatureDetails, { feature: fullFeature, ...props, omit: [
                'synonyms',
                'externalLinks',
                'pathways',
                'reactomeIds',
                'hierarchy',
            ] }),
        React.createElement(NavLink, { feature: fullFeature, model: model }),
        fullFeature.externalLinks && React.createElement(ExternalLinks, { feature: fullFeature }),
        fullFeature.synonyms && React.createElement(Synonyms, { feature: fullFeature }),
        ((_a = fullFeature.hierarchy) === null || _a === void 0 ? void 0 : _a.length) > 0 && (React.createElement(Hierarchy, { hierarchy: fullFeature.hierarchy, model: model, pathways: fullFeature.pathways, geneName: fullFeature.name }))));
});
export default IdeoFeatureDetails;
//# sourceMappingURL=IdeogramFeatureWidget.js.map