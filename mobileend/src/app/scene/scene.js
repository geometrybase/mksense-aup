(function() {
  'use strict';

  angular.module('mksense.scene', [
  ]).config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('scene',{
        parent:'mksense',
        url:'/:addressId/:exhibitionId/:sceneId/:screenIndex',
        data: {
          access: 1
        },
        views:{
          'mobile@':{
            templateUrl:'/scene/scene.html',
            controller:'SceneController'
          }
        }
      });

    }]);

}());
