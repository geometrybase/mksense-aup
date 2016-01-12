(function() {
  'use strict';
  angular.module('mksense.exhibition', [])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('exhibition',{
        url:'/:exhibitionId',
        data:{
          access:1 
        },
        views:{
          'exhibition@':{
            controller: 'ExhibitionController',
            templateUrl:'/exhibition/exhibition.html'
          }
        }
      });

    }]);
}());
