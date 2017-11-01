var pSlice = Array.prototype.slice;
var objectKeys = require('./lib/keys.js');
var isArguments = require('./lib/is_arguments.js');

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};

  var equivStack = [{ a: actual, b: expected }];
  while (equivStack.length > 0) {
    var equivOp = equivStack.shift();
    var a = equivOp.a;
    var b = equivOp.b;

    // 7.1. All identical values are equivalent, as determined by ===.
    if (a === b) {
      continue;
    }

    if (a instanceof Date && b instanceof Date) {
      if (a.getTime() === b.getTime()) {
        continue;
      } else {
        return false;
      }
    }

    // 7.3. Other pairs that do not both pass typeof value == 'object',
    // equivalence is determined by ==.
    if (!a || !b || typeof a != 'object' && typeof b != 'object') {
      var equals = opts.strict ? a === b : a == b;
      if (equals) {
        continue;
      } else {
        return false;
      }
    }

    // 7.4. For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical 'prototype' property. Note: this
    // accounts for both named and indexed properties on Arrays.
    var i, key;
    if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) {
      return false;
    }
    // an identical 'prototype' property.
    if (a.prototype !== b.prototype) {
      return false;
    }
    //~~~I've managed to break Object.keys through screwy arguments passing.
    //   Converting to array solves the problem.
    if (isArguments(a)) {
      if (!isArguments(b)) {
        return false;
      }
      a = pSlice.call(a);
      b = pSlice.call(b);
      equivStack.push({ a, b });
      continue;
    }

    if (isBuffer(a)) {
      if (!isBuffer(b)) {
        return false;
      }
      if (a.length !== b.length) return false;
      for (i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }

    try {
      var ka = objectKeys(a),
          kb = objectKeys(b);
    } catch (e) {//happens when one is a string literal and the other isn't
      return false;
    }
    // having the same number of owned properties (keys incorporates
    // hasOwnProperty)
    if (ka.length != kb.length) {
      return false;
    }
    //the same set of keys (although not necessarily the same order),
    ka.sort();
    kb.sort();
    //~~~cheap key test
    for (i = ka.length - 1; i >= 0; i--) {
      if (ka[i] != kb[i]) {
        return false;
      }
    }
    //equivalent values for every corresponding key, and
    //~~~possibly expensive deep test
    for (i = ka.length - 1; i >= 0; i--) {
      key = ka[i];
      equivStack.push({ a: a[key], b: b[key] });
    }
    
    if (typeof a !== typeof b) {
      return false;
    }
  }
  return true;
}
