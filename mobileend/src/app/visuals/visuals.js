(function() {
  'use strict';

  angular.module('mksense.visuals', [
    'mksense.visuals.swiper1d',
    'mksense.visuals.swiper2d',
    'mksense.visuals.fisheye',
    'mksense.visuals.three',
    'mksense.visuals.grid',
    'mksense.visuals.qrcode',
    'mksense.visuals.apple'
  ]).config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('visuals',{
        abstract:true,
        url:'/visuals'
      });

      $urlRouterProvider.when('/visuals', '/visuals/qrcode');

    }]);

}());
