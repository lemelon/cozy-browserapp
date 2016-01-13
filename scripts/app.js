var appConfig, routeObject;

appConfig = function($httpProvider, $routeProvider) {
  var path;
  for (path in routeObject) {
    console.log(path);
    $routeProvider.when(path, routeObject[path]);
  }
  $routeProvider.otherwise({
    redirectTo: '/'
  });
  console.log('app config');
};

angular.module('browserapp', ['ngResource', 'ngRoute']).config(appConfig);

routeObject = {
  '/': {
    templateUrl: 'partials/home.html',
    controller: 'HomeAngCtrl',
    controllerAs: 'home'
  }
};

appConfig.$inject = ['$httpProvider', '$routeProvider'];
;(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cozydb = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var CozyBackedModel, Model, client, cozyDataAdapter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  client = require('./utils/client');

  Model = require('./model');

  cozyDataAdapter = {
    find: function(id, callback) {
      return client.get("data/" + id + "/", function(error, response) {
        if (error) {
          return callback(error);
        } else if (response.statusCode === 404) {
          return callback(null, null);
        } else {
          return callback(null, response);
        }
      });
    },
    create: function(attributes, callback) {
      var path;
      path = "data/";
      if (attributes.id != null) {
        path += attributes.id + "/";
        delete attributes.id;
        return callback(new Error('cant create an object with a set id'));
      }
      return client.post(path, attributes, function(error, response) {
        if (error) {
          return callback(error);
        } else {
          response.id = response._id;
          return callback(null, response);
        }
      });
    }
  };

  module.exports = CozyBackedModel = (function(superClass) {
    extend(CozyBackedModel, superClass);

    function CozyBackedModel() {
      return CozyBackedModel.__super__.constructor.apply(this, arguments);
    }

    CozyBackedModel.adapter = cozyDataAdapter;

    CozyBackedModel.cast = function() {
      if (!this.__addedToSchema) {
        this.__addedToSchema = true;
        this.schema._id = String;
        this.schema._attachments = Object;
        this.schema._rev = String;
        this.schema.id = String;
        this.schema.docType = String;
      }
      return CozyBackedModel.__super__.constructor.cast.apply(this, arguments);
    };

    return CozyBackedModel;

  })(Model);

}).call(this);

},{"./model":3,"./utils/client":4}],2:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var CozyModel, Model, NoSchema,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  module.exports.Model = Model = require('./model');

  module.exports.CozyModel = CozyModel = require('./cozymodel');

  NoSchema = require('./utils/type_checking').NoSchema;

  module.exports.NoSchema = NoSchema;

  module.exports.getModel = function(name, schema) {
    var ClassFromGetModel, klass;
    window.parent.postMessage({
      action: 'getToken'
    }, '*');
    klass = ClassFromGetModel = (function(superClass) {
      extend(ClassFromGetModel, superClass);

      function ClassFromGetModel() {
        return ClassFromGetModel.__super__.constructor.apply(this, arguments);
      }

      ClassFromGetModel.schema = schema;

      return ClassFromGetModel;

    })(CozyModel);
    klass.displayName = klass.name = name;
    klass.toString = function() {
      return name + "Constructor";
    };
    klass.docType = name;
    return klass;
  };

}).call(this);

},{"./cozymodel":1,"./model":3,"./utils/type_checking":5}],3:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  var Model, castObject,
    hasProp = {}.hasOwnProperty;

  Model = (function() {
    Model.getDocType = function() {
      var ref;
      return ((ref = this.docType) != null ? ref.toLowerCase() : void 0) || this.name.toLowerCase();
    };

    Model.find = function(id, callback) {
      return this.adapter.find(id, (function(_this) {
        return function(err, attributes) {
          var ref;
          if (err) {
            return callback(err);
          } else if ((attributes != null ? (ref = attributes.docType) != null ? ref.toLowerCase() : void 0 : void 0) !== _this.getDocType()) {
            return callback(null, null);
          } else {
            return callback(null, new _this(attributes));
          }
        };
      })(this));
    };

    Model.create = function(data, callback) {
      data.docType = this.getDocType();
      data = this.cast(data);
      return this.adapter.create(data, (function(_this) {
        return function(err, attributes) {
          var k, v;
          if (err) {
            return callback(err);
          }
          for (k in attributes) {
            v = attributes[k];
            data[k] = v;
          }
          return callback(null, new _this(data));
        };
      })(this));
    };

    Model.cast = function(attributes, target) {
      if (target == null) {
        target = {};
      }
      return castObject(attributes, this.schema, target, this.name);
    };

    Model.defineRequest = function(name, request, callback) {
      var map, reduce;
      if (typeof request === "function" || typeof request === 'string') {
        map = request;
      } else {
        map = request.map;
        reduce = request.reduce;
      }
      return this.requestsAdapter.define.call(this, name, {
        map: map,
        reduce: reduce
      }, callback);
    };

    function Model(attributes) {
      if (attributes == null) {
        attributes = {};
      }
      this.constructor.cast(attributes, this);
      if (attributes._id) {
        if (this.id == null) {
          this.id = attributes._id;
        }
      }
      ({
        getAttributes: function() {
          var key, out, value;
          out = {};
          for (key in this) {
            if (!hasProp.call(this, key)) continue;
            value = this[key];
            out[key] = value;
          }
          return out;
        }
      });
    }

    Model.prototype.toJSON = function() {
      return this.getAttributes();
    };

    Model.prototype.toObject = function() {
      return this.getAttributes();
    };

    Model.prototype.toString = function() {
      return this.constructor.getDocType() + JSON.stringify(this.toJSON());
    };

    return Model;

  })();

  module.exports = Model;

  castObject = require('./utils/type_checking').castObject;

}).call(this);

},{"./utils/type_checking":5}],4:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
(function() {
  module.exports = {
    get: function(path, callback) {
      var xhr;
      xhr = new XMLHttpRequest;
      xhr.open('GET', '/ds-api/#{path}/', true);
      xhr.onload = function() {
        callback(null, xhr.response);
      };
      xhr.onerror = function(e) {
        var err;
        err = 'Request failed : #{e.target.status}';
        callback(err);
      };
      xhr.setRequestHeader('Content-Type', 'application/json');
      return xhr.send();
    },
    post: function(path, attributes, callback) {
      var location, xhr;
      location = window.location;
      xhr = new XMLHttpRequest;
      xhr.open('POST', "/ds-api/" + path, true);
      xhr.onload = function() {
        callback(null, xhr.response);
      };
      xhr.onerror = function(e) {
        var err;
        err = 'Request failed : #{e.target.status}';
        callback(err);
      };
      return window.addEventListener('message', (function(event) {
        var intent, requestHeader;
        intent = event.data;
        xhr.setRequestHeader('Content-Type', 'application/json');
        requestHeader = 'Basic ' + btoa(intent.appName + ":" + intent.token);
        xhr.setRequestHeader('Authorization', requestHeader);
        xhr.send(JSON.stringify(attributes));
      }), true);
    }
  };

}).call(this);

},{}],5:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.10.0
(function() {
  var Model, NoSchema, _default, _isArray, _isMap, _toString, castObject, castValue, ref, reportCastIgnore,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _toString = function(x) {
    return Object.prototype.toString.call(x);
  };

  _isArray = Array.isArray || function(x) {
    return '[object Array]' === _toString(x);
  };

  _isMap = function(x) {
    return '[object Object]' === _toString(x);
  };

  _default = function(value, defaultValue, lastDefault) {
    if (value !== void 0) {
      return value;
    } else if (defaultValue !== void 0) {
      return defaultValue;
    } else {
      return lastDefault;
    }
  };

  exports.NoSchema = NoSchema = {
    symbol: 'NoSchema'
  };

  exports.castValue = castValue = function(value, typeOrOptions) {
    var arrayType, defaultValue, i, item, key, len, out, pvalue, result, type;
    if (typeOrOptions.type) {
      type = typeOrOptions.type;
      defaultValue = typeOrOptions['default'];
    } else {
      type = typeOrOptions;
      defaultValue = void 0;
    }
    if (value === void 0 || value === null) {
      if (_isArray(type)) {
        return [];
      } else {
        return defaultValue;
      }
    }
    if (type === NoSchema) {
      out = value;
    } else if (type === Date) {
      value = _default(value, defaultValue, void 0);
      out = new Date(value);
    } else if (type === String) {
      value = _default(value, defaultValue, void 0);
      out = String(value);
    } else if (type === Boolean) {
      value = _default(value, defaultValue, void 0);
      out = Boolean(value);
    } else if (type === Number) {
      value = _default(value, defaultValue, void 0);
      out = Number(value);
    } else if (type === Object) {
      out = {};
      for (key in value) {
        if (!hasProp.call(value, key)) continue;
        pvalue = value[key];
        out[key] = pvalue;
      }
    } else if (type.prototype instanceof Model) {
      out = type.cast(value);
    } else if (_isArray(type)) {
      if (!type[0]) {
        throw WrongShemaError('empty array');
      }
      value = _default(value, defaultValue, []);
      arrayType = type[0];
      result = [];
      if ((value != null) && typeof value !== 'string') {
        for (i = 0, len = value.length; i < len; i++) {
          item = value[i];
          result.push(castValue(item, arrayType));
        }
      }
      return result;
    } else if (typeof type === 'function') {
      return type(value);
    } else {
      throw WrongShemaError("unsuported type ", type);
    }
    return out;
  };

  reportCastIgnore = ((ref = process.env.NODE_ENV) !== 'production' && ref !== 'test') || process.env.NO_CAST_WARNING;

  exports.castObject = castObject = function(raw, schema, target, name) {
    var handled, prop, typeOrOptions, value;
    if (target == null) {
      target = {};
    }
    handled = [];
    if (schema === NoSchema) {
      for (prop in raw) {
        value = raw[prop];
        target[prop] = value;
      }
      return target;
    }
    for (prop in schema) {
      if (!hasProp.call(schema, prop)) continue;
      typeOrOptions = schema[prop];
      target[prop] = castValue(raw[prop], typeOrOptions);
      if (reportCastIgnore) {
        handled.push(prop);
      }
    }
    if (reportCastIgnore) {
      for (prop in raw) {
        if (!hasProp.call(raw, prop)) continue;
        value = raw[prop];
        if (indexOf.call(handled, prop) < 0) {
          log.warn("Warning : cast ignored property '" + prop + "' on '" + name + "'");
        }
      }
      return target;
    }
  };

  Model = require('../model');

}).call(this);

}).call(this,require('_process'))
},{"../model":3,"_process":6}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[2])(2)
});
var HomeAngCtrl;

HomeAngCtrl = function($scope, $injector, $rootScope, $q) {
  var add, vm;
  vm = this;
  add = function(user) {
    var Contact;
    console.log('create contact');
    Contact = cozydb.getModel('Contact', {
      fn: String,
      n: String,
      org: String,
      title: String,
      department: String,
      bday: String,
      nickname: String,
      url: String,
      note: String
    });
    Contact.create(user, function(err, res) {
      if (err) {
        alert(err);
      } else {
        console.log('Contact.create');
        console.log(res);
        Contact.find(function(err, response) {
          console.log('//////////////////');
          console.log(response);
          console.log('//////////////////');
        });
        $scope.$apply(function() {
          $scope.contacts = res;
          vm.contacts = res;
        });
      }
    });
    console.log('END CONTACT');
  };
  vm.add = add;
};

angular.module('browserapp').controller('HomeAngCtrl', HomeAngCtrl);

HomeAngCtrl.$inject = ['$scope', '$injector', '$rootScope', '$q'];
;
//# sourceMappingURL=app.js.map