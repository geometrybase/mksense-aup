(function(){
  'use strict';
  angular.module('mksense.visuals')
  .directive('mksenseComment', [
    '$log','$window','$state',
    function($log,$window,$state,$element){
      return {
      transclude:false,
      restrict:'EA',
     // templateUrl:'/visuals/swiper2d/comment.html',
      link:function(scope,element,attrs){ 
 
      var logger=$log.getInstance('COMMENT-DIRECTIVE');
      scope.state=$state.current;
      logger.debug(scope.state);
  
      scope.ShowComment=false;
      scope.commentPoint=function(event){
        scope.label='说点儿什么吧！';
        scope.pressPos=[event.offsetX/window.innerWidth,event.offsetY/window.innerHeight];
        scope.ShowComment=true;
        scope.$emit('mobileComment',{type:'array',data:scope.pressPos}); 
        scope.pressPosData=[event.offsetX,event.offsetY];
      };

      scope.comment=function(event){
         scope.$emit('mobileComment',{text:this.text, position:scope.pressPos}); 
         $state.go('^').then(function(){$state.go('^')});
         scope.text=this.text; 
        
       };
        }


    };
    }]);
}());

