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

	var proxy = __webpack_require__(1);

	var _require = __webpack_require__(2);

	var store = _require.store;

	var error = __webpack_require__(4);

	var _require2 = __webpack_require__(5);

	var animate = _require2.animate;
	var stop = _require2.stop;


	var manifest = chrome.runtime.getManifest();
	var connect = document.getElementById('connect');
	var logo = document.getElementById('logo');
	var notification = document.getElementById('notification');
	var contact = document.getElementById('contact');
	var links = document.querySelectorAll('.main-page a, footer a');
	var locationsCloseButton = document.querySelector('.locations-page .close');
	var locationButton = document.querySelector('.location button');
	var locationsList = document.querySelector('.locations-list ul');

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
	  var _loop = function _loop() {
	    var link = _step.value;

	    link.addEventListener('click', function (e) {
	      e.preventDefault();

	      chrome.tabs.create({
	        url: link.href
	      });
	    });
	  };

	  for (var _iterator = links[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	    _loop();
	  }
	} catch (err) {
	  _didIteratorError = true;
	  _iteratorError = err;
	} finally {
	  try {
	    if (!_iteratorNormalCompletion && _iterator.return) {
	      _iterator.return();
	    }
	  } finally {
	    if (_didIteratorError) {
	      throw _iteratorError;
	    }
	  }
	}

	var DISCONNECTED = 0;
	var CONNECTED = 1;
	var CONNECTING = 2;

	var state = DISCONNECTED;

	var states = {
	  disconnected: function disconnected() {
	    connect.textContent = 'Connect';
	    connect.dataset.analyticsId = 'Connect';

	    logo.classList.remove('play');
	    logo.classList.add('disconnected');
	    logo.classList.remove('active');

	    state = DISCONNECTED;
	    stop();
	  },
	  connected: function connected() {
	    connect.textContent = 'Disconnect';
	    connect.dataset.analyticsId = 'Disconnect';

	    logo.classList.remove('play');
	    logo.classList.remove('disconnected');
	    logo.classList.add('active');

	    state = CONNECTED;
	    stop();
	  },
	  connecting: function connecting() {
	    connect.textContent = 'Cancel';
	    connect.dataset.analyticsId = 'Cancel';

	    logo.classList.add('play');
	    logo.classList.remove('disconnected');
	    logo.classList.remove('active');

	    state = CONNECTING;
	    animate();
	  }
	};

	proxy.on('status', function (status) {
	  if (status === 'enabled') {
	    states.connected();
	    store.set('connecting', false);
	  } else if (status === 'connecting') {
	    states.connecting();
	  } else {
	    states.disconnected();
	  }
	});

	proxy.status();

	connect.addEventListener('click', function () {
	  if (state !== DISCONNECTED) {
	    proxy.disable();

	    states.disconnected();
	    return;
	  }

	  states.connecting();

	  proxy.enable();

	  store.set('connecting', true);
	});

	proxy.on('enabled', function () {
	  states.connected();

	  store.set('connecting', false);
	});

	proxy.on('disabled', function () {
	  states.disconnected();

	  chrome.browserAction.setIcon({ path: 'img/shieldon-deactive.png' });
	  store.set('connecting', false);
	});

	var NOTIFICATION_DELAY = 5000;
	var retry = 0;
	error.on('error', function (err) {
	  connect.textContent = 'Retry';

	  logo.classList.remove('play');
	  logo.classList.remove('active');

	  if (retry < 4) {
	    logo.classList.remove('retry' + (retry - 1));
	    logo.classList.add('retry' + retry++);
	  } else {
	    contact.classList.add('active');
	  }

	  notification.textContent = err;

	  notification.classList.add('active');

	  setTimeout(function () {
	    notification.classList.remove('active');
	  }, NOTIFICATION_DELAY);
	});

	function generateLocationsList() {
	  var locations = store.get('proxy').vpn_config.free;
	  var selectedServer = store.get('selectedServer');
	  locationsList.innerHTML = '';

	  var _iteratorNormalCompletion2 = true;
	  var _didIteratorError2 = false;
	  var _iteratorError2 = undefined;

	  try {
	    for (var _iterator2 = locations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	      var server = _step2.value;

	      var locationLinkElement = document.createElement('a');
	      var locationListItemElement = document.createElement('li');
	      var locationIconElement = document.createElement('i');
	      var locationSpanElement = document.createElement('span');

	      locationLinkElement.href = '#';
	      locationIconElement.classList.add('flag', server.flag);
	      locationSpanElement.innerHTML = server.title;

	      locationLinkElement.dataset.serverId = server.id;
	      locationIconElement.dataset.serverId = server.id;
	      locationSpanElement.dataset.serverId = server.id;
	      locationListItemElement.dataset.serverId = server.id;

	      locationLinkElement.dataset.analyticsId = 'Location-Choose-' + server.id;
	      locationIconElement.dataset.analyticsId = 'Location-Choose-' + server.id;
	      locationSpanElement.dataset.analyticsId = 'Location-Choose-' + server.id;
	      locationListItemElement.dataset.analyticsId = 'Location-Choose-' + server.id;

	      if (server.id === selectedServer.id) {
	        locationListItemElement.classList.add('active');
	      }

	      locationLinkElement.appendChild(locationIconElement);
	      locationLinkElement.appendChild(locationSpanElement);
	      locationListItemElement.appendChild(locationLinkElement);

	      locationsList.appendChild(locationListItemElement);
	    }
	  } catch (err) {
	    _didIteratorError2 = true;
	    _iteratorError2 = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion2 && _iterator2.return) {
	        _iterator2.return();
	      }
	    } finally {
	      if (_didIteratorError2) {
	        throw _iteratorError2;
	      }
	    }
	  }
	}

	function showMainPage() {
	  var mainPage = document.querySelector('.main-page');
	  var locationsPage = document.querySelector('.locations-page');

	  var _store$get = store.get('selectedServer');

	  var flag = _store$get.flag;
	  var title = _store$get.title;

	  locationButton.innerHTML = '';
	  var currentlocationIcon = document.createElement('i');
	  var currentlocationTitle = document.createElement('span');
	  currentlocationIcon.classList.add('flag', flag);
	  currentlocationTitle.innerHTML = title;
	  locationButton.appendChild(currentlocationIcon);
	  locationButton.appendChild(currentlocationTitle);

	  var footerVersionElement = document.querySelector('footer small');
	  footerVersionElement.innerHTML = 'v' + manifest.version;

	  mainPage.classList.remove('hidden');
	  mainPage.classList.add('visible');

	  locationsPage.classList.remove('visible');
	  locationsPage.classList.add('hidden');
	}

	function showLocationsPage() {
	  generateLocationsList();

	  var mainPage = document.querySelector('.main-page');
	  var locationsPage = document.querySelector('.locations-page');

	  mainPage.classList.remove('visible');
	  mainPage.classList.add('hidden');

	  locationsPage.classList.remove('hidden');
	  locationsPage.classList.add('visible');
	}

	function changeLocation(e) {
	  if (!['a', 'i', 'span', 'li'].includes(e.target.tagName.toLowerCase())) {
	    return;
	  }

	  e.preventDefault();

	  var selectedServerId = e.target.dataset.serverId;

	  var locations = store.get('proxy').vpn_config.free;
	  var selectedServer = locations.find(function (location) {
	    return location.id === selectedServerId;
	  });

	  var previousSelectedServer = store.get('selectedServer');
	  store.set('selectedServer', selectedServer);
	  showMainPage();
	  if (state !== DISCONNECTED && JSON.stringify(selectedServer) !== JSON.stringify(previousSelectedServer)) {
	    // eslint-disable-line
	    proxy.disable();
	    states.connecting();
	    store.set('connecting', true);
	    setTimeout(function () {
	      proxy.enable();
	    }, 1000);
	  }
	}

	locationsCloseButton.addEventListener('click', showMainPage);
	locationButton.addEventListener('click', showLocationsPage);
	locationsList.addEventListener('click', changeLocation);

	showMainPage();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(2);

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
/* 2 */
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


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var EventEmitter = __webpack_require__(3);

	module.exports = new EventEmitter();


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var TWEEN = __webpack_require__(6);

	var _document$querySelect = document.querySelectorAll('.logo i');

	var _document$querySelect2 = _slicedToArray(_document$querySelect, 2);

	var big = _document$querySelect2[0];
	var small = _document$querySelect2[1];


	var DELAY = 600;

	var smallTween = void 0,
	    bigTween = void 0;

	exports.animate = function animate() {
	  if (!smallTween || !bigTween) {
	    smallTween = createTween(small);
	    bigTween = createTween(big);
	  }

	  smallTween.start();
	  setTimeout(function () {
	    bigTween.start();
	  }, DELAY);
	};

	exports.stop = function stop() {
	  if (!smallTween || !bigTween) return;

	  setTimeout(function () {
	    smallTween.stop();
	    bigTween.stop();
	  }, DELAY);
	};

	var UP_DURATION = 870;
	var DOWN_DURATION = 980;
	var createTween = function createTween(target) {
	  var start = { scale: 1 };

	  var up = new TWEEN.Tween(start).to({ scale: 1.1 }, UP_DURATION).onUpdate(function () {
	    target.style.transform = 'scale(' + this.scale + ')';
	  }).easing(scaleUp);

	  var down = new TWEEN.Tween(start).to({ scale: 1 }, DOWN_DURATION).onUpdate(function () {
	    target.style.transform = 'scale(' + this.scale + ')';
	  }).easing(scaleDown);

	  var cancel = false;
	  function repeat() {
	    if (cancel) {
	      setTimeout(function () {
	        down.start();
	      }, 5);
	      return;
	    }

	    setTimeout(function () {
	      down.start();
	    }, UP_DURATION - 100);

	    setTimeout(function () {
	      up.start();
	      repeat();
	    }, UP_DURATION + DOWN_DURATION - 50);
	  };

	  up.onStart(repeat);
	  up.onStop(function () {
	    cancel = true;
	  });

	  return up;
	};

	requestAnimationFrame(loop);

	function loop(time) {
	  TWEEN.update(time);
	  requestAnimationFrame(loop);
	}

	window.a = 1;
	window.p = 230;

	var scaleDown = function scaleDown(input) {
	  // let p = 0.6, a = 1.2;

	  if (input === 0 || input === 1) return input;

	  var s = p / Math.PI * Math.asin(1 / a);
	  return a * Math.pow(2, -4 * input) * Math.sin((input * DOWN_DURATION - s) * Math.PI / p) + 1;
	};

	var scaleUp = function scaleUp(input) {
	  if ((input /= 0.5) < 1) {
	    return 0.5 * Math.pow(input, 3);
	  }

	  return 0.5 * ((input -= 2) * Math.pow(input, 2) + 2);
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Tween.js - Licensed under the MIT license
	 * https://github.com/tweenjs/tween.js
	 * ----------------------------------------------
	 *
	 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
	 * Thank you all, you're awesome!
	 */

	// Include a performance.now polyfill
	(function () {

		if ('performance' in window === false) {
			window.performance = {};
		}

		// IE 8
		Date.now = (Date.now || function () {
			return new Date().getTime();
		});

		if ('now' in window.performance === false) {
			var offset = window.performance.timing && window.performance.timing.navigationStart ? window.performance.timing.navigationStart
			                                                                                    : Date.now();

			window.performance.now = function () {
				return Date.now() - offset;
			};
		}

	})();

	var TWEEN = TWEEN || (function () {

		var _tweens = [];

		return {

			getAll: function () {

				return _tweens;

			},

			removeAll: function () {

				_tweens = [];

			},

			add: function (tween) {

				_tweens.push(tween);

			},

			remove: function (tween) {

				var i = _tweens.indexOf(tween);

				if (i !== -1) {
					_tweens.splice(i, 1);
				}

			},

			update: function (time) {

				if (_tweens.length === 0) {
					return false;
				}

				var i = 0;

				time = time !== undefined ? time : window.performance.now();

				while (i < _tweens.length) {

					if (_tweens[i].update(time)) {
						i++;
					} else {
						_tweens.splice(i, 1);
					}

				}

				return true;

			}
		};

	})();

	TWEEN.Tween = function (object) {

		var _object = object;
		var _valuesStart = {};
		var _valuesEnd = {};
		var _valuesStartRepeat = {};
		var _duration = 1000;
		var _repeat = 0;
		var _yoyo = false;
		var _isPlaying = false;
		var _reversed = false;
		var _delayTime = 0;
		var _startTime = null;
		var _easingFunction = TWEEN.Easing.Linear.None;
		var _interpolationFunction = TWEEN.Interpolation.Linear;
		var _chainedTweens = [];
		var _onStartCallback = null;
		var _onStartCallbackFired = false;
		var _onUpdateCallback = null;
		var _onCompleteCallback = null;
		var _onStopCallback = null;

		// Set all starting values present on the target object
		for (var field in object) {
			_valuesStart[field] = parseFloat(object[field], 10);
		}

		this.to = function (properties, duration) {

			if (duration !== undefined) {
				_duration = duration;
			}

			_valuesEnd = properties;

			return this;

		};

		this.start = function (time) {

			TWEEN.add(this);

			_isPlaying = true;

			_onStartCallbackFired = false;

			_startTime = time !== undefined ? time : window.performance.now();
			_startTime += _delayTime;

			for (var property in _valuesEnd) {

				// Check if an Array was provided as property value
				if (_valuesEnd[property] instanceof Array) {

					if (_valuesEnd[property].length === 0) {
						continue;
					}

					// Create a local copy of the Array with the start value at the front
					_valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

				}

				// If `to()` specifies a property that doesn't exist in the source object,
				// we should not set that property in the object
				if (_valuesStart[property] === undefined) {
					continue;
				}

				_valuesStart[property] = _object[property];

				if ((_valuesStart[property] instanceof Array) === false) {
					_valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
				}

				_valuesStartRepeat[property] = _valuesStart[property] || 0;

			}

			return this;

		};

		this.stop = function () {

			if (!_isPlaying) {
				return this;
			}

			TWEEN.remove(this);
			_isPlaying = false;

			if (_onStopCallback !== null) {
				_onStopCallback.call(_object);
			}

			this.stopChainedTweens();
			return this;

		};

		this.stopChainedTweens = function () {

			for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
				_chainedTweens[i].stop();
			}

		};

		this.delay = function (amount) {

			_delayTime = amount;
			return this;

		};

		this.repeat = function (times) {

			_repeat = times;
			return this;

		};

		this.yoyo = function (yoyo) {

			_yoyo = yoyo;
			return this;

		};


		this.easing = function (easing) {

			_easingFunction = easing;
			return this;

		};

		this.interpolation = function (interpolation) {

			_interpolationFunction = interpolation;
			return this;

		};

		this.chain = function () {

			_chainedTweens = arguments;
			return this;

		};

		this.onStart = function (callback) {

			_onStartCallback = callback;
			return this;

		};

		this.onUpdate = function (callback) {

			_onUpdateCallback = callback;
			return this;

		};

		this.onComplete = function (callback) {

			_onCompleteCallback = callback;
			return this;

		};

		this.onStop = function (callback) {

			_onStopCallback = callback;
			return this;

		};

		this.update = function (time) {

			var property;
			var elapsed;
			var value;

			if (time < _startTime) {
				return true;
			}

			if (_onStartCallbackFired === false) {

				if (_onStartCallback !== null) {
					_onStartCallback.call(_object);
				}

				_onStartCallbackFired = true;

			}

			elapsed = (time - _startTime) / _duration;
			elapsed = elapsed > 1 ? 1 : elapsed;

			value = _easingFunction(elapsed);

			for (property in _valuesEnd) {

				// Don't update properties that do not exist in the source object
				if (_valuesStart[property] === undefined) {
					continue;
				}

				var start = _valuesStart[property] || 0;
				var end = _valuesEnd[property];

				if (end instanceof Array) {

					_object[property] = _interpolationFunction(end, value);

				} else {

					// Parses relative end values with start as base (e.g.: +10, -3)
					if (typeof (end) === 'string') {

						if (end.startsWith('+') || end.startsWith('-')) {
							end = start + parseFloat(end, 10);
						} else {
							end = parseFloat(end, 10);
						}
					}

					// Protect against non numeric properties.
					if (typeof (end) === 'number') {
						_object[property] = start + (end - start) * value;
					}

				}

			}

			if (_onUpdateCallback !== null) {
				_onUpdateCallback.call(_object, value);
			}

			if (elapsed === 1) {

				if (_repeat > 0) {

					if (isFinite(_repeat)) {
						_repeat--;
					}

					// Reassign starting values, restart by making startTime = now
					for (property in _valuesStartRepeat) {

						if (typeof (_valuesEnd[property]) === 'string') {
							_valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property], 10);
						}

						if (_yoyo) {
							var tmp = _valuesStartRepeat[property];

							_valuesStartRepeat[property] = _valuesEnd[property];
							_valuesEnd[property] = tmp;
						}

						_valuesStart[property] = _valuesStartRepeat[property];

					}

					if (_yoyo) {
						_reversed = !_reversed;
					}

					_startTime = time + _delayTime;

					return true;

				} else {

					if (_onCompleteCallback !== null) {
						_onCompleteCallback.call(_object);
					}

					for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
						// Make the chained tweens start exactly at the time they should,
						// even if the `update()` method was called way past the duration of the tween
						_chainedTweens[i].start(_startTime + _duration);
					}

					return false;

				}

			}

			return true;

		};

	};


	TWEEN.Easing = {

		Linear: {

			None: function (k) {

				return k;

			}

		},

		Quadratic: {

			In: function (k) {

				return k * k;

			},

			Out: function (k) {

				return k * (2 - k);

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k;
				}

				return - 0.5 * (--k * (k - 2) - 1);

			}

		},

		Cubic: {

			In: function (k) {

				return k * k * k;

			},

			Out: function (k) {

				return --k * k * k + 1;

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k * k;
				}

				return 0.5 * ((k -= 2) * k * k + 2);

			}

		},

		Quartic: {

			In: function (k) {

				return k * k * k * k;

			},

			Out: function (k) {

				return 1 - (--k * k * k * k);

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k * k * k;
				}

				return - 0.5 * ((k -= 2) * k * k * k - 2);

			}

		},

		Quintic: {

			In: function (k) {

				return k * k * k * k * k;

			},

			Out: function (k) {

				return --k * k * k * k * k + 1;

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return 0.5 * k * k * k * k * k;
				}

				return 0.5 * ((k -= 2) * k * k * k * k + 2);

			}

		},

		Sinusoidal: {

			In: function (k) {

				return 1 - Math.cos(k * Math.PI / 2);

			},

			Out: function (k) {

				return Math.sin(k * Math.PI / 2);

			},

			InOut: function (k) {

				return 0.5 * (1 - Math.cos(Math.PI * k));

			}

		},

		Exponential: {

			In: function (k) {

				return k === 0 ? 0 : Math.pow(1024, k - 1);

			},

			Out: function (k) {

				return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

			},

			InOut: function (k) {

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				if ((k *= 2) < 1) {
					return 0.5 * Math.pow(1024, k - 1);
				}

				return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

			}

		},

		Circular: {

			In: function (k) {

				return 1 - Math.sqrt(1 - k * k);

			},

			Out: function (k) {

				return Math.sqrt(1 - (--k * k));

			},

			InOut: function (k) {

				if ((k *= 2) < 1) {
					return - 0.5 * (Math.sqrt(1 - k * k) - 1);
				}

				return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

			}

		},

		Elastic: {

			In: function (k) {

				var s;
				var a = 0.1;
				var p = 0.4;

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				if (!a || a < 1) {
					a = 1;
					s = p / 4;
				} else {
					s = p * Math.asin(1 / a) / (2 * Math.PI);
				}

				return - (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));

			},

			Out: function (k) {

				var s;
				var a = 0.1;
				var p = 0.4;

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				if (!a || a < 1) {
					a = 1;
					s = p / 4;
				} else {
					s = p * Math.asin(1 / a) / (2 * Math.PI);
				}

				return (a * Math.pow(2, - 10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);

			},

			InOut: function (k) {

				var s;
				var a = 0.1;
				var p = 0.4;

				if (k === 0) {
					return 0;
				}

				if (k === 1) {
					return 1;
				}

				if (!a || a < 1) {
					a = 1;
					s = p / 4;
				} else {
					s = p * Math.asin(1 / a) / (2 * Math.PI);
				}

				if ((k *= 2) < 1) {
					return - 0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
				}

				return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;

			}

		},

		Back: {

			In: function (k) {

				var s = 1.70158;

				return k * k * ((s + 1) * k - s);

			},

			Out: function (k) {

				var s = 1.70158;

				return --k * k * ((s + 1) * k + s) + 1;

			},

			InOut: function (k) {

				var s = 1.70158 * 1.525;

				if ((k *= 2) < 1) {
					return 0.5 * (k * k * ((s + 1) * k - s));
				}

				return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

			}

		},

		Bounce: {

			In: function (k) {

				return 1 - TWEEN.Easing.Bounce.Out(1 - k);

			},

			Out: function (k) {

				if (k < (1 / 2.75)) {
					return 7.5625 * k * k;
				} else if (k < (2 / 2.75)) {
					return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
				} else if (k < (2.5 / 2.75)) {
					return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
				} else {
					return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
				}

			},

			InOut: function (k) {

				if (k < 0.5) {
					return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
				}

				return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

			}

		}

	};

	TWEEN.Interpolation = {

		Linear: function (v, k) {

			var m = v.length - 1;
			var f = m * k;
			var i = Math.floor(f);
			var fn = TWEEN.Interpolation.Utils.Linear;

			if (k < 0) {
				return fn(v[0], v[1], f);
			}

			if (k > 1) {
				return fn(v[m], v[m - 1], m - f);
			}

			return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

		},

		Bezier: function (v, k) {

			var b = 0;
			var n = v.length - 1;
			var pw = Math.pow;
			var bn = TWEEN.Interpolation.Utils.Bernstein;

			for (var i = 0; i <= n; i++) {
				b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
			}

			return b;

		},

		CatmullRom: function (v, k) {

			var m = v.length - 1;
			var f = m * k;
			var i = Math.floor(f);
			var fn = TWEEN.Interpolation.Utils.CatmullRom;

			if (v[0] === v[m]) {

				if (k < 0) {
					i = Math.floor(f = m * (1 + k));
				}

				return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

			} else {

				if (k < 0) {
					return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
				}

				if (k > 1) {
					return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
				}

				return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

			}

		},

		Utils: {

			Linear: function (p0, p1, t) {

				return (p1 - p0) * t + p0;

			},

			Bernstein: function (n, i) {

				var fc = TWEEN.Interpolation.Utils.Factorial;

				return fc(n) / fc(i) / fc(n - i);

			},

			Factorial: (function () {

				var a = [1];

				return function (n) {

					var s = 1;

					if (a[n]) {
						return a[n];
					}

					for (var i = n; i > 1; i--) {
						s *= i;
					}

					a[n] = s;
					return s;

				};

			})(),

			CatmullRom: function (p0, p1, p2, p3, t) {

				var v0 = (p2 - p0) * 0.5;
				var v1 = (p3 - p1) * 0.5;
				var t2 = t * t;
				var t3 = t * t2;

				return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

			}

		}

	};

	// UMD (Universal Module Definition)
	(function (root) {

		if (true) {

			// AMD
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
				return TWEEN;
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

		} else if (typeof module !== 'undefined' && typeof exports === 'object') {

			// Node.js
			module.exports = TWEEN;

		} else if (root !== undefined) {

			// Global variable
			root.TWEEN = TWEEN;

		}

	})(this);


/***/ }
/******/ ]);