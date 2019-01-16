// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"../node_modules/events/events.js":[function(require,module,exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}

module.exports = EventEmitter; // Backwards-compat with node 0.10.x

EventEmitter.EventEmitter = EventEmitter;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined; // By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.

EventEmitter.defaultMaxListeners = 10; // Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.

EventEmitter.prototype.setMaxListeners = function (n) {
  if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function (type) {
  var er, handler, len, args, i, listeners;
  if (!this._events) this._events = {}; // If there is no 'error' event listener then throw.

  if (type === 'error') {
    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
      er = arguments[1];

      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];
  if (isUndefined(handler)) return false;

  if (isFunction(handler)) {
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
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;

    for (i = 0; i < len; i++) listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function (type, listener) {
  var m;
  if (!isFunction(listener)) throw TypeError('listener must be a function');
  if (!this._events) this._events = {}; // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".

  if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);
  if (!this._events[type]) // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;else if (isObject(this._events[type])) // If we've already got an array, just append.
    this._events[type].push(listener);else // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener]; // Check for listener leak

  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);

      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function (type, listener) {
  if (!isFunction(listener)) throw TypeError('listener must be a function');
  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);
  return this;
}; // emits a 'removeListener' event iff the listener was removed


EventEmitter.prototype.removeListener = function (type, listener) {
  var list, position, length, i;
  if (!isFunction(listener)) throw TypeError('listener must be a function');
  if (!this._events || !this._events[type]) return this;
  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener || isFunction(list.listener) && list.listener === listener) {
    delete this._events[type];
    if (this._events.removeListener) this.emit('removeListener', type, listener);
  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
        position = i;
        break;
      }
    }

    if (position < 0) return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener) this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function (type) {
  var key, listeners;
  if (!this._events) return this; // not listening for removeListener, no need to emit

  if (!this._events.removeListener) {
    if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
    return this;
  } // emit removeListener for all listeners on all events


  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }

    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
  }

  delete this._events[type];
  return this;
};

EventEmitter.prototype.listeners = function (type) {
  var ret;
  if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function (type) {
  if (this._events) {
    var evlistener = this._events[type];
    if (isFunction(evlistener)) return 1;else if (evlistener) return evlistener.length;
  }

  return 0;
};

EventEmitter.listenerCount = function (emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}
},{}],"../node_modules/domain-browser/source/index.js":[function(require,module,exports) {
// This file should be ES5 compatible

/* eslint prefer-spread:0, no-var:0, prefer-reflect:0, no-magic-numbers:0 */
'use strict';

module.exports = function () {
  // Import Events
  var events = require('events'); // Export Domain


  var domain = {};

  domain.createDomain = domain.create = function () {
    var d = new events.EventEmitter();

    function emitError(e) {
      d.emit('error', e);
    }

    d.add = function (emitter) {
      emitter.on('error', emitError);
    };

    d.remove = function (emitter) {
      emitter.removeListener('error', emitError);
    };

    d.bind = function (fn) {
      return function () {
        var args = Array.prototype.slice.call(arguments);

        try {
          fn.apply(null, args);
        } catch (err) {
          emitError(err);
        }
      };
    };

    d.intercept = function (fn) {
      return function (err) {
        if (err) {
          emitError(err);
        } else {
          var args = Array.prototype.slice.call(arguments, 1);

          try {
            fn.apply(null, args);
          } catch (err) {
            emitError(err);
          }
        }
      };
    };

    d.run = function (fn) {
      try {
        fn();
      } catch (err) {
        emitError(err);
      }

      return this;
    };

    d.dispose = function () {
      this.removeAllListeners();
      return this;
    };

    d.enter = d.exit = function () {
      return this;
    };

    return d;
  };

  return domain;
}.call(this);
},{"events":"../node_modules/events/events.js"}],"js/louis.js":[function(require,module,exports) {
"use strict";

var _domain = require("domain");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

//Var main elements
var tilemap;
var hero;
var lives; //TODO a refaire (interface)
//-----MODELS-----//
//Classe TileMap
//TODO statistiques pour que la partie perde si toute la map est cramée (créer une méthode -> cramée / total des tiles)

var TileMap =
/*#__PURE__*/
function () {
  function TileMap() {
    _classCallCheck(this, TileMap);

    this.grid = new Array(); //create an array (of arrays) to interact with

    for (var row = 0; row < 38; row++) {
      var line = new Array();

      for (var col = 0; col < 18; col++) {
        var tile = oxo.elements.createElement({
          type: 'div',
          class: 'tile',
          styles: {
            height: '40px',
            width: '40px',
            top: col * 40 + 'px',
            left: row * 40 + 'px'
          },
          appendTo: '.contain' // optional

        });
        line.push(tile);
      }

      this.grid.push(line);
    }
  } // méthode pour accéder à une tile (utilisée par la fonction move de bullet)


  _createClass(TileMap, [{
    key: "getTile",
    value: function getTile(x, y) {
      var valx = Math.round(x / 40);
      var valy = Math.round(y / 40);
      var line = this.grid[valx]; //line désigne l'axe x concerné

      if (line == null) {
        //sécurité en cas de outofindex
        return null;
      } else {
        return line[valy];
      }
    }
  }, {
    key: "burnTile",
    value: function burnTile(x, y) {
      var tile = this.getTile(x, y);

      if (tile) {
        //!null et !undefined (sécurité)
        if (!tile.classList.contains("tile--burned")) {
          tile.classList.add("tile--burned");
        }
      }
    }
  }, {
    key: "resetTile",
    value: function resetTile(x, y) {
      var tile = this.getTile(x, y);

      if (tile) {
        tile.classList.remove("tile--burned");
      }
    }
  }]);

  return TileMap;
}();

var Hero =
/*#__PURE__*/
function () {
  function Hero() {
    var _this = this;

    _classCallCheck(this, Hero);

    this.lives = 3;
    this.oxoElement = oxo.elements.createElement({
      type: 'div',
      class: 'hero',
      appendTo: '.contain'
    });
    oxo.animation.moveElementWithArrowKeys(this.oxoElement, 20); //"Viser pour tirer"

    document.querySelector(".contain").addEventListener("click", function (event) {
      //fat arrow pour ne pas changeer de scope
      //previens le comportement de base du click (selection etc... sécurité)
      event.preventDefault(); //TODO Attention la position correspond au coin gauche superieur et non au centre du sprite (/!\ petit bug)

      var oxo_position = oxo.animation.getPosition(_this.oxoElement); // calculs à rajouter pour centrer
      //choisir en cas de diagonale

      var distanceX = Math.abs(oxo_position.x - event.clientX); //event.clientX retourne la position de la souris sur l'axe X (pareil pour Y)

      var distanceY = Math.abs(oxo_position.y - event.clientY);

      if (distanceX > distanceY) {
        if (oxo_position.x < event.clientX) {
          //décicder entre la gauche et la droite
          new Bullet(oxo_position.x, oxo_position.y, "right", false);
        } else {
          new Bullet(oxo_position.x, oxo_position.y, "left", false);
        }
      } else {
        if (oxo_position.y < event.clientY) {
          new Bullet(oxo_position.x, oxo_position.y, "down", false);
        } else {
          new Bullet(oxo_position.x, oxo_position.y, "up", false);
        }
      }
    });
  }

  _createClass(Hero, [{
    key: "takeDamage",
    value: function takeDamage(amount) {
      //TODO fonction non encore utilisée -> à rajouter avec les collisions du feu etc.
      this.lives -= amount;

      if (this.lives <= 0) {
        this.death();
      }
    }
  }, {
    key: "death",
    value: function death() {
      //idem
      console.log("Game Over");
    }
  }]);

  return Hero;
}();

var BadBoy =
/*#__PURE__*/
function () {
  function BadBoy() {
    var _this2 = this;

    _classCallCheck(this, BadBoy);

    this.oxoElement = oxo.elements.createElement({
      type: 'div',
      class: 'badboy',
      styles: {
        transform: //TODO faire spawner sur les côtés plutôt que partout (/!\ mais appliquer cette fonction sur les bonus)
        'translate(' + oxo.utils.getRandomNumber(0, window.innerWidth) + 'px, ' + oxo.utils.getRandomNumber(0, window.innerHeight) + 'px)'
      },
      appendTo: '.contain'
    }); //Movement
    //initialise direction de depart puis randomise

    this.direction = "none";
    this.changeDirection(); //se deplace toute les 50ms

    this.moveInterval = setInterval(function () {
      _this2.move();
    }, 50); //change de direction toute les 2000ms

    this.changeDirectionInterval = setInterval(function () {
      _this2.changeDirection();
    }, 2000);
    this.shootInterval = setInterval(function () {
      _this2.shoot();
    }, 2000);
  } //Move the enemy


  _createClass(BadBoy, [{
    key: "move",
    value: function move() {
      if (this.direction != "none") {
        //au cas où
        oxo.animation.move(this.oxoElement, this.direction, 5); // Move 5px
      }
    } // Change the direction

  }, {
    key: "changeDirection",
    value: function changeDirection() {
      var array = ['up', 'down', 'left', 'right'];
      this.direction = array[oxo.utils.getRandomNumber(0, array.length - 1)];
    }
  }, {
    key: "shoot",
    value: function shoot() {
      var oxo_position = oxo.animation.getPosition(this.oxoElement); //position initiale

      var array = ['up', 'down', 'left', 'right'];
      var dir = array[oxo.utils.getRandomNumber(0, array.length - 1)];
      new Bullet(oxo_position.x, oxo_position.y, dir, true);
    } //TODO: A relier au collision avec les balles

  }, {
    key: "death",
    value: function death() {
      clearInterval(this.moveInterval); //il ne faut pas oublier de clear tous les interval quand on détruit un objet !! (ex. pour les bonus)

      clearInterval(this.changeDirectionInterval);
      clearInterval(this.shootInterval);
      this.oxoElement.remove(); //supprimer du HTML

      destroyObj(this); //set this à null (cf fin du code)
    }
  }]);

  return BadBoy;
}(); // Balle d'eau ou de feu


var Bullet =
/*#__PURE__*/
function () {
  function Bullet(posx, posy, direction, isFire) {
    var _this3 = this;

    _classCallCheck(this, Bullet);

    this.oxoElement = oxo.elements.createElement({
      type: 'div',
      class: isFire ? "fireball" : "waterball",
      styles: {
        transform: 'translate(' + posx + 'px, ' + posy + 'px)'
      },
      appendTo: '.contain'
    });
    this.direction = direction;
    this.isFire = isFire; // distance parcourue

    this.traveldistance = 0;
    this.moveInterval = setInterval(function () {
      _this3.move();
    }, 50); //50ms
  }

  _createClass(Bullet, [{
    key: "move",
    value: function move() {
      // "déplacement" de la balle
      this.traveldistance += 10;
      oxo.animation.move(this.oxoElement, this.direction, 10); //10px

      var oxo_position = oxo.animation.getPosition(this.oxoElement); //TODO Idem prblm centrer

      if (this.isFire) tilemap.burnTile(oxo_position.x, oxo_position.y);else tilemap.resetTile(oxo_position.x, oxo_position.y);

      if (this.traveldistance > 500) {
        //distance maximum à parcourir 500px
        this.killBullet();
      }
    }
  }, {
    key: "killBullet",
    value: function killBullet() {
      clearInterval(this.moveInterval);
      this.oxoElement.remove();
      destroyObj(this);
    }
  }]);

  return Bullet;
}(); //Fonctions
// Entrer dans le jeu après avoir tapé enter


oxo.inputs.listenKey('enter', function () {
  if (oxo.screens.getCurrentScreen() === '') {
    oxo.screens.loadScreen('game', startGame);
  }
}); //Game init

function startGame() {
  tilemap = new TileMap();
  hero = new Hero();
  setInterval(function () {
    new BadBoy();
  }, 5000); //un badboy sauvage apparaît toutes les 5sec

  lives = document.querySelector('.lives');
  displayLife(hero.lives);
}

; //fonction nombre de vie

function displayLife(lifeNumber) {
  lives.innerHTML = '';

  for (var i = 0; i < lifeNumber; i++) {
    lives.innerHTML += "<3"; //TODO à modifier (sprites)
  }
}

function setLinks() {
  //TODO modifier les links et virer la div 'ul' (utiliser les boutons etc.)
  document.querySelectorAll("li").forEach(function (li) {
    li.addEventListener("click", function () {
      oxo.screens.loadScreen(this.innerHTML, function () {
        setLinks();
      });
    });
  });
}

oxo.screens.loadScreen('home', function () {
  setLinks();
}); //SET objects to null

function destroyObj(obj) {
  obj = null;
}
},{"domain":"../node_modules/domain-browser/source/index.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "49955" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/louis.js"], null)
//# sourceMappingURL=/louis.52c3aa71.map