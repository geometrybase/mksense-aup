/**
 * Messages component which is divided to following logical components:
 *
 *  Controllers
 *
 * All of these are wrapped to 'mksense.auth.login' angular module.
 */
(function() {
  'use strict';

  // Define mksense.auth.login angular module
  angular.module('mksense.core.auth.login', []);

  // Module configuration
  angular.module('mksense.core.auth.login')
  .config([
    '$stateProvider',
    function config($stateProvider) {
      $stateProvider
      // Login
      .state('auth.login', {
        url: '/:exhibitionId/login',
        data: {
          access: 0
        },
        views: {
          'mobile@': {
            templateUrl: '/core/auth/login/login.html',
            controller: 'LoginController'
          }
        }
      });
    }
  ]);
}());
