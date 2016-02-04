(function(){
  'use strict';
  angular.module('mksense.artobject')
  .directive('artobjectMoreinfo', [
    '$log',
    function($log){
      return {
        transclude:true,
        restrict:'EA',
        templateUrl:'/visuals/grid/grid.html',
        link:function(scope,element){
          var logger=$log.getInstance('artobject-moreinfo');
        }
      };
    }]);
}());
