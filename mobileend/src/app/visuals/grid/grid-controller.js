(function(){
  'use strict';


  angular.module('mksense.visuals.grid')
  .controller('GridController', [
    '$scope','$log', '$state',
    function(
      $scope,$log,$state 
    ){

      var logger=$log.getInstance('GRID CONTROLLER');

      $scope.$on('mobileInResponse',function(event,res){
        $scope.artObject=res.payload;
        logger.debug('mobileInResponse',res);
        $scope.$apply();
      });

      $scope.$on('mobileActionResponse',function(event,res){
        $scope.artObject=res.payload;
        logger.debug('mobileActionResponse',res);
        $scope.$apply();
      });

      $scope.next=function(vec){
        logger.debug('mobile action');
        $scope.$emit('action',{type:'swipe',data:vec});
      }

      $scope.text="";

      $scope.swipe=function(action){
        logger.info(action);
      }

      $scope.label='说点儿什么吧！';

      $scope.comment=function(){
        $scope.$emit('action',{type:'click',data:this.text}); 
        $state.go('scene.grid');//.//then(function(){$state.go('^')});
        $scope.text=this.text;
      };

      $scope.clear=function(){
       $scope.text='';
      };

       $scope.slide = function() {
        $scope.boolChangeClass = !$scope.boolChangeClass;
      };

      $scope.pressPos=[-100,-100];

      $scope.commentPoint=function(event){
        $scope.pressPos=[event.center.x,event.center.y];
      };

      $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){   
        if(fromState.name==='scene.grid.moreinfo'){
          $scope.$emit('action',{type:'status',data:'hidemoreinfo'});
        }
        if(fromState.name==='scene.grid.comment'){
          $scope.pressPos=[-100,-100];
        }
      });

    }]);
}());
