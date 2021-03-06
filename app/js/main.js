

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
    'ngSanitize',
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
            $location.path(route).replace();
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
                        loginRequired: loginRequired,
                        unreadURLs: ['$route', '$rootScope', 'EntryService', function ($route, $rootScope, EntryService) {
                            return EntryService.getUnreads().$promise;
                        }]
                    }
                })

            .when('/favorites', {
                    templateUrl: 'partials/favorites.html',
                    controller: 'FavoritesController',
                    controllerAs: 'ctrl',
                    resolve: {
                        loginRequired: loginRequired,
                        favoritesURLs: ['$route', '$rootScope', 'EntryService', function ($route, $rootScope, EntryService) {
                            return EntryService.getUnreads({
                                'user': $rootScope.username
                            }).$promise;
                        }]

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
                    redirectIfAuthenticated: redirectIfAuthenticated('/unread')
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
    .controller('entryController', function ($rootScope, EntryService, $scope, $timeout, $mdBottomSheet) {
        var ctrl = {
            username: $rootScope.username,
            url: '',
            title: ''
        };
        
        $scope.showGridBottomSheet = function($event, articleId) {
            $scope.alert = '';
            $mdBottomSheet.show({
                templateUrl: 'partials/bottom-grid.html',
                controller: 'GridBottomSheetCtrl',
                targetEvent: $event
            }).then(function(clickedItem) {
                $scope.alert = articleId +' '+clickedItem.name + ' clicked!';
            });
        };
        
        ctrl.favoriteEntry = function () {

        };
        return ctrl;
    })

.controller('GridBottomSheetCtrl', function($scope, $mdBottomSheet) {
  $scope.items = [
    { name: 'Readed', icon: 'read' },
    { name: 'Favorite', icon: 'favorite' },
    { name: 'Delete', icon: 'delete' },
    { name: 'Original', icon: 'link' },
  ];
  $scope.listItemClick = function($index) {
    var clickedItem = $scope.items[$index];
    $mdBottomSheet.hide(clickedItem);
  };
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