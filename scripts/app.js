var appConfig, routeObject;

appConfig = function($routeProvider) {
  var path;
  for (path in routeObject) {
    $routeProvider.when(path, routeObject[path]);
  }
  return $routeProvider.otherwise({
    redirectTo: '/'
  });
};

angular.module('browserapp', ['ngResource', 'ngRoute']).config(appConfig);

routeObject = {
  '/': {
    templateUrl: 'partials/home.html',
    controller: 'HomeAngCtrl',
    resolve: {
      preGetContacts: function(Contact) {
        var promise;
        promise = Contact.all();
        return promise;
      }
    }
  }
};

appConfig.$inject = ['$routeProvider'];
;var Contact;

Contact = function($injector, $q) {
  var CozySdk;
  CozySdk = $injector.get('CozySdk');
  return {
    send: function(docType, data) {
      var promise;
      promise = CozySdk.create(docType, data);
      return promise;
    },
    all: function() {
      var promise;
      promise = CozySdk.defineRequest('Contact', 'all', 'function(doc) { emit(doc.n, null); }').then(function() {
        return CozySdk.runRequest('Contact', 'all');
      });
      return promise;
    }
  };
};

angular.module('browserapp').factory('Contact', Contact);

Contact.$inject = ['$injector', '$q'];
;var CozySdk;

CozySdk = function($rootScope, $q) {
  return {
    create: function(docType, data) {
      var deferred;
      deferred = $q.defer();
      cozysdk.create(docType, data, function(err, res) {
        if (err != null) {
          return console.log('maybe do a cozy special error warning');
        } else {
          return deferred.resolve(res);
        }
      });
      return deferred.promise;
    },
    find: function(id) {
      var deferred;
      deferred = $q.defer();
      cozysdk.find(id, function(err, res) {
        if (err != null) {
          return console.log('maybe do a cozy special error warning');
        } else {
          return deferred.resolve(res);
        }
      });
      return deferred.promise;
    },
    exist: function(id) {
      var deferred;
      deferred = $q.defer();
      cozysdk.exists(id, function(err, res) {
        if (err != null) {
          return console.log('maybe do a cozy special error warning');
        } else {
          return deferred.resolve(res);
        }
      });
      return deferred.promise;
    },
    update: function(docType, id, user) {
      var deferred;
      deferred = $q.defer();
      cozysdk.updateAttributes(docType, id, user, function(err, res) {
        if (err != null) {
          return console.log('maybe do a cozy special error warning');
        } else {
          return deferred.resolve(res);
        }
      });
      return deferred.promise;
    },
    destroy: function(id) {
      var deferred;
      deferred = $q.defer();
      cozysdk.destroy(id, function(err, res) {
        if (err != null) {
          console.log('maybe do a cozy special error warning');
          return deferred.reject('oh no an error! try again');
        } else {
          return deferred.resolve(res);
        }
      });
      return deferred.promise;
    },
    defineRequest: function(docType, requestName, defined) {
      var deferred;
      deferred = $q.defer();
      cozysdk.defineRequest(docType, requestName, defined, function(err, res) {
        if (err != null) {
          console.log('maybe do a cozy special error warning');
          return deferred.reject('oh no an error! try again');
        } else {
          return deferred.resolve(res);
        }
      });
      return deferred.promise;
    },
    destroyRequest: function() {
      var deferred;
      deferred = $q.defer();
      cozysdk.requestDestroy('Contact', 'all', {
        startkey: 'z',
        endkey: 'z'
      }, function(err, res) {
        if (err != null) {
          console.log('maybe do a cozy special error warning');
          return deferred.reject('oh no an error! try again');
        } else {
          return deferred.resolve(res);
        }
      });
      return deferred.promise;
    },
    runRequest: function(docType, requestName) {
      var deferred;
      deferred = $q.defer();
      cozysdk.run(docType, requestName, {}, function(err, res) {
        if (err != null) {
          console.log('maybe do a cozy special error warning');
          return deferred.reject('oh no an error! try again');
        } else {
          res = JSON.parse("" + res);
          return deferred.resolve(res);
        }
      });
      return deferred.promise;
    }
  };
};

angular.module('browserapp').factory('CozySdk', CozySdk);

CozySdk.$inject = ['$rootScope', '$q'];
;var HomeAngCtrl;

HomeAngCtrl = function($injector, $scope, preGetContacts) {
  var Contact, CozySdk, destroy, res, send, update, updateContactList;
  Contact = $injector.get('Contact');
  CozySdk = $injector.get('CozySdk');
  res = preGetContacts;
  $scope.contacts = res[1];
  updateContactList = function() {
    var promise;
    promise = Contact.all();
    return promise.then(function(res) {
      return $scope.contacts = res[1];
    });
  };
  send = function(user) {
    var promise;
    promise = Contact.send('Contact', user);
    return promise.then(function(res) {
      return updateContactList();
    });
  };
  update = function(id, user) {
    var contactName, promise;
    contactName = {
      n: user.key
    };
    promise = CozySdk.update('Contact', id, contactName);
    return promise.then(function(res) {
      return updateContactList();
    });
  };
  destroy = function(id) {
    var promise;
    promise = CozySdk.destroy(id);
    return promise.then(function(res) {
      return updateContactList();
    });
  };
  $scope.send = send;
  $scope.update = update;
  return $scope.destroy = destroy;
};

angular.module('browserapp').controller('HomeAngCtrl', HomeAngCtrl);

HomeAngCtrl.$inject = ['$injector', '$scope', 'preGetContacts'];
;
//# sourceMappingURL=app.js.map