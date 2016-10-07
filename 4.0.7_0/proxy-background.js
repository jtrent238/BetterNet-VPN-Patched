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

	var proxyEventEmitter = __webpack_require__(2);

	var AWS_URL = 'https://s3-us-west-1.amazonaws.com/bn-configs/extension-v3';
	var RACKSPACE_URL = 'https://e9c0fa7dec7c2c787bf6-84ef1b138c2cd8ee1188837a3412bc14.ssl.cf1.rackcdn.com/extension-v3';

	var defaultProxyConfig = {
	  platform: 'none',
	  vpn_config: {
	    free: [{
	      id: '10001',
	      flag: 'US',
	      title: 'United States',
	      http_address: '987607.biz:443',
	      https_address: '987607.biz:443',
	      username: 'usntrxyqgbi',
	      password: 'zfwjyqrqvrfphenu',
	      connection_policy: {
	        http: 'https',
	        https: 'https'
	      },
	      after_connect_url: 'https://www.betterspot.com/plans?utm_source=chxtn&utm_medium=us&utm_campaign=plan_flow',
	      after_connect_url_chance: 0.5
	    }, {
	      id: '10002',
	      flag: 'UK',
	      title: 'United Kingdom',
	      http_address: 'uk.http.ext.bn.987607.biz:443',
	      https_address: 'uk.http.ext.bn.987607.biz:443',
	      username: 'usntrxyqgbi',
	      password: 'zfwjyqrqvrfphenu',
	      connection_policy: {
	        http: 'https',
	        https: 'https'
	      },
	      after_connect_url: 'https://www.betterspot.com/plans?utm_source=chxtn&utm_medium=uk&utm_campaign=plan_flow',
	      after_connect_url_chance: 0.5
	    }],
	    premium: []
	  }
	};

	// Daily config download timeout
	var downloadTimeout = void 0;

	// set default proxy config
	store.set('proxy', defaultProxyConfig);

	// open after connect url
	proxyEventEmitter.on('enabled', function () {
	  var serverConfig = store.get('selectedServer');
	  if (serverConfig.after_connect_url && serverConfig.after_connect_url_chance > Math.random()) {
	    chrome.tabs.create({ url: serverConfig.after_connect_url });
	  }
	});

	var proxy = {
	  getConfig: function getConfig() {
	    var url = arguments.length <= 0 || arguments[0] === undefined ? AWS_URL : arguments[0];

	    fetch(url).then(function (response) {
	      return response.json();
	    }).then(function (config) {
	      if (!config || !config.vpn_config) {
	        if (url === AWS_URL) {
	          proxy.getConfig(RACKSPACE_URL);
	          return;
	        }
	        config = defaultProxyConfig; // eslint-disable-line
	      }
	      store.set('proxy', config);
	      var proxyConfig = config.vpn_config.free;
	      store.set('selectedServer', proxyConfig[0]);
	    }).catch(function (err) {
	      if (err.status === 0) {
	        chrome.runtime.sendMessage({ error: 'No internet connection' });
	      } else if (err.status >= 400) {
	        chrome.runtime.sendMessage({ error: err.status + ' - ' + err.statusText });
	      }
	    });
	    var configDownloadInterval = 86400000; // 1 day in MS
	    clearTimeout(downloadTimeout);
	    downloadTimeout = setTimeout(proxy.getConfig, configDownloadInterval);
	  },
	  enable: function enable() {
	    store.set('connecting', true);

	    var _store$get = store.get('selectedServer');

	    var id = _store$get.id;

	    var proxyConfig = store.get('proxy').vpn_config.free.find(function (server) {
	      return server.id === id;
	    });

	    if (!proxyConfig) {
	      chrome.runtime.sendMessage({ error: 'Can not get servers list' });
	      return;
	    }

	    // if it was set to false by .disable, i.e. cancel
	    if (!store.get('connecting')) return;

	    var httpParts = proxyConfig.http_address.split(':');
	    var httpConfig = {
	      host: httpParts[0],
	      port: parseInt(httpParts[1], 10),
	      scheme: proxyConfig.connection_policy.http
	    };

	    var httpsParts = proxyConfig.https_address.split(':');
	    var httpsConfig = {
	      host: httpsParts[0],
	      port: parseInt(httpsParts[1], 10),
	      scheme: proxyConfig.connection_policy.https
	    };

	    chrome.proxy.settings.set({
	      value: {
	        mode: 'fixed_servers',
	        rules: {
	          proxyForHttp: httpConfig,
	          proxyForHttps: httpsConfig,
	          bypassList: ['<local>', 'google-analytics.com', '*.google-analytics.com']
	        }
	      },
	      scope: 'regular'
	    });

	    store.set('username', proxyConfig.username);
	    store.set('password', proxyConfig.password);

	    store.set('enabled', true);
	    chrome.runtime.sendMessage({ proxy: 'enabled' });
	    chrome.browserAction.setIcon({ path: 'img/shieldon-active.png' });

	    store.set('connecting', false);
	  },
	  disable: function disable() {
	    chrome.proxy.settings.clear({
	      scope: 'regular'
	    });

	    store.set('connecting', false);
	    store.set('enabled', false);
	    chrome.browserAction.setIcon({ path: 'img/shieldon-deactive.png' });

	    chrome.runtime.sendMessage({ proxy: 'disabled' });
	  },
	  status: function status() {
	    var response = void 0;
	    if (store.get('connecting')) {
	      response = 'connecting';
	    } else {
	      response = store.get('enabled') ? 'enabled' : 'disabled';
	    }
	    chrome.runtime.sendMessage({ status: response });
	  }
	};

	chrome.runtime.onMessage.addListener(function (request) {
	  // We are emitting objects from here that we should not listen to them!
	  if (typeof request !== 'string') return;

	  if (request.indexOf('proxy') === -1) return;

	  var method = request.slice('proxy:'.length);

	  proxy[method]();
	});

	proxy.disable();
	proxy.getConfig();


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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(1);

	var store = _require.store;

	var EventEmitter = __webpack_require__(3);

	var proxy = Object.assign({
	  enable: function enable() {
	    chrome.runtime.sendMessage('proxy:enable');
	  },
	  disable: function disable() {
	    chrome.runtime.sendMessage('proxy:disable');
	  },
	  toggle: function toggle() {
	    if (store.get('enabled')) {
	      this.disable();
	      return false;
	    }
	    this.enable();
	    return true;
	  },
	  status: function status() {
	    chrome.runtime.sendMessage('proxy:status');
	  },


	  _events: {}
	}, EventEmitter.prototype);

	chrome.runtime.onMessage.addListener(function (request) {
	  if (request.status) {
	    proxy.emit('status', request.status);
	    return;
	  }

	  if (request.proxy) {
	    proxy.emit(request.proxy);
	  }
	});

	module.exports = proxy;


/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Light EventEmitter. Ported from Node.js/events.js
	 * Eric Zhang
	 */

	/**
	 * EventEmitter class
	 * Creates an object with event registering and firing methods
	 */
	function EventEmitter() {
	  // Initialise required storage variables
	  this._events = {};
	}

	var isArray = Array.isArray;

	EventEmitter.prototype.addListener = function (type, listener, scope, once) {
	  if ('function' !== typeof listener) {
	    throw new Error('addListener only takes instances of Function');
	  }

	  // To avoid recursion in the case that type == "newListeners"! Before
	  // adding it to the listeners, first emit "newListeners".
	  this.emit('newListener', type, typeof listener.listener === 'function' ? listener.listener : listener);

	  if (!this._events[type]) {
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  } else if (isArray(this._events[type])) {

	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  } else {
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];
	  }
	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function (type, listener, scope) {
	  if ('function' !== typeof listener) {
	    throw new Error('.once only takes instances of Function');
	  }

	  var self = this;
	  function g() {
	    self.removeListener(type, g);
	    listener.apply(this, arguments);
	  };

	  g.listener = listener;
	  self.on(type, g);

	  return this;
	};

	EventEmitter.prototype.removeListener = function (type, listener, scope) {
	  if ('function' !== typeof listener) {
	    throw new Error('removeListener only takes instances of Function');
	  }

	  // does not use listeners(), so no side effect of creating _events[type]
	  if (!this._events[type]) return this;

	  var list = this._events[type];

	  if (isArray(list)) {
	    var position = -1;
	    for (var i = 0, length = list.length; i < length; i++) {
	      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0) return this;
	    list.splice(position, 1);
	    if (list.length == 0) delete this._events[type];
	  } else if (list === listener || list.listener && list.listener === listener) {
	    delete this._events[type];
	  }

	  return this;
	};

	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

	EventEmitter.prototype.removeAllListeners = function (type) {
	  if (arguments.length === 0) {
	    this._events = {};
	    return this;
	  }

	  // does not use listeners(), so no side effect of creating _events[type]
	  if (type && this._events && this._events[type]) this._events[type] = null;
	  return this;
	};

	EventEmitter.prototype.listeners = function (type) {
	  if (!this._events[type]) this._events[type] = [];
	  if (!isArray(this._events[type])) {
	    this._events[type] = [this._events[type]];
	  }
	  return this._events[type];
	};

	EventEmitter.prototype.emit = function (type) {
	  var type = arguments[0];
	  var handler = this._events[type];
	  if (!handler) return false;

	  if (typeof handler == 'function') {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        var l = arguments.length;
	        var args = new Array(l - 1);
	        for (var i = 1; i < l; i++) {
	          args[i - 1] = arguments[i];
	        }handler.apply(this, args);
	    }
	    return true;
	  } else if (isArray(handler)) {
	    var l = arguments.length;
	    var args = new Array(l - 1);
	    for (var i = 1; i < l; i++) {
	      args[i - 1] = arguments[i];
	    }var listeners = handler.slice();
	    for (var i = 0, l = listeners.length; i < l; i++) {
	      listeners[i].apply(this, args);
	    }
	    return true;
	  } else {
	    return false;
	  }
	};

	module.exports = EventEmitter;


/***/ }
/******/ ]);