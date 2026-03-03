import Plugin from '@jbrowse/core/Plugin';
import { createBaseTrackConfig, createBaseTrackModel } from '@jbrowse/core/pluggableElementTypes/models';
import { ConfigurationSchema, readConfObject } from '@jbrowse/core/configuration';
import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType';
import WidgetType from '@jbrowse/core/pluggableElementTypes/WidgetType';
import TrackType from '@jbrowse/core/pluggableElementTypes/TrackType';
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
import { getSession, measureText, isAbstractMenuManager } from '@jbrowse/core/util';
import { types } from 'mobx-state-tree';
import { ConfigurationReference } from '@jbrowse/core/configuration/configurationSchema';
import { getParentRenderProps } from '@jbrowse/core/util/tracks';
import FilterListIcon from '@material-ui/icons/FilterList';
import { ElementId } from '@jbrowse/core/util/types/mst';
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { FeatureDetails, BaseCard, Attributes, FieldName } from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail';
import { Paper, Table, TableBody, TableRow, TableCell, Grid, Link, makeStyles, Button, List, ListItem, FormControl, InputLabel, Select, MenuItem, Input, Checkbox, ListItemText, Tooltip, IconButton, Typography, FormHelperText, Box, Tabs, Tab, TableHead, Chip } from '@material-ui/core';
import { v4 } from 'uuid';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import UndoIcon from '@material-ui/icons/Undo';
import { Alert } from '@material-ui/lab';
import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import AbortablePromiseCache from 'abortable-promise-cache';
import LRU from '@jbrowse/core/util/QuickLRU';
import SvgIcon from '@material-ui/core/SvgIcon';

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

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _defineProperty(obj, key, value) {
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

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

var version = "1.0.2";

function configSchemaFactory(pluginManager) {
  var LGVPlugin = pluginManager.getPlugin('LinearGenomeViewPlugin'); // @ts-ignore

  var baseLinearDisplayConfigSchema = LGVPlugin.exports.baseLinearDisplayConfigSchema;
  return ConfigurationSchema('LinearICGCDisplay', {
    renderer: types.optional(pluginManager.pluggableConfigSchemaType('renderer'), {
      color1: 'jexl:fi(feature)'
    })
  }, {
    baseConfiguration: baseLinearDisplayConfigSchema,
    explicitlyTyped: true
  });
}

function stateModelFactory$1(configSchema, pluginManager) {
  var LGVPlugin = pluginManager.getPlugin('LinearGenomeViewPlugin'); // @ts-ignore

  var BaseLinearDisplay = LGVPlugin.exports.BaseLinearDisplay;
  return types.compose('LinearICGCDisplay', BaseLinearDisplay, types.model({
    type: types.literal('LinearICGCDisplay'),
    configuration: ConfigurationReference(configSchema)
  })).actions(function (self) {
    return {
      openFilterConfig: function openFilterConfig() {
        var session = getSession(self); // @ts-ignore

        var editor = session.addWidget('ICGCFilterWidget', 'icgcFilter', {
          target: self.parentTrack.configuration
        }); // @ts-ignore

        session.showWidget(editor);
      },
      selectFeature: function selectFeature(feature) {
        if (feature) {
          var session = getSession(self); // @ts-ignore

          var featureWidget = session.addWidget('ICGCFeatureWidget', 'icgcFeature', {
            featureData: feature.toJSON()
          }); // @ts-ignore

          session.showWidget(featureWidget);
          session.setSelection(feature);
        }
      }
    };
  }).views(function (self) {
    var superRenderProps = self.renderProps,
        superTrackMenuItems = self.trackMenuItems;
    return {
      renderProps: function renderProps() {
        return _objectSpread2(_objectSpread2(_objectSpread2({}, superRenderProps()), getParentRenderProps(self)), {}, {
          displayModel: self,
          config: self.configuration.renderer
        });
      },

      get rendererTypeName() {
        return self.configuration.renderer.type;
      },

      trackMenuItems: function trackMenuItems() {
        return [].concat(_toConsumableArray(superTrackMenuItems()), [{
          label: 'Filter',
          onClick: self.openFilterConfig,
          icon: FilterListIcon
        }]);
      }
    };
  });
}

var configSchema = /*#__PURE__*/ConfigurationSchema('GDCFeatureWidget', {});
function stateModelFactory(pluginManager) {
  var stateModel = types.model('ICGCFeatureWidget', {
    id: ElementId,
    type: types.literal('ICGCFeatureWidget'),
    featureData: types.frozen({}),
    view: types.safeReference(pluginManager.pluggableMstType('view', 'stateModel'))
  }).actions(function (self) {
    return {
      setFeatureData: function setFeatureData(data) {
        self.featureData = data;
      },
      clearFeatureData: function clearFeatureData() {
        self.featureData = {};
      }
    };
  });
  return stateModel;
}

var useStyles$2 = /*#__PURE__*/makeStyles(function () {
  return {
    table: {
      padding: 0
    },
    link: {
      color: 'rgb(0, 0, 238)'
    },
    innerCard: {
      width: '100%',
      maxHeight: 600,
      overflow: 'auto'
    }
  };
}); // retrieved from https://stackoverflow.com/questions/6038061/regular-expression-to-find-urls-within-a-string?page=2&tab=votes#tab-top

var urlRegex = /(?:(?:((http|ftp|https):){0,1}\/\/)|www\.)([\w_-]+(?:(?:\.[\w_-]+)+))(?:([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]){0,1})/g;

function determineAttributesWithLinks(attributes) {
  // @ts-ignore
  var attributesWithLinks = [];
  attributes.forEach(function (attribute) {
    for (var property in attribute) {
      if (typeof attribute[property] === 'string' && (attribute[property].includes('http') || attribute[property].includes('www.'))) {
        attributesWithLinks.push(property);
      }
    }
  }); // @ts-ignore

  return attributesWithLinks;
}

var Transcript = /*#__PURE__*/observer(function (props) {
  var id = props.id,
      functionalImpact = props.functionalImpact,
      consequenceType = props.consequenceType;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TableRow, null, id ? /*#__PURE__*/React.createElement(TableCell, null, id) : null, /*#__PURE__*/React.createElement(TableCell, null, functionalImpact), /*#__PURE__*/React.createElement(TableCell, null, consequenceType)));
});

function Transcripts(props) {
  var transcripts = props.transcripts,
      id = props.id,
      geneId = props.geneId;
  var classes = useStyles$2();
  var idx = id ? id : geneId;
  return /*#__PURE__*/React.createElement("div", {
    className: classes.innerCard
  }, /*#__PURE__*/React.createElement(Table, {
    className: classes.table
  }, /*#__PURE__*/React.createElement(TableBody, null, /*#__PURE__*/React.createElement(TableRow, {
    key: "header-row-comp-".concat(idx)
  }, id ? /*#__PURE__*/React.createElement(TableCell, null, "id") : null, /*#__PURE__*/React.createElement(TableCell, null, "functionalImpact"), /*#__PURE__*/React.createElement(TableCell, null, "consequenceType")), transcripts ? transcripts.map(function (ele, key) {
    return /*#__PURE__*/React.createElement(Transcript, {
      id: ele.id ? ele.id : null,
      key: key,
      functionalImpact: ele.functionalImpact,
      consequenceType: ele.consequence ? ele.consequence.type : ele.consequenceType
    });
  }) : null)));
}

function Observations(props) {
  var observations = props.observations;
  var attributesWithLinks = determineAttributesWithLinks(observations);
  var knownBrokenLinks = ['SNV and INDEL calling - www.compbio.group.cam.ac.uk/research/icgc/snv-and-indel-calling'];
  return /*#__PURE__*/React.createElement(BaseCard, {
    title: "Observations"
  }, observations && attributesWithLinks ? observations.map(function (observation, key) {
    return /*#__PURE__*/React.createElement("div", {
      key: key
    }, /*#__PURE__*/React.createElement(Attributes, {
      attributes: observation,
      omit: attributesWithLinks
    }), attributesWithLinks.map(function (attribute, key) {
      return /*#__PURE__*/React.createElement("div", {
        key: key
      }, observation[attribute] ? /*#__PURE__*/React.createElement(Grid, {
        container: true,
        alignItems: "center"
      }, /*#__PURE__*/React.createElement(FieldName, {
        name: "".concat(attribute),
        // @ts-ignore
        width: measureText("".concat(attribute), 12) + 10
      }), observation[attribute].includes('http') || observation[attribute].includes('www') && !knownBrokenLinks.find(function (element) {
        return element === observation[attribute];
      }) ? /*#__PURE__*/React.createElement(Link, {
        href: observation[attribute].match(urlRegex)
      }, observation[attribute].split(urlRegex)[0]) : /*#__PURE__*/React.createElement("span", null, observation[attribute].split(urlRegex)[0])) : null);
    }), observations.length > 1 ? /*#__PURE__*/React.createElement("hr", null) : null);
  }) : null);
}

function Genes(props) {
  var genes = props.genes;
  return /*#__PURE__*/React.createElement(BaseCard, {
    title: "Genes"
  }, genes ? genes.map(function (gene, key) {
    return /*#__PURE__*/React.createElement("div", {
      key: key
    }, /*#__PURE__*/React.createElement(Attributes, {
      attributes: gene,
      omit: ['consequence']
    }), /*#__PURE__*/React.createElement(Transcripts, {
      transcripts: gene.consequence,
      geneId: gene.geneId
    }), genes.length > 1 ? /*#__PURE__*/React.createElement("hr", null) : null);
  }) : null);
}

function ExternalLinks(props) {
  var classes = useStyles$2();
  var id = props.id;
  var link = "https://dcc.icgc.org/mutations/".concat(id);
  return /*#__PURE__*/React.createElement(BaseCard, {
    title: "External Links"
  }, /*#__PURE__*/React.createElement("div", {
    className: classes.innerCard
  }, /*#__PURE__*/React.createElement(Table, {
    className: classes.table
  }, /*#__PURE__*/React.createElement(TableBody, null, /*#__PURE__*/React.createElement(TableRow, {
    key: "link-".concat(id)
  }, /*#__PURE__*/React.createElement(TableCell, null, "ICGC Data Portal"), /*#__PURE__*/React.createElement(TableCell, null, /*#__PURE__*/React.createElement(Link, {
    className: classes.link,
    target: "_blank",
    rel: "noopener",
    href: "".concat(link),
    underline: "always"
  }, id)))))));
}

function ICGCFeatureDetails(props) {
  var model = props.model;
  var feature = model.featureData;
  var impact = feature.functionalImpact ? feature.functionalImpact.includes('High') ? 'High' : feature.functionalImpact.includes('Low') ? 'Low' : 'Unknown' : undefined;

  var fullFeature = _objectSpread2(_objectSpread2({}, feature), {}, {
    functionalImpact: impact
  });

  return /*#__PURE__*/React.createElement(Paper, {
    "data-testid": "icgc-widget"
  }, /*#__PURE__*/React.createElement(FeatureDetails, _objectSpread2(_objectSpread2({
    feature: impact ? fullFeature : feature
  }, props), {}, {
    omit: ['transcripts', 'genes', 'observations']
  })), feature.transcripts && /*#__PURE__*/React.createElement(BaseCard, {
    title: "Transcripts"
  }, /*#__PURE__*/React.createElement(Transcripts, {
    transcripts: feature.transcripts,
    id: feature.id
  })), feature.observations && /*#__PURE__*/React.createElement(Observations, {
    observations: feature.observations
  }), feature.genes && /*#__PURE__*/React.createElement(Genes, {
    genes: feature.genes
  }), /*#__PURE__*/React.createElement(ExternalLinks, {
    id: feature.mutationId ? feature.mutationId : feature.id
  }));
}

var icgcFeatureWidgetReactComponent = /*#__PURE__*/observer(ICGCFeatureDetails);

var stateModel = (function (pluginManager) {
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
      },
      getFilter: function getFilter() {
        return self.filter;
      }
    };
  });
  var ColourBy = types.model({
    id: types.identifier,
    value: types.string
  });
  return types.model('ICGCFilterWidget', {
    id: ElementId,
    type: types.literal('ICGCFilterWidget'),
    target: types.safeReference(pluginManager.pluggableConfigSchemaType('track')),
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
        // @ts-ignore
        self.filters = self.filters.filter(function (filter) {
          return filter.filter.length === 0;
        });
      }
    };
  });
});

var runtime = {exports: {}};

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(function (module) {
var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
}(runtime));

var _regeneratorRuntime = runtime.exports;

function fetchFeatures(_x) {
  return _fetchFeatures.apply(this, arguments);
}

function _fetchFeatures() {
  _fetchFeatures = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(featureType) {
    var response;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return fetch("http://localhost:7080/proxy/api/v1/".concat(featureType, "?facetsOnly=true&include=facets"), {
              method: 'GET',
              headers: {
                'content-type': 'application/json'
              }
            });

          case 2:
            response = _context2.sent;

            if (response.ok) {
              _context2.next = 5;
              break;
            }

            throw new Error("Failed to fetch ".concat(response.status, " ").concat(response.statusText));

          case 5:
            return _context2.abrupt("return", response.json());

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _fetchFeatures.apply(this, arguments);
}

var Filter = /*#__PURE__*/observer(function (props) {
  var facets = props.facets,
      schema = props.schema,
      filterModel = props.filterModel;

  var _useState = useState(filterModel.category ? filterModel.category : facets ? Object.keys(facets)[0] : ''),
      _useState2 = _slicedToArray(_useState, 2),
      category = _useState2[0],
      setCategory = _useState2[1];

  var _useState3 = useState(filterModel.filter ? filterModel.filter.replace(/(["]+)/g, '').replace(/([\[])+/g, '').replace(/[\]]+/g, '').split(',') : []),
      _useState4 = _slicedToArray(_useState3, 2),
      filter = _useState4[0],
      setFilter = _useState4[1];

  var handleCatChange = function handleCatChange(event) {
    setCategory(event.target.value);
    setFilter([]);
    filterModel.setCategory(event.target.value);
  };

  var handleFiltChange = function handleFiltChange(event) {
    setFilter(event.target.value);
    filterModel.setFilter(JSON.stringify(event.target.value));
    updateTrack(schema.filters, schema.target);
  };

  var handleFilterDelete = function handleFilterDelete() {
    schema.deleteFilter(filterModel.id);
    updateTrack(schema.filters, schema.target);
  };

  function updateTrack(filters, target) {
    var completeFilters = {};
    filters.forEach(function (filter) {
      var currentFilter = _defineProperty({}, filter.category, {
        is: JSON.parse(filter.filter)
      }); // @ts-ignore


      completeFilters[filter.type.slice(0, -1)] = _objectSpread2(_objectSpread2({}, completeFilters[filter.type.slice(0, -1)]), currentFilter);
    });
    return target.adapter.filters.set(JSON.stringify(completeFilters));
  } // https://stackoverflow.com/questions/4149276/how-to-convert-camelcase-to-camel-case


  function prettify(string) {
    return string.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
      return str.toUpperCase();
    });
  }

  function alpha(a, b) {
    if (a.term < b.term) {
      return -1;
    }

    if (a.term > b.term) {
      return 1;
    }

    return 0;
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(List, null, /*#__PURE__*/React.createElement(ListItem, {
    style: {
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement(FormControl, {
    fullWidth: true
  }, /*#__PURE__*/React.createElement(InputLabel, null, "Category"), /*#__PURE__*/React.createElement(Select, {
    label: "Category",
    value: category,
    onChange: handleCatChange,
    inputProps: {
      'data-testid': 'category_select'
    }
  }, facets ? Object.keys(facets).map(function (key, idx) {
    return /*#__PURE__*/React.createElement(MenuItem, {
      value: key,
      key: "".concat(key, "-").concat(idx, "-menuitem"),
      "data-testid": "cat_menuitem_".concat(idx)
    }, prettify(key));
  }) : null)), /*#__PURE__*/React.createElement(FormControl, {
    fullWidth: true
  }, /*#__PURE__*/React.createElement(InputLabel, null, "Filters"), /*#__PURE__*/React.createElement(Select, {
    label: "Filters",
    value: filter,
    onChange: handleFiltChange,
    input: /*#__PURE__*/React.createElement(Input, null),
    renderValue: function renderValue(selected) {
      return selected.join(', ');
    },
    multiple: true,
    inputProps: {
      'data-testid': 'filters_select'
    }
  }, facets && category && facets[category].terms ? facets[category].terms.sort(alpha).map(function (term, idx) {
    return /*#__PURE__*/React.createElement(MenuItem, {
      value: term.term,
      key: "".concat(term.term, "-").concat(idx, "-menuitem"),
      "data-testid": "fil_menuitem_".concat(idx)
    }, /*#__PURE__*/React.createElement(Checkbox, {
      checked: filter ? filter.indexOf(term.term) > -1 : false
    }), /*#__PURE__*/React.createElement(ListItemText, {
      primary: term.term
    }));
  }) : null)), /*#__PURE__*/React.createElement(Tooltip, {
    title: "Remove filter",
    "aria-label": "remove filter"
  }, /*#__PURE__*/React.createElement(IconButton, {
    "aria-label": "remove filter",
    onClick: handleFilterDelete,
    "data-testid": "remove_filter_icon_button"
  }, /*#__PURE__*/React.createElement(ClearIcon, null))))));
});
var FilterList = /*#__PURE__*/observer(function (_ref) {
  var schema = _ref.schema,
      facetType = _ref.facetType;

  var _useState5 = useState(),
      _useState6 = _slicedToArray(_useState5, 2),
      facets = _useState6[0],
      setFacets = _useState6[1];

  useEffect(function () {
    var fetch = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var mutationsResponse;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return fetchFeatures(facetType);

              case 2:
                mutationsResponse = _context.sent;
                setFacets(mutationsResponse.facets);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function fetch() {
        return _ref2.apply(this, arguments);
      };
    }();

    fetch();
  }, [facetType]);

  var handleClick = function handleClick() {
    // @ts-ignore
    schema.addFilter(v4(), facets ? Object.keys(facets)[0] : '', // one of the facet categories
    facetType, // type: donors, mutations, genes
    '');
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null, schema.filters.map(function (filterModel) {
    if (filterModel.type === facetType) {
      return /*#__PURE__*/React.createElement(Filter, {
        facets: facets,
        schema: schema,
        filterModel: filterModel,
        key: filterModel.id
      });
    }

    return null;
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "outlined",
    onClick: handleClick,
    startIcon: /*#__PURE__*/React.createElement(AddIcon, null)
  }, "Add Filter"));
});

var _excluded = ["children", "value", "index"];
var useStyles$1 = /*#__PURE__*/makeStyles(function (theme) {
  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
      margin: theme.spacing(1),
      gap: theme.spacing(2)
    },
    tabRoot: {
      width: '33%',
      minWidth: '100px'
    },
    paper: {
      padding: theme.spacing(2)
    }
  };
});

function TabPanel(props) {
  var children = props.children,
      value = props.value,
      index = props.index,
      other = _objectWithoutProperties(props, _excluded);

  return /*#__PURE__*/React.createElement("div", _objectSpread2({
    role: "tabpanel",
    hidden: value !== index,
    id: "simple-tabpanel-".concat(index),
    "aria-labelledby": "simple-tab-".concat(index)
  }, other), value === index && /*#__PURE__*/React.createElement(Box, {
    style: {
      padding: 3
    }
  }, children));
}

function a11yProps(index) {
  return {
    id: "simple-tab-".concat(index),
    'aria-controls': "simple-tabpanel-".concat(index)
  };
}

function ConfigurationEditor(_ref) {
  var model = _ref.model;
  var classes = useStyles$1();

  var _useState = useState(0),
      _useState2 = _slicedToArray(_useState, 2),
      value = _useState2[0],
      setValue = _useState2[1];

  var _useState3 = useState(model.target.adapter.featureType.value ? model.target.adapter.featureType.value : 'mutations'),
      _useState4 = _slicedToArray(_useState3, 2),
      type = _useState4[0],
      setType = _useState4[1];

  var handleChangeTab = function handleChangeTab(event, newValue) {
    setValue(newValue);
  };

  var handleChangeType = function handleChangeType(event) {
    setType(event.target.value);
    model.target.adapter.featureType.set(event.target.value);
  };

  var handleFilterClear = function handleFilterClear() {
    model.clearFilters();
    model.target.adapter.filters.set('{}');
  };

  useEffect(function () {
    model.clearFilters();
    var filters = JSON.parse(model.target.adapter.filters.value);

    for (var filter in filters) {
      for (var prop in filters[filter]) {
        model.addFilter(v4(), prop, "".concat(filter, "s"), JSON.stringify(filters[filter][prop]['is']));
      }
    }
  }, [model]);
  return /*#__PURE__*/React.createElement("div", {
    className: classes.root
  }, /*#__PURE__*/React.createElement(Paper, {
    className: classes.paper
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "h6"
  }, "Track Type"), /*#__PURE__*/React.createElement(FormControl, null, /*#__PURE__*/React.createElement(Select, {
    value: type,
    onChange: handleChangeType,
    inputProps: {
      'data-testid': 'icgc_track_type_select'
    }
  }, /*#__PURE__*/React.createElement(MenuItem, {
    value: 'mutations',
    "data-testid": "option_mutations"
  }, "Mutations"), /*#__PURE__*/React.createElement(MenuItem, {
    value: 'occurrences',
    "data-testid": "option_occurrences"
  }, "Mutation Occurrences")), /*#__PURE__*/React.createElement(FormHelperText, null, "Select what to retrieve from the ICGC with your selected filters."))), /*#__PURE__*/React.createElement(Paper, {
    className: classes.paper
  }, /*#__PURE__*/React.createElement(Grid, {
    container: true,
    style: {
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "h6"
  }, "Filters"), /*#__PURE__*/React.createElement(Tooltip, {
    title: "Clear all filters",
    "aria-label": "clear all filters",
    onClick: handleFilterClear
  }, /*#__PURE__*/React.createElement(IconButton, {
    color: "primary",
    "data-testid": "clear_all_filters_icon_button"
  }, /*#__PURE__*/React.createElement(UndoIcon, null)))), /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement(Tabs, {
    value: value,
    onChange: handleChangeTab,
    "aria-label": "filtering tabs"
  }, /*#__PURE__*/React.createElement(Tab, _objectSpread2({
    classes: {
      root: classes.tabRoot
    },
    label: "Donors"
  }, a11yProps(0))), /*#__PURE__*/React.createElement(Tab, _objectSpread2({
    classes: {
      root: classes.tabRoot
    },
    label: "Genes"
  }, a11yProps(1))), /*#__PURE__*/React.createElement(Tab, _objectSpread2({
    classes: {
      root: classes.tabRoot
    },
    label: "Mutations"
  }, a11yProps(2))))), /*#__PURE__*/React.createElement(TabPanel, {
    value: value,
    index: 0
  }, /*#__PURE__*/React.createElement(FilterList, {
    schema: model,
    type: type,
    facetType: "donors"
  })), /*#__PURE__*/React.createElement(TabPanel, {
    value: value,
    index: 1
  }, /*#__PURE__*/React.createElement(FilterList, {
    schema: model,
    type: type,
    facetType: "genes"
  })), /*#__PURE__*/React.createElement(TabPanel, {
    value: value,
    index: 2
  }, /*#__PURE__*/React.createElement(FilterList, {
    schema: model,
    type: type,
    facetType: "mutations"
  }))), type === 'mutations' ? /*#__PURE__*/React.createElement(Paper, {
    className: classes.paper
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "h6"
  }, "Colour Legend"), /*#__PURE__*/React.createElement(Table, null, /*#__PURE__*/React.createElement(TableHead, null, /*#__PURE__*/React.createElement(TableRow, null, /*#__PURE__*/React.createElement(TableCell, null, "functionalImpact"), /*#__PURE__*/React.createElement(TableCell, null, "Corresponding colour"))), /*#__PURE__*/React.createElement(TableBody, null, /*#__PURE__*/React.createElement(TableRow, null, /*#__PURE__*/React.createElement(TableCell, null, "High"), /*#__PURE__*/React.createElement(TableCell, null, /*#__PURE__*/React.createElement(Chip, {
    label: "Red",
    style: {
      backgroundColor: 'red',
      color: 'white'
    }
  }))), /*#__PURE__*/React.createElement(TableRow, null, /*#__PURE__*/React.createElement(TableCell, null, "Low"), /*#__PURE__*/React.createElement(TableCell, null, /*#__PURE__*/React.createElement(Chip, {
    label: "Blue",
    style: {
      backgroundColor: 'blue',
      color: 'white'
    }
  }))), /*#__PURE__*/React.createElement(TableRow, null, /*#__PURE__*/React.createElement(TableCell, null, "Unknown/Undefined"), /*#__PURE__*/React.createElement(TableCell, null, /*#__PURE__*/React.createElement(Chip, {
    label: "Goldenrod",
    style: {
      backgroundColor: 'goldenrod',
      color: 'white'
    }
  })))))) : null);
}

var ReactComponent$1 = /*#__PURE__*/observer(ConfigurationEditor);

var ICGCFilterWidgetF = (function (pluginManager) {
  return {
    configSchema: ConfigurationSchema('ICGCFilterWidget', {}),
    ReactComponent: ReactComponent$1,
    stateModel: pluginManager.load(stateModel),
    HeadingComponent: function HeadingComponent() {
      return /*#__PURE__*/React.createElement(React.Fragment, null, "ICGC Filters");
    }
  };
});

function f(pluginManager) {
  return types.model('ICGCSearchWidget', {
    id: ElementId,
    type: types.literal('ICGCSearchWidget')
  })["volatile"](function () {
    return {
      trackData: undefined,
      indexTrackData: undefined
    };
  }).actions(function (self) {
    return {
      setTrackData: function setTrackData(obj) {
        self.trackData = obj;
      },
      setIndexTrackData: function setIndexTrackData(obj) {
        self.indexTrackData = obj;
      },
      clearData: function clearData() {
        self.indexTrackData = undefined;
        self.trackData = undefined;
      }
    };
  });
}

var useStyles = /*#__PURE__*/makeStyles(function (theme) {
  return {
    root: {
      margin: theme.spacing(1)
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
      padding: theme.spacing(2),
      margin: "0px 0px ".concat(theme.spacing(1), "px 0px"),
      justifyContent: 'center'
    },
    submitContainer: {
      display: 'flex',
      flexDirection: 'column'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end'
    }
  };
});

function Panel(_ref) {
  var model = _ref.model;
  var classes = useStyles();

  var _useState = useState(false),
      _useState2 = _slicedToArray(_useState, 2),
      browseSuccess = _useState2[0],
      setBrowseSuccess = _useState2[1];

  var session = getSession(model);

  var handleAddBrowse = function handleAddBrowse() {
    if (session) {
      var datenow = Date.now();
      var trackId = "icgc_browse_track-".concat(datenow); // @ts-ignore

      session.addTrackConf({
        type: 'ICGCTrack',
        trackId: trackId,
        name: "ICGC Browse ".concat(datenow),
        assemblyNames: ['hg38'],
        category: ['Annotation'],
        adapter: {
          ICGCAdapterId: 'DefaultICGCAdapter',
          type: 'ICGCAdapter'
        },
        displays: [{
          type: 'LinearICGCDisplay',
          displayId: "icgc_browse_track_linear_".concat(datenow)
        }]
      });

      if (session.views.length === 0) {
        session.addView('LinearGenomeView', {});
      } // @ts-ignore


      session.views[0].showTrack(trackId);
      setBrowseSuccess(true);
    }
  };

  return /*#__PURE__*/React.createElement("div", {
    className: classes.root
  }, /*#__PURE__*/React.createElement(Paper, {
    className: classes.paper
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "h6",
    component: "h1",
    align: "center"
  }, "Quick-add an ICGC Browse Track"), /*#__PURE__*/React.createElement(Typography, {
    variant: "body1",
    align: "center"
  }, "Add additional Browse tracks to your current view by clicking this button."), browseSuccess ? /*#__PURE__*/React.createElement(Alert, {
    severity: "success"
  }, "The requested Browse track has been added.") : null, /*#__PURE__*/React.createElement(Button, {
    color: "primary",
    variant: "contained",
    size: "large",
    startIcon: /*#__PURE__*/React.createElement(AddIcon, null),
    onClick: handleAddBrowse
  }, "Add New ICGC Browse Track")));
}

var ReactComponent = /*#__PURE__*/observer(Panel);

var ICGCSearchWidgetF = (function (jbrowse) {
  return {
    configSchema: ConfigurationSchema('ICGCSearchWidget', {}),
    ReactComponent: ReactComponent,
    stateModel: jbrowse.load(f),
    HeadingComponent: function HeadingComponent() {
      return /*#__PURE__*/React.createElement(React.Fragment, null, "ICGC Data Import");
    }
  };
});

var ICGCFeature = /*#__PURE__*/function () {
  function ICGCFeature(args) {
    _classCallCheck(this, ICGCFeature);

    _defineProperty(this, "icgcObject", void 0);

    _defineProperty(this, "data", void 0);

    _defineProperty(this, "uniqueId", void 0);

    _defineProperty(this, "featureType", void 0);

    this.icgcObject = args.icgcObject;
    this.featureType = args.featureType ? args.featureType : 'mutation';
    this.data = this.dataFromICGCObject(this.icgcObject, this.featureType);
    this.uniqueId = args.id;
  }

  _createClass(ICGCFeature, [{
    key: "get",
    value: function get(field) {
      return this.icgcObject[field] || this.data[field];
    }
  }, {
    key: "set",
    value: function set() {}
  }, {
    key: "parent",
    value: function parent() {
      return undefined;
    }
  }, {
    key: "children",
    value: function children() {
      return undefined;
    }
  }, {
    key: "tags",
    value: function tags() {
      var t = [].concat(_toConsumableArray(Object.keys(this.data)), _toConsumableArray(Object.keys(this.icgcObject)));
      return t;
    }
  }, {
    key: "id",
    value: function id() {
      return this.uniqueId;
    }
  }, {
    key: "dataFromICGCObject",
    value: function dataFromICGCObject(icgcObject, featureType) {
      // Defaults to mutation values
      var featureData = {
        refName: icgcObject.chromosome,
        type: icgcObject.mutationType,
        start: icgcObject.start - 1,
        end: icgcObject.end
      };

      if (featureType === 'occurrences') {
        featureData.type = icgcObject.mutationId;
        featureData.id = icgcObject.donorId;
        featureData.note = icgcObject.mutationId;
      }

      return featureData;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return _objectSpread2(_objectSpread2({
        uniqueId: this.uniqueId
      }, this.data), this.icgcObject);
    }
  }]);

  return ICGCFeature;
}();

var ICGCAdapter = /*#__PURE__*/function (_BaseFeatureDataAdapt) {
  _inherits(ICGCAdapter, _BaseFeatureDataAdapt);

  var _super = /*#__PURE__*/_createSuper(ICGCAdapter);

  function ICGCAdapter(config) {
    var _this;

    _classCallCheck(this, ICGCAdapter);

    _this = _super.call(this, config);

    _defineProperty(_assertThisInitialized(_this), "filters", void 0);

    _defineProperty(_assertThisInitialized(_this), "size", void 0);

    _defineProperty(_assertThisInitialized(_this), "featureType", void 0);

    _defineProperty(_assertThisInitialized(_this), "featureCache", new AbortablePromiseCache({
      cache: new LRU({
        maxSize: 200
      }),
      fill: function () {
        var _fill = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(query, abortSignal) {
          return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", _this.fetchFeatures(query, abortSignal));

                case 1:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        function fill(_x, _x2) {
          return _fill.apply(this, arguments);
        }

        return fill;
      }()
    }));

    var filters = readConfObject(config, 'filters');
    var size = readConfObject(config, 'size');
    var featureType = readConfObject(config, 'featureType');
    _this.filters = filters;
    _this.size = size;
    _this.featureType = featureType;
    return _this;
  }

  _createClass(ICGCAdapter, [{
    key: "fetchFeatures",
    value: function () {
      var _fetchFeatures = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(query, signal) {
        var response;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return fetch("http://localhost:7080/proxy/api/v1/".concat(this.featureType, "?filters=").concat(query, "&size=").concat(this.size), {
                  method: 'GET',
                  headers: {
                    'content-type': 'application/json'
                  },
                  signal: signal
                });

              case 2:
                response = _context2.sent;

                if (response.ok) {
                  _context2.next = 5;
                  break;
                }

                throw new Error("Failed to fetch ".concat(response.status, " ").concat(response.statusText));

              case 5:
                return _context2.abrupt("return", response.json());

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function fetchFeatures(_x3, _x4) {
        return _fetchFeatures.apply(this, arguments);
      }

      return fetchFeatures;
    }()
  }, {
    key: "getRefNames",
    value: function () {
      var _getRefNames = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3() {
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", ['chr1', 'chr10', 'chr11', 'chr12', 'chr13', 'chr14', 'chr15', 'chr16', 'chr17', 'chr18', 'chr19', 'chr2', 'chr20', 'chr21', 'chr22', 'chr3', 'chr4', 'chr5', 'chr6', 'chr7', 'chr8', 'chr9', 'chrX', 'chrY']);

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function getRefNames() {
        return _getRefNames.apply(this, arguments);
      }

      return getRefNames;
    }()
  }, {
    key: "createQuery",
    value: function createQuery(location, start, end) {
      var query = {};

      if (this.filters != '{}') {
        var mutation = JSON.parse(this.filters)['mutation'];
        var gene = JSON.parse(this.filters)['gene'];
        var donor = JSON.parse(this.filters)['donor'];

        if (mutation) {
          query = {
            mutation: _objectSpread2(_objectSpread2({}, mutation), {}, {
              location: {
                is: "".concat(location, ":").concat(start, "-").concat(end)
              }
            })
          };
        } else {
          query = {
            mutation: {
              location: {
                is: "".concat(location, ":").concat(start, "-").concat(end)
              }
            }
          };
        }

        if (gene) {
          query = _objectSpread2(_objectSpread2({}, query), {}, {
            gene: gene
          });
        }

        if (donor) {
          query = _objectSpread2(_objectSpread2({}, query), {}, {
            donor: donor
          });
        }
      } else {
        query = {
          mutation: {
            location: {
              is: "".concat(location, ":").concat(start, "-").concat(end)
            }
          }
        };
      }

      return query;
    }
  }, {
    key: "getFeatures",
    value: function getFeatures(region) {
      var _this2 = this;

      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var refName = region.refName,
          start = region.start,
          end = region.end;
      return ObservableCreate( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(observer) {
          var query, idField, result, _iterator, _step, hit, feature;

          return _regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.prev = 0;
                  query = _this2.createQuery(refName, start, end); // idField for occurrences is donorId

                  idField = _this2.featureType === 'mutations' ? 'id' : 'donorId';
                  _context4.next = 5;
                  return _this2.featureCache.get(JSON.stringify(query), JSON.stringify(query), opts.signal);

                case 5:
                  result = _context4.sent;
                  _iterator = _createForOfIteratorHelper(result.hits);

                  try {
                    for (_iterator.s(); !(_step = _iterator.n()).done;) {
                      hit = _step.value;
                      feature = new ICGCFeature({
                        icgcObject: hit,
                        id: hit[idField],
                        featureType: _this2.featureType
                      });
                      observer.next(feature);
                    }
                  } catch (err) {
                    _iterator.e(err);
                  } finally {
                    _iterator.f();
                  }

                  _context4.next = 13;
                  break;

                case 10:
                  _context4.prev = 10;
                  _context4.t0 = _context4["catch"](0);
                  observer.error(_context4.t0);

                case 13:
                  observer.complete();

                case 14:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, null, [[0, 10]]);
        }));

        return function (_x5) {
          return _ref.apply(this, arguments);
        };
      }(), opts.signal);
    }
  }, {
    key: "freeResources",
    value: function freeResources() {}
  }]);

  return ICGCAdapter;
}(BaseFeatureDataAdapter);

_defineProperty(ICGCAdapter, "capabilities", ['getFeatures', 'getRefNames']);

var icgcConfigSchema = /*#__PURE__*/ConfigurationSchema('ICGCAdapter', {
  filters: {
    type: 'string',
    defaultValue: '{}',
    description: 'The filters to be applied to the track. Only edit if you know what you are doing.'
  },
  colourBy: {
    type: 'string',
    defaultValue: '{}',
    description: 'Colour features based on track attributes. Only edit if you know what you are doing.'
  },
  featureType: {
    type: 'stringEnum',
    model: /*#__PURE__*/types.enumeration('Feature Type', ['mutations', 'occurrences']),
    defaultValue: 'mutations',
    description: 'The type of track to add'
  },
  size: {
    type: 'integer',
    defaultValue: 5000,
    description: 'The max number of features to show.'
  }
}, {
  explicitlyTyped: true,
  explicitIdentifier: 'ICGCAdapterId'
});

function DataExploration(props) {
  return /*#__PURE__*/React.createElement(SvgIcon, _objectSpread2({}, props), /*#__PURE__*/React.createElement("path", {
    d: "M12,2C6.48,2,2,6.48,2,12c0,1.33,0.26,2.61,0.74,3.77L8,10.5l3.3,2.78L14.58,10H13V8h5v5h-2v-1.58L11.41,16l-3.29-2.79 l-4.4,4.4C5.52,20.26,8.56,22,12,22h8c1.1,0,2-0.9,2-2v-8C22,6.48,17.52,2,12,2z M19.5,20.5c-0.55,0-1-0.45-1-1s0.45-1,1-1 s1,0.45,1,1S20.05,20.5,19.5,20.5z"
  }));
}

var ICGCPlugin = /*#__PURE__*/function (_Plugin) {
  _inherits(ICGCPlugin, _Plugin);

  var _super = /*#__PURE__*/_createSuper(ICGCPlugin);

  function ICGCPlugin() {
    var _this;

    _classCallCheck(this, ICGCPlugin);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "name", 'ICGC');

    _defineProperty(_assertThisInitialized(_this), "version", version);

    return _this;
  }

  _createClass(ICGCPlugin, [{
    key: "install",
    value: function install(pluginManager) {
      var LGVPlugin = pluginManager.getPlugin('LinearGenomeViewPlugin');
      var BaseLinearDisplayComponent = LGVPlugin.exports.BaseLinearDisplayComponent;
      pluginManager.addTrackType(function () {
        var configSchema = ConfigurationSchema('ICGCTrack', {}, {
          baseConfiguration: createBaseTrackConfig(pluginManager),
          explicitIdentifier: 'trackId'
        });
        return new TrackType({
          name: 'ICGCTrack',
          configSchema: configSchema,
          stateModel: createBaseTrackModel(pluginManager, 'ICGCTrack', configSchema)
        });
      });
      pluginManager.addDisplayType(function () {
        var configSchema = configSchemaFactory(pluginManager);
        return new DisplayType({
          name: 'LinearICGCDisplay',
          configSchema: configSchema,
          stateModel: stateModelFactory$1(configSchema, pluginManager),
          trackType: 'ICGCTrack',
          viewType: 'LinearGenomeView',
          ReactComponent: BaseLinearDisplayComponent
        });
      });
      pluginManager.addAdapterType(function () {
        return new AdapterType({
          name: 'ICGCAdapter',
          configSchema: icgcConfigSchema,
          // @ts-ignore
          adapterMetadata: {
            hiddenFromGUI: true
          },
          AdapterClass: ICGCAdapter
        });
      });
      pluginManager.addWidgetType(function () {
        return new WidgetType({
          name: 'ICGCFeatureWidget',
          heading: 'Feature Details',
          configSchema: configSchema,
          stateModel: stateModelFactory(pluginManager),
          ReactComponent: icgcFeatureWidgetReactComponent
        });
      });
      pluginManager.addWidgetType(function () {
        return new WidgetType(_objectSpread2({
          name: 'ICGCFilterWidget'
        }, ICGCFilterWidgetF(pluginManager)));
      });
      pluginManager.addWidgetType(function () {
        return new WidgetType(_objectSpread2({
          name: 'ICGCSearchWidget',
          heading: 'Search ICGC'
        }, ICGCSearchWidgetF(pluginManager)));
      });
      pluginManager.jexl.addFunction('fi', function (feature) {
        return feature.get('functionalImpact') ? feature.get('functionalImpact').includes('High') ? 'red' : feature.get('functionalImpact').includes('Low') ? 'blue' : 'goldenrod' : 'goldenrod';
      });
    }
  }, {
    key: "configure",
    value: function configure(pluginManager) {
      if (isAbstractMenuManager(pluginManager.rootModel)) {
        pluginManager.rootModel.appendToMenu('Tools', {
          label: 'ICGC Data Import',
          icon: DataExploration,
          onClick: function onClick(session) {
            session.showWidget(session.addWidget('ICGCSearchWidget', 'icgcSearchWidget'));
          }
        });
      }
    }
  }]);

  return ICGCPlugin;
}(Plugin);

export { ICGCPlugin as default };
//# sourceMappingURL=index.esm.js.map
