"use strict";

var views = {
  startingView: "HelloWorldView",
  _: "./src/views/",
  //root path to the views directory
  list: {
    GoodbyeWorldView: {
      src: "GoodbyeWorldView.html"
    },
    HelloWorldView: {
      src: "HelloWorldView.html"
    } //Same as for components.
    //You can call router.setView(nameOfTheViewDefinedInThisList) and change the view.

  }
};
var components = {
  _: "./src/components/",
  //root path to the components directory
  list: {
    h: {
      src: "h.html"
    },
    HelloWorld: {
      src: "HelloWorld.html"
    },
    GoodbyeWorld: {
      src: "GoodbyeWorld.html"
    } // HelloWorld - tag name that will be overwritten with the html of the source file
    // HelloWorld.html - is the html file that contains the component html

  },
  styles: {},
  //Leave empty
  parse: function parse(componentName) {
    var _this = this;

    var componentPath, componentData, componentText;
    return regeneratorRuntime.async(function parse$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (isDefined(document.querySelector(componentName))) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return", true);

          case 2:
            if (!isDefined(this.list[componentName])) {
              _context2.next = 14;
              break;
            }

            componentPath = this.list[componentName].src;
            console.log("Parsing", componentPath);
            _context2.next = 7;
            return regeneratorRuntime.awrap(fetch(this._ + componentPath));

          case 7:
            componentData = _context2.sent;
            _context2.next = 10;
            return regeneratorRuntime.awrap(componentData.text());

          case 10:
            componentText = _context2.sent;
            document.querySelectorAll(componentName).forEach(function _callee(x) {
              var generatedId, i, _i;

              return regeneratorRuntime.async(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      if (!true) {
                        _context.next = 8;
                        break;
                      }

                      generatedId = Math.round(Math.random() * 1000);

                      if (exportData._.includes(generatedId)) {
                        _context.next = 6;
                        break;
                      }

                      exportData._.push(generatedId);

                      exportData[generatedId] = {
                        _id: generatedId,
                        componentName: componentName
                      };
                      return _context.abrupt("break", 8);

                    case 6:
                      _context.next = 0;
                      break;

                    case 8:
                      x.outerHTML = componentText;
                      i = 0;

                    case 10:
                      if (!(isDefined(document.querySelector('import')) && i < 5)) {
                        _context.next = 16;
                        break;
                      }

                      _context.next = 13;
                      return regeneratorRuntime.awrap(_this["import"]());

                    case 13:
                      i++;
                      _context.next = 10;
                      break;

                    case 16:
                      for (_i = 0; isDefined(document.querySelector("script[local]")) && _i < 5; _i++) {
                        document.querySelectorAll("script[local]").forEach(function (x) {
                          eval(x.innerHTML);
                          x.remove();
                        });
                      }

                    case 17:
                    case "end":
                      return _context.stop();
                  }
                }
              });
            });
            _context2.next = 15;
            break;

          case 14:
            throw "There is no entry for ".concat(componentName, " in the component list");

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, null, this);
  },
  run: function run() {
    var _i2, _Object$keys, component, componentName;

    return regeneratorRuntime.async(function run$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _i2 = 0, _Object$keys = Object.keys(this.list);

          case 1:
            if (!(_i2 < _Object$keys.length)) {
              _context3.next = 9;
              break;
            }

            component = _Object$keys[_i2];
            componentName = component;
            _context3.next = 6;
            return regeneratorRuntime.awrap(this.parse(componentName));

          case 6:
            _i2++;
            _context3.next = 1;
            break;

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, null, this);
  },
  "import": function _import() {
    var _this2 = this;

    return regeneratorRuntime.async(function _import$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            return _context5.abrupt("return", new Promise(function (done) {
              document.querySelectorAll('import').forEach(function _callee2(x) {
                var type, src, force, fixed, cssLink, componentsList, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, componentName;

                return regeneratorRuntime.async(function _callee2$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        type = x.getAttribute('type').trim();
                        src = x.getAttribute('src').trim();
                        _context4.t0 = type;
                        _context4.next = _context4.t0 === "css" ? 5 : _context4.t0 === "components" ? 10 : _context4.t0 === "component" ? 10 : _context4.t0 === "js" ? 40 : 41;
                        break;

                      case 5:
                        force = isDefined(x.getAttribute('force'));
                        fixed = isDefined(x.getAttribute('fixed'));
                        console.log(force, fixed);

                        if (!isDefined(_this2.styles[src]) || force) {
                          cssLink = document.querySelector('html').querySelector("[href='".concat(src, "']"));

                          if (force && isDefined(cssLink)) {
                            cssLink.remove();
                          }

                          document.querySelector('head').insertAdjacentHTML('beforeend', "<link type=\"text/css\" rel=\"stylesheet\" href=".concat(src, ">"));
                          _this2.styles[src] = {
                            fixed: fixed
                          };
                        }

                        return _context4.abrupt("break", 42);

                      case 10:
                        componentsList = src.split(" ");
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context4.prev = 14;
                        _iterator = componentsList[Symbol.iterator]();

                      case 16:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                          _context4.next = 25;
                          break;
                        }

                        componentName = _step.value;
                        console.log("Component Import ", componentName);
                        componentName = componentName.trim();
                        _context4.next = 22;
                        return regeneratorRuntime.awrap(_this2.parse(componentName));

                      case 22:
                        _iteratorNormalCompletion = true;
                        _context4.next = 16;
                        break;

                      case 25:
                        _context4.next = 31;
                        break;

                      case 27:
                        _context4.prev = 27;
                        _context4.t1 = _context4["catch"](14);
                        _didIteratorError = true;
                        _iteratorError = _context4.t1;

                      case 31:
                        _context4.prev = 31;
                        _context4.prev = 32;

                        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                          _iterator["return"]();
                        }

                      case 34:
                        _context4.prev = 34;

                        if (!_didIteratorError) {
                          _context4.next = 37;
                          break;
                        }

                        throw _iteratorError;

                      case 37:
                        return _context4.finish(34);

                      case 38:
                        return _context4.finish(31);

                      case 39:
                        return _context4.abrupt("break", 42);

                      case 40:
                        return _context4.abrupt("break", 42);

                      case 41:
                        return _context4.abrupt("break", 42);

                      case 42:
                        x.remove();
                        done();

                      case 44:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, null, null, [[14, 27, 31, 39], [32,, 34, 38]]);
              });
            }));

          case 1:
          case "end":
            return _context5.stop();
        }
      }
    });
  }
};
router = {
  setView: function setView(name) {
    var viewData;
    return regeneratorRuntime.async(function setView$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!isDefined(views.list[name])) {
              _context6.next = 11;
              break;
            }

            _context6.next = 3;
            return regeneratorRuntime.awrap(fetch(views._ + views.list[name].src));

          case 3:
            viewData = _context6.sent;
            _context6.next = 6;
            return regeneratorRuntime.awrap(viewData.text());

          case 6:
            document.querySelector("body").innerHTML = _context6.sent;
            exportData = {
              _: []
            };
            Object.entries(components.styles).forEach(function (x) {
              if (!x[1].fixed) {
                delete components.styles[x[0]];
                var cssLink = document.querySelector('html').querySelector("[href='".concat(x[0], "']"));
                if (isDefined(cssLink)) cssLink.remove();
              }
            });
            components.run();
            return _context6.abrupt("return", true);

          case 11:
            throw "There is no entry for ".concat(name, " in the views list");

          case 12:
          case "end":
            return _context6.stop();
        }
      }
    });
  }
};

function exportLocal(obj) {
  console.log('called');

  var lastId = exportData._.slice(-1);

  exportData[lastId].data = obj;
}

var isDefined = function isDefined(el) {
  if (typeof el == "undefined" || el == null) return false;else return true;
};

window.onload = function _callee3(event) {
  return regeneratorRuntime.async(function _callee3$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          router.setView(views.startingView);

        case 1:
        case "end":
          return _context7.stop();
      }
    }
  });
};