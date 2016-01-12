/**
 * This file contains all necessary Angular controller definitions for 'mksense.auth.login' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  /**
   * Login controller to handle user's login to application. Controller uses 'Auth' service to make actual HTTP
   * request to server and try to authenticate user.
   *
   * After successfully login Auth service will store user data and JWT token via 'Storage' service where those are
   * asked whenever needed in application.
   *
   * @todo
   *  1) different authentication providers
   *  2) user registration
   */
  angular.module('mksense.core.auth.login')
  .controller('LoginController', [
    '$scope', '$state','AuthService', 'FocusOnService','$stateParams','$location','$window','$localStorage','$log','MKConfig',
    function controller(
      $scope, $state,AuthService, FocusOnService,$stateParams,$location,$window,$localStorage,$log,MKConfig
    ) {

      var logger=$log.getInstance('LOGIN-CONTROLLER');
      var fromState=$state.current.data.fromState;
      var fromParams=$state.current.data.fromParams;

      logger.debug('fromParams',$state.current.data.fromParams);
      logger.debug('fromState',$state.current.data.fromState);
      $scope.isWeixin=false;

      //set credentials if auth2 return token and user
      var query=$location.search();
      if(query.token && query.user){
        $localStorage.credentials={token:query.token,user:JSON.parse(query.user)};
        $location.url(query.returnUrl);
        return;
      }


      //detect weixin then go through weixin auth process;
      var userAgent = $window.navigator.userAgent;
      if(userAgent.indexOf('MicroMessenger') !== -1){
        $scope.isWeixin=true;
        var returnUrl=$state.href('mksense.home',{});
        if(fromState)
          returnUrl=$state.href(fromState.name,fromParams); 
        returnUrl=returnUrl.replace(/^\#/,'');
        var port = $location.port();
        port=port===80?'':':'+port;
        var currentUrl= $location.protocol()+'://'+$location.host()+port+'/#'+$location.path();
        var url=MKConfig.cmsServer+$stateParams.exhibitionId+'/auth/weixin/'+encodeURIComponent(currentUrl+'?returnUrl='+encodeURIComponent(returnUrl));
        $window.location.href=url;
        return;
      }

      // Already authenticated so redirect back to books list
      if (AuthService.isAuthenticated()) {
        if(fromState){
          $state.go(fromState.name,fromParams); 
        }else{
          $state.go('mksense.home');
        }
      }

      // Scope function to perform actual login request to server
      $scope.login = function login() {
        AuthService
        .login($scope.credentials)
        .then(function successCallback() {
          if(fromState){
            $state.go(fromState.name,fromParams); 
          }else{
            $state.go('mksense.home');
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
        FocusOnService.focus('username');
        // Initialize credentials
        $scope.credentials = {
          identifier: '',
          password: ''
        };
      }

      _reset();

    }]);
}());
