angular.module('bucketList.services', [])
.service('SharedService', function ($ionicLoading, $firebase, $window) {
    var scope = this;

    scope.uid = null;

    scope.baseUrl = 'https://intense-heat-7885.firebaseio.com/';
    scope.authRef = new Firebase(scope.baseUrl);

    scope.show = function (text) {
        scope.loading = $ionicLoading.show({
            template: text ? text : "Loading...",
        });
    };

    scope.hide = function () {
        $ionicLoading.hide();
    };

    scope.notify = function (text) {
        scope.show(text);
        $window.setTimeout(function () {
            scope.hide();
        }, 2000);
    };

    scope.logout = function () {
        scope.authRef.unauth();
        scope.checkSession();
    };

    scope.checkSession = function () {
        var authData = scope.authRef.getAuth();
        if (authData) {
            scope.notify("User " + authData.uid + " is logged in with " + authData.provider);
            scope.uid = authData.uid;
            $window.location.href = '#/bucket/list';
        } else {
            scope.notify("User is logged out");
            $window.location.href = '#/auth/signin';
        }
    };

});