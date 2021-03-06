/*
 * Uploadcare (0.6.4.2)
 * Date: 2013-02-28 14:42:30 +0200
 * Rev: ec71afec7d
 */
;(function(uploadcare){(function() {

  window.uploadcare || (window.uploadcare = {});

  uploadcare.namespace = function(path, fn) {
    var first, part, parts, rest, target, _i, _len;
    parts = path.split('.');
    first = parts[0];
    rest = parts.slice(1);
    if (first === 'uploadcare') {
      target = uploadcare;
    } else {
      window[first] || (window[first] = {});
      target = window[first];
    }
    for (_i = 0, _len = rest.length; _i < _len; _i++) {
      part = rest[_i];
      target[part] || (target[part] = {});
      target = target[part];
    }
    return fn(target);
  };

  uploadcare.expose = function(key, value) {
    return window.uploadcare[key] = value || uploadcare[key];
  };

}).call(this);
(function() {
  var first, jQueryVersion, jquerySrc, load, namespace, script;

  namespace = uploadcare.namespace;

  namespace('uploadcare', function(ns) {
    ns.__readyCallbacks = [];
    ns.whenReady = function(callback) {
      return ns.__readyCallbacks.push(callback);
    };
    return ns.ready = function() {
      var callback, _i, _len, _ref;
      _ref = ns.__readyCallbacks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        callback();
      }
      return ns.whenReady = function(callback) {
        return callback();
      };
    };
  });

  jQueryVersion = '1.7.2';

  jquerySrc = "https://ajax.googleapis.com/ajax/libs/jquery/" + jQueryVersion + "/jquery.min.js";

  if ((typeof jQuery !== "undefined" && jQuery !== null) && jQuery().jquery > jQueryVersion) {
    uploadcare.jQuery = jQuery;
    return uploadcare.jQuery(function() {
      return uploadcare.ready();
    });
  }

  script = document.createElement('script');

  script.setAttribute('src', jquerySrc);

  load = function() {
    uploadcare.jQuery = jQuery.noConflict(true);
    return uploadcare.jQuery(function() {
      return uploadcare.ready();
    });
  };

  if (document.addEventListener != null) {
    script.addEventListener('load', load, false);
  } else {
    script.attachEvent('onreadystatechange', function() {
      if (script.readyState === 'loaded' || script.readyState === 'complete') {
        return load();
      }
    });
  }

  first = document.getElementsByTagName('script')[0];

  first.parentNode.insertBefore(script, first);

}).call(this);
// from https://github.com/kossnocorp/role

uploadcare.whenReady(
  function(){
    !function($){
      function rewriteSelector(context, name, argPos){
        var original = context[name];

        if (!original) return;

        context[name] = function(){
          arguments[argPos] = arguments[argPos].replace(/@([\w\u00c0-\uFFFF\-]+)/g, '[role~="$1"]');
          return original.apply(context, arguments);
        };

        $.extend(context[name], original);
      }

      rewriteSelector($, 'find', 0);
      rewriteSelector($, 'multiFilter', 0);
      rewriteSelector($.find, 'matchesSelector', 1);
      rewriteSelector($.find, 'matches', 0);

      function parse(roleString, without){
        var role, result = [], roles = $.trim(roleString).split(/\s+/);

        for(var i=0; i<roles.length; i++) {
          role = roles[i];
          if (!~$.inArray(role, result) && (!without || !~$.inArray(role, without)))
            result.push(role);
        }

        return result;
      };

      $.extend($.fn, {
        roles: function(){ return parse(this.attr('role')); },

        hasRole: function(roleName){
          var roles = parse(roleName);
          for(var i=0;i<roles.length;i++)
            if (!this.is('@'+roles[i])) return false;

          return true;
        },

        addRole: function(roleName){
          if (this.hasRole(roleName)) return this;

          return this.each(function(_, element){
            var $el = $(element);
            $el.attr('role', parse($el.attr('role') + ' ' + roleName).join(' '));
          });
        },

        removeRole: function(roleName){
          if (!this.hasRole(roleName)) return this;

          return this.each(function(_, element){
            var $el = $(element);
            $el.attr('role', parse($el.attr('role'), parse(roleName)).join(' '));
          });
        },

        toggleRole: function(roleName){
          var roles = parse(roleName);
          for(var i=0;i<roles.length;i++)
            this[this.hasRole(roles[i]) ? 'removeRole' : 'addRole'].call(this, roles[i]);
          return this;
        }
      });
    }(uploadcare.jQuery)
  }
)
;
// ┌──────────────────────────────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.3.4 - JavaScript Events Library                                                │ \\
// ├──────────────────────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://dmitry.baranovskiy.com/)          │ \\
// │ Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license. │ \\
// └──────────────────────────────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.3.4",
        has = "hasOwnProperty",
        separator = /[\.\/]/,
        wildcard = "*",
        fun = function () {},
        numsort = function (a, b) {
            return a - b;
        },
        current_event,
        stop,
        events = {n: {}},
    
        eve = function (name, scope) {
            var e = events,
                oldstop = stop,
                args = Array.prototype.slice.call(arguments, 2),
                listeners = eve.listeners(name),
                z = 0,
                f = false,
                l,
                indexed = [],
                queue = {},
                out = [],
                ce = current_event,
                errors = [];
            current_event = name;
            stop = 0;
            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
                indexed.push(listeners[i].zIndex);
                if (listeners[i].zIndex < 0) {
                    queue[listeners[i].zIndex] = listeners[i];
                }
            }
            indexed.sort(numsort);
            while (indexed[z] < 0) {
                l = queue[indexed[z++]];
                out.push(l.apply(scope, args));
                if (stop) {
                    stop = oldstop;
                    return out;
                }
            }
            for (i = 0; i < ii; i++) {
                l = listeners[i];
                if ("zIndex" in l) {
                    if (l.zIndex == indexed[z]) {
                        out.push(l.apply(scope, args));
                        if (stop) {
                            break;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                break;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        break;
                    }
                }
            }
            stop = oldstop;
            current_event = ce;
            return out.length ? out : null;
        };
    
    eve.listeners = function (name) {
        var names = name.split(separator),
            e = events,
            item,
            items,
            k,
            i,
            ii,
            j,
            jj,
            nes,
            es = [e],
            out = [];
        for (i = 0, ii = names.length; i < ii; i++) {
            nes = [];
            for (j = 0, jj = es.length; j < jj; j++) {
                e = es[j].n;
                items = [e[names[i]], e[wildcard]];
                k = 2;
                while (k--) {
                    item = items[k];
                    if (item) {
                        nes.push(item);
                        out = out.concat(item.f || []);
                    }
                }
            }
            es = nes;
        }
        return out;
    };
    
    
    eve.on = function (name, f) {
        var names = name.split(separator),
            e = events;
        for (var i = 0, ii = names.length; i < ii; i++) {
            e = e.n;
            !e[names[i]] && (e[names[i]] = {n: {}});
            e = e[names[i]];
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
            return fun;
        }
        e.f.push(f);
        return function (zIndex) {
            if (+zIndex == +zIndex) {
                f.zIndex = +zIndex;
            }
        };
    };
    
    eve.stop = function () {
        stop = 1;
    };
    
    eve.nt = function (subname) {
        if (subname) {
            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
        }
        return current_event;
    };
    
    
    eve.off = eve.unbind = function (name, f) {
        var names = name.split(separator),
            e,
            key,
            splice,
            i, ii, j, jj,
            cur = [events];
        for (i = 0, ii = names.length; i < ii; i++) {
            for (j = 0; j < cur.length; j += splice.length - 2) {
                splice = [j, 1];
                e = cur[j].n;
                if (names[i] != wildcard) {
                    if (e[names[i]]) {
                        splice.push(e[names[i]]);
                    }
                } else {
                    for (key in e) if (e[has](key)) {
                        splice.push(e[key]);
                    }
                }
                cur.splice.apply(cur, splice);
            }
        }
        for (i = 0, ii = cur.length; i < ii; i++) {
            e = cur[i];
            while (e.n) {
                if (f) {
                    if (e.f) {
                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
                            e.f.splice(j, 1);
                            break;
                        }
                        !e.f.length && delete e.f;
                    }
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        var funcs = e.n[key].f;
                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
                            funcs.splice(j, 1);
                            break;
                        }
                        !funcs.length && delete e.n[key].f;
                    }
                } else {
                    delete e.f;
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        delete e.n[key].f;
                    }
                }
                e = e.n;
            }
        }
    };
    
    eve.once = function (name, f) {
        var f2 = function () {
            var res = f.apply(this, arguments);
            eve.unbind(name, f2);
            return res;
        };
        return eve.on(name, f2);
    };
    
    eve.version = version;
    eve.toString = function () {
        return "You are running Eve " + version;
    };
    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : (typeof define != "undefined" ? (define("eve", [], function() { return eve; })) : (glob.eve = eve));
})(uploadcare);

(function(eve){
  // ┌────────────────────────────────────────────────────────────────────┐ \\
  // │ Raphaël 2.1.0 - JavaScript Vector Library                          │ \\
  // ├────────────────────────────────────────────────────────────────────┤ \\
  // │ Copyright © 2008-2012 Dmitry Baranovskiy (http://raphaeljs.com)    │ \\
  // │ Copyright © 2008-2012 Sencha Labs (http://sencha.com)              │ \\
  // ├────────────────────────────────────────────────────────────────────┤ \\
  // │ Licensed under the MIT (http://raphaeljs.com/license.html) license.│ \\
  // └────────────────────────────────────────────────────────────────────┘ \\

  // ┌─────────────────────────────────────────────────────────────────────┐ \\
  // │ "Raphaël 2.1.0" - JavaScript Vector Library                         │ \\
  // ├─────────────────────────────────────────────────────────────────────┤ \\
  // │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
  // │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
  // │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
  // └─────────────────────────────────────────────────────────────────────┘ \\
  (function () {
      
      function R(first) {
          if (R.is(first, "function")) {
              return loaded ? first() : eve.on("raphael.DOMload", first);
          } else if (R.is(first, array)) {
              return R._engine.create[apply](R, first.splice(0, 3 + R.is(first[0], nu))).add(first);
          } else {
              var args = Array.prototype.slice.call(arguments, 0);
              if (R.is(args[args.length - 1], "function")) {
                  var f = args.pop();
                  return loaded ? f.call(R._engine.create[apply](R, args)) : eve.on("raphael.DOMload", function () {
                      f.call(R._engine.create[apply](R, args));
                  });
              } else {
                  return R._engine.create[apply](R, arguments);
              }
          }
      }
      R.version = "2.1.0";
      R.eve = eve;
      var loaded,
          separator = /[, ]+/,
          elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
          formatrg = /\{(\d+)\}/g,
          proto = "prototype",
          has = "hasOwnProperty",
          g = {
              doc: document,
              win: window
          },
          oldRaphael = {
              was: Object.prototype[has].call(g.win, "Raphael"),
              is: g.win.Raphael
          },
          Paper = function () {
              
              
              this.ca = this.customAttributes = {};
          },
          paperproto,
          appendChild = "appendChild",
          apply = "apply",
          concat = "concat",
          supportsTouch = "createTouch" in g.doc,
          E = "",
          S = " ",
          Str = String,
          split = "split",
          events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[split](S),
          touchMap = {
              mousedown: "touchstart",
              mousemove: "touchmove",
              mouseup: "touchend"
          },
          lowerCase = Str.prototype.toLowerCase,
          math = Math,
          mmax = math.max,
          mmin = math.min,
          abs = math.abs,
          pow = math.pow,
          PI = math.PI,
          nu = "number",
          string = "string",
          array = "array",
          toString = "toString",
          fillString = "fill",
          objectToString = Object.prototype.toString,
          paper = {},
          push = "push",
          ISURL = R._ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
          colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
          isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
          bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
          round = math.round,
          setAttribute = "setAttribute",
          toFloat = parseFloat,
          toInt = parseInt,
          upperCase = Str.prototype.toUpperCase,
          availableAttrs = R._availableAttrs = {
              "arrow-end": "none",
              "arrow-start": "none",
              blur: 0,
              "clip-rect": "0 0 1e9 1e9",
              cursor: "default",
              cx: 0,
              cy: 0,
              fill: "#fff",
              "fill-opacity": 1,
              font: '10px "Arial"',
              "font-family": '"Arial"',
              "font-size": "10",
              "font-style": "normal",
              "font-weight": 400,
              gradient: 0,
              height: 0,
              href: "http://raphaeljs.com/",
              "letter-spacing": 0,
              opacity: 1,
              path: "M0,0",
              r: 0,
              rx: 0,
              ry: 0,
              src: "",
              stroke: "#000",
              "stroke-dasharray": "",
              "stroke-linecap": "butt",
              "stroke-linejoin": "butt",
              "stroke-miterlimit": 0,
              "stroke-opacity": 1,
              "stroke-width": 1,
              target: "_blank",
              "text-anchor": "middle",
              title: "Raphael",
              transform: "",
              width: 0,
              x: 0,
              y: 0
          },
          availableAnimAttrs = R._availableAnimAttrs = {
              blur: nu,
              "clip-rect": "csv",
              cx: nu,
              cy: nu,
              fill: "colour",
              "fill-opacity": nu,
              "font-size": nu,
              height: nu,
              opacity: nu,
              path: "path",
              r: nu,
              rx: nu,
              ry: nu,
              stroke: "colour",
              "stroke-opacity": nu,
              "stroke-width": nu,
              transform: "transform",
              width: nu,
              x: nu,
              y: nu
          },
          whitespace = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]/g,
          commaSpaces = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/,
          hsrg = {hs: 1, rg: 1},
          p2s = /,?([achlmqrstvxz]),?/gi,
          pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
          tCommand = /([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
          pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig,
          radial_gradient = R._radial_gradient = /^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/,
          eldata = {},
          sortByKey = function (a, b) {
              return a.key - b.key;
          },
          sortByNumber = function (a, b) {
              return toFloat(a) - toFloat(b);
          },
          fun = function () {},
          pipe = function (x) {
              return x;
          },
          rectPath = R._rectPath = function (x, y, w, h, r) {
              if (r) {
                  return [["M", x + r, y], ["l", w - r * 2, 0], ["a", r, r, 0, 0, 1, r, r], ["l", 0, h - r * 2], ["a", r, r, 0, 0, 1, -r, r], ["l", r * 2 - w, 0], ["a", r, r, 0, 0, 1, -r, -r], ["l", 0, r * 2 - h], ["a", r, r, 0, 0, 1, r, -r], ["z"]];
              }
              return [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
          },
          ellipsePath = function (x, y, rx, ry) {
              if (ry == null) {
                  ry = rx;
              }
              return [["M", x, y], ["m", 0, -ry], ["a", rx, ry, 0, 1, 1, 0, 2 * ry], ["a", rx, ry, 0, 1, 1, 0, -2 * ry], ["z"]];
          },
          getPath = R._getPath = {
              path: function (el) {
                  return el.attr("path");
              },
              circle: function (el) {
                  var a = el.attrs;
                  return ellipsePath(a.cx, a.cy, a.r);
              },
              ellipse: function (el) {
                  var a = el.attrs;
                  return ellipsePath(a.cx, a.cy, a.rx, a.ry);
              },
              rect: function (el) {
                  var a = el.attrs;
                  return rectPath(a.x, a.y, a.width, a.height, a.r);
              },
              image: function (el) {
                  var a = el.attrs;
                  return rectPath(a.x, a.y, a.width, a.height);
              },
              text: function (el) {
                  var bbox = el._getBBox();
                  return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
              }
          },
          
          mapPath = R.mapPath = function (path, matrix) {
              if (!matrix) {
                  return path;
              }
              var x, y, i, j, ii, jj, pathi;
              path = path2curve(path);
              for (i = 0, ii = path.length; i < ii; i++) {
                  pathi = path[i];
                  for (j = 1, jj = pathi.length; j < jj; j += 2) {
                      x = matrix.x(pathi[j], pathi[j + 1]);
                      y = matrix.y(pathi[j], pathi[j + 1]);
                      pathi[j] = x;
                      pathi[j + 1] = y;
                  }
              }
              return path;
          };

      R._g = g;
      
      R.type = (g.win.SVGAngle || g.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
      if (R.type == "VML") {
          var d = g.doc.createElement("div"),
              b;
          d.innerHTML = '<v:shape adj="1"/>';
          b = d.firstChild;
          b.style.behavior = "url(#default#VML)";
          if (!(b && typeof b.adj == "object")) {
              return (R.type = E);
          }
          d = null;
      }
      
      
      R.svg = !(R.vml = R.type == "VML");
      R._Paper = Paper;
      
      R.fn = paperproto = Paper.prototype = R.prototype;
      R._id = 0;
      R._oid = 0;
      
      R.is = function (o, type) {
          type = lowerCase.call(type);
          if (type == "finite") {
              return !isnan[has](+o);
          }
          if (type == "array") {
              return o instanceof Array;
          }
          return  (type == "null" && o === null) ||
                  (type == typeof o && o !== null) ||
                  (type == "object" && o === Object(o)) ||
                  (type == "array" && Array.isArray && Array.isArray(o)) ||
                  objectToString.call(o).slice(8, -1).toLowerCase() == type;
      };

      function clone(obj) {
          if (Object(obj) !== obj) {
              return obj;
          }
          var res = new obj.constructor;
          for (var key in obj) if (obj[has](key)) {
              res[key] = clone(obj[key]);
          }
          return res;
      }

      
      R.angle = function (x1, y1, x2, y2, x3, y3) {
          if (x3 == null) {
              var x = x1 - x2,
                  y = y1 - y2;
              if (!x && !y) {
                  return 0;
              }
              return (180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
          } else {
              return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
          }
      };
      
      R.rad = function (deg) {
          return deg % 360 * PI / 180;
      };
      
      R.deg = function (rad) {
          return rad * 180 / PI % 360;
      };
      
      R.snapTo = function (values, value, tolerance) {
          tolerance = R.is(tolerance, "finite") ? tolerance : 10;
          if (R.is(values, array)) {
              var i = values.length;
              while (i--) if (abs(values[i] - value) <= tolerance) {
                  return values[i];
              }
          } else {
              values = +values;
              var rem = value % values;
              if (rem < tolerance) {
                  return value - rem;
              }
              if (rem > values - tolerance) {
                  return value - rem + values;
              }
          }
          return value;
      };
      
      
      var createUUID = R.createUUID = (function (uuidRegEx, uuidReplacer) {
          return function () {
              return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
          };
      })(/[xy]/g, function (c) {
          var r = math.random() * 16 | 0,
              v = c == "x" ? r : (r & 3 | 8);
          return v.toString(16);
      });

      
      R.setWindow = function (newwin) {
          eve("raphael.setWindow", R, g.win, newwin);
          g.win = newwin;
          g.doc = g.win.document;
          if (R._engine.initWin) {
              R._engine.initWin(g.win);
          }
      };
      var toHex = function (color) {
          if (R.vml) {
              // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
              var trim = /^\s+|\s+$/g;
              var bod;
              try {
                  var docum = new ActiveXObject("htmlfile");
                  docum.write("<body>");
                  docum.close();
                  bod = docum.body;
              } catch(e) {
                  bod = createPopup().document.body;
              }
              var range = bod.createTextRange();
              toHex = cacher(function (color) {
                  try {
                      bod.style.color = Str(color).replace(trim, E);
                      var value = range.queryCommandValue("ForeColor");
                      value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                      return "#" + ("000000" + value.toString(16)).slice(-6);
                  } catch(e) {
                      return "none";
                  }
              });
          } else {
              var i = g.doc.createElement("i");
              i.title = "Rapha\xebl Colour Picker";
              i.style.display = "none";
              g.doc.body.appendChild(i);
              toHex = cacher(function (color) {
                  i.style.color = color;
                  return g.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
              });
          }
          return toHex(color);
      },
      hsbtoString = function () {
          return "hsb(" + [this.h, this.s, this.b] + ")";
      },
      hsltoString = function () {
          return "hsl(" + [this.h, this.s, this.l] + ")";
      },
      rgbtoString = function () {
          return this.hex;
      },
      prepareRGB = function (r, g, b) {
          if (g == null && R.is(r, "object") && "r" in r && "g" in r && "b" in r) {
              b = r.b;
              g = r.g;
              r = r.r;
          }
          if (g == null && R.is(r, string)) {
              var clr = R.getRGB(r);
              r = clr.r;
              g = clr.g;
              b = clr.b;
          }
          if (r > 1 || g > 1 || b > 1) {
              r /= 255;
              g /= 255;
              b /= 255;
          }
          
          return [r, g, b];
      },
      packageRGB = function (r, g, b, o) {
          r *= 255;
          g *= 255;
          b *= 255;
          var rgb = {
              r: r,
              g: g,
              b: b,
              hex: R.rgb(r, g, b),
              toString: rgbtoString
          };
          R.is(o, "finite") && (rgb.opacity = o);
          return rgb;
      };
      
      
      R.color = function (clr) {
          var rgb;
          if (R.is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
              rgb = R.hsb2rgb(clr);
              clr.r = rgb.r;
              clr.g = rgb.g;
              clr.b = rgb.b;
              clr.hex = rgb.hex;
          } else if (R.is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
              rgb = R.hsl2rgb(clr);
              clr.r = rgb.r;
              clr.g = rgb.g;
              clr.b = rgb.b;
              clr.hex = rgb.hex;
          } else {
              if (R.is(clr, "string")) {
                  clr = R.getRGB(clr);
              }
              if (R.is(clr, "object") && "r" in clr && "g" in clr && "b" in clr) {
                  rgb = R.rgb2hsl(clr);
                  clr.h = rgb.h;
                  clr.s = rgb.s;
                  clr.l = rgb.l;
                  rgb = R.rgb2hsb(clr);
                  clr.v = rgb.b;
              } else {
                  clr = {hex: "none"};
                  clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
              }
          }
          clr.toString = rgbtoString;
          return clr;
      };
      
      R.hsb2rgb = function (h, s, v, o) {
          if (this.is(h, "object") && "h" in h && "s" in h && "b" in h) {
              v = h.b;
              s = h.s;
              h = h.h;
              o = h.o;
          }
          h *= 360;
          var R, G, B, X, C;
          h = (h % 360) / 60;
          C = v * s;
          X = C * (1 - abs(h % 2 - 1));
          R = G = B = v - C;

          h = ~~h;
          R += [C, X, 0, 0, X, C][h];
          G += [X, C, C, X, 0, 0][h];
          B += [0, 0, X, C, C, X][h];
          return packageRGB(R, G, B, o);
      };
      
      R.hsl2rgb = function (h, s, l, o) {
          if (this.is(h, "object") && "h" in h && "s" in h && "l" in h) {
              l = h.l;
              s = h.s;
              h = h.h;
          }
          if (h > 1 || s > 1 || l > 1) {
              h /= 360;
              s /= 100;
              l /= 100;
          }
          h *= 360;
          var R, G, B, X, C;
          h = (h % 360) / 60;
          C = 2 * s * (l < .5 ? l : 1 - l);
          X = C * (1 - abs(h % 2 - 1));
          R = G = B = l - C / 2;

          h = ~~h;
          R += [C, X, 0, 0, X, C][h];
          G += [X, C, C, X, 0, 0][h];
          B += [0, 0, X, C, C, X][h];
          return packageRGB(R, G, B, o);
      };
      
      R.rgb2hsb = function (r, g, b) {
          b = prepareRGB(r, g, b);
          r = b[0];
          g = b[1];
          b = b[2];

          var H, S, V, C;
          V = mmax(r, g, b);
          C = V - mmin(r, g, b);
          H = (C == 0 ? null :
               V == r ? (g - b) / C :
               V == g ? (b - r) / C + 2 :
                        (r - g) / C + 4
              );
          H = ((H + 360) % 6) * 60 / 360;
          S = C == 0 ? 0 : C / V;
          return {h: H, s: S, b: V, toString: hsbtoString};
      };
      
      R.rgb2hsl = function (r, g, b) {
          b = prepareRGB(r, g, b);
          r = b[0];
          g = b[1];
          b = b[2];

          var H, S, L, M, m, C;
          M = mmax(r, g, b);
          m = mmin(r, g, b);
          C = M - m;
          H = (C == 0 ? null :
               M == r ? (g - b) / C :
               M == g ? (b - r) / C + 2 :
                        (r - g) / C + 4);
          H = ((H + 360) % 6) * 60 / 360;
          L = (M + m) / 2;
          S = (C == 0 ? 0 :
               L < .5 ? C / (2 * L) :
                        C / (2 - 2 * L));
          return {h: H, s: S, l: L, toString: hsltoString};
      };
      R._path2string = function () {
          return this.join(",").replace(p2s, "$1");
      };
      function repush(array, item) {
          for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
              return array.push(array.splice(i, 1)[0]);
          }
      }
      function cacher(f, scope, postprocessor) {
          function newf() {
              var arg = Array.prototype.slice.call(arguments, 0),
                  args = arg.join("\u2400"),
                  cache = newf.cache = newf.cache || {},
                  count = newf.count = newf.count || [];
              if (cache[has](args)) {
                  repush(count, args);
                  return postprocessor ? postprocessor(cache[args]) : cache[args];
              }
              count.length >= 1e3 && delete cache[count.shift()];
              count.push(args);
              cache[args] = f[apply](scope, arg);
              return postprocessor ? postprocessor(cache[args]) : cache[args];
          }
          return newf;
      }

      var preload = R._preload = function (src, f) {
          var img = g.doc.createElement("img");
          img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
          img.onload = function () {
              f.call(this);
              this.onload = null;
              g.doc.body.removeChild(this);
          };
          img.onerror = function () {
              g.doc.body.removeChild(this);
          };
          g.doc.body.appendChild(img);
          img.src = src;
      };
      
      function clrToString() {
          return this.hex;
      }

      
      R.getRGB = cacher(function (colour) {
          if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
              return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
          }
          if (colour == "none") {
              return {r: -1, g: -1, b: -1, hex: "none", toString: clrToString};
          }
          !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
          var res,
              red,
              green,
              blue,
              opacity,
              t,
              values,
              rgb = colour.match(colourRegExp);
          if (rgb) {
              if (rgb[2]) {
                  blue = toInt(rgb[2].substring(5), 16);
                  green = toInt(rgb[2].substring(3, 5), 16);
                  red = toInt(rgb[2].substring(1, 3), 16);
              }
              if (rgb[3]) {
                  blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                  green = toInt((t = rgb[3].charAt(2)) + t, 16);
                  red = toInt((t = rgb[3].charAt(1)) + t, 16);
              }
              if (rgb[4]) {
                  values = rgb[4][split](commaSpaces);
                  red = toFloat(values[0]);
                  values[0].slice(-1) == "%" && (red *= 2.55);
                  green = toFloat(values[1]);
                  values[1].slice(-1) == "%" && (green *= 2.55);
                  blue = toFloat(values[2]);
                  values[2].slice(-1) == "%" && (blue *= 2.55);
                  rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                  values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
              }
              if (rgb[5]) {
                  values = rgb[5][split](commaSpaces);
                  red = toFloat(values[0]);
                  values[0].slice(-1) == "%" && (red *= 2.55);
                  green = toFloat(values[1]);
                  values[1].slice(-1) == "%" && (green *= 2.55);
                  blue = toFloat(values[2]);
                  values[2].slice(-1) == "%" && (blue *= 2.55);
                  (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                  rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                  values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                  return R.hsb2rgb(red, green, blue, opacity);
              }
              if (rgb[6]) {
                  values = rgb[6][split](commaSpaces);
                  red = toFloat(values[0]);
                  values[0].slice(-1) == "%" && (red *= 2.55);
                  green = toFloat(values[1]);
                  values[1].slice(-1) == "%" && (green *= 2.55);
                  blue = toFloat(values[2]);
                  values[2].slice(-1) == "%" && (blue *= 2.55);
                  (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                  rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                  values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                  return R.hsl2rgb(red, green, blue, opacity);
              }
              rgb = {r: red, g: green, b: blue, toString: clrToString};
              rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
              R.is(opacity, "finite") && (rgb.opacity = opacity);
              return rgb;
          }
          return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
      }, R);
      
      R.hsb = cacher(function (h, s, b) {
          return R.hsb2rgb(h, s, b).hex;
      });
      
      R.hsl = cacher(function (h, s, l) {
          return R.hsl2rgb(h, s, l).hex;
      });
      
      R.rgb = cacher(function (r, g, b) {
          return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
      });
      
      R.getColor = function (value) {
          var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
              rgb = this.hsb2rgb(start.h, start.s, start.b);
          start.h += .075;
          if (start.h > 1) {
              start.h = 0;
              start.s -= .2;
              start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
          }
          return rgb.hex;
      };
      
      R.getColor.reset = function () {
          delete this.start;
      };

      // http://schepers.cc/getting-to-the-point
      function catmullRom2bezier(crp, z) {
          var d = [];
          for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
              var p = [
                          {x: +crp[i - 2], y: +crp[i - 1]},
                          {x: +crp[i],     y: +crp[i + 1]},
                          {x: +crp[i + 2], y: +crp[i + 3]},
                          {x: +crp[i + 4], y: +crp[i + 5]}
                      ];
              if (z) {
                  if (!i) {
                      p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
                  } else if (iLen - 4 == i) {
                      p[3] = {x: +crp[0], y: +crp[1]};
                  } else if (iLen - 2 == i) {
                      p[2] = {x: +crp[0], y: +crp[1]};
                      p[3] = {x: +crp[2], y: +crp[3]};
                  }
              } else {
                  if (iLen - 4 == i) {
                      p[3] = p[2];
                  } else if (!i) {
                      p[0] = {x: +crp[i], y: +crp[i + 1]};
                  }
              }
              d.push(["C",
                    (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                    (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                    (p[1].x + 6 * p[2].x - p[3].x) / 6,
                    (p[1].y + 6*p[2].y - p[3].y) / 6,
                    p[2].x,
                    p[2].y
              ]);
          }

          return d;
      }
      
      R.parsePathString = function (pathString) {
          if (!pathString) {
              return null;
          }
          var pth = paths(pathString);
          if (pth.arr) {
              return pathClone(pth.arr);
          }
          
          var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
              data = [];
          if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
              data = pathClone(pathString);
          }
          if (!data.length) {
              Str(pathString).replace(pathCommand, function (a, b, c) {
                  var params = [],
                      name = b.toLowerCase();
                  c.replace(pathValues, function (a, b) {
                      b && params.push(+b);
                  });
                  if (name == "m" && params.length > 2) {
                      data.push([b][concat](params.splice(0, 2)));
                      name = "l";
                      b = b == "m" ? "l" : "L";
                  }
                  if (name == "r") {
                      data.push([b][concat](params));
                  } else while (params.length >= paramCounts[name]) {
                      data.push([b][concat](params.splice(0, paramCounts[name])));
                      if (!paramCounts[name]) {
                          break;
                      }
                  }
              });
          }
          data.toString = R._path2string;
          pth.arr = pathClone(data);
          return data;
      };
      
      R.parseTransformString = cacher(function (TString) {
          if (!TString) {
              return null;
          }
          var paramCounts = {r: 3, s: 4, t: 2, m: 6},
              data = [];
          if (R.is(TString, array) && R.is(TString[0], array)) { // rough assumption
              data = pathClone(TString);
          }
          if (!data.length) {
              Str(TString).replace(tCommand, function (a, b, c) {
                  var params = [],
                      name = lowerCase.call(b);
                  c.replace(pathValues, function (a, b) {
                      b && params.push(+b);
                  });
                  data.push([b][concat](params));
              });
          }
          data.toString = R._path2string;
          return data;
      });
      // PATHS
      var paths = function (ps) {
          var p = paths.ps = paths.ps || {};
          if (p[ps]) {
              p[ps].sleep = 100;
          } else {
              p[ps] = {
                  sleep: 100
              };
          }
          setTimeout(function () {
              for (var key in p) if (p[has](key) && key != ps) {
                  p[key].sleep--;
                  !p[key].sleep && delete p[key];
              }
          });
          return p[ps];
      };
      
      R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
          var t1 = 1 - t,
              t13 = pow(t1, 3),
              t12 = pow(t1, 2),
              t2 = t * t,
              t3 = t2 * t,
              x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
              y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
              mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
              my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
              nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
              ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
              ax = t1 * p1x + t * c1x,
              ay = t1 * p1y + t * c1y,
              cx = t1 * c2x + t * p2x,
              cy = t1 * c2y + t * p2y,
              alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);
          (mx > nx || my < ny) && (alpha += 180);
          return {
              x: x,
              y: y,
              m: {x: mx, y: my},
              n: {x: nx, y: ny},
              start: {x: ax, y: ay},
              end: {x: cx, y: cy},
              alpha: alpha
          };
      };
      
      R.bezierBBox = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
          if (!R.is(p1x, "array")) {
              p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
          }
          var bbox = curveDim.apply(null, p1x);
          return {
              x: bbox.min.x,
              y: bbox.min.y,
              x2: bbox.max.x,
              y2: bbox.max.y,
              width: bbox.max.x - bbox.min.x,
              height: bbox.max.y - bbox.min.y
          };
      };
      
      R.isPointInsideBBox = function (bbox, x, y) {
          return x >= bbox.x && x <= bbox.x2 && y >= bbox.y && y <= bbox.y2;
      };
      
      R.isBBoxIntersect = function (bbox1, bbox2) {
          var i = R.isPointInsideBBox;
          return i(bbox2, bbox1.x, bbox1.y)
              || i(bbox2, bbox1.x2, bbox1.y)
              || i(bbox2, bbox1.x, bbox1.y2)
              || i(bbox2, bbox1.x2, bbox1.y2)
              || i(bbox1, bbox2.x, bbox2.y)
              || i(bbox1, bbox2.x2, bbox2.y)
              || i(bbox1, bbox2.x, bbox2.y2)
              || i(bbox1, bbox2.x2, bbox2.y2)
              || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)
              && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
      };
      function base3(t, p1, p2, p3, p4) {
          var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
              t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
          return t * t2 - 3 * p1 + 3 * p2;
      }
      function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
          if (z == null) {
              z = 1;
          }
          z = z > 1 ? 1 : z < 0 ? 0 : z;
          var z2 = z / 2,
              n = 12,
              Tvalues = [-0.1252,0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],
              Cvalues = [0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],
              sum = 0;
          for (var i = 0; i < n; i++) {
              var ct = z2 * Tvalues[i] + z2,
                  xbase = base3(ct, x1, x2, x3, x4),
                  ybase = base3(ct, y1, y2, y3, y4),
                  comb = xbase * xbase + ybase * ybase;
              sum += Cvalues[i] * math.sqrt(comb);
          }
          return z2 * sum;
      }
      function getTatLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
          if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
              return;
          }
          var t = 1,
              step = t / 2,
              t2 = t - step,
              l,
              e = .01;
          l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
          while (abs(l - ll) > e) {
              step /= 2;
              t2 += (l < ll ? 1 : -1) * step;
              l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
          }
          return t2;
      }
      function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
          if (
              mmax(x1, x2) < mmin(x3, x4) ||
              mmin(x1, x2) > mmax(x3, x4) ||
              mmax(y1, y2) < mmin(y3, y4) ||
              mmin(y1, y2) > mmax(y3, y4)
          ) {
              return;
          }
          var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
              ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
              denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

          if (!denominator) {
              return;
          }
          var px = nx / denominator,
              py = ny / denominator,
              px2 = +px.toFixed(2),
              py2 = +py.toFixed(2);
          if (
              px2 < +mmin(x1, x2).toFixed(2) ||
              px2 > +mmax(x1, x2).toFixed(2) ||
              px2 < +mmin(x3, x4).toFixed(2) ||
              px2 > +mmax(x3, x4).toFixed(2) ||
              py2 < +mmin(y1, y2).toFixed(2) ||
              py2 > +mmax(y1, y2).toFixed(2) ||
              py2 < +mmin(y3, y4).toFixed(2) ||
              py2 > +mmax(y3, y4).toFixed(2)
          ) {
              return;
          }
          return {x: px, y: py};
      }
      function inter(bez1, bez2) {
          return interHelper(bez1, bez2);
      }
      function interCount(bez1, bez2) {
          return interHelper(bez1, bez2, 1);
      }
      function interHelper(bez1, bez2, justCount) {
          var bbox1 = R.bezierBBox(bez1),
              bbox2 = R.bezierBBox(bez2);
          if (!R.isBBoxIntersect(bbox1, bbox2)) {
              return justCount ? 0 : [];
          }
          var l1 = bezlen.apply(0, bez1),
              l2 = bezlen.apply(0, bez2),
              n1 = ~~(l1 / 5),
              n2 = ~~(l2 / 5),
              dots1 = [],
              dots2 = [],
              xy = {},
              res = justCount ? 0 : [];
          for (var i = 0; i < n1 + 1; i++) {
              var p = R.findDotsAtSegment.apply(R, bez1.concat(i / n1));
              dots1.push({x: p.x, y: p.y, t: i / n1});
          }
          for (i = 0; i < n2 + 1; i++) {
              p = R.findDotsAtSegment.apply(R, bez2.concat(i / n2));
              dots2.push({x: p.x, y: p.y, t: i / n2});
          }
          for (i = 0; i < n1; i++) {
              for (var j = 0; j < n2; j++) {
                  var di = dots1[i],
                      di1 = dots1[i + 1],
                      dj = dots2[j],
                      dj1 = dots2[j + 1],
                      ci = abs(di1.x - di.x) < .001 ? "y" : "x",
                      cj = abs(dj1.x - dj.x) < .001 ? "y" : "x",
                      is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
                  if (is) {
                      if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                          continue;
                      }
                      xy[is.x.toFixed(4)] = is.y.toFixed(4);
                      var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                          t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
                      if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                          if (justCount) {
                              res++;
                          } else {
                              res.push({
                                  x: is.x,
                                  y: is.y,
                                  t1: t1,
                                  t2: t2
                              });
                          }
                      }
                  }
              }
          }
          return res;
      }
      
      R.pathIntersection = function (path1, path2) {
          return interPathHelper(path1, path2);
      };
      R.pathIntersectionNumber = function (path1, path2) {
          return interPathHelper(path1, path2, 1);
      };
      function interPathHelper(path1, path2, justCount) {
          path1 = R._path2curve(path1);
          path2 = R._path2curve(path2);
          var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bez1, bez2,
              res = justCount ? 0 : [];
          for (var i = 0, ii = path1.length; i < ii; i++) {
              var pi = path1[i];
              if (pi[0] == "M") {
                  x1 = x1m = pi[1];
                  y1 = y1m = pi[2];
              } else {
                  if (pi[0] == "C") {
                      bez1 = [x1, y1].concat(pi.slice(1));
                      x1 = bez1[6];
                      y1 = bez1[7];
                  } else {
                      bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
                      x1 = x1m;
                      y1 = y1m;
                  }
                  for (var j = 0, jj = path2.length; j < jj; j++) {
                      var pj = path2[j];
                      if (pj[0] == "M") {
                          x2 = x2m = pj[1];
                          y2 = y2m = pj[2];
                      } else {
                          if (pj[0] == "C") {
                              bez2 = [x2, y2].concat(pj.slice(1));
                              x2 = bez2[6];
                              y2 = bez2[7];
                          } else {
                              bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
                              x2 = x2m;
                              y2 = y2m;
                          }
                          var intr = interHelper(bez1, bez2, justCount);
                          if (justCount) {
                              res += intr;
                          } else {
                              for (var k = 0, kk = intr.length; k < kk; k++) {
                                  intr[k].segment1 = i;
                                  intr[k].segment2 = j;
                                  intr[k].bez1 = bez1;
                                  intr[k].bez2 = bez2;
                              }
                              res = res.concat(intr);
                          }
                      }
                  }
              }
          }
          return res;
      }
      
      R.isPointInsidePath = function (path, x, y) {
          var bbox = R.pathBBox(path);
          return R.isPointInsideBBox(bbox, x, y) &&
                 interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1;
      };
      R._removedFactory = function (methodname) {
          return function () {
              eve("raphael.log", null, "Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object", methodname);
          };
      };
      
      var pathDimensions = R.pathBBox = function (path) {
          var pth = paths(path);
          if (pth.bbox) {
              return pth.bbox;
          }
          if (!path) {
              return {x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0};
          }
          path = path2curve(path);
          var x = 0, 
              y = 0,
              X = [],
              Y = [],
              p;
          for (var i = 0, ii = path.length; i < ii; i++) {
              p = path[i];
              if (p[0] == "M") {
                  x = p[1];
                  y = p[2];
                  X.push(x);
                  Y.push(y);
              } else {
                  var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                  X = X[concat](dim.min.x, dim.max.x);
                  Y = Y[concat](dim.min.y, dim.max.y);
                  x = p[5];
                  y = p[6];
              }
          }
          var xmin = mmin[apply](0, X),
              ymin = mmin[apply](0, Y),
              xmax = mmax[apply](0, X),
              ymax = mmax[apply](0, Y),
              bb = {
                  x: xmin,
                  y: ymin,
                  x2: xmax,
                  y2: ymax,
                  width: xmax - xmin,
                  height: ymax - ymin
              };
          pth.bbox = clone(bb);
          return bb;
      },
          pathClone = function (pathArray) {
              var res = clone(pathArray);
              res.toString = R._path2string;
              return res;
          },
          pathToRelative = R._pathToRelative = function (pathArray) {
              var pth = paths(pathArray);
              if (pth.rel) {
                  return pathClone(pth.rel);
              }
              if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                  pathArray = R.parsePathString(pathArray);
              }
              var res = [],
                  x = 0,
                  y = 0,
                  mx = 0,
                  my = 0,
                  start = 0;
              if (pathArray[0][0] == "M") {
                  x = pathArray[0][1];
                  y = pathArray[0][2];
                  mx = x;
                  my = y;
                  start++;
                  res.push(["M", x, y]);
              }
              for (var i = start, ii = pathArray.length; i < ii; i++) {
                  var r = res[i] = [],
                      pa = pathArray[i];
                  if (pa[0] != lowerCase.call(pa[0])) {
                      r[0] = lowerCase.call(pa[0]);
                      switch (r[0]) {
                          case "a":
                              r[1] = pa[1];
                              r[2] = pa[2];
                              r[3] = pa[3];
                              r[4] = pa[4];
                              r[5] = pa[5];
                              r[6] = +(pa[6] - x).toFixed(3);
                              r[7] = +(pa[7] - y).toFixed(3);
                              break;
                          case "v":
                              r[1] = +(pa[1] - y).toFixed(3);
                              break;
                          case "m":
                              mx = pa[1];
                              my = pa[2];
                          default:
                              for (var j = 1, jj = pa.length; j < jj; j++) {
                                  r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                              }
                      }
                  } else {
                      r = res[i] = [];
                      if (pa[0] == "m") {
                          mx = pa[1] + x;
                          my = pa[2] + y;
                      }
                      for (var k = 0, kk = pa.length; k < kk; k++) {
                          res[i][k] = pa[k];
                      }
                  }
                  var len = res[i].length;
                  switch (res[i][0]) {
                      case "z":
                          x = mx;
                          y = my;
                          break;
                      case "h":
                          x += +res[i][len - 1];
                          break;
                      case "v":
                          y += +res[i][len - 1];
                          break;
                      default:
                          x += +res[i][len - 2];
                          y += +res[i][len - 1];
                  }
              }
              res.toString = R._path2string;
              pth.rel = pathClone(res);
              return res;
          },
          pathToAbsolute = R._pathToAbsolute = function (pathArray) {
              var pth = paths(pathArray);
              if (pth.abs) {
                  return pathClone(pth.abs);
              }
              if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                  pathArray = R.parsePathString(pathArray);
              }
              if (!pathArray || !pathArray.length) {
                  return [["M", 0, 0]];
              }
              var res = [],
                  x = 0,
                  y = 0,
                  mx = 0,
                  my = 0,
                  start = 0;
              if (pathArray[0][0] == "M") {
                  x = +pathArray[0][1];
                  y = +pathArray[0][2];
                  mx = x;
                  my = y;
                  start++;
                  res[0] = ["M", x, y];
              }
              var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";
              for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
                  res.push(r = []);
                  pa = pathArray[i];
                  if (pa[0] != upperCase.call(pa[0])) {
                      r[0] = upperCase.call(pa[0]);
                      switch (r[0]) {
                          case "A":
                              r[1] = pa[1];
                              r[2] = pa[2];
                              r[3] = pa[3];
                              r[4] = pa[4];
                              r[5] = pa[5];
                              r[6] = +(pa[6] + x);
                              r[7] = +(pa[7] + y);
                              break;
                          case "V":
                              r[1] = +pa[1] + y;
                              break;
                          case "H":
                              r[1] = +pa[1] + x;
                              break;
                          case "R":
                              var dots = [x, y][concat](pa.slice(1));
                              for (var j = 2, jj = dots.length; j < jj; j++) {
                                  dots[j] = +dots[j] + x;
                                  dots[++j] = +dots[j] + y;
                              }
                              res.pop();
                              res = res[concat](catmullRom2bezier(dots, crz));
                              break;
                          case "M":
                              mx = +pa[1] + x;
                              my = +pa[2] + y;
                          default:
                              for (j = 1, jj = pa.length; j < jj; j++) {
                                  r[j] = +pa[j] + ((j % 2) ? x : y);
                              }
                      }
                  } else if (pa[0] == "R") {
                      dots = [x, y][concat](pa.slice(1));
                      res.pop();
                      res = res[concat](catmullRom2bezier(dots, crz));
                      r = ["R"][concat](pa.slice(-2));
                  } else {
                      for (var k = 0, kk = pa.length; k < kk; k++) {
                          r[k] = pa[k];
                      }
                  }
                  switch (r[0]) {
                      case "Z":
                          x = mx;
                          y = my;
                          break;
                      case "H":
                          x = r[1];
                          break;
                      case "V":
                          y = r[1];
                          break;
                      case "M":
                          mx = r[r.length - 2];
                          my = r[r.length - 1];
                      default:
                          x = r[r.length - 2];
                          y = r[r.length - 1];
                  }
              }
              res.toString = R._path2string;
              pth.abs = pathClone(res);
              return res;
          },
          l2c = function (x1, y1, x2, y2) {
              return [x1, y1, x2, y2, x2, y2];
          },
          q2c = function (x1, y1, ax, ay, x2, y2) {
              var _13 = 1 / 3,
                  _23 = 2 / 3;
              return [
                      _13 * x1 + _23 * ax,
                      _13 * y1 + _23 * ay,
                      _13 * x2 + _23 * ax,
                      _13 * y2 + _23 * ay,
                      x2,
                      y2
                  ];
          },
          a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
              // for more information of where this math came from visit:
              // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
              var _120 = PI * 120 / 180,
                  rad = PI / 180 * (+angle || 0),
                  res = [],
                  xy,
                  rotate = cacher(function (x, y, rad) {
                      var X = x * math.cos(rad) - y * math.sin(rad),
                          Y = x * math.sin(rad) + y * math.cos(rad);
                      return {x: X, y: Y};
                  });
              if (!recursive) {
                  xy = rotate(x1, y1, -rad);
                  x1 = xy.x;
                  y1 = xy.y;
                  xy = rotate(x2, y2, -rad);
                  x2 = xy.x;
                  y2 = xy.y;
                  var cos = math.cos(PI / 180 * angle),
                      sin = math.sin(PI / 180 * angle),
                      x = (x1 - x2) / 2,
                      y = (y1 - y2) / 2;
                  var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                  if (h > 1) {
                      h = math.sqrt(h);
                      rx = h * rx;
                      ry = h * ry;
                  }
                  var rx2 = rx * rx,
                      ry2 = ry * ry,
                      k = (large_arc_flag == sweep_flag ? -1 : 1) *
                          math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                      cx = k * rx * y / ry + (x1 + x2) / 2,
                      cy = k * -ry * x / rx + (y1 + y2) / 2,
                      f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                      f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                  f1 = x1 < cx ? PI - f1 : f1;
                  f2 = x2 < cx ? PI - f2 : f2;
                  f1 < 0 && (f1 = PI * 2 + f1);
                  f2 < 0 && (f2 = PI * 2 + f2);
                  if (sweep_flag && f1 > f2) {
                      f1 = f1 - PI * 2;
                  }
                  if (!sweep_flag && f2 > f1) {
                      f2 = f2 - PI * 2;
                  }
              } else {
                  f1 = recursive[0];
                  f2 = recursive[1];
                  cx = recursive[2];
                  cy = recursive[3];
              }
              var df = f2 - f1;
              if (abs(df) > _120) {
                  var f2old = f2,
                      x2old = x2,
                      y2old = y2;
                  f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                  x2 = cx + rx * math.cos(f2);
                  y2 = cy + ry * math.sin(f2);
                  res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
              }
              df = f2 - f1;
              var c1 = math.cos(f1),
                  s1 = math.sin(f1),
                  c2 = math.cos(f2),
                  s2 = math.sin(f2),
                  t = math.tan(df / 4),
                  hx = 4 / 3 * rx * t,
                  hy = 4 / 3 * ry * t,
                  m1 = [x1, y1],
                  m2 = [x1 + hx * s1, y1 - hy * c1],
                  m3 = [x2 + hx * s2, y2 - hy * c2],
                  m4 = [x2, y2];
              m2[0] = 2 * m1[0] - m2[0];
              m2[1] = 2 * m1[1] - m2[1];
              if (recursive) {
                  return [m2, m3, m4][concat](res);
              } else {
                  res = [m2, m3, m4][concat](res).join()[split](",");
                  var newres = [];
                  for (var i = 0, ii = res.length; i < ii; i++) {
                      newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                  }
                  return newres;
              }
          },
          findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
              var t1 = 1 - t;
              return {
                  x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                  y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
              };
          },
          curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
              var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                  b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                  c = p1x - c1x,
                  t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                  t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                  y = [p1y, p2y],
                  x = [p1x, p2x],
                  dot;
              abs(t1) > "1e12" && (t1 = .5);
              abs(t2) > "1e12" && (t2 = .5);
              if (t1 > 0 && t1 < 1) {
                  dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                  x.push(dot.x);
                  y.push(dot.y);
              }
              if (t2 > 0 && t2 < 1) {
                  dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                  x.push(dot.x);
                  y.push(dot.y);
              }
              a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
              b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
              c = p1y - c1y;
              t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
              t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
              abs(t1) > "1e12" && (t1 = .5);
              abs(t2) > "1e12" && (t2 = .5);
              if (t1 > 0 && t1 < 1) {
                  dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                  x.push(dot.x);
                  y.push(dot.y);
              }
              if (t2 > 0 && t2 < 1) {
                  dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                  x.push(dot.x);
                  y.push(dot.y);
              }
              return {
                  min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                  max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
              };
          }),
          path2curve = R._path2curve = cacher(function (path, path2) {
              var pth = !path2 && paths(path);
              if (!path2 && pth.curve) {
                  return pathClone(pth.curve);
              }
              var p = pathToAbsolute(path),
                  p2 = path2 && pathToAbsolute(path2),
                  attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                  attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                  processPath = function (path, d) {
                      var nx, ny;
                      if (!path) {
                          return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                      }
                      !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                      switch (path[0]) {
                          case "M":
                              d.X = path[1];
                              d.Y = path[2];
                              break;
                          case "A":
                              path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                              break;
                          case "S":
                              nx = d.x + (d.x - (d.bx || d.x));
                              ny = d.y + (d.y - (d.by || d.y));
                              path = ["C", nx, ny][concat](path.slice(1));
                              break;
                          case "T":
                              d.qx = d.x + (d.x - (d.qx || d.x));
                              d.qy = d.y + (d.y - (d.qy || d.y));
                              path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                              break;
                          case "Q":
                              d.qx = path[1];
                              d.qy = path[2];
                              path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                              break;
                          case "L":
                              path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                              break;
                          case "H":
                              path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                              break;
                          case "V":
                              path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                              break;
                          case "Z":
                              path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                              break;
                      }
                      return path;
                  },
                  fixArc = function (pp, i) {
                      if (pp[i].length > 7) {
                          pp[i].shift();
                          var pi = pp[i];
                          while (pi.length) {
                              pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                          }
                          pp.splice(i, 1);
                          ii = mmax(p.length, p2 && p2.length || 0);
                      }
                  },
                  fixM = function (path1, path2, a1, a2, i) {
                      if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                          path2.splice(i, 0, ["M", a2.x, a2.y]);
                          a1.bx = 0;
                          a1.by = 0;
                          a1.x = path1[i][1];
                          a1.y = path1[i][2];
                          ii = mmax(p.length, p2 && p2.length || 0);
                      }
                  };
              for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
                  p[i] = processPath(p[i], attrs);
                  fixArc(p, i);
                  p2 && (p2[i] = processPath(p2[i], attrs2));
                  p2 && fixArc(p2, i);
                  fixM(p, p2, attrs, attrs2, i);
                  fixM(p2, p, attrs2, attrs, i);
                  var seg = p[i],
                      seg2 = p2 && p2[i],
                      seglen = seg.length,
                      seg2len = p2 && seg2.length;
                  attrs.x = seg[seglen - 2];
                  attrs.y = seg[seglen - 1];
                  attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                  attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                  attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                  attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                  attrs2.x = p2 && seg2[seg2len - 2];
                  attrs2.y = p2 && seg2[seg2len - 1];
              }
              if (!p2) {
                  pth.curve = pathClone(p);
              }
              return p2 ? [p, p2] : p;
          }, null, pathClone),
          parseDots = R._parseDots = cacher(function (gradient) {
              var dots = [];
              for (var i = 0, ii = gradient.length; i < ii; i++) {
                  var dot = {},
                      par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                  dot.color = R.getRGB(par[1]);
                  if (dot.color.error) {
                      return null;
                  }
                  dot.color = dot.color.hex;
                  par[2] && (dot.offset = par[2] + "%");
                  dots.push(dot);
              }
              for (i = 1, ii = dots.length - 1; i < ii; i++) {
                  if (!dots[i].offset) {
                      var start = toFloat(dots[i - 1].offset || 0),
                          end = 0;
                      for (var j = i + 1; j < ii; j++) {
                          if (dots[j].offset) {
                              end = dots[j].offset;
                              break;
                          }
                      }
                      if (!end) {
                          end = 100;
                          j = ii;
                      }
                      end = toFloat(end);
                      var d = (end - start) / (j - i + 1);
                      for (; i < j; i++) {
                          start += d;
                          dots[i].offset = start + "%";
                      }
                  }
              }
              return dots;
          }),
          tear = R._tear = function (el, paper) {
              el == paper.top && (paper.top = el.prev);
              el == paper.bottom && (paper.bottom = el.next);
              el.next && (el.next.prev = el.prev);
              el.prev && (el.prev.next = el.next);
          },
          tofront = R._tofront = function (el, paper) {
              if (paper.top === el) {
                  return;
              }
              tear(el, paper);
              el.next = null;
              el.prev = paper.top;
              paper.top.next = el;
              paper.top = el;
          },
          toback = R._toback = function (el, paper) {
              if (paper.bottom === el) {
                  return;
              }
              tear(el, paper);
              el.next = paper.bottom;
              el.prev = null;
              paper.bottom.prev = el;
              paper.bottom = el;
          },
          insertafter = R._insertafter = function (el, el2, paper) {
              tear(el, paper);
              el2 == paper.top && (paper.top = el);
              el2.next && (el2.next.prev = el);
              el.next = el2.next;
              el.prev = el2;
              el2.next = el;
          },
          insertbefore = R._insertbefore = function (el, el2, paper) {
              tear(el, paper);
              el2 == paper.bottom && (paper.bottom = el);
              el2.prev && (el2.prev.next = el);
              el.prev = el2.prev;
              el2.prev = el;
              el.next = el2;
          },
          
          toMatrix = R.toMatrix = function (path, transform) {
              var bb = pathDimensions(path),
                  el = {
                      _: {
                          transform: E
                      },
                      getBBox: function () {
                          return bb;
                      }
                  };
              extractTransform(el, transform);
              return el.matrix;
          },
          
          transformPath = R.transformPath = function (path, transform) {
              return mapPath(path, toMatrix(path, transform));
          },
          extractTransform = R._extractTransform = function (el, tstr) {
              if (tstr == null) {
                  return el._.transform;
              }
              tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || E);
              var tdata = R.parseTransformString(tstr),
                  deg = 0,
                  dx = 0,
                  dy = 0,
                  sx = 1,
                  sy = 1,
                  _ = el._,
                  m = new Matrix;
              _.transform = tdata || [];
              if (tdata) {
                  for (var i = 0, ii = tdata.length; i < ii; i++) {
                      var t = tdata[i],
                          tlen = t.length,
                          command = Str(t[0]).toLowerCase(),
                          absolute = t[0] != command,
                          inver = absolute ? m.invert() : 0,
                          x1,
                          y1,
                          x2,
                          y2,
                          bb;
                      if (command == "t" && tlen == 3) {
                          if (absolute) {
                              x1 = inver.x(0, 0);
                              y1 = inver.y(0, 0);
                              x2 = inver.x(t[1], t[2]);
                              y2 = inver.y(t[1], t[2]);
                              m.translate(x2 - x1, y2 - y1);
                          } else {
                              m.translate(t[1], t[2]);
                          }
                      } else if (command == "r") {
                          if (tlen == 2) {
                              bb = bb || el.getBBox(1);
                              m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                              deg += t[1];
                          } else if (tlen == 4) {
                              if (absolute) {
                                  x2 = inver.x(t[2], t[3]);
                                  y2 = inver.y(t[2], t[3]);
                                  m.rotate(t[1], x2, y2);
                              } else {
                                  m.rotate(t[1], t[2], t[3]);
                              }
                              deg += t[1];
                          }
                      } else if (command == "s") {
                          if (tlen == 2 || tlen == 3) {
                              bb = bb || el.getBBox(1);
                              m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                              sx *= t[1];
                              sy *= t[tlen - 1];
                          } else if (tlen == 5) {
                              if (absolute) {
                                  x2 = inver.x(t[3], t[4]);
                                  y2 = inver.y(t[3], t[4]);
                                  m.scale(t[1], t[2], x2, y2);
                              } else {
                                  m.scale(t[1], t[2], t[3], t[4]);
                              }
                              sx *= t[1];
                              sy *= t[2];
                          }
                      } else if (command == "m" && tlen == 7) {
                          m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
                      }
                      _.dirtyT = 1;
                      el.matrix = m;
                  }
              }

              
              el.matrix = m;

              _.sx = sx;
              _.sy = sy;
              _.deg = deg;
              _.dx = dx = m.e;
              _.dy = dy = m.f;

              if (sx == 1 && sy == 1 && !deg && _.bbox) {
                  _.bbox.x += +dx;
                  _.bbox.y += +dy;
              } else {
                  _.dirtyT = 1;
              }
          },
          getEmpty = function (item) {
              var l = item[0];
              switch (l.toLowerCase()) {
                  case "t": return [l, 0, 0];
                  case "m": return [l, 1, 0, 0, 1, 0, 0];
                  case "r": if (item.length == 4) {
                      return [l, 0, item[2], item[3]];
                  } else {
                      return [l, 0];
                  }
                  case "s": if (item.length == 5) {
                      return [l, 1, 1, item[3], item[4]];
                  } else if (item.length == 3) {
                      return [l, 1, 1];
                  } else {
                      return [l, 1];
                  }
              }
          },
          equaliseTransform = R._equaliseTransform = function (t1, t2) {
              t2 = Str(t2).replace(/\.{3}|\u2026/g, t1);
              t1 = R.parseTransformString(t1) || [];
              t2 = R.parseTransformString(t2) || [];
              var maxlength = mmax(t1.length, t2.length),
                  from = [],
                  to = [],
                  i = 0, j, jj,
                  tt1, tt2;
              for (; i < maxlength; i++) {
                  tt1 = t1[i] || getEmpty(t2[i]);
                  tt2 = t2[i] || getEmpty(tt1);
                  if ((tt1[0] != tt2[0]) ||
                      (tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3])) ||
                      (tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4]))
                      ) {
                      return;
                  }
                  from[i] = [];
                  to[i] = [];
                  for (j = 0, jj = mmax(tt1.length, tt2.length); j < jj; j++) {
                      j in tt1 && (from[i][j] = tt1[j]);
                      j in tt2 && (to[i][j] = tt2[j]);
                  }
              }
              return {
                  from: from,
                  to: to
              };
          };
      R._getContainer = function (x, y, w, h) {
          var container;
          container = h == null && !R.is(x, "object") ? g.doc.getElementById(x) : x;
          if (container == null) {
              return;
          }
          if (container.tagName) {
              if (y == null) {
                  return {
                      container: container,
                      width: container.style.pixelWidth || container.offsetWidth,
                      height: container.style.pixelHeight || container.offsetHeight
                  };
              } else {
                  return {
                      container: container,
                      width: y,
                      height: w
                  };
              }
          }
          return {
              container: 1,
              x: x,
              y: y,
              width: w,
              height: h
          };
      };
      
      R.pathToRelative = pathToRelative;
      R._engine = {};
      
      R.path2curve = path2curve;
      
      R.matrix = function (a, b, c, d, e, f) {
          return new Matrix(a, b, c, d, e, f);
      };
      function Matrix(a, b, c, d, e, f) {
          if (a != null) {
              this.a = +a;
              this.b = +b;
              this.c = +c;
              this.d = +d;
              this.e = +e;
              this.f = +f;
          } else {
              this.a = 1;
              this.b = 0;
              this.c = 0;
              this.d = 1;
              this.e = 0;
              this.f = 0;
          }
      }
      (function (matrixproto) {
          
          matrixproto.add = function (a, b, c, d, e, f) {
              var out = [[], [], []],
                  m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
                  matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
                  x, y, z, res;

              if (a && a instanceof Matrix) {
                  matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
              }

              for (x = 0; x < 3; x++) {
                  for (y = 0; y < 3; y++) {
                      res = 0;
                      for (z = 0; z < 3; z++) {
                          res += m[x][z] * matrix[z][y];
                      }
                      out[x][y] = res;
                  }
              }
              this.a = out[0][0];
              this.b = out[1][0];
              this.c = out[0][1];
              this.d = out[1][1];
              this.e = out[0][2];
              this.f = out[1][2];
          };
          
          matrixproto.invert = function () {
              var me = this,
                  x = me.a * me.d - me.b * me.c;
              return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
          };
          
          matrixproto.clone = function () {
              return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
          };
          
          matrixproto.translate = function (x, y) {
              this.add(1, 0, 0, 1, x, y);
          };
          
          matrixproto.scale = function (x, y, cx, cy) {
              y == null && (y = x);
              (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
              this.add(x, 0, 0, y, 0, 0);
              (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
          };
          
          matrixproto.rotate = function (a, x, y) {
              a = R.rad(a);
              x = x || 0;
              y = y || 0;
              var cos = +math.cos(a).toFixed(9),
                  sin = +math.sin(a).toFixed(9);
              this.add(cos, sin, -sin, cos, x, y);
              this.add(1, 0, 0, 1, -x, -y);
          };
          
          matrixproto.x = function (x, y) {
              return x * this.a + y * this.c + this.e;
          };
          
          matrixproto.y = function (x, y) {
              return x * this.b + y * this.d + this.f;
          };
          matrixproto.get = function (i) {
              return +this[Str.fromCharCode(97 + i)].toFixed(4);
          };
          matrixproto.toString = function () {
              return R.svg ?
                  "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")" :
                  [this.get(0), this.get(2), this.get(1), this.get(3), 0, 0].join();
          };
          matrixproto.toFilter = function () {
              return "progid:DXImageTransform.Microsoft.Matrix(M11=" + this.get(0) +
                  ", M12=" + this.get(2) + ", M21=" + this.get(1) + ", M22=" + this.get(3) +
                  ", Dx=" + this.get(4) + ", Dy=" + this.get(5) + ", sizingmethod='auto expand')";
          };
          matrixproto.offset = function () {
              return [this.e.toFixed(4), this.f.toFixed(4)];
          };
          function norm(a) {
              return a[0] * a[0] + a[1] * a[1];
          }
          function normalize(a) {
              var mag = math.sqrt(norm(a));
              a[0] && (a[0] /= mag);
              a[1] && (a[1] /= mag);
          }
          
          matrixproto.split = function () {
              var out = {};
              // translation
              out.dx = this.e;
              out.dy = this.f;

              // scale and shear
              var row = [[this.a, this.c], [this.b, this.d]];
              out.scalex = math.sqrt(norm(row[0]));
              normalize(row[0]);

              out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
              row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

              out.scaley = math.sqrt(norm(row[1]));
              normalize(row[1]);
              out.shear /= out.scaley;

              // rotation
              var sin = -row[0][1],
                  cos = row[1][1];
              if (cos < 0) {
                  out.rotate = R.deg(math.acos(cos));
                  if (sin < 0) {
                      out.rotate = 360 - out.rotate;
                  }
              } else {
                  out.rotate = R.deg(math.asin(sin));
              }

              out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
              out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
              out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
              return out;
          };
          
          matrixproto.toTransformString = function (shorter) {
              var s = shorter || this[split]();
              if (s.isSimple) {
                  s.scalex = +s.scalex.toFixed(4);
                  s.scaley = +s.scaley.toFixed(4);
                  s.rotate = +s.rotate.toFixed(4);
                  return  (s.dx || s.dy ? "t" + [s.dx, s.dy] : E) + 
                          (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
                          (s.rotate ? "r" + [s.rotate, 0, 0] : E);
              } else {
                  return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
              }
          };
      })(Matrix.prototype);

      // WebKit rendering bug workaround method
      var version = navigator.userAgent.match(/Version\/(.*?)\s/) || navigator.userAgent.match(/Chrome\/(\d+)/);
      if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP") ||
          (navigator.vendor == "Google Inc." && version && version[1] < 8)) {
          
          paperproto.safari = function () {
              var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
              setTimeout(function () {rect.remove();});
          };
      } else {
          paperproto.safari = fun;
      }
   
      var preventDefault = function () {
          this.returnValue = false;
      },
      preventTouch = function () {
          return this.originalEvent.preventDefault();
      },
      stopPropagation = function () {
          this.cancelBubble = true;
      },
      stopTouch = function () {
          return this.originalEvent.stopPropagation();
      },
      addEvent = (function () {
          if (g.doc.addEventListener) {
              return function (obj, type, fn, element) {
                  var realName = supportsTouch && touchMap[type] ? touchMap[type] : type,
                      f = function (e) {
                          var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                              scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                              x = e.clientX + scrollX,
                              y = e.clientY + scrollY;
                      if (supportsTouch && touchMap[has](type)) {
                          for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                              if (e.targetTouches[i].target == obj) {
                                  var olde = e;
                                  e = e.targetTouches[i];
                                  e.originalEvent = olde;
                                  e.preventDefault = preventTouch;
                                  e.stopPropagation = stopTouch;
                                  break;
                              }
                          }
                      }
                      return fn.call(element, e, x, y);
                  };
                  obj.addEventListener(realName, f, false);
                  return function () {
                      obj.removeEventListener(realName, f, false);
                      return true;
                  };
              };
          } else if (g.doc.attachEvent) {
              return function (obj, type, fn, element) {
                  var f = function (e) {
                      e = e || g.win.event;
                      var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                          scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                          x = e.clientX + scrollX,
                          y = e.clientY + scrollY;
                      e.preventDefault = e.preventDefault || preventDefault;
                      e.stopPropagation = e.stopPropagation || stopPropagation;
                      return fn.call(element, e, x, y);
                  };
                  obj.attachEvent("on" + type, f);
                  var detacher = function () {
                      obj.detachEvent("on" + type, f);
                      return true;
                  };
                  return detacher;
              };
          }
      })(),
      drag = [],
      dragMove = function (e) {
          var x = e.clientX,
              y = e.clientY,
              scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
              scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
              dragi,
              j = drag.length;
          while (j--) {
              dragi = drag[j];
              if (supportsTouch) {
                  var i = e.touches.length,
                      touch;
                  while (i--) {
                      touch = e.touches[i];
                      if (touch.identifier == dragi.el._drag.id) {
                          x = touch.clientX;
                          y = touch.clientY;
                          (e.originalEvent ? e.originalEvent : e).preventDefault();
                          break;
                      }
                  }
              } else {
                  e.preventDefault();
              }
              var node = dragi.el.node,
                  o,
                  next = node.nextSibling,
                  parent = node.parentNode,
                  display = node.style.display;
              g.win.opera && parent.removeChild(node);
              node.style.display = "none";
              o = dragi.el.paper.getElementByPoint(x, y);
              node.style.display = display;
              g.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
              o && eve("raphael.drag.over." + dragi.el.id, dragi.el, o);
              x += scrollX;
              y += scrollY;
              eve("raphael.drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
          }
      },
      dragUp = function (e) {
          R.unmousemove(dragMove).unmouseup(dragUp);
          var i = drag.length,
              dragi;
          while (i--) {
              dragi = drag[i];
              dragi.el._drag = {};
              eve("raphael.drag.end." + dragi.el.id, dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
          }
          drag = [];
      },
      
      elproto = R.el = {};
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      for (var i = events.length; i--;) {
          (function (eventName) {
              R[eventName] = elproto[eventName] = function (fn, scope) {
                  if (R.is(fn, "function")) {
                      this.events = this.events || [];
                      this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || g.doc, eventName, fn, scope || this)});
                  }
                  return this;
              };
              R["un" + eventName] = elproto["un" + eventName] = function (fn) {
                  var events = this.events || [],
                      l = events.length;
                  while (l--) if (events[l].name == eventName && events[l].f == fn) {
                      events[l].unbind();
                      events.splice(l, 1);
                      !events.length && delete this.events;
                      return this;
                  }
                  return this;
              };
          })(events[i]);
      }
      
      
      elproto.data = function (key, value) {
          var data = eldata[this.id] = eldata[this.id] || {};
          if (arguments.length == 1) {
              if (R.is(key, "object")) {
                  for (var i in key) if (key[has](i)) {
                      this.data(i, key[i]);
                  }
                  return this;
              }
              eve("raphael.data.get." + this.id, this, data[key], key);
              return data[key];
          }
          data[key] = value;
          eve("raphael.data.set." + this.id, this, value, key);
          return this;
      };
      
      elproto.removeData = function (key) {
          if (key == null) {
              eldata[this.id] = {};
          } else {
              eldata[this.id] && delete eldata[this.id][key];
          }
          return this;
      };
      
      elproto.hover = function (f_in, f_out, scope_in, scope_out) {
          return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
      };
      
      elproto.unhover = function (f_in, f_out) {
          return this.unmouseover(f_in).unmouseout(f_out);
      };
      var draggable = [];
      
      elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
          function start(e) {
              (e.originalEvent || e).preventDefault();
              var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                  scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft;
              this._drag.x = e.clientX + scrollX;
              this._drag.y = e.clientY + scrollY;
              this._drag.id = e.identifier;
              !drag.length && R.mousemove(dragMove).mouseup(dragUp);
              drag.push({el: this, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
              onstart && eve.on("raphael.drag.start." + this.id, onstart);
              onmove && eve.on("raphael.drag.move." + this.id, onmove);
              onend && eve.on("raphael.drag.end." + this.id, onend);
              eve("raphael.drag.start." + this.id, start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
          }
          this._drag = {};
          draggable.push({el: this, start: start});
          this.mousedown(start);
          return this;
      };
      
      elproto.onDragOver = function (f) {
          f ? eve.on("raphael.drag.over." + this.id, f) : eve.unbind("raphael.drag.over." + this.id);
      };
      
      elproto.undrag = function () {
          var i = draggable.length;
          while (i--) if (draggable[i].el == this) {
              this.unmousedown(draggable[i].start);
              draggable.splice(i, 1);
              eve.unbind("raphael.drag.*." + this.id);
          }
          !draggable.length && R.unmousemove(dragMove).unmouseup(dragUp);
      };
      
      paperproto.circle = function (x, y, r) {
          var out = R._engine.circle(this, x || 0, y || 0, r || 0);
          this.__set__ && this.__set__.push(out);
          return out;
      };
      
      paperproto.rect = function (x, y, w, h, r) {
          var out = R._engine.rect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
          this.__set__ && this.__set__.push(out);
          return out;
      };
      
      paperproto.ellipse = function (x, y, rx, ry) {
          var out = R._engine.ellipse(this, x || 0, y || 0, rx || 0, ry || 0);
          this.__set__ && this.__set__.push(out);
          return out;
      };
      
      paperproto.path = function (pathString) {
          pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
          var out = R._engine.path(R.format[apply](R, arguments), this);
          this.__set__ && this.__set__.push(out);
          return out;
      };
      
      paperproto.image = function (src, x, y, w, h) {
          var out = R._engine.image(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
          this.__set__ && this.__set__.push(out);
          return out;
      };
      
      paperproto.text = function (x, y, text) {
          var out = R._engine.text(this, x || 0, y || 0, Str(text));
          this.__set__ && this.__set__.push(out);
          return out;
      };
      
      paperproto.set = function (itemsArray) {
          !R.is(itemsArray, "array") && (itemsArray = Array.prototype.splice.call(arguments, 0, arguments.length));
          var out = new Set(itemsArray);
          this.__set__ && this.__set__.push(out);
          return out;
      };
      
      paperproto.setStart = function (set) {
          this.__set__ = set || this.set();
      };
      
      paperproto.setFinish = function (set) {
          var out = this.__set__;
          delete this.__set__;
          return out;
      };
      
      paperproto.setSize = function (width, height) {
          return R._engine.setSize.call(this, width, height);
      };
      
      paperproto.setViewBox = function (x, y, w, h, fit) {
          return R._engine.setViewBox.call(this, x, y, w, h, fit);
      };
      
      
      paperproto.top = paperproto.bottom = null;
      
      paperproto.raphael = R;
      var getOffset = function (elem) {
          var box = elem.getBoundingClientRect(),
              doc = elem.ownerDocument,
              body = doc.body,
              docElem = doc.documentElement,
              clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
              top  = box.top  + (g.win.pageYOffset || docElem.scrollTop || body.scrollTop ) - clientTop,
              left = box.left + (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
          return {
              y: top,
              x: left
          };
      };
      
      paperproto.getElementByPoint = function (x, y) {
          var paper = this,
              svg = paper.canvas,
              target = g.doc.elementFromPoint(x, y);
          if (g.win.opera && target.tagName == "svg") {
              var so = getOffset(svg),
                  sr = svg.createSVGRect();
              sr.x = x - so.x;
              sr.y = y - so.y;
              sr.width = sr.height = 1;
              var hits = svg.getIntersectionList(sr, null);
              if (hits.length) {
                  target = hits[hits.length - 1];
              }
          }
          if (!target) {
              return null;
          }
          while (target.parentNode && target != svg.parentNode && !target.raphael) {
              target = target.parentNode;
          }
          target == paper.canvas.parentNode && (target = svg);
          target = target && target.raphael ? paper.getById(target.raphaelid) : null;
          return target;
      };
      
      paperproto.getById = function (id) {
          var bot = this.bottom;
          while (bot) {
              if (bot.id == id) {
                  return bot;
              }
              bot = bot.next;
          }
          return null;
      };
      
      paperproto.forEach = function (callback, thisArg) {
          var bot = this.bottom;
          while (bot) {
              if (callback.call(thisArg, bot) === false) {
                  return this;
              }
              bot = bot.next;
          }
          return this;
      };
      
      paperproto.getElementsByPoint = function (x, y) {
          var set = this.set();
          this.forEach(function (el) {
              if (el.isPointInside(x, y)) {
                  set.push(el);
              }
          });
          return set;
      };
      function x_y() {
          return this.x + S + this.y;
      }
      function x_y_w_h() {
          return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
      }
      
      elproto.isPointInside = function (x, y) {
          var rp = this.realPath = this.realPath || getPath[this.type](this);
          return R.isPointInsidePath(rp, x, y);
      };
      
      elproto.getBBox = function (isWithoutTransform) {
          if (this.removed) {
              return {};
          }
          var _ = this._;
          if (isWithoutTransform) {
              if (_.dirty || !_.bboxwt) {
                  this.realPath = getPath[this.type](this);
                  _.bboxwt = pathDimensions(this.realPath);
                  _.bboxwt.toString = x_y_w_h;
                  _.dirty = 0;
              }
              return _.bboxwt;
          }
          if (_.dirty || _.dirtyT || !_.bbox) {
              if (_.dirty || !this.realPath) {
                  _.bboxwt = 0;
                  this.realPath = getPath[this.type](this);
              }
              _.bbox = pathDimensions(mapPath(this.realPath, this.matrix));
              _.bbox.toString = x_y_w_h;
              _.dirty = _.dirtyT = 0;
          }
          return _.bbox;
      };
      
      elproto.clone = function () {
          if (this.removed) {
              return null;
          }
          var out = this.paper[this.type]().attr(this.attr());
          this.__set__ && this.__set__.push(out);
          return out;
      };
      
      elproto.glow = function (glow) {
          if (this.type == "text") {
              return null;
          }
          glow = glow || {};
          var s = {
              width: (glow.width || 10) + (+this.attr("stroke-width") || 1),
              fill: glow.fill || false,
              opacity: glow.opacity || .5,
              offsetx: glow.offsetx || 0,
              offsety: glow.offsety || 0,
              color: glow.color || "#000"
          },
              c = s.width / 2,
              r = this.paper,
              out = r.set(),
              path = this.realPath || getPath[this.type](this);
          path = this.matrix ? mapPath(path, this.matrix) : path;
          for (var i = 1; i < c + 1; i++) {
              out.push(r.path(path).attr({
                  stroke: s.color,
                  fill: s.fill ? s.color : "none",
                  "stroke-linejoin": "round",
                  "stroke-linecap": "round",
                  "stroke-width": +(s.width / c * i).toFixed(3),
                  opacity: +(s.opacity / c).toFixed(3)
              }));
          }
          return out.insertBefore(this).translate(s.offsetx, s.offsety);
      };
      var curveslengths = {},
      getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
          if (length == null) {
              return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
          } else {
              return R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, getTatLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
          }
      },
      getLengthFactory = function (istotal, subpath) {
          return function (path, length, onlystart) {
              path = path2curve(path);
              var x, y, p, l, sp = "", subpaths = {}, point,
                  len = 0;
              for (var i = 0, ii = path.length; i < ii; i++) {
                  p = path[i];
                  if (p[0] == "M") {
                      x = +p[1];
                      y = +p[2];
                  } else {
                      l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                      if (len + l > length) {
                          if (subpath && !subpaths.start) {
                              point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                              sp += ["C" + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                              if (onlystart) {return sp;}
                              subpaths.start = sp;
                              sp = ["M" + point.x, point.y + "C" + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
                              len += l;
                              x = +p[5];
                              y = +p[6];
                              continue;
                          }
                          if (!istotal && !subpath) {
                              point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                              return {x: point.x, y: point.y, alpha: point.alpha};
                          }
                      }
                      len += l;
                      x = +p[5];
                      y = +p[6];
                  }
                  sp += p.shift() + p;
              }
              subpaths.end = sp;
              point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
              point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
              return point;
          };
      };
      var getTotalLength = getLengthFactory(1),
          getPointAtLength = getLengthFactory(),
          getSubpathsAtLength = getLengthFactory(0, 1);
      
      R.getTotalLength = getTotalLength;
      
      R.getPointAtLength = getPointAtLength;
      
      R.getSubpath = function (path, from, to) {
          if (this.getTotalLength(path) - to < 1e-6) {
              return getSubpathsAtLength(path, from).end;
          }
          var a = getSubpathsAtLength(path, to, 1);
          return from ? getSubpathsAtLength(a, from).end : a;
      };
      
      elproto.getTotalLength = function () {
          if (this.type != "path") {return;}
          if (this.node.getTotalLength) {
              return this.node.getTotalLength();
          }
          return getTotalLength(this.attrs.path);
      };
      
      elproto.getPointAtLength = function (length) {
          if (this.type != "path") {return;}
          return getPointAtLength(this.attrs.path, length);
      };
      
      elproto.getSubpath = function (from, to) {
          if (this.type != "path") {return;}
          return R.getSubpath(this.attrs.path, from, to);
      };
      
      var ef = R.easing_formulas = {
          linear: function (n) {
              return n;
          },
          "<": function (n) {
              return pow(n, 1.7);
          },
          ">": function (n) {
              return pow(n, .48);
          },
          "<>": function (n) {
              var q = .48 - n / 1.04,
                  Q = math.sqrt(.1734 + q * q),
                  x = Q - q,
                  X = pow(abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                  y = -Q - q,
                  Y = pow(abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                  t = X + Y + .5;
              return (1 - t) * 3 * t * t + t * t * t;
          },
          backIn: function (n) {
              var s = 1.70158;
              return n * n * ((s + 1) * n - s);
          },
          backOut: function (n) {
              n = n - 1;
              var s = 1.70158;
              return n * n * ((s + 1) * n + s) + 1;
          },
          elastic: function (n) {
              if (n == !!n) {
                  return n;
              }
              return pow(2, -10 * n) * math.sin((n - .075) * (2 * PI) / .3) + 1;
          },
          bounce: function (n) {
              var s = 7.5625,
                  p = 2.75,
                  l;
              if (n < (1 / p)) {
                  l = s * n * n;
              } else {
                  if (n < (2 / p)) {
                      n -= (1.5 / p);
                      l = s * n * n + .75;
                  } else {
                      if (n < (2.5 / p)) {
                          n -= (2.25 / p);
                          l = s * n * n + .9375;
                      } else {
                          n -= (2.625 / p);
                          l = s * n * n + .984375;
                      }
                  }
              }
              return l;
          }
      };
      ef.easeIn = ef["ease-in"] = ef["<"];
      ef.easeOut = ef["ease-out"] = ef[">"];
      ef.easeInOut = ef["ease-in-out"] = ef["<>"];
      ef["back-in"] = ef.backIn;
      ef["back-out"] = ef.backOut;

      var animationElements = [],
          requestAnimFrame = window.requestAnimationFrame       ||
                             window.webkitRequestAnimationFrame ||
                             window.mozRequestAnimationFrame    ||
                             window.oRequestAnimationFrame      ||
                             window.msRequestAnimationFrame     ||
                             function (callback) {
                                 setTimeout(callback, 16);
                             },
          animation = function () {
              var Now = +new Date,
                  l = 0;
              for (; l < animationElements.length; l++) {
                  var e = animationElements[l];
                  if (e.el.removed || e.paused) {
                      continue;
                  }
                  var time = Now - e.start,
                      ms = e.ms,
                      easing = e.easing,
                      from = e.from,
                      diff = e.diff,
                      to = e.to,
                      t = e.t,
                      that = e.el,
                      set = {},
                      now,
                      init = {},
                      key;
                  if (e.initstatus) {
                      time = (e.initstatus * e.anim.top - e.prev) / (e.percent - e.prev) * ms;
                      e.status = e.initstatus;
                      delete e.initstatus;
                      e.stop && animationElements.splice(l--, 1);
                  } else {
                      e.status = (e.prev + (e.percent - e.prev) * (time / ms)) / e.anim.top;
                  }
                  if (time < 0) {
                      continue;
                  }
                  if (time < ms) {
                      var pos = easing(time / ms);
                      for (var attr in from) if (from[has](attr)) {
                          switch (availableAnimAttrs[attr]) {
                              case nu:
                                  now = +from[attr] + pos * ms * diff[attr];
                                  break;
                              case "colour":
                                  now = "rgb(" + [
                                      upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                      upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                      upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                  ].join(",") + ")";
                                  break;
                              case "path":
                                  now = [];
                                  for (var i = 0, ii = from[attr].length; i < ii; i++) {
                                      now[i] = [from[attr][i][0]];
                                      for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                          now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                      }
                                      now[i] = now[i].join(S);
                                  }
                                  now = now.join(S);
                                  break;
                              case "transform":
                                  if (diff[attr].real) {
                                      now = [];
                                      for (i = 0, ii = from[attr].length; i < ii; i++) {
                                          now[i] = [from[attr][i][0]];
                                          for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                              now[i][j] = from[attr][i][j] + pos * ms * diff[attr][i][j];
                                          }
                                      }
                                  } else {
                                      var get = function (i) {
                                          return +from[attr][i] + pos * ms * diff[attr][i];
                                      };
                                      // now = [["r", get(2), 0, 0], ["t", get(3), get(4)], ["s", get(0), get(1), 0, 0]];
                                      now = [["m", get(0), get(1), get(2), get(3), get(4), get(5)]];
                                  }
                                  break;
                              case "csv":
                                  if (attr == "clip-rect") {
                                      now = [];
                                      i = 4;
                                      while (i--) {
                                          now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                      }
                                  }
                                  break;
                              default:
                                  var from2 = [][concat](from[attr]);
                                  now = [];
                                  i = that.paper.customAttributes[attr].length;
                                  while (i--) {
                                      now[i] = +from2[i] + pos * ms * diff[attr][i];
                                  }
                                  break;
                          }
                          set[attr] = now;
                      }
                      that.attr(set);
                      (function (id, that, anim) {
                          setTimeout(function () {
                              eve("raphael.anim.frame." + id, that, anim);
                          });
                      })(that.id, that, e.anim);
                  } else {
                      (function(f, el, a) {
                          setTimeout(function() {
                              eve("raphael.anim.frame." + el.id, el, a);
                              eve("raphael.anim.finish." + el.id, el, a);
                              R.is(f, "function") && f.call(el);
                          });
                      })(e.callback, that, e.anim);
                      that.attr(to);
                      animationElements.splice(l--, 1);
                      if (e.repeat > 1 && !e.next) {
                          for (key in to) if (to[has](key)) {
                              init[key] = e.totalOrigin[key];
                          }
                          e.el.attr(init);
                          runAnimation(e.anim, e.el, e.anim.percents[0], null, e.totalOrigin, e.repeat - 1);
                      }
                      if (e.next && !e.stop) {
                          runAnimation(e.anim, e.el, e.next, null, e.totalOrigin, e.repeat);
                      }
                  }
              }
              R.svg && that && that.paper && that.paper.safari();
              animationElements.length && requestAnimFrame(animation);
          },
          upto255 = function (color) {
              return color > 255 ? 255 : color < 0 ? 0 : color;
          };
      
      elproto.animateWith = function (el, anim, params, ms, easing, callback) {
          var element = this;
          if (element.removed) {
              callback && callback.call(element);
              return element;
          }
          var a = params instanceof Animation ? params : R.animation(params, ms, easing, callback),
              x, y;
          runAnimation(a, element, a.percents[0], null, element.attr());
          for (var i = 0, ii = animationElements.length; i < ii; i++) {
              if (animationElements[i].anim == anim && animationElements[i].el == el) {
                  animationElements[ii - 1].start = animationElements[i].start;
                  break;
              }
          }
          return element;
          // 
          // 
          // var a = params ? R.animation(params, ms, easing, callback) : anim,
          //     status = element.status(anim);
          // return this.animate(a).status(a, status * anim.ms / a.ms);
      };
      function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
          var cx = 3 * p1x,
              bx = 3 * (p2x - p1x) - cx,
              ax = 1 - cx - bx,
              cy = 3 * p1y,
              by = 3 * (p2y - p1y) - cy,
              ay = 1 - cy - by;
          function sampleCurveX(t) {
              return ((ax * t + bx) * t + cx) * t;
          }
          function solve(x, epsilon) {
              var t = solveCurveX(x, epsilon);
              return ((ay * t + by) * t + cy) * t;
          }
          function solveCurveX(x, epsilon) {
              var t0, t1, t2, x2, d2, i;
              for(t2 = x, i = 0; i < 8; i++) {
                  x2 = sampleCurveX(t2) - x;
                  if (abs(x2) < epsilon) {
                      return t2;
                  }
                  d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                  if (abs(d2) < 1e-6) {
                      break;
                  }
                  t2 = t2 - x2 / d2;
              }
              t0 = 0;
              t1 = 1;
              t2 = x;
              if (t2 < t0) {
                  return t0;
              }
              if (t2 > t1) {
                  return t1;
              }
              while (t0 < t1) {
                  x2 = sampleCurveX(t2);
                  if (abs(x2 - x) < epsilon) {
                      return t2;
                  }
                  if (x > x2) {
                      t0 = t2;
                  } else {
                      t1 = t2;
                  }
                  t2 = (t1 - t0) / 2 + t0;
              }
              return t2;
          }
          return solve(t, 1 / (200 * duration));
      }
      elproto.onAnimation = function (f) {
          f ? eve.on("raphael.anim.frame." + this.id, f) : eve.unbind("raphael.anim.frame." + this.id);
          return this;
      };
      function Animation(anim, ms) {
          var percents = [],
              newAnim = {};
          this.ms = ms;
          this.times = 1;
          if (anim) {
              for (var attr in anim) if (anim[has](attr)) {
                  newAnim[toFloat(attr)] = anim[attr];
                  percents.push(toFloat(attr));
              }
              percents.sort(sortByNumber);
          }
          this.anim = newAnim;
          this.top = percents[percents.length - 1];
          this.percents = percents;
      }
      
      Animation.prototype.delay = function (delay) {
          var a = new Animation(this.anim, this.ms);
          a.times = this.times;
          a.del = +delay || 0;
          return a;
      };
      
      Animation.prototype.repeat = function (times) { 
          var a = new Animation(this.anim, this.ms);
          a.del = this.del;
          a.times = math.floor(mmax(times, 0)) || 1;
          return a;
      };
      function runAnimation(anim, element, percent, status, totalOrigin, times) {
          percent = toFloat(percent);
          var params,
              isInAnim,
              isInAnimSet,
              percents = [],
              next,
              prev,
              timestamp,
              ms = anim.ms,
              from = {},
              to = {},
              diff = {};
          if (status) {
              for (i = 0, ii = animationElements.length; i < ii; i++) {
                  var e = animationElements[i];
                  if (e.el.id == element.id && e.anim == anim) {
                      if (e.percent != percent) {
                          animationElements.splice(i, 1);
                          isInAnimSet = 1;
                      } else {
                          isInAnim = e;
                      }
                      element.attr(e.totalOrigin);
                      break;
                  }
              }
          } else {
              status = +to; // NaN
          }
          for (var i = 0, ii = anim.percents.length; i < ii; i++) {
              if (anim.percents[i] == percent || anim.percents[i] > status * anim.top) {
                  percent = anim.percents[i];
                  prev = anim.percents[i - 1] || 0;
                  ms = ms / anim.top * (percent - prev);
                  next = anim.percents[i + 1];
                  params = anim.anim[percent];
                  break;
              } else if (status) {
                  element.attr(anim.anim[anim.percents[i]]);
              }
          }
          if (!params) {
              return;
          }
          if (!isInAnim) {
              for (var attr in params) if (params[has](attr)) {
                  if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                      from[attr] = element.attr(attr);
                      (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                      to[attr] = params[attr];
                      switch (availableAnimAttrs[attr]) {
                          case nu:
                              diff[attr] = (to[attr] - from[attr]) / ms;
                              break;
                          case "colour":
                              from[attr] = R.getRGB(from[attr]);
                              var toColour = R.getRGB(to[attr]);
                              diff[attr] = {
                                  r: (toColour.r - from[attr].r) / ms,
                                  g: (toColour.g - from[attr].g) / ms,
                                  b: (toColour.b - from[attr].b) / ms
                              };
                              break;
                          case "path":
                              var pathes = path2curve(from[attr], to[attr]),
                                  toPath = pathes[1];
                              from[attr] = pathes[0];
                              diff[attr] = [];
                              for (i = 0, ii = from[attr].length; i < ii; i++) {
                                  diff[attr][i] = [0];
                                  for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                      diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                                  }
                              }
                              break;
                          case "transform":
                              var _ = element._,
                                  eq = equaliseTransform(_[attr], to[attr]);
                              if (eq) {
                                  from[attr] = eq.from;
                                  to[attr] = eq.to;
                                  diff[attr] = [];
                                  diff[attr].real = true;
                                  for (i = 0, ii = from[attr].length; i < ii; i++) {
                                      diff[attr][i] = [from[attr][i][0]];
                                      for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                          diff[attr][i][j] = (to[attr][i][j] - from[attr][i][j]) / ms;
                                      }
                                  }
                              } else {
                                  var m = (element.matrix || new Matrix),
                                      to2 = {
                                          _: {transform: _.transform},
                                          getBBox: function () {
                                              return element.getBBox(1);
                                          }
                                      };
                                  from[attr] = [
                                      m.a,
                                      m.b,
                                      m.c,
                                      m.d,
                                      m.e,
                                      m.f
                                  ];
                                  extractTransform(to2, to[attr]);
                                  to[attr] = to2._.transform;
                                  diff[attr] = [
                                      (to2.matrix.a - m.a) / ms,
                                      (to2.matrix.b - m.b) / ms,
                                      (to2.matrix.c - m.c) / ms,
                                      (to2.matrix.d - m.d) / ms,
                                      (to2.matrix.e - m.e) / ms,
                                      (to2.matrix.f - m.f) / ms
                                  ];
                                  // from[attr] = [_.sx, _.sy, _.deg, _.dx, _.dy];
                                  // var to2 = {_:{}, getBBox: function () { return element.getBBox(); }};
                                  // extractTransform(to2, to[attr]);
                                  // diff[attr] = [
                                  //     (to2._.sx - _.sx) / ms,
                                  //     (to2._.sy - _.sy) / ms,
                                  //     (to2._.deg - _.deg) / ms,
                                  //     (to2._.dx - _.dx) / ms,
                                  //     (to2._.dy - _.dy) / ms
                                  // ];
                              }
                              break;
                          case "csv":
                              var values = Str(params[attr])[split](separator),
                                  from2 = Str(from[attr])[split](separator);
                              if (attr == "clip-rect") {
                                  from[attr] = from2;
                                  diff[attr] = [];
                                  i = from2.length;
                                  while (i--) {
                                      diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                  }
                              }
                              to[attr] = values;
                              break;
                          default:
                              values = [][concat](params[attr]);
                              from2 = [][concat](from[attr]);
                              diff[attr] = [];
                              i = element.paper.customAttributes[attr].length;
                              while (i--) {
                                  diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                              }
                              break;
                      }
                  }
              }
              var easing = params.easing,
                  easyeasy = R.easing_formulas[easing];
              if (!easyeasy) {
                  easyeasy = Str(easing).match(bezierrg);
                  if (easyeasy && easyeasy.length == 5) {
                      var curve = easyeasy;
                      easyeasy = function (t) {
                          return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                      };
                  } else {
                      easyeasy = pipe;
                  }
              }
              timestamp = params.start || anim.start || +new Date;
              e = {
                  anim: anim,
                  percent: percent,
                  timestamp: timestamp,
                  start: timestamp + (anim.del || 0),
                  status: 0,
                  initstatus: status || 0,
                  stop: false,
                  ms: ms,
                  easing: easyeasy,
                  from: from,
                  diff: diff,
                  to: to,
                  el: element,
                  callback: params.callback,
                  prev: prev,
                  next: next,
                  repeat: times || anim.times,
                  origin: element.attr(),
                  totalOrigin: totalOrigin
              };
              animationElements.push(e);
              if (status && !isInAnim && !isInAnimSet) {
                  e.stop = true;
                  e.start = new Date - ms * status;
                  if (animationElements.length == 1) {
                      return animation();
                  }
              }
              if (isInAnimSet) {
                  e.start = new Date - e.ms * status;
              }
              animationElements.length == 1 && requestAnimFrame(animation);
          } else {
              isInAnim.initstatus = status;
              isInAnim.start = new Date - isInAnim.ms * status;
          }
          eve("raphael.anim.start." + element.id, element, anim);
      }
      
      R.animation = function (params, ms, easing, callback) {
          if (params instanceof Animation) {
              return params;
          }
          if (R.is(easing, "function") || !easing) {
              callback = callback || easing || null;
              easing = null;
          }
          params = Object(params);
          ms = +ms || 0;
          var p = {},
              json,
              attr;
          for (attr in params) if (params[has](attr) && toFloat(attr) != attr && toFloat(attr) + "%" != attr) {
              json = true;
              p[attr] = params[attr];
          }
          if (!json) {
              return new Animation(params, ms);
          } else {
              easing && (p.easing = easing);
              callback && (p.callback = callback);
              return new Animation({100: p}, ms);
          }
      };
      
      elproto.animate = function (params, ms, easing, callback) {
          var element = this;
          if (element.removed) {
              callback && callback.call(element);
              return element;
          }
          var anim = params instanceof Animation ? params : R.animation(params, ms, easing, callback);
          runAnimation(anim, element, anim.percents[0], null, element.attr());
          return element;
      };
      
      elproto.setTime = function (anim, value) {
          if (anim && value != null) {
              this.status(anim, mmin(value, anim.ms) / anim.ms);
          }
          return this;
      };
      
      elproto.status = function (anim, value) {
          var out = [],
              i = 0,
              len,
              e;
          if (value != null) {
              runAnimation(anim, this, -1, mmin(value, 1));
              return this;
          } else {
              len = animationElements.length;
              for (; i < len; i++) {
                  e = animationElements[i];
                  if (e.el.id == this.id && (!anim || e.anim == anim)) {
                      if (anim) {
                          return e.status;
                      }
                      out.push({
                          anim: e.anim,
                          status: e.status
                      });
                  }
              }
              if (anim) {
                  return 0;
              }
              return out;
          }
      };
      
      elproto.pause = function (anim) {
          for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
              if (eve("raphael.anim.pause." + this.id, this, animationElements[i].anim) !== false) {
                  animationElements[i].paused = true;
              }
          }
          return this;
      };
      
      elproto.resume = function (anim) {
          for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
              var e = animationElements[i];
              if (eve("raphael.anim.resume." + this.id, this, e.anim) !== false) {
                  delete e.paused;
                  this.status(e.anim, e.status);
              }
          }
          return this;
      };
      
      elproto.stop = function (anim) {
          for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
              if (eve("raphael.anim.stop." + this.id, this, animationElements[i].anim) !== false) {
                  animationElements.splice(i--, 1);
              }
          }
          return this;
      };
      function stopAnimation(paper) {
          for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.paper == paper) {
              animationElements.splice(i--, 1);
          }
      }
      eve.on("raphael.remove", stopAnimation);
      eve.on("raphael.clear", stopAnimation);
      elproto.toString = function () {
          return "Rapha\xebl\u2019s object";
      };

      // Set
      var Set = function (items) {
          this.items = [];
          this.length = 0;
          this.type = "set";
          if (items) {
              for (var i = 0, ii = items.length; i < ii; i++) {
                  if (items[i] && (items[i].constructor == elproto.constructor || items[i].constructor == Set)) {
                      this[this.items.length] = this.items[this.items.length] = items[i];
                      this.length++;
                  }
              }
          }
      },
      setproto = Set.prototype;
      
      setproto.push = function () {
          var item,
              len;
          for (var i = 0, ii = arguments.length; i < ii; i++) {
              item = arguments[i];
              if (item && (item.constructor == elproto.constructor || item.constructor == Set)) {
                  len = this.items.length;
                  this[len] = this.items[len] = item;
                  this.length++;
              }
          }
          return this;
      };
      
      setproto.pop = function () {
          this.length && delete this[this.length--];
          return this.items.pop();
      };
      
      setproto.forEach = function (callback, thisArg) {
          for (var i = 0, ii = this.items.length; i < ii; i++) {
              if (callback.call(thisArg, this.items[i], i) === false) {
                  return this;
              }
          }
          return this;
      };
      for (var method in elproto) if (elproto[has](method)) {
          setproto[method] = (function (methodname) {
              return function () {
                  var arg = arguments;
                  return this.forEach(function (el) {
                      el[methodname][apply](el, arg);
                  });
              };
          })(method);
      }
      setproto.attr = function (name, value) {
          if (name && R.is(name, array) && R.is(name[0], "object")) {
              for (var j = 0, jj = name.length; j < jj; j++) {
                  this.items[j].attr(name[j]);
              }
          } else {
              for (var i = 0, ii = this.items.length; i < ii; i++) {
                  this.items[i].attr(name, value);
              }
          }
          return this;
      };
      
      setproto.clear = function () {
          while (this.length) {
              this.pop();
          }
      };
      
      setproto.splice = function (index, count, insertion) {
          index = index < 0 ? mmax(this.length + index, 0) : index;
          count = mmax(0, mmin(this.length - index, count));
          var tail = [],
              todel = [],
              args = [],
              i;
          for (i = 2; i < arguments.length; i++) {
              args.push(arguments[i]);
          }
          for (i = 0; i < count; i++) {
              todel.push(this[index + i]);
          }
          for (; i < this.length - index; i++) {
              tail.push(this[index + i]);
          }
          var arglen = args.length;
          for (i = 0; i < arglen + tail.length; i++) {
              this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
          }
          i = this.items.length = this.length -= count - arglen;
          while (this[i]) {
              delete this[i++];
          }
          return new Set(todel);
      };
      
      setproto.exclude = function (el) {
          for (var i = 0, ii = this.length; i < ii; i++) if (this[i] == el) {
              this.splice(i, 1);
              return true;
          }
      };
      setproto.animate = function (params, ms, easing, callback) {
          (R.is(easing, "function") || !easing) && (callback = easing || null);
          var len = this.items.length,
              i = len,
              item,
              set = this,
              collector;
          if (!len) {
              return this;
          }
          callback && (collector = function () {
              !--len && callback.call(set);
          });
          easing = R.is(easing, string) ? easing : collector;
          var anim = R.animation(params, ms, easing, collector);
          item = this.items[--i].animate(anim);
          while (i--) {
              this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, anim, anim);
          }
          return this;
      };
      setproto.insertAfter = function (el) {
          var i = this.items.length;
          while (i--) {
              this.items[i].insertAfter(el);
          }
          return this;
      };
      setproto.getBBox = function () {
          var x = [],
              y = [],
              x2 = [],
              y2 = [];
          for (var i = this.items.length; i--;) if (!this.items[i].removed) {
              var box = this.items[i].getBBox();
              x.push(box.x);
              y.push(box.y);
              x2.push(box.x + box.width);
              y2.push(box.y + box.height);
          }
          x = mmin[apply](0, x);
          y = mmin[apply](0, y);
          x2 = mmax[apply](0, x2);
          y2 = mmax[apply](0, y2);
          return {
              x: x,
              y: y,
              x2: x2,
              y2: y2,
              width: x2 - x,
              height: y2 - y
          };
      };
      setproto.clone = function (s) {
          s = new Set;
          for (var i = 0, ii = this.items.length; i < ii; i++) {
              s.push(this.items[i].clone());
          }
          return s;
      };
      setproto.toString = function () {
          return "Rapha\xebl\u2018s set";
      };

      
      R.registerFont = function (font) {
          if (!font.face) {
              return font;
          }
          this.fonts = this.fonts || {};
          var fontcopy = {
                  w: font.w,
                  face: {},
                  glyphs: {}
              },
              family = font.face["font-family"];
          for (var prop in font.face) if (font.face[has](prop)) {
              fontcopy.face[prop] = font.face[prop];
          }
          if (this.fonts[family]) {
              this.fonts[family].push(fontcopy);
          } else {
              this.fonts[family] = [fontcopy];
          }
          if (!font.svg) {
              fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
              for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                  var path = font.glyphs[glyph];
                  fontcopy.glyphs[glyph] = {
                      w: path.w,
                      k: {},
                      d: path.d && "M" + path.d.replace(/[mlcxtrv]/g, function (command) {
                              return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                          }) + "z"
                  };
                  if (path.k) {
                      for (var k in path.k) if (path[has](k)) {
                          fontcopy.glyphs[glyph].k[k] = path.k[k];
                      }
                  }
              }
          }
          return font;
      };
      
      paperproto.getFont = function (family, weight, style, stretch) {
          stretch = stretch || "normal";
          style = style || "normal";
          weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
          if (!R.fonts) {
              return;
          }
          var font = R.fonts[family];
          if (!font) {
              var name = new RegExp("(^|\\s)" + family.replace(/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
              for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                  if (name.test(fontName)) {
                      font = R.fonts[fontName];
                      break;
                  }
              }
          }
          var thefont;
          if (font) {
              for (var i = 0, ii = font.length; i < ii; i++) {
                  thefont = font[i];
                  if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                      break;
                  }
              }
          }
          return thefont;
      };
      
      paperproto.print = function (x, y, string, font, size, origin, letter_spacing) {
          origin = origin || "middle"; // baseline|middle
          letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
          var letters = Str(string)[split](E),
              shift = 0,
              notfirst = 0,
              path = E,
              scale;
          R.is(font, string) && (font = this.getFont(font));
          if (font) {
              scale = (size || 16) / font.face["units-per-em"];
              var bb = font.face.bbox[split](separator),
                  top = +bb[0],
                  lineHeight = bb[3] - bb[1],
                  shifty = 0,
                  height = +bb[1] + (origin == "baseline" ? lineHeight + (+font.face.descent) : lineHeight / 2);
              for (var i = 0, ii = letters.length; i < ii; i++) {
                  if (letters[i] == "\n") {
                      shift = 0;
                      curr = 0;
                      notfirst = 0;
                      shifty += lineHeight;
                  } else {
                      var prev = notfirst && font.glyphs[letters[i - 1]] || {},
                          curr = font.glyphs[letters[i]];
                      shift += notfirst ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                      notfirst = 1;
                  }
                  if (curr && curr.d) {
                      path += R.transformPath(curr.d, ["t", shift * scale, shifty * scale, "s", scale, scale, top, height, "t", (x - top) / scale, (y - height) / scale]);
                  }
              }
          }
          return this.path(path).attr({
              fill: "#000",
              stroke: "none"
          });
      };

      
      paperproto.add = function (json) {
          if (R.is(json, "array")) {
              var res = this.set(),
                  i = 0,
                  ii = json.length,
                  j;
              for (; i < ii; i++) {
                  j = json[i] || {};
                  elements[has](j.type) && res.push(this[j.type]().attr(j));
              }
          }
          return res;
      };

      
      R.format = function (token, params) {
          var args = R.is(params, array) ? [0][concat](params) : arguments;
          token && R.is(token, string) && args.length - 1 && (token = token.replace(formatrg, function (str, i) {
              return args[++i] == null ? E : args[i];
          }));
          return token || E;
      };
      
      R.fullfill = (function () {
          var tokenRegex = /\{([^\}]+)\}/g,
              objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches .xxxxx or ["xxxxx"] to run over object properties
              replacer = function (all, key, obj) {
                  var res = obj;
                  key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
                      name = name || quotedName;
                      if (res) {
                          if (name in res) {
                              res = res[name];
                          }
                          typeof res == "function" && isFunc && (res = res());
                      }
                  });
                  res = (res == null || res == obj ? all : res) + "";
                  return res;
              };
          return function (str, obj) {
              return String(str).replace(tokenRegex, function (all, key) {
                  return replacer(all, key, obj);
              });
          };
      })();
      
      R.ninja = function () {
          oldRaphael.was ? (g.win.Raphael = oldRaphael.is) : delete Raphael;
          return R;
      };
      
      R.st = setproto;
      // Firefox <3.6 fix: http://webreflection.blogspot.com/2009/11/195-chars-to-help-lazy-loading.html
      (function (doc, loaded, f) {
          if (doc.readyState == null && doc.addEventListener){
              doc.addEventListener(loaded, f = function () {
                  doc.removeEventListener(loaded, f, false);
                  doc.readyState = "complete";
              }, false);
              doc.readyState = "loading";
          }
          function isLoaded() {
              (/in/).test(doc.readyState) ? setTimeout(isLoaded, 9) : R.eve("raphael.DOMload");
          }
          isLoaded();
      })(document, "DOMContentLoaded");

      oldRaphael.was ? (g.win.Raphael = R) : (Raphael = R);
      
      eve.on("raphael.DOMload", function () {
          loaded = true;
      });
  })();


  // ┌─────────────────────────────────────────────────────────────────────┐ \\
  // │ Raphaël - JavaScript Vector Library                                 │ \\
  // ├─────────────────────────────────────────────────────────────────────┤ \\
  // │ SVG Module                                                          │ \\
  // ├─────────────────────────────────────────────────────────────────────┤ \\
  // │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
  // │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
  // │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
  // └─────────────────────────────────────────────────────────────────────┘ \\
  window.Raphael.svg && function (R) {
      var has = "hasOwnProperty",
          Str = String,
          toFloat = parseFloat,
          toInt = parseInt,
          math = Math,
          mmax = math.max,
          abs = math.abs,
          pow = math.pow,
          separator = /[, ]+/,
          eve = R.eve,
          E = "",
          S = " ";
      var xlink = "http://www.w3.org/1999/xlink",
          markers = {
              block: "M5,0 0,2.5 5,5z",
              classic: "M5,0 0,2.5 5,5 3.5,3 3.5,2z",
              diamond: "M2.5,0 5,2.5 2.5,5 0,2.5z",
              open: "M6,1 1,3.5 6,6",
              oval: "M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"
          },
          markerCounter = {};
      R.toString = function () {
          return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
      };
      var $ = function (el, attr) {
          if (attr) {
              if (typeof el == "string") {
                  el = $(el);
              }
              for (var key in attr) if (attr[has](key)) {
                  if (key.substring(0, 6) == "xlink:") {
                      el.setAttributeNS(xlink, key.substring(6), Str(attr[key]));
                  } else {
                      el.setAttribute(key, Str(attr[key]));
                  }
              }
          } else {
              el = R._g.doc.createElementNS("http://www.w3.org/2000/svg", el);
              el.style && (el.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
          }
          return el;
      },
      addGradientFill = function (element, gradient) {
          var type = "linear",
              id = element.id + gradient,
              fx = .5, fy = .5,
              o = element.node,
              SVG = element.paper,
              s = o.style,
              el = R._g.doc.getElementById(id);
          if (!el) {
              gradient = Str(gradient).replace(R._radial_gradient, function (all, _fx, _fy) {
                  type = "radial";
                  if (_fx && _fy) {
                      fx = toFloat(_fx);
                      fy = toFloat(_fy);
                      var dir = ((fy > .5) * 2 - 1);
                      pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                          (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                          fy != .5 &&
                          (fy = fy.toFixed(5) - 1e-5 * dir);
                  }
                  return E;
              });
              gradient = gradient.split(/\s*\-\s*/);
              if (type == "linear") {
                  var angle = gradient.shift();
                  angle = -toFloat(angle);
                  if (isNaN(angle)) {
                      return null;
                  }
                  var vector = [0, 0, math.cos(R.rad(angle)), math.sin(R.rad(angle))],
                      max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                  vector[2] *= max;
                  vector[3] *= max;
                  if (vector[2] < 0) {
                      vector[0] = -vector[2];
                      vector[2] = 0;
                  }
                  if (vector[3] < 0) {
                      vector[1] = -vector[3];
                      vector[3] = 0;
                  }
              }
              var dots = R._parseDots(gradient);
              if (!dots) {
                  return null;
              }
              id = id.replace(/[\(\)\s,\xb0#]/g, "_");
              
              if (element.gradient && id != element.gradient.id) {
                  SVG.defs.removeChild(element.gradient);
                  delete element.gradient;
              }

              if (!element.gradient) {
                  el = $(type + "Gradient", {id: id});
                  element.gradient = el;
                  $(el, type == "radial" ? {
                      fx: fx,
                      fy: fy
                  } : {
                      x1: vector[0],
                      y1: vector[1],
                      x2: vector[2],
                      y2: vector[3],
                      gradientTransform: element.matrix.invert()
                  });
                  SVG.defs.appendChild(el);
                  for (var i = 0, ii = dots.length; i < ii; i++) {
                      el.appendChild($("stop", {
                          offset: dots[i].offset ? dots[i].offset : i ? "100%" : "0%",
                          "stop-color": dots[i].color || "#fff"
                      }));
                  }
              }
          }
          $(o, {
              fill: "url(#" + id + ")",
              opacity: 1,
              "fill-opacity": 1
          });
          s.fill = E;
          s.opacity = 1;
          s.fillOpacity = 1;
          return 1;
      },
      updatePosition = function (o) {
          var bbox = o.getBBox(1);
          $(o.pattern, {patternTransform: o.matrix.invert() + " translate(" + bbox.x + "," + bbox.y + ")"});
      },
      addArrow = function (o, value, isEnd) {
          if (o.type == "path") {
              var values = Str(value).toLowerCase().split("-"),
                  p = o.paper,
                  se = isEnd ? "end" : "start",
                  node = o.node,
                  attrs = o.attrs,
                  stroke = attrs["stroke-width"],
                  i = values.length,
                  type = "classic",
                  from,
                  to,
                  dx,
                  refX,
                  attr,
                  w = 3,
                  h = 3,
                  t = 5;
              while (i--) {
                  switch (values[i]) {
                      case "block":
                      case "classic":
                      case "oval":
                      case "diamond":
                      case "open":
                      case "none":
                          type = values[i];
                          break;
                      case "wide": h = 5; break;
                      case "narrow": h = 2; break;
                      case "long": w = 5; break;
                      case "short": w = 2; break;
                  }
              }
              if (type == "open") {
                  w += 2;
                  h += 2;
                  t += 2;
                  dx = 1;
                  refX = isEnd ? 4 : 1;
                  attr = {
                      fill: "none",
                      stroke: attrs.stroke
                  };
              } else {
                  refX = dx = w / 2;
                  attr = {
                      fill: attrs.stroke,
                      stroke: "none"
                  };
              }
              if (o._.arrows) {
                  if (isEnd) {
                      o._.arrows.endPath && markerCounter[o._.arrows.endPath]--;
                      o._.arrows.endMarker && markerCounter[o._.arrows.endMarker]--;
                  } else {
                      o._.arrows.startPath && markerCounter[o._.arrows.startPath]--;
                      o._.arrows.startMarker && markerCounter[o._.arrows.startMarker]--;
                  }
              } else {
                  o._.arrows = {};
              }
              if (type != "none") {
                  var pathId = "raphael-marker-" + type,
                      markerId = "raphael-marker-" + se + type + w + h;
                  if (!R._g.doc.getElementById(pathId)) {
                      p.defs.appendChild($($("path"), {
                          "stroke-linecap": "round",
                          d: markers[type],
                          id: pathId
                      }));
                      markerCounter[pathId] = 1;
                  } else {
                      markerCounter[pathId]++;
                  }
                  var marker = R._g.doc.getElementById(markerId),
                      use;
                  if (!marker) {
                      marker = $($("marker"), {
                          id: markerId,
                          markerHeight: h,
                          markerWidth: w,
                          orient: "auto",
                          refX: refX,
                          refY: h / 2
                      });
                      use = $($("use"), {
                          "xlink:href": "#" + pathId,
                          transform: (isEnd ? "rotate(180 " + w / 2 + " " + h / 2 + ") " : E) + "scale(" + w / t + "," + h / t + ")",
                          "stroke-width": (1 / ((w / t + h / t) / 2)).toFixed(4)
                      });
                      marker.appendChild(use);
                      p.defs.appendChild(marker);
                      markerCounter[markerId] = 1;
                  } else {
                      markerCounter[markerId]++;
                      use = marker.getElementsByTagName("use")[0];
                  }
                  $(use, attr);
                  var delta = dx * (type != "diamond" && type != "oval");
                  if (isEnd) {
                      from = o._.arrows.startdx * stroke || 0;
                      to = R.getTotalLength(attrs.path) - delta * stroke;
                  } else {
                      from = delta * stroke;
                      to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                  }
                  attr = {};
                  attr["marker-" + se] = "url(#" + markerId + ")";
                  if (to || from) {
                      attr.d = Raphael.getSubpath(attrs.path, from, to);
                  }
                  $(node, attr);
                  o._.arrows[se + "Path"] = pathId;
                  o._.arrows[se + "Marker"] = markerId;
                  o._.arrows[se + "dx"] = delta;
                  o._.arrows[se + "Type"] = type;
                  o._.arrows[se + "String"] = value;
              } else {
                  if (isEnd) {
                      from = o._.arrows.startdx * stroke || 0;
                      to = R.getTotalLength(attrs.path) - from;
                  } else {
                      from = 0;
                      to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                  }
                  o._.arrows[se + "Path"] && $(node, {d: Raphael.getSubpath(attrs.path, from, to)});
                  delete o._.arrows[se + "Path"];
                  delete o._.arrows[se + "Marker"];
                  delete o._.arrows[se + "dx"];
                  delete o._.arrows[se + "Type"];
                  delete o._.arrows[se + "String"];
              }
              for (attr in markerCounter) if (markerCounter[has](attr) && !markerCounter[attr]) {
                  var item = R._g.doc.getElementById(attr);
                  item && item.parentNode.removeChild(item);
              }
          }
      },
      dasharray = {
          "": [0],
          "none": [0],
          "-": [3, 1],
          ".": [1, 1],
          "-.": [3, 1, 1, 1],
          "-..": [3, 1, 1, 1, 1, 1],
          ". ": [1, 3],
          "- ": [4, 3],
          "--": [8, 3],
          "- .": [4, 3, 1, 3],
          "--.": [8, 3, 1, 3],
          "--..": [8, 3, 1, 3, 1, 3]
      },
      addDashes = function (o, value, params) {
          value = dasharray[Str(value).toLowerCase()];
          if (value) {
              var width = o.attrs["stroke-width"] || "1",
                  butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                  dashes = [],
                  i = value.length;
              while (i--) {
                  dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
              }
              $(o.node, {"stroke-dasharray": dashes.join(",")});
          }
      },
      setFillAndStroke = function (o, params) {
          var node = o.node,
              attrs = o.attrs,
              vis = node.style.visibility;
          node.style.visibility = "hidden";
          for (var att in params) {
              if (params[has](att)) {
                  if (!R._availableAttrs[has](att)) {
                      continue;
                  }
                  var value = params[att];
                  attrs[att] = value;
                  switch (att) {
                      case "blur":
                          o.blur(value);
                          break;
                      case "href":
                      case "title":
                      case "target":
                          var pn = node.parentNode;
                          if (pn.tagName.toLowerCase() != "a") {
                              var hl = $("a");
                              pn.insertBefore(hl, node);
                              hl.appendChild(node);
                              pn = hl;
                          }
                          if (att == "target") {
                              pn.setAttributeNS(xlink, "show", value == "blank" ? "new" : value);
                          } else {
                              pn.setAttributeNS(xlink, att, value);
                          }
                          break;
                      case "cursor":
                          node.style.cursor = value;
                          break;
                      case "transform":
                          o.transform(value);
                          break;
                      case "arrow-start":
                          addArrow(o, value);
                          break;
                      case "arrow-end":
                          addArrow(o, value, 1);
                          break;
                      case "clip-rect":
                          var rect = Str(value).split(separator);
                          if (rect.length == 4) {
                              o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                              var el = $("clipPath"),
                                  rc = $("rect");
                              el.id = R.createUUID();
                              $(rc, {
                                  x: rect[0],
                                  y: rect[1],
                                  width: rect[2],
                                  height: rect[3]
                              });
                              el.appendChild(rc);
                              o.paper.defs.appendChild(el);
                              $(node, {"clip-path": "url(#" + el.id + ")"});
                              o.clip = rc;
                          }
                          if (!value) {
                              var path = node.getAttribute("clip-path");
                              if (path) {
                                  var clip = R._g.doc.getElementById(path.replace(/(^url\(#|\)$)/g, E));
                                  clip && clip.parentNode.removeChild(clip);
                                  $(node, {"clip-path": E});
                                  delete o.clip;
                              }
                          }
                      break;
                      case "path":
                          if (o.type == "path") {
                              $(node, {d: value ? attrs.path = R._pathToAbsolute(value) : "M0,0"});
                              o._.dirty = 1;
                              if (o._.arrows) {
                                  "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                                  "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                              }
                          }
                          break;
                      case "width":
                          node.setAttribute(att, value);
                          o._.dirty = 1;
                          if (attrs.fx) {
                              att = "x";
                              value = attrs.x;
                          } else {
                              break;
                          }
                      case "x":
                          if (attrs.fx) {
                              value = -attrs.x - (attrs.width || 0);
                          }
                      case "rx":
                          if (att == "rx" && o.type == "rect") {
                              break;
                          }
                      case "cx":
                          node.setAttribute(att, value);
                          o.pattern && updatePosition(o);
                          o._.dirty = 1;
                          break;
                      case "height":
                          node.setAttribute(att, value);
                          o._.dirty = 1;
                          if (attrs.fy) {
                              att = "y";
                              value = attrs.y;
                          } else {
                              break;
                          }
                      case "y":
                          if (attrs.fy) {
                              value = -attrs.y - (attrs.height || 0);
                          }
                      case "ry":
                          if (att == "ry" && o.type == "rect") {
                              break;
                          }
                      case "cy":
                          node.setAttribute(att, value);
                          o.pattern && updatePosition(o);
                          o._.dirty = 1;
                          break;
                      case "r":
                          if (o.type == "rect") {
                              $(node, {rx: value, ry: value});
                          } else {
                              node.setAttribute(att, value);
                          }
                          o._.dirty = 1;
                          break;
                      case "src":
                          if (o.type == "image") {
                              node.setAttributeNS(xlink, "href", value);
                          }
                          break;
                      case "stroke-width":
                          if (o._.sx != 1 || o._.sy != 1) {
                              value /= mmax(abs(o._.sx), abs(o._.sy)) || 1;
                          }
                          if (o.paper._vbSize) {
                              value *= o.paper._vbSize;
                          }
                          node.setAttribute(att, value);
                          if (attrs["stroke-dasharray"]) {
                              addDashes(o, attrs["stroke-dasharray"], params);
                          }
                          if (o._.arrows) {
                              "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                              "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                          }
                          break;
                      case "stroke-dasharray":
                          addDashes(o, value, params);
                          break;
                      case "fill":
                          var isURL = Str(value).match(R._ISURL);
                          if (isURL) {
                              el = $("pattern");
                              var ig = $("image");
                              el.id = R.createUUID();
                              $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                              $(ig, {x: 0, y: 0, "xlink:href": isURL[1]});
                              el.appendChild(ig);

                              (function (el) {
                                  R._preload(isURL[1], function () {
                                      var w = this.offsetWidth,
                                          h = this.offsetHeight;
                                      $(el, {width: w, height: h});
                                      $(ig, {width: w, height: h});
                                      o.paper.safari();
                                  });
                              })(el);
                              o.paper.defs.appendChild(el);
                              $(node, {fill: "url(#" + el.id + ")"});
                              o.pattern = el;
                              o.pattern && updatePosition(o);
                              break;
                          }
                          var clr = R.getRGB(value);
                          if (!clr.error) {
                              delete params.gradient;
                              delete attrs.gradient;
                              !R.is(attrs.opacity, "undefined") &&
                                  R.is(params.opacity, "undefined") &&
                                  $(node, {opacity: attrs.opacity});
                              !R.is(attrs["fill-opacity"], "undefined") &&
                                  R.is(params["fill-opacity"], "undefined") &&
                                  $(node, {"fill-opacity": attrs["fill-opacity"]});
                          } else if ((o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value)) {
                              if ("opacity" in attrs || "fill-opacity" in attrs) {
                                  var gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                                  if (gradient) {
                                      var stops = gradient.getElementsByTagName("stop");
                                      $(stops[stops.length - 1], {"stop-opacity": ("opacity" in attrs ? attrs.opacity : 1) * ("fill-opacity" in attrs ? attrs["fill-opacity"] : 1)});
                                  }
                              }
                              attrs.gradient = value;
                              attrs.fill = "none";
                              break;
                          }
                          clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                      case "stroke":
                          clr = R.getRGB(value);
                          node.setAttribute(att, clr.hex);
                          att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                          if (att == "stroke" && o._.arrows) {
                              "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                              "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                          }
                          break;
                      case "gradient":
                          (o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value);
                          break;
                      case "opacity":
                          if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                              $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                          }
                          // fall
                      case "fill-opacity":
                          if (attrs.gradient) {
                              gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                              if (gradient) {
                                  stops = gradient.getElementsByTagName("stop");
                                  $(stops[stops.length - 1], {"stop-opacity": value});
                              }
                              break;
                          }
                      default:
                          att == "font-size" && (value = toInt(value, 10) + "px");
                          var cssrule = att.replace(/(\-.)/g, function (w) {
                              return w.substring(1).toUpperCase();
                          });
                          node.style[cssrule] = value;
                          o._.dirty = 1;
                          node.setAttribute(att, value);
                          break;
                  }
              }
          }

          tuneText(o, params);
          node.style.visibility = vis;
      },
      leading = 1.2,
      tuneText = function (el, params) {
          if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
              return;
          }
          var a = el.attrs,
              node = el.node,
              fontSize = node.firstChild ? toInt(R._g.doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

          if (params[has]("text")) {
              a.text = params.text;
              while (node.firstChild) {
                  node.removeChild(node.firstChild);
              }
              var texts = Str(params.text).split("\n"),
                  tspans = [],
                  tspan;
              for (var i = 0, ii = texts.length; i < ii; i++) {
                  tspan = $("tspan");
                  i && $(tspan, {dy: fontSize * leading, x: a.x});
                  tspan.appendChild(R._g.doc.createTextNode(texts[i]));
                  node.appendChild(tspan);
                  tspans[i] = tspan;
              }
          } else {
              tspans = node.getElementsByTagName("tspan");
              for (i = 0, ii = tspans.length; i < ii; i++) if (i) {
                  $(tspans[i], {dy: fontSize * leading, x: a.x});
              } else {
                  $(tspans[0], {dy: 0});
              }
          }
          $(node, {x: a.x, y: a.y});
          el._.dirty = 1;
          var bb = el._getBBox(),
              dif = a.y - (bb.y + bb.height / 2);
          dif && R.is(dif, "finite") && $(tspans[0], {dy: dif});
      },
      Element = function (node, svg) {
          var X = 0,
              Y = 0;
          
          this[0] = this.node = node;
          
          node.raphael = true;
          
          this.id = R._oid++;
          node.raphaelid = this.id;
          this.matrix = R.matrix();
          this.realPath = null;
          
          this.paper = svg;
          this.attrs = this.attrs || {};
          this._ = {
              transform: [],
              sx: 1,
              sy: 1,
              deg: 0,
              dx: 0,
              dy: 0,
              dirty: 1
          };
          !svg.bottom && (svg.bottom = this);
          
          this.prev = svg.top;
          svg.top && (svg.top.next = this);
          svg.top = this;
          
          this.next = null;
      },
      elproto = R.el;

      Element.prototype = elproto;
      elproto.constructor = Element;

      R._engine.path = function (pathString, SVG) {
          var el = $("path");
          SVG.canvas && SVG.canvas.appendChild(el);
          var p = new Element(el, SVG);
          p.type = "path";
          setFillAndStroke(p, {
              fill: "none",
              stroke: "#000",
              path: pathString
          });
          return p;
      };
      
      elproto.rotate = function (deg, cx, cy) {
          if (this.removed) {
              return this;
          }
          deg = Str(deg).split(separator);
          if (deg.length - 1) {
              cx = toFloat(deg[1]);
              cy = toFloat(deg[2]);
          }
          deg = toFloat(deg[0]);
          (cy == null) && (cx = cy);
          if (cx == null || cy == null) {
              var bbox = this.getBBox(1);
              cx = bbox.x + bbox.width / 2;
              cy = bbox.y + bbox.height / 2;
          }
          this.transform(this._.transform.concat([["r", deg, cx, cy]]));
          return this;
      };
      
      elproto.scale = function (sx, sy, cx, cy) {
          if (this.removed) {
              return this;
          }
          sx = Str(sx).split(separator);
          if (sx.length - 1) {
              sy = toFloat(sx[1]);
              cx = toFloat(sx[2]);
              cy = toFloat(sx[3]);
          }
          sx = toFloat(sx[0]);
          (sy == null) && (sy = sx);
          (cy == null) && (cx = cy);
          if (cx == null || cy == null) {
              var bbox = this.getBBox(1);
          }
          cx = cx == null ? bbox.x + bbox.width / 2 : cx;
          cy = cy == null ? bbox.y + bbox.height / 2 : cy;
          this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
          return this;
      };
      
      elproto.translate = function (dx, dy) {
          if (this.removed) {
              return this;
          }
          dx = Str(dx).split(separator);
          if (dx.length - 1) {
              dy = toFloat(dx[1]);
          }
          dx = toFloat(dx[0]) || 0;
          dy = +dy || 0;
          this.transform(this._.transform.concat([["t", dx, dy]]));
          return this;
      };
      
      elproto.transform = function (tstr) {
          var _ = this._;
          if (tstr == null) {
              return _.transform;
          }
          R._extractTransform(this, tstr);

          this.clip && $(this.clip, {transform: this.matrix.invert()});
          this.pattern && updatePosition(this);
          this.node && $(this.node, {transform: this.matrix});
      
          if (_.sx != 1 || _.sy != 1) {
              var sw = this.attrs[has]("stroke-width") ? this.attrs["stroke-width"] : 1;
              this.attr({"stroke-width": sw});
          }

          return this;
      };
      
      elproto.hide = function () {
          !this.removed && this.paper.safari(this.node.style.display = "none");
          return this;
      };
      
      elproto.show = function () {
          !this.removed && this.paper.safari(this.node.style.display = "");
          return this;
      };
      
      elproto.remove = function () {
          if (this.removed || !this.node.parentNode) {
              return;
          }
          var paper = this.paper;
          paper.__set__ && paper.__set__.exclude(this);
          eve.unbind("raphael.*.*." + this.id);
          if (this.gradient) {
              paper.defs.removeChild(this.gradient);
          }
          R._tear(this, paper);
          if (this.node.parentNode.tagName.toLowerCase() == "a") {
              this.node.parentNode.parentNode.removeChild(this.node.parentNode);
          } else {
              this.node.parentNode.removeChild(this.node);
          }
          for (var i in this) {
              this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
          }
          this.removed = true;
      };
      elproto._getBBox = function () {
          if (this.node.style.display == "none") {
              this.show();
              var hide = true;
          }
          var bbox = {};
          try {
              bbox = this.node.getBBox();
          } catch(e) {
              // Firefox 3.0.x plays badly here
          } finally {
              bbox = bbox || {};
          }
          hide && this.hide();
          return bbox;
      };
      
      elproto.attr = function (name, value) {
          if (this.removed) {
              return this;
          }
          if (name == null) {
              var res = {};
              for (var a in this.attrs) if (this.attrs[has](a)) {
                  res[a] = this.attrs[a];
              }
              res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
              res.transform = this._.transform;
              return res;
          }
          if (value == null && R.is(name, "string")) {
              if (name == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                  return this.attrs.gradient;
              }
              if (name == "transform") {
                  return this._.transform;
              }
              var names = name.split(separator),
                  out = {};
              for (var i = 0, ii = names.length; i < ii; i++) {
                  name = names[i];
                  if (name in this.attrs) {
                      out[name] = this.attrs[name];
                  } else if (R.is(this.paper.customAttributes[name], "function")) {
                      out[name] = this.paper.customAttributes[name].def;
                  } else {
                      out[name] = R._availableAttrs[name];
                  }
              }
              return ii - 1 ? out : out[names[0]];
          }
          if (value == null && R.is(name, "array")) {
              out = {};
              for (i = 0, ii = name.length; i < ii; i++) {
                  out[name[i]] = this.attr(name[i]);
              }
              return out;
          }
          if (value != null) {
              var params = {};
              params[name] = value;
          } else if (name != null && R.is(name, "object")) {
              params = name;
          }
          for (var key in params) {
              eve("raphael.attr." + key + "." + this.id, this, params[key]);
          }
          for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
              var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
              this.attrs[key] = params[key];
              for (var subkey in par) if (par[has](subkey)) {
                  params[subkey] = par[subkey];
              }
          }
          setFillAndStroke(this, params);
          return this;
      };
      
      elproto.toFront = function () {
          if (this.removed) {
              return this;
          }
          if (this.node.parentNode.tagName.toLowerCase() == "a") {
              this.node.parentNode.parentNode.appendChild(this.node.parentNode);
          } else {
              this.node.parentNode.appendChild(this.node);
          }
          var svg = this.paper;
          svg.top != this && R._tofront(this, svg);
          return this;
      };
      
      elproto.toBack = function () {
          if (this.removed) {
              return this;
          }
          var parent = this.node.parentNode;
          if (parent.tagName.toLowerCase() == "a") {
              parent.parentNode.insertBefore(this.node.parentNode, this.node.parentNode.parentNode.firstChild); 
          } else if (parent.firstChild != this.node) {
              parent.insertBefore(this.node, this.node.parentNode.firstChild);
          }
          R._toback(this, this.paper);
          var svg = this.paper;
          return this;
      };
      
      elproto.insertAfter = function (element) {
          if (this.removed) {
              return this;
          }
          var node = element.node || element[element.length - 1].node;
          if (node.nextSibling) {
              node.parentNode.insertBefore(this.node, node.nextSibling);
          } else {
              node.parentNode.appendChild(this.node);
          }
          R._insertafter(this, element, this.paper);
          return this;
      };
      
      elproto.insertBefore = function (element) {
          if (this.removed) {
              return this;
          }
          var node = element.node || element[0].node;
          node.parentNode.insertBefore(this.node, node);
          R._insertbefore(this, element, this.paper);
          return this;
      };
      elproto.blur = function (size) {
          // Experimental. No Safari support. Use it on your own risk.
          var t = this;
          if (+size !== 0) {
              var fltr = $("filter"),
                  blur = $("feGaussianBlur");
              t.attrs.blur = size;
              fltr.id = R.createUUID();
              $(blur, {stdDeviation: +size || 1.5});
              fltr.appendChild(blur);
              t.paper.defs.appendChild(fltr);
              t._blur = fltr;
              $(t.node, {filter: "url(#" + fltr.id + ")"});
          } else {
              if (t._blur) {
                  t._blur.parentNode.removeChild(t._blur);
                  delete t._blur;
                  delete t.attrs.blur;
              }
              t.node.removeAttribute("filter");
          }
      };
      R._engine.circle = function (svg, x, y, r) {
          var el = $("circle");
          svg.canvas && svg.canvas.appendChild(el);
          var res = new Element(el, svg);
          res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
          res.type = "circle";
          $(el, res.attrs);
          return res;
      };
      R._engine.rect = function (svg, x, y, w, h, r) {
          var el = $("rect");
          svg.canvas && svg.canvas.appendChild(el);
          var res = new Element(el, svg);
          res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
          res.type = "rect";
          $(el, res.attrs);
          return res;
      };
      R._engine.ellipse = function (svg, x, y, rx, ry) {
          var el = $("ellipse");
          svg.canvas && svg.canvas.appendChild(el);
          var res = new Element(el, svg);
          res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
          res.type = "ellipse";
          $(el, res.attrs);
          return res;
      };
      R._engine.image = function (svg, src, x, y, w, h) {
          var el = $("image");
          $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
          el.setAttributeNS(xlink, "href", src);
          svg.canvas && svg.canvas.appendChild(el);
          var res = new Element(el, svg);
          res.attrs = {x: x, y: y, width: w, height: h, src: src};
          res.type = "image";
          return res;
      };
      R._engine.text = function (svg, x, y, text) {
          var el = $("text");
          svg.canvas && svg.canvas.appendChild(el);
          var res = new Element(el, svg);
          res.attrs = {
              x: x,
              y: y,
              "text-anchor": "middle",
              text: text,
              font: R._availableAttrs.font,
              stroke: "none",
              fill: "#000"
          };
          res.type = "text";
          setFillAndStroke(res, res.attrs);
          return res;
      };
      R._engine.setSize = function (width, height) {
          this.width = width || this.width;
          this.height = height || this.height;
          this.canvas.setAttribute("width", this.width);
          this.canvas.setAttribute("height", this.height);
          if (this._viewBox) {
              this.setViewBox.apply(this, this._viewBox);
          }
          return this;
      };
      R._engine.create = function () {
          var con = R._getContainer.apply(0, arguments),
              container = con && con.container,
              x = con.x,
              y = con.y,
              width = con.width,
              height = con.height;
          if (!container) {
              throw new Error("SVG container not found.");
          }
          var cnvs = $("svg"),
              css = "overflow:hidden;",
              isFloating;
          x = x || 0;
          y = y || 0;
          width = width || 512;
          height = height || 342;
          $(cnvs, {
              height: height,
              version: 1.1,
              width: width,
              xmlns: "http://www.w3.org/2000/svg"
          });
          if (container == 1) {
              cnvs.style.cssText = css + "position:absolute;left:" + x + "px;top:" + y + "px";
              R._g.doc.body.appendChild(cnvs);
              isFloating = 1;
          } else {
              cnvs.style.cssText = css + "position:relative";
              if (container.firstChild) {
                  container.insertBefore(cnvs, container.firstChild);
              } else {
                  container.appendChild(cnvs);
              }
          }
          container = new R._Paper;
          container.width = width;
          container.height = height;
          container.canvas = cnvs;
          container.clear();
          container._left = container._top = 0;
          isFloating && (container.renderfix = function () {});
          container.renderfix();
          return container;
      };
      R._engine.setViewBox = function (x, y, w, h, fit) {
          eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
          var size = mmax(w / this.width, h / this.height),
              top = this.top,
              aspectRatio = fit ? "meet" : "xMinYMin",
              vb,
              sw;
          if (x == null) {
              if (this._vbSize) {
                  size = 1;
              }
              delete this._vbSize;
              vb = "0 0 " + this.width + S + this.height;
          } else {
              this._vbSize = size;
              vb = x + S + y + S + w + S + h;
          }
          $(this.canvas, {
              viewBox: vb,
              preserveAspectRatio: aspectRatio
          });
          while (size && top) {
              sw = "stroke-width" in top.attrs ? top.attrs["stroke-width"] : 1;
              top.attr({"stroke-width": sw});
              top._.dirty = 1;
              top._.dirtyT = 1;
              top = top.prev;
          }
          this._viewBox = [x, y, w, h, !!fit];
          return this;
      };
      
      R.prototype.renderfix = function () {
          var cnvs = this.canvas,
              s = cnvs.style,
              pos;
          try {
              pos = cnvs.getScreenCTM() || cnvs.createSVGMatrix();
          } catch (e) {
              pos = cnvs.createSVGMatrix();
          }
          var left = -pos.e % 1,
              top = -pos.f % 1;
          if (left || top) {
              if (left) {
                  this._left = (this._left + left) % 1;
                  s.left = this._left + "px";
              }
              if (top) {
                  this._top = (this._top + top) % 1;
                  s.top = this._top + "px";
              }
          }
      };
      
      R.prototype.clear = function () {
          R.eve("raphael.clear", this);
          var c = this.canvas;
          while (c.firstChild) {
              c.removeChild(c.firstChild);
          }
          this.bottom = this.top = null;
          (this.desc = $("desc")).appendChild(R._g.doc.createTextNode("Created with Rapha\xebl " + R.version));
          c.appendChild(this.desc);
          c.appendChild(this.defs = $("defs"));
      };
      
      R.prototype.remove = function () {
          eve("raphael.remove", this);
          this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
          for (var i in this) {
              this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
          }
      };
      var setproto = R.st;
      for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
          setproto[method] = (function (methodname) {
              return function () {
                  var arg = arguments;
                  return this.forEach(function (el) {
                      el[methodname].apply(el, arg);
                  });
              };
          })(method);
      }
  }(window.Raphael);

  // ┌─────────────────────────────────────────────────────────────────────┐ \\
  // │ Raphaël - JavaScript Vector Library                                 │ \\
  // ├─────────────────────────────────────────────────────────────────────┤ \\
  // │ VML Module                                                          │ \\
  // ├─────────────────────────────────────────────────────────────────────┤ \\
  // │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
  // │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
  // │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
  // └─────────────────────────────────────────────────────────────────────┘ \\
  window.Raphael.vml && function (R) {
      var has = "hasOwnProperty",
          Str = String,
          toFloat = parseFloat,
          math = Math,
          round = math.round,
          mmax = math.max,
          mmin = math.min,
          abs = math.abs,
          fillString = "fill",
          separator = /[, ]+/,
          eve = R.eve,
          ms = " progid:DXImageTransform.Microsoft",
          S = " ",
          E = "",
          map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
          bites = /([clmz]),?([^clmz]*)/gi,
          blurregexp = / progid:\S+Blur\([^\)]+\)/g,
          val = /-?[^,\s-]+/g,
          cssDot = "position:absolute;left:0;top:0;width:1px;height:1px",
          zoom = 21600,
          pathTypes = {path: 1, rect: 1, image: 1},
          ovalTypes = {circle: 1, ellipse: 1},
          path2vml = function (path) {
              var total =  /[ahqstv]/ig,
                  command = R._pathToAbsolute;
              Str(path).match(total) && (command = R._path2curve);
              total = /[clmz]/g;
              if (command == R._pathToAbsolute && !Str(path).match(total)) {
                  var res = Str(path).replace(bites, function (all, command, args) {
                      var vals = [],
                          isMove = command.toLowerCase() == "m",
                          res = map[command];
                      args.replace(val, function (value) {
                          if (isMove && vals.length == 2) {
                              res += vals + map[command == "m" ? "l" : "L"];
                              vals = [];
                          }
                          vals.push(round(value * zoom));
                      });
                      return res + vals;
                  });
                  return res;
              }
              var pa = command(path), p, r;
              res = [];
              for (var i = 0, ii = pa.length; i < ii; i++) {
                  p = pa[i];
                  r = pa[i][0].toLowerCase();
                  r == "z" && (r = "x");
                  for (var j = 1, jj = p.length; j < jj; j++) {
                      r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
                  }
                  res.push(r);
              }
              return res.join(S);
          },
          compensation = function (deg, dx, dy) {
              var m = R.matrix();
              m.rotate(-deg, .5, .5);
              return {
                  dx: m.x(dx, dy),
                  dy: m.y(dx, dy)
              };
          },
          setCoords = function (p, sx, sy, dx, dy, deg) {
              var _ = p._,
                  m = p.matrix,
                  fillpos = _.fillpos,
                  o = p.node,
                  s = o.style,
                  y = 1,
                  flip = "",
                  dxdy,
                  kx = zoom / sx,
                  ky = zoom / sy;
              s.visibility = "hidden";
              if (!sx || !sy) {
                  return;
              }
              o.coordsize = abs(kx) + S + abs(ky);
              s.rotation = deg * (sx * sy < 0 ? -1 : 1);
              if (deg) {
                  var c = compensation(deg, dx, dy);
                  dx = c.dx;
                  dy = c.dy;
              }
              sx < 0 && (flip += "x");
              sy < 0 && (flip += " y") && (y = -1);
              s.flip = flip;
              o.coordorigin = (dx * -kx) + S + (dy * -ky);
              if (fillpos || _.fillsize) {
                  var fill = o.getElementsByTagName(fillString);
                  fill = fill && fill[0];
                  o.removeChild(fill);
                  if (fillpos) {
                      c = compensation(deg, m.x(fillpos[0], fillpos[1]), m.y(fillpos[0], fillpos[1]));
                      fill.position = c.dx * y + S + c.dy * y;
                  }
                  if (_.fillsize) {
                      fill.size = _.fillsize[0] * abs(sx) + S + _.fillsize[1] * abs(sy);
                  }
                  o.appendChild(fill);
              }
              s.visibility = "visible";
          };
      R.toString = function () {
          return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
      };
      var addArrow = function (o, value, isEnd) {
          var values = Str(value).toLowerCase().split("-"),
              se = isEnd ? "end" : "start",
              i = values.length,
              type = "classic",
              w = "medium",
              h = "medium";
          while (i--) {
              switch (values[i]) {
                  case "block":
                  case "classic":
                  case "oval":
                  case "diamond":
                  case "open":
                  case "none":
                      type = values[i];
                      break;
                  case "wide":
                  case "narrow": h = values[i]; break;
                  case "long":
                  case "short": w = values[i]; break;
              }
          }
          var stroke = o.node.getElementsByTagName("stroke")[0];
          stroke[se + "arrow"] = type;
          stroke[se + "arrowlength"] = w;
          stroke[se + "arrowwidth"] = h;
      },
      setFillAndStroke = function (o, params) {
          // o.paper.canvas.style.display = "none";
          o.attrs = o.attrs || {};
          var node = o.node,
              a = o.attrs,
              s = node.style,
              xy,
              newpath = pathTypes[o.type] && (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.cx != a.cx || params.cy != a.cy || params.rx != a.rx || params.ry != a.ry || params.r != a.r),
              isOval = ovalTypes[o.type] && (a.cx != params.cx || a.cy != params.cy || a.r != params.r || a.rx != params.rx || a.ry != params.ry),
              res = o;


          for (var par in params) if (params[has](par)) {
              a[par] = params[par];
          }
          if (newpath) {
              a.path = R._getPath[o.type](o);
              o._.dirty = 1;
          }
          params.href && (node.href = params.href);
          params.title && (node.title = params.title);
          params.target && (node.target = params.target);
          params.cursor && (s.cursor = params.cursor);
          "blur" in params && o.blur(params.blur);
          if (params.path && o.type == "path" || newpath) {
              node.path = path2vml(~Str(a.path).toLowerCase().indexOf("r") ? R._pathToAbsolute(a.path) : a.path);
              if (o.type == "image") {
                  o._.fillpos = [a.x, a.y];
                  o._.fillsize = [a.width, a.height];
                  setCoords(o, 1, 1, 0, 0, 0);
              }
          }
          "transform" in params && o.transform(params.transform);
          if (isOval) {
              var cx = +a.cx,
                  cy = +a.cy,
                  rx = +a.rx || +a.r || 0,
                  ry = +a.ry || +a.r || 0;
              node.path = R.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x", round((cx - rx) * zoom), round((cy - ry) * zoom), round((cx + rx) * zoom), round((cy + ry) * zoom), round(cx * zoom));
          }
          if ("clip-rect" in params) {
              var rect = Str(params["clip-rect"]).split(separator);
              if (rect.length == 4) {
                  rect[2] = +rect[2] + (+rect[0]);
                  rect[3] = +rect[3] + (+rect[1]);
                  var div = node.clipRect || R._g.doc.createElement("div"),
                      dstyle = div.style;
                  dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                  if (!node.clipRect) {
                      dstyle.position = "absolute";
                      dstyle.top = 0;
                      dstyle.left = 0;
                      dstyle.width = o.paper.width + "px";
                      dstyle.height = o.paper.height + "px";
                      node.parentNode.insertBefore(div, node);
                      div.appendChild(node);
                      node.clipRect = div;
                  }
              }
              if (!params["clip-rect"]) {
                  node.clipRect && (node.clipRect.style.clip = "auto");
              }
          }
          if (o.textpath) {
              var textpathStyle = o.textpath.style;
              params.font && (textpathStyle.font = params.font);
              params["font-family"] && (textpathStyle.fontFamily = '"' + params["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g, E) + '"');
              params["font-size"] && (textpathStyle.fontSize = params["font-size"]);
              params["font-weight"] && (textpathStyle.fontWeight = params["font-weight"]);
              params["font-style"] && (textpathStyle.fontStyle = params["font-style"]);
          }
          if ("arrow-start" in params) {
              addArrow(res, params["arrow-start"]);
          }
          if ("arrow-end" in params) {
              addArrow(res, params["arrow-end"], 1);
          }
          if (params.opacity != null || 
              params["stroke-width"] != null ||
              params.fill != null ||
              params.src != null ||
              params.stroke != null ||
              params["stroke-width"] != null ||
              params["stroke-opacity"] != null ||
              params["fill-opacity"] != null ||
              params["stroke-dasharray"] != null ||
              params["stroke-miterlimit"] != null ||
              params["stroke-linejoin"] != null ||
              params["stroke-linecap"] != null) {
              var fill = node.getElementsByTagName(fillString),
                  newfill = false;
              fill = fill && fill[0];
              !fill && (newfill = fill = createNode(fillString));
              if (o.type == "image" && params.src) {
                  fill.src = params.src;
              }
              params.fill && (fill.on = true);
              if (fill.on == null || params.fill == "none" || params.fill === null) {
                  fill.on = false;
              }
              if (fill.on && params.fill) {
                  var isURL = Str(params.fill).match(R._ISURL);
                  if (isURL) {
                      fill.parentNode == node && node.removeChild(fill);
                      fill.rotate = true;
                      fill.src = isURL[1];
                      fill.type = "tile";
                      var bbox = o.getBBox(1);
                      fill.position = bbox.x + S + bbox.y;
                      o._.fillpos = [bbox.x, bbox.y];

                      R._preload(isURL[1], function () {
                          o._.fillsize = [this.offsetWidth, this.offsetHeight];
                      });
                  } else {
                      fill.color = R.getRGB(params.fill).hex;
                      fill.src = E;
                      fill.type = "solid";
                      if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill, fill)) {
                          a.fill = "none";
                          a.gradient = params.fill;
                          fill.rotate = false;
                      }
                  }
              }
              if ("fill-opacity" in params || "opacity" in params) {
                  var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
                  opacity = mmin(mmax(opacity, 0), 1);
                  fill.opacity = opacity;
                  if (fill.src) {
                      fill.color = "none";
                  }
              }
              node.appendChild(fill);
              var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
              newstroke = false;
              !stroke && (newstroke = stroke = createNode("stroke"));
              if ((params.stroke && params.stroke != "none") ||
                  params["stroke-width"] ||
                  params["stroke-opacity"] != null ||
                  params["stroke-dasharray"] ||
                  params["stroke-miterlimit"] ||
                  params["stroke-linejoin"] ||
                  params["stroke-linecap"]) {
                  stroke.on = true;
              }
              (params.stroke == "none" || params.stroke === null || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
              var strokeColor = R.getRGB(params.stroke);
              stroke.on && params.stroke && (stroke.color = strokeColor.hex);
              opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
              var width = (toFloat(params["stroke-width"]) || 1) * .75;
              opacity = mmin(mmax(opacity, 0), 1);
              params["stroke-width"] == null && (width = a["stroke-width"]);
              params["stroke-width"] && (stroke.weight = width);
              width && width < 1 && (opacity *= width) && (stroke.weight = 1);
              stroke.opacity = opacity;
          
              params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
              stroke.miterlimit = params["stroke-miterlimit"] || 8;
              params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
              if (params["stroke-dasharray"]) {
                  var dasharray = {
                      "-": "shortdash",
                      ".": "shortdot",
                      "-.": "shortdashdot",
                      "-..": "shortdashdotdot",
                      ". ": "dot",
                      "- ": "dash",
                      "--": "longdash",
                      "- .": "dashdot",
                      "--.": "longdashdot",
                      "--..": "longdashdotdot"
                  };
                  stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
              }
              newstroke && node.appendChild(stroke);
          }
          if (res.type == "text") {
              res.paper.canvas.style.display = E;
              var span = res.paper.span,
                  m = 100,
                  fontSize = a.font && a.font.match(/\d+(?:\.\d*)?(?=px)/);
              s = span.style;
              a.font && (s.font = a.font);
              a["font-family"] && (s.fontFamily = a["font-family"]);
              a["font-weight"] && (s.fontWeight = a["font-weight"]);
              a["font-style"] && (s.fontStyle = a["font-style"]);
              fontSize = toFloat(a["font-size"] || fontSize && fontSize[0]) || 10;
              s.fontSize = fontSize * m + "px";
              res.textpath.string && (span.innerHTML = Str(res.textpath.string).replace(/</g, "&#60;").replace(/&/g, "&#38;").replace(/\n/g, "<br>"));
              var brect = span.getBoundingClientRect();
              res.W = a.w = (brect.right - brect.left) / m;
              res.H = a.h = (brect.bottom - brect.top) / m;
              // res.paper.canvas.style.display = "none";
              res.X = a.x;
              res.Y = a.y + res.H / 2;

              ("x" in params || "y" in params) && (res.path.v = R.format("m{0},{1}l{2},{1}", round(a.x * zoom), round(a.y * zoom), round(a.x * zoom) + 1));
              var dirtyattrs = ["x", "y", "text", "font", "font-family", "font-weight", "font-style", "font-size"];
              for (var d = 0, dd = dirtyattrs.length; d < dd; d++) if (dirtyattrs[d] in params) {
                  res._.dirty = 1;
                  break;
              }
          
              // text-anchor emulation
              switch (a["text-anchor"]) {
                  case "start":
                      res.textpath.style["v-text-align"] = "left";
                      res.bbx = res.W / 2;
                  break;
                  case "end":
                      res.textpath.style["v-text-align"] = "right";
                      res.bbx = -res.W / 2;
                  break;
                  default:
                      res.textpath.style["v-text-align"] = "center";
                      res.bbx = 0;
                  break;
              }
              res.textpath.style["v-text-kern"] = true;
          }
          // res.paper.canvas.style.display = E;
      },
      addGradientFill = function (o, gradient, fill) {
          o.attrs = o.attrs || {};
          var attrs = o.attrs,
              pow = Math.pow,
              opacity,
              oindex,
              type = "linear",
              fxfy = ".5 .5";
          o.attrs.gradient = gradient;
          gradient = Str(gradient).replace(R._radial_gradient, function (all, fx, fy) {
              type = "radial";
              if (fx && fy) {
                  fx = toFloat(fx);
                  fy = toFloat(fy);
                  pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                  fxfy = fx + S + fy;
              }
              return E;
          });
          gradient = gradient.split(/\s*\-\s*/);
          if (type == "linear") {
              var angle = gradient.shift();
              angle = -toFloat(angle);
              if (isNaN(angle)) {
                  return null;
              }
          }
          var dots = R._parseDots(gradient);
          if (!dots) {
              return null;
          }
          o = o.shape || o.node;
          if (dots.length) {
              o.removeChild(fill);
              fill.on = true;
              fill.method = "none";
              fill.color = dots[0].color;
              fill.color2 = dots[dots.length - 1].color;
              var clrs = [];
              for (var i = 0, ii = dots.length; i < ii; i++) {
                  dots[i].offset && clrs.push(dots[i].offset + S + dots[i].color);
              }
              fill.colors = clrs.length ? clrs.join() : "0% " + fill.color;
              if (type == "radial") {
                  fill.type = "gradientTitle";
                  fill.focus = "100%";
                  fill.focussize = "0 0";
                  fill.focusposition = fxfy;
                  fill.angle = 0;
              } else {
                  // fill.rotate= true;
                  fill.type = "gradient";
                  fill.angle = (270 - angle) % 360;
              }
              o.appendChild(fill);
          }
          return 1;
      },
      Element = function (node, vml) {
          this[0] = this.node = node;
          node.raphael = true;
          this.id = R._oid++;
          node.raphaelid = this.id;
          this.X = 0;
          this.Y = 0;
          this.attrs = {};
          this.paper = vml;
          this.matrix = R.matrix();
          this._ = {
              transform: [],
              sx: 1,
              sy: 1,
              dx: 0,
              dy: 0,
              deg: 0,
              dirty: 1,
              dirtyT: 1
          };
          !vml.bottom && (vml.bottom = this);
          this.prev = vml.top;
          vml.top && (vml.top.next = this);
          vml.top = this;
          this.next = null;
      };
      var elproto = R.el;

      Element.prototype = elproto;
      elproto.constructor = Element;
      elproto.transform = function (tstr) {
          if (tstr == null) {
              return this._.transform;
          }
          var vbs = this.paper._viewBoxShift,
              vbt = vbs ? "s" + [vbs.scale, vbs.scale] + "-1-1t" + [vbs.dx, vbs.dy] : E,
              oldt;
          if (vbs) {
              oldt = tstr = Str(tstr).replace(/\.{3}|\u2026/g, this._.transform || E);
          }
          R._extractTransform(this, vbt + tstr);
          var matrix = this.matrix.clone(),
              skew = this.skew,
              o = this.node,
              split,
              isGrad = ~Str(this.attrs.fill).indexOf("-"),
              isPatt = !Str(this.attrs.fill).indexOf("url(");
          matrix.translate(-.5, -.5);
          if (isPatt || isGrad || this.type == "image") {
              skew.matrix = "1 0 0 1";
              skew.offset = "0 0";
              split = matrix.split();
              if ((isGrad && split.noRotation) || !split.isSimple) {
                  o.style.filter = matrix.toFilter();
                  var bb = this.getBBox(),
                      bbt = this.getBBox(1),
                      dx = bb.x - bbt.x,
                      dy = bb.y - bbt.y;
                  o.coordorigin = (dx * -zoom) + S + (dy * -zoom);
                  setCoords(this, 1, 1, dx, dy, 0);
              } else {
                  o.style.filter = E;
                  setCoords(this, split.scalex, split.scaley, split.dx, split.dy, split.rotate);
              }
          } else {
              o.style.filter = E;
              skew.matrix = Str(matrix);
              skew.offset = matrix.offset();
          }
          oldt && (this._.transform = oldt);
          return this;
      };
      elproto.rotate = function (deg, cx, cy) {
          if (this.removed) {
              return this;
          }
          if (deg == null) {
              return;
          }
          deg = Str(deg).split(separator);
          if (deg.length - 1) {
              cx = toFloat(deg[1]);
              cy = toFloat(deg[2]);
          }
          deg = toFloat(deg[0]);
          (cy == null) && (cx = cy);
          if (cx == null || cy == null) {
              var bbox = this.getBBox(1);
              cx = bbox.x + bbox.width / 2;
              cy = bbox.y + bbox.height / 2;
          }
          this._.dirtyT = 1;
          this.transform(this._.transform.concat([["r", deg, cx, cy]]));
          return this;
      };
      elproto.translate = function (dx, dy) {
          if (this.removed) {
              return this;
          }
          dx = Str(dx).split(separator);
          if (dx.length - 1) {
              dy = toFloat(dx[1]);
          }
          dx = toFloat(dx[0]) || 0;
          dy = +dy || 0;
          if (this._.bbox) {
              this._.bbox.x += dx;
              this._.bbox.y += dy;
          }
          this.transform(this._.transform.concat([["t", dx, dy]]));
          return this;
      };
      elproto.scale = function (sx, sy, cx, cy) {
          if (this.removed) {
              return this;
          }
          sx = Str(sx).split(separator);
          if (sx.length - 1) {
              sy = toFloat(sx[1]);
              cx = toFloat(sx[2]);
              cy = toFloat(sx[3]);
              isNaN(cx) && (cx = null);
              isNaN(cy) && (cy = null);
          }
          sx = toFloat(sx[0]);
          (sy == null) && (sy = sx);
          (cy == null) && (cx = cy);
          if (cx == null || cy == null) {
              var bbox = this.getBBox(1);
          }
          cx = cx == null ? bbox.x + bbox.width / 2 : cx;
          cy = cy == null ? bbox.y + bbox.height / 2 : cy;
      
          this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
          this._.dirtyT = 1;
          return this;
      };
      elproto.hide = function () {
          !this.removed && (this.node.style.display = "none");
          return this;
      };
      elproto.show = function () {
          !this.removed && (this.node.style.display = E);
          return this;
      };
      elproto._getBBox = function () {
          if (this.removed) {
              return {};
          }
          return {
              x: this.X + (this.bbx || 0) - this.W / 2,
              y: this.Y - this.H,
              width: this.W,
              height: this.H
          };
      };
      elproto.remove = function () {
          if (this.removed || !this.node.parentNode) {
              return;
          }
          this.paper.__set__ && this.paper.__set__.exclude(this);
          R.eve.unbind("raphael.*.*." + this.id);
          R._tear(this, this.paper);
          this.node.parentNode.removeChild(this.node);
          this.shape && this.shape.parentNode.removeChild(this.shape);
          for (var i in this) {
              this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
          }
          this.removed = true;
      };
      elproto.attr = function (name, value) {
          if (this.removed) {
              return this;
          }
          if (name == null) {
              var res = {};
              for (var a in this.attrs) if (this.attrs[has](a)) {
                  res[a] = this.attrs[a];
              }
              res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
              res.transform = this._.transform;
              return res;
          }
          if (value == null && R.is(name, "string")) {
              if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                  return this.attrs.gradient;
              }
              var names = name.split(separator),
                  out = {};
              for (var i = 0, ii = names.length; i < ii; i++) {
                  name = names[i];
                  if (name in this.attrs) {
                      out[name] = this.attrs[name];
                  } else if (R.is(this.paper.customAttributes[name], "function")) {
                      out[name] = this.paper.customAttributes[name].def;
                  } else {
                      out[name] = R._availableAttrs[name];
                  }
              }
              return ii - 1 ? out : out[names[0]];
          }
          if (this.attrs && value == null && R.is(name, "array")) {
              out = {};
              for (i = 0, ii = name.length; i < ii; i++) {
                  out[name[i]] = this.attr(name[i]);
              }
              return out;
          }
          var params;
          if (value != null) {
              params = {};
              params[name] = value;
          }
          value == null && R.is(name, "object") && (params = name);
          for (var key in params) {
              eve("raphael.attr." + key + "." + this.id, this, params[key]);
          }
          if (params) {
              for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                  var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
                  this.attrs[key] = params[key];
                  for (var subkey in par) if (par[has](subkey)) {
                      params[subkey] = par[subkey];
                  }
              }
              // this.paper.canvas.style.display = "none";
              if (params.text && this.type == "text") {
                  this.textpath.string = params.text;
              }
              setFillAndStroke(this, params);
              // this.paper.canvas.style.display = E;
          }
          return this;
      };
      elproto.toFront = function () {
          !this.removed && this.node.parentNode.appendChild(this.node);
          this.paper && this.paper.top != this && R._tofront(this, this.paper);
          return this;
      };
      elproto.toBack = function () {
          if (this.removed) {
              return this;
          }
          if (this.node.parentNode.firstChild != this.node) {
              this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
              R._toback(this, this.paper);
          }
          return this;
      };
      elproto.insertAfter = function (element) {
          if (this.removed) {
              return this;
          }
          if (element.constructor == R.st.constructor) {
              element = element[element.length - 1];
          }
          if (element.node.nextSibling) {
              element.node.parentNode.insertBefore(this.node, element.node.nextSibling);
          } else {
              element.node.parentNode.appendChild(this.node);
          }
          R._insertafter(this, element, this.paper);
          return this;
      };
      elproto.insertBefore = function (element) {
          if (this.removed) {
              return this;
          }
          if (element.constructor == R.st.constructor) {
              element = element[0];
          }
          element.node.parentNode.insertBefore(this.node, element.node);
          R._insertbefore(this, element, this.paper);
          return this;
      };
      elproto.blur = function (size) {
          var s = this.node.runtimeStyle,
              f = s.filter;
          f = f.replace(blurregexp, E);
          if (+size !== 0) {
              this.attrs.blur = size;
              s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
              s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
          } else {
              s.filter = f;
              s.margin = 0;
              delete this.attrs.blur;
          }
      };

      R._engine.path = function (pathString, vml) {
          var el = createNode("shape");
          el.style.cssText = cssDot;
          el.coordsize = zoom + S + zoom;
          el.coordorigin = vml.coordorigin;
          var p = new Element(el, vml),
              attr = {fill: "none", stroke: "#000"};
          pathString && (attr.path = pathString);
          p.type = "path";
          p.path = [];
          p.Path = E;
          setFillAndStroke(p, attr);
          vml.canvas.appendChild(el);
          var skew = createNode("skew");
          skew.on = true;
          el.appendChild(skew);
          p.skew = skew;
          p.transform(E);
          return p;
      };
      R._engine.rect = function (vml, x, y, w, h, r) {
          var path = R._rectPath(x, y, w, h, r),
              res = vml.path(path),
              a = res.attrs;
          res.X = a.x = x;
          res.Y = a.y = y;
          res.W = a.width = w;
          res.H = a.height = h;
          a.r = r;
          a.path = path;
          res.type = "rect";
          return res;
      };
      R._engine.ellipse = function (vml, x, y, rx, ry) {
          var res = vml.path(),
              a = res.attrs;
          res.X = x - rx;
          res.Y = y - ry;
          res.W = rx * 2;
          res.H = ry * 2;
          res.type = "ellipse";
          setFillAndStroke(res, {
              cx: x,
              cy: y,
              rx: rx,
              ry: ry
          });
          return res;
      };
      R._engine.circle = function (vml, x, y, r) {
          var res = vml.path(),
              a = res.attrs;
          res.X = x - r;
          res.Y = y - r;
          res.W = res.H = r * 2;
          res.type = "circle";
          setFillAndStroke(res, {
              cx: x,
              cy: y,
              r: r
          });
          return res;
      };
      R._engine.image = function (vml, src, x, y, w, h) {
          var path = R._rectPath(x, y, w, h),
              res = vml.path(path).attr({stroke: "none"}),
              a = res.attrs,
              node = res.node,
              fill = node.getElementsByTagName(fillString)[0];
          a.src = src;
          res.X = a.x = x;
          res.Y = a.y = y;
          res.W = a.width = w;
          res.H = a.height = h;
          a.path = path;
          res.type = "image";
          fill.parentNode == node && node.removeChild(fill);
          fill.rotate = true;
          fill.src = src;
          fill.type = "tile";
          res._.fillpos = [x, y];
          res._.fillsize = [w, h];
          node.appendChild(fill);
          setCoords(res, 1, 1, 0, 0, 0);
          return res;
      };
      R._engine.text = function (vml, x, y, text) {
          var el = createNode("shape"),
              path = createNode("path"),
              o = createNode("textpath");
          x = x || 0;
          y = y || 0;
          text = text || "";
          path.v = R.format("m{0},{1}l{2},{1}", round(x * zoom), round(y * zoom), round(x * zoom) + 1);
          path.textpathok = true;
          o.string = Str(text);
          o.on = true;
          el.style.cssText = cssDot;
          el.coordsize = zoom + S + zoom;
          el.coordorigin = "0 0";
          var p = new Element(el, vml),
              attr = {
                  fill: "#000",
                  stroke: "none",
                  font: R._availableAttrs.font,
                  text: text
              };
          p.shape = el;
          p.path = path;
          p.textpath = o;
          p.type = "text";
          p.attrs.text = Str(text);
          p.attrs.x = x;
          p.attrs.y = y;
          p.attrs.w = 1;
          p.attrs.h = 1;
          setFillAndStroke(p, attr);
          el.appendChild(o);
          el.appendChild(path);
          vml.canvas.appendChild(el);
          var skew = createNode("skew");
          skew.on = true;
          el.appendChild(skew);
          p.skew = skew;
          p.transform(E);
          return p;
      };
      R._engine.setSize = function (width, height) {
          var cs = this.canvas.style;
          this.width = width;
          this.height = height;
          width == +width && (width += "px");
          height == +height && (height += "px");
          cs.width = width;
          cs.height = height;
          cs.clip = "rect(0 " + width + " " + height + " 0)";
          if (this._viewBox) {
              R._engine.setViewBox.apply(this, this._viewBox);
          }
          return this;
      };
      R._engine.setViewBox = function (x, y, w, h, fit) {
          R.eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
          var width = this.width,
              height = this.height,
              size = 1 / mmax(w / width, h / height),
              H, W;
          if (fit) {
              H = height / h;
              W = width / w;
              if (w * H < width) {
                  x -= (width - w * H) / 2 / H;
              }
              if (h * W < height) {
                  y -= (height - h * W) / 2 / W;
              }
          }
          this._viewBox = [x, y, w, h, !!fit];
          this._viewBoxShift = {
              dx: -x,
              dy: -y,
              scale: size
          };
          this.forEach(function (el) {
              el.transform("...");
          });
          return this;
      };
      var createNode;
      R._engine.initWin = function (win) {
              var doc = win.document;
              doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
              try {
                  !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
                  createNode = function (tagName) {
                      return doc.createElement('<rvml:' + tagName + ' class="rvml">');
                  };
              } catch (e) {
                  createNode = function (tagName) {
                      return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
                  };
              }
          };
      R._engine.initWin(R._g.win);
      R._engine.create = function () {
          var con = R._getContainer.apply(0, arguments),
              container = con.container,
              height = con.height,
              s,
              width = con.width,
              x = con.x,
              y = con.y;
          if (!container) {
              throw new Error("VML container not found.");
          }
          var res = new R._Paper,
              c = res.canvas = R._g.doc.createElement("div"),
              cs = c.style;
          x = x || 0;
          y = y || 0;
          width = width || 512;
          height = height || 342;
          res.width = width;
          res.height = height;
          width == +width && (width += "px");
          height == +height && (height += "px");
          res.coordsize = zoom * 1e3 + S + zoom * 1e3;
          res.coordorigin = "0 0";
          res.span = R._g.doc.createElement("span");
          res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;";
          c.appendChild(res.span);
          cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
          if (container == 1) {
              R._g.doc.body.appendChild(c);
              cs.left = x + "px";
              cs.top = y + "px";
              cs.position = "absolute";
          } else {
              if (container.firstChild) {
                  container.insertBefore(c, container.firstChild);
              } else {
                  container.appendChild(c);
              }
          }
          res.renderfix = function () {};
          return res;
      };
      R.prototype.clear = function () {
          R.eve("raphael.clear", this);
          this.canvas.innerHTML = E;
          this.span = R._g.doc.createElement("span");
          this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
          this.canvas.appendChild(this.span);
          this.bottom = this.top = null;
      };
      R.prototype.remove = function () {
          R.eve("raphael.remove", this);
          this.canvas.parentNode.removeChild(this.canvas);
          for (var i in this) {
              this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
          }
          return true;
      };

      var setproto = R.st;
      for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
          setproto[method] = (function (methodname) {
              return function () {
                  var arg = arguments;
                  return this.forEach(function (el) {
                      el[methodname].apply(el, arg);
                  });
              };
          })(method);
      }
  }(window.Raphael);
})(uploadcare.eve)

uploadcare.Raphael = Raphael.ninja()
;
// changed:
//   Pusher.dependency_suffix = '.min'; (was '')
//   window.WEB_SOCKET_SWF_LOCATION = "https://s3.amazonaws.com/uploadcare-static/WebSocketMainInsecure.swf"

/*!
 * Pusher JavaScript Library v1.12.2
 * http://pusherapp.com/
 *
 * Copyright 2011, Pusher
 * Released under the MIT licence.
 */


;(function() {
  if (Function.prototype.scopedTo === undefined) {
    Function.prototype.scopedTo = function(context, args) {
      var f = this;
      return function() {
        return f.apply(context, Array.prototype.slice.call(args || [])
                       .concat(Array.prototype.slice.call(arguments)));
      };
    };
  }

  var Pusher = function(app_key, options) {
    this.options = options || {};
    this.key = app_key;
    this.channels = new Pusher.Channels();
    this.global_emitter = new Pusher.EventsDispatcher()

    var self = this;

    this.checkAppKey();

    this.connection = new Pusher.Connection(this.key, this.options);

    // Setup / teardown connection
    this.connection
      .bind('connected', function() {
        self.subscribeAll();
      })
      .bind('message', function(params) {
        var internal = (params.event.indexOf('pusher_internal:') === 0);
        if (params.channel) {
          var channel;
          if (channel = self.channel(params.channel)) {
            channel.emit(params.event, params.data);
          }
        }
        // Emit globaly [deprecated]
        if (!internal) self.global_emitter.emit(params.event, params.data);
      })
      .bind('disconnected', function() {
        self.channels.disconnect();
      })
      .bind('error', function(err) {
        Pusher.warn('Error', err);
      });

    Pusher.instances.push(this);

    if (Pusher.isReady) self.connect();
  };
  Pusher.instances = [];
  Pusher.prototype = {
    channel: function(name) {
      return this.channels.find(name);
    },

    connect: function() {
      this.connection.connect();
    },

    disconnect: function() {
      this.connection.disconnect();
    },

    bind: function(event_name, callback) {
      this.global_emitter.bind(event_name, callback);
      return this;
    },

    bind_all: function(callback) {
      this.global_emitter.bind_all(callback);
      return this;
    },

    subscribeAll: function() {
      var channel;
      for (channelName in this.channels.channels) {
        if (this.channels.channels.hasOwnProperty(channelName)) {
          this.subscribe(channelName);
        }
      }
    },

    subscribe: function(channel_name) {
      var self = this;
      var channel = this.channels.add(channel_name, this);

      if (this.connection.state === 'connected') {
        channel.authorize(this.connection.socket_id, this.options, function(err, data) {
          if (err) {
            channel.emit('pusher:subscription_error', data);
          } else {
            self.send_event('pusher:subscribe', {
              channel: channel_name,
              auth: data.auth,
              channel_data: data.channel_data
            });
          }
        });
      }
      return channel;
    },

    unsubscribe: function(channel_name) {
      this.channels.remove(channel_name);
      if (this.connection.state === 'connected') {
        this.send_event('pusher:unsubscribe', {
          channel: channel_name
        });
      }
    },

    send_event: function(event_name, data, channel) {
      return this.connection.send_event(event_name, data, channel);
    },

    checkAppKey: function() {
      if(this.key === null || this.key === undefined) {
        Pusher.warn('Warning', 'You must pass your app key when you instantiate Pusher.');
      }
    }
  };

  Pusher.Util = {
    extend: function extend(target, extensions) {
      for (var property in extensions) {
        if (extensions[property] && extensions[property].constructor &&
            extensions[property].constructor === Object) {
          target[property] = extend(target[property] || {}, extensions[property]);
        } else {
          target[property] = extensions[property];
        }
      }
      return target;
    },

    stringify: function stringify() {
      var m = ["Pusher"]
      for (var i = 0; i < arguments.length; i++){
        if (typeof arguments[i] === "string") {
          m.push(arguments[i])
        } else {
          if (window['JSON'] == undefined) {
            m.push(arguments[i].toString());
          } else {
            m.push(JSON.stringify(arguments[i]))
          }
        }
      };
      return m.join(" : ")
    },

    arrayIndexOf: function(array, item) { // MSIE doesn't have array.indexOf
      var nativeIndexOf = Array.prototype.indexOf;
      if (array == null) return -1;
      if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
      for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
      return -1;
    }
  };

  // To receive log output provide a Pusher.log function, for example
  // Pusher.log = function(m){console.log(m)}
  Pusher.debug = function() {
    if (!Pusher.log) return
    Pusher.log(Pusher.Util.stringify.apply(this, arguments))
  }
  Pusher.warn = function() {
    if (window.console && window.console.warn) {
      window.console.warn(Pusher.Util.stringify.apply(this, arguments));
    } else {
      if (!Pusher.log) return
      Pusher.log(Pusher.Util.stringify.apply(this, arguments));
    }
  };

  // Pusher defaults
  Pusher.VERSION = '1.12.2';

  Pusher.host = 'ws.pusherapp.com';
  Pusher.ws_port = 80;
  Pusher.wss_port = 443;
  Pusher.channel_auth_endpoint = '/pusher/auth';
  Pusher.cdn_http = 'http://js.pusher.com/'
  Pusher.cdn_https = 'https://d3dy5gmtp8yhk7.cloudfront.net/'
  Pusher.dependency_suffix = '.min';
  Pusher.channel_auth_transport = 'ajax';
  Pusher.activity_timeout = 120000;
  Pusher.pong_timeout = 30000;

  Pusher.isReady = false;
  Pusher.ready = function() {
    Pusher.isReady = true;
    for (var i = 0, l = Pusher.instances.length; i < l; i++) {
      Pusher.instances[i].connect();
    }
  };

  this.Pusher = Pusher;
}).call(this);

;(function() {
/* Abstract event binding
Example:

    var MyEventEmitter = function(){};
    MyEventEmitter.prototype = new Pusher.EventsDispatcher;

    var emitter = new MyEventEmitter();

    // Bind to single event
    emitter.bind('foo_event', function(data){ alert(data)} );

    // Bind to all
    emitter.bind_all(function(eventName, data){ alert(data) });

--------------------------------------------------------*/

  function CallbackRegistry() {
    this._callbacks = {};
  };

  CallbackRegistry.prototype.get = function(eventName) {
    return this._callbacks[this._prefix(eventName)];
  };

  CallbackRegistry.prototype.add = function(eventName, callback) {
    var prefixedEventName = this._prefix(eventName);
    this._callbacks[prefixedEventName] = this._callbacks[prefixedEventName] || [];
    this._callbacks[prefixedEventName].push(callback);
  };

  CallbackRegistry.prototype.remove = function(eventName, callback) {
    if(this.get(eventName)) {
      var index = Pusher.Util.arrayIndexOf(this.get(eventName), callback);
      this._callbacks[this._prefix(eventName)].splice(index, 1);
    }
  };

  CallbackRegistry.prototype._prefix = function(eventName) {
    return "_" + eventName;
  };


  function EventsDispatcher(failThrough) {
    this.callbacks = new CallbackRegistry();
    this.global_callbacks = [];
    // Run this function when dispatching an event when no callbacks defined
    this.failThrough = failThrough;
  }

  EventsDispatcher.prototype.bind = function(eventName, callback) {
    this.callbacks.add(eventName, callback);
    return this;// chainable
  };

  EventsDispatcher.prototype.unbind = function(eventName, callback) {
    this.callbacks.remove(eventName, callback);
    return this;
  };

  EventsDispatcher.prototype.emit = function(eventName, data) {
    // Global callbacks
    for (var i = 0; i < this.global_callbacks.length; i++) {
      this.global_callbacks[i](eventName, data);
    }

    // Event callbacks
    var callbacks = this.callbacks.get(eventName);
    if (callbacks) {
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](data);
      }
    } else if (this.failThrough) {
      this.failThrough(eventName, data)
    }

    return this;
  };

  EventsDispatcher.prototype.bind_all = function(callback) {
    this.global_callbacks.push(callback);
    return this;
  };

  this.Pusher.EventsDispatcher = EventsDispatcher;
}).call(this);

;(function() {
  var Pusher = this.Pusher;

  /*-----------------------------------------------
    Helpers:
  -----------------------------------------------*/

  function capitalize(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  }


  function safeCall(method, obj, data) {
    if (obj[method] !== undefined) {
      obj[method](data);
    }
  }

  /*-----------------------------------------------
    The State Machine
  -----------------------------------------------*/
  function Machine(initialState, transitions, stateActions) {
    Pusher.EventsDispatcher.call(this);

    this.state = undefined;
    this.errors = [];

    // functions for each state
    this.stateActions = stateActions;

    // set up the transitions
    this.transitions = transitions;

    this.transition(initialState);
  };

  Machine.prototype.transition = function(nextState, data) {
    var prevState = this.state;
    var stateCallbacks = this.stateActions;

    if (prevState && (Pusher.Util.arrayIndexOf(this.transitions[prevState], nextState) == -1)) {
      this.emit('invalid_transition_attempt', {
        oldState: prevState,
        newState: nextState
      });

      throw new Error('Invalid transition [' + prevState + ' to ' + nextState + ']');
    }

    // exit
    safeCall(prevState + 'Exit', stateCallbacks, data);

    // tween
    safeCall(prevState + 'To' + capitalize(nextState), stateCallbacks, data);

    // pre
    safeCall(nextState + 'Pre', stateCallbacks, data);

    // change state:
    this.state = nextState;

    // handy to bind to
    this.emit('state_change', {
      oldState: prevState,
      newState: nextState
    });

    // Post:
    safeCall(nextState + 'Post', stateCallbacks, data);
  };

  Machine.prototype.is = function(state) {
    return this.state === state;
  };

  Machine.prototype.isNot = function(state) {
    return this.state !== state;
  };

  Pusher.Util.extend(Machine.prototype, Pusher.EventsDispatcher.prototype);

  this.Pusher.Machine = Machine;
}).call(this);

;(function() {
  /*
    A little bauble to interface with window.navigator.onLine,
    window.ononline and window.onoffline.  Easier to mock.
  */

  var NetInfo = function() {
    var self = this;
    Pusher.EventsDispatcher.call(this);
    // This is okay, as IE doesn't support this stuff anyway.
    if (window.addEventListener !== undefined) {
      window.addEventListener("online", function() {
        self.emit('online', null);
      }, false);
      window.addEventListener("offline", function() {
        self.emit('offline', null);
      }, false);
    }
  };

  // Offline means definitely offline (no connection to router).
  // Inverse does NOT mean definitely online (only currently supported in Safari
  // and even there only means the device has a connection to the router).
  NetInfo.prototype.isOnLine = function() {
    if (window.navigator.onLine === undefined) {
      return true;
    } else {
      return window.navigator.onLine;
    }
  };

  Pusher.Util.extend(NetInfo.prototype, Pusher.EventsDispatcher.prototype);

  this.Pusher.NetInfo = NetInfo;
}).call(this);

;(function() {
  var Pusher = this.Pusher;

  var machineTransitions = {
    'initialized': ['waiting', 'failed'],
    'waiting': ['connecting', 'permanentlyClosed'],
    'connecting': ['open', 'permanentlyClosing', 'impermanentlyClosing', 'waiting'],
    'open': ['connected', 'permanentlyClosing', 'impermanentlyClosing', 'waiting'],
    'connected': ['permanentlyClosing', 'waiting'],
    'impermanentlyClosing': ['waiting', 'permanentlyClosing'],
    'permanentlyClosing': ['permanentlyClosed'],
    'permanentlyClosed': ['waiting', 'failed'],
    'failed': ['permanentlyClosed']
  };


  // Amount to add to time between connection attemtpts per failed attempt.
  var UNSUCCESSFUL_CONNECTION_ATTEMPT_ADDITIONAL_WAIT = 2000;
  var UNSUCCESSFUL_OPEN_ATTEMPT_ADDITIONAL_TIMEOUT = 2000;
  var UNSUCCESSFUL_CONNECTED_ATTEMPT_ADDITIONAL_TIMEOUT = 2000;

  var MAX_CONNECTION_ATTEMPT_WAIT = 5 * UNSUCCESSFUL_CONNECTION_ATTEMPT_ADDITIONAL_WAIT;
  var MAX_OPEN_ATTEMPT_TIMEOUT = 5 * UNSUCCESSFUL_OPEN_ATTEMPT_ADDITIONAL_TIMEOUT;
  var MAX_CONNECTED_ATTEMPT_TIMEOUT = 5 * UNSUCCESSFUL_CONNECTED_ATTEMPT_ADDITIONAL_TIMEOUT;

  function resetConnectionParameters(connection) {
    connection.connectionWait = 0;

    if (Pusher.TransportType === 'flash') {
      // Flash needs a bit more time
      connection.openTimeout = 5000;
    } else {
      connection.openTimeout = 2000;
    }
    connection.connectedTimeout = 2000;
    connection.connectionSecure = connection.compulsorySecure;
    connection.connectionAttempts = 0;
  }

  function Connection(key, options) {
    var self = this;

    Pusher.EventsDispatcher.call(this);

    this.options = Pusher.Util.extend({encrypted: false}, options);

    this.netInfo = new Pusher.NetInfo();

    this.netInfo.bind('online', function(){
      if (self._machine.is('waiting')) {
        self._machine.transition('connecting');
        updateState('connecting');
      }
    });

    this.netInfo.bind('offline', function() {
      if (self._machine.is('connected')) {
        // These are for Chrome 15, which ends up
        // having two sockets hanging around.
        self.socket.onclose = undefined;
        self.socket.onmessage = undefined;
        self.socket.onerror = undefined;
        self.socket.onopen = undefined;

        self.socket.close();
        self.socket = undefined;
        self._machine.transition('waiting');
      }
    });

    // define the state machine that runs the connection
    this._machine = new Pusher.Machine('initialized', machineTransitions, {
      initializedPre: function() {
        self.compulsorySecure = self.options.encrypted;

        self.key = key;
        self.socket = null;
        self.socket_id = null;

        self.state = 'initialized';
      },

      waitingPre: function() {
        if (self.connectionWait > 0) {
          self.emit('connecting_in', self.connectionWait);
        }

        if (self.netInfo.isOnLine() && self.connectionAttempts <= 4) {
          updateState('connecting');
        } else {
          updateState('unavailable');
        }

        // When in the unavailable state we attempt to connect, but don't
        // broadcast that fact
        if (self.netInfo.isOnLine()) {
          self._waitingTimer = setTimeout(function() {
            self._machine.transition('connecting');
          }, connectionDelay());
        }
      },

      waitingExit: function() {
        clearTimeout(self._waitingTimer);
      },

      connectingPre: function() {
        // Case that a user manages to get to the connecting
        // state even when offline.
        if (self.netInfo.isOnLine() === false) {
          self._machine.transition('waiting');
          updateState('unavailable');

          return;
        }

        var url = formatURL(self.key, self.connectionSecure);
        Pusher.debug('Connecting', url);
        self.socket = new Pusher.Transport(url);
        // now that the socket connection attempt has been started,
        // set up the callbacks fired by the socket for different outcomes
        self.socket.onopen = ws_onopen;
        self.socket.onclose = transitionToWaiting;
        self.socket.onerror = ws_onError;

        // allow time to get ws_onOpen, otherwise close socket and try again
        self._connectingTimer = setTimeout(TransitionToImpermanentlyClosing, self.openTimeout);
      },

      connectingExit: function() {
        clearTimeout(self._connectingTimer);
        self.socket.onopen = undefined; // unbind to avoid open events that are no longer relevant
      },

      connectingToWaiting: function() {
        updateConnectionParameters();

        // FUTURE: update only ssl
      },

      connectingToImpermanentlyClosing: function() {
        updateConnectionParameters();

        // FUTURE: update only timeout
      },

      openPre: function() {
        self.socket.onmessage = ws_onMessageOpen;
        self.socket.onerror = ws_onError;
        self.socket.onclose = transitionToWaiting;

        // allow time to get connected-to-Pusher message, otherwise close socket, try again
        self._openTimer = setTimeout(TransitionToImpermanentlyClosing, self.connectedTimeout);
      },

      openExit: function() {
        clearTimeout(self._openTimer);
        self.socket.onmessage = undefined; // unbind to avoid messages that are no longer relevant
      },

      openToWaiting: function() {
        updateConnectionParameters();
      },

      openToImpermanentlyClosing: function() {
        updateConnectionParameters();
      },

      connectedPre: function(socket_id) {
        self.socket_id = socket_id;

        self.socket.onmessage = ws_onMessageConnected;
        self.socket.onerror = ws_onError;
        self.socket.onclose = transitionToWaiting;

        resetConnectionParameters(self);
        self.connectedAt = new Date().getTime();

        resetActivityCheck();
      },

      connectedPost: function() {
        updateState('connected');
      },

      connectedExit: function() {
        stopActivityCheck();
        updateState('disconnected');
      },

      impermanentlyClosingPost: function() {
        if (self.socket) {
          self.socket.onclose = transitionToWaiting;
          self.socket.close();
        }
      },

      permanentlyClosingPost: function() {
        if (self.socket) {
          self.socket.onclose = function() {
            resetConnectionParameters(self);
            self._machine.transition('permanentlyClosed');
          };

          self.socket.close();
        } else {
          resetConnectionParameters(self);
          self._machine.transition('permanentlyClosed');
        }
      },

      failedPre: function() {
        updateState('failed');
        Pusher.debug('WebSockets are not available in this browser.');
      },

      permanentlyClosedPost: function() {
        updateState('disconnected');
      }
    });

    /*-----------------------------------------------
      -----------------------------------------------*/

    function updateConnectionParameters() {
      if (self.connectionWait < MAX_CONNECTION_ATTEMPT_WAIT) {
        self.connectionWait += UNSUCCESSFUL_CONNECTION_ATTEMPT_ADDITIONAL_WAIT;
      }

      if (self.openTimeout < MAX_OPEN_ATTEMPT_TIMEOUT) {
        self.openTimeout += UNSUCCESSFUL_OPEN_ATTEMPT_ADDITIONAL_TIMEOUT;
      }

      if (self.connectedTimeout < MAX_CONNECTED_ATTEMPT_TIMEOUT) {
        self.connectedTimeout += UNSUCCESSFUL_CONNECTED_ATTEMPT_ADDITIONAL_TIMEOUT;
      }

      if (self.compulsorySecure !== true) {
        self.connectionSecure = !self.connectionSecure;
      }

      self.connectionAttempts++;
    }

    function formatURL(key, isSecure) {
      var port = Pusher.ws_port;
      var protocol = 'ws://';

      // Always connect with SSL if the current page has
      // been loaded via HTTPS.
      //
      // FUTURE: Always connect using SSL.
      //
      if (isSecure || document.location.protocol === 'https:') {
        port = Pusher.wss_port;
        protocol = 'wss://';
      }

      var flash = (Pusher.TransportType === "flash") ? "true" : "false";

      return protocol + Pusher.host + ':' + port + '/app/' + key + '?protocol=5&client=js'
        + '&version=' + Pusher.VERSION
        + '&flash=' + flash;
    }

    // callback for close and retry.  Used on timeouts.
    function TransitionToImpermanentlyClosing() {
      self._machine.transition('impermanentlyClosing');
    }

    function resetActivityCheck() {
      if (self._activityTimer) { clearTimeout(self._activityTimer); }
      // Send ping after inactivity
      self._activityTimer = setTimeout(function() {
        self.send_event('pusher:ping', {})
        // Wait for pong response
        self._activityTimer = setTimeout(function() {
          self.socket.close();
        }, (self.options.pong_timeout || Pusher.pong_timeout))
      }, (self.options.activity_timeout || Pusher.activity_timeout))
    }

    function stopActivityCheck() {
      if (self._activityTimer) { clearTimeout(self._activityTimer); }
    }

    // Returns the delay before the next connection attempt should be made
    //
    // This function guards against attempting to connect more frequently than
    // once every second
    //
    function connectionDelay() {
      var delay = self.connectionWait;
      if (delay === 0) {
        if (self.connectedAt) {
          var t = 1000;
          var connectedFor = new Date().getTime() - self.connectedAt;
          if (connectedFor < t) {
            delay = t - connectedFor;
          }
        }
      }
      return delay;
    }

    /*-----------------------------------------------
      WebSocket Callbacks
      -----------------------------------------------*/

    // no-op, as we only care when we get pusher:connection_established
    function ws_onopen() {
      self._machine.transition('open');
    };

    function handleCloseCode(code, message) {
      // first inform the end-developer of this error
      self.emit('error', {type: 'PusherError', data: {code: code, message: message}});

      if (code === 4000) {
        // SSL only app
        self.compulsorySecure = true;
        self.connectionSecure = true;
        self.options.encrypted = true;

        TransitionToImpermanentlyClosing();
      } else if (code < 4100) {
        // Permentently close connection
        self._machine.transition('permanentlyClosing')
      } else if (code < 4200) {
        // Backoff before reconnecting
        self.connectionWait = 1000;
        self._machine.transition('waiting')
      } else if (code < 4300) {
        // Reconnect immediately
        TransitionToImpermanentlyClosing();
      } else {
        // Unknown error
        self._machine.transition('permanentlyClosing')
      }
    }

    function ws_onMessageOpen(event) {
      var params = parseWebSocketEvent(event);
      if (params !== undefined) {
        if (params.event === 'pusher:connection_established') {
          self._machine.transition('connected', params.data.socket_id);
        } else if (params.event === 'pusher:error') {
          handleCloseCode(params.data.code, params.data.message)
        }
      }
    }

    function ws_onMessageConnected(event) {
      resetActivityCheck();

      var params = parseWebSocketEvent(event);
      if (params !== undefined) {
        Pusher.debug('Event recd', params);

        switch (params.event) {
          case 'pusher:error':
            self.emit('error', {type: 'PusherError', data: params.data});
            break;
          case 'pusher:ping':
            self.send_event('pusher:pong', {})
            break;
        }

        self.emit('message', params);
      }
    }


    /**
     * Parses an event from the WebSocket to get
     * the JSON payload that we require
     *
     * @param {MessageEvent} event  The event from the WebSocket.onmessage handler.
    **/
    function parseWebSocketEvent(event) {
      try {
        var params = JSON.parse(event.data);

        if (typeof params.data === 'string') {
          try {
            params.data = JSON.parse(params.data);
          } catch (e) {
            if (!(e instanceof SyntaxError)) {
              throw e;
            }
          }
        }

        return params;
      } catch (e) {
        self.emit('error', {type: 'MessageParseError', error: e, data: event.data});
      }
    }

    function transitionToWaiting() {
      self._machine.transition('waiting');
    }

    function ws_onError(error) {
      // just emit error to user - socket will already be closed by browser
      self.emit('error', { type: 'WebSocketError', error: error });
    }

    // Updates the public state information exposed by connection
    //
    // This is distinct from the internal state information used by _machine
    // to manage the connection
    //
    function updateState(newState, data) {
      var prevState = self.state;
      self.state = newState;

      // Only emit when the state changes
      if (prevState !== newState) {
        Pusher.debug('State changed', prevState + ' -> ' + newState);
        self.emit('state_change', {previous: prevState, current: newState});
        self.emit(newState, data);
      }
    }
  };

  Connection.prototype.connect = function() {
    // no WebSockets
    if (!this._machine.is('failed') && !Pusher.Transport) {
      this._machine.transition('failed');
    }
    // initial open of connection
    else if(this._machine.is('initialized')) {
      resetConnectionParameters(this);
      this._machine.transition('waiting');
    }
    // user skipping connection wait
    else if (this._machine.is('waiting') && this.netInfo.isOnLine() === true) {
      this._machine.transition('connecting');
    }
    // user re-opening connection after closing it
    else if(this._machine.is("permanentlyClosed")) {
      resetConnectionParameters(this);
      this._machine.transition('waiting');
    }
  };

  Connection.prototype.send = function(data) {
    if (this._machine.is('connected')) {
      // Workaround for MobileSafari bug (see https://gist.github.com/2052006)
      var self = this;
      setTimeout(function() {
        self.socket.send(data);
      }, 0);
      return true;
    } else {
      return false;
    }
  };

  Connection.prototype.send_event = function(event_name, data, channel) {
    var payload = {
      event: event_name,
      data: data
    };
    if (channel) payload['channel'] = channel;

    Pusher.debug('Event sent', payload);
    return this.send(JSON.stringify(payload));
  }

  Connection.prototype.disconnect = function() {
    if (this._machine.is('permanentlyClosed')) return;

    if (this._machine.is('waiting') || this._machine.is('failed')) {
      this._machine.transition('permanentlyClosed');
    } else {
      this._machine.transition('permanentlyClosing');
    }
  };

  Pusher.Util.extend(Connection.prototype, Pusher.EventsDispatcher.prototype);
  this.Pusher.Connection = Connection;
}).call(this);

;(function() {
  Pusher.Channels = function() {
    this.channels = {};
  };

  Pusher.Channels.prototype = {
    add: function(channel_name, pusher) {
      var existing_channel = this.find(channel_name);
      if (!existing_channel) {
        var channel = Pusher.Channel.factory(channel_name, pusher);
        this.channels[channel_name] = channel;
        return channel;
      } else {
        return existing_channel;
      }
    },

    find: function(channel_name) {
      return this.channels[channel_name];
    },

    remove: function(channel_name) {
      delete this.channels[channel_name];
    },

    disconnect: function () {
      for(var channel_name in this.channels){
        this.channels[channel_name].disconnect()
      }
    }
  };

  Pusher.Channel = function(channel_name, pusher) {
    var self = this;
    Pusher.EventsDispatcher.call(this, function(event_name, event_data) {
      Pusher.debug('No callbacks on ' + channel_name + ' for ' + event_name);
    });

    this.pusher = pusher;
    this.name = channel_name;
    this.subscribed = false;

    this.bind('pusher_internal:subscription_succeeded', function(data) {
      self.onSubscriptionSucceeded(data);
    });
  };

  Pusher.Channel.prototype = {
    // inheritable constructor
    init: function() {},
    disconnect: function() {
      this.subscribed = false;
      this.emit("pusher_internal:disconnected");
    },

    onSubscriptionSucceeded: function(data) {
      this.subscribed = true;
      this.emit('pusher:subscription_succeeded');
    },

    authorize: function(socketId, options, callback){
      return callback(false, {}); // normal channels don't require auth
    },

    trigger: function(event, data) {
      return this.pusher.send_event(event, data, this.name);
    }
  };

  Pusher.Util.extend(Pusher.Channel.prototype, Pusher.EventsDispatcher.prototype);

  Pusher.Channel.PrivateChannel = {
    authorize: function(socketId, options, callback){
      var self = this;
      var authorizer = new Pusher.Channel.Authorizer(this, Pusher.channel_auth_transport, options);
      return authorizer.authorize(socketId, function(err, authData) {
        if(!err) {
          self.emit('pusher_internal:authorized', authData);
        }

        callback(err, authData);
      });
    }
  };

  Pusher.Channel.PresenceChannel = {
    init: function(){
      this.members = new Members(this); // leeches off channel events
    },

    onSubscriptionSucceeded: function(data) {
      this.subscribed = true;
      // We override this because we want the Members obj to be responsible for
      // emitting the pusher:subscription_succeeded.  It will do this after it has done its work.
    }
  };

  var Members = function(channel) {
    var self = this;

    var reset = function() {
      this._members_map = {};
      this.count = 0;
      this.me = null;
    };
    reset.call(this);

    channel.bind('pusher_internal:authorized', function(authorizedData) {
      var channelData = JSON.parse(authorizedData.channel_data);
      channel.bind("pusher_internal:subscription_succeeded", function(subscriptionData) {
        self._members_map = subscriptionData.presence.hash;
        self.count = subscriptionData.presence.count;
        self.me = self.get(channelData.user_id);
        channel.emit('pusher:subscription_succeeded', self);
      });
    });

    channel.bind('pusher_internal:member_added', function(data) {
      if(self.get(data.user_id) === null) { // only incr if user_id does not already exist
        self.count++;
      }

      self._members_map[data.user_id] = data.user_info;
      channel.emit('pusher:member_added', self.get(data.user_id));
    });

    channel.bind('pusher_internal:member_removed', function(data) {
      var member = self.get(data.user_id);
      if(member) {
        delete self._members_map[data.user_id];
        self.count--;
        channel.emit('pusher:member_removed', member);
      }
    });

    channel.bind('pusher_internal:disconnected', function() {
      reset.call(self);
    });
  };

  Members.prototype = {
    each: function(callback) {
      for(var i in this._members_map) {
        callback(this.get(i));
      }
    },

    get: function(user_id) {
      if (this._members_map.hasOwnProperty(user_id)) { // have heard of this user user_id
        return {
          id: user_id,
          info: this._members_map[user_id]
        }
      } else { // have never heard of this user
        return null;
      }
    }
  };

  Pusher.Channel.factory = function(channel_name, pusher){
    var channel = new Pusher.Channel(channel_name, pusher);
    if (channel_name.indexOf('private-') === 0) {
      Pusher.Util.extend(channel, Pusher.Channel.PrivateChannel);
    } else if (channel_name.indexOf('presence-') === 0) {
      Pusher.Util.extend(channel, Pusher.Channel.PrivateChannel);
      Pusher.Util.extend(channel, Pusher.Channel.PresenceChannel);
    };
    channel.init();
    return channel;
  };
}).call(this);
;(function() {
  Pusher.Channel.Authorizer = function(channel, type, options) {
    this.channel = channel;
    this.type = type;

    this.authOptions = (options || {}).auth || {};
  };

  Pusher.Channel.Authorizer.prototype = {
    composeQuery: function(socketId) {
      var query = '&socket_id=' + encodeURIComponent(socketId)
        + '&channel_name=' + encodeURIComponent(this.channel.name);

      for(var i in this.authOptions.params) {
        query += "&" + encodeURIComponent(i) + "=" + encodeURIComponent(this.authOptions.params[i]);
      }

      return query;
    },

    authorize: function(socketId, callback) {
      return Pusher.authorizers[this.type].call(this, socketId, callback);
    }
  };


  Pusher.auth_callbacks = {};
  Pusher.authorizers = {
    ajax: function(socketId, callback){
      var self = this, xhr;

      if (Pusher.XHR) {
        xhr = new Pusher.XHR();
      } else {
        xhr = (window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
      }

      xhr.open("POST", Pusher.channel_auth_endpoint, true);

      // add request headers
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
      for(var headerName in this.authOptions.headers) {
        xhr.setRequestHeader(headerName, this.authOptions.headers[headerName]);
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            var data, parsed = false;

            try {
              data = JSON.parse(xhr.responseText);
              parsed = true;
            } catch (e) {
              callback(true, 'JSON returned from webapp was invalid, yet status code was 200. Data was: ' + xhr.responseText);
            }

            if (parsed) { // prevents double execution.
              callback(false, data);
            }
          } else {
            Pusher.warn("Couldn't get auth info from your webapp", xhr.status);
            callback(true, xhr.status);
          }
        }
      };

      xhr.send(this.composeQuery(socketId));
      return xhr;
    },

    jsonp: function(socketId, callback){
      if(this.authOptions.headers !== undefined) {
        Pusher.warn("Warn", "To send headers with the auth request, you must use AJAX, rather than JSONP.");
      }

      var script = document.createElement("script");
      // Hacked wrapper.
      Pusher.auth_callbacks[this.channel.name] = function(data) {
        callback(false, data);
      };

      var callback_name = "Pusher.auth_callbacks['" + this.channel.name + "']";
      script.src = Pusher.channel_auth_endpoint
        + '?callback='
        + encodeURIComponent(callback_name)
        + this.composeQuery(socketId);

      var head = document.getElementsByTagName("head")[0] || document.documentElement;
      head.insertBefore( script, head.firstChild );
    }
  };
}).call(this);
// _require(dependencies, callback) takes an array of dependency urls and a
// callback to call when all the dependecies have finished loading
var _require = (function() {
  function handleScriptLoaded(elem, callback) {
    if (document.addEventListener) {
      elem.addEventListener('load', callback, false);
    } else {
      elem.attachEvent('onreadystatechange', function () {
        if (elem.readyState == 'loaded' || elem.readyState == 'complete') {
          callback();
        }
      });
    }
  }

  function addScript(src, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.setAttribute('src', src);
    script.setAttribute("type","text/javascript");
    script.setAttribute('async', true);

    handleScriptLoaded(script, function() {
      callback();
    });

    head.appendChild(script);
  }

  return function(deps, callback) {
    var deps_loaded = 0;
    for (var i = 0; i < deps.length; i++) {
      addScript(deps[i], function() {
        if (deps.length == ++deps_loaded) {
          // This setTimeout is a workaround for an Opera issue
          setTimeout(callback, 0);
        }
      });
    }
  }
})();

;(function() {
  // Support Firefox versions which prefix WebSocket
  if (!window['WebSocket'] && window['MozWebSocket']) {
    window['WebSocket'] = window['MozWebSocket']
  }

  if (window['WebSocket']) {
    Pusher.Transport = window['WebSocket'];
    Pusher.TransportType = 'native';
  }

  var cdn = (document.location.protocol == 'http:') ? Pusher.cdn_http : Pusher.cdn_https;
  var root = cdn + Pusher.VERSION;
  var deps = [];

  if (!window['JSON']) {
    deps.push(root + '/json2' + Pusher.dependency_suffix + '.js');
  }
  if (!window['WebSocket']) {
    // We manually initialize web-socket-js to iron out cross browser issues
    window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
    deps.push(root + '/flashfallback' + Pusher.dependency_suffix + '.js');
  }

  var initialize = function() {
    if (window['WebSocket']) {
      // Initialize function in the case that we have native WebSocket support
      return function() {
        Pusher.ready();
      }
    } else {
      // Initialize function for fallback case
      return function() {
        if (window['WebSocket']) {
          // window['WebSocket'] is a flash emulation of WebSocket
          Pusher.Transport = window['WebSocket'];
          Pusher.TransportType = 'flash';

          // window.WEB_SOCKET_SWF_LOCATION = root + "/WebSocketMain.swf";
          window.WEB_SOCKET_SWF_LOCATION = "https://s3.amazonaws.com/uploadcare-static/WebSocketMainInsecure.swf"
          WebSocket.__addTask(function() {
            Pusher.ready();
          })
          WebSocket.__initialize();
        } else {
          // Flash must not be installed
          Pusher.Transport = null;
          Pusher.TransportType = 'none';
          Pusher.ready();
        }
      }
    }
  }();

  // Allows calling a function when the document body is available
  var ondocumentbody = function(callback) {
    var load_body = function() {
      document.body ? callback() : setTimeout(load_body, 0);
    }
    load_body();
  };

  var initializeOnDocumentBody = function() {
    ondocumentbody(initialize);
  }

  if (deps.length > 0) {
    _require(deps, initializeOnDocumentBody);
  } else {
    initializeOnDocumentBody();
  }
})();

(function() {



}).call(this);
(function() {
  var __slice = [].slice;

  uploadcare.debug = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return uploadcare.jQuery(uploadcare).trigger('log.uploadcare', [args]);
  };

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    return uploadcare.namespace('uploadcare.utils.abilities', function(ns) {
      return ns.canFileAPI = function() {
        return !!window.FileList;
      };
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var debug;
    debug = uploadcare.debug;
    return uploadcare.namespace('uploadcare.utils.pusher', function(ns) {
      var hasOwners, pusherInstance, pusherWrapped, pushers, releasePusher, updateConnection;
      pushers = {};
      ns.getPusher = function(key, owner) {
        if (!(key in pushers)) {
          pushers[key] = {
            instance: null,
            owners: {}
          };
        }
        if (!pushers[key].owners[owner]) {
          pushers[key].owners[owner] = true;
        }
        updateConnection(key);
        return pusherWrapped(key, owner);
      };
      releasePusher = function(key, owner) {
        debug('releasing', owner);
        if (!pushers[key].owners[owner]) {
          debug('this pusher has already been released');
          return;
        }
        pushers[key].owners[owner] = false;
        return updateConnection(key);
      };
      hasOwners = function(key) {
        var owner;
        return ((function() {
          var _results;
          _results = [];
          for (owner in pushers[key].owners) {
            if (pushers[key].owners[owner]) {
              _results.push(owner);
            }
          }
          return _results;
        })()).length > 0;
      };
      updateConnection = function(key) {
        var instance;
        instance = pusherInstance(key);
        if (hasOwners(key)) {
          return instance.connect();
        } else {
          debug('disconnect timeout started', key);
          return setTimeout((function() {
            if (hasOwners(key)) {
              return debug('not disconnecting in the end');
            } else {
              debug('actual disconnect', key);
              return instance.disconnect();
            }
          }), 5000);
        }
      };
      pusherInstance = function(key) {
        var _ref;
        if (((_ref = pushers[key]) != null ? _ref.instance : void 0) != null) {
          return pushers[key].instance;
        }
        debug('new actual Pusher');
        return pushers[key].instance = new Pusher(key);
      };
      return pusherWrapped = function(key, owner) {
        var Wrapped;
        Wrapped = function() {
          this.owner = owner;
          this.release = function() {
            return releasePusher(key, owner);
          };
          return this;
        };
        Wrapped.prototype = pusherInstance(key);
        return new Wrapped();
      };
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, debug, pusher;
    $ = uploadcare.jQuery, debug = uploadcare.debug;
    pusher = uploadcare.utils.pusher;
    return uploadcare.namespace('uploadcare.utils.pubsub', function(ns) {
      var PollWatcher, PusherWatcher;
      ns.PubSub = (function() {

        function PubSub(settings, channel, topic) {
          this.settings = settings;
          this.channel = channel;
          this.topic = topic;
          this.pollUrlConstructor = function(channel, topic) {
            return "" + this.settings.socialBase + "/pubsub/status/" + this.channel + "/" + this.topic;
          };
          this.pusherw = new PusherWatcher(this, this.settings.pusherKey);
          this.pollw = new PollWatcher(this);
        }

        PubSub.prototype.watch = function() {
          var _this = this;
          this.pusherw.watch();
          this.pollw.watch();
          return $(this.pusherw).on('started', function() {
            return _this.pollw.stop();
          });
        };

        PubSub.prototype.stop = function() {
          this.pusherw.stop();
          return this.pollw.stop();
        };

        PubSub.prototype.__update = function(status) {
          if (!this.status || this.status.score < status.score) {
            this.status = status;
            return this.__notify();
          }
        };

        PubSub.prototype.__notify = function() {
          debug('status', this.status.score, this.status.state, this.status);
          return $(this).trigger(this.status.state, [this.status]);
        };

        return PubSub;

      })();
      PusherWatcher = (function() {

        function PusherWatcher(ps, pusherKey) {
          this.ps = ps;
          this.pusher = pusher.getPusher(pusherKey, this.__channelName());
        }

        PusherWatcher.prototype.__channelName = function() {
          return "pubsub.channel." + this.ps.channel + "." + this.ps.topic;
        };

        PusherWatcher.prototype.watch = function() {
          var onStarted,
            _this = this;
          this.channel = this.pusher.subscribe(this.__channelName());
          this.channel.bind('event', function(data) {
            return _this.ps.__update($.parseJSON(data));
          });
          onStarted = function() {
            debug('wow, listening with pusher');
            $(_this).trigger('started');
            return _this.channel.unbind('event', onStarted);
          };
          return this.channel.bind('event', onStarted);
        };

        PusherWatcher.prototype.stop = function() {
          if (this.pusher) {
            this.pusher.release();
          }
          return this.pusher = null;
        };

        return PusherWatcher;

      })();
      return PollWatcher = (function() {

        function PollWatcher(ps) {
          this.ps = ps;
        }

        PollWatcher.prototype.watch = function() {
          var _this = this;
          return this.interval = setInterval((function() {
            return _this.__checkStatus();
          }), 2000);
        };

        PollWatcher.prototype.stop = function() {
          if (this.interval) {
            clearInterval(this.interval);
          }
          return this.interval = null;
        };

        PollWatcher.prototype.__checkStatus = function() {
          var fail,
            _this = this;
          debug('polling status...');
          fail = function() {
            return _this.ps.__update({
              score: -1,
              state: 'error'
            });
          };
          return $.ajax(this.ps.pollUrlConstructor(this.ps.channel, this.ps.topic), {
            dataType: 'jsonp'
          }).fail(fail).done(function(data) {
            if (data.error) {
              return fail();
            }
            return _this.ps.__update(data);
          });
        };

        return PollWatcher;

      })();
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, namespace;
    namespace = uploadcare.namespace, $ = uploadcare.jQuery;
    return namespace('uploadcare.utils', function(ns) {
      ns.defer = function(fn) {
        return setTimeout(fn, 0);
      };
      ns.bindAll = function(source, methods) {
        var method, target, _fn, _i, _len;
        target = {};
        _fn = function(method) {
          var fn;
          fn = source[method];
          return target[method] = function() {
            var result;
            result = fn.apply(source, arguments);
            if (result === source) {
              return target;
            } else {
              return result;
            }
          };
        };
        for (_i = 0, _len = methods.length; _i < _len; _i++) {
          method = methods[_i];
          _fn(method);
        }
        return target;
      };
      ns.uuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r, v;
          r = Math.random() * 16 | 0;
          v = c === 'x' ? r : r & 3 | 8;
          return v.toString(16);
        });
      };
      ns.uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
      ns.cdnUrlModifiersRegex = /(?:-\/(?:[a-z0-9_]+\/)+)+/i;
      ns.normalizeUrl = function(url) {
        if (!url.match(/^([a-z][a-z0-9+\-\.]*:)?\/\//i)) {
          url = "https://" + url;
        }
        return url.replace(/\/+$/, '');
      };
      ns.buildSettings = function(settings) {
        var crop, key, ratio, size, _i, _j, _len, _len1, _ref, _ref1;
        settings = $.extend({}, uploadcare.defaults, settings || {});
        if ($.type(settings.tabs) === "string") {
          settings.tabs = settings.tabs.split(' ');
        }
        settings.tabs = settings.tabs || [];
        _ref = ['urlBase', 'socialBase', 'cdnBase'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          settings[key] = ns.normalizeUrl(settings[key]);
        }
        _ref1 = ['multiple', 'imagesOnly'];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          key = _ref1[_j];
          if (settings[key] !== false) {
            settings[key] = settings[key] != null;
          }
        }
        if (settings.multiple) {
          console.log('Sorry, the multiupload is not working now');
          settings.multiple = false;
        }
        settings.__cropParsed = {
          enabled: true,
          scale: false,
          upscale: false,
          preferedSize: null
        };
        crop = '' + settings.crop;
        if (crop.match(/disabled/i)) {
          crop = 'disabled';
          settings.__cropParsed.enabled = false;
        } else if (ratio = crop.match(/[0-9]+\/[0-9]+/)) {
          crop = ratio[0];
          settings.__cropParsed.preferedSize = ratio[0].replace('/', 'x');
        } else if (size = crop.match(/[0-9]+x[0-9]+/i)) {
          settings.__cropParsed.preferedSize = size[0];
          settings.__cropParsed.scale = true;
          if (crop.match(/upscale/i)) {
            crop = size[0] + ' upscale';
            settings.__cropParsed.upscale = true;
          } else {
            crop = size[0];
          }
        } else {
          crop = '';
        }
        settings.crop = crop;
        return settings;
      };
      ns.fitText = function(text, max) {
        var head, tail;
        if (text.length > max) {
          head = Math.ceil((max - 3) / 2);
          tail = Math.floor((max - 3) / 2);
          return text.slice(0, head) + '...' + text.slice(-tail);
        } else {
          return text;
        }
      };
      ns.fileInput = function(container, multiple, fn) {
        var input;
        container.find('input:file').remove();
        input = multiple ? $('<input type="file" multiple>') : $('<input type="file">');
        input.on('change', fn).css({
          opacity: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'default',
          display: 'block',
          fontSize: '2em'
        });
        return container.css({
          position: 'relative',
          overflow: 'hidden'
        }).append(input);
      };
      ns.parseUrl = function(url) {
        var a;
        a = document.createElement('a');
        a.href = url;
        return a;
      };
      return ns.createObjectUrl = function(object) {
        var URL;
        URL = window.URL || window.webkitURL;
        if (URL) {
          return URL.createObjectURL(object);
        }
        return null;
      };
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    return uploadcare.defaults = {
      locale: window.UPLOADCARE_LOCALE,
      translations: window.UPLOADCARE_LOCALE_TRANSLATIONS,
      pluralize: window.UPLOADCARE_LOCALE_PLURALIZE,
      publicKey: window.UPLOADCARE_PUBLIC_KEY || void 0,
      pusherKey: window.UPLOADCARE_PUSHER_KEY || '79ae88bd931ea68464d9',
      urlBase: window.UPLOADCARE_URL_BASE || 'https://upload.uploadcare.com',
      socialBase: window.UPLOADCARE_SOCIAL_BASE || 'https://social.uploadcare.com',
      cdnBase: window.UPLOADCARE_CDN_BASE || 'https://ucarecdn.com',
      live: window.UPLOADCARE_LIVE || true,
      tabs: window.UPLOADCARE_TABS || 'file url facebook dropbox gdrive instagram',
      multiple: false,
      imagesOnly: void 0,
      crop: window.UPLOADCARE_CROP != null ? window.UPLOADCARE_CROP : 'disabled'
    };
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    uploadcare.namespace('uploadcare.locale.translations', function(ns) {
      return ns.en = {
        ready: 'Upload from',
        uploading: 'Uploading... Please wait.',
        errors: {
          "default": 'Error',
          baddata: 'Incorrect value',
          size: 'Too big',
          upload: 'Can\'t upload',
          user: 'Upload canceled',
          info: 'Can\'t load info',
          image: 'Only images allowed'
        },
        draghere: 'Drop the file here',
        file: {
          one: '1 file',
          other: '%1 files'
        },
        buttons: {
          cancel: 'Cancel',
          remove: 'Remove',
          file: 'Computer'
        },
        dialog: {
          tabs: {
            file: {
              drag: 'Drop a file here',
              or: 'or',
              button: 'Choose a file from your computer',
              also: 'You can also choose it from',
              tabNames: {
                facebook: 'Facebook',
                dropbox: 'Dropbox',
                gdrive: 'Google Drive',
                instagram: 'Instagram',
                url: 'Arbitrary Links'
              }
            },
            url: {
              title: 'Files from the Web',
              line1: 'Grab any file off the web.',
              line2: 'Just provide the link.',
              input: 'Paste your link here...',
              button: 'Upload'
            },
            preview: {
              unknownName: 'unknown',
              change: 'Change file',
              back: 'Back',
              done: 'Select',
              unknown: {
                title: 'Uploading. Please wait for a preview.',
                done: 'Skip preview and accept'
              },
              regular: {
                title: 'Upload this file?',
                line1: 'You are about to upload the file above.',
                line2: 'Please confirm.'
              },
              image: {
                title: 'Upload this image?',
                change: 'Change image'
              },
              error: {
                "default": {
                  title: 'Uploading failed',
                  line1: 'Something went wrong during uploading.',
                  line2: 'Please try again.'
                },
                image: {
                  title: 'Images only',
                  line1: 'Only image files can be accepted.',
                  line2: 'Please try again with another file.'
                },
                size: {
                  title: 'Size limit',
                  line1: 'The file you selected exceed the 100MB limit.',
                  line2: 'Please try again with another file.'
                }
              }
            }
          },
          footer: {
            text: 'Uploading, Storing and Processing files by',
            link: 'Uploadcare.com'
          }
        },
        crop: {
          error: {
            title: 'Error',
            text: 'Can\'t load image'
          },
          done: 'Done'
        }
      };
    });
    return uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
      return ns.en = function(n) {
        if (n === 1) {
          return 'one';
        }
        return 'other';
      };
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    uploadcare.namespace('uploadcare.locale.translations', function(ns) {
      return ns.lv = {
        ready: 'Izvēlieties failu',
        uploading: 'Augšupielādē... Lūdzu, gaidiet.',
        errors: {
          "default": 'Kļūda',
          image: 'Atļauti tikai attēli'
        },
        draghere: 'Velciet failus šeit',
        file: {
          zero: '0 failu',
          one: '1 fails',
          other: '%1 faili'
        },
        buttons: {
          cancel: 'Atcelt',
          remove: 'Dzēst',
          file: 'Dators'
        },
        dialog: {
          title: 'Ielādēt jebko no jebkurienes',
          poweredby: 'Darbināts ar',
          support: {
            images: 'Attēli',
            audio: 'Audio',
            video: 'Video',
            documents: 'Dokumenti'
          },
          tabs: {
            file: {
              title: 'Mans dators',
              line1: 'Paņemiet jebkuru failu no jūsu datora.',
              line2: 'Izvēlēties ar dialogu vai ievelciet iekšā.',
              button: 'Meklēt failus'
            },
            url: {
              title: 'Faili no tīmekļa',
              line1: 'Paņemiet jebkuru failu no tīmekļa.',
              line2: 'Tikai uzrādiet linku.',
              input: 'Ielīmējiet linku šeit...',
              button: 'Ielādēt'
            }
          }
        }
      };
    });
    return uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
      return ns.lv = function(n) {
        if (n === 0) {
          return 'zero';
        }
        if ((n % 10 === 1) && (n % 100 !== 11)) {
          return 'one';
        }
        return 'other';
      };
    });
  });

}).call(this);
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  uploadcare.whenReady(function() {
    uploadcare.namespace('uploadcare.locale.translations', function(ns) {
      return ns.pl = {
        ready: 'Prześlij z',
        uploading: 'Przesyłanie... Proszę czekać.',
        errors: {
          "default": 'Błąd'
        },
        draghere: 'Upuść plik tutaj',
        buttons: {
          cancel: 'Anuluj',
          remove: 'Usuń',
          file: 'Komputer'
        },
        dialog: {
          tabs: {
            file: {
              title: 'Mój komputer'
            },
            url: {
              title: 'Pliki z sieci'
            }
          }
        }
      };
    });
    return uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
      return ns.pl = function(n) {
        var _ref, _ref1, _ref2, _ref3;
        if (n === 1) {
          return 'one';
        }
        if ((_ref = n % 10, __indexOf.call([2, 3, 4], _ref) >= 0) && (_ref1 = n % 100, __indexOf.call([12, 13, 14], _ref1) < 0)) {
          return 'few';
        }
        if ((n !== 1) && ((_ref2 = n % 10, __indexOf.call([2, 3, 4], _ref2) < 0) || (_ref3 = n % 100, __indexOf.call([12, 13, 14], _ref3) >= 0))) {
          return 'many';
        }
        return 'other';
      };
    });
  });

}).call(this);
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  uploadcare.whenReady(function() {
    uploadcare.namespace('uploadcare.locale.translations', function(ns) {
      return ns.ru = {
        ready: 'Выберите файл',
        uploading: 'Идет загрузка',
        errors: {
          "default": 'Ошибка',
          image: 'Разрешены только изображения'
        },
        draghere: 'Перетащите файл сюда',
        file: {
          one: '1 файл',
          few: '%1 файла',
          many: '%1 файлов',
          other: '%1 файла'
        },
        buttons: {
          cancel: 'Отмена',
          remove: 'Удалить',
          file: 'Компьютер'
        },
        dialog: {
          title: 'Загрузите что угодно, откуда угодно',
          poweredby: 'Предоставлено',
          support: {
            images: 'Изображения',
            audio: 'Аудио',
            video: 'Видео',
            documents: 'Документы'
          },
          tabs: {
            file: {
              title: 'Мой компьютер',
              line1: 'Загрузите любой файл со своего компьютера.',
              line2: 'Выберите его через окно поиска или перетащите.',
              button: 'Поиск файлов'
            },
            url: {
              title: 'Файлы с других сайтов',
              line1: 'Загрузите любой файл из сети.',
              line2: '',
              input: 'Укажите здесь ссылку...',
              button: 'Загрузить'
            }
          }
        }
      };
    });
    return uploadcare.namespace('uploadcare.locale.pluralize', function(ns) {
      return ns.ru = function(n) {
        var _ref, _ref1, _ref2, _ref3;
        if ((n % 10 === 1) && (n % 100 !== 11)) {
          return 'one';
        }
        if ((_ref = n % 10, __indexOf.call([2, 3, 4], _ref) >= 0) && (_ref1 = n % 100, __indexOf.call([12, 13, 14], _ref1) < 0)) {
          return 'few';
        }
        if ((n % 10 === 0) || (_ref2 = n % 10, __indexOf.call([5, 6, 7, 8, 9], _ref2) >= 0) || (_ref3 = n % 100, __indexOf.call([11, 12, 13, 14], _ref3) >= 0)) {
          return 'many';
        }
        return 'other';
      };
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, namespace;
    namespace = uploadcare.namespace, $ = uploadcare.jQuery;
    return namespace('uploadcare.locale', function(ns) {
      var defaultLocale, translate, _base, _name;
      defaultLocale = 'en';
      ns.lang = uploadcare.defaults.locale || defaultLocale;
      (_base = ns.translations)[_name = ns.lang] || (_base[_name] = {});
      $.extend(ns.translations[ns.lang], uploadcare.defaults.translations);
      translate = function(key, locale) {
        var node, path, subkey, _i, _len;
        if (locale == null) {
          locale = defaultLocale;
        }
        path = key.split('.');
        node = ns.translations[locale];
        for (_i = 0, _len = path.length; _i < _len; _i++) {
          subkey = path[_i];
          if (node == null) {
            return null;
          }
          node = node[subkey];
        }
        return node;
      };
      return ns.t = function(key, n) {
        var lang, pluralize, value, _ref;
        lang = ns.lang;
        value = translate(key, lang);
        if (!(value != null) && lang !== defaultLocale) {
          lang = defaultLocale;
          value = translate(key, lang);
        }
        if (n != null) {
          pluralize = ns.pluralize[lang];
          if (pluralize != null) {
            value = ((_ref = value[pluralize(n)]) != null ? _ref.replace('%1', n) : void 0) || n;
          } else {
            value = '';
          }
        }
        return value || '';
      };
    });
  });

}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/circle"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-widget-circle-back" role="uploadcare-widget-status">\n    <div class="uploadcare-widget-circle-center"></div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/crop-widget"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-crop-widget">\n  <div class="uploadcare-crop-widget__image-wrap" role="uploadcare-crop-widget-image-wrap">\n    <div class="uploadcare-crop-widget__error">\n      <div class="uploadcare-crop-widget__error__title">',(''+ t('crop.error.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n      <div class="uploadcare-crop-widget__error__text">',(''+ t('crop.error.text') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n    </div>\n  </div>\n  <div class="uploadcare-crop-widget__controls">\n    <button class="uploadcare-crop-widget__done-button" role="uploadcare-crop-widget-done-button">\n      ',(''+ t('crop.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n    </button>\n  </div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/dialog"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog">\n    <div class="uploadcare-dialog-inner-wrap1">\n    <div class="uploadcare-dialog-inner-wrap2">\n        <div class="uploadcare-dialog-close">\n            <div role="uploadcare-dialog-close">&times;</div>\n        </div>\n        <div class="uploadcare-dialog-panel-wrap">\n            <div class="uploadcare-dialog-panel">\n                <div class="uploadcare-dialog-body">\n                    <div class="uploadcare-dialog-tabs" role="uploadcare-dialog-tabs"></div>\n                </div>\n            </div>\n            <div class="uploadcare-dialog-footer">\n                ',(''+ t('dialog.footer.text') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n                <a href="https://uploadcare.com/" target="_blank">',(''+ t('dialog.footer.link') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</a>\n            </div>\n        </div>\n    </div>\n    </div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/styles"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\n\n\n\n\n\n.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab:after{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAFeCAYAAADHfkwkAAAQGUlEQVR42uydbYxVRxnHuxdaa6q8pLwEQSi1CpLWT1qML9A2gDRVbKQNDfWDoU1s0bQ1RqOJrUqNDRQwvhCtxp6%2BKJMQarTQLmAbKtg2QutriESK1KTCCrvlZWnLsmzxP%2BzD3f%2FOM3P39sOZc8Xnwz8zZ87ce%2BZ3nnlm5p4zd%2Ba806dPnxMyEAMxEAMxEAMxkP9bkIceXUty5xWPDD6G2hCfhfTliP8e8Q6oB3EvH0eaWwHNQryt%2FjmEBRR8fyYQiApSg5agMHsQngbIaYSQo1DiIsm7BHlrHgJhHUqUD6ToB5kK7eBC4phhfKFDCE7fId9BNyYDSDG4OlyF8BAVkEINAThoIE55D%2BF4lnxnDhDHd2weLtojBVJVqCAgZY14tevBuU%2Bwz%2BSoWtNwoWO4qIJgmDiQS8JB3dA0aUhKBxkmPsFVRwFIWiMAnXfAZ4ZlsIhbIs5cd1o5VoVtHtCFlrml1OYXF2pDgfcQQOyu66qV9iMOWXt8n1SmRWZLYbiQEsabWk5Lg0A6%2F%2BwyLbJcmk4uRMLJNUi88BLqPMvLtMh27hN0vU%2F1EyJdzShd3ZBtZYJ00MVUn5Bw9K2IQ5xvaMeHOsqsWj2JFinVDD9FfY%2BPR%2FsdtlIx4Hs95VmEQXR10dULhfcdWyEgyjdEAWAWkA51B4NQAUnVkri2SNpfOjI4e9o3BDTpRxpad66iUp19hb7ryirp8VST5wVqeZnOPlv5RtzZB5w2ag2n%2Bxit2WVapA3aExY63THqdF2NdFx%2BPdbKHv3eosdPQ492df4GvyDLHjT6Ly%2F6h%2FE7Vd3Wx1oaMFblXgD0sJJB6n3CdKibfUFbQFc%2FLeVj3dB0eTqTBcTrWhQCP3W1r6SrD8J0K9Xjv1O%2Bv9xfiEXwHEou3J3uSwaJHT20YrfcmFxPUVzsudZ0X68JQkBU8xx93iWfnV63RJ4HdPx0ke%2Beq0FLEH9JQJQFQtAzeeUBnb45%2BXyExZaqQbOg%2B5HvWahDRsxeHdCzyOvPzYJq%2FFkJOW4PsQ3EQAzEQAzEQAzEQAzEQAzEQAzEQAzEQAzEQIInjTPlCaF%2BETr0E3edJ3irRXoJmlnmQ%2By9UoD9uNDLCKH%2BEI8%2B5RhxaNC5ehyic4nPHhDAveWByIwEqK0IHpmqUOKFiM4NZfU25Ov0likNRKzxMgMIEBc%2Bqrfy3kMsWC5IQSAKQJ7WFyqdj5sFWZsLxInEKoGVvDQw0psE8a8kSvURcVA9GzutII8b%2BoaVbxFHIKo6xauaAmsWxJUMgouoQuvqk3L8pn0EKrlqkY%2Bk%2FMBLzXdvqaolIGGB1TFLA7UGiO%2BFVWeoAHTzLDCtZJEARHWOyvEZtkkQB5BMza8GcI0bgEdaqdXqBzkRdnhFqtAqT9Md4vFyQdLTyGmmg5LKX%2Bg0Pc8rg4%2BomaJcOCgAcgIZm0iTBs%2FRj0ihRLoQzcTVZ5WlSx6iHOeL6Uk0KQvpub4axoXAR8usWnepaUtQHI6rVtMWY91REoietyWhiONuX4Pf8f9qlacoqR9M3PSepLscVqHelgFpPPp190AxR2agu1sBpOGQBOG9aqJmEELfsgd0BmIgBmIgBmIgBmIgBmIgBmIgBmIgBmIgBmIgBnLugCTeHzo1P4VnCyE%2BAfH7kb4b8RMIu5C%2BGeEihLVqQNIvPhPp7tPQ0QZrqjwNjawCRFskPePhBqiXXi30IdwHdQVQG%2FCZtqwgeoqfFFwvRDkIAmE70iZL9axBi6Cj9D5lYVYQXYVcaAWxhOuld4mPIe0CKPyuxbTQ2KbcFuHqFbPQjR6CXvb8ykP4PBGQGtKPS76u3D5CBVfhXNxhgXDQgCUkT%2BzG%2FFPy92QFoUKFGgEdpFdt66ELkXeCnI9ZZBLUJ9bbXQGIi1nkS%2FSK7XewjIf4OfQ6dIfcALbscOTfQOtqrcoLomeY3gD5Dm8jvUOcieOvBatvLC0EBPHh0Dryo2PQxPzODhXUxELnQ3%2BifuFt0CU4%2FzAkabAMCtsP4dYR5CmcX1DZEAU6C3EaGg09RSDTqBV7kHr1b0JzaF7KKcRvqm6spXvs2dC3aRmeB8l%2FplG%2BLQjHQVGI3FVrAVnCFwj9hPNN7BTohE8T%2BWr1PqlmYin3Z1nc1UMsqmz0K059jJz0MQ9BE5rvDCaZeYe%2FkuCeQNo4BZEfxK0kiHaEgFATMb8gTe7DYo0tVLW%2B2CpTOP4uPtCHOz1Z%2FCU2XBmH8x5iHc3H6sS50S0BQj6wjwof%2B09JvZ8gx%2F6UP9cqIJ1S91%2BFakX8XzzDBllCWicBbA0QVJfNNA%2FrJgEgYdgBCIgs4eoQRQtZZBGNp45CS6BhUqUmQRsJ9BTAFWxrWKR%2FvcbfBrPkXpcZ1H1UncQSMi5rNYuIVUaiUBuDVfsZrBvxBdEZ2S0GArk2aCEK533mMNQD7YFWQ5O4NUPIMPaAzkAMxEAMxEAMxEAMxEAMxEAMxEAMxEAMxEAMxEAyKNdD7PEyv%2BTEEJtx4VyzW3E6%2F12PI5yQ87XCbxounCcqwp1b9T4kiCugjTlBXkts8aSAEtsNQsn03pwgUkgJ0%2Fu1SRhXkdi%2FJxvIkAVMVTWVV%2FlQXpAhN9zS1uG0HdDUyFILVVhE%2BwYXVtJTLdjH1EzU6kDSq80UUQs5Dt8eX6cO5yu2CGvIvRLJGgnLZgYJdxTTcvE8NBs13pdUA5La%2FzMJOHgpxGj1yweiW6wUgLZCoReglGOX30eiPTmDKaDEnHmGkbzZq5YGSW8orxeidGoCNOWvstXSe%2Bqmt9EMfER9LqNFlHOn%2BxPlS2yRxB7VlTh7%2FPdGDFLSuSOMfz4%2FiCi56pnedz1wfAapxNlpg%2Fm3ts0%2FgRSBg1c%2FRIGa2d6cLVKIOE9FrZZuoaLjJu0fERDHwNn7kZNqyB4N9dCeO8JEC9eb00eeCAqhhu8KRM7xdNrET932nLNMJ%2BCCT0Inw2ZWCswFjzUMsWrnrbwJae%2ByB3QGYiAGYiAGYiAGYiAGYiAGYiAGYiAGYiAGYiAG8j8EErzjkIWP1q6CnkF8YrAZlxbyQNsQX4nwnZXvCCP%2Fa78Z2k8PrA8inKsWSBJohPN8HnolsR9ajHhbVRa5wlsgsS%2BVX1XgbqhGr6F9%2FB7E%2B2KvH8Sal2cDQeFG4qLfg3oju4SFx5sRvxhpYxH6eJBHzaLrRdpqxEeWCoKLfBba33D2jz5%2BACEUbBuVyg%2FJNW4uE%2BR6FKAr9jpay%2B1COJ9mN8yHdun36no2EY47%2FbXKrVqPnlmZZjsumrLCIYRLoeGFXlnTp%2Flzh7jwgZ9tQ%2FrkXK3WcOg73nGpAD3QSmiU2mKQJtPIhJpRCH3eHrJsH7QM%2BYdn3%2F4JugbaL0sXXgZFpjI5tQMyfc9l%2FrNI%2FzfiV1fV%2FEJuPMLHoaViJb3TGCQg9WO2rP%2BsfMe4qnYWmwsdoKqxC5oPNVqY1Usg4Pz4DLVkBxDOyQMidxEXvQ8X7St8AXSr0460GQEQV7UZCNtjsx7kO7%2Frr1H2jvmX4GLPp6ZpEFgvwjUo%2FBhyeMTdmgLnFIBujp9D3iklgviBoetrZvdJOT4si0ze6eOULy3kkWHMyrKr1odxoRf1eEnvSAm9gmM%2F8%2FrjCF%2BRtKHmB7%2Fgr5HL2Wu44O24YFeDAm2RMdaNfrgBuLHQ0zhOTSHsRPw2qJa31Rqo9z9DyB1jHwq1TKaO%2F5DAHsD5i6BlUL16Svyn0JiqN3Z8NzQT2gl1In0eNBl6PrK56U5ATkX8WhlP7YCuRJ6Jle9QifAfCL8u6%2FmOga7zQA22nD0MXS95zwfYlxHurgIk%2FKfB3oH%2FhbjvI3wz9gcXhpE8a85aDTD7qgMRGGiKjLX0FCZRGgiScVp1VUvrKhTqjwogIfltMqd1tqMlf5Fm%2BTboUINOs%2F57pSX21eXhOlQ%2FlrRR8tukh3449UJr1PKfVYMU6rlVdBnQaVA7jtsBNEPy2ZNGAzEQAzEQAzEQAzEQAzEQAzEQAzEQAzEQAzEQAzlnQPTOexLWdZ2krY8tFiZpXdDolgGBAgj3fpk8dg2e9b6niPxNnOBWVQ%2BirXAWapMU9K%2By%2BdDqwQCOYTzkpa01y7Rfnwz%2BcP952VbwVV59gKGg9S1mEXeBvBTlO38QGoH4XZE1GlkfrQokhPD6igCE%2FrBctqDd02D%2ByR8QtlUBEi4xNR7hsfBOy93vQfxS6DOpFkzSKtnYMVwf60EotbrZSYTvFcttH7CC0j7kvbASiwjIBxG%2BSXc2tMgKeh33IcoX85WvVuUjbSjQc0GV4fh%2FoBHBbq%2B%2FqINofzmC9LFV%2BMhibQnHTrwksqXzFIRvKHAJoR%2FlBrlI5l%2BlZjfshGrhMp%2Bi%2ByKLI%2FEmd9Mygrh7uZ6HcegjwbRZhhmBtIMEE1axDbkmZ%2FoFVd%2Bg6d%2BhfhlaQQ8u3e1DLId4dQYQ7O6dcFjoNWhirEoVegfLFxE%2F0i93pJC4aGsOkF0DEMrZvxEMIpVFWmPmg0w8TnVqMv3vVpz%2FNeKQewbxM8IxidNcPaS8C3P1I%2B3aR9xChONxrlvSmp2vFa6cdgB6R67m1%2F%2BAOkWj2q1SpX5CaZEhi0j%2Fq4fXa7w1d4f4A9pq9gOIX05wup%2BISi0k9jccD8s9RLlYZlr%2FWMCe1AXWy3syaAR6fgVjLefDzyH0QHOia2JzmEgrBrSp0h9WAKhBfwkKpyzA1ik0YB%2FSrrDnWgZiIAZiIAZiIAZiIAZiIAZiIAby3%2FbOWKWBIIqiqARRhChaaKH4BVrYuHYWlnaKja1f4H%2BkFi3WyvyAnTExxNIfUIiFokGsRGGzEMG7cgM3%2BzbpMtNMcdnZcTPOmbdvHDLPNwEkgASQABJAAsgY5ChgIILuoKEnudrsHIVHbHa52RM5B2FKkbRo%2B01lAG2siu5FpoRxapFbk3pt9A6V6hv1bUC0Uc7UkYGouwZJrCWqIo52sQW2c21Noe6JzyeuQbTTFsgmR9KdqbWCbYpWvz3nICNyyRnIWIR6A8IQKD8gotEpDq31DAgGpUVruQZRB7di%2FQ%2Beucb1kiPeo1UOtS1u3b0T1AOI9Q%2B9nsdMqqcJwqAHDoCZ7fyAjD4IO87FaImqZVwfzesnQF58RJKtrtAPEtwvDcQDS5k6kGNqZ7XN2CcIYfbYkZpJpsd7gZuBfmUG8w8iUUBHvL9iHSVQFMtffH7RK0j%2F1dC8QbTQvYnVErGuTIiuGRznIPylkodxDkqgHrQO6WyVDzA44SDUfIPoEkU7e8HO3EAlsYyGy66i%2FMHPHudmQu8%2BQv3PXB0uXZoob0jqz0mU93F95SDUGQ%2Fv1yKyws37whb0JrPaM0NnP2V91oIWhljZvbNnEgidqZahs%2F%2FA%2F8G11wvKp1BJ2%2FI8%2FdozcmObYn0adZsA3mV6qgn%2BTNry7%2Bz9sPB5dWjxCVXO4S1I1g7bS1xbpMHXpcK%2FC%2BYVy9URwoLw8xVapOHaIhE6l9qQP3sqq10gqqpaTqEdH%2F8IE6GDTXTCfB0kkaTSYVvHchfPNzOI8AVdAAkgASSABJAAEkACSAAZq%2F4A0EvZstJINZUAAAAASUVORK5CYII%3D)}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab:hover:after{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAFeCAYAAADHfkwkAAAJFUlEQVR42uzdfWxVdx3H8dvbDkemsGYFgp0w5rSMbP6lY9EJ28IQMkUiWyDgH4YtcZuGzRjNTNxUZraUJ%2BMD8SmSkMx%2FDCMKbAVkAZnOWJiPIZIVLCZaKm3HgA1bSv36%2FuO75Jeb23NuH845v8Lnj1faXs5t%2Bs55%2BP3Or%2FfSkpldERSiEIUoRCEKUYhCAuufbQ3VYQFa8Vt0Y8B1%2B2MbfJs6RBdSxlp0wGrU4c8pxxIyB%2B2wUWrHnMJCPOJu9MDGqAcLcg%2FxiMUYgI2TAXwitxCPaMF52Di7gJbMQzyiPjgnstCO%2BjxC1sIy9lCmIX7t78ghpAN1WYYshOVkYZYhrTmGtGYZ8kqOIYezDOmGjdBBZyPUnVnIKAbAAyi5AyMdIBUS26Glk72GkA15Xn41IEY2RSlnPWl8KI9JY17T%2BCMZRhzNZRrvMXNxIaMbq7l53%2BouzeBWd2lRiw9Lx2nPXAgicg8JD7OjYzwn5sa2QHdiBAEnYlugC5WxABvxu8olU39so29Tjm3JdNQUohCFKEQhClGIQhSiEIUoRCEKUYhCFKIQl%2FVrUebjBCxjJzA%2Fy5CTMHThVEZOw3AyyxBDN%2BqyOrT813u9sKxDTmV9jvD4KYUoRCEKUYhCFKKQkYX05xDyVuYheVHI1RbyVo4h57IMeSLHkHUxLD50wobxz4m0inIpIWRwooQ8DUvx1EQIeaaGkG9qgU4hClGIQhSiEIUoRCEKUYhCFKIQhShEIQpRiEJmYiOOox992IeVKE%2BUkE%2FjHGwYL2Nq7CEPYBDmhtCJvoqY3aiLNaQyog2zgndbr6zYUytiDKmMeAGTwm38e6yGub2xhTxYEbEziKgMKQe%2FaO2LKeS%2BtD3hwu%2FzDxgGYgmZgjNBxA5ci5nDhfDxRgzBcDyWkC8FEb%2FxiJ%2FhItZV2b4Bu2Fuc9EhD2Am9sDcfDwJCzxWEfELmDuP5qJCwqvTNfgTzL0LN2E7zF1Ec5WIy1hW5IAYXmIbcQDmWlBy22DuG1hUEbGqsClKGOEW4lvB19uCkBaY24%2Fp4xLhxhKxbJhxYjb6YW47PuiHmbk%2Fo94jVhY2%2B%2FWT%2BnzCOPE4LPAk7gi%2BfhHTg4jCQjaFc6cgIvQFXMR23xv7Ye6L72xXdMjfg1msTwCrmu4R4dWpF41RhATnQGdCBKpeYj%2BFUiwhvTC8gfIwEfVVIlahFFPIPphblbYnwojYQlbC3DmsRT3emQDuSYiIKqQOv4YFLuIUhhIi4grxmKnYk%2FL%2Fyi2LfTko3DMrsA9nMYAObMGNWqBTiEIUohCFKEQhClGIQhSiEIUoRCEKUYhCFHIVhPADzMAL6IeNk37swsw8Q34Fy8iePEPezjBkMM8Qy5JCcg5px5zKq9ZEDLkLpSshZPIVERJGhI8rRCGjCkmfaylEIaaTXSEKUYhCigu5lGHIYJ4hL2YY0pb3S8pfCvbMeLiEvXivFugUohCFKEQhClGIQhSiEIUoRCEKUYhCFKIQhUzskCnYjENoriGgGYexCe%2BJ5d3Ta9AFc2dwX0LEYt%2FGXBdWo66o97Pf7nvAqriMp1AOAsp4GkOwKg7httxC%2FA3538EgLMU%2B3IBp%2FrmlGMQWTM0sxCM%2BGxxGtfqxsxHowposQ5ajD1aDY1iCklvij1kNerE860NrFl6BDaMHj6EBpQoN%2Fm89Cc8%2FjFm5nOz%2BA3274sQdwCZcj1KK633bAZgbwno0FHH5vRdd2IlbUBqhW%2Fy5%2F8Y9RY4jM7ArPJSSJBxquzC9kBAf9E4nnNxpKk%2F%2B01iU5zjSgOcSBrY2zEsImOfbWBVDeBYNWY8jN%2BH3NQ5sW9EUBDRha40D6auYnWXI5mBP1OIs1uFx%2F9xqNIRNWR9ad%2BI1WA3%2Bhbvwcf%2FcanAUd%2BY1jpTxaMoovx%2FT8CDW%2BOcvp4zmj6BcxOW3CT%2FFUJWBbTK%2BXzHnug7rq2z%2FEzQVfWP1PszHEfRiMWZVuyj4NnOw1Ldtxx1ojuEO8XV8DZPQhPvRm3IBWO7bXoMv43gMISeD94V8F%2F%2BDJfFttgZ7rTOGkNnYCRsVn6fFtIpyN%2F44goBjWBTrclAZj6Cn1vuVuELS7zfCaUvjRFyga0Gbm6eVRoUoRCEKUYhCFKIQhShEIQpRiEIUohCFKEQhV1%2FI%2Ff5xB2wYfWiMOeRWDOJevD%2FlbeKbYw7ZC8NfUY8tKe9fvznGkE%2FCAp9HI95IiNkRW8gkvA4LnMEUPAFL8LGYQr4Cq6LVIzsSQv6AuhhCZuA8rIoB3IzPwBKsiiFkW8oJ%2FQGUUl4H2Ylri3wF3YdTfq%2B%2BASX3EViCrxb1Cro6vAobxn8wBaXA8wnbv4lpRYSshiVYi1KF2fhvwnN%2BkFuIR1yX8vqrIwl%2FJ%2FG5hOddRkueIc%2FAEny0MiDhb1NX2p3XizPnpBweP0cpxaOwBPdkHZI2q30bzTW%2B3vc1vDmMg3mEHEsI%2BXrs9yNhyJKEQW0yHsYv3aFRWpHXyd5WJWQFZuACbAxO4915hdyKyzB3ECX8CDZGD%2Bc9IH4vuPZ%2FCLcFcaP1N9TnHXIDzuKHKOEl2BgtKWrS%2BDkPWjQOEXuLnsaX8ZcxRgzhdq1rKUQhClGIQhSiEIUoRCEKUYhC%2Ft%2Fevas0EEQBGB6VIIqQSCxMYbATLLSwSay0sLRTbGx9At8jtWihlU9gZ8yF2OkLKGihqIiVF9gEIse%2FmGIQ4oobN6c4xdcO%2FMXAmcPCWoiFWIiFWIiFaA2JDyijgTYkgTYaKA%2Fid7QldCB91EE57ZAzyB%2B94ybwBPFqaYdECUJKcIERXEMQpR0iCRS%2FX%2FbwyyELsZB4HzjBEVroQrAJF8jjUWvIPnJwgXlcQnpQF3II10MWV%2BpCghGlAEGEKbgfbEC88eBMFSFrEFThYozhE4KitpAtCI7hfuEVgry2kBUIzuFiZINh0WkLmUCELmZjQnYgqKoL8Q4gOEWmR8QMniHY1hpSCCbZJhbgvGGs4x6CGoZUhnhLeIB4t7jAC8RrYRJObYg3jT28QQJ32EUGTntIaBSLWMUchuAAPSERBDm4JPx5uUE9rOoQVJBNGJNFBYJ62iHlf1o%2BLA9qHdTs0zqoGUQkCFHCQizEQizEQizEQizEQnT6AqfQwgd5BnPGAAAAAElFTkSuQmCC)}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab.uploadcare-dialog-selected-tab:after{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAFeCAYAAADHfkwkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAADDJJREFUeNrtW21wVUcZJgnQYiuBCQUjISQtGmBK%2FKGWgJWPDqEwCEUpA94kMxrr2CLQatWpM7R%2B1LEFCp1anXJJRBmrP0roaEv5DISPto5A1XovIxIgqC2kBAoEKgkErs%2Feuyd3z549Hzfp2XNueZ%2BZZ%2FZk7%2B4573Ped9999wz06UMgEAgEAoHw0UZ8x7gccFJsx7jl4Ou4bkXbGU%2BxNZ7qW8HGsLFhFJALg2vBZlwnGGNCa1zHzddsbC2bGwoRMKwU3C8aG1cbbuoTBLK5pUF7YgrYpjLaTphKJNo2cFJQIqbz2E8b11hua7DkBUvo8bV0r%2B5wKoPR7U5Gu%2FXZeO4iu7cuT%2BSxuLYJkW7PZBha4nh27zwd3qiNuRtjEeVFmBGaGPsNHftEs0tatayJmEtIKdZOc8zPfQYPmGzzYEcBMacwtM9yk%2F0Ustz04HQoJNxScMwlMSja5X6uj3126VRe4DGX9OuU4Xi7108hrZns4Ly%2FCW1TzCn8mGeFF8HbVj%2BFdMYdUq3CI43C3Ma4e%2F0l9nX6uUY64x42N6E1C5F2fpeU7KuQ1rjHhS38rQytuFsmayxv9VPIvpjLZua00DPc6ff6KWSFU2zHHPYJL7WX1Lfc1w0x5lJi9NRjit993BAby3N4%2BeAlY3nZve3mNvt%2BcmQFXTwD41VnlJhDwRnTUTQaZTwedCDmJsCahezXiLlCPqiljOdeGc0OQfEMRcRcFn8sdbAarfuoO5NtWm7VrtdShm%2B2M4M6t88UPeN1n1Ds8MwTwYgQwyyWiuuefD0x1sToPmEADMrlH9uOWgxVHHX59VF%2BbA7HBzppn8nln0NXwsA3eG3G1hEju34D7Ur%2BWTV8AggEAoFAIBAIBAKBQCAQCIQwY9bsuePBo2DCZ7JnjPdTyDH%2BoJPgCZ94ij%2FjmJ9C2ANawRwfn5EDnmHP8lvICQ0hfIKEkBASQkJICAkhISQkMyEdGoRc0iFEG0nIjSTkkkYhF%2FwU8ohGIUvDcLZvcTDw39n0keKKg5Cr2SLiCQ9h83g2CHnSg5Af08c1AoFAIBAIBAKBQCAQCAQCgXCDY%2BasOYXgSvAw2AGeBbeBC8DcbBFxH3gBTNhwJ5gfdhH3g1cFo6%2BBLdwjophXwZxsEbEFLOa%2F5fKwEj01LxtEbAT7K8ZFhDFbwyZiviTiZZUIwTOX%2BLizYRJR6cUT0pzjfGxnWEQMBE8LIhrAm1nqdZhTxBMAG384LEK%2BI4jYw0X8GvwfuFQxvi%2FPVsacVWFY2GzD2yQYNR58TEqxiyQRLwm%2FtYPDw5Cd%2BoF%2FEwy7CSwB1wt9zDPDFSK6wDlhSbGDwUbBuDJh3Dqh%2F0fgNEnEwjDtE5PBnwh%2FrxPGlgn928GhYRExR7VPgCN5QWj0s7D6NA8zo%2B%2FvYB4XsSDoKrbdbp%2FA9cPSAmcL%2Fi7h79e4RxYEnaGekWonVdnxbb6w13NvbBfmLA7LXvFPoYotdhg3lIsQs9MZlhTCIsRYAy0u41QpdnaYaqkz3LD37U52NiIW9gkT%2BPHUMHBhVorghi4QjGSHolqWToUCcJMk4qthPfXlgDukFMsy1Amhig23CEFMvvTmZV4E52bLlxHmmXl8zZxjhyKwGVzNQow%2BgBEIBAKBQCAQCAQCgUAgEAiEGwATItFhE6qiGysiazrQJtAmWIv%2BdGtci4yYf5PmdaB9BW2hTiF%2FMhlnGBVxECGxW4RV7CadQj5gxlZEFF6IyAan%2BgyhFRHFCxDGgfr%2B477JA3IoRWzedsR8bRojvQCdHrF6IKI2WNVWKMaILyYwIab1ofKA4AWI2I%2FrUrt7sjHahFhCR5WFIlF16ESid7u9HI1Cou4ZKmLbNyBEQtZIGUkSFonahpqtZ4Nc7GlB6lCzpGjJSHmcsdb0CrHbtW3CyxBrTePWOcHsI%2FZrIaM3bBd%2BeoRURd3TblUGQqoCEGLeH6ylSqYbnPhCtK6RCrsyQ94ozXVUwrXU0e6RiLosqbArHFVZS3WfQLKWU31VpQ43uwUenBBl4edea7lWCEEJqYhEXUt2OyPtarJAShT5mKs8KToIUZ1dtKdfi9ERm4OVQ9ZS1WU6Q%2BuKZW2o6iaFobaLPT1G61H3NVXaVKZghzWiqn7Rt0WnRwrx0M3gFfmEqPSEate3fFVJ3msr%2BEn64EYgEAgEAoFAIBAIBAKBQCAQshnL4gPBVeBucLiH8cPBveAz4MfDICAHrAJPggnO02Clw5zpfIwxns2NJO8VkIhx3AMJBbvAx8FcYXwu%2BAR4zWYOu9edOgXkg8%2BCV20MErkNLABv49du49k9Vyef4bOIaimMvDDKmcmck8mQ9VHIXPCsR2MOgTOEuTN4n5e5Z5LP8tkrxeA%2BByPawEVgX8Xcvvy3Nof5e5PP0LROmEE%2FkxZuJ0%2BngzzMH8THdgrz2b1%2BqnwBGgTdw%2BP5ZXBUD%2BaP4nPfBacGuY8MA1%2BxDSVvnl3E7zE0KBGV4Cnbxe0%2BX1787F7TdApgb%2FEph41tCzjWYf5YPkY1l93z5%2F6vk2XxEvDPHje2X4FDhLlDeJ%2BXjfRNcKSfQlY5eELFc%2BBS8GF%2B7XXetWRW89krFeBbHg16B7wb%2FCK%2F9jLnYPIZmtYJKwAfctnlt%2FMaaz6vkNn1Tpfd%2FEFToalx4bO4r5PCzdjYBoDPSzXXLfw3efxa03oKKA2PAMeDB%2Fhbnc7LGFVSYGNKwZl87H7wLk%2BHMQ1CjoA%2FBPtzD83iRjolgLl8bD%2FwUfBwGIQc4wayt%2FsceN3Dgr7OU7HhtZYwCBnJ66VED9mzOs1HQVPAv2Yg4JDekiTztPygy3mjrcdFZgCCVOcNo2wZ3CfrsCxexgtE50KSQCAQCAQCgUAgEAgEAoFAIBA%2Bmiiqq5nF2vZdpQ1gIskm1pYI16VnwcFhFjGmqL7mauHzC%2B9p2Vx2B4y9kjS8SRBkXO8qXRVmIVshJFFUV%2F2PiU%2FfmwdjV0vGi15hIm8PoYjqLzERxSkhCVx%2F68WN4wfD4PdthLBwawiXiPqa%2FvDGkaSAlAjWni6JRgYebyx7xCSkSRZT%2BoUwCfk%2BhCSSrOdMXS%2F%2F8vr7%2BsPoZotX0mL%2BAuaEYV0MA9uLjJAyeaWmE%2B3tb28b%2BxVlaKVDbGEYvLEu7YXqpCeEdXIF%2FBRPx%2FscvNIC3hykiM%2BB14vrLSFliFphjIWhn7cudhN%2FEJSIHAh40%2FBCt4j0OnkP1wPFOTD2RQch58Hbgki3kZThqTVRLApJ9dfKcy7sKh0JYy9bQist7Je6F%2Fgt4DvmkKpOCMIOFEWrlP9cCcY%2B1V2uWNkFlukU8qSwX5jXRqpvot3c8zvvGAhjTzvsK6%2FqCqlSGHu5W4DVK793uweMfchBCONUHUIa0gtb8kZdzQdFa6td%2F%2B1V69ZRfWHsW3yBn4eI89J1kw4hh8QwKjan3WXZc96or5lh2jPSbCl5rnbA9CUND0xfvOGPKTbsxt9WLt6wuxJk10bbfZ3iPF1itpj3juTamDfpe78bBmMuwqgEjEmYWpGsT%2B5P%2F30KvFXXgh8Dw7uEDTAZ0zBgjcVok7GcS4TWKuYB3RviL3iIdY144evllUteuhPGdXW%2FbdEjSZpFVIoeSf8WQ5unW0gBRJxD%2B0LSG4sbNivCxCxA9o51%2FIxgFn5dzdfGPP1YAd7utPTbFjwgi5H7zUK2BprFKpdsyIURbyvjvju8zCIrrQngGjiOvkERCAQCgUAgEAgEAoFAIBAIhCzFlO%2FWTwB3gx1gohfs4PeZEISICrCzlwJkdmoXgwfu7IXBF8FjAk8Jv%2B3SLeRyL4RUSPfKA4%2Fw3y7rFtKbECpW3G%2Bf8TsJISHuvARuAn%2FLDe3i%2FfOlexWAJ8MqZC04SJozFjzoNjdMQn7jMC8f%2FFfohAh%2FFxrpExziMvd%2BwfCP2d0zKCGVvK%2FRw9wB4DV54YdFyALe9weP8y%2Fw8QVhEzKF973uYW6%2BUSw63TMoIbfy9cFSbInL3G%2BqwjAUQnhfHe%2FfAfazmTcCfI%2BPqw6rkEKhkt0Dlgu%2F5YKzwf8aVS6YE0ohvP%2Bz4LtCej0OHgDbhD62yw%2F2es9AhPDfPgGuAdulze4%2F4KMOYRcuIcKYm8DPgFPBMjmUwiLEOFgN%2BpDuNyiog1UTf%2FBqti%2F08l75%2FD7sfk26hUzw6ePDxKA%2BB%2B35kD4H7QlEBIFAIBAIBALhxsL%2FAWFBQYLmSYGkAAAAAElFTkSuQmCC)}.uploadcare-widget-buttons>li.uploadcare-widget-buttons-dialog,.uploadcare-widget-buttons>li.uploadcare-widget-buttons-file,.uploadcare-widget-buttons>li.uploadcare-widget-buttons-url{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAB4CAYAAACaTFAUAAADn0lEQVR42u3bS2wNURjA8aLaEBp0IV5NPGJBkJBSEl1UtB5hQW0JXSIsxGMjFsRjQ9AHQtJiwUpUaVJExELi3US5JZ7FlajiJlQfPv%2FcfKQ5uVNuO2em9Cx%2BSe%2FMSe8%2FM3PnnGluU0SkR3FBLsgF7T9YXAn5S5VBBEkyY12QC3JB%2F0VQEiwFaUh3BBb0p3HJnjpbU4ap0s32LsgFuSAXpGzOZR0lNVb5GOT9RoOwGgdQih1Yin5BB6XjKFo0ZB4mYhrq0IhNQQVlIYKtxhumYYz%2BnAnBBfSxGZSOJ5AObxRFGcTDGZtBR7AX54yjUwnBZ4%2Bo%2Bb4H6QXcgiVGzEYIvkJwS8d9h6gHNoJWQ7DNCPqAcszFJFyDIAbpYKjfQbtRaMRkQTqI4DEELca%2BqX4HlWCCEVQD6URfiMq3cYSyjaAjEA95OmYsBDP8DloMQaYRFX9txLw1xrRjgN9BqfgIQUoCZyCqAinqOKps3Yc2QzyiaiGoR7VxdEbanDou41mCoHREjG2C7bbnsn44C8EIM0xtQzu2BLn8KMRdiGqGoBVVGBX4ekhlIhcLMB0DPMa5NbULckEuqLuT6xp8gSQphiILQRrTNZ9675%2BFTdU1V6XhXVTeRN8Lwg968bpBY3pGkBnigswQkwty15AL%2BqeDvnQjKGYjqAhNkCQ1ocitGF2QC3JB7rnMPZclqXcGmevnp89fyPmqS%2BEG1T6skyvXrsvNW7flZcMbYVu4QcT8fv2o%2Fkl8W3HZsZCC9DRpSBxHSveHGMRpi%2BN1%2FLQdO1HeM04ZP8e3VddcCf%2BiRvxosU0%2FaSEFmbiG3I2xS8KeXN1zmVsxuiAX1LuCuK9kIKeT%2FbOQEdR%2FTy3Ca7RibYL969GGV1ho80ExEychhhKkoj9KIYYKDPMtSGNWIArxcAqnIR6iKPQlSL%2BvuAVtEEM7ijFEleg2MbRhM%2Fr4ecoK0AhRd5CdYNxM3IOoRuRbuaj5xeNxAxuQ2um3sRijY8fpditBk1GL7UjrZFyajnmASbY%2BZcsRg6jHyEswbh4iEBXDMr8%2FZbvwA2L4gQoMVychHuN2%2BhlUgJcQD%2BUaJh6eo8DvUzYYxQmO1B7dl4F9CW4LhzHY5tSRi3o0YyVG4y7uIwurdF8Ec4OYywowEFOQg3cQ9R5zMEXH5AcRVIJqrMU3iKEZ63ARpUEtP5ajAeLhLVYEukDTi%2FgQ2hPNbaGtGHUxdh%2B1mN0jlrC%2F1kNuTR2En2aqi4BnOyDfAAAAAElFTkSuQmCC)}.uploadcare-crop-widget .jcrop-vline,.uploadcare-crop-widget .jcrop-hline{background-image:url(data:image/gif;base64,R0lGODlhCAAIAJEAAKqqqv%2F%2F%2FwAAAAAAACH%2FC05FVFNDQVBFMi4wAwEAAAAh%2BQQJCgAAACwAAAAACAAIAAACDZQFCadrzVRMB9FZ5SwAIfkECQoAAAAsAAAAAAgACAAAAg%2BELqCYaudeW9ChyOyltQAAIfkECQoAAAAsAAAAAAgACAAAAg8EhGKXm%2BrQYtC0WGl9oAAAIfkECQoAAAAsAAAAAAgACAAAAg%2BEhWKQernaYmjCWLF7qAAAIfkECQoAAAAsAAAAAAgACAAAAg2EISmna81UTAfRWeUsACH5BAkKAAAALAAAAAAIAAgAAAIPFA6imGrnXlvQocjspbUAACH5BAkKAAAALAAAAAAIAAgAAAIPlIBgl5vq0GLQtFhpfaIAACH5BAUKAAAALAAAAAAIAAgAAAIPlIFgknq52mJowlixe6gAADs%3D)}.uploadcare-dialog-file-sources:before{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAbCAYAAADlJ3ZtAAACD0lEQVR42s3XTUiUQRjA8d58fW2thSgWlA5WHirLlpXCUgr6QpDsll4CPYgkBEGCoQft4qVDN%2B1iiJfoGEKECFG2Bwmqm7AStZGYXrYiDbcPn%2F7GcxhGaBFhZw6%2FnWFmX%2FjvMsyy20Tkn%2FfZj3txFJGubcCeU%2BsvJTiDz8hhABcRIvItthT3IIZZTOEGar2J1Ygx5K3gNR3fYghNiFDi8psNMGzE%2FdHR9gHPcBkxl8dgEKK%2BYwiTEPyEqN8aXeUy9hpEfUMc1WjEQ8xA1BT2uTyzLfgCUed0fbuONejBXTQgdB2bhWj0VeMGCI153IfboAkLEHxCs2gozqIfR3y5upL4CsEKLiFAAi8hmEYdQtexCcxD1HWNTSEDUU9R7zp2D14Z92yf8SHuYwWCX5jGaZexMXTjDSZwUtcDHMQoxAiew3knsRpWjhM4gMhYD1CBRxBDFu3YVfRYM07n9vp%2BjFs%2Fx7NocRBbmAbfwQ8I8ujyNXZdArexgEXr7JYiQOhDrKkDbSg31uoxgps45lOsbSceYFW9Ri%2BSul%2FmU2wKLyAmjX6MTjRitw%2BxcVxB2riPxZq%2FwxiOu41VGtKBSWQgsN2yngmRxCFUYEdRYlUZIlzAAJ5jGfOYQcp6%2FwTEsopFZJBG29ZjCwtQhVq04hTsP505SAG5IsRCo%2F%2Bz14o05rCEPMTyZLOxxRRDJQ4jifAvfDnGzbMQpskAAAAASUVORK5CYII%3D)}.uploadcare-crop-widget--loading .uploadcare-crop-widget__image-wrap{background-image:url(data:image/gif;base64,R0lGODlhGQAZAPQAAOzq7Ozu7OTm5Ly6vKSmpLS2tNTS1MzKzKyqrOTi5MTCxLSytNTW1Nze3PT29Ly%2BvKyurPz%2B%2FPz6%2FMzOzMTGxNza3PTy9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH%2FC05FVFNDQVBFMi4wAwEAAAAh%2BQQFCQAAACwAAAAAGQAZAEAFhCAgjqIkRRKgFEfjkOMZwXQNRKhs7yKe1ibULcdzpEw8QKIBkLySUBjSmKQ6aQ6c9powPAjgQUDqi5bKZTNJllafZ7JfNCsk0bcvE7tu26cGYAgIFU9AWjYBBwgETDBtUHQjj1E6Om5nJ0iXAHQnhW56lpc6k1CipTuiMahvnzR%2BQ1s0IQAh%2BQQFCQAAACwUAAQABQAIAAAFHaBTBQDAEIMDJARRlQexqAFCNOVDHKVBFKXEQBECACH5BAUJAAAALBQADQAFAAgAAAUcIAAIyiEaRCE%2BhBkgRAIcxOIIsAGggwM4hoAoBAAh%2BQQFCQAAACwNAAEACAAYAAAFJyAgAtBonmiqrmzrvnAsz6KQmMFBEIlgKDtEITAIQhgOwKNwaCRFIQAh%2BQQFCQABACwEAAEAFQAYAAAFTWAgjmRplWiqruNJIGwsr8Zs3y2u73zv25Te4Ic7BRo9oy1BCDCIDMGOgSBMlChYCVCoIhQGqXNEGABMBghhHURhSZbGoXAQDSiVtygEACH5BAUJAAMALAAADQAYAAwAAAVBIKUIQ2meaFoQTOq%2BFPK8dKkQDYFYtRuUFghh0qsxEARA8YQwWQqIxhLFGwCklSlNp30RXo9mz1EjLAzkbunwCgEAIfkEBQkADwAsAAAEABcACAAABS3g8wCJaJ5o6hRIk74iYzIEIsAwQjgLceDARi0AxB0IiiJsUCAYlDDF4AZNhQAAIfkECQkAEQAsAQAAABgACgAABT5gJI5OcxTTqK6rwywEgVBsPQZDjDyGoCK2kUF2ANQCQZHDkEhGBJUaoekMIgjVFVYEySaBXpUF23yEVQpRCAAh%2BQQJCQAXACwBAAAAGAAKAAAFXOAljk5zFNMVRZI0vrDDLASBUJe0ri48BoMa4mEQ5HS7iMN3MdgOAGaLBwMkHIYE89VyVAIiR4Gg3foYhMGSgSAYzbBErXKBEA5w5oGwsCAQYHkwFjVyD4JMCnchACH5BAkJAAoALAEAAAAYABUAAAVloCKOTnMUkxJFkjS%2BsMMsBIFQirSuLjwGgxriYRDkdLuIw6cw2A4AZosHAyQchgTz1VI4eo4CQbv1OVYiBoJgLMOQLgjh4GbuFAhEoG5nER58UiyBW0iEgj2HiouMjY6PkJGSjSEAIfkECQkAFwAsAQAAABgAGQAABZLgJY5OcxTTFUWSNL6wwywEgVCXtK4uPAaDGuJhEOR0u4jDdzHYDgBmiwcDJByGBPPVujh6jgJBu%2FU5ViIGgmAsw5AuCOHgZu4uCESgbmcRHnxSfgaBPkgDbYUjOj2KTAqJji0SBAyOiytDlyI8NhabPHIpkmhqBFGFZywXFgUIDYpIIwCwFZFMAloSS5u9vr%2B9IQAh%2BQQJCQAXACwBAAAAGAAZAAAFq%2BAljk5zFNMVRZI0vrDDLASBUJe0ri48BoMa4mEQ5HS7iMN3MdgOAGaLBwMkHIYE89W6OHqOAkG79TlWIgaCYCzDkC4I4eBm7i4IRKBuZxEefFJ%2BBoE%2BSANthSM6PYpMComOLRIEDI6LK0OXIjw2Fps8cimSaGoEUYVnLBcWBQgNikgjALAVkVJLEksvDDYTn4KrPgBiNgpFR0nCZgZyNTjKjWUWJgV0PNIvIQAh%2BQQJCQAVACwAAAAAGQAZAAAFpGAljpXTHMVURZEkkTDpMAtBIFQlsewbj4GBDfEwCHQ7XsTxqxhuB8DP1YsBEg5DojlylXylAmHLhTlYIwaCcCyTkj4I4eCO8UQIRKBub1UID3wxOy8EBoIwSRUDbYgihI5lCo2OLoUMkY9oRJkrfjcWmVVyKpVoFWoEUoJnfhUWBQgNiIojALMSTGW5OrpvVU1wTa08vJZKYFPInsWCVC89ySQhACH5BAkJABUALAAAAAAZABkAAAWeYCWOldMcxVRFkSSRMOkwC0EgVCWx7BuPgYEN8TAIdDtexPGrGG4HwM%2FViwESDkOiOXKVfKUCYcuFOVgjBoJwLJOSLweEcHDHeJUGAhGw31sHBA9%2BMTsSYgaEMEkKA22KIoaQXDtMk0hwlzo9aJdwnZNVVZBJkaN%2BZy0jp3alXXFgTQ4vEpZvrIsstmZKLUwuSbi5PC%2B9sWVUxS3HIyEAIfkECQkAAAAsAAAAABkAGQAABYggII6A0xzFBESRJJEw6TALQSAUILHsG4%2BBgQ3xMAh0O17E8QMYbofAz9WLOSQOY3PkKvlE1S3MweKGxSNyC7xGw5K6sjvWg8%2FfrfNdlGx99yVygFNLg3xUbYNJdoo9goBVenN2i3tqX5JijEheaFc6THiJMUmhVkotTC59o6RKL6h%2Fmjuwfk0hACH5BAUJAAAALAAAAAAZABkAAAV2ICCOoiRFEhChKemS54qq8vyOTo06gKnzt1jk1ou1SI6UiThaJkmrIxO3akanrpztinXFetXuK%2FoVe1Fcs5WsRobbwQgQbjLCS9F326hXX9NmZXZmWkeAWGUlKU9TTxJza1JnckRaMo9FQjZEmik6kkw%2BnixEIQA7)}.uploadcare-dialog{font-family:"Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(169,171,172,0.8);z-index:10000;overflow:auto}.uploadcare-dialog *{margin:0;padding:0}.uploadcare-dialog-inner-wrap1{display:table;width:100%;height:100%}.uploadcare-dialog-inner-wrap2{display:table-cell;vertical-align:middle}.uploadcare-dialog-close{position:absolute;top:0;left:0;width:100%;min-width:988px}.uploadcare-dialog-close>div{margin:0;padding:0;border:none;background:none;width:33px;height:33px;line-height:33px;font-size:33px;font-weight:bold;color:#747677;cursor:pointer;position:absolute;right:0;top:0}.uploadcare-dialog-panel-wrap{margin:0 auto;width:900px;padding:0 44px}.uploadcare-dialog-panel{width:900px;height:616px;overflow:hidden;border-radius:8px;background:#fff;-ms-box-shadow:0 1px 2px rgba(0,0,0,0.35);-moz-box-shadow:0 1px 2px rgba(0,0,0,0.35);-webkit-box-shadow:0 1px 2px rgba(0,0,0,0.35);-o-box-shadow:0 1px 2px rgba(0,0,0,0.35);box-shadow:0 1px 2px rgba(0,0,0,0.35);font-weight:normal}.uploadcare-dialog-panel a{text-decoration:none;border-bottom:1px dotted}.uploadcare-dialog-panel a:link,.uploadcare-dialog-panel a:visited{color:#1a85ad;border-bottom-color:#1a85ad}.uploadcare-dialog-panel a:hover,.uploadcare-dialog-panel a:active{color:#252525;border-bottom-color:#252525}.uploadcare-dialog-body .uploadcare-dialog-tabs{-ms-box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;-o-box-sizing:border-box;box-sizing:border-box;width:75px;height:616px;float:left;list-style:none;list-style-type:none;margin:0;padding:0;background:#dee0e1;border-top:1px solid #c5cace;border-bottom-left-radius:8px;border-top-left-radius:8px;overflow:hidden;position:relative}.uploadcare-dialog-body .uploadcare-dialog-tabs:before{content:\'\';display:block;position:absolute;top:0;right:0;bottom:0;width:0;border-left:1px solid #c5cace}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab{-ms-box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;-o-box-sizing:border-box;box-sizing:border-box;width:75px;height:66px;border-bottom:1px solid #c5cace;border-right:1px solid #c5cace;cursor:pointer;position:relative}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab:after{content:\'\';display:block;position:absolute;width:50px;height:50px;top:50%;left:50%;margin-top:-25px;margin-left:-25px}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab:hover{background-color:#ebeced}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab.uploadcare-dialog-selected-tab{margin-right:-1px;border-right:1px solid #efefef}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab.uploadcare-dialog-selected-tab,.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab.uploadcare-dialog-selected-tab:hover{background-color:#efefef}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab.uploadcare-dialog-tab-file:after{background-position:0 -50px}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab.uploadcare-dialog-tab-url:after{background-position:0 -100px}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab.uploadcare-dialog-tab-facebook:after{background-position:0 -150px}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab.uploadcare-dialog-tab-dropbox:after{background-position:0 -200px}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab.uploadcare-dialog-tab-gdrive:after{background-position:0 -250px}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab.uploadcare-dialog-tab-instagram:after{background-position:0 -300px}.uploadcare-dialog-body .uploadcare-dialog-tabs .uploadcare-dialog-tab.uploadcare-dialog-first-tab{border-top-left-radius:8px}.uploadcare-dialog-body .uploadcare-dialog-tabs-panel{position:relative;-ms-box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;-o-box-sizing:border-box;box-sizing:border-box;margin-left:75px;padding:22px 25px;width:825px;height:616px;line-height:22px;background:#efefef;border-top:1px solid #c5cace;border-bottom-right-radius:8px;border-top-right-radius:8px;font-size:16px;color:black}.uploadcare-dialog-body .uploadcare-dialog-tabs-panel input{-ms-box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;-o-box-sizing:border-box;box-sizing:border-box;width:100%;height:44px;margin-bottom:22px;padding:11px 12.5px;font-family:inherit;font-size:16px;border:1px solid #c5cace;background:white;color:black}.uploadcare-dialog-body .uploadcare-dialog-tabs-panel .uploadcare-dialog-drop-file{background:white;border:1px dashed #c5cace;border-radius:3px;height:99px;padding-top:77px;text-align:center;color:#545454}.uploadcare-dialog-body .uploadcare-dialog-tabs-panel-facebook,.uploadcare-dialog-body .uploadcare-dialog-tabs-panel-dropbox,.uploadcare-dialog-body .uploadcare-dialog-tabs-panel-gdrive,.uploadcare-dialog-body .uploadcare-dialog-tabs-panel-instagram{padding:0}.uploadcare-dialog-body .uploadcare-dialog-tabs-panel-facebook iframe,.uploadcare-dialog-body .uploadcare-dialog-tabs-panel-dropbox iframe,.uploadcare-dialog-body .uploadcare-dialog-tabs-panel-gdrive iframe,.uploadcare-dialog-body .uploadcare-dialog-tabs-panel-instagram iframe{border-bottom-right-radius:8px;border-top-right-radius:8px}.uploadcare-dialog-footer{font-size:13px;text-align:center;color:#7c7c7c;margin-top:15px}.uploadcare-dialog-footer a{color:black;text-decoration:none}.uploadcare-dialog-footer a:hover{text-decoration:underline}.uploadcare-dialog-title{font-size:25px;line-height:1;font-weight:bolder;margin-bottom:25px}.uploadcare-dialog-title2{font-size:20px;line-height:1;padding-bottom:11px}.uploadcare-dialog-label{font-size:15px;line-height:25px;font-weight:bolder;margin-bottom:12.5px}.uploadcare-dialog-section{margin-bottom:22px}.uploadcare-dialog-normal-text{font-size:13px;color:#545454}.uploadcare-dialog-button,.uploadcare-dialog-button-success{display:inline-block;font-size:13px;line-height:31px;padding:0 22px;margin-right:.5em;border:solid 1px #dcdcdc;border-radius:2px;color:#444;cursor:pointer}.uploadcare-dialog-button,.uploadcare-dialog-button[disabled]:active,.uploadcare-dialog-button.uploadcare-disabled-el:active,.uploadcare-dialog-button-success,.uploadcare-dialog-button-success[disabled]:active,.uploadcare-dialog-button-success.uploadcare-disabled-el:active{background:#f3f3f3;background:-webkit-linear-gradient(whitesmoke,#f1f1f1);background:-moz-linear-gradient(whitesmoke,#f1f1f1);background:-o-linear-gradient(whitesmoke,#f1f1f1);background:linear-gradient(whitesmoke,#f1f1f1)}.uploadcare-dialog-button:active,.uploadcare-dialog-button-success:active{background:#f3f3f3;background:-webkit-linear-gradient(#f1f1f1,whitesmoke);background:-moz-linear-gradient(#f1f1f1,whitesmoke);background:-o-linear-gradient(#f1f1f1,whitesmoke);background:linear-gradient(#f1f1f1,whitesmoke)}.uploadcare-dialog-button[disabled],.uploadcare-dialog-button.uploadcare-disabled-el,.uploadcare-dialog-button-success[disabled],.uploadcare-dialog-button-success.uploadcare-disabled-el{cursor:default;opacity:.6}.uploadcare-dialog-button-success{color:white;border-color:#2a7ce5}.uploadcare-dialog-button-success,.uploadcare-dialog-button-success[disabled]:active,.uploadcare-dialog-button-success.uploadcare-disabled-el:active{background:#458dee;background:-webkit-linear-gradient(#4892f6,#4289e6);background:-moz-linear-gradient(#4892f6,#4289e6);background:-o-linear-gradient(#4892f6,#4289e6);background:linear-gradient(#4892f6,#4289e6)}.uploadcare-dialog-button-success:active{background:#458dee;background:-webkit-linear-gradient(#4289e6,#4892f6);background:-moz-linear-gradient(#4289e6,#4892f6);background:-o-linear-gradient(#4289e6,#4892f6);background:linear-gradient(#4289e6,#4892f6)}.uploadcare-dialog-big-button{border-radius:100px;font-size:20px;color:white;line-height:66px;border:solid 1px #276fcb;text-shadow:0 -1px #2a7ce5;display:inline-block;padding:0 2em;-ms-box-shadow:inset 0 -3px #266fcb;-moz-box-shadow:inset 0 -3px #266fcb;-webkit-box-shadow:inset 0 -3px #266fcb;-o-box-shadow:inset 0 -3px #266fcb;box-shadow:inset 0 -3px #266fcb;background:#458dee;background:-webkit-linear-gradient(#4892f6,#4289e6);background:-moz-linear-gradient(#4892f6,#4289e6);background:-o-linear-gradient(#4892f6,#4289e6);background:linear-gradient(#4892f6,#4289e6)}.uploadcare-dialog-preview-image-wrap1{width:100%;height:452px;margin-bottom:25px;display:table}.uploadcare-dialog-preview-image-wrap2{display:table-cell;vertical-align:middle;text-align:center}.uploadcare-dialog-preview-image-wrap2 img{max-width:100%;max-height:452px;display:block;margin:0 auto}.uploadcare-dialog-preview-footer{background:#fff3be;border-top:1px solid #efe2a9;height:33px;padding:16px 30px;margin:0 -25px -22px;border-bottom-right-radius:8px}.uploadcare-dialog-preview-footer .uploadcare-dialog-button-success{float:right;margin-right:0}.uploadcare-dialog-preview-footer .uploadcare-dialog-button{float:left}.uploadcare-dialog-preview-center{text-align:center;padding-top:176px}.uploadcare-dialog-preview-circle{width:66px;height:66px;display:inline-block;margin-bottom:22px}.uploadcare-dialog-file-drop-area{width:100%;height:100%;-ms-box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;-o-box-sizing:border-box;box-sizing:border-box;background:#f8f8f8;border:dashed 3px #c5cacd;text-align:center;border-radius:3px;padding-top:77px}.uploadcare-dialog-file-drop-area .uploadcare-dialog-big-button{margin-bottom:44px}.uploadcare-dialog-file-title{font-size:40px;line-height:1;color:#dee0e1;font-weight:bold;margin-bottom:44px;text-shadow:0 1px white}.uploadcare-dialog-file-or{font-size:13px;color:#8f9498;margin-bottom:44px}.uploadcare-dialog-file-sources{position:relative;display:inline-block}.uploadcare-dialog-file-sources:before{content:\'\';display:block;position:absolute;width:43px;height:27px;top:-12px;left:-65px}.uploadcare-dialog-file-source{display:inline;font-size:15px;margin-right:.2em;cursor:pointer}.uploadcare-dialog-file-source:after{content:\'\\00B7\';color:#b7babc;margin-left:.5em}.uploadcare-dialog-file-source:last-child:after{display:none}.uploadcare-crop-widget .jcrop-holder{direction:ltr;text-align:left}.uploadcare-crop-widget .jcrop-vline,.uploadcare-crop-widget .jcrop-hline{background-color:white;background-position:top left;background-repeat:repeat;font-size:0;position:absolute}.uploadcare-crop-widget .jcrop-vline{height:100%;width:1px!important}.uploadcare-crop-widget .jcrop-hline{height:1px!important;width:100%}.uploadcare-crop-widget .jcrop-vline.right{right:0}.uploadcare-crop-widget .jcrop-hline.bottom{bottom:0}.uploadcare-crop-widget .jcrop-handle{background-color:#333;border:1px #eee solid;font-size:1px}.uploadcare-crop-widget .jcrop-tracker{height:100%;width:100%;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none}.uploadcare-crop-widget .jcrop-handle.ord-n{left:50%;margin-left:-4px;margin-top:-4px;top:0}.uploadcare-crop-widget .jcrop-handle.ord-s{bottom:0;left:50%;margin-bottom:-4px;margin-left:-4px}.uploadcare-crop-widget .jcrop-handle.ord-e{margin-right:-4px;margin-top:-4px;right:0;top:50%}.uploadcare-crop-widget .jcrop-handle.ord-w{left:0;margin-left:-4px;margin-top:-4px;top:50%}.uploadcare-crop-widget .jcrop-handle.ord-nw{left:0;margin-left:-4px;margin-top:-4px;top:0}.uploadcare-crop-widget .jcrop-handle.ord-ne{margin-right:-4px;margin-top:-4px;right:0;top:0}.uploadcare-crop-widget .jcrop-handle.ord-se{bottom:0;margin-bottom:-4px;margin-right:-4px;right:0}.uploadcare-crop-widget .jcrop-handle.ord-sw{bottom:0;left:0;margin-bottom:-4px;margin-left:-4px}.uploadcare-crop-widget .jcrop-dragbar.ord-n,.uploadcare-crop-widget .jcrop-dragbar.ord-s{height:7px;width:100%}.uploadcare-crop-widget .jcrop-dragbar.ord-e,.uploadcare-crop-widget .jcrop-dragbar.ord-w{height:100%;width:7px}.uploadcare-crop-widget .jcrop-dragbar.ord-n{margin-top:-4px}.uploadcare-crop-widget .jcrop-dragbar.ord-s{bottom:0;margin-bottom:-4px}.uploadcare-crop-widget .jcrop-dragbar.ord-e{margin-right:-4px;right:0}.uploadcare-crop-widget .jcrop-dragbar.ord-w{margin-left:-4px}.uploadcare-crop-widget .jcrop-light .jcrop-vline,.uploadcare-crop-widget .jcrop-light .jcrop-hline{background:#FFF;filter:Alpha(opacity=70)!important;opacity:.70!important}.uploadcare-crop-widget .jcrop-light .jcrop-handle{-moz-border-radius:3px;-webkit-border-radius:3px;background-color:#000;border-color:#FFF;border-radius:3px}.uploadcare-crop-widget .jcrop-dark .jcrop-vline,.uploadcare-crop-widget .jcrop-dark .jcrop-hline{background:#000;filter:Alpha(opacity=70)!important;opacity:.7!important}.uploadcare-crop-widget .jcrop-dark .jcrop-handle{-moz-border-radius:3px;-webkit-border-radius:3px;background-color:#FFF;border-color:#000;border-radius:3px}.uploadcare-crop-widget .jcrop-holder img,.uploadcare-crop-widget img.jcrop-preview{max-width:none}.uploadcare-crop-widget{font-family:"Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif}.uploadcare-crop-widget__image-wrap{position:relative}.uploadcare-crop-widget--loading .uploadcare-crop-widget__image-wrap{background-repeat:no-repeat;background-position:center}.uploadcare-crop-widget__image-wrap img{display:block}.uploadcare-crop-widget__error{-ms-box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;-o-box-sizing:border-box;box-sizing:border-box;text-align:center;position:absolute;top:50%;left:0;right:0;margin-top:-1em;display:none}.uploadcare-crop-widget--error .uploadcare-crop-widget__error{display:block}.uploadcare-crop-widget__error__title{font-size:20px}.uploadcare-crop-widget__error__text{font-size:15px}.uploadcare-crop-widget__controls{height:30px;padding-top:5px;text-align:center}.uploadcare-crop-widget--no-controls .uploadcare-crop-widget__controls{display:none}.uploadcare-widget{display:inline-block!important;position:relative;vertical-align:middle;padding:0 5px}.uploadcare-widget[data-status=loaded] .uploadcare-widget-buttons>li,.uploadcare-widget[data-status=started] .uploadcare-widget-buttons>li{display:none}.uploadcare-widget[data-status=started] .uploadcare-widget-buttons .uploadcare-widget-buttons-cancel,.uploadcare-widget[data-status=loaded] .uploadcare-widget-buttons .uploadcare-widget-buttons-remove{display:inline-block}.uploadcare-widget .uploadcare-widget-circle{width:25px;height:25px;top:-1px;float:left;margin-right:1ex}.uploadcare-widget-circle{position:relative;font-size:0}.uploadcare-widget-circle .uploadcare-widget-circle-back{position:relative;width:100%;height:100%;border-radius:50%;background:#e1e5e7}.uploadcare-widget-circle .uploadcare-widget-circle-back.uploadcare-widget-circle-active{background:#d0bf26}.uploadcare-widget-circle .uploadcare-widget-circle-center{position:absolute;background:white;width:10%;height:10%;top:50%;left:50%;border-radius:50%;margin-top:-5%;margin-left:-5%}.uploadcare-widget-buttons{position:relative;top:-1px;float:left;overflow:hidden;margin:0;padding:0;list-style:none}.uploadcare-widget-buttons>li{height:24px;float:left;font-size:11px;color:#8f9295;line-height:25px;min-width:36px;padding:0 6px;margin:0 3px 1px 0;list-style:none;-ms-box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;-o-box-sizing:border-box;box-sizing:border-box;border-radius:2px;background:#e1e5e7;cursor:default}.uploadcare-widget-buttons>li.uploadcare-widget-buttons-dialog,.uploadcare-widget-buttons>li.uploadcare-widget-buttons-file,.uploadcare-widget-buttons>li.uploadcare-widget-buttons-url{background-position:0 0;background-repeat:no-repeat;padding-left:30px}.uploadcare-widget-buttons>li.uploadcare-widget-buttons-dialog,.uploadcare-widget-buttons>li.uploadcare-widget-buttons-url{background-position:0 -24px}.uploadcare-widget-buttons>li.uploadcare-widget-buttons-cancel,.uploadcare-widget-buttons>li.uploadcare-widget-buttons-remove{font-size:.9em;display:none}.uploadcare-widget-status-text{float:left;overflow:hidden;line-height:25px;height:25px;margin-right:1ex;white-space:nowrap;padding:0 5px}.uploadcare-widget-file-name{cursor:pointer;color:#1a85ad;border-bottom-color:#1a85ad;text-decoration:none;border-bottom:1px dotted}.uploadcare-widget .uploadcare-widget-dragndrop-area{display:none;position:absolute;top:-8px;left:0;width:100%;height:41px;line-height:41px;text-align:center;background-color:#f0f0f0;color:#707478;border:1px dashed #b3b5b6;border-radius:20.5px}.uploadcare-widget .uploadcare-widget-dragndrop-area.uploadcare-dragging{display:block}\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-file"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-file-drop-area" role="uploadcare-drop-area">\n  <div class="uploadcare-dialog-file-title">\n    ',(''+ t('dialog.tabs.file.drag') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n  <div class="uploadcare-dialog-file-or">\n    ',(''+ t('dialog.tabs.file.or') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n  <div class="uploadcare-dialog-big-button" role="uploadcare-dialog-browse-file">\n    ',(''+ t('dialog.tabs.file.button') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n  <div class="uploadcare-dialog-file-or">\n    ',(''+ t('dialog.tabs.file.also') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n  </div>\n  <div class="uploadcare-dialog-file-sources">\n    ');  for (var i = 0; i < avalibleTabs.length; i++) { 
        var tab = avalibleTabs[i];
        if (tab == 'file') continue; ; __p.push('\n      <div \n        class="uploadcare-dialog-file-source"\n        role="uploadcare-dialog-switch-tab"\n        data-tab="',(''+ tab ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'"\n      >',(''+ t('dialog.tabs.file.tabNames.' + tab) ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n    ');  } ; __p.push('\n  </div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-preview-error"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-title">',(''+ 
    t('dialog.tabs.preview.error.'+error+'.title') || t('dialog.tabs.preview.error.default.title')
  ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n\n<div class="uploadcare-dialog-label">\n  ',(''+ file.fileName || t('dialog.tabs.preview.unknownName') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'');  if (file.fileSize != null) { ; __p.push(',\n  ',(''+ Math.round(file.fileSize/1000) ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),' KB');  } ; __p.push('\n</div>\n\n<div class="uploadcare-dialog-section uploadcare-dialog-normal-text">\n  ',(''+ 
      t('dialog.tabs.preview.error.'+error+'.line1') || t('dialog.tabs.preview.error.default.line1')
    ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'<br/>\n  ',(''+ 
      t('dialog.tabs.preview.error.'+error+'.line2') || t('dialog.tabs.preview.error.default.line2')
    ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n</div>\n\n<div\n  class="uploadcare-dialog-button-success" \n  role="uploadcare-dialog-preview-back">',(''+ t('dialog.tabs.preview.change') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-preview-image"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-title">',(''+ t('dialog.tabs.preview.image.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n\n<div class="uploadcare-dialog-preview-image-wrap1">\n<div class="uploadcare-dialog-preview-image-wrap2">\n  <img \n    src="',(''+ file.previewUrl ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'" \n    title="',(''+ file.fileName ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'" \n    alt="',(''+ file.fileName ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'"\n    role="uploadcare-dialog-preview-image"\n  />\n</div>\n</div>\n\n<div class="uploadcare-dialog-preview-footer">\n  <div \n    class="uploadcare-dialog-button" \n    role="uploadcare-dialog-preview-back">',(''+ t('dialog.tabs.preview.image.change') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n  <div \n    class="uploadcare-dialog-button-success" \n    role="uploadcare-dialog-preview-done">',(''+ t('dialog.tabs.preview.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-preview-regular"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-title">',(''+ t('dialog.tabs.preview.regular.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n\n<div class="uploadcare-dialog-label">\n  ',(''+ file.fileName || t('dialog.tabs.preview.unknownName') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'');  if (file.fileSize != null) { ; __p.push(',\n  ',(''+ Math.round(file.fileSize/1000) ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),' KB');  } ; __p.push('\n</div>\n\n<div class="uploadcare-dialog-section uploadcare-dialog-normal-text">\n  ',(''+ t('dialog.tabs.preview.regular.line1') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'<br/>\n  ',(''+ t('dialog.tabs.preview.regular.line2') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\n</div>\n\n<div \n  class="uploadcare-dialog-button-success" \n  role="uploadcare-dialog-preview-done">',(''+ t('dialog.tabs.preview.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n<div \n  class="uploadcare-dialog-button" \n  role="uploadcare-dialog-preview-back">',(''+ t('dialog.tabs.preview.change') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-preview-unknown"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-preview-center">\n  \n  <div \n    class="uploadcare-dialog-preview-circle"\n    role="uploadcare-dialog-preview-circle"></div>\n  <div class="uploadcare-dialog-title2">',(''+ t('dialog.tabs.preview.unknown.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n  <div class="uploadcare-dialog-label">\n    ',(''+ file.fileName || t('dialog.tabs.preview.unknownName') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'');  if (file.fileSize != null) { ; __p.push(',\n    ',(''+ Math.round(file.fileSize/1000) ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),' KB');  } ; __p.push('\n  </div>\n  <div \n    class="uploadcare-dialog-button-success" \n    role="uploadcare-dialog-preview-done">',(''+ t('dialog.tabs.preview.unknown.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-preview"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/tab-url"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-title">',(''+ t('dialog.tabs.url.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n<div class="uploadcare-dialog-section uploadcare-dialog-normal-text">\n    <div>',(''+ t('dialog.tabs.url.line1') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n    <div>',(''+ t('dialog.tabs.url.line2') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n</div>\n<form role="uploadcare-dialog-url-form">\n    <input type="text" role="uploadcare-dialog-url-input" placeholder="',(''+ t('dialog.tabs.url.input') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'">\n    <button class="uploadcare-dialog-button" type="submit" role="uploadcare-dialog-url-submit">',(''+ t('dialog.tabs.url.button') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</button>\n</form>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/widget-button"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<li \n  role="uploadcare-widget-buttons-',  name ,'" \n  class="uploadcare-widget-buttons-',  name ,'"\n>',(''+ caption ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</li>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/widget-file-name"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<span \n  role="uploadcare-widget-file-name" \n  class="uploadcare-widget-file-name">',(''+ name ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</span>,\n',(''+ size ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),' kb\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["uploadcare/templates/widget"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-widget">\n    <div role="uploadcare-widget-status"></div>\n    <div role="uploadcare-widget-status-text" class="uploadcare-widget-status-text"></div>\n    <ul role="uploadcare-widget-buttons" class="uploadcare-widget-buttons"></ul>\n    <div class="uploadcare-widget-dragndrop-area" role="uploadcare-drop-area">',(''+ t('draghere') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var locale, namespace;
    namespace = uploadcare.namespace, locale = uploadcare.locale;
    return namespace('uploadcare.templates', function(ns) {
      return ns.tpl = function(key, ctx) {
        var fn;
        if (ctx == null) {
          ctx = {};
        }
        fn = JST["uploadcare/templates/" + key];
        if (fn != null) {
          ctx.t = locale.t;
          return fn(ctx);
        } else {
          return '';
        }
      };
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, css, style, tpl;
    $ = uploadcare.jQuery;
    tpl = uploadcare.templates.tpl;
    css = tpl('styles');
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    if (style.styleSheet != null) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    return $('head').append(style);
  });

}).call(this);
/**
 * jquery.Jcrop.js v0.9.10
 * jQuery Image Cropping Plugin - released under MIT License 
 * Author: Kelly Hallman <khallman@gmail.com>
 * http://github.com/tapmodo/Jcrop
 * Copyright (c) 2008-2012 Tapmodo Interactive LLC {{{
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * }}}
 */


uploadcare.whenReady(function(){
var jQuery = uploadcare.jQuery;


(function ($) {

  $.Jcrop = function (obj, opt) {
    var options = $.extend({}, $.Jcrop.defaults),
        docOffset, lastcurs, ie6mode = false;

    // Internal Methods {{{
    function px(n) {
      return Math.round(n) + 'px';
    }
    function cssClass(cl) {
      return options.baseClass + '-' + cl;
    }
    function supportsColorFade() {
      return $.fx.step.hasOwnProperty('backgroundColor');
    }
    function getPos(obj) //{{{
    {
      var pos = $(obj).offset();
      return [pos.left, pos.top];
    }
    //}}}
    function mouseAbs(e) //{{{
    {
      return [(e.pageX - docOffset[0]), (e.pageY - docOffset[1])];
    }
    //}}}
    function setOptions(opt) //{{{
    {
      if (typeof(opt) !== 'object') opt = {};
      options = $.extend(options, opt);

      $.each(['onChange','onSelect','onRelease','onDblClick'],function(i,e) {
        if (typeof(options[e]) !== 'function') options[e] = function () {};
      });
    }
    //}}}
    function startDragMode(mode, pos) //{{{
    {
      docOffset = getPos($img);
      Tracker.setCursor(mode === 'move' ? mode : mode + '-resize');

      if (mode === 'move') {
        return Tracker.activateHandlers(createMover(pos), doneSelect);
      }

      var fc = Coords.getFixed();
      var opp = oppLockCorner(mode);
      var opc = Coords.getCorner(oppLockCorner(opp));

      Coords.setPressed(Coords.getCorner(opp));
      Coords.setCurrent(opc);

      Tracker.activateHandlers(dragmodeHandler(mode, fc), doneSelect);
    }
    //}}}
    function dragmodeHandler(mode, f) //{{{
    {
      return function (pos) {
        if (!options.aspectRatio) {
          switch (mode) {
          case 'e':
            pos[1] = f.y2;
            break;
          case 'w':
            pos[1] = f.y2;
            break;
          case 'n':
            pos[0] = f.x2;
            break;
          case 's':
            pos[0] = f.x2;
            break;
          }
        } else {
          switch (mode) {
          case 'e':
            pos[1] = f.y + 1;
            break;
          case 'w':
            pos[1] = f.y + 1;
            break;
          case 'n':
            pos[0] = f.x + 1;
            break;
          case 's':
            pos[0] = f.x + 1;
            break;
          }
        }
        Coords.setCurrent(pos);
        Selection.update();
      };
    }
    //}}}
    function createMover(pos) //{{{
    {
      var lloc = pos;
      KeyManager.watchKeys();

      return function (pos) {
        Coords.moveOffset([pos[0] - lloc[0], pos[1] - lloc[1]]);
        lloc = pos;

        Selection.update();
      };
    }
    //}}}
    function oppLockCorner(ord) //{{{
    {
      switch (ord) {
      case 'n':
        return 'sw';
      case 's':
        return 'nw';
      case 'e':
        return 'nw';
      case 'w':
        return 'ne';
      case 'ne':
        return 'sw';
      case 'nw':
        return 'se';
      case 'se':
        return 'nw';
      case 'sw':
        return 'ne';
      }
    }
    //}}}
    function createDragger(ord) //{{{
    {
      return function (e) {
        if (options.disabled) {
          return false;
        }
        if ((ord === 'move') && !options.allowMove) {
          return false;
        }
        
        // Fix position of crop area when dragged the very first time.
        // Necessary when crop image is in a hidden element when page is loaded.
        docOffset = getPos($img);

        btndown = true;
        startDragMode(ord, mouseAbs(e));
        e.stopPropagation();
        e.preventDefault();
        return false;
      };
    }
    //}}}
    function presize($obj, w, h) //{{{
    {
      var nw = $obj.width(),
          nh = $obj.height();
      if ((nw > w) && w > 0) {
        nw = w;
        nh = (w / $obj.width()) * $obj.height();
      }
      if ((nh > h) && h > 0) {
        nh = h;
        nw = (h / $obj.height()) * $obj.width();
      }
      xscale = $obj.width() / nw;
      yscale = $obj.height() / nh;
      $obj.width(nw).height(nh);
    }
    //}}}
    function unscale(c) //{{{
    {
      return {
        x: c.x * xscale,
        y: c.y * yscale,
        x2: c.x2 * xscale,
        y2: c.y2 * yscale,
        w: c.w * xscale,
        h: c.h * yscale
      };
    }
    //}}}
    function doneSelect(pos) //{{{
    {
      var c = Coords.getFixed();
      if ((c.w > options.minSelect[0]) && (c.h > options.minSelect[1])) {
        Selection.enableHandles();
        Selection.done();
      } else {
        Selection.release();
      }
      Tracker.setCursor(options.allowSelect ? 'crosshair' : 'default');
    }
    //}}}
    function newSelection(e) //{{{
    {
      if (options.disabled) {
        return false;
      }
      if (!options.allowSelect) {
        return false;
      }
      btndown = true;
      docOffset = getPos($img);
      Selection.disableHandles();
      Tracker.setCursor('crosshair');
      var pos = mouseAbs(e);
      Coords.setPressed(pos);
      Selection.update();
      Tracker.activateHandlers(selectDrag, doneSelect);
      KeyManager.watchKeys();

      e.stopPropagation();
      e.preventDefault();
      return false;
    }
    //}}}
    function selectDrag(pos) //{{{
    {
      Coords.setCurrent(pos);
      Selection.update();
    }
    //}}}
    function newTracker() //{{{
    {
      var trk = $('<div></div>').addClass(cssClass('tracker'));
      if ($.browser.msie) {
        trk.css({
          opacity: 0,
          backgroundColor: 'white'
        });
      }
      return trk;
    }
    //}}}

    // }}}
    // Initialization {{{
    // Sanitize some options {{{
    if ($.browser.msie && ($.browser.version.split('.')[0] === '6')) {
      ie6mode = true;
    }
    if (typeof(obj) !== 'object') {
      obj = $(obj)[0];
    }
    if (typeof(opt) !== 'object') {
      opt = {};
    }
    // }}}
    setOptions(opt);
    // Initialize some jQuery objects {{{
    // The values are SET on the image(s) for the interface
    // If the original image has any of these set, they will be reset
    // However, if you destroy() the Jcrop instance the original image's
    // character in the DOM will be as you left it.
    var img_css = {
      border: 'none',
      visibility: 'visible',
      margin: 0,
      padding: 0,
      position: 'absolute',
      top: 0,
      left: 0
    };

    var $origimg = $(obj),
      img_mode = true;

    if (obj.tagName == 'IMG') {
      // Fix size of crop image.
      // Necessary when crop image is within a hidden element when page is loaded.
      if ($origimg[0].width != 0 && $origimg[0].height != 0) {
        // Obtain dimensions from contained img element.
        $origimg.width($origimg[0].width);
        $origimg.height($origimg[0].height);
      } else {
        // Obtain dimensions from temporary image in case the original is not loaded yet (e.g. IE 7.0). 
        var tempImage = new Image();
        tempImage.src = $origimg[0].src;
        $origimg.width(tempImage.width);
        $origimg.height(tempImage.height);
      } 

      var $img = $origimg.clone().removeAttr('id').css(img_css).show();

      $img.width($origimg.width());
      $img.height($origimg.height());
      $origimg.after($img).hide();

    } else {
      $img = $origimg.css(img_css).show();
      img_mode = false;
      if (options.shade === null) { options.shade = true; }
    }

    presize($img, options.boxWidth, options.boxHeight);

    var boundx = $img.width(),
        boundy = $img.height(),
        
        
        $div = $('<div />').width(boundx).height(boundy).addClass(cssClass('holder')).css({
        position: 'relative',
        backgroundColor: options.bgColor
      }).insertAfter($origimg).append($img);

    if (options.addClass) {
      $div.addClass(options.addClass);
    }

    var $img2 = $('<div />'),

        $img_holder = $('<div />') 
        .width('100%').height('100%').css({
          zIndex: 310,
          position: 'absolute',
          overflow: 'hidden'
        }),

        $hdl_holder = $('<div />') 
        .width('100%').height('100%').css('zIndex', 320), 

        $sel = $('<div />') 
        .css({
          position: 'absolute',
          zIndex: 600
        }).dblclick(function(){
          var c = Coords.getFixed();
          options.onDblClick.call(api,c);
        }).insertBefore($img).append($img_holder, $hdl_holder); 

    if (img_mode) {

      $img2 = $('<img />')
          .attr('src', $img.attr('src')).css(img_css).width(boundx).height(boundy),

      $img_holder.append($img2);

    }

    if (ie6mode) {
      $sel.css({
        overflowY: 'hidden'
      });
    }

    var bound = options.boundary;
    var $trk = newTracker().width(boundx + (bound * 2)).height(boundy + (bound * 2)).css({
      position: 'absolute',
      top: px(-bound),
      left: px(-bound),
      zIndex: 290
    }).mousedown(newSelection);

    /* }}} */
    // Set more variables {{{
    var bgcolor = options.bgColor,
        bgopacity = options.bgOpacity,
        xlimit, ylimit, xmin, ymin, xscale, yscale, enabled = true,
        btndown, animating, shift_down;

    docOffset = getPos($img);
    // }}}
    // }}}
    // Internal Modules {{{
    // Touch Module {{{ 
    var Touch = (function () {
      // Touch support detection function adapted (under MIT License)
      // from code by Jeffrey Sambells - http://github.com/iamamused/
      function hasTouchSupport() {
        var support = {},
            events = ['touchstart', 'touchmove', 'touchend'],
            el = document.createElement('div'), i;

        try {
          for(i=0; i<events.length; i++) {
            var eventName = events[i];
            eventName = 'on' + eventName;
            var isSupported = (eventName in el);
            if (!isSupported) {
              el.setAttribute(eventName, 'return;');
              isSupported = typeof el[eventName] == 'function';
            }
            support[events[i]] = isSupported;
          }
          return support.touchstart && support.touchend && support.touchmove;
        }
        catch(err) {
          return false;
        }
      }

      function detectSupport() {
        if ((options.touchSupport === true) || (options.touchSupport === false)) return options.touchSupport;
          else return hasTouchSupport();
      }
      return {
        createDragger: function (ord) {
          return function (e) {
            e.pageX = e.originalEvent.changedTouches[0].pageX;
            e.pageY = e.originalEvent.changedTouches[0].pageY;
            if (options.disabled) {
              return false;
            }
            if ((ord === 'move') && !options.allowMove) {
              return false;
            }
            btndown = true;
            startDragMode(ord, mouseAbs(e));
            e.stopPropagation();
            e.preventDefault();
            return false;
          };
        },
        newSelection: function (e) {
          e.pageX = e.originalEvent.changedTouches[0].pageX;
          e.pageY = e.originalEvent.changedTouches[0].pageY;
          return newSelection(e);
        },
        isSupported: hasTouchSupport,
        support: detectSupport()
      };
    }());
    // }}}
    // Coords Module {{{
    var Coords = (function () {
      var x1 = 0,
          y1 = 0,
          x2 = 0,
          y2 = 0,
          ox, oy;

      function setPressed(pos) //{{{
      {
        pos = rebound(pos);
        x2 = x1 = pos[0];
        y2 = y1 = pos[1];
      }
      //}}}
      function setCurrent(pos) //{{{
      {
        pos = rebound(pos);
        ox = pos[0] - x2;
        oy = pos[1] - y2;
        x2 = pos[0];
        y2 = pos[1];
      }
      //}}}
      function getOffset() //{{{
      {
        return [ox, oy];
      }
      //}}}
      function moveOffset(offset) //{{{
      {
        var ox = offset[0],
            oy = offset[1];

        if (0 > x1 + ox) {
          ox -= ox + x1;
        }
        if (0 > y1 + oy) {
          oy -= oy + y1;
        }

        if (boundy < y2 + oy) {
          oy += boundy - (y2 + oy);
        }
        if (boundx < x2 + ox) {
          ox += boundx - (x2 + ox);
        }

        x1 += ox;
        x2 += ox;
        y1 += oy;
        y2 += oy;
      }
      //}}}
      function getCorner(ord) //{{{
      {
        var c = getFixed();
        switch (ord) {
        case 'ne':
          return [c.x2, c.y];
        case 'nw':
          return [c.x, c.y];
        case 'se':
          return [c.x2, c.y2];
        case 'sw':
          return [c.x, c.y2];
        }
      }
      //}}}
      function getFixed() //{{{
      {
        if (!options.aspectRatio) {
          return getRect();
        }
        // This function could use some optimization I think...
        var aspect = options.aspectRatio,
            min_x = options.minSize[0] / xscale,
            
            
            //min_y = options.minSize[1]/yscale,
            max_x = options.maxSize[0] / xscale,
            max_y = options.maxSize[1] / yscale,
            rw = x2 - x1,
            rh = y2 - y1,
            rwa = Math.abs(rw),
            rha = Math.abs(rh),
            real_ratio = rwa / rha,
            xx, yy, w, h;

        if (max_x === 0) {
          max_x = boundx * 10;
        }
        if (max_y === 0) {
          max_y = boundy * 10;
        }
        if (real_ratio < aspect) {
          yy = y2;
          w = rha * aspect;
          xx = rw < 0 ? x1 - w : w + x1;

          if (xx < 0) {
            xx = 0;
            h = Math.abs((xx - x1) / aspect);
            yy = rh < 0 ? y1 - h : h + y1;
          } else if (xx > boundx) {
            xx = boundx;
            h = Math.abs((xx - x1) / aspect);
            yy = rh < 0 ? y1 - h : h + y1;
          }
        } else {
          xx = x2;
          h = rwa / aspect;
          yy = rh < 0 ? y1 - h : y1 + h;
          if (yy < 0) {
            yy = 0;
            w = Math.abs((yy - y1) * aspect);
            xx = rw < 0 ? x1 - w : w + x1;
          } else if (yy > boundy) {
            yy = boundy;
            w = Math.abs(yy - y1) * aspect;
            xx = rw < 0 ? x1 - w : w + x1;
          }
        }

        // Magic %-)
        if (xx > x1) { // right side
          if (xx - x1 < min_x) {
            xx = x1 + min_x;
          } else if (xx - x1 > max_x) {
            xx = x1 + max_x;
          }
          if (yy > y1) {
            yy = y1 + (xx - x1) / aspect;
          } else {
            yy = y1 - (xx - x1) / aspect;
          }
        } else if (xx < x1) { // left side
          if (x1 - xx < min_x) {
            xx = x1 - min_x;
          } else if (x1 - xx > max_x) {
            xx = x1 - max_x;
          }
          if (yy > y1) {
            yy = y1 + (x1 - xx) / aspect;
          } else {
            yy = y1 - (x1 - xx) / aspect;
          }
        }

        if (xx < 0) {
          x1 -= xx;
          xx = 0;
        } else if (xx > boundx) {
          x1 -= xx - boundx;
          xx = boundx;
        }

        if (yy < 0) {
          y1 -= yy;
          yy = 0;
        } else if (yy > boundy) {
          y1 -= yy - boundy;
          yy = boundy;
        }

        return makeObj(flipCoords(x1, y1, xx, yy));
      }
      //}}}
      function rebound(p) //{{{
      {
        if (p[0] < 0) {
          p[0] = 0;
        }
        if (p[1] < 0) {
          p[1] = 0;
        }

        if (p[0] > boundx) {
          p[0] = boundx;
        }
        if (p[1] > boundy) {
          p[1] = boundy;
        }

        return [p[0], p[1]];
      }
      //}}}
      function flipCoords(x1, y1, x2, y2) //{{{
      {
        var xa = x1,
            xb = x2,
            ya = y1,
            yb = y2;
        if (x2 < x1) {
          xa = x2;
          xb = x1;
        }
        if (y2 < y1) {
          ya = y2;
          yb = y1;
        }
        return [xa, ya, xb, yb];
      }
      //}}}
      function getRect() //{{{
      {
        var xsize = x2 - x1,
            ysize = y2 - y1,
            delta;

        if (xlimit && (Math.abs(xsize) > xlimit)) {
          x2 = (xsize > 0) ? (x1 + xlimit) : (x1 - xlimit);
        }
        if (ylimit && (Math.abs(ysize) > ylimit)) {
          y2 = (ysize > 0) ? (y1 + ylimit) : (y1 - ylimit);
        }

        if (ymin / yscale && (Math.abs(ysize) < ymin / yscale)) {
          y2 = (ysize > 0) ? (y1 + ymin / yscale) : (y1 - ymin / yscale);
        }
        if (xmin / xscale && (Math.abs(xsize) < xmin / xscale)) {
          x2 = (xsize > 0) ? (x1 + xmin / xscale) : (x1 - xmin / xscale);
        }

        if (x1 < 0) {
          x2 -= x1;
          x1 -= x1;
        }
        if (y1 < 0) {
          y2 -= y1;
          y1 -= y1;
        }
        if (x2 < 0) {
          x1 -= x2;
          x2 -= x2;
        }
        if (y2 < 0) {
          y1 -= y2;
          y2 -= y2;
        }
        if (x2 > boundx) {
          delta = x2 - boundx;
          x1 -= delta;
          x2 -= delta;
        }
        if (y2 > boundy) {
          delta = y2 - boundy;
          y1 -= delta;
          y2 -= delta;
        }
        if (x1 > boundx) {
          delta = x1 - boundy;
          y2 -= delta;
          y1 -= delta;
        }
        if (y1 > boundy) {
          delta = y1 - boundy;
          y2 -= delta;
          y1 -= delta;
        }

        return makeObj(flipCoords(x1, y1, x2, y2));
      }
      //}}}
      function makeObj(a) //{{{
      {
        return {
          x: a[0],
          y: a[1],
          x2: a[2],
          y2: a[3],
          w: a[2] - a[0],
          h: a[3] - a[1]
        };
      }
      //}}}

      return {
        flipCoords: flipCoords,
        setPressed: setPressed,
        setCurrent: setCurrent,
        getOffset: getOffset,
        moveOffset: moveOffset,
        getCorner: getCorner,
        getFixed: getFixed
      };
    }());

    //}}}
    // Shade Module {{{
    var Shade = (function() {
      var enabled = false,
          holder = $('<div />').css({
            position: 'absolute',
            zIndex: 240,
            opacity: 0
          }),
          shades = {
            top: createShade(),
            left: createShade().height(boundy),
            right: createShade().height(boundy),
            bottom: createShade()
          };

      function resizeShades(w,h) {
        shades.left.css({ height: px(h) });
        shades.right.css({ height: px(h) });
      }
      function updateAuto()
      {
        return updateShade(Coords.getFixed());
      }
      function updateShade(c)
      {
        shades.top.css({
          left: px(c.x),
          width: px(c.w),
          height: px(c.y)
        });
        shades.bottom.css({
          top: px(c.y2),
          left: px(c.x),
          width: px(c.w),
          height: px(boundy-c.y2)
        });
        shades.right.css({
          left: px(c.x2),
          width: px(boundx-c.x2)
        });
        shades.left.css({
          width: px(c.x)
        });
      }
      function createShade() {
        return $('<div />').css({
          position: 'absolute',
          backgroundColor: options.shadeColor||options.bgColor
        }).appendTo(holder);
      }
      function enableShade() {
        if (!enabled) {
          enabled = true;
          holder.insertBefore($img);
          updateAuto();
          Selection.setBgOpacity(1,0,1);
          $img2.hide();

          setBgColor(options.shadeColor||options.bgColor,1);
          if (Selection.isAwake())
          {
            setOpacity(options.bgOpacity,1);
          }
            else setOpacity(1,1);
        }
      }
      function setBgColor(color,now) {
        colorChangeMacro(getShades(),color,now);
      }
      function disableShade() {
        if (enabled) {
          holder.remove();
          $img2.show();
          enabled = false;
          if (Selection.isAwake()) {
            Selection.setBgOpacity(options.bgOpacity,1,1);
          } else {
            Selection.setBgOpacity(1,1,1);
            Selection.disableHandles();
          }
          colorChangeMacro($div,0,1);
        }
      }
      function setOpacity(opacity,now) {
        if (enabled) {
          if (options.bgFade && !now) {
            holder.animate({
              opacity: 1-opacity
            },{
              queue: false,
              duration: options.fadeTime
            });
          }
          else holder.css({opacity:1-opacity});
        }
      }
      function refreshAll() {
        options.shade ? enableShade() : disableShade();
        if (Selection.isAwake()) setOpacity(options.bgOpacity);
      }
      function getShades() {
        return holder.children();
      }

      return {
        update: updateAuto,
        updateRaw: updateShade,
        getShades: getShades,
        setBgColor: setBgColor,
        enable: enableShade,
        disable: disableShade,
        resize: resizeShades,
        refresh: refreshAll,
        opacity: setOpacity
      };
    }());
    // }}}
    // Selection Module {{{
    var Selection = (function () {
      var awake,
          hdep = 370,
          borders = {},
          handle = {},
          dragbar = {},
          seehandles = false;

      // Private Methods
      function insertBorder(type) //{{{
      {
        var jq = $('<div />').css({
          position: 'absolute',
          opacity: options.borderOpacity
        }).addClass(cssClass(type));
        $img_holder.append(jq);
        return jq;
      }
      //}}}
      function dragDiv(ord, zi) //{{{
      {
        var jq = $('<div />').mousedown(createDragger(ord)).css({
          cursor: ord + '-resize',
          position: 'absolute',
          zIndex: zi
        }).addClass('ord-'+ord);

        if (Touch.support) {
          jq.bind('touchstart.jcrop', Touch.createDragger(ord));
        }

        $hdl_holder.append(jq);
        return jq;
      }
      //}}}
      function insertHandle(ord) //{{{
      {
        var hs = options.handleSize;
        return dragDiv(ord, hdep++).css({
          opacity: options.handleOpacity
        }).width(hs).height(hs).addClass(cssClass('handle'));
      }
      //}}}
      function insertDragbar(ord) //{{{
      {
        return dragDiv(ord, hdep++).addClass('jcrop-dragbar');
      }
      //}}}
      function createDragbars(li) //{{{
      {
        var i;
        for (i = 0; i < li.length; i++) {
          dragbar[li[i]] = insertDragbar(li[i]);
        }
      }
      //}}}
      function createBorders(li) //{{{
      {
        var cl,i;
        for (i = 0; i < li.length; i++) {
          switch(li[i]){
            case'n': cl='hline'; break;
            case's': cl='hline bottom'; break;
            case'e': cl='vline right'; break;
            case'w': cl='vline'; break;
          }
          borders[li[i]] = insertBorder(cl);
        }
      }
      //}}}
      function createHandles(li) //{{{
      {
        var i;
        for (i = 0; i < li.length; i++) {
          handle[li[i]] = insertHandle(li[i]);
        }
      }
      //}}}
      function moveto(x, y) //{{{
      {
        if (!options.shade) {
          $img2.css({
            top: px(-y),
            left: px(-x)
          });
        }
        $sel.css({
          top: px(y),
          left: px(x)
        });
      }
      //}}}
      function resize(w, h) //{{{
      {
        $sel.width(Math.round(w)).height(Math.round(h));
      }
      //}}}
      function refresh() //{{{
      {
        var c = Coords.getFixed();

        Coords.setPressed([c.x, c.y]);
        Coords.setCurrent([c.x2, c.y2]);

        updateVisible();
      }
      //}}}

      // Internal Methods
      function updateVisible(select) //{{{
      {
        if (awake) {
          return update(select);
        }
      }
      //}}}
      function update(select) //{{{
      {
        var c = Coords.getFixed();

        resize(c.w, c.h);
        moveto(c.x, c.y);
        if (options.shade) Shade.updateRaw(c);

        awake || show();

        if (select) {
          options.onSelect.call(api, unscale(c));
        } else {
          options.onChange.call(api, unscale(c));
        }
      }
      //}}}
      function setBgOpacity(opacity,force,now) //{{{
      {
        if (!awake && !force) return;
        if (options.bgFade && !now) {
          $img.animate({
            opacity: opacity
          },{
            queue: false,
            duration: options.fadeTime
          });
        } else {
          $img.css('opacity', opacity);
        }
      }
      //}}}
      function show() //{{{
      {
        $sel.show();

        if (options.shade) Shade.opacity(bgopacity);
          else setBgOpacity(bgopacity,true);

        awake = true;
      }
      //}}}
      function release() //{{{
      {
        disableHandles();
        $sel.hide();

        if (options.shade) Shade.opacity(1);
          else setBgOpacity(1);

        awake = false;
        options.onRelease.call(api);
      }
      //}}}
      function showHandles() //{{{
      {
        if (seehandles) {
          $hdl_holder.show();
        }
      }
      //}}}
      function enableHandles() //{{{
      {
        seehandles = true;
        if (options.allowResize) {
          $hdl_holder.show();
          return true;
        }
      }
      //}}}
      function disableHandles() //{{{
      {
        seehandles = false;
        $hdl_holder.hide();
      } 
      //}}}
      function animMode(v) //{{{
      {
        if (v) {
          animating = true;
          disableHandles();
        } else {
          animating = false;
          enableHandles();
        }
      } 
      //}}}
      function done() //{{{
      {
        animMode(false);
        refresh();
      } 
      //}}}
      // Insert draggable elements {{{
      // Insert border divs for outline

      if (options.dragEdges && $.isArray(options.createDragbars))
        createDragbars(options.createDragbars);

      if ($.isArray(options.createHandles))
        createHandles(options.createHandles);

      if (options.drawBorders && $.isArray(options.createBorders))
        createBorders(options.createBorders);

      //}}}

      // This is a hack for iOS5 to support drag/move touch functionality
      $(document).bind('touchstart.jcrop-ios',function(e) {
        if ($(e.currentTarget).hasClass('jcrop-tracker')) e.stopPropagation();
      });

      var $track = newTracker().mousedown(createDragger('move')).css({
        cursor: 'move',
        position: 'absolute',
        zIndex: 360
      });

      if (Touch.support) {
        $track.bind('touchstart.jcrop', Touch.createDragger('move'));
      }

      $img_holder.append($track);
      disableHandles();

      return {
        updateVisible: updateVisible,
        update: update,
        release: release,
        refresh: refresh,
        isAwake: function () {
          return awake;
        },
        setCursor: function (cursor) {
          $track.css('cursor', cursor);
        },
        enableHandles: enableHandles,
        enableOnly: function () {
          seehandles = true;
        },
        showHandles: showHandles,
        disableHandles: disableHandles,
        animMode: animMode,
        setBgOpacity: setBgOpacity,
        done: done
      };
    }());
    
    //}}}
    // Tracker Module {{{
    var Tracker = (function () {
      var onMove = function () {},
          onDone = function () {},
          trackDoc = options.trackDocument;

      function toFront() //{{{
      {
        $trk.css({
          zIndex: 450
        });
        if (Touch.support) {
          $(document)
            .bind('touchmove.jcrop', trackTouchMove)
            .bind('touchend.jcrop', trackTouchEnd);
        }
        if (trackDoc) {
          $(document)
            .bind('mousemove.jcrop',trackMove)
            .bind('mouseup.jcrop',trackUp);
        }
      } 
      //}}}
      function toBack() //{{{
      {
        $trk.css({
          zIndex: 290
        });
        $(document).unbind('.jcrop');
      } 
      //}}}
      function trackMove(e) //{{{
      {
        onMove(mouseAbs(e));
        return false;
      } 
      //}}}
      function trackUp(e) //{{{
      {
        e.preventDefault();
        e.stopPropagation();

        if (btndown) {
          btndown = false;

          onDone(mouseAbs(e));

          if (Selection.isAwake()) {
            options.onSelect.call(api, unscale(Coords.getFixed()));
          }

          toBack();
          onMove = function () {};
          onDone = function () {};
        }

        return false;
      }
      //}}}
      function activateHandlers(move, done) //{{{
      {
        btndown = true;
        onMove = move;
        onDone = done;
        toFront();
        return false;
      }
      //}}}
      function trackTouchMove(e) //{{{
      {
        e.pageX = e.originalEvent.changedTouches[0].pageX;
        e.pageY = e.originalEvent.changedTouches[0].pageY;
        return trackMove(e);
      }
      //}}}
      function trackTouchEnd(e) //{{{
      {
        e.pageX = e.originalEvent.changedTouches[0].pageX;
        e.pageY = e.originalEvent.changedTouches[0].pageY;
        return trackUp(e);
      }
      //}}}
      function setCursor(t) //{{{
      {
        $trk.css('cursor', t);
      }
      //}}}

      if (!trackDoc) {
        $trk.mousemove(trackMove).mouseup(trackUp).mouseout(trackUp);
      }

      $img.before($trk);
      return {
        activateHandlers: activateHandlers,
        setCursor: setCursor
      };
    }());
    //}}}
    // KeyManager Module {{{
    var KeyManager = (function () {
      var $keymgr = $('<input type="radio" />').css({
        position: 'fixed',
        left: '-120px',
        width: '12px'
      }).addClass('jcrop-keymgr'),

        $keywrap = $('<div />').css({
          position: 'absolute',
          overflow: 'hidden'
        }).append($keymgr);

      function watchKeys() //{{{
      {
        if (options.keySupport) {
          $keymgr.show();
          $keymgr.focus();
        }
      }
      //}}}
      function onBlur(e) //{{{
      {
        $keymgr.hide();
      }
      //}}}
      function doNudge(e, x, y) //{{{
      {
        if (options.allowMove) {
          Coords.moveOffset([x, y]);
          Selection.updateVisible(true);
        }
        e.preventDefault();
        e.stopPropagation();
      }
      //}}}
      function parseKey(e) //{{{
      {
        if (e.ctrlKey || e.metaKey) {
          return true;
        }
        shift_down = e.shiftKey ? true : false;
        var nudge = shift_down ? 10 : 1;

        switch (e.keyCode) {
        case 37:
          doNudge(e, -nudge, 0);
          break;
        case 39:
          doNudge(e, nudge, 0);
          break;
        case 38:
          doNudge(e, 0, -nudge);
          break;
        case 40:
          doNudge(e, 0, nudge);
          break;
        case 27:
          if (options.allowSelect) Selection.release();
          break;
        case 9:
          return true;
        }

        return false;
      }
      //}}}

      if (options.keySupport) {
        $keymgr.keydown(parseKey).blur(onBlur);
        if (ie6mode || !options.fixedSupport) {
          $keymgr.css({
            position: 'absolute',
            left: '-20px'
          });
          $keywrap.append($keymgr).insertBefore($img);
        } else {
          $keymgr.insertBefore($img);
        }
      }


      return {
        watchKeys: watchKeys
      };
    }());
    //}}}
    // }}}
    // API methods {{{
    function setClass(cname) //{{{
    {
      $div.removeClass().addClass(cssClass('holder')).addClass(cname);
    }
    //}}}
    function animateTo(a, callback) //{{{
    {
      var x1 = a[0] / xscale,
          y1 = a[1] / yscale,
          x2 = a[2] / xscale,
          y2 = a[3] / yscale;

      if (animating) {
        return;
      }

      var animto = Coords.flipCoords(x1, y1, x2, y2),
          c = Coords.getFixed(),
          initcr = [c.x, c.y, c.x2, c.y2],
          animat = initcr,
          interv = options.animationDelay,
          ix1 = animto[0] - initcr[0],
          iy1 = animto[1] - initcr[1],
          ix2 = animto[2] - initcr[2],
          iy2 = animto[3] - initcr[3],
          pcent = 0,
          velocity = options.swingSpeed;

      x1 = animat[0];
      y1 = animat[1];
      x2 = animat[2];
      y2 = animat[3];

      Selection.animMode(true);
      var anim_timer;

      function queueAnimator() {
        window.setTimeout(animator, interv);
      }
      var animator = (function () {
        return function () {
          pcent += (100 - pcent) / velocity;

          animat[0] = Math.round(x1 + ((pcent / 100) * ix1));
          animat[1] = Math.round(y1 + ((pcent / 100) * iy1));
          animat[2] = Math.round(x2 + ((pcent / 100) * ix2));
          animat[3] = Math.round(y2 + ((pcent / 100) * iy2));

          if (pcent >= 99.8) {
            pcent = 100;
          }
          if (pcent < 100) {
            setSelectRaw(animat);
            queueAnimator();
          } else {
            Selection.done();
            Selection.animMode(false);
            if (typeof(callback) === 'function') {
              callback.call(api);
            }
          }
        };
      }());
      queueAnimator();
    }
    //}}}
    function setSelect(rect) //{{{
    {
      setSelectRaw([rect[0] / xscale, rect[1] / yscale, rect[2] / xscale, rect[3] / yscale]);
      options.onSelect.call(api, unscale(Coords.getFixed()));
      Selection.enableHandles();
    }
    //}}}
    function setSelectRaw(l) //{{{
    {
      Coords.setPressed([l[0], l[1]]);
      Coords.setCurrent([l[2], l[3]]);
      Selection.update();
    }
    //}}}
    function tellSelect() //{{{
    {
      return unscale(Coords.getFixed());
    }
    //}}}
    function tellScaled() //{{{
    {
      return Coords.getFixed();
    }
    //}}}
    function setOptionsNew(opt) //{{{
    {
      setOptions(opt);
      interfaceUpdate();
    }
    //}}}
    function disableCrop() //{{{
    {
      options.disabled = true;
      Selection.disableHandles();
      Selection.setCursor('default');
      Tracker.setCursor('default');
    }
    //}}}
    function enableCrop() //{{{
    {
      options.disabled = false;
      interfaceUpdate();
    }
    //}}}
    function cancelCrop() //{{{
    {
      Selection.done();
      Tracker.activateHandlers(null, null);
    }
    //}}}
    function destroy() //{{{
    {
      $div.remove();
      $origimg.show();
      $origimg.css('visibility','visible');
      $(obj).removeData('Jcrop');
    }
    //}}}
    function setImage(src, callback) //{{{
    {
      Selection.release();
      disableCrop();
      var img = new Image();
      img.onload = function () {
        var iw = img.width;
        var ih = img.height;
        var bw = options.boxWidth;
        var bh = options.boxHeight;
        $img.width(iw).height(ih);
        $img.attr('src', src);
        $img2.attr('src', src);
        presize($img, bw, bh);
        boundx = $img.width();
        boundy = $img.height();
        $img2.width(boundx).height(boundy);
        $trk.width(boundx + (bound * 2)).height(boundy + (bound * 2));
        $div.width(boundx).height(boundy);
        Shade.resize(boundx,boundy);
        enableCrop();

        if (typeof(callback) === 'function') {
          callback.call(api);
        }
      };
      img.src = src;
    }
    //}}}
    function colorChangeMacro($obj,color,now) {
      var mycolor = color || options.bgColor;
      if (options.bgFade && supportsColorFade() && options.fadeTime && !now) {
        $obj.animate({
          backgroundColor: mycolor
        }, {
          queue: false,
          duration: options.fadeTime
        });
      } else {
        $obj.css('backgroundColor', mycolor);
      }
    }
    function interfaceUpdate(alt) //{{{
    // This method tweaks the interface based on options object.
    // Called when options are changed and at end of initialization.
    {
      if (options.allowResize) {
        if (alt) {
          Selection.enableOnly();
        } else {
          Selection.enableHandles();
        }
      } else {
        Selection.disableHandles();
      }

      Tracker.setCursor(options.allowSelect ? 'crosshair' : 'default');
      Selection.setCursor(options.allowMove ? 'move' : 'default');

      if (options.hasOwnProperty('trueSize')) {
        xscale = options.trueSize[0] / boundx;
        yscale = options.trueSize[1] / boundy;
      }

      if (options.hasOwnProperty('setSelect')) {
        setSelect(options.setSelect);
        Selection.done();
        delete(options.setSelect);
      }

      Shade.refresh();

      if (options.bgColor != bgcolor) {
        colorChangeMacro(
          options.shade? Shade.getShades(): $div,
          options.shade?
            (options.shadeColor || options.bgColor):
            options.bgColor
        );
        bgcolor = options.bgColor;
      }

      if (bgopacity != options.bgOpacity) {
        bgopacity = options.bgOpacity;
        if (options.shade) Shade.refresh();
          else Selection.setBgOpacity(bgopacity);
      }

      xlimit = options.maxSize[0] || 0;
      ylimit = options.maxSize[1] || 0;
      xmin = options.minSize[0] || 0;
      ymin = options.minSize[1] || 0;

      if (options.hasOwnProperty('outerImage')) {
        $img.attr('src', options.outerImage);
        delete(options.outerImage);
      }

      Selection.refresh();
    }
    //}}}
    //}}}

    if (Touch.support) $trk.bind('touchstart.jcrop', Touch.newSelection);

    $hdl_holder.hide();
    interfaceUpdate(true);

    var api = {
      setImage: setImage,
      animateTo: animateTo,
      setSelect: setSelect,
      setOptions: setOptionsNew,
      tellSelect: tellSelect,
      tellScaled: tellScaled,
      setClass: setClass,

      disable: disableCrop,
      enable: enableCrop,
      cancel: cancelCrop,
      release: Selection.release,
      destroy: destroy,

      focus: KeyManager.watchKeys,

      getBounds: function () {
        return [boundx * xscale, boundy * yscale];
      },
      getWidgetSize: function () {
        return [boundx, boundy];
      },
      getScaleFactor: function () {
        return [xscale, yscale];
      },
      getOptions: function() {
        // careful: internal values are returned
        return options;
      },

      ui: {
        holder: $div,
        selection: $sel
      }
    };

    if ($.browser.msie)
      $div.bind('selectstart', function () { return false; });

    $origimg.data('Jcrop', api);
    return api;
  };
  $.fn.Jcrop = function (options, callback) //{{{
  {
    var api;
    // Iterate over each object, attach Jcrop
    this.each(function () {
      // If we've already attached to this object
      if ($(this).data('Jcrop')) {
        // The API can be requested this way (undocumented)
        if (options === 'api') return $(this).data('Jcrop');
        // Otherwise, we just reset the options...
        else $(this).data('Jcrop').setOptions(options);
      }
      // If we haven't been attached, preload and attach
      else {
        if (this.tagName == 'IMG')
          $.Jcrop.Loader(this,function(){
            $(this).css({display:'block',visibility:'hidden'});
            api = $.Jcrop(this, options);
            if ($.isFunction(callback)) callback.call(api);
          });
        else {
          $(this).css({display:'block',visibility:'hidden'});
          api = $.Jcrop(this, options);
          if ($.isFunction(callback)) callback.call(api);
        }
      }
    });

    // Return "this" so the object is chainable (jQuery-style)
    return this;
  };
  //}}}
  // $.Jcrop.Loader - basic image loader {{{

  $.Jcrop.Loader = function(imgobj,success,error){
    var $img = $(imgobj), img = $img[0];

    function completeCheck(){
      if (img.complete) {
        $img.unbind('.jcloader');
        if ($.isFunction(success)) success.call(img);
      }
      else window.setTimeout(completeCheck,50);
    }

    $img
      .bind('load.jcloader',completeCheck)
      .bind('error.jcloader',function(e){
        $img.unbind('.jcloader');
        if ($.isFunction(error)) error.call(img);
      });

    if (img.complete && $.isFunction(success)){
      $img.unbind('.jcloader');
      success.call(img);
    }
  };

  //}}}
  // Global Defaults {{{
  $.Jcrop.defaults = {

    // Basic Settings
    allowSelect: true,
    allowMove: true,
    allowResize: true,

    trackDocument: true,

    // Styling Options
    baseClass: 'jcrop',
    addClass: null,
    bgColor: 'black',
    bgOpacity: 0.6,
    bgFade: false,
    borderOpacity: 0.4,
    handleOpacity: 0.5,
    handleSize: 7,

    aspectRatio: 0,
    keySupport: true,
    createHandles: ['n','s','e','w','nw','ne','se','sw'],
    createDragbars: ['n','s','e','w'],
    createBorders: ['n','s','e','w'],
    drawBorders: true,
    dragEdges: true,
    fixedSupport: true,
    touchSupport: null,

    shade: null,

    boxWidth: 0,
    boxHeight: 0,
    boundary: 2,
    fadeTime: 400,
    animationDelay: 20,
    swingSpeed: 3,

    minSelect: [0, 0],
    maxSize: [0, 0],
    minSize: [0, 0],

    // Callbacks / Event Handlers
    onChange: function () {},
    onSelect: function () {},
    onDblClick: function () {},
    onRelease: function () {}
  };

  // }}}
}(jQuery));


}); // end uploadcare.whenReady()
;
(function() {

  uploadcare.whenReady(function() {
    var $, namespace, tpl;
    namespace = uploadcare.namespace, $ = uploadcare.jQuery;
    tpl = uploadcare.templates.tpl;
    return namespace('uploadcare.crop', function(ns) {
      return ns.CropWidget = (function() {
        var CONTROLS_HEIGHT, IMAGE_CLEARED, LOADING_ERROR, checkOptions, cropModifierRegExp, defaultOptions, fitSize;

        defaultOptions = {
          container: null,
          scale: true,
          upscale: false,
          widgetSize: null,
          preferedSize: null,
          controls: true
        };

        LOADING_ERROR = 'loadingerror';

        IMAGE_CLEARED = 'imagecleared';

        CONTROLS_HEIGHT = 30;

        checkOptions = function(options) {
          var option, value, _i, _len, _ref, _results;
          if (!options.container) {
            throw new Error("options.container must be specified");
          }
          _ref = ['widgetSize', 'preferedSize'];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            option = _ref[_i];
            value = options[option];
            if (!(!value || (typeof value === 'string' && value.match(/^\d+x\d+$/i)))) {
              throw new Error("options." + option + " must follow pattern '123x456' or be falsy");
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };

        fitSize = function(objWidth, objHeight, boxWidth, boxHeight, upscale) {
          if (upscale == null) {
            upscale = false;
          }
          if (objWidth > boxWidth || objHeight > boxHeight || upscale) {
            if (boxWidth / boxHeight < objWidth / objHeight) {
              return [boxWidth, Math.floor(objHeight / objWidth * boxWidth)];
            } else {
              return [Math.floor(objWidth / objHeight * boxHeight), boxHeight];
            }
          } else {
            return [objWidth, objHeight];
          }
        };

        function CropWidget(options) {
          this.__options = $.extend({}, defaultOptions, options);
          if (!this.__options.preferedSize) {
            this.__options.scale = false;
          }
          checkOptions(this.__options);
          this.onStateChange = $.Callbacks();
          this.__buildWidget();
        }

        CropWidget.prototype.croppedImageUrl = function(originalUrl) {
          var _this = this;
          return this.croppedImageModifiers(originalUrl).pipe(function(modifiers) {
            return _this.__url + modifiers;
          });
        };

        cropModifierRegExp = /-\/crop\/([0-9]+)x([0-9]+)(\/(center|([0-9]+),([0-9]+)))?\//i;

        CropWidget.prototype.croppedImageModifiers = function(originalUrl, currentModifiers) {
          var previousCoords, raw,
            _this = this;
          previousCoords = null;
          if (raw = currentModifiers != null ? currentModifiers.match(cropModifierRegExp) : void 0) {
            previousCoords = {
              width: parseInt(raw[1], 10),
              height: parseInt(raw[2], 10),
              center: raw[4] === 'center',
              top: parseInt(raw[5], 10) || void 0,
              left: parseInt(raw[6], 10) || void 0
            };
          }
          return this.croppedImageCoords(originalUrl, previousCoords).pipe(function(coords) {
            var modifiers, pWidth, size, topLeft;
            size = "" + coords.w + "x" + coords.h;
            topLeft = "" + coords.x + "," + coords.y;
            modifiers = "-/crop/" + size + "/" + topLeft + "/";
            if (_this.__options.scale) {
              pWidth = _this.__options.preferedSize.split('x')[0];
              if (coords.w > pWidth || _this.__options.upscale) {
                modifiers += "-/resize/" + _this.__options.preferedSize + "/";
              }
            }
            return modifiers;
          });
        };

        CropWidget.prototype.croppedImageCoords = function(originalUrl, previousCoords) {
          this.__clearImage();
          this.__setImage(originalUrl, previousCoords);
          return this.__deferred.promise();
        };

        CropWidget.prototype.forceDone = function() {
          if (this.__state === 'loaded') {
            return this.__deferred.resolve(this.getCurrentCoords());
          } else {
            throw new Error("not ready");
          }
        };

        CropWidget.prototype.getCurrentCoords = function() {
          var fixedCoords, key, scaleRatio, value, _ref;
          scaleRatio = this.__resizedWidth / this.__originalWidth;
          fixedCoords = {};
          _ref = this.__currentCoords;
          for (key in _ref) {
            value = _ref[key];
            fixedCoords[key] = Math.round(value / scaleRatio);
          }
          return fixedCoords;
        };

        CropWidget.prototype.destroy = function() {
          this.__clearImage();
          this.__widgetElement.remove();
          return this.__widgetElement = this.__imageWrap = this.__doneButton = null;
        };

        CropWidget.prototype.__buildWidget = function() {
          var _ref, _ref1;
          this.container = $(this.__options.container);
          this.__widgetElement = $(tpl('crop-widget'));
          this.__imageWrap = this.__widgetElement.find('@uploadcare-crop-widget-image-wrap');
          this.__doneButton = this.__widgetElement.find('@uploadcare-crop-widget-done-button');
          if (!this.__options.controls) {
            this.__widgetElement.addClass('uploadcare-crop-widget--no-controls');
          }
          _ref1 = (_ref = this.__widgetSize(), this.__widgetWidth = _ref[0], this.__widgetHeight = _ref[1], _ref), this.__wrapWidth = _ref1[0], this.__wrapHeight = _ref1[1];
          if (this.__options.controls) {
            this.__wrapHeight -= CONTROLS_HEIGHT;
          }
          this.__imageWrap.css({
            width: this.__wrapWidth,
            height: this.__wrapHeight
          });
          this.__widgetElement.css({
            width: this.__widgetWidth,
            height: this.__widgetHeight
          });
          this.__widgetElement.appendTo(this.container);
          this.__setState('waiting');
          return this["__bind"]();
        };

        CropWidget.prototype["__bind"] = function() {
          var _this = this;
          return this.__doneButton.click(function() {
            return _this.forceDone();
          });
        };

        CropWidget.prototype.__clearImage = function() {
          var _ref;
          if ((_ref = this.__jCropApi) != null) {
            _ref.destroy();
          }
          if (this.__deferred && this.__deferred.state() === 'pending') {
            this.__deferred.reject(IMAGE_CLEARED);
            this.__deferred = false;
          }
          if (this.__img) {
            this.__img.remove();
            this.__img.off();
            this.__img = null;
          }
          this.__resizedHeight = this.__resizedWidth = this.__originalHeight = this.__originalWidth = null;
          return this.__setState('waiting');
        };

        CropWidget.prototype.__setImage = function(__url, previousCoords) {
          var _this = this;
          this.__url = __url;
          this.__deferred = $.Deferred();
          this.__setState('loading');
          this.__img = $('<img/>');
          this.__img.attr('src', this.__url);
          return this.__img.on({
            load: function() {
              _this.__setState('loaded');
              _this.__calcImgSizes();
              _this.__img.appendTo(_this.__imageWrap);
              return _this.__initJcrop(previousCoords);
            },
            error: function() {
              _this.__setState('error');
              return _this.__deferred.reject(LOADING_ERROR);
            }
          });
        };

        CropWidget.prototype.__calcImgSizes = function() {
          var paddingLeft, paddingTop, _ref, _ref1;
          _ref = this.__img[0], this.__originalWidth = _ref.width, this.__originalHeight = _ref.height;
          _ref1 = fitSize(this.__originalWidth, this.__originalHeight, this.__wrapWidth, this.__wrapHeight), this.__resizedWidth = _ref1[0], this.__resizedHeight = _ref1[1];
          paddingTop = (this.__wrapHeight - this.__resizedHeight) / 2;
          paddingLeft = (this.__wrapWidth - this.__resizedWidth) / 2;
          this.__img.attr({
            width: this.__resizedWidth,
            height: this.__resizedHeight
          });
          return this.__imageWrap.css({
            paddingTop: paddingTop,
            paddingLeft: paddingLeft,
            width: this.__wrapWidth - paddingLeft,
            height: this.__wrapHeight - paddingTop
          });
        };

        CropWidget.prototype.__widgetSize = function() {
          if (!this.__options.widgetSize) {
            return [this.container.width(), this.container.height()];
          } else {
            return this.__options.widgetSize.split('x');
          }
        };

        CropWidget.prototype.__setState = function(state) {
          var prefix, s;
          if (this.__state === state) {
            return;
          }
          this.__state = state;
          prefix = 'uploadcare-crop-widget--';
          this.__widgetElement.removeClass(((function() {
            var _i, _len, _ref, _results;
            _ref = ['error', 'loading', 'loaded', 'waiting'];
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              s = _ref[_i];
              _results.push(prefix + s);
            }
            return _results;
          })()).join(' ')).addClass(prefix + state);
          this.onStateChange.fire(state);
          return this.__doneButton.prop('disabled', state !== 'loaded');
        };

        CropWidget.prototype.__initJcrop = function(previousCoords) {
          var height, i, jCropOptions, left, scaleRatio, setApi, top, val, width, _i, _len, _ref, _ref1, _ref2,
            _this = this;
          jCropOptions = {
            onSelect: function(coords) {
              return _this.__currentCoords = coords;
            }
          };
          if (this.__options.preferedSize) {
            _ref = this.__options.preferedSize.split('x'), width = _ref[0], height = _ref[1];
            jCropOptions.aspectRatio = width / height;
          }
          if (!previousCoords) {
            previousCoords = {
              center: true
            };
            if (this.__options.preferedSize) {
              _ref1 = fitSize(width, height, this.__originalWidth, this.__originalHeight, true), previousCoords.width = _ref1[0], previousCoords.height = _ref1[1];
            } else {
              previousCoords.width = this.__originalWidth;
              previousCoords.height = this.__originalHeight;
            }
          }
          if (previousCoords.center) {
            top = (this.__originalWidth - previousCoords.width) / 2;
            left = (this.__originalHeight - previousCoords.height) / 2;
          } else {
            top = previousCoords.top || 0;
            left = previousCoords.left || 0;
          }
          jCropOptions.setSelect = [top, left, previousCoords.width + top, previousCoords.height + left];
          scaleRatio = this.__resizedWidth / this.__originalWidth;
          _ref2 = jCropOptions.setSelect;
          for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
            val = _ref2[i];
            jCropOptions.setSelect[i] = val * scaleRatio;
          }
          setApi = function(api) {
            return _this.__jCropApi = api;
          };
          return this.__img.Jcrop(jCropOptions, function() {
            return setApi(this);
          });
        };

        return CropWidget;

      })();
    });
  });

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  uploadcare.whenReady(function() {
    var $, namespace, utils;
    namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils;
    return namespace('uploadcare.files', function(ns) {
      return ns.BaseFile = (function() {

        function BaseFile(settings) {
          this.__requestInfo = __bind(this.__requestInfo, this);

          var _this = this;
          this.settings = utils.buildSettings(settings);
          this.fileId = null;
          this.fileName = null;
          this.fileSize = null;
          this.isStored = null;
          this.cdnUrl = null;
          this.cdnUrlModifiers = null;
          this.previewUrl = null;
          this.isImage = null;
          this.upload = null;
          this.__uploadDf = $.Deferred();
          this.__infoDf = $.Deferred();
          this.__uploadDf.fail(function(error) {
            return _this.__infoDf.reject(error, _this);
          });
          this.updateCdnUrlModifiers(null);
        }

        BaseFile.prototype.__startUpload = function() {
          throw new Error('not implemented');
        };

        BaseFile.prototype.__requestInfo = function() {
          var fail,
            _this = this;
          fail = function() {
            return _this.__infoDf.reject('info', _this);
          };
          return $.ajax("" + this.settings.urlBase + "/info/", {
            data: {
              file_id: this.fileId,
              pub_key: this.settings.publicKey
            },
            dataType: 'jsonp'
          }).fail(fail).done(function(data) {
            if (data.error) {
              return fail();
            }
            _this.fileName = data.original_filename;
            _this.fileSize = data.size;
            _this.isImage = data.is_image;
            _this.isStored = data.is_stored;
            _this.__buildPreviewUrl();
            if (_this.settings.imagesOnly && !_this.isImage) {
              _this.__infoDf.reject('image', _this);
              return;
            }
            return _this.__infoDf.resolve(_this);
          });
        };

        BaseFile.prototype.__buildPreviewUrl = function() {
          if (this.__tmpFinalPreviewUrl) {
            return this.previewUrl = this.__tmpFinalPreviewUrl;
          } else {
            return this.previewUrl = "" + this.settings.urlBase + "/preview/?file_id=" + this.fileId + "&pub_key=" + this.settings.publicKey;
          }
        };

        BaseFile.prototype.updateCdnUrlModifiers = function(cdnUrlModifiers) {
          var _this = this;
          this.cdnUrlModifiers = cdnUrlModifiers;
          return this.__infoDf.done(function() {
            return _this.cdnUrl = "" + _this.settings.cdnBase + "/" + _this.fileId + "/" + (_this.cdnUrlModifiers || '');
          });
        };

        BaseFile.prototype.startUpload = function() {
          if (!this.upload) {
            if (this.__uploadDf.state() === 'pending') {
              this.__startUpload();
            }
            this.__createPublicUploadDf();
          }
          return this.upload;
        };

        BaseFile.prototype.__createPublicUploadDf = function() {
          var _this = this;
          this.upload = this.__uploadDf.promise();
          return this.upload.reject = function() {
            return _this.__uploadDf.reject('user', _this);
          };
        };

        BaseFile.prototype.info = function() {
          if (!this.__requestInfoPlanned) {
            this.__requestInfoPlanned = true;
            this.__uploadDf.done(this.__requestInfo);
          }
          return this.__infoDf.promise();
        };

        return BaseFile;

      })();
    });
  });

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  uploadcare.whenReady(function() {
    var $, debug, namespace, utils;
    namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils, debug = uploadcare.debug;
    return namespace('uploadcare.files', function(ns) {
      return ns.EventFile = (function(_super) {

        __extends(EventFile, _super);

        function EventFile(settings, __file) {
          this.__file = __file;
          EventFile.__super__.constructor.apply(this, arguments);
          this.fileId = utils.uuid();
          this.fileSize = this.__file.size;
          this.fileName = this.__file.name;
          this.previewUrl = utils.createObjectUrl(this.__file);
        }

        EventFile.prototype.__startUpload = function() {
          var fail, formData, targetUrl, xhr,
            _this = this;
          targetUrl = "" + this.settings.urlBase + "/iframe/";
          if (this.fileSize > (100 * 1024 * 1024)) {
            this.__uploadDf.reject('size', this);
            return;
          }
          formData = new FormData();
          formData.append('UPLOADCARE_PUB_KEY', this.settings.publicKey);
          formData.append('UPLOADCARE_FILE_ID', this.fileId);
          formData.append('file', this.__file);
          fail = function() {
            return _this.__uploadDf.reject('upload', _this);
          };
          xhr = new XMLHttpRequest();
          xhr.addEventListener('loadend', function() {
            if ((xhr != null) && !xhr.status) {
              return fail();
            }
          });
          xhr.upload.addEventListener('progress', function() {
            _this.__loaded = event.loaded;
            _this.fileSize = event.totalSize || event.total;
            return _this.__uploadDf.notify(_this.fileSize / _this.__loaded, _this);
          });
          $.ajax({
            xhr: function() {
              return xhr;
            },
            crossDomain: true,
            type: 'POST',
            url: "" + this.settings.urlBase + "/iframe/?jsonerrors=1",
            xhrFields: {
              withCredentials: true
            },
            headers: {
              'X-PINGOTHER': 'pingpong'
            },
            contentType: false,
            processData: false,
            data: formData,
            dataType: 'json',
            error: fail,
            success: function(data) {
              if (data != null ? data.error : void 0) {
                debug(data.error.content);
                return fail();
              }
              return _this.__uploadDf.resolve(_this);
            }
          });
          return this.__uploadDf.always(function() {
            var _xhr;
            _xhr = xhr;
            xhr = null;
            return _xhr.abort();
          });
        };

        return EventFile;

      })(ns.BaseFile);
    });
  });

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  uploadcare.whenReady(function() {
    var $, namespace, utils;
    namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils;
    return namespace('uploadcare.files', function(ns) {
      return ns.InputFile = (function(_super) {

        __extends(InputFile, _super);

        function InputFile(settings, __input) {
          this.__input = __input;
          InputFile.__super__.constructor.apply(this, arguments);
          this.fileId = utils.uuid();
          this.fileName = $(this.__input).val().split('\\').pop();
        }

        InputFile.prototype.__startUpload = function() {
          var formParam, iframeId, targetUrl,
            _this = this;
          targetUrl = "" + this.settings.urlBase + "/iframe/";
          this.__uploadDf.always(function() {
            return _this.__cleanUp();
          });
          iframeId = "uploadcare-iframe-" + this.fileId;
          this.__iframe = $('<iframe>').attr({
            id: iframeId,
            name: iframeId
          }).css('display', 'none').appendTo('body').on('load', function() {
            return _this.__uploadDf.resolve(_this);
          }).on('error', function() {
            return _this.__uploadDf.reject('upload', _this);
          });
          formParam = function(name, value) {
            return $('<input>').attr({
              type: 'hidden',
              name: name
            }).val(value);
          };
          $(this.__input).clone(true).insertBefore(this.__input);
          $(this.__input).attr('name', 'file');
          return this.__iframeForm = $('<form>').attr({
            method: 'POST',
            action: targetUrl,
            enctype: 'multipart/form-data',
            target: iframeId
          }).append(formParam('UPLOADCARE_PUB_KEY', this.settings.publicKey)).append(formParam('UPLOADCARE_FILE_ID', this.fileId)).append(this.__input).css('display', 'none').appendTo('body').submit();
        };

        InputFile.prototype.__cleanUp = function() {
          var _ref, _ref1;
          if ((_ref = this.__iframe) != null) {
            _ref.off('load error').remove();
          }
          if ((_ref1 = this.__iframeForm) != null) {
            _ref1.remove();
          }
          this.__iframe = null;
          return this.__iframeForm = null;
        };

        return InputFile;

      })(ns.BaseFile);
    });
  });

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  uploadcare.whenReady(function() {
    var $, debug, namespace, pusher, utils;
    namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils, debug = uploadcare.debug;
    pusher = uploadcare.utils.pusher;
    return namespace('uploadcare.files', function(ns) {
      var PollWatcher, PusherWatcher;
      ns.UrlFile = (function(_super) {

        __extends(UrlFile, _super);

        function UrlFile(settings, __url) {
          this.__url = __url;
          UrlFile.__super__.constructor.apply(this, arguments);
          this.__shutdown = true;
          this.previewUrl = this.__url;
          this.__tmpFinalPreviewUrl = this.__url;
          this.fileName = utils.parseUrl(this.__url).pathname.split('/').pop() || null;
        }

        UrlFile.prototype.__startUpload = function() {
          var fail,
            _this = this;
          this.__pollWatcher = new PollWatcher(this, this.settings);
          this.__pusherWatcher = new PusherWatcher(this, this.settings);
          this.__state('start');
          fail = function() {
            return _this.__state('error');
          };
          $.ajax("" + this.settings.urlBase + "/from_url/", {
            data: {
              pub_key: this.settings.publicKey,
              source_url: this.__url
            },
            dataType: 'jsonp'
          }).fail(fail).done(function(data) {
            if (data.error) {
              return fail();
            }
            _this.__token = data.token;
            _this.__pollWatcher.watch(_this.__token);
            _this.__pusherWatcher.watch(_this.__token);
            return $(_this.__pusherWatcher).on('started', function() {
              return _this.__pollWatcher.stopWatching();
            });
          });
          this.__uploadDf.always(function() {
            _this.__shutdown = true;
            _this.__pusherWatcher.stopWatching();
            return _this.__pollWatcher.stopWatching();
          });
          return this.__uploadDf.promise();
        };

        UrlFile.prototype.__state = function(state, data) {
          var _this = this;
          return {
            start: function() {
              return _this.__shutdown = false;
            },
            progress: function(data) {
              if (_this.__shutdown) {
                return;
              }
              _this.fileSize = data.total;
              return _this.__uploadDf.notify(data.total / data.done, _this);
            },
            success: function(data) {
              var _ref;
              if (_this.__shutdown) {
                return;
              }
              _this.__state('progress', data);
              _ref = [data.original_filename, data.file_id], _this.fileName = _ref[0], _this.fileId = _ref[1];
              return _this.__uploadDf.resolve(_this);
            },
            error: function() {
              return _this.__uploadDf.reject('upload', _this);
            }
          }[state](data);
        };

        return UrlFile;

      })(ns.BaseFile);
      PusherWatcher = (function() {

        function PusherWatcher(uploader, settings) {
          this.uploader = uploader;
          this.settings = settings;
          this.pusher = pusher.getPusher(this.settings.pusherKey, 'url-upload');
        }

        PusherWatcher.prototype.watch = function(token) {
          var ev, onStarted, _fn, _i, _len, _ref,
            _this = this;
          this.token = token;
          debug('started url watching with pusher');
          this.channel = this.pusher.subscribe("task-status-" + this.token);
          onStarted = function() {
            var ev, _i, _len, _ref, _results;
            $(_this).trigger('started');
            _ref = ['progress', 'success'];
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              ev = _ref[_i];
              _results.push(_this.channel.unbind(ev, onStarted));
            }
            return _results;
          };
          _ref = ['progress', 'success'];
          _fn = function(ev) {
            _this.channel.bind(ev, onStarted);
            return _this.channel.bind(ev, function(data) {
              return _this.uploader.__state(ev, data);
            });
          };
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            ev = _ref[_i];
            _fn(ev);
          }
          return this.channel.bind('fail', function(data) {
            return _this.uploader.__state('error');
          });
        };

        PusherWatcher.prototype.stopWatching = function() {
          if (this.pusher) {
            this.pusher.release();
          }
          return this.pusher = null;
        };

        return PusherWatcher;

      })();
      return PollWatcher = (function() {

        function PollWatcher(uploader, settings) {
          this.uploader = uploader;
          this.settings = settings;
        }

        PollWatcher.prototype.watch = function(token) {
          var _this = this;
          this.token = token;
          return this.interval = setInterval(function() {
            return _this.__checkStatus(function(data) {
              var _ref;
              if ((_ref = data.status) === 'progress' || _ref === 'success' || _ref === 'error') {
                return _this.uploader.__state(data.status, data);
              }
            });
          }, 250);
        };

        PollWatcher.prototype.stopWatching = function() {
          if (this.interval) {
            clearInterval(this.interval);
          }
          return this.interval = null;
        };

        PollWatcher.prototype.__error = function() {
          this.stopWatching();
          return this.uploader.__state('error');
        };

        PollWatcher.prototype.__checkStatus = function(callback) {
          var fail,
            _this = this;
          fail = function() {
            return _this.__error();
          };
          return $.ajax("" + this.settings.urlBase + "/status/", {
            data: {
              'token': this.token
            },
            dataType: 'jsonp'
          }).fail(fail).done(function(data) {
            if (data.error) {
              return fail();
            }
            return callback(data);
          });
        };

        return PollWatcher;

      })();
    });
  });

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  uploadcare.whenReady(function() {
    var $, namespace, utils;
    namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils;
    return namespace('uploadcare.files', function(ns) {
      return ns.UploadedFile = (function(_super) {

        __extends(UploadedFile, _super);

        function UploadedFile(settings, fileIdOrUrl) {
          var id, modifiers;
          UploadedFile.__super__.constructor.apply(this, arguments);
          id = utils.uuidRegex.exec(fileIdOrUrl);
          if (id) {
            this.fileId = id[0];
            modifiers = utils.cdnUrlModifiersRegex.exec(fileIdOrUrl);
            if (modifiers) {
              this.updateCdnUrlModifiers(modifiers[0]);
            }
            this.__buildPreviewUrl();
            this.__uploadDf.resolve(this);
          } else {
            this.__uploadDf.reject('baddata', this);
          }
        }

        UploadedFile.prototype.__startUpload = function() {};

        return UploadedFile;

      })(ns.BaseFile);
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, f, namespace, utils;
    namespace = uploadcare.namespace, utils = uploadcare.utils, $ = uploadcare.jQuery, f = uploadcare.files;
    return namespace('uploadcare', function(ns) {
      var converters;
      ns.fileFrom = function(settings, type, data) {
        return converters[type](settings, data);
      };
      return converters = {
        event: function(settings, e) {
          var files;
          if (utils.abilities.canFileAPI()) {
            files = e.type === 'drop' ? e.originalEvent.dataTransfer.files : e.target.files;
            return new f.EventFile(settings, files[0]);
          } else {
            return this.input(settings, e.target);
          }
        },
        input: function(settings, input) {
          return new f.InputFile(settings, input);
        },
        url: function(settings, url) {
          return new f.UrlFile(settings, url);
        },
        uploaded: function(settings, fileIdOrUrl) {
          return new f.UploadedFile(settings, fileIdOrUrl);
        }
      };
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, namespace, utils;
    namespace = uploadcare.namespace, utils = uploadcare.utils, $ = uploadcare.jQuery;
    return namespace('uploadcare.widget.dragdrop', function(ns) {
      var active, delayedDragState, noFileAPI, offDelay, onDelay, __dragState,
        _this = this;
      noFileAPI = utils.abilities.canFileAPI() ? false : function() {};
      ns.receiveDrop = noFileAPI || function(upload, el) {
        return $(el).on('dragover', function(e) {
          e.stopPropagation();
          e.preventDefault();
          e.originalEvent.dataTransfer.dropEffect = 'copy';
          return false;
        }).on('drop', function(e) {
          var dt, uris;
          e.stopPropagation();
          e.preventDefault();
          delayedDragState(false, 0);
          dt = e.originalEvent.dataTransfer;
          if (dt.files.length) {
            upload('event', e);
          } else {
            uris = dt.getData('text/uri-list');
            if (uris) {
              uris = uris.replace(/\n$/, '');
              upload('url', uris);
            }
          }
          return false;
        });
      };
      onDelay = 0;
      offDelay = $.browser.opera ? 200 : 1;
      active = false;
      $(window).on('mouseenter dragend', function() {
        return delayedDragState(false, offDelay);
      });
      $('body').on('dragenter', function(e) {
        return delayedDragState(true, onDelay);
      });
      $('body').on('dragleave', function(e) {
        if (e.target !== e.currentTarget) {
          return;
        }
        return delayedDragState(false, offDelay);
      });
      delayedDragState = function(newActive, delay) {
        if (delayedDragState.timeout != null) {
          clearTimeout(delayedDragState.timeout);
          delayedDragState.timeout = null;
        }
        if (delay > 0) {
          return delayedDragState.timeout = setTimeout((function() {
            return __dragState(newActive);
          }), delay);
        } else {
          return __dragState(newActive);
        }
      };
      return __dragState = function(newActive) {
        if (active !== newActive) {
          active = newActive;
          return $('@uploadcare-drop-area').trigger('dragstatechange.uploadcare', active);
        }
      };
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, files, namespace, tpl;
    namespace = uploadcare.namespace, files = uploadcare.files, $ = uploadcare.jQuery;
    tpl = uploadcare.templates.tpl;
    return namespace('uploadcare.ui.progress', function(ns) {
      return ns.Circle = (function() {

        function Circle(element) {
          this.element = element;
          this.element = $(this.element);
          this.element.append(tpl('circle'));
          this.pie = this.element.find('@uploadcare-widget-status');
          this.element.addClass('uploadcare-widget-circle');
          this.size = Math.min(this.element.width(), this.element.height());
          this.pie.width(this.size).height(this.size);
          this.color = this.__getSegmentColor();
          this.angleOffset = -90;
          this.raphael = this.__initRaphael();
          this.path = this.raphael.path();
          this.path.attr({
            segment: 0,
            stroke: false
          });
          this.fullDelay = 500;
          this.__update(0, true);
          this.observed = null;
        }

        Circle.prototype.listen = function(uploadDeferred) {
          var _this = this;
          this.reset();
          uploadDeferred = uploadDeferred.promise();
          this.observed = uploadDeferred;
          return this.observed.progress(function(progress) {
            if (uploadDeferred === _this.observed) {
              return _this.__update(progress);
            }
          }).done(function(uploadedFile) {
            if (uploadDeferred === _this.observed) {
              return _this.__update(1, false);
            }
          });
        };

        Circle.prototype.reset = function(filled) {
          if (filled == null) {
            filled = false;
          }
          this.observed = null;
          return this.__update((filled ? 100 : 0), true);
        };

        Circle.prototype.__update = function(val, instant) {
          var delay,
            _this = this;
          if (instant == null) {
            instant = false;
          }
          if (val > 1) {
            val = 1;
          }
          delay = this.fullDelay * Math.abs(val - this.value);
          this.value = val;
          if (instant) {
            return this.path.attr({
              segment: this.__segmentVal(this.value)
            });
          } else {
            return (function(value) {
              return _this.path.animate({
                segment: _this.__segmentVal(value)
              }, delay, 'linear', function() {
                if (_this.value !== value) {
                  return _this.__update(_this.value, true);
                }
              });
            })(this.value);
          }
        };

        Circle.prototype.__segmentVal = function(value) {
          return 360 * (value < 1 ? value : 0.99999999);
        };

        Circle.prototype.__getSegmentColor = function() {
          var color;
          this.pie.addClass('uploadcare-widget-circle-active');
          color = this.pie.css('background-color');
          this.pie.removeClass('uploadcare-widget-circle-active');
          return color;
        };

        Circle.prototype.__initRaphael = function() {
          var angleOffset, color, raphael, size;
          raphael = uploadcare.Raphael(this.pie.get(0), this.size, this.size);
          color = this.color;
          size = this.size;
          angleOffset = this.angleOffset;
          raphael.customAttributes.segment = function(angle) {
            var a1, a2, flag, r, x, y;
            x = size / 2;
            y = size / 2;
            r = size / 2;
            a1 = 0;
            a2 = angle;
            a1 += angleOffset;
            a2 += angleOffset;
            flag = (a2 - a1) > 180;
            a1 = (a1 % 360) * Math.PI / 180;
            a2 -= 0.00001;
            a2 = (a2 % 360) * Math.PI / 180;
            return {
              path: [["M", x, y], ["l", r * Math.cos(a1), r * Math.sin(a1)], ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)], ["z"]],
              fill: color
            };
          };
          return raphael;
        };

        return Circle;

      })();
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, namespace, progress, t, tpl, utils, _ref;
    namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils, (_ref = uploadcare.ui, progress = _ref.progress);
    t = uploadcare.locale.t;
    tpl = uploadcare.templates.tpl;
    return namespace('uploadcare.widget', function(ns) {
      return ns.Template = (function() {

        function Template(settings, element) {
          this.settings = settings;
          this.element = element;
          this.content = $(tpl('widget'));
          this.content.css('display', 'none');
          this.element.after(this.content);
          this.circle = new progress.Circle(this.content.find('@uploadcare-widget-status'));
          this.statusText = this.content.find('@uploadcare-widget-status-text');
          this.buttonsContainer = this.content.find('@uploadcare-widget-buttons');
          this.dropArea = this.content.find('@uploadcare-drop-area');
          this.labels = [];
        }

        Template.prototype.pushLabel = function(label) {
          this.labels.push(this.statusText.text());
          return this.statusText.text(label);
        };

        Template.prototype.popLabel = function() {
          return this.statusText.text(this.labels.pop());
        };

        Template.prototype.addState = function(state) {
          return this.content.addClass("uploadcare-widget-state-" + state);
        };

        Template.prototype.removeState = function(state) {
          return this.content.removeClass("uploadcare-widget-state-" + state);
        };

        Template.prototype.addButton = function(name, caption) {
          var li;
          if (caption == null) {
            caption = '';
          }
          li = $(tpl('widget-button', {
            name: name,
            caption: caption
          }));
          this.buttonsContainer.append(li);
          return li;
        };

        Template.prototype.setStatus = function(status) {
          var form;
          this.content.attr('data-status', status);
          form = this.element.closest('@uploadcare-upload-form');
          return form.trigger("" + status + ".uploadcare");
        };

        Template.prototype.reset = function() {
          this.statusText.text(t('ready'));
          this.circle.reset();
          return this.setStatus('ready');
        };

        Template.prototype.loaded = function() {
          this.setStatus('loaded');
          return this.circle.reset(true);
        };

        Template.prototype.listen = function(uploadDeferred) {
          return this.circle.listen(uploadDeferred);
        };

        Template.prototype.error = function(type) {
          this.statusText.text(t("errors." + (type || 'default')));
          this.circle.reset();
          return this.setStatus('error');
        };

        Template.prototype.started = function() {
          this.statusText.text(t('uploading'));
          return this.setStatus('started');
        };

        Template.prototype.setFileInfo = function(file) {
          var name, size;
          name = utils.fitText(file.fileName, 16);
          size = Math.ceil(file.fileSize / 1024).toString();
          return this.statusText.html(tpl('widget-file-name', {
            name: name,
            size: size
          }));
        };

        return Template;

      })();
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, files, namespace, t, tpl, utils;
    namespace = uploadcare.namespace, utils = uploadcare.utils, files = uploadcare.files, $ = uploadcare.jQuery;
    t = uploadcare.locale.t;
    tpl = uploadcare.templates.tpl;
    return namespace('uploadcare', function(ns) {
      var Dialog, currentDialogPr;
      currentDialogPr = null;
      ns.isDialogOpened = function() {
        return currentDialogPr !== null;
      };
      ns.closeDialog = function() {
        return currentDialogPr != null ? currentDialogPr.reject() : void 0;
      };
      ns.openDialog = function(settings, currentFile, tab) {
        var dialog;
        if (settings == null) {
          settings = {};
        }
        if (currentFile == null) {
          currentFile = null;
        }
        ns.closeDialog();
        settings = utils.buildSettings(settings);
        dialog = new Dialog(settings, currentFile, tab);
        return currentDialogPr = dialog.publicPromise().always(function() {
          return currentDialogPr = null;
        });
      };
      return Dialog = (function() {

        function Dialog(settings, currentFile, tab) {
          var _this = this;
          this.settings = settings;
          this.dfd = $.Deferred();
          this.dfd.always(function() {
            return _this.__closeDialog();
          });
          this.content = $(tpl('dialog')).hide().appendTo('body');
          this["__bind"]();
          this.__prepareTabs();
          this.switchTab(tab || this.settings.tabs[0]);
          this.__setFile(currentFile);
          this.__updateFirstTab();
          this.content.fadeIn('fast');
        }

        Dialog.prototype.publicPromise = function() {
          var promise;
          promise = this.dfd.promise();
          promise.reject = this.dfd.reject;
          return promise;
        };

        Dialog.prototype["__bind"] = function() {
          var reject,
            _this = this;
          reject = function() {
            return _this.dfd.reject(_this.currentFile);
          };
          this.content.on('click', function(e) {
            if (!($(e.target).is('a, .uploadcare-dialog-panel') || $(e.target).parents('.uploadcare-dialog-panel').size())) {
              return reject();
            }
          });
          $(window).on('keydown', function(e) {
            if (e.which === 27) {
              return reject();
            }
          });
          return this.content.on('click', '@uploadcare-dialog-switch-tab', function(e) {
            return _this.switchTab($(e.target).data('tab'));
          });
        };

        Dialog.prototype.__prepareTabs = function() {
          var tabName, _i, _len, _ref, _results,
            _this = this;
          this.tabs = {};
          this.tabs.preview = this.addTab('preview');
          this.tabs.preview.onDone.add(function() {
            return _this.dfd.resolve(_this.currentFile);
          });
          this.tabs.preview.onBack.add(function() {
            return _this.__setFile(null);
          });
          _ref = this.settings.tabs;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            tabName = _ref[_i];
            if (!(!(tabName in this.tabs))) {
              continue;
            }
            this.tabs[tabName] = this.addTab(tabName);
            if (this.tabs[tabName]) {
              _results.push(this.tabs[tabName].onSelected.add(function(fileType, data) {
                return _this.__setFile(ns.fileFrom(_this.settings, fileType, data));
              }));
            } else {
              throw new Error("No such tab: " + tabName);
            }
          }
          return _results;
        };

        Dialog.prototype.__closeDialog = function() {
          var _this = this;
          return this.content.fadeOut('fast', function() {
            return _this.content.off().remove();
          });
        };

        Dialog.prototype.__setFile = function(currentFile) {
          this.currentFile = currentFile;
          if (this.currentFile) {
            this.currentFile.startUpload();
            this.tabs.preview.setFile(this.currentFile);
            this.__showTab('preview');
            return this.switchTab('preview');
          } else {
            return this.__hideTab('preview');
          }
        };

        Dialog.prototype.addTab = function(name) {
          var tab, tabCls, tabs,
            _this = this;
          tabs = uploadcare.widget.tabs;
          tabCls = (function() {
            switch (name) {
              case 'file':
                return tabs.FileTab;
              case 'url':
                return tabs.UrlTab;
              case 'facebook':
                return tabs.RemoteTabFor('facebook');
              case 'dropbox':
                return tabs.RemoteTabFor('dropbox');
              case 'gdrive':
                return tabs.RemoteTabFor('gdrive');
              case 'instagram':
                return tabs.RemoteTabFor('instagram');
              case 'preview':
                return tabs.PreviewTab;
            }
          })();
          if (!tabCls) {
            return false;
          }
          tab = new tabCls(this.dfd.promise(), this.settings);
          $('<div>').addClass("uploadcare-dialog-tab uploadcare-dialog-tab-" + name).attr('title', t("tabs." + name + ".title")).on('click', function() {
            return _this.switchTab(name);
          }).appendTo(this.content.find('.uploadcare-dialog-tabs'));
          tab.setContent($('<div>').hide().addClass('uploadcare-dialog-tabs-panel').addClass("uploadcare-dialog-tabs-panel-" + name).append(tpl("tab-" + name, {
            avalibleTabs: this.settings.tabs
          })).appendTo(this.content.find('.uploadcare-dialog-body')));
          return tab;
        };

        Dialog.prototype.switchTab = function(currentTab) {
          this.currentTab = currentTab;
          this.content.find('.uploadcare-dialog-body').find('.uploadcare-dialog-selected-tab').removeClass('uploadcare-dialog-selected-tab').end().find(".uploadcare-dialog-tab-" + this.currentTab).addClass('uploadcare-dialog-selected-tab').end().find('.uploadcare-dialog-tabs-panel').hide().filter(".uploadcare-dialog-tabs-panel-" + this.currentTab).show();
          return this.dfd.notify(this.currentTab);
        };

        Dialog.prototype.__updateFirstTab = function() {
          var className;
          className = 'uploadcare-dialog-first-tab';
          this.content.find("." + className).removeClass(className);
          return this.content.find(".uploadcare-dialog-tab").filter(function() {
            return $(this).css('display') !== 'none';
          }).first().addClass(className);
        };

        Dialog.prototype.__showTab = function(tab) {
          this.content.find(".uploadcare-dialog-tab-" + tab).show();
          return this.__updateFirstTab();
        };

        Dialog.prototype.__hideTab = function(tab) {
          if (this.currentTab === tab) {
            this.switchTab(this.settings.tabs[0]);
          }
          this.content.find(".uploadcare-dialog-tab-" + tab).hide();
          return this.__updateFirstTab();
        };

        return Dialog;

      })();
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, namespace;
    namespace = uploadcare.namespace, $ = uploadcare.jQuery;
    return namespace('uploadcare.widget.tabs', function(ns) {
      return ns.BaseFileTab = (function() {

        function BaseFileTab(dialog, settings) {
          this.dialog = dialog;
          this.settings = settings;
          this.onSelected = $.Callbacks();
        }

        BaseFileTab.prototype.setContent = function(content) {
          throw new Error('not implemented');
        };

        return BaseFileTab;

      })();
    });
  });

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  uploadcare.whenReady(function() {
    var $, dragdrop, namespace, utils;
    namespace = uploadcare.namespace, utils = uploadcare.utils, $ = uploadcare.jQuery;
    dragdrop = uploadcare.widget.dragdrop;
    return namespace('uploadcare.widget.tabs', function(ns) {
      return ns.FileTab = (function(_super) {

        __extends(FileTab, _super);

        function FileTab() {
          return FileTab.__super__.constructor.apply(this, arguments);
        }

        FileTab.prototype.setContent = function(content) {
          this.content = content;
          this.__setupFileButton();
          return dragdrop.receiveDrop(this.onSelected.fire, this.content.find('@uploadcare-drop-area'));
        };

        FileTab.prototype.__setupFileButton = function() {
          var fileButton,
            _this = this;
          fileButton = this.content.find('@uploadcare-dialog-browse-file');
          return utils.fileInput(fileButton, this.settings.multiple, function(e) {
            return _this.onSelected.fire('event', e);
          });
        };

        return FileTab;

      })(ns.BaseFileTab);
    });
  });

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  uploadcare.whenReady(function() {
    var $, namespace, t;
    namespace = uploadcare.namespace, $ = uploadcare.jQuery;
    t = uploadcare.locale.t;
    return namespace('uploadcare.widget.tabs', function(ns) {
      return ns.UrlTab = (function(_super) {

        __extends(UrlTab, _super);

        function UrlTab() {
          return UrlTab.__super__.constructor.apply(this, arguments);
        }

        UrlTab.prototype.setContent = function(content) {
          var button, input,
            _this = this;
          this.content = content;
          input = this.content.find('@uploadcare-dialog-url-input');
          input.on('change keyup input', function() {
            return button.attr('disabled', !$(this).val());
          });
          button = this.content.find('@uploadcare-dialog-url-submit').attr('disabled', true);
          return this.content.find('@uploadcare-dialog-url-form').on('submit', function() {
            var url;
            url = input.val();
            _this.onSelected.fire('url', url);
            return false;
          });
        };

        return UrlTab;

      })(ns.BaseFileTab);
    });
  });

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  uploadcare.whenReady(function() {
    var $, locale, namespace, utils;
    namespace = uploadcare.namespace, locale = uploadcare.locale, utils = uploadcare.utils, $ = uploadcare.jQuery;
    return namespace('uploadcare.widget.tabs', function(ns) {
      return ns.RemoteTabFor = function(service) {
        var RemoteTab;
        return RemoteTab = (function(_super) {

          __extends(RemoteTab, _super);

          function RemoteTab() {
            return RemoteTab.__super__.constructor.apply(this, arguments);
          }

          RemoteTab.prototype.setContent = function(content) {
            var _this = this;
            this.content = content;
            this.dialog.progress(function(tab) {
              if (tab === service) {
                return _this.createIframe();
              }
            });
            return this.dialog.fail(function() {
              return _this.cleanup();
            });
          };

          RemoteTab.prototype.createIframe = function() {
            var src;
            if (!this.iframe) {
              this.windowId = utils.uuid();
              this.createWatcher();
              src = ("" + this.settings.socialBase + "/window/" + this.windowId + "/") + ("" + service + "?lang=" + locale.lang + "&public_key=" + this.settings.publicKey) + ("&widget_version=" + (encodeURIComponent(uploadcare.version)));
              return this.iframe = $('<iframe>').attr('src', src).css({
                width: '100%',
                height: '100%',
                border: 0
              }).appendTo(this.content);
            }
          };

          RemoteTab.prototype.createWatcher = function() {
            var _this = this;
            if (!this.watcher) {
              this.watcher = new utils.pubsub.PubSub(this.settings, 'window', this.windowId);
              $(this.watcher).on('done', function(e, state) {
                _this.cleanup();
                return _this.onSelected.fire('url', state.url);
              });
              return this.watcher.watch();
            }
          };

          RemoteTab.prototype.cleanup = function() {
            var _ref, _ref1;
            if ((_ref = this.watcher) != null) {
              _ref.stop();
            }
            this.watcher = null;
            if ((_ref1 = this.iframe) != null) {
              _ref1.remove();
            }
            return this.iframe = null;
          };

          return RemoteTab;

        })(ns.BaseFileTab);
      };
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, CropWidget, namespace, progress, tpl, utils, _ref, _ref1, _ref2;
    namespace = uploadcare.namespace, utils = uploadcare.utils, (_ref = uploadcare.ui, progress = _ref.progress), (_ref1 = uploadcare.templates, tpl = _ref1.tpl), $ = uploadcare.jQuery, (_ref2 = uploadcare.crop, CropWidget = _ref2.CropWidget);
    return namespace('uploadcare.widget.tabs', function(ns) {
      return ns.PreviewTab = (function() {
        var PREFIX;

        PREFIX = '@uploadcare-dialog-preview-';

        function PreviewTab(dialog, settings) {
          this.dialog = dialog;
          this.settings = settings;
          this.onDone = $.Callbacks();
          this.onBack = $.Callbacks();
          this.__doCrop = this.settings.__cropParsed.enabled;
        }

        PreviewTab.prototype.setContent = function(content) {
          var notDisabled;
          this.content = content;
          notDisabled = ':not(.uploadcare-disabled-el)';
          this.content.on('click', PREFIX + 'back' + notDisabled, this.onBack.fire);
          return this.content.on('click', PREFIX + 'done' + notDisabled, this.onDone.fire);
        };

        PreviewTab.prototype.setFile = function(file) {
          var _this = this;
          this.file = file;
          this.__setState('unknown');
          return this.file.info().done(function(file) {
            if (file === _this.file) {
              if (_this.file.isImage) {
                return _this.__setState('image');
              } else {
                return _this.__setState('regular');
              }
            }
          }).fail(function(error, file) {
            if (file === _this.file) {
              return _this.__setState('error', {
                error: error
              });
            }
          });
        };

        PreviewTab.prototype.__setState = function(state, data) {
          data = $.extend({
            file: this.file
          }, data);
          this.content.empty().append(tpl("tab-preview-" + state, data));
          return this.__afterRender(state);
        };

        PreviewTab.prototype.__afterRender = function(state) {
          if (state === 'unknown') {
            this.__initCircle();
            if (this.__doCrop) {
              this.__hideDoneButton();
            }
          }
          if (state === 'image' && this.__doCrop) {
            return this.__initCrop();
          }
        };

        PreviewTab.prototype.__hideDoneButton = function() {
          return this.content.find(PREFIX + 'done').hide();
        };

        PreviewTab.prototype.__initCrop = function() {
          var _this = this;
          return setTimeout((function() {
            var container, doneButton, img, widget;
            img = _this.content.find(PREFIX + 'image');
            container = img.parent();
            doneButton = _this.content.find(PREFIX + 'done');
            widget = new CropWidget($.extend({}, _this.settings.__cropParsed, {
              container: container,
              controls: false
            }));
            img.remove();
            widget.croppedImageModifiers(img.attr('src'), _this.file.cdnUrlModifiers).done(function(modifiers) {
              return _this.file.updateCdnUrlModifiers(modifiers);
            });
            doneButton.addClass('uploadcare-disabled-el');
            return widget.onStateChange.add(function(state) {
              if (state === 'loaded') {
                return doneButton.removeClass('uploadcare-disabled-el').click(function() {
                  return widget.forceDone();
                });
              }
            });
          }), 100);
        };

        PreviewTab.prototype.__initCircle = function() {
          var circle, circleEl;
          circleEl = this.content.find('@uploadcare-dialog-preview-circle');
          if (circleEl.length) {
            circle = new progress.Circle(circleEl);
            return circle.listen(this.file.startUpload());
          }
        };

        return PreviewTab;

      })();
    });
  });

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  uploadcare.whenReady(function() {
    var $, files, namespace, t, uploads, utils;
    namespace = uploadcare.namespace, utils = uploadcare.utils, uploads = uploadcare.uploads, files = uploadcare.files, $ = uploadcare.jQuery;
    t = uploadcare.locale.t;
    return namespace('uploadcare.widget', function(ns) {
      return ns.Widget = (function() {

        function Widget(element) {
          this.__openDialogWithFile = __bind(this.__openDialogWithFile, this);

          this.__fail = __bind(this.__fail, this);

          this.reloadInfo = __bind(this.reloadInfo, this);

          this.__setFile = __bind(this.__setFile, this);

          this.__reset = __bind(this.__reset, this);

          var _this = this;
          this.element = $(element);
          this.settings = utils.buildSettings(this.element.data());
          this.__setupWidget();
          this.currentFile = null;
          this.template.reset();
          this.__skipChange = 0;
          this.element.on('change.uploadcare', function() {
            if (_this.__skipChange === 0) {
              return _this.reloadInfo();
            } else {
              return _this.__skipChange--;
            }
          });
          this.reloadInfo();
        }

        Widget.prototype.__reset = function(keepValue) {
          var _ref, _ref1;
          if (keepValue == null) {
            keepValue = false;
          }
          if ((_ref = this.currentFile) != null) {
            if ((_ref1 = _ref.upload) != null) {
              _ref1.reject();
            }
          }
          this.currentFile = null;
          this.template.reset();
          if (!keepValue) {
            return this.__setValue('');
          }
        };

        Widget.prototype.__setFile = function(newFile, keepValue) {
          var _this = this;
          if (keepValue == null) {
            keepValue = false;
          }
          if (newFile === this.currentFile) {
            if (newFile) {
              if (!keepValue) {
                this.__updateValue();
              }
            }
            return;
          }
          this.__reset(keepValue);
          if (newFile) {
            this.currentFile = newFile;
            this.template.started();
            this.currentFile.startUpload();
            this.template.listen(this.currentFile.upload);
            this.currentFile.info().fail(function(error, file) {
              if (file === _this.currentFile) {
                return _this.__fail(error);
              }
            }).done(function(file) {
              if (file === _this.currentFile) {
                _this.template.setFileInfo(file);
                return _this.template.loaded();
              }
            });
            if (!keepValue) {
              return this.__updateValue();
            }
          }
        };

        Widget.prototype.__updateValue = function() {
          var _this = this;
          return this.currentFile.info().done(function(file) {
            if (file === _this.currentFile) {
              if (file.cdnUrlModifiers) {
                return _this.__setValue(file.cdnUrl);
              } else {
                return _this.__setValue(file.fileId);
              }
            }
          });
        };

        Widget.prototype.__setValue = function(value) {
          this.__skipChange++;
          return this.setValue(value);
        };

        Widget.prototype.setValue = function(value) {
          return this.element.val(value).change();
        };

        Widget.prototype.reloadInfo = function() {
          var file;
          if (this.element.val()) {
            file = uploadcare.fileFrom(this.settings, 'uploaded', this.element.val());
            return this.__setFile(file, true);
          } else {
            return this.__reset();
          }
        };

        Widget.prototype.__fail = function(error) {
          this.__reset();
          return this.template.error(error);
        };

        Widget.prototype.__setupWidget = function() {
          var dialogButton, fileButton,
            _this = this;
          this.template = new ns.Template(this.settings, this.element);
          this.template.addButton('cancel', t('buttons.cancel')).on('click', function() {
            return _this.__reset();
          });
          this.template.addButton('remove', t('buttons.remove')).on('click', function() {
            return _this.__reset();
          });
          if (this.settings.tabs.length > 0) {
            if (__indexOf.call(this.settings.tabs, 'file') >= 0) {
              fileButton = this.template.addButton('file');
              fileButton.on('click', function() {
                return _this.openDialog('file');
              });
            }
            dialogButton = this.template.addButton('dialog');
            dialogButton.on('click', function() {
              return _this.openDialog();
            });
          }
          ns.dragdrop.receiveDrop(this.__openDialogWithFile, this.template.dropArea);
          this.template.dropArea.on('dragstatechange.uploadcare', function(e, active) {
            if (!(active && uploadcare.isDialogOpened())) {
              return _this.template.dropArea.toggleClass('uploadcare-dragging', active);
            }
          });
          return this.template.content.on('click', '@uploadcare-widget-file-name', function() {
            return _this.openDialog();
          });
        };

        Widget.prototype.__openDialogWithFile = function(type, data) {
          var file;
          file = uploadcare.fileFrom(this.settings, type, data);
          return uploadcare.openDialog(this.settings, file).done(this.__setFile);
        };

        Widget.prototype.openDialog = function(tab) {
          var _this = this;
          return uploadcare.openDialog(this.settings, this.currentFile, tab).done(this.__setFile).fail(function(file) {
            if (file !== _this.currentFile) {
              return _this.__setFile(null);
            }
          });
        };

        return Widget;

      })();
    });
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, cleanup, dataAttr, initializeWidget, live;
    $ = uploadcare.jQuery;
    dataAttr = 'uploadcareWidget';
    uploadcare.initialize = function(targets) {
      var el, target, _i, _len, _ref;
      _ref = $(targets || '@uploadcare-uploader');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        target = _ref[_i];
        el = $(target);
        initializeWidget(el);
      }
    };
    initializeWidget = function(el) {
      var widget;
      widget = el.data(dataAttr);
      if (!widget || el[0] !== widget.element[0]) {
        cleanup(el);
        widget = new uploadcare.widget.Widget(el);
        el.data(dataAttr, widget);
        widget.template.content.data(dataAttr, widget.template);
      }
      return widget;
    };
    cleanup = function(el) {
      var template;
      el.off('.uploadcare');
      el = el.next('.uploadcare-widget');
      template = el.data(dataAttr);
      if (el.length && (!template || el[0] !== template.content[0])) {
        return el.remove();
      }
    };
    live = function() {
      return uploadcare.initialize();
    };
    if (uploadcare.defaults.live) {
      return $(function() {
        return setInterval(live, 100);
      });
    } else {
      return $(live);
    }
  });

}).call(this);
(function() {

  uploadcare.whenReady(function() {
    var $, canSubmit, cancelEvents, submitPreventionState, submittedForm;
    $ = uploadcare.jQuery;
    canSubmit = function(form) {
      var notSubmittable;
      notSubmittable = '[data-status=started], [data-status=error]';
      return !form.find('.uploadcare-widget').is(notSubmittable);
    };
    submitPreventionState = function(form, prevent) {
      form.attr('data-uploadcare-submitted', prevent);
      return form.find(':submit').attr('disabled', prevent);
    };
    $(document).on('submit', '@uploadcare-upload-form', function() {
      var form;
      form = $(this);
      if (canSubmit(form)) {
        return true;
      } else {
        submitPreventionState(form, true);
        return false;
      }
    });
    submittedForm = '@uploadcare-upload-form[data-uploadcare-submitted]';
    $(document).on('loaded.uploadcare', submittedForm, function() {
      return $(this).submit();
    });
    cancelEvents = 'ready.uploadcare error.uploadcare';
    return $(document).on(cancelEvents, submittedForm, function() {
      var form;
      form = $(this);
      if (canSubmit(form)) {
        return submitPreventionState(form, false);
      }
    });
  });

}).call(this);
(function() {
  var expose;

  uploadcare.version = '0.6.4.2';

  expose = uploadcare.expose;

  expose('whenReady');

  uploadcare.whenReady(function() {
    expose('defaults');
    expose('initialize');
    expose('fileFrom');
    expose('openDialog');
    return expose('Circle', uploadcare.ui.progress.Circle);
  });

}).call(this);
}({}));