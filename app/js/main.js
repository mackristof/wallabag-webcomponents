/*var toastGroupTemplate = document.querySelector('#toastGroup');
toastGroupTemplate.showToast = function() {
  document.querySelector('#toast').show();
};*/

document.addEventListener('polymer-ready', function () {
    var navicon = document.getElementById('navicon');
    var drawerPanel = document.getElementById('drawerPanel');
    navicon.addEventListener('click', function () {
        drawerPanel.togglePanel();
    });
});

angular.module('WallabagIndexDep', [
    // Angular official modules.
    'ngResource',
    'ngRoute',
    'ngMaterial',
    // Rest api provider
    'wallabag-restapi'

]);


var WallabagIndexApp = angular.module('WallabagIndexApp', ['WallabagIndexDep']);


var loginRequired = function ($location, $q, $rootScope) {
    var deferred = $q.defer();

    if (!userIsAuthenticated($rootScope)) {
        deferred.reject();
        $location.path('/login').replace();
    } else {
        deferred.resolve();
    }

    return deferred.promise;
};

var redirectIfAuthenticated = function (route) {
    return function ($location, $q, $rootScope) {

        var deferred = $q.defer();

        if (userIsAuthenticated($rootScope)) {
            deferred.reject();
            $location.path("/" + route).replace();
        } else {
            deferred.resolve();
        }

        return deferred.promise;
    }
};
var userIsAuthenticated = function ($rootScope) {
    console.log('userIsAuthen=' + $rootScope.login);
    if ($rootScope.login) {
        console.log('userIsAuthen=' + true);
        return true;
    } else {
        console.log('userIsAuthen=' + false);
        return false
    }

};

WallabagIndexApp
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/unread', {
                    templateUrl: 'partials/unread.html',
                    controller: 'UnreadController',
                    controllerAs: 'ctrl',
                    resolve: {
                        unreadURLs: ['$route', '$rootScope', 'EntryService', function ($route, $rootScope, EntryService) {
                            return EntryService.getUnreads().$promise;
                        }],
                        loginRequired: loginRequired
                    }
                })

            .when('/favorites', {
                    templateUrl: 'partials/favorites.html',
                    controller: 'FavoritesController',
                    controllerAs: 'ctrl',
                    resolve: {
                        favoritesURLs: ['$route', '$rootScope', 'EntryService', function ($route, $rootScope, EntryService) {
                            return EntryService.getUnreads({
                                'user': $rootScope.username
                            }).$promise;
                        }],
                        loginRequired: loginRequired
                    }
                })
                .when('/addEntry', {
                    templateUrl: 'partials/addEntry.html',
                    controller: 'AddEntryController',
                    controllerAs: 'ctrl',
                    resolve: {
                        loginRequired: loginRequired
                    }
                })


            .otherwise({
                templateUrl: 'partials/login.html',
                controller: 'LoginController',
                controllerAs: 'ctrl',
                resolve: {
                    redirectIfAuthenticated: redirectIfAuthenticated('/')
                }
            });
        }
    ])
    .controller('UnreadController', function ($rootScope, unreadURLs) {
        var ctrl = {
            unreadUrlList: unreadURLs,
            username: $rootScope.username
        };


        return ctrl;
    })

.controller('FavoritesController', function ($rootScope, favoritesURLs) {
    var ctrl = {
        unreadUrlList: favoritesURLs,
        username: $rootScope.username
    };


    return ctrl;
})


.controller('LoginController', function ($rootScope, $location, EntryService) {
        var ctrl = {
            username: 'wallabag',
            password: 'wallabag'
        };

        ctrl.login = function () {
            if (ctrl.username && ctrl.password) {

                $rootScope.login = ctrl.username;
                $rootScope.password = ctrl.password;
                EntryService.getSalt({
                    login: ctrl.username
                }, function (response) {
                    $rootScope.salt = response;
                    $location.path("/unread");
                });

            } else {
                console.log('enter login');
            }
        };
        return ctrl;
    })
    .controller('AddEntryController', function ($rootScope, EntryService, $location) {
        var ctrl = {
            username: $rootScope.username,
            url: '',
            title: ''
        };

        ctrl.add = function () {
            EntryService.addEntry({
                    'user': $rootScope.username
                }, {
                    'url': ctrl.url,
                    'title': ctrl.title
                },
                function (response) { //success
                    console.log('url added:' + ctrl.url);
                    $location.path('/unread');

                });
        };
        return ctrl;
    })
    .controller('entryController', function ($rootScope, EntryService) {
        var ctrl = {
            username: $rootScope.username,
            url: '',
            title: ''
        };

        ctrl.favoriteEntry = function () {
            //EntryService.addEntry({'user':$rootScope.username },{'url': ctrl.url, 'title': ctrl.title},
            //    function(response){//success
            //        console.log('url added:'+ctrl.url);
            //    });
        };
        return ctrl;
    })


.controller('ControlController', function ($rootScope, $scope, $location) {

    $scope.addEntry = function () {
        console.log('click addEntry' + $rootScope.username);
        $location.path("/addEntry")

    };
    $scope.searchEntries = function () {
        console.log('click searchEntries' + $rootScope.username);

    };
});;