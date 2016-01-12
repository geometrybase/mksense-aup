(function(){
  'use strict';

  angular.module('mksense.visuals.swiper1d')
  .controller('WelcomeController', [
    '$scope','$log', '$state',
    function(
      $scope,$log,$state 
    ){

      $scope.comment=function(){
        $scope.$emit('action',{type:'click',data:this.text}); 
        $state.go('scene.swiper1d');//.//then(function(){$state.go('^')});
        $scope.text=this.text;
        logger.debug($scope.text);
      };

 

    }]);
}());
