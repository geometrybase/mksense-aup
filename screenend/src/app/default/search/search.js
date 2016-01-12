(function() {
  'use strict';

  angular.module('mksense.default.search', [])
  .config([
    '$stateProvider',
    function (
      $stateProvider
    ){

      $stateProvider.state('default.search',{
        url:'/search',
        views:{
          'receiver@':{
            templateUrl:'/default/search/search.html',
            controller:'SearchController'
          }
        }
      });

    }]);

}());
