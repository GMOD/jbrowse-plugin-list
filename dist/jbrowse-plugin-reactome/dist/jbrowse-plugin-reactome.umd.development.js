(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@jbrowse/core/Plugin'), require('@jbrowse/core/pluggableElementTypes/ViewType'), require('@jbrowse/core/util'), require('react'), require('mobx-react'), require('@material-ui/core'), require('@material-ui/lab'), require('@material-ui/core/utils'), require('mobx-state-tree')) :
  typeof define === 'function' && define.amd ? define(['exports', '@jbrowse/core/Plugin', '@jbrowse/core/pluggableElementTypes/ViewType', '@jbrowse/core/util', 'react', 'mobx-react', '@material-ui/core', '@material-ui/lab', '@material-ui/core/utils', 'mobx-state-tree'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.JBrowsePluginReactome = {}, global.JBrowseExports["@jbrowse/core/Plugin"], global.JBrowseExports["@jbrowse/core/pluggableElementTypes/ViewType"], global.JBrowseExports["@jbrowse/core/util"], global.JBrowseExports.react, global.JBrowseExports["mobx-react"], global.JBrowseExports["@material-ui/core"], global.JBrowseExports["@material-ui/lab"], global.JBrowseExports["@material-ui/core/utils"], global.JBrowseExports["mobx-state-tree"]));
})(this, (function (exports, Plugin, ViewType, util, React$2, mobxReact, core, lab, require$$0, mobxStateTree) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Plugin__default = /*#__PURE__*/_interopDefaultLegacy(Plugin);
  var ViewType__default = /*#__PURE__*/_interopDefaultLegacy(ViewType);
  var React__default = /*#__PURE__*/_interopDefaultLegacy(React$2);
  var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

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

    Object.defineProperty(subClass, "prototype", {
      value: Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          writable: true,
          configurable: true
        }
      }),
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

  function _assertThisInitialized$1(self) {
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

    return _assertThisInitialized$1(self);
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

  var version = "1.0.1";

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
  }(runtime));

  var _regeneratorRuntime = runtime.exports;

  /*! load-script2. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

  var loadScript2 = function loadScript2 (src, attrs, parentNode) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = src;

      for (const [k, v] of Object.entries(attrs || {})) {
        script.setAttribute(k, v);
      }

      script.onload = () => {
        script.onerror = script.onload = null;
        resolve(script);
      };

      script.onerror = () => {
        script.onerror = script.onload = null;
        reject(new Error(`Failed to load ${src}`));
      };

      const node = parentNode || document.head || document.getElementsByTagName('head')[0];
      node.appendChild(script);
    })
  };

  var Search = {};

  function _interopRequireDefault$2(obj) {
    return obj && obj.__esModule ? obj : {
      "default": obj
    };
  }

  var interopRequireDefault = _interopRequireDefault$2;

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

  function _interopRequireWildcard$2(obj) {
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

  var interopRequireWildcard = _interopRequireWildcard$2;

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

  var _interopRequireDefault$1 = interopRequireDefault;

  var _interopRequireWildcard$1 = interopRequireWildcard;

  Object.defineProperty(Search, "__esModule", {
    value: true
  });
  var default_1$1 = Search.default = void 0;

  var React$1 = _interopRequireWildcard$1(React__default["default"]);

  var _createSvgIcon$1 = _interopRequireDefault$1(createSvgIcon);

  var _default$1 = (0, _createSvgIcon$1.default)( /*#__PURE__*/React$1.createElement("path", {
    d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
  }), 'Search');

  default_1$1 = Search.default = _default$1;

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

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var safeIsNaN = Number.isNaN ||
      function ponyfill(value) {
          return typeof value === 'number' && value !== value;
      };
  function isEqual(first, second) {
      if (first === second) {
          return true;
      }
      if (safeIsNaN(first) && safeIsNaN(second)) {
          return true;
      }
      return false;
  }
  function areInputsEqual(newInputs, lastInputs) {
      if (newInputs.length !== lastInputs.length) {
          return false;
      }
      for (var i = 0; i < newInputs.length; i++) {
          if (!isEqual(newInputs[i], lastInputs[i])) {
              return false;
          }
      }
      return true;
  }

  function memoizeOne(resultFn, isEqual) {
      if (isEqual === void 0) { isEqual = areInputsEqual; }
      var lastThis;
      var lastArgs = [];
      var lastResult;
      var calledOnce = false;
      function memoized() {
          var newArgs = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              newArgs[_i] = arguments[_i];
          }
          if (calledOnce && lastThis === this && isEqual(newArgs, lastArgs)) {
              return lastResult;
          }
          lastResult = resultFn.apply(this, newArgs);
          calledOnce = true;
          lastThis = this;
          lastArgs = newArgs;
          return lastResult;
      }
      return memoized;
  }

  // Animation frame based implementation of setTimeout.
  // Inspired by Joe Lambert, https://gist.github.com/joelambert/1002116#file-requesttimeout-js
  var hasNativePerformanceNow = typeof performance === 'object' && typeof performance.now === 'function';
  var now = hasNativePerformanceNow ? function () {
    return performance.now();
  } : function () {
    return Date.now();
  };
  function cancelTimeout(timeoutID) {
    cancelAnimationFrame(timeoutID.id);
  }
  function requestTimeout(callback, delay) {
    var start = now();

    function tick() {
      if (now() - start >= delay) {
        callback.call(null);
      } else {
        timeoutID.id = requestAnimationFrame(tick);
      }
    }

    var timeoutID = {
      id: requestAnimationFrame(tick)
    };
    return timeoutID;
  }
  var cachedRTLResult = null; // TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
  // Chrome does not seem to adhere; its scrollLeft values are positive (measured relative to the left).
  // Safari's elastic bounce makes detecting this even more complicated wrt potential false positives.
  // The safest way to check this is to intentionally set a negative offset,
  // and then verify that the subsequent "scroll" event matches the negative offset.
  // If it does not match, then we can assume a non-standard RTL scroll implementation.

  function getRTLOffsetType(recalculate) {
    if (recalculate === void 0) {
      recalculate = false;
    }

    if (cachedRTLResult === null || recalculate) {
      var outerDiv = document.createElement('div');
      var outerStyle = outerDiv.style;
      outerStyle.width = '50px';
      outerStyle.height = '50px';
      outerStyle.overflow = 'scroll';
      outerStyle.direction = 'rtl';
      var innerDiv = document.createElement('div');
      var innerStyle = innerDiv.style;
      innerStyle.width = '100px';
      innerStyle.height = '100px';
      outerDiv.appendChild(innerDiv);
      document.body.appendChild(outerDiv);

      if (outerDiv.scrollLeft > 0) {
        cachedRTLResult = 'positive-descending';
      } else {
        outerDiv.scrollLeft = 1;

        if (outerDiv.scrollLeft === 0) {
          cachedRTLResult = 'negative';
        } else {
          cachedRTLResult = 'positive-ascending';
        }
      }

      document.body.removeChild(outerDiv);
      return cachedRTLResult;
    }

    return cachedRTLResult;
  }

  var IS_SCROLLING_DEBOUNCE_INTERVAL$1 = 150;

  var defaultItemKey$1 = function defaultItemKey(index, data) {
    return index;
  }; // In DEV mode, this Set helps us only log a warning once per component instance.
  // This avoids spamming the console every time a render happens.


  var devWarningsDirection = null;
  var devWarningsTagName$1 = null;

  {
    if (typeof window !== 'undefined' && typeof window.WeakSet !== 'undefined') {
      devWarningsDirection =
      /*#__PURE__*/
      new WeakSet();
      devWarningsTagName$1 =
      /*#__PURE__*/
      new WeakSet();
    }
  }

  function createListComponent(_ref) {
    var _class, _temp;

    var getItemOffset = _ref.getItemOffset,
        getEstimatedTotalSize = _ref.getEstimatedTotalSize,
        getItemSize = _ref.getItemSize,
        getOffsetForIndexAndAlignment = _ref.getOffsetForIndexAndAlignment,
        getStartIndexForOffset = _ref.getStartIndexForOffset,
        getStopIndexForStartIndex = _ref.getStopIndexForStartIndex,
        initInstanceProps = _ref.initInstanceProps,
        shouldResetStyleCacheOnItemSizeChange = _ref.shouldResetStyleCacheOnItemSizeChange,
        validateProps = _ref.validateProps;
    return _temp = _class =
    /*#__PURE__*/
    function (_PureComponent) {
      _inheritsLoose(List, _PureComponent);

      // Always use explicit constructor for React components.
      // It produces less code after transpilation. (#26)
      // eslint-disable-next-line no-useless-constructor
      function List(props) {
        var _this;

        _this = _PureComponent.call(this, props) || this;
        _this._instanceProps = initInstanceProps(_this.props, _assertThisInitialized(_assertThisInitialized(_this)));
        _this._outerRef = void 0;
        _this._resetIsScrollingTimeoutId = null;
        _this.state = {
          instance: _assertThisInitialized(_assertThisInitialized(_this)),
          isScrolling: false,
          scrollDirection: 'forward',
          scrollOffset: typeof _this.props.initialScrollOffset === 'number' ? _this.props.initialScrollOffset : 0,
          scrollUpdateWasRequested: false
        };
        _this._callOnItemsRendered = void 0;
        _this._callOnItemsRendered = memoizeOne(function (overscanStartIndex, overscanStopIndex, visibleStartIndex, visibleStopIndex) {
          return _this.props.onItemsRendered({
            overscanStartIndex: overscanStartIndex,
            overscanStopIndex: overscanStopIndex,
            visibleStartIndex: visibleStartIndex,
            visibleStopIndex: visibleStopIndex
          });
        });
        _this._callOnScroll = void 0;
        _this._callOnScroll = memoizeOne(function (scrollDirection, scrollOffset, scrollUpdateWasRequested) {
          return _this.props.onScroll({
            scrollDirection: scrollDirection,
            scrollOffset: scrollOffset,
            scrollUpdateWasRequested: scrollUpdateWasRequested
          });
        });
        _this._getItemStyle = void 0;

        _this._getItemStyle = function (index) {
          var _this$props = _this.props,
              direction = _this$props.direction,
              itemSize = _this$props.itemSize,
              layout = _this$props.layout;

          var itemStyleCache = _this._getItemStyleCache(shouldResetStyleCacheOnItemSizeChange && itemSize, shouldResetStyleCacheOnItemSizeChange && layout, shouldResetStyleCacheOnItemSizeChange && direction);

          var style;

          if (itemStyleCache.hasOwnProperty(index)) {
            style = itemStyleCache[index];
          } else {
            var _offset = getItemOffset(_this.props, index, _this._instanceProps);

            var size = getItemSize(_this.props, index, _this._instanceProps); // TODO Deprecate direction "horizontal"

            var isHorizontal = direction === 'horizontal' || layout === 'horizontal';
            var isRtl = direction === 'rtl';
            var offsetHorizontal = isHorizontal ? _offset : 0;
            itemStyleCache[index] = style = {
              position: 'absolute',
              left: isRtl ? undefined : offsetHorizontal,
              right: isRtl ? offsetHorizontal : undefined,
              top: !isHorizontal ? _offset : 0,
              height: !isHorizontal ? size : '100%',
              width: isHorizontal ? size : '100%'
            };
          }

          return style;
        };

        _this._getItemStyleCache = void 0;
        _this._getItemStyleCache = memoizeOne(function (_, __, ___) {
          return {};
        });

        _this._onScrollHorizontal = function (event) {
          var _event$currentTarget = event.currentTarget,
              clientWidth = _event$currentTarget.clientWidth,
              scrollLeft = _event$currentTarget.scrollLeft,
              scrollWidth = _event$currentTarget.scrollWidth;

          _this.setState(function (prevState) {
            if (prevState.scrollOffset === scrollLeft) {
              // Scroll position may have been updated by cDM/cDU,
              // In which case we don't need to trigger another render,
              // And we don't want to update state.isScrolling.
              return null;
            }

            var direction = _this.props.direction;
            var scrollOffset = scrollLeft;

            if (direction === 'rtl') {
              // TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
              // This is not the case for all browsers though (e.g. Chrome reports values as positive, measured relative to the left).
              // It's also easier for this component if we convert offsets to the same format as they would be in for ltr.
              // So the simplest solution is to determine which browser behavior we're dealing with, and convert based on it.
              switch (getRTLOffsetType()) {
                case 'negative':
                  scrollOffset = -scrollLeft;
                  break;

                case 'positive-descending':
                  scrollOffset = scrollWidth - clientWidth - scrollLeft;
                  break;
              }
            } // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.


            scrollOffset = Math.max(0, Math.min(scrollOffset, scrollWidth - clientWidth));
            return {
              isScrolling: true,
              scrollDirection: prevState.scrollOffset < scrollLeft ? 'forward' : 'backward',
              scrollOffset: scrollOffset,
              scrollUpdateWasRequested: false
            };
          }, _this._resetIsScrollingDebounced);
        };

        _this._onScrollVertical = function (event) {
          var _event$currentTarget2 = event.currentTarget,
              clientHeight = _event$currentTarget2.clientHeight,
              scrollHeight = _event$currentTarget2.scrollHeight,
              scrollTop = _event$currentTarget2.scrollTop;

          _this.setState(function (prevState) {
            if (prevState.scrollOffset === scrollTop) {
              // Scroll position may have been updated by cDM/cDU,
              // In which case we don't need to trigger another render,
              // And we don't want to update state.isScrolling.
              return null;
            } // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.


            var scrollOffset = Math.max(0, Math.min(scrollTop, scrollHeight - clientHeight));
            return {
              isScrolling: true,
              scrollDirection: prevState.scrollOffset < scrollOffset ? 'forward' : 'backward',
              scrollOffset: scrollOffset,
              scrollUpdateWasRequested: false
            };
          }, _this._resetIsScrollingDebounced);
        };

        _this._outerRefSetter = function (ref) {
          var outerRef = _this.props.outerRef;
          _this._outerRef = ref;

          if (typeof outerRef === 'function') {
            outerRef(ref);
          } else if (outerRef != null && typeof outerRef === 'object' && outerRef.hasOwnProperty('current')) {
            outerRef.current = ref;
          }
        };

        _this._resetIsScrollingDebounced = function () {
          if (_this._resetIsScrollingTimeoutId !== null) {
            cancelTimeout(_this._resetIsScrollingTimeoutId);
          }

          _this._resetIsScrollingTimeoutId = requestTimeout(_this._resetIsScrolling, IS_SCROLLING_DEBOUNCE_INTERVAL$1);
        };

        _this._resetIsScrolling = function () {
          _this._resetIsScrollingTimeoutId = null;

          _this.setState({
            isScrolling: false
          }, function () {
            // Clear style cache after state update has been committed.
            // This way we don't break pure sCU for items that don't use isScrolling param.
            _this._getItemStyleCache(-1, null);
          });
        };

        return _this;
      }

      List.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, prevState) {
        validateSharedProps$1(nextProps, prevState);
        validateProps(nextProps);
        return null;
      };

      var _proto = List.prototype;

      _proto.scrollTo = function scrollTo(scrollOffset) {
        scrollOffset = Math.max(0, scrollOffset);
        this.setState(function (prevState) {
          if (prevState.scrollOffset === scrollOffset) {
            return null;
          }

          return {
            scrollDirection: prevState.scrollOffset < scrollOffset ? 'forward' : 'backward',
            scrollOffset: scrollOffset,
            scrollUpdateWasRequested: true
          };
        }, this._resetIsScrollingDebounced);
      };

      _proto.scrollToItem = function scrollToItem(index, align) {
        if (align === void 0) {
          align = 'auto';
        }

        var itemCount = this.props.itemCount;
        var scrollOffset = this.state.scrollOffset;
        index = Math.max(0, Math.min(index, itemCount - 1));
        this.scrollTo(getOffsetForIndexAndAlignment(this.props, index, align, scrollOffset, this._instanceProps));
      };

      _proto.componentDidMount = function componentDidMount() {
        var _this$props2 = this.props,
            direction = _this$props2.direction,
            initialScrollOffset = _this$props2.initialScrollOffset,
            layout = _this$props2.layout;

        if (typeof initialScrollOffset === 'number' && this._outerRef != null) {
          var outerRef = this._outerRef; // TODO Deprecate direction "horizontal"

          if (direction === 'horizontal' || layout === 'horizontal') {
            outerRef.scrollLeft = initialScrollOffset;
          } else {
            outerRef.scrollTop = initialScrollOffset;
          }
        }

        this._callPropsCallbacks();
      };

      _proto.componentDidUpdate = function componentDidUpdate() {
        var _this$props3 = this.props,
            direction = _this$props3.direction,
            layout = _this$props3.layout;
        var _this$state = this.state,
            scrollOffset = _this$state.scrollOffset,
            scrollUpdateWasRequested = _this$state.scrollUpdateWasRequested;

        if (scrollUpdateWasRequested && this._outerRef != null) {
          var outerRef = this._outerRef; // TODO Deprecate direction "horizontal"

          if (direction === 'horizontal' || layout === 'horizontal') {
            if (direction === 'rtl') {
              // TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
              // This is not the case for all browsers though (e.g. Chrome reports values as positive, measured relative to the left).
              // So we need to determine which browser behavior we're dealing with, and mimic it.
              switch (getRTLOffsetType()) {
                case 'negative':
                  outerRef.scrollLeft = -scrollOffset;
                  break;

                case 'positive-ascending':
                  outerRef.scrollLeft = scrollOffset;
                  break;

                default:
                  var clientWidth = outerRef.clientWidth,
                      scrollWidth = outerRef.scrollWidth;
                  outerRef.scrollLeft = scrollWidth - clientWidth - scrollOffset;
                  break;
              }
            } else {
              outerRef.scrollLeft = scrollOffset;
            }
          } else {
            outerRef.scrollTop = scrollOffset;
          }
        }

        this._callPropsCallbacks();
      };

      _proto.componentWillUnmount = function componentWillUnmount() {
        if (this._resetIsScrollingTimeoutId !== null) {
          cancelTimeout(this._resetIsScrollingTimeoutId);
        }
      };

      _proto.render = function render() {
        var _this$props4 = this.props,
            children = _this$props4.children,
            className = _this$props4.className,
            direction = _this$props4.direction,
            height = _this$props4.height,
            innerRef = _this$props4.innerRef,
            innerElementType = _this$props4.innerElementType,
            innerTagName = _this$props4.innerTagName,
            itemCount = _this$props4.itemCount,
            itemData = _this$props4.itemData,
            _this$props4$itemKey = _this$props4.itemKey,
            itemKey = _this$props4$itemKey === void 0 ? defaultItemKey$1 : _this$props4$itemKey,
            layout = _this$props4.layout,
            outerElementType = _this$props4.outerElementType,
            outerTagName = _this$props4.outerTagName,
            style = _this$props4.style,
            useIsScrolling = _this$props4.useIsScrolling,
            width = _this$props4.width;
        var isScrolling = this.state.isScrolling; // TODO Deprecate direction "horizontal"

        var isHorizontal = direction === 'horizontal' || layout === 'horizontal';
        var onScroll = isHorizontal ? this._onScrollHorizontal : this._onScrollVertical;

        var _this$_getRangeToRend = this._getRangeToRender(),
            startIndex = _this$_getRangeToRend[0],
            stopIndex = _this$_getRangeToRend[1];

        var items = [];

        if (itemCount > 0) {
          for (var _index = startIndex; _index <= stopIndex; _index++) {
            items.push(React$2.createElement(children, {
              data: itemData,
              key: itemKey(_index, itemData),
              index: _index,
              isScrolling: useIsScrolling ? isScrolling : undefined,
              style: this._getItemStyle(_index)
            }));
          }
        } // Read this value AFTER items have been created,
        // So their actual sizes (if variable) are taken into consideration.


        var estimatedTotalSize = getEstimatedTotalSize(this.props, this._instanceProps);
        return React$2.createElement(outerElementType || outerTagName || 'div', {
          className: className,
          onScroll: onScroll,
          ref: this._outerRefSetter,
          style: _extends({
            position: 'relative',
            height: height,
            width: width,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            willChange: 'transform',
            direction: direction
          }, style)
        }, React$2.createElement(innerElementType || innerTagName || 'div', {
          children: items,
          ref: innerRef,
          style: {
            height: isHorizontal ? '100%' : estimatedTotalSize,
            pointerEvents: isScrolling ? 'none' : undefined,
            width: isHorizontal ? estimatedTotalSize : '100%'
          }
        }));
      };

      _proto._callPropsCallbacks = function _callPropsCallbacks() {
        if (typeof this.props.onItemsRendered === 'function') {
          var itemCount = this.props.itemCount;

          if (itemCount > 0) {
            var _this$_getRangeToRend2 = this._getRangeToRender(),
                _overscanStartIndex = _this$_getRangeToRend2[0],
                _overscanStopIndex = _this$_getRangeToRend2[1],
                _visibleStartIndex = _this$_getRangeToRend2[2],
                _visibleStopIndex = _this$_getRangeToRend2[3];

            this._callOnItemsRendered(_overscanStartIndex, _overscanStopIndex, _visibleStartIndex, _visibleStopIndex);
          }
        }

        if (typeof this.props.onScroll === 'function') {
          var _this$state2 = this.state,
              _scrollDirection = _this$state2.scrollDirection,
              _scrollOffset = _this$state2.scrollOffset,
              _scrollUpdateWasRequested = _this$state2.scrollUpdateWasRequested;

          this._callOnScroll(_scrollDirection, _scrollOffset, _scrollUpdateWasRequested);
        }
      }; // Lazily create and cache item styles while scrolling,
      // So that pure component sCU will prevent re-renders.
      // We maintain this cache, and pass a style prop rather than index,
      // So that List can clear cached styles and force item re-render if necessary.


      _proto._getRangeToRender = function _getRangeToRender() {
        var _this$props5 = this.props,
            itemCount = _this$props5.itemCount,
            overscanCount = _this$props5.overscanCount;
        var _this$state3 = this.state,
            isScrolling = _this$state3.isScrolling,
            scrollDirection = _this$state3.scrollDirection,
            scrollOffset = _this$state3.scrollOffset;

        if (itemCount === 0) {
          return [0, 0, 0, 0];
        }

        var startIndex = getStartIndexForOffset(this.props, scrollOffset, this._instanceProps);
        var stopIndex = getStopIndexForStartIndex(this.props, startIndex, scrollOffset, this._instanceProps); // Overscan by one item in each direction so that tab/focus works.
        // If there isn't at least one extra item, tab loops back around.

        var overscanBackward = !isScrolling || scrollDirection === 'backward' ? Math.max(1, overscanCount) : 1;
        var overscanForward = !isScrolling || scrollDirection === 'forward' ? Math.max(1, overscanCount) : 1;
        return [Math.max(0, startIndex - overscanBackward), Math.max(0, Math.min(itemCount - 1, stopIndex + overscanForward)), startIndex, stopIndex];
      };

      return List;
    }(React$2.PureComponent), _class.defaultProps = {
      direction: 'ltr',
      itemData: undefined,
      layout: 'vertical',
      overscanCount: 2,
      useIsScrolling: false
    }, _temp;
  } // NOTE: I considered further wrapping individual items with a pure ListItem component.
  // This would avoid ever calling the render function for the same index more than once,
  // But it would also add the overhead of a lot of components/fibers.
  // I assume people already do this (render function returning a class component),
  // So my doing it would just unnecessarily double the wrappers.

  var validateSharedProps$1 = function validateSharedProps(_ref2, _ref3) {
    var children = _ref2.children,
        direction = _ref2.direction,
        height = _ref2.height,
        layout = _ref2.layout,
        innerTagName = _ref2.innerTagName,
        outerTagName = _ref2.outerTagName,
        width = _ref2.width;
    var instance = _ref3.instance;

    {
      if (innerTagName != null || outerTagName != null) {
        if (devWarningsTagName$1 && !devWarningsTagName$1.has(instance)) {
          devWarningsTagName$1.add(instance);
          console.warn('The innerTagName and outerTagName props have been deprecated. ' + 'Please use the innerElementType and outerElementType props instead.');
        }
      } // TODO Deprecate direction "horizontal"


      var isHorizontal = direction === 'horizontal' || layout === 'horizontal';

      switch (direction) {
        case 'horizontal':
        case 'vertical':
          if (devWarningsDirection && !devWarningsDirection.has(instance)) {
            devWarningsDirection.add(instance);
            console.warn('The direction prop should be either "ltr" (default) or "rtl". ' + 'Please use the layout prop to specify "vertical" (default) or "horizontal" orientation.');
          }

          break;

        case 'ltr':
        case 'rtl':
          // Valid values
          break;

        default:
          throw Error('An invalid "direction" prop has been specified. ' + 'Value should be either "ltr" or "rtl". ' + ("\"" + direction + "\" was specified."));
      }

      switch (layout) {
        case 'horizontal':
        case 'vertical':
          // Valid values
          break;

        default:
          throw Error('An invalid "layout" prop has been specified. ' + 'Value should be either "horizontal" or "vertical". ' + ("\"" + layout + "\" was specified."));
      }

      if (children == null) {
        throw Error('An invalid "children" prop has been specified. ' + 'Value should be a React component. ' + ("\"" + (children === null ? 'null' : typeof children) + "\" was specified."));
      }

      if (isHorizontal && typeof width !== 'number') {
        throw Error('An invalid "width" prop has been specified. ' + 'Horizontal lists must specify a number for width. ' + ("\"" + (width === null ? 'null' : typeof width) + "\" was specified."));
      } else if (!isHorizontal && typeof height !== 'number') {
        throw Error('An invalid "height" prop has been specified. ' + 'Vertical lists must specify a number for height. ' + ("\"" + (height === null ? 'null' : typeof height) + "\" was specified."));
      }
    }
  };

  var FixedSizeList =
  /*#__PURE__*/
  createListComponent({
    getItemOffset: function getItemOffset(_ref, index) {
      var itemSize = _ref.itemSize;
      return index * itemSize;
    },
    getItemSize: function getItemSize(_ref2, index) {
      var itemSize = _ref2.itemSize;
      return itemSize;
    },
    getEstimatedTotalSize: function getEstimatedTotalSize(_ref3) {
      var itemCount = _ref3.itemCount,
          itemSize = _ref3.itemSize;
      return itemSize * itemCount;
    },
    getOffsetForIndexAndAlignment: function getOffsetForIndexAndAlignment(_ref4, index, align, scrollOffset) {
      var direction = _ref4.direction,
          height = _ref4.height,
          itemCount = _ref4.itemCount,
          itemSize = _ref4.itemSize,
          layout = _ref4.layout,
          width = _ref4.width;
      // TODO Deprecate direction "horizontal"
      var isHorizontal = direction === 'horizontal' || layout === 'horizontal';
      var size = isHorizontal ? width : height;
      var lastItemOffset = Math.max(0, itemCount * itemSize - size);
      var maxOffset = Math.min(lastItemOffset, index * itemSize);
      var minOffset = Math.max(0, index * itemSize - size + itemSize);

      if (align === 'smart') {
        if (scrollOffset >= minOffset - size && scrollOffset <= maxOffset + size) {
          align = 'auto';
        } else {
          align = 'center';
        }
      }

      switch (align) {
        case 'start':
          return maxOffset;

        case 'end':
          return minOffset;

        case 'center':
          {
            // "Centered" offset is usually the average of the min and max.
            // But near the edges of the list, this doesn't hold true.
            var middleOffset = Math.round(minOffset + (maxOffset - minOffset) / 2);

            if (middleOffset < Math.ceil(size / 2)) {
              return 0; // near the beginning
            } else if (middleOffset > lastItemOffset + Math.floor(size / 2)) {
              return lastItemOffset; // near the end
            } else {
              return middleOffset;
            }
          }

        case 'auto':
        default:
          if (scrollOffset >= minOffset && scrollOffset <= maxOffset) {
            return scrollOffset;
          } else if (scrollOffset < minOffset) {
            return minOffset;
          } else {
            return maxOffset;
          }

      }
    },
    getStartIndexForOffset: function getStartIndexForOffset(_ref5, offset) {
      var itemCount = _ref5.itemCount,
          itemSize = _ref5.itemSize;
      return Math.max(0, Math.min(itemCount - 1, Math.floor(offset / itemSize)));
    },
    getStopIndexForStartIndex: function getStopIndexForStartIndex(_ref6, startIndex, scrollOffset) {
      var direction = _ref6.direction,
          height = _ref6.height,
          itemCount = _ref6.itemCount,
          itemSize = _ref6.itemSize,
          layout = _ref6.layout,
          width = _ref6.width;
      // TODO Deprecate direction "horizontal"
      var isHorizontal = direction === 'horizontal' || layout === 'horizontal';
      var offset = startIndex * itemSize;
      var size = isHorizontal ? width : height;
      var numVisibleItems = Math.ceil((size + scrollOffset - offset) / itemSize);
      return Math.max(0, Math.min(itemCount - 1, startIndex + numVisibleItems - 1 // -1 is because stop index is inclusive
      ));
    },
    initInstanceProps: function initInstanceProps(props) {// Noop
    },
    shouldResetStyleCacheOnItemSizeChange: true,
    validateProps: function validateProps(_ref7) {
      var itemSize = _ref7.itemSize;

      {
        if (typeof itemSize !== 'number') {
          throw Error('An invalid "itemSize" prop has been specified. ' + 'Value should be a number. ' + ("\"" + (itemSize === null ? 'null' : typeof itemSize) + "\" was specified."));
        }
      }
    }
  });

  var useStyles = /*#__PURE__*/core.makeStyles(function () {
    return {
      pathwayDisplay: {
        backgroundColor: '#f7f7f7',
        border: '1px solid #ddd'
      },
      listItem: {
        borderBottom: '1px solid #ccc',
        borderRight: '1px solid #ccc',
        padding: '8px 16px'
      },
      selectedLi: {
        borderBottom: '1px solid #ccc',
        borderRight: '1px solid #ccc',
        padding: '8px 16px',
        backgroundColor: 'e8e8e8',
        boxShadow: 'inset -4px 0px 0px 0px green'
      }
    };
  });

  function fetchPathways(_x) {
    return _fetchPathways.apply(this, arguments);
  }

  function _fetchPathways() {
    _fetchPathways = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(geneName) {
      var response;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return fetch("https://idg.reactome.org/idgpairwise/relationships/hierarchyForTerm/".concat(geneName), {
                method: 'GET'
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
    return _fetchPathways.apply(this, arguments);
  }

  function getPathways(_x2) {
    return _getPathways.apply(this, arguments);
  }

  function _getPathways() {
    _getPathways = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(geneName) {
      var response, pathways, recurse;
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return fetchPathways(geneName);

            case 2:
              response = _context3.sent;
              pathways = [];

              recurse = function recurse(element) {
                pathways = [].concat(_toConsumableArray(pathways), [{
                  stId: element.stId,
                  name: element.name
                }]);

                if (Array.isArray(element.children)) {
                  element.children.map(function (ele) {
                    return recurse(ele);
                  });
                }
              };

              response.hierarchy.map(function (element) {
                return recurse(element);
              });
              return _context3.abrupt("return", pathways);

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _getPathways.apply(this, arguments);
  }

  function onReactomeDiagramReady() {
    // @ts-ignore
    var diagram = window.Reactome.Diagram.create({
      placeHolder: 'diagramHolder',
      width: 950,
      height: 500,
      toHide: ['search']
    });
    diagram.loadDiagram('R-HSA-1266738');
    return diagram;
  }

  function handleOpen(_x3) {
    return _handleOpen.apply(this, arguments);
  }

  function _handleOpen() {
    _handleOpen = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(setDiagram) {
      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return loadScript2('https://dev.reactome.org/DiagramJs/diagram/diagram.nocache.js');

            case 2:
              _context4.next = 4;
              return new Promise(function (resolve) {
                var checker = setInterval(function () {
                  // @ts-ignore
                  if (window.Reactome) {
                    clearInterval(checker); // @ts-ignore

                    // @ts-ignore
                    resolve(window.Reactome);
                  }
                }, 100);
              });

            case 4:
              setDiagram(onReactomeDiagramReady());

            case 5:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));
    return _handleOpen.apply(this, arguments);
  }

  var ReactomeView = /*#__PURE__*/mobxReact.observer(function (_ref) {
    var _model$pathways;

    var model = _ref.model;
    var inputRef = React$2.useRef();

    var _useState = React$2.useState((_model$pathways = model.pathways) !== null && _model$pathways !== void 0 && _model$pathways.length ? model.pathways.length : 0),
        _useState2 = _slicedToArray(_useState, 2),
        pathwayCount = _useState2[0],
        setPathwayCount = _useState2[1];

    var _useState3 = React$2.useState(),
        _useState4 = _slicedToArray(_useState3, 2),
        diagram = _useState4[0],
        setDiagram = _useState4[1];

    var classes = useStyles();
    React$2.useEffect(function () {
      handleOpen(setDiagram);
    }, []);
    React$2.useEffect(function () {
      if (diagram) {
        diagram.loadDiagram(model.selectedPathway);
      }
    }, [model.selectedPathway]);

    function renderRow(props) {
      var _model$pathways$index, _model$pathways$index8, _model$pathways$index9;

      var index = props.index,
          style = props.style;

      if (((_model$pathways$index = model.pathways[index]) === null || _model$pathways$index === void 0 ? void 0 : _model$pathways$index.stId) === model.selectedPathway) {
        var _model$pathways$index4, _model$pathways$index5;

        return /*#__PURE__*/React__default["default"].createElement(core.ListItem, {
          button: true,
          style: style,
          className: classes.selectedLi,
          key: index,
          onClick: function onClick() {
            var _model$pathways$index2, _model$pathways$index3;

            model.setSelectedPathway((_model$pathways$index2 = model.pathways[index]) === null || _model$pathways$index2 === void 0 ? void 0 : _model$pathways$index2.stId);
            model.setMessage("Pathways relating to ".concat(model.gene, " are being displayed. \"").concat((_model$pathways$index3 = model.pathways[index]) === null || _model$pathways$index3 === void 0 ? void 0 : _model$pathways$index3.name, "\" has been selected."));
          }
        }, /*#__PURE__*/React__default["default"].createElement(core.ListItemText, {
          primary: (_model$pathways$index4 = model.pathways[index]) === null || _model$pathways$index4 === void 0 ? void 0 : _model$pathways$index4.stId,
          secondary: (_model$pathways$index5 = model.pathways[index]) === null || _model$pathways$index5 === void 0 ? void 0 : _model$pathways$index5.name
        }));
      }

      return /*#__PURE__*/React__default["default"].createElement(core.ListItem, {
        button: true,
        style: style,
        className: classes.listItem,
        key: index,
        onClick: function onClick() {
          var _model$pathways$index6, _model$pathways$index7;

          model.setSelectedPathway((_model$pathways$index6 = model.pathways[index]) === null || _model$pathways$index6 === void 0 ? void 0 : _model$pathways$index6.stId);
          model.setMessage("Pathways relating to ".concat(model.gene, " are being displayed. \"").concat((_model$pathways$index7 = model.pathways[index]) === null || _model$pathways$index7 === void 0 ? void 0 : _model$pathways$index7.name, "\" has been selected."));
        }
      }, /*#__PURE__*/React__default["default"].createElement(core.ListItemText, {
        primary: (_model$pathways$index8 = model.pathways[index]) === null || _model$pathways$index8 === void 0 ? void 0 : _model$pathways$index8.stId,
        secondary: (_model$pathways$index9 = model.pathways[index]) === null || _model$pathways$index9 === void 0 ? void 0 : _model$pathways$index9.name
      }));
    }

    var handleSubmit = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var requestedGeneName, pathways;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // @ts-ignore
                requestedGeneName = inputRef ? inputRef.current.value : undefined;

                if (!requestedGeneName) {
                  _context.next = 6;
                  break;
                }

                _context.next = 4;
                return getPathways(requestedGeneName);

              case 4:
                pathways = _context.sent;

                if ((pathways === null || pathways === void 0 ? void 0 : pathways.length) !== 0) {
                  model.setPathways(pathways);
                  setPathwayCount(model.pathways.length);
                  model.setGene(requestedGeneName);
                  model.setMessage("Pathways relating to ".concat(requestedGeneName, " are being displayed. Click on the pathway name to display it in the Reactome Diagram viewer."));
                  model.setSelectedPathway(model.pathways[0].stId);
                } else {
                  model.setPathways([]);
                  setPathwayCount(0);
                  model.setMessage("No pathways could be retrieved for ".concat(requestedGeneName, "."));
                }

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function handleSubmit() {
        return _ref2.apply(this, arguments);
      };
    }();

    var SearchButton = function SearchButton() {
      return /*#__PURE__*/React__default["default"].createElement(core.IconButton, {
        onClick: handleSubmit
      }, /*#__PURE__*/React__default["default"].createElement(default_1$1, null));
    };

    return /*#__PURE__*/React__default["default"].createElement("div", null, /*#__PURE__*/React__default["default"].createElement(core.Grid, {
      container: true,
      direction: "column",
      justifyContent: "center",
      alignItems: "center",
      style: {
        gap: '5px'
      }
    }, /*#__PURE__*/React__default["default"].createElement(core.TextField, {
      fullWidth: true,
      color: "primary",
      variant: "outlined",
      label: "Enter a gene name to retrieve associated pathways",
      InputProps: {
        endAdornment: /*#__PURE__*/React__default["default"].createElement(SearchButton, null)
      },
      style: {
        width: 625
      },
      inputRef: inputRef,
      onKeyPress: function onKeyPress(e) {
        if (e.key === 'Enter') handleSubmit();
      }
    }), /*#__PURE__*/React__default["default"].createElement(lab.Alert, {
      severity: "info",
      style: {
        width: 1250
      }
    }, model.message), /*#__PURE__*/React__default["default"].createElement(core.Grid, {
      container: true,
      direction: "row",
      justifyContent: "center",
      alignItems: "center",
      style: {
        gap: '5px',
        marginBottom: '8px'
      }
    }, model.pathways ? /*#__PURE__*/React__default["default"].createElement(FixedSizeList, {
      height: 500,
      width: 300,
      itemSize: 56,
      itemCount: pathwayCount,
      className: classes.pathwayDisplay
    }, renderRow) : /*#__PURE__*/React__default["default"].createElement(core.Box, {
      className: classes.pathwayDisplay,
      height: 500,
      width: 300
    }, /*#__PURE__*/React__default["default"].createElement(core.Typography, {
      align: "center"
    }, "There are no pathways to be displayed.")), /*#__PURE__*/React__default["default"].createElement("div", {
      id: "diagramHolder"
    }))));
  });

  var stateModel = /*#__PURE__*/mobxStateTree.types.model({
    type: mobxStateTree.types.literal('ReactomeView'),
    displayName: mobxStateTree.types.maybe(mobxStateTree.types.string),
    selectedPathway: mobxStateTree.types.maybe(mobxStateTree.types.string),
    gene: mobxStateTree.types.maybe(mobxStateTree.types.string),
    message: 'No pathways are currently displayed.'
  })["volatile"](function () {
    return {
      pathways: undefined
    };
  }).actions(function (self) {
    return {
      // unused but required by your view
      setWidth: function setWidth() {},
      setDisplayName: function setDisplayName(str) {
        self.displayName = str;
      },
      setPathways: function setPathways(pathways) {
        self.pathways = pathways;
      },
      setSelectedPathway: function setSelectedPathway(str) {
        self.selectedPathway = str;
      },
      setGene: function setGene(str) {
        self.gene = str;
      },
      setMessage: function setMessage(str) {
        self.message = str;
      }
    };
  });

  var ShowChart = {};

  var _interopRequireDefault = interopRequireDefault;

  var _interopRequireWildcard = interopRequireWildcard;

  Object.defineProperty(ShowChart, "__esModule", {
    value: true
  });
  var default_1 = ShowChart.default = void 0;

  var React = _interopRequireWildcard(React__default["default"]);

  var _createSvgIcon = _interopRequireDefault(createSvgIcon);

  var _default = (0, _createSvgIcon.default)( /*#__PURE__*/React.createElement("path", {
    d: "M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"
  }), 'ShowChart');

  default_1 = ShowChart.default = _default;

  var ReactomePlugin = /*#__PURE__*/function (_Plugin) {
    _inherits(ReactomePlugin, _Plugin);

    var _super = /*#__PURE__*/_createSuper(ReactomePlugin);

    function ReactomePlugin() {
      var _this;

      _classCallCheck(this, ReactomePlugin);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _super.call.apply(_super, [this].concat(args));

      _defineProperty(_assertThisInitialized$1(_this), "name", 'ReactomePlugin');

      _defineProperty(_assertThisInitialized$1(_this), "version", version);

      return _this;
    }

    _createClass(ReactomePlugin, [{
      key: "install",
      value: function install(pluginManager) {
        pluginManager.addViewType(function () {
          return new ViewType__default["default"]({
            name: 'ReactomeView',
            stateModel: stateModel,
            ReactComponent: ReactomeView
          });
        });
      }
    }, {
      key: "configure",
      value: function configure(pluginManager) {
        if (util.isAbstractMenuManager(pluginManager.rootModel)) {
          pluginManager.rootModel.appendToMenu('Add', {
            label: 'Reactome View',
            icon: default_1,
            onClick: function onClick(session) {
              session.addView('ReactomeView', {});
              var xView = session.views.length - 1; // @ts-ignore

              session.views[xView].setDisplayName('Reactome View');
            }
          });
        }
      }
    }]);

    return ReactomePlugin;
  }(Plugin__default["default"]);

  exports["default"] = ReactomePlugin;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=jbrowse-plugin-reactome.umd.development.js.map
