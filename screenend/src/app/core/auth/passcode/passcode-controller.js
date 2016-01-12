/**
 * This file contains all necessary Angular controller definitions for 'mksense.auth.passcode' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  /**
   * Passcode controller to handle user's passcode to application. Controller uses 'Auth' service to make actual HTTP
   * request to server and try to authenticate user.
   *
   * After successfully passcode Auth service will store user data and JWT token via 'Storage' service where those are
   * asked whenever needed in application.
   *
   * @todo
   *  1) different authentication providers
   *  2) user registration
   */
  angular.module('mksense.core.auth.passcode')
  .controller('PasscodeController', [
    '$scope', '$state','AuthService','$stateParams','$location','$window','$localStorage','$log',
    function controller(
      $scope, $state,AuthService, $stateParams,$location,$window,$localStorage,$log
    ) {

      var logger=$log.getInstance('PASSCODE-CONTROLLER');
      var fromState=$state.current.data.fromState;
      var fromParams=$state.current.data.fromParams;

      $scope.credentials={
        identifier:$stateParams.exhibitionId 
      };

      if (AuthService.isAuthenticated()) {
        if(fromState){
          $state.go(fromState.name,fromParams); 
        }else{
          $state.go('exhibition',$state.current.params);
        }
      }

      // Scope function to perform actual passcode request to server
      $scope.auth = function auth() {
        console.log($scope.credentials);
        AuthService
        .auth($scope.credentials)
        .then(function successCallback() {
          if(fromState){
            $state.go(fromState.name,fromParams); 
          }else{
            $state.go('exhibition',$state.current.params);
          }
        },function errorCallback() {
          _reset();
        });
      };

      /**
       * Private helper function to reset credentials and set focus to username input.
       *
       * @private
       */
      function _reset() {
        $scope.credentials={
          identifier:$stateParams.exhibitionId 
        };
      }

      _reset();

    }]);
}());
