/**
 * Angular module for frontend.core.auth component. This component is divided to following logical components:
 *
 *  frontend.core.auth.login
 *  frontend.core.auth.services
 */
(function() {
  'use strict';

  // Define frontend.auth module
  angular.module('mksense.core.auth', [
    'mksense.core.auth.passcode',
    'mksense.core.auth.services'
  ]);

  // Module configuration
  angular.module('mksense.core.auth')
  .config([
    '$stateProvider',
    function config($stateProvider) {
      $stateProvider
      .state('auth', {
        abstract: true,
        parent: 'mksense',
        data: {
          access: 1
        }
      });
    }
  ]);
}());
