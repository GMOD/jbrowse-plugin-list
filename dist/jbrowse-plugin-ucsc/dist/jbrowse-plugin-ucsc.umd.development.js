(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@jbrowse/core/pluggableElementTypes/AdapterType'), require('@jbrowse/core/Plugin'), require('@jbrowse/core/configuration'), require('@jbrowse/core/util/rxjs'), require('@jbrowse/core/data_adapters/BaseAdapter')) :
  typeof define === 'function' && define.amd ? define(['exports', '@jbrowse/core/pluggableElementTypes/AdapterType', '@jbrowse/core/Plugin', '@jbrowse/core/configuration', '@jbrowse/core/util/rxjs', '@jbrowse/core/data_adapters/BaseAdapter'], factory) :
  (global = global || self, factory(global.JBrowsePluginUCSC = {}, global.JBrowseExports['@jbrowse/core/pluggableElementTypes/AdapterType'], global.JBrowseExports['@jbrowse/core/Plugin'], global.JBrowseExports['@jbrowse/core/configuration'], global.JBrowseExports['@jbrowse/core/util/rxjs'], global.JBrowseExports['@jbrowse/core/data_adapters/BaseAdapter']));
}(this, (function (exports, AdapterType, Plugin, configuration, rxjs, BaseAdapter) { 'use strict';

  AdapterType = AdapterType && Object.prototype.hasOwnProperty.call(AdapterType, 'default') ? AdapterType['default'] : AdapterType;
  Plugin = Plugin && Object.prototype.hasOwnProperty.call(Plugin, 'default') ? Plugin['default'] : Plugin;

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

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

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

  var interopRequireDefault = createCommonjsModule(function (module) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      "default": obj
    };
  }

  module.exports = _interopRequireDefault;
  });

  unwrapExports(interopRequireDefault);

  function _classCallCheck$1(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var classCallCheck = _classCallCheck$1;

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

  var createClass = _createClass$1;

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

  var defineProperty = _defineProperty$1;

  var _typeof_1 = createCommonjsModule(function (module) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      module.exports = _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      module.exports = _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  module.exports = _typeof;
  });

  var simpleFeature = createCommonjsModule(function (module, exports) {



  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.isFeature = isFeature;
  exports.default = void 0;

  var _classCallCheck2 = interopRequireDefault(classCallCheck);

  var _createClass2 = interopRequireDefault(createClass);

  var _defineProperty2 = interopRequireDefault(defineProperty);

  var _typeof2 = interopRequireDefault(_typeof_1);

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  /**
   * Abstract feature object
   */
  function isFeature(thing) {
    return (0, _typeof2.default)(thing) === 'object' && thing !== null && typeof thing.get === 'function' && typeof thing.id === 'function';
  }

  function isSimpleFeatureSerialized(args) {
    return 'uniqueId' in args && (0, _typeof2.default)(args.data) !== 'object';
  }
  /**
   * Simple implementation of a feature object.
   */


  var SimpleFeature = /*#__PURE__*/function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    /**
     * @param args - SimpleFeature args
     *
     * Note: args.data.subfeatures can be an array of these same args,
     * which will be inflated to more instances of this class.
     */
    function SimpleFeature(args) {
      (0, _classCallCheck2.default)(this, SimpleFeature);
      (0, _defineProperty2.default)(this, "data", void 0);
      (0, _defineProperty2.default)(this, "parentHandle", void 0);
      (0, _defineProperty2.default)(this, "uniqueId", void 0);

      if (isSimpleFeatureSerialized(args)) {
        this.data = args;
      } else {
        this.data = args.data || {}; // load handle from args.parent (not args.data.parent)
        // this reason is because if args is an object, it likely isn't properly loaded with
        // parent as a Feature reference (probably a raw parent ID or something instead)

        this.parentHandle = args.parent;
      } // the feature id comes from
      // args.id, args.data.uniqueId, or args.uniqueId due to this initialization


      var id = isSimpleFeatureSerialized(args) ? args.uniqueId : args.id;

      if (id === undefined || id === null) {
        throw new Error('SimpleFeature requires a unique `id` or `data.uniqueId` attribute');
      }

      this.uniqueId = String(id);

      if (!(this.data.aliases || this.data.end - this.data.start >= 0)) {
        throw new Error("invalid feature data, end less than start. end: ".concat(this.data.end, " start: ").concat(this.data.start));
      } // inflate any subfeatures that are not already feature objects


      var subfeatures = this.data.subfeatures;

      if (subfeatures) {
        for (var i = 0; i < subfeatures.length; i += 1) {
          if (typeof subfeatures[i].get !== 'function') {
            subfeatures[i].strand = subfeatures[i].strand || this.data.strand;
            subfeatures[i] = new SimpleFeature({
              id: subfeatures[i].uniqueId || "".concat(id, "-").concat(i),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: subfeatures[i],
              parent: this
            });
          }
        }
      }
    }
    /**
     * Get a piece of data about the feature.  All features must have
     * 'start' and 'end', but everything else is optional.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any


    (0, _createClass2.default)(SimpleFeature, [{
      key: "get",
      value: function get(name) {
        return this.data[name];
      }
      /**
       * Set an item of data.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any

    }, {
      key: "set",
      value: function set(name, val) {
        this.data[name] = val;
      }
      /**
       * Get an array listing which data keys are present in this feature.
       */

    }, {
      key: "tags",
      value: function tags() {
        return Object.keys(this.data);
      }
      /**
       * Get the unique ID of this feature.
       */

    }, {
      key: "id",
      value: function id() {
        return this.uniqueId;
      }
      /**
       * Get this feature's parent feature, or undefined if none.
       */

    }, {
      key: "parent",
      value: function parent() {
        return this.parentHandle;
      }
      /**
       * Get an array of child features, or undefined if none.
       */

    }, {
      key: "children",
      value: function children() {
        return this.get('subfeatures');
      }
    }, {
      key: "toJSON",
      value: function toJSON() {
        var d = _objectSpread(_objectSpread({}, this.data), {}, {
          uniqueId: this.id()
        });

        var p = this.parent();
        if (p) d.parentId = p.id();
        var c = this.children();
        if (c) d.subfeatures = c.map(function (child) {
          return child.toJSON();
        });
        return d;
      }
    }], [{
      key: "fromJSON",
      value: function fromJSON(json) {
        return new SimpleFeature(_objectSpread({}, json));
      }
    }]);
    return SimpleFeature;
  }();

  exports.default = SimpleFeature;
  });

  var SimpleFeature = unwrapExports(simpleFeature);

  var at, // The index of the current character
      ch, // The current character
      escapee = {
          '"':  '"',
          '\\': '\\',
          '/':  '/',
          b:    '\b',
          f:    '\f',
          n:    '\n',
          r:    '\r',
          t:    '\t'
      },
      text,

      error = function (m) {
          // Call error when something is wrong.
          throw {
              name:    'SyntaxError',
              message: m,
              at:      at,
              text:    text
          };
      },
      
      next = function (c) {
          // If a c parameter is provided, verify that it matches the current character.
          if (c && c !== ch) {
              error("Expected '" + c + "' instead of '" + ch + "'");
          }
          
          // Get the next character. When there are no more characters,
          // return the empty string.
          
          ch = text.charAt(at);
          at += 1;
          return ch;
      },
      
      number = function () {
          // Parse a number value.
          var number,
              string = '';
          
          if (ch === '-') {
              string = '-';
              next('-');
          }
          while (ch >= '0' && ch <= '9') {
              string += ch;
              next();
          }
          if (ch === '.') {
              string += '.';
              while (next() && ch >= '0' && ch <= '9') {
                  string += ch;
              }
          }
          if (ch === 'e' || ch === 'E') {
              string += ch;
              next();
              if (ch === '-' || ch === '+') {
                  string += ch;
                  next();
              }
              while (ch >= '0' && ch <= '9') {
                  string += ch;
                  next();
              }
          }
          number = +string;
          if (!isFinite(number)) {
              error("Bad number");
          } else {
              return number;
          }
      },
      
      string = function () {
          // Parse a string value.
          var hex,
              i,
              string = '',
              uffff;
          
          // When parsing for string values, we must look for " and \ characters.
          if (ch === '"') {
              while (next()) {
                  if (ch === '"') {
                      next();
                      return string;
                  } else if (ch === '\\') {
                      next();
                      if (ch === 'u') {
                          uffff = 0;
                          for (i = 0; i < 4; i += 1) {
                              hex = parseInt(next(), 16);
                              if (!isFinite(hex)) {
                                  break;
                              }
                              uffff = uffff * 16 + hex;
                          }
                          string += String.fromCharCode(uffff);
                      } else if (typeof escapee[ch] === 'string') {
                          string += escapee[ch];
                      } else {
                          break;
                      }
                  } else {
                      string += ch;
                  }
              }
          }
          error("Bad string");
      },

      white = function () {

  // Skip whitespace.

          while (ch && ch <= ' ') {
              next();
          }
      },

      word = function () {

  // true, false, or null.

          switch (ch) {
          case 't':
              next('t');
              next('r');
              next('u');
              next('e');
              return true;
          case 'f':
              next('f');
              next('a');
              next('l');
              next('s');
              next('e');
              return false;
          case 'n':
              next('n');
              next('u');
              next('l');
              next('l');
              return null;
          }
          error("Unexpected '" + ch + "'");
      },

      value,  // Place holder for the value function.

      array = function () {

  // Parse an array value.

          var array = [];

          if (ch === '[') {
              next('[');
              white();
              if (ch === ']') {
                  next(']');
                  return array;   // empty array
              }
              while (ch) {
                  array.push(value());
                  white();
                  if (ch === ']') {
                      next(']');
                      return array;
                  }
                  next(',');
                  white();
              }
          }
          error("Bad array");
      },

      object = function () {

  // Parse an object value.

          var key,
              object = {};

          if (ch === '{') {
              next('{');
              white();
              if (ch === '}') {
                  next('}');
                  return object;   // empty object
              }
              while (ch) {
                  key = string();
                  white();
                  next(':');
                  if (Object.hasOwnProperty.call(object, key)) {
                      error('Duplicate key "' + key + '"');
                  }
                  object[key] = value();
                  white();
                  if (ch === '}') {
                      next('}');
                      return object;
                  }
                  next(',');
                  white();
              }
          }
          error("Bad object");
      };

  value = function () {

  // Parse a JSON value. It could be an object, an array, a string, a number,
  // or a word.

      white();
      switch (ch) {
      case '{':
          return object();
      case '[':
          return array();
      case '"':
          return string();
      case '-':
          return number();
      default:
          return ch >= '0' && ch <= '9' ? number() : word();
      }
  };

  // Return the json_parse function. It will have access to all of the above
  // functions and variables.

  var parse = function (source, reviver) {
      var result;
      
      text = source;
      at = 0;
      ch = ' ';
      result = value();
      white();
      if (ch) {
          error("Syntax error");
      }

      // If there is a reviver function, we recursively walk the new structure,
      // passing each name/value pair to the reviver function for possible
      // transformation, starting with a temporary root object that holds the result
      // in an empty key. If there is not a reviver function, we simply return the
      // result.

      return typeof reviver === 'function' ? (function walk(holder, key) {
          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = walk(value, k);
                      if (v !== undefined) {
                          value[k] = v;
                      } else {
                          delete value[k];
                      }
                  }
              }
          }
          return reviver.call(holder, key, value);
      }({'': result}, '')) : result;
  };

  var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"' : '\\"',
          '\\': '\\\\'
      },
      rep;

  function quote(string) {
      // If the string contains no control characters, no quote characters, and no
      // backslash characters, then we can safely slap some quotes around it.
      // Otherwise we must also replace the offending characters with safe escape
      // sequences.
      
      escapable.lastIndex = 0;
      return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
          var c = meta[a];
          return typeof c === 'string' ? c :
              '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
  }

  function str(key, holder) {
      // Produce a string from holder[key].
      var i,          // The loop counter.
          k,          // The member key.
          v,          // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];
      
      // If the value has a toJSON method, call it to obtain a replacement value.
      if (value && typeof value === 'object' &&
              typeof value.toJSON === 'function') {
          value = value.toJSON(key);
      }
      
      // If we were called with a replacer function, then call the replacer to
      // obtain a replacement value.
      if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
      }
      
      // What happens next depends on the value's type.
      switch (typeof value) {
          case 'string':
              return quote(value);
          
          case 'number':
              // JSON numbers must be finite. Encode non-finite numbers as null.
              return isFinite(value) ? String(value) : 'null';
          
          case 'boolean':
          case 'null':
              // If the value is a boolean or null, convert it to a string. Note:
              // typeof null does not produce 'null'. The case is included here in
              // the remote chance that this gets fixed someday.
              return String(value);
              
          case 'object':
              if (!value) return 'null';
              gap += indent;
              partial = [];
              
              // Array.isArray
              if (Object.prototype.toString.apply(value) === '[object Array]') {
                  length = value.length;
                  for (i = 0; i < length; i += 1) {
                      partial[i] = str(i, value) || 'null';
                  }
                  
                  // Join all of the elements together, separated with commas, and
                  // wrap them in brackets.
                  v = partial.length === 0 ? '[]' : gap ?
                      '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                      '[' + partial.join(',') + ']';
                  gap = mind;
                  return v;
              }
              
              // If the replacer is an array, use it to select the members to be
              // stringified.
              if (rep && typeof rep === 'object') {
                  length = rep.length;
                  for (i = 0; i < length; i += 1) {
                      k = rep[i];
                      if (typeof k === 'string') {
                          v = str(k, value);
                          if (v) {
                              partial.push(quote(k) + (gap ? ': ' : ':') + v);
                          }
                      }
                  }
              }
              else {
                  // Otherwise, iterate through all of the keys in the object.
                  for (k in value) {
                      if (Object.prototype.hasOwnProperty.call(value, k)) {
                          v = str(k, value);
                          if (v) {
                              partial.push(quote(k) + (gap ? ': ' : ':') + v);
                          }
                      }
                  }
              }
              
          // Join all of the member texts together, separated with commas,
          // and wrap them in braces.

          v = partial.length === 0 ? '{}' : gap ?
              '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
              '{' + partial.join(',') + '}';
          gap = mind;
          return v;
      }
  }

  var stringify = function (value, replacer, space) {
      var i;
      gap = '';
      indent = '';
      
      // If the space parameter is a number, make an indent string containing that
      // many spaces.
      if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
              indent += ' ';
          }
      }
      // If the space parameter is a string, it will be used as the indent string.
      else if (typeof space === 'string') {
          indent = space;
      }

      // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.
      rep = replacer;
      if (replacer && typeof replacer !== 'function'
      && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
      }
      
      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.
      return str('', {'': value});
  };

  var parse$1 = parse;
  var stringify$1 = stringify;

  var jsonify = {
  	parse: parse$1,
  	stringify: stringify$1
  };

  var json = typeof JSON !== 'undefined' ? JSON : jsonify;

  var jsonStableStringify = function (obj, opts) {
      if (!opts) opts = {};
      if (typeof opts === 'function') opts = { cmp: opts };
      var space = opts.space || '';
      if (typeof space === 'number') space = Array(space+1).join(' ');
      var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
      var replacer = opts.replacer || function(key, value) { return value; };

      var cmp = opts.cmp && (function (f) {
          return function (node) {
              return function (a, b) {
                  var aobj = { key: a, value: node[a] };
                  var bobj = { key: b, value: node[b] };
                  return f(aobj, bobj);
              };
          };
      })(opts.cmp);

      var seen = [];
      return (function stringify (parent, key, node, level) {
          var indent = space ? ('\n' + new Array(level + 1).join(space)) : '';
          var colonSeparator = space ? ': ' : ':';

          if (node && node.toJSON && typeof node.toJSON === 'function') {
              node = node.toJSON();
          }

          node = replacer.call(parent, key, node);

          if (node === undefined) {
              return;
          }
          if (typeof node !== 'object' || node === null) {
              return json.stringify(node);
          }
          if (isArray(node)) {
              var out = [];
              for (var i = 0; i < node.length; i++) {
                  var item = stringify(node, i, node[i], level+1) || json.stringify(null);
                  out.push(indent + space + item);
              }
              return '[' + out.join(',') + indent + ']';
          }
          else {
              if (seen.indexOf(node) !== -1) {
                  if (cycles) return json.stringify('__cycle__');
                  throw new TypeError('Converting circular structure to JSON');
              }
              else seen.push(node);

              var keys = objectKeys(node).sort(cmp && cmp(node));
              var out = [];
              for (var i = 0; i < keys.length; i++) {
                  var key = keys[i];
                  var value = stringify(node, key, node[key], level+1);

                  if(!value) continue;

                  var keyValue = json.stringify(key)
                      + colonSeparator
                      + value;
                  out.push(indent + space + keyValue);
              }
              seen.splice(seen.indexOf(node), 1);
              return '{' + out.join(',') + indent + '}';
          }
      })({ '': obj }, '', obj, 0);
  };

  var isArray = Array.isArray || function (x) {
      return {}.toString.call(x) === '[object Array]';
  };

  var objectKeys = Object.keys || function (obj) {
      var has = Object.prototype.hasOwnProperty || function () { return true };
      var keys = [];
      for (var key in obj) {
          if (has.call(obj, key)) keys.push(key);
      }
      return keys;
  };

  var configSchema = /*#__PURE__*/configuration.ConfigurationSchema("UCSCAdapter", {
    base: {
      type: "fileLocation",
      description: "base URL for the UCSC API",
      defaultValue: {
        uri: "https://api.genome.ucsc.edu"
      }
    },
    track: {
      type: "string",
      description: "the track to select data from",
      defaultValue: ""
    }
  }, {
    explicitlyTyped: true
  });
  function ucscProcessedTranscript(feature) {
    var children = feature.children(); // split the blocks into UTR, CDS, and exons

    var thickStart = feature.get("cdsStart");
    var thickEnd = feature.get("cdsEnd");

    if (!thickStart && !thickEnd) {
      return feature;
    }

    var blocks = children ? children.filter(function (child) {
      return child.get("type") === "block";
    }).sort(function (a, b) {
      return a.get("start") - b.get("start");
    }) : []; // eslint-disable-next-line @typescript-eslint/no-explicit-any

    var newChildren = [];
    blocks.forEach(function (block) {
      var start = block.get("start");
      var end = block.get("end");

      if (thickStart >= end) {
        // left-side UTR
        var prime = feature.get("strand") > 0 ? "five" : "three";
        newChildren.push({
          type: "".concat(prime, "_prime_UTR"),
          start: start,
          end: end
        });
      } else if (thickStart > start && thickStart < end && thickEnd >= end) {
        // UTR | CDS
        var _prime = feature.get("strand") > 0 ? "five" : "three";

        newChildren.push({
          type: "".concat(_prime, "_prime_UTR"),
          start: start,
          end: thickStart
        }, {
          type: "CDS",
          start: thickStart,
          end: end
        });
      } else if (thickStart <= start && thickEnd >= end) {
        // CDS
        newChildren.push({
          type: "CDS",
          start: start,
          end: end
        });
      } else if (thickStart > start && thickStart < end && thickEnd < end) {
        // UTR | CDS | UTR
        var leftPrime = feature.get("strand") > 0 ? "five" : "three";
        var rightPrime = feature.get("strand") > 0 ? "three" : "five";
        newChildren.push({
          type: "".concat(leftPrime, "_prime_UTR"),
          start: start,
          end: thickStart
        }, {
          type: "CDS",
          start: thickStart,
          end: thickEnd
        }, {
          type: "".concat(rightPrime, "_prime_UTR"),
          start: thickEnd,
          end: end
        });
      } else if (thickStart <= start && thickEnd > start && thickEnd < end) {
        // CDS | UTR
        var _prime2 = feature.get("strand") > 0 ? "three" : "five";

        newChildren.push({
          type: "CDS",
          start: start,
          end: thickEnd
        }, {
          type: "".concat(_prime2, "_prime_UTR"),
          start: thickEnd,
          end: end
        });
      } else if (thickEnd <= start) {
        // right-side UTR
        var _prime3 = feature.get("strand") > 0 ? "three" : "five";

        newChildren.push({
          type: "".concat(_prime3, "_prime_UTR"),
          start: start,
          end: end
        });
      }
    }); // eslint-disable-next-line @typescript-eslint/no-explicit-any

    var newData = {};
    feature.tags().forEach(function (tag) {
      newData[tag] = feature.get(tag);
    });
    newData.subfeatures = newChildren;
    newData.type = "mRNA";
    newData.uniqueId = feature.id();
    delete newData.chromStarts;
    delete newData.chromStart;
    delete newData.chromEnd;
    delete newData.chrom;
    delete newData.blockStarts;
    delete newData.blockSizes;
    delete newData.blockCount;
    delete newData.thickStart;
    delete newData.thickEnd;
    var newFeature = new SimpleFeature({
      data: newData,
      id: feature.id()
    });
    return newFeature;
  }
  var AdapterClass = /*#__PURE__*/function (_BaseFeatureDataAdapt) {
    _inherits(AdapterClass, _BaseFeatureDataAdapt);

    var _super = /*#__PURE__*/_createSuper(AdapterClass);

    function AdapterClass(config) {
      var _this;

      _classCallCheck(this, AdapterClass);

      _this = _super.call(this, config);
      _this.config = config;
      return _this;
    }

    _createClass(AdapterClass, [{
      key: "getFeatures",
      value: function getFeatures(region) {
        var _this2 = this;

        var assemblyName = region.assemblyName,
            start = region.start,
            end = region.end,
            refName = region.refName;
        return rxjs.ObservableCreate( /*#__PURE__*/function () {
          var _ref = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee(observer) {
            var _readConfObject, uri, track, result, data;

            return runtime_1.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _readConfObject = configuration.readConfObject(_this2.config, "base"), uri = _readConfObject.uri;
                    track = configuration.readConfObject(_this2.config, "track");
                    _context.prev = 2;
                    _context.next = 5;
                    return fetch("".concat(uri, "/getData/track?") + "genome=".concat(assemblyName, ";track=").concat(track, ";") + "chrom=".concat(refName, ";start=").concat(start, ";end=").concat(end));

                  case 5:
                    result = _context.sent;

                    if (result.ok) {
                      _context.next = 8;
                      break;
                    }

                    throw new Error("Failed to fetch ".concat(result.status, " ").concat(result.statusText));

                  case 8:
                    _context.next = 10;
                    return result.json();

                  case 10:
                    data = _context.sent;
                    data[track].forEach(function (feature) {
                      var data = _objectSpread2(_objectSpread2({}, feature), {}, {
                        start: feature.chromStart || feature.tStart || feature.genoStart || feature.txStart,
                        end: feature.chromEnd || feature.tEnd || feature.genoEnd || feature.txEnd,
                        strand: {
                          "-": -1,
                          "+": 1
                        }[feature.strand] || 0,
                        refName: feature.chrom || feature.genoName || feature.tName,
                        uniqueId: jsonStableStringify(feature)
                      });

                      if (data.blockCount && data.chromStarts) {
                        data.chromStarts = data.chromStarts.split(",").map(function (i) {
                          return +i;
                        });
                        data.blockSizes = data.blockSizes.split(",").map(function (i) {
                          return +i;
                        });
                        data.subfeatures = [];

                        for (var i = 0; i < +data.blockCount; i++) {
                          data.subfeatures.push({
                            start: data.start + data.chromStarts[i],
                            end: data.start + data.chromStarts[i] + data.blockSizes[i]
                          });
                        }

                        observer.next(new SimpleFeature(data));
                      } else if (data.exonCount && data.exonStarts) {
                        var exonStarts = data.exonStarts.split(",").map(function (i) {
                          return +i;
                        });
                        var exonEnds = data.exonEnds.split(",").map(function (i) {
                          return +i;
                        });
                        data.subfeatures = [];

                        for (var _i = 0; _i < data.exonCount; _i++) {
                          data.subfeatures.push({
                            start: exonStarts[_i],
                            end: exonEnds[_i],
                            type: "block"
                          });
                        }

                        delete data.exonStarts;
                        delete data.exonEnds;
                        delete data.exonCount;
                        data = ucscProcessedTranscript(new SimpleFeature(data));
                        observer.next(data);
                      } else {
                        observer.next(new SimpleFeature(data));
                      }
                    });
                    observer.complete();
                    _context.next = 18;
                    break;

                  case 15:
                    _context.prev = 15;
                    _context.t0 = _context["catch"](2);
                    observer.error(_context.t0);

                  case 18:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, null, [[2, 15]]);
          }));

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }());
      }
    }, {
      key: "getRefNames",
      value: function () {
        var _getRefNames = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee2() {
          var arr, i;
          return runtime_1.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  arr = [];

                  for (i = 0; i < 23; i++) {
                    arr.push("chr".concat(i));
                  }

                  return _context2.abrupt("return", arr);

                case 3:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function getRefNames() {
          return _getRefNames.apply(this, arguments);
        }

        return getRefNames;
      }()
    }, {
      key: "freeResources",
      value: function freeResources() {}
    }]);

    return AdapterClass;
  }(BaseAdapter.BaseFeatureDataAdapter);

  var version = "1.0.3";

  var UCSCPlugin = /*#__PURE__*/function (_Plugin) {
    _inherits(UCSCPlugin, _Plugin);

    var _super = /*#__PURE__*/_createSuper(UCSCPlugin);

    function UCSCPlugin() {
      var _this;

      _classCallCheck(this, UCSCPlugin);

      _this = _super.apply(this, arguments);
      _this.name = "UCSCPlugin";
      _this.version = version;
      return _this;
    }

    _createClass(UCSCPlugin, [{
      key: "install",
      value: function install(pluginManager) {
        pluginManager.addAdapterType(function () {
          return new AdapterType({
            name: "UCSCAdapter",
            configSchema: configSchema,
            AdapterClass: AdapterClass
          });
        });
      }
    }]);

    return UCSCPlugin;
  }(Plugin);

  exports.default = UCSCPlugin;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=jbrowse-plugin-ucsc.umd.development.js.map
