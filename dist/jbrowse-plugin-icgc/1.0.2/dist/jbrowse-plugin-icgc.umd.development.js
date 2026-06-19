(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@jbrowse/core/Plugin'), require('@jbrowse/core/pluggableElementTypes/models'), require('@jbrowse/core/configuration'), require('@jbrowse/core/pluggableElementTypes/DisplayType'), require('@jbrowse/core/pluggableElementTypes/WidgetType'), require('@jbrowse/core/pluggableElementTypes/TrackType'), require('@jbrowse/core/pluggableElementTypes/AdapterType'), require('@jbrowse/core/util'), require('mobx-state-tree'), require('prop-types'), require('mobx-react'), require('@jbrowse/core/util/tracks'), require('react'), require('@material-ui/core/utils'), require('@jbrowse/core/util/types/mst'), require('@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail'), require('@material-ui/core'), require('@material-ui/lab'), require('@jbrowse/core/data_adapters/BaseAdapter'), require('@jbrowse/core/util/rxjs'), require('@material-ui/core/SvgIcon')) :
  typeof define === 'function' && define.amd ? define(['exports', '@jbrowse/core/Plugin', '@jbrowse/core/pluggableElementTypes/models', '@jbrowse/core/configuration', '@jbrowse/core/pluggableElementTypes/DisplayType', '@jbrowse/core/pluggableElementTypes/WidgetType', '@jbrowse/core/pluggableElementTypes/TrackType', '@jbrowse/core/pluggableElementTypes/AdapterType', '@jbrowse/core/util', 'mobx-state-tree', 'prop-types', 'mobx-react', '@jbrowse/core/util/tracks', 'react', '@material-ui/core/utils', '@jbrowse/core/util/types/mst', '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail', '@material-ui/core', '@material-ui/lab', '@jbrowse/core/data_adapters/BaseAdapter', '@jbrowse/core/util/rxjs', '@material-ui/core/SvgIcon'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.JBrowsePluginICGC = {}, global.JBrowseExports["@jbrowse/core/Plugin"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/models"], global.JBrowseExports["@jbrowse/core/configuration"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/DisplayType"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/WidgetType"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/TrackType"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/AdapterType"], global.JBrowseExports["@jbrowse/core/util"], global.JBrowseExports["mobx-state-tree"], global.JBrowseExports["prop-types"], global.JBrowseExports["mobx-react"], global.JBrowseExports["@jbrowse/core/util/tracks"], global.JBrowseExports.react, global.JBrowseExports["@material-ui/core/utils"], global.JBrowseExports["@jbrowse/core/util/types/mst"], global.JBrowseExports["@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail"], global.JBrowseExports["@material-ui/core"], global.JBrowseExports["@material-ui/lab"], global.JBrowseExports["@jbrowse/core/data_adapters/BaseAdapter"], global.JBrowseExports["@jbrowse/core/util/rxjs"], global.JBrowseExports["@material-ui/core/SvgIcon"]));
})(this, (function (exports, Plugin, models, configuration, DisplayType, WidgetType, TrackType, AdapterType, util$1, require$$4, require$$5, require$$6, tracks, React$4, require$$0, mst$1, BaseFeatureDetail, core, lab, BaseAdapter, rxjs, SvgIcon) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Plugin__default = /*#__PURE__*/_interopDefaultLegacy(Plugin);
  var DisplayType__default = /*#__PURE__*/_interopDefaultLegacy(DisplayType);
  var WidgetType__default = /*#__PURE__*/_interopDefaultLegacy(WidgetType);
  var TrackType__default = /*#__PURE__*/_interopDefaultLegacy(TrackType);
  var AdapterType__default = /*#__PURE__*/_interopDefaultLegacy(AdapterType);
  var require$$4__default = /*#__PURE__*/_interopDefaultLegacy(require$$4);
  var require$$5__default = /*#__PURE__*/_interopDefaultLegacy(require$$5);
  var require$$6__default = /*#__PURE__*/_interopDefaultLegacy(require$$6);
  var React__default = /*#__PURE__*/_interopDefaultLegacy(React$4);
  var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
  var SvgIcon__default = /*#__PURE__*/_interopDefaultLegacy(SvgIcon);

  function ownKeys$2(object, enumerableOnly) {
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
      i % 2 ? ownKeys$2(Object(source), !0).forEach(function (key) {
        _defineProperty$1(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$2(Object(source)).forEach(function (key) {
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

  function _classCallCheck$2(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$2(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$2(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$2(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$2(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _defineProperty$1(obj, key, value) {
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

  function _inherits$1(subClass, superClass) {
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
    if (superClass) _setPrototypeOf$1(subClass, superClass);
  }

  function _getPrototypeOf$1(o) {
    _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf$1(o);
  }

  function _setPrototypeOf$1(o, p) {
    _setPrototypeOf$1 = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf$1(o, p);
  }

  function _isNativeReflectConstruct$1() {
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

  function _assertThisInitialized$1(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn$1(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized$1(self);
  }

  function _createSuper$1(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct$1();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf$1(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf$1(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn$1(this, result);
    };
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray$2(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray$1(arr) {
    return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _unsupportedIterableToArray$2(arr) || _nonIterableSpread$1();
  }

  function _arrayWithoutHoles$1(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray$2(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray$1(iter) {
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

  function _unsupportedIterableToArray$2(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$2(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen);
  }

  function _arrayLikeToArray$2(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread$1() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper$1(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike && o && typeof o.length === "number") {
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

  var version$1 = "1.0.2";

  function configSchemaFactory(pluginManager) {
    var LGVPlugin = pluginManager.getPlugin('LinearGenomeViewPlugin'); // @ts-ignore

    var baseLinearDisplayConfigSchema = LGVPlugin.exports.baseLinearDisplayConfigSchema;
    return configuration.ConfigurationSchema('LinearICGCDisplay', {
      renderer: require$$4.types.optional(pluginManager.pluggableConfigSchemaType('renderer'), {
        color1: 'jexl:fi(feature)'
      })
    }, {
      baseConfiguration: baseLinearDisplayConfigSchema,
      explicitlyTyped: true
    });
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var configurationSchema = {};

  var interopRequireDefault$1 = {exports: {}};

  (function (module) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      "default": obj
    };
  }

  module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(interopRequireDefault$1));

  var slicedToArray = {exports: {}};

  var arrayWithHoles = {exports: {}};

  (function (module) {
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  module.exports = _arrayWithHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(arrayWithHoles));

  var iterableToArrayLimit = {exports: {}};

  (function (module) {
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

  module.exports = _iterableToArrayLimit, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(iterableToArrayLimit));

  var unsupportedIterableToArray$2 = {exports: {}};

  var arrayLikeToArray$3 = {exports: {}};

  (function (module) {
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  module.exports = _arrayLikeToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(arrayLikeToArray$3));

  (function (module) {
  var arrayLikeToArray = arrayLikeToArray$3.exports;

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
  }

  module.exports = _unsupportedIterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(unsupportedIterableToArray$2));

  var nonIterableRest = {exports: {}};

  (function (module) {
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  module.exports = _nonIterableRest, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(nonIterableRest));

  (function (module) {
  var arrayWithHoles$1 = arrayWithHoles.exports;

  var iterableToArrayLimit$1 = iterableToArrayLimit.exports;

  var unsupportedIterableToArray = unsupportedIterableToArray$2.exports;

  var nonIterableRest$1 = nonIterableRest.exports;

  function _slicedToArray(arr, i) {
    return arrayWithHoles$1(arr) || iterableToArrayLimit$1(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest$1();
  }

  module.exports = _slicedToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(slicedToArray));

  var defineProperty$1 = {exports: {}};

  (function (module) {
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

  module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(defineProperty$1));

  var _typeof$2 = {exports: {}};

  (function (module) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(obj);
  }

  module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(_typeof$2));

  var mst = {};

  var objectWithoutProperties = {exports: {}};

  var objectWithoutPropertiesLoose = {exports: {}};

  (function (module) {
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

  module.exports = _objectWithoutPropertiesLoose, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(objectWithoutPropertiesLoose));

  (function (module) {
  var objectWithoutPropertiesLoose$1 = objectWithoutPropertiesLoose.exports;

  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = objectWithoutPropertiesLoose$1(source, excluded);
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

  module.exports = _objectWithoutProperties, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(objectWithoutProperties));

  var lib = {exports: {}};

  // Found this seed-based random generator somewhere
  // Based on The Central Randomizer 1.3 (C) 1997 by Paul Houle (houle@msc.cornell.edu)

  var seed = 1;

  /**
   * return a random number based on a seed
   * @param seed
   * @returns {number}
   */
  function getNextValue() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed/(233280.0);
  }

  function setSeed$1(_seed_) {
      seed = _seed_;
  }

  var randomFromSeed$1 = {
      nextValue: getNextValue,
      seed: setSeed$1
  };

  var randomFromSeed = randomFromSeed$1;

  var ORIGINAL = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
  var alphabet$2;
  var previousSeed;

  var shuffled;

  function reset() {
      shuffled = false;
  }

  function setCharacters(_alphabet_) {
      if (!_alphabet_) {
          if (alphabet$2 !== ORIGINAL) {
              alphabet$2 = ORIGINAL;
              reset();
          }
          return;
      }

      if (_alphabet_ === alphabet$2) {
          return;
      }

      if (_alphabet_.length !== ORIGINAL.length) {
          throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. You submitted ' + _alphabet_.length + ' characters: ' + _alphabet_);
      }

      var unique = _alphabet_.split('').filter(function(item, ind, arr){
         return ind !== arr.lastIndexOf(item);
      });

      if (unique.length) {
          throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. These characters were not unique: ' + unique.join(', '));
      }

      alphabet$2 = _alphabet_;
      reset();
  }

  function characters(_alphabet_) {
      setCharacters(_alphabet_);
      return alphabet$2;
  }

  function setSeed(seed) {
      randomFromSeed.seed(seed);
      if (previousSeed !== seed) {
          reset();
          previousSeed = seed;
      }
  }

  function shuffle() {
      if (!alphabet$2) {
          setCharacters(ORIGINAL);
      }

      var sourceArray = alphabet$2.split('');
      var targetArray = [];
      var r = randomFromSeed.nextValue();
      var characterIndex;

      while (sourceArray.length > 0) {
          r = randomFromSeed.nextValue();
          characterIndex = Math.floor(r * sourceArray.length);
          targetArray.push(sourceArray.splice(characterIndex, 1)[0]);
      }
      return targetArray.join('');
  }

  function getShuffled() {
      if (shuffled) {
          return shuffled;
      }
      shuffled = shuffle();
      return shuffled;
  }

  /**
   * lookup shuffled letter
   * @param index
   * @returns {string}
   */
  function lookup(index) {
      var alphabetShuffled = getShuffled();
      return alphabetShuffled[index];
  }

  function get () {
    return alphabet$2 || ORIGINAL;
  }

  var alphabet_1 = {
      get: get,
      characters: characters,
      seed: setSeed,
      lookup: lookup,
      shuffled: getShuffled
  };

  var crypto$1 = typeof window === 'object' && (window.crypto || window.msCrypto); // IE 11 uses window.msCrypto

  var randomByte;

  if (!crypto$1 || !crypto$1.getRandomValues) {
      randomByte = function(size) {
          var bytes = [];
          for (var i = 0; i < size; i++) {
              bytes.push(Math.floor(Math.random() * 256));
          }
          return bytes;
      };
  } else {
      randomByte = function(size) {
          return crypto$1.getRandomValues(new Uint8Array(size));
      };
  }

  var randomByteBrowser = randomByte;

  // This file replaces `format.js` in bundlers like webpack or Rollup,
  // according to `browser` config in `package.json`.

  var format_browser = function (random, alphabet, size) {
    // We can’t use bytes bigger than the alphabet. To make bytes values closer
    // to the alphabet, we apply bitmask on them. We look for the closest
    // `2 ** x - 1` number, which will be bigger than alphabet size. If we have
    // 30 symbols in the alphabet, we will take 31 (00011111).
    // We do not use faster Math.clz32, because it is not available in browsers.
    var mask = (2 << Math.log(alphabet.length - 1) / Math.LN2) - 1;
    // Bitmask is not a perfect solution (in our example it will pass 31 bytes,
    // which is bigger than the alphabet). As a result, we will need more bytes,
    // than ID size, because we will refuse bytes bigger than the alphabet.

    // Every hardware random generator call is costly,
    // because we need to wait for entropy collection. This is why often it will
    // be faster to ask for few extra bytes in advance, to avoid additional calls.

    // Here we calculate how many random bytes should we call in advance.
    // It depends on ID length, mask / alphabet size and magic number 1.6
    // (which was selected according benchmarks).

    // -~f => Math.ceil(f) if n is float number
    // -~i => i + 1 if n is integer number
    var step = -~(1.6 * mask * size / alphabet.length);
    var id = '';

    while (true) {
      var bytes = random(step);
      // Compact alternative for `for (var i = 0; i < step; i++)`
      var i = step;
      while (i--) {
        // If random byte is bigger than alphabet even after bitmask,
        // we refuse it by `|| ''`.
        id += alphabet[bytes[i] & mask] || '';
        // More compact than `id.length + 1 === size`
        if (id.length === +size) return id
      }
    }
  };

  var alphabet$1 = alphabet_1;
  var random = randomByteBrowser;
  var format = format_browser;

  function generate$1(number) {
      var loopCounter = 0;
      var done;

      var str = '';

      while (!done) {
          str = str + format(random, alphabet$1.get(), 1);
          done = number < (Math.pow(16, loopCounter + 1 ) );
          loopCounter++;
      }
      return str;
  }

  var generate_1 = generate$1;

  var generate = generate_1;

  // Ignore all milliseconds before a certain time to reduce the size of the date entropy without sacrificing uniqueness.
  // This number should be updated every year or so to keep the generated id short.
  // To regenerate `new Date() - 0` and bump the version. Always bump the version!
  var REDUCE_TIME = 1567752802062;

  // don't change unless we change the algos or REDUCE_TIME
  // must be an integer and less than 16
  var version = 7;

  // Counter is used when shortid is called multiple times in one second.
  var counter;

  // Remember the last time shortid was called in case counter is needed.
  var previousSeconds;

  /**
   * Generate unique id
   * Returns string id
   */
  function build(clusterWorkerId) {
      var str = '';

      var seconds = Math.floor((Date.now() - REDUCE_TIME) * 0.001);

      if (seconds === previousSeconds) {
          counter++;
      } else {
          counter = 0;
          previousSeconds = seconds;
      }

      str = str + generate(version);
      str = str + generate(clusterWorkerId);
      if (counter > 0) {
          str = str + generate(counter);
      }
      str = str + generate(seconds);
      return str;
  }

  var build_1 = build;

  var alphabet = alphabet_1;

  function isShortId(id) {
      if (!id || typeof id !== 'string' || id.length < 6 ) {
          return false;
      }

      var nonAlphabetic = new RegExp('[^' +
        alphabet.get().replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&') +
      ']');
      return !nonAlphabetic.test(id);
  }

  var isValid = isShortId;

  (function (module) {

  var alphabet = alphabet_1;
  var build = build_1;
  var isValid$1 = isValid;

  // if you are using cluster or multiple servers use this to make each instance
  // has a unique value for worker
  // Note: I don't know if this is automatically set when using third
  // party cluster solutions such as pm2.
  var clusterWorkerId = 0;

  /**
   * Set the seed.
   * Highly recommended if you don't want people to try to figure out your id schema.
   * exposed as shortid.seed(int)
   * @param seed Integer value to seed the random alphabet.  ALWAYS USE THE SAME SEED or you might get overlaps.
   */
  function seed(seedValue) {
      alphabet.seed(seedValue);
      return module.exports;
  }

  /**
   * Set the cluster worker or machine id
   * exposed as shortid.worker(int)
   * @param workerId worker must be positive integer.  Number less than 16 is recommended.
   * returns shortid module so it can be chained.
   */
  function worker(workerId) {
      clusterWorkerId = workerId;
      return module.exports;
  }

  /**
   *
   * sets new characters to use in the alphabet
   * returns the shuffled alphabet
   */
  function characters(newCharacters) {
      if (newCharacters !== undefined) {
          alphabet.characters(newCharacters);
      }

      return alphabet.shuffled();
  }

  /**
   * Generate unique id
   * Returns string id
   */
  function generate() {
    return build(clusterWorkerId);
  }

  // Export all other functions as properties of the generate function
  module.exports = generate;
  module.exports.generate = generate;
  module.exports.seed = seed;
  module.exports.worker = worker;
  module.exports.characters = characters;
  module.exports.isValid = isValid$1;
  }(lib));

  var shortid = lib.exports;

  var _interopRequireDefault$i = interopRequireDefault$1.exports;

  Object.defineProperty(mst, "__esModule", {
    value: true
  });
  mst.UriLocationRaw = mst.UriLocation = mst.Region = mst.PropTypes = mst.NoAssemblyRegion = mst.LocalPathLocation = mst.FileLocation = mst.ElementId = mst.BlobLocation = void 0;

  var _defineProperty2$2 = _interopRequireDefault$i(defineProperty$1.exports);

  var _objectWithoutProperties2 = _interopRequireDefault$i(objectWithoutProperties.exports);

  var _shortid = _interopRequireDefault$i(shortid);

  var _mobxStateTree$4 = require$$4__default["default"];

  var _propTypes = _interopRequireDefault$i(require$$5__default["default"]);

  var _mobxReact = require$$6__default["default"];

  var _excluded$1 = ["baseUri"],
      _excluded2 = ["locationType"];

  function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { (0, _defineProperty2$2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

  var ElementId = _mobxStateTree$4.types.optional(_mobxStateTree$4.types.identifier, _shortid.default.generate); // PropTypes that are useful when working with instances of these in react components


  mst.ElementId = ElementId;
  var PropTypes = {
    Region: _propTypes.default.shape({
      refName: _propTypes.default.string.isRequired,
      start: _propTypes.default.number.isRequired,
      end: _propTypes.default.number.isRequired
    }),
    ConfigSchema: _mobxReact.PropTypes.objectOrObservableObject,
    Feature: _propTypes.default.shape({
      get: _propTypes.default.func.isRequired,
      id: _propTypes.default.func.isRequired
    })
  };
  mst.PropTypes = PropTypes;

  var NoAssemblyRegion = _mobxStateTree$4.types.model('NoAssemblyRegion', {
    refName: _mobxStateTree$4.types.string,
    start: _mobxStateTree$4.types.number,
    end: _mobxStateTree$4.types.number,
    reversed: _mobxStateTree$4.types.optional(_mobxStateTree$4.types.boolean, false)
  }).actions(function (self) {
    return {
      setRefName: function setRefName(newRefName) {
        self.refName = newRefName;
      }
    };
  });

  mst.NoAssemblyRegion = NoAssemblyRegion;

  var Region = _mobxStateTree$4.types.compose('Region', NoAssemblyRegion, _mobxStateTree$4.types.model({
    assemblyName: _mobxStateTree$4.types.string
  }));

  mst.Region = Region;

  var LocalPathLocation = _mobxStateTree$4.types.model('LocalPathLocation', {
    locationType: _mobxStateTree$4.types.literal('LocalPathLocation'),
    localPath: _mobxStateTree$4.types.string
  }); // like how blobId is used to get a blob map


  mst.LocalPathLocation = LocalPathLocation;

  var BlobLocation = _mobxStateTree$4.types.model('BlobLocation', {
    locationType: _mobxStateTree$4.types.literal('BlobLocation'),
    name: _mobxStateTree$4.types.string,
    blobId: _mobxStateTree$4.types.string
  });

  mst.BlobLocation = BlobLocation;

  var UriLocationRaw = _mobxStateTree$4.types.model('UriLocation', {
    locationType: _mobxStateTree$4.types.literal('UriLocation'),
    uri: _mobxStateTree$4.types.string,
    baseUri: _mobxStateTree$4.types.maybe(_mobxStateTree$4.types.string),
    internetAccountId: _mobxStateTree$4.types.maybe(_mobxStateTree$4.types.string),
    // auths information (such as tokens) needed for using this resource.
    // if provided, these must be completely sufficient for using it
    internetAccountPreAuthorization: _mobxStateTree$4.types.maybe(_mobxStateTree$4.types.model('InternetAccountPreAuthorization', {
      internetAccountType: _mobxStateTree$4.types.string,
      authInfo: _mobxStateTree$4.types.frozen()
    }))
  });

  mst.UriLocationRaw = UriLocationRaw;

  var UriLocation = _mobxStateTree$4.types.snapshotProcessor(UriLocationRaw, {
    postProcessor: function postProcessor(snap) {
      var baseUri = snap.baseUri,
          rest = (0, _objectWithoutProperties2.default)(snap, _excluded$1);

      if (!baseUri) {
        return rest;
      }

      return snap;
    }
  });

  mst.UriLocation = UriLocation;

  var FileLocation = _mobxStateTree$4.types.snapshotProcessor(_mobxStateTree$4.types.union(LocalPathLocation, UriLocation, BlobLocation), {
    // @ts-ignore
    preProcessor: function preProcessor(snapshot) {
      if (!snapshot) {
        return undefined;
      } // @ts-ignore


      var locationType = snapshot.locationType,
          rest = (0, _objectWithoutProperties2.default)(snapshot, _excluded2);

      if (!locationType) {
        // @ts-ignore
        var uri = rest.uri,
            localPath = rest.localPath,
            blob = rest.blob;
        var _locationType = '';

        if (uri !== undefined) {
          _locationType = 'UriLocation';
        } else if (localPath !== undefined) {
          _locationType = 'LocalPathLocation';
        } else if (blob !== undefined) {
          _locationType = 'BlobLocation';
        }

        return _objectSpread$1(_objectSpread$1({}, rest), {}, {
          locationType: _locationType
        });
      }

      return snapshot;
    }
  });

  mst.FileLocation = FileLocation;

  var configurationSlot = {};

  var jexlStrings = {};

  var jexl = {};

  var Jexl$1 = {exports: {}};

  function _interopRequireDefault$h(obj) {
    return obj && obj.__esModule ? obj : {
      "default": obj
    };
  }

  var interopRequireDefault = _interopRequireDefault$h;

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

  var defineProperty = _defineProperty;

  function _classCallCheck$1(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var classCallCheck$1 = _classCallCheck$1;

  function _defineProperties$1(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$1(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$1(Constructor, staticProps);
    return Constructor;
  }

  var createClass$1 = _createClass$1;

  var handlers$3 = {};

  function _arrayLikeToArray$1(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  var arrayLikeToArray$2 = _arrayLikeToArray$1;

  var arrayLikeToArray$1 = arrayLikeToArray$2;

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return arrayLikeToArray$1(arr);
  }

  var arrayWithoutHoles$2 = _arrayWithoutHoles;

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  var iterableToArray$2 = _iterableToArray;

  var arrayLikeToArray = arrayLikeToArray$2;

  function _unsupportedIterableToArray$1(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
  }

  var unsupportedIterableToArray$1 = _unsupportedIterableToArray$1;

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var nonIterableSpread$2 = _nonIterableSpread;

  var arrayWithoutHoles$1 = arrayWithoutHoles$2;

  var iterableToArray$1 = iterableToArray$2;

  var unsupportedIterableToArray = unsupportedIterableToArray$1;

  var nonIterableSpread$1 = nonIterableSpread$2;

  function _toConsumableArray(arr) {
    return arrayWithoutHoles$1(arr) || iterableToArray$1(arr) || unsupportedIterableToArray(arr) || nonIterableSpread$1();
  }

  var toConsumableArray$1 = _toConsumableArray;

  var _interopRequireDefault$g = interopRequireDefault;

  var _toConsumableArray2$1 = _interopRequireDefault$g(toConsumableArray$1);

  /*
   * Jexl
   * Copyright 2020 Tom Shawver
   */
  var poolNames = {
    functions: 'Jexl Function',
    transforms: 'Transform'
  };
  /**
   * Evaluates an ArrayLiteral by returning its value, with each element
   * independently run through the evaluator.
   * @param {{type: 'ObjectLiteral', value: <{}>}} ast An expression tree with an
   *      ObjectLiteral as the top node
   * @returns {Promise.<[]>} resolves to a map contained evaluated values.
   * @private
   */

  handlers$3.ArrayLiteral = function (ast) {
    return this.evalArray(ast.value);
  };
  /**
   * Evaluates a BinaryExpression node by running the Grammar's evaluator for
   * the given operator. Note that binary expressions support two types of
   * evaluators: `eval` is called with the left and right operands pre-evaluated.
   * `evalOnDemand`, if it exists, will be called with the left and right operands
   * each individually wrapped in an object with an "eval" function that returns
   * a promise with the resulting value. This allows the binary expression to
   * evaluate the operands conditionally.
   * @param {{type: 'BinaryExpression', operator: <string>, left: {},
   *      right: {}}} ast An expression tree with a BinaryExpression as the top
   *      node
   * @returns {Promise<*>} resolves with the value of the BinaryExpression.
   * @private
   */


  handlers$3.BinaryExpression = function (ast) {
    var _this = this;

    var grammarOp = this._grammar.elements[ast.operator];

    if (grammarOp.evalOnDemand) {
      var wrap = function wrap(subAst) {
        return {
          eval: function _eval() {
            return _this.eval(subAst);
          }
        };
      };

      return grammarOp.evalOnDemand(wrap(ast.left), wrap(ast.right));
    }

    return this.Promise.all([this.eval(ast.left), this.eval(ast.right)]).then(function (arr) {
      return grammarOp.eval(arr[0], arr[1]);
    });
  };
  /**
   * Evaluates a ConditionalExpression node by first evaluating its test branch,
   * and resolving with the consequent branch if the test is truthy, or the
   * alternate branch if it is not. If there is no consequent branch, the test
   * result will be used instead.
   * @param {{type: 'ConditionalExpression', test: {}, consequent: {},
   *      alternate: {}}} ast An expression tree with a ConditionalExpression as
   *      the top node
   * @private
   */


  handlers$3.ConditionalExpression = function (ast) {
    var _this2 = this;

    return this.eval(ast.test).then(function (res) {
      if (res) {
        if (ast.consequent) {
          return _this2.eval(ast.consequent);
        }

        return res;
      }

      return _this2.eval(ast.alternate);
    });
  };
  /**
   * Evaluates a FilterExpression by applying it to the subject value.
   * @param {{type: 'FilterExpression', relative: <boolean>, expr: {},
   *      subject: {}}} ast An expression tree with a FilterExpression as the top
   *      node
   * @returns {Promise<*>} resolves with the value of the FilterExpression.
   * @private
   */


  handlers$3.FilterExpression = function (ast) {
    var _this3 = this;

    return this.eval(ast.subject).then(function (subject) {
      if (ast.relative) {
        return _this3._filterRelative(subject, ast.expr);
      }

      return _this3._filterStatic(subject, ast.expr);
    });
  };
  /**
   * Evaluates an Identifier by either stemming from the evaluated 'from'
   * expression tree or accessing the context provided when this Evaluator was
   * constructed.
   * @param {{type: 'Identifier', value: <string>, [from]: {}}} ast An expression
   *      tree with an Identifier as the top node
   * @returns {Promise<*>|*} either the identifier's value, or a Promise that
   *      will resolve with the identifier's value.
   * @private
   */


  handlers$3.Identifier = function (ast) {
    if (!ast.from) {
      return ast.relative ? this._relContext[ast.value] : this._context[ast.value];
    }

    return this.eval(ast.from).then(function (context) {
      if (context === undefined || context === null) {
        return undefined;
      }

      if (Array.isArray(context)) {
        context = context[0];
      }

      return context[ast.value];
    });
  };
  /**
   * Evaluates a Literal by returning its value property.
   * @param {{type: 'Literal', value: <string|number|boolean>}} ast An expression
   *      tree with a Literal as its only node
   * @returns {string|number|boolean} The value of the Literal node
   * @private
   */


  handlers$3.Literal = function (ast) {
    return ast.value;
  };
  /**
   * Evaluates an ObjectLiteral by returning its value, with each key
   * independently run through the evaluator.
   * @param {{type: 'ObjectLiteral', value: <{}>}} ast An expression tree with an
   *      ObjectLiteral as the top node
   * @returns {Promise<{}>} resolves to a map contained evaluated values.
   * @private
   */


  handlers$3.ObjectLiteral = function (ast) {
    return this.evalMap(ast.value);
  };
  /**
   * Evaluates a FunctionCall node by applying the supplied arguments to a
   * function defined in one of the grammar's function pools.
   * @param {{type: 'FunctionCall', name: <string>}} ast An
   *      expression tree with a FunctionCall as the top node
   * @returns {Promise<*>|*} the value of the function call, or a Promise that
   *      will resolve with the resulting value.
   * @private
   */


  handlers$3.FunctionCall = function (ast) {
    var poolName = poolNames[ast.pool];

    if (!poolName) {
      throw new Error("Corrupt AST: Pool '".concat(ast.pool, "' not found"));
    }

    var pool = this._grammar[ast.pool];
    var func = pool[ast.name];

    if (!func) {
      throw new Error("".concat(poolName, " ").concat(ast.name, " is not defined."));
    }

    return this.evalArray(ast.args || []).then(function (args) {
      return func.apply(void 0, (0, _toConsumableArray2$1.default)(args));
    });
  };
  /**
   * Evaluates a Unary expression by passing the right side through the
   * operator's eval function.
   * @param {{type: 'UnaryExpression', operator: <string>, right: {}}} ast An
   *      expression tree with a UnaryExpression as the top node
   * @returns {Promise<*>} resolves with the value of the UnaryExpression.
   * @constructor
   */


  handlers$3.UnaryExpression = function (ast) {
    var _this4 = this;

    return this.eval(ast.right).then(function (right) {
      return _this4._grammar.elements[ast.operator].eval(right);
    });
  };

  var _interopRequireDefault$f = interopRequireDefault;

  var _classCallCheck2$6 = _interopRequireDefault$f(classCallCheck$1);

  var _createClass2$6 = _interopRequireDefault$f(createClass$1);

  /*
   * Jexl
   * Copyright 2020 Tom Shawver
   */
  var handlers$2 = handlers$3;
  /**
   * The Evaluator takes a Jexl expression tree as generated by the
   * {@link Parser} and calculates its value within a given context. The
   * collection of transforms, context, and a relative context to be used as the
   * root for relative identifiers, are all specific to an Evaluator instance.
   * When any of these things change, a new instance is required.  However, a
   * single instance can be used to simultaneously evaluate many different
   * expressions, and does not have to be reinstantiated for each.
   * @param {{}} grammar A grammar object against which to evaluate the expression
   *      tree
   * @param {{}} [context] A map of variable keys to their values. This will be
   *      accessed to resolve the value of each non-relative identifier. Any
   *      Promise values will be passed to the expression as their resolved
   *      value.
   * @param {{}|Array<{}|Array>} [relativeContext] A map or array to be accessed
   *      to resolve the value of a relative identifier.
   * @param {function} promise A constructor for the Promise class to be used;
   *      probably either Promise or PromiseSync.
   */


  var Evaluator$1 = /*#__PURE__*/function () {
    function Evaluator(grammar, context, relativeContext) {
      var promise = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Promise;
      (0, _classCallCheck2$6.default)(this, Evaluator);
      this._grammar = grammar;
      this._context = context || {};
      this._relContext = relativeContext || this._context;
      this.Promise = promise;
    }
    /**
     * Evaluates an expression tree within the configured context.
     * @param {{}} ast An expression tree object
     * @returns {Promise<*>} resolves with the resulting value of the expression.
     */


    (0, _createClass2$6.default)(Evaluator, [{
      key: "eval",
      value: function _eval(ast) {
        var _this = this;

        return this.Promise.resolve().then(function () {
          return handlers$2[ast.type].call(_this, ast);
        });
      }
      /**
       * Simultaneously evaluates each expression within an array, and delivers the
       * response as an array with the resulting values at the same indexes as their
       * originating expressions.
       * @param {Array<string>} arr An array of expression strings to be evaluated
       * @returns {Promise<Array<{}>>} resolves with the result array
       */

    }, {
      key: "evalArray",
      value: function evalArray(arr) {
        var _this2 = this;

        return this.Promise.all(arr.map(function (elem) {
          return _this2.eval(elem);
        }));
      }
      /**
       * Simultaneously evaluates each expression within a map, and delivers the
       * response as a map with the same keys, but with the evaluated result for each
       * as their value.
       * @param {{}} map A map of expression names to expression trees to be
       *      evaluated
       * @returns {Promise<{}>} resolves with the result map.
       */

    }, {
      key: "evalMap",
      value: function evalMap(map) {
        var _this3 = this;

        var keys = Object.keys(map);
        var result = {};
        var asts = keys.map(function (key) {
          return _this3.eval(map[key]);
        });
        return this.Promise.all(asts).then(function (vals) {
          vals.forEach(function (val, idx) {
            result[keys[idx]] = val;
          });
          return result;
        });
      }
      /**
       * Applies a filter expression with relative identifier elements to a subject.
       * The intent is for the subject to be an array of subjects that will be
       * individually used as the relative context against the provided expression
       * tree. Only the elements whose expressions result in a truthy value will be
       * included in the resulting array.
       *
       * If the subject is not an array of values, it will be converted to a single-
       * element array before running the filter.
       * @param {*} subject The value to be filtered usually an array. If this value is
       *      not an array, it will be converted to an array with this value as the
       *      only element.
       * @param {{}} expr The expression tree to run against each subject. If the
       *      tree evaluates to a truthy result, then the value will be included in
       *      the returned array otherwise, it will be eliminated.
       * @returns {Promise<Array>} resolves with an array of values that passed the
       *      expression filter.
       * @private
       */

    }, {
      key: "_filterRelative",
      value: function _filterRelative(subject, expr) {
        var _this4 = this;

        var promises = [];

        if (!Array.isArray(subject)) {
          subject = subject === undefined ? [] : [subject];
        }

        subject.forEach(function (elem) {
          var evalInst = new Evaluator(_this4._grammar, _this4._context, elem, _this4.Promise);
          promises.push(evalInst.eval(expr));
        });
        return this.Promise.all(promises).then(function (values) {
          var results = [];
          values.forEach(function (value, idx) {
            if (value) {
              results.push(subject[idx]);
            }
          });
          return results;
        });
      }
      /**
       * Applies a static filter expression to a subject value.  If the filter
       * expression evaluates to boolean true, the subject is returned if false,
       * undefined.
       *
       * For any other resulting value of the expression, this function will attempt
       * to respond with the property at that name or index of the subject.
       * @param {*} subject The value to be filtered.  Usually an Array (for which
       *      the expression would generally resolve to a numeric index) or an
       *      Object (for which the expression would generally resolve to a string
       *      indicating a property name)
       * @param {{}} expr The expression tree to run against the subject
       * @returns {Promise<*>} resolves with the value of the drill-down.
       * @private
       */

    }, {
      key: "_filterStatic",
      value: function _filterStatic(subject, expr) {
        return this.eval(expr).then(function (res) {
          if (typeof res === 'boolean') {
            return res ? subject : undefined;
          }

          return subject[res];
        });
      }
    }]);
    return Evaluator;
  }();

  var Evaluator_1 = Evaluator$1;

  var _interopRequireDefault$e = interopRequireDefault;

  var _classCallCheck2$5 = _interopRequireDefault$e(classCallCheck$1);

  var _createClass2$5 = _interopRequireDefault$e(createClass$1);

  /*
   * Jexl
   * Copyright 2020 Tom Shawver
   */
  var numericRegex = /^-?(?:(?:[0-9]*\.[0-9]+)|[0-9]+)$/;
  var identRegex = /^[a-zA-Zа-яА-Я_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF$][a-zA-Zа-яА-Я0-9_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF$]*$/;
  var escEscRegex = /\\\\/;
  var whitespaceRegex = /^\s*$/;
  var preOpRegexElems = [// Strings
  "'(?:(?:\\\\')|[^'])*'", '"(?:(?:\\\\")|[^"])*"', // Whitespace
  '\\s+', // Booleans
  '\\btrue\\b', '\\bfalse\\b'];
  var postOpRegexElems = [// Identifiers
  "[a-zA-Z\u0430-\u044F\u0410-\u042F_\xC0-\xD6\xD8-\xF6\xF8-\xFF\\$][a-zA-Z0-9\u0430-\u044F\u0410-\u042F_\xC0-\xD6\xD8-\xF6\xF8-\xFF\\$]*", // Numerics (without negative symbol)
  '(?:(?:[0-9]*\\.[0-9]+)|[0-9]+)'];
  var minusNegatesAfter = ['binaryOp', 'unaryOp', 'openParen', 'openBracket', 'question', 'colon'];
  /**
   * Lexer is a collection of stateless, statically-accessed functions for the
   * lexical parsing of a Jexl string.  Its responsibility is to identify the
   * "parts of speech" of a Jexl expression, and tokenize and label each, but
   * to do only the most minimal syntax checking; the only errors the Lexer
   * should be concerned with are if it's unable to identify the utility of
   * any of its tokens.  Errors stemming from these tokens not being in a
   * sensible configuration should be left for the Parser to handle.
   * @type {{}}
   */

  var Lexer$1 = /*#__PURE__*/function () {
    function Lexer(grammar) {
      (0, _classCallCheck2$5.default)(this, Lexer);
      this._grammar = grammar;
    }
    /**
     * Splits a Jexl expression string into an array of expression elements.
     * @param {string} str A Jexl expression string
     * @returns {Array<string>} An array of substrings defining the functional
     *      elements of the expression.
     */


    (0, _createClass2$5.default)(Lexer, [{
      key: "getElements",
      value: function getElements(str) {
        var regex = this._getSplitRegex();

        return str.split(regex).filter(function (elem) {
          // Remove empty strings
          return elem;
        });
      }
      /**
       * Converts an array of expression elements into an array of tokens.  Note that
       * the resulting array may not equal the element array in length, as any
       * elements that consist only of whitespace get appended to the previous
       * token's "raw" property.  For the structure of a token object, please see
       * {@link Lexer#tokenize}.
       * @param {Array<string>} elements An array of Jexl expression elements to be
       *      converted to tokens
       * @returns {Array<{type, value, raw}>} an array of token objects.
       */

    }, {
      key: "getTokens",
      value: function getTokens(elements) {
        var tokens = [];
        var negate = false;

        for (var i = 0; i < elements.length; i++) {
          if (this._isWhitespace(elements[i])) {
            if (tokens.length) {
              tokens[tokens.length - 1].raw += elements[i];
            }
          } else if (elements[i] === '-' && this._isNegative(tokens)) {
            negate = true;
          } else {
            if (negate) {
              elements[i] = '-' + elements[i];
              negate = false;
            }

            tokens.push(this._createToken(elements[i]));
          }
        } // Catch a - at the end of the string. Let the parser handle that issue.


        if (negate) {
          tokens.push(this._createToken('-'));
        }

        return tokens;
      }
      /**
       * Converts a Jexl string into an array of tokens.  Each token is an object
       * in the following format:
       *
       *     {
       *         type: <string>,
       *         [name]: <string>,
       *         value: <boolean|number|string>,
       *         raw: <string>
       *     }
       *
       * Type is one of the following:
       *
       *      literal, identifier, binaryOp, unaryOp
       *
       * OR, if the token is a control character its type is the name of the element
       * defined in the Grammar.
       *
       * Name appears only if the token is a control string found in
       * {@link grammar#elements}, and is set to the name of the element.
       *
       * Value is the value of the token in the correct type (boolean or numeric as
       * appropriate). Raw is the string representation of this value taken directly
       * from the expression string, including any trailing spaces.
       * @param {string} str The Jexl string to be tokenized
       * @returns {Array<{type, value, raw}>} an array of token objects.
       * @throws {Error} if the provided string contains an invalid token.
       */

    }, {
      key: "tokenize",
      value: function tokenize(str) {
        var elements = this.getElements(str);
        return this.getTokens(elements);
      }
      /**
       * Creates a new token object from an element of a Jexl string. See
       * {@link Lexer#tokenize} for a description of the token object.
       * @param {string} element The element from which a token should be made
       * @returns {{value: number|boolean|string, [name]: string, type: string,
       *      raw: string}} a token object describing the provided element.
       * @throws {Error} if the provided string is not a valid expression element.
       * @private
       */

    }, {
      key: "_createToken",
      value: function _createToken(element) {
        var token = {
          type: 'literal',
          value: element,
          raw: element
        };

        if (element[0] === '"' || element[0] === "'") {
          token.value = this._unquote(element);
        } else if (element.match(numericRegex)) {
          token.value = parseFloat(element);
        } else if (element === 'true' || element === 'false') {
          token.value = element === 'true';
        } else if (this._grammar.elements[element]) {
          token.type = this._grammar.elements[element].type;
        } else if (element.match(identRegex)) {
          token.type = 'identifier';
        } else {
          throw new Error("Invalid expression token: ".concat(element));
        }

        return token;
      }
      /**
       * Escapes a string so that it can be treated as a string literal within a
       * regular expression.
       * @param {string} str The string to be escaped
       * @returns {string} the RegExp-escaped string.
       * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
       * @private
       */

    }, {
      key: "_escapeRegExp",
      value: function _escapeRegExp(str) {
        str = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        if (str.match(identRegex)) {
          str = '\\b' + str + '\\b';
        }

        return str;
      }
      /**
       * Gets a RegEx object appropriate for splitting a Jexl string into its core
       * elements.
       * @returns {RegExp} An element-splitting RegExp object
       * @private
       */

    }, {
      key: "_getSplitRegex",
      value: function _getSplitRegex() {
        var _this = this;

        if (!this._splitRegex) {
          // Sort by most characters to least, then regex escape each
          var elemArray = Object.keys(this._grammar.elements).sort(function (a, b) {
            return b.length - a.length;
          }).map(function (elem) {
            return _this._escapeRegExp(elem);
          }, this);
          this._splitRegex = new RegExp('(' + [preOpRegexElems.join('|'), elemArray.join('|'), postOpRegexElems.join('|')].join('|') + ')');
        }

        return this._splitRegex;
      }
      /**
       * Determines whether the addition of a '-' token should be interpreted as a
       * negative symbol for an upcoming number, given an array of tokens already
       * processed.
       * @param {Array<Object>} tokens An array of tokens already processed
       * @returns {boolean} true if adding a '-' should be considered a negative
       *      symbol; false otherwise
       * @private
       */

    }, {
      key: "_isNegative",
      value: function _isNegative(tokens) {
        if (!tokens.length) return true;
        return minusNegatesAfter.some(function (type) {
          return type === tokens[tokens.length - 1].type;
        });
      }
      /**
       * A utility function to determine if a string consists of only space
       * characters.
       * @param {string} str A string to be tested
       * @returns {boolean} true if the string is empty or consists of only spaces;
       *      false otherwise.
       * @private
       */

    }, {
      key: "_isWhitespace",
      value: function _isWhitespace(str) {
        return !!str.match(whitespaceRegex);
      }
      /**
       * Removes the beginning and trailing quotes from a string, unescapes any
       * escaped quotes on its interior, and unescapes any escaped escape
       * characters. Note that this function is not defensive; it assumes that the
       * provided string is not empty, and that its first and last characters are
       * actually quotes.
       * @param {string} str A string whose first and last characters are quotes
       * @returns {string} a string with the surrounding quotes stripped and escapes
       *      properly processed.
       * @private
       */

    }, {
      key: "_unquote",
      value: function _unquote(str) {
        var quote = str[0];
        var escQuoteRegex = new RegExp('\\\\' + quote, 'g');
        return str.substr(1, str.length - 2).replace(escQuoteRegex, quote).replace(escEscRegex, '\\');
      }
    }]);
    return Lexer;
  }();

  var Lexer_1 = Lexer$1;

  var handlers$1 = {};

  /*
   * Jexl
   * Copyright 2020 Tom Shawver
   */

  /**
   * Handles a subexpression that's used to define a transform argument's value.
   * @param {{type: <string>}} ast The subexpression tree
   */
  handlers$1.argVal = function (ast) {
    if (ast) this._cursor.args.push(ast);
  };
  /**
   * Handles new array literals by adding them as a new node in the AST,
   * initialized with an empty array.
   */


  handlers$1.arrayStart = function () {
    this._placeAtCursor({
      type: 'ArrayLiteral',
      value: []
    });
  };
  /**
   * Handles a subexpression representing an element of an array literal.
   * @param {{type: <string>}} ast The subexpression tree
   */


  handlers$1.arrayVal = function (ast) {
    if (ast) {
      this._cursor.value.push(ast);
    }
  };
  /**
   * Handles tokens of type 'binaryOp', indicating an operation that has two
   * inputs: a left side and a right side.
   * @param {{type: <string>}} token A token object
   */


  handlers$1.binaryOp = function (token) {
    var precedence = this._grammar.elements[token.value].precedence || 0;
    var parent = this._cursor._parent;

    while (parent && parent.operator && this._grammar.elements[parent.operator].precedence >= precedence) {
      this._cursor = parent;
      parent = parent._parent;
    }

    var node = {
      type: 'BinaryExpression',
      operator: token.value,
      left: this._cursor
    };

    this._setParent(this._cursor, node);

    this._cursor = parent;

    this._placeAtCursor(node);
  };
  /**
   * Handles successive nodes in an identifier chain.  More specifically, it
   * sets values that determine how the following identifier gets placed in the
   * AST.
   */


  handlers$1.dot = function () {
    this._nextIdentEncapsulate = this._cursor && this._cursor.type !== 'UnaryExpression' && (this._cursor.type !== 'BinaryExpression' || this._cursor.type === 'BinaryExpression' && this._cursor.right);
    this._nextIdentRelative = !this._cursor || this._cursor && !this._nextIdentEncapsulate;

    if (this._nextIdentRelative) {
      this._relative = true;
    }
  };
  /**
   * Handles a subexpression used for filtering an array returned by an
   * identifier chain.
   * @param {{type: <string>}} ast The subexpression tree
   */


  handlers$1.filter = function (ast) {
    this._placeBeforeCursor({
      type: 'FilterExpression',
      expr: ast,
      relative: this._subParser.isRelative(),
      subject: this._cursor
    });
  };
  /**
   * Handles identifier tokens when used to indicate the name of a function to
   * be called.
   * @param {{type: <string>}} token A token object
   */


  handlers$1.functionCall = function () {
    this._placeBeforeCursor({
      type: 'FunctionCall',
      name: this._cursor.value,
      args: [],
      pool: 'functions'
    });
  };
  /**
   * Handles identifier tokens by adding them as a new node in the AST.
   * @param {{type: <string>}} token A token object
   */


  handlers$1.identifier = function (token) {
    var node = {
      type: 'Identifier',
      value: token.value
    };

    if (this._nextIdentEncapsulate) {
      node.from = this._cursor;

      this._placeBeforeCursor(node);

      this._nextIdentEncapsulate = false;
    } else {
      if (this._nextIdentRelative) {
        node.relative = true;
        this._nextIdentRelative = false;
      }

      this._placeAtCursor(node);
    }
  };
  /**
   * Handles literal values, such as strings, booleans, and numerics, by adding
   * them as a new node in the AST.
   * @param {{type: <string>}} token A token object
   */


  handlers$1.literal = function (token) {
    this._placeAtCursor({
      type: 'Literal',
      value: token.value
    });
  };
  /**
   * Queues a new object literal key to be written once a value is collected.
   * @param {{type: <string>}} token A token object
   */


  handlers$1.objKey = function (token) {
    this._curObjKey = token.value;
  };
  /**
   * Handles new object literals by adding them as a new node in the AST,
   * initialized with an empty object.
   */


  handlers$1.objStart = function () {
    this._placeAtCursor({
      type: 'ObjectLiteral',
      value: {}
    });
  };
  /**
   * Handles an object value by adding its AST to the queued key on the object
   * literal node currently at the cursor.
   * @param {{type: <string>}} ast The subexpression tree
   */


  handlers$1.objVal = function (ast) {
    this._cursor.value[this._curObjKey] = ast;
  };
  /**
   * Handles traditional subexpressions, delineated with the groupStart and
   * groupEnd elements.
   * @param {{type: <string>}} ast The subexpression tree
   */


  handlers$1.subExpression = function (ast) {
    this._placeAtCursor(ast);
  };
  /**
   * Handles a completed alternate subexpression of a ternary operator.
   * @param {{type: <string>}} ast The subexpression tree
   */


  handlers$1.ternaryEnd = function (ast) {
    this._cursor.alternate = ast;
  };
  /**
   * Handles a completed consequent subexpression of a ternary operator.
   * @param {{type: <string>}} ast The subexpression tree
   */


  handlers$1.ternaryMid = function (ast) {
    this._cursor.consequent = ast;
  };
  /**
   * Handles the start of a new ternary expression by encapsulating the entire
   * AST in a ConditionalExpression node, and using the existing tree as the
   * test element.
   */


  handlers$1.ternaryStart = function () {
    this._tree = {
      type: 'ConditionalExpression',
      test: this._tree
    };
    this._cursor = this._tree;
  };
  /**
   * Handles identifier tokens when used to indicate the name of a transform to
   * be applied.
   * @param {{type: <string>}} token A token object
   */


  handlers$1.transform = function (token) {
    this._placeBeforeCursor({
      type: 'FunctionCall',
      name: token.value,
      args: [this._cursor],
      pool: 'transforms'
    });
  };
  /**
   * Handles token of type 'unaryOp', indicating that the operation has only
   * one input: a right side.
   * @param {{type: <string>}} token A token object
   */


  handlers$1.unaryOp = function (token) {
    this._placeAtCursor({
      type: 'UnaryExpression',
      operator: token.value
    });
  };

  var states$1 = {};

  /*
   * Jexl
   * Copyright 2020 Tom Shawver
   */
  var h = handlers$1;
  /**
   * A mapping of all states in the finite state machine to a set of instructions
   * for handling or transitioning into other states. Each state can be handled
   * in one of two schemes: a tokenType map, or a subHandler.
   *
   * Standard expression elements are handled through the tokenType object. This
   * is an object map of all legal token types to encounter in this state (and
   * any unexpected token types will generate a thrown error) to an options
   * object that defines how they're handled.  The available options are:
   *
   *      {string} toState: The name of the state to which to transition
   *          immediately after handling this token
   *      {string} handler: The handler function to call when this token type is
   *          encountered in this state.  If omitted, the default handler
   *          matching the token's "type" property will be called. If the handler
   *          function does not exist, no call will be made and no error will be
   *          generated.  This is useful for tokens whose sole purpose is to
   *          transition to other states.
   *
   * States that consume a subexpression should define a subHandler, the
   * function to be called with an expression tree argument when the
   * subexpression is complete. Completeness is determined through the
   * endStates object, which maps tokens on which an expression should end to the
   * state to which to transition once the subHandler function has been called.
   *
   * Additionally, any state in which it is legal to mark the AST as completed
   * should have a 'completable' property set to boolean true.  Attempting to
   * call {@link Parser#complete} in any state without this property will result
   * in a thrown Error.
   *
   * @type {{}}
   */


  states$1.states = {
    expectOperand: {
      tokenTypes: {
        literal: {
          toState: 'expectBinOp'
        },
        identifier: {
          toState: 'identifier'
        },
        unaryOp: {},
        openParen: {
          toState: 'subExpression'
        },
        openCurl: {
          toState: 'expectObjKey',
          handler: h.objStart
        },
        dot: {
          toState: 'traverse'
        },
        openBracket: {
          toState: 'arrayVal',
          handler: h.arrayStart
        }
      }
    },
    expectBinOp: {
      tokenTypes: {
        binaryOp: {
          toState: 'expectOperand'
        },
        pipe: {
          toState: 'expectTransform'
        },
        dot: {
          toState: 'traverse'
        },
        question: {
          toState: 'ternaryMid',
          handler: h.ternaryStart
        }
      },
      completable: true
    },
    expectTransform: {
      tokenTypes: {
        identifier: {
          toState: 'postTransform',
          handler: h.transform
        }
      }
    },
    expectObjKey: {
      tokenTypes: {
        identifier: {
          toState: 'expectKeyValSep',
          handler: h.objKey
        },
        closeCurl: {
          toState: 'expectBinOp'
        }
      }
    },
    expectKeyValSep: {
      tokenTypes: {
        colon: {
          toState: 'objVal'
        }
      }
    },
    postTransform: {
      tokenTypes: {
        openParen: {
          toState: 'argVal'
        },
        binaryOp: {
          toState: 'expectOperand'
        },
        dot: {
          toState: 'traverse'
        },
        openBracket: {
          toState: 'filter'
        },
        pipe: {
          toState: 'expectTransform'
        }
      },
      completable: true
    },
    postArgs: {
      tokenTypes: {
        binaryOp: {
          toState: 'expectOperand'
        },
        dot: {
          toState: 'traverse'
        },
        openBracket: {
          toState: 'filter'
        },
        pipe: {
          toState: 'expectTransform'
        }
      },
      completable: true
    },
    identifier: {
      tokenTypes: {
        binaryOp: {
          toState: 'expectOperand'
        },
        dot: {
          toState: 'traverse'
        },
        openBracket: {
          toState: 'filter'
        },
        openParen: {
          toState: 'argVal',
          handler: h.functionCall
        },
        pipe: {
          toState: 'expectTransform'
        },
        question: {
          toState: 'ternaryMid',
          handler: h.ternaryStart
        }
      },
      completable: true
    },
    traverse: {
      tokenTypes: {
        identifier: {
          toState: 'identifier'
        }
      }
    },
    filter: {
      subHandler: h.filter,
      endStates: {
        closeBracket: 'identifier'
      }
    },
    subExpression: {
      subHandler: h.subExpression,
      endStates: {
        closeParen: 'expectBinOp'
      }
    },
    argVal: {
      subHandler: h.argVal,
      endStates: {
        comma: 'argVal',
        closeParen: 'postArgs'
      }
    },
    objVal: {
      subHandler: h.objVal,
      endStates: {
        comma: 'expectObjKey',
        closeCurl: 'expectBinOp'
      }
    },
    arrayVal: {
      subHandler: h.arrayVal,
      endStates: {
        comma: 'arrayVal',
        closeBracket: 'expectBinOp'
      }
    },
    ternaryMid: {
      subHandler: h.ternaryMid,
      endStates: {
        colon: 'ternaryEnd'
      }
    },
    ternaryEnd: {
      subHandler: h.ternaryEnd,
      completable: true
    }
  };

  var _interopRequireDefault$d = interopRequireDefault;

  var _classCallCheck2$4 = _interopRequireDefault$d(classCallCheck$1);

  var _createClass2$4 = _interopRequireDefault$d(createClass$1);

  /*
   * Jexl
   * Copyright 2020 Tom Shawver
   */
  var handlers = handlers$1;

  var states = states$1.states;
  /**
   * The Parser is a state machine that converts tokens from the {@link Lexer}
   * into an Abstract Syntax Tree (AST), capable of being evaluated in any
   * context by the {@link Evaluator}.  The Parser expects that all tokens
   * provided to it are legal and typed properly according to the grammar, but
   * accepts that the tokens may still be in an invalid order or in some other
   * unparsable configuration that requires it to throw an Error.
   * @param {{}} grammar The grammar object to use to parse Jexl strings
   * @param {string} [prefix] A string prefix to prepend to the expression string
   *      for error messaging purposes.  This is useful for when a new Parser is
   *      instantiated to parse an subexpression, as the parent Parser's
   *      expression string thus far can be passed for a more user-friendly
   *      error message.
   * @param {{}} [stopMap] A mapping of token types to any truthy value. When the
   *      token type is encountered, the parser will return the mapped value
   *      instead of boolean false.
   */


  var Parser$1 = /*#__PURE__*/function () {
    function Parser(grammar, prefix, stopMap) {
      (0, _classCallCheck2$4.default)(this, Parser);
      this._grammar = grammar;
      this._state = 'expectOperand';
      this._tree = null;
      this._exprStr = prefix || '';
      this._relative = false;
      this._stopMap = stopMap || {};
    }
    /**
     * Processes a new token into the AST and manages the transitions of the state
     * machine.
     * @param {{type: <string>}} token A token object, as provided by the
     *      {@link Lexer#tokenize} function.
     * @throws {Error} if a token is added when the Parser has been marked as
     *      complete by {@link #complete}, or if an unexpected token type is added.
     * @returns {boolean|*} the stopState value if this parser encountered a token
     *      in the stopState mapb false if tokens can continue.
     */


    (0, _createClass2$4.default)(Parser, [{
      key: "addToken",
      value: function addToken(token) {
        if (this._state === 'complete') {
          throw new Error('Cannot add a new token to a completed Parser');
        }

        var state = states[this._state];
        var startExpr = this._exprStr;
        this._exprStr += token.raw;

        if (state.subHandler) {
          if (!this._subParser) {
            this._startSubExpression(startExpr);
          }

          var stopState = this._subParser.addToken(token);

          if (stopState) {
            this._endSubExpression();

            if (this._parentStop) return stopState;
            this._state = stopState;
          }
        } else if (state.tokenTypes[token.type]) {
          var typeOpts = state.tokenTypes[token.type];
          var handleFunc = handlers[token.type];

          if (typeOpts.handler) {
            handleFunc = typeOpts.handler;
          }

          if (handleFunc) {
            handleFunc.call(this, token);
          }

          if (typeOpts.toState) {
            this._state = typeOpts.toState;
          }
        } else if (this._stopMap[token.type]) {
          return this._stopMap[token.type];
        } else {
          throw new Error("Token ".concat(token.raw, " (").concat(token.type, ") unexpected in expression: ").concat(this._exprStr));
        }

        return false;
      }
      /**
       * Processes an array of tokens iteratively through the {@link #addToken}
       * function.
       * @param {Array<{type: <string>}>} tokens An array of tokens, as provided by
       *      the {@link Lexer#tokenize} function.
       */

    }, {
      key: "addTokens",
      value: function addTokens(tokens) {
        tokens.forEach(this.addToken, this);
      }
      /**
       * Marks this Parser instance as completed and retrieves the full AST.
       * @returns {{}|null} a full expression tree, ready for evaluation by the
       *      {@link Evaluator#eval} function, or null if no tokens were passed to
       *      the parser before complete was called
       * @throws {Error} if the parser is not in a state where it's legal to end
       *      the expression, indicating that the expression is incomplete
       */

    }, {
      key: "complete",
      value: function complete() {
        if (this._cursor && !states[this._state].completable) {
          throw new Error("Unexpected end of expression: ".concat(this._exprStr));
        }

        if (this._subParser) {
          this._endSubExpression();
        }

        this._state = 'complete';
        return this._cursor ? this._tree : null;
      }
      /**
       * Indicates whether the expression tree contains a relative path identifier.
       * @returns {boolean} true if a relative identifier exists false otherwise.
       */

    }, {
      key: "isRelative",
      value: function isRelative() {
        return this._relative;
      }
      /**
       * Ends a subexpression by completing the subParser and passing its result
       * to the subHandler configured in the current state.
       * @private
       */

    }, {
      key: "_endSubExpression",
      value: function _endSubExpression() {
        states[this._state].subHandler.call(this, this._subParser.complete());

        this._subParser = null;
      }
      /**
       * Places a new tree node at the current position of the cursor (to the 'right'
       * property) and then advances the cursor to the new node. This function also
       * handles setting the parent of the new node.
       * @param {{type: <string>}} node A node to be added to the AST
       * @private
       */

    }, {
      key: "_placeAtCursor",
      value: function _placeAtCursor(node) {
        if (!this._cursor) {
          this._tree = node;
        } else {
          this._cursor.right = node;

          this._setParent(node, this._cursor);
        }

        this._cursor = node;
      }
      /**
       * Places a tree node before the current position of the cursor, replacing
       * the node that the cursor currently points to. This should only be called in
       * cases where the cursor is known to exist, and the provided node already
       * contains a pointer to what's at the cursor currently.
       * @param {{type: <string>}} node A node to be added to the AST
       * @private
       */

    }, {
      key: "_placeBeforeCursor",
      value: function _placeBeforeCursor(node) {
        this._cursor = this._cursor._parent;

        this._placeAtCursor(node);
      }
      /**
       * Sets the parent of a node by creating a non-enumerable _parent property
       * that points to the supplied parent argument.
       * @param {{type: <string>}} node A node of the AST on which to set a new
       *      parent
       * @param {{type: <string>}} parent An existing node of the AST to serve as the
       *      parent of the new node
       * @private
       */

    }, {
      key: "_setParent",
      value: function _setParent(node, parent) {
        Object.defineProperty(node, '_parent', {
          value: parent,
          writable: true
        });
      }
      /**
       * Prepares the Parser to accept a subexpression by (re)instantiating the
       * subParser.
       * @param {string} [exprStr] The expression string to prefix to the new Parser
       * @private
       */

    }, {
      key: "_startSubExpression",
      value: function _startSubExpression(exprStr) {
        var endStates = states[this._state].endStates;

        if (!endStates) {
          this._parentStop = true;
          endStates = this._stopMap;
        }

        this._subParser = new Parser(this._grammar, exprStr, endStates);
      }
    }]);
    return Parser;
  }();

  var Parser_1 = Parser$1;

  var _interopRequireDefault$c = interopRequireDefault;

  var _classCallCheck2$3 = _interopRequireDefault$c(classCallCheck$1);

  var _createClass2$3 = _interopRequireDefault$c(createClass$1);

  /*
   * Jexl
   * Copyright 2020 Tom Shawver
   */
  var PromiseSync$1 = /*#__PURE__*/function () {
    function PromiseSync(fn) {
      (0, _classCallCheck2$3.default)(this, PromiseSync);
      fn(this._resolve.bind(this), this._reject.bind(this));
    }

    (0, _createClass2$3.default)(PromiseSync, [{
      key: "catch",
      value: function _catch(rejected) {
        if (this.error) {
          try {
            this._resolve(rejected(this.error));
          } catch (e) {
            this._reject(e);
          }
        }

        return this;
      }
    }, {
      key: "then",
      value: function then(resolved, rejected) {
        if (!this.error) {
          try {
            this._resolve(resolved(this.value));
          } catch (e) {
            this._reject(e);
          }
        }

        if (rejected) this.catch(rejected);
        return this;
      }
    }, {
      key: "_reject",
      value: function _reject(error) {
        this.value = undefined;
        this.error = error;
      }
    }, {
      key: "_resolve",
      value: function _resolve(val) {
        if (val instanceof PromiseSync) {
          if (val.error) {
            this._reject(val.error);
          } else {
            this._resolve(val.value);
          }
        } else {
          this.value = val;
          this.error = undefined;
        }
      }
    }]);
    return PromiseSync;
  }();

  PromiseSync$1.all = function (vals) {
    return new PromiseSync$1(function (resolve) {
      var resolved = vals.map(function (val) {
        while (val instanceof PromiseSync$1) {
          if (val.error) throw Error(val.error);
          val = val.value;
        }

        return val;
      });
      resolve(resolved);
    });
  };

  PromiseSync$1.resolve = function (val) {
    return new PromiseSync$1(function (resolve) {
      return resolve(val);
    });
  };

  PromiseSync$1.reject = function (error) {
    return new PromiseSync$1(function (resolve, reject) {
      return reject(error);
    });
  };

  var PromiseSync_1 = PromiseSync$1;

  var _interopRequireDefault$b = interopRequireDefault;

  var _classCallCheck2$2 = _interopRequireDefault$b(classCallCheck$1);

  var _createClass2$2 = _interopRequireDefault$b(createClass$1);

  /*
   * Jexl
   * Copyright 2020 Tom Shawver
   */
  var Evaluator = Evaluator_1;

  var Lexer = Lexer_1;

  var Parser = Parser_1;

  var PromiseSync = PromiseSync_1;

  var Expression$1 = /*#__PURE__*/function () {
    function Expression(grammar, exprStr) {
      (0, _classCallCheck2$2.default)(this, Expression);
      this._grammar = grammar;
      this._exprStr = exprStr;
      this._ast = null;
    }
    /**
     * Forces a compilation of the expression string that this Expression object
     * was constructed with. This function can be called multiple times; useful
     * if the language elements of the associated Jexl instance change.
     * @returns {Expression} this Expression instance, for convenience
     */


    (0, _createClass2$2.default)(Expression, [{
      key: "compile",
      value: function compile() {
        var lexer = new Lexer(this._grammar);
        var parser = new Parser(this._grammar);
        var tokens = lexer.tokenize(this._exprStr);
        parser.addTokens(tokens);
        this._ast = parser.complete();
        return this;
      }
      /**
       * Asynchronously evaluates the expression within an optional context.
       * @param {Object} [context] A mapping of variables to values, which will be
       *      made accessible to the Jexl expression when evaluating it
       * @returns {Promise<*>} resolves with the result of the evaluation.
       */

    }, {
      key: "eval",
      value: function _eval() {
        var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return this._eval(context, Promise);
      }
      /**
       * Synchronously evaluates the expression within an optional context.
       * @param {Object} [context] A mapping of variables to values, which will be
       *      made accessible to the Jexl expression when evaluating it
       * @returns {*} the result of the evaluation.
       * @throws {*} on error
       */

    }, {
      key: "evalSync",
      value: function evalSync() {
        var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var res = this._eval(context, PromiseSync);

        if (res.error) throw res.error;
        return res.value;
      }
    }, {
      key: "_eval",
      value: function _eval(context, promise) {
        var _this = this;

        return promise.resolve().then(function () {
          var ast = _this._getAst();

          var evaluator = new Evaluator(_this._grammar, context, undefined, promise);
          return evaluator.eval(ast);
        });
      }
    }, {
      key: "_getAst",
      value: function _getAst() {
        if (!this._ast) this.compile();
        return this._ast;
      }
    }]);
    return Expression;
  }();

  var Expression_1 = Expression$1;

  var grammar = {};

  /*
   * Jexl
   * Copyright 2020 Tom Shawver
   */

  /* eslint eqeqeq:0 */
  grammar.getGrammar = function () {
    return {
      /**
       * A map of all expression elements to their properties. Note that changes
       * here may require changes in the Lexer or Parser.
       * @type {{}}
       */
      elements: {
        '.': {
          type: 'dot'
        },
        '[': {
          type: 'openBracket'
        },
        ']': {
          type: 'closeBracket'
        },
        '|': {
          type: 'pipe'
        },
        '{': {
          type: 'openCurl'
        },
        '}': {
          type: 'closeCurl'
        },
        ':': {
          type: 'colon'
        },
        ',': {
          type: 'comma'
        },
        '(': {
          type: 'openParen'
        },
        ')': {
          type: 'closeParen'
        },
        '?': {
          type: 'question'
        },
        '+': {
          type: 'binaryOp',
          precedence: 30,
          eval: function _eval(left, right) {
            return left + right;
          }
        },
        '-': {
          type: 'binaryOp',
          precedence: 30,
          eval: function _eval(left, right) {
            return left - right;
          }
        },
        '*': {
          type: 'binaryOp',
          precedence: 40,
          eval: function _eval(left, right) {
            return left * right;
          }
        },
        '/': {
          type: 'binaryOp',
          precedence: 40,
          eval: function _eval(left, right) {
            return left / right;
          }
        },
        '//': {
          type: 'binaryOp',
          precedence: 40,
          eval: function _eval(left, right) {
            return Math.floor(left / right);
          }
        },
        '%': {
          type: 'binaryOp',
          precedence: 50,
          eval: function _eval(left, right) {
            return left % right;
          }
        },
        '^': {
          type: 'binaryOp',
          precedence: 50,
          eval: function _eval(left, right) {
            return Math.pow(left, right);
          }
        },
        '==': {
          type: 'binaryOp',
          precedence: 20,
          eval: function _eval(left, right) {
            return left == right;
          }
        },
        '!=': {
          type: 'binaryOp',
          precedence: 20,
          eval: function _eval(left, right) {
            return left != right;
          }
        },
        '>': {
          type: 'binaryOp',
          precedence: 20,
          eval: function _eval(left, right) {
            return left > right;
          }
        },
        '>=': {
          type: 'binaryOp',
          precedence: 20,
          eval: function _eval(left, right) {
            return left >= right;
          }
        },
        '<': {
          type: 'binaryOp',
          precedence: 20,
          eval: function _eval(left, right) {
            return left < right;
          }
        },
        '<=': {
          type: 'binaryOp',
          precedence: 20,
          eval: function _eval(left, right) {
            return left <= right;
          }
        },
        '&&': {
          type: 'binaryOp',
          precedence: 10,
          evalOnDemand: function evalOnDemand(left, right) {
            return left.eval().then(function (leftVal) {
              if (!leftVal) return leftVal;
              return right.eval();
            });
          }
        },
        '||': {
          type: 'binaryOp',
          precedence: 10,
          evalOnDemand: function evalOnDemand(left, right) {
            return left.eval().then(function (leftVal) {
              if (leftVal) return leftVal;
              return right.eval();
            });
          }
        },
        in: {
          type: 'binaryOp',
          precedence: 20,
          eval: function _eval(left, right) {
            if (typeof right === 'string') {
              return right.indexOf(left) !== -1;
            }

            if (Array.isArray(right)) {
              return right.some(function (elem) {
                return elem === left;
              });
            }

            return false;
          }
        },
        '!': {
          type: 'unaryOp',
          precedence: Infinity,
          eval: function _eval(right) {
            return !right;
          }
        }
      },

      /**
       * A map of function names to javascript functions. A Jexl function
       * takes zero ore more arguemnts:
       *
       *     - {*} ...args: A variable number of arguments passed to this function.
       *       All of these are pre-evaluated to their actual values before calling
       *       the function.
       *
       * The Jexl function should return either the transformed value, or
       * a Promises/A+ Promise object that resolves with the value and rejects
       * or throws only when an unrecoverable error occurs. Functions should
       * generally return undefined when they don't make sense to be used on the
       * given value type, rather than throw/reject. An error is only
       * appropriate when the function would normally return a value, but
       * cannot due to some other failure.
       */
      functions: {},

      /**
       * A map of transform names to transform functions. A transform function
       * takes one ore more arguemnts:
       *
       *     - {*} val: A value to be transformed
       *     - {*} ...args: A variable number of arguments passed to this transform.
       *       All of these are pre-evaluated to their actual values before calling
       *       the function.
       *
       * The transform function should return either the transformed value, or
       * a Promises/A+ Promise object that resolves with the value and rejects
       * or throws only when an unrecoverable error occurs. Transforms should
       * generally return undefined when they don't make sense to be used on the
       * given value type, rather than throw/reject. An error is only
       * appropriate when the transform would normally return a value, but
       * cannot due to some other failure.
       */
      transforms: {}
    };
  };

  var _interopRequireDefault$a = interopRequireDefault;

  var _defineProperty2$1 = _interopRequireDefault$a(defineProperty);

  var _classCallCheck2$1 = _interopRequireDefault$a(classCallCheck$1);

  var _createClass2$1 = _interopRequireDefault$a(createClass$1);

  /*
   * Jexl
   * Copyright 2020 Tom Shawver
   */
  var Expression = Expression_1;

  var _require = grammar,
      getGrammar = _require.getGrammar;
  /**
   * Jexl is the Javascript Expression Language, capable of parsing and
   * evaluating basic to complex expression strings, combined with advanced
   * xpath-like drilldown into native Javascript objects.
   * @constructor
   */


  var Jexl = /*#__PURE__*/function () {
    function Jexl() {
      (0, _classCallCheck2$1.default)(this, Jexl);
      // Allow expr to be called outside of the jexl context
      this.expr = this.expr.bind(this);
      this._grammar = getGrammar();
    }
    /**
     * Adds a binary operator to Jexl at the specified precedence. The higher the
     * precedence, the earlier the operator is applied in the order of operations.
     * For example, * has a higher precedence than +, because multiplication comes
     * before division.
     *
     * Please see grammar.js for a listing of all default operators and their
     * precedence values in order to choose the appropriate precedence for the
     * new operator.
     * @param {string} operator The operator string to be added
     * @param {number} precedence The operator's precedence
     * @param {function} fn A function to run to calculate the result. The function
     *      will be called with two arguments: left and right, denoting the values
     *      on either side of the operator. It should return either the resulting
     *      value, or a Promise that resolves with the resulting value.
     * @param {boolean} [manualEval] If true, the `left` and `right` arguments
     *      will be wrapped in objects with an `eval` function. Calling
     *      left.eval() or right.eval() will return a promise that resolves to
     *      that operand's actual value. This is useful to conditionally evaluate
     *      operands.
     */


    (0, _createClass2$1.default)(Jexl, [{
      key: "addBinaryOp",
      value: function addBinaryOp(operator, precedence, fn, manualEval) {
        this._addGrammarElement(operator, (0, _defineProperty2$1.default)({
          type: 'binaryOp',
          precedence: precedence
        }, manualEval ? 'evalOnDemand' : 'eval', fn));
      }
      /**
       * Adds or replaces an expression function in this Jexl instance.
       * @param {string} name The name of the expression function, as it will be
       *      used within Jexl expressions
       * @param {function} fn The javascript function to be executed when this
       *      expression function is invoked. It will be provided with each argument
       *      supplied in the expression, in the same order.
       */

    }, {
      key: "addFunction",
      value: function addFunction(name, fn) {
        this._grammar.functions[name] = fn;
      }
      /**
       * Syntactic sugar for calling {@link #addFunction} repeatedly. This function
       * accepts a map of one or more expression function names to their javascript
       * function counterpart.
       * @param {{}} map A map of expression function names to javascript functions
       */

    }, {
      key: "addFunctions",
      value: function addFunctions(map) {
        for (var key in map) {
          this._grammar.functions[key] = map[key];
        }
      }
      /**
       * Adds a unary operator to Jexl. Unary operators are currently only supported
       * on the left side of the value on which it will operate.
       * @param {string} operator The operator string to be added
       * @param {function} fn A function to run to calculate the result. The function
       *      will be called with one argument: the literal value to the right of the
       *      operator. It should return either the resulting value, or a Promise
       *      that resolves with the resulting value.
       */

    }, {
      key: "addUnaryOp",
      value: function addUnaryOp(operator, fn) {
        this._addGrammarElement(operator, {
          type: 'unaryOp',
          weight: Infinity,
          eval: fn
        });
      }
      /**
       * Adds or replaces a transform function in this Jexl instance.
       * @param {string} name The name of the transform function, as it will be used
       *      within Jexl expressions
       * @param {function} fn The function to be executed when this transform is
       *      invoked. It will be provided with at least one argument:
       *          - {*} value: The value to be transformed
       *          - {...*} args: The arguments for this transform
       */

    }, {
      key: "addTransform",
      value: function addTransform(name, fn) {
        this._grammar.transforms[name] = fn;
      }
      /**
       * Syntactic sugar for calling {@link #addTransform} repeatedly.  This function
       * accepts a map of one or more transform names to their transform function.
       * @param {{}} map A map of transform names to transform functions
       */

    }, {
      key: "addTransforms",
      value: function addTransforms(map) {
        for (var key in map) {
          this._grammar.transforms[key] = map[key];
        }
      }
      /**
       * Creates an Expression object from the given Jexl expression string, and
       * immediately compiles it. The returned Expression object can then be
       * evaluated multiple times with new contexts, without generating any
       * additional string processing overhead.
       * @param {string} expression The Jexl expression to be compiled
       * @returns {Expression} The compiled Expression object
       */

    }, {
      key: "compile",
      value: function compile(expression) {
        var exprObj = this.createExpression(expression);
        return exprObj.compile();
      }
      /**
       * Constructs an Expression object from a Jexl expression string.
       * @param {string} expression The Jexl expression to be wrapped in an
       *    Expression object
       * @returns {Expression} The Expression object representing the given string
       */

    }, {
      key: "createExpression",
      value: function createExpression(expression) {
        return new Expression(this._grammar, expression);
      }
      /**
       * Retrieves a previously set expression function.
       * @param {string} name The name of the expression function
       * @returns {function} The expression function
       */

    }, {
      key: "getFunction",
      value: function getFunction(name) {
        return this._grammar.functions[name];
      }
      /**
       * Retrieves a previously set transform function.
       * @param {string} name The name of the transform function
       * @returns {function} The transform function
       */

    }, {
      key: "getTransform",
      value: function getTransform(name) {
        return this._grammar.transforms[name];
      }
      /**
       * Asynchronously evaluates a Jexl string within an optional context.
       * @param {string} expression The Jexl expression to be evaluated
       * @param {Object} [context] A mapping of variables to values, which will be
       *      made accessible to the Jexl expression when evaluating it
       * @returns {Promise<*>} resolves with the result of the evaluation.
       */

    }, {
      key: "eval",
      value: function _eval(expression) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var exprObj = this.createExpression(expression);
        return exprObj.eval(context);
      }
      /**
       * Synchronously evaluates a Jexl string within an optional context.
       * @param {string} expression The Jexl expression to be evaluated
       * @param {Object} [context] A mapping of variables to values, which will be
       *      made accessible to the Jexl expression when evaluating it
       * @returns {*} the result of the evaluation.
       * @throws {*} on error
       */

    }, {
      key: "evalSync",
      value: function evalSync(expression) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var exprObj = this.createExpression(expression);
        return exprObj.evalSync(context);
      }
      /**
       * A JavaScript template literal to allow expressions to be defined by the
       * syntax: expr`40 + 2`
       * @param {Array<string>} strs
       * @param  {...any} args
       */

    }, {
      key: "expr",
      value: function expr(strs) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var exprStr = strs.reduce(function (acc, str, idx) {
          var arg = idx < args.length ? args[idx] : '';
          acc += str + arg;
          return acc;
        }, '');
        return this.createExpression(exprStr);
      }
      /**
       * Removes a binary or unary operator from the Jexl grammar.
       * @param {string} operator The operator string to be removed
       */

    }, {
      key: "removeOp",
      value: function removeOp(operator) {
        if (this._grammar.elements[operator] && (this._grammar.elements[operator].type === 'binaryOp' || this._grammar.elements[operator].type === 'unaryOp')) {
          delete this._grammar.elements[operator];
        }
      }
      /**
       * Adds an element to the grammar map used by this Jexl instance.
       * @param {string} str The key string to be added
       * @param {{type: <string>}} obj A map of configuration options for this
       *      grammar element
       * @private
       */

    }, {
      key: "_addGrammarElement",
      value: function _addGrammarElement(str, obj) {
        this._grammar.elements[str] = obj;
      }
    }]);
    return Jexl;
  }();

  Jexl$1.exports = new Jexl();
  Jexl$1.exports.Jexl = Jexl;

  var _interopRequireDefault$9 = interopRequireDefault$1.exports;

  Object.defineProperty(jexl, "__esModule", {
    value: true
  });
  jexl.default = _default$6;

  var _jexl$1 = _interopRequireDefault$9(Jexl$1.exports);

  function
    /* config?: any*/
  _default$6() {
    var j = new _jexl$1.default.Jexl(); // someday will make sure all of configs callbacks are added in, including
    // ones passed in
    // below are core functions

    j.addFunction('get', function (feature, data) {
      return feature.get(data);
    });
    j.addFunction('parent', function (feature) {
      return feature.parent();
    });
    j.addFunction('id', function (feature) {
      return feature.id();
    }); // let user cast a jexl type into a javascript type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    j.addFunction('cast', function (arg) {
      return arg;
    }); // logging

    j.addFunction('log', function (thing) {
      // eslint-disable-next-line no-console
      console.log(thing);
      return thing;
    }); // math
    // addfunction added in jexl 2.3 but types/jexl still on 2.2

    j.addFunction('max', Math.max);
    j.addFunction('min', Math.min);
    j.addFunction('sqrt', Math.sqrt);
    j.addFunction('ceil', Math.ceil);
    j.addFunction('floor', Math.floor);
    j.addFunction('round', Math.round);
    j.addFunction('abs', Math.abs);
    j.addFunction('log10', Math.log10);
    j.addFunction('parseInt', Number.parseInt);
    j.addFunction('parseFloat', Number.parseFloat); // string

    j.addFunction('split', function (str, char) {
      return str.split(char);
    });
    j.addFunction('charAt', function (str, index) {
      return str.charAt(index);
    });
    j.addFunction('charCodeAt', function (str, index) {
      return str.charCodeAt(index);
    });
    j.addFunction('codePointAt', function (str, pos) {
      return str.codePointAt(pos);
    });
    j.addFunction('startsWith', function (str, searchStr, length) {
      return str.startsWith(searchStr, length);
    });
    j.addFunction('endsWith', function (str, searchStr, length) {
      return str.endsWith(searchStr, length);
    });
    j.addFunction('padEnd', function (str, targetLength, padString) {
      return str.padEnd(targetLength, padString);
    });
    j.addFunction('padStart', function (str, targetLength, fillString) {
      return str.padStart(targetLength, fillString);
    });
    j.addFunction('repeat', function (str, count) {
      return str.repeat(count);
    });
    j.addFunction('replace', function (str, match, newSubStr) {
      return str.replace(match, newSubStr);
    });
    j.addFunction('replaceAll', function (str, match, newSubStr) {
      return str.replaceAll(match, newSubStr);
    });
    j.addFunction('slice', function (str, start, end) {
      return str.slice(start, end);
    });
    j.addFunction('startsWith', function (str, searchStr, position) {
      return str.startsWith(searchStr, position);
    });
    j.addFunction('substring', function (str, start, end) {
      return str.substring(start, end);
    });
    j.addFunction('toLowerCase', function (str) {
      return str.toLowerCase();
    });
    j.addFunction('toUpperCase', function (str) {
      return str.toUpperCase();
    });
    j.addFunction('trim', function (str) {
      str.trim();
    });
    j.addFunction('trimEnd', function (str) {
      return str.trimEnd();
    });
    j.addFunction('trimStart', function (str) {
      return str.trimStart();
    });
    j.addFunction('getTag', function (feature, str) {
      var tags = feature.get('tags');
      return tags ? tags[str] : feature.get(str);
    });
    j.addBinaryOp('&', 15, function (a, b) {
      return a & b;
    });
    return j;
  }

  var _interopRequireDefault$8 = interopRequireDefault$1.exports;

  Object.defineProperty(jexlStrings, "__esModule", {
    value: true
  });
  jexlStrings.stringToJexlExpression = stringToJexlExpression;

  var _jexl = _interopRequireDefault$8(jexl);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var compilationCache = {}; // revert function strings back to main, create a different file for jexlStrings.ts
  // pass the jexl property of the pluginManager as a param

  /**
   * compile a jexlExpression to a string
   *
   * @param str - string of code like `jexl:...`
   * @param options -
   */

  function stringToJexlExpression(str, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jexl) {
    var cacheKey = "nosig|".concat(str);

    if (!compilationCache[cacheKey]) {
      var match = str.startsWith('jexl:');

      if (!match) {
        throw new Error('string does not appear to be in jexl format');
      }

      var code = str.split('jexl:')[1];
      var compiled = jexl ? jexl.compile("".concat(code)) : (0, _jexl.default)().compile("".concat(code));
      compilationCache[cacheKey] = compiled;
    }

    return compilationCache[cacheKey];
  }

  var _interopRequireDefault$7 = interopRequireDefault$1.exports;

  Object.defineProperty(configurationSlot, "__esModule", {
    value: true
  });
  configurationSlot.default = ConfigSlot;

  var _typeof2$2 = _interopRequireDefault$7(_typeof$2.exports);

  var _mobxStateTree$3 = require$$4__default["default"];

  var _jexlStrings = jexlStrings;

  var _mst$1 = mst;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  function
    /* str */
  isValidColorString() {
    // TODO: check all the crazy cases for whether it's a valid HTML/CSS color string
    return true;
  }

  var typeModels = {
    stringArray: _mobxStateTree$3.types.array(_mobxStateTree$3.types.string),
    stringArrayMap: _mobxStateTree$3.types.map(_mobxStateTree$3.types.array(_mobxStateTree$3.types.string)),
    numberMap: _mobxStateTree$3.types.map(_mobxStateTree$3.types.number),
    boolean: _mobxStateTree$3.types.boolean,
    color: _mobxStateTree$3.types.refinement('Color', _mobxStateTree$3.types.string, isValidColorString),
    integer: _mobxStateTree$3.types.integer,
    number: _mobxStateTree$3.types.number,
    string: _mobxStateTree$3.types.string,
    text: _mobxStateTree$3.types.string,
    fileLocation: _mst$1.FileLocation,
    frozen: _mobxStateTree$3.types.frozen()
  }; // default values we use if the defaultValue is malformed or does not work

  var fallbackDefaults = {
    stringArray: [],
    stringArrayMap: {},
    numberMap: {},
    boolean: true,
    color: 'black',
    integer: 1,
    number: 1,
    string: '',
    text: '',
    fileLocation: {
      uri: '/path/to/resource.txt',
      locationType: 'UriLocation'
    },
    frozen: {}
  };

  var literalJSON = function literalJSON(self) {
    return {
      views: {
        get valueJSON() {
          return self.value;
        }

      }
    };
  };

  var objectJSON = function objectJSON(self) {
    return {
      views: {
        get valueJSON() {
          return JSON.stringify(self.value);
        }

      }
    };
  }; // custom actions for modifying the value models


  var typeModelExtensions = {
    fileLocation: objectJSON,
    number: literalJSON,
    integer: literalJSON,
    boolean: literalJSON,
    frozen: objectJSON,
    // special actions for working with stringArray slots
    stringArray: function stringArray(self) {
      return {
        views: {
          get valueJSON() {
            return JSON.stringify(self.value);
          }

        },
        actions: {
          add: function add(val) {
            self.value.push(val);
          },
          removeAtIndex: function removeAtIndex(idx) {
            self.value.splice(idx, 1);
          },
          setAtIndex: function setAtIndex(idx, val) {
            self.value[idx] = val;
          }
        }
      };
    },
    stringArrayMap: function stringArrayMap(self) {
      return {
        views: {
          get valueJSON() {
            return JSON.stringify(self.value);
          }

        },
        actions: {
          add: function add(key, val) {
            self.value.set(key, val);
          },
          remove: function remove(key) {
            self.value.delete(key);
          },
          addToKey: function addToKey(key, val) {
            var ar = self.value.get(key);

            if (!ar) {
              throw new Error("".concat(key, " not found"));
            }

            ar.push(val);
          },
          removeAtKeyIndex: function removeAtKeyIndex(key, idx) {
            var ar = self.value.get(key);

            if (!ar) {
              throw new Error("".concat(key, " not found"));
            }

            ar.splice(idx, 1);
          },
          setAtKeyIndex: function setAtKeyIndex(key, idx, val) {
            var ar = self.value.get(key);

            if (!ar) {
              throw new Error("".concat(key, " not found"));
            }

            ar[idx] = val;
          }
        }
      };
    },
    numberMap: function numberMap(self) {
      return {
        views: {
          get valueJSON() {
            return JSON.stringify(self.value);
          }

        },
        actions: {
          add: function add(key, val) {
            self.value.set(key, val);
          },
          remove: function remove(key) {
            self.value.delete(key);
          }
        }
      };
    }
  }; // const FunctionStringType = types.refinement(
  //   'FunctionString',
  //   types.string,
  //   str => functionRegexp.test(str),
  // )

  var JexlStringType = _mobxStateTree$3.types.refinement('JexlString', _mobxStateTree$3.types.string, function (str) {
    return str.startsWith('jexl:');
  });

  /**
   * builds a MST model for a configuration slot
   *
   * @param slotName -
   * @param  definition -
   */
  function ConfigSlot(slotName, _ref) {
    var _ref$description = _ref.description,
        description = _ref$description === void 0 ? '' : _ref$description,
        model = _ref.model,
        type = _ref.type,
        defaultValue = _ref.defaultValue,
        _ref$contextVariable = _ref.contextVariable,
        contextVariable = _ref$contextVariable === void 0 ? [] : _ref$contextVariable;

    if (!type) {
      throw new Error('type name required');
    }

    if (!model) {
      model = typeModels[type];
    }

    if (!model) {
      throw new Error("no builtin config slot type \"".concat(type, "\", and no 'model' param provided"));
    }

    if (defaultValue === undefined) {
      throw new Error("no 'defaultValue' provided");
    } // if the `type` is something like `color`, then the model name
    // here will be `ColorConfigSlot`


    var configSlotModelName = "".concat(slotName.charAt(0).toUpperCase()).concat(slotName.slice(1), "ConfigSlot");

    var slot = _mobxStateTree$3.types.model(configSlotModelName, {
      name: _mobxStateTree$3.types.literal(slotName),
      description: _mobxStateTree$3.types.literal(description),
      type: _mobxStateTree$3.types.literal(type),
      value: _mobxStateTree$3.types.optional(_mobxStateTree$3.types.union(JexlStringType, model), defaultValue)
    }).volatile(function () {
      return {
        contextVariable: contextVariable
      };
    }).views(function (self) {
      return {
        get isCallback() {
          return String(self.value).startsWith('jexl:');
        }

      };
    }).views(function (self) {
      return {
        get expr() {
          if (self.isCallback) {
            // compile as jexl function
            var _getEnv = (0, _mobxStateTree$3.getEnv)(self),
                pluginManager = _getEnv.pluginManager;

            if (!pluginManager && typeof jest === 'undefined') {
              console.warn('no pluginManager detected on config env (if you dynamically instantiate a config, for example in renderProps for your display model, check that you add the env argument)');
            }

            return (0, _jexlStrings.stringToJexlExpression)(String(self.value), pluginManager === null || pluginManager === void 0 ? void 0 : pluginManager.jexl);
          }

          return {
            evalSync: function evalSync() {
              return self.value;
            }
          };
        },

        // JS representation of the value of this slot, suitable
        // for embedding in either JSON or a JS function string.
        // many of the data types override this in typeModelExtensions
        get valueJSON() {
          if (self.isCallback) {
            return undefined;
          }

          function json(value) {
            if (value && value.toJSON) {
              return value.toJSON();
            }

            return "\"".concat(value, "\"");
          }

          return json(self.value);
        }

      };
    }).preProcessSnapshot(function (val) {
      return (0, _typeof2$2.default)(val) === 'object' && val.name === slotName ? val : {
        name: slotName,
        description: description,
        type: type,
        value: val
      };
    }).postProcessSnapshot(function (snap) {
      if ((0, _typeof2$2.default)(snap.value) === 'object') {
        return JSON.stringify(snap.value) !== JSON.stringify(defaultValue) ? snap.value : undefined;
      }

      return snap.value !== defaultValue ? snap.value : undefined;
    }).actions(function (self) {
      return {
        set: function set(newVal) {
          self.value = newVal;
        },
        reset: function reset() {
          self.value = defaultValue;
        },
        convertToCallback: function convertToCallback() {
          if (self.isCallback) {
            return;
          }

          self.value = "jexl:".concat(self.valueJSON || "''");
        },
        convertToValue: function convertToValue() {
          if (!self.isCallback) {
            return;
          } // try calling it with no arguments


          try {
            var funcResult = self.expr.evalSync();

            if (funcResult !== undefined) {
              self.value = funcResult;
              return;
            }
          } catch (e) {
            /* ignore */
          }

          self.value = defaultValue; // if it is still a callback (happens if the defaultValue is a callback),
          // then use the last-resort fallback default
          // if defaultValue has jexl: string, run this part

          if (self.isCallback) {
            if (!(type in fallbackDefaults)) {
              throw new Error("no fallbackDefault defined for type ".concat(type));
            }

            self.value = fallbackDefaults[type];
          }
        }
      };
    }); // if there are any type-specific extensions (views or actions)
    //  to the slot, add those in


    if (typeModelExtensions[type]) {
      slot = slot.extend(typeModelExtensions[type]);
    }

    var completeModel = _mobxStateTree$3.types.optional(slot, {
      name: slotName,
      type: type,
      description: description,
      value: defaultValue
    });

    var m = completeModel;
    Object.defineProperty(m, 'isJBrowseConfigurationSlot', {
      value: true
    });
    return m;
  }

  var util = {};

  var toConsumableArray = {exports: {}};

  var arrayWithoutHoles = {exports: {}};

  (function (module) {
  var arrayLikeToArray = arrayLikeToArray$3.exports;

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return arrayLikeToArray(arr);
  }

  module.exports = _arrayWithoutHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(arrayWithoutHoles));

  var iterableToArray = {exports: {}};

  (function (module) {
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  module.exports = _iterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(iterableToArray));

  var nonIterableSpread = {exports: {}};

  (function (module) {
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  module.exports = _nonIterableSpread, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(nonIterableSpread));

  (function (module) {
  var arrayWithoutHoles$1 = arrayWithoutHoles.exports;

  var iterableToArray$1 = iterableToArray.exports;

  var unsupportedIterableToArray = unsupportedIterableToArray$2.exports;

  var nonIterableSpread$1 = nonIterableSpread.exports;

  function _toConsumableArray(arr) {
    return arrayWithoutHoles$1(arr) || iterableToArray$1(arr) || unsupportedIterableToArray(arr) || nonIterableSpread$1();
  }

  module.exports = _toConsumableArray, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(toConsumableArray));

  var mstReflection = {};

  Object.defineProperty(mstReflection, "__esModule", {
    value: true
  });
  mstReflection.getDefaultValue = getDefaultValue;
  mstReflection.getEnumerationValues = getEnumerationValues;
  mstReflection.getPropertyType = getPropertyType;
  mstReflection.getSubType = getSubType;
  mstReflection.getUnionSubTypes = getUnionSubTypes;
  mstReflection.resolveLateType = resolveLateType;

  var _mobxStateTree$2 = require$$4__default["default"];

  /* eslint-disable no-underscore-dangle */

  /**
   * get the inner type of an MST optional, array, or late type object
   *
   * @param {IModelType} type
   * @returns {IModelType}
   */
  function getSubType(type) {
    var t;

    if ((0, _mobxStateTree$2.isOptionalType)(type)) {
      t = type._subtype || type.type;
    } else if ((0, _mobxStateTree$2.isArrayType)(type) || (0, _mobxStateTree$2.isMapType)(type)) {
      t = type._subtype || type._subType || type.subType;
    } else if (typeof type.getSubType === 'function') {
      return type.getSubType();
    } else {
      throw new TypeError('unsupported mst type');
    }

    if (!t) {
      // debugger
      throw new Error('failed to get subtype');
    }

    return t;
  }
  /**
   * get the array of
   * @param {MST Union Type obj} unionType
   * @returns {Array<IModelType>}
   */


  function getUnionSubTypes(unionType) {
    if (!(0, _mobxStateTree$2.isUnionType)(unionType)) {
      throw new TypeError('not an MST union type');
    }

    var t = unionType._types || unionType.types || getSubType(unionType)._types || getSubType(unionType).types;

    if (!t) {
      // debugger
      throw new Error('failed to extract subtypes from mst union');
    }

    return t;
  }
  /**
   * get the type of one of the properties of the given MST model type
   *
   * @param {IModelType} type
   * @param {string} propertyName
   * @returns {IModelType}
   */


  function getPropertyType(type, propertyName) {
    var propertyType = type.properties[propertyName];
    return propertyType;
  }
  /**
   * get the base type from inside an MST optional type
   * @param {*} type
   */


  function getDefaultValue(type) {
    if (!(0, _mobxStateTree$2.isOptionalType)(type)) {
      throw new TypeError('type must be an optional type');
    }

    return type._defaultValue || type.defaultValue;
  }
  /** get the string values of an MST enumeration type */


  function getEnumerationValues(type) {
    var subtypes = getUnionSubTypes(type); // the subtypes should all be literals with a value member

    return subtypes.map(function (t) {
      return t.value;
    });
  }

  function resolveLateType(maybeLate) {
    if (!(0, _mobxStateTree$2.isUnionType)(maybeLate) && !(0, _mobxStateTree$2.isArrayType)(maybeLate) && (0, _mobxStateTree$2.isLateType)(maybeLate)) {
      return maybeLate.getSubType();
    }

    return maybeLate;
  }

  var _interopRequireDefault$6 = interopRequireDefault$1.exports;

  Object.defineProperty(util, "__esModule", {
    value: true
  });
  util.getConf = getConf;
  util.getTypeNamesFromExplicitlyTypedUnion = getTypeNamesFromExplicitlyTypedUnion;
  util.isBareConfigurationSchemaType = isBareConfigurationSchemaType;
  util.isConfigurationModel = isConfigurationModel;
  util.isConfigurationSchemaType = isConfigurationSchemaType;
  util.isConfigurationSlotType = isConfigurationSlotType;
  util.readConfObject = readConfObject;

  var _typeof2$1 = _interopRequireDefault$6(_typeof$2.exports);

  var _toConsumableArray2 = _interopRequireDefault$6(toConsumableArray.exports);

  var _mobxStateTree$1 = require$$4__default["default"];

  var _mstReflection = mstReflection;

  /**
   * given a configuration model (an instance of a ConfigurationSchema),
   * read the configuration variable at the given path
   *
   * @param model - instance of ConfigurationSchema
   * @param slotPaths - array of paths to read
   * @param args - extra arguments e.g. for a feature callback,
   *  will be sent to each of the slotNames
   */
  function readConfObject(confObject) {
    var slotPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!confObject) {
      throw new TypeError('must provide conf object to read');
    }

    if (!slotPath) {
      return JSON.parse(JSON.stringify((0, _mobxStateTree$1.getSnapshot)(confObject)));
    }

    if (typeof slotPath === 'string') {
      var slot = confObject[slotPath]; // check for the subconf being a map if we don't find it immediately

      if (!slot && (0, _mobxStateTree$1.isStateTreeNode)(confObject) && (0, _mobxStateTree$1.isMapType)((0, _mobxStateTree$1.getType)(confObject))) {
        slot = confObject.get(slotPath);
      }

      if (!slot) {
        return undefined; // if we want to be very strict about config slots, we could uncomment the below
        // instead of returning undefine
        //
        // const modelType = getType(model)
        // const schemaType = model.configuration && getType(model.configuration)
        // throw new Error(
        //   `no slot "${slotName}" found in ${modelType.name} configuration (${
        //     schemaType.name
        //   })`,
        // )
      }

      if (slot.expr) {
        var appliedFunc = slot.expr.evalSync(args);

        if ((0, _mobxStateTree$1.isStateTreeNode)(appliedFunc)) {
          return JSON.parse(JSON.stringify((0, _mobxStateTree$1.getSnapshot)(appliedFunc)));
        }

        return appliedFunc;
      }

      if ((0, _mobxStateTree$1.isStateTreeNode)(slot)) {
        return JSON.parse(JSON.stringify((0, _mobxStateTree$1.getSnapshot)(slot)));
      }

      return slot;
    }

    var slotName = slotPath[0];

    if (slotPath.length > 1) {
      var newPath = slotPath.slice(1);
      var subConf = confObject[slotName]; // check for the subconf being a map if we don't find it immediately

      if (!subConf && (0, _mobxStateTree$1.isStateTreeNode)(confObject) && (0, _mobxStateTree$1.isMapType)((0, _mobxStateTree$1.getType)(confObject))) {
        subConf = confObject.get(slotName);
      }

      if (!subConf) {
        return undefined;
      }

      return readConfObject(subConf, newPath, args);
    }

    return readConfObject(confObject, slotName, args);
  }
  /**
   * helper method for readConfObject, reads the config from a mst model
   *
   * @param model - object containing a 'configuration' member
   * @param slotPaths - array of paths to read
   * @param args - extra arguments e.g. for a feature callback,
   *   will be sent to each of the slotNames
   */


  function getConf(model) {
    var slotPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!model) {
      throw new TypeError('must provide a model object');
    }

    var _ref = model,
        configuration = _ref.configuration;

    if (isConfigurationModel(configuration)) {
      return readConfObject(configuration, slotPath, args);
    }

    throw new TypeError('cannot getConf on this model, it has no configuration');
  }
  /**
   * given a union of explicitly typed configuration schema types,
   * extract an array of the type names contained in the union
   *
   * @param unionType -
   * @returns Array of type names contained in the union
   */


  function getTypeNamesFromExplicitlyTypedUnion(maybeUnionType) {
    if ((0, _mobxStateTree$1.isType)(maybeUnionType)) {
      maybeUnionType = (0, _mstReflection.resolveLateType)(maybeUnionType); // @ts-ignore

      if ((0, _mobxStateTree$1.isUnionType)(maybeUnionType)) {
        var typeNames = [];
        (0, _mstReflection.getUnionSubTypes)(maybeUnionType).forEach(function (type) {
          type = (0, _mstReflection.resolveLateType)(type);
          var typeName = getTypeNamesFromExplicitlyTypedUnion(type);

          if (!typeName.length) {
            var def = (0, _mstReflection.getDefaultValue)(type);
            typeName = [def.type];
          }

          if (!typeName[0]) {
            // debugger
            throw new Error("invalid config schema type ".concat(type));
          }

          typeNames.push.apply(typeNames, (0, _toConsumableArray2.default)(typeName));
        });
        return typeNames;
      }
    }

    return [];
  }

  function isBareConfigurationSchemaType(thing) {
    if ((0, _mobxStateTree$1.isType)(thing)) {
      if ((0, _mobxStateTree$1.isModelType)(thing) && ('isJBrowseConfigurationSchema' in thing || thing.name.includes('ConfigurationSchema'))) {
        return true;
      } // if it's a late type, assume its a config schema


      if ((0, _mobxStateTree$1.isLateType)(thing)) {
        return true;
      }
    }

    return false;
  }

  function isConfigurationSchemaType(thing) {
    if (!(0, _mobxStateTree$1.isType)(thing)) {
      return false;
    } // written as a series of if-statements instead of a big logical OR
    // because this construction gives much better debugging backtraces.
    // also, note that the order of these statements matters, because
    // for example some union types are also optional types


    if (isBareConfigurationSchemaType(thing)) {
      return true;
    }

    if ((0, _mobxStateTree$1.isUnionType)(thing)) {
      return (0, _mstReflection.getUnionSubTypes)(thing).every(function (t) {
        return isConfigurationSchemaType(t) || t.name === 'undefined';
      });
    }

    if ((0, _mobxStateTree$1.isOptionalType)(thing) && isConfigurationSchemaType((0, _mstReflection.getSubType)(thing))) {
      return true;
    }

    if ((0, _mobxStateTree$1.isArrayType)(thing) && isConfigurationSchemaType((0, _mstReflection.getSubType)(thing))) {
      return true;
    }

    if ((0, _mobxStateTree$1.isMapType)(thing) && isConfigurationSchemaType((0, _mstReflection.getSubType)(thing))) {
      return true;
    }

    return false;
  }

  function isConfigurationModel(thing) {
    return (0, _mobxStateTree$1.isStateTreeNode)(thing) && isConfigurationSchemaType((0, _mobxStateTree$1.getType)(thing));
  }

  function isConfigurationSlotType(thing) {
    return (0, _typeof2$1.default)(thing) === 'object' && thing !== null && 'isJBrowseConfigurationSlot' in thing;
  }

  var _interopRequireDefault$5 = interopRequireDefault$1.exports;

  Object.defineProperty(configurationSchema, "__esModule", {
    value: true
  });
  var ConfigurationReference_1 = configurationSchema.ConfigurationReference = ConfigurationReference;
  configurationSchema.ConfigurationSchema = ConfigurationSchema;

  var _slicedToArray2$1 = _interopRequireDefault$5(slicedToArray.exports);

  var _defineProperty2 = _interopRequireDefault$5(defineProperty$1.exports);

  var _typeof2 = _interopRequireDefault$5(_typeof$2.exports);

  var _mobxStateTree = require$$4__default["default"];

  var _mst = mst;

  var _configurationSlot = _interopRequireDefault$5(configurationSlot);

  var _util = util;

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

  function isEmptyObject(thing) {
    return (0, _typeof2.default)(thing) === 'object' && !Array.isArray(thing) && thing !== null && Object.keys(thing).length === 0;
  }

  function isEmptyArray(thing) {
    return Array.isArray(thing) && thing.length === 0;
  }

  function preprocessConfigurationSchemaArguments(modelName, inputSchemaDefinition) {
    var inputOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (typeof modelName !== 'string') {
      throw new Error('first arg must be string name of the model that this config schema goes with');
    } // if we have a base configuration schema that we are
    // extending, grab the slot definitions from that


    var schemaDefinition = inputSchemaDefinition;
    var options = inputOptions;

    if (inputOptions.baseConfiguration && inputOptions.baseConfiguration.jbrowseSchemaDefinition) {
      schemaDefinition = _objectSpread(_objectSpread({}, inputOptions.baseConfiguration.jbrowseSchemaDefinition), schemaDefinition);
      options = _objectSpread(_objectSpread({}, inputOptions.baseConfiguration.jbrowseSchemaOptions || {}), inputOptions);
      delete options.baseConfiguration;
    }

    return {
      schemaDefinition: schemaDefinition,
      options: options
    };
  }

  function makeConfigurationSchemaModel(modelName, schemaDefinition, options) {
    // now assemble the MST model of the configuration schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var modelDefinition = {};
    var identifier;

    if (options.explicitlyTyped) {
      modelDefinition.type = _mobxStateTree.types.optional(_mobxStateTree.types.literal(modelName), modelName);
    }

    if (options.explicitIdentifier && options.implicitIdentifier) {
      throw new Error("Cannot have both explicit and implicit identifiers in ".concat(modelName));
    }

    if (options.explicitIdentifier) {
      if (typeof options.explicitIdentifier === 'string') {
        modelDefinition[options.explicitIdentifier] = _mobxStateTree.types.identifier;
        identifier = options.explicitIdentifier;
      } else {
        modelDefinition.id = _mobxStateTree.types.identifier;
        identifier = 'id';
      }
    } else if (options.implicitIdentifier) {
      if (typeof options.implicitIdentifier === 'string') {
        modelDefinition[options.implicitIdentifier] = _mst.ElementId;
        identifier = options.implicitIdentifier;
      } else {
        modelDefinition.id = _mst.ElementId;
        identifier = 'id';
      }
    } // eslint-disable-next-line @typescript-eslint/no-explicit-any


    var volatileConstants = {
      isJBrowseConfigurationSchema: true,
      jbrowseSchema: {
        modelName: modelName,
        definition: schemaDefinition,
        options: options
      }
    };
    Object.entries(schemaDefinition).forEach(function (_ref) {
      var _ref2 = (0, _slicedToArray2$1.default)(_ref, 2),
          slotName = _ref2[0],
          slotDefinition = _ref2[1];

      if ((0, _mobxStateTree.isType)(slotDefinition) && (0, _mobxStateTree.isLateType)(slotDefinition) || (0, _util.isConfigurationSchemaType)(slotDefinition)) {
        // this is either an MST late() type (which we assume to be a sub-configuration),
        // or an actual sub-configuration
        modelDefinition[slotName] = slotDefinition;
      } else if (typeof slotDefinition === 'string' || typeof slotDefinition === 'number') {
        volatileConstants[slotName] = slotDefinition;
      } else if ((0, _typeof2.default)(slotDefinition) === 'object') {
        // this is a slot definition
        if (!slotDefinition.type) {
          throw new Error("no type set for config slot ".concat(modelName, ".").concat(slotName));
        }

        try {
          modelDefinition[slotName] = (0, _configurationSlot.default)(slotName, slotDefinition);
        } catch (e) {
          throw new Error("invalid config slot definition for ".concat(modelName, ".").concat(slotName, ": ").concat(e));
        }
      } else {
        throw new Error("invalid configuration schema definition, \"".concat(slotName, "\" must be either a valid configuration slot definition, a constant, or a nested configuration schema"));
      }
    });

    var completeModel = _mobxStateTree.types.model("".concat(modelName, "ConfigurationSchema"), modelDefinition).actions(function (self) {
      return {
        setSubschema: function setSubschema(slotName, data) {
          if (!(0, _util.isConfigurationSchemaType)(modelDefinition[slotName])) {
            throw new Error("".concat(slotName, " is not a subschema, cannot replace"));
          }

          var newSchema = (0, _mobxStateTree.isStateTreeNode)(data) ? data : modelDefinition[slotName].create(data);
          self[slotName] = newSchema;
          return newSchema;
        }
      };
    });

    if (Object.keys(volatileConstants).length) {
      completeModel = completeModel.volatile(function
        /* self */
      () {
        return volatileConstants;
      });
    }

    if (options.actions) {
      completeModel = completeModel.actions(options.actions);
    }

    if (options.views) {
      completeModel = completeModel.views(options.views);
    }

    if (options.extend) {
      completeModel = completeModel.extend(options.extend);
    }

    var identifierDefault = identifier ? (0, _defineProperty2.default)({}, identifier, 'placeholderId') : {};
    var modelDefault = options.explicitlyTyped ? _objectSpread({
      type: modelName
    }, identifierDefault) : identifierDefault;
    var defaultSnap = (0, _mobxStateTree.getSnapshot)(completeModel.create(modelDefault));
    completeModel = completeModel.postProcessSnapshot(function (snap) {
      var newSnap = {};
      var matchesDefault = true; // let keyCount = 0

      for (var _i = 0, _Object$entries = Object.entries(snap); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = (0, _slicedToArray2$1.default)(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            value = _Object$entries$_i[1];

        if (matchesDefault) {
          if ((0, _typeof2.default)(defaultSnap[key]) === 'object' && (0, _typeof2.default)(value) === 'object') {
            if (JSON.stringify(defaultSnap[key]) !== JSON.stringify(value)) {
              matchesDefault = false;
            }
          } else if (defaultSnap[key] !== value) {
            matchesDefault = false;
          }
        }

        if (value !== undefined && volatileConstants[key] === undefined && !isEmptyObject(value) && !isEmptyArray(value)) {
          // keyCount += 1
          newSnap[key] = value;
        }
      }

      if (matchesDefault) {
        return {};
      }

      return newSnap;
    });

    if (options.preProcessSnapshot) {
      completeModel = completeModel.preProcessSnapshot(options.preProcessSnapshot);
    }

    return _mobxStateTree.types.optional(completeModel, modelDefault);
  }

  function ConfigurationSchema(modelName, inputSchemaDefinition, inputOptions) {
    var _preprocessConfigurat = preprocessConfigurationSchemaArguments(modelName, inputSchemaDefinition, inputOptions),
        schemaDefinition = _preprocessConfigurat.schemaDefinition,
        options = _preprocessConfigurat.options;

    var schemaType = makeConfigurationSchemaModel(modelName, schemaDefinition, options); // saving a couple of jbrowse-specific things in the type object. hope nobody gets mad.

    schemaType.isJBrowseConfigurationSchema = true;
    schemaType.jbrowseSchemaDefinition = schemaDefinition;
    schemaType.jbrowseSchemaOptions = options;
    return schemaType;
  }

  function ConfigurationReference(schemaType) {
    return _mobxStateTree.types.union(_mobxStateTree.types.reference(schemaType), schemaType);
  }

  var FilterList$1 = {};

  function _typeof$1(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof_1 = _typeof$1 = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof_1 = _typeof$1 = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof$1(obj);
  }

  var _typeof_1 = _typeof$1;

  var _typeof = _typeof_1;

  function _getRequireWildcardCache() {
    if (typeof WeakMap !== "function") return null;
    var cache = new WeakMap();

    _getRequireWildcardCache = function _getRequireWildcardCache() {
      return cache;
    };

    return cache;
  }

  function _interopRequireWildcard$4(obj) {
    if (obj && obj.__esModule) {
      return obj;
    }

    if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
      return {
        "default": obj
      };
    }

    var cache = _getRequireWildcardCache();

    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }

    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }

    newObj["default"] = obj;

    if (cache) {
      cache.set(obj, newObj);
    }

    return newObj;
  }

  var interopRequireWildcard = _interopRequireWildcard$4;

  var createSvgIcon = {};

  (function (exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function get() {
      return _utils.createSvgIcon;
    }
  });

  var _utils = require$$0__default["default"];
  }(createSvgIcon));

  var _interopRequireDefault$4 = interopRequireDefault;

  var _interopRequireWildcard$3 = interopRequireWildcard;

  Object.defineProperty(FilterList$1, "__esModule", {
    value: true
  });
  var default_1$4 = FilterList$1.default = void 0;

  var React$3 = _interopRequireWildcard$3(React__default["default"]);

  var _createSvgIcon$3 = _interopRequireDefault$4(createSvgIcon);

  var _default$5 = (0, _createSvgIcon$3.default)( /*#__PURE__*/React$3.createElement("path", {
    d: "M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"
  }), 'FilterList');

  default_1$4 = FilterList$1.default = _default$5;

  function stateModelFactory$1(configSchema, pluginManager) {
    var LGVPlugin = pluginManager.getPlugin('LinearGenomeViewPlugin'); // @ts-ignore

    var BaseLinearDisplay = LGVPlugin.exports.BaseLinearDisplay;
    return require$$4.types.compose('LinearICGCDisplay', BaseLinearDisplay, require$$4.types.model({
      type: require$$4.types.literal('LinearICGCDisplay'),
      configuration: ConfigurationReference_1(configSchema)
    })).actions(function (self) {
      return {
        openFilterConfig: function openFilterConfig() {
          var session = util$1.getSession(self); // @ts-ignore

          var editor = session.addWidget('ICGCFilterWidget', 'icgcFilter', {
            target: self.parentTrack.configuration
          }); // @ts-ignore

          session.showWidget(editor);
        },
        selectFeature: function selectFeature(feature) {
          if (feature) {
            var session = util$1.getSession(self); // @ts-ignore

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
          return _objectSpread2(_objectSpread2(_objectSpread2({}, superRenderProps()), tracks.getParentRenderProps(self)), {}, {
            displayModel: self,
            config: self.configuration.renderer
          });
        },

        get rendererTypeName() {
          return self.configuration.renderer.type;
        },

        trackMenuItems: function trackMenuItems() {
          return [].concat(_toConsumableArray$1(superTrackMenuItems()), [{
            label: 'Filter',
            onClick: self.openFilterConfig,
            icon: default_1$4
          }]);
        }
      };
    });
  }

  var configSchema = /*#__PURE__*/configuration.ConfigurationSchema('GDCFeatureWidget', {});
  function stateModelFactory(pluginManager) {
    var stateModel = require$$4.types.model('ICGCFeatureWidget', {
      id: mst$1.ElementId,
      type: require$$4.types.literal('ICGCFeatureWidget'),
      featureData: require$$4.types.frozen({}),
      view: require$$4.types.safeReference(pluginManager.pluggableMstType('view', 'stateModel'))
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

  var useStyles$2 = /*#__PURE__*/core.makeStyles(function () {
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

  var Transcript = /*#__PURE__*/require$$6.observer(function (props) {
    var id = props.id,
        functionalImpact = props.functionalImpact,
        consequenceType = props.consequenceType;
    return /*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment, null, /*#__PURE__*/React__default["default"].createElement(core.TableRow, null, id ? /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, id) : null, /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, functionalImpact), /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, consequenceType)));
  });

  function Transcripts(props) {
    var transcripts = props.transcripts,
        id = props.id,
        geneId = props.geneId;
    var classes = useStyles$2();
    var idx = id ? id : geneId;
    return /*#__PURE__*/React__default["default"].createElement("div", {
      className: classes.innerCard
    }, /*#__PURE__*/React__default["default"].createElement(core.Table, {
      className: classes.table
    }, /*#__PURE__*/React__default["default"].createElement(core.TableBody, null, /*#__PURE__*/React__default["default"].createElement(core.TableRow, {
      key: "header-row-comp-".concat(idx)
    }, id ? /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, "id") : null, /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, "functionalImpact"), /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, "consequenceType")), transcripts ? transcripts.map(function (ele, key) {
      return /*#__PURE__*/React__default["default"].createElement(Transcript, {
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
    return /*#__PURE__*/React__default["default"].createElement(BaseFeatureDetail.BaseCard, {
      title: "Observations"
    }, observations && attributesWithLinks ? observations.map(function (observation, key) {
      return /*#__PURE__*/React__default["default"].createElement("div", {
        key: key
      }, /*#__PURE__*/React__default["default"].createElement(BaseFeatureDetail.Attributes, {
        attributes: observation,
        omit: attributesWithLinks
      }), attributesWithLinks.map(function (attribute, key) {
        return /*#__PURE__*/React__default["default"].createElement("div", {
          key: key
        }, observation[attribute] ? /*#__PURE__*/React__default["default"].createElement(core.Grid, {
          container: true,
          alignItems: "center"
        }, /*#__PURE__*/React__default["default"].createElement(BaseFeatureDetail.FieldName, {
          name: "".concat(attribute),
          // @ts-ignore
          width: util$1.measureText("".concat(attribute), 12) + 10
        }), observation[attribute].includes('http') || observation[attribute].includes('www') && !knownBrokenLinks.find(function (element) {
          return element === observation[attribute];
        }) ? /*#__PURE__*/React__default["default"].createElement(core.Link, {
          href: observation[attribute].match(urlRegex)
        }, observation[attribute].split(urlRegex)[0]) : /*#__PURE__*/React__default["default"].createElement("span", null, observation[attribute].split(urlRegex)[0])) : null);
      }), observations.length > 1 ? /*#__PURE__*/React__default["default"].createElement("hr", null) : null);
    }) : null);
  }

  function Genes(props) {
    var genes = props.genes;
    return /*#__PURE__*/React__default["default"].createElement(BaseFeatureDetail.BaseCard, {
      title: "Genes"
    }, genes ? genes.map(function (gene, key) {
      return /*#__PURE__*/React__default["default"].createElement("div", {
        key: key
      }, /*#__PURE__*/React__default["default"].createElement(BaseFeatureDetail.Attributes, {
        attributes: gene,
        omit: ['consequence']
      }), /*#__PURE__*/React__default["default"].createElement(Transcripts, {
        transcripts: gene.consequence,
        geneId: gene.geneId
      }), genes.length > 1 ? /*#__PURE__*/React__default["default"].createElement("hr", null) : null);
    }) : null);
  }

  function ExternalLinks(props) {
    var classes = useStyles$2();
    var id = props.id;
    var link = "https://dcc.icgc.org/mutations/".concat(id);
    return /*#__PURE__*/React__default["default"].createElement(BaseFeatureDetail.BaseCard, {
      title: "External Links"
    }, /*#__PURE__*/React__default["default"].createElement("div", {
      className: classes.innerCard
    }, /*#__PURE__*/React__default["default"].createElement(core.Table, {
      className: classes.table
    }, /*#__PURE__*/React__default["default"].createElement(core.TableBody, null, /*#__PURE__*/React__default["default"].createElement(core.TableRow, {
      key: "link-".concat(id)
    }, /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, "ICGC Data Portal"), /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, /*#__PURE__*/React__default["default"].createElement(core.Link, {
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

    return /*#__PURE__*/React__default["default"].createElement(core.Paper, {
      "data-testid": "icgc-widget"
    }, /*#__PURE__*/React__default["default"].createElement(BaseFeatureDetail.FeatureDetails, _objectSpread2(_objectSpread2({
      feature: impact ? fullFeature : feature
    }, props), {}, {
      omit: ['transcripts', 'genes', 'observations']
    })), feature.transcripts && /*#__PURE__*/React__default["default"].createElement(BaseFeatureDetail.BaseCard, {
      title: "Transcripts"
    }, /*#__PURE__*/React__default["default"].createElement(Transcripts, {
      transcripts: feature.transcripts,
      id: feature.id
    })), feature.observations && /*#__PURE__*/React__default["default"].createElement(Observations, {
      observations: feature.observations
    }), feature.genes && /*#__PURE__*/React__default["default"].createElement(Genes, {
      genes: feature.genes
    }), /*#__PURE__*/React__default["default"].createElement(ExternalLinks, {
      id: feature.mutationId ? feature.mutationId : feature.id
    }));
  }

  var icgcFeatureWidgetReactComponent = /*#__PURE__*/require$$6.observer(ICGCFeatureDetails);

  var stateModel = (function (pluginManager) {
    var Filter = require$$4.types.model({
      id: require$$4.types.identifier,
      category: require$$4.types.string,
      type: require$$4.types.string,
      filter: require$$4.types.string
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
    var ColourBy = require$$4.types.model({
      id: require$$4.types.identifier,
      value: require$$4.types.string
    });
    return require$$4.types.model('ICGCFilterWidget', {
      id: mst$1.ElementId,
      type: require$$4.types.literal('ICGCFilterWidget'),
      target: require$$4.types.safeReference(pluginManager.pluggableConfigSchemaType('track')),
      filters: require$$4.types.array(Filter),
      colourBy: require$$4.types.map(ColourBy)
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

  // Unique ID creation requires a high quality random # generator. In the browser we therefore
  // require the crypto API and do not support built-in fallback to lower quality random number
  // generators (like Math.random()).
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng() {
    // lazy load so that environments that need to polyfill have a chance to do so
    if (!getRandomValues) {
      // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
      // find the complete implementation of crypto (msCrypto) on IE11.
      getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

      if (!getRandomValues) {
        throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
      }
    }

    return getRandomValues(rnds8);
  }

  var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

  function validate(uuid) {
    return typeof uuid === 'string' && REGEX.test(uuid);
  }

  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */

  var byteToHex = [];

  for (var i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).substr(1));
  }

  function stringify(arr) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    // Note: Be careful editing this code!  It's been tuned for performance
    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
    var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
    // of the following:
    // - One or more input array values don't map to a hex octet (leading to
    // "undefined" in the uuid)
    // - Invalid input values for the RFC `version` or `variant` fields

    if (!validate(uuid)) {
      throw TypeError('Stringified UUID is invalid');
    }

    return uuid;
  }

  function v4(options, buf, offset) {
    options = options || {};
    var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

    if (buf) {
      offset = offset || 0;

      for (var i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }

      return buf;
    }

    return stringify(rnds);
  }

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

  var Add = {};

  var _interopRequireDefault$3 = interopRequireDefault;

  var _interopRequireWildcard$2 = interopRequireWildcard;

  Object.defineProperty(Add, "__esModule", {
    value: true
  });
  var default_1$3 = Add.default = void 0;

  var React$2 = _interopRequireWildcard$2(React__default["default"]);

  var _createSvgIcon$2 = _interopRequireDefault$3(createSvgIcon);

  var _default$4 = (0, _createSvgIcon$2.default)( /*#__PURE__*/React$2.createElement("path", {
    d: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
  }), 'Add');

  default_1$3 = Add.default = _default$4;

  var Clear = {};

  var _interopRequireDefault$2 = interopRequireDefault;

  var _interopRequireWildcard$1 = interopRequireWildcard;

  Object.defineProperty(Clear, "__esModule", {
    value: true
  });
  var default_1$2 = Clear.default = void 0;

  var React$1 = _interopRequireWildcard$1(React__default["default"]);

  var _createSvgIcon$1 = _interopRequireDefault$2(createSvgIcon);

  var _default$3 = (0, _createSvgIcon$1.default)( /*#__PURE__*/React$1.createElement("path", {
    d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
  }), 'Clear');

  default_1$2 = Clear.default = _default$3;

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

  var Filter = /*#__PURE__*/require$$6.observer(function (props) {
    var facets = props.facets,
        schema = props.schema,
        filterModel = props.filterModel;

    var _useState = React$4.useState(filterModel.category ? filterModel.category : facets ? Object.keys(facets)[0] : ''),
        _useState2 = _slicedToArray(_useState, 2),
        category = _useState2[0],
        setCategory = _useState2[1];

    var _useState3 = React$4.useState(filterModel.filter ? filterModel.filter.replace(/(["]+)/g, '').replace(/([\[])+/g, '').replace(/[\]]+/g, '').split(',') : []),
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
        var currentFilter = _defineProperty$1({}, filter.category, {
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

    return /*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment, null, /*#__PURE__*/React__default["default"].createElement(core.List, null, /*#__PURE__*/React__default["default"].createElement(core.ListItem, {
      style: {
        gap: '4px'
      }
    }, /*#__PURE__*/React__default["default"].createElement(core.FormControl, {
      fullWidth: true
    }, /*#__PURE__*/React__default["default"].createElement(core.InputLabel, null, "Category"), /*#__PURE__*/React__default["default"].createElement(core.Select, {
      label: "Category",
      value: category,
      onChange: handleCatChange,
      inputProps: {
        'data-testid': 'category_select'
      }
    }, facets ? Object.keys(facets).map(function (key, idx) {
      return /*#__PURE__*/React__default["default"].createElement(core.MenuItem, {
        value: key,
        key: "".concat(key, "-").concat(idx, "-menuitem"),
        "data-testid": "cat_menuitem_".concat(idx)
      }, prettify(key));
    }) : null)), /*#__PURE__*/React__default["default"].createElement(core.FormControl, {
      fullWidth: true
    }, /*#__PURE__*/React__default["default"].createElement(core.InputLabel, null, "Filters"), /*#__PURE__*/React__default["default"].createElement(core.Select, {
      label: "Filters",
      value: filter,
      onChange: handleFiltChange,
      input: /*#__PURE__*/React__default["default"].createElement(core.Input, null),
      renderValue: function renderValue(selected) {
        return selected.join(', ');
      },
      multiple: true,
      inputProps: {
        'data-testid': 'filters_select'
      }
    }, facets && category && facets[category].terms ? facets[category].terms.sort(alpha).map(function (term, idx) {
      return /*#__PURE__*/React__default["default"].createElement(core.MenuItem, {
        value: term.term,
        key: "".concat(term.term, "-").concat(idx, "-menuitem"),
        "data-testid": "fil_menuitem_".concat(idx)
      }, /*#__PURE__*/React__default["default"].createElement(core.Checkbox, {
        checked: filter ? filter.indexOf(term.term) > -1 : false
      }), /*#__PURE__*/React__default["default"].createElement(core.ListItemText, {
        primary: term.term
      }));
    }) : null)), /*#__PURE__*/React__default["default"].createElement(core.Tooltip, {
      title: "Remove filter",
      "aria-label": "remove filter"
    }, /*#__PURE__*/React__default["default"].createElement(core.IconButton, {
      "aria-label": "remove filter",
      onClick: handleFilterDelete,
      "data-testid": "remove_filter_icon_button"
    }, /*#__PURE__*/React__default["default"].createElement(default_1$2, null))))));
  });
  var FilterList = /*#__PURE__*/require$$6.observer(function (_ref) {
    var schema = _ref.schema,
        facetType = _ref.facetType;

    var _useState5 = React$4.useState(),
        _useState6 = _slicedToArray(_useState5, 2),
        facets = _useState6[0],
        setFacets = _useState6[1];

    React$4.useEffect(function () {
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

    return /*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment, null, schema.filters.map(function (filterModel) {
      if (filterModel.type === facetType) {
        return /*#__PURE__*/React__default["default"].createElement(Filter, {
          facets: facets,
          schema: schema,
          filterModel: filterModel,
          key: filterModel.id
        });
      }

      return null;
    }), /*#__PURE__*/React__default["default"].createElement(core.Button, {
      variant: "outlined",
      onClick: handleClick,
      startIcon: /*#__PURE__*/React__default["default"].createElement(default_1$3, null)
    }, "Add Filter"));
  });

  var Undo = {};

  var _interopRequireDefault$1 = interopRequireDefault;

  var _interopRequireWildcard = interopRequireWildcard;

  Object.defineProperty(Undo, "__esModule", {
    value: true
  });
  var default_1$1 = Undo.default = void 0;

  var React = _interopRequireWildcard(React__default["default"]);

  var _createSvgIcon = _interopRequireDefault$1(createSvgIcon);

  var _default$2 = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
    d: "M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
  }), 'Undo');

  default_1$1 = Undo.default = _default$2;

  var _excluded = ["children", "value", "index"];
  var useStyles$1 = /*#__PURE__*/core.makeStyles(function (theme) {
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

    return /*#__PURE__*/React__default["default"].createElement("div", _objectSpread2({
      role: "tabpanel",
      hidden: value !== index,
      id: "simple-tabpanel-".concat(index),
      "aria-labelledby": "simple-tab-".concat(index)
    }, other), value === index && /*#__PURE__*/React__default["default"].createElement(core.Box, {
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

    var _useState = React$4.useState(0),
        _useState2 = _slicedToArray(_useState, 2),
        value = _useState2[0],
        setValue = _useState2[1];

    var _useState3 = React$4.useState(model.target.adapter.featureType.value ? model.target.adapter.featureType.value : 'mutations'),
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

    React$4.useEffect(function () {
      model.clearFilters();
      var filters = JSON.parse(model.target.adapter.filters.value);

      for (var filter in filters) {
        for (var prop in filters[filter]) {
          model.addFilter(v4(), prop, "".concat(filter, "s"), JSON.stringify(filters[filter][prop]['is']));
        }
      }
    }, [model]);
    return /*#__PURE__*/React__default["default"].createElement("div", {
      className: classes.root
    }, /*#__PURE__*/React__default["default"].createElement(core.Paper, {
      className: classes.paper
    }, /*#__PURE__*/React__default["default"].createElement(core.Typography, {
      variant: "h6"
    }, "Track Type"), /*#__PURE__*/React__default["default"].createElement(core.FormControl, null, /*#__PURE__*/React__default["default"].createElement(core.Select, {
      value: type,
      onChange: handleChangeType,
      inputProps: {
        'data-testid': 'icgc_track_type_select'
      }
    }, /*#__PURE__*/React__default["default"].createElement(core.MenuItem, {
      value: 'mutations',
      "data-testid": "option_mutations"
    }, "Mutations"), /*#__PURE__*/React__default["default"].createElement(core.MenuItem, {
      value: 'occurrences',
      "data-testid": "option_occurrences"
    }, "Mutation Occurrences")), /*#__PURE__*/React__default["default"].createElement(core.FormHelperText, null, "Select what to retrieve from the ICGC with your selected filters."))), /*#__PURE__*/React__default["default"].createElement(core.Paper, {
      className: classes.paper
    }, /*#__PURE__*/React__default["default"].createElement(core.Grid, {
      container: true,
      style: {
        gap: '4px'
      }
    }, /*#__PURE__*/React__default["default"].createElement(core.Typography, {
      variant: "h6"
    }, "Filters"), /*#__PURE__*/React__default["default"].createElement(core.Tooltip, {
      title: "Clear all filters",
      "aria-label": "clear all filters",
      onClick: handleFilterClear
    }, /*#__PURE__*/React__default["default"].createElement(core.IconButton, {
      color: "primary",
      "data-testid": "clear_all_filters_icon_button"
    }, /*#__PURE__*/React__default["default"].createElement(default_1$1, null)))), /*#__PURE__*/React__default["default"].createElement(core.Box, null, /*#__PURE__*/React__default["default"].createElement(core.Tabs, {
      value: value,
      onChange: handleChangeTab,
      "aria-label": "filtering tabs"
    }, /*#__PURE__*/React__default["default"].createElement(core.Tab, _objectSpread2({
      classes: {
        root: classes.tabRoot
      },
      label: "Donors"
    }, a11yProps(0))), /*#__PURE__*/React__default["default"].createElement(core.Tab, _objectSpread2({
      classes: {
        root: classes.tabRoot
      },
      label: "Genes"
    }, a11yProps(1))), /*#__PURE__*/React__default["default"].createElement(core.Tab, _objectSpread2({
      classes: {
        root: classes.tabRoot
      },
      label: "Mutations"
    }, a11yProps(2))))), /*#__PURE__*/React__default["default"].createElement(TabPanel, {
      value: value,
      index: 0
    }, /*#__PURE__*/React__default["default"].createElement(FilterList, {
      schema: model,
      type: type,
      facetType: "donors"
    })), /*#__PURE__*/React__default["default"].createElement(TabPanel, {
      value: value,
      index: 1
    }, /*#__PURE__*/React__default["default"].createElement(FilterList, {
      schema: model,
      type: type,
      facetType: "genes"
    })), /*#__PURE__*/React__default["default"].createElement(TabPanel, {
      value: value,
      index: 2
    }, /*#__PURE__*/React__default["default"].createElement(FilterList, {
      schema: model,
      type: type,
      facetType: "mutations"
    }))), type === 'mutations' ? /*#__PURE__*/React__default["default"].createElement(core.Paper, {
      className: classes.paper
    }, /*#__PURE__*/React__default["default"].createElement(core.Typography, {
      variant: "h6"
    }, "Colour Legend"), /*#__PURE__*/React__default["default"].createElement(core.Table, null, /*#__PURE__*/React__default["default"].createElement(core.TableHead, null, /*#__PURE__*/React__default["default"].createElement(core.TableRow, null, /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, "functionalImpact"), /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, "Corresponding colour"))), /*#__PURE__*/React__default["default"].createElement(core.TableBody, null, /*#__PURE__*/React__default["default"].createElement(core.TableRow, null, /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, "High"), /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, /*#__PURE__*/React__default["default"].createElement(core.Chip, {
      label: "Red",
      style: {
        backgroundColor: 'red',
        color: 'white'
      }
    }))), /*#__PURE__*/React__default["default"].createElement(core.TableRow, null, /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, "Low"), /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, /*#__PURE__*/React__default["default"].createElement(core.Chip, {
      label: "Blue",
      style: {
        backgroundColor: 'blue',
        color: 'white'
      }
    }))), /*#__PURE__*/React__default["default"].createElement(core.TableRow, null, /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, "Unknown/Undefined"), /*#__PURE__*/React__default["default"].createElement(core.TableCell, null, /*#__PURE__*/React__default["default"].createElement(core.Chip, {
      label: "Goldenrod",
      style: {
        backgroundColor: 'goldenrod',
        color: 'white'
      }
    })))))) : null);
  }

  var ReactComponent$1 = /*#__PURE__*/require$$6.observer(ConfigurationEditor);

  var ICGCFilterWidgetF = (function (pluginManager) {
    return {
      configSchema: configuration.ConfigurationSchema('ICGCFilterWidget', {}),
      ReactComponent: ReactComponent$1,
      stateModel: pluginManager.load(stateModel),
      HeadingComponent: function HeadingComponent() {
        return /*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment, null, "ICGC Filters");
      }
    };
  });

  function f(pluginManager) {
    return require$$4.types.model('ICGCSearchWidget', {
      id: mst$1.ElementId,
      type: require$$4.types.literal('ICGCSearchWidget')
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

  var useStyles = /*#__PURE__*/core.makeStyles(function (theme) {
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

    var _useState = React$4.useState(false),
        _useState2 = _slicedToArray(_useState, 2),
        browseSuccess = _useState2[0],
        setBrowseSuccess = _useState2[1];

    var session = util$1.getSession(model);

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

    return /*#__PURE__*/React__default["default"].createElement("div", {
      className: classes.root
    }, /*#__PURE__*/React__default["default"].createElement(core.Paper, {
      className: classes.paper
    }, /*#__PURE__*/React__default["default"].createElement(core.Typography, {
      variant: "h6",
      component: "h1",
      align: "center"
    }, "Quick-add an ICGC Browse Track"), /*#__PURE__*/React__default["default"].createElement(core.Typography, {
      variant: "body1",
      align: "center"
    }, "Add additional Browse tracks to your current view by clicking this button."), browseSuccess ? /*#__PURE__*/React__default["default"].createElement(lab.Alert, {
      severity: "success"
    }, "The requested Browse track has been added.") : null, /*#__PURE__*/React__default["default"].createElement(core.Button, {
      color: "primary",
      variant: "contained",
      size: "large",
      startIcon: /*#__PURE__*/React__default["default"].createElement(default_1$3, null),
      onClick: handleAddBrowse
    }, "Add New ICGC Browse Track")));
  }

  var ReactComponent = /*#__PURE__*/require$$6.observer(Panel);

  var ICGCSearchWidgetF = (function (jbrowse) {
    return {
      configSchema: configuration.ConfigurationSchema('ICGCSearchWidget', {}),
      ReactComponent: ReactComponent,
      stateModel: jbrowse.load(f),
      HeadingComponent: function HeadingComponent() {
        return /*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment, null, "ICGC Data Import");
      }
    };
  });

  var ICGCFeature = /*#__PURE__*/function () {
    function ICGCFeature(args) {
      _classCallCheck$2(this, ICGCFeature);

      _defineProperty$1(this, "icgcObject", void 0);

      _defineProperty$1(this, "data", void 0);

      _defineProperty$1(this, "uniqueId", void 0);

      _defineProperty$1(this, "featureType", void 0);

      this.icgcObject = args.icgcObject;
      this.featureType = args.featureType ? args.featureType : 'mutation';
      this.data = this.dataFromICGCObject(this.icgcObject, this.featureType);
      this.uniqueId = args.id;
    }

    _createClass$2(ICGCFeature, [{
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
        var t = [].concat(_toConsumableArray$1(Object.keys(this.data)), _toConsumableArray$1(Object.keys(this.icgcObject)));
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

  var esm = {};

  var AbortablePromiseCache$1 = {};

  var abortcontrollerPonyfill = {};

  var cjsPonyfill = {};

  Object.defineProperty(cjsPonyfill, '__esModule', { value: true });

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
    return Constructor;
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
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
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

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  var Emitter = /*#__PURE__*/function () {
    function Emitter() {
      _classCallCheck(this, Emitter);

      Object.defineProperty(this, 'listeners', {
        value: {},
        writable: true,
        configurable: true
      });
    }

    _createClass(Emitter, [{
      key: "addEventListener",
      value: function addEventListener(type, callback, options) {
        if (!(type in this.listeners)) {
          this.listeners[type] = [];
        }

        this.listeners[type].push({
          callback: callback,
          options: options
        });
      }
    }, {
      key: "removeEventListener",
      value: function removeEventListener(type, callback) {
        if (!(type in this.listeners)) {
          return;
        }

        var stack = this.listeners[type];

        for (var i = 0, l = stack.length; i < l; i++) {
          if (stack[i].callback === callback) {
            stack.splice(i, 1);
            return;
          }
        }
      }
    }, {
      key: "dispatchEvent",
      value: function dispatchEvent(event) {
        if (!(event.type in this.listeners)) {
          return;
        }

        var stack = this.listeners[event.type];
        var stackToCall = stack.slice();

        for (var i = 0, l = stackToCall.length; i < l; i++) {
          var listener = stackToCall[i];

          try {
            listener.callback.call(this, event);
          } catch (e) {
            Promise.resolve().then(function () {
              throw e;
            });
          }

          if (listener.options && listener.options.once) {
            this.removeEventListener(event.type, listener.callback);
          }
        }

        return !event.defaultPrevented;
      }
    }]);

    return Emitter;
  }();

  var AbortSignal$1 = /*#__PURE__*/function (_Emitter) {
    _inherits(AbortSignal, _Emitter);

    var _super = _createSuper(AbortSignal);

    function AbortSignal() {
      var _this;

      _classCallCheck(this, AbortSignal);

      _this = _super.call(this); // Some versions of babel does not transpile super() correctly for IE <= 10, if the parent
      // constructor has failed to run, then "this.listeners" will still be undefined and then we call
      // the parent constructor directly instead as a workaround. For general details, see babel bug:
      // https://github.com/babel/babel/issues/3041
      // This hack was added as a fix for the issue described here:
      // https://github.com/Financial-Times/polyfill-library/pull/59#issuecomment-477558042

      if (!_this.listeners) {
        Emitter.call(_assertThisInitialized(_this));
      } // Compared to assignment, Object.defineProperty makes properties non-enumerable by default and
      // we want Object.keys(new AbortController().signal) to be [] for compat with the native impl


      Object.defineProperty(_assertThisInitialized(_this), 'aborted', {
        value: false,
        writable: true,
        configurable: true
      });
      Object.defineProperty(_assertThisInitialized(_this), 'onabort', {
        value: null,
        writable: true,
        configurable: true
      });
      return _this;
    }

    _createClass(AbortSignal, [{
      key: "toString",
      value: function toString() {
        return '[object AbortSignal]';
      }
    }, {
      key: "dispatchEvent",
      value: function dispatchEvent(event) {
        if (event.type === 'abort') {
          this.aborted = true;

          if (typeof this.onabort === 'function') {
            this.onabort.call(this, event);
          }
        }

        _get(_getPrototypeOf(AbortSignal.prototype), "dispatchEvent", this).call(this, event);
      }
    }]);

    return AbortSignal;
  }(Emitter);
  var AbortController$1 = /*#__PURE__*/function () {
    function AbortController() {
      _classCallCheck(this, AbortController);

      // Compared to assignment, Object.defineProperty makes properties non-enumerable by default and
      // we want Object.keys(new AbortController()) to be [] for compat with the native impl
      Object.defineProperty(this, 'signal', {
        value: new AbortSignal$1(),
        writable: true,
        configurable: true
      });
    }

    _createClass(AbortController, [{
      key: "abort",
      value: function abort() {
        var event;

        try {
          event = new Event('abort');
        } catch (e) {
          if (typeof document !== 'undefined') {
            if (!document.createEvent) {
              // For Internet Explorer 8:
              event = document.createEventObject();
              event.type = 'abort';
            } else {
              // For Internet Explorer 11:
              event = document.createEvent('Event');
              event.initEvent('abort', false, false);
            }
          } else {
            // Fallback where document isn't available:
            event = {
              type: 'abort',
              bubbles: false,
              cancelable: false
            };
          }
        }

        this.signal.dispatchEvent(event);
      }
    }, {
      key: "toString",
      value: function toString() {
        return '[object AbortController]';
      }
    }]);

    return AbortController;
  }();

  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    // These are necessary to make sure that we get correct output for:
    // Object.prototype.toString.call(new AbortController())
    AbortController$1.prototype[Symbol.toStringTag] = 'AbortController';
    AbortSignal$1.prototype[Symbol.toStringTag] = 'AbortSignal';
  }

  function polyfillNeeded(self) {
    if (self.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL) {
      console.log('__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill');
      return true;
    } // Note that the "unfetch" minimal fetch polyfill defines fetch() without
    // defining window.Request, and this polyfill need to work on top of unfetch
    // so the below feature detection needs the !self.AbortController part.
    // The Request.prototype check is also needed because Safari versions 11.1.2
    // up to and including 12.1.x has a window.AbortController present but still
    // does NOT correctly implement abortable fetch:
    // https://bugs.webkit.org/show_bug.cgi?id=174980#c2


    return typeof self.Request === 'function' && !self.Request.prototype.hasOwnProperty('signal') || !self.AbortController;
  }

  /**
   * Note: the "fetch.Request" default value is available for fetch imported from
   * the "node-fetch" package and not in browsers. This is OK since browsers
   * will be importing umd-polyfill.js from that path "self" is passed the
   * decorator so the default value will not be used (because browsers that define
   * fetch also has Request). One quirky setup where self.fetch exists but
   * self.Request does not is when the "unfetch" minimal fetch polyfill is used
   * on top of IE11; for this case the browser will try to use the fetch.Request
   * default value which in turn will be undefined but then then "if (Request)"
   * will ensure that you get a patched fetch but still no Request (as expected).
   * @param {fetch, Request = fetch.Request}
   * @returns {fetch: abortableFetch, Request: AbortableRequest}
   */

  function abortableFetchDecorator(patchTargets) {
    if ('function' === typeof patchTargets) {
      patchTargets = {
        fetch: patchTargets
      };
    }

    var _patchTargets = patchTargets,
        fetch = _patchTargets.fetch,
        _patchTargets$Request = _patchTargets.Request,
        NativeRequest = _patchTargets$Request === void 0 ? fetch.Request : _patchTargets$Request,
        NativeAbortController = _patchTargets.AbortController,
        _patchTargets$__FORCE = _patchTargets.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL,
        __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL = _patchTargets$__FORCE === void 0 ? false : _patchTargets$__FORCE;

    if (!polyfillNeeded({
      fetch: fetch,
      Request: NativeRequest,
      AbortController: NativeAbortController,
      __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL: __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL
    })) {
      return {
        fetch: fetch,
        Request: Request
      };
    }

    var Request = NativeRequest; // Note that the "unfetch" minimal fetch polyfill defines fetch() without
    // defining window.Request, and this polyfill need to work on top of unfetch
    // hence we only patch it if it's available. Also we don't patch it if signal
    // is already available on the Request prototype because in this case support
    // is present and the patching below can cause a crash since it assigns to
    // request.signal which is technically a read-only property. This latter error
    // happens when you run the main5.js node-fetch example in the repo
    // "abortcontroller-polyfill-examples". The exact error is:
    //   request.signal = init.signal;
    //   ^
    // TypeError: Cannot set property signal of #<Request> which has only a getter

    if (Request && !Request.prototype.hasOwnProperty('signal') || __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL) {
      Request = function Request(input, init) {
        var signal;

        if (init && init.signal) {
          signal = init.signal; // Never pass init.signal to the native Request implementation when the polyfill has
          // been installed because if we're running on top of a browser with a
          // working native AbortController (i.e. the polyfill was installed due to
          // __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL being set), then passing our
          // fake AbortSignal to the native fetch will trigger:
          // TypeError: Failed to construct 'Request': member signal is not of type AbortSignal.

          delete init.signal;
        }

        var request = new NativeRequest(input, init);

        if (signal) {
          Object.defineProperty(request, 'signal', {
            writable: false,
            enumerable: false,
            configurable: true,
            value: signal
          });
        }

        return request;
      };

      Request.prototype = NativeRequest.prototype;
    }

    var realFetch = fetch;

    var abortableFetch = function abortableFetch(input, init) {
      var signal = Request && Request.prototype.isPrototypeOf(input) ? input.signal : init ? init.signal : undefined;

      if (signal) {
        var abortError;

        try {
          abortError = new DOMException('Aborted', 'AbortError');
        } catch (err) {
          // IE 11 does not support calling the DOMException constructor, use a
          // regular error object on it instead.
          abortError = new Error('Aborted');
          abortError.name = 'AbortError';
        } // Return early if already aborted, thus avoiding making an HTTP request


        if (signal.aborted) {
          return Promise.reject(abortError);
        } // Turn an event into a promise, reject it once `abort` is dispatched


        var cancellation = new Promise(function (_, reject) {
          signal.addEventListener('abort', function () {
            return reject(abortError);
          }, {
            once: true
          });
        });

        if (init && init.signal) {
          // Never pass .signal to the native implementation when the polyfill has
          // been installed because if we're running on top of a browser with a
          // working native AbortController (i.e. the polyfill was installed due to
          // __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL being set), then passing our
          // fake AbortSignal to the native fetch will trigger:
          // TypeError: Failed to execute 'fetch' on 'Window': member signal is not of type AbortSignal.
          delete init.signal;
        } // Return the fastest promise (don't need to wait for request to finish)


        return Promise.race([cancellation, realFetch(input, init)]);
      }

      return realFetch(input, init);
    };

    return {
      fetch: abortableFetch,
      Request: Request
    };
  }

  cjsPonyfill.AbortController = AbortController$1;
  cjsPonyfill.AbortSignal = AbortSignal$1;
  cjsPonyfill.abortableFetch = abortableFetchDecorator;

  /* eslint-disable */
  Object.defineProperty(abortcontrollerPonyfill, "__esModule", { value: true });
  abortcontrollerPonyfill.AbortSignal = abortcontrollerPonyfill.AbortController = void 0;
  const cjs_ponyfill_1 = cjsPonyfill;
  var getGlobal = function () {
      // the only reliable means to get the global object is
      // `Function('return this')()`
      // However, this causes CSP violations in Chrome apps.
      if (typeof self !== 'undefined') {
          return self;
      }
      if (typeof window !== 'undefined') {
          return window;
      }
      if (typeof commonjsGlobal !== 'undefined') {
          return commonjsGlobal;
      }
      throw new Error('unable to locate global object');
  };
  //@ts-ignore
  let AbortController = typeof getGlobal().AbortController === 'undefined' ? cjs_ponyfill_1.AbortController : getGlobal().AbortController;
  abortcontrollerPonyfill.AbortController = AbortController;
  //@ts-ignore
  let AbortSignal = typeof getGlobal().AbortController === 'undefined' ? cjs_ponyfill_1.AbortSignal : getGlobal().AbortSignal;
  abortcontrollerPonyfill.AbortSignal = AbortSignal;

  var AggregateAbortController$1 = {};

  Object.defineProperty(AggregateAbortController$1, "__esModule", { value: true });
  const abortcontroller_ponyfill_1$1 = abortcontrollerPonyfill;
  class NullSignal {
  }
  /**
   * aggregates a number of abort signals, will only fire the aggregated
   * abort if all of the input signals have been aborted
   */
  class AggregateAbortController {
      constructor() {
          this.signals = new Set();
          this.abortController = new abortcontroller_ponyfill_1$1.AbortController();
      }
      /**
       * @param {AbortSignal} [signal] optional AbortSignal to add. if falsy,
       *  will be treated as a null-signal, and this abortcontroller will no
       *  longer be abortable.
       */
      //@ts-ignore
      addSignal(signal = new NullSignal()) {
          if (this.signal.aborted) {
              throw new Error('cannot add a signal, already aborted!');
          }
          // note that a NullSignal will never fire, so if we
          // have one this thing will never actually abort
          this.signals.add(signal);
          if (signal.aborted) {
              // handle the abort immediately if it is already aborted
              // for some reason
              this.handleAborted(signal);
          }
          else if (typeof signal.addEventListener === 'function') {
              signal.addEventListener('abort', () => {
                  this.handleAborted(signal);
              });
          }
      }
      handleAborted(signal) {
          this.signals.delete(signal);
          if (this.signals.size === 0) {
              this.abortController.abort();
          }
      }
      get signal() {
          return this.abortController.signal;
      }
      abort() {
          this.abortController.abort();
      }
  }
  AggregateAbortController$1.default = AggregateAbortController;

  var AggregateStatusReporter$1 = {};

  Object.defineProperty(AggregateStatusReporter$1, "__esModule", { value: true });
  class AggregateStatusReporter {
      constructor() {
          this.callbacks = new Set();
      }
      addCallback(callback = () => { }) {
          this.callbacks.add(callback);
          callback(this.currentMessage);
      }
      callback(message) {
          this.currentMessage = message;
          this.callbacks.forEach(elt => {
              elt(message);
          });
      }
  }
  AggregateStatusReporter$1.default = AggregateStatusReporter;

  var __importDefault$1 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(AbortablePromiseCache$1, "__esModule", { value: true });
  const abortcontroller_ponyfill_1 = abortcontrollerPonyfill;
  const AggregateAbortController_1 = __importDefault$1(AggregateAbortController$1);
  const AggregateStatusReporter_1 = __importDefault$1(AggregateStatusReporter$1);
  class AbortablePromiseCache {
      constructor({ fill, cache, }) {
          if (typeof fill !== 'function') {
              throw new TypeError('must pass a fill function');
          }
          if (typeof cache !== 'object') {
              throw new TypeError('must pass a cache object');
          }
          if (typeof cache.get !== 'function' ||
              typeof cache.set !== 'function' ||
              typeof cache.delete !== 'function') {
              throw new TypeError('cache must implement get(key), set(key, val), and and delete(key)');
          }
          this.cache = cache;
          this.fillCallback = fill;
      }
      static isAbortException(exception) {
          return (
          // DOMException
          exception.name === 'AbortError' ||
              // standard-ish non-DOM abort exception
              //@ts-ignore
              exception.code === 'ERR_ABORTED' ||
              // stringified DOMException
              exception.message === 'AbortError: aborted' ||
              // stringified standard-ish exception
              exception.message === 'Error: aborted');
      }
      evict(key, entry) {
          if (this.cache.get(key) === entry) {
              this.cache.delete(key);
          }
      }
      fill(key, data, signal, statusCallback) {
          const aborter = new AggregateAbortController_1.default();
          const statusReporter = new AggregateStatusReporter_1.default();
          statusReporter.addCallback(statusCallback);
          const newEntry = {
              aborter: aborter,
              promise: this.fillCallback(data, aborter.signal, (message) => {
                  statusReporter.callback(message);
              }),
              settled: false,
              statusReporter,
              get aborted() {
                  return this.aborter.signal.aborted;
              },
          };
          newEntry.aborter.addSignal(signal);
          // remove the fill from the cache when its abortcontroller fires, if still in there
          newEntry.aborter.signal.addEventListener('abort', () => {
              if (!newEntry.settled) {
                  this.evict(key, newEntry);
              }
          });
          // chain off the cached promise to record when it settles
          newEntry.promise
              .then(() => {
              newEntry.settled = true;
          }, () => {
              newEntry.settled = true;
              // if the fill throws an error (including abort) and is still in the cache, remove it
              this.evict(key, newEntry);
          })
              .catch(e => {
              // this will only be reached if there is some kind of
              // bad bug in this library
              console.error(e);
              throw e;
          });
          this.cache.set(key, newEntry);
      }
      static checkSinglePromise(promise, signal) {
          // check just this signal for having been aborted, and abort the
          // promise if it was, regardless of what happened with the cached
          // response
          function checkForSingleAbort() {
              if (signal && signal.aborted) {
                  throw Object.assign(new Error('aborted'), { code: 'ERR_ABORTED' });
              }
          }
          return promise.then(result => {
              checkForSingleAbort();
              return result;
          }, error => {
              checkForSingleAbort();
              throw error;
          });
      }
      has(key) {
          return this.cache.has(key);
      }
      /**
       * Callback for getting status of the pending async
       *
       * @callback statusCallback
       * @param {any} status, current status string or message object
       */
      /**
       * @param {any} key cache key to use for this request
       * @param {any} data data passed as the first argument to the fill callback
       * @param {AbortSignal} [signal] optional AbortSignal object that aborts the request
       * @param {statusCallback} a callback to get the current status of a pending async operation
       */
      get(key, data, signal, statusCallback) {
          if (!signal && data instanceof abortcontroller_ponyfill_1.AbortSignal) {
              throw new TypeError('second get argument appears to be an AbortSignal, perhaps you meant to pass `null` for the fill data?');
          }
          const cacheEntry = this.cache.get(key);
          if (cacheEntry) {
              if (cacheEntry.aborted && !cacheEntry.settled) {
                  // if it's aborted but has not realized it yet, evict it and redispatch
                  this.evict(key, cacheEntry);
                  return this.get(key, data, signal, statusCallback);
              }
              if (cacheEntry.settled) {
                  // too late to abort, just return it
                  return cacheEntry.promise;
              }
              // request is in-flight, add this signal to its list of signals,
              // or if there is no signal, the aborter will become non-abortable
              cacheEntry.aborter.addSignal(signal);
              cacheEntry.statusReporter.addCallback(statusCallback);
              return AbortablePromiseCache.checkSinglePromise(cacheEntry.promise, signal);
          }
          // if we got here, it is not in the cache. fill.
          this.fill(key, data, signal, statusCallback);
          return AbortablePromiseCache.checkSinglePromise(
          //see https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-
          //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.cache.get(key).promise, signal);
      }
      /**
       * delete the given entry from the cache. if it exists and its fill request has
       * not yet settled, the fill will be signaled to abort.
       *
       * @param {any} key
       */
      delete(key) {
          const cachedEntry = this.cache.get(key);
          if (cachedEntry) {
              if (!cachedEntry.settled) {
                  cachedEntry.aborter.abort();
              }
              this.cache.delete(key);
          }
      }
      /**
       * Clear all requests from the cache. Aborts any that have not settled.
       * @returns {number} count of entries deleted
       */
      clear() {
          // iterate without needing regenerator-runtime
          const keyIter = this.cache.keys();
          let deleteCount = 0;
          for (let result = keyIter.next(); !result.done; result = keyIter.next()) {
              this.delete(result.value);
              deleteCount += 1;
          }
          return deleteCount;
      }
  }
  AbortablePromiseCache$1.default = AbortablePromiseCache;

  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(esm, "__esModule", { value: true });
  const AbortablePromiseCache_1 = __importDefault(AbortablePromiseCache$1);
  var _default$1 = esm.default = AbortablePromiseCache_1.default;

  var QuickLRU$1 = {};

  var regenerator = runtime.exports;

  var classCallCheck = {exports: {}};

  (function (module) {
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(classCallCheck));

  var createClass = {exports: {}};

  (function (module) {
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

  module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;
  }(createClass));

  var _interopRequireDefault = interopRequireDefault$1.exports;

  Object.defineProperty(QuickLRU$1, "__esModule", {
    value: true
  });
  var default_1 = QuickLRU$1.default = void 0;

  var _regenerator = _interopRequireDefault(regenerator);

  var _slicedToArray2 = _interopRequireDefault(slicedToArray.exports);

  var _classCallCheck2 = _interopRequireDefault(classCallCheck.exports);

  var _createClass2 = _interopRequireDefault(createClass.exports);

  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  /* eslint-disable no-underscore-dangle */

  /**
   * Heavily based on [quick-lru](https://www.npmjs.com/package/quick-lru)
   * (quick-lru didn't work for us because the export wouldn't compile in Webpack
   * properly)
   */
  var QuickLRU = /*#__PURE__*/function (_Symbol$iterator) {
    function QuickLRU() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      (0, _classCallCheck2.default)(this, QuickLRU);

      if (!(options.maxSize && options.maxSize > 0)) {
        throw new TypeError('`maxSize` must be a number greater than 0');
      }

      this.maxSize = options.maxSize;
      this.cache = new Map();
      this.oldCache = new Map();
      this._size = 0;
    }

    (0, _createClass2.default)(QuickLRU, [{
      key: "_set",
      value: function _set(key, value) {
        this.cache.set(key, value);
        this._size += 1;

        if (this._size >= this.maxSize) {
          this._size = 0;
          this.oldCache = this.cache;
          this.cache = new Map();
        }
      }
    }, {
      key: "get",
      value: function get(key) {
        if (this.cache.has(key)) {
          return this.cache.get(key);
        }

        if (this.oldCache.has(key)) {
          var value = this.oldCache.get(key);
          this.oldCache.delete(key);

          this._set(key, value);

          return value;
        }

        return undefined;
      }
    }, {
      key: "set",
      value: function set(key, value) {
        if (this.cache.has(key)) {
          this.cache.set(key, value);
        } else {
          this._set(key, value);
        }

        return this;
      }
    }, {
      key: "has",
      value: function has(key) {
        return this.cache.has(key) || this.oldCache.has(key);
      }
    }, {
      key: "peek",
      value: function peek(key) {
        if (this.cache.has(key)) {
          return this.cache.get(key);
        }

        if (this.oldCache.has(key)) {
          return this.oldCache.get(key);
        }

        return undefined;
      }
    }, {
      key: "delete",
      value: function _delete(key) {
        var deleted = this.cache.delete(key);

        if (deleted) {
          this._size -= 1;
        }

        return this.oldCache.delete(key) || deleted;
      }
    }, {
      key: "clear",
      value: function clear() {
        this.cache.clear();
        this.oldCache.clear();
        this._size = 0;
      }
    }, {
      key: "keys",
      value: /*#__PURE__*/_regenerator.default.mark(function keys() {
        var _iterator, _step, _step$value, key;

        return _regenerator.default.wrap(function keys$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _iterator = _createForOfIteratorHelper(this);
                _context.prev = 1;

                _iterator.s();

              case 3:
                if ((_step = _iterator.n()).done) {
                  _context.next = 9;
                  break;
                }

                _step$value = (0, _slicedToArray2.default)(_step.value, 1), key = _step$value[0];
                _context.next = 7;
                return key;

              case 7:
                _context.next = 3;
                break;

              case 9:
                _context.next = 14;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](1);

                _iterator.e(_context.t0);

              case 14:
                _context.prev = 14;

                _iterator.f();

                return _context.finish(14);

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, keys, this, [[1, 11, 14, 17]]);
      })
    }, {
      key: "values",
      value: /*#__PURE__*/_regenerator.default.mark(function values() {
        var _iterator2, _step2, _step2$value, value;

        return _regenerator.default.wrap(function values$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _iterator2 = _createForOfIteratorHelper(this);
                _context2.prev = 1;

                _iterator2.s();

              case 3:
                if ((_step2 = _iterator2.n()).done) {
                  _context2.next = 9;
                  break;
                }

                _step2$value = (0, _slicedToArray2.default)(_step2.value, 2), value = _step2$value[1];
                _context2.next = 7;
                return value;

              case 7:
                _context2.next = 3;
                break;

              case 9:
                _context2.next = 14;
                break;

              case 11:
                _context2.prev = 11;
                _context2.t0 = _context2["catch"](1);

                _iterator2.e(_context2.t0);

              case 14:
                _context2.prev = 14;

                _iterator2.f();

                return _context2.finish(14);

              case 17:
              case "end":
                return _context2.stop();
            }
          }
        }, values, this, [[1, 11, 14, 17]]);
      })
    }, {
      key: _Symbol$iterator,
      value: /*#__PURE__*/_regenerator.default.mark(function value() {
        var _iterator3, _step3, item, _iterator4, _step4, _item, _item2, key;

        return _regenerator.default.wrap(function value$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _iterator3 = _createForOfIteratorHelper(this.cache);
                _context3.prev = 1;

                _iterator3.s();

              case 3:
                if ((_step3 = _iterator3.n()).done) {
                  _context3.next = 9;
                  break;
                }

                item = _step3.value;
                _context3.next = 7;
                return item;

              case 7:
                _context3.next = 3;
                break;

              case 9:
                _context3.next = 14;
                break;

              case 11:
                _context3.prev = 11;
                _context3.t0 = _context3["catch"](1);

                _iterator3.e(_context3.t0);

              case 14:
                _context3.prev = 14;

                _iterator3.f();

                return _context3.finish(14);

              case 17:
                _iterator4 = _createForOfIteratorHelper(this.oldCache);
                _context3.prev = 18;

                _iterator4.s();

              case 20:
                if ((_step4 = _iterator4.n()).done) {
                  _context3.next = 28;
                  break;
                }

                _item = _step4.value;
                _item2 = (0, _slicedToArray2.default)(_item, 1), key = _item2[0];

                if (this.cache.has(key)) {
                  _context3.next = 26;
                  break;
                }

                _context3.next = 26;
                return _item;

              case 26:
                _context3.next = 20;
                break;

              case 28:
                _context3.next = 33;
                break;

              case 30:
                _context3.prev = 30;
                _context3.t1 = _context3["catch"](18);

                _iterator4.e(_context3.t1);

              case 33:
                _context3.prev = 33;

                _iterator4.f();

                return _context3.finish(33);

              case 36:
              case "end":
                return _context3.stop();
            }
          }
        }, value, this, [[1, 11, 14, 17], [18, 30, 33, 36]]);
      })
    }, {
      key: "size",
      get: function get() {
        var oldCacheSize = 0;

        var _iterator5 = _createForOfIteratorHelper(this.oldCache.keys()),
            _step5;

        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var key = _step5.value;

            if (!this.cache.has(key)) {
              oldCacheSize += 1;
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }

        return this._size + oldCacheSize;
      }
    }]);
    return QuickLRU;
  }(Symbol.iterator);

  var _default = QuickLRU;
  default_1 = QuickLRU$1.default = _default;

  var ICGCAdapter = /*#__PURE__*/function (_BaseFeatureDataAdapt) {
    _inherits$1(ICGCAdapter, _BaseFeatureDataAdapt);

    var _super = /*#__PURE__*/_createSuper$1(ICGCAdapter);

    function ICGCAdapter(config) {
      var _this;

      _classCallCheck$2(this, ICGCAdapter);

      _this = _super.call(this, config);

      _defineProperty$1(_assertThisInitialized$1(_this), "filters", void 0);

      _defineProperty$1(_assertThisInitialized$1(_this), "size", void 0);

      _defineProperty$1(_assertThisInitialized$1(_this), "featureType", void 0);

      _defineProperty$1(_assertThisInitialized$1(_this), "featureCache", new _default$1({
        cache: new default_1({
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

      var filters = configuration.readConfObject(config, 'filters');
      var size = configuration.readConfObject(config, 'size');
      var featureType = configuration.readConfObject(config, 'featureType');
      _this.filters = filters;
      _this.size = size;
      _this.featureType = featureType;
      return _this;
    }

    _createClass$2(ICGCAdapter, [{
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
        return rxjs.ObservableCreate( /*#__PURE__*/function () {
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
                    _iterator = _createForOfIteratorHelper$1(result.hits);

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
  }(BaseAdapter.BaseFeatureDataAdapter);

  _defineProperty$1(ICGCAdapter, "capabilities", ['getFeatures', 'getRefNames']);

  var icgcConfigSchema = /*#__PURE__*/configuration.ConfigurationSchema('ICGCAdapter', {
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
      model: /*#__PURE__*/require$$4.types.enumeration('Feature Type', ['mutations', 'occurrences']),
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
    return /*#__PURE__*/React__default["default"].createElement(SvgIcon__default["default"], _objectSpread2({}, props), /*#__PURE__*/React__default["default"].createElement("path", {
      d: "M12,2C6.48,2,2,6.48,2,12c0,1.33,0.26,2.61,0.74,3.77L8,10.5l3.3,2.78L14.58,10H13V8h5v5h-2v-1.58L11.41,16l-3.29-2.79 l-4.4,4.4C5.52,20.26,8.56,22,12,22h8c1.1,0,2-0.9,2-2v-8C22,6.48,17.52,2,12,2z M19.5,20.5c-0.55,0-1-0.45-1-1s0.45-1,1-1 s1,0.45,1,1S20.05,20.5,19.5,20.5z"
    }));
  }

  var ICGCPlugin = /*#__PURE__*/function (_Plugin) {
    _inherits$1(ICGCPlugin, _Plugin);

    var _super = /*#__PURE__*/_createSuper$1(ICGCPlugin);

    function ICGCPlugin() {
      var _this;

      _classCallCheck$2(this, ICGCPlugin);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));

      _defineProperty$1(_assertThisInitialized$1(_this), "name", 'ICGC');

      _defineProperty$1(_assertThisInitialized$1(_this), "version", version$1);

      return _this;
    }

    _createClass$2(ICGCPlugin, [{
      key: "install",
      value: function install(pluginManager) {
        var LGVPlugin = pluginManager.getPlugin('LinearGenomeViewPlugin');
        var BaseLinearDisplayComponent = LGVPlugin.exports.BaseLinearDisplayComponent;
        pluginManager.addTrackType(function () {
          var configSchema = configuration.ConfigurationSchema('ICGCTrack', {}, {
            baseConfiguration: models.createBaseTrackConfig(pluginManager),
            explicitIdentifier: 'trackId'
          });
          return new TrackType__default["default"]({
            name: 'ICGCTrack',
            configSchema: configSchema,
            stateModel: models.createBaseTrackModel(pluginManager, 'ICGCTrack', configSchema)
          });
        });
        pluginManager.addDisplayType(function () {
          var configSchema = configSchemaFactory(pluginManager);
          return new DisplayType__default["default"]({
            name: 'LinearICGCDisplay',
            configSchema: configSchema,
            stateModel: stateModelFactory$1(configSchema, pluginManager),
            trackType: 'ICGCTrack',
            viewType: 'LinearGenomeView',
            ReactComponent: BaseLinearDisplayComponent
          });
        });
        pluginManager.addAdapterType(function () {
          return new AdapterType__default["default"]({
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
          return new WidgetType__default["default"]({
            name: 'ICGCFeatureWidget',
            heading: 'Feature Details',
            configSchema: configSchema,
            stateModel: stateModelFactory(pluginManager),
            ReactComponent: icgcFeatureWidgetReactComponent
          });
        });
        pluginManager.addWidgetType(function () {
          return new WidgetType__default["default"](_objectSpread2({
            name: 'ICGCFilterWidget'
          }, ICGCFilterWidgetF(pluginManager)));
        });
        pluginManager.addWidgetType(function () {
          return new WidgetType__default["default"](_objectSpread2({
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
        if (util$1.isAbstractMenuManager(pluginManager.rootModel)) {
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
  }(Plugin__default["default"]);

  exports["default"] = ICGCPlugin;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=jbrowse-plugin-icgc.umd.development.js.map
