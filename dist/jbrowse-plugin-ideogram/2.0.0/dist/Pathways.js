import React, { useState } from 'react';
import { BaseCard } from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail';
import { getSession } from '@jbrowse/core/util';
import { Link, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
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
}));
const Pathways = observer(function Pathways(props) {
    const { classes } = useStyles();
    const { model } = props;
    // Separate from the const above because it is re-bound to a sorted copy below
    let { pathways } = props;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selected, setSelected] = useState({ name: '' });
    const handleClick = (_event, pathway) => {
        setSelected(pathway);
        const toHighlight = [];
        const session = getSession(model);
        session.views.forEach((sessionModel) => {
            var _a, _b;
            if (sessionModel === model) {
                const targetModel = session.views.find((view) => (view === null || view === void 0 ? void 0 : view.ideogramId) === (sessionModel === null || sessionModel === void 0 ? void 0 : sessionModel.ideogramId) &&
                    view !== sessionModel);
                // The results view is paired with the ideogram view it was launched
                // from, and the user can close that one on its own. The two ts-ignores
                // this replaces hid exactly that: with no ideogram left to highlight,
                // targetModel is undefined and reading ideoAnnotations off it threw.
                if (targetModel) {
                    for (const annot of (_a = targetModel.ideoAnnotations) !== null && _a !== void 0 ? _a : []) {
                        if ((_b = annot.details.reactomeIds) === null || _b === void 0 ? void 0 : _b.includes(pathway.stId)) {
                            toHighlight.push(annot.name);
                        }
                    }
                    targetModel.setHighlightedAnnots(toHighlight);
                }
            }
        });
    };
    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    pathways = pathways
        .slice()
        .sort((a, b) => parseFloat(a.entities.pValue) - parseFloat(b.entities.pValue));
    const headers = [
        'Pathway name',
        'Entities found',
        'Entities Total',
        'Entities ratio',
        'Entities pValue',
        'Entities FDR',
        'Reactions found',
        'Reactions total',
        'Reactions ratio',
    ];
    const isSelected = (pathway) => selected.name === pathway.name;
    // pagination retrieved from https://v4.mui.com/components/tables/#sorting-amp-selecting
    return (React.createElement(BaseCard, { title: "Pathways" },
        React.createElement(TableContainer, { className: classes.tableContainer },
            React.createElement(Table, { className: classes.table },
                React.createElement(TableHead, null,
                    React.createElement(TableRow, null, headers.map((header, index) => (React.createElement(TableCell, { key: `${index}-${header}` }, header))))),
                React.createElement(TableBody, null, pathways
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((pathway, key) => {
                    const isItemSelected = isSelected(pathway);
                    return (React.createElement(TableRow, { key: key, onClick: (event) => { handleClick(event, pathway); }, selected: isItemSelected },
                        React.createElement(TableCell, null,
                            React.createElement(Link, { target: "_blank", rel: "noopener", underline: "always", href: `https://reactome.org/content/detail/${pathway.stId}` }, pathway.name)),
                        React.createElement(TableCell, { align: "right" }, pathway.entities.found),
                        React.createElement(TableCell, { align: "right" }, pathway.entities.total),
                        React.createElement(TableCell, { align: "right" }, pathway.entities.ratio.toExponential(2)),
                        React.createElement(TableCell, { align: "right" }, pathway.entities.pValue.toExponential(2)),
                        React.createElement(TableCell, { align: "right" }, pathway.entities.fdr.toExponential(2)),
                        React.createElement(TableCell, { align: "right" }, pathway.reactions.found),
                        React.createElement(TableCell, { align: "right" }, pathway.reactions.total),
                        React.createElement(TableCell, { align: "right" }, pathway.reactions.ratio.toFixed(3))));
                })))),
        React.createElement(TablePagination, { rowsPerPageOptions: [5, 10, 25], component: "div", count: pathways.length, rowsPerPage: rowsPerPage, page: page, onPageChange: handleChangePage, onRowsPerPageChange: handleChangeRowsPerPage })));
});
export default Pathways;
//# sourceMappingURL=Pathways.js.map