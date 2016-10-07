/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(1);

	var store = _require.store;


	chrome.webRequest.onAuthRequired.addListener(function (details, callback) {
	  var username = store.get('username');
	  var password = store.get('password');
	  var enabled = store.get('enabled');

	  if (!details.isProxy || details.realm !== 'VIT' || !enabled) {
	    callback();
	    return;
	  }

	  callback({ authCredentials: { username: username, password: password } });
	}, {
	  urls: ['<all_urls>']
	}, ['asyncBlocking']);


/***/ },
/* 1 */
/***/ function(module, exports) {

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


/***/ }
/******/ ]);