import Plugin from '@jbrowse/core/Plugin';
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType';
import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import SimpleFeature from '@jbrowse/core/util/simpleFeature';
import { toArray } from 'rxjs/operators';
import { readConfObject, ConfigurationSchema } from '@jbrowse/core/configuration';

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

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
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

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
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

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
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
      it = o[Symbol.iterator]();
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

var version = "0.0.6";

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

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
});

var QuantitativeSequenceAdapter = /*#__PURE__*/function (_BaseFeatureDataAdapt) {
  _inherits(QuantitativeSequenceAdapter, _BaseFeatureDataAdapt);

  var _super = /*#__PURE__*/_createSuper(QuantitativeSequenceAdapter);

  function QuantitativeSequenceAdapter() {
    _classCallCheck(this, QuantitativeSequenceAdapter);

    return _super.apply(this, arguments);
  }

  _createClass(QuantitativeSequenceAdapter, [{
    key: "setup",
    value: function () {
      var _setup = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee() {
        var sequenceAdapterConfig, _yield$this$getSubAda, dataAdapter, wiggleAdapterConfig, _yield$this$getSubAda2, _dataAdapter;

        return runtime_1.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                sequenceAdapterConfig = readConfObject(this.config, 'sequenceAdapter');

                if (!sequenceAdapterConfig) {
                  _context.next = 9;
                  break;
                }

                if (this.getSubAdapter) {
                  _context.next = 4;
                  break;
                }

                throw new Error('getSubadapter not available');

              case 4:
                _context.next = 6;
                return this.getSubAdapter(sequenceAdapterConfig);

              case 6:
                _yield$this$getSubAda = _context.sent;
                dataAdapter = _yield$this$getSubAda.dataAdapter;
                this.sequenceAdapter = dataAdapter;

              case 9:
                wiggleAdapterConfig = readConfObject(this.config, 'wiggleAdapter');

                if (!wiggleAdapterConfig) {
                  _context.next = 18;
                  break;
                }

                if (this.getSubAdapter) {
                  _context.next = 13;
                  break;
                }

                throw new Error('getSubadapter not available');

              case 13:
                _context.next = 15;
                return this.getSubAdapter(wiggleAdapterConfig);

              case 15:
                _yield$this$getSubAda2 = _context.sent;
                _dataAdapter = _yield$this$getSubAda2.dataAdapter;
                this.wiggleAdapter = _dataAdapter;

              case 18:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function setup() {
        return _setup.apply(this, arguments);
      }

      return setup;
    }()
  }, {
    key: "getRefNames",
    value: function () {
      var _getRefNames = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee2(opts) {
        return runtime_1.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.setup();

              case 2:
                return _context2.abrupt("return", this.wiggleAdapter.getRefNames(opts));

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getRefNames(_x) {
        return _getRefNames.apply(this, arguments);
      }

      return getRefNames;
    }()
  }, {
    key: "getGlobalStats",
    value: function () {
      var _getGlobalStats = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee3(opts) {
        return runtime_1.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.setup();

              case 2:
                return _context3.abrupt("return", this.wiggleAdapter.getGlobalStats(opts));

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getGlobalStats(_x2) {
        return _getGlobalStats.apply(this, arguments);
      }

      return getGlobalStats;
    }()
  }, {
    key: "getFeatures",
    value: function getFeatures(region) {
      var _this = this;

      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var refName = region.refName;
      var signal = opts.signal;
      return ObservableCreate( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee4(observer) {
          var features, sequence, featureArray, sequenceFeatureArray, seqString, scoreArray;
          return runtime_1.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  features = _this.wiggleAdapter.getFeatures(region, opts);

                  if (!(region.end - region.start < 5000)) {
                    _context4.next = 16;
                    break;
                  }

                  sequence = _this.sequenceAdapter.getFeatures(_objectSpread2(_objectSpread2({}, region), {}, {
                    refName: region.originalRefName
                  }), opts);
                  _context4.next = 5;
                  return features.pipe(toArray()).toPromise();

                case 5:
                  featureArray = _context4.sent;
                  _context4.next = 8;
                  return sequence.pipe(toArray()).toPromise();

                case 8:
                  sequenceFeatureArray = _context4.sent;
                  seqString = sequenceFeatureArray[0].get('seq');
                  scoreArray = new Array(region.end - region.start);
                  featureArray.forEach(function (feature) {
                    var featureStart = feature.get('start');
                    var featureEnd = feature.get('end');

                    for (var i = featureStart; i < featureEnd; i++) {
                      if (i - region.start >= 0 && i - region.start < scoreArray.length) {
                        scoreArray[i - region.start] = {
                          base: seqString[i - region.start],
                          score: feature.get('score')
                        };
                      }
                    }
                  });
                  scoreArray.forEach(function (score, i) {
                    var start = region.start + i;
                    var end = region.start + i + 1;
                    observer.next(new SimpleFeature({
                      id: "".concat(refName, " ").concat(start, "-").concat(end),
                      data: _objectSpread2({
                        refName: refName,
                        start: start,
                        end: end
                      }, score)
                    }));
                  });
                  observer.complete();
                  _context4.next = 17;
                  break;

                case 16:
                  features.subscribe(observer);

                case 17:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }));

        return function (_x3) {
          return _ref.apply(this, arguments);
        };
      }(), signal);
    }
  }, {
    key: "freeResources",
    value: function freeResources() {}
  }]);

  return QuantitativeSequenceAdapter;
}(BaseFeatureDataAdapter);
QuantitativeSequenceAdapter.capabilities = ['hasResolution', 'hasLocalStats', 'hasGlobalStats'];

var configSchema = /*#__PURE__*/ConfigurationSchema('QuantitativeSequenceAdapter', {
  sequenceAdapter: {
    type: 'frozen',
    defaultValue: null
  },
  wiggleAdapter: {
    type: 'frozen',
    defaultValue: null
  }
}, {
  explicitlyTyped: true
});

/**
 * gets the origin for drawing the graph. for linear this is 0, for log this is arbitrarily set to log(1)==0
 */
function getOrigin(scaleType) {
  if (scaleType === 'log') {
    return 1;
  }

  return 0;
}
/*
Gets the correct color for a given base
*/

function getColor(base) {
  base = base.toUpperCase();

  if (base === 'T') {
    return '#f44336';
  } else if (base === 'A') {
    return '#4caf50';
  } else if (base === 'G') {
    return '#ffc107';
  } else if (base === 'C') {
    return '#2196f3';
  } else {
    return '#000';
  }
}

function rendererFactory(pluginManager) {
  var WigglePlugin = pluginManager.getPlugin('WigglePlugin');
  var _WigglePlugin$exports = WigglePlugin.exports,
      getScale = _WigglePlugin$exports.utils.getScale,
      XYPlotRenderer = _WigglePlugin$exports.XYPlotRenderer;
  var featureSpanPx = pluginManager.lib['@jbrowse/core/util'].featureSpanPx;
  return /*#__PURE__*/function (_XYPlotRenderer) {
    _inherits(QuantitativeSequenceRenderer, _XYPlotRenderer);

    var _super = _createSuper(QuantitativeSequenceRenderer);

    function QuantitativeSequenceRenderer() {
      _classCallCheck(this, QuantitativeSequenceRenderer);

      return _super.apply(this, arguments);
    }

    _createClass(QuantitativeSequenceRenderer, [{
      key: "draw",
      value: function draw(ctx, props) {
        var features = props.features,
            regions = props.regions,
            bpPerPx = props.bpPerPx,
            scaleOpts = props.scaleOpts,
            unadjustedHeight = props.height,
            displayCrossHatches = props.displayCrossHatches,
            values = props.ticks.values;

        var _regions = _slicedToArray(regions, 1),
            region = _regions[0];

        var YSCALEBAR_LABEL_OFFSET = 5;
        var height = unadjustedHeight - YSCALEBAR_LABEL_OFFSET * 2;

        var opts = _objectSpread2(_objectSpread2({}, scaleOpts), {}, {
          range: [0, height]
        });

        var width = (region.end - region.start) / bpPerPx;
        var originY = getOrigin(scaleOpts.scaleType);
        var scale = getScale(opts);

        if (region.end - region.start > 5000) {
          console.log('using super');

          _get(_getPrototypeOf(QuantitativeSequenceRenderer.prototype), "draw", this).call(this, ctx, props);

          return;
        }

        var toY = function toY(n) {
          return height - scale(n) + YSCALEBAR_LABEL_OFFSET;
        };

        var toHeight = function toHeight(n) {
          return toY(originY) - toY(n);
        };

        console.log({
          features: features
        });
        ctx.textAlign = 'center';

        var _iterator = _createForOfIteratorHelper(features.values()),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var feature = _step.value;

            var _featureSpanPx = featureSpanPx(feature, region, bpPerPx),
                _featureSpanPx2 = _slicedToArray(_featureSpanPx, 2),
                leftPx = _featureSpanPx2[0],
                rightPx = _featureSpanPx2[1];

            var w = rightPx - leftPx + 0.4; // fudge factor for subpixel rendering

            var score = feature.get('score');
            var base = feature.get('base');
            ctx.fillStyle = getColor(base);
            ctx.fillRect(leftPx, toY(score), w, toHeight(score));
            ctx.fillStyle = '#000';

            if (1 / bpPerPx > 5) {
              ctx.fillText(base, leftPx + (rightPx - leftPx) / 2, toY(score) - 2);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        if (displayCrossHatches) {
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(200,200,200,0.8)';
          values.forEach(function (tick) {
            ctx.beginPath();
            ctx.moveTo(0, Math.round(toY(tick)));
            ctx.lineTo(width, Math.round(toY(tick)));
            ctx.stroke();
          });
        }
      }
    }]);

    return QuantitativeSequenceRenderer;
  }(XYPlotRenderer);
}

function configSchemaFactory(pluginManager) {
  var WigglePlugin = pluginManager.getPlugin('WigglePlugin'); //@ts-ignore

  var xyPlotRendererConfigSchema = WigglePlugin.exports.xyPlotRendererConfigSchema;
  return ConfigurationSchema('QuantitativeSequenceRenderer', {}, {
    baseConfiguration: xyPlotRendererConfigSchema,
    explicitlyTyped: true
  });
}

function configSchemaFactory$1(pluginManager) {
  var types = pluginManager.lib['mobx-state-tree'].types;
  var ConfigurationSchema = pluginManager.lib['@jbrowse/core/configuration'].ConfigurationSchema;
  var LGVPlugin = pluginManager.getPlugin('LinearGenomeViewPlugin'); //@ts-ignore

  var baseLinearDisplayConfigSchema = LGVPlugin.exports.baseLinearDisplayConfigSchema;
  return ConfigurationSchema('QuantitativeSequenceDisplay', {
    autoscale: {
      type: 'stringEnum',
      defaultValue: 'local',
      model: types.enumeration('Autoscale type', ['global', 'local', 'globalsd', 'localsd', 'zscore']),
      description: 'global/local using their min/max values or w/ standard deviations (globalsd/localsd)'
    },
    minScore: {
      type: 'number',
      defaultValue: Number.MIN_VALUE,
      description: 'minimum value for the y-scale'
    },
    maxScore: {
      type: 'number',
      description: 'maximum value for the y-scale',
      defaultValue: Number.MAX_VALUE
    },
    numStdDev: {
      type: 'number',
      description: 'number of standard deviations to use for autoscale types globalsd or localsd',
      defaultValue: 3
    },
    scaleType: {
      type: 'stringEnum',
      model: types.enumeration('Scale type', ['linear', 'log']),
      description: 'The type of scale to use',
      defaultValue: 'linear'
    },
    inverted: {
      type: 'boolean',
      description: 'draw upside down',
      defaultValue: false
    },
    defaultRendering: {
      type: 'stringEnum',
      model: types.enumeration('Rendering', ['density', 'xyplot', 'line']),
      defaultValue: 'xyplot'
    }
  }, {
    baseConfiguration: baseLinearDisplayConfigSchema,
    explicitlyTyped: true
  });
}
function stateModelFactory(pluginManager, configSchema) {
  var types = pluginManager.lib['mobx-state-tree'].types;
  var WigglePlugin = pluginManager.getPlugin('WigglePlugin'); //@ts-ignore

  var linearWiggleDisplayModelFactory = WigglePlugin.exports.linearWiggleDisplayModelFactory;
  return types.compose('QuantitativeSequenceDisplay', linearWiggleDisplayModelFactory(pluginManager, configSchema), types.model({
    type: types.literal('QuantitativeSequenceDisplay')
  }).views(function () {
    return {
      get rendererTypeName() {
        return 'QuantitativeSequenceRenderer';
      },

      get needsScalebar() {
        return true;
      }

    };
  }));
}

var QuantseqPlugin = /*#__PURE__*/function (_Plugin) {
  _inherits(QuantseqPlugin, _Plugin);

  var _super = /*#__PURE__*/_createSuper(QuantseqPlugin);

  function QuantseqPlugin() {
    var _this;

    _classCallCheck(this, QuantseqPlugin);

    _this = _super.apply(this, arguments);
    _this.name = 'Quantseq';
    _this.version = version;
    return _this;
  }

  _createClass(QuantseqPlugin, [{
    key: "install",
    value: function install(pluginManager) {
      var WigglePlugin = pluginManager.getPlugin('WigglePlugin');
      var DisplayType = pluginManager.lib['@jbrowse/core/pluggableElementTypes/DisplayType'];
      var _WigglePlugin$exports = WigglePlugin.exports,
          LinearWiggleDisplayReactComponent = _WigglePlugin$exports.LinearWiggleDisplayReactComponent,
          XYPlotRendererReactComponent = _WigglePlugin$exports.XYPlotRendererReactComponent;
      pluginManager.addAdapterType(function () {
        return new AdapterType({
          name: 'QuantitativeSequenceAdapter',
          AdapterClass: QuantitativeSequenceAdapter,
          configSchema: configSchema
        });
      });
      pluginManager.addDisplayType(function () {
        var configSchema = configSchemaFactory$1(pluginManager);
        return new DisplayType({
          name: 'QuantitativeSequenceDisplay',
          configSchema: configSchema,
          stateModel: stateModelFactory(pluginManager, configSchema),
          trackType: 'FeatureTrack',
          viewType: 'LinearGenomeView',
          ReactComponent: LinearWiggleDisplayReactComponent
        });
      });
      pluginManager.addRendererType(function () {
        //@ts-ignore
        var QuantitativeSequenceRenderer = new rendererFactory(pluginManager);
        var configSchema = configSchemaFactory(pluginManager);
        return new QuantitativeSequenceRenderer({
          name: 'QuantitativeSequenceRenderer',
          ReactComponent: XYPlotRendererReactComponent,
          configSchema: configSchema,
          pluginManager: pluginManager
        });
      });
    }
  }, {
    key: "configure",
    value: function configure(pluginManager) {}
  }]);

  return QuantseqPlugin;
}(Plugin);

export default QuantseqPlugin;
//# sourceMappingURL=jbrowse-plugin-quantseq.esm.js.map
