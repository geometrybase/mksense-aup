(function() {
  'use strict';

  angular.module('mksense.visuals.three', [])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('visuals.three',{
        url:'/three/:screenNumber',
        views:{
          'mobile@':{
            templateUrl:'/visuals/three/three.html',
            controller:'ThreeController'
          },
          'content@visuals.three':{
            templateUrl:'/visuals/three/cover.html'
          }
        }
      });

      $stateProvider.state('visuals.three.navigation',{
        url:'/navigation',
        views:{
          'content@visuals.three':{
            templateUrl:'/visuals/three/navigation.html'
          },
          'footer@visuals.three':{
            templateUrl:'/visuals/three/footer.html'
          }
        }
      });

      $stateProvider.state('visuals.three.list',{
        url:'/list',
        views:{
          'content@visuals.three':{
            templateUrl:'/visuals/three/list.html'
          }
        }
      });

    }]);

}());
