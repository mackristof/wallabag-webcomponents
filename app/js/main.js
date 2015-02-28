/*var toastGroupTemplate = document.querySelector('#toastGroup');
toastGroupTemplate.showToast = function() {
  document.querySelector('#toast').show();
};*/

document.addEventListener('polymer-ready', function() {
  var navicon = document.getElementById('navicon');
  var drawerPanel = document.getElementById('drawerPanel');
  navicon.addEventListener('click', function() {
    drawerPanel.togglePanel();
  });
});

angular.module('WallabagIndexDep', [
    // Angular official modules.
    'ngResource',
    'ngRoute',
    'base64',
    // Rest api provider
    'wallabag-restapi',
    'ngMaterial'
]);


var WallabagIndexApp = angular.module('WallabagIndexApp', ['WallabagIndexDep']);


var loginRequired = function($location, $q, $rootScope) {
    var deferred = $q.defer();

    if(! userIsAuthenticated($rootScope)) {
        deferred.reject()
        $location.path('/login');
    } else {
        deferred.resolve()
    }

    return deferred.promise;
};

var redirectIfAuthenticated = function(route) {
    return function($location, $q, $rootScope) {

        var deferred = $q.defer();

        if (userIsAuthenticated($rootScope)) {
            deferred.reject()
            $location.path("/toto"+route);
        } else {
            deferred.resolve()
        }

        return deferred.promise;
    }
};
 var userIsAuthenticated = function($rootScope){
     if ($rootScope.login) {
         return true;
     } else {
         return false
     }

 };

WallabagIndexApp
  .config(['$routeProvider',
        function ($routeProvider){
            $routeProvider
                .when('/unread', {
                    templateUrl: 'partials/unread.html',
                    controller: 'UnreadController',
                    controllerAs: 'ctrl',
                    resolve: {
                        unreadURLs: ['$route','$rootScope', 'EntryService', function ($route, $rootScope, EntryService) {
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
                        favoritesURLs: ['$route','$rootScope', 'EntryService', function ($route, $rootScope, EntryService) {
                            return EntryService.getUnreads({'user':$rootScope.username}).$promise;
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
                    resolve: { redirectIfAuthenticated: redirectIfAuthenticated('/unread') }
                });
        }
    ])
    .controller('UnreadController', function( $rootScope , unreadURLs ) {
        var ctrl = {
            unreadUrlList: unreadURLs,
            username: $rootScope.username
        };


        return ctrl;
    })

    .controller('FavoritesController', function( $rootScope , favoritesURLs ) {
        var ctrl = {
            unreadUrlList: favoritesURLs,
            username: $rootScope.username
        };


        return ctrl;
    })


    .controller('LoginController', function( $rootScope , $location, EntryService) {
        var ctrl = {
            username: ''
        };

        ctrl.login = function(){
            if (ctrl.username && ctrl.password) {
                console.log('ctrl.user=' + ctrl.username);
                $rootScope.login = ctrl.username;
                console.log('rootScope.login=' + $rootScope.login);
                console.log('ctrl.user=' + ctrl.password);
                $rootScope.password = ctrl.password;
                console.log('rootScope.password=' + $rootScope.password);
                $rootScope.salt = EntryService.getSalt({login: ctrl.username});
                console.log('rootScope.salt=' + $rootScope.salt);
                $location.path("/unread");
            } else {
                console.log('enter login');
            }
        };
        return ctrl;
    })
    .controller('AddEntryController', function( $rootScope, EntryService, $location) {
        var ctrl = {
            username: $rootScope.username,
            url: '',
            title: ''
        };

        ctrl.add = function(){
            EntryService.addEntry({'user':$rootScope.username },{'url': ctrl.url, 'title': ctrl.title},
                function(response){//success
                    console.log('url added:'+ctrl.url);
                    $location.path('/unread');

            });
        };
        return ctrl;
    })
    .controller('entryController', function( $rootScope, EntryService ) {
        var ctrl = {
            username: $rootScope.username,
            url: '',
            title: ''
        };

        ctrl.favoriteEntry = function(){
            //EntryService.addEntry({'user':$rootScope.username },{'url': ctrl.url, 'title': ctrl.title},
            //    function(response){//success
            //        console.log('url added:'+ctrl.url);
            //    });
        };
        return ctrl;
    })


    .controller('ControlController', function( $rootScope , $scope, $location) {

        $scope.addEntry = function(){
            console.log('click addEntry'+$rootScope.username);
            $location.path("/addEntry")

        };
        $scope.searchEntries = function(){
            console.log('click searchEntries'+$rootScope.username);

        };
    });
;