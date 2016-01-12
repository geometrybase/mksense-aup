(function() {
  'use strict';

  angular.module('mksense.core.auth.passcode', []);

  angular.module('mksense.core.auth.passcode')
  .config([
    '$stateProvider',
    function config($stateProvider) {
      $stateProvider
      // Passcode
      .state('exhibition.passcode', {
        parent:'exhibition',
        url: '/passcode',
        data: {
          access: 0
        },
        views: {
          'exhibition@': {
            templateUrl: '/core/auth/passcode/passcode.html',
            controller: 'PasscodeController'
          }
        }
      });
    }
  ]);
}());
