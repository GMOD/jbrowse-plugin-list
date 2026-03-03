"use strict";
var JBrowsePluginProtein3d = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // global-externals:@jbrowse/core/Plugin
  var require_Plugin = __commonJS({
    "global-externals:@jbrowse/core/Plugin"(exports, module) {
      module.exports = JBrowseExports["@jbrowse/core/Plugin"];
    }
  });

  // global-externals:react
  var require_react = __commonJS({
    "global-externals:react"(exports, module) {
      module.exports = JBrowseExports["react"];
    }
  });

  // global-externals:mobx-react
  var require_mobx_react = __commonJS({
    "global-externals:mobx-react"(exports, module) {
      module.exports = JBrowseExports["mobx-react"];
    }
  });

  // global-externals:@jbrowse/core/util
  var require_util = __commonJS({
    "global-externals:@jbrowse/core/util"(exports, module) {
      module.exports = JBrowseExports["@jbrowse/core/util"];
    }
  });

  // global-externals:tss-react/mui
  var require_mui = __commonJS({
    "global-externals:tss-react/mui"(exports, module) {
      module.exports = JBrowseExports["tss-react/mui"];
    }
  });

  // src/ProteinView/loadMolstar.ts
  function loadMolstar() {
    if (!cached) {
      cached = import(base + "molstar-chunk.js").catch(function(e) {
        cached = void 0;
        throw e;
      });
    }
    return cached;
  }
  var src, base, cached;
  var init_loadMolstar = __esm({
    "src/ProteinView/loadMolstar.ts"() {
      "use strict";
      src = typeof document !== "undefined" ? document.currentScript?.src : void 0;
      base = src ? src.replace(/\/[^/]*$/, "/") : "";
    }
  });

  // node_modules/g2p_mapper/esm/index.js
  function* getPositions(f, strand) {
    if (strand !== -1) {
      for (let pos = f.start; pos < f.end; pos++) {
        yield pos;
      }
    } else {
      for (let pos = f.end - 1; pos >= f.start; pos--) {
        yield pos;
      }
    }
  }
  function genomeToTranscriptSeqMapping(feature) {
    const strand = feature.strand;
    const refName = feature.refName;
    if (strand !== -1 && strand !== 1) {
      throw new Error(`Invalid strand value: ${strand}. Expected 1 or -1.`);
    }
    if (!refName) {
      throw new Error("refName is required");
    }
    const cdsFeatures = feature.subfeatures?.filter((f) => f.type === "CDS") ?? [];
    const seenKeys = /* @__PURE__ */ new Set();
    const cds = cdsFeatures.filter((f) => {
      if (f.start >= f.end) {
        return false;
      }
      const key = `${f.start}-${f.end}`;
      if (seenKeys.has(key)) {
        return false;
      }
      seenKeys.add(key);
      return true;
    }).sort((a, b) => strand * (a.start - b.start));
    const g2p = {};
    const p2g = {};
    if (cds.length === 0) {
      return { g2p, p2g, refName, strand };
    }
    const firstPhase = cds[0]?.phase ?? 0;
    let proteinCounter = (3 - firstPhase) % 3;
    let lastProteinPos = -1;
    for (const f of cds) {
      for (const genomePos of getPositions(f, strand)) {
        const proteinPos = Math.floor(proteinCounter++ / 3);
        g2p[genomePos] = proteinPos;
        if (proteinPos !== lastProteinPos) {
          p2g[proteinPos] = genomePos;
          lastProteinPos = proteinPos;
        }
      }
    }
    return {
      g2p,
      p2g,
      refName,
      strand
    };
  }
  function getCodonRange(p2g, proteinPos, strand) {
    const genomePos = p2g[proteinPos];
    if (genomePos === void 0) {
      return void 0;
    }
    if (strand === 1) {
      return [genomePos, genomePos + 3];
    } else {
      return [genomePos - 2, genomePos + 1];
    }
  }
  var init_esm = __esm({
    "node_modules/g2p_mapper/esm/index.js"() {
    }
  });

  // global-externals:mobx
  var require_mobx = __commonJS({
    "global-externals:mobx"(exports, module) {
      module.exports = JBrowseExports["mobx"];
    }
  });

  // src/mappings.ts
  function structureSeqVsTranscriptSeqMap(pairwiseAlignment) {
    const structureSeq = pairwiseAlignment.alns[1].seq;
    const transcriptSeq = pairwiseAlignment.alns[0].seq;
    if (structureSeq.length !== transcriptSeq.length) {
      throw new Error("mismatched length");
    }
    let j = 0;
    let k = 0;
    const structureSeqToTranscriptSeqPosition = {};
    const transcriptSeqToStructureSeqPosition = {};
    for (let i = 0; i < structureSeq.length; i++) {
      const c1 = structureSeq[i];
      const c2 = transcriptSeq[i];
      if (c1 === c2) {
        structureSeqToTranscriptSeqPosition[j] = k;
        transcriptSeqToStructureSeqPosition[k] = j;
        k++;
        j++;
      } else if (c2 === "-") {
        j++;
      } else if (c1 === "-") {
        k++;
      } else {
        structureSeqToTranscriptSeqPosition[j] = k;
        transcriptSeqToStructureSeqPosition[k] = j;
        k++;
        j++;
      }
    }
    return {
      structureSeqToTranscriptSeqPosition,
      transcriptSeqToStructureSeqPosition
    };
  }
  function structurePositionToAlignmentMap(pairwiseAlignment) {
    const structureSeq = pairwiseAlignment.alns[1].seq;
    const structurePositionToAlignment = {};
    for (let i = 0, j = 0; i < structureSeq.length; i++) {
      if (structureSeq[i] !== "-") {
        structurePositionToAlignment[j] = i;
        j++;
      }
    }
    return structurePositionToAlignment;
  }
  function transcriptPositionToAlignmentMap(pairwiseAlignment) {
    const transcriptSeq = pairwiseAlignment.alns[0].seq;
    const transcriptPositionToAlignment = {};
    for (let i = 0, j = 0; i < transcriptSeq.length; i++) {
      if (transcriptSeq[i] !== "-") {
        transcriptPositionToAlignment[j] = i;
        j++;
      }
    }
    return transcriptPositionToAlignment;
  }
  function genomeToTranscriptSeqMapping2(feature) {
    return genomeToTranscriptSeqMapping(feature.toJSON());
  }
  var init_mappings = __esm({
    "src/mappings.ts"() {
      "use strict";
      init_esm();
    }
  });

  // src/Protein1DViewRegistry/index.ts
  var import_util5, import_mobx, Protein1DViewRegistry, protein1DViewRegistry;
  var init_Protein1DViewRegistry = __esm({
    "src/Protein1DViewRegistry/index.ts"() {
      "use strict";
      import_util5 = __toESM(require_util());
      init_esm();
      import_mobx = __toESM(require_mobx());
      init_mappings();
      Protein1DViewRegistry = class {
        views = import_mobx.observable.map();
        constructor() {
          (0, import_mobx.makeObservable)(this, {
            register: import_mobx.action,
            unregister: import_mobx.action,
            cleanupStaleViews: import_mobx.action,
            entries: import_mobx.computed
          });
        }
        register(info) {
          this.views.set(info.viewId, info);
        }
        unregister(viewId) {
          this.views.delete(viewId);
        }
        cleanupStaleViews(session) {
          const activeViewIds = new Set(session.views.map((v) => v.id));
          for (const viewId of this.views.keys()) {
            if (!activeViewIds.has(viewId)) {
              this.views.delete(viewId);
            }
          }
        }
        get(viewId) {
          return this.views.get(viewId);
        }
        getByUniprotId(uniprotId, session) {
          if (session) {
            this.cleanupStaleViews(session);
          }
          for (const info of this.views.values()) {
            if (info.uniprotId === uniprotId) {
              return info;
            }
          }
          return void 0;
        }
        get entries() {
          return [...this.views.values()];
        }
        getGenomeHighlightForProteinPosition(uniprotId, proteinPos, session) {
          const info = this.getByUniprotId(uniprotId, session);
          if (!info) {
            return void 0;
          }
          const feature = new import_util5.SimpleFeature(info.feature);
          const mapping = genomeToTranscriptSeqMapping2(feature);
          if (!mapping) {
            return void 0;
          }
          const { p2g, strand, refName } = mapping;
          const result = getCodonRange(p2g, proteinPos, strand);
          if (!result) {
            return void 0;
          }
          const [start, end] = result;
          return { refName, start, end };
        }
      };
      protein1DViewRegistry = new Protein1DViewRegistry();
    }
  });

  // global-externals:@jbrowse/core/pluggableElementTypes/AdapterType
  var require_AdapterType = __commonJS({
    "global-externals:@jbrowse/core/pluggableElementTypes/AdapterType"(exports, module) {
      module.exports = JBrowseExports["@jbrowse/core/pluggableElementTypes/AdapterType"];
    }
  });

  // global-externals:@jbrowse/core/configuration
  var require_configuration = __commonJS({
    "global-externals:@jbrowse/core/configuration"(exports, module) {
      module.exports = JBrowseExports["@jbrowse/core/configuration"];
    }
  });

  // global-externals:@jbrowse/core/data_adapters/BaseAdapter
  var require_BaseAdapter = __commonJS({
    "global-externals:@jbrowse/core/data_adapters/BaseAdapter"(exports, module) {
      module.exports = JBrowseExports["@jbrowse/core/data_adapters/BaseAdapter"];
    }
  });

  // global-externals:@jbrowse/core/util/io
  var require_io = __commonJS({
    "global-externals:@jbrowse/core/util/io"(exports, module) {
      module.exports = JBrowseExports["@jbrowse/core/util/io"];
    }
  });

  // global-externals:@jbrowse/core/util/rxjs
  var require_rxjs = __commonJS({
    "global-externals:@jbrowse/core/util/rxjs"(exports, module) {
      module.exports = JBrowseExports["@jbrowse/core/util/rxjs"];
    }
  });

  // src/AlphaFoldConfidenceAdapter/AlphaFoldConfidenceAdapter.ts
  var AlphaFoldConfidenceAdapter_exports = {};
  __export(AlphaFoldConfidenceAdapter_exports, {
    default: () => AlphaFoldConfidenceAdapter2
  });
  var import_BaseAdapter, import_util11, import_io, import_rxjs, AlphaFoldConfidenceAdapter2;
  var init_AlphaFoldConfidenceAdapter = __esm({
    "src/AlphaFoldConfidenceAdapter/AlphaFoldConfidenceAdapter.ts"() {
      "use strict";
      import_BaseAdapter = __toESM(require_BaseAdapter());
      import_util11 = __toESM(require_util());
      import_io = __toESM(require_io());
      import_rxjs = __toESM(require_rxjs());
      AlphaFoldConfidenceAdapter2 = class extends import_BaseAdapter.BaseFeatureDataAdapter {
        static capabilities = ["getFeatures", "getRefNames"];
        feats;
        async loadDataP() {
          const scores = JSON.parse(
            await (0, import_io.openLocation)(this.getConf("location")).readFile("utf8")
          );
          return scores.residueNumber.map((value, idx) => ({
            uniqueId: `feat-${idx}`,
            start: value,
            end: value + 1,
            score: scores.confidenceScore[idx]
          }));
        }
        async loadData(_opts = {}) {
          this.feats ??= this.loadDataP().catch((e) => {
            this.feats = void 0;
            throw e;
          });
          return this.feats;
        }
        async getRefNames(_opts = {}) {
          return [];
        }
        getFeatures(query, _opts = {}) {
          return (0, import_rxjs.ObservableCreate)(async (observer20) => {
            const { start, end, refName } = query;
            const data = await this.loadData();
            for (const f of data) {
              if ((0, import_util11.doesIntersect2)(f.start, f.end, start, end)) {
                observer20.next(new import_util11.SimpleFeature({ ...f, refName }));
              }
            }
            observer20.complete();
          });
        }
        freeResources() {
        }
      };
    }
  });

  // src/AlphaMissensePathogenicityAdapter/AlphaMissensePathogenicityAdapter.ts
  var AlphaMissensePathogenicityAdapter_exports = {};
  __export(AlphaMissensePathogenicityAdapter_exports, {
    default: () => AlphaMissensePathogenicityAdapter2
  });
  var import_BaseAdapter2, import_util12, import_io2, import_rxjs2, AlphaMissensePathogenicityAdapter2;
  var init_AlphaMissensePathogenicityAdapter = __esm({
    "src/AlphaMissensePathogenicityAdapter/AlphaMissensePathogenicityAdapter.ts"() {
      "use strict";
      import_BaseAdapter2 = __toESM(require_BaseAdapter());
      import_util12 = __toESM(require_util());
      import_io2 = __toESM(require_io());
      import_rxjs2 = __toESM(require_rxjs());
      AlphaMissensePathogenicityAdapter2 = class extends import_BaseAdapter2.BaseFeatureDataAdapter {
        static capabilities = ["getFeatures", "getRefNames"];
        feats;
        async loadDataP() {
          const scores = await (0, import_io2.openLocation)(this.getConf("location")).readFile("utf8");
          return scores.split("\n").slice(1).map((f) => f.trim()).filter((f) => !!f).map((row, idx) => {
            const [protein_variant, score, am_class] = row.split(",");
            const ref = protein_variant[0];
            const variant = protein_variant.at(-1);
            const coord = protein_variant.slice(1, -1);
            return {
              uniqueId: `feat-${idx}`,
              ref,
              variant,
              start: +coord,
              end: +coord + 1,
              score: +score,
              am_class
            };
          });
        }
        async loadData(_opts = {}) {
          this.feats ??= this.loadDataP().catch((e) => {
            this.feats = void 0;
            throw e;
          });
          return this.feats;
        }
        async getGlobalStats(_opts) {
          const data = await this.loadData();
          const scoreMin = (0, import_util12.min)(data.map((s) => s.score));
          const scoreMax = (0, import_util12.max)(data.map((s) => s.score));
          return { scoreMin, scoreMax };
        }
        // always render bigwig instead of calculating a feature density for it
        async getMultiRegionFeatureDensityStats(_regions) {
          return { featureDensity: 0 };
        }
        async getRefNames(_opts = {}) {
          return [];
        }
        getFeatures(query, _opts = {}) {
          return (0, import_rxjs2.ObservableCreate)(async (observer20) => {
            const { start, end, refName } = query;
            const data = await this.loadData();
            for (const f of data) {
              if ((0, import_util12.doesIntersect2)(f.start, f.end, start, end)) {
                observer20.next(
                  new import_util12.SimpleFeature({
                    ...f,
                    refName,
                    source: f.variant
                  })
                );
              }
            }
            observer20.complete();
          });
        }
        async getSources() {
          const sources = /* @__PURE__ */ new Set();
          const data = await this.loadData();
          for (const f of data) {
            sources.add(f.variant);
          }
          return [...sources].map((s) => ({
            name: s,
            __name: s
          }));
        }
        freeResources() {
        }
      };
    }
  });

  // global-externals:@mui/material/utils
  var require_utils = __commonJS({
    "global-externals:@mui/material/utils"(exports, module) {
      module.exports = JBrowseExports["@mui/material/utils"];
    }
  });

  // node_modules/@mui/icons-material/esm/utils/createSvgIcon.js
  var import_utils;
  var init_createSvgIcon = __esm({
    "node_modules/@mui/icons-material/esm/utils/createSvgIcon.js"() {
      "use client";
      import_utils = __toESM(require_utils(), 1);
    }
  });

  // global-externals:react/jsx-runtime
  var require_jsx_runtime = __commonJS({
    "global-externals:react/jsx-runtime"(exports, module) {
      module.exports = JBrowseExports["react/jsx-runtime"];
    }
  });

  // global-externals:@jbrowse/core/ui
  var require_ui = __commonJS({
    "global-externals:@jbrowse/core/ui"(exports, module) {
      module.exports = JBrowseExports["@jbrowse/core/ui"];
    }
  });

  // global-externals:@mui/material
  var require_material = __commonJS({
    "global-externals:@mui/material"(exports, module) {
      module.exports = JBrowseExports["@mui/material"];
    }
  });

  // src/LaunchProteinView/utils/util.ts
  function stripStopCodon(seq) {
    return seq.replaceAll("*", "");
  }
  function getTranscriptFeatures(feature) {
    const subfeatures = feature.get("subfeatures") ?? [];
    const transcripts = subfeatures.filter(
      (f) => f.get("type") === "mRNA" || f.get("type") === "transcript"
    );
    if (transcripts.length > 0) {
      return transcripts;
    }
    return [feature];
  }
  function stripTrailingVersion(s) {
    return s?.replace(/\.[^./]+$/, "");
  }
  function getDisplayName(f) {
    return f.get("name") ?? f.get("id");
  }
  function getId(val) {
    return val === void 0 ? "" : val.id();
  }
  function getTranscriptDisplayName(val) {
    return val === void 0 ? "" : [val.get("name") ?? val.get("id")].filter((f) => !!f).join(" ");
  }
  function getGeneDisplayName(val) {
    return val === void 0 ? "" : [val.get("gene_name") ?? val.get("name") ?? val.get("id")].filter((f) => !!f).join(" ");
  }
  function getUniProtIdFromFeature(f) {
    if (!f) {
      return void 0;
    }
    return f.get("uniprot") ?? f.get("uniprotId") ?? f.get("uniprotid");
  }
  function isRecognizedDatabaseId(id) {
    return ensemblGenePattern.test(id) || ensemblTranscriptPattern.test(id) || ensemblProteinPattern.test(id) || refSeqTranscriptPattern.test(id) || refSeqProteinPattern.test(id) || ccdsPattern.test(id) || hgncPattern.test(id);
  }
  function getDatabaseTypeForId(id) {
    if (ensemblGenePattern.test(id)) {
      return "ensembl";
    }
    if (ensemblTranscriptPattern.test(id)) {
      return "ensembl";
    }
    if (ensemblProteinPattern.test(id)) {
      return "ensembl";
    }
    if (refSeqTranscriptPattern.test(id) || refSeqProteinPattern.test(id)) {
      return "refseq";
    }
    if (ccdsPattern.test(id)) {
      return "ccds";
    }
    if (hgncPattern.test(id)) {
      return "hgnc";
    }
    return void 0;
  }
  function parseDbxref(dbxref) {
    if (!dbxref) {
      return [];
    }
    if (Array.isArray(dbxref)) {
      return dbxref.flatMap(
        (item) => typeof item === "string" ? item.split(",") : []
      );
    }
    if (typeof dbxref === "string") {
      return dbxref.split(",").map((s) => s.trim());
    }
    return [];
  }
  function extractIdsFromDbxref(dbxrefEntries) {
    const ids = [];
    for (const entry of dbxrefEntries) {
      const parts = entry.split(":");
      const lastPart = parts[parts.length - 1];
      if (lastPart && isRecognizedDatabaseId(lastPart)) {
        ids.push(lastPart);
      }
      if (isRecognizedDatabaseId(entry)) {
        ids.push(entry);
      }
      if (entry.startsWith("HGNC:HGNC:")) {
        ids.push(entry.replace("HGNC:HGNC:", "HGNC:"));
      } else if (entry.startsWith("HGNC:") && /^HGNC:\d+$/.test(entry)) {
        ids.push(entry);
      }
    }
    return [...new Set(ids)];
  }
  function extractFeatureIdentifiers(f) {
    if (!f) {
      return { recognizedIds: [] };
    }
    const recognizedIds = [];
    const attributesToCheck = [
      f.get("ID"),
      f.get("id"),
      f.get("name"),
      f.get("Name"),
      f.get("transcript_id"),
      f.get("gene_id"),
      f.get("protein_id"),
      f.get("protAcc"),
      // RefSeq protein accession
      f.get("mrnaAcc")
      // RefSeq mRNA accession
    ];
    for (const attr of attributesToCheck) {
      if (typeof attr === "string") {
        const stripped = attr.replace(/\.[^./]+$/, "");
        if (isRecognizedDatabaseId(stripped)) {
          recognizedIds.push(stripped);
        }
      }
    }
    const hgnc = f.get("hgnc") ?? f.get("HGNC");
    if (typeof hgnc === "string" || typeof hgnc === "number") {
      const hgncStr = String(hgnc);
      if (/^\d+$/.test(hgncStr)) {
        recognizedIds.push(`HGNC:${hgncStr}`);
      } else if (hgncPattern.test(hgncStr)) {
        recognizedIds.push(hgncStr);
      }
    }
    const uniprotIdAttr = f.get("uniprot") ?? f.get("uniprotId") ?? f.get("uniprotid") ?? f.get("UniProt");
    const uniprotId = typeof uniprotIdAttr === "string" && uniprotIdAttr.length > 0 ? uniprotIdAttr : void 0;
    const dbxref = f.get("Dbxref") ?? f.get("dbxref") ?? f.get("db_xref");
    const dbxrefIds = extractIdsFromDbxref(parseDbxref(dbxref));
    for (const id of dbxrefIds) {
      recognizedIds.push(id);
    }
    const geneId = f.get("gene_id") ?? f.get("ID");
    const geneName = f.get("gene_name") ?? f.get("gene") ?? f.get("name") ?? f.get("Name");
    return {
      recognizedIds: [...new Set(recognizedIds)],
      uniprotId,
      geneId: typeof geneId === "string" ? geneId : void 0,
      geneName: typeof geneName === "string" ? geneName : void 0
    };
  }
  function selectBestTranscript({
    options,
    isoformSequences,
    structureSequence
  }) {
    const exactMatch = options.find(
      (f) => structureSequence && stripStopCodon(isoformSequences[f.id()]?.seq ?? "") === structureSequence
    );
    const longestWithData = options.filter((f) => !!isoformSequences[f.id()]).sort(
      (a, b) => isoformSequences[b.id()].seq.length - isoformSequences[a.id()].seq.length
    )[0];
    return exactMatch ?? longestWithData;
  }
  var ensemblGenePattern, ensemblTranscriptPattern, ensemblProteinPattern, refSeqTranscriptPattern, refSeqProteinPattern, ccdsPattern, hgncPattern;
  var init_util = __esm({
    "src/LaunchProteinView/utils/util.ts"() {
      "use strict";
      ensemblGenePattern = /^ENS[A-Z]*G\d+/i;
      ensemblTranscriptPattern = /^ENS[A-Z]*T\d+/i;
      ensemblProteinPattern = /^ENS[A-Z]*P\d+/i;
      refSeqTranscriptPattern = /^[NX][MR]_\d+/i;
      refSeqProteinPattern = /^[NX]P_\d+/i;
      ccdsPattern = /^CCDS\d+/i;
      hgncPattern = /^HGNC:\d+/i;
    }
  });

  // node_modules/clustal-js/esm/util.js
  function getFirstNonEmptyLine(arr) {
    let line = arr.next();
    while (!line.done && line.value.trim() === "") {
      line = arr.next();
    }
    return line.value;
  }
  var init_util2 = __esm({
    "node_modules/clustal-js/esm/util.js"() {
    }
  });

  // node_modules/clustal-js/esm/pairwise.js
  function isRulerLine(line) {
    const trimmed = line.trim();
    if (!trimmed) {
      return false;
    }
    const fields = trimmed.split(/\s+/);
    return fields.every((f) => /^\d+$/.test(f));
  }
  function isSequenceLine(line) {
    const trimmed = line.trim();
    return /^\w+\s+/.test(trimmed) && !isRulerLine(line);
  }
  function hasPositionNumbers(fields) {
    return fields.length >= 3 && /^\d+$/.test(fields[1]);
  }
  function getSeqBounds(line, seqIndex) {
    const trimmed = line.trim();
    const fields = trimmed.split(/\s+/);
    const seq = fields[seqIndex];
    const seqStart = line.indexOf(seq, line.indexOf(fields[0]) + fields[0].length);
    return [seqStart, seqStart + seq.length];
  }
  function parsePairwiseBlock(arr) {
    let line = getFirstNonEmptyLine(arr);
    const block = [];
    let consensusLine = "";
    if (!line) {
      return void 0;
    }
    while (line) {
      if (isRulerLine(line)) {
      } else if (isSequenceLine(line)) {
        block.push(line);
      } else {
        consensusLine = line;
      }
      line = arr.next().value;
    }
    if (block.length === 0) {
      return void 0;
    }
    const fields = block.map((s) => s.trim().split(/\s+/));
    const firstField = fields[0];
    if (!firstField) {
      return void 0;
    }
    const seqIndex = hasPositionNumbers(firstField) ? 2 : 1;
    const [start, end] = getSeqBounds(block[0], seqIndex);
    const ids = fields.map((s) => s[0]);
    const seqs = fields.map((s) => s[seqIndex]);
    let consensus = consensusLine.slice(start, end);
    const firstSeq = seqs[0];
    if (firstSeq) {
      const remainder = firstSeq.length - consensus.length;
      if (remainder > 0) {
        consensus += " ".repeat(remainder);
      }
    }
    return {
      ids,
      seqs,
      consensus
    };
  }
  function parsePairwiseBlocks(arr) {
    let block;
    const res = parsePairwiseBlock(arr);
    if (res !== void 0) {
      while (block = parsePairwiseBlock(arr)) {
        for (let i = 0; i < block.seqs.length; i++) {
          res.seqs[i] += block.seqs[i];
        }
        res.consensus += block.consensus;
      }
    }
    return res;
  }
  var init_pairwise = __esm({
    "node_modules/clustal-js/esm/pairwise.js"() {
      init_util2();
    }
  });

  // node_modules/clustal-js/esm/index.js
  function parsePairwise(contents) {
    const filtered = contents.split("\n").filter((f) => !f.startsWith("#")).join("\n");
    const res = parsePairwiseBlocks(filtered.split("\n")[Symbol.iterator]());
    if (res === void 0) {
      throw new Error("No blocks parsed");
    }
    const alns = res.seqs.map((n, index) => ({ id: res.ids[index], seq: n }));
    const { consensus } = res;
    const firstAln = alns[0];
    if (!firstAln) {
      throw new Error("No alignments found");
    }
    if (consensus.length !== firstAln.seq.length) {
      throw new Error(`Consensus length !== sequence length. Con ${consensus.length} seq ${firstAln.seq.length}`);
    }
    if (alns.length !== 2) {
      throw new Error(`Expected exactly 2 sequences in pairwise alignment, got ${alns.length}`);
    }
    return {
      consensus,
      alns
    };
  }
  var init_esm2 = __esm({
    "node_modules/clustal-js/esm/index.js"() {
      init_pairwise();
      init_util2();
    }
  });

  // src/LaunchProteinView/components/proteinAssemblySetup.ts
  function setupProteinAssembly(session, uniprotId) {
    session.addTemporaryAssembly?.({
      name: uniprotId,
      sequence: {
        type: "ReferenceSequenceTrack",
        trackId: `${uniprotId}-ReferenceSequenceTrack`,
        sequenceType: "pep",
        adapter: {
          type: "UnindexedFastaAdapter",
          rewriteRefNames: "jexl:split(refName,'|')[1]",
          fastaLocation: {
            uri: `https://rest.uniprot.org/uniprotkb/${uniprotId}.fasta`
          }
        }
      }
    });
  }
  var init_proteinAssemblySetup = __esm({
    "src/LaunchProteinView/components/proteinAssemblySetup.ts"() {
      "use strict";
    }
  });

  // src/LaunchProteinView/components/proteinTrackSetup.ts
  async function fetchUniProtFeatureTypes(uniprotId) {
    const url = `https://rest.uniprot.org/uniprotkb/${uniprotId}.gff`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${url}`);
    }
    const data = await res.text();
    return [
      ...new Set(
        data.split("\n").filter((f) => !f.startsWith("#")).map((f) => f.trim()).filter((f) => !!f).map((f) => f.split("	")[2])
      )
    ];
  }
  function addUniProtFeatureTracks({
    session,
    uniprotId,
    featureTypes
  }) {
    featureTypes.forEach((type) => {
      const trackId = `${uniprotId}-${type}`;
      session.addTrackConf({
        type: "FeatureTrack",
        trackId,
        name: type,
        adapter: {
          type: "Gff3Adapter",
          gffLocation: {
            uri: `https://rest.uniprot.org/uniprotkb/${uniprotId}.gff`
          }
        },
        assemblyNames: [uniprotId],
        displays: [
          {
            displayId: `${trackId}-LinearBasicDisplay`,
            type: "LinearBasicDisplay",
            jexlFilters: [`get(feature,'type')=='${type}'`]
          }
        ]
      });
    });
  }
  function addAntigenTrack({
    session,
    uniprotId
  }) {
    session.addTrackConf({
      type: "FeatureTrack",
      trackId: `${uniprotId}-Antigen`,
      name: "Antigen",
      adapter: {
        type: "Gff3Adapter",
        gffLocation: {
          uri: `https://www.ebi.ac.uk/proteins/api/antigen/${uniprotId}?format=gff`
        }
      },
      assemblyNames: [uniprotId]
    });
  }
  function addVariationTrack({
    session,
    uniprotId
  }) {
    session.addTrackConf({
      type: "FeatureTrack",
      trackId: `${uniprotId}-Variation`,
      name: "Variation",
      adapter: {
        type: "UniProtVariationAdapter",
        location: {
          uri: `https://www.ebi.ac.uk/proteins/api/variation/${uniprotId}.json`
        }
      },
      assemblyNames: [uniprotId]
    });
  }
  function addAlphaFoldConfidenceTrack({
    session,
    uniprotId,
    confidenceUrl
  }) {
    if (confidenceUrl) {
      session.addTrackConf({
        type: "QuantitativeTrack",
        trackId: `${uniprotId}-AlphaFold-confidence`,
        name: "AlphaFold confidence",
        adapter: {
          type: "AlphaFoldConfidenceAdapter",
          location: {
            uri: confidenceUrl
          }
        },
        assemblyNames: [uniprotId]
      });
    }
  }
  function addAlphaMissenseTrack({
    session,
    uniprotId
  }) {
    session.addTrackConf({
      type: "MultiQuantitativeTrack",
      trackId: `${uniprotId}-AlphaMissense-scores`,
      name: "AlphaMissense scores",
      assemblyNames: [uniprotId],
      adapter: {
        type: "AlphaMissensePathogenicityAdapter",
        location: {
          uri: `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-aa-substitutions.csv`
        }
      },
      displays: [
        {
          type: "MultiLinearWiggleDisplay",
          displayId: `${uniprotId}-AlphaMissense-scores-MultiLinearWiggleDisplay`,
          defaultRendering: "multirowdensity",
          renderers: {
            MultiDensityRenderer: {
              type: "MultiDensityRenderer",
              bicolorPivotValue: 0.5,
              posColor: "red",
              negColor: "blue"
            }
          }
        }
      ]
    });
  }
  async function addAllProteinTracks({
    session,
    uniprotId,
    confidenceUrl
  }) {
    const featureTypes = await fetchUniProtFeatureTypes(uniprotId);
    addUniProtFeatureTracks({
      session,
      uniprotId,
      featureTypes
    });
    addAntigenTrack({
      session,
      uniprotId
    });
    addVariationTrack({
      session,
      uniprotId
    });
    addAlphaFoldConfidenceTrack({
      session,
      uniprotId,
      confidenceUrl
    });
    addAlphaMissenseTrack({
      session,
      uniprotId
    });
  }
  var init_proteinTrackSetup = __esm({
    "src/LaunchProteinView/components/proteinTrackSetup.ts"() {
      "use strict";
    }
  });

  // src/LaunchProteinView/components/launchProteinAnnotationView.ts
  async function launchProteinAnnotationView({
    session,
    feature,
    selectedTranscript,
    uniprotId,
    confidenceUrl,
    connectedViewId
  }) {
    setupProteinAssembly(session, uniprotId);
    await addAllProteinTracks({
      session,
      uniprotId,
      confidenceUrl
    });
    const view = session.addView("LinearGenomeView", {
      type: "LinearGenomeView",
      displayName: [
        "Protein view",
        uniprotId,
        getGeneDisplayName(feature),
        getTranscriptDisplayName(selectedTranscript)
      ].join(" - ")
    });
    if (connectedViewId && selectedTranscript) {
      protein1DViewRegistry.register({
        viewId: view.id,
        connectedViewId,
        feature: selectedTranscript.toJSON(),
        uniprotId
      });
    }
    await view.navToLocString(uniprotId, uniprotId);
  }
  var init_launchProteinAnnotationView = __esm({
    "src/LaunchProteinView/components/launchProteinAnnotationView.ts"() {
      "use strict";
      init_proteinAssemblySetup();
      init_proteinTrackSetup();
      init_Protein1DViewRegistry();
      init_util();
    }
  });

  // src/LaunchProteinView/utils/launchViewUtils.ts
  function getAlphaFoldStructureUrl(uniprotId, version2 = ALPHAFOLD_VERSION) {
    return `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_${version2}.cif`;
  }
  function getAlphaFoldMsaUrl(uniprotId, version2 = ALPHAFOLD_VERSION) {
    return `https://alphafold.ebi.ac.uk/files/msa/AF-${uniprotId}-F1-msa_${version2}.a3m`;
  }
  function getPdbStructureUrl(pdbId) {
    return `https://files.rcsb.org/download/${pdbId}.cif`;
  }
  function getUniprotIdFromAlphaFoldTarget(target) {
    const targetId = target.split(" ")[0] ?? target;
    const match = /AF-([A-Z0-9]+)-F\d+/.exec(targetId);
    return match?.[1];
  }
  function getStructureUrlFromTarget(target, db) {
    const targetId = target.split(" ")[0] ?? target;
    if (targetId.startsWith("AF-")) {
      return `https://alphafold.ebi.ac.uk/files/${targetId}.cif`;
    }
    if (db === "pdb100") {
      const pdbId = targetId.split("_")[0];
      if (pdbId?.length === 4) {
        return getPdbStructureUrl(pdbId);
      }
    }
    return void 0;
  }
  function getConfidenceUrlFromTarget(target) {
    const targetId = target.split(" ")[0] ?? target;
    if (targetId.startsWith("AF-")) {
      const confidenceId = targetId.replace("-model_", "-confidence_");
      return `https://alphafold.ebi.ac.uk/files/${confidenceId}.json`;
    }
    return void 0;
  }
  function launch3DProteinView({
    session,
    view,
    feature,
    selectedTranscript,
    uniprotId,
    url,
    data,
    userProvidedTranscriptSequence,
    alignmentAlgorithm,
    displayName
  }) {
    return session.addView("ProteinView", {
      type: "ProteinView",
      isFloating: true,
      alignmentAlgorithm,
      structures: [
        {
          url,
          data,
          userProvidedTranscriptSequence,
          feature: selectedTranscript?.toJSON(),
          connectedViewId: view.id
        }
      ],
      displayName: displayName ?? [
        .../* @__PURE__ */ new Set([
          "Protein view",
          uniprotId,
          getGeneDisplayName(feature),
          getTranscriptDisplayName(selectedTranscript)
        ])
      ].join(" - ")
    });
  }
  async function launch1DProteinView({
    session,
    view,
    feature,
    selectedTranscript,
    uniprotId,
    confidenceUrl
  }) {
    if (!uniprotId || !(0, import_util20.isSessionWithAddTracks)(session)) {
      return;
    }
    await launchProteinAnnotationView({
      session,
      selectedTranscript,
      feature,
      uniprotId,
      confidenceUrl,
      connectedViewId: view.id
    });
  }
  function launchMsaView({
    session,
    view,
    feature,
    selectedTranscript,
    uniprotId
  }) {
    if (!uniprotId) {
      return void 0;
    }
    const msaUrl = getAlphaFoldMsaUrl(uniprotId);
    return session.addView("MsaView", {
      type: "MsaView",
      displayName: [
        .../* @__PURE__ */ new Set([
          "MSA view",
          uniprotId,
          getGeneDisplayName(feature),
          getTranscriptDisplayName(selectedTranscript)
        ])
      ].join(" - "),
      connectedViewId: view.id,
      connectedFeature: selectedTranscript?.toJSON(),
      init: {
        msaUrl,
        colorSchemeName: "percent_identity"
      }
    });
  }
  function hasMsaViewPlugin() {
    return typeof window.JBrowsePluginMsaView !== "undefined";
  }
  function launch3DProteinViewWithMsa({
    session,
    view,
    feature,
    selectedTranscript,
    uniprotId,
    url,
    data,
    userProvidedTranscriptSequence,
    alignmentAlgorithm,
    displayName
  }) {
    if (!uniprotId) {
      return void 0;
    }
    const msaUrl = getAlphaFoldMsaUrl(uniprotId);
    const baseName = [
      .../* @__PURE__ */ new Set([
        uniprotId,
        getGeneDisplayName(feature),
        getTranscriptDisplayName(selectedTranscript)
      ])
    ].join(" - ");
    const msaView = session.addView("MsaView", {
      type: "MsaView",
      displayName: `MSA view - ${baseName}`,
      connectedViewId: view.id,
      connectedFeature: selectedTranscript?.toJSON(),
      init: {
        msaUrl,
        colorSchemeName: "percent_identity"
      }
    });
    return session.addView("ProteinView", {
      type: "ProteinView",
      isFloating: true,
      alignmentAlgorithm,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      connectedMsaViewId: msaView?.id,
      structures: [
        {
          url,
          data,
          userProvidedTranscriptSequence,
          feature: selectedTranscript?.toJSON(),
          connectedViewId: view.id
        }
      ],
      displayName: displayName ?? `Protein view - ${baseName}`
    });
  }
  var import_util20, ALPHAFOLD_VERSION;
  var init_launchViewUtils = __esm({
    "src/LaunchProteinView/utils/launchViewUtils.ts"() {
      "use strict";
      import_util20 = __toESM(require_util());
      init_util();
      init_launchProteinAnnotationView();
      ALPHAFOLD_VERSION = "v6";
    }
  });

  // node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
  var require_use_sync_external_store_shim_development = __commonJS({
    "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports) {
      "use strict";
      (function() {
        function is(x, y) {
          return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
        }
        function useSyncExternalStore$2(subscribe, getSnapshot) {
          didWarnOld18Alpha || void 0 === React44.startTransition || (didWarnOld18Alpha = true, console.error(
            "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
          ));
          var value = getSnapshot();
          if (!didWarnUncachedGetSnapshot) {
            var cachedValue = getSnapshot();
            objectIs(value, cachedValue) || (console.error(
              "The result of getSnapshot should be cached to avoid an infinite loop"
            ), didWarnUncachedGetSnapshot = true);
          }
          cachedValue = useState20({
            inst: { value, getSnapshot }
          });
          var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
          useLayoutEffect2(
            function() {
              inst.value = value;
              inst.getSnapshot = getSnapshot;
              checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            },
            [subscribe, value, getSnapshot]
          );
          useEffect12(
            function() {
              checkIfSnapshotChanged(inst) && forceUpdate({ inst });
              return subscribe(function() {
                checkIfSnapshotChanged(inst) && forceUpdate({ inst });
              });
            },
            [subscribe]
          );
          useDebugValue2(value);
          return value;
        }
        function checkIfSnapshotChanged(inst) {
          var latestGetSnapshot = inst.getSnapshot;
          inst = inst.value;
          try {
            var nextValue = latestGetSnapshot();
            return !objectIs(inst, nextValue);
          } catch (error) {
            return true;
          }
        }
        function useSyncExternalStore$1(subscribe, getSnapshot) {
          return getSnapshot();
        }
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
        var React44 = require_react(), objectIs = "function" === typeof Object.is ? Object.is : is, useState20 = React44.useState, useEffect12 = React44.useEffect, useLayoutEffect2 = React44.useLayoutEffect, useDebugValue2 = React44.useDebugValue, didWarnOld18Alpha = false, didWarnUncachedGetSnapshot = false, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
        exports.useSyncExternalStore = void 0 !== React44.useSyncExternalStore ? React44.useSyncExternalStore : shim;
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
      })();
    }
  });

  // node_modules/use-sync-external-store/shim/index.js
  var require_shim = __commonJS({
    "node_modules/use-sync-external-store/shim/index.js"(exports, module) {
      "use strict";
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_use_sync_external_store_shim_development();
      }
    }
  });

  // node_modules/swr/dist/_internal/events.mjs
  var events_exports = {};
  __export(events_exports, {
    ERROR_REVALIDATE_EVENT: () => ERROR_REVALIDATE_EVENT,
    FOCUS_EVENT: () => FOCUS_EVENT,
    MUTATE_EVENT: () => MUTATE_EVENT,
    RECONNECT_EVENT: () => RECONNECT_EVENT
  });
  var FOCUS_EVENT, RECONNECT_EVENT, MUTATE_EVENT, ERROR_REVALIDATE_EVENT;
  var init_events = __esm({
    "node_modules/swr/dist/_internal/events.mjs"() {
      FOCUS_EVENT = 0;
      RECONNECT_EVENT = 1;
      MUTATE_EVENT = 2;
      ERROR_REVALIDATE_EVENT = 3;
    }
  });

  // node_modules/dequal/lite/index.mjs
  function dequal(foo, bar) {
    var ctor, len;
    if (foo === bar) return true;
    if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
      if (ctor === Date) return foo.getTime() === bar.getTime();
      if (ctor === RegExp) return foo.toString() === bar.toString();
      if (ctor === Array) {
        if ((len = foo.length) === bar.length) {
          while (len-- && dequal(foo[len], bar[len])) ;
        }
        return len === -1;
      }
      if (!ctor || typeof foo === "object") {
        len = 0;
        for (ctor in foo) {
          if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
          if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
        }
        return Object.keys(bar).length === len;
      }
    }
    return foo !== foo && bar !== bar;
  }
  var has;
  var init_lite = __esm({
    "node_modules/dequal/lite/index.mjs"() {
      has = Object.prototype.hasOwnProperty;
    }
  });

  // node_modules/swr/dist/_internal/config-context-12s-CCVTDPOP.mjs
  async function internalMutate(...args) {
    const [cache2, _key, _data, _opts] = args;
    const options = mergeObjects({
      populateCache: true,
      throwOnError: true
    }, typeof _opts === "boolean" ? {
      revalidate: _opts
    } : _opts || {});
    let populateCache = options.populateCache;
    const rollbackOnErrorOption = options.rollbackOnError;
    let optimisticData = options.optimisticData;
    const rollbackOnError = (error) => {
      return typeof rollbackOnErrorOption === "function" ? rollbackOnErrorOption(error) : rollbackOnErrorOption !== false;
    };
    const throwOnError = options.throwOnError;
    if (isFunction(_key)) {
      const keyFilter = _key;
      const matchedKeys = [];
      const it = cache2.keys();
      for (const key of it) {
        if (
          // Skip the special useSWRInfinite and useSWRSubscription keys.
          !/^\$(inf|sub)\$/.test(key) && keyFilter(cache2.get(key)._k)
        ) {
          matchedKeys.push(key);
        }
      }
      return Promise.all(matchedKeys.map(mutateByKey));
    }
    return mutateByKey(_key);
    async function mutateByKey(_k) {
      const [key] = serialize(_k);
      if (!key) return;
      const [get, set] = createCacheHelper(cache2, key);
      const [EVENT_REVALIDATORS, MUTATION, FETCH, PRELOAD] = SWRGlobalState.get(cache2);
      const startRevalidate = () => {
        const revalidators = EVENT_REVALIDATORS[key];
        const revalidate = isFunction(options.revalidate) ? options.revalidate(get().data, _k) : options.revalidate !== false;
        if (revalidate) {
          delete FETCH[key];
          delete PRELOAD[key];
          if (revalidators && revalidators[0]) {
            return revalidators[0](MUTATE_EVENT).then(() => get().data);
          }
        }
        return get().data;
      };
      if (args.length < 3) {
        return startRevalidate();
      }
      let data = _data;
      let error;
      let isError = false;
      const beforeMutationTs = getTimestamp();
      MUTATION[key] = [
        beforeMutationTs,
        0
      ];
      const hasOptimisticData = !isUndefined(optimisticData);
      const state = get();
      const displayedData = state.data;
      const currentData = state._c;
      const committedData = isUndefined(currentData) ? displayedData : currentData;
      if (hasOptimisticData) {
        optimisticData = isFunction(optimisticData) ? optimisticData(committedData, displayedData) : optimisticData;
        set({
          data: optimisticData,
          _c: committedData
        });
      }
      if (isFunction(data)) {
        try {
          data = data(committedData);
        } catch (err) {
          error = err;
          isError = true;
        }
      }
      if (data && isPromiseLike(data)) {
        data = await data.catch((err) => {
          error = err;
          isError = true;
        });
        if (beforeMutationTs !== MUTATION[key][0]) {
          if (isError) throw error;
          return data;
        } else if (isError && hasOptimisticData && rollbackOnError(error)) {
          populateCache = true;
          set({
            data: committedData,
            _c: UNDEFINED
          });
        }
      }
      if (populateCache) {
        if (!isError) {
          if (isFunction(populateCache)) {
            const populateCachedData = populateCache(data, committedData);
            set({
              data: populateCachedData,
              error: UNDEFINED,
              _c: UNDEFINED
            });
          } else {
            set({
              data,
              error: UNDEFINED,
              _c: UNDEFINED
            });
          }
        }
      }
      MUTATION[key][1] = getTimestamp();
      Promise.resolve(startRevalidate()).then(() => {
        set({
          _c: UNDEFINED
        });
      });
      if (isError) {
        if (throwOnError) throw error;
        return;
      }
      return data;
    }
  }
  var import_react22, SWRGlobalState, noop, UNDEFINED, OBJECT, isUndefined, isFunction, mergeObjects, isPromiseLike, EMPTY_CACHE, INITIAL_CACHE, STR_UNDEFINED, isWindowDefined, isDocumentDefined, isLegacyDeno, hasRequestAnimationFrame, createCacheHelper, online, isOnline, onWindowEvent, offWindowEvent, isVisible, initFocus, initReconnect, preset, defaultConfigOptions, IS_REACT_LEGACY, IS_SERVER, rAF, useIsomorphicLayoutEffect, navigatorConnection, slowConnection, table, getTypeName, isObjectTypeName, counter, stableHash, serialize, __timestamp, getTimestamp, revalidateAllKeys, initCache, onErrorRetry, compare, cache, mutate, defaultConfig, mergeConfigs, SWRConfigContext, SWRConfig;
  var init_config_context_12s_CCVTDPOP = __esm({
    "node_modules/swr/dist/_internal/config-context-12s-CCVTDPOP.mjs"() {
      "use client";
      import_react22 = __toESM(require_react(), 1);
      init_events();
      init_lite();
      SWRGlobalState = /* @__PURE__ */ new WeakMap();
      noop = () => {
      };
      UNDEFINED = /*#__NOINLINE__*/
      noop();
      OBJECT = Object;
      isUndefined = (v) => v === UNDEFINED;
      isFunction = (v) => typeof v == "function";
      mergeObjects = (a, b) => ({
        ...a,
        ...b
      });
      isPromiseLike = (x) => isFunction(x.then);
      EMPTY_CACHE = {};
      INITIAL_CACHE = {};
      STR_UNDEFINED = "undefined";
      isWindowDefined = typeof window != STR_UNDEFINED;
      isDocumentDefined = typeof document != STR_UNDEFINED;
      isLegacyDeno = isWindowDefined && "Deno" in window;
      hasRequestAnimationFrame = () => isWindowDefined && typeof window["requestAnimationFrame"] != STR_UNDEFINED;
      createCacheHelper = (cache2, key) => {
        const state = SWRGlobalState.get(cache2);
        return [
          // Getter
          () => !isUndefined(key) && cache2.get(key) || EMPTY_CACHE,
          // Setter
          (info) => {
            if (!isUndefined(key)) {
              const prev = cache2.get(key);
              if (!(key in INITIAL_CACHE)) {
                INITIAL_CACHE[key] = prev;
              }
              state[5](key, mergeObjects(prev, info), prev || EMPTY_CACHE);
            }
          },
          // Subscriber
          state[6],
          // Get server cache snapshot
          () => {
            if (!isUndefined(key)) {
              if (key in INITIAL_CACHE) return INITIAL_CACHE[key];
            }
            return !isUndefined(key) && cache2.get(key) || EMPTY_CACHE;
          }
        ];
      };
      online = true;
      isOnline = () => online;
      [onWindowEvent, offWindowEvent] = isWindowDefined && window.addEventListener ? [
        window.addEventListener.bind(window),
        window.removeEventListener.bind(window)
      ] : [
        noop,
        noop
      ];
      isVisible = () => {
        const visibilityState = isDocumentDefined && document.visibilityState;
        return isUndefined(visibilityState) || visibilityState !== "hidden";
      };
      initFocus = (callback) => {
        if (isDocumentDefined) {
          document.addEventListener("visibilitychange", callback);
        }
        onWindowEvent("focus", callback);
        return () => {
          if (isDocumentDefined) {
            document.removeEventListener("visibilitychange", callback);
          }
          offWindowEvent("focus", callback);
        };
      };
      initReconnect = (callback) => {
        const onOnline = () => {
          online = true;
          callback();
        };
        const onOffline = () => {
          online = false;
        };
        onWindowEvent("online", onOnline);
        onWindowEvent("offline", onOffline);
        return () => {
          offWindowEvent("online", onOnline);
          offWindowEvent("offline", onOffline);
        };
      };
      preset = {
        isOnline,
        isVisible
      };
      defaultConfigOptions = {
        initFocus,
        initReconnect
      };
      IS_REACT_LEGACY = !import_react22.default.useId;
      IS_SERVER = !isWindowDefined || isLegacyDeno;
      rAF = (f) => hasRequestAnimationFrame() ? window["requestAnimationFrame"](f) : setTimeout(f, 1);
      useIsomorphicLayoutEffect = IS_SERVER ? import_react22.useEffect : import_react22.useLayoutEffect;
      navigatorConnection = typeof navigator !== "undefined" && navigator.connection;
      slowConnection = !IS_SERVER && navigatorConnection && ([
        "slow-2g",
        "2g"
      ].includes(navigatorConnection.effectiveType) || navigatorConnection.saveData);
      table = /* @__PURE__ */ new WeakMap();
      getTypeName = (value) => OBJECT.prototype.toString.call(value);
      isObjectTypeName = (typeName, type) => typeName === `[object ${type}]`;
      counter = 0;
      stableHash = (arg) => {
        const type = typeof arg;
        const typeName = getTypeName(arg);
        const isDate = isObjectTypeName(typeName, "Date");
        const isRegex = isObjectTypeName(typeName, "RegExp");
        const isPlainObject = isObjectTypeName(typeName, "Object");
        let result;
        let index;
        if (OBJECT(arg) === arg && !isDate && !isRegex) {
          result = table.get(arg);
          if (result) return result;
          result = ++counter + "~";
          table.set(arg, result);
          if (Array.isArray(arg)) {
            result = "@";
            for (index = 0; index < arg.length; index++) {
              result += stableHash(arg[index]) + ",";
            }
            table.set(arg, result);
          }
          if (isPlainObject) {
            result = "#";
            const keys = OBJECT.keys(arg).sort();
            while (!isUndefined(index = keys.pop())) {
              if (!isUndefined(arg[index])) {
                result += index + ":" + stableHash(arg[index]) + ",";
              }
            }
            table.set(arg, result);
          }
        } else {
          result = isDate ? arg.toJSON() : type == "symbol" ? arg.toString() : type == "string" ? JSON.stringify(arg) : "" + arg;
        }
        return result;
      };
      serialize = (key) => {
        if (isFunction(key)) {
          try {
            key = key();
          } catch (err) {
            key = "";
          }
        }
        const args = key;
        key = typeof key == "string" ? key : (Array.isArray(key) ? key.length : key) ? stableHash(key) : "";
        return [
          key,
          args
        ];
      };
      __timestamp = 0;
      getTimestamp = () => ++__timestamp;
      revalidateAllKeys = (revalidators, type) => {
        for (const key in revalidators) {
          if (revalidators[key][0]) revalidators[key][0](type);
        }
      };
      initCache = (provider, options) => {
        if (!SWRGlobalState.has(provider)) {
          const opts = mergeObjects(defaultConfigOptions, options);
          const EVENT_REVALIDATORS = /* @__PURE__ */ Object.create(null);
          const mutate2 = internalMutate.bind(UNDEFINED, provider);
          let unmount = noop;
          const subscriptions = /* @__PURE__ */ Object.create(null);
          const subscribe = (key, callback) => {
            const subs = subscriptions[key] || [];
            subscriptions[key] = subs;
            subs.push(callback);
            return () => subs.splice(subs.indexOf(callback), 1);
          };
          const setter = (key, value, prev) => {
            provider.set(key, value);
            const subs = subscriptions[key];
            if (subs) {
              for (const fn of subs) {
                fn(value, prev);
              }
            }
          };
          const initProvider = () => {
            if (!SWRGlobalState.has(provider)) {
              SWRGlobalState.set(provider, [
                EVENT_REVALIDATORS,
                /* @__PURE__ */ Object.create(null),
                /* @__PURE__ */ Object.create(null),
                /* @__PURE__ */ Object.create(null),
                mutate2,
                setter,
                subscribe
              ]);
              if (!IS_SERVER) {
                const releaseFocus = opts.initFocus(setTimeout.bind(UNDEFINED, revalidateAllKeys.bind(UNDEFINED, EVENT_REVALIDATORS, FOCUS_EVENT)));
                const releaseReconnect = opts.initReconnect(setTimeout.bind(UNDEFINED, revalidateAllKeys.bind(UNDEFINED, EVENT_REVALIDATORS, RECONNECT_EVENT)));
                unmount = () => {
                  releaseFocus && releaseFocus();
                  releaseReconnect && releaseReconnect();
                  SWRGlobalState.delete(provider);
                };
              }
            }
          };
          initProvider();
          return [
            provider,
            mutate2,
            initProvider,
            unmount
          ];
        }
        return [
          provider,
          SWRGlobalState.get(provider)[4]
        ];
      };
      onErrorRetry = (_, __, config, revalidate, opts) => {
        const maxRetryCount = config.errorRetryCount;
        const currentRetryCount = opts.retryCount;
        const timeout2 = ~~((Math.random() + 0.5) * (1 << (currentRetryCount < 8 ? currentRetryCount : 8))) * config.errorRetryInterval;
        if (!isUndefined(maxRetryCount) && currentRetryCount > maxRetryCount) {
          return;
        }
        setTimeout(revalidate, timeout2, opts);
      };
      compare = dequal;
      [cache, mutate] = initCache(/* @__PURE__ */ new Map());
      defaultConfig = mergeObjects(
        {
          // events
          onLoadingSlow: noop,
          onSuccess: noop,
          onError: noop,
          onErrorRetry,
          onDiscarded: noop,
          // switches
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          revalidateIfStale: true,
          shouldRetryOnError: true,
          // timeouts
          errorRetryInterval: slowConnection ? 1e4 : 5e3,
          focusThrottleInterval: 5 * 1e3,
          dedupingInterval: 2 * 1e3,
          loadingTimeout: slowConnection ? 5e3 : 3e3,
          // providers
          compare,
          isPaused: () => false,
          cache,
          mutate,
          fallback: {}
        },
        // use web preset by default
        preset
      );
      mergeConfigs = (a, b) => {
        const v = mergeObjects(a, b);
        if (b) {
          const { use: u1, fallback: f1 } = a;
          const { use: u2, fallback: f2 } = b;
          if (u1 && u2) {
            v.use = u1.concat(u2);
          }
          if (f1 && f2) {
            v.fallback = mergeObjects(f1, f2);
          }
        }
        return v;
      };
      SWRConfigContext = (0, import_react22.createContext)({});
      SWRConfig = (props) => {
        const { value } = props;
        const parentConfig = (0, import_react22.useContext)(SWRConfigContext);
        const isFunctionalConfig = isFunction(value);
        const config = (0, import_react22.useMemo)(() => isFunctionalConfig ? value(parentConfig) : value, [
          isFunctionalConfig,
          parentConfig,
          value
        ]);
        const extendedConfig = (0, import_react22.useMemo)(() => isFunctionalConfig ? config : mergeConfigs(parentConfig, config), [
          isFunctionalConfig,
          parentConfig,
          config
        ]);
        const provider = config && config.provider;
        const cacheContextRef = (0, import_react22.useRef)(UNDEFINED);
        if (provider && !cacheContextRef.current) {
          cacheContextRef.current = initCache(provider(extendedConfig.cache || cache), config);
        }
        const cacheContext = cacheContextRef.current;
        if (cacheContext) {
          extendedConfig.cache = cacheContext[0];
          extendedConfig.mutate = cacheContext[1];
        }
        useIsomorphicLayoutEffect(() => {
          if (cacheContext) {
            cacheContext[2] && cacheContext[2]();
            return cacheContext[3];
          }
        }, []);
        return (0, import_react22.createElement)(SWRConfigContext.Provider, mergeObjects(props, {
          value: extendedConfig
        }));
      };
    }
  });

  // node_modules/swr/dist/_internal/constants.mjs
  var INFINITE_PREFIX;
  var init_constants = __esm({
    "node_modules/swr/dist/_internal/constants.mjs"() {
      INFINITE_PREFIX = "$inf$";
    }
  });

  // node_modules/swr/dist/_internal/types.mjs
  var init_types = __esm({
    "node_modules/swr/dist/_internal/types.mjs"() {
    }
  });

  // node_modules/swr/dist/_internal/index.mjs
  var import_react23, enableDevtools, use, setupDevTools, normalize, useSWRConfig, middleware, BUILT_IN_MIDDLEWARE, withArgs, subscribeCallback;
  var init_internal = __esm({
    "node_modules/swr/dist/_internal/index.mjs"() {
      init_config_context_12s_CCVTDPOP();
      init_config_context_12s_CCVTDPOP();
      init_events();
      init_constants();
      import_react23 = __toESM(require_react(), 1);
      init_types();
      enableDevtools = isWindowDefined && window.__SWR_DEVTOOLS_USE__;
      use = enableDevtools ? window.__SWR_DEVTOOLS_USE__ : [];
      setupDevTools = () => {
        if (enableDevtools) {
          window.__SWR_DEVTOOLS_REACT__ = import_react23.default;
        }
      };
      normalize = (args) => {
        return isFunction(args[1]) ? [
          args[0],
          args[1],
          args[2] || {}
        ] : [
          args[0],
          null,
          (args[1] === null ? args[2] : args[1]) || {}
        ];
      };
      useSWRConfig = () => {
        const parentConfig = (0, import_react23.useContext)(SWRConfigContext);
        const mergedConfig = (0, import_react23.useMemo)(() => mergeObjects(defaultConfig, parentConfig), [
          parentConfig
        ]);
        return mergedConfig;
      };
      middleware = (useSWRNext) => (key_, fetcher_, config) => {
        const fetcher = fetcher_ && ((...args) => {
          const [key] = serialize(key_);
          const [, , , PRELOAD] = SWRGlobalState.get(cache);
          if (key.startsWith(INFINITE_PREFIX)) {
            return fetcher_(...args);
          }
          const req = PRELOAD[key];
          if (isUndefined(req)) return fetcher_(...args);
          delete PRELOAD[key];
          return req;
        });
        return useSWRNext(key_, fetcher, config);
      };
      BUILT_IN_MIDDLEWARE = use.concat(middleware);
      withArgs = (hook) => {
        return function useSWRArgs(...args) {
          const fallbackConfig = useSWRConfig();
          const [key, fn, _config] = normalize(args);
          const config = mergeConfigs(fallbackConfig, _config);
          let next = hook;
          const { use: use3 } = config;
          const middleware2 = (use3 || []).concat(BUILT_IN_MIDDLEWARE);
          for (let i = middleware2.length; i--; ) {
            next = middleware2[i](next);
          }
          return next(key, fn || config.fetcher || null, config);
        };
      };
      subscribeCallback = (key, callbacks, callback) => {
        const keyedRevalidators = callbacks[key] || (callbacks[key] = []);
        keyedRevalidators.push(callback);
        return () => {
          const index = keyedRevalidators.indexOf(callback);
          if (index >= 0) {
            keyedRevalidators[index] = keyedRevalidators[keyedRevalidators.length - 1];
            keyedRevalidators.pop();
          }
        };
      };
      setupDevTools();
    }
  });

  // node_modules/swr/dist/index/index.mjs
  var import_react24, import_shim, noop2, UNDEFINED2, use2, WITH_DEDUPE, resolvedUndef, sub, useSWRHandler, SWRConfig2, useSWR;
  var init_index = __esm({
    "node_modules/swr/dist/index/index.mjs"() {
      import_react24 = __toESM(require_react(), 1);
      import_shim = __toESM(require_shim(), 1);
      init_internal();
      noop2 = () => {
      };
      UNDEFINED2 = /*#__NOINLINE__*/
      noop2();
      use2 = import_react24.default.use || // This extra generic is to avoid TypeScript mixing up the generic and JSX sytax
      // and emitting an error.
      // We assume that this is only for the `use(thenable)` case, not `use(context)`.
      // https://github.com/facebook/react/blob/aed00dacfb79d17c53218404c52b1c7aa59c4a89/packages/react-server/src/ReactFizzThenable.js#L45
      ((thenable) => {
        switch (thenable.status) {
          case "pending":
            throw thenable;
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            thenable.status = "pending";
            thenable.then((v) => {
              thenable.status = "fulfilled";
              thenable.value = v;
            }, (e) => {
              thenable.status = "rejected";
              thenable.reason = e;
            });
            throw thenable;
        }
      });
      WITH_DEDUPE = {
        dedupe: true
      };
      resolvedUndef = Promise.resolve(UNDEFINED);
      sub = () => noop;
      useSWRHandler = (_key, fetcher, config) => {
        const { cache: cache2, compare: compare2, suspense, fallbackData, revalidateOnMount, revalidateIfStale, refreshInterval, refreshWhenHidden, refreshWhenOffline, keepPreviousData, strictServerPrefetchWarning } = config;
        const [EVENT_REVALIDATORS, MUTATION, FETCH, PRELOAD] = SWRGlobalState.get(cache2);
        const [key, fnArg] = serialize(_key);
        const initialMountedRef = (0, import_react24.useRef)(false);
        const unmountedRef = (0, import_react24.useRef)(false);
        const keyRef = (0, import_react24.useRef)(key);
        const fetcherRef = (0, import_react24.useRef)(fetcher);
        const configRef = (0, import_react24.useRef)(config);
        const getConfig = () => configRef.current;
        const isActive = () => getConfig().isVisible() && getConfig().isOnline();
        const [getCache, setCache, subscribeCache, getInitialCache] = createCacheHelper(cache2, key);
        const stateDependencies = (0, import_react24.useRef)({}).current;
        const fallback = isUndefined(fallbackData) ? isUndefined(config.fallback) ? UNDEFINED : config.fallback[key] : fallbackData;
        const isEqual = (prev, current) => {
          for (const _ in stateDependencies) {
            const t = _;
            if (t === "data") {
              if (!compare2(prev[t], current[t])) {
                if (!isUndefined(prev[t])) {
                  return false;
                }
                if (!compare2(returnedData, current[t])) {
                  return false;
                }
              }
            } else {
              if (current[t] !== prev[t]) {
                return false;
              }
            }
          }
          return true;
        };
        const isInitialMount = !initialMountedRef.current;
        const getSnapshot = (0, import_react24.useMemo)(() => {
          const cachedData2 = getCache();
          const initialData = getInitialCache();
          const getSelectedCache = (state) => {
            const snapshot = mergeObjects(state);
            delete snapshot._k;
            const shouldStartRequest = (() => {
              if (!key) return false;
              if (!fetcher) return false;
              if (getConfig().isPaused()) return false;
              if (isInitialMount && !isUndefined(revalidateOnMount)) return revalidateOnMount;
              const data2 = !isUndefined(fallback) ? fallback : snapshot.data;
              if (suspense) return isUndefined(data2) || revalidateIfStale;
              return isUndefined(data2) || revalidateIfStale;
            })();
            if (!shouldStartRequest) {
              return snapshot;
            }
            return {
              isValidating: true,
              isLoading: true,
              ...snapshot
            };
          };
          const clientSnapshot = getSelectedCache(cachedData2);
          const serverSnapshot = cachedData2 === initialData ? clientSnapshot : getSelectedCache(initialData);
          let memorizedSnapshot = clientSnapshot;
          return [
            () => {
              const newSnapshot = getSelectedCache(getCache());
              const compareResult = isEqual(newSnapshot, memorizedSnapshot);
              if (compareResult) {
                memorizedSnapshot.data = newSnapshot.data;
                memorizedSnapshot.isLoading = newSnapshot.isLoading;
                memorizedSnapshot.isValidating = newSnapshot.isValidating;
                memorizedSnapshot.error = newSnapshot.error;
                return memorizedSnapshot;
              } else {
                memorizedSnapshot = newSnapshot;
                return newSnapshot;
              }
            },
            () => serverSnapshot
          ];
        }, [
          cache2,
          key
        ]);
        const cached2 = (0, import_shim.useSyncExternalStore)((0, import_react24.useCallback)(
          (callback) => subscribeCache(key, (current, prev) => {
            if (!isEqual(prev, current)) callback();
          }),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [
            cache2,
            key
          ]
        ), getSnapshot[0], getSnapshot[1]);
        const hasRevalidator = EVENT_REVALIDATORS[key] && EVENT_REVALIDATORS[key].length > 0;
        const cachedData = cached2.data;
        const data = isUndefined(cachedData) ? fallback && isPromiseLike(fallback) ? use2(fallback) : fallback : cachedData;
        const error = cached2.error;
        const laggyDataRef = (0, import_react24.useRef)(data);
        const returnedData = keepPreviousData ? isUndefined(cachedData) ? isUndefined(laggyDataRef.current) ? data : laggyDataRef.current : cachedData : data;
        const hasKeyButNoData = key && isUndefined(data);
        const hydrationRef = (0, import_react24.useRef)(null);
        !IS_SERVER && // getServerSnapshot is only called during hydration
        // eslint-disable-next-line react-hooks/rules-of-hooks
        (0, import_shim.useSyncExternalStore)(sub, () => {
          hydrationRef.current = false;
          return hydrationRef;
        }, () => {
          hydrationRef.current = true;
          return hydrationRef;
        });
        const isHydration = hydrationRef.current;
        if (strictServerPrefetchWarning && isHydration && !suspense && hasKeyButNoData) {
          console.warn(`Missing pre-initiated data for serialized key "${key}" during server-side rendering. Data fetching should be initiated on the server and provided to SWR via fallback data. You can set "strictServerPrefetchWarning: false" to disable this warning.`);
        }
        const shouldDoInitialRevalidation = (() => {
          if (!key || !fetcher) return false;
          if (getConfig().isPaused()) return false;
          if (hasRevalidator && !isUndefined(error)) return false;
          if (isInitialMount && !isUndefined(revalidateOnMount)) return revalidateOnMount;
          if (suspense) return isUndefined(data) ? false : revalidateIfStale;
          return isUndefined(data) || revalidateIfStale;
        })();
        const defaultValidatingState = isInitialMount && shouldDoInitialRevalidation;
        const isValidating = isUndefined(cached2.isValidating) ? defaultValidatingState : cached2.isValidating;
        const isLoading = isUndefined(cached2.isLoading) ? defaultValidatingState : cached2.isLoading;
        const revalidate = (0, import_react24.useCallback)(
          async (revalidateOpts) => {
            const currentFetcher = fetcherRef.current;
            if (!key || !currentFetcher || unmountedRef.current || getConfig().isPaused()) {
              return false;
            }
            let newData;
            let startAt;
            let loading = true;
            const opts = revalidateOpts || {};
            const shouldStartNewRequest = !FETCH[key] || !opts.dedupe;
            const callbackSafeguard = () => {
              if (IS_REACT_LEGACY) {
                return !unmountedRef.current && key === keyRef.current && initialMountedRef.current;
              }
              return key === keyRef.current;
            };
            const finalState = {
              isValidating: false,
              isLoading: false
            };
            const finishRequestAndUpdateState = () => {
              setCache(finalState);
            };
            const cleanupState = () => {
              const requestInfo = FETCH[key];
              if (requestInfo && requestInfo[1] === startAt) {
                delete FETCH[key];
              }
            };
            const initialState = {
              isValidating: true
            };
            if (isUndefined(getCache().data)) {
              initialState.isLoading = true;
            }
            try {
              if (shouldStartNewRequest) {
                setCache(initialState);
                if (config.loadingTimeout && isUndefined(getCache().data)) {
                  setTimeout(() => {
                    if (loading && callbackSafeguard()) {
                      getConfig().onLoadingSlow(key, config);
                    }
                  }, config.loadingTimeout);
                }
                FETCH[key] = [
                  currentFetcher(fnArg),
                  getTimestamp()
                ];
              }
              ;
              [newData, startAt] = FETCH[key];
              newData = await newData;
              if (shouldStartNewRequest) {
                setTimeout(cleanupState, config.dedupingInterval);
              }
              if (!FETCH[key] || FETCH[key][1] !== startAt) {
                if (shouldStartNewRequest) {
                  if (callbackSafeguard()) {
                    getConfig().onDiscarded(key);
                  }
                }
                return false;
              }
              finalState.error = UNDEFINED;
              const mutationInfo = MUTATION[key];
              if (!isUndefined(mutationInfo) && // case 1
              (startAt <= mutationInfo[0] || // case 2
              startAt <= mutationInfo[1] || // case 3
              mutationInfo[1] === 0)) {
                finishRequestAndUpdateState();
                if (shouldStartNewRequest) {
                  if (callbackSafeguard()) {
                    getConfig().onDiscarded(key);
                  }
                }
                return false;
              }
              const cacheData = getCache().data;
              finalState.data = compare2(cacheData, newData) ? cacheData : newData;
              if (shouldStartNewRequest) {
                if (callbackSafeguard()) {
                  getConfig().onSuccess(newData, key, config);
                }
              }
            } catch (err) {
              cleanupState();
              const currentConfig = getConfig();
              const { shouldRetryOnError } = currentConfig;
              if (!currentConfig.isPaused()) {
                finalState.error = err;
                if (shouldStartNewRequest && callbackSafeguard()) {
                  currentConfig.onError(err, key, currentConfig);
                  if (shouldRetryOnError === true || isFunction(shouldRetryOnError) && shouldRetryOnError(err)) {
                    if (!getConfig().revalidateOnFocus || !getConfig().revalidateOnReconnect || isActive()) {
                      currentConfig.onErrorRetry(err, key, currentConfig, (_opts) => {
                        const revalidators = EVENT_REVALIDATORS[key];
                        if (revalidators && revalidators[0]) {
                          revalidators[0](events_exports.ERROR_REVALIDATE_EVENT, _opts);
                        }
                      }, {
                        retryCount: (opts.retryCount || 0) + 1,
                        dedupe: true
                      });
                    }
                  }
                }
              }
            }
            loading = false;
            finishRequestAndUpdateState();
            return true;
          },
          // `setState` is immutable, and `eventsCallback`, `fnArg`, and
          // `keyValidating` are depending on `key`, so we can exclude them from
          // the deps array.
          //
          // FIXME:
          // `fn` and `config` might be changed during the lifecycle,
          // but they might be changed every render like this.
          // `useSWR('key', () => fetch('/api/'), { suspense: true })`
          // So we omit the values from the deps array
          // even though it might cause unexpected behaviors.
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [
            key,
            cache2
          ]
        );
        const boundMutate = (0, import_react24.useCallback)(
          // Use callback to make sure `keyRef.current` returns latest result every time
          (...args) => {
            return internalMutate(cache2, keyRef.current, ...args);
          },
          // eslint-disable-next-line react-hooks/exhaustive-deps
          []
        );
        useIsomorphicLayoutEffect(() => {
          fetcherRef.current = fetcher;
          configRef.current = config;
          if (!isUndefined(cachedData)) {
            laggyDataRef.current = cachedData;
          }
        });
        useIsomorphicLayoutEffect(() => {
          if (!key) return;
          const softRevalidate = revalidate.bind(UNDEFINED, WITH_DEDUPE);
          let nextFocusRevalidatedAt = 0;
          if (getConfig().revalidateOnFocus) {
            const initNow = Date.now();
            nextFocusRevalidatedAt = initNow + getConfig().focusThrottleInterval;
          }
          const onRevalidate = (type, opts = {}) => {
            if (type == events_exports.FOCUS_EVENT) {
              const now = Date.now();
              if (getConfig().revalidateOnFocus && now > nextFocusRevalidatedAt && isActive()) {
                nextFocusRevalidatedAt = now + getConfig().focusThrottleInterval;
                softRevalidate();
              }
            } else if (type == events_exports.RECONNECT_EVENT) {
              if (getConfig().revalidateOnReconnect && isActive()) {
                softRevalidate();
              }
            } else if (type == events_exports.MUTATE_EVENT) {
              return revalidate();
            } else if (type == events_exports.ERROR_REVALIDATE_EVENT) {
              return revalidate(opts);
            }
            return;
          };
          const unsubEvents = subscribeCallback(key, EVENT_REVALIDATORS, onRevalidate);
          unmountedRef.current = false;
          keyRef.current = key;
          initialMountedRef.current = true;
          setCache({
            _k: fnArg
          });
          if (shouldDoInitialRevalidation) {
            if (!FETCH[key]) {
              if (isUndefined(data) || IS_SERVER) {
                softRevalidate();
              } else {
                rAF(softRevalidate);
              }
            }
          }
          return () => {
            unmountedRef.current = true;
            unsubEvents();
          };
        }, [
          key
        ]);
        useIsomorphicLayoutEffect(() => {
          let timer;
          function next() {
            const interval = isFunction(refreshInterval) ? refreshInterval(getCache().data) : refreshInterval;
            if (interval && timer !== -1) {
              timer = setTimeout(execute, interval);
            }
          }
          function execute() {
            if (!getCache().error && (refreshWhenHidden || getConfig().isVisible()) && (refreshWhenOffline || getConfig().isOnline())) {
              revalidate(WITH_DEDUPE).then(next);
            } else {
              next();
            }
          }
          next();
          return () => {
            if (timer) {
              clearTimeout(timer);
              timer = -1;
            }
          };
        }, [
          refreshInterval,
          refreshWhenHidden,
          refreshWhenOffline,
          key
        ]);
        (0, import_react24.useDebugValue)(returnedData);
        if (suspense) {
          if (!IS_REACT_LEGACY && IS_SERVER && hasKeyButNoData) {
            throw new Error("Fallback data is required when using Suspense in SSR.");
          }
          if (hasKeyButNoData) {
            fetcherRef.current = fetcher;
            configRef.current = config;
            unmountedRef.current = false;
          }
          const req = PRELOAD[key];
          const mutateReq = !isUndefined(req) && hasKeyButNoData ? boundMutate(req) : resolvedUndef;
          use2(mutateReq);
          if (!isUndefined(error) && hasKeyButNoData) {
            throw error;
          }
          const revalidation = hasKeyButNoData ? revalidate(WITH_DEDUPE) : resolvedUndef;
          if (!isUndefined(returnedData) && hasKeyButNoData) {
            revalidation.status = "fulfilled";
            revalidation.value = true;
          }
          use2(revalidation);
        }
        const swrResponse = {
          mutate: boundMutate,
          get data() {
            stateDependencies.data = true;
            return returnedData;
          },
          get error() {
            stateDependencies.error = true;
            return error;
          },
          get isValidating() {
            stateDependencies.isValidating = true;
            return isValidating;
          },
          get isLoading() {
            stateDependencies.isLoading = true;
            return isLoading;
          }
        };
        return swrResponse;
      };
      SWRConfig2 = OBJECT.defineProperty(SWRConfig, "defaultValue", {
        value: defaultConfig
      });
      useSWR = withArgs(useSWRHandler);
    }
  });

  // node_modules/@mui/icons-material/esm/Help.js
  var import_jsx_runtime5, Help_default;
  var init_Help = __esm({
    "node_modules/@mui/icons-material/esm/Help.js"() {
      "use client";
      init_createSvgIcon();
      import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
      Help_default = (0, import_utils.createSvgIcon)(/* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", {
        d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 17h-2v-2h2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25"
      }), "Help");
    }
  });

  // src/LaunchProteinView/components/HelpDialog.tsx
  var HelpDialog_exports = {};
  __export(HelpDialog_exports, {
    default: () => HelpDialog
  });
  function Typography22({ children }) {
    return /* @__PURE__ */ import_react34.default.createElement(import_material18.Typography, { style: { margin: 4 } }, children);
  }
  function HelpDialog({
    handleClose
  }) {
    return /* @__PURE__ */ import_react34.default.createElement(import_ui3.Dialog, { open: true, maxWidth: "lg", onClose: handleClose, title: "Help" }, /* @__PURE__ */ import_react34.default.createElement(import_material18.DialogContent, null, /* @__PURE__ */ import_react34.default.createElement(Typography22, null, "The procedure for the protein lookup is as follows:", /* @__PURE__ */ import_react34.default.createElement("ul", null, /* @__PURE__ */ import_react34.default.createElement("li", null, "(Automatic lookup) Searches UniProt for the transcript ID or gene name to retrieve the UniProt ID, which is then used to lookup the structure in AlphaFoldDB"), /* @__PURE__ */ import_react34.default.createElement("li", null, "(Manual) Allows you to choose your own structure file from your local machine (e.g. a PDB file predicted by e.g. ColabFold) or supply a specific URL"), /* @__PURE__ */ import_react34.default.createElement("li", null, "The residues from the structure are downloaded, and then you can choose the transcript isoform from the selected gene that best represents the structure. Asterisks are displayed if there is an exact sequence match"), /* @__PURE__ */ import_react34.default.createElement("li", null, "The residues from the structure are finally aligned to the to the selected transcript's protein sequence representation, and this creates a mapping from the reference genome coordinates to positions in the 3-D structure"), /* @__PURE__ */ import_react34.default.createElement("li", null, "Finally the molstar panel is opened, and this contains many specialized features features, plus additional mouseover and selection features supplied by the plugin to connect mouse click actions and mouse hover with coordinates on the linear genome view"))), /* @__PURE__ */ import_react34.default.createElement(Typography22, null, "If you run into challenges with this workflow e.g. your transcripts are not being found in UniProt then you can use the Manual import form, or contact colin.diesh@gmail.com for troubleshooting")), /* @__PURE__ */ import_react34.default.createElement(import_material18.Divider, null), /* @__PURE__ */ import_react34.default.createElement(import_material18.DialogActions, null, /* @__PURE__ */ import_react34.default.createElement(
      import_material18.Button,
      {
        onClick: () => {
          handleClose();
        },
        color: "primary"
      },
      "Close"
    )));
  }
  var import_react34, import_ui3, import_material18;
  var init_HelpDialog = __esm({
    "src/LaunchProteinView/components/HelpDialog.tsx"() {
      "use strict";
      import_react34 = __toESM(require_react());
      import_ui3 = __toESM(require_ui());
      import_material18 = __toESM(require_material());
    }
  });

  // global-externals:@jbrowse/core/pluggableElementTypes
  var require_pluggableElementTypes = __commonJS({
    "global-externals:@jbrowse/core/pluggableElementTypes"(exports, module) {
      module.exports = JBrowseExports["@jbrowse/core/pluggableElementTypes"];
    }
  });

  // global-externals:@jbrowse/core/util/types/mst
  var require_mst = __commonJS({
    "global-externals:@jbrowse/core/util/types/mst"(exports, module) {
      module.exports = JBrowseExports["@jbrowse/core/util/types/mst"];
    }
  });

  // global-externals:@jbrowse/mobx-state-tree
  var require_mobx_state_tree = __commonJS({
    "global-externals:@jbrowse/mobx-state-tree"(exports, module) {
      module.exports = JBrowseExports["mobx-state-tree"];
    }
  });

  // src/ProteinView/proteinToGenomeMapping.ts
  function proteinToGenomeMapping({
    model,
    structureSeqPos
  }) {
    const {
      genomeToTranscriptSeqMapping: genomeToTranscriptSeqMapping3,
      pairwiseAlignment,
      structureSeqToTranscriptSeqPosition
    } = model;
    if (!genomeToTranscriptSeqMapping3 || !pairwiseAlignment) {
      return void 0;
    }
    const { p2g, strand } = genomeToTranscriptSeqMapping3;
    const transcriptPos = structureSeqToTranscriptSeqPosition?.[structureSeqPos];
    if (transcriptPos === void 0) {
      return void 0;
    }
    return getCodonRange(p2g, transcriptPos, strand);
  }
  function proteinRangeToGenomeMapping({
    model,
    structureSeqPos,
    structureSeqEndPos
  }) {
    let minStart;
    let maxEnd;
    for (let pos = structureSeqPos; pos < structureSeqEndPos; pos++) {
      const result = proteinToGenomeMapping({ structureSeqPos: pos, model });
      if (result) {
        const [s, e] = result;
        if (minStart === void 0 || s < minStart) {
          minStart = s;
        }
        if (maxEnd === void 0 || e > maxEnd) {
          maxEnd = e;
        }
      }
    }
    if (minStart !== void 0 && maxEnd !== void 0) {
      return [minStart, maxEnd];
    }
    return void 0;
  }
  async function clickProteinToGenome({
    model,
    structureSeqPos,
    structureSeqEndPos
  }) {
    const session = (0, import_util37.getSession)(model);
    const { connectedView, genomeToTranscriptSeqMapping: genomeToTranscriptSeqMapping3, zoomToBaseLevel } = model;
    const { assemblyManager } = session;
    if (!genomeToTranscriptSeqMapping3) {
      return void 0;
    }
    const { strand, refName } = genomeToTranscriptSeqMapping3;
    const assemblyName = connectedView?.assemblyNames[0];
    if (!assemblyName) {
      return void 0;
    }
    const result = structureSeqEndPos !== void 0 ? proteinRangeToGenomeMapping({
      structureSeqPos,
      structureSeqEndPos,
      model
    }) : proteinToGenomeMapping({ structureSeqPos, model });
    if (!result) {
      return void 0;
    }
    const [start, end] = result;
    model.setClickGenomeHighlights([
      {
        assemblyName,
        refName,
        start,
        end
      }
    ]);
    if (zoomToBaseLevel) {
      await connectedView.navToLocString(
        `${refName}:${start}-${end}${strand === -1 ? "[rev]" : ""}`,
        void 0,
        0.2
      );
    } else {
      const assembly = assemblyManager.get(connectedView.assemblyNames[0]);
      connectedView.centerAt(
        start,
        assembly?.getCanonicalRefName(refName) ?? refName
      );
    }
  }
  function hoverProteinToGenome({
    model,
    structureSeqPos
  }) {
    if (structureSeqPos === void 0) {
      model.setHoverGenomeHighlights([]);
      return;
    }
    const mappedCoords = proteinToGenomeMapping({
      structureSeqPos,
      model
    });
    const { genomeToTranscriptSeqMapping: genomeToTranscriptSeqMapping3, connectedView } = model;
    const assemblyName = connectedView?.assemblyNames[0];
    if (genomeToTranscriptSeqMapping3 && mappedCoords && assemblyName) {
      const [start, end] = mappedCoords;
      model.setHoverGenomeHighlights([
        {
          assemblyName,
          refName: genomeToTranscriptSeqMapping3.refName,
          start,
          end
        }
      ]);
    }
  }
  var import_util37;
  var init_proteinToGenomeMapping = __esm({
    "src/ProteinView/proteinToGenomeMapping.ts"() {
      "use strict";
      import_util37 = __toESM(require_util());
      init_esm();
    }
  });

  // src/ProteinView/components/ManualAlignmentDialog.tsx
  var import_react41, import_material22, import_mobx_react12, ManualAlignmentDialog, ManualAlignmentDialog_default;
  var init_ManualAlignmentDialog = __esm({
    "src/ProteinView/components/ManualAlignmentDialog.tsx"() {
      "use strict";
      import_react41 = __toESM(require_react());
      import_material22 = __toESM(require_material());
      init_esm2();
      import_mobx_react12 = __toESM(require_mobx_react());
      ManualAlignmentDialog = (0, import_mobx_react12.observer)(function ManualAlignmentDialog2({
        model
      }) {
        const [alignment, setAlignment] = (0, import_react41.useState)("");
        const [parseError, setParseError] = (0, import_react41.useState)();
        const { showManualAlignmentDialog, structures } = model;
        const handleClose = () => {
          setAlignment("");
          setParseError(void 0);
          model.setShowManualAlignmentDialog(false);
        };
        const handleApply = () => {
          if (!alignment.trim()) {
            return;
          }
          try {
            const parsed = parsePairwise(alignment.trim());
            const structure = structures[0];
            if (structure) {
              structure.setAlignment(parsed);
            }
            handleClose();
          } catch (e) {
            setParseError(`Failed to parse alignment: ${e}`);
          }
        };
        if (!showManualAlignmentDialog) {
          return null;
        }
        return /* @__PURE__ */ import_react41.default.createElement(import_material22.Dialog, { open: true, onClose: handleClose, maxWidth: "md", fullWidth: true }, /* @__PURE__ */ import_react41.default.createElement(import_material22.DialogTitle, null, "Import Manual Alignment"), /* @__PURE__ */ import_react41.default.createElement(import_material22.DialogContent, null, /* @__PURE__ */ import_react41.default.createElement(import_material22.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Paste a pre-computed alignment in Clustal format. The first sequence should be the transcript and the second should be the structure."), /* @__PURE__ */ import_react41.default.createElement(
          import_material22.TextField,
          {
            multiline: true,
            rows: 12,
            fullWidth: true,
            placeholder: `Example:
a  MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG
   |||||||||||||||||||||||||||||||||||||
b  MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG`,
            value: alignment,
            onChange: (e) => {
              setAlignment(e.target.value);
              setParseError(void 0);
            },
            InputProps: {
              sx: { fontFamily: "monospace", fontSize: 12 }
            }
          }
        ), parseError ? /* @__PURE__ */ import_react41.default.createElement(import_material22.Typography, { color: "error", variant: "body2", sx: { mt: 1 } }, parseError) : null), /* @__PURE__ */ import_react41.default.createElement(import_material22.DialogActions, null, /* @__PURE__ */ import_react41.default.createElement(import_material22.Button, { onClick: handleClose }, "Cancel"), /* @__PURE__ */ import_react41.default.createElement(
          import_material22.Button,
          {
            onClick: handleApply,
            variant: "contained",
            color: "primary",
            disabled: !alignment.trim()
          },
          "Apply Alignment"
        )));
      });
      ManualAlignmentDialog_default = ManualAlignmentDialog;
    }
  });

  // src/ProteinView/components/AddStructureDialog.tsx
  var import_react42, import_ui6, import_material23, import_mobx_react13, AddStructureDialog, AddStructureDialog_default;
  var init_AddStructureDialog = __esm({
    "src/ProteinView/components/AddStructureDialog.tsx"() {
      "use strict";
      import_react42 = __toESM(require_react());
      import_ui6 = __toESM(require_ui());
      import_material23 = __toESM(require_material());
      import_mobx_react13 = __toESM(require_mobx_react());
      init_launchViewUtils();
      AddStructureDialog = (0, import_mobx_react13.observer)(function AddStructureDialog2({
        model
      }) {
        const [file, setFile] = (0, import_react42.useState)();
        const [pdbId, setPdbId] = (0, import_react42.useState)("");
        const [uniprotId, setUniprotId] = (0, import_react42.useState)("");
        const [choice, setChoice] = (0, import_react42.useState)("pdb");
        const [structureURL, setStructureURL] = (0, import_react42.useState)("");
        const [error, setError] = (0, import_react42.useState)();
        const { showAddStructureDialog } = model;
        const handleClose = () => {
          setFile(void 0);
          setPdbId("");
          setUniprotId("");
          setStructureURL("");
          setError(void 0);
          model.setShowAddStructureDialog(false);
        };
        const handleAdd = async () => {
          try {
            let url = structureURL;
            let data;
            if (choice === "pdb" && pdbId) {
              url = getPdbStructureUrl(pdbId);
            }
            if (choice === "uniprot" && uniprotId) {
              url = getAlphaFoldStructureUrl(uniprotId.toUpperCase());
            }
            if (choice === "file" && file) {
              data = await file.text();
            }
            if (url || data) {
              await model.addStructureAndSuperpose({ url: url || void 0, data });
              handleClose();
            }
          } catch (e) {
            console.error(e);
            setError(e);
          }
        };
        if (!showAddStructureDialog) {
          return null;
        }
        const canAdd = choice === "url" && structureURL !== "" || choice === "file" && file !== void 0 || choice === "pdb" && pdbId !== "" || choice === "uniprot" && uniprotId !== "";
        return /* @__PURE__ */ import_react42.default.createElement(import_material23.Dialog, { open: true, onClose: handleClose, maxWidth: "sm", fullWidth: true }, /* @__PURE__ */ import_react42.default.createElement(import_material23.DialogTitle, null, "Add Structure"), /* @__PURE__ */ import_react42.default.createElement(import_material23.DialogContent, null, error ? /* @__PURE__ */ import_react42.default.createElement(import_ui6.ErrorMessage, { error }) : null, /* @__PURE__ */ import_react42.default.createElement(import_material23.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Add another structure to superpose on the existing structure(s)."), /* @__PURE__ */ import_react42.default.createElement(import_material23.FormControl, { component: "fieldset", sx: { mb: 2 } }, /* @__PURE__ */ import_react42.default.createElement(
          import_material23.RadioGroup,
          {
            value: choice,
            onChange: (event) => {
              setChoice(event.target.value);
            }
          },
          /* @__PURE__ */ import_react42.default.createElement(import_material23.FormControlLabel, { value: "pdb", control: /* @__PURE__ */ import_react42.default.createElement(import_material23.Radio, null), label: "PDB ID" }),
          /* @__PURE__ */ import_react42.default.createElement(
            import_material23.FormControlLabel,
            {
              value: "uniprot",
              control: /* @__PURE__ */ import_react42.default.createElement(import_material23.Radio, null),
              label: "UniProt ID (AlphaFold)"
            }
          ),
          /* @__PURE__ */ import_react42.default.createElement(import_material23.FormControlLabel, { value: "url", control: /* @__PURE__ */ import_react42.default.createElement(import_material23.Radio, null), label: "URL" }),
          /* @__PURE__ */ import_react42.default.createElement(import_material23.FormControlLabel, { value: "file", control: /* @__PURE__ */ import_react42.default.createElement(import_material23.Radio, null), label: "File" })
        )), choice === "pdb" ? /* @__PURE__ */ import_react42.default.createElement(
          import_material23.TextField,
          {
            fullWidth: true,
            value: pdbId,
            onChange: (event) => {
              setPdbId(event.target.value.toUpperCase());
            },
            label: "PDB ID (e.g. 1CRN)",
            placeholder: "Enter PDB ID",
            sx: { mb: 2 }
          }
        ) : null, choice === "uniprot" ? /* @__PURE__ */ import_react42.default.createElement(
          import_material23.TextField,
          {
            fullWidth: true,
            value: uniprotId,
            onChange: (event) => {
              setUniprotId(event.target.value.toUpperCase());
            },
            label: "UniProt ID (e.g. P04637)",
            placeholder: "Enter UniProt ID",
            helperText: "Will fetch the AlphaFold v6 predicted structure",
            sx: { mb: 2 }
          }
        ) : null, choice === "url" ? /* @__PURE__ */ import_react42.default.createElement(
          import_material23.TextField,
          {
            fullWidth: true,
            label: "Structure URL",
            value: structureURL,
            onChange: (event) => {
              setStructureURL(event.target.value);
            },
            placeholder: "https://files.rcsb.org/download/1CRN.cif",
            sx: { mb: 2 }
          }
        ) : null, choice === "file" ? /* @__PURE__ */ import_react42.default.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ import_react42.default.createElement(import_material23.Button, { variant: "outlined", component: "label" }, file ? file.name : "Choose File", /* @__PURE__ */ import_react42.default.createElement(
          "input",
          {
            type: "file",
            hidden: true,
            accept: ".pdb,.cif,.mmcif,.ent",
            onChange: ({ target }) => {
              const f = target.files?.[0];
              if (f) {
                setFile(f);
              }
            }
          }
        )), file ? /* @__PURE__ */ import_react42.default.createElement(import_material23.Typography, { variant: "body2", sx: { mt: 1 } }, "Selected: ", file.name) : null) : null, /* @__PURE__ */ import_react42.default.createElement(import_material23.Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 } }, "Tip: Structures will be automatically superposed using TM-align. For manual control, use the Mol* controls (\u{1F527} wrench icon).")), /* @__PURE__ */ import_react42.default.createElement(import_material23.DialogActions, null, /* @__PURE__ */ import_react42.default.createElement(import_material23.Button, { onClick: handleClose }, "Cancel"), /* @__PURE__ */ import_react42.default.createElement(
          import_material23.Button,
          {
            onClick: () => {
              handleAdd().catch((e) => {
                console.error(e);
              });
            },
            variant: "contained",
            color: "primary",
            disabled: !canAdd
          },
          "Add Structure"
        )));
      });
      AddStructureDialog_default = AddStructureDialog;
    }
  });

  // src/ProteinView/components/HeaderStructureInfo.tsx
  var import_react43, import_mobx_react14, HeaderStructureInfo, HeaderStructureInfo_default;
  var init_HeaderStructureInfo = __esm({
    "src/ProteinView/components/HeaderStructureInfo.tsx"() {
      "use strict";
      import_react43 = __toESM(require_react());
      import_mobx_react14 = __toESM(require_mobx_react());
      HeaderStructureInfo = (0, import_mobx_react14.observer)(function HeaderStructureInfo2({
        model
      }) {
        const { structures } = model;
        return structures.map(
          (structure, idx) => {
            const { clickString, hoverString } = structure;
            return /* @__PURE__ */ import_react43.default.createElement("span", { key: `${clickString}-${hoverString}-${idx}` }, [
              clickString ? `Click: ${clickString}` : "",
              hoverString ? `Hover: ${hoverString}` : ""
            ].join(" "), "\xA0");
          }
        );
      });
      HeaderStructureInfo_default = HeaderStructureInfo;
    }
  });

  // src/ProteinView/constants.ts
  var CHAR_WIDTH, ROW_HEIGHT, TRACK_HEIGHT, TRACK_GAP, LABEL_WIDTH, HOVER_MARKER_COLOR, SELECTED_BORDER, HOVERED_BORDER, HIDE_BUTTON_COLOR;
  var init_constants2 = __esm({
    "src/ProteinView/constants.ts"() {
      "use strict";
      CHAR_WIDTH = 6;
      ROW_HEIGHT = 14;
      TRACK_HEIGHT = 12;
      TRACK_GAP = 2;
      LABEL_WIDTH = 50;
      HOVER_MARKER_COLOR = "rgba(255, 105, 180, 0.5)";
      SELECTED_BORDER = "2px solid #333";
      HOVERED_BORDER = "1px solid black";
      HIDE_BUTTON_COLOR = "#999";
    }
  });

  // src/ProteinView/hooks/useUniProtFeatures.ts
  function getFeatureColor(type) {
    return featureColors[type] ?? "#999999";
  }
  async function fetchUniProtFeatures(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${url}`);
    }
    const text = await res.text();
    const features = [];
    for (const line of text.split("\n")) {
      if (line.startsWith("#") || !line.trim()) {
        continue;
      }
      const parts = line.split("	");
      if (parts.length < 9) {
        continue;
      }
      const type = parts[2];
      const start = Number.parseInt(parts[3] ?? "0", 10);
      const end = Number.parseInt(parts[4] ?? "0", 10);
      const attributes = parts[8] ?? "";
      let description = "";
      let id;
      for (const attr of attributes.split(";")) {
        const [key, value] = attr.split("=");
        if (key === "Note") {
          description = decodeURIComponent(value ?? "").replace(/%2C/g, ",");
        } else if (key === "ID") {
          id = value;
        }
      }
      if (type) {
        const uniqueId = `${type}-${start}-${end}-${features.length}`;
        features.push({
          type,
          start,
          end,
          description,
          id,
          uniqueId
        });
      }
    }
    return features;
  }
  function useUniProtFeatures(uniprotId) {
    const { data, error, isLoading } = useSWR(
      uniprotId ? `https://rest.uniprot.org/uniprotkb/${uniprotId}.gff` : null,
      fetchUniProtFeatures
    );
    return {
      features: data,
      error,
      isLoading
    };
  }
  var featureColors;
  var init_useUniProtFeatures = __esm({
    "src/ProteinView/hooks/useUniProtFeatures.ts"() {
      "use strict";
      init_index();
      featureColors = {
        Domain: "#1f77b4",
        "DNA binding": "#ff7f0e",
        Region: "#2ca02c",
        "Zinc finger": "#d62728",
        "Coiled coil": "#9467bd",
        Motif: "#8c564b",
        "Compositional bias": "#e377c2",
        Repeat: "#7f7f7f",
        Transmembrane: "#bcbd22",
        Intramembrane: "#17becf",
        "Topological domain": "#aec7e8",
        Signal: "#ffbb78",
        "Signal peptide": "#ffbb78",
        Propeptide: "#98df8a",
        "Transit peptide": "#ff9896",
        Chain: "#c5b0d5",
        "Disulfide bond": "#c49c94",
        "Active site": "#f7b6d2",
        "Binding site": "#c7c7c7",
        Site: "#dbdb8d",
        "Modified residue": "#9edae5",
        Glycosylation: "#393b79",
        Lipidation: "#637939",
        "Cross-link": "#8c6d31",
        "Alternative sequence": "#e7969c",
        "Natural variant": "#de9ed6",
        Mutagenesis: "#ad494a",
        "Sequence conflict": "#b5cf6b",
        Helix: "#e7ba52",
        "Beta strand": "#6b6ecf",
        Turn: "#d6616b",
        "Initiator methionine": "#ce6dbd",
        Peptide: "#6baed6",
        "Calcium binding": "#fd8d3c",
        "Nucleotide binding": "#74c476"
      };
    }
  });

  // src/ProteinView/hooks/useProteinFeatureTrackData.ts
  function groupFeaturesByType(features) {
    const grouped = {};
    for (const feature of features) {
      grouped[feature.type] ??= [];
      grouped[feature.type].push(feature);
    }
    return grouped;
  }
  function useProteinFeatureTrackData(model, uniprotId) {
    const { features, isLoading, error } = useUniProtFeatures(uniprotId);
    const { pairwiseAlignment } = model;
    if (!uniprotId || isLoading || error || !features || !pairwiseAlignment) {
      return { data: void 0, isLoading, error };
    }
    const sequenceLength = pairwiseAlignment.alns[0].seq.length;
    const groupedFeatures = groupFeaturesByType(features);
    const featureTypes = Object.keys(groupedFeatures);
    return {
      data: { featureTypes, groupedFeatures, sequenceLength },
      isLoading: false,
      error: void 0
    };
  }
  var init_useProteinFeatureTrackData = __esm({
    "src/ProteinView/hooks/useProteinFeatureTrackData.ts"() {
      "use strict";
      init_useUniProtFeatures();
    }
  });

  // src/ProteinView/components/ProteinAlignmentHelpDialog.tsx
  var ProteinAlignmentHelpDialog_exports = {};
  __export(ProteinAlignmentHelpDialog_exports, {
    default: () => ProteinAlignmentHelpDialog
  });
  function Typography23({ children }) {
    return /* @__PURE__ */ import_react44.default.createElement(
      import_material24.Typography,
      {
        style: {
          margin: 4,
          marginBottom: 12
        }
      },
      children
    );
  }
  function ProteinAlignmentHelpDialog({
    handleClose
  }) {
    return /* @__PURE__ */ import_react44.default.createElement(import_ui7.Dialog, { open: true, maxWidth: "lg", onClose: handleClose, title: "Protein alignment" }, /* @__PURE__ */ import_react44.default.createElement(import_material24.DialogContent, null, /* @__PURE__ */ import_react44.default.createElement(Typography23, null, "This panel shows the computed pairwise alignment of the reference genome sequence to the structure sequence. The structure file (PDB file, mmCIF file, etc) has a stored representation of the e.g. amino acid sequence but the sequence in the structure file can differ from the sequence from the gene on the genome browser"), /* @__PURE__ */ import_react44.default.createElement(Typography23, null, "In order to resolve this, we align the two sequences together (using EMBOSS needle) to get pairwise alignment of the genome's representation of the protein and the structure file's representation of the protein."), /* @__PURE__ */ import_react44.default.createElement(Typography23, null, "If you need a 100% fidelity protein, you can do a folding with e.g. AlphaFold to make sure the structure you are using matches exactly the sequence of the transcript")), /* @__PURE__ */ import_react44.default.createElement(import_material24.DialogActions, null, /* @__PURE__ */ import_react44.default.createElement(
      import_material24.Button,
      {
        onClick: () => {
          handleClose();
        },
        variant: "contained",
        color: "primary"
      },
      "Close"
    )));
  }
  var import_react44, import_ui7, import_material24;
  var init_ProteinAlignmentHelpDialog = __esm({
    "src/ProteinView/components/ProteinAlignmentHelpDialog.tsx"() {
      "use strict";
      import_react44 = __toESM(require_react());
      import_ui7 = __toESM(require_ui());
      import_material24 = __toESM(require_material());
    }
  });

  // src/ProteinView/components/ProteinAlignmentHelpButton.tsx
  function ProteinAlignmentHelpButton({
    model
  }) {
    return /* @__PURE__ */ import_react45.default.createElement(
      import_material25.IconButton,
      {
        style: { float: "right" },
        onClick: () => {
          (0, import_util42.getSession)(model).queueDialog((handleClose) => [
            ProteinAlignmentHelpDialog2,
            { handleClose }
          ]);
        }
      },
      /* @__PURE__ */ import_react45.default.createElement(Help_default, null)
    );
  }
  var import_react45, import_util42, import_material25, ProteinAlignmentHelpDialog2;
  var init_ProteinAlignmentHelpButton = __esm({
    "src/ProteinView/components/ProteinAlignmentHelpButton.tsx"() {
      "use strict";
      import_react45 = __toESM(require_react());
      import_util42 = __toESM(require_util());
      init_Help();
      import_material25 = __toESM(require_material());
      ProteinAlignmentHelpDialog2 = (0, import_react45.lazy)(
        () => Promise.resolve().then(() => (init_ProteinAlignmentHelpDialog(), ProteinAlignmentHelpDialog_exports))
      );
    }
  });

  // src/ProteinView/highlightResidueRange.ts
  async function getMolstarRangeSelection({
    structure,
    startResidue,
    endResidue
  }) {
    const { Script } = await loadMolstar();
    return Script.getStructureSelection(
      (Q) => Q.struct.generator.atomGroups({
        "residue-test": Q.core.logic.and([
          Q.core.rel.gre([
            Q.struct.atomProperty.macromolecular.label_seq_id(),
            startResidue
          ]),
          Q.core.rel.lte([
            Q.struct.atomProperty.macromolecular.label_seq_id(),
            endResidue
          ])
        ]),
        "group-by": Q.struct.atomProperty.macromolecular.residueKey()
      }),
      structure
    );
  }
  async function highlightResidueRange({
    structure,
    startResidue,
    endResidue,
    plugin
  }) {
    const { StructureSelection } = await loadMolstar();
    const sel = await getMolstarRangeSelection({
      structure,
      startResidue,
      endResidue
    });
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    plugin.managers.interactivity.lociHighlights.clearHighlights();
    plugin.managers.interactivity.lociHighlights.highlight({ loci });
  }
  async function selectResidueRange({
    structure,
    startResidue,
    endResidue,
    plugin
  }) {
    const { StructureSelection } = await loadMolstar();
    const sel = await getMolstarRangeSelection({
      structure,
      startResidue,
      endResidue
    });
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    plugin.managers.interactivity.lociSelects.deselectAll();
    plugin.managers.interactivity.lociSelects.select({ loci });
  }
  var init_highlightResidueRange = __esm({
    "src/ProteinView/highlightResidueRange.ts"() {
      "use strict";
      init_loadMolstar();
    }
  });

  // src/ProteinView/components/throttle.ts
  function throttle(func, limit) {
    let lastCall = 0;
    return ((...args) => {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        func(...args);
      }
    });
  }
  var init_throttle = __esm({
    "src/ProteinView/components/throttle.ts"() {
      "use strict";
    }
  });

  // src/ProteinView/components/ProteinFeatureTrack.tsx
  function getVisibleTypes(featureTypes, hiddenFeatureTypes) {
    return featureTypes.filter((type) => !hiddenFeatureTypes.has(type));
  }
  function getFeatureGeometry(feature, structurePositionToAlignmentMap2) {
    const startAlnPos = structurePositionToAlignmentMap2?.[feature.start - 1] ?? feature.start - 1;
    const endAlnPos = structurePositionToAlignmentMap2?.[feature.end - 1] ?? feature.end - 1;
    return {
      left: startAlnPos * CHAR_WIDTH,
      width: Math.max((endAlnPos - startAlnPos + 1) * CHAR_WIDTH, 3)
    };
  }
  function FeatureTooltipContent({ feature }) {
    return /* @__PURE__ */ import_react46.default.createElement("div", null, /* @__PURE__ */ import_react46.default.createElement("div", null, /* @__PURE__ */ import_react46.default.createElement("strong", null, feature.type)), /* @__PURE__ */ import_react46.default.createElement("div", null, "Position: ", feature.start, "-", feature.end), feature.description ? /* @__PURE__ */ import_react46.default.createElement("div", null, feature.description) : null);
  }
  var import_react46, import_material26, import_mobx_react15, FeatureBar, HoverMarker, FeatureTypeLabel, FeatureTypeTrackContent, ProteinFeatureTrackLabels, ProteinFeatureTrackContent;
  var init_ProteinFeatureTrack = __esm({
    "src/ProteinView/components/ProteinFeatureTrack.tsx"() {
      "use strict";
      import_react46 = __toESM(require_react());
      import_material26 = __toESM(require_material());
      import_mobx_react15 = __toESM(require_mobx_react());
      init_constants2();
      init_highlightResidueRange();
      init_useUniProtFeatures();
      init_proteinToGenomeMapping();
      init_throttle();
      FeatureBar = (0, import_mobx_react15.observer)(function FeatureBar2({
        feature,
        model
      }) {
        const [isHovered, setIsHovered] = (0, import_react46.useState)(false);
        const {
          molstarPluginContext,
          selectedFeatureId,
          structurePositionToAlignmentMap: structurePositionToAlignmentMap2
        } = model;
        const isSelected = selectedFeatureId === feature.uniqueId;
        const getAlignmentRange = () => {
          if (!structurePositionToAlignmentMap2) {
            return void 0;
          }
          const startAlignmentPos = structurePositionToAlignmentMap2[feature.start - 1];
          const endAlignmentPos = structurePositionToAlignmentMap2[feature.end - 1];
          if (startAlignmentPos !== void 0 && endAlignmentPos !== void 0) {
            return { start: startAlignmentPos, end: endAlignmentPos };
          }
          return void 0;
        };
        const handleMouseEnter = () => {
          setIsHovered(true);
          const structure = model.molstarStructure;
          if (structure && molstarPluginContext) {
            highlightResidueRange({
              structure,
              startResidue: feature.start,
              endResidue: feature.end,
              plugin: molstarPluginContext
            }).catch((e) => {
              console.error(e);
            });
          }
          const range = getAlignmentRange();
          if (range) {
            model.setAlignmentHoverRange(range);
          }
        };
        const handleMouseLeave = () => {
          setIsHovered(false);
          molstarPluginContext?.managers.interactivity.lociHighlights.clearHighlights();
          model.clearAlignmentHoverRange();
        };
        const handleClick = () => {
          const structure = model.molstarStructure;
          const newSelected = !isSelected;
          if (structure && molstarPluginContext) {
            if (newSelected) {
              selectResidueRange({
                structure,
                startResidue: feature.start,
                endResidue: feature.end,
                plugin: molstarPluginContext
              }).catch((e) => {
                console.error(e);
              });
            } else {
              molstarPluginContext.managers.interactivity.lociSelects.deselectAll();
            }
          }
          if (newSelected) {
            model.setSelectedFeatureId(feature.uniqueId);
            const range = getAlignmentRange();
            if (range) {
              model.setClickAlignmentRange(range);
            }
            clickProteinToGenome({
              model,
              structureSeqPos: feature.start - 1,
              structureSeqEndPos: feature.end
            }).catch((e) => {
              console.error(e);
            });
          } else {
            model.clearSelectedFeatureId();
            model.clearClickAlignmentRange();
            model.clearClickGenomeHighlights();
          }
        };
        const { left, width } = getFeatureGeometry(
          feature,
          structurePositionToAlignmentMap2
        );
        const color = getFeatureColor(feature.type);
        return /* @__PURE__ */ import_react46.default.createElement(import_material26.Tooltip, { title: /* @__PURE__ */ import_react46.default.createElement(FeatureTooltipContent, { feature }), followCursor: true }, /* @__PURE__ */ import_react46.default.createElement(
          "div",
          {
            onClick: handleClick,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            style: {
              position: "absolute",
              left,
              top: 0,
              width,
              height: TRACK_HEIGHT,
              backgroundColor: color,
              opacity: isHovered || isSelected ? 0.9 : 0.6,
              cursor: "pointer",
              borderRadius: 2,
              border: isSelected ? SELECTED_BORDER : isHovered ? HOVERED_BORDER : "none",
              boxSizing: "border-box"
            }
          }
        ));
      });
      HoverMarker = (0, import_mobx_react15.observer)(function HoverMarker2({
        model
      }) {
        const { alignmentHoverPos } = model;
        if (alignmentHoverPos === void 0) {
          return null;
        }
        const left = alignmentHoverPos * CHAR_WIDTH;
        return /* @__PURE__ */ import_react46.default.createElement(
          "div",
          {
            style: {
              position: "absolute",
              left,
              top: 0,
              bottom: 0,
              width: CHAR_WIDTH,
              backgroundColor: HOVER_MARKER_COLOR,
              pointerEvents: "none",
              zIndex: 10
            }
          }
        );
      });
      FeatureTypeLabel = (0, import_mobx_react15.observer)(function FeatureTypeLabel2({
        type,
        labelWidth,
        model
      }) {
        return /* @__PURE__ */ import_react46.default.createElement(import_material26.Tooltip, { title: type, placement: "left" }, /* @__PURE__ */ import_react46.default.createElement(
          "div",
          {
            style: {
              height: TRACK_HEIGHT + TRACK_GAP,
              width: labelWidth - 4,
              fontSize: 9,
              fontFamily: "monospace",
              textAlign: "right",
              paddingRight: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 2
            }
          },
          /* @__PURE__ */ import_react46.default.createElement(
            "span",
            {
              onClick: (e) => {
                e.stopPropagation();
                model.hideFeatureType(type);
              },
              style: {
                cursor: "pointer",
                color: HIDE_BUTTON_COLOR,
                fontWeight: "bold",
                fontSize: 8,
                lineHeight: 1
              },
              title: `Hide ${type} track`
            },
            "x"
          ),
          /* @__PURE__ */ import_react46.default.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis" } }, type)
        ));
      });
      FeatureTypeTrackContent = (0, import_mobx_react15.observer)(function FeatureTypeTrackContent2({
        features,
        model,
        sequenceLength
      }) {
        const trackWidth = sequenceLength * CHAR_WIDTH;
        return /* @__PURE__ */ import_react46.default.createElement(
          "div",
          {
            style: {
              position: "relative",
              height: TRACK_HEIGHT,
              width: trackWidth,
              marginBottom: TRACK_GAP
            }
          },
          features.map((feature) => /* @__PURE__ */ import_react46.default.createElement(FeatureBar, { key: feature.uniqueId, feature, model })),
          /* @__PURE__ */ import_react46.default.createElement(HoverMarker, { model })
        );
      });
      ProteinFeatureTrackLabels = (0, import_mobx_react15.observer)(
        function ProteinFeatureTrackLabels2({
          data,
          labelWidth,
          model
        }) {
          const { hiddenFeatureTypes } = model;
          const visibleTypes = getVisibleTypes(data.featureTypes, hiddenFeatureTypes);
          return /* @__PURE__ */ import_react46.default.createElement(import_react46.default.Fragment, null, visibleTypes.map((type) => /* @__PURE__ */ import_react46.default.createElement(
            FeatureTypeLabel,
            {
              key: type,
              type,
              labelWidth,
              model
            }
          )));
        }
      );
      ProteinFeatureTrackContent = (0, import_mobx_react15.observer)(
        function ProteinFeatureTrackContent2({
          data,
          model
        }) {
          const { hiddenFeatureTypes } = model;
          const visibleTypes = getVisibleTypes(data.featureTypes, hiddenFeatureTypes);
          const containerRef = (0, import_react46.useRef)(null);
          const handleMouseMove = (0, import_react46.useMemo)(
            () => throttle((e) => {
              const container = containerRef.current;
              if (!container) {
                return;
              }
              const rect = container.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const alignmentPos = Math.floor(x / CHAR_WIDTH);
              if (alignmentPos >= 0 && alignmentPos < data.sequenceLength) {
                model.hoverAlignmentPosition(alignmentPos);
              }
            }, 16),
            [model, data.sequenceLength]
          );
          const handleMouseLeave = () => {
            model.setHoveredPosition(void 0);
            model.clearHoverGenomeHighlights();
            model.clearHighlightFromExternal();
          };
          return /* @__PURE__ */ import_react46.default.createElement(
            "div",
            {
              ref: containerRef,
              onMouseMove: handleMouseMove,
              onMouseLeave: handleMouseLeave
            },
            visibleTypes.map((type) => /* @__PURE__ */ import_react46.default.createElement(
              FeatureTypeTrackContent,
              {
                key: type,
                features: data.groupedFeatures[type],
                model,
                sequenceLength: data.sequenceLength
              }
            ))
          );
        }
      );
    }
  });

  // src/ProteinView/components/SplitString.tsx
  var import_react47, import_mobx_react16, CharacterSpans, MatchOverlays, HoverHighlight, RangeHighlight, AlignmentHighlights, SplitString, SplitString_default;
  var init_SplitString = __esm({
    "src/ProteinView/components/SplitString.tsx"() {
      "use strict";
      import_react47 = __toESM(require_react());
      import_mobx_react16 = __toESM(require_mobx_react());
      init_constants2();
      init_throttle();
      CharacterSpans = (0, import_mobx_react16.observer)(function CharacterSpans2({
        str
      }) {
        return str.split("").map((char, i) => /* @__PURE__ */ import_react47.default.createElement(
          "span",
          {
            key: i,
            style: {
              position: "absolute",
              left: i * CHAR_WIDTH,
              width: CHAR_WIDTH
            }
          },
          char === " " ? "\xA0" : char
        ));
      });
      MatchOverlays = (0, import_mobx_react16.observer)(function MatchOverlays2({
        model,
        height
      }) {
        const { showHighlight, alignmentMatchSet } = model;
        return !showHighlight || !alignmentMatchSet ? null : [...alignmentMatchSet].map((i) => /* @__PURE__ */ import_react47.default.createElement(
          "span",
          {
            key: i,
            style: {
              position: "absolute",
              left: i * CHAR_WIDTH,
              top: 0,
              width: CHAR_WIDTH,
              height,
              background: "#33ff19a0",
              pointerEvents: "none"
            }
          }
        ));
      });
      HoverHighlight = (0, import_mobx_react16.observer)(function HoverHighlight2({
        model,
        strLength,
        height
      }) {
        const { alignmentHoverPos } = model;
        const showHoverHighlight = alignmentHoverPos !== void 0 && alignmentHoverPos >= 0 && alignmentHoverPos < strLength;
        return !showHoverHighlight ? null : /* @__PURE__ */ import_react47.default.createElement(
          "span",
          {
            style: {
              position: "absolute",
              left: alignmentHoverPos * CHAR_WIDTH,
              top: 0,
              width: CHAR_WIDTH,
              height,
              background: "#f698",
              pointerEvents: "none"
            }
          }
        );
      });
      RangeHighlight = (0, import_mobx_react16.observer)(function RangeHighlight2({
        range,
        strLength,
        background,
        border,
        height
      }) {
        if (!range) {
          return null;
        }
        const { start, end } = range;
        const clampedStart = Math.max(0, start);
        const clampedEnd = Math.min(strLength - 1, end);
        if (clampedStart > clampedEnd) {
          return null;
        }
        const width = (clampedEnd - clampedStart + 1) * CHAR_WIDTH;
        return /* @__PURE__ */ import_react47.default.createElement(
          "span",
          {
            style: {
              position: "absolute",
              left: clampedStart * CHAR_WIDTH,
              top: 0,
              width,
              height,
              background,
              border,
              boxSizing: "border-box",
              pointerEvents: "none"
            }
          }
        );
      });
      AlignmentHighlights = (0, import_mobx_react16.observer)(function AlignmentHighlights2({
        model,
        strLength,
        height
      }) {
        return /* @__PURE__ */ import_react47.default.createElement(
          "div",
          {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: strLength * CHAR_WIDTH,
              height,
              pointerEvents: "none"
            }
          },
          /* @__PURE__ */ import_react47.default.createElement(MatchOverlays, { model, height }),
          /* @__PURE__ */ import_react47.default.createElement(
            RangeHighlight,
            {
              range: model.clickAlignmentRange,
              strLength,
              background: "rgba(0, 120, 255, 0.3)",
              border: "1px solid rgba(0, 120, 255, 0.6)",
              height
            }
          ),
          /* @__PURE__ */ import_react47.default.createElement(
            RangeHighlight,
            {
              range: model.alignmentHoverRange,
              strLength,
              background: "rgba(255, 165, 0, 0.4)",
              height
            }
          ),
          /* @__PURE__ */ import_react47.default.createElement(HoverHighlight, { model, strLength, height })
        );
      });
      SplitString = (0, import_mobx_react16.observer)(function SplitString2({
        model,
        str
      }) {
        const containerRef = (0, import_react47.useRef)(null);
        const handleMouseMove = (0, import_react47.useMemo)(
          () => throttle((e) => {
            const container = containerRef.current;
            if (!container) {
              return;
            }
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const index = Math.floor(x / CHAR_WIDTH);
            if (index >= 0 && index < str.length) {
              model.hoverAlignmentPosition(index);
            }
          }, 16),
          [str, model]
        );
        const handleClick = (0, import_react47.useMemo)(
          () => (e) => {
            const container = containerRef.current;
            if (!container) {
              return;
            }
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const index = Math.floor(x / CHAR_WIDTH);
            if (index >= 0 && index < str.length) {
              model.clickAlignmentPosition(index);
            }
          },
          [str.length, model]
        );
        return /* @__PURE__ */ import_react47.default.createElement(
          "span",
          {
            ref: containerRef,
            style: {
              position: "relative",
              display: "inline-block",
              width: str.length * CHAR_WIDTH,
              height: "1em"
            },
            onMouseMove: handleMouseMove,
            onClick: handleClick
          },
          /* @__PURE__ */ import_react47.default.createElement(CharacterSpans, { str })
        );
      });
      SplitString_default = SplitString;
    }
  });

  // src/ProteinView/components/ProteinAlignment.tsx
  var import_react48, import_material27, import_mobx5, import_mobx_react17, ProteinAlignment, ProteinAlignment_default;
  var init_ProteinAlignment = __esm({
    "src/ProteinView/components/ProteinAlignment.tsx"() {
      "use strict";
      import_react48 = __toESM(require_react());
      import_material27 = __toESM(require_material());
      import_mobx5 = __toESM(require_mobx());
      import_mobx_react17 = __toESM(require_mobx_react());
      init_constants2();
      init_useProteinFeatureTrackData();
      init_ProteinAlignmentHelpButton();
      init_ProteinFeatureTrack();
      init_SplitString();
      ProteinAlignment = (0, import_mobx_react17.observer)(function ProteinAlignment2({
        model
      }) {
        const {
          pairwiseAlignment,
          showHighlight,
          showProteinTracks,
          autoScrollAlignment,
          uniprotId
        } = model;
        const containerRef = (0, import_react48.useRef)(null);
        const {
          data: featureData,
          isLoading: featureLoading,
          error: featureError
        } = useProteinFeatureTrackData(model, uniprotId);
        (0, import_react48.useEffect)(
          () => (0, import_mobx5.reaction)(
            () => model.alignmentHoverPos,
            (alignmentHoverPos) => {
              const container = containerRef.current;
              if (!autoScrollAlignment || model.isMouseInAlignment || alignmentHoverPos === void 0 || !container) {
                return;
              }
              const scrollPosition = alignmentHoverPos * CHAR_WIDTH;
              container.scrollTo({
                left: scrollPosition - container.clientWidth / 2,
                behavior: "smooth"
              });
            }
          ),
          [model, autoScrollAlignment]
        );
        if (!pairwiseAlignment) {
          return /* @__PURE__ */ import_react48.default.createElement("div", null, "No pairwiseAlignment");
        }
        const a0 = pairwiseAlignment.alns[0].seq;
        const a1 = pairwiseAlignment.alns[1].seq;
        const con = pairwiseAlignment.consensus;
        return /* @__PURE__ */ import_react48.default.createElement("div", null, /* @__PURE__ */ import_react48.default.createElement(ProteinAlignmentHelpButton, { model }), /* @__PURE__ */ import_react48.default.createElement(import_material27.Typography, null, "Alignment of the protein structure file's sequence with the selected transcript's sequence.", " ", showHighlight ? "Green is the aligned portion" : null), /* @__PURE__ */ import_react48.default.createElement(
          "div",
          {
            style: {
              display: "flex",
              fontSize: 9,
              fontFamily: "monospace",
              cursor: "pointer",
              margin: 8,
              paddingBottom: 8
            },
            onMouseEnter: () => {
              model.setIsMouseInAlignment(true);
            },
            onMouseLeave: () => {
              model.setIsMouseInAlignment(false);
              model.setHoveredPosition(void 0);
              model.clearHoverGenomeHighlights();
              model.clearHighlightFromExternal();
            }
          },
          /* @__PURE__ */ import_react48.default.createElement(
            "div",
            {
              style: {
                flexShrink: 0,
                width: LABEL_WIDTH,
                textAlign: "right",
                paddingRight: 4
              }
            },
            /* @__PURE__ */ import_react48.default.createElement("div", { style: { height: ROW_HEIGHT } }, /* @__PURE__ */ import_react48.default.createElement(import_material27.Tooltip, { title: "This is the sequence of the protein from the reference genome transcript" }, /* @__PURE__ */ import_react48.default.createElement("span", null, "GENOME"))),
            /* @__PURE__ */ import_react48.default.createElement("div", { style: { height: ROW_HEIGHT } }, "\xA0"),
            /* @__PURE__ */ import_react48.default.createElement("div", { style: { height: ROW_HEIGHT } }, /* @__PURE__ */ import_react48.default.createElement(import_material27.Tooltip, { title: "This is the sequence of the protein from the structure file" }, /* @__PURE__ */ import_react48.default.createElement("span", null, "STRUCT"))),
            showProteinTracks ? featureLoading ? /* @__PURE__ */ import_react48.default.createElement("div", { style: { height: ROW_HEIGHT, fontSize: 8, color: "#666" } }, "Loading...") : featureError ? /* @__PURE__ */ import_react48.default.createElement(
              import_material27.Tooltip,
              {
                title: featureError instanceof Error ? featureError.message : "Error loading features"
              },
              /* @__PURE__ */ import_react48.default.createElement("div", { style: { height: ROW_HEIGHT, fontSize: 8, color: "red" } }, "Error")
            ) : featureData ? /* @__PURE__ */ import_react48.default.createElement(
              ProteinFeatureTrackLabels,
              {
                data: featureData,
                labelWidth: LABEL_WIDTH,
                model
              }
            ) : null : null
          ),
          /* @__PURE__ */ import_react48.default.createElement(
            "div",
            {
              ref: containerRef,
              style: {
                overflow: "auto",
                whiteSpace: "nowrap",
                flex: 1,
                paddingBottom: 10,
                backgroundColor: "white"
              }
            },
            /* @__PURE__ */ import_react48.default.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ import_react48.default.createElement(
              AlignmentHighlights,
              {
                model,
                strLength: a0.length,
                height: ROW_HEIGHT * 3
              }
            ), /* @__PURE__ */ import_react48.default.createElement("div", { style: { height: ROW_HEIGHT } }, /* @__PURE__ */ import_react48.default.createElement(SplitString_default, { model, str: a0 })), /* @__PURE__ */ import_react48.default.createElement("div", { style: { height: ROW_HEIGHT } }, /* @__PURE__ */ import_react48.default.createElement(SplitString_default, { model, str: con })), /* @__PURE__ */ import_react48.default.createElement("div", { style: { height: ROW_HEIGHT } }, /* @__PURE__ */ import_react48.default.createElement(SplitString_default, { model, str: a1 }))),
            showProteinTracks && featureData ? /* @__PURE__ */ import_react48.default.createElement(ProteinFeatureTrackContent, { data: featureData, model }) : null
          )
        ));
      });
      ProteinAlignment_default = ProteinAlignment;
    }
  });

  // src/ProteinView/components/ProteinViewHeader.tsx
  var import_react49, import_ui8, import_mobx_react18, ProteinViewHeader, ProteinViewHeader_default;
  var init_ProteinViewHeader = __esm({
    "src/ProteinView/components/ProteinViewHeader.tsx"() {
      "use strict";
      import_react49 = __toESM(require_react());
      import_ui8 = __toESM(require_ui());
      import_mobx_react18 = __toESM(require_mobx_react());
      init_AddStructureDialog();
      init_HeaderStructureInfo();
      init_ProteinAlignment();
      ProteinViewHeader = (0, import_mobx_react18.observer)(function ProteinViewHeader2({
        model
      }) {
        const { structures, showAlignment } = model;
        return /* @__PURE__ */ import_react49.default.createElement("div", null, /* @__PURE__ */ import_react49.default.createElement(HeaderStructureInfo_default, { model }), showAlignment ? structures.map(
          (structure, idx) => {
            const { pairwiseAlignment } = structure;
            return /* @__PURE__ */ import_react49.default.createElement("div", { key: idx }, pairwiseAlignment ? /* @__PURE__ */ import_react49.default.createElement(ProteinAlignment_default, { key: idx, model: structure }) : /* @__PURE__ */ import_react49.default.createElement(import_ui8.LoadingEllipses, { message: "Loading pairwise alignment" }));
          }
        ) : null, /* @__PURE__ */ import_react49.default.createElement(AddStructureDialog_default, { model }));
      });
      ProteinViewHeader_default = ProteinViewHeader;
    }
  });

  // src/ProteinView/css/molstar.ts
  var molstar_default;
  var init_molstar = __esm({
    "src/ProteinView/css/molstar.ts"() {
      "use strict";
      molstar_default = `
.msp-plugin{font-family:Helvetica Neue,Segoe UI,Helvetica,Source Sans Pro,Arial,sans-serif;font-size:14px;line-height:1.42857143;position:absolute;inset:0}.msp-plugin *{box-sizing:border-box}.msp-plugin [hidden],.msp-plugin template{display:none}.msp-plugin a{background-color:transparent}.msp-plugin a:active,.msp-plugin a:hover{outline:0}.msp-plugin abbr[title]{border-bottom:1px dotted}.msp-plugin b,.msp-plugin strong{font-weight:700}.msp-plugin small{font-size:80%}.msp-plugin img{border:0}.msp-plugin svg:not(:root){overflow:hidden}.msp-plugin button,.msp-plugin input,.msp-plugin optgroup,.msp-plugin select,.msp-plugin textarea{color:inherit;font:inherit;margin:0}.msp-plugin button{overflow:visible}.msp-plugin button,.msp-plugin select{text-transform:none}.msp-plugin button,.msp-plugin html input[type=button],.msp-plugin input[type=reset],.msp-plugin input[type=submit]{-webkit-appearance:button;cursor:pointer}.msp-plugin button[disabled],.msp-plugin html input[disabled]{cursor:default}.msp-plugin button::-moz-focus-inner,.msp-plugin input::-moz-focus-inner{border:0;padding:0}.msp-plugin input{line-height:normal}.msp-plugin input[type=checkbox],.msp-plugin input[type=radio]{box-sizing:border-box;padding:0}.msp-plugin input[type=number]::-webkit-inner-spin-button,.msp-plugin input[type=number]::-webkit-outer-spin-button{height:auto}.msp-plugin textarea{overflow:auto}.msp-plugin .msp-layout-expanded,.msp-plugin .msp-layout-standard{inset:0}.msp-plugin .msp-layout-standard{border:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-region{overflow:hidden}.msp-plugin .msp-layout-static,.msp-plugin .msp-layout-scrollable{position:absolute}.msp-plugin .msp-scrollable{overflow-y:auto}.msp-plugin .msp-scrollable-container{position:absolute;inset:0;overflow-y:auto}.msp-plugin .msp-layout-static{overflow:hidden}.msp-plugin .msp-layout-top .msp-layout-static,.msp-plugin .msp-layout-main .msp-layout-static,.msp-plugin .msp-layout-bottom .msp-layout-static,.msp-plugin .msp-layout-right .msp-layout-static{inset:0}.msp-plugin .msp-layout-right .msp-layout-scrollable{inset:43px 0 0}.msp-plugin .msp-layout-left .msp-layout-static{inset:0}.msp-plugin .msp-layout-standard-outside{position:absolute}.msp-plugin .msp-layout-standard-outside .msp-layout-main{position:absolute;inset:0}.msp-plugin .msp-layout-standard-outside .msp-layout-top{position:absolute;right:0;height:97px;top:-97px;width:50%;border-left:1px solid rgb(206.2804878049,200.5487804878,186.2195121951);border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-outside .msp-layout-bottom{position:absolute;left:0;right:0;height:97px;top:-97px;width:50%;border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-outside .msp-layout-right{position:absolute;width:50%;right:0;bottom:-295px;height:295px;border-left:1px solid rgb(206.2804878049,200.5487804878,186.2195121951);border-top:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-outside .msp-layout-left{position:absolute;width:50%;left:0;bottom:-295px;height:295px;border-top:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-outside .msp-layout-hide-right .msp-layout-right{display:none}.msp-plugin .msp-layout-standard-outside .msp-layout-hide-right .msp-layout-left{width:100%}.msp-plugin .msp-layout-standard-outside .msp-layout-hide-left .msp-layout-left{display:none}.msp-plugin .msp-layout-standard-outside .msp-layout-hide-left .msp-layout-right{width:100%;border-left:none}.msp-plugin .msp-layout-standard-outside .msp-layout-collapse-left .msp-layout-left{width:32px}.msp-plugin .msp-layout-standard-outside .msp-layout-collapse-left .msp-layout-right{left:32px;width:auto}.msp-plugin .msp-layout-standard-outside .msp-layout-hide-top .msp-layout-top{display:none}.msp-plugin .msp-layout-standard-outside .msp-layout-hide-top .msp-layout-bottom{width:100%;border-left:none}.msp-plugin .msp-layout-standard-outside .msp-layout-hide-bottom .msp-layout-bottom{display:none}.msp-plugin .msp-layout-standard-outside .msp-layout-hide-bottom .msp-layout-top{width:100%;border-left:none}.msp-plugin .msp-layout-standard-landscape{position:absolute}.msp-plugin .msp-layout-standard-landscape .msp-layout-main{position:absolute;inset:100px 300px 70px 330px}.msp-plugin .msp-layout-standard-landscape .msp-layout-top{position:absolute;left:330px;right:300px;height:100px;top:0;border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-landscape .msp-layout-bottom{position:absolute;left:330px;right:300px;height:70px;bottom:0;border-top:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-landscape .msp-layout-right{position:absolute;width:300px;right:0;bottom:0;top:0;border-left:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-landscape .msp-layout-left{position:absolute;width:330px;left:0;bottom:0;top:0;border-right:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-right .msp-layout-right{display:none}.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-right .msp-layout-main,.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-right .msp-layout-top,.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-right .msp-layout-bottom{right:0}.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-left .msp-layout-left{display:none}.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-left .msp-layout-main,.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-left .msp-layout-top,.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-left .msp-layout-bottom{left:0}.msp-plugin .msp-layout-standard-landscape .msp-layout-collapse-left .msp-layout-left{width:32px}.msp-plugin .msp-layout-standard-landscape .msp-layout-collapse-left .msp-layout-main,.msp-plugin .msp-layout-standard-landscape .msp-layout-collapse-left .msp-layout-top,.msp-plugin .msp-layout-standard-landscape .msp-layout-collapse-left .msp-layout-bottom{left:32px}.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-bottom .msp-layout-bottom{display:none}.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-bottom .msp-layout-main{bottom:0}.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-top .msp-layout-top{display:none}.msp-plugin .msp-layout-standard-landscape .msp-layout-hide-top .msp-layout-main{top:0}.msp-plugin .msp-layout-standard-portrait{position:absolute}.msp-plugin .msp-layout-standard-portrait .msp-layout-main{position:absolute;inset:97px 0 361px}.msp-plugin .msp-layout-standard-portrait .msp-layout-top{position:absolute;right:0;height:97px;top:0;width:50%;border-left:1px solid rgb(206.2804878049,200.5487804878,186.2195121951);border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-portrait .msp-layout-bottom{position:absolute;left:0;right:0;height:97px;width:50%;border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-portrait .msp-layout-right{position:absolute;width:50%;right:0;bottom:0;height:361px;border-left:1px solid rgb(206.2804878049,200.5487804878,186.2195121951);border-top:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-portrait .msp-layout-left{position:absolute;width:50%;left:0;bottom:0;height:361px;border-top:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-portrait .msp-layout-hide-right .msp-layout-right{display:none}.msp-plugin .msp-layout-standard-portrait .msp-layout-hide-right .msp-layout-left{width:100%}.msp-plugin .msp-layout-standard-portrait .msp-layout-hide-left .msp-layout-left{display:none}.msp-plugin .msp-layout-standard-portrait .msp-layout-hide-left .msp-layout-right{width:100%;border-left:none}.msp-plugin .msp-layout-standard-portrait .msp-layout-hide-right.msp-layout-hide-left .msp-layout-main{bottom:0}.msp-plugin .msp-layout-standard-portrait .msp-layout-collapse-left .msp-layout-left{width:32px}.msp-plugin .msp-layout-standard-portrait .msp-layout-collapse-left .msp-layout-right{left:32px;width:auto}.msp-plugin .msp-layout-standard-portrait .msp-layout-hide-top .msp-layout-top{display:none}.msp-plugin .msp-layout-standard-portrait .msp-layout-hide-top .msp-layout-bottom{width:100%;border-left:none}.msp-plugin .msp-layout-standard-portrait .msp-layout-hide-bottom .msp-layout-bottom{display:none}.msp-plugin .msp-layout-standard-portrait .msp-layout-hide-bottom .msp-layout-top{width:100%;border-left:none}.msp-plugin .msp-layout-standard-portrait .msp-layout-hide-top.msp-layout-hide-bottom .msp-layout-main{top:0}.msp-plugin .msp-layout-standard-reactive{position:absolute}@media(orientation:landscape),(min-width:1000px){.msp-plugin .msp-layout-standard-reactive .msp-layout-main{position:absolute;inset:100px 300px 70px 330px}.msp-plugin .msp-layout-standard-reactive .msp-layout-top{position:absolute;left:330px;right:300px;height:100px;top:0;border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-reactive .msp-layout-bottom{position:absolute;left:330px;right:300px;height:70px;bottom:0;border-top:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-reactive .msp-layout-right{position:absolute;width:300px;right:0;bottom:0;top:0;border-left:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-reactive .msp-layout-left{position:absolute;width:330px;left:0;bottom:0;top:0;border-right:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-right .msp-layout-right{display:none}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-right .msp-layout-main,.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-right .msp-layout-top,.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-right .msp-layout-bottom{right:0}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-left .msp-layout-left{display:none}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-left .msp-layout-main,.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-left .msp-layout-top,.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-left .msp-layout-bottom{left:0}.msp-plugin .msp-layout-standard-reactive .msp-layout-collapse-left .msp-layout-left{width:32px}.msp-plugin .msp-layout-standard-reactive .msp-layout-collapse-left .msp-layout-main,.msp-plugin .msp-layout-standard-reactive .msp-layout-collapse-left .msp-layout-top,.msp-plugin .msp-layout-standard-reactive .msp-layout-collapse-left .msp-layout-bottom{left:32px}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-bottom .msp-layout-bottom{display:none}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-bottom .msp-layout-main{bottom:0}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-top .msp-layout-top{display:none}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-top .msp-layout-main{top:0}}@media(orientation:portrait)and (max-width:1000px){.msp-plugin .msp-layout-standard-reactive .msp-layout-main{position:absolute;inset:97px 0 361px}.msp-plugin .msp-layout-standard-reactive .msp-layout-top{position:absolute;right:0;height:97px;top:0;width:50%;border-left:1px solid rgb(206.2804878049,200.5487804878,186.2195121951);border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-reactive .msp-layout-bottom{position:absolute;left:0;right:0;height:97px;width:50%;border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-reactive .msp-layout-right{position:absolute;width:50%;right:0;bottom:0;height:361px;border-left:1px solid rgb(206.2804878049,200.5487804878,186.2195121951);border-top:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-reactive .msp-layout-left{position:absolute;width:50%;left:0;bottom:0;height:361px;border-top:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-right .msp-layout-right{display:none}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-right .msp-layout-left{width:100%}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-left .msp-layout-left{display:none}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-left .msp-layout-right{width:100%;border-left:none}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-right.msp-layout-hide-left .msp-layout-main{bottom:0}.msp-plugin .msp-layout-standard-reactive .msp-layout-collapse-left .msp-layout-left{width:32px}.msp-plugin .msp-layout-standard-reactive .msp-layout-collapse-left .msp-layout-right{left:32px;width:auto}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-top .msp-layout-top{display:none}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-top .msp-layout-bottom{width:100%;border-left:none}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-bottom .msp-layout-bottom{display:none}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-bottom .msp-layout-top{width:100%;border-left:none}.msp-plugin .msp-layout-standard-reactive .msp-layout-hide-top.msp-layout-hide-bottom .msp-layout-main{top:0}}.msp-plugin .msp-layout-expanded{position:fixed}@media(orientation:landscape){.msp-plugin .msp-layout-expanded .msp-layout-main{position:absolute;inset:100px 300px 70px 330px}.msp-plugin .msp-layout-expanded .msp-layout-top{position:absolute;left:330px;right:300px;height:100px;top:0;border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-expanded .msp-layout-bottom{position:absolute;left:330px;right:300px;height:70px;bottom:0;border-top:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-expanded .msp-layout-right{position:absolute;width:300px;right:0;bottom:0;top:0;border-left:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-expanded .msp-layout-left{position:absolute;width:330px;left:0;bottom:0;top:0;border-right:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-expanded .msp-layout-hide-right .msp-layout-right{display:none}.msp-plugin .msp-layout-expanded .msp-layout-hide-right .msp-layout-main,.msp-plugin .msp-layout-expanded .msp-layout-hide-right .msp-layout-top,.msp-plugin .msp-layout-expanded .msp-layout-hide-right .msp-layout-bottom{right:0}.msp-plugin .msp-layout-expanded .msp-layout-hide-left .msp-layout-left{display:none}.msp-plugin .msp-layout-expanded .msp-layout-hide-left .msp-layout-main,.msp-plugin .msp-layout-expanded .msp-layout-hide-left .msp-layout-top,.msp-plugin .msp-layout-expanded .msp-layout-hide-left .msp-layout-bottom{left:0}.msp-plugin .msp-layout-expanded .msp-layout-collapse-left .msp-layout-left{width:32px}.msp-plugin .msp-layout-expanded .msp-layout-collapse-left .msp-layout-main,.msp-plugin .msp-layout-expanded .msp-layout-collapse-left .msp-layout-top,.msp-plugin .msp-layout-expanded .msp-layout-collapse-left .msp-layout-bottom{left:32px}.msp-plugin .msp-layout-expanded .msp-layout-hide-bottom .msp-layout-bottom{display:none}.msp-plugin .msp-layout-expanded .msp-layout-hide-bottom .msp-layout-main{bottom:0}.msp-plugin .msp-layout-expanded .msp-layout-hide-top .msp-layout-top{display:none}.msp-plugin .msp-layout-expanded .msp-layout-hide-top .msp-layout-main{top:0}}@media(orientation:portrait){.msp-plugin .msp-layout-expanded .msp-layout-main{position:absolute;inset:97px 0 361px}.msp-plugin .msp-layout-expanded .msp-layout-top{position:absolute;right:0;height:97px;top:0;width:50%;border-left:1px solid rgb(206.2804878049,200.5487804878,186.2195121951);border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-expanded .msp-layout-bottom{position:absolute;left:0;right:0;height:97px;width:50%;border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-expanded .msp-layout-right{position:absolute;width:50%;right:0;bottom:0;height:361px;border-left:1px solid rgb(206.2804878049,200.5487804878,186.2195121951);border-top:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-expanded .msp-layout-left{position:absolute;width:50%;left:0;bottom:0;height:361px;border-top:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-layout-expanded .msp-layout-hide-right .msp-layout-right{display:none}.msp-plugin .msp-layout-expanded .msp-layout-hide-right .msp-layout-left{width:100%}.msp-plugin .msp-layout-expanded .msp-layout-hide-left .msp-layout-left{display:none}.msp-plugin .msp-layout-expanded .msp-layout-hide-left .msp-layout-right{width:100%;border-left:none}.msp-plugin .msp-layout-expanded .msp-layout-hide-right.msp-layout-hide-left .msp-layout-main{bottom:0}.msp-plugin .msp-layout-expanded .msp-layout-collapse-left .msp-layout-left{width:32px}.msp-plugin .msp-layout-expanded .msp-layout-collapse-left .msp-layout-right{left:32px;width:auto}.msp-plugin .msp-layout-expanded .msp-layout-hide-top .msp-layout-top{display:none}.msp-plugin .msp-layout-expanded .msp-layout-hide-top .msp-layout-bottom{width:100%;border-left:none}.msp-plugin .msp-layout-expanded .msp-layout-hide-bottom .msp-layout-bottom{display:none}.msp-plugin .msp-layout-expanded .msp-layout-hide-bottom .msp-layout-top{width:100%;border-left:none}.msp-plugin .msp-layout-expanded .msp-layout-hide-top.msp-layout-hide-bottom .msp-layout-main{top:0}}.msp-plugin ::-webkit-scrollbar{width:10px;height:10px}.msp-plugin ::-webkit-scrollbar-track{border-radius:0;background-color:#e9e6e0}.msp-plugin ::-webkit-scrollbar-thumb{border-radius:10px;background-color:#beb7a4;border:solid 1px transparent;background-clip:content-box}.msp-plugin .msp-form-control,.msp-plugin .msp-control-row select,.msp-plugin .msp-control-row button,.msp-plugin .msp-control-row input[type=text],.msp-plugin .msp-btn{display:block;width:100%;background:#f3f2ee;border:none;padding:0 10px;line-height:30px;height:32px;-webkit-appearance:none;-moz-appearance:none;appearance:none;-webkit-box-shadow:none;box-shadow:none;background-image:none}.msp-plugin .msp-form-control::-moz-placeholder,.msp-plugin .msp-control-row select::-moz-placeholder,.msp-plugin .msp-control-row button::-moz-placeholder,.msp-plugin .msp-control-row input[type=text]::-moz-placeholder,.msp-plugin .msp-btn::-moz-placeholder{color:#9c835f;opacity:1}.msp-plugin .msp-form-control:-ms-input-placeholder,.msp-plugin .msp-control-row select:-ms-input-placeholder,.msp-plugin .msp-control-row button:-ms-input-placeholder,.msp-plugin .msp-control-row input[type=text]:-ms-input-placeholder,.msp-plugin .msp-btn:-ms-input-placeholder{color:#9c835f}.msp-plugin .msp-form-control::-webkit-input-placeholder,.msp-plugin .msp-control-row select::-webkit-input-placeholder,.msp-plugin .msp-control-row button::-webkit-input-placeholder,.msp-plugin .msp-control-row input[type=text]::-webkit-input-placeholder,.msp-plugin .msp-btn::-webkit-input-placeholder{color:#9c835f}.msp-plugin .msp-form-control:hover,.msp-plugin .msp-control-row select:hover,.msp-plugin .msp-control-row button:hover,.msp-plugin .msp-control-row input[type=text]:hover,.msp-plugin .msp-btn:hover{color:#ae5d04;background-color:#e9e6e0;border:none;outline-offset:-1px!important;outline:1px solid rgb(200.993902439,194.6402439024,178.756097561)!important}.msp-plugin .msp-form-control:active,.msp-plugin .msp-control-row select:active,.msp-plugin .msp-control-row button:active,.msp-plugin .msp-control-row input[type=text]:active,.msp-plugin .msp-btn:active,.msp-plugin .msp-form-control:focus,.msp-plugin .msp-control-row select:focus,.msp-plugin .msp-control-row button:focus,.msp-plugin .msp-control-row input[type=text]:focus,.msp-plugin .msp-btn:focus{color:#332b1f;background-color:#f3f2ee;border:none;outline-offset:0;outline:none}.msp-plugin .msp-form-control[disabled],.msp-plugin .msp-control-row select[disabled],.msp-plugin .msp-control-row button[disabled],.msp-plugin .msp-control-row input[disabled][type=text],.msp-plugin [disabled].msp-btn,.msp-plugin .msp-form-control[readonly],.msp-plugin .msp-control-row select[readonly],.msp-plugin .msp-control-row button[readonly],.msp-plugin .msp-control-row input[readonly][type=text],.msp-plugin [readonly].msp-btn,fieldset[disabled] .msp-plugin .msp-form-control,fieldset[disabled] .msp-plugin .msp-control-row select,fieldset[disabled] .msp-plugin .msp-control-row button,fieldset[disabled] .msp-plugin .msp-control-row input[type=text],fieldset[disabled] .msp-plugin .msp-btn{background:#eeece7;opacity:.35}.msp-plugin .msp-btn,.msp-plugin .msp-control-row button{display:inline-block;margin-bottom:0;text-align:center;touch-action:manipulation;cursor:pointer;background-image:none;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;padding:0 10px;line-height:32px;border:none;-moz-box-sizing:border-box;box-sizing:border-box}.msp-plugin .msp-btn[disabled],.msp-plugin .msp-control-row button[disabled]{background:#eeece7;opacity:.35}.msp-plugin .msp-btn-block,.msp-plugin .msp-control-row button{display:block;width:100%}.msp-plugin .msp-btn,.msp-plugin .msp-control-row button,.msp-plugin .msp-btn:active,.msp-plugin .msp-btn-link:focus,.msp-plugin .msp-btn:hover{outline:none}.msp-plugin .msp-material-icon svg{display:inline-flex;vertical-align:middle;font-size:1.2em;margin-bottom:3px;fill:currentColor;width:1em;height:1em;flex-shrink:0;user-select:none}.msp-plugin .msp-btn-block>.msp-material-icon,.msp-plugin .msp-control-row button>.msp-material-icon{margin-left:0;margin-right:.4em}.msp-plugin .msp-btn-childless>.msp-material-icon{margin-left:0;margin-right:0}.msp-plugin .msp-btn-icon{border:none;height:32px;width:32px;line-height:32px;padding:0;text-align:center}.msp-plugin .msp-btn-icon:hover{color:#ae5d04;background-color:#e9e6e0;border:none;outline-offset:-1px!important;outline:1px solid rgb(200.993902439,194.6402439024,178.756097561)!important}.msp-plugin .msp-btn-icon[disabled],.msp-plugin .msp-btn-icon[disabled]:hover,.msp-plugin .msp-btn-icon[disabled]:active{color:#9c835f}.msp-plugin .msp-btn-icon-small{border:none;height:32px;width:20px;line-height:32px;padding:0;text-align:center}.msp-plugin .msp-btn-icon-small:hover{color:#ae5d04;background-color:#e9e6e0;border:none;outline-offset:-1px!important;outline:1px solid rgb(200.993902439,194.6402439024,178.756097561)!important}.msp-plugin .msp-btn-icon-small[disabled],.msp-plugin .msp-btn-icon-small[disabled]:hover,.msp-plugin .msp-btn-icon-small[disabled]:active{color:#9c835f}.msp-plugin .msp-btn-link{font-weight:400;border-radius:0}.msp-plugin .msp-btn-link,.msp-plugin .msp-btn-link:active,.msp-plugin .msp-btn-link.active,.msp-plugin .msp-btn-link[disabled],fieldset[disabled] .msp-plugin .msp-btn-link{background-color:transparent;-webkit-box-shadow:none;box-shadow:none}.msp-plugin .msp-btn-link,.msp-plugin .msp-btn-link:hover,.msp-plugin .msp-btn-link:focus,.msp-plugin .msp-btn-link:active{border-color:transparent}.msp-plugin .msp-btn-link:hover,.msp-plugin .msp-btn-link:focus{text-decoration:none;background-color:transparent}.msp-plugin .msp-btn-link[disabled]:hover,.msp-plugin .msp-btn-link[disabled]:focus,fieldset[disabled] .msp-plugin .msp-btn-link:hover,fieldset[disabled] .msp-plugin .msp-btn-link:focus{text-decoration:none}.msp-plugin .msp-btn-link .msp-icon{font-size:100%}.msp-plugin .msp-btn-link,.msp-plugin .msp-btn-link:active,.msp-plugin .msp-btn-link:focus{color:#332b1f;text-decoration:none}.msp-plugin .msp-btn-link:hover{color:#ae5d04;text-decoration:none}.msp-plugin .msp-btn-link-toggle-on{color:#332b1f}.msp-plugin .msp-btn-link-toggle-off,.msp-plugin .msp-btn-link-toggle-off:active,.msp-plugin .msp-btn-link-toggle-off:focus{color:#9c835f!important}.msp-plugin .msp-btn-link-toggle-on:hover{color:#ae5d04!important}.msp-plugin .msp-btn-link-toggle-off:hover{color:#dc9c56!important}.msp-plugin .msp-btn-action,.msp-plugin .msp-btn-action:active,.msp-plugin .msp-btn-action:focus{color:#332b1f;background:#f3f2ee}.msp-plugin .msp-btn-action:hover{color:#ae5d04;background:#f9f8f6}.msp-plugin .msp-btn-action[disabled],.msp-plugin .msp-btn-action[disabled]:hover,.msp-plugin .msp-btn-action[disabled]:active,.msp-plugin .msp-btn-action[disabled]:focus{color:#362e21}.msp-plugin .msp-btn-commit-on,.msp-plugin .msp-btn-commit-on:active,.msp-plugin .msp-btn-commit-on:focus{color:#974102;background:#f2f1ed}.msp-plugin .msp-btn-commit-on:hover{color:#ae5d04;background:#f8f7f4}.msp-plugin .msp-btn-commit-on[disabled],.msp-plugin .msp-btn-commit-on[disabled]:hover,.msp-plugin .msp-btn-commit-on[disabled]:active,.msp-plugin .msp-btn-commit-on[disabled]:focus{color:#9c4302}.msp-plugin .msp-btn-commit-off,.msp-plugin .msp-btn-commit-off:active,.msp-plugin .msp-btn-commit-off:focus{color:#332b1f;background:#f6f5f3}.msp-plugin .msp-btn-commit-off:hover{color:#ae5d04;background:#fcfbfa}.msp-plugin .msp-btn-commit-off[disabled],.msp-plugin .msp-btn-commit-off[disabled]:hover,.msp-plugin .msp-btn-commit-off[disabled]:active,.msp-plugin .msp-btn-commit-off[disabled]:focus{color:#362e21}.msp-plugin .msp-btn-remove:hover{color:#f2f4f7}.msp-plugin .msp-btn-commit-on:hover{color:#fc6c03}.msp-plugin .msp-select-toggle:after{content:"";position:absolute;right:.75rem;top:50%;transform:translateY(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid #ae5d04;opacity:0;pointer-events:none}.msp-plugin .msp-select-toggle:hover:after{opacity:1}.msp-plugin .msp-btn-action{height:32px;line-height:32px}.msp-plugin input[type=file]{display:block}.msp-plugin input[type=range]{display:block;width:100%}.msp-plugin select[multiple],.msp-plugin select[size],.msp-plugin textarea.msp-form-control,.msp-plugin textarea.msp-btn{height:auto}.msp-plugin .msp-control-top-offset{margin-top:1px}.msp-plugin .msp-btn-commit{text-align:right;padding:0 10px 0 0;line-height:32px;border:none;overflow:hidden;font-weight:700}.msp-plugin .msp-btn-commit .msp-icon{display:block-inline;line-height:32px;width:32px;text-align:center}.msp-plugin select.msp-form-control,.msp-plugin .msp-control-row select,.msp-plugin select.msp-btn{background:none;background-color:#f3f2ee;background-size:8px 12px;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAUCAMAAACzvE1FAAAADFBMVEUzMzMzMzMzMzMzMzMKAG/3AAAAA3RSTlMAf4C/aSLHAAAAPElEQVR42q3NMQ4AIAgEQTn//2cLdRKppSGzBYwzVXvznNWs8C58CiussPJj8h6NwgorrKRdTvuV9v16Afn0AYFOB7aYAAAAAElFTkSuQmCC);background-repeat:no-repeat;background-position:right 10px center;padding-right:24px}.msp-plugin select.msp-form-control:-moz-focusring,.msp-plugin .msp-control-row select:-moz-focusring,.msp-plugin select.msp-btn:-moz-focusring{color:transparent;text-shadow:0 0 0 #332b1f}.msp-plugin .msp-default-bg{background:#eeece7}.msp-plugin .msp-transparent-bg{background:transparent}.msp-plugin .msp-no-hover-outline:hover{color:#ae5d04;background-color:inherit;border:none;outline-offset:0!important;outline:none!important}.msp-plugin .msp-icon-inline{margin-right:8px}.msp-plugin .msp-control-row{position:relative;height:32px;background:#eeece7;margin-top:1px}.msp-plugin .msp-control-row>span.msp-control-row-label,.msp-plugin .msp-control-row>button.msp-control-button-label{line-height:32px;display:block;width:120px;text-align:right;padding:0 10px;color:#63533c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;position:relative;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;cursor:default}.msp-plugin .msp-control-row>button.msp-control-button-label{background:#eeece7;cursor:pointer}.msp-plugin .msp-control-row .msp-control-current{background:#eeece7}.msp-plugin .msp-control-row>div.msp-control-row-ctrl{position:absolute;inset:0 0 0 120px}.msp-plugin .msp-control-row>div.msp-control-row-text{position:absolute;inset:0 0 0 120px;display:flex;align-items:center;padding:0 10px}.msp-plugin .msp-control-row>div{background:#f3f2ee}.msp-plugin .msp-control-row>.msp-flex-row,.msp-plugin .msp-control-row>.msp-state-image-row{background:#eeece7}.msp-plugin .msp-control-label-short>span{width:80px!important}.msp-plugin .msp-control-label-short>div:nth-child(2){left:80px!important}.msp-plugin .msp-control-col-2{float:left;width:50%}.msp-plugin .msp-control-twoline{height:64px!important}.msp-plugin .msp-control-group{position:relative}.msp-plugin .msp-toggle-button .msp-icon{display:inline-block;margin-right:6px}.msp-plugin .msp-toggle-button>div>button:hover{border-color:#e9e6e0!important;border:none;outline-offset:-1px!important;outline:1px solid rgb(200.993902439,194.6402439024,178.756097561)!important}.msp-plugin .msp-slider>div:first-child{position:absolute;inset:0 62px 0 18px;display:flex}.msp-plugin .msp-slider>div:last-child{position:absolute;height:32px;line-height:32px;text-align:center;right:0;width:50px;top:0;bottom:0}.msp-plugin .msp-slider-no-input>div:first-child{right:18px}.msp-plugin .msp-slider-no-input>div:last-child{visibility:hidden;width:0}.msp-plugin .msp-slider input[type=text]{padding-right:6px;padding-left:4px;font-size:80%;text-align:right}.msp-plugin .msp-slider2>div:first-child{position:absolute;height:32px;line-height:32px;text-align:center;left:0;width:25px;top:0;bottom:0;font-size:80%}.msp-plugin .msp-slider2>div:nth-child(2){position:absolute;inset:0 37px 0 35px;display:flex}.msp-plugin .msp-slider2>div:last-child{position:absolute;height:32px;line-height:32px;text-align:center;right:0;width:25px;top:0;bottom:0;font-size:80%}.msp-plugin .msp-slider2 input[type=text]{padding-right:4px;padding-left:4px;font-size:80%;text-align:center}.msp-plugin .msp-toggle-color-picker button{border:10px solid rgb(243.2865853659,241.9085365854,238.4634146341)!important;margin:0;text-align:center;padding-right:10px;padding-left:10px}.msp-plugin .msp-toggle-color-picker button:hover{border-color:#e9e6e0!important;border:none;outline-offset:-1px!important;outline:1px solid rgb(200.993902439,194.6402439024,178.756097561)!important}.msp-plugin .msp-toggle-color-picker .msp-color-picker{position:absolute;z-index:100000;background:#eeece7;border-top:1px solid #eeece7;padding-bottom:5px;width:100%}.msp-plugin .msp-toggle-color-picker-above .msp-color-picker{top:-85px;height:85px}.msp-plugin .msp-toggle-color-picker-below .msp-color-picker{top:32px;height:80px}.msp-plugin .msp-control-offset{padding-left:10px}.msp-plugin .msp-accent-offset{padding-left:1px;margin-left:8px;border-left:2px solid rgb(232.5914634146,139.3719512195,56.9085365854)}.msp-plugin .msp-control-group-wrapper{margin-bottom:0;margin-top:1px}.msp-plugin .msp-control-group-header{background:#eeece7}.msp-plugin .msp-control-group-header>button,.msp-plugin .msp-control-group-header div{padding-left:4px;text-align:left;height:24px!important;line-height:24px!important;font-size:85%!important;background:#eeece7!important;color:#63533c}.msp-plugin .msp-control-group-header .msp-icon{height:24px!important;line-height:24px!important}.msp-plugin .msp-control-group-header>span{padding-left:5px;line-height:21.3333333333px;font-size:70%;background:#eeece7;color:#63533c}.msp-plugin .msp-control-current{background:#eeece7}.msp-plugin .msp-control-group-footer{background:#e3e0d8;height:5px;font-size:1px;margin-top:1px}.msp-plugin .msp-control-group-expander{display:block;position:absolute;line-height:32px;padding:0;left:0;top:0;width:120px;text-align:left;background:transparent}.msp-plugin .msp-control-group-expander .msp-icon{line-height:29px;width:31px;text-align:center;font-size:100%}.msp-plugin .msp-plugin-layout_controls{position:absolute;left:10px;top:10px}.msp-plugin .msp-plugin-layout_controls>button:first-child{margin-right:6px}.msp-plugin .msp-empty-control{display:none}.msp-plugin .msp-control .msp-btn-block,.msp-plugin .msp-control .msp-control-row button,.msp-plugin .msp-control-row .msp-control button{margin-bottom:0;margin-top:0}.msp-plugin .msp-row-text{height:32px;position:relative;background:#eeece7;margin-top:1px}.msp-plugin .msp-row-text>div{line-height:32px;text-align:center;color:#63533c}.msp-plugin .msp-help span{display:none}.msp-plugin .msp-help:hover span{display:inline-block;background:linear-gradient(#eeece7,#eeece7cc)}.msp-plugin .msp-help-text{position:relative;background:#eeece7;margin-top:1px}.msp-plugin .msp-help-text>div{padding:5px 10px;text-align:left;color:#63533c}.msp-plugin .msp-help-text>p{padding:5px 10px;text-align:left;color:#63533c}.msp-plugin .msp-help-description{font-style:italic}.msp-plugin .msp-help-legend{padding-top:10px}.msp-plugin .msp-scale-legend>div{width:100%;height:30px}.msp-plugin .msp-scale-legend>div>span{padding:5px;color:#fff;font-weight:700;background-color:#0003}.msp-plugin .msp-table-legend>div{margin-right:5px;display:inline-flex}.msp-plugin .msp-table-legend>div .msp-table-legend-color{width:30px;height:20px}.msp-plugin .msp-table-legend>div .msp-table-legend-text{margin:0 5px}.msp-plugin .msp-image-preview{position:relative;background:#eeece7;margin-top:1px;padding:10px}.msp-plugin .msp-image-preview canvas{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.msp-plugin .msp-image-preview>span{margin-top:6px;display:block;text-align:center;font-size:80%;line-height:15px}.msp-plugin .msp-copy-image-wrapper{position:relative}.msp-plugin .msp-copy-image-wrapper div{font-weight:700;padding:3px;margin:1px 0;width:100%;background:#f3f2ee;text-align:center}.msp-plugin .msp-copy-image-wrapper img{margin-top:1px}.msp-plugin .msp-control-text-area-wrapper,.msp-plugin .msp-text-area-wrapper{position:relative}.msp-plugin .msp-control-text-area-wrapper textarea,.msp-plugin .msp-text-area-wrapper textarea{border:none;width:100%;height:100%;background:#f3f2ee;padding:5px 10px;resize:none;font-size:12px;line-height:16px}.msp-plugin .msp-control-text-area-wrapper{height:64px!important}.msp-plugin .msp-text-area-wrapper{height:96px!important}.msp-plugin .msp-help-row{position:relative;height:32px;background:#eeece7;margin-top:1px;display:table;width:100%}.msp-plugin .msp-help-row>span{width:120px;text-align:right;padding:3px 10px;color:#63533c;display:table-cell;font-weight:700;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;cursor:default}.msp-plugin .msp-help-row>div{background:#f3f2ee;position:relative;padding:3px 10px;display:table-cell}.msp-plugin .msp-canvas{width:100%;height:100%;background-color:#f3f2ee}.msp-plugin .msp-canvas text{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.msp-plugin .msp-canvas circle{stroke:#000;stroke-width:10;stroke-opacity:.3}.msp-plugin .msp-canvas circle:hover{fill:#ae5d04;stroke:#000;stroke-width:10px}.msp-plugin .msp-canvas .info{fill:#fff;stroke:#000;stroke-width:3}.msp-plugin .msp-canvas .show{visibility:visible}.msp-plugin .msp-canvas .hide{visibility:hidden}.msp-plugin .msp-canvas .delete-button rect{fill:#ed4337;stroke:#000}.msp-plugin .msp-canvas .delete-button text{stroke:#fff;fill:#fff}.msp-plugin .msp-canvas .delete-button:hover{stroke:#000;stroke-width:3;fill:#ff6961}.msp-plugin .msp-canvas .infoCircle:hover{fill:#4c66b2}.msp-plugin .msp-canvas:focus{outline:none}.msp-plugin .msp-log-wrap{position:absolute;inset:0;overflow:hidden}.msp-plugin .msp-log{position:absolute;inset:0 -20px 0 0;overflow-y:scroll;overflow-x:hidden;font-size:90%;background:#e0ddd4}.msp-plugin .msp-log{font-size:90%}.msp-plugin .msp-log ul{padding:0;margin:0}.msp-plugin .msp-log{color:#433829}.msp-plugin .msp-log li{clear:both;margin:0;background:#eeece7;position:relative}.msp-plugin .msp-log li:not(:last-child){border-bottom:1px solid rgb(206.2804878049,200.5487804878,186.2195121951)}.msp-plugin .msp-log .msp-log-entry{margin-left:110px;background:#ebe8e3;padding:3px 25px 3px 10px}.msp-plugin .msp-log .msp-log-timestamp{padding:3px 10px;float:left;text-align:right;width:110px;color:#726046;font-size:100%}.msp-plugin .msp-log .msp-log-timestamp small{font-size:100%}.msp-plugin .msp-log .label{margin-top:-3px;font-size:7pt}.msp-plugin .msp-log-entry-badge{position:absolute;left:0;top:0;bottom:0;width:6px}.msp-plugin .msp-log-entry-message{background:#0cca5d}.msp-plugin .msp-log-entry-info{background:#5e3673}.msp-plugin .msp-log-entry-error{background:#fd354b}.msp-plugin .msp-log-entry-warning{background:#fcc937}.msp-plugin .msp-slider-base{position:relative;height:14px;padding:5px 0;width:100%;border-radius:6px;align-self:center;box-sizing:border-box;-webkit-tap-highlight-color:rgba(0,0,0,0)}.msp-plugin .msp-slider-base *{box-sizing:border-box;-webkit-tap-highlight-color:rgba(0,0,0,0)}.msp-plugin .msp-slider-base-rail{position:absolute;width:100%;background-color:#e0ddd4;height:4px;border-radius:2px}.msp-plugin .msp-slider-base-track{position:absolute;left:0;height:4px;border-radius:6px;background-color:tint(#332b1f,60%)}.msp-plugin .msp-slider-base-handle{position:absolute;margin-left:-11px;margin-top:-9px;width:22px;height:22px;cursor:pointer;border-radius:50%;background-color:#332b1f;border:4px solid rgb(224.2548780488,220.637804878,211.5951219512)}.msp-plugin .msp-slider-base-handle:hover{background-color:#ae5d04}.msp-plugin .msp-slider-base-mark{position:absolute;top:18px;left:0;width:100%;font-size:12px}.msp-plugin .msp-slider-base-mark-text{position:absolute;display:inline-block;vertical-align:middle;text-align:center;cursor:pointer;color:#999}.msp-plugin .msp-slider-base-mark-text-active{color:#666}.msp-plugin .msp-slider-base-step{position:absolute;width:100%;height:4px;background:transparent}.msp-plugin .msp-slider-base-dot{position:absolute;bottom:-2px;margin-left:-4px;width:8px;height:8px;border:2px solid #e9e9e9;background-color:#fff;cursor:pointer;border-radius:50%;vertical-align:middle}.msp-plugin .msp-slider-base-dot:first-child{margin-left:-4px}.msp-plugin .msp-slider-base-dot:last-child{margin-left:-4px}.msp-plugin .msp-slider-base-dot-active{border-color:tint(#332b1f,50%)}.msp-plugin .msp-slider-base-disabled{background:#eeece7;opacity:.35}.msp-plugin .msp-slider-base-disabled .msp-slider-base-handle,.msp-plugin .msp-slider-base-disabled .msp-slider-base-dot{cursor:not-allowed}.msp-plugin .msp-slider-base-disabled .msp-slider-base-mark-text,.msp-plugin .msp-slider-base-disabled .msp-slider-base-dot{cursor:not-allowed!important}.msp-plugin .msp-markdown table{border:1px solid rgb(206.2804878049,200.5487804878,186.2195121951);border-collapse:collapse}.msp-plugin .msp-markdown th{text-align:left}.msp-plugin .msp-markdown th,.msp-plugin .msp-markdown td{border:1px solid rgb(206.2804878049,200.5487804878,186.2195121951);padding:4px 8px}.msp-plugin .msp-markdown img{max-width:100%;height:auto}.msp-plugin .msp-description{padding:10px;font-size:85%;background:#eeece7;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;font-weight:light;cursor:default}.msp-plugin .msp-description:not(:first-child){border-top:1px solid rgb(224.2548780488,220.637804878,211.5951219512)}.msp-plugin .msp-color-picker input{color:#000!important}.msp-plugin .msp-no-webgl{position:absolute;width:100%;height:100%;left:0;top:0;display:table;text-align:center;background:#eeece7}.msp-plugin .msp-no-webgl>div b{font-size:120%}.msp-plugin .msp-no-webgl>div{display:table-cell;vertical-align:middle;text-align:center;width:100%;height:100%}.msp-plugin .msp-loader-msp-btn-file{position:relative;overflow:hidden}.msp-plugin .msp-loader-msp-btn-file input[type=file]{position:absolute;top:0;right:0;min-width:100%;min-height:100%;font-size:100px;text-align:right;filter:alpha(opacity=0);opacity:0;outline:none;background:#fff;cursor:inherit;display:block}.msp-plugin .msp-controls-section{margin-bottom:10px}.msp-plugin .msp-combined-color-button{border:4px solid rgb(243.2865853659,241.9085365854,238.4634146341)!important;margin:0;text-align:center;padding-right:10px;padding-left:10px}.msp-plugin .msp-combined-color-button:hover{border-color:#e9e6e0!important;border:none;outline-offset:-1px!important;outline:1px solid rgb(200.993902439,194.6402439024,178.756097561)!important}.msp-plugin .msp-combined-color-swatch{width:100%;display:grid;grid-gap:1px;grid-template-columns:repeat(6,auto)}.msp-plugin .msp-combined-color-swatch .msp-btn:hover,.msp-plugin .msp-combined-color-swatch .msp-control-row button:hover,.msp-plugin .msp-control-row .msp-combined-color-swatch button:hover{outline-offset:-1px!important;outline:1px solid rgb(200.993902439,194.6402439024,178.756097561)!important}.msp-plugin .msp-action-select{position:relative}.msp-plugin .msp-action-select select{padding-left:42px}.msp-plugin .msp-action-select option:first-child{color:#63533c}.msp-plugin .msp-action-select>.msp-icon{display:block;top:0;left:10px;position:absolute;line-height:32px}.msp-plugin .msp-simple-help-section{height:28px;line-height:28px;margin-top:5px;margin-bottom:5px;padding:0 10px;font-weight:500;background:#eeece7;color:#332b1f}.msp-plugin .msp-left-panel-controls-buttons{position:absolute;width:32px;top:0;bottom:0;padding-top:10px;background:#eeece7}.msp-plugin .msp-left-panel-controls-buttons-bottom{position:absolute;bottom:0}.msp-plugin .msp-left-panel-controls-button-data-dirty{position:absolute;width:6px;height:6px;background:#e98b39;border-radius:3px;right:6px;bottom:6px}.msp-plugin .msp-left-panel-controls .msp-scrollable-container{left:33px}.msp-plugin .msp-mapped-parameter-group{position:relative}.msp-plugin .msp-mapped-parameter-group>.msp-control-row:first-child>div:nth-child(2){right:33px}.msp-plugin .msp-mapped-parameter-group>button:first-child{right:33px}.msp-plugin .msp-mapped-parameter-group>.msp-btn-icon{position:absolute;right:0;width:32px;top:0;padding:0}.msp-plugin .msp-shape-filled{fill:#332b1f;stroke:#332b1f}.msp-plugin .msp-shape-empty{fill:none;stroke:#332b1f}.msp-plugin .msp-no-overflow{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.msp-plugin .msp-25-lower-contrast-text{color:#826e4f}.msp-plugin .msp-expandable-group-color-stripe{position:absolute;left:0;top:30px;width:120px;height:2px}.msp-plugin .msp-section-header{height:32px;line-height:32px;margin-top:10px;margin-bottom:10px;text-align:right;padding:0 10px;font-weight:700;background:#eeece7;overflow:hidden;cursor:default}.msp-plugin .msp-section-header>.msp-icon{display:block;float:left}.msp-plugin .msp-section-header>small{font-weight:400}.msp-plugin .msp-current-header{height:32px;line-height:32px;margin-bottom:10px;text-align:center;font-weight:700;background:#eeece7}.msp-plugin .msp-flex-row,.msp-plugin .msp-state-image-row{margin-top:1px;background:#eeece7;display:flex;flex-direction:row;width:inherit;height:32px}.msp-plugin .msp-flex-row>.msp-flex-item,.msp-plugin .msp-state-image-row>.msp-flex-item{margin:0 1px 0 0;flex:1 1 auto;overflow:hidden}.msp-plugin .msp-flex-row>.msp-flex-item:last-child,.msp-plugin .msp-state-image-row>.msp-flex-item:last-child{margin-right:0}.msp-plugin .msp-flex-row>select,.msp-plugin .msp-state-image-row>select,.msp-plugin .msp-flex-row>button,.msp-plugin .msp-state-image-row>button{margin:0 1px 0 0;flex:1 1 auto;height:32px;overflow:hidden}.msp-plugin .msp-flex-row .msp-btn-icon,.msp-plugin .msp-state-image-row .msp-btn-icon,.msp-plugin .msp-flex-row .msp-btn-icon-small,.msp-plugin .msp-state-image-row .msp-btn-icon-small{flex:0 0 32px;max-width:32px}.msp-plugin .msp-flex-row>select,.msp-plugin .msp-state-image-row>select{background:none}.msp-plugin .msp-flex-row>select>option[value=_],.msp-plugin .msp-state-image-row>select>option[value=_]{display:none}.msp-plugin .msp-flex-row>select:last-child,.msp-plugin .msp-state-image-row>select:last-child,.msp-plugin .msp-flex-row>button:last-child,.msp-plugin .msp-state-image-row>button:last-child{margin-right:0}.msp-plugin .msp-flex-row>button.msp-control-button-label,.msp-plugin .msp-state-image-row>button.msp-control-button-label{background:#eeece7}.msp-plugin .msp-state-list{list-style:none}.msp-plugin .msp-state-list>li{position:relative;overflow:hidden}.msp-plugin .msp-state-list>li>button:first-child{text-align:left;border-left:10px solid rgb(212.6243902439,207.6390243902,195.1756097561)!important}.msp-plugin .msp-state-list>li>div{position:absolute;right:0;top:0}.msp-plugin .msp-state-image-row{height:96px;margin-top:0}.msp-plugin .msp-state-image-row>button{height:96px;padding:0}.msp-plugin .msp-state-image-row>button>img{min-height:96px;width:inherit;transform:translateY(-50%);top:50%;position:relative}.msp-plugin .msp-tree-row{position:relative;margin-top:0;margin-bottom:1px;background:transparent}.msp-plugin .msp-tree-row-current .msp-btn-tree-label>span{font-weight:700}.msp-plugin .msp-tree-row-current .msp-btn-tree-label{border-radius:0!important}.msp-plugin .msp-tree-row .msp-btn-tree-label{text-align:left;border-radius:0 0 0 8px;border-left-width:4px;border-left-style:solid}.msp-plugin .msp-tree-row .msp-btn-tree-label>small{color:#726046}.msp-plugin .msp-tree-updates-wrapper .msp-control-group-header:last-child{margin-bottom:1px}.msp-plugin .msp-viewport-top-left-controls{position:absolute;left:10px;top:10px}.msp-plugin .msp-viewport-top-left-controls .msp-traj-controls{line-height:32px;float:left;margin-right:10px;background-color:#f3f2ee}.msp-plugin .msp-viewport-top-left-controls .msp-traj-controls>span{color:#332b1f;margin-left:10px;margin-right:10px;font-size:85%;display:inline-block}.msp-plugin .msp-viewport-top-left-controls .msp-state-snapshot-viewport-controls{line-height:32px;float:left;margin-right:10px}.msp-plugin .msp-viewport-top-left-controls .msp-state-snapshot-viewport-controls>button{background-color:#f3f2ee}.msp-plugin .msp-viewport-top-left-controls .msp-state-snapshot-viewport-controls>select{display:inline-block;width:200px;margin-right:10px}.msp-plugin .msp-viewport-top-left-controls .msp-state-snapshot-animation-slider{position:relative;display:inline-block;width:120px;line-height:32px}.msp-plugin .msp-viewport-top-left-controls .msp-state-snapshot-animation-button{margin-left:10px}.msp-plugin .msp-viewport-top-left-controls .msp-animation-viewport-controls{line-height:32px;float:left;margin-right:10px;position:relative}.msp-plugin .msp-viewport-top-left-controls .msp-animation-viewport-controls>div:first-child{position:relative;display:inline-block}.msp-plugin .msp-viewport-top-left-controls .msp-animation-viewport-controls>div:first-child>button{position:relative}.msp-plugin .msp-viewport-top-left-controls .msp-animation-viewport-controls .msp-animation-viewport-controls-select{width:290px;position:absolute;left:0;margin-top:10px;background:#e0ddd4;z-index:10001}.msp-plugin .msp-viewport-top-left-controls .msp-animation-viewport-controls .msp-animation-viewport-controls-select .msp-control-row:first-child{margin-top:0}.msp-plugin .msp-selection-viewport-controls{position:relative;margin:10px auto 0;width:430px}.msp-plugin .msp-selection-viewport-controls-actions{position:absolute;width:100%;top:32px;background:#e0ddd4}.msp-plugin .msp-selection-viewport-controls>.msp-flex-row .msp-btn,.msp-plugin .msp-selection-viewport-controls>.msp-state-image-row .msp-btn,.msp-plugin .msp-selection-viewport-controls>.msp-flex-row .msp-control-row button,.msp-plugin .msp-control-row .msp-selection-viewport-controls>.msp-flex-row button,.msp-plugin .msp-selection-viewport-controls>.msp-state-image-row .msp-control-row button,.msp-plugin .msp-control-row .msp-selection-viewport-controls>.msp-state-image-row button{padding:0 5px}.msp-plugin .msp-selection-viewport-controls select.msp-form-control,.msp-plugin .msp-selection-viewport-controls select.msp-btn,.msp-plugin .msp-selection-viewport-controls .msp-control-row select,.msp-plugin .msp-control-row .msp-selection-viewport-controls select{padding:0 5px;text-align:center;background:#f3f2ee;flex:0 0 80px;text-overflow:ellipsis}.msp-plugin .msp-param-object-list-item{margin-top:1px;position:relative}.msp-plugin .msp-param-object-list-item>button{text-align:left}.msp-plugin .msp-param-object-list-item>button>span{font-weight:700}.msp-plugin .msp-param-object-list-item>div{position:absolute;right:0;top:0}.msp-plugin .msp-state-actions .msp-transform-wrapper:last-child{margin-bottom:10px}.msp-plugin .msp-button-row{display:flex;flex-direction:row;height:32px;width:inherit}.msp-plugin .msp-button-row>button{margin:0 1px 0 0;flex:1 1 auto;height:32px;text-align-last:center;background:none;padding:0 10px;overflow:hidden}.msp-plugin .msp-action-menu-options-no-header,.msp-plugin .msp-action-menu-options .msp-control-group-children{max-height:300px;overflow:hidden;overflow-y:auto}.msp-plugin .msp-action-menu-options .msp-control-row,.msp-plugin .msp-action-menu-options button,.msp-plugin .msp-action-menu-options .msp-icon,.msp-plugin .msp-action-menu-options .msp-flex-row,.msp-plugin .msp-action-menu-options .msp-state-image-row{height:24px;line-height:24px}.msp-plugin .msp-action-menu-options button{text-align:left}.msp-plugin .msp-action-menu-options .msp-action-menu-button{margin-top:1px;display:flex}.msp-plugin .msp-action-menu-options .msp-action-menu-button .msp-icon{margin-right:6px}.msp-plugin .msp-representation-entry{position:relative}.msp-plugin .msp-representation-entry>.msp-control-group-header>.msp-btn,.msp-plugin .msp-control-row .msp-representation-entry>.msp-control-group-header>button{font-weight:700}.msp-plugin .msp-representation-entry>.msp-control-group-header>.msp-icon,.msp-plugin .msp-representation-entry>.msp-control-group-header>.msp-btn-link{line-height:24px;height:24px}.msp-plugin .msp-control-group-presets-wrapper{position:absolute;right:0;top:0}.msp-plugin .msp-control-group-presets-wrapper .msp-control-group-header{background:transparent}.msp-plugin .msp-control-group-presets-wrapper button{background:transparent!important}.msp-plugin .msp-parameter-matrix input{flex:1 1 auto;min-width:0}.msp-plugin .msp-btn-apply-simple{text-align:left}.msp-plugin .msp-btn-apply-simple .msp-icon{margin-right:10px}.msp-plugin .msp-type-class-Root{border-left-color:#eeece7}.msp-plugin .msp-type-class-Group{border-left-color:#e98b39}.msp-plugin .msp-type-class-Data{border-left-color:#bfc8c9}.msp-plugin .msp-type-class-Object{border-left-color:#54d98c}.msp-plugin .msp-type-class-Representation3D{border-left-color:#4aa3df}.msp-plugin .msp-type-class-Behavior{border-left-color:#b07cc6}.msp-plugin .msp-accent-color-cyan{color:#bfc8c9}.msp-plugin .msp-accent-bg-cyan{background:#bfc8c9}.msp-plugin .msp-transform-header-brand-cyan{border-bottom:1px solid rgb(190.5846153846,200.3076923077,200.9153846154)}.msp-plugin .msp-transform-header-brand-cyan:active,.msp-plugin .msp-transform-header-brand-cyan:focus{border-bottom:1px solid rgb(190.5846153846,200.3076923077,200.9153846154)}.msp-plugin .msp-accent-color-red{color:#ef8b80}.msp-plugin .msp-accent-bg-red{background:#ef8b80}.msp-plugin .msp-transform-header-brand-red{border-bottom:1px solid rgb(239.3835616438,138.5273972603,128.1164383562)}.msp-plugin .msp-transform-header-brand-red:active,.msp-plugin .msp-transform-header-brand-red:focus{border-bottom:1px solid rgb(239.3835616438,138.5273972603,128.1164383562)}.msp-plugin .msp-accent-color-gray{color:#46637f}.msp-plugin .msp-accent-bg-gray{background:#46637f}.msp-plugin .msp-transform-header-brand-gray{border-bottom:1px solid rgb(70.1643835616,98.5,126.8356164384)}.msp-plugin .msp-transform-header-brand-gray:active,.msp-plugin .msp-transform-header-brand-gray:focus{border-bottom:1px solid rgb(70.1643835616,98.5,126.8356164384)}.msp-plugin .msp-accent-color-green{color:#54d98c}.msp-plugin .msp-accent-bg-green{background:#54d98c}.msp-plugin .msp-transform-header-brand-green{border-bottom:1px solid rgb(84.456,216.544,140.468)}.msp-plugin .msp-transform-header-brand-green:active,.msp-plugin .msp-transform-header-brand-green:focus{border-bottom:1px solid rgb(84.456,216.544,140.468)}.msp-plugin .msp-accent-color-purple{color:#b07cc6}.msp-plugin .msp-accent-bg-purple{background:#b07cc6}.msp-plugin .msp-transform-header-brand-purple{border-bottom:1px solid rgb(176.3389121339,124.4225941423,197.5774058577)}.msp-plugin .msp-transform-header-brand-purple:active,.msp-plugin .msp-transform-header-brand-purple:focus{border-bottom:1px solid rgb(176.3389121339,124.4225941423,197.5774058577)}.msp-plugin .msp-accent-color-blue{color:#4aa3df}.msp-plugin .msp-accent-bg-blue{background:#4aa3df}.msp-plugin .msp-transform-header-brand-blue{border-bottom:1px solid rgb(73.6589958159,162.989539749,222.8410041841)}.msp-plugin .msp-transform-header-brand-blue:active,.msp-plugin .msp-transform-header-brand-blue:focus{border-bottom:1px solid rgb(73.6589958159,162.989539749,222.8410041841)}.msp-plugin .msp-accent-color-orange{color:#e98b39}.msp-plugin .msp-accent-bg-orange{background:#e98b39}.msp-plugin .msp-transform-header-brand-orange{border-bottom:1px solid rgb(232.5914634146,139.3719512195,56.9085365854)}.msp-plugin .msp-transform-header-brand-orange:active,.msp-plugin .msp-transform-header-brand-orange:focus{border-bottom:1px solid rgb(232.5914634146,139.3719512195,56.9085365854)}.msp-plugin .msp-volume-channel-inline-controls>:first-child{position:absolute;left:0;top:0;height:32px;right:32px}.msp-plugin .msp-volume-channel-inline-controls .msp-slider>div:first-child{right:42px}.msp-plugin .msp-volume-channel-inline-controls .msp-slider>div:last-child{width:30px}.msp-plugin .msp-volume-channel-inline-controls>button{position:absolute;right:0;width:32px;top:0;padding:0}.msp-plugin .msp-volume-channel-inline-controls>button .msp-material-icon{margin-right:0}.msp-plugin .msp-list-unstyled{padding-left:0;list-style:none}.msp-plugin .msp-drag-drop-overlay{border:12px dashed #332b1f;background:#0000005c;display:flex;align-items:center;justify-content:center;position:absolute;inset:0;font-size:48px;font-weight:700}.msp-plugin .msp-task-state{line-height:32px}.msp-plugin .msp-task-state>span{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;cursor:default}.msp-plugin .msp-overlay-tasks{position:absolute;display:flex;inset:0;height:100%;width:100%;z-index:1000;justify-content:center;align-items:center;background:#00000040}.msp-plugin .msp-overlay-tasks .msp-task-state>div{height:32px;margin-top:1px;position:relative;width:100%;background:#eeece7}.msp-plugin .msp-overlay-tasks .msp-task-state>div>div{height:32px;line-height:32px;display:inline-block;padding:0 10px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;cursor:default;white-space:nowrap;background:#eeece7;position:absolute}.msp-plugin .msp-overlay-tasks .msp-task-state>div>button{display:inline-block;margin-top:-3px}.msp-plugin .msp-background-tasks{position:absolute;left:0;bottom:0;z-index:1000}.msp-plugin .msp-background-tasks .msp-task-state>div{height:32px;margin-top:1px;position:relative;width:100%;background:#eeece7}.msp-plugin .msp-background-tasks .msp-task-state>div>div{height:32px;line-height:32px;display:inline-block;padding:0 10px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;cursor:default;white-space:nowrap;background:#eeece7;position:absolute}.msp-plugin .msp-background-tasks .msp-task-state>div>button{display:inline-block;margin-top:-3px}.msp-plugin .msp-viewport{position:absolute;inset:0;background:#eeece7}.msp-plugin .msp-viewport .msp-btn-link{background:#0003}.msp-plugin .msp-viewport-expanded{position:fixed;z-index:1000}.msp-plugin .msp-viewport-controls{position:absolute;right:10px;top:10px;width:32px}.msp-plugin .msp-viewport-controls-buttons{text-align:right;position:relative}.msp-plugin .msp-viewport-controls-buttons>div{position:relative;margin-bottom:4px}.msp-plugin .msp-viewport-controls-buttons button{padding:0;text-align:center;width:32px;position:relative}.msp-plugin .msp-viewport-controls-buttons .msp-btn-link-toggle-off{color:#9c835f}.msp-plugin .msp-viewport-controls-buttons .msp-btn-link:hover{color:#ae5d04}.msp-plugin .msp-semi-transparent-background{background:#eeece7;opacity:.5;position:absolute;top:0;left:0;width:100%;height:100%}.msp-plugin .msp-hover-box-wrapper{position:relative}.msp-plugin .msp-hover-box-wrapper .msp-hover-box-body{visibility:hidden;position:absolute;right:36px;top:0;width:100px;background-color:#eeece7}.msp-plugin .msp-hover-box-wrapper .msp-hover-box-spacer{visibility:hidden;position:absolute;right:32px;top:0;width:4px;height:32px}.msp-plugin .msp-hover-box-wrapper:hover .msp-hover-box-body,.msp-plugin .msp-hover-box-wrapper:hover .msp-hover-box-spacer{visibility:visible}.msp-plugin .msp-viewport-controls-panel{width:290px;top:0;right:36px;position:absolute;background:#e0ddd4}.msp-plugin .msp-viewport-controls-panel .msp-control-group-wrapper:first-child{padding-top:0}.msp-plugin .msp-viewport-controls-panel .msp-viewport-controls-panel-controls{overflow-y:auto;max-height:400px}.msp-plugin .msp-highlight-toast-wrapper{position:absolute;right:10px;bottom:10px;max-width:95%;z-index:10000}.msp-plugin .msp-highlight-info{color:#ae5d04;padding:3px 10px;background:#eeece7;opacity:90%;max-width:400px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;cursor:default}.msp-plugin .msp-highlight-markdown-row{padding-left:10px}.msp-plugin .msp-highlight-simple-row{text-align:right}.msp-plugin .msp-highlight-info-hr{margin-inline:0px;margin-block:3px;border:none;height:1px;background-color:#ae5d04}.msp-plugin .msp-highlight-info-additional{font-size:85%;display:inline-block;color:#fa911e}.msp-plugin .msp-snapshot-description-wrapper{background:#eeece780;position:absolute;left:0;top:42px;padding:6.6px 10px;max-height:224px;overflow:hidden;overflow-y:auto;width:max-content;max-width:400px}.msp-plugin .msp-snapshot-description-wrapper a{text-decoration:underline;cursor:pointer;color:#332b1f}.msp-plugin .msp-snapshot-description-wrapper ul,.msp-plugin .msp-snapshot-description-wrapper ol{padding-left:14px}.msp-plugin .msp-sequence{position:absolute;inset:0;background:#eeece7}.msp-plugin .msp-sequence-select{position:relative;height:24px;width:100%;margin-bottom:1px;background:#e0ddd4;text-align:left}.msp-plugin .msp-sequence-select>span{display:inline-block;line-height:24px;padding:0 10px;font-size:85%;font-weight:700;cursor:default}.msp-plugin .msp-sequence-select>select{display:inline-block;max-width:120px;width:auto;text-overflow:ellipsis;font-size:85%;height:24px;line-height:24px;background-size:6px 8px;background-color:#e0ddd4}.msp-plugin .msp-sequence-wrapper{word-break:break-word;padding:10px 10px 3px;user-select:none}.msp-plugin .msp-sequence-wrapper-non-empty{font-size:85%;line-height:180%;font-family:Courier New,monospace;background:#f3f2ee;width:100%;overflow-y:auto;overflow-x:hidden;position:absolute;inset:25px 0 0}.msp-plugin .msp-sequence-chain-label{margin-left:10px;margin-top:10px;user-select:none;color:#ae5d04;font-size:90%;line-height:90%;padding-left:.2em}.msp-plugin .msp-sequence-wrapper span{cursor:pointer}.msp-plugin .msp-sequence-wrapper .msp-sequence-residue-long{margin:0 .2em}.msp-plugin .msp-sequence-wrapper .msp-sequence-residue-long-begin{margin:0 .2em 0 0}.msp-plugin .msp-sequence-wrapper .msp-sequence-residue-focused{font-weight:700;text-decoration:underline}.msp-plugin .msp-sequence-wrapper .msp-sequence-label{color:#ae5d04;font-size:90%;line-height:90%;padding-bottom:1em;padding-left:.2em}.msp-plugin .msp-sequence-wrapper .msp-sequence-number{color:#ae5d04;word-break:keep-all;cursor:default;position:relative;top:-1.1em;left:3.1em;padding:0;margin-left:-3em;font-size:80%;pointer-events:none}.msp-plugin .msp-sequence-wrapper .msp-sequence-number-long{left:3.3em}.msp-plugin .msp-sequence-wrapper .msp-sequence-number-long-negative{left:2.7em}.msp-plugin .msp-sequence-wrapper .msp-sequence-number-negative{left:2.5em}.msp-plugin .msp-sequence-wrapper .msp-sequence-present{color:#332b1f}.msp-plugin .msp-sequence-wrapper .msp-sequence-missing{color:#b4a184;cursor:default}.msp-plugin .msp-transformer .msp-entity-badge{position:absolute;top:0;right:0;height:32px;line-height:32px;width:32px}.msp-plugin .msp-layout-right,.msp-plugin .msp-layout-left{background:#e0ddd4}.msp-plugin .msp-transformer-wrapper{position:relative}.msp-plugin .msp-transformer-wrapper .msp-entity-badge{left:0;top:0}.msp-plugin .msp-transformer-wrapper:first-child .msp-panel-description-content{top:33px}.msp-plugin .msp-transformer-wrapper:not(:first-child) .msp-panel-description-content{bottom:33px}.msp-plugin .msp-transform-wrapper{margin-bottom:10px}.msp-plugin .msp-transform-wrapper-collapsed,.msp-plugin .msp-transform-update-wrapper,.msp-plugin .msp-transform-update-wrapper-collapsed{margin-bottom:1px}.msp-plugin .msp-transform-update-wrapper>.msp-transform-header>button,.msp-plugin .msp-transform-update-wrapper-collapsed>.msp-transform-header>button{text-align:left;padding-left:32px;line-height:24px;background:#e9e6e0}.msp-plugin .msp-transform-wrapper>.msp-transform-header>button{text-align:left;background:#eeece7;font-weight:700;padding-right:5px}.msp-plugin .msp-transform-header{position:relative}.msp-plugin .msp-transform-header>button>small{font-weight:400;float:right}.msp-plugin .msp-transform-header>button>span:first-child{margin-right:10px}.msp-plugin .msp-transform-header>button:hover{color:#63533c}.msp-plugin .msp-transform-header-brand{margin-bottom:-1px}.msp-plugin .msp-transform-header-brand svg{fill:#332b1f;stroke:#332b1f}.msp-plugin .msp-transform-default-params{background:#eeece7;position:absolute;left:0;top:0;width:32px;padding:0}.msp-plugin .msp-transform-default-params:hover{background:#fff}.msp-plugin .msp-transform-apply-wrap{position:relative;margin-top:1px;width:100%;height:32px}.msp-plugin .msp-transform-refresh{width:87px;margin-left:33px;background:#eeece7;text-align:right}.msp-plugin .msp-transform-apply{display:block;position:absolute;left:120px;right:0;top:0}.msp-plugin .msp-transform-apply-wider{margin-left:33px}.msp-plugin .msp-data-beh{margin:10px 0!important}.msp-plugin .msp-toast-container{position:relative;z-index:1001}.msp-plugin .msp-toast-container .msp-toast-entry{color:#332b1f;background:#e0ddd4;position:relative;float:right;min-height:32px;margin-top:10px;border:1px solid rgb(206.2804878049,200.5487804878,186.2195121951);display:table}.msp-plugin .msp-toast-container .msp-toast-entry .msp-toast-title{height:100%;line-height:32px;padding:0 10px;background:#eeece7;font-weight:700;display:table-cell;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;font-weight:light;cursor:pointer}.msp-plugin .msp-toast-container .msp-toast-entry .msp-toast-message{padding:3px 42px 3px 10px;display:table-cell}.msp-plugin .msp-toast-container .msp-toast-entry .msp-toast-message a{text-decoration:none;color:#974102;font-weight:700}.msp-plugin .msp-toast-container .msp-toast-entry .msp-toast-message a:hover{text-decoration:underline;color:#fc6c03}.msp-plugin .msp-toast-container .msp-toast-entry .msp-toast-message a:active,.msp-plugin .msp-toast-container .msp-toast-entry .msp-toast-message a:focus{color:#974102;outline-offset:0;outline:none}.msp-plugin .msp-toast-container .msp-toast-entry .msp-toast-hide{position:absolute;width:42px;right:0;top:0;bottom:0}.msp-plugin .msp-toast-container .msp-toast-entry .msp-toast-hide .msp-btn-icon{background:transparent;position:absolute;inset:1px 0 0;width:100%;text-align:right;padding-right:5px}.msp-plugin .msp-logo{display:block;position:absolute;bottom:10px;right:10px;height:32px;width:100px;background-repeat:no-repeat;background-position:bottom right;background-size:auto;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFcAAAAgCAYAAABn7+QVAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAACHDwAAjA8AAP1SAACBQAAAfXkAAOmLAAA85QAAGcxzPIV3AAAKL2lDQ1BJQ0MgUHJvZmlsZQAASMedlndUVNcWh8+9d3qhzTACUobeu8AA0nuTXkVhmBlgKAMOMzSxIaICEUVEmiJIUMSA0VAkVkSxEBRUsAckCCgxGEVULG9G1ouurLz38vL746xv7bP3ufvsvc9aFwCSpy+XlwZLAZDKE/CDPJzpEZFRdOwAgAEeYIApAExWRrpfsHsIEMnLzYWeIXICXwQB8HpYvAJw09AzgE4H/5+kWel8geiYABGbszkZLBEXiDglS5Auts+KmBqXLGYYJWa+KEERy4k5YZENPvsssqOY2ak8tojFOaezU9li7hXxtkwhR8SIr4gLM7mcLBHfErFGijCVK+I34thUDjMDABRJbBdwWIkiNhExiR8S5CLi5QDgSAlfcdxXLOBkC8SXcklLz+FzExIFdB2WLt3U2ppB9+RkpXAEAsMAJiuZyWfTXdJS05m8HAAW7/xZMuLa0kVFtjS1trQ0NDMy/apQ/3Xzb0rc20V6Gfi5ZxCt/4vtr/zSGgBgzIlqs/OLLa4KgM4tAMjd+2LTOACApKhvHde/ug9NPC+JAkG6jbFxVlaWEZfDMhIX9A/9T4e/oa++ZyQ+7o/y0F058UxhioAurhsrLSVNyKdnpDNZHLrhn4f4Hwf+dR4GQZx4Dp/DE0WEiaaMy0sQtZvH5gq4aTw6l/efmvgPw/6kxbkWidL4EVBjjIDUdSpAfu0HKAoRINH7xV3/o2+++DAgfnnhKpOLc//vN/1nwaXiJYOb8DnOJSiEzhLyMxf3xM8SoAEBSAIqkAfKQB3oAENgBqyALXAEbsAb+IMQEAlWAxZIBKmAD7JAHtgECkEx2An2gGpQBxpBM2gFx0EnOAXOg0vgGrgBboP7YBRMgGdgFrwGCxAEYSEyRIHkIRVIE9KHzCAGZA+5Qb5QEBQJxUIJEA8SQnnQZqgYKoOqoXqoGfoeOgmdh65Ag9BdaAyahn6H3sEITIKpsBKsBRvDDNgJ9oFD4FVwArwGzoUL4B1wJdwAH4U74PPwNfg2PAo/g+cQgBARGqKKGCIMxAXxR6KQeISPrEeKkAqkAWlFupE+5CYyiswgb1EYFAVFRxmibFGeqFAUC7UGtR5VgqpGHUZ1oHpRN1FjqFnURzQZrYjWR9ugvdAR6AR0FroQXYFuQrejL6JvoyfQrzEYDA2jjbHCeGIiMUmYtZgSzD5MG+YcZhAzjpnDYrHyWH2sHdYfy8QKsIXYKuxR7FnsEHYC+wZHxKngzHDuuCgcD5ePq8AdwZ3BDeEmcQt4Kbwm3gbvj2fjc/Cl+EZ8N/46fgK/QJAmaBPsCCGEJMImQiWhlXCR8IDwkkgkqhGtiYFELnEjsZJ4jHiZOEZ8S5Ih6ZFcSNEkIWkH6RDpHOku6SWZTNYiO5KjyALyDnIz+QL5EfmNBEXCSMJLgi2xQaJGokNiSOK5JF5SU9JJcrVkrmSF5AnJ65IzUngpLSkXKabUeqkaqZNSI1Jz0hRpU2l/6VTpEukj0lekp2SwMloybjJsmQKZgzIXZMYpCEWd4kJhUTZTGikXKRNUDFWb6kVNohZTv6MOUGdlZWSXyYbJZsvWyJ6WHaUhNC2aFy2FVko7ThumvVuitMRpCWfJ9iWtS4aWzMstlXOU48gVybXJ3ZZ7J0+Xd5NPlt8l3yn/UAGloKcQqJClsF/hosLMUupS26WspUVLjy+9pwgr6ikGKa5VPKjYrzinpKzkoZSuVKV0QWlGmabsqJykXK58RnlahaJir8JVKVc5q/KULkt3oqfQK+m99FlVRVVPVaFqveqA6oKatlqoWr5am9pDdYI6Qz1evVy9R31WQ0XDTyNPo0XjniZek6GZqLlXs09zXktbK1xrq1an1pS2nLaXdq52i/YDHbKOg84anQadW7oYXYZusu4+3Rt6sJ6FXqJejd51fVjfUp+rv09/0ABtYG3AM2gwGDEkGToZZhq2GI4Z0Yx8jfKNOo2eG2sYRxnvMu4z/mhiYZJi0mhy31TG1Ns037Tb9HczPTOWWY3ZLXOyubv5BvMu8xfL9Jdxlu1fdseCYuFnsdWix+KDpZUl37LVctpKwyrWqtZqhEFlBDBKGJet0dbO1husT1m/tbG0Edgct/nN1tA22faI7dRy7eWc5Y3Lx+3U7Jh29Xaj9nT7WPsD9qMOqg5MhwaHx47qjmzHJsdJJ12nJKejTs+dTZz5zu3O8y42Lutczrkirh6uRa4DbjJuoW7Vbo/c1dwT3FvcZz0sPNZ6nPNEe/p47vIc8VLyYnk1e816W3mv8+71IfkE+1T7PPbV8+X7dvvBft5+u/0erNBcwVvR6Q/8vfx3+z8M0A5YE/BjICYwILAm8EmQaVBeUF8wJTgm+Ejw6xDnkNKQ+6E6ocLQnjDJsOiw5rD5cNfwsvDRCOOIdRHXIhUiuZFdUdiosKimqLmVbiv3rJyItogujB5epb0qe9WV1QqrU1afjpGMYcaciEXHhsceiX3P9Gc2MOfivOJq42ZZLqy9rGdsR3Y5e5pjxynjTMbbxZfFTyXYJexOmE50SKxInOG6cKu5L5I8k+qS5pP9kw8lf0oJT2lLxaXGpp7kyfCSeb1pymnZaYPp+umF6aNrbNbsWTPL9+E3ZUAZqzK6BFTRz1S/UEe4RTiWaZ9Zk/kmKyzrRLZ0Ni+7P0cvZ3vOZK577rdrUWtZa3vyVPM25Y2tc1pXvx5aH7e+Z4P6hoINExs9Nh7eRNiUvOmnfJP8svxXm8M3dxcoFWwsGN/isaWlUKKQXziy1XZr3TbUNu62ge3m26u2fyxiF10tNimuKH5fwiq5+o3pN5XffNoRv2Og1LJ0/07MTt7O4V0Ouw6XSZfllo3v9tvdUU4vLyp/tSdmz5WKZRV1ewl7hXtHK30ru6o0qnZWva9OrL5d41zTVqtYu712fh9739B+x/2tdUp1xXXvDnAP3Kn3qO9o0GqoOIg5mHnwSWNYY9+3jG+bmxSaips+HOIdGj0cdLi32aq5+YjikdIWuEXYMn00+uiN71y/62o1bK1vo7UVHwPHhMeefh/7/fBxn+M9JxgnWn/Q/KG2ndJe1AF15HTMdiZ2jnZFdg2e9D7Z023b3f6j0Y+HTqmeqjkte7r0DOFMwZlPZ3PPzp1LPzdzPuH8eE9Mz/0LERdu9Qb2Dlz0uXj5kvulC31OfWcv210+dcXmysmrjKud1yyvdfRb9Lf/ZPFT+4DlQMd1q+tdN6xvdA8uHzwz5DB0/qbrzUu3vG5du73i9uBw6PCdkeiR0TvsO1N3U+6+uJd5b+H+xgfoB0UPpR5WPFJ81PCz7s9to5ajp8dcx/ofBz++P84af/ZLxi/vJwqekJ9UTKpMNk+ZTZ2adp++8XTl04ln6c8WZgp/lf619rnO8x9+c/ytfzZiduIF/8Wn30teyr889GrZq565gLlHr1NfL8wXvZF/c/gt423fu/B3kwtZ77HvKz/ofuj+6PPxwafUT5/+BQOY8/xvJtwPAAAACXBIWXMAAC4iAAAuIgGq4t2SAAANMElEQVRoQ92aB1xURx7H/69sY5eOFBELCipESsSC0RCMJRZMrICHGiMmGjWaqDk7YEsuGok5TS6xi56KGtsFG6jBiAYLKhqVc8GGBZG+fd97N+/twNJWFksS7/v5DG/nN/OG/fze/838Z4CA/wMCE9d9W8oQ3mUMBSojBTqWAuBQAweHIC56lanXHw8xJixM6qhQNcX1KuQykluyKzMPVxvF5XUh3hIpgFSiQz8AJBItSKU6sCsX55P9byLxxRKwYl3W5O6dg5o62IMRmcpyBBz87wNYcyH3R4iL+gh3+8MhHaTqYJKUKO2dPYTigIqza1MlLZLnzh3arQ/uZzVn14YOIGRyJWXrqgR5U6VI1kRJS92VBEEry+wrAnC3F04XL3cY4OMF7/p6weC2zSDQzQG3/IlM7dspdPmU0VxtLqYf5haM6HYOBYLVUwcXByQy92JxXioexUzFhT5cySn3TrjrC4WP3EsPHuPfZGJVZg4HCdt/wF0aT8LWUHT/jTpl4fZU3KNBSHytQ0D33uDR0qfjoqg3hmOpQU65d4u2cW4X6NCyJ1ZeIeKSFRC3p1q4kzYdmzr6Zk98p6rsj+rhi0KoFe5gIm53M/ypDhbNJQgC3kbTFUGSi+LiwmgsWyQ5zk9McESCZ8gEVHvF1kneWJI5CJT2SHWDbUQ0vNbEvqr4OClwCyZ+RzSQ+psomqOwUgOL5vL4BIdCi/aBvtJb3AdYsoirs0usnWfH1vbNOmPlFWHmWlve2DFB3t0nhvh0qm2wRRZuG+ksFyUlDe4qcbYRJ0H8v6NxSxVPNZcnPPJDIAlY8PWnXWVYqsPhZb3lDAfzW3T50xbmZ+MfyFhbRcr7yNj1EZ1gdb+O8DFvMKk7it4+ywYjY11k0s1po8KpmA4tITUmnHaWS5HBKJKr0aC5zXw6QJvgNzyhXDIZS3UgCN3UJq3fdLd188PKs3H8+Bjpvn2x/jv2TwnbsOezt3/YPavTss3TXXHzi4U3Vic/+H5gq+7rkLEkmgb5yWwVb3CnNiFAcD+aOtaGaMobmzrqLaoyIwlC11RkNB/JvPGCiGjQXJ43h8QCSRGzEqeG1Xmah77u48QCPdM7NBYrjSPveJg069i7H2UcjUpndWSZrZ3bFRfHlic8nL1TnezcM2Vyh0dLtsbnzdu8JHHW5qVt8G3Pj9qOT4RYluOE/UYllQZPCvFxMik1cbGRSKsbWwlKUPhxhDGxZJ25Ls28oX2X3k60HmZiqQqDTj+rqX8fB7lTC6xYT2569zA9Jb5m7xz8r3aB03uE9fpOFP7WYujZ/TPo22MSDOs1FT4ePBfG9ZvQsod/12kUJf190prli4YnJ6Mt2HOSMKICGLL/5su3Tn6wPxMYZE4lvMH/RAZP6NjaJGBsJSJIi3mrTg6d9bAYem05YSxS6WJgQdR2LFtnLk9oxFigRaKpq2aEuWMJDizu6UlQosltuo3FivU8zgyOkEhkRzz941u2CogDxyYhgMzDrWb4rMXN0Q36vN4TZr43XuTt0WyeoiR/MwqV509JqgzOSx+77zcw8nGM4UMx2r+5qYJpqpByHVztcc3E+QdFXJWx8dE78MgCDaZYldi5eIB/jwj577/+NB9VJ/GajmHj2nYZKpPZNW5aVJ9v2ULDwlaXdsvFYlvzpo1l9PD4yXUoKStAY3MgFjuAexNvcFA4C+32NgqY3HcofHFg18ioH1adRSHyjdBgCQJaQ/y2SFyzAIMKuSkp+1YAepIOGwZ1Bgo9UGu4gCK2z9ZfoEit3yMI1X8XxZwh+B2al2/7jOnfbsKqGaNeB7RYgmsAmvJi2LHkbwaC0baXyElKKpVe7f/JVlpsY4978Abp0PxsvqcSVVZfMGoud3Z44+HZ8vOeG2m3GWOkntNwK8CTgky4eiWJK9fqflUZJRe0jFirZmgvDSPu29or2PmdzhEgpkVC3/ziIpiRvL1ETUua74+NLed3aEnRg4IC3F2Edp6DNx/AmqxcXLMeFK0w3M8L1yxToTfCtCNZUKTRY8VMZv4TyC/VxFiM3OM7N0BudiaMW/g9VgBkto7QIWyYKDstaSEYGdo3dEQNY/n5/EbKJHBq2QPcOozBWk24K00UGgM3QuI2GisA5cVXIOdyYqHeKBo0cEDSaSwLLNu8TJ5968o6LQORI3oMETRPRycI9GrhkHH7Di/UjQpEvzYeQnlZKMQ0rB1Y/25+xO4M2Fl61/KcazTo4W5ONuRcOIUVEx3CI0Fqax8lljsO9w2tuTMuyksHVcHvwKHX2xIcU9aFsgmQEbR5MX50aztQYJzWu19NY3lmjp6pekIrxmbfvv6woLQQqwCBzZujn0SYqfbX5KkLGprVL51IXgMcW5VdgFgqh4DwkaR/WAxBi837Co5j4Hbmj3wucglL9cJy4ENKzRkVf5+q9Bqnpol9WKpDYuR0DfoKabcL8rGCotfBEQ0GLy41ewk81VyWIfYV3lNmXj2NNizVaNvtPfBBc2B1Hl07BKqi2xkkyf0HSxYg0D7eFn9G5rJ69EAYfXj4zgos1QtaYoq16G2qRCYWA0dw5oFqcb9cAyfvPG50ufq4FI/wdPg5t777+VKoNh1ZPzVbIAiWIwl69qm9G9Lad+kJFF5QKFosXCthjXrI/W0jsCw5G62+Tz0D5p8mU3sxrp7FWwClZKYcHWMawvKqvuf6PZh86HwBusW6VY0g/FzlEru0mHAsPB05mnN3X7sHKzNz+K91Df2o+VQIorDBVGz2lpPHvhobdvRy+v7ewT2HYrUmdy/tBU3po5Ren55MP7e+a6MP2F8aHLHXqr9ExO8Y46oQr08bFS6cflkD/1gT+wYLH1aeydGCSD8Q5ox5Ymo1YdUmgqTI2ZkpWziDToMVM0adCpRntrAERc/B0qvFImSsrWAsWdvYx/j1rkRtYNBGo+bbk9gnGKZ19Q0GgzgVlm4yJeQYq8ydsfb4eW158a6LaTuxYkaZuQN0mrLtb39y/KkL2V+Shdved7URrz9Wj7Fn7xfBuAOZuGbiTqkKRu09Y8HgtkFg5A3+qcpgq8zloUT0vItpyUZthXlq0amKQfnbTgNw5AIsvTos3o2SYGL10vAA0r8eY/mdV4nWgBUz26/eqWMwz7JeQeDrbIcM1idgyXpzp6xOyzHoVBuyUrdiBeD6ySQw6DVr+n9+XImlBmE5ggHOiGs8wleg0G7e8urEQwBNEuavywjpYY2BGse8oQ9QHjgM7bK0/ApfiWDslhOGEq1+NZZqwnH526/cOVbdYP7K13OelKcBY/O5ICKsNpeHFJMJ1zL2aVQlBaAqfgDKswdUKIFYhJutAqVqDznDI1xDdbRVFkkc6YzDQ9piqX448HNSmE+jitVq/mkU4OqzERd9sEJnGNJ/W7pgcGalsTp9FDLRdF5QGwJ0wNpEoAhOi0GGao0M8Fe+DkzpIEgYpMY9G2fuxMRj+axBvyrryEbITtsIjNGwcuDnvzzEzVahJ+gsVnURfTK/Vg6uYUDSNH8gVG/0Ltqy6E2FVNajjYf5WFNZ8AhQcvb88zxvsIEZzBvcV4hYYyQsiP4Jt9YPbyAycgcytM2qn4G/moz9qMpYnkaZK0CIv8y9cKQk72JqkYqAZVi1GmlAxXVGX3DdWHYGKwDurSLBxrb1yLRDo/ftTxkflpQyxW5lyhTJ97vm+azYNneWiCJ+HtxtICnCeTZ/wH0m9yaQHHNAEJ6X+ZGHeINLtLpIiIusP2JrwxspJyLyyzVL+WttY3kabe74xCNFBMd+xXDcl2MTfinBcqPggP5Kfe+bqimTomTwWkg8tPaNjLC3bX5CxtKljjqxViGzyfFrFfTFB/3GK3w9zTvd49eyobCsNGPvlCl1ziKeGWQwxI2sYWx2QamwsFWWcQfO4hbM9EgNLIiaK1zrofGRy8PQ34o1mmf+Hyz5/nub9Kprh4qVS4WzBR6SFEOLVv3hze7zYOiAFTDqveUQ03829O0yDJrYm8+Lr9+/AztOn1SxHPNy/xoqklxEi9qAo7kPq0rGvcIBaOIah3s0yDOZO/rro6rIxDP1Pi1rIBKABb3tiIqCw0fzL38GmvKbuMUyOoMODmf9Ct8d3l3CsfpByR9Pu4KbXg5zhjxBUZlSp8yPPoF7NIhwWG5jb5/h16kbltBrShLw+K4SCvOVCYt2no7HslWg7e9iW5fWcxVNvIGmGVMRGYEoO4zmykLhsBx3heTk4VSgW+lENSObQ8n9POSOHUEi90L97dHOlQKtXg9FFSVwu+A+XLmbx5Tp2F1qhvr7d7Ezb+MhBPjD8tdbNA+SSGSgYwmUGpFwo7AczuYX/an/iEdM6B3qKqbZAbguIKJQEZEosYSLi3efzsKyVZxd3/V1Cc0FisQMGsMAUqkBXfXoqgXChjlgF/LAfCiLOXfuQ5G2tDRcY5CGaRhxO41R4qJlRJSaEZVrjOLbapY6Z9BASkJswn18Sw2CVqx/t5ghncoZElQsBTqm8u+X3A0UaRm48gcD8D/XZskfp8IFSwAAAABJRU5ErkJggg==)}.msp-plugin .msp-plugin-content{color:#332b1f}.msp-plugin .msp-plugin-init-error{white-space:pre;margin:10px}.msp-plugin .msp-svg-text{fill:#332b1f}.msp-plugin{background:#eeece7}
/*! normalize.css v3.0.3 | MIT License | github.com/necolas/normalize.css */
/*# sourceMappingURL=molstar.css.map */
`;
    }
  });

  // src/ProteinView/useProteinView.ts
  function useProteinView({
    showControls
  }) {
    const parentRef = (0, import_react50.useRef)(null);
    const [plugin, setPlugin] = (0, import_react50.useState)();
    const [error, setError] = (0, import_react50.useState)();
    const [loading, setLoading] = (0, import_react50.useState)(true);
    (0, import_react50.useEffect)(() => {
      let p;
      (async () => {
        try {
          if (!parentRef.current) {
            return;
          }
          const {
            GeometryExport,
            PluginConfig,
            PluginSpec,
            DefaultPluginUISpec,
            createPluginUI,
            renderReact18
          } = await loadMolstar();
          const d = document.createElement("div");
          parentRef.current.append(d);
          const defaultSpec = DefaultPluginUISpec();
          p = await createPluginUI({
            target: d,
            render: renderReact18,
            spec: {
              ...DefaultPluginUISpec(),
              behaviors: [
                ...defaultSpec.behaviors,
                PluginSpec.Behavior(GeometryExport)
              ],
              layout: {
                initial: {
                  controlsDisplay: "reactive",
                  showControls
                }
              },
              config: [[PluginConfig.Viewport.ShowExpand, false]]
            }
          });
          await p.initialized;
          setPlugin(p);
        } catch (e) {
          console.error(e);
          setError(e);
        } finally {
          setLoading(false);
        }
      })();
      return () => {
        p?.unmount();
      };
    }, [showControls]);
    return { parentRef, error, plugin, loading };
  }
  var import_react50;
  var init_useProteinView = __esm({
    "src/ProteinView/useProteinView.ts"() {
      "use strict";
      import_react50 = __toESM(require_react());
      init_loadMolstar();
    }
  });

  // src/ProteinView/components/ProteinView.tsx
  var ProteinView_exports = {};
  __export(ProteinView_exports, {
    default: () => ProteinView_default
  });
  var import_react51, import_ui9, import_mobx_react19, style, ProteinView, ProteinViewContainer, ProteinView_default;
  var init_ProteinView = __esm({
    "src/ProteinView/components/ProteinView.tsx"() {
      "use strict";
      import_react51 = __toESM(require_react());
      import_ui9 = __toESM(require_ui());
      import_mobx_react19 = __toESM(require_mobx_react());
      init_ManualAlignmentDialog();
      init_ProteinViewHeader();
      init_molstar();
      init_useProteinView();
      style = document.createElement("style");
      style.append(molstar_default);
      document.head.append(style);
      ProteinView = (0, import_mobx_react19.observer)(function ProteinView2({
        model
      }) {
        const { showControls } = model;
        const { plugin, parentRef, error, loading } = useProteinView({
          showControls
        });
        (0, import_react51.useEffect)(() => {
          model.setMolstarPluginContext(plugin);
        }, [plugin, model]);
        if (error) {
          return /* @__PURE__ */ import_react51.default.createElement(import_ui9.ErrorMessage, { error });
        }
        return /* @__PURE__ */ import_react51.default.createElement(
          ProteinViewContainer,
          {
            model,
            parentRef,
            loading
          }
        );
      });
      ProteinViewContainer = (0, import_mobx_react19.observer)(function ProteinViewContainer2({
        model,
        parentRef,
        loading
      }) {
        const { width, height, error } = model;
        return /* @__PURE__ */ import_react51.default.createElement("div", { style: { background: "#ccc" } }, error ? /* @__PURE__ */ import_react51.default.createElement(import_ui9.ErrorMessage, { error }) : null, loading ? /* @__PURE__ */ import_react51.default.createElement(import_ui9.LoadingEllipses, { message: "Loading protein viewer" }) : /* @__PURE__ */ import_react51.default.createElement(ProteinViewHeader_default, { model }), /* @__PURE__ */ import_react51.default.createElement(
          "div",
          {
            ref: parentRef,
            style: {
              position: "relative",
              width,
              height
            }
          }
        ), /* @__PURE__ */ import_react51.default.createElement(
          import_ui9.ResizeHandle,
          {
            style: { height: 4, background: "grey" },
            onDrag: (delta) => {
              return model.setHeight(model.height + delta);
            }
          }
        ), /* @__PURE__ */ import_react51.default.createElement(ManualAlignmentDialog_default, { model }));
      });
      ProteinView_default = ProteinView;
    }
  });

  // src/UniProtVariationAdapter/UniProtVariationAdapter.ts
  var UniProtVariationAdapter_exports = {};
  __export(UniProtVariationAdapter_exports, {
    default: () => UniProtVariationAdapter2
  });
  var import_BaseAdapter3, import_util43, import_io3, import_rxjs3, UniProtVariationAdapter2;
  var init_UniProtVariationAdapter = __esm({
    "src/UniProtVariationAdapter/UniProtVariationAdapter.ts"() {
      "use strict";
      import_BaseAdapter3 = __toESM(require_BaseAdapter());
      import_util43 = __toESM(require_util());
      import_io3 = __toESM(require_io());
      import_rxjs3 = __toESM(require_rxjs());
      UniProtVariationAdapter2 = class extends import_BaseAdapter3.BaseFeatureDataAdapter {
        static capabilities = ["getFeatures", "getRefNames"];
        feats;
        async loadDataP() {
          const { features } = JSON.parse(
            await (0, import_io3.openLocation)(this.getConf("location")).readFile("utf8")
          );
          const scoreField = this.getConf("scoreField");
          return features.map(({ begin, end, ...rest }, idx) => ({
            ...rest,
            uniqueId: `feat-${idx}`,
            start: +begin,
            end: +end + 1,
            score: scoreField === "population_frequency" ? rest.populationFrequencies?.[0]?.frequency : scoreField === "variant_impact_score" ? rest.predictions?.[0]?.score : void 0,
            description: rest.descriptions?.map((d) => d.value).join(","),
            name: [
              rest.mutatedType ? `${rest.wildType}->${rest.mutatedType}` : `${rest.wildType}->del`
            ]
          }));
        }
        async loadData(_opts = {}) {
          this.feats ??= this.loadDataP().catch((e) => {
            this.feats = void 0;
            throw e;
          });
          return this.feats;
        }
        async getRefNames(_opts = {}) {
          return [];
        }
        getFeatures(query, _opts = {}) {
          return (0, import_rxjs3.ObservableCreate)(async (observer20) => {
            const { start, end, refName } = query;
            const data = await this.loadData();
            for (const f of data) {
              if ((0, import_util43.doesIntersect2)(f.start, f.end, start, end)) {
                observer20.next(new import_util43.SimpleFeature({ ...f, refName }));
              }
            }
            observer20.complete();
          });
        }
        freeResources() {
        }
      };
    }
  });

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => ProteinViewer
  });
  var import_Plugin = __toESM(require_Plugin());

  // src/AddHighlightModel/index.tsx
  var import_react9 = __toESM(require_react());

  // src/AddHighlightModel/HighlightComponents.tsx
  var import_react8 = __toESM(require_react());
  var import_mobx_react8 = __toESM(require_mobx_react());

  // src/AddHighlightModel/GenomeMouseoverHighlight.tsx
  var import_react2 = __toESM(require_react());
  var import_util3 = __toESM(require_util());
  var import_mobx_react2 = __toESM(require_mobx_react());

  // src/AddHighlightModel/Highlight.tsx
  var import_react = __toESM(require_react());
  var import_util = __toESM(require_util());
  var import_mobx_react = __toESM(require_mobx_react());

  // src/AddHighlightModel/util.ts
  var import_mui = __toESM(require_mui());
  var useStyles = (0, import_mui.makeStyles)()({
    highlight: {
      height: "100%",
      background: "rgba(255,255,0,0.2)",
      border: "1px solid rgba(50,50,0,0.2)",
      position: "absolute",
      zIndex: 99,
      textAlign: "center",
      pointerEvents: "none",
      overflow: "hidden"
    },
    thinborder: {
      border: "1px solid black"
    }
  });

  // src/AddHighlightModel/Highlight.tsx
  var Highlight = (0, import_mobx_react.observer)(function Highlight2({
    assemblyName,
    start,
    end,
    refName,
    model
  }) {
    const { cx, classes } = useStyles();
    const { assemblyManager } = (0, import_util.getSession)(model);
    const { offsetPx } = model;
    const assembly = assemblyManager.get(assemblyName);
    const ref = assembly?.getCanonicalRefName(refName) ?? refName;
    const s = model.bpToPx({ refName: ref, coord: start });
    const e = model.bpToPx({ refName: ref, coord: end });
    if (s && e) {
      const width = Math.max(Math.abs(e.offsetPx - s.offsetPx), 3);
      const left = Math.min(s.offsetPx, e.offsetPx) - offsetPx;
      return /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          className: cx(
            classes.highlight,
            width <= 3 ? classes.thinborder : void 0
          ),
          style: { left, width }
        }
      );
    } else {
      return null;
    }
  });
  var Highlight_default = Highlight;

  // src/ProteinView/util.ts
  init_loadMolstar();

  // src/ProteinView/proteinAbbreviationMapping.ts
  var proteinAbbreviationMapping = Object.fromEntries(
    [
      { name: "alanine", abbreviation: "Ala", singleLetterCode: "A" },
      { name: "arginine", abbreviation: "Arg", singleLetterCode: "R" },
      { name: "asparagine", abbreviation: "Asn", singleLetterCode: "N" },
      { name: "aspartic acid", abbreviation: "Asp", singleLetterCode: "D" },
      { name: "cysteine", abbreviation: "Cys", singleLetterCode: "C" },
      { name: "glutamic acid", abbreviation: "Glu", singleLetterCode: "E" },
      { name: "glutamine", abbreviation: "Gln", singleLetterCode: "Q" },
      { name: "glycine", abbreviation: "Gly", singleLetterCode: "G" },
      { name: "histidine", abbreviation: "His", singleLetterCode: "H" },
      { name: "isoleucine", abbreviation: "Ile", singleLetterCode: "I" },
      { name: "leucine", abbreviation: "Leu", singleLetterCode: "L" },
      { name: "lysine", abbreviation: "Lys", singleLetterCode: "K" },
      { name: "methionine", abbreviation: "Met", singleLetterCode: "M" },
      { name: "phenylalanine", abbreviation: "Phe", singleLetterCode: "F" },
      { name: "proline", abbreviation: "Pro", singleLetterCode: "P" },
      { name: "serine", abbreviation: "Ser", singleLetterCode: "S" },
      { name: "threonine", abbreviation: "Thr", singleLetterCode: "T" },
      { name: "tryptophan", abbreviation: "Trp", singleLetterCode: "W" },
      { name: "tyrosine", abbreviation: "Tyr", singleLetterCode: "Y" },
      { name: "valine", abbreviation: "Val", singleLetterCode: "V" }
    ].map((r) => [r.abbreviation.toUpperCase(), r])
  );

  // src/ProteinView/util.ts
  function checkHovered(hovered) {
    return !!hovered && typeof hovered == "object" && "hoverFeature" in hovered && "hoverPosition" in hovered;
  }
  async function getMolstarStructureSelection({
    structure,
    selectedResidue
  }) {
    const { Script } = await loadMolstar();
    return Script.getStructureSelection(
      (Q) => Q.struct.generator.atomGroups({
        "residue-test": Q.core.rel.eq([
          Q.struct.atomProperty.macromolecular.label_seq_id(),
          selectedResidue
        ]),
        "group-by": Q.struct.atomProperty.macromolecular.residueKey()
      }),
      structure
    );
  }
  function toStr({
    chain,
    code,
    structureSeqPos
  }) {
    return [
      structureSeqPos === void 0 ? "" : `Position: ${structureSeqPos + 1}`,
      code ? `Letter: ${code} (${proteinAbbreviationMapping[code]?.singleLetterCode})` : "",
      chain ? `Chain: ${chain}` : ""
    ].filter((f) => !!f).join(", ");
  }
  function invertMap(arg) {
    return Object.fromEntries(
      Object.entries(arg).map(([a, b]) => [b, +a]).filter((f) => f[0] !== void 0)
    );
  }

  // src/AddHighlightModel/GenomeMouseoverHighlight.tsx
  var GenomeMouseoverHighlight = (0, import_mobx_react2.observer)(function GenomeMouseoverHighlight2({
    model
  }) {
    const session = (0, import_util3.getSession)(model);
    const { views, hovered } = session;
    if (checkHovered(hovered) && views.some((s) => s.type === "ProteinView")) {
      const { assemblyNames } = model;
      const { coord, refName } = hovered.hoverPosition;
      return /* @__PURE__ */ import_react2.default.createElement(
        Highlight_default,
        {
          model,
          start: coord - 1,
          end: coord,
          refName,
          assemblyName: assemblyNames[0]
        }
      );
    }
    return null;
  });
  var GenomeMouseoverHighlight_default = GenomeMouseoverHighlight;

  // src/AddHighlightModel/GenomeTo1DProteinHoverHighlight.tsx
  var import_react3 = __toESM(require_react());
  var import_util6 = __toESM(require_util());
  var import_mobx_react3 = __toESM(require_mobx_react());
  init_Protein1DViewRegistry();
  init_mappings();
  function checkHoveredPosition(hovered) {
    return !!hovered && typeof hovered === "object" && "hoverPosition" in hovered && !!hovered.hoverPosition && typeof hovered.hoverPosition === "object" && "coord" in hovered.hoverPosition && "refName" in hovered.hoverPosition;
  }
  var GenomeTo1DProteinHoverHighlight = (0, import_mobx_react3.observer)(
    function GenomeTo1DProteinHoverHighlight2({
      model
    }) {
      const session = (0, import_util6.getSession)(model);
      const { hovered } = session;
      const { assemblyNames, id: viewId } = model;
      const assemblyName = assemblyNames[0];
      if (!assemblyName) {
        return null;
      }
      const protein1DInfo = protein1DViewRegistry.get(viewId);
      if (!protein1DInfo) {
        return null;
      }
      if (!checkHoveredPosition(hovered)) {
        return null;
      }
      const { coord } = hovered.hoverPosition;
      const feature = new import_util6.SimpleFeature(protein1DInfo.feature);
      const mapping = genomeToTranscriptSeqMapping2(feature);
      const { g2p } = mapping;
      const proteinPos = g2p[coord - 1];
      if (proteinPos === void 0) {
        return null;
      }
      return /* @__PURE__ */ import_react3.default.createElement(
        Highlight_default,
        {
          model,
          start: proteinPos,
          end: proteinPos + 1,
          refName: protein1DInfo.uniprotId,
          assemblyName: protein1DInfo.uniprotId
        }
      );
    }
  );
  var GenomeTo1DProteinHoverHighlight_default = GenomeTo1DProteinHoverHighlight;

  // src/AddHighlightModel/Protein1DToGenomeHoverHighlight.tsx
  var import_react4 = __toESM(require_react());
  var import_util7 = __toESM(require_util());
  var import_mobx_react4 = __toESM(require_mobx_react());
  init_Protein1DViewRegistry();
  function checkHoveredPosition2(hovered) {
    return !!hovered && typeof hovered === "object" && "hoverPosition" in hovered && !!hovered.hoverPosition && typeof hovered.hoverPosition === "object" && "coord" in hovered.hoverPosition && "refName" in hovered.hoverPosition;
  }
  var Protein1DToGenomeHoverHighlight = (0, import_mobx_react4.observer)(
    function Protein1DToGenomeHoverHighlight2({
      model
    }) {
      const session = (0, import_util7.getSession)(model);
      const { hovered } = session;
      const { assemblyNames, id: viewId } = model;
      if (!checkHoveredPosition2(hovered)) {
        return null;
      }
      const { coord, refName } = hovered.hoverPosition;
      const protein1DInfo = protein1DViewRegistry.getByUniprotId(refName, session);
      if (protein1DInfo?.connectedViewId !== viewId) {
        return null;
      }
      const assemblyName = assemblyNames[0];
      if (!assemblyName) {
        return null;
      }
      const genomeHighlight = protein1DViewRegistry.getGenomeHighlightForProteinPosition(
        refName,
        coord - 1,
        session
      );
      if (!genomeHighlight) {
        return null;
      }
      return /* @__PURE__ */ import_react4.default.createElement(
        Highlight_default,
        {
          model,
          start: genomeHighlight.start,
          end: genomeHighlight.end,
          refName: genomeHighlight.refName,
          assemblyName
        }
      );
    }
  );
  var Protein1DToGenomeHoverHighlight_default = Protein1DToGenomeHoverHighlight;

  // src/AddHighlightModel/ProteinToGenomeClickHighlight.tsx
  var import_react5 = __toESM(require_react());
  var import_util8 = __toESM(require_util());
  var import_mobx_react5 = __toESM(require_mobx_react());
  var ProteinToGenomeClickHighlight = (0, import_mobx_react5.observer)(
    function ProteinToGenomeClickHighlight2({ model }) {
      const { assemblyManager, views } = (0, import_util8.getSession)(model);
      const { assemblyNames } = model;
      const proteinView = views.find((f) => f.type === "ProteinView");
      const assemblyName = assemblyNames[0];
      const assembly = assemblyManager.get(assemblyName);
      return assembly ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, proteinView?.structures.map(
        (structure, idx) => structure.clickGenomeHighlights.map((r, idx2) => /* @__PURE__ */ import_react5.default.createElement(
          Highlight_default,
          {
            key: `${JSON.stringify(r)}-${idx}-${idx2}}`,
            start: r.start,
            end: r.end,
            refName: r.refName,
            assemblyName,
            model
          }
        ))
      )) : null;
    }
  );
  var ProteinToGenomeClickHighlight_default = ProteinToGenomeClickHighlight;

  // src/AddHighlightModel/ProteinToGenomeHoverHighlight.tsx
  var import_react6 = __toESM(require_react());
  var import_util9 = __toESM(require_util());
  var import_mobx_react6 = __toESM(require_mobx_react());
  var ProteinToGenomeHoverHighlight = (0, import_mobx_react6.observer)(
    function ProteinToGenomeHoverHighlight2({
      model
    }) {
      const { assemblyManager, views } = (0, import_util9.getSession)(model);
      const { assemblyNames } = model;
      const proteinView = views.find((f) => f.type === "ProteinView");
      const assemblyName = assemblyNames[0];
      const assembly = assemblyManager.get(assemblyName);
      return assembly ? /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, proteinView?.structures.map(
        (structure, idx) => structure.hoverGenomeHighlights.map((r, idx2) => /* @__PURE__ */ import_react6.default.createElement(
          Highlight_default,
          {
            key: `${JSON.stringify(r)}-${idx}-${idx2}`,
            start: r.start,
            end: r.end,
            refName: r.refName,
            assemblyName,
            model
          }
        ))
      )) : null;
    }
  );
  var ProteinToGenomeHoverHighlight_default = ProteinToGenomeHoverHighlight;

  // src/AddHighlightModel/ProteinToMsaHoverSync.tsx
  var import_react7 = __toESM(require_react());
  var import_util10 = __toESM(require_util());
  var import_mobx2 = __toESM(require_mobx());
  var import_mobx_react7 = __toESM(require_mobx_react());
  var ProteinToMsaHoverSync = (0, import_mobx_react7.observer)(function ProteinToMsaHoverSync2({
    model
  }) {
    const session = (0, import_util10.getSession)(model);
    const { views } = session;
    const proteinView = views.find((f) => f.type === "ProteinView");
    const connectedMsaViewId = proteinView?.connectedMsaViewId;
    const msaView = connectedMsaViewId ? views.find((f) => f.id === connectedMsaViewId) : void 0;
    (0, import_react7.useEffect)(() => {
      if (!proteinView || !msaView?.setMouseoveredColumn) {
        return;
      }
      const disposer = (0, import_mobx2.autorun)(() => {
        const structure = proteinView.structures[0];
        if (structure) {
          const pos = structure.structureSeqHoverPos;
          msaView.setMouseoveredColumn?.(pos);
        }
      });
      return () => {
        disposer();
      };
    }, [proteinView, msaView]);
    (0, import_react7.useEffect)(() => {
      if (!proteinView || !msaView) {
        return;
      }
      const disposer = (0, import_mobx2.autorun)(() => {
        const col = msaView.mouseoveredColumn;
        const structure = proteinView.structures[0];
        if (structure && col !== void 0) {
          structure.highlightFromExternal(col);
        } else if (structure && col === void 0) {
          structure.clearHighlightFromExternal();
        }
      });
      return () => {
        disposer();
      };
    }, [proteinView, msaView]);
    return null;
  });
  var ProteinToMsaHoverSync_default = ProteinToMsaHoverSync;

  // src/AddHighlightModel/HighlightComponents.tsx
  var HighlightComponents = (0, import_mobx_react8.observer)(function Highlight3({
    model
  }) {
    return /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement(ProteinToGenomeClickHighlight_default, { model }), /* @__PURE__ */ import_react8.default.createElement(ProteinToGenomeHoverHighlight_default, { model }), /* @__PURE__ */ import_react8.default.createElement(Protein1DToGenomeHoverHighlight_default, { model }), /* @__PURE__ */ import_react8.default.createElement(GenomeTo1DProteinHoverHighlight_default, { model }), /* @__PURE__ */ import_react8.default.createElement(GenomeMouseoverHighlight_default, { model }), /* @__PURE__ */ import_react8.default.createElement(ProteinToMsaHoverSync_default, { model }));
  });
  var HighlightComponents_default = HighlightComponents;

  // src/AddHighlightModel/index.tsx
  function AddHighlightModelF(pluginManager) {
    pluginManager.addToExtensionPoint(
      "LinearGenomeView-TracksContainerComponent",
      // @ts-expect-error
      (rest, { model }) => {
        return [
          ...rest,
          /* @__PURE__ */ import_react9.default.createElement(
            HighlightComponents_default,
            {
              key: "highlight_protein_viewer_protein3d",
              model
            }
          )
        ];
      }
    );
  }

  // src/AlphaFoldConfidenceAdapter/index.ts
  var import_AdapterType = __toESM(require_AdapterType());

  // src/AlphaFoldConfidenceAdapter/configSchema.ts
  var import_configuration = __toESM(require_configuration());
  var AlphaFoldConfidenceAdapter = (0, import_configuration.ConfigurationSchema)(
    "AlphaFoldConfidenceAdapter",
    {
      /**
       * #slot
       */
      location: {
        type: "fileLocation",
        defaultValue: {
          uri: "/path/to/my.bed.gz",
          locationType: "UriLocation"
        }
      }
    },
    { explicitlyTyped: true }
  );
  var configSchema_default = AlphaFoldConfidenceAdapter;

  // src/AlphaFoldConfidenceAdapter/index.ts
  function AlphaFoldConfidenceAdapterF(pluginManager) {
    pluginManager.addAdapterType(
      () => new import_AdapterType.default({
        name: "AlphaFoldConfidenceAdapter",
        displayName: "AlphaFoldConfidence adapter",
        configSchema: configSchema_default,
        getAdapterClass: () => Promise.resolve().then(() => (init_AlphaFoldConfidenceAdapter(), AlphaFoldConfidenceAdapter_exports)).then((r) => r.default)
      })
    );
  }

  // src/AlphaMissensePathogenicityAdapter/index.ts
  var import_AdapterType2 = __toESM(require_AdapterType());

  // src/AlphaMissensePathogenicityAdapter/configSchema.ts
  var import_configuration2 = __toESM(require_configuration());
  var AlphaMissensePathogenicityAdapter = (0, import_configuration2.ConfigurationSchema)(
    "AlphaMissensePathogenicityAdapter",
    {
      /**
       * #slot
       */
      location: {
        type: "fileLocation",
        defaultValue: {
          uri: "/path/to/my.bed.gz",
          locationType: "UriLocation"
        }
      }
    },
    { explicitlyTyped: true }
  );
  var configSchema_default2 = AlphaMissensePathogenicityAdapter;

  // src/AlphaMissensePathogenicityAdapter/index.ts
  function AlphaMissensePathogenicityAdapterF(pluginManager) {
    pluginManager.addAdapterType(
      () => new import_AdapterType2.default({
        name: "AlphaMissensePathogenicityAdapter",
        displayName: "AlphaMissensePathogenicity adapter",
        configSchema: configSchema_default2,
        getAdapterClass: () => Promise.resolve().then(() => (init_AlphaMissensePathogenicityAdapter(), AlphaMissensePathogenicityAdapter_exports)).then((r) => r.default)
      })
    );
  }

  // src/LaunchProteinView/index.ts
  var import_util35 = __toESM(require_util());

  // node_modules/@mui/icons-material/esm/Add.js
  init_createSvgIcon();
  var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
  var Add_default = (0, import_utils.createSvgIcon)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
    d: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"
  }), "Add");

  // src/LaunchProteinView/components/LaunchProteinViewDialog.tsx
  var import_react40 = __toESM(require_react());
  var import_ui5 = __toESM(require_ui());
  var import_material21 = __toESM(require_material());

  // src/LaunchProteinView/components/AlphaFoldDBSearch.tsx
  var import_react28 = __toESM(require_react());
  var import_ui = __toESM(require_ui());
  var import_util29 = __toESM(require_util());
  var import_material13 = __toESM(require_material());
  var import_mobx_react9 = __toESM(require_mobx_react());
  var import_mui5 = __toESM(require_mui());

  // src/LaunchProteinView/components/AlphaFoldDBSearchStatus.tsx
  var import_react13 = __toESM(require_react());
  var import_material4 = __toESM(require_material());

  // src/LaunchProteinView/components/MSATable.tsx
  var import_react11 = __toESM(require_react());
  var import_util13 = __toESM(require_util());
  var import_material2 = __toESM(require_material());
  var import_mui3 = __toESM(require_mui());

  // src/LaunchProteinView/components/Checkbox2.tsx
  var import_react10 = __toESM(require_react());
  var import_material = __toESM(require_material());
  var import_mui2 = __toESM(require_mui());
  var useStyles2 = (0, import_mui2.makeStyles)()({
    block: {
      display: "block"
    }
  });
  function Checkbox2({
    checked,
    disabled,
    label,
    onChange
  }) {
    const { classes } = useStyles2();
    return /* @__PURE__ */ import_react10.default.createElement(
      import_material.FormControlLabel,
      {
        disabled,
        className: classes.block,
        control: /* @__PURE__ */ import_react10.default.createElement(import_material.Checkbox, { checked, onChange }),
        label
      }
    );
  }

  // src/LaunchProteinView/components/MSATable.tsx
  init_util();
  var useStyles3 = (0, import_mui3.makeStyles)()({
    textAreaFont: {
      fontFamily: "Courier New",
      whiteSpace: "pre"
    }
  });
  function MSATable({
    structureName,
    structureSequence,
    isoformSequences
  }) {
    const { classes } = useStyles3();
    const [showInFastaFormat, setShowInFastaFormat] = (0, import_react11.useState)(false);
    const removedStars = Object.fromEntries(
      Object.entries(isoformSequences).map(([key, val]) => [
        key,
        { ...val, seq: stripStopCodon(val.seq) }
      ])
    );
    const exactMatchIsoformAndStructureSeq = Object.entries(removedStars).find(
      ([_, val]) => structureSequence === val.seq
    );
    const sname = `${structureName || ""} (structure residues)`;
    const maxKeyLen = (0, import_util13.max)([
      sname.length,
      ...Object.entries(removedStars).map(
        ([_, val]) => getTranscriptDisplayName(val.feature).length
      )
    ]);
    return /* @__PURE__ */ import_react11.default.createElement(import_react11.default.Fragment, null, /* @__PURE__ */ import_react11.default.createElement(
      Checkbox2,
      {
        onChange: (event) => {
          setShowInFastaFormat(event.target.checked);
        },
        label: "Show in FASTA format?",
        checked: showInFastaFormat
      }
    ), /* @__PURE__ */ import_react11.default.createElement(
      import_material2.TextField,
      {
        variant: "outlined",
        multiline: true,
        minRows: 5,
        maxRows: 10,
        fullWidth: true,
        value: showInFastaFormat ? [
          `>${sname}
${structureSequence}`,
          ...Object.values(removedStars).map(
            ({ feature, seq }) => `>${getTranscriptDisplayName(feature)}
${seq}`
          )
        ].join("\n") : [
          `${sname.padEnd(maxKeyLen)}${exactMatchIsoformAndStructureSeq ? "*" : " "} ${structureSequence}`,
          exactMatchIsoformAndStructureSeq ? `${getTranscriptDisplayName(exactMatchIsoformAndStructureSeq[1].feature).padEnd(maxKeyLen)}* ${exactMatchIsoformAndStructureSeq[1].seq}` : void 0,
          ...Object.entries(removedStars).map(
            ([_, val]) => `${getTranscriptDisplayName(val.feature).padEnd(maxKeyLen)}  ${val.seq}`
          ).filter(([k]) => k !== exactMatchIsoformAndStructureSeq?.[0])
        ].filter((f) => !!f).join("\n"),
        slotProps: {
          input: {
            readOnly: true,
            classes: {
              input: classes.textAreaFont
            }
          }
        }
      }
    ));
  }

  // src/components/ExternalLink.tsx
  var import_react12 = __toESM(require_react());

  // node_modules/@mui/icons-material/esm/OpenInNew.js
  init_createSvgIcon();
  var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
  var OpenInNew_default = (0, import_utils.createSvgIcon)(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", {
    d: "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z"
  }), "OpenInNew");

  // src/components/ExternalLink.tsx
  var import_material3 = __toESM(require_material());
  function ExternalLink(props) {
    const { children, ...rest } = props;
    return /* @__PURE__ */ import_react12.default.createElement(import_material3.Link, { ...rest, target: "_blank", rel: "noreferrer" }, children, " ", /* @__PURE__ */ import_react12.default.createElement(OpenInNew_default, { fontSize: "small" }));
  }

  // src/LaunchProteinView/components/AlphaFoldDBSearchStatus.tsx
  init_util();
  function NotFound({ uniprotId }) {
    return /* @__PURE__ */ import_react13.default.createElement(import_material4.Typography, null, "No structure found for this UniProtID in AlphaFoldDB", " ", /* @__PURE__ */ import_react13.default.createElement(
      ExternalLink,
      {
        href: `https://alphafold.ebi.ac.uk/search/text/${uniprotId}`
      },
      "(search for results)"
    ));
  }
  function AlphaFoldDBSearchStatus({
    uniprotId,
    selectedTranscript,
    structureSequence,
    isoformSequences,
    url
  }) {
    const url2 = uniprotId ? `https://www.uniprot.org/uniprotkb/${uniprotId}/entry` : void 0;
    const [showAllProteinSequences, setShowAllProteinSequences] = (0, import_react13.useState)(false);
    return uniprotId ? /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, /* @__PURE__ */ import_react13.default.createElement("div", null, /* @__PURE__ */ import_react13.default.createElement(import_material4.Typography, null, "UniProt link: ", /* @__PURE__ */ import_react13.default.createElement(ExternalLink, { href: url2 }, uniprotId)), /* @__PURE__ */ import_react13.default.createElement(import_material4.Typography, null, "AlphaFoldDB link: ", /* @__PURE__ */ import_react13.default.createElement(ExternalLink, { href: url }, url))), structureSequence ? /* @__PURE__ */ import_react13.default.createElement("div", { style: { margin: 20 } }, /* @__PURE__ */ import_react13.default.createElement(
      import_material4.Button,
      {
        variant: "contained",
        color: "primary",
        onClick: () => {
          setShowAllProteinSequences(!showAllProteinSequences);
        }
      },
      showAllProteinSequences ? "Hide all isoform protein sequences" : "Show all isoform protein sequences"
    ), showAllProteinSequences ? /* @__PURE__ */ import_react13.default.createElement(
      MSATable,
      {
        structureSequence,
        structureName: uniprotId,
        isoformSequences
      }
    ) : null) : /* @__PURE__ */ import_react13.default.createElement(NotFound, { uniprotId })) : /* @__PURE__ */ import_react13.default.createElement(import_material4.Typography, null, "Searching", " ", selectedTranscript ? getDisplayName(selectedTranscript) : "transcript", " ", "for UniProt ID");
  }

  // src/LaunchProteinView/components/AlphaFoldEntrySelector.tsx
  var import_react14 = __toESM(require_react());
  var import_material5 = __toESM(require_material());
  function AlphaFoldEntrySelector({
    predictions,
    selectedEntryIndex,
    onSelectionChange
  }) {
    if (predictions.length <= 1) {
      return null;
    }
    return /* @__PURE__ */ import_react14.default.createElement("div", null, /* @__PURE__ */ import_react14.default.createElement(
      import_material5.TextField,
      {
        select: true,
        label: "AlphaFold Structure Entry",
        value: selectedEntryIndex,
        helperText: "Select an AlphaFold structure entry (isoform)",
        onChange: (e) => {
          onSelectionChange(Number(e.target.value));
        }
      },
      predictions.sort((a, b) => a.modelEntityId.length - b.modelEntityId.length).map((prediction, index) => /* @__PURE__ */ import_react14.default.createElement("option", { key: index, value: index }, prediction.modelEntityId))
    ));
  }

  // src/LaunchProteinView/components/IdentifierSelector.tsx
  var import_react15 = __toESM(require_react());
  var import_material6 = __toESM(require_material());
  init_util();
  function getIdLabel(id) {
    const dbType = getDatabaseTypeForId(id);
    if (dbType === "refseq") {
      if (id.startsWith("NM_") || id.startsWith("XM_")) {
        return `${id} (RefSeq mRNA)`;
      }
      if (id.startsWith("NR_") || id.startsWith("XR_")) {
        return `${id} (RefSeq ncRNA)`;
      }
      if (id.startsWith("NP_") || id.startsWith("XP_")) {
        return `${id} (RefSeq protein)`;
      }
      return `${id} (RefSeq)`;
    }
    if (dbType === "ensembl") {
      if (id.includes("G")) {
        return `${id} (Ensembl gene)`;
      }
      if (id.includes("T")) {
        return `${id} (Ensembl transcript)`;
      }
      if (id.includes("P")) {
        return `${id} (Ensembl protein)`;
      }
      return `${id} (Ensembl)`;
    }
    if (dbType === "hgnc") {
      return `${id} (HGNC)`;
    }
    if (dbType === "ccds") {
      return `${id} (CCDS)`;
    }
    return id;
  }
  function IdentifierSelector({
    recognizedIds,
    uniprotId,
    geneName,
    selectedId,
    onSelectedIdChange
  }) {
    const [expanded, setExpanded] = (0, import_react15.useState)(false);
    const options = [
      { value: "auto", label: "Auto (try all)" },
      ...recognizedIds.map((id) => ({ value: id, label: getIdLabel(id) }))
    ];
    if (uniprotId) {
      options.push({
        value: `uniprot:${uniprotId}`,
        label: `${uniprotId} (UniProt)`
      });
    }
    if (geneName) {
      options.push({
        value: `gene:${geneName}`,
        label: `${geneName} (gene name)`
      });
    }
    if (recognizedIds.length === 0 && !uniprotId && !geneName) {
      return null;
    }
    if (!expanded) {
      return /* @__PURE__ */ import_react15.default.createElement(
        import_material6.Button,
        {
          size: "small",
          variant: "text",
          onClick: () => {
            setExpanded(true);
          }
        },
        "Choose identifier to query..."
      );
    }
    return /* @__PURE__ */ import_react15.default.createElement(import_material6.FormControl, { size: "small" }, /* @__PURE__ */ import_react15.default.createElement(import_material6.InputLabel, null, "Query UniProt by"), /* @__PURE__ */ import_react15.default.createElement(
      import_material6.Select,
      {
        value: selectedId,
        label: "Query UniProt by",
        onChange: (e) => {
          onSelectedIdChange(e.target.value);
        }
      },
      options.map((opt) => /* @__PURE__ */ import_react15.default.createElement(import_material6.MenuItem, { key: opt.value, value: opt.value }, opt.label))
    ));
  }

  // src/LaunchProteinView/components/ProteinViewActions.tsx
  var import_react17 = __toESM(require_react());

  // node_modules/@mui/icons-material/esm/ArrowDropDown.js
  init_createSvgIcon();
  var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
  var ArrowDropDown_default = (0, import_utils.createSvgIcon)(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", {
    d: "m7 10 5 5 5-5z"
  }), "ArrowDropDown");

  // src/LaunchProteinView/components/ProteinViewActions.tsx
  var import_material8 = __toESM(require_material());

  // src/LaunchProteinView/components/AlignmentSettingsButton.tsx
  var import_react16 = __toESM(require_react());

  // node_modules/@mui/icons-material/esm/Settings.js
  init_createSvgIcon();
  var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
  var Settings_default = (0, import_utils.createSvgIcon)(/* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", {
    d: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6"
  }), "Settings");

  // src/LaunchProteinView/components/AlignmentSettingsButton.tsx
  var import_material7 = __toESM(require_material());
  init_esm2();

  // src/ProteinView/types.ts
  var ALIGNMENT_ALGORITHMS = {
    NEEDLEMAN_WUNSCH: "needleman_wunsch",
    SMITH_WATERMAN: "smith_waterman"
  };
  var DEFAULT_ALIGNMENT_ALGORITHM = "smith_waterman";
  var ALIGNMENT_ALGORITHM_LABELS = {
    needleman_wunsch: "Needleman-Wunsch",
    smith_waterman: "Smith-Waterman"
  };

  // src/LaunchProteinView/components/AlignmentSettingsButton.tsx
  function AlignmentSettingsButton({
    value,
    onChange,
    onManualAlignment
  }) {
    const [open, setOpen] = (0, import_react16.useState)(false);
    const [tabValue, setTabValue] = (0, import_react16.useState)(0);
    const [tempAlgorithm, setTempAlgorithm] = (0, import_react16.useState)(value);
    const [manualAlignment, setManualAlignment] = (0, import_react16.useState)("");
    const [parseError, setParseError] = (0, import_react16.useState)();
    const handleOpen = () => {
      setTempAlgorithm(value);
      setManualAlignment("");
      setParseError(void 0);
      setTabValue(0);
      setOpen(true);
    };
    const handleSave = () => {
      if (tabValue === 0) {
        onChange(tempAlgorithm);
      } else if (tabValue === 1 && manualAlignment.trim() && onManualAlignment) {
        try {
          const parsed = parsePairwise(manualAlignment.trim());
          onManualAlignment(parsed);
        } catch (e) {
          setParseError(`Failed to parse alignment: ${e}`);
          return;
        }
      }
      setOpen(false);
    };
    const handleCancel = () => {
      setTempAlgorithm(value);
      setManualAlignment("");
      setParseError(void 0);
      setOpen(false);
    };
    return /* @__PURE__ */ import_react16.default.createElement(import_react16.default.Fragment, null, /* @__PURE__ */ import_react16.default.createElement(import_material7.IconButton, { onClick: handleOpen, size: "small", title: "Alignment settings" }, /* @__PURE__ */ import_react16.default.createElement(Settings_default, null)), /* @__PURE__ */ import_react16.default.createElement(import_material7.Dialog, { open, onClose: handleCancel, maxWidth: "sm", fullWidth: true }, /* @__PURE__ */ import_react16.default.createElement(import_material7.DialogTitle, null, "Alignment Settings"), /* @__PURE__ */ import_react16.default.createElement(import_material7.DialogContent, null, /* @__PURE__ */ import_react16.default.createElement(
      import_material7.Tabs,
      {
        value: tabValue,
        onChange: (_, val) => {
          setTabValue(val);
        },
        sx: { mb: 2 }
      },
      /* @__PURE__ */ import_react16.default.createElement(import_material7.Tab, { label: "Automatic" }),
      /* @__PURE__ */ import_react16.default.createElement(import_material7.Tab, { label: "Manual", disabled: !onManualAlignment })
    ), tabValue === 0 ? /* @__PURE__ */ import_react16.default.createElement(import_react16.default.Fragment, null, /* @__PURE__ */ import_react16.default.createElement(import_material7.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Choose the algorithm for aligning transcript sequences to protein structures."), /* @__PURE__ */ import_react16.default.createElement(import_material7.FormControl, { component: "fieldset" }, /* @__PURE__ */ import_react16.default.createElement(import_material7.FormLabel, { component: "legend" }, "Algorithm"), /* @__PURE__ */ import_react16.default.createElement(
      import_material7.RadioGroup,
      {
        value: tempAlgorithm,
        onChange: (event) => {
          setTempAlgorithm(event.target.value);
        }
      },
      /* @__PURE__ */ import_react16.default.createElement(
        import_material7.FormControlLabel,
        {
          value: ALIGNMENT_ALGORITHMS.SMITH_WATERMAN,
          control: /* @__PURE__ */ import_react16.default.createElement(import_material7.Radio, null),
          label: "Smith-Waterman (local alignment)"
        }
      ),
      /* @__PURE__ */ import_react16.default.createElement(
        import_material7.Typography,
        {
          variant: "caption",
          color: "text.secondary",
          sx: { ml: 4, mt: -1, mb: 1 }
        },
        "Finds best matching region. Recommended for most use cases."
      ),
      /* @__PURE__ */ import_react16.default.createElement(
        import_material7.FormControlLabel,
        {
          value: ALIGNMENT_ALGORITHMS.NEEDLEMAN_WUNSCH,
          control: /* @__PURE__ */ import_react16.default.createElement(import_material7.Radio, null),
          label: "Needleman-Wunsch (global alignment)"
        }
      ),
      /* @__PURE__ */ import_react16.default.createElement(
        import_material7.Typography,
        {
          variant: "caption",
          color: "text.secondary",
          sx: { ml: 4, mt: -1, mb: 1 }
        },
        "End-to-end alignment. Use when sequences should align completely."
      )
    ))) : /* @__PURE__ */ import_react16.default.createElement(import_react16.default.Fragment, null, /* @__PURE__ */ import_react16.default.createElement(import_material7.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Paste a pre-computed alignment in Clustal format. The first sequence should be the transcript and the second should be the structure."), /* @__PURE__ */ import_react16.default.createElement(
      import_material7.TextField,
      {
        multiline: true,
        rows: 10,
        fullWidth: true,
        placeholder: `Example:
a  MKAAYLSMFGKEDHKPFGD
   |||||||||||||||||||
b  MKAAYLSMFGKEDHKPFGD`,
        value: manualAlignment,
        onChange: (e) => {
          setManualAlignment(e.target.value);
          setParseError(void 0);
        },
        sx: { fontFamily: "monospace", fontSize: 12 }
      }
    ), parseError ? /* @__PURE__ */ import_react16.default.createElement(import_material7.Typography, { color: "error", variant: "body2", sx: { mt: 1 } }, parseError) : null)), /* @__PURE__ */ import_react16.default.createElement(import_material7.DialogActions, null, /* @__PURE__ */ import_react16.default.createElement(import_material7.Button, { onClick: handleCancel }, "Cancel"), /* @__PURE__ */ import_react16.default.createElement(
      import_material7.Button,
      {
        onClick: handleSave,
        variant: "contained",
        color: "primary",
        disabled: tabValue === 1 && !manualAlignment.trim()
      },
      tabValue === 0 ? "Save" : "Apply Alignment"
    ))));
  }

  // src/LaunchProteinView/components/ProteinViewActions.tsx
  init_launchViewUtils();
  function ProteinViewActions({
    handleClose,
    uniprotId,
    userSelectedProteinSequence,
    selectedTranscript,
    url,
    confidenceUrl,
    feature,
    view,
    session,
    alignmentAlgorithm,
    onAlignmentAlgorithmChange,
    sequencesMatch,
    isLoading
  }) {
    const [dialogOpen, setDialogOpen] = (0, import_react17.useState)(false);
    const canLaunch = !!uniprotId && !!userSelectedProteinSequence && !!selectedTranscript;
    const missingReasons = isLoading ? [] : [
      !uniprotId && "No UniProt ID found",
      !userSelectedProteinSequence && "Could not compute protein sequence (feature may be missing CDS subfeatures)",
      !selectedTranscript && "No transcript selected"
    ].filter(Boolean);
    const handleLaunch3DView = () => {
      setDialogOpen(false);
      if (!selectedTranscript) {
        return;
      }
      launch3DProteinView({
        session,
        view,
        feature,
        selectedTranscript,
        uniprotId,
        url,
        userProvidedTranscriptSequence: userSelectedProteinSequence?.seq,
        alignmentAlgorithm
      });
      handleClose();
    };
    const handleLaunch1DView = async () => {
      setDialogOpen(false);
      if (!uniprotId || !selectedTranscript) {
        return;
      }
      try {
        await launch1DProteinView({
          session,
          view,
          feature,
          selectedTranscript,
          uniprotId,
          confidenceUrl
        });
      } catch (e) {
        console.error(e);
        session.notifyError(`${e}`, e);
      }
      handleClose();
    };
    const handleLaunchMSAView = () => {
      setDialogOpen(false);
      if (!selectedTranscript || !uniprotId) {
        return;
      }
      launchMsaView({
        session,
        view,
        feature,
        selectedTranscript,
        uniprotId
      });
      handleClose();
    };
    const handleLaunch3DWithMsa = () => {
      setDialogOpen(false);
      if (!selectedTranscript || !uniprotId) {
        return;
      }
      launch3DProteinViewWithMsa({
        session,
        view,
        feature,
        selectedTranscript,
        uniprotId,
        url,
        userProvidedTranscriptSequence: userSelectedProteinSequence?.seq,
        alignmentAlgorithm
      });
      handleClose();
    };
    return /* @__PURE__ */ import_react17.default.createElement(import_react17.default.Fragment, null, sequencesMatch === false ? /* @__PURE__ */ import_react17.default.createElement(
      import_material8.Typography,
      {
        variant: "body2",
        sx: { mr: 2, display: "flex", alignItems: "center" }
      },
      "Transcript and structure sequences differ, will run",
      " ",
      ALIGNMENT_ALGORITHM_LABELS[alignmentAlgorithm] ?? alignmentAlgorithm,
      " ",
      "alignment",
      /* @__PURE__ */ import_react17.default.createElement(
        AlignmentSettingsButton,
        {
          value: alignmentAlgorithm,
          onChange: onAlignmentAlgorithmChange
        }
      )
    ) : null, /* @__PURE__ */ import_react17.default.createElement(
      import_material8.Button,
      {
        variant: "contained",
        color: "secondary",
        size: "small",
        onClick: () => {
          handleClose();
        }
      },
      "Cancel"
    ), !canLaunch ? /* @__PURE__ */ import_react17.default.createElement(import_material8.Typography, { variant: "body2", color: "error", sx: { mr: 2 } }, missingReasons.join(". ")) : null, /* @__PURE__ */ import_react17.default.createElement(import_material8.ButtonGroup, { variant: "contained", color: "primary", size: "small" }, /* @__PURE__ */ import_react17.default.createElement(import_material8.Button, { disabled: !canLaunch, onClick: handleLaunch3DView }, "Launch"), /* @__PURE__ */ import_react17.default.createElement(
      import_material8.Button,
      {
        disabled: !canLaunch,
        onClick: () => {
          setDialogOpen(true);
        },
        "aria-label": "More launch options"
      },
      /* @__PURE__ */ import_react17.default.createElement(ArrowDropDown_default, null)
    )), /* @__PURE__ */ import_react17.default.createElement(
      import_material8.Dialog,
      {
        open: dialogOpen,
        onClose: () => {
          setDialogOpen(false);
        }
      },
      /* @__PURE__ */ import_react17.default.createElement(import_material8.DialogTitle, null, "Launch options"),
      /* @__PURE__ */ import_react17.default.createElement(import_material8.DialogContent, null, /* @__PURE__ */ import_react17.default.createElement(import_material8.MenuList, null, /* @__PURE__ */ import_react17.default.createElement(import_material8.MenuItem, { onClick: handleLaunch3DView }, /* @__PURE__ */ import_react17.default.createElement("div", null, /* @__PURE__ */ import_react17.default.createElement(import_material8.Typography, { variant: "body1" }, "Launch 3D protein structure view"), /* @__PURE__ */ import_react17.default.createElement(import_material8.Typography, { variant: "body2", color: "text.secondary" }, "View protein structure with genome-to-structure coordinate mapping"))), /* @__PURE__ */ import_react17.default.createElement(
        import_material8.MenuItem,
        {
          onClick: () => {
            handleLaunch1DView().catch((e) => {
              console.error(e);
            });
          }
        },
        /* @__PURE__ */ import_react17.default.createElement("div", null, /* @__PURE__ */ import_react17.default.createElement(import_material8.Typography, { variant: "body1" }, "Launch 1D protein annotation view"), /* @__PURE__ */ import_react17.default.createElement(import_material8.Typography, { variant: "body2", color: "text.secondary" }, "View protein features and annotations as a linear track"))
      ), hasMsaViewPlugin() ? [
        /* @__PURE__ */ import_react17.default.createElement(import_material8.MenuItem, { key: "msa", onClick: handleLaunchMSAView }, /* @__PURE__ */ import_react17.default.createElement("div", null, /* @__PURE__ */ import_react17.default.createElement(import_material8.Typography, { variant: "body1" }, "Launch MSA view"), /* @__PURE__ */ import_react17.default.createElement(import_material8.Typography, { variant: "body2", color: "text.secondary" }, "View AlphaFold a3m multiple sequence alignment"))),
        /* @__PURE__ */ import_react17.default.createElement(import_material8.MenuItem, { key: "3d-msa", onClick: handleLaunch3DWithMsa }, /* @__PURE__ */ import_react17.default.createElement("div", null, /* @__PURE__ */ import_react17.default.createElement(import_material8.Typography, { variant: "body1" }, "Launch 3D structure + MSA view"), /* @__PURE__ */ import_react17.default.createElement(import_material8.Typography, { variant: "body2", color: "text.secondary" }, "Launch both views with AlphaFold a3m MSA")))
      ] : null))
    ));
  }

  // src/LaunchProteinView/components/SequenceSearchStatus.tsx
  var import_react18 = __toESM(require_react());
  var import_material9 = __toESM(require_material());
  function SequenceSearchStatus({
    isLoading,
    uniprotId,
    url,
    hasProteinSequence,
    sequenceSearchType
  }) {
    if (isLoading) {
      return null;
    }
    if (!uniprotId && hasProteinSequence) {
      return /* @__PURE__ */ import_react18.default.createElement(import_material9.Typography, { color: "warning.main" }, "No AlphaFold structure found for this sequence (searched by", " ", sequenceSearchType === "md5" ? "MD5 checksum" : "full sequence", ")");
    }
    if (uniprotId) {
      return /* @__PURE__ */ import_react18.default.createElement(import_material9.Typography, { color: "success.main" }, "Found AlphaFold structure: ", uniprotId, url && /* @__PURE__ */ import_react18.default.createElement(import_react18.default.Fragment, null, " ", "-", " ", /* @__PURE__ */ import_react18.default.createElement("a", { href: url, target: "_blank", rel: "noreferrer" }, url)));
    }
    return null;
  }

  // src/LaunchProteinView/components/TranscriptSelector.tsx
  var import_react19 = __toESM(require_react());
  var import_material10 = __toESM(require_material());
  init_util();
  function TranscriptSelector({
    val,
    setVal,
    isoforms,
    isoformSequences,
    structureSequence,
    feature,
    disabled
  }) {
    const geneName = getGeneDisplayName(feature);
    const matches = [];
    const nonMatches = [];
    const noData = [];
    for (const f of isoforms) {
      const entry = isoformSequences[f.id()];
      if (!entry) {
        noData.push(f);
      } else if (structureSequence && stripStopCodon(entry.seq) === structureSequence) {
        matches.push(f);
      } else {
        nonMatches.push(f);
      }
    }
    matches.sort(
      (a, b) => isoformSequences[b.id()].seq.length - isoformSequences[a.id()].seq.length
    );
    nonMatches.sort(
      (a, b) => isoformSequences[b.id()].seq.length - isoformSequences[a.id()].seq.length
    );
    return /* @__PURE__ */ import_react19.default.createElement(
      import_material10.TextField,
      {
        value: val,
        onChange: (event) => {
          setVal(event.target.value);
        },
        label: "Choose transcript isoform",
        select: true,
        disabled
      },
      matches.map((f) => /* @__PURE__ */ import_react19.default.createElement(import_material10.MenuItem, { value: f.id(), key: f.id() }, geneName, " - ", getTranscriptDisplayName(f), " (", isoformSequences[f.id()].seq.length, "aa) (matches structure residues)")),
      nonMatches.map((f) => /* @__PURE__ */ import_react19.default.createElement(import_material10.MenuItem, { value: f.id(), key: f.id() }, geneName, " - ", getTranscriptDisplayName(f), " (", isoformSequences[f.id()].seq.length, "aa)")),
      noData.map((f) => /* @__PURE__ */ import_react19.default.createElement(import_material10.MenuItem, { value: f.id(), key: f.id(), disabled: true }, geneName, " - ", getTranscriptDisplayName(f), " (no data)"))
    );
  }

  // src/LaunchProteinView/components/UniProtIdInput.tsx
  var import_react20 = __toESM(require_react());
  var import_material11 = __toESM(require_material());
  function UniProtIdInput({
    lookupMode,
    onLookupModeChange,
    manualUniprotId,
    onManualUniprotIdChange,
    featureUniprotId,
    hasProteinSequence,
    sequenceSearchType,
    onSequenceSearchTypeChange,
    endContent
  }) {
    return /* @__PURE__ */ import_react20.default.createElement(import_react20.default.Fragment, null, /* @__PURE__ */ import_react20.default.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ import_react20.default.createElement(import_material11.FormControl, { component: "fieldset" }, /* @__PURE__ */ import_react20.default.createElement(
      import_material11.RadioGroup,
      {
        row: true,
        value: lookupMode,
        onChange: (event) => {
          onLookupModeChange(event.target.value);
        }
      },
      featureUniprotId && /* @__PURE__ */ import_react20.default.createElement(
        import_material11.FormControlLabel,
        {
          value: "feature",
          control: /* @__PURE__ */ import_react20.default.createElement(import_material11.Radio, null),
          label: `From feature (${featureUniprotId})`
        }
      ),
      /* @__PURE__ */ import_react20.default.createElement(
        import_material11.FormControlLabel,
        {
          value: "auto",
          control: /* @__PURE__ */ import_react20.default.createElement(import_material11.Radio, null),
          label: "Auto-detect using UniProt ID mapping API"
        }
      ),
      /* @__PURE__ */ import_react20.default.createElement(
        import_material11.FormControlLabel,
        {
          value: "manual",
          control: /* @__PURE__ */ import_react20.default.createElement(import_material11.Radio, null),
          label: "Enter manually"
        }
      ),
      hasProteinSequence && /* @__PURE__ */ import_react20.default.createElement(
        import_material11.FormControlLabel,
        {
          value: "sequence",
          control: /* @__PURE__ */ import_react20.default.createElement(import_material11.Radio, null),
          label: "Search sequence against AlphaFoldDB API"
        }
      )
    )), endContent), lookupMode === "manual" && /* @__PURE__ */ import_react20.default.createElement("div", null, /* @__PURE__ */ import_react20.default.createElement(
      import_material11.TextField,
      {
        label: "UniProt ID",
        variant: "outlined",
        placeholder: "e.g. P68871",
        size: "small",
        value: manualUniprotId,
        onChange: (e) => {
          onManualUniprotIdChange(e.target.value);
        }
      }
    )), lookupMode === "sequence" && sequenceSearchType && onSequenceSearchTypeChange && /* @__PURE__ */ import_react20.default.createElement("div", null, /* @__PURE__ */ import_react20.default.createElement(import_material11.FormControl, { component: "fieldset" }, /* @__PURE__ */ import_react20.default.createElement(
      import_material11.RadioGroup,
      {
        row: true,
        value: sequenceSearchType,
        onChange: (event) => {
          onSequenceSearchTypeChange(
            event.target.value
          );
        }
      },
      /* @__PURE__ */ import_react20.default.createElement(
        import_material11.FormControlLabel,
        {
          value: "md5",
          control: /* @__PURE__ */ import_react20.default.createElement(import_material11.Radio, null),
          label: "Exact match"
        }
      ),
      /* @__PURE__ */ import_react20.default.createElement(
        import_material11.FormControlLabel,
        {
          value: "sequence",
          control: /* @__PURE__ */ import_react20.default.createElement(import_material11.Radio, null),
          label: "Fuzzy match"
        }
      )
    )), /* @__PURE__ */ import_react20.default.createElement(import_material11.Typography, { variant: "body2", color: "text.secondary" }, "May not find the canonical UniProt entry.")), lookupMode === "manual" && !manualUniprotId && /* @__PURE__ */ import_react20.default.createElement(import_material11.Typography, { variant: "body2", color: "text.secondary" }, "Search", " ", /* @__PURE__ */ import_react20.default.createElement(ExternalLink, { href: "https://www.uniprot.org/" }, "UniProt"), " or ", /* @__PURE__ */ import_react20.default.createElement(ExternalLink, { href: "https://alphafold.ebi.ac.uk/" }, "AlphaFoldDB")));
  }

  // src/LaunchProteinView/components/UniProtResultsTable.tsx
  var import_react21 = __toESM(require_react());
  var import_material12 = __toESM(require_material());
  var import_mui4 = __toESM(require_mui());
  var useStyles4 = (0, import_mui4.makeStyles)()({
    tableContainer: {
      maxHeight: 200
    },
    headerCell: {
      fontWeight: "bold",
      backgroundColor: "#f5f5f5"
    },
    selectedRow: {
      backgroundColor: "#e3f2fd"
    },
    clickableRow: {
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#f5f5f5"
      }
    },
    reviewedChip: {
      backgroundColor: "#4caf50",
      color: "white",
      fontSize: "0.7rem",
      height: 20
    },
    unreviewedChip: {
      backgroundColor: "#ff9800",
      color: "white",
      fontSize: "0.7rem",
      height: 20
    }
  });
  function UniProtResultsTable({
    entries,
    selectedAccession,
    onSelect
  }) {
    const { classes, cx } = useStyles4();
    if (entries.length === 0) {
      return null;
    }
    return /* @__PURE__ */ import_react21.default.createElement("div", null, /* @__PURE__ */ import_react21.default.createElement(import_material12.Typography, { variant: "body2", sx: { mb: 1 } }, "Found ", entries.length, " UniProt entries. Select one:"), /* @__PURE__ */ import_react21.default.createElement(import_material12.TableContainer, { component: import_material12.Paper, className: classes.tableContainer }, /* @__PURE__ */ import_react21.default.createElement(import_material12.Table, { size: "small", stickyHeader: true }, /* @__PURE__ */ import_react21.default.createElement(import_material12.TableHead, null, /* @__PURE__ */ import_react21.default.createElement(import_material12.TableRow, null, /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, { className: classes.headerCell, padding: "checkbox" }), /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, { className: classes.headerCell }, "Accession"), /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, { className: classes.headerCell }, "Gene"), /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, { className: classes.headerCell }, "Organism"), /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, { className: classes.headerCell }, "Protein"), /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, { className: classes.headerCell }, "Status"))), /* @__PURE__ */ import_react21.default.createElement(import_material12.TableBody, null, entries.map((entry) => /* @__PURE__ */ import_react21.default.createElement(
      import_material12.TableRow,
      {
        key: entry.accession,
        onClick: () => {
          onSelect(entry.accession);
        },
        className: cx(
          classes.clickableRow,
          selectedAccession === entry.accession && classes.selectedRow
        )
      },
      /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, { padding: "checkbox" }, /* @__PURE__ */ import_react21.default.createElement(
        import_material12.Radio,
        {
          checked: selectedAccession === entry.accession,
          size: "small"
        }
      )),
      /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, null, /* @__PURE__ */ import_react21.default.createElement(
        ExternalLink,
        {
          href: `https://www.uniprot.org/uniprotkb/${entry.accession}`
        },
        entry.accession
      )),
      /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, null, entry.geneName ?? "-"),
      /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, null, entry.organismName ?? "-"),
      /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, null, entry.proteinName ? entry.proteinName.length > 40 ? `${entry.proteinName.slice(0, 40)}...` : entry.proteinName : "-"),
      /* @__PURE__ */ import_react21.default.createElement(import_material12.TableCell, null, /* @__PURE__ */ import_react21.default.createElement(
        import_material12.Chip,
        {
          label: entry.isReviewed ? "Reviewed" : "Unreviewed",
          size: "small",
          className: entry.isReviewed ? classes.reviewedChip : classes.unreviewedChip
        }
      ))
    ))))));
  }

  // src/LaunchProteinView/hooks/useAlphaFoldDBSearch.ts
  var import_react27 = __toESM(require_react());

  // src/LaunchProteinView/hooks/useAlphaFoldData.ts
  var import_react25 = __toESM(require_react());

  // src/LaunchProteinView/hooks/useAlphaFoldUrl.ts
  init_index();

  // src/fetchUtils.ts
  async function myfetch(url, args) {
    const response = await fetch(url, args);
    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} fetching ${url} ${await response.text()}`
      );
    }
    return response;
  }
  async function jsonfetch(url, args) {
    const response = await myfetch(url, args);
    return response.json();
  }
  function timeout(time) {
    return new Promise((res) => setTimeout(res, time));
  }

  // src/LaunchProteinView/hooks/useAlphaFoldUrl.ts
  function useAlphaFoldUrl({ uniprotId }) {
    const { data, error, isLoading } = useSWR(
      uniprotId ? `https://alphafold.ebi.ac.uk/api/prediction/${uniprotId}` : null,
      jsonfetch,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true
      }
    );
    return {
      isLoading,
      predictions: data,
      error
    };
  }

  // src/LaunchProteinView/hooks/useRemoteStructureFileSequence.ts
  init_index();

  // src/ProteinView/addStructureFromURL.ts
  async function addStructureFromURL({
    url,
    format = "mmcif",
    isBinary,
    options,
    plugin
  }) {
    const data = await plugin.builders.data.download(
      {
        url,
        isBinary
      },
      {
        state: {
          isGhost: true
        }
      }
    );
    const trajectory = await plugin.builders.structure.parseTrajectory(
      data,
      format
    );
    const model = await plugin.builders.structure.createModel(trajectory);
    await plugin.builders.structure.hierarchy.applyPreset(
      trajectory,
      "all-models",
      {
        useDefaultIfSingleModel: true,
        representationPresetParams: options?.representationParams
      }
    );
    return { model };
  }

  // src/ProteinView/extractStructureSequences.ts
  function extractStructureSequences(model) {
    return model.obj?.data.sequence.sequences.map((s) => {
      const arr = s.sequence.label.toArray();
      let seq = "";
      for (let i = 0; i < arr.length; i++) {
        seq += arr[i];
      }
      return seq;
    });
  }

  // src/ProteinView/withTemporaryMolstarPlugin.ts
  init_loadMolstar();
  async function withTemporaryMolstarPlugin(callback) {
    const { createPluginUI, renderReact18 } = await loadMolstar();
    const ret = document.createElement("div");
    const plugin = await createPluginUI({
      target: ret,
      render: renderReact18
    });
    try {
      return await callback(plugin);
    } finally {
      plugin.unmount();
      ret.remove();
    }
  }

  // src/LaunchProteinView/hooks/useRemoteStructureFileSequence.ts
  async function structureFileSequenceFetcher(url) {
    return withTemporaryMolstarPlugin(async (plugin) => {
      const { model } = await addStructureFromURL({ url, plugin });
      return extractStructureSequences(model);
    });
  }
  function useRemoteStructureFileSequence({
    url
  }) {
    const { data, error, isLoading } = useSWR(
      url ? ["remote-structure", url] : null,
      async () => {
        if (!url) {
          return void 0;
        }
        const seq = await structureFileSequenceFetcher(url);
        if (!seq) {
          throw new Error("no sequences detected in file");
        }
        return seq;
      },
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true
      }
    );
    return { error, isLoading, sequences: data };
  }

  // src/LaunchProteinView/hooks/useAlphaFoldData.ts
  init_launchViewUtils();
  function useAlphaFoldData({
    uniprotId,
    useApiSearch = false
  }) {
    const [selectedEntryIndex, setSelectedEntryIndex] = (0, import_react25.useState)(0);
    const hardcodedUrl = (0, import_react25.useMemo)(
      () => uniprotId ? getAlphaFoldStructureUrl(uniprotId) : void 0,
      [uniprotId]
    );
    const {
      predictions,
      isLoading: isApiLoading,
      error: apiError
    } = useAlphaFoldUrl({ uniprotId: useApiSearch ? uniprotId : void 0 });
    (0, import_react25.useEffect)(() => {
      if (predictions && predictions.length > 0) {
        setSelectedEntryIndex(0);
      }
    }, [predictions]);
    const selectedPrediction = predictions?.[selectedEntryIndex];
    const url = useApiSearch ? selectedPrediction?.cifUrl : hardcodedUrl;
    const confidenceUrl = selectedPrediction?.plddtDocUrl;
    const {
      sequences,
      isLoading: isSequenceLoading,
      error: sequenceError
    } = useRemoteStructureFileSequence({ url });
    const structureSequence = sequences?.[0];
    const isLoading = isApiLoading || isSequenceLoading;
    const error = apiError ?? sequenceError;
    return {
      predictions,
      isLoading,
      error,
      selectedEntryIndex,
      setSelectedEntryIndex,
      selectedPrediction,
      url,
      confidenceUrl,
      structureSequence
    };
  }

  // src/LaunchProteinView/hooks/useAlphaFoldSequenceSearch.ts
  var import_react26 = __toESM(require_react());
  init_index();

  // src/LaunchProteinView/utils/md5.ts
  function safeAdd(x, y) {
    const lsw = (x & 65535) + (y & 65535);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return msw << 16 | lsw & 65535;
  }
  function bitRotateLeft(num, cnt) {
    return num << cnt | num >>> 32 - cnt;
  }
  function md5cmn(q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a, b, c, d, x, s, t) {
    return md5cmn(b & c | ~b & d, a, b, x, s, t);
  }
  function md5gg(a, b, c, d, x, s, t) {
    return md5cmn(b & d | c & ~d, a, b, x, s, t);
  }
  function md5hh(a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function binlMd5(x, len) {
    x[len >> 5] |= 128 << len % 32;
    x[(len + 64 >>> 9 << 4) + 14] = len;
    let a = 1732584193;
    let b = -271733879;
    let c = -1732584194;
    let d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const olda = a;
      const oldb = b;
      const oldc = c;
      const oldd = d;
      a = md5ff(a, b, c, d, x[i] ?? 0, 7, -680876936);
      d = md5ff(d, a, b, c, x[i + 1] ?? 0, 12, -389564586);
      c = md5ff(c, d, a, b, x[i + 2] ?? 0, 17, 606105819);
      b = md5ff(b, c, d, a, x[i + 3] ?? 0, 22, -1044525330);
      a = md5ff(a, b, c, d, x[i + 4] ?? 0, 7, -176418897);
      d = md5ff(d, a, b, c, x[i + 5] ?? 0, 12, 1200080426);
      c = md5ff(c, d, a, b, x[i + 6] ?? 0, 17, -1473231341);
      b = md5ff(b, c, d, a, x[i + 7] ?? 0, 22, -45705983);
      a = md5ff(a, b, c, d, x[i + 8] ?? 0, 7, 1770035416);
      d = md5ff(d, a, b, c, x[i + 9] ?? 0, 12, -1958414417);
      c = md5ff(c, d, a, b, x[i + 10] ?? 0, 17, -42063);
      b = md5ff(b, c, d, a, x[i + 11] ?? 0, 22, -1990404162);
      a = md5ff(a, b, c, d, x[i + 12] ?? 0, 7, 1804603682);
      d = md5ff(d, a, b, c, x[i + 13] ?? 0, 12, -40341101);
      c = md5ff(c, d, a, b, x[i + 14] ?? 0, 17, -1502002290);
      b = md5ff(b, c, d, a, x[i + 15] ?? 0, 22, 1236535329);
      a = md5gg(a, b, c, d, x[i + 1] ?? 0, 5, -165796510);
      d = md5gg(d, a, b, c, x[i + 6] ?? 0, 9, -1069501632);
      c = md5gg(c, d, a, b, x[i + 11] ?? 0, 14, 643717713);
      b = md5gg(b, c, d, a, x[i] ?? 0, 20, -373897302);
      a = md5gg(a, b, c, d, x[i + 5] ?? 0, 5, -701558691);
      d = md5gg(d, a, b, c, x[i + 10] ?? 0, 9, 38016083);
      c = md5gg(c, d, a, b, x[i + 15] ?? 0, 14, -660478335);
      b = md5gg(b, c, d, a, x[i + 4] ?? 0, 20, -405537848);
      a = md5gg(a, b, c, d, x[i + 9] ?? 0, 5, 568446438);
      d = md5gg(d, a, b, c, x[i + 14] ?? 0, 9, -1019803690);
      c = md5gg(c, d, a, b, x[i + 3] ?? 0, 14, -187363961);
      b = md5gg(b, c, d, a, x[i + 8] ?? 0, 20, 1163531501);
      a = md5gg(a, b, c, d, x[i + 13] ?? 0, 5, -1444681467);
      d = md5gg(d, a, b, c, x[i + 2] ?? 0, 9, -51403784);
      c = md5gg(c, d, a, b, x[i + 7] ?? 0, 14, 1735328473);
      b = md5gg(b, c, d, a, x[i + 12] ?? 0, 20, -1926607734);
      a = md5hh(a, b, c, d, x[i + 5] ?? 0, 4, -378558);
      d = md5hh(d, a, b, c, x[i + 8] ?? 0, 11, -2022574463);
      c = md5hh(c, d, a, b, x[i + 11] ?? 0, 16, 1839030562);
      b = md5hh(b, c, d, a, x[i + 14] ?? 0, 23, -35309556);
      a = md5hh(a, b, c, d, x[i + 1] ?? 0, 4, -1530992060);
      d = md5hh(d, a, b, c, x[i + 4] ?? 0, 11, 1272893353);
      c = md5hh(c, d, a, b, x[i + 7] ?? 0, 16, -155497632);
      b = md5hh(b, c, d, a, x[i + 10] ?? 0, 23, -1094730640);
      a = md5hh(a, b, c, d, x[i + 13] ?? 0, 4, 681279174);
      d = md5hh(d, a, b, c, x[i] ?? 0, 11, -358537222);
      c = md5hh(c, d, a, b, x[i + 3] ?? 0, 16, -722521979);
      b = md5hh(b, c, d, a, x[i + 6] ?? 0, 23, 76029189);
      a = md5hh(a, b, c, d, x[i + 9] ?? 0, 4, -640364487);
      d = md5hh(d, a, b, c, x[i + 12] ?? 0, 11, -421815835);
      c = md5hh(c, d, a, b, x[i + 15] ?? 0, 16, 530742520);
      b = md5hh(b, c, d, a, x[i + 2] ?? 0, 23, -995338651);
      a = md5ii(a, b, c, d, x[i] ?? 0, 6, -198630844);
      d = md5ii(d, a, b, c, x[i + 7] ?? 0, 10, 1126891415);
      c = md5ii(c, d, a, b, x[i + 14] ?? 0, 15, -1416354905);
      b = md5ii(b, c, d, a, x[i + 5] ?? 0, 21, -57434055);
      a = md5ii(a, b, c, d, x[i + 12] ?? 0, 6, 1700485571);
      d = md5ii(d, a, b, c, x[i + 3] ?? 0, 10, -1894986606);
      c = md5ii(c, d, a, b, x[i + 10] ?? 0, 15, -1051523);
      b = md5ii(b, c, d, a, x[i + 1] ?? 0, 21, -2054922799);
      a = md5ii(a, b, c, d, x[i + 8] ?? 0, 6, 1873313359);
      d = md5ii(d, a, b, c, x[i + 15] ?? 0, 10, -30611744);
      c = md5ii(c, d, a, b, x[i + 6] ?? 0, 15, -1560198380);
      b = md5ii(b, c, d, a, x[i + 13] ?? 0, 21, 1309151649);
      a = md5ii(a, b, c, d, x[i + 4] ?? 0, 6, -145523070);
      d = md5ii(d, a, b, c, x[i + 11] ?? 0, 10, -1120210379);
      c = md5ii(c, d, a, b, x[i + 2] ?? 0, 15, 718787259);
      b = md5ii(b, c, d, a, x[i + 9] ?? 0, 21, -343485551);
      a = safeAdd(a, olda);
      b = safeAdd(b, oldb);
      c = safeAdd(c, oldc);
      d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }
  function binl2hex(binarray) {
    const hexTab = "0123456789abcdef";
    let str = "";
    for (let i = 0; i < binarray.length * 4; i++) {
      str += hexTab.charAt(binarray[i >> 2] >> i % 4 * 8 + 4 & 15) + hexTab.charAt(binarray[i >> 2] >> i % 4 * 8 & 15);
    }
    return str;
  }
  function str2binl(str) {
    const bin = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] = (bin[i >> 5] ?? 0) | (str.charCodeAt(i / 8) & mask) << i % 32;
    }
    return bin;
  }
  function md5(str) {
    return binl2hex(binlMd5(str2binl(str), str.length * 8));
  }

  // src/LaunchProteinView/hooks/useAlphaFoldSequenceSearch.ts
  init_util();
  function useAlphaFoldSequenceSearch({
    sequence,
    searchType,
    enabled = true
  }) {
    const searchValue = (0, import_react26.useMemo)(() => {
      if (!sequence) {
        return void 0;
      }
      const cleanSeq = stripStopCodon(sequence.toUpperCase());
      return searchType === "md5" ? md5(cleanSeq) : cleanSeq;
    }, [sequence, searchType]);
    const { data, error, isLoading } = useSWR(
      enabled && searchValue ? `https://alphafold.ebi.ac.uk/api/sequence/summary?id=${encodeURIComponent(searchValue)}&type=${searchType}` : null,
      jsonfetch,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true
      }
    );
    return {
      isLoading,
      result: data,
      uniprotId: data?.uniprotAccession,
      cifUrl: data?.cifUrl,
      plddtDocUrl: data?.plddtDocUrl,
      structureSequence: data?.sequence,
      error
    };
  }

  // src/LaunchProteinView/hooks/useIsoformProteinSequences.ts
  init_index();

  // src/LaunchProteinView/utils/calculateProteinSequence.ts
  var import_configuration3 = __toESM(require_configuration());
  var import_util24 = __toESM(require_util());
  function stitch(subfeats, sequence) {
    return subfeats.map((sub2) => sequence.slice(sub2.start, sub2.end)).join("");
  }
  function calculateProteinSequence({
    cds,
    sequence,
    codonTable
  }) {
    const str = stitch(cds, sequence);
    let protein = "";
    for (let i = 0; i < str.length; i += 3) {
      protein += codonTable[str.slice(i, i + 3)] ?? "&";
    }
    return protein;
  }
  function revlist(list, seqlen) {
    return list.map((sub2) => ({
      ...sub2,
      start: seqlen - sub2.end,
      end: seqlen - sub2.start
    })).toSorted((a, b) => a.start - b.start);
  }
  function getItemId(feat) {
    return `${feat.start}-${feat.end}`;
  }
  function dedupe(list) {
    return list.filter(
      (item, pos, ary) => !pos || getItemId(item) !== getItemId(ary[pos - 1])
    );
  }
  function getProteinSequence({
    feature,
    seq
  }) {
    const f = feature.toJSON();
    const subfeatures = f.subfeatures;
    const cds = dedupe(
      subfeatures.toSorted((a, b) => a.start - b.start).map((sub2) => ({
        ...sub2,
        start: sub2.start - f.start,
        end: sub2.end - f.start
      })).filter((f2) => f2.type === "CDS")
    );
    return calculateProteinSequence({
      cds: f.strand === -1 ? revlist(cds, seq.length) : cds,
      sequence: f.strand === -1 ? (0, import_util24.revcom)(seq) : seq,
      codonTable: (0, import_util24.generateCodonTable)(import_util24.defaultCodonTable)
    });
  }
  async function fetchProteinSeq({
    feature,
    view
  }) {
    const start = feature.get("start");
    const end = feature.get("end");
    const refName = feature.get("refName");
    const session = (0, import_util24.getSession)(view);
    const { assemblyManager, rpcManager } = session;
    const assemblyName = view?.assemblyNames?.[0];
    const assembly = assemblyName ? await assemblyManager.waitForAssembly(assemblyName) : void 0;
    if (!assembly) {
      throw new Error("assembly not found");
    }
    const sessionId = "getSequence";
    const feats = await rpcManager.call(sessionId, "CoreGetFeatures", {
      adapterConfig: (0, import_configuration3.getConf)(assembly, ["sequence", "adapter"]),
      sessionId,
      regions: [
        {
          start,
          end,
          refName: assembly.getCanonicalRefName(refName),
          assemblyName
        }
      ]
    });
    const [feat] = feats;
    const seq = feat?.get("seq");
    return seq ? getProteinSequence({ seq, feature }) : void 0;
  }

  // src/LaunchProteinView/hooks/useIsoformProteinSequences.ts
  init_util();
  function useIsoformProteinSequences({
    feature,
    view
  }) {
    const { data, error, isLoading } = useSWR(
      ["isoform-sequences", feature.id(), view?.assemblyNames?.[0]],
      async () => {
        const ret = [];
        const transcripts = getTranscriptFeatures(feature);
        for (const f of transcripts) {
          try {
            const seq = await fetchProteinSeq({
              view,
              feature: f
            });
            if (seq) {
              ret.push([f.id(), { feature: f, seq }]);
            }
          } catch (e) {
            console.error("[useIsoformProteinSequences] error for", f.id(), e);
          }
        }
        return Object.fromEntries(ret);
      },
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true
      }
    );
    return { isLoading, isoformSequences: data, error };
  }

  // src/LaunchProteinView/hooks/useUniProtSearch.ts
  init_index();

  // src/LaunchProteinView/services/lookupMethods.ts
  init_util();
  var UNIPROT_FIELDS = "accession,id,gene_names,organism_name,protein_name,reviewed";
  function mapApiResultToEntry(result) {
    return {
      accession: result.primaryAccession,
      id: result.uniProtkbId,
      geneName: result.genes?.[0]?.geneName?.value,
      organismName: result.organism?.commonName ?? result.organism?.scientificName,
      proteinName: result.proteinDescription?.recommendedName?.fullName?.value,
      isReviewed: result.entryType === "UniProtKB reviewed (Swiss-Prot)"
    };
  }
  function buildXrefQuery(id) {
    const dbType = getDatabaseTypeForId(id);
    switch (dbType) {
      case "ensembl":
        return `xref:ensembl-${id}`;
      case "refseq":
        return `xref:refseq-${id}`;
      case "ccds":
        return `xref:ccds-${id}`;
      case "hgnc":
        return `xref:hgnc-${id.replace("HGNC:", "")}`;
      default:
        return void 0;
    }
  }
  async function searchUniProt(query, size = 10) {
    const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&fields=${UNIPROT_FIELDS}&size=${size}`;
    const data = await jsonfetch(url);
    return data.results.map(mapApiResultToEntry);
  }
  async function searchByXref(id) {
    const query = buildXrefQuery(id);
    if (query) {
      try {
        return await searchUniProt(query);
      } catch (e) {
        console.error(`xref search failed for ${id}:`, e);
      }
    }
    return [];
  }
  function deduplicateEntries(entries) {
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (const entry of entries) {
      if (!seen.has(entry.accession)) {
        seen.add(entry.accession);
        result.push(entry);
      }
    }
    return result;
  }
  async function searchUniProtEntries({
    recognizedIds = [],
    geneId,
    geneName,
    organismId = 9606
  }) {
    const idsToSearch = new Set(recognizedIds);
    const strippedGeneId = geneId ? stripTrailingVersion(geneId) : void 0;
    if (strippedGeneId && isRecognizedDatabaseId(strippedGeneId)) {
      idsToSearch.add(strippedGeneId);
    }
    const xrefResults = await Promise.all([...idsToSearch].map(searchByXref));
    let entries = deduplicateEntries(xrefResults.flat());
    if (!entries.some((e) => e.isReviewed) && geneName) {
      try {
        const query = `gene:${geneName}+AND+organism_id:${organismId}+AND+reviewed:true`;
        const geneNameResults = await searchUniProt(query, 5);
        entries = deduplicateEntries([...entries, ...geneNameResults]);
      } catch (e) {
        console.error(`gene name search failed for ${geneName}:`, e);
      }
    }
    return entries.toSorted((a, b) => Number(b.isReviewed) - Number(a.isReviewed));
  }

  // src/LaunchProteinView/hooks/useUniProtSearch.ts
  init_util();
  function useUniProtSearch({
    recognizedIds = [],
    uniprotId,
    geneId,
    geneName,
    selectedQueryId = "auto",
    enabled = true
  }) {
    const isDirectUniProt = selectedQueryId.startsWith("uniprot:");
    const directUniProtId = isDirectUniProt ? selectedQueryId.replace("uniprot:", "") : void 0;
    let idsToSearch = [];
    let geneNameToSearch;
    if (selectedQueryId === "auto") {
      idsToSearch = recognizedIds;
      geneNameToSearch = geneName;
    } else if (selectedQueryId.startsWith("gene:")) {
      geneNameToSearch = selectedQueryId.replace("gene:", "");
    } else if (isRecognizedDatabaseId(selectedQueryId)) {
      idsToSearch = [selectedQueryId];
    }
    const hasRecognizedId = idsToSearch.some((id) => isRecognizedDatabaseId(id));
    const hasValidId = hasRecognizedId || Boolean(geneNameToSearch) || Boolean(uniprotId);
    const { data, error, isLoading } = useSWR(
      enabled && hasValidId && !isDirectUniProt ? [
        "uniprotSearch",
        selectedQueryId,
        idsToSearch.join(","),
        geneNameToSearch
      ] : null,
      async () => searchUniProtEntries({
        recognizedIds: idsToSearch,
        geneId,
        geneName: geneNameToSearch
      }),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true
      }
    );
    if (isDirectUniProt && directUniProtId) {
      return {
        entries: [{ accession: directUniProtId, isReviewed: true }],
        isLoading: false,
        error: void 0,
        hasValidId: true
      };
    }
    return {
      entries: data ?? [],
      isLoading,
      error,
      hasValidId
    };
  }

  // src/LaunchProteinView/utils/getSearchDescription.ts
  function getSearchDescription({
    selectedQueryId,
    recognizedIds,
    geneName,
    joinWord = "and"
  }) {
    if (selectedQueryId === "auto") {
      return [
        recognizedIds.length > 0 ? `database ID${recognizedIds.length > 1 ? "s" : ""} "${recognizedIds.join('", "')}"` : void 0,
        geneName ? `gene name "${geneName}"` : void 0
      ].filter(Boolean).join(` ${joinWord} `);
    }
    if (selectedQueryId.startsWith("gene:")) {
      return `gene name "${selectedQueryId.replace("gene:", "")}"`;
    }
    return `database ID "${selectedQueryId}"`;
  }

  // src/LaunchProteinView/hooks/useAlphaFoldDBSearch.ts
  init_util();
  function useAlphaFoldDBSearch({
    feature,
    view
  }) {
    const [lookupMode, setLookupMode] = (0, import_react27.useState)("auto");
    const [manualUniprotId, setManualUniprotId] = (0, import_react27.useState)("");
    const [selectedQueryId, setSelectedQueryId] = (0, import_react27.useState)("auto");
    const [sequenceSearchType, setSequenceSearchType] = (0, import_react27.useState)("md5");
    const [selectedUniprotId, setSelectedUniprotId] = (0, import_react27.useState)();
    const [userTranscriptId, setUserTranscriptId] = (0, import_react27.useState)();
    const transcriptOptions = (0, import_react27.useMemo)(
      () => getTranscriptFeatures(feature),
      [feature]
    );
    const geneIds = (0, import_react27.useMemo)(() => extractFeatureIdentifiers(feature), [feature]);
    const featureUniprotId = getUniProtIdFromFeature(feature);
    const effectiveLookupMode = lookupMode === "auto" && featureUniprotId ? "feature" : lookupMode;
    const isSequenceMode = effectiveLookupMode === "sequence";
    const isAutoMode = effectiveLookupMode === "auto";
    const {
      isoformSequences,
      isLoading: isIsoformLoading,
      error: isoformError
    } = useIsoformProteinSequences({ feature, view });
    const {
      entries: uniprotEntries,
      isLoading: isLookupLoading,
      error: lookupError
    } = useUniProtSearch({
      recognizedIds: geneIds.recognizedIds,
      geneId: geneIds.geneId,
      geneName: geneIds.geneName,
      selectedQueryId,
      enabled: isAutoMode
    });
    const autoUniprotId = uniprotEntries[0]?.accession;
    const uniprotId = effectiveLookupMode === "feature" ? featureUniprotId : isAutoMode ? selectedUniprotId ?? autoUniprotId : effectiveLookupMode === "manual" ? manualUniprotId : void 0;
    const {
      predictions,
      isLoading: isAlphaFoldLoading,
      error: alphaFoldError,
      selectedEntryIndex,
      setSelectedEntryIndex,
      url: alphaFoldUrl,
      confidenceUrl: alphaFoldConfidenceUrl,
      structureSequence: alphaFoldStructureSequence
    } = useAlphaFoldData({
      uniprotId: isSequenceMode ? void 0 : uniprotId
    });
    const autoTranscriptId = (0, import_react27.useMemo)(() => {
      if (isoformSequences) {
        return selectBestTranscript({
          options: transcriptOptions,
          isoformSequences,
          structureSequence: alphaFoldStructureSequence
        })?.id();
      }
      return void 0;
    }, [transcriptOptions, alphaFoldStructureSequence, isoformSequences]);
    const effectiveTranscriptId = userTranscriptId ?? autoTranscriptId;
    const selectedTranscript = transcriptOptions.find(
      (f) => getId(f) === effectiveTranscriptId
    );
    const userSelectedProteinSequence = isoformSequences?.[effectiveTranscriptId ?? ""];
    const {
      uniprotId: seqSearchUniprotId,
      cifUrl: seqSearchUrl,
      plddtDocUrl: seqSearchConfidenceUrl,
      structureSequence: seqSearchStructureSequence,
      isLoading: isSequenceSearchLoading,
      error: sequenceSearchError
    } = useAlphaFoldSequenceSearch({
      sequence: userSelectedProteinSequence?.seq,
      searchType: sequenceSearchType,
      enabled: isSequenceMode
    });
    const finalUrl = isSequenceMode ? seqSearchUrl : alphaFoldUrl;
    const finalConfidenceUrl = isSequenceMode ? seqSearchConfidenceUrl : alphaFoldConfidenceUrl;
    const finalStructureSequence = isSequenceMode ? seqSearchStructureSequence : alphaFoldStructureSequence;
    const finalUniprotId = isSequenceMode ? seqSearchUniprotId : uniprotId;
    (0, import_react27.useEffect)(() => {
      setUserTranscriptId(void 0);
    }, [selectedUniprotId]);
    const loadingStatuses = [
      isLookupLoading && "Looking up UniProt ID",
      isIsoformLoading && "Loading protein sequences from transcript isoforms",
      !isSequenceMode && isAlphaFoldLoading && "Fetching AlphaFold structure URL",
      isSequenceMode && isSequenceSearchLoading && "Searching AlphaFoldDB by sequence"
    ].filter((s) => !!s);
    const isLoading = loadingStatuses.length > 0;
    const rawError = isoformError ?? lookupError ?? alphaFoldError ?? sequenceSearchError;
    const error = isLoading ? void 0 : rawError;
    return {
      lookupMode: effectiveLookupMode,
      setLookupMode,
      manualUniprotId,
      setManualUniprotId,
      selectedQueryId,
      setSelectedQueryId,
      sequenceSearchType,
      setSequenceSearchType,
      selectedUniprotId,
      setSelectedUniprotId,
      userSelection: effectiveTranscriptId,
      setUserSelection: setUserTranscriptId,
      transcriptOptions,
      selectedTranscript,
      isoformSequences,
      userSelectedProteinSequence,
      uniprotEntries,
      predictions,
      selectedEntryIndex,
      setSelectedEntryIndex,
      recognizedIds: geneIds.recognizedIds,
      geneName: geneIds.geneName,
      featureUniprotId,
      uniprotId: finalUniprotId,
      url: finalUrl,
      confidenceUrl: finalConfidenceUrl,
      structureSequence: finalStructureSequence,
      error,
      loadingStatuses,
      isSequenceSearchLoading,
      showIdentifierSelector: isAutoMode && (geneIds.recognizedIds.length > 0 || !!geneIds.geneName),
      showStructureSelectors: !!isoformSequences && !!selectedTranscript && (isSequenceMode || !!(finalStructureSequence && finalUniprotId)),
      sequencesMatch: userSelectedProteinSequence?.seq && finalStructureSequence ? stripStopCodon(userSelectedProteinSequence.seq) === finalStructureSequence : void 0,
      searchDescription: getSearchDescription({
        selectedQueryId,
        recognizedIds: geneIds.recognizedIds,
        geneName: geneIds.geneName
      }),
      searchDescriptionOr: getSearchDescription({
        selectedQueryId,
        recognizedIds: geneIds.recognizedIds,
        geneName: geneIds.geneName,
        joinWord: "or"
      }),
      selectedTableAccession: selectedUniprotId ?? autoUniprotId,
      showUniprotResults: !!isoformSequences && isAutoMode && (uniprotEntries.length > 0 || isLookupLoading),
      showNoResults: !!isoformSequences && isAutoMode && !isLookupLoading && uniprotEntries.length === 0,
      showAlphaFoldEntrySelector: !!predictions && !isSequenceMode,
      showSequenceSearchStatus: isSequenceMode,
      showAlphaFoldDBSearchStatus: !!finalStructureSequence && !!finalUniprotId && !isSequenceMode,
      isLoading
    };
  }

  // src/LaunchProteinView/components/AlphaFoldDBSearch.tsx
  var useStyles5 = (0, import_mui5.makeStyles)()({
    dialogContent: {
      width: "80em",
      "& > *": {
        marginBottom: 20
      },
      "& > *:last-child": {
        marginBottom: 0
      }
    },
    selectorsRow: {
      display: "flex",
      flexDirection: "row",
      gap: 20,
      alignItems: "flex-start"
    }
  });
  var AlphaFoldDBSearch = (0, import_mobx_react9.observer)(function AlphaFoldDBSearch2({
    feature,
    model,
    handleClose,
    alignmentAlgorithm,
    onAlignmentAlgorithmChange
  }) {
    const { classes } = useStyles5();
    const session = (0, import_util29.getSession)(model);
    const view = (0, import_util29.getContainingView)(model);
    const state = useAlphaFoldDBSearch({ feature, view });
    return /* @__PURE__ */ import_react28.default.createElement(import_react28.default.Fragment, null, /* @__PURE__ */ import_react28.default.createElement(import_material13.DialogContent, { className: classes.dialogContent }, state.error ? /* @__PURE__ */ import_react28.default.createElement(import_ui.ErrorMessage, { error: state.error }) : null, /* @__PURE__ */ import_react28.default.createElement(
      UniProtIdInput,
      {
        lookupMode: state.lookupMode,
        onLookupModeChange: state.setLookupMode,
        manualUniprotId: state.manualUniprotId,
        onManualUniprotIdChange: state.setManualUniprotId,
        featureUniprotId: state.featureUniprotId,
        hasProteinSequence: !!state.userSelectedProteinSequence?.seq,
        sequenceSearchType: state.sequenceSearchType,
        onSequenceSearchTypeChange: state.setSequenceSearchType,
        endContent: state.showIdentifierSelector ? /* @__PURE__ */ import_react28.default.createElement(
          IdentifierSelector,
          {
            recognizedIds: state.recognizedIds,
            geneName: state.geneName,
            selectedId: state.selectedQueryId,
            onSelectedIdChange: state.setSelectedQueryId
          }
        ) : null
      }
    ), state.loadingStatuses.map((status) => /* @__PURE__ */ import_react28.default.createElement(import_ui.LoadingEllipses, { key: status, variant: "subtitle2", message: status })), state.showUniprotResults && /* @__PURE__ */ import_react28.default.createElement(import_react28.default.Fragment, null, /* @__PURE__ */ import_react28.default.createElement(import_material13.Typography, { variant: "body2", color: "textSecondary" }, "Searched UniProt by ", state.searchDescription), /* @__PURE__ */ import_react28.default.createElement(
      UniProtResultsTable,
      {
        entries: state.uniprotEntries,
        selectedAccession: state.selectedTableAccession,
        onSelect: state.setSelectedUniprotId
      }
    ), /* @__PURE__ */ import_react28.default.createElement(import_material13.Typography, { variant: "body2", color: "textSecondary" }, "If you don't see the entry you're looking for, try a different identifier above or search", " ", /* @__PURE__ */ import_react28.default.createElement(ExternalLink, { href: "https://www.uniprot.org/" }, "UniProt"), " ", 'directly and use "Enter manually".')), state.showNoResults && /* @__PURE__ */ import_react28.default.createElement(import_material13.Typography, { variant: "body2", color: "textSecondary" }, "No UniProt entries found for ", state.searchDescriptionOr, ". Try a different identifier above, or search", " ", /* @__PURE__ */ import_react28.default.createElement(ExternalLink, { href: "https://www.uniprot.org/" }, "UniProt"), " ", 'directly and use "Enter manually" above, or use "Search sequence against AlphaFoldDB API" if available.'), state.showStructureSelectors && /* @__PURE__ */ import_react28.default.createElement(import_react28.default.Fragment, null, /* @__PURE__ */ import_react28.default.createElement("div", { className: classes.selectorsRow }, /* @__PURE__ */ import_react28.default.createElement(
      TranscriptSelector,
      {
        val: state.userSelection ?? "",
        setVal: state.setUserSelection,
        structureSequence: state.structureSequence,
        feature,
        isoforms: state.transcriptOptions,
        isoformSequences: state.isoformSequences
      }
    ), state.showAlphaFoldEntrySelector && /* @__PURE__ */ import_react28.default.createElement(
      AlphaFoldEntrySelector,
      {
        predictions: state.predictions,
        selectedEntryIndex: state.selectedEntryIndex,
        onSelectionChange: state.setSelectedEntryIndex
      }
    )), state.showSequenceSearchStatus && /* @__PURE__ */ import_react28.default.createElement(
      SequenceSearchStatus,
      {
        isLoading: state.isSequenceSearchLoading,
        uniprotId: state.uniprotId,
        url: state.url,
        hasProteinSequence: !!state.userSelectedProteinSequence,
        sequenceSearchType: state.sequenceSearchType
      }
    ), state.showAlphaFoldDBSearchStatus && /* @__PURE__ */ import_react28.default.createElement(
      AlphaFoldDBSearchStatus,
      {
        uniprotId: state.uniprotId,
        selectedTranscript: state.selectedTranscript,
        structureSequence: state.structureSequence,
        isoformSequences: state.isoformSequences,
        url: state.url
      }
    ))), /* @__PURE__ */ import_react28.default.createElement(import_material13.DialogActions, null, /* @__PURE__ */ import_react28.default.createElement(
      ProteinViewActions,
      {
        handleClose,
        uniprotId: state.uniprotId,
        userSelectedProteinSequence: state.userSelectedProteinSequence,
        selectedTranscript: state.selectedTranscript,
        url: state.url,
        confidenceUrl: state.confidenceUrl,
        feature,
        view,
        session,
        alignmentAlgorithm,
        onAlignmentAlgorithmChange,
        sequencesMatch: state.sequencesMatch,
        isLoading: state.isLoading
      }
    )));
  });
  var AlphaFoldDBSearch_default = AlphaFoldDBSearch;

  // src/LaunchProteinView/components/FoldseekSearch.tsx
  var import_react33 = __toESM(require_react());
  var import_ui2 = __toESM(require_ui());
  var import_util30 = __toESM(require_util());
  var import_material17 = __toESM(require_material());
  var import_mobx_react10 = __toESM(require_mobx_react());
  var import_mui8 = __toESM(require_mui());

  // src/LaunchProteinView/components/FoldseekDatabaseSelector.tsx
  var import_react29 = __toESM(require_react());
  var import_material14 = __toESM(require_material());
  var import_mui6 = __toESM(require_mui());

  // src/LaunchProteinView/services/foldseekApi.ts
  var FOLDSEEK_DATABASES = [
    { id: "pdb100", label: "PDB (100% redundancy)" },
    { id: "afdb-swissprot", label: "AlphaFold DB (Swiss-Prot)" },
    { id: "afdb50", label: "AlphaFold DB (50% redundancy)" },
    { id: "afdb-proteome", label: "AlphaFold DB (Proteomes)" },
    { id: "cath50", label: "CATH (50% redundancy)" },
    { id: "mgnify_esm30", label: "MGnify ESM30" },
    { id: "bfmd", label: "BFMD" },
    { id: "gmgcl_id", label: "GMGCL" }
  ];
  var DEFAULT_DATABASES = [
    "pdb100",
    "afdb-swissprot"
  ];
  async function predict3Di(aaSequence) {
    const cleanSequence = aaSequence.split("\n").filter((line) => !line.startsWith(">")).join("").replace(/\s/g, "").replace(/\*/g, "").toUpperCase().replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, "");
    const response = await fetch(
      `https://3di.foldseek.com/predict/${encodeURIComponent(cleanSequence)}`
    );
    if (!response.ok) {
      throw new Error(
        `3Di prediction failed: ${response.status} ${await response.text()}`
      );
    }
    const di3Sequence = await response.text();
    const cleanDi3 = di3Sequence.replace(/^["'/\s]+/, "").replace(/["'/\s]+$/, "").trim();
    return { aaSequence: cleanSequence, di3Sequence: cleanDi3 };
  }
  async function submitFoldseekSearch(aaSequence, di3Sequence, databases) {
    const fastaContent = `>query
${aaSequence}
>3DI
${di3Sequence}
`;
    const params = new URLSearchParams();
    params.append("q", fastaContent);
    params.append("mode", "3diaa");
    params.append("email", "");
    for (const db of databases) {
      params.append("database[]", db);
    }
    const response = await fetch("https://search.foldseek.com/api/ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(
        `Foldseek submission failed: ${response.status} ${JSON.stringify(responseData)}`
      );
    }
    return responseData;
  }
  async function pollFoldseekStatus(ticketId) {
    const params = new URLSearchParams();
    params.append("tickets[]", ticketId);
    const response = await fetch("https://search.foldseek.com/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });
    if (!response.ok) {
      throw new Error(`Failed to poll ticket status: ${response.status}`);
    }
    const results = await response.json();
    const result = results[0];
    if (!result) {
      throw new Error("No ticket status returned");
    }
    return result;
  }
  async function getFoldseekResults(ticketId) {
    const result = await jsonfetch(
      `https://search.foldseek.com/api/result/${ticketId}/0`
    );
    return result;
  }
  async function waitForFoldseekResults(ticketId, databases, onStatusChange) {
    const maxAttempts = 180;
    let attempts = 0;
    while (attempts < maxAttempts) {
      const status = await pollFoldseekStatus(ticketId);
      if (status.status === "ERROR") {
        console.error("[Foldseek] Search error:", status);
        throw new Error(
          `Foldseek search failed: ${status.error ?? "Unknown error"}`
        );
      }
      if (status.status === "COMPLETE") {
        onStatusChange?.("Fetching results...");
        const apiResponse = await getFoldseekResults(ticketId);
        const results = {
          query: apiResponse.queries[0] ?? { header: "", sequence: "" },
          results: apiResponse.results.map((r) => ({
            db: r.db,
            alignments: r.alignments
          }))
        };
        return results;
      }
      onStatusChange?.(
        `Search ${status.status.toLowerCase()}... (${attempts + 1}s)`
      );
      await timeout(1e3);
      attempts++;
    }
    throw new Error("Foldseek search timed out");
  }

  // src/LaunchProteinView/components/FoldseekDatabaseSelector.tsx
  var useStyles6 = (0, import_mui6.makeStyles)()({
    root: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: 8
    },
    buttons: {
      display: "flex",
      gap: 4
    },
    checkboxGroup: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 0
    }
  });
  function FoldseekDatabaseSelector({
    selected,
    onChange,
    disabled
  }) {
    const { classes } = useStyles6();
    const handleToggle = (dbId) => {
      if (selected.includes(dbId)) {
        onChange(selected.filter((id) => id !== dbId));
      } else {
        onChange([...selected, dbId]);
      }
    };
    const selectAll = () => {
      onChange(FOLDSEEK_DATABASES.map((db) => db.id));
    };
    const deselectAll = () => {
      onChange([]);
    };
    return /* @__PURE__ */ import_react29.default.createElement("div", { className: classes.root }, /* @__PURE__ */ import_react29.default.createElement("div", { className: classes.header }, /* @__PURE__ */ import_react29.default.createElement(import_material14.Typography, { variant: "subtitle2" }, "Databases to search:"), /* @__PURE__ */ import_react29.default.createElement("div", { className: classes.buttons }, /* @__PURE__ */ import_react29.default.createElement(import_material14.Button, { size: "small", onClick: selectAll, disabled }, "Select all"), /* @__PURE__ */ import_react29.default.createElement(import_material14.Button, { size: "small", onClick: deselectAll, disabled }, "Clear"))), /* @__PURE__ */ import_react29.default.createElement(import_material14.FormGroup, { className: classes.checkboxGroup }, FOLDSEEK_DATABASES.map((db) => /* @__PURE__ */ import_react29.default.createElement(
      import_material14.FormControlLabel,
      {
        key: db.id,
        control: /* @__PURE__ */ import_react29.default.createElement(
          import_material14.Checkbox,
          {
            size: "small",
            checked: selected.includes(db.id),
            onChange: () => {
              handleToggle(db.id);
            },
            disabled
          }
        ),
        label: db.label
      }
    ))));
  }

  // src/LaunchProteinView/components/FoldseekResultsTable.tsx
  var import_react31 = __toESM(require_react());
  var import_material16 = __toESM(require_material());
  var import_mui7 = __toESM(require_mui());

  // src/LaunchProteinView/components/FoldseekActionMenu.tsx
  var import_react30 = __toESM(require_react());
  var import_material15 = __toESM(require_material());

  // src/LaunchProteinView/utils/caCoordsToPdb.ts
  var AA_3LETTER = {
    A: "ALA",
    C: "CYS",
    D: "ASP",
    E: "GLU",
    F: "PHE",
    G: "GLY",
    H: "HIS",
    I: "ILE",
    K: "LYS",
    L: "LEU",
    M: "MET",
    N: "ASN",
    P: "PRO",
    Q: "GLN",
    R: "ARG",
    S: "SER",
    T: "THR",
    V: "VAL",
    W: "TRP",
    Y: "TYR",
    X: "UNK"
    // Unknown
  };
  function padLeft(str, len) {
    return str.padStart(len, " ");
  }
  function padRight(str, len) {
    return str.padEnd(len, " ");
  }
  function formatCoord(val) {
    return val.toFixed(3).padStart(8, " ");
  }
  function caCoordsToPdb(tCa, tSeq, chainId = "A", title) {
    const coords = tCa.split(",").map(Number);
    const lines = [];
    if (title) {
      lines.push(`TITLE     ${title}`);
    }
    lines.push("REMARK   1 Generated from Foldseek C\u03B1 coordinates");
    let atomNum = 1;
    let resNum = 1;
    for (let i = 0; i < coords.length - 2; i += 3) {
      const x = coords[i];
      const y = coords[i + 1];
      const z = coords[i + 2];
      const aa = tSeq[resNum - 1] ?? "X";
      const resName = AA_3LETTER[aa] ?? "UNK";
      if (x === void 0 || y === void 0 || z === void 0) {
        break;
      }
      const line = "ATOM  " + padLeft(String(atomNum), 5) + "  CA  " + padRight(resName, 3) + " " + chainId + padLeft(String(resNum), 4) + "    " + formatCoord(x) + formatCoord(y) + formatCoord(z) + "  1.00  0.00           C";
      lines.push(line);
      atomNum++;
      resNum++;
    }
    lines.push("END");
    return lines.join("\n");
  }
  function hasValidCaCoords(tCa, tSeq) {
    if (!tCa || !tSeq) {
      return false;
    }
    const coords = tCa.split(",");
    return coords.length >= 3 && tSeq.length > 0;
  }

  // src/LaunchProteinView/components/FoldseekActionMenu.tsx
  init_launchViewUtils();
  function FoldseekActionMenu({
    hit,
    session,
    view,
    feature,
    selectedTranscript,
    userProvidedTranscriptSequence,
    onClose
  }) {
    const [anchorEl, setAnchorEl] = (0, import_react30.useState)(null);
    const open = Boolean(anchorEl);
    const uniprotId = getUniprotIdFromAlphaFoldTarget(hit.target);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    const handleLaunch3D = () => {
      handleMenuClose();
      const pdbData = !hit.structureUrl && hasValidCaCoords(hit.tCa, hit.tSeq) ? caCoordsToPdb(hit.tCa, hit.tSeq, "A", hit.target) : void 0;
      launch3DProteinView({
        session,
        view,
        feature,
        selectedTranscript,
        uniprotId,
        url: hit.structureUrl,
        data: pdbData,
        userProvidedTranscriptSequence
      });
      onClose();
    };
    const handleLaunch1D = async () => {
      handleMenuClose();
      try {
        await launch1DProteinView({
          session,
          view,
          feature,
          selectedTranscript,
          uniprotId,
          confidenceUrl: getConfidenceUrlFromTarget(hit.target)
        });
      } catch (e) {
        console.error(e);
        session.notifyError(`${e}`, e);
      }
      onClose();
    };
    const handleLaunchMSA = () => {
      handleMenuClose();
      launchMsaView({
        session,
        view,
        feature,
        selectedTranscript,
        uniprotId
      });
      onClose();
    };
    const canLoad = hit.structureUrl ?? hasValidCaCoords(hit.tCa, hit.tSeq);
    if (!canLoad) {
      return /* @__PURE__ */ import_react30.default.createElement("span", null, "-");
    }
    return /* @__PURE__ */ import_react30.default.createElement(import_react30.default.Fragment, null, /* @__PURE__ */ import_react30.default.createElement(import_material15.Button, { size: "small", variant: "outlined", onClick: handleClick }, "Load"), /* @__PURE__ */ import_react30.default.createElement(import_material15.Menu, { anchorEl, open, onClose: handleMenuClose }, /* @__PURE__ */ import_react30.default.createElement(import_material15.MenuItem, { onClick: handleLaunch3D }, "Launch 3D protein view"), uniprotId ? /* @__PURE__ */ import_react30.default.createElement(
      import_material15.MenuItem,
      {
        onClick: () => {
          handleLaunch1D().catch((e) => {
            console.error(e);
          });
        }
      },
      "Launch 1D protein annotation view"
    ) : null, uniprotId && hasMsaViewPlugin() ? /* @__PURE__ */ import_react30.default.createElement(import_material15.MenuItem, { onClick: handleLaunchMSA }, "Launch MSA view (AlphaFoldDB a3m)") : null));
  }

  // src/LaunchProteinView/components/FoldseekResultsTable.tsx
  init_launchViewUtils();
  var useStyles7 = (0, import_mui7.makeStyles)()({
    root: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    },
    tableContainer: {
      maxHeight: 400
    },
    headerCell: {
      fontWeight: "bold",
      backgroundColor: "#f5f5f5"
    },
    noResults: {
      padding: 16,
      textAlign: "center"
    }
  });
  function flattenResults(results) {
    const hits = [];
    for (const dbResult of results.results) {
      if (!dbResult.alignments) {
        continue;
      }
      for (const alignmentGroup of dbResult.alignments) {
        if (!alignmentGroup) {
          continue;
        }
        for (const alignment of alignmentGroup) {
          if (!alignment) {
            continue;
          }
          hits.push({
            ...alignment,
            db: dbResult.db,
            structureUrl: getStructureUrlFromTarget(
              alignment.target,
              dbResult.db
            )
          });
        }
      }
    }
    hits.sort((a, b) => (a.eval ?? Infinity) - (b.eval ?? Infinity));
    return hits.slice(0, 100);
  }
  function FoldseekResultsTable({
    results,
    session,
    view,
    feature,
    selectedTranscript,
    userProvidedTranscriptSequence,
    onClose
  }) {
    const { classes } = useStyles7();
    const flatHits = flattenResults(results);
    if (flatHits.length === 0) {
      return /* @__PURE__ */ import_react31.default.createElement(import_material16.Paper, { className: classes.noResults }, /* @__PURE__ */ import_react31.default.createElement(import_material16.Typography, null, "No similar structures found"));
    }
    return /* @__PURE__ */ import_react31.default.createElement("div", { className: classes.root }, /* @__PURE__ */ import_react31.default.createElement(import_material16.Typography, { variant: "subtitle2" }, "Found ", flatHits.length, " similar structures"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableContainer, { component: import_material16.Paper, className: classes.tableContainer }, /* @__PURE__ */ import_react31.default.createElement(import_material16.Table, { size: "small", stickyHeader: true }, /* @__PURE__ */ import_react31.default.createElement(import_material16.TableHead, null, /* @__PURE__ */ import_react31.default.createElement(import_material16.TableRow, null, /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, { className: classes.headerCell }, "Database"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, { className: classes.headerCell }, "Target"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, { className: classes.headerCell }, "Organism"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, { className: classes.headerCell }, "Prob"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, { className: classes.headerCell }, "Seq. Id."), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, { className: classes.headerCell }, "Coverage"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, { className: classes.headerCell }, "E-value"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, { className: classes.headerCell }, "Actions"))), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableBody, null, flatHits.map((hit, idx) => /* @__PURE__ */ import_react31.default.createElement(import_material16.TableRow, { key: `${hit.db}-${hit.target}-${idx}` }, /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, null, hit.db), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, null, hit.target), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, null, hit.taxName ?? "-"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, null, hit.prob != null ? `${(hit.prob * 100).toFixed(1)}%` : "-"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, null, hit.seqId != null ? `${hit.seqId.toFixed(1)}%` : "-"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, null, hit.alnLength != null && hit.qLen != null ? `${(hit.alnLength / hit.qLen * 100).toFixed(1)}%` : "-"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, null, hit.eval != null ? hit.eval.toExponential(2) : "-"), /* @__PURE__ */ import_react31.default.createElement(import_material16.TableCell, null, /* @__PURE__ */ import_react31.default.createElement(
      FoldseekActionMenu,
      {
        hit,
        session,
        view,
        feature,
        selectedTranscript,
        userProvidedTranscriptSequence,
        onClose
      }
    ))))))));
  }

  // src/LaunchProteinView/hooks/useFoldseekSearch.ts
  var import_react32 = __toESM(require_react());
  function useFoldseekSearch() {
    const [results, setResults] = (0, import_react32.useState)();
    const [cleanedAaSequence, setCleanedAaSequence] = (0, import_react32.useState)();
    const [di3Sequence, setDi3Sequence] = (0, import_react32.useState)();
    const [isLoading, setIsLoading] = (0, import_react32.useState)(false);
    const [isPredicting, setIsPredicting] = (0, import_react32.useState)(false);
    const [error, setError] = (0, import_react32.useState)();
    const [statusMessage, setStatusMessage] = (0, import_react32.useState)("");
    const abortRef = (0, import_react32.useRef)(false);
    (0, import_react32.useEffect)(() => {
      return () => {
        abortRef.current = true;
      };
    }, []);
    const predictStructure = (0, import_react32.useCallback)(async (aaSequence) => {
      setIsPredicting(true);
      setError(void 0);
      setCleanedAaSequence(void 0);
      setDi3Sequence(void 0);
      setStatusMessage("Predicting 3Di structure...");
      try {
        const result = await predict3Di(aaSequence);
        setCleanedAaSequence(result.aaSequence);
        setDi3Sequence(result.di3Sequence);
        setStatusMessage("");
        return result;
      } catch (e) {
        setError(e);
        setStatusMessage("");
        return void 0;
      } finally {
        setIsPredicting(false);
      }
    }, []);
    const search = (0, import_react32.useCallback)(
      async (aaSeq, di3Seq, databases = DEFAULT_DATABASES) => {
        const isAborted = () => abortRef.current;
        setIsLoading(true);
        setError(void 0);
        setResults(void 0);
        setStatusMessage("Submitting search...");
        abortRef.current = false;
        try {
          const ticket = await submitFoldseekSearch(aaSeq, di3Seq, databases);
          if (isAborted()) {
            return;
          }
          const results2 = await waitForFoldseekResults(
            ticket.id,
            databases,
            (status) => {
              if (!isAborted()) {
                setStatusMessage(status);
              }
            }
          );
          if (!isAborted()) {
            setResults(results2);
            setStatusMessage("");
          }
        } catch (e) {
          if (!isAborted()) {
            setError(e);
            setStatusMessage("");
          }
        } finally {
          if (!isAborted()) {
            setIsLoading(false);
          }
        }
      },
      []
    );
    const reset = (0, import_react32.useCallback)(() => {
      setResults(void 0);
      setCleanedAaSequence(void 0);
      setDi3Sequence(void 0);
      setError(void 0);
      setIsLoading(false);
      setIsPredicting(false);
      setStatusMessage("");
    }, []);
    return {
      results,
      cleanedAaSequence,
      di3Sequence,
      isLoading,
      isPredicting,
      error,
      statusMessage,
      predictStructure,
      search,
      reset
    };
  }

  // src/LaunchProteinView/components/FoldseekSearch.tsx
  init_util();
  var useStyles8 = (0, import_mui8.makeStyles)()({
    dialogContent: {
      width: "80em",
      display: "flex",
      flexDirection: "column",
      gap: 20
    },
    sequenceInput: {
      fontFamily: "monospace"
    },
    di3Section: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  });
  var FoldseekSearch = (0, import_mobx_react10.observer)(function FoldseekSearch2({
    feature,
    model,
    handleClose
  }) {
    const { classes } = useStyles8();
    const session = (0, import_util30.getSession)(model);
    const view = (0, import_util30.getContainingView)(model);
    const [sequence, setSequence] = (0, import_react33.useState)("");
    const [selectedTranscriptId, setSelectedTranscriptId] = (0, import_react33.useState)("");
    const [selectedDatabases, setSelectedDatabases] = (0, import_react33.useState)(DEFAULT_DATABASES);
    const {
      results,
      cleanedAaSequence,
      di3Sequence,
      isLoading,
      isPredicting,
      error,
      statusMessage,
      predictStructure,
      search,
      reset
    } = useFoldseekSearch();
    const transcripts = (0, import_react33.useMemo)(() => getTranscriptFeatures(feature), [feature]);
    const {
      isoformSequences,
      isLoading: isLoadingIsoforms,
      error: isoformError
    } = useIsoformProteinSequences({ feature, view });
    const selectedTranscript = transcripts.find(
      (t) => t.id() === selectedTranscriptId
    );
    const selectedIsoformData = isoformSequences?.[selectedTranscriptId];
    (0, import_react33.useEffect)(() => {
      if (isoformSequences && !selectedTranscriptId) {
        const sortedTranscripts = [...transcripts].sort((a, b) => {
          const seqA = isoformSequences[a.id()]?.seq;
          const seqB = isoformSequences[b.id()]?.seq;
          return (seqB?.length ?? 0) - (seqA?.length ?? 0);
        });
        const firstWithSeq = sortedTranscripts.find(
          (t) => isoformSequences[t.id()]?.seq
        );
        if (firstWithSeq) {
          setSelectedTranscriptId(firstWithSeq.id());
        }
      }
    }, [isoformSequences, selectedTranscriptId, transcripts]);
    (0, import_react33.useEffect)(() => {
      if (selectedIsoformData?.seq) {
        setSequence(selectedIsoformData.seq.replace(/\*/g, ""));
      }
    }, [selectedIsoformData]);
    const handlePredict = async () => {
      if (sequence.trim()) {
        await predictStructure(sequence.trim());
      }
    };
    const handleSearch = () => {
      if (cleanedAaSequence && di3Sequence && selectedDatabases.length > 0) {
        search(cleanedAaSequence, di3Sequence, selectedDatabases).catch(
          (e) => {
            console.error(e);
          }
        );
      }
    };
    const canPredict = sequence.trim().length > 0 && !isPredicting && !isLoading;
    const canSearch = !!cleanedAaSequence && !!di3Sequence && selectedDatabases.length > 0 && !isLoading;
    const combinedError = error ?? isoformError;
    const isBusy = isLoading || isPredicting;
    return /* @__PURE__ */ import_react33.default.createElement(import_react33.default.Fragment, null, /* @__PURE__ */ import_react33.default.createElement(import_material17.DialogContent, { className: classes.dialogContent }, combinedError && !isLoadingIsoforms ? /* @__PURE__ */ import_react33.default.createElement(import_ui2.ErrorMessage, { error: combinedError }) : null, isLoadingIsoforms ? /* @__PURE__ */ import_react33.default.createElement(
      import_ui2.LoadingEllipses,
      {
        variant: "subtitle2",
        message: "Loading transcript sequences"
      }
    ) : null, isoformSequences ? /* @__PURE__ */ import_react33.default.createElement(import_react33.default.Fragment, null, /* @__PURE__ */ import_react33.default.createElement(
      TranscriptSelector,
      {
        val: selectedTranscriptId,
        setVal: setSelectedTranscriptId,
        isoforms: transcripts,
        isoformSequences,
        feature,
        disabled: isBusy
      }
    ), /* @__PURE__ */ import_react33.default.createElement(
      import_material17.TextField,
      {
        label: "Protein sequence (amino acids)",
        multiline: true,
        rows: 4,
        value: sequence,
        onChange: (e) => {
          setSequence(e.target.value);
        },
        placeholder: `MKTVRQERLKSIVRILERSKEPVSGAQLAEEL...`,
        disabled: isBusy,
        InputProps: {
          className: classes.sequenceInput
        }
      }
    )) : null, di3Sequence ? /* @__PURE__ */ import_react33.default.createElement("div", { className: classes.di3Section }, /* @__PURE__ */ import_react33.default.createElement(import_material17.Typography, { variant: "subtitle2" }, "3Di structural alphabet (used for searching):"), /* @__PURE__ */ import_react33.default.createElement(
      import_material17.TextField,
      {
        multiline: true,
        rows: 4,
        value: di3Sequence,
        InputProps: {
          className: classes.sequenceInput,
          readOnly: true
        }
      }
    )) : null, /* @__PURE__ */ import_react33.default.createElement(
      FoldseekDatabaseSelector,
      {
        selected: selectedDatabases,
        onChange: setSelectedDatabases,
        disabled: isBusy
      }
    ), statusMessage ? /* @__PURE__ */ import_react33.default.createElement(import_ui2.LoadingEllipses, { variant: "subtitle2", message: statusMessage }) : null, results ? /* @__PURE__ */ import_react33.default.createElement(
      FoldseekResultsTable,
      {
        results,
        session,
        view,
        feature,
        selectedTranscript,
        userProvidedTranscriptSequence: sequence,
        onClose: handleClose
      }
    ) : null), /* @__PURE__ */ import_react33.default.createElement(import_material17.DialogActions, null, /* @__PURE__ */ import_react33.default.createElement(import_material17.Button, { variant: "contained", color: "secondary", onClick: handleClose }, "Cancel"), results ? /* @__PURE__ */ import_react33.default.createElement(import_material17.Button, { variant: "outlined", onClick: reset }, "New search") : null, !di3Sequence ? /* @__PURE__ */ import_react33.default.createElement(
      import_material17.Button,
      {
        variant: "contained",
        color: "primary",
        disabled: !canPredict,
        onClick: () => {
          handlePredict().catch((e) => {
            console.error(e);
          });
        }
      },
      isPredicting ? "Predicting..." : "Predict 3Di structure"
    ) : /* @__PURE__ */ import_react33.default.createElement(
      import_material17.Button,
      {
        variant: "contained",
        color: "primary",
        disabled: !canSearch,
        onClick: handleSearch
      },
      isLoading ? "Searching..." : "Search Foldseek"
    )));
  });
  var FoldseekSearch_default = FoldseekSearch;

  // src/LaunchProteinView/components/HelpButton.tsx
  var import_react35 = __toESM(require_react());
  init_Help();
  var import_material19 = __toESM(require_material());
  var HelpDialog2 = (0, import_react35.lazy)(() => Promise.resolve().then(() => (init_HelpDialog(), HelpDialog_exports)));
  function HelpButton() {
    const [show, setShow] = (0, import_react35.useState)(false);
    return /* @__PURE__ */ import_react35.default.createElement(import_react35.default.Fragment, null, /* @__PURE__ */ import_react35.default.createElement(
      import_material19.IconButton,
      {
        onClick: () => {
          setShow(true);
        }
      },
      /* @__PURE__ */ import_react35.default.createElement(Help_default, null)
    ), show ? /* @__PURE__ */ import_react35.default.createElement(import_react35.Suspense, { fallback: null }, /* @__PURE__ */ import_react35.default.createElement(
      HelpDialog2,
      {
        handleClose: () => {
          setShow(false);
        }
      }
    )) : null);
  }

  // src/LaunchProteinView/components/TabPanel.tsx
  var import_react36 = __toESM(require_react());
  function TabPanel({
    children,
    value,
    index,
    ...other
  }) {
    return /* @__PURE__ */ import_react36.default.createElement("div", { role: "tabpanel", hidden: value !== index, ...other }, value === index && /* @__PURE__ */ import_react36.default.createElement("div", null, children));
  }

  // src/LaunchProteinView/components/UserProvidedStructure.tsx
  var import_react38 = __toESM(require_react());
  var import_ui4 = __toESM(require_ui());
  var import_util33 = __toESM(require_util());
  var import_material20 = __toESM(require_material());
  var import_mobx_react11 = __toESM(require_mobx_react());
  var import_mui9 = __toESM(require_mui());

  // src/LaunchProteinView/hooks/useLocalStructureFileSequence.ts
  init_index();

  // src/ProteinView/addStructureFromData.ts
  async function addStructureFromData({
    data,
    format = "pdb",
    options,
    plugin
  }) {
    const _data = await plugin.builders.data.rawData({
      data,
      label: options?.dataLabel
    });
    const trajectory = await plugin.builders.structure.parseTrajectory(
      _data,
      format
    );
    const model = await plugin.builders.structure.createModel(trajectory);
    await plugin.builders.structure.hierarchy.applyPreset(
      trajectory,
      "all-models",
      {
        useDefaultIfSingleModel: true,
        representationPresetParams: options?.representationParams
      }
    );
    return { model };
  }

  // src/LaunchProteinView/hooks/useLocalStructureFileSequence.ts
  async function structureFileSequenceFetcher2(file, format) {
    return withTemporaryMolstarPlugin(async (plugin) => {
      const { model } = await addStructureFromData({
        data: await file.text(),
        plugin,
        format
      });
      return extractStructureSequences(model);
    });
  }
  function useLocalStructureFileSequence({
    file
  }) {
    const { data, error, isLoading } = useSWR(
      file ? ["local-structure", file.name, file.size, file.lastModified] : null,
      async () => {
        if (!file) {
          return void 0;
        }
        const ext = file.name.slice(file.name.lastIndexOf(".") + 1) || "pdb";
        const seq = await structureFileSequenceFetcher2(
          file,
          ext === "cif" ? "mmcif" : ext
        );
        if (!seq) {
          throw new Error("no sequences detected in file");
        }
        return seq;
      },
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false
      }
    );
    return { error, isLoading, sequences: data };
  }

  // src/LaunchProteinView/hooks/useTranscriptSelection.ts
  var import_react37 = __toESM(require_react());
  init_util();
  function useTranscriptSelection({
    options,
    isoformSequences,
    structureSequence
  }) {
    const [userSelection, setUserSelection] = (0, import_react37.useState)();
    (0, import_react37.useEffect)(() => {
      if (isoformSequences !== void 0 && userSelection === void 0) {
        const best = selectBestTranscript({
          options,
          isoformSequences,
          structureSequence
        });
        setUserSelection(best?.id());
      }
    }, [options, structureSequence, isoformSequences, userSelection]);
    return { userSelection, setUserSelection };
  }

  // src/LaunchProteinView/components/UserProvidedStructure.tsx
  init_util();
  var useStyles9 = (0, import_mui9.makeStyles)()((theme) => ({
    dialogContent: {
      marginTop: theme.spacing(6),
      width: "80em"
    },
    textAreaFont: {
      fontFamily: "Courier New"
    }
  }));
  function HelpText() {
    return /* @__PURE__ */ import_react38.default.createElement("div", { style: { marginBottom: 20 } }, "Manually supply a protein structure (PDB, mmCIF, etc) for a given transcript. You can open the file from the result of running, for example,", " ", /* @__PURE__ */ import_react38.default.createElement(ExternalLink, { href: "https://github.com/sokrypton/ColabFold" }, "ColabFold"), ". This plugin will align the protein sequence calculated from the genome to the protein sequence embedded in the structure file which allows for slight differences in these two representations.");
  }
  var UserProvidedStructure = (0, import_mobx_react11.observer)(function UserProvidedStructure2({
    feature,
    model,
    handleClose,
    alignmentAlgorithm,
    onAlignmentAlgorithmChange
  }) {
    const { classes } = useStyles9();
    const session = (0, import_util33.getSession)(model);
    const [file, setFile] = (0, import_react38.useState)();
    const [pdbId, setPdbId] = (0, import_react38.useState)("");
    const [choice, setChoice] = (0, import_react38.useState)("file");
    const [submitError, setSubmitError] = (0, import_react38.useState)();
    const [structureURL, setStructureURL] = (0, import_react38.useState)("");
    const [showAllProteinSequences, setShowAllProteinSequences] = (0, import_react38.useState)(false);
    const options = (0, import_react38.useMemo)(() => getTranscriptFeatures(feature), [feature]);
    const view = (0, import_util33.getContainingView)(model);
    const { isoformSequences, error: isoformError } = useIsoformProteinSequences({
      feature,
      view
    });
    const { sequences: structureSequences1, error: localFileError } = useLocalStructureFileSequence({ file });
    const { sequences: structureSequences2, error: remoteFileError } = useRemoteStructureFileSequence({ url: structureURL });
    const structureName = file?.name ?? structureURL.slice(structureURL.lastIndexOf("/") + 1);
    const structureSequences = structureSequences1 ?? structureSequences2;
    const structureSequence = structureSequences?.[0];
    const { userSelection, setUserSelection } = useTranscriptSelection({
      options,
      isoformSequences,
      structureSequence
    });
    const selectedTranscript = options.find((val) => getId(val) === userSelection);
    const protein = isoformSequences?.[userSelection ?? ""];
    const error = isoformError ?? submitError ?? localFileError ?? remoteFileError;
    return /* @__PURE__ */ import_react38.default.createElement(import_react38.default.Fragment, null, /* @__PURE__ */ import_react38.default.createElement(import_material20.DialogContent, { className: classes.dialogContent }, error ? /* @__PURE__ */ import_react38.default.createElement(import_ui4.ErrorMessage, { error }) : null, /* @__PURE__ */ import_react38.default.createElement(HelpText, null), /* @__PURE__ */ import_react38.default.createElement("div", { style: { display: "flex", margin: 30 } }, /* @__PURE__ */ import_react38.default.createElement(import_material20.Typography, null, "Open your structure file ", /* @__PURE__ */ import_react38.default.createElement(HelpButton, null)), /* @__PURE__ */ import_react38.default.createElement(import_material20.FormControl, { component: "fieldset" }, /* @__PURE__ */ import_react38.default.createElement(
      import_material20.RadioGroup,
      {
        value: choice,
        onChange: (event) => {
          setChoice(event.target.value);
        }
      },
      /* @__PURE__ */ import_react38.default.createElement(import_material20.FormControlLabel, { value: "url", control: /* @__PURE__ */ import_react38.default.createElement(import_material20.Radio, null), label: "URL" }),
      /* @__PURE__ */ import_react38.default.createElement(import_material20.FormControlLabel, { value: "file", control: /* @__PURE__ */ import_react38.default.createElement(import_material20.Radio, null), label: "File" }),
      /* @__PURE__ */ import_react38.default.createElement(
        import_material20.FormControlLabel,
        {
          value: "pdb",
          control: /* @__PURE__ */ import_react38.default.createElement(import_material20.Radio, null),
          label: "PDB ID"
        }
      )
    )), choice === "url" ? /* @__PURE__ */ import_react38.default.createElement("div", null, /* @__PURE__ */ import_react38.default.createElement(import_material20.Typography, null, "Open a PDB/mmCIF/etc. file from remote URL"), /* @__PURE__ */ import_react38.default.createElement(
      import_material20.TextField,
      {
        label: "URL",
        value: structureURL,
        onChange: (event) => {
          setStructureURL(event.target.value);
        }
      }
    )) : null, choice === "file" ? /* @__PURE__ */ import_react38.default.createElement("div", { style: { paddingTop: 20 } }, /* @__PURE__ */ import_react38.default.createElement(import_material20.Typography, null, "Open a PDB/mmCIF/etc. file from your local drive"), /* @__PURE__ */ import_react38.default.createElement(import_material20.Button, { variant: "outlined", component: "label" }, "Choose File", /* @__PURE__ */ import_react38.default.createElement(
      "input",
      {
        type: "file",
        hidden: true,
        onChange: ({ target }) => {
          const file2 = target.files?.[0];
          if (file2) {
            setFile(file2);
          }
        }
      }
    ))) : null, choice === "pdb" ? /* @__PURE__ */ import_react38.default.createElement(
      import_material20.TextField,
      {
        value: pdbId,
        onChange: (event) => {
          const s = event.target.value;
          setPdbId(s);
          setStructureURL(`https://files.rcsb.org/download/${s}.cif`);
        },
        label: "PDB ID"
      }
    ) : null), /* @__PURE__ */ import_react38.default.createElement("div", { style: { margin: 20 } }, isoformSequences ? structureSequence ? /* @__PURE__ */ import_react38.default.createElement(import_react38.default.Fragment, null, /* @__PURE__ */ import_react38.default.createElement(
      TranscriptSelector,
      {
        val: userSelection ?? "",
        setVal: setUserSelection,
        structureSequence,
        isoforms: options,
        feature,
        isoformSequences
      }
    ), /* @__PURE__ */ import_react38.default.createElement("div", { style: { margin: 10 } }, /* @__PURE__ */ import_react38.default.createElement(
      import_material20.Button,
      {
        variant: "contained",
        color: "primary",
        onClick: () => {
          setShowAllProteinSequences(!showAllProteinSequences);
        }
      },
      showAllProteinSequences ? "Hide all isoform protein sequences" : "Show all isoform protein sequences"
    ), showAllProteinSequences ? /* @__PURE__ */ import_react38.default.createElement(
      MSATable,
      {
        structureSequence,
        structureName,
        isoformSequences
      }
    ) : null)) : null : /* @__PURE__ */ import_react38.default.createElement(import_ui4.LoadingEllipses, { title: "Loading protein sequences", variant: "h6" }))), /* @__PURE__ */ import_react38.default.createElement(import_material20.DialogActions, null, protein?.seq && structureSequence && stripStopCodon(protein.seq) !== structureSequence ? /* @__PURE__ */ import_react38.default.createElement(
      import_material20.Typography,
      {
        variant: "body2",
        sx: { mr: 2, display: "flex", alignItems: "center" }
      },
      "Transcript and structure sequences differ, will run",
      " ",
      ALIGNMENT_ALGORITHM_LABELS[alignmentAlgorithm] ?? alignmentAlgorithm,
      " ",
      "alignment",
      /* @__PURE__ */ import_react38.default.createElement(
        AlignmentSettingsButton,
        {
          value: alignmentAlgorithm,
          onChange: onAlignmentAlgorithmChange
        }
      )
    ) : null, /* @__PURE__ */ import_react38.default.createElement(
      import_material20.Button,
      {
        variant: "contained",
        color: "secondary",
        onClick: () => {
          handleClose();
        }
      },
      "Cancel"
    ), /* @__PURE__ */ import_react38.default.createElement(
      import_material20.Button,
      {
        variant: "contained",
        color: "primary",
        disabled: !(structureURL || file) || !protein || !selectedTranscript,
        onClick: () => {
          ;
          (async () => {
            try {
              const structureData = file ? await file.text() : void 0;
              session.addView("ProteinView", {
                type: "ProteinView",
                alignmentAlgorithm,
                displayName: `Protein view ${getGeneDisplayName(feature)} - ${getTranscriptDisplayName(selectedTranscript)}`,
                structures: [
                  {
                    url: structureURL || void 0,
                    data: structureData,
                    connectedViewId: view.id,
                    feature: selectedTranscript?.toJSON(),
                    userProvidedTranscriptSequence: protein?.seq ?? ""
                  }
                ]
              });
              handleClose();
            } catch (e) {
              console.error(e);
              setSubmitError(e);
            }
          })();
        }
      },
      "Launch 3-D protein structure view"
    )));
  });
  var UserProvidedStructure_default = UserProvidedStructure;

  // src/LaunchProteinView/hooks/useLocalStorage.ts
  var import_react39 = __toESM(require_react());
  function useLocalStorage(key, defaultValue) {
    const [value, setValue] = (0, import_react39.useState)(() => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultValue;
        }
      }
      return defaultValue;
    });
    (0, import_react39.useEffect)(() => {
      localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
  }

  // src/LaunchProteinView/components/LaunchProteinViewDialog.tsx
  function LaunchProteinViewDialog({
    handleClose,
    feature,
    model
  }) {
    const [choice, setChoice] = (0, import_react40.useState)(0);
    const [alignmentAlgorithm, setAlignmentAlgorithm] = useLocalStorage(
      "jbrowse-protein3d-alignment-algorithm",
      DEFAULT_ALIGNMENT_ALGORITHM
    );
    return /* @__PURE__ */ import_react40.default.createElement(
      import_ui5.Dialog,
      {
        maxWidth: "xl",
        title: "Launch protein view",
        titleNode: /* @__PURE__ */ import_react40.default.createElement(import_react40.default.Fragment, null, "Launch protein view ", /* @__PURE__ */ import_react40.default.createElement(HelpButton, null)),
        open: true,
        onClose: () => {
          handleClose();
        }
      },
      /* @__PURE__ */ import_react40.default.createElement(
        import_material21.Tabs,
        {
          value: choice,
          onChange: (_, val) => {
            setChoice(val);
          }
        },
        /* @__PURE__ */ import_react40.default.createElement(import_material21.Tab, { value: 0, label: "AlphaFoldDB search" }),
        /* @__PURE__ */ import_react40.default.createElement(import_material21.Tab, { value: 1, label: "Foldseek search" }),
        /* @__PURE__ */ import_react40.default.createElement(import_material21.Tab, { value: 2, label: "Open file manually" })
      ),
      /* @__PURE__ */ import_react40.default.createElement(TabPanel, { value: choice, index: 0 }, /* @__PURE__ */ import_react40.default.createElement(
        AlphaFoldDBSearch_default,
        {
          model,
          feature,
          handleClose,
          alignmentAlgorithm,
          onAlignmentAlgorithmChange: setAlignmentAlgorithm
        }
      )),
      /* @__PURE__ */ import_react40.default.createElement(TabPanel, { value: choice, index: 1 }, /* @__PURE__ */ import_react40.default.createElement(
        FoldseekSearch_default,
        {
          model,
          feature,
          handleClose
        }
      )),
      /* @__PURE__ */ import_react40.default.createElement(TabPanel, { value: choice, index: 2 }, /* @__PURE__ */ import_react40.default.createElement(
        UserProvidedStructure_default,
        {
          model,
          feature,
          handleClose,
          alignmentAlgorithm,
          onAlignmentAlgorithmChange: setAlignmentAlgorithm
        }
      ))
    );
  }

  // src/LaunchProteinView/index.ts
  function isDisplay(elt) {
    return elt.name === "LinearBasicDisplay" || elt.name === "LinearFeatureDisplay";
  }
  function extendStateModel(stateModel) {
    return stateModel.views(
      (self) => {
        const superContextMenuItems = self.contextMenuItems;
        return {
          contextMenuItems() {
            const feature = self.contextMenuFeature;
            const track = (0, import_util35.getContainingTrack)(self);
            const contextMenuInfo = self.contextMenuInfo;
            const showProteinMenuItem = feature && ["gene", "mRNA", "transcript"].includes(feature.get("type"));
            return [
              ...superContextMenuItems(),
              ...showProteinMenuItem ? [
                {
                  label: "Launch protein view",
                  icon: Add_default,
                  onClick: () => {
                    const session = (0, import_util35.getSession)(track);
                    const openDialog = (f) => {
                      session.queueDialog((handleClose) => [
                        LaunchProteinViewDialog,
                        { model: track, handleClose, feature: f }
                      ]);
                    };
                    if (self.fetchFullFeature && contextMenuInfo) {
                      ;
                      (async () => {
                        const fullFeature = await self.fetchFullFeature(
                          feature.id(),
                          contextMenuInfo.regionNumber
                        );
                        if (fullFeature) {
                          openDialog(fullFeature);
                        }
                      })();
                    } else {
                      openDialog(feature);
                    }
                  }
                }
              ] : []
            ];
          }
        };
      }
    );
  }
  function LaunchProteinViewF(pluginManager) {
    pluginManager.addToExtensionPoint(
      "Core-extendPluggableElement",
      (elt) => {
        if (isDisplay(elt)) {
          elt.stateModel = extendStateModel(elt.stateModel);
        }
        return elt;
      }
    );
  }

  // src/LaunchProteinViewExtensionPoint/index.ts
  function LaunchProteinViewExtensionPointF(pluginManager) {
    pluginManager.addToExtensionPoint(
      "LaunchView-ProteinView",
      // @ts-expect-error
      async ({
        session,
        url,
        userProvidedTranscriptSequence,
        feature,
        connectedViewId,
        alignmentAlgorithm,
        displayName,
        height,
        showControls,
        showHighlight,
        zoomToBaseLevel
      }) => {
        if (!url) {
          throw new Error("No URL provided when launching protein view");
        }
        session.addView("ProteinView", {
          type: "ProteinView",
          alignmentAlgorithm,
          displayName,
          height,
          showControls,
          showHighlight,
          zoomToBaseLevel,
          structures: [
            {
              url,
              userProvidedTranscriptSequence: userProvidedTranscriptSequence ?? "",
              feature,
              connectedViewId
            }
          ]
        });
      }
    );
  }

  // src/ProteinView/index.ts
  var import_react52 = __toESM(require_react());
  var import_pluggableElementTypes2 = __toESM(require_pluggableElementTypes());

  // src/ProteinView/model.ts
  var import_pluggableElementTypes = __toESM(require_pluggableElementTypes());
  var import_mst = __toESM(require_mst());
  var import_mobx_state_tree2 = __toESM(require_mobx_state_tree());

  // node_modules/@mui/icons-material/esm/Visibility.js
  init_createSvgIcon();
  var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
  var Visibility_default = (0, import_utils.createSvgIcon)(/* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", {
    d: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"
  }), "Visibility");

  // src/ProteinView/model.ts
  var import_mobx4 = __toESM(require_mobx());

  // src/ProteinView/highlightResidue.ts
  init_loadMolstar();
  async function highlightResidue({
    structure,
    selectedResidue,
    plugin
  }) {
    const { StructureSelection } = await loadMolstar();
    const sel = await getMolstarStructureSelection({
      structure,
      selectedResidue: selectedResidue + 1
    });
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    plugin.managers.interactivity.lociHighlights.clearHighlights();
    plugin.managers.interactivity.lociHighlights.highlight({
      loci
    });
  }

  // src/ProteinView/structureModel.ts
  var import_util39 = __toESM(require_util());
  var import_mobx_state_tree = __toESM(require_mobx_state_tree());
  var import_mobx3 = __toESM(require_mobx());

  // src/ProteinView/clearSelection.ts
  function clearSelection({ plugin }) {
    plugin.managers.interactivity.lociSelects.deselectAll();
  }

  // src/ProteinView/structureModel.ts
  init_loadMolstar();

  // src/ProteinView/pairwiseAlignment.ts
  var BLOSUM62 = {
    A: {
      A: 4,
      R: -1,
      N: -2,
      D: -2,
      C: 0,
      Q: -1,
      E: -1,
      G: 0,
      H: -2,
      I: -1,
      L: -1,
      K: -1,
      M: -1,
      F: -2,
      P: -1,
      S: 1,
      T: 0,
      W: -3,
      Y: -2,
      V: 0,
      B: -2,
      Z: -1,
      X: 0,
      "*": -4
    },
    R: {
      A: -1,
      R: 5,
      N: 0,
      D: -2,
      C: -3,
      Q: 1,
      E: 0,
      G: -2,
      H: 0,
      I: -3,
      L: -2,
      K: 2,
      M: -1,
      F: -3,
      P: -2,
      S: -1,
      T: -1,
      W: -3,
      Y: -2,
      V: -3,
      B: -1,
      Z: 0,
      X: -1,
      "*": -4
    },
    N: {
      A: -2,
      R: 0,
      N: 6,
      D: 1,
      C: -3,
      Q: 0,
      E: 0,
      G: 0,
      H: 1,
      I: -3,
      L: -3,
      K: 0,
      M: -2,
      F: -3,
      P: -2,
      S: 1,
      T: 0,
      W: -4,
      Y: -2,
      V: -3,
      B: 3,
      Z: 0,
      X: -1,
      "*": -4
    },
    D: {
      A: -2,
      R: -2,
      N: 1,
      D: 6,
      C: -3,
      Q: 0,
      E: 2,
      G: -1,
      H: -1,
      I: -3,
      L: -4,
      K: -1,
      M: -3,
      F: -3,
      P: -1,
      S: 0,
      T: -1,
      W: -4,
      Y: -3,
      V: -3,
      B: 4,
      Z: 1,
      X: -1,
      "*": -4
    },
    C: {
      A: 0,
      R: -3,
      N: -3,
      D: -3,
      C: 9,
      Q: -3,
      E: -4,
      G: -3,
      H: -3,
      I: -1,
      L: -1,
      K: -3,
      M: -1,
      F: -2,
      P: -3,
      S: -1,
      T: -1,
      W: -2,
      Y: -2,
      V: -1,
      B: -3,
      Z: -3,
      X: -2,
      "*": -4
    },
    Q: {
      A: -1,
      R: 1,
      N: 0,
      D: 0,
      C: -3,
      Q: 5,
      E: 2,
      G: -2,
      H: 0,
      I: -3,
      L: -2,
      K: 1,
      M: 0,
      F: -3,
      P: -1,
      S: 0,
      T: -1,
      W: -2,
      Y: -1,
      V: -2,
      B: 0,
      Z: 3,
      X: -1,
      "*": -4
    },
    E: {
      A: -1,
      R: 0,
      N: 0,
      D: 2,
      C: -4,
      Q: 2,
      E: 5,
      G: -2,
      H: 0,
      I: -3,
      L: -3,
      K: 1,
      M: -2,
      F: -3,
      P: -1,
      S: 0,
      T: -1,
      W: -3,
      Y: -2,
      V: -2,
      B: 1,
      Z: 4,
      X: -1,
      "*": -4
    },
    G: {
      A: 0,
      R: -2,
      N: 0,
      D: -1,
      C: -3,
      Q: -2,
      E: -2,
      G: 6,
      H: -2,
      I: -4,
      L: -4,
      K: -2,
      M: -3,
      F: -3,
      P: -2,
      S: 0,
      T: -2,
      W: -2,
      Y: -3,
      V: -3,
      B: -1,
      Z: -2,
      X: -1,
      "*": -4
    },
    H: {
      A: -2,
      R: 0,
      N: 1,
      D: -1,
      C: -3,
      Q: 0,
      E: 0,
      G: -2,
      H: 8,
      I: -3,
      L: -3,
      K: -1,
      M: -2,
      F: -1,
      P: -2,
      S: -1,
      T: -2,
      W: -2,
      Y: 2,
      V: -3,
      B: 0,
      Z: 0,
      X: -1,
      "*": -4
    },
    I: {
      A: -1,
      R: -3,
      N: -3,
      D: -3,
      C: -1,
      Q: -3,
      E: -3,
      G: -4,
      H: -3,
      I: 4,
      L: 2,
      K: -3,
      M: 1,
      F: 0,
      P: -3,
      S: -2,
      T: -1,
      W: -3,
      Y: -1,
      V: 3,
      B: -3,
      Z: -3,
      X: -1,
      "*": -4
    },
    L: {
      A: -1,
      R: -2,
      N: -3,
      D: -4,
      C: -1,
      Q: -2,
      E: -3,
      G: -4,
      H: -3,
      I: 2,
      L: 4,
      K: -2,
      M: 2,
      F: 0,
      P: -3,
      S: -2,
      T: -1,
      W: -2,
      Y: -1,
      V: 1,
      B: -4,
      Z: -3,
      X: -1,
      "*": -4
    },
    K: {
      A: -1,
      R: 2,
      N: 0,
      D: -1,
      C: -3,
      Q: 1,
      E: 1,
      G: -2,
      H: -1,
      I: -3,
      L: -2,
      K: 5,
      M: -1,
      F: -3,
      P: -1,
      S: 0,
      T: -1,
      W: -3,
      Y: -2,
      V: -2,
      B: 0,
      Z: 1,
      X: -1,
      "*": -4
    },
    M: {
      A: -1,
      R: -1,
      N: -2,
      D: -3,
      C: -1,
      Q: 0,
      E: -2,
      G: -3,
      H: -2,
      I: 1,
      L: 2,
      K: -1,
      M: 5,
      F: 0,
      P: -2,
      S: -1,
      T: -1,
      W: -1,
      Y: -1,
      V: 1,
      B: -3,
      Z: -1,
      X: -1,
      "*": -4
    },
    F: {
      A: -2,
      R: -3,
      N: -3,
      D: -3,
      C: -2,
      Q: -3,
      E: -3,
      G: -3,
      H: -1,
      I: 0,
      L: 0,
      K: -3,
      M: 0,
      F: 6,
      P: -4,
      S: -2,
      T: -2,
      W: 1,
      Y: 3,
      V: -1,
      B: -3,
      Z: -3,
      X: -1,
      "*": -4
    },
    P: {
      A: -1,
      R: -2,
      N: -2,
      D: -1,
      C: -3,
      Q: -1,
      E: -1,
      G: -2,
      H: -2,
      I: -3,
      L: -3,
      K: -1,
      M: -2,
      F: -4,
      P: 7,
      S: -1,
      T: -1,
      W: -4,
      Y: -3,
      V: -2,
      B: -2,
      Z: -1,
      X: -2,
      "*": -4
    },
    S: {
      A: 1,
      R: -1,
      N: 1,
      D: 0,
      C: -1,
      Q: 0,
      E: 0,
      G: 0,
      H: -1,
      I: -2,
      L: -2,
      K: 0,
      M: -1,
      F: -2,
      P: -1,
      S: 4,
      T: 1,
      W: -3,
      Y: -2,
      V: -2,
      B: 0,
      Z: 0,
      X: 0,
      "*": -4
    },
    T: {
      A: 0,
      R: -1,
      N: 0,
      D: -1,
      C: -1,
      Q: -1,
      E: -1,
      G: -2,
      H: -2,
      I: -1,
      L: -1,
      K: -1,
      M: -1,
      F: -2,
      P: -1,
      S: 1,
      T: 5,
      W: -2,
      Y: -2,
      V: 0,
      B: -1,
      Z: -1,
      X: 0,
      "*": -4
    },
    W: {
      A: -3,
      R: -3,
      N: -4,
      D: -4,
      C: -2,
      Q: -2,
      E: -3,
      G: -2,
      H: -2,
      I: -3,
      L: -2,
      K: -3,
      M: -1,
      F: 1,
      P: -4,
      S: -3,
      T: -2,
      W: 11,
      Y: 2,
      V: -3,
      B: -4,
      Z: -3,
      X: -2,
      "*": -4
    },
    Y: {
      A: -2,
      R: -2,
      N: -2,
      D: -3,
      C: -2,
      Q: -1,
      E: -2,
      G: -3,
      H: 2,
      I: -1,
      L: -1,
      K: -2,
      M: -1,
      F: 3,
      P: -3,
      S: -2,
      T: -2,
      W: 2,
      Y: 7,
      V: -1,
      B: -3,
      Z: -2,
      X: -1,
      "*": -4
    },
    V: {
      A: 0,
      R: -3,
      N: -3,
      D: -3,
      C: -1,
      Q: -2,
      E: -2,
      G: -3,
      H: -3,
      I: 3,
      L: 1,
      K: -2,
      M: 1,
      F: -1,
      P: -2,
      S: -2,
      T: 0,
      W: -3,
      Y: -1,
      V: 4,
      B: -3,
      Z: -2,
      X: -1,
      "*": -4
    },
    B: {
      A: -2,
      R: -1,
      N: 3,
      D: 4,
      C: -3,
      Q: 0,
      E: 1,
      G: -1,
      H: 0,
      I: -3,
      L: -4,
      K: 0,
      M: -3,
      F: -3,
      P: -2,
      S: 0,
      T: -1,
      W: -4,
      Y: -3,
      V: -3,
      B: 4,
      Z: 1,
      X: -1,
      "*": -4
    },
    Z: {
      A: -1,
      R: 0,
      N: 0,
      D: 1,
      C: -3,
      Q: 3,
      E: 4,
      G: -2,
      H: 0,
      I: -3,
      L: -3,
      K: 1,
      M: -1,
      F: -3,
      P: -1,
      S: 0,
      T: -1,
      W: -3,
      Y: -2,
      V: -2,
      B: 1,
      Z: 4,
      X: -1,
      "*": -4
    },
    X: {
      A: 0,
      R: -1,
      N: -1,
      D: -1,
      C: -2,
      Q: -1,
      E: -1,
      G: -1,
      H: -1,
      I: -1,
      L: -1,
      K: -1,
      M: -1,
      F: -1,
      P: -2,
      S: 0,
      T: 0,
      W: -2,
      Y: -1,
      V: -1,
      B: -1,
      Z: -1,
      X: -1,
      "*": -4
    },
    "*": {
      A: -4,
      R: -4,
      N: -4,
      D: -4,
      C: -4,
      Q: -4,
      E: -4,
      G: -4,
      H: -4,
      I: -4,
      L: -4,
      K: -4,
      M: -4,
      F: -4,
      P: -4,
      S: -4,
      T: -4,
      W: -4,
      Y: -4,
      V: -4,
      B: -4,
      Z: -4,
      X: -4,
      "*": 1
    }
  };
  function getScore(a, b) {
    const upper_a = a.toUpperCase();
    const upper_b = b.toUpperCase();
    return BLOSUM62[upper_a]?.[upper_b] ?? -4;
  }
  var GAP_OPEN = -10;
  var GAP_EXTEND = -0.5;
  function needlemanWunsch(seq1, seq2, gapOpen = GAP_OPEN, gapExtend = GAP_EXTEND) {
    const m = seq1.length;
    const n = seq2.length;
    const M = [];
    const Ix = [];
    const Iy = [];
    for (let i2 = 0; i2 <= m; i2++) {
      M[i2] = [];
      Ix[i2] = [];
      Iy[i2] = [];
      for (let j2 = 0; j2 <= n; j2++) {
        M[i2][j2] = -Infinity;
        Ix[i2][j2] = -Infinity;
        Iy[i2][j2] = -Infinity;
      }
    }
    M[0][0] = 0;
    for (let i2 = 1; i2 <= m; i2++) {
      Ix[i2][0] = gapOpen + (i2 - 1) * gapExtend;
    }
    for (let j2 = 1; j2 <= n; j2++) {
      Iy[0][j2] = gapOpen + (j2 - 1) * gapExtend;
    }
    for (let i2 = 1; i2 <= m; i2++) {
      for (let j2 = 1; j2 <= n; j2++) {
        const matchScore = getScore(seq1[i2 - 1], seq2[j2 - 1]);
        M[i2][j2] = Math.max(M[i2 - 1][j2 - 1], Ix[i2 - 1][j2 - 1], Iy[i2 - 1][j2 - 1]) + matchScore;
        Ix[i2][j2] = Math.max(M[i2 - 1][j2] + gapOpen, Ix[i2 - 1][j2] + gapExtend);
        Iy[i2][j2] = Math.max(M[i2][j2 - 1] + gapOpen, Iy[i2][j2 - 1] + gapExtend);
      }
    }
    let alignedSeq1 = "";
    let alignedSeq2 = "";
    let i = m;
    let j = n;
    const finalScores = [M[m][n], Ix[m][n], Iy[m][n]];
    const score = Math.max(...finalScores);
    let currentMatrix = score === M[m][n] ? "M" : score === Ix[m][n] ? "Ix" : "Iy";
    while (i > 0 || j > 0) {
      if (currentMatrix === "M" && i > 0 && j > 0) {
        alignedSeq1 = seq1[i - 1] + alignedSeq1;
        alignedSeq2 = seq2[j - 1] + alignedSeq2;
        const matchScore = getScore(seq1[i - 1], seq2[j - 1]);
        const prevM = M[i - 1][j - 1];
        const prevIx = Ix[i - 1][j - 1];
        if (M[i][j] === prevM + matchScore) {
          currentMatrix = "M";
        } else if (M[i][j] === prevIx + matchScore) {
          currentMatrix = "Ix";
        } else {
          currentMatrix = "Iy";
        }
        i--;
        j--;
      } else if (currentMatrix === "Ix" && i > 0) {
        alignedSeq1 = seq1[i - 1] + alignedSeq1;
        alignedSeq2 = "-" + alignedSeq2;
        if (Ix[i][j] === M[i - 1][j] + gapOpen) {
          currentMatrix = "M";
        } else {
          currentMatrix = "Ix";
        }
        i--;
      } else if (j > 0) {
        alignedSeq1 = "-" + alignedSeq1;
        alignedSeq2 = seq2[j - 1] + alignedSeq2;
        if (Iy[i][j] === M[i][j - 1] + gapOpen) {
          currentMatrix = "M";
        } else {
          currentMatrix = "Iy";
        }
        j--;
      } else {
        break;
      }
    }
    return { alignedSeq1, alignedSeq2, score };
  }
  function smithWaterman(seq1, seq2, gapOpen = GAP_OPEN, gapExtend = GAP_EXTEND) {
    const m = seq1.length;
    const n = seq2.length;
    const M = [];
    const Ix = [];
    const Iy = [];
    let bestScore = 0;
    let bestI = 0;
    let bestJ = 0;
    for (let i2 = 0; i2 <= m; i2++) {
      M[i2] = [];
      Ix[i2] = [];
      Iy[i2] = [];
      for (let j2 = 0; j2 <= n; j2++) {
        M[i2][j2] = 0;
        Ix[i2][j2] = -Infinity;
        Iy[i2][j2] = -Infinity;
      }
    }
    for (let i2 = 1; i2 <= m; i2++) {
      for (let j2 = 1; j2 <= n; j2++) {
        const matchScore = getScore(seq1[i2 - 1], seq2[j2 - 1]);
        M[i2][j2] = Math.max(
          0,
          M[i2 - 1][j2 - 1] + matchScore,
          Ix[i2 - 1][j2 - 1] + matchScore,
          Iy[i2 - 1][j2 - 1] + matchScore
        );
        Ix[i2][j2] = Math.max(M[i2 - 1][j2] + gapOpen, Ix[i2 - 1][j2] + gapExtend);
        Iy[i2][j2] = Math.max(M[i2][j2 - 1] + gapOpen, Iy[i2][j2 - 1] + gapExtend);
        const cellMax = Math.max(M[i2][j2], Ix[i2][j2], Iy[i2][j2]);
        if (cellMax > bestScore) {
          bestScore = cellMax;
          bestI = i2;
          bestJ = j2;
        }
      }
    }
    let alignedSeq1 = "";
    let alignedSeq2 = "";
    let i = bestI;
    let j = bestJ;
    let currentMatrix = M[i][j] >= Ix[i][j] && M[i][j] >= Iy[i][j] ? "M" : Ix[i][j] >= Iy[i][j] ? "Ix" : "Iy";
    for (let k = seq1.length; k > bestI; k--) {
      alignedSeq1 = seq1[k - 1] + alignedSeq1;
      alignedSeq2 = "-" + alignedSeq2;
    }
    for (let k = seq2.length; k > bestJ; k--) {
      alignedSeq1 = "-" + alignedSeq1;
      alignedSeq2 = seq2[k - 1] + alignedSeq2;
    }
    while (i > 0 && j > 0) {
      if (currentMatrix === "M") {
        if (M[i][j] === 0) {
          break;
        }
        alignedSeq1 = seq1[i - 1] + alignedSeq1;
        alignedSeq2 = seq2[j - 1] + alignedSeq2;
        const matchScore = getScore(seq1[i - 1], seq2[j - 1]);
        const prevM = M[i - 1][j - 1];
        const prevIx = Ix[i - 1][j - 1];
        if (M[i][j] === prevM + matchScore) {
          currentMatrix = "M";
        } else if (M[i][j] === prevIx + matchScore) {
          currentMatrix = "Ix";
        } else {
          currentMatrix = "Iy";
        }
        i--;
        j--;
      } else if (currentMatrix === "Ix") {
        alignedSeq1 = seq1[i - 1] + alignedSeq1;
        alignedSeq2 = "-" + alignedSeq2;
        if (Ix[i][j] === M[i - 1][j] + gapOpen) {
          currentMatrix = "M";
        }
        i--;
      } else {
        alignedSeq1 = "-" + alignedSeq1;
        alignedSeq2 = seq2[j - 1] + alignedSeq2;
        if (Iy[i][j] === M[i][j - 1] + gapOpen) {
          currentMatrix = "M";
        }
        j--;
      }
    }
    while (i > 0) {
      alignedSeq1 = seq1[i - 1] + alignedSeq1;
      alignedSeq2 = "-" + alignedSeq2;
      i--;
    }
    while (j > 0) {
      alignedSeq1 = "-" + alignedSeq1;
      alignedSeq2 = seq2[j - 1] + alignedSeq2;
      j--;
    }
    return { alignedSeq1, alignedSeq2, score: bestScore };
  }
  function buildConsensus(alignedSeq1, alignedSeq2) {
    let consensus = "";
    for (let i = 0; i < alignedSeq1.length; i++) {
      const a = alignedSeq1[i];
      const b = alignedSeq2[i];
      if (a === "-" || b === "-") {
        consensus += " ";
      } else if (a.toUpperCase() === b.toUpperCase()) {
        consensus += "|";
      } else {
        consensus += " ";
      }
    }
    return consensus;
  }
  function runLocalAlignment(seq1, seq2, algorithm = "needleman_wunsch") {
    const { alignedSeq1, alignedSeq2 } = algorithm === "smith_waterman" ? smithWaterman(seq1, seq2) : needlemanWunsch(seq1, seq2);
    return {
      consensus: buildConsensus(alignedSeq1, alignedSeq2),
      alns: [
        { id: "a", seq: alignedSeq1 },
        { id: "b", seq: alignedSeq2 }
      ]
    };
  }

  // src/ProteinView/structureModel.ts
  init_proteinToGenomeMapping();

  // src/ProteinView/selectResidue.ts
  init_loadMolstar();
  async function selectResidue({
    structure,
    selectedResidue,
    plugin
  }) {
    const { StructureSelection } = await loadMolstar();
    const sel = await getMolstarStructureSelection({ structure, selectedResidue });
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    plugin.managers.interactivity.lociSelects.select({
      loci
    });
  }

  // src/ProteinView/structureModel.ts
  init_launchViewUtils();
  init_util();
  init_mappings();
  function extractLocationInfo(molstar, location) {
    return {
      structureSeqPos: molstar.StructureProperties.residue.auth_seq_id(location) - 1,
      code: molstar.StructureProperties.atom.label_comp_id(location),
      chain: molstar.StructureProperties.chain.auth_asym_id(location)
    };
  }
  var Structure = import_mobx_state_tree.types.model({
    /**
     * #property
     */
    url: import_mobx_state_tree.types.maybe(import_mobx_state_tree.types.string),
    /**
     * #property
     */
    data: import_mobx_state_tree.types.maybe(import_mobx_state_tree.types.string),
    /**
     * #property
     */
    connectedViewId: import_mobx_state_tree.types.maybe(import_mobx_state_tree.types.string),
    /**
     * #property
     */
    pairwiseAlignment: import_mobx_state_tree.types.frozen(),
    /**
     * #property
     */
    feature: import_mobx_state_tree.types.frozen(),
    /**
     * #property
     */
    userProvidedTranscriptSequence: import_mobx_state_tree.types.string
  }).volatile(() => ({
    /**
     * #volatile
     */
    clickGenomeHighlights: [],
    /**
     * #volatile
     */
    hoverGenomeHighlights: [],
    /**
     * #volatile
     */
    clickPosition: void 0,
    /**
     * #volatile
     */
    hoverPosition: void 0,
    /**
     * #volatile
     */
    pairwiseAlignmentStatus: "",
    /**
     * #volatile
     */
    structureSequences: void 0,
    /**
     * #volatile
     */
    isMouseInAlignment: false,
    /**
     * #volatile
     * Tracks whether this structure has been loaded into Molstar
     */
    loadedToMolstar: false,
    /**
     * #volatile
     * Range of alignment positions to highlight (e.g., when hovering a protein feature)
     */
    alignmentHoverRange: void 0,
    /**
     * #volatile
     * Persistent range of alignment positions from click (e.g., when clicking a protein feature)
     */
    clickAlignmentRange: void 0,
    /**
     * #volatile
     * The uniqueId of the currently selected protein feature (for persistent highlight)
     */
    selectedFeatureId: void 0,
    /**
     * #volatile
     * Set of feature track types that are hidden
     */
    hiddenFeatureTypes: /* @__PURE__ */ new Set()
  })).actions((self) => ({
    setSequences(str) {
      self.structureSequences = str;
    },
    /**
     * #action
     */
    hideFeatureType(type) {
      self.hiddenFeatureTypes = /* @__PURE__ */ new Set([...self.hiddenFeatureTypes, type]);
    },
    /**
     * #action
     */
    showFeatureType(type) {
      const newSet = new Set(self.hiddenFeatureTypes);
      newSet.delete(type);
      self.hiddenFeatureTypes = newSet;
    },
    /**
     * #action
     */
    showAllFeatureTypes() {
      self.hiddenFeatureTypes = /* @__PURE__ */ new Set();
    },
    /**
     * #action
     */
    setLoadedToMolstar(val) {
      self.loadedToMolstar = val;
    }
  })).views((self) => ({
    /**
     * #getter
     */
    get connectedView() {
      const { views } = (0, import_util39.getSession)(self);
      return views.find((f) => f.id === self.connectedViewId);
    }
  })).actions((self) => ({
    /**
     * #action
     */
    setClickedPosition(arg) {
      self.clickPosition = arg;
    },
    /**
     * #action
     */
    setClickGenomeHighlights(r) {
      self.clickGenomeHighlights = r;
    },
    /**
     * #action
     */
    clearClickGenomeHighlights() {
      self.clickGenomeHighlights = [];
    },
    /**
     * #action
     */
    setHoverGenomeHighlights(r) {
      self.hoverGenomeHighlights = r;
    },
    /**
     * #action
     */
    clearHoverGenomeHighlights() {
      self.hoverGenomeHighlights = [];
    },
    /**
     * #action
     */
    setAlignmentHoverRange(range) {
      self.alignmentHoverRange = range;
    },
    /**
     * #action
     */
    clearAlignmentHoverRange() {
      self.alignmentHoverRange = void 0;
    },
    /**
     * #action
     */
    setClickAlignmentRange(range) {
      self.clickAlignmentRange = range;
    },
    /**
     * #action
     */
    clearClickAlignmentRange() {
      self.clickAlignmentRange = void 0;
    },
    /**
     * #action
     */
    setSelectedFeatureId(uniqueId) {
      self.selectedFeatureId = uniqueId;
    },
    /**
     * #action
     */
    clearSelectedFeatureId() {
      self.selectedFeatureId = void 0;
    },
    /**
     * #action
     */
    setHoveredPosition(arg) {
      self.hoverPosition = arg;
    },
    /**
     * #action
     */
    setAlignment(r) {
      self.pairwiseAlignment = r;
    },
    /**
     * #action
     */
    setAlignmentStatus(str) {
      self.pairwiseAlignmentStatus = str;
    },
    /**
     * #action
     */
    setIsMouseInAlignment(val) {
      self.isMouseInAlignment = val;
    }
  })).views((self) => ({
    /**
     * #getter
     * Extracts UniProt ID from AlphaFold URL if available
     */
    get uniprotId() {
      const { url } = self;
      if (!url) {
        return void 0;
      }
      return getUniprotIdFromAlphaFoldTarget(url);
    },
    /**
     * #getter
     */
    get structureSeqToTranscriptSeqPosition() {
      return self.pairwiseAlignment ? structureSeqVsTranscriptSeqMap(self.pairwiseAlignment).structureSeqToTranscriptSeqPosition : void 0;
    },
    /**
     * #getter
     */
    get transcriptSeqToStructureSeqPosition() {
      return self.pairwiseAlignment ? structureSeqVsTranscriptSeqMap(self.pairwiseAlignment).transcriptSeqToStructureSeqPosition : void 0;
    },
    /**
     * #getter
     */
    get structurePositionToAlignmentMap() {
      return self.pairwiseAlignment ? structurePositionToAlignmentMap(self.pairwiseAlignment) : void 0;
    },
    /**
     * #getter
     */
    get transcriptPositionToAlignmentMap() {
      return self.pairwiseAlignment ? transcriptPositionToAlignmentMap(self.pairwiseAlignment) : void 0;
    },
    /**
     * #getter
     */
    get pairwiseAlignmentToTranscriptPosition() {
      return this.transcriptPositionToAlignmentMap ? invertMap(this.transcriptPositionToAlignmentMap) : void 0;
    },
    /**
     * #getter
     */
    get pairwiseAlignmentToStructurePosition() {
      return this.structurePositionToAlignmentMap ? invertMap(this.structurePositionToAlignmentMap) : void 0;
    },
    /**
     * #getter
     */
    get clickString() {
      const r = self.clickPosition;
      return r === void 0 ? "" : toStr(r);
    },
    /**
     * #getter
     */
    get hoverString() {
      const r = self.hoverPosition;
      if (r === void 0) {
        return "";
      }
      const structureLetter = this.hoverStructureLetter;
      const genomeLetter = this.hoverGenomeLetter;
      const parts = [];
      if (r.structureSeqPos !== void 0) {
        parts.push(`Position: ${r.structureSeqPos + 1}`);
      }
      if (structureLetter) {
        parts.push(`Structure: ${structureLetter}`);
      }
      if (genomeLetter && structureLetter && genomeLetter !== structureLetter) {
        parts.push(`Genome: ${genomeLetter}`);
      }
      if (r.chain) {
        parts.push(`Chain: ${r.chain}`);
      }
      return parts.join(", ");
    },
    /**
     * #getter
     */
    get genomeToTranscriptSeqMapping() {
      return self.feature ? genomeToTranscriptSeqMapping2(new import_util39.SimpleFeature(self.feature)) : void 0;
    },
    /**
     * #getter
     */
    get structureSeqHoverPos() {
      return self.hoverPosition?.structureSeqPos;
    },
    /**
     * #getter
     */
    get alignmentHoverPos() {
      const pos = this.structureSeqHoverPos;
      return pos === void 0 ? void 0 : this.structurePositionToAlignmentMap?.[pos];
    },
    /**
     * #getter
     * Returns the single-letter amino acid code from the structure at hover position
     */
    get hoverStructureLetter() {
      const code = self.hoverPosition?.code;
      if (code) {
        return proteinAbbreviationMapping[code]?.singleLetterCode;
      }
      const structurePos = this.structureSeqHoverPos;
      if (structurePos !== void 0 && self.structureSequences?.[0]) {
        return self.structureSequences[0][structurePos];
      }
      return void 0;
    },
    /**
     * #getter
     * Returns the single-letter amino acid code from the genome/transcript at hover position
     */
    get hoverGenomeLetter() {
      const structurePos = this.structureSeqHoverPos;
      if (structurePos === void 0) {
        return void 0;
      }
      const transcriptPos = this.structureSeqToTranscriptSeqPosition?.[structurePos];
      if (transcriptPos === void 0) {
        return void 0;
      }
      return self.userProvidedTranscriptSequence[transcriptPos];
    },
    /**
     * #getter
     */
    get alignmentMatchSet() {
      const con = self.pairwiseAlignment?.consensus;
      if (!con) {
        return void 0;
      }
      const matchSet = /* @__PURE__ */ new Set();
      for (let i = 0; i < con.length; i++) {
        if (con[i] === "|" || con[i] === ":") {
          matchSet.add(i);
        }
      }
      return matchSet;
    },
    /**
     * #getter
     */
    get exactMatch() {
      const r1 = stripStopCodon(self.userProvidedTranscriptSequence);
      const r2 = self.structureSequences?.[0] ? stripStopCodon(self.structureSequences[0]) : void 0;
      return r1 === r2;
    },
    get parentView() {
      return (0, import_mobx_state_tree.getParent)(self, 2);
    },
    get zoomToBaseLevel() {
      return this.parentView.zoomToBaseLevel;
    },
    get autoScrollAlignment() {
      return this.parentView.autoScrollAlignment;
    },
    get showHighlight() {
      return this.parentView.showHighlight;
    },
    get showProteinTracks() {
      return this.parentView.showProteinTracks;
    },
    get alignmentAlgorithm() {
      return this.parentView.alignmentAlgorithm;
    },
    get molstarPluginContext() {
      return this.parentView.molstarPluginContext;
    },
    /**
     * #getter
     * Returns this structure's index in the parent's structures array
     */
    get structureIndex() {
      return this.parentView.structures.indexOf(self);
    },
    /**
     * #getter
     * Returns the Molstar structure object for the current structure.
     * Note: We access loadedToMolstar to ensure MobX recomputes this getter
     * when the structure finishes loading (Molstar's internal state isn't observable).
     */
    get molstarStructure() {
      const idx = this.structureIndex;
      return self.loadedToMolstar && idx >= 0 ? this.molstarPluginContext?.managers.structure.hierarchy.current.structures[idx]?.cell.obj?.data : void 0;
    }
  })).actions((self) => ({
    /**
     * #action
     * Highlight a residue from an external source (e.g., MSA view)
     */
    highlightFromExternal(structureSeqPos) {
      const structure = self.molstarStructure;
      const plugin = self.molstarPluginContext;
      if (structure && plugin) {
        highlightResidue({
          structure,
          selectedResidue: structureSeqPos,
          plugin
        }).catch((e) => {
          console.error(e);
        });
      }
    },
    /**
     * #action
     * Clear highlight from an external source
     */
    clearHighlightFromExternal() {
      const plugin = self.molstarPluginContext;
      plugin?.managers.interactivity.lociHighlights.clearHighlights();
    },
    /**
     * #action
     */
    hoverAlignmentPosition(alignmentPos) {
      const structureSeqPos = self.pairwiseAlignmentToStructurePosition?.[alignmentPos];
      self.setHoveredPosition({ structureSeqPos });
      if (structureSeqPos !== void 0) {
        hoverProteinToGenome({
          model: self,
          structureSeqPos
        });
      }
    },
    /**
     * #action
     */
    clickAlignmentPosition(alignmentPos) {
      const structureSeqPos = self.pairwiseAlignmentToStructurePosition?.[alignmentPos];
      self.clearSelectedFeatureId();
      self.setClickAlignmentRange({ start: alignmentPos, end: alignmentPos });
      if (structureSeqPos !== void 0) {
        clickProteinToGenome({
          model: self,
          structureSeqPos
        }).catch((e) => {
          console.error(e);
        });
      }
    }
  })).actions((self) => ({
    afterAttach() {
      (0, import_mobx_state_tree.addDisposer)(
        self,
        (0, import_mobx3.autorun)(async () => {
          try {
            const {
              userProvidedTranscriptSequence,
              structureSequences,
              exactMatch,
              alignmentAlgorithm
            } = self;
            const seq1 = userProvidedTranscriptSequence;
            const seq2 = structureSequences?.[0];
            if (!!self.pairwiseAlignment || !seq1 || !seq2) {
              return;
            }
            const r1 = stripStopCodon(seq1);
            const r2 = stripStopCodon(seq2);
            if (exactMatch) {
              let consensus = "";
              for (let i = 0; i < r1.length; i++) {
                consensus += "|";
              }
              self.setAlignment({
                consensus,
                alns: [
                  { id: "seq1", seq: r1 },
                  { id: "seq2", seq: r2 }
                ]
              });
            } else {
              self.setAlignmentStatus("Running alignment...");
              const pairwiseAlignment = runLocalAlignment(
                r1,
                r2,
                alignmentAlgorithm
              );
              self.setAlignment(pairwiseAlignment);
              self.setAlignmentStatus("");
              self.parentView.setShowAlignment(true);
            }
          } catch (e) {
            console.error(e);
            self.parentView.setError(e);
          }
        })
      );
      (0, import_mobx_state_tree.addDisposer)(
        self,
        (0, import_mobx3.autorun)(() => {
          const { hovered } = (0, import_util39.getSession)(self);
          const {
            transcriptSeqToStructureSeqPosition,
            genomeToTranscriptSeqMapping: genomeToTranscriptSeqMapping3,
            connectedView
          } = self;
          if (connectedView?.initialized && genomeToTranscriptSeqMapping3 && checkHovered(hovered)) {
            const { hoverPosition } = hovered;
            const pos = genomeToTranscriptSeqMapping3.g2p[hoverPosition.coord - 1];
            const c0 = pos === void 0 ? void 0 : transcriptSeqToStructureSeqPosition?.[pos];
            if (c0 !== void 0) {
              self.setHoveredPosition({ structureSeqPos: c0 });
            }
          }
        })
      );
      (0, import_mobx_state_tree.addDisposer)(
        self,
        (0, import_mobx3.autorun)(async () => {
          const { molstarPluginContext } = self;
          if (molstarPluginContext) {
            const molstar = await loadMolstar();
            const ret = molstarPluginContext.behaviors.interaction.click.subscribe((e) => {
              if (molstar.StructureElement.Loci.is(e.current.loci)) {
                const loc = molstar.StructureElement.Loci.getFirstLocation(
                  e.current.loci
                );
                if (loc) {
                  const locationInfo = extractLocationInfo(molstar, loc);
                  self.setHoveredPosition(locationInfo);
                  self.clearClickAlignmentRange();
                  self.clearSelectedFeatureId();
                  clickProteinToGenome({
                    model: self,
                    structureSeqPos: locationInfo.structureSeqPos
                  }).catch((e2) => {
                    console.error(e2);
                    self.parentView.setError(e2);
                  });
                }
              }
            });
            return () => {
              ret.unsubscribe();
            };
          }
          return () => {
          };
        })
      );
      (0, import_mobx_state_tree.addDisposer)(
        self,
        (0, import_mobx3.autorun)(async () => {
          const { molstarPluginContext } = self;
          if (molstarPluginContext) {
            const molstar = await loadMolstar();
            const ret = molstarPluginContext.behaviors.interaction.hover.subscribe((e) => {
              if (molstar.StructureElement.Loci.is(e.current.loci)) {
                const loc = molstar.StructureElement.Loci.getFirstLocation(
                  e.current.loci
                );
                if (loc) {
                  const locationInfo = extractLocationInfo(molstar, loc);
                  self.setHoveredPosition(locationInfo);
                  hoverProteinToGenome({
                    model: self,
                    structureSeqPos: locationInfo.structureSeqPos
                  });
                }
              }
            });
            return () => {
              ret.unsubscribe();
            };
          }
          return () => {
          };
        })
      );
      (0, import_mobx_state_tree.addDisposer)(
        self,
        (0, import_mobx3.autorun)(async () => {
          const {
            showHighlight,
            structureSeqToTranscriptSeqPosition,
            molstarPluginContext,
            molstarStructure
          } = self;
          if (molstarStructure && molstarPluginContext && structureSeqToTranscriptSeqPosition) {
            if (showHighlight) {
              for (const coord of Object.keys(
                structureSeqToTranscriptSeqPosition
              )) {
                await selectResidue({
                  structure: molstarStructure,
                  plugin: molstarPluginContext,
                  selectedResidue: +coord + 1
                });
              }
            } else {
              clearSelection({
                plugin: molstarPluginContext
              });
            }
          }
        })
      );
    }
  }));
  var structureModel_default = Structure;

  // src/ProteinView/superposeStructures.ts
  init_loadMolstar();
  var SuperpositionTag = "SuperpositionTransform";
  async function superposeStructures(plugin) {
    const {
      QueryContext,
      StructureElement,
      StructureSelection,
      StructureSelectionQueries,
      PluginCommands,
      PluginStateObject,
      tmAlign
    } = await loadMolstar();
    const structures = plugin.managers.structure.hierarchy.current.structures;
    if (structures.length < 2) {
      return;
    }
    const { query } = StructureSelectionQueries.trace;
    const locis = structures.map((s) => {
      const structure = s.cell.obj?.data;
      if (!structure) {
        return void 0;
      }
      const parent = plugin.helpers.substructureParent.get(structure);
      if (!parent) {
        return void 0;
      }
      const rootStructure = plugin.state.data.selectQ(
        (q) => q.byValue(parent).rootOfType(PluginStateObject.Molecule.Structure)
      )[0]?.obj?.data;
      if (!rootStructure) {
        return void 0;
      }
      const loci = StructureSelection.toLociWithSourceUnits(
        query(new QueryContext(structure))
      );
      return StructureElement.Loci.remap(loci, rootStructure);
    });
    const validLocis = locis.filter(
      (l) => l !== void 0
    );
    if (validLocis.length < 2) {
      return;
    }
    const pivot = plugin.managers.structure.hierarchy.findStructure(
      validLocis[0]?.structure
    );
    const coordinateSystem = pivot?.transform?.cell.obj?.data.coordinateSystem;
    for (let i = 1; i < validLocis.length; i++) {
      const result = tmAlign(validLocis[0], validLocis[i]);
      const { bTransform, tmScoreA, tmScoreB, rmsd, alignedLength } = result;
      await applyTransform(
        plugin,
        structures[i].cell,
        bTransform,
        coordinateSystem
      );
      plugin.log.info(
        `TM-align: TM-score=${tmScoreA.toFixed(4)}/${tmScoreB.toFixed(4)}, RMSD=${rmsd.toFixed(2)} \xC5, aligned ${alignedLength} residues.`
      );
    }
    await new Promise((res) => requestAnimationFrame(res));
    await PluginCommands.Camera.Reset(plugin);
  }
  async function applyTransform(plugin, s, matrix, coordinateSystem) {
    const { Mat4, StateObjectRef, StateTransforms } = await loadMolstar();
    const r = StateObjectRef.resolveAndCheck(plugin.state.data, s);
    if (!r) {
      return;
    }
    const o = plugin.state.data.selectQ(
      (q) => q.byRef(r.transform.ref).subtree().withTransformer(StateTransforms.Model.TransformStructureConformation)
    )[0];
    const finalTransform = coordinateSystem && !Mat4.isIdentity(coordinateSystem.matrix) ? Mat4.mul(Mat4(), coordinateSystem.matrix, matrix) : matrix;
    const params = {
      transform: {
        name: "matrix",
        params: { data: finalTransform, transpose: false }
      }
    };
    const b = o ? plugin.state.data.build().to(o).update(params) : plugin.state.data.build().to(s).insert(StateTransforms.Model.TransformStructureConformation, params, {
      tags: SuperpositionTag
    });
    await plugin.runTask(plugin.state.data.updateTree(b));
  }

  // src/ProteinView/model.ts
  var SETTINGS_KEY = "proteinView-settings";
  function stateModelFactory() {
    return import_mobx_state_tree2.types.compose(
      "ProteinView",
      import_pluggableElementTypes.BaseViewModel,
      import_mobx_state_tree2.types.model({
        /**
         * #property
         */
        id: import_mst.ElementId,
        /**
         * #property
         */
        type: import_mobx_state_tree2.types.literal("ProteinView"),
        /**
         * #property
         */
        structures: import_mobx_state_tree2.types.array(structureModel_default),
        /**
         * #property
         */
        showControls: false,
        /**
         * #property
         */
        height: import_mobx_state_tree2.types.optional(import_mobx_state_tree2.types.number, 650),
        /**
         * #property
         */
        showHighlight: false,
        /**
         * #property
         */
        zoomToBaseLevel: true,
        /**
         * #property
         */
        autoScrollAlignment: true,
        /**
         * #property
         */
        showAlignment: true,
        /**
         * #property
         */
        showProteinTracks: true,
        /**
         * #property
         */
        alignmentAlgorithm: import_mobx_state_tree2.types.optional(
          import_mobx_state_tree2.types.string,
          DEFAULT_ALIGNMENT_ALGORITHM
        ),
        /**
         * #property
         * ID of connected MSA view for hover synchronization
         */
        connectedMsaViewId: import_mobx_state_tree2.types.maybe(import_mobx_state_tree2.types.string),
        /**
         * #property
         * used for loading the protein view via session snapshots, e.g.
         * {
         *   "type": "ProteinView",
         *   "init": {
         *     "structures": [
         *       { "url": "https://files.rcsb.org/download/1A2B.pdb" }
         *     ],
         *     "showControls": true
         *   }
         * }
         */
        init: import_mobx_state_tree2.types.frozen()
      })
    ).volatile(() => ({
      /**
       * #volatile
       */
      error: void 0,
      /**
       * #volatile
       */
      molstarPluginContext: void 0,
      /**
       * #volatile
       */
      showManualAlignmentDialog: false,
      /**
       * #volatile
       */
      showAddStructureDialog: false
    })).actions((self) => ({
      /**
       * #action
       */
      setHeight(n) {
        self.height = n;
        return n;
      },
      /**
       * #action
       */
      setShowAlignment(f) {
        self.showAlignment = f;
      },
      /**
       * #action
       */
      setShowControls(arg) {
        self.showControls = arg;
      },
      /**
       * #action
       */
      setError(e) {
        self.error = e;
      },
      /**
       * #action
       */
      setShowHighlight(arg) {
        self.showHighlight = arg;
      },
      /**
       * #action
       */
      setShowProteinTracks(arg) {
        self.showProteinTracks = arg;
      },
      /**
       * #action
       */
      setZoomToBaseLevel(arg) {
        self.zoomToBaseLevel = arg;
      },
      /**
       * #action
       */
      setAutoScrollAlignment(arg) {
        self.autoScrollAlignment = arg;
      },
      /**
       * #action
       */
      setAlignmentAlgorithm(algorithm) {
        self.alignmentAlgorithm = algorithm;
      },
      /**
       * #action
       */
      setMolstarPluginContext(p) {
        if (p !== self.molstarPluginContext) {
          for (const structure of self.structures) {
            structure.setLoadedToMolstar(false);
          }
        }
        self.molstarPluginContext = p;
      },
      /**
       * #action
       */
      setShowManualAlignmentDialog(val) {
        self.showManualAlignmentDialog = val;
      },
      /**
       * #action
       */
      setShowAddStructureDialog(val) {
        self.showAddStructureDialog = val;
      },
      /**
       * #action
       */
      setInit(arg) {
        self.init = arg;
      },
      /**
       * #action
       */
      setConnectedMsaViewId(id) {
        self.connectedMsaViewId = id;
      },
      /**
       * #action
       */
      addStructure(structure) {
        self.structures.push(
          structureModel_default.create({
            url: structure.url,
            data: structure.data,
            userProvidedTranscriptSequence: ""
          })
        );
      }
    })).actions((self) => ({
      /**
       * #action
       */
      async addStructureAndSuperpose(structure) {
        const { molstarPluginContext } = self;
        if (!molstarPluginContext) {
          return;
        }
        const newStructure = structureModel_default.create({
          url: structure.url,
          data: structure.data,
          userProvidedTranscriptSequence: ""
        });
        newStructure.setLoadedToMolstar(true);
        self.structures.push(newStructure);
        try {
          const { model } = structure.data ? await addStructureFromData({
            data: structure.data,
            plugin: molstarPluginContext
          }) : structure.url ? await addStructureFromURL({
            url: structure.url,
            plugin: molstarPluginContext
          }) : { model: void 0 };
          const sequences = model ? extractStructureSequences(model) : void 0;
          newStructure.setSequences(sequences);
          if (self.structures.length > 1) {
            await superposeStructures(molstarPluginContext);
          }
        } catch (e) {
          self.setError(e);
          console.error(e);
        }
      }
    })).actions((self) => ({
      afterAttach() {
        try {
          const stored = localStorage.getItem(SETTINGS_KEY);
          if (stored) {
            const settings = JSON.parse(stored);
            if (settings.showAlignment !== void 0) {
              self.setShowAlignment(settings.showAlignment);
            }
            if (settings.showProteinTracks !== void 0) {
              self.setShowProteinTracks(settings.showProteinTracks);
            }
            if (settings.showHighlight !== void 0) {
              self.setShowHighlight(settings.showHighlight);
            }
            if (settings.zoomToBaseLevel !== void 0) {
              self.setZoomToBaseLevel(settings.zoomToBaseLevel);
            }
            if (settings.autoScrollAlignment !== void 0) {
              self.setAutoScrollAlignment(settings.autoScrollAlignment);
            }
          }
        } catch (e) {
          console.error("Failed to restore protein view settings", e);
        }
        (0, import_mobx_state_tree2.addDisposer)(
          self,
          (0, import_mobx4.autorun)(() => {
            const {
              showAlignment,
              showProteinTracks,
              showHighlight,
              zoomToBaseLevel,
              autoScrollAlignment
            } = self;
            try {
              localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify({
                  showAlignment,
                  showProteinTracks,
                  showHighlight,
                  zoomToBaseLevel,
                  autoScrollAlignment
                })
              );
            } catch (e) {
              console.error("Failed to save protein view settings", e);
            }
          })
        );
        (0, import_mobx_state_tree2.addDisposer)(
          self,
          (0, import_mobx4.autorun)(() => {
            const { init } = self;
            if (init) {
              const { structures, showControls, showAlignment } = init;
              if (structures) {
                for (const structure of structures) {
                  self.addStructure(structure);
                }
              }
              if (showControls !== void 0) {
                self.setShowControls(showControls);
              }
              if (showAlignment !== void 0) {
                self.setShowAlignment(showAlignment);
              }
              self.setInit(void 0);
            }
          })
        );
        (0, import_mobx_state_tree2.addDisposer)(
          self,
          (0, import_mobx4.autorun)(async () => {
            const { structures, molstarPluginContext } = self;
            if (molstarPluginContext) {
              for (const structure of structures) {
                if (structure.loadedToMolstar) {
                  continue;
                }
                try {
                  const { model } = structure.data ? await addStructureFromData({
                    data: structure.data,
                    plugin: molstarPluginContext
                  }) : structure.url ? await addStructureFromURL({
                    url: structure.url,
                    plugin: molstarPluginContext
                  }) : { model: void 0 };
                  const sequences = model ? extractStructureSequences(model) : void 0;
                  structure.setSequences(sequences);
                  structure.setLoadedToMolstar(true);
                } catch (e) {
                  self.setError(e);
                  console.error(e);
                }
              }
            }
          })
        );
        (0, import_mobx_state_tree2.addDisposer)(
          self,
          (0, import_mobx4.autorun)(async () => {
            const { structures, molstarPluginContext } = self;
            if (molstarPluginContext) {
              for (const [i, s0] of structures.entries()) {
                const structure = molstarPluginContext.managers.structure.hierarchy.current.structures[i]?.cell.obj?.data;
                const pos = s0.structureSeqHoverPos;
                if (structure && pos !== void 0) {
                  await highlightResidue({
                    structure,
                    plugin: molstarPluginContext,
                    selectedResidue: pos
                  });
                }
              }
            }
          })
        );
      }
    })).views((self) => ({
      menuItems() {
        return [
          {
            label: "Show...",
            icon: Visibility_default,
            subMenu: [
              {
                label: "Pairwise alignment",
                type: "checkbox",
                checked: self.showAlignment,
                onClick: () => {
                  self.setShowAlignment(!self.showAlignment);
                }
              },
              {
                label: "Protein feature tracks",
                type: "checkbox",
                checked: self.showProteinTracks,
                onClick: () => {
                  self.setShowProteinTracks(!self.showProteinTracks);
                }
              },
              {
                label: "Pairwise alignment as green highlight",
                type: "checkbox",
                checked: self.showHighlight,
                onClick: () => {
                  self.setShowHighlight(!self.showHighlight);
                }
              },
              {
                label: "Show all protein feature tracks",
                onClick: () => {
                  for (const structure of self.structures) {
                    structure.showAllFeatureTypes();
                  }
                }
              }
            ]
          },
          {
            label: "Settings...",
            icon: Settings_default,
            subMenu: [
              {
                label: "Zoom to base level on click",
                type: "checkbox",
                checked: self.zoomToBaseLevel,
                onClick: () => {
                  self.setZoomToBaseLevel(!self.zoomToBaseLevel);
                }
              },
              {
                label: "Auto-scroll alignment on hover",
                type: "checkbox",
                checked: self.autoScrollAlignment,
                onClick: () => {
                  self.setAutoScrollAlignment(!self.autoScrollAlignment);
                }
              }
            ]
          },
          {
            label: "Import manual alignment...",
            onClick: () => {
              self.setShowManualAlignmentDialog(true);
            }
          },
          {
            label: "Add structure...",
            onClick: () => {
              self.setShowAddStructureDialog(true);
            }
          },
          {
            label: "Re-align structures (TM-align)",
            onClick: () => {
              if (self.molstarPluginContext) {
                superposeStructures(self.molstarPluginContext).catch(
                  (e) => {
                    console.error(e);
                  }
                );
              }
            }
          }
        ];
      }
    }));
  }
  var model_default = stateModelFactory;

  // src/ProteinView/index.ts
  var ReactComponent = (0, import_react52.lazy)(() => Promise.resolve().then(() => (init_ProteinView(), ProteinView_exports)));
  function ProteinViewF(pluginManager) {
    pluginManager.addViewType(() => {
      return new import_pluggableElementTypes2.ViewType({
        name: "ProteinView",
        displayName: "Protein view",
        stateModel: model_default(),
        ReactComponent
      });
    });
  }

  // src/UniProtVariationAdapter/index.ts
  var import_AdapterType3 = __toESM(require_AdapterType());

  // src/UniProtVariationAdapter/configSchema.ts
  var import_configuration4 = __toESM(require_configuration());
  var UniProtVariationAdapter = (0, import_configuration4.ConfigurationSchema)(
    "UniProtVariationAdapter",
    {
      /**
       * #slot
       */
      location: {
        type: "fileLocation",
        defaultValue: { uri: "/path/to/my.bed.gz", locationType: "UriLocation" }
      },
      scoreField: {
        type: "string",
        defaultValue: ""
      }
    },
    { explicitlyTyped: true }
  );
  var configSchema_default3 = UniProtVariationAdapter;

  // src/UniProtVariationAdapter/index.ts
  function UniProtVariationAdapterF(pluginManager) {
    pluginManager.addAdapterType(
      () => new import_AdapterType3.default({
        name: "UniProtVariationAdapter",
        displayName: "UniProtVariation adapter",
        configSchema: configSchema_default3,
        getAdapterClass: () => Promise.resolve().then(() => (init_UniProtVariationAdapter(), UniProtVariationAdapter_exports)).then((r) => r.default)
      })
    );
  }

  // src/version.ts
  var version = "0.2.0";

  // src/index.ts
  var ProteinViewer = class extends import_Plugin.default {
    name = "ProteinViewer";
    version = version;
    install(pluginManager) {
      ProteinViewF(pluginManager);
      LaunchProteinViewF(pluginManager);
      LaunchProteinViewExtensionPointF(pluginManager);
      AddHighlightModelF(pluginManager);
      AlphaFoldConfidenceAdapterF(pluginManager);
      AlphaMissensePathogenicityAdapterF(pluginManager);
      UniProtVariationAdapterF(pluginManager);
    }
    configure(_pluginManager) {
    }
  };
  return __toCommonJS(index_exports);
})();
/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
