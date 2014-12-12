angular.module('wallabag-restapi', ['ngResource'])


    .factory('EntryService', function($resource) {
        return $resource('api/u/:user/entries', null, {
            'getUnreads': {
                method: 'GET',
                isArray: true
            },
            'addEntry' : {
                method: 'POST',
            },
            'updateEntry' : {
                method: 'POST',
                url:    'api/u/:user/entry/:id'
            },
            'getEntry' : {
                method: 'GET',
                url:    'api/u/:user/entry/:id'
            },
            'deleteEntry' : {
                method: 'DELETE',
                url: 'api/u/:user'
            }
        });
    })
;
