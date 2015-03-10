angular.module('wallabag-restapi', ['ngResource', 'base64'])

    .factory('TokenHandler', [ '$http', '$base64', '$rootScope', function($http, $base64, $rootScope) {
        var tokenHandler = {};
        var token = 'none';

        tokenHandler.set = function( newToken ) {
            token = newToken;
        };

        tokenHandler.get = function() {
            return token;
        };

        tokenHandler.getCredentials = function ( username, password, salt) {
            // Check if token is registered in cookies
            if ( (typeof $rootScope.username !== 'undefined') && 
             (typeof $rootScope.digest !== 'undefined') && 
             (typeof $rootScope.b64nonce !== 'undefined') && 
             (typeof $rootScope.created !== 'undefined') ) {
                // Define variables from cookie cache
                var username = $rootScope.username;
                var digest = $rootScope.digest;
                var nonce = $rootScope.nonce;
                var created = $rootScope.created;
            } else {
                // Create token for backend communication
                var seed = Math.floor( Math.random() * 1000 )+'';
                // Encode seed in MD5
                var nonce = CryptoJS.MD5( seed ).toString(CryptoJS.enc.Hex).substr(0,16);
                console.log('nonce='+ nonce.length)
                // Creation time of the token
                var created = formatDate(new Date());

                // Generating digest from secret, creation and seed
                //var hash = CryptoJS.SHA1(nonce+created+password);
                var encryptedPassword = CryptoJS.SHA1(password+username+salt);
                var digest = $base64.encode(CryptoJS.SHA1($base64.decode(nonce)+created+encryptedPassword));
                //var digest = hash.toString(CryptoJS.enc.Base64);

                // Base64 Encode digest
                //var b64nonce = $base64.encode(nonce);

                // Save token in cookies
                //$rootScope.username = username;
                //$rootScope.digest = digest;
                //$rootScope.nonce = nonce;
                //$rootScope.created = created;
                //
            }

            // Return generated token
            console.log('UsernameToken Username="'+username+'", PasswordDigest="'+digest+'", Nonce="'+nonce+'", Created="'+created+'"');
            return 'UsernameToken Username="'+username+'", PasswordDigest="'+digest+'", Nonce="'+nonce+'", Created="'+created+'"';
        };

        // Token Reinitializer
        tokenHandler.clearCredentials = function () {
            // Clear token from cache
            $rootScope.username = undefined;
            $rootScope.digest= undefined;
            $rootScope.nonce = undefined;
            $rootScope.created = undefined;

            // Clear token variable
            delete $http.defaults.headers.common['X-WSSE'];
        };

        // Token wrapper for resource actions
        tokenHandler.wrapActions = function( resource, actions , login, password, salt) {
            var wrapperResource = resource;

            for ( var i=0; i < actions.length; i++ ) {
                tokenWrapper( wrapperResource, actions[i] );
            }   

            return wrapperResource;
        };

        // Token wrapper
        var tokenWrapper = function ( resource, action ) {
            resource['_'+action] = resource[action];
            resource[action] = function ( data, success, error ) {
                console.log('set header x-wsse');
                console.log($rootScope.login+', ' +$rootScope.password+', '+ $rootScope.salt)
                $http.defaults.headers.common['X-WSSE'] = tokenHandler.getCredentials($rootScope.login, $rootScope.password, $rootScope.salt);
                $http.defaults.headers.common['Authorization'] = 'profile="UsernameToken"';
                return resource['_'+action](
                    data,
                    success,
                    error
                );
            };
        };

        // Date formater to UTC
        var formatDate = function (d) {
            // Padding for date creation
            var pad = function (num) {
                return ("0" + num).slice(-2);
            };

            return [d.getUTCFullYear(), 
                pad(d.getUTCMonth() + 1), 
                pad(d.getUTCDate())].join("-") + "T" + 
               [pad(d.getUTCHours()), 
                pad(d.getUTCMinutes()), 
                pad(d.getUTCSeconds())].join(":") + "Z";
        };

        return tokenHandler;
    }])


    /*.factory('EntryService', function($resource) {
        return $resource('http://localhost:3000/api/u/:user/entries', null, {
            'getUnreads': {
                method: 'GET',
                isArray: true
            },
            'addEntry' : {
                method: 'POST',
                isArray: true
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
            },
            'login' : {
                method: 'POST',
                url: 'api/u/:user'
            }
        });
    })*/

    .factory('EntryService', ['$resource', 'TokenHandler', function($resource, tokenHandler) {
        var resource = $resource('http://v2.wallabag.org/api/entries.json', null, {
            'getUnreads': {
                method: 'GET',
                isArray: true
            },
            'getSalt': {
                url: 'http://v2.wallabag.org/api/salts/:login.json',
                method: 'GET',
                isArray: true
            }
        });
        resource = tokenHandler.wrapActions(resource, ['getUnreads']);
        return resource;
    }])


    


;
