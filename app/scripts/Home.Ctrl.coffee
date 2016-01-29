HomeAngCtrl = ($scope) ->
    vm = this

    add = (user) ->
        console.log 'create contact'
        cozysdk.create 'Contact', user, (err, res) ->
            if err
                alert err
            vm.contacts = res
        return

    find = (id) ->
        cozydb.find id, (err, res) ->
            if err
                alert err
            $scope.$apply ->
                console.log res
                vm.contacts = res
        return

    exist = (id) ->
        cozydb.exists id, (err, res) ->
            if err
                alert err
            $scope.$apply ->
                console.log res
                vm.contacts = res
        return

    update = (id, user) ->
        cozysdk.updateAttributes 'Contact', id, user, (err, res) ->
            if err
                alert err
            $scope.$apply ->
                vm.contacts = res
        return

    destroy = (id) ->
        cozysdk.destroy id, (err, res) ->
            if err
                alert err
            $scope.$apply ->
                vm.contacts = res
        return

    define = () ->
        cozysdk.defineRequest 'Contact', 'all', 'function(doc) { emit(doc.n, null); }', (err, res) ->
            if err
                alert err
            cozydb.run 'Contact', 'all', {}, (err, res) ->
                $scope.$apply ->
                    vm.contacts = res
        return

    destroyRequest = () ->
        cozysdk.requestDestroy 'Contact', 'all', {startkey: 'z', endkey: 'z'}, (err, res) ->
            if err
                alert err
            cozydb.run 'Contact', 'all', {}, (err, res) ->
                $scope.$apply ->
                    vm.contacts = res
        return

    vm.add = add
    vm.find = find
    vm.exist = exist
    vm.update = update
    vm.destroy = destroy
    vm.define = define
    vm.destroyRequest = destroyRequest
    return    

angular.module('browserapp').controller 'HomeAngCtrl', HomeAngCtrl
HomeAngCtrl.$inject = [
    '$scope'
]