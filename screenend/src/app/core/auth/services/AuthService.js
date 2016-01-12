(function() {
  'use strict';

  angular.module('mksense.core.auth.services')
    .factory('AuthService', [
      '$http', '$state', '$localStorage','mkConfig',
      function factory(
        $http, $state, $localStorage,mkConfig
      ) {
        return {
          /**
           * Method to authorize current user with given access level in application.
           *
           * @param   {Number}    accessLevel Access level to check
           *
           * @returns {Boolean}
           */
          authorize: function authorize(accessLevel) {
            if(accessLevel<1)
              return true
            else
              return this.isAuthenticated();
          },

          /**
           * Method to check if current user is authenticated or not. This will just
           * simply call 'Storage' service 'get' method and returns it results.
           *
           * @returns {Boolean}
           */
          isAuthenticated: function isAuthenticated() {
            return Boolean($localStorage.credentials);
          },

          /**
           * Method make login request to backend server. Successfully response from
           * server contains user data and JWT token as in JSON object. After successful
           * authentication method will store user data and JWT token to local storage
           * where those can be used.
           *
           * @param   {*} credentials
           *
           * @returns {*|Promise}
           */
          auth: function login(credentials) {
            return $http
            .post(mkConfig.cmsServer + 'exhibition/auth', credentials, {withCredentials: true})
            .then(function(response) {
              if(!$localStorage.credentials)$localStorage.credentials={};
              $localStorage.credentials[credentials.identifier]= response.data;
            });
          },

          /**
           * The backend doesn't care about actual user logout, just delete the token
           * and you're good to go.
           *
           * Question still: Should we make logout process to backend side?
           */
          logout: function logout() {
            $localStorage.$reset();
            $state.go('auth.passcode');
          }

        };
      }
    ])
  ;
}());
