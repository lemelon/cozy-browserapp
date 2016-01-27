(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cozydb = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
var checkError, client, define, errorMaker;

client = require('./utils/client');

checkError = function(error, response, body, code, callback) {
  return callback(errorMaker(error, response, body, code));
};

errorMaker = function(error, response, body, expectedCode) {
  var err, msgStatus;
  if (error) {
    return error;
  } else if (response.status !== expectedCode) {
    msgStatus = "expected: " + expectedCode + ", got: " + response.statusCode;
    err = new Error(msgStatus + " -- " + body.error + " -- " + body.reason);
    err.status = response.statusCode;
    return err;
  } else {
    return null;
  }
};

define = function(docType, name, request, callback) {
  var map, path, reduce, reduceArgsAndBody, view;
  map = request.map, reduce = request.reduce;
  if ((reduce != null) && typeof reduce === 'function') {
    reduce = reduce.toString();
    reduceArgsAndBody = reduce.slice(reduce.indexOf('('));
    reduce = "function " + reduceArgsAndBody;
  }
  view = {
    reduce: reduce,
    map: "function (doc) {\n  if (doc.docType.toLowerCase() === \"" + (docType.toLowerCase()) + "\") {\n    filter = " + (map.toString()) + ";\n    filter(doc);\n  }\n}"
  };
  path = "request/" + docType + "/" + (name.toLowerCase()) + "/";
  return client.put(path, view, function(error, body, response) {
    return checkError(error, response, body, 200, callback);
  });
};

module.exports.create = function(docType, attributes, callback) {
  var path;
  path = "data/";
  attributes.docType = docType;
  if (attributes.id != null) {
    path += attributes.id + "/";
    delete attributes.id;
    return callback(new Error('cant create an object with a set id'));
  }
  return client.post(path, attributes, function(error, body, response) {
    if (error) {
      return callback(error);
    } else {
      return callback(null, JSON.parse(body));
    }
  });
};

module.exports.find = function(id, callback) {
  return client.get("data/" + id + "/", null, function(error, body, response) {
    if (error) {
      return callback(error);
    } else if (response.status === 404) {
      return callback(null, null, null);
    } else {
      return callback(null, body);
    }
  });
};

module.exports.exists = function(id, callback) {
  return client.get("data/exist/" + id + "/", null, function(error, body, response) {
    if (error) {
      return callback(error);
    } else if ((body == null) || (body.exist == null)) {
      return callback(new Error("Data system returned invalid data."));
    } else {
      return callback(null, body.exist);
    }
  });
};

module.exports.updateAttributes = function(docType, id, attributes, callback) {
  console.log('updateAttributes');
  attributes.docType = docType;
  return client.put("data/merge/" + id + "/", attributes, function(error, body, response) {
    if (error) {
      return callback(error);
    } else if (response.status === 404) {
      return callback(new Error("Document " + id + " not found"));
    } else if (response.status !== 200) {
      return callback(new Error("Server error occured."));
    } else {
      return callback(null, JSON.parse(body));
    }
  });
};

module.exports.destroy = function(id, callback) {
  return client.del("data/" + id + "/", null, function(error, body, response) {
    if (error) {
      return callback(error);
    } else if (response.status === 404) {
      return callback(new Error("Document " + id + " not found"));
    } else if (response.status !== 204) {
      return callback(new Error("Server error occured."));
    } else {
      return callback(null);
    }
  });
};

module.exports.defineRequest = function(docType, name, request, callback) {
  var map, reduce;
  if (typeof request === "function" || typeof request === 'string') {
    map = request;
  } else {
    map = request.map;
    reduce = request.reduce;
  }
  return define(docType, name, {
    map: map,
    reduce: reduce
  }, callback);
};

module.exports.run = function(docType, name, params, callback) {
  var path, ref;
  if (typeof params === "function") {
    ref = [{}, params], params = ref[0], callback = ref[1];
  }
  path = "request/" + docType + "/" + (name.toLowerCase()) + "/";
  return client.post(path, params, function(error, body, response) {
    if (error) {
      return callback(error);
    } else if (response.status !== 200) {
      return callback(new Error(util.inspect(body)));
    } else {
      return callback(null, body);
    }
  });
};

module.exports.requestDestroy = function(docType, name, params, callback) {
  var path, ref;
  if (typeof params === "function") {
    ref = [{}, params], params = ref[0], callback = ref[1];
  }
  if (params.limit == null) {
    params.limit = 100;
  }
  path = "request/" + docType + "/" + (name.toLowerCase()) + "/destroy/";
  return client.put(path, params, function(error, body, response) {
    return checkError(error, response, body, 204, callback);
  });
};

},{"./utils/client":2}],2:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
var eventListening, getToken, playRequest;

eventListening = function(action) {
  return function(e) {
    window.removeEventListener('message', eventListening);
    action(e.data);
  };
};

getToken = function(xhr, method, callback) {
  xhr.open(method, "/ds-api/" + path, true);
  window.parent.postMessage({
    action: 'getToken'
  }, '*');
  return window.addEventListener('message', eventListening(function(intent) {
    return setTimeout((function() {
      callback(intent);
    }), 5);
  }), false);
};

module.exports = {
  get: function(path, attributes, callback) {
    return playRequest('GET', path, attributes, function(error, body, response) {
      return callback(error, body, response);
    });
  },
  post: function(path, attributes, callback) {
    return playRequest('POST', path, attributes, function(error, body, response) {
      return callback(error, body, response);
    });
  },
  put: function(path, attributes, callback) {
    console.log('put');
    return playRequest('PUT', path, attributes, function(error, body, response) {
      return callback(error, body, response);
    });
  },
  del: function(path, attributes, callback) {
    return playRequest('DELETE', path, attributes, function(error, body, response) {
      return callback(error, body, response);
    });
  }
};

playRequest = function(method, path, attributes, callback) {
  var xhr;
  xhr = new XMLHttpRequest;
  xhr.onload = function() {
    return callback(null, xhr.response, xhr);
  };
  xhr.onerror = function(e) {
    var err;
    err = 'Request failed : #{e.target.status}';
    return callback(err);
  };
  return getToken(xhr, method, function(res) {
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(res.appName + ':' + res.token));
    if (attributes != null) {
      return xhr.send(JSON.stringify(attributes));
    } else {
      return xhr.send();
    }
  });
};

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYi9pbmRleC5qcyIsImxpYi91dGlscy9jbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS4xMC4wXG52YXIgY2hlY2tFcnJvciwgY2xpZW50LCBkZWZpbmUsIGVycm9yTWFrZXI7XG5cbmNsaWVudCA9IHJlcXVpcmUoJy4vdXRpbHMvY2xpZW50Jyk7XG5cbmNoZWNrRXJyb3IgPSBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UsIGJvZHksIGNvZGUsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBjYWxsYmFjayhlcnJvck1ha2VyKGVycm9yLCByZXNwb25zZSwgYm9keSwgY29kZSkpO1xufTtcblxuZXJyb3JNYWtlciA9IGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSwgYm9keSwgZXhwZWN0ZWRDb2RlKSB7XG4gIHZhciBlcnIsIG1zZ1N0YXR1cztcbiAgaWYgKGVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1cyAhPT0gZXhwZWN0ZWRDb2RlKSB7XG4gICAgbXNnU3RhdHVzID0gXCJleHBlY3RlZDogXCIgKyBleHBlY3RlZENvZGUgKyBcIiwgZ290OiBcIiArIHJlc3BvbnNlLnN0YXR1c0NvZGU7XG4gICAgZXJyID0gbmV3IEVycm9yKG1zZ1N0YXR1cyArIFwiIC0tIFwiICsgYm9keS5lcnJvciArIFwiIC0tIFwiICsgYm9keS5yZWFzb24pO1xuICAgIGVyci5zdGF0dXMgPSByZXNwb25zZS5zdGF0dXNDb2RlO1xuICAgIHJldHVybiBlcnI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbmRlZmluZSA9IGZ1bmN0aW9uKGRvY1R5cGUsIG5hbWUsIHJlcXVlc3QsIGNhbGxiYWNrKSB7XG4gIHZhciBtYXAsIHBhdGgsIHJlZHVjZSwgcmVkdWNlQXJnc0FuZEJvZHksIHZpZXc7XG4gIG1hcCA9IHJlcXVlc3QubWFwLCByZWR1Y2UgPSByZXF1ZXN0LnJlZHVjZTtcbiAgaWYgKChyZWR1Y2UgIT0gbnVsbCkgJiYgdHlwZW9mIHJlZHVjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJlZHVjZSA9IHJlZHVjZS50b1N0cmluZygpO1xuICAgIHJlZHVjZUFyZ3NBbmRCb2R5ID0gcmVkdWNlLnNsaWNlKHJlZHVjZS5pbmRleE9mKCcoJykpO1xuICAgIHJlZHVjZSA9IFwiZnVuY3Rpb24gXCIgKyByZWR1Y2VBcmdzQW5kQm9keTtcbiAgfVxuICB2aWV3ID0ge1xuICAgIHJlZHVjZTogcmVkdWNlLFxuICAgIG1hcDogXCJmdW5jdGlvbiAoZG9jKSB7XFxuICBpZiAoZG9jLmRvY1R5cGUudG9Mb3dlckNhc2UoKSA9PT0gXFxcIlwiICsgKGRvY1R5cGUudG9Mb3dlckNhc2UoKSkgKyBcIlxcXCIpIHtcXG4gICAgZmlsdGVyID0gXCIgKyAobWFwLnRvU3RyaW5nKCkpICsgXCI7XFxuICAgIGZpbHRlcihkb2MpO1xcbiAgfVxcbn1cIlxuICB9O1xuICBwYXRoID0gXCJyZXF1ZXN0L1wiICsgZG9jVHlwZSArIFwiL1wiICsgKG5hbWUudG9Mb3dlckNhc2UoKSkgKyBcIi9cIjtcbiAgcmV0dXJuIGNsaWVudC5wdXQocGF0aCwgdmlldywgZnVuY3Rpb24oZXJyb3IsIGJvZHksIHJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIGNoZWNrRXJyb3IoZXJyb3IsIHJlc3BvbnNlLCBib2R5LCAyMDAsIGNhbGxiYWNrKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGUgPSBmdW5jdGlvbihkb2NUeXBlLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICB2YXIgcGF0aDtcbiAgcGF0aCA9IFwiZGF0YS9cIjtcbiAgYXR0cmlidXRlcy5kb2NUeXBlID0gZG9jVHlwZTtcbiAgaWYgKGF0dHJpYnV0ZXMuaWQgIT0gbnVsbCkge1xuICAgIHBhdGggKz0gYXR0cmlidXRlcy5pZCArIFwiL1wiO1xuICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLmlkO1xuICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ2NhbnQgY3JlYXRlIGFuIG9iamVjdCB3aXRoIGEgc2V0IGlkJykpO1xuICB9XG4gIHJldHVybiBjbGllbnQucG9zdChwYXRoLCBhdHRyaWJ1dGVzLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBKU09OLnBhcnNlKGJvZHkpKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZmluZCA9IGZ1bmN0aW9uKGlkLCBjYWxsYmFjaykge1xuICByZXR1cm4gY2xpZW50LmdldChcImRhdGEvXCIgKyBpZCArIFwiL1wiLCBudWxsLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcik7XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIG51bGwsIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgYm9keSk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmV4aXN0cyA9IGZ1bmN0aW9uKGlkLCBjYWxsYmFjaykge1xuICByZXR1cm4gY2xpZW50LmdldChcImRhdGEvZXhpc3QvXCIgKyBpZCArIFwiL1wiLCBudWxsLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcik7XG4gICAgfSBlbHNlIGlmICgoYm9keSA9PSBudWxsKSB8fCAoYm9keS5leGlzdCA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihcIkRhdGEgc3lzdGVtIHJldHVybmVkIGludmFsaWQgZGF0YS5cIikpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgYm9keS5leGlzdCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnVwZGF0ZUF0dHJpYnV0ZXMgPSBmdW5jdGlvbihkb2NUeXBlLCBpZCwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgY29uc29sZS5sb2coJ3VwZGF0ZUF0dHJpYnV0ZXMnKTtcbiAgYXR0cmlidXRlcy5kb2NUeXBlID0gZG9jVHlwZTtcbiAgcmV0dXJuIGNsaWVudC5wdXQoXCJkYXRhL21lcmdlL1wiICsgaWQgKyBcIi9cIiwgYXR0cmlidXRlcywgZnVuY3Rpb24oZXJyb3IsIGJvZHksIHJlc3BvbnNlKSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IpO1xuICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJEb2N1bWVudCBcIiArIGlkICsgXCIgbm90IGZvdW5kXCIpKTtcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwiU2VydmVyIGVycm9yIG9jY3VyZWQuXCIpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIEpTT04ucGFyc2UoYm9keSkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5kZXN0cm95ID0gZnVuY3Rpb24oaWQsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBjbGllbnQuZGVsKFwiZGF0YS9cIiArIGlkICsgXCIvXCIsIG51bGwsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKTtcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwiRG9jdW1lbnQgXCIgKyBpZCArIFwiIG5vdCBmb3VuZFwiKSk7XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgIT09IDIwNCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihcIlNlcnZlciBlcnJvciBvY2N1cmVkLlwiKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZGVmaW5lUmVxdWVzdCA9IGZ1bmN0aW9uKGRvY1R5cGUsIG5hbWUsIHJlcXVlc3QsIGNhbGxiYWNrKSB7XG4gIHZhciBtYXAsIHJlZHVjZTtcbiAgaWYgKHR5cGVvZiByZXF1ZXN0ID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlcXVlc3QgPT09ICdzdHJpbmcnKSB7XG4gICAgbWFwID0gcmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICBtYXAgPSByZXF1ZXN0Lm1hcDtcbiAgICByZWR1Y2UgPSByZXF1ZXN0LnJlZHVjZTtcbiAgfVxuICByZXR1cm4gZGVmaW5lKGRvY1R5cGUsIG5hbWUsIHtcbiAgICBtYXA6IG1hcCxcbiAgICByZWR1Y2U6IHJlZHVjZVxuICB9LCBjYWxsYmFjayk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5ydW4gPSBmdW5jdGlvbihkb2NUeXBlLCBuYW1lLCBwYXJhbXMsIGNhbGxiYWNrKSB7XG4gIHZhciBwYXRoLCByZWY7XG4gIGlmICh0eXBlb2YgcGFyYW1zID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZWYgPSBbe30sIHBhcmFtc10sIHBhcmFtcyA9IHJlZlswXSwgY2FsbGJhY2sgPSByZWZbMV07XG4gIH1cbiAgcGF0aCA9IFwicmVxdWVzdC9cIiArIGRvY1R5cGUgKyBcIi9cIiArIChuYW1lLnRvTG93ZXJDYXNlKCkpICsgXCIvXCI7XG4gIHJldHVybiBjbGllbnQucG9zdChwYXRoLCBwYXJhbXMsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKTtcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKHV0aWwuaW5zcGVjdChib2R5KSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgYm9keSk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnJlcXVlc3REZXN0cm95ID0gZnVuY3Rpb24oZG9jVHlwZSwgbmFtZSwgcGFyYW1zLCBjYWxsYmFjaykge1xuICB2YXIgcGF0aCwgcmVmO1xuICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmVmID0gW3t9LCBwYXJhbXNdLCBwYXJhbXMgPSByZWZbMF0sIGNhbGxiYWNrID0gcmVmWzFdO1xuICB9XG4gIGlmIChwYXJhbXMubGltaXQgPT0gbnVsbCkge1xuICAgIHBhcmFtcy5saW1pdCA9IDEwMDtcbiAgfVxuICBwYXRoID0gXCJyZXF1ZXN0L1wiICsgZG9jVHlwZSArIFwiL1wiICsgKG5hbWUudG9Mb3dlckNhc2UoKSkgKyBcIi9kZXN0cm95L1wiO1xuICByZXR1cm4gY2xpZW50LnB1dChwYXRoLCBwYXJhbXMsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgIHJldHVybiBjaGVja0Vycm9yKGVycm9yLCByZXNwb25zZSwgYm9keSwgMjA0LCBjYWxsYmFjayk7XG4gIH0pO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS4xMC4wXG52YXIgZXZlbnRMaXN0ZW5pbmcsIGdldFRva2VuLCBwbGF5UmVxdWVzdDtcblxuZXZlbnRMaXN0ZW5pbmcgPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGV2ZW50TGlzdGVuaW5nKTtcbiAgICBhY3Rpb24oZS5kYXRhKTtcbiAgfTtcbn07XG5cbmdldFRva2VuID0gZnVuY3Rpb24oeGhyLCBtZXRob2QsIGNhbGxiYWNrKSB7XG4gIHhoci5vcGVuKG1ldGhvZCwgXCIvZHMtYXBpL1wiICsgcGF0aCwgdHJ1ZSk7XG4gIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2Uoe1xuICAgIGFjdGlvbjogJ2dldFRva2VuJ1xuICB9LCAnKicpO1xuICByZXR1cm4gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBldmVudExpc3RlbmluZyhmdW5jdGlvbihpbnRlbnQpIHtcbiAgICByZXR1cm4gc2V0VGltZW91dCgoZnVuY3Rpb24oKSB7XG4gICAgICBjYWxsYmFjayhpbnRlbnQpO1xuICAgIH0pLCA1KTtcbiAgfSksIGZhbHNlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQ6IGZ1bmN0aW9uKHBhdGgsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHBsYXlSZXF1ZXN0KCdHRVQnLCBwYXRoLCBhdHRyaWJ1dGVzLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvciwgYm9keSwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9LFxuICBwb3N0OiBmdW5jdGlvbihwYXRoLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBwbGF5UmVxdWVzdCgnUE9TVCcsIHBhdGgsIGF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yLCBib2R5LCByZXNwb25zZSk7XG4gICAgfSk7XG4gIH0sXG4gIHB1dDogZnVuY3Rpb24ocGF0aCwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgICBjb25zb2xlLmxvZygncHV0Jyk7XG4gICAgcmV0dXJuIHBsYXlSZXF1ZXN0KCdQVVQnLCBwYXRoLCBhdHRyaWJ1dGVzLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvciwgYm9keSwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9LFxuICBkZWw6IGZ1bmN0aW9uKHBhdGgsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHBsYXlSZXF1ZXN0KCdERUxFVEUnLCBwYXRoLCBhdHRyaWJ1dGVzLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvciwgYm9keSwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG59O1xuXG5wbGF5UmVxdWVzdCA9IGZ1bmN0aW9uKG1ldGhvZCwgcGF0aCwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgdmFyIHhocjtcbiAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHhoci5yZXNwb25zZSwgeGhyKTtcbiAgfTtcbiAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGVycjtcbiAgICBlcnIgPSAnUmVxdWVzdCBmYWlsZWQgOiAje2UudGFyZ2V0LnN0YXR1c30nO1xuICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICB9O1xuICByZXR1cm4gZ2V0VG9rZW4oeGhyLCBtZXRob2QsIGZ1bmN0aW9uKHJlcykge1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBidG9hKHJlcy5hcHBOYW1lICsgJzonICsgcmVzLnRva2VuKSk7XG4gICAgaWYgKGF0dHJpYnV0ZXMgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGF0dHJpYnV0ZXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHhoci5zZW5kKCk7XG4gICAgfVxuICB9KTtcbn07XG4iXX0=
