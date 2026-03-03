import { ConfigurationSchema, ConfigurationReference, readConfObject, getConf } from '@jbrowse/core/configuration';
import Plugin from '@jbrowse/core/Plugin';
import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType';
import InternetAccountType from '@jbrowse/core/pluggableElementTypes/InternetAccountType';
import { BaseInternetAccountConfig, InternetAccount, createBaseTrackConfig, createBaseTrackModel } from '@jbrowse/core/pluggableElementTypes/models';
import { getSession, isSessionModelWithWidgets, isAbstractMenuManager } from '@jbrowse/core/util';
import { storeBlobLocation, getParentRenderProps, getFileName } from '@jbrowse/core/util/tracks';
import SvgIcon from '@mui/material/SvgIcon';
import React, { useState, useEffect, useRef } from 'react';
import { ElementId } from '@jbrowse/core/util/types/mst';
import { types, getEnv } from 'mobx-state-tree';
import { v4 } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import { observer } from 'mobx-react';
import { List, ListItem, FormControl, Select, MenuItem, Input, Checkbox, ListItemText, Tooltip, IconButton, Button, Paper, Typography, InputLabel, FormHelperText, Table, TableHead, TableRow, TableCell, TableBody, Chip, Alert, Grid, Box, Tabs, Tab, Link, Divider, DialogContent, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import UndoIcon from '@mui/icons-material/Undo';
import RemoveIcon from '@mui/icons-material/Remove';
import { FeatureDetails, BaseCard } from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import InfoIcon from '@mui/icons-material/Info';
import { Dialog } from '@jbrowse/core/ui';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FilterListIcon from '@mui/icons-material/FilterList';
import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import AbortablePromiseCache from 'abortable-promise-cache';
import LRU from '@jbrowse/core/util/QuickLRU';
import { openLocation } from '@jbrowse/core/util/io';
import SimpleFeature from '@jbrowse/core/util/simpleFeature';
import pako from 'pako';
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
import TrackType$1 from '@jbrowse/core/pluggableElementTypes/TrackType';
import WidgetType from '@jbrowse/core/pluggableElementTypes/WidgetType';

// Icon below come from https://fonts.google.com/icons?selected=Material%20Icons%3Adata_exploration%3A
function DataExploration(props) {
    return (React.createElement(SvgIcon, { ...props },
        React.createElement("path", { d: "M12,2C6.48,2,2,6.48,2,12c0,1.33,0.26,2.61,0.74,3.77L8,10.5l3.3,2.78L14.58,10H13V8h5v5h-2v-1.58L11.41,16l-3.29-2.79 l-4.4,4.4C5.52,20.26,8.56,22,12,22h8c1.1,0,2-0.9,2-2v-8C22,6.48,17.52,2,12,2z M19.5,20.5c-0.55,0-1-0.45-1-1s0.45-1,1-1 s1,0.45,1,1S20.05,20.5,19.5,20.5z" })));
}

var version = "2.3.1";

var stateModel = (function (jbrowse) {
  var Filter = types.model({
    id: types.identifier,
    category: types.string,
    type: types.string,
    filter: types.string
  }).actions(function (self) {
    return {
      setCategory: function setCategory(newCategory) {
        self.category = newCategory;
        self.filter = '';
      },
      setFilter: function setFilter(newFilter) {
        self.filter = newFilter;
      }
    };
  });
  var ColourBy = types.model({
    id: types.identifier,
    value: types.string
  });
  return types.model('GDCFilterWidget', {
    id: ElementId,
    type: types.literal('GDCFilterWidget'),
    target: types.safeReference(jbrowse.pluggableConfigSchemaType('track')),
    filters: types.array(Filter),
    colourBy: types.map(ColourBy)
  }).actions(function (self) {
    return {
      setTarget: function setTarget(newTarget) {
        self.target = newTarget;
      },
      addFilter: function addFilter(id, category, type, filter) {
        self.filters.push(Filter.create({
          id: id,
          category: category,
          type: type,
          filter: filter
        }));
      },
      deleteFilter: function deleteFilter(id) {
        var pos = self.filters.findIndex(function (filter) {
          return filter.id === id;
        });
        self.filters.remove(self.filters[pos]);
      },
      getFiltersByType: function getFiltersByType(type) {
        return self.filters.filter(function (filter) {
          return filter.type === type;
        });
      },
      clearFilters: function clearFilters() {
        // Keep filters that have been added but not set
        self.filters = self.filters.filter(function (f) {
          return f.filter.length === 0;
        });
      },
      setColourBy: function setColourBy(newColourBy) {
        self.colourBy[0] = newColourBy;
      },
      getColourBy: function getColourBy() {
        return self.colourBy[0] ? self.colourBy[0] : {};
      }
    };
  });
});

/**
 * An element representing an individual filter with a category and set of
 * applied values
 */
const Filter = observer((props) => {
    const { schema, filterModel, facets } = props;
    const [categoryValue, setCategoryValue] = useState(filterModel.category
        ? facets.find((f) => f.name === filterModel.category)
        : facets[0]);
    const [filterValue, setFilterValue] = useState(filterModel.filter ? filterModel.filter.split(',') : []);
    /**
     * Converts filter model objects to a GDC filter query and updates the track
     * @param {*} filters Array of filter model objects
     * @param {*} target Track target
     */
    function updateTrack(filters, target) {
        let gdcFilters = {
            op: 'and',
            content: [],
        };
        if (filters.length > 0) {
            for (const filter of filters) {
                if (filter.filter !== '') {
                    gdcFilters.content?.push({
                        op: 'in',
                        content: {
                            field: `${filter.type}s.${filter.category}`,
                            value: filter.filter.split(','),
                        },
                    });
                }
            }
        }
        else {
            gdcFilters = {};
        }
        target.adapter.filters.set(JSON.stringify(gdcFilters));
    }
    const handleFilterDelete = () => {
        schema.deleteFilter(filterModel.id);
        updateTrack(schema.filters, schema.target);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(List, null,
            React.createElement(ListItem, { style: { gap: '4px' } },
                React.createElement(FormControl, { fullWidth: true, size: "small" },
                    React.createElement(Select, { labelId: "category-select-label", id: "category-select", value: categoryValue, onChange: event => {
                            setCategoryValue(event.target.value);
                            setFilterValue([]);
                            filterModel.setCategory(event.target.value.name);
                        }, label: "Category" }, facets.map((filterOption) => (React.createElement(MenuItem, { value: filterOption, key: filterOption.name }, filterOption.prettyName))))),
                React.createElement(FormControl, { fullWidth: true, size: "small" },
                    React.createElement(Select, { labelId: "demo-mutiple-checkbox-label", id: "demo-mutiple-checkbox", multiple: true, value: filterValue, onChange: event => {
                            setFilterValue(event.target.value);
                            filterModel.setFilter(event.target.value.join(','));
                            updateTrack(schema.filters, schema.target);
                        }, input: React.createElement(Input, null), displayEmpty: true, renderValue: selected => {
                            if (selected.length === 0) {
                                return React.createElement("em", null, "Filters");
                            }
                            return selected.join(', ');
                        } },
                        React.createElement(MenuItem, { disabled: true, value: "" },
                            React.createElement("em", null, "Filters")),
                        categoryValue.values.map((name) => (React.createElement(MenuItem, { key: name, value: name },
                            React.createElement(Checkbox, { checked: filterValue.indexOf(name) > -1 }),
                            React.createElement(ListItemText, { primary: name })))))),
                React.createElement(Tooltip, { title: "Remove filter", "aria-label": "remove", placement: "bottom" },
                    React.createElement(IconButton, { "aria-label": "remove filter", onClick: handleFilterDelete },
                        React.createElement(ClearIcon, null)))))));
});
/**
 * A collection of filters along with a button to add new filters
 */
const FilterList = observer(({ schema, type, facets }) => {
    const initialFilterSelection = facets[0].name;
    const handleClick = () => {
        schema.addFilter(v4(), initialFilterSelection, type, '');
    };
    return (React.createElement(React.Fragment, null,
        schema.filters.map((filterModel) => {
            if (filterModel.type === type) {
                return (React.createElement(Filter, { schema: schema, filterModel, key: filterModel.id, facets: facets }));
            }
            return null;
        }),
        React.createElement(Button, { variant: "outlined", onClick: handleClick, startIcon: React.createElement(AddIcon, null) }, "Add Filter")));
});

// TODO: Convert these to use the GDC API
const ssmFacets = [
    {
        name: 'consequence.transcript.annotation.polyphen_impact',
        prettyName: 'polyphen impact',
        values: ['benign', 'probably_damaging', 'possibly_damaging', 'unknown'],
    },
    {
        name: 'consequence.transcript.annotation.sift_impact',
        prettyName: 'sift impact',
        values: [
            'deleterious',
            'tolerated',
            'deleterious_low_confidence',
            'tolerated_low_confidence',
        ],
    },
    {
        name: 'consequence.transcript.annotation.vep_impact',
        prettyName: 'vep impact',
        values: ['modifier', 'moderate', 'low', 'high'],
    },
    {
        name: 'consequence.transcript.consequence_type',
        prettyName: 'consequence type',
        values: [
            'missense_variant',
            'downstream_gene_variant',
            'non_coding_transcript_exon_variant',
            'synonymous_variant',
            'intron_variant',
            'upstream_gene_variant',
            '3_prime_UTR_variant',
            'stop_gained',
            'frameshift_variant',
            '5_prime_UTR_variant',
            'splice_region_variant',
            'splice_acceptor_variant',
            'splice_donor_variant',
            'inframe_deletion',
            'inframe_insertion',
            'start_lost',
            'protein_altering_variant',
            'stop_lost',
            'stop_retained_variant',
            'coding_sequence_variant',
            'incomplete_terminal_codon_variant',
            'mature_miRNA_variant',
        ],
    },
    {
        name: 'mutation_subtype',
        prettyName: 'mutation subtype',
        values: ['single base substitution', 'small deletion', 'small insertion'],
    },
    {
        name: 'occurrence.case.observation.variant_calling.variant_caller',
        prettyName: 'variant caller',
        values: ['mutect2', 'varscan', 'muse', 'somaticsniper'],
    },
];
const geneFacets = [
    {
        name: 'biotype',
        prettyName: 'biotype',
        values: [
            'protein_coding',
            'lincRNA',
            'miRNA',
            'transcribed_unprocessed_pseudogene',
            'processed_pseudogene',
            'antisense',
            'unprocessed_pseudogene',
            'snoRNA',
            'IG_V_gene',
            'processed_transcript',
            'transcribed_processed_pseudogene',
            'TR_V_gene',
            'TR_J_gene',
            'unitary_pseudogene',
            'misc_RNA',
            'snRNA',
            'IG_V_pseudogene',
            'polymorphic_pseudogene',
            'IG_D_gene',
            'sense_overlapping',
            'sense_intronic',
            'IG_C_gene',
            'TEC',
            'IG_J_gene',
            'rRNA',
            'TR_C_gene',
            'TR_D_gene',
            'TR_V_pseudogene',
            'macro_lncRNA',
            'transcribed_unitary_pseudogene',
            'translated_unprocessed_pseudogene',
            'vaultRNA',
        ],
    },
    {
        name: 'is_cancer_gene_census',
        prettyName: 'is cancer gene census',
        values: ['true'],
    },
];
const caseFacets = [
    {
        name: 'demographic.ethnicity',
        prettyName: 'ethnicity',
        values: [
            'not hispanic or latino',
            'not reported',
            'hispanic or latino',
            'unknown',
        ],
    },
    {
        name: 'demographic.gender',
        prettyName: 'gender',
        values: ['female', 'male', 'unknown', 'not reported', 'unspecified'],
    },
    {
        name: 'demographic.race',
        prettyName: 'race',
        values: [
            'white',
            'not reported',
            'unknown',
            'black or african american',
            'asian',
            'other',
            'american indian or alaska native',
            'native hawaiian or other pacific islander',
            'not allowed to collect',
        ],
    },
    {
        name: 'disease_type',
        prettyName: 'disease type',
        values: [
            'adenomas and adenocarcinomas',
            'ductal and lobular neoplasms',
            'epithelial neoplasms, nos',
            'gliomas',
            'squamous cell neoplasms',
            'myeloid leukemias',
            'cystic, mucinous and serous neoplasms',
            'nevi and melanomas',
            'lymphoid leukemias',
            'transitional cell papillomas and carcinomas',
            'complex mixed and stromal neoplasms',
            'neuroepitheliomatous neoplasms',
            'neoplasms, nos',
            'plasma cell tumors',
            'germ cell neoplasms',
            'mesothelial neoplasms',
            'myomatous neoplasms',
            'osseous and chondromatous neoplasms',
            'mature b-cell lymphomas',
            'chronic myeloproliferative disorders',
            'lymphoid neoplasm diffuse large b-cell lymphoma',
            'myelodysplastic syndromes',
            'lipomatous neoplasms',
            'fibromatous neoplasms',
            'acinar cell neoplasms',
            'meningiomas',
            'soft tissue tumors and sarcomas, nos',
            'not reported',
            'thymic epithelial neoplasms',
            'complex epithelial neoplasms',
            'paragangliomas and glomus tumors',
            'leukemias, nos',
            'blood vessel tumors',
            'miscellaneous bone tumors',
            'specialized gonadal neoplasms',
            'nerve sheath tumors',
            'synovial-like neoplasms',
            'mature t- and nk-cell lymphomas',
            'not applicable',
            'miscellaneous tumors',
            'other leukemias',
            'neoplasms of histiocytes and accessory lymphoid cells',
            'mucoepidermoid neoplasms',
            'adnexal and skin appendage neoplasms',
            'basal cell neoplasms',
            'unknown',
            'malignant lymphomas, nos or diffuse',
            'fibroepithelial neoplasms',
            'granular cell tumors and alveolar soft part sarcomas',
            'hodgkin lymphoma',
            'trophoblastic neoplasms',
            'myxomatous neoplasms',
            'precursor cell lymphoblastic lymphoma',
            'mast cell tumors',
            'mesonephromas',
            'immunoproliferative diseases',
            'giant cell tumors',
            'odontogenic tumors',
            'lymphatic vessel tumors',
            'other hematologic disorders',
        ],
    },
    {
        name: 'primary_site',
        prettyName: 'primary site',
        values: [
            'bronchus and lung',
            'hematopoietic and reticuloendothelial systems',
            'breast',
            'colon',
            'spinal cord, cranial nerves, and other parts of central nervous system',
            'ovary',
            'kidney',
            'unknown',
            'skin',
            'pancreas',
            'prostate gland',
            'uterus, nos',
            'bladder',
            'liver and intrahepatic bile ducts',
            'connective, subcutaneous and other soft tissues',
            'thyroid gland',
            'brain',
            'esophagus',
            'stomach',
            'rectum',
            'other and ill-defined sites',
            'adrenal gland',
            'corpus uteri',
            'other and ill-defined digestive organs',
            'heart, mediastinum, and pleura',
            'cervix uteri',
            'other and unspecified major salivary glands',
            'lymph nodes',
            'testis',
            'bones, joints and articular cartilage of other and unspecified sites',
            'retroperitoneum and peritoneum',
            'other and ill-defined sites in lip, oral cavity and pharynx',
            'not reported',
            'thymus',
            'peripheral nerves and autonomic nervous system',
            'bones, joints and articular cartilage of limbs',
            'small intestine',
            'gallbladder',
            'meninges',
            'anus and anal canal',
            'eye and adnexa',
            'other and unspecified parts of biliary tract',
            'other and unspecified urinary organs',
            'oropharynx',
            'other endocrine glands and related structures',
            'larynx',
            'other and unspecified female genital organs',
            'other and unspecified parts of tongue',
            'nasopharynx',
            'rectosigmoid junction',
            'vagina',
            'floor of mouth',
            'tonsil',
            'other and unspecified parts of mouth',
            'nasal cavity and middle ear',
            'penis',
            'hypopharynx',
            'base of tongue',
            'ureter',
            'gum',
            'vulva',
            'lip',
            'trachea',
            'palate',
            'blood',
            'other and unspecified male genital organs',
            'renal pelvis',
        ],
    },
    {
        name: 'project.program.name',
        prettyName: 'program name',
        values: [
            'GENIE',
            'FM',
            'TCGA',
            'TARGET',
            'MMRF',
            'CPTAC',
            'BEATAML1.0',
            'NCICCR',
            'OHSU',
            'CGCI',
            'WCDT',
            'ORGANOID',
            'CTSP',
            'HCMI',
            'VAREPOP',
        ],
    },
    {
        name: 'project.project_id',
        prettyName: 'project id',
        values: [
            'FM-AD',
            'GENIE-MSK',
            'GENIE-DFCI',
            'GENIE-MDA',
            'GENIE-JHU',
            'GENIE-UHN',
            'TARGET-AML',
            'GENIE-VICC',
            'TARGET-ALL-P2',
            'TARGET-NBL',
            'TCGA-BRCA',
            'GENIE-GRCC',
            'MMRF-COMMPASS',
            'GENIE-NKI',
            'TARGET-WT',
            'TCGA-GBM',
            'TCGA-OV',
            'TCGA-LUAD',
            'BEATAML1.0-COHORT',
            'TCGA-UCEC',
            'TCGA-KIRC',
            'TCGA-HNSC',
            'TCGA-LGG',
            'TCGA-THCA',
            'TCGA-LUSC',
            'TCGA-PRAD',
            'NCICCR-DLBCL',
            'TCGA-SKCM',
            'TCGA-COAD',
            'TCGA-STAD',
            'CPTAC-3',
            'TCGA-BLCA',
            'TARGET-OS',
            'TCGA-LIHC',
            'CPTAC-2',
            'TCGA-CESC',
            'TCGA-KIRP',
            'TCGA-SARC',
            'TCGA-LAML',
            'TARGET-ALL-P3',
            'TCGA-ESCA',
            'TCGA-PAAD',
            'TCGA-PCPG',
            'OHSU-CNL',
            'TCGA-READ',
            'TCGA-TGCT',
            'TCGA-THYM',
            'CGCI-BLGSP',
            'TCGA-KICH',
            'WCDT-MCRPC',
            'TCGA-ACC',
            'TCGA-MESO',
            'TCGA-UVM',
            'ORGANOID-PANCREATIC',
            'TARGET-RT',
            'TCGA-DLBC',
            'TCGA-UCS',
            'BEATAML1.0-CRENOLANIB',
            'TCGA-CHOL',
            'CTSP-DLBCL1',
            'TARGET-ALL-P1',
            'HCMI-CMDC',
            'TARGET-CCSK',
            'VAREPOP-APOLLO',
        ],
    },
    {
        name: 'samples.sample_type',
        prettyName: 'sample type',
        values: [
            'primary tumor',
            'metastatic',
            'blood derived normal',
            'primary blood derived cancer - bone marrow',
            'solid tissue normal',
            'tumor',
            'not reported',
            'bone marrow normal',
            'primary blood derived cancer - peripheral blood',
            'recurrent blood derived cancer - bone marrow',
            'recurrent blood derived cancer - peripheral blood',
            'blood derived cancer - peripheral blood',
            'recurrent tumor',
            'next generation cancer model',
            'blood derived cancer - bone marrow, post-treatment',
            'granulocytes',
            'fibroblasts from bone marrow normal',
            'primary xenograft tissue',
            'buccal cell normal',
            'blood derived cancer - bone marrow',
            'unknown',
            'additional - new primary',
            'mononuclear cells from bone marrow normal',
            'blood derived cancer - peripheral blood, post-treatment',
            'cell lines',
            'ffpe scrolls',
            'expanded next generation cancer model',
            'additional metastatic',
            'lymphoid normal',
            'post neo-adjuvant therapy',
            'control analyte',
            'slides',
        ],
    },
    {
        name: 'summary.experimental_strategies.experimental_strategy',
        prettyName: 'experimental strategy',
        values: [
            'Targeted Sequencing',
            'WXS',
            'RNA-Seq',
            'miRNA-Seq',
            'Genotyping Array',
            'Methylation Array',
            'Tissue Slide',
            'Diagnostic Slide',
            'WGS',
            'ATAC-Seq',
        ],
    },
];
const mutationHighlightFeatures = [
    {
        name: 'VEP',
        attributeName: 'vep_impact',
        type: 'category',
        description: 'Colour by VEP impact (canonical transcript).',
        values: [
            { name: 'LOW', colour: 'blue' },
            { name: 'MODIFIER', colour: 'goldenrod' },
            { name: 'MODERATE', colour: 'green' },
            { name: 'HIGH', colour: 'red' },
            { name: '', colour: 'lightgrey' },
        ],
    },
    {
        name: 'PolyPhen',
        type: 'category',
        attributeName: 'polyphen_impact',
        description: 'Colour by PolyPhen impact (canonical transcript).',
        values: [
            { name: 'benign', colour: 'green' },
            { name: 'possibly_damaging', colour: 'orange' },
            { name: 'probably_damaging', colour: 'red' },
            { name: 'unknown', colour: 'grey' },
            { name: '', colour: 'lightgrey' },
        ],
    },
    {
        name: 'SIFT',
        type: 'category',
        attributeName: 'sift_impact',
        description: 'Colour by SIFT impact (canonical transcript).',
        values: [
            { name: 'deleterious', colour: 'red' },
            { name: 'tolerated', colour: 'green' },
            { name: 'deleterious_low_confidence', colour: 'lightcoral' },
            { name: 'tolerated_low_confidence', colour: 'lightgreen' },
            { name: '', colour: 'lightgrey' },
        ],
    },
    {
        name: 'Mutation Subtype',
        type: 'category',
        attributeName: 'mutationSubtype',
        description: 'Colour by the type of mutation.',
        values: [
            { name: 'Single base substitution', colour: 'green' },
            { name: 'Small deletion', colour: 'red' },
            { name: 'Small insertion', colour: 'blue' },
            { name: '', colour: 'lightgrey' },
        ],
    },
    {
        name: 'Mutation Count',
        type: 'threshold',
        description: 'Colour by mutation occurrence count across the current cohort.',
        attributeName: 'score',
        values: [{ name: 'Count', colour1: 'red', colour2: 'blue', threshold: 2 }],
    },
    {
        name: 'Mutation Frequency',
        type: 'percentage',
        description: 'Frequency of mutation occurrence across the current cohort.',
        attributeName: 'percentage',
        values: [
            { name: 'Percentage', colour1: 'darkgreen', colour2: 'lightgreen' },
        ],
    },
];
const geneHighlightFeatures = [
    {
        name: 'Is Cancer Gene Census',
        attributeName: 'isCancerGeneCensus',
        type: 'boolean',
        description: 'Colour by cancer gene census status.',
        values: [
            { name: 'Is Cancer Gene Census', colour1: 'red', colour2: 'blue' },
        ],
    },
];

const useStyles$6 = makeStyles()(theme => ({
    root: {
        padding: theme.spacing(1, 3, 1, 1),
        background: theme.palette.background.default,
        overflowX: 'hidden',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 150,
    },
    text: {
        display: 'flex',
        alignItems: 'center',
    },
    paper: {
        padding: theme.spacing(2),
    },
}));
/**
 * Render a highlight/colour by element for colouring features
 */
const HighlightFeature = observer(({ schema, type }) => {
    const { classes } = useStyles$6();
    const [colourBy, setColourBy] = useState(Object.keys(schema.getColourBy()).length !== 0
        ? JSON.parse(schema.getColourBy())
        : '');
    const highlightFeatures = type === 'mutation' ? mutationHighlightFeatures : geneHighlightFeatures;
    return (React.createElement(React.Fragment, null,
        React.createElement(Paper, { className: classes.paper },
            React.createElement(Typography, { variant: "h6" }, "Colour Features"),
            React.createElement(FormControl, { size: "small" },
                React.createElement(InputLabel, null, "Attribute"),
                React.createElement(Select, { labelId: "track-type-select-label", id: "track-type-select", value: colourBy, onChange: event => {
                        const hlBy = event.target.value;
                        setColourBy(hlBy);
                        let colourFunction = '';
                        if (hlBy.type === 'threshold') {
                            colourFunction = `jexl:get(feature,'${hlBy.attributeName}') >= ${hlBy.values[0].threshold} ? '${hlBy.values[0].colour1}' : '${hlBy.values[0].colour2}'`;
                        }
                        else if (hlBy.type === 'category') {
                            colourFunction = `jexl:switch(feature,'${JSON.stringify(hlBy)}')`;
                        }
                        else if (hlBy.type === 'boolean') {
                            colourFunction = `jexl:cancer(feature,'${hlBy.attributeName}')`;
                        }
                        else if (hlBy.type === 'percentage') {
                            colourFunction = `jexl:rgb(feature,'${hlBy.attributeName}')`;
                        }
                        else {
                            colourFunction = `jexl:cast('goldenrod')`;
                        }
                        // Set to function
                        schema.target.displays[0].renderer.color1.set(colourFunction);
                        // Set to colour array element
                        schema.setColourBy(JSON.stringify(hlBy));
                        schema.target.adapter.colourBy.set(JSON.stringify(hlBy));
                    }, renderValue: selected => selected.name }, highlightFeatures.map(element => (React.createElement(MenuItem, { value: element.name, key: element.name }, element.name)))),
                React.createElement(FormHelperText, null, "Select how to colour features on the track based on feature attributes.")),
            colourBy?.values && (React.createElement("div", null,
                React.createElement(Typography, { variant: "subtitle2", className: classes.text }, colourBy.symbol),
                colourBy.values && colourBy.type === 'category' && (React.createElement(Table, null,
                    React.createElement(TableHead, null,
                        React.createElement(TableRow, null,
                            React.createElement(TableCell, null, "Value"),
                            React.createElement(TableCell, null, "Corresponding colour"))),
                    React.createElement(TableBody, null, colourBy.values?.map((value) => (React.createElement(TableRow, { key: value.name },
                        React.createElement(TableCell, null, value.name !== '' ? value.name : 'n/a'),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour, style: {
                                    backgroundColor: value.colour,
                                    color: 'white',
                                } })))))))),
                colourBy.values && colourBy.type === 'threshold' && (React.createElement(Table, null,
                    React.createElement(TableHead, null,
                        React.createElement(TableRow, null,
                            React.createElement(TableCell, null, "Value"),
                            React.createElement(TableCell, null, "Threshold"),
                            React.createElement(TableCell, null, "Below"),
                            React.createElement(TableCell, null, "Equal or Above"))),
                    React.createElement(TableBody, null, colourBy.values?.map((value) => (React.createElement(TableRow, { key: value.name },
                        React.createElement(TableCell, null, value.name !== '' ? value.name : 'n/a'),
                        React.createElement(TableCell, null, value.threshold),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour2, style: {
                                    backgroundColor: value.colour2,
                                    color: 'white',
                                } })),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour1, style: {
                                    backgroundColor: value.colour1,
                                    color: 'white',
                                } })))))))),
                colourBy.values && colourBy.type === 'boolean' && (React.createElement(Table, null,
                    React.createElement(TableHead, null,
                        React.createElement(TableRow, null,
                            React.createElement(TableCell, null, "Value"),
                            React.createElement(TableCell, null, "True"),
                            React.createElement(TableCell, null, "False"))),
                    React.createElement(TableBody, null, colourBy.values?.map((value) => (React.createElement(TableRow, { key: value.name },
                        React.createElement(TableCell, null, value.name !== '' ? value.name : 'n/a'),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour1, style: {
                                    backgroundColor: value.colour1,
                                    color: 'white',
                                } })),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour2, style: {
                                    backgroundColor: value.colour2,
                                    color: 'white',
                                } })))))))),
                colourBy.values && colourBy.type === 'percentage' && (React.createElement(Table, null,
                    React.createElement(TableHead, null,
                        React.createElement(TableRow, null,
                            React.createElement(TableCell, null, "Value"),
                            React.createElement(TableCell, null, "Low"),
                            React.createElement(TableCell, null, "High"))),
                    React.createElement(TableBody, null, colourBy.values?.map((value) => (React.createElement(TableRow, { key: value.name },
                        React.createElement(TableCell, null, value.name !== '' ? value.name : 'n/a'),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour1, style: {
                                    backgroundColor: value.colour1,
                                    color: 'white',
                                } })),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour2, style: {
                                    backgroundColor: value.colour2,
                                    color: 'white',
                                } })))))))))))));
});

const useStyles$5 = makeStyles()(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    paper: {
        padding: theme.spacing(2),
    },
}));
/**
 * A component for changing the track type
 */
var TrackType = observer((schema) => {
    const { classes } = useStyles$5();
    const [trackType, setTrackType] = React.useState(schema.schema.target.adapter.featureType.value);
    return (React.createElement("div", { className: classes.root },
        React.createElement(Paper, { className: classes.paper },
            React.createElement(Typography, { variant: "h6" }, "Track Type"),
            React.createElement(FormControl, { size: "small" },
                React.createElement(Select, { labelId: "track-type-select-label", id: "track-type-select", value: trackType, onChange: event => {
                        setTrackType(event.target.value);
                        schema.schema.target.adapter.featureType.set(event.target.value);
                        // Set to function
                        schema.schema.target.displays[0].renderer.color1.set(`jexl:cast('goldenrod')`);
                        // Set to colour array element
                        schema.schema.setColourBy('{}');
                        schema.schema.target.adapter.colourBy.set('{}');
                    } },
                    React.createElement(MenuItem, { value: "mutation" }, "Mutation"),
                    React.createElement(MenuItem, { value: "gene" }, "Gene")),
                React.createElement(FormHelperText, null, "Select what to retrieve from the GDC with your selected filters.")))));
});

const useStyles$4 = makeStyles()(theme => ({
    root: {
        margin: theme.spacing(1),
    },
    paper: {
        padding: theme.spacing(2),
    },
    tabRoot: {
        width: '33%',
        minWidth: '100px',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 150,
    },
    filterCard: {
        margin: theme.spacing(1),
    },
    text: {
        display: 'flex',
        alignItems: 'center',
    },
}));
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (React.createElement("div", { role: "tabpanel", hidden: value !== index, id: `simple-tabpanel-${index}`, "aria-labelledby": `simple-tab-${index}`, ...other }, value === index && React.createElement(Box, { style: { padding: 3 } }, children)));
}
/**
 * Creates the form for interacting with the track filters
 */
const GDCQueryBuilder = observer(({ schema }) => {
    const [isValidGDCFilter, setIsValidGDCFilter] = useState(true);
    const [isValidColourBy, setIsValidColourBy] = useState(true);
    const [validationMessage, setFilterValidationMessage] = useState('');
    const [colourValidationMessage, setColourValidationMessage] = useState('');
    const [value, setValue] = useState(0);
    schema.clearFilters();
    useEffect(() => {
        try {
            const filters = JSON.parse(schema.target.adapter.filters.value);
            if (filters.content && filters.content.length > 0) {
                for (const filter of filters.content) {
                    let type;
                    if (filter.content.field.startsWith('cases.')) {
                        type = 'case';
                    }
                    else if (filter.content.field.startsWith('ssms.')) {
                        type = 'ssm';
                    }
                    else if (filter.content.field.startsWith('genes.')) {
                        type = 'gene';
                    }
                    else {
                        setIsValidGDCFilter(false);
                        setFilterValidationMessage(`The filter ${filter.content.field} is missing a type prefix and is invalid. Any changes on this panel will overwrite invalid filters.`);
                    }
                    if (type) {
                        const name = filter.content.field.replace(`${type}s.`, '');
                        schema.addFilter(v4(), name, type, filter.content.value.join(','));
                    }
                }
            }
        }
        catch (error) {
            setIsValidGDCFilter(false);
            setFilterValidationMessage('The current filters are not in the expected format. Any changes on this panel will overwrite invalid filters.');
        }
    }, [schema, value, schema.target.adapter.featureType.value]);
    useEffect(() => {
        try {
            const colourBy = JSON.parse(schema.target.adapter.colourBy.value);
            const expectedAttributes = [
                'name',
                'type',
                'attributeName',
                'values',
                'description',
            ];
            let matchingKeys = true;
            expectedAttributes.forEach(key => {
                if (!(key in colourBy)) {
                    matchingKeys = false;
                }
            });
            if (matchingKeys || Object.keys(colourBy).length === 0) {
                schema.setColourBy(colourBy);
            }
            else {
                setIsValidColourBy(false);
                setColourValidationMessage('The current colour by option is not in the expected format. Any changes on this panel will overwrite the invalid selection.');
            }
        }
        catch (error) {
            setIsValidColourBy(false);
            setColourValidationMessage('The current colour by option is not in the expected format. Any changes on this panel will overwrite the invalid selection.');
        }
    }, [schema]);
    const { classes } = useStyles$4();
    return (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        !isValidGDCFilter && React.createElement(Alert, { severity: "info" }, validationMessage),
        React.createElement(TrackType, { schema: schema }),
        React.createElement(Paper, { className: classes.paper },
            React.createElement(Grid, { container: true, style: { gap: '4px' } },
                React.createElement(Typography, { variant: "h6" }, "Filters"),
                React.createElement(Tooltip, { title: "Clear all filters", "aria-label": "clear all filters", onClick: () => {
                        schema.clearFilters();
                        schema.target.adapter.filters.set('{}');
                    } },
                    React.createElement(IconButton, { size: "small", color: "primary", "data-testid": "clear_all_filters_icon_button" },
                        React.createElement(UndoIcon, null)))),
            React.createElement(Box, null,
                React.createElement(Tabs, { value: value, onChange: (_, val) => setValue(val), "aria-label": "filtering tabs" },
                    React.createElement(Tab, { classes: { root: classes.tabRoot }, label: "Cases" }),
                    React.createElement(Tab, { classes: { root: classes.tabRoot }, label: "Genes" }),
                    React.createElement(Tab, { classes: { root: classes.tabRoot }, label: "Mutations" }))),
            React.createElement(TabPanel, { value: value, index: 0 },
                React.createElement(FilterList, { schema: schema, type: "case", facets: caseFacets })),
            React.createElement(TabPanel, { value: value, index: 1 },
                React.createElement(FilterList, { schema: schema, type: "gene", facets: geneFacets })),
            React.createElement(TabPanel, { value: value, index: 2 },
                React.createElement(FilterList, { schema: schema, type: "ssm", facets: ssmFacets }))),
        !isValidColourBy && (React.createElement(Alert, { severity: "info" }, colourValidationMessage)),
        schema.target.adapter.featureType.value === 'mutation' && (React.createElement(HighlightFeature, { schema: schema, type: "mutation" })),
        schema.target.adapter.featureType.value === 'gene' && (React.createElement(HighlightFeature, { schema: schema, type: "gene" }))));
});
const ConfigurationEditor = observer(({ model }) => {
    const { classes } = useStyles$4();
    return (React.createElement("div", { className: classes.root, "data-testid": "configEditor" }, !model.target ? ('no target set') : (React.createElement(GDCQueryBuilder, { schema: model, key: "configEditor" }))));
});

var GDCFilterWidgetF = (jbrowse) => {
    return {
        configSchema: ConfigurationSchema('GDCFilterWidget', {}),
        ReactComponent: ConfigurationEditor,
        stateModel: jbrowse.load(stateModel),
        HeadingComponent: () => React.createElement(React.Fragment, null, "GDC Filters"),
    };
};

const configSchema = ConfigurationSchema('GDCFeatureWidget', {});
function stateModelFactory$1(_pluginManager) {
    const stateModel = types
        .model('GDCFeatureWidget', {
        id: ElementId,
        type: types.literal('GDCFeatureWidget'),
        featureData: types.frozen({}),
    })
        .actions(self => ({
        setFeatureData(data) {
            self.featureData = data;
        },
        clearFeatureData() {
            self.featureData = {};
        },
    }));
    return stateModel;
}

/**
 * Query the GDC API for project information related to the given gene
 * @param {String} featureId Gene ID
 */
async function getGeneProjectsAsync(featureId) {
    const query = {
        query: `query ProjectTable( $caseAggsFilters: FiltersArgument $ssmTested: FiltersArgument $cnvGain: FiltersArgument $cnvLoss: FiltersArgument $cnvTested: FiltersArgument $projectCount: Int ) { viewer { explore { cases { gain: aggregations(filters: $cnvGain) { project__project_id { buckets { docCount: doc_count projectId: key } } } loss: aggregations(filters: $cnvLoss) { project__project_id { buckets { docCount: doc_count projectId: key } } } cnvTotal: aggregations(filters: $cnvTested) { project__project_id { buckets { docCount: doc_count projectId: key } } } filtered: aggregations(filters: $caseAggsFilters) { project__project_id { buckets { docCount: doc_count projectId: key } } } total: aggregations(filters: $ssmTested) { project__project_id { buckets { docCount: doc_count projectId: key } } } } } } projects { hits(first: $projectCount) { edges { node { primary_site disease_type project_id id } } } } }`,
        variables: {
            caseAggsFilters: {
                op: 'and',
                content: [
                    {
                        op: 'in',
                        content: {
                            field: 'cases.available_variation_data',
                            value: ['ssm'],
                        },
                    },
                    {
                        op: 'NOT',
                        content: {
                            field: 'cases.gene.ssm.observation.observation_id',
                            value: 'MISSING',
                        },
                    },
                    { op: 'in', content: { field: 'genes.gene_id', value: [featureId] } },
                ],
            },
            ssmTested: {
                op: 'and',
                content: [
                    {
                        op: 'in',
                        content: {
                            field: 'cases.available_variation_data',
                            value: ['ssm'],
                        },
                    },
                ],
            },
            cnvGain: {
                op: 'and',
                content: [
                    {
                        op: 'in',
                        content: {
                            field: 'cases.available_variation_data',
                            value: ['cnv'],
                        },
                    },
                    { op: 'in', content: { field: 'cnvs.cnv_change', value: ['Gain'] } },
                    { op: 'in', content: { field: 'genes.gene_id', value: [featureId] } },
                ],
            },
            cnvLoss: {
                op: 'and',
                content: [
                    {
                        op: 'in',
                        content: {
                            field: 'cases.available_variation_data',
                            value: ['cnv'],
                        },
                    },
                    { op: 'in', content: { field: 'cnvs.cnv_change', value: ['Loss'] } },
                    { op: 'in', content: { field: 'genes.gene_id', value: [featureId] } },
                ],
            },
            cnvTested: {
                op: 'and',
                content: [
                    {
                        op: 'in',
                        content: {
                            field: 'cases.available_variation_data',
                            value: ['cnv'],
                        },
                    },
                ],
            },
            projectCount: 100,
        },
    };
    const response = await fetch('https://api.gdc.cancer.gov/v0/graphql/geneProjects', {
        method: 'POST',
        body: JSON.stringify(query),
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${response.status} ${response.statusText}`);
    }
    return response.json();
}
/**
 * Query the GDC API for project information related to the given mutation
 * @param {String} featureId Mutation ID
 */
async function getMutationProjectsAsync(featureId) {
    const query = {
        query: `query projectsTable($ssmTested: FiltersArgument, $caseAggsFilter: FiltersArgument, $projectCount: Int) { viewer { explore { cases { filtered: aggregations(filters: $caseAggsFilter) { project__project_id { buckets { docCount: doc_count projectId: key } } } total: aggregations(filters: $ssmTested) { project__project_id { buckets { docCount: doc_count projectId: key } } } } } } projects { hits(first: $projectCount) { edges { node { primary_site disease_type project_id id } } } } }`,
        variables: {
            ssmTested: {
                op: 'and',
                content: [
                    {
                        op: 'in',
                        content: {
                            field: 'cases.available_variation_data',
                            value: ['ssm'],
                        },
                    },
                ],
            },
            caseAggsFilter: {
                op: 'and',
                content: [
                    { op: 'in', content: { field: 'ssms.ssm_id', value: [featureId] } },
                    {
                        op: 'in',
                        content: {
                            field: 'cases.available_variation_data',
                            value: ['ssm'],
                        },
                    },
                ],
            },
            projectCount: 100,
        },
    };
    const response = await fetch('https://api.gdc.cancer.gov/v0/graphql/mutationProjects', {
        method: 'POST',
        body: JSON.stringify(query),
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${response.status} ${response.statusText}`);
    }
    return response.json();
}

const useStyles$3 = makeStyles()({
    table: {
        padding: 0,
    },
    link: {
        color: 'rgb(0, 0, 238)',
    },
});
/**
 * Render the consequence table for a simple somatic mutation
 * @param {*} props
 */
function Consequence(props) {
    const { classes } = useStyles$3();
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
                React.createElement(TableBody, null, Object.entries(consequences).map(([key, value]) => value ? (React.createElement(TableRow, { key: key },
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
/**
 * Render a single table row for an external link
 */
const ExternalLink = observer((props) => {
    const { classes } = useStyles$3();
    const { id, name, link } = props;
    return (React.createElement(TableRow, { key: `${id}-${name}` },
        React.createElement(TableCell, null, name),
        React.createElement(TableCell, null,
            React.createElement(Link, { className: classes.link, target: "_blank", rel: "noopener", href: `${link}${id}`, underline: "always" }, id))));
});
/**
 * Render a section for external gene links
 * @param {*} props
 */
function GeneExternalLinks(props) {
    const { classes } = useStyles$3();
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
/**
 * Removes prefix from cosmic ID
 * @param {*} cosmicId Cosmic ID for a mutation
 */
function removeCosmicPrefix(cosmicId) {
    return cosmicId.replace('COSM', '').replace('COSN', '');
}
/**
 * Render a row with cosmic links for a mutation
 */
const CosmicLinks = observer((props) => {
    const { classes } = useStyles$3();
    const { cosmicId } = props;
    return (React.createElement(TableRow, { key: "0" },
        React.createElement(TableCell, null, "Cosmic"),
        React.createElement(TableCell, null, cosmicId?.map(value => (React.createElement(Link, { className: classes.link, target: "_blank", rel: "noopener", href: `https://cancer.sanger.ac.uk/cosmic/mutation/overview?id=${removeCosmicPrefix(value)}`, key: value, underline: "always" }, value))))));
});
/**
 * Render a section for external mutation links
 * @param {*} props
 */
function SSMExternalLinks(props) {
    const { classes } = useStyles$3();
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
/**
 * Render a table row for a project related to the mutation
 * @param {*} props
 */
function SSMProject(props) {
    const { classes } = useStyles$3();
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
/**
 * Render a table of projects based on the selected mutation feature
 * @param {*} props
 */
function SSMProjects(props) {
    const { classes } = useStyles$3();
    const { featureId } = props;
    // Case counts for projects associated with the given mutation
    const [mutationProjectsCounts, setMutationProjectsCounts] = useState([]);
    // General information regarding all projects
    const [projectsInformation, setProjectsInformation] = useState([]);
    // Case counts for projects across the GDC
    const [gdcProjectsCounts, setGdcProjectsCounts] = useState([]);
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getMutationProjectsAsync(featureId).then(data => {
            setProjectsInformation(data.data.projects.hits.edges);
            setGdcProjectsCounts(data.data.viewer.explore.cases.total.project__project_id.buckets);
            setMutationProjectsCounts(data.data.viewer.explore.cases.filtered.project__project_id.buckets);
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
                React.createElement(TableBody, null, mutationProjectsCounts &&
                    projectsInformation &&
                    gdcProjectsCounts &&
                    mutationProjectsCounts.map((project, key) => (React.createElement(SSMProject, { projectsInformation: projectsInformation, gdcProjectsCounts: gdcProjectsCounts, key: `${key}-${project.projectId}`, ...project }))))))));
}
/**
 * Render a table row for a project related to the gene
 * @param {*} props
 */
function GeneProject(props) {
    const { classes } = useStyles$3();
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
/**
 * Render a table of projects based on the selected gene feature
 * @param {*} props
 */
function GeneProjects(props) {
    const { classes } = useStyles$3();
    const { featureId } = props;
    const [projectsInformation, setProjectsInformation] = useState([]); // General information regarding all projects
    const [geneProjectsCounts, setGeneProjectsCounts] = useState([]); // Case counts for projects associated with the given gene
    const [cases, setCases] = useState([]); // Case counts for various projects and filters
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getGeneProjectsAsync(featureId).then(data => {
            setProjectsInformation(data.data.projects.hits.edges);
            setCases(data.data.viewer.explore.cases);
            setGeneProjectsCounts(data.data.viewer.explore.cases.filtered.project__project_id.buckets);
        });
    }, [featureId]);
    return (React.createElement(BaseCard, { ...props, title: "Projects" },
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
                    geneProjectsCounts?.map((project, key) => (React.createElement(GeneProject, { cases: cases, projectsInformation: projectsInformation, key: `${key}-${project.projectId}`, ...project }))))))));
}
/**
 * Extended feature detail widget for GDC features
 * @param {*} props
 */
function GDCFeatureDetails(props) {
    const { model } = props;
    const feat = JSON.parse(JSON.stringify(model.featureData));
    const { consequence, geneId, ssmId, cosmicId, canonicalTranscriptId, externalDbIds, percentage, numOfCasesInCohort, ...rest } = feat;
    return (React.createElement(Paper, { "data-testid": "variant-widget" },
        React.createElement(FeatureDetails, { feature: rest, model: model, ...props }),
        React.createElement(Divider, null),
        feat.geneId !== undefined ? React.createElement(GeneExternalLinks, { feature: feat }) : null,
        feat.ssmId !== undefined ? React.createElement(SSMExternalLinks, { feature: feat }) : null,
        React.createElement(Divider, null),
        feat.ssmId !== undefined ? React.createElement(Consequence, { feature: feat }) : null,
        React.createElement(Divider, null),
        feat.geneId !== undefined ? (React.createElement(GeneProjects, { featureId: feat.geneId })) : null,
        feat.ssmId !== undefined ? React.createElement(SSMProjects, { featureId: feat.ssmId }) : null));
}
var GDCFeatureWidgetComponent = observer(GDCFeatureDetails);

function f(_pluginManager) {
    return types
        .model('GDCSearchWidget', {
        id: ElementId,
        type: types.literal('GDCSearchWidget'),
    })
        .volatile(() => ({
        trackData: undefined,
        indexTrackData: undefined,
    }))
        .actions(self => ({
        setTrackData(obj) {
            self.trackData = obj;
        },
        setIndexTrackData(obj) {
            self.indexTrackData = obj;
        },
        clearData() {
            self.indexTrackData = undefined;
            self.trackData = undefined;
        },
    }));
}

const THEME_SPACING_A$1 = 8; // theme.spacing(2)
const THEME_SPACING_B$1 = 6; // theme.spacing(1)
const useStyles$2 = makeStyles()(theme => ({
    closeButton: {
        position: 'absolute',
        left: '80px',
        color: theme.palette.grey[500],
    },
    root: {
        margin: THEME_SPACING_B$1,
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        padding: THEME_SPACING_A$1,
    },
    imgContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    img: {
        maxWidth: '100%',
        maxHeight: '100%',
        verticalAlign: 'middle',
    },
    helperTextContainer: {
        paddingTop: THEME_SPACING_A$1,
        paddingBottom: THEME_SPACING_A$1,
    },
    textContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: THEME_SPACING_A$1,
        alignItems: 'center',
        background: theme.palette.grey[100],
        padding: THEME_SPACING_B$1,
        marginTop: THEME_SPACING_A$1,
        marginBottom: THEME_SPACING_A$1,
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
}));
function TipDialogue({ handleClose, }) {
    const { classes } = useStyles$2();
    return (React.createElement(Dialog, { open: true, onClose: handleClose, maxWidth: "sm", title: "How to upload bulk files from the GDC to JBrowse" },
        React.createElement(DialogContent, null,
            React.createElement("div", { className: classes.root },
                React.createElement("div", { className: classes.paper },
                    React.createElement("div", { className: classes.imgContainer },
                        React.createElement("img", { className: classes.img, src: "https://i.imgur.com/jCKe4of.png" })),
                    React.createElement(Paper, { className: classes.textContainer, elevation: 0 },
                        React.createElement("div", { className: classes.helperTextContainer },
                            React.createElement(Typography, { variant: "body1", align: "center" },
                                React.createElement("b", null, "Step 1")),
                            React.createElement(Typography, { variant: "body2", align: "center" }, "Perform a query on the GDC")),
                        React.createElement(ArrowForwardIcon, null),
                        React.createElement("div", { className: classes.helperTextContainer },
                            React.createElement(Typography, { variant: "body1", align: "center" },
                                React.createElement("b", null, "Step 2")),
                            React.createElement(Typography, { variant: "body2", align: "center" }, "Enable column for 'File UUID'")),
                        React.createElement(ArrowForwardIcon, null),
                        React.createElement("div", { className: classes.helperTextContainer },
                            React.createElement(Typography, { variant: "body1", align: "center" },
                                React.createElement("b", null, "Step 3")),
                            React.createElement(Typography, { variant: "body2", align: "center" }, "Click JSON button to Export")),
                        React.createElement(ArrowForwardIcon, null),
                        React.createElement("div", { className: classes.helperTextContainer },
                            React.createElement(Typography, { variant: "body1", align: "center" },
                                React.createElement("b", null, "Step 4")),
                            React.createElement(Typography, { variant: "body2", align: "center" }, "Drop JSON file into the GDC Widget on JBrowse"))),
                    React.createElement("div", { className: classes.buttonContainer },
                        React.createElement(Button, { color: "primary", variant: "contained", size: "large", onClick: handleClose }, "Close")))))));
}

const mapToAdapter = new Map([
    [
        'bam',
        {
            config: { type: 'AlignmentsTrack', adapter: { type: 'BamAdapter' } },
            prefix: 'bam',
        },
    ],
    [
        'maf',
        {
            config: { type: 'MAFTrack', adapter: { type: 'MafAdapter' } },
            prefix: 'maf',
        },
    ],
    [
        'vcf',
        {
            config: { type: 'VariantTrack', adapter: { type: 'VcfAdapter' } },
            prefix: 'vcf',
        },
    ],
    [
        'Copy Number Variation',
        {
            config: {
                type: 'QuantitativeTrack',
                adapter: { type: 'SegmentCNVAdapter' },
            },
            prefix: 'seg',
        },
    ],
    [
        'Methylation Beta Value',
        {
            config: {
                type: 'FeatureTrack',
                adapter: { type: 'MbvAdapter' },
            },
            prefix: 'mbv',
        },
    ],
    [
        'Isoform Expression Quantification',
        {
            config: {
                type: 'IEQTrack',
                adapter: { type: 'IeqAdapter' },
            },
            prefix: 'ieq',
        },
    ],
    [
        'Splice Junction Quantification',
        {
            config: {
                type: 'FeatureTrack',
                adapter: { type: 'SjqAdapter' },
                displays: [{ type: 'LinearArcDisplay' }],
            },
            prefix: 'sjq',
        },
    ],
    [
        'GDC Explore',
        {
            config: { type: 'GDCTrack', adapter: { type: 'GDCAdapter' } },
        },
    ],
    [
        'SSM or Gene',
        {
            config: { type: 'GDCTrack', adapter: { type: 'GDCJSONAdapter' } },
        },
    ],
]);
function getPriorityProperty(fileInfo) {
    if (mapToAdapter.has(fileInfo.type)) {
        return fileInfo.type;
    }
    else if (mapToAdapter.has(fileInfo.category)) {
        return fileInfo.category;
    }
    else if (mapToAdapter.has(fileInfo.format)) {
        return fileInfo.format;
    }
    else {
        return '';
    }
}
/**
 * retrieves the config object with appropriate adapter using file info
 *
 * @param fileInfo an array of the format, category, and type of the file
 *
 * @param uri the uri of the data
 *
 * @param indexFileId the fileId of the index file that the data may require
 * (BAM)
 *
 * @returns an object containing the config type and the adapter object
 */
function mapDataInfo(fileInfo, uri, indexFileId, fileBlob) {
    const configObject = mapToAdapter.get(getPriorityProperty(fileInfo));
    if (configObject) {
        if (configObject.config.displays) {
            const datenow = Date.now();
            //@ts-expect-error
            configObject.config.displays[0].displayId = `gdc_plugin_track_linear_basic-${datenow}`;
        }
        if (fileBlob) {
            // @ts-expect-error
            configObject.config.adapter[`${configObject.prefix}Location`] =
                storeBlobLocation({ blob: fileBlob });
        }
        else {
            //@ts-expect-error
            configObject.config.adapter[`${configObject.prefix}Location`] = {
                uri: uri,
                authHeader: 'X-Auth-Token',
                locationType: 'UriLocation',
                internetAccountId: 'GDCExternalToken',
            };
            if (indexFileId) {
                //@ts-expect-error
                configObject.config.adapter.index = {
                    location: {
                        uri: `http://localhost:8010/proxy/data/${indexFileId}`,
                        authHeader: 'X-Auth-Token',
                        locationType: 'UriLocation',
                        internetAccountId: 'GDCExternalToken',
                    },
                };
            }
        }
    }
    return configObject;
}
/**
 * creates a specialized config for a GDC explore track using filters that have
 * been parsed from a given url
 *
 * @param category 'GDC Explore' or 'SSM or Gene' indicating what kind of
 * adapter to use
 *
 * @param featureType mutation or gene indicating what kind of feature is being
 * displayed
 *
 * @param adapterPropertyValue filters or data indicating what kind of data has
 * been fed to the function
 *
 * @param trackId the id for the track, needs to be passed in to be specified
 * against the unique identifier
 *
 * @returns a configuration object that will create the track
 */
function mapGDCExploreConfig(category, featureType, adapterPropertyValue, trackId) {
    const configObject = mapToAdapter.get(category);
    const adapterProperty = category == 'GDC Explore' ? 'filters' : 'data';
    if (configObject) {
        const datenow = Date.now();
        const color1 = featureType == 'mutation'
            ? "jexl:cast({LOW: 'blue', MODIFIER: 'goldenrod', MODERATE: 'green', HIGH: 'red'})[get(feature,'consequence').hits.edges[.node.transcript.is_canonical == true][0].node.transcript.annotation.vep_impact] || 'lightgray'"
            : "jexl:cast('goldenrod')";
        configObject.config = {
            adapter: {
                ...configObject.config.adapter,
                // @ts-expect-error
                GDCAdapterId: trackId,
                [adapterProperty]: adapterPropertyValue,
                featureType,
            },
            category: undefined,
            displays: [
                {
                    // @ts-expect-error
                    displayId: `gdc_plugin_track_linear-${datenow}`,
                    renderer: {
                        color1,
                        labels: {
                            name: "jexl:get(feature,'genomicDnaChange')",
                            type: 'SvgFeatureRenderer',
                        },
                    },
                    type: 'LinearGDCDisplay',
                },
            ],
            type: configObject.config.type,
        };
    }
    return configObject;
}

const MAX_FILE_SIZE = 512 * 1024 ** 2; // 512 MiB
const MAX_FILES = 25;
const THEME_SPACING_A = 8; // theme.spacing(2)
const THEME_SPACING_B = 10; // theme.spacing(4)
const useStyles$1 = makeStyles()(theme => ({
    container: {
        margin: THEME_SPACING_A,
    },
    fileInput: {
        marginBottom: THEME_SPACING_A,
    },
    root: {
        margin: 2,
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        gap: THEME_SPACING_B,
        padding: THEME_SPACING_A,
        margin: `2px 4px ${THEME_SPACING_A}px 4px`,
    },
    dragAndDropContainer: {
        margin: `${THEME_SPACING_A}px ${THEME_SPACING_A}px 0px ${THEME_SPACING_A}px`,
    },
    dropZone: {
        textAlign: 'center',
        borderWidth: 2,
        borderRadius: 2,
        padding: THEME_SPACING_A,
        borderStyle: 'dashed',
        outline: 'none',
        transition: 'border .24s ease-in-out',
        '&:focus': {
            borderColor: theme.palette.secondary.light,
        },
    },
    uploadIcon: {
        color: theme.palette.text.secondary,
    },
    rejectedFiles: {
        marginTop: THEME_SPACING_B,
    },
    listItem: {
        padding: THEME_SPACING_B,
    },
    expandIcon: {
        color: '#FFFFFF',
    },
    error: {
        margin: THEME_SPACING_A,
    },
    errorHeader: {
        background: theme.palette.error.light,
        color: theme.palette.error.contrastText,
        padding: THEME_SPACING_A,
        textAlign: 'center',
    },
    errorMessage: {
        padding: THEME_SPACING_A,
    },
    submitContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '4px',
    },
    addTrackButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    loginPromptContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    typoContainer: {
        width: '100%',
    },
    tipContainer: {
        display: 'flex',
        paddingTop: THEME_SPACING_A,
    },
    tipPaper: {
        display: 'flex',
        background: theme.palette.grey[100],
    },
    tipMessageContainer: {
        display: 'flex',
        flexDirection: 'row',
        padding: THEME_SPACING_A,
        gap: THEME_SPACING_A,
        alignItems: 'center',
    },
}));
async function fetchFileInfo(query) {
    const response = await fetch(`http://localhost:8010/proxy/files/${query}?expand=index_files`, {
        method: 'GET',
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${response.status} ${await response.text()}`);
    }
    return response.json();
}
const Panel = ({ model }) => {
    const [dragErrorMessage, setDragErrorMessage] = useState();
    const [success, setSuccess] = useState(false);
    const [dragSuccess, setDragSuccess] = useState(false);
    const [exploreSuccess, setExploreSuccess] = useState(false);
    const [trackErrorMessage, setTrackErrorMessage] = useState();
    const [trackInfoMessage, setTrackInfoMessage] = useState();
    const [uploadInfoMessage, setUploadInfoMessage] = useState();
    const [fileChip, setFileChip] = useState();
    const session = getSession(model);
    const inputRef = useRef();
    /**
     * uses information about the BEDPE file to display the contents in a spreadsheet view
     * @param uri optional the uri of the BEDPE file being added to be passed to the track
     * @param fileUUID the UUID of the file being added for the title of the view
     * @param fileBlob optional the file being populated from the local machine
     */
    async function addBEDPEView(fileUUID, uri, fileBlob) {
        session.addView('SpreadsheetView', {});
        const xView = session.views.length - 1;
        session.views[xView].setDisplayName(`GDC BEDPE ${fileUUID}`);
        if (uri) {
            // @ts-expect-error
            session.views[xView].importWizard.setFileSource({
                uri,
                locationType: 'UriLocation',
                authHeader: 'X-Auth-Token',
                internetAccountId: 'GDCExternalToken',
            });
        }
        if (fileBlob) {
            // @ts-expect-error
            session.views[xView].importWizard.setFileSource(storeBlobLocation({ blob: fileBlob }));
        }
        // @ts-expect-error
        session.views[xView].importWizard.setFileType('BEDPE');
        // @ts-expect-error
        session.views[xView].importWizard.setSelectedAssemblyName('hg38');
        // @ts-expect-error
        await session.views[xView].importWizard.import('hg38');
    }
    /**
     * uses the provided configuration to add the track to the session and then displays it
     * displays an error message if typeAdapterObject is null
     * @param typeAdapterObject the object from GDCDataInfo with some of the configuration for the track
     * @param trackId the trackId of the track
     * @param name the name of the track
     */
    function addAndShowTrack(typeAdapterObject, trackId, name, paper) {
        if (typeAdapterObject) {
            const conf = {
                ...typeAdapterObject.config,
                trackId,
                name,
                assemblyNames: ['hg38'],
            };
            //@ts-expect-error
            session.addTrackConf({
                ...conf,
            });
            if (session.views.length === 0) {
                session.addView('LinearGenomeView', {});
            }
            //@ts-expect-error
            session.views[0].showTrack(trackId, {}, {
                height: 200,
                constraints: { max: 2, min: -2 },
                rendererTypeNameState: 'density',
            });
            if (paper === 'drag') {
                setDragSuccess(true);
            }
            else if (paper === 'explore') {
                setExploreSuccess(true);
            }
            else {
                setSuccess(true);
            }
        }
        else {
            if (paper === 'drag') {
                setDragErrorMessage('Failed to add track.\nThe configuration of this file is not currently supported.');
            }
            else {
                setTrackErrorMessage('Failed to add track.\nThe configuration of this file is not currently supported.');
            }
        }
    }
    /**
     * helper function to determine the file type of a dragged file. needed
     * because files like BAM and VCF do not have inherent types to extract from
     * the File object
     *
     * @param fileName the name of the file to determine the extension
     * @returns an object of type fileInfo that contains the file format, type,
     * and/or category of the file based on its name
     */
    function determineFileInfo(fileName) {
        const format = fileName.split('.')[-1];
        if (fileName.includes('Methylation')) {
            return {
                format,
                type: 'Methylation Beta Value',
                category: 'DNA Methylation',
            };
        }
        if (fileName.includes('splice')) {
            return {
                format,
                type: 'Splice Junction Quantification',
                category: 'Transcriptome Profiling',
            };
        }
        return { format, type: '', category: '' };
    }
    function resetErrorMessages() {
        setTrackErrorMessage(undefined);
        setTrackInfoMessage(undefined);
        setDragErrorMessage(undefined);
        setUploadInfoMessage(undefined);
        setSuccess(false);
        setDragSuccess(false);
        setExploreSuccess(false);
    }
    const handleDelete = () => {
        model.setTrackData(undefined);
        model.setIndexTrackData(undefined);
        setFileChip(undefined);
        setUploadInfoMessage(undefined);
    };
    const { getRootProps, getInputProps } = useDropzone({
        maxSize: MAX_FILE_SIZE,
        multiple: false,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onDrop: async (acceptedFiles, rejectedFiles) => {
            resetErrorMessages();
            if (rejectedFiles.length) {
                if (acceptedFiles.length || rejectedFiles.length > 1) {
                    const message = 'Only one session at a time may be imported';
                    console.error(message);
                    setDragErrorMessage(message);
                }
                else if (rejectedFiles[0].file.size > MAX_FILE_SIZE) {
                    const message = `File size is too large (${Math.round(rejectedFiles[0].file.size / 1024 ** 2)} MiB), max size is ${MAX_FILE_SIZE / 1024 ** 2} MiB`;
                    console.error(message);
                    setDragErrorMessage(message);
                }
                else {
                    const message = 'Unknown file import error';
                    console.error(message);
                    setDragErrorMessage(message);
                }
            }
            const [file] = acceptedFiles;
            if (file) {
                const fileInfo = determineFileInfo(file.name);
                try {
                    /**
                     * JSON files are for bulk import of files from the GDC site
                     */
                    if (fileInfo.format == 'json') {
                        const res = await new Promise(resolve => {
                            const reader = new FileReader();
                            reader.addEventListener('load', event => resolve(JSON.parse(event.target?.result)));
                            reader.readAsText(file);
                        });
                        // if the file is json we need to look at the properties to determine how to process it
                        const propertyArray = [];
                        //@ts-expect-error
                        for (const property in res.slice(0, 1)[0]) {
                            propertyArray.push(property);
                        }
                        // key properties dictate how a file should be processed and displayed, i.e. the file_id
                        if (propertyArray.includes('file_id')) {
                            //@ts-expect-error
                            const ele = res.slice(0, MAX_FILES); //TODO: it only gets the first 25 files
                            ele.map((file) => {
                                const iterFileInfo = determineFileInfo(file.file_name);
                                const uri = `http://localhost:8010/proxy/data/${file.file_id}`;
                                const typeAdapterObject = mapDataInfo(iterFileInfo, uri);
                                addAndShowTrack(typeAdapterObject, file.file_id, file.file_name, 'drag');
                            });
                        }
                        else {
                            const message = 'Failed to add track.\nThe configuration of this file is not currently supported. Ensure that you have enabled the "File UUID" column on the GDC explore page table before exporting.';
                            console.error(message);
                            setDragErrorMessage(message);
                        }
                    }
                    else if (fileInfo.type === 'bedpe') {
                        await addBEDPEView(file.name, undefined, file);
                        setDragSuccess(true);
                    }
                    else {
                        // BAM files are a special case w drag and drop that require forcing the user to upload a bai file
                        if (/\.bam$/i.test(file.name)) {
                            if (!model.indexTrackData) {
                                setUploadInfoMessage('Please upload a corresponding BAI file.');
                                setFileChip(file.name);
                            }
                            // @ts-expect-error
                            model.setTrackData(storeBlobLocation({ blob: file }));
                        }
                        if (/\.bai$/i.test(file.name)) {
                            if (!model.trackData) {
                                setUploadInfoMessage('Please upload a corresponding BAM file.');
                                setFileChip(file.name);
                            }
                            // @ts-expect-error
                            model.setIndexTrackData(storeBlobLocation({ blob: file }));
                        }
                        if ((/\.bam$/i.test(file.name) || /\.bai$/i.test(file.name)) &&
                            model.indexTrackData &&
                            model.trackData) {
                            const trackId = `gdc_plugin_track-${Date.now()}`;
                            //TODO: update this to go through the enahancement 2135 workflow
                            const typeAdapterObject = {
                                config: {
                                    type: 'AlignmentsTrack',
                                    adapter: {
                                        type: 'BamAdapter',
                                        bamLocation: model.trackData,
                                        index: {
                                            location: model.indexTrackData,
                                            indexType: 'BAI',
                                        },
                                    },
                                },
                            };
                            addAndShowTrack(typeAdapterObject, trackId, 
                            // @ts-expect-error
                            model.trackData.name, 'drag');
                            model.setTrackData(undefined);
                            model.setIndexTrackData(undefined);
                            setFileChip(undefined);
                            setUploadInfoMessage(undefined);
                        }
                        // all other files go through this channel
                        if (!(/\.bam$/i.test(file.name) || /\.bai$/i.test(file.name))) {
                            const trackId = `gdc_plugin_track-${Date.now()}`;
                            const typeAdapterObject = mapDataInfo(fileInfo, undefined, undefined, file);
                            addAndShowTrack(typeAdapterObject, trackId, file.name, 'drag');
                        }
                    }
                }
                catch (e) {
                    console.error(e);
                    const message = 
                    // @ts-expect-error
                    e.message.length > 100 ? `${e.message.substring(0, 99)}...` : e;
                    setDragErrorMessage(`Failed to add track.\n ${message}.`);
                }
            }
        },
    });
    function processExplorationURI(uri, source) {
        const query = uri.split('?')[1];
        const queryParams = new URLSearchParams(query);
        const featureType = queryParams.get('searchTableTab') === 'genes' ||
            queryParams.get('searchTableTab') === 'mutations'
            ? // @ts-expect-error
                queryParams.get('searchTableTab').slice(0, -1)
            : 'mutation';
        const filterString = queryParams.get('filters')
            ? queryParams.get('filters')
            : '{}';
        // @ts-expect-error
        const filters = decodeURIComponent(filterString);
        const datenow = Date.now();
        const trackId = `gdc_plugin_track-${datenow}`;
        const trackName = `GDC Explore session-${datenow}`;
        const typeAdapterObject = mapGDCExploreConfig('GDC Explore', featureType, filters, trackId);
        addAndShowTrack(typeAdapterObject, trackId, trackName, source);
    }
    const { classes } = useStyles$1();
    return (React.createElement("div", { className: classes.root },
        React.createElement(Paper, { className: classes.paper, elevation: 3 },
            React.createElement(Typography, { variant: "h6", component: "h1", align: "center" }, "Drag and Drop Local GDC Files"),
            React.createElement("div", { className: classes.dragAndDropContainer },
                React.createElement("div", { ...getRootProps({ className: classes.dropZone }) },
                    React.createElement("input", { ...getInputProps() }),
                    React.createElement(CloudUploadIcon, { className: classes.uploadIcon, fontSize: "large" }),
                    React.createElement(Typography, { color: "textSecondary", align: "center", variant: "body1" }, "Drag and drop files here"),
                    React.createElement(Typography, { color: "textSecondary", align: "center", variant: "body2" }, "or"),
                    React.createElement(Button, { color: "primary", variant: "contained" }, "Browse Files")),
                React.createElement("div", { className: classes.tipContainer },
                    React.createElement(Paper, { className: classes.tipPaper, elevation: 0 },
                        React.createElement("div", { className: classes.tipMessageContainer },
                            React.createElement(InfoIcon, null),
                            React.createElement(Typography, { color: "textSecondary", variant: "caption" }, "You can bulk import files from the GDC Repository using the JSON export button."),
                            React.createElement(Button, { variant: "text", onClick: () => {
                                    session.queueDialog(doneCallback => [
                                        TipDialogue,
                                        {
                                            handleClose: () => {
                                                doneCallback();
                                            },
                                        },
                                    ]);
                                } },
                                React.createElement("b", null, "Learn More")))))),
            dragSuccess ? (React.createElement(Alert, { severity: "success" }, "The requested track(s) from the file have been added.")) : null,
            dragErrorMessage ? (React.createElement(Alert, { severity: "error" }, dragErrorMessage)) : null,
            fileChip ? (React.createElement(Chip, { label: fileChip, avatar: React.createElement(InsertDriveFile, null), onDelete: handleDelete })) : null,
            uploadInfoMessage ? (React.createElement(Alert, { severity: "info" }, uploadInfoMessage)) : null),
        React.createElement(Paper, { className: classes.paper, elevation: 3 },
            React.createElement(Typography, { variant: "h6", component: "h1", align: "center" }, "Import File or Exploration by UUID or URL"),
            React.createElement(Typography, { variant: "body1", align: "center" }, "Add a track by providing the UUID or URL of a file, including controlled data, or by providing the URL of an Exploration session."),
            trackErrorMessage ? (React.createElement(Alert, { severity: "error" }, trackErrorMessage)) : null,
            trackInfoMessage ? (React.createElement(Alert, { severity: "info" }, trackInfoMessage)) : null,
            success ? (React.createElement(Alert, { severity: "success" }, "The requested track has been added.")) : null,
            React.createElement("div", { className: classes.submitContainer },
                React.createElement(TextField, { color: "primary", variant: "outlined", label: "Enter UUID or URL", inputRef: inputRef }),
                React.createElement("div", { className: classes.buttonContainer },
                    React.createElement(Button, { color: "primary", variant: "contained", size: "large", 
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick: async () => {
                            resetErrorMessages();
                            try {
                                // @ts-expect-error
                                let query = inputRef ? inputRef.current.value : undefined;
                                if (query.includes('exploration')) {
                                    processExplorationURI(query);
                                }
                                else if (!query) {
                                    setTrackErrorMessage('Failed to add track.\nUUID or URL must be provided.');
                                }
                                else {
                                    if (query.includes('files/')) {
                                        query = query.split('/')[4];
                                    }
                                    const response = await fetchFileInfo(query);
                                    const fileInfo = {
                                        category: response.data.data_category,
                                        format: response.data.data_format.toLowerCase(),
                                        type: response.data.data_type,
                                    };
                                    // BAM files require an index file, if the response
                                    // contains index_files, then we want to utilize it
                                    const indexFileId = response.data.index_files
                                        ? response.data.index_files[0].file_id
                                        : undefined;
                                    const uri = `http://localhost:8010/proxy/data/${query}`;
                                    const trackId = `${response.data.file_id}`;
                                    const trackName = `${response.data.file_name}`;
                                    if (fileInfo.type !== 'bedpe') {
                                        const typeAdapterObject = mapDataInfo(fileInfo, uri, indexFileId);
                                        addAndShowTrack(typeAdapterObject, trackId, trackName);
                                    }
                                    else {
                                        await addBEDPEView(response.data.file_id, uri);
                                        setSuccess(true);
                                    }
                                }
                            }
                            catch (e) {
                                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                const err = `${e}`;
                                if (!err.includes('unable to determine size of file at')) {
                                    console.error(e);
                                    const message = err.length > 100 ? `${err.substring(0, 99)}...` : err;
                                    setTrackErrorMessage(`Failed to add track.\n ${message}.`);
                                }
                            }
                            // @ts-expect-error
                            inputRef.current.value = null;
                        } }, "Submit")))),
        React.createElement(Paper, { className: classes.paper, elevation: 3 },
            React.createElement("div", { className: classes.typoContainer },
                React.createElement(Typography, { variant: "h6", component: "h1", align: "center" }, "Quick-add a GDC Explore Track"),
                React.createElement(Typography, { variant: "body1", align: "center" }, "Add additional Explore tracks to your current view by clicking this button.")),
            exploreSuccess ? (React.createElement(Alert, { severity: "success" }, "The requested Explore track has been added.")) : null,
            React.createElement("div", { className: classes.addTrackButtonContainer },
                React.createElement(Button, { color: "primary", variant: "contained", size: "small", startIcon: React.createElement(AddIcon, null), onClick: () => {
                        processExplorationURI('https://portal.gdc.cancer.gov/exploration?facetTab=mutations', 'explore');
                    } }, "Add New GDC Explore Track")))));
};
var ReactComponent = observer(Panel);

var GDCSearchWidgetF = (jbrowse) => {
    return {
        configSchema: ConfigurationSchema('GDCSearchWidget', {}),
        ReactComponent,
        stateModel: jbrowse.load(f),
        HeadingComponent: () => React.createElement(React.Fragment, null, "GDC Data Import"),
    };
};

var configSchemaF$2 = (pluginManager) => {
    const { baseLinearDisplayConfigSchema } = pluginManager.getPlugin('LinearGenomeViewPlugin').exports;
    return ConfigurationSchema('LinearGDCDisplay', { renderer: pluginManager.pluggableConfigSchemaType('renderer') }, { baseConfiguration: baseLinearDisplayConfigSchema, explicitlyTyped: true });
};

var modelF$2 = (pluginManager, configSchema) => {
    const { BaseLinearDisplay } = pluginManager.getPlugin('LinearGenomeViewPlugin')?.exports;
    return types
        .compose('LinearGDCDisplay', BaseLinearDisplay, types.model({
        type: types.literal('LinearGDCDisplay'),
        configuration: ConfigurationReference(configSchema),
    }))
        .actions(self => ({
        openFilterConfig() {
            const session = getSession(self);
            if (isSessionModelWithWidgets(session)) {
                const editor = session.addWidget('GDCFilterWidget', 'gdcFilter', {
                    target: self.parentTrack.configuration,
                });
                session.showWidget(editor);
            }
        },
        selectFeature(feature) {
            const session = getSession(self);
            if (feature && isSessionModelWithWidgets(session)) {
                const featureWidget = session.addWidget('GDCFeatureWidget', 'gdcFeature', { featureData: feature.toJSON() });
                session.showWidget(featureWidget);
                session.setSelection(feature);
            }
        },
    }))
        .views(self => {
        const { renderProps: superRenderProps, trackMenuItems: superTrackMenuItems, } = self;
        return {
            renderProps() {
                return {
                    ...superRenderProps(),
                    ...getParentRenderProps(self),
                    displayModel: self,
                    config: self.configuration.renderer,
                };
            },
            get rendererTypeName() {
                return self.configuration.renderer.type;
            },
            trackMenuItems() {
                return [
                    ...superTrackMenuItems(),
                    {
                        label: 'Filter',
                        onClick: () => self.openFilterConfig(),
                        icon: FilterListIcon,
                    },
                ];
            },
        };
    });
};

var LinearGDCDisplayF = (pluginManager) => {
    const schema = configSchemaF$2(pluginManager);
    return {
        configSchema: schema,
        stateModel: modelF$2(pluginManager, schema),
    };
};

var configSchemaF$1 = (function (pluginManager) {
  var baseLinearDisplayConfigSchema = pluginManager.getPlugin('LinearGenomeViewPlugin').exports.baseLinearDisplayConfigSchema;
  return ConfigurationSchema('LinearIEQDisplay', {
    renderer: pluginManager.pluggableConfigSchemaType('renderer')
  }, {
    baseConfiguration: baseLinearDisplayConfigSchema,
    explicitlyTyped: true
  });
});

function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
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

var modelF$1 = (function (jbrowse) {
  var configSchema = jbrowse.jbrequire(configSchemaF$1);
  var BaseLinearDisplay = jbrowse.getPlugin('LinearGenomeViewPlugin').exports.BaseLinearDisplay;
  return types.compose('LinearIEQDisplay', BaseLinearDisplay, types.model({
    type: types.literal('LinearIEQDisplay'),
    configuration: ConfigurationReference(configSchema)
  })).actions(function (self) {
    return {
      selectFeature: function selectFeature(feature) {
        if (feature) {
          var session = getSession(self);
          var featureWidget = session.addWidget('GDCFeatureWidget', 'gdcFeature', {
            featureData: feature.toJSON()
          });
          session.showWidget(featureWidget);
          session.setSelection(feature);
        }
      }
    };
  }).views(function (self) {
    var superRenderProps = self.renderProps;
    return {
      renderProps: function renderProps() {
        var config = self.rendererType.configSchema.create({
          color1: "jexl:ieqColouring(feature, 'reads_per_million_mirna_mapped')"
        }, getEnv(self));
        return _objectSpread2(_objectSpread2(_objectSpread2({}, superRenderProps()), getParentRenderProps(self)), {}, {
          displayModel: self,
          config: config
        });
      },
      get rendererTypeName() {
        return self.configuration.renderer.type;
      }
    };
  });
});

var LinearIEQDisplayF = (function (pluginManager) {
  return {
    configSchema: pluginManager.jbrequire(configSchemaF$1),
    stateModel: pluginManager.jbrequire(modelF$1)
  };
});

var configSchemaF = (function (pluginManager) {
  var baseLinearDisplayConfigSchema = pluginManager.getPlugin('LinearGenomeViewPlugin').exports.baseLinearDisplayConfigSchema;
  return ConfigurationSchema('LinearMAFDisplay', {
    renderer: pluginManager.pluggableConfigSchemaType('renderer')
  }, {
    baseConfiguration: baseLinearDisplayConfigSchema,
    explicitlyTyped: true
  });
});

var modelF = (function (jbrowse) {
  var configSchema = jbrowse.jbrequire(configSchemaF);
  var BaseLinearDisplay = jbrowse.getPlugin('LinearGenomeViewPlugin').exports.BaseLinearDisplay;
  return types.compose('LinearMAFDisplay', BaseLinearDisplay, types.model({
    type: types.literal('LinearMAFDisplay'),
    configuration: ConfigurationReference(configSchema)
  })).actions(function (self) {
    return {
      selectFeature: function selectFeature(feature) {
        if (feature) {
          var session = getSession(self);
          var featureWidget = session.addWidget('GDCFeatureWidget', 'gdcFeature', {
            featureData: feature.toJSON()
          });
          session.showWidget(featureWidget);
          session.setSelection(feature);
        }
      }
    };
  }).views(function (self) {
    var superRenderProps = self.renderProps;
    return {
      renderProps: function renderProps() {
        var config = self.rendererType.configSchema.create({
          color1: "jexl:mafColouring(feature)"
        }, getEnv(self));
        return _objectSpread2(_objectSpread2(_objectSpread2({}, superRenderProps()), getParentRenderProps(self)), {}, {
          displayModel: self,
          config: config
        });
      },
      get rendererTypeName() {
        return self.configuration.renderer.type;
      }
    };
  });
});

var LinearMAFDisplay = (function (pluginManager) {
  return {
    configSchema: pluginManager.jbrequire(configSchemaF),
    stateModel: pluginManager.jbrequire(modelF)
  };
});

var GDCAdapterConfigSchema = ConfigurationSchema('GDCAdapter', {
    filters: {
        type: 'string',
        defaultValue: '{}',
        description: 'The filters to be applied to the track. Only edit if you know what you are doing.',
    },
    colourBy: {
        type: 'string',
        defaultValue: '{}',
        description: 'Colour features based on track attributes. Only edit if you know what you are doing.',
    },
    featureType: {
        type: 'stringEnum',
        model: types.enumeration('Feature Type', ['mutation', 'gene']),
        defaultValue: 'mutation',
        description: 'The type of track to add',
    },
    cases: {
        type: 'stringArray',
        defaultValue: [],
        description: 'GDC case UUIDs',
    },
    size: {
        type: 'integer',
        defaultValue: 5000,
        description: 'The max number of features to show.',
    },
}, { explicitlyTyped: true, explicitIdentifier: 'GDCAdapterId' });

class GDCFeature {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gdcObject;
    data;
    uniqueId;
    featureType;
    constructor(args) {
        this.gdcObject = args.gdcObject;
        this.featureType = args.featureType ? args.featureType : 'mutation';
        this.data = this.dataFromGDCObject(this.gdcObject, this.featureType);
        this.uniqueId = args.id;
    }
    get(field) {
        return this.gdcObject[field] || this.data[field];
    }
    set() { }
    parent() {
        return undefined;
    }
    children() {
        return undefined;
    }
    tags() {
        const t = [...Object.keys(this.data), ...Object.keys(this.gdcObject)];
        return t;
    }
    id() {
        return this.uniqueId;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataFromGDCObject(gdcObject, featureType) {
        // Defaults to mutation values
        const featureData = {
            refName: gdcObject.chromosome,
            type: gdcObject.mutationType,
            start: gdcObject.startPosition - 1,
            end: gdcObject.endPosition,
        };
        switch (featureType) {
            case 'gene': {
                featureData.start = gdcObject.geneStart - 1;
                featureData.end = gdcObject.geneEnd;
                featureData.refName = gdcObject.geneChromosome;
                featureData.type = gdcObject.biotype;
                featureData.note = gdcObject.symbol;
                break;
            }
        }
        return featureData;
    }
    toJSON() {
        return {
            uniqueId: this.uniqueId,
            ...this.data,
            ...this.gdcObject,
        };
    }
}

class GDCAdapter extends BaseFeatureDataAdapter {
    filters;
    cases;
    size;
    featureType;
    static capabilities = ['getFeatures', 'getRefNames'];
    featureCache = new AbortablePromiseCache({
        cache: new LRU({ maxSize: 200 }),
        fill: async (query, abortSignal) => {
            return this.fetchFeatures(query, abortSignal);
        },
    });
    async fetchFeatures(query, signal) {
        const response = await fetch('https://api.gdc.cancer.gov/v0/graphql', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(query),
            signal,
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    constructor(config) {
        super(config);
        const filters = readConfObject(config, 'filters');
        const cases = readConfObject(config, 'cases');
        const size = readConfObject(config, 'size');
        const featureType = readConfObject(config, 'featureType');
        this.filters = filters;
        this.cases = cases;
        this.size = size;
        this.featureType = featureType;
    }
    async getRefNames() {
        return [
            'chr1',
            'chr10',
            'chr11',
            'chr12',
            'chr13',
            'chr14',
            'chr15',
            'chr16',
            'chr17',
            'chr18',
            'chr19',
            'chr2',
            'chr20',
            'chr21',
            'chr22',
            'chr3',
            'chr4',
            'chr5',
            'chr6',
            'chr7',
            'chr8',
            'chr9',
            'chrX',
            'chrY',
        ];
    }
    getFeatures(region, opts = {}) {
        const { refName, start, end } = region;
        return ObservableCreate(async (observer) => {
            try {
                let query = {};
                let idField = 'ssmId';
                switch (this.featureType) {
                    case 'mutation': {
                        query = this.createMutationQuery(refName.replace(/chr/, ''), start, end);
                        idField = 'ssmId';
                        break;
                    }
                    case 'gene': {
                        query = this.createGeneQuery(refName.replace(/chr/, ''), start, end);
                        idField = 'geneId';
                        break;
                    }
                    default: {
                        observer.error(`Not a valid type: ${this.featureType}`);
                    }
                }
                const result = await this.featureCache.get(JSON.stringify(query), query, opts.signal);
                const queryResults = result.data.viewer.explore.features.hits.edges;
                if (this.featureType === 'mutation') {
                    const cohortCount = result.data.viewer.explore.filteredCases.hits.total;
                    const denom = Math.ceil(Math.log10(cohortCount));
                    for (const hit of queryResults) {
                        const gdcObject = hit.node;
                        gdcObject.numOfCasesInCohort = cohortCount;
                        gdcObject.percentage =
                            (100 * Math.log10(gdcObject.score)) / denom + 100;
                        gdcObject.occurrenceInCohort = `${gdcObject.score} / ${cohortCount}`;
                        const feature = new GDCFeature({
                            gdcObject,
                            id: gdcObject[idField],
                            featureType: this.featureType,
                        });
                        observer.next(feature);
                    }
                }
                else {
                    for (const hit of queryResults) {
                        const gdcObject = hit.node;
                        gdcObject.strand = gdcObject.geneStrand;
                        gdcObject.id = gdcObject[idField];
                        const feature = new GDCFeature({
                            gdcObject,
                            id: gdcObject[idField],
                            featureType: this.featureType,
                        });
                        observer.next(feature);
                    }
                }
            }
            catch (e) {
                observer.error(e);
            }
            observer.complete();
        }, opts.signal);
    }
    freeResources() { }
    /**
     * Create a GraphQL query for GDC mutations
     * @param ref - chromosome reference
     * @param start - start position
     * @param end - end position
     */
    createMutationQuery(ref, start, end) {
        const ssmQuery = `query mutationsQuery( $size: Int $offset: Int $filters: FiltersArgument $filtersWithoutLocation: FiltersArgument $score: String $sort: [Sort] ) { viewer { explore { filteredCases: cases { hits(first: 0, filters: $filtersWithoutLocation) { total } } features: ssms { hits(first: $size, offset: $offset, filters: $filters, score: $score, sort: $sort) { total edges { node { score startPosition: start_position endPosition: end_position mutationType: mutation_type cosmicId: cosmic_id referenceAllele: reference_allele ncbiBuild: ncbi_build genomicDnaChange: genomic_dna_change mutationSubtype: mutation_subtype ssmId: ssm_id chromosome consequence { hits { edges { node { transcript { is_canonical annotation { vep_impact polyphen_impact polyphen_score sift_score sift_impact hgvsc } consequence_type gene { gene_id symbol gene_strand } aa_change transcript_id } id } } } } } } } } } } }`;
        const combinedFilters = this.getFilterQuery(ref, start, end, false);
        const filtersNoLocation = this.getFilterQuery(ref, start, end, true);
        const body = {
            query: ssmQuery,
            variables: {
                size: this.size ? this.size : 5000,
                offset: 0,
                filters: combinedFilters,
                filtersWithoutLocation: filtersNoLocation,
                score: 'occurrence.case.project.project_id',
                sort: [
                    { field: '_score', order: 'desc' },
                    { field: '_uid', order: 'asc' },
                ],
            },
        };
        return body;
    }
    /**
     * Create a GraphQL query for GDC genes
     * @param ref - chromosome reference
     * @param start - start position
     * @param end - end position
     */
    createGeneQuery(ref, start, end) {
        const geneQuery = `query genesQuery( $filters: FiltersArgument $size: Int $offset: Int $score: String ) { viewer { explore { features: genes { hits(first: $size, offset: $offset, filters: $filters, score: $score) { total edges { node { geneId: gene_id id geneStrand: gene_strand synonyms symbol name geneStart: gene_start geneEnd: gene_end geneChromosome: gene_chromosome description canonicalTranscriptId: canonical_transcript_id externalDbIds: external_db_ids { hgnc omimGene: omim_gene uniprotkbSwissprot: uniprotkb_swissprot entrezGene: entrez_gene } biotype isCancerGeneCensus: is_cancer_gene_census } } } } } } }`;
        const combinedFilters = this.getFilterQuery(ref, start, end, false);
        const body = {
            query: geneQuery,
            variables: {
                filters: combinedFilters,
                size: this.size ? this.size : 5000,
                offset: 0,
                score: 'case.project.project_id',
            },
        };
        return body;
    }
    /**
     * Create the full filter based on the given filter, location and case(s)
     * @param chr - chromosome (ex. 1)
     * @param start - start position
     * @param end - end position
     */
    getFilterQuery(chr, start, end, skipLocation) {
        const resultingFilterQuery = {
            op: 'and',
            content: [
                this.addLocationAndCasesToFilter(chr, start, end, skipLocation),
            ],
        };
        const filterObject = JSON.parse(this.filters);
        if (filterObject && Object.keys(filterObject).length > 0) {
            resultingFilterQuery.content.push(filterObject);
        }
        return resultingFilterQuery;
    }
    /**
     * Create a filter for the current visible location and case(s)
     * @param chr - chromosome (ex. 1)
     * @param start - start position
     * @param end - end position
     */
    addLocationAndCasesToFilter(chr, start, end, skipLocation) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let locationFilter;
        if (!skipLocation) {
            switch (this.featureType) {
                case 'mutation': {
                    locationFilter = {
                        op: 'and',
                        content: [
                            {
                                op: '<=',
                                content: { field: 'ssms.start_position', value: end },
                            },
                            {
                                op: '>=',
                                content: { field: 'ssms.end_position', value: start },
                            },
                            {
                                op: '=',
                                content: { field: 'ssms.chromosome', value: [`chr${chr}`] },
                            },
                        ],
                    };
                    break;
                }
                case 'gene': {
                    locationFilter = {
                        op: 'and',
                        content: [
                            {
                                op: '<=',
                                content: { field: 'genes.gene_start', value: end },
                            },
                            { op: '>=', content: { field: 'genes.gene_end', value: start } },
                            {
                                op: '=',
                                content: { field: 'genes.gene_chromosome', value: [chr] },
                            },
                        ],
                    };
                    break;
                }
                default:
                    throw new Error(`invalid featureType ${this.featureType}`);
            }
        }
        else {
            locationFilter = {
                op: 'and',
                content: [
                    {
                        op: 'in',
                        content: {
                            field: 'available_variation_data',
                            value: ['ssm'],
                        },
                    },
                ],
            };
        }
        if (this.cases && this.cases.length > 0) {
            const caseFilter = {
                op: 'in',
                content: { field: 'cases.case_id', value: this.cases },
            };
            locationFilter.content.push(caseFilter);
        }
        return locationFilter;
    }
}

var segmentCnvConfigSchema = ConfigurationSchema('SegmentCNVAdapter', {
    segLocation: {
        type: 'fileLocation',
        defaultValue: { uri: '/path/to/myfile.seg', locationType: 'UriLocation' },
    },
}, { explicitlyTyped: true });

class SegmentCNVAdapter extends BaseFeatureDataAdapter {
    static capabilities = ['getFeatures', 'getRefNames'];
    setupP;
    async readSeg() {
        const segLocation = readConfObject(this.config, 'segLocation');
        const fileContents = await openLocation(segLocation, this.pluginManager).readFile('utf8');
        const lines = fileContents.split('\n');
        const refNames = [];
        const rows = [];
        let columns = [];
        let refNameColumnIndex = 0;
        lines.forEach(line => {
            if (columns.length === 0) {
                columns = line.split('\t');
                refNameColumnIndex = columns.findIndex(element => element.toLowerCase() === 'chromosome');
            }
            else {
                if (line.split('\t')[refNameColumnIndex] !== undefined) {
                    rows.push(line);
                    refNames.push(line.split('\t')[refNameColumnIndex]);
                }
            }
        });
        return {
            lines: rows,
            columns,
            refNames: Array.from(new Set(refNames)),
        };
    }
    parseLine(line, columns) {
        const segment = {};
        line.split('\t').forEach((property, i) => {
            if (property) {
                if (i === 0) {
                    segment.id = property;
                }
                else {
                    // some SEG files have different data, this logic is to ensure that
                    // we don't need special colouring functions to accomodate for those
                    // differences...mean and copy number indicate the track colouring
                    if (columns[i].toLowerCase() === 'segment_mean' ||
                        columns[i].toLowerCase() === 'copy_number') {
                        segment.score = +property;
                    }
                    segment[columns[i].toLowerCase()] = property;
                }
            }
        });
        return segment;
    }
    async getLines() {
        const { columns, lines } = await this.readSeg();
        return lines.map(line => {
            const segment = this.parseLine(line, columns);
            return new SimpleFeature({
                ...segment,
                uniqueId: segment.id,
                id: segment.id,
                start: +segment.start,
                end: +segment.end,
                refName: segment.chromosome,
                score: +segment.score,
            });
        });
    }
    async setup() {
        if (!this.setupP) {
            this.setupP = this.getLines();
        }
        return this.setupP;
    }
    async getRefNames(_ = {}) {
        const { refNames } = await this.readSeg();
        return refNames;
    }
    getFeatures(region, opts = {}) {
        return ObservableCreate(async (observer) => {
            const feats = await this.setup();
            feats.forEach(f => {
                if (f.get('refName') === region.refName &&
                    f.get('end') > region.start &&
                    f.get('start') < region.end) {
                    observer.next(f);
                }
            });
            observer.complete();
        }, opts.signal);
    }
    freeResources() { }
}

var mafConfigSchema = ConfigurationSchema('MafAdapter', {
    mafLocation: {
        type: 'fileLocation',
        defaultValue: { uri: '/path/to/myfile.maf', locationType: 'UriLocation' },
    },
}, { explicitlyTyped: true });

class MafFeature {
    mutation;
    data;
    _id;
    constructor(args) {
        this.mutation = args.mutation;
        this.data = this.dataFromMutation(this.mutation);
        this._id = args.id;
    }
    get(field) {
        return this.data[field] || this.mutation[field];
    }
    set() { }
    parent() {
        return undefined;
    }
    children() {
        return undefined;
    }
    tags() {
        const t = [...Object.keys(this.data), ...Object.keys(this.mutation)];
        return t;
    }
    id() {
        return this._id;
    }
    dataFromMutation(mutation) {
        const featureData = {
            refName: mutation.chromosome,
            start: +mutation.start_position - 1,
            end: +mutation.end_position,
            name: `${mutation.chromosome}:g.${mutation.start_position}${mutation.tumor_seq_allele1}>${mutation.tumor_seq_allele2}`,
            note: mutation.hgvsc,
            //score: +mutation.score,
        };
        return featureData;
    }
    toJSON() {
        return {
            uniqueId: this._id,
            ...this.mutation,
            ...this.data,
        };
    }
}

class MafAdapter extends BaseFeatureDataAdapter {
    static capabilities = ['getFeatures', 'getRefNames'];
    setupP;
    readMaf(fileContents) {
        const lines = fileContents.split('\n');
        const header = [];
        const refNames = [];
        const rows = [];
        let columns = [];
        let refNameColumnIndex = 0;
        lines.forEach(line => {
            if (line.startsWith('#')) {
                header.push(line);
            }
            else if (line) {
                if (columns.length === 0) {
                    columns = line.split('\t');
                    refNameColumnIndex = columns.findIndex(element => element.toLowerCase() === 'chromosome');
                }
                else {
                    rows.push(line);
                    refNames.push(line.split('\t')[refNameColumnIndex]);
                }
            }
        });
        return {
            header: header.join('\n'),
            lines: rows,
            columns,
            refNames: Array.from(new Set(refNames)),
        };
    }
    parseLine(line, columns) {
        const mutationObject = {};
        line.split('\t').forEach((property, i) => {
            if (property) {
                mutationObject[columns[i].toLowerCase()] = property;
            }
        });
        return mutationObject;
    }
    async decodeFileContents() {
        const mafLocation = readConfObject(this.config, 'mafLocation');
        const fileContents = await openLocation(mafLocation, this.pluginManager).readFile();
        let str;
        if (typeof fileContents[0] === 'number' &&
            fileContents[0] === 31 &&
            typeof fileContents[1] === 'number' &&
            fileContents[1] === 139 &&
            typeof fileContents[2] === 'number' &&
            fileContents[2] === 8) {
            str = new TextDecoder().decode(pako.inflate(fileContents));
        }
        else {
            str = fileContents.toString();
        }
        return this.readMaf(str);
    }
    async getLines() {
        const { columns, lines } = await this.decodeFileContents();
        return lines.map((line, index) => {
            return new MafFeature({
                mutation: this.parseLine(line, columns),
                id: `${this.id}-maf-${index}`,
            });
        });
    }
    async setup() {
        if (!this.setupP) {
            this.setupP = this.getLines();
        }
        return this.setupP;
    }
    async getRefNames(_ = {}) {
        const { refNames } = await this.decodeFileContents();
        return refNames;
    }
    getFeatures(region, opts = {}) {
        return ObservableCreate(async (observer) => {
            const feats = await this.setup();
            feats.forEach(f => {
                if (f.get('refName') === region.refName &&
                    f.get('end') > region.start &&
                    f.get('start') < region.end) {
                    observer.next(f);
                }
            });
            observer.complete();
        }, opts.signal);
    }
    freeResources() { }
}

var mbvConfigSchema = ConfigurationSchema('MbvAdapter', {
    mbvLocation: {
        type: 'fileLocation',
        defaultValue: { uri: '/path/to/myfile.txt', locationType: 'UriLocation' },
    },
}, { explicitlyTyped: true });

class MbvFeature {
    value;
    data;
    _id;
    constructor(args) {
        this.value = args.value;
        this.data = this.dataFromValue(this.value);
        this._id = args.id;
    }
    get(field) {
        return this.data[field] || this.value[field];
    }
    set() { }
    parent() {
        return undefined;
    }
    children() {
        return undefined;
    }
    tags() {
        const t = [...Object.keys(this.data), ...Object.keys(this.value)];
        return t;
    }
    id() {
        return this._id;
    }
    dataFromValue(value) {
        const featureData = {
            refName: value.chromosome,
            start: +value.start - 1,
            end: +value.end,
            name: `${value['composite element ref']}`,
            note: value.beta_value,
        };
        return featureData;
    }
    toJSON() {
        return {
            uniqueId: this._id,
            ...this.value,
            ...this.data,
        };
    }
}

class MbvAdapter extends BaseFeatureDataAdapter {
    static capabilities = ['getFeatures', 'getRefNames'];
    setupP;
    readMbv(fileContents) {
        const lines = fileContents.split('\n');
        const refNames = [];
        const rows = [];
        let columns = [];
        let refNameColumnIndex = 0;
        lines.forEach(line => {
            if (columns.length === 0) {
                columns = line.split('\t');
                refNameColumnIndex = columns.findIndex(element => element.toLowerCase() === 'chromosome');
            }
            else {
                if (line.split('\t')[refNameColumnIndex] !== '*' &&
                    line.split('\t')[refNameColumnIndex] !== undefined) {
                    rows.push(line);
                    refNames.push(line.split('\t')[refNameColumnIndex]);
                }
            }
        });
        return {
            lines: rows,
            columns,
            refNames: Array.from(new Set(refNames)),
        };
    }
    parseLine(line, columns) {
        const mutationObject = {};
        line.split('\t').forEach((property, i) => {
            if (property) {
                mutationObject[columns[i].toLowerCase()] = property;
            }
        });
        return mutationObject;
    }
    async decodeFileContents() {
        const mbvLocation = readConfObject(this.config, 'mbvLocation');
        const fileContents = await openLocation(mbvLocation, this.pluginManager).readFile();
        let str;
        if (typeof fileContents[0] === 'number' &&
            fileContents[0] === 31 &&
            typeof fileContents[1] === 'number' &&
            fileContents[1] === 139 &&
            typeof fileContents[2] === 'number' &&
            fileContents[2] === 8) {
            str = new TextDecoder().decode(pako.inflate(fileContents));
        }
        else {
            str = fileContents.toString();
        }
        return this.readMbv(str);
    }
    async getLines() {
        const { columns, lines } = await this.decodeFileContents();
        return lines.map((line, index) => {
            return new MbvFeature({
                value: this.parseLine(line, columns),
                id: `${this.id}-mbv-${index}`,
            });
        });
    }
    async setup() {
        if (!this.setupP) {
            this.setupP = this.getLines();
        }
        return this.setupP;
    }
    async getRefNames(_ = {}) {
        const { refNames } = await this.decodeFileContents();
        return refNames;
    }
    getFeatures(region, opts = {}) {
        return ObservableCreate(async (observer) => {
            const feats = await this.setup();
            feats.forEach(f => {
                if (f.get('refName') === region.refName &&
                    f.get('end') > region.start &&
                    f.get('start') < region.end) {
                    observer.next(f);
                }
            });
            observer.complete();
        }, opts.signal);
    }
    freeResources() { }
}

var ieqConfigSchema = ConfigurationSchema('IeqAdapter', {
    ieqLocation: {
        type: 'fileLocation',
        defaultValue: { uri: '/path/to/myfile.tsv', locationType: 'UriLocation' },
    },
}, { explicitlyTyped: true });

/**
 * Isoform Expression Quantification Adapter
 */
class IeqFeature {
    iso;
    data;
    _id;
    constructor(args) {
        this.iso = args.iso;
        this.data = this.dataFromIso(this.iso);
        this._id = args.id;
    }
    get(field) {
        return this.data[field] || this.iso[field];
    }
    set() { }
    parent() {
        return undefined;
    }
    children() {
        return undefined;
    }
    tags() {
        const t = [...Object.keys(this.data), ...Object.keys(this.iso)];
        return t;
    }
    id() {
        return this._id;
    }
    dataFromIso(iso) {
        const featureData = {
            refName: iso.chromosome,
            start: +iso.start - 1,
            end: +iso.end,
            name: `${iso.mirna_id}, ${iso.read_count} reads`,
            strand: 1,
        };
        return featureData;
    }
    toJSON() {
        return {
            uniqueId: this._id,
            ...this.iso,
            ...this.data,
        };
    }
}

/**
 * Isoform Expression Quantification Adapter
 */
class IeqAdapter extends BaseFeatureDataAdapter {
    static capabilities = ['getFeatures', 'getRefNames'];
    setupP;
    async readIeq() {
        const ieqLocation = readConfObject(this.config, 'ieqLocation');
        const fileContents = await openLocation(ieqLocation, this.pluginManager).readFile('utf8');
        const lines = fileContents.split('\n');
        const rows = [];
        let columns = [];
        lines.forEach(line => {
            if (line) {
                if (columns.length === 0) {
                    columns = line.split('\t');
                }
                else {
                    rows.push(line);
                }
            }
        });
        return {
            lines: rows,
            columns,
        };
    }
    parseCoords(property) {
        const splitProperty = property.split(':');
        return {
            chromosome: splitProperty[1],
            start: splitProperty[2].split('-')[0],
            end: splitProperty[2].split('-')[1],
            strand: splitProperty[3] === '+' ? 1 : 0,
        };
    }
    parseLine(line, columns) {
        let iso = {};
        line.split('\t').forEach((property, i) => {
            if (property) {
                if (columns[i] === 'isoform_coords') {
                    const parsedProperties = this.parseCoords(property);
                    iso = {
                        ...iso,
                        ...parsedProperties,
                    };
                }
                else {
                    iso[columns[i].toLowerCase()] = property;
                }
            }
        });
        return iso;
    }
    async getLines() {
        const { columns, lines } = await this.readIeq();
        return lines.map((line, index) => {
            return new IeqFeature({
                iso: this.parseLine(line, columns),
                id: `${this.id}-ieq-${index}`,
            });
        });
    }
    async setup() {
        if (!this.setupP) {
            this.setupP = this.getLines();
        }
        return this.setupP;
    }
    async getRefNames(_ = {}) {
        return [
            'chr1',
            'chr2',
            'chr3',
            'chr4',
            'chr5',
            'chr6',
            'chr7',
            'chr8',
            'chr9',
            'chr10',
            'chr11',
            'chr12',
            'chr13',
            'chr14',
            'chr15',
            'chr16',
            'chr17',
            'chr18',
            'chr19',
            'chr20',
            'chr21',
            'chr22',
            'chrX',
            'chrY',
        ];
    }
    getFeatures(region, opts = {}) {
        return ObservableCreate(async (observer) => {
            const feats = await this.setup();
            feats.forEach(f => {
                if (f.get('refName') === region.refName &&
                    f.get('end') > region.start &&
                    f.get('start') < region.end) {
                    observer.next(f);
                }
            });
            observer.complete();
        }, opts.signal);
    }
    freeResources() { }
}

var sjqConfigSchema = ConfigurationSchema('SjqAdapter', {
    sjqLocation: {
        type: 'fileLocation',
        defaultValue: { uri: '/path/to/myfile.tsv', locationType: 'UriLocation' },
    },
}, { explicitlyTyped: true });

/**
 * Splice Junction Quantification Adapter
 */
class SjqFeature {
    sjq;
    data;
    _id;
    constructor(args) {
        this.sjq = args.sjq;
        this.data = this.dataFromSjq(this.sjq);
        this._id = args.id;
    }
    get(field) {
        return this.data[field] || this.sjq[field];
    }
    set() { }
    parent() {
        return undefined;
    }
    children() {
        return undefined;
    }
    tags() {
        const t = [...Object.keys(this.data), ...Object.keys(this.sjq)];
        return t;
    }
    id() {
        return this._id;
    }
    // #chromosome	intron_start	intron_end	strand	intron_motif	annotation	n_unique_map	n_multi_map	max_splice_overhang
    dataFromSjq(sjq) {
        const featureData = {
            refName: sjq.chromosome,
            start: +sjq.intron_start - 1,
            end: +sjq.intron_end,
            score: +sjq.n_unique_map + +sjq.n_multi_map,
            name: `unique: ${sjq.n_unique_map}, multi: ${sjq.n_multi_map}`,
        };
        return featureData;
    }
    toJSON() {
        return {
            uniqueId: this._id,
            ...this.sjq,
            ...this.data,
        };
    }
}

/**
 * Splice Junction Quantification Adapter
 */
class SjqAdapter extends BaseFeatureDataAdapter {
    static capabilities = ['getFeatures', 'getRefNames'];
    setupP;
    readSjq(fileContents) {
        const lines = fileContents.split('\n');
        const rows = [];
        let columns = [];
        lines.forEach(line => {
            if (line) {
                if (columns.length === 0) {
                    columns = line.split('\t');
                }
                else {
                    rows.push(line);
                }
            }
        });
        return {
            lines: rows,
            columns,
        };
    }
    async decodeFileContents() {
        const sjqLocation = readConfObject(this.config, 'sjqLocation');
        const fileContents = await openLocation(sjqLocation, this.pluginManager).readFile();
        let str;
        if (typeof fileContents[0] === 'number' &&
            fileContents[0] === 31 &&
            typeof fileContents[1] === 'number' &&
            fileContents[1] === 139 &&
            typeof fileContents[2] === 'number' &&
            fileContents[2] === 8) {
            str = new TextDecoder().decode(pako.inflate(fileContents));
        }
        else {
            str = fileContents.toString();
        }
        return this.readSjq(str);
    }
    parseLine(line, columns) {
        const sjq = {};
        line.split('\t').forEach((property, i) => {
            // Source: https://stackoverflow.com/questions/4374822/remove-all-special-characters-with-regexp
            columns[i] = columns[i].toLowerCase().replace(/[^\w\s]/gi, '');
            if (property) {
                sjq[columns[i].toLowerCase()] = property;
            }
        });
        return sjq;
    }
    async getLines() {
        const { columns, lines } = await this.decodeFileContents();
        return lines.map((line, index) => {
            return new SjqFeature({
                sjq: this.parseLine(line, columns),
                id: `${this.id}-sjq-${index}`,
            });
        });
    }
    async setup() {
        if (!this.setupP) {
            this.setupP = this.getLines();
        }
        return this.setupP;
    }
    async getRefNames(_ = {}) {
        return [
            'chr1',
            'chr2',
            'chr3',
            'chr4',
            'chr5',
            'chr6',
            'chr7',
            'chr8',
            'chr9',
            'chr10',
            'chr11',
            'chr12',
            'chr13',
            'chr14',
            'chr15',
            'chr16',
            'chr17',
            'chr18',
            'chr19',
            'chr20',
            'chr21',
            'chr22',
            'chrX',
            'chrY',
        ];
    }
    getFeatures(region, opts = {}) {
        return ObservableCreate(async (observer) => {
            const feats = await this.setup();
            feats.forEach(f => {
                if (f.get('refName') === region.refName &&
                    f.get('end') > region.start &&
                    f.get('start') < region.end) {
                    observer.next(f);
                }
            });
            observer.complete();
        }, opts.signal);
    }
    freeResources() { }
}

const GDCConfigSchema = ConfigurationSchema('GDCInternetAccount', {
    authHeader: {
        description: 'custom auth header for authorization',
        type: 'string',
        defaultValue: 'X-Auth-Token',
    },
    customEndpoint: {
        description: 'custom endpoint for the external token resource',
        type: 'string',
        defaultValue: '',
    },
}, {
    baseConfiguration: BaseInternetAccountConfig,
    explicitlyTyped: true,
});

const useStyles = makeStyles()(theme => ({
    root: {
        margin: theme.spacing(1),
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(2),
    },
    imgContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    img: {
        width: 100,
        maxWidth: '100%',
        maxHeight: '100%',
        verticalAlign: 'middle',
    },
    helperTextContainer: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    submitTokenContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    alertContainer: {
        paddingBottom: theme.spacing(2),
    },
}));
function LoginDialogue({ handleClose, }) {
    const [token, setToken] = useState('');
    const { classes } = useStyles();
    return (React.createElement(Dialog, { open: true, onClose: () => handleClose(), maxWidth: "sm", title: "Login to access controlled GDC data" },
        React.createElement(DialogContent, null,
            React.createElement("div", { className: classes.root },
                React.createElement("div", { className: classes.paper },
                    React.createElement(Typography, { variant: "h4", align: "center" }, "GDC Data Portal"),
                    React.createElement("div", { className: classes.helperTextContainer },
                        React.createElement(Typography, { variant: "h6", component: "h1", align: "center" }, "Login to access controlled data"),
                        React.createElement(Typography, { variant: "body1", align: "center" }, "An authentication token is required to access controlled data."),
                        React.createElement(Typography, { variant: "body2", align: "center" }, "You will need to provide your authentication token every time you start a new session, as the token is deleted when the session expires.")),
                    React.createElement("div", { className: classes.submitTokenContainer },
                        React.createElement(TextField, { color: "primary", variant: "outlined", label: "Enter token", onChange: event => {
                                setToken(event.target.value);
                            } }),
                        React.createElement("div", { className: classes.buttonContainer },
                            React.createElement(Button, { color: "primary", variant: "contained", size: "large", onClick: () => {
                                    handleClose(token);
                                } }, "Login"))))))));
}

const stateModelFactory = (configSchema) => {
    return types
        .compose('GDCInternetAccount', InternetAccount, types.model({
        id: 'GDCToken',
        type: types.literal('GDCInternetAccount'),
        configuration: ConfigurationReference(configSchema),
    }))
        .volatile(() => ({
        needsToken: false,
    }))
        .views(self => ({
        get authHeader() {
            return getConf(self, 'authHeader');
        },
        get customEndpoint() {
            return getConf(self, 'customEndpoint');
        },
        get internetAccountType() {
            return 'GDCInternetAccount';
        },
    }))
        .actions(self => ({
        setNeedsToken(bool) {
            self.needsToken = bool;
        },
    }))
        .actions(self => ({
        getTokenFromUser(resolve, reject) {
            getSession(self).queueDialog(doneCallback => [
                LoginDialogue,
                {
                    handleClose: (token) => {
                        if (token) {
                            resolve(token);
                        }
                        else {
                            reject(new Error('failed to add track: this is a controlled resource that requires an authenticated token to access. Please verify your credentials and try again.'));
                        }
                        doneCallback();
                    },
                },
            ]);
        },
        getFetcher(location) {
            return async (input, init) => {
                const authToken = await self.getToken(location);
                let newInit = init;
                if (authToken !== 'none') {
                    newInit = self.addAuthHeaderToInit(init, authToken);
                }
                let query = String(input);
                if (query.includes('files/')) {
                    query = `${self.customEndpoint}/data/${query.split('/')[4]}`;
                }
                return fetch(query, newInit);
            };
        },
    }))
        .actions(self => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const superGetToken = self.getToken;
        const needsToken = new Map();
        return {
            /**
             * uses the location of the resource to fetch the 'metadata' of the
             * file, which contains the index files (if applicable) and the
             * property 'controlled' which determines whether the user needs a
             * token to be checked against the resource or not. if controlled =
             * false, then the user will not be prompted with a token dialogue
             *
             * @param location the uri location of the resource to be fetched
             */
            async getToken(location) {
                if (location && needsToken.has(location.uri)) {
                    if (needsToken.get(location.uri)) {
                        return superGetToken(location);
                    }
                    else {
                        return 'none';
                    }
                }
                // determine if the resource requires a token
                const query = location?.uri.split('/').pop();
                const response = await fetch(`${self.customEndpoint}/data/${query}`);
                if (response.status === 403) {
                    needsToken.set(location?.uri, true);
                    return superGetToken(location);
                }
                else {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status} (${await response.text()})`);
                    }
                }
                needsToken.set(location?.uri, false);
                return 'none';
            },
        };
    });
};

class GDCPlugin extends Plugin {
    name = 'GDCPlugin';
    version = version;
    install(pluginManager) {
        const LGVPlugin = pluginManager.getPlugin('LinearGenomeViewPlugin');
        const { BaseLinearDisplayComponent } = LGVPlugin.exports;
        const adapterCategoryHeader = 'GDC Plugin Adapters';
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'GDCAdapter',
            configSchema: GDCAdapterConfigSchema,
            adapterMetadata: {
                hiddenFromGUI: true,
            },
            AdapterClass: GDCAdapter,
        }));
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'SjqAdapter',
            configSchema: sjqConfigSchema,
            displayName: 'Splice Junction Quantification Adapter',
            adapterMetadata: {
                category: adapterCategoryHeader,
                hiddenFromGUI: false,
                description: '',
            },
            AdapterClass: SjqAdapter,
        }));
        pluginManager.addToExtensionPoint('Core-guessAdapterForLocation', (adapterGuesser) => {
            return (file, index, adapterHint) => {
                const adapterName = 'SjqAdapter';
                if (adapterHint === adapterName) {
                    return {
                        type: adapterName,
                        sjqLocation: file,
                    };
                }
                return adapterGuesser(file, index, adapterHint);
            };
        });
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'MbvAdapter',
            configSchema: mbvConfigSchema,
            displayName: 'Methylation Beta Value Adapter',
            adapterMetadata: {
                category: adapterCategoryHeader,
                hiddenFromGUI: false,
                description: '',
            },
            AdapterClass: MbvAdapter,
        }));
        pluginManager.addToExtensionPoint('Core-guessAdapterForLocation', (adapterGuesser) => {
            return (file, index, adapterHint) => {
                const adapterName = 'MbvAdapter';
                if (adapterHint === adapterName) {
                    return {
                        type: adapterName,
                        ieqLocation: file,
                    };
                }
                return adapterGuesser(file, index, adapterHint);
            };
        });
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'MafAdapter',
            configSchema: mafConfigSchema,
            adapterMetadata: {
                category: adapterCategoryHeader,
                hiddenFromGUI: false,
                description: '',
            },
            AdapterClass: MafAdapter,
        }));
        pluginManager.addToExtensionPoint('Core-guessAdapterForLocation', (adapterGuesser) => {
            return (file, index, adapterHint) => {
                const regexGuess = /\.maf$/i;
                const adapterName = 'MafAdapter';
                const fileName = getFileName(file);
                if (regexGuess.test(fileName) || adapterHint === adapterName) {
                    return {
                        type: adapterName,
                        mafLocation: file,
                    };
                }
                return adapterGuesser(file, index, adapterHint);
            };
        });
        pluginManager.addToExtensionPoint('Core-guessTrackTypeForLocation', (trackTypeGuesser) => {
            return (adapterName) => {
                if (adapterName === 'MafAdapter') {
                    return 'MAFTrack';
                }
                return trackTypeGuesser(adapterName);
            };
        });
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'IeqAdapter',
            configSchema: ieqConfigSchema,
            displayName: 'Isoform Expression Quantification Adapter',
            adapterMetadata: {
                category: adapterCategoryHeader,
                hiddenFromGUI: false,
                description: '',
            },
            AdapterClass: IeqAdapter,
        }));
        pluginManager.addToExtensionPoint('Core-guessAdapterForLocation', (adapterGuesser) => {
            return (file, index, adapterHint) => {
                const adapterName = 'IeqAdapter';
                if (adapterHint === adapterName) {
                    return {
                        type: adapterName,
                        ieqLocation: file,
                    };
                }
                return adapterGuesser(file, index, adapterHint);
            };
        });
        pluginManager.addToExtensionPoint('Core-guessTrackTypeForLocation', (trackTypeGuesser) => {
            return (adapterName) => {
                if (adapterName === 'IeqAdapter') {
                    return 'IEQTrack';
                }
                return trackTypeGuesser(adapterName);
            };
        });
        pluginManager.addAdapterType(() => new AdapterType({
            name: 'SegmentCNVAdapter',
            configSchema: segmentCnvConfigSchema,
            displayName: 'Segment Copy Number Variation Adapter',
            adapterMetadata: {
                category: adapterCategoryHeader,
                hiddenFromGUI: false,
                description: '',
            },
            AdapterClass: SegmentCNVAdapter,
        }));
        pluginManager.addToExtensionPoint('Core-guessAdapterForLocation', (adapterGuesser) => {
            return (file, index, adapterHint) => {
                const regexGuess = /\.seg$/i;
                const adapterName = 'SegmentCNVAdapter';
                const fileName = getFileName(file);
                if (regexGuess.test(fileName) || adapterHint === adapterName) {
                    return {
                        type: adapterName,
                        segLocation: file,
                    };
                }
                return adapterGuesser(file, index, adapterHint);
            };
        });
        pluginManager.addToExtensionPoint('Core-guessTrackTypeForLocation', (trackTypeGuesser) => {
            return (adapterName) => {
                if (adapterName === 'SegmentCNVAdapter') {
                    return 'QuantitativeTrack';
                }
                return trackTypeGuesser(adapterName);
            };
        });
        pluginManager.addTrackType(() => {
            const configSchema = ConfigurationSchema('GDCTrack', {}, {
                baseConfiguration: createBaseTrackConfig(pluginManager),
                explicitIdentifier: 'trackId',
            });
            return new TrackType$1({
                name: 'GDCTrack',
                configSchema,
                stateModel: createBaseTrackModel(pluginManager, 'GDCTrack', configSchema),
            });
        });
        pluginManager.addDisplayType(() => {
            const { configSchema, stateModel } = LinearGDCDisplayF(pluginManager);
            return new DisplayType({
                name: 'LinearGDCDisplay',
                configSchema,
                stateModel,
                trackType: 'GDCTrack',
                viewType: 'LinearGenomeView',
                ReactComponent: BaseLinearDisplayComponent,
            });
        });
        pluginManager.addTrackType(() => {
            const configSchema = ConfigurationSchema('IEQTrack', {}, {
                baseConfiguration: createBaseTrackConfig(pluginManager),
                explicitIdentifier: 'trackId',
            });
            return new TrackType$1({
                name: 'IEQTrack',
                configSchema,
                stateModel: createBaseTrackModel(pluginManager, 'IEQTrack', configSchema),
            });
        });
        pluginManager.addDisplayType(() => {
            const { configSchema, stateModel } = LinearIEQDisplayF(pluginManager);
            return new DisplayType({
                name: 'LinearIEQDisplay',
                configSchema,
                stateModel,
                trackType: 'IEQTrack',
                viewType: 'LinearGenomeView',
                ReactComponent: BaseLinearDisplayComponent,
            });
        });
        pluginManager.addTrackType(() => {
            const configSchema = ConfigurationSchema('MAFTrack', {}, {
                baseConfiguration: createBaseTrackConfig(pluginManager),
                explicitIdentifier: 'trackId',
            });
            return new TrackType$1({
                name: 'MAFTrack',
                configSchema,
                stateModel: createBaseTrackModel(pluginManager, 'MAFTrack', configSchema),
            });
        });
        pluginManager.addDisplayType(() => {
            const { configSchema, stateModel } = pluginManager.load(LinearMAFDisplay);
            return new DisplayType({
                name: 'LinearMAFDisplay',
                configSchema,
                stateModel,
                trackType: 'MAFTrack',
                viewType: 'LinearGenomeView',
                ReactComponent: BaseLinearDisplayComponent,
            });
        });
        pluginManager.addWidgetType(() => {
            return new WidgetType({
                name: 'GDCFilterWidget',
                ...GDCFilterWidgetF(pluginManager),
            });
        });
        pluginManager.addWidgetType(() => {
            return new WidgetType({
                name: 'GDCFeatureWidget',
                heading: 'Feature Details',
                configSchema: configSchema,
                stateModel: stateModelFactory$1(),
                ReactComponent: GDCFeatureWidgetComponent,
            });
        });
        pluginManager.addWidgetType(() => {
            return new WidgetType({
                name: 'GDCSearchWidget',
                heading: 'Search GDC',
                ...GDCSearchWidgetF(pluginManager),
            });
        });
        pluginManager.addInternetAccountType(() => {
            return new InternetAccountType({
                name: 'GDCInternetAccount',
                configSchema: GDCConfigSchema,
                stateModel: stateModelFactory(GDCConfigSchema),
            });
        });
    }
    configure(pluginManager) {
        if (isAbstractMenuManager(pluginManager.rootModel)) {
            pluginManager.rootModel.appendToMenu('Tools', {
                label: 'GDC Data Import',
                icon: DataExploration,
                onClick: (session) => {
                    session.showWidget(session.addWidget('GDCSearchWidget', 'gdcSearchWidget'));
                },
            });
        }
        pluginManager.jexl.addFunction('mafColouring', (feature) => {
            const classification = feature.get('variant_classification');
            switch (classification) {
                case 'Intron':
                    return 'blue';
                case 'Nonsense_Mutation':
                    return 'brown';
                case 'Missense_Mutation':
                    return 'goldenrod';
                case 'Silent':
                    return 'orange';
                case 'Splice_Site':
                    return 'green';
                case 'Translation_Start_Site':
                    return 'skyblue';
                case 'Nonstop_Mutation':
                    return 'red';
                case 'IGR':
                    return 'violet';
                case 'Frame_Shift_Del':
                    return 'pink';
                case 'Frame_Shift_Ins':
                    return 'olive';
                case 'In_Frame_Del':
                    return 'yellowgreen';
                case 'In_Frame_Ins':
                    return 'purple';
                case "3'UTR":
                    return 'lightgray';
                case "3'Flank":
                    return 'maroon';
                case "5'UTR":
                    return 'lime';
                case "5'Flank":
                    return 'magenta';
                case 'RNA':
                    return 'cyan';
                case 'Targeted_Region':
                    return 'crimson';
                default:
                    return 'black';
            }
        });
        pluginManager.jexl.addFunction('switch', (feature, hlBy) => {
            hlBy = JSON.parse(hlBy);
            const filteredConsequences = feature
                .get('consequence')
                .hits.edges.filter((cons) => cons.node.transcript.is_canonical);
            const impact = filteredConsequences[0].node.transcript.annotation[hlBy.attributeName];
            const attrValue = feature.get(hlBy.attributeName);
            const target = impact ? impact : attrValue;
            let colour = 'black';
            hlBy.values.forEach((element) => {
                if (target === element.name) {
                    colour = `${element.colour}`;
                }
            });
            return colour;
        });
        pluginManager.jexl.addFunction('ieqColouring', (feature, attributeName) => {
            const percentage = feature.get(attributeName);
            const denom = Math.ceil(Math.log10(6060));
            const val = Math.abs((100 * Math.log10(percentage)) / denom - 200);
            return `rgb(184,${val},11)`;
        });
        pluginManager.jexl.addFunction('rgb', (feature, attributeName) => {
            const percentage = feature.get(attributeName);
            return `rgb(0,${percentage},0)`;
        });
        pluginManager.jexl.addFunction('cancer', (feature, attributeName) => {
            return feature.get(attributeName) ? 'red' : 'blue';
        });
    }
}

export { GDCPlugin as default };
//# sourceMappingURL=index.esm.js.map
