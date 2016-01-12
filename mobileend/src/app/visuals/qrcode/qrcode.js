(function() {
  'use strict';

  angular.module('mksense.visuals.qrcode', [])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function (
      $stateProvider,
      $urlRouterProvider
    ){

      $stateProvider.state('visuals.qrcode',{
        url:'/qrcode/:screenNumber',
        views:{
          'mobile@':{
            templateUrl:'/visuals/qrcode/qrcode.html',
            controller:'QrcodeController'
          }
        }
      });

    }]);

}());
