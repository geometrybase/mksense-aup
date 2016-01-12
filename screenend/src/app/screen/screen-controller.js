(function() {
  'use strict';
  angular.module('mksense.screen')
  .controller('ScreenController', [
    '$scope', '$state','$stateParams','$log','$http','mkConfig','$rootScope',
    function controller(
      $scope, $state,$stateParams,$log,$http,mkConfig,$rootScope
    ){
      var logger=$log.getInstance('ScreenController');
      var exhibitionId=$stateParams.exhibitionId;
      var sceneId=$stateParams.sceneId;
      var screenIndex=$stateParams.screenIndex;

      logger.debug('initial screen',exhibitionId,sceneId,screenIndex);

      if($rootScope.socketRooms.scene)
        joinScreen($rootScope.socketRooms.scene+'_'+screenIndex);

      $scope.$on('joinScene',function(event,sceneRoom){
        if(!$rootScope.socketRooms.screen)
          joinScreen(sceneRoom+'_'+screenIndex);
      });

      $rootScope.socket.on('joinScreen',joinScreenCallback);
      $rootScope.socket.on('joinScreenError',joinScreenErrorCallback);

      function joinScreen(room){
        logger.debug('start join screen ',room)
        $rootScope.socketRooms.screen=room; 
        $rootScope.socket.emit('joinScreen',room); 
      }

      function joinScreenCallback(room){
        logger.debug('join screen room',room);
        $scope.$broadcast('joinScreen',room);
      }

      function joinScreenErrorCallback(error){
        $rootScope.socketRooms.screen=null; 
        logger.error('join screen room error',error);
      }

      $scope.$on('$destroy',function(event){
        logger.debug('leave screen room',$rootScope.socketRooms.screen);
        $rootScope.socket.removeListener('joinScreen',joinScreenCallback);
        $rootScope.socket.removeListener('joinScreenError',joinScreenErrorCallback);
        $rootScope.socket.emit('leaveRoom',$rootScope.socketRooms.screen);
        logger.debug('destroy screen',screenIndex); 
      });

    }]);

}());
