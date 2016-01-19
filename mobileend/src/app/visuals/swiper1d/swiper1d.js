
(function() {
  'use strict';

  angular.module('mksense.visuals.swiper1d',[])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('scene.swiper1d',{
        url:'/swiper1d',
        data: {
          access: 1
        },
        views:{
          'visual@scene':{
            templateUrl:'/visuals/swiper1d/swiper1d.html',
            controller:'Swiper1dController'
          },
          'content@scene.swiper1d':{
            templateUrl:'/visuals/swiper1d/content.html'
          },
          'cover@scene.swiper1d':{
            templateUrl:'/visuals/swiper1d/cover.html',
            controller:'Swiper1dController'
          },
          'footer@scene.swiper1d':{
            templateUrl:'/visuals/swiper1d/footer.html'
          }
        }
      })
      .state('scene.swiper1d.moreinfo',{
        url:'/moreinfo',
        views:{
          'content@scene.swiper1d':{
            templateUrl:'/visuals/swiper1d/moreinfo.html',
            controller:'Swiper1dController'
          },
          'footer@scene.swiper2d':{
          }
        }
      })
      .state('scene.swiper1d.me',{
        url:'/me',
        views:{
          'content@scene.swiper1d':{
            templateUrl:'/visuals/swiper1d/me.html',
            controller:'Swiper1dController'
          },
          'footer@scene.swiper1d':{
          }

        }
      })
      .state('scene.swiper1d.comment',{
        url:'/comment',
        views:{
          'content@scene.swiper1d':{
            templateUrl:'/visuals/swiper1d/comment.html'
          },
         'footer@scene.swiper1d':{
          }
        }
      })
      .state('scene.swiper1d.comment.commentinput',{
        url:'/comment/commentinput',
        views:{
          'content@scene.swiper1d':{
            templateUrl:'/visuals/swiper1d/commentinput.html'
          },
          'footer@scene.swiper1d':{
          }
        }
      });    
    }]);

}());

