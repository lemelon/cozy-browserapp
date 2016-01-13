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
