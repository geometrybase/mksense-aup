(function() {
  'use strict';
  angular.module('mksense.screen', [])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('screen',{
        parent:'scene',
        url:'/:screenIndex',
        views:{
          'screen@scene':{
            template:'<screen><screen>',
            controller:'ScreenController'
          }
        }
      });

    }]);
}());
