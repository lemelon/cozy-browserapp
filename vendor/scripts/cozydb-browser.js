(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cozydb = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
var auth, checkError, client, define, errorMaker, eventListening;

client = require('./utils/client');

askForToken();

auth = null;

eventListening = function(event) {
  window.removeEventListener('message', eventListening);
  return auth = event.data;
};

window.addEventListener('message', eventListening, false);

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
  return client.put(auth, path, view, function(error, body, response) {
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
  return client.post(auth, path, attributes, function(error, body, response) {
    if (error) {
      return callback(error);
    } else {
      return callback(null, JSON.parse(body));
    }
  });
};

module.exports.find = function(id, callback) {
  return client.get(auth, "data/" + id + "/", null, function(error, body, response) {
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
  return client.get(auth, "data/exist/" + id + "/", null, function(error, body, response) {
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
  return client.put(auth, "data/merge/" + id + "/", attributes, function(error, body, response) {
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
  return client.del(auth, "data/" + id + "/", null, function(error, body, response) {
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
  return client.post(auth, path, params, function(error, body, response) {
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
  return client.put(auth, path, params, function(error, body, response) {
    return checkError(error, response, body, 204, callback);
  });
};

},{"./utils/client":2}],2:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
var askForToken, playRequest;

askForToken = function() {
  return window.parent.postMessage({
    action: 'getToken'
  }, '*');
};

module.exports = {
  get: function(auth, path, attributes, callback) {
    return playRequest(auth, 'GET', path, attributes, function(error, body, response) {
      return callback(error, body, response);
    });
  },
  post: function(auth, path, attributes, callback) {
    return playRequest(auth, 'POST', path, attributes, function(error, body, response) {
      return callback(error, body, response);
    });
  },
  put: function(auth, path, attributes, callback) {
    console.log('put');
    return playRequest(auth, 'PUT', path, attributes, function(error, body, response) {
      return callback(error, body, response);
    });
  },
  del: function(auth, path, attributes, callback) {
    return playRequest(auth, 'DELETE', path, attributes, function(error, body, response) {
      return callback(error, body, response);
    });
  }
};

playRequest = function(auth, method, path, attributes, callback) {
  var xhr;
  xhr = new XMLHttpRequest;
  xhr.open(method, "/ds-api/" + path, true);
  xhr.onload = function() {
    return callback(null, xhr.response, xhr);
  };
  xhr.onerror = function(e) {
    var err;
    err = 'Request failed : #{e.target.status}';
    return callback(err);
  };
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Basic ' + btoa(auth.appName + ':' + auth.token));
  if (attributes != null) {
    xhr.send(JSON.stringify(attributes));
  } else {
    xhr.send();
  }
};

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYi9pbmRleC5qcyIsImxpYi91dGlscy9jbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS4xMC4wXG52YXIgYXV0aCwgY2hlY2tFcnJvciwgY2xpZW50LCBkZWZpbmUsIGVycm9yTWFrZXIsIGV2ZW50TGlzdGVuaW5nO1xuXG5jbGllbnQgPSByZXF1aXJlKCcuL3V0aWxzL2NsaWVudCcpO1xuXG5hc2tGb3JUb2tlbigpO1xuXG5hdXRoID0gbnVsbDtcblxuZXZlbnRMaXN0ZW5pbmcgPSBmdW5jdGlvbihldmVudCkge1xuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGV2ZW50TGlzdGVuaW5nKTtcbiAgcmV0dXJuIGF1dGggPSBldmVudC5kYXRhO1xufTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBldmVudExpc3RlbmluZywgZmFsc2UpO1xuXG5jaGVja0Vycm9yID0gZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlLCBib2R5LCBjb2RlLCBjYWxsYmFjaykge1xuICByZXR1cm4gY2FsbGJhY2soZXJyb3JNYWtlcihlcnJvciwgcmVzcG9uc2UsIGJvZHksIGNvZGUpKTtcbn07XG5cbmVycm9yTWFrZXIgPSBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UsIGJvZHksIGV4cGVjdGVkQ29kZSkge1xuICB2YXIgZXJyLCBtc2dTdGF0dXM7XG4gIGlmIChlcnJvcikge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgIT09IGV4cGVjdGVkQ29kZSkge1xuICAgIG1zZ1N0YXR1cyA9IFwiZXhwZWN0ZWQ6IFwiICsgZXhwZWN0ZWRDb2RlICsgXCIsIGdvdDogXCIgKyByZXNwb25zZS5zdGF0dXNDb2RlO1xuICAgIGVyciA9IG5ldyBFcnJvcihtc2dTdGF0dXMgKyBcIiAtLSBcIiArIGJvZHkuZXJyb3IgKyBcIiAtLSBcIiArIGJvZHkucmVhc29uKTtcbiAgICBlcnIuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzQ29kZTtcbiAgICByZXR1cm4gZXJyO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG5kZWZpbmUgPSBmdW5jdGlvbihkb2NUeXBlLCBuYW1lLCByZXF1ZXN0LCBjYWxsYmFjaykge1xuICB2YXIgbWFwLCBwYXRoLCByZWR1Y2UsIHJlZHVjZUFyZ3NBbmRCb2R5LCB2aWV3O1xuICBtYXAgPSByZXF1ZXN0Lm1hcCwgcmVkdWNlID0gcmVxdWVzdC5yZWR1Y2U7XG4gIGlmICgocmVkdWNlICE9IG51bGwpICYmIHR5cGVvZiByZWR1Y2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZWR1Y2UgPSByZWR1Y2UudG9TdHJpbmcoKTtcbiAgICByZWR1Y2VBcmdzQW5kQm9keSA9IHJlZHVjZS5zbGljZShyZWR1Y2UuaW5kZXhPZignKCcpKTtcbiAgICByZWR1Y2UgPSBcImZ1bmN0aW9uIFwiICsgcmVkdWNlQXJnc0FuZEJvZHk7XG4gIH1cbiAgdmlldyA9IHtcbiAgICByZWR1Y2U6IHJlZHVjZSxcbiAgICBtYXA6IFwiZnVuY3Rpb24gKGRvYykge1xcbiAgaWYgKGRvYy5kb2NUeXBlLnRvTG93ZXJDYXNlKCkgPT09IFxcXCJcIiArIChkb2NUeXBlLnRvTG93ZXJDYXNlKCkpICsgXCJcXFwiKSB7XFxuICAgIGZpbHRlciA9IFwiICsgKG1hcC50b1N0cmluZygpKSArIFwiO1xcbiAgICBmaWx0ZXIoZG9jKTtcXG4gIH1cXG59XCJcbiAgfTtcbiAgcGF0aCA9IFwicmVxdWVzdC9cIiArIGRvY1R5cGUgKyBcIi9cIiArIChuYW1lLnRvTG93ZXJDYXNlKCkpICsgXCIvXCI7XG4gIHJldHVybiBjbGllbnQucHV0KGF1dGgsIHBhdGgsIHZpZXcsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgIHJldHVybiBjaGVja0Vycm9yKGVycm9yLCByZXNwb25zZSwgYm9keSwgMjAwLCBjYWxsYmFjayk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24oZG9jVHlwZSwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgdmFyIHBhdGg7XG4gIHBhdGggPSBcImRhdGEvXCI7XG4gIGF0dHJpYnV0ZXMuZG9jVHlwZSA9IGRvY1R5cGU7XG4gIGlmIChhdHRyaWJ1dGVzLmlkICE9IG51bGwpIHtcbiAgICBwYXRoICs9IGF0dHJpYnV0ZXMuaWQgKyBcIi9cIjtcbiAgICBkZWxldGUgYXR0cmlidXRlcy5pZDtcbiAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdjYW50IGNyZWF0ZSBhbiBvYmplY3Qgd2l0aCBhIHNldCBpZCcpKTtcbiAgfVxuICByZXR1cm4gY2xpZW50LnBvc3QoYXV0aCwgcGF0aCwgYXR0cmlidXRlcywgZnVuY3Rpb24oZXJyb3IsIGJvZHksIHJlc3BvbnNlKSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgSlNPTi5wYXJzZShib2R5KSk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmZpbmQgPSBmdW5jdGlvbihpZCwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNsaWVudC5nZXQoYXV0aCwgXCJkYXRhL1wiICsgaWQgKyBcIi9cIiwgbnVsbCwgZnVuY3Rpb24oZXJyb3IsIGJvZHksIHJlc3BvbnNlKSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IpO1xuICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBudWxsLCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIGJvZHkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5leGlzdHMgPSBmdW5jdGlvbihpZCwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNsaWVudC5nZXQoYXV0aCwgXCJkYXRhL2V4aXN0L1wiICsgaWQgKyBcIi9cIiwgbnVsbCwgZnVuY3Rpb24oZXJyb3IsIGJvZHksIHJlc3BvbnNlKSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IpO1xuICAgIH0gZWxzZSBpZiAoKGJvZHkgPT0gbnVsbCkgfHwgKGJvZHkuZXhpc3QgPT0gbnVsbCkpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJEYXRhIHN5c3RlbSByZXR1cm5lZCBpbnZhbGlkIGRhdGEuXCIpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIGJvZHkuZXhpc3QpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy51cGRhdGVBdHRyaWJ1dGVzID0gZnVuY3Rpb24oZG9jVHlwZSwgaWQsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gIGNvbnNvbGUubG9nKCd1cGRhdGVBdHRyaWJ1dGVzJyk7XG4gIGF0dHJpYnV0ZXMuZG9jVHlwZSA9IGRvY1R5cGU7XG4gIHJldHVybiBjbGllbnQucHV0KGF1dGgsIFwiZGF0YS9tZXJnZS9cIiArIGlkICsgXCIvXCIsIGF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKTtcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwiRG9jdW1lbnQgXCIgKyBpZCArIFwiIG5vdCBmb3VuZFwiKSk7XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihcIlNlcnZlciBlcnJvciBvY2N1cmVkLlwiKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBKU09OLnBhcnNlKGJvZHkpKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZGVzdHJveSA9IGZ1bmN0aW9uKGlkLCBjYWxsYmFjaykge1xuICByZXR1cm4gY2xpZW50LmRlbChhdXRoLCBcImRhdGEvXCIgKyBpZCArIFwiL1wiLCBudWxsLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcik7XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihcIkRvY3VtZW50IFwiICsgaWQgKyBcIiBub3QgZm91bmRcIikpO1xuICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzICE9PSAyMDQpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJTZXJ2ZXIgZXJyb3Igb2NjdXJlZC5cIikpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmRlZmluZVJlcXVlc3QgPSBmdW5jdGlvbihkb2NUeXBlLCBuYW1lLCByZXF1ZXN0LCBjYWxsYmFjaykge1xuICB2YXIgbWFwLCByZWR1Y2U7XG4gIGlmICh0eXBlb2YgcmVxdWVzdCA9PT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiByZXF1ZXN0ID09PSAnc3RyaW5nJykge1xuICAgIG1hcCA9IHJlcXVlc3Q7XG4gIH0gZWxzZSB7XG4gICAgbWFwID0gcmVxdWVzdC5tYXA7XG4gICAgcmVkdWNlID0gcmVxdWVzdC5yZWR1Y2U7XG4gIH1cbiAgcmV0dXJuIGRlZmluZShkb2NUeXBlLCBuYW1lLCB7XG4gICAgbWFwOiBtYXAsXG4gICAgcmVkdWNlOiByZWR1Y2VcbiAgfSwgY2FsbGJhY2spO1xufTtcblxubW9kdWxlLmV4cG9ydHMucnVuID0gZnVuY3Rpb24oZG9jVHlwZSwgbmFtZSwgcGFyYW1zLCBjYWxsYmFjaykge1xuICB2YXIgcGF0aCwgcmVmO1xuICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmVmID0gW3t9LCBwYXJhbXNdLCBwYXJhbXMgPSByZWZbMF0sIGNhbGxiYWNrID0gcmVmWzFdO1xuICB9XG4gIHBhdGggPSBcInJlcXVlc3QvXCIgKyBkb2NUeXBlICsgXCIvXCIgKyAobmFtZS50b0xvd2VyQ2FzZSgpKSArIFwiL1wiO1xuICByZXR1cm4gY2xpZW50LnBvc3QoYXV0aCwgcGF0aCwgcGFyYW1zLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcik7XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcih1dGlsLmluc3BlY3QoYm9keSkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIGJvZHkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5yZXF1ZXN0RGVzdHJveSA9IGZ1bmN0aW9uKGRvY1R5cGUsIG5hbWUsIHBhcmFtcywgY2FsbGJhY2spIHtcbiAgdmFyIHBhdGgsIHJlZjtcbiAgaWYgKHR5cGVvZiBwYXJhbXMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHJlZiA9IFt7fSwgcGFyYW1zXSwgcGFyYW1zID0gcmVmWzBdLCBjYWxsYmFjayA9IHJlZlsxXTtcbiAgfVxuICBpZiAocGFyYW1zLmxpbWl0ID09IG51bGwpIHtcbiAgICBwYXJhbXMubGltaXQgPSAxMDA7XG4gIH1cbiAgcGF0aCA9IFwicmVxdWVzdC9cIiArIGRvY1R5cGUgKyBcIi9cIiArIChuYW1lLnRvTG93ZXJDYXNlKCkpICsgXCIvZGVzdHJveS9cIjtcbiAgcmV0dXJuIGNsaWVudC5wdXQoYXV0aCwgcGF0aCwgcGFyYW1zLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICByZXR1cm4gY2hlY2tFcnJvcihlcnJvciwgcmVzcG9uc2UsIGJvZHksIDIwNCwgY2FsbGJhY2spO1xuICB9KTtcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuMTAuMFxudmFyIGFza0ZvclRva2VuLCBwbGF5UmVxdWVzdDtcblxuYXNrRm9yVG9rZW4gPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2Uoe1xuICAgIGFjdGlvbjogJ2dldFRva2VuJ1xuICB9LCAnKicpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldDogZnVuY3Rpb24oYXV0aCwgcGF0aCwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gcGxheVJlcXVlc3QoYXV0aCwgJ0dFVCcsIHBhdGgsIGF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yLCBib2R5LCByZXNwb25zZSk7XG4gICAgfSk7XG4gIH0sXG4gIHBvc3Q6IGZ1bmN0aW9uKGF1dGgsIHBhdGgsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHBsYXlSZXF1ZXN0KGF1dGgsICdQT1NUJywgcGF0aCwgYXR0cmlidXRlcywgZnVuY3Rpb24oZXJyb3IsIGJvZHksIHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IsIGJvZHksIHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfSxcbiAgcHV0OiBmdW5jdGlvbihhdXRoLCBwYXRoLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgIGNvbnNvbGUubG9nKCdwdXQnKTtcbiAgICByZXR1cm4gcGxheVJlcXVlc3QoYXV0aCwgJ1BVVCcsIHBhdGgsIGF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yLCBib2R5LCByZXNwb25zZSk7XG4gICAgfSk7XG4gIH0sXG4gIGRlbDogZnVuY3Rpb24oYXV0aCwgcGF0aCwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gcGxheVJlcXVlc3QoYXV0aCwgJ0RFTEVURScsIHBhdGgsIGF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yLCBib2R5LCByZXNwb25zZSk7XG4gICAgfSk7XG4gIH1cbn07XG5cbnBsYXlSZXF1ZXN0ID0gZnVuY3Rpb24oYXV0aCwgbWV0aG9kLCBwYXRoLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICB2YXIgeGhyO1xuICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gIHhoci5vcGVuKG1ldGhvZCwgXCIvZHMtYXBpL1wiICsgcGF0aCwgdHJ1ZSk7XG4gIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgeGhyLnJlc3BvbnNlLCB4aHIpO1xuICB9O1xuICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgZXJyO1xuICAgIGVyciA9ICdSZXF1ZXN0IGZhaWxlZCA6ICN7ZS50YXJnZXQuc3RhdHVzfSc7XG4gICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gIH07XG4gIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgYnRvYShhdXRoLmFwcE5hbWUgKyAnOicgKyBhdXRoLnRva2VuKSk7XG4gIGlmIChhdHRyaWJ1dGVzICE9IG51bGwpIHtcbiAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShhdHRyaWJ1dGVzKSk7XG4gIH0gZWxzZSB7XG4gICAgeGhyLnNlbmQoKTtcbiAgfVxufTtcbiJdfQ==
