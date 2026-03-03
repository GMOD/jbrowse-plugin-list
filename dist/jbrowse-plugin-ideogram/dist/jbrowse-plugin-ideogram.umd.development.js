(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('@material-ui/core/utils'), require('@jbrowse/core/Plugin'), require('@jbrowse/core/util'), require('@jbrowse/core/pluggableElementTypes/ViewType'), require('@jbrowse/core/pluggableElementTypes/WidgetType'), require('mobx-react'), require('@jbrowse/core/configuration'), require('@material-ui/core'), require('@jbrowse/core/ui'), require('@jbrowse/core/util/io'), require('@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail'), require('@jbrowse/core/util/types/mst'), require('mobx-state-tree'), require('@material-ui/lab'), require('@material-ui/core/SvgIcon')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', '@material-ui/core/utils', '@jbrowse/core/Plugin', '@jbrowse/core/util', '@jbrowse/core/pluggableElementTypes/ViewType', '@jbrowse/core/pluggableElementTypes/WidgetType', 'mobx-react', '@jbrowse/core/configuration', '@material-ui/core', '@jbrowse/core/ui', '@jbrowse/core/util/io', '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail', '@jbrowse/core/util/types/mst', 'mobx-state-tree', '@material-ui/lab', '@material-ui/core/SvgIcon'], factory) :
  (global = global || self, factory(global.JBrowsePluginIdeogram = {}, global.JBrowseExports.react, global.JBrowseExports['@material-ui/core/utils'], global.JBrowseExports['@jbrowse/core/Plugin'], global.JBrowseExports['@jbrowse/core/util'], global.JBrowseExports['@jbrowse/core/pluggableElementTypes/ViewType'], global.JBrowseExports['@jbrowse/core/pluggableElementTypes/WidgetType'], global.JBrowseExports['mobx-react'], global.JBrowseExports['@jbrowse/core/configuration'], global.JBrowseExports['@material-ui/core'], global.JBrowseExports['@jbrowse/core/ui'], global.JBrowseExports['@jbrowse/core/util/io'], global.JBrowseExports['@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail'], global.JBrowseExports['@jbrowse/core/util/types/mst'], global.JBrowseExports['mobx-state-tree'], global.JBrowseExports['@material-ui/lab'], global.JBrowseExports['@material-ui/core/SvgIcon']));
}(this, (function (exports, React, utils, Plugin, util, ViewType, WidgetType, mobxReact, configuration, core, ui, io, BaseFeatureDetail, mst, mobxStateTree, lab, SvgIcon) { 'use strict';

  var React__default = 'default' in React ? React['default'] : React;
  utils = utils && Object.prototype.hasOwnProperty.call(utils, 'default') ? utils['default'] : utils;
  Plugin = Plugin && Object.prototype.hasOwnProperty.call(Plugin, 'default') ? Plugin['default'] : Plugin;
  ViewType = ViewType && Object.prototype.hasOwnProperty.call(ViewType, 'default') ? ViewType['default'] : ViewType;
  WidgetType = WidgetType && Object.prototype.hasOwnProperty.call(WidgetType, 'default') ? WidgetType['default'] : WidgetType;
  var mobxReact__default = 'default' in mobxReact ? mobxReact['default'] : mobxReact;
  var configuration__default = 'default' in configuration ? configuration['default'] : configuration;
  var core__default = 'default' in core ? core['default'] : core;
  SvgIcon = SvgIcon && Object.prototype.hasOwnProperty.call(SvgIcon, 'default') ? SvgIcon['default'] : SvgIcon;

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
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

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
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

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  function getCjsExportFromNamespace (n) {
  	return n && n['default'] || n;
  }

  var interopRequireDefault = createCommonjsModule(function (module) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      "default": obj
    };
  }

  module.exports = _interopRequireDefault;
  module.exports["default"] = module.exports, module.exports.__esModule = true;
  });

  unwrapExports(interopRequireDefault);

  var _typeof_1 = createCommonjsModule(function (module) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      module.exports = _typeof = function _typeof(obj) {
        return typeof obj;
      };

      module.exports["default"] = module.exports, module.exports.__esModule = true;
    } else {
      module.exports = _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };

      module.exports["default"] = module.exports, module.exports.__esModule = true;
    }

    return _typeof(obj);
  }

  module.exports = _typeof;
  module.exports["default"] = module.exports, module.exports.__esModule = true;
  });

  unwrapExports(_typeof_1);

  var interopRequireWildcard = createCommonjsModule(function (module) {
  var _typeof = _typeof_1["default"];

  function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) {
      return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }

  function _interopRequireWildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
      return obj;
    }

    if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
      return {
        "default": obj
      };
    }

    var cache = _getRequireWildcardCache(nodeInterop);

    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }

    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
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

  module.exports = _interopRequireWildcard;
  module.exports["default"] = module.exports, module.exports.__esModule = true;
  });

  unwrapExports(interopRequireWildcard);

  var createSvgIcon = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function get() {
      return utils.createSvgIcon;
    }
  });
  });

  unwrapExports(createSvgIcon);

  var Pause = createCommonjsModule(function (module, exports) {





  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;

  var React = interopRequireWildcard(React__default);

  var _createSvgIcon = interopRequireDefault(createSvgIcon);

  var _default = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
    d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z"
  }), 'Pause');

  exports.default = _default;
  });

  var PauseIcon = unwrapExports(Pause);

  var version = "1.2.3";

  var runtime_1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

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
    define(IteratorPrototype, iteratorSymbol, function () {
      return this;
    });

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
    GeneratorFunction.prototype = GeneratorFunctionPrototype;
    define(Gp, "constructor", GeneratorFunctionPrototype);
    define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
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
    define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
      return this;
    });
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
    define(Gp, iteratorSymbol, function() {
      return this;
    });

    define(Gp, "toString", function() {
      return "[object Generator]";
    });

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
    // in case runtime.js accidentally runs in strict mode, in modern engines
    // we can explicitly access globalThis. In older engines we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    if (typeof globalThis === "object") {
      globalThis.regeneratorRuntime = runtime;
    } else {
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  }
  });

  var version$1 = '1.31.0';

  var xhtml = "http://www.w3.org/1999/xhtml";

  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  function namespace(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
  }

  function creatorInherit(name) {
    return function() {
      var document = this.ownerDocument,
          uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml
          ? document.createElement(name)
          : document.createElementNS(uri, name);
    };
  }

  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }

  function creator(name) {
    var fullname = namespace(name);
    return (fullname.local
        ? creatorFixed
        : creatorInherit)(fullname);
  }

  function none() {}

  function selector(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  function selection_select(select) {
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function array(x) {
    return typeof x === "object" && "length" in x
      ? x // Array, TypedArray, NodeList, array-like
      : Array.from(x); // Map, Set, iterable, string, or anything else
  }

  function empty() {
    return [];
  }

  function selectorAll(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  function arrayAll(select) {
    return function() {
      var group = select.apply(this, arguments);
      return group == null ? [] : array(group);
    };
  }

  function selection_selectAll(select) {
    if (typeof select === "function") select = arrayAll(select);
    else select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }

    return new Selection(subgroups, parents);
  }

  function matcher(selector) {
    return function() {
      return this.matches(selector);
    };
  }

  function childMatcher(selector) {
    return function(node) {
      return node.matches(selector);
    };
  }

  var find = Array.prototype.find;

  function childFind(match) {
    return function() {
      return find.call(this.children, match);
    };
  }

  function childFirst() {
    return this.firstElementChild;
  }

  function selection_selectChild(match) {
    return this.select(match == null ? childFirst
        : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  var filter = Array.prototype.filter;

  function children() {
    return this.children;
  }

  function childrenFilter(match) {
    return function() {
      return filter.call(this.children, match);
    };
  }

  function selection_selectChildren(match) {
    return this.selectAll(match == null ? children
        : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  function selection_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function sparse(update) {
    return new Array(update.length);
  }

  function selection_enter() {
    return new Selection(this._enter || this._groups.map(sparse), this._parents);
  }

  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }

  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
    insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
    querySelector: function(selector) { return this._parent.querySelector(selector); },
    querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
  };

  function constant(x) {
    return function() {
      return x;
    };
  }

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
        node,
        groupLength = group.length,
        dataLength = data.length;

    // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Put any non-null nodes that don’t fit into exit.
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }

  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
        node,
        nodeByKeyValue = new Map,
        groupLength = group.length,
        dataLength = data.length,
        keyValues = new Array(groupLength),
        keyValue;

    // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }

    // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.
    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Add any remaining nodes that were not bound to data to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
        exit[i] = node;
      }
    }
  }

  function datum(node) {
    return node.__data__;
  }

  function selection_data(value, key) {
    if (!arguments.length) return Array.from(this, datum);

    var bind = key ? bindKey : bindIndex,
        parents = this._parents,
        groups = this._groups;

    if (typeof value !== "function") value = constant(value);

    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
          group = groups[j],
          groupLength = group.length,
          data = array(value.call(parent, parent && parent.__data__, j, parents)),
          dataLength = data.length,
          enterGroup = enter[j] = new Array(dataLength),
          updateGroup = update[j] = new Array(dataLength),
          exitGroup = exit[j] = new Array(groupLength);

      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null;
        }
      }
    }

    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  function selection_exit() {
    return new Selection(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_join(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
    if (onupdate != null) update = onupdate(update);
    if (onexit == null) exit.remove(); else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  function selection_merge(selection) {
    if (!(selection instanceof Selection)) throw new Error("invalid merge");

    for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Selection(merges, this._parents);
  }

  function selection_order() {

    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }

    return this;
  }

  function selection_sort(compare) {
    if (!compare) compare = ascending;

    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }

    return new Selection(sortgroups, this._parents).order();
  }

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes() {
    return Array.from(this);
  }

  function selection_node() {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }

    return null;
  }

  function selection_size() {
    let size = 0;
    for (const node of this) ++size; // eslint-disable-line no-unused-vars
    return size;
  }

  function selection_empty() {
    return !this.node();
  }

  function selection_each(callback) {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }

    return this;
  }

  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }

  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }

  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }

  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }

  function selection_attr(name, value) {
    var fullname = namespace(name);

    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local
          ? node.getAttributeNS(fullname.space, fullname.local)
          : node.getAttribute(fullname);
    }

    return this.each((value == null
        ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
        ? (fullname.local ? attrFunctionNS : attrFunction)
        : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
  }

  function defaultView(node) {
    return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
        || (node.document && node) // node is a Window
        || node.defaultView; // node is a Document
  }

  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }

  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }

  function selection_style(name, value, priority) {
    return arguments.length > 1
        ? this.each((value == null
              ? styleRemove : typeof value === "function"
              ? styleFunction
              : styleConstant)(name, value, priority == null ? "" : priority))
        : styleValue(this.node(), name);
  }

  function styleValue(node, name) {
    return node.style.getPropertyValue(name)
        || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }

  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }

  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }

  function selection_property(name, value) {
    return arguments.length > 1
        ? this.each((value == null
            ? propertyRemove : typeof value === "function"
            ? propertyFunction
            : propertyConstant)(name, value))
        : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }

  function classList(node) {
    return node.classList || new ClassList(node);
  }

  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }

  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };

  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }

  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }

  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }

  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }

  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }

  function selection_classed(name, value) {
    var names = classArray(name + "");

    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }

    return this.each((typeof value === "function"
        ? classedFunction : value
        ? classedTrue
        : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }

  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }

  function selection_text(value) {
    return arguments.length
        ? this.each(value == null
            ? textRemove : (typeof value === "function"
            ? textFunction
            : textConstant)(value))
        : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }

  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }

  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }

  function selection_html(value) {
    return arguments.length
        ? this.each(value == null
            ? htmlRemove : (typeof value === "function"
            ? htmlFunction
            : htmlConstant)(value))
        : this.node().innerHTML;
  }

  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }

  function selection_raise() {
    return this.each(raise);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }

  function selection_lower() {
    return this.each(lower);
  }

  function selection_append(name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function() {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }

  function selection_insert(name, before) {
    var create = typeof name === "function" ? name : creator(name),
        select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function() {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }

  function selection_remove() {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_clone(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum(value) {
    return arguments.length
        ? this.property("__data__", value)
        : this.node().__data__;
  }

  function contextListener(listener) {
    return function(event) {
      listener.call(this, event, this.__data__);
    };
  }

  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return {type: t, name: name};
    });
  }

  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }

  function onAdd(typename, value, options) {
    return function() {
      var on = this.__on, o, listener = contextListener(value);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }

  function selection_on(typename, value, options) {
    var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }

    on = value ? onAdd : onRemove;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    return this;
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
        event = window.CustomEvent;

    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type, false, false);
    }

    node.dispatchEvent(event);
  }

  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }

  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }

  function selection_dispatch(type, params) {
    return this.each((typeof params === "function"
        ? dispatchFunction
        : dispatchConstant)(type, params));
  }

  function* selection_iterator() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) yield node;
      }
    }
  }

  var root = [null];

  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }

  function selection() {
    return new Selection([[document.documentElement]], root);
  }

  function selection_selection() {
    return this;
  }

  Selection.prototype = selection.prototype = {
    constructor: Selection,
    select: selection_select,
    selectAll: selection_selectAll,
    selectChild: selection_selectChild,
    selectChildren: selection_selectChildren,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    join: selection_join,
    merge: selection_merge,
    selection: selection_selection,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch,
    [Symbol.iterator]: selection_iterator
  };

  function select(selector) {
    return typeof selector === "string"
        ? new Selection([[document.querySelector(selector)]], [document.documentElement])
        : new Selection([[selector]], root);
  }

  function sourceEvent(event) {
    let sourceEvent;
    while (sourceEvent = event.sourceEvent) event = sourceEvent;
    return event;
  }

  function pointer(event, node) {
    event = sourceEvent(event);
    if (node === undefined) node = event.currentTarget;
    if (node) {
      var svg = node.ownerSVGElement || node;
      if (svg.createSVGPoint) {
        var point = svg.createSVGPoint();
        point.x = event.clientX, point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
      }
      if (node.getBoundingClientRect) {
        var rect = node.getBoundingClientRect();
        return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
      }
    }
    return [event.pageX, event.pageY];
  }

  function selectAll(selector) {
    return typeof selector === "string"
        ? new Selection([document.querySelectorAll(selector)], [document.documentElement])
        : new Selection([selector == null ? [] : array(selector)], root);
  }

  function responseBlob(response) {
    if (!response.ok) throw new Error(response.status + " " + response.statusText);
    return response.blob();
  }

  function blob(input, init) {
    return fetch(input, init).then(responseBlob);
  }

  function responseArrayBuffer(response) {
    if (!response.ok) throw new Error(response.status + " " + response.statusText);
    return response.arrayBuffer();
  }

  function buffer(input, init) {
    return fetch(input, init).then(responseArrayBuffer);
  }

  var EOL = {},
      EOF = {},
      QUOTE = 34,
      NEWLINE = 10,
      RETURN = 13;

  function objectConverter(columns) {
    return new Function("d", "return {" + columns.map(function(name, i) {
      return JSON.stringify(name) + ": d[" + i + "] || \"\"";
    }).join(",") + "}");
  }

  function customConverter(columns, f) {
    var object = objectConverter(columns);
    return function(row, i) {
      return f(object(row), i, columns);
    };
  }

  // Compute unique columns in order of discovery.
  function inferColumns(rows) {
    var columnSet = Object.create(null),
        columns = [];

    rows.forEach(function(row) {
      for (var column in row) {
        if (!(column in columnSet)) {
          columns.push(columnSet[column] = column);
        }
      }
    });

    return columns;
  }

  function pad(value, width) {
    var s = value + "", length = s.length;
    return length < width ? new Array(width - length + 1).join(0) + s : s;
  }

  function formatYear(year) {
    return year < 0 ? "-" + pad(-year, 6)
      : year > 9999 ? "+" + pad(year, 6)
      : pad(year, 4);
  }

  function formatDate(date) {
    var hours = date.getUTCHours(),
        minutes = date.getUTCMinutes(),
        seconds = date.getUTCSeconds(),
        milliseconds = date.getUTCMilliseconds();
    return isNaN(date) ? "Invalid Date"
        : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
        + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
        : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
        : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
        : "");
  }

  function dsvFormat(delimiter) {
    var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
        DELIMITER = delimiter.charCodeAt(0);

    function parse(text, f) {
      var convert, columns, rows = parseRows(text, function(row, i) {
        if (convert) return convert(row, i - 1);
        columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
      });
      rows.columns = columns || [];
      return rows;
    }

    function parseRows(text, f) {
      var rows = [], // output rows
          N = text.length,
          I = 0, // current character index
          n = 0, // current line number
          t, // current token
          eof = N <= 0, // current token followed by EOF?
          eol = false; // current token followed by EOL?

      // Strip the trailing newline.
      if (text.charCodeAt(N - 1) === NEWLINE) --N;
      if (text.charCodeAt(N - 1) === RETURN) --N;

      function token() {
        if (eof) return EOF;
        if (eol) return eol = false, EOL;

        // Unescape quotes.
        var i, j = I, c;
        if (text.charCodeAt(j) === QUOTE) {
          while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
          if ((i = I) >= N) eof = true;
          else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
          else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
          return text.slice(j + 1, i - 1).replace(/""/g, "\"");
        }

        // Find next delimiter or newline.
        while (I < N) {
          if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
          else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
          else if (c !== DELIMITER) continue;
          return text.slice(j, i);
        }

        // Return last token before EOF.
        return eof = true, text.slice(j, N);
      }

      while ((t = token()) !== EOF) {
        var row = [];
        while (t !== EOL && t !== EOF) row.push(t), t = token();
        if (f && (row = f(row, n++)) == null) continue;
        rows.push(row);
      }

      return rows;
    }

    function preformatBody(rows, columns) {
      return rows.map(function(row) {
        return columns.map(function(column) {
          return formatValue(row[column]);
        }).join(delimiter);
      });
    }

    function format(rows, columns) {
      if (columns == null) columns = inferColumns(rows);
      return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
    }

    function formatBody(rows, columns) {
      if (columns == null) columns = inferColumns(rows);
      return preformatBody(rows, columns).join("\n");
    }

    function formatRows(rows) {
      return rows.map(formatRow).join("\n");
    }

    function formatRow(row) {
      return row.map(formatValue).join(delimiter);
    }

    function formatValue(value) {
      return value == null ? ""
          : value instanceof Date ? formatDate(value)
          : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
          : value;
    }

    return {
      parse: parse,
      parseRows: parseRows,
      format: format,
      formatBody: formatBody,
      formatRows: formatRows,
      formatRow: formatRow,
      formatValue: formatValue
    };
  }

  var csv = dsvFormat(",");

  var csvParse = csv.parse;

  var tsv = dsvFormat("\t");

  var tsvParse = tsv.parse;

  function responseText(response) {
    if (!response.ok) throw new Error(response.status + " " + response.statusText);
    return response.text();
  }

  function text(input, init) {
    return fetch(input, init).then(responseText);
  }

  function dsvParse(parse) {
    return function(input, init, row) {
      if (arguments.length === 2 && typeof init === "function") row = init, init = undefined;
      return text(input, init).then(function(response) {
        return parse(response, row);
      });
    };
  }

  function dsv(delimiter, input, init, row) {
    if (arguments.length === 3 && typeof init === "function") row = init, init = undefined;
    var format = dsvFormat(delimiter);
    return text(input, init).then(function(response) {
      return format.parse(response, row);
    });
  }

  var csv$1 = dsvParse(csvParse);
  var tsv$1 = dsvParse(tsvParse);

  function image(input, init) {
    return new Promise(function(resolve, reject) {
      var image = new Image;
      for (var key in init) image[key] = init[key];
      image.onerror = reject;
      image.onload = function() { resolve(image); };
      image.src = input;
    });
  }

  function responseJson(response) {
    if (!response.ok) throw new Error(response.status + " " + response.statusText);
    if (response.status === 204 || response.status === 205) return;
    return response.json();
  }

  function json(input, init) {
    return fetch(input, init).then(responseJson);
  }

  function parser(type) {
    return (input, init) => text(input, init)
      .then(text => (new DOMParser).parseFromString(text, type));
  }

  var xml = parser("application/xml");

  var html = parser("text/html");

  var svg = parser("image/svg+xml");



  var d3fetch = {
    __proto__: null,
    blob: blob,
    buffer: buffer,
    dsv: dsv,
    csv: csv$1,
    tsv: tsv$1,
    image: image,
    json: json,
    text: text,
    xml: xml,
    html: html,
    svg: svg
  };

  var noop = {value: () => {}};

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames$1(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {type: t, name: name};
    });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._,
          T = parseTypenames$1(typename + "", _),
          t,
          i = -1,
          n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
      }

      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };

  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({name: name, value: callback});
    return type;
  }



  var d3dispatch = {
    __proto__: null,
    dispatch: dispatch
  };

  function noevent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function dragDisable(view) {
    var root = view.document.documentElement,
        selection = select(view).on("dragstart.drag", noevent, true);
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", noevent, true);
    } else {
      root.__noselect = root.style.MozUserSelect;
      root.style.MozUserSelect = "none";
    }
  }

  function yesdrag(view, noclick) {
    var root = view.document.documentElement,
        selection = select(view).on("dragstart.drag", null);
    if (noclick) {
      selection.on("click.drag", noevent, true);
      setTimeout(function() { selection.on("click.drag", null); }, 0);
    }
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", null);
    } else {
      root.style.MozUserSelect = root.__noselect;
      delete root.__noselect;
    }
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}

  var darker = 0.7;
  var brighter = 1 / darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
      reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      reHex = /^#([0-9a-f]{3,8})$/,
      reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
      reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
      reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
      reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
      reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
      reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };

  define(Color, color, {
    copy: function(channels) {
      return Object.assign(new this.constructor, this, channels);
    },
    displayable: function() {
      return this.rgb().displayable();
    },
    hex: color_formatHex, // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });

  function color_formatHex() {
    return this.rgb().formatHex();
  }

  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }

  function color_formatRgb() {
    return this.rgb().formatRgb();
  }

  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
        : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
        : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
        : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
        : null) // invalid hex
        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
        : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
        : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb: function() {
      return this;
    },
    displayable: function() {
      return (-0.5 <= this.r && this.r < 255.5)
          && (-0.5 <= this.g && this.g < 255.5)
          && (-0.5 <= this.b && this.b < 255.5)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex, // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));

  function rgb_formatHex() {
    return "#" + hex(this.r) + hex(this.g) + hex(this.b);
  }

  function rgb_formatRgb() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(")
        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
        + (a === 1 ? ")" : ", " + a + ")");
  }

  function hex(value) {
    value = Math.max(0, Math.min(255, Math.round(value) || 0));
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl;
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    displayable: function() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
          && (0 <= this.l && this.l <= 1)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl: function() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "hsl(" : "hsla(")
          + (this.h || 0) + ", "
          + (this.s || 0) * 100 + "%, "
          + (this.l || 0) * 100 + "%"
          + (a === 1 ? ")" : ", " + a + ")");
    }
  }));

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60
        : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
        : m1) * 255;
  }

  var constant$1 = x => () => x;

  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
  }

  var interpolateRgb = (function rgbGamma(y) {
    var color = gamma(y);

    function rgb$1(start, end) {
      var r = color((start = rgb(start)).r, (end = rgb(end)).r),
          g = color(start.g, end.g),
          b = color(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb$1.gamma = rgbGamma;

    return rgb$1;
  })(1);

  function numberArray(a, b) {
    if (!b) b = [];
    var n = a ? Math.min(b.length, a.length) : 0,
        c = b.slice(),
        i;
    return function(t) {
      for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
      return c;
    };
  }

  function isNumberArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }

  function genericArray(a, b) {
    var nb = b ? b.length : 0,
        na = a ? Math.min(nb, a.length) : 0,
        x = new Array(na),
        c = new Array(nb),
        i;

    for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
    for (; i < nb; ++i) c[i] = b[i];

    return function(t) {
      for (i = 0; i < na; ++i) c[i] = x[i](t);
      return c;
    };
  }

  function date(a, b) {
    var d = new Date;
    return a = +a, b = +b, function(t) {
      return d.setTime(a * (1 - t) + b * t), d;
    };
  }

  function interpolateNumber(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  function object(a, b) {
    var i = {},
        c = {},
        k;

    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};

    for (k in b) {
      if (k in a) {
        i[k] = interpolate(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }

    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function() {
      return b;
    };
  }

  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }

  function interpolateString(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
        am, // current match in a
        bm, // current match in b
        bs, // string preceding current number in b, if any
        i = -1, // index in s
        s = [], // string constants and placeholders
        q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a))
        && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) { // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else { // interpolate non-matching numbers
        s[++i] = null;
        q.push({i: i, x: interpolateNumber(am, bm)});
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? (q[0]
        ? one(q[0].x)
        : zero(b))
        : (b = q.length, function(t) {
            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          });
  }

  function interpolate(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant$1(b)
        : (t === "number" ? interpolateNumber
        : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
        : b instanceof color ? interpolateRgb
        : b instanceof Date ? date
        : isNumberArray(b) ? numberArray
        : Array.isArray(b) ? genericArray
        : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
        : interpolateNumber)(a, b);
  }

  function interpolateRound(a, b) {
    return a = +a, b = +b, function(t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }

  var degrees = 180 / Math.PI;

  var identity = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };

  function decompose(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees,
      skewX: Math.atan(skewX) * degrees,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

  var svgNode;

  /* eslint-disable no-undef */
  function parseCss(value) {
    const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    return m.isIdentity ? identity : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
  }

  function parseSvg(value) {
    if (value == null) return identity;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
    value = value.matrix;
    return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  function interpolateTransform(parse, pxComma, pxParen, degParen) {

    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }

    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }

    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
        q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }

    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }

    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }

    return function(a, b) {
      var s = [], // string constants and placeholders
          q = []; // number interpolators
      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null; // gc
      return function(t) {
        var i = -1, n = q.length, o;
        while (++i < n) s[(o = q[i]).i] = o.x(t);
        return s.join("");
      };
    };
  }

  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  var frame = 0, // is an animation frame pending?
      timeout = 0, // is a timeout pending?
      interval = 0, // are any timers active?
      pokeDelay = 1000, // how frequently we check for clock skew
      taskHead,
      taskTail,
      clockLast = 0,
      clockNow = 0,
      clockSkew = 0,
      clock = typeof performance === "object" && performance.now ? performance : Date,
      setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }

  function clearNow() {
    clockNow = 0;
  }

  function Timer() {
    this._call =
    this._time =
    this._next = null;
  }

  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };

  function timer(callback, delay, time) {
    var t = new Timer;
    t.restart(callback, delay, time);
    return t;
  }

  function timerFlush() {
    now(); // Get the current time, if not already set.
    ++frame; // Pretend we’ve set an alarm, if we haven’t already.
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
      t = t._next;
    }
    --frame;
  }

  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }

  function poke() {
    var now = clock.now(), delay = now - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
  }

  function nap() {
    var t0, t1 = taskHead, t2, time = Infinity;
    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time);
  }

  function sleep(time) {
    if (frame) return; // Soonest alarm already set, or will be.
    if (timeout) timeout = clearTimeout(timeout);
    var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
    if (delay > 24) {
      if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  function timeout$1(callback, delay, time) {
    var t = new Timer;
    delay = delay == null ? 0 : +delay;
    t.restart(elapsed => {
      t.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t;
  }

  var emptyOn = dispatch("start", "end", "cancel", "interrupt");
  var emptyTween = [];

  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;

  function schedule(node, name, id, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};
    else if (id in schedules) return;
    create(node, id, {
      name: name,
      index: index, // For context during callback.
      group: group, // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }

  function init(node, id) {
    var schedule = get$1(node, id);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }

  function set$1(node, id) {
    var schedule = get$1(node, id);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }

  function get$1(node, id) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
    return schedule;
  }

  function create(node, id, self) {
    var schedules = node.__transition,
        tween;

    // Initialize the self timer when the transition is created.
    // Note the actual delay is not known until the first callback!
    schedules[id] = self;
    self.timer = timer(schedule, 0, self.time);

    function schedule(elapsed) {
      self.state = SCHEDULED;
      self.timer.restart(start, self.delay, self.time);

      // If the elapsed delay is less than our first sleep, start immediately.
      if (self.delay <= elapsed) start(elapsed - self.delay);
    }

    function start(elapsed) {
      var i, j, n, o;

      // If the state is not SCHEDULED, then we previously errored on start.
      if (self.state !== SCHEDULED) return stop();

      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self.name) continue;

        // While this element already has a starting transition during this frame,
        // defer starting an interrupting transition until that transition has a
        // chance to tick (and possibly end); see d3/d3-transition#54!
        if (o.state === STARTED) return timeout$1(start);

        // Interrupt the active transition, if any.
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }

        // Cancel any pre-empted transitions.
        else if (+i < id) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }

      // Defer the first tick to end of the current frame; see d3/d3#1576.
      // Note the transition may be canceled after start and before the first tick!
      // Note this must be scheduled before the start event; see d3/d3-transition#16!
      // Assuming this is successful, subsequent callbacks go straight to tick.
      timeout$1(function() {
        if (self.state === STARTED) {
          self.state = RUNNING;
          self.timer.restart(tick, self.delay, self.time);
          tick(elapsed);
        }
      });

      // Dispatch the start event.
      // Note this must be done before the tween are initialized.
      self.state = STARTING;
      self.on.call("start", node, node.__data__, self.index, self.group);
      if (self.state !== STARTING) return; // interrupted
      self.state = STARTED;

      // Initialize the tween, deleting null tween.
      tween = new Array(n = self.tween.length);
      for (i = 0, j = -1; i < n; ++i) {
        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }

    function tick(elapsed) {
      var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
          i = -1,
          n = tween.length;

      while (++i < n) {
        tween[i].call(node, t);
      }

      // Dispatch the end event.
      if (self.state === ENDING) {
        self.on.call("end", node, node.__data__, self.index, self.group);
        stop();
      }
    }

    function stop() {
      self.state = ENDED;
      self.timer.stop();
      delete schedules[id];
      for (var i in schedules) return; // eslint-disable-line no-unused-vars
      delete node.__transition;
    }
  }

  function interrupt(node, name) {
    var schedules = node.__transition,
        schedule,
        active,
        empty = true,
        i;

    if (!schedules) return;

    name = name == null ? null : name + "";

    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }

    if (empty) delete node.__transition;
  }

  function selection_interrupt(name) {
    return this.each(function() {
      interrupt(this, name);
    });
  }

  function tweenRemove(id, name) {
    var tween0, tween1;
    return function() {
      var schedule = set$1(this, id),
          tween = schedule.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }

      schedule.tween = tween1;
    };
  }

  function tweenFunction(id, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error;
    return function() {
      var schedule = set$1(this, id),
          tween = schedule.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }
        if (i === n) tween1.push(t);
      }

      schedule.tween = tween1;
    };
  }

  function transition_tween(name, value) {
    var id = this._id;

    name += "";

    if (arguments.length < 2) {
      var tween = get$1(this.node(), id).tween;
      for (var i = 0, n = tween.length, t; i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }
      return null;
    }

    return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
  }

  function tweenValue(transition, name, value) {
    var id = transition._id;

    transition.each(function() {
      var schedule = set$1(this, id);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });

    return function(node) {
      return get$1(node, id).value[name];
    };
  }

  function interpolate$1(a, b) {
    var c;
    return (typeof b === "number" ? interpolateNumber
        : b instanceof color ? interpolateRgb
        : (c = color(b)) ? (b = c, interpolateRgb)
        : interpolateString)(a, b);
  }

  function attrRemove$1(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS$1(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant$1(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrConstantNS$1(fullname, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrFunction$1(name, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function attrFunctionNS$1(fullname, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function transition_attr(name, value) {
    var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate$1;
    return this.attrTween(name, typeof value === "function"
        ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value))
        : value == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname)
        : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value));
  }

  function attrInterpolate(name, i) {
    return function(t) {
      this.setAttribute(name, i.call(this, t));
    };
  }

  function attrInterpolateNS(fullname, i) {
    return function(t) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    };
  }

  function attrTweenNS(fullname, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function attrTween(name, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function transition_attrTween(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    var fullname = namespace(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  function delayFunction(id, value) {
    return function() {
      init(this, id).delay = +value.apply(this, arguments);
    };
  }

  function delayConstant(id, value) {
    return value = +value, function() {
      init(this, id).delay = value;
    };
  }

  function transition_delay(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? delayFunction
            : delayConstant)(id, value))
        : get$1(this.node(), id).delay;
  }

  function durationFunction(id, value) {
    return function() {
      set$1(this, id).duration = +value.apply(this, arguments);
    };
  }

  function durationConstant(id, value) {
    return value = +value, function() {
      set$1(this, id).duration = value;
    };
  }

  function transition_duration(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? durationFunction
            : durationConstant)(id, value))
        : get$1(this.node(), id).duration;
  }

  function easeConstant(id, value) {
    if (typeof value !== "function") throw new Error;
    return function() {
      set$1(this, id).ease = value;
    };
  }

  function transition_ease(value) {
    var id = this._id;

    return arguments.length
        ? this.each(easeConstant(id, value))
        : get$1(this.node(), id).ease;
  }

  function easeVarying(id, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (typeof v !== "function") throw new Error;
      set$1(this, id).ease = v;
    };
  }

  function transition_easeVarying(value) {
    if (typeof value !== "function") throw new Error;
    return this.each(easeVarying(this._id, value));
  }

  function transition_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  function transition_merge(transition) {
    if (transition._id !== this._id) throw new Error;

    for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Transition(merges, this._parents, this._name, this._id);
  }

  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t) {
      var i = t.indexOf(".");
      if (i >= 0) t = t.slice(0, i);
      return !t || t === "start";
    });
  }

  function onFunction(id, name, listener) {
    var on0, on1, sit = start(name) ? init : set$1;
    return function() {
      var schedule = sit(this, id),
          on = schedule.on;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

      schedule.on = on1;
    };
  }

  function transition_on(name, listener) {
    var id = this._id;

    return arguments.length < 2
        ? get$1(this.node(), id).on.on(name)
        : this.each(onFunction(id, name, listener));
  }

  function removeFunction(id) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition) if (+i !== id) return;
      if (parent) parent.removeChild(this);
    };
  }

  function transition_remove() {
    return this.on("end.remove", removeFunction(this._id));
  }

  function transition_select(select) {
    var name = this._name,
        id = this._id;

    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
        }
      }
    }

    return new Transition(subgroups, this._parents, name, id);
  }

  function transition_selectAll(select) {
    var name = this._name,
        id = this._id;

    if (typeof select !== "function") select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children = select.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
            if (child = children[k]) {
              schedule(child, name, id, k, children, inherit);
            }
          }
          subgroups.push(children);
          parents.push(node);
        }
      }
    }

    return new Transition(subgroups, parents, name, id);
  }

  var Selection$1 = selection.prototype.constructor;

  function transition_selection() {
    return new Selection$1(this._groups, this._parents);
  }

  function styleNull(name, interpolate) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }

  function styleRemove$1(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant$1(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function styleFunction$1(name, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          value1 = value(this),
          string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function styleMaybeRemove(id, name) {
    var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
    return function() {
      var schedule = set$1(this, id),
          on = schedule.on,
          listener = schedule.value[key] == null ? remove || (remove = styleRemove$1(name)) : undefined;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

      schedule.on = on1;
    };
  }

  function transition_style(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate$1;
    return value == null ? this
        .styleTween(name, styleNull(name, i))
        .on("end.style." + name, styleRemove$1(name))
      : typeof value === "function" ? this
        .styleTween(name, styleFunction$1(name, i, tweenValue(this, "style." + name, value)))
        .each(styleMaybeRemove(this._id, name))
      : this
        .styleTween(name, styleConstant$1(name, i, value), priority)
        .on("end.style." + name, null);
  }

  function styleInterpolate(name, i, priority) {
    return function(t) {
      this.style.setProperty(name, i.call(this, t), priority);
    };
  }

  function styleTween(name, value, priority) {
    var t, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }
    tween._value = value;
    return tween;
  }

  function transition_styleTween(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  function textConstant$1(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction$1(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }

  function transition_text(value) {
    return this.tween("text", typeof value === "function"
        ? textFunction$1(tweenValue(this, "text", value))
        : textConstant$1(value == null ? "" : value + ""));
  }

  function textInterpolate(i) {
    return function(t) {
      this.textContent = i.call(this, t);
    };
  }

  function textTween(value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function transition_textTween(value) {
    var key = "text";
    if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    return this.tween(key, textTween(value));
  }

  function transition_transition() {
    var name = this._name,
        id0 = this._id,
        id1 = newId();

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit = get$1(node, id0);
          schedule(node, name, id1, i, group, {
            time: inherit.time + inherit.delay + inherit.duration,
            delay: 0,
            duration: inherit.duration,
            ease: inherit.ease
          });
        }
      }
    }

    return new Transition(groups, this._parents, name, id1);
  }

  function transition_end() {
    var on0, on1, that = this, id = that._id, size = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = {value: reject},
          end = {value: function() { if (--size === 0) resolve(); }};

      that.each(function() {
        var schedule = set$1(this, id),
            on = schedule.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }

        schedule.on = on1;
      });

      // The selection was empty, resolve end immediately
      if (size === 0) resolve();
    });
  }

  var id = 0;

  function Transition(groups, parents, name, id) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id;
  }

  function transition(name) {
    return selection().transition(name);
  }

  function newId() {
    return ++id;
  }

  var selection_prototype = selection.prototype;

  Transition.prototype = transition.prototype = {
    constructor: Transition,
    select: transition_select,
    selectAll: transition_selectAll,
    filter: transition_filter,
    merge: transition_merge,
    selection: transition_selection,
    transition: transition_transition,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: transition_on,
    attr: transition_attr,
    attrTween: transition_attrTween,
    style: transition_style,
    styleTween: transition_styleTween,
    text: transition_text,
    textTween: transition_textTween,
    remove: transition_remove,
    tween: transition_tween,
    delay: transition_delay,
    duration: transition_duration,
    ease: transition_ease,
    easeVarying: transition_easeVarying,
    end: transition_end,
    [Symbol.iterator]: selection_prototype[Symbol.iterator]
  };

  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }

  // tpmt is two power minus ten times t scaled to [0,1]
  function tpmt(x) {
    return (Math.pow(2, -10 * x) - 0.0009765625) * 1.0009775171065494;
  }

  function expIn(t) {
    return tpmt(1 - +t);
  }

  var defaultTiming = {
    time: null, // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };

  function inherit(node, id) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id])) {
      if (!(node = node.parentNode)) {
        throw new Error(`transition ${id} not found`);
      }
    }
    return timing;
  }

  function selection_transition(name) {
    var id,
        timing;

    if (name instanceof Transition) {
      id = name._id, name = name._name;
    } else {
      id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule(node, name, id, i, group, timing || inherit(node, id));
        }
      }
    }

    return new Transition(groups, this._parents, name, id);
  }

  selection.prototype.interrupt = selection_interrupt;
  selection.prototype.transition = selection_transition;

  var constant$2 = x => () => x;

  function BrushEvent(type, {
    sourceEvent,
    target,
    selection,
    mode,
    dispatch
  }) {
    Object.defineProperties(this, {
      type: {value: type, enumerable: true, configurable: true},
      sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
      target: {value: target, enumerable: true, configurable: true},
      selection: {value: selection, enumerable: true, configurable: true},
      mode: {value: mode, enumerable: true, configurable: true},
      _: {value: dispatch}
    });
  }

  function nopropagation(event) {
    event.stopImmediatePropagation();
  }

  function noevent$1(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  var MODE_DRAG = {name: "drag"},
      MODE_SPACE = {name: "space"},
      MODE_HANDLE = {name: "handle"},
      MODE_CENTER = {name: "center"};

  const {abs, max, min} = Math;

  function number1(e) {
    return [+e[0], +e[1]];
  }

  function number2(e) {
    return [number1(e[0]), number1(e[1])];
  }

  var X = {
    name: "x",
    handles: ["w", "e"].map(type),
    input: function(x, e) { return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]]; },
    output: function(xy) { return xy && [xy[0][0], xy[1][0]]; }
  };

  var Y = {
    name: "y",
    handles: ["n", "s"].map(type),
    input: function(y, e) { return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]]; },
    output: function(xy) { return xy && [xy[0][1], xy[1][1]]; }
  };

  var XY = {
    name: "xy",
    handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
    input: function(xy) { return xy == null ? null : number2(xy); },
    output: function(xy) { return xy; }
  };

  var cursors = {
    overlay: "crosshair",
    selection: "move",
    n: "ns-resize",
    e: "ew-resize",
    s: "ns-resize",
    w: "ew-resize",
    nw: "nwse-resize",
    ne: "nesw-resize",
    se: "nwse-resize",
    sw: "nesw-resize"
  };

  var flipX = {
    e: "w",
    w: "e",
    nw: "ne",
    ne: "nw",
    se: "sw",
    sw: "se"
  };

  var flipY = {
    n: "s",
    s: "n",
    nw: "sw",
    ne: "se",
    se: "ne",
    sw: "nw"
  };

  var signsX = {
    overlay: +1,
    selection: +1,
    n: null,
    e: +1,
    s: null,
    w: -1,
    nw: -1,
    ne: +1,
    se: +1,
    sw: -1
  };

  var signsY = {
    overlay: +1,
    selection: +1,
    n: -1,
    e: null,
    s: +1,
    w: null,
    nw: -1,
    ne: -1,
    se: +1,
    sw: +1
  };

  function type(t) {
    return {type: t};
  }

  // Ignore right-click, since that should open the context menu.
  function defaultFilter(event) {
    return !event.ctrlKey && !event.button;
  }

  function defaultExtent() {
    var svg = this.ownerSVGElement || this;
    if (svg.hasAttribute("viewBox")) {
      svg = svg.viewBox.baseVal;
      return [[svg.x, svg.y], [svg.x + svg.width, svg.y + svg.height]];
    }
    return [[0, 0], [svg.width.baseVal.value, svg.height.baseVal.value]];
  }

  function defaultTouchable() {
    return navigator.maxTouchPoints || ("ontouchstart" in this);
  }

  // Like d3.local, but with the name “__brush” rather than auto-generated.
  function local(node) {
    while (!node.__brush) if (!(node = node.parentNode)) return;
    return node.__brush;
  }

  function empty$1(extent) {
    return extent[0][0] === extent[1][0]
        || extent[0][1] === extent[1][1];
  }

  function brushSelection(node) {
    var state = node.__brush;
    return state ? state.dim.output(state.selection) : null;
  }

  function brushX() {
    return brush$1(X);
  }

  function brushY() {
    return brush$1(Y);
  }

  function brush() {
    return brush$1(XY);
  }

  function brush$1(dim) {
    var extent = defaultExtent,
        filter = defaultFilter,
        touchable = defaultTouchable,
        keys = true,
        listeners = dispatch("start", "brush", "end"),
        handleSize = 6,
        touchending;

    function brush(group) {
      var overlay = group
          .property("__brush", initialize)
        .selectAll(".overlay")
        .data([type("overlay")]);

      overlay.enter().append("rect")
          .attr("class", "overlay")
          .attr("pointer-events", "all")
          .attr("cursor", cursors.overlay)
        .merge(overlay)
          .each(function() {
            var extent = local(this).extent;
            select(this)
                .attr("x", extent[0][0])
                .attr("y", extent[0][1])
                .attr("width", extent[1][0] - extent[0][0])
                .attr("height", extent[1][1] - extent[0][1]);
          });

      group.selectAll(".selection")
        .data([type("selection")])
        .enter().append("rect")
          .attr("class", "selection")
          .attr("cursor", cursors.selection)
          .attr("fill", "#777")
          .attr("fill-opacity", 0.3)
          .attr("stroke", "#fff")
          .attr("shape-rendering", "crispEdges");

      var handle = group.selectAll(".handle")
        .data(dim.handles, function(d) { return d.type; });

      handle.exit().remove();

      handle.enter().append("rect")
          .attr("class", function(d) { return "handle handle--" + d.type; })
          .attr("cursor", function(d) { return cursors[d.type]; });

      group
          .each(redraw)
          .attr("fill", "none")
          .attr("pointer-events", "all")
          .on("mousedown.brush", started)
        .filter(touchable)
          .on("touchstart.brush", started)
          .on("touchmove.brush", touchmoved)
          .on("touchend.brush touchcancel.brush", touchended)
          .style("touch-action", "none")
          .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }

    brush.move = function(group, selection) {
      if (group.tween) {
        group
            .on("start.brush", function(event) { emitter(this, arguments).beforestart().start(event); })
            .on("interrupt.brush end.brush", function(event) { emitter(this, arguments).end(event); })
            .tween("brush", function() {
              var that = this,
                  state = that.__brush,
                  emit = emitter(that, arguments),
                  selection0 = state.selection,
                  selection1 = dim.input(typeof selection === "function" ? selection.apply(this, arguments) : selection, state.extent),
                  i = interpolate(selection0, selection1);

              function tween(t) {
                state.selection = t === 1 && selection1 === null ? null : i(t);
                redraw.call(that);
                emit.brush();
              }

              return selection0 !== null && selection1 !== null ? tween : tween(1);
            });
      } else {
        group
            .each(function() {
              var that = this,
                  args = arguments,
                  state = that.__brush,
                  selection1 = dim.input(typeof selection === "function" ? selection.apply(that, args) : selection, state.extent),
                  emit = emitter(that, args).beforestart();

              interrupt(that);
              state.selection = selection1 === null ? null : selection1;
              redraw.call(that);
              emit.start().brush().end();
            });
      }
    };

    brush.clear = function(group) {
      brush.move(group, null);
    };

    function redraw() {
      var group = select(this),
          selection = local(this).selection;

      if (selection) {
        group.selectAll(".selection")
            .style("display", null)
            .attr("x", selection[0][0])
            .attr("y", selection[0][1])
            .attr("width", selection[1][0] - selection[0][0])
            .attr("height", selection[1][1] - selection[0][1]);

        group.selectAll(".handle")
            .style("display", null)
            .attr("x", function(d) { return d.type[d.type.length - 1] === "e" ? selection[1][0] - handleSize / 2 : selection[0][0] - handleSize / 2; })
            .attr("y", function(d) { return d.type[0] === "s" ? selection[1][1] - handleSize / 2 : selection[0][1] - handleSize / 2; })
            .attr("width", function(d) { return d.type === "n" || d.type === "s" ? selection[1][0] - selection[0][0] + handleSize : handleSize; })
            .attr("height", function(d) { return d.type === "e" || d.type === "w" ? selection[1][1] - selection[0][1] + handleSize : handleSize; });
      }

      else {
        group.selectAll(".selection,.handle")
            .style("display", "none")
            .attr("x", null)
            .attr("y", null)
            .attr("width", null)
            .attr("height", null);
      }
    }

    function emitter(that, args, clean) {
      var emit = that.__brush.emitter;
      return emit && (!clean || !emit.clean) ? emit : new Emitter(that, args, clean);
    }

    function Emitter(that, args, clean) {
      this.that = that;
      this.args = args;
      this.state = that.__brush;
      this.active = 0;
      this.clean = clean;
    }

    Emitter.prototype = {
      beforestart: function() {
        if (++this.active === 1) this.state.emitter = this, this.starting = true;
        return this;
      },
      start: function(event, mode) {
        if (this.starting) this.starting = false, this.emit("start", event, mode);
        else this.emit("brush", event);
        return this;
      },
      brush: function(event, mode) {
        this.emit("brush", event, mode);
        return this;
      },
      end: function(event, mode) {
        if (--this.active === 0) delete this.state.emitter, this.emit("end", event, mode);
        return this;
      },
      emit: function(type, event, mode) {
        var d = select(this.that).datum();
        listeners.call(
          type,
          this.that,
          new BrushEvent(type, {
            sourceEvent: event,
            target: brush,
            selection: dim.output(this.state.selection),
            mode,
            dispatch: listeners
          }),
          d
        );
      }
    };

    function started(event) {
      if (touchending && !event.touches) return;
      if (!filter.apply(this, arguments)) return;

      var that = this,
          type = event.target.__data__.type,
          mode = (keys && event.metaKey ? type = "overlay" : type) === "selection" ? MODE_DRAG : (keys && event.altKey ? MODE_CENTER : MODE_HANDLE),
          signX = dim === Y ? null : signsX[type],
          signY = dim === X ? null : signsY[type],
          state = local(that),
          extent = state.extent,
          selection = state.selection,
          W = extent[0][0], w0, w1,
          N = extent[0][1], n0, n1,
          E = extent[1][0], e0, e1,
          S = extent[1][1], s0, s1,
          dx = 0,
          dy = 0,
          moving,
          shifting = signX && signY && keys && event.shiftKey,
          lockX,
          lockY,
          points = Array.from(event.touches || [event], t => {
            const i = t.identifier;
            t = pointer(t, that);
            t.point0 = t.slice();
            t.identifier = i;
            return t;
          });

      if (type === "overlay") {
        if (selection) moving = true;
        const pts = [points[0], points[1] || points[0]];
        state.selection = selection = [[
            w0 = dim === Y ? W : min(pts[0][0], pts[1][0]),
            n0 = dim === X ? N : min(pts[0][1], pts[1][1])
          ], [
            e0 = dim === Y ? E : max(pts[0][0], pts[1][0]),
            s0 = dim === X ? S : max(pts[0][1], pts[1][1])
          ]];
        if (points.length > 1) move();
      } else {
        w0 = selection[0][0];
        n0 = selection[0][1];
        e0 = selection[1][0];
        s0 = selection[1][1];
      }

      w1 = w0;
      n1 = n0;
      e1 = e0;
      s1 = s0;

      var group = select(that)
          .attr("pointer-events", "none");

      var overlay = group.selectAll(".overlay")
          .attr("cursor", cursors[type]);

      interrupt(that);
      var emit = emitter(that, arguments, true).beforestart();

      if (event.touches) {
        emit.moved = moved;
        emit.ended = ended;
      } else {
        var view = select(event.view)
            .on("mousemove.brush", moved, true)
            .on("mouseup.brush", ended, true);
        if (keys) view
            .on("keydown.brush", keydowned, true)
            .on("keyup.brush", keyupped, true);

        dragDisable(event.view);
      }

      redraw.call(that);
      emit.start(event, mode.name);

      function moved(event) {
        for (const p of event.changedTouches || [event]) {
          for (const d of points)
            if (d.identifier === p.identifier) d.cur = pointer(p, that);
        }
        if (shifting && !lockX && !lockY && points.length === 1) {
          const point = points[0];
          if (abs(point.cur[0] - point[0]) > abs(point.cur[1] - point[1]))
            lockY = true;
          else
            lockX = true;
        }
        for (const point of points)
          if (point.cur) point[0] = point.cur[0], point[1] = point.cur[1];
        moving = true;
        noevent$1(event);
        move(event);
      }

      function move(event) {
        const point = points[0], point0 = point.point0;
        var t;

        dx = point[0] - point0[0];
        dy = point[1] - point0[1];

        switch (mode) {
          case MODE_SPACE:
          case MODE_DRAG: {
            if (signX) dx = max(W - w0, min(E - e0, dx)), w1 = w0 + dx, e1 = e0 + dx;
            if (signY) dy = max(N - n0, min(S - s0, dy)), n1 = n0 + dy, s1 = s0 + dy;
            break;
          }
          case MODE_HANDLE: {
            if (points[1]) {
              if (signX) w1 = max(W, min(E, points[0][0])), e1 = max(W, min(E, points[1][0])), signX = 1;
              if (signY) n1 = max(N, min(S, points[0][1])), s1 = max(N, min(S, points[1][1])), signY = 1;
            } else {
              if (signX < 0) dx = max(W - w0, min(E - w0, dx)), w1 = w0 + dx, e1 = e0;
              else if (signX > 0) dx = max(W - e0, min(E - e0, dx)), w1 = w0, e1 = e0 + dx;
              if (signY < 0) dy = max(N - n0, min(S - n0, dy)), n1 = n0 + dy, s1 = s0;
              else if (signY > 0) dy = max(N - s0, min(S - s0, dy)), n1 = n0, s1 = s0 + dy;
            }
            break;
          }
          case MODE_CENTER: {
            if (signX) w1 = max(W, min(E, w0 - dx * signX)), e1 = max(W, min(E, e0 + dx * signX));
            if (signY) n1 = max(N, min(S, n0 - dy * signY)), s1 = max(N, min(S, s0 + dy * signY));
            break;
          }
        }

        if (e1 < w1) {
          signX *= -1;
          t = w0, w0 = e0, e0 = t;
          t = w1, w1 = e1, e1 = t;
          if (type in flipX) overlay.attr("cursor", cursors[type = flipX[type]]);
        }

        if (s1 < n1) {
          signY *= -1;
          t = n0, n0 = s0, s0 = t;
          t = n1, n1 = s1, s1 = t;
          if (type in flipY) overlay.attr("cursor", cursors[type = flipY[type]]);
        }

        if (state.selection) selection = state.selection; // May be set by brush.move!
        if (lockX) w1 = selection[0][0], e1 = selection[1][0];
        if (lockY) n1 = selection[0][1], s1 = selection[1][1];

        if (selection[0][0] !== w1
            || selection[0][1] !== n1
            || selection[1][0] !== e1
            || selection[1][1] !== s1) {
          state.selection = [[w1, n1], [e1, s1]];
          redraw.call(that);
          emit.brush(event, mode.name);
        }
      }

      function ended(event) {
        nopropagation(event);
        if (event.touches) {
          if (event.touches.length) return;
          if (touchending) clearTimeout(touchending);
          touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
        } else {
          yesdrag(event.view, moving);
          view.on("keydown.brush keyup.brush mousemove.brush mouseup.brush", null);
        }
        group.attr("pointer-events", "all");
        overlay.attr("cursor", cursors.overlay);
        if (state.selection) selection = state.selection; // May be set by brush.move (on start)!
        if (empty$1(selection)) state.selection = null, redraw.call(that);
        emit.end(event, mode.name);
      }

      function keydowned(event) {
        switch (event.keyCode) {
          case 16: { // SHIFT
            shifting = signX && signY;
            break;
          }
          case 18: { // ALT
            if (mode === MODE_HANDLE) {
              if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
              if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
              mode = MODE_CENTER;
              move();
            }
            break;
          }
          case 32: { // SPACE; takes priority over ALT
            if (mode === MODE_HANDLE || mode === MODE_CENTER) {
              if (signX < 0) e0 = e1 - dx; else if (signX > 0) w0 = w1 - dx;
              if (signY < 0) s0 = s1 - dy; else if (signY > 0) n0 = n1 - dy;
              mode = MODE_SPACE;
              overlay.attr("cursor", cursors.selection);
              move();
            }
            break;
          }
          default: return;
        }
        noevent$1(event);
      }

      function keyupped(event) {
        switch (event.keyCode) {
          case 16: { // SHIFT
            if (shifting) {
              lockX = lockY = shifting = false;
              move();
            }
            break;
          }
          case 18: { // ALT
            if (mode === MODE_CENTER) {
              if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
              if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
              mode = MODE_HANDLE;
              move();
            }
            break;
          }
          case 32: { // SPACE
            if (mode === MODE_SPACE) {
              if (event.altKey) {
                if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
                if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
                mode = MODE_CENTER;
              } else {
                if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
                if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
                mode = MODE_HANDLE;
              }
              overlay.attr("cursor", cursors[type]);
              move();
            }
            break;
          }
          default: return;
        }
        noevent$1(event);
      }
    }

    function touchmoved(event) {
      emitter(this, arguments).moved(event);
    }

    function touchended(event) {
      emitter(this, arguments).ended(event);
    }

    function initialize() {
      var state = this.__brush || {selection: null};
      state.extent = number2(extent.apply(this, arguments));
      state.dim = dim;
      return state;
    }

    brush.extent = function(_) {
      return arguments.length ? (extent = typeof _ === "function" ? _ : constant$2(number2(_)), brush) : extent;
    };

    brush.filter = function(_) {
      return arguments.length ? (filter = typeof _ === "function" ? _ : constant$2(!!_), brush) : filter;
    };

    brush.touchable = function(_) {
      return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$2(!!_), brush) : touchable;
    };

    brush.handleSize = function(_) {
      return arguments.length ? (handleSize = +_, brush) : handleSize;
    };

    brush.keyModifiers = function(_) {
      return arguments.length ? (keys = !!_, brush) : keys;
    };

    brush.on = function() {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? brush : value;
    };

    return brush;
  }



  var d3brush = {
    __proto__: null,
    brush: brush,
    brushX: brushX,
    brushY: brushY,
    brushSelection: brushSelection
  };

  function formatDecimal(x) {
    return Math.abs(x = Math.round(x)) >= 1e21
        ? x.toLocaleString("en").replace(/,/g, "")
        : x.toString(10);
  }

  // Computes the decimal coefficient and exponent of the specified number x with
  // significant digits p, where x is positive and p is in [1, 21] or undefined.
  // For example, formatDecimalParts(1.23) returns ["123", 0].
  function formatDecimalParts(x, p) {
    if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
    var i, coefficient = x.slice(0, i);

    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i + 1)
    ];
  }

  function exponent(x) {
    return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
  }

  function formatGroup(grouping, thousands) {
    return function(value, width) {
      var i = value.length,
          t = [],
          j = 0,
          g = grouping[0],
          length = 0;

      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = grouping[j = (j + 1) % grouping.length];
      }

      return t.reverse().join(thousands);
    };
  }

  function formatNumerals(numerals) {
    return function(value) {
      return value.replace(/[0-9]/g, function(i) {
        return numerals[+i];
      });
    };
  }

  // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
  var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

  function formatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
    var match;
    return new FormatSpecifier({
      fill: match[1],
      align: match[2],
      sign: match[3],
      symbol: match[4],
      zero: match[5],
      width: match[6],
      comma: match[7],
      precision: match[8] && match[8].slice(1),
      trim: match[9],
      type: match[10]
    });
  }

  formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

  function FormatSpecifier(specifier) {
    this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
    this.align = specifier.align === undefined ? ">" : specifier.align + "";
    this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
    this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
    this.zero = !!specifier.zero;
    this.width = specifier.width === undefined ? undefined : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === undefined ? "" : specifier.type + "";
  }

  FormatSpecifier.prototype.toString = function() {
    return this.fill
        + this.align
        + this.sign
        + this.symbol
        + (this.zero ? "0" : "")
        + (this.width === undefined ? "" : Math.max(1, this.width | 0))
        + (this.comma ? "," : "")
        + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
        + (this.trim ? "~" : "")
        + this.type;
  };

  // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
  function formatTrim(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".": i0 = i1 = i; break;
        case "0": if (i0 === 0) i0 = i; i1 = i; break;
        default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
      }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  var prefixExponent;

  function formatPrefixAuto(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1],
        i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
        n = coefficient.length;
    return i === n ? coefficient
        : i > n ? coefficient + new Array(i - n + 1).join("0")
        : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
        : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
  }

  function formatRounded(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
        : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
        : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  var formatTypes = {
    "%": (x, p) => (x * 100).toFixed(p),
    "b": (x) => Math.round(x).toString(2),
    "c": (x) => x + "",
    "d": formatDecimal,
    "e": (x, p) => x.toExponential(p),
    "f": (x, p) => x.toFixed(p),
    "g": (x, p) => x.toPrecision(p),
    "o": (x) => Math.round(x).toString(8),
    "p": (x, p) => formatRounded(x * 100, p),
    "r": formatRounded,
    "s": formatPrefixAuto,
    "X": (x) => Math.round(x).toString(16).toUpperCase(),
    "x": (x) => Math.round(x).toString(16)
  };

  function identity$1(x) {
    return x;
  }

  var map = Array.prototype.map,
      prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

  function formatLocale(locale) {
    var group = locale.grouping === undefined || locale.thousands === undefined ? identity$1 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
        currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
        currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
        decimal = locale.decimal === undefined ? "." : locale.decimal + "",
        numerals = locale.numerals === undefined ? identity$1 : formatNumerals(map.call(locale.numerals, String)),
        percent = locale.percent === undefined ? "%" : locale.percent + "",
        minus = locale.minus === undefined ? "−" : locale.minus + "",
        nan = locale.nan === undefined ? "NaN" : locale.nan + "";

    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);

      var fill = specifier.fill,
          align = specifier.align,
          sign = specifier.sign,
          symbol = specifier.symbol,
          zero = specifier.zero,
          width = specifier.width,
          comma = specifier.comma,
          precision = specifier.precision,
          trim = specifier.trim,
          type = specifier.type;

      // The "n" type is an alias for ",g".
      if (type === "n") comma = true, type = "g";

      // The "" type, and any invalid type, is an alias for ".12~g".
      else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

      // If zero fill is specified, padding goes after sign and before digits.
      if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

      // Compute the prefix and suffix.
      // For SI-prefix, the suffix is lazily computed.
      var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
          suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

      // What format function should we use?
      // Is this an integer type?
      // Can this type generate exponential notation?
      var formatType = formatTypes[type],
          maybeSuffix = /[defgprs%]/.test(type);

      // Set the default precision if not specified,
      // or clamp the specified precision to the supported range.
      // For significant precision, it must be in [1, 21].
      // For fixed precision, it must be in [0, 20].
      precision = precision === undefined ? 6
          : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
          : Math.max(0, Math.min(20, precision));

      function format(value) {
        var valuePrefix = prefix,
            valueSuffix = suffix,
            i, n, c;

        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;

          // Determine the sign. -0 is not less than 0, but 1 / -0 is!
          var valueNegative = value < 0 || 1 / value < 0;

          // Perform the initial formatting.
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

          // Trim insignificant zeros.
          if (trim) value = formatTrim(value);

          // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
          if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

          // Compute the prefix and suffix.
          valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
          valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

          // Break the formatted value into the integer “value” part that can be
          // grouped, and fractional or exponential “suffix” part that is not.
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }

        // If the fill character is not "0", grouping is applied before padding.
        if (comma && !zero) value = group(value, Infinity);

        // Compute the padding.
        var length = valuePrefix.length + value.length + valueSuffix.length,
            padding = length < width ? new Array(width - length + 1).join(fill) : "";

        // If the fill character is "0", grouping is applied after padding.
        if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

        // Reconstruct the final output based on the desired alignment.
        switch (align) {
          case "<": value = valuePrefix + value + valueSuffix + padding; break;
          case "=": value = valuePrefix + padding + value + valueSuffix; break;
          case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
          default: value = padding + valuePrefix + value + valueSuffix; break;
        }

        return numerals(value);
      }

      format.toString = function() {
        return specifier + "";
      };

      return format;
    }

    function formatPrefix(specifier, value) {
      var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
          e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
          k = Math.pow(10, -e),
          prefix = prefixes[8 + e / 3];
      return function(value) {
        return f(k * value) + prefix;
      };
    }

    return {
      format: newFormat,
      formatPrefix: formatPrefix
    };
  }

  var locale;
  var format;
  var formatPrefix;

  defaultLocale({
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });

  function defaultLocale(definition) {
    locale = formatLocale(definition);
    format = locale.format;
    formatPrefix = locale.formatPrefix;
    return locale;
  }

  function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }

  function precisionPrefix(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }

  function precisionRound(step, max) {
    step = Math.abs(step), max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
  }



  var d3format = {
    __proto__: null,
    formatDefaultLocale: defaultLocale,
    get format () { return format; },
    get formatPrefix () { return formatPrefix; },
    formatLocale: formatLocale,
    formatSpecifier: formatSpecifier,
    FormatSpecifier: FormatSpecifier,
    precisionFixed: precisionFixed,
    precisionPrefix: precisionPrefix,
    precisionRound: precisionRound
  };

  function ascending$1(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function bisector(f) {
    let delta = f;
    let compare = f;

    if (f.length === 1) {
      delta = (d, x) => f(d) - x;
      compare = ascendingComparator(f);
    }

    function left(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    }

    function right(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }

    function center(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      const i = left(a, x, lo, hi - 1);
      return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
    }

    return {left, center, right};
  }

  function ascendingComparator(f) {
    return (d, x) => ascending$1(f(d), x);
  }

  function number(x) {
    return x === null ? NaN : +x;
  }

  const ascendingBisect = bisector(ascending$1);
  const bisectRight = ascendingBisect.right;
  const bisectCenter = bisector(number).center;

  var e10 = Math.sqrt(50),
      e5 = Math.sqrt(10),
      e2 = Math.sqrt(2);

  function ticks(start, stop, count) {
    var reverse,
        i = -1,
        n,
        ticks,
        step;

    stop = +stop, start = +start, count = +count;
    if (start === stop && count > 0) return [start];
    if (reverse = stop < start) n = start, start = stop, stop = n;
    if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

    if (step > 0) {
      let r0 = Math.round(start / step), r1 = Math.round(stop / step);
      if (r0 * step < start) ++r0;
      if (r1 * step > stop) --r1;
      ticks = new Array(n = r1 - r0 + 1);
      while (++i < n) ticks[i] = (r0 + i) * step;
    } else {
      step = -step;
      let r0 = Math.round(start * step), r1 = Math.round(stop * step);
      if (r0 / step < start) ++r0;
      if (r1 / step > stop) --r1;
      ticks = new Array(n = r1 - r0 + 1);
      while (++i < n) ticks[i] = (r0 + i) / step;
    }

    if (reverse) ticks.reverse();

    return ticks;
  }

  function tickIncrement(start, stop, count) {
    var step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log(step) / Math.LN10),
        error = step / Math.pow(10, power);
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
  }

  function tickStep(start, stop, count) {
    var step0 = Math.abs(stop - start) / Math.max(0, count),
        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
        error = step0 / step1;
    if (error >= e10) step1 *= 10;
    else if (error >= e5) step1 *= 5;
    else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
  }

  function max$1(values, valueof) {
    let max;
    if (valueof === undefined) {
      for (const value of values) {
        if (value != null
            && (max < value || (max === undefined && value >= value))) {
          max = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null
            && (max < value || (max === undefined && value >= value))) {
          max = value;
        }
      }
    }
    return max;
  }

  function initRange(domain, range) {
    switch (arguments.length) {
      case 0: break;
      case 1: this.range(domain); break;
      default: this.range(range).domain(domain); break;
    }
    return this;
  }

  function constants(x) {
    return function() {
      return x;
    };
  }

  function number$1(x) {
    return +x;
  }

  var unit = [0, 1];

  function identity$2(x) {
    return x;
  }

  function normalize(a, b) {
    return (b -= (a = +a))
        ? function(x) { return (x - a) / b; }
        : constants(isNaN(b) ? NaN : 0.5);
  }

  function clamper(a, b) {
    var t;
    if (a > b) t = a, a = b, b = t;
    return function(x) { return Math.max(a, Math.min(b, x)); };
  }

  // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
  // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
  function bimap(domain, range, interpolate) {
    var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
    else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
    return function(x) { return r0(d0(x)); };
  }

  function polymap(domain, range, interpolate) {
    var j = Math.min(domain.length, range.length) - 1,
        d = new Array(j),
        r = new Array(j),
        i = -1;

    // Reverse descending domains.
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }

    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r[i] = interpolate(range[i], range[i + 1]);
    }

    return function(x) {
      var i = bisectRight(domain, x, 1, j) - 1;
      return r[i](d[i](x));
    };
  }

  function copy(source, target) {
    return target
        .domain(source.domain())
        .range(source.range())
        .interpolate(source.interpolate())
        .clamp(source.clamp())
        .unknown(source.unknown());
  }

  function transformer() {
    var domain = unit,
        range = unit,
        interpolate$1 = interpolate,
        transform,
        untransform,
        unknown,
        clamp = identity$2,
        piecewise,
        output,
        input;

    function rescale() {
      var n = Math.min(domain.length, range.length);
      if (clamp !== identity$2) clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }

    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
    }

    scale.invert = function(y) {
      return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
    };

    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
    };

    scale.range = function(_) {
      return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
    };

    scale.rangeRound = function(_) {
      return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
    };

    scale.clamp = function(_) {
      return arguments.length ? (clamp = _ ? true : identity$2, rescale()) : clamp !== identity$2;
    };

    scale.interpolate = function(_) {
      return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
    };

    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };

    return function(t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }

  function continuous() {
    return transformer()(identity$2, identity$2);
  }

  function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count),
        precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }

  function linearish(scale) {
    var domain = scale.domain;

    scale.ticks = function(count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };

    scale.tickFormat = function(count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };

    scale.nice = function(count) {
      if (count == null) count = 10;

      var d = domain();
      var i0 = 0;
      var i1 = d.length - 1;
      var start = d[i0];
      var stop = d[i1];
      var prestep;
      var step;
      var maxIter = 10;

      if (stop < start) {
        step = start, start = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }
      
      while (maxIter-- > 0) {
        step = tickIncrement(start, stop, count);
        if (step === prestep) {
          d[i0] = start;
          d[i1] = stop;
          return domain(d);
        } else if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
        } else {
          break;
        }
        prestep = step;
      }

      return scale;
    };

    return scale;
  }

  function linear$1() {
    var scale = continuous();

    scale.copy = function() {
      return copy(scale, linear$1());
    };

    initRange.apply(scale, arguments);

    return linearish(scale);
  }

  var organismMetadata = {
    9606: {
      commonName: 'Human',
      scientificName: 'Homo sapiens',
      assemblies: {
        default: 'GCF_000001405.26', // GRCh38
        GRCh38: 'GCF_000001405.26',
        GRCh37: 'GCF_000001405.13',
        NCBI36: 'GCF_000001405.12'
      },
      hasGeneCache: true
    },
    10090: {
      commonName: 'Mouse',
      scientificName: 'Mus musculus',
      assemblies: {
        default: 'GCF_000001635.20', // GRCm38
        GRCm38: 'GCF_000001635.20',
        MGSCv37: 'GCF_000001635.18'
      }
    },
    9598: {
      commonName: 'Chimpanzee',
      scientificName: 'Pan troglodytes',
      assemblies: {
        'default': 'GCF_000001515.7',
        'Pan_tro 3.0': 'GCF_000001515.7'
      }
    },
    10116: {
      commonName: 'Rat',
      scientificName: 'Rattus norvegicus',
      assemblies: {
        'default': 'GCF_000001895.5',
        'Rnor_6.0': 'GCF_000001895.5'
      }
    },
    3702: {
      commonName: 'Thale cress',
      scientificName: 'Arabidopsis thaliana',
      assemblies: {
        default: 'GCF_000001735.3', // TAIR10
        TAIR10: 'GCF_000001735.3'
      }
    },
    4530: {
      commonName: 'Rice',
      scientificName: 'Oryza sativa',
      assemblies: {
        'default': 'GCA_001433935.1',
        'IRGSP-1.0': 'GCA_001433935.1'
      }
    },
    4577: {
      commonName: 'Maize',
      scientificName: 'Zea mays',
      assemblies: {
        'default': 'GCA_000005005.5',
        'IRGSP-1.0': 'GCA_001433935.1'
      }
    },
    4641: {
      commonName: 'Banana',
      scientificName: 'Musa acuminata',
      assemblies: {
        default: 'mock'
      }
    },
    7227: {
      commonName: 'Fly',
      scientificName: 'Drosophila melanogaster',
      assemblies: {
        'default': 'GCA_000001215.4',
        'Release 6 plus ISO1 MT': 'GCA_000001215.4'
      }
    },
    7165: {
      commonName: 'Mosquito',
      scientificName: 'Anopheles gambiae',
      assemblies: {
        default: ''
      }
    },
    746128: {
      commonName: 'Aspergillis fumigatus',
      scientificName: 'Aspergillis fumigatus',
      assemblies: {
        default: ''
      }
    },
    227321: {
      commonName: 'Aspergillus nidulans',
      scientificName: '',
      assemblies: {
        default: ''
      }
    },
    5061: {
      commonName: 'black mold',
      scientificName: 'Aspergillus niger',
      assemblies: {
        default: ''
      }
    },
    5062: {
      commonName: 'koji',
      scientificName: 'Aspergillus oryzae',
      assemblies: {
        default: ''
      }
    },
    15368: {
      commonName: '',
      scientificName: 'Brachypodium distachyon',
      assemblies: {
        default: ''
      }
    },
    60711: {
      commonName: '',
      scientificName: 'Chlorocebus sabaeus',
      assemblies: {
        default: ''
      }
    },
    7719: {
      commonName: 'Vase tunicate',
      scientificName: 'Ciona intestinalis',
      assemblies: {
        default: ''
      }
    },
    9685: {
      commonName: 'Cat',
      scientificName: 'Felis catus',
      assemblies: {
        default: ''
      }
    },
    9031: {
      commonName: 'Chicken',
      scientificName: 'Gallus gallus',
      assemblies: {
        default: ''
      }
    },
    9593: {
      commonName: 'Gorilla',
      scientificName: 'Gorilla gorilla',
      assemblies: {
        default: ''
      }
    },
    4513: {
      commonName: 'Barley',
      scientificName: 'Hordeum vulgare',
      assemblies: {
        default: ''
      }
    },
    9541: {
      commonName: 'Crab-eating macaque',
      scientificName: 'Macaca fascicularis',
      assemblies: {
        default: ''
      }
    },
    9544: {
      commonName: 'Rhesus macaque',
      scientificName: 'Macaca mulatta',
      assemblies: {
        default: ''
      }
    },
    9597: {
      commonName: 'Bonobo',
      scientificName: 'Pan paniscus',
      assemblies: {
        default: ''
      }
    },
    9615: {
      commonName: 'Dog',
      scientificName: 'Canis lupus familiaris',
      assemblies: {
        default: ''
      }
    },
    4932: {
      commonName: 'Yeast',
      scientificName: 'Saccharomyces cerevisiae',
      assemblies: {
        default: 'GCA_000146045.2',
        R64: 'GCA_000146045.2'
      }
    },
    5833: {
      commonName: 'malaria parasite',
      scientificName: 'Plasmodium falciparum',
      assemblies: {
        default: 'GCA_000002765.3',
        GCA_000002765: 'GCA_000002765.3'
      }
    },
    6239: {
      commonName: 'worm',
      scientificName: 'Caenorhabditis elegans',
      assemblies: {
        default: 'GCF_000002985.6',
        GCA_000002765: 'GCF_000002985.6'
      }
    }
  };

  /**
   * @fileoverview A collection of Ideogram methods that don't fit elsewhere.
   */

  var d3 = Object.assign(
    {}, d3fetch, d3brush, d3dispatch, d3format
  );

  d3.select = select;
  d3.selectAll = selectAll;
  d3.scaleLinear = linear$1;
  d3.max = max$1;
  d3.easeExpIn = expIn;

  /**
   * Is the assembly in this.config an NCBI Assembly accession?
   *
   * @returns {boolean}
   */
  function assemblyIsAccession() {
    return (
      'assembly' in this.config &&
      /(GCF_|GCA_)/.test(this.config.assembly)
    );
  }

  /**
   * Is the assembly in this.config not from GenBank?
   *
   * @returns {boolean}
   */
  function hasNonGenBankAssembly(ideo) {
    return (
      'assembly' in ideo.config &&
      /(GCA_)/.test(ideo.config.assembly) === false
    );
  }

  function getDir(dir) {
    var script, tmp, protocol, dataDir, ideogramInLeaf,
      scripts = document.scripts,
      version = Ideogram.version;

    if (location.pathname.includes('/examples/vanilla/') === false) {
      return (
        `https://cdn.jsdelivr.net/npm/ideogram@${version}/dist/data/${dir}`
      );
    }

    for (var i = 0; i < scripts.length; i++) {
      script = scripts[i];
      ideogramInLeaf = /ideogram/.test(script.src.split('/').slice(-1));
      if ('src' in script && ideogramInLeaf) {
        tmp = script.src.split('//');
        protocol = tmp[0];
        tmp = '/' + tmp[1].split('/').slice(0, -2).join('/');
        dataDir = protocol + '//' + tmp + '/data/' + dir;
        return dataDir;
      }
    }

    return '../data/' + dir;
  }

  /** Try request, and if failed then retry with URL lacking extension */
  function fetchWithRetry(url, isRetry=false) {
    return fetch(url)
      .then((response) => {
        if (response.ok) {
          return response;
        } else {
          if (isRetry === false) {
            var urlWithoutExtension = url.replace('.json', '');
            return fetchWithRetry(urlWithoutExtension, true);
          } else {
            throw Error('Fetch failed for ' + url);
          }
        }
      });
  }

  /**
   * Returns directory used to fetch data for bands and annotations
   *
   * This simplifies ideogram configuration.  By default, the dataDir is
   * set to an external CDN unless we're serving from the local Ideogram
   * working directory
   *
   * @returns {String}
   */
  function getDataDir() {
    return getDir('bands/native/');
  }

  /**
   * Rounds a float (e.g. SVG coordinate) to two decimal places
   *
   * @param coord Floating-point number, e.g. 42.1234567890
   * @returns {number} Rounded value, e.g. 42.12
   */
  function round(coord) {
    // Per http://stackoverflow.com/a/9453447, below method is fastest
    return Math.round(coord * 100) / 100;
  }

  function onDidRotate(chrModel) {
    call(this.onDidRotateCallback, chrModel);
  }

  /**
   * Get ideogram SVG container
   */
  function getSvg() {
    return d3.select(this.selector).node();
  }

  /** Request data with Ideogram's authorization bearer token */
  function fetchWithAuth(url, contentType) {
    var ideo = this,
      config = ideo.config,
      headers = new Headers();

    if (config.accessToken) {
      headers = new Headers({Authorization: 'Bearer ' + config.accessToken});
    }

    if (contentType === 'text') {
      return d3.text(url, {headers: headers});
    } else {
      return d3.json(url, {headers: headers});
    }
  }

  /** getTaxid(), but without need to initialize ideogram  */
  function getEarlyTaxid(name) {
    name = slug(name);
    for (const taxid in organismMetadata) {
      const organism = organismMetadata[taxid];
      const commonName = slug(organism.commonName);
      const scientificName = slug(organism.scientificName);
      if (commonName === name || scientificName === name) {
        return taxid;
      }
    }

    return null;
  }

  /**
   * Get organism's taxid (NCBI Taxonomy ID) given its common or scientific name
   */
  function getTaxid(name) {
    var organism, taxid, commonName, scientificName,
      ideo = this,
      organisms = ideo.organisms;

    name = slug(name);

    for (taxid in organisms) {
      organism = organisms[taxid];
      commonName = slug(organism.commonName);
      scientificName = slug(organism.scientificName);
      if (commonName === name || scientificName === name) {
        return taxid;
      }
    }

    return null;
  }

  /**
   * Get organism's common name given its taxid
   */
  function getCommonName(taxid) {
    var ideo = this;
    if (taxid in ideo.organisms) {
      return ideo.organisms[taxid].commonName;
    }
    return null;
  }

  /**
   * Get organism's scientific name given its taxid
   */
  function getScientificName(taxid) {
    var ideo = this;
    if (taxid in ideo.organisms) {
      return ideo.organisms[taxid].scientificName;
    }
    return null;
  }

  /**
  * Examples:
  * "Homo sapiens" -> "homo-sapiens"
  * "Canis lupus familiaris" -> "canis-lupus-familiaris"
  */
  function slug(value) {
    return value.toLowerCase().replace(/ /g, '-');
  }

  // Determine if a string is a Roman numeral
  // From https://stackoverflow.com/a/48601418
  function isRoman(s) {
    // http://stackoverflow.com/a/267405/1447675
    return /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i.test(s);
  }

  // Convert Roman numeral to integer
  // From https://stackoverflow.com/a/48601418
  function parseRoman(s) {
    var val = {M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1};
    return s.toUpperCase().split('').reduce(function(r, a, i, aa) {
      return val[a] < val[aa[i + 1]] ? r - val[a] : r + val[a];
    }, 0);
  }

  /**
  * Download a PNG image of the ideogram
  *
  * Includes any annotations, but not legend.
  */
  function downloadPng(ideo) {
    var ideoSvg = document.querySelector(ideo.selector);

    // Create a hidden canvas.  This will contain the raster image to download.
    var canvas = document.createElement('canvas');
    var canvasId = '_ideo-undisplayed-dl-canvas';
    canvas.setAttribute('style', 'display: none');
    canvas.setAttribute('id', canvasId);
    var width = ideoSvg.width.baseVal.value + 30;
    var ideoSvgClone = ideoSvg.cloneNode(true);
    ideoSvgClone.style.left = '';
    canvas.setAttribute('width', width);
    document.body.appendChild(canvas);

    // Called after PNG image is created from data URL
    function triggerDownload(imgUrl) {
      var evt = new MouseEvent('click', {
        view: window,
        bubbles: false,
        cancelable: true
      });

      var a = document.createElement('a');
      a.setAttribute('download', 'ideogram.png');
      a.setAttribute('href', imgUrl);
      a.setAttribute('target', '_blank');

      // Enables easy testing
      a.setAttribute('id', '_ideo-undisplayed-dl-image-link');
      a.setAttribute('style', 'display: none;');
      document.body.appendChild(a);

      a.dispatchEvent(evt);
      canvas.remove();
    }

    var canvas = document.getElementById(canvasId);

    // Enlarge canvas and disable smoothing, for higher resolution PNG
    canvas.width *= 2;
    canvas.height *= 2;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.imageSmoothingEnabled = false;

    var data = (new XMLSerializer()).serializeToString(ideoSvgClone);
    var domUrl = window.URL || window.webkitURL || window;

    var img = new Image();
    var svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var url = domUrl.createObjectURL(svgBlob);

    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      domUrl.revokeObjectURL(url);

      var imgUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');

      triggerDownload(imgUrl);
    };

    img.src = url;
  }


  function getFont(ideo) {
    const config = ideo.config;

    let family = 'sans-serif';
    if (config.fontFamily) {
      family = config.fontFamily;
    }

    const labelSize = config.annotLabelSize ? config.annotLabelSize : 13;
    const font = '600 ' + labelSize + 'px ' + family;

    return font;
  }

  /**
   * Get width and height of given text in pixels.
   *
   * Background: https://erikonarheim.com/posts/canvas-text-metrics/
   */
  function getTextSize(text, ideo) {
    var font = getFont(ideo);

    // re-use canvas object for better performance
    var canvas =
      getTextSize.canvas ||
      (getTextSize.canvas = document.createElement('canvas'));
    var context = canvas.getContext('2d');
    context.font = font;
    var metrics = context.measureText(text);

    // metrics.width is less precise than technique below
    var right = metrics.actualBoundingBoxRight;
    var left = metrics.actualBoundingBoxLeft;
    var width = Math.abs(left) + Math.abs(right);

    const height =
      Math.abs(metrics.actualBoundingBoxAscent) +
      Math.abs(metrics.actualBoundingBoxDescent);

    return {width, height};
  }

  var staticColors, staticCss, staticGradients;

  staticColors = [
    ['gneg', '#FFF', '#FFF', '#DDD'],
    ['gpos25', '#C8C8C8', '#DDD', '#BBB'],
    ['gpos33', '#BBB', '#BBB', '#AAA'],
    ['gpos50', '#999', '#AAA', '#888'],
    ['gpos66', '#888', '#888', '#666'],
    ['gpos75', '#777', '#777', '#444'],
    ['gpos100', '#444', '#666', '#000'],
    ['acen', '#FEE', '#FEE', '#FDD'],
    ['noBands', '#BBB', '#BBB', '#AAA']
  ];

  staticCss =
    '#_ideogram {padding-left: 5px;} ' +
    '#_ideogram .labeled {padding-left: 15px;} ' +
    '#_ideogram.labeledLeft {padding-left: 15px; padding-top: 15px;} ' +
    // Tahoma has great readability and space utilization at small sizes
    // More: http://ux.stackexchange.com/a/3334
    '#_ideogram text {font: 9px Tahoma; fill: #000;} ' +
    '#_ideogram .italic {font-style: italic;} ' +
    '#_ideogram .chromosome {cursor: pointer; fill: #AAA;}' +
    '#_ideogram.no-rotate .chromosome {cursor: default;} ' +
    '#_ideogram .chrLabel, #_ideogram .annot {cursor: pointer;}' +
    '#_ideogram .chrSetLabel {font-weight: bolder;}' +
    '#_ideogram .ghost {opacity: 0.2;}' +
    '#_ideogram .hidden {display: none;}' +
    '#_ideogram .bandLabelStalk line {stroke: #AAA; stroke-width: 1;}' +
    '#_ideogram .syntenyBorder {stroke:#AAA;stroke-width:1;}' +
    '#_ideogram rect.cursor {' +
    '  fill: #F00;' +
    '  stroke: #F00;' +
    '  fill-opacity: .3;' +
    '  shape-rendering: crispEdges;' +
    '}' +
    '#_ideogram .brush .selection {' +
    '  fill: #F00;' +
    '  stroke: #F00;' +
    '  fill-opacity: .3;' +
    '  shape-rendering: crispEdges;' +
    '}' +
    '#_ideogram .noBands {fill: #AAA;}' +
    // NCBI stain density colors
    '#_ideogram .gneg {fill: #FFF}' +
    '#_ideogram .gpos25 {fill: #BBB}' +
    '#_ideogram .gpos33 {fill: #AAA}' +
    '#_ideogram .gpos50 {fill: #888}' +
    '#_ideogram .gpos66 {fill: #666}' +
    '#_ideogram .gpos75 {fill: #444}' +
    '#_ideogram .gpos100 {fill: #000}' +
    '#_ideogram .gpos {fill: #000}' +
    '#_ideogram .acen {fill: #FDD}' +
    '#_ideogram .stalk {fill: #CCE;}' +
    '#_ideogram .gvar {fill: #DDF}' +
    // Used when overlaid with annotations
    '#_ideogram.faint .gneg {fill: #FFF}' +
    '#_ideogram.faint .gpos25 {fill: #EEE}' +
    '#_ideogram.faint .gpos33 {fill: #EEE}' +
    '#_ideogram.faint .gpos50 {fill: #EEE}' +
    '#_ideogram.faint .gpos66 {fill: #EEE}' +
    '#_ideogram.faint .gpos75 {fill: #EEE}' +
    '#_ideogram.faint .gpos100 {fill: #DDD}' +
    '#_ideogram.faint .gpos {fill: #DDD}' +
    '#_ideogram.faint .acen {fill: #FEE}' +
    '#_ideogram.faint .stalk {fill: #EEF;}' +
    '#_ideogram.faint .gvar {fill: #EEF}' +
    // For sheen, i.e. the soft shine in chromosomes
    '#_ideogram .gneg {fill: url("#gneg")} ' +
    '#_ideogram .gpos25 {fill: url("#gpos25")} ' +
    '#_ideogram .gpos33 {fill: url("#gpos33")} ' +
    '#_ideogram .gpos50 {fill: url("#gpos50")} ' +
    '#_ideogram .gpos66 {fill: url("#gpos66")} ' +
    '#_ideogram .gpos75 {fill: url("#gpos75")} ' +
    '#_ideogram .gpos100 {fill: url("#gpos100")} ' +
    '#_ideogram .gpos {fill: url("#gpos100")} ' +
    '#_ideogram .acen {fill: url("#acen")} ' +
    '#_ideogram .stalk {fill: url("#stalk")} ' +
    '#_ideogram .gvar {fill: url("#gvar")} ' +
    '#_ideogram .noBands {fill: url("#noBands")} ' +
    '#_ideogram .chromosome {fill: url("#noBands")} ';

  staticGradients =
    '<pattern id="stalk" width="2" height="1" patternUnits="userSpaceOnUse" ' +
    'patternTransform="rotate(30 0 0)">' +
    '<rect x="0" y="0" width="10" height="2" fill="#CCE" /> ' +
    '<line x1="0" y1="0" x2="0" y2="100%" style="stroke:#88B; ' +
    'stroke-width:0.7;" />' +
    '</pattern>' +
    '<pattern id="gvar" width="2" height="1" patternUnits="userSpaceOnUse" ' +
    'patternTransform="rotate(-30 0 0)">' +
    '<rect x="0" y="0" width="10" height="2" fill="#DDF" /> ' +
    '<line x1="0" y1="0" x2="0" y2="100%" style="stroke:#99C; ' +
    'stroke-width:0.7;" />' +
    '</pattern>';

  function configurePloidy(ideo) {
    if (!ideo.config.ploidy) ideo.config.ploidy = 1;

    if (ideo.config.ploidy > 1) {
      ideo.sexChromosomes = {};
      if (!ideo.config.sex) {
        // Default to 'male' per human, mouse reference genomes.
        // TODO: The default sex value should probably be the heterogametic sex,
        // i.e. whichever sex has allosomes that differ in morphology.
        // In mammals and most insects that is the male.
        // However, in birds and reptiles, that is female.
        ideo.config.sex = 'male';
      }
      if (ideo.config.ploidy === 2 && !ideo.config.ancestors) {
        ideo.config.ancestors = {M: '#ffb6c1', P: '#add8e6'};
        ideo.config.ploidyDesc = 'MP';
      }
    }
  }

  function configureHeight(ideo) {
    var container, rect, chrHeight;

    if (!ideo.config.chrHeight) {
      container = ideo.config.container;
      rect = document.querySelector(container).getBoundingClientRect();

      if (ideo.config.orientation === 'vertical') {
        chrHeight = rect.height;
      } else {
        chrHeight = rect.width;
      }

      if (container === 'body' || chrHeight === 0) chrHeight = 400;
      ideo.config.chrHeight = chrHeight;
    }
  }

  function configureWidth(ideo) {
    var chrWidth, chrHeight;

    if (!ideo.config.chrWidth) {
      chrWidth = 10;
      chrHeight = ideo.config.chrHeight;

      if (chrHeight < 900 && chrHeight > 500) {
        chrWidth = Math.round(chrHeight / 40);
      } else if (chrHeight >= 900) {
        chrWidth = Math.round(chrHeight / 45);
      }
      ideo.config.chrWidth = chrWidth;
    }
  }

  function configureMargin(ideo) {
    if (ideo.config.geometry && ideo.config.geometry === 'collinear') {
      if ('chrMargin' in ideo.config === false) {
        ideo.config.chrMargin = 0;
      }
      return;
    }
    if (!ideo.config.chrMargin) {
      if (ideo.config.ploidy === 1) {
        ideo.config.chrMargin = 10;
      } else {
        // Defaults polyploid chromosomes to relatively small interchromatid gap
        ideo.config.chrMargin = Math.round(ideo.config.chrWidth / 4);
      }
    }
    if (ideo.config.showBandLabels) ideo.config.chrMargin += 20;
  }

  function configureBump(ideo) {
    ideo.bump = Math.round(ideo.config.chrHeight / 125);
    ideo.adjustedBump = false;
    if (ideo.config.chrHeight < 200) {
      ideo.adjustedBump = true;
      ideo.bump = 4;
    }
  }

  function configureSingleChromosome(config, ideo) {
    if (config.chromosome) {
      ideo.config.chromosomes = [config.chromosome];
      if ('showBandLabels' in config === false) {
        ideo.config.showBandLabels = true;
      }
      if ('rotatable' in config === false) ideo.config.rotatable = false;
    }
  }

  function configureOrganisms(ideo) {
    ideo.organisms = Object.assign({}, organismMetadata);
    ideo.organismsWithBands = Object.assign({}, ideo.organisms);
  }

  function configureCallbacks(config, ideo) {
    if (config.onLoad) ideo.onLoadCallback = config.onLoad;
    if (config.onLoadAnnots) ideo.onLoadAnnotsCallback = config.onLoadAnnots;
    if (config.onDrawAnnots) ideo.onDrawAnnotsCallback = config.onDrawAnnots;
    if (config.onBrushMove) ideo.onBrushMoveCallback = config.onBrushMove;
    if (config.onBrushEnd) ideo.onBrushEndCallback = config.onBrushEnd;
    if (config.onCursorMove) ideo.onCursorMoveCallback = config.onCursorMove;
    if (config.onDidRotate) ideo.onDidRotateCallback = config.onDidRotate;
    if (config.onWillShowAnnotTooltip) {
      ideo.onWillShowAnnotTooltipCallback = config.onWillShowAnnotTooltip;
    }
    if (config.onClickAnnot) {
      ideo.onClickAnnotCallback = config.onClickAnnot;
    }
  }

  function configureMiscellaneous(ideo) {
    ideo.chromosomesArray = [];
    ideo.coordinateSystem = 'iscn';
    ideo.maxLength = {bp: 0, iscn: 0};
    ideo.chromosomes = {};
    ideo.numChromosomes = 0;
    if (!ideo.config.debug) ideo.config.debug = false;
    if (!ideo.config.dataDir) ideo.config.dataDir = ideo.getDataDir();
    if (!ideo.config.container) ideo.config.container = 'body';
    ideo.selector = ideo.config.container + ' #_ideogram';
    if (!ideo.config.resolution) ideo.config.resolution = '';
    if (!ideo.config.orientation) ideo.config.orientation = 'vertical';
    if (!ideo.config.brush) ideo.config.brush = null;
    if (!ideo.config.rows) ideo.config.rows = 1;
    if ('showChromosomeLabels' in ideo.config === false) {
      ideo.config.showChromosomeLabels = true;
    }
    if (!ideo.config.showNonNuclearChromosomes) {
      ideo.config.showNonNuclearChromosomes = false;
    }
    if (!ideo.config.chromosomeScale) {
      ideo.config.chromosomeScale = 'absolute';
    }
    if (!ideo.config.showTools) ideo.config.showTools = false;
  }

  function configureBands(ideo) {
    if (!ideo.config.showBandLabels) ideo.config.showBandLabels = false;

    if ('showFullyBanded' in ideo.config === false) {
      ideo.config.showFullyBanded = true;
    }

    ideo.bandsToShow = [];
    ideo.bandData = {};
  }

  let configuredCss = staticCss;
  function configureTextStyle(ideo) {
    const config = ideo.config;
    if (!config.chrLabelSize) ideo.config.chrLabelSize = 9;
    if (!config.chrLabelColor) ideo.config.chrLabelColor = '#000';
    if (!config.fontFamily) ideo.config.fontFamily = '';

    const size = `font-size: ${config.chrLabelSize}px`;
    const color = `fill: ${config.chrLabelColor}`;
    const fontFamily = `font-family: ${config.fontFamily}`;
    configuredCss += `#_ideogram text {${fontFamily}; ${size}; ${color};}`;
    configuredCss += `#_ideogramLabel text {${fontFamily};}`;
  }

  /**
   * High-level helper method for Ideogram constructor.
   *
   * @param config Configuration object.  Enables setting Ideogram properties.
   *
   * Docs: https://github.com/eweitz/ideogram/blob/master/api.md
   */
  function configure(config) {
    // Clone the config object, to allow multiple instantiations
    // without picking up prior ideogram's settings
    this.config = JSON.parse(JSON.stringify(config));

    configureMiscellaneous(this);
    configurePloidy(this);
    configureBands(this);
    configureHeight(this);
    configureWidth(this);
    configureMargin(this);
    configureCallbacks(config, this);
    configureOrganisms(this);
    configureBump(this);
    configureSingleChromosome(config, this);
    configureTextStyle(this);
    this.initAnnotSettings();
    if (!this.config.geometry || this.config.geometry === 'parallel') {
      this.config.chrMargin += this.config.chrWidth;
      if (this.config.annotationsLayout === 'heatmap') {
        this.config.chrMargin += this.config.annotTracksHeight;
      } else {
        this.config.chrMargin += this.config.annotTracksHeight * 2;
      }
    }
    this.init();
  }

  /**
   * @fileoverview Functions for collinear chromosomes.
   * Collinear chromosomes form a line together, unlike the default parallel
   * geometry.
   */

  function labelGenomes(ideo) {

    ideo.config.taxids.forEach((taxid, i) => {
      var org = ideo.organisms[taxid];
      // var commonName = slug(org.commonName);
      var scientificName = org.scientificName;
      d3.select(ideo.selector)
        .append('text')
        .attr('class', 'genomeLabel italic')
        .attr('x', 50 + 200 * i)
        .attr('y', 10)
        .text(scientificName)
        .attr('text-anchor', 'middle');
    });
  }

  /**
  * Rearrange chromosomes from parallel vertical to collinear vertical
  *
  * Parallel vertical (as in https://eweitz.github.io/ideogram/human)
  * | | |
  *
  * Collinear vertical (as in https://eweitz.github.io/ideogram/orthologs?loci=2:150000000,5:20000000;3:100000000,10:80000000&org=homo-sapiens&org2=mus-musculus)
  * |
  * |
  * |
  */
  function rearrangeChromosomes(chrSets, yOffsets, x, ideo) {
    var i, chrSet, y, chrLabelX, adjustedX, chr, taxid, orgIndex,
      config = ideo.config,
      chrLabelSize = config.chrLabelSize;

    for (i = 0; i < chrSets.length; i++) {
      chrSet = chrSets[i];
      y = yOffsets[i] + 23 - chrLabelSize;

      chr = ideo.chromosomesArray[i];
      taxid = chr.id.split('-')[1];
      orgIndex = ideo.config.taxids.indexOf(taxid);
      adjustedX = x - orgIndex * 200 - 30;
      if (orgIndex === 0) {
        chrLabelX = -34;
        adjustedX += ideo.config.chrWidth * 2 - 16;
      } else {
        chrLabelX = ideo.config.chrWidth * 2 - 24;
      }

      if (config.showChromosomeLabels) {
        const labelSpan = chrSet.querySelector('.chrLabel > tspan');
        labelSpan.setAttribute('x', chrLabelX);
        labelSpan.setAttribute('dy', chrLabelSize - 8);
        chrSet.querySelector('.chrLabel').setAttribute('text-anchor', 'start');
      }
      chrSet.setAttribute(
        'transform', 'rotate(90) translate(' + y + ',' + adjustedX + ')'
      );
      chrSet.querySelector('.chromosome').setAttribute(
        'transform', 'translate(-13, 10)'
      );
    }

    labelGenomes(ideo);
  }

  /**
  * Get pixel coordinates to use for rearrangement
  */
  function getyOffsets(chrSets, ideo) {
    var yOffsets, i, index, chr, prevChr, y, prevWidth, prevY, yBump, taxid,
      seenTaxids = {};

    yOffsets = [];
    for (i = 0; i < chrSets.length; i++) {
      chr = ideo.chromosomesArray[i];
      taxid = chr.id.split('-')[1];
      index = (i === 0) ? i : i - 1;
      prevChr = ideo.chromosomesArray[index];
      if (i === 0 || taxid in seenTaxids === false) {
        y = 20;
        seenTaxids[taxid] = 1;
      } else {
        prevWidth = prevChr.width;
        prevY = yOffsets[index];
        yBump = (ideo.config.showChromosomeLabels ? 0 : 2);
        y = prevY + prevWidth + yBump + ideo.config.chrMargin;
      }
      yOffsets.push(y);
    }

    return yOffsets;
  }

  function collinearizeVerticalChromosomes(ideo) {
    var chrSets, yOffsets, x, height, width,
      config = ideo.config;

    ideo.config.annotLabelHeight = 12;
    // var annotLabelHeight = ideo.config.annotLabelHeight;

    if ('demarcateCollinearChromosomes' in ideo.config === false) {
      ideo.config.demarcateCollinearChromosomes = true;
    }

    chrSets = document.querySelectorAll('.chromosome-set');

    x = -40;

    yOffsets = getyOffsets(chrSets, ideo);
    rearrangeChromosomes(chrSets, yOffsets, x, ideo);

    width = Math.round(yOffsets.slice(-1)[0] + 70);

    if (config.multiorganism) {
      height *= 8;
      var maxHeight = 0;
      yOffsets.forEach(d => {
        if (d > maxHeight) maxHeight = d;
      });
      height = maxHeight + 30;
    } else {
      height = xOffsets.slice(-1)[0] + 30;
    }

    d3.select(ideo.selector)
      .attr('height', height)
      .attr('width', width);

    d3.select('#_ideogramTrackLabelContainer').remove();
    d3.select('#_ideogramInnerWrap')
      .insert('div', ':first-child')
      .attr('id', '_ideogramTrackLabelContainer')
      .style('position', 'absolute');
  }

  /**
   * @fileoverview Functions for collinear chromosomes.
   * Collinear chromosomes form a line together, unlike the default parallel
   * geometry.
   */

  function labelGenomes$1(ideo) {

    ideo.config.taxids.forEach((taxid, i) => {
      var org = ideo.organisms[taxid];
      var config = ideo.config;
      // var commonName = slug(org.commonName);
      var scientificName = org.scientificName;
      d3.select(ideo.selector)
        .append('text')
        .attr('class', 'genomeLabel italic')
        .attr('x', 5)
        .attr('y', config.chrLabelSize + (200 + (3 * config.chrWidth)) * i)
        .text(scientificName);
    });
  }

  /**
  * Rearrange chromosomes from parallel horizontal to collinear horizontal
  *
  * Parallel horizontal (as in https://eweitz.github.io/ideogram/mouse)
  *     ---
  *     ---
  *     ---
  *
  * Collinear horizontal (as in https://eweitz.github.io/ideogram/geometry-collinear):
  *     --- --- ---
  */
  function rearrangeChromosomes$1(chrSets, xOffsets, y, ideo) {
    var i, chr, chrSet, taxid, x, adjustedY, orgIndex, chrLabelY,
      config = ideo.config,
      chrWidth = config.chrWidth,
      chrLabelSize = config.chrLabelSize;

    for (i = 0; i < chrSets.length; i++) {
      chrSet = chrSets[i];
      x = xOffsets[i];

      chr = ideo.chromosomesArray[i];
      taxid = chr.id.split('-')[1];
      orgIndex = config.taxids.indexOf(taxid);
      adjustedY = y + orgIndex * 200;
      if (orgIndex === 0 && ideo.config.multiorganism) {
        chrLabelY = chrLabelSize - 4;
        adjustedY += chrWidth * 2 + chrLabelSize;
      } else {
        chrLabelY = chrWidth * 2 + chrLabelSize + 2;
      }

      if (ideo.config.showChromosomeLabels) {
        chrSet.querySelector('.chrLabel').setAttribute('y', chrLabelY);
        chrSet.querySelector('.chrLabel').setAttribute('text-anchor', 'middle');
      }
      chrSet.setAttribute('transform', 'translate(' + x + ',' + adjustedY + ')');
      chrSet.querySelector('.chromosome').setAttribute(
        'transform', 'translate(-13, 10)'
      );
    }

    if (config.multiorganism) {
      labelGenomes$1(ideo);
    }
  }

  /**
  * Get pixel coordinates to use for rearrangement
  */
  function getXOffsets(chrSets, ideo) {
    var xOffsets, i, index, chr, prevChr, x, prevWidth, prevX, xBump, taxid,
      seenTaxids = {};

    xOffsets = [];
    for (i = 0; i < chrSets.length; i++) {
      chr = ideo.chromosomesArray[i];
      taxid = chr.id.split('-')[1];
      index = (i === 0) ? i : i - 1;
      prevChr = ideo.chromosomesArray[index];
      if (i === 0 || taxid in seenTaxids === false) {
        x = 20;
        seenTaxids[taxid] = 1;
      } else {
        prevWidth = prevChr.width;
        prevX = xOffsets[index];
        xBump = (ideo.config.showChromosomeLabels ? 0 : 2);
        x = prevX + prevWidth + xBump + ideo.config.chrMargin;
      }
      xOffsets.push(x);
    }

    return xOffsets;
  }

  // /**
  //  * Track number of chromosomes in preceding organisms.
  //  * Adds an instance variable to the ideogram object to offset
  //  * chromosome indices.  Needed for multiorganism collinear ideograms.
  //  */
  // function setTaxidChrOffsets(ideo) {
  //   var taxidChrOffsets, taxidChrOffset;

  //   taxidChrOffsets = {};

  //   taxidChrOffset = 0;
  //   ideo.config.organism.forEach((org) => {
  //     var taxid, numChrs;
  //     taxid = ideo.getTaxid(org);
  //     taxidChrOffsets[taxid] = taxidChrOffset;
  //     numChrs = Object.keys(ideo.chromosomes[taxid]).length;
  //     taxidChrOffset += numChrs;
  //   });

  //   ideo.taxidChrOffsets = taxidChrOffsets;
  // }

  // /**
  //  * Change chromosome indices for multiorganism collinear ideograms
  //  * This is needed to account for x-offsets.
  //  */
  // function adjustChrIndex(ideo) {
  //   setTaxidChrOffsets(ideo);

  //   ideo.chromosomesArray.map((chr) => {
  //     var taxid = chr.id.split('-')[1];
  //     var taxidChrOffset = ideo.taxidChrOffsets[taxid];
  //     chr.chrIndex -= taxidChrOffset;
  //     ideo.chromosomes[taxid][chr.name].chrIndex = chr.chrIndex;
  //   });
  // }

  function collinearizeChromosomes(ideo) {
    var chrSets, xOffsets, y, height, width,
      config = ideo.config,
      annotHeight = config.annotationHeight || 0;

    if (config.orientation === 'vertical') {
      collinearizeVerticalChromosomes(ideo);
      return;
    }

    // if (config.multiorganism) adjustChrIndex(ideo);

    ideo.config.annotLabelHeight = 12;
    var annotLabelHeight = ideo.config.annotLabelHeight;

    if ('demarcateCollinearChromosomes' in ideo.config === false) {
      ideo.config.demarcateCollinearChromosomes = true;
    }

    chrSets = document.querySelectorAll('.chromosome-set');

    y = (
      (config.numAnnotTracks * (annotHeight + annotLabelHeight + 4)) -
      config.chrWidth + 1
    );

    xOffsets = getXOffsets(chrSets, ideo);
    rearrangeChromosomes$1(chrSets, xOffsets, y, ideo);

    height = y + config.chrWidth * 2 + 20;

    if (config.multiorganism) {
      height *= 8;
      var maxWidth = 0;
      xOffsets.forEach(d => {
        if (d > maxWidth) maxWidth = d;
      });
      width = maxWidth + 20;
    } else {
      width = xOffsets.slice(-1)[0] + 20;
    }

    d3.select(ideo.selector)
      .attr('width', width)
      .attr('height', height);

    d3.select('#_ideogramTrackLabelContainer').remove();
    d3.select('#_ideogramInnerWrap')
      .insert('div', ':first-child')
      .attr('id', '_ideogramTrackLabelContainer')
      .style('position', 'absolute');
  }

  function processLabels(config, ideo) {
    var i, chrID, t0C, t1C;

    if (config.showBandLabels === true) {
      t0C = new Date().getTime();
      ideo.hideUnshownBandLabels();
      t1C = new Date().getTime();
      if (config.debug) {
        console.log('Time in showing bands: ' + (t1C - t0C) + ' ms');
      }

      if (config.orientation === 'vertical') {
        for (i = 0; i < ideo.chromosomesArray.length; i++) {
          chrID = '#' + ideo.chromosomesArray[i].id;
          ideo.rotateChromosomeLabels(d3.select(chrID), i);
        }
      }
    }

    if (config.showChromosomeLabels === true) {
      ideo.drawChromosomeLabels(ideo.chromosomes);
    }
  }

  function processAnnots(ideo) {
    if (typeof ideo.timeout !== 'undefined') window.clearTimeout(ideo.timeout);

    ideo.rawAnnots = ideo.setOriginalTrackIndexes(ideo.rawAnnots);

    if (ideo.config.annotationsDisplayedTracks) {
      ideo.annots =
        ideo.updateDisplayedTracks(ideo.config.annotationsDisplayedTracks);
    } else {
      ideo.annots = ideo.processAnnotData(ideo.rawAnnots);
      if (ideo.config.filterable) ideo.initCrossFilter();
      ideo.drawProcessedAnnots(ideo.annots);
    }
  }

  /**
   * Load (potentially large) annotation dataset, then process it.
   */
  function waitForAndProcessAnnots(ideo) {
    if (ideo.rawAnnots) {
      processAnnots(ideo);
    } else {
      (function checkAnnotData() {
        ideo.timeout = setTimeout(function() {
          if (
            !ideo.rawAnnots ||
            (ideo.rawAnnots && typeof ideo.rawAnnots.then !== 'undefined')
          ) {
            // Ensure rawAnnots is defined and not a Promise (not "then"-able)
            checkAnnotData();
          } else {
            processAnnots(ideo);
          }
        }, 50);
      })();
    }
  }

  function reportDebugTimings(config, t0, t0A) {

    var t1A = new Date().getTime();
    if (config.debug) {
      console.log('Time in drawChromosome: ' + (t1A - t0A) + ' ms');
    }

    var t1 = new Date().getTime();
    if (config.debug) {
      console.log('Time constructing ideogram: ' + (t1 - t0) + ' ms');
    }
  }

  /**
   * Completes high-level initialization.
   * Draws chromosomes and band labels, rotating as needed;
   * processes and draws annotations;
   * creates brush, emits notification of load completion, etc.
   */
  function finishInit(t0) {
    var t0A = new Date().getTime(),
      ideo = this,
      config = ideo.config,
      confAnnots = config.annotations;

    ideo.initDrawChromosomes();

    if (config.annotationsPath) waitForAndProcessAnnots(ideo);

    processLabels(config, ideo);

    // Create a brush or a click cursor if specified
    if (config.brush) ideo.createBrush(config.brush);
    else if (config.cursorPosition) ideo.createClickCursor(config.cursorPosition);

    if (confAnnots) {
      if (Array.isArray(confAnnots)) {
        ideo.drawAnnots(confAnnots);
      } else {
        // Enable client-side-defined annotations to be formatted
        // like the wider variety of server-side-defined annotations.
        // Supports https://github.com/eweitz/ideogram/issues/137
        ideo.rawAnnots = confAnnots;
        ideo.afterRawAnnots();
        processAnnots(ideo);
      }
    }

    reportDebugTimings(config, t0, t0A);

    ideo.setOverflowScroll();

    if (config.geometry === 'collinear') collinearizeChromosomes(ideo);

    if (ideo.onLoadCallback) ideo.onLoadCallback();
  }

  class Ploidy {

    constructor(config) {
      this._config = config;
      this._description = this._normalize(this._config.ploidyDesc);
    }

    // Get number of chromosomes in a chromosome set
    getChromosomesNumber(setIndex) {
      if (this._config.ploidyDesc) {
        var chrSetCode = this._config.ploidyDesc[setIndex];
        if (chrSetCode instanceof Object) {
          return Object.keys(chrSetCode)[0].length;
        } else {
          return chrSetCode.length;
        }
      } else {
        return this._config.ploidy || 1;
      }
    }

    // Normalize use defined description
    _normalize(description) {
      var key, descValue,
        normalized = [];

      if (!description) return description;

      // Loop through description and normalize
      for (key in description) {
        descValue = description[key];
        if (typeof descValue === 'string') {
          if (this._config.orientation === 'vertical') {
            descValue = descValue.split('').reverse();
          }
          normalized.push({
            ancestors: descValue,
            existence: this._getexistenceArray(descValue.length)
          });
        } else {
          normalized.push({
            ancestors: Object.keys(descValue)[0],
            existence: descValue[Object.keys(descValue)[0]]
          });
        }
      }

      return normalized;
    }

    // Get array filled by '11' elements
    _getexistenceArray(length) {
      var array = [];

      for (var i = 0; i < length; i++) {
        array.push('11');
      }

      return array;
    }

    getSetSize(chrSetIndex) {
      if (this._description) {
        return this._description[chrSetIndex].ancestors.length;
      } else {
        return 1;
      }
    }

    // Get ancestor letter
    getAncestor(chrSetIndex, chrIndex) {
      if (this._description) {
        return this._description[chrSetIndex].ancestors[chrIndex];
      } else {
        return '';
      }
    }

    // Check if chromosome's arm should be rendered.
    // If no description was provided, method returns true and
    // something another depending on user provided description.
    exists(chrSetIndex, chrIndex, armIndex) {
      if (this._description) {
        var desc =
          this._description[chrSetIndex].existence[chrIndex][armIndex];
        return Number(desc) > 0;
      } else {
        return true;
      }
    }

  }

  /**
   * Chromosome's view utility class
   */
  class ChromosomeUtil {

    constructor(node) {
      this._node = node;
    }

    getLabel() {
      var label =
        d3
          .select(this._node.parentNode)
          .select('text.chrLabel')
          .text();
      return label;
    }

    /**
     * Get chromosome set label
     */
    getSetLabel() {
      var setLabel =
        d3
          .select(this._node.parentNode)
          .select('text.chrSetLabel')
          .text();
      return setLabel;
    }
  }

  class Layout {

    constructor(config, ideo) {
      this._config = config;
      this._ideo = ideo;
      this._ploidy = this._ideo._ploidy;
      this._translate = undefined;

      if ('chrSetMargin' in config) {
        this.chrSetMargin = config.chrSetMargin;
      } else {
        var chrMargin = this._config.chrMargin;
        this.chrSetMargin = (this._config.ploidy > 1 ? chrMargin : 0);
      }

      // Chromosome band's size.
      this._tickSize = 8;

      // Chromosome rotation state.
      this._isRotated = false;
    }

    // Get chart left margin
    _getLeftMargin() {
      return this.margin.left;
    }

    // Get rotated chromosome y scale
    _getYScale() {
      // 20 is width of rotated chromosome.
      return 20 / this._config.chrWidth;
    }

    // Get chromosome labels
    getChromosomeLabels(chrElement) {
      var util = new ChromosomeUtil(chrElement),
        labels = [];

      if (this._ideo.config.ploidy > 1) {
        labels.push(util.getSetLabel());
      }
      labels.push(util.getLabel());

      return labels.filter(function(d) {
        return d.length > 0;
      });
    }

    getChromosomeBandLabelTranslate(band) {
      var x, y, translate,
        ideo = this._ideo,
        tickSize = this._tickSize,
        orientation = ideo.config.orientation;

      if (orientation === 'vertical') {
        x = tickSize;
        y = ideo.round(2 + band.px.start + band.px.width / 2);
        translate = 'rotate(-90)translate(' + x + ',' + y + ')';
      } else if (orientation === 'horizontal') {
        x = ideo.round(-tickSize + band.px.start + band.px.width / 2);
        y = -10;
        translate = 'translate(' + x + ',' + y + ')';
      }

      return {
        x: x,
        y: y,
        translate: translate
      };
    }

    didRotate(chrIndex, chrElement) {
      var ideo, taxid, chrName, bands, chrModel, oldWidth,
        chrSetElement, transform, scale, scaleRE;

      ideo = this._ideo;
      taxid = ideo.config.taxid;
      chrName = chrElement.id.split('-')[0].replace('chr', '');
      chrModel = ideo.chromosomes[taxid][chrName];
      bands = chrModel.bands;

      chrSetElement = d3.select(chrElement.parentNode);
      transform = chrSetElement.attr('transform');
      scaleRE = /scale\(.*\)/;
      scale = scaleRE.exec(transform);
      transform = transform.replace(scale, '');
      chrSetElement.attr('transform', transform);

      oldWidth = chrModel.width;

      chrModel = ideo.getChromosomeModel(bands, chrName, taxid, chrIndex);

      chrModel.oldWidth = oldWidth;

      ideo.chromosomes[taxid][chrName] = chrModel;
      ideo.drawChromosome(chrModel);

      ideo.handleRotateOnClick();

      if (ideo.rawAnnots) {
        if (ideo.displayedTrackIndexes) {
          ideo.updateDisplayedTracks(ideo.displayedTrackIndexes);
        } else {
          ideo.annots = ideo.processAnnotData(ideo.rawAnnots);
          ideo.drawProcessedAnnots(ideo.annots);

          if (ideo.config.filterable) {
            ideo.initCrossFilter();
          }
        }
      }

      if (ideo.config.showBandLabels === true) {
        ideo.drawBandLabels(ideo.chromosomes);
        ideo.hideUnshownBandLabels();
      }

      if (ideo.onDidRotateCallback) {
        ideo.onDidRotateCallback(chrModel);
      }
    }

    rotate(chrSetIndex, chrIndex, chrElement) {
      var ideo, otherChrs, ideoBounds, labelSelectors;
      ideo = this._ideo;

      labelSelectors = (
        ideo.selector + ' .chrSetLabel, ' + ideo.selector + ' .chrLabel'
      );

      ideoBounds = document.querySelector(ideo.selector).getBoundingClientRect();

      // Find chromosomes which should be hidden
      otherChrs = d3.selectAll(ideo.selector + ' g.chromosome')
        .filter(function() {return this !== chrElement;});

      if (this._isRotated) {

        this._isRotated = false;

        ideo.config.chrHeight = ideo.config.chrHeightOriginal;
        ideo.config.chrWidth = ideo.config.chrWidthOriginal;
        ideo.config.annotationHeight = ideo.config.annotationHeightOriginal;

        // Rotate chromosome back
        this.rotateBack(chrSetIndex, chrIndex, chrElement, function() {
          // Show all other chromosomes and chromosome labels
          otherChrs.style('display', null);
          d3.selectAll(labelSelectors).style('display', null);
          ideo._layout.didRotate(chrIndex, chrElement);
        });

      } else {

        this._isRotated = true;

        // Hide all other chromosomes and chromosome labels
        otherChrs.style('display', 'none');
        d3.selectAll(labelSelectors).style('display', 'none');

        // Rotate chromosome
        this.rotateForward(chrSetIndex, chrIndex, chrElement, function() {

          var chrHeight, elementLength, windowLength;

          ideo.config.chrHeightOriginal = ideo.config.chrHeight;
          ideo.config.chrWidthOriginal = ideo.config.chrWidth;
          ideo.config.annotationHeightOriginal = ideo.config.annotationHeight;

          const settingsGearWidth = 20;

          if (ideo._layout._class === 'VerticalLayout') {
            elementLength = ideoBounds.width - settingsGearWidth;
            windowLength = window.innerWidth - settingsGearWidth;
          } else {
            elementLength = ideoBounds.height - 10;
            windowLength = window.innerHeight - 10;
          }

          // Set chromosome height to window length or ideogram element length,
          // whichever is smaller.  This keeps whole chromosome viewable, while
          // also ensuring the height doesn't exceed what the user specified.
          if (windowLength < elementLength) {
            chrHeight = windowLength;
          } else {
            chrHeight = elementLength;
          }
          chrHeight -= ideo.config.chrMargin * 2;
          ideo.config.chrHeight = chrHeight;

          // Account for chromosome label
          // TODO: Make this dynamic, not hard-coded
          ideo.config.chrWidth *= 2.3;

          ideo.config.annotationHeight *= 1.7;

          ideo._layout.didRotate(chrIndex, chrElement);
        });
      }
    }

    getChromosomeLabelClass() {
      if (this._config.ploidy === 1) {
        return 'chrLabel';
      } else {
        return 'chrSetLabel';
      }
    }

    _getAdditionalOffset() {
      var config = this._config;
      var numTracks = config.annotationsNumTracks || config.numAnnotTracks || 1;
      return (config.annotationHeight || 0) * numTracks;
    }

    _getChromosomeSetSize(chrSetIndex) {
      // Get last chromosome set size.
      var setSize = this._ploidy.getSetSize(chrSetIndex);

      // Increase offset by last chromosome set size
      return (
        setSize * this._config.chrWidth * 2 + (this.chrSetMargin)
      );
    }

    // Get chromosome set label anchor property
    getChromosomeSetLabelAnchor() {
      return 'middle';
    }

    // Get chromosome label y position.
    getChromosomeLabelYPosition() {
      return -5.5;
    }

    getChromosomeSetLabelYPosition(chrIndex) {
      if (this._config.ploidy === 1) {
        return this.getChromosomeLabelYPosition(chrIndex);
      } else {
        return -2 * this._config.chrWidth;
      }
    }

  }

  /**
  * @fileoverview Vertical layout class
  * Ideogram instances with vertical layout are oriented with each chromosome
  * starting at top and ending at bottom, and aligned as columns.
  */

  class VerticalLayout extends Layout {

    constructor(config, ideo) {
      super(config, ideo);
      this._class = 'VerticalLayout';
      // Layout margins
      this.margin = {
        top: 30,
        left: 15
      };
    }

    rotateForward(chrSetIndex, chrIndex, chrElement, callback) {
      // TODO: Integrate chrSetIndex and chrIndex to support polyploid rotation.

      var self = this;

      var xOffset = 20;

      var scale = this.getChromosomeScale(chrElement);

      var transform =
        'translate(' + xOffset + ', 25) ' + scale;

      d3.select(chrElement.parentNode)
        .transition()
        .attr('transform', transform)
        .on('end', callback);

      // Append new chromosome labels
      var labels = this.getChromosomeLabels(chrElement);
      var y = (xOffset + self._config.chrWidth) * 1.3;
      d3.select(this._ideo.getSvg())
        .append('g')
        .attr('class', 'tmp')
        .selectAll('text')
        .data(labels)
        .enter()
        .append('text')
        .attr('class', function(d, i) {
          return i === 0 && labels.length === 2 ? 'chrSetLabel' : null;
        })
        .attr('x', 0)
        .attr('y', y).style('opacity', 0)
        .text(String)
        .transition()
        .style('opacity', 1);

      this._ideo.config.orientation = 'horizontal';
    }

    rotateBack(setIndex, chrIndex, chrElement, callback) {

      var scale = this.getChromosomeScaleBack(chrElement);
      var translate = this.getChromosomeSetTranslate(setIndex);

      d3.select(chrElement.parentNode)
        .transition()
        .attr('transform', translate + ' ' + scale)
        .on('end', callback);

      d3.selectAll(this._ideo.selector + ' g.tmp')
        .style('opacity', 0)
        .remove();

      this._ideo.config.orientation = 'vertical';
    }

    getHeight() {
      return this._config.chrHeight + this.margin.top * 1.5;
    }

    getWidth() {
      return '97%';
    }

    getChromosomeBandTickY1() {
      return 2;
    }

    getChromosomeBandTickY2() {
      return 10;
    }

    getChromosomeSetLabelTranslate() {
      return 'rotate(-90)';
    }

    getChromosomeBandLabelAnchor() {
      return null;
    }

    getChromosomeScale(chrElement) {
      var ideoBox, chrBox, scaleX, scaleY;

      ideoBox = d3.select(this._ideo.selector).node().getBoundingClientRect();
      chrBox = chrElement.getBoundingClientRect();

      scaleX = (ideoBox.width / chrBox.height) * 0.97;
      scaleY = this._getYScale();

      return 'scale(' + scaleX + ', ' + scaleY + ')';
    }

    getChromosomeScaleBack(chrElement) {
      var scale, scaleX, scaleY, chrName, chrModel, taxid, ideo, config;

      ideo = this._ideo;
      config = ideo.config;
      taxid = config.taxid;

      chrName = chrElement.id.split('-')[0].replace('chr', '');
      chrModel = this._ideo.chromosomes[taxid][chrName];
      scaleX = (chrModel.oldWidth / (config.chrHeight * 3)) * 0.97;
      scaleY = 1 / this._getYScale();
      scale = 'scale(' + scaleX + ', ' + scaleY + ')';
      return scale;
    }

    getChromosomeSetTranslate(setIndex) {
      var marginTop = this.margin.top;
      var chromosomeSetYTranslate = this.getChromosomeSetYTranslate(setIndex);
      return (
        'rotate(90) ' +
        'translate(' + marginTop + ', -' + chromosomeSetYTranslate + ')'
      );
    }

    getChromosomeSetYTranslate(setIndex) {
      // Get additional padding caused by annotation/histogram tracks
      var pad = this._getAdditionalOffset(),
        config = this._config,
        margin = config.chrMargin,
        width = config.chrWidth,
        translate;

      // If no detailed description provided just use one formula for all cases
      if (!config.ploidyDesc) {
        // TODO:
        // This part of code contains a lot magic numbers and if
        // statements for exactly corresponing to original ideogram examples.
        // But all this stuff should be removed. Calculation of translate
        // should be a simple formula applied for all cases listed below.
        // Now they are diffirent because of Layout:_getAdditionalOffset do
        // not meet for cases when no annotation, when annotation exists and
        // when histogram used

        if (config.annotationsLayout === 'histogram') {
          var barWidth = config.barWidth;
          return margin + setIndex * (margin + width + 3) + barWidth * 2;
        } else {
          const decorPad =
            'legendPad' in config ? config.legendPad : 0;
          translate = width + setIndex * (margin + width) + pad * 2 + decorPad;
          if (pad > 0) {
            return translate;
          } else {
            return translate + 4 + (2 * setIndex);
          }
        }
      }

      // If detailed description provided start to calculate offsets
      // for each chromosome set separately. This should be done only once
      if (!this._translate) {
        // First offset equals to zero
        this._translate = [this._ploidy.getSetSize(0) * width * 2];
        var prevTranslate;
        // Loop through description set
        for (var i = 1; i < this._config.ploidyDesc.length; i++) {
          prevTranslate = this._translate[i - 1];
          this._translate[i] = prevTranslate + this._getChromosomeSetSize(i - 1);
        }
      }

      return this._translate[setIndex];
    }

    getChromosomeSetLabelXPosition() {
      return (this._config.chrWidth * this._config.ploidy) / -2;
    }

    getChromosomeLabelXPosition() {
      return this._config.chrWidth / -2;
    }
  }

  /**
  * @fileoverview Horizontal layout class
  * Ideogram instances with horizontal layout are oriented with each chromosome
  * starting at left and ending at right, and aligned as rows.
  */

  class HorizontalLayout extends Layout {

    constructor(config, ideo) {
      super(config, ideo);
      this._class = 'HorizontalLayout';
      this.margin = {
        left: 20,
        top: 30
      };
    }

    _getLeftMargin() {
      var margin = Layout.prototype._getLeftMargin.call(this);
      if (this._config.ploidy > 1) {
        margin *= 1.8;
      }

      return margin;
    }

    rotateForward(setIndex, chrIndex, chrElement, callback) {

      var xOffset, yOffset, transform, labels;

      xOffset = 30;

      yOffset = xOffset + 7.5;

      transform = (
        'rotate(90) ' +
        'translate(' + xOffset + ', -' + yOffset + ') '
      );

      d3.select(chrElement.parentNode)
        .transition()
        .attr('transform', transform)
        .on('end', callback);

      // Append new chromosome labels
      labels = this.getChromosomeLabels(chrElement);
      d3.select(this._ideo.getSvg())
        .append('g')
        .attr('class', 'tmp')
        .selectAll('text')
        .data(labels)
        .enter()
        .append('text')
        .attr('class', function(d, i) {
          return i === 0 && labels.length === 2 ? 'chrSetLabel' : null;
        })
        .attr('x', xOffset - 4)
        .attr('y', function(d, i) {
          return (i + 1 + labels.length % 2) * 12;
        })
        .style('text-anchor', 'middle')
        .style('opacity', 0)
        .text(String)
        .transition()
        .style('opacity', 1);

      this._ideo.config.orientation = 'vertical';
    }

    rotateBack(setIndex, chrIndex, chrElement, callback) {
      var translate = this.getChromosomeSetTranslate(setIndex);

      d3.select(chrElement.parentNode)
        .transition()
        .attr('transform', translate)
        .on('end', callback);

      d3.selectAll(this._ideo.selector + ' g.tmp')
        .style('opacity', 0)
        .remove();

      this._ideo.config.orientation = 'horizontal';
    }

    getHeight(taxid) {
      if (typeof taxid === 'undefined') taxid = this._config.taxids[0];
      // Get last chromosome set offset.
      var numChromosomes = this._config.chromosomes[taxid].length;
      var lastSetOffset = this.getChromosomeSetYTranslate(numChromosomes - 1);

      // Get last chromosome set size.
      var lastSetSize = this._getChromosomeSetSize(numChromosomes - 1);

      // Increase offset by last chromosome set size
      lastSetOffset += lastSetSize;

      return lastSetOffset + this._getAdditionalOffset() * 2;
    }

    getWidth() {
      return this._config.chrHeight + this.margin.top * 1.5;
    }

    getChromosomeSetLabelAnchor() {
      return 'end';
    }

    getChromosomeBandLabelAnchor() {
      return null;
    }

    getChromosomeBandTickY1() {
      return 2;
    }

    getChromosomeBandTickY2() {
      return 10;
    }

    getChromosomeSetLabelTranslate() {
      return null;
    }

    getChromosomeSetTranslate(setIndex) {
      var leftMargin = this._getLeftMargin();
      var yTranslate = this.getChromosomeSetYTranslate(setIndex);
      return 'translate(' + leftMargin + ', ' + yTranslate + ')';
    }

    getChromosomeSetYTranslate(setIndex) {
      // If no detailed description provided just use one formula for all cases.
      if (!this._config.ploidyDesc) {
        return this._config.chrMargin * (setIndex + 1);
      }

      // Id detailed description provided start to calculate offsets
      //  for each chromosome set separately. This should be done only once.
      if (!this._translate) {
        // First offset equals to zero.
        this._translate = [1];

        // Loop through description set
        for (var i = 1; i < this._config.ploidyDesc.length; i++) {
          this._translate[i] =
            this._translate[i - 1] + this._getChromosomeSetSize(i - 1);
        }
      }

      return this._translate[setIndex];
    }

    getChromosomeSetLabelXPosition(i) {
      if (this._config.ploidy === 1) {
        return this.getChromosomeLabelXPosition(i);
      } else {
        return -20;
      }
    }

    getChromosomeSetLabelYPosition(i) {
      var setSize = this._ploidy.getSetSize(i),
        config = this._config,
        chrMargin = config.chrMargin,
        chrWidth = config.chrWidth,
        y;

      if (config.ploidy === 1) {
        y = chrWidth / 2 + 3;
      } else {
        y = (setSize * chrMargin) / 2;
      }

      return y;
    }

    getChromosomeLabelXPosition() {
      return -8;
    }

    getChromosomeLabelYPosition() {
      return this._config.chrWidth;
    }

  }

  /**
  * @fileoverview Paired layout class
  * Ideograms with paired layout group each chromosome in a chromosome set.
  * This enables ploidy support beyond the default haploid; e.g. diploid genomes.
  */

  class PairedLayout extends Layout {

    constructor(config, ideo) {
      super(config, ideo);

      this._class = 'PairedLayout';

      this.margin = {
        left: 30
      };
    }

    getHeight() {
      return this._config.chrHeight + this.margin.left * 1.5;
    }

    getWidth() {
      return '97%';
    }

    getChromosomeBandTickY1(chrIndex) {
      return chrIndex % 2 ? this._config.chrWidth : this._config.chrWidth * 2;
    }

    getChromosomeBandTickY2(chrIndex) {
      var width = this._config.chrWidth;
      return chrIndex % 2 ? width - this._tickSize : width * 2 + this._tickSize;
    }

    getChromosomeBandLabelAnchor(chrIndex) {
      return chrIndex % 2 ? null : 'end';
    }

    getChromosomeBandLabelTranslate(band, chrIndex) {
      var x = chrIndex % 2 ? 10 : -this._config.chrWidth - 10;
      var y = this._ideo.round(band.px.start + band.px.width / 2) + 3;

      return {
        x: y,
        y: y,
        translate: 'rotate(-90) translate(' + x + ', ' + y + ')'
      };
    }

    getChromosomeLabelXPosition() {
      return -this._tickSize;
    }

    getChromosomeSetLabelXPosition() {
      return this._config.chrWidth / -2;
    }

    getChromosomeSetLabelTranslate() {
      return 'rotate(-90)';
    }

    getChromosomeSetTranslate(setIndex) {
      var chromosomeSetYTranslate = this.getChromosomeSetYTranslate(setIndex);
      return (
        'rotate(90) ' +
        'translate(' + this.margin.left + ', -' + chromosomeSetYTranslate + ')'
      );
    }

    getChromosomeSetYTranslate(setIndex) {
      return 200 * (setIndex + 1);
    }

  }

  class SmallLayout extends Layout {

    constructor(config, ideo) {
      super(config, ideo);

      this._class = 'SmallLayout';

      this.margin = {
        left: 36.5,
        top: 10
      };

      var taxid = this._ideo.getTaxid(this._ideo.config.organism);

      this.chrs = config.chromosomes[taxid];
      var numChrs = this.chrs.length;

      // Number of chromosomes per row
      this.chrsPerRow = Math.ceil(numChrs / config.rows);
    }

    // rotateForward(setIndex, chrIndex, chrElement, callback) {
    //   var ideoBox =
    //      d3.select(this._ideo.selector).node().getBoundingClientRect();
    //   var chrBox = chrElement.getBoundingClientRect();
    //
    //   var scaleX = (ideoBox.width / chrBox.height) * 0.97;
    //   var scaleY = this._getYScale();
    //
    //   transform = 'translate(5, 25) scale(' + scaleX + ', ' + scaleY + ')';
    //
    //   d3.select(chrElement.parentNode)
    //     .transition()
    //     .attr('transform', transform)
    //     .on('end', callback);
    // }
    //
    // rotateBack(setIndex, chrIndex, chrElement, callback) {
    //   var translate = this.getChromosomeSetTranslate(setIndex);
    //
    //   d3.select(chrElement.parentNode)
    //     .transition()
    //     .attr('transform', translate)
    //     .on('end', callback);
    // }

    /**
     * eweitz 2020-04-13:
     * This height metric is crude because it is calculated before
     * the height ("width") of each chromosome is calculated.
     *
     * It calculates height by multiplying the max height of all chromosomes
     * (specified in the Ideogram configuration object) by the number of rows.
     * This ensures the ideogram height doesn't truncate in cases like dog
     * (where chrX on the second row is longer than chr1 on the first), but it
     * often leaves too much space on the second row, e.g. for human.
     *
     * Ideally, ideogram height would be cumulative height per row, plus top
     * margin.  This would require calling getHeight _after_ all chromosomes
     * have had their height (technically, chr.width) assigned.  See draft new
     * getHeight method below this getHeight method.
    */
    getHeight() {
      var config = this._config;
      var chrHeight = config.chrHeight * 1.25;
      return this._config.rows * (chrHeight + this.margin.top);
    }

    /**
     * eweitz 2020-04-13:
     * Draft refinement of getHeight.  See note in classic version above.
     *
     * Total height is cumulative height per row, plus top margin
     */
    // getHeight() {
    //   let height = 0;
    //   const rows = this._config.rows;
    //   const chrEntries = Object.entries(this.chrs);

    //   for (let i = 0; i < rows; i++) {
    //     let rowHeight = 0;
    //     // Starting and ending indexes of chromosomes of this row
    //     const startIndex = this.chrsPerRow * i;
    //     const endIndex = this.chrsPerRow * (i + 1) - 1;

    //     for (let j = startIndex; j < endIndex; j++) {
    //       const thisChrHeight = chrEntries[j][1].width;
    //       if (thisChrHeight > rowHeight) {
    //         rowHeight = thisChrHeight;
    //       }
    //     }
    //     height += rowHeight + this.margin.top;
    //   }

    //   return height;
    // }

    getWidth() {
      return '97%';
    }

    getChromosomeBandLabelTranslate() {

    }

    getChromosomeSetLabelTranslate() {
      return 'rotate(-90)';
    }

    getChromosomeSetTranslate(setIndex) {
      var xOffset, yOffset;

      if (setIndex > this.chrsPerRow - 1) {
        xOffset = this.margin.left + this._config.chrHeight * 1.3;
        yOffset = this.getChromosomeSetYTranslate(setIndex - this.chrsPerRow);
      } else {
        xOffset = this.margin.left;
        yOffset = this.getChromosomeSetYTranslate(setIndex);
      }

      return 'rotate(90) translate(' + xOffset + ', -' + yOffset + ')';
    }

    getChromosomeSetYTranslate(setIndex) {
      // Get additional padding caused by annotation tracks
      var additionalPadding = this._getAdditionalOffset() * 0.3;
      // If no detailed description provided just use one formula for all cases
      return (
        this.margin.left * (setIndex) + this._config.chrWidth +
        additionalPadding * 2 + additionalPadding * setIndex
      );
    }

    getChromosomeSetLabelXPosition(setIndex) {
      return (
        ((this._ploidy.getSetSize(setIndex) * this._config.chrWidth + 20) / -2) +
        (this._config.ploidy > 1 ? 0 : this._config.chrWidth)
      );
    }

    getChromosomeLabelXPosition() {
      return this._config.chrWidth / -2;
    }

  }

  function getLayout(ideo) {
    var config = ideo.config;

    if ('perspective' in config && config.perspective === 'comparative') {
      return new PairedLayout(config, ideo);
    } else if ('rows' in config && config.rows > 1) {
      return new SmallLayout(config, ideo);
    } else if (config.orientation === 'vertical') {
      return new VerticalLayout(config, ideo);
    } else if (config.orientation === 'horizontal') {
      return new HorizontalLayout(config, ideo);
    } else {
      return new VerticalLayout(config, ideo);
    }
  }

  /**
   * If ploidy description is a string, then convert it to the canonical
   * array format.  String ploidyDesc is used when depicting e.g. parental
   * origin each member of chromosome pair in a human genome.
   * See ploidy-basic.html for usage example.
   */
  function setPloidy(ideo) {
    if (
      'ploidyDesc' in ideo.config &&
      typeof ideo.config.ploidyDesc === 'string'
    ) {
      var tmp = [];
      for (var i = 0; i < ideo.numChromosomes; i++) {
        tmp.push(ideo.config.ploidyDesc);
      }
      ideo.config.ploidyDesc = tmp;
    }
    // Organism ploidy description
    ideo._ploidy = new Ploidy(ideo.config);
  }

  function getContainerSvgClass(ideo) {
    var svgClass = '';
    if (ideo.config.showChromosomeLabels) {
      if (ideo.config.orientation === 'horizontal') {
        svgClass += 'labeledLeft ';
      } else {
        svgClass += 'labeled ';
      }
    }

    if (ideo.config.rotatable === false) {
      svgClass += 'no-rotate ';
    }

    if (
      ideo.config.annotationsLayout &&
      ideo.config.annotationsLayout === 'overlay'
    ) {
      svgClass += 'faint';
    }

    return svgClass;
  }

  /**
   * Write tooltip div setup with default styling.
   */
  function writeTooltipContainer(ideo) {
    d3.select(ideo.config.container + ' #_ideogramOuterWrap').append('div')
      .attr('class', '_ideogramTooltip')
      .attr('id', '_ideogramTooltip')
      .style('opacity', 0)
      .style('position', 'fixed')
      .style('text-align', 'center')
      .style('padding', '4px')
      .style('font', '12px sans-serif')
      .style('background', 'white')
      .style('border', '1px solid black')
      .style('border-radius', '5px')
      .style('z-index', '1000');
  }

  function writeContainerDom(ideo) {

    // Remove any previous container content
    d3.selectAll(ideo.config.container + ' #_ideogramOuterWrap').remove();

    d3.select(ideo.config.container)
      .append('div')
      .attr('id', '_ideogramOuterWrap')
      .append('div')
      .attr('id', '_ideogramTrackLabelContainer')
      .style('position', 'absolute');

    d3.select(ideo.config.container + ' #_ideogramOuterWrap').append('div')
      .attr('id', '_ideogramMiddleWrap') // needed for overflow and scrolling
      .style('position', 'relative')
      .style('overflow-x', 'auto')
      .style('transform', 'translateZ(0)') // add compositing layer for ideogram
      .append('div')
      .attr('id', '_ideogramInnerWrap') // needed for overflow and scrolling
      .append('svg')
      .attr('id', '_ideogram')
      .attr('class', getContainerSvgClass(ideo))
      .attr('width', ideo._layout.getWidth())
      .attr('height', ideo._layout.getHeight())
      .html(ideo.getBandColorGradients());
  }

  /**
   * Writes the HTML elements that contain this ideogram instance.
   */
  function writeContainer(t0) {
    var ideo = this;

    if (ideo.config.annotationsPath) {
      ideo.fetchAnnots(ideo.config.annotationsPath);
    }

    setPloidy(ideo);

    ideo._layout = getLayout(ideo);

    writeContainerDom(ideo);

    ideo.isOnlyIdeogram = document.querySelectorAll('#_ideogram').length === 1;
    writeTooltipContainer(ideo);
    ideo.finishInit(t0);
  }

  var lastBandDataUrl = '';

  function getBandUrl(bandDataFileNames, taxid, ideo) {
    return ideo.config.dataDir + bandDataFileNames[taxid];
  }

  function shouldFetchBands(bandDataFileNames, taxid, ideo) {
    var bandDataUrl = getBandUrl(bandDataFileNames, taxid, ideo);
    return (
      !(typeof window.chrBands !== 'undefined' && lastBandDataUrl === '') ||
      lastBandDataUrl !== bandDataUrl
    ) &&
    hasNonGenBankAssembly(ideo) &&
    taxid in bandDataFileNames;
  }

  function setBandData(url, fileNames, chrBands, ideo) {
    var taxid, fetchedTaxid, fileName;

    // Ensures correct taxid is processed in response callback;
    // using simply upstream 'taxid' variable gives the last
    // *requested* taxid, which fails when dealing with multiple taxa.
    for (taxid in fileNames) {
      fileName = fileNames[taxid];
      if (url.includes(fileName) && fileName !== '') {
        fetchedTaxid = taxid;
      }
    }

    ideo.bandData[fetchedTaxid] = chrBands;
  }

  function fetchBands(bandDataFileNames, taxid, t0, ideo) {
    var bandDataUrl = getBandUrl(bandDataFileNames, taxid, ideo);

    if (!ideo.numBandDataResponses) ideo.numBandDataResponses = 0;

    return fetchWithRetry(bandDataUrl)
      .then(function(response) {
        return response.json().then(function(rawBands) {
          lastBandDataUrl = bandDataUrl;

          delete window.chrBands; // Remove any previous chrBands variable
          window.chrBands = rawBands.chrBands;

          setBandData(response.url, bandDataFileNames, chrBands, ideo);
        });
      });
  }

  /**
   * @fileoveriew Methods for initialization
   */

  function isHeterogameticChromosome(chrModel, chrIndex, ideo) {
    var ploidy = ideo.config.ploidy;
    return (
      'sex' in ideo.config &&
        (
          ploidy === 2 && ideo.sexChromosomes.index + 1 === chrIndex ||
          ideo.config.sex === 'female' && chrModel.name === 'Y'
        )
    );
  }

  function prepareChromosomes(bandsArray, chrs, taxid, ideo) {
    var j, bands, chromosome, chrModel, chrIndex;

    for (j = 0; j < chrs.length; j++) {
      chromosome = chrs[j];
      if (typeof bandsArray !== 'undefined') bands = bandsArray[j];

      chrIndex = j + ideo.config.taxids.indexOf(taxid);
      chrModel = ideo.getChromosomeModel(bands, chromosome, taxid, chrIndex);

      if (typeof chromosome !== 'string') {
        chromosome = chromosome.name.split(' ').slice(-1)[0].replace('chr', '');
      }

      ideo.chromosomes[taxid][chromosome] = chrModel;
      ideo.chromosomesArray.push(chrModel);

      if (isHeterogameticChromosome(chrModel, j, ideo)) continue;

      ideo.drawChromosome(chrModel);
    }
  }

  function setCoordinateSystem(chrs, ideo) {
    if (
      typeof chrBands !== 'undefined' &&
      chrs.length >= chrBands.length / 2
    ) {
      ideo.coordinateSystem = 'bp';
    }
  }

  /**
   * Configures chromosome data and calls downstream chromosome drawing functions
   */
  function initDrawChromosomes() {
    var taxid, i, chrs, bandsArray,
      ideo = this,
      taxids = ideo.config.taxids;

    for (i = 0; i < taxids.length; i++) {
      taxid = taxids[i];
      chrs = ideo.config.chromosomes[taxid];

      bandsArray = ideo.bandsArray[taxid];

      if (!ideo.config.showNonNuclearChromosomes) {
        // Remove MT
        // TODO: Handle other non-nuclear chromosomes, e.g. CP, AP
        chrs = chrs.filter(chr => chr !== 'MT');
        if (typeof bandsArray !== 'undefined') {
          bandsArray = bandsArray.filter(bands => {
            return bands[0].chr !== 'MT';
          });
        }
      }

      setCoordinateSystem(chrs, ideo);

      ideo.chromosomes[taxid] = {};
      ideo.setSexChromosomes(chrs);

      prepareChromosomes(bandsArray, chrs, taxid, ideo);

      if (ideo.config.showBandLabels) ideo.drawBandLabels(ideo.chromosomes);
      ideo.handleRotateOnClick();
      ideo._gotChrModels = true; // Prevent issue with errant rat centromeres
    }
  }

  /**
   * Attach any click handlers to rotate and toggle chromosomes
   */
  function handleRotateOnClick() {
    var ideo = this;

    if (!('rotatable' in ideo.config && ideo.config.rotatable === false)) {
      d3.selectAll(ideo.selector + ' .chromosome-set').on('click', function() {
        // Handles click on chromosome graphic or label.
        // Label click needed to toggle e.g. human MT
        const element = this.children[1];

        ideo.rotateAndToggleDisplay(element);
      });
    } else {
      d3.selectAll(ideo.selector).style('cursor', 'default');
    }
  }

  /**
   * Called when Ideogram has finished initializing.
   * Accounts for certain ideogram properties not being set until
   * asynchronous requests succeed, etc.
   */
  function onLoad() {
    call(this.onLoadCallback);
  }

  function getBandFileName(taxid, accession, ideo) {
    var organism = ideo.organisms[taxid];
    var bandFileName = [slug(organism.scientificName)];
    var assemblies = organism.assemblies;
    var resolution = ideo.config.resolution;

    if (accession !== assemblies.default) {
      bandFileName.push(accession);
    }
    if (
      taxid === '9606' &&
      (accession in assemblies === 'false' &&
        Object.values(assemblies).includes(config.assembly) ||
        (resolution !== '' && resolution !== 850))
    ) {
      bandFileName.push(resolution);
    }

    bandFileName = bandFileName.join('-');

    var fullyBandedTaxids = ['9606', '10090', '10116'];
    if (fullyBandedTaxids.includes(taxid) && !ideo.config.showFullyBanded) {
      bandFileName += '-no-bands';
    }

    bandFileName += '.json';

    return bandFileName;
  }

  function getBandFileNames(taxid, bandFileNames, ideo) {
    var organism, assemblies, accession, bandFileName,
      config = ideo.config;

    organism = ideo.organisms[taxid];

    if (!config.assembly) ideo.config.assembly = 'default';

    assemblies = organism.assemblies;

    if (ideo.assemblyIsAccession()) {
      accession = config.assembly;
    } else {
      accession = assemblies[config.assembly];
    }

    bandFileName = getBandFileName(taxid, accession, ideo);
    var isCustomOrganism = taxid === '-1';

    if (taxid in ideo.organismsWithBands || isCustomOrganism) {
      bandFileNames[taxid] = bandFileName;
    }
    return bandFileNames;
  }

  function prepareContainer(taxid, bandFileNames, t0, ideo) {

    if (shouldFetchBands(bandFileNames, taxid, ideo)) {
      return fetchBands(bandFileNames, taxid, t0, ideo).then(function() {
        return ideo.processBandData(taxid);
      });
    } else {
      return new Promise(function(resolve) {
        ideo.processBandData(taxid);
        resolve([taxid, undefined]);
      });
    }
  }

  function initializeTaxids(ideo) {
    return new Promise(function(resolve) {
      var organism = ideo.config.organism;
      if (typeof organism === 'number') {
        // 'organism' is a taxid, e.g. 9606
        ideo.getOrganismFromEutils(organism, function() {
          ideo.getTaxids(resolve);
        });
      } else {
        ideo.getTaxids(resolve);
      }

    });
  }

  function getBandsAndPrepareContainer(taxids, t0, ideo) {
    var bandFileNames, i, taxid,
      promises = [];

    bandFileNames = {};
    for (taxid in organismMetadata) {
      bandFileNames[taxid] = '';
    }

    for (i = 0; i < taxids.length; i++) {
      taxid = String(taxids[i]);
      bandFileNames = getBandFileNames(taxid, bandFileNames, ideo);
      promises.push(prepareContainer(taxid, bandFileNames, t0, ideo));
    }

    Promise.all(promises).then(function(taxidsAndBandsArrays) {
      var taxidAndBandsArray, taxid, bandsArray;

      for (i = 0; i < taxidsAndBandsArrays.length; i++) {
        taxidAndBandsArray = taxidsAndBandsArrays[i];
        taxid = taxidAndBandsArray[0];
        bandsArray = taxidAndBandsArray[1];

        if ('bandsArray' in ideo === false) {
          ideo.bandsArray = {};
        }

        ideo.bandsArray[taxid] = bandsArray;
      }
      ideo.writeContainer(t0);
    });
  }

  /**
   * Initializes an ideogram.
   * Sets some high-level properties based on instance configuration,
   * fetches band and annotation data if needed, and
   * writes an SVG element to the document to contain the ideogram
   */
  // Prevents race condition when init is called multiple times in
  // quick succession.
  // See https://github.com/eweitz/ideogram/pull/154.
  var ideoNext = {};
  var ideoQueued = {};
  var ideoWait = {};

  function init$1(ideo) {
    ideo = ideo || this;
    var containerId = ideo.config.container;

    if (ideoWait[containerId]) {
      ideoQueued[containerId] = true;
      ideoNext[containerId] = ideo;
    } else {
      ideoWait[containerId] = true;
      initializeTaxids(ideo)
        .then(function(taxids) {

          var taxid = taxids[0];
          ideo.config.taxid = taxid;
          ideo.config.taxids = taxids;

          ideo.organismScientificName =
            ideo.getScientificName(ideo.config.taxid);

          var t0 = new Date().getTime();
          getBandsAndPrepareContainer(taxids, t0, ideo);

          ideoWait[containerId] = false;
          if (ideoQueued[containerId]) {
            ideoQueued[containerId] = false;
            init$1(ideoNext[containerId]);
          }
        });
    }
  }

  /**
   * @fileoverview Parse raw Ideogram.js annotations from a BED file
   * BED documentation: https://genome.ucsc.edu/FAQ/FAQformat#format1
   */

  class BedParser {

    constructor(bed, ideo) {
      this.rawAnnots = this.parseBed(bed, ideo);
    }

    // http://stackoverflow.com/a/5624139
    static componentToHex(c) {
      var hex = parseInt(c, 10).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }

    static rgbToHex(r, g, b) {
      return (
        '#' +
        BedParser.componentToHex(r) +
        BedParser.componentToHex(g) +
        BedParser.componentToHex(b)
      );
    }

    parseGenomicCoordinates(columns, ucscStyle) {
      var chr, start, stop, length;

      // These three columns (i.e. fields) are required
      chr = columns[0];
      start = parseInt(columns[1], 10);
      stop = parseInt(columns[2], 10);

      length = stop - start;

      if (ucscStyle) {
        chr = chr.slice(3);
      }

      return [chr, start, stop, length];
    }

    /**
     * Parses an annotation from a tab-separated line of a BED file
     */
    parseAnnotFromTsvLine(tsvLine, chrs, ucscStyle) {
      var annot, chrIndex, chr, start, rgb, color, label,
        columns = tsvLine.split(/\s/g);

      [chr, start, stop, length] =
        this.parseGenomicCoordinates(columns, ucscStyle);

      chrIndex = chrs.indexOf(chr);
      if (chrIndex === -1) return [null, null];

      annot = ['', start, length, 0];

      if (columns.length >= 4) {
        label = columns[3];
        annot[0] = label;
      }

      if (columns.length >= 8) {
        rgb = columns[8].split(',');
        color = BedParser.rgbToHex(rgb[0], rgb[1], rgb[2]);
        annot.push(color);
      }

      return [chrIndex, annot];
    }

    parseRawAnnots(annots, bedStartIndex, tsvLines, chrs) {
      var i, line, chrIndex, annot, keys, rawAnnots, ucscStyle;

      ucscStyle = true;
      if (isNaN(parseInt(tsvLines[bedStartIndex], 10)) === false) {
        ucscStyle = false;
      }

      for (i = bedStartIndex; i < tsvLines.length; i++) {
        line = tsvLines[i];
        [chrIndex, annot] = this.parseAnnotFromTsvLine(line, chrs, ucscStyle);
        if (chrIndex !== null) annots[chrIndex].annots.push(annot);
      }

      keys = ['name', 'start', 'length', 'trackIndex'];
      if (tsvLines[bedStartIndex].length >= 8) keys.push('color');

      rawAnnots = {keys: keys, annots: annots};

      return rawAnnots;
    }

    /**
    * Parses a BED file, returns raw annotations
    */
    parseBed(bed, ideo) {
      var i, chrs, chr, bedStartIndex, rawAnnots,
        annots = [],
        tsvLines = bed.split(/\r\n|\n/);

      chrs = Object.keys(ideo.chromosomes[ideo.config.taxid]);

      for (i = 0; i < chrs.length; i++) {
        chr = chrs[i];
        annots.push({chr: chr, annots: []});
      }

      bedStartIndex = 0; // 1 if BED has header (i.e. track line), 0 otherwise
      if (tsvLines[0].slice(0, 3) === 'chr' || isNaN(parseInt(tsvLines[0], 10))) {
        bedStartIndex = 1;
      }

      rawAnnots = this.parseRawAnnots(annots, bedStartIndex, tsvLines, chrs);
      return rawAnnots;
    }

  }

  /**
   * @fileoverview Parse raw Ideogram.js annotations from a TSV file
   */

  class TsvParser {

    constructor(tsv, ideo) {
      this.rawAnnots = this.parseTsv(tsv, ideo);
    }

    parseGenomicCoordinates(columns) {
      var chr, start, stop, length;

      // These three columns (i.e. fields) are required
      chr = columns[1];
      start = parseInt(columns[2], 10);
      length = parseInt(columns[3], 10);

      stop = start + length;

      return [chr, start, stop, length];
    }

    /** If value has substring match in headers, return column index */
    getValueColumnIndex(value, headerLine) {
      let index;
      headerLine.split(/\t/g).forEach((header, i) => {
        if (header.includes(value)) index = i;
      });
      return index;
    }

    /**
     * Parses an annotation from a tab-separated line of a TSV file
     */
    parseAnnotFromTsvLine(tsvLine, headerLine, chrs) {
      var annot, chrIndex, chr, start, color, fullName, significance, citations,
        name, index,
        columns = tsvLine.split(/\t/g);

      [chr, start, stop, length] =
        this.parseGenomicCoordinates(columns);
      chrIndex = chrs.indexOf(chr);
      if (chrIndex === -1) return [null, null];

      name = columns[0];
      annot = [name, start, length, 0];

      if (headerLine.includes('color')) {
        index = this.getValueColumnIndex('color', headerLine);
        color = columns[index];
        annot.push(color);
      }
      if (headerLine.includes('full_name')) {
        index = this.getValueColumnIndex('full_name', headerLine);
        fullName = columns[index];
        annot.push(fullName);
      }
      if (headerLine.includes('citations')) {
        index = this.getValueColumnIndex('citations', headerLine);
        citations = columns[index];
        annot.push(citations);
      }
      if (headerLine.includes('significance')) {
        index = this.getValueColumnIndex('significance', headerLine);
        significance = columns[index];
        annot.push(significance);
      }

      return [chrIndex, annot];
    }

    parseRawAnnots(annots, tsvStartIndex, tsvLines, chrs) {
      var i, line, chrIndex, annot, keys, rawAnnots;

      const headerLine = tsvLines[0];

      for (i = tsvStartIndex; i < tsvLines.length; i++) {
        line = tsvLines[i];
        if (line.length === 0) continue; // Skip blank lines
        [chrIndex, annot] = this.parseAnnotFromTsvLine(line, headerLine, chrs);
        if (chrIndex !== null) annots[chrIndex].annots.push(annot);
      }

      keys = ['name', 'start', 'length', 'trackIndex'];
      if (headerLine.includes('color')) keys.push('color');
      if (headerLine.includes('full_name')) keys.push('fullName');
      if (headerLine.includes('citations')) keys.push('citations');
      if (headerLine.includes('significance')) keys.push('significance');

      rawAnnots = {keys: keys, annots: annots};

      return rawAnnots;
    }

    /**
    * Parses a TSV file, returns raw annotations
    */
    parseTsv(tsv, ideo) {
      var i, chrs, chr, tsvStartIndex, rawAnnots,
        annots = [],
        tsvLines = tsv.split(/\r\n|\n/);

      chrs = Object.keys(ideo.chromosomes[ideo.config.taxid]);

      for (i = 0; i < chrs.length; i++) {
        chr = chrs[i];
        annots.push({chr: chr, annots: []});
      }

      tsvStartIndex = 0; // 1 if TSV has header (i.e. track line), 0 otherwise
      if (tsvLines[0].slice(0, 3) === 'chr' || isNaN(parseInt(tsvLines[0], 10))) {
        tsvStartIndex = 1;
      }

      rawAnnots = this.parseRawAnnots(annots, tsvStartIndex, tsvLines, chrs);

      if (tsvStartIndex === 1 && tsvLines[0].includes('citations')) {
        // TSV has a header, so parse citation_from_<start_date>_to_<end_date>
        const headers = tsvLines[0].split('\t');
        const citeIndex = 6;
        const citeHeader = headers[citeIndex];
        const fromTo = citeHeader.split('citations_')[1];
        rawAnnots.annots = rawAnnots.annots.map((annotsByChr) => {
          annotsByChr.annots = annotsByChr.annots.map((annot) => {
            annot[citeIndex] =
              annot[citeIndex] + ' citations ' + fromTo.replace(/_/g, ' ');
            return annot;
          });
          return annotsByChr;
        });
      }

      return rawAnnots;
    }

  }

  /**
   * @fileoverview Functions used by parallel and collinear heatmaps.
   */

  var reservedTrackKeys = [
    'name', 'start', 'length', 'trackIndex', 'trackIndexOriginal', 'color'
  ];

  var defaultHeatmapColors = {
    3: ['00B', 'DDD', 'F00'],
    5: ['00D', '66D', 'DDD', 'F88', 'F00'],
    17: [
      '00D', '00D', '00D', '00D', '00D', '44D', '44D', 'DDD', 'DDD',
      'DDD', 'DDD', 'F88', 'F66', 'F22', 'F22', 'F00', 'F00', 'F00'
    ]
  };

  /**
   * Get label text for displayed tracks from annotation container metadata,
   * heatmap keys, or annotation container keys
   */
  function getLabels(ideo) {
    var annotKeys, labels, heatmaps, i;

    if (ideo.rawAnnots.metadata && ideo.rawAnnots.metadata.trackLabels) {
      labels = ideo.rawAnnots.metadata.trackLabels;
    } else if (ideo.config.heatmaps) {
      labels = [];
      heatmaps = ideo.config.heatmaps;
      for (i = 0; i < heatmaps.length; i++) {
        labels.push(heatmaps[i].key);
      }
    } else {
      annotKeys = ideo.rawAnnots.keys.slice(0);
      labels = annotKeys.filter(d => !reservedTrackKeys.includes(d));
    }

    if (ideo.displayedTrackIndexes) {
      labels = labels.filter(function(d, i) {
        return ideo.displayedTrackIndexes.includes(i + 1);
      });
    }

    return labels;
  }

  /**
   * Apply heatmap thresholds that are passed in as annotation metadata
   */
  function inflateThresholds(ideo) {
    var thresholds, colors,
      rawAnnots = ideo.rawAnnots;

    if (
      rawAnnots.metadata && !rawAnnots.metadata.heatmapThresholds &&
      !ideo.config.heatmapThresholds
    ) {
      return;
    }

    if (ideo.config.heatmapThresholds) {
      thresholds = ideo.config.heatmapThresholds;
    } else {
      thresholds = ideo.rawAnnots.metadata.heatmapThresholds;
    }

    colors = defaultHeatmapColors[thresholds.length + 1];
    thresholds = thresholds.map((d, i) => {
      return [d, '#' + colors[i]];
    });

    thresholds.push(['+', '#' + colors.slice(-1)[0]]);

    return thresholds;
  }

  /**
   * Set needed configuration options from raw annotation data.
   * Simplifies heatmap API by inferring reasonable defaults.
   */
  function inflateHeatmaps(ideo) {
    var i, labels, heatmaps, annotationTracks, rawAnnots, displayedTracks,
      thresholds = ideo.config.heatmapThresholds;

    heatmaps = [];
    rawAnnots = ideo.rawAnnots;
    labels = rawAnnots.keys.slice(3);

    annotationTracks = [];
    displayedTracks = [];
    if (rawAnnots.metadata || !isNaN(thresholds[0])) {
      thresholds = inflateThresholds(ideo);
    }

    for (i = 0; i < labels.length; i++) {
      heatmaps.push({key: labels[i], thresholds: thresholds});
      annotationTracks.push({id: labels[i]});
      displayedTracks.push(i + 1);
    }
    ideo.config.annotationsNumTracks = labels.length;
    ideo.config.annotationsDisplayedTracks = displayedTracks;
    ideo.config.heatmaps = heatmaps;
    ideo.config.annotationTracks = annotationTracks;
  }

  /**
   * Given annotation value (m), should it use the color in this threshold?
   */
  function shouldUseThresholdColor(m, numThresholds, value, prevThreshold,
    threshold) {

    return (
      // If this is the last threshold, and
      // its value is "+" and the value is above the previous threshold...
      m === numThresholds && (
        threshold === '+' && value > prevThreshold
      ) ||

      // ... or if the value matches the threshold...
      value === threshold ||

      // ... or if this isn't the first or last threshold, and
      // the value is between this threshold and the previous one...
      m !== 0 && m !== numThresholds && (
        value <= threshold &&
        value > prevThreshold
      ) ||

      // ... or if this is the first threshold and the value is
      // at or below the threshold
      m === 0 && value <= threshold
    );
  }

  /**
   * Determine the color of the heatmap annotation.
   */
  function getHeatmapAnnotColor(thresholds, value) {
    var m, numThresholds, thresholdList, threshold, tvNum, thresholdColor,
      prevThreshold, useThresholdColor, color;

    for (m = 0; m < thresholds.length; m++) {
      numThresholds = thresholds.length - 1;
      thresholdList = thresholds[m];
      threshold = thresholdList[0];

      // The threshold value is usually a number,
      // but can also be a "+" character indicating that
      // this threshold is anything greater than the previous threshold.
      tvNum = parseFloat(threshold);
      if (isNaN(tvNum) === false) threshold = tvNum;
      if (m !== 0) prevThreshold = parseFloat(thresholds[m - 1][0]);
      thresholdColor = thresholdList[1];

      useThresholdColor = shouldUseThresholdColor(m, numThresholds, value,
        prevThreshold, threshold);

      if (useThresholdColor) color = thresholdColor;
    }

    return color;
  }

  /**
   * @fileoverview Functions for labeling collinear tracks of genome annotations.
   * See track-labels.js for more.
   */

  function renderTrackLabels(labels, ideo) {
    var i, x, y, labelContainer, markBump,
      annotLabelHeight = ideo.config.annotLabelHeight,
      demarcateChrs = ideo.config.demarcateCollinearChromosomes;

    x = 11; // Close to chrLeft in heatmap-collinear.js.  For tabs.
    markBump = (demarcateChrs ? 2 : 0); // Make labels flush with demarcations

    labelContainer =
      d3.select(ideo.config.container + ' #_ideogramTrackLabelContainer');
    labelContainer.html('');

    y = ideo.config.annotationHeight + annotLabelHeight + 4;

    for (i = 0; i < labels.length; i++) {
      labelContainer
        .style('position', 'absolute')
        .append('div')
        .attr('class', '_ideogramTrackLabel')
        .style('opacity', 1)
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('padding', '1px')
        .style('font', '11px sans-serif')
        .style('background', 'white')
        .style('line-height', '10px')
        .style('z-index', '5')
        .style('left', (x + markBump) + 'px')
        .style('top', (y * i + markBump) + 'px')
        .style('width', 'max-content')
        .style('transform-origin', 'bottom left')
        .style('text-align', 'left')
        .html(labels[i]);
    }

  }

  /**
   * Show the label for this track
   */
  function writeTrackLabels(ideo) {
    var labels = getLabels(ideo);
    renderTrackLabels(labels, ideo);
  }

  /**
   * @fileoverview Functions for collinear heatmaps of genome annotations.
   * See heatmap.js for more.
   */

  /**
   * Add canvases that will contain annotations.  One canvas per track.
   */
  function writeCanvases(chr, chrLeft, ideo) {
    var j, trackLeft, trackWidth, canvas, context, id,
      chrWidth = chr.width,
      contextArray = [],
      annotLabelHeight = ideo.config.annotLabelHeight,
      numAnnotTracks = ideo.config.numAnnotTracks;

    // Create a canvas for each annotation track on this chromosome
    for (j = 0; j < numAnnotTracks; j++) {
      trackWidth = ideo.config.annotationHeight + annotLabelHeight + 4;
      id = chr.id + '-canvas-' + j; // e.g. chr1-9606-canvas-0
      trackLeft = chrLeft;
      if (chr.chrIndex > 0) {
        trackLeft += (ideo.config.chrMargin * chr.chrIndex) - 1;
      }
      canvas = d3.select(ideo.config.container + ' #_ideogramInnerWrap')
        .append('canvas')
        .attr('id', id)
        .attr('width', chrWidth + 1)
        .attr('height', trackWidth)
        .style('position', 'absolute')
        .style('left', trackLeft + 'px')
        .style('top', (trackWidth * j + 1) + 'px');
      context = canvas.nodes()[0].getContext('2d');
      contextArray.push([context, chr]);
    }

    return contextArray;
  }

  /**
   * Render annotations on the canvas
   */
  function fillCanvasAnnots(annots, contextArray, ideo) {
    var j, annot, context, chr,
      annotLabelHeight = ideo.config.annotLabelHeight,
      annotHeight = ideo.config.annotationHeight,
      demarcateChrs = ideo.config.demarcateCollinearChromosomes;

    var trackWidth = annotHeight + annotLabelHeight + 4;

    // Fill in the canvas(es) with annotation colors to draw a heatmap
    for (j = 0; j < annots.length; j++) {
      annot = annots[j];
      context = contextArray[annot.trackIndex][0];
      chr = contextArray[annot.trackIndex][1];
      context.fillStyle = annot.color;
      if (demarcateChrs) {
        if (annot.startPx < 1 || annot.startPx > chr.width - 1) continue;
        context.fillRect(annot.startPx, 1, 0.5, trackWidth);
      } else {
        context.fillRect(annot.startPx, annotLabelHeight + 1, 0.5, annotHeight);
      }
    }

    if (demarcateChrs) {
      for (j = 0; j < contextArray.length; j++) {
        context = contextArray[j][0];
        chr = contextArray[j][1];
        context.fillStyle = '#555';
        if (chr.chrIndex === 0) context.fillRect(0, 0, 1, trackWidth);
        context.fillRect(chr.width - 1, 0, 1.1, trackWidth);
        context.fillRect(0, 0, chr.width + 1, 1);
        if (ideo.config.chrMargin) context.fillRect(0, 0, 1.1, trackWidth);
      }
    }
  }

  /**
   * Draw a 1D heatmap of annotations along each chromosome.
   * Ideal for representing very dense annotation sets in a granular manner
   * without subsampling.
   *
   * TODO:
   * - Support in 'vertical' orientation
   * - Support after rotating chromosome on click
   */
  function drawHeatmapsCollinear(annotContainers, ideo) {
    var annots, chrLeft, contextArray, i, chr,
      prevX = 0,
      xBump = (ideo.config.showChromosomesLabels) ? 2 : -0.1;

    d3.select(ideo.selector).classed('labeledLeft', false);
    d3.selectAll(ideo.config.container + ' canvas').remove();

    // Each "annotationContainer" represents annotations for a chromosome
    for (i = 0; i < annotContainers.length; i++) {
      annots = annotContainers[i].annots;
      chr = ideo.chromosomesArray[i];
      if (i === 0) {
        chrLeft = 12;
      } else {
        chrLeft = prevX + ideo.chromosomesArray[i - 1].width + 14;
        prevX += ideo.chromosomesArray[i - 1].width + xBump;
      }
      contextArray = writeCanvases(chr, chrLeft, ideo);
      fillCanvasAnnots(annots, contextArray, ideo);
    }

    writeTrackLabels(ideo);

    if (ideo.onDrawAnnotsCallback) ideo.onDrawAnnotsCallback();
  }

  /**
   * @fileoverview Functions for 2D heatmaps of genome annotations.
   * 2D heatmaps enable showing many (100+) tracks of data in one dimension,
   * for features (e.g. genes) along a dimension of genomic coordinates in
   * chromosome context.
   *
   * TO DO:
   * - Horizontal orientation
   * - Multiple chromosomes
   * - Non-human organisms
   */

  /**
   * Add one canvas that will contain all annotations.  One canvas per chromosome.
   */
  function writeCanvas(chr, ideoHeight, width, ideo) {
    var left, canvas, context, id;

    id = chr.id + '-canvas'; // e.g. chr1-9606-canvas
    left = (ideo.config.chrWidth * 2) + ideo.config.annotationHeight - 0.5;
    canvas = d3.select(ideo.config.container + ' #_ideogramInnerWrap')
      .append('canvas')
      .attr('id', id)
      .attr('width', width)
      .attr('height', ideoHeight)
      .style('position', 'absolute')
      .style('left', left + 'px')
      .style('top', '0px');
    context = canvas.nodes()[0].getContext('2d');

    return context;
  }

  /**
   * Render annotations on the canvas.
   *
   * These annotations are 2D; each annotation has many values, each on a track.
   */
  function fillCanvasAnnotValues(annot, context, ideo) {
    var i, x, values,
      annotHeight = ideo.config.annotationHeight,
      ideoMarginTop = ideo._layout.margin.top;

    values = annot.values;

    // Fill canvas with annotation colors to draw the heatmap
    for (i = 0; i < values.length; i++) {
      context.fillStyle = values[i];
      x = (i - 1) * annotHeight;
      context.fillRect(x, annot.startPx + ideoMarginTop, annotHeight, 2);
    }
  }

  /**
   * Draw a 2D heatmap of annotations along one chromosome.
   *
   * TODO:
   * - Support in 'horizontal' orientation
   * - Support after rotating chromosome on click
   */
  function drawHeatmaps2d(annotContainers, ideo) {
    var annot, context, i, chr,
      container = ideo.config.container,
      ideoMarginTop = ideo._layout.margin.top,
      ideoHeight = ideo.config.chrHeight + ideoMarginTop,
      width = ideo.config.annotationHeight * annotContainers[0].values.length;

    d3.selectAll(container + ' canvas').remove();

    d3.select(container + ' #_ideogramInnerWrap')
      .style('max-width', width + 'px');
    d3.select(container + ' #_ideogram').attr('width', width);

    chr = ideo.chromosomesArray[0];

    context = writeCanvas(chr, ideoHeight, width, ideo);

    // Each "annotationContainer" represents annotations for a chromosome
    for (i = 0; i < annotContainers.length; i++) {
      annot = annotContainers[i];
      fillCanvasAnnotValues(annot, context, ideo);
    }

    if (ideo.onDrawAnnotsCallback) {
      ideo.onDrawAnnotsCallback();
    }
  }

  function add2dAnnotsForChr(annots, omittedAnnots, annotsByChr, chrModel,
    m, keys, ideo) {
    var j, k, annot, ra, stop, stopPx, color,
      thresholds = ideo.config.heatmapThresholds;

    for (j = 0; j < annotsByChr.annots.length; j++) {
      ra = annotsByChr.annots[j];
      annot = {};

      annot.values = []; // one value per track

      for (k = 0; k < 3; k++) {
        annot[keys[k]] = ra[k];
      }

      for (k = 3; k < keys.length; k++) {
        color = getHeatmapAnnotColor(thresholds, ra[k]);
        annot.values.push(color);
      }

      stop = annot.start + annot.length;

      annot.chr = annotsByChr.chr;
      annot.chrIndex = m;
      annot.startPx = ideo.convertBpToPx(chrModel, annot.start);
      stopPx = ideo.convertBpToPx(chrModel, stop);
      annot.px = Math.round((annot.startPx + stopPx) / 2);

      annots.push(annot);
    }

    annots.shift();

    return [annots, omittedAnnots];
  }

  /**
   * @fileoverview Functions for labeling tracks of genome annotations.
   * Tracks are columns of annotations that run beside a chromosome.
   * Labeling tracks with descriptive names makes them easier to understand.
   */

  /**
   * Start a timer that, upon expiring, hides the track label.
   *
   * To enable users to copy label content to their clipboard, a timer is
   * used to control when the label disappears.  It starts when the user's
   * cursor leaves the track or the label.  If the user moves the cursor
   * back over the annot or label after the timer starts and before it expires,
   * then the timer is cleared.
   */
  function startHideTrackLabelTimeout(ideo) {
    if (ideo.config.showTrackLabel === false) return;

    ideo.hideTrackLabelTimeout = window.setTimeout(function() {
      d3.select(ideo.config.container + ' #_ideogramTrackLabel').transition()
        .duration(500)
        .style('opacity', 0);
    }, 250);
  }

  /**
   * Write label div setup with default styling.
   */
  function writeTrackLabelContainer(ideo) {
    d3.select(ideo.config.container + ' #_ideogramTrackLabelContainer')
      .append('div')
      .attr('id', '_ideogramTrackLabel')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('text-align', 'center')
      .style('padding', '1px')
      .style('font', '11px sans-serif')
      .style('background', 'white')
      .style('line-height', '10px')
      .style('z-index', '9000');
  }

  /**
   * Display track labels on the page
   */
  function renderTrackLabels$1(top, left, ideo) {
    d3.select(ideo.config.container + ' #_ideogramTrackLabel')
      .style('opacity', 1) // Make label visible
      .style('left', left + 'px')
      .style('top', top + 'px')
      .style('width', 'max-content')
      .style('transform-origin', 'bottom left')
      .style('text-align', 'left')
      .on('mouseover', function() {
        clearTimeout(ideo.hideTrackLabelTimeout);
      })
      .on('mouseout', function() {
        startHideTrackLabelTimeout(ideo);
      });
  }

  /**
   * Get left and top (x and y) offset for track label text
   */
  function getTrackLabelOffsets(labels, trackCanvas, ideo) {
    var firstTrackId, firstTrack, trackBox, labelBox, ideoBox, left, top,
      marginHack = 7; // TODO: Make this dynamic

    firstTrackId = trackCanvas.id.split('-').slice(0, -1).join('-') + '-0';
    firstTrack = d3.select(ideo.config.container + ' #' + firstTrackId)
      .nodes()[0];
    trackBox = firstTrack.getBoundingClientRect();

    labelBox = d3.select(ideo.config.container + ' #_ideogramTrackLabel')
      .nodes()[0].getBoundingClientRect();
    ideoBox = d3.select(ideo.config.container).nodes()[0]
      .getBoundingClientRect();

    left = Math.round(trackBox.left + labelBox.width) - trackBox.width - 1;
    left -= ideoBox.left - marginHack;
    top = -(labels.split('<br>').length - 2) * trackBox.width + 2;

    return [left, top];
  }

  /**
   * Show the label for this track
   */
  function showTrackLabel(trackCanvas, ideo) {
    var labels, left, top;

    clearTimeout(ideo.hideTrackLabelTimeout);

    labels = getLabels(ideo);
    labels = labels.join('<br>');

    // Clear any previous positioning, write track label text to DOM
    d3.select(ideo.config.container + ' #_ideogramTrackLabel')
      .interrupt() // Stop any in-progress disapperance
      .style('top', '')
      .style('left', '')
      .style('transform', null)
      .style('transform', 'rotate(-90deg)')
      .html(labels);

    [left, top] = getTrackLabelOffsets(labels, trackCanvas, ideo);

    renderTrackLabels$1(top, left, ideo);
  }

  /**
   * @fileoverview Functions for 2D heatmaps of genome annotations.
   * Heatmaps provide an easy way to visualize very dense annotation data.
   * Unlike the rest of Ideogram's graphics, which use SVG, heatmaps are
   * rendered using the Canvas element.
   */

  /**
   * Add canvases that will contain annotations.  One canvas per track.
   */
  function writeCanvases$1(chr, chrLeft, ideoHeight, ideo) {
    var j, trackLeft, trackWidth, canvas, context, id,
      contextArray = [],
      numAnnotTracks = ideo.config.numAnnotTracks;

    var marginHack = 7; // TODO: Make this dynamic

    // Create a canvas for each annotation track on this chromosome
    for (j = 0; j < numAnnotTracks; j++) {
      trackWidth = ideo.config.annotationHeight;
      id = chr.id + '-canvas-' + j; // e.g. chr1-9606-canvas-0
      trackLeft = chrLeft - trackWidth * (numAnnotTracks - j) - marginHack;
      canvas = d3.select(ideo.config.container + ' #_ideogramInnerWrap')
        .append('canvas')
        .attr('id', id)
        .attr('width', trackWidth)
        .attr('height', ideoHeight)
        .style('position', 'absolute')
        .style('left', trackLeft + 'px');
      context = canvas.nodes()[0].getContext('2d');
      contextArray.push(context);
    }

    return contextArray;
  }

  /**
   * Render annotations on the canvas
   */
  function fillCanvasAnnots$1(annots, contextArray, chrWidth, ideoMarginTop) {
    var j, annot, context, x;

    // Fill in the canvas(es) with annotation colors to draw a heatmap
    for (j = 0; j < annots.length; j++) {
      annot = annots[j];
      context = contextArray[annot.trackIndex];
      context.fillStyle = annot.color;
      x = annot.trackIndex - 1;
      context.fillRect(x, annot.startPx + ideoMarginTop, chrWidth, 0.5);
    }
  }

  /**
   * Draw a 1D heatmap of annotations along each chromosome.
   * Ideal for representing very dense annotation sets in a granular manner
   * without subsampling.
   *
   * TODO:
   * - Support in 'horizontal' orientation
   * - Support after rotating chromosome on click
   */
  function drawHeatmaps(annotContainers) {
    var annots, chrLeft, contextArray, chrWidth, i, chr,
      ideo = this,
      config = ideo.config,
      ideoMarginTop = ideo._layout.margin.top,
      ideoHeight = config.chrHeight + ideoMarginTop;

    if (config.geometry === 'collinear') {
      return drawHeatmapsCollinear(annotContainers, ideo);
    } else if (config.annotationsLayout === 'heatmap-2d') {
      return drawHeatmaps2d(annotContainers, ideo);
    }

    d3.selectAll(ideo.config.container + ' canvas').remove();

    writeTrackLabelContainer(ideo);

    // Each "annotationContainer" represents annotations for a chromosome
    for (i = 0; i < annotContainers.length; i++) {

      annots = annotContainers[i].annots;
      chr = ideo.chromosomesArray[i];
      chrWidth = ideo.config.chrWidth;
      chrLeft = ideo._layout.getChromosomeSetYTranslate(i);

      contextArray = writeCanvases$1(chr, chrLeft, ideoHeight, ideo);
      fillCanvasAnnots$1(annots, contextArray, chrWidth, ideoMarginTop);
    }

    d3.selectAll(ideo.config.container + ' canvas')
      .on('mouseover', function() {showTrackLabel(this, ideo);})
      .on('mouseout', function() {startHideTrackLabelTimeout(ideo);});

    if (ideo.onDrawAnnotsCallback) {
      ideo.onDrawAnnotsCallback();
    }
  }

  /**
   * Set color and track index for raw annotation objects.
   */
  function getNewRawAnnots(heatmapKeyIndexes, rawAnnots, ideo) {
    var j, k, ra, newRa, value, thresholds, color, trackIndex,
      newRas = [];

    for (j = 0; j < rawAnnots.length; j++) {
      ra = rawAnnots[j];
      for (k = 0; k < heatmapKeyIndexes.length; k++) {
        newRa = ra.slice(0, 3); // name, start, length

        value = ra[heatmapKeyIndexes[k]];
        thresholds = ideo.config.heatmaps[k].thresholds;
        color = getHeatmapAnnotColor(thresholds, value);

        trackIndex = k;
        newRa.push(trackIndex, color, value);
        newRas.push(newRa);
      }
    }

    return newRas;
  }

  function getNewRawAnnotContainers(heatmapKeyIndexes, rawAnnotBoxes, ideo) {
    var raContainer, chr, rawAnnots, newRas, i,
      newRaContainers = [];

    for (i = 0; i < rawAnnotBoxes.length; i++) {
      raContainer = rawAnnotBoxes[i];
      chr = raContainer.chr;

      rawAnnots = raContainer.annots;
      newRas = getNewRawAnnots(heatmapKeyIndexes, rawAnnots, ideo);

      newRaContainers.push({chr: chr, annots: newRas});
    }
    return newRaContainers;
  }

  function reportPerformance(t0, ideo) {
    var t1 = new Date().getTime();
    if (ideo.config.debug) {
      console.log('Time in deserializeAnnotsForHeatmap: ' + (t1 - t0) + ' ms');
    }
  }

  /**
   * Deserialize compressed annotation data into a format suited for heatmaps.
   *
   * This enables the annotations to be downloaded from a server without the
   * requested annotations JSON needing to explicitly specify track index or
   * color.  The track index and color are inferred from the "heatmaps" Ideogram
   * configuration option defined before ideogram initialization.
   *
   * This saves time for the user.
   *
   * @param rawAnnotsContainer {Object} Raw annotations as passed from server
   */
  function deserializeAnnotsForHeatmap(rawAnnotsContainer) {
    var newRaContainers, heatmapKey, heatmapKeyIndexes, i,
      t0 = new Date().getTime(),
      keys = rawAnnotsContainer.keys,
      rawAnnotBoxes = rawAnnotsContainer.annots,
      ideo = this;

    heatmapKeyIndexes = [];
    for (i = 0; i < ideo.config.heatmaps.length; i++) {
      heatmapKey = ideo.config.heatmaps[i].key;
      heatmapKeyIndexes.push(keys.indexOf(heatmapKey));
    }

    newRaContainers =
      getNewRawAnnotContainers(heatmapKeyIndexes, rawAnnotBoxes, ideo);

    keys.splice(3, 0, 'trackIndex');
    keys.splice(4, 0, 'color');

    ideo.rawAnnots.keys = keys;
    ideo.rawAnnots.annots = newRaContainers;

    reportPerformance(t0, ideo);
  }

  // import {getShapes} from './draw';

  /**
   * Optional callback, invoked when annotations are drawn
   */
  function onLoadAnnots() {
    call(this.onLoadAnnotsCallback);
  }

  /**
   * Optional callback, invoked when annotations are drawn
   */
  function onDrawAnnots() {
    call(this.onDrawAnnotsCallback);
  }

  /**
   * Starts a timer that, upon expiring, hides the annotation tooltip.
   *
   * To enable users to copy tooltip content to their clipboard, a timer is
   * used to control when the tooltip disappears.  It starts when the user's
   * cursor leaves the annotation or the tooltip.  If the user moves the cursor
   * back over the annot or tooltip after the timer starts and before it expires,
   * then the timer is cleared.
   */
  function startHideAnnotTooltipTimeout() {

    if (this.config.showAnnotTooltip === false) {
      return;
    }

    this.hideAnnotTooltipTimeout = window.setTimeout(function() {
      d3.select('._ideogramTooltip').transition()
        .duration(500) // fade out for half second
        .style('opacity', 0)
        .style('pointer-events', 'none');
    }, 250);
  }

  function renderTooltip(tooltip, content, matrix, yOffset, ideo) {
    tooltip.html(content)
      .style('opacity', 1) // Make tooltip visible
      .style('left', matrix.e + 'px')
      .style('top', (matrix.f - yOffset) + 'px')
      .style('font-family', ideo.config.fontFamily)
      .style('pointer-events', null) // Prevent bug in clicking chromosome
      .on('mouseover', function() {
        clearTimeout(ideo.hideAnnotTooltipTimeout);
      })
      .on('mouseout', function() {
        ideo.startHideAnnotTooltipTimeout();
      });
  }

  function getContentAndYOffset(annot) {
    var content, yOffset, range, displayName;

    range = 'chr' + annot.chr + ':' + annot.start.toLocaleString();
    if (annot.length > 0) {
      // Only show range if stop differs from start
      range += '-' + annot.stop.toLocaleString();
    }
    content = range;
    yOffset = 24;

    if (annot.name) {
      displayName = annot.displayName ? annot.displayName : annot.name;
      content = displayName + '<br/>' + content;
      yOffset += 8;
    }

    return [content, yOffset];
  }

  /**
   * Optional callback, invoked before showing annotation tooltip
   */
  function onWillShowAnnotTooltip(annot) {
    call(this.onWillShowAnnotTooltipCallback, annot);
  }

  /**
   * Optional callback, invoked on clicking annotation
   */
  function onClickAnnot(annot) {
    this.onClickAnnotCallback(annot);
  }

  // /** Get list of annotation objects by names, e.g. ["BRCA1", "APOE"] */
  // function getAnnotsByName(annotNames, ideo) {
  //   return annotNames.map(name => getAnnotByName(name, ideo));
  // }

  // /** Briefly show a circle around specified annotations */
  // function pulseAnnots(annotNames, ideo, duration=2000) {
  //   const annots = getAnnotsByName(annotNames, ideo);
  //   const circle = getShapes(ideo.config.annotationHeight + 2).circle;
  //   const ids = annots.map(annot => annot.domId);

  //   d3.selectAll(ids).each(function() {
  //     d3.select('#' + this)
  //       .insert('path', ':first-child')
  //       .attr('class', '_ideogramAnnotPulse')
  //       .attr('d', circle)
  //       .attr('fill-opacity', 0.5)
  //       .attr('fill', 'yellow')
  //       .attr('stroke', 'orange');
  //   });

  //   const annotPulses = d3.selectAll('._ideogramAnnotPulse');
  //   annotPulses.transition()
  //     .duration(duration) // fade out for `duration` milliseconds
  //     .style('opacity', 0)
  //     .style('pointer-events', 'none')
  //     .on('end', function(d, i) {
  //       if (i === annotPulses.size() - 1) {
  //         annotPulses.remove();
  //       }
  //     });
  // }

  // /** Taper hiding of all annotation labels */
  // function fadeOutAnnotLabels() {
  //   const ideo = this;
  //   const annotLabels = d3.selectAll('._ideogramLabel');
  //   const names = Array.from(annotLabels.nodes()).map(d => d.innerText);
  //   annotLabels.transition()
  //     .duration(2000) // fade out for a second
  //     .style('opacity', 0)
  //     .ease(d3.easeExpIn, 4)
  //     .style('pointer-events', 'none')
  //     .on('end', function(d, i) {
  //       if (i === names.length - 1) {
  //         annotLabels.remove();
  //         pulseAnnots(names, ideo);
  //       }
  //     });
  // }

  /**
   * Shows a tooltip for the given annotation.
   *
   * See notes in startHideAnnotTooltipTimeout about show/hide logic.
   *
   * @param annot {Object} Processed annotation object
   * @param context {Object} "This" of the caller -- an SVG path DOM object
   */
  function showAnnotTooltip(annot, context) {
    var matrix, content, yOffset, tooltip,
      cx = Number(context.getAttribute('cx')),
      cy = Number(context.getAttribute('cy')),
      ideo = this;

    if (ideo.config.showAnnotTooltip === false) return;

    clearTimeout(ideo.hideAnnotTooltipTimeout);

    if (ideo.onWillShowAnnotTooltipCallback) {
      annot = ideo.onWillShowAnnotTooltipCallback(annot);
    }

    tooltip = d3.select('._ideogramTooltip');
    tooltip.interrupt(); // Stop any in-progress disapperance

    matrix = context.getScreenCTM().translate(cx, cy);

    [content, yOffset] = getContentAndYOffset(annot);

    renderTooltip(tooltip, content, matrix, yOffset, ideo);
  }

  const allLabelStyle = `
  <style>
    #_ideogram .annot path, ._ideogramLabel {
      cursor: pointer;
    }

    #_ideogram .annot path {
      stroke-width: 1px;
      stroke: white;
      stroke-linejoin: bevel;
    }

    #_ideogram ._ideogramLabel._ideoActive {
      fill: #77F !important;
      stroke: #F0F0FF !important;
    }

    #_ideogram .annot > ._ideoActive {
      stroke: #D0D0DD !important;
      stroke-width: 1.5px;
    }

    #_ideogram ._ideogramLabel {
      stroke: white;
      stroke-width: 5px;
      stroke-linejoin: round;
      paint-order: stroke fill;
      text-align: center;
    }
  </style>
  `;

  /** Return DOM ID of annotation object */
  function getAnnotDomLabelId(annot) {
    return 'ideogramLabel_' + annot.domId;
  }

  function changeAnnotState(state, labelId, annotId) {
    d3.selectAll('._ideoActive').classed('_ideoActive', false);
    d3.select('#' + labelId).attr('class', '_ideogramLabel ' + state);
    d3.select('#' + annotId + ' > path').attr('class', state);
  }

  function triggerAnnotEvent(event, ideo) {
    let labelId, annotId;
    const target = event.target;
    const type = event.type;

    const targetClasses = Array.from(target.classList);
    if (targetClasses.includes('_ideogramLabel')) {
      labelId = target.id;
      annotId = target.id.split('ideogramLabel_')[1];
      d3.select('#' + annotId + ' path').dispatch(type);
    } else {
      const annotElement = target.parentElement;
      labelId = 'ideogramLabel_' + annotElement.id;
      annotId = annotElement.id;
    }

    if (type === 'mouseout') {
      ideo.time.prevTooltipOff = performance.now();
      ideo.time.prevTooltipAnnotDomId = annotId;
    }

    // On mouseover, activate immediately
    // Otherwise, wait a moment (250 ms), then deactivate.
    // Delayed deactivation mitigates flicker when moving from
    // annot label to annot triangle.
    if (type === 'mouseover') {
      clearTimeout(window._ideoActiveTimeout);
      changeAnnotState('_ideoActive', labelId, annotId);
    } else {
      window._ideoActiveTimeout = window.setTimeout(function() {
        changeAnnotState('', labelId, annotId);
      }, 250);
    }
  }

  function renderLabel(annot, style, ideo) {

    if (!ideo.didSetLabelStyle) {
      document.querySelector('#_ideogramInnerWrap')
        .insertAdjacentHTML('afterbegin', allLabelStyle);
      ideo.didSetLabelStyle = true;
    }

    const id = getAnnotDomLabelId(annot);

    const font = getFont(ideo);

    const fill = annot.color === 'pink' ? '#CF406B' : annot.color;

    d3.select('#_ideogram').append('text')
      .attr('id', id)
      .attr('class', '_ideogramLabel')
      .attr('x', style.left)
      .attr('y', style.top)
      .style('font', font)
      .style('fill', fill)
      .style('pointer-events', null) // Prevent bug in clicking chromosome
      .html(annot.name);
  }

  /** Get annotation object by name, e.g. "BRCA1" */
  function getAnnotByName(annotName, ideo) {
    var annot;
    var found = false;
    ideo.annots.forEach((annotsByChr) => {
      if (found) return;
      annotsByChr.annots.forEach((thisAnnot) => {
        if (found) return;
        if (thisAnnot.name === annotName) {
          annot = thisAnnot;
          found = true;
        }
      });
    });

    return annot;
  }

  /** Get label's top and left offsets relative to chromosome, and width */
  function getAnnotLabelLayout(annot, ideo) {
    var annotDom, annotRect, ideoRect, width, height, top, bottom, left, right,
      config = ideo.config;

    annotDom = document.querySelector('#' + annot.domId);

    // Handles cases when annotation is not yet in DOM
    if (annotDom === null) return null;

    annotRect = annotDom.getBoundingClientRect();

    ideoRect =
      document.querySelector('#_ideogram').getBoundingClientRect();

    const textSize = getTextSize(annot.name, ideo);
    width = textSize.width;

    // `pad` is a heuristic that accounts for:
    // 1px left pad, 1px right pad, 1px right border, 1px left border
    // as set in renderLabel
    const pad = (config.fontFamily) ? 9 : 7;
    width += pad;

    const labelSize = config.annotLabelSize ? config.annotLabelSize : 13;
    // console.log('height, labelSize', height, labelSize);

    // Accounts for 1px top border, 1px bottom border as set in renderLabel
    height = labelSize;

    top = annotRect.top - ideoRect.top + height - 1;
    bottom = top + height;
    left = annotRect.left - ideoRect.left - width;
    right = left + width;

    return {top, bottom, right, left, width, height};
  }

  /**
   * Label an annotation.
   *
   * @param annotName {String} Name of annotation, e.g. "BRCA1"
   * @param backgroundColor {String} Background color.  Default: white.
   * @param backgroundColor {String} Border color.  Default: black.
   */
  function addAnnotLabel(annotName, backgroundColor, borderColor) {
    var annot,
      ideo = this;

    annot = getAnnotByName(annotName, ideo);

    const layout = getAnnotLabelLayout(annot, ideo);
    if (layout === null) return;

    const style = Object.assign(layout, {backgroundColor, borderColor});

    renderLabel(annot, style, ideo);
  }

  /** Label as many annotations as possible, without overlap */
  function fillAnnotLabels(sortedAnnots=[]) {
    const ideo = this;

    sortedAnnots = sortedAnnots.slice(); // copy by value

    // Remove any pre-existing annotation labels, to avoid duplicates
    ideo.clearAnnotLabels();

    const spacedAnnots = [];
    const spacedLayouts = [];

    if (sortedAnnots.length === 0) {
      sortedAnnots = ideo.flattenAnnots();
    }

    sortedAnnots.forEach((annot, i) => {
      const layout = getAnnotLabelLayout(annot, ideo);

      if (layout === null) return;

      const hasOverlap =
        spacedLayouts.length > 1 && spacedLayouts.some((sl, j) => {

          const xOverlap = sl.left <= layout.right && sl.right >= layout.left;
          const yOverlap =
            (
              sl.top < layout.bottom && sl.bottom > layout.top ||
              layout.top < sl.bottom && layout.bottom > sl.bottom
            );

          // if (annot.name === 'TP73') {
          //   const spacedAnnot = spacedAnnots[j].name;
          //   console.log(
          //     'xOverlap, yOverlap, annot.name, layout, spacedAnnot, sl'
          //   );
          //   console.log(
          //     xOverlap, yOverlap, annot.name, layout, spacedAnnot, sl
          //   );
          // }

          return xOverlap && yOverlap;
        });

      if (hasOverlap) return;

      spacedAnnots.push(annot);
      spacedLayouts.push(layout);
    });

    // Ensure highest-ranked annots are ordered last in SVG,
    // to ensure the are written before lower-ranked annots
    // (which, due to SVG z-index being tied to layering)
    spacedAnnots.reverse();

    spacedAnnots.forEach((annot) => {
      ideo.addAnnotLabel(annot.name);
    });

    d3.selectAll('._ideogramLabel, .annot')
      .on('mouseover', (event) => triggerAnnotEvent(event))
      .on('mouseout', (event) => triggerAnnotEvent(event, ideo))
      .on('click', (event) => triggerAnnotEvent(event));
  }

  function removeAnnotLabel(annotName) {
    const ideo = this;
    const annot = getAnnotByName(annotName, ideo);
    const id = getAnnotDomLabelId(annot);
    document.querySelector('#' + id).remove();
  }

  function clearAnnotLabels() {
    const labels = document.querySelectorAll('._ideogramLabel');
    labels.forEach((label) => {label.remove();});
  }

  /**
   * Get containers to group individual annotations into higher-level "bar"
   * annotations.
   */
  function getRawBars(chrModels, ideo) {
    var chr, chrModel, lastBand, numBins, bar, h, i, px,
      barWidth = ideo.config.barWidth,
      bars = [];

    for (h = 0; h < ideo.chromosomesArray.length; h++) {
      chr = ideo.chromosomesArray[h].name;
      chrModel = chrModels[chr];
      lastBand = chrModel.bands[chrModel.bands.length - 1];
      numBins = Math.round(lastBand.px.stop / barWidth); // chrPxStop / barWidth
      bar = {chr: chr, annots: []};

      for (i = 0; i < numBins; i++) {
        px = i * barWidth - ideo.bump;
        bar.annots.push({
          bp: ideo.convertPxToBp(chrModel, px + ideo.bump),
          px: px,
          count: 0,
          chrIndex: chrModel.chrIndex,
          chrName: chr,
          color: ideo.config.annotationsColor,
          annots: []
        });
      }
      bars.push(bar);
    }
    return bars;
  }

  /**
   * Assign how many, and which annotations each histogram bar contains
   */
  function assignAnnotsToBars(annots, bars, chrModels, ideo) {
    var chrAnnots, chrModel, barAnnots, h, i, annot, px, j, barPx, nextBarPx,
      barWidth = ideo.config.barWidth;

    for (h = 0; h < annots.length; h++) {
      chrAnnots = annots[h].annots;
      chrModel = chrModels[annots[h].chr]; // get chr by name
      barAnnots = bars[chrModel.chrIndex].annots;
      for (i = 0; i < chrAnnots.length; i++) {
        annot = chrAnnots[i];
        px = annot.px - ideo.bump;
        for (j = 0; j < barAnnots.length; j++) {
          barPx = barAnnots[j].px;
          nextBarPx = barPx + barWidth;
          if (j === barAnnots.length - 1) nextBarPx += barWidth;
          if (px >= barPx && px < nextBarPx) {
            bars[chrModel.chrIndex].annots[j].count += 1;
            bars[chrModel.chrIndex].annots[j].annots.push(annot);
            break;
          }
        }
      }
    }
    return bars;
  }

  function setIdeoMaxAnnotsPerBar(bars, isFirstGet, ideo) {
    var maxAnnotsPerBarAllChrs, i, maxAnnotsPerBar, annots, chr, j, barCount;

    if (isFirstGet || ideo.config.histogramScaling === 'relative') {
      maxAnnotsPerBarAllChrs = 0;
      for (i = 0; i < bars.length; i++) {
        maxAnnotsPerBar = 0;
        annots = bars[i].annots;
        chr = bars[i].chr;
        for (j = 0; j < annots.length; j++) {
          barCount = annots[j].count;
          if (barCount > maxAnnotsPerBar) maxAnnotsPerBar = barCount;
          if (barCount > maxAnnotsPerBarAllChrs) {
            maxAnnotsPerBarAllChrs = barCount;
          }
        }
        ideo.maxAnnotsPerBar[chr] = maxAnnotsPerBar;
      }
      ideo.maxAnnotsPerBarAllChrs = maxAnnotsPerBarAllChrs;
    }
  }

  /**
   * Set each bar's height to be proportional to the height of the bar with the
   * most annotations
   */
  function setProportionalBarHeight(bars, ideo) {
    var i, annots, chr, j, barCount, barCountRatio, height,
      ideoIsRotated = ideo._layout._isRotated;

    for (i = 0; i < bars.length; i++) {
      annots = bars[i].annots;
      chr = bars[i].chr;
      for (j = 0; j < annots.length; j++) {
        barCount = annots[j].count;
        if (ideo.config.histogramScaling === 'relative') {
          barCountRatio = barCount / ideo.maxAnnotsPerBar[chr];
        } else {
          barCountRatio = barCount / ideo.maxAnnotsPerBarAllChrs;
        }
        if (ideoIsRotated === false) {
          height = barCountRatio * ideo.config.chrMargin;
        } else {
          height = barCountRatio * ideo.config.chrHeightOriginal * 3;
        }
        if (isNaN(height)) {
          height = 0;
        }
        bars[i].annots[j].height = height;
      }
    }
    return bars;
  }

  function reportGetHistogramBarPerformance(t0, ideo) {
    var t1 = new Date().getTime();
    if (ideo.config.debug) {
      console.log('Time spent in getHistogramBars: ' + (t1 - t0) + ' ms');
    }
  }

  function setIdeoHistogramScaling(ideo) {
    if ('histogramScaling' in ideo.config === false) {
      ideo.config.histogramScaling = 'absolute';
    }
  }

  /**
   * Returns and sets bars used for histogram
   */
  function getHistogramBars(annots) {
    var chrModels, bars,
      isFirstGet = false,
      t0 = new Date().getTime(),
      ideo = this;

    chrModels = ideo.chromosomes[ideo.config.taxid];

    setIdeoHistogramScaling(ideo);

    if (typeof ideo.maxAnnotsPerBar === 'undefined') {
      ideo.maxAnnotsPerBar = {};
      isFirstGet = true;
    }

    bars = getRawBars(chrModels, ideo);
    bars = assignAnnotsToBars(annots, bars, chrModels, ideo);

    setIdeoMaxAnnotsPerBar(bars, isFirstGet, ideo);
    bars = setProportionalBarHeight(bars, ideo);

    reportGetHistogramBarPerformance(t0, ideo);
    ideo.bars = bars;
    return bars;
  }

  function getHistogramPoints(d, chrWidth, chrWidths, ideo) {
    var x1, x2, y1, y2;

    x1 = d.px + ideo.bump;
    x2 = d.px + ideo.config.barWidth + ideo.bump;
    y1 = chrWidth;
    y2 = chrWidth + d.height;

    var thisChrWidth = chrWidths[d.chr];

    if (x2 > thisChrWidth) {
      x2 = thisChrWidth;
    }

    return (
      x1 + ',' + y1 + ' ' +
      x2 + ',' + y1 + ' ' +
      x2 + ',' + y2 + ' ' +
      x1 + ',' + y2
    );
  }

  function writeHistogramAnnots(chrAnnot, ideo) {
    var chrs, chr,
      chrWidths = {},
      chrWidth = ideo.config.chrWidth;

    chrs = ideo.chromosomes[ideo.config.taxid];
    for (chr in chrs) {
      chrWidths[chr] = chrs[chr];
    }

    chrAnnot.append('polygon')
      // .attr('id', function(d, i) { return d.id; })
      .attr('class', 'annot')
      .attr('points', function(d) {
        return getHistogramPoints(d, chrWidth, chrWidths, ideo);
      })
      .attr('fill', function(d) {return d.color;});
  }

  /**
   * @fileoverview Functions for drawing a legend for genome annotations.
   * A legend consists of rows, each with a colored icon and a text label.
   * Icons may have different shapes.  A legend may also have a name.
   */

  var legendStyle =
    '#_ideogramLegend {font: 12px Arial; overflow: auto;} ' +
    '#_ideogramLegend svg {float: left;} ' +
    '#_ideogramLegend ul {' +
      'position: relative; left: -14px; list-style: none; float: left; ' +
      'padding-left: 10px; margin: 0 0 1em 0; width: auto; border: none;' +
    '} ' +
    '#_ideogramLegend li {float: none; margin: 0;}' +
    '#_ideogramLegend ul span {position: relative; left: -15px;} ';

  function getIcon(row, ideo) {
    var icon, triangleAttrs, circleAttrs, rectAttrs,
      fill = 'fill="' + row.color + '" style="stroke: #AAA;"',
      shape = row.shape;

    triangleAttrs = 'd="m7,3 l -5 9 l 9 0 z"';
    circleAttrs = 'd="m2,9a 4.5,4.5 0 1,0 9,0a 4.5,4.5 0 1,0 -9,0"';
    rectAttrs = 'height="10" width="10"  y="3"';

    if ('shape' in row && ['circle', 'triangle'].includes(shape)) {
      if (shape === 'circle') {
        icon = '<path ' + circleAttrs + ' ' + fill + '></path>';
      } else if (shape === 'triangle') {
        var transform = '';
        if (ideo.config.orientation === 'vertical') {
          // Orient arrows in legend as they are in annotations
          transform = ' transform="rotate(90, 7, 7)"';
        }
        icon = '<path ' + triangleAttrs + transform + ' ' + fill + '></path>';
      }
    } else {
      icon = '<rect ' + rectAttrs + ' ' + fill + '/>';
    }

    return icon;
  }

  function getListItems(labels, svg, list, nameHeight, ideo) {
    var i, icon, y, row,
      lineHeight = getLineHeight(ideo);

    for (i = 0; i < list.rows.length; i++) {
      row = list.rows[i];
      labels += '<li>' + row.name + '</li>';
      y = lineHeight * (i - 1) + nameHeight + 1;
      if ('name' in list) y += lineHeight;
      icon = getIcon(row, ideo);
      const transform = 'translate(0, ' + y + ')';
      svg += '<g transform="' + transform + '">' + icon + '</g>';
    }

    return [labels, svg];
  }

  function getLineHeight(ideo) {
    return round(getTextSize('A', ideo).height) * 2 + 0.5;
  }

  /**
   * Display a legend for genome annotations, using `legend` configuration option
   */
  function writeLegend(ideo) {
    var i, legend, svg, labels, list, content,
      config = ideo.config,
      lineHeight = getLineHeight(ideo);

    d3.select(config.container + ' #_ideogramLegend').remove();

    legend = config.legend;
    content = '';

    for (i = 0; i < legend.length; i++) {
      list = legend[i];
      const nameHeight = list.nameHeight ? list.nameHeight : 0;
      const heightCss = (nameHeight) ? ` style="height: ${nameHeight}px;"` : '';
      if ('name' in list) {
        labels = `<div${heightCss}>` + list.name + `</div>`;
      }
      svg = '<svg id="_ideogramLegendSvg" width="' + lineHeight + '">';
      [labels, svg] = getListItems(labels, svg, list, nameHeight, ideo);
      svg += '</svg>';
      content += svg + '<ul>' + labels + '</ul>';
    }

    var fontFamily = `font-family: ${config.fontFamily};`;
    var lineHeightCss = `line-height: ${getLineHeight(ideo)}px;`;
    legendStyle +=
      `#_ideogramLegend {${fontFamily} ${lineHeightCss}}`;

    var target = d3.select(config.container + ' #_ideogramOuterWrap');
    target.append('style').html(legendStyle);
    target.append('div').attr('id', '_ideogramLegend').html(content);
  }

  function parseFriendlyAnnots(friendlyAnnots, rawAnnots) {
    var i, j, annot, rawAnnot;

    for (i = 0; i < friendlyAnnots.length; i++) {
      annot = friendlyAnnots[i];

      for (j = 0; j < rawAnnots.length; j++) {
        if (annot.chr === rawAnnots[j].chr) {
          rawAnnot = [
            annot.name,
            annot.start,
            annot.stop - annot.start
          ];
          if ('color' in annot) rawAnnot.push(annot.color);
          if ('shape' in annot) rawAnnot.push(annot.shape);
          rawAnnots[j].annots.push(rawAnnot);
          break;
        }
      }
    }

    return rawAnnots;
  }

  function parseFriendlyKeys(friendlyAnnots) {
    var keys = ['name', 'start', 'length'];
    if ('color' in friendlyAnnots[0]) {
      keys.push('color');
    }
    if ('shape' in friendlyAnnots[0]) {
      keys.push('shape');
    }
    return keys;
  }

  /**
   * Draws annotations defined by user
   */
  function drawAnnots(friendlyAnnots) {
    var keys, chr,
      rawAnnots = [],
      ideo = this,
      chrs = ideo.chromosomes[ideo.config.taxid]; // TODO: multiorganism

    if (
      'annots' in friendlyAnnots[0] || // When filtering
      'values' in friendlyAnnots[0] // When drawing cached expression matrices
    ) {
      return ideo.drawProcessedAnnots(friendlyAnnots);
    }

    for (chr in chrs) {
      rawAnnots.push({chr: chr, annots: []});
    }
    rawAnnots = parseFriendlyAnnots(friendlyAnnots, rawAnnots);

    keys = parseFriendlyKeys(friendlyAnnots);

    ideo.rawAnnots = {keys: keys, annots: rawAnnots};
    ideo.annots = ideo.processAnnotData(ideo.rawAnnots);

    ideo.drawProcessedAnnots(ideo.annots);
  }

  function getShapes(annotHeight) {
    var triangle, circle, rectangle, r;

    triangle =
      'm0,0 l -' + annotHeight + ' ' + (2 * annotHeight) +
      ' l ' + (2 * annotHeight) + ' 0 z';

    // From http://stackoverflow.com/a/10477334, with a minor change ("m -r, r")
    // Circles are supported natively via <circle>, but having it as a path
    // simplifies handling triangles, circles and other shapes in the same
    // D3 call
    r = annotHeight;
    circle =
      'm -' + r + ', ' + r +
      'a ' + r + ',' + r + ' 0 1,0 ' + (r * 2) + ',0' +
      'a ' + r + ',' + r + ' 0 1,0 -' + (r * 2) + ',0';

    rectangle =
      'm0,0 l 0 ' + (2 * annotHeight) +
      'l ' + annotHeight + ' 0' +
      'l 0 -' + (2 * annotHeight) + 'z';

    return {triangle: triangle, circle: circle, rectangle: rectangle};
  }

  function getChrAnnotNodes(filledAnnots, ideo) {
    return d3.selectAll(ideo.selector + ' .chromosome')
      .data(filledAnnots)
      .selectAll('path.annot')
      .data(function(d) {
        return d.annots;
      })
      .enter();
  }

  function determineShape(d, shapes) {
    if (!d.shape || d.shape === 'triangle') {
      return shapes.triangle;
    } else if (d.shape === 'circle') {
      return shapes.circle;
    } else if (d.shape === 'rectangle') {
      return shapes.rectangle;
    } else {
      return d.shape;
    }
  }

  function writeTrackAnnots(chrAnnot, ideo) {
    var shapes,
      annotHeight = ideo.config.annotationHeight;

    shapes = getShapes(annotHeight);

    chrAnnot.append('g')
      .attr('id', function(d) {return d.domId;})
      .attr('class', 'annot')
      .attr('transform', function(d) {
        var y = ideo.config.chrWidth + (d.trackIndex * annotHeight * 2);
        return 'translate(' + d.px + ',' + y + ')';
      })
      .append('path')
      .attr('d', function(d) {return determineShape(d, shapes);})
      .attr('fill', function(d) {return d.color;})
      .on('mouseover', function(event, d) {ideo.showAnnotTooltip(d, this);})
      .on('mouseout', function() {ideo.startHideAnnotTooltipTimeout();})
      .on('click', function(event, d) {ideo.onClickAnnot(d);});
  }

  /**
   * Overlaid annotations appear directly on chromosomes
   */
  function writeOverlayAnnots(chrAnnot, ideo) {
    chrAnnot.append('polygon')
      .attr('id', function(d) {return d.id;})
      .attr('class', 'annot')
      .attr('points', function(d) {
        var x1, x2,
          chrWidth = ideo.config.chrWidth;

        if (d.stopPx - d.startPx > 1) {
          x1 = d.startPx;
          x2 = d.stopPx;
        } else {
          x1 = d.px - 0.5;
          x2 = d.px + 0.5;
        }

        return (
          x1 + ',' + chrWidth + ' ' + x2 + ',' + chrWidth + ' ' +
          x2 + ',0 ' + x1 + ',0'
        );
      })
      .attr('fill', function(d) {return d.color;})
      .on('mouseover', function(event, d) {ideo.showAnnotTooltip(d, this);})
      .on('mouseout', function() {ideo.startHideAnnotTooltipTimeout();});
  }

  function warnIfTooManyAnnots(layout, annots) {
    var i, numAnnots;

    if (!/heatmap/.test(layout) && layout !== 'histogram') {
      numAnnots = 0;
      for (i = 0; i < annots.length; i++) {
        numAnnots += annots[i].annots.length;
      }
      if (numAnnots > 2000) {
        console.warn(
          'Rendering more than 2000 annotations in Ideogram?\n' +
          'Try setting "annotationsLayout" to "heatmap" or "histogram" in your ' +
          'Ideogram configuration object for better layout and performance.'
        );
      }
    }
  }

  function drawAnnotsByLayoutType(layout, annots, ideo) {
    var filledAnnots, chrAnnot;

    warnIfTooManyAnnots(layout, annots);

    if (layout === 'histogram') annots = ideo.getHistogramBars(annots);

    filledAnnots = ideo.fillAnnots(annots);

    chrAnnot = getChrAnnotNodes(filledAnnots, ideo);

    if (layout === 'tracks') {
      writeTrackAnnots(chrAnnot, ideo);
    } else if (layout === 'overlay') {
      writeOverlayAnnots(chrAnnot, ideo);
    } else if (layout === 'histogram') {
      writeHistogramAnnots(chrAnnot, ideo);
    }
  }

  /**
   * Draws genome annotations on chromosomes.
   * Annotations can be rendered as either overlaid directly
   * on a chromosome, or along one or more "tracks"
   * running parallel to each chromosome.
   */
  function drawProcessedAnnots(annots) {
    var layout,
      ideo = this;

    d3.selectAll(ideo.selector + ' .annot').remove();

    layout = 'tracks';
    if (ideo.config.annotationsLayout) layout = ideo.config.annotationsLayout;

    if ('legend' in ideo.config) writeLegend(ideo);

    if (/heatmap/.test(layout)) {
      ideo.drawHeatmaps(annots);
      return;
    }

    drawAnnotsByLayoutType(layout, annots, ideo);
    if (ideo.onDrawAnnotsCallback) ideo.onDrawAnnotsCallback();
  }

  function writeSyntenicRegion(syntenies, regionID, ideo) {
    return syntenies.append('g')
      .attr('class', 'syntenicRegion')
      .attr('id', regionID)
      .on('click', function() {
        var activeRegion = this;
        var others = d3.selectAll(ideo.selector + ' .syntenicRegion')
          .filter(function() {return (this !== activeRegion);});

        others.classed('hidden', !others.classed('hidden'));
      })
      .on('mouseover', function() {
        var activeRegion = this;
        d3.selectAll(ideo.selector + ' .syntenicRegion')
          .filter(function() {return (this !== activeRegion);})
          .classed('ghost', true);
      })
      .on('mouseout', function() {
        d3.selectAll(ideo.selector + ' .syntenicRegion')
          .classed('ghost', false);
      });
  }

  function writeSyntenicRegionPolygons(
    syntenicRegion, x1, x2, r1, r2, regions
  ) {
    var color, opacity;

    color = ('color' in regions) ? regions.color : '#CFC';
    opacity = ('opacity' in regions) ? regions.opacity : 1;

    syntenicRegion.append('polygon')
      .attr('points',
        x1 + ', ' + r1.startPx + ' ' +
        x1 + ', ' + r1.stopPx + ' ' +
        x2 + ', ' + r2.stopPx + ' ' +
        x2 + ', ' + r2.startPx
      )
      .style('fill', color)
      .style('fill-opacity', opacity);
  }

  function writeSyntenicRegionPolygonsHorizontal(
    syntenicRegion, y1, y2, r1, r2, regions
  ) {
    var color, opacity;

    color = ('color' in regions) ? regions.color : '#CFC';
    opacity = ('opacity' in regions) ? regions.opacity : 1;

    syntenicRegion.append('polygon')
      .attr('points',
        (r1.startPx - 15) + ', ' + y1 + ' ' +
        (r1.stopPx - 15) + ', ' + y1 + ' ' +
        (r2.stopPx - 15) + ', ' + y2 + ' ' +
        (r2.startPx - 15) + ', ' + y2
      )
      .style('fill', color)
      .style('fill-opacity', opacity);
  }

  function getRegionsR1AndR2(regions, ideo, xOffset = null) {
    var r1, r2,
      r1Offset, r2Offset;

    r1 = regions.r1;
    r2 = regions.r2;

    if (typeof r1.chr === 'string') {
      const taxids = ideo.config.taxids;
      if (ideo.config.multiorganism) {
        r1.chr = ideo.chromosomes[taxids[0]][r1.chr];
        r2.chr = ideo.chromosomes[taxids[1]][r2.chr];
      } else {
        r1.chr = ideo.chromosomes[taxids[0]][r1.chr];
        r2.chr = ideo.chromosomes[taxids[0]][r2.chr];
      }
    }

    var r1ChrDom = document.querySelector('#' + r1.chr.id + '-chromosome-set');
    var r1GenomeHorizontalXOffset = r1ChrDom.getCTM().e;
    var r1GenomeVerticalXOffset = r1ChrDom.getCTM().f;
    var r2ChrDom = document.querySelector('#' + r2.chr.id + '-chromosome-set');
    // var r2GenomeOffset = r2ChrDom.getBoundingClientRect().top;
    var r2GenomeHorizontalXOffset = r2ChrDom.getCTM().e;
    var r2GenomeVerticalXOffset = r2ChrDom.getCTM().f;

    if (xOffset === null) {
      if (ideo.config.orientation === 'vertical') {
        // When vertical collinear
        // http://localhost:8080/examples/vanilla/compare-whole-genomes?chromosome-scale=absolute&orientation=vertical
        r1Offset = r1GenomeVerticalXOffset - 12;
        r2Offset = r2GenomeVerticalXOffset - 12;
      } else {
        // When horizontal collinear, e.g.
        // http://localhost:8080/examples/vanilla/compare-whole-genomes?chromosome-scale=absolute&orientation=horizontal
        r1Offset = r1GenomeHorizontalXOffset;
        r2Offset = r2GenomeHorizontalXOffset;
      }
    } else {
      // When horizontal parallel
      r1Offset = xOffset;
      r2Offset = xOffset;
    }

    r1.startPx = ideo.convertBpToPx(r1.chr, r1.start) + r1Offset;
    r1.stopPx = ideo.convertBpToPx(r1.chr, r1.stop) + r1Offset;
    r2.startPx = ideo.convertBpToPx(r2.chr, r2.start) + r2Offset;
    r2.stopPx = ideo.convertBpToPx(r2.chr, r2.stop) + r2Offset;

    return [r1, r2];
  }

  function writeSyntenicRegionLines(syntenicRegion, x1, x2, r1, r2) {
    syntenicRegion.append('line')
      .attr('class', 'syntenyBorder')
      .attr('x1', x1)
      .attr('x2', x2)
      .attr('y1', r1.startPx)
      .attr('y2', r2.startPx);

    syntenicRegion.append('line')
      .attr('class', 'syntenyBorder')
      .attr('x1', x1)
      .attr('x2', x2)
      .attr('y1', r1.stopPx)
      .attr('y2', r2.stopPx);
  }

  function writeSyntenicRegions(syntenicRegions, syntenies, ideo) {
    var i, regions, r1, r2, regionID, syntenicRegion, chrWidth, x1, x2;

    for (i = 0; i < syntenicRegions.length; i++) {
      regions = syntenicRegions[i];

      [r1, r2] = getRegionsR1AndR2(regions, ideo);

      regionID = (
        r1.chr.id + '_' + r1.start + '_' + r1.stop + '_' +
        '__' +
        r2.chr.id + '_' + r2.start + '_' + r2.stop
      );

      syntenicRegion = writeSyntenicRegion(syntenies, regionID, ideo);

      chrWidth = ideo.config.chrWidth;
      x1 = chrWidth + 46;
      x2 = chrWidth + 240; // Genomes are spaced ~200 pixels apart

      writeSyntenicRegionPolygons(syntenicRegion, x1, x2, r1, r2, regions);
      writeSyntenicRegionLines(syntenicRegion, x1, x2, r1, r2);
    }
  }

  function reportPerformance$1(t0, ideo) {
    var t1 = new Date().getTime();
    if (ideo.config.debug) {
      console.log('Time in drawSyntenicRegions: ' + (t1 - t0) + ' ms');
    }
  }

  /**
   * Draws a trapezoid connecting a genomic range on
   * one chromosome to a genomic range on another chromosome;
   * a syntenic region.
   */
  function drawSyntenyCollinear(syntenicRegions, ideo) {
    var syntenies,
      t0 = new Date().getTime();

    syntenies = d3.select(ideo.selector)
      .insert('g', ':first-child')
      .attr('class', 'synteny');

    writeSyntenicRegions(syntenicRegions, syntenies, ideo);

    reportPerformance$1(t0, ideo);
  }

  function writeSyntenicRegionLines$1(syntenicRegion, y1, y2, r1, r2) {
    syntenicRegion.append('line')
      .attr('class', 'syntenyBorder')
      .attr('x1', r1.startPx - 15)
      .attr('x2', r2.startPx - 15)
      .attr('y1', y1)
      .attr('y2', y2);

    syntenicRegion.append('line')
      .attr('class', 'syntenyBorder')
      .attr('x1', r1.stopPx - 15)
      .attr('x2', r2.stopPx - 15)
      .attr('y1', y1)
      .attr('y2', y2);
  }

  function writeSyntenicRegions$1(syntenicRegions, syntenies, ideo) {
    var i, regions, r1, r2, regionID, syntenicRegion, chrWidth, y1, y2;

    for (i = 0; i < syntenicRegions.length; i++) {
      regions = syntenicRegions[i];

      [r1, r2] = getRegionsR1AndR2(regions, ideo);

      regionID = (
        r1.chr.id + '_' + r1.start + '_' + r1.stop + '_' +
        '__' +
        r2.chr.id + '_' + r2.start + '_' + r2.stop
      );

      syntenicRegion = writeSyntenicRegion(syntenies, regionID, ideo);

      chrWidth = ideo.config.chrWidth;
      y1 = chrWidth + 31;
      y2 = chrWidth + 191; // Genomes are spaced ~200 pixels apart

      writeSyntenicRegionPolygonsHorizontal(
        syntenicRegion, y1, y2, r1, r2, regions
      );
      writeSyntenicRegionLines$1(syntenicRegion, y1, y2, r1, r2);
    }
  }

  function reportPerformance$2(t0, ideo) {
    var t1 = new Date().getTime();
    if (ideo.config.debug) {
      console.log('Time in drawSyntenicRegions: ' + (t1 - t0) + ' ms');
    }
  }

  /**
   * Draws a trapezoid connecting a genomic range on
   * one chromosome to a genomic range on another chromosome;
   * a syntenic region.
   */
  function drawSyntenyCollinearHorizontal(syntenicRegions, ideo) {
    var syntenies,
      t0 = new Date().getTime();

    syntenies = d3.select(ideo.selector)
      .insert('g', ':first-child')
      .attr('class', 'synteny');

    writeSyntenicRegions$1(syntenicRegions, syntenies, ideo);

    reportPerformance$2(t0, ideo);
  }

  function writeSyntenicRegionLines$2(syntenicRegion, x1, x2, r1, r2, regions) {

    var stroke, width;
    if (
      Math.abs(r1.startPx - r1.startPx) < 2 &&
      Math.abs(r1.stopPx - r1.stopPx) < 2
    ) {
      stroke = regions.color;
      width = regions.width;
    } else {
      stroke = '';
      width = '';
    }

    syntenicRegion.append('line')
      .attr('class', 'syntenyBorder')
      .attr('x1', x1)
      .attr('x2', x2)
      .attr('y1', r1.startPx)
      .attr('y2', r2.startPx)
      .style('stroke', stroke)
      .style('stroke-width', width);

    syntenicRegion.append('line')
      .attr('class', 'syntenyBorder')
      .attr('x1', x1)
      .attr('x2', x2)
      .attr('y1', r1.stopPx)
      .attr('y2', r2.stopPx)
      .style('stroke', stroke)
      .style('stroke-width', stroke);
  }

  function writeSyntenicRegionLabels(syntenicRegion, x1, x2, r1, r2, regionId) {
    var rangeIds = regionId.split('__').map(d => 'label_' + d);
    if ('name' in r1) {
      syntenicRegion.append('text')
        .attr('id', rangeIds[0])
        .attr('y', r1.startPx + 3)
        .text(r1.name);
      var r1Width =
        document.querySelector('#' + rangeIds[0]).getBoundingClientRect().width;
      d3.select('#' + rangeIds[0]).attr('x', x1 - 15 - r1Width);
    }
    if ('name' in r2) {
      syntenicRegion.append('text')
        .attr('id', rangeIds[1])
        .text(r2.name)
        .attr('x', x2 + 15)
        .attr('y', r2.startPx + 3)
        .text(r2.name);
    }
  }

  function writeSyntenicRegions$2(syntenicRegions, syntenies, xOffset, ideo) {
    var i, regions, r1, r2, regionID, syntenicRegion, chrWidth, x1, x2;

    for (i = 0; i < syntenicRegions.length; i++) {
      regions = syntenicRegions[i];

      [r1, r2] = getRegionsR1AndR2(regions, ideo, xOffset);

      regionID = (
        r1.chr.id + '_' + r1.start + '_' + r1.stop + '_' +
        '__' +
        r2.chr.id + '_' + r2.start + '_' + r2.stop
      );

      syntenicRegion = writeSyntenicRegion(syntenies, regionID, ideo);

      chrWidth = ideo.config.chrWidth;
      x1 = ideo._layout.getChromosomeSetYTranslate(0);
      x2 = ideo._layout.getChromosomeSetYTranslate(1) - chrWidth;

      writeSyntenicRegionPolygons(syntenicRegion, x1, x2, r1, r2, regions);
      writeSyntenicRegionLines$2(syntenicRegion, x1, x2, r1, r2, regions);
      writeSyntenicRegionLabels(syntenicRegion, x1, x2, r1, r2, regionID);
    }
  }

  function reportPerformance$3(t0, ideo) {
    var t1 = new Date().getTime();
    if (ideo.config.debug) {
      console.log('Time in drawSyntenicRegions: ' + (t1 - t0) + ' ms');
    }
  }

  /**
   * Draws a trapezoid connecting a genomic range on
   * one chromosome to a genomic range on another chromosome;
   * a syntenic region.
   */
  function drawSynteny(syntenicRegions) {
    var syntenies, xOffset,
      t0 = new Date().getTime(),
      ideo = this,
      config = ideo.config;

    if (
      config.multiorganism &&
      config.geometry === 'collinear'
    ) {
      if (config.orientation === 'vertical') {
        return drawSyntenyCollinear(syntenicRegions, ideo);
      } else {
        return drawSyntenyCollinearHorizontal(syntenicRegions, ideo);
      }
    }

    syntenies = d3.select(ideo.selector)
      .insert('g', ':first-child')
      .attr('class', 'synteny');

    xOffset = ideo._layout.margin.left;

    writeSyntenicRegions$2(syntenicRegions, syntenies, xOffset, ideo);

    reportPerformance$3(t0, ideo);
  }

  /**
   * Reset displayed tracks to those originally displayed
   */
  function restoreDefaultTracks() {
    var ideo = this;
    ideo.config.numAnnotTracks = ideo.config.annotationsNumTracks;
    d3.selectAll(ideo.selector + ' .annot').remove();
    ideo.drawAnnots(ideo.processAnnotData(ideo.rawAnnots));
  }

  function getDisplayedRawAnnotsByChr(annotsByChr, trackIndexes) {
    var annot, displayedRawAnnotsByChr, annots, i, displayedAnnots, j,
      trackIndex;

    displayedRawAnnotsByChr = [];

    // Filter displayed tracks by selected track indexes
    for (i = 0; i < annotsByChr.length; i++) {
      annots = annotsByChr[i];
      displayedAnnots = [];
      for (j = 0; j < annots.annots.length; j++) {
        annot = annots.annots[j].slice(); // copy array by value
        trackIndex = annot[3] + 1;
        if (trackIndexes.includes(trackIndex)) {
          annot[3] = trackIndexes.indexOf(trackIndex);
          displayedAnnots.push(annot);
        }
      }
      displayedRawAnnotsByChr.push({chr: annots.chr, annots: displayedAnnots});
    }

    return displayedRawAnnotsByChr;
  }

  /**
   * Adds or removes tracks from the displayed list of tracks.
   * Only works when raw annotations are dense.
   *
   * @param trackIndexes Array of indexes of tracks to display
   */
  function updateDisplayedTracks(trackIndexes) {
    var displayedRawAnnotsByChr, displayedAnnots, rawAnnots,
      ideo = this,
      annotsByChr = ideo.rawAnnots.annots;

    ideo.config.numAnnotTracks = trackIndexes.length;

    displayedRawAnnotsByChr =
      getDisplayedRawAnnotsByChr(annotsByChr, trackIndexes);
    rawAnnots = {keys: ideo.rawAnnots.keys, annots: displayedRawAnnotsByChr};

    if (ideo.config.geometry === 'collinear') {
      collinearizeChromosomes(ideo);
    }

    displayedAnnots = ideo.processAnnotData(rawAnnots);

    d3.selectAll(ideo.selector + ' .annot').remove();
    ideo.displayedTrackIndexes = trackIndexes;
    ideo.drawAnnots(displayedAnnots);

    return displayedAnnots;
  }

  function getSetAnnotsByChr(annotsByChr, ideo) {
    var i, j, annots, annot, setAnnots, trackIndexOriginal, numAvailTracks,
      setAnnotsByChr = [];

    numAvailTracks = 1;

    for (i = 0; i < annotsByChr.length; i++) {
      annots = annotsByChr[i];
      setAnnots = [];
      for (j = 0; j < annots.annots.length; j++) {
        annot = annots.annots[j].slice();
        trackIndexOriginal = annot[3];
        if (trackIndexOriginal + 1 > numAvailTracks) {
          numAvailTracks = trackIndexOriginal + 1;
        }
        annot.splice(4, 0, trackIndexOriginal);
        setAnnots.push(annot);
      }
      setAnnotsByChr.push({chr: annots.chr, annots: setAnnots});
    }

    ideo.numAvailTracks = numAvailTracks;

    return setAnnotsByChr;
  }

  function setOriginalTrackIndexes(rawAnnots) {
    var keys, annotsByChr, setAnnotsByChr,
      ideo = this;

    keys = rawAnnots.keys;

    // If this method is unnecessary, pass through
    if (
      keys.length < 4 ||
      keys[3] !== 'trackIndex' ||
      keys[4] === 'trackIndexOriginal'
    ) {
      return rawAnnots;
    }

    annotsByChr = rawAnnots.annots;
    setAnnotsByChr = getSetAnnotsByChr(annotsByChr, ideo);

    keys.splice(4, 0, 'trackIndexOriginal');
    rawAnnots = {keys: keys, annots: setAnnotsByChr};
    if (ideo.rawAnnots.metadata) rawAnnots.metadata = ideo.rawAnnots.metadata;

    return rawAnnots;
  }

  // Default colors for tracks of annotations
  var colorMap = [
    ['F00'], // If there is 1 track, then color it red.
    ['F00', '88F'], // If 2 tracks, color one red and one light blue.
    ['F00', 'CCC', '88F'], // If 3, color one red, one grey, one light blue.
    ['F00', 'FA0', '0AF', '88F'], // And so on.
    ['F00', 'FA0', 'CCC', '0AF', '88F'],
    ['F00', 'FA0', '875', '578', '0AF', '88F'],
    ['F00', 'FA0', '875', 'CCC', '578', '0AF', '88F'],
    ['F00', 'FA0', '7A0', '875', '0A7', '578', '0AF', '88F'],
    ['F00', 'FA0', '7A0', '875', 'CCC', '0A7', '578', '0AF', '88F'],
    ['F00', 'FA0', '7A0', '875', '552', '255', '0A7', '578', '0AF', '88F']
  ];

  /**
   * Ensure annotation containers are ordered by chromosome.
   */
  function orderAnnotContainers(annots, ideo) {
    var unorderedAnnots, i, j, annot, chr, chrs;

    unorderedAnnots = annots;
    annots = [];
    chrs = ideo.chromosomesArray;
    for (i = 0; i < chrs.length; i++) {
      chr = chrs[i].name;
      for (j = 0; j < unorderedAnnots.length; j++) {
        annot = unorderedAnnots[j];
        if (annot.chr === chr) {
          annots.push(annot);
        }
      }
    }

    return annots;
  }

  /**
   * Add client annotations, as in annotations-tracks.html
   */
  function addClientAnnot(annots, annot, ra, m, ideo) {
    var annotTrack;

    annot.trackIndex = ra[3];
    annotTrack = ideo.config.annotationTracks[annot.trackIndex];
    if (annotTrack.color) {
      annot.color = annotTrack.color;
    }
    if (annotTrack.shape) {
      annot.shape = annotTrack.shape;
    }

    annots[m].annots.push(annot);

    return annots;
  }

  /**
   * Add sparse server annotations, as in annotations-track-filters.html
   */
  function addSparseServerAnnot(annot, ra, omittedAnnots, annots, m, ideo) {
    var colors = colorMap[ideo.numAvailTracks - 1];

    annot.trackIndex = ra[3];
    annot.trackIndexOriginal = ra[4];
    annot.color = '#' + colors[annot.trackIndexOriginal];

    // Catch annots that will be omitted from display
    if (annot.trackIndex > ideo.config.numTracks - 1) {
      if (annot.trackIndex in omittedAnnots) {
        omittedAnnots[annot.trackIndex].push(annot);
      } else {
        omittedAnnots[annot.trackIndex] = [annot];
      }
      return [annots, omittedAnnots];
    }
    annots[m].annots.push(annot);

    return [annots, omittedAnnots];
  }

  /**
   * Basic client annotations, as in annotations-basic.html
   * and annotations-external.html
   */
  function addBasicClientAnnot(annots, annot, m, ideo) {
    annot.trackIndex = 0;
    if (!annot.color) {
      annot.color = ideo.config.annotationsColor;
    }
    if (!annot.shape) {
      annot.shape = 'triangle';
    }
    annots[m].annots.push(annot);

    return annots;
  }

  function addAnnot(annot, keys, ra, omittedAnnots, annots, m, ideo) {

    if (ideo.config.annotationTracks) {
      annots = addClientAnnot(annots, annot, ra, m, ideo);
    } else if (keys[3] === 'trackIndex' && ideo.numAvailTracks !== 1) {
      [annots, omittedAnnots] =
        addSparseServerAnnot(annot, ra, omittedAnnots, annots, m, ideo);
    // } else if (
    //   keys.length > 3 &&
    //   keys[3] in {trackIndex: 1, color: 1, shape: 1} === false &&
    //   keys[4] === 'trackIndexOriginal'
    // ) {
    //   annots = addDenseServerAnnot(keys, annots, annot, m);
    } else {
      annots = addBasicClientAnnot(annots, annot, m, ideo);
    }

    return [annots, omittedAnnots];
  }

  function getAnnotDomId(chrIndex, annotIndex) {
    return '_c' + chrIndex + '_a' + annotIndex;
  }

  function addAnnotsForChr(annots, omittedAnnots, annotsByChr, chrModel,
    m, keys, ideo) {
    var j, k, annot, ra;

    // Assign DOM ID if annots are rendered as individual DOM elements
    const shouldAssignDomId = (
      !ideo.config.annotationsLayout ||
      ideo.config.annotationsLayout === 'tracks'
    );

    if (shouldAssignDomId) {
      if (ideo.annotSortFunction) {
        annotsByChr.annots.sort((a, b) => {
          // Reverse-sort, so first annots are drawn last, and thus at top layer
          return -ideo.annotSortFunction(a, b);
        });
      } else {
        // Sort by genomic position, in ascending order
        annotsByChr.annots.sort((a, b) => a[1] - b[1]);
      }
    }

    for (j = 0; j < annotsByChr.annots.length; j++) {
      ra = annotsByChr.annots[j];
      annot = {};

      for (k = 0; k < keys.length; k++) {
        annot[keys[k]] = ra[k];
      }

      annot.stop = annot.start + annot.length;

      annot.chr = annotsByChr.chr;
      annot.chrIndex = m;
      annot.startPx = ideo.convertBpToPx(chrModel, annot.start);
      annot.stopPx = ideo.convertBpToPx(chrModel, annot.stop);
      annot.px = Math.round((annot.startPx + annot.stopPx) / 2);
      if (shouldAssignDomId) annot.domId = getAnnotDomId(m, j);

      [annots, omittedAnnots] =
        addAnnot(annot, keys, ra, omittedAnnots, annots, m, ideo);
    }

    return [annots, omittedAnnots];
  }

  function warnOfUndefinedChromosome(annotsByChr) {
    console.warn(
      'Chromosome "' + annotsByChr.chr + '" undefined in ideogram; ' +
      annotsByChr.annots.length + ' annotations not shown'
    );
  }

  function addAnnots(rawAnnots, keys, ideo) {
    var m, i, annotsByChr, chrModel,
      annots = [],
      omittedAnnots = {};

    m = -1;
    for (i = 0; i < rawAnnots.length; i++) {
      annotsByChr = rawAnnots[i];
      chrModel = ideo.chromosomes[ideo.config.taxid][annotsByChr.chr];

      if (typeof chrModel === 'undefined') {
        warnOfUndefinedChromosome(annotsByChr);
        continue;
      }

      m++;
      annots.push({chr: annotsByChr.chr, annots: []});

      if (ideo.config.annotationsLayout !== 'heatmap-2d') {
        [annots, omittedAnnots] =
          addAnnotsForChr(annots, omittedAnnots, annotsByChr, chrModel, m,
            keys, ideo);
      } else {
        [annots, omittedAnnots] =
          add2dAnnotsForChr(annots, omittedAnnots, annotsByChr, chrModel, m,
            keys, ideo);
      }
    }
    return [annots, omittedAnnots];
  }

  function sendTrackAndAnnotWarnings(omittedAnnots, ideo) {
    var numOmittedTracks,
      layout = ideo.config.annotationsLayout,
      numTracks = ideo.config.numAnnotTracks;

    if (!/heatmap/.test(layout) && numTracks > 10) {
      console.error(
        'Ideogram only displays up to 10 tracks at a time.  ' +
        'You specified ' + numTracks + ' tracks.  ' +
        'Perhaps consider a different way to visualize your data.'
      );
    }

    numOmittedTracks = Object.keys(omittedAnnots).length;
    if (numOmittedTracks) {
      console.warn(
        'Ideogram configuration specified ' + numTracks + ' tracks, ' +
        'but loaded annotations contain ' + numOmittedTracks + ' ' +
        'extra tracks.'
      );
    }
  }

  /**
   * Proccesses genome annotation data.
   *
   * This method converts raw annotation data from server, which is structured as
   * an array of arrays, into a more verbose data structure consisting of an
   * array of objects.  It also adds pixel offset information.
   */
  function processAnnotData(rawAnnots) {
    var keys, annots, omittedAnnots,
      ideo = this;

    keys = rawAnnots.keys;
    rawAnnots = rawAnnots.annots;

    [annots, omittedAnnots] = addAnnots(rawAnnots, keys, ideo);
    annots = orderAnnotContainers(annots, ideo);

    sendTrackAndAnnotWarnings(omittedAnnots, ideo);

    return annots;
  }

  /**
   * @fileoverview Parse raw Ideogram.js annotations from an expression matrix.
   * This module handles dense gene expression matrixes.
   * In gene expression expressions, rows are genes and columns are cells.
   */

  class ExpressionMatrixParser {

    /**
     * @param {String} matrix Tab-delimited gene expression matrix
     * @param {Object} coordinates Coordinates [chr, start, length] by gene name
     * @param {Object} ideo Ideogram object
     */
    constructor(matrix, ideo) {
      this.matrix = matrix;
      this.ideo = ideo;
    }

    /**
     * Initialize rawAnnots by fetching genomic coordinates, then merging them
     * with the gene expression matrix supplied in constructor.
     */
    setRawAnnots() {
      var parser, ideo, matrix;
      parser = this;
      ideo = this.ideo;
      matrix = this.matrix;

      return new Promise(function(resolve) {
        parser.rawAnnots = parser.fetchCoordinates(ideo)
          .then(function(coordinates) {
            parser.coordinates = coordinates;
            resolve(parser.parseExpressionMatrix(matrix, ideo));
          });
      });
    }

    /**
     * Get chromosome, start and stop coordinates from genome annotation file
     *
     * TODO: Support non-human organisms
     */
    fetchCoordinates(ideo) {
      var coordinates = {};

      if (ideo.config.organism === 'human') {
        var ensemblData =
          ideo.config.dataDir +
          '../../annotations/Homo_sapiens,_Ensembl_80.tsv';

        return new Promise(function(resolve) {
          ideo.fetch(ensemblData, 'text').then(function(data) {
            // eslint-disable-next-line no-unused-vars
            var tsvLines, i, start, stop, gene, chr, length, geneType;

            tsvLines = data.split(/\r\n|\n/).slice(1);
            for (i = 0; i < tsvLines.length; i++) {
              [start, stop, gene, geneType, chr] = tsvLines[i].split(/\s/g);
              start = parseInt(start);
              stop = parseInt(stop);
              length = stop - start;
              coordinates[gene] = [chr, start, length];
            }
            resolve(coordinates);
          });
        });
      } else {
        throw Error('Expression matrix parsing is only supported for human');
      }
    }

    /**
     * Parses an annotation from a tab-separated line of a matrix file
     */
    parseAnnotFromTsvLine(tsvLine, chrs) {
      var annot, chrIndex, chr, start, gene, expressions,
        columns = tsvLine.split(/\s/g);

      gene = columns[0];
      if (gene in this.coordinates === false) return [null, null];

      expressions = columns.slice(1).map(d => parseFloat(d));
      [chr, start, length] = this.coordinates[gene];

      chrIndex = chrs.indexOf(chr);
      if (chrIndex === -1) return [null, null];

      annot = [gene, start, length];
      annot = annot.concat(expressions);

      return [chrIndex, annot];
    }

    /**
    * Parses a gene expression matrix file, returns raw annotations
    */
    parseExpressionMatrix(matrix, ideo) {
      var i, chrs, rawAnnots, cells, line, chrIndex, annot, keys,
        annots = [],
        tsvLines = matrix.split(/\r\n|\n/);

      chrs = Object.keys(ideo.chromosomes[ideo.config.taxid]);
      for (i = 0; i < chrs.length; i++) {
        annots.push({chr: chrs[i], annots: []});
      }

      for (i = 1; i < tsvLines.length; i++) {
        line = tsvLines[i];
        [chrIndex, annot] = this.parseAnnotFromTsvLine(line, chrs);
        if (chrIndex !== null) annots[chrIndex].annots.push(annot);
      }

      cells = tsvLines[0].split(/\s/g);
      keys = ['name', 'start', 'length'].concat(cells);
      rawAnnots = {keys: keys, annots: annots};

      return rawAnnots;
    }

  }

  function downloadAnnotations() {

    const ideo = this;
    const annots = {};

    ideo.annots.forEach(chrAnnots => {
      chrAnnots.annots.forEach(annot => {
        const desc = ideo.annotDescriptions.annots[annot.name];

        annots[annot.name] = [
          annot.name, desc.ensemblId,
          annot.chr, annot.start, annot.stop, annot.length,
          desc.type
        ];
      });
    });

    const header = [
      '# Gene name', 'Ensembl ID', 'Chromosome', 'Start', 'Stop', 'Length', 'Type'
    ];
    const rows = [header].concat(Object.values(annots));
    const annotsTsv =
      ideo.annotDescriptions.headers + '\n#\n' +
      rows.map(row => row.join('\t')).join('\n');

    const annotsHref =
      'data:text/plain;charset=utf-8,' + encodeURIComponent(annotsTsv);

    var evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });

    var a = document.createElement('a');
    a.setAttribute('download', 'ideogram.tsv');
    a.setAttribute('href', annotsHref);
    a.setAttribute('target', '_blank');

    // Enables easy testing
    a.setAttribute('id', '_ideo-undisplayed-dl-annots-link');
    a.setAttribute('style', 'display: none;');
    document.body.appendChild(a);

    a.dispatchEvent(evt);
  }

  /**
   * @fileoverview Methods for ideogram annotations.
   * Annotations are graphical objects that represent features of interest
   * located on the chromosomes, e.g. genes or variations.  They can
   * appear beside a chromosome, overlaid on top of it, or between multiple
   * chromosomes.
   */

  function initNumTracksAndBarWidth(ideo, config) {

    if (config.annotationTracks) {
      ideo.config.numAnnotTracks = config.annotationTracks.length;
    } else if (config.annotationsNumTracks) {
      ideo.config.numAnnotTracks = config.annotationsNumTracks;
    } else {
      ideo.config.numAnnotTracks = 1;
    }
    ideo.config.annotTracksHeight =
      config.annotationHeight * config.numAnnotTracks;

    if (typeof config.barWidth === 'undefined') {
      ideo.config.barWidth = 3;
    }
  }

  function initTooltip(ideo, config) {
    if (config.showAnnotTooltip !== false) {
      ideo.config.showAnnotTooltip = true;
    }

    if (config.onWillShowAnnotTooltip) {
      ideo.onWillShowAnnotTooltipCallback = config.onWillShowAnnotTooltip;
    }
  }

  function initAnnotLabel(ideo, config) {
    if (config.addAnnotLabel !== false) {
      ideo.config.addAnnotLabel = true;
    }

    if (config.onWillAddAnnotLabel) {
      ideo.onWillAddAnnotLabelCallback = config.onWillAddAnnotLabel;
    }
  }

  function initAnnotHeight(ideo) {
    var config = ideo.config;
    var annotHeight;

    if (!config.annotationHeight) {
      if (config.annotationsLayout === 'heatmap') {
        annotHeight = config.chrWidth - 1;
      } else {
        annotHeight = Math.round(config.chrHeight / 100);
        if (annotHeight < 3) annotHeight = 3;
      }
      ideo.config.annotationHeight = annotHeight;
    }
  }

  /**
   * Initializes various annotation settings.  Constructor help function.
   */
  function initAnnotSettings() {
    var ideo = this,
      config = ideo.config;

    initAnnotHeight(ideo);

    if (
      config.annotationsPath || config.localAnnotationsPath ||
      ideo.annots || config.annotations
    ) {
      initNumTracksAndBarWidth(ideo, config);
    } else {
      ideo.config.annotTracksHeight = 0;
      ideo.config.numAnnotTracks = 0;
    }

    if (typeof config.annotationsColor === 'undefined') {
      ideo.config.annotationsColor = '#F00';
    }

    if (config.onClickAnnot) {
      ideo.onClickAnnotCallback = config.onClickAnnot;
    }

    initTooltip(ideo, config);
    initAnnotLabel(ideo, config);
  }

  function validateAnnotsUrl(annotsUrl) {
    var tmp, extension;

    tmp = annotsUrl.split('?')[0].split('.');
    extension = tmp[tmp.length - 1];

    if (['bed', 'json', 'tsv'].includes(extension) === false) {
      extension = extension.toUpperCase();
      alert(
        'Ideogram.js only supports BED and Ideogram JSON and TSV ' +
        'at the moment.  ' +
        'Sorry, check back soon for ' + extension + ' support!'
      );
      return;
    }
    return extension;
  }

  /** Find redundant chromosomes in raw annotations */
  function detectDuplicateChrsInRawAnnots(ideo) {
    const seen = {};
    const duplicates = [];
    const chrs = ideo.rawAnnots.annots.map(annot => annot.chr);

    chrs.forEach((chr) => {
      if (chr in seen) duplicates.push(chr);
      seen[chr] = 1;
    });

    if (duplicates.length > 0) {
      const message =
        `Duplicate chromosomes detected.\n` +
        `Chromosome list: ${chrs}.  Duplicates: ${duplicates}.\n` +
        `To fix this, edit your raw annotations JSON data to remove redundant ` +
        `chromosomes.`;
      throw Error(message);
    }
  }

  function afterRawAnnots() {
    var ideo = this,
      config = ideo.config;

    // Ensure annots are ordered by chromosome
    ideo.rawAnnots.annots = ideo.rawAnnots.annots.sort(Ideogram.sortChromosomes);

    if (ideo.onLoadAnnotsCallback) {
      ideo.onLoadAnnotsCallback();
    }

    if (
      'heatmapThresholds' in config ||
      'metadata' in ideo.rawAnnots &&
      'heatmapThresholds' in ideo.rawAnnots.metadata
    ) {
      if (config.annotationsLayout === 'heatmap') {
        inflateHeatmaps(ideo);
      } else if (config.annotationsLayout === 'heatmap-2d') {
        ideo.config.heatmapThresholds = inflateThresholds(ideo);
      }
    }

    if (config.heatmaps) {
      ideo.deserializeAnnotsForHeatmap(ideo.rawAnnots);
    }

    detectDuplicateChrsInRawAnnots(ideo);
  }

  /**
   * Converts list of annotation-by-chromosome objects to list of annot objects
   */
  function flattenAnnots() {
    const ideo = this;
    return ideo.annots.reduce((accumulator, annots) => {
      return [...accumulator, ...annots.annots];
    }, []);
  }

  /**
   * Requests annotations URL via HTTP, sets ideo.rawAnnots for downstream
   * processing.
   *
   * @param annotsUrl Absolute or relative URL for native or BED annotations file
   */
  function fetchAnnots(annotsUrl) {
    var extension, is2dHeatmap,
      ideo = this,
      config = ideo.config;

    is2dHeatmap = config.annotationsLayout === 'heatmap-2d';

    var extension = validateAnnotsUrl(annotsUrl);

    if (annotsUrl.slice(0, 4) !== 'http' && !is2dHeatmap && extension !== 'tsv') {
      ideo.fetch(annotsUrl)
        .then(function(data) {
          ideo.rawAnnotsResponse = data; // Preserve truly raw response content
          ideo.rawAnnots = data; // Sometimes gets partially processed
          ideo.afterRawAnnots();
        });
      return;
    }

    extension = (is2dHeatmap ? '' : extension);

    ideo.fetch(annotsUrl, 'text')
      .then(function(text) {
        ideo.rawAnnotsResponse = text;
        if (is2dHeatmap) {
          var parser = new ExpressionMatrixParser(text, ideo);
          parser.setRawAnnots().then(function(d) {
            ideo.rawAnnots = d;
            ideo.afterRawAnnots();
          });
        } else {
          if (extension === 'tsv') {
            ideo.rawAnnots = new TsvParser(text, ideo).rawAnnots;
          } else if (extension === 'bed') {
            ideo.rawAnnots = new BedParser(text, ideo).rawAnnots;
          } else {
            ideo.rawAnnots = JSON.parse(text);
          }
          ideo.afterRawAnnots();
        }
      });
  }

  /**
   * Fills out annotations data structure such that its top-level list of arrays
   * matches that of this ideogram's chromosomes list in order and number
   * Fixes https://github.com/eweitz/ideogram/issues/66
   */
  function fillAnnots(annots) {
    var filledAnnots, chrs, chrArray, i, chr, annot, chrIndex;

    filledAnnots = [];
    chrs = [];
    chrArray = this.chromosomesArray;

    for (i = 0; i < chrArray.length; i++) {
      chr = chrArray[i].name;
      chrs.push(chr);
      filledAnnots.push({chr: chr, annots: []});
    }

    for (i = 0; i < annots.length; i++) {
      annot = annots[i];
      chrIndex = chrs.indexOf(annot.chr);
      if (chrIndex !== -1) {
        filledAnnots[chrIndex] = annot;
      }
    }

    return filledAnnots;
  }

  /** Adds boxes behind a list of chromosomes; can indicate selection, etc. */
  function highlight(chrNames, color='red') {
    const ideo = this;
    const taxid = ideo.config.taxid;

    const highlightsHtml = chrNames.map(chrName => {
      const chrId = ideo.chromosomes[taxid][chrName].id;
      const chrSet = `${ideo.selector} #${chrId}-chromosome-set`;
      const chrDom = document.querySelector(chrSet);
      const rect = chrDom.getBoundingClientRect();

      const style = `style="
      stroke-width: 1px;
      stroke: ${color};
      fill: ${color};
      fill-opacity: 0.05;
      position: absolute;
      rx: 4;
      ry: 4;
      height: ${rect.width + 15}px;
      width: ${rect.height + 15}px"`;

      const left = chrDom.transform.baseVal[1].matrix.f - 7.5;
      const transform = `transform="rotate(90) translate(10, ${left})"`;
      const id = `id="ideo-highlight-${chrId}"`;

      return `<rect class="ideo-highlight" ${id} ${style} ${transform}/>`;
    }).join();

    const ideoDom = document.querySelector(ideo.selector);
    ideoDom.insertAdjacentHTML('afterBegin', highlightsHtml);
  }

  /** Removes highlight from a list of chromosomes (or all chromosomes)  */
  function unhighlight(chrNames) {
    const ideo = this;

    let highlightsSelector = `${ideo.selector} .ideo-highlight`;
    if (typeof chrNames !== 'undefined') {
      const taxid = ideo.config.taxid;
      highlightsSelector = chrNames.map(chrName => {
        const chrId = ideo.chromosomes[taxid][chrName].id;
        return `${ideo.selector} #ideo-highlight-${chrId}`;
      });
    }

    document.querySelectorAll(highlightsSelector).forEach((element) => {
      element.remove();
    });

  }

  // The E-Utilies In Depth: Parameters, Syntax and More:
  // https://www.ncbi.nlm.nih.gov/books/NBK25499/

  var apiKey = '&api_key=7e33ac6a08a6955ec3b83d214d22b21a2808';

  var eutils = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
  var esearch = eutils + 'esearch.fcgi?retmode=json' + apiKey;
  var esummary = eutils + 'esummary.fcgi?retmode=json' + apiKey;
  var elink = eutils + 'elink.fcgi?retmode=json' + apiKey;

  function getAssemblySearchUrl(taxid, ideo) {
    var termStem, asmSearchUrl;

    if (ideo.assemblyIsAccession()) {
      termStem = ideo.config.assembly + '%22[Assembly%20Accession]';
    } else {
      termStem = (
        taxid + '%22[taxid]' +
        'AND%20(%22latest%20refseq%22[filter])%20'
      );
    }

    asmSearchUrl =
      ideo.esearch +
      '&db=assembly' +
      '&term=%22' + termStem +
      'AND%20(%22chromosome%20level%22[filter]%20' +
      'OR%20%22complete%20genome%22[filter])';

    return asmSearchUrl;
  }

  /**
   *  Returns NCBI Taxonomy identifier (taxid) for organism name
   */
  function getTaxidFromEutils(orgName, ideo) {
    var taxonomySearch, taxid;

    taxonomySearch = ideo.esearch + '&db=taxonomy&term=' + orgName;

    return d3.json(taxonomySearch).then(function(data) {
      var idlist = data.esearchresult.idlist;
      if (idlist.length === 0) {
        var warning =
          'Organism "' + orgName + '" is generally unknown; it was not found ' +
          'in the NCBI Taxonomy database.  If you did not intend to specify a ' +
          'novel or custom taxon, then try using the organism\'s ' +
          'scientific name, e.g. Homo sapiens or Arabidopsis thaliana.';
        throw warning;
      } else {
        taxid = data.esearchresult.idlist[0];
        return [orgName, taxid];
      }
    });
  }

  /**
   * Returns organism common name given an NCBI Taxonomy ID
   *
   * @param taxid NCBI Taxonomy ID
   * @param callback Function to call upon completing ESearch request
   */
  function getOrganismFromEutils(taxid, callback) {
    var organism, taxonomySearch,
      ideo = this;

    taxid = ideo.config.organism;

    taxonomySearch = ideo.esummary + '&db=taxonomy&id=' + taxid;

    d3.json(taxonomySearch).then(function(data) {
      organism = data.result[String(taxid)].commonname;
      ideo.config.organism = organism;
      return callback(organism);
    });
  }

  function setTaxidData(taxid, ideo) {

    var dataDir, urlOrg, taxids;

    if (ideo.assemblyIsAccession()) {
      return new Promise(function(resolve) {
        ideo.coordinateSystem = 'bp';
        ideo.getAssemblyAndChromosomesFromEutils(taxid, resolve);
      });
    }

    dataDir = ideo.config.dataDir;
    urlOrg = slug(ideo.organisms[taxid].scientificName);

    taxids = [taxid];

    var fullyBandedTaxids = ['9606', '10090', '10116'];
    if (fullyBandedTaxids.includes(taxid) && !ideo.config.showFullyBanded) {
      urlOrg += '-no-bands';
    }
    var chromosomesUrl = dataDir + urlOrg + '.json';

    var promise2 = new Promise((resolve, reject) => {
      return fetchWithRetry(chromosomesUrl)
        .then(response => {
          return response.json().then(function(json) {
            resolve(json.chrBands);
          });
        })
        .catch((errorMessage) => {
          reject(errorMessage);
        });
    });

    return promise2
      .then(function(chrBands) {
        // Check if chromosome data exists locally.
        // This is used for pre-processed centromere data,
        // which is not accessible via EUtils.  See get_chromosomes.py.

        var asmAndChrTaxidsArray = [''],
          chromosomes = [],
          seenChrs = {},
          chr, maxLength, splitBand, length;

        ideo.bandData[taxid] = chrBands;

        for (var i = 0; i < chrBands.length; i++) {
          splitBand = chrBands[i].split(' ');
          chr = splitBand[0];
          length = splitBand.slice(-1)[0];
          if (chr in seenChrs) {
            continue;
          } else {
            chromosomes.push({name: chr, type: 'nuclear', length: length});
            seenChrs[chr] = 1;
          }
        }
        chromosomes = chromosomes.sort(Ideogram.sortChromosomes);
        maxLength = {bp: 0, iscn: 0};
        chromosomes.forEach(chr => {
          if (chr.length > maxLength.bp) maxLength.bp = chr.length;
        });
        ideo.maxLength[taxid] = maxLength;
        asmAndChrTaxidsArray.push(chromosomes);
        asmAndChrTaxidsArray.push(taxids);
        return asmAndChrTaxidsArray;
      },
      function() {
        // If request in `then` errs (404), fetch data from EUtils
        return new Promise(function(resolve) {
          ideo.coordinateSystem = 'bp';
          ideo.getAssemblyAndChromosomesFromEutils(taxid, resolve);
        });
      });
  }

  function setAssemblyAndChromosomes(taxid, resolve, ideo) {
    var assembly, chrs, originalChrs, orgName, filteredChrs,
      config = ideo.config;

    setTaxidData(taxid, ideo)
      .then(function(asmChrTaxidsArray) {
        assembly = asmChrTaxidsArray[0];
        chrs = asmChrTaxidsArray[1];

        if ('chromosomes' in config === false || config.chromosomes === null) {
          ideo.config.chromosomes = {};
          ideo.config.chromosomes[taxid] = chrs;
        } else {
          if (config.multiorganism) {
            if (taxid in config.chromosomes) {
              // Encountered when either organism has centromere data
              originalChrs = config.chromosomes[taxid];
            } else {
              // Encountered when neither organism has centromere data
              orgName = slug(ideo.getScientificName(taxid));
              ideo.config.chromosomes[taxid] =
                config.chromosomes[orgName].slice();
              originalChrs = ideo.config.chromosomes[taxid];
              // delete ideo.config.chromosomes[orgName];
            }
          } else {
            originalChrs = config.chromosomes;
          }

          filteredChrs = chrs.filter(d => originalChrs.includes(d.name));
          ideo.config.chromosomes[taxid] = filteredChrs;
        }
        ideo.chromosomes[taxid] = ideo.config.chromosomes[taxid].slice();
        ideo.organisms[taxid].assemblies = {
          default: assembly
        };
        resolve();
      });
  }

  /**
   * Determine if organism is natively supported, using its name.
   */
  function isOrganismSupported(org, ideo) {
    var taxid, ideoOrg;

    for (taxid in ideo.organisms) {
      ideoOrg = ideo.organisms[taxid];
      if (
        taxid === slug(org) ||
        slug(ideoOrg.commonName) === slug(org) ||
        slug(ideoOrg.scientificName) === slug(org)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Augment "organisms" metadata with for any requested organism that is
   * not natively supported (i.e., not in organism-metadata.js).
  */
  function populateNonNativeOrg(orgs, ideo) {
    var org, promise, i,
      getTaxidFromEutilsPromises = [],
      augmentedOrganismMetadata = {};

    for (i = 0; i < orgs.length; i++) {
      org = orgs[i];
      if (isOrganismSupported(org, ideo) === false) {
        promise = getTaxidFromEutils(org, ideo)
          .then(function(orgNameAndTaxid) {

            var taxid = orgNameAndTaxid[1],
              orgName = orgNameAndTaxid[0],
              name, scientificName;

            name = orgName.replace('-', ' ');
            scientificName = name[0].toUpperCase() + name.slice(1);

            augmentedOrganismMetadata[taxid] = {
              scientificName: scientificName,
              commonName: '',
              assemblies: {default: ''}
            };

            Object.assign(ideo.organisms, augmentedOrganismMetadata);
          }, function(warning) {
            console.warn(warning);
            var customMetadata = {
              scientificName: org,
              commonName: org,
              assemblies: {default: ''}
            };

            // Use a negative number as unofficial taxid for custom organism.
            // Use case: https://github.com/eweitz/ideogram/issues/265
            //
            // If support for *multiple* custom specifies is ever
            // needed, we can decrement from -1.
            ideo.organisms['-1'] = customMetadata;
            augmentedOrganismMetadata['-1'] = customMetadata;
          });
      } else {
        promise = new Promise(function(resolve) {
          var taxid = ideo.getTaxid(org);
          augmentedOrganismMetadata[taxid] = ideo.organisms[taxid];
          resolve();
        });
      }
      getTaxidFromEutilsPromises.push(promise);
    }

    return Promise.all(getTaxidFromEutilsPromises).then(function() {
      return augmentedOrganismMetadata;
    });
  }

  function prepareTmpChrsAndTaxids(ideo) {
    var orgs, taxids, tmpChrs, org, taxid, chrsOrgSlugs,
      config = ideo.config;

    taxids = [];
    tmpChrs = {};
    orgs = (config.multiorganism) ? config.organism : [config.organism];

    return populateNonNativeOrg(orgs, ideo).then(function(orgMetadata) {
      var orgFields = orgMetadata[taxid];

      for (taxid in orgMetadata) {
        orgFields = orgMetadata[taxid];
        taxids.push(taxid);
        if (config.multiorganism) {
          if (typeof config.chromosomes !== 'undefined') {
            chrsOrgSlugs = Object.keys(config.chromosomes).map(org => slug(org));
            // Adjusts 'chromosomes' configuration parameter to make object
            // keys use taxid instead of common organism name
            if (chrsOrgSlugs.includes(slug(orgFields.scientificName))) {
              org = orgFields.scientificName;
            } else if (chrsOrgSlugs.includes(slug(orgFields.commonName))) {
              org = orgFields.commonName;
            }
            if (slug(org) in config.chromosomes) {
              tmpChrs[taxid] = config.chromosomes[slug(org)];
            } else {
              tmpChrs[taxid] = config.chromosomes[org.toLowerCase()];
            }
          } else {
            tmpChrs = null;
          }
        }
      }
      return [tmpChrs, taxids];
    });
  }

  /**
   * Sort taxids by the "organism" configuration option
   *
   * TODO: Handle taxid being passed as organism
   */
  function sortTaxidsByOriginalOrganismOption(ideo) {
    var configOrganisms, sortedTaxids, i;
    configOrganisms = ideo.config.organism;
    sortedTaxids = [];
    if (Array.isArray(configOrganisms)) {
      // Handling multi-organism ideogram
      for (i = 0; i < configOrganisms.length; i++) {
        sortedTaxids.push(ideo.getTaxid(configOrganisms[i]));
      }
    } else {
      // Handling single-organism ideogram
      sortedTaxids.push(ideo.getTaxid(configOrganisms));
    }
    return sortedTaxids;
  }

  function getTaxidsForOrganismsInConfig(callback, ideo) {

    prepareTmpChrsAndTaxids(ideo).then(function([tmpChrs, taxids]) {
      var i, taxid, promise, assemblies, asmAccs,
        config = ideo.config,
        asmAndChrPromises = [];

      for (i = 0; i < taxids.length; i++) {
        taxid = taxids[i];
        assemblies = ideo.organisms[taxid].assemblies;
        asmAccs = Object.values(assemblies);
        if (
          assemblies.default === '' ||
          ideo.assemblyIsAccession() && !asmAccs.includes(config.assembly)
        ) {
          promise = new Promise(function(resolve) {
            setAssemblyAndChromosomes(taxid, resolve, ideo);
          });
        } else {
          ideo.config.taxids = taxids;
          if (ideo.config.multiorganism) {
            ideo.config.chromosomes = tmpChrs;
          }
          promise = new Promise(function(resolve) {
            resolve();
          });
        }

        asmAndChrPromises.push(promise);
      }

      Promise.all(asmAndChrPromises).then(function() {
        taxids = sortTaxidsByOriginalOrganismOption(ideo);
        ideo.config.taxids = taxids;
        return callback(taxids);
      });
    });
  }

  function getIsMultiorganism(taxidInit, ideo) {
    return (
      ('organism' in ideo.config && ideo.config.organism instanceof Array) ||
      (taxidInit && ideo.config.taxid instanceof Array)
    );
  }

  /**
   * Configure Ideogram taxids when 'organism' is not in ideo.config
   */
  function getTaxidsForOrganismsNotInConfig(taxidInit, callback, ideo) {
    var taxids;

    if (ideo.config.multiorganism) {
      if (taxidInit) {
        taxids = ideo.config.taxid;
      }
    } else {
      if (taxidInit) {
        taxids = [ideo.config.taxid];
      }
      ideo.config.taxids = taxids;
    }
    callback(taxids);
  }

  /**
   * Returns an array of taxids for the current ideogram
   * Also sets configuration parameters related to taxid(s), whether ideogram is
   * multiorganism, and adjusts chromosomes parameters as needed
   **/
  function getTaxids(callback) {
    var taxidInit,
      ideo = this;

    taxidInit = 'taxid' in ideo.config;

    ideo.config.multiorganism = getIsMultiorganism(taxidInit, ideo);

    if (ideo.config.multiorganism) ideo.coordinateSystem = 'bp';

    if ('organism' in ideo.config) {
      const org = ideo.config.organism;
      if (typeof org === 'string') {
        // Canonicalize e.g. "Homo sapiens" to "homo-sapiens"
        ideo.config.organism = slug(org.toLowerCase());
      }

      getTaxidsForOrganismsInConfig(callback, ideo);
    } else {
      getTaxidsForOrganismsNotInConfig(taxidInit, callback, ideo);
    }
  }

  /**
   * Get a URL to ESearch the NCBI Nucleotide DB for an Assembly UID
   */
  function getESearchUrlForChromosomes(asmUid, ideo) {
    var qs;

    // Get a list of IDs for the chromosomes in this genome.
    //
    // Query chromosomes sequences in Nucleotide DB (nuccore) via
    // Assembly DB E-Utils link.
    qs = ('&db=nuccore&dbfrom=assembly&linkname=assembly_nuccore&' +
      'cmd=neighbor_history&from_uid=' + asmUid);

    return d3.json(ideo.elink + qs)
      .then(function(data) {
        var webenv = data.linksets[0].webenv;
        qs =
          '&db=nuccore' +
          '&term=%231+AND+%28' +
            'sequence_from_chromosome[Properties]+OR+' +
            'sequence_from_plastid[Properties]+OR+' +
            'sequence_from_mitochondrion[Properties]%29' +
          '&WebEnv=' + webenv + '&usehistory=y&retmax=1000';
        return ideo.esearch + qs;
      });
  }

  /**
   * Request basic data on a list of chromosome IDs from ESearch
   */
  function fetchNucleotideSummary(data, ideo) {
    var ids, ntSummary;
    ids = data.esearchresult.idlist.join(',');
    ntSummary = ideo.esummary + '&db=nucleotide&id=' + ids;
    return d3.json(ntSummary);
  }

  /**
   * Get name and type for mitochondrial chromosome
   *
   * See example of "MT" in yeast:
   * https://eweitz.github.io/ideogram/eukaryotes?org=saccharomyces-cerevisiae
   */
  function parseMitochondrion(result, ideo) {
    var type, cnIndex, chrName;

    if (ideo.config.showNonNuclearChromosomes) {
      type = result.genome;
      cnIndex = result.subtype.split('|').indexOf('plasmid');
      if (cnIndex === -1) {
        chrName = 'MT';
      } else {
        // Seen in e.g. rice genome IRGSP-1.0 (GCF_001433935.1),
        // From https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?retmode=json&db=nucleotide&id=996703432,996703431,996703430,996703429,996703428,996703427,996703426,996703425,996703424,996703423,996703422,996703421,194033210,11466763,7524755
        // genome: 'mitochondrion',
        // subtype: 'cell_line|plasmid',
        // subname: 'A-58 CMS|B1',
        chrName = result.subname.split('|')[cnIndex];
      }
    } else {
      return [null, null];
    }

    return [chrName, type];
  }

  /**
   * Get name and type for chloroplastic chromosome.
   *
   * Plants have chloroplasts.  See e.g. green algae:
   * https://eweitz.github.io/ideogram/eukaryotes?org=micromonas-commoda
   */
  function parseChloroplastOrPlastid(ideo) {
    // Plastid encountered with rice genome IRGSP-1.0 (GCF_001433935.1)
    if (ideo.config.showNonNuclearChromosomes) {
      return ['CP', 'chloroplast'];
    }
    return [null, null];
  }

  /**
   * Get name and type for apicoplast chromosome
   *
   * Plasmodium falciparum (malaria parasite) has such a chromosome, see e.g.:
   * https://eweitz.github.io/ideogram/eukaryotes?org=plasmodium-falciparum
   */
  function parseApicoplast(ideo) {
    if (ideo.config.showNonNuclearChromosomes) {
      return ['AP', 'apicoplast'];
    }
    return [null, null];
  }

  /**
   * Get name and type for nuclear chromosome
   *
   * These are typical chromosomes, like chromosome 1.
   */
  function parseNuclear(result) {
    var type, cnIndex, chrName;

    type = 'nuclear';
    cnIndex = result.subtype.split('|').indexOf('chromosome');
    chrName = result.subname.split('|')[cnIndex];

    if (typeof chrName !== 'undefined' && chrName.substr(0, 3) === 'chr') {
      // Convert "chr12" to "12", e.g. for banana (GCF_000313855.2)
      chrName = chrName.substr(3);
    }

    return [chrName, type];
  }

  /**
   * Get name and type of any chromosome object from NCBI Nucleotide ESummary
   */
  function getChrNameAndType(result, ideo) {
    var genome = result.genome;
    if (genome === 'mitochondrion') {
      return parseMitochondrion(result, ideo);
    } else if (genome === 'chloroplast' || genome === 'plastid') {
      return parseChloroplastOrPlastid(ideo);
    } else if (genome === 'apicoplast') {
      return parseApicoplast(ideo);
    } else {
      return parseNuclear(result);
    }
  }

  function parseChromosome(result, ideo) {
    var chrName, type, chromosome;

    [chrName, type] = getChrNameAndType(result, ideo);

    chromosome = {
      name: chrName,
      length: result.slen,
      type: type
    };

    return chromosome;
  }

  function parseChromosomes(results, taxid, ideo) {
    var x, chromosome, seenChrId, maxLength,
      seenChrs = {},
      chromosomes = [];

    for (x in results) {
      // omit list of result uids
      if (x === 'uids') continue;

      chromosome = parseChromosome(results[x], ideo);
      seenChrId = chromosome.name + '_' + chromosome.length;
      if (chromosome.type !== null && seenChrId in seenChrs === false) {
        // seenChrs accounts for duplicate chromosomes seen with
        // pig (Sus scrofa), likely GenBank and RefSeq copies.
        chromosomes.push(chromosome);
      }

      seenChrs[seenChrId] = 1;
    }

    chromosomes = chromosomes.sort(Ideogram.sortChromosomes);

    maxLength = {bp: 0, iscn: 0};
    chromosomes.forEach(chr => {
      if (chr.length > maxLength.bp) maxLength.bp = chr.length;
    });
    if (maxLength.bp > ideo.maxLength.bp) ideo.maxLength.bp = maxLength.bp;
    ideo.maxLength[taxid] = maxLength;
    ideo.coordinateSystem = 'bp';

    return chromosomes;
  }

  /**
   * Request ESummary data from an ESearch on a genome assembly
   */
  function fetchAssemblySummary(data, ideo) {
    var asmUid, asmSummaryUrl;

    // NCBI Assembly database's internal identifier (uid) for this assembly
    asmUid = data.esearchresult.idlist[0];
    asmSummaryUrl = ideo.esummary + '&db=assembly&id=' + asmUid;

    return d3.json(asmSummaryUrl);
  }

  /**
   * Returns assembly accession, as well as names and lengths of chromosomes for
   * an organism's best-known genome assembly, or for a specified assembly.
   *
   * Gets data from NCBI EUtils web API.
   *
   * @param callback Function to call upon completion of this async method
   */
  function getAssemblyAndChromosomesFromEutils(taxid, callback) {
    var assemblyAccession,
      ideo = this;

    // Search for assembly, then
    // get summary of that assembly, then
    // get search URL for chromosomes in that assembly, then
    // get search results containing chromosome IDs, then
    // get summaries of each of those chromosome IDs, then
    // format the chromosome summaries and pass them into callback function.
    var asmSearchUrl = getAssemblySearchUrl(taxid, ideo);
    d3.json(asmSearchUrl)
      .then(function(data) {return fetchAssemblySummary(data, ideo);})
      .then(function(data) {
        var asmUid = data.result.uids[0];
        assemblyAccession = data.result[asmUid];
        return getESearchUrlForChromosomes(asmUid, ideo);
      }).then(function(esearchUrl) {return d3.json(esearchUrl);})
      .then(function(data) {return fetchNucleotideSummary(data, ideo);})
      .then(function(data) {
        var chromosomes = parseChromosomes(data.result, taxid, ideo);
        return callback([assemblyAccession, chromosomes]);
      }, function(rejectedReason) {
        console.warn(rejectedReason);
      });
  }

  /**
   * @fileoverview Methods to show (or hide) cytogenetic banding data
   */

  function hideUnshownBandLabels() {
    var ideo = this;
    var bandsToShow = ideo.bandsToShow.join(',');

    // Handles edge-case when ideogram consists of one chromosome
    // that lacks bands in a genome that has bands (e.g. MT in human)
    if (ideo.bandsToShow.length === 0) return;

    // d3.selectAll resolves to querySelectorAll (QSA).
    // QSA takes a surprisingly long time to complete,
    // and scales with the number of selectors.
    // Most bands are hidden, so we can optimize by
    // Hiding all bands, then QSA'ing and displaying the
    // relatively few bands that are shown.
    d3.selectAll(ideo.selector + ' .bandLabel, .bandLabelStalk')
      .style('display', 'none');
    d3.selectAll(bandsToShow).style('display', '');
  }

  function getPrevRight(prevLabelXRight, prevHiddenBoxIndex, i,
    textOffsets, chrModel) {
    var prevTextBoxLeft, prevTextBoxWidth;

    if (prevHiddenBoxIndex !== i) {
      // This getBoundingClientRect() forces Chrome's
      // 'Recalculate Style' and 'Layout', which takes 30-40 ms on Chrome.
      // TODO: This forced synchronous layout would be nice to eliminate.
      // prevTextBox = texts[i].getBoundingClientRect();
      // prevLabelXRight = prevTextBox.left + prevTextBox.width;

      // TODO: Account for number of characters in prevTextBoxWidth,
      // maybe also zoom.
      prevTextBoxLeft = textOffsets[chrModel.id][i];
      prevTextBoxWidth = 36;

      prevLabelXRight = prevTextBoxLeft + prevTextBoxWidth;
    }

    return prevLabelXRight;
  }

  function updateShown(indexesToShow, overlapRight, left, pad, prevRight, i,
    isBefore) {
    var hiddenIndex, doSkip,
      thisRight = isBefore ? overlapRight : prevRight;

    if (left < pad + thisRight) {
      overlapRight = prevRight;
      hiddenIndex = i;
      doSkip = isBefore;
    } else {
      indexesToShow.push(i);
    }

    return [indexesToShow, overlapRight, hiddenIndex, doSkip];
  }

  function getIndexesToShow(offsets, chrModel) {
    var i, hiddenIndex, left, prevRight, doSkip,
      indexesToShow = [],
      textsLength = offsets[chrModel.id].length,
      overlapRight = 0, // Right X coordinate of overlapping label
      pad = 5; // text padding

    for (i = 0; i < textsLength; i++) {
      // Ensures band labels don't overlap
      left = offsets[chrModel.id][i];

      [indexesToShow, overlapRight, hiddenIndex, doSkip] =
        updateShown(indexesToShow, overlapRight, left, pad, prevRight, i, true);
      if (doSkip) continue;

      prevRight = getPrevRight(prevRight, hiddenIndex, i, offsets, chrModel);

      [indexesToShow, overlapRight, hiddenIndex, doSkip] =
        updateShown(indexesToShow, overlapRight, left, pad, prevRight, i, false);
    }

    return indexesToShow;
  }

  /**
   * Sets band labels to display on each chromosome, avoiding label overlap
   */
  function setBandsToShow(chrs, textOffsets) {
    var index, i, j, indexesToShow, chrModel, selectorsToShow, ithLength,
      ideo = this;

    ideo.bandsToShow = [];

    for (i = 0; i < chrs.length; i++) {

      chrModel = chrs[i];

      indexesToShow = getIndexesToShow(textOffsets, chrModel);

      selectorsToShow = [];
      ithLength = indexesToShow.length;

      for (j = 0; j < ithLength; j++) {
        index = indexesToShow[j];
        selectorsToShow.push('#' + chrModel.id + ' .bsbsl-' + index);
      }

      ideo.bandsToShow = ideo.bandsToShow.concat(selectorsToShow);
    }
  }

  /**
   * @fileoverview Methods to draw cytogenetic bands and their labels
   *
   */

  /**
   * Draws text of cytoband label
   */
  function drawBandLabelText(chr, bandsToLabel, chrModel, textOffsets) {
    var ideo = this,
      layout = ideo._layout,
      chrIndex = chrModel.chrIndex;

    chr.selectAll('text')
      .data(bandsToLabel)
      .enter()
      .append('g')
      .attr('class', function(d, i) {
        return 'bandLabel bsbsl-' + i;
      })
      .attr('transform', function(d) {
        var transform = layout.getChromosomeBandLabelTranslate(d, chrIndex);

        if (ideo.config.orientation === 'horizontal') {
          textOffsets[chrModel.id].push(transform.x + 13);
        } else {
          textOffsets[chrModel.id].push(transform.y + 6);
        }

        return transform.translate;
      })
      .append('text')
      .attr('text-anchor', layout.getChromosomeBandLabelAnchor(chrIndex))
      .text(function(d) {return d.name;});

    return textOffsets;
  }

  /**
   * Draws line between cytoband and its text label
   */
  function drawBandLabelStalk(chr, bandsToLabel, chrModel, textOffsets) {
    var ideo = this;

    chr.selectAll('line.bandLabelStalk')
      .data(bandsToLabel)
      .enter()
      .append('g')
      .attr('class', function(d, i) {
        return 'bandLabelStalk bsbsl-' + i;
      })
      .attr('transform', function(d) {
        var x, y;

        x = ideo.round(d.px.start + d.px.width / 2);
        y = -10;

        textOffsets[chrModel.id].push(x + 13);

        return 'translate(' + x + ',' + y + ')';
      })
      .append('line')
      .attr('x1', 0)
      .attr('y1', ideo._layout.getChromosomeBandTickY1(chrModel.chrIndex))
      .attr('x2', 0)
      .attr('y2', ideo._layout.getChromosomeBandTickY2(chrModel.chrIndex));
  }

  function getChrModels(chromosomes) {
    var taxid, chr,
      chrModels = [];

    for (taxid in chromosomes) {
      for (chr in chromosomes[taxid]) {
        chrModels.push(chromosomes[taxid][chr]);
      }
    }

    return chrModels;
  }

  /**
   * Draws text and stalks for cytogenetic band labels.
   *
   * Band labels are text like "p11.11".
   * Stalks are small lines that visually connect labels to their bands.
   */
  function drawBandLabels(chromosomes) {
    var i, chr, chrModel, chrModels, bandsToLabel,
      ideo = this,
      textOffsets = {};

    chrModels = getChrModels(chromosomes);

    for (i = 0; i < chrModels.length; i++) {
      chrModel = chrModels[i];
      chr = d3.select(ideo.selector + ' #' + chrModel.id);
      textOffsets[chrModel.id] = [];

      // Don't show "pter" label for telocentric chromosomes, e.g. mouse
      bandsToLabel = chrModel.bands.filter(d => d.name !== 'pter');

      textOffsets =
        ideo.drawBandLabelText(chr, bandsToLabel, chrModel, textOffsets);

      ideo.drawBandLabelStalk(chr, bandsToLabel, chrModel, textOffsets);
    }

    ideo.setBandsToShow(chrModels, textOffsets);
  }

  function getStainAndColors(i, colors) {
    var stain, color1, color2, color3;

    stain = colors[i][0];
    color1 = colors[i][1];
    color2 = colors[i][2];
    color3 = colors[i][3];

    return [stain, color1, color2, color3];
  }

  function getGradients(colors) {
    var i, stain, color1, color2, color3,
      gradients = '';

    for (i = 0; i < colors.length; i++) {
      [stain, color1, color2, color3] = getStainAndColors(i, colors);
      gradients +=
        '<linearGradient id="' + stain + '" x1="0%" y1="0%" x2="0%" y2="100%">';
      if (stain === 'gneg') {
        gradients +=
          '<stop offset="70%" stop-color="' + color2 + '" />' +
          '<stop offset="95%" stop-color="' + color3 + '" />' +
          '<stop offset="100%" stop-color="' + color1 + '" />';
      } else {
        gradients +=
          '<stop offset="5%" stop-color="' + color1 + '" />' +
          '<stop offset="15%" stop-color="' + color2 + '" />' +
          '<stop offset="60%" stop-color="' + color3 + '" />';
      }
      gradients +=
        '</linearGradient>';
    }

    return gradients;
  }

  /**
   * Returns SVG gradients that give chromosomes a polished look
   */
  function getBandColorGradients() {
    var css,
      gradients = '';

    gradients = getGradients(staticColors);

    css = `<style>${configuredCss}</style>`;

    gradients += staticGradients;
    gradients = '<defs>' + gradients + '</defs>';
    gradients = css + gradients;

    return gradients;
  }

  function getDelimiterTsvLinesAndInit(source, content) {
    var delimiter, tsvLines, init;

    if (typeof chrBands === 'undefined' && source !== 'native') {
      delimiter = /\t/;
      tsvLines = content.split(/\r\n|\n/);
      init = 1;
    } else {
      delimiter = / /;
      tsvLines = content;
      init = 0;
    }

    return [delimiter, tsvLines, init];
  }

  function updateChromosomes(chromosomes) {
    var tmp, i;

    if (chromosomes instanceof Array && typeof chromosomes[0] === 'object') {
      tmp = [];
      for (i = 0; i < chromosomes.length; i++) {
        tmp.push(chromosomes[i].name);
      }
      chromosomes = tmp;
    }
    return chromosomes;
  }

  function getLineObject(chr, columns, stain, taxid) {
    return {
      chr: chr,
      bp: {
        start: parseInt(columns[5], 10),
        stop: parseInt(columns[6], 10)
      },
      iscn: {
        start: parseInt(columns[3], 10),
        stop: parseInt(columns[4], 10)
      },
      px: {
        start: -1,
        stop: -1,
        width: -1
      },
      name: columns[1] + columns[2],
      stain: stain,
      taxid: taxid
    };
  }

  function getStain(columns) {
    var stain = columns[7];
    // For e.g. acen and gvar, columns[8] (density) is undefined
    if (columns[8]) stain += columns[8];
    return stain;
  }

  function updateLines(lines, columns, taxid) {
    var chr, stain, line;

    chr = columns[0];
    if (chr in lines === false) lines[chr] = [];

    stain = getStain(columns);

    line = getLineObject(chr, columns, stain, taxid);
    lines[chr].push(line);

    return lines;
  }

  /**
   * Reports if a cytogenetic band should be included in parse results
   *
   * TODO:
   * Normalize ideogram.chromosomes upstream.
   *
   * This function is complex because ideogram.chromosomes is (likely
   * unnecessarily) complex.  The "ideogram.chromosomes" object can
   * take many forms depending on the use case, and this results in
   * hard-to-reason-about functions like this.
   *
   * Normalizing ideogram.chromosomes to a common format somewhere upstream
   * would likely make this specific function and Ideogram in general much
   * more maintainable.
   */
  function shouldSkipBand(chrs, chr, taxid, ideo) {

    var hasChrs, chrsAreList, chrNotInList, chrsAreObject,
      innerChrsAreStrings, matchingChrObjs, chrNotInObject,
      multiorganism = ideo.config.multiorganism;

    hasChrs = typeof chrs !== 'undefined' && chrs !== null;
    if (!hasChrs) return false;

    chrsAreList = Array.isArray(chrs);
    chrNotInList = chrsAreList && chrs.indexOf(chr) === -1;
    chrsAreObject = typeof chrs === 'object';

    if (chrsAreList && !chrsAreObject && chrNotInList) return true;

    if (taxid in chrs === false && multiorganism) return false;

    if (!multiorganism) {
      // Encountered in single organism when showing subset of all chromosomes,
      // e.g. only human X and Y as in https://eweitz.github.io/ideogram/homology-basic
      matchingChrObjs = chrs.filter(thisChr => thisChr === chr);
      chrNotInObject = matchingChrObjs.length === 0;
    } else {
      innerChrsAreStrings = typeof chrs[taxid][0] === 'string';
      if (innerChrsAreStrings) {
        chrNotInObject = chrs[taxid].includes(chr) === false;
      } else {
        matchingChrObjs = chrs[taxid].filter(thisChr => thisChr.name === chr);
        chrNotInObject = matchingChrObjs.length === 0;
      }
    }
    return chrNotInObject;

  }

  /**
   * Parses cytogenetic band data from a TSV file, or, if band data is
   * prefetched, from an array
   *
   * NCBI:
   * #chromosome arm band iscn_start iscn_stop bp_start bp_stop stain density
   * ftp://ftp.ncbi.nlm.nih.gov/pub/gdp/ideogram_9606_GCF_000001305.14_550_V1
   */
  function parseBands(taxid, chromosomes, ideo) {
    var delimiter, tsvLines, columns, chr, i, init, source, content,
      lines = {};

    content = ideo.bandData[taxid];

    if (Array.isArray(content)) source = 'native';

    chromosomes = updateChromosomes(chromosomes);

    // Destructure assignment fails oddly when transpiled.  2019-05-23
    var result = getDelimiterTsvLinesAndInit(source, content);
    delimiter = result[0];
    tsvLines = result[1];
    init = result[2];

    for (i = init; i < tsvLines.length; i++) {
      columns = tsvLines[i].split(delimiter);

      chr = columns[0];
      if (shouldSkipBand(chromosomes, chr, taxid, ideo)) {
        // If specific chromosomes are configured, then skip processing all
        // other fetched chromosomes.
        continue;
      }

      lines = updateLines(lines, columns, taxid);
    }

    return lines;
  }

  /**
   * @fileoverview Methods for processing chromosome length and banding data.
   *
   * Ideogram.js depicts chromosomes using data on their length, name, and
   * (if dealing with a very well-studied organism) cytogenetic banding data.
   * This file processes cytoband data that comes from biological research
   * institutions.
   *
   * For background on cytogenetic bands and how they are used in genomics, see:
   * https://ghr.nlm.nih.gov/primer/howgeneswork/genelocation
   *
   */

  /**
   * Gets bands array for given chromosomes, sets ideo.maxLength
   */
  function getBandsArray(chromosome, bandsByChr, taxid, ideo) {
    var bands, chrLength,
      bandsArray = [];

    bands = bandsByChr[chromosome];
    bandsArray.push(bands);

    chrLength = {
      iscn: bands[bands.length - 1].iscn.stop,
      bp: bands[bands.length - 1].bp.stop
    };

    if (taxid in ideo.maxLength === false) {
      ideo.maxLength[taxid] = {bp: 0, iscn: 0};
    }

    if (chrLength.iscn > ideo.maxLength[taxid].iscn) {
      ideo.maxLength[taxid].iscn = chrLength.iscn;
      if (chrLength.iscn > ideo.maxLength.iscn) {
        ideo.maxLength.iscn = chrLength.iscn;
      }
    }

    if (chrLength.bp > ideo.maxLength[taxid].bp) {
      ideo.maxLength[taxid].bp = chrLength.bp;
      if (chrLength.bp > ideo.maxLength.bp) {
        ideo.maxLength.bp = chrLength.bp;
      }
    }

    return bandsArray;
  }

  /**
   * Updates bandsArray, sets ideo.config.chromosomes and ideo.numChromosomes
   */
  function setChrsByTaxidsWithBands(taxid, chrs, bandsArray, ideo) {
    var bandsByChr, chromosome, k, chrBandsArray;

    bandsByChr = parseBands(taxid, chrs, ideo);

    chrs = Object.keys(bandsByChr).sort(Ideogram.sortChromosomes);

    if (
      'chromosomes' in ideo.config === false ||
      ideo.config.chromosomes === null
    ) {
      ideo.config.chromosomes = {};
    }
    if (chrs.length > 0) {
      ideo.config.chromosomes[taxid] = chrs.slice();
    }
    ideo.numChromosomes += ideo.config.chromosomes[taxid].length;

    for (k = 0; k < chrs.length; k++) {
      chromosome = chrs[k];
      chrBandsArray = getBandsArray(chromosome, bandsByChr, taxid, ideo);
      bandsArray = bandsArray.concat(chrBandsArray);
    }

    return bandsArray;
  }

  function setChromosomesByTaxid(taxid, chrs, bandsArray, ideo) {
    var chr, i;

    if (
      taxid in ideo.bandData ||
      taxid in organismMetadata &&
      ideo.assemblyIsAccession() === false
    ) {
      bandsArray = setChrsByTaxidsWithBands(taxid, chrs, bandsArray, ideo);
    } else {
      // If lacking band-level data
      ideo.numChromosomes += chrs.length;

      for (i = 0; i < chrs.length; i++) {
        chr = chrs[i];
        if (chr.length > ideo.maxLength.bp) ideo.maxLength.bp = chr.length;
      }
    }

    return bandsArray;
  }

  function reportPerformance$4(t0, ideo) {
    var t1 = new Date().getTime();
    if (ideo.config.debug) {
      console.log('Time in processBandData: ' + (t1 - t0) + ' ms');
    }
  }

  /**
   * Completes default ideogram initialization by calling downstream functions
   * to process raw band data into full JSON objects, render chromosome and
   * cytoband figures and labels, apply initial graphical transformations,
   * hide overlapping band labels, and execute callbacks defined by client code
   */
  function processBandData(taxid) {
    var bandsArray, chrs,
      ideo = this,
      config = ideo.config,
      t0 = new Date().getTime();

    bandsArray = [];

    if ('chromosomes' in config) {
      if (config.multiorganism) {
        // Copy object
        chrs = config.chromosomes;
      } else if (taxid in config.chromosomes) {
        // Copy array by value
        chrs = config.chromosomes[taxid].slice();
      } else {
        // Copy array by value.  Needed for e.g. "Homology, basic"
        chrs = config.chromosomes.slice();
      }
    }

    bandsArray = setChromosomesByTaxid(taxid, chrs, bandsArray, ideo);

    reportPerformance$4(t0, ideo);
    return [taxid, bandsArray];
  }

  /**
   * @fileoverview Methods to create and handle a brush on a chromosome.
   *
   * Ideogram.js enables users to display a box around part of a chromosome
   * that represents a "currently selected" region.  The user can move this
   * box like a sliding window, e.g. by clicking and dragging the mouse.
   *
   * For background, see:
   * https://github.com/d3/d3-brush
   */

  /**
   * Custom event handler, fired upon dragging sliding window on chromosome
   */
  function onBrushMove() {
    call(this.onBrushMoveCallback);
  }

  function onBrushEnd() {
    call(this.onBrushEndCallback);
  }

  function setBrush(bpDomain, pxRange, xOffset, width, ideo) {
    var xScale,
      length = ideo.config.chrHeight;

    xScale = d3.scaleLinear().domain(bpDomain).range(pxRange);

    ideo.brush = d3.brushX()
      .extent([[xOffset, 0], [length + xOffset, width]])
      .on('brush', _onBrushMove)
      .on('end', _onBrushEnd);

    function _onBrushMove({selection}) {
      var extent = selection.map(xScale.invert),
        from = Math.floor(extent[0]),
        to = Math.ceil(extent[1]);

      ideo.selectedRegion = {from: from, to: to, extent: (to - from)};

      if (ideo.onBrushMoveCallback) {
        ideo.onBrushMoveCallback();
      }
    }

    function _onBrushEnd({selection}) {
      if (ideo.onBrushEndCallback) {
        ideo.onBrushEndCallback();
      }
    }
  }

  function getBasePairDomainAndPixelRange(chrModel, xOffset) {
    var band, i,
      bpDomain = [1],
      pxRange = [1],
      lastBand = chrModel.bands.slice(-1)[0];

    for (i = 0; i < chrModel.bands.length; i++) {
      band = chrModel.bands[i];
      bpDomain.push(band.bp.start);
      pxRange.push(band.px.start + xOffset);
    }

    bpDomain.push(lastBand.bp.stop - 1);
    pxRange.push(lastBand.px.stop + xOffset);

    return [bpDomain, pxRange];
  }

  /**
   * Account for calls like createBrush('chr1:104325484-119977655')
   */
  function refineGenomicCoordinates(chr, from, to) {
    var nameSplit, fromToSplit;

    // Account for calls like createBrush('chr1:104325484-119977655')
    nameSplit = chr.split(':');
    fromToSplit = chr.split('-');
    if (nameSplit.length > 1 && fromToSplit.length > 1) {
      chr = nameSplit[0].replace('chr', '');
      fromToSplit = nameSplit[1].split('-');
      from = parseInt(fromToSplit[0]);
      to = parseInt(fromToSplit[1] - 1);
    }

    return [chr, from, to];
  }

  function getChrModel(chr, ideo) {
    var i, cm, chrModel;

    for (i = 0; i < ideo.chromosomesArray.length; i++) {
      cm = ideo.chromosomesArray[i];
      if (cm.name === chr) {
        chrModel = cm;
        return chrModel;
      }
    }
  }

  function writeBrush(chrModel, from, to, xOffset, width, ideo) {
    var x0, x1, yTranslate, yOffset;

    x0 = ideo.convertBpToPx(chrModel, from) + xOffset;
    x1 = ideo.convertBpToPx(chrModel, to) + xOffset;

    yTranslate = ideo._layout.getChromosomeSetYTranslate(0);
    yOffset = yTranslate + (ideo.config.chrWidth - width) / 2;

    d3.select(ideo.selector).append('g')
      .attr('class', 'brush')
      .attr('transform', 'translate(0, ' + yOffset + ')')
      .call(ideo.brush)
      .call(ideo.brush.move, [x0, x1]);
  }

  function setSelectedRegion(from, to, ideo) {
    // Genomics web UIs are 1-based, fully closed.
    // I.e. If start = 20 bp and stop = 10 bp, then extent = 11 bp.
    // Details:
    // http://genome.ucsc.edu/blog/the-ucsc-genome-browser-coordinate-counting-systems/
    // https://www.biostars.org/p/84686/
    var extent = to - from + 1;
    ideo.selectedRegion = {from: from, to: to, extent: extent};
  }

  /**
   * Creates a sliding window along a chromosome
   *
   * @param chr Chromosome name (e.g. 1) or range, e.g. chr1:104325484-119977655
   * @param from Genomic start coordinate in base pairs, e.g. 104325484
   * @param to Genomic end coordinate in base pairs, e.g. 119977655
   */
  function createBrush(chr, from, to) {
    var chrModel, chrLengthBp, bpDomain, pxRange, lastBand,
      ideo = this,
      width = ideo.config.chrWidth + 6.5,
      xOffset = ideo._layout.margin.left;

    [chr, from, to] = refineGenomicCoordinates(chr, from, to);

    chrModel = getChrModel(chr, ideo);

    [bpDomain, pxRange] = getBasePairDomainAndPixelRange(chrModel, xOffset);

    lastBand = chrModel.bands.slice(-1)[0];
    chrLengthBp = lastBand.bp.stop;

    if (typeof from === 'undefined') from = Math.floor(chrLengthBp / 10);
    if (typeof to === 'undefined') to = Math.ceil(from * 2);

    setBrush(bpDomain, pxRange, xOffset, width, ideo);

    setSelectedRegion(from, to, ideo);
    writeBrush(chrModel, from, to, xOffset, width, ideo);
  }

  /**
   * @fileoverview Allows a click event handler to be attached to the ideogram
   *
   * This works similar to the "brush" which allows a region to be selected.
   * The click handler does not allow a region, but a precise location.
   *
   */

  /**
   * Custom event handler, fired upon clicks on the chromosome (to change
   * position)
   */
  function onCursorMove() {
    call(this.onCursorMoveCallback);
  }

  function setCursor(position, bpDomain, pxRange, xOffset, width, ideo) {
    var xScale;

    xScale = d3.scaleLinear().domain(bpDomain).range(pxRange);

    if (!('rotatable' in ideo.config && ideo.config.rotatable === false)) {
      console.warn('Using the cursor with rotate is not supported.');
    }

    var yTranslate = ideo._layout.getChromosomeSetYTranslate(0);
    var yOffset = yTranslate + (ideo.config.chrWidth - width) / 2;

    // TODO: check if newPosition is valid value (in range)

    var cursorBrush = d3.select(ideo.selector).append('g')
      .attr('class', 'brush')
      .attr('transform', 'translate(0, ' + yOffset + ')')
      .append('rect')
      .attr('class', 'cursor')
      .attr('x', xScale(position))
      .attr('y', 0)
      .attr('width', 1) // this could be a configuration param
      .attr('height', 30); // MAGIC NUMBER! need help with this one

    // call the callback for the first time (onLoad)
    if (ideo.onCursorMove) {
      ideo.onCursorMoveCallback(position);
    }

    if (!ideo.setCursorPosition) {
      ideo.setCursorPosition = function(newPosition) {
        // TODO: check if newPosition is valid value (in range)
        cursorBrush.attr('x', xScale(newPosition));
        if (ideo.onCursorMove) {
          ideo.onCursorMoveCallback(newPosition);
        }
      };
    }

    d3.selectAll(ideo.selector + ' .chromosome').on('click', function(event) {
      var x = event.offsetX; // minimum value seems to be 25

      // adjust for screen (6 is a magic number that seems to work)
      x -=6;

      // move the cursor
      cursorBrush.attr('x', x);

      // calculate the new position and perform callback
      var newPosition = Math.floor(xScale.invert(x));
      if (ideo.onCursorMove) {
        ideo.onCursorMoveCallback(newPosition);
      }
    });
  }

  function getBasePairDomainAndPixelRange$1(chrModel, xOffset) {
    var band, i,
      bpDomain = [1],
      pxRange = [1],
      lastBand = chrModel.bands.slice(-1)[0];

    for (i = 0; i < chrModel.bands.length; i++) {
      band = chrModel.bands[i];
      bpDomain.push(band.bp.start);
      pxRange.push(band.px.start + xOffset);
    }

    bpDomain.push(lastBand.bp.stop - 1);
    pxRange.push(lastBand.px.stop + xOffset);

    return [bpDomain, pxRange];
  }

  function getChrModel$1(chr, ideo) {
    var i, cm, chrModel;

    for (i = 0; i < ideo.chromosomesArray.length; i++) {
      cm = ideo.chromosomesArray[i];
      if (cm.name === chr) {
        chrModel = cm;
        return chrModel;
      }
    }
  }

  /**
   * Creates a clickable cursor along a chromosome.
   *
   * @param position Genomic start coordinate in base pairs, e.g. 104325484
   */
  function createClickCursor(position) {
    var chrModel, bpDomain,
      pxRange,
      ideo = this,
      width = ideo.config.chrWidth + 6.5, // 6.5 magic number?
      xOffset = ideo._layout.margin.left;

    if (typeof position === 'undefined') {
      return false;
    }

    chrModel = getChrModel$1(ideo.config.chromosome, ideo);
    [bpDomain, pxRange] = getBasePairDomainAndPixelRange$1(chrModel, xOffset);

    // call setCursor to complete the job.
    setCursor(position, bpDomain, pxRange, xOffset, width, ideo);
  }

  /**
   * @fileoverview Instance methods for sex chromosomes (allosomes).
   *
   * This module provides methods for drawing karyotypically normal
   * male and female mammalian genomes.
   */

  /**
   * Appends SVG elements depicting sex chromosomes to the document.
   */
  function drawSexChromosomes(container, chrIndex) {
    var bandsArray, taxid, chrs,
      sexChromosomeIndexes, sciLength,
      chromosome, bands, chrModel, sci, homologIndex;

    bandsArray = this.bandsArray;
    taxid = this.config.taxid;
    chrs = this.config.chromosomes[taxid];

    if (this.config.sex === 'male') {
      sexChromosomeIndexes = [1, 0];
    } else {
      sexChromosomeIndexes = [0, 0];
    }

    sciLength = sexChromosomeIndexes.length;

    for (homologIndex = 0; homologIndex < sciLength; homologIndex++) {
      sci = sexChromosomeIndexes[homologIndex] + chrIndex;
      chromosome = chrs[sci];
      bands = bandsArray[taxid][sci];
      chrModel = this.getChromosomeModel(bands, chromosome, taxid, sci);
      this.appendHomolog(chrModel, chrIndex, homologIndex, container);
    }
  }

  /**
   * Sets instance properties regarding sex chromosomes.
   * Currently only supported for mammals.
   * TODO: Support all sexually reproducing taxa
   *   XY sex-determination (mammals):
   *     - Male: XY <- heterogametic
   *     - Female: XX
   *   ZW sex-determination (birds):
   *     - Male: ZZ
   *     - Female: ZW <- heterogametic
   *   X0 sex-determination (some insects):
   *     - Male: X0, i.e. only X <- heterogametic?
   *     - Female: XX
   * TODO: Support sex chromosome aneuploidies in mammals
   *     - Turner syndrome: X0
   *     - Klinefelter syndome: XXY
   *  More types:
   *  https://en.wikipedia.org/wiki/Category:Sex_chromosome_aneuploidies
   */
  function setSexChromosomes(chrs) {
    var chr, i,
      ideo = this,
      sexChrs = {X: 1, Y: 1};

    if (this.config.ploidy !== 2 || !this.config.sex) return;

    ideo.sexChromosomes.list = [];

    for (i = 0; i < chrs.length; i++) {
      chr = chrs[i];
      if (ideo.config.sex === 'male' && chr in sexChrs) {
        ideo.sexChromosomes.list.push(chr);
        if (!ideo.sexChromosomes.index) {
          ideo.sexChromosomes.index = i;
        }
      } else if (chr === 'X') {
        ideo.sexChromosomes.list.push(chr, chr);
        ideo.sexChromosomes.index = i;
      }
    }
  }

  /**
   * @fileoverview Methods to convert to and from different types of coordinates.
   *
   * Ideogram.js uses multiple coordinate systems, e.g. base pairs (bp) and
   * pixels (px).  These methods interconvert between those coordinate systems.
   *
   * TODO:
   * - Add methods to interconvert between ISCN coordinates and base pairs,
   * pixels.
   */

  function throwBpToPxError(bp, chr, band) {
    throw new Error(
      'Base pair out of range.  ' +
      'bp: ' + bp + '; length of chr' + chr.name + ': ' + band.bp.stop
    );
  }

  function getPx(chr, bp) {
    var i, px, band, bpToIscnScale, iscn, iscnStart, iscnStop, iscnLength,
      bpStart, bpStop, bpLength, pxStart, pxLength;

    for (i = 0; i < chr.bands.length; i++) {
      band = chr.bands[i];
      bpStart = band.bp.start;
      bpStop = band.bp.stop;
      bpLength = bpStop - bpStart;
      iscnStart = band.iscn.start;
      iscnStop = band.iscn.stop;
      iscnLength = iscnStop - iscnStart;
      pxStart = band.px.start;
      pxLength = band.px.width;

      if (bp >= bpStart && bp <= bpStop) {
        bpToIscnScale = iscnLength / bpLength;
        iscn = iscnStart + (bp - bpStart) * bpToIscnScale;
        px = pxStart + (pxLength * (iscn - iscnStart) / (iscnLength));

        return [px, band];
      }
    }
    return [null, band];
  }

  /**
   * Converts base pair coordinates to pixel offsets.
   * Bp-to-pixel scales differ among cytogenetic bands.
   *
   * For example, if we want to depict a gene on a chromosome, then we need
   * to convert the gene's location in base pairs to a location in pixels offset
   * from the start of the chromosome.
   */
  function convertBpToPx(chr, bp) {
    var band, px;

    if (chr.bands.length > 1 || chr.name === 'MT') {
      [px, band] = getPx(chr, bp);
      if (px !== null) return px;
    } else if (bp >= 1 && bp <= chr.length) {
      px = chr.scale.bp * bp;
      return px;
    }

    throwBpToPxError(bp, chr, band);
  }

  function throwPxToBpError(px, chr, pxStop) {
    throw new Error(
      'Pixel out of range.  ' +
      'px: ' + px + '; length of chr' + chr.name + ': ' + pxStop
    );
  }

  function getBp(iscnStop, iscnStart, px, pxStop, pxStart, band, iscnLength) {
    var pxLength, bpLength, pxToIscnScale, iscn, bp;

    iscnLength = iscnStop - iscnStart;
    pxLength = pxStop - pxStart;
    bpLength = band.bp.stop - band.bp.start;

    pxToIscnScale = iscnLength / pxLength;
    iscn = iscnStart + (px - pxStart) * pxToIscnScale;

    bp = band.bp.start + (bpLength * (iscn - iscnStart) / iscnLength);

    return Math.round(bp);
  }

  /**
   * Converts pixel offsets to base pair coordinates.
   * Pixel-to-bp scales differ among cytogenetic bands.
   *
   * For example, if we want to determine the genomic location a user clicked on
   * (e.g. when creating a brush / sliding window region), then we need to
   * convert pixels to base pairs.
   */
  function convertPxToBp(chr, px) {
    var i, band, bp, pxStart, pxStop, iscnStart, iscnStop, iscnLength;

    if (px === 0) {
      px = chr.bands[0].px.start;
    }

    for (i = 0; i < chr.bands.length; i++) {
      band = chr.bands[i];

      pxStart = band.px.start;
      pxStop = band.px.stop;
      iscnStart = band.iscn.start;
      iscnStop = band.iscn.stop;

      if (px >= pxStart && px <= pxStop) {
        bp = getBp(iscnStop, iscnStart, px, pxStop, pxStart, band, iscnLength);
        return bp;
      }
    }
    throwPxToBpError(px, chr, pxStop);
  }

  let array8 = arrayUntyped,
      array16 = arrayUntyped,
      array32 = arrayUntyped,
      arrayLengthen = arrayLengthenUntyped,
      arrayWiden = arrayWidenUntyped;
  if (typeof Uint8Array !== "undefined") {
    array8 = function(n) { return new Uint8Array(n); };
    array16 = function(n) { return new Uint16Array(n); };
    array32 = function(n) { return new Uint32Array(n); };

    arrayLengthen = function(array, length) {
      if (array.length >= length) return array;
      var copy = new array.constructor(length);
      copy.set(array);
      return copy;
    };

    arrayWiden = function(array, width) {
      var copy;
      switch (width) {
        case 16: copy = array16(array.length); break;
        case 32: copy = array32(array.length); break;
        default: throw new Error("invalid array width!");
      }
      copy.set(array);
      return copy;
    };
  }

  function arrayUntyped(n) {
    var array = new Array(n), i = -1;
    while (++i < n) array[i] = 0;
    return array;
  }

  function arrayLengthenUntyped(array, length) {
    var n = array.length;
    while (n < length) array[n++] = 0;
    return array;
  }

  function arrayWidenUntyped(array, width) {
    if (width > 32) throw new Error("invalid array width!");
    return array;
  }

  // An arbitrarily-wide array of bitmasks
  function bitarray(n) {
    this.length = n;
    this.subarrays = 1;
    this.width = 8;
    this.masks = {
      0: 0
    };

    this[0] = array8(n);
  }

  bitarray.prototype.lengthen = function(n) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      this[i] = arrayLengthen(this[i], n);
    }
    this.length = n;
  };

  // Reserve a new bit index in the array, returns {offset, one}
  bitarray.prototype.add = function() {
    var m, w, one, i, len;

    for (i = 0, len = this.subarrays; i < len; ++i) {
      m = this.masks[i];
      w = this.width - (32 * i);
      // isolate the rightmost zero bit and return it as an unsigned int of 32 bits, if NaN or -1, return a 0 
      one = (~m & (m + 1)) >>> 0;

      if (w >= 32 && !one) {
        continue;
      }

      if (w < 32 && (one & (1 << w))) {
        // widen this subarray
        this[i] = arrayWiden(this[i], w <<= 1);
        this.width = 32 * i + w;
      }

      this.masks[i] |= one;

      return {
        offset: i,
        one: one
      };
    }

    // add a new subarray
    this[this.subarrays] = array8(this.length);
    this.masks[this.subarrays] = 1;
    this.width += 8;
    return {
      offset: this.subarrays++,
      one: 1
    };
  };

  // Copy record from index src to index dest
  bitarray.prototype.copy = function(dest, src) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      this[i][dest] = this[i][src];
    }
  };

  // Truncate the array to the given length
  bitarray.prototype.truncate = function(n) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      for (var j = this.length - 1; j >= n; j--) {
        this[i][j] = 0;
      }
    }
    this.length = n;
  };

  // Checks that all bits for the given index are 0
  bitarray.prototype.zero = function(n) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      if (this[i][n]) {
        return false;
      }
    }
    return true;
  };

  // Checks that all bits for the given index are 0 except for possibly one
  bitarray.prototype.zeroExcept = function(n, offset, zero) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      if (i === offset ? this[i][n] & zero : this[i][n]) {
        return false;
      }
    }
    return true;
  };

  // Checks that all bits for the given index are 0 except for the specified mask.
  // The mask should be an array of the same size as the filter subarrays width.
  bitarray.prototype.zeroExceptMask = function(n, mask) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      if (this[i][n] & mask[i]) {
        return false;
      }
    }
    return true;
  };

  // Checks that only the specified bit is set for the given index
  bitarray.prototype.only = function(n, offset, one) {
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      if (this[i][n] != (i === offset ? one : 0)) {
        return false;
      }
    }
    return true;
  };

  // Checks that only the specified bit is set for the given index except for possibly one other
  bitarray.prototype.onlyExcept = function(n, offset, zero, onlyOffset, onlyOne) {
    var mask;
    var i, len;
    for (i = 0, len = this.subarrays; i < len; ++i) {
      mask = this[i][n];
      if (i === offset)
        mask &= zero;
      if (mask != (i === onlyOffset ? onlyOne : 0)) {
        return false;
      }
    }
    return true;
  };

  var xfilterArray = {
    array8: arrayUntyped,
    array16: arrayUntyped,
    array32: arrayUntyped,
    arrayLengthen: arrayLengthenUntyped,
    arrayWiden: arrayWidenUntyped,
    bitarray: bitarray
  };

  const filterExact = (bisect, value) => {
    return function(values) {
      var n = values.length;
      return [bisect.left(values, value, 0, n), bisect.right(values, value, 0, n)];
    };
  };

  const filterRange = (bisect, range) => {
    var min = range[0],
        max = range[1];
    return function(values) {
      var n = values.length;
      return [bisect.left(values, min, 0, n), bisect.left(values, max, 0, n)];
    };
  };

  const filterAll = values => {
    return [0, values.length];
  };

  var xfilterFilter = {
    filterExact,
    filterRange,
    filterAll
  };

  var cr_identity = d => {
    return d;
  };

  var cr_null = () =>  {
    return null;
  };

  var cr_zero = () => {
    return 0;
  };

  function heap_by(f) {

    // Builds a binary heap within the specified array a[lo:hi]. The heap has the
    // property such that the parent a[lo+i] is always less than or equal to its
    // two children: a[lo+2*i+1] and a[lo+2*i+2].
    function heap(a, lo, hi) {
      var n = hi - lo,
          i = (n >>> 1) + 1;
      while (--i > 0) sift(a, i, n, lo);
      return a;
    }

    // Sorts the specified array a[lo:hi] in descending order, assuming it is
    // already a heap.
    function sort(a, lo, hi) {
      var n = hi - lo,
          t;
      while (--n > 0) t = a[lo], a[lo] = a[lo + n], a[lo + n] = t, sift(a, 1, n, lo);
      return a;
    }

    // Sifts the element a[lo+i-1] down the heap, where the heap is the contiguous
    // slice of array a[lo:lo+n]. This method can also be used to update the heap
    // incrementally, without incurring the full cost of reconstructing the heap.
    function sift(a, i, n, lo) {
      var d = a[--lo + i],
          x = f(d),
          child;
      while ((child = i << 1) <= n) {
        if (child < n && f(a[lo + child]) > f(a[lo + child + 1])) child++;
        if (x <= f(a[lo + child])) break;
        a[lo + i] = a[lo + child];
        i = child;
      }
      a[lo + i] = d;
    }

    heap.sort = sort;
    return heap;
  }

  const h = heap_by(cr_identity);
  h.by = heap_by;

  function heapselect_by(f) {
    var heap = h.by(f);

    // Returns a new array containing the top k elements in the array a[lo:hi].
    // The returned array is not sorted, but maintains the heap property. If k is
    // greater than hi - lo, then fewer than k elements will be returned. The
    // order of elements in a is unchanged by this operation.
    function heapselect(a, lo, hi, k) {
      var queue = new Array(k = Math.min(hi - lo, k)),
          min,
          i,
          d;

      for (i = 0; i < k; ++i) queue[i] = a[lo++];
      heap(queue, 0, k);

      if (lo < hi) {
        min = f(queue[0]);
        do {
          if (f(d = a[lo]) > min) {
            queue[0] = d;
            min = f(heap(queue, 0, k)[0]);
          }
        } while (++lo < hi);
      }

      return queue;
    }

    return heapselect;
  }


  const h$1 = heapselect_by(cr_identity);
  h$1.by = heapselect_by; // assign the raw function to the export as well

  function bisect_by(f) {

    // Locate the insertion point for x in a to maintain sorted order. The
    // arguments lo and hi may be used to specify a subset of the array which
    // should be considered; by default the entire array is used. If x is already
    // present in a, the insertion point will be before (to the left of) any
    // existing entries. The return value is suitable for use as the first
    // argument to `array.splice` assuming that a is already sorted.
    //
    // The returned insertion point i partitions the array a into two halves so
    // that all v < x for v in a[lo:i] for the left side and all v >= x for v in
    // a[i:hi] for the right side.
    function bisectLeft(a, x, lo, hi) {
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (f(a[mid]) < x) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    }

    // Similar to bisectLeft, but returns an insertion point which comes after (to
    // the right of) any existing entries of x in a.
    //
    // The returned insertion point i partitions the array into two halves so that
    // all v <= x for v in a[lo:i] for the left side and all v > x for v in
    // a[i:hi] for the right side.
    function bisectRight(a, x, lo, hi) {
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (x < f(a[mid])) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }

    bisectRight.right = bisectRight;
    bisectRight.left = bisectLeft;
    return bisectRight;
  }

  const bisect = bisect_by(cr_identity);
  bisect.by = bisect_by; // assign the raw function to the export as well

  var permute = (array, index, deep) => {
    for (var i = 0, n = index.length, copy = deep ? JSON.parse(JSON.stringify(array)) : new Array(n); i < n; ++i) {
      copy[i] = array[index[i]];
    }
    return copy;
  };

  const reduceIncrement = p => {
    return p + 1;
  };

  const reduceDecrement = p => {
    return p - 1;
  };

  const reduceAdd = f => {
    return function(p, v) {
      return p + +f(v);
    };
  };

  const reduceSubtract = f => {
    return function(p, v) {
      return p - f(v);
    };
  };

  var xfilterReduce = {
    reduceIncrement,
    reduceDecrement,
    reduceAdd,
    reduceSubtract
  };

  function deep(t,e,i,n,r){for(r in n=(i=i.split(".")).splice(-1,1),i)e=e[i[r]]=e[i[r]]||{};return t(e,n)}

  // Note(cg): result was previsouly using lodash.result, not ESM compatible.
   
  const get$2 = (obj, prop) => {
    const value = obj[prop];
    return (typeof value === 'function') ? value.call(obj) : value;
  };

  /**
   * get value of object at a deep path.
   * if the resolved value is a function,
   * it's invoked with the `this` binding of 
   * its parent object and its result is returned. 
   *  
   * @param  {Object} obj  the object (e.g. { 'a': [{ 'b': { 'c1': 3, 'c2': 4} }], 'd': {e:1} }; )
   * @param  {String} path deep path (e.g. `d.e`` or `a[0].b.c1`. Dot notation (a.0.b)is also supported)
   * @return {Any}      the resolved value
   */
  const reg = /\[([\w\d]+)\]/g;
  var result = (obj, path) => {
    return deep(get$2, obj, path.replace(reg, '.$1'))
  };

  // constants
  var REMOVED_INDEX = -1;

  crossfilter.heap = h;
  crossfilter.heapselect = h$1;
  crossfilter.bisect = bisect;
  crossfilter.permute = permute;

  function crossfilter() {
    var crossfilter = {
      add: add,
      remove: removeData,
      dimension: dimension,
      groupAll: groupAll,
      size: size,
      all: all,
      allFiltered: allFiltered,
      onChange: onChange,
      isElementFiltered: isElementFiltered
    };

    var data = [], // the records
        n = 0, // the number of records; data.length
        filters, // 1 is filtered out
        filterListeners = [], // when the filters change
        dataListeners = [], // when data is added
        removeDataListeners = [], // when data is removed
        callbacks = [];

    filters = new xfilterArray.bitarray(0);

    // Adds the specified new records to this crossfilter.
    function add(newData) {
      var n0 = n,
          n1 = newData.length;

      // If there's actually new data to add…
      // Merge the new data into the existing data.
      // Lengthen the filter bitset to handle the new records.
      // Notify listeners (dimensions and groups) that new data is available.
      if (n1) {
        data = data.concat(newData);
        filters.lengthen(n += n1);
        dataListeners.forEach(function(l) { l(newData, n0, n1); });
        triggerOnChange('dataAdded');
      }

      return crossfilter;
    }

    // Removes all records that match the current filters, or if a predicate function is passed,
    // removes all records matching the predicate (ignoring filters).
    function removeData(predicate) {
      var // Mapping from old record indexes to new indexes (after records removed)
          newIndex = new Array(n),
          removed = [],
          usePred = typeof predicate === 'function',
          shouldRemove = function (i) {
            return usePred ? predicate(data[i], i) : filters.zero(i)
          };

      for (var index1 = 0, index2 = 0; index1 < n; ++index1) {
        if ( shouldRemove(index1) ) {
          removed.push(index1);
          newIndex[index1] = REMOVED_INDEX;
        } else {
          newIndex[index1] = index2++;
        }
      }

      // Remove all matching records from groups.
      filterListeners.forEach(function(l) { l(-1, -1, [], removed, true); });

      // Update indexes.
      removeDataListeners.forEach(function(l) { l(newIndex); });

      // Remove old filters and data by overwriting.
      for (var index3 = 0, index4 = 0; index3 < n; ++index3) {
        if ( newIndex[index3] !== REMOVED_INDEX ) {
          if (index3 !== index4) filters.copy(index4, index3), data[index4] = data[index3];
          ++index4;
        }
      }

      data.length = n = index4;
      filters.truncate(index4);
      triggerOnChange('dataRemoved');
    }

    function maskForDimensions(dimensions) {
      var n,
          d,
          len,
          id,
          mask = Array(filters.subarrays);
      for (n = 0; n < filters.subarrays; n++) { mask[n] = ~0; }
      for (d = 0, len = dimensions.length; d < len; d++) {
        // The top bits of the ID are the subarray offset and the lower bits are the bit
        // offset of the "one" mask.
        id = dimensions[d].id();
        mask[id >> 7] &= ~(0x1 << (id & 0x3f));
      }
      return mask;
    }

    // Return true if the data element at index i is filtered IN.
    // Optionally, ignore the filters of any dimensions in the ignore_dimensions list.
    function isElementFiltered(i, ignore_dimensions) {
      var mask = maskForDimensions(ignore_dimensions || []);
      return filters.zeroExceptMask(i,mask);
    }

    // Adds a new dimension with the specified value accessor function.
    function dimension(value, iterable) {

      if (typeof value === 'string') {
        var accessorPath = value;
        value = function(d) { return result(d, accessorPath); };
      }

      var dimension = {
        filter: filter,
        filterExact: filterExact,
        filterRange: filterRange,
        filterFunction: filterFunction,
        filterAll: filterAll,
        currentFilter: currentFilter,
        hasCurrentFilter: hasCurrentFilter,
        top: top,
        bottom: bottom,
        group: group,
        groupAll: groupAll,
        dispose: dispose,
        remove: dispose, // for backwards-compatibility
        accessor: value,
        id: function() { return id; }
      };

      var one, // lowest unset bit as mask, e.g., 00001000
          zero, // inverted one, e.g., 11110111
          offset, // offset into the filters arrays
          id, // unique ID for this dimension (reused when dimensions are disposed)
          values, // sorted, cached array
          index, // maps sorted value index -> record index (in data)
          newValues, // temporary array storing newly-added values
          newIndex, // temporary array storing newly-added index
          iterablesIndexCount,
          iterablesIndexFilterStatus,
          iterablesEmptyRows = [],
          sortRange = function(n) {
            return cr_range(n).sort(function(A, B) {
              var a = newValues[A], b = newValues[B];
              return a < b ? -1 : a > b ? 1 : A - B;
            });
          },
          refilter = xfilterFilter.filterAll, // for recomputing filter
          refilterFunction, // the custom filter function in use
          filterValue, // the value used for filtering (value, array, function or undefined)
          filterValuePresent, // true if filterValue contains something
          indexListeners = [], // when data is added
          dimensionGroups = [],
          lo0 = 0,
          hi0 = 0,
          t = 0,
          k;

      // Updating a dimension is a two-stage process. First, we must update the
      // associated filters for the newly-added records. Once all dimensions have
      // updated their filters, the groups are notified to update.
      dataListeners.unshift(preAdd);
      dataListeners.push(postAdd);

      removeDataListeners.push(removeData);

      // Add a new dimension in the filter bitmap and store the offset and bitmask.
      var tmp = filters.add();
      offset = tmp.offset;
      one = tmp.one;
      zero = ~one;

      // Create a unique ID for the dimension
      // IDs will be re-used if dimensions are disposed.
      // For internal use the ID is the subarray offset shifted left 7 bits or'd with the
      // bit offset of the set bit in the dimension's "one" mask.
      id = (offset << 7) | (Math.log(one) / Math.log(2));

      preAdd(data, 0, n);
      postAdd(data, 0, n);

      // Incorporates the specified new records into this dimension.
      // This function is responsible for updating filters, values, and index.
      function preAdd(newData, n0, n1) {
        var newIterablesIndexCount,
            newIterablesIndexFilterStatus;

        if (iterable){
          // Count all the values
          t = 0;
          j = 0;
          k = [];

          for (var i0 = 0; i0 < newData.length; i0++) {
            for(j = 0, k = value(newData[i0]); j < k.length; j++) {
              t++;
            }
          }

          newValues = [];
          newIterablesIndexCount = cr_range(newData.length);
          newIterablesIndexFilterStatus = cr_index(t,1);
          var unsortedIndex = cr_range(t);

          for (var l = 0, index1 = 0; index1 < newData.length; index1++) {
            k = value(newData[index1]);
            //
            if(!k.length){
              newIterablesIndexCount[index1] = 0;
              iterablesEmptyRows.push(index1 + n0);
              continue;
            }
            newIterablesIndexCount[index1] = k.length;
            for (j = 0; j < k.length; j++) {
              newValues.push(k[j]);
              unsortedIndex[l] = index1;
              l++;
            }
          }

          // Create the Sort map used to sort both the values and the valueToData indices
          var sortMap = sortRange(t);

          // Use the sortMap to sort the newValues
          newValues = permute(newValues, sortMap);


          // Use the sortMap to sort the unsortedIndex map
          // newIndex should be a map of sortedValue -> crossfilterData
          newIndex = permute(unsortedIndex, sortMap);

        } else {
          // Permute new values into natural order using a standard sorted index.
          newValues = newData.map(value);
          newIndex = sortRange(n1);
          newValues = permute(newValues, newIndex);
        }

        // Bisect newValues to determine which new records are selected.
        var bounds = refilter(newValues), lo1 = bounds[0], hi1 = bounds[1];

        var index2, index3, index4;
        if(iterable) {
          n1 = t;
          if (refilterFunction) {
            for (index2 = 0; index2 < n1; ++index2) {
              if (!refilterFunction(newValues[index2], index2)) {
                if(--newIterablesIndexCount[newIndex[index2]] === 0) {
                  filters[offset][newIndex[index2] + n0] |= one;
                }
                newIterablesIndexFilterStatus[index2] = 1;
              }
            }
          } else {
            for (index3 = 0; index3 < lo1; ++index3) {
              if(--newIterablesIndexCount[newIndex[index3]] === 0) {
                filters[offset][newIndex[index3] + n0] |= one;
              }
              newIterablesIndexFilterStatus[index3] = 1;
            }
            for (index4 = hi1; index4 < n1; ++index4) {
              if(--newIterablesIndexCount[newIndex[index4]] === 0) {
                filters[offset][newIndex[index4] + n0] |= one;
              }
              newIterablesIndexFilterStatus[index4] = 1;
            }
          }
        } else {
          if (refilterFunction) {
            for (index2 = 0; index2 < n1; ++index2) {
              if (!refilterFunction(newValues[index2], index2)) {
                filters[offset][newIndex[index2] + n0] |= one;
              }
            }
          } else {
            for (index3 = 0; index3 < lo1; ++index3) {
              filters[offset][newIndex[index3] + n0] |= one;
            }
            for (index4 = hi1; index4 < n1; ++index4) {
              filters[offset][newIndex[index4] + n0] |= one;
            }
          }
        }

        // If this dimension previously had no data, then we don't need to do the
        // more expensive merge operation; use the new values and index as-is.
        if (!n0) {
          values = newValues;
          index = newIndex;
          iterablesIndexCount = newIterablesIndexCount;
          iterablesIndexFilterStatus = newIterablesIndexFilterStatus;
          lo0 = lo1;
          hi0 = hi1;
          return;
        }



        var oldValues = values,
          oldIndex = index,
          oldIterablesIndexFilterStatus = iterablesIndexFilterStatus,
          old_n0,
          i1 = 0;

        i0 = 0;

        if(iterable){
          old_n0 = n0;
          n0 = oldValues.length;
          n1 = t;
        }

        // Otherwise, create new arrays into which to merge new and old.
        values = iterable ? new Array(n0 + n1) : new Array(n);
        index = iterable ? new Array(n0 + n1) : cr_index(n, n);
        if(iterable) iterablesIndexFilterStatus = cr_index(n0 + n1, 1);

        // Concatenate the newIterablesIndexCount onto the old one.
        if(iterable) {
          var oldiiclength = iterablesIndexCount.length;
          iterablesIndexCount = xfilterArray.arrayLengthen(iterablesIndexCount, n);
          for(var j=0; j+oldiiclength < n; j++) {
            iterablesIndexCount[j+oldiiclength] = newIterablesIndexCount[j];
          }
        }

        // Merge the old and new sorted values, and old and new index.
        var index5 = 0;
        for (; i0 < n0 && i1 < n1; ++index5) {
          if (oldValues[i0] < newValues[i1]) {
            values[index5] = oldValues[i0];
            if(iterable) iterablesIndexFilterStatus[index5] = oldIterablesIndexFilterStatus[i0];
            index[index5] = oldIndex[i0++];
          } else {
            values[index5] = newValues[i1];
            if(iterable) iterablesIndexFilterStatus[index5] = newIterablesIndexFilterStatus[i1];
            index[index5] = newIndex[i1++] + (iterable ? old_n0 : n0);
          }
        }

        // Add any remaining old values.
        for (; i0 < n0; ++i0, ++index5) {
          values[index5] = oldValues[i0];
          if(iterable) iterablesIndexFilterStatus[index5] = oldIterablesIndexFilterStatus[i0];
          index[index5] = oldIndex[i0];
        }

        // Add any remaining new values.
        for (; i1 < n1; ++i1, ++index5) {
          values[index5] = newValues[i1];
          if(iterable) iterablesIndexFilterStatus[index5] = newIterablesIndexFilterStatus[i1];
          index[index5] = newIndex[i1] + (iterable ? old_n0 : n0);
        }

        // Bisect again to recompute lo0 and hi0.
        bounds = refilter(values), lo0 = bounds[0], hi0 = bounds[1];
      }

      // When all filters have updated, notify index listeners of the new values.
      function postAdd(newData, n0, n1) {
        indexListeners.forEach(function(l) { l(newValues, newIndex, n0, n1); });
        newValues = newIndex = null;
      }

      function removeData(reIndex) {
        if (iterable) {
          for (var i0 = 0, i1 = 0; i0 < iterablesEmptyRows.length; i0++) {
            if (reIndex[iterablesEmptyRows[i0]] !== REMOVED_INDEX) {
              iterablesEmptyRows[i1] = reIndex[iterablesEmptyRows[i0]];
              i1++;
            }
          }
          iterablesEmptyRows.length = i1;
          for (i0 = 0, i1 = 0; i0 < n; i0++) {
            if (reIndex[i0] !== REMOVED_INDEX) {
              if (i1 !== i0) iterablesIndexCount[i1] = iterablesIndexCount[i0];
              i1++;
            }
          }
          iterablesIndexCount = iterablesIndexCount.slice(0, i1);
        }
        // Rewrite our index, overwriting removed values
        var n0 = values.length;
        for (var i = 0, j = 0, oldDataIndex; i < n0; ++i) {
          oldDataIndex = index[i];
          if (reIndex[oldDataIndex] !== REMOVED_INDEX) {
            if (i !== j) values[j] = values[i];
            index[j] = reIndex[oldDataIndex];
            if (iterable) {
              iterablesIndexFilterStatus[j] = iterablesIndexFilterStatus[i];
            }
            ++j;
          }
        }
        values.length = j;
        if (iterable) iterablesIndexFilterStatus = iterablesIndexFilterStatus.slice(0, j);
        while (j < n0) index[j++] = 0;

        // Bisect again to recompute lo0 and hi0.
        var bounds = refilter(values);
        lo0 = bounds[0], hi0 = bounds[1];
      }

      // Updates the selected values based on the specified bounds [lo, hi].
      // This implementation is used by all the public filter methods.
      function filterIndexBounds(bounds) {

        var lo1 = bounds[0],
            hi1 = bounds[1];

        if (refilterFunction) {
          refilterFunction = null;
          filterIndexFunction(function(d, i) { return lo1 <= i && i < hi1; }, bounds[0] === 0 && bounds[1] === values.length);
          lo0 = lo1;
          hi0 = hi1;
          return dimension;
        }

        var i,
            j,
            k,
            added = [],
            removed = [],
            valueIndexAdded = [],
            valueIndexRemoved = [];


        // Fast incremental update based on previous lo index.
        if (lo1 < lo0) {
          for (i = lo1, j = Math.min(lo0, hi1); i < j; ++i) {
            added.push(index[i]);
            valueIndexAdded.push(i);
          }
        } else if (lo1 > lo0) {
          for (i = lo0, j = Math.min(lo1, hi0); i < j; ++i) {
            removed.push(index[i]);
            valueIndexRemoved.push(i);
          }
        }

        // Fast incremental update based on previous hi index.
        if (hi1 > hi0) {
          for (i = Math.max(lo1, hi0), j = hi1; i < j; ++i) {
            added.push(index[i]);
            valueIndexAdded.push(i);
          }
        } else if (hi1 < hi0) {
          for (i = Math.max(lo0, hi1), j = hi0; i < j; ++i) {
            removed.push(index[i]);
            valueIndexRemoved.push(i);
          }
        }

        if(!iterable) {
          // Flip filters normally.

          for(i=0; i<added.length; i++) {
            filters[offset][added[i]] ^= one;
          }

          for(i=0; i<removed.length; i++) {
            filters[offset][removed[i]] ^= one;
          }

        } else {
          // For iterables, we need to figure out if the row has been completely removed vs partially included
          // Only count a row as added if it is not already being aggregated. Only count a row
          // as removed if the last element being aggregated is removed.

          var newAdded = [];
          var newRemoved = [];
          for (i = 0; i < added.length; i++) {
            iterablesIndexCount[added[i]]++;
            iterablesIndexFilterStatus[valueIndexAdded[i]] = 0;
            if(iterablesIndexCount[added[i]] === 1) {
              filters[offset][added[i]] ^= one;
              newAdded.push(added[i]);
            }
          }
          for (i = 0; i < removed.length; i++) {
            iterablesIndexCount[removed[i]]--;
            iterablesIndexFilterStatus[valueIndexRemoved[i]] = 1;
            if(iterablesIndexCount[removed[i]] === 0) {
              filters[offset][removed[i]] ^= one;
              newRemoved.push(removed[i]);
            }
          }

          added = newAdded;
          removed = newRemoved;

          // Now handle empty rows.
          if(refilter === xfilterFilter.filterAll) {
            for(i = 0; i < iterablesEmptyRows.length; i++) {
              if((filters[offset][k = iterablesEmptyRows[i]] & one)) {
                // Was not in the filter, so set the filter and add
                filters[offset][k] ^= one;
                added.push(k);
              }
            }
          } else {
            // filter in place - remove empty rows if necessary
            for(i = 0; i < iterablesEmptyRows.length; i++) {
              if(!(filters[offset][k = iterablesEmptyRows[i]] & one)) {
                // Was in the filter, so set the filter and remove
                filters[offset][k] ^= one;
                removed.push(k);
              }
            }
          }
        }

        lo0 = lo1;
        hi0 = hi1;
        filterListeners.forEach(function(l) { l(one, offset, added, removed); });
        triggerOnChange('filtered');
        return dimension;
      }

      // Filters this dimension using the specified range, value, or null.
      // If the range is null, this is equivalent to filterAll.
      // If the range is an array, this is equivalent to filterRange.
      // Otherwise, this is equivalent to filterExact.
      function filter(range) {
        return range == null
            ? filterAll() : Array.isArray(range)
            ? filterRange(range) : typeof range === "function"
            ? filterFunction(range)
            : filterExact(range);
      }

      // Filters this dimension to select the exact value.
      function filterExact(value) {
        filterValue = value;
        filterValuePresent = true;
        return filterIndexBounds((refilter = xfilterFilter.filterExact(bisect, value))(values));
      }

      // Filters this dimension to select the specified range [lo, hi].
      // The lower bound is inclusive, and the upper bound is exclusive.
      function filterRange(range) {
        filterValue = range;
        filterValuePresent = true;
        return filterIndexBounds((refilter = xfilterFilter.filterRange(bisect, range))(values));
      }

      // Clears any filters on this dimension.
      function filterAll() {
        filterValue = undefined;
        filterValuePresent = false;
        return filterIndexBounds((refilter = xfilterFilter.filterAll)(values));
      }

      // Filters this dimension using an arbitrary function.
      function filterFunction(f) {
        filterValue = f;
        filterValuePresent = true;
        
        refilterFunction = f;
        refilter = xfilterFilter.filterAll;

        filterIndexFunction(f, false);

        var bounds = refilter(values);
        lo0 = bounds[0], hi0 = bounds[1];

        return dimension;
      }

      function filterIndexFunction(f, filterAll) {
        var i,
            k,
            x,
            added = [],
            removed = [],
            valueIndexAdded = [],
            valueIndexRemoved = [],
            indexLength = values.length;

        if(!iterable) {
          for (i = 0; i < indexLength; ++i) {
            if (!(filters[offset][k = index[i]] & one) ^ !!(x = f(values[i], i))) {
              if (x) added.push(k);
              else removed.push(k);
            }
          }
        }

        if(iterable) {
          for(i=0; i < indexLength; ++i) {
            if(f(values[i], i)) {
              added.push(index[i]);
              valueIndexAdded.push(i);
            } else {
              removed.push(index[i]);
              valueIndexRemoved.push(i);
            }
          }
        }

        if(!iterable) {
          for(i=0; i<added.length; i++) {
            if(filters[offset][added[i]] & one) filters[offset][added[i]] &= zero;
          }

          for(i=0; i<removed.length; i++) {
            if(!(filters[offset][removed[i]] & one)) filters[offset][removed[i]] |= one;
          }
        } else {

          var newAdded = [];
          var newRemoved = [];
          for (i = 0; i < added.length; i++) {
            // First check this particular value needs to be added
            if(iterablesIndexFilterStatus[valueIndexAdded[i]] === 1) {
              iterablesIndexCount[added[i]]++;
              iterablesIndexFilterStatus[valueIndexAdded[i]] = 0;
              if(iterablesIndexCount[added[i]] === 1) {
                filters[offset][added[i]] ^= one;
                newAdded.push(added[i]);
              }
            }
          }
          for (i = 0; i < removed.length; i++) {
            // First check this particular value needs to be removed
            if(iterablesIndexFilterStatus[valueIndexRemoved[i]] === 0) {
              iterablesIndexCount[removed[i]]--;
              iterablesIndexFilterStatus[valueIndexRemoved[i]] = 1;
              if(iterablesIndexCount[removed[i]] === 0) {
                filters[offset][removed[i]] ^= one;
                newRemoved.push(removed[i]);
              }
            }
          }

          added = newAdded;
          removed = newRemoved;

          // Now handle empty rows.
          if(filterAll) {
            for(i = 0; i < iterablesEmptyRows.length; i++) {
              if((filters[offset][k = iterablesEmptyRows[i]] & one)) {
                // Was not in the filter, so set the filter and add
                filters[offset][k] ^= one;
                added.push(k);
              }
            }
          } else {
            // filter in place - remove empty rows if necessary
            for(i = 0; i < iterablesEmptyRows.length; i++) {
              if(!(filters[offset][k = iterablesEmptyRows[i]] & one)) {
                // Was in the filter, so set the filter and remove
                filters[offset][k] ^= one;
                removed.push(k);
              }
            }
          }
        }

        filterListeners.forEach(function(l) { l(one, offset, added, removed); });
        triggerOnChange('filtered');
      }
      
      function currentFilter() {
        return filterValue;
      }
      
      function hasCurrentFilter() {
        return filterValuePresent;
      }

      // Returns the top K selected records based on this dimension's order.
      // Note: observes this dimension's filter, unlike group and groupAll.
      function top(k, top_offset) {
        var array = [],
            i = hi0,
            j,
            toSkip = 0;

        if(top_offset && top_offset > 0) toSkip = top_offset;

        while (--i >= lo0 && k > 0) {
          if (filters.zero(j = index[i])) {
            if(toSkip > 0) {
              //skip matching row
              --toSkip;
            } else {
              array.push(data[j]);
              --k;
            }
          }
        }

        if(iterable){
          for(i = 0; i < iterablesEmptyRows.length && k > 0; i++) {
            // Add row with empty iterable column at the end
            if(filters.zero(j = iterablesEmptyRows[i])) {
              if(toSkip > 0) {
                //skip matching row
                --toSkip;
              } else {
                array.push(data[j]);
                --k;
              }
            }
          }
        }

        return array;
      }

      // Returns the bottom K selected records based on this dimension's order.
      // Note: observes this dimension's filter, unlike group and groupAll.
      function bottom(k, bottom_offset) {
        var array = [],
            i,
            j,
            toSkip = 0;

        if(bottom_offset && bottom_offset > 0) toSkip = bottom_offset;

        if(iterable) {
          // Add row with empty iterable column at the top
          for(i = 0; i < iterablesEmptyRows.length && k > 0; i++) {
            if(filters.zero(j = iterablesEmptyRows[i])) {
              if(toSkip > 0) {
                //skip matching row
                --toSkip;
              } else {
                array.push(data[j]);
                --k;
              }
            }
          }
        }

        i = lo0;

        while (i < hi0 && k > 0) {
          if (filters.zero(j = index[i])) {
            if(toSkip > 0) {
              //skip matching row
              --toSkip;
            } else {
              array.push(data[j]);
              --k;
            }
          }
          i++;
        }

        return array;
      }

      // Adds a new group to this dimension, using the specified key function.
      function group(key) {
        var group = {
          top: top,
          all: all,
          reduce: reduce,
          reduceCount: reduceCount,
          reduceSum: reduceSum,
          order: order,
          orderNatural: orderNatural,
          size: size,
          dispose: dispose,
          remove: dispose // for backwards-compatibility
        };

        // Ensure that this group will be removed when the dimension is removed.
        dimensionGroups.push(group);

        var groups, // array of {key, value}
            groupIndex, // object id ↦ group id
            groupWidth = 8,
            groupCapacity = capacity(groupWidth),
            k = 0, // cardinality
            select,
            heap,
            reduceAdd,
            reduceRemove,
            reduceInitial,
            update = cr_null,
            reset = cr_null,
            resetNeeded = true,
            groupAll = key === cr_null,
            n0old;

        if (arguments.length < 1) key = cr_identity;

        // The group listens to the crossfilter for when any dimension changes, so
        // that it can update the associated reduce values. It must also listen to
        // the parent dimension for when data is added, and compute new keys.
        filterListeners.push(update);
        indexListeners.push(add);
        removeDataListeners.push(removeData);

        // Incorporate any existing data into the grouping.
        add(values, index, 0, n);

        // Incorporates the specified new values into this group.
        // This function is responsible for updating groups and groupIndex.
        function add(newValues, newIndex, n0, n1) {

          if(iterable) {
            n0old = n0;
            n0 = values.length - newValues.length;
            n1 = newValues.length;
          }

          var oldGroups = groups,
              reIndex = iterable ? [] : cr_index(k, groupCapacity),
              add = reduceAdd,
              remove = reduceRemove,
              initial = reduceInitial,
              k0 = k, // old cardinality
              i0 = 0, // index of old group
              i1 = 0, // index of new record
              j, // object id
              g0, // old group
              x0, // old key
              x1, // new key
              g, // group to add
              x; // key of group to add

          // If a reset is needed, we don't need to update the reduce values.
          if (resetNeeded) add = initial = cr_null;
          if (resetNeeded) remove = initial = cr_null;

          // Reset the new groups (k is a lower bound).
          // Also, make sure that groupIndex exists and is long enough.
          groups = new Array(k), k = 0;
          if(iterable){
            groupIndex = k0 ? groupIndex : [];
          }
          else {
            groupIndex = k0 > 1 ? xfilterArray.arrayLengthen(groupIndex, n) : cr_index(n, groupCapacity);
          }


          // Get the first old key (x0 of g0), if it exists.
          if (k0) x0 = (g0 = oldGroups[0]).key;

          // Find the first new key (x1), skipping NaN keys.
          while (i1 < n1 && !((x1 = key(newValues[i1])) >= x1)) ++i1;

          // While new keys remain…
          while (i1 < n1) {

            // Determine the lesser of the two current keys; new and old.
            // If there are no old keys remaining, then always add the new key.
            if (g0 && x0 <= x1) {
              g = g0, x = x0;

              // Record the new index of the old group.
              reIndex[i0] = k;

              // Retrieve the next old key.
              g0 = oldGroups[++i0];
              if (g0) x0 = g0.key;
            } else {
              g = {key: x1, value: initial()}, x = x1;
            }

            // Add the lesser group.
            groups[k] = g;

            // Add any selected records belonging to the added group, while
            // advancing the new key and populating the associated group index.

            while (x1 <= x) {
              j = newIndex[i1] + (iterable ? n0old : n0);


              if(iterable){
                if(groupIndex[j]){
                  groupIndex[j].push(k);
                }
                else {
                  groupIndex[j] = [k];
                }
              }
              else {
                groupIndex[j] = k;
              }

              // Always add new values to groups. Only remove when not in filter.
              // This gives groups full information on data life-cycle.
              g.value = add(g.value, data[j], true);
              if (!filters.zeroExcept(j, offset, zero)) g.value = remove(g.value, data[j], false);
              if (++i1 >= n1) break;
              x1 = key(newValues[i1]);
            }

            groupIncrement();
          }

          // Add any remaining old groups that were greater th1an all new keys.
          // No incremental reduce is needed; these groups have no new records.
          // Also record the new index of the old group.
          while (i0 < k0) {
            groups[reIndex[i0] = k] = oldGroups[i0++];
            groupIncrement();
          }


          // Fill in gaps with empty arrays where there may have been rows with empty iterables
          if(iterable){
            for (var index1 = 0; index1 < n; index1++) {
              if(!groupIndex[index1]){
                groupIndex[index1] = [];
              }
            }
          }

          // If we added any new groups before any old groups,
          // update the group index of all the old records.
          if(k > i0){
            if(iterable){
              for (i0 = 0; i0 < n0old; ++i0) {
                for (index1 = 0; index1 < groupIndex[i0].length; index1++) {
                  groupIndex[i0][index1] = reIndex[groupIndex[i0][index1]];
                }
              }
            }
            else {
              for (i0 = 0; i0 < n0; ++i0) {
                groupIndex[i0] = reIndex[groupIndex[i0]];
              }
            }
          }

          // Modify the update and reset behavior based on the cardinality.
          // If the cardinality is less than or equal to one, then the groupIndex
          // is not needed. If the cardinality is zero, then there are no records
          // and therefore no groups to update or reset. Note that we also must
          // change the registered listener to point to the new method.
          j = filterListeners.indexOf(update);
          if (k > 1 || iterable) {
            update = updateMany;
            reset = resetMany;
          } else {
            if (!k && groupAll) {
              k = 1;
              groups = [{key: null, value: initial()}];
            }
            if (k === 1) {
              update = updateOne;
              reset = resetOne;
            } else {
              update = cr_null;
              reset = cr_null;
            }
            groupIndex = null;
          }
          filterListeners[j] = update;

          // Count the number of added groups,
          // and widen the group index as needed.
          function groupIncrement() {
            if(iterable){
              k++;
              return
            }
            if (++k === groupCapacity) {
              reIndex = xfilterArray.arrayWiden(reIndex, groupWidth <<= 1);
              groupIndex = xfilterArray.arrayWiden(groupIndex, groupWidth);
              groupCapacity = capacity(groupWidth);
            }
          }
        }

        function removeData(reIndex) {
          if (k > 1 || iterable) {
            var oldK = k,
                oldGroups = groups,
                seenGroups = cr_index(oldK, oldK),
                i,
                i0,
                j;

            // Filter out non-matches by copying matching group index entries to
            // the beginning of the array.
            if (!iterable) {
              for (i = 0, j = 0; i < n; ++i) {
                if (reIndex[i] !== REMOVED_INDEX) {
                  seenGroups[groupIndex[j] = groupIndex[i]] = 1;
                  ++j;
                }
              }
            } else {
              for (i = 0, j = 0; i < n; ++i) {
                if (reIndex[i] !== REMOVED_INDEX) {
                  groupIndex[j] = groupIndex[i];
                  for (i0 = 0; i0 < groupIndex[j].length; i0++) {
                    seenGroups[groupIndex[j][i0]] = 1;
                  }
                  ++j;
                }
              }
            }

            // Reassemble groups including only those groups that were referred
            // to by matching group index entries.  Note the new group index in
            // seenGroups.
            groups = [], k = 0;
            for (i = 0; i < oldK; ++i) {
              if (seenGroups[i]) {
                seenGroups[i] = k++;
                groups.push(oldGroups[i]);
              }
            }

            if (k > 1 || iterable) {
              // Reindex the group index using seenGroups to find the new index.
              if (!iterable) {
                for (i = 0; i < j; ++i) groupIndex[i] = seenGroups[groupIndex[i]];
              } else {
                for (i = 0; i < j; ++i) {
                  for (i0 = 0; i0 < groupIndex[i].length; ++i0) {
                    groupIndex[i][i0] = seenGroups[groupIndex[i][i0]];
                  }
                }
              }
            } else {
              groupIndex = null;
            }
            filterListeners[filterListeners.indexOf(update)] = k > 1 || iterable
                ? (reset = resetMany, update = updateMany)
                : k === 1 ? (reset = resetOne, update = updateOne)
                : reset = update = cr_null;
          } else if (k === 1) {
            if (groupAll) return;
            for (var index3 = 0; index3 < n; ++index3) if (reIndex[index3] !== REMOVED_INDEX) return;
            groups = [], k = 0;
            filterListeners[filterListeners.indexOf(update)] =
            update = reset = cr_null;
          }
        }

        // Reduces the specified selected or deselected records.
        // This function is only used when the cardinality is greater than 1.
        // notFilter indicates a crossfilter.add/remove operation.
        function updateMany(filterOne, filterOffset, added, removed, notFilter) {

          if ((filterOne === one && filterOffset === offset) || resetNeeded) return;

          var i,
              j,
              k,
              n,
              g;

          if(iterable){
            // Add the added values.
            for (i = 0, n = added.length; i < n; ++i) {
              if (filters.zeroExcept(k = added[i], offset, zero)) {
                for (j = 0; j < groupIndex[k].length; j++) {
                  g = groups[groupIndex[k][j]];
                  g.value = reduceAdd(g.value, data[k], false, j);
                }
              }
            }

            // Remove the removed values.
            for (i = 0, n = removed.length; i < n; ++i) {
              if (filters.onlyExcept(k = removed[i], offset, zero, filterOffset, filterOne)) {
                for (j = 0; j < groupIndex[k].length; j++) {
                  g = groups[groupIndex[k][j]];
                  g.value = reduceRemove(g.value, data[k], notFilter, j);
                }
              }
            }
            return;
          }

          // Add the added values.
          for (i = 0, n = added.length; i < n; ++i) {
            if (filters.zeroExcept(k = added[i], offset, zero)) {
              g = groups[groupIndex[k]];
              g.value = reduceAdd(g.value, data[k], false);
            }
          }

          // Remove the removed values.
          for (i = 0, n = removed.length; i < n; ++i) {
            if (filters.onlyExcept(k = removed[i], offset, zero, filterOffset, filterOne)) {
              g = groups[groupIndex[k]];
              g.value = reduceRemove(g.value, data[k], notFilter);
            }
          }
        }

        // Reduces the specified selected or deselected records.
        // This function is only used when the cardinality is 1.
        // notFilter indicates a crossfilter.add/remove operation.
        function updateOne(filterOne, filterOffset, added, removed, notFilter) {
          if ((filterOne === one && filterOffset === offset) || resetNeeded) return;

          var i,
              k,
              n,
              g = groups[0];

          // Add the added values.
          for (i = 0, n = added.length; i < n; ++i) {
            if (filters.zeroExcept(k = added[i], offset, zero)) {
              g.value = reduceAdd(g.value, data[k], false);
            }
          }

          // Remove the removed values.
          for (i = 0, n = removed.length; i < n; ++i) {
            if (filters.onlyExcept(k = removed[i], offset, zero, filterOffset, filterOne)) {
              g.value = reduceRemove(g.value, data[k], notFilter);
            }
          }
        }

        // Recomputes the group reduce values from scratch.
        // This function is only used when the cardinality is greater than 1.
        function resetMany() {
          var i,
              j,
              g;

          // Reset all group values.
          for (i = 0; i < k; ++i) {
            groups[i].value = reduceInitial();
          }

          // We add all records and then remove filtered records so that reducers
          // can build an 'unfiltered' view even if there are already filters in
          // place on other dimensions.
          if(iterable){
            for (i = 0; i < n; ++i) {
              for (j = 0; j < groupIndex[i].length; j++) {
                g = groups[groupIndex[i][j]];
                g.value = reduceAdd(g.value, data[i], true, j);
              }
            }
            for (i = 0; i < n; ++i) {
              if (!filters.zeroExcept(i, offset, zero)) {
                for (j = 0; j < groupIndex[i].length; j++) {
                  g = groups[groupIndex[i][j]];
                  g.value = reduceRemove(g.value, data[i], false, j);
                }
              }
            }
            return;
          }

          for (i = 0; i < n; ++i) {
            g = groups[groupIndex[i]];
            g.value = reduceAdd(g.value, data[i], true);
          }
          for (i = 0; i < n; ++i) {
            if (!filters.zeroExcept(i, offset, zero)) {
              g = groups[groupIndex[i]];
              g.value = reduceRemove(g.value, data[i], false);
            }
          }
        }

        // Recomputes the group reduce values from scratch.
        // This function is only used when the cardinality is 1.
        function resetOne() {
          var i,
              g = groups[0];

          // Reset the singleton group values.
          g.value = reduceInitial();

          // We add all records and then remove filtered records so that reducers
          // can build an 'unfiltered' view even if there are already filters in
          // place on other dimensions.
          for (i = 0; i < n; ++i) {
            g.value = reduceAdd(g.value, data[i], true);
          }

          for (i = 0; i < n; ++i) {
            if (!filters.zeroExcept(i, offset, zero)) {
              g.value = reduceRemove(g.value, data[i], false);
            }
          }
        }

        // Returns the array of group values, in the dimension's natural order.
        function all() {
          if (resetNeeded) reset(), resetNeeded = false;
          return groups;
        }

        // Returns a new array containing the top K group values, in reduce order.
        function top(k) {
          var top = select(all(), 0, groups.length, k);
          return heap.sort(top, 0, top.length);
        }

        // Sets the reduce behavior for this group to use the specified functions.
        // This method lazily recomputes the reduce values, waiting until needed.
        function reduce(add, remove, initial) {
          reduceAdd = add;
          reduceRemove = remove;
          reduceInitial = initial;
          resetNeeded = true;
          return group;
        }

        // A convenience method for reducing by count.
        function reduceCount() {
          return reduce(xfilterReduce.reduceIncrement, xfilterReduce.reduceDecrement, cr_zero);
        }

        // A convenience method for reducing by sum(value).
        function reduceSum(value) {
          return reduce(xfilterReduce.reduceAdd(value), xfilterReduce.reduceSubtract(value), cr_zero);
        }

        // Sets the reduce order, using the specified accessor.
        function order(value) {
          select = h$1.by(valueOf);
          heap = h.by(valueOf);
          function valueOf(d) { return value(d.value); }
          return group;
        }

        // A convenience method for natural ordering by reduce value.
        function orderNatural() {
          return order(cr_identity);
        }

        // Returns the cardinality of this group, irrespective of any filters.
        function size() {
          return k;
        }

        // Removes this group and associated event listeners.
        function dispose() {
          var i = filterListeners.indexOf(update);
          if (i >= 0) filterListeners.splice(i, 1);
          i = indexListeners.indexOf(add);
          if (i >= 0) indexListeners.splice(i, 1);
          i = removeDataListeners.indexOf(removeData);
          if (i >= 0) removeDataListeners.splice(i, 1);
          i = dimensionGroups.indexOf(group);
          if (i >= 0) dimensionGroups.splice(i, 1);
          return group;
        }

        return reduceCount().orderNatural();
      }

      // A convenience function for generating a singleton group.
      function groupAll() {
        var g = group(cr_null), all = g.all;
        delete g.all;
        delete g.top;
        delete g.order;
        delete g.orderNatural;
        delete g.size;
        g.value = function() { return all()[0].value; };
        return g;
      }

      // Removes this dimension and associated groups and event listeners.
      function dispose() {
        dimensionGroups.forEach(function(group) { group.dispose(); });
        var i = dataListeners.indexOf(preAdd);
        if (i >= 0) dataListeners.splice(i, 1);
        i = dataListeners.indexOf(postAdd);
        if (i >= 0) dataListeners.splice(i, 1);
        i = removeDataListeners.indexOf(removeData);
        if (i >= 0) removeDataListeners.splice(i, 1);
        filters.masks[offset] &= zero;
        return filterAll();
      }

      return dimension;
    }

    // A convenience method for groupAll on a dummy dimension.
    // This implementation can be optimized since it always has cardinality 1.
    function groupAll() {
      var group = {
        reduce: reduce,
        reduceCount: reduceCount,
        reduceSum: reduceSum,
        value: value,
        dispose: dispose,
        remove: dispose // for backwards-compatibility
      };

      var reduceValue,
          reduceAdd,
          reduceRemove,
          reduceInitial,
          resetNeeded = true;

      // The group listens to the crossfilter for when any dimension changes, so
      // that it can update the reduce value. It must also listen to the parent
      // dimension for when data is added.
      filterListeners.push(update);
      dataListeners.push(add);

      // For consistency; actually a no-op since resetNeeded is true.
      add(data, 0);

      // Incorporates the specified new values into this group.
      function add(newData, n0) {
        var i;

        if (resetNeeded) return;

        // Cycle through all the values.
        for (i = n0; i < n; ++i) {

          // Add all values all the time.
          reduceValue = reduceAdd(reduceValue, data[i], true);

          // Remove the value if filtered.
          if (!filters.zero(i)) {
            reduceValue = reduceRemove(reduceValue, data[i], false);
          }
        }
      }

      // Reduces the specified selected or deselected records.
      function update(filterOne, filterOffset, added, removed, notFilter) {
        var i,
            k,
            n;

        if (resetNeeded) return;

        // Add the added values.
        for (i = 0, n = added.length; i < n; ++i) {
          if (filters.zero(k = added[i])) {
            reduceValue = reduceAdd(reduceValue, data[k], notFilter);
          }
        }

        // Remove the removed values.
        for (i = 0, n = removed.length; i < n; ++i) {
          if (filters.only(k = removed[i], filterOffset, filterOne)) {
            reduceValue = reduceRemove(reduceValue, data[k], notFilter);
          }
        }
      }

      // Recomputes the group reduce value from scratch.
      function reset() {
        var i;

        reduceValue = reduceInitial();

        // Cycle through all the values.
        for (i = 0; i < n; ++i) {

          // Add all values all the time.
          reduceValue = reduceAdd(reduceValue, data[i], true);

          // Remove the value if it is filtered.
          if (!filters.zero(i)) {
            reduceValue = reduceRemove(reduceValue, data[i], false);
          }
        }
      }

      // Sets the reduce behavior for this group to use the specified functions.
      // This method lazily recomputes the reduce value, waiting until needed.
      function reduce(add, remove, initial) {
        reduceAdd = add;
        reduceRemove = remove;
        reduceInitial = initial;
        resetNeeded = true;
        return group;
      }

      // A convenience method for reducing by count.
      function reduceCount() {
        return reduce(xfilterReduce.reduceIncrement, xfilterReduce.reduceDecrement, cr_zero);
      }

      // A convenience method for reducing by sum(value).
      function reduceSum(value) {
        return reduce(xfilterReduce.reduceAdd(value), xfilterReduce.reduceSubtract(value), cr_zero);
      }

      // Returns the computed reduce value.
      function value() {
        if (resetNeeded) reset(), resetNeeded = false;
        return reduceValue;
      }

      // Removes this group and associated event listeners.
      function dispose() {
        var i = filterListeners.indexOf(update);
        if (i >= 0) filterListeners.splice(i, 1);
        i = dataListeners.indexOf(add);
        if (i >= 0) dataListeners.splice(i, 1);
        return group;
      }

      return reduceCount();
    }

    // Returns the number of records in this crossfilter, irrespective of any filters.
    function size() {
      return n;
    }

    // Returns the raw row data contained in this crossfilter
    function all(){
      return data;
    }

    // Returns row data with all dimension filters applied, except for filters in ignore_dimensions
    function allFiltered(ignore_dimensions) {
      var array = [],
          i = 0,
          mask = maskForDimensions(ignore_dimensions || []);

        for (i = 0; i < n; i++) {
          if (filters.zeroExceptMask(i, mask)) {
            array.push(data[i]);
          }
        }

        return array;
    }

    function onChange(cb){
      if(typeof cb !== 'function'){
        /* eslint no-console: 0 */
        console.warn('onChange callback parameter must be a function!');
        return;
      }
      callbacks.push(cb);
      return function(){
        callbacks.splice(callbacks.indexOf(cb), 1);
      };
    }

    function triggerOnChange(eventName){
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](eventName);
      }
    }

    return arguments.length
        ? add(arguments[0])
        : crossfilter;
  }

  // Returns an array of size n, big enough to store ids up to m.
  function cr_index(n, m) {
    return (m < 0x101
        ? xfilterArray.array8 : m < 0x10001
        ? xfilterArray.array16
        : xfilterArray.array32)(n);
  }

  // Constructs a new array of size n, with sequential values from 0 to n - 1.
  function cr_range(n) {
    var range = cr_index(n, n);
    for (var i = -1; ++i < n;) range[i] = i;
    return range;
  }

  function capacity(w) {
    return w === 8
        ? 0x100 : w === 16
        ? 0x10000
        : 0x100000000;
  }

  /* Decompresses ideogram's annotations for crossfilter initialization
  By default, annotations are clustered by chromosome, e.g.
  [
    {"chr": "1", "annots": [{"from": 100, "to", 101, "chr": "1", ...}, ...]},
    {"chr": "2", "annots": [{"from": 500, "to", 501, "chr": "2", ...}, ...]},
    ...
  ]
  This method flattens that structure to e.g.
  [
    {"from": 100, "to": 101, "chr": "1", ...},
    ...
    {"from": 500, "to": 501, "chr": "2", ...},
  ]
  See also: packAnnots
  */
  function unpackAnnots() {
    var chr, annots, i,
      unpackedAnnots = [],
      ideo = this,
      chrs = ideo.annots;

    for (i = 0; i < chrs.length; i++) {
      chr = chrs[i];
      annots = chr.annots;
      unpackedAnnots = unpackedAnnots.concat(annots);
    }

    return unpackedAnnots;
  }

  /*
    Compresses annots back to default state.  Inverse of unpackAnnots.
  */
  function packAnnots(unpackedAnnots) {
    var chr, annot, i,
      annots = [],
      ideo = this,
      chrs = ideo.annots;

    for (chr in chrs) {
      annots.push({chr: chrs[chr].chr, annots: []});
    }

    for (i = 0; i < unpackedAnnots.length; i++) {
      annot = unpackedAnnots[i];
      annots[annot.chrIndex].annots.push(annot);
    }

    return annots;
  }

  /*
    Initializes crossfilter.  Needed for client-side filtering.
    More: https://github.com/square/crossfilter/wiki/API-Reference
  */
  function initCrossFilter() {
    var i, facet,
      ideo = this,
      keys = ideo.rawAnnots.keys;

    ideo.unpackedAnnots = ideo.unpackAnnots();
    ideo.crossfilter = crossfilter(ideo.unpackedAnnots);

    ideo.annotsByFacet = {};
    ideo.facets = keys.slice(3, keys.length);

    for (i = 0; i < ideo.facets.length; i++) {
      facet = ideo.facets[i];
      ideo.annotsByFacet[facet] =
        ideo.crossfilter.dimension(function(d) {
          return d[facet];
        });
    }

    if ('filterSelections' in ideo) {
      ideo.filterAnnots(ideo.filterSelections);
    }

    ideo.filteredAnnots = ideo.annots;
  }

  function getFilteredResults(selections, ideo) {
    var fn, i, facet, results, filter,
      counts = {};

    if (Object.keys(selections).length === 0) {
      results = ideo.unpackedAnnots;
    } else {
      for (i = 0; i < ideo.facets.length; i++) {
        facet = ideo.facets[i];
        if (facet in selections) {
          filter = selections[facet];
          if (Array.isArray(filter)) {
            fn = function(d) {
              // Filter is numeric range
              if (filter.length === 2) {
                // [min, max]
                return filter[0] <= d && d < filter[1];
              } else if (filter.length === 4) {
                // [min1, max1, min2, max2]
                return (
                  filter[0] <= d && d < filter[1] ||
                  filter[2] <= d && d < filter[3]
                );
              }
            };
          } else {
            fn = function(d) {
              // Filter is set of categories
              return (d in filter);
            };
          }
        } else {
          fn = null;
        }
        ideo.annotsByFacet[facet].filter(fn);
        counts[facet] = ideo.annotsByFacet[facet].group().top(Infinity);
      }
      results = ideo.annotsByFacet[facet].top(Infinity);
    }

    return [results, counts];
  }

  /*
    Filters annotations based on the given selections.
    "selections" is an object of objects, e.g.

      {
        "tissue-type": {          <-- a facet
          "cerebral-cortex": 1,   <-- a filter; "1" means it is selected
          "liver": 1
        },
        "gene-type": {
          mirna": 1
        }
      }

    Translation:
    select where:
        (tissue-type is cerebral-cortex OR liver) and (gene-type is mirna)

    TODO:
      * Filter counts
      * Integrate server-side filtering for very large datasets
  */
  function filterAnnots(selections) {
    var i, facet, results, counts,
      t0 = Date.now(),
      ideo = this;

    ideo.filterSelections = selections;
    [results, counts] = getFilteredResults(selections, ideo);

    for (i < 0; i < ideo.facets.length; i++) {
      ideo.annotsByFacet[facet].filterAll(); // clear filters
    }

    results = ideo.packAnnots(results);

    delete ideo.maxAnnotsPerBar;
    delete ideo.maxAnnotsPerBarAllChrs;

    ideo.filteredAnnots = results;

    d3.selectAll(ideo.selector + ' polygon.annot').remove();
    ideo.drawAnnots(results);

    console.log('Time in filterAnnots: ' + (Date.now() - t0) + ' ms');

    return counts;
  }

  function getPixelAndOtherData(bands, chr, hasBands, ideo) {
    var i, band, csLength, width, maxLength,
      pxStop = 0,
      taxid = chr.id.split('-')[1],
      cs = ideo.coordinateSystem,
      chrHeight = ideo.config.chrHeight;

    for (i = 0; i < bands.length; i++) {
      band = bands[i];
      csLength = band[cs].stop - band[cs].start;

      // If ideogram is rotated (and thus showing only one chromosome),
      // then set its width independent of the longest chromosome in this
      // genome.
      if (ideo._layout._isRotated) {
        width = chrHeight * csLength / chr.length;
      } else {
        if (ideo.config.chromosomeScale === 'relative') {
          maxLength = ideo.maxLength[taxid][cs];
        } else {
          maxLength = ideo.maxLength[cs];
        }
        width = chrHeight * chr.length / maxLength * csLength / chr.length;
      }
      bands[i].px = {start: pxStop, stop: pxStop + width, width: width};

      pxStop = bands[i].px.stop;

      if (hasBands && band.stain === 'acen' && band.name[0] === 'p') {
        chr.pcenIndex = i;
      }
    }
    return [bands, chr, pxStop];
  }

  /**
   * TODO:
   * A chromosome-level scale property is likely
   * nonsensical for any chromosomes that have cytogenetic band data.
   * Different bands tend to have ratios between number of base pairs
   * and physical length.
   *
   * However, a chromosome-level scale property is likely
   * necessary for chromosomes that do not have band data.
   *
   * This needs further review.
   */
  function getChrScale(chr, hasBands, ideo) {
    var chrHeight = ideo.config.chrHeight,
      chrLength = chr.length,
      maxLength = ideo.maxLength,
      taxid = chr.id.split('-')[1],
      scale = {};

    scale.bp = chrHeight / maxLength.bp;

    if (ideo.config.multiorganism === true) {
      // chr.scale.bp = band.iscn.stop / band.bp.stop;
      if (ideo.config.chromosomeScale === 'relative') {
        scale.iscn = chrHeight * chrLength / maxLength[taxid].bp;
        scale.bp = chrHeight / maxLength[taxid].bp;
      } else {
        scale.iscn = chrHeight * chrLength / maxLength.bp;
      }
    } else if (hasBands) {
      scale.iscn = chrHeight / maxLength.iscn;
    }

    return scale;
  }

  function getChromosomePixels(chr) {
    var bands, chrHeight, pxStop, hasBands, maxLength,
      taxid = chr.id.split('-')[1],
      ideo = this;

    bands = chr.bands;
    chrHeight = ideo.config.chrHeight;
    pxStop = 0;
    hasBands = (typeof bands !== 'undefined');

    if (hasBands) {
      [bands, chr, pxStop] = getPixelAndOtherData(bands, chr, hasBands, ideo);
    } else {
      if (ideo.config.chromosomeScale === 'relative') {
        maxLength = ideo.maxLength[taxid][ideo.coordinateSystem];
      } else {
        maxLength = ideo.maxLength[ideo.coordinateSystem];
      }
      pxStop = chrHeight * chr.length / maxLength;
    }

    chr.width = pxStop;
    chr.scale = getChrScale(chr, hasBands, ideo);
    chr.bands = bands;

    return chr;
  }

  function getChrModelScaffold(chr, bands, chrName, ideo) {
    var hasBands = (typeof bands !== 'undefined');

    if (hasBands) {
      const lastBand = bands[bands.length - 1];
      chr.name = chrName;
      chr.length = lastBand[ideo.coordinateSystem].stop;

      // Accounts for case where this chromosome
      chr.bpLength = lastBand.bp.stop;

      chr.type = 'nuclear';
    } else {
      chr = chrName;
    }

    return chr;
  }

  /**
   * Encountered when processing an assembly that has chromosomes with
   * centromere data, but this chromosome does not.
   * Example: chromosome F1 in Felis catus.
   */
  function deleteExtraneousBands(chr, hasBands) {
    if (hasBands && chr.bands.length === 1) {
      delete chr.bands;
    }
    return chr;
  }

  function getCentromerePosition(hasBands, bands) {

    if (hasBands === false) return '';

    // As with Macaca mulatta chromosome Y
    const firstBand = bands[0];
    const lastBand = bands.slice(-1)[0];
    const chrLength = lastBand.bp.stop - firstBand.bp.start;
    const smallLength = chrLength/20;

    if (
      // As with almost all mouse chromosome, chimpanzee chr22
      firstBand.name[0] === 'p' && bands[1].name[0] === 'q' &&
      firstBand.bp.stop - firstBand.bp.start < smallLength
    ) {
      return 'telocentric-p';
    }

    const penultimateBand = bands.slice(-2)[0];

    if (
      penultimateBand.name[0] === 'p' && lastBand.name[0] === 'q' &&
      lastBand.bp.stop - lastBand.bp.start < smallLength
    ) {
      // As with Macaca mulatta chromosome Y
      return 'telocentric-q';
    }

    return '';
  }

  /**
   * Generates a model object for each chromosome containing information on
   * its name, DOM ID, length in base pairs or ISCN coordinates, cytogenetic
   * bands, centromere position, etc.
   */
  function getChromosomeModel(bands, chrName, taxid, chrIndex) {
    var hasBands, org,
      chr = {},
      ideo = this;

    hasBands = (typeof bands !== 'undefined');

    chr = getChrModelScaffold(chr, bands, chrName, ideo);

    chr.chrIndex = chrIndex;
    chr.id = 'chr' + chr.name + '-' + taxid;

    if (ideo.config.fullChromosomeLabels === true) {
      org = this.organisms[taxid];
      chr.name = org.scientificName + ' chr' + chr.name;
    }

    chr.bands = bands;
    chr = ideo.getChromosomePixels(chr);
    chr.centromerePosition = getCentromerePosition(hasBands, bands);

    chr = deleteExtraneousBands(chr, hasBands);

    return chr;
  }

  // import {getSettings, handleSettingsHeaderClick} from './settings-ui';

  const style = `
  <style>

    #gear {
      position: absolute;
      right: 3px;
      top: 24px;
      z-index: 8001;
      cursor: pointer;
      height: 18px;
      width: 18px;
    }

    #tools {
      position: absolute;
      width: 120px;
      right: 27px;
      top: 16px;
      z-index: 8000;
      background: white;
      margin: 0;
      border: 1px solid #CCC;
      border-radius: 4px;
      box-shadow: -2px 4px 6px #CCC;
    }

    #tools ul {
      margin-block-start: 0;
      margin-block-end: 0;
      padding-inline-start: 0;
    }

    #tools li, #download li {
      padding: 2px 12px 2px 12px;
      cursor: pointer;
    }

    #tools li:hover,
    #tools li.active,
    #download li:hover {
      background: #DDD;
    }

    #tools li.ideo-disabled,
    #tools li.active.ideo-disabled,
    #download li.ideo-disabled {
      background: #FFF;
      color: #CCC;
      cursor: default;
    }

    #download {
      position: absolute;
      right: 3px;
      top: 16px;
      z-index: 8000;
      background: white;
      margin: 0;
      padding-inline-start: 0;
    }

    #settings {
      position: absolute;
      right: 3px;
      top: 16px;
      z-index: 8000;
      background: white;
      margin: 0;
      padding-inline-start: 0;
    }

    #about {
      position: absolute;
      right: 24px;
      top: -8px;
      z-index: 8000;
      background: white;
      width: 300px;
      border: 1px solid #CCC;
      padding: 10px;
      border-radius: 4px;
      box-shadow: -2px 4px 6px #CCC;
      cursor: default;
    }

    #close {
      float: right;
      border: 1px solid #DDD;
      border-radius: 4px;
      padding: 0 6px;
      background: #EEE;
      font-weight: bold;
      cursor: pointer;
    }

    #settings label {
      display: inline;
      text-decoration: underline;
      text-decoration-style: dotted;
      cursor: pointer;
    }

    #download {
      position: absolute;
      width: 120px;
      top: -2px;
      right: 120px;
      z-index: 8000;
      background: white;
      margin: 0;
      border: 1px solid #CCC;
      border-radius: 4px;
      box-shadow: -2px 4px 6px #CCC;
    }

    li {
      list-style-type: none;
    }

    #settings .no-underline {
      text-decoration: none;
    }

    #settings .setting {
      margin-right: 8px;
    }

    #settings input[type="checkbox"], #settings input[type="radio"] {
      position: relative;
      top: 2px;
    }

    .area-header {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      clear: both;
    }

    .area-content {
      display: flex;
      flex-wrap: wrap;
    }

    .area-content > div {
      margin-right: 30px;
      margin-bottom: 15px;
    }

    .tab-panel input[type="number"] {
      width: 50px;
    }

    .tab-panel ul {
      width: 600px;
      list-style: none;
      border-bottom: 1px solid #CCC;
      box-sizing: border-box;
      margin-bottom: 0;
      padding-left: 0;
    }

    .tab-panel .nav:before, .tab-panel .nav:after {
      content: " ";
      display: table;
      clear: both;
    }

    .tab-panel li {
      float: left;
      margin-right: 2px;
      display: block;
      margin-bottom: -1px;
    }

    .tab-panel li > a {
      padding: 10px 15px;
      text-decoration: none;
      border-radius: 4px 4px 0 0;
      display: block;
      position: relative;
    }

    .tab-panel li.active > a {
      border: 1px solid #CCC;
      border-bottom: none;
      background-color: white;
    }

    .tab-panel .tab-content {
      width: 600px;
    }

    .tab-panel .tab-content > div {
      display: none;
      padding-top: 20px;
      clear: both;
    }

    .tab-panel .tab-content > div {
      padding: 20px 10px 5px 10px;
    }

    .tab-panel .tab-content > div.active {
      display: block;
      border: 1px solid #CCC;
      border-top: none;
    }

  </style>`;

  // eslint-disable-next-line max-len
  const gearIcon = '<svg viewBox="0 0 512 512"><path fill="#AAA" d="M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z"/></svg>';
  // Font Awesome Free 5.2.0 by @fontawesome - https://fontawesome.com
  // License - https://fontawesome.com/license (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)

  function deactivate(items) {
    items.forEach(item => {item.classList.remove('active');});
  }

  function closeTools() {
    const toolHeaders = document.querySelectorAll('#tools > ul > li');
    deactivate(toolHeaders);
    const itemsToClose =
      document.querySelectorAll('.ideo-modal, .ideo-tool-panel');
    itemsToClose.forEach(item => {item.remove();});

    document.querySelector('#tools').style.display = 'none';
  }

  /**
   * As needed, hide tool panels that are triggered by hovering
   */
  function handleHideForHoverables(trigger, tool, toolHeader, toolHeaders) {
    if (trigger === 'mouseenter') {

      // Hide panel when hover leaves tool header, if new target element
      // is part of the tools UI (and not the panel itself)
      toolHeader.addEventListener('mouseleave', event => {
        const toElement = event.toElement;
        const toId = toElement.id;
        const panelElement = document.querySelector('.ideo-tool-panel');
        const toolsElement = document.querySelector('#tools');
        if (
          toolsElement.contains(toElement) &&
          panelElement && !panelElement.contains(toElement) &&
          toId !== tool
        ) {
          deactivate(toolHeaders);
          panelElement.remove();
        }
      });
    }
  }

  /** Determine action that should trigger a tool panel to display */
  function getTrigger(toolHeader) {
    const shouldHover =
      Array.from(toolHeader.classList).includes('ideo-tool-hover');
    const trigger = shouldHover ? 'mouseenter' : 'click';
    return trigger;
  }

  /** Shows clicked tool as active, displays resulting panel */
  function handleToolClick(ideo) {
    const toolHeaders = document.querySelectorAll('#tools > ul > li');

    toolHeaders.forEach(toolHeader => {
      const trigger = getTrigger(toolHeader);

      toolHeader.addEventListener(trigger, event => {

        // Show only clicked tool header as active
        deactivate(toolHeaders);
        toolHeader.classList += ' active';

        const tool = toolHeader.id.split('-')[0];
        const panel = getPanel(tool);

        if (trigger === 'mouseenter') {
          toolHeader.insertAdjacentHTML('beforeend', panel);
          handleHideForHoverables(trigger, tool, toolHeader, toolHeaders);

          if (tool === 'download') {
            document.querySelector('#download-image')
              .addEventListener('click', event => {
                closeTools();
                downloadPng(ideo);
              });

            document.querySelector('#download-annots')
              .addEventListener('click', event => {
                const element = document.querySelector('#download-annots');
                const classes = Array.from(element.classList);
                if (classes.includes('ideo-disabled') === false) {
                  closeTools();
                  ideo.downloadAnnotations();
                }
              });
          }
        } else {
          document.querySelector('#gear').insertAdjacentHTML('beforeend', panel);
        }
      });
    });

    // Upon clicking "close" (x), remove tools UI
    document.querySelectorAll('#close').forEach(closeButton => {
      closeButton.addEventListener('click', () => {closeTools();});
    });

  }

  function handleGearClick(ideo) {
    document.querySelector('#gear')
      .addEventListener('click', event => {
        var options = document.querySelector('#tools');
        if (options.style.display === 'none') {
          options.style.display = '';
          hideOnClickOutside();
        } else {
          options.style.display = 'none';
          closeTools();
        }
      });

    handleToolClick(ideo);

    // handleSettingsHeaderClick(ideo);
  }

  function showGearOnIdeogramHover(ideo) {
    const container = document.querySelector(ideo.selector);
    const gear = document.querySelector('#gear');
    const panel = document.querySelector('#tools');

    container.addEventListener('mouseover', () => gear.style.display = '');
    container.addEventListener('mouseout', () => {
      // Hide gear only if panel is not shown
      if (panel.style.display === 'none') {
        gear.style.display = 'none';
      }
    });

    gear.addEventListener('mouseover', () => gear.style.display = '');
  }

  function getPanel(tool, ideo) {
    var panel;
    // if (tool === 'settings') panel = getSettings();
    if (tool === 'download') panel = getDownload();
    if (tool === 'about') panel = getAbout();
    return panel.trim();
  }

  function getDownload(ideo) {

    const numAnnots = document.querySelectorAll('.annot').length;
    const annotsClass = (numAnnots > 0) ? '' : 'ideo-disabled';

    return `
    <div id="download" class="ideo-tool-panel">
      <li id="download-image">Image</li>
      <li id="download-annots" class="${annotsClass}">Annotations</li>
    </div>
  `;
  }

  function getAbout() {
    const ideogramLink = `
    <a href="https://github.com/eweitz/ideogram" target="_blank" rel="noopener">
      Ideogram.js</a>`;
    const closeButton = '<span id="close">x</span>';
    return `
    <div id="about" class="ideo-modal">
      ${ideogramLink}, version ${version$1} ${closeButton}<br/>
      <i>Chromosome visualization for the web</i>
    </div>`;
  }

  function hideOnClickOutside(selector) {
    const elements = document.querySelectorAll('#gear, #tools');
    const outsideClickListener = event => {
      let clickedOutsideCount = 0;
      elements.forEach((element) => {
        if (!element.contains(event.target)) {
          clickedOutsideCount += 1;
        }
      });
      if (clickedOutsideCount === elements.length) {
        closeTools();
        removeClickListener();
      }
    };

    const removeClickListener = () => {
      document.removeEventListener('click', outsideClickListener);
    };

    document.addEventListener('click', outsideClickListener);
  }

  function initTools(ideo) {

    const triangle = '<span style="float: right">&blacktriangleright;</span>';

    const toolsHtml = `
    ${style}
    <div id="gear" style="display: none">${gearIcon}</div>
    <div id="tools" style="display: none">
      <ul>
        <li id="download-tool" class="ideo-tool-hover">Download ${triangle}</li>
        <li id="about-tool">About</li>
      </ul>
    </div>`;


    document.querySelector(ideo.selector)
      .insertAdjacentHTML('beforebegin', toolsHtml);

    handleGearClick(ideo);

    showGearOnIdeogramHover(ideo);
  }

  /* eslint-disable no-use-before-define */

  class ModelAdapter {

    constructor(model) {
      this._model = model;
      this._class = 'ModelAdapter';
    }

    static getInstance(model) {
      if (model.bands) {
        return new ModelAdapter(model);
      } else {
        return new ModelNoBandsAdapter(model);
      }
    }

    getModel() {
      return this._model;
    }

    getCssClass() {
      return '';
    }
  }

  class ModelNoBandsAdapter extends ModelAdapter {

    constructor(model) {
      super(model);
      this._class = 'ModelNoBandsAdapter';
    }

    getModel() {
      this._model.bands = [];

      const isMT = this._model.name === 'MT'; // Is mitochondrial chromosome
      const width = this._model.width;

      if (width > 1 || isMT) {
        // Add single band to bands array
        this._model.bands.push({
          name: 'q',
          px: {
            start: 0,
            stop: width,
            width: width
          },
          bp: {
            start: 1,
            stop: this._model.bpLength
          },
          iscn: {
            start: 1,
            stop: this._model.length
          }
        });
      }

      return this._model;
    }

    getCssClass() {
      return 'noBands';
    }

  }

  class Color$1 {

    constructor(config) {
      // Ideogram config
      this._config = config;
      this._ploidy = new Ploidy(this._config);
    }

    getArmColor(chrSetIndex, chrIndex, armIndex) {
      if (this._config.armColors) {
        return this._config.armColors[armIndex];
      } else if (this._config.ancestors) {
        return this._getPolyploidArmColor(chrSetIndex, chrIndex, armIndex);
      } else {
        return null;
      }
    }

    getBorderColor(chrSetIndex, chrIndex, armIndex) {
      const config = this._config;
      const color = config.chrBorderColor ? config.chrBorderColor : '#000';
      if (chrIndex < config.ploidy) {
        return color;
      } else if (this._ploidy.exists(chrSetIndex, chrIndex, armIndex)) {
        return color;
      } else {
        return '#fff';
      }
    }

    _getPolyploidArmColor(chrSetIndex, chrIndex, armIndex) {
      if (!this._ploidy.exists(chrSetIndex, chrIndex, armIndex)) {
        return 'transparent';
      } else {
        var ancestor =
          this._ploidy.getAncestor(chrSetIndex, chrIndex, armIndex);
        return this._config.ancestors[ancestor];
      }
    }

  }

  class Range {

    /**
    * Chromosome range.
    * @public
    * @class
    * @param {Object} data - range data.
    * @param {Integer} data.chr - chromosome index.
    * @param {Integer[]} [data.ploidy] - array which controls on which
    *                                    chromosomes range should appear in case
    *                                    of ploidy.
    * @param {Integer} data.start - range start.
    * @param {Integer} data.stop - range end.
    * @param {String} data.color - range color.
    */
    constructor(data) {
      this._data = data;
      this.start = data.start;
      this.stop = data.stop;
      this.length = this.stop - this.start;
    }

    getColor(chrIndex) {
      if (!('ploidy' in this._data)) {
        return this._getColor(chrIndex);
      } else if ('ploidy' in this._data && this._data.ploidy[chrIndex]) {
        return this._getColor(chrIndex);
      } else {
        return 'transparent';
      }
    }

    _getColor(chrIndex) {
      if (Array.isArray(this._data.color)) {
        return this._data.color[chrIndex];
      } else {
        return this._data.color;
      }
    }

  }

  /* eslint-disable no-use-before-define */

  class Chromosome {

    constructor(adapter, config, ideo) {
      this._adapter = adapter;
      this._model = this._adapter.getModel();
      this._config = config;
      this._ideo = ideo;
      this._color = new Color$1(this._config);
      this._bumpCoefficient = 5;
    }

    /**
     * Factory method
     */
    static getInstance(adapter, config, ideo) {
      const centromerePosition = adapter.getModel().centromerePosition;
      if (centromerePosition === 'telocentric-p') {
        return new TelocentricPChromosome(adapter, config, ideo);
      } else if (centromerePosition === 'telocentric-q') {
        return new TelocentricQChromosome(adapter, config, ideo);
      } else {
        return new MetacentricChromosome(adapter, config, ideo);
      }
    }

    _addPArmShape(clipPath, isPArmRendered) {
      if (isPArmRendered) {
        return clipPath.concat(this._getPArmShape());
      } else {
        return clipPath;
      }
    }

    _addQArmShape(clipPath, isQArmRendered) {
      if (isQArmRendered) {
        return clipPath.concat(this._getQArmShape());
      } else {
        return clipPath;
      }
    }

    /**
     * Append bands container and apply clip-path to it
     */
    render(container, chrSetIndex, chrIndex) {

      var self, isPArmRendered, isQArmRendered, clipPath, opacity, fill,
        isFullyBanded;

      self = this;

      container = container.append('g')
        .attr('class', 'bands')
        .attr('clip-path',
          'url(#' + this._model.id + '-chromosome-set-clippath)'
        );

      // Render chromosome arms
      isPArmRendered = this._renderArm(container, chrSetIndex, chrIndex, 'p');
      isQArmRendered = this._renderArm(container, chrSetIndex, chrIndex, 'q');

      // Render range set
      this._renderRangeSet(container, chrSetIndex, chrIndex);

      // Push arms shape string into clipPath array
      clipPath = [];
      clipPath = this._addPArmShape(clipPath, isPArmRendered);
      clipPath = this._addQArmShape(clipPath, isQArmRendered);

      opacity = '0';
      fill = '';
      isFullyBanded = this.isFullyBanded();
      if (
        'ancestors' in this._ideo.config &&
        !('rangeSet' in this._ideo.config)
      ) {
        // E.g. diploid human genome (with translucent overlay)
        fill = self._color.getArmColor(chrSetIndex, chrIndex, 0);
        if (isFullyBanded) {
          opacity = '0.5';
        }
      } else if (isFullyBanded) {
        // E.g. mouse reference genome
        opacity = null;
        fill = 'transparent';
      } else if (!('ancestors' in this._ideo.config)) {
        // E.g. chimpanzee assembly Pan_tro 3.0
        opacity = '1';
      }

      // Render chromosome border
      container.append('g')
        .attr('class', 'chromosome-border')
        .selectAll('path')
        .data(clipPath)
        .enter()
        .append('path')
        .attr('fill', fill)
        .style('fill-opacity', opacity)
        .attr('stroke', function(d, i) {
          return self._color.getBorderColor(chrSetIndex, chrIndex, i);
        })
        .attr('stroke-width', function(d) {
          return ('strokeWidth' in d ? d.strokeWidth : 1);
        })
        .attr('d', function(d) {
          return d.path;
        }).attr('class', function(d) {
          return d.class;
        });

      return clipPath;
    }

    _renderRangeSet(container, chrSetIndex, chrIndex) {

      var self, rangeSet, rangesContainer, ideo;

      if (!('rangeSet' in this._config)) {
        return;
      }

      rangeSet = this._config.rangeSet.filter(function(range) {
        return range.chr - 1 === chrSetIndex;
      }).map(function(range) {
        return new Range(range);
      });

      rangesContainer = container.append('g').attr('class', 'range-set');

      self = this;
      ideo = self._ideo;

      rangesContainer.selectAll('rect.range')
        .data(rangeSet)
        .enter()
        .append('rect')
        .attr('class', 'range')
        .attr('x', function(range) {
          return ideo.convertBpToPx(self._model, range.start);
        }).attr('y', 0)
        .attr('width', function(range) {
          return ideo.convertBpToPx(self._model, range.length);
        }).attr('height', this._config.chrWidth)
        .style('fill', function(range) {
          return range.getColor(chrIndex);
        });
    }

    /**
     * Get chromosome's shape main values
     */
    _getShapeData() {

      var firstQBand, i, lastBand, rightTerminalPosition;

      // First q band from bands sequence
      for (i = 0; i < this._model.bands.length; i++) {
        if (this._model.bands[i].name[0] === 'q') {
          firstQBand = this._model.bands[i];
          break;
        }
      }

      // Chromosome's right position
      lastBand = this._model.bands.length - 1;
      rightTerminalPosition = this._model.bands[lastBand].px.stop;

      // Properties description:
      // x1 - left terminal start position
      // x2 - centromere position
      // x3 - right terminal end position
      // w - chromosome width
      // b - bump size
      return {
        x1: 0,
        x2: firstQBand ? firstQBand.px.start : rightTerminalPosition,
        x3: rightTerminalPosition,
        w: this._config.chrWidth,
        b: this._config.chrWidth / this._bumpCoefficient
      };
    }

    _getPArmShape() {
      var d = this._getShapeData(),
        x = d.x2 - d.b;

      if (this.isFullyBanded() || 'ancestors' in this._ideo.config) {
        // Encountered when chromosome has any of:
        //  - One placeholder "band", e.g. pig genome GCF_000003025.5
        //  - Many (> 2) bands, e.g. human reference genome
        //  - Ancestor colors in ploidy configuration, as in ploidy-basic.html
        return {
          class: '',
          path:
            'M' + d.b + ',0 ' +
            'L' + x + ',0 ' +
            'Q' + (d.x2 + d.b) + ',' + (d.w / 2) + ',' + x + ',' + d.w + ' ' +
            'L' + d.b + ',' + d.w + ' ' +
            'Q-' + d.b + ',' + (d.w / 2) + ',' + d.b + ',0'
        };
      } else {
        // e.g. chimpanzee assembly Pan_tro 3.0
        return [{
          class: '',
          path:
            'M' + d.b + ',0 ' +
            'L' + (x - 2) + ',0 ' +
            'L' + (x - 2) + ',' + d.w + ' ' +
            'L' + d.b + ',' + d.w + ' ' +
            'Q-' + d.b + ',' + (d.w / 2) + ',' + d.b + ',0'
        }, {
          class: 'acen',
          path:
            'M' + x + ',0 ' +
            'Q' + (d.x2 + d.b) + ',' + (d.w / 2) + ',' + x + ',' + d.w + ' ' +
            'L' + x + ',' + d.w + ' ' +
            'L' + (x - 2) + ',' + d.w + ' ' +
            'L' + (x - 2) + ',0'
        }];
      }
    }

    _getQArmShape() {
      var d = this._getShapeData(),
        x = d.x3 - d.b,
        x2b = d.x2 + d.b;

      if (this.isFullyBanded() || 'ancestors' in this._ideo.config) {
        return {
          class: '',
          path:
            'M' + x2b + ',0 ' +
            'L' + x + ',0 ' +
            'Q' + (d.x3 + d.b) + ',' + (d.w / 2) + ',' + x + ',' + d.w + ' ' +
            'L' + x2b + ',' + d.w + ' ' +
            'Q' + (d.x2 - d.b) + ',' + (d.w / 2) + ',' + x2b + ',0'
        };
      } else {
        // e.g. chimpanzee assembly Pan_tro 3.0
        return [{
          path:
            'M' + x2b + ',0 ' +
            'L' + x + ',0 ' +
            'Q' + (d.x3 + d.b) + ',' + (d.w / 2) + ',' + x + ',' + d.w + ' ' +
            'L' + x2b + ',' + d.w + ' ' +
            'L' + x2b + ',0'
        }, {
          class: 'acen',
          path:
            'M' + x2b + ',0' +
            'Q' + (d.x2 - d.b) + ',' + (d.w / 2) + ',' + x2b + ',' + d.w + ' ' +
            'L' + x2b + ',' + d.w +
            'L' + (x2b + 2) + ',' + d.w +
            'L' + (x2b + 2) + ',0'
        }];
      }
    }

    isFullyBanded() {
      return (
        this._model.bands &&
        (this._model.bands.length !== 2 || this._model.bands[0].name[0] === 'q')
      );
    }

    /**
     * Render arm bands
     */
    _renderBands(container, chrSetIndex, chrIndex, bands, arm) {

      var self, armIndex, fill;

      self = this;
      armIndex = arm === 'p' ? 0 : 1;
      fill = '';

      if ('ancestors' in self._ideo.config && !(self.isFullyBanded())) {
        fill = self._color.getArmColor(chrSetIndex, chrIndex, armIndex);
      }

      container.selectAll('path.band.' + arm)
        .data(bands)
        .enter()
        .append('path')
        .attr('id', function(d) {
          return self._model.id + '-' + d.name.replace('.', '-');
        })
        .attr('class', function(d) {
          return 'band ' + arm + '-band ' + d.stain;
        })
        .attr('d', function(d) {
          var start, length;

          start = self._ideo.round(d.px.start);
          length = self._ideo.round(d.px.width);

          return 'M ' + start + ', 0' +
                'l ' + length + ' 0 ' +
                'l 0 ' + self._config.chrWidth + ' ' +
                'l -' + length + ' 0 z';
        })
        .style('fill', fill);
    }

    /**
     * Render a chromosome arm.
     * Returns boolean indicating if any bands were rendered.
     */
    _renderArm(container, chrSetIndex, chrIndex, arm) {
      var bands = this._model.bands.filter(function(band) {
        return band.name[0] === arm;
      });

      this._renderBands(container, chrSetIndex, chrIndex, bands, arm);

      return Boolean(bands.length);
    }
  }

  class MetacentricChromosome extends Chromosome {

    constructor(model, config, ideo) {
      super(model, config, ideo);
      this._class = 'MetacentricChromosome';
    }
  }

  class TelocentricPChromosome extends Chromosome {

    constructor(model, config, ideo) {
      // alert('p')
      super(model, config, ideo);
      this._class = 'TelocentricPChromosome';
      this._pArmOffset = 3;
    }

    _addPArmShape(clipPath) {
      return clipPath.concat(this._getPArmShape());
    }

    _getPArmShape() {
      // Properties description:
      // x1 - left terminal start position
      // x2 - centromere position
      // x3 - right terminal end position
      // w - chromosome width
      // b - bump size
      var d = this._getShapeData();
      d.o = this._pArmOffset;

      return [{
        class: 'acen',
        path: 'M' + (d.x2 + 2) + ',1' +
        'L' + (d.x2 + d.o + 3.25) + ',1 ' +
        'L' + (d.x2 + d.o + 3.25) + ',' + (d.w - 1) + ' ' +
        'L' + (d.x2 + 2) + ',' + (d.w - 1)
      }, {
        class: 'gpos66',
        path: 'M' + (d.x2 - d.o + 5) + ',0' +
        'L' + (d.x2 - d.o + 3) + ',0 ' +
        'L' + (d.x2 - d.o + 3) + ',' + d.w + ' ' +
        'L' + (d.x2 - d.o + 5) + ',' + d.w,
        strokeWidth: 0.5
      }];
    }

    _getQArmShape() {
      // Properties description:
      // x1 - left terminal start position
      // x2 - centromere position
      // x3 - right terminal end position
      // w - chromosome width
      // b - bump size
      var d = this._getShapeData(),
        x = d.x3 - d.b,
        o = this._pArmOffset + 3;

      return {
        class: '',
        path:
        'M' + (d.x2 + o) + ',0 ' +
        'L' + x + ',0 ' +
        'Q' + (d.x3 + d.b) + ',' + (d.w / 2) + ',' + x + ',' + d.w + ' ' +
        'L' + (d.x2 + o) + ',' + d.w
      };
    }
  }

  class TelocentricQChromosome extends Chromosome {

    constructor(model, config, ideo) {
      // alert('q')
      super(model, config, ideo);
      this._class = 'TelocentricQChromosome';
      this._qArmOffset = 3;
    }

    _getPArmShape() {
      // Properties description:
      // x1 - left terminal start position
      // x2 - centromere position
      // x3 - right terminal end position
      // w - chromosome width
      // b - bump size

      var d = this._getShapeData(),
        x = d.x3 - d.b,
        o = this._qArmOffset;

      return {
        class: '',
        path:
        // 'M1,0, ' +
        'M' + (d.x2 + o) + ',0 ' +
        'L' + (x + o) + ',0 ' +
        'L' + (x + o) + ',' + d.w + ' ' +
        'L' + d.b + ',' + d.w + ' ' +
        'Q-' + d.b + ',' + (d.w / 2) + ',' + d.b + ',0'
      };
    }

    _addQArmShape(clipPath) {
      return clipPath.concat(this._getQArmShape());
    }

    _getQArmShape() {
      // Properties description:
      // x1 - left terminal start position
      // x2 - centromere position
      // x3 - right terminal end position
      // w - chromosome width
      // b - bump size
      var d = this._getShapeData();
      d.o = this._qArmOffset;

      return [{
        class: 'acen',
        path: 'M' + (d.x2 + 2) + ',1 ' +
        'L' + (d.x2 + d.o + 3.25) + ',1 ' +
        'L' + (d.x2 + d.o + 3.25) + ',' + (d.w - 1) + ' ' +
        'L' + (d.x2 + 2) + ',' + (d.w - 1)
      }, {
        class: 'gpos66',
        path: 'M' + (d.x2 + d.o + 5) + ',0 ' +
        'L' + (d.x2 + d.o + 3) + ',0 ' +
        'L' + (d.x2 + d.o + 3) + ',' + d.w + ' ' +
        'L' + (d.x2 + d.o + 5) + ',' + d.w,
        strokeWidth: 0.5
      }];
    }
  }

  /**
   * Adds a copy of a chromosome (i.e. a homologous chromosome, homolog) to DOM
   *
   * @param chrModel
   * @param chrIndex
   * @param homologIndex
   * @param container
   */
  function appendHomolog(chrModel, chrIndex, homologIndex, container) {

    var homologOffset, chromosome, shape, defs, adapter;

    defs = d3.select(this.selector + ' defs');
    // Get chromosome model adapter class
    adapter = ModelAdapter.getInstance(chrModel);

    // How far this copy of the chromosome is from another
    homologOffset = homologIndex * this.config.chrMargin;

    // Append chromosome's container
    chromosome = container
      .append('g')
      .attr('id', chrModel.id)
      .attr('class', 'chromosome ' + adapter.getCssClass())
      .attr('transform', 'translate(0, ' + homologOffset + ')');

    // Render chromosome
    shape = Chromosome.getInstance(adapter, this.config, this)
      .render(chromosome, chrIndex, homologIndex);

    d3.select('#' + chrModel.id + '-chromosome-set-clippath').remove();

    defs.append('clipPath')
      .attr('id', chrModel.id + '-chromosome-set-clippath')
      .selectAll('path')
      .data(shape)
      .enter()
      .append('path')
      .attr('d', function(d) {return d.path;})
      .attr('class', function(d) {return d.class;});


    if (chrModel.width < 1) {
      d3.select('#' + chrModel.id + ' .bands').style('opacity', 0);
    }
  }

  /**
   * Renders all the bands and outlining boundaries of a chromosome.
   */
  function drawChromosome(chrModel) {
    var chrIndex, container, numChrsInSet, transform, homologIndex,
      chrSetSelector;

    chrIndex = chrModel.chrIndex;

    transform = this._layout.getChromosomeSetTranslate(chrIndex);

    chrSetSelector = this.selector + ' #' + chrModel.id + '-chromosome-set';

    d3.selectAll(chrSetSelector + ' g').remove();

    container = d3.select(chrSetSelector);

    if (container.nodes().length === 0) {
      // Append chromosome set container
      container = d3.select(this.selector)
        .append('g')
        .attr('class', 'chromosome-set')
        .attr('transform', transform)
        .attr('id', chrModel.id + '-chromosome-set');
    }

    if (
      'sex' in this.config &&
      this.config.ploidy === 2 &&
      this.sexChromosomes.index === chrIndex
    ) {
      this.drawSexChromosomes(container, chrIndex);
      return;
    }

    numChrsInSet = 1;
    if (this.config.ploidy > 1) {
      numChrsInSet = this._ploidy.getChromosomesNumber(chrIndex);
    }

    for (homologIndex = 0; homologIndex < numChrsInSet; homologIndex++) {
      this.appendHomolog(chrModel, chrIndex, homologIndex, container);
    }
  }

  /**
   * Rotates a chromosome 90 degrees and shows or hides all other chromosomes
   * Useful for focusing or defocusing a particular chromosome
   */
  function rotateAndToggleDisplay(chrElement) {
    var chrName, chrModel, chrIndex;

    this.unhighlight();

    // Do nothing if taxid not defined. But it should be defined.
    // To fix that bug we should have a way to find chromosome set number.
    if (!this.config.taxid) return;

    chrName = chrElement.id.split('-')[0].replace('chr', '');
    chrModel = this.chromosomes[this.config.taxid][chrName];
    chrIndex = chrModel.chrIndex;

    this._layout.rotate(chrIndex, chrIndex, chrElement);
  }

  function setOverflowScroll() {
    var ideo, config, ideoWidth, ideoInnerWrap, ideoMiddleWrap, ideoSvg,
      ploidy, ploidyPad;

    ideo = this;
    config = ideo.config;

    ideoSvg = d3.select(config.container + ' svg#_ideogram');
    ideoInnerWrap = d3.select(config.container + ' #_ideogramInnerWrap');
    ideoMiddleWrap = d3.select(config.container + ' #_ideogramMiddleWrap');

    ploidy = config.ploidy;
    if (ploidy === 1) {
      ploidyPad = ploidy;
    } else {
      ploidyPad = ploidy * 1.12;
    }

    let annotHeight = 0;
    if ('annotationsLayout' in config) {
      annotHeight = config.annotationHeight * config.numAnnotTracks;
    }

    if (
      config.orientation === 'vertical' &&
      config.perspective !== 'comparative' &&
      config.geometry !== 'collinear'
    ) {
      ideoWidth =
        (ideo.numChromosomes) *
        (config.chrWidth + config.chrMargin + annotHeight);
    } else {
      return;
    }

    if (config.annotationsLayout === 'heatmap-2d') {
      return;
    }

    ideoWidth = Math.ceil(ideoWidth * ploidyPad / config.rows);
    if (ideo._layout._class === 'SmallLayout') ideoWidth += 100;

    ideoWidth += 35; // Account for settings gear

    // Ensures absolutely-positioned elements, e.g. heatmap overlaps, display
    // properly if ideogram container also has position: absolute
    ideoMiddleWrap.style('height', ideo._layout.getHeight() + 'px');

    ideoInnerWrap
      .style('max-width', ideoWidth + 'px')
      .style('overflow-x', 'scroll')
      .style('position', 'absolute');

    ideoSvg.style('min-width', (ideoWidth - 5) + 'px');

    if (ideo.config.showTools) {
      initTools(ideo);
    }
  }

  function getChrSetLabelLines(d, i, ideo) {
    var lines;
    if (d.name.indexOf(' ') === -1) {
      lines = [d.name];
    } else {
      lines = d.name.match(/^(.*)\s+([^\s]+)$/).slice(1).reverse();
    }

    if (
      'sex' in ideo.config &&
      ideo.config.ploidy === 2 &&
      i === ideo.sexChromosomes.index
    ) {
      if (ideo.config.sex === 'male') {
        lines = ['XY'];
      } else {
        lines = ['XX'];
      }
    }

    return lines;
  }

  function renderChromosomeSetLabel(d, i, textElement, ideo) {
    // Get label lines
    var lines = getChrSetLabelLines(d, i, ideo);

    // Render label lines
    d3.select(textElement).selectAll('tspan')
      .data(lines)
      .enter()
      .append('tspan')
      .attr('dy', function(d, i) {
        return i * -1.2 + 'em';
      })
      .attr('x', ideo._layout.getChromosomeSetLabelXPosition())
      .attr('class', function(a, i) {
        var fullLabels = ideo.config.fullChromosomeLabels;
        return i === 1 && fullLabels ? 'italic' : null;
      })
      .text(String);
  }

  function appendChromosomeSetLabels(ideo) {
    var layout = ideo._layout;

    d3.selectAll(ideo.selector + ' .chromosome-set')
      .insert('text', ':first-child')
      .data(ideo.chromosomesArray)
      .attr('class', layout.getChromosomeLabelClass())
      .attr('transform', layout.getChromosomeSetLabelTranslate())
      .attr('x', layout.getChromosomeSetLabelXPosition())
      .attr('y', function(d, i) {
        return layout.getChromosomeSetLabelYPosition(i);
      })
      .attr('text-anchor', layout.getChromosomeSetLabelAnchor())
      .each(function(d, i) {
        renderChromosomeSetLabel(d, i, this, ideo);
      });
  }

  function appendChromosomeLabels(ideo) {
    var layout = ideo._layout;

    d3.selectAll(ideo.selector + ' .chromosome-set')
      .each(function(a, chrSetIndex) {
        d3.select(this).selectAll('.chromosome')
          .append('text')
          .attr('class', 'chrLabel')
          .attr('transform', layout.getChromosomeSetLabelTranslate())
          .attr('x', function(d, i) {
            return layout.getChromosomeLabelXPosition(i);
          })
          .attr('y', function(d, i) {
            return layout.getChromosomeLabelYPosition(i);
          })
          .text(function(d, chrIndex) {
            return ideo._ploidy.getAncestor(chrSetIndex, chrIndex);
          })
          .attr('text-anchor', 'middle');
      });
  }

  /**
   * Draws labels for each chromosome, e.g. "1", "2", "X".
   * If ideogram configuration has 'fullChromosomeLabels: True',
   * then labels includes name of taxon, which can help when
   * depicting orthologs.
   */
  function drawChromosomeLabels() {
    var ideo = this;
    appendChromosomeSetLabels(ideo);
    appendChromosomeLabels(ideo);
  }

  function getLabelPositionAttrs(scale) {
    var x, y, scaleSvg;

    if (
      typeof (scale) !== 'undefined' &&
      scale.hasOwnProperty('x') &&
      !(scale.x === 1 && scale.y === 1)
    ) {
      scaleSvg = 'scale(' + scale.x + ',' + scale.y + ')';
      x = -6;
      y = (scale === '' ? -16 : -14);
    } else {
      x = -8;
      y = -16;
      scale = {x: 1, y: 1};
      scaleSvg = '';
    }

    return {x: x, y: y, scaleSvg: scaleSvg, scale: scale};
  }

  function updateChrIndex(chrIndex, config) {
    if (config.numAnnotTracks > 1 || config.orientation === '') chrIndex -= 1;
    return chrIndex;
  }

  function rotateVerticalChromosomeLabels(chr, chrIndex, labelPosAttrs, ideo) {
    var chrMargin2, chrMargin, y,
      config = ideo.config;

    chrIndex = updateChrIndex(chrIndex, config);

    chrMargin2 = -4;
    if (config.showBandLabels === true) {
      chrMargin2 = config.chrMargin + config.chrWidth + 26;
    }

    chrMargin = config.chrMargin * chrIndex;
    if (config.numAnnotTracks > 1 === false) chrMargin += 1;

    y = chrMargin + chrMargin2;

    chr.selectAll('text.chrLabel')
      .attr('transform', labelPosAttrs.scaleSvg)
      .selectAll('tspan')
      .attr('x', labelPosAttrs.x)
      .attr('y', y);
  }

  function rotateHorizontalChromosomeLabels(chr, chrIndex, labelPosAttrs, ideo) {
    var chrMargin, chrMargin2, tracksHeight, x,
      config = ideo.config;

    chrMargin2 = -config.chrWidth - 2;
    if (config.showBandLabels === true) chrMargin2 = config.chrMargin + 8;

    tracksHeight = config.annotTracksHeight;
    if (config.annotationsLayout !== 'overlay') tracksHeight *= 2;

    chrMargin = config.chrMargin * chrIndex;
    x = -(chrMargin + chrMargin2) + 3 + tracksHeight;
    x /= labelPosAttrs.scale.x;

    chr.selectAll('text.chrLabel')
      .attr('transform', 'rotate(-90)' + labelPosAttrs.scaleSvg)
      .selectAll('tspan')
      .attr('x', x)
      .attr('y', labelPosAttrs.y);
  }

  /**
   * Rotates chromosome labels by 90 degrees, e.g. upon clicking a chromosome.
   */
  function rotateChromosomeLabels(chr, chrIndex, orientation, scale) {
    var labelPosAttrs,
      ideo = this;

    chrIndex -= 1;

    labelPosAttrs = getLabelPositionAttrs(scale);

    if (orientation === 'vertical' || orientation === '') {
      rotateVerticalChromosomeLabels(chr, chrIndex, labelPosAttrs, ideo);
    } else {
      rotateHorizontalChromosomeLabels(chr, chrIndex, labelPosAttrs, ideo);
    }
  }

  /** Get time in milliseconds between a start time (t0) and now */
  function timeDiff(t0) {
    return Math.round(performance.now() - t0);
  }

  /** Initialize performance analysis settings */
  function initAnalyzeRelatedGenes(ideo) {
    ideo.time = {
      rg: { // times for related genes
        t0: performance.now()
      }
    };
    if ('_didRelatedGenesFirstPlot' in ideo) {
      delete ideo._didRelatedGenesFirstPlot;
    }
  }

  function getRelatedGenesByType() {
    const ideo = this;
    const relatedGenes = ideo.annotDescriptions.annots;

    const related = Object.values(relatedGenes);
    const paralogous = related.filter(r => r.type.includes('paralogous'));
    const interacting = related.filter(r => r.type.includes('interacting gene'));
    const searched = Object.entries(relatedGenes)
      .filter((entry) => entry[1].type.includes('searched gene'))[0][0];

    return {related, paralogous, interacting, searched};
  }

  function getRelatedGenesTooltipAnalytics(annot) {
    const ideo = this;

    const timeSincePrevTooltip = performance.now() - ideo.time.prevTooltipOff;
    const prevAnnotDomId = ideo.time.prevTooltipAnnotDomId;

    if (timeSincePrevTooltip < 300 && annot.domId === prevAnnotDomId) {
      return null;
    }

    const tooltipGene = annot.name;

    // e.g. "interacting gene" -> "interacting"
    const tooltipRelatedType =
      ideo.annotDescriptions.annots[annot.name].type.split(' ')[0];

    const countsByType = getCountsByType(ideo);

    const analytics = Object.assign(
      {tooltipGene, tooltipRelatedType}, countsByType
    );

    return analytics;
  }

  /** Compute granular related genes plotting analytics */
  function analyzePlotTimes(type, ideo) {
    // Paralogs and interacting genes:
    // http://localhost:8080/examples/vanilla/related-genes?q=RAD51
    //
    // No paralogs:
    // http://localhost:8080/examples/vanilla/related-genes?q=BRCA1&org=mus-musculus
    //
    // No interacting genes:
    // http://localhost:8080/examples/vanilla/related-genes?q=DMC1
    //
    // No paralogs, no interacting genes:
    // http://localhost:8080/examples/vanilla/related-genes?q=BRCA1&org=macaca-mulatta


    const otherTypes = {
      paralogous: 'interacting',
      interacting: 'paralogous'
    };
    const related = ideo.getRelatedGenesByType();
    const otherType = otherTypes[type];
    const numThisRelated = related[type].length;
    const numOtherRelated = related[otherType] ? related[otherType].length : 0;

    if (!ideo._didRelatedGenesFirstPlot) {
      // 1st of 2 attempted plot logs
      ideo._didRelatedGenesFirstPlot = true;

      ideo.time.rg.totalFirstPlot = timeDiff(ideo.time.rg.t0);

      if (numThisRelated > 0) {
        ideo.time.rg.timestampFirstPlot = performance.now();
        ideo._relatedGenesFirstPlotType = type;
      }
    } else {
      // 2nd of 2 attempted plot logs
      if (numThisRelated > 0 && numOtherRelated > 0) {
        // Paralogs and interacting genes were found, e.g. human RAD51
        const timestampFirstPlot = ideo.time.rg.timestampFirstPlot;
        ideo.time.rg.totalLastPlotDiff = timeDiff(timestampFirstPlot);
      } else if (numThisRelated > 0 && numOtherRelated === 0) {
        // Other attempt did not plot, and this did, so log this as 1st
        // Often seen when no interacting genes found, e.g. human DMC1
        ideo.time.rg.timestampFirstPlot = performance.now();
        ideo.time.rg.totalFirstPlot = timeDiff(ideo.time.rg.t0);
        ideo._relatedGenesFirstPlotType = type;
        ideo.time.rg.totalLastPlotDiff = 0;

      } else if (numThisRelated === 0 && numOtherRelated > 0) {
        // This attempt did not plot, the other did, so log 1st plot as also last
        // Often seen when no paralogs found, e.g. mouse BRCA1
        ideo.time.rg.totalLastPlotDiff = 0;
      } else {
        // No related genes found, so note only the searched gene is plotted
        // Example: Macaca mulatta BRCA1
        ideo._relatedGenesFirstPlotType = 'searched';
        ideo.time.rg.totalLastPlotDiff = 0;
      }
    }
  }

  function getCountsByType(ideo) {
    const related = ideo.getRelatedGenesByType();

    const numRelatedGenes = related['related'].length;
    const numParalogs = related['paralogous'].length;
    const numInteractingGenes = related['interacting'].length;
    const searchedGene = related['searched'];

    return {
      numRelatedGenes, numParalogs, numInteractingGenes, searchedGene
    };
  }

  /** Summarizes number and kind of related genes, performance, etc. */
  function analyzeRelatedGenes(ideo) {

    const countsByType = getCountsByType(ideo);

    const timeTotal = ideo.time.rg.total;
    const timeTotalFirstPlot = ideo.time.rg.totalFirstPlot;
    const timeTotalLastPlotDiff = ideo.time.rg.totalLastPlotDiff;
    const timeParalogs = ideo.time.rg.paralogs;
    const timeInteractingGenes = ideo.time.rg.interactions;
    const timeSearchedGene = ideo.time.rg.searchedGene;
    const firstPlotType = ideo._relatedGenesFirstPlotType;

    const analytics = Object.assign({
      firstPlotType,
      timeTotal, timeTotalFirstPlot, timeTotalLastPlotDiff,
      timeSearchedGene, timeInteractingGenes, timeParalogs
    }, countsByType);

    ideo.relatedGenesAnalytics = analytics;
  }

  /**
   * @fileoverview Fetch cached gene data: name, position, etc.
   *
   * Gene cache eliminates needing to fetch names and positions of genes.
   *
   * Use cases:
   *
   * - test if a given string is a gene name, e.g. for gene search
   * - find genomic position of a given gene (or all genes)
   *
   */

  /** Get URL for gene cache file */
  function getCacheUrl(orgName, cacheDir, ideo) {
    const organism = slug(orgName);

    if (!cacheDir) {
      const splitDataDir = ideo.config.dataDir.split('/');
      const dataIndex = splitDataDir.indexOf('data');
      const baseDir = splitDataDir.slice(0, dataIndex).join('/') + '/data/';
      cacheDir = baseDir + 'annotations/gene-cache/';
    }

    const cacheUrl = cacheDir + organism + '.tsv';

    return cacheUrl;
  }

  /**
   * Convert array of [chr, start, gene] arrays to Ideogram annotations
   * sorted by genomic position.
   */
  function parseAnnots(chrStartGenes) {
    const chromosomes = {};

    chrStartGenes.forEach(([chromosome, start, gene]) => {
      if (!(chromosome in chromosomes)) {
        chromosomes[chromosome] = {chr: chromosome, annots: []};
      } else {
        chromosomes[chromosome].annots.push({name: gene, start});
      }
    });

    const annotsSortedByPosition = {};

    Object.entries(chromosomes).forEach(([chr, annotsByChr]) => {
      annotsSortedByPosition[chr] = {
        chr,
        annots: annotsByChr.annots.sort((a, b) => a.start - b.start)
      };
    });

    return annotsSortedByPosition;
  }

  /** Parse a gene cache TSV file, return array of useful transforms */
  function parseCache(rawTsv) {
    const citedNames = [];
    const lociByName = {};
    const chrStartGenes = [];

    const lines = rawTsv.split(/\r\n|\n/);

    lines.forEach((line) => {
      if (line[0] === '#' || line === '') return; // Skip headers, empty lines
      const [chromosome, rawStart, gene] = line.split(/\t/);
      const start = parseInt(rawStart);
      chrStartGenes.push([chromosome, start, gene]);

      citedNames.push(gene);
      lociByName[gene] = [chromosome, start];
    });

    const sortedAnnots = parseAnnots(chrStartGenes);

    return [citedNames, lociByName, sortedAnnots];
  }

  /** Reports if current organism has a gene cache */
  function hasGeneCache(orgName) {
    const taxid = getEarlyTaxid(orgName);
    const metadata = organismMetadata[taxid];
    return ('hasGeneCache' in metadata && metadata.hasGeneCache === true);
  }

  /**
   * Fetch cached gene data, transform it usefully, and set it as ideo prop
   */
  async function initGeneCache(orgName, ideo, cacheDir=null) {

    if (!hasGeneCache(orgName)) {
      return; // Skip initialization if cache doesn't exist
    }

    const cacheUrl = getCacheUrl(orgName, cacheDir, ideo);

    const response = await fetch(cacheUrl);
    const data = await response.text();

    const [citedNames, lociByName, sortedAnnots] = parseCache(data);

    ideo.geneCache = {
      citedNames, // Array of gene names, ordered by citation count
      lociByName, // Object of gene positions, keyed by gene name
      sortedAnnots // Ideogram annotations sorted by genomic position
    };
  }

  /**
   * @fileoverview Kit used in "Related genes" example
   *
   * This file simplifies client code for reusing a "related genes" ideogram --
   * which finds and displays related genes for a searched gene.
   *
   * Related genes here are either "interacting genes" or "paralogs".
   * Interacting genes are genes immediately upstream or downstream of the
   * searched gene in a biochemical pathway. Paralogs are evolutionarily
   * similar genes in the same species.
   *
   * Data sources:
   *   - Interacting genes: WikiPathways
   *   - Paralogs: Ensembl
   *   - Genomic coordinates: Ensembl, via MyGene.info
   *
   * Features provided by this module help users discover and explore genes
   * related to their gene of interest.
   *
   * The reference implementation is available at:
   * https://eweitz.github.io/ideogram/related-genes
   */

  /** Sets DOM IDs for ideo.relatedAnnots; needed to associate labels */
  function setRelatedAnnotDomIds(ideo) {
    const updated = [];

    const sortedChrNames = ideo.chromosomesArray.map((chr) => {
      return chr.name;
    });

    // Arrange related annots by chromosome
    const annotsByChr = {};
    ideo.relatedAnnots.forEach((annot) => {
      if (annot.chr in annotsByChr) {
        annotsByChr[annot.chr].push(annot);
      } else {
        annotsByChr[annot.chr] = [annot];
      }
    });

    // Sort related annots by relevance within each chromosome
    const relevanceSortedAnnotsNamesByChr = {};
    Object.entries(annotsByChr).map(([chr, annots]) => {

      // Reverse-sort, so first annots are drawn last, and thus at top layer
      annots.sort((a, b) => ideo.annotSortFunction(a, b));

      const annotNames = annots.map((annot) => annot.name).reverse();
      relevanceSortedAnnotsNamesByChr[chr] = annotNames;
    });

    ideo.relatedAnnots.forEach((annot) => {
      const chr = annot.chr;

      // Annots have DOM IDs keyed by chromosome index and annotation index.
      // We reconstruct those here using structures built in two blocks above.
      const chrIndex = sortedChrNames.indexOf(chr);
      const annotIndex =
        relevanceSortedAnnotsNamesByChr[chr].indexOf(annot.name);

      annot.domId = getAnnotDomId(chrIndex, annotIndex);
      updated.push(annot);
    });

    ideo.relatedAnnots = updated;
  }

  /**
   * Determines if interaction node might be a gene
   *
   * Some interaction nodes are biological processes; this filters out many.
   * Filtering these out makes downstream queries faster.
   *
   * ixn {Object} Interaction from WikiPathways
   * gene {Object} Gene from MyGene.info
   */
  function maybeGeneSymbol(ixn, gene) {
    return (
      ixn !== '' &&
      !ixn.includes(' ') &&
      !ixn.includes('/') && // e.g. Akt/PKB
      ixn.toLowerCase() !== gene.name.toLowerCase()
    );
  }

  // /** Helpful for debugging race conditions caused by concurrency */
  // const sleep = (delay) => {
  //  new Promise((resolve) => setTimeout(resolve, delay));
  // }

  /** Reports if interaction node is a gene and not previously seen */
  function isInteractionRelevant(rawIxn, gene, nameId, seenNameIds, ideo) {
    let isGeneSymbol;
    if ('geneCache' in ideo && gene.name) {
      isGeneSymbol = rawIxn in ideo.geneCache.lociByName;
    } else {
      isGeneSymbol = maybeGeneSymbol(rawIxn, gene);
    }

    return isGeneSymbol && !(nameId in seenNameIds);
  }

  /**
   * Retrieves interacting genes from WikiPathways API
   *
   * Docs:
   * https://webservice.wikipathways.org/ui/
   * https://www.wikipathways.org/index.php/Help:WikiPathways_Webservice/API
   *
   * Examples:
   * https://webservice.wikipathways.org/findInteractions?query=ACE2&format=json
   * https://webservice.wikipathways.org/findInteractions?query=RAD51&format=json
   */
  async function fetchInteractions(gene, ideo) {
    const ixns = {};
    const seenNameIds = {};
    const orgNameSimple = ideo.config.organism.replace(/-/g, ' ');
    const queryString = `?query=${gene.name}&format=json`;
    const url =
      `https://webservice.wikipathways.org/findInteractions${queryString}`;

    // await sleep(3000);

    const response = await fetch(url);
    const data = await response.json();

    // For each interaction, get nodes immediately upstream and downstream.
    // Filter out pathway nodes that are definitely not gene symbols, then
    // group pathways by (likely) gene symbol. Each interacting gene can have
    // multiple pathways.
    data.result.forEach(interaction => {
      if (interaction.species.toLowerCase() === orgNameSimple) {
        const right = interaction.fields.right.values;
        const left = interaction.fields.left.values;
        // let mediator = [];
        // if ('mediator' in interaction.fields) {
        //   mediator = interaction.fields.mediator.values;
        //   console.log('mediator', mediator)
        // }
        // const rawIxns = right.concat(left, mediator);
        const rawIxns = right.concat(left);
        const name = interaction.name;
        const id = interaction.id;

        rawIxns.forEach(rawIxn => {

          // Prevent overwriting searched gene.  Occurs with e.g. human CD4
          if (rawIxn.includes(gene.name)) return;

          const nameId = name + id;

          const isRelevant =
            isInteractionRelevant(rawIxn, gene, nameId, seenNameIds, ideo);

          if (isRelevant) {
            seenNameIds[nameId] = 1;
            const ixn = {name, pathwayId: id};
            if (rawIxn in ixns) {
              ixns[rawIxn].push(ixn);
            } else {
              ixns[rawIxn] = [ixn];
            }
          }
        });
      }
    });

    return ixns;
  }

  /**
   * Queries MyGene.info API, returns parsed JSON
   *
   * Docs:
   * https://docs.mygene.info/en/v3/
   *
   * Example:
   * https://mygene.info/v3/query?q=symbol:cdk2%20OR%20symbol:brca1&species=9606&fields=symbol,genomic_pos,name
   */
  async function fetchMyGeneInfo(queryString) {
    const myGeneBase = 'https://mygene.info/v3/query';
    const response = await fetch(myGeneBase + queryString + '&size=20');
    const data = await response.json();
    return data;
  }

  function parseNameAndEnsemblIdFromMgiGene(gene) {
    const name = gene.name;
    const id = gene.genomic_pos.ensemblgene;
    let ensemblId = id;
    if (typeof id === 'undefined') {
      // Encountered in AKT3, when querying related genes for MTOR
      // A 'chr'omosome value containing _ indicates an alt loci scaffold,
      // so ignore that and take the Ensembl ID associated with the
      // first position of a primary chromosome.
      ensemblId =
        gene.genomic_pos.filter(pos => !pos.chr.includes('_'))[0].ensemblgene;
    }
    return {name, ensemblId};
  }

  /**
   * Summarizes interactions for a gene
   *
   * This comprises most of the content for tooltips for interacting genes.
   */
  function describeInteractions(gene, ixns, searchedGene) {

    const pathwayIds = [];
    const pathwayNames = [];
    let ixnsDescription = '';

    if (typeof ixns !== 'undefined') {
      // ixns is undefined when querying e.g. CDKN1B in human
      const pathwaysBase = 'https://www.wikipathways.org/index.php/Pathway:';
      const links = ixns.map(ixn => {
        const url = `${pathwaysBase}${ixn.pathwayId}`;
        pathwayIds.push(ixn.pathwayId);
        pathwayNames.push(ixn.name);
        return `<a href="${url}" target="_blank">${ixn.name}</a>`;
      }).join('<br/>');

      ixnsDescription =
        `Interacts with ${searchedGene.name} in:<br/>${links}`;
    }

    const {name, ensemblId} = parseNameAndEnsemblIdFromMgiGene(gene);
    const type = 'interacting gene';
    const descriptionObj = {
      description: ixnsDescription,
      ixnsDescription, ensemblId, name, type, pathwayIds, pathwayNames
    };
    return descriptionObj;
  }

  /**
   * Retrieves position and other data on interacting genes from MyGene.info
   */
  async function fetchInteractionAnnots(interactions, searchedGene, ideo) {

    const annots = [];
    const geneList = Object.keys(interactions);

    if (geneList.length === 0) return annots;

    const ixnParam = geneList.map(ixn => {
      return `symbol:${ixn.trim()}`;
    }).join(' OR ');

    const taxid = ideo.config.taxid;
    const queryString =
      `?q=${ixnParam}&species=${taxid}&fields=symbol,genomic_pos,name`;
    const data = await fetchMyGeneInfo(queryString);

    data.hits.forEach(gene => {
      // If hit lacks position
      // or is same as searched gene (e.g. search for human SRC),
      // then skip processing
      if (
        'genomic_pos' in gene === false ||
        gene.symbol === searchedGene.name
      ) {
        return;
      }

      const annot = parseAnnotFromMgiGene(gene, ideo, 'purple');
      annots.push(annot);

      const ixns = interactions[gene.symbol];

      const descriptionObj = describeInteractions(gene, ixns, searchedGene);

      mergeDescriptions(annot, descriptionObj, ideo);
    });

    return annots;
  }

  // Commented out because call to Ensembl threw false-positive 400 error
  // Also had historically been slow, and included an extraneous OPTIONS
  // request that would often double effective response time.
  //
  // See alternative in fetchParalogPositionsFromMyGeneInfo
  //
  // /** Fetch positions of paralogs from Ensembl REST API */
  // async function fetchParalogPositionsFromEnsembl(homologs, ideo) {
  //   const annots = [];
  //   const orgUnderscored = ideo.config.organism.replace(/[ -]/g, '_');

  //   const homologIds = homologs.map(homolog => homolog.id);
  //   const path = '/lookup/id/' + orgUnderscored;
  //   const body = {
  //     ids: homologIds,
  //     species: orgUnderscored,
  //     object_type: 'gene'
  //   };
  //   const ensemblHomologGenes =
  //     await Ideogram.fetchEnsembl(path, body, 'POST');

  //   Object.entries(ensemblHomologGenes).map((idGene, i) => {
  //     const gene = idGene[1];

  //     // Seen in related genes for SIRT2 in Pan troglodytes
  //     if ('display_name' in gene === false) return;

  //     const annot = {
  //       name: gene.display_name,
  //       chr: gene.seq_region_name,
  //       start: gene.start,
  //       stop: gene.end,
  //       id: gene.id,
  //       color: 'pink'
  //     };

  //     annots.push(annot);
  //     const description = gene.description;
  //     const ensemblId = gene.id;
  //     const name = gene.description.split(' [')[0];
  //     const type = 'paralogous gene';
  //     const descriptionObj = {description, ensemblId, name, type};
  //     ideo.annotDescriptions.annots[annot.name] = descriptionObj;
  //   });

  //   return annots;
  // }

  /** Fetch paralog positions from MyGeneInfo */
  async function fetchParalogPositionsFromMyGeneInfo(
    homologs, searchedGene, ideo
  ) {
    const annots = [];
    const qParam = homologs.map(homolog => {
      return `ensemblgene:${homolog.id}`;
    }).join(' OR ');

    const taxid = ideo.config.taxid;
    const queryString =
      `?q=${qParam}&species=${taxid}&fields=symbol,genomic_pos,name`;
    const data = await fetchMyGeneInfo(queryString);

    data.hits.forEach(gene => {

      // If hit lacks position, skip processing
      if ('genomic_pos' in gene === false) return;
      if ('name' in gene === false) return;

      const annot = parseAnnotFromMgiGene(gene, ideo, 'pink');
      annots.push(annot);

      const description = `Paralog of ${searchedGene.name}`;
      const {name, ensemblId} = parseNameAndEnsemblIdFromMgiGene(gene);
      const type = 'paralogous gene';
      const descriptionObj = {description, ensemblId, name, type};
      mergeDescriptions(annot, descriptionObj, ideo);
    });

    return annots;
  }

  /**
   * Fetch paralogs of searched gene
   */
  async function fetchParalogs(annot, ideo) {
    const taxid = ideo.config.taxid;

    // Fetch paralogs
    const params = `&format=condensed&type=paralogues&target_taxon=${taxid}`;
    const path = `/homology/id/${annot.id}?${params}`;
    const ensemblHomologs = await Ideogram.fetchEnsembl(path);
    const homologs = ensemblHomologs.data[0].homologies;

    // Fetch positions of paralogs
    const annots =
      await fetchParalogPositionsFromMyGeneInfo(homologs, annot, ideo);

    return annots;
  }

  /**
   * Transforms MyGene.info (MGI) gene into Ideogram annotation
   */
  function parseAnnotFromMgiGene(gene, ideo, color='red') {
    // Filters out placements on alternative loci scaffolds, an advanced
    // genome assembly feature we are not concerned with in ideograms.
    //
    // Example:
    // https://mygene.info/v3/query?q=symbol:PTPRC&species=9606&fields=symbol,genomic_pos,name
    let genomicPos = null;
    if (Array.isArray(gene.genomic_pos)) {
      genomicPos = gene.genomic_pos.filter(pos => {
        return pos.chr in ideo.chromosomes[ideo.config.taxid];
      })[0];
    } else {
      genomicPos = gene.genomic_pos;
    }

    const annot = {
      name: gene.symbol,
      chr: genomicPos.chr,
      start: genomicPos.start,
      stop: genomicPos.end,
      id: genomicPos.ensemblgene,
      color
    };

    return annot;
  }

  function moveLegend() {
    const ideoInnerDom = document.querySelector('#_ideogramInnerWrap');
    const decorPad = setRelatedDecorPad({}).legendPad;
    const left = decorPad + 20;
    const legendStyle = `position: absolute; top: 15px; left: ${left}px`;
    const legend = document.querySelector('#_ideogramLegend');
    ideoInnerDom.prepend(legend);
    legend.style = legendStyle;
  }

  /** Filter annotations to only include those in configured list */
  function applyAnnotsIncludeList(annots, ideo) {

    if (ideo.config.annotsInList === 'all') return annots;

    const includedAnnots = [];
    annots.forEach(annot => {
      if (ideo.config.annotsInList.includes(annot.name.toLowerCase())) {
        includedAnnots.push(annot);
      }
    });
    return includedAnnots;
  }

  /** Fetch and draw interacting genes, return Promise for annots */
  function processInteractions(annot, ideo) {
    return new Promise(async (resolve) => {
      const t0 = performance.now();

      const interactions = await fetchInteractions(annot, ideo);
      const annots = await fetchInteractionAnnots(interactions, annot, ideo);

      ideo.relatedAnnots.push(...annots);
      finishPlotRelatedGenes('interacting', ideo);

      ideo.time.rg.interactions = timeDiff(t0);

      resolve();
    });
  }

  /** Find and draw paralogs, return Promise for annots */
  function processParalogs(annot, ideo) {
    return new Promise(async (resolve) => {
      const t0 = performance.now();

      const annots = await fetchParalogs(annot, ideo);
      ideo.relatedAnnots.push(...annots);
      finishPlotRelatedGenes('paralogous', ideo);

      ideo.time.rg.paralogs = timeDiff(t0);

      resolve();
    });
  }

  /** Sorts by relevance of related status */
  function sortAnnotsByRelatedStatus(a, b) {
    var aName, bName, aColor, bColor;
    if ('name' in a) {
      // Locally processed annotations
      aName = a.name;
      bName = b.name;
      aColor = a.color;
      bColor = b.color;
    } else {
      // Raw annotations
      [aName, aColor] = [a[0], a[3]];
      [bName, bColor] = [b[0], b[3]];
    }

    // Rank red (searched gene) highest
    if (aColor === 'red') return -1;
    if (bColor === 'red') return 1;

    // Rank purple (interacting gene) above red (paralogous gene)
    if (aColor === 'purple' && bColor === 'pink') return -1;
    if (bColor === 'purple' && aColor === 'pink') return 1;

    // Rank shorter names above longer names
    if (bName.length !== aName.length) return bName.length - aName.length;

    // Rank names of equal length alphabetically
    return [aName, bName].sort().indexOf(aName) === 0 ? 1 : -1;
  }

  function mergeDescriptions(annot, desc, ideo) {
    let mergedDesc;
    const descriptions = ideo.annotDescriptions.annots;
    if (annot.name in descriptions) {
      mergedDesc = descriptions[annot.name];
      mergedDesc.type += ', ' + desc.type;
      mergedDesc.description += `<br/><br/>${desc.description}`;
    } else {
      mergedDesc = desc;
    }

    ideo.annotDescriptions.annots[annot.name] = mergedDesc;
  }

  function mergeAnnots(unmergedAnnots) {

    const seenAnnots = {};
    let mergedAnnots = [];

    unmergedAnnots.forEach((annot) => {
      if (annot.name in seenAnnots === false) {
        mergedAnnots.push(annot);
        seenAnnots[annot.name] = 1;
      } else {
        if (annot.color === 'purple') {
          mergedAnnots = mergedAnnots.map((mergedAnnot) => {
            return (annot.name === mergedAnnot.name) ? annot : mergedAnnot;
          });
        }
      }
    });

    return mergedAnnots;
  }

  /** Filter, sort, draw annots.  Move legend. */
  function finishPlotRelatedGenes(type, ideo) {
    let annots = ideo.relatedAnnots.slice();

    annots = applyAnnotsIncludeList(annots, ideo);
    annots = mergeAnnots(annots);
    ideo.relatedAnnots = mergeAnnots(annots);
    annots.sort(sortAnnotsByRelatedStatus);
    ideo.relatedAnnots.sort(sortAnnotsByRelatedStatus);

    if (annots.length > 1 && ideo.onFindRelatedGenesCallback) {
      ideo.onFindRelatedGenesCallback();
    }

    ideo.drawAnnots(annots);

    if (ideo.config.showAnnotLabels) {
      setRelatedAnnotDomIds(ideo);
      ideo.fillAnnotLabels(ideo.relatedAnnots);
    }

    moveLegend();

    analyzePlotTimes(type, ideo);
  }

  /** Fetch position of searched gene, return corresponding annotation */
  async function processSearchedGene(geneSymbol, ideo) {
    const t0 = performance.now();

    // Fetch positon of searched gene
    const taxid = ideo.config.taxid;
    const queryString =
      `?q=symbol:${geneSymbol}&species=${taxid}&fields=symbol,genomic_pos,name`;
    const data = await fetchMyGeneInfo(queryString);

    if (data.hits.length === 0) {
      return;
    }
    const gene = data.hits[0];
    const name = gene.name;
    const ensemblId = gene.genomic_pos.ensemblgene;
    ideo.annotDescriptions.annots[gene.symbol] = {
      description: '', ensemblId, name, type: 'searched gene'
    };

    const annot = parseAnnotFromMgiGene(gene, ideo);

    ideo.relatedAnnots.push(annot);

    ideo.time.rg.searchedGene = timeDiff(t0);

    return annot;
  }

  function adjustPlaceAndVisibility(ideo) {
    var ideoContainerDom = document.querySelector(ideo.config.container);

    ideoContainerDom.style.visibility = '';
    ideoContainerDom.style.position = 'absolute';
    ideoContainerDom.style.width = '100%';

    var ideoInnerDom = document.querySelector('#_ideogramInnerWrap');
    ideoInnerDom.style.position = 'relative';
    ideoInnerDom.style.marginLeft = 'auto';
    ideoInnerDom.style.marginRight = 'auto';
    ideoInnerDom.style.overflowY = 'hidden';
    document.querySelector('#_ideogramMiddleWrap').style.overflowY = 'hidden';

    const legendPad = ideo.config.legendPad;

    if (typeof ideo.didAdjustIdeogramLegend === 'undefined') {
      // Accounts for moving legend when external content at left or right
      // is variable upon first rendering plotted genes

      var ideoDom = document.querySelector('#_ideogram');
      const legendWidth = 160;
      ideoInnerDom.style.maxWidth =
        (
          parseInt(ideoInnerDom.style.maxWidth) +
          legendWidth +
          legendPad
        ) + 'px';

      ideoDom.style.minWidth =
        (parseInt(ideoDom.style.minWidth) + legendPad) + 'px';
      ideoDom.style.maxWidth =
        (parseInt(ideoDom.style.minWidth) + legendPad) + 'px';
      ideoDom.style.position = 'relative';
      ideoDom.style.left = legendWidth + 'px';

      ideo.didAdjustIdeogramLegend = true;
    }
  }

  /**
   * For given gene, finds and draws interacting genes and paralogs
   *
   * @param geneSymbol {String} Gene symbol, e.g. RAD51
   */
  async function plotRelatedGenes(geneSymbol=null) {

    const ideo = this;

    ideo.clearAnnotLabels();
    const legend = document.querySelector('#_ideogramLegend');
    if (legend) legend.remove();

    if (!geneSymbol) {
      return plotGeneHints();
    }

    ideo.config = setRelatedDecorPad(ideo.config);

    const organism = ideo.getScientificName(ideo.config.taxid);
    const version = Ideogram.version;
    const headers = [
      `# Related genes for ${geneSymbol} in ${organism}`,
      `# Generated by Ideogram.js version ${version}, https://github.com/eweitz/ideogram`,
      `# Generated at ${window.location.href}`
    ].join('\n');

    delete ideo.annotDescriptions;
    ideo.annotDescriptions = {headers, annots: {}};

    const ideoSel = ideo.selector;
    const annotSel = ideoSel + ' .annot';
    document.querySelectorAll(annotSel).forEach(el => el.remove());

    ideo.startHideAnnotTooltipTimeout();

    // Refine style
    document.querySelectorAll('.chromosome').forEach(chromosome => {
      chromosome.style.cursor = '';
    });

    adjustPlaceAndVisibility(ideo);

    ideo.relatedAnnots = [];

    // Fetch positon of searched gene
    const annot = await processSearchedGene(geneSymbol, ideo);

    if (typeof annot === 'undefined') {
      // E.g. when searched gene is "Foo"
      const organism = ideo.organismScientificName;
      throw Error(`"${geneSymbol}" is not a known gene in ${organism}`);
    }

    ideo.config.legend = relatedLegend;
    writeLegend(ideo);
    moveLegend();

    await Promise.all([
      processInteractions(annot, ideo),
      processParalogs(annot, ideo)
    ]);

    ideo.time.rg.total = timeDiff(ideo.time.rg.t0);

    analyzeRelatedGenes(ideo);

    if (ideo.onPlotRelatedGenesCallback) ideo.onPlotRelatedGenesCallback();

  }

  function getAnnotByName$1(annotName, ideo) {
    var annotByName;
    ideo.annots.forEach(annotsByChr => {
      annotsByChr.annots.forEach(annot => {
        if (annotName === annot.name) {
          annotByName = annot;
        }
      });
    });
    return annotByName;
  }

  /**
   * Handles click within annotation tooltip
   *
   * Makes clicking link in tooltip behave same as clicking annotation
   */
  function handleTooltipClick(ideo) {
    const tooltip = document.querySelector('._ideogramTooltip');
    if (!ideo.addedTooltipClickHandler) {
      tooltip.addEventListener('click', () => {
        const geneDom = document.querySelector('#ideo-related-gene');
        const annotName = geneDom.textContent;
        const annot = getAnnotByName$1(annotName, ideo);
        ideo.onClickAnnot(annot);
      });

      // Ensures handler isn't added redundantly.  This is used because
      // addEventListener options like {once: true} don't suffice
      ideo.addedTooltipClickHandler = true;
    }
  }

  /**
   * Enhance tooltip shown on hovering over gene annotation
   */
  function decorateRelatedGene(annot) {
    const ideo = this;
    const descObj = ideo.annotDescriptions.annots[annot.name];
    const description =
      descObj.description.length > 0 ? `<br/>${descObj.description}` : '';
    const fullName = descObj.name;
    const style = 'style="color: #0366d6; cursor: pointer;"';

    annot.displayName =
      `<span id="ideo-related-gene" ${style}>${annot.name}</span><br/>` +
      `${fullName}<br/>` +
      `${description}` +
      `<br/>`;

    handleTooltipClick(ideo);

    return annot;
  }

  const shape = 'triangle';

  const legendHeaderStyle =
    `font-size: 14px; font-weight: bold; font-color: #333;`;
  const relatedLegend = [{
    name: `
    <div style="position: relative; left: -15px;">
      <div style="${legendHeaderStyle}">Related genes</div>
      <i>Click gene to search</i>
    </div>
  `,
    nameHeight: 50,
    rows: [
      {name: 'Interacting gene', color: 'purple', shape: shape},
      {name: 'Paralogous gene', color: 'pink', shape: shape},
      {name: 'Searched gene', color: 'red', shape: shape}
    ]
  }];

  const citedLegend = [{
    name: `
    <div style="position: relative; left: -15px;">
      <div style="${legendHeaderStyle}">Highly cited genes</div>
      <i>Click gene to search</i>
    </div>
  `,
    nameHeight: 30,
    rows: []
  }];

  /** Sets legendPad for related genes view */
  function setRelatedDecorPad(kitConfig) {
    if (kitConfig.showAnnotLabels) {
      kitConfig.legendPad = 70;
    } else {
      kitConfig.legendPad = 30;
    }
    return kitConfig;
  }

  /**
   * Wrapper for Ideogram constructor, with generic "Related genes" options
   *
   * This function is made available as a static method on Ideogram.
   *
   * @param {Object} config Ideogram configuration object
   */
  function _initRelatedGenes(config, annotsInList) {

    if (annotsInList !== 'all') {
      annotsInList = annotsInList.map(name => name.toLowerCase());
    }

    const kitDefaults = {
      showFullyBanded: false,
      rotatable: false,
      legend: relatedLegend,
      chrBorderColor: '#333',
      chrLabelColor: '#333',
      onWillShowAnnotTooltip: decorateRelatedGene,
      annotsInList: annotsInList,
      showTools: true,
      showAnnotLabels: true
    };

    if ('onWillShowAnnotTooltip' in config) {
      const key = 'onWillShowAnnotTooltip';
      const clientFn = config[key];
      const defaultFunction = kitDefaults[key];
      const newFunction = function(annot) {
        annot = defaultFunction.bind(this)(annot);
        annot = clientFn.bind(this)(annot);
        return annot;
      };
      kitDefaults[key] = newFunction;
      delete config[key];
    }

    // Override kit defaults if client specifies otherwise
    let kitConfig = Object.assign(kitDefaults, config);

    kitConfig = setRelatedDecorPad(kitConfig);

    const ideogram = new Ideogram(kitConfig);

    // Called upon completing last plot, including all related genes
    if (config.onPlotRelatedGenes) {
      ideogram.onPlotRelatedGenesCallback = config.onPlotRelatedGenes;
    }

    // Called upon 1) finding paralogs, and 2) finding interacting genes
    if (config.onFindRelatedGenes) {
      ideogram.onFindRelatedGenesCallback = config.onFindRelatedGenes;
    }

    ideogram.getTooltipAnalytics = getRelatedGenesTooltipAnalytics;

    ideogram.annotSortFunction = sortAnnotsByRelatedStatus;

    initAnalyzeRelatedGenes(ideogram);

    initGeneCache(ideogram.config.organism, ideogram);

    return ideogram;
  }

  function plotGeneHints() {
    const ideo = this;

    if (!ideo || 'annotDescriptions' in ideo) return;

    ideo.annotDescriptions = {annots: {}};

    ideo.flattenAnnots().map((annot) => {
      let description = [];
      if ('significance' in annot && annot.significance !== 'n/a') {
        description.push(annot.significance);
      }
      if ('citations' in annot && annot.citations !== undefined) {
        description.push(annot.citations);
      }
      description = description.join('<br/><br/>');
      ideo.annotDescriptions.annots[annot.name] = {
        description,
        name: annot.fullName
      };
    });

    adjustPlaceAndVisibility(ideo);
    moveLegend();
    ideo.fillAnnotLabels();
    const container = ideo.config.container;
    document.querySelector(container).style.visibility = '';
  }

  /**
   * Wrapper for Ideogram constructor, with generic "Related genes" options
   *
   * This function is made available as a static method on Ideogram.
   *
   * @param {Object} config Ideogram configuration object
   */
  function _initGeneHints(config, annotsInList) {

    delete config.onPlotRelatedGenes;

    if (annotsInList !== 'all') {
      annotsInList = annotsInList.map(name => name.toLowerCase());
    }

    const annotsPath =
      getDir('annotations/gene-cache/homo-sapiens-top-genes.tsv');

    const kitDefaults = {
      showFullyBanded: false,
      rotatable: false,
      legend: citedLegend,
      chrMargin: -4,
      chrBorderColor: '#333',
      chrLabelColor: '#333',
      onWillShowAnnotTooltip: decorateRelatedGene,
      annotsInList: annotsInList,
      showTools: true,
      showAnnotLabels: true,
      onDrawAnnots: plotGeneHints,
      annotationsPath: annotsPath
    };

    if ('onWillShowAnnotTooltip' in config) {
      const key = 'onWillShowAnnotTooltip';
      const clientFn = config[key];
      const defaultFunction = kitDefaults[key];
      const newFunction = function(annot) {
        annot = defaultFunction.bind(this)(annot);
        annot = clientFn.bind(this)(annot);
        return annot;
      };
      kitDefaults[key] = newFunction;
      delete config[key];
    }

    if ('onDrawAnnots' in config) {
      const key = 'onDrawAnnots';
      const clientFn = config[key];
      const defaultFunction = kitDefaults[key];
      const newFunction = function() {
        defaultFunction.bind(this)();
        clientFn.bind(this)();
      };
      kitDefaults[key] = newFunction;
      delete config[key];
    }

    // Override kit defaults if client specifies otherwise
    const kitConfig = Object.assign(kitDefaults, config);

    if (kitConfig.showAnnotLabels) {
      kitConfig.legendPad = 80;
    } else {
      kitConfig.legendPad = 30;
    }

    const ideogram = new Ideogram(kitConfig);

    // Called upon completing last plot, including all related genes
    if (config.onPlotRelatedGenes) {
      ideogram.onPlotRelatedGenesCallback = config.onPlotRelatedGenes;
    }

    // Called upon 1) finding paralogs, and 2) finding interacting genes
    if (config.onFindRelatedGenes) {
      ideogram.onFindRelatedGenesCallback = config.onFindRelatedGenes;
    }

    ideogram.getTooltipAnalytics = getRelatedGenesTooltipAnalytics;

    ideogram.annotSortFunction = sortAnnotsByRelatedStatus;

    initAnalyzeRelatedGenes(ideogram);

    return ideogram;
  }

  /**
   * @fileoverview Core module of Ideogram.js, links all other modules
   * This file defines the Ideogram class, its constructor method, and its
   * static methods.  All instance methods are defined in other modules.
   *
   */

  class Ideogram$1 {
    constructor(config) {

      // Functions from init.js
      this.configure = configure;
      this.initDrawChromosomes = initDrawChromosomes;
      this.onLoad = onLoad;
      this.handleRotateOnClick = handleRotateOnClick;
      this.init = init$1;
      this.finishInit = finishInit;
      this.writeContainer = writeContainer;

      // Functions from annotations.js
      this.onLoadAnnots = onLoadAnnots;
      this.onDrawAnnots = onDrawAnnots;
      this.processAnnotData = processAnnotData;
      this.restoreDefaultTracks = restoreDefaultTracks;
      this.updateDisplayedTracks = updateDisplayedTracks;
      this.initAnnotSettings = initAnnotSettings;
      this.fetchAnnots = fetchAnnots;
      this.drawAnnots = drawAnnots;
      this.getHistogramBars = getHistogramBars;
      this.drawHeatmaps = drawHeatmaps;
      this.deserializeAnnotsForHeatmap = deserializeAnnotsForHeatmap;
      this.fillAnnots = fillAnnots;
      this.drawProcessedAnnots = drawProcessedAnnots;
      this.drawSynteny = drawSynteny;
      this.startHideAnnotTooltipTimeout = startHideAnnotTooltipTimeout;
      this.showAnnotTooltip = showAnnotTooltip;
      this.onWillShowAnnotTooltip = onWillShowAnnotTooltip;
      this.onClickAnnot = onClickAnnot;
      this.setOriginalTrackIndexes = setOriginalTrackIndexes;
      this.afterRawAnnots = afterRawAnnots;
      this.downloadAnnotations = downloadAnnotations;
      this.addAnnotLabel = addAnnotLabel;
      this.removeAnnotLabel = removeAnnotLabel;
      // this.fadeOutAnnotLabels = fadeOutAnnotLabels;
      this.fillAnnotLabels = fillAnnotLabels;
      this.clearAnnotLabels = clearAnnotLabels;
      this.flattenAnnots = flattenAnnots;

      this.highlight = highlight;
      this.unhighlight = unhighlight;

      // Variables and functions from services.js
      this.esearch = esearch;
      this.esummary = esummary;
      this.elink = elink;
      this.getOrganismFromEutils = getOrganismFromEutils;
      this.getTaxids = getTaxids;
      this.getAssemblyAndChromosomesFromEutils =
        getAssemblyAndChromosomesFromEutils;

      // Functions from bands.js
      this.drawBandLabels = drawBandLabels;
      this.getBandColorGradients = getBandColorGradients;
      this.processBandData = processBandData;
      this.setBandsToShow = setBandsToShow;
      this.hideUnshownBandLabels = hideUnshownBandLabels;
      this.drawBandLabelText = drawBandLabelText;
      this.drawBandLabelStalk = drawBandLabelStalk;

      // Functions from brush.js
      this.onBrushMove = onBrushMove;
      this.onBrushEnd = onBrushEnd;
      this.createBrush = createBrush;

      // Functions from cursor.js
      this.createClickCursor = createClickCursor;
      this.onCursorMove = onCursorMove;

      // Functions from sex-chromosomes.js
      this.drawSexChromosomes = drawSexChromosomes;
      this.setSexChromosomes = setSexChromosomes;

      // Functions from coordinate-converters.js
      this.convertBpToPx = convertBpToPx;
      this.convertPxToBp = convertPxToBp;

      // Functions from filter.js
      this.unpackAnnots = unpackAnnots;
      this.packAnnots = packAnnots;
      this.initCrossFilter = initCrossFilter;
      this.filterAnnots = filterAnnots;

      // Functions from lib
      this.assemblyIsAccession = assemblyIsAccession;
      this.getDataDir = getDataDir;
      this.round = round;
      this.onDidRotate = onDidRotate;
      this.getSvg = getSvg;
      this.fetch = fetchWithAuth;
      this.getTaxid = getTaxid;
      this.getCommonName = getCommonName;
      this.getScientificName = getScientificName;

      // Functions from views/chromosome-model.js
      this.getChromosomeModel = getChromosomeModel;
      this.getChromosomePixels = getChromosomePixels;

      // Functions from views/chromosome-labels.js
      this.drawChromosomeLabels = drawChromosomeLabels;
      this.rotateChromosomeLabels = rotateChromosomeLabels;

      // Functions from views/draw-chromosomes.js
      this.appendHomolog = appendHomolog;
      this.drawChromosome = drawChromosome;
      this.rotateAndToggleDisplay = rotateAndToggleDisplay;
      this.setOverflowScroll = setOverflowScroll;

      this.plotRelatedGenes = plotRelatedGenes;
      this.getRelatedGenesByType = getRelatedGenesByType;

      this.configure(config);
    }

    /**
     * Get the current version of Ideogram.js
     */
    static get version() {
      return version$1;
    }

    /**
    * Enable use of D3 in client apps, via "d3 = Ideogram.d3"
    */
    static get d3() {
      return d3;
    }

    /**
     * Request data from Ensembl REST API
     * Docs: https://rest.ensembl.org/
     *
     * @param {String} path URL path
     * @param {Object} body POST body
     * @param {String} method HTTP method; 'GET' (default) or 'POST'
     */
    static async fetchEnsembl(path, body = null, method = 'GET') {
      const init = {
        method: method
      };
      if (body !== null) init.body = JSON.stringify(body);
      if (method === 'GET') {
        // Use HTTP parameter, not header, to avoid needless OPTIONS request
        const delimiter = path.includes('&') ? '&' : '?';
        path += delimiter + 'content-type=application/json';
      } else {
        // Method is POST, so content-type must be defined in header
        init.headers = {'Content-Type': 'application/json'};
      }

      // const random = Math.random();
      // console.log(random)
      // if (random < 0.5) {
      const response = await fetch(`https://rest.ensembl.org${path}`, init);
      const json = await response.json();
      return json;
      // } else {
      //   // Mock error
      //   init.headers = {'Content-Type': 'application/json'};
      //   const response = await fetch('https://httpstat.us/500/cors', init);
      //   const json = await response.json();
      //   return json;
      // }
    }

    /**
     * Helper for sortChromosomes().
     * Gets names and biological types for diverse chromosome variables
     */
    static getChrSortNamesAndTypes(a, b) {
      var chrAName, chrBName,
        aIsCP, bIsCP, aIsMT, bIsMT, aIsAP, bIsAP, aIsNuclear, bIsNuclear;

      if (typeof a === 'string' || 'chr' in a && 'annots' in a) {
        // Chromosome data is from either:
        //    - Ideogram static file cache (e.g. homo-sapiens.json)
        //    - Ideogram raw annotations
        chrAName = (typeof a === 'string') ? a : a.chr;
        chrBName = (typeof b === 'string') ? b : b.chr;

        aIsCP = chrAName === 'CP';
        bIsCP = chrBName === 'CP';
        aIsMT = chrAName === 'MT';
        bIsMT = chrBName === 'MT';
        aIsAP = chrAName === 'AP';
        bIsAP = chrBName === 'AP';
        aIsNuclear = (!aIsCP && !aIsMT && !aIsAP);
        bIsNuclear = (!bIsCP && !bIsMT && !bIsAP);
      } else {
        // Chromosome data is from NCBI E-Utils web API
        chrAName = a.name;
        chrBName = b.name;

        aIsCP = a.type === 'chloroplast';
        bIsCP = b.type === 'chloroplast';
        aIsMT = a.type === 'mitochondrion';
        bIsMT = b.type === 'mitochondrion';
        aIsAP = a.type === 'apicoplast';
        bIsAP = b.type === 'apicoplast';
        aIsNuclear = a.type === 'nuclear';
        bIsNuclear = b.type === 'nuclear';
      }

      const chrTypes = {
        aIsNuclear, bIsNuclear, aIsCP, bIsCP, aIsMT, bIsMT, aIsAP, bIsAP
      };

      return [chrAName, chrBName, chrTypes];
    }

    /**
     * Sorts two chromosome objects by type and name
     * - Nuclear chromosomes come before non-nuclear chromosomes.
     * - Among nuclear chromosomes, use "natural sorting", e.g.
     *   numbers come before letters
     * - Among non-nuclear chromosomes, i.e. "MT" (mitochondrial DNA) and
     *   "CP" (chromoplast DNA), MT comes first
     *
     * @param a Chromosome string or object "A"
     * @param b Chromosome string or object "B"
     * @returns {Number} JavaScript sort order indicator
     */
    static sortChromosomes(a, b) {

      let [chrAName, chrBName, chrTypes] =
        Ideogram$1.getChrSortNamesAndTypes(a, b);

      const {
        aIsNuclear, bIsNuclear, aIsCP, bIsCP, aIsMT, bIsMT, aIsAP, bIsAP
      } = chrTypes;

      if (aIsNuclear && bIsNuclear) {

        if (isRoman(chrAName) && isRoman(chrBName)) {
          // As in yeast genome
          chrAName = parseRoman(chrAName).toString();
          chrBName = parseRoman(chrBName).toString();
        }

        return chrAName.localeCompare(chrBName, 'en', {numeric: true});
      } else if (!aIsNuclear && bIsNuclear) {
        return 1;
      } else if (aIsMT && bIsCP) {
        return 1;
      } else if (aIsCP && bIsMT) {
        return -1;
      } else if (!aIsAP && !aIsMT && !aIsCP && (bIsMT || bIsCP || bIsAP)) {
        return -1;
      }
    }

    /**
     * Wrapper for Ideogram constructor, with generic "Related genes" options
     *
     * @param {Object} config Ideogram configuration object
     */
    static initRelatedGenes(config, annotsInList='all') {
      return _initRelatedGenes(config, annotsInList);
    }

    /**
     * Wrapper for Ideogram constructor, with generic "Related genes" options
     *
     * @param {Object} config Ideogram configuration object
     */
    static initGeneHints(config, annotsInList='all') {
      return _initGeneHints(config, annotsInList);
    }
  }

  // Enable references to Ideogram when loaded via traditional script tag
  window.Ideogram = Ideogram$1;

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

  var AssemblySelector_1 = createCommonjsModule(function (module, exports) {



  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;

  var _react = interopRequireDefault(React__default);







  var useStyles = (0, core__default.makeStyles)(function () {
    return {
      importFormEntry: {
        minWidth: 180
      }
    };
  });
  var AssemblySelector = (0, mobxReact__default.observer)(function (_ref) {
    var session = _ref.session,
        _onChange = _ref.onChange,
        selected = _ref.selected;
    var classes = useStyles();
    var assemblyNames = session.assemblyNames,
        assemblyManager = session.assemblyManager;
    var error = assemblyNames.length ? '' : 'No configured assemblies';
    return /*#__PURE__*/_react.default.createElement(core__default.TextField, {
      select: true,
      label: "Assembly",
      variant: "outlined",
      margin: "normal",
      helperText: error || 'Select assembly to view',
      value: error ? '' : selected,
      inputProps: {
        'data-testid': 'assembly-selector'
      },
      onChange: function onChange(event) {
        return _onChange(event.target.value);
      },
      error: !!error,
      disabled: !!error,
      className: classes.importFormEntry
    }, assemblyNames.map(function (name) {
      var assembly = assemblyManager.get(name);
      var displayName = assembly ? (0, configuration__default.getConf)(assembly, 'displayName') : '';
      return /*#__PURE__*/_react.default.createElement(core__default.MenuItem, {
        key: name,
        value: name
      }, displayName || name);
    }));
  });
  var _default = AssemblySelector;
  exports.default = _default;
  });

  var AssemblySelector = unwrapExports(AssemblySelector_1);

  var res;
  /**
   * generates annotations in the form of two objects, one for the ideogram and one for the widget
   *  using a provided location of a TSV file
   *  the widget and ideo members differ in that the widget object has properties required by the ideogram
   *  library to render the annotations properly and the ideo object has properties formatted and
   *  distributed in a way that reads better for the IdeogramFeatureWidget when clicked
   * @param location - the location of the TSV file to be turned into annotations on the ideogram
   * @param withReactome - whether to cross reference the provided annots with reactome data
   * @returns widget object, ideo object, from the TSV provided information, and response for error display
   */

  function generateAnnotations(_x, _x2) {
    return _generateAnnotations.apply(this, arguments);
  }

  function _generateAnnotations() {
    _generateAnnotations = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee2(location, withReactome) {
      var _reactomePathways;

      var ideo, widget, reactomePathways, fileContents, _readAnnot, lines, columns, dictionary, pathways;

      return runtime_1.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              ideo = [];
              widget = [];
              reactomePathways = undefined;
              res = {
                success: true,
                occurances: [],
                type: 0,
                message: ''
              }; // fetching the contents of the annotations file provided by the user

              _context2.prev = 4;
              _context2.next = 7;
              return fetchFile(location);

            case 7:
              fileContents = _context2.sent;
              // then reading it into lines and columns
              _readAnnot = readAnnot(fileContents), lines = _readAnnot.lines, columns = _readAnnot.columns;
              dictionary = undefined;

              if (columns.includes('genomeLocation')) {
                _context2.next = 16;
                break;
              }

              _context2.t0 = JSON;
              _context2.next = 14;
              return fetchFile({
                uri: 'https://jbrowse.org/genomes/GRCh38/reactome_xref_symbols_grch38.json',
                locationType: 'UriLocation'
              });

            case 14:
              _context2.t1 = _context2.sent;
              dictionary = _context2.t0.parse.call(_context2.t0, _context2.t1);

            case 16:
              pathways = undefined;

              if (!withReactome) {
                _context2.next = 22;
                break;
              }

              _context2.next = 20;
              return fetchPathways(checkFile(lines, columns));

            case 20:
              reactomePathways = _context2.sent;
              // makes the request to reactome to get all the pathways related to the annotated genes, and converts it to a dictionary for easy lookup
              pathways = reactomeToDictionary(reactomePathways);

            case 22:
              if (!columns.includes('name')) {
                setResponseMessage(2);
              } else {
                lines.forEach( /*#__PURE__*/function () {
                  var _ref = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee(line) {
                    return runtime_1.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            ideo.push(parseLine(line, columns, dictionary, pathways));
                            _context.t0 = widget;
                            _context.next = 4;
                            return widgetfy(parseLine(line, columns, dictionary, pathways));

                          case 4:
                            _context.t1 = _context.sent;

                            _context.t0.push.call(_context.t0, _context.t1);

                          case 6:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));

                  return function (_x7) {
                    return _ref.apply(this, arguments);
                  };
                }());
              }

              _context2.next = 28;
              break;

            case 25:
              _context2.prev = 25;
              _context2.t2 = _context2["catch"](4);
              setResponseMessage(2);

            case 28:
              return _context2.abrupt("return", {
                widget: widget,
                ideo: ideo,
                pathways: (_reactomePathways = reactomePathways) === null || _reactomePathways === void 0 ? void 0 : _reactomePathways.pathways,
                res: res
              });

            case 29:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[4, 25]]);
    }));
    return _generateAnnotations.apply(this, arguments);
  }

  function checkFile(lines, columns) {
    var index = -1;

    if (columns.length > 1) {
      index = columns.includes('geneSymbol') ? columns.indexOf('geneSymbol') : columns.includes('genes') ? columns.indexOf('genes') : columns.includes('name') ? columns.indexOf('name') : -1;
    } else {
      index = 0;
    }

    var fileContents = '';

    if (index >= 0) {
      lines.forEach(function (line) {
        fileContents = fileContents.concat('\n', line.split('\t')[index]);
      });
    }

    return fileContents;
  }
  /**
   * restructures the response given by reactome when feeding it a list of genes into a dictionary to improve processing time
   * @param reactomeRes the response from reactome after passing it the list of genes to be annotated
   * @returns a restructured dictionary of the response
   */


  function reactomeToDictionary(reactomeRes) {
    var pathways = reactomeRes.pathways;
    var dict = {};
    pathways.forEach(function (pathway) {
      dict[pathway.stId] = _objectSpread2({}, pathway);
    });
    return dict;
  }

  function fetchPathways(_x3) {
    return _fetchPathways.apply(this, arguments);
  }

  function _fetchPathways() {
    _fetchPathways = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee3(body) {
      var response;
      return runtime_1.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return fetch('https://reactome.org/AnalysisService/identifiers/projection?includeDisease=true&interactors=false&order=ASC&pValue=1&resource=TOTAL&sortBy=ENTITIES_PVALUE', {
                method: 'POST',
                body: body
              });

            case 2:
              response = _context3.sent;

              if (response.ok) {
                _context3.next = 5;
                break;
              }

              throw new Error("Failed to fetch ".concat(response.status, " ").concat(response.statusText));

            case 5:
              return _context3.abrupt("return", response.json());

            case 6:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _fetchPathways.apply(this, arguments);
  }

  function fetchHierarchy(_x4) {
    return _fetchHierarchy.apply(this, arguments);
  }

  function _fetchHierarchy() {
    _fetchHierarchy = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee4(geneName) {
      var response;
      return runtime_1.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return fetch("https://idg.reactome.org/idgpairwise/relationships/hierarchyForTerm/".concat(geneName), {
                method: 'GET'
              });

            case 2:
              response = _context4.sent;

              if (response.ok) {
                _context4.next = 5;
                break;
              }

              throw new Error("Failed to fetch ".concat(response.status, " ").concat(response.statusText));

            case 5:
              return _context4.abrupt("return", response.json());

            case 6:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));
    return _fetchHierarchy.apply(this, arguments);
  }

  function setResponseMessage(error) {
    res.success = false; // missing location data

    if (error === 1) {
      res.message = 'There are datapoints missing location data and they will be omitted from the annotations.';
      res.type = 1;
    } // missing required headers in tsv


    if (error === 2) {
      res.message = 'The annotations file is missing a required header: "name".';
      res.type = 2;
    } // missing location data and the gene names could not be found within the reference file


    if (error === 3) {
      res.message = 'Some provided gene ids could not be coordinated with a location and they will be omitted from the annotations.';
      res.type = 3;
    }
  }
  /**
   * converts the parsed line into the object we want to store for the widget to use for onClick information
   *   this would have 'end' instead of 'stop' and not contain the stop, color, and chr properties
   * @param obj - the parsed object from the file
   */


  function widgetfy(_x5) {
    return _widgetfy.apply(this, arguments);
  }

  function _widgetfy() {
    _widgetfy = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee5(obj) {
      var newObj, response;
      return runtime_1.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              newObj = obj;
              newObj['end'] = newObj.stop;
              delete newObj.stop;
              delete newObj.color;
              delete newObj.chr;

              if (!obj.details.reactomeIds) {
                _context5.next = 10;
                break;
              }

              _context5.next = 8;
              return fetchHierarchy(obj.name);

            case 8:
              response = _context5.sent;

              if (response.hierarchy) {
                newObj.details.hierarchy = response.hierarchy;
              }

            case 10:
              return _context5.abrupt("return", newObj);

            case 11:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));
    return _widgetfy.apply(this, arguments);
  }

  function fetchFile(_x6) {
    return _fetchFile.apply(this, arguments);
  }

  function _fetchFile() {
    _fetchFile = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee6(location) {
      return runtime_1.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return io.openLocation(location).readFile('utf8');

            case 2:
              return _context6.abrupt("return", _context6.sent);

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));
    return _fetchFile.apply(this, arguments);
  }

  function readAnnot(fileContents) {
    var lines = fileContents.split('\n');
    var rows = [];
    var columns = [];
    lines.forEach(function (line) {
      if (line) {
        if (columns.length === 0) {
          columns = line.split('\t');
          columns.forEach(function (column, i) {
            columns[i] = camelize(column);
          });
        } else {
          rows.push(line);
        }
      }
    });
    return {
      lines: rows,
      columns: columns
    };
  }
  /**
   * from https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
   * @param str - the string to camelize
   * @returns the camelized string
   */


  function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  function parseCoords(property) {
    var splitProperty = property.split(':');
    return {
      chr: splitProperty[0],
      start: +splitProperty[1].split('-')[0],
      stop: +splitProperty[1].split('-')[1]
    };
  }
  /**
   * converts the contents of the tsv file into an object that can be used
   *   places 'core' properties (name, chr, start, stop) at the start of the object, and the details in their own sub-object
   * @param line - the string representation of the line being converted to an object
   * @param columns - the columns of the data from the tsv
   * @returns the object representation of the line of data
   */


  function parseLine(line, columns, dictionary, pathways) {
    var annot = {
      details: {}
    };
    var named = false; // prioritize naming a gene based on geneSymbol

    var hasLoc = false;
    var hasColor = false;
    line.split('\t').forEach(function (property, i) {
      if (property) {
        var camelProp = camelize(columns[i]);

        if (camelProp === 'name' && !named) {
          annot['name'] = property;
        }

        if (camelProp === 'geneSymbol') {
          named = true;
          annot['name'] = property;
        }

        if (camelProp === 'genomeLocation') {
          var parsedProperties = parseCoords(property);

          if (parsedProperties.start > 0 && parsedProperties.stop > 0) {
            annot = _objectSpread2(_objectSpread2({}, annot), parsedProperties);
          } else {
            setResponseMessage(1);
          }

          hasLoc = true;
        }

        if (camelProp === 'externalLinks') {
          property = JSON.parse(property);
        }

        if (camelProp === 'tier') {
          // if the property 'tier' exists, apply colour logic
          var a = '#0000FF'; // blue

          var b = '#FF0000'; // red

          if (property === '1') {
            annot['color'] = a;
            annot['prevColor'] = a;
          } else {
            annot['color'] = b;
            annot['prevColor'] = b;
          }

          hasColor = true;
        }

        annot['details'][camelProp] = property;
      }
    });

    if (hasColor === false) {
      annot['color'] = '#FF0000';
      annot['prevColor'] = '#FF0000';
    }

    if (hasLoc === false) {
      if (dictionary[annot['name']]) {
        annot['chr'] = dictionary[annot['name']]['chr'];
        annot['start'] = dictionary[annot['name']]['start'];
        annot['stop'] = dictionary[annot['name']]['stop'];
        annot['details']['reactomeIds'] = dictionary[annot['name']]['reactomeIds'];
        annot['details']['genomeLocation'] = "".concat(annot['chr'], ":").concat(annot['start'], "-").concat(annot['stop']);
      } else {
        setResponseMessage(3);
      }
    } else {
      if (pathways && dictionary && dictionary[annot['name']]) {
        annot['details']['reactomeIds'] = dictionary[annot['name']]['reactomeIds'];
      }
    }

    if (annot['details']['reactomeIds'] && pathways) {
      annot['details']['pathways'] = [];
      annot['details']['reactomeIds'].forEach(function (id) {
        if (pathways[id]) {
          annot['details']['pathways'].push(pathways[id]);
        }
      });
    }

    return annot;
  }

  var regions = ['chr1', 'chr2', 'chr3', 'chr4', 'chr5', 'chr6', 'chr7', 'chr8', 'chr9', 'chr10', 'chr11', 'chr12', 'chr13', 'chr14', 'chr15', 'chr16', 'chr17', 'chr18', 'chr19', 'chr20', 'chr21', 'chr22', 'chrX', 'chrY'];
  var allChromosomes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', 'X', 'Y'];
  var tierLegend = [{
    name: 'Tier 1',
    rows: [{
      name: '',
      color: '#0000FF',
      shape: 'triangle'
    }, {
      name: 'Tier 2',
      color: '#FF0000',
      shape: 'triangle'
    }]
  }];
  function openReactomeView(_x, _x2, _x3, _x4, _x5) {
    return _openReactomeView.apply(this, arguments);
  }

  function _openReactomeView() {
    _openReactomeView = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee(pwId, pathways, pwName, geneName, model) {
      var session, rv, view;
      return runtime_1.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              session = util.getSession(model);
              rv = session.views.find(function (view) {
                return view.type === 'ReactomeView';
              });

              if (!rv) {
                _context.next = 9;
                break;
              }

              rv.setPathways(pathways);
              rv.setSelectedPathway(pwId);
              rv.setGene(geneName);
              rv.setMessage("Pathways relating to ".concat(geneName, " are being displayed. \"").concat(pwName, "\" has been selected."));
              _context.next = 16;
              break;

            case 9:
              view = session.addView('ReactomeView', {
                displayName: 'Reactome View'
              });
              view.setPathways(pathways);
              view.setSelectedPathway(pwId);
              view.setGene(geneName);
              view.setMessage("Pathways relating to ".concat(geneName, " are being displayed. \"").concat(pwName, "\" has been selected."));
              _context.next = 16;
              return util.when(function () {
                return view.initialized;
              });

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _openReactomeView.apply(this, arguments);
  }

  function navToAnnotation(_x6, _x7) {
    return _navToAnnotation.apply(this, arguments);
  }

  function _navToAnnotation() {
    _navToAnnotation = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee2(locString, model) {
      var assembly, session, lgv, _session, assemblyManager, sessionAssembly, loc, refName, _regions, canonicalRefName, newDisplayedRegion, view;

      return runtime_1.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              // @ts-ignore
              assembly = model.view.assembly;
              session = util.getSession(model);
              lgv = session.views.find(function (view) {
                return view.type === 'LinearGenomeView' && // @ts-ignore
                view.assemblyNames[0] === assembly;
              });

              if (!lgv) {
                _context2.next = 7;
                break;
              }

              lgv.navToLocString(locString);
              _context2.next = 29;
              break;

            case 7:
              _session = util.getSession(model);
              assemblyManager = _session.assemblyManager;
              _context2.next = 11;
              return assemblyManager.waitForAssembly(assembly);

            case 11:
              sessionAssembly = _context2.sent;

              if (!sessionAssembly) {
                _context2.next = 29;
                break;
              }

              _context2.prev = 13;
              loc = util.parseLocString(locString, function (refName) {
                return _session.assemblyManager.isValidRefName(refName, assembly);
              });
              refName = loc.refName;
              _regions = sessionAssembly.regions;
              canonicalRefName = sessionAssembly.getCanonicalRefName(refName);

              if (_regions) {
                newDisplayedRegion = _regions.find(function (region) {
                  return region.refName === canonicalRefName;
                });
              }

              view = _session.addView('LinearGenomeView', {
                displayName: assembly
              });
              _context2.next = 22;
              return util.when(function () {
                return view.initialized;
              });

            case 22:
              view.setDisplayedRegions([JSON.parse(JSON.stringify(newDisplayedRegion))]);
              view.navToLocString(locString);
              _context2.next = 29;
              break;

            case 26:
              _context2.prev = 26;
              _context2.t0 = _context2["catch"](13);

              _session.notify("".concat(_context2.t0), 'error');

            case 29:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[13, 26]]);
    }));
    return _navToAnnotation.apply(this, arguments);
  }

  function populateAnnotations(_x8) {
    return _populateAnnotations.apply(this, arguments);
  }

  function _populateAnnotations() {
    _populateAnnotations = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee3(model) {
      var session, _yield$generateAnnota, widget, ideo, pathways, res, tview, xView;

      return runtime_1.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              session = util.getSession(model);

              if (!model.annotationsLocation) {
                _context3.next = 13;
                break;
              }

              model.setShowLoading(true);
              _context3.next = 5;
              return generateAnnotations(model.annotationsLocation, model.withReactome);

            case 5:
              _yield$generateAnnota = _context3.sent;
              widget = _yield$generateAnnota.widget;
              ideo = _yield$generateAnnota.ideo;
              pathways = _yield$generateAnnota.pathways;
              res = _yield$generateAnnota.res;

              if (res.type !== 2) {
                model.setWidgetAnnotations(widget);
                model.setIdeoAnnotations(ideo);
              }

              if (model.withReactome) {
                session.views.forEach(function (view) {
                });
                tview = session.views.find(function (view) {
                  return (view === null || view === void 0 ? void 0 : view.isAnalysisResults) && view.ideogramId === model.ideogramId;
                });

                if (tview) {
                  session.removeView(tview);
                }

                session.addView('IdeogramView', {});
                xView = session.views.length - 1; // @ts-ignore

                session.views[xView].setDisplayName('Reactome Analysis Results'); // @ts-ignore

                session.views[xView].setPathways(pathways);
                model.setPathways(pathways); // @ts-ignore

                session.views[xView].setIsAnalysisResults(true); // @ts-ignore

                session.views[xView].setIdeogramId(model.ideogramId);
              }

              if (!res.success) {
                session.notify(res.message, 'warning');
              }

            case 13:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _populateAnnotations.apply(this, arguments);
  }

  var Help = createCommonjsModule(function (module, exports) {





  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;

  var React = interopRequireWildcard(React__default);

  var _createSvgIcon = interopRequireDefault(createSvgIcon);

  var _default = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
    d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
  }), 'Help');

  exports.default = _default;
  });

  var HelpIcon = unwrapExports(Help);

  var Close = createCommonjsModule(function (module, exports) {





  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;

  var React = interopRequireWildcard(React__default);

  var _createSvgIcon = interopRequireDefault(createSvgIcon);

  var _default = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
    d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
  }), 'Close');

  exports.default = _default;
  });

  var CloseIcon = unwrapExports(Close);

  var useStyles = /*#__PURE__*/core.makeStyles(function (theme) {
    return {
      closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500]
      }
    };
  });
  /**
   * NOTE: Help Dialog logic and display retrieved from GMOD/jbrowse-components:plugins/linear-genome-view/src/LinearGenomeView/components/HelpDialog.tsx
   */

  function HelpDialog(_ref) {
    var handleClose = _ref.handleClose;
    var classes = useStyles();
    return /*#__PURE__*/React__default.createElement(core.Dialog, {
      open: true,
      maxWidth: "xl",
      onClose: handleClose
    }, /*#__PURE__*/React__default.createElement(core.DialogTitle, null, "How to use annotations files", handleClose ? /*#__PURE__*/React__default.createElement(core.IconButton, {
      "data-testid": "close-resultsDialog",
      className: classes.closeButton,
      onClick: function onClick() {
        handleClose();
      }
    }, /*#__PURE__*/React__default.createElement(CloseIcon, null)) : null), /*#__PURE__*/React__default.createElement(core.Divider, null), /*#__PURE__*/React__default.createElement(core.DialogContent, null, /*#__PURE__*/React__default.createElement("h3", null, "General"), /*#__PURE__*/React__default.createElement("ul", null, /*#__PURE__*/React__default.createElement("li", null, "annotations must be uploaded as a TSV with column headers"), /*#__PURE__*/React__default.createElement("li", null, "enforced location data must be under a heading called", ' ', /*#__PURE__*/React__default.createElement("code", null, "genomeLocation"), " and be in the format of 'chromosomeNumber:start-end', e.g. '1:39895426-39902013'"), /*#__PURE__*/React__default.createElement("li", null, "alternatively, annotation files provided without genome location data will attempt to be cross referenced with a remote file of gene locations"), /*#__PURE__*/React__default.createElement("li", null, "each row of data must include ", /*#__PURE__*/React__default.createElement("code", null, "name"))), /*#__PURE__*/React__default.createElement("h3", null, "External Links"), "Any external links that wish to be formatted on the widget properly must be in the following format:", /*#__PURE__*/React__default.createElement("ul", null, /*#__PURE__*/React__default.createElement("li", null, "under a header ", /*#__PURE__*/React__default.createElement("code", null, "externalLinks")), /*#__PURE__*/React__default.createElement("li", null, "a JSON string appearing as follows:", ' ', /*#__PURE__*/React__default.createElement("code", null, '"[{"name": "MYLINK", "link": "https://my-link.com/"}]"')), /*#__PURE__*/React__default.createElement("li", null, "each annotation that you wish to have external links to must have this json string"), /*#__PURE__*/React__default.createElement("li", null, "multiple external links are permitted")), /*#__PURE__*/React__default.createElement("h3", null, "Colours and Categorization"), "Annotations can be categorized into two categories if the 'tier' header is within the TSV.", /*#__PURE__*/React__default.createElement("ul", null, /*#__PURE__*/React__default.createElement("li", null, "tier 1 is annotated in blue"), /*#__PURE__*/React__default.createElement("li", null, "tier 2 is annotated in red"), /*#__PURE__*/React__default.createElement("li", null, "this field is to be provided as a 1 or a 2")), /*#__PURE__*/React__default.createElement("h3", null, "Examples"), /*#__PURE__*/React__default.createElement("ul", null, /*#__PURE__*/React__default.createElement("li", null, "TSV with only required headers", /*#__PURE__*/React__default.createElement("br", null), /*#__PURE__*/React__default.createElement("code", null, "name", /*#__PURE__*/React__default.createElement("br", null), "note1", /*#__PURE__*/React__default.createElement("br", null), "note2")), /*#__PURE__*/React__default.createElement("br", null), /*#__PURE__*/React__default.createElement("li", null, "TSV with optional headers", /*#__PURE__*/React__default.createElement("br", null), /*#__PURE__*/React__default.createElement("code", null, "name\tgenomeLocation\ttier\texternalLinks", /*#__PURE__*/React__default.createElement("br", null), "note1\t1:39895426-39902013\t1\t", "[{\"name\":\"MYLINK\",\"link\":\"https://my-link.com/note1\"}]", /*#__PURE__*/React__default.createElement("br", null), "note2\t1:157573749-157598080\t2\t", "[{\"name\":\"MYLINK\",\"link\":\"https://my-link.com/note2\"}]")))), /*#__PURE__*/React__default.createElement(core.Divider, null), /*#__PURE__*/React__default.createElement(core.DialogActions, null, /*#__PURE__*/React__default.createElement(core.Button, {
      onClick: function onClick() {
        return handleClose();
      },
      color: "primary"
    }, "Close")));
  }

  var useStyles$1 = /*#__PURE__*/core.makeStyles(function (theme) {
    return {
      importFormContainer: {
        padding: theme.spacing(2)
      },
      button: {
        margin: theme.spacing(2)
      },
      importFormEntry: {
        minWidth: 180
      },
      closeButton: {
        position: 'absolute',
        right: '4px',
        top: '4px'
      }
    };
  });
  var RegionSelector = /*#__PURE__*/mobxReact.observer(function (_ref) {
    var _onChange = _ref.onChange,
        selected = _ref.selected;
    var classes = useStyles$1();
    var error = regions.length ? '' : 'No configured regions';
    return /*#__PURE__*/React__default.createElement(core.TextField, {
      select: true,
      label: "Region",
      variant: "outlined",
      margin: "normal",
      helperText: error || 'Select a region to view',
      value: error ? '' : selected,
      inputProps: {
        'data-testid': 'region-selector'
      },
      onChange: function onChange(event) {
        return _onChange(event.target.value);
      },
      error: !!error,
      disabled: !!error,
      className: classes.importFormEntry
    }, regions.map(function (name) {
      return /*#__PURE__*/React__default.createElement(core.MenuItem, {
        key: name,
        value: name
      }, name);
    }));
  });
  /**
   * Most layout and logic retrieved from the '@jbrowse/plugin/linear-genome-view/../ImportForm.tsx' component and modified for
   * the purposes of this component
   */

  var ImportForm = /*#__PURE__*/mobxReact.observer(function (_ref2) {
    var model = _ref2.model;
    var classes = useStyles$1();
    var session = util.getSession(model);
    var assemblyNames = session.assemblyNames;

    var _useState = React.useState(assemblyNames[0]),
        _useState2 = _slicedToArray(_useState, 2),
        selectedAsm = _useState2[0],
        setSelectedAsm = _useState2[1];

    var _useState3 = React.useState(regions[0]),
        _useState4 = _slicedToArray(_useState3, 2),
        selectedRegion = _useState4[0],
        setSelectedRegion = _useState4[1];

    var _useState5 = React.useState(model.withReactome),
        _useState6 = _slicedToArray(_useState5, 2),
        checked = _useState6[0],
        setChecked = _useState6[1];

    var _useState7 = React.useState(false),
        _useState8 = _slicedToArray(_useState7, 2),
        isHelpDialogDisplayed = _useState8[0],
        setHelpDialogDisplayed = _useState8[1];

    function handleOpen(_x, _x2) {
      return _handleOpen.apply(this, arguments);
    }

    function _handleOpen() {
      _handleOpen = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee(assembly, region) {
        return runtime_1.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                model.setAssembly(assembly);
                model.setRegion(region);
                model.setOrientation('horizontal');
                model.setAllRegions(false);
                model.setShowImportForm(false);
                model.setIdeogramId(v4());
                _context.next = 8;
                return populateAnnotations(model);

              case 8:
                model.setShowLoading(false);

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      return _handleOpen.apply(this, arguments);
    }

    function handleOpenAllRegions(_x3) {
      return _handleOpenAllRegions.apply(this, arguments);
    }

    function _handleOpenAllRegions() {
      _handleOpenAllRegions = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee2(assembly) {
        return runtime_1.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                model.setAllRegions(true);
                model.setAssembly(assembly);
                model.setIdeogramId(v4());
                _context2.next = 5;
                return populateAnnotations(model);

              case 5:
                model.setShowImportForm(false);
                model.setShowLoading(false);

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));
      return _handleOpenAllRegions.apply(this, arguments);
    }

    var handleReactomeAnalysis = function handleReactomeAnalysis(event) {
      setChecked(event === null || event === void 0 ? void 0 : event.target.checked);
      model.setWithReactome(event === null || event === void 0 ? void 0 : event.target.checked);
    };

    return /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement(core.Container, {
      className: classes.importFormContainer
    }, /*#__PURE__*/React__default.createElement(core.Grid, {
      container: true,
      spacing: 1,
      justifyContent: "center",
      alignItems: "center"
    }, /*#__PURE__*/React__default.createElement(core.Grid, {
      item: true
    }, /*#__PURE__*/React__default.createElement(AssemblySelector, {
      onChange: function onChange(val) {
        setSelectedAsm(val);
      },
      session: session,
      selected: selectedAsm
    })), /*#__PURE__*/React__default.createElement(core.Grid, {
      item: true
    }, /*#__PURE__*/React__default.createElement(RegionSelector, {
      onChange: function onChange(val) {
        setSelectedRegion(val);
      },
      selected: selectedRegion
    })), /*#__PURE__*/React__default.createElement(core.Grid, {
      item: true
    }, /*#__PURE__*/React__default.createElement(core.Button, {
      type: "submit",
      disabled: !selectedRegion,
      className: classes.button,
      onClick: function onClick() {
        if (selectedRegion) {
          handleOpen(selectedAsm, selectedRegion);
        }
      },
      variant: "contained",
      color: "primary"
    }, "Open"), /*#__PURE__*/React__default.createElement(core.Button, {
      disabled: !selectedRegion,
      className: classes.button,
      onClick: function onClick() {
        handleOpenAllRegions(selectedAsm);
      },
      variant: "contained",
      color: "secondary"
    }, "Show all regions in assembly")))), /*#__PURE__*/React__default.createElement(core.Divider, null), /*#__PURE__*/React__default.createElement(core.Container, {
      className: classes.importFormContainer
    }, /*#__PURE__*/React__default.createElement(core.Grid, {
      container: true,
      spacing: 1,
      justifyContent: "center",
      alignItems: "center",
      direction: "column"
    }, /*#__PURE__*/React__default.createElement(core.Typography, {
      variant: "body2"
    }, /*#__PURE__*/React__default.createElement("b", null, "Optional:"), " provide a .tsv file of gene annotations for the ideogram.", /*#__PURE__*/React__default.createElement(core.IconButton, {
      onClick: function onClick() {
        return setHelpDialogDisplayed(true);
      }
    }, /*#__PURE__*/React__default.createElement(HelpIcon, null))), /*#__PURE__*/React__default.createElement(core.Grid, {
      item: true
    }, /*#__PURE__*/React__default.createElement(ui.FileSelector, {
      name: "Annotations file",
      location: model.annotationsLocation,
      setLocation: function setLocation(loc) {
        return model.setAnnotationsLocation(loc);
      }
    })), /*#__PURE__*/React__default.createElement(core.Grid, {
      item: true
    }, /*#__PURE__*/React__default.createElement(core.FormControlLabel, {
      label: "Analyze annotations with Reactome",
      control: /*#__PURE__*/React__default.createElement(core.Checkbox, {
        checked: checked,
        color: "primary",
        onChange: handleReactomeAnalysis
      })
    })))), isHelpDialogDisplayed ? /*#__PURE__*/React__default.createElement(React.Suspense, {
      fallback: /*#__PURE__*/React__default.createElement("div", null)
    }, /*#__PURE__*/React__default.createElement(HelpDialog, {
      handleClose: function handleClose() {
        return setHelpDialogDisplayed(false);
      }
    })) : null);
  });

  /*

  Based off glamor's StyleSheet, thanks Sunil ❤️

  high performance StyleSheet for css-in-js systems

  - uses multiple style tags behind the scenes for millions of rules
  - uses `insertRule` for appending in production for *much* faster performance

  // usage

  import { StyleSheet } from '@emotion/sheet'

  let styleSheet = new StyleSheet({ key: '', container: document.head })

  styleSheet.insert('#box { border: 1px solid red; }')
  - appends a css rule into the stylesheet

  styleSheet.flush()
  - empties the stylesheet of all its contents

  */
  // $FlowFixMe
  function sheetForTag(tag) {
    if (tag.sheet) {
      // $FlowFixMe
      return tag.sheet;
    } // this weirdness brought to you by firefox

    /* istanbul ignore next */


    for (var i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].ownerNode === tag) {
        // $FlowFixMe
        return document.styleSheets[i];
      }
    }
  }

  function createStyleElement(options) {
    var tag = document.createElement('style');
    tag.setAttribute('data-emotion', options.key);

    if (options.nonce !== undefined) {
      tag.setAttribute('nonce', options.nonce);
    }

    tag.appendChild(document.createTextNode(''));
    tag.setAttribute('data-s', '');
    return tag;
  }

  var StyleSheet = /*#__PURE__*/function () {
    function StyleSheet(options) {
      var _this = this;

      this._insertTag = function (tag) {
        var before;

        if (_this.tags.length === 0) {
          if (_this.insertionPoint) {
            before = _this.insertionPoint.nextSibling;
          } else if (_this.prepend) {
            before = _this.container.firstChild;
          } else {
            before = _this.before;
          }
        } else {
          before = _this.tags[_this.tags.length - 1].nextSibling;
        }

        _this.container.insertBefore(tag, before);

        _this.tags.push(tag);
      };

      this.isSpeedy = options.speedy === undefined ? "development" === 'production' : options.speedy;
      this.tags = [];
      this.ctr = 0;
      this.nonce = options.nonce; // key is the value of the data-emotion attribute, it's used to identify different sheets

      this.key = options.key;
      this.container = options.container;
      this.prepend = options.prepend;
      this.insertionPoint = options.insertionPoint;
      this.before = null;
    }

    var _proto = StyleSheet.prototype;

    _proto.hydrate = function hydrate(nodes) {
      nodes.forEach(this._insertTag);
    };

    _proto.insert = function insert(rule) {
      // the max length is how many rules we have per style tag, it's 65000 in speedy mode
      // it's 1 in dev because we insert source maps that map a single rule to a location
      // and you can only have one source map per style tag
      if (this.ctr % (this.isSpeedy ? 65000 : 1) === 0) {
        this._insertTag(createStyleElement(this));
      }

      var tag = this.tags[this.tags.length - 1];

      {
        var isImportRule = rule.charCodeAt(0) === 64 && rule.charCodeAt(1) === 105;

        if (isImportRule && this._alreadyInsertedOrderInsensitiveRule) {
          // this would only cause problem in speedy mode
          // but we don't want enabling speedy to affect the observable behavior
          // so we report this error at all times
          console.error("You're attempting to insert the following rule:\n" + rule + '\n\n`@import` rules must be before all other types of rules in a stylesheet but other rules have already been inserted. Please ensure that `@import` rules are before all other rules.');
        }
        this._alreadyInsertedOrderInsensitiveRule = this._alreadyInsertedOrderInsensitiveRule || !isImportRule;
      }

      if (this.isSpeedy) {
        var sheet = sheetForTag(tag);

        try {
          // this is the ultrafast version, works across browsers
          // the big drawback is that the css won't be editable in devtools
          sheet.insertRule(rule, sheet.cssRules.length);
        } catch (e) {
          if ( !/:(-moz-placeholder|-moz-focus-inner|-moz-focusring|-ms-input-placeholder|-moz-read-write|-moz-read-only|-ms-clear){/.test(rule)) {
            console.error("There was a problem inserting the following rule: \"" + rule + "\"", e);
          }
        }
      } else {
        tag.appendChild(document.createTextNode(rule));
      }

      this.ctr++;
    };

    _proto.flush = function flush() {
      // $FlowFixMe
      this.tags.forEach(function (tag) {
        return tag.parentNode && tag.parentNode.removeChild(tag);
      });
      this.tags = [];
      this.ctr = 0;

      {
        this._alreadyInsertedOrderInsensitiveRule = false;
      }
    };

    return StyleSheet;
  }();

  var e="-ms-";var r="-moz-";var a="-webkit-";var c="comm";var n="rule";var t="decl";var i$1="@import";var p="@keyframes";var k=Math.abs;var d=String.fromCharCode;var g=Object.assign;function m(e,r){return (((r<<2^z(e,0))<<2^z(e,1))<<2^z(e,2))<<2^z(e,3)}function x(e){return e.trim()}function y(e,r){return (e=r.exec(e))?e[0]:e}function j(e,r,a){return e.replace(r,a)}function C(e,r){return e.indexOf(r)}function z(e,r){return e.charCodeAt(r)|0}function A(e,r,a){return e.slice(r,a)}function O(e){return e.length}function M(e){return e.length}function S(e,r){return r.push(e),e}function q(e,r){return e.map(r).join("")}var B=1;var D=1;var E=0;var F=0;var G=0;var H="";function I(e,r,a,c,n,t,s){return {value:e,root:r,parent:a,type:c,props:n,children:t,line:B,column:D,length:s,return:""}}function J(e,r){return g(I("",null,null,"",null,null,0),e,{length:-e.length},r)}function K(){return G}function L(){G=F>0?z(H,--F):0;if(D--,G===10)D=1,B--;return G}function N(){G=F<E?z(H,F++):0;if(D++,G===10)D=1,B++;return G}function P(){return z(H,F)}function Q(){return F}function R(e,r){return A(H,e,r)}function T(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function U(e){return B=D=1,E=O(H=e),F=0,[]}function V(e){return H="",e}function W(e){return x(R(F-1,ee(e===91?e+2:e===40?e+1:e)))}function Y$1(e){while(G=P())if(G<33)N();else break;return T(e)>2||T(G)>3?"":" "}function _(e,r){while(--r&&N())if(G<48||G>102||G>57&&G<65||G>70&&G<97)break;return R(e,Q()+(r<6&&P()==32&&N()==32))}function ee(e){while(N())switch(G){case e:return F;case 34:case 39:if(e!==34&&e!==39)ee(G);break;case 40:if(e===41)ee(e);break;case 92:N();break}return F}function re$1(e,r){while(N())if(e+G===47+10)break;else if(e+G===42+42&&P()===47)break;return "/*"+R(r,F-1)+"*"+d(e===47?e:N())}function ae(e){while(!T(P()))N();return R(e,F)}function ce(e){return V(ne("",null,null,null,[""],e=U(e),0,[0],e))}function ne(e,r,a,c,n,t,s,u,i){var f=0;var o=0;var l=s;var v=0;var h=0;var p=0;var b=1;var w=1;var $=1;var k=0;var g="";var m=n;var x=t;var y=c;var z=g;while(w)switch(p=k,k=N()){case 40:if(p!=108&&z.charCodeAt(l-1)==58){if(C(z+=j(W(k),"&","&\f"),"&\f")!=-1)$=-1;break}case 34:case 39:case 91:z+=W(k);break;case 9:case 10:case 13:case 32:z+=Y$1(p);break;case 92:z+=_(Q()-1,7);continue;case 47:switch(P()){case 42:case 47:S(se(re$1(N(),Q()),r,a),i);break;default:z+="/";}break;case 123*b:u[f++]=O(z)*$;case 125*b:case 59:case 0:switch(k){case 0:case 125:w=0;case 59+o:if(h>0&&O(z)-l)S(h>32?ue(z+";",c,a,l-1):ue(j(z," ","")+";",c,a,l-2),i);break;case 59:z+=";";default:S(y=te(z,r,a,f,o,n,u,g,m=[],x=[],l),t);if(k===123)if(o===0)ne(z,r,y,y,m,t,l,u,x);else switch(v){case 100:case 109:case 115:ne(e,y,y,c&&S(te(e,y,y,0,0,n,u,g,n,m=[],l),x),n,x,l,u,c?m:x);break;default:ne(z,y,y,y,[""],x,0,u,x);}}f=o=h=0,b=$=1,g=z="",l=s;break;case 58:l=1+O(z),h=p;default:if(b<1)if(k==123)--b;else if(k==125&&b++==0&&L()==125)continue;switch(z+=d(k),k*b){case 38:$=o>0?1:(z+="\f",-1);break;case 44:u[f++]=(O(z)-1)*$,$=1;break;case 64:if(P()===45)z+=W(N());v=P(),o=l=O(g=z+=ae(Q())),k++;break;case 45:if(p===45&&O(z)==2)b=0;}}return t}function te(e,r,a,c,t,s,u,i,f,o,l){var v=t-1;var h=t===0?s:[""];var p=M(h);for(var b=0,w=0,$=0;b<c;++b)for(var d=0,g=A(e,v+1,v=k(w=u[b])),m=e;d<p;++d)if(m=x(w>0?h[d]+" "+g:j(g,/&\f/g,h[d])))f[$++]=m;return I(e,r,a,t===0?n:i,f,o,l)}function se(e,r,a){return I(e,r,a,c,d(K()),A(e,2,-2),0)}function ue(e,r,a,c){return I(e,r,a,t,A(e,0,c),A(e,c+1,-1),c)}function ie(c,n){switch(m(c,n)){case 5103:return a+"print-"+c+c;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return a+c+c;case 5349:case 4246:case 4810:case 6968:case 2756:return a+c+r+c+e+c+c;case 6828:case 4268:return a+c+e+c+c;case 6165:return a+c+e+"flex-"+c+c;case 5187:return a+c+j(c,/(\w+).+(:[^]+)/,a+"box-$1$2"+e+"flex-$1$2")+c;case 5443:return a+c+e+"flex-item-"+j(c,/flex-|-self/,"")+c;case 4675:return a+c+e+"flex-line-pack"+j(c,/align-content|flex-|-self/,"")+c;case 5548:return a+c+e+j(c,"shrink","negative")+c;case 5292:return a+c+e+j(c,"basis","preferred-size")+c;case 6060:return a+"box-"+j(c,"-grow","")+a+c+e+j(c,"grow","positive")+c;case 4554:return a+j(c,/([^-])(transform)/g,"$1"+a+"$2")+c;case 6187:return j(j(j(c,/(zoom-|grab)/,a+"$1"),/(image-set)/,a+"$1"),c,"")+c;case 5495:case 3959:return j(c,/(image-set\([^]*)/,a+"$1"+"$`$1");case 4968:return j(j(c,/(.+:)(flex-)?(.*)/,a+"box-pack:$3"+e+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+a+c+c;case 4095:case 3583:case 4068:case 2532:return j(c,/(.+)-inline(.+)/,a+"$1$2")+c;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(O(c)-1-n>6)switch(z(c,n+1)){case 109:if(z(c,n+4)!==45)break;case 102:return j(c,/(.+:)(.+)-([^]+)/,"$1"+a+"$2-$3"+"$1"+r+(z(c,n+3)==108?"$3":"$2-$3"))+c;case 115:return ~C(c,"stretch")?ie(j(c,"stretch","fill-available"),n)+c:c}break;case 4949:if(z(c,n+1)!==115)break;case 6444:switch(z(c,O(c)-3-(~C(c,"!important")&&10))){case 107:return j(c,":",":"+a)+c;case 101:return j(c,/(.+:)([^;!]+)(;|!.+)?/,"$1"+a+(z(c,14)===45?"inline-":"")+"box$3"+"$1"+a+"$2$3"+"$1"+e+"$2box$3")+c}break;case 5936:switch(z(c,n+11)){case 114:return a+c+e+j(c,/[svh]\w+-[tblr]{2}/,"tb")+c;case 108:return a+c+e+j(c,/[svh]\w+-[tblr]{2}/,"tb-rl")+c;case 45:return a+c+e+j(c,/[svh]\w+-[tblr]{2}/,"lr")+c}return a+c+e+c+c}return c}function fe(e,r){var a="";var c=M(e);for(var n=0;n<c;n++)a+=r(e[n],n,e,r)||"";return a}function oe(e,r,a,s){switch(e.type){case i$1:case t:return e.return=e.return||e.value;case c:return "";case p:return e.return=e.value+"{"+fe(e.children,s)+"}";case n:e.value=e.props.join(",");}return O(a=fe(e.children,s))?e.return=e.value+"{"+a+"}":""}function le(e){var r=M(e);return function(a,c,n,t){var s="";for(var u=0;u<r;u++)s+=e[u](a,c,n,t)||"";return s}}function he(c,s,u,i){if(c.length>-1)if(!c.return)switch(c.type){case t:c.return=ie(c.value,c.length);break;case p:return fe([J(c,{value:j(c.value,"@","@"+a)})],i);case n:if(c.length)return q(c.props,(function(n){switch(y(n,/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":return fe([J(c,{props:[j(n,/:(read-\w+)/,":"+r+"$1")]})],i);case"::placeholder":return fe([J(c,{props:[j(n,/:(plac\w+)/,":"+a+"input-$1")]}),J(c,{props:[j(n,/:(plac\w+)/,":"+r+"$1")]}),J(c,{props:[j(n,/:(plac\w+)/,e+"input-$1")]})],i)}return ""}))}}

  var weakMemoize = function weakMemoize(func) {
    // $FlowFixMe flow doesn't include all non-primitive types as allowed for weakmaps
    var cache = new WeakMap();
    return function (arg) {
      if (cache.has(arg)) {
        // $FlowFixMe
        return cache.get(arg);
      }

      var ret = func(arg);
      cache.set(arg, ret);
      return ret;
    };
  };

  function memoize(fn) {
    var cache = Object.create(null);
    return function (arg) {
      if (cache[arg] === undefined) cache[arg] = fn(arg);
      return cache[arg];
    };
  }

  var last = function last(arr) {
    return arr.length ? arr[arr.length - 1] : null;
  }; // based on https://github.com/thysultan/stylis.js/blob/e6843c373ebcbbfade25ebcc23f540ed8508da0a/src/Tokenizer.js#L239-L244


  var identifierWithPointTracking = function identifierWithPointTracking(begin, points, index) {
    var previous = 0;
    var character = 0;

    while (true) {
      previous = character;
      character = P(); // &\f

      if (previous === 38 && character === 12) {
        points[index] = 1;
      }

      if (T(character)) {
        break;
      }

      N();
    }

    return R(begin, F);
  };

  var toRules = function toRules(parsed, points) {
    // pretend we've started with a comma
    var index = -1;
    var character = 44;

    do {
      switch (T(character)) {
        case 0:
          // &\f
          if (character === 38 && P() === 12) {
            // this is not 100% correct, we don't account for literal sequences here - like for example quoted strings
            // stylis inserts \f after & to know when & where it should replace this sequence with the context selector
            // and when it should just concatenate the outer and inner selectors
            // it's very unlikely for this sequence to actually appear in a different context, so we just leverage this fact here
            points[index] = 1;
          }

          parsed[index] += identifierWithPointTracking(F - 1, points, index);
          break;

        case 2:
          parsed[index] += W(character);
          break;

        case 4:
          // comma
          if (character === 44) {
            // colon
            parsed[++index] = P() === 58 ? '&\f' : '';
            points[index] = parsed[index].length;
            break;
          }

        // fallthrough

        default:
          parsed[index] += d(character);
      }
    } while (character = N());

    return parsed;
  };

  var getRules = function getRules(value, points) {
    return V(toRules(U(value), points));
  }; // WeakSet would be more appropriate, but only WeakMap is supported in IE11


  var fixedElements = /* #__PURE__ */new WeakMap();
  var compat = function compat(element) {
    if (element.type !== 'rule' || !element.parent || // positive .length indicates that this rule contains pseudo
    // negative .length indicates that this rule has been already prefixed
    element.length < 1) {
      return;
    }

    var value = element.value,
        parent = element.parent;
    var isImplicitRule = element.column === parent.column && element.line === parent.line;

    while (parent.type !== 'rule') {
      parent = parent.parent;
      if (!parent) return;
    } // short-circuit for the simplest case


    if (element.props.length === 1 && value.charCodeAt(0) !== 58
    /* colon */
    && !fixedElements.get(parent)) {
      return;
    } // if this is an implicitly inserted rule (the one eagerly inserted at the each new nested level)
    // then the props has already been manipulated beforehand as they that array is shared between it and its "rule parent"


    if (isImplicitRule) {
      return;
    }

    fixedElements.set(element, true);
    var points = [];
    var rules = getRules(value, points);
    var parentRules = parent.props;

    for (var i = 0, k = 0; i < rules.length; i++) {
      for (var j = 0; j < parentRules.length; j++, k++) {
        element.props[k] = points[i] ? rules[i].replace(/&\f/g, parentRules[j]) : parentRules[j] + " " + rules[i];
      }
    }
  };
  var removeLabel = function removeLabel(element) {
    if (element.type === 'decl') {
      var value = element.value;

      if ( // charcode for l
      value.charCodeAt(0) === 108 && // charcode for b
      value.charCodeAt(2) === 98) {
        // this ignores label
        element["return"] = '';
        element.value = '';
      }
    }
  };
  var ignoreFlag = 'emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason';

  var isIgnoringComment = function isIgnoringComment(element) {
    return !!element && element.type === 'comm' && element.children.indexOf(ignoreFlag) > -1;
  };

  var createUnsafeSelectorsAlarm = function createUnsafeSelectorsAlarm(cache) {
    return function (element, index, children) {
      if (element.type !== 'rule') return;
      var unsafePseudoClasses = element.value.match(/(:first|:nth|:nth-last)-child/g);

      if (unsafePseudoClasses && cache.compat !== true) {
        var prevElement = index > 0 ? children[index - 1] : null;

        if (prevElement && isIgnoringComment(last(prevElement.children))) {
          return;
        }

        unsafePseudoClasses.forEach(function (unsafePseudoClass) {
          console.error("The pseudo class \"" + unsafePseudoClass + "\" is potentially unsafe when doing server-side rendering. Try changing it to \"" + unsafePseudoClass.split('-child')[0] + "-of-type\".");
        });
      }
    };
  };

  var isImportRule = function isImportRule(element) {
    return element.type.charCodeAt(1) === 105 && element.type.charCodeAt(0) === 64;
  };

  var isPrependedWithRegularRules = function isPrependedWithRegularRules(index, children) {
    for (var i = index - 1; i >= 0; i--) {
      if (!isImportRule(children[i])) {
        return true;
      }
    }

    return false;
  }; // use this to remove incorrect elements from further processing
  // so they don't get handed to the `sheet` (or anything else)
  // as that could potentially lead to additional logs which in turn could be overhelming to the user


  var nullifyElement = function nullifyElement(element) {
    element.type = '';
    element.value = '';
    element["return"] = '';
    element.children = '';
    element.props = '';
  };

  var incorrectImportAlarm = function incorrectImportAlarm(element, index, children) {
    if (!isImportRule(element)) {
      return;
    }

    if (element.parent) {
      console.error("`@import` rules can't be nested inside other rules. Please move it to the top level and put it before regular rules. Keep in mind that they can only be used within global styles.");
      nullifyElement(element);
    } else if (isPrependedWithRegularRules(index, children)) {
      console.error("`@import` rules can't be after other rules. Please put your `@import` rules before your other rules.");
      nullifyElement(element);
    }
  };

  var defaultStylisPlugins = [he];

  var createCache = function createCache(options) {
    var key = options.key;

    if ( !key) {
      throw new Error("You have to configure `key` for your cache. Please make sure it's unique (and not equal to 'css') as it's used for linking styles to your cache.\n" + "If multiple caches share the same key they might \"fight\" for each other's style elements.");
    }

    if ( key === 'css') {
      var ssrStyles = document.querySelectorAll("style[data-emotion]:not([data-s])"); // get SSRed styles out of the way of React's hydration
      // document.head is a safe place to move them to(though note document.head is not necessarily the last place they will be)
      // note this very very intentionally targets all style elements regardless of the key to ensure
      // that creating a cache works inside of render of a React component

      Array.prototype.forEach.call(ssrStyles, function (node) {
        // we want to only move elements which have a space in the data-emotion attribute value
        // because that indicates that it is an Emotion 11 server-side rendered style elements
        // while we will already ignore Emotion 11 client-side inserted styles because of the :not([data-s]) part in the selector
        // Emotion 10 client-side inserted styles did not have data-s (but importantly did not have a space in their data-emotion attributes)
        // so checking for the space ensures that loading Emotion 11 after Emotion 10 has inserted some styles
        // will not result in the Emotion 10 styles being destroyed
        var dataEmotionAttribute = node.getAttribute('data-emotion');

        if (dataEmotionAttribute.indexOf(' ') === -1) {
          return;
        }
        document.head.appendChild(node);
        node.setAttribute('data-s', '');
      });
    }

    var stylisPlugins = options.stylisPlugins || defaultStylisPlugins;

    {
      // $FlowFixMe
      if (/[^a-z-]/.test(key)) {
        throw new Error("Emotion key must only contain lower case alphabetical characters and - but \"" + key + "\" was passed");
      }
    }

    var inserted = {}; // $FlowFixMe

    var container;
    var nodesToHydrate = [];

    {
      container = options.container || document.head;
      Array.prototype.forEach.call( // this means we will ignore elements which don't have a space in them which
      // means that the style elements we're looking at are only Emotion 11 server-rendered style elements
      document.querySelectorAll("style[data-emotion^=\"" + key + " \"]"), function (node) {
        var attrib = node.getAttribute("data-emotion").split(' '); // $FlowFixMe

        for (var i = 1; i < attrib.length; i++) {
          inserted[attrib[i]] = true;
        }

        nodesToHydrate.push(node);
      });
    }

    var _insert;

    var omnipresentPlugins = [compat, removeLabel];

    {
      omnipresentPlugins.push(createUnsafeSelectorsAlarm({
        get compat() {
          return cache.compat;
        }

      }), incorrectImportAlarm);
    }

    {
      var currentSheet;
      var finalizingPlugins = [oe,  function (element) {
        if (!element.root) {
          if (element["return"]) {
            currentSheet.insert(element["return"]);
          } else if (element.value && element.type !== c) {
            // insert empty rule in non-production environments
            // so @emotion/jest can grab `key` from the (JS)DOM for caches without any rules inserted yet
            currentSheet.insert(element.value + "{}");
          }
        }
      } ];
      var serializer = le(omnipresentPlugins.concat(stylisPlugins, finalizingPlugins));

      var stylis = function stylis(styles) {
        return fe(ce(styles), serializer);
      };

      _insert = function insert(selector, serialized, sheet, shouldCache) {
        currentSheet = sheet;

        if ( serialized.map !== undefined) {
          currentSheet = {
            insert: function insert(rule) {
              sheet.insert(rule + serialized.map);
            }
          };
        }

        stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);

        if (shouldCache) {
          cache.inserted[serialized.name] = true;
        }
      };
    }

    var cache = {
      key: key,
      sheet: new StyleSheet({
        key: key,
        container: container,
        nonce: options.nonce,
        speedy: options.speedy,
        prepend: options.prepend,
        insertionPoint: options.insertionPoint
      }),
      nonce: options.nonce,
      inserted: inserted,
      registered: {},
      insert: _insert
    };
    cache.sheet.hydrate(nodesToHydrate);
    return cache;
  };

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  var reactIs_development = createCommonjsModule(function (module, exports) {



  {
    (function() {

  // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
  // nor polyfill, then a plain number is used for performance.
  var hasSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
  var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
  var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
  var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
  var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
  var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
  var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
  // (unstable) APIs that have been removed. Can we remove the symbols?

  var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
  var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
  var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
  var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
  var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
  var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
  var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
  var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
  var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
  var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
  var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

  function isValidElementType(type) {
    return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
    type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
  }

  function typeOf(object) {
    if (typeof object === 'object' && object !== null) {
      var $$typeof = object.$$typeof;

      switch ($$typeof) {
        case REACT_ELEMENT_TYPE:
          var type = object.type;

          switch (type) {
            case REACT_ASYNC_MODE_TYPE:
            case REACT_CONCURRENT_MODE_TYPE:
            case REACT_FRAGMENT_TYPE:
            case REACT_PROFILER_TYPE:
            case REACT_STRICT_MODE_TYPE:
            case REACT_SUSPENSE_TYPE:
              return type;

            default:
              var $$typeofType = type && type.$$typeof;

              switch ($$typeofType) {
                case REACT_CONTEXT_TYPE:
                case REACT_FORWARD_REF_TYPE:
                case REACT_LAZY_TYPE:
                case REACT_MEMO_TYPE:
                case REACT_PROVIDER_TYPE:
                  return $$typeofType;

                default:
                  return $$typeof;
              }

          }

        case REACT_PORTAL_TYPE:
          return $$typeof;
      }
    }

    return undefined;
  } // AsyncMode is deprecated along with isAsyncMode

  var AsyncMode = REACT_ASYNC_MODE_TYPE;
  var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
  var ContextConsumer = REACT_CONTEXT_TYPE;
  var ContextProvider = REACT_PROVIDER_TYPE;
  var Element = REACT_ELEMENT_TYPE;
  var ForwardRef = REACT_FORWARD_REF_TYPE;
  var Fragment = REACT_FRAGMENT_TYPE;
  var Lazy = REACT_LAZY_TYPE;
  var Memo = REACT_MEMO_TYPE;
  var Portal = REACT_PORTAL_TYPE;
  var Profiler = REACT_PROFILER_TYPE;
  var StrictMode = REACT_STRICT_MODE_TYPE;
  var Suspense = REACT_SUSPENSE_TYPE;
  var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

  function isAsyncMode(object) {
    {
      if (!hasWarnedAboutDeprecatedIsAsyncMode) {
        hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

        console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
      }
    }

    return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
  }
  function isConcurrentMode(object) {
    return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
  }
  function isContextConsumer(object) {
    return typeOf(object) === REACT_CONTEXT_TYPE;
  }
  function isContextProvider(object) {
    return typeOf(object) === REACT_PROVIDER_TYPE;
  }
  function isElement(object) {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  }
  function isForwardRef(object) {
    return typeOf(object) === REACT_FORWARD_REF_TYPE;
  }
  function isFragment(object) {
    return typeOf(object) === REACT_FRAGMENT_TYPE;
  }
  function isLazy(object) {
    return typeOf(object) === REACT_LAZY_TYPE;
  }
  function isMemo(object) {
    return typeOf(object) === REACT_MEMO_TYPE;
  }
  function isPortal(object) {
    return typeOf(object) === REACT_PORTAL_TYPE;
  }
  function isProfiler(object) {
    return typeOf(object) === REACT_PROFILER_TYPE;
  }
  function isStrictMode(object) {
    return typeOf(object) === REACT_STRICT_MODE_TYPE;
  }
  function isSuspense(object) {
    return typeOf(object) === REACT_SUSPENSE_TYPE;
  }

  exports.AsyncMode = AsyncMode;
  exports.ConcurrentMode = ConcurrentMode;
  exports.ContextConsumer = ContextConsumer;
  exports.ContextProvider = ContextProvider;
  exports.Element = Element;
  exports.ForwardRef = ForwardRef;
  exports.Fragment = Fragment;
  exports.Lazy = Lazy;
  exports.Memo = Memo;
  exports.Portal = Portal;
  exports.Profiler = Profiler;
  exports.StrictMode = StrictMode;
  exports.Suspense = Suspense;
  exports.isAsyncMode = isAsyncMode;
  exports.isConcurrentMode = isConcurrentMode;
  exports.isContextConsumer = isContextConsumer;
  exports.isContextProvider = isContextProvider;
  exports.isElement = isElement;
  exports.isForwardRef = isForwardRef;
  exports.isFragment = isFragment;
  exports.isLazy = isLazy;
  exports.isMemo = isMemo;
  exports.isPortal = isPortal;
  exports.isProfiler = isProfiler;
  exports.isStrictMode = isStrictMode;
  exports.isSuspense = isSuspense;
  exports.isValidElementType = isValidElementType;
  exports.typeOf = typeOf;
    })();
  }
  });

  var reactIs = createCommonjsModule(function (module) {

  {
    module.exports = reactIs_development;
  }
  });

  /**
   * Copyright 2015, Yahoo! Inc.
   * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
   */
  var REACT_STATICS = {
    childContextTypes: true,
    contextType: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromError: true,
    getDerivedStateFromProps: true,
    mixins: true,
    propTypes: true,
    type: true
  };
  var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    callee: true,
    arguments: true,
    arity: true
  };
  var FORWARD_REF_STATICS = {
    '$$typeof': true,
    render: true,
    defaultProps: true,
    displayName: true,
    propTypes: true
  };
  var MEMO_STATICS = {
    '$$typeof': true,
    compare: true,
    defaultProps: true,
    displayName: true,
    propTypes: true,
    type: true
  };
  var TYPE_STATICS = {};
  TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
  TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;

  function getStatics(component) {
    // React v16.11 and below
    if (reactIs.isMemo(component)) {
      return MEMO_STATICS;
    } // React v16.12 and above


    return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
  }

  var defineProperty = Object.defineProperty;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var getPrototypeOf = Object.getPrototypeOf;
  var objectPrototype = Object.prototype;
  function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
    if (typeof sourceComponent !== 'string') {
      // don't hoist over string (html) components
      if (objectPrototype) {
        var inheritedComponent = getPrototypeOf(sourceComponent);

        if (inheritedComponent && inheritedComponent !== objectPrototype) {
          hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
        }
      }

      var keys = getOwnPropertyNames(sourceComponent);

      if (getOwnPropertySymbols) {
        keys = keys.concat(getOwnPropertySymbols(sourceComponent));
      }

      var targetStatics = getStatics(targetComponent);
      var sourceStatics = getStatics(sourceComponent);

      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];

        if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
          var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

          try {
            // Avoid failures from read-only properties
            defineProperty(targetComponent, key, descriptor);
          } catch (e) {}
        }
      }
    }

    return targetComponent;
  }

  var hoistNonReactStatics_cjs = hoistNonReactStatics;

  // this file isolates this package that is not tree-shakeable
  // and if this module doesn't actually contain any logic of its own
  // then Rollup just use 'hoist-non-react-statics' directly in other chunks

  var hoistNonReactStatics$1 = (function (targetComponent, sourceComponent) {
    return hoistNonReactStatics_cjs(targetComponent, sourceComponent);
  });

  var isBrowser = "object" !== 'undefined';
  function getRegisteredStyles(registered, registeredStyles, classNames) {
    var rawClassName = '';
    classNames.split(' ').forEach(function (className) {
      if (registered[className] !== undefined) {
        registeredStyles.push(registered[className] + ";");
      } else {
        rawClassName += className + " ";
      }
    });
    return rawClassName;
  }
  var insertStyles = function insertStyles(cache, serialized, isStringTag) {
    var className = cache.key + "-" + serialized.name;

    if ( // we only need to add the styles to the registered cache if the
    // class name could be used further down
    // the tree but if it's a string tag, we know it won't
    // so we don't have to add it to registered cache.
    // this improves memory usage since we can avoid storing the whole style string
    (isStringTag === false || // we need to always store it if we're in compat mode and
    // in node since emotion-server relies on whether a style is in
    // the registered cache to know whether a style is global or not
    // also, note that this check will be dead code eliminated in the browser
    isBrowser === false ) && cache.registered[className] === undefined) {
      cache.registered[className] = serialized.styles;
    }

    if (cache.inserted[serialized.name] === undefined) {
      var current = serialized;

      do {
        var maybeStyles = cache.insert(serialized === current ? "." + className : '', current, cache.sheet, true);

        current = current.next;
      } while (current !== undefined);
    }
  };

  /* eslint-disable */
  // Inspired by https://github.com/garycourt/murmurhash-js
  // Ported from https://github.com/aappleby/smhasher/blob/61a0530f28277f2e850bfc39600ce61d02b518de/src/MurmurHash2.cpp#L37-L86
  function murmur2(str) {
    // 'm' and 'r' are mixing constants generated offline.
    // They're not really 'magic', they just happen to work well.
    // const m = 0x5bd1e995;
    // const r = 24;
    // Initialize the hash
    var h = 0; // Mix 4 bytes at a time into the hash

    var k,
        i = 0,
        len = str.length;

    for (; len >= 4; ++i, len -= 4) {
      k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;
      k =
      /* Math.imul(k, m): */
      (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16);
      k ^=
      /* k >>> r: */
      k >>> 24;
      h =
      /* Math.imul(k, m): */
      (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16) ^
      /* Math.imul(h, m): */
      (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
    } // Handle the last few bytes of the input array


    switch (len) {
      case 3:
        h ^= (str.charCodeAt(i + 2) & 0xff) << 16;

      case 2:
        h ^= (str.charCodeAt(i + 1) & 0xff) << 8;

      case 1:
        h ^= str.charCodeAt(i) & 0xff;
        h =
        /* Math.imul(h, m): */
        (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
    } // Do a few final mixes of the hash to ensure the last few
    // bytes are well-incorporated.


    h ^= h >>> 13;
    h =
    /* Math.imul(h, m): */
    (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
    return ((h ^ h >>> 15) >>> 0).toString(36);
  }

  var unitlessKeys = {
    animationIterationCount: 1,
    borderImageOutset: 1,
    borderImageSlice: 1,
    borderImageWidth: 1,
    boxFlex: 1,
    boxFlexGroup: 1,
    boxOrdinalGroup: 1,
    columnCount: 1,
    columns: 1,
    flex: 1,
    flexGrow: 1,
    flexPositive: 1,
    flexShrink: 1,
    flexNegative: 1,
    flexOrder: 1,
    gridRow: 1,
    gridRowEnd: 1,
    gridRowSpan: 1,
    gridRowStart: 1,
    gridColumn: 1,
    gridColumnEnd: 1,
    gridColumnSpan: 1,
    gridColumnStart: 1,
    msGridRow: 1,
    msGridRowSpan: 1,
    msGridColumn: 1,
    msGridColumnSpan: 1,
    fontWeight: 1,
    lineHeight: 1,
    opacity: 1,
    order: 1,
    orphans: 1,
    tabSize: 1,
    widows: 1,
    zIndex: 1,
    zoom: 1,
    WebkitLineClamp: 1,
    // SVG-related properties
    fillOpacity: 1,
    floodOpacity: 1,
    stopOpacity: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
    strokeMiterlimit: 1,
    strokeOpacity: 1,
    strokeWidth: 1
  };

  var ILLEGAL_ESCAPE_SEQUENCE_ERROR = "You have illegal escape sequence in your template literal, most likely inside content's property value.\nBecause you write your CSS inside a JavaScript string you actually have to do double escaping, so for example \"content: '\\00d7';\" should become \"content: '\\\\00d7';\".\nYou can read more about this here:\nhttps://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences";
  var UNDEFINED_AS_OBJECT_KEY_ERROR = "You have passed in falsy value as style object's key (can happen when in example you pass unexported component as computed key).";
  var hyphenateRegex = /[A-Z]|^ms/g;
  var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;

  var isCustomProperty = function isCustomProperty(property) {
    return property.charCodeAt(1) === 45;
  };

  var isProcessableValue = function isProcessableValue(value) {
    return value != null && typeof value !== 'boolean';
  };

  var processStyleName = /* #__PURE__ */memoize(function (styleName) {
    return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, '-$&').toLowerCase();
  });

  var processStyleValue = function processStyleValue(key, value) {
    switch (key) {
      case 'animation':
      case 'animationName':
        {
          if (typeof value === 'string') {
            return value.replace(animationRegex, function (match, p1, p2) {
              cursor = {
                name: p1,
                styles: p2,
                next: cursor
              };
              return p1;
            });
          }
        }
    }

    if (unitlessKeys[key] !== 1 && !isCustomProperty(key) && typeof value === 'number' && value !== 0) {
      return value + 'px';
    }

    return value;
  };

  {
    var contentValuePattern = /(attr|counters?|url|(((repeating-)?(linear|radial))|conic)-gradient)\(|(no-)?(open|close)-quote/;
    var contentValues = ['normal', 'none', 'initial', 'inherit', 'unset'];
    var oldProcessStyleValue = processStyleValue;
    var msPattern = /^-ms-/;
    var hyphenPattern = /-(.)/g;
    var hyphenatedCache = {};

    processStyleValue = function processStyleValue(key, value) {
      if (key === 'content') {
        if (typeof value !== 'string' || contentValues.indexOf(value) === -1 && !contentValuePattern.test(value) && (value.charAt(0) !== value.charAt(value.length - 1) || value.charAt(0) !== '"' && value.charAt(0) !== "'")) {
          throw new Error("You seem to be using a value for 'content' without quotes, try replacing it with `content: '\"" + value + "\"'`");
        }
      }

      var processed = oldProcessStyleValue(key, value);

      if (processed !== '' && !isCustomProperty(key) && key.indexOf('-') !== -1 && hyphenatedCache[key] === undefined) {
        hyphenatedCache[key] = true;
        console.error("Using kebab-case for css properties in objects is not supported. Did you mean " + key.replace(msPattern, 'ms-').replace(hyphenPattern, function (str, _char) {
          return _char.toUpperCase();
        }) + "?");
      }

      return processed;
    };
  }

  function handleInterpolation(mergedProps, registered, interpolation) {
    if (interpolation == null) {
      return '';
    }

    if (interpolation.__emotion_styles !== undefined) {
      if ( interpolation.toString() === 'NO_COMPONENT_SELECTOR') {
        throw new Error('Component selectors can only be used in conjunction with @emotion/babel-plugin.');
      }

      return interpolation;
    }

    switch (typeof interpolation) {
      case 'boolean':
        {
          return '';
        }

      case 'object':
        {
          if (interpolation.anim === 1) {
            cursor = {
              name: interpolation.name,
              styles: interpolation.styles,
              next: cursor
            };
            return interpolation.name;
          }

          if (interpolation.styles !== undefined) {
            var next = interpolation.next;

            if (next !== undefined) {
              // not the most efficient thing ever but this is a pretty rare case
              // and there will be very few iterations of this generally
              while (next !== undefined) {
                cursor = {
                  name: next.name,
                  styles: next.styles,
                  next: cursor
                };
                next = next.next;
              }
            }

            var styles = interpolation.styles + ";";

            if ( interpolation.map !== undefined) {
              styles += interpolation.map;
            }

            return styles;
          }

          return createStringFromObject(mergedProps, registered, interpolation);
        }

      case 'function':
        {
          if (mergedProps !== undefined) {
            var previousCursor = cursor;
            var result = interpolation(mergedProps);
            cursor = previousCursor;
            return handleInterpolation(mergedProps, registered, result);
          } else {
            console.error('Functions that are interpolated in css calls will be stringified.\n' + 'If you want to have a css call based on props, create a function that returns a css call like this\n' + 'let dynamicStyle = (props) => css`color: ${props.color}`\n' + 'It can be called directly with props or interpolated in a styled call like this\n' + "let SomeComponent = styled('div')`${dynamicStyle}`");
          }

          break;
        }

      case 'string':
        {
          var matched = [];
          var replaced = interpolation.replace(animationRegex, function (match, p1, p2) {
            var fakeVarName = "animation" + matched.length;
            matched.push("const " + fakeVarName + " = keyframes`" + p2.replace(/^@keyframes animation-\w+/, '') + "`");
            return "${" + fakeVarName + "}";
          });

          if (matched.length) {
            console.error('`keyframes` output got interpolated into plain string, please wrap it with `css`.\n\n' + 'Instead of doing this:\n\n' + [].concat(matched, ["`" + replaced + "`"]).join('\n') + '\n\nYou should wrap it with `css` like this:\n\n' + ("css`" + replaced + "`"));
          }
        }

        break;
    } // finalize string values (regular strings and functions interpolated into css calls)


    if (registered == null) {
      return interpolation;
    }

    var cached = registered[interpolation];
    return cached !== undefined ? cached : interpolation;
  }

  function createStringFromObject(mergedProps, registered, obj) {
    var string = '';

    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        string += handleInterpolation(mergedProps, registered, obj[i]) + ";";
      }
    } else {
      for (var _key in obj) {
        var value = obj[_key];

        if (typeof value !== 'object') {
          if (registered != null && registered[value] !== undefined) {
            string += _key + "{" + registered[value] + "}";
          } else if (isProcessableValue(value)) {
            string += processStyleName(_key) + ":" + processStyleValue(_key, value) + ";";
          }
        } else {
          if (_key === 'NO_COMPONENT_SELECTOR' && "development" !== 'production') {
            throw new Error('Component selectors can only be used in conjunction with @emotion/babel-plugin.');
          }

          if (Array.isArray(value) && typeof value[0] === 'string' && (registered == null || registered[value[0]] === undefined)) {
            for (var _i = 0; _i < value.length; _i++) {
              if (isProcessableValue(value[_i])) {
                string += processStyleName(_key) + ":" + processStyleValue(_key, value[_i]) + ";";
              }
            }
          } else {
            var interpolated = handleInterpolation(mergedProps, registered, value);

            switch (_key) {
              case 'animation':
              case 'animationName':
                {
                  string += processStyleName(_key) + ":" + interpolated + ";";
                  break;
                }

              default:
                {
                  if ( _key === 'undefined') {
                    console.error(UNDEFINED_AS_OBJECT_KEY_ERROR);
                  }

                  string += _key + "{" + interpolated + "}";
                }
            }
          }
        }
      }
    }

    return string;
  }

  var labelPattern = /label:\s*([^\s;\n{]+)\s*(;|$)/g;
  var sourceMapPattern;

  {
    sourceMapPattern = /\/\*#\ssourceMappingURL=data:application\/json;\S+\s+\*\//g;
  } // this is the cursor for keyframes
  // keyframes are stored on the SerializedStyles object as a linked list


  var cursor;
  var serializeStyles = function serializeStyles(args, registered, mergedProps) {
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && args[0].styles !== undefined) {
      return args[0];
    }

    var stringMode = true;
    var styles = '';
    cursor = undefined;
    var strings = args[0];

    if (strings == null || strings.raw === undefined) {
      stringMode = false;
      styles += handleInterpolation(mergedProps, registered, strings);
    } else {
      if ( strings[0] === undefined) {
        console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
      }

      styles += strings[0];
    } // we start at 1 since we've already handled the first arg


    for (var i = 1; i < args.length; i++) {
      styles += handleInterpolation(mergedProps, registered, args[i]);

      if (stringMode) {
        if ( strings[i] === undefined) {
          console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
        }

        styles += strings[i];
      }
    }

    var sourceMap;

    {
      styles = styles.replace(sourceMapPattern, function (match) {
        sourceMap = match;
        return '';
      });
    } // using a global regex with .exec is stateful so lastIndex has to be reset each time


    labelPattern.lastIndex = 0;
    var identifierName = '';
    var match; // https://esbench.com/bench/5b809c2cf2949800a0f61fb5

    while ((match = labelPattern.exec(styles)) !== null) {
      identifierName += '-' + // $FlowFixMe we know it's not null
      match[1];
    }

    var name = murmur2(styles) + identifierName;

    {
      // $FlowFixMe SerializedStyles type doesn't have toString property (and we don't want to add it)
      return {
        name: name,
        styles: styles,
        map: sourceMap,
        next: cursor,
        toString: function toString() {
          return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
        }
      };
    }
  };

  var hasOwnProperty = {}.hasOwnProperty;

  var EmotionCacheContext = /* #__PURE__ */React.createContext( // we're doing this to avoid preconstruct's dead code elimination in this one case
  // because this module is primarily intended for the browser and node
  // but it's also required in react native and similar environments sometimes
  // and we could have a special build just for that
  // but this is much easier and the native packages
  // might use a different theme context in the future anyway
  typeof HTMLElement !== 'undefined' ? /* #__PURE__ */createCache({
    key: 'css'
  }) : null);

  {
    EmotionCacheContext.displayName = 'EmotionCacheContext';
  }

  var CacheProvider = EmotionCacheContext.Provider;
  var __unsafe_useEmotionCache = function useEmotionCache() {
    return React.useContext(EmotionCacheContext);
  };

  var withEmotionCache = function withEmotionCache(func) {
    // $FlowFixMe
    return /*#__PURE__*/React.forwardRef(function (props, ref) {
      // the cache will never be null in the browser
      var cache = React.useContext(EmotionCacheContext);
      return func(props, cache, ref);
    });
  };

  var ThemeContext = /* #__PURE__ */React.createContext({});

  {
    ThemeContext.displayName = 'EmotionThemeContext';
  }

  var useTheme = function useTheme() {
    return React.useContext(ThemeContext);
  };

  var getTheme = function getTheme(outerTheme, theme) {
    if (typeof theme === 'function') {
      var mergedTheme = theme(outerTheme);

      if ( (mergedTheme == null || typeof mergedTheme !== 'object' || Array.isArray(mergedTheme))) {
        throw new Error('[ThemeProvider] Please return an object from your theme function, i.e. theme={() => ({})}!');
      }

      return mergedTheme;
    }

    if ( (theme == null || typeof theme !== 'object' || Array.isArray(theme))) {
      throw new Error('[ThemeProvider] Please make your theme prop a plain object');
    }

    return _extends({}, outerTheme, theme);
  };

  var createCacheWithTheme = /* #__PURE__ */weakMemoize(function (outerTheme) {
    return weakMemoize(function (theme) {
      return getTheme(outerTheme, theme);
    });
  });
  var ThemeProvider = function ThemeProvider(props) {
    var theme = React.useContext(ThemeContext);

    if (props.theme !== theme) {
      theme = createCacheWithTheme(theme)(props.theme);
    }

    return /*#__PURE__*/React.createElement(ThemeContext.Provider, {
      value: theme
    }, props.children);
  };
  function withTheme(Component) {
    var componentName = Component.displayName || Component.name || 'Component';

    var render = function render(props, ref) {
      var theme = React.useContext(ThemeContext);
      return /*#__PURE__*/React.createElement(Component, _extends({
        theme: theme,
        ref: ref
      }, props));
    }; // $FlowFixMe


    var WithTheme = /*#__PURE__*/React.forwardRef(render);
    WithTheme.displayName = "WithTheme(" + componentName + ")";
    return hoistNonReactStatics$1(WithTheme, Component);
  }

  var getFunctionNameFromStackTraceLine = function getFunctionNameFromStackTraceLine(line) {
    // V8
    var match = /^\s+at\s+([A-Za-z0-9$.]+)\s/.exec(line);

    if (match) {
      // The match may be something like 'Object.createEmotionProps'
      var parts = match[1].split('.');
      return parts[parts.length - 1];
    } // Safari / Firefox


    match = /^([A-Za-z0-9$.]+)@/.exec(line);
    if (match) return match[1];
    return undefined;
  };

  var internalReactFunctionNames = /* #__PURE__ */new Set(['renderWithHooks', 'processChild', 'finishClassComponent', 'renderToString']); // These identifiers come from error stacks, so they have to be valid JS
  // identifiers, thus we only need to replace what is a valid character for JS,
  // but not for CSS.

  var sanitizeIdentifier = function sanitizeIdentifier(identifier) {
    return identifier.replace(/\$/g, '-');
  };

  var getLabelFromStackTrace = function getLabelFromStackTrace(stackTrace) {
    if (!stackTrace) return undefined;
    var lines = stackTrace.split('\n');

    for (var i = 0; i < lines.length; i++) {
      var functionName = getFunctionNameFromStackTraceLine(lines[i]); // The first line of V8 stack traces is just "Error"

      if (!functionName) continue; // If we reach one of these, we have gone too far and should quit

      if (internalReactFunctionNames.has(functionName)) break; // The component name is the first function in the stack that starts with an
      // uppercase letter

      if (/^[A-Z]/.test(functionName)) return sanitizeIdentifier(functionName);
    }

    return undefined;
  };

  var typePropName = '__EMOTION_TYPE_PLEASE_DO_NOT_USE__';
  var labelPropName = '__EMOTION_LABEL_PLEASE_DO_NOT_USE__';
  var createEmotionProps = function createEmotionProps(type, props) {
    if ( typeof props.css === 'string' && // check if there is a css declaration
    props.css.indexOf(':') !== -1) {
      throw new Error("Strings are not allowed as css prop values, please wrap it in a css template literal from '@emotion/react' like this: css`" + props.css + "`");
    }

    var newProps = {};

    for (var key in props) {
      if (hasOwnProperty.call(props, key)) {
        newProps[key] = props[key];
      }
    }

    newProps[typePropName] = type; // For performance, only call getLabelFromStackTrace in development and when
    // the label hasn't already been computed

    if ( !!props.css && (typeof props.css !== 'object' || typeof props.css.name !== 'string' || props.css.name.indexOf('-') === -1)) {
      var label = getLabelFromStackTrace(new Error().stack);
      if (label) newProps[labelPropName] = label;
    }

    return newProps;
  };

  var Noop = function Noop() {
    return null;
  };

  var Emotion = /* #__PURE__ */withEmotionCache(function (props, cache, ref) {
    var cssProp = props.css; // so that using `css` from `emotion` and passing the result to the css prop works
    // not passing the registered cache to serializeStyles because it would
    // make certain babel optimisations not possible

    if (typeof cssProp === 'string' && cache.registered[cssProp] !== undefined) {
      cssProp = cache.registered[cssProp];
    }

    var type = props[typePropName];
    var registeredStyles = [cssProp];
    var className = '';

    if (typeof props.className === 'string') {
      className = getRegisteredStyles(cache.registered, registeredStyles, props.className);
    } else if (props.className != null) {
      className = props.className + " ";
    }

    var serialized = serializeStyles(registeredStyles, undefined, React.useContext(ThemeContext));

    if ( serialized.name.indexOf('-') === -1) {
      var labelFromStack = props[labelPropName];

      if (labelFromStack) {
        serialized = serializeStyles([serialized, 'label:' + labelFromStack + ';']);
      }
    }

    var rules = insertStyles(cache, serialized, typeof type === 'string');
    className += cache.key + "-" + serialized.name;
    var newProps = {};

    for (var key in props) {
      if (hasOwnProperty.call(props, key) && key !== 'css' && key !== typePropName && ( key !== labelPropName)) {
        newProps[key] = props[key];
      }
    }

    newProps.ref = ref;
    newProps.className = className;
    var ele = /*#__PURE__*/React.createElement(type, newProps);
    var possiblyStyleElement = /*#__PURE__*/React.createElement(Noop, null);


    return /*#__PURE__*/React.createElement(React.Fragment, null, possiblyStyleElement, ele);
  });

  {
    Emotion.displayName = 'EmotionCssPropInternal';
  }

  var _extends_1 = createCommonjsModule(function (module) {
  function _extends() {
    module.exports = _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports;
    return _extends.apply(this, arguments);
  }

  module.exports = _extends, module.exports.__esModule = true, module.exports["default"] = module.exports;
  });

  unwrapExports(_extends_1);

  var pkg = {
  	name: "@emotion/react",
  	version: "11.7.1",
  	main: "dist/emotion-react.cjs.js",
  	module: "dist/emotion-react.esm.js",
  	browser: {
  		"./dist/emotion-react.cjs.js": "./dist/emotion-react.browser.cjs.js",
  		"./dist/emotion-react.esm.js": "./dist/emotion-react.browser.esm.js"
  	},
  	types: "types/index.d.ts",
  	files: [
  		"src",
  		"dist",
  		"jsx-runtime",
  		"jsx-dev-runtime",
  		"_isolated-hnrs",
  		"types/*.d.ts",
  		"macro.js",
  		"macro.d.ts",
  		"macro.js.flow"
  	],
  	sideEffects: false,
  	author: "mitchellhamilton <mitchell@mitchellhamilton.me>",
  	license: "MIT",
  	scripts: {
  		"test:typescript": "dtslint types"
  	},
  	dependencies: {
  		"@babel/runtime": "^7.13.10",
  		"@emotion/cache": "^11.7.1",
  		"@emotion/serialize": "^1.0.2",
  		"@emotion/sheet": "^1.1.0",
  		"@emotion/utils": "^1.0.0",
  		"@emotion/weak-memoize": "^0.2.5",
  		"hoist-non-react-statics": "^3.3.1"
  	},
  	peerDependencies: {
  		"@babel/core": "^7.0.0",
  		react: ">=16.8.0"
  	},
  	peerDependenciesMeta: {
  		"@babel/core": {
  			optional: true
  		},
  		"@types/react": {
  			optional: true
  		}
  	},
  	devDependencies: {
  		"@babel/core": "^7.13.10",
  		"@emotion/css": "11.7.1",
  		"@emotion/css-prettifier": "1.0.1",
  		"@emotion/server": "11.4.0",
  		"@emotion/styled": "11.6.0",
  		"@types/react": "^16.9.11",
  		dtslint: "^0.3.0",
  		"html-tag-names": "^1.1.2",
  		react: "16.14.0",
  		"svg-tag-names": "^1.1.1"
  	},
  	repository: "https://github.com/emotion-js/emotion/tree/main/packages/react",
  	publishConfig: {
  		access: "public"
  	},
  	"umd:main": "dist/emotion-react.umd.min.js",
  	preconstruct: {
  		entrypoints: [
  			"./index.js",
  			"./jsx-runtime.js",
  			"./jsx-dev-runtime.js",
  			"./_isolated-hnrs.js"
  		],
  		umdName: "emotionReact"
  	}
  };

  var jsx = function jsx(type, props) {
    var args = arguments;

    if (props == null || !hasOwnProperty.call(props, 'css')) {
      // $FlowFixMe
      return React.createElement.apply(undefined, args);
    }

    var argsLength = args.length;
    var createElementArgArray = new Array(argsLength);
    createElementArgArray[0] = Emotion;
    createElementArgArray[1] = createEmotionProps(type, props);

    for (var i = 2; i < argsLength; i++) {
      createElementArgArray[i] = args[i];
    } // $FlowFixMe


    return React.createElement.apply(null, createElementArgArray);
  };

  var warnedAboutCssPropForGlobal = false; // maintain place over rerenders.
  // initial render from browser, insertBefore context.sheet.tags[0] or if a style hasn't been inserted there yet, appendChild
  // initial client-side render from SSR, use place of hydrating tag

  var Global = /* #__PURE__ */withEmotionCache(function (props, cache) {
    if ( !warnedAboutCssPropForGlobal && ( // check for className as well since the user is
    // probably using the custom createElement which
    // means it will be turned into a className prop
    // $FlowFixMe I don't really want to add it to the type since it shouldn't be used
    props.className || props.css)) {
      console.error("It looks like you're using the css prop on Global, did you mean to use the styles prop instead?");
      warnedAboutCssPropForGlobal = true;
    }

    var styles = props.styles;
    var serialized = serializeStyles([styles], undefined, React.useContext(ThemeContext));
    // but it is based on a constant that will never change at runtime
    // it's effectively like having two implementations and switching them out
    // so it's not actually breaking anything


    var sheetRef = React.useRef();
    React.useLayoutEffect(function () {
      var key = cache.key + "-global";
      var sheet = new StyleSheet({
        key: key,
        nonce: cache.sheet.nonce,
        container: cache.sheet.container,
        speedy: cache.sheet.isSpeedy
      });
      var rehydrating = false; // $FlowFixMe

      var node = document.querySelector("style[data-emotion=\"" + key + " " + serialized.name + "\"]");

      if (cache.sheet.tags.length) {
        sheet.before = cache.sheet.tags[0];
      }

      if (node !== null) {
        rehydrating = true; // clear the hash so this node won't be recognizable as rehydratable by other <Global/>s

        node.setAttribute('data-emotion', key);
        sheet.hydrate([node]);
      }

      sheetRef.current = [sheet, rehydrating];
      return function () {
        sheet.flush();
      };
    }, [cache]);
    React.useLayoutEffect(function () {
      var sheetRefCurrent = sheetRef.current;
      var sheet = sheetRefCurrent[0],
          rehydrating = sheetRefCurrent[1];

      if (rehydrating) {
        sheetRefCurrent[1] = false;
        return;
      }

      if (serialized.next !== undefined) {
        // insert keyframes
        insertStyles(cache, serialized.next, true);
      }

      if (sheet.tags.length) {
        // if this doesn't exist then it will be null so the style element will be appended
        var element = sheet.tags[sheet.tags.length - 1].nextElementSibling;
        sheet.before = element;
        sheet.flush();
      }

      cache.insert("", serialized, sheet, false);
    }, [cache, serialized.name]);
    return null;
  });

  {
    Global.displayName = 'EmotionGlobal';
  }

  function css() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return serializeStyles(args);
  }

  var keyframes = function keyframes() {
    var insertable = css.apply(void 0, arguments);
    var name = "animation-" + insertable.name; // $FlowFixMe

    return {
      name: name,
      styles: "@keyframes " + name + "{" + insertable.styles + "}",
      anim: 1,
      toString: function toString() {
        return "_EMO_" + this.name + "_" + this.styles + "_EMO_";
      }
    };
  };

  var classnames = function classnames(args) {
    var len = args.length;
    var i = 0;
    var cls = '';

    for (; i < len; i++) {
      var arg = args[i];
      if (arg == null) continue;
      var toAdd = void 0;

      switch (typeof arg) {
        case 'boolean':
          break;

        case 'object':
          {
            if (Array.isArray(arg)) {
              toAdd = classnames(arg);
            } else {
              if ( arg.styles !== undefined && arg.name !== undefined) {
                console.error('You have passed styles created with `css` from `@emotion/react` package to the `cx`.\n' + '`cx` is meant to compose class names (strings) so you should convert those styles to a class name by passing them to the `css` received from <ClassNames/> component.');
              }

              toAdd = '';

              for (var k in arg) {
                if (arg[k] && k) {
                  toAdd && (toAdd += ' ');
                  toAdd += k;
                }
              }
            }

            break;
          }

        default:
          {
            toAdd = arg;
          }
      }

      if (toAdd) {
        cls && (cls += ' ');
        cls += toAdd;
      }
    }

    return cls;
  };

  function merge(registered, css, className) {
    var registeredStyles = [];
    var rawClassName = getRegisteredStyles(registered, registeredStyles, className);

    if (registeredStyles.length < 2) {
      return className;
    }

    return rawClassName + css(registeredStyles);
  }

  var Noop$1 = function Noop() {
    return null;
  };

  var ClassNames = /* #__PURE__ */withEmotionCache(function (props, cache) {
    var hasRendered = false;

    var css = function css() {
      if (hasRendered && "development" !== 'production') {
        throw new Error('css can only be used during render');
      }

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var serialized = serializeStyles(args, cache.registered);

      {
        insertStyles(cache, serialized, false);
      }

      return cache.key + "-" + serialized.name;
    };

    var cx = function cx() {
      if (hasRendered && "development" !== 'production') {
        throw new Error('cx can only be used during render');
      }

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return merge(cache.registered, css, classnames(args));
    };

    var content = {
      css: css,
      cx: cx,
      theme: React.useContext(ThemeContext)
    };
    var ele = props.children(content);
    hasRendered = true;
    var possiblyStyleElement = /*#__PURE__*/React.createElement(Noop$1, null);


    return /*#__PURE__*/React.createElement(React.Fragment, null, possiblyStyleElement, ele);
  });

  {
    ClassNames.displayName = 'EmotionClassNames';
  }

  {
    var isBrowser$1 = "object" !== 'undefined'; // #1727 for some reason Jest evaluates modules twice if some consuming module gets mocked with jest.mock

    var isJest = typeof jest !== 'undefined';

    if (isBrowser$1 && !isJest) {
      // globalThis has wide browser support - https://caniuse.com/?search=globalThis, Node.js 12 and later
      var globalContext = // $FlowIgnore
      typeof globalThis !== 'undefined' ? globalThis // eslint-disable-line no-undef
      : isBrowser$1 ? window : global;
      var globalKey = "__EMOTION_REACT_" + pkg.version.split('.')[0] + "__";

      if (globalContext[globalKey]) {
        console.warn('You are loading @emotion/react when it is already loaded. Running ' + 'multiple instances may cause problems. This can happen if multiple ' + 'versions are used, or if multiple builds of the same version are ' + 'used.');
      }

      globalContext[globalKey] = true;
    }
  }

  var emotionReact_browser_esm = {
    __proto__: null,
    ClassNames: ClassNames,
    Global: Global,
    createElement: jsx,
    css: css,
    jsx: jsx,
    keyframes: keyframes,
    CacheProvider: CacheProvider,
    ThemeContext: ThemeContext,
    ThemeProvider: ThemeProvider,
    __unsafe_useEmotionCache: __unsafe_useEmotionCache,
    useTheme: useTheme,
    withEmotionCache: withEmotionCache,
    withTheme: withTheme
  };

  var proptypes = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.heightWidthRadiusDefaults = exports.heightWidthDefaults = exports.sizeMarginDefaults = exports.sizeDefaults = void 0;
  /*
   * DefaultProps object for different loaders
   */
  var commonValues = {
      loading: true,
      color: "#000000",
      css: "",
      speedMultiplier: 1
  };
  function sizeDefaults(sizeValue) {
      return Object.assign({}, commonValues, { size: sizeValue });
  }
  exports.sizeDefaults = sizeDefaults;
  function sizeMarginDefaults(sizeValue) {
      return Object.assign({}, sizeDefaults(sizeValue), {
          margin: 2
      });
  }
  exports.sizeMarginDefaults = sizeMarginDefaults;
  function heightWidthDefaults(height, width) {
      return Object.assign({}, commonValues, {
          height: height,
          width: width
      });
  }
  exports.heightWidthDefaults = heightWidthDefaults;
  function heightWidthRadiusDefaults(height, width, radius) {
      if (radius === void 0) { radius = 2; }
      return Object.assign({}, heightWidthDefaults(height, width), {
          radius: radius,
          margin: 2
      });
  }
  exports.heightWidthRadiusDefaults = heightWidthRadiusDefaults;
  });

  unwrapExports(proptypes);

  var colors = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.calculateRgba = void 0;
  var BasicColors;
  (function (BasicColors) {
      BasicColors["maroon"] = "#800000";
      BasicColors["red"] = "#FF0000";
      BasicColors["orange"] = "#FFA500";
      BasicColors["yellow"] = "#FFFF00";
      BasicColors["olive"] = "#808000";
      BasicColors["green"] = "#008000";
      BasicColors["purple"] = "#800080";
      BasicColors["fuchsia"] = "#FF00FF";
      BasicColors["lime"] = "#00FF00";
      BasicColors["teal"] = "#008080";
      BasicColors["aqua"] = "#00FFFF";
      BasicColors["blue"] = "#0000FF";
      BasicColors["navy"] = "#000080";
      BasicColors["black"] = "#000000";
      BasicColors["gray"] = "#808080";
      BasicColors["silver"] = "#C0C0C0";
      BasicColors["white"] = "#FFFFFF";
  })(BasicColors || (BasicColors = {}));
  var calculateRgba = function (color, opacity) {
      if (Object.keys(BasicColors).includes(color)) {
          color = BasicColors[color];
      }
      if (color[0] === "#") {
          color = color.slice(1);
      }
      if (color.length === 3) {
          var res_1 = "";
          color.split("").forEach(function (c) {
              res_1 += c;
              res_1 += c;
          });
          color = res_1;
      }
      var rgbValues = (color.match(/.{2}/g) || [])
          .map(function (hex) { return parseInt(hex, 16); })
          .join(", ");
      return "rgba(" + rgbValues + ", " + opacity + ")";
  };
  exports.calculateRgba = calculateRgba;
  });

  unwrapExports(colors);

  var unitConverter = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.cssValue = exports.parseLengthAndUnit = void 0;
  var cssUnit = {
      cm: true,
      mm: true,
      in: true,
      px: true,
      pt: true,
      pc: true,
      em: true,
      ex: true,
      ch: true,
      rem: true,
      vw: true,
      vh: true,
      vmin: true,
      vmax: true,
      "%": true
  };
  /**
   * If size is a number, append px to the value as default unit.
   * If size is a string, validate against list of valid units.
   * If unit is valid, return size as is.
   * If unit is invalid, console warn issue, replace with px as the unit.
   *
   * @param {(number | string)} size
   * @return {LengthObject} LengthObject
   */
  function parseLengthAndUnit(size) {
      if (typeof size === "number") {
          return {
              value: size,
              unit: "px"
          };
      }
      var value;
      var valueString = (size.match(/^[0-9.]*/) || "").toString();
      if (valueString.includes(".")) {
          value = parseFloat(valueString);
      }
      else {
          value = parseInt(valueString, 10);
      }
      var unit = (size.match(/[^0-9]*$/) || "").toString();
      if (cssUnit[unit]) {
          return {
              value: value,
              unit: unit
          };
      }
      console.warn("React Spinners: " + size + " is not a valid css value. Defaulting to " + value + "px.");
      return {
          value: value,
          unit: "px"
      };
  }
  exports.parseLengthAndUnit = parseLengthAndUnit;
  /**
   * Take value as an input and return valid css value
   *
   * @param {(number | string)} value
   * @return {string} valid css value
   */
  function cssValue(value) {
      var lengthWithunit = parseLengthAndUnit(value);
      return "" + lengthWithunit.value + lengthWithunit.unit;
  }
  exports.cssValue = cssValue;
  });

  unwrapExports(unitConverter);

  var helpers = createCommonjsModule(function (module, exports) {
  var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(proptypes, exports);
  __exportStar(colors, exports);
  __exportStar(unitConverter, exports);
  });

  unwrapExports(helpers);

  var react_1 = getCjsExportFromNamespace(emotionReact_browser_esm);

  var PulseLoader = createCommonjsModule(function (module, exports) {
  var __makeTemplateObject = (commonjsGlobal && commonjsGlobal.__makeTemplateObject) || function (cooked, raw) {
      if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
      return cooked;
  };
  var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
      var extendStatics = function (d, b) {
          extendStatics = Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
              function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
          return extendStatics(d, b);
      };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
  }) : function(o, v) {
      o["default"] = v;
  });
  var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  /** @jsx jsx */
  var React = __importStar(React__default);


  var pulse = react_1.keyframes(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  0% {transform: scale(1);opacity: 1}\n  45% {transform: scale(0.1);opacity: 0.7}\n  80% {transform: scale(1);opacity: 1}\n"], ["\n  0% {transform: scale(1);opacity: 1}\n  45% {transform: scale(0.1);opacity: 0.7}\n  80% {transform: scale(1);opacity: 1}\n"])));
  var Loader = /** @class */ (function (_super) {
      __extends(Loader, _super);
      function Loader() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.style = function (i) {
              var _a = _this.props, color = _a.color, size = _a.size, margin = _a.margin, speedMultiplier = _a.speedMultiplier;
              return react_1.css(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      background-color: ", ";\n      width: ", ";\n      height: ", ";\n      margin: ", ";\n      border-radius: 100%;\n      display: inline-block;\n      animation: ", " ", "s ", "s infinite\n        cubic-bezier(0.2, 0.68, 0.18, 1.08);\n      animation-fill-mode: both;\n    "], ["\n      background-color: ", ";\n      width: ", ";\n      height: ", ";\n      margin: ", ";\n      border-radius: 100%;\n      display: inline-block;\n      animation: ", " ", "s ", "s infinite\n        cubic-bezier(0.2, 0.68, 0.18, 1.08);\n      animation-fill-mode: both;\n    "])), color, helpers.cssValue(size), helpers.cssValue(size), helpers.cssValue(margin), pulse, 0.75 / speedMultiplier, (i * 0.12) / speedMultiplier);
          };
          return _this;
      }
      Loader.prototype.render = function () {
          var _a = this.props, loading = _a.loading, css = _a.css;
          return loading ? (react_1.jsx("span", { css: [css] },
              react_1.jsx("span", { css: this.style(1) }),
              react_1.jsx("span", { css: this.style(2) }),
              react_1.jsx("span", { css: this.style(3) }))) : null;
      };
      Loader.defaultProps = helpers.sizeMarginDefaults(15);
      return Loader;
  }(React.PureComponent));
  exports.default = Loader;
  var templateObject_1, templateObject_2;
  });

  var PulseLoader$1 = unwrapExports(PulseLoader);

  var useStyles$2 = /*#__PURE__*/core.makeStyles(function () {
    return {
      table: {
        padding: 0
      },
      link: {
        color: 'rgb(0, 0, 238)'
      },
      tableContainer: {
        width: '100%',
        maxHeight: 600,
        overflow: 'auto'
      }
    };
  });

  function Pathways(props) {
    var classes = useStyles$2();
    var model = props.model,
        pathways = props.pathways;

    var _useState = React.useState(0),
        _useState2 = _slicedToArray(_useState, 2),
        page = _useState2[0],
        setPage = _useState2[1];

    var _useState3 = React.useState(5),
        _useState4 = _slicedToArray(_useState3, 2),
        rowsPerPage = _useState4[0],
        setRowsPerPage = _useState4[1];

    var _useState5 = React.useState({
      name: ''
    }),
        _useState6 = _slicedToArray(_useState5, 2),
        selected = _useState6[0],
        setSelected = _useState6[1];

    var handleClick = function handleClick(event, pathway) {
      setSelected(pathway);
      var toHighlight = [];
      var session = util.getSession(model);
      session.views.forEach(function (sessionModel, i) {
        if (sessionModel === model) {
          var targetModel = session.views.filter(function (view) {
            return (view === null || view === void 0 ? void 0 : view.ideogramId) === (sessionModel === null || sessionModel === void 0 ? void 0 : sessionModel.ideogramId) && view !== sessionModel;
          })[0]; // @ts-ignore

          targetModel.ideoAnnotations.forEach(function (annot) {
            var _annot$details$reacto;

            if ((_annot$details$reacto = annot.details.reactomeIds) !== null && _annot$details$reacto !== void 0 && _annot$details$reacto.includes(pathway.stId)) {
              toHighlight.push(annot.name);
            }
          }); // @ts-ignore

          targetModel.setHighlightedAnnots(toHighlight);
        }
      });
    };

    var handleChangePage = function handleChangePage(event, newPage) {
      setPage(newPage);
    };

    var handleChangeRowsPerPage = function handleChangeRowsPerPage(event) {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    pathways = pathways.slice().sort(function (a, b) {
      return parseFloat(a.entities.pValue) - parseFloat(b.entities.pValue);
    });
    var headers = ['Pathway name', 'Entities found', 'Entities Total', 'Entities ratio', 'Entities pValue', 'Entities FDR', 'Reactions found', 'Reactions total', 'Reactions ratio'];

    var isSelected = function isSelected(pathway) {
      return selected.name === pathway.name;
    }; // pagination retrieved from https://v4.mui.com/components/tables/#sorting-amp-selecting


    return /*#__PURE__*/React__default.createElement(BaseFeatureDetail.BaseCard, {
      title: "Pathways"
    }, /*#__PURE__*/React__default.createElement(core.TableContainer, {
      className: classes.tableContainer
    }, /*#__PURE__*/React__default.createElement(core.Table, {
      className: classes.table
    }, /*#__PURE__*/React__default.createElement(core.TableHead, null, /*#__PURE__*/React__default.createElement(core.TableRow, null, headers.map(function (header, index) {
      return /*#__PURE__*/React__default.createElement(core.TableCell, {
        key: "".concat(index, "-").concat(header)
      }, header);
    }))), /*#__PURE__*/React__default.createElement(core.TableBody, null, pathways.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(function (pathway, key) {
      var isItemSelected = isSelected(pathway);
      return /*#__PURE__*/React__default.createElement(core.TableRow, {
        key: key,
        onClick: function onClick(event) {
          return handleClick(event, pathway);
        },
        selected: isItemSelected
      }, /*#__PURE__*/React__default.createElement(core.TableCell, null, /*#__PURE__*/React__default.createElement(core.Link, {
        target: "_blank",
        rel: "noopener",
        underline: "always",
        href: "https://reactome.org/content/detail/".concat(pathway.stId)
      }, pathway.name)), /*#__PURE__*/React__default.createElement(core.TableCell, {
        align: "right"
      }, pathway.entities.found), /*#__PURE__*/React__default.createElement(core.TableCell, {
        align: "right"
      }, pathway.entities.total), /*#__PURE__*/React__default.createElement(core.TableCell, {
        align: "right"
      }, pathway.entities.ratio.toExponential(2)), /*#__PURE__*/React__default.createElement(core.TableCell, {
        align: "right"
      }, pathway.entities.pValue.toExponential(2)), /*#__PURE__*/React__default.createElement(core.TableCell, {
        align: "right"
      }, pathway.entities.fdr.toExponential(2)), /*#__PURE__*/React__default.createElement(core.TableCell, {
        align: "right"
      }, pathway.reactions.found), /*#__PURE__*/React__default.createElement(core.TableCell, {
        align: "right"
      }, pathway.reactions.total), /*#__PURE__*/React__default.createElement(core.TableCell, {
        align: "right"
      }, pathway.reactions.ratio.toFixed(3)));
    })))), /*#__PURE__*/React__default.createElement(core.TablePagination, {
      rowsPerPageOptions: [5, 10, 25],
      component: "div",
      count: pathways.length,
      rowsPerPage: rowsPerPage,
      page: page,
      onPageChange: handleChangePage,
      onRowsPerPageChange: handleChangeRowsPerPage
    }));
  }

  var Pathways$1 = /*#__PURE__*/mobxReact.observer(Pathways);

  var iter = 0;
  var IdeogramView = /*#__PURE__*/mobxReact.observer(function (_ref) {
    var model = _ref.model;
    var ref = React.useRef(null);
    var identifier = React.useMemo(function () {
      iter++;
      return 'ideo-container-' + iter;
    }, []);
    var chromosomes = model.allRegions ? allChromosomes : [model.region];
    var chrHeight = model.allRegions || model.orientation === 'vertical' ? 500 : 900;
    var chrWidth = model.allRegions && model.orientation === 'vertical' ? 8 : 10;
    var showBandLabels = !model.allRegions;
    var annotations = model.ideoAnnotations && model.showAnnotations ? model.ideoAnnotations : undefined;
    var legend = model.ideoAnnotations && 'tier' in model.ideoAnnotations[0].details ? tierLegend : undefined;

    function onClickAnnot(annot) {
      var session = util.getSession(model);
      var target = model.widgetAnnotations.filter(function (data) {
        return data.name === annot.name;
      })[0];
      model.setSelectedAnnot(annot.name);

      if (session) {
        // @ts-ignore
        var widget = session.addWidget('IdeogramFeatureWidget', 'ideogramFeature', {
          featureData: target,
          view: model
        }); // @ts-ignore

        session.showWidget(widget);
        session.setSelection(target);
      }
    }

    var config = {
      organism: 'human',
      sex: model.sex,
      chrHeight: chrHeight,
      chrWidth: chrWidth,
      chromosomes: chromosomes,
      showBandLabels: showBandLabels,
      rotatable: false,
      orientation: model.orientation,
      container: '#' + identifier,
      annotations: annotations,
      legend: legend,
      onClickAnnot: onClickAnnot
    };
    React.useEffect(function () {
      if (ref.current) {
        return new Ideogram$1(config);
      }
    }, [model.sex, model.orientation, model.pliody, model.showImportForm, model.allRegions, model.region, model.showAnnotations, model.showLoading, model.isAnalysisResults, model.selectedAnnot, model.highlightedAnnots]);
    React.useEffect(function () {
      var annotate = /*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee() {
          return runtime_1.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return populateAnnotations(model);

                case 2:
                  model.setShowLoading(false);

                case 3:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function annotate() {
          return _ref2.apply(this, arguments);
        };
      }();

      if (!model.ideoAnnotations && !model.showImportForm) {
        annotate()["catch"](console.error);
      }
    }, [model.annotationsLocation, model.withReactome]);
    return /*#__PURE__*/React__default.createElement("div", null, model.showImportForm && !model.isAnalysisResults ? /*#__PURE__*/React__default.createElement(ImportForm, {
      model: model
    }) : null, !model.showImportForm && model.showLoading && !model.isAnalysisResults ? /*#__PURE__*/React__default.createElement(core.Grid, {
      container: true,
      spacing: 1,
      justifyContent: "center",
      alignItems: "center",
      style: {
        paddingTop: '5px'
      },
      direction: "column"
    }, /*#__PURE__*/React__default.createElement(core.Typography, {
      variant: "body1"
    }, "Generating annotations"), /*#__PURE__*/React__default.createElement(PulseLoader$1, {
      color: "#0D233F",
      speedMultiplier: 0.5,
      size: 10
    })) : null, !model.showImportForm && !model.showLoading && !model.isAnalysisResults && model.orientation === 'horizontal' ? /*#__PURE__*/React__default.createElement(core.Grid, {
      container: true,
      spacing: 1,
      justifyContent: "center",
      alignItems: "center"
    }, /*#__PURE__*/React__default.createElement("div", {
      ref: ref,
      id: identifier
    })) : null, !model.showImportForm && !model.showLoading && !model.isAnalysisResults && model.orientation === 'vertical' ? /*#__PURE__*/React__default.createElement("div", {
      ref: ref,
      id: identifier,
      style: {
        paddingTop: '5px'
      }
    }) : null, model.isAnalysisResults && model.pathways ? /*#__PURE__*/React__default.createElement(Pathways$1, {
      model: model,
      pathways: model.pathways
    }) : null, !model.isAnalysisResults ? /*#__PURE__*/React__default.createElement(core.Typography, {
      variant: "caption",
      style: {
        paddingLeft: '4px',
        paddingBottom: '4px'
      }
    }, "Powered by", ' ', /*#__PURE__*/React__default.createElement(core.Link, {
      href: "https://eweitz.github.io/ideogram/"
    }, "ideogram.js"), ".") : null);
  });

  var ExpandMore = createCommonjsModule(function (module, exports) {





  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;

  var React = interopRequireWildcard(React__default);

  var _createSvgIcon = interopRequireDefault(createSvgIcon);

  var _default = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
    d: "M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
  }), 'ExpandMore');

  exports.default = _default;
  });

  var ExpandMoreIcon = unwrapExports(ExpandMore);

  var ChevronRight = createCommonjsModule(function (module, exports) {





  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;

  var React = interopRequireWildcard(React__default);

  var _createSvgIcon = interopRequireDefault(createSvgIcon);

  var _default = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
    d: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
  }), 'ChevronRight');

  exports.default = _default;
  });

  var ChevronRightIcon = unwrapExports(ChevronRight);

  var MenuOpen = createCommonjsModule(function (module, exports) {





  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;

  var React = interopRequireWildcard(React__default);

  var _createSvgIcon = interopRequireDefault(createSvgIcon);

  var _default = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
    d: "M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9.59L17.42 12 21 8.41 19.59 7l-5 5 5 5L21 15.59z"
  }), 'MenuOpen');

  exports.default = _default;
  });

  var MenuOpenIcon = unwrapExports(MenuOpen);

  var useStyles$3 = /*#__PURE__*/core.makeStyles(function () {
    return {
      table: {
        padding: 0
      },
      link: {
        color: 'rgb(0, 0, 238)'
      },
      tableContainer: {
        width: '100%',
        maxHeight: 600,
        overflow: 'auto'
      }
    };
  });
  /**
   * Render a single table row for an external link
   */

  var ExternalLink = /*#__PURE__*/mobxReact.observer(function (props) {
    var classes = useStyles$3();
    var id = props.id,
        name = props.name,
        link = props.link;
    return /*#__PURE__*/React__default.createElement(React__default.Fragment, null, /*#__PURE__*/React__default.createElement(core.TableRow, {
      key: "".concat(id, "-").concat(name)
    }, /*#__PURE__*/React__default.createElement(core.TableCell, null, name), /*#__PURE__*/React__default.createElement(core.TableCell, null, /*#__PURE__*/React__default.createElement(core.Link, {
      className: classes.link,
      target: "_blank",
      rel: "noopener",
      href: "".concat(link),
      underline: "always"
    }, id))));
  });

  function ExternalLinks(props) {
    var classes = useStyles$3();
    var feature = props.feature;
    var externalLinkArray = feature.externalLinks;
    return /*#__PURE__*/React__default.createElement(BaseFeatureDetail.BaseCard, {
      title: "External Links"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: classes.tableContainer
    }, /*#__PURE__*/React__default.createElement(core.Table, {
      className: classes.table
    }, /*#__PURE__*/React__default.createElement(core.TableBody, null, externalLinkArray.map(function (externalLink, key) {
      return /*#__PURE__*/React__default.createElement(ExternalLink, Object.assign({
        id: feature.geneSymbol ? feature.geneSymbol : feature.name
      }, externalLink, {
        key: key
      }));
    })))));
  }

  function Synonyms(props) {
    var classes = useStyles$3();
    var feature = props.feature;
    var synonyms = feature.synonyms.split(',');
    return /*#__PURE__*/React__default.createElement(BaseFeatureDetail.BaseCard, {
      title: "Synonyms"
    }, /*#__PURE__*/React__default.createElement("div", {
      className: classes.tableContainer
    }, /*#__PURE__*/React__default.createElement(core.Table, {
      className: classes.table
    }, /*#__PURE__*/React__default.createElement(core.TableBody, null, /*#__PURE__*/React__default.createElement(core.TableRow, {
      key: "".concat(feature.geneId, "-synonyms")
    }, /*#__PURE__*/React__default.createElement(core.TableCell, null, synonyms.map(function (synonym, key) {
      return /*#__PURE__*/React__default.createElement(core.Chip, {
        label: synonym,
        key: key,
        style: {
          marginRight: '2px',
          marginTop: '2px'
        }
      });
    })))))));
  }

  function NavLink(props) {
    var feature = props.feature,
        model = props.model;
    return /*#__PURE__*/React__default.createElement(BaseFeatureDetail.BaseCard, {
      title: "Navigate to feature on linear genome view"
    }, /*#__PURE__*/React__default.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React__default.createElement(core.Button, {
      variant: "contained",
      color: "primary",
      size: "large",
      onClick: function onClick() {
        navToAnnotation("".concat(feature.genomeLocation), model);
      }
    }, "Navigate")));
  }

  function ReactomeItem(props) {
    var node = props.node,
        model = props.model,
        pathways = props.pathways,
        geneName = props.geneName;
    var classes = useStyles$3();
    return /*#__PURE__*/React__default.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React__default.createElement(core.Link, {
      className: classes.link,
      target: "_blank",
      rel: "noopener",
      href: "https://reactome.org/PathwayBrowser/#/".concat(node.stId, "&FLG=").concat(node.name),
      underline: "always"
    }, node.name), model.hasPlugin('ReactomePlugin') ? /*#__PURE__*/React__default.createElement(core.Tooltip, {
      title: "Open pathway in Reactome Plugin"
    }, /*#__PURE__*/React__default.createElement(core.IconButton, {
      color: "primary",
      component: "span",
      onClick: function onClick() {
        openReactomeView(node.stId, pathways, node.name, geneName, model);
      }
    }, /*#__PURE__*/React__default.createElement(MenuOpenIcon, null))) : null);
  }

  function Hierarchy(props) {
    var hierarchy = props.hierarchy,
        model = props.model,
        pathways = props.pathways,
        geneName = props.geneName;

    var renderTree = function renderTree(nodes) {
      return /*#__PURE__*/React__default.createElement(lab.TreeItem, {
        key: nodes.stId,
        nodeId: nodes.stId,
        label: /*#__PURE__*/React__default.createElement(ReactomeItem, {
          node: nodes,
          model: model,
          pathways: pathways,
          geneName: geneName
        })
      }, Array.isArray(nodes.children) ? nodes.children.map(function (node) {
        return renderTree(node);
      }) : null);
    };

    return /*#__PURE__*/React__default.createElement(BaseFeatureDetail.BaseCard, {
      title: "Reactome Annotated Pathways"
    }, /*#__PURE__*/React__default.createElement(lab.TreeView, {
      defaultCollapseIcon: /*#__PURE__*/React__default.createElement(ExpandMoreIcon, null),
      defaultExpandIcon: /*#__PURE__*/React__default.createElement(ChevronRightIcon, null)
    }, hierarchy.map(function (node) {
      return renderTree(node);
    })));
  }

  function IdeoFeatureDetails(props) {
    var _fullFeature$hierarch;

    var model = props.model;
    var feat = model.featureData;

    var fullFeature = _objectSpread2({
      start: feat.start,
      end: feat.end
    }, feat.details);

    return /*#__PURE__*/React__default.createElement(core.Paper, {
      "data-testid": "ideo-widget"
    }, /*#__PURE__*/React__default.createElement(BaseFeatureDetail.FeatureDetails, Object.assign({
      feature: fullFeature
    }, props, {
      omit: ['synonyms', 'externalLinks', 'pathways', 'reactomeIds', 'hierarchy']
    })), /*#__PURE__*/React__default.createElement(NavLink, {
      feature: fullFeature,
      model: model
    }), fullFeature.externalLinks && /*#__PURE__*/React__default.createElement(ExternalLinks, {
      feature: fullFeature
    }), fullFeature.synonyms && /*#__PURE__*/React__default.createElement(Synonyms, {
      feature: fullFeature
    }), ((_fullFeature$hierarch = fullFeature.hierarchy) === null || _fullFeature$hierarch === void 0 ? void 0 : _fullFeature$hierarch.length) > 0 && /*#__PURE__*/React__default.createElement(Hierarchy, {
      hierarchy: fullFeature.hierarchy,
      model: model,
      pathways: fullFeature.pathways,
      geneName: fullFeature.name
    }));
  }

  var ReactComponent = /*#__PURE__*/mobxReact.observer(IdeoFeatureDetails);

  var IdeogramFeatureWidgetF = (function (pluginManager) {
    var configSchema = configuration.ConfigurationSchema('IdeogramFeatureWidget', {});
    var stateModel = mobxStateTree.types.model('IdeogramFeatureWidget', {
      id: mst.ElementId,
      type: mobxStateTree.types.literal('IdeogramFeatureWidget'),
      featureData: mobxStateTree.types.frozen({}),
      view: mobxStateTree.types.safeReference(pluginManager.pluggableMstType('view', 'stateModel'))
    }).actions(function (self) {
      return {
        setFeatureData: function setFeatureData(data) {
          self.featureData = data;
        },
        clearFeatureData: function clearFeatureData() {
          self.featureData = {};
        },
        hasPlugin: function hasPlugin(name) {
          return pluginManager.hasPlugin(name);
        }
      };
    });
    return {
      configSchema: configSchema,
      stateModel: stateModel,
      ReactComponent: ReactComponent
    };
  });

  var Visibility = createCommonjsModule(function (module, exports) {





  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;

  var React = interopRequireWildcard(React__default);

  var _createSvgIcon = interopRequireDefault(createSvgIcon);

  var _default = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
    d: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
  }), 'Visibility');

  exports.default = _default;
  });

  var VisibilityIcon = unwrapExports(Visibility);

  function AlignHorizontalLeftIcon(props) {
    return /*#__PURE__*/React__default.createElement(SvgIcon, Object.assign({}, props), /*#__PURE__*/React__default.createElement("path", {
      d: "M4,22H2V2h2V22z M22,7H6v3h16V7z M16,14H6v3h10V14z"
    }));
  }
  function MaleIcon(props) {
    return /*#__PURE__*/React__default.createElement(SvgIcon, Object.assign({}, props), /*#__PURE__*/React__default.createElement("path", {
      d: "M9.5,11c1.93,0,3.5,1.57,3.5,3.5S11.43,18,9.5,18S6,16.43,6,14.5S7.57,11,9.5,11z M9.5,9C6.46,9,4,11.46,4,14.5 S6.46,20,9.5,20s5.5-2.46,5.5-5.5c0-1.16-0.36-2.23-0.97-3.12L18,7.42V10h2V4h-6v2h2.58l-3.97,3.97C11.73,9.36,10.66,9,9.5,9z"
    }));
  }
  function HourglassIcon(props) {
    return /*#__PURE__*/React__default.createElement(SvgIcon, Object.assign({}, props), /*#__PURE__*/React__default.createElement("path", {
      d: "M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"
    }));
  }

  var FolderOpen = createCommonjsModule(function (module, exports) {





  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;

  var React = interopRequireWildcard(React__default);

  var _createSvgIcon = interopRequireDefault(createSvgIcon);

  var _default = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
    d: "M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"
  }), 'FolderOpen');

  exports.default = _default;
  });

  var FolderOpenIcon = unwrapExports(FolderOpen);

  var TableChart = createCommonjsModule(function (module, exports) {





  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;

  var React = interopRequireWildcard(React__default);

  var _createSvgIcon = interopRequireDefault(createSvgIcon);

  var _default = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
    d: "M10 10.02h5V21h-5zM17 21h3c1.1 0 2-.9 2-2v-9h-5v11zm3-18H5c-1.1 0-2 .9-2 2v3h19V5c0-1.1-.9-2-2-2zM3 19c0 1.1.9 2 2 2h3V10H3v9z"
  }), 'TableChart');

  exports.default = _default;
  });

  var TableChartIcon = unwrapExports(TableChart);

  function IdeogramView$1(pluginManager) {
    return mobxStateTree.types.model('IdeogramView', {
      type: mobxStateTree.types.literal('IdeogramView'),
      displayName: mobxStateTree.types.maybe(mobxStateTree.types.string),
      id: mst.ElementId,
      // ideogram config
      sex: 'female',
      orientation: 'vertical',
      region: '1',
      assembly: 'hg38',
      selectedAnnot: '',
      ideogramId: '',
      // display options
      allRegions: false,
      showImportForm: true,
      showAnnotations: true,
      withReactome: false,
      showLoading: false,
      isAnalysisResults: false,
      annotationsLocation: mobxStateTree.types.optional(mobxStateTree.types.frozen(), {
        uri: '',
        locationType: 'UriLocation'
      })
    })["volatile"](function () {
      return {
        widgetAnnotations: undefined,
        ideoAnnotations: undefined,
        pathways: undefined,
        highlightedAnnots: undefined
      };
    }).actions(function (self) {
      return {
        setWidth: function setWidth(n) {
          /* do nothing */
        },
        setDisplayName: function setDisplayName(str) {
          self.displayName = str;
        },
        setRegion: function setRegion(chr) {
          self.region = chr.split('chr')[1];
        },
        setAssembly: function setAssembly(asm) {
          self.assembly = asm;
        },
        setAllRegions: function setAllRegions(toggle) {
          self.allRegions = toggle;
        },
        setOrientation: function setOrientation(ori) {
          if (ori === 'horizontal') {
            self.orientation = ori;
          }

          if (ori === 'vertical') {
            self.orientation = ori;
          }
        },
        setShowImportForm: function setShowImportForm(toggle) {
          self.showImportForm = toggle;
        },
        setAnnotationsLocation: function setAnnotationsLocation(loc) {
          self.annotationsLocation = loc;
        },
        setWidgetAnnotations: function setWidgetAnnotations(obj) {
          self.widgetAnnotations = obj;
        },
        setIdeoAnnotations: function setIdeoAnnotations(obj) {
          self.ideoAnnotations = obj;
        },
        setWithReactome: function setWithReactome(toggle) {
          self.withReactome = toggle;
        },
        setShowLoading: function setShowLoading(toggle) {
          self.showLoading = toggle;
        },
        setPathways: function setPathways(obj) {
          self.pathways = obj;
        },
        setIsAnalysisResults: function setIsAnalysisResults(toggle) {
          self.isAnalysisResults = toggle;
        },
        setSelectedAnnot: function setSelectedAnnot(item) {
          self.selectedAnnot = item;
          this.applyHighlighting();
        },
        setHighlightedAnnots: function setHighlightedAnnots(arr) {
          self.highlightedAnnots = arr;
          this.applyHighlighting();
        },
        setIdeogramId: function setIdeogramId(id) {
          self.ideogramId = id;
        },
        applyHighlighting: function applyHighlighting() {
          // @ts-ignore
          self.ideoAnnotations.filter(function (annot) {
            var _self$highlightedAnno, _self$highlightedAnno2;

            if ((_self$highlightedAnno = self.highlightedAnnots) !== null && _self$highlightedAnno !== void 0 && _self$highlightedAnno.includes(annot.name)) {
              annot.color = '#FFC20A';
            }

            if (self.selectedAnnot === annot.name) {
              annot.color = '#000000';
            }

            if (!((_self$highlightedAnno2 = self.highlightedAnnots) !== null && _self$highlightedAnno2 !== void 0 && _self$highlightedAnno2.includes(annot.name)) && self.selectedAnnot !== annot.name) {
              annot.color = annot.prevColor;
            }
          });
        },
        toggleAllRegions: function toggleAllRegions(toggle) {
          if (toggle === false) {
            this.setOrientation('horizontal');
          }

          this.setAllRegions(toggle);
        },
        toggleOrientation: function toggleOrientation() {
          if (self.orientation === 'horizontal') {
            this.setOrientation('vertical');
          } else {
            this.setOrientation('horizontal');
          }
        },
        toggleSex: function toggleSex() {
          if (self.sex === 'male') {
            self.sex = 'female';
          } else {
            self.sex = 'male';
          }
        },
        toggleAnnotations: function toggleAnnotations() {
          self.showAnnotations = !self.showAnnotations;
        },
        refreshTable: function refreshTable() {
          var session = util.getSession(self);
          var isActive = false;
          session.views.forEach(function (view) {
            if (view !== null && view !== void 0 && view.isAnalysisResults) isActive = true;
          });

          if (!isActive) {
            session.addView('IdeogramView', {});
            var xView = session.views.length - 1; // @ts-ignore

            session.views[xView].setDisplayName('Reactome Analysis Results'); // @ts-ignore

            session.views[xView].setPathways(self.pathways); // @ts-ignore

            session.views[xView].setIsAnalysisResults(true); // @ts-ignore

            session.views[xView].setIdeogramId(self.ideogramId);
          } else {
            session.notify('The analysis results table is already displayed.', 'info');
          }
        }
      };
    }).views(function (self) {
      return {
        menuItems: function menuItems() {
          var menuItems = [{
            label: 'Return to import form',
            icon: FolderOpenIcon,
            disabled: self.isAnalysisResults === true,
            onClick: function onClick() {
              return self.setShowImportForm(true);
            }
          }, {
            label: 'Show all regions in assembly',
            icon: VisibilityIcon,
            type: 'checkbox',
            checked: self.allRegions === true,
            disabled: self.isAnalysisResults === true || self.showImportForm === true,
            onClick: function onClick() {
              return self.toggleAllRegions(!self.allRegions);
            }
          }, {
            label: 'Horizontal Display',
            icon: AlignHorizontalLeftIcon,
            type: 'checkbox',
            disabled: self.allRegions === false && self.isAnalysisResults === true || self.showImportForm === true,
            checked: self.orientation === 'horizontal',
            onClick: function onClick() {
              return self.toggleOrientation();
            }
          }, {
            label: 'Male Genome',
            icon: MaleIcon,
            type: 'checkbox',
            checked: self.sex === 'male',
            disabled: self.isAnalysisResults === true || self.showImportForm === true,
            onClick: function onClick() {
              return self.toggleSex();
            }
          }, {
            label: 'Show annotations',
            icon: HourglassIcon,
            type: 'checkbox',
            checked: self.showAnnotations === true && self.ideoAnnotations !== undefined,
            disabled: self.widgetAnnotations === undefined && self.isAnalysisResults === true || self.showImportForm === true || self.ideoAnnotations === undefined,
            onClick: function onClick() {
              return self.toggleAnnotations();
            }
          }, {
            label: 'Refresh Analysis Results Table',
            icon: TableChartIcon,
            disabled: self.isAnalysisResults === true || self.showImportForm === true || self.withReactome === false,
            onClick: function onClick() {
              return self.refreshTable();
            }
          }];
          return menuItems;
        }
      };
    });
  }

  var IdeogramPlugin = /*#__PURE__*/function (_Plugin) {
    _inherits(IdeogramPlugin, _Plugin);

    var _super = /*#__PURE__*/_createSuper(IdeogramPlugin);

    function IdeogramPlugin() {
      var _this;

      _classCallCheck(this, IdeogramPlugin);

      _this = _super.apply(this, arguments);
      _this.name = 'IdeogramPlugin';
      _this.version = version;
      return _this;
    }

    _createClass(IdeogramPlugin, [{
      key: "install",
      value: function install(pluginManager) {
        pluginManager.addViewType(function () {
          return new ViewType({
            name: 'IdeogramView',
            stateModel: IdeogramView$1(),
            ReactComponent: IdeogramView
          });
        });
        pluginManager.addWidgetType(function () {
          return new WidgetType(_objectSpread2({
            name: 'IdeogramFeatureWidget',
            heading: 'Feature Details'
          }, IdeogramFeatureWidgetF(pluginManager)));
        });
      }
    }, {
      key: "configure",
      value: function configure(pluginManager) {
        if (util.isAbstractMenuManager(pluginManager.rootModel)) {
          pluginManager.rootModel.appendToSubMenu(['Add'], {
            label: 'Ideogram view',
            icon: PauseIcon,
            onClick: function onClick(session) {
              session.addView('IdeogramView', {});
              var xView = session.views.length - 1; // @ts-ignore

              session.views[xView].setDisplayName('Ideogram View');
            }
          });
        }
      }
    }]);

    return IdeogramPlugin;
  }(Plugin);

  exports.default = IdeogramPlugin;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=jbrowse-plugin-ideogram.umd.development.js.map
