HomeAngCtrl = ($injector, $scope) ->

    Contact = $injector.get('Contact');
    CozySdk = $injector.get 'CozySdk'
    vm = this

    activate = () ->
        console.log 'activate'
        Contact.all (res) ->
            $scope.contacts = res

    send = (user) ->
        console.log 'send'
        Contact.send 'Contact', user, (res) ->
            $scope.contacts = res
            activate()

    update = (id, user) ->
        CozySdk.updateAttributes 'Contact', id, user, (res) ->
            $scope.contacts = res
            activate()

    destroy = (id) ->
        CozySdk.destroy id, (res) ->
            $scope.contacts = res
            activate()

    console.log 'activate'
    activate()
    vm.send = send
    vm.update = update
    vm.destroy = destroy

angular.module('browserapp').controller 'HomeAngCtrl', HomeAngCtrl
HomeAngCtrl.$inject = [
    '$injector'
    '$scope'
]