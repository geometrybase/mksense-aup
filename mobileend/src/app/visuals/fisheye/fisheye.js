(function() {
  'use strict';

  angular.module('mksense.visuals.fisheye', [])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('scene.fisheye',{
        url:'/fisheye',
        views:{
          'visual@scene':{
            templateUrl:'/visuals/fisheye/fisheye.html',
            //controller:'FisheyeController'
          }
        }
      });

    }]);

}());
