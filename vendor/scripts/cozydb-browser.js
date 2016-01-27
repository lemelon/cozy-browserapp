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
var askForToken, playRequest;

askForToken = function() {
  return window.parent.postMessage({
    action: 'getToken'
  }, '*');
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
  var addListener, auth, eventListening, executeAsynchronously, sendRequest;
  auth = null;
  askForToken();
  eventListening = function(event) {
    window.removeEventListener('message', eventListening);
    return auth = event.data;
  };
  addListener = function() {
    return window.addEventListener('message', eventListening, false);
  };
  sendRequest = function() {
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
  executeAsynchronously = function(functions, timeout) {
    var i;
    i = 0;
    while (i < functions.length) {
      setTimeout(functions[i], timeout);
      i++;
    }
  };
  return executeAsynchronously([addListener, sendRequest], 1000);
};

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYi9pbmRleC5qcyIsImxpYi91dGlscy9jbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjEwLjBcbnZhciBjaGVja0Vycm9yLCBjbGllbnQsIGRlZmluZSwgZXJyb3JNYWtlcjtcblxuY2xpZW50ID0gcmVxdWlyZSgnLi91dGlscy9jbGllbnQnKTtcblxuY2hlY2tFcnJvciA9IGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSwgYm9keSwgY29kZSwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNhbGxiYWNrKGVycm9yTWFrZXIoZXJyb3IsIHJlc3BvbnNlLCBib2R5LCBjb2RlKSk7XG59O1xuXG5lcnJvck1ha2VyID0gZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlLCBib2R5LCBleHBlY3RlZENvZGUpIHtcbiAgdmFyIGVyciwgbXNnU3RhdHVzO1xuICBpZiAoZXJyb3IpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzICE9PSBleHBlY3RlZENvZGUpIHtcbiAgICBtc2dTdGF0dXMgPSBcImV4cGVjdGVkOiBcIiArIGV4cGVjdGVkQ29kZSArIFwiLCBnb3Q6IFwiICsgcmVzcG9uc2Uuc3RhdHVzQ29kZTtcbiAgICBlcnIgPSBuZXcgRXJyb3IobXNnU3RhdHVzICsgXCIgLS0gXCIgKyBib2R5LmVycm9yICsgXCIgLS0gXCIgKyBib2R5LnJlYXNvbik7XG4gICAgZXJyLnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1c0NvZGU7XG4gICAgcmV0dXJuIGVycjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxuZGVmaW5lID0gZnVuY3Rpb24oZG9jVHlwZSwgbmFtZSwgcmVxdWVzdCwgY2FsbGJhY2spIHtcbiAgdmFyIG1hcCwgcGF0aCwgcmVkdWNlLCByZWR1Y2VBcmdzQW5kQm9keSwgdmlldztcbiAgbWFwID0gcmVxdWVzdC5tYXAsIHJlZHVjZSA9IHJlcXVlc3QucmVkdWNlO1xuICBpZiAoKHJlZHVjZSAhPSBudWxsKSAmJiB0eXBlb2YgcmVkdWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmVkdWNlID0gcmVkdWNlLnRvU3RyaW5nKCk7XG4gICAgcmVkdWNlQXJnc0FuZEJvZHkgPSByZWR1Y2Uuc2xpY2UocmVkdWNlLmluZGV4T2YoJygnKSk7XG4gICAgcmVkdWNlID0gXCJmdW5jdGlvbiBcIiArIHJlZHVjZUFyZ3NBbmRCb2R5O1xuICB9XG4gIHZpZXcgPSB7XG4gICAgcmVkdWNlOiByZWR1Y2UsXG4gICAgbWFwOiBcImZ1bmN0aW9uIChkb2MpIHtcXG4gIGlmIChkb2MuZG9jVHlwZS50b0xvd2VyQ2FzZSgpID09PSBcXFwiXCIgKyAoZG9jVHlwZS50b0xvd2VyQ2FzZSgpKSArIFwiXFxcIikge1xcbiAgICBmaWx0ZXIgPSBcIiArIChtYXAudG9TdHJpbmcoKSkgKyBcIjtcXG4gICAgZmlsdGVyKGRvYyk7XFxuICB9XFxufVwiXG4gIH07XG4gIHBhdGggPSBcInJlcXVlc3QvXCIgKyBkb2NUeXBlICsgXCIvXCIgKyAobmFtZS50b0xvd2VyQ2FzZSgpKSArIFwiL1wiO1xuICByZXR1cm4gY2xpZW50LnB1dChwYXRoLCB2aWV3LCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICByZXR1cm4gY2hlY2tFcnJvcihlcnJvciwgcmVzcG9uc2UsIGJvZHksIDIwMCwgY2FsbGJhY2spO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uKGRvY1R5cGUsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gIHZhciBwYXRoO1xuICBwYXRoID0gXCJkYXRhL1wiO1xuICBhdHRyaWJ1dGVzLmRvY1R5cGUgPSBkb2NUeXBlO1xuICBpZiAoYXR0cmlidXRlcy5pZCAhPSBudWxsKSB7XG4gICAgcGF0aCArPSBhdHRyaWJ1dGVzLmlkICsgXCIvXCI7XG4gICAgZGVsZXRlIGF0dHJpYnV0ZXMuaWQ7XG4gICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcignY2FudCBjcmVhdGUgYW4gb2JqZWN0IHdpdGggYSBzZXQgaWQnKSk7XG4gIH1cbiAgcmV0dXJuIGNsaWVudC5wb3N0KHBhdGgsIGF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIEpTT04ucGFyc2UoYm9keSkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5maW5kID0gZnVuY3Rpb24oaWQsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBjbGllbnQuZ2V0KFwiZGF0YS9cIiArIGlkICsgXCIvXCIsIG51bGwsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKTtcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgbnVsbCwgbnVsbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBib2R5KTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZXhpc3RzID0gZnVuY3Rpb24oaWQsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBjbGllbnQuZ2V0KFwiZGF0YS9leGlzdC9cIiArIGlkICsgXCIvXCIsIG51bGwsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKTtcbiAgICB9IGVsc2UgaWYgKChib2R5ID09IG51bGwpIHx8IChib2R5LmV4aXN0ID09IG51bGwpKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwiRGF0YSBzeXN0ZW0gcmV0dXJuZWQgaW52YWxpZCBkYXRhLlwiKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBib2R5LmV4aXN0KTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMudXBkYXRlQXR0cmlidXRlcyA9IGZ1bmN0aW9uKGRvY1R5cGUsIGlkLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICBjb25zb2xlLmxvZygndXBkYXRlQXR0cmlidXRlcycpO1xuICBhdHRyaWJ1dGVzLmRvY1R5cGUgPSBkb2NUeXBlO1xuICByZXR1cm4gY2xpZW50LnB1dChcImRhdGEvbWVyZ2UvXCIgKyBpZCArIFwiL1wiLCBhdHRyaWJ1dGVzLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcik7XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcihcIkRvY3VtZW50IFwiICsgaWQgKyBcIiBub3QgZm91bmRcIikpO1xuICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzICE9PSAyMDApIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJTZXJ2ZXIgZXJyb3Igb2NjdXJlZC5cIikpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgSlNPTi5wYXJzZShib2R5KSk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmRlc3Ryb3kgPSBmdW5jdGlvbihpZCwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNsaWVudC5kZWwoXCJkYXRhL1wiICsgaWQgKyBcIi9cIiwgbnVsbCwgZnVuY3Rpb24oZXJyb3IsIGJvZHksIHJlc3BvbnNlKSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IpO1xuICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJEb2N1bWVudCBcIiArIGlkICsgXCIgbm90IGZvdW5kXCIpKTtcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1cyAhPT0gMjA0KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwiU2VydmVyIGVycm9yIG9jY3VyZWQuXCIpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5kZWZpbmVSZXF1ZXN0ID0gZnVuY3Rpb24oZG9jVHlwZSwgbmFtZSwgcmVxdWVzdCwgY2FsbGJhY2spIHtcbiAgdmFyIG1hcCwgcmVkdWNlO1xuICBpZiAodHlwZW9mIHJlcXVlc3QgPT09IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgcmVxdWVzdCA9PT0gJ3N0cmluZycpIHtcbiAgICBtYXAgPSByZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIG1hcCA9IHJlcXVlc3QubWFwO1xuICAgIHJlZHVjZSA9IHJlcXVlc3QucmVkdWNlO1xuICB9XG4gIHJldHVybiBkZWZpbmUoZG9jVHlwZSwgbmFtZSwge1xuICAgIG1hcDogbWFwLFxuICAgIHJlZHVjZTogcmVkdWNlXG4gIH0sIGNhbGxiYWNrKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLnJ1biA9IGZ1bmN0aW9uKGRvY1R5cGUsIG5hbWUsIHBhcmFtcywgY2FsbGJhY2spIHtcbiAgdmFyIHBhdGgsIHJlZjtcbiAgaWYgKHR5cGVvZiBwYXJhbXMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHJlZiA9IFt7fSwgcGFyYW1zXSwgcGFyYW1zID0gcmVmWzBdLCBjYWxsYmFjayA9IHJlZlsxXTtcbiAgfVxuICBwYXRoID0gXCJyZXF1ZXN0L1wiICsgZG9jVHlwZSArIFwiL1wiICsgKG5hbWUudG9Mb3dlckNhc2UoKSkgKyBcIi9cIjtcbiAgcmV0dXJuIGNsaWVudC5wb3N0KHBhdGgsIHBhcmFtcywgZnVuY3Rpb24oZXJyb3IsIGJvZHksIHJlc3BvbnNlKSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IpO1xuICAgIH0gZWxzZSBpZiAocmVzcG9uc2Uuc3RhdHVzICE9PSAyMDApIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IodXRpbC5pbnNwZWN0KGJvZHkpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBib2R5KTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMucmVxdWVzdERlc3Ryb3kgPSBmdW5jdGlvbihkb2NUeXBlLCBuYW1lLCBwYXJhbXMsIGNhbGxiYWNrKSB7XG4gIHZhciBwYXRoLCByZWY7XG4gIGlmICh0eXBlb2YgcGFyYW1zID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZWYgPSBbe30sIHBhcmFtc10sIHBhcmFtcyA9IHJlZlswXSwgY2FsbGJhY2sgPSByZWZbMV07XG4gIH1cbiAgaWYgKHBhcmFtcy5saW1pdCA9PSBudWxsKSB7XG4gICAgcGFyYW1zLmxpbWl0ID0gMTAwO1xuICB9XG4gIHBhdGggPSBcInJlcXVlc3QvXCIgKyBkb2NUeXBlICsgXCIvXCIgKyAobmFtZS50b0xvd2VyQ2FzZSgpKSArIFwiL2Rlc3Ryb3kvXCI7XG4gIHJldHVybiBjbGllbnQucHV0KHBhdGgsIHBhcmFtcywgZnVuY3Rpb24oZXJyb3IsIGJvZHksIHJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIGNoZWNrRXJyb3IoZXJyb3IsIHJlc3BvbnNlLCBib2R5LCAyMDQsIGNhbGxiYWNrKTtcbiAgfSk7XG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjEwLjBcbnZhciBhc2tGb3JUb2tlbiwgcGxheVJlcXVlc3Q7XG5cbmFza0ZvclRva2VuID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKHtcbiAgICBhY3Rpb246ICdnZXRUb2tlbidcbiAgfSwgJyonKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQ6IGZ1bmN0aW9uKHBhdGgsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHBsYXlSZXF1ZXN0KCdHRVQnLCBwYXRoLCBhdHRyaWJ1dGVzLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvciwgYm9keSwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9LFxuICBwb3N0OiBmdW5jdGlvbihwYXRoLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBwbGF5UmVxdWVzdCgnUE9TVCcsIHBhdGgsIGF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGVycm9yLCBib2R5LCByZXNwb25zZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yLCBib2R5LCByZXNwb25zZSk7XG4gICAgfSk7XG4gIH0sXG4gIHB1dDogZnVuY3Rpb24ocGF0aCwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgICBjb25zb2xlLmxvZygncHV0Jyk7XG4gICAgcmV0dXJuIHBsYXlSZXF1ZXN0KCdQVVQnLCBwYXRoLCBhdHRyaWJ1dGVzLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvciwgYm9keSwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9LFxuICBkZWw6IGZ1bmN0aW9uKHBhdGgsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHBsYXlSZXF1ZXN0KCdERUxFVEUnLCBwYXRoLCBhdHRyaWJ1dGVzLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvciwgYm9keSwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG59O1xuXG5wbGF5UmVxdWVzdCA9IGZ1bmN0aW9uKG1ldGhvZCwgcGF0aCwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgdmFyIGFkZExpc3RlbmVyLCBhdXRoLCBldmVudExpc3RlbmluZywgZXhlY3V0ZUFzeW5jaHJvbm91c2x5LCBzZW5kUmVxdWVzdDtcbiAgYXV0aCA9IG51bGw7XG4gIGFza0ZvclRva2VuKCk7XG4gIGV2ZW50TGlzdGVuaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGV2ZW50TGlzdGVuaW5nKTtcbiAgICByZXR1cm4gYXV0aCA9IGV2ZW50LmRhdGE7XG4gIH07XG4gIGFkZExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZXZlbnRMaXN0ZW5pbmcsIGZhbHNlKTtcbiAgfTtcbiAgc2VuZFJlcXVlc3QgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgeGhyO1xuICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgICB4aHIub3BlbihtZXRob2QsIFwiL2RzLWFwaS9cIiArIHBhdGgsIHRydWUpO1xuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCB4aHIucmVzcG9uc2UsIHhocik7XG4gICAgfTtcbiAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBlcnI7XG4gICAgICBlcnIgPSAnUmVxdWVzdCBmYWlsZWQgOiAje2UudGFyZ2V0LnN0YXR1c30nO1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgfTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgYnRvYShhdXRoLmFwcE5hbWUgKyAnOicgKyBhdXRoLnRva2VuKSk7XG4gICAgaWYgKGF0dHJpYnV0ZXMgIT0gbnVsbCkge1xuICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoYXR0cmlidXRlcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICB4aHIuc2VuZCgpO1xuICAgIH1cbiAgfTtcbiAgZXhlY3V0ZUFzeW5jaHJvbm91c2x5ID0gZnVuY3Rpb24oZnVuY3Rpb25zLCB0aW1lb3V0KSB7XG4gICAgdmFyIGk7XG4gICAgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBmdW5jdGlvbnMubGVuZ3RoKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uc1tpXSwgdGltZW91dCk7XG4gICAgICBpKys7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZXhlY3V0ZUFzeW5jaHJvbm91c2x5KFthZGRMaXN0ZW5lciwgc2VuZFJlcXVlc3RdLCAxMDAwKTtcbn07XG4iXX0=
