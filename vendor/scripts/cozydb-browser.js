(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cozydb = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
var client;

client = require('./utils/client');

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
      return callback(null, body, response);
    }
  });
};

},{"./utils/client":2}],2:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
var playRequest;

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
    return playRequest('PUT', path, attributes, function(error, body, response) {
      return callback(error, body, response);
    });
  },
  "delete": function(path, attributes, callback) {
    return playRequest('DELETE', path, attributes, function(error, body, response) {
      return callback(error, body, response);
    });
  }
};

playRequest = function(method, path, attributes, callback) {
  var xhr;
  xhr = new XMLHttpRequest;
  xhr.open(method, "/ds-api/" + path, true);
  xhr.onload = function() {
    console.log(xhr.response);
    return callback(null, xhr.response, xhr);
  };
  xhr.onerror = function(e) {
    var err;
    err = 'Request failed : #{e.target.status}';
    return callback(err);
  };
  xhr.setRequestHeader('Content-Type', 'application/json');
  if (attributes != null) {
    return xhr.send(JSON.stringify(attributes));
  } else {
    return xhr.send();
  }
};

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYi9pbmRleC5qcyIsImxpYi91dGlscy9jbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS4xMC4wXG52YXIgY2xpZW50O1xuXG5jbGllbnQgPSByZXF1aXJlKCcuL3V0aWxzL2NsaWVudCcpO1xuXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGUgPSBmdW5jdGlvbihkb2NUeXBlLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICB2YXIgcGF0aDtcbiAgcGF0aCA9IFwiZGF0YS9cIjtcbiAgYXR0cmlidXRlcy5kb2NUeXBlID0gZG9jVHlwZTtcbiAgaWYgKGF0dHJpYnV0ZXMuaWQgIT0gbnVsbCkge1xuICAgIHBhdGggKz0gYXR0cmlidXRlcy5pZCArIFwiL1wiO1xuICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLmlkO1xuICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ2NhbnQgY3JlYXRlIGFuIG9iamVjdCB3aXRoIGEgc2V0IGlkJykpO1xuICB9XG4gIHJldHVybiBjbGllbnQucG9zdChwYXRoLCBhdHRyaWJ1dGVzLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBib2R5LCByZXNwb25zZSk7XG4gICAgfVxuICB9KTtcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuMTAuMFxudmFyIHBsYXlSZXF1ZXN0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0OiBmdW5jdGlvbihwYXRoLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBwbGF5UmVxdWVzdCgnR0VUJywgcGF0aCwgYXR0cmlidXRlcywgZnVuY3Rpb24oZXJyb3IsIGJvZHksIHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IsIGJvZHksIHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfSxcbiAgcG9zdDogZnVuY3Rpb24ocGF0aCwgYXR0cmlidXRlcywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gcGxheVJlcXVlc3QoJ1BPU1QnLCBwYXRoLCBhdHRyaWJ1dGVzLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvciwgYm9keSwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9LFxuICBwdXQ6IGZ1bmN0aW9uKHBhdGgsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHBsYXlSZXF1ZXN0KCdQVVQnLCBwYXRoLCBhdHRyaWJ1dGVzLCBmdW5jdGlvbihlcnJvciwgYm9keSwgcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvciwgYm9keSwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9LFxuICBcImRlbGV0ZVwiOiBmdW5jdGlvbihwYXRoLCBhdHRyaWJ1dGVzLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBwbGF5UmVxdWVzdCgnREVMRVRFJywgcGF0aCwgYXR0cmlidXRlcywgZnVuY3Rpb24oZXJyb3IsIGJvZHksIHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IsIGJvZHksIHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfVxufTtcblxucGxheVJlcXVlc3QgPSBmdW5jdGlvbihtZXRob2QsIHBhdGgsIGF0dHJpYnV0ZXMsIGNhbGxiYWNrKSB7XG4gIHZhciB4aHI7XG4gIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgeGhyLm9wZW4obWV0aG9kLCBcIi9kcy1hcGkvXCIgKyBwYXRoLCB0cnVlKTtcbiAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKHhoci5yZXNwb25zZSk7XG4gICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHhoci5yZXNwb25zZSwgeGhyKTtcbiAgfTtcbiAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGVycjtcbiAgICBlcnIgPSAnUmVxdWVzdCBmYWlsZWQgOiAje2UudGFyZ2V0LnN0YXR1c30nO1xuICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICB9O1xuICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgaWYgKGF0dHJpYnV0ZXMgIT0gbnVsbCkge1xuICAgIHJldHVybiB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShhdHRyaWJ1dGVzKSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHhoci5zZW5kKCk7XG4gIH1cbn07XG4iXX0=
