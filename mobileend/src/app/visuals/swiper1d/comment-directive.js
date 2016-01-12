(function(){
  'use strict';
  angular.module('mksense.visuals.swiper1d')
  .directive('mksenseComment', [
    '$log','$window','$state',
    function($log,$window,$state,$element){
      return {
      transclude:false,
      restrict:'EA',
      templateUrl:'/visuals/swiper1d/comment-directive.html',
      link:function(scope,element,attrs){ 
 
      var logger=$log.getInstance('COMMENT-DIRECTIVE');
      scope.state=$state.current;
      logger.debug(scope.state);
  
      scope.ShowComment=false;
      scope.commentPoint=function(event){
        scope.label='说点儿什么吧！';
        scope.pressPos=[event.pageX,event.pageY];
        scope.$emit('notification',scope.pressPos); 
        scope.ShowComment=true;
       //scope.$emit('mobileComment',{type:'array',data:scope.pressPos}); 
        scope.pressPosData=[event.offsetX,event.offsetY];
      }; 
     }

    };
    }]);
}());

