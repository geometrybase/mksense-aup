(function() {
  'use strict';

  angular.module('mksense.visuals.grid', ['angular-gestures'])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    'hammerDefaultOptsProvider',
    function (
      $stateProvider,
      $urlRouterProvider,
      hammerDefaultOptsProvider
    ){

      hammerDefaultOptsProvider.set({
        recognizers: [[Hammer.Tap, {time: 250}]]
      });
      
      $stateProvider.state('scene.grid',{
        url:'/grid',
        data: {
          access: 1
        },
        views:{
          'visual@scene':{
            templateUrl:'/visuals/grid/grid.html',
            controller:'GridController'
          },
          'content@scene.grid':{
            templateUrl:'/visuals/grid/content.html'
          },
          'footer@scene.grid':{
            templateUrl:'/visuals/grid/footer.html'
          }
        }
      })
      .state('scene.grid.moreinfo',{
        url:'/moreinfo',
        views:{
          'content@scene.grid':{
            templateUrl:'/visuals/grid/moreinfo.html'
          }
        }
      }
      )
      .state('scene.grid.comment',{
        url:'/comment',
        views:{
          'content@scene.grid':{
            templateUrl:'/visuals/grid/comment.html'
          },
         'footer@scene.grid':{
          }
        }
      })
      .state('scene.grid.comment.commentinput',{
        url:'/comment/commentinput',
        views:{
          'content@scene.grid':{
            templateUrl:'/visuals/grid/commentinput.html'
          },
          'footer@scene.grid':{
          }
        }
      });    
    }]);
}());

