import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Table, TableBody, TableCell, TableHead, TableRow, Chip, Tooltip, Link, } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import BaseCard from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail/BaseCard';
import { getGeneProjectsAsync, getMutationProjectsAsync } from './Utility';
const useStyles = makeStyles()({
    table: {
        padding: 0,
    },
    link: {
        color: 'rgb(0, 0, 238)',
    },
});
function Consequence(props) {
    const { classes } = useStyles();
    const { feature } = props;
    if (!feature.consequence) {
        return null;
    }
    const consequences = feature.consequence.hits.edges;
    return (React.createElement(BaseCard, { title: "Consequence" },
        React.createElement("div", { style: { width: '100%', maxHeight: 600, overflow: 'auto' } },
            React.createElement(Table, { className: classes.table },
                React.createElement(TableHead, null,
                    React.createElement(TableRow, null,
                        React.createElement(TableCell, null, "Gene"),
                        React.createElement(TableCell, null, "AA Change"),
                        React.createElement(TableCell, null, "Consequence"),
                        React.createElement(TableCell, null, "Coding DNA Change"),
                        React.createElement(TableCell, null, "Impact"),
                        React.createElement(TableCell, null, "Gene Strand"),
                        React.createElement(TableCell, null, "Transcript"))),
                React.createElement(TableBody, null, consequences.map((value, i) => value ? (React.createElement(TableRow, { key: i },
                    React.createElement(TableCell, null,
                        React.createElement(Link, { className: classes.link, target: "_blank", rel: "noopener", href: `https://portal.gdc.cancer.gov/genes/${value.node.transcript.gene.gene_id}`, underline: "always" }, value.node.transcript.gene.symbol)),
                    React.createElement(TableCell, null, value.node.transcript.aa_change),
                    React.createElement(TableCell, null, value.node.transcript.consequence_type),
                    React.createElement(TableCell, null, value.node.transcript.annotation.hgvsc),
                    React.createElement(TableCell, null,
                        value.node.transcript.annotation.vep_impact ? (React.createElement(Tooltip, { title: `VEP ${value.node.transcript.annotation.vep_impact}`, "aria-label": "help", placement: "left" },
                            React.createElement("div", null,
                                React.createElement(Chip, { label: value.node.transcript.annotation.vep_impact })))) : null,
                        value.node.transcript.annotation.sift_impact ? (React.createElement(Tooltip, { title: `SIFT ${value.node.transcript.annotation.sift_impact} (${value.node.transcript.annotation.sift_score})`, "aria-label": "help", placement: "left" },
                            React.createElement("div", null,
                                React.createElement(Chip, { label: value.node.transcript.annotation.sift_impact })))) : null,
                        value.node.transcript.annotation.polyphen_impact ? (React.createElement(Tooltip, { title: `PolyPhen ${value.node.transcript.annotation.polyphen_impact} (${value.node.transcript.annotation.polyphen_score})`, "aria-label": "help", placement: "left" },
                            React.createElement("div", null,
                                React.createElement(Chip, { label: value.node.transcript.annotation.polyphen_impact })))) : null),
                    React.createElement(TableCell, null, value.node.transcript.gene.gene_strand === 1 ? (React.createElement(AddIcon, null)) : (React.createElement(RemoveIcon, null))),
                    React.createElement(TableCell, null,
                        React.createElement(Link, { className: classes.link, target: "_blank", rel: "noopener", href: `http://may2015.archive.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${value.node.transcript.transcript_id}`, underline: "always" }, value.node.transcript.transcript_id),
                        value.node.transcript.is_canonical ? (React.createElement(Tooltip, { title: "Canonical transcript", "aria-label": "help", placement: "right" },
                            React.createElement("div", null,
                                React.createElement(Chip, { label: "C" })))) : null))) : null))))));
}
const ExternalLink = observer(function ExternalLink({ id, name, link, }) {
    const { classes } = useStyles();
    return (React.createElement(TableRow, null,
        React.createElement(TableCell, null, name),
        React.createElement(TableCell, null,
            React.createElement(Link, { className: classes.link, target: "_blank", rel: "noopener", href: `${link}${id}`, underline: "always" }, id))));
});
function GeneExternalLinks(props) {
    const { classes } = useStyles();
    const { feature } = props;
    const externalLinkArray = [
        {
            id: feature.geneId,
            name: 'GDC',
            link: 'https://portal.gdc.cancer.gov/genes/',
        },
        {
            id: feature.geneId,
            name: 'ENSEMBL',
            link: 'http://www.ensembl.org/id/',
        },
        {
            id: feature.canonicalTranscriptId,
            name: 'Canonical Transcript ID',
            link: 'http://www.ensembl.org/id/',
        },
        {
            id: feature.externalDbIds.hgnc[0],
            name: 'HGNC',
            link: 'https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/',
        },
        {
            id: feature.externalDbIds.uniprotkbSwissprot[0],
            name: 'UniProtKB Swiss-Prot',
            link: 'http://www.uniprot.org/uniprot/',
        },
        {
            id: feature.externalDbIds.entrezGene[0],
            name: 'NCBI',
            link: 'http://www.ncbi.nlm.nih.gov/gene/',
        },
        {
            id: feature.externalDbIds.omimGene[0],
            name: 'OMIM',
            link: 'https://www.omim.org/entry/',
        },
    ];
    return (React.createElement(BaseCard, { title: "External Links" },
        React.createElement("div", { style: { width: '100%', maxHeight: 600, overflow: 'auto' } },
            React.createElement(Table, { className: classes.table },
                React.createElement(TableBody, null, externalLinkArray.map((externalLink, key) => (React.createElement(ExternalLink, { ...externalLink, key: key }))))))));
}
function removeCosmicPrefix(cosmicId) {
    return cosmicId.replace('COSM', '').replace('COSN', '');
}
const CosmicLinks = observer(function CosmicLinks({ cosmicId, }) {
    const { classes } = useStyles();
    return (React.createElement(TableRow, null,
        React.createElement(TableCell, null, "Cosmic"),
        React.createElement(TableCell, null, cosmicId === null || cosmicId === void 0 ? void 0 : cosmicId.map(value => (React.createElement(Link, { className: classes.link, target: "_blank", rel: "noopener", href: `https://cancer.sanger.ac.uk/cosmic/mutation/overview?id=${removeCosmicPrefix(value)}`, key: value, underline: "always" }, value))))));
});
function SSMExternalLinks(props) {
    const { classes } = useStyles();
    const { feature } = props;
    const externalLinkArray = [
        {
            id: feature.ssmId,
            name: 'GDC',
            link: 'https://portal.gdc.cancer.gov/ssms/',
        },
    ];
    return (React.createElement(BaseCard, { title: "External Links" },
        React.createElement("div", { style: { width: '100%', maxHeight: 600, overflow: 'auto' } },
            React.createElement(Table, { className: classes.table },
                React.createElement(TableBody, null,
                    externalLinkArray.map((externalLink, key) => (React.createElement(ExternalLink, { ...externalLink, key: key }))),
                    feature.cosmicId ? (React.createElement(CosmicLinks, { cosmicId: feature.cosmicId })) : null)))));
}
function SSMProject(props) {
    const { classes } = useStyles();
    const { projectId, docCount, projectsInformation, gdcProjectsCounts } = props;
    const projectInfo = projectsInformation.find((x) => x.node.project_id === projectId);
    const gdcProjectCount = gdcProjectsCounts.find((x) => x.projectId === projectId);
    return (React.createElement(TableRow, { key: projectId },
        React.createElement(TableCell, null,
            React.createElement(Link, { className: classes.link, target: "_blank", rel: "noopener", href: `https://portal.gdc.cancer.gov/projects/${projectId}`, underline: "always" }, projectId)),
        React.createElement(TableCell, null, projectInfo.node.disease_type.join(', ')),
        React.createElement(TableCell, null, projectInfo.node.primary_site.join(', ')),
        React.createElement(TableCell, null,
            docCount,
            " / ",
            gdcProjectCount.docCount)));
}
function SSMProjects(props) {
    const { classes } = useStyles();
    const { featureId } = props;
    const [mutationProjectsCounts, setMutationProjectsCounts] = useState([]);
    const [projectsInformation, setProjectsInformation] = useState([]);
    const [gdcProjectsCounts, setGdcProjectsCounts] = useState([]);
    useEffect(() => {
        getMutationProjectsAsync(featureId)
            .then(data => {
            setProjectsInformation(data.data.projects.hits.edges);
            setGdcProjectsCounts(data.data.viewer.explore.cases.total.project__project_id.buckets);
            setMutationProjectsCounts(data.data.viewer.explore.cases.filtered.project__project_id.buckets);
        })
            .catch((e) => {
            console.error(e);
        });
    }, [featureId]);
    return (React.createElement(BaseCard, { title: "Projects" },
        React.createElement("div", { style: { width: '100%', maxHeight: 600, overflow: 'auto' } },
            React.createElement(Table, { className: classes.table },
                React.createElement(TableHead, null,
                    React.createElement(TableRow, null,
                        React.createElement(TableCell, null, "Project"),
                        React.createElement(TableCell, null, "Disease Type"),
                        React.createElement(TableCell, null, "Site"),
                        React.createElement(TableCell, null, "# Mutation Affected Cases"))),
                React.createElement(TableBody, null, mutationProjectsCounts.map((project, key) => (React.createElement(SSMProject, { projectsInformation: projectsInformation, gdcProjectsCounts: gdcProjectsCounts, key: `${key}-${project.projectId}`, ...project }))))))));
}
function GeneProject(props) {
    const { classes } = useStyles();
    const { projectId, docCount, projectsInformation, cases } = props;
    const projectInfo = projectsInformation.find((x) => x.node.project_id === projectId);
    const totalProjectCaseCount = cases.total.project__project_id.buckets.find((x) => x.projectId === projectId);
    const cnvGainCaseCount = cases.gain.project__project_id.buckets.find((x) => x.projectId === projectId);
    const cnvLossCaseCount = cases.loss.project__project_id.buckets.find((x) => x.projectId === projectId);
    const cnvTotalCaseCount = cases.cnvTotal.project__project_id.buckets.find((x) => x.projectId === projectId);
    return (React.createElement(TableRow, { key: projectId },
        React.createElement(TableCell, null,
            React.createElement(Link, { className: classes.link, target: "_blank", rel: "noopener", href: `https://portal.gdc.cancer.gov/projects/${projectId}`, underline: "always" }, projectId)),
        React.createElement(TableCell, null, projectInfo.node.disease_type.join(', ')),
        React.createElement(TableCell, null, projectInfo.node.primary_site.join(', ')),
        React.createElement(TableCell, null,
            docCount,
            " / ",
            totalProjectCaseCount.docCount),
        React.createElement(TableCell, null,
            cnvGainCaseCount ? cnvGainCaseCount.docCount : '0',
            " /",
            ' ',
            cnvTotalCaseCount ? cnvTotalCaseCount.docCount : '0'),
        React.createElement(TableCell, null,
            cnvLossCaseCount ? cnvLossCaseCount.docCount : '0',
            " /",
            ' ',
            cnvTotalCaseCount ? cnvTotalCaseCount.docCount : '0')));
}
function GeneProjects(props) {
    const { classes } = useStyles();
    const { featureId } = props;
    const [projectsInformation, setProjectsInformation] = useState([]);
    const [geneProjectsCounts, setGeneProjectsCounts] = useState([]);
    const [cases, setCases] = useState([]);
    useEffect(() => {
        getGeneProjectsAsync(featureId)
            .then(data => {
            setProjectsInformation(data.data.projects.hits.edges);
            setCases(data.data.viewer.explore.cases);
            setGeneProjectsCounts(data.data.viewer.explore.cases.filtered.project__project_id.buckets);
        })
            .catch((e) => {
            console.error(e);
        });
    }, [featureId]);
    return (React.createElement(BaseCard, { title: "Projects" },
        React.createElement("div", { style: { width: '100%', maxHeight: 600, overflow: 'auto' } },
            React.createElement(Table, { className: classes.table },
                React.createElement(TableHead, null,
                    React.createElement(TableRow, null,
                        React.createElement(TableCell, null, "Project"),
                        React.createElement(TableCell, null, "Disease Type"),
                        React.createElement(TableCell, null, "Site"),
                        React.createElement(TableCell, null, "# Mutation Affected Cases"),
                        React.createElement(TableCell, null, "# CNV Gains"),
                        React.createElement(TableCell, null, "# CNV Losses"))),
                React.createElement(TableBody, null, cases &&
                    projectsInformation &&
                    (geneProjectsCounts === null || geneProjectsCounts === void 0 ? void 0 : geneProjectsCounts.map((project, key) => (React.createElement(GeneProject, { cases: cases, projectsInformation: projectsInformation, key: `${key}-${project.projectId}`, ...project })))))))));
}
export const GDCExtraPanel = observer(function GDCExtraPanel({ feature, }) {
    return (React.createElement(React.Fragment, null,
        feature.geneId !== undefined ? (React.createElement(GeneExternalLinks, { feature: feature })) : null,
        feature.ssmId !== undefined ? (React.createElement(SSMExternalLinks, { feature: feature })) : null,
        feature.ssmId !== undefined ? React.createElement(Consequence, { feature: feature }) : null,
        feature.geneId !== undefined ? (React.createElement(GeneProjects, { featureId: feature.geneId })) : null,
        feature.ssmId !== undefined ? (React.createElement(SSMProjects, { featureId: feature.ssmId })) : null));
});
//# sourceMappingURL=GDCFeatureWidget.js.map