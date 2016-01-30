var appConfig, routeObject;

appConfig = function($routeProvider) {
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

appConfig.$inject = ['$routeProvider'];
;var Contact;

Contact = function($injector) {
  var CozySdk, all, send;
  CozySdk = $injector.get('CozySdk');
  send = function(docType, data, callback) {
    return CozySdk.create(docType, data, function(res) {
      return CozySdk.find(res._id, function(result) {
        return callback(result);
      });
    });
  };
  all = function(callback) {
    return CozySdk.defineRequest('Contact', 'all', 'function(doc) { emit(doc.n, null); }', function(res) {
      return CozySdk.runRequest('Contact', 'all', function(result) {
        return callback(result);
      });
    });
  };
  Contact.prototype = {
    send: send,
    all: all
  };
  return Contact;
};

angular.module('browserapp').factory('Contact', Contact);

Contact.$inject = ['$injector'];
;var CozySdk;

CozySdk = function($scope) {
  var create, define, destroy, destroyRequest, exist, find, runRequest, update;
  create = function(docType, data, callback) {
    return cozysdk.create(docType, data, function(err, res) {
      if (err != null) {
        return console.log('maybe do a cozy special error warning');
      } else {
        return $scope.$apply(function() {
          return callback(res);
        });
      }
    });
  };
  find = function(id) {
    return cozysdk.find(id, function(err, res) {
      if (err != null) {
        return console.log('maybe do a cozy special error warning');
      } else {
        return $scope.$apply(function() {
          return callback(res);
        });
      }
    });
  };
  exist = function(id) {
    return cozysdk.exists(id, function(err, res) {
      if (err != null) {
        return console.log('maybe do a cozy special error warning');
      } else {
        return $scope.$apply(function() {
          return callback(res);
        });
      }
    });
  };
  update = function(id, user) {
    return cozysdk.updateAttributes('Contact', id, user, function(err, res) {
      if (err != null) {
        return console.log('maybe do a cozy special error warning');
      } else {
        return $scope.$apply(function() {
          return callback(res);
        });
      }
    });
  };
  destroy = function(id) {
    return cozysdk.destroy(id, function(err, res) {
      if (err != null) {
        return console.log('maybe do a cozy special error warning');
      } else {
        return $scope.$apply(function() {
          return callback(res);
        });
      }
    });
  };
  define = function() {
    return cozysdk.defineRequest('Contact', 'all', 'function(doc) { emit(doc.n, null); }', function(err, res) {
      if (err != null) {
        return console.log('maybe do a cozy special error warning');
      } else {
        return $scope.$apply(function() {
          return callback(res);
        });
      }
    });
  };
  destroyRequest = function() {
    return cozysdk.requestDestroy('Contact', 'all', {
      startkey: 'z',
      endkey: 'z'
    }, function(err, res) {
      if (err != null) {
        return console.log('maybe do a cozy special error warning');
      } else {
        return $scope.$apply(function() {
          return callback(res);
        });
      }
    });
  };
  runRequest = function() {
    return cozysdk.run('Contact', 'all', {
      startkey: 'z',
      endkey: 'z'
    }, function(err, res) {
      if (err != null) {
        return console.log('maybe do a cozy special error warning');
      } else {
        return $scope.$apply(function() {
          return callback(res);
        });
      }
    });
  };
  CozySdk.prototype = {
    create: create,
    update: update,
    destroy: sdestroy,
    exist: exist,
    find: find,
    defineRequest: defineRequest,
    destroyRequest: destroyRequest,
    runRequest: runRequest
  };
  return CozySdk;
};

angular.module('browserapp').factory('CozySdk', CozySdk);

CozySdk.$inject = ['$scope'];
;var HomeAngCtrl;

HomeAngCtrl = function($injector) {
  var Contact, CozySdk, activate, destroy, send, update, vm;
  Contact = $injector.get('Contact');
  CozySdk = $injector.get('CozySdk');
  vm = this;
  activate;
  activate = function() {
    return Contact.all(function(res) {
      return vm.contacts = res;
    });
  };
  send = function(user) {
    console.log('create contact');
    return Contact.send('Contact', user, function(res) {
      vm.contacts = res;
      return activate;
    });
  };
  update = function(id, user) {
    return CozySdk.updateAttributes('Contact', id, user, function(res) {
      vm.contacts = res;
      return activate;
    });
  };
  destroy = function(id) {
    return CozySdk.destroy(id, function(res) {
      vm.contacts = res;
      return activate;
    });
  };
  vm.send = send;
  vm.update = update;
  return vm.destroy = destroy;
};

angular.module('browserapp').controller('HomeAngCtrl', HomeAngCtrl);

HomeAngCtrl.$inject = ['$injector'];
;
//# sourceMappingURL=app.js.map