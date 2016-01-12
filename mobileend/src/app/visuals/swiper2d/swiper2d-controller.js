(function(){
  'use strict';


  angular.module('mksense.visuals.swiper2d')
  .controller('Swiper2dController', [
    '$scope','$log', '$state',
    function(
      $scope,$log,$state 
    ){

      var logger=$log.getInstance('SWIPER1D CONTROLLER');

      $scope.show=true;
      $scope.toggleIcons=function(){
        $scope.show=!$scope.show; 
      }

      $scope.state=$state.current;
      logger.debug($scope.state);


      $scope.label='说点儿什么吧！';

      $scope.comment=function(){
        $scope.$emit('action',{type:'click',data:this.text}); 
        $state.go('scene.swiper2d');//.//then(function(){$state.go('^')});
        $scope.text=this.text;
      };

      $scope.clear=function(){
       $scope.text='';
      };

      $scope.pressPos=[-100,-100];

      $scope.commentPoint=function(event){
        $scope.pressPos=[event.center.x,event.center.y];
      };


      var swiper2dArtObject=$scope.$on('swiper2dArtObject',function(event,artObject){
        $scope.artObject=artObject; 
      });

      var stateChangeStart=$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){   
        logger.debug('state change to',toState.name);
        $scope.state=toState;
        if(fromState.name==='scene.swiper2d.moreinfo'){
          $scope.$emit('action',{type:'status',data:'hidemoreinfo'});
        }
        if(fromState.name==='scene.swiper2d.comment'){
          $scope.pressPos=[-100,-100];
        }
      });

      $scope.$on('$destroy',function(){
        stateChangeStart();
        swiper2dArtObject();
      });

    }]);
}());
