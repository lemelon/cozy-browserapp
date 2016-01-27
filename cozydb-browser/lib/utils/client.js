// Generated by CoffeeScript 1.10.0
var eventListening, getToken, playRequest;

eventListening = function(action) {
  return function(e) {
    window.removeEventListener('message', eventListening);
    action(e.data);
  };
};

getToken = function(xhr, method, path, callback) {
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
  return getToken(xhr, method, path, function(res) {
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(res.appName + ':' + res.token));
    if (attributes != null) {
      return xhr.send(JSON.stringify(attributes));
    } else {
      return xhr.send();
    }
  });
};
