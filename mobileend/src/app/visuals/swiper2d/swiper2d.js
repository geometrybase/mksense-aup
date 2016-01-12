(function() {
  'use strict';

  angular.module('mksense.visuals.swiper2d',[])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('scene.swiper2d',{
        url:'/swiper2d',
        data: {
          access: 1
        },
        views:{
          'visual@scene':{
            templateUrl:'/visuals/swiper2d/swiper2d.html',
            controller:'Swiper2dController'
          },
          'content@scene.swiper2d':{
            templateUrl:'/visuals/swiper2d/content.html'
          },
          'footer@scene.swiper2d':{
            templateUrl:'/visuals/swiper2d/footer.html'
          }
        }
      })
      .state('scene.swiper2d.moreinfo',{
        url:'/moreinfo',
        views:{
          'content@scene.swiper2d':{
            templateUrl:'/visuals/swiper2d/moreinfo.html'
          }
        }
      })
      .state('scene.swiper2d.comment',{
        url:'/comment',
        views:{
          'content@scene.swiper2d':{
            templateUrl:'/visuals/swiper2d/comment.html'
          },
         'footer@scene.swiper2d':{
          }
        }
      })
      .state('scene.swiper2d.comment.commentinput',{
        url:'/comment/commentinput',
        views:{
          'content@scene.swiper2d':{
            templateUrl:'/visuals/swiper2d/commentinput.html'
          },
          'footer@scene.swiper2d':{
          }
        }
      });    
    }]);

}());

