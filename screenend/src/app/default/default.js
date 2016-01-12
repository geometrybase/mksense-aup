(function() {
  'use strict';

  angular.module('mksense.default', [
    'mksense.default.search',
  ]).config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('default',{
        abstract:true,
        url:'/default'
      });

      $urlRouterProvider.when('/default', '/default/search');

    }]);

}());
