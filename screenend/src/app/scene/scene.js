(function() {
  'use strict';
  angular.module('mksense.scene', [])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('scene',{
        parent:'exhibition',
        url:'/:sceneId',
        views:{
          'scene@exhibition':{
            templateUrl:'/scene/scene.html',
            controller:'SceneController'
          }
        }
      });

    }]);
}());
