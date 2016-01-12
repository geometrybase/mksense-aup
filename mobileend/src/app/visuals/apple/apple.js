(function() {
  'use strict';

  angular.module('mksense.visuals.apple', [])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('visuals.apple',{
        url:'/apple/:screenNumber',
        views:{
          'mobile@':{
            templateUrl:'/visuals/apple/apple.html',
            controller:'AppleController'
          }
        }
      });

      $stateProvider.state('visuals.apple.done',{
        url:'/done',
        views:{
          'mobile@':{
            templateUrl:'/visuals/apple/apple-done.html',
            controller:'DoneController'
          }
        }
      });

    }]);

}());
