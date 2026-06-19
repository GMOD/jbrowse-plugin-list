(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@jbrowse/core/Plugin'), require('@jbrowse/core/data_adapters/BaseAdapter'), require('@jbrowse/core/pluggableElementTypes/AdapterType'), require('@jbrowse/core/util/rxjs'), require('@jbrowse/core/configuration')) :
  typeof define === 'function' && define.amd ? define(['exports', '@jbrowse/core/Plugin', '@jbrowse/core/data_adapters/BaseAdapter', '@jbrowse/core/pluggableElementTypes/AdapterType', '@jbrowse/core/util/rxjs', '@jbrowse/core/configuration'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.JBrowsePluginBiothings = {}, global.JBrowseExports["@jbrowse/core/Plugin"], global.JBrowseExports["@jbrowse/core/data_adapters/BaseAdapter"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/AdapterType"], global.JBrowseExports["@jbrowse/core/util/rxjs"], global.JBrowseExports["@jbrowse/core/configuration"]));
})(this, (function (exports, Plugin, BaseAdapter, AdapterType, rxjs, configuration) { 'use strict';

  var version = "1.1.1";

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var simpleFeature = {};

  Object.defineProperty(simpleFeature, "__esModule", { value: true });
  simpleFeature.isFeature = void 0;
  function isFeature(thing) {
      return (typeof thing === 'object' &&
          thing !== null &&
          typeof thing.get === 'function' &&
          typeof thing.id === 'function');
  }
  simpleFeature.isFeature = isFeature;
  function isSimpleFeatureSerialized(args) {
      return 'uniqueId' in args && typeof args.data !== 'object';
  }
  /**
   * Simple implementation of a feature object.
   */
  class SimpleFeature {
      /**
       * @param args - SimpleFeature args
       *
       * Note: args.data.subfeatures can be an array of these same args,
       * which will be inflated to more instances of this class.
       */
      constructor(args) {
          var _a;
          if (isSimpleFeatureSerialized(args)) {
              this.data = args;
          }
          else {
              this.data = args.data || {};
              // load handle from args.parent (not args.data.parent)
              // this reason is because if args is an object, it likely isn't properly loaded with
              // parent as a Feature reference (probably a raw parent ID or something instead)
              this.parentHandle = args.parent;
          }
          // the feature id comes from
          // args.id, args.data.uniqueId, or args.uniqueId due to this initialization
          const id = isSimpleFeatureSerialized(args) ? args.uniqueId : args.id;
          if (id === undefined || id === null) {
              throw new Error('SimpleFeature requires a unique `id` or `data.uniqueId` attribute');
          }
          this.uniqueId = String(id);
          if (!(this.data.aliases || this.data.end - this.data.start >= 0)) {
              throw new Error(`invalid feature data, end less than start. end: ${this.data.end} start: ${this.data.start}`);
          }
          if (this.data.subfeatures) {
              this.subfeatures = (_a = this.data.subfeatures) === null || _a === void 0 ? void 0 : _a.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (f, i) => typeof f.get !== 'function'
                  ? new SimpleFeature({
                      id: f.uniqueId || `${id}-${i}`,
                      data: {
                          strand: this.data.strand,
                          ...f,
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      },
                      parent: this,
                  })
                  : f);
          }
      }
      /**
       * Get a piece of data about the feature.  All features must have
       * 'start' and 'end', but everything else is optional.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get(name) {
          return name === 'subfeatures'
              ? this.subfeatures
              : name === 'parent'
                  ? this.parent()
                  : this.data[name];
      }
      /**
       * Set an item of data.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set(name, val) {
          this.data[name] = val;
      }
      /**
       * Get an array listing which data keys are present in this feature.
       */
      tags() {
          return Object.keys(this.data);
      }
      /**
       * Get the unique ID of this feature.
       */
      id() {
          return this.uniqueId;
      }
      /**
       * Get this feature's parent feature, or undefined if none.
       */
      parent() {
          return this.parentHandle;
      }
      /**
       * Get an array of child features, or undefined if none.
       */
      children() {
          return this.get('subfeatures');
      }
      toJSON() {
          const d = { ...this.data, uniqueId: this.id() };
          const p = this.parent();
          if (p) {
              d.parentId = p.id();
          }
          const c = this.children();
          if (c) {
              d.subfeatures = c.map(child => child.toJSON());
          }
          return d;
      }
      static fromJSON(json) {
          return new SimpleFeature({ ...json });
      }
  }
  var _default$2 = simpleFeature.default = SimpleFeature;

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
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
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
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
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

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get() {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get.bind();
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(arguments.length < 3 ? target : receiver);
        }

        return desc.value;
      };
    }

    return _get.apply(this, arguments);
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
      Object.defineProperty(_assertThisInitialized(_this), 'reason', {
        value: undefined,
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
      value: function abort(reason) {
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

        var signalReason = reason;

        if (signalReason === undefined) {
          if (typeof document === 'undefined') {
            signalReason = new Error('This operation was aborted');
            signalReason.name = 'AbortError';
          } else {
            try {
              signalReason = new DOMException('signal is aborted without reason');
            } catch (err) {
              // IE 11 does not support calling the DOMException constructor, use a
              // regular error object on it instead.
              signalReason = new Error('This operation was aborted');
              signalReason.name = 'AbortError';
            }
          }
        }

        this.signal.reason = signalReason;
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

  // vendored from quick-lru@6.1.1, didn't like being compiled as a 'pure-esm' nodejs dependency
  // the license is reproduced below https://github.com/sindresorhus/quick-lru/blob/main/license
  // MIT License
  Object.defineProperty(QuickLRU$1, "__esModule", { value: true });
  // Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
  // Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  // The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  class QuickLRU extends Map {
      constructor(options = {}) {
          super();
          if (!(options.maxSize && options.maxSize > 0)) {
              throw new TypeError('`maxSize` must be a number greater than 0');
          }
          if (typeof options.maxAge === 'number' && options.maxAge === 0) {
              throw new TypeError('`maxAge` must be a number greater than 0');
          }
          // TODO: Use private class fields when ESLint supports them.
          this.maxSize = options.maxSize;
          this.maxAge = options.maxAge || Number.POSITIVE_INFINITY;
          this.onEviction = options.onEviction;
          this.cache = new Map();
          this.oldCache = new Map();
          this._size = 0;
      }
      // TODO: Use private class methods when targeting Node.js 16.
      _emitEvictions(cache) {
          if (typeof this.onEviction !== 'function') {
              return;
          }
          for (const [key, item] of cache) {
              this.onEviction(key, item.value);
          }
      }
      _deleteIfExpired(key, item) {
          if (typeof item.expiry === 'number' && item.expiry <= Date.now()) {
              if (typeof this.onEviction === 'function') {
                  this.onEviction(key, item.value);
              }
              return this.delete(key);
          }
          return false;
      }
      _getOrDeleteIfExpired(key, item) {
          const deleted = this._deleteIfExpired(key, item);
          if (deleted === false) {
              return item.value;
          }
      }
      _getItemValue(key, item) {
          return item.expiry ? this._getOrDeleteIfExpired(key, item) : item.value;
      }
      _peek(key, cache) {
          const item = cache.get(key);
          return this._getItemValue(key, item);
      }
      _set(key, value) {
          this.cache.set(key, value);
          this._size++;
          if (this._size >= this.maxSize) {
              this._size = 0;
              this._emitEvictions(this.oldCache);
              this.oldCache = this.cache;
              this.cache = new Map();
          }
      }
      _moveToRecent(key, item) {
          this.oldCache.delete(key);
          this._set(key, item);
      }
      *_entriesAscending() {
          for (const item of this.oldCache) {
              const [key, value] = item;
              if (!this.cache.has(key)) {
                  const deleted = this._deleteIfExpired(key, value);
                  if (deleted === false) {
                      yield item;
                  }
              }
          }
          for (const item of this.cache) {
              const [key, value] = item;
              const deleted = this._deleteIfExpired(key, value);
              if (deleted === false) {
                  yield item;
              }
          }
      }
      get(key) {
          if (this.cache.has(key)) {
              const item = this.cache.get(key);
              return this._getItemValue(key, item);
          }
          if (this.oldCache.has(key)) {
              const item = this.oldCache.get(key);
              if (this._deleteIfExpired(key, item) === false) {
                  this._moveToRecent(key, item);
                  return item.value;
              }
          }
      }
      set(key, value, { maxAge = this.maxAge } = {}) {
          const expiry = typeof maxAge === 'number' && maxAge !== Number.POSITIVE_INFINITY
              ? Date.now() + maxAge
              : undefined;
          if (this.cache.has(key)) {
              this.cache.set(key, {
                  value,
                  expiry,
              });
          }
          else {
              this._set(key, { value, expiry });
          }
      }
      has(key) {
          if (this.cache.has(key)) {
              return !this._deleteIfExpired(key, this.cache.get(key));
          }
          if (this.oldCache.has(key)) {
              return !this._deleteIfExpired(key, this.oldCache.get(key));
          }
          return false;
      }
      peek(key) {
          if (this.cache.has(key)) {
              return this._peek(key, this.cache);
          }
          if (this.oldCache.has(key)) {
              return this._peek(key, this.oldCache);
          }
      }
      delete(key) {
          const deleted = this.cache.delete(key);
          if (deleted) {
              this._size--;
          }
          return this.oldCache.delete(key) || deleted;
      }
      clear() {
          this.cache.clear();
          this.oldCache.clear();
          this._size = 0;
      }
      resize(newSize) {
          if (!(newSize && newSize > 0)) {
              throw new TypeError('`maxSize` must be a number greater than 0');
          }
          const items = [...this._entriesAscending()];
          const removeCount = items.length - newSize;
          if (removeCount < 0) {
              this.cache = new Map(items);
              this.oldCache = new Map();
              this._size = items.length;
          }
          else {
              if (removeCount > 0) {
                  this._emitEvictions(items.slice(0, removeCount));
              }
              this.oldCache = new Map(items.slice(removeCount));
              this.cache = new Map();
              this._size = 0;
          }
          this.maxSize = newSize;
      }
      *keys() {
          for (const [key] of this) {
              yield key;
          }
      }
      *values() {
          for (const [, value] of this) {
              yield value;
          }
      }
      *[Symbol.iterator]() {
          for (const item of this.cache) {
              const [key, value] = item;
              const deleted = this._deleteIfExpired(key, value);
              if (deleted === false) {
                  yield [key, value.value];
              }
          }
          for (const item of this.oldCache) {
              const [key, value] = item;
              if (!this.cache.has(key)) {
                  const deleted = this._deleteIfExpired(key, value);
                  if (deleted === false) {
                      yield [key, value.value];
                  }
              }
          }
      }
      *entriesDescending() {
          let items = [...this.cache];
          for (let i = items.length - 1; i >= 0; --i) {
              const item = items[i];
              const [key, value] = item;
              const deleted = this._deleteIfExpired(key, value);
              if (deleted === false) {
                  yield [key, value.value];
              }
          }
          items = [...this.oldCache];
          for (let i = items.length - 1; i >= 0; --i) {
              const item = items[i];
              const [key, value] = item;
              if (!this.cache.has(key)) {
                  const deleted = this._deleteIfExpired(key, value);
                  if (deleted === false) {
                      yield [key, value.value];
                  }
              }
          }
      }
      *entriesAscending() {
          for (const [key, value] of this._entriesAscending()) {
              yield [key, value.value];
          }
      }
      get size() {
          if (!this._size) {
              return this.oldCache.size;
          }
          let oldCacheSize = 0;
          for (const key of this.oldCache.keys()) {
              if (!this.cache.has(key)) {
                  oldCacheSize++;
              }
          }
          return Math.min(this._size + oldCacheSize, this.maxSize);
      }
      entries() {
          return this.entriesAscending();
      }
      forEach(callbackFunction, thisArgument = this) {
          for (const [key, value] of this.entriesAscending()) {
              callbackFunction.call(thisArgument, value, key, this);
          }
      }
      get [Symbol.toStringTag]() {
          return JSON.stringify([...this.entriesAscending()]);
      }
  }
  var _default = QuickLRU$1.default = QuickLRU;

  var nargs = /\{([0-9a-zA-Z_]+)\}/g;

  var stringTemplate = template;

  function template(string) {
      var args;

      if (arguments.length === 2 && typeof arguments[1] === "object") {
          args = arguments[1];
      } else {
          args = new Array(arguments.length - 1);
          for (var i = 1; i < arguments.length; ++i) {
              args[i - 1] = arguments[i];
          }
      }

      if (!args || !args.hasOwnProperty) {
          args = {};
      }

      return string.replace(nargs, function replaceArg(match, i, index) {
          var result;

          if (string[index - 1] === "{" &&
              string[index + match.length] === "}") {
              return i
          } else {
              result = args.hasOwnProperty(i) ? args[i] : null;
              if (result === null || result === undefined) {
                  return ""
              }

              return result
          }
      })
  }

  const configSchema$1 = configuration.ConfigurationSchema('MyGeneV3Adapter', {
      baseUrl: {
          type: 'string',
          defaultValue: '',
      },
  }, { explicitlyTyped: true });
  // translate thickStart/thickEnd to utr's
  // adapted from BigBedAdapter for ucsc thickStart/thickEnd
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function cdsStartEndProcessor(feature) {
      // split the blocks into UTR, CDS, and exons
      const { thickStart, thickEnd, refName, strand, subfeatures } = feature;
      if (!thickStart && !thickEnd) {
          return feature;
      }
      const blocks = subfeatures
          ? subfeatures.sort((a, b) => a.start - b.start)
          : [];
      const newChildren = blocks
          .map(({ start, end }) => {
          if (thickStart >= end) {
              // left-side UTR
              const prime = strand > 0 ? 'five' : 'three';
              return {
                  type: `${prime}_prime_UTR`,
                  start,
                  end,
              };
          }
          else if (thickStart > start && thickStart < end && thickEnd >= end) {
              // UTR | CDS
              const prime = strand > 0 ? 'five' : 'three';
              return [
                  {
                      type: `${prime}_prime_UTR`,
                      start,
                      end: thickStart,
                  },
                  {
                      type: 'CDS',
                      start: thickStart,
                      end,
                      refName,
                  },
              ];
          }
          else if (thickStart <= start && thickEnd >= end) {
              // CDS
              return {
                  type: 'CDS',
                  start,
                  end,
              };
          }
          else if (thickStart > start && thickStart < end && thickEnd < end) {
              // UTR | CDS | UTR
              const leftPrime = strand > 0 ? 'five' : 'three';
              const rightPrime = strand > 0 ? 'three' : 'five';
              return [
                  {
                      type: `${leftPrime}_prime_UTR`,
                      start,
                      end: thickStart,
                  },
                  {
                      type: `CDS`,
                      start: thickStart,
                      end: thickEnd,
                  },
                  {
                      type: `${rightPrime}_prime_UTR`,
                      start: thickEnd,
                      end,
                  },
              ];
          }
          else if (thickStart <= start && thickEnd > start && thickEnd < end) {
              // CDS | UTR
              const prime = strand > 0 ? 'three' : 'five';
              return [
                  {
                      type: `CDS`,
                      start,
                      end: thickEnd,
                  },
                  {
                      type: `${prime}_prime_UTR`,
                      start: thickEnd,
                      end,
                  },
              ];
          }
          else if (thickEnd <= start) {
              // right-side UTR
              const prime = strand > 0 ? 'three' : 'five';
              return {
                  type: `${prime}_prime_UTR`,
                  start,
                  end,
              };
          }
          return undefined;
      })
          .filter(f => !!f)
          .flat();
      return {
          ...feature,
          subfeatures: newChildren.map(r => ({ ...r, refName })),
          type: 'mRNA',
      };
  }
  let AdapterClass$1 = class AdapterClass extends BaseAdapter.BaseFeatureDataAdapter {
      featureCache = new _default$1({
          cache: new _default({ maxSize: 100 }),
          fill: args => this.readChunk(args),
      });
      async getRefNames(_ = {}) {
          return [];
      }
      getFeatures(query, opts = {}) {
          const baseUrl = configuration.readConfObject(this.config, 'baseUrl');
          return rxjs.ObservableCreate(async (observer) => {
              const chunkSize = 100000;
              const s = query.start - (query.start % chunkSize);
              const e = query.end + (chunkSize - (query.end % chunkSize));
              const chunks = [];
              for (let start = s; start < e; start += chunkSize) {
                  chunks.push({
                      refName: query.refName,
                      start,
                      end: start + chunkSize,
                      assemblyName: query.assemblyName,
                      baseUrl,
                  });
              }
              await Promise.all(chunks.map(async (chunk) => {
                  const key = `${chunk.assemblyName},${chunk.refName},${chunk.start},${chunk.end}`;
                  const signal = opts.signal;
                  const features = await this.featureCache.get(key, chunk, signal);
                  features.forEach(feature => {
                      if (feature &&
                          !(feature.get('start') > query.end) &&
                          feature.get('end') >= query.start) {
                          observer.next(feature);
                      }
                  });
              }));
              observer.complete();
          }, opts.signal);
      }
      async readChunk(chunk) {
          const { start, end, refName, baseUrl } = chunk;
          const ref = refName.startsWith('chr') ? refName : `chr${refName}`;
          const url = stringTemplate(baseUrl, { ref, start, end });
          const hg19 = Number(baseUrl.includes('hg19'));
          const response = await fetch(url);
          if (!response.ok) {
              throw new Error(`Failed to fetch ${response.status} ${response.statusText}`);
          }
          const featureData = await response.json();
          // @ts-expect-error
          return featureData.hits.map(feature => {
              const { genomic_pos, genomic_pos_hg19, exons, exons_hg19, _id, _score, _license, ...rest } = feature;
              let genomicPos = [genomic_pos, genomic_pos_hg19][hg19];
              if (Array.isArray(genomicPos)) {
                  genomicPos = genomicPos.find(pos => {
                      return refName.replace('chr', '') === pos.chr;
                  });
              }
              let transcriptData = [exons, exons_hg19][hg19];
              if (!transcriptData) {
                  return new _default$2({
                      id: _id,
                      data: {
                          ...rest,
                          refName: genomicPos.chr,
                          start: genomicPos.start,
                          end: genomicPos.end,
                          strand: genomicPos.strand,
                          name: feature.symbol,
                          description: feature.name,
                          type: 'gene',
                      },
                  });
              }
              // this is a weird hack because mygene.info returns features on other
              // chromosomes that are close homologues, and the homologues aren't even
              // clear on whether they are located on the chromosome you are querying
              // on because it returns a set of locations of all the other homologues,
              // so this tries to filter those out
              if (feature.map_location &&
                  !feature.map_location.match(`^${genomicPos.chr}(p|q)`)) {
                  return null;
              }
              if (transcriptData) {
                  // @ts-expect-error
                  transcriptData = transcriptData.filter(transcript => {
                      return feature.map_location?.startsWith(transcript.chr);
                  });
              }
              if (transcriptData && transcriptData.length) {
                  const transcripts = transcriptData
                      // @ts-expect-error
                      .map((transcript, index) => {
                      return {
                          start: transcript.txstart,
                          end: transcript.txend,
                          name: transcript.transcript,
                          strand: transcript.strand,
                          thickStart: transcript.cdsstart,
                          thickEnd: transcript.cdsend,
                          refName: genomicPos.chr,
                          // @ts-expect-error
                          subfeatures: transcript.position.map(pos => ({
                              start: pos[0],
                              end: pos[1],
                              strand: transcript.strand,
                              type: 'exon',
                          })),
                      };
                  })
                      // @ts-expect-error
                      .filter(t => {
                      // another weird filter to avoid transcripts that are outside the
                      // range of the genomic pos. the +/-1000 added for ATAD3C, SKI2, MEGF6
                      return (t.start >= genomicPos.start - 2000 &&
                          t.end <= genomicPos.end + 2000);
                  })
                      // @ts-expect-error
                      .map(feat => {
                      return feature.type_of_gene === 'protein-coding'
                          ? cdsStartEndProcessor(feat)
                          : feat;
                  });
                  // maybe worth reviewing but SvgFeatureRenderer has very bad behavior
                  // if subfeatures go outside of the bounds of the parent feature so
                  // this is needed
                  const [min, max] = [
                      // @ts-expect-error
                      Math.min(...[genomicPos.start, ...transcripts.map(t => t.start)]),
                      // @ts-expect-error
                      Math.max(...[genomicPos.end, ...transcripts.map(t => t.end)]),
                  ];
                  return new _default$2({
                      id: _id,
                      data: {
                          ...rest,
                          refName: genomicPos.chr,
                          start: min,
                          end: max,
                          strand: genomicPos.strand,
                          name: feature.symbol,
                          description: feature.name,
                          type: 'gene',
                          subfeatures: transcripts,
                      },
                  });
              }
              return null;
          });
      }
      freeResources( /* { region } */) { }
  };
  function MyGeneAdapterF(pluginManager) {
      pluginManager.addAdapterType(() => {
          return new AdapterType({
              name: 'MyGeneV3Adapter',
              configSchema: configSchema$1,
              AdapterClass: AdapterClass$1,
          });
      });
  }

  async function myfetch(url) {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Failed to fetch ${response.status} ${response.statusText}`);
      }
      return response.json();
  }
  function processFeat(f, refName) {
      const start = +f._id.match(/chr.*:g.([0-9]+)/)[1];
      const feature = new _default$2({
          uniqueId: f._id,
          start: start - 1,
          end: start,
          name: f._id,
          refName,
      });
      function process(str, data, plus) {
          if (!data)
              return;
          if (str.match(/snpeff/)) {
              if (Array.isArray(data.ann)) {
                  data.ann.forEach((fm, i) => {
                      process(str + '_' + i, fm, i);
                  });
                  return;
              }
              else if (data.ann) {
                  delete data.ann.cds;
                  delete data.ann.cdna;
                  delete data.ann.protein;
              }
              else {
                  delete data.cds; // sub-sub-objects, not super informative
                  delete data.cdna;
                  delete data.protein;
              }
          }
          if (str.match(/cadd/)) {
              if (data.encode) {
                  process(str + '_encode', data.encode);
              }
              delete data.encode;
          }
          if (str.match(/clinvar/)) {
              process(str + '_hgvs', data.hgvs);
              delete data.hgvs;
              if (Array.isArray(data.rcv))
                  data.rcv.forEach((elt, i) => {
                      process(str + '_rcv' + i, elt);
                  });
              else
                  process(str + '_rcv', data.rcv);
              delete data.rcv;
          }
          if (str.match(/grasp/)) {
              if (Array.isArray(data.publication)) {
                  data.publication.forEach((fm, iter) => {
                      process(str + '_publication' + iter, fm);
                  });
              }
              delete data.publication;
          }
          // @ts-ignore
          feature.data[str + '_attrs' + (plus || '')] = {};
          const valkeys = Object.keys(data).filter(key => {
              return typeof data[key] !== 'object';
          });
          const objkeys = Object.keys(data).filter(key => {
              return typeof data[key] === 'object' && key !== 'gene';
          });
          valkeys.forEach(key => {
              // @ts-ignore
              feature.data[str + '_attrs' + (plus || '')][key] = data[key];
          });
          objkeys.forEach(key => {
              // @ts-ignore
              feature.data[str + '_' + key + (plus || '')] = data[key];
          });
      }
      process('cadd', f.cadd);
      process('cosmic', f.cosmic);
      process('dbnsfp', f.dbnsfp);
      process('dbsnp', f.dbsnp);
      process('evs', f.evs);
      process('exac', f.exac);
      process('mutdb', f.mutdb);
      process('wellderly', f.wellderly);
      process('snpedia', f.snpedia);
      process('snpeff', f.snpeff);
      process('vcf', f.vcf);
      process('grasp', f.grasp);
      process('gwassnps', f.gwassnps);
      process('docm', f.docm);
      process('emv', f.emv);
      process('clinvar', f.clinvar);
      process('uniprot', f.uniprot);
      return feature;
  }
  const configSchema = configuration.ConfigurationSchema('MyVariantV1Adapter', {
      baseUrl: {
          type: 'string',
          defaultValue: '',
      },
      query: {
          type: 'string',
          defaultValue: '',
      },
  }, { explicitlyTyped: true });
  class AdapterClass extends BaseAdapter.BaseFeatureDataAdapter {
      async getRefNames(_ = {}) {
          return [];
      }
      getFeatures(query, opts = {}) {
          const baseUrl = this.getConf('baseUrl');
          const queryQ = this.getConf('query');
          const { start: qs, end: qe, refName } = query;
          return rxjs.ObservableCreate(async (observer) => {
              const features = (await this.readChunk({
                  start: qs,
                  end: qe,
                  refName,
                  baseUrl,
                  query: queryQ,
              }));
              // console.log(JSON.stringify(features))
              features.forEach(f => observer.next(f));
              observer.complete();
          }, opts.signal);
      }
      async readChunk(chunk) {
          const { start, end, refName, baseUrl, query } = chunk;
          const ref = refName.startsWith('chr') ? refName : `chr${refName}`;
          const newBase = stringTemplate(baseUrl + query, { ref, start, end });
          const featureData = await myfetch(newBase);
          const { hits = [] } = featureData;
          const returnFeatures = [];
          const iter = async (scrollId, scroll) => {
              const scrollurl = stringTemplate(baseUrl + 'query?scroll_id={scrollId}&size={size}&from={from}', { scrollId: scrollId, size: 1000, from: scroll });
              const featureResults = await myfetch(scrollurl);
              const { hits = [] } = featureResults;
              returnFeatures.push(...hits.map(f => processFeat(f, refName)));
              if (hits.length >= 1000) {
                  await iter(scrollId, scroll + 1000);
              }
          };
          if (hits.length >= 1000) {
              // setup scroll query
              const fetchAllResult = await myfetch(newBase + '&fetch_all=true');
              await iter(fetchAllResult._scroll_id, 0);
          }
          else if (hits) {
              returnFeatures.push(...hits.map(f => processFeat(f, refName)));
          }
          return returnFeatures;
      }
      freeResources( /* { region } */) { }
  }
  function MyVariantAdapterF(pluginManager) {
      pluginManager.addAdapterType(() => {
          return new AdapterType({
              name: 'MyVariantV1Adapter',
              configSchema,
              AdapterClass,
          });
      });
  }

  class index extends Plugin {
      name = 'Biothings';
      version = version;
      install(pluginManager) {
          MyGeneAdapterF(pluginManager);
          MyVariantAdapterF(pluginManager);
      }
  }

  exports.default = index;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=jbrowse-plugin-biothings.umd.development.js.map
