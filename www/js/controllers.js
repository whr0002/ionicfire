angular.module('bucketList.controllers', [])
.controller('SignUpCtrl', function ($scope, $window, SharedService) {
    $scope.user = {
        email: "",
        password: ""
    };

    $scope.createUser = function () {
        if (!$scope.user.email || !$scope.user.password) {
            SharedService.notify("Please enter valid credentials");
            return false;
        }

        SharedService.show('Please wait.. Registering');
        SharedService.authRef.createUser($scope.user, function (error, userData) {
            SharedService.hide();
            if (error) {
                SharedService.notify("Error creating user: " + error);
            } else {
                SharedService.notify("Successfully created user account with uid:" + userData.uid);
            }
        });
    };
})
.controller('SignInCtrl', function ($scope, $window, SharedService) {
    SharedService.checkSession();
    $scope.user = {
        email: "",
        password: ""
    };

    $scope.validateUser = function () {
        SharedService.show("Please wait.. Authenticating");
        SharedService.authRef.authWithPassword($scope.user, function (error, authData) {
            SharedService.hide();
            if (error) {
                SharedService.notify("Login Failed: " + error);
            } else {
                SharedService.notify("Authenticated successfully with payload:" + authData.uid);
                SharedService.uid = authData.uid;
                $window.location.href = ('#/bucket/list');
            }
        });
    };
})
.controller('myListCtrl', function ($scope, $firebaseArray, $window, $ionicModal, SharedService) {
    SharedService.show("Please wait... Processing");
    $scope.list = [];
    var ref = new Firebase(SharedService.baseUrl + SharedService.uid);
    console.log(SharedService.uid);
    ref.on('value', function (snapshot) {
        var data = snapshot.val();

        $scope.list = [];

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (data[key].isCompleted == false) {
                    data[key].key = key;
                    $scope.list.push(data[key]);
                }
            }
        }

        if ($scope.list.length == 0) {
            $scope.noData = true;
        } else {
            $scope.noData = false;
        }

        SharedService.hide();
    });


    $ionicModal.fromTemplateUrl('templates/newItem.html', function (modal) {
        $scope.newTemplate = modal;
    });

    $scope.newTask = function () {
        $scope.newTemplate.show();
    };

    $scope.markCompleted = function (key) {
        SharedService.show("Please wait... Updating List");
        var itemRef = new Firebase(SharedService.baseUrl + SharedService.uid + '/' + key);
        itemRef.update({
            isCompleted: true
        }, function (error) {
            SharedService.hide();
            if (error) {
                SharedService.notify('Oops! something went wrong. Try again later');
            } else {
                SharedService.notify('Successfully updated');
            }
        });
    };

    $scope.deleteItem = function (key) {
        SharedService.show("Please wait... Deleting from List");
        ref.child(key).remove(function (error) {
            if (error) {
                SharedService.notify('Oops! something went wrong. Try again later');
            } else {
                SharedService.notify('Successfully deleted');
            }
        });
    };
})
.controller('newCtrl', function ($scope, $window, $firebaseArray, SharedService) {
    $scope.data = { item: "" };

    $scope.close = function () {
        $scope.modal.hide();
    };

    $scope.createNew = function () {
        var item = this.data.item;

        if (!item) return;

        $scope.modal.hide();
        SharedService.show("Please wait... Creating new");

        var form = {
            item: item,
            isCompleted: false,
            created: Date.now(),
            updated: Date.now()
        };

        var bucketListRef = new Firebase(SharedService.baseUrl + SharedService.uid);
        var list = $firebaseArray(bucketListRef);
        list.$add(form);
        SharedService.hide();
    };
})
.controller('completedCtrl', function($scope, $window, SharedService) {
    SharedService.show("Please wait... Processing");
    $scope.list = [];

    var bucketListRef = new Firebase(SharedService.baseUrl + SharedService.uid);
    bucketListRef.on('value', function(snapshot) {
        $scope.list = [];
        var data = snapshot.val();

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (data[key].isCompleted == true) {
                    data[key].key = key;
                    $scope.list.push(data[key]);
                }
            }
        }
        if ($scope.list.length == 0) {
            $scope.noData = true;
        } else {
            $scope.noData = false;
        }

        SharedService.hide();
    });
    $scope.deleteItem = function (key) {
        SharedService.show("Please wait... Deleting from List");
        var itemRef = new Firebase(SharedService.baseUrl + SharedService.uid);
        bucketListRef.child(key).remove(function (error) {
            if (error) {
                SharedService.hide();
                SharedService.notify('Oops! something went wrong. Try again later');
            } else {
                SharedService.hide();
                SharedService.notify('Successfully deleted');
            }
        });
    };
});