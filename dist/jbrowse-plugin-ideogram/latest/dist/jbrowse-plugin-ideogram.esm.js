import PauseIcon from '@material-ui/icons/Pause';
import Plugin from '@jbrowse/core/Plugin';
import { parseLocString, when, getSession, isAbstractMenuManager } from '@jbrowse/core/util';
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType';
import WidgetType from '@jbrowse/core/pluggableElementTypes/WidgetType';
import React, { useState, Suspense, useRef, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import Ideogram from 'ideogram';
import { v4 } from 'uuid';
import AssemblySelector from '@jbrowse/core/ui/AssemblySelector';
import { FileSelector } from '@jbrowse/core/ui';
import { Dialog, DialogTitle, IconButton, Divider, DialogContent, DialogActions, Button, makeStyles, Container, Grid, Typography, FormControlLabel, Checkbox, TextField, MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Link, TablePagination, Paper, Chip, Tooltip } from '@material-ui/core';
import { openLocation } from '@jbrowse/core/util/io';
import HelpIcon from '@material-ui/icons/Help';
import CloseIcon from '@material-ui/icons/Close';
import PulseLoader from 'react-spinners/PulseLoader';
import { BaseCard, FeatureDetails } from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail';
import { ConfigurationSchema } from '@jbrowse/core/configuration';
import { ElementId } from '@jbrowse/core/util/types/mst';
import { types } from 'mobx-state-tree';
import { TreeView, TreeItem } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import VisibilityIcon from '@material-ui/icons/Visibility';
import SvgIcon from '@material-ui/core/SvgIcon';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import TableChartIcon from '@material-ui/icons/TableChart';

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

var version = "1.2.3";

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
            return openLocation(location).readFile('utf8');

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
            session = getSession(model);
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
            return when(function () {
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
            session = getSession(model);
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
            _session = getSession(model);
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
            loc = parseLocString(locString, function (refName) {
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
            return when(function () {
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
            session = getSession(model);

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

var useStyles = /*#__PURE__*/makeStyles(function (theme) {
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
  return /*#__PURE__*/React.createElement(Dialog, {
    open: true,
    maxWidth: "xl",
    onClose: handleClose
  }, /*#__PURE__*/React.createElement(DialogTitle, null, "How to use annotations files", handleClose ? /*#__PURE__*/React.createElement(IconButton, {
    "data-testid": "close-resultsDialog",
    className: classes.closeButton,
    onClick: function onClick() {
      handleClose();
    }
  }, /*#__PURE__*/React.createElement(CloseIcon, null)) : null), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(DialogContent, null, /*#__PURE__*/React.createElement("h3", null, "General"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "annotations must be uploaded as a TSV with column headers"), /*#__PURE__*/React.createElement("li", null, "enforced location data must be under a heading called", ' ', /*#__PURE__*/React.createElement("code", null, "genomeLocation"), " and be in the format of 'chromosomeNumber:start-end', e.g. '1:39895426-39902013'"), /*#__PURE__*/React.createElement("li", null, "alternatively, annotation files provided without genome location data will attempt to be cross referenced with a remote file of gene locations"), /*#__PURE__*/React.createElement("li", null, "each row of data must include ", /*#__PURE__*/React.createElement("code", null, "name"))), /*#__PURE__*/React.createElement("h3", null, "External Links"), "Any external links that wish to be formatted on the widget properly must be in the following format:", /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "under a header ", /*#__PURE__*/React.createElement("code", null, "externalLinks")), /*#__PURE__*/React.createElement("li", null, "a JSON string appearing as follows:", ' ', /*#__PURE__*/React.createElement("code", null, '"[{"name": "MYLINK", "link": "https://my-link.com/"}]"')), /*#__PURE__*/React.createElement("li", null, "each annotation that you wish to have external links to must have this json string"), /*#__PURE__*/React.createElement("li", null, "multiple external links are permitted")), /*#__PURE__*/React.createElement("h3", null, "Colours and Categorization"), "Annotations can be categorized into two categories if the 'tier' header is within the TSV.", /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "tier 1 is annotated in blue"), /*#__PURE__*/React.createElement("li", null, "tier 2 is annotated in red"), /*#__PURE__*/React.createElement("li", null, "this field is to be provided as a 1 or a 2")), /*#__PURE__*/React.createElement("h3", null, "Examples"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "TSV with only required headers", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("code", null, "name", /*#__PURE__*/React.createElement("br", null), "note1", /*#__PURE__*/React.createElement("br", null), "note2")), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("li", null, "TSV with optional headers", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("code", null, "name\tgenomeLocation\ttier\texternalLinks", /*#__PURE__*/React.createElement("br", null), "note1\t1:39895426-39902013\t1\t", "[{\"name\":\"MYLINK\",\"link\":\"https://my-link.com/note1\"}]", /*#__PURE__*/React.createElement("br", null), "note2\t1:157573749-157598080\t2\t", "[{\"name\":\"MYLINK\",\"link\":\"https://my-link.com/note2\"}]")))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(DialogActions, null, /*#__PURE__*/React.createElement(Button, {
    onClick: function onClick() {
      return handleClose();
    },
    color: "primary"
  }, "Close")));
}

var useStyles$1 = /*#__PURE__*/makeStyles(function (theme) {
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
var RegionSelector = /*#__PURE__*/observer(function (_ref) {
  var _onChange = _ref.onChange,
      selected = _ref.selected;
  var classes = useStyles$1();
  var error = regions.length ? '' : 'No configured regions';
  return /*#__PURE__*/React.createElement(TextField, {
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
    return /*#__PURE__*/React.createElement(MenuItem, {
      key: name,
      value: name
    }, name);
  }));
});
/**
 * Most layout and logic retrieved from the '@jbrowse/plugin/linear-genome-view/../ImportForm.tsx' component and modified for
 * the purposes of this component
 */

var ImportForm = /*#__PURE__*/observer(function (_ref2) {
  var model = _ref2.model;
  var classes = useStyles$1();
  var session = getSession(model);
  var assemblyNames = session.assemblyNames;

  var _useState = useState(assemblyNames[0]),
      _useState2 = _slicedToArray(_useState, 2),
      selectedAsm = _useState2[0],
      setSelectedAsm = _useState2[1];

  var _useState3 = useState(regions[0]),
      _useState4 = _slicedToArray(_useState3, 2),
      selectedRegion = _useState4[0],
      setSelectedRegion = _useState4[1];

  var _useState5 = useState(model.withReactome),
      _useState6 = _slicedToArray(_useState5, 2),
      checked = _useState6[0],
      setChecked = _useState6[1];

  var _useState7 = useState(false),
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

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Container, {
    className: classes.importFormContainer
  }, /*#__PURE__*/React.createElement(Grid, {
    container: true,
    spacing: 1,
    justifyContent: "center",
    alignItems: "center"
  }, /*#__PURE__*/React.createElement(Grid, {
    item: true
  }, /*#__PURE__*/React.createElement(AssemblySelector, {
    onChange: function onChange(val) {
      setSelectedAsm(val);
    },
    session: session,
    selected: selectedAsm
  })), /*#__PURE__*/React.createElement(Grid, {
    item: true
  }, /*#__PURE__*/React.createElement(RegionSelector, {
    onChange: function onChange(val) {
      setSelectedRegion(val);
    },
    selected: selectedRegion
  })), /*#__PURE__*/React.createElement(Grid, {
    item: true
  }, /*#__PURE__*/React.createElement(Button, {
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
  }, "Open"), /*#__PURE__*/React.createElement(Button, {
    disabled: !selectedRegion,
    className: classes.button,
    onClick: function onClick() {
      handleOpenAllRegions(selectedAsm);
    },
    variant: "contained",
    color: "secondary"
  }, "Show all regions in assembly")))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(Container, {
    className: classes.importFormContainer
  }, /*#__PURE__*/React.createElement(Grid, {
    container: true,
    spacing: 1,
    justifyContent: "center",
    alignItems: "center",
    direction: "column"
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "body2"
  }, /*#__PURE__*/React.createElement("b", null, "Optional:"), " provide a .tsv file of gene annotations for the ideogram.", /*#__PURE__*/React.createElement(IconButton, {
    onClick: function onClick() {
      return setHelpDialogDisplayed(true);
    }
  }, /*#__PURE__*/React.createElement(HelpIcon, null))), /*#__PURE__*/React.createElement(Grid, {
    item: true
  }, /*#__PURE__*/React.createElement(FileSelector, {
    name: "Annotations file",
    location: model.annotationsLocation,
    setLocation: function setLocation(loc) {
      return model.setAnnotationsLocation(loc);
    }
  })), /*#__PURE__*/React.createElement(Grid, {
    item: true
  }, /*#__PURE__*/React.createElement(FormControlLabel, {
    label: "Analyze annotations with Reactome",
    control: /*#__PURE__*/React.createElement(Checkbox, {
      checked: checked,
      color: "primary",
      onChange: handleReactomeAnalysis
    })
  })))), isHelpDialogDisplayed ? /*#__PURE__*/React.createElement(Suspense, {
    fallback: /*#__PURE__*/React.createElement("div", null)
  }, /*#__PURE__*/React.createElement(HelpDialog, {
    handleClose: function handleClose() {
      return setHelpDialogDisplayed(false);
    }
  })) : null);
});

var useStyles$2 = /*#__PURE__*/makeStyles(function () {
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

  var _useState = useState(0),
      _useState2 = _slicedToArray(_useState, 2),
      page = _useState2[0],
      setPage = _useState2[1];

  var _useState3 = useState(5),
      _useState4 = _slicedToArray(_useState3, 2),
      rowsPerPage = _useState4[0],
      setRowsPerPage = _useState4[1];

  var _useState5 = useState({
    name: ''
  }),
      _useState6 = _slicedToArray(_useState5, 2),
      selected = _useState6[0],
      setSelected = _useState6[1];

  var handleClick = function handleClick(event, pathway) {
    setSelected(pathway);
    var toHighlight = [];
    var session = getSession(model);
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


  return /*#__PURE__*/React.createElement(BaseCard, {
    title: "Pathways"
  }, /*#__PURE__*/React.createElement(TableContainer, {
    className: classes.tableContainer
  }, /*#__PURE__*/React.createElement(Table, {
    className: classes.table
  }, /*#__PURE__*/React.createElement(TableHead, null, /*#__PURE__*/React.createElement(TableRow, null, headers.map(function (header, index) {
    return /*#__PURE__*/React.createElement(TableCell, {
      key: "".concat(index, "-").concat(header)
    }, header);
  }))), /*#__PURE__*/React.createElement(TableBody, null, pathways.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(function (pathway, key) {
    var isItemSelected = isSelected(pathway);
    return /*#__PURE__*/React.createElement(TableRow, {
      key: key,
      onClick: function onClick(event) {
        return handleClick(event, pathway);
      },
      selected: isItemSelected
    }, /*#__PURE__*/React.createElement(TableCell, null, /*#__PURE__*/React.createElement(Link, {
      target: "_blank",
      rel: "noopener",
      underline: "always",
      href: "https://reactome.org/content/detail/".concat(pathway.stId)
    }, pathway.name)), /*#__PURE__*/React.createElement(TableCell, {
      align: "right"
    }, pathway.entities.found), /*#__PURE__*/React.createElement(TableCell, {
      align: "right"
    }, pathway.entities.total), /*#__PURE__*/React.createElement(TableCell, {
      align: "right"
    }, pathway.entities.ratio.toExponential(2)), /*#__PURE__*/React.createElement(TableCell, {
      align: "right"
    }, pathway.entities.pValue.toExponential(2)), /*#__PURE__*/React.createElement(TableCell, {
      align: "right"
    }, pathway.entities.fdr.toExponential(2)), /*#__PURE__*/React.createElement(TableCell, {
      align: "right"
    }, pathway.reactions.found), /*#__PURE__*/React.createElement(TableCell, {
      align: "right"
    }, pathway.reactions.total), /*#__PURE__*/React.createElement(TableCell, {
      align: "right"
    }, pathway.reactions.ratio.toFixed(3)));
  })))), /*#__PURE__*/React.createElement(TablePagination, {
    rowsPerPageOptions: [5, 10, 25],
    component: "div",
    count: pathways.length,
    rowsPerPage: rowsPerPage,
    page: page,
    onPageChange: handleChangePage,
    onRowsPerPageChange: handleChangeRowsPerPage
  }));
}

var Pathways$1 = /*#__PURE__*/observer(Pathways);

var iter = 0;
var IdeogramView = /*#__PURE__*/observer(function (_ref) {
  var model = _ref.model;
  var ref = useRef(null);
  var identifier = useMemo(function () {
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
    var session = getSession(model);
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
  useEffect(function () {
    if (ref.current) {
      return new Ideogram(config);
    }
  }, [model.sex, model.orientation, model.pliody, model.showImportForm, model.allRegions, model.region, model.showAnnotations, model.showLoading, model.isAnalysisResults, model.selectedAnnot, model.highlightedAnnots]);
  useEffect(function () {
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
  return /*#__PURE__*/React.createElement("div", null, model.showImportForm && !model.isAnalysisResults ? /*#__PURE__*/React.createElement(ImportForm, {
    model: model
  }) : null, !model.showImportForm && model.showLoading && !model.isAnalysisResults ? /*#__PURE__*/React.createElement(Grid, {
    container: true,
    spacing: 1,
    justifyContent: "center",
    alignItems: "center",
    style: {
      paddingTop: '5px'
    },
    direction: "column"
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "body1"
  }, "Generating annotations"), /*#__PURE__*/React.createElement(PulseLoader, {
    color: "#0D233F",
    speedMultiplier: 0.5,
    size: 10
  })) : null, !model.showImportForm && !model.showLoading && !model.isAnalysisResults && model.orientation === 'horizontal' ? /*#__PURE__*/React.createElement(Grid, {
    container: true,
    spacing: 1,
    justifyContent: "center",
    alignItems: "center"
  }, /*#__PURE__*/React.createElement("div", {
    ref: ref,
    id: identifier
  })) : null, !model.showImportForm && !model.showLoading && !model.isAnalysisResults && model.orientation === 'vertical' ? /*#__PURE__*/React.createElement("div", {
    ref: ref,
    id: identifier,
    style: {
      paddingTop: '5px'
    }
  }) : null, model.isAnalysisResults && model.pathways ? /*#__PURE__*/React.createElement(Pathways$1, {
    model: model,
    pathways: model.pathways
  }) : null, !model.isAnalysisResults ? /*#__PURE__*/React.createElement(Typography, {
    variant: "caption",
    style: {
      paddingLeft: '4px',
      paddingBottom: '4px'
    }
  }, "Powered by", ' ', /*#__PURE__*/React.createElement(Link, {
    href: "https://eweitz.github.io/ideogram/"
  }, "ideogram.js"), ".") : null);
});

var useStyles$3 = /*#__PURE__*/makeStyles(function () {
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

var ExternalLink = /*#__PURE__*/observer(function (props) {
  var classes = useStyles$3();
  var id = props.id,
      name = props.name,
      link = props.link;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TableRow, {
    key: "".concat(id, "-").concat(name)
  }, /*#__PURE__*/React.createElement(TableCell, null, name), /*#__PURE__*/React.createElement(TableCell, null, /*#__PURE__*/React.createElement(Link, {
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
  return /*#__PURE__*/React.createElement(BaseCard, {
    title: "External Links"
  }, /*#__PURE__*/React.createElement("div", {
    className: classes.tableContainer
  }, /*#__PURE__*/React.createElement(Table, {
    className: classes.table
  }, /*#__PURE__*/React.createElement(TableBody, null, externalLinkArray.map(function (externalLink, key) {
    return /*#__PURE__*/React.createElement(ExternalLink, Object.assign({
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
  return /*#__PURE__*/React.createElement(BaseCard, {
    title: "Synonyms"
  }, /*#__PURE__*/React.createElement("div", {
    className: classes.tableContainer
  }, /*#__PURE__*/React.createElement(Table, {
    className: classes.table
  }, /*#__PURE__*/React.createElement(TableBody, null, /*#__PURE__*/React.createElement(TableRow, {
    key: "".concat(feature.geneId, "-synonyms")
  }, /*#__PURE__*/React.createElement(TableCell, null, synonyms.map(function (synonym, key) {
    return /*#__PURE__*/React.createElement(Chip, {
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
  return /*#__PURE__*/React.createElement(BaseCard, {
    title: "Navigate to feature on linear genome view"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
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
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Link, {
    className: classes.link,
    target: "_blank",
    rel: "noopener",
    href: "https://reactome.org/PathwayBrowser/#/".concat(node.stId, "&FLG=").concat(node.name),
    underline: "always"
  }, node.name), model.hasPlugin('ReactomePlugin') ? /*#__PURE__*/React.createElement(Tooltip, {
    title: "Open pathway in Reactome Plugin"
  }, /*#__PURE__*/React.createElement(IconButton, {
    color: "primary",
    component: "span",
    onClick: function onClick() {
      openReactomeView(node.stId, pathways, node.name, geneName, model);
    }
  }, /*#__PURE__*/React.createElement(MenuOpenIcon, null))) : null);
}

function Hierarchy(props) {
  var hierarchy = props.hierarchy,
      model = props.model,
      pathways = props.pathways,
      geneName = props.geneName;

  var renderTree = function renderTree(nodes) {
    return /*#__PURE__*/React.createElement(TreeItem, {
      key: nodes.stId,
      nodeId: nodes.stId,
      label: /*#__PURE__*/React.createElement(ReactomeItem, {
        node: nodes,
        model: model,
        pathways: pathways,
        geneName: geneName
      })
    }, Array.isArray(nodes.children) ? nodes.children.map(function (node) {
      return renderTree(node);
    }) : null);
  };

  return /*#__PURE__*/React.createElement(BaseCard, {
    title: "Reactome Annotated Pathways"
  }, /*#__PURE__*/React.createElement(TreeView, {
    defaultCollapseIcon: /*#__PURE__*/React.createElement(ExpandMoreIcon, null),
    defaultExpandIcon: /*#__PURE__*/React.createElement(ChevronRightIcon, null)
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

  return /*#__PURE__*/React.createElement(Paper, {
    "data-testid": "ideo-widget"
  }, /*#__PURE__*/React.createElement(FeatureDetails, Object.assign({
    feature: fullFeature
  }, props, {
    omit: ['synonyms', 'externalLinks', 'pathways', 'reactomeIds', 'hierarchy']
  })), /*#__PURE__*/React.createElement(NavLink, {
    feature: fullFeature,
    model: model
  }), fullFeature.externalLinks && /*#__PURE__*/React.createElement(ExternalLinks, {
    feature: fullFeature
  }), fullFeature.synonyms && /*#__PURE__*/React.createElement(Synonyms, {
    feature: fullFeature
  }), ((_fullFeature$hierarch = fullFeature.hierarchy) === null || _fullFeature$hierarch === void 0 ? void 0 : _fullFeature$hierarch.length) > 0 && /*#__PURE__*/React.createElement(Hierarchy, {
    hierarchy: fullFeature.hierarchy,
    model: model,
    pathways: fullFeature.pathways,
    geneName: fullFeature.name
  }));
}

var ReactComponent = /*#__PURE__*/observer(IdeoFeatureDetails);

var IdeogramFeatureWidgetF = (function (pluginManager) {
  var configSchema = ConfigurationSchema('IdeogramFeatureWidget', {});
  var stateModel = types.model('IdeogramFeatureWidget', {
    id: ElementId,
    type: types.literal('IdeogramFeatureWidget'),
    featureData: types.frozen({}),
    view: types.safeReference(pluginManager.pluggableMstType('view', 'stateModel'))
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

function AlignHorizontalLeftIcon(props) {
  return /*#__PURE__*/React.createElement(SvgIcon, Object.assign({}, props), /*#__PURE__*/React.createElement("path", {
    d: "M4,22H2V2h2V22z M22,7H6v3h16V7z M16,14H6v3h10V14z"
  }));
}
function MaleIcon(props) {
  return /*#__PURE__*/React.createElement(SvgIcon, Object.assign({}, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.5,11c1.93,0,3.5,1.57,3.5,3.5S11.43,18,9.5,18S6,16.43,6,14.5S7.57,11,9.5,11z M9.5,9C6.46,9,4,11.46,4,14.5 S6.46,20,9.5,20s5.5-2.46,5.5-5.5c0-1.16-0.36-2.23-0.97-3.12L18,7.42V10h2V4h-6v2h2.58l-3.97,3.97C11.73,9.36,10.66,9,9.5,9z"
  }));
}
function HourglassIcon(props) {
  return /*#__PURE__*/React.createElement(SvgIcon, Object.assign({}, props), /*#__PURE__*/React.createElement("path", {
    d: "M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"
  }));
}

function IdeogramView$1(pluginManager) {
  return types.model('IdeogramView', {
    type: types.literal('IdeogramView'),
    displayName: types.maybe(types.string),
    id: ElementId,
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
    annotationsLocation: types.optional(types.frozen(), {
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
        var session = getSession(self);
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
      if (isAbstractMenuManager(pluginManager.rootModel)) {
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

export default IdeogramPlugin;
//# sourceMappingURL=jbrowse-plugin-ideogram.esm.js.map
