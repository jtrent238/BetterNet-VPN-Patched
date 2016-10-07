'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

module.exports = {
  store: {
    set: function set(key, value) {
      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
        value = JSON.stringify(value);
      }

      localStorage.setItem(key, value);
    },
    get: function get(key) {
      var result = localStorage.getItem(key);

      try {
        result = JSON.parse(result);
      } catch (e) {
        // NOTHING :|
      }

      if (!isNaN(parseFloat(result))) {
        result = parseFloat(result);
      }

      if (result === 'false') result = false;
      if (result === 'true') result = true;

      return result;
    }
  }
};
