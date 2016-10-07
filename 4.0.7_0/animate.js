'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var TWEEN = require('tween.js');

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
