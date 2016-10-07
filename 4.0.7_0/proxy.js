'use strict';

var _require = require('./store');

var store = _require.store;

var EventEmitter = require('./EventEmitter');

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
