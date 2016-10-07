"use strict";

exports.pac = function pac(address, chrome) {
  function FindProxyForURL(url, host) {
    if (isPlainHostName(host) || isInNet(dnsResolve(host), "127.0.0.0", "127.0.0.255") || isInNet(dnsResolve(host), "10.0.0.0", "10.0.0.255") || isInNet(dnsResolve(host), "172.16.0.0", "172.16.255.255") || isInNet(dnsResolve(host), "192.168.0.0", "192.168.255.255") || shExpMatch(url, "https://s3-us-west-1.amazonaws.com/bn-configs/extension_ping/direct") || shExpMatch(url, "https://s3.amazonaws.com/*") || shExpMatch(url, "https://betternet-backend.herokuapp.com/*")) {
      return 'DIRECT';
    }

    return 'PROXY $http$';
  }

  var fn = FindProxyForURL.toString().replace('$http$', address);

  if (chrome) return fn;
  return 'data:text/javascript,' + encodeURIComponent(fn);
};
