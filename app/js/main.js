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
    // Rest api provider
    'wallabag-restapi'
]);


var WallabagIndexApp = angular.module('WallabagIndexApp', ['WallabagIndexDep']);

WallabagIndexApp
  .config(['$routeProvider',
        function ($routeProvider){
            $routeProvider
                .when('/:user/unread', {
                    templateUrl: 'partials/unread.html',
                    controller: 'UnreadController',
                    controllerAs: 'ctrl',
                    resolve: {
                        unreadURLs: ['$route', 'EntryService', function ($route, EntryService) {
                           var params = $route.current.params;
                            console.log('params.user='+ params.user);
                            return EntryService.unread({'user':params.user}).$promise;
                        }]
                    }
                })

                .otherwise({
                    templateUrl: 'partials/login.html',
                });
        }
    ])
    .controller('UnreadController', function( $scope, unreadURLs ) {
        var ctrl = {
            unreadUrlList: unreadURLs
        };
        return ctrl;


    });