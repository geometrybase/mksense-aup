(function() {
  'use strict';

  angular.module('mksense.home', [])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('mksense.home',{
        url:'/',
        views:{
          'mobile@':{
            templateUrl:'/home/home.html'
          }
        },
        data:{
          access:0 
        }
      });

    }]);

}());
