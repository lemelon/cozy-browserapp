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
  var auth, eventListening, xhr;
  auth = null;
  askForToken();
  xhr = new XMLHttpRequest;
  xhr.open(method, "/ds-api/" + path, true);
  eventListening = function(event) {
    window.removeEventListener('message', eventListening);
    return auth = event.data;
  };
  window.addEventListener('message', eventListening, false);
  xhr.onload = function() {
    return callback(null, xhr.response, xhr);
  };
  xhr.onerror = function(e) {
    var err;
    err = 'Request failed : #{e.target.status}';
    return callback(err);
  };
  return setTimeout((function() {
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(auth.appName + ':' + auth.token));
    if (attributes != null) {
      xhr.send(JSON.stringify(attributes));
    } else {
      xhr.send();
    }
  }), 800);
};
