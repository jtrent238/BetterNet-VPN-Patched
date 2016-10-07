'use strict';

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-57049247-2']);
_gaq.push(['_trackPageview']);

setTimeout(function () {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'ga.js';

  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
}, 2000);

function trackClick(element) {
  _gaq.push(['_trackEvent', element.dataset.analyticsId, 'Click']);
}

document.addEventListener('click', function (e) {
  var element = e.target;
  if (element.dataset.analyticsId) {
    trackClick(element);
  }
});
