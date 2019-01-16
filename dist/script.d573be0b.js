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
})({"js/script.js":[function(require,module,exports) {
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

//Var main elements
var tilemap;
var hero;
var livesEl;
var badboys = []; //-----OBJECTS-----//
//TILEMAP CLASS//

var TileMap =
/*#__PURE__*/
function () {
  function TileMap() {
    _classCallCheck(this, TileMap);

    this.grid = new Array(); //create an array (of arrays) to interact with

    for (var row = 0; row < 38; row++) {
      //create the map
      var line = new Array();

      for (var col = 0; col < 18; col++) {
        var tile = oxo.elements.createElement({
          type: "div",
          class: "tile",
          styles: {
            height: "40px",
            width: "40px",
            top: col * 40 + "px",
            left: row * 40 + "px"
          },
          appendTo: ".map"
        });
        line.push(tile);
      }

      this.grid.push(line);
    }
  } // method to get a tile (after burnTile or resetTile)


  _createClass(TileMap, [{
    key: "getTile",
    value: function getTile(x, y) {
      var valx = Math.round(x / 40);
      var valy = Math.round(y / 40);
      var line = this.grid[valx]; //line is the x axe

      if (line == null) {
        //security in case of outofindex
        return null;
      } else {
        return line[valy];
      }
    } //tile--burned

  }, {
    key: "burnTile",
    value: function burnTile(x, y) {
      var tile = this.getTile(x, y);

      if (tile) {
        //!null and !undefined (security)
        if (!tile.classList.contains("tile--burned")) {
          tile.classList.add("tile--burned");
        }
      }
    } //reset tile

  }, {
    key: "resetTile",
    value: function resetTile(x, y) {
      var tile = this.getTile(x, y);

      if (tile && tile.classList.contains("tile--burned")) {
        tile.classList.remove("tile--burned");
        oxo.player.addToScore(100);
      }
    }
  }]);

  return TileMap;
}(); //HERO CLASS//


var Hero = function Hero() {
  var _this = this;

  _classCallCheck(this, Hero);

  this.lives = 5;
  this.oxoElement = oxo.elements.createElement({
    type: "div",
    class: "hero",
    appendTo: ".map"
  });
  oxo.animation.moveElementWithArrowKeys(this.oxoElement, 20); //method to target and shoot

  document.querySelector(".contain").addEventListener("click", function (event) {
    //fat arrow to stay in the correct scope
    event.preventDefault(); //security to remove the click behaviour (select, etc.)

    var oxo_position = oxo.animation.getPosition(_this.oxoElement); //choose in case of diagonal

    var distanceX = Math.abs(oxo_position.x - event.clientX); //event.clientX return the cursor position (on X)

    var distanceY = Math.abs(oxo_position.y - event.clientY); //event.clientY return the cursor position (on Y)

    if (distanceX > distanceY) {
      //decide between left and right
      if (oxo_position.x < event.clientX) {
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
}; //BADBOY CLASS//


var BadBoy =
/*#__PURE__*/
function () {
  function BadBoy() {
    var _this2 = this;

    _classCallCheck(this, BadBoy);

    this.oxoElement = oxo.elements.createElement({
      type: "div",
      class: "badboy",
      styles: {
        transform: "translate(" + oxo.utils.getRandomNumber(0, window.innerWidth) + "px, " + oxo.utils.getRandomNumber(0, window.innerHeight) + "px)"
      },
      appendTo: ".map"
    });
    badboys.push(this); //Movement//
    //initialize the direction, then randomize

    this.direction = "none";
    this.changeDirection(); //move every 100ms

    this.moveInterval = setInterval(function () {
      _this2.move();
    }, 100); //change the direction every 2000ms

    this.changeDirectionInterval = setInterval(function () {
      _this2.changeDirection();
    }, 2000);
    this.shootInterval = setInterval(function () {
      _this2.shoot();
    }, 4000); //cause damage when colliding with hero

    oxo.elements.onCollisionWithElement(hero.oxoElement, this.oxoElement, function () {
      displayLife(--hero.lives);

      if (hero.lives === 0) {
        oxo.screens.loadScreen("end", death);
      }
    });
  } //Move the enemy


  _createClass(BadBoy, [{
    key: "move",
    value: function move() {
      if (this.direction != "none") {
        //security
        oxo.animation.move(this.oxoElement, this.direction, 5); // Move 5px
      }
    } // Change the direction

  }, {
    key: "changeDirection",
    value: function changeDirection() {
      var array = ["up", "down", "left", "right"];
      this.direction = array[oxo.utils.getRandomNumber(0, array.length - 1)];
    } // shoot randomly

  }, {
    key: "shoot",
    value: function shoot() {
      var oxo_position = oxo.animation.getPosition(this.oxoElement); //initial position

      var array = ["up", "down", "left", "right"];
      var dir = array[oxo.utils.getRandomNumber(0, array.length - 1)];
      new Bullet(oxo_position.x, oxo_position.y, dir, true);
    }
  }]);

  return BadBoy;
}(); //BULLET CLASS - FIREBALL OR WATERBALL//


var Bullet =
/*#__PURE__*/
function () {
  function Bullet(posx, posy, direction, isFire) {
    var _this3 = this;

    _classCallCheck(this, Bullet);

    this.oxoElement = oxo.elements.createElement({
      type: "div",
      class: isFire ? "fireball" : "waterball",
      styles: {
        transform: "translate(" + posx + "px, " + posy + "px)"
      },
      appendTo: ".map"
    });
    this.direction = direction;
    this.isFire = isFire; //Target of the bullet
    //Hero is touched

    if (isFire) {
      oxo.elements.onCollisionWithElement(this.oxoElement, hero.oxoElement, function () {
        displayLife(--hero.lives);

        if (hero.lives === 0) {
          oxo.screens.loadScreen("end", death);
        }
      }); //Badboy is dead
    } else {
      badboys.forEach(function (badboy) {
        oxo.elements.onCollisionWithElement(_this3.oxoElement, badboy.oxoElement, function () {
          oxo.player.addToScore(150);
          badboy.oxoElement.remove();
          clearInterval(badboy.moveInterval); //do not forget to clear all intervals when destroying an object

          clearInterval(badboy.changeDirectionInterval);
          clearInterval(badboy.shootInterval);
          badboy.oxoElement.remove(); //remove from HTML

          destroyObj(this); //set it to null (end of code)
        });
      });
    } // Prevent infinite travel distance


    this.traveldistance = 0;
    this.moveInterval = setInterval(function () {
      _this3.move();
    }, 50, true); //50ms
  }

  _createClass(Bullet, [{
    key: "move",
    value: function move() {
      // "movement" of the bullet
      this.traveldistance += 10;
      oxo.animation.move(this.oxoElement, this.direction, 10); //10px

      var oxo_position = oxo.animation.getPosition(this.oxoElement);
      if (this.isFire) tilemap.burnTile(oxo_position.x, oxo_position.y); //interaction with the map
      else tilemap.resetTile(oxo_position.x, oxo_position.y);

      if (this.traveldistance > 500) {
        //max distance is 500 px
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
}(); //-----FONCTIONS-----//
// Start the game when pressing enter


oxo.inputs.listenKey("enter", function () {
  if (oxo.screens.getCurrentScreen() === "") {
    oxo.screens.loadScreen("game", startGame);
  }
}); //Game init

function startGame() {
  tilemap = new TileMap();
  hero = new Hero();
  oxo.player.setScore(0);
  setInterval(function () {
    new BadBoy();
  }, 3000); //a wild badboy appears every 3s

  livesEl = document.querySelector(".lives");
  displayLife(hero.lives); //go back to menu

  document.querySelector(".info--menuBtn").addEventListener("click", function () {
    oxo.screens.loadScreen("home", function () {});
  });
} //life counter


function displayLife(lifeNumber) {
  livesEl.innerHTML = "";

  for (var i = 0; i < lifeNumber; i++) {
    livesEl.innerHTML += '<div class="heart" />';
  }
}

function setLinks() {
  document.querySelector(".returnBtn").addEventListener("click", function () {
    oxo.screens.loadScreen("home", function () {});
  });
} //lose when the map is burned


var countTiliBurned = 0;
setInterval(function () {
  countTiliBurned = document.querySelectorAll(".tile--burned").length;

  if (countTiliBurned > 138) {
    //20% of the map
    death();
  }
}, 5000);

function death() {
  oxo.screens.loadScreen("end", setLinks);
  oxo.player.getScore();
  clearInterval(BadBoy.moveInterval);
  clearInterval(BadBoy.changeDirectionInterval);
  clearInterval(BadBoy.shootInterval);
  BadBoy.oxoElement.remove();
  destroyObj(BadBoy);
} //SET objects to null


function destroyObj(obj) {
  obj = null;
}
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60998" + '/');

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
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/script.js"], null)
//# sourceMappingURL=/script.d573be0b.map