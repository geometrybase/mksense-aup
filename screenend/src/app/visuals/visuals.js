(function() {
  'use strict';

  angular.module('mksense.visuals', []).config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('visuals',{
        abstract:true,
        url:'/visuals'
      });

      $urlRouterProvider.when('/visuals', '/visuals/three');

    }]);

}());
