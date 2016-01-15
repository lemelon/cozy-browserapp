HomeAngCtrl = ($scope) ->
    vm = this

    add = (user) ->
        console.log 'create contact'
        Contact = cozydb.getModel('Contact',
            fn: String
            n: String
            org: String
            title: String
            department: String
            bday: String
            nickname: String
            url: String
            note: String)
        Contact.create user, (err, res) ->
            if err
                alert err
            else
                data = JSON.parse res
                console.log data
                console.log data._id
                Contact.find data._id, (err, res) ->
                    console.log 'Contact.find'
                    console.log res
                    $scope.$apply ->
                        vm.contacts = res
            console.log 'END CONTACT'
        return

    vm.add = add
    return

angular.module('browserapp').controller 'HomeAngCtrl', HomeAngCtrl
HomeAngCtrl.$inject = [
    '$scope'
]